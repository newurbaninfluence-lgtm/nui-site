-- ============================================================
-- GEO-GRID SCANS — Rank Intel tracking
-- Stores 7x7 grid scan results for Google Maps rankings
-- ============================================================

CREATE TABLE IF NOT EXISTS geo_grid_scans (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    client_id UUID,
    biz_name TEXT NOT NULL,
    keyword TEXT NOT NULL,
    address TEXT,
    center_lat NUMERIC,
    center_lng NUMERIC,
    radius_miles NUMERIC DEFAULT 5,
    grid_size INTEGER DEFAULT 7,
    max_results INTEGER DEFAULT 5,
    points JSONB DEFAULT '[]',
    avg_rank NUMERIC,
    coverage_pct NUMERIC,
    top3_count INTEGER DEFAULT 0,
    scanned_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_geo_scans_client ON geo_grid_scans(client_id);
CREATE INDEX IF NOT EXISTS idx_geo_scans_keyword ON geo_grid_scans(keyword);
CREATE INDEX IF NOT EXISTS idx_geo_scans_date ON geo_grid_scans(scanned_at DESC);

ALTER TABLE geo_grid_scans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service role full access" ON geo_grid_scans FOR ALL USING (true);
