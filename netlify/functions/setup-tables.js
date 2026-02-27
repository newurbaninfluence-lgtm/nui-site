// One-time setup — creates all NUI tables in Supabase
// DELETE THIS FILE after running it once
exports.handler = async (event) => {
  const SB_URL = process.env.SUPABASE_URL;
  const SB_KEY = process.env.SUPABASE_SERVICE_KEY;
  
  if (!SB_URL || !SB_KEY) {
    return { statusCode: 500, body: JSON.stringify({ error: 'Missing SUPABASE_URL or SUPABASE_SERVICE_KEY' }) };
  }

  const fetchMod = await import('node-fetch');
  const fetch = fetchMod.default;

  const sql = `
    -- CONTACTS
    CREATE TABLE IF NOT EXISTS contacts (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT,
      phone TEXT,
      company TEXT,
      industry TEXT,
      source TEXT DEFAULT 'manual',
      notes TEXT,
      tags JSONB DEFAULT '[]',
      status TEXT DEFAULT 'active',
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );

    -- JOBS (kanban board)
    CREATE TABLE IF NOT EXISTS jobs (
      id TEXT PRIMARY KEY,
      client_name TEXT NOT NULL,
      client_id TEXT REFERENCES contacts(id) ON DELETE SET NULL,
      title TEXT NOT NULL,
      type TEXT DEFAULT 'branding',
      status TEXT DEFAULT 'new',
      services JSONB DEFAULT '[]',
      notes TEXT,
      priority TEXT DEFAULT 'normal',
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );

    -- ACTIVITY LOG (timeline)
    CREATE TABLE IF NOT EXISTS activity_log (
      id BIGSERIAL PRIMARY KEY,
      type TEXT DEFAULT 'note',
      message TEXT,
      contact_id TEXT REFERENCES contacts(id) ON DELETE CASCADE,
      metadata JSONB DEFAULT '{}',
      created_at TIMESTAMPTZ DEFAULT NOW()
    );

    -- MOODBOARDS
    CREATE TABLE IF NOT EXISTS moodboards (
      id TEXT PRIMARY KEY,
      client_name TEXT,
      client_id TEXT,
      job_id TEXT,
      style_notes TEXT DEFAULT '',
      industry TEXT DEFAULT '',
      items JSONB DEFAULT '[]',
      status TEXT DEFAULT 'draft',
      created_at TIMESTAMPTZ DEFAULT NOW()
    );

    -- BRAND GUIDES
    CREATE TABLE IF NOT EXISTS brand_guides (
      id TEXT PRIMARY KEY,
      client_name TEXT,
      client_id TEXT,
      job_id TEXT,
      business_name TEXT,
      industry TEXT DEFAULT '',
      status TEXT DEFAULT 'draft',
      sections JSONB DEFAULT '{}',
      created_at TIMESTAMPTZ DEFAULT NOW()
    );

    -- PRINT REQUESTS
    CREATE TABLE IF NOT EXISTS print_requests (
      id BIGSERIAL PRIMARY KEY,
      client_name TEXT,
      client_email TEXT,
      product TEXT,
      details TEXT,
      price_shown TEXT DEFAULT 'TBD',
      status TEXT DEFAULT 'new',
      source TEXT DEFAULT 'web',
      created_at TIMESTAMPTZ DEFAULT NOW()
    );

    -- Enable RLS but allow service key full access
    ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
    ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
    ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;
    ALTER TABLE moodboards ENABLE ROW LEVEL SECURITY;
    ALTER TABLE brand_guides ENABLE ROW LEVEL SECURITY;
    ALTER TABLE print_requests ENABLE ROW LEVEL SECURITY;

    -- Service role policies (allow everything for backend functions)
    DO $$ BEGIN
      CREATE POLICY "service_all_contacts" ON contacts FOR ALL USING (true) WITH CHECK (true);
    EXCEPTION WHEN duplicate_object THEN null;
    END $$;
    DO $$ BEGIN
      CREATE POLICY "service_all_jobs" ON jobs FOR ALL USING (true) WITH CHECK (true);
    EXCEPTION WHEN duplicate_object THEN null;
    END $$;
    DO $$ BEGIN
      CREATE POLICY "service_all_activity" ON activity_log FOR ALL USING (true) WITH CHECK (true);
    EXCEPTION WHEN duplicate_object THEN null;
    END $$;
    DO $$ BEGIN
      CREATE POLICY "service_all_moodboards" ON moodboards FOR ALL USING (true) WITH CHECK (true);
    EXCEPTION WHEN duplicate_object THEN null;
    END $$;
    DO $$ BEGIN
      CREATE POLICY "service_all_brands" ON brand_guides FOR ALL USING (true) WITH CHECK (true);
    EXCEPTION WHEN duplicate_object THEN null;
    END $$;
    DO $$ BEGIN
      CREATE POLICY "service_all_prints" ON print_requests FOR ALL USING (true) WITH CHECK (true);
    EXCEPTION WHEN duplicate_object THEN null;
    END $$;
  `;

  try {
    // Execute via Supabase SQL endpoint (requires service key)
    const res = await fetch(`${SB_URL}/rest/v1/rpc/`, {
      method: 'POST',
      headers: {
        'apikey': SB_KEY,
        'Authorization': `Bearer ${SB_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ query: sql })
    });

    // If rpc doesn't work, try the SQL API directly
    if (!res.ok) {
      // Try pg-meta or direct SQL
      const sqlRes = await fetch(`${SB_URL}/pg/query`, {
        method: 'POST',
        headers: {
          'apikey': SB_KEY,
          'Authorization': `Bearer ${SB_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ query: sql })
      });
      
      if (!sqlRes.ok) {
        // Last resort — try individual table creation via REST
        const tables = ['contacts', 'jobs', 'activity_log', 'moodboards', 'brand_guides', 'print_requests'];
        const results = {};
        
        for (const table of tables) {
          try {
            const checkRes = await fetch(`${SB_URL}/rest/v1/${table}?limit=0`, {
              headers: { 'apikey': SB_KEY, 'Authorization': `Bearer ${SB_KEY}` }
            });
            results[table] = checkRes.ok ? 'EXISTS' : `Missing (${checkRes.status})`;
          } catch(e) {
            results[table] = `Error: ${e.message}`;
          }
        }
        
        return {
          statusCode: 200,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            message: 'Could not execute SQL directly. Tables need to be created in Supabase dashboard.',
            sql_to_run: sql,
            table_status: results
          })
        };
      }
    }

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ success: true, message: 'All tables created successfully!' })
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: err.message })
    };
  }
};
