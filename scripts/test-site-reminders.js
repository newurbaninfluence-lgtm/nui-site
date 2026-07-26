#!/usr/bin/env node
// test-site-reminders.js — tests for the 7-day billing reminder job
// Run: node scripts/test-site-reminders.js
// No network, no Stripe, no SMTP: everything is stubbed in memory.

const path = require('path');
const Module = require('module');

process.env.SUPABASE_URL = 'https://mock.supabase.co';
process.env.SUPABASE_SERVICE_KEY = 'svc-mock';
process.env.STRIPE_SECRET_KEY = 'sk_test_mock';
process.env.HOSTINGER_EMAIL = 'test@newurbaninfluence.com';
process.env.HOSTINGER_PASSWORD = 'x';
process.env.OPENPHONE_API_KEY = 'op-mock';
process.env.OPENPHONE_PHONE_NUMBER = '+13135550100';
delete process.env.REMINDER_DAYS_BEFORE;

// ── stub nodemailer ──
const emails = [];
const nodemailerStub = { createTransport: () => ({ sendMail: async (o) => { emails.push(o); return {}; } }) };
const origResolve = Module._resolveFilename;
Module._resolveFilename = function (request, ...args) {
  if (request === 'nodemailer') return 'nodemailer-stub';
  return origResolve.call(this, request, ...args);
};
require.cache['nodemailer-stub'] = { id: 'nodemailer-stub', filename: 'nodemailer-stub', loaded: true, exports: nodemailerStub };

// ── in-memory state ──
const texts = [];
const patches = [];
let sites = [];
let suppressed = [];
let stripeFails = false;

const inDays = (n) => new Date(Date.now() + n * 86400000).toISOString().slice(0, 10);

function baseSite(over = {}) {
  return Object.assign({
    id: 'site-' + Math.random().toString(36).slice(2, 8),
    site_id: 'test-site', site_name: 'Test Site', client_name: 'Test Client',
    domain: 'test.com', monthly_fee: 150, billing_status: 'unbilled',
    next_due_date: inDays(7), contact_email: 'client@example.com', contact_phone: '248-555-0100',
    reminders_enabled: true, reminder_sent_for: null, stripe_subscription_id: null
  }, over);
}

global.fetch = async (url, opts = {}) => {
  const u = new URL(url);
  const method = (opts.method || 'GET').toUpperCase();
  if (u.host === 'mock.supabase.co') {
    const table = u.pathname.split('/')[3];
    if (table === 'client_sites' && method === 'GET') {
      // emulate the function's filters
      const target = (u.searchParams.get('next_due_date') || '').replace('eq.', '');
      const rows = sites.filter(s =>
        s.next_due_date === target &&
        s.reminders_enabled === true &&
        !['paused', 'canceled'].includes(s.billing_status));
      return { ok: true, json: async () => JSON.parse(JSON.stringify(rows)) };
    }
    if (table === 'client_sites' && method === 'PATCH') {
      const body = JSON.parse(opts.body || '{}');
      const id = (u.searchParams.get('id') || '').replace('eq.', '');
      patches.push({ id, body });
      const row = sites.find(s => s.id === id); if (row) Object.assign(row, body);
      return { ok: true, status: 204, json: async () => ({}) };
    }
    if (table === 'sms_suppression') {
      const phone = decodeURIComponent((u.searchParams.get('phone') || '').replace('eq.', ''));
      return { ok: true, json: async () => suppressed.includes(phone) ? [{ phone }] : [] };
    }
    return { ok: true, json: async () => [] };
  }
  if (u.host === 'api.stripe.com') {
    if (stripeFails) return { ok: false, json: async () => ({ error: { message: 'stripe down' } }) };
    if (u.pathname === '/v1/prices') return { ok: true, json: async () => ({ id: 'price_M' }) };
    return { ok: true, json: async () => ({ id: 'cs_M', url: 'https://checkout.stripe.com/pay/cs_M' }) };
  }
  if (u.host === 'api.openphone.com') {
    texts.push(JSON.parse(opts.body || '{}'));
    return { ok: true, status: 202, json: async () => ({}) };
  }
  throw new Error('unexpected fetch: ' + url);
};

const HANDLER = path.join(__dirname, '..', 'netlify', 'functions', 'site-reminders.js');
let handler = require(HANDLER).handler;
const run = () => handler({ httpMethod: 'POST', headers: {}, body: '' });
function reset() { emails.length = 0; texts.length = 0; patches.length = 0; suppressed = []; stripeFails = false; }

let pass = 0, fail = 0;
const check = (n, c, d = '') => { c ? (pass++, console.log('  ✅ ' + n)) : (fail++, console.log('  ❌ ' + n + (d ? ' — ' + d : ''))); };

