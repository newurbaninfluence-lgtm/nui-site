// sync-data.js — Netlify Function
// Bi-directional Supabase data sync
// GET ?type=all → returns all data for hydration
// POST { type, data, syncedBy } → upserts data to Supabase
// Env vars: SUPABASE_URL, SUPABASE_SERVICE_KEY

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
};

// JSONB tables: store full JS object in `data` column
const JSONB_TABLES = {
  orders: 'orders',
  clients: 'clients',
  invoices: 'invoices',
  subscriptions: 'subscriptions',
  proofs: 'proofs',
  projects: 'projects',
  leads: 'leads',
  services: 'services',
  meetings: 'meetings',
  submissions: 'submissions'
};

// Config stored as key-value in site_config
const CONFIG_TYPES = ['site_images', 'about', 'portfolio',
  'stripe_settings', 'integrations', 'analytics',
  'crm', 'comm_hub'];

async function supabaseFetch(url, serviceKey, path, options = {}) {
  const resp = await fetch(`${url}/rest/v1/${path}`, {
    headers: {
      'apikey': serviceKey,
      'Authorization': `Bearer ${serviceKey}`,
      'Content-Type': 'application/json',
      ...options.headers
    },
    ...options
  });
  return resp;
}

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: CORS_HEADERS, body: '' };
  }

  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    return { statusCode: 500, headers: CORS_HEADERS,
      body: JSON.stringify({ error: 'Supabase not configured' }) };
  }

  try {

    // --- GET: Pull all data for hydration ---
    if (event.httpMethod === 'GET') {
      const syncData = {};

      for (const [key, table] of Object.entries(JSONB_TABLES)) {
        try {
          const resp = await supabaseFetch(SUPABASE_URL, SUPABASE_SERVICE_KEY,
            `${table}?select=id,data&order=id.desc&limit=1000`
          );
          if (resp.ok) {
            const rows = await resp.json();
            // Unwrap: each row is {id, data:{...}} → return the data object with id
            const unwrapped = rows.map(r => ({ id: r.id, ...r.data }));
            syncData[key] = { data: unwrapped, count: unwrapped.length, lastSync: new Date().toISOString() };
          } else {
            syncData[key] = { data: [], count: 0, error: `${table}: ${resp.status}` };
          }
        } catch (err) {
          syncData[key] = { data: [], count: 0, error: err.message };
        }
      }

      // Pull config data
      for (const configType of CONFIG_TYPES) {
        try {
          const resp = await supabaseFetch(SUPABASE_URL, SUPABASE_SERVICE_KEY,
            `site_config?select=value&key=eq.${configType}&limit=1`
          );
          if (resp.ok) {
            const rows = await resp.json();
            syncData[configType] = { data: rows.length > 0 ? rows[0].value : null, lastSync: new Date().toISOString() };
          } else {
            syncData[configType] = { data: null, error: `site_config: ${resp.status}` };
          }
        } catch (err) {
          syncData[configType] = { data: null, error: err.message };
        }
      }

      return { statusCode: 200, headers: CORS_HEADERS,
        body: JSON.stringify({ success: true, syncData, syncedAt: new Date().toISOString() }) };
    }

    // --- POST: Push data to Supabase ---
    if (event.httpMethod === 'POST') {
      const { type, data, syncedBy } = JSON.parse(event.body || '{}');
      if (!type || data === undefined) {
        return { statusCode: 400, headers: CORS_HEADERS,
          body: JSON.stringify({ error: 'Missing type or data' }) };
      }

      // Config types → site_config key-value table
      if (CONFIG_TYPES.includes(type)) {
        const resp = await supabaseFetch(SUPABASE_URL, SUPABASE_SERVICE_KEY, 'site_config', {
          method: 'POST',
          headers: { 'Prefer': 'resolution=merge-duplicates,return=minimal' },
          body: JSON.stringify({ key: type, value: data, updated_at: new Date().toISOString() })
        });
        if (!resp.ok) {
          const errBody = await resp.text();
          console.warn(`Config sync ${type}:`, resp.status, errBody);
        }
        return { statusCode: 200, headers: CORS_HEADERS,
          body: JSON.stringify({ success: true, type, syncedAt: new Date().toISOString() }) };
      }

      // JSONB tables → wrap each record as {id, data, synced_at, synced_by}
      const table = JSONB_TABLES[type];
      if (!table) {
        return { statusCode: 400, headers: CORS_HEADERS,
          body: JSON.stringify({ error: `Unknown type: ${type}` }) };
      }

      const records = Array.isArray(data) ? data : [data];
      const wrapped = records.map(r => ({
        id: r.id,
        data: r,
        synced_at: new Date().toISOString(),
        synced_by: syncedBy || 'system'
      }));

      const resp = await supabaseFetch(SUPABASE_URL, SUPABASE_SERVICE_KEY, table, {
        method: 'POST',
        headers: { 'Prefer': 'resolution=merge-duplicates,return=minimal' },
        body: JSON.stringify(wrapped)
      });

      if (!resp.ok) {
        const errBody = await resp.text();
        throw new Error(`Upsert failed ${table}: ${resp.status} - ${errBody}`);
      }

      return { statusCode: 200, headers: CORS_HEADERS,
        body: JSON.stringify({ success: true, type, count: records.length, syncedAt: new Date().toISOString() }) };
    }

    return { statusCode: 405, headers: CORS_HEADERS,
      body: JSON.stringify({ error: 'Method not allowed' }) };
  } catch (err) {
    console.error('sync-data error:', err);
    return { statusCode: 500, headers: CORS_HEADERS,
      body: JSON.stringify({ error: err.message || 'Sync failed' }) };
  }
};
