-- =============================================
-- Client Sites — manual payment due date
-- Run in Supabase SQL Editor. Additive only — safe on live.
-- Rollback: ALTER TABLE client_sites DROP COLUMN next_due_date;
-- =============================================

ALTER TABLE client_sites ADD COLUMN IF NOT EXISTS next_due_date DATE;
-- Manual due date for hosting/maintenance payment.
-- Used for sites billed outside Stripe (billing_status='unbilled') so Faren can
-- track who owes what and when. Once a site is linked to a Stripe subscription,
-- Stripe drives the real billing cycle and this field is informational only.

CREATE INDEX IF NOT EXISTS idx_client_sites_due ON client_sites (next_due_date)
  WHERE next_due_date IS NOT NULL;
