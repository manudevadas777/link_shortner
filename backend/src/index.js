require('dotenv').config();
const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');

const authRoutes = require('./routes/auth');
const linkRoutes = require('./routes/links');
const analyticsRoutes = require('./routes/analytics');
const redirectRoute = require('./routes/redirect');

const app = express();
const PORT = process.env.PORT || 4000;

// --- Middleware ---
const allowedOrigins = process.env.FRONTEND_URL
  ? process.env.FRONTEND_URL.split(',').map(o => o.trim())
  : [];

app.use(cors({
  origin: (origin, callback) => {
    // Allow non-browser requests (Postman, curl, server-to-server)
    if (!origin) return callback(null, true);
    // Allow if list is empty (dev) or origin is in the list
    if (allowedOrigins.length === 0 || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
}));
app.use(express.json());

// Rate limiting for API
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 200,
  message: { error: 'Too many requests, please try again later.' },
});
app.use('/api', apiLimiter);

// --- API Routes ---
app.use('/api/auth', authRoutes);
app.use('/api/links', linkRoutes);
app.use('/api/analytics', analyticsRoutes);

// --- Redirect Route (must be last) ---
app.use('/', redirectRoute);

// --- Health Check ---
app.get('/health', (req, res) => res.json({ status: 'ok', timestamp: new Date() }));

// --- Global Error Handler ---
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`🚀 LinkSnap API running on http://localhost:${PORT}`);
});
