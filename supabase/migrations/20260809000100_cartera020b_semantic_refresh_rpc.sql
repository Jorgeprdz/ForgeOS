-- CARTERA 020B append-only semantic refresh for legacy pending PDF packets.
-- Refreshes evidence interpretation only. Never mutates the historical packet and never creates Policy Truth.

begin;

create or replace function public.forge_cartera020b_refresh_pending_packet_semantics(p_command jsonb)
returns jsonb
language plpgsql
security definer
set search_path = public, extensions, pg_temp
as $$
#variable_conflict use_variable
declare
  actor_id uuid := auth.uid();
  advisor_id uuid;
  base_packet_reference text;
  refresh_packet_reference text;
  refresh_candidate_reference text;
  refresh_attempt_reference text;
  document_digest text;
  parser_id text;
  parser_version text;
  refreshed_at timestamptz;
  extraction_confidence numeric;
  extracted_fields jsonb;
  warnings jsonb;
  missing_fields jsonb;
  base_packet public.cartera020b_policy_evidence_packets%rowtype;
  existing_refresh public.cartera020b_policy_evidence_packets%rowtype;
  source_digest text;
  attempt_id uuid;
  candidate_id uuid;
begin
  if actor_id is null then raise exception 'CARTERA020B_AUTH_REQUIRED'; end if;
  if octet_length(coalesce(p_command::text, '')) > 1048576 then
    raise exception 'CARTERA020B_REFRESH_COMMAND_TOO_LARGE';
  end if;

  if not public.forge_cartera020b_jsonb_keys_allowed(
    p_command,
    array[
      'contractType','contractVersion','advisorId','actorReference','basePacketReference',
      'refreshPacketReference','refreshCandidateReference','refreshAttemptReference',
      'documentDigest','parserId','parserVersion','refreshedAt','extractionConfidence',
      'extractedFields','warnings','missingFields'
    ]
  )
  or p_command ->> 'contractType' <> 'FORGE_PENDING_PACKET_SEMANTIC_REFRESH_COMMAND'
  or p_command ->> 'contractVersion' <> 'CARTERA-020B.1' then
    raise exception 'CARTERA020B_REFRESH_CONTRACT_INVALID';
  end if;

  begin
    advisor_id := (p_command ->> 'advisorId')::uuid;
    refreshed_at := (p_command ->> 'refreshedAt')::timestamptz;
    extraction_confidence := case
      when p_command ? 'extractionConfidence' and p_command ->> 'extractionConfidence' is not null
      then (p_command ->> 'extractionConfidence')::numeric
      else null
    end;
  exception when others then
    raise exception 'CARTERA020B_REFRESH_FIELDS_INVALID';
  end;

  if advisor_id <> actor_id or p_command ->> 'actorReference' <> actor_id::text then
    raise exception 'CARTERA020B_REFRESH_OWNER_MISMATCH';
  end if;

  base_packet_reference := nullif(btrim(p_command ->> 'basePacketReference'), '');
  refresh_packet_reference := nullif(btrim(p_command ->> 'refreshPacketReference'), '');
  refresh_candidate_reference := nullif(btrim(p_command ->> 'refreshCandidateReference'), '');
  refresh_attempt_reference := nullif(btrim(p_command ->> 'refreshAttemptReference'), '');
  document_digest := lower(nullif(btrim(p_command ->> 'documentDigest'), ''));
  parser_id := nullif(btrim(p_command ->> 'parserId'), '');
  parser_version := nullif(btrim(p_command ->> 'parserVersion'), '');
  extracted_fields := p_command -> 'extractedFields';
  warnings := coalesce(p_command -> 'warnings', '[]'::jsonb);
  missing_fields := coalesce(p_command -> 'missingFields', '[]'::jsonb);

  if base_packet_reference !~ '^[A-Za-z0-9][A-Za-z0-9._:@/-]{0,239}$'
     or refresh_packet_reference !~ '^[A-Za-z0-9][A-Za-z0-9._:@/-]{0,239}$'
     or refresh_candidate_reference !~ '^[A-Za-z0-9][A-Za-z0-9._:@/-]{0,239}$'
     or refresh_attempt_reference !~ '^[A-Za-z0-9][A-Za-z0-9._:@/-]{0,239}$'
     or document_digest !~ '^[a-f0-9]{64}$'
     or parser_id !~ '^[A-Za-z0-9][A-Za-z0-9._:@/-]{0,119}$'
     or parser_version !~ '^[A-Za-z0-9][A-Za-z0-9._:@/-]{0,119}$'
     or refreshed_at is null or refreshed_at > now() + interval '5 minutes'
     or jsonb_typeof(extracted_fields) <> 'object'
     or public.forge_cartera020b_has_forbidden_payload_keys(extracted_fields)
     or not public.forge_cartera020b_string_array_valid(warnings, 0, 100)
     or not public.forge_cartera020b_string_array_valid(missing_fields, 0, 100)
     or (extraction_confidence is not null and (extraction_confidence < 0 or extraction_confidence > 1)) then
    raise exception 'CARTERA020B_REFRESH_COMMAND_INVALID';
  end if;

  if refresh_packet_reference <> 'POLICY_PACKET:AURA:SEMANTIC_REFRESH:' || substr(document_digest, 1, 40)
     or refresh_candidate_reference <> 'POLICY_CANDIDATE:AURA:SEMANTIC_REFRESH:' || substr(document_digest, 1, 40)
     or refresh_attempt_reference <> 'EXTRACTION_ATTEMPT:AURA:SEMANTIC_REFRESH:' || substr(document_digest, 1, 40) then
    raise exception 'CARTERA020B_REFRESH_REFERENCE_MISMATCH';
  end if;

  perform pg_advisory_xact_lock(hashtextextended(actor_id::text || '|SEMANTIC_REFRESH|' || document_digest, 0));

  select * into existing_refresh
  from public.cartera020b_policy_evidence_packets p
  where p.advisor_id = actor_id
    and p.packet_reference = refresh_packet_reference
  limit 1;

  if existing_refresh.id is not null then
    return jsonb_build_object(
      'status','ALREADY_REFRESHED',
      'packetReference',existing_refresh.packet_reference,
      'confirmationState',existing_refresh.confirmation_state,
      'extractedFields',existing_refresh.extracted_fields,
      'extractionConfidence',existing_refresh.extraction_confidence,
      'createsPolicy',false
    );
  end if;

  select * into base_packet
  from public.cartera020b_policy_evidence_packets p
  where p.advisor_id = actor_id
    and p.packet_reference = base_packet_reference
    and p.confirmation_state = 'PENDING_CONFIRMATION'
  limit 1;

  if base_packet.id is null then raise exception 'CARTERA020B_REFRESH_BASE_PACKET_NOT_FOUND'; end if;
  if base_packet.packet_reference = refresh_packet_reference then raise exception 'CARTERA020B_REFRESH_BASE_IS_REFRESH'; end if;

  select s.document_digest into source_digest
  from public.cartera020b_evidence_inbox_items i
  join public.cartera020b_evidence_sources s on s.id = i.source_id and s.advisor_id = i.advisor_id
  where i.id = base_packet.inbox_item_id and i.advisor_id = actor_id;

  if source_digest is null or source_digest <> document_digest then
    raise exception 'CARTERA020B_REFRESH_SOURCE_DIGEST_MISMATCH';
  end if;

  attempt_id := gen_random_uuid();
  insert into public.cartera020b_extraction_attempts (
    id, advisor_id, attempt_reference, inbox_item_id, provider, provider_version,
    extraction_method, extraction_status, source_digest, page_count, text_available,
    text_digest, output_reference, warnings, errors, started_at, completed_at
  ) values (
    attempt_id, actor_id, refresh_attempt_reference, base_packet.inbox_item_id,
    'FORGE_EDGE', parser_version, 'PDF_SEMANTIC_REFRESH', 'REVIEW_REQUIRED',
    document_digest, null, false, null, 'EDGE_SEMANTIC_REFRESH:' || substr(document_digest,1,40),
    warnings, '[]'::jsonb, refreshed_at, refreshed_at
  );

  candidate_id := gen_random_uuid();
  insert into public.cartera020b_extraction_candidates (
    id, advisor_id, candidate_reference, inbox_item_id, attempt_id, candidate_type,
    classification, extracted_fields, overall_confidence, extraction_source,
    parser_id, parser_version, warnings, missing_fields, creates_truth
  ) values (
    candidate_id, actor_id, refresh_candidate_reference, base_packet.inbox_item_id, attempt_id,
    'POLICY', jsonb_build_object('documentType','POLICY','state','REVIEW_REQUIRED','confidence',extraction_confidence),
    extracted_fields, extraction_confidence, 'FORGE_EDGE', parser_id, parser_version,
    warnings, missing_fields, false
  );

  insert into public.cartera020b_policy_evidence_packets (
    advisor_id, packet_reference, inbox_item_id, candidate_id, document_type,
    extracted_fields, extraction_confidence, warnings, identity_candidates,
    policy_role_candidates, existing_policy_candidates, confirmation_state, creates_truth
  ) values (
    actor_id, refresh_packet_reference, base_packet.inbox_item_id, candidate_id, 'POLICY',
    extracted_fields, extraction_confidence, warnings,
    base_packet.identity_candidates, base_packet.policy_role_candidates,
    base_packet.existing_policy_candidates, 'PENDING_CONFIRMATION', false
  );

  return jsonb_build_object(
    'status','REFRESHED',
    'packetReference',refresh_packet_reference,
    'basePacketReference',base_packet_reference,
    'attemptReference',refresh_attempt_reference,
    'candidateReference',refresh_candidate_reference,
    'confirmationState','PENDING_CONFIRMATION',
    'extractedFields',extracted_fields,
    'extractionConfidence',extraction_confidence,
    'createsPolicy',false
  );
end;
$$;

revoke all on function public.forge_cartera020b_refresh_pending_packet_semantics(jsonb) from public, anon, authenticated;
grant execute on function public.forge_cartera020b_refresh_pending_packet_semantics(jsonb) to authenticated;

commit;
