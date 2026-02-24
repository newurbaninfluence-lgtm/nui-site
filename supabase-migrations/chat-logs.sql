-- Chat conversation logs for Sona AI assistant
-- Run in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS chat_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id TEXT NOT NULL,
  user_message TEXT NOT NULL,
  bot_reply TEXT NOT NULL,
  message_count INT DEFAULT 1,
  page_url TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for querying by session and time
CREATE INDEX IF NOT EXISTS idx_chat_logs_session ON chat_logs(session_id);
CREATE INDEX IF NOT EXISTS idx_chat_logs_created ON chat_logs(created_at DESC);

-- Enable RLS
ALTER TABLE chat_logs ENABLE ROW LEVEL SECURITY;

-- Service role can insert (from Netlify function)
CREATE POLICY "Service role can insert chat logs"
  ON chat_logs FOR INSERT
  TO service_role
  WITH CHECK (true);

-- Service role can read (for admin panel)
CREATE POLICY "Service role can read chat logs"
  ON chat_logs FOR SELECT
  TO service_role
  USING (true);
