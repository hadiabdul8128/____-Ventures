-- Step 1 needs proof. Founders upload proof that they incorporated or bank
-- through Rho; Soneesh or Hadi review it, and only an approval unlocks deals.
-- Idempotent, safe to re-run.

alter table public.cohort_progress
  add column if not exists rho_status text not null default 'none'
    check (rho_status in ('none', 'pending', 'approved', 'rejected')),
  add column if not exists proof_path   text,
  add column if not exists submitted_at timestamptz,
  add column if not exists reviewed_at  timestamptz,
  add column if not exists reviewed_by  text,
  add column if not exists review_note  text;

-- rho_done_at (what the dashboard treats as "unlocked") follows the review:
-- set when approved, cleared otherwise. Founders can't set it directly.
create or replace function public.cohort_progress_sync_unlock()
returns trigger
language plpgsql
as $$
begin
  if new.rho_status = 'approved' then
    new.rho_done_at := coalesce(new.rho_done_at, now());
  else
    new.rho_done_at := null;
  end if;
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists cohort_progress_sync_unlock on public.cohort_progress;
create trigger cohort_progress_sync_unlock
  before insert or update on public.cohort_progress
  for each row execute function public.cohort_progress_sync_unlock();

-- Anyone who unlocked with the old one-click button has to send proof now.
update public.cohort_progress
set rho_status = 'none'
where rho_status = 'none' and rho_done_at is not null;

-- ------------------------------------------------------------- policies --

drop policy if exists "members write own progress" on public.cohort_progress;
drop policy if exists "members update own progress" on public.cohort_progress;
drop policy if exists "members submit own proof" on public.cohort_progress;
drop policy if exists "members resubmit own proof" on public.cohort_progress;
drop policy if exists "admins review progress" on public.cohort_progress;
drop policy if exists "admins add progress" on public.cohort_progress;

-- Founders can only ever put their own row into 'pending', unreviewed.
create policy "members submit own proof"
  on public.cohort_progress
  for insert
  to authenticated
  with check (
    email = lower(coalesce(auth.jwt() ->> 'email', ''))
    and public.is_cohort_member()
    and rho_status = 'pending'
    and reviewed_at is null
    and reviewed_by is null
  );

-- ...and replace their proof until it's approved.
create policy "members resubmit own proof"
  on public.cohort_progress
  for update
  to authenticated
  using (email = lower(coalesce(auth.jwt() ->> 'email', '')) and rho_status <> 'approved')
  with check (
    email = lower(coalesce(auth.jwt() ->> 'email', ''))
    and rho_status = 'pending'
    and reviewed_at is null
    and reviewed_by is null
  );

create policy "admins review progress"
  on public.cohort_progress
  for update
  to authenticated
  using (public.is_cohort_admin())
  with check (public.is_cohort_admin());

create policy "admins add progress"
  on public.cohort_progress
  for insert
  to authenticated
  with check (public.is_cohort_admin());

-- -------------------------------------------------------------- storage --

-- Private bucket: 10 MB, PDFs and images. Files live under the uploader's
-- auth uid, so founders can only write (and read) their own folder.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'rho-proofs',
  'rho-proofs',
  false,
  10485760,
  array['application/pdf', 'image/png', 'image/jpeg', 'image/webp', 'image/heic']
)
on conflict (id) do nothing;

drop policy if exists "members upload own rho proof" on storage.objects;
create policy "members upload own rho proof"
  on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id = 'rho-proofs'
    and (storage.foldername(name))[1] = auth.uid()::text
    and public.is_cohort_member()
  );

drop policy if exists "members read own rho proof, admins read all" on storage.objects;
create policy "members read own rho proof, admins read all"
  on storage.objects
  for select
  to authenticated
  using (
    bucket_id = 'rho-proofs'
    and ((storage.foldername(name))[1] = auth.uid()::text or public.is_cohort_admin())
  );
