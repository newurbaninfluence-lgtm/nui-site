// ========================================================================
// admin-db.js  -  Reroutes Supabase admin-table fetches through admin-query
// ========================================================================
// Load order (in /app/index.html):
//   1. env.js                  → defines window.SUPABASE_URL
//   2. supabase-js CDN         → defines global `supabase`
//   3. supabase-client.js      → creates `db` client with anon key
//   4. admin-auth.js           → defines NuiAdminAuth + patches fetch ONCE
//   5. admin-db.js  (this)     → patches fetch AGAIN (outer wrapper)
//
// What it does: any fetch to `${SUPABASE_URL}/rest/v1/{admin_table}` is
// rewritten to POST /.netlify/functions/admin-query with the request spec
// in the body. The function re-signs it with the service key and forwards
// it. Result: db.from('crm_contacts').select() still works after lockdown,
// but the request is actually going through the service-key proxy.
//
// Non-admin tables (e.g. public views) pass through unchanged.
// ========================================================================

(function() {
  if (!window.SUPABASE_URL) {
    console.warn('[admin-db] SUPABASE_URL not set, skipping fetch patch');
    return;
  }

  const ADMIN_TABLES = new Set([
    'crm_contacts', 'agent_logs', 'communications', 'client_sites', 'site_config',
    'identified_visitors', 'push_subscriptions', 'clients', 'invoices', 'leads',
    'orders', 'payments', 'projects', 'proofs', 'push_campaigns', 'sms_campaigns',
    'visitor_auto_emails', 'visitor_page_views'
  ]);

  const SUPABASE_REST_PREFIX = window.SUPABASE_URL.replace(/\/$/, '') + '/rest/v1/';
  const PROXY_ENDPOINT = '/.netlify/functions/admin-query';
  const _originalFetch = window.fetch.bind(window);

  window.fetch = function(input, init) {
    // Extract URL as string (handle Request objects too)
    let urlStr = null;
    if (typeof input === 'string') {
      urlStr = input;
    } else if (input && typeof input.url === 'string') {
      urlStr = input.url;
    }

    // Not a Supabase REST call → pass through
    if (!urlStr || !urlStr.startsWith(SUPABASE_REST_PREFIX)) {
      return _originalFetch(input, init);
    }

    // Extract the path after /rest/v1 (keep the leading slash)
    const pathWithQuery = '/' + urlStr.substring(SUPABASE_REST_PREFIX.length);
    const tableName = pathWithQuery.replace(/^\//, '').split(/[?\/]/)[0];

    // Not an admin table → let it pass through unchanged
    if (!ADMIN_TABLES.has(tableName)) {
      return _originalFetch(input, init);
    }

    // Build the request spec for the proxy
    const origOptions = init || {};
    const origMethod = (origOptions.method || 'GET').toUpperCase();
    const origHeaders = origOptions.headers || {};

    // Normalize header names to a plain object we can serialize
    const headerBag = {};
    if (origHeaders instanceof Headers) {
      origHeaders.forEach(function(value, key) { headerBag[key] = value; });
    } else if (Array.isArray(origHeaders)) {
      origHeaders.forEach(function(pair) { headerBag[pair[0]] = pair[1]; });
    } else {
      Object.keys(origHeaders).forEach(function(k) { headerBag[k] = origHeaders[k]; });
    }

    // Pass through only the PostgREST-relevant headers; drop client auth
    const passThrough = {};
    ['Prefer', 'prefer', 'Range', 'range', 'Accept', 'accept',
     'Content-Type', 'content-type'].forEach(function(h) {
      if (headerBag[h] !== undefined) passThrough[h] = headerBag[h];
    });

    let origBody = null;
    if (origOptions.body !== undefined && origOptions.body !== null) {
      origBody = typeof origOptions.body === 'string'
        ? origOptions.body
        : JSON.stringify(origOptions.body);
    }

    const proxyBody = JSON.stringify({
      path: pathWithQuery,
      method: origMethod,
      headers: passThrough,
      body: origBody
    });

    const token = (window.NuiAdminAuth && window.NuiAdminAuth.getToken()) || '';
    const proxyHeaders = { 'Content-Type': 'application/json' };
    if (token) proxyHeaders['X-Admin-Token'] = token;

    return _originalFetch(PROXY_ENDPOINT, {
      method: 'POST',
      headers: proxyHeaders,
      body: proxyBody
    });
  };

  console.log('[admin-db] ✅ Rerouting ' + ADMIN_TABLES.size +
              ' admin tables through ' + PROXY_ENDPOINT);
})();
