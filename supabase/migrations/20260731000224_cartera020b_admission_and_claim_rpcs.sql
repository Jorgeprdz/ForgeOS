-- CARTERA 020B governed admission and worker-claim RPCs.
-- Repository construction only. This migration is NOT remote deployment authorization.

begin;

create or replace function public.forge_cartera020b_admit_evidence(p_command jsonb)
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
  received_at timestamptz;
  byte_size bigint;
  source_reference text;
  inbox_reference text;
  source_type text;
  original_filename text;
  mime_type text;
  document_digest text;
  storage_reference text;
  purpose text;
  organization_reference text;
  existing_source public.cartera020b_evidence_sources%rowtype;
  existing_inbox public.cartera020b_evidence_inbox_items%rowtype;
  source_id uuid := gen_random_uuid();
  inbox_id uuid := gen_random_uuid();
  transition_reference text;
  replay jsonb;
  response jsonb;
begin
  if actor_id is null then raise exception 'CARTERA020B_AUTH_REQUIRED'; end if;
  if octet_length(coalesce(p_command::text, '')) > 32768 then
    raise exception 'CARTERA020B_ADMISSION_COMMAND_TOO_LARGE';
  end if;
  if not public.forge_cartera020b_jsonb_keys_allowed(
    p_command,
    array[
      'contractType','contractVersion','advisorId','actorReference',
      'sourceReference','inboxReference','organizationReference','sourceType',
      'originalFilename','mimeType','byteSize','documentDigest','storageReference',
      'purpose','receivedAt','idempotencyKey','commandDigest'
    ]
  )
  or p_command ->> 'contractType' <> 'FORGE_EVIDENCE_ADMISSION_COMMAND'
  or p_command ->> 'contractVersion' <> 'CARTERA-020B.1' then
    raise exception 'CARTERA020B_ADMISSION_CONTRACT_INVALID';
  end if;

  begin
    advisor_id := (p_command ->> 'advisorId')::uuid;
    byte_size := (p_command ->> 'byteSize')::bigint;
    received_at := (p_command ->> 'receivedAt')::timestamptz;
  exception when others then
    raise exception 'CARTERA020B_ADMISSION_FIELDS_INVALID';
  end;

  if advisor_id <> actor_id or p_command ->> 'actorReference' <> actor_id::text then
    raise exception 'CARTERA020B_ADMISSION_OWNER_MISMATCH';
  end if;

  source_reference := nullif(btrim(p_command ->> 'sourceReference'), '');
  inbox_reference := nullif(btrim(p_command ->> 'inboxReference'), '');
  organization_reference := nullif(btrim(p_command ->> 'organizationReference'), '');
  source_type := p_command ->> 'sourceType';
  original_filename := nullif(btrim(p_command ->> 'originalFilename'), '');
  mime_type := p_command ->> 'mimeType';
  document_digest := p_command ->> 'documentDigest';
  storage_reference := nullif(btrim(p_command ->> 'storageReference'), '');
  purpose := nullif(btrim(p_command ->> 'purpose'), '');
  idempotency_key := nullif(btrim(p_command ->> 'idempotencyKey'), '');

  if source_reference !~ '^[A-Za-z0-9][A-Za-z0-9._:@/-]{0,239}$'
     or inbox_reference !~ '^[A-Za-z0-9][A-Za-z0-9._:@/-]{0,239}$'
     or (organization_reference is not null and organization_reference !~ '^[A-Za-z0-9][A-Za-z0-9._:@/-]{0,239}$')
     or source_type not in ('UPLOAD','SCAN','INTEGRATION_IMPORT')
     or original_filename is null or length(original_filename) > 255
     or mime_type not in ('application/pdf','text/plain')
     or byte_size not between 1 and 26214400
     or document_digest !~ '^[a-f0-9]{64}$'
     or storage_reference !~ '^[A-Za-z0-9][A-Za-z0-9._:@/-]{0,239}$'
     or purpose !~ '^[A-Za-z0-9][A-Za-z0-9._:@/-]{0,119}$'
     or idempotency_key !~ '^[A-Za-z0-9][A-Za-z0-9._:@/-]{0,159}$'
     or received_at is null or received_at > now() + interval '5 minutes'
     or public.forge_cartera020b_has_forbidden_payload_keys(p_command) then
    raise exception 'CARTERA020B_ADMISSION_COMMAND_INVALID';
  end if;

  command_digest := public.forge_cartera020b_command_digest(p_command);
  perform pg_advisory_xact_lock(hashtextextended(actor_id::text || '|ADMIT_EVIDENCE|' || idempotency_key, 0));
  perform pg_advisory_xact_lock(hashtextextended(actor_id::text || '|' || document_digest || '|' || purpose, 0));

  replay := public.forge_cartera020b_existing_receipt_response(
    actor_id, 'ADMIT_EVIDENCE', idempotency_key, command_digest
  );
  if replay is not null then return replay; end if;

  select * into existing_source
  from public.cartera020b_evidence_sources s
  where s.advisor_id = actor_id
    and s.document_digest = document_digest
    and s.purpose = purpose;

  if existing_source.id is not null then
    select * into existing_inbox
    from public.cartera020b_evidence_inbox_items i
    where i.advisor_id = actor_id and i.source_id = existing_source.id;

    response := jsonb_build_object(
      'status','ALREADY_ADMITTED','sourceId',existing_source.id,
      'sourceReference',existing_source.source_reference,
      'inboxItemId',existing_inbox.id,'inboxReference',existing_inbox.inbox_reference,
      'documentDigest',document_digest,'evidenceStatus',existing_inbox.status,
      'workerState',existing_inbox.worker_state,'stateVersion',existing_inbox.state_version,
      'replayed',false,'createsPolicy',false
    );
    return public.forge_cartera020b_persist_receipt(
      actor_id, 'ADMIT_EVIDENCE', idempotency_key, command_digest, response
    );
  end if;

  if exists (
    select 1 from public.cartera020b_evidence_sources s
    where s.advisor_id = actor_id and s.source_reference = source_reference
  ) then raise exception 'CARTERA020B_SOURCE_REFERENCE_COLLISION'; end if;
  if exists (
    select 1 from public.cartera020b_evidence_inbox_items i
    where i.advisor_id = actor_id and i.inbox_reference = inbox_reference
  ) then raise exception 'CARTERA020B_INBOX_REFERENCE_COLLISION'; end if;

  insert into public.cartera020b_evidence_sources (
    id, advisor_id, source_reference, organization_reference, source_type,
    original_filename, mime_type, byte_size, document_digest, storage_reference,
    purpose, received_at, received_by, metadata
  ) values (
    source_id, actor_id, source_reference, organization_reference, source_type,
    original_filename, mime_type, byte_size, document_digest, storage_reference,
    purpose, received_at, actor_id,
    jsonb_build_object('rawBytesPersisted',false,'createsPolicyTruth',false)
  );

  insert into public.cartera020b_evidence_inbox_items (
    id, advisor_id, inbox_reference, source_id, status, worker_state, metadata
  ) values (
    inbox_id, actor_id, inbox_reference, source_id, 'received', 'AVAILABLE',
    jsonb_build_object('documentDigest',document_digest,'purpose',purpose,'createsPolicyTruth',false)
  );

  transition_reference := 'transition/admit/' || substr(command_digest, 1, 40);
  insert into public.cartera020b_evidence_transitions (
    advisor_id, transition_reference, inbox_item_id, from_status, to_status,
    from_worker_state, to_worker_state, reason_code, metadata,
    command_digest, idempotency_key, occurred_at, actor_id
  ) values (
    actor_id, transition_reference, inbox_id, 'received', 'received',
    'AVAILABLE', 'AVAILABLE', 'EVIDENCE_ADMITTED',
    jsonb_build_object('sourceReference',source_reference,'createsPolicy',false),
    command_digest, idempotency_key, received_at, actor_id
  );

  response := jsonb_build_object(
    'status','ADMITTED','sourceId',source_id,'sourceReference',source_reference,
    'inboxItemId',inbox_id,'inboxReference',inbox_reference,
    'documentDigest',document_digest,'evidenceStatus','received',
    'workerState','AVAILABLE','stateVersion',1,
    'replayed',false,'createsPolicy',false
  );
  return public.forge_cartera020b_persist_receipt(
    actor_id, 'ADMIT_EVIDENCE', idempotency_key, command_digest, response
  );
