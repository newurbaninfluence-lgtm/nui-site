// admin-pin.js — PIN sign-in for the NUI back office (NUI only).
// Does NOT use the shared Supabase sign-in that tenant apps (MAD etc.) use.
//
// POST { action: 'login', pin }                     → { ok, token } (token = the existing admin key)
// POST { action: 'change', pin, newPin } + X-Admin-Token → { ok }
//
// The PIN is stored only as a scrypt hash in public.nui_admin_pin (service role only).
// Wrong guesses are limited: 5 per device/network, then a 15-minute lock;
// 25 wrong guesses in an hour from anywhere locks PIN sign-in for an hour.
// Fails closed on any missing config.

const crypto = require('crypto');
const { getCorsHeaders, requireAdmin } = require('./utils/security');

const PER_IP_MAX = 5;
const PER_IP_LOCK_MIN = 15;
const GLOBAL_MAX = 25;
const GLOBAL_WINDOW_MIN = 60;
const GLOBAL_KEY = '*all*';

function hashPin(pin, salt) {
  return crypto.scryptSync(String(pin), salt, 32).toString('hex');
}

function sameHash(a, b) {
  const x = Buffer.from(a, 'hex');
  const y = Buffer.from(b, 'hex');
  return x.length === y.length && crypto.timingSafeEqual(x, y);
}

function validPin(pin) {
  return typeof pin === 'string' && /^\d{4}$/.test(pin);
}

function clientIp(event) {
  const h = event.headers || {};
  return (h['x-nf-client-connection-ip'] || (h['x-forwarded-for'] || '').split(',')[0] || 'unknown').trim();
}

