// client-auth.js — server-side identity for CLIENT portal users.
//
// Why this exists: clients have no admin token. Until now the portal only worked
// because sync-data answered unauthenticated (it dumped the entire business
// dataset to anyone). This module lets a client prove who they are server-side so
// they can be served ONLY their own data.
//
// Three accepted proofs, in order of preference:
//   1. Supabase Auth JWT      — the real accounts created by manage-client.js
//   2. email + password       — legacy clients stored in the site_config 'clients'
//                               blob (plaintext there today; compared server-side)
//   3. signed session token   — issued by 1 or 2, HMAC-SHA256, default 30 days
//
// Env: SUPABASE_URL, SUPABASE_SERVICE_KEY, CLIENT_SESSION_SECRET (falls back to
//      ADMIN_SECRET so it works the moment this deploys).

const crypto = require('crypto');

const SESSION_DAYS = 30;

function sessionSecret() {
  return process.env.CLIENT_SESSION_SECRET || process.env.ADMIN_SECRET || '';
}

function b64url(buf) {
  return Buffer.from(buf).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}
function unb64url(s) {
  return Buffer.from(String(s).replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString('utf8');
}

function issueSessionToken(email) {
  const secret = sessionSecret();
  if (!secret) return null;
  const exp = Date.now() + SESSION_DAYS * 86400000;
  const payload = `${b64url(email.toLowerCase())}.${exp}`;
  const sig = crypto.createHmac('sha256', secret).update(payload).digest('hex');
  return `${payload}.${sig}`;
}

function verifySessionToken(token) {
  try {
    const secret = sessionSecret();
    if (!secret || !token) return null;
    const parts = String(token).split('.');
    if (parts.length !== 3) return null;
    const [emailPart, expPart, sig] = parts;
    const expected = crypto.createHmac('sha256', secret).update(`${emailPart}.${expPart}`).digest('hex');
    const a = Buffer.from(sig, 'utf8');
    const b = Buffer.from(expected, 'utf8');
    if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;
    if (Number(expPart) < Date.now()) return null;
    return unb64url(emailPart).toLowerCase();
  } catch (e) {
    return null;
  }
}

function sbHeaders() {
  const k = process.env.SUPABASE_SERVICE_KEY;
  return { 'apikey': k, 'Authorization': `Bearer ${k}`, 'Content-Type': 'application/json' };
}

// Read one key out of the site_config blob store (where the admin app's data lives).
async function readBlob(key) {
  const url = process.env.SUPABASE_URL;
  if (!url || !process.env.SUPABASE_SERVICE_KEY) return null;
  const r = await fetch(`${url}/rest/v1/site_config?select=value&key=eq.${encodeURIComponent(key)}&limit=1`,
    { headers: sbHeaders() });
  if (!r.ok) return null;
  const rows = await r.json();
  return rows && rows[0] ? rows[0].value : null;
}

async function verifySupabaseJwt(jwt) {
  try {
    const url = process.env.SUPABASE_URL;
    if (!url || !jwt) return null;
    const r = await fetch(`${url}/auth/v1/user`, {
      headers: { 'apikey': process.env.SUPABASE_SERVICE_KEY, 'Authorization': `Bearer ${jwt}` }
    });
    if (!r.ok) return null;
    const user = await r.json();
    return user && user.email ? String(user.email).toLowerCase() : null;
  } catch (e) {
    return null;
  }
}

// Find the client record for an email in the synced clients blob.
async function findClientByEmail(email) {
  if (!email) return null;
  const clients = await readBlob('clients');
  if (!Array.isArray(clients)) return null;
  const target = String(email).toLowerCase();
  return clients.find(c => String(c.email || '').toLowerCase() === target) || null;
}

// Legacy path: verify email + password against the clients blob (plaintext today).
async function verifyClientPassword(email, password) {
  const client = await findClientByEmail(email);
  if (!client || client.blocked) return null;
  const stored = client.password;
  if (!stored || !password) return null;
  const a = Buffer.from(String(stored), 'utf8');
  const b = Buffer.from(String(password), 'utf8');
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;
  return client;
}

// Resolve the caller to a verified email using whichever proof was supplied.
// Returns { email, via } or null. NEVER trusts a caller-supplied email alone.
async function authenticateClient(event, body) {
  const auth = event.headers?.authorization || event.headers?.Authorization || '';
  const bearer = auth.startsWith('Bearer ') ? auth.slice(7).trim() : null;

  if (bearer) {
    const email = await verifySupabaseJwt(bearer);
    if (email) return { email, via: 'supabase_jwt' };
  }
  if (body?.session_token) {
    const email = verifySessionToken(body.session_token);
    if (email) return { email, via: 'session_token' };
  }
  if (body?.email && body?.password) {
    const client = await verifyClientPassword(body.email, body.password);
    if (client) return { email: String(client.email).toLowerCase(), via: 'password' };
  }
  return null;
}

module.exports = {
  authenticateClient,
  issueSessionToken,
  verifySessionToken,
  findClientByEmail,
  readBlob,
  sbHeaders
};
