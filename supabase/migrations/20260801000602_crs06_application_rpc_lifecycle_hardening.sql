-- CRS 06E Application RPC lifecycle and idempotency hardening

begin;

create or replace function public.forge_crs06_create_application(
  p_person_reference text,
  p_quote_reference text,
  p_quote_version_reference text,
  p_prospect_reference text,
  p_product_reference text,
  p_document_reference text,
  p_snapshot_digest text,
  p_source_evidence_references jsonb,
  p_signers jsonb,
  p_occurred_at timestamptz,
  p_idempotency_key text,
  p_confirmation_reference text
)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  actor_id uuid := auth.uid();
  person_row public.commercial_people%rowtype;
  quote_row public.quote_lifecycle_quotes%rowtype;
  quote_version_row public.quote_lifecycle_versions%rowtype;
  application_row public.commercial_applications%rowtype;
  version_row public.application_versions%rowtype;
  existing_event public.application_events%rowtype;
  signer jsonb;
  event_ref text;
  command_digest text;
begin
  if actor_id is null then raise exception 'CRS06_AUTH_REQUIRED'; end if;
  if coalesce(p_confirmation_reference, '') = '' then raise exception 'CRS06_HUMAN_CONFIRMATION_REQUIRED'; end if;
  if coalesce(p_idempotency_key, '') !~ '^[A-Za-z0-9][A-Za-z0-9._:@/-]{0,239}$' then raise exception 'CRS06_IDEMPOTENCY_KEY_INVALID'; end if;
  if p_snapshot_digest !~ '^[a-f0-9]{64}$' then raise exception 'CRS06_SNAPSHOT_DIGEST_INVALID'; end if;
  if not public.forge_crs06_valid_reference_array(p_source_evidence_references) then raise exception 'CRS06_EVIDENCE_INVALID'; end if;
  if p_signers is null or jsonb_typeof(p_signers) <> 'array' or jsonb_array_length(p_signers) < 1 then raise exception 'CRS06_SIGNERS_REQUIRED'; end if;
  if exists (
    select 1 from jsonb_array_elements(p_signers) item
    where jsonb_typeof(item) <> 'object'
      or coalesce(item->>'signerReference','') !~ '^[A-Za-z0-9][A-Za-z0-9._:@/-]{0,239}$'
      or coalesce(item->>'role','') not in ('APPLICANT','INSURED','OWNER','PAYOR','LEGAL_REPRESENTATIVE','ADVISOR_WITNESS')
      or coalesce(item->>'signatureState','PENDING') <> 'PENDING'
  ) then raise exception 'CRS06_SIGNER_PAYLOAD_INVALID'; end if;
  if (
    select count(*) <> count(distinct item->>'signerReference')
    from jsonb_array_elements(p_signers) item
  ) then raise exception 'CRS06_DUPLICATE_SIGNER_REFERENCE'; end if;
  if not exists (
    select 1 from jsonb_array_elements(p_signers) item
    where coalesce((item->>'required')::boolean, true) = true
  ) then raise exception 'CRS06_REQUIRED_SIGNER_REQUIRED'; end if;

  command_digest := public.forge_crs06_event_digest(jsonb_build_object(
    'operation','CREATE_APPLICATION',
    'personReference',p_person_reference,
    'quoteReference',p_quote_reference,
    'quoteVersionReference',p_quote_version_reference,
    'prospectReference',p_prospect_reference,
    'productReference',p_product_reference,
    'documentReference',p_document_reference,
    'snapshotDigest',p_snapshot_digest,
    'sourceEvidenceReferences',p_source_evidence_references,
    'signers',p_signers,
    'occurredAt',p_occurred_at,
    'idempotencyKey',p_idempotency_key,
    'confirmationReference',p_confirmation_reference
  ));

  select * into existing_event
  from public.application_events
  where advisor_id = actor_id and idempotency_key = p_idempotency_key
  limit 1;
  if found then
    if existing_event.command_digest <> command_digest then raise exception 'CRS06_IDEMPOTENCY_CONFLICT'; end if;
    select * into application_row
    from public.commercial_applications
    where advisor_id = actor_id and id = existing_event.application_id;
    return jsonb_build_object(
      'status','IDEMPOTENT_REPLAY',
      'applicationReference',application_row.application_reference,
      'versionReference',existing_event.version_reference,
      'eventReference',existing_event.event_reference,
      'idempotentReplay',true,
      'policyCreated',false,
      'issuanceEvidenceRequiredForPolicy',true
    );
  end if;

  select * into person_row
  from public.commercial_people
  where advisor_id = actor_id
    and person_reference = p_person_reference
    and lifecycle_state = 'CONFIRMED'
    and archived_at is null;
  if not found then raise exception 'CRS06_CONFIRMED_PERSON_REQUIRED'; end if;

  select * into quote_row
  from public.quote_lifecycle_quotes
  where advisor_id = actor_id and quote_reference = p_quote_reference;
  if not found then raise exception 'CRS06_QUOTE_REQUIRED'; end if;

  select * into quote_version_row
  from public.quote_lifecycle_versions
  where advisor_id = actor_id
    and quote_id = quote_row.id
    and quote_version_reference = p_quote_version_reference
    and confirmation_state = 'CONFIRMED';
  if not found then raise exception 'CRS06_CONFIRMED_QUOTE_VERSION_REQUIRED'; end if;
  if quote_row.prospect_id::text <> p_prospect_reference then raise exception 'CRS06_QUOTE_PROSPECT_MISMATCH'; end if;
  if quote_row.product_reference <> p_product_reference then raise exception 'CRS06_QUOTE_PRODUCT_MISMATCH'; end if;

  insert into public.commercial_applications (
    application_reference,advisor_id,person_id,quote_reference,quote_version_reference,
    prospect_reference,product_reference,current_version,lifecycle_state,
    previous_lifecycle_state,created_at,updated_at
  ) values (
    'application:' || gen_random_uuid()::text,actor_id,person_row.id,p_quote_reference,
    p_quote_version_reference,p_prospect_reference,p_product_reference,1,
    'READY_FOR_SIGNATURE','DRAFT',p_occurred_at,now()
  ) returning * into application_row;

  insert into public.application_versions (
    application_id,advisor_id,version_reference,version_number,document_reference,
    snapshot_digest,source_evidence_references,created_at
  ) values (
    application_row.id,actor_id,'application-version:' || gen_random_uuid()::text,1,
    p_document_reference,p_snapshot_digest,p_source_evidence_references,p_occurred_at
  ) returning * into version_row;

  for signer in select value from jsonb_array_elements(p_signers)
  loop
    insert into public.application_signers (
      application_id,advisor_id,signer_reference,signer_role,required,
      person_reference,signature_state
    ) values (
      application_row.id,actor_id,signer->>'signerReference',signer->>'role',
      coalesce((signer->>'required')::boolean,true),nullif(signer->>'personReference',''),
      'PENDING'
    );
  end loop;

  event_ref := 'application-event:' || gen_random_uuid()::text;
  insert into public.application_events (
    application_id,advisor_id,event_reference,event_type,version_reference,
    lifecycle_state,previous_lifecycle_state,occurred_at,source_reference,
    evidence_references,idempotency_key,confirmation_reference,event_digest,
    command_digest
  ) values (
    application_row.id,actor_id,event_ref,'APPLICATION_READY_FOR_SIGNATURE',
    version_row.version_reference,'READY_FOR_SIGNATURE','DRAFT',p_occurred_at,
    p_quote_reference,p_source_evidence_references,p_idempotency_key,
    p_confirmation_reference,command_digest,command_digest
  );

  return jsonb_build_object(
    'status','CONFIRMED',
    'applicationReference',application_row.application_reference,
    'versionReference',version_row.version_reference,
    'eventReference',event_ref,
    'idempotentReplay',false,
    'policyCreated',false,
    'issuanceEvidenceRequiredForPolicy',true
  );
