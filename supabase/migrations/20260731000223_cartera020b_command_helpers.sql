-- CARTERA 020B governed command helpers.
-- Repository construction only. This migration is NOT remote deployment authorization.

begin;

create extension if not exists pgcrypto;

create or replace function public.forge_cartera020b_command_digest(p_command jsonb)
returns text
language plpgsql
immutable
set search_path = public, extensions, pg_temp
as $$
begin
  if p_command is null or jsonb_typeof(p_command) <> 'object' then
    raise exception 'CARTERA020B_COMMAND_OBJECT_REQUIRED';
  end if;
  return encode(digest((p_command - 'commandDigest')::text, 'sha256'), 'hex');
end;
$$;

create or replace function public.forge_cartera020b_jsonb_keys_allowed(
  p_value jsonb,
  p_allowed text[]
)
returns boolean
language sql
immutable
set search_path = public, pg_temp
as $$
  select p_value is not null
    and jsonb_typeof(p_value) = 'object'
    and not exists (
      select 1
      from jsonb_object_keys(p_value) supplied(key)
      where not (supplied.key = any(p_allowed))
    );
$$;

create or replace function public.forge_cartera020b_string_array_valid(
  p_value jsonb,
  p_minimum integer default 0,
  p_maximum integer default 100
)
returns boolean
language plpgsql
immutable
set search_path = public, pg_temp
as $$
declare
  item jsonb;
begin
  if p_value is null
     or jsonb_typeof(p_value) <> 'array'
     or jsonb_array_length(p_value) < p_minimum
     or jsonb_array_length(p_value) > p_maximum then
    return false;
  end if;
  for item in select value from jsonb_array_elements(p_value)
  loop
    if jsonb_typeof(item) <> 'string' or length(item #>> '{}') > 500 then
      return false;
    end if;
  end loop;
  return true;
end;
$$;

create or replace function public.forge_cartera020b_has_forbidden_payload_keys(
  p_value jsonb,
  p_depth integer default 0
)
returns boolean
language plpgsql
immutable
set search_path = public, pg_temp
as $$
declare
  item record;
  child jsonb;
  forbidden text[] := array[
    'rawdocument','raw_document','rawtext','raw_text',
    'documentbytes','document_bytes','extractedtext','extracted_text',
    'accesstoken','access_token','refreshtoken','refresh_token'
  ];
begin
  if p_depth > 20 then return true; end if;
  if p_value is null then return false; end if;
  if jsonb_typeof(p_value) = 'object' then
    for item in select key, value from jsonb_each(p_value)
    loop
      if lower(item.key) = any(forbidden) then return true; end if;
      if public.forge_cartera020b_has_forbidden_payload_keys(item.value, p_depth + 1) then return true; end if;
    end loop;
  elsif jsonb_typeof(p_value) = 'array' then
    for child in select value from jsonb_array_elements(p_value)
    loop
      if public.forge_cartera020b_has_forbidden_payload_keys(child, p_depth + 1) then return true; end if;
    end loop;
  end if;
  return false;
end;
$$;

create or replace function public.forge_cartera020b_existing_receipt_response(
  p_actor_id uuid,
  p_command_type text,
  p_idempotency_key text,
  p_command_digest text
)
returns jsonb
language plpgsql
security definer
set search_path = public, extensions, pg_temp
as $$
declare
  receipt public.cartera020b_command_receipts%rowtype;
  conflict_reference text;
begin
  select * into receipt
  from public.cartera020b_command_receipts r
  where r.advisor_id = p_actor_id
    and r.command_type = p_command_type
    and r.idempotency_key = p_idempotency_key;

  if receipt.id is null then return null; end if;
  if receipt.command_digest = p_command_digest then
    return receipt.response_payload || jsonb_build_object('replayed', true);
  end if;

  conflict_reference := 'COMMAND_REPLAY_CONFLICT:' || substr(
    encode(digest(
      p_actor_id::text || '|' || p_command_type || '|' ||
      p_idempotency_key || '|' || p_command_digest,
      'sha256'
    ), 'hex'), 1, 40
  );

  insert into public.cartera020b_command_conflicts (
    advisor_id, conflict_reference, command_type, idempotency_key,
    existing_digest, received_digest, reason_code
  ) values (
    p_actor_id, conflict_reference, p_command_type, p_idempotency_key,
    receipt.command_digest, p_command_digest, 'CHANGED_INPUT_REPLAY'
  ) on conflict (advisor_id, conflict_reference) do nothing;

  return jsonb_build_object(
    'status', 'CONFLICT',
    'conflictType', 'CHANGED_INPUT_REPLAY',
    'conflictReference', conflict_reference,
    'idempotencyKey', p_idempotency_key,
    'serverCommandDigest', p_command_digest,
    'replayed', false,
    'createsPolicy', false
  );
end;
$$;

create or replace function public.forge_cartera020b_persist_receipt(
  p_actor_id uuid,
  p_command_type text,
  p_idempotency_key text,
  p_command_digest text,
  p_response jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  insert into public.cartera020b_command_receipts (
    advisor_id, command_type, idempotency_key, command_digest, response_payload
  ) values (
    p_actor_id, p_command_type, p_idempotency_key, p_command_digest, p_response
  );
  return p_response;
end;
$$;

revoke all on function public.forge_cartera020b_command_digest(jsonb) from public, anon, authenticated;
revoke all on function public.forge_cartera020b_jsonb_keys_allowed(jsonb, text[]) from public, anon, authenticated;
revoke all on function public.forge_cartera020b_string_array_valid(jsonb, integer, integer) from public, anon, authenticated;
revoke all on function public.forge_cartera020b_has_forbidden_payload_keys(jsonb, integer) from public, anon, authenticated;
revoke all on function public.forge_cartera020b_existing_receipt_response(uuid, text, text, text) from public, anon, authenticated;
revoke all on function public.forge_cartera020b_persist_receipt(uuid, text, text, text, jsonb) from public, anon, authenticated;

commit;