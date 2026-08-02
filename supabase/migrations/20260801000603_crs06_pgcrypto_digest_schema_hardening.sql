-- CRS 06E pgcrypto schema hardening
-- Rebind the durable digest authority directly to extensions.pgcrypto,
-- then retire the temporary public compatibility wrapper.

begin;

create or replace function public.forge_crs06_event_digest(p_value jsonb)
returns text
language sql
immutable
set search_path = public, extensions, pg_temp
as $$
  select encode(
    extensions.digest(convert_to(p_value::text, 'UTF8'), 'sha256'::text),
    'hex'
  );
$$;

revoke execute on function public.forge_crs06_event_digest(jsonb)
  from public, anon, authenticated;

drop function if exists public.digest(bytea, text);

commit;