end;
$$;

create or replace function public.forge_crs06_add_application_version(
  p_application_reference text,
  p_document_reference text,
  p_snapshot_digest text,
  p_source_evidence_references jsonb,
  p_occurred_at timestamptz,
  p_idempotency_key text,
  p_confirmation_reference text,
  p_correction_of text default null
)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  actor_id uuid := auth.uid();
  app public.commercial_applications%rowtype;
  correction_row public.application_versions%rowtype;
  v public.application_versions%rowtype;
  existing public.application_events%rowtype;
  event_ref text;
  command_digest text;
begin
  if actor_id is null then raise exception 'CRS06_AUTH_REQUIRED'; end if;
  if coalesce(p_confirmation_reference,'') = '' then raise exception 'CRS06_HUMAN_CONFIRMATION_REQUIRED'; end if;
  if p_snapshot_digest !~ '^[a-f0-9]{64}$' then raise exception 'CRS06_SNAPSHOT_DIGEST_INVALID'; end if;
  if not public.forge_crs06_valid_reference_array(p_source_evidence_references) then raise exception 'CRS06_EVIDENCE_INVALID'; end if;

  command_digest := public.forge_crs06_event_digest(jsonb_build_object(
    'operation','ADD_APPLICATION_VERSION',
    'applicationReference',p_application_reference,
    'documentReference',p_document_reference,
    'snapshotDigest',p_snapshot_digest,
    'sourceEvidenceReferences',p_source_evidence_references,
    'occurredAt',p_occurred_at,
    'idempotencyKey',p_idempotency_key,
    'confirmationReference',p_confirmation_reference,
    'correctionOf',p_correction_of
  ));

  select * into app
  from public.commercial_applications
  where advisor_id = actor_id and application_reference = p_application_reference
  for update;
  if not found then raise exception 'CRS06_APPLICATION_REQUIRED'; end if;
  if app.lifecycle_state in ('APPROVED','DECLINED','WITHDRAWN') then raise exception 'CRS06_TERMINAL_APPLICATION_IMMUTABLE'; end if;

  select * into existing
  from public.application_events
  where advisor_id = actor_id and application_id = app.id and idempotency_key = p_idempotency_key;
  if found then
    if existing.command_digest <> command_digest then raise exception 'CRS06_IDEMPOTENCY_CONFLICT'; end if;
    return jsonb_build_object(
      'status','IDEMPOTENT_REPLAY',
      'applicationReference',app.application_reference,
      'versionReference',existing.version_reference,
      'eventReference',existing.event_reference,
      'idempotentReplay',true
    );
  end if;

  correction_row.id := null;
  if p_correction_of is not null then
    select * into correction_row
    from public.application_versions
    where advisor_id = actor_id
      and application_id = app.id
      and version_reference = p_correction_of;
    if not found then raise exception 'CRS06_CORRECTION_VERSION_REQUIRED'; end if;
  end if;

  insert into public.application_versions (
    application_id,advisor_id,version_reference,version_number,document_reference,
    snapshot_digest,source_evidence_references,created_at,correction_of
  ) values (
    app.id,actor_id,'application-version:' || gen_random_uuid()::text,app.current_version + 1,
    p_document_reference,p_snapshot_digest,p_source_evidence_references,p_occurred_at,
    correction_row.id
  ) returning * into v;

  update public.commercial_applications
  set current_version = v.version_number,
      quote_version_reference = quote_version_reference,
      previous_lifecycle_state = lifecycle_state,
      lifecycle_state = 'READY_FOR_SIGNATURE',
      updated_at = now()
  where id = app.id;

  update public.application_signers
  set signature_state = 'PENDING', updated_at = now()
  where application_id = app.id and advisor_id = actor_id;

  event_ref := 'application-event:' || gen_random_uuid()::text;
  insert into public.application_events (
    application_id,advisor_id,event_reference,event_type,version_reference,
    lifecycle_state,previous_lifecycle_state,occurred_at,source_reference,
    evidence_references,idempotency_key,confirmation_reference,event_digest,
    command_digest,correction_of
  ) values (
    app.id,actor_id,event_ref,'APPLICATION_VERSION_CREATED',v.version_reference,
    'READY_FOR_SIGNATURE',app.lifecycle_state,p_occurred_at,p_document_reference,
    p_source_evidence_references,p_idempotency_key,p_confirmation_reference,
    command_digest,command_digest,null
  );

  return jsonb_build_object(
    'status','CONFIRMED',
    'applicationReference',app.application_reference,
    'versionReference',v.version_reference,
    'eventReference',event_ref,
    'idempotentReplay',false
  );
