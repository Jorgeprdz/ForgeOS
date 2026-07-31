-- CARTERA 020C.3 separate Policy authorization RPC.
-- Repository implementation only. This migration is NOT remote deployment authorization.
-- Canonical mutation remains confined to accepted CARTERA 010B governed RPCs.

begin;

create or replace function public.forge_cartera020c_attach_policy_confirmation(
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
  authorization_payload jsonb;
  authorized_at timestamptz;
  composition jsonb;
  composition_digest text;
  identity_batch jsonb;
  identity_batch_digest text;
  verification jsonb;
  verification_item jsonb;
  resolved_people jsonb;
  resolved_accounts jsonb;
  plan jsonb;
  policy_command jsonb;
  server_command_digest text;
  contains_restricted_data boolean;
  review public.cartera020c_confirmation_reviews%rowtype;
  identity_command public.cartera020c_confirmation_commands%rowtype;
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
         'authorization','composition'
       ]
     )
     or p_request ->> 'contractType' <> 'FORGE_CARTERA_020C_POLICY_EXECUTION_REQUEST'
     or p_request ->> 'contractVersion' <> 'CARTERA-020C.3'
     or p_request ->> 'advisorId' <> actor_id::text
     or p_request ->> 'actorReference' <> actor_id::text then
    raise exception 'CARTERA020C_POLICY_EXECUTION_REQUEST_INVALID';
  end if;

  review_reference := nullif(btrim(p_request ->> 'reviewReference'), '');
  packet_reference := nullif(btrim(p_request ->> 'packetReference'), '');
  request_idempotency_key := nullif(btrim(p_request ->> 'idempotencyKey'), '');
  authorization_payload := p_request -> 'authorization';
  composition := p_request -> 'composition';

  begin
    requested_at := (p_request ->> 'requestedAt')::timestamptz;
    authorized_at := (authorization_payload ->> 'authorizedAt')::timestamptz;
  exception when others then
    raise exception 'CARTERA020C_POLICY_EXECUTION_TIME_INVALID';
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
    raise exception 'CARTERA020C_POLICY_EXECUTION_REQUEST_VALUES_INVALID';
  end if;

  if not public.forge_cartera010b_jsonb_keys_allowed(
       authorization_payload,
       array[
         'contractType','contractVersion','scope','reviewReference','advisorId',
         'actorReference','authorizedAt','confirmation','payloadDigest'
       ]
     )
     or authorization_payload ->> 'contractType' <> 'FORGE_CARTERA_020C_EXECUTION_AUTHORIZATION'
     or authorization_payload ->> 'contractVersion' <> 'CARTERA-020C.3'
     or authorization_payload ->> 'scope' <> 'CONFIRMED_POLICY'
     or authorization_payload ->> 'reviewReference' <> review_reference
     or authorization_payload ->> 'advisorId' <> actor_id::text
     or authorization_payload ->> 'actorReference' <> actor_id::text
     or authorization_payload ->> 'confirmation' <> 'CONFIRM_POLICY_PERSISTENCE'
     or authorization_payload ->> 'payloadDigest' !~ '^[a-f0-9]{64}$' then
    raise exception 'CARTERA020C_POLICY_EXECUTION_AUTHORIZATION_INVALID';
  end if;

  if composition is null
     or jsonb_typeof(composition) <> 'object'
     or composition ->> 'contractType' <> 'FORGE_CARTERA_020C_GOVERNED_COMMAND_COMPOSITION'
     or composition ->> 'contractVersion' <> 'CARTERA-020C.2'
     or composition ->> 'reviewReference' <> review_reference
     or composition ->> 'packetReference' <> packet_reference
     or composition -> 'createsTruth' <> 'false'::jsonb
     or composition -> 'invokesRemoteCommand' <> 'false'::jsonb
     or composition -> 'requiresExplicitExecution' <> 'true'::jsonb then
    raise exception 'CARTERA020C_POLICY_COMPOSITION_INVALID';
  end if;

  composition_digest := public.forge_cartera020c_json_digest(composition);
  identity_batch := composition -> 'identityBatch';
  verification := composition -> 'identityVerification';
  plan := composition -> 'confirmationPlan';
  identity_batch_digest := public.forge_cartera020c_json_digest(identity_batch);

  if identity_batch ->> 'reviewReference' <> review_reference
     or identity_batch ->> 'packetReference' <> packet_reference
     or identity_batch ->> 'advisorId' <> actor_id::text
     or identity_batch ->> 'actorReference' <> actor_id::text then
    raise exception 'CARTERA020C_POLICY_IDENTITY_BATCH_SCOPE_MISMATCH';
  end if;

  if verification is null
     or jsonb_typeof(verification) <> 'object'
     or verification ->> 'contractType' <> 'FORGE_CARTERA_020C_IDENTITY_RESULT_VERIFICATION'
     or verification ->> 'contractVersion' <> 'CARTERA-020C.2'
     or verification ->> 'reviewReference' <> review_reference
     or verification ->> 'packetReference' <> packet_reference
     or verification ->> 'advisorId' <> actor_id::text
     or verification ->> 'actorReference' <> actor_id::text
     or verification -> 'allRequiredParticipantsResolved' <> 'true'::jsonb
     or verification -> 'createsTruth' <> 'false'::jsonb
     or verification -> 'invokesRemoteCommand' <> 'false'::jsonb
     or jsonb_typeof(verification -> 'resolvedPeople') <> 'array'
     or jsonb_typeof(verification -> 'resolvedAccounts') <> 'array' then
    raise exception 'CARTERA020C_IDENTITY_VERIFICATION_INVALID';
  end if;

  if plan is null
     or jsonb_typeof(plan) <> 'object'
     or plan -> 'invocationOrder' <> '["IDENTITY_RESOLUTION","CONFIRMED_POLICY"]'::jsonb
     or plan -> 'createsTruth' <> 'false'::jsonb
     or plan -> 'invokesRemoteCommand' <> 'false'::jsonb
     or plan -> 'requiresExplicitExecution' <> 'true'::jsonb then
    raise exception 'CARTERA020C_CONFIRMATION_ORDER_INVALID';
  end if;

  policy_command := plan -> 'confirmedPolicyCommand';
  if policy_command is null
     or jsonb_typeof(policy_command) <> 'object'
     or policy_command ->> 'contractType' <> 'FORGE_CONFIRMED_POLICY_COMMAND'
     or policy_command ->> 'contractVersion' <> 'CARTERA-010B.1'
     or policy_command ->> 'advisorId' <> actor_id::text
     or policy_command ->> 'actorReference' <> actor_id::text
     or policy_command ->> 'idempotencyKey' !~ '^[A-Za-z0-9][A-Za-z0-9._:@/-]{0,159}$'
     or policy_command ->> 'commandDigest' !~ '^[a-f0-9]{64}$'
     or jsonb_typeof(policy_command -> 'policy') <> 'object'
     or jsonb_typeof(policy_command -> 'roles') <> 'array'
     or jsonb_typeof(policy_command -> 'evidence') <> 'object' then
    raise exception 'CARTERA020C_CONFIRMED_POLICY_COMMAND_INVALID';
  end if;

  perform pg_advisory_xact_lock(hashtextextended(
    actor_id::text || '|CARTERA020C_REVIEW|' || review_reference, 0
  ));

  select * into review
  from public.cartera020c_confirmation_reviews r
  where r.advisor_id = actor_id
    and r.review_reference = review_reference
  for update;

  if review.id is null or review.packet_reference <> packet_reference then
    raise exception 'CARTERA020C_CONFIRMATION_REVIEW_NOT_FOUND';
  end if;

  if review.policy_request_idempotency_key is not null then
    if review.policy_request_idempotency_key = request_idempotency_key
       and review.policy_composition_digest = composition_digest then
      return public.forge_cartera020c_status_response(actor_id, review_reference)
        || jsonb_build_object('replayed', true);
    end if;

    conflict_reference := public.forge_cartera020c_record_conflict(
      actor_id, review_reference, 'CHANGED_INPUT_REPLAY',
      request_idempotency_key, review.policy_composition_digest,
      composition_digest, null, now_at
    );

    if review.state not in ('BLOCKED','REJECTED','CONFIRMED')
       and public.cartera020c_review_transition_allowed(review.state, 'BLOCKED') then
      old_state := review.state;
      perform set_config('forge.cartera020c_command', 'on', true);
      update public.cartera020c_confirmation_reviews
      set state = 'BLOCKED', state_version = state_version + 1,
          last_error_code = 'CARTERA020C_CHANGED_INPUT_REPLAY',
          blocked_reason = 'CHANGED_INPUT_REPLAY', updated_at = now_at
      where id = review.id and advisor_id = actor_id
      returning * into review;

      perform public.forge_cartera020c_record_transition(
        actor_id, review.id, old_state, review.state,
        'REVIEW_BLOCKED', null, 'CARTERA020C_CHANGED_INPUT_REPLAY',
        review.state_version,
        jsonb_build_object('conflictReference', conflict_reference), now_at
      );
    end if;

    return public.forge_cartera020c_status_response(actor_id, review_reference)
      || jsonb_build_object(
        'replayed', false,
        'conflictType', 'CHANGED_INPUT_REPLAY',
        'conflictReference', conflict_reference
      );
  end if;

  if review.state <> 'IDENTITY_CONFIRMED'
     or review.identity_success_count <> review.identity_command_count
     or review.identity_batch_digest <> identity_batch_digest then
    raise exception 'CARTERA020C_IDENTITY_VERIFICATION_NOT_DURABLE';
  end if;

  resolved_people := verification -> 'resolvedPeople';
  resolved_accounts := verification -> 'resolvedAccounts';
  if jsonb_array_length(resolved_people) <> review.identity_command_count
     or resolved_accounts <> review.identity_account_decisions then
    raise exception 'CARTERA020C_IDENTITY_VERIFICATION_SCOPE_MISMATCH';
  end if;

  for identity_command in
    select *
    from public.cartera020c_confirmation_commands c
    where c.advisor_id = actor_id
      and c.review_id = review.id
      and c.stage = 'IDENTITY_RESOLUTION'
    order by c.sequence_number
  loop
    select value into verification_item
    from jsonb_array_elements(resolved_people)
    where value ->> 'candidateReference' = identity_command.candidate_reference
    limit 1;

    if verification_item is null
       or identity_command.status <> 'SUCCEEDED'
       or verification_item ->> 'personReference' <> identity_command.receipt_payload ->> 'personReference'
       or verification_item ->> 'status' <> identity_command.receipt_payload ->> 'status'
       or verification_item ->> 'idempotencyKey' <> identity_command.idempotency_key
       or verification_item ->> 'serverCommandDigest' <> identity_command.receipt_payload ->> 'serverCommandDigest'
       or coalesce(verification_item ->> 'outcome', '') <>
          coalesce(identity_command.receipt_payload ->> 'outcome', identity_command.expected_result ->> 'outcome', '') then
      raise exception 'CARTERA020C_IDENTITY_VERIFICATION_RECEIPT_MISMATCH';
    end if;
  end loop;

  server_command_digest := public.forge_cartera010b_command_digest(policy_command);
  select exists (
    select 1 from jsonb_array_elements(policy_command -> 'roles') role
    where role ->> 'roleType' = 'BENEFICIARY'
       or role ->> 'visibilityScope' = 'RESTRICTED_ROLE_VIEW'
       or role ->> 'privacyClassification' = 'RESTRICTED'
  ) into contains_restricted_data;

  insert into public.cartera020c_confirmation_commands (
    advisor_id, command_reference, review_id, sequence_number, stage,
    candidate_reference, command_type, idempotency_key, command_digest,
    command_payload, expected_result, contains_restricted_data
  ) values (
    actor_id,
    'CONFIRMATION_COMMAND:' || substr(public.forge_cartera020c_json_digest(
      jsonb_build_object(
        'reviewReference', review_reference,
        'sequenceNumber', review.identity_command_count + 1,
        'commandDigest', server_command_digest
      )
    ), 1, 40),
    review.id, review.identity_command_count + 1, 'CONFIRMED_POLICY',
    null, 'CONFIRMED_POLICY', policy_command ->> 'idempotencyKey',
    server_command_digest, policy_command,
    jsonb_build_object(
      'policyReference', policy_command -> 'policy' ->> 'policyReference',
      'policyVersion', policy_command -> 'policy' -> 'currentVersion',
      'evidenceVersionReference', policy_command -> 'evidence' ->> 'evidenceVersionReference',
      'roleCount', jsonb_array_length(policy_command -> 'roles')
    ),
    contains_restricted_data
  );

  old_state := review.state;
  perform set_config('forge.cartera020c_command', 'on', true);
  update public.cartera020c_confirmation_reviews
  set policy_request_idempotency_key = request_idempotency_key,
      policy_composition_digest = composition_digest,
      policy_requested_at = requested_at,
      policy_requested_by = actor_id,
      policy_command_count = 1,
      state = 'POLICY_READY',
      state_version = state_version + 1,
      last_error_code = null,
      blocked_reason = null,
      updated_at = now_at
  where id = review.id and advisor_id = actor_id
  returning * into review;

  perform public.forge_cartera020c_record_transition(
    actor_id, review.id, old_state, review.state,
    'POLICY_EXECUTION_AUTHORIZED', review.identity_command_count + 1,
    'CARTERA020C_POLICY_EXECUTION_AUTHORIZED', review.state_version,
    jsonb_build_object(
      'containsRestrictedData', contains_restricted_data,
      'policyReference', policy_command -> 'policy' ->> 'policyReference'
    ), requested_at
  );

  return public.forge_cartera020c_status_response(actor_id, review_reference)
    || jsonb_build_object('replayed', false);
end;
$$;


commit;