(async () => {
  // R1 — happy path
  console.log('R1 — site due in 7 days, unbilled → email + SMS with checkout link');
  reset(); sites = [baseSite()];
  let r = await run(); let s = JSON.parse(r.body);
  check('returns 200', r.statusCode === 200);
  check('1 email sent', emails.length === 1, `got ${emails.length}`);
  check('1 SMS sent', texts.length === 1, `got ${texts.length}`);
  check('email contains checkout link', (emails[0]?.html || '').includes('checkout.stripe.com'));
  check('SMS contains checkout link', (texts[0]?.content || '').includes('checkout.stripe.com'));
  check('SMS has STOP opt-out', (texts[0]?.content || '').includes('STOP'));
  check('phone normalized to E.164', texts[0]?.to?.[0] === '+12485550100', `got ${texts[0]?.to?.[0]}`);
  check('marked reminder_sent_for', sites[0].reminder_sent_for === sites[0].next_due_date);

  // R2 — idempotency
  console.log('R2 — re-run same day must not double-send');
  reset();
  r = await run();
  check('no duplicate email', emails.length === 0, `got ${emails.length}`);
  check('no duplicate SMS', texts.length === 0, `got ${texts.length}`);

  // R3 — wrong window
  console.log('R3 — only the exact 7-day window fires');
  for (const d of [0, 1, 3, 6, 8, 14, 30, -5]) {
    reset(); sites = [baseSite({ next_due_date: inDays(d) })];
    await run();
    check(`due in ${d}d → no send`, emails.length === 0 && texts.length === 0);
  }
  reset(); sites = [baseSite({ next_due_date: inDays(7) })]; await run();
  check('due in 7d → sends', emails.length === 1 && texts.length === 1);

  // R4 — paused / canceled / disabled never remind
  console.log('R4 — paused, canceled, and reminders-off sites are skipped');
  for (const st of ['paused', 'canceled']) {
    reset(); sites = [baseSite({ billing_status: st })]; await run();
    check(`billing_status=${st} → silent`, emails.length === 0 && texts.length === 0);
  }
  reset(); sites = [baseSite({ reminders_enabled: false })]; await run();
  check('reminders_enabled=false → silent', emails.length === 0 && texts.length === 0);

  // R5 — already on Stripe: heads-up, no payment link
  console.log('R5 — site already on a subscription');
  reset(); sites = [baseSite({ stripe_subscription_id: 'sub_X', billing_status: 'active' })];
  await run();
  check('still notified', emails.length === 1 && texts.length === 1);
  check('no checkout link in email', !(emails[0]?.html || '').includes('checkout.stripe.com'));
  check('email says card will be charged', (emails[0]?.html || '').includes('charged automatically'));
  check('SMS says charged automatically', (texts[0]?.content || '').includes('charged automatically'));

  // R6 — SMS opt-out respected
  console.log('R6 — STOP list suppresses SMS but not email');
  reset(); sites = [baseSite()]; suppressed = ['+12485550100'];
  s = JSON.parse((await run()).body);
  check('email still sent', emails.length === 1);
  check('SMS suppressed', texts.length === 0, `got ${texts.length}`);
  check('logged as sms_opted_out', JSON.stringify(s.skipped).includes('sms_opted_out'));

  // R7 — missing / malformed contact info
  console.log('R7 — contact data edge cases');
  reset(); sites = [baseSite({ contact_email: null, contact_phone: null })];
  s = JSON.parse((await run()).body);
  check('no contact → nothing sent', emails.length === 0 && texts.length === 0);
  check('logged as no_contact', JSON.stringify(s.skipped).includes('no_contact'));
  check('NOT marked sent (so it can retry)', sites[0].reminder_sent_for === null);

  reset(); sites = [baseSite({ contact_phone: '12345' })];
  s = JSON.parse((await run()).body);
  check('bad phone → email only, no garbage SMS', emails.length === 1 && texts.length === 0);
  check('logged as bad_phone_format', JSON.stringify(s.skipped).includes('bad_phone_format'));

  reset(); sites = [baseSite({ contact_email: null, contact_phone: '+1 (248) 555-0100' })];
  await run();
  check('phone-only site still texted', texts.length === 1 && emails.length === 0);

  // R8 — Stripe outage degrades gracefully
  console.log('R8 — Stripe unavailable');
  reset(); sites = [baseSite()]; stripeFails = true;
  r = await run();
  check('returns 200 anyway', r.statusCode === 200);
  check('reminder still sent without link', emails.length === 1 && texts.length === 1);
  check('SMS falls back to phone number', (texts[0]?.content || '').includes('248'));

  // R9 — multiple sites in one run
  console.log('R9 — batch of sites');
  reset();
  sites = [baseSite({ site_id: 'a' }), baseSite({ site_id: 'b' }),
           baseSite({ site_id: 'c', billing_status: 'paused' }),
           baseSite({ site_id: 'd', next_due_date: inDays(20) })];
  s = JSON.parse((await run()).body);
  check('only the 2 eligible sites notified', emails.length === 2 && texts.length === 2, `got ${emails.length}/${texts.length}`);
  check('summary counts match', s.emailed === 2 && s.texted === 2);

  // R10 — zero-fee site still reminds (just no link)
  console.log('R10 — $0 fee site');
  reset(); sites = [baseSite({ monthly_fee: 0 })];
  await run();
  check('reminder sent, no checkout link', emails.length === 1 && !(emails[0]?.html || '').includes('checkout.stripe.com'));

  console.log(`\n${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error('HARNESS ERROR:', e); process.exit(1); });
