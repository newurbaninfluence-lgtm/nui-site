#!/usr/bin/env node
// test-stripe-webhook.js — Phase 1 webhook tests T1–T12
// Run: node scripts/test-stripe-webhook.js
// No network, no Stripe account needed: real HMAC signatures + in-memory Supabase mock.

const crypto = require('crypto');
const path = require('path');
const Module = require('module');

// ── Env for the handler ─────────────────────────────────────────────
const SECRET = 'whsec_test_secret_for_harness';
process.env.STRIPE_WEBHOOK_SECRET = SECRET;
process.env.SUPABASE_URL = 'https://mock.supabase.co';
process.env.SUPABASE_SERVICE_KEY = 'service-key-mock';
process.env.HOSTINGER_EMAIL = 'test@newurbaninfluence.com';
process.env.HOSTINGER_PASSWORD = 'x';
delete process.env.GRACE_PERIOD_DAYS; // default 7 for T1–T11; T12 re-requires with 3

// ── Stub nodemailer (counts sends; works with or without node_modules) ──
const emailLog = [];
const nodemailerStub = { createTransport: () => ({ sendMail: async (o) => { emailLog.push(o); return { messageId: 'test' }; } }) };
const origResolve = Module._resolveFilename;
Module._resolveFilename = function (request, ...args) {
  if (request === 'nodemailer') return 'nodemailer-stub';
  return origResolve.call(this, request, ...args);
};
require.cache['nodemailer-stub'] = { id: 'nodemailer-stub', filename: 'nodemailer-stub', loaded: true, exports: nodemailerStub };

// ── In-memory Supabase mock ─────────────────────────────────────────
const SITE_A = 'aaaaaaaa-0000-0000-0000-000000000001';
const SITE_B = 'bbbbbbbb-0000-0000-0000-000000000002';
const SITE_C = 'cccccccc-0000-0000-0000-000000000003';
let sites = [];
const patchLog = []; // every PATCH to any table

function freshSites() {
  sites = [
    { id: SITE_A, site_id: 'test-site', site_name: 'Test Site', client_id: 'C_A', status: 'active',
      suspended_reason: null, suspended_at: null, billing_status: 'unbilled',
      stripe_customer_id: null, stripe_subscription_id: null, grace_until: null },
    { id: SITE_B, site_id: 'dupe-one', site_name: 'Dupe One', client_id: 'C_DUP', status: 'active',
      suspended_reason: null, suspended_at: null, billing_status: 'unbilled',
      stripe_customer_id: null, stripe_subscription_id: null, grace_until: null },
    { id: SITE_C, site_id: 'dupe-two', site_name: 'Dupe Two', client_id: 'C_DUP', status: 'active',
      suspended_reason: null, suspended_at: null, billing_status: 'unbilled',
      stripe_customer_id: null, stripe_subscription_id: null, grace_until: null }
  ];
}

function matchFilters(row, params) {
  for (const [k, v] of params) {
    if (k === 'select') continue;
    if (v.startsWith('eq.')) { if (String(row[k]) !== v.slice(3)) return false; }
    else if (v.startsWith('neq.')) { if (String(row[k]) === v.slice(4)) return false; }
  }
  return true;
}

global.fetch = async (url, opts = {}) => {
  const u = new URL(url);
  const method = (opts.method || 'GET').toUpperCase();
  if (u.host === 'mock.supabase.co' && u.pathname.startsWith('/rest/v1/')) {
    const table = u.pathname.split('/')[3];
    const params = [...u.searchParams.entries()];
    if (table === 'client_sites' && method === 'GET') {
      const rows = sites.filter(r => matchFilters(r, params));
      return { ok: true, status: 200, json: async () => JSON.parse(JSON.stringify(rows)) };
    }
    if (method === 'PATCH') {
      const body = JSON.parse(opts.body || '{}');
      patchLog.push({ table, params, body });
      if (table === 'client_sites') {
        sites.filter(r => matchFilters(r, params)).forEach(r => Object.assign(r, body));
      }
      return { ok: true, status: 204, json: async () => ({}) };
    }
    return { ok: true, status: 200, json: async () => [] };
  }
  if (u.host === 'api.openphone.com') return { ok: true, status: 200, json: async () => ({}) };
  throw new Error('Unexpected fetch in test: ' + url);
};

// ── Handler + signing helpers ───────────────────────────────────────
const HANDLER_PATH = path.join(__dirname, '..', 'netlify', 'functions', 'stripe-webhook.js');
let handler = require(HANDLER_PATH).handler;

