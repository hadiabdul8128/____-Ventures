# Applications on Supabase

The apply form writes to a Supabase project: one row per application in `public.applications`, and an optional resume in the private `resumes` storage bucket.

## 1. Create the table and bucket

In the Supabase dashboard open **SQL Editor → New query**, paste the contents of `supabase/migrations/20261001000000_applications.sql`, and run it. It is idempotent, so re-running is safe.

## 2. Find the project URL and anon key

**Project Settings → API**. Copy **Project URL** and the **anon / public** key.

## 3. Set the env vars

Locally, create `.env.local` in the repo root (it is git-ignored; `.env.example` lists the names):

```
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
```

Restart `npm run dev` after changing it.

On Vercel, add the same two variables for each environment you deploy, then redeploy:

```sh
vercel env add VITE_SUPABASE_URL production
vercel env add VITE_SUPABASE_ANON_KEY production
vercel env add VITE_SUPABASE_URL preview
vercel env add VITE_SUPABASE_ANON_KEY preview
```

Until both variables are set, the form shows "applications aren't wired up yet — email us instead" and nothing is sent.

## About the anon key

The anon key ships to the browser on purpose; it only identifies the project. Row Level Security is what protects the data: the policies in the migration let the `anon` role **insert** applications and **upload** resumes, and nothing else. Read submissions in the dashboard (**Table Editor → applications**, **Storage → resumes**) or with the service role key on a server you control. Never put the service role key in the site.
