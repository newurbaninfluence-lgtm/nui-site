-- =============================================
-- Client Sites — Stripe billing linkage (Phase 1)
-- Run in Supabase SQL Editor. Additive only — safe to run on live.
-- Rollback: DROP INDEX idx_client_sites_stripe_sub, idx_client_sites_stripe_cust;
--           ALTER TABLE client_sites DROP COLUMN stripe_customer_id,
--             DROP COLUMN stripe_subscription_id, DROP COLUMN billing_status,
--             DROP COLUMN grace_until;
-- =============================================

ALTER TABLE client_sites ADD COLUMN IF NOT EXISTS stripe_customer_id     TEXT;
ALTER TABLE client_sites ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT;
ALTER TABLE client_sites ADD COLUMN IF NOT EXISTS billing_status         TEXT DEFAULT 'unbilled';
-- billing_status values: 'unbilled' (legacy/no subscription yet) | 'active' (incl. trialing)
--   | 'overdue' | 'paused' (Stripe pause_collection or paused status) | 'canceled' (subscription deleted)
-- Phase 2 cron rule: ONLY 'overdue' past grace_until may auto-suspend. Never 'unbilled' or 'paused'.
-- NOTE (Phase 2 rule): sites with billing_status='unbilled' must NEVER be auto-suspended.
ALTER TABLE client_sites ADD COLUMN IF NOT EXISTS grace_until            TIMESTAMPTZ;

-- One site per Stripe subscription (partial: legacy NULLs don't collide)
CREATE UNIQUE INDEX IF NOT EXISTS idx_client_sites_stripe_sub
  ON client_sites (stripe_subscription_id) WHERE stripe_subscription_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_client_sites_stripe_cust
  ON client_sites (stripe_customer_id) WHERE stripe_customer_id IS NOT NULL;

-- =============================================
-- STEP 2 (run separately, ONLY after confirming the status-check snippet
-- embedded in deployed client sites selects specific columns and not '*'):
-- trims the anon public-read surface so billing fields, fees, and Netlify IDs
-- are not publicly readable. Admin panel is unaffected (it reads via the
-- admin-query service-role proxy).
--
-- REVOKE SELECT ON client_sites FROM anon;
-- GRANT SELECT (id, site_id, status, suspended_reason) ON client_sites TO anon;
-- =============================================
