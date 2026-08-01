-- CARTERA-001B idempotency and replay conflict hardening
-- Repository implementation only. Remote deployment requires a separate explicit gate.

begin;

create or replace function public.forge_cartera001b_confirm_reviewed_quote(
  p_prospect_id uuid,
  p_product_reference text,
  p_review_snapshot jsonb,
  p_source_record_reference text,
  p_source_evidence_references jsonb,
  p_freshness_metadata jsonb,
  p_occurred_at timestamptz,
  p_idempotency_key text
)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  actor_id uuid := auth.uid();
  existing_event public.quote_lifecycle_events%rowtype;
  quote_row public.quote_lifecycle_quotes%rowtype;
  version_row public.quote_lifecycle_versions%rowtype;
  created_event_id text;
  reviewed_event_id text;
  snapshot_hash text;
  event_hash text;
  now_at timestamptz := now();
  persistence_receipt text;
  replay_event_ids jsonb;
begin
  if actor_id is null then
    raise exception 'CARTERA001B_AUTH_REQUIRED';
  end if;
  if p_prospect_id is null then
    raise exception 'CARTERA001B_IDENTITY_REQUIRED';
  end if;
  if not exists (
    select 1 from public.prospects p
    where p.id = p_prospect_id and p.advisor_id = actor_id
  ) then
    raise exception 'CARTERA001B_PROSPECT_NOT_OWNED';
  end if;
  if p_product_reference is null
     or p_product_reference !~ '^[A-Za-z0-9][A-Za-z0-9._:@/-]{0,159}$' then
    raise exception 'CARTERA001B_PRODUCT_REFERENCE_INVALID';
  end if;
  if p_review_snapshot is null
     or jsonb_typeof(p_review_snapshot) <> 'object' then
    raise exception 'CARTERA001B_REVIEW_SNAPSHOT_INVALID';
  end if;
  if public.forge_cartera001b_json_has_forbidden_key(p_review_snapshot) then
    raise exception 'CARTERA001B_FORBIDDEN_REVIEW_KEY';
  end if;
  if coalesce(p_review_snapshot->>'reviewOnly','') <> 'true'
     or coalesce(p_review_snapshot->'authority'->>'finalAuthority','') <> 'HUMAN' then
    raise exception 'CARTERA001B_REVIEW_SNAPSHOT_INVALID';
  end if;
  if p_source_record_reference is null
     or p_source_record_reference !~ '^[A-Za-z0-9][A-Za-z0-9._:@/-]{0,159}$' then
    raise exception 'CARTERA001B_SOURCE_REFERENCE_INVALID';
  end if;
  if not public.forge_cartera001b_valid_reference_array(p_source_evidence_references) then
    raise exception 'CARTERA001B_EVIDENCE_INVALID';
  end if;
  if p_freshness_metadata is null
     or jsonb_typeof(p_freshness_metadata) <> 'object'
     or coalesce(p_freshness_metadata->>'status','') = '' then
    raise exception 'CARTERA001B_FRESHNESS_INVALID';
  end if;
  if p_occurred_at is null or p_occurred_at > now_at + interval '5 minutes' then
    raise exception 'CARTERA001B_OCCURRED_AT_INVALID';
  end if;
  if p_idempotency_key is null
     or p_idempotency_key !~ '^[A-Za-z0-9][A-Za-z0-9._:@/-]{0,239}$' then
    raise exception 'CARTERA001B_IDEMPOTENCY_INVALID';
  end if;

  snapshot_hash := encode(
    digest(convert_to(p_review_snapshot::text, 'UTF8'), 'sha256'),
    'hex'
  );

  select * into existing_event
  from public.quote_lifecycle_events
  where advisor_id = actor_id
    and idempotency_key = p_idempotency_key || ':quote_review_confirmed'
  limit 1;

  if found then
    select * into quote_row
    from public.quote_lifecycle_quotes
    where id = existing_event.quote_id and advisor_id = actor_id;

    select * into version_row
    from public.quote_lifecycle_versions
    where id = existing_event.quote_version_id and advisor_id = actor_id;

    if existing_event.prospect_id <> p_prospect_id
       or existing_event.snapshot_digest <> snapshot_hash
       or existing_event.payload->>'productReference' <> p_product_reference
       or existing_event.source_record_reference <> p_source_record_reference
       or existing_event.evidence_references <> p_source_evidence_references
       or coalesce(existing_event.freshness_metadata->>'status','')
          <> coalesce(p_freshness_metadata->>'status','')
       or coalesce(existing_event.freshness_metadata->>'source','')
          <> coalesce(p_freshness_metadata->>'source','') then
      raise exception 'CARTERA001B_EVENT_CONFLICT';
    end if;

    select coalesce(jsonb_agg(e.event_id order by e.recorded_at, e.event_id), '[]'::jsonb)
    into replay_event_ids
    from public.quote_lifecycle_events e
    where e.advisor_id = actor_id
      and e.quote_id = quote_row.id
      and e.idempotency_key in (
        p_idempotency_key || ':quote_created',
        p_idempotency_key || ':quote_review_confirmed'
      );

    return jsonb_build_object(
      'quoteReference', quote_row.quote_reference,
      'quoteVersionReference', version_row.quote_version_reference,
      'prospectReference', quote_row.prospect_id,
      'productReference', quote_row.product_reference,
      'lifecycleState', quote_row.lifecycle_state,
      'eventIds', replay_event_ids,
      'persistenceReceipt', 'quote-persist:' || quote_row.id::text,
      'snapshotDigest', version_row.snapshot_digest,
      'idempotentReplay', true
    );
  end if;

  insert into public.quote_lifecycle_quotes (
    quote_reference,
    advisor_id,
    prospect_id,
    product_reference,
    current_version,
    lifecycle_state,
    created_at,
    updated_at
  ) values (
    'quote:' || gen_random_uuid()::text,
    actor_id,
    p_prospect_id,
    p_product_reference,
    1,
    'REVIEWED',
    now_at,
    now_at
  ) returning * into quote_row;

  insert into public.quote_lifecycle_versions (
    quote_id,
    advisor_id,
    quote_version_reference,
    version_number,
    review_snapshot,
    snapshot_digest,
    source_record_reference,
    source_evidence_references,
    freshness_metadata,
    confirmation_state,
    created_at
  ) values (
    quote_row.id,
    actor_id,
    'quote-version:' || gen_random_uuid()::text,
    1,
    p_review_snapshot,
    snapshot_hash,
    p_source_record_reference,
    p_source_evidence_references,
    p_freshness_metadata,
    'CONFIRMED',
    now_at
  ) returning * into version_row;

  created_event_id := 'quote-event:' || gen_random_uuid()::text;
  event_hash := encode(digest(convert_to(jsonb_build_object(
    'eventId', created_event_id,
    'eventType', 'QUOTE_CREATED',
    'quoteReference', quote_row.quote_reference,
    'quoteVersionReference', version_row.quote_version_reference,
    'prospectReference', p_prospect_id,
    'lifecycleState', 'DRAFT',
    'occurredAt', p_occurred_at,
    'snapshotDigest', snapshot_hash
  )::text, 'UTF8'), 'sha256'), 'hex');

  insert into public.quote_lifecycle_events (
    event_id, advisor_id, quote_id, quote_version_id, prospect_id,
    event_type, lifecycle_state, previous_lifecycle_state,
    occurred_at, recorded_at, source_record_reference, idempotency_key,
    payload, evidence_references, freshness_metadata, snapshot_digest,
    confirmation_state, event_digest
  ) values (
    created_event_id, actor_id, quote_row.id, version_row.id, p_prospect_id,
    'QUOTE_CREATED', 'DRAFT', null,
    p_occurred_at, now_at, p_source_record_reference,
    p_idempotency_key || ':quote_created',
    jsonb_build_object(
      'quoteReference', quote_row.quote_reference,
      'quoteVersionReference', version_row.quote_version_reference,
      'prospectReference', p_prospect_id,
      'productReference', p_product_reference,
      'lifecycleState', 'DRAFT'
    ),
    p_source_evidence_references, p_freshness_metadata, snapshot_hash,
    'CONFIRMED', event_hash
  );

  reviewed_event_id := 'quote-event:' || gen_random_uuid()::text;
  event_hash := encode(digest(convert_to(jsonb_build_object(
    'eventId', reviewed_event_id,
    'eventType', 'QUOTE_REVIEW_CONFIRMED',
    'quoteReference', quote_row.quote_reference,
    'quoteVersionReference', version_row.quote_version_reference,
    'prospectReference', p_prospect_id,
    'lifecycleState', 'REVIEWED',
    'occurredAt', p_occurred_at,
    'snapshotDigest', snapshot_hash
  )::text, 'UTF8'), 'sha256'), 'hex');

  insert into public.quote_lifecycle_events (
    event_id, advisor_id, quote_id, quote_version_id, prospect_id,
    event_type, lifecycle_state, previous_lifecycle_state,
    occurred_at, recorded_at, source_record_reference, idempotency_key,
    payload, evidence_references, freshness_metadata, snapshot_digest,
    confirmation_state, event_digest
  ) values (
    reviewed_event_id, actor_id, quote_row.id, version_row.id, p_prospect_id,
    'QUOTE_REVIEW_CONFIRMED', 'REVIEWED', 'DRAFT',
    p_occurred_at, now_at, p_source_record_reference,
    p_idempotency_key || ':quote_review_confirmed',
    jsonb_build_object(
      'quoteReference', quote_row.quote_reference,
      'quoteVersionReference', version_row.quote_version_reference,
      'prospectReference', p_prospect_id,
      'productReference', p_product_reference,
      'lifecycleState', 'REVIEWED',
      'previousLifecycleState', 'DRAFT'
    ),
    p_source_evidence_references, p_freshness_metadata, snapshot_hash,
    'CONFIRMED', event_hash
  );

  persistence_receipt := 'quote-persist:' || quote_row.id::text;

  return jsonb_build_object(
    'quoteReference', quote_row.quote_reference,
    'quoteVersionReference', version_row.quote_version_reference,
    'prospectReference', quote_row.prospect_id,
    'productReference', quote_row.product_reference,
    'lifecycleState', quote_row.lifecycle_state,
    'eventIds', jsonb_build_array(created_event_id, reviewed_event_id),
    'persistenceReceipt', persistence_receipt,
    'snapshotDigest', snapshot_hash,
    'idempotentReplay', false
  );
