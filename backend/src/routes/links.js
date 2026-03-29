const express = require('express');
const bcrypt = require('bcrypt');
const { nanoid } = require('nanoid');
const QRCode = require('qrcode');
const { PrismaClient } = require('@prisma/client');
const authMiddleware = require('../middleware/auth');
const { autoTagUrl, suggestAlias } = require('../services/aiInsights');

const router = express.Router();
const prisma = new PrismaClient();

// POST /api/links — Create a new short link
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { originalUrl: rawUrl, customAlias, password, expiresAt, useAI } = req.body;
    if (!rawUrl) return res.status(400).json({ error: 'originalUrl is required.' });

    // Normalize URL — ensure it has a protocol
    let originalUrl = rawUrl.trim();
    if (!/^https?:\/\//i.test(originalUrl)) {
      originalUrl = 'https://' + originalUrl;
    }

    // Validate URL
    try { new URL(originalUrl); } catch {
      return res.status(400).json({ error: 'Invalid URL format.' });
    }

    // Short code
    let shortCode = customAlias ? customAlias.trim().toLowerCase() : nanoid(6);
    // Check alias collision
    const existing = await prisma.link.findUnique({ where: { shortCode } });
    if (existing) return res.status(409).json({ error: 'This alias is already taken.' });

    // AI features (optional)
    let tag = null;
    let suggestedAlias = null;
    if (useAI) {
      try {
        [tag, suggestedAlias] = await Promise.all([
          autoTagUrl(originalUrl),
          !customAlias ? suggestAlias(originalUrl) : Promise.resolve(null),
        ]);
        // If AI alias is unique and not overriding custom, use it
        if (suggestedAlias && !customAlias) {
          const aliasConflict = await prisma.link.findUnique({ where: { shortCode: suggestedAlias } });
          if (!aliasConflict) shortCode = suggestedAlias;
        }
      } catch (aiErr) {
        console.warn('AI features failed, falling back:', aiErr.message);
      }
    }

    // Hash password if provided
    const hashedPassword = password ? await bcrypt.hash(password, 10) : null;

    const link = await prisma.link.create({
      data: {
        userId: req.user.userId,
        originalUrl,
        shortCode,
        tag,
        password: hashedPassword,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
      },
    });

    // Generate QR code
    const baseUrl = process.env.BASE_URL || 'http://localhost:4000';
    const shortUrl = `${baseUrl}/${shortCode}`;
    const qrCode = await QRCode.toDataURL(shortUrl);

    res.status(201).json({ ...link, shortUrl, qrCode });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create link.' });
  }
});

// GET /api/links — List all links for the logged-in user
router.get('/', authMiddleware, async (req, res) => {
  try {
    const links = await prisma.link.findMany({
      where: { userId: req.user.userId },
      orderBy: { createdAt: 'desc' },
      include: { _count: { select: { clicks: true } } },
    });
    const baseUrl = process.env.BASE_URL || 'http://localhost:4000';
    const result = links.map(l => ({
      ...l,
      shortUrl: `${baseUrl}/${l.shortCode}`,
      clickCount: l._count.clicks,
    }));
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch links.' });
  }
});

// DELETE /api/links/:id — Delete a link (must be owner)
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const link = await prisma.link.findUnique({ where: { id: req.params.id } });
    if (!link) return res.status(404).json({ error: 'Link not found.' });
    if (link.userId !== req.user.userId) return res.status(403).json({ error: 'Forbidden.' });

    await prisma.link.delete({ where: { id: req.params.id } });
    res.json({ message: 'Link deleted.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete link.' });
  }
});

module.exports = router;
