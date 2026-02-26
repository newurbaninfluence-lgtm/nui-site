-- ============================================================
-- ADD MISSING COLUMNS TO EXISTING crm_contacts TABLE
-- Run this if crm_contacts already exists but is missing fields
-- Safe to run multiple times (IF NOT EXISTS)
-- ============================================================

ALTER TABLE crm_contacts ADD COLUMN IF NOT EXISTS industry TEXT;
ALTER TABLE crm_contacts ADD COLUMN IF NOT EXISTS service_interest TEXT;
ALTER TABLE crm_contacts ADD COLUMN IF NOT EXISTS budget_range TEXT;
ALTER TABLE crm_contacts ADD COLUMN IF NOT EXISTS timeline TEXT;
ALTER TABLE crm_contacts ADD COLUMN IF NOT EXISTS quo_contact_id TEXT;
ALTER TABLE crm_contacts ADD COLUMN IF NOT EXISTS client_id UUID;

-- Add direction + content + metadata to activity_log if missing
ALTER TABLE activity_log ADD COLUMN IF NOT EXISTS direction TEXT;
ALTER TABLE activity_log ADD COLUMN IF NOT EXISTS content TEXT;
ALTER TABLE activity_log ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb;

-- Rename 'message' to 'content' if it exists (old schema used 'message')
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='activity_log' AND column_name='message' AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='activity_log' AND column_name='content'))
  THEN ALTER TABLE activity_log RENAME COLUMN message TO content;
  END IF;
END $$;

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_crm_contacts_phone ON crm_contacts(phone);
CREATE INDEX IF NOT EXISTS idx_crm_contacts_quo_id ON crm_contacts(quo_contact_id);
CREATE INDEX IF NOT EXISTS idx_activity_type ON activity_log(type);
CREATE INDEX IF NOT EXISTS idx_activity_created ON activity_log(created_at DESC);