end;
$$;

create or replace function public.forge_crs06_record_signature_evidence(
  p_application_reference text,
  p_version_reference text,
  p_signer_reference text,
  p_signature_reference text,
  p_evidence_type text,
  p_document_digest text,
  p_provider_reference text,
  p_signed_at timestamptz,
  p_captured_at timestamptz,
  p_evidence_references jsonb,
  p_confirmation_state text,
  p_privacy_classification text,
  p_idempotency_key text,
  p_confirmation_reference text,
  p_correction_of text default null
)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  actor_id uuid := auth.uid();
  app public.commercial_applications%rowtype;
  current_version public.application_versions%rowtype;
  signer public.application_signers%rowtype;
  correction_row public.application_signature_evidence%rowtype;
  existing public.application_signature_evidence%rowtype;
  evidence public.application_signature_evidence%rowtype;
  required_total integer;
  required_signed integer;
  next_state text;
  event_type text;
  event_ref text;
  command_digest text;
begin
  if actor_id is null then raise exception 'CRS06_AUTH_REQUIRED'; end if;
  if coalesce(p_confirmation_reference,'') = '' then raise exception 'CRS06_HUMAN_CONFIRMATION_REQUIRED'; end if;
  if p_document_digest !~ '^[a-f0-9]{64}$' then raise exception 'CRS06_DOCUMENT_DIGEST_INVALID'; end if;
  if not public.forge_crs06_valid_reference_array(p_evidence_references) then raise exception 'CRS06_EVIDENCE_INVALID'; end if;
  if p_confirmation_state not in ('VERIFIED','DISPUTED') then raise exception 'CRS06_SIGNATURE_CONFIRMATION_INVALID'; end if;

  command_digest := public.forge_crs06_event_digest(jsonb_build_object(
    'operation','RECORD_SIGNATURE_EVIDENCE',
    'applicationReference',p_application_reference,
    'versionReference',p_version_reference,
    'signerReference',p_signer_reference,
    'signatureReference',p_signature_reference,
    'evidenceType',p_evidence_type,
    'documentDigest',p_document_digest,
    'providerReference',p_provider_reference,
    'signedAt',p_signed_at,
    'capturedAt',p_captured_at,
    'evidenceReferences',p_evidence_references,
    'confirmationState',p_confirmation_state,
    'privacyClassification',p_privacy_classification,
    'idempotencyKey',p_idempotency_key,
    'confirmationReference',p_confirmation_reference,
    'correctionOf',p_correction_of
  ));

  select * into app
  from public.commercial_applications
  where advisor_id = actor_id and application_reference = p_application_reference
  for update;
  if not found then raise exception 'CRS06_APPLICATION_REQUIRED'; end if;
  if app.lifecycle_state not in ('READY_FOR_SIGNATURE','PARTIALLY_SIGNED') then raise exception 'CRS06_SIGNATURE_STATE_INVALID'; end if;

  select * into existing
  from public.application_signature_evidence
  where advisor_id = actor_id and application_id = app.id and idempotency_key = p_idempotency_key;
  if found then
    if existing.command_digest <> command_digest then raise exception 'CRS06_IDEMPOTENCY_CONFLICT'; end if;
    return jsonb_build_object(
      'status','IDEMPOTENT_REPLAY',
      'signatureReference',existing.signature_reference,
      'idempotentReplay',true,
      'policyCreated',false
    );
  end if;

  select * into current_version
  from public.application_versions
  where advisor_id = actor_id
    and application_id = app.id
    and version_number = app.current_version;
  if not found or current_version.version_reference <> p_version_reference then raise exception 'CRS06_CURRENT_VERSION_REQUIRED'; end if;

  select * into signer
  from public.application_signers
  where advisor_id = actor_id
    and application_id = app.id
    and signer_reference = p_signer_reference
  for update;
  if not found then raise exception 'CRS06_SIGNER_REQUIRED'; end if;

  correction_row.id := null;
  if p_correction_of is not null then
    select * into correction_row
    from public.application_signature_evidence
    where advisor_id = actor_id
      and application_id = app.id
      and signature_reference = p_correction_of
      and signer_reference = p_signer_reference
      and version_reference = p_version_reference;
    if not found then raise exception 'CRS06_SIGNATURE_CORRECTION_REQUIRED'; end if;
  elsif signer.signature_state = 'SIGNED' then
    raise exception 'CRS06_SIGNER_ALREADY_SIGNED';
  end if;

  insert into public.application_signature_evidence (
    application_id,advisor_id,signature_reference,version_reference,signer_reference,
    evidence_type,document_digest,provider_reference,signed_at,captured_at,
    evidence_references,confirmation_state,privacy_classification,idempotency_key,
    confirmation_reference,correction_of,command_digest
  ) values (
    app.id,actor_id,p_signature_reference,p_version_reference,p_signer_reference,
    p_evidence_type,p_document_digest,p_provider_reference,p_signed_at,p_captured_at,
    p_evidence_references,p_confirmation_state,p_privacy_classification,p_idempotency_key,
    p_confirmation_reference,correction_row.id,command_digest
  ) returning * into evidence;

  if p_confirmation_state = 'VERIFIED' then
    update public.application_signers
    set signature_state = 'SIGNED', updated_at = now()
    where id = signer.id;
  end if;

  select count(*), count(*) filter (where signature_state = 'SIGNED')
  into required_total, required_signed
  from public.application_signers
  where application_id = app.id and advisor_id = actor_id and required = true;

  next_state := case
    when required_total > 0 and required_signed = required_total then 'SIGNED'
    when required_signed > 0 then 'PARTIALLY_SIGNED'
    else 'READY_FOR_SIGNATURE'
  end;
  event_type := case when next_state = 'SIGNED' then 'APPLICATION_SIGNED' else 'SIGNATURE_RECORDED' end;

  update public.commercial_applications
  set previous_lifecycle_state = lifecycle_state,
      lifecycle_state = next_state,
      updated_at = now()
  where id = app.id;

  event_ref := 'application-event:' || gen_random_uuid()::text;
  insert into public.application_events (
    application_id,advisor_id,event_reference,event_type,version_reference,
    lifecycle_state,previous_lifecycle_state,occurred_at,source_reference,
    evidence_references,idempotency_key,confirmation_reference,event_digest,
    command_digest
  ) values (
    app.id,actor_id,event_ref,event_type,p_version_reference,next_state,
    app.lifecycle_state,p_signed_at,p_signature_reference,p_evidence_references,
    p_idempotency_key || ':event',p_confirmation_reference,command_digest,
    command_digest
  );

  return jsonb_build_object(
    'status','CONFIRMED',
    'signatureReference',evidence.signature_reference,
    'lifecycleState',next_state,
    'eventReference',event_ref,
    'idempotentReplay',false,
    'policyCreated',false
  );
