-- CARTERA 020C.3 conflict persistence receipt hardening.
-- Additive remote-discovered repair. Deployed migration history remains immutable.
-- A BLOCKED conflict response may be returned only after the exact append-only row
-- is inserted or an identical previously persisted row is verified.

begin;

create or replace function public.forge_cartera020c_record_conflict(
  p_actor_id uuid,
  p_review_reference text,
  p_conflict_type text,
  p_idempotency_key text,
  p_existing_digest text,
  p_incoming_digest text,
  p_command_reference text,
  p_recorded_at timestamptz
)
returns text
language plpgsql
security definer
set search_path = public, extensions, pg_temp
as $$
declare
  generated_conflict_reference text;
  persisted_conflict public.cartera020c_confirmation_conflicts%rowtype;
begin
  generated_conflict_reference := 'CONFIRMATION_CONFLICT:' || substr(
    public.forge_cartera020c_json_digest(jsonb_build_object(
      'advisorId', p_actor_id,
      'reviewReference', p_review_reference,
      'conflictType', p_conflict_type,
      'idempotencyKey', p_idempotency_key,
      'existingDigest', p_existing_digest,
      'incomingDigest', p_incoming_digest,
      'commandReference', p_command_reference
    )), 1, 40
  );

  perform pg_advisory_xact_lock(hashtextextended(
    p_actor_id::text || '|CARTERA020C_CONFLICT|' || generated_conflict_reference,
    0
  ));

  select * into persisted_conflict
  from public.cartera020c_confirmation_conflicts c
  where c.advisor_id = p_actor_id
    and c.conflict_reference = generated_conflict_reference;

  if persisted_conflict.id is null then
    insert into public.cartera020c_confirmation_conflicts (
      advisor_id, conflict_reference, review_reference, conflict_type,
      idempotency_key, existing_digest, incoming_digest, command_reference,
      recorded_at, recorded_by
    ) values (
      p_actor_id, generated_conflict_reference, p_review_reference, p_conflict_type,
      p_idempotency_key, p_existing_digest, p_incoming_digest,
      p_command_reference, p_recorded_at, p_actor_id
    ) returning * into persisted_conflict;
  end if;

  if persisted_conflict.id is null then
    raise exception 'CARTERA020C_CONFLICT_PERSISTENCE_FAILED';
  end if;

  if persisted_conflict.advisor_id is distinct from p_actor_id
     or persisted_conflict.conflict_reference is distinct from generated_conflict_reference
     or persisted_conflict.review_reference is distinct from p_review_reference
     or persisted_conflict.conflict_type is distinct from p_conflict_type
     or persisted_conflict.idempotency_key is distinct from p_idempotency_key
     or persisted_conflict.existing_digest is distinct from p_existing_digest
     or persisted_conflict.incoming_digest is distinct from p_incoming_digest
     or persisted_conflict.command_reference is distinct from p_command_reference
     or persisted_conflict.recorded_by is distinct from p_actor_id then
    raise exception 'CARTERA020C_CONFLICT_PERSISTENCE_MISMATCH';
  end if;

  return persisted_conflict.conflict_reference;
end;
$$;

comment on function public.forge_cartera020c_record_conflict(
  uuid,text,text,text,text,text,text,timestamptz
) is
  'Append-only idempotent conflict recorder that returns only after exact persisted-row verification.';

commit;
