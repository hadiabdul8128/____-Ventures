-- Cohort deals: the partner perk database, each founder's Rho step, and
-- requests for deals we don't list yet. Members only (see 20261014 for the
-- is_cohort_member / is_cohort_admin helpers). Idempotent, safe to re-run.

-- ---------------------------------------------------------------- deals --

create table if not exists public.deals (
  id         bigint generated always as identity primary key,
  name       text not null,
  url        text not null unique,
  domain     text,
  category   text not null,
  blurb      text,
  sort       int not null default 0,
  created_at timestamptz not null default now()
);

comment on table public.deals is
  'Partner deals shown on the cohort dashboard. Seeded from supabase/seed/deals.csv '
  'by scripts/build-deals-seed.py; add rows here to list more.';

alter table public.deals enable row level security;

drop policy if exists "members read deals" on public.deals;
create policy "members read deals"
  on public.deals
  for select
  to authenticated
  using (public.is_cohort_member());

-- ------------------------------------------------------------- progress --

-- Step 1 is incorporating OR banking through Rho. Founders mark it done
-- themselves; admins can see (and reset) everyone's status.
create table if not exists public.cohort_progress (
  email       text primary key references public.cohort_members (email) on delete cascade,
  rho_path    text check (rho_path in ('incorporation', 'banking')),
  rho_done_at timestamptz,
  updated_at  timestamptz not null default now()
);

alter table public.cohort_progress enable row level security;

drop policy if exists "members read own progress, admins read all" on public.cohort_progress;
create policy "members read own progress, admins read all"
  on public.cohort_progress
  for select
  to authenticated
  using (
    email = lower(coalesce(auth.jwt() ->> 'email', ''))
    or public.is_cohort_admin()
  );

drop policy if exists "members write own progress" on public.cohort_progress;
create policy "members write own progress"
  on public.cohort_progress
  for insert
  to authenticated
  with check (email = lower(coalesce(auth.jwt() ->> 'email', '')) and public.is_cohort_member());

drop policy if exists "members update own progress" on public.cohort_progress;
create policy "members update own progress"
  on public.cohort_progress
  for update
  to authenticated
  using (email = lower(coalesce(auth.jwt() ->> 'email', '')) or public.is_cohort_admin())
  with check (email = lower(coalesce(auth.jwt() ->> 'email', '')) or public.is_cohort_admin());

-- ------------------------------------------------------- deal requests --

create table if not exists public.deal_requests (
  id         uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  email      text not null,
  companies  text not null,
  note       text,
  source     text not null default 'form' check (source in ('form', 'chat')),
  status     text not null default 'new'
);

alter table public.deal_requests enable row level security;

drop policy if exists "members submit deal requests" on public.deal_requests;
create policy "members submit deal requests"
  on public.deal_requests
  for insert
  to authenticated
  with check (email = lower(coalesce(auth.jwt() ->> 'email', '')) and public.is_cohort_member());

drop policy if exists "members read own requests, admins read all" on public.deal_requests;
create policy "members read own requests, admins read all"
  on public.deal_requests
  for select
  to authenticated
  using (
    email = lower(coalesce(auth.jwt() ->> 'email', ''))
    or public.is_cohort_admin()
  );

-- ---------------------------------------------------------- rho content --

-- The Rho step's copy lives with the rest of the cohort content so it can be
-- edited without a redeploy. Only set when missing.
update public.cohort_content
set data = jsonb_set(data, '{rho}', jsonb_build_object(
  'headline', 'incorporate or bank through Rho',
  'fee', '$2,000',
  'body', 'because Boston Square Ventures partners with Rho, your $2,000 setup fee is waived. incorporate your company or open your business bank account through Rho, and every other deal unlocks.',
  'href', 'https://www.rho.co',
  'cta', 'start with Rho'
))
where cohort = 'cohort-01' and not (data ? 'rho');
