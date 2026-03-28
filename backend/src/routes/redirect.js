const express = require('express');
const bcrypt = require('bcrypt');
const { PrismaClient } = require('@prisma/client');
const { parseClickData } = require('../services/clickTracker');

const router = express.Router();
const prisma = new PrismaClient();

// GET /:shortCode — Redirect to original URL + log click
router.get('/:shortCode', async (req, res) => {
  try {
    const { shortCode } = req.params;
    // Ignore common paths that shouldn't be treated as short codes
    if (['api', 'health', 'favicon.ico'].includes(shortCode)) return res.status(404).end();

    const link = await prisma.link.findUnique({ where: { shortCode } });
    if (!link) return res.status(404).send(`
      <html><body style="font-family:sans-serif;text-align:center;padding:80px;">
        <h1 style="color:#e44">404</h1>
        <p>This link doesn't exist or has been removed.</p>
      </body></html>
    `);

    // Check expiry
    if (link.expiresAt && new Date() > link.expiresAt) {
      return res.status(410).send(`
        <html><body style="font-family:sans-serif;text-align:center;padding:80px;">
          <h1 style="color:#f90">Link Expired</h1>
          <p>This link has expired and is no longer active.</p>
        </body></html>
      `);
    }

    // Check password
    if (link.password) {
      const providedPassword = req.query.pw || req.headers['x-link-password'];
      if (!providedPassword) {
        // Redirect to frontend password page
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
        return res.redirect(`${frontendUrl}/protected/${shortCode}`);
      }
      const valid = await bcrypt.compare(providedPassword, link.password);
      if (!valid) return res.status(401).json({ error: 'Incorrect password.' });
    }

    // Log click asynchronously (fire and forget)
    const clickData = parseClickData(req);
    prisma.click.create({
      data: { linkId: link.id, ...clickData },
    }).catch(err => console.error('Click log error:', err));

    // Redirect
    res.redirect(302, link.originalUrl);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

module.exports = router;
