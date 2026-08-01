begin;

do $cartera020c$
#variable_conflict use_variable
declare
  user_a uuid := gen_random_uuid();
  user_b uuid := gen_random_uuid();
  suffix text := replace(gen_random_uuid()::text, '-', '');
  t_identity timestamptz := clock_timestamp() - interval '4 minutes';
  t_policy timestamptz := clock_timestamp() - interval '2 minutes';
  source_id uuid;
  inbox_id uuid;
  candidate_id uuid;
  packet_id uuid;
  source_reference text := 'CARTERA020C_ACCEPTANCE:SOURCE:' || suffix;
  packet_reference text := 'CARTERA020C_ACCEPTANCE:PACKET:' || suffix;
  review_reference text := 'CARTERA020C_ACCEPTANCE:REVIEW:' || suffix;
  identity_candidate_reference text := 'CARTERA020C_ACCEPTANCE:IDENTITY:' || suffix;
  person_reference text := 'CARTERA020C_ACCEPTANCE:PERSON:' || suffix;
  policy_reference text := 'CARTERA020C_ACCEPTANCE:POLICY:' || suffix;
  evidence_reference text := 'CARTERA020C_ACCEPTANCE:EVIDENCE:' || suffix;
  identity_batch jsonb;
  identity_request jsonb;
  identity_status jsonb;
  identity_result jsonb;
  identity_verification jsonb;
  policy_command jsonb;
  composition jsonb;
  policy_request jsonb;
  final_status jsonb;
  replay_status jsonb;
  cross_error text;
  row_count bigint;

  conflict_source_id uuid;
  conflict_inbox_id uuid;
  conflict_candidate_id uuid;
  conflict_packet_id uuid;
  conflict_source_reference text := 'CARTERA020C_CONFLICT:SOURCE:' || suffix;
  conflict_packet_reference text := 'CARTERA020C_CONFLICT:PACKET:' || suffix;
  conflict_review_reference text := 'CARTERA020C_CONFLICT:REVIEW:' || suffix;
  conflict_candidate_reference text := 'CARTERA020C_CONFLICT:IDENTITY:' || suffix;
  conflict_person_reference text := 'CARTERA020C_CONFLICT:PERSON:' || suffix;
  conflict_batch jsonb;
  conflict_request jsonb;
  changed_batch jsonb;
  changed_request jsonb;
  conflict_status jsonb;

  retry_source_id uuid;
  retry_inbox_id uuid;
  retry_candidate_id uuid;
  retry_packet_id uuid;
  retry_source_reference text := 'CARTERA020C_RETRY:SOURCE:' || suffix;
  retry_packet_reference text := 'CARTERA020C_RETRY:PACKET:' || suffix;
  retry_review_reference text := 'CARTERA020C_RETRY:REVIEW:' || suffix;
  retry_candidate_reference text := 'CARTERA020C_RETRY:IDENTITY:' || suffix;
  retry_person_reference text := 'CARTERA020C_RETRY:PERSON:' || suffix;
  retry_batch jsonb;
  retry_request jsonb;
  retry_status jsonb;
  retry_version integer;
