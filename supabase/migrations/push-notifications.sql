-- push-notifications.sql
-- Web push subscriptions + campaign log
-- Run in Supabase SQL Editor if tables don't exist

CREATE TABLE IF NOT EXISTS push_subscriptions (
  id           uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  endpoint     text UNIQUE NOT NULL,
  keys         jsonb NOT NULL,
  interests    text[] DEFAULT '{}',
  platform     text DEFAULT 'unknown',
  user_agent   text,
  active       boolean DEFAULT true,
  created_at   timestamptz DEFAULT now(),
  updated_at   timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS push_campaigns (
  id               uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  title            text NOT NULL,
  body             text NOT NULL,
  url              text,
  interest_filter  text,
  platform_filter  text DEFAULT 'all',
  total_subscribers integer DEFAULT 0,
  sent_count       integer DEFAULT 0,
  failed_count     integer DEFAULT 0,
  sent_at          timestamptz DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_push_subs_active    ON push_subscriptions(active);
CREATE INDEX IF NOT EXISTS idx_push_subs_interests ON push_subscriptions USING gin(interests);
CREATE INDEX IF NOT EXISTS idx_push_subs_platform  ON push_subscriptions(platform);

-- RLS
ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE push_campaigns     ENABLE ROW LEVEL SECURITY;

-- Allow service role full access (Netlify functions use service key)
CREATE POLICY IF NOT EXISTS "Service role full access subs"
  ON push_subscriptions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY IF NOT EXISTS "Service role full access campaigns"
  ON push_campaigns FOR ALL USING (true) WITH CHECK (true);
