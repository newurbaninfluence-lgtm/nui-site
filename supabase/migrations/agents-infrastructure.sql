-- agents-infrastructure.sql
-- Tables for the 3-agent system: Promoter, Responder, Creator

-- ── Agent run logs (all agents write here) ──────────────────
CREATE TABLE IF NOT EXISTS agent_logs (
  id            bigserial PRIMARY KEY,
  agent_id      text NOT NULL,        -- 'promoter' | 'responder' | 'creator'
  status        text DEFAULT 'success', -- 'success' | 'partial' | 'error'
  metadata      jsonb DEFAULT '{}',
  created_at    timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS agent_logs_agent_id_idx ON agent_logs(agent_id);
CREATE INDEX IF NOT EXISTS agent_logs_created_at_idx ON agent_logs(created_at DESC);

-- ── Content drafts (Creator agent saves here for approval) ──
CREATE TABLE IF NOT EXISTS content_drafts (
  id                bigserial PRIMARY KEY,
  topic             text,
  tone              text,
  post_caption      text,
  hashtags          text,
  voiceover_script  text,
  audio_url         text,
  image_url         text,
  thumb_url         text,
  platforms         text[] DEFAULT '{facebook,instagram}',
  content_type      text,
  status            text DEFAULT 'pending_approval', -- 'pending_approval' | 'approved' | 'rejected'
  approved_at       timestamptz,
  created_at        timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS content_drafts_status_idx ON content_drafts(status);

-- ── Add auto_replied columns to submissions if not exists ──
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS auto_replied     boolean DEFAULT false;
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS auto_replied_at  timestamptz;

-- ── RLS: service role only ──
ALTER TABLE agent_logs     ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_drafts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "service_role_only" ON agent_logs     USING (auth.role() = 'service_role');
CREATE POLICY "service_role_only" ON content_drafts USING (auth.role() = 'service_role');
