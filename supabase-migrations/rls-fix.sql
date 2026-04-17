-- ========================================================================
-- RLS Fix Migration  -  2026-04-18
-- ========================================================================
-- Purpose : Enable Row Level Security and remove permissive policies on the
--           17 tables flagged in the 2026-04-17 audit (chat 9ca87797).
-- Effect  : anon + authenticated roles are blocked from SELECT/INSERT/
--           UPDATE/DELETE on these tables. service_role still has full
--           access (Supabase service_role bypasses RLS by design), so
--           every Netlify function that uses SUPABASE_SERVICE_KEY keeps
--           working unchanged.
-- Re-run  : Idempotent. Safe to execute repeatedly.
-- ========================================================================

-- ---- STEP 1: ENABLE RLS on all 17 tables (no-op if already enabled) ----

ALTER TABLE IF EXISTS public.crm_contacts          ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.agent_logs            ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.communications        ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.client_sites          ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.site_config           ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.identified_visitors   ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.push_subscriptions    ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.clients               ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.invoices              ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.leads                 ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.orders                ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.payments              ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.projects              ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.proofs                ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.push_campaigns        ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.sms_campaigns         ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.visitor_auto_emails   ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.visitor_page_views    ENABLE ROW LEVEL SECURITY;

-- ---- STEP 2: Drop ALL existing policies on these tables -----------------
-- The existing policies (named "Service role full access", "Anon read ...",
-- "Full access", etc.) used FOR ALL USING (true) which grants every role
-- full access. We blow them away and rely on service_role's RLS bypass.

DO $$
DECLARE
  pol RECORD;
  target_tables TEXT[] := ARRAY[
    'crm_contacts','agent_logs','communications','client_sites','site_config',
    'identified_visitors','push_subscriptions','clients','invoices','leads',
    'orders','payments','projects','proofs','push_campaigns','sms_campaigns',
    'visitor_auto_emails','visitor_page_views'
  ];
BEGIN
  FOR pol IN
    SELECT schemaname, tablename, policyname
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = ANY(target_tables)
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I',
                   pol.policyname, pol.schemaname, pol.tablename);
  END LOOP;
END $$;

-- ---- STEP 3: Carve-out policies for tables with public read requirements -

-- client_sites: every deployed client site's <head> runs a status-check
-- script that queries this table directly with the anon key. We keep
-- anon SELECT but block all writes. Admin panel uses the service-key
-- proxy for writes.
CREATE POLICY client_sites_public_read
  ON public.client_sites
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- ---- STEP 4: No other policies added ------------------------------------
-- service_role bypasses RLS automatically in Supabase. anon + authenticated
-- now get zero rows on SELECT (except client_sites SELECT above) and
-- 42501 (insufficient_privilege) on all writes.

-- Reload PostgREST schema cache so the new policies take effect immediately.
NOTIFY pgrst, 'reload schema';
