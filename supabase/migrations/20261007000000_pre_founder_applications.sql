-- Pre-founder track: people we connect with startups that are hiring.
-- Run once in the Supabase SQL editor. Resumes reuse the private `resumes`
-- bucket under the `pre-founder/` prefix; its anon upload policy already applies.

create table if not exists public.pre_founder_applications (
  id              uuid primary key default gen_random_uuid(),
  created_at      timestamptz not null default now(),
  first_name      text not null,
  last_name       text not null,
  email           text not null,
  school          text not null,
  education_level text,
  grad_year       text,
  field_of_study  text,
  linkedin        text,
  resume_path     text not null,
  user_agent      text,
  source          text default 'web'
);

comment on table public.pre_founder_applications is
  'Pre-founder track applications from the website. The anon key may only INSERT; '
  'admins read rows through the Supabase dashboard or with the service role key.';

alter table public.pre_founder_applications enable row level security;

drop policy if exists "anon can submit pre-founder applications"
  on public.pre_founder_applications;
create policy "anon can submit pre-founder applications"
  on public.pre_founder_applications
  for insert
  to anon
  with check (true);
