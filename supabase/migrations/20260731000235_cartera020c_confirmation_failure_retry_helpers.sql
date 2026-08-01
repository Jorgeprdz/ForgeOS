-- CARTERA 020C.3 blocking and bounded retry helpers.
-- Repository implementation only. This migration is NOT remote deployment authorization.
-- Canonical mutation remains confined to accepted CARTERA 010B governed RPCs.

begin;

create or replace function public.forge_cartera020c_block_active_command(
  p_actor_id uuid,
  p_review_id uuid,
  p_command_id uuid,
  p_command_status text,
  p_attempt_state text,
  p_conflict_type text,
  p_error_code text,
  p_receipt jsonb,
  p_recorded_at timestamptz
)
returns void
language plpgsql
security definer
set search_path = public, extensions, pg_temp
as $$
declare
  review public.cartera020c_confirmation_reviews%rowtype;
  command public.cartera020c_confirmation_commands%rowtype;
  old_state text;
  conflict_reference text;
  existing_digest text;
  attempt_reference text;
begin
  select * into review
  from public.cartera020c_confirmation_reviews r
  where r.advisor_id = p_actor_id and r.id = p_review_id
  for update;
  select * into command
  from public.cartera020c_confirmation_commands c
  where c.advisor_id = p_actor_id and c.id = p_command_id
  for update;

  if review.id is null or command.id is null then
    raise exception 'CARTERA020C_ACTIVE_COMMAND_NOT_FOUND';
  end if;

  existing_digest := case
    when p_receipt ->> 'serverCommandDigest' ~ '^[a-f0-9]{64}$'
      then p_receipt ->> 'serverCommandDigest'
    else null
  end;
  conflict_reference := public.forge_cartera020c_record_conflict(
    p_actor_id, review.review_reference, p_conflict_type,
    command.idempotency_key, existing_digest, command.command_digest,
    command.command_reference, p_recorded_at
  );

  perform set_config('forge.cartera020c_command', 'on', true);
  update public.cartera020c_confirmation_commands
  set status = p_command_status,
      last_error_code = p_error_code,
      receipt_payload = case when p_receipt is null then null else p_receipt end,
      result_digest = case when p_receipt is null then null else public.forge_cartera020c_json_digest(p_receipt) end,
      executed_at = p_recorded_at,
      next_retry_at = null,
      updated_at = p_recorded_at
  where id = command.id and advisor_id = p_actor_id
  returning * into command;

  attempt_reference := 'CONFIRMATION_ATTEMPT:' || substr(
    public.forge_cartera020c_json_digest(jsonb_build_object(
      'commandReference', command.command_reference,
      'attemptNumber', command.attempt_count,
      'attemptState', p_attempt_state
    )), 1, 40
  );
  insert into public.cartera020c_confirmation_attempts (
    advisor_id, attempt_reference, review_id, command_id, attempt_number,
    attempt_state, error_code, receipt_digest, metadata,
    started_at, completed_at, actor_id
  ) values (
    p_actor_id, attempt_reference, review.id, command.id, command.attempt_count,
    p_attempt_state, p_error_code,
    case when p_receipt is null then null else public.forge_cartera020c_json_digest(p_receipt) end,
    jsonb_build_object('conflictReference', conflict_reference),
    p_recorded_at, p_recorded_at, p_actor_id
  );

  old_state := review.state;
  update public.cartera020c_confirmation_reviews
  set state = 'BLOCKED',
      state_version = state_version + 1,
      active_sequence = null,
      next_retry_at = null,
      last_error_code = p_error_code,
      blocked_reason = p_conflict_type,
      updated_at = p_recorded_at
  where id = review.id and advisor_id = p_actor_id
  returning * into review;

  perform public.forge_cartera020c_record_transition(
    p_actor_id, review.id, old_state, review.state,
    'COMMAND_BLOCKED', command.sequence_number, p_error_code,
    review.state_version,
    jsonb_build_object(
      'conflictReference', conflict_reference,
      'commandType', command.command_type
    ), p_recorded_at
  );
end;
$$;

create or replace function public.forge_cartera020c_schedule_retry(
  p_actor_id uuid,
  p_review_id uuid,
  p_command_id uuid,
  p_error_code text,
  p_retry_at timestamptz,
  p_recorded_at timestamptz
)
returns void
language plpgsql
security definer
set search_path = public, extensions, pg_temp
as $$
declare
  review public.cartera020c_confirmation_reviews%rowtype;
  command public.cartera020c_confirmation_commands%rowtype;
  old_state text;
  attempt_reference text;
begin
  select * into review
  from public.cartera020c_confirmation_reviews r
  where r.advisor_id = p_actor_id and r.id = p_review_id
  for update;
  select * into command
  from public.cartera020c_confirmation_commands c
  where c.advisor_id = p_actor_id and c.id = p_command_id
  for update;

  if review.id is null or command.id is null then
    raise exception 'CARTERA020C_ACTIVE_COMMAND_NOT_FOUND';
  end if;

  perform set_config('forge.cartera020c_command', 'on', true);
  update public.cartera020c_confirmation_commands
  set status = 'RETRY_WAIT',
      next_retry_at = p_retry_at,
      last_error_code = p_error_code,
      updated_at = p_recorded_at
  where id = command.id and advisor_id = p_actor_id
  returning * into command;

  attempt_reference := 'CONFIRMATION_ATTEMPT:' || substr(
    public.forge_cartera020c_json_digest(jsonb_build_object(
      'commandReference', command.command_reference,
      'attemptNumber', command.attempt_count,
      'attemptState', 'RETRY_SCHEDULED'
    )), 1, 40
  );
  insert into public.cartera020c_confirmation_attempts (
    advisor_id, attempt_reference, review_id, command_id, attempt_number,
    attempt_state, error_code, metadata, started_at, completed_at, actor_id
  ) values (
    p_actor_id, attempt_reference, review.id, command.id, command.attempt_count,
    'RETRY_SCHEDULED', p_error_code,
    jsonb_build_object('retryAt', p_retry_at),
    p_recorded_at, p_recorded_at, p_actor_id
  );

  old_state := review.state;
  update public.cartera020c_confirmation_reviews
  set state = 'RETRY_WAIT',
      state_version = state_version + 1,
      retry_count = retry_count + 1,
      next_retry_at = p_retry_at,
      last_error_code = p_error_code,
      updated_at = p_recorded_at
  where id = review.id and advisor_id = p_actor_id
  returning * into review;

  perform public.forge_cartera020c_record_transition(
    p_actor_id, review.id, old_state, review.state,
    'COMMAND_RETRY_SCHEDULED', command.sequence_number, p_error_code,
    review.state_version,
    jsonb_build_object('retryAt', p_retry_at, 'commandType', command.command_type),
    p_recorded_at
  );
end;
$$;


commit;
