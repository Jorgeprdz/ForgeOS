-- CARTERA 020C.3 helpers, transitions, conflicts and sanitized status.
-- Repository implementation only. This migration is NOT remote deployment authorization.
-- Only accepted CARTERA 010B governed RPCs may create canonical truth.

begin;

create extension if not exists pgcrypto;

create or replace function public.forge_cartera020c_json_digest(p_value jsonb)
returns text
language plpgsql
immutable
set search_path = public, extensions, pg_temp
as $$
begin
  if p_value is null then
    raise exception 'CARTERA020C_DIGEST_VALUE_REQUIRED';
  end if;
  return encode(digest(p_value::text, 'sha256'), 'hex');
end;
$$;

create or replace function public.forge_cartera020c_error_code(p_message text)
returns text
language sql
immutable
set search_path = public, pg_temp
as $$
  select left(
    nullif(
      upper(regexp_replace(coalesce(split_part(p_message, E'\n', 1), 'UNKNOWN_ERROR'), '[^A-Za-z0-9._:@/-]+', '_', 'g')),
      ''
    ),
    159
  );
$$;

create or replace function public.forge_cartera020c_record_transition(
  p_actor_id uuid,
  p_review_id uuid,
  p_from_state text,
  p_to_state text,
  p_event_type text,
  p_sequence_number integer,
  p_reason_code text,
  p_state_version integer,
  p_metadata jsonb,
  p_occurred_at timestamptz
)
returns void
language plpgsql
security definer
set search_path = public, extensions, pg_temp
as $$
declare
  transition_reference text;
begin
  transition_reference := 'CONFIRMATION_TRANSITION:' || substr(
    public.forge_cartera020c_json_digest(jsonb_build_object(
      'advisorId', p_actor_id,
      'reviewId', p_review_id,
      'fromState', p_from_state,
      'toState', p_to_state,
      'eventType', p_event_type,
      'sequenceNumber', p_sequence_number,
      'stateVersion', p_state_version,
      'occurredAt', p_occurred_at
    )), 1, 40
  );

  insert into public.cartera020c_confirmation_transitions (
    advisor_id, transition_reference, review_id, from_state, to_state,
    event_type, sequence_number, reason_code, state_version, metadata,
    occurred_at, actor_id
  ) values (
    p_actor_id, transition_reference, p_review_id, p_from_state, p_to_state,
    p_event_type, p_sequence_number, p_reason_code, p_state_version,
    coalesce(p_metadata, '{}'::jsonb), p_occurred_at, p_actor_id
  );
end;
$$;

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
  conflict_reference text;
begin
  conflict_reference := 'CONFIRMATION_CONFLICT:' || substr(
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
    p_actor_id, conflict_reference, p_review_reference, p_conflict_type,
    p_idempotency_key, p_existing_digest, p_incoming_digest,
    p_command_reference, p_recorded_at, p_actor_id
  ) on conflict (advisor_id, conflict_reference) do nothing;

  return conflict_reference;
end;
$$;

create or replace function public.forge_cartera020c_status_response(
  p_actor_id uuid,
  p_review_reference text
)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  review public.cartera020c_confirmation_reviews%rowtype;
  identity_results jsonb;
  policy_result jsonb;
  has_restricted_policy_data boolean;
  next_action text;
begin
  select * into review
  from public.cartera020c_confirmation_reviews r
  where r.advisor_id = p_actor_id
    and r.review_reference = p_review_reference;

  if review.id is null then
    raise exception 'CARTERA020C_CONFIRMATION_REVIEW_NOT_FOUND';
  end if;

  select coalesce(jsonb_agg(
    jsonb_build_object(
      'candidateReference', c.candidate_reference,
      'personReference', c.receipt_payload ->> 'personReference',
      'status', c.receipt_payload ->> 'status',
      'outcome', coalesce(c.receipt_payload ->> 'outcome', c.expected_result ->> 'outcome'),
      'decisionReference', c.receipt_payload ->> 'decisionReference',
      'linkReference', c.receipt_payload ->> 'linkReference',
      'idempotencyKey', c.receipt_payload ->> 'idempotencyKey',
      'serverCommandDigest', c.receipt_payload ->> 'serverCommandDigest',
      'replayed', coalesce((c.receipt_payload ->> 'replayed')::boolean, false)
    ) order by c.sequence_number
  ), '[]'::jsonb) into identity_results
  from public.cartera020c_confirmation_commands c
  where c.advisor_id = p_actor_id
    and c.review_id = review.id
    and c.stage = 'IDENTITY_RESOLUTION'
    and c.status = 'SUCCEEDED';

  policy_result := case
    when review.confirmed_policy_reference is null then null
    else jsonb_build_object(
      'status', 'CONFIRMED',
      'policyReference', review.confirmed_policy_reference,
      'policyVersionReference', review.confirmed_policy_version_reference,
      'evidenceVersionReference', review.confirmed_evidence_version_reference,
      'confirmedAt', review.confirmed_at
    )
  end;

  select exists (
    select 1
    from public.cartera020c_confirmation_commands c
    where c.advisor_id = p_actor_id
      and c.review_id = review.id
      and c.stage = 'CONFIRMED_POLICY'
      and c.contains_restricted_data
  ) into has_restricted_policy_data;

  next_action := case review.state
    when 'IDENTITY_READY' then 'EXECUTE_IDENTITY'
    when 'IDENTITY_EXECUTING' then 'RELOAD_STATUS'
    when 'IDENTITY_CONFIRMED' then 'COMPOSE_AND_AUTHORIZE_POLICY'
    when 'POLICY_READY' then 'EXECUTE_POLICY'
    when 'POLICY_EXECUTING' then 'RELOAD_STATUS'
    when 'RETRY_WAIT' then 'AUTHORIZE_RETRY_WHEN_DUE'
    when 'BLOCKED' then 'RESOLVE_CONFLICT'
    when 'REJECTED' then 'NONE'
    when 'CONFIRMED' then 'NONE'
    else 'RELOAD_STATUS'
  end;

  return jsonb_build_object(
    'contractType', 'FORGE_CARTERA_020C_CONFIRMATION_STATUS',
    'contractVersion', 'CARTERA-020C.3',
    'reviewReference', review.review_reference,
    'packetReference', review.packet_reference,
    'state', review.state,
    'stateVersion', review.state_version,
    'identityCommandCount', review.identity_command_count,
    'identitySuccessCount', review.identity_success_count,
    'policyCommandCount', review.policy_command_count,
    'activeSequence', review.active_sequence,
    'totalAttemptCount', review.total_attempt_count,
    'retryCount', review.retry_count,
    'nextRetryAt', review.next_retry_at,
    'lastErrorCode', review.last_error_code,
    'blockedReason', review.blocked_reason,
    'identityResults', identity_results,
    'resolvedAccounts', review.identity_account_decisions,
    'policyResult', policy_result,
    'hasRestrictedPolicyData', has_restricted_policy_data,
    'nextAction', next_action,
    'createsTruth', false,
    'commandPayloadProjected', false
  );
end;
$$;


commit;