end;
$$;

create or replace function public.forge_crs06_submit_application(
  p_application_reference text,
  p_submission_reference text,
  p_source_evidence_references jsonb,
  p_occurred_at timestamptz,
  p_idempotency_key text,
  p_confirmation_reference text
)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  actor_id uuid := auth.uid();
  app public.commercial_applications%rowtype;
  v public.application_versions%rowtype;
  existing public.application_events%rowtype;
  event_ref text;
  command_digest text;
begin
  if actor_id is null then raise exception 'CRS06_AUTH_REQUIRED'; end if;
  if coalesce(p_confirmation_reference,'') = '' then raise exception 'CRS06_HUMAN_CONFIRMATION_REQUIRED'; end if;
  if not public.forge_crs06_valid_reference_array(p_source_evidence_references) then raise exception 'CRS06_EVIDENCE_INVALID'; end if;

  command_digest := public.forge_crs06_event_digest(jsonb_build_object(
    'operation','SUBMIT_APPLICATION',
    'applicationReference',p_application_reference,
    'submissionReference',p_submission_reference,
    'sourceEvidenceReferences',p_source_evidence_references,
    'occurredAt',p_occurred_at,
    'idempotencyKey',p_idempotency_key,
    'confirmationReference',p_confirmation_reference
  ));

  select * into app
  from public.commercial_applications
  where advisor_id = actor_id and application_reference = p_application_reference
  for update;
  if not found then raise exception 'CRS06_APPLICATION_REQUIRED'; end if;

  select * into existing
  from public.application_events
  where advisor_id = actor_id and application_id = app.id and idempotency_key = p_idempotency_key;
  if found then
    if existing.command_digest <> command_digest then raise exception 'CRS06_IDEMPOTENCY_CONFLICT'; end if;
    return jsonb_build_object(
      'status','IDEMPOTENT_REPLAY',
      'applicationReference',app.application_reference,
      'eventReference',existing.event_reference,
      'idempotentReplay',true,
      'policyCreated',false
    );
  end if;

  if app.lifecycle_state <> 'SIGNED' then raise exception 'CRS06_SIGNED_APPLICATION_REQUIRED'; end if;
  select * into v
  from public.application_versions
  where advisor_id = actor_id and application_id = app.id and version_number = app.current_version;

  update public.commercial_applications
  set previous_lifecycle_state = lifecycle_state,
      lifecycle_state = 'SUBMITTED',
      updated_at = now()
  where id = app.id;

  event_ref := 'application-event:' || gen_random_uuid()::text;
  insert into public.application_events (
    application_id,advisor_id,event_reference,event_type,version_reference,
    lifecycle_state,previous_lifecycle_state,occurred_at,source_reference,
    evidence_references,idempotency_key,confirmation_reference,event_digest,
    command_digest
  ) values (
    app.id,actor_id,event_ref,'APPLICATION_SUBMITTED',v.version_reference,
    'SUBMITTED','SIGNED',p_occurred_at,p_submission_reference,
    p_source_evidence_references,p_idempotency_key,p_confirmation_reference,
    command_digest,command_digest
  );

  return jsonb_build_object(
    'status','CONFIRMED',
    'applicationReference',app.application_reference,
    'lifecycleState','SUBMITTED',
    'eventReference',event_ref,
    'idempotentReplay',false,
    'policyCreated',false,
    'issuanceEvidenceRequiredForPolicy',true
  );
