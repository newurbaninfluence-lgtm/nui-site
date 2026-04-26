-- sms-dedup-lock.sql
-- Atomic dedup table for Monty SMS handler
-- PRIMARY KEY ensures the second concurrent INSERT fails instantly (ON CONFLICT)

CREATE TABLE IF NOT EXISTS sms_dedup (
  message_id   TEXT PRIMARY KEY,
  created_at   TIMESTAMPTZ DEFAULT now()
);

-- Auto-clean records older than 7 days (prevents unbounded growth)
-- Run via pg_cron or just let it accumulate — messages are small
CREATE INDEX IF NOT EXISTS idx_sms_dedup_created_at ON sms_dedup(created_at);

-- RLS
ALTER TABLE sms_dedup ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Service role full access sms_dedup" ON sms_dedup;
CREATE POLICY "Service role full access sms_dedup" ON sms_dedup FOR ALL USING (true) WITH CHECK (true);
