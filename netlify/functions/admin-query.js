// ========================================================================
// admin-query.js  -  Transparent PostgREST proxy for NUI admin panel
// ========================================================================
// Purpose : Let the admin panel keep using db.from('table') calls after
//           RLS lockdown. This function accepts a PostgREST request spec,
//           re-signs it with the Supabase SERVICE key, and forwards it.
// Auth    : X-Admin-Token header must match NUI_ADMIN_TOKEN env var.
// Scope   : Only tables in ADMIN_TABLES can be queried through this proxy.
// ========================================================================

const ADMIN_TABLES = new Set([
  'crm_contacts', 'agent_logs', 'communications', 'client_sites', 'site_config',
  'identified_visitors', 'push_subscriptions', 'clients', 'invoices', 'leads',
  'orders', 'payments', 'projects', 'proofs', 'push_campaigns', 'sms_campaigns',
  'visitor_auto_emails', 'visitor_page_views'
]);

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, X-Admin-Token',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Content-Type': 'application/json'
};

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: CORS, body: '' };
  }
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers: CORS, body: JSON.stringify({ error: 'POST only' }) };
  }

  const SUPABASE_URL         = process.env.SUPABASE_URL;
  const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;
  const ADMIN_TOKEN          = process.env.NUI_ADMIN_TOKEN;

  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    return { statusCode: 500, headers: CORS, body: JSON.stringify({ error: 'Supabase not configured' }) };
  }

  // Auth — if the env var is set, the header must match
  const supplied = event.headers['x-admin-token'] || event.headers['X-Admin-Token'] || '';
  if (ADMIN_TOKEN && supplied !== ADMIN_TOKEN) {
    return { statusCode: 401, headers: CORS, body: JSON.stringify({ error: 'Unauthorized' }) };
  }

  let spec;
  try {
    spec = JSON.parse(event.body || '{}');
  } catch {
    return { statusCode: 400, headers: CORS, body: JSON.stringify({ error: 'Invalid JSON body' }) };
  }

  const { path, method = 'GET', headers = {}, body = null } = spec;
  if (!path || typeof path !== 'string' || !path.startsWith('/')) {
    return { statusCode: 400, headers: CORS, body: JSON.stringify({ error: 'path required' }) };
  }

  // Extract the table name and verify it's in the allowed list
  const firstSegment = path.replace(/^\//, '').split(/[?\/]/)[0];
  if (firstSegment === 'rpc') {
    return { statusCode: 403, headers: CORS, body: JSON.stringify({ error: 'RPC not allowed via this proxy' }) };
  }
  if (!ADMIN_TABLES.has(firstSegment)) {
    return { statusCode: 403, headers: CORS, body: JSON.stringify({ error: 'Table not in admin proxy scope: ' + firstSegment }) };
  }

  // Forward to Supabase with SERVICE key
  const forwardHeaders = {
    'apikey': SUPABASE_SERVICE_KEY,
    'Authorization': 'Bearer ' + SUPABASE_SERVICE_KEY,
    'Content-Type': headers['Content-Type'] || headers['content-type'] || 'application/json'
  };
  // Pass through Prefer / Range / Accept headers
  for (const h of ['Prefer', 'prefer', 'Range', 'range', 'Accept', 'accept']) {
    if (headers[h]) forwardHeaders[h] = headers[h];
  }

  const forwardUrl = SUPABASE_URL + '/rest/v1' + path;
  const init = { method, headers: forwardHeaders };
  if (body !== null && method !== 'GET' && method !== 'HEAD') {
    init.body = typeof body === 'string' ? body : JSON.stringify(body);
  }

  try {
    const res = await fetch(forwardUrl, init);
    const text = await res.text();
    const responseHeaders = Object.assign({}, CORS);
    const contentRange = res.headers.get('content-range');
    if (contentRange) responseHeaders['Content-Range'] = contentRange;
    return { statusCode: res.status, headers: responseHeaders, body: text };
  } catch (err) {
    return {
      statusCode: 500,
      headers: CORS,
      body: JSON.stringify({ error: 'Proxy fetch failed', detail: err.message })
    };
  }
};
