-- ============================================================
-- RETARGETING — Meta Pixel & Google Ads tracking tables
-- Run this in Supabase SQL Editor
-- ============================================================

-- 1. Client pixel/tag setups with checklist
CREATE TABLE IF NOT EXISTS retargeting_setups (
    id BIGSERIAL PRIMARY KEY,
    client_id TEXT,
    client_name TEXT NOT NULL,
    platform TEXT NOT NULL CHECK (platform IN ('meta', 'google')),
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'active', 'paused')),
    -- Meta fields
    pixel_id TEXT,
    ad_account_id TEXT,
    -- Google fields
    gtm_id TEXT,
    google_ads_id TEXT,
    conversion_id TEXT,
    ga4_id TEXT,
    -- Checklist (JSONB of step_name: bool)
    checklist JSONB DEFAULT '{}',
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Audiences (custom, lookalike, remarketing, interest)
CREATE TABLE IF NOT EXISTS retargeting_audiences (
    id BIGSERIAL PRIMARY KEY,
    client_id TEXT,
    client_name TEXT,
    platform TEXT NOT NULL CHECK (platform IN ('meta', 'google')),
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('custom', 'lookalike', 'remarketing', 'interest')),
    size INTEGER,
    status TEXT DEFAULT 'building' CHECK (status IN ('building', 'active', 'too_small')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Campaigns with performance metrics
CREATE TABLE IF NOT EXISTS retargeting_campaigns (
    id BIGSERIAL PRIMARY KEY,
    client_id TEXT,
    client_name TEXT,
    platform TEXT NOT NULL CHECK (platform IN ('meta', 'google')),
    name TEXT NOT NULL,
    campaign_type TEXT DEFAULT 'retargeting' CHECK (campaign_type IN ('retargeting', 'display', 'youtube', 'lookalike')),
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'paused', 'completed')),
    budget NUMERIC(10,2),
    impressions INTEGER,
    clicks INTEGER,
    ctr NUMERIC(5,2),
    conversions INTEGER,
    spend NUMERIC(10,2),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_rt_setups_client ON retargeting_setups(client_id);
CREATE INDEX idx_rt_setups_platform ON retargeting_setups(platform);
CREATE INDEX idx_rt_audiences_client ON retargeting_audiences(client_id);
CREATE INDEX idx_rt_campaigns_client ON retargeting_campaigns(client_id);
CREATE INDEX idx_rt_campaigns_status ON retargeting_campaigns(status);

-- RLS
ALTER TABLE retargeting_setups ENABLE ROW LEVEL SECURITY;
ALTER TABLE retargeting_audiences ENABLE ROW LEVEL SECURITY;
ALTER TABLE retargeting_campaigns ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin access retargeting_setups" ON retargeting_setups FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin access retargeting_audiences" ON retargeting_audiences FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin access retargeting_campaigns" ON retargeting_campaigns FOR ALL USING (auth.role() = 'authenticated');
