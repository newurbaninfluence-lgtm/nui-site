// TEMPORARY — Creates the jobs table, then delete this file
exports.handler = async (event) => {
  const headers = { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' };
  
  const SB_URL = process.env.SUPABASE_URL;
  const SB_KEY = process.env.SUPABASE_SERVICE_KEY;
  
  if (!SB_URL || !SB_KEY) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: 'No Supabase config' }) };
  }

  const fetchMod = await import('node-fetch');
  const fetch = fetchMod.default;

  // Check if jobs table already exists by trying a select
  try {
    const checkRes = await fetch(`${SB_URL}/rest/v1/jobs?select=id&limit=1`, {
      headers: { 'apikey': SB_KEY, 'Authorization': `Bearer ${SB_KEY}` }
    });
    if (checkRes.ok) {
      return { statusCode: 200, headers, body: JSON.stringify({ message: 'jobs table already exists', status: 'ok' }) };
    }
  } catch(e) {}

  // Table doesn't exist — need to create via SQL
  // Use the Supabase Management API pg endpoint
  // Since we can't run DDL via PostgREST, return SQL for manual execution
  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({
      message: 'jobs table does not exist yet',
      status: 'needs_creation',
      sql: `CREATE TABLE IF NOT EXISTS jobs (
  id text PRIMARY KEY,
  client_name text,
  client_id uuid,
  title text NOT NULL,
  type text DEFAULT 'branding',
  status text DEFAULT 'new',
  services text[] DEFAULT ARRAY[]::text[],
  notes text,
  priority text DEFAULT 'normal',
  price text,
  paid text,
  retainer text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "service_all" ON jobs FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "anon_read" ON jobs FOR SELECT TO anon USING (true);`
    })
  };
};
