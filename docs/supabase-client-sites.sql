-- =============================================
-- NUI Client Sites — Supabase Migration
-- Run this in Supabase SQL Editor
-- =============================================

CREATE TABLE IF NOT EXISTS client_sites (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id TEXT NOT NULL,
  client_name TEXT NOT NULL,
  site_name TEXT NOT NULL,
  domain TEXT,
  netlify_site_id TEXT,
  github_repo TEXT,
  plan TEXT DEFAULT 'basic',
  monthly_fee NUMERIC DEFAULT 0,
  status TEXT DEFAULT 'active',
  last_deployed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  notes TEXT
);

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_client_sites_client ON client_sites(client_id);
CREATE INDEX IF NOT EXISTS idx_client_sites_status ON client_sites(status);

-- RLS policies
ALTER TABLE client_sites ENABLE ROW LEVEL SECURITY;

-- Admin can do everything
CREATE POLICY "admin_full_access" ON client_sites
  FOR ALL USING (true) WITH CHECK (true);

-- Auto-update timestamp
CREATE OR REPLACE FUNCTION update_client_sites_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER client_sites_updated
  BEFORE UPDATE ON client_sites
  FOR EACH ROW
  EXECUTE FUNCTION update_client_sites_timestamp();
