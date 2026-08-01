-- CARTERA 020C.3 conflict insert ambiguity hardening.
-- Additive remote-discovered repair. This migration does not rewrite deployed history.
-- Canonical mutation remains confined to accepted CARTERA 010B governed RPCs.

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

  insert into public.cartera020c_confirmation_conflicts (
    advisor_id, conflict_reference, review_reference, conflict_type,
    idempotency_key, existing_digest, incoming_digest, command_reference,
    recorded_at, recorded_by
  ) values (
    p_actor_id, generated_conflict_reference, p_review_reference, p_conflict_type,
    p_idempotency_key, p_existing_digest, p_incoming_digest,
    p_command_reference, p_recorded_at, p_actor_id
  ) on conflict on constraint
    cartera020c_confirmation_conflicts_advisor_id_conflict_reference_key
    do nothing;

  return generated_conflict_reference;
end;
$$;

comment on function public.forge_cartera020c_record_conflict(
  uuid,text,text,text,text,text,text,timestamptz
) is
  'Append-only conflict recorder hardened against PL/pgSQL variable/column ambiguity with explicit unique-constraint targeting.';

commit;
