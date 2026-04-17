-- push_subscriptions — Web Push notification subscribers
-- push_campaigns      — Sent push notification campaigns
-- Idempotent and RLS-safe.

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

CREATE INDEX IF NOT EXISTS idx_push_subs_active    ON push_subscriptions(active);
CREATE INDEX IF NOT EXISTS idx_push_subs_platform  ON push_subscriptions(platform);
CREATE INDEX IF NOT EXISTS idx_push_subs_interests ON push_subscriptions USING gin(interests);

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
ALTER TABLE push_campaigns     ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Service role full access" ON push_subscriptions;
DROP POLICY IF EXISTS "Service role full access" ON push_campaigns;
