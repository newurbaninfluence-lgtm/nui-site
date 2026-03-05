-- ═══════════════════════════════════════════════════════════════
-- FIX: meetings table — add flat columns for calendar
-- The table was created with JSONB pattern (id + data) but
-- save-booking.js and calendar panel expect flat columns.
-- Run in Supabase SQL Editor.
-- ═══════════════════════════════════════════════════════════════

ALTER TABLE meetings
  ADD COLUMN IF NOT EXISTS date         TEXT,
  ADD COLUMN IF NOT EXISTS time         TEXT,
  ADD COLUMN IF NOT EXISTS type         TEXT DEFAULT 'phone',
  ADD COLUMN IF NOT EXISTS status       TEXT DEFAULT 'scheduled',
  ADD COLUMN IF NOT EXISTS outcome      TEXT,
  ADD COLUMN IF NOT EXISTS source       TEXT DEFAULT 'manual',
  ADD COLUMN IF NOT EXISTS client_name  TEXT,
  ADD COLUMN IF NOT EXISTS client_email TEXT,
  ADD COLUMN IF NOT EXISTS client_phone TEXT,
  ADD COLUMN IF NOT EXISTS service      TEXT,
  ADD COLUMN IF NOT EXISTS notes        TEXT,
  ADD COLUMN IF NOT EXISTS created_at   TIMESTAMPTZ DEFAULT now(),
  ADD COLUMN IF NOT EXISTS agency_id    TEXT DEFAULT NULL;

-- Make id auto-increment if it isn't already
-- (core-tables used BIGINT PRIMARY KEY without serial)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_sequences WHERE schemaname='public' AND sequencename='meetings_id_seq') THEN
    CREATE SEQUENCE meetings_id_seq OWNED BY meetings.id;
    ALTER TABLE meetings ALTER COLUMN id SET DEFAULT nextval('meetings_id_seq');
    -- Set sequence to max existing id
    PERFORM setval('meetings_id_seq', COALESCE((SELECT MAX(id) FROM meetings), 0) + 1);
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_meetings_date ON meetings(date);
CREATE INDEX IF NOT EXISTS idx_meetings_agency ON meetings(agency_id);
