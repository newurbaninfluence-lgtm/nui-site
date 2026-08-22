// expire-checkout-session.js — Netlify Function (admin)
// Kills a Stripe Checkout Session that was sent out in error, so the link a
// client already has stops working. Stripe marks the session 'expired'; anyone
// opening the URL afterwards sees Stripe's "this page has expired" screen.
//
// Only works on sessions still 'open' — a session the client already completed
// cannot be expired (the subscription exists at that point; cancel it instead).
//
// Env: STRIPE_SECRET_KEY, ADMIN_SECRET

const { requireAdmin } = require('./utils/security');

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, X-Admin-Token',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Content-Type': 'application/json'
};

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return { statusCode: 204, headers: CORS_HEADERS, body: '' };
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers: CORS_HEADERS, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  const auth = requireAdmin(event);
  if (!auth.authorized) {
    return { statusCode: 401, headers: CORS_HEADERS, body: JSON.stringify({ error: auth.error || 'Unauthorized' }) };
  }

  const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
  if (!STRIPE_SECRET_KEY) {
    return { statusCode: 500, headers: CORS_HEADERS, body: JSON.stringify({ error: 'Stripe not configured' }) };
  }

  let sessionId;
  try {
    sessionId = (JSON.parse(event.body || '{}').session_id || '').trim();
  } catch (e) {
    return { statusCode: 400, headers: CORS_HEADERS, body: JSON.stringify({ error: 'Invalid JSON body' }) };
  }
  // Guard: only ever accept a Checkout Session id, never an arbitrary path.
  if (!/^cs_(live|test)_[A-Za-z0-9]+$/.test(sessionId)) {
    return { statusCode: 400, headers: CORS_HEADERS, body: JSON.stringify({ error: 'A valid cs_… checkout session id is required' }) };
  }

  try {
    const r = await fetch(`https://api.stripe.com/v1/checkout/sessions/${sessionId}/expire`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${STRIPE_SECRET_KEY}` }
    });
    const s = await r.json();
    if (!r.ok) {
      return { statusCode: r.status, headers: CORS_HEADERS, body: JSON.stringify({ error: s.error?.message || 'Expire failed' }) };
    }
    console.log(`checkout session expired: ${sessionId}`);
    return {
      statusCode: 200,
      headers: CORS_HEADERS,
      body: JSON.stringify({ ok: true, id: s.id, status: s.status, expires_at: s.expires_at })
    };
  } catch (err) {
    console.error('expire-checkout-session error:', err);
    return { statusCode: 500, headers: CORS_HEADERS, body: JSON.stringify({ error: err.message }) };
  }
};
