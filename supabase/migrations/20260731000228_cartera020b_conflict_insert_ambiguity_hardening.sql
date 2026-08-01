-- CARTERA 020B additive PostgreSQL ambiguity hardening.
-- Fixes the deployed replay helper without rewriting migration history.

begin;

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
  generated_conflict_reference text;
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

  generated_conflict_reference := 'COMMAND_REPLAY_CONFLICT:' || substr(
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
    p_actor_id, generated_conflict_reference, p_command_type, p_idempotency_key,
    receipt.command_digest, p_command_digest, 'CHANGED_INPUT_REPLAY'
  ) on conflict on constraint
    cartera020b_command_conflicts_advisor_id_conflict_reference_key
    do nothing;

  return jsonb_build_object(
    'status', 'CONFLICT',
    'conflictType', 'CHANGED_INPUT_REPLAY',
    'conflictReference', generated_conflict_reference,
    'idempotencyKey', p_idempotency_key,
    'serverCommandDigest', p_command_digest,
    'replayed', false,
    'createsPolicy', false
  );
end;
$$;

revoke all on function public.forge_cartera020b_existing_receipt_response(uuid, text, text, text)
  from public, anon, authenticated;

commit;
