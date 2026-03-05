// sync-data.js — Netlify Function
// Bi-directional Supabase data sync using site_config as universal store
// GET ?type=all → returns all data
// POST { type, data, syncedBy } → upserts data
// Env vars: SUPABASE_URL, SUPABASE_SERVICE_KEY

const { requireAdmin } = require('./utils/security');

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': 'https://newurbaninfluence.com',
  'Access-Control-Allow-Headers': 'Content-Type, X-Admin-Token',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
};

// ALL data types stored in site_config as key-value JSONB
const ALL_TYPES = [
  'orders', 'clients', 'invoices', 'subscriptions',
  'proofs', 'projects', 'leads', 'services',
  'meetings', 'submissions',
  'designer_messages', 'client_messages',
  'site_images', 'about', 'portfolio',
  'stripe_settings', 'integrations', 'analytics',
  'crm', 'comm_hub'
];

async function supabaseFetch(url, serviceKey, path, options = {}) {
  const { headers: extraHeaders, ...restOptions } = options;
  return fetch(`${url}/rest/v1/${path}`, {
    headers: {
      'apikey': serviceKey,
      'Authorization': `Bearer ${serviceKey}`,
      'Content-Type': 'application/json',
      ...(extraHeaders || {})
    },
    ...restOptions
  });
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
    // --- GET: Pull all data ---
    if (event.httpMethod === 'GET') {
      const syncData = {};
      const agency_id = event.queryStringParameters?.agency_id || null;

      // Scope keys by agency_id — tenants get "clients:detroit-creative" etc.
      const typeList = ALL_TYPES.map(t => {
        const key = agency_id ? `${t}:${agency_id}` : t;
        return `"${key}"`;
      }).join(',');
      const resp = await supabaseFetch(SUPABASE_URL, SUPABASE_SERVICE_KEY,
        `site_config?select=key,value&key=in.(${typeList})`
      );

      if (resp.ok) {
        const rows = await resp.json();
        const rowMap = {};
        rows.forEach(r => {
          // Strip agency suffix — "clients:detroit-creative" → "clients"
          const baseKey = agency_id ? r.key.replace(`:${agency_id}`, '') : r.key;
          rowMap[baseKey] = r.value;
        });

        ALL_TYPES.forEach(type => {
          if (rowMap[type] !== undefined) {
            syncData[type] = {
              data: rowMap[type],
              count: Array.isArray(rowMap[type]) ? rowMap[type].length : 1,
              lastSync: new Date().toISOString()
            };
          } else {
            syncData[type] = { data: Array.isArray([]) ? [] : null, count: 0 };
          }
        });
      } else {
        const errText = await resp.text();
        console.warn('Bulk fetch failed:', resp.status, errText);
        ALL_TYPES.forEach(type => {
          syncData[type] = { data: [], count: 0, error: `${resp.status}` };
        });
      }

      return { statusCode: 200, headers: CORS_HEADERS,
        body: JSON.stringify({ success: true, syncData, syncedAt: new Date().toISOString() }) };
    }

    // --- POST: Push data ---
    if (event.httpMethod === 'POST') {
      const { type, data, syncedBy, agency_id } = JSON.parse(event.body || '{}');
      if (!type || data === undefined) {
        return { statusCode: 400, headers: CORS_HEADERS,
          body: JSON.stringify({ error: 'Missing type or data' }) };
      }

      if (!ALL_TYPES.includes(type)) {
        return { statusCode: 400, headers: CORS_HEADERS,
          body: JSON.stringify({ error: `Unknown type: ${type}` }) };
      }

      // Scope key by agency_id — tenants get "clients:detroit-creative", NUI gets "clients"
      const scopedKey = agency_id ? `${type}:${agency_id}` : type;

      // Upsert into site_config
      const resp = await supabaseFetch(SUPABASE_URL, SUPABASE_SERVICE_KEY, 'site_config', {
        method: 'POST',
        headers: { 'Prefer': 'resolution=merge-duplicates,return=minimal' },
        body: JSON.stringify({
          key: scopedKey,
          value: data,
          updated_at: new Date().toISOString()
        })
      });

      if (!resp.ok) {
        const errBody = await resp.text();
        throw new Error(`Upsert failed for ${type}: ${resp.status} - ${errBody}`);
      }

      return { statusCode: 200, headers: CORS_HEADERS,
        body: JSON.stringify({
          success: true, type,
          count: Array.isArray(data) ? data.length : 1,
          syncedAt: new Date().toISOString()
        })
      };
    }

    return { statusCode: 405, headers: CORS_HEADERS,
      body: JSON.stringify({ error: 'Method not allowed' }) };
  } catch (err) {
    console.error('sync-data error:', err);
    return { statusCode: 500, headers: CORS_HEADERS,
      body: JSON.stringify({ error: err.message || 'Sync failed' }) };
  }
};
