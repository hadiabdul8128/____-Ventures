-- Waitlist dashboard (/waitlist). Anyone can create an account; each person
-- sees and updates only their own row. The two steps are self-reported.
-- Supabase Auth is shared with other apps, so rows are keyed by auth uid.

create table if not exists public.waitlist_members (
  user_id          uuid primary key references auth.users (id) on delete cascade,
  email            text not null,
  created_at       timestamptz not null default now(),
  rho_done_at      timestamptz,
  bluevine_done_at timestamptz
);

comment on table public.waitlist_members is
  'BSV waitlist dashboard. One row per signed-in person; steps are self-reported.';

alter table public.waitlist_members enable row level security;

drop policy if exists "waitlist: read own row" on public.waitlist_members;
create policy "waitlist: read own row" on public.waitlist_members
  for select to authenticated using (user_id = auth.uid());

drop policy if exists "waitlist: create own row" on public.waitlist_members;
create policy "waitlist: create own row" on public.waitlist_members
  for insert to authenticated
  with check (user_id = auth.uid() and email = (auth.jwt() ->> 'email'));

drop policy if exists "waitlist: update own row" on public.waitlist_members;
create policy "waitlist: update own row" on public.waitlist_members
  for update to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid() and email = (auth.jwt() ->> 'email'));

-- Admins (cohort_members role = admin) can see the whole waitlist.
drop policy if exists "waitlist: admins read all" on public.waitlist_members;
create policy "waitlist: admins read all" on public.waitlist_members
  for select to authenticated
  using (public.is_cohort_admin());

revoke all on public.waitlist_members from anon;
