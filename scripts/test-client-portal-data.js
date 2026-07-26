#!/usr/bin/env node
// test-client-portal-data.js — auth + scoping tests for the client portal endpoint.
// Run: node scripts/test-client-portal-data.js
// Fully mocked: no network, no Supabase, no Stripe.

const path = require('path');

process.env.SUPABASE_URL = 'https://mock.supabase.co';
process.env.SUPABASE_SERVICE_KEY = 'svc-mock';
process.env.CLIENT_SESSION_SECRET = 'test-session-secret';

// ── mock data ──
const CLIENT_A = { id: 101, name: 'Alice Co', email: 'alice@example.com', phone: '2485550100', password: 'alicepw' };
const CLIENT_B = { id: 202, name: 'Bob Co', email: 'bob@example.com', password: 'bobpw' };
const BLOCKED  = { id: 303, name: 'Blocked Co', email: 'blocked@example.com', password: 'x', blocked: true };

const blobs = {
  clients: [CLIENT_A, CLIENT_B, BLOCKED],
  orders:   [{ id: 1, clientId: 101, total: 500 }, { id: 2, clientId: 202, total: 900 }],
  invoices: [{ id: 11, clientId: 101, total: 150 }, { id: 12, client_id: 202, total: 300 }],
  projects: [{ id: 21, clientId: 101 }, { id: 22, clientId: 202 }],
  proofs:   [{ id: 31, clientId: 202 }]
};
const dbSites = [
  { id: 'sA', site_id: 'alice-site', site_name: 'Alice Site', client_id: '101', monthly_fee: 150 },
  { id: 'sB', site_id: 'bob-site', site_name: 'Bob Site', client_id: '202', monthly_fee: 150 }
];
let jwtValidFor = null; // email the mocked Supabase /auth/v1/user will return

global.fetch = async (url, opts = {}) => {
  const u = new URL(url);
  if (u.pathname === '/auth/v1/user') {
    if (!jwtValidFor) return { ok: false, json: async () => ({}) };
    return { ok: true, json: async () => ({ email: jwtValidFor }) };
  }
  const table = u.pathname.split('/')[3];
  if (table === 'site_config') {
    const key = (u.searchParams.get('key') || '').replace('eq.', '');
    return { ok: true, json: async () => blobs[key] ? [{ value: blobs[key] }] : [] };
  }
  if (table === 'client_sites') {
    const cid = (u.searchParams.get('client_id') || '').replace('eq.', '');
    return { ok: true, json: async () => dbSites.filter(s => String(s.client_id) === String(cid)) };
  }
  if (table === 'crm_contacts') return { ok: true, json: async () => [{ id: 'contact-1' }] };
  if (table === 'communications') return { ok: true, json: async () => [{ id: 'm1', body: 'hello', direction: 'inbound' }] };
  return { ok: true, json: async () => [] };
};

const { handler } = require(path.join(__dirname, '..', 'netlify', 'functions', 'client-portal-data.js'));
const call = (body, headers = {}) => handler({ httpMethod: 'POST', headers, body: JSON.stringify(body) });

let pass = 0, fail = 0;
const check = (n, c, d = '') => { c ? (pass++, console.log('  ✅ ' + n)) : (fail++, console.log('  ❌ ' + n + (d ? ' — ' + d : ''))); };

(async () => {
  // C1 — password login
  console.log('C1 — email + password login');
  let r = await call({ email: 'alice@example.com', password: 'alicepw' });
  let d = JSON.parse(r.body);
  check('returns 200', r.statusCode === 200, `got ${r.statusCode}`);
  check('client record returned', d.client?.id === 101);
  check('password stripped from response', d.client && !('password' in d.client));
  check('session_token issued', typeof d.session_token === 'string' && d.session_token.length > 20);
  check('via=password', d.via === 'password');

  // C2 — SCOPING: only their own data
  console.log('C2 — data is scoped to the authenticated client');
  check('only own orders', d.orders.length === 1 && d.orders[0].clientId === 101, JSON.stringify(d.orders));
  check('only own invoices', d.invoices.length === 1 && d.invoices[0].id === 11);
  check('only own projects', d.projects.length === 1 && d.projects[0].id === 21);
  check('no proofs (none are theirs)', d.proofs.length === 0);
  check('only own sites', d.sites.length === 1 && d.sites[0].site_id === 'alice-site');
  const leak = JSON.stringify(d);
  check('no other client email leaked', !leak.includes('bob@example.com'));
  check('no other client site leaked', !leak.includes('bob-site'));

  // C3 — session token round-trip
  console.log('C3 — session token reuse');
  const token = d.session_token;
  r = await call({ session_token: token });
  d = JSON.parse(r.body);
  check('token authenticates', r.statusCode === 200 && d.client?.id === 101);
  check('via=session_token', d.via === 'session_token');

  // C4 — forged / tampered tokens rejected
  console.log('C4 — forged credentials');
  const cases = [
    ['wrong password', { email: 'alice@example.com', password: 'nope' }],
    ['email only, no proof', { email: 'alice@example.com' }],
    ['empty body', {}],
    ['tampered token sig', { session_token: token.slice(0, -4) + 'aaaa' }],
    ['garbage token', { session_token: 'not.a.token' }],
    ["другой client's email w/ own password", { email: 'bob@example.com', password: 'alicepw' }]
  ];
  for (const [name, payload] of cases) {
    const res = await call(payload);
    check(`${name} → 401`, res.statusCode === 401, `got ${res.statusCode}`);
  }

  // C5 — expired token
  console.log('C5 — expired session token');
  const crypto = require('crypto');
  const b64 = (s) => Buffer.from(s).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  const expPayload = `${b64('alice@example.com')}.${Date.now() - 1000}`;
  const expSig = crypto.createHmac('sha256', 'test-session-secret').update(expPayload).digest('hex');
  r = await call({ session_token: `${expPayload}.${expSig}` });
  check('expired token → 401', r.statusCode === 401, `got ${r.statusCode}`);

  // C6 — Supabase JWT path
  console.log('C6 — Supabase Auth JWT');
  jwtValidFor = 'alice@example.com';
  r = await call({}, { authorization: 'Bearer real-jwt' });
  d = JSON.parse(r.body);
  check('JWT authenticates', r.statusCode === 200 && d.client?.id === 101);
  check('via=supabase_jwt', d.via === 'supabase_jwt');
  jwtValidFor = null;
  r = await call({}, { authorization: 'Bearer bad-jwt' });
  check('invalid JWT → 401', r.statusCode === 401, `got ${r.statusCode}`);

  // C7 — blocked account
  console.log('C7 — blocked client');
  r = await call({ email: 'blocked@example.com', password: 'x' });
  check('blocked → 401/403 (never data)', r.statusCode === 401 || r.statusCode === 403, `got ${r.statusCode}`);

  // C8 — unknown email
  console.log('C8 — unknown email');
  r = await call({ email: 'nobody@example.com', password: 'whatever' });
  check('unknown → 401', r.statusCode === 401, `got ${r.statusCode}`);

  // C9 — method guard
  console.log('C9 — method guard');
  r = await handler({ httpMethod: 'GET', headers: {}, body: '' });
  check('GET → 405', r.statusCode === 405);

  console.log(`\n${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error('HARNESS ERROR:', e); process.exit(1); });
