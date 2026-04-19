-- visitor_auto_emails — logs every auto-email sent to identified visitors
-- Used for cooldown checks (7-day window) and analytics
-- Idempotent and RLS-safe. Includes column-drift guards so re-running
-- against an older table schema adds any missing columns.

CREATE TABLE IF NOT EXISTS visitor_auto_emails (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    visitor_id UUID REFERENCES identified_visitors(id) ON DELETE CASCADE,
    email_to TEXT NOT NULL,
    subject TEXT,
    interest_detected TEXT,
    pages_analyzed JSONB DEFAULT '[]',
    sent_at TIMESTAMPTZ DEFAULT now(),
    opened_at TIMESTAMPTZ,
    clicked_at TIMESTAMPTZ
);

-- Column-drift guards: covers tables created with an earlier version
-- of this migration that was missing these tracking columns.
ALTER TABLE visitor_auto_emails ADD COLUMN IF NOT EXISTS opened_at TIMESTAMPTZ;
ALTER TABLE visitor_auto_emails ADD COLUMN IF NOT EXISTS clicked_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_visitor_auto_emails_visitor ON visitor_auto_emails(visitor_id);
CREATE INDEX IF NOT EXISTS idx_visitor_auto_emails_sent    ON visitor_auto_emails(sent_at DESC);

ALTER TABLE visitor_auto_emails ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Service role full access" ON visitor_auto_emails;
