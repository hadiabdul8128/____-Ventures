-- Cohort dashboard behind a real login.
--
-- This Supabase project's auth is shared with other apps (sign-ups are open for
-- the course site), so "signed in" is not enough. Access is an allowlist:
-- a signed-in user whose email is in cohort_members. Accounts are created by
-- /api/cohort-invite (admins only), which returns a set-password link.
--
-- Idempotent, safe to re-run.

-- ------------------------------------------------------------- members --

create table if not exists public.cohort_members (
  email      text primary key check (email = lower(email)),
  name       text,
  company    text,
  role       text not null default 'founder' check (role in ('founder', 'admin')),
  cohort     text not null default 'cohort-01',
  created_at timestamptz not null default now()
);

comment on table public.cohort_members is
  'Who can open the cohort dashboard. Email must match the auth user''s email. '
  'role = admin can see and manage the member list.';

alter table public.cohort_members enable row level security;

-- Security definer so the policies below can consult the allowlist without
-- recursing through cohort_members' own RLS.
create or replace function public.is_cohort_member()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.cohort_members
    where email = lower(coalesce(auth.jwt() ->> 'email', ''))
  );
$$;

create or replace function public.is_cohort_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.cohort_members
    where email = lower(coalesce(auth.jwt() ->> 'email', ''))
      and role = 'admin'
  );
$$;

revoke all on function public.is_cohort_member() from public, anon;
revoke all on function public.is_cohort_admin() from public, anon;
grant execute on function public.is_cohort_member() to authenticated;
grant execute on function public.is_cohort_admin() to authenticated;

drop policy if exists "members read self, admins read all" on public.cohort_members;
create policy "members read self, admins read all"
  on public.cohort_members
  for select
  to authenticated
  using (
    email = lower(coalesce(auth.jwt() ->> 'email', ''))
    or public.is_cohort_admin()
  );

drop policy if exists "admins manage members" on public.cohort_members;
create policy "admins manage members"
  on public.cohort_members
  for all
  to authenticated
  using (public.is_cohort_admin())
  with check (public.is_cohort_admin());

-- ------------------------------------------------------------- content --

-- One JSON document per cohort: curriculum, check-ins, perks, compute list.
-- Kept in the database (not the JS bundle) so only members can read it, and
-- so it can be edited in the Supabase table editor without a redeploy.
create table if not exists public.cohort_content (
  cohort     text primary key,
  data       jsonb not null,
  updated_at timestamptz not null default now()
);

alter table public.cohort_content enable row level security;

drop policy if exists "members read cohort content" on public.cohort_content;
create policy "members read cohort content"
  on public.cohort_content
  for select
  to authenticated
  using (public.is_cohort_member());

-- --------------------------------------------------- existing dashboard --

-- The investor board was anon-readable while the dashboard was dev only.
drop policy if exists "anon can read vc unlocks" on public.vc_unlocks;
drop policy if exists "members read vc unlocks" on public.vc_unlocks;
create policy "members read vc unlocks"
  on public.vc_unlocks
  for select
  to authenticated
  using (public.is_cohort_member());

-- Signed-in founders submit compute requests as `authenticated`, not `anon`.
drop policy if exists "members submit compute requests" on public.compute_requests;
create policy "members submit compute requests"
  on public.compute_requests
  for insert
  to authenticated
  with check (public.is_cohort_member());

drop policy if exists "admins read compute requests" on public.compute_requests;
create policy "admins read compute requests"
  on public.compute_requests
  for select
  to authenticated
  using (public.is_cohort_admin());

-- ---------------------------------------------------------------- seed --

insert into public.cohort_members (email, name, role) values
  ('soneeshkothagundla@gmail.com', 'Soneesh Kothagundla', 'admin'),
  ('hadiabdul@college.harvard.edu', 'Hadi Abdul', 'admin')
on conflict (email) do nothing;
