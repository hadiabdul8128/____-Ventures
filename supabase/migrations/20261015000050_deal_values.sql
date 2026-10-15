-- What each deal is worth (supabase/seed/deal_values.csv, provided by the team).
--   offer             the perk as Rho states it
--   value_amount      estimated value in USD (null when it has no fixed value)
--   value_confidence  high = the dollar amount is stated in the offer;
--                     medium/low = estimated, shown as "~$X est." on the site
-- The values themselves are written by 20261015000100_deals_seed.sql, which runs after this.

alter table public.deals add column if not exists offer text;
alter table public.deals add column if not exists value_amount int;
alter table public.deals add column if not exists value_confidence text
  check (value_confidence in ('high', 'medium', 'low'));
