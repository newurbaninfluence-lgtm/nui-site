-- ============================================================
-- CRM CONTACTS + ACTIVITY LOG + COMMUNICATIONS
-- Required by: Contact Hub, Sona chatbot, Quo webhook
-- ============================================================

-- Main contacts table
CREATE TABLE IF NOT EXISTS crm_contacts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    first_name TEXT,
    last_name TEXT,
    email TEXT,
    phone TEXT,
    company TEXT,
    status TEXT DEFAULT 'new_lead',
    source TEXT DEFAULT 'manual',
    notes TEXT,
    tags TEXT[] DEFAULT '{}',
    industry TEXT,
    service_interest TEXT,
    budget_range TEXT,
    timeline TEXT,
    quo_contact_id TEXT,
    client_id UUID,
    sona_qualified BOOLEAN DEFAULT false,
    last_activity_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_crm_contacts_email ON crm_contacts(email);
CREATE INDEX IF NOT EXISTS idx_crm_contacts_phone ON crm_contacts(phone);
CREATE INDEX IF NOT EXISTS idx_crm_contacts_status ON crm_contacts(status);
CREATE INDEX IF NOT EXISTS idx_crm_contacts_source ON crm_contacts(source);
CREATE INDEX IF NOT EXISTS idx_crm_contacts_quo_id ON crm_contacts(quo_contact_id);

-- Activity log for contact interactions
CREATE TABLE IF NOT EXISTS activity_log (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    contact_id UUID REFERENCES crm_contacts(id) ON DELETE CASCADE,
    type TEXT DEFAULT 'note',
    direction TEXT,
    content TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    read BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_activity_contact ON activity_log(contact_id);
CREATE INDEX IF NOT EXISTS idx_activity_type ON activity_log(type);
CREATE INDEX IF NOT EXISTS idx_activity_read ON activity_log(read) WHERE read = false;
CREATE INDEX IF NOT EXISTS idx_activity_created ON activity_log(created_at DESC);

-- Communications (email + SMS history)
CREATE TABLE IF NOT EXISTS communications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    contact_id UUID REFERENCES crm_contacts(id) ON DELETE CASCADE,
    channel TEXT DEFAULT 'email',
    direction TEXT DEFAULT 'outbound',
    subject TEXT,
    body TEXT,
    status TEXT DEFAULT 'sent',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_comms_contact ON communications(contact_id);
CREATE INDEX IF NOT EXISTS idx_comms_channel ON communications(channel);

-- RLS policies
ALTER TABLE crm_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE communications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access" ON crm_contacts FOR ALL USING (true);
CREATE POLICY "Service role full access" ON activity_log FOR ALL USING (true);
CREATE POLICY "Service role full access" ON communications FOR ALL USING (true);

-- Anon read access (for admin dashboard)
CREATE POLICY "Anon read crm_contacts" ON crm_contacts FOR SELECT USING (true);
CREATE POLICY "Anon read activity_log" ON activity_log FOR SELECT USING (true);
CREATE POLICY "Anon read communications" ON communications FOR SELECT USING (true);

-- Grants
GRANT ALL ON crm_contacts TO service_role;
GRANT ALL ON activity_log TO service_role;
GRANT ALL ON communications TO service_role;
GRANT SELECT, INSERT, UPDATE ON crm_contacts TO anon;
GRANT SELECT, INSERT ON activity_log TO anon;
GRANT SELECT, INSERT ON communications TO anon;
