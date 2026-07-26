// client-portal-data.js — authenticated, CLIENT-SCOPED portal data.
//
// Replaces the client portal's reliance on sync-data (which dumps the entire
// business dataset to anyone). A client proves identity via Supabase JWT,
// email+password, or a signed session token, and receives ONLY:
//   their client record · their websites · their orders/invoices/projects/proofs
//   · their message history
//
// Nothing here can read another client's data: every collection is filtered by
// the authenticated client's id server-side, after identity is verified.
//
// Env: SUPABASE_URL, SUPABASE_SERVICE_KEY, CLIENT_SESSION_SECRET (or ADMIN_SECRET)

const { authenticateClient, issueSessionToken, findClientByEmail, readBlob, sbHeaders } = require('./utils/client-auth');
const { maskEmail } = require('./utils/log-safe');

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
};

// Strip anything a client should never receive.
function safeClient(c) {
  if (!c) return null;
  const { password, portal_password, notes, internalNotes, ...rest } = c;
  return rest;
}

const belongsTo = (row, id) =>
  String(row?.clientId ?? row?.client_id ?? '') === String(id);

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return { statusCode: 204, headers: CORS, body: '' };
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers: CORS, body: JSON.stringify({ error: 'Method not allowed' }) };
  }
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_KEY) {
    return { statusCode: 500, headers: CORS, body: JSON.stringify({ error: 'Database not configured' }) };
  }

  let body = {};
  try { body = JSON.parse(event.body || '{}'); } catch (e) { /* empty */ }

  try {
    const auth = await authenticateClient(event, body);
    if (!auth) {
      return { statusCode: 401, headers: CORS, body: JSON.stringify({ error: 'Invalid credentials' }) };
    }

    const client = await findClientByEmail(auth.email);
    if (!client) {
      return { statusCode: 404, headers: CORS, body: JSON.stringify({ error: 'No client account found for this email' }) };
    }
    if (client.blocked) {
      return { statusCode: 403, headers: CORS, body: JSON.stringify({ error: 'Account is inactive — please contact us.' }) };
    }

    const id = client.id;

    // ── Their websites (relational table, filtered by client_id) ──
    let sites = [];
    try {
      const r = await fetch(
        `${process.env.SUPABASE_URL}/rest/v1/client_sites`
        + `?select=id,site_id,site_name,domain,plan,monthly_fee,status,billing_status,next_due_date,stripe_subscription_id`
        + `&client_id=eq.${encodeURIComponent(id)}`,
        { headers: sbHeaders() }
      );
      if (r.ok) sites = await r.json();
    } catch (e) { console.warn('site fetch failed:', e.message); }

    // ── Their records out of the synced blobs ──
    const [orders, invoices, projects, proofs] = await Promise.all([
      readBlob('orders'), readBlob('invoices'), readBlob('projects'), readBlob('proofs')
    ]);
    const pick = (arr) => Array.isArray(arr) ? arr.filter(r => belongsTo(r, id)) : [];

    // ── Their message history (CRM), matched on their email ──
    let messages = [];
    try {
      const cr = await fetch(
        `${process.env.SUPABASE_URL}/rest/v1/crm_contacts?select=id&email=eq.${encodeURIComponent(auth.email)}&limit=1`,
        { headers: sbHeaders() }
      );
      const contacts = cr.ok ? await cr.json() : [];
      if (contacts[0]?.id) {
        const mr = await fetch(
          `${process.env.SUPABASE_URL}/rest/v1/communications`
          + `?select=id,channel,direction,subject,body,created_at`
          + `&contact_id=eq.${encodeURIComponent(contacts[0].id)}`
          + `&order=created_at.desc&limit=50`,
          { headers: sbHeaders() }
        );
        if (mr.ok) messages = await mr.json();
      }
    } catch (e) { console.warn('message fetch failed:', e.message); }

    console.log(`client-portal-data: ${maskEmail(auth.email)} via ${auth.via} — ${sites.length} sites`);

    return {
      statusCode: 200,
      headers: CORS,
      body: JSON.stringify({
        success: true,
        via: auth.via,
        session_token: issueSessionToken(auth.email),
        client: safeClient(client),
        sites,
        orders: pick(orders),
        invoices: pick(invoices),
        projects: pick(projects),
        proofs: pick(proofs),
        messages
      })
    };
  } catch (err) {
    console.error('client-portal-data error:', err);
    return { statusCode: 500, headers: CORS, body: JSON.stringify({ error: 'Could not load your account' }) };
  }
};
