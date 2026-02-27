-- ============================================================
-- RETARGETING TABLES — Pixel & Ads Manager
-- 3 tables: setups, audiences, campaigns
-- ============================================================

-- 1. Client Pixel/Tag Setups
CREATE TABLE IF NOT EXISTS retargeting_setups (
    id SERIAL PRIMARY KEY,
    client_id UUID,
    client_name TEXT,
    platform TEXT NOT NULL CHECK (platform IN ('meta', 'google')),
    pixel_id TEXT,
    ad_account_id TEXT,
    gtm_id TEXT,
    google_ads_id TEXT,
    conversion_id TEXT,
    ga4_id TEXT,
    checklist JSONB DEFAULT '{}',
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'active', 'paused')),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Audiences (custom & lookalike)
CREATE TABLE IF NOT EXISTS retargeting_audiences (
    id SERIAL PRIMARY KEY,
    setup_id INTEGER REFERENCES retargeting_setups(id),
    client_name TEXT,
    platform TEXT CHECK (platform IN ('meta', 'google')),
    audience_name TEXT NOT NULL,
    audience_type TEXT DEFAULT 'custom' CHECK (audience_type IN ('custom', 'lookalike', 'remarketing')),
    source_description TEXT,
    size_estimate INTEGER,
    status TEXT DEFAULT 'building' CHECK (status IN ('building', 'ready', 'active', 'archived')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Campaigns
CREATE TABLE IF NOT EXISTS retargeting_campaigns (
    id SERIAL PRIMARY KEY,
    setup_id INTEGER REFERENCES retargeting_setups(id),
    client_name TEXT,
    platform TEXT CHECK (platform IN ('meta', 'google')),
    campaign_name TEXT NOT NULL,
    campaign_type TEXT DEFAULT 'retargeting',
    audience_id INTEGER REFERENCES retargeting_audiences(id),
    daily_budget NUMERIC,
    total_spent NUMERIC DEFAULT 0,
    impressions INTEGER DEFAULT 0,
    clicks INTEGER DEFAULT 0,
    conversions INTEGER DEFAULT 0,
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'paused', 'completed')),
    start_date DATE,
    end_date DATE,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_rt_setups_client ON retargeting_setups(client_id);
CREATE INDEX IF NOT EXISTS idx_rt_setups_platform ON retargeting_setups(platform);
CREATE INDEX IF NOT EXISTS idx_rt_audiences_setup ON retargeting_audiences(setup_id);
CREATE INDEX IF NOT EXISTS idx_rt_campaigns_setup ON retargeting_campaigns(setup_id);
CREATE INDEX IF NOT EXISTS idx_rt_campaigns_status ON retargeting_campaigns(status);

-- RLS
ALTER TABLE retargeting_setups ENABLE ROW LEVEL SECURITY;
ALTER TABLE retargeting_audiences ENABLE ROW LEVEL SECURITY;
ALTER TABLE retargeting_campaigns ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Full access retargeting setups" ON retargeting_setups FOR ALL USING (true);
CREATE POLICY "Full access retargeting audiences" ON retargeting_audiences FOR ALL USING (true);
CREATE POLICY "Full access retargeting campaigns" ON retargeting_campaigns FOR ALL USING (true);
