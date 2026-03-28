const geoip = require('geoip-lite');
const UAParser = require('ua-parser-js');

/**
 * Parse a request into structured click metadata.
 * @param {import('express').Request} req
 * @returns {{ ip, country, city, device, browser, os, referrer }}
 */
function parseClickData(req) {
  const rawIp =
    req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
    req.socket?.remoteAddress ||
    '';
  // Normalize localhost
  const ip = rawIp === '::1' || rawIp === '127.0.0.1' ? '' : rawIp;

  const geo = ip ? geoip.lookup(ip) : null;
  const country = geo?.country || '';
  const city = geo?.city || '';

  const ua = UAParser(req.headers['user-agent'] || '');
  const device = ua.device?.type || 'desktop';
  const browser = ua.browser?.name || 'Unknown';
  const os = ua.os?.name || 'Unknown';

  const referrer = req.headers['referer'] || req.headers['referrer'] || '';

  return { ip, country, city, device, browser, os, referrer };
}

module.exports = { parseClickData };
