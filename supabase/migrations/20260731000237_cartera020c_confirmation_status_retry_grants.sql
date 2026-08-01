-- CARTERA 020C.3 status, explicit retry and public grants.
-- Repository implementation only. This migration is NOT remote deployment authorization.
-- Canonical mutation remains confined to accepted CARTERA 010B governed RPCs.

begin;

create or replace function public.forge_cartera020c_get_confirmation_status(
  p_review_reference text
)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  actor_id uuid := auth.uid();
begin
  if actor_id is null then
    raise exception 'CARTERA020C_AUTH_REQUIRED';
  end if;
  if p_review_reference is null
     or p_review_reference !~ '^[A-Za-z0-9][A-Za-z0-9._:@/-]{0,239}$' then
    raise exception 'CARTERA020C_REVIEW_REFERENCE_INVALID';
  end if;
  return public.forge_cartera020c_status_response(actor_id, p_review_reference);
end;
$$;

create or replace function public.forge_cartera020c_retry_confirmation(
  p_review_reference text,
  p_expected_state_version integer,
  p_requested_at timestamptz
)
returns jsonb
language plpgsql
security definer
set search_path = public, extensions, pg_temp
as $$
#variable_conflict use_variable
declare
  actor_id uuid := auth.uid();
  review public.cartera020c_confirmation_reviews%rowtype;
  command public.cartera020c_confirmation_commands%rowtype;
  old_state text;
  ready_state text;
  now_at timestamptz := clock_timestamp();
begin
  if actor_id is null then
    raise exception 'CARTERA020C_AUTH_REQUIRED';
  end if;
  if p_review_reference is null
     or p_review_reference !~ '^[A-Za-z0-9][A-Za-z0-9._:@/-]{0,239}$'
     or p_expected_state_version is null
     or p_expected_state_version < 1
     or p_requested_at is null
     or p_requested_at > now_at + interval '5 minutes'
     or p_requested_at < now_at - interval '24 hours' then
    raise exception 'CARTERA020C_RETRY_REQUEST_INVALID';
  end if;

  perform pg_advisory_xact_lock(hashtextextended(
    actor_id::text || '|CARTERA020C_REVIEW|' || p_review_reference, 0
  ));
  select * into review
  from public.cartera020c_confirmation_reviews r
  where r.advisor_id = actor_id
    and r.review_reference = p_review_reference
  for update;

  if review.id is null then
    raise exception 'CARTERA020C_CONFIRMATION_REVIEW_NOT_FOUND';
  end if;
  if review.state_version <> p_expected_state_version then
    raise exception 'CARTERA020C_STALE_STATE_VERSION';
  end if;
  if review.state <> 'RETRY_WAIT' or review.next_retry_at is null then
    raise exception 'CARTERA020C_RETRY_STATE_INVALID';
  end if;
  if p_requested_at < review.next_retry_at then
    raise exception 'CARTERA020C_RETRY_NOT_DUE';
  end if;

  select * into command
  from public.cartera020c_confirmation_commands c
  where c.advisor_id = actor_id
    and c.review_id = review.id
    and c.sequence_number = review.active_sequence
    and c.status = 'RETRY_WAIT'
  for update;

  if command.id is null then
    raise exception 'CARTERA020C_RETRY_COMMAND_NOT_FOUND';
  end if;
  ready_state := case command.stage
    when 'IDENTITY_RESOLUTION' then 'IDENTITY_READY'
    else 'POLICY_READY'
  end;

  perform set_config('forge.cartera020c_command', 'on', true);
  update public.cartera020c_confirmation_commands
  set status = 'PENDING', next_retry_at = null, last_error_code = null,
      updated_at = p_requested_at
  where id = command.id and advisor_id = actor_id;

  old_state := review.state;
  update public.cartera020c_confirmation_reviews
  set state = ready_state, state_version = state_version + 1,
      active_sequence = null, next_retry_at = null,
      last_error_code = null, updated_at = p_requested_at
  where id = review.id and advisor_id = actor_id
  returning * into review;

  perform public.forge_cartera020c_record_transition(
    actor_id, review.id, old_state, review.state,
    'COMMAND_RETRY_AUTHORIZED', command.sequence_number,
    'CARTERA020C_COMMAND_RETRY_AUTHORIZED', review.state_version,
    jsonb_build_object('commandType', command.command_type), p_requested_at
  );

  return public.forge_cartera020c_status_response(actor_id, p_review_reference);
end;
$$;

revoke all on function public.forge_cartera020c_json_digest(jsonb)
  from public, anon, authenticated;
revoke all on function public.forge_cartera020c_error_code(text)
  from public, anon, authenticated;
revoke all on function public.forge_cartera020c_record_transition(uuid,uuid,text,text,text,integer,text,integer,jsonb,timestamptz)
  from public, anon, authenticated;
revoke all on function public.forge_cartera020c_record_conflict(uuid,text,text,text,text,text,text,timestamptz)
  from public, anon, authenticated;
revoke all on function public.forge_cartera020c_status_response(uuid,text)
  from public, anon, authenticated;
revoke all on function public.forge_cartera020c_block_active_command(uuid,uuid,uuid,text,text,text,text,jsonb,timestamptz)
  from public, anon, authenticated;
revoke all on function public.forge_cartera020c_schedule_retry(uuid,uuid,uuid,text,timestamptz,timestamptz)
  from public, anon, authenticated;

revoke all on function public.forge_cartera020c_prepare_identity_orchestration(jsonb)
  from public, anon;
revoke all on function public.forge_cartera020c_attach_policy_confirmation(jsonb)
  from public, anon;
revoke all on function public.forge_cartera020c_execute_next_confirmation_step(text,integer)
  from public, anon;
revoke all on function public.forge_cartera020c_get_confirmation_status(text)
  from public, anon;
revoke all on function public.forge_cartera020c_retry_confirmation(text,integer,timestamptz)
  from public, anon;

grant execute on function public.forge_cartera020c_prepare_identity_orchestration(jsonb)
  to authenticated;
grant execute on function public.forge_cartera020c_attach_policy_confirmation(jsonb)
  to authenticated;
grant execute on function public.forge_cartera020c_execute_next_confirmation_step(text,integer)
  to authenticated;
grant execute on function public.forge_cartera020c_get_confirmation_status(text)
  to authenticated;
grant execute on function public.forge_cartera020c_retry_confirmation(text,integer,timestamptz)
  to authenticated;

comment on function public.forge_cartera020c_prepare_identity_orchestration(jsonb) is
  'Durably prepares an explicitly authorized owner-scoped Identity command queue without creating canonical truth.';
comment on function public.forge_cartera020c_attach_policy_confirmation(jsonb) is
  'Attaches the separately authorized confirmed Policy command only after durable Identity receipt verification.';
comment on function public.forge_cartera020c_execute_next_confirmation_step(text,integer) is
  'Executes exactly one ordered governed 010B command with durable attempts, bounded retry and read-after-write verification.';
comment on function public.forge_cartera020c_get_confirmation_status(text) is
  'Returns an owner-scoped sanitized status projection without command payloads or beneficiary details.';
comment on function public.forge_cartera020c_retry_confirmation(text,integer,timestamptz) is
  'Explicitly releases one due retry under optimistic review state control.';

commit;
