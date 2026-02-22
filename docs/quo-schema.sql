-- =====================================================
-- NUI Contact Hub + Quo Integration Schema
-- Run in Supabase SQL Editor
-- =====================================================

-- 1. Extend crm_contacts with Quo integration fields
-- (keeps existing data intact, just adds new columns)
ALTER TABLE public.crm_contacts
  ADD COLUMN IF NOT EXISTS quo_contact_id text,
  ADD COLUMN IF NOT EXISTS client_id uuid REFERENCES public.clients(id),
  ADD COLUMN IF NOT EXISTS service_interest text,
  ADD COLUMN IF NOT EXISTS budget_range text,
  ADD COLUMN IF NOT EXISTS timeline text,
  ADD COLUMN IF NOT EXISTS industry text,
  ADD COLUMN IF NOT EXISTS notes text,
  ADD COLUMN IF NOT EXISTS sona_qualified boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS last_activity_at timestamptz;

-- Index for fast phone lookups (webhook matching)
CREATE INDEX IF NOT EXISTS idx_crm_contacts_phone ON public.crm_contacts(phone);

-- Index for Quo contact ID lookups
CREATE INDEX IF NOT EXISTS idx_crm_contacts_quo_id ON public.crm_contacts(quo_contact_id);

-- Index for status filtering in admin
CREATE INDEX IF NOT EXISTS idx_crm_contacts_status ON public.crm_contacts(status);

-- 2. Create activity_log table (the timeline)
CREATE TABLE IF NOT EXISTS public.activity_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_id uuid REFERENCES public.crm_contacts(id) ON DELETE CASCADE,
  type text NOT NULL,
  -- Types: call, text, email, form, note, status_change,
  --        sona_summary, voicemail, recording
  direction text,
  -- Directions: inbound, outbound, internal
  content text,
  -- Message text, call summary, note text, etc.
  metadata jsonb DEFAULT '{}'::jsonb,
  -- Flexible JSON: duration, transcript, recording_url,
  -- next_steps, quo_event_id, raw payload, etc.
  read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Indexes for activity_log
CREATE INDEX IF NOT EXISTS idx_activity_log_contact ON public.activity_log(contact_id);
CREATE INDEX IF NOT EXISTS idx_activity_log_type ON public.activity_log(type);
CREATE INDEX IF NOT EXISTS idx_activity_log_created ON public.activity_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activity_log_unread ON public.activity_log(read) WHERE read = false;

-- 3. Enable RLS but allow service key full access
ALTER TABLE public.activity_log ENABLE ROW LEVEL SECURITY;

-- Service role (Netlify functions) can do everything
CREATE POLICY "Service role full access on activity_log"
  ON public.activity_log
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Anon can read (for admin dashboard)
CREATE POLICY "Anon read activity_log"
  ON public.activity_log
  FOR SELECT
  USING (true);

-- 4. Grant permissions
GRANT ALL ON public.activity_log TO service_role;
GRANT SELECT, INSERT ON public.activity_log TO anon;
GRANT SELECT, INSERT ON public.activity_log TO authenticated;

-- Done! Tables ready for webhook integration.
