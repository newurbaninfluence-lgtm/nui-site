-- NUI Agency Sub-Accounts FULL SETUP
-- Run on: jcgvkyizoimwbolhfpta
-- Confirmed: 2026-03-05, all 31 columns created

create table if not exists agency_subaccounts (
    id bigserial primary key, agency_name text not null,
    domain text, owner_name text, owner_email text, owner_phone text,
    brand_color text default '#dc2626', plan text default 'starter',
    monthly_rate integer default 97, features jsonb default '[]'::jsonb,
    status text default 'active', notes text,
    created_at timestamptz default now(), updated_at timestamptz default now()
);
alter table agency_subaccounts
    add column if not exists portal_slug text unique,
    add column if not exists login_password text,
    add column if not exists setup_complete boolean default false,
    add column if not exists integrations_config jsonb default '{}'::jsonb,
    add column if not exists logo_url text, add column if not exists company_email text,
    add column if not exists company_phone text, add column if not exists company_website text,
    add column if not exists company_city text, add column if not exists company_tagline text,
    add column if not exists founder_name text, add column if not exists founder_title text,
    add column if not exists print_store_url text,
    add column if not exists smtp_user text, add column if not exists smtp_pass text,
    add column if not exists openphone_key text, add column if not exists openphone_number text;
create index if not exists idx_subaccounts_slug on agency_subaccounts(portal_slug);
create index if not exists idx_subaccounts_email on agency_subaccounts(owner_email);
create index if not exists idx_subaccounts_status on agency_subaccounts(status);
alter table agency_subaccounts enable row level security;
drop policy if exists "Service key full access" on agency_subaccounts;
create policy "Service key full access" on agency_subaccounts using (true) with check (true);
create or replace function gen_agency_slug(name text) returns text as $$
  select lower(regexp_replace(trim(name), '[^a-zA-Z0-9]+', '-', 'g'));
$$ language sql immutable;
