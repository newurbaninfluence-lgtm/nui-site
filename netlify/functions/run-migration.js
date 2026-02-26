// run-migration.js — One-time function to create RB2B tables
// Call POST with { "run": true } to execute

exports.handler = async (event) => {
  const CORS = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'Content-Type', 'Content-Type': 'application/json' };
  if (event.httpMethod !== 'POST') return { statusCode: 405, headers: CORS, body: '{}' };

  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY;
  const headers = { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}`, 'Content-Type': 'application/json', 'Prefer': 'return=minimal' };

  const results = [];

  // Test if tables exist by trying to select from them
  const tables = ['identified_visitors', 'visitor_page_views'];
  for (const t of tables) {
    const r = await fetch(`${SUPABASE_URL}/rest/v1/${t}?select=id&limit=1`, { headers });
    results.push({ table: t, status: r.status, exists: r.ok });
  }

  // If tables don't exist, try creating via rpc (if available)
  // Supabase doesn't support CREATE TABLE via REST — need SQL editor
  // But we CAN check what's available
  const rpcTest = await fetch(`${SUPABASE_URL}/rest/v1/rpc/`, { headers });
  results.push({ rpc_endpoint: rpcTest.status });

  return { statusCode: 200, headers: CORS, body: JSON.stringify({ results, note: 'If tables show 404, run the SQL migration in Supabase dashboard' }) };
};
