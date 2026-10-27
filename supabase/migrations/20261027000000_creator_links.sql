-- Creator program: one tracking link per creator, bostonsquareventures.com/r/<code>.
-- The site remembers the code for 30 days and sends it as `ref` with any
-- application (fellowship, pre-founder, scout). No foreign key on purpose: an
-- unknown code must never make an application fail to save.

create table if not exists public.creator_links (
  code       text primary key check (code ~ '^[a-z0-9]{4,12}$'),
  slot       int unique,
  creator    text,
  handle     text,
  platform   text,
  followers  int,
  paid_at    timestamptz,
  notes      text,
  created_at timestamptz not null default now()
);

alter table public.creator_links enable row level security;
revoke all on public.creator_links from anon, authenticated;
grant select, insert, update on public.creator_links to authenticated;

drop policy if exists "admins manage creator links" on public.creator_links;
create policy "admins manage creator links" on public.creator_links
  for all to authenticated
  using (public.is_cohort_admin())
  with check (public.is_cohort_admin());

alter table public.applications
  add column if not exists ref text check (ref is null or ref ~ '^[a-z0-9]{4,12}$');
alter table public.pre_founder_applications
  add column if not exists ref text check (ref is null or ref ~ '^[a-z0-9]{4,12}$');
alter table public.ambassador_applications
  add column if not exists ref text check (ref is null or ref ~ '^[a-z0-9]{4,12}$');

-- Applications per link, across all tracks. security_invoker keeps RLS in force.
create or replace view public.creator_link_stats
with (security_invoker = true) as
select l.slot, l.code, l.creator, l.handle, l.followers, l.paid_at,
       count(a.*) filter (where a.track = 'fellowship')  as fellowship,
       count(a.*) filter (where a.track = 'pre-founder') as pre_founder,
       count(a.*) filter (where a.track = 'scout')       as scout,
       count(a.*)                                        as total
from public.creator_links l
left join (
  select ref, 'fellowship' as track from public.applications where ref is not null
  union all select ref, 'pre-founder' from public.pre_founder_applications where ref is not null
  union all select ref, 'scout' from public.ambassador_applications where ref is not null
) a on a.ref = l.code
group by l.slot, l.code, l.creator, l.handle, l.followers, l.paid_at;

revoke all on public.creator_link_stats from anon;

insert into public.creator_links (code, slot) values
  ('4wfp6', 1),
  ('5aktz', 2),
  ('7j92y', 3),
  ('8v5w9', 4),
  ('94ucv', 5)
on conflict (code) do nothing;
