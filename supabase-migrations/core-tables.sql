-- ============================================
-- NUI Core Tables — Flexible JSONB storage
-- Each table: id (PK) + data (full JS object) + metadata
-- Run in Supabase SQL Editor
-- ============================================

-- CLIENTS
CREATE TABLE IF NOT EXISTS clients (
  id BIGINT PRIMARY KEY,
  data JSONB NOT NULL DEFAULT '{}',
  synced_at TIMESTAMPTZ DEFAULT now(),
  synced_by TEXT DEFAULT 'system'
);

-- ORDERS
CREATE TABLE IF NOT EXISTS orders (
  id BIGINT PRIMARY KEY,
  data JSONB NOT NULL DEFAULT '{}',
  synced_at TIMESTAMPTZ DEFAULT now(),
  synced_by TEXT DEFAULT 'system'
);

-- INVOICES
CREATE TABLE IF NOT EXISTS invoices (
  id BIGINT PRIMARY KEY,
  data JSONB NOT NULL DEFAULT '{}',
  synced_at TIMESTAMPTZ DEFAULT now(),
  synced_by TEXT DEFAULT 'system'
);

-- SUBSCRIPTIONS
CREATE TABLE IF NOT EXISTS subscriptions (
  id BIGINT PRIMARY KEY,
  data JSONB NOT NULL DEFAULT '{}',
  synced_at TIMESTAMPTZ DEFAULT now(),
  synced_by TEXT DEFAULT 'system'
);

-- PROOFS
CREATE TABLE IF NOT EXISTS proofs (
  id BIGINT PRIMARY KEY,
  data JSONB NOT NULL DEFAULT '{}',
  synced_at TIMESTAMPTZ DEFAULT now(),
  synced_by TEXT DEFAULT 'system'
);

-- PROJECTS
CREATE TABLE IF NOT EXISTS projects (
  id BIGINT PRIMARY KEY,
  data JSONB NOT NULL DEFAULT '{}',
  synced_at TIMESTAMPTZ DEFAULT now(),
  synced_by TEXT DEFAULT 'system'
);

-- LEADS
CREATE TABLE IF NOT EXISTS leads (
  id BIGINT PRIMARY KEY,
  data JSONB NOT NULL DEFAULT '{}',
  synced_at TIMESTAMPTZ DEFAULT now(),
  synced_by TEXT DEFAULT 'system'
);

-- SERVICES
CREATE TABLE IF NOT EXISTS services (
  id BIGINT PRIMARY KEY,
  data JSONB NOT NULL DEFAULT '{}',
  synced_at TIMESTAMPTZ DEFAULT now(),
  synced_by TEXT DEFAULT 'system'
);

-- MEETINGS
CREATE TABLE IF NOT EXISTS meetings (
  id BIGINT PRIMARY KEY,
  data JSONB NOT NULL DEFAULT '{}',
  synced_at TIMESTAMPTZ DEFAULT now(),
  synced_by TEXT DEFAULT 'system'
);

-- SUBMISSIONS
CREATE TABLE IF NOT EXISTS submissions (
  id BIGINT PRIMARY KEY,
  data JSONB NOT NULL DEFAULT '{}',
  synced_at TIMESTAMPTZ DEFAULT now(),
  synced_by TEXT DEFAULT 'system'
);

-- SITE CONFIG (key-value for settings, images, about, portfolio)
CREATE TABLE IF NOT EXISTS site_config (
  key TEXT PRIMARY KEY,
  value JSONB,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- RLS: Enable with full access (service_role handles auth)
DO $$ 
DECLARE t TEXT;
BEGIN
  FOREACH t IN ARRAY ARRAY['clients','orders','invoices','subscriptions','proofs','projects','leads','services','meetings','submissions','site_config']
  LOOP
    EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY', t);
    EXECUTE format('CREATE POLICY IF NOT EXISTS "%s_full" ON %I FOR ALL USING (true) WITH CHECK (true)', t, t);
  END LOOP;
END $$;
