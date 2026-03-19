-- Migration: add lead verification columns to crm_contacts
-- Run in: Supabase Dashboard > SQL Editor

ALTER TABLE crm_contacts
  ADD COLUMN IF NOT EXISTS email_verified     BOOLEAN,
  ADD COLUMN IF NOT EXISTS email_risk         TEXT,
  ADD COLUMN IF NOT EXISTS email_safe_to_send BOOLEAN,
  ADD COLUMN IF NOT EXISTS phone_verified     BOOLEAN,
  ADD COLUMN IF NOT EXISTS phone_type         TEXT,
  ADD COLUMN IF NOT EXISTS phone_sms_safe     BOOLEAN,
  ADD COLUMN IF NOT EXISTS phone_carrier      TEXT,
  ADD COLUMN IF NOT EXISTS verified_at        TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_crm_contacts_verified_at
  ON crm_contacts (verified_at);

CREATE INDEX IF NOT EXISTS idx_crm_contacts_campaign_ready
  ON crm_contacts (email_safe_to_send, phone_sms_safe);

CREATE OR REPLACE VIEW campaign_ready_contacts AS
  SELECT id, full_name, email, phone, email_risk, phone_type,
         phone_carrier, verified_at, lead_source, tags, notes
  FROM crm_contacts
  WHERE email_safe_to_send = true AND phone_sms_safe = true
  ORDER BY verified_at DESC;

CREATE OR REPLACE VIEW bad_leads AS
  SELECT id, full_name, email, phone, email_verified, email_risk,
         phone_verified, phone_type, verified_at
  FROM crm_contacts
  WHERE verified_at IS NOT NULL
    AND (email_safe_to_send = false OR phone_sms_safe = false)
  ORDER BY verified_at DESC;
