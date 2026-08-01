-- CARTERA 020C.3 single-step ordered 010B executor with read-after-write verification.
-- Repository implementation only. This migration is NOT remote deployment authorization.
-- Canonical mutation remains confined to accepted CARTERA 010B governed RPCs.

begin;

create or replace function public.forge_cartera020c_execute_next_confirmation_step(
  p_review_reference text,
  p_expected_state_version integer
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
  command_receipt public.cartera010b_command_receipts%rowtype;
  person public.commercial_people%rowtype;
  source_link public.commercial_source_identity_links%rowtype;
  identity_decision public.identity_resolution_decisions%rowtype;
  policy public.canonical_policies%rowtype;
  policy_version public.policy_versions%rowtype;
  evidence_version public.policy_evidence_versions%rowtype;
  inbox public.cartera020b_evidence_inbox_items%rowtype;
  receipt jsonb;
  receipt_status text;
  server_digest text;
  error_code text;
  error_state text;
  retry_at timestamptz;
  old_state text;
  next_state text;
  attempt_reference text;
  now_at timestamptz := clock_timestamp();
  persisted_role_count integer;
  expected_role_count integer;
  expected_policy_version integer;
  terminal_failure boolean;
begin
  if actor_id is null then
    raise exception 'CARTERA020C_AUTH_REQUIRED';
  end if;
  if p_review_reference is null
     or p_review_reference !~ '^[A-Za-z0-9][A-Za-z0-9._:@/-]{0,239}$'
     or p_expected_state_version is null
     or p_expected_state_version < 1 then
    raise exception 'CARTERA020C_EXECUTION_STEP_ARGUMENTS_INVALID';
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
  if review.state in ('BLOCKED','REJECTED','CONFIRMED','IDENTITY_CONFIRMED') then
    return public.forge_cartera020c_status_response(actor_id, p_review_reference);
  end if;
  if review.state = 'RETRY_WAIT' then
    return public.forge_cartera020c_status_response(actor_id, p_review_reference);
  end if;
  if review.state not in ('IDENTITY_READY','POLICY_READY') then
    raise exception 'CARTERA020C_EXECUTION_STATE_INVALID';
  end if;

  select * into command
  from public.cartera020c_confirmation_commands c
  where c.advisor_id = actor_id
    and c.review_id = review.id
    and c.status = 'PENDING'
    and (
      (review.state = 'IDENTITY_READY' and c.stage = 'IDENTITY_RESOLUTION')
      or (review.state = 'POLICY_READY' and c.stage = 'CONFIRMED_POLICY')
    )
  order by c.sequence_number
  limit 1
  for update;

  if command.id is null then
    if review.state = 'IDENTITY_READY'
       and review.identity_success_count = review.identity_command_count then
      old_state := review.state;
      perform set_config('forge.cartera020c_command', 'on', true);
      update public.cartera020c_confirmation_reviews
      set state = 'IDENTITY_CONFIRMED', state_version = state_version + 1,
          active_sequence = null, updated_at = now_at
      where id = review.id and advisor_id = actor_id
      returning * into review;
      perform public.forge_cartera020c_record_transition(
        actor_id, review.id, old_state, review.state,
        'IDENTITY_VERIFIED', null, 'CARTERA020C_IDENTITY_VERIFIED',
        review.state_version, '{}'::jsonb, now_at
      );
      return public.forge_cartera020c_status_response(actor_id, p_review_reference);
    end if;
    raise exception 'CARTERA020C_NEXT_COMMAND_NOT_FOUND';
  end if;

  if exists (
    select 1 from public.cartera020c_confirmation_commands prior
    where prior.review_id = review.id
      and prior.sequence_number < command.sequence_number
      and prior.status <> 'SUCCEEDED'
  ) then
    raise exception 'CARTERA020C_IDENTITY_BEFORE_POLICY_ORDER_VIOLATION';
  end if;
  if command.stage = 'CONFIRMED_POLICY'
     and review.identity_success_count <> review.identity_command_count then
    raise exception 'CARTERA020C_POLICY_BEFORE_IDENTITY_FORBIDDEN';
  end if;

  old_state := review.state;
  next_state := case command.stage
    when 'IDENTITY_RESOLUTION' then 'IDENTITY_EXECUTING'
    else 'POLICY_EXECUTING'
  end;
  perform set_config('forge.cartera020c_command', 'on', true);
  update public.cartera020c_confirmation_commands
  set status = 'EXECUTING', attempt_count = attempt_count + 1,
      next_retry_at = null, last_error_code = null, updated_at = now_at
  where id = command.id and advisor_id = actor_id
  returning * into command;

  update public.cartera020c_confirmation_reviews
  set state = next_state,
      state_version = state_version + 1,
      active_sequence = command.sequence_number,
      total_attempt_count = total_attempt_count + 1,
      next_retry_at = null,
      last_error_code = null,
      updated_at = now_at
  where id = review.id and advisor_id = actor_id
  returning * into review;

  perform public.forge_cartera020c_record_transition(
    actor_id, review.id, old_state, review.state,
    'COMMAND_EXECUTION_STARTED', command.sequence_number,
    'CARTERA020C_COMMAND_EXECUTION_STARTED', review.state_version,
    jsonb_build_object('commandType', command.command_type), now_at
  );

  begin
    if command.stage = 'IDENTITY_RESOLUTION' then
      receipt := public.forge_cartera010b_confirm_identity_resolution(command.command_payload);
    else
      receipt := public.forge_cartera010b_confirm_policy_with_parties(command.command_payload);
    end if;
  exception when others then
    error_code := public.forge_cartera020c_error_code(sqlerrm);
    error_state := sqlstate;
    terminal_failure := error_code like 'CARTERA010B_%'
      or error_code like 'CARTERA020C_%'
      or command.attempt_count >= 5;

    if terminal_failure then
      perform public.forge_cartera020c_block_active_command(
        actor_id, review.id, command.id, 'FAILED_TERMINAL', 'FAILED_TERMINAL',
        'EXECUTION_FAILED_TERMINAL', coalesce(error_code, error_state),
        null, clock_timestamp()
      );
    else
      retry_at := clock_timestamp() + make_interval(
        secs => least(300, (5 * power(2, greatest(command.attempt_count - 1, 0)))::integer)
      );
      perform public.forge_cartera020c_schedule_retry(
        actor_id, review.id, command.id, coalesce(error_code, error_state),
        retry_at, clock_timestamp()
      );
    end if;

    return public.forge_cartera020c_status_response(actor_id, p_review_reference);
  end;

  if receipt is null or jsonb_typeof(receipt) <> 'object' then
    perform public.forge_cartera020c_block_active_command(
      actor_id, review.id, command.id, 'FAILED_TERMINAL', 'FAILED_TERMINAL',
      case command.stage when 'IDENTITY_RESOLUTION' then 'IDENTITY_RESULT_CONFLICT' else 'POLICY_RESULT_CONFLICT' end,
      'CARTERA020C_COMMAND_RECEIPT_INVALID', receipt, clock_timestamp()
    );
    return public.forge_cartera020c_status_response(actor_id, p_review_reference);
  end if;

  receipt_status := receipt ->> 'status';
  server_digest := receipt ->> 'serverCommandDigest';
  if receipt_status = 'CONFLICT' then
    perform public.forge_cartera020c_block_active_command(
      actor_id, review.id, command.id, 'CONFLICT', 'CONFLICT',
      case command.stage when 'IDENTITY_RESOLUTION' then 'IDENTITY_RESULT_CONFLICT' else 'POLICY_RESULT_CONFLICT' end,
      coalesce(receipt ->> 'conflictType', 'CARTERA020C_COMMAND_CONFLICT'),
      receipt, clock_timestamp()
    );
    return public.forge_cartera020c_status_response(actor_id, p_review_reference);
  end if;

  if receipt ->> 'idempotencyKey' <> command.idempotency_key
     or server_digest !~ '^[a-f0-9]{64}$' then
    perform public.forge_cartera020c_block_active_command(
      actor_id, review.id, command.id, 'FAILED_TERMINAL', 'FAILED_TERMINAL',
      case command.stage when 'IDENTITY_RESOLUTION' then 'IDENTITY_RESULT_CONFLICT' else 'POLICY_RESULT_CONFLICT' end,
      'CARTERA020C_COMMAND_RECEIPT_SCOPE_MISMATCH', receipt, clock_timestamp()
    );
    return public.forge_cartera020c_status_response(actor_id, p_review_reference);
  end if;

  select * into command_receipt
  from public.cartera010b_command_receipts r
  where r.advisor_id = actor_id
    and r.command_type = command.command_type
    and r.idempotency_key = command.idempotency_key
    and r.command_digest = server_digest;

  if command_receipt.id is null
     or command_receipt.response_envelope ->> 'serverCommandDigest' <> server_digest then
    perform public.forge_cartera020c_block_active_command(
      actor_id, review.id, command.id, 'FAILED_TERMINAL', 'FAILED_TERMINAL',
      case command.stage when 'IDENTITY_RESOLUTION' then 'IDENTITY_READ_AFTER_WRITE_MISMATCH' else 'POLICY_READ_AFTER_WRITE_MISMATCH' end,
      'CARTERA020C_DURABLE_RECEIPT_NOT_FOUND', receipt, clock_timestamp()
    );
    return public.forge_cartera020c_status_response(actor_id, p_review_reference);
  end if;

  if command.stage = 'IDENTITY_RESOLUTION' then
    if receipt_status not in ('CONFIRMED','ALREADY_LINKED')
       or receipt ->> 'personReference' <> command.expected_result ->> 'expectedPersonReference'
       or coalesce(receipt ->> 'outcome', command.expected_result ->> 'outcome') <>
          command.expected_result ->> 'outcome' then
      perform public.forge_cartera020c_block_active_command(
        actor_id, review.id, command.id, 'FAILED_TERMINAL', 'FAILED_TERMINAL',
        'IDENTITY_RESULT_CONFLICT', 'CARTERA020C_IDENTITY_RECEIPT_INVALID',
        receipt, clock_timestamp()
      );
      return public.forge_cartera020c_status_response(actor_id, p_review_reference);
    end if;

    select * into person
    from public.commercial_people p
    where p.advisor_id = actor_id
      and p.person_reference = receipt ->> 'personReference'
      and p.lifecycle_state = 'CONFIRMED'
      and p.archived_at is null;

    select * into source_link
    from public.commercial_source_identity_links l
    where l.advisor_id = actor_id
      and l.link_reference = receipt ->> 'linkReference'
      and l.person_id = person.id
      and l.source_domain = command.command_payload -> 'sourceIdentity' ->> 'sourceDomain'
      and l.source_identity_type = command.command_payload -> 'sourceIdentity' ->> 'sourceIdentityType'
      and l.source_record_reference = command.command_payload -> 'sourceIdentity' ->> 'sourceRecordReference'
      and l.effective_to is null;

    if receipt_status = 'CONFIRMED' then
      select * into identity_decision
      from public.identity_resolution_decisions d
      where d.advisor_id = actor_id
        and d.decision_reference = receipt ->> 'decisionReference'
        and d.resolved_person_id = person.id
        and d.idempotency_key = command.idempotency_key
        and d.command_digest = server_digest;
    end if;

    if person.id is null
       or source_link.id is null
       or (receipt_status = 'CONFIRMED' and identity_decision.id is null) then
      perform public.forge_cartera020c_block_active_command(
        actor_id, review.id, command.id, 'FAILED_TERMINAL', 'FAILED_TERMINAL',
        'IDENTITY_READ_AFTER_WRITE_MISMATCH',
        'CARTERA020C_IDENTITY_READ_AFTER_WRITE_MISMATCH',
        receipt, clock_timestamp()
      );
      return public.forge_cartera020c_status_response(actor_id, p_review_reference);
    end if;

    perform set_config('forge.cartera020c_command', 'on', true);
    update public.cartera020c_confirmation_commands
    set status = 'SUCCEEDED', receipt_payload = receipt,
        result_digest = public.forge_cartera020c_json_digest(receipt),
        executed_at = now_at, next_retry_at = null, last_error_code = null,
        updated_at = now_at
    where id = command.id and advisor_id = actor_id
    returning * into command;

    attempt_reference := 'CONFIRMATION_ATTEMPT:' || substr(
      public.forge_cartera020c_json_digest(jsonb_build_object(
        'commandReference', command.command_reference,
        'attemptNumber', command.attempt_count,
        'attemptState', 'SUCCEEDED'
      )), 1, 40
    );
    insert into public.cartera020c_confirmation_attempts (
      advisor_id, attempt_reference, review_id, command_id, attempt_number,
      attempt_state, receipt_digest, metadata, started_at, completed_at, actor_id
    ) values (
      actor_id, attempt_reference, review.id, command.id, command.attempt_count,
      'SUCCEEDED', public.forge_cartera020c_json_digest(receipt),
      jsonb_build_object(
        'candidateReference', command.candidate_reference,
        'personReference', receipt ->> 'personReference'
      ), now_at, now_at, actor_id
    );

    old_state := review.state;
    next_state := case
      when review.identity_success_count + 1 = review.identity_command_count
        then 'IDENTITY_CONFIRMED'
      else 'IDENTITY_READY'
    end;
    update public.cartera020c_confirmation_reviews
    set state = next_state,
        state_version = state_version + 1,
        identity_success_count = identity_success_count + 1,
        active_sequence = null,
        last_error_code = null,
        blocked_reason = null,
        updated_at = now_at
    where id = review.id and advisor_id = actor_id
    returning * into review;

    perform public.forge_cartera020c_record_transition(
      actor_id, review.id, old_state, review.state,
      'IDENTITY_COMMAND_VERIFIED', command.sequence_number,
      'CARTERA020C_IDENTITY_READ_AFTER_WRITE_VERIFIED', review.state_version,
      jsonb_build_object(
        'candidateReference', command.candidate_reference,
        'personReference', receipt ->> 'personReference'
      ), now_at
    );

    return public.forge_cartera020c_status_response(actor_id, p_review_reference);
  end if;

  if receipt_status <> 'CONFIRMED'
     or receipt ->> 'policyReference' <> command.expected_result ->> 'policyReference'
     or receipt ->> 'policyVersion' !~ '^[1-9][0-9]*$'
     or command.expected_result ->> 'policyVersion' !~ '^[1-9][0-9]*$'
     or (receipt ->> 'policyVersion')::integer <> (command.expected_result ->> 'policyVersion')::integer
     or receipt ->> 'evidenceVersionReference' <> command.expected_result ->> 'evidenceVersionReference'
     or receipt ->> 'roleCount' !~ '^[0-9]+$'
     or command.expected_result ->> 'roleCount' !~ '^[0-9]+$'
     or (receipt ->> 'roleCount')::integer <> (command.expected_result ->> 'roleCount')::integer then
    perform public.forge_cartera020c_block_active_command(
      actor_id, review.id, command.id, 'FAILED_TERMINAL', 'FAILED_TERMINAL',
      'POLICY_RESULT_CONFLICT', 'CARTERA020C_POLICY_RECEIPT_INVALID',
      receipt, clock_timestamp()
    );
    return public.forge_cartera020c_status_response(actor_id, p_review_reference);
  end if;

  expected_policy_version := (receipt ->> 'policyVersion')::integer;
  expected_role_count := (receipt ->> 'roleCount')::integer;
  select * into policy
  from public.canonical_policies p
  where p.advisor_id = actor_id
    and p.policy_reference = receipt ->> 'policyReference'
    and p.current_version = expected_policy_version
    and p.archived_at is null;

  select * into policy_version
  from public.policy_versions v
  where v.advisor_id = actor_id
    and v.policy_id = policy.id
    and v.policy_version_reference = receipt ->> 'policyVersionReference'
    and v.version_number = expected_policy_version;

  select * into evidence_version
  from public.policy_evidence_versions e
  where e.advisor_id = actor_id
    and e.policy_id = policy.id
    and e.evidence_version_reference = receipt ->> 'evidenceVersionReference';

  select count(*)::integer into persisted_role_count
  from public.policy_roles r
  where r.advisor_id = actor_id
    and r.policy_id = policy.id
    and r.policy_version_id = policy_version.id;

  if policy.id is null
     or policy_version.id is null
     or evidence_version.id is null
     or persisted_role_count <> expected_role_count then
    perform public.forge_cartera020c_block_active_command(
      actor_id, review.id, command.id, 'FAILED_TERMINAL', 'FAILED_TERMINAL',
      'POLICY_READ_AFTER_WRITE_MISMATCH',
      'CARTERA020C_POLICY_READ_AFTER_WRITE_MISMATCH',
      receipt, clock_timestamp()
    );
    return public.forge_cartera020c_status_response(actor_id, p_review_reference);
  end if;

  select * into inbox
  from public.cartera020b_evidence_inbox_items i
  where i.advisor_id = actor_id and i.id = review.inbox_item_id
  for update;

  if inbox.id is null or inbox.status <> 'confirmation_required' then
    perform public.forge_cartera020c_block_active_command(
      actor_id, review.id, command.id, 'FAILED_TERMINAL', 'FAILED_TERMINAL',
      'POLICY_READ_AFTER_WRITE_MISMATCH',
      'CARTERA020C_EVIDENCE_INBOX_CONFIRMATION_STATE_MISMATCH',
      receipt, clock_timestamp()
    );
    return public.forge_cartera020c_status_response(actor_id, p_review_reference);
  end if;

  perform set_config('forge.cartera020c_command', 'on', true);
  update public.cartera020c_confirmation_commands
  set status = 'SUCCEEDED', receipt_payload = receipt,
      result_digest = public.forge_cartera020c_json_digest(receipt),
      executed_at = now_at, next_retry_at = null, last_error_code = null,
      updated_at = now_at
  where id = command.id and advisor_id = actor_id
  returning * into command;

  attempt_reference := 'CONFIRMATION_ATTEMPT:' || substr(
    public.forge_cartera020c_json_digest(jsonb_build_object(
      'commandReference', command.command_reference,
      'attemptNumber', command.attempt_count,
      'attemptState', 'SUCCEEDED'
    )), 1, 40
  );
  insert into public.cartera020c_confirmation_attempts (
    advisor_id, attempt_reference, review_id, command_id, attempt_number,
    attempt_state, receipt_digest, metadata, started_at, completed_at, actor_id
  ) values (
    actor_id, attempt_reference, review.id, command.id, command.attempt_count,
    'SUCCEEDED', public.forge_cartera020c_json_digest(receipt),
    jsonb_build_object(
      'policyReference', receipt ->> 'policyReference',
      'policyVersionReference', receipt ->> 'policyVersionReference',
      'roleCount', expected_role_count
    ), now_at, now_at, actor_id
  );

  perform set_config('forge.cartera020b_command', 'on', true);
  update public.cartera020b_evidence_inbox_items
  set status = 'confirmed', state_version = state_version + 1,
      updated_at = now_at
  where id = inbox.id and advisor_id = actor_id;

  insert into public.cartera020b_evidence_transitions (
    advisor_id, transition_reference, inbox_item_id,
    from_status, to_status, from_worker_state, to_worker_state,
    reason_code, metadata, command_digest, idempotency_key,
    occurred_at, actor_id
  ) values (
    actor_id,
    'EVIDENCE_TRANSITION:' || substr(public.forge_cartera020c_json_digest(
      jsonb_build_object(
        'reviewReference', review.review_reference,
        'policyReference', receipt ->> 'policyReference',
        'commandDigest', server_digest
      )
    ), 1, 40),
    inbox.id, inbox.status, 'confirmed', inbox.worker_state, inbox.worker_state,
    'CARTERA020C_POLICY_CONFIRMED',
    jsonb_build_object(
      'reviewReference', review.review_reference,
      'policyReference', receipt ->> 'policyReference',
      'policyVersionReference', receipt ->> 'policyVersionReference'
    ),
    server_digest, command.idempotency_key, now_at, actor_id
  );

  old_state := review.state;
  update public.cartera020c_confirmation_reviews
  set state = 'CONFIRMED', state_version = state_version + 1,
      active_sequence = null, next_retry_at = null,
      last_error_code = null, blocked_reason = null,
      confirmed_policy_reference = receipt ->> 'policyReference',
      confirmed_policy_version_reference = receipt ->> 'policyVersionReference',
      confirmed_evidence_version_reference = receipt ->> 'evidenceVersionReference',
      confirmed_at = now_at, updated_at = now_at
  where id = review.id and advisor_id = actor_id
  returning * into review;

  perform public.forge_cartera020c_record_transition(
    actor_id, review.id, old_state, review.state,
    'POLICY_COMMAND_VERIFIED', command.sequence_number,
    'CARTERA020C_POLICY_READ_AFTER_WRITE_VERIFIED', review.state_version,
    jsonb_build_object(
      'policyReference', receipt ->> 'policyReference',
      'policyVersionReference', receipt ->> 'policyVersionReference',
      'evidenceVersionReference', receipt ->> 'evidenceVersionReference',
      'roleCount', expected_role_count
    ), now_at
  );

  return public.forge_cartera020c_status_response(actor_id, p_review_reference);
end;
$$;


commit;
