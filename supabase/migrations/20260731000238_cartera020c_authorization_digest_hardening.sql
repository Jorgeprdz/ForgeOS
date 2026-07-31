-- CARTERA 020C.3 authorization payload digest hardening.
-- Repository implementation only. This migration is NOT remote deployment authorization.
-- The public orchestration RPCs now prove that each explicit authorization binds the exact payload.

begin;

create extension if not exists pgcrypto;

create or replace function public.forge_cartera020c_stable_json_text(p_value jsonb)
returns text
language plpgsql
immutable
strict
set search_path = public, pg_temp
as $$
declare
  result text;
begin
  case jsonb_typeof(p_value)
    when 'object' then
      select '{' || coalesce(string_agg(
        to_jsonb(entry.key)::text || ':' || public.forge_cartera020c_stable_json_text(entry.value),
        ',' order by entry.key
      ), '') || '}'
      into result
      from jsonb_each(p_value) as entry;
      return result;
    when 'array' then
      select '[' || coalesce(string_agg(
        public.forge_cartera020c_stable_json_text(item.value),
        ',' order by item.ordinality
      ), '') || ']'
      into result
      from jsonb_array_elements(p_value) with ordinality as item(value, ordinality);
      return result;
    else
      return p_value::text;
  end case;
end;
$$;

create or replace function public.forge_cartera020c_authorization_digest(p_payload jsonb)
returns text
language sql
immutable
strict
set search_path = public, extensions, pg_temp
as $$
  select encode(
    digest(
      convert_to(public.forge_cartera020c_stable_json_text(p_payload), 'UTF8'),
      'sha256'
    ),
    'hex'
  );
$$;

alter function public.forge_cartera020c_prepare_identity_orchestration(jsonb)
  rename to forge_cartera020c_prepare_identity_orchestration_unbound;

create or replace function public.forge_cartera020c_prepare_identity_orchestration(
  p_request jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  authorization jsonb := p_request -> 'authorization';
  payload jsonb := p_request -> 'identityBatch';
  supplied_digest text := authorization ->> 'payloadDigest';
  expected_digest text;
begin
  if payload is null or jsonb_typeof(payload) <> 'object' then
    raise exception 'CARTERA020C_IDENTITY_AUTHORIZATION_PAYLOAD_INVALID';
  end if;
  expected_digest := public.forge_cartera020c_authorization_digest(payload);
  if supplied_digest is distinct from expected_digest then
    raise exception 'CARTERA020C_IDENTITY_AUTHORIZATION_DIGEST_MISMATCH';
  end if;
  return public.forge_cartera020c_prepare_identity_orchestration_unbound(p_request);
end;
$$;

alter function public.forge_cartera020c_attach_policy_confirmation(jsonb)
  rename to forge_cartera020c_attach_policy_confirmation_unbound;

create or replace function public.forge_cartera020c_attach_policy_confirmation(
  p_request jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  authorization jsonb := p_request -> 'authorization';
  payload jsonb := p_request -> 'composition';
  supplied_digest text := authorization ->> 'payloadDigest';
  expected_digest text;
begin
  if payload is null or jsonb_typeof(payload) <> 'object' then
    raise exception 'CARTERA020C_POLICY_AUTHORIZATION_PAYLOAD_INVALID';
  end if;
  expected_digest := public.forge_cartera020c_authorization_digest(payload);
  if supplied_digest is distinct from expected_digest then
    raise exception 'CARTERA020C_POLICY_AUTHORIZATION_DIGEST_MISMATCH';
  end if;
  return public.forge_cartera020c_attach_policy_confirmation_unbound(p_request);
end;
$$;

revoke all on function public.forge_cartera020c_stable_json_text(jsonb)
  from public, anon, authenticated;
revoke all on function public.forge_cartera020c_authorization_digest(jsonb)
  from public, anon, authenticated;
revoke all on function public.forge_cartera020c_prepare_identity_orchestration_unbound(jsonb)
  from public, anon, authenticated;
revoke all on function public.forge_cartera020c_attach_policy_confirmation_unbound(jsonb)
  from public, anon, authenticated;
revoke all on function public.forge_cartera020c_prepare_identity_orchestration(jsonb)
  from public, anon;
revoke all on function public.forge_cartera020c_attach_policy_confirmation(jsonb)
  from public, anon;

grant execute on function public.forge_cartera020c_prepare_identity_orchestration(jsonb)
  to authenticated;
grant execute on function public.forge_cartera020c_attach_policy_confirmation(jsonb)
  to authenticated;

comment on function public.forge_cartera020c_authorization_digest(jsonb) is
  'Canonical UTF-8 SHA-256 over recursively key-sorted compact JSON used to bind explicit 020C authorizations.';
comment on function public.forge_cartera020c_prepare_identity_orchestration(jsonb) is
  'Digest-bound wrapper around the durable Identity preparation authority.';
comment on function public.forge_cartera020c_attach_policy_confirmation(jsonb) is
  'Digest-bound wrapper around the separate confirmed Policy authorization authority.';

commit;
