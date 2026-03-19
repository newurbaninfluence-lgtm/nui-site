-- Run this in Supabase SQL editor
CREATE TABLE IF NOT EXISTS scheduled_posts (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  caption text NOT NULL,
  platform text DEFAULT 'facebook' CHECK (platform IN ('facebook','instagram','both')),
  image_url text,
  scheduled_for timestamptz NOT NULL,
  status text DEFAULT 'scheduled' CHECK (status IN ('scheduled','posted','failed','cancelled')),
  posted_at timestamptz,
  results jsonb,
  error text,
  source text DEFAULT 'monty',
  created_at timestamptz DEFAULT now()
);

-- Index for fast cron queries
CREATE INDEX IF NOT EXISTS idx_scheduled_posts_due 
ON scheduled_posts(scheduled_for, status) 
WHERE status = 'scheduled';

-- RLS
ALTER TABLE scheduled_posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service role full access" ON scheduled_posts
  FOR ALL USING (true) WITH CHECK (true);
