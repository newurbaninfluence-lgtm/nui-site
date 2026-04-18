-- smart-lists.sql
-- Smart Lists for Contact Hub segmentation
ALTER TABLE crm_contacts
  ADD COLUMN IF NOT EXISTS business_type TEXT,
  ADD COLUMN IF NOT EXISTS business_category TEXT;

ALTER TABLE crm_contacts DROP CONSTRAINT IF EXISTS crm_contacts_business_type_check;
ALTER TABLE crm_contacts
  ADD CONSTRAINT crm_contacts_business_type_check
  CHECK (business_type IS NULL OR business_type IN ('service','product','both'));

CREATE INDEX IF NOT EXISTS idx_crm_contacts_business_type     ON crm_contacts(business_type);
CREATE INDEX IF NOT EXISTS idx_crm_contacts_business_category ON crm_contacts(business_category);

CREATE TABLE IF NOT EXISTS smart_lists (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  filters JSONB NOT NULL DEFAULT '{}'::jsonb,
  color TEXT DEFAULT '#dc2626',
  icon TEXT DEFAULT '📋',
  contact_count INTEGER DEFAULT 0,
  last_refreshed_at TIMESTAMPTZ,
  last_used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  agency_id TEXT DEFAULT 'nui'
);

CREATE INDEX IF NOT EXISTS idx_smart_lists_agency ON smart_lists(agency_id);
ALTER TABLE smart_lists ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Service role full access smart_lists" ON smart_lists;
CREATE POLICY "Service role full access smart_lists" ON smart_lists FOR ALL USING (true) WITH CHECK (true);
