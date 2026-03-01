// ═══════════════════════════════════════════════════════════════
// NUI SECURITY UTILITIES
// Shared auth, CORS, rate limiting, and input sanitization
// Used by ALL Netlify functions
// ═══════════════════════════════════════════════════════════════

const ALLOWED_ORIGINS = [
  'https://newurbaninfluence.com',
  'https://www.newurbaninfluence.com',
  'http://localhost:8888',
  'http://localhost:3000',
  'http://127.0.0.1:8888'
];

// ── CORS Headers (locked to NUI domain) ──
function getCorsHeaders(event) {
  const origin = event?.headers?.origin || '';
  const allowed = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    'Access-Control-Allow-Origin': allowed,
    'Access-Control-Allow-Headers': 'Content-Type, X-Admin-Token',
    'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
    'Content-Type': 'application/json'
  };
}

// ── Admin Auth Check ──
// Requires X-Admin-Token header matching ADMIN_SECRET env var
function requireAdmin(event) {
  const token = event.headers['x-admin-token'] || event.headers['X-Admin-Token'] || '';
  const secret = process.env.ADMIN_SECRET;

  if (!secret) {
    console.error('ADMIN_SECRET not set in environment variables!');
    return { authorized: false, error: 'Server misconfigured' };
  }

  if (!token) {
    return { authorized: false, error: 'Missing authentication token' };
  }

  // Constant-time comparison to prevent timing attacks
  if (token.length !== secret.length) {
    return { authorized: false, error: 'Invalid token' };
  }

  const a = Buffer.from(token);
  const b = Buffer.from(secret);
  const crypto = require('crypto');
  if (!crypto.timingSafeEqual(a, b)) {
    return { authorized: false, error: 'Invalid token' };
  }

  return { authorized: true };
}

// ── Webhook Auth Check ──
// For external services (RB2B, OpenPhone, Calendly) that send a shared secret
function requireWebhookSecret(event, envKey) {
  const expected = process.env[envKey];
  if (!expected) return { authorized: true }; // If no secret configured, allow (but log warning)

  const token = event.headers['x-webhook-secret'] ||
                event.headers['authorization'] ||
                event.queryStringParameters?.secret || '';

  if (token === expected || token === `Bearer ${expected}`) {
    return { authorized: true };
  }
  return { authorized: false, error: 'Invalid webhook secret' };
}

// ── Input Sanitization ──
function sanitize(input) {
  if (typeof input !== 'string') return input;
  return input
    .replace(/[<>]/g, '')          // Strip HTML angle brackets
    .replace(/javascript:/gi, '')   // Strip JS protocol
    .replace(/on\w+\s*=/gi, '')     // Strip event handlers (onclick=, etc)
    .replace(/data:/gi, '')         // Strip data: URIs
    .trim()
    .slice(0, 5000);               // Cap length at 5000 chars
}

function sanitizeObject(obj) {
  if (!obj || typeof obj !== 'object') return obj;
  const clean = {};
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string') {
      clean[key] = sanitize(value);
    } else if (typeof value === 'object' && value !== null) {
      clean[key] = Array.isArray(value) ? value.map(sanitize) : sanitizeObject(value);
    } else {
      clean[key] = value;
    }
  }
  return clean;
}

// ── Email Validation ──
function isValidEmail(email) {
  if (!email || typeof email !== 'string') return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && email.length <= 254;
}

// ── Phone Validation (US) ──
function isValidPhone(phone) {
  if (!phone || typeof phone !== 'string') return false;
  const digits = phone.replace(/\D/g, '');
  return digits.length === 10 || (digits.length === 11 && digits[0] === '1');
}

// ── Rate Limiting (in-memory, per function instance) ──
// Note: Netlify functions are stateless, so this resets on cold starts.
// For production-grade rate limiting, use Supabase or Redis.
// This still catches burst attacks within a single warm instance.
const rateLimitStore = {};

function rateLimit(ip, maxRequests = 30, windowMs = 60000) {
  const now = Date.now();
  const key = ip || 'unknown';

  if (!rateLimitStore[key]) {
    rateLimitStore[key] = { count: 1, resetAt: now + windowMs };
    return { limited: false, remaining: maxRequests - 1 };
  }

  if (now > rateLimitStore[key].resetAt) {
    rateLimitStore[key] = { count: 1, resetAt: now + windowMs };
    return { limited: false, remaining: maxRequests - 1 };
  }

  rateLimitStore[key].count++;
  if (rateLimitStore[key].count > maxRequests) {
    return { limited: true, remaining: 0 };
  }

  return { limited: false, remaining: maxRequests - rateLimitStore[key].count };
}

// ── Standard Error Response ──
function errorResponse(statusCode, message, headers) {
  return {
    statusCode,
    headers: headers || {},
    body: JSON.stringify({ error: message })
  };
}

// ── Standard OPTIONS handler ──
function handleOptions(event) {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: getCorsHeaders(event), body: '' };
  }
  return null;
}

// ── Exports ──
module.exports = {
  getCorsHeaders,
  requireAdmin,
  requireWebhookSecret,
  sanitize,
  sanitizeObject,
  isValidEmail,
  isValidPhone,
  rateLimit,
  errorResponse,
  handleOptions,
  ALLOWED_ORIGINS
};