end;
$$;

create or replace function public.forge_crs06_record_requirement(
  p_application_reference text,
  p_requirement_reference text,
  p_requirement_code text,
  p_state text,
  p_evidence_references jsonb,
  p_opened_at timestamptz,
  p_resolved_at timestamptz,
  p_review_reference text,
  p_idempotency_key text,
  p_confirmation_reference text,
  p_correction_of text default null
)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  actor_id uuid := auth.uid();
  app public.commercial_applications%rowtype;
  v public.application_versions%rowtype;
  correction_row public.application_requirements%rowtype;
  existing public.application_events%rowtype;
  event_ref text;
  event_type text;
  next_state text;
  event_evidence jsonb;
  command_digest text;
begin
  if actor_id is null then raise exception 'CRS06_AUTH_REQUIRED'; end if;
  if coalesce(p_confirmation_reference,'') = '' then raise exception 'CRS06_HUMAN_CONFIRMATION_REQUIRED'; end if;
  if p_state not in ('OPEN','SATISFIED','WAIVED','DISPUTED') then raise exception 'CRS06_REQUIREMENT_STATE_INVALID'; end if;
  if p_state in ('SATISFIED','WAIVED') and (
    p_resolved_at is null or coalesce(p_review_reference,'') = ''
    or not public.forge_crs06_valid_reference_array(p_evidence_references)
  ) then raise exception 'CRS06_REQUIREMENT_RESOLUTION_EVIDENCE_REQUIRED'; end if;
  if p_state = 'OPEN' and (p_resolved_at is not null or p_review_reference is not null) then raise exception 'CRS06_OPEN_REQUIREMENT_RESOLUTION_FORBIDDEN'; end if;

  command_digest := public.forge_crs06_event_digest(jsonb_build_object(
    'operation','RECORD_REQUIREMENT',
    'applicationReference',p_application_reference,
    'requirementReference',p_requirement_reference,
    'requirementCode',p_requirement_code,
    'state',p_state,
    'evidenceReferences',coalesce(p_evidence_references,'[]'::jsonb),
    'openedAt',p_opened_at,
    'resolvedAt',p_resolved_at,
    'reviewReference',p_review_reference,
    'idempotencyKey',p_idempotency_key,
    'confirmationReference',p_confirmation_reference,
    'correctionOf',p_correction_of
  ));

  select * into app
  from public.commercial_applications
  where advisor_id = actor_id and application_reference = p_application_reference
  for update;
  if not found then raise exception 'CRS06_APPLICATION_REQUIRED'; end if;
  if app.lifecycle_state not in ('SUBMITTED','REQUIREMENTS_PENDING','REQUIREMENTS_SATISFIED') then raise exception 'CRS06_REQUIREMENT_STATE_TRANSITION_INVALID'; end if;

  select * into existing
  from public.application_events
  where advisor_id = actor_id and application_id = app.id and idempotency_key = p_idempotency_key;
  if found then
    if existing.command_digest <> command_digest then raise exception 'CRS06_IDEMPOTENCY_CONFLICT'; end if;
    return jsonb_build_object(
      'status','IDEMPOTENT_REPLAY',
      'requirementReference',p_requirement_reference,
      'eventReference',existing.event_reference,
      'idempotentReplay',true
    );
  end if;

  correction_row.id := null;
  if p_correction_of is not null then
    select * into correction_row
    from public.application_requirements
    where advisor_id = actor_id
      and application_id = app.id
      and requirement_reference = p_correction_of;
    if not found then raise exception 'CRS06_REQUIREMENT_CORRECTION_REQUIRED'; end if;
  end if;

  insert into public.application_requirements (
    application_id,advisor_id,requirement_reference,requirement_code,state,
    evidence_references,opened_at,resolved_at,review_reference,correction_of,updated_at
  ) values (
    app.id,actor_id,p_requirement_reference,p_requirement_code,p_state,
    coalesce(p_evidence_references,'[]'::jsonb),p_opened_at,p_resolved_at,
    p_review_reference,correction_row.id,now()
  ) on conflict (advisor_id,application_id,requirement_reference) do update set
    requirement_code = excluded.requirement_code,
    state = excluded.state,
    evidence_references = excluded.evidence_references,
    resolved_at = excluded.resolved_at,
    review_reference = excluded.review_reference,
    correction_of = excluded.correction_of,
    updated_at = now();

  event_type := case p_state
    when 'OPEN' then 'REQUIREMENT_OPENED'
    when 'SATISFIED' then 'REQUIREMENT_SATISFIED'
    when 'WAIVED' then 'REQUIREMENT_WAIVED'
    else 'REQUIREMENT_DISPUTED'
  end;
  next_state := case
    when p_state in ('OPEN','DISPUTED') then 'REQUIREMENTS_PENDING'
    when exists (
      select 1 from public.application_requirements
      where application_id = app.id and advisor_id = actor_id and state in ('OPEN','DISPUTED')
    ) then 'REQUIREMENTS_PENDING'
    else 'REQUIREMENTS_SATISFIED'
  end;

  update public.commercial_applications
  set previous_lifecycle_state = lifecycle_state,
      lifecycle_state = next_state,
      updated_at = now()
  where id = app.id;

  select * into v
  from public.application_versions
  where advisor_id = actor_id and application_id = app.id and version_number = app.current_version;

  event_evidence := case
    when public.forge_crs06_valid_reference_array(p_evidence_references) then p_evidence_references
    else jsonb_build_array(p_requirement_reference)
  end;
  event_ref := 'application-event:' || gen_random_uuid()::text;
  insert into public.application_events (
    application_id,advisor_id,event_reference,event_type,version_reference,
    lifecycle_state,previous_lifecycle_state,occurred_at,source_reference,
    evidence_references,idempotency_key,confirmation_reference,event_digest,
    command_digest
  ) values (
    app.id,actor_id,event_ref,event_type,v.version_reference,next_state,
    app.lifecycle_state,coalesce(p_resolved_at,p_opened_at),p_requirement_reference,
    event_evidence,p_idempotency_key,p_confirmation_reference,command_digest,
    command_digest
  );

  return jsonb_build_object(
    'status','CONFIRMED',
    'requirementReference',p_requirement_reference,
    'lifecycleState',next_state,
    'eventReference',event_ref,
    'idempotentReplay',false
  );
