begin;

do $cartera020b$
#variable_conflict use_variable
declare
  user_a uuid := gen_random_uuid();
  user_b uuid := gen_random_uuid();
  suffix text := replace(gen_random_uuid()::text, '-', '');
  digest_a text := encode(extensions.digest('cartera020b-a-' || suffix, 'sha256'), 'hex');
  digest_b text := encode(extensions.digest('cartera020b-b-' || suffix, 'sha256'), 'hex');
  digest_c text := encode(extensions.digest('cartera020b-c-' || suffix, 'sha256'), 'hex');
  text_digest text := encode(extensions.digest('opaque extracted text ' || suffix, 'sha256'), 'hex');
  source_a text := 'CARTERA020B_ACCEPTANCE:SOURCE:A:' || suffix;
  inbox_a text := 'CARTERA020B_ACCEPTANCE:INBOX:A:' || suffix;
  source_b text := 'CARTERA020B_ACCEPTANCE:SOURCE:B:' || suffix;
  inbox_b text := 'CARTERA020B_ACCEPTANCE:INBOX:B:' || suffix;
  source_c text := 'CARTERA020B_ACCEPTANCE:SOURCE:C:' || suffix;
  inbox_c text := 'CARTERA020B_ACCEPTANCE:INBOX:C:' || suffix;
  admission_key text := 'CARTERA020B_ACCEPTANCE:ADMIT:A:' || suffix;
  attempt_reference text := 'CARTERA020B_ACCEPTANCE:ATTEMPT:' || suffix;
  candidate_reference text := 'CARTERA020B_ACCEPTANCE:CANDIDATE:' || suffix;
  packet_reference text := 'CARTERA020B_ACCEPTANCE:PACKET:' || suffix;
  admission jsonb;
  response jsonb;
  replay jsonb;
  changed jsonb;
  claim jsonb;
  claim_replay jsonb;
  result_command jsonb;
  attempt jsonb;
  candidate jsonb;
  packet jsonb;
  extracted_fields jsonb;
  lease_token uuid;
  state_version integer;
  row_count bigint;
  direct_write_blocked boolean := false;
  anonymous_read_blocked boolean := false;
  owner_mismatch_blocked boolean := false;
  changed_packet_blocked boolean := false;
  expired_reclaim_count bigint;
  retry_due_count bigint;