exports.handler = async (event) => {
  const headers = getCorsHeaders(event);
  if (event.httpMethod === 'OPTIONS') return { statusCode: 204, headers, body: '' };
  if (event.httpMethod !== 'POST') return { statusCode: 405, headers, body: JSON.stringify({ ok: false, reason: 'post_only' }) };

  const reply = (statusCode, body) => ({ statusCode, headers: { ...headers, 'Cache-Control': 'no-store' }, body: JSON.stringify(body) });

  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_KEY;
  const ADMIN_SECRET = process.env.ADMIN_SECRET;
  if (!SUPABASE_URL || !SERVICE_KEY || !ADMIN_SECRET) {
    console.error('[admin-pin] missing SUPABASE_URL / SUPABASE_SERVICE_KEY / ADMIN_SECRET');
    return reply(500, { ok: false, reason: 'not_configured' });
  }

  const rest = (path, opts = {}) => fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    ...opts,
    headers: { apikey: SERVICE_KEY, Authorization: `Bearer ${SERVICE_KEY}`, 'Content-Type': 'application/json', ...(opts.headers || {}) }
  });

  async function getAttempts(key) {
    const r = await rest(`nui_admin_pin_attempts?key=eq.${encodeURIComponent(key)}&select=*`);
    if (!r.ok) throw new Error('attempts lookup ' + r.status);
    const rows = await r.json();
    return rows[0] || null;
  }
  async function saveAttempts(row) {
    const r = await rest('nui_admin_pin_attempts?on_conflict=key', {
      method: 'POST',
      headers: { Prefer: 'resolution=merge-duplicates,return=minimal' },
      body: JSON.stringify({ ...row, updated_at: new Date().toISOString() })
    });
    if (!r.ok) throw new Error('attempts save ' + r.status);
  }
  async function getPinRow() {
    const r = await rest('nui_admin_pin?id=eq.1&select=pin_hash,pin_salt');
    if (!r.ok) throw new Error('pin lookup ' + r.status);
    const rows = await r.json();
    return rows[0] || null;
  }

  let body;
  try { body = JSON.parse(event.body || '{}'); } catch (_) { return reply(400, { ok: false, reason: 'bad_request' }); }
  const action = body.action || 'login';

  try {
    // ── Change PIN (must already be signed in) ──
    if (action === 'change') {
      const auth = requireAdmin(event);
      if (!auth.authorized) return reply(401, { ok: false, reason: 'not_signed_in' });
      if (!validPin(body.newPin)) return reply(400, { ok: false, reason: 'bad_new_pin' });
      const row = await getPinRow();
      if (!row || !validPin(body.pin) || !sameHash(hashPin(body.pin, row.pin_salt), row.pin_hash)) {
        return reply(403, { ok: false, reason: 'wrong_current_pin' });
      }
      const salt = crypto.randomBytes(16).toString('hex');
      const r = await rest('nui_admin_pin?id=eq.1', {
        method: 'PATCH',
        headers: { Prefer: 'return=minimal' },
        body: JSON.stringify({ pin_hash: hashPin(body.newPin, salt), pin_salt: salt, updated_at: new Date().toISOString() })
      });
      if (!r.ok) throw new Error('pin save ' + r.status);
      return reply(200, { ok: true });
    }

    if (action !== 'login') return reply(400, { ok: false, reason: 'bad_request' });

    // ── Sign in with PIN ──
    const now = Date.now();
    const ip = clientIp(event);

    const globalRow = await getAttempts(GLOBAL_KEY);
    if (globalRow && globalRow.locked_until && new Date(globalRow.locked_until).getTime() > now) {
      return reply(429, { ok: false, reason: 'locked', minutes: Math.ceil((new Date(globalRow.locked_until).getTime() - now) / 60000) });
    }
    const ipRow = await getAttempts(ip);
    if (ipRow && ipRow.locked_until && new Date(ipRow.locked_until).getTime() > now) {
      return reply(429, { ok: false, reason: 'locked', minutes: Math.ceil((new Date(ipRow.locked_until).getTime() - now) / 60000) });
    }

    const row = await getPinRow();
    if (!row) return reply(500, { ok: false, reason: 'not_configured' });

    if (validPin(body.pin) && sameHash(hashPin(body.pin, row.pin_salt), row.pin_hash)) {
      if (ipRow && ipRow.fails) await saveAttempts({ key: ip, fails: 0, locked_until: null, window_start: null });
      return reply(200, { ok: true, token: ADMIN_SECRET });
    }

    // Wrong PIN: count it for this network and overall.
    const ipFails = (ipRow && ipRow.fails ? ipRow.fails : 0) + 1;
    const ipLocked = ipFails >= PER_IP_MAX;
    await saveAttempts({
      key: ip,
      fails: ipLocked ? 0 : ipFails,
      locked_until: ipLocked ? new Date(now + PER_IP_LOCK_MIN * 60000).toISOString() : null,
      window_start: null
    });

    const windowStart = globalRow && globalRow.window_start ? new Date(globalRow.window_start).getTime() : 0;
    const inWindow = windowStart && now - windowStart < GLOBAL_WINDOW_MIN * 60000;
    const gFails = (inWindow ? globalRow.fails : 0) + 1;
    const gLocked = gFails >= GLOBAL_MAX;
    await saveAttempts({
      key: GLOBAL_KEY,
      fails: gLocked ? 0 : gFails,
      window_start: gLocked ? null : new Date(inWindow ? windowStart : now).toISOString(),
      locked_until: gLocked ? new Date(now + GLOBAL_WINDOW_MIN * 60000).toISOString() : null
    });
    if (gLocked) console.warn('[admin-pin] too many wrong PINs overall — PIN sign-in locked for an hour');

    if (ipLocked || gLocked) {
      return reply(429, { ok: false, reason: 'locked', minutes: ipLocked ? PER_IP_LOCK_MIN : GLOBAL_WINDOW_MIN });
    }
    return reply(401, { ok: false, reason: 'wrong_pin', triesLeft: PER_IP_MAX - ipFails });
  } catch (err) {
    console.error('[admin-pin]', err.message);
    return reply(500, { ok: false, reason: 'server_error' });
  }
};
