-- =============================================
-- Client site payment reminders — contact info + send tracking
-- Run in Supabase SQL Editor. Additive only — safe on live.
-- Rollback: ALTER TABLE client_sites
--   DROP COLUMN contact_email, DROP COLUMN contact_phone,
--   DROP COLUMN reminder_sent_for, DROP COLUMN reminder_sent_at, DROP COLUMN reminders_enabled;
-- =============================================

-- Who to notify about THIS site (per-site, so one client with two sites can
-- route each to a different contact). client_id is null on most rows, so we
-- never guess the recipient — the reminder job only sends where these are set.
ALTER TABLE client_sites ADD COLUMN IF NOT EXISTS contact_email TEXT;
ALTER TABLE client_sites ADD COLUMN IF NOT EXISTS contact_phone TEXT;

-- Per-site kill switch for reminders (default on).
ALTER TABLE client_sites ADD COLUMN IF NOT EXISTS reminders_enabled BOOLEAN DEFAULT TRUE;

-- Idempotency: the due date we last reminded about. The job skips a site when
-- reminder_sent_for = next_due_date, so re-runs / retries never double-send.
ALTER TABLE client_sites ADD COLUMN IF NOT EXISTS reminder_sent_for DATE;
ALTER TABLE client_sites ADD COLUMN IF NOT EXISTS reminder_sent_at TIMESTAMPTZ;
