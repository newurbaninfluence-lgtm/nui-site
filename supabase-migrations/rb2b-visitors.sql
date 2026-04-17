-- RB2B Identified Visitors table
-- Idempotent and RLS-safe.

CREATE TABLE IF NOT EXISTS identified_visitors (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    linkedin_url TEXT,
    first_name TEXT,
    last_name TEXT,
    title TEXT,
    company_name TEXT,
    business_email TEXT,
    website TEXT,
    industry TEXT,
    employee_count TEXT,
    estimated_revenue TEXT,
    city TEXT,
    state TEXT,
    zipcode TEXT,
    seen_at TIMESTAMPTZ,
    last_seen_at TIMESTAMPTZ,
    referrer TEXT,
    last_referrer TEXT,
    captured_url TEXT,
    last_captured_url TEXT,
    tags TEXT,
    visit_count INTEGER DEFAULT 1,
    status TEXT DEFAULT 'new',
    source TEXT DEFAULT 'rb2b',
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS visitor_page_views (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    visitor_id UUID REFERENCES identified_visitors(id),
    captured_url TEXT,
    referrer TEXT,
    seen_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_visitors_linkedin ON identified_visitors(linkedin_url);
CREATE INDEX IF NOT EXISTS idx_visitors_email    ON identified_visitors(business_email);
CREATE INDEX IF NOT EXISTS idx_visitors_status   ON identified_visitors(status);
CREATE INDEX IF NOT EXISTS idx_visitors_seen     ON identified_visitors(seen_at DESC);
CREATE INDEX IF NOT EXISTS idx_pageviews_visitor ON visitor_page_views(visitor_id);

-- Enable RLS. service_role bypasses; anon/authenticated are denied.
ALTER TABLE identified_visitors ENABLE ROW LEVEL SECURITY;
ALTER TABLE visitor_page_views  ENABLE ROW LEVEL SECURITY;

-- Drop any pre-existing permissive policies; no new policies needed.
DROP POLICY IF EXISTS "Service role full access" ON identified_visitors;
DROP POLICY IF EXISTS "Service role full access" ON visitor_page_views;
