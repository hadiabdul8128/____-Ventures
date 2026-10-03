-- Founder dashboard: compute requests and the manual VC unlock board.
-- Run once in the Supabase SQL editor. Idempotent, safe to re-run.

-- ---------------------------------------------------------------- compute --

create table if not exists public.compute_requests (
  id         uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  founder    text not null,
  email      text not null,
  need       text not null,
  tools      text,
  status     text not null default 'new',
  source     text default 'dashboard'
);

comment on table public.compute_requests is
  'Compute requests from the founder dashboard. The anon key may only INSERT; '
  'read them in the Supabase dashboard or with the service role key.';

alter table public.compute_requests enable row level security;

drop policy if exists "anon can submit compute requests" on public.compute_requests;
create policy "anon can submit compute requests"
  on public.compute_requests
  for insert
  to anon
  with check (true);

-- -------------------------------------------------------------- vc board --

-- Unlocks are manual. Soneesh and Hadi set `status` (and `firm`, once the
-- names are decided); the dashboard only reads. There is no automatic rule.
create table if not exists public.vc_unlocks (
  id         uuid primary key default gen_random_uuid(),
  position   int not null unique,
  firm       text,
  status     text not null default 'locked'
               check (status in ('locked', 'unlocked', 'intro_requested', 'intro_made')),
  note       text,
  updated_at timestamptz not null default now()
);

comment on table public.vc_unlocks is
  'One row per investor slot. Flip status to unlocked when a founder is ready; '
  'firm stays null until the 15 names are chosen.';

alter table public.vc_unlocks enable row level security;

-- Founders read the board. Only the service role writes to it.
drop policy if exists "anon can read vc unlocks" on public.vc_unlocks;
create policy "anon can read vc unlocks"
  on public.vc_unlocks
  for select
  to anon
  using (true);

-- Seed the 15 empty slots.
insert into public.vc_unlocks (position)
select generate_series(1, 15)
on conflict (position) do nothing;
