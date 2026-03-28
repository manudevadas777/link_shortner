const express = require('express');
const { PrismaClient } = require('@prisma/client');
const authMiddleware = require('../middleware/auth');
const { getAiInsights } = require('../services/aiInsights');

const router = express.Router();
const prisma = new PrismaClient();

// Helper: aggregate click data for a link
async function aggregateAnalytics(linkId) {
  const clicks = await prisma.click.findMany({
    where: { linkId },
    orderBy: { timestamp: 'asc' },
  });

  const total = clicks.length;

  // Clicks per day (last 30 days)
  const now = new Date();
  const clicksByDay = {};
  for (let i = 29; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    clicksByDay[d.toISOString().split('T')[0]] = 0;
  }
  clicks.forEach(c => {
    const day = c.timestamp.toISOString().split('T')[0];
    if (clicksByDay[day] !== undefined) clicksByDay[day]++;
  });
  const clicksOverTime = Object.entries(clicksByDay).map(([date, count]) => ({ date, count }));

  // Breakdown helpers
  const breakdown = (field) => {
    const map = {};
    clicks.forEach(c => { const v = c[field] || 'Unknown'; map[v] = (map[v] || 0) + 1; });
    return Object.entries(map).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
  };

  const deviceBreakdown = breakdown('device');
  const browserBreakdown = breakdown('browser');
  const osBreakdown = breakdown('os');
  const countryBreakdown = breakdown('country');
  const cityBreakdown = breakdown('city');
  const referrerBreakdown = breakdown('referrer');

  // Peak hour
  const hourMap = {};
  clicks.forEach(c => {
    const hour = c.timestamp.getUTCHours();
    hourMap[hour] = (hourMap[hour] || 0) + 1;
  });
  const peakHour = Object.entries(hourMap).sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;

  // 7-day trend
  const sevenDaysAgo = new Date(now);
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const recentClicks = clicks.filter(c => c.timestamp >= sevenDaysAgo).length;

  return {
    total,
    clicksOverTime,
    deviceBreakdown,
    browserBreakdown,
    osBreakdown,
    countryBreakdown,
    cityBreakdown,
    referrerBreakdown,
    peakHour: peakHour !== null ? `${peakHour}:00 UTC` : null,
    last7Days: recentClicks,
  };
}

// GET /api/analytics/:id — Full analytics for a link
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const link = await prisma.link.findUnique({ where: { id: req.params.id } });
    if (!link) return res.status(404).json({ error: 'Link not found.' });
    if (link.userId !== req.user.userId) return res.status(403).json({ error: 'Forbidden.' });

    const analytics = await aggregateAnalytics(req.params.id);
    res.json({ link, analytics });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch analytics.' });
  }
});

// GET /api/analytics/:id/ai — Claude AI insights
router.get('/:id/ai', authMiddleware, async (req, res) => {
  try {
    const link = await prisma.link.findUnique({ where: { id: req.params.id } });
    if (!link) return res.status(404).json({ error: 'Link not found.' });
    if (link.userId !== req.user.userId) return res.status(403).json({ error: 'Forbidden.' });

    const analytics = await aggregateAnalytics(req.params.id);
    if (analytics.total === 0) {
      return res.json({
        summary: 'No clicks recorded yet. Share your link to start collecting data.',
        recommendations: [
          'Share the link on social media to drive traffic.',
          'Add a QR code to printed materials.',
          'Embed the link in an email campaign.',
        ],
        hiddenInsight: 'Links shared within the first 24 hours see 3x more engagement on average.',
        botRisk: 'low',
      });
    }

    const insights = await getAiInsights({
      totalClicks: analytics.total,
      last7Days: analytics.last7Days,
      topCountries: analytics.countryBreakdown.slice(0, 5),
      deviceBreakdown: analytics.deviceBreakdown,
      browserBreakdown: analytics.browserBreakdown.slice(0, 5),
      topReferrers: analytics.referrerBreakdown.slice(0, 5),
      peakHour: analytics.peakHour,
      clicksOverTime: analytics.clicksOverTime.slice(-7),
    });

    res.json(insights);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'AI insights failed. Check your API key.' });
  }
});

module.exports = router;
