-- =============================================
-- Site admin-login credentials locker (per client site)
-- SECURITY: unlike client_sites (public read for the status snippets),
-- this table has RLS ON with ZERO policies — service_role only.
-- All access flows through the admin-query proxy behind X-Admin-Token.
-- Never add an anon policy to this table.
-- =============================================

CREATE TABLE IF NOT EXISTS site_credentials (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  site_id UUID NOT NULL UNIQUE REFERENCES client_sites(id) ON DELETE CASCADE,
  login_url TEXT,
  username TEXT,
  password TEXT,
  notes TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE site_credentials ENABLE ROW LEVEL SECURITY;
-- deliberately NO policies: anon and authenticated get nothing; service_role bypasses.

CREATE INDEX IF NOT EXISTS idx_site_credentials_site ON site_credentials(site_id);
