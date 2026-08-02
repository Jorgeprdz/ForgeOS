-- CRS 06E internal function grant hardening
-- Internal validation, digest and trigger functions are owner-only.

begin;

revoke execute on function public.forge_crs06_valid_reference_array(jsonb)
  from public, anon, authenticated;
revoke execute on function public.forge_crs06_event_digest(jsonb)
  from public, anon, authenticated;
revoke execute on function public.forge_crs06_deny_append_only_mutation()
  from public, anon, authenticated;

commit;