begin
  insert into auth.users (
    instance_id,id,aud,role,email,encrypted_password,email_confirmed_at,
    raw_app_meta_data,raw_user_meta_data,created_at,updated_at
  ) values
  (
    '00000000-0000-0000-0000-000000000000',user_a,
    'authenticated','authenticated','cartera020b-a-' || suffix || '@forge.invalid','',now(),
    '{"provider":"email","providers":["email"]}'::jsonb,'{}'::jsonb,now(),now()
  ),
  (
    '00000000-0000-0000-0000-000000000000',user_b,
    'authenticated','authenticated','cartera020b-b-' || suffix || '@forge.invalid','',now(),
    '{"provider":"email","providers":["email"]}'::jsonb,'{}'::jsonb,now(),now()
  );

  admission := jsonb_build_object(
    'contractType','FORGE_EVIDENCE_ADMISSION_COMMAND',
    'contractVersion','CARTERA-020B.1',
    'advisorId',user_a::text,
    'actorReference',user_a::text,
    'sourceReference',source_a,
    'inboxReference',inbox_a,
    'organizationReference',null,
    'sourceType','UPLOAD',
    'originalFilename','cartera020b-acceptance.pdf',
    'mimeType','application/pdf',
    'byteSize',4096,
    'documentDigest',digest_a,
    'storageReference','acceptance/storage/' || suffix || '/a',
    'purpose','POLICY_INTAKE',
    'receivedAt',clock_timestamp() - interval '4 minutes',
    'idempotencyKey',admission_key,
    'commandDigest',repeat('f',64)
  );

  perform set_config('request.jwt.claim.sub', user_a::text, true);
  perform set_config('request.jwt.claim.role', 'authenticated', true);
  execute 'set local role authenticated';

  response := public.forge_cartera020b_admit_evidence(admission);
  if response ->> 'status' <> 'ADMITTED'
     or response ->> 'inboxReference' <> inbox_a
     or response ->> 'documentDigest' <> digest_a
     or coalesce((response ->> 'replayed')::boolean, true)
     or coalesce((response ->> 'createsPolicy')::boolean, true) then
    raise exception 'CARTERA020B_ADMISSION_INVALID';
  end if;

  replay := public.forge_cartera020b_admit_evidence(
    jsonb_set(admission, '{commandDigest}', to_jsonb(repeat('0',64)))
  );
  if not coalesce((replay ->> 'replayed')::boolean, false)
     or replay ->> 'inboxReference' <> inbox_a
     or replay ->> 'serverCommandDigest' <> response ->> 'serverCommandDigest' then
    raise exception 'CARTERA020B_ADMISSION_REPLAY_INVALID';
  end if;

  changed := public.forge_cartera020b_admit_evidence(
    jsonb_set(admission, '{originalFilename}', '"changed.pdf"'::jsonb)
  );
  if changed ->> 'status' <> 'CONFLICT'
     or changed ->> 'conflictType' <> 'CHANGED_INPUT_REPLAY' then
    raise exception 'CARTERA020B_ADMISSION_CHANGED_REPLAY_NOT_CONFLICT';
  end if;

  select count(*) into row_count
  from public.cartera020b_command_conflicts
  where advisor_id = user_a
    and command_type = 'ADMIT_EVIDENCE'
    and idempotency_key = admission_key
    and reason_code = 'CHANGED_INPUT_REPLAY';
  if row_count <> 1 then
    raise exception 'CARTERA020B_ADMISSION_CONFLICT_NOT_PERSISTED';
  end if;

  begin
    insert into public.cartera020b_evidence_sources (
      advisor_id,source_reference,source_type,original_filename,mime_type,
      byte_size,document_digest,storage_reference,purpose,received_at,received_by
    ) values (
      user_a,'CARTERA020B_ACCEPTANCE:DIRECT:' || suffix,'UPLOAD','blocked.pdf',
      'application/pdf',1,repeat('a',64),'acceptance/direct/' || suffix,
      'POLICY_INTAKE',clock_timestamp(),user_a
    );
  exception when insufficient_privilege then
    direct_write_blocked := true;
  end;
  if not direct_write_blocked then
    raise exception 'CARTERA020B_DIRECT_WRITE_NOT_BLOCKED';
  end if;

  claim := public.forge_cartera020b_claim_evidence('worker/acceptance/a', 300);
  if claim ->> 'status' <> 'CLAIMED'
     or claim ->> 'inboxReference' <> inbox_a
     or coalesce((claim ->> 'replayed')::boolean, true) then
    raise exception 'CARTERA020B_INITIAL_CLAIM_INVALID';
  end if;
  lease_token := (claim ->> 'leaseToken')::uuid;
  state_version := (claim ->> 'stateVersion')::integer;

  claim_replay := public.forge_cartera020b_claim_evidence('worker/acceptance/a', 300);
  if not coalesce((claim_replay ->> 'replayed')::boolean, false)
     or claim_replay ->> 'inboxReference' <> inbox_a
     or claim_replay ->> 'leaseToken' <> lease_token::text then
    raise exception 'CARTERA020B_ACTIVE_CLAIM_REPLAY_INVALID';
  end if;

  response := public.forge_cartera020b_claim_evidence('worker/acceptance/other', 300);
  if response ->> 'status' <> 'NO_AVAILABLE_ITEM' then
    raise exception 'CARTERA020B_ACTIVE_LEASE_NOT_EXCLUSIVE';
  end if;

  result_command := jsonb_build_object(
    'contractType','FORGE_EVIDENCE_PROCESSING_RESULT_COMMAND',
    'contractVersion','CARTERA-020B.1',
    'advisorId',user_a::text,
    'actorReference',user_a::text,
    'inboxReference',inbox_a,
    'workerId','worker/acceptance/a',
    'leaseToken',lease_token::text,
    'expectedStateVersion',state_version,
    'idempotencyKey','CARTERA020B_ACCEPTANCE:RESULT:CLASSIFIED:' || suffix,
    'completedAt',clock_timestamp() - interval '3 minutes',
    'result',jsonb_build_object(
      'evidenceStatus','classified',
      'workerState','AVAILABLE',
      'documentTypeCandidate','POLICY',
      'classificationState','MATCHED',
      'classificationConfidence',0.99,
      'warnings','[]'::jsonb,
      'attempt',null,
      'candidate',null,
      'packet',null
    ),
    'commandDigest',repeat('e',64)
  );

  response := public.forge_cartera020b_record_processing_result(result_command);
  if response ->> 'status' <> 'RECORDED'
     or response ->> 'evidenceStatus' <> 'classified'
     or response ->> 'workerState' <> 'AVAILABLE'
     or coalesce((response ->> 'replayed')::boolean, true) then
    raise exception 'CARTERA020B_CLASSIFICATION_RESULT_INVALID';
  end if;

  replay := public.forge_cartera020b_record_processing_result(
    jsonb_set(result_command, '{commandDigest}', to_jsonb(repeat('1',64)))
  );
  if not coalesce((replay ->> 'replayed')::boolean, false)
     or replay ->> 'stateVersion' <> response ->> 'stateVersion' then
    raise exception 'CARTERA020B_RESULT_REPLAY_INVALID';
  end if;

  changed := public.forge_cartera020b_record_processing_result(
    jsonb_set(result_command, '{result,classificationConfidence}', '0.95'::jsonb)
  );
  if changed ->> 'status' <> 'CONFLICT'
     or changed ->> 'conflictType' <> 'CHANGED_INPUT_REPLAY' then
    raise exception 'CARTERA020B_RESULT_CHANGED_REPLAY_NOT_CONFLICT';
  end if;

  claim := public.forge_cartera020b_claim_evidence('worker/acceptance/a', 300);
  lease_token := (claim ->> 'leaseToken')::uuid;
  state_version := (claim ->> 'stateVersion')::integer;

  extracted_fields := jsonb_build_object(
    'policyNumber',jsonb_build_object(
      'state','EXTRACTED',
      'normalizedValue','REMOTE-' || upper(substr(suffix,1,16)),
      'confidence',0.99,
      'sourceLocation',jsonb_build_object('page',1,'label','Poliza'),
      'extractionMethod','PDFTOTEXT',
      'parserId','acceptance.policy',
      'parserVersion','1.0.0'
    ),
    'premium',jsonb_build_object(
      'state','UNKNOWN',
      'normalizedValue',null,
      'confidence',null,
      'sourceLocation',null,
      'extractionMethod','PDFTOTEXT',
      'parserId','acceptance.policy',
      'parserVersion','1.0.0'
    )
  );

  attempt := jsonb_build_object(
    'attemptReference',attempt_reference,
    'provider','LOCAL_PDFTOTEXT',
    'providerVersion','1.0.0',
    'method','PDFTOTEXT',
    'status','COMPLETE',
    'sourceDigest',digest_a,
    'pageCount',2,
    'textAvailable',true,
    'textDigest',text_digest,
    'outputReference','acceptance/output/' || suffix,
    'warnings','[]'::jsonb,
    'errors','[]'::jsonb,
    'startedAt',clock_timestamp() - interval '150 seconds',
    'completedAt',clock_timestamp() - interval '140 seconds',
    'createsTruth',false
  );

  candidate := jsonb_build_object(
    'candidateReference',candidate_reference,
    'attemptReference',attempt_reference,
    'candidateType','POLICY',
    'classification',jsonb_build_object(
      'documentType','POLICY','state','MATCHED','confidence',0.99
    ),
    'extractedFields',extracted_fields,
    'overallConfidence',0.99,
    'extractionSource','LOCAL_PDFTOTEXT',
    'parserId','acceptance.policy',
    'parserVersion','1.0.0',
    'warnings','[]'::jsonb,
    'missingFields',jsonb_build_array('premium','currency'),
    'createsTruth',false
  );

  result_command := jsonb_build_object(
    'contractType','FORGE_EVIDENCE_PROCESSING_RESULT_COMMAND',
    'contractVersion','CARTERA-020B.1',
    'advisorId',user_a::text,
    'actorReference',user_a::text,
    'inboxReference',inbox_a,
    'workerId','worker/acceptance/a',
    'leaseToken',lease_token::text,
    'expectedStateVersion',state_version,
    'idempotencyKey','CARTERA020B_ACCEPTANCE:RESULT:CANDIDATE:' || suffix,
    'completedAt',clock_timestamp() - interval '2 minutes',
    'result',jsonb_build_object(
      'evidenceStatus','extraction_candidate_created',
      'workerState','AVAILABLE',
      'documentTypeCandidate','POLICY',
      'classificationState','MATCHED',
      'classificationConfidence',0.99,
      'warnings','[]'::jsonb,
      'attempt',attempt,
      'candidate',candidate,
      'packet',null
    ),
    'commandDigest',repeat('d',64)
  );

  response := public.forge_cartera020b_record_processing_result(result_command);
  if response ->> 'evidenceStatus' <> 'extraction_candidate_created'
     or response ->> 'candidateReference' <> candidate_reference
     or response ->> 'attemptReference' <> attempt_reference then
    raise exception 'CARTERA020B_CANDIDATE_RESULT_INVALID';
  end if;

  select count(*) into row_count
  from public.cartera020b_extraction_candidates
  where advisor_id = user_a and candidate_reference = candidate_reference;
  if row_count <> 1 then raise exception 'CARTERA020B_CANDIDATE_NOT_PERSISTED_ONCE'; end if;

  claim := public.forge_cartera020b_claim_evidence('worker/acceptance/a', 300);
  lease_token := (claim ->> 'leaseToken')::uuid;
  state_version := (claim ->> 'stateVersion')::integer;

  packet := jsonb_build_object(
    'packetReference',packet_reference,
    'candidateReference',candidate_reference,
    'documentType','POLICY',
    'extractedFields',extracted_fields,
    'extractionConfidence',0.99,
    'warnings','[]'::jsonb,
    'identityCandidates',jsonb_build_array(
      jsonb_build_object('candidateReference','identity-candidate/' || suffix,'state','UNRESOLVED')
    ),
    'policyRoleCandidates',jsonb_build_array(
      jsonb_build_object('roleType','OWNER','participantState','UNRESOLVED')
    ),
    'existingPolicyCandidates','[]'::jsonb,
    'confirmationState','PENDING_CONFIRMATION',
    'createsTruth',false
  );

  result_command := jsonb_build_object(
    'contractType','FORGE_EVIDENCE_PROCESSING_RESULT_COMMAND',
    'contractVersion','CARTERA-020B.1',
    'advisorId',user_a::text,
    'actorReference',user_a::text,
    'inboxReference',inbox_a,
    'workerId','worker/acceptance/a',
    'leaseToken',lease_token::text,
    'expectedStateVersion',state_version,
    'idempotencyKey','CARTERA020B_ACCEPTANCE:RESULT:PACKET:' || suffix,
    'completedAt',clock_timestamp() - interval '90 seconds',
    'result',jsonb_build_object(
      'evidenceStatus','packet_created',
      'workerState','AVAILABLE',
      'documentTypeCandidate','POLICY',
      'classificationState','MATCHED',
      'classificationConfidence',0.99,
      'warnings','[]'::jsonb,
      'attempt',null,
      'candidate',null,
      'packet',packet
    ),
    'commandDigest',repeat('c',64)
  );

  response := public.forge_cartera020b_record_processing_result(result_command);
  if response ->> 'evidenceStatus' <> 'packet_created'
     or response ->> 'packetReference' <> packet_reference
     or response ->> 'confirmationState' <> 'PENDING_CONFIRMATION' then
    raise exception 'CARTERA020B_PACKET_RESULT_INVALID';
  end if;

  select count(*) into row_count
  from public.cartera020b_policy_evidence_packets
  where advisor_id = user_a and packet_reference = packet_reference;
  if row_count <> 1 then raise exception 'CARTERA020B_PACKET_NOT_PERSISTED_ONCE'; end if;

  claim := public.forge_cartera020b_claim_evidence('worker/acceptance/a', 300);
  lease_token := (claim ->> 'leaseToken')::uuid;
  state_version := (claim ->> 'stateVersion')::integer;

  result_command := jsonb_build_object(
    'contractType','FORGE_EVIDENCE_PROCESSING_RESULT_COMMAND',
    'contractVersion','CARTERA-020B.1',
    'advisorId',user_a::text,
    'actorReference',user_a::text,
    'inboxReference',inbox_a,
    'workerId','worker/acceptance/a',
    'leaseToken',lease_token::text,
    'expectedStateVersion',state_version,
    'idempotencyKey','CARTERA020B_ACCEPTANCE:RESULT:CONFIRMATION:' || suffix,
    'completedAt',clock_timestamp() - interval '1 minute',
    'result',jsonb_build_object(
      'evidenceStatus','confirmation_required',
      'workerState','COMPLETED',
      'documentTypeCandidate','POLICY',
      'classificationState','MATCHED',
      'classificationConfidence',0.99,
      'warnings','[]'::jsonb,
      'attempt',null,
      'candidate',null,
      'packet',packet
    ),
    'commandDigest',repeat('b',64)
  );

  begin
    perform public.forge_cartera020b_record_processing_result(
      jsonb_set(
        jsonb_set(result_command, '{idempotencyKey}', to_jsonb('CARTERA020B_ACCEPTANCE:RESULT:CHANGED_PACKET:' || suffix)),
        '{result,packet,extractedFields,policyNumber,normalizedValue}',
        '"DIFFERENT"'::jsonb
      )
    );
  exception when others then
    if position('CARTERA020B_PACKET_CHANGED_REPLAY' in sqlerrm) > 0 then
      changed_packet_blocked := true;
    else
      raise;
    end if;
  end;
  if not changed_packet_blocked then
    raise exception 'CARTERA020B_CHANGED_PACKET_REPLAY_NOT_BLOCKED';
  end if;

  response := public.forge_cartera020b_record_processing_result(result_command);
  if response ->> 'evidenceStatus' <> 'confirmation_required'
     or response ->> 'workerState' <> 'COMPLETED'
     or response ->> 'packetReference' <> packet_reference then
    raise exception 'CARTERA020B_CONFIRMATION_REQUIRED_INVALID';
  end if;

  select count(*) into row_count
  from public.cartera020b_policy_evidence_packets
  where advisor_id = user_a and packet_reference = packet_reference;
  if row_count <> 1 then raise exception 'CARTERA020B_IDENTICAL_PACKET_REPLAY_DUPLICATED'; end if;

  select count(*) into row_count
  from public.cartera020b_evidence_inbox_items
  where advisor_id = user_a and inbox_reference = inbox_a
    and status = 'confirmation_required' and worker_state = 'COMPLETED'
    and lease_owner is null and lease_token is null and lease_expires_at is null;
  if row_count <> 1 then raise exception 'CARTERA020B_FINAL_INBOX_STATE_INVALID'; end if;

  response := public.forge_cartera020b_claim_evidence('worker/acceptance/a', 300);
  if response ->> 'status' <> 'NO_AVAILABLE_ITEM' then
    raise exception 'CARTERA020B_COMPLETED_ITEM_RECLAIMED';
  end if;

  -- Second document: prove expired lease recovery.
  admission := jsonb_set(admission, '{sourceReference}', to_jsonb(source_b));
  admission := jsonb_set(admission, '{inboxReference}', to_jsonb(inbox_b));
  admission := jsonb_set(admission, '{documentDigest}', to_jsonb(digest_b));
  admission := jsonb_set(admission, '{storageReference}', to_jsonb('acceptance/storage/' || suffix || '/b'));
  admission := jsonb_set(admission, '{idempotencyKey}', to_jsonb('CARTERA020B_ACCEPTANCE:ADMIT:B:' || suffix));
  perform public.forge_cartera020b_admit_evidence(admission);
  claim := public.forge_cartera020b_claim_evidence('worker/expired/original', 300);

  execute 'reset role';
  perform set_config('forge.cartera020b_command', 'on', true);
  update public.cartera020b_evidence_inbox_items
  set lease_expires_at = clock_timestamp() - interval '1 second'
  where advisor_id = user_a and inbox_reference = inbox_b;

  perform set_config('request.jwt.claim.sub', user_a::text, true);
  perform set_config('request.jwt.claim.role', 'authenticated', true);
  execute 'set local role authenticated';
  claim := public.forge_cartera020b_claim_evidence('worker/expired/recovery', 300);
  if claim ->> 'status' <> 'CLAIMED'
     or claim ->> 'inboxReference' <> inbox_b
     or coalesce((claim ->> 'replayed')::boolean, true) then
    raise exception 'CARTERA020B_EXPIRED_LEASE_NOT_RECOVERED';
  end if;
  select count(*) into expired_reclaim_count
  from public.cartera020b_evidence_transitions t
  join public.cartera020b_evidence_inbox_items i on i.id = t.inbox_item_id
  where t.advisor_id = user_a and i.inbox_reference = inbox_b
    and t.reason_code = 'EXPIRED_LEASE_RECLAIMED';
  if expired_reclaim_count <> 1 then raise exception 'CARTERA020B_EXPIRED_RECLAIM_TRANSITION_MISSING'; end if;

  -- Third document: prove retry scheduling and due-item reclaim.
  admission := jsonb_set(admission, '{sourceReference}', to_jsonb(source_c));
  admission := jsonb_set(admission, '{inboxReference}', to_jsonb(inbox_c));
  admission := jsonb_set(admission, '{documentDigest}', to_jsonb(digest_c));
  admission := jsonb_set(admission, '{storageReference}', to_jsonb('acceptance/storage/' || suffix || '/c'));
  admission := jsonb_set(admission, '{idempotencyKey}', to_jsonb('CARTERA020B_ACCEPTANCE:ADMIT:C:' || suffix));
  perform public.forge_cartera020b_admit_evidence(admission);

  -- Finish the expired-lease item so the retry document becomes claimable.
  lease_token := (claim ->> 'leaseToken')::uuid;
  state_version := (claim ->> 'stateVersion')::integer;
  result_command := jsonb_build_object(
    'contractType','FORGE_EVIDENCE_PROCESSING_RESULT_COMMAND',
    'contractVersion','CARTERA-020B.1',
    'advisorId',user_a::text,'actorReference',user_a::text,
    'inboxReference',inbox_b,'workerId','worker/expired/recovery',
    'leaseToken',lease_token::text,'expectedStateVersion',state_version,
    'idempotencyKey','CARTERA020B_ACCEPTANCE:RESULT:BLOCK:B:' || suffix,
    'completedAt',clock_timestamp() - interval '40 seconds',
    'result',jsonb_build_object(
      'evidenceStatus','blocked','workerState','BLOCKED',
      'documentTypeCandidate','UNKNOWN','classificationState','REVIEW_REQUIRED',
      'classificationConfidence',null,'blockedReason','Acceptance fixture closed',
      'lastErrorCode','ACCEPTANCE_BLOCKED','warnings','[]'::jsonb,
      'attempt',null,'candidate',null,'packet',null
    ),
    'commandDigest',repeat('a',64)
  );
  perform public.forge_cartera020b_record_processing_result(result_command);

  claim := public.forge_cartera020b_claim_evidence('worker/retry/original', 300);
  lease_token := (claim ->> 'leaseToken')::uuid;
  state_version := (claim ->> 'stateVersion')::integer;
  result_command := jsonb_build_object(
    'contractType','FORGE_EVIDENCE_PROCESSING_RESULT_COMMAND',
    'contractVersion','CARTERA-020B.1',
    'advisorId',user_a::text,'actorReference',user_a::text,
    'inboxReference',inbox_c,'workerId','worker/retry/original',
    'leaseToken',lease_token::text,'expectedStateVersion',state_version,
    'idempotencyKey','CARTERA020B_ACCEPTANCE:RESULT:RETRY:C:' || suffix,
    'completedAt',clock_timestamp() - interval '30 seconds',
    'result',jsonb_build_object(
      'evidenceStatus','received','workerState','RETRY_WAIT',
      'documentTypeCandidate','UNKNOWN','classificationState','UNKNOWN',
      'classificationConfidence',null,'lastErrorCode','TEMPORARY_PROVIDER_FAILURE',
      'warnings',jsonb_build_array('temporary provider failure'),
      'attempt',null,'candidate',null,'packet',null
    ),
    'commandDigest',repeat('9',64)
  );
  response := public.forge_cartera020b_record_processing_result(result_command);
  if response ->> 'workerState' <> 'RETRY_WAIT'
     or (response ->> 'retryCount')::integer <> 1
     or response ->> 'nextRetryAt' is null then
    raise exception 'CARTERA020B_RETRY_SCHEDULE_INVALID';
  end if;

  execute 'reset role';
  perform set_config('forge.cartera020b_command', 'on', true);
  update public.cartera020b_evidence_inbox_items
  set next_retry_at = clock_timestamp() - interval '1 second'
  where advisor_id = user_a and inbox_reference = inbox_c;

  perform set_config('request.jwt.claim.sub', user_a::text, true);
  perform set_config('request.jwt.claim.role', 'authenticated', true);
  execute 'set local role authenticated';
  claim := public.forge_cartera020b_claim_evidence('worker/retry/recovery', 300);
  if claim ->> 'inboxReference' <> inbox_c then
    raise exception 'CARTERA020B_DUE_RETRY_NOT_RECLAIMED';
  end if;
  select count(*) into retry_due_count
  from public.cartera020b_evidence_inbox_items
  where advisor_id = user_a and inbox_reference = inbox_c
    and worker_state = 'CLAIMED' and retry_count = 1;
  if retry_due_count <> 1 then raise exception 'CARTERA020B_RETRY_COUNT_OR_CLAIM_INVALID'; end if;

  execute 'reset role';
  perform set_config('request.jwt.claim.sub', user_b::text, true);
  perform set_config('request.jwt.claim.role', 'authenticated', true);
  execute 'set local role authenticated';

  select count(*) into row_count
  from public.cartera020b_evidence_sources
  where advisor_id = user_a;
  if row_count <> 0 then raise exception 'CARTERA020B_CROSS_ADVISOR_SOURCE_READ'; end if;

  select count(*) into row_count
  from public.cartera020b_policy_evidence_packets
  where advisor_id = user_a;
  if row_count <> 0 then raise exception 'CARTERA020B_CROSS_ADVISOR_PACKET_READ'; end if;

  response := public.forge_cartera020b_claim_evidence('worker/advisor-b', 300);
  if response ->> 'status' <> 'NO_AVAILABLE_ITEM' then
    raise exception 'CARTERA020B_CROSS_ADVISOR_CLAIM';
  end if;

  begin
    perform public.forge_cartera020b_admit_evidence(admission);
  exception when others then
    if position('CARTERA020B_ADMISSION_OWNER_MISMATCH' in sqlerrm) > 0 then
      owner_mismatch_blocked := true;
    else
      raise;
    end if;
  end;
  if not owner_mismatch_blocked then raise exception 'CARTERA020B_OWNER_MISMATCH_NOT_BLOCKED'; end if;

  execute 'reset role';
  perform set_config('request.jwt.claim.sub', '', true);
  perform set_config('request.jwt.claim.role', 'anon', true);
  execute 'set local role anon';
  begin
    perform count(*) from public.cartera020b_evidence_sources;
  exception when insufficient_privilege then
    anonymous_read_blocked := true;
  end;
  if not anonymous_read_blocked then raise exception 'CARTERA020B_ANONYMOUS_READ_NOT_BLOCKED'; end if;

  execute 'reset role';

  select count(*) into row_count
  from public.canonical_policies
  where policy_reference like 'CARTERA020B_ACCEPTANCE:%';
  if row_count <> 0 then raise exception 'CARTERA020B_POLICY_TRUTH_CREATED'; end if;

  select count(*) into row_count
  from public.commercial_people
  where person_reference like 'CARTERA020B_ACCEPTANCE:%';
  if row_count <> 0 then raise exception 'CARTERA020B_PERSON_TRUTH_CREATED'; end if;

  select count(*) into row_count
  from public.policy_roles pr
  join public.canonical_policies p on p.id = pr.policy_id
  where p.policy_reference like 'CARTERA020B_ACCEPTANCE:%';
  if row_count <> 0 then raise exception 'CARTERA020B_POLICY_ROLE_TRUTH_CREATED'; end if;
end;
$cartera020b$;

rollback;
