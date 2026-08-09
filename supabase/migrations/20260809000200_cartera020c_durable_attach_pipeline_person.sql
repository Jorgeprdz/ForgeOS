-- CARTERA 020C durable Policy attach + canonical authorization boundary.
-- Fixes browser/server digest drift without weakening the explicit human authorization gate.
-- Identity receipts remain durable; a retry from IDENTITY_CONFIRMED reuses the exact stored batch.

begin;

create or replace function public.forge_cartera020c_prepare_identity_orchestration_canonical(
  p_request jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  actor_id uuid := auth.uid();
  batch jsonb := p_request -> 'identityBatch';
  authorization_payload jsonb := p_request -> 'authorization';
  bound_request jsonb;
begin
  if actor_id is null then raise exception 'CARTERA020C_AUTH_REQUIRED'; end if;
  if p_request is null or jsonb_typeof(p_request) <> 'object'
     or p_request ->> 'contractType' <> 'FORGE_CARTERA_020C_IDENTITY_EXECUTION_REQUEST'
     or p_request ->> 'contractVersion' <> 'CARTERA-020C.3'
     or p_request ->> 'advisorId' <> actor_id::text
     or p_request ->> 'actorReference' <> actor_id::text
     or batch is null or jsonb_typeof(batch) <> 'object'
     or authorization_payload is null or jsonb_typeof(authorization_payload) <> 'object'
     or authorization_payload ->> 'scope' <> 'IDENTITY_RESOLUTION'
     or authorization_payload ->> 'confirmation' <> 'CONFIRM_IDENTITY_RESOLUTION'
     or authorization_payload ->> 'reviewReference' <> p_request ->> 'reviewReference' then
    raise exception 'CARTERA020C_CANONICAL_IDENTITY_REQUEST_INVALID';
  end if;

  bound_request := jsonb_set(
    p_request,
    '{authorization,payloadDigest}',
    to_jsonb(public.forge_cartera020c_authorization_digest(batch)),
    true
  );
  return public.forge_cartera020c_prepare_identity_orchestration(bound_request);
end;
$$;

create or replace function public.forge_cartera020c_attach_policy_confirmation_durable(
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
  requested_at timestamptz;
  authorization_payload jsonb := p_request -> 'authorization';
  incoming_composition jsonb := p_request -> 'composition';
  incoming_plan jsonb;
  policy_command jsonb;
  durable_commands jsonb;
  durable_batch jsonb;
  durable_verification jsonb;
  durable_people jsonb;
  durable_accounts jsonb;
  durable_composition jsonb;
  durable_authorization jsonb;
  bound_request jsonb;
  review public.cartera020c_confirmation_reviews%rowtype;
begin
  if actor_id is null then raise exception 'CARTERA020C_AUTH_REQUIRED'; end if;
  if p_request is null or jsonb_typeof(p_request) <> 'object'
     or p_request ->> 'contractType' <> 'FORGE_CARTERA_020C_POLICY_EXECUTION_REQUEST'
     or p_request ->> 'contractVersion' <> 'CARTERA-020C.3'
     or p_request ->> 'advisorId' <> actor_id::text
     or p_request ->> 'actorReference' <> actor_id::text then
    raise exception 'CARTERA020C_DURABLE_POLICY_REQUEST_INVALID';
  end if;

  review_reference := nullif(btrim(p_request ->> 'reviewReference'), '');
  packet_reference := nullif(btrim(p_request ->> 'packetReference'), '');
  begin requested_at := (p_request ->> 'requestedAt')::timestamptz;
  exception when others then raise exception 'CARTERA020C_DURABLE_POLICY_TIME_INVALID'; end;

  if review_reference is null
     or review_reference !~ '^[A-Za-z0-9][A-Za-z0-9._:@/-]{0,239}$'
     or packet_reference is null
     or packet_reference !~ '^[A-Za-z0-9][A-Za-z0-9._:@/-]{0,239}$'
     or requested_at is null
     or authorization_payload is null or jsonb_typeof(authorization_payload) <> 'object'
     or authorization_payload ->> 'scope' <> 'CONFIRMED_POLICY'
     or authorization_payload ->> 'confirmation' <> 'CONFIRM_POLICY_PERSISTENCE'
     or authorization_payload ->> 'reviewReference' <> review_reference
     or incoming_composition is null or jsonb_typeof(incoming_composition) <> 'object' then
    raise exception 'CARTERA020C_DURABLE_POLICY_REQUEST_VALUES_INVALID';
  end if;

  perform pg_advisory_xact_lock(hashtextextended(
    actor_id::text || '|CARTERA020C_DURABLE_ATTACH|' || review_reference, 0
  ));

  select * into review
  from public.cartera020c_confirmation_reviews r
  where r.advisor_id = actor_id
    and r.review_reference = review_reference
  for update;

  if review.id is null
     or review.packet_reference <> packet_reference
     or review.state not in ('IDENTITY_CONFIRMED','POLICY_READY','POLICY_EXECUTING','CONFIRMED') then
    raise exception 'CARTERA020C_DURABLE_IDENTITY_NOT_READY';
  end if;

  if review.state in ('POLICY_READY','POLICY_EXECUTING','CONFIRMED') then
    return public.forge_cartera020c_status_response(actor_id, review_reference)
      || jsonb_build_object('replayed', true);
  end if;

  select coalesce(jsonb_agg(
    jsonb_build_object(
      'candidateReference', c.candidate_reference,
      'outcome', coalesce(c.receipt_payload ->> 'outcome', c.expected_result ->> 'outcome'),
      'expectedPersonReference', c.receipt_payload ->> 'personReference',
      'command', c.command_payload
    ) order by c.sequence_number
  ), '[]'::jsonb),
  coalesce(jsonb_agg(
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
  ), '[]'::jsonb)
  into durable_commands, durable_people
  from public.cartera020c_confirmation_commands c
  where c.advisor_id = actor_id
    and c.review_id = review.id
    and c.stage = 'IDENTITY_RESOLUTION'
    and c.status = 'SUCCEEDED';

  if jsonb_array_length(durable_commands) <> review.identity_command_count
     or jsonb_array_length(durable_people) <> review.identity_success_count then
    raise exception 'CARTERA020C_DURABLE_IDENTITY_RECEIPTS_INCOMPLETE';
  end if;

  durable_accounts := coalesce(review.identity_account_decisions, '[]'::jsonb);
  durable_batch := jsonb_build_object(
    'contractType','FORGE_CARTERA_020C_IDENTITY_COMMAND_BATCH',
    'contractVersion','CARTERA-020C.2',
    'reviewReference',review.review_reference,
    'packetReference',review.packet_reference,
    'advisorId',actor_id::text,
    'actorReference',actor_id::text,
    'commands',durable_commands,
    'accountDecisions',durable_accounts,
    'invocationOrder',jsonb_build_array('IDENTITY_RESOLUTION'),
    'createsTruth',false,
    'invokesRemoteCommand',false,
    'requiresExplicitExecution',true
  );

  if public.forge_cartera020c_json_digest(durable_batch) is distinct from review.identity_batch_digest then
    raise exception 'CARTERA020C_DURABLE_IDENTITY_BATCH_MISMATCH';
  end if;

  durable_verification := jsonb_build_object(
    'contractType','FORGE_CARTERA_020C_IDENTITY_RESULT_VERIFICATION',
    'contractVersion','CARTERA-020C.2',
    'reviewReference',review.review_reference,
    'packetReference',review.packet_reference,
    'advisorId',actor_id::text,
    'actorReference',actor_id::text,
    'resolvedPeople',durable_people,
    'resolvedAccounts',durable_accounts,
    'allRequiredParticipantsResolved',true,
    'createsTruth',false,
    'invokesRemoteCommand',false
  );

  incoming_plan := incoming_composition -> 'confirmationPlan';
  policy_command := incoming_plan -> 'confirmedPolicyCommand';
  if incoming_plan is null or jsonb_typeof(incoming_plan) <> 'object'
     or policy_command is null or jsonb_typeof(policy_command) <> 'object'
     or policy_command ->> 'contractType' <> 'FORGE_CONFIRMED_POLICY_COMMAND'
     or policy_command ->> 'contractVersion' <> 'CARTERA-010B.1'
     or policy_command ->> 'advisorId' <> actor_id::text
     or policy_command ->> 'actorReference' <> actor_id::text then
    raise exception 'CARTERA020C_DURABLE_POLICY_COMMAND_INVALID';
  end if;

  -- The browser may serialize JSON differently; bind the canonical writer digest on the server.
  policy_command := jsonb_set(
    policy_command,
    '{commandDigest}',
    to_jsonb(public.forge_cartera010b_command_digest(policy_command)),
    true
  );

  -- A Policy role may only point to a person resolved by the durable identity stage.
  if exists (
    select 1
    from jsonb_array_elements(policy_command -> 'roles') role
    where nullif(btrim(role ->> 'participantPersonReference'), '') is not null
      and not exists (
        select 1 from jsonb_array_elements(durable_people) person
        where person ->> 'personReference' = role ->> 'participantPersonReference'
      )
  ) then
    raise exception 'CARTERA020C_DURABLE_POLICY_PARTICIPANT_MISMATCH';
  end if;

  durable_composition := jsonb_build_object(
    'contractType','FORGE_CARTERA_020C_GOVERNED_COMMAND_COMPOSITION',
    'contractVersion','CARTERA-020C.2',
    'reviewReference',review.review_reference,
    'packetReference',review.packet_reference,
    'identityBatch',durable_batch,
    'identityVerification',durable_verification,
    'confirmationPlan',jsonb_build_object(
      'invocationOrder',jsonb_build_array('IDENTITY_RESOLUTION','CONFIRMED_POLICY'),
      'confirmedPolicyCommand',policy_command,
      'createsTruth',false,
      'invokesRemoteCommand',false,
      'requiresExplicitExecution',true
    ),
    'fieldClaims',policy_command -> 'evidence' -> 'fieldClaims',
    'evidenceReference',policy_command -> 'evidence' ->> 'evidenceVersionReference',
    'createsTruth',false,
    'invokesRemoteCommand',false,
    'requiresExplicitExecution',true
  );

  durable_authorization := jsonb_build_object(
    'contractType','FORGE_CARTERA_020C_EXECUTION_AUTHORIZATION',
    'contractVersion','CARTERA-020C.3',
    'scope','CONFIRMED_POLICY',
    'reviewReference',review.review_reference,
    'advisorId',actor_id::text,
    'actorReference',actor_id::text,
    'authorizedAt',requested_at,
    'confirmation','CONFIRM_POLICY_PERSISTENCE',
    'payloadDigest',public.forge_cartera020c_authorization_digest(durable_composition)
  );

  bound_request := jsonb_build_object(
    'contractType','FORGE_CARTERA_020C_POLICY_EXECUTION_REQUEST',
    'contractVersion','CARTERA-020C.3',
    'advisorId',actor_id::text,
    'actorReference',actor_id::text,
    'reviewReference',review.review_reference,
    'packetReference',review.packet_reference,
    'idempotencyKey',p_request ->> 'idempotencyKey',
    'requestedAt',requested_at,
    'authorization',durable_authorization,
    'composition',durable_composition
  );

  return public.forge_cartera020c_attach_policy_confirmation(bound_request);
end;
$$;

revoke all on function public.forge_cartera020c_prepare_identity_orchestration_canonical(jsonb)
  from public, anon;
revoke all on function public.forge_cartera020c_attach_policy_confirmation_durable(jsonb)
  from public, anon;
grant execute on function public.forge_cartera020c_prepare_identity_orchestration_canonical(jsonb)
  to authenticated;
grant execute on function public.forge_cartera020c_attach_policy_confirmation_durable(jsonb)
  to authenticated;

comment on function public.forge_cartera020c_prepare_identity_orchestration_canonical(jsonb) is
  'Server-canonical digest binding for explicit 020C Identity authorization; no identity decision is inferred.';
comment on function public.forge_cartera020c_attach_policy_confirmation_durable(jsonb) is
  'Retry-safe 020C Policy attach that reuses the exact durable succeeded Identity batch and server-canonical digests before invoking the existing governed Policy boundary.';

commit;