begin
  insert into auth.users (
    instance_id,id,aud,role,email,encrypted_password,email_confirmed_at,
    raw_app_meta_data,raw_user_meta_data,created_at,updated_at
  ) values
  (
    '00000000-0000-0000-0000-000000000000',user_a,
    'authenticated','authenticated','cartera020c-a-' || suffix || '@forge.invalid','',now(),
    '{"provider":"email","providers":["email"]}'::jsonb,'{}'::jsonb,now(),now()
  ),
  (
    '00000000-0000-0000-0000-000000000000',user_b,
    'authenticated','authenticated','cartera020c-b-' || suffix || '@forge.invalid','',now(),
    '{"provider":"email","providers":["email"]}'::jsonb,'{}'::jsonb,now(),now()
  );

  insert into public.cartera020b_evidence_sources (
    advisor_id,source_reference,source_type,original_filename,mime_type,
    byte_size,document_digest,storage_reference,purpose,received_at,received_by
  ) values (
    user_a,source_reference,'UPLOAD','cartera020c-policy.pdf','application/pdf',
    2048,repeat('a',64),'cartera020c/acceptance/' || suffix,'POLICY_INTAKE',
    t_identity,user_a
  ) returning id into source_id;

  insert into public.cartera020b_evidence_inbox_items (
    advisor_id,inbox_reference,source_id,status,document_type_candidate,
    classification_state,classification_confidence,worker_state,state_version
  ) values (
    user_a,'CARTERA020C_ACCEPTANCE:INBOX:' || suffix,source_id,
    'confirmation_required','POLICY','MATCHED',0.99,'COMPLETED',5
  ) returning id into inbox_id;

  insert into public.cartera020b_extraction_candidates (
    advisor_id,candidate_reference,inbox_item_id,candidate_type,classification,
    extracted_fields,overall_confidence,extraction_source,parser_id,parser_version
  ) values (
    user_a,'CARTERA020C_ACCEPTANCE:CANDIDATE:' || suffix,inbox_id,'POLICY',
    '{"documentType":"POLICY"}'::jsonb,
    jsonb_build_object('policyNumber','C020C-' || upper(substr(suffix,1,12))),
    0.99,'PDF_TEXT','REMOTE_ACCEPTANCE','1'
  ) returning id into candidate_id;

  insert into public.cartera020b_policy_evidence_packets (
    advisor_id,packet_reference,inbox_item_id,candidate_id,document_type,
    extracted_fields,extraction_confidence,identity_candidates,policy_role_candidates,
    existing_policy_candidates,confirmation_state,creates_truth
  ) values (
    user_a,packet_reference,inbox_id,candidate_id,'POLICY',
    jsonb_build_object('policyNumber','C020C-' || upper(substr(suffix,1,12))),
    0.99,
    jsonb_build_array(jsonb_build_object(
      'candidateReference',identity_candidate_reference,
      'candidateType','EXISTING_PERSON_OR_NEW_PERSON',
      'required',true,
      'proposedLabel','Ana Remote'
    )),
    jsonb_build_array(jsonb_build_object(
      'candidateReference','CARTERA020C_ACCEPTANCE:ROLE:OWNER:' || suffix,
      'roleType','OWNER','restricted',false
    )),
    '[]'::jsonb,'PENDING_CONFIRMATION',false
  ) returning id into packet_id;

  identity_batch := jsonb_build_object(
    'contractType','FORGE_CARTERA_020C_IDENTITY_COMMAND_BATCH',
    'contractVersion','CARTERA-020C.2',
    'reviewReference',review_reference,
    'packetReference',packet_reference,
    'advisorId',user_a::text,
    'actorReference',user_a::text,
    'commands',jsonb_build_array(jsonb_build_object(
      'candidateReference',identity_candidate_reference,
      'outcome','CREATE_CONFIRMED',
      'expectedPersonReference',person_reference,
      'command',jsonb_build_object(
        'contractType','FORGE_IDENTITY_RESOLUTION_COMMAND',
        'contractVersion','CARTERA-010B.1',
        'advisorId',user_a::text,
        'actorReference',user_a::text,
        'idempotencyKey','CARTERA020C_ACCEPTANCE:IDENTITY_COMMAND:' || suffix,
        'decidedAt',t_identity,
        'outcome','CREATE_CONFIRMED',
        'sourceIdentity',jsonb_build_object(
          'sourceDomain','CARTERA_EVIDENCE',
          'sourceIdentityType','POLICY_PACKET_IDENTITY_CANDIDATE',
          'sourceRecordReference',identity_candidate_reference,
          'prospectReference',null
        ),
        'existingPersonReference',null,
        'newPerson',jsonb_build_object(
          'personReference',person_reference,
          'displayName','Ana Remote',
          'preferredName','Ana',
          'normalizedName','ana remote',
          'verifiedPhone',null,
          'verifiedEmail',null,
          'birthDate',null,
          'privacyClassification','PRIVATE'
        ),
        'candidatePersonReferences','[]'::jsonb,
        'evidenceReferences',jsonb_build_array(source_reference),
        'reasonCode','ADVISOR_CONFIRMED_NEW_PERSON',
        'commandDigest',repeat('f',64)
      )
    )),
    'accountDecisions','[]'::jsonb,
    'invocationOrder',jsonb_build_array('IDENTITY_RESOLUTION'),
    'createsTruth',false,
    'invokesRemoteCommand',false,
    'requiresExplicitExecution',true
  );

  identity_request := jsonb_build_object(
    'contractType','FORGE_CARTERA_020C_IDENTITY_EXECUTION_REQUEST',
    'contractVersion','CARTERA-020C.3',
    'advisorId',user_a::text,
    'actorReference',user_a::text,
    'reviewReference',review_reference,
    'packetReference',packet_reference,
    'idempotencyKey','CARTERA020C_ACCEPTANCE:PREPARE:' || suffix,
    'requestedAt',t_identity,
    'authorization',jsonb_build_object(
      'contractType','FORGE_CARTERA_020C_EXECUTION_AUTHORIZATION',
      'contractVersion','CARTERA-020C.3',
      'scope','IDENTITY_RESOLUTION',
      'reviewReference',review_reference,
      'advisorId',user_a::text,
      'actorReference',user_a::text,
      'authorizedAt',t_identity,
      'confirmation','CONFIRM_IDENTITY_RESOLUTION',
      'payloadDigest',repeat('0',64)
    ),
    'identityBatch',identity_batch
  );

  perform set_config('request.jwt.claim.sub', user_a::text, true);
  perform set_config('request.jwt.claim.role', 'authenticated', true);
  execute 'set local role authenticated';
  begin
    perform public.forge_cartera020c_prepare_identity_orchestration(identity_request);
    raise exception 'CARTERA020C_FORGED_IDENTITY_AUTHORIZATION_ACCEPTED';
  exception when others then
    if position('CARTERA020C_IDENTITY_AUTHORIZATION_DIGEST_MISMATCH' in sqlerrm) = 0 then
      raise;
    end if;
  end;
  execute 'reset role';

  identity_request := jsonb_set(
    identity_request,
    '{authorization,payloadDigest}',
    to_jsonb(public.forge_cartera020c_authorization_digest(identity_batch))
  );

  perform set_config('request.jwt.claim.sub', user_a::text, true);
  perform set_config('request.jwt.claim.role', 'authenticated', true);
  execute 'set local role authenticated';
  identity_status := public.forge_cartera020c_prepare_identity_orchestration(identity_request);
  if identity_status ->> 'state' <> 'IDENTITY_READY'
     or (identity_status ->> 'stateVersion')::integer <> 1 then
    raise exception 'CARTERA020C_IDENTITY_PREPARATION_INVALID';
  end if;

  replay_status := public.forge_cartera020c_prepare_identity_orchestration(identity_request);
  if not coalesce((replay_status ->> 'replayed')::boolean, false)
     or replay_status ->> 'state' <> 'IDENTITY_READY' then
    raise exception 'CARTERA020C_IDENTITY_PREPARATION_REPLAY_INVALID';
  end if;

  begin
    execute 'select count(*) from public.cartera020c_confirmation_commands';
    raise exception 'CARTERA020C_DIRECT_COMMAND_READ_ALLOWED';
  exception when insufficient_privilege then null;
  end;
  begin
    execute 'delete from public.cartera020c_confirmation_reviews where false';
    raise exception 'CARTERA020C_DIRECT_REVIEW_WRITE_ALLOWED';
  exception when insufficient_privilege then null;
  end;
  begin
    execute 'insert into public.commercial_accounts default values';
    raise exception 'CARTERA020C_DIRECT_ACCOUNT_WRITE_ALLOWED';
  exception when insufficient_privilege then null;
  end;

  identity_status := public.forge_cartera020c_execute_next_confirmation_step(
    review_reference,
    (identity_status ->> 'stateVersion')::integer
  );
  if identity_status ->> 'state' <> 'IDENTITY_CONFIRMED'
     or (identity_status ->> 'identitySuccessCount')::integer <> 1 then
    raise exception 'CARTERA020C_IDENTITY_EXECUTION_INVALID';
  end if;
  identity_result := identity_status -> 'identityResults' -> 0;
  if identity_result ->> 'personReference' <> person_reference
     or identity_result ->> 'status' <> 'CONFIRMED' then
    raise exception 'CARTERA020C_IDENTITY_READ_AFTER_WRITE_INVALID';
  end if;

  execute 'reset role';
  perform set_config('request.jwt.claim.sub', user_b::text, true);
  perform set_config('request.jwt.claim.role', 'authenticated', true);
  execute 'set local role authenticated';
  begin
    perform public.forge_cartera020c_get_confirmation_status(review_reference);
    raise exception 'CARTERA020C_CROSS_ADVISOR_STATUS_VISIBLE';
  exception when others then
    cross_error := sqlerrm;
    if position('CARTERA020C_CONFIRMATION_REVIEW_NOT_FOUND' in cross_error) = 0 then
      raise;
    end if;
  end;
  execute 'reset role';

  identity_verification := jsonb_build_object(
    'contractType','FORGE_CARTERA_020C_IDENTITY_RESULT_VERIFICATION',
    'contractVersion','CARTERA-020C.2',
    'reviewReference',review_reference,
    'packetReference',packet_reference,
    'advisorId',user_a::text,
    'actorReference',user_a::text,
    'resolvedPeople',identity_status -> 'identityResults',
    'resolvedAccounts','[]'::jsonb,
    'allRequiredParticipantsResolved',true,
    'createsTruth',false,
    'invokesRemoteCommand',false
  );

  policy_command := jsonb_build_object(
    'contractType','FORGE_CONFIRMED_POLICY_COMMAND',
    'contractVersion','CARTERA-010B.1',
    'advisorId',user_a::text,
    'actorReference',user_a::text,
    'idempotencyKey','CARTERA020C_ACCEPTANCE:POLICY_COMMAND:' || suffix,
    'confirmedAt',t_policy,
    'policy',jsonb_build_object(
      'contractType','FORGE_CANONICAL_POLICY',
      'schemaVersion','2.0.0',
      'policyReference',policy_reference,
      'advisorId',user_a::text,
      'carrierReference','carrier/smnyl',
      'policyNumber','C020C-' || upper(substr(suffix,1,12)),
      'productReference','product/remote-acceptance',
      'issueDate',current_date,
      'effectiveFrom',t_policy,
      'effectiveTo',null,
      'status',jsonb_build_object('value','ISSUED','source',source_reference,'asOf',t_policy),
      'currency',null,
      'premiumAmount',null,
      'paymentFrequency',null,
      'sumInsured',null,
      'completenessState','PARTIAL',
      'freshnessState','CURRENT',
      'conflictState','CLEAR',
      'evidenceVersionReferences',jsonb_build_array(evidence_reference),
      'currentVersion',1,
      'createdAt',t_policy,
      'createdBy',user_a::text,
      'updatedAt',t_policy,
      'archivedAt',null,
      'archivedBy',null,
      'archiveReason',null
    ),
    'roles',jsonb_build_array(jsonb_build_object(
      'contractType','FORGE_POLICY_ROLE',
      'schemaVersion','1.0.0',
      'policyRoleReference','CARTERA020C_ACCEPTANCE:ROLE:OWNER:' || suffix,
      'policyReference',policy_reference,
      'advisorId',user_a::text,
      'participantPersonReference',person_reference,
      'participantAccountReference',null,
      'roleType','POLICY_OWNER',
      'confirmationState','CONFIRMED',
      'privacyClassification','PRIVATE',
      'visibilityScope','POLICY_TEAM',
      'evidenceReferences',jsonb_build_array(evidence_reference),
      'effectiveFrom',t_policy,
      'effectiveTo',null,
      'createdAt',t_policy,
      'createdBy',user_a::text,
      'version',1,
      'correctionOf',null,
      'archivedAt',null,
      'archivedBy',null,
      'archiveReason',null
    )),
    'evidence',jsonb_build_object(
      'evidenceVersionReference',evidence_reference,
      'documentHash',repeat('a',64),
      'sourceType','CARTERA020B_POLICY_PACKET',
      'observedAt',t_policy,
      'verificationState','REVIEWED',
      'fieldClaims','{}'::jsonb,
      'provenance',jsonb_build_object(
        'reviewReference',review_reference,
        'packetReference',packet_reference,
        'sourceReference',source_reference,
        'confirmationBoundary','CARTERA-020C'
      )
    ),
    'lineage','{}'::jsonb,
    'commandDigest',repeat('e',64)
  );

  composition := jsonb_build_object(
    'contractType','FORGE_CARTERA_020C_GOVERNED_COMMAND_COMPOSITION',
    'contractVersion','CARTERA-020C.2',
    'reviewReference',review_reference,
    'packetReference',packet_reference,
    'identityBatch',identity_batch,
    'identityVerification',identity_verification,
    'confirmationPlan',jsonb_build_object(
      'contractType','FORGE_IDENTITY_POLICY_CONFIRMATION_PLAN',
      'contractVersion','CARTERA-020C.1',
      'invocationOrder',jsonb_build_array('IDENTITY_RESOLUTION','CONFIRMED_POLICY'),
      'confirmedPolicyCommand',policy_command,
      'createsTruth',false,
      'invokesRemoteCommand',false,
      'requiresExplicitExecution',true
    ),
    'fieldClaims','{}'::jsonb,
    'evidenceReference',evidence_reference,
    'createsTruth',false,
    'invokesRemoteCommand',false,
    'requiresExplicitExecution',true
  );

  policy_request := jsonb_build_object(
    'contractType','FORGE_CARTERA_020C_POLICY_EXECUTION_REQUEST',
    'contractVersion','CARTERA-020C.3',
    'advisorId',user_a::text,
    'actorReference',user_a::text,
    'reviewReference',review_reference,
    'packetReference',packet_reference,
    'idempotencyKey','CARTERA020C_ACCEPTANCE:POLICY_PREPARE:' || suffix,
    'requestedAt',t_policy,
    'authorization',jsonb_build_object(
      'contractType','FORGE_CARTERA_020C_EXECUTION_AUTHORIZATION',
      'contractVersion','CARTERA-020C.3',
      'scope','CONFIRMED_POLICY',
      'reviewReference',review_reference,
      'advisorId',user_a::text,
      'actorReference',user_a::text,
      'authorizedAt',t_policy,
      'confirmation','CONFIRM_POLICY_PERSISTENCE',
      'payloadDigest',repeat('0',64)
    ),
    'composition',composition
  );

  perform set_config('request.jwt.claim.sub', user_a::text, true);
  perform set_config('request.jwt.claim.role', 'authenticated', true);
  execute 'set local role authenticated';
  begin
    perform public.forge_cartera020c_attach_policy_confirmation(policy_request);
    raise exception 'CARTERA020C_FORGED_POLICY_AUTHORIZATION_ACCEPTED';
  exception when others then
    if position('CARTERA020C_POLICY_AUTHORIZATION_DIGEST_MISMATCH' in sqlerrm) = 0 then
      raise;
    end if;
  end;
  execute 'reset role';

  policy_request := jsonb_set(
    policy_request,
    '{authorization,payloadDigest}',
    to_jsonb(public.forge_cartera020c_authorization_digest(composition))
  );
  perform set_config('request.jwt.claim.sub', user_a::text, true);
  perform set_config('request.jwt.claim.role', 'authenticated', true);
  execute 'set local role authenticated';
  final_status := public.forge_cartera020c_attach_policy_confirmation(policy_request);
  if final_status ->> 'state' <> 'POLICY_READY' then
    raise exception 'CARTERA020C_POLICY_ATTACHMENT_INVALID';
  end if;

  final_status := public.forge_cartera020c_execute_next_confirmation_step(
    review_reference,
    (final_status ->> 'stateVersion')::integer
  );
  if final_status ->> 'state' <> 'CONFIRMED'
     or final_status -> 'policyResult' ->> 'policyReference' <> policy_reference
     or coalesce((final_status ->> 'commandPayloadProjected')::boolean, true)
     or coalesce((final_status ->> 'hasRestrictedPolicyData')::boolean, true) then
    raise exception 'CARTERA020C_POLICY_CONFIRMATION_INVALID';
  end if;
  if final_status ? 'commandPayload'
     or final_status ? 'roles'
     or final_status::text ilike '%beneficiary%' then
    raise exception 'CARTERA020C_SANITIZED_STATUS_LEAK';
  end if;

  execute 'reset role';
  select count(*) into row_count
  from public.cartera020c_confirmation_attempts a
  join public.cartera020c_confirmation_reviews r on r.id = a.review_id
  where r.advisor_id = user_a and r.review_reference = review_reference;
  if row_count <> 2 then
    raise exception 'CARTERA020C_ATTEMPT_COUNT_INVALID';
  end if;
  if not exists (
    select 1 from public.cartera020b_evidence_inbox_items i
    where i.id = inbox_id and i.status = 'confirmed'
  ) then
    raise exception 'CARTERA020C_INBOX_NOT_CONFIRMED';
  end if;
  if not exists (
    select 1 from public.canonical_policies p
    where p.advisor_id = user_a and p.policy_reference = policy_reference
  ) then
    raise exception 'CARTERA020C_CANONICAL_POLICY_NOT_FOUND';
  end if;

  -- Changed-input replay must block a separate review without executing canonical truth.
  insert into public.cartera020b_evidence_sources (
    advisor_id,source_reference,source_type,original_filename,mime_type,
    byte_size,document_digest,storage_reference,purpose,received_at,received_by
  ) values (
    user_a,conflict_source_reference,'UPLOAD','cartera020c-conflict.pdf','application/pdf',
    1024,repeat('b',64),'cartera020c/conflict/' || suffix,'POLICY_INTAKE_CONFLICT',
    t_identity,user_a
  ) returning id into conflict_source_id;
  insert into public.cartera020b_evidence_inbox_items (
    advisor_id,inbox_reference,source_id,status,document_type_candidate,
    classification_state,classification_confidence,worker_state,state_version
  ) values (
    user_a,'CARTERA020C_CONFLICT:INBOX:' || suffix,conflict_source_id,
    'confirmation_required','POLICY','MATCHED',0.98,'COMPLETED',5
  ) returning id into conflict_inbox_id;
  insert into public.cartera020b_extraction_candidates (
    advisor_id,candidate_reference,inbox_item_id,candidate_type,classification,
    extracted_fields,overall_confidence,extraction_source,parser_id,parser_version
  ) values (
    user_a,'CARTERA020C_CONFLICT:CANDIDATE:' || suffix,conflict_inbox_id,'POLICY',
    '{"documentType":"POLICY"}'::jsonb,'{}'::jsonb,0.98,'PDF_TEXT','REMOTE_ACCEPTANCE','1'
  ) returning id into conflict_candidate_id;
  insert into public.cartera020b_policy_evidence_packets (
    advisor_id,packet_reference,inbox_item_id,candidate_id,document_type,
    extracted_fields,extraction_confidence,confirmation_state,creates_truth
  ) values (
    user_a,conflict_packet_reference,conflict_inbox_id,conflict_candidate_id,
    'POLICY','{}'::jsonb,0.98,'PENDING_CONFIRMATION',false
  ) returning id into conflict_packet_id;

  conflict_batch := jsonb_build_object(
    'contractType','FORGE_CARTERA_020C_IDENTITY_COMMAND_BATCH',
    'contractVersion','CARTERA-020C.2',
    'reviewReference',conflict_review_reference,
    'packetReference',conflict_packet_reference,
    'advisorId',user_a::text,'actorReference',user_a::text,
    'commands',jsonb_build_array(jsonb_build_object(
      'candidateReference',conflict_candidate_reference,
      'outcome','CREATE_CONFIRMED',
      'expectedPersonReference',conflict_person_reference,
      'command',jsonb_build_object(
        'contractType','FORGE_IDENTITY_RESOLUTION_COMMAND','contractVersion','CARTERA-010B.1',
        'advisorId',user_a::text,'actorReference',user_a::text,
        'idempotencyKey','CARTERA020C_CONFLICT:IDENTITY_COMMAND:' || suffix,
        'decidedAt',t_identity,'outcome','CREATE_CONFIRMED',
        'sourceIdentity',jsonb_build_object(
          'sourceDomain','CARTERA_EVIDENCE','sourceIdentityType','POLICY_PACKET_IDENTITY_CANDIDATE',
          'sourceRecordReference',conflict_candidate_reference,'prospectReference',null
        ),
        'existingPersonReference',null,
        'newPerson',jsonb_build_object(
          'personReference',conflict_person_reference,'displayName','Conflict Person',
          'preferredName','Conflict','normalizedName','conflict person',
          'verifiedPhone',null,'verifiedEmail',null,'birthDate',null,
          'privacyClassification','PRIVATE'
        ),
        'candidatePersonReferences','[]'::jsonb,
        'evidenceReferences',jsonb_build_array(conflict_source_reference),
        'reasonCode','ADVISOR_CONFIRMED_NEW_PERSON','commandDigest',repeat('d',64)
      )
    )),
    'accountDecisions','[]'::jsonb,
    'invocationOrder',jsonb_build_array('IDENTITY_RESOLUTION'),
    'createsTruth',false,'invokesRemoteCommand',false,'requiresExplicitExecution',true
  );
  conflict_request := jsonb_build_object(
    'contractType','FORGE_CARTERA_020C_IDENTITY_EXECUTION_REQUEST','contractVersion','CARTERA-020C.3',
    'advisorId',user_a::text,'actorReference',user_a::text,
    'reviewReference',conflict_review_reference,'packetReference',conflict_packet_reference,
    'idempotencyKey','CARTERA020C_CONFLICT:PREPARE:' || suffix,'requestedAt',t_identity,
    'authorization',jsonb_build_object(
      'contractType','FORGE_CARTERA_020C_EXECUTION_AUTHORIZATION','contractVersion','CARTERA-020C.3',
      'scope','IDENTITY_RESOLUTION','reviewReference',conflict_review_reference,
      'advisorId',user_a::text,'actorReference',user_a::text,'authorizedAt',t_identity,
      'confirmation','CONFIRM_IDENTITY_RESOLUTION',
      'payloadDigest',public.forge_cartera020c_authorization_digest(conflict_batch)
    ),
    'identityBatch',conflict_batch
  );
  perform set_config('request.jwt.claim.sub', user_a::text, true);
  perform set_config('request.jwt.claim.role', 'authenticated', true);
  execute 'set local role authenticated';
  perform public.forge_cartera020c_prepare_identity_orchestration(conflict_request);
  execute 'reset role';

  changed_batch := jsonb_set(
    conflict_batch,'{commands,0,command,newPerson,preferredName}','"Changed"'::jsonb
  );
  changed_request := jsonb_set(conflict_request,'{identityBatch}',changed_batch);
  changed_request := jsonb_set(
    changed_request,'{authorization,payloadDigest}',
    to_jsonb(public.forge_cartera020c_authorization_digest(changed_batch))
  );
  perform set_config('request.jwt.claim.sub', user_a::text, true);
  perform set_config('request.jwt.claim.role', 'authenticated', true);
  execute 'set local role authenticated';
  conflict_status := public.forge_cartera020c_prepare_identity_orchestration(changed_request);
  if conflict_status ->> 'state' <> 'BLOCKED'
     or conflict_status ->> 'conflictType' <> 'CHANGED_INPUT_REPLAY' then
    raise exception 'CARTERA020C_CHANGED_INPUT_REPLAY_NOT_BLOCKED';
  end if;
  execute 'reset role';
