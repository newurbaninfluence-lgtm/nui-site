-- push_subscriptions — Web Push notification subscribers
-- Stores browser push endpoints, VAPID keys, platform, and interests

CREATE TABLE IF NOT EXISTS push_subscriptions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    endpoint TEXT NOT NULL UNIQUE,
    keys JSONB NOT NULL,
    interests TEXT[] DEFAULT '{}',
    user_agent TEXT,
    platform TEXT DEFAULT 'unknown',
    active BOOLEAN DEFAULT true,
    visitor_id UUID REFERENCES identified_visitors(id),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_push_subs_active ON push_subscriptions(active);
CREATE INDEX idx_push_subs_platform ON push_subscriptions(platform);
CREATE INDEX idx_push_subs_interests ON push_subscriptions USING gin(interests);

-- push_campaigns — Log of sent push notification campaigns
CREATE TABLE IF NOT EXISTS push_campaigns (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    body TEXT,
    url TEXT,
    interest_filter TEXT,
    platform_filter TEXT DEFAULT 'all',
    total_subscribers INTEGER DEFAULT 0,
    sent_count INTEGER DEFAULT 0,
    failed_count INTEGER DEFAULT 0,
    sent_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service role full access" ON push_subscriptions FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE push_campaigns ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service role full access" ON push_campaigns FOR ALL USING (true) WITH CHECK (true);
