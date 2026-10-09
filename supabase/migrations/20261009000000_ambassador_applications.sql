-- Campus ambassador program applications from the public site.
-- Run once in the Supabase SQL editor. Resumes (optional) reuse the private
-- `resumes` bucket under the `ambassador/` prefix.

create table if not exists public.ambassador_applications (
  id          uuid primary key default gen_random_uuid(),
  created_at  timestamptz not null default now(),
  first_name  text not null,
  last_name   text not null,
  email       text not null,
  school      text not null,
  grad_year   text,
  linkedin    text,
  why         text not null,
  resume_path text,
  user_agent  text,
  source      text default 'web'
);

comment on table public.ambassador_applications is
  'Campus ambassador applications from the website. The anon key may only INSERT; '
  'admins read rows through the Supabase dashboard or with the service role key.';

alter table public.ambassador_applications enable row level security;

drop policy if exists "anon can submit ambassador applications"
  on public.ambassador_applications;
create policy "anon can submit ambassador applications"
  on public.ambassador_applications
  for insert
  to anon
  with check (true);
