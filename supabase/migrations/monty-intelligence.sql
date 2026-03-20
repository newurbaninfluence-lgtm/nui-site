-- monty-intelligence.sql
-- Adds AI intelligence fields to crm_contacts
-- Run in Supabase SQL Editor

ALTER TABLE crm_contacts
  ADD COLUMN IF NOT EXISTS lead_score        integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS sentiment         text,
  ADD COLUMN IF NOT EXISTS bant_budget       text,
  ADD COLUMN IF NOT EXISTS bant_authority    text,
  ADD COLUMN IF NOT EXISTS bant_need         text,
  ADD COLUMN IF NOT EXISTS bant_timeline     text,
  ADD COLUMN IF NOT EXISTS interest_tags     text[],
  ADD COLUMN IF NOT EXISTS followup_stage    integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS last_followup_at  timestamptz,
  ADD COLUMN IF NOT EXISTS last_replied_at   timestamptz,
  ADD COLUMN IF NOT EXISTS calendly_sent     boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS calendly_sent_at  timestamptz,
  ADD COLUMN IF NOT EXISTS reactivation_sent timestamptz;

-- Index for followup scheduler queries
CREATE INDEX IF NOT EXISTS idx_crm_followup ON crm_contacts(followup_stage, last_replied_at, status, source);
CREATE INDEX IF NOT EXISTS idx_crm_dormant  ON crm_contacts(last_activity_at, status, reactivation_sent);
CREATE INDEX IF NOT EXISTS idx_crm_score    ON crm_contacts(lead_score DESC);