end;
$$;

create or replace function public.forge_cartera020b_claim_evidence(
  p_worker_id text,
  p_lease_seconds integer default 300
)
returns jsonb
language plpgsql
security definer
set search_path = public, extensions, pg_temp
as $$
#variable_conflict use_variable
declare
  actor_id uuid := auth.uid();
  item public.cartera020b_evidence_inbox_items%rowtype;
  previous_worker_state text;
  claim_token uuid;
  claimed_at timestamptz := clock_timestamp();
  lease_expires_at timestamptz;
  transition_reference text;
  transition_digest text;
  transition_key text;
  reason_code text;
begin
  if actor_id is null then raise exception 'CARTERA020B_AUTH_REQUIRED'; end if;
  if p_worker_id is null or p_worker_id !~ '^[A-Za-z0-9][A-Za-z0-9._:@/-]{0,239}$' then
    raise exception 'CARTERA020B_WORKER_ID_INVALID';
  end if;
  if p_lease_seconds is null or p_lease_seconds < 30 or p_lease_seconds > 3600 then
    raise exception 'CARTERA020B_LEASE_SECONDS_OUT_OF_BOUNDS';
  end if;

  select * into item
  from public.cartera020b_evidence_inbox_items i
  where i.advisor_id = actor_id
    and i.worker_state = 'CLAIMED'
    and i.lease_owner = p_worker_id
    and i.lease_expires_at > claimed_at
  order by i.updated_at
  for update skip locked
  limit 1;

  if item.id is not null then
    return jsonb_build_object(
      'status','CLAIMED','inboxItemId',item.id,'inboxReference',item.inbox_reference,
      'leaseToken',item.lease_token,'leaseExpiresAt',item.lease_expires_at,
      'workerState',item.worker_state,'stateVersion',item.state_version,
      'replayed',true,'createsPolicy',false
    );
  end if;

  select * into item
  from public.cartera020b_evidence_inbox_items i
  where i.advisor_id = actor_id
    and i.status not in ('confirmation_required','confirmed','rejected','blocked','archived')
    and (
      i.worker_state = 'AVAILABLE'
      or (i.worker_state = 'RETRY_WAIT' and i.next_retry_at <= claimed_at)
      or (i.worker_state = 'CLAIMED' and i.lease_expires_at <= claimed_at)
    )
  order by
    case when i.worker_state = 'RETRY_WAIT' then 0 when i.worker_state = 'CLAIMED' then 1 else 2 end,
    coalesce(i.next_retry_at, i.created_at), i.created_at
  for update skip locked
  limit 1;

  if item.id is null then
    return jsonb_build_object('status','NO_AVAILABLE_ITEM','replayed',false,'createsPolicy',false);
  end if;

  previous_worker_state := item.worker_state;
  reason_code := case when previous_worker_state = 'CLAIMED'
    then 'EXPIRED_LEASE_RECLAIMED' else 'CLAIM_ACQUIRED' end;
  claim_token := gen_random_uuid();
  lease_expires_at := claimed_at + make_interval(secs => p_lease_seconds);

  perform set_config('forge.cartera020b_command', 'on', true);
  update public.cartera020b_evidence_inbox_items i
  set worker_state = 'CLAIMED', lease_owner = p_worker_id,
      lease_token = claim_token, lease_expires_at = lease_expires_at,
      next_retry_at = null, state_version = i.state_version + 1,
      updated_at = claimed_at
  where i.id = item.id and i.advisor_id = actor_id
  returning * into item;

  transition_reference := 'transition/claim/' || claim_token::text;
  transition_key := 'claim/' || claim_token::text;
  transition_digest := encode(digest(
    jsonb_build_object(
      'advisorId',actor_id,'inboxReference',item.inbox_reference,
      'workerId',p_worker_id,'leaseToken',claim_token,
      'leaseSeconds',p_lease_seconds,'claimedAt',claimed_at
    )::text, 'sha256'
  ), 'hex');

  insert into public.cartera020b_evidence_transitions (
    advisor_id, transition_reference, inbox_item_id, from_status, to_status,
    from_worker_state, to_worker_state, reason_code, metadata,
    command_digest, idempotency_key, occurred_at, actor_id
  ) values (
    actor_id, transition_reference, item.id, item.status, item.status,
    previous_worker_state, 'CLAIMED', reason_code,
    jsonb_build_object('workerId',p_worker_id,'leaseExpiresAt',lease_expires_at),
    transition_digest, transition_key, claimed_at, actor_id
  );

  return jsonb_build_object(
    'status','CLAIMED','inboxItemId',item.id,'inboxReference',item.inbox_reference,
    'leaseToken',claim_token,'leaseExpiresAt',lease_expires_at,
    'workerState','CLAIMED','stateVersion',item.state_version,
    'replayed',false,'createsPolicy',false
  );
end;
$$;

revoke all on function public.forge_cartera020b_admit_evidence(jsonb) from public, anon, authenticated;
revoke all on function public.forge_cartera020b_claim_evidence(text, integer) from public, anon, authenticated;
grant execute on function public.forge_cartera020b_admit_evidence(jsonb) to authenticated;
grant execute on function public.forge_cartera020b_claim_evidence(text, integer) to authenticated;

commit;