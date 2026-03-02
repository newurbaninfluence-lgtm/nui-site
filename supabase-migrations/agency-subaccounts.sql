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
