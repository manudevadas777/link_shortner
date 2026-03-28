const Anthropic = require('@anthropic-ai/sdk');

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

/**
 * Get AI insights for a link's analytics data.
 * @param {object} analytics - Aggregated analytics object
 * @returns {Promise<{ summary, recommendations, hiddenInsight, botRisk }>}
 */
async function getAiInsights(analytics) {
  const prompt = `You are an analytics expert for LinkSnap, a URL shortener. 
Analyze the following link performance data and respond ONLY with valid JSON (no markdown, no explanation).

Analytics Data:
${JSON.stringify(analytics, null, 2)}

Respond with this exact JSON structure:
{
  "summary": "A 2-3 sentence plain English performance summary",
  "recommendations": [
    "Recommendation 1",
    "Recommendation 2", 
    "Recommendation 3"
  ],
  "hiddenInsight": "One surprising or non-obvious insight from the data",
  "botRisk": "low" | "medium" | "high"
}

For botRisk: rate as 'high' if clicks are suspiciously uniform in timing, all from same IP/device, or spike without referrer. 'medium' if mildly suspicious. 'low' if organic-looking.`;

  const message = await client.messages.create({
    model: 'claude-sonnet-4-5',
    max_tokens: 1024,
    messages: [{ role: 'user', content: prompt }],
  });

  const raw = message.content[0].text.trim();
  return JSON.parse(raw);
}

/**
 * Auto-tag a URL with a content category.
 * @param {string} url
 * @returns {Promise<string>} tag
 */
async function autoTagUrl(url) {
  const message = await client.messages.create({
    model: 'claude-sonnet-4-5',
    max_tokens: 64,
    messages: [{
      role: 'user',
      content: `Categorize this URL into exactly ONE of these tags: Blog, E-Commerce, Social Media, News, Video, Documentation, Portfolio, Tool, Event, Other.
URL: ${url}
Reply with ONLY the tag word, nothing else.`,
    }],
  });
  return message.content[0].text.trim();
}

/**
 * Suggest a short, human-friendly alias for a URL.
 * @param {string} url
 * @returns {Promise<string>} suggested alias (3-8 chars, lowercase, alphanumeric-hyphen)
 */
async function suggestAlias(url) {
  const message = await client.messages.create({
    model: 'claude-sonnet-4-5',
    max_tokens: 32,
    messages: [{
      role: 'user',
      content: `Suggest a short, memorable, human-friendly URL slug for this link: ${url}
Rules: 3-8 characters, lowercase only, letters/numbers/hyphens only, no spaces.
Reply with ONLY the slug, nothing else.`,
    }],
  });
  return message.content[0].text.trim().toLowerCase().replace(/[^a-z0-9-]/g, '');
}

module.exports = { getAiInsights, autoTagUrl, suggestAlias };