end;
$$;

create or replace function public.forge_crs06_record_decision(
  p_application_reference text,
  p_decision text,
  p_decision_reference text,
  p_source_evidence_references jsonb,
  p_occurred_at timestamptz,
  p_idempotency_key text,
  p_confirmation_reference text
)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  actor_id uuid := auth.uid();
  app public.commercial_applications%rowtype;
  v public.application_versions%rowtype;
  existing public.application_events%rowtype;
  event_ref text;
  event_type text;
  command_digest text;
begin
  if actor_id is null then raise exception 'CRS06_AUTH_REQUIRED'; end if;
  if coalesce(p_confirmation_reference,'') = '' then raise exception 'CRS06_HUMAN_CONFIRMATION_REQUIRED'; end if;
  if p_decision not in ('APPROVED','DECLINED') then raise exception 'CRS06_DECISION_INVALID'; end if;
  if not public.forge_crs06_valid_reference_array(p_source_evidence_references) then raise exception 'CRS06_EVIDENCE_INVALID'; end if;

  command_digest := public.forge_crs06_event_digest(jsonb_build_object(
    'operation','RECORD_DECISION',
    'applicationReference',p_application_reference,
    'decision',p_decision,
    'decisionReference',p_decision_reference,
    'sourceEvidenceReferences',p_source_evidence_references,
    'occurredAt',p_occurred_at,
    'idempotencyKey',p_idempotency_key,
    'confirmationReference',p_confirmation_reference
  ));

  select * into app
  from public.commercial_applications
  where advisor_id = actor_id and application_reference = p_application_reference
  for update;
  if not found then raise exception 'CRS06_APPLICATION_REQUIRED'; end if;

  select * into existing
  from public.application_events
  where advisor_id = actor_id and application_id = app.id and idempotency_key = p_idempotency_key;
  if found then
    if existing.command_digest <> command_digest then raise exception 'CRS06_IDEMPOTENCY_CONFLICT'; end if;
    return jsonb_build_object(
      'status','IDEMPOTENT_REPLAY',
      'applicationReference',app.application_reference,
      'eventReference',existing.event_reference,
      'idempotentReplay',true,
      'policyCreated',false,
      'issuanceEvidenceRequiredForPolicy',true
    );
  end if;

  if p_decision = 'APPROVED' and app.lifecycle_state not in ('SUBMITTED','REQUIREMENTS_SATISFIED') then
    raise exception 'CRS06_APPROVAL_STATE_INVALID';
  end if;
  if p_decision = 'DECLINED' and app.lifecycle_state not in ('SUBMITTED','REQUIREMENTS_PENDING','REQUIREMENTS_SATISFIED') then
    raise exception 'CRS06_DECLINE_STATE_INVALID';
  end if;
  if p_decision = 'APPROVED' and exists (
    select 1 from public.application_requirements
    where application_id = app.id and advisor_id = actor_id and state in ('OPEN','DISPUTED')
  ) then raise exception 'CRS06_UNRESOLVED_REQUIREMENTS_BLOCK_APPROVAL'; end if;

  update public.commercial_applications
  set previous_lifecycle_state = lifecycle_state,
      lifecycle_state = p_decision,
      updated_at = now()
  where id = app.id;

  select * into v
  from public.application_versions
  where advisor_id = actor_id and application_id = app.id and version_number = app.current_version;
  event_type := case when p_decision = 'APPROVED' then 'APPLICATION_APPROVED' else 'APPLICATION_DECLINED' end;
  event_ref := 'application-event:' || gen_random_uuid()::text;

  insert into public.application_events (
    application_id,advisor_id,event_reference,event_type,version_reference,
    lifecycle_state,previous_lifecycle_state,occurred_at,source_reference,
    evidence_references,idempotency_key,confirmation_reference,event_digest,
    command_digest
  ) values (
    app.id,actor_id,event_ref,event_type,v.version_reference,p_decision,
    app.lifecycle_state,p_occurred_at,p_decision_reference,
    p_source_evidence_references,p_idempotency_key,p_confirmation_reference,
    command_digest,command_digest
  );

  return jsonb_build_object(
    'status','CONFIRMED',
    'applicationReference',app.application_reference,
    'lifecycleState',p_decision,
    'eventReference',event_ref,
    'idempotentReplay',false,
    'policyCreated',false,
    'issuanceEvidenceRequiredForPolicy',true
  );
