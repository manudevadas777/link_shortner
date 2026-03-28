require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const rateLimit = require('express-rate-limit');
const { PrismaClient } = require('@prisma/client');
const { parseClickData } = require('./services/clickTracker');

const authRoutes = require('./routes/auth');
const linkRoutes = require('./routes/links');
const analyticsRoutes = require('./routes/analytics');

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 4000;

// --- Middleware ---
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json());

// Rate limiting for API
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: { error: 'Too many requests, please try again later.' },
});
app.use('/api', apiLimiter);

// --- Health Check ---
app.get('/health', (req, res) => res.json({ status: 'ok', timestamp: new Date() }));

// --- API Routes ---
app.use('/api/auth', authRoutes);
app.use('/api/links', linkRoutes);
app.use('/api/analytics', analyticsRoutes);

// --- Redirect Route (inlined to avoid router mounting issues) ---
app.get('/:shortCode', async (req, res) => {
  try {
    const { shortCode } = req.params;

    const link = await prisma.link.findUnique({ where: { shortCode } });
    if (!link) {
      return res.status(404).send(`
        <html><body style="font-family:sans-serif;text-align:center;padding:80px;background:#070b15;color:#fff;">
          <h1 style="color:#f87171">404</h1>
          <p style="color:#ffffff80">This link doesn't exist or has been removed.</p>
          <a href="${process.env.FRONTEND_URL || '/'}" style="color:#0c8dee">Go to LinkSnap →</a>
        </body></html>
      `);
    }

    // Check expiry
    if (link.expiresAt && new Date() > link.expiresAt) {
      return res.status(410).send(`
        <html><body style="font-family:sans-serif;text-align:center;padding:80px;background:#070b15;color:#fff;">
          <h1 style="color:#f59e0b">Link Expired</h1>
          <p style="color:#ffffff80">This link has expired and is no longer active.</p>
        </body></html>
      `);
    }

    // Check password
    if (link.password) {
      const providedPassword = req.query.pw || req.headers['x-link-password'];
      if (!providedPassword) {
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
        return res.redirect(`${frontendUrl}/protected/${shortCode}`);
      }
      const valid = await bcrypt.compare(providedPassword, link.password);
      if (!valid) return res.status(401).json({ error: 'Incorrect password.' });
    }

    // Log click async
    const clickData = parseClickData(req);
    prisma.click.create({ data: { linkId: link.id, ...clickData } })
      .catch(err => console.error('Click log error:', err));

    return res.redirect(302, link.originalUrl);
  } catch (err) {
    console.error('Redirect error:', err);
    return res.status(500).send('Server error');
  }
});

// --- Global Error Handler ---
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`🚀 LinkSnap API running on port ${PORT}`);
});
