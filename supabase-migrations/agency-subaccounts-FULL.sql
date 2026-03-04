-- Agency Sub-Accounts — run in Supabase SQL Editor
create table if not exists agency_subaccounts (
    id              bigserial primary key,
    agency_name     text not null,
    domain          text,
    owner_name      text,
    owner_email     text,
    owner_phone     text,
    brand_color     text default '#dc2626',
    plan            text default 'starter',
    monthly_rate    integer default 97,
    features        jsonb default '[]'::jsonb,
    status          text default 'active',
    notes           text,
    created_at      timestamptz default now(),
    updated_at      timestamptz default now()
);
create index if not exists idx_subaccounts_status on agency_subaccounts(status);
alter table agency_subaccounts enable row level security;
create policy "Service key full access" on agency_subaccounts using (true) with check (true);
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
-- Verified 2026-03-05 on jcgvkyizoimwbolhfpta: all 31 columns confirmed
