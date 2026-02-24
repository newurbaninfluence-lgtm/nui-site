-- SMS Drip Campaign Tables
-- Run this in Supabase SQL Editor

-- Campaigns table
CREATE TABLE IF NOT EXISTS sms_campaigns (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  message_template TEXT NOT NULL,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'paused', 'complete')),
  contacts_total INTEGER DEFAULT 0,
  contacts_sent INTEGER DEFAULT 0,
  contacts_failed INTEGER DEFAULT 0,
  per_day_limit INTEGER DEFAULT 20,
  send_start_hour INTEGER DEFAULT 9,
  send_end_hour INTEGER DEFAULT 18,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Queue table (individual messages)
CREATE TABLE IF NOT EXISTS sms_drip_queue (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  campaign_id UUID REFERENCES sms_campaigns(id) ON DELETE CASCADE,
  contact_id TEXT,
  contact_name TEXT,
  contact_phone TEXT NOT NULL,
  message TEXT NOT NULL,
  scheduled_at TIMESTAMPTZ NOT NULL,
  sent_at TIMESTAMPTZ,
  status TEXT DEFAULT 'queued' CHECK (status IN ('queued', 'sent', 'failed', 'skipped')),
  error TEXT,
  openphone_msg_id TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes for the cron query
CREATE INDEX IF NOT EXISTS idx_drip_queue_ready
  ON sms_drip_queue (status, scheduled_at)
  WHERE status = 'queued';

CREATE INDEX IF NOT EXISTS idx_drip_queue_campaign
  ON sms_drip_queue (campaign_id);

-- RLS policies
ALTER TABLE sms_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE sms_drip_queue ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all for anon" ON sms_campaigns FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for anon" ON sms_drip_queue FOR ALL USING (true) WITH CHECK (true);
