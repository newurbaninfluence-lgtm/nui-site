-- drip-system.sql
-- Enrichment columns + drip queue + sequences

-- ── Enrichment columns on crm_contacts ──
ALTER TABLE crm_contacts
  ADD COLUMN IF NOT EXISTS pain_points         TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS funnel_stage        TEXT DEFAULT 'cold',
  ADD COLUMN IF NOT EXISTS last_touch_summary  TEXT,
  ADD COLUMN IF NOT EXISTS last_touch_at       TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS enrichment_version  INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS drip_status         TEXT DEFAULT 'not_enrolled',
  ADD COLUMN IF NOT EXISTS drip_paused_at      TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS source_campaign     TEXT,
  ADD COLUMN IF NOT EXISTS timezone            TEXT DEFAULT 'America/Detroit';

ALTER TABLE crm_contacts DROP CONSTRAINT IF EXISTS crm_contacts_funnel_stage_check;
ALTER TABLE crm_contacts
  ADD CONSTRAINT crm_contacts_funnel_stage_check
  CHECK (funnel_stage IN ('cold','warm_lead','hot_lead','in_convo','ghosted','booked','client','lost'));

ALTER TABLE crm_contacts DROP CONSTRAINT IF EXISTS crm_contacts_drip_status_check;
ALTER TABLE crm_contacts
  ADD CONSTRAINT crm_contacts_drip_status_check
  CHECK (drip_status IN ('not_enrolled','queued','active','paused','completed','opted_out','bounced'));

CREATE INDEX IF NOT EXISTS idx_crm_contacts_funnel_stage    ON crm_contacts(funnel_stage);
CREATE INDEX IF NOT EXISTS idx_crm_contacts_drip_status     ON crm_contacts(drip_status);
CREATE INDEX IF NOT EXISTS idx_crm_contacts_source_campaign ON crm_contacts(source_campaign);
CREATE INDEX IF NOT EXISTS idx_crm_contacts_pain_points     ON crm_contacts USING gin(pain_points);

-- ── Drip Sequences (template library) ──
CREATE TABLE IF NOT EXISTS drip_sequences (
  id                 UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name               TEXT NOT NULL,
  business_category  TEXT,
  source_campaign    TEXT,
  channel            TEXT NOT NULL,
  step_number        INTEGER NOT NULL,
  delay_days         INTEGER NOT NULL DEFAULT 0,
  subject            TEXT,
  body               TEXT NOT NULL,
  active             BOOLEAN DEFAULT true,
  created_at         TIMESTAMPTZ DEFAULT now(),
  updated_at         TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE drip_sequences DROP CONSTRAINT IF EXISTS drip_sequences_channel_check;
ALTER TABLE drip_sequences
  ADD CONSTRAINT drip_sequences_channel_check CHECK (channel IN ('email','sms'));

CREATE INDEX IF NOT EXISTS idx_drip_seq_cat_channel_step ON drip_sequences(business_category, channel, step_number);
CREATE INDEX IF NOT EXISTS idx_drip_seq_campaign        ON drip_sequences(source_campaign);

-- ── Drip Queue (per-contact scheduled sends) ──
CREATE TABLE IF NOT EXISTS drip_queue (
  id               UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  contact_id       UUID NOT NULL REFERENCES crm_contacts(id) ON DELETE CASCADE,
  sequence_id     UUID REFERENCES drip_sequences(id) ON DELETE SET NULL,
  channel          TEXT NOT NULL,
  step_number      INTEGER NOT NULL,
  scheduled_for    TIMESTAMPTZ NOT NULL,
  sent_at          TIMESTAMPTZ,
  status           TEXT NOT NULL DEFAULT 'queued',
  rendered_subject TEXT,
  rendered_body    TEXT,
  error_message    TEXT,
  attempt_count    INTEGER DEFAULT 0,
  source_campaign  TEXT,
  business_category TEXT,
  created_at       TIMESTAMPTZ DEFAULT now(),
  updated_at       TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE drip_queue DROP CONSTRAINT IF EXISTS drip_queue_channel_check;
ALTER TABLE drip_queue ADD CONSTRAINT drip_queue_channel_check CHECK (channel IN ('email','sms'));

ALTER TABLE drip_queue DROP CONSTRAINT IF EXISTS drip_queue_status_check;
ALTER TABLE drip_queue ADD CONSTRAINT drip_queue_status_check
  CHECK (status IN ('queued','sending','sent','failed','cancelled','skipped','bounced'));

CREATE INDEX IF NOT EXISTS idx_drip_queue_due ON drip_queue(scheduled_for) WHERE status = 'queued';
CREATE INDEX IF NOT EXISTS idx_drip_queue_contact ON drip_queue(contact_id);
CREATE INDEX IF NOT EXISTS idx_drip_queue_campaign ON drip_queue(source_campaign);

-- ── Drip Config (daily caps + ramp schedule) ──
CREATE TABLE IF NOT EXISTS drip_config (
  id               UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  key              TEXT UNIQUE NOT NULL,
  value            JSONB NOT NULL,
  updated_at       TIMESTAMPTZ DEFAULT now()
);

INSERT INTO drip_config (key, value) VALUES
  ('daily_caps', '{"email":10,"sms":10}'::jsonb),
  ('ramp_schedule', '[
     {"week":1,"email":10,"sms":5},
     {"week":2,"email":14,"sms":8},
     {"week":3,"email":18,"sms":10},
     {"week":4,"email":18,"sms":10},
     {"week":5,"email":25,"sms":15},
     {"week":9,"email":30,"sms":18}
   ]'::jsonb),
  ('send_window', '{"start_hour":10,"end_hour":18,"days":[1,2,3,4,5,6],"timezone":"recipient"}'::jsonb),
  ('min_gap_minutes', '15'::jsonb),
  ('bounce_threshold_pct', '2.0'::jsonb),
  ('unsub_threshold_pct', '0.3'::jsonb),
  ('ramp_started_at', 'null'::jsonb)
ON CONFLICT (key) DO NOTHING;

-- ── RLS ──
ALTER TABLE drip_sequences ENABLE ROW LEVEL SECURITY;
ALTER TABLE drip_queue     ENABLE ROW LEVEL SECURITY;
ALTER TABLE drip_config    ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Service role full access drip_sequences" ON drip_sequences;
DROP POLICY IF EXISTS "Service role full access drip_queue" ON drip_queue;
DROP POLICY IF EXISTS "Service role full access drip_config" ON drip_config;
CREATE POLICY "Service role full access drip_sequences" ON drip_sequences FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access drip_queue"     ON drip_queue     FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access drip_config"    ON drip_config    FOR ALL USING (true) WITH CHECK (true);
