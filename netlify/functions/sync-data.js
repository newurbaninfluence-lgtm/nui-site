// sync-data.js — Netlify Function
// Bi-directional Supabase data sync (push individual types, pull all)
// GET ?type=all → returns all data for hydration
// POST { type, data, syncedBy } → upserts data to Supabase
// Env vars: SUPABASE_URL, SUPABASE_SERVICE_KEY

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
};

const TABLE_MAP = {
  orders: 'orders',
  clients: 'clients',
  invoices: 'invoices',
  proofs: 'proofs',
  projects: 'projects',
  leads: 'leads',
  crm: 'crm_contacts',
  communications: 'communications',
  services: 'services',
  meetings: 'meetings',
  submissions: 'submissions'
};

// Config-style data stored as key-value in site_config table
const CONFIG_TYPES = ['site_images', 'about', 'portfolio'];

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
    return {
      statusCode: 500,
      headers: CORS_HEADERS,
      body: JSON.stringify({ error: 'Supabase not configured. Set SUPABASE_URL and SUPABASE_SERVICE_KEY.' })
    };
  }

  try {
    // --- GET: Pull all data ---
    if (event.httpMethod === 'GET') {
      const syncData = {};

      // Pull table-based data
      for (const [key, table] of Object.entries(TABLE_MAP)) {
        try {
          const resp = await supabaseFetch(SUPABASE_URL, SUPABASE_SERVICE_KEY,
            `${table}?select=*&order=created_at.desc&limit=1000`
          );
          if (resp.ok) {
            const data = await resp.json();
            syncData[key] = { data, count: data.length, lastSync: new Date().toISOString() };
          } else {
            syncData[key] = { data: [], count: 0, error: `Table ${table}: ${resp.status}` };
          }
        } catch (err) {
          syncData[key] = { data: [], count: 0, error: err.message };
        }
      }

      // Pull config-style data (site_images, about, portfolio)
      for (const configType of CONFIG_TYPES) {
        try {
          const resp = await supabaseFetch(SUPABASE_URL, SUPABASE_SERVICE_KEY,
            `site_config?select=value&key=eq.${configType}&limit=1`
          );
          if (resp.ok) {
            const rows = await resp.json();
            if (rows.length > 0) {
              syncData[configType] = { data: rows[0].value, lastSync: new Date().toISOString() };
            } else {
              syncData[configType] = { data: null, lastSync: new Date().toISOString() };
            }
          } else {
            syncData[configType] = { data: null, error: 'site_config table not ready' };
          }
        } catch (err) {
          syncData[configType] = { data: null, error: err.message };
        }
      }

      return {
        statusCode: 200,
        headers: CORS_HEADERS,
        body: JSON.stringify({ success: true, syncData, syncedAt: new Date().toISOString() })
      };
    }

    // --- POST: Push data ---
    if (event.httpMethod === 'POST') {
      const { type, data, syncedBy } = JSON.parse(event.body || '{}');

      if (!type || data === undefined) {
        return { statusCode: 400, headers: CORS_HEADERS, body: JSON.stringify({ error: 'Missing type or data' }) };
      }

      // Handle config-style data (site_images, about, portfolio)
      if (CONFIG_TYPES.includes(type)) {
        const resp = await supabaseFetch(SUPABASE_URL, SUPABASE_SERVICE_KEY, 'site_config', {
          method: 'POST',
          headers: {
            'Prefer': 'resolution=merge-duplicates,return=minimal'
          },
          body: JSON.stringify({
            key: type,
            value: data,
            updated_at: new Date().toISOString()
          })
        });

        if (!resp.ok) {
          const errBody = await resp.text();
          console.warn(`Config sync for ${type}:`, resp.status, errBody);
          // Don't fail hard — config sync is best-effort until table is created
        }

        return {
          statusCode: 200,
          headers: CORS_HEADERS,
          body: JSON.stringify({ success: true, type, syncedAt: new Date().toISOString() })
        };
      }

      // Handle table-based data
      const table = TABLE_MAP[type];
      if (!table) {
        return { statusCode: 400, headers: CORS_HEADERS, body: JSON.stringify({ error: `Unknown data type: ${type}` }) };
      }

      const records = Array.isArray(data) ? data : [data];

      const enrichedRecords = records.map(r => ({
        ...r,
        synced_at: new Date().toISOString(),
        synced_by: syncedBy || 'system'
      }));

      const resp = await supabaseFetch(SUPABASE_URL, SUPABASE_SERVICE_KEY, table, {
        method: 'POST',
        headers: {
          'Prefer': 'resolution=merge-duplicates,return=minimal'
        },
        body: JSON.stringify(enrichedRecords)
      });

      if (!resp.ok) {
        const errBody = await resp.text();
        throw new Error(`Supabase upsert failed for ${table}: ${resp.status} - ${errBody}`);
      }

      return {
        statusCode: 200,
        headers: CORS_HEADERS,
        body: JSON.stringify({ success: true, type, count: records.length, syncedAt: new Date().toISOString() })
      };
    }

    return { statusCode: 405, headers: CORS_HEADERS, body: JSON.stringify({ error: 'Method not allowed' }) };
  } catch (err) {
    console.error('sync-data error:', err);
    return {
      statusCode: 500,
      headers: CORS_HEADERS,
      body: JSON.stringify({ error: err.message || 'Sync failed' })
    };
  }
};
