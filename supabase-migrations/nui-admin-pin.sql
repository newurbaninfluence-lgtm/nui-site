-- NUI back office PIN sign-in (NUI only — tenant apps are not affected).
-- The PIN itself is never stored here or in the repo: set it with the
-- one-time insert run by hand (scrypt hash + random salt), or change it
-- from Back Office → User Management → Change PIN.

create table if not exists public.nui_admin_pin (
  id          int primary key default 1 check (id = 1),
  pin_hash    text not null,
  pin_salt    text not null,
  updated_at  timestamptz not null default now()
);

create table if not exists public.nui_admin_pin_attempts (
  key           text primary key,          -- network address, or '*all*' for the overall counter
  fails         int not null default 0,
  window_start  timestamptz,
  locked_until  timestamptz,
  updated_at    timestamptz not null default now()
);

-- Service role only: no policies, so the public (anon) key can't read or write these.
alter table public.nui_admin_pin enable row level security;
alter table public.nui_admin_pin_attempts enable row level security;
revoke all on public.nui_admin_pin, public.nui_admin_pin_attempts from anon, authenticated;
