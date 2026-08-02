-- CRS 06E temporary pgcrypto digest compatibility
-- Required only while the accepted 00600 migration is compiled on Supabase,
-- where pgcrypto lives in the extensions schema rather than public.

begin;

create or replace function public.digest(p_data bytea, p_algorithm text)
returns bytea
language sql
immutable
strict
parallel safe
set search_path = extensions, pg_temp
as $$
  select extensions.digest(p_data, p_algorithm);
$$;

revoke all on function public.digest(bytea, text)
  from public, anon, authenticated;

commit;
