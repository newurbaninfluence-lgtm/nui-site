-- ============================================================
-- GEO-GRID SCANS — Rank Intel scan history
-- Run this in Supabase SQL Editor
-- ============================================================

CREATE TABLE IF NOT EXISTS geo_grid_scans (
    id BIGSERIAL PRIMARY KEY,
    client_id TEXT,
    biz_name TEXT NOT NULL,
    keyword TEXT NOT NULL,
    address TEXT NOT NULL,
    center_lat DOUBLE PRECISION NOT NULL,
    center_lng DOUBLE PRECISION NOT NULL,
    radius_miles INTEGER NOT NULL DEFAULT 5,
    grid_size INTEGER NOT NULL DEFAULT 7,
    max_results INTEGER NOT NULL DEFAULT 20,
    points JSONB NOT NULL,           -- full grid point array with rank + competitors
    avg_rank NUMERIC(4,1),
    coverage_pct INTEGER,
    top3_count INTEGER DEFAULT 0,
    scanned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for fast client + keyword lookups and trend queries
CREATE INDEX idx_geo_grid_client ON geo_grid_scans(client_id);
CREATE INDEX idx_geo_grid_keyword ON geo_grid_scans(biz_name, keyword);
CREATE INDEX idx_geo_grid_date ON geo_grid_scans(scanned_at DESC);

-- RLS: only authenticated users can access
ALTER TABLE geo_grid_scans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin access geo_grid_scans"
    ON geo_grid_scans FOR ALL
    USING (auth.role() = 'authenticated');
