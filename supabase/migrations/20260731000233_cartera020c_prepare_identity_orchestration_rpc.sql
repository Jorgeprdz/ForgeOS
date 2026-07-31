-- CARTERA 020C.3 durable Identity preparation RPC.
-- Repository implementation only. This migration is NOT remote deployment authorization.
-- Canonical mutation remains confined to accepted CARTERA 010B governed RPCs.

begin;

create or replace function public.forge_cartera020c_prepare_identity_orchestration(
  p_request jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = public, extensions, pg_temp
as $$
#variable_conflict use_variable
declare
  actor_id uuid := auth.uid();
  review_reference text;
  packet_reference text;
  request_idempotency_key text;
  requested_at timestamptz;
  authorization jsonb;
  authorized_at timestamptz;
  identity_batch jsonb;
  identity_commands jsonb;
  account_decisions jsonb;
  identity_batch_digest text;
  review public.cartera020c_confirmation_reviews%rowtype;
  packet public.cartera020b_policy_evidence_packets%rowtype;
  inbox public.cartera020b_evidence_inbox_items%rowtype;
  source public.cartera020b_evidence_sources%rowtype;
  command_item jsonb;
  command_payload jsonb;
  account_decision jsonb;
  sequence_number integer;
  server_command_digest text;
  expected_person_reference text;
  initial_state text;
  old_state text;
  conflict_reference text;
  now_at timestamptz := clock_timestamp();
begin
  if actor_id is null then
    raise exception 'CARTERA020C_AUTH_REQUIRED';
  end if;

  if not public.forge_cartera010b_jsonb_keys_allowed(
       p_request,
       array[
         'contractType','contractVersion','advisorId','actorReference',
         'reviewReference','packetReference','idempotencyKey','requestedAt',
         'authorization','identityBatch'
       ]
     )
     or p_request ->> 'contractType' <> 'FORGE_CARTERA_020C_IDENTITY_EXECUTION_REQUEST'
     or p_request ->> 'contractVersion' <> 'CARTERA-020C.3'
     or p_request ->> 'advisorId' <> actor_id::text
     or p_request ->> 'actorReference' <> actor_id::text then
    raise exception 'CARTERA020C_IDENTITY_EXECUTION_REQUEST_INVALID';
  end if;

  review_reference := nullif(btrim(p_request ->> 'reviewReference'), '');
  packet_reference := nullif(btrim(p_request ->> 'packetReference'), '');
  request_idempotency_key := nullif(btrim(p_request ->> 'idempotencyKey'), '');
  authorization := p_request -> 'authorization';
  identity_batch := p_request -> 'identityBatch';

  begin
    requested_at := (p_request ->> 'requestedAt')::timestamptz;
    authorized_at := (authorization ->> 'authorizedAt')::timestamptz;
  exception when others then
    raise exception 'CARTERA020C_IDENTITY_EXECUTION_TIME_INVALID';
  end;

  if review_reference is null
     or review_reference !~ '^[A-Za-z0-9][A-Za-z0-9._:@/-]{0,239}$'
     or packet_reference is null
     or packet_reference !~ '^[A-Za-z0-9][A-Za-z0-9._:@/-]{0,239}$'
     or request_idempotency_key is null
     or request_idempotency_key !~ '^[A-Za-z0-9][A-Za-z0-9._:@/-]{0,159}$'
     or requested_at > now_at + interval '5 minutes'
     or requested_at < now_at - interval '24 hours'
     or authorized_at is distinct from requested_at then
    raise exception 'CARTERA020C_IDENTITY_EXECUTION_REQUEST_VALUES_INVALID';
  end if;

  if not public.forge_cartera010b_jsonb_keys_allowed(
       authorization,
       array[
         'contractType','contractVersion','scope','reviewReference','advisorId',
         'actorReference','authorizedAt','confirmation','payloadDigest'
       ]
     )
     or authorization ->> 'contractType' <> 'FORGE_CARTERA_020C_EXECUTION_AUTHORIZATION'
     or authorization ->> 'contractVersion' <> 'CARTERA-020C.3'
     or authorization ->> 'scope' <> 'IDENTITY_RESOLUTION'
     or authorization ->> 'reviewReference' <> review_reference
     or authorization ->> 'advisorId' <> actor_id::text
     or authorization ->> 'actorReference' <> actor_id::text
     or authorization ->> 'confirmation' <> 'CONFIRM_IDENTITY_RESOLUTION'
     or authorization ->> 'payloadDigest' !~ '^[a-f0-9]{64}$' then
    raise exception 'CARTERA020C_IDENTITY_EXECUTION_AUTHORIZATION_INVALID';
  end if;

  if not public.forge_cartera010b_jsonb_keys_allowed(
       identity_batch,
       array[
         'contractType','contractVersion','reviewReference','packetReference',
         'advisorId','actorReference','commands','accountDecisions','invocationOrder',
         'createsTruth','invokesRemoteCommand','requiresExplicitExecution'
       ]
     )
     or identity_batch ->> 'contractType' <> 'FORGE_CARTERA_020C_IDENTITY_COMMAND_BATCH'
     or identity_batch ->> 'contractVersion' <> 'CARTERA-020C.2'
     or identity_batch ->> 'reviewReference' <> review_reference
     or identity_batch ->> 'packetReference' <> packet_reference
     or identity_batch ->> 'advisorId' <> actor_id::text
     or identity_batch ->> 'actorReference' <> actor_id::text
     or identity_batch -> 'createsTruth' <> 'false'::jsonb
     or identity_batch -> 'invokesRemoteCommand' <> 'false'::jsonb
     or identity_batch -> 'requiresExplicitExecution' <> 'true'::jsonb
     or identity_batch -> 'invocationOrder' <> '["IDENTITY_RESOLUTION"]'::jsonb
     or jsonb_typeof(identity_batch -> 'commands') <> 'array'
     or jsonb_typeof(identity_batch -> 'accountDecisions') <> 'array'
     or jsonb_array_length(identity_batch -> 'commands') > 100
     or jsonb_array_length(identity_batch -> 'accountDecisions') > 100 then
    raise exception 'CARTERA020C_IDENTITY_BATCH_INVALID';
  end if;

  identity_commands := identity_batch -> 'commands';
  account_decisions := identity_batch -> 'accountDecisions';
  identity_batch_digest := public.forge_cartera020c_json_digest(identity_batch);

  if (
    select count(*) <> count(distinct item ->> 'candidateReference')
    from jsonb_array_elements(identity_commands) item
  ) then
    raise exception 'CARTERA020C_IDENTITY_CANDIDATE_DUPLICATED';
  end if;

  if (
    select count(*) <> count(distinct item -> 'command' ->> 'idempotencyKey')
    from jsonb_array_elements(identity_commands) item
  ) then
    raise exception 'CARTERA020C_IDENTITY_IDEMPOTENCY_DUPLICATED';
  end if;

  for account_decision in select value from jsonb_array_elements(account_decisions)
  loop
    if not public.forge_cartera010b_jsonb_keys_allowed(
         account_decision,
         array['candidateReference','outcome','existingAccountReference','createsTruth']
       )
       or account_decision ->> 'candidateReference' !~ '^[A-Za-z0-9][A-Za-z0-9._:@/-]{0,239}$'
       or account_decision ->> 'outcome' not in ('LINK_CONFIRMED','NOT_APPLICABLE')
       or account_decision -> 'createsTruth' <> 'false'::jsonb then
      raise exception 'CARTERA020C_ACCOUNT_DECISION_INVALID';
    end if;

    if account_decision ->> 'outcome' = 'LINK_CONFIRMED' then
      if account_decision ->> 'existingAccountReference' !~ '^[A-Za-z0-9][A-Za-z0-9._:@/-]{0,239}$'
         or not exists (
           select 1 from public.commercial_accounts a
           where a.advisor_id = actor_id
             and a.account_reference = account_decision ->> 'existingAccountReference'
             and a.lifecycle_state = 'CONFIRMED'
             and a.archived_at is null
         ) then
        raise exception 'CARTERA020C_EXISTING_ACCOUNT_NOT_CONFIRMED';
      end if;
    elsif nullif(btrim(account_decision ->> 'existingAccountReference'), '') is not null then
      raise exception 'CARTERA020C_ACCOUNT_NOT_APPLICABLE_REFERENCE_FORBIDDEN';
    end if;
  end loop;

  if (
    select count(*) <> count(distinct item ->> 'candidateReference')
    from jsonb_array_elements(account_decisions) item
  ) then
    raise exception 'CARTERA020C_ACCOUNT_CANDIDATE_DUPLICATED';
  end if;

  select * into packet
  from public.cartera020b_policy_evidence_packets p
  where p.advisor_id = actor_id
    and p.packet_reference = packet_reference;

  if packet.id is null
     or packet.confirmation_state <> 'PENDING_CONFIRMATION'
     or packet.creates_truth <> false then
    raise exception 'CARTERA020C_PENDING_PACKET_NOT_FOUND';
  end if;

  select * into inbox
  from public.cartera020b_evidence_inbox_items i
  where i.advisor_id = actor_id and i.id = packet.inbox_item_id;

  if inbox.id is null
     or inbox.status <> 'confirmation_required'
     or inbox.worker_state <> 'COMPLETED' then
    raise exception 'CARTERA020C_PACKET_NOT_READY_FOR_CONFIRMATION';
  end if;

  select * into source
  from public.cartera020b_evidence_sources s
  where s.advisor_id = actor_id and s.id = inbox.source_id;

  if source.id is null then
    raise exception 'CARTERA020C_EVIDENCE_SOURCE_NOT_FOUND';
  end if;

  perform pg_advisory_xact_lock(hashtextextended(
    actor_id::text || '|CARTERA020C_REVIEW|' || review_reference, 0
  ));

  select * into review
  from public.cartera020c_confirmation_reviews r
  where r.advisor_id = actor_id
    and (
      r.review_reference = review_reference
      or r.request_idempotency_key = request_idempotency_key
    )
  order by case when r.review_reference = review_reference then 0 else 1 end
  limit 1
  for update;

  if review.id is not null then
    if review.review_reference = review_reference
       and review.packet_reference = packet_reference
       and review.request_idempotency_key = request_idempotency_key
       and review.identity_batch_digest = identity_batch_digest then
      return public.forge_cartera020c_status_response(actor_id, review_reference)
        || jsonb_build_object('replayed', true);
    end if;

    conflict_reference := public.forge_cartera020c_record_conflict(
      actor_id, review.review_reference, 'CHANGED_INPUT_REPLAY',
      request_idempotency_key, review.identity_batch_digest,
      identity_batch_digest, null, now_at
    );

    if review.state not in ('BLOCKED','REJECTED','CONFIRMED')
       and public.cartera020c_review_transition_allowed(review.state, 'BLOCKED') then
      old_state := review.state;
      perform set_config('forge.cartera020c_command', 'on', true);
      update public.cartera020c_confirmation_reviews
      set state = 'BLOCKED',
          state_version = state_version + 1,
          last_error_code = 'CARTERA020C_CHANGED_INPUT_REPLAY',
          blocked_reason = 'CHANGED_INPUT_REPLAY',
          next_retry_at = null,
          updated_at = now_at
      where id = review.id and advisor_id = actor_id
      returning * into review;

      perform public.forge_cartera020c_record_transition(
        actor_id, review.id, old_state, review.state,
        'REVIEW_BLOCKED', null, 'CARTERA020C_CHANGED_INPUT_REPLAY',
        review.state_version,
        jsonb_build_object('conflictReference', conflict_reference), now_at
      );
    end if;

    return public.forge_cartera020c_status_response(actor_id, review.review_reference)
      || jsonb_build_object(
        'replayed', false,
        'conflictType', 'CHANGED_INPUT_REPLAY',
        'conflictReference', conflict_reference
      );
  end if;

  initial_state := case
    when jsonb_array_length(identity_commands) = 0 then 'IDENTITY_CONFIRMED'
    else 'IDENTITY_READY'
  end;

  insert into public.cartera020c_confirmation_reviews (
    advisor_id, review_reference, packet_id, packet_reference, inbox_item_id,
    source_reference, request_idempotency_key, identity_batch_digest,
    identity_account_decisions, state, identity_command_count,
    requested_at, requested_by, creates_truth
  ) values (
    actor_id, review_reference, packet.id, packet_reference, inbox.id,
    source.source_reference, request_idempotency_key, identity_batch_digest,
    account_decisions, initial_state, jsonb_array_length(identity_commands),
    requested_at, actor_id, false
  ) returning * into review;

  for command_item, sequence_number in
    select value, ordinality::integer
    from jsonb_array_elements(identity_commands) with ordinality
  loop
    if not public.forge_cartera010b_jsonb_keys_allowed(
         command_item,
         array['candidateReference','outcome','expectedPersonReference','command']
       )
       or command_item ->> 'candidateReference' !~ '^[A-Za-z0-9][A-Za-z0-9._:@/-]{0,239}$'
       or command_item ->> 'expectedPersonReference' !~ '^[A-Za-z0-9][A-Za-z0-9._:@/-]{0,239}$'
       or command_item ->> 'outcome' not in ('LINK_CONFIRMED','CREATE_CONFIRMED','CORRECTED') then
      raise exception 'CARTERA020C_IDENTITY_COMMAND_ITEM_INVALID';
    end if;

    command_payload := command_item -> 'command';
    if not public.forge_cartera010b_jsonb_keys_allowed(
         command_payload,
         array[
           'contractType','contractVersion','advisorId','actorReference',
           'idempotencyKey','decidedAt','outcome','sourceIdentity',
           'existingPersonReference','newPerson','candidatePersonReferences',
           'evidenceReferences','reasonCode','commandDigest'
         ]
       )
       or command_payload ->> 'contractType' <> 'FORGE_IDENTITY_RESOLUTION_COMMAND'
       or command_payload ->> 'contractVersion' <> 'CARTERA-010B.1'
       or command_payload ->> 'advisorId' <> actor_id::text
       or command_payload ->> 'actorReference' <> actor_id::text
       or command_payload ->> 'outcome' <> command_item ->> 'outcome'
       or command_payload ->> 'idempotencyKey' !~ '^[A-Za-z0-9][A-Za-z0-9._:@/-]{0,159}$'
       or command_payload ->> 'commandDigest' !~ '^[a-f0-9]{64}$'
       or command_payload -> 'sourceIdentity' ->> 'sourceDomain' <> 'CARTERA_EVIDENCE'
       or command_payload -> 'sourceIdentity' ->> 'sourceIdentityType' <> 'POLICY_PACKET_IDENTITY_CANDIDATE'
       or command_payload -> 'sourceIdentity' ->> 'sourceRecordReference' <> command_item ->> 'candidateReference' then
      raise exception 'CARTERA020C_IDENTITY_COMMAND_CONTRACT_INVALID';
    end if;

    expected_person_reference := coalesce(
      nullif(btrim(command_payload ->> 'existingPersonReference'), ''),
      nullif(btrim(command_payload -> 'newPerson' ->> 'personReference'), '')
    );
    if expected_person_reference is distinct from command_item ->> 'expectedPersonReference' then
      raise exception 'CARTERA020C_EXPECTED_PERSON_REFERENCE_MISMATCH';
    end if;

    server_command_digest := public.forge_cartera010b_command_digest(command_payload);
    insert into public.cartera020c_confirmation_commands (
      advisor_id, command_reference, review_id, sequence_number, stage,
      candidate_reference, command_type, idempotency_key, command_digest,
      command_payload, expected_result, contains_restricted_data
    ) values (
      actor_id,
      'CONFIRMATION_COMMAND:' || substr(public.forge_cartera020c_json_digest(
        jsonb_build_object(
          'reviewReference', review_reference,
          'sequenceNumber', sequence_number,
          'commandDigest', server_command_digest
        )
      ), 1, 40),
      review.id, sequence_number, 'IDENTITY_RESOLUTION',
      command_item ->> 'candidateReference', 'IDENTITY_RESOLUTION',
      command_payload ->> 'idempotencyKey', server_command_digest,
      command_payload,
      jsonb_build_object(
        'candidateReference', command_item ->> 'candidateReference',
        'expectedPersonReference', command_item ->> 'expectedPersonReference',
        'outcome', command_item ->> 'outcome'
      ),
      false
    );
  end loop;

  perform public.forge_cartera020c_record_transition(
    actor_id, review.id, 'PENDING_REVIEW', initial_state,
    'IDENTITY_EXECUTION_AUTHORIZED', null,
    'CARTERA020C_IDENTITY_EXECUTION_AUTHORIZED', review.state_version,
    jsonb_build_object(
      'identityCommandCount', review.identity_command_count,
      'packetReference', packet_reference
    ), requested_at
  );

  return public.forge_cartera020c_status_response(actor_id, review_reference)
    || jsonb_build_object('replayed', false);
end;
$$;


commit;
