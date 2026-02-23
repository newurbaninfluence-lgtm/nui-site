-- NUI Blog Posts Table (SECURE VERSION)
-- Run this in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS blog_posts (
  id BIGINT PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  excerpt TEXT,
  category TEXT DEFAULT 'Branding',
  image TEXT,
  author TEXT DEFAULT 'Faren Young',
  author_image TEXT,
  date TEXT,
  read_time TEXT DEFAULT '5 min read',
  content TEXT,
  published BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;

-- Public can READ published posts only (via anon key)
CREATE POLICY "Public can read published posts"
  ON blog_posts FOR SELECT
  USING (published = true);

-- Only service_role key (server-side Netlify functions) can write
CREATE POLICY "Service role can manage posts"
  ON blog_posts FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON blog_posts(slug);
CREATE INDEX IF NOT EXISTS idx_blog_posts_published ON blog_posts(published);