end;
$$;

revoke execute on function public.forge_crs06_create_application(text,text,text,text,text,text,text,jsonb,jsonb,timestamptz,text,text) from public, anon;
revoke execute on function public.forge_crs06_add_application_version(text,text,text,jsonb,timestamptz,text,text,text) from public, anon;
revoke execute on function public.forge_crs06_record_signature_evidence(text,text,text,text,text,text,text,timestamptz,timestamptz,jsonb,text,text,text,text,text) from public, anon;
revoke execute on function public.forge_crs06_submit_application(text,text,jsonb,timestamptz,text,text) from public, anon;
revoke execute on function public.forge_crs06_record_requirement(text,text,text,text,jsonb,timestamptz,timestamptz,text,text,text,text) from public, anon;
revoke execute on function public.forge_crs06_record_decision(text,text,text,jsonb,timestamptz,text,text) from public, anon;

grant execute on function public.forge_crs06_create_application(text,text,text,text,text,text,text,jsonb,jsonb,timestamptz,text,text) to authenticated;
grant execute on function public.forge_crs06_add_application_version(text,text,text,jsonb,timestamptz,text,text,text) to authenticated;
grant execute on function public.forge_crs06_record_signature_evidence(text,text,text,text,text,text,text,timestamptz,timestamptz,jsonb,text,text,text,text,text) to authenticated;
grant execute on function public.forge_crs06_submit_application(text,text,jsonb,timestamptz,text,text) to authenticated;
grant execute on function public.forge_crs06_record_requirement(text,text,text,text,jsonb,timestamptz,timestamptz,text,text,text,text) to authenticated;
grant execute on function public.forge_crs06_record_decision(text,text,text,jsonb,timestamptz,text,text) to authenticated;

commit;
