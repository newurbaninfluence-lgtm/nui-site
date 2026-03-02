-- ═══════════════════════════════════════════════════════════════
-- Agency Tenant Upgrade — Run in Supabase SQL Editor
-- Adds: portal_slug, login_password, setup_complete, integrations_config
-- ═══════════════════════════════════════════════════════════════

alter table agency_subaccounts
    add column if not exists portal_slug         text unique,
    add column if not exists login_password      text,
    add column if not exists setup_complete      boolean default false,
    add column if not exists integrations_config jsonb default '{}'::jsonb;

-- index for fast slug lookup (used on every portal login)
create index if not exists idx_subaccounts_slug on agency_subaccounts(portal_slug);

-- helper: auto-generate slug from agency_name if blank
create or replace function gen_agency_slug(name text) returns text as $$
  select lower(regexp_replace(trim(name), '[^a-zA-Z0-9]+', '-', 'g'));
$$ language sql immutable;

-- backfill any existing rows that have no slug
update agency_subaccounts
set portal_slug = gen_agency_slug(agency_name) || '-' || id
where portal_slug is null;