execute 'grant select on public.cartera020c_confirmation_conflicts to authenticated';
perform set_config('request.jwt.claim.sub', user_a::text, true);
perform set_config('request.jwt.claim.role', 'authenticated', true);
execute 'set local role authenticated';
select count(*) into row_count
from public.cartera020c_confirmation_conflicts
where advisor_id = user_a
  and review_reference = conflict_review_reference
  and conflict_type = 'CHANGED_INPUT_REPLAY'
  and conflict_reference = conflict_status ->> 'conflictReference';
execute 'reset role';
execute 'revoke select on public.cartera020c_confirmation_conflicts from authenticated';
if row_count <> 1 then
  raise exception 'CARTERA020C_CHANGED_INPUT_CONFLICT_NOT_PERSISTED:COUNT:%', row_count;
end if;

  -- Retry release is explicit, optimistic and cannot run early.
  insert into public.cartera020b_evidence_sources (
    advisor_id,source_reference,source_type,original_filename,mime_type,
    byte_size,document_digest,storage_reference,purpose,received_at,received_by
  ) values (
    user_a,retry_source_reference,'UPLOAD','cartera020c-retry.pdf','application/pdf',
    1024,repeat('c',64),'cartera020c/retry/' || suffix,'POLICY_INTAKE_RETRY',
    t_identity,user_a
  ) returning id into retry_source_id;
  insert into public.cartera020b_evidence_inbox_items (
    advisor_id,inbox_reference,source_id,status,document_type_candidate,
    classification_state,classification_confidence,worker_state,state_version
  ) values (
    user_a,'CARTERA020C_RETRY:INBOX:' || suffix,retry_source_id,
    'confirmation_required','POLICY','MATCHED',0.97,'COMPLETED',5
  ) returning id into retry_inbox_id;
  insert into public.cartera020b_extraction_candidates (
    advisor_id,candidate_reference,inbox_item_id,candidate_type,classification,
    extracted_fields,overall_confidence,extraction_source,parser_id,parser_version
  ) values (
    user_a,'CARTERA020C_RETRY:CANDIDATE:' || suffix,retry_inbox_id,'POLICY',
    '{"documentType":"POLICY"}'::jsonb,'{}'::jsonb,0.97,'PDF_TEXT','REMOTE_ACCEPTANCE','1'
  ) returning id into retry_candidate_id;
  insert into public.cartera020b_policy_evidence_packets (
    advisor_id,packet_reference,inbox_item_id,candidate_id,document_type,
    extracted_fields,extraction_confidence,confirmation_state,creates_truth
  ) values (
    user_a,retry_packet_reference,retry_inbox_id,retry_candidate_id,
    'POLICY','{}'::jsonb,0.97,'PENDING_CONFIRMATION',false
  ) returning id into retry_packet_id;

  retry_batch := jsonb_build_object(
    'contractType','FORGE_CARTERA_020C_IDENTITY_COMMAND_BATCH','contractVersion','CARTERA-020C.2',
    'reviewReference',retry_review_reference,'packetReference',retry_packet_reference,
    'advisorId',user_a::text,'actorReference',user_a::text,
    'commands',jsonb_build_array(jsonb_build_object(
      'candidateReference',retry_candidate_reference,'outcome','CREATE_CONFIRMED',
      'expectedPersonReference',retry_person_reference,
      'command',jsonb_build_object(
        'contractType','FORGE_IDENTITY_RESOLUTION_COMMAND','contractVersion','CARTERA-010B.1',
        'advisorId',user_a::text,'actorReference',user_a::text,
        'idempotencyKey','CARTERA020C_RETRY:IDENTITY_COMMAND:' || suffix,
        'decidedAt',t_identity,'outcome','CREATE_CONFIRMED',
        'sourceIdentity',jsonb_build_object(
          'sourceDomain','CARTERA_EVIDENCE','sourceIdentityType','POLICY_PACKET_IDENTITY_CANDIDATE',
          'sourceRecordReference',retry_candidate_reference,'prospectReference',null
        ),
        'existingPersonReference',null,
        'newPerson',jsonb_build_object(
          'personReference',retry_person_reference,'displayName','Retry Person',
          'preferredName','Retry','normalizedName','retry person',
          'verifiedPhone',null,'verifiedEmail',null,'birthDate',null,
          'privacyClassification','PRIVATE'
        ),
        'candidatePersonReferences','[]'::jsonb,
        'evidenceReferences',jsonb_build_array(retry_source_reference),
        'reasonCode','ADVISOR_CONFIRMED_NEW_PERSON','commandDigest',repeat('c',64)
      )
    )),
    'accountDecisions','[]'::jsonb,'invocationOrder',jsonb_build_array('IDENTITY_RESOLUTION'),
    'createsTruth',false,'invokesRemoteCommand',false,'requiresExplicitExecution',true
  );
  retry_request := jsonb_build_object(
    'contractType','FORGE_CARTERA_020C_IDENTITY_EXECUTION_REQUEST','contractVersion','CARTERA-020C.3',
    'advisorId',user_a::text,'actorReference',user_a::text,
    'reviewReference',retry_review_reference,'packetReference',retry_packet_reference,
    'idempotencyKey','CARTERA020C_RETRY:PREPARE:' || suffix,'requestedAt',t_identity,
    'authorization',jsonb_build_object(
      'contractType','FORGE_CARTERA_020C_EXECUTION_AUTHORIZATION','contractVersion','CARTERA-020C.3',
      'scope','IDENTITY_RESOLUTION','reviewReference',retry_review_reference,
      'advisorId',user_a::text,'actorReference',user_a::text,'authorizedAt',t_identity,
      'confirmation','CONFIRM_IDENTITY_RESOLUTION',
      'payloadDigest',public.forge_cartera020c_authorization_digest(retry_batch)
    ),
    'identityBatch',retry_batch
  );
  perform set_config('request.jwt.claim.sub', user_a::text, true);
  perform set_config('request.jwt.claim.role', 'authenticated', true);
  execute 'set local role authenticated';
  retry_status := public.forge_cartera020c_prepare_identity_orchestration(retry_request);
  execute 'reset role';

  perform set_config('forge.cartera020c_command','on',true);
  update public.cartera020c_confirmation_commands c
  set status='EXECUTING',attempt_count=1,updated_at=clock_timestamp()
  from public.cartera020c_confirmation_reviews r
  where c.review_id=r.id and c.advisor_id=user_a
    and r.review_reference=retry_review_reference and c.sequence_number=1;
  update public.cartera020c_confirmation_reviews
  set state='IDENTITY_EXECUTING',state_version=2,active_sequence=1,updated_at=clock_timestamp()
  where advisor_id=user_a and review_reference=retry_review_reference;
  update public.cartera020c_confirmation_commands c
  set status='RETRY_WAIT',next_retry_at=clock_timestamp()+interval '5 minutes',
      last_error_code='REMOTE_TRANSIENT_TEST',updated_at=clock_timestamp()
  from public.cartera020c_confirmation_reviews r
  where c.review_id=r.id and c.advisor_id=user_a
    and r.review_reference=retry_review_reference and c.sequence_number=1;
  update public.cartera020c_confirmation_reviews
  set state='RETRY_WAIT',state_version=3,next_retry_at=clock_timestamp()+interval '5 minutes',
      last_error_code='REMOTE_TRANSIENT_TEST',retry_count=1,updated_at=clock_timestamp()
  where advisor_id=user_a and review_reference=retry_review_reference;

  perform set_config('request.jwt.claim.sub', user_a::text, true);
  perform set_config('request.jwt.claim.role', 'authenticated', true);
  execute 'set local role authenticated';
  begin
    perform public.forge_cartera020c_retry_confirmation(
      retry_review_reference,3,clock_timestamp()
    );
    raise exception 'CARTERA020C_EARLY_RETRY_ALLOWED';
  exception when others then
    if position('CARTERA020C_RETRY_NOT_DUE' in sqlerrm)=0 then raise; end if;
  end;
  execute 'reset role';

  perform set_config('forge.cartera020c_command','on',true);
  update public.cartera020c_confirmation_commands c
  set next_retry_at=clock_timestamp()-interval '1 second',updated_at=clock_timestamp()
  from public.cartera020c_confirmation_reviews r
  where c.review_id=r.id and c.advisor_id=user_a
    and r.review_reference=retry_review_reference and c.sequence_number=1;
  update public.cartera020c_confirmation_reviews
  set next_retry_at=clock_timestamp()-interval '1 second',updated_at=clock_timestamp()
  where advisor_id=user_a and review_reference=retry_review_reference;

  perform set_config('request.jwt.claim.sub', user_a::text, true);
  perform set_config('request.jwt.claim.role', 'authenticated', true);
  execute 'set local role authenticated';
  retry_status := public.forge_cartera020c_retry_confirmation(
    retry_review_reference,3,clock_timestamp()
  );
  if retry_status ->> 'state' <> 'IDENTITY_READY'
     or (retry_status ->> 'stateVersion')::integer <> 4 then
    raise exception 'CARTERA020C_DUE_RETRY_RELEASE_INVALID';
  end if;
  execute 'reset role';
end;
$cartera020c$;

rollback;
