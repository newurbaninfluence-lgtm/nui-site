-- Add upsell tracking columns to clients table
ALTER TABLE clients
  ADD COLUMN IF NOT EXISTS upsell_trigger_date TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS last_upsell_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS last_upsell_offered TEXT,
  ADD COLUMN IF NOT EXISTS current_service TEXT,
  ADD COLUMN IF NOT EXISTS service_started_at TIMESTAMPTZ;

-- Index for daily upsell scan
CREATE INDEX IF NOT EXISTS idx_clients_upsell_trigger ON clients (upsell_trigger_date)
  WHERE upsell_trigger_date IS NOT NULL;
