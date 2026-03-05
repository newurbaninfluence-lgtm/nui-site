-- ═══════════════════════════════════════════════════════════════
-- AGENCY TENANT ISOLATION — Add agency_id to all tenant tables
-- Run in Supabase SQL Editor
-- 
-- Matches TENANT_TABLES list in agency-isolation.js exactly.
-- NUI admin data stays agency_id=NULL (untouched).
-- Sub-account data gets agency_id=portal_slug on every insert.
-- ═══════════════════════════════════════════════════════════════

DO $$
DECLARE
  t TEXT;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'clients','orders','invoices','proofs','projects','leads',
    'services','meetings','submissions',
    'crm_contacts','contacts','activity_log','communications',
    'sms_campaigns','sms_drip_queue','sms_replies','sms_suppression',
    'identified_visitors','chat_logs',
    'tasks','approvals','client_sites',
    'retargeting_setups','retargeting_campaigns','retargeting_audiences',
    'geo_grid_scans','push_campaigns','push_subscriptions',
    'visitor_page_views','visitor_auto_emails'
  ]
  LOOP
    -- Skip tables that don't exist yet (some may not be created)
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name=t) THEN
      EXECUTE format(
        'ALTER TABLE %I ADD COLUMN IF NOT EXISTS agency_id TEXT DEFAULT NULL', t
      );
      EXECUTE format(
        'CREATE INDEX IF NOT EXISTS idx_%s_agency ON %I (agency_id)', t, t
      );
    END IF;
  END LOOP;
END $$;

-- Brand theme + tagline on subaccounts
ALTER TABLE agency_subaccounts
  ADD COLUMN IF NOT EXISTS brand_theme     TEXT DEFAULT 'dark',
  ADD COLUMN IF NOT EXISTS company_tagline TEXT;
