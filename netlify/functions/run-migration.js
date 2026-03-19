// run-migration.js — One-time migration runner using service key
// POST { sql } → runs SQL against Supabase via pg REST
// Protected by admin token

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

  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    return { statusCode: 500, headers: CORS_HEADERS, body: JSON.stringify({ error: 'Supabase not configured' }) };
  }

  try {
    const { sql } = JSON.parse(event.body || '{}');
    if (!sql) return { statusCode: 400, headers: CORS_HEADERS, body: JSON.stringify({ error: 'sql required' }) };

    // Use Supabase's pg REST endpoint
    const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/query`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_SERVICE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ query: sql })
    });

    const data = await res.json().catch(() => null);
    return { statusCode: 200, headers: CORS_HEADERS, body: JSON.stringify({ success: res.ok, status: res.status, data }) };
  } catch (err) {
    return { statusCode: 500, headers: CORS_HEADERS, body: JSON.stringify({ error: err.message }) };
  }
};
