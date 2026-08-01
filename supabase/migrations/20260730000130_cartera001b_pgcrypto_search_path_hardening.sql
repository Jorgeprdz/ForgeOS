-- CARTERA-001B pgcrypto runtime hardening.
-- Supabase installs pgcrypto in the trusted extensions schema; Quote RPCs must
-- resolve digest(bytea,text) without broadening application-role authority.

begin;

do $cartera001b_pgcrypto$
begin
  if to_regprocedure('extensions.digest(bytea,text)') is null then
    raise exception 'CARTERA001B_PGCRYPTO_DIGEST_NOT_AVAILABLE';
  end if;
end;
$cartera001b_pgcrypto$;

alter function public.forge_cartera001b_confirm_reviewed_quote(
  uuid,
  text,
  jsonb,
  text,
  jsonb,
  jsonb,
  timestamptz,
  text
) set search_path = public, extensions, pg_temp;

alter function public.forge_cartera001b_append_quote_lifecycle_event(
  text,
  text,
  text,
  timestamptz,
  text,
  jsonb,
  text,
  text,
  text,
  text
) set search_path = public, extensions, pg_temp;

commit;
