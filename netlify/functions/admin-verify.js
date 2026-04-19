// admin-verify.js — Validates an admin token before the client saves it
// POST { token } → { valid: true|false }
// Uses the same constant-time comparison as requireAdmin() in utils/security.js

const crypto = require('crypto');

exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers, body: '' };
  if (event.httpMethod !== 'POST')    return { statusCode: 405, headers, body: JSON.stringify({ error: 'POST only' }) };

  try {
    const { token } = JSON.parse(event.body || '{}');
    const secret = process.env.ADMIN_SECRET;

    if (!secret) {
      // Soft rollout: no secret configured, accept anything (same behavior as requireAdmin)
      return { statusCode: 200, headers, body: JSON.stringify({ valid: true, warning: 'No ADMIN_SECRET configured — auth disabled' }) };
    }

    if (!token || typeof token !== 'string') {
      return { statusCode: 200, headers, body: JSON.stringify({ valid: false, reason: 'empty' }) };
    }

    if (token.length !== secret.length) {
      return { statusCode: 200, headers, body: JSON.stringify({ valid: false, reason: 'wrong_length' }) };
    }

    const a = Buffer.from(token);
    const b = Buffer.from(secret);
    const match = crypto.timingSafeEqual(a, b);

    return { statusCode: 200, headers, body: JSON.stringify({ valid: match, reason: match ? 'ok' : 'mismatch' }) };
  } catch (err) {
    console.error('[admin-verify]', err);
    return { statusCode: 500, headers, body: JSON.stringify({ valid: false, error: err.message }) };
  }
};