function sign(body, secret = SECRET, t = Math.floor(Date.now() / 1000)) {
  const v1 = crypto.createHmac('sha256', secret).update(`${t}.${body}`).digest('hex');
  return `t=${t},v1=${v1}`;
}
async function fire(eventObj, { sigHeader, secret } = {}) {
  const body = JSON.stringify(eventObj);
  const headers = {};
  const sig = sigHeader !== undefined ? sigHeader : sign(body, secret || SECRET);
  if (sig !== null) headers['stripe-signature'] = sig;
  return handler({ httpMethod: 'POST', headers, body });
}
const site = (id) => sites.find(s => s.id === id);

// ── Test runner ─────────────────────────────────────────────────────
let pass = 0, fail = 0;
function check(name, cond, detail = '') {
  if (cond) { pass++; console.log(`  ✅ ${name}`); }
  else { fail++; console.log(`  ❌ ${name}${detail ? ' — ' + detail : ''}`); }
}
const daysFromNow = (iso) => (new Date(iso) - Date.now()) / 86400000;

(async () => {
  const evCheckout = (over = {}) => ({ type: 'checkout.session.completed', data: { object: Object.assign({
    id: 'cs_test_1', mode: 'subscription', customer: 'cus_TEST1', subscription: 'sub_TEST1',
    customer_email: 'client@example.com', metadata: { site_id: SITE_A, clientId: 'C_A', invoiceId: 'inv_local_1' }
  }, over) } });
  const evPaid = (over = {}) => ({ type: 'invoice.paid', data: { object: Object.assign({
    id: 'in_test_paid', subscription: 'sub_TEST1', customer: 'cus_TEST1'
  }, over) } });
  const evFailed = (over = {}) => ({ type: 'invoice.payment_failed', data: { object: Object.assign({
    id: 'in_test_fail', subscription: 'sub_TEST1', customer: 'cus_TEST1',
    customer_email: 'client@example.com', customer_name: 'Test Client'
  }, over) } });

  // T1 — forged: missing header
  console.log('T1 — forged event, no stripe-signature header');
  freshSites(); patchLog.length = 0;
  let r = await fire(evPaid(), { sigHeader: null });
  check('returns 400', r.statusCode === 400, `got ${r.statusCode}`);
  check('zero DB writes', patchLog.length === 0);

  // T2 — forged: malformed signature (must be 400, not a timingSafeEqual 500)
  console.log('T2 — malformed signature t=1,v1=deadbeef');
  r = await fire(evPaid(), { sigHeader: 't=1,v1=deadbeef' });
  check('returns 400', r.statusCode === 400, `got ${r.statusCode}`);

  // T3 — forged: signed with wrong secret
  console.log('T3 — signed with wrong secret');
  r = await fire(evPaid(), { secret: 'whsec_wrong' });
  check('returns 400', r.statusCode === 400, `got ${r.statusCode}`);
  check('still zero DB writes', patchLog.length === 0);

  // T4 — checkout.session.completed links the site
  console.log('T4 — checkout completes → IDs stored, billing_status=active');
  freshSites(); patchLog.length = 0;
  r = await fire(evCheckout());
  check('returns 200', r.statusCode === 200, `got ${r.statusCode}`);
  check('stripe_customer_id stored', site(SITE_A).stripe_customer_id === 'cus_TEST1');
  check('stripe_subscription_id stored', site(SITE_A).stripe_subscription_id === 'sub_TEST1');
  check('billing_status=active', site(SITE_A).billing_status === 'active');

  // T5 — invoice.paid keeps site current
  console.log('T5 — invoice.paid → active, grace cleared');
  site(SITE_A).billing_status = 'overdue'; site(SITE_A).grace_until = new Date().toISOString();
  r = await fire(evPaid());
  check('returns 200', r.statusCode === 200);
  check('billing_status=active', site(SITE_A).billing_status === 'active');
  check('grace_until cleared', site(SITE_A).grace_until === null);

  // T6 — invoice.paid auto-reactivates nonpayment suspensions (both reason formats)
  console.log('T6 — paid → reactivate when suspended for nonpayment');
  for (const reason of ['payment_overdue', 'Payment overdue — contact New Urban Influence to restore service.']) {
    Object.assign(site(SITE_A), { status: 'suspended', suspended_reason: reason, suspended_at: new Date().toISOString(), billing_status: 'overdue' });
    r = await fire(evPaid());
    check(`reactivated (reason: "${reason.slice(0, 20)}…")`, site(SITE_A).status === 'active' && site(SITE_A).suspended_reason === null);
  }

  // T7 — paid must NOT reactivate a non-payment suspension
  console.log('T7 — paid must NOT reactivate "content dispute" suspension');
  Object.assign(site(SITE_A), { status: 'suspended', suspended_reason: 'content dispute', suspended_at: new Date().toISOString() });
  r = await fire(evPaid());
  check('billing_status=active', site(SITE_A).billing_status === 'active');
  check('status stays suspended', site(SITE_A).status === 'suspended');
  check('reason untouched', site(SITE_A).suspended_reason === 'content dispute');
  Object.assign(site(SITE_A), { status: 'active', suspended_reason: null, suspended_at: null });

  // T8 — payment failed → overdue + grace, no suspension, one email
  console.log('T8 — invoice.payment_failed → overdue + 7d grace, site untouched, 1 dunning email');
  emailLog.length = 0;
  r = await fire(evFailed());
  check('returns 200', r.statusCode === 200);
  check('billing_status=overdue', site(SITE_A).billing_status === 'overdue');
  const g = daysFromNow(site(SITE_A).grace_until);
  check('grace_until ≈ now+7d', g > 6.9 && g < 7.1, `got ${g.toFixed(2)}d`);
  check('site status NOT suspended', site(SITE_A).status === 'active');
  check('exactly 2 emails (client dunning + admin alert)', emailLog.length === 2, `got ${emailLog.length}`);

  // T9 — duplicates are idempotent
  console.log('T9 — duplicate events');
  const graceBefore = site(SITE_A).grace_until;
  emailLog.length = 0;
  await fire(evFailed()); await fire(evFailed());
  check('grace_until unchanged on replay', site(SITE_A).grace_until === graceBefore);
  check('no duplicate dunning emails', emailLog.length === 0, `got ${emailLog.length}`);
  await fire(evPaid()); r = await fire(evPaid());
  check('duplicate paid: 200 + stable state', r.statusCode === 200 && site(SITE_A).billing_status === 'active' && site(SITE_A).grace_until === null);

  // T10 — unresolvable event → 200, zero site writes
  console.log('T10 — unknown subscription resolves to no site');
  patchLog.length = 0;
  r = await fire(evPaid({ subscription: 'sub_UNKNOWN', customer: 'cus_UNKNOWN', id: 'in_unknown' }));
  const siteWrites = patchLog.filter(p => p.table === 'client_sites');
  check('returns 200 (no Stripe retry storm)', r.statusCode === 200);
  check('zero client_sites writes', siteWrites.length === 0, `got ${siteWrites.length}`);

  // T11 — ambiguity guard: clientId matching two sites, no site_id
  console.log('T11 — ambiguous clientId fallback → no linkage');
  patchLog.length = 0;
  r = await fire(evCheckout({ id: 'cs_ambig', customer: 'cus_DUP', subscription: 'sub_DUP', metadata: { clientId: 'C_DUP', invoiceId: '' } }));
  check('returns 200', r.statusCode === 200);
  check('neither dupe site linked', !site(SITE_B).stripe_subscription_id && !site(SITE_C).stripe_subscription_id);

  // T13 — subscription lifecycle sync (customer.subscription.updated)
  console.log('T13 — subscription.updated past_due → overdue+grace (no email); active → recovers');
  freshSites(); emailLog.length = 0;
  await fire(evCheckout()); // link sub_TEST1 first
  emailLog.length = 0;
  const evSub = (status) => ({ type: 'customer.subscription.updated', data: { object: {
    id: 'sub_TEST1', customer: 'cus_TEST1', status: status, metadata: { site_id: SITE_A } } } });
  r = await fire(evSub('past_due'));
  check('past_due → billing_status=overdue', site(SITE_A).billing_status === 'overdue');
  check('grace_until set', !!site(SITE_A).grace_until);
  check('site status untouched', site(SITE_A).status === 'active');
  check('no dunning email from subscription event', emailLog.length === 0, `got ${emailLog.length}`);
  r = await fire(evSub('active'));
  check('active → recovers, grace cleared', site(SITE_A).billing_status === 'active' && site(SITE_A).grace_until === null);

  // T14 — subscription deleted → billing canceled + admin alert, site never suspended
  console.log('T14 — customer.subscription.deleted');
  emailLog.length = 0;
  r = await fire({ type: 'customer.subscription.deleted', data: { object: {
    id: 'sub_TEST1', customer: 'cus_TEST1', status: 'canceled', metadata: { site_id: SITE_A } } } });
  check('returns 200', r.statusCode === 200);
  check('billing_status=canceled', site(SITE_A).billing_status === 'canceled');
  check('site status untouched (never auto-suspend)', site(SITE_A).status === 'active');
  check('exactly 1 admin alert email', emailLog.length === 1, `got ${emailLog.length}`);

  // T15 — refunds & disputes: notify only, zero DB writes
  console.log('T15 — charge.refunded / charge.dispute.created');
  emailLog.length = 0; patchLog.length = 0;
  await fire({ type: 'charge.refunded', data: { object: { id: 'ch_1', amount_refunded: 2700, receipt_email: 'client@example.com' } } });
  await fire({ type: 'charge.dispute.created', data: { object: { id: 'dp_1', charge: 'ch_1', amount: 2700 } } });
  check('2 admin emails', emailLog.length === 2, `got ${emailLog.length}`);
  check('zero DB writes', patchLog.length === 0, `got ${patchLog.length}`);

  // T16 — paused subscriptions (both Stripe pause shapes)
  console.log('T16 — paused: status=paused OR pause_collection → billing paused, no grace, no email');
  freshSites(); await fire(evCheckout()); emailLog.length = 0;
  const evSubFull = (o) => ({ type: 'customer.subscription.updated', data: { object: Object.assign({
    id: 'sub_TEST1', customer: 'cus_TEST1', status: 'active', pause_collection: null, metadata: { site_id: SITE_A } }, o) } });
  r = await fire(evSubFull({ status: 'paused' }));
  check('status=paused → billing_status=paused', site(SITE_A).billing_status === 'paused');
  check('no grace on pause', site(SITE_A).grace_until === null);
  r = await fire(evSubFull({ status: 'active' }));
  check('resume → billing_status=active', site(SITE_A).billing_status === 'active');
  r = await fire(evSubFull({ status: 'active', pause_collection: { behavior: 'void' } }));
  check('pause_collection (status still active) → paused', site(SITE_A).billing_status === 'paused');
  r = await fire(evSubFull({ status: 'past_due', pause_collection: { behavior: 'void' } }));
  check('paused wins over past_due (no dunning while paused)', site(SITE_A).billing_status === 'paused');
  check('no emails from pause events', emailLog.length === 0, `got ${emailLog.length}`);
  r = await fire(evSubFull({}));
  check('unpause → active again', site(SITE_A).billing_status === 'active');

  // T18 — one-time invoice paid via emailed checkout link → admin alert, no site linkage
  console.log('T18 — payment-mode checkout with invoiceId → 1 admin email, no site writes');
  emailLog.length = 0; patchLog.length = 0;
  r = await fire({ type: 'checkout.session.completed', data: { object: {
    id: 'cs_onetime', mode: 'payment', customer: 'cus_ONE', customer_email: 'client@example.com',
    amount_total: 50000, metadata: { invoiceId: 'inv_local_9', clientId: 'C_A' } } } });
  check('returns 200', r.statusCode === 200);
  check('1 admin paid-alert email', emailLog.length === 1, `got ${emailLog.length}`);
  const t18SiteWrites = patchLog.filter(p => p.table === 'client_sites');
  check('no client_sites writes for payment mode', t18SiteWrites.length === 0, `got ${t18SiteWrites.length}`);

  // T16b — dedicated paused/resumed event types (not just .updated)
  console.log('T16b — customer.subscription.paused / .resumed event types');
  r = await fire({ type: 'customer.subscription.paused', data: { object: {
    id: 'sub_TEST1', customer: 'cus_TEST1', status: 'paused', pause_collection: null, metadata: { site_id: SITE_A } } } });
  check('paused event → billing_status=paused', site(SITE_A).billing_status === 'paused');
  r = await fire({ type: 'customer.subscription.resumed', data: { object: {
    id: 'sub_TEST1', customer: 'cus_TEST1', status: 'active', pause_collection: null, metadata: { site_id: SITE_A } } } });
  check('resumed event → billing_status=active', site(SITE_A).billing_status === 'active');

  // T17 — trials
  console.log('T17 — trialing maps to active; trial_will_end notifies admin only');
  r = await fire(evSubFull({ status: 'trialing' }));
  check('trialing → billing_status=active', site(SITE_A).billing_status === 'active');
  emailLog.length = 0; patchLog.length = 0;
  r = await fire({ type: 'customer.subscription.trial_will_end', data: { object: {
    id: 'sub_TEST1', customer: 'cus_TEST1', trial_end: Math.floor(Date.now() / 1000) + 3 * 86400, metadata: { site_id: SITE_A } } } });
  check('returns 200', r.statusCode === 200);
  check('1 admin heads-up email', emailLog.length === 1, `got ${emailLog.length}`);
  const twWrites = patchLog.filter(p => p.table === 'client_sites' && p.body);
  check('zero site writes from trial_will_end', twWrites.length === 0, `got ${twWrites.length}`);

  // T12 — configurable grace period
  console.log('T12 — GRACE_PERIOD_DAYS=3 env override');
  process.env.GRACE_PERIOD_DAYS = '3';
  delete require.cache[require.resolve(HANDLER_PATH)];
  handler = require(HANDLER_PATH).handler;
  freshSites();
  await fire(evCheckout());
  await fire(evFailed());
  const g3 = daysFromNow(site(SITE_A).grace_until);
  check('grace_until ≈ now+3d', g3 > 2.9 && g3 < 3.1, `got ${g3.toFixed(2)}d`);

  console.log(`\n${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error('HARNESS ERROR:', e); process.exit(1); });
