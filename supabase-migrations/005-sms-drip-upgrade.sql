-- SMS Drip System Upgrade: Voice Variation + Compliance
-- Run AFTER 004-sms-drip.sql

-- Add campaign type + compliance fields
ALTER TABLE sms_campaigns ADD COLUMN IF NOT EXISTS campaign_type TEXT DEFAULT 'reactivation' CHECK (campaign_type IN ('reactivation', 'cold_outreach'));
ALTER TABLE sms_campaigns ADD COLUMN IF NOT EXISTS contacts_replied INTEGER DEFAULT 0;
ALTER TABLE sms_campaigns ADD COLUMN IF NOT EXISTS contacts_optout INTEGER DEFAULT 0;
ALTER TABLE sms_campaigns ADD COLUMN IF NOT EXISTS auto_paused BOOLEAN DEFAULT false;
ALTER TABLE sms_campaigns ADD COLUMN IF NOT EXISTS auto_pause_reason TEXT;

-- Add draft review + follow-up fields to queue
ALTER TABLE sms_drip_queue ADD COLUMN IF NOT EXISTS review_status TEXT DEFAULT 'draft' CHECK (review_status IN ('draft', 'approved', 'queued', 'sent', 'failed', 'skipped'));
ALTER TABLE sms_drip_queue ADD COLUMN IF NOT EXISTS message_tier INTEGER DEFAULT 1;
ALTER TABLE sms_drip_queue ADD COLUMN IF NOT EXISTS business_name TEXT;
ALTER TABLE sms_drip_queue ADD COLUMN IF NOT EXISTS short_observation TEXT;

-- Suppression list (opt-outs)
CREATE TABLE IF NOT EXISTS sms_suppression (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  phone TEXT NOT NULL UNIQUE,
  reason TEXT DEFAULT 'opt_out',
  source_campaign_id UUID REFERENCES sms_campaigns(id),
  reply_text TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE sms_suppression ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all for anon" ON sms_suppression FOR ALL USING (true) WITH CHECK (true);

-- Reply tracking
CREATE TABLE IF NOT EXISTS sms_replies (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  contact_phone TEXT NOT NULL,
  contact_id TEXT,
  campaign_id UUID REFERENCES sms_campaigns(id),
  queue_item_id UUID REFERENCES sms_drip_queue(id),
  reply_text TEXT,
  is_optout BOOLEAN DEFAULT false,
  is_positive BOOLEAN DEFAULT false,
  follow_up_suggested TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE sms_replies ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all for anon" ON sms_replies FOR ALL USING (true) WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_suppression_phone ON sms_suppression (phone);
CREATE INDEX IF NOT EXISTS idx_replies_campaign ON sms_replies (campaign_id);
CREATE INDEX IF NOT EXISTS idx_replies_phone ON sms_replies (contact_phone);
