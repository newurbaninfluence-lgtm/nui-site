-- ═══════════════════════════════════════════════════════════════
-- AGENCY TENANT ISOLATION — Add agency_id to all tenant tables
-- Run in Supabase SQL Editor
-- 
-- agency-isolation.js patches every query with .eq('agency_id', slug)
-- but the column doesn't exist yet. After running this:
--   /app/ (NUI admin) → agency_id stays NULL → your data untouched
--   /portal/?agency=SLUG → isolation injects agency_id on every
--     INSERT and filters every SELECT
-- ═══════════════════════════════════════════════════════════════

DO $$
DECLARE
  t TEXT;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'clients','orders','invoices','proofs','projects','leads',
    'services','meetings','submissions',
    'crm_contacts','activity_log','communications',
    'sms_campaigns','sms_drip_queue',
    'identified_visitors','chat_logs','contacts'
  ]
  LOOP
    EXECUTE format(
      'ALTER TABLE %I ADD COLUMN IF NOT EXISTS agency_id TEXT DEFAULT NULL', t
    );
    EXECUTE format(
      'CREATE INDEX IF NOT EXISTS idx_%s_agency ON %I (agency_id)', t, t
    );
  END LOOP;
END $$;

-- Brand theme + tagline on subaccounts
ALTER TABLE agency_subaccounts
  ADD COLUMN IF NOT EXISTS brand_theme     TEXT DEFAULT 'dark',
  ADD COLUMN IF NOT EXISTS company_tagline TEXT;
