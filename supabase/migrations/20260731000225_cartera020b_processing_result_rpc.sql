-- CARTERA 020B governed processing-result RPC.
-- Repository construction only. This migration is NOT remote deployment authorization.

begin;

create or replace function public.forge_cartera020b_record_processing_result(p_command jsonb)
returns jsonb
language plpgsql
security definer
set search_path = public, extensions, pg_temp
as $$
#variable_conflict use_variable
declare
  actor_id uuid := auth.uid();
  advisor_id uuid;
  command_digest text;
  idempotency_key text;
  completed_at timestamptz;
  inbox_reference text;
  worker_id text;
  claim_token uuid;
  expected_version integer;
  result jsonb;
  evidence_status text;
  target_worker_state text;
  document_type text;
  classification_state text;
  classification_confidence numeric;
  blocked_reason text;
  last_error_code text;
  result_warnings jsonb;
  attempt jsonb;
  candidate jsonb;
  packet jsonb;
  item public.cartera020b_evidence_inbox_items%rowtype;
  source_digest text;
  from_status text;
  from_worker_state text;
  next_retry_at timestamptz;
  attempt_id uuid;
  candidate_id uuid;
  attempt_reference text;
  candidate_reference text;
  packet_reference text;
  transition_reference text;
  reason_code text;
  replay jsonb;
  response jsonb;
