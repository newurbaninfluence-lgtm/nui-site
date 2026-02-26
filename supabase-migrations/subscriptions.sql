-- subscriptions table for design subscription plans
-- Syncs with frontend via sync-data.js

CREATE TABLE IF NOT EXISTS subscriptions (
  id BIGINT PRIMARY KEY,
  "planId" TEXT,
  "clientId" BIGINT,
  "clientName" TEXT,
  "clientEmail" TEXT,
  plan TEXT,
  price NUMERIC,
  "billingMethod" TEXT DEFAULT 'stripe',
  status TEXT DEFAULT 'pending_payment',
  "startDate" TIMESTAMPTZ,
  "nextBillingDate" TIMESTAMPTZ,
  "currentPeriodStart" TIMESTAMPTZ,
  "orderLimit" INTEGER,
  features JSONB DEFAULT '[]',
  notes TEXT,
  history JSONB DEFAULT '[]',
  "stripeCheckoutUrl" TEXT,
  "stripeSessionId" TEXT,
  "stripeSubscriptionId" TEXT,
  "pauseReason" TEXT,
  "paymentFailedDate" TIMESTAMPTZ,
  "cancelledDate" TIMESTAMPTZ,
  synced_at TIMESTAMPTZ DEFAULT now(),
  synced_by TEXT DEFAULT 'system',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_subscriptions_client ON subscriptions("clientId");
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_plan ON subscriptions("planId");

-- RLS
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "subscriptions_full_access" ON subscriptions FOR ALL USING (true) WITH CHECK (true);
