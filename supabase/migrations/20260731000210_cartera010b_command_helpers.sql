-- CARTERA 010B.3 GOVERNED IDENTITY / CONFIRMED POLICY COMMAND RPCS
-- Repository implementation only. This migration is NOT remote deployment authorization.
-- Canonical writes remain available only through bounded security-definer commands.

begin;

create extension if not exists pgcrypto;

create or replace function public.forge_cartera010b_command_digest(
  p_command jsonb
)
returns text
language plpgsql
immutable
set search_path = public, extensions, pg_temp
as $$
begin
  if p_command is null or jsonb_typeof(p_command) <> 'object' then
    raise exception 'CARTERA010B_COMMAND_OBJECT_REQUIRED';
  end if;

  return encode(
    digest((p_command - 'commandDigest')::text, 'sha256'),
    'hex'
  );
end;
$$;

create or replace function public.forge_cartera010b_reference_array_valid(
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
  item_text text;
begin
  if p_value is null
     or jsonb_typeof(p_value) <> 'array'
     or jsonb_array_length(p_value) < p_minimum
     or jsonb_array_length(p_value) > p_maximum then
    return false;
  end if;

  for item in select value from jsonb_array_elements(p_value)
  loop
    if jsonb_typeof(item) <> 'string' then
      return false;
    end if;

    item_text := item #>> '{}';
    if item_text !~ '^[A-Za-z0-9][A-Za-z0-9._:@/-]{0,239}$' then
      return false;
    end if;
  end loop;

  if (
    select count(*) from jsonb_array_elements_text(p_value)
  ) <> (
    select count(distinct value) from jsonb_array_elements_text(p_value)
  ) then
    return false;
  end if;

  return true;
end;
$$;

-- The foundation originally made source links fully append-only. Corrections need
-- one narrowly governed transition: closing the prior effective period. No other
-- column may change and direct authenticated writes remain revoked.
create or replace function public.forge_cartera010b_source_link_supersession_guard()
returns trigger
language plpgsql
security invoker
set search_path = public, pg_temp
as $$
begin
  if tg_op = 'DELETE' then
    raise exception 'CARTERA010B_APPEND_ONLY';
  end if;

  if current_setting('forge.cartera010b_governed_command', true) <> 'on' then
    raise exception 'CARTERA010B_APPEND_ONLY';
  end if;

  if new.id is distinct from old.id
     or new.advisor_id is distinct from old.advisor_id
     or new.link_reference is distinct from old.link_reference
     or new.person_id is distinct from old.person_id
     or new.source_domain is distinct from old.source_domain
     or new.source_identity_type is distinct from old.source_identity_type
     or new.source_record_reference is distinct from old.source_record_reference
     or new.prospect_id is distinct from old.prospect_id
     or new.match_status is distinct from old.match_status
     or new.decision_id is distinct from old.decision_id
     or new.evidence_references is distinct from old.evidence_references
     or new.idempotency_key is distinct from old.idempotency_key
     or new.command_digest is distinct from old.command_digest
     or new.effective_from is distinct from old.effective_from
     or new.correction_of is distinct from old.correction_of
     or new.created_at is distinct from old.created_at
     or new.created_by is distinct from old.created_by then
    raise exception 'CARTERA010B_SOURCE_LINK_SUPERSESSION_FIELDS_INVALID';
  end if;

  if old.effective_to is not null
     or new.effective_to is null
     or new.effective_to <= old.effective_from then
    raise exception 'CARTERA010B_SOURCE_LINK_SUPERSESSION_RANGE_INVALID';
  end if;

  return new;
end;
$$;

drop trigger if exists forge_cartera010b_append_only_guard
  on public.commercial_source_identity_links;
drop trigger if exists forge_cartera010b_source_link_supersession_guard
  on public.commercial_source_identity_links;
create trigger forge_cartera010b_source_link_supersession_guard
before update or delete on public.commercial_source_identity_links
for each row execute function public.forge_cartera010b_source_link_supersession_guard();

revoke all on function public.forge_cartera010b_command_digest(jsonb)
  from public, anon, authenticated;
revoke all on function public.forge_cartera010b_reference_array_valid(jsonb, integer, integer)
  from public, anon, authenticated;

commit;
