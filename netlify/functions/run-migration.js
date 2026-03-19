// run-migration.js — Permanent SQL execution via Supabase RPC
// Allows Claude/Monty to run any migration without Supabase dashboard access
// Protected: only callable with X-Admin-Token or internally

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, X-Admin-Token',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Content-Type': 'application/json'
};

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return { statusCode: 204, headers: CORS_HEADERS, body: '' };
  if (event.httpMethod !== 'POST') return { statusCode: 405, headers: CORS_HEADERS, body: 'Method not allowed' };

  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;
  const ADMIN_TOKEN = process.env.NUI_ADMIN_TOKEN;

  // Auth check
  const token = event.headers['x-admin-token'] || event.headers['X-Admin-Token'];
  if (ADMIN_TOKEN && token !== ADMIN_TOKEN) {
    return { statusCode: 401, headers: CORS_HEADERS, body: JSON.stringify({ error: 'Unauthorized' }) };
  }

  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    return { statusCode: 500, headers: CORS_HEADERS, body: JSON.stringify({ error: 'Supabase not configured' }) };
  }

  try {
    const { sql } = JSON.parse(event.body || '{}');
    if (!sql) return { statusCode: 400, headers: CORS_HEADERS, body: JSON.stringify({ error: 'sql required' }) };

    // Call the run_migration RPC function (service role only)
    const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/run_migration`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_SERVICE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ sql_query: sql })
    });

    const data = await res.json().catch(() => null);
    return {
      statusCode: res.ok ? 200 : 500,
      headers: CORS_HEADERS,
      body: JSON.stringify(data || { success: false, error: `HTTP ${res.status}` })
    };
  } catch (err) {
    return { statusCode: 500, headers: CORS_HEADERS, body: JSON.stringify({ error: err.message }) };
  }
};