begin
  if actor_id is null then raise exception 'CARTERA020B_AUTH_REQUIRED'; end if;
  if octet_length(coalesce(p_command::text, '')) > 1048576 then
    raise exception 'CARTERA020B_RESULT_COMMAND_TOO_LARGE';
  end if;
  if not public.forge_cartera020b_jsonb_keys_allowed(
    p_command,
    array[
      'contractType','contractVersion','advisorId','actorReference','inboxReference',
      'workerId','leaseToken','expectedStateVersion','idempotencyKey','completedAt',
      'result','commandDigest'
    ]
  )
  or p_command ->> 'contractType' <> 'FORGE_EVIDENCE_PROCESSING_RESULT_COMMAND'
  or p_command ->> 'contractVersion' <> 'CARTERA-020B.1' then
    raise exception 'CARTERA020B_RESULT_CONTRACT_INVALID';
  end if;

  begin
    advisor_id := (p_command ->> 'advisorId')::uuid;
    claim_token := (p_command ->> 'leaseToken')::uuid;
    expected_version := (p_command ->> 'expectedStateVersion')::integer;
    completed_at := (p_command ->> 'completedAt')::timestamptz;
  exception when others then
    raise exception 'CARTERA020B_RESULT_FIELDS_INVALID';
  end;

  if advisor_id <> actor_id or p_command ->> 'actorReference' <> actor_id::text then
    raise exception 'CARTERA020B_RESULT_OWNER_MISMATCH';
  end if;

  inbox_reference := nullif(btrim(p_command ->> 'inboxReference'), '');
  worker_id := nullif(btrim(p_command ->> 'workerId'), '');
  idempotency_key := nullif(btrim(p_command ->> 'idempotencyKey'), '');
  result := p_command -> 'result';

  if inbox_reference !~ '^[A-Za-z0-9][A-Za-z0-9._:@/-]{0,239}$'
     or worker_id !~ '^[A-Za-z0-9][A-Za-z0-9._:@/-]{0,239}$'
     or idempotency_key !~ '^[A-Za-z0-9][A-Za-z0-9._:@/-]{0,159}$'
     or expected_version < 1
     or completed_at is null or completed_at > now() + interval '5 minutes'
     or not public.forge_cartera020b_jsonb_keys_allowed(
       result,
       array[
         'evidenceStatus','workerState','documentTypeCandidate','classificationState',
         'classificationConfidence','blockedReason','lastErrorCode','warnings',
         'attempt','candidate','packet'
       ]
     )
     or public.forge_cartera020b_has_forbidden_payload_keys(result) then
    raise exception 'CARTERA020B_RESULT_COMMAND_INVALID';
  end if;

  evidence_status := result ->> 'evidenceStatus';
  target_worker_state := result ->> 'workerState';
  document_type := nullif(result ->> 'documentTypeCandidate', '');
  classification_state := nullif(result ->> 'classificationState', '');
  blocked_reason := nullif(btrim(result ->> 'blockedReason'), '');
  last_error_code := nullif(btrim(result ->> 'lastErrorCode'), '');
  result_warnings := coalesce(result -> 'warnings', '[]'::jsonb);
  attempt := result -> 'attempt';
  candidate := result -> 'candidate';
  packet := result -> 'packet';

  begin
    classification_confidence := case
      when result ? 'classificationConfidence' and result ->> 'classificationConfidence' is not null
      then (result ->> 'classificationConfidence')::numeric
      else null
    end;
  exception when others then
    raise exception 'CARTERA020B_CLASSIFICATION_CONFIDENCE_INVALID';
  end;

  if evidence_status not in ('received','classified','extraction_candidate_created','packet_created','confirmation_required','blocked')
     or target_worker_state not in ('AVAILABLE','RETRY_WAIT','COMPLETED','BLOCKED','FAILED_TERMINAL')
     or (document_type is not null and document_type not in ('POLICY','RECEIPT','ENDORSEMENT','UNKNOWN'))
     or (classification_state is not null and classification_state not in ('MATCHED','AMBIGUOUS','UNKNOWN','REVIEW_REQUIRED'))
     or (classification_confidence is not null and (classification_confidence < 0 or classification_confidence > 1))
     or not public.forge_cartera020b_string_array_valid(result_warnings, 0, 100)
     or (blocked_reason is not null and length(blocked_reason) > 500)
     or (last_error_code is not null and last_error_code !~ '^[A-Za-z0-9][A-Za-z0-9._:@/-]{0,119}$')
     or (target_worker_state = 'RETRY_WAIT' and last_error_code is null)
     or (target_worker_state in ('BLOCKED','FAILED_TERMINAL') and blocked_reason is null and last_error_code is null)
     or (target_worker_state = 'COMPLETED' and evidence_status <> 'confirmation_required')
     or (evidence_status = 'extraction_candidate_created' and candidate is null)
     or (evidence_status in ('packet_created','confirmation_required') and packet is null) then
    raise exception 'CARTERA020B_RESULT_STATE_INVALID';
  end if;

  command_digest := public.forge_cartera020b_command_digest(p_command);
  perform pg_advisory_xact_lock(hashtextextended(actor_id::text || '|RECORD_PROCESSING_RESULT|' || idempotency_key, 0));
  replay := public.forge_cartera020b_existing_receipt_response(
    actor_id, 'RECORD_PROCESSING_RESULT', idempotency_key, command_digest
  );
  if replay is not null then return replay; end if;

  select * into item
  from public.cartera020b_evidence_inbox_items i
  where i.advisor_id = actor_id and i.inbox_reference = inbox_reference
  for update;

  if item.id is null then raise exception 'CARTERA020B_INBOX_NOT_FOUND'; end if;
  if item.state_version <> expected_version then raise exception 'CARTERA020B_VERSION_CONFLICT'; end if;
  if item.worker_state <> 'CLAIMED'
     or item.lease_owner <> worker_id
     or item.lease_token <> claim_token then
    raise exception 'CARTERA020B_CLAIM_MISMATCH';
  end if;
  if item.lease_expires_at <= clock_timestamp() then raise exception 'CARTERA020B_LEASE_EXPIRED'; end if;
  if not public.cartera020b_transition_allowed(item.status, evidence_status) then
    raise exception 'CARTERA020B_STATUS_TRANSITION_INVALID';
  end if;

  select s.document_digest into source_digest
  from public.cartera020b_evidence_sources s
  where s.id = item.source_id and s.advisor_id = actor_id;

  if attempt is not null then
    if not public.forge_cartera020b_jsonb_keys_allowed(
      attempt,
      array[
        'attemptReference','provider','providerVersion','method','status','sourceDigest',
        'pageCount','textAvailable','textDigest','outputReference','warnings','errors',
        'startedAt','completedAt','createsTruth'
      ]
    ) or coalesce((attempt ->> 'createsTruth')::boolean, false) <> false then
      raise exception 'CARTERA020B_ATTEMPT_CONTRACT_INVALID';
    end if;
    attempt_reference := nullif(btrim(attempt ->> 'attemptReference'), '');
    if attempt_reference !~ '^[A-Za-z0-9][A-Za-z0-9._:@/-]{0,239}$'
       or attempt ->> 'provider' !~ '^[A-Za-z0-9][A-Za-z0-9._:@/-]{0,119}$'
       or attempt ->> 'providerVersion' !~ '^[A-Za-z0-9][A-Za-z0-9._:@/-]{0,119}$'
       or attempt ->> 'method' !~ '^[A-Za-z0-9][A-Za-z0-9._:@/-]{0,119}$'
       or attempt ->> 'status' not in ('COMPLETE','EMPTY','FAILED','UNSUPPORTED','REVIEW_REQUIRED')
       or attempt ->> 'sourceDigest' <> source_digest
       or not public.forge_cartera020b_string_array_valid(coalesce(attempt -> 'warnings','[]'::jsonb),0,100)
       or not public.forge_cartera020b_string_array_valid(coalesce(attempt -> 'errors','[]'::jsonb),0,100) then
      raise exception 'CARTERA020B_ATTEMPT_INVALID';
    end if;

    attempt_id := gen_random_uuid();
    insert into public.cartera020b_extraction_attempts (
      id, advisor_id, attempt_reference, inbox_item_id, provider, provider_version,
      extraction_method, extraction_status, source_digest, page_count, text_available,
      text_digest, output_reference, warnings, errors, started_at, completed_at
    ) values (
      attempt_id, actor_id, attempt_reference, item.id, attempt ->> 'provider',
      attempt ->> 'providerVersion', attempt ->> 'method', attempt ->> 'status',
      source_digest, nullif(attempt ->> 'pageCount','')::integer,
      coalesce((attempt ->> 'textAvailable')::boolean,false),
      nullif(attempt ->> 'textDigest',''), nullif(attempt ->> 'outputReference',''),
      coalesce(attempt -> 'warnings','[]'::jsonb), coalesce(attempt -> 'errors','[]'::jsonb),
      (attempt ->> 'startedAt')::timestamptz, (attempt ->> 'completedAt')::timestamptz
    );
  end if;

  if candidate is not null then
    if not public.forge_cartera020b_jsonb_keys_allowed(
      candidate,
      array[
        'candidateReference','attemptReference','candidateType','classification','extractedFields',
        'overallConfidence','extractionSource','parserId','parserVersion','warnings',
        'missingFields','createsTruth'
      ]
    ) or coalesce((candidate ->> 'createsTruth')::boolean,false) <> false
      or jsonb_typeof(candidate -> 'classification') <> 'object'
      or jsonb_typeof(candidate -> 'extractedFields') <> 'object'
      or public.forge_cartera020b_has_forbidden_payload_keys(candidate -> 'extractedFields') then
      raise exception 'CARTERA020B_CANDIDATE_CONTRACT_INVALID';
    end if;
    candidate_reference := nullif(btrim(candidate ->> 'candidateReference'), '');
    if attempt_id is null and nullif(candidate ->> 'attemptReference','') is not null then
      select a.id into attempt_id from public.cartera020b_extraction_attempts a
      where a.advisor_id = actor_id and a.inbox_item_id = item.id
        and a.attempt_reference = candidate ->> 'attemptReference';
    end if;
    if candidate_reference !~ '^[A-Za-z0-9][A-Za-z0-9._:@/-]{0,239}$'
       or candidate ->> 'candidateType' not in ('POLICY','UNKNOWN')
       or candidate ->> 'extractionSource' !~ '^[A-Za-z0-9][A-Za-z0-9._:@/-]{0,119}$'
       or not public.forge_cartera020b_string_array_valid(coalesce(candidate -> 'warnings','[]'::jsonb),0,100)
       or not public.forge_cartera020b_string_array_valid(coalesce(candidate -> 'missingFields','[]'::jsonb),0,100) then
      raise exception 'CARTERA020B_CANDIDATE_INVALID';
    end if;

    candidate_id := gen_random_uuid();
    insert into public.cartera020b_extraction_candidates (
      id, advisor_id, candidate_reference, inbox_item_id, attempt_id, candidate_type,
      classification, extracted_fields, overall_confidence, extraction_source,
      parser_id, parser_version, warnings, missing_fields, creates_truth
    ) values (
      candidate_id, actor_id, candidate_reference, item.id, attempt_id,
      candidate ->> 'candidateType', candidate -> 'classification', candidate -> 'extractedFields',
      nullif(candidate ->> 'overallConfidence','')::numeric, candidate ->> 'extractionSource',
      nullif(candidate ->> 'parserId',''), nullif(candidate ->> 'parserVersion',''),
      coalesce(candidate -> 'warnings','[]'::jsonb), coalesce(candidate -> 'missingFields','[]'::jsonb), false
    );
  end if;

  if packet is not null then
    if not public.forge_cartera020b_jsonb_keys_allowed(
      packet,
      array[
        'packetReference','candidateReference','documentType','extractedFields',
        'extractionConfidence','warnings','identityCandidates','policyRoleCandidates',
        'existingPolicyCandidates','confirmationState','createsTruth'
      ]
    ) or packet ->> 'confirmationState' <> 'PENDING_CONFIRMATION'
      or coalesce((packet ->> 'createsTruth')::boolean,false) <> false
      or jsonb_typeof(packet -> 'extractedFields') <> 'object'
      or jsonb_typeof(coalesce(packet -> 'identityCandidates','[]'::jsonb)) <> 'array'
      or jsonb_typeof(coalesce(packet -> 'policyRoleCandidates','[]'::jsonb)) <> 'array'
      or jsonb_typeof(coalesce(packet -> 'existingPolicyCandidates','[]'::jsonb)) <> 'array'
      or public.forge_cartera020b_has_forbidden_payload_keys(packet -> 'extractedFields') then
      raise exception 'CARTERA020B_PACKET_CONTRACT_INVALID';
    end if;
    packet_reference := nullif(btrim(packet ->> 'packetReference'), '');
    if candidate_id is null then
      select c.id into candidate_id from public.cartera020b_extraction_candidates c
      where c.advisor_id = actor_id and c.inbox_item_id = item.id
        and c.candidate_reference = packet ->> 'candidateReference';
    end if;
    if candidate_id is null
       or packet_reference !~ '^[A-Za-z0-9][A-Za-z0-9._:@/-]{0,239}$'
       or packet ->> 'documentType' not in ('POLICY','UNKNOWN')
       or not public.forge_cartera020b_string_array_valid(coalesce(packet -> 'warnings','[]'::jsonb),0,100)
       or jsonb_array_length(coalesce(packet -> 'identityCandidates','[]'::jsonb)) > 100
       or jsonb_array_length(coalesce(packet -> 'policyRoleCandidates','[]'::jsonb)) > 100
       or jsonb_array_length(coalesce(packet -> 'existingPolicyCandidates','[]'::jsonb)) > 100 then
      raise exception 'CARTERA020B_PACKET_INVALID';
    end if;

    insert into public.cartera020b_policy_evidence_packets (
      advisor_id, packet_reference, inbox_item_id, candidate_id, document_type,
      extracted_fields, extraction_confidence, warnings, identity_candidates,
      policy_role_candidates, existing_policy_candidates, confirmation_state, creates_truth
    ) values (
      actor_id, packet_reference, item.id, candidate_id, packet ->> 'documentType',
      packet -> 'extractedFields', nullif(packet ->> 'extractionConfidence','')::numeric,
      coalesce(packet -> 'warnings','[]'::jsonb), coalesce(packet -> 'identityCandidates','[]'::jsonb),
      coalesce(packet -> 'policyRoleCandidates','[]'::jsonb),
      coalesce(packet -> 'existingPolicyCandidates','[]'::jsonb), 'PENDING_CONFIRMATION', false
    );
  end if;

  from_status := item.status;
  from_worker_state := item.worker_state;
  next_retry_at := case when target_worker_state = 'RETRY_WAIT' then
    completed_at + make_interval(secs => least(3600, (30 * power(2, item.retry_count))::integer))
    else null end;
  reason_code := case
    when target_worker_state = 'RETRY_WAIT' then 'RETRY_SCHEDULED'
    when target_worker_state in ('BLOCKED','FAILED_TERMINAL') then 'PROCESSING_BLOCKED'
    else 'PROCESSING_RESULT_RECORDED'
  end;

  perform set_config('forge.cartera020b_command', 'on', true);
  update public.cartera020b_evidence_inbox_items i
  set status = evidence_status,
      worker_state = target_worker_state,
      document_type_candidate = coalesce(document_type, i.document_type_candidate),
      classification_state = coalesce(classification_state, i.classification_state),
      classification_confidence = case when result ? 'classificationConfidence'
        then classification_confidence else i.classification_confidence end,
      retry_count = case when target_worker_state = 'RETRY_WAIT' then i.retry_count + 1 else i.retry_count end,
      next_retry_at = next_retry_at,
      last_error_code = last_error_code,
      blocked_reason = blocked_reason,
      warnings = case when result ? 'warnings' then result_warnings else i.warnings end,
      lease_owner = null, lease_token = null, lease_expires_at = null,
      state_version = i.state_version + 1, updated_at = completed_at
  where i.id = item.id and i.advisor_id = actor_id
  returning * into item;

  transition_reference := 'transition/result/' || substr(command_digest, 1, 40);
  insert into public.cartera020b_evidence_transitions (
    advisor_id, transition_reference, inbox_item_id, from_status, to_status,
    from_worker_state, to_worker_state, reason_code, metadata,
    command_digest, idempotency_key, occurred_at, actor_id
  ) values (
    actor_id, transition_reference, item.id, from_status, item.status,
    from_worker_state, item.worker_state, reason_code,
    jsonb_build_object(
      'attemptReference',attempt_reference,'candidateReference',candidate_reference,
      'packetReference',packet_reference,'createsPolicy',false
    ), command_digest, idempotency_key, completed_at, actor_id
  );

  response := jsonb_build_object(
    'status','RECORDED','inboxItemId',item.id,'inboxReference',item.inbox_reference,
    'evidenceStatus',item.status,'workerState',item.worker_state,
    'stateVersion',item.state_version,'retryCount',item.retry_count,
    'nextRetryAt',item.next_retry_at,'attemptReference',attempt_reference,
    'candidateReference',candidate_reference,'packetReference',packet_reference,
    'confirmationState',case when packet_reference is null then null else 'PENDING_CONFIRMATION' end,
    'replayed',false,'createsPolicy',false
  );
  return public.forge_cartera020b_persist_receipt(
    actor_id, 'RECORD_PROCESSING_RESULT', idempotency_key, command_digest, response
  );
end;
$$;

revoke all on function public.forge_cartera020b_record_processing_result(jsonb) from public, anon, authenticated;
grant execute on function public.forge_cartera020b_record_processing_result(jsonb) to authenticated;

commit;