end;
$$;

create or replace function public.forge_cartera001b_append_quote_lifecycle_event(
  p_quote_reference text,
  p_quote_version_reference text,
  p_event_type text,
  p_occurred_at timestamptz,
  p_source_record_reference text,
  p_evidence_references jsonb,
  p_decision_reason_code text default null,
  p_application_reference text default null,
  p_idempotency_key text default null,
  p_correction_of text default null
)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  actor_id uuid := auth.uid();
  quote_row public.quote_lifecycle_quotes%rowtype;
  version_row public.quote_lifecycle_versions%rowtype;
  existing_event public.quote_lifecycle_events%rowtype;
  corrected_event public.quote_lifecycle_events%rowtype;
  next_state text;
  previous_state text;
  quote_event_id text;
  timeline_event public.prospect_timeline_events%rowtype;
  event_hash text;
  event_payload jsonb;
  evidence jsonb;
begin
  if actor_id is null then raise exception 'CARTERA001B_AUTH_REQUIRED'; end if;
  if p_event_type in ('QUOTE_UPDATED','QUOTE_RECALCULATED') then
    raise exception 'CARTERA001B_VERSION_COMMAND_REQUIRED';
  end if;
  if p_event_type = 'QUOTE_CONVERTED_TO_APPLICATION' then
    raise exception 'CARTERA001B_APPLICATION_AUTHORITY_REQUIRED';
  end if;
  if p_event_type not in (
    'QUOTE_PRESENTED','QUOTE_PROSPECT_ACCEPTED','QUOTE_PROSPECT_REJECTED'
  ) then
    raise exception 'CARTERA001B_EVENT_TYPE_INVALID';
  end if;
  if p_occurred_at is null or p_occurred_at > now() + interval '5 minutes' then
    raise exception 'CARTERA001B_OCCURRED_AT_INVALID';
  end if;
  if p_source_record_reference is null
     or p_source_record_reference !~ '^[A-Za-z0-9][A-Za-z0-9._:@/-]{0,159}$' then
    raise exception 'CARTERA001B_SOURCE_REFERENCE_INVALID';
  end if;
  if not public.forge_cartera001b_valid_reference_array(p_evidence_references) then
    raise exception 'CARTERA001B_EVIDENCE_INVALID';
  end if;
  if p_idempotency_key is null
     or p_idempotency_key !~ '^[A-Za-z0-9][A-Za-z0-9._:@/-]{0,239}$' then
    raise exception 'CARTERA001B_IDEMPOTENCY_INVALID';
  end if;
  if p_decision_reason_code is not null
     and p_decision_reason_code !~ '^[A-Za-z0-9][A-Za-z0-9._:@/-]{0,79}$' then
    raise exception 'CARTERA001B_DECISION_REASON_INVALID';
  end if;

  select * into quote_row
  from public.quote_lifecycle_quotes
  where advisor_id = actor_id and quote_reference = p_quote_reference;
  if not found then raise exception 'CARTERA001B_QUOTE_NOT_OWNED'; end if;

  select * into version_row
  from public.quote_lifecycle_versions
  where advisor_id = actor_id
    and quote_id = quote_row.id
    and quote_version_reference = p_quote_version_reference;
  if not found then raise exception 'CARTERA001B_QUOTE_VERSION_NOT_FOUND'; end if;

  if p_correction_of is not null then
    select * into corrected_event
    from public.quote_lifecycle_events
    where event_id = p_correction_of
      and advisor_id = actor_id
      and quote_id = quote_row.id;
    if not found then raise exception 'CARTERA001B_CORRECTION_TARGET_NOT_FOUND'; end if;
    if corrected_event.event_type <> p_event_type then
      raise exception 'CARTERA001B_CORRECTION_TYPE_MISMATCH';
    end if;
  end if;

  select * into existing_event
  from public.quote_lifecycle_events
  where advisor_id = actor_id
    and quote_id = quote_row.id
    and idempotency_key = p_idempotency_key;

  if found then
    if existing_event.event_type <> p_event_type
       or existing_event.quote_version_id <> version_row.id
       or coalesce(existing_event.correction_of,'') <> coalesce(p_correction_of,'')
       or existing_event.source_record_reference <> p_source_record_reference
       or existing_event.evidence_references <> p_evidence_references
       or coalesce(existing_event.payload->>'decisionReasonCode','')
          <> coalesce(nullif(p_decision_reason_code,''),'') then
      raise exception 'CARTERA001B_EVENT_CONFLICT';
    end if;

    return jsonb_build_object(
      'eventId', existing_event.event_id,
      'quoteReference', quote_row.quote_reference,
      'quoteVersionReference', version_row.quote_version_reference,
      'prospectReference', quote_row.prospect_id,
      'lifecycleState', existing_event.lifecycle_state,
      'prospectTimelineEventId', existing_event.prospect_timeline_event_id,
      'idempotentReplay', true
    );
  end if;

  if p_correction_of is not null then
    if quote_row.lifecycle_state <> corrected_event.lifecycle_state then
      raise exception 'CARTERA001B_STATE_TRANSITION_INVALID';
    end if;
    previous_state := corrected_event.previous_lifecycle_state;
  else
    if p_event_type = 'QUOTE_PRESENTED'
       and quote_row.lifecycle_state not in ('REVIEWED','PRESENTED') then
      raise exception 'CARTERA001B_STATE_TRANSITION_INVALID';
    end if;
    if p_event_type in ('QUOTE_PROSPECT_ACCEPTED','QUOTE_PROSPECT_REJECTED')
       and quote_row.lifecycle_state <> 'PRESENTED' then
      raise exception 'CARTERA001B_STATE_TRANSITION_INVALID';
    end if;
    previous_state := quote_row.lifecycle_state;
  end if;

  next_state := case p_event_type
    when 'QUOTE_PRESENTED' then 'PRESENTED'
    when 'QUOTE_PROSPECT_ACCEPTED' then 'PROSPECT_ACCEPTED'
    when 'QUOTE_PROSPECT_REJECTED' then 'PROSPECT_REJECTED'
  end;

  quote_event_id := 'quote-event:' || gen_random_uuid()::text;

  if p_event_type = 'QUOTE_PRESENTED' then
    timeline_event := public.forge_nfast08_append_prospect_timeline_event(
      quote_row.prospect_id,
      'PROPOSAL_PRESENTED',
      p_occurred_at,
      quote_event_id,
      jsonb_build_object(
        'productReference', quote_row.product_reference,
        'quoteReference', quote_row.quote_reference
      ),
      p_evidence_references,
      'quote-projection:' || replace(quote_event_id, ':', '-')
    );
  else
    timeline_event := public.forge_nfast08_append_prospect_timeline_event(
      quote_row.prospect_id,
      'DECISION_RECORDED',
      p_occurred_at,
      quote_event_id,
      jsonb_strip_nulls(jsonb_build_object(
        'decisionCode', case p_event_type
          when 'QUOTE_PROSPECT_ACCEPTED' then 'QUOTE_ACCEPTED'
          else 'QUOTE_REJECTED'
        end,
        'reasonCode', nullif(p_decision_reason_code, '')
      )),
      p_evidence_references,
      'quote-projection:' || replace(quote_event_id, ':', '-')
    );
  end if;

  evidence := version_row.freshness_metadata;
  event_payload := jsonb_strip_nulls(jsonb_build_object(
    'quoteReference', quote_row.quote_reference,
    'quoteVersionReference', version_row.quote_version_reference,
    'prospectReference', quote_row.prospect_id,
    'productReference', quote_row.product_reference,
    'lifecycleState', next_state,
    'previousLifecycleState', previous_state,
    'decisionReasonCode', nullif(p_decision_reason_code, '')
  ));

  event_hash := encode(digest(convert_to(jsonb_build_object(
    'eventId', quote_event_id,
    'eventType', p_event_type,
    'payload', event_payload,
    'occurredAt', p_occurred_at,
    'snapshotDigest', version_row.snapshot_digest
  )::text, 'UTF8'), 'sha256'), 'hex');

  insert into public.quote_lifecycle_events (
    event_id, advisor_id, quote_id, quote_version_id, prospect_id,
    event_type, lifecycle_state, previous_lifecycle_state,
    occurred_at, source_record_reference, idempotency_key,
    payload, evidence_references, freshness_metadata, snapshot_digest,
    confirmation_state, correction_of, event_digest, prospect_timeline_event_id
  ) values (
    quote_event_id, actor_id, quote_row.id, version_row.id, quote_row.prospect_id,
    p_event_type, next_state, previous_state,
    p_occurred_at, p_source_record_reference, p_idempotency_key,
    event_payload, p_evidence_references, evidence, version_row.snapshot_digest,
    'CONFIRMED', p_correction_of, event_hash, timeline_event.id
  );

  update public.quote_lifecycle_quotes
  set lifecycle_state = next_state, updated_at = now()
  where id = quote_row.id and advisor_id = actor_id;

  return jsonb_build_object(
    'eventId', quote_event_id,
    'quoteReference', quote_row.quote_reference,
    'quoteVersionReference', version_row.quote_version_reference,
    'prospectReference', quote_row.prospect_id,
    'lifecycleState', next_state,
    'prospectTimelineEventId', timeline_event.id,
    'idempotentReplay', false
  );
end;
$$;

commit;
