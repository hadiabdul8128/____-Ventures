-- Cohort applications submitted from the public site.
-- Run this once in the Supabase SQL editor (see supabase/README.md).

create table if not exists public.applications (
  id          uuid primary key default gen_random_uuid(),
  created_at  timestamptz not null default now(),
  name        text not null,
  email       text not null,
  school      text,
  stage       text,
  building    text not null,
  achievement text,
  linkedin    text,
  link        text,
  resume_path text,
  user_agent  text,
  source      text default 'web'
);

-- Added after the first deploy; safe to re-run.
alter table public.applications add column if not exists linkedin text;
alter table public.applications add column if not exists achievement text;

comment on table public.applications is
  'Applications from the website apply form. The anon key may only INSERT; '
  'admins read rows through the Supabase dashboard or with the service role key, '
  'never from the browser.';

alter table public.applications enable row level security;

-- Visitors can submit, but never read, update, or delete applications.
drop policy if exists "anon can submit applications" on public.applications;
create policy "anon can submit applications"
  on public.applications
  for insert
  to anon
  with check (true);

-- Private bucket for resumes: 5 MB cap, PDF / Word only.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'resumes',
  'resumes',
  false,
  5242880,
  array[
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ]
)
on conflict (id) do nothing;

-- Visitors can upload into `resumes` only; listing/downloading requires the
-- dashboard or a service-role signed URL.
drop policy if exists "anon can upload resumes" on storage.objects;
create policy "anon can upload resumes"
  on storage.objects
  for insert
  to anon
  with check (bucket_id = 'resumes');
