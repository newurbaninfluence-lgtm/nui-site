// sanitizer.js — Input sanitization for Netlify functions

/**
 * Strip HTML tags and dangerous characters
 */
function stripHtml(str) {
  if (typeof str !== 'string') return '';
  return str
    .replace(/<[^>]*>/g, '')          // strip HTML tags
    .replace(/javascript:/gi, '')      // strip JS protocol
    .replace(/on\w+\s*=/gi, '')       // strip event handlers
    .replace(/[<>]/g, '')              // strip remaining angle brackets
    .trim();
}

/**
 * Sanitize a plain text field (names, messages, notes)
 */
function sanitizeText(str, maxLen = 500) {
  if (!str) return '';
  return stripHtml(String(str)).slice(0, maxLen);
}

/**
 * Sanitize and validate email
 */
function sanitizeEmail(email) {
  if (!email) return null;
  const clean = stripHtml(String(email)).toLowerCase().trim().slice(0, 254);
  const valid = /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/.test(clean);
  return valid ? clean : null;
}

/**
 * Sanitize phone — digits, +, -, spaces, parens only
 */
function sanitizePhone(phone) {
  if (!phone) return null;
  const clean = String(phone).replace(/[^\d+\-\s()]/g, '').trim().slice(0, 20);
  return clean.length >= 7 ? clean : null;
}

/**
 * Sanitize a UUID
 */
function sanitizeUUID(id) {
  if (!id) return null;
  const clean = String(id).trim();
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(clean) ? clean : null;
}

/**
 * Sanitize a URL
 */
function sanitizeUrl(url) {
  if (!url) return null;
  const clean = String(url).trim().slice(0, 2000);
  try {
    const u = new URL(clean);
    if (!['http:', 'https:'].includes(u.protocol)) return null;
    return u.toString();
  } catch { return null; }
}

/**
 * Validate required fields — returns { valid, errors }
 */
function validateRequired(obj, fields) {
  const errors = fields.filter(f => !obj[f] || String(obj[f]).trim() === '');
  return { valid: errors.length === 0, errors };
}

module.exports = { sanitizeText, sanitizeEmail, sanitizePhone, sanitizeUUID, sanitizeUrl, validateRequired, stripHtml };
