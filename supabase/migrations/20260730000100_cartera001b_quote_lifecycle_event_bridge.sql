-- CARTERA-001B Quote Lifecycle Event Bridge
-- Repository implementation only. Remote deployment requires a separate explicit gate.

begin;

create extension if not exists pgcrypto;

create or replace function public.forge_cartera001b_json_has_forbidden_key(
  p_value jsonb
)
returns boolean
language plpgsql
immutable
set search_path = public, pg_temp
as $$
declare
  item_key text;
  item_value jsonb;
  normalized_key text;
begin
  if p_value is null then
    return false;
  end if;

  if jsonb_typeof(p_value) = 'object' then
    for item_key, item_value in select key, value from jsonb_each(p_value)
    loop
      normalized_key := regexp_replace(lower(item_key), '[^a-z0-9]', '', 'g');
      if normalized_key = any(array[
        'rawpdf','pdfbytes','arraybuffer','base64','binary','blob','dataurl',
        'rawtext','transcript','prompt','systemprompt','providerpayload',
        'providerresponse','password','secret','authtoken','accesstoken',
        'refreshtoken'
      ]) then
        return true;
      end if;
      if public.forge_cartera001b_json_has_forbidden_key(item_value) then
        return true;
      end if;
    end loop;
  elsif jsonb_typeof(p_value) = 'array' then
    for item_value in select value from jsonb_array_elements(p_value)
    loop
      if public.forge_cartera001b_json_has_forbidden_key(item_value) then
        return true;
      end if;
    end loop;
  end if;

  return false;
end;
$$;

create or replace function public.forge_cartera001b_valid_reference_array(
  p_value jsonb
)
returns boolean
language plpgsql
immutable
set search_path = public, pg_temp
as $$
declare
  item text;
begin
  if p_value is null
     or jsonb_typeof(p_value) <> 'array'
     or jsonb_array_length(p_value) < 1
     or jsonb_array_length(p_value) > 20 then
    return false;
  end if;

  for item in select value from jsonb_array_elements_text(p_value)
  loop
    if item !~ '^[A-Za-z0-9][A-Za-z0-9._:@/-]{0,239}$' then
      return false;
    end if;
  end loop;

  return (
    select count(*) = count(distinct value)
    from jsonb_array_elements_text(p_value)
  );
end;
$$;

create table if not exists public.quote_lifecycle_quotes (
  id uuid primary key default gen_random_uuid(),
  quote_reference text not null,
  advisor_id uuid not null references auth.users(id) on delete restrict,
  prospect_id uuid not null references public.prospects(id) on delete restrict,
  product_reference text not null,
  current_version integer not null default 1 check (current_version > 0),
  lifecycle_state text not null check (
    lifecycle_state in (
      'DRAFT','REVIEWED','PRESENTED','PROSPECT_ACCEPTED',
      'PROSPECT_REJECTED','CONVERTED_TO_APPLICATION'
    )
  ),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint quote_lifecycle_quotes_reference_ck check (
    quote_reference ~ '^quote:[0-9a-f-]{36}$'
  ),
  constraint quote_lifecycle_quotes_product_ck check (
    product_reference ~ '^[A-Za-z0-9][A-Za-z0-9._:@/-]{0,159}$'
  ),
  constraint quote_lifecycle_quotes_owner_reference_uq unique (
    advisor_id,
    quote_reference
  ),
  constraint quote_lifecycle_quotes_owner_id_uq unique (
    advisor_id,
    id
  )
);

create table if not exists public.quote_lifecycle_versions (
  id uuid primary key default gen_random_uuid(),
  quote_id uuid not null,
  advisor_id uuid not null references auth.users(id) on delete restrict,
  quote_version_reference text not null,
  version_number integer not null check (version_number > 0),
  review_snapshot jsonb not null,
  snapshot_digest text not null,
  source_record_reference text not null,
  source_evidence_references jsonb not null,
  freshness_metadata jsonb not null,
  confirmation_state text not null default 'CONFIRMED' check (
    confirmation_state in ('CONFIRMED','DISPUTED')
  ),
  created_at timestamptz not null default now(),
  constraint quote_lifecycle_versions_quote_fk
    foreign key (advisor_id, quote_id)
    references public.quote_lifecycle_quotes(advisor_id, id)
    on delete restrict,
  constraint quote_lifecycle_versions_reference_ck check (
    quote_version_reference ~ '^quote-version:[0-9a-f-]{36}$'
  ),
  constraint quote_lifecycle_versions_snapshot_object_ck check (
    jsonb_typeof(review_snapshot) = 'object'
  ),
  constraint quote_lifecycle_versions_snapshot_safe_ck check (
    not public.forge_cartera001b_json_has_forbidden_key(review_snapshot)
  ),
  constraint quote_lifecycle_versions_digest_ck check (
    snapshot_digest ~ '^[a-f0-9]{64}$'
  ),
  constraint quote_lifecycle_versions_source_reference_ck check (
    source_record_reference ~ '^[A-Za-z0-9][A-Za-z0-9._:@/-]{0,159}$'
  ),
  constraint quote_lifecycle_versions_evidence_ck check (
    public.forge_cartera001b_valid_reference_array(source_evidence_references)
  ),
  constraint quote_lifecycle_versions_freshness_ck check (
    jsonb_typeof(freshness_metadata) = 'object'
    and coalesce(freshness_metadata->>'status','') <> ''
  ),
  constraint quote_lifecycle_versions_number_uq unique (
    advisor_id,
    quote_id,
    version_number
  ),
  constraint quote_lifecycle_versions_reference_uq unique (
    advisor_id,
    quote_version_reference
  ),
  constraint quote_lifecycle_versions_owner_id_uq unique (
    advisor_id,
    id
  )
);

create table if not exists public.quote_lifecycle_events (
  event_id text primary key,
  advisor_id uuid not null references auth.users(id) on delete restrict,
  quote_id uuid not null,
  quote_version_id uuid not null,
  prospect_id uuid not null references public.prospects(id) on delete restrict,
  event_type text not null check (
    event_type in (
      'QUOTE_CREATED','QUOTE_UPDATED','QUOTE_RECALCULATED',
      'QUOTE_REVIEW_CONFIRMED','QUOTE_PRESENTED',
      'QUOTE_PROSPECT_ACCEPTED','QUOTE_PROSPECT_REJECTED',
      'QUOTE_CONVERTED_TO_APPLICATION'
    )
  ),
  lifecycle_state text not null check (
    lifecycle_state in (
      'DRAFT','REVIEWED','PRESENTED','PROSPECT_ACCEPTED',
      'PROSPECT_REJECTED','CONVERTED_TO_APPLICATION'
    )
  ),
  previous_lifecycle_state text,
  occurred_at timestamptz not null,
  recorded_at timestamptz not null default now(),
  source_record_reference text not null,
  idempotency_key text not null,
  payload jsonb not null,
  evidence_references jsonb not null,
  freshness_metadata jsonb not null,
  snapshot_digest text not null,
  confirmation_state text not null check (
    confirmation_state in ('CONFIRMED','DISPUTED')
  ),
  correction_of text,
  event_digest text not null,
  prospect_timeline_event_id uuid,
  contract_version text not null default 'CARTERA-001B.1',
  privacy_classification text not null default 'ADVISOR_PRIVATE_MINIMIZED',
  created_at timestamptz not null default now(),
  constraint quote_lifecycle_events_quote_fk
    foreign key (advisor_id, quote_id)
    references public.quote_lifecycle_quotes(advisor_id, id)
    on delete restrict,
  constraint quote_lifecycle_events_version_fk
    foreign key (advisor_id, quote_version_id)
    references public.quote_lifecycle_versions(advisor_id, id)
    on delete restrict,
  constraint quote_lifecycle_events_correction_fk
    foreign key (correction_of)
    references public.quote_lifecycle_events(event_id)
    on delete restrict,
  constraint quote_lifecycle_events_event_id_ck check (
    event_id ~ '^quote-event:[0-9a-f-]{36}$'
  ),
  constraint quote_lifecycle_events_source_reference_ck check (
    source_record_reference ~ '^[A-Za-z0-9][A-Za-z0-9._:@/-]{0,159}$'
  ),
  constraint quote_lifecycle_events_idempotency_ck check (
    idempotency_key ~ '^[A-Za-z0-9][A-Za-z0-9._:@/-]{0,239}$'
  ),
  constraint quote_lifecycle_events_payload_ck check (
    jsonb_typeof(payload) = 'object'
    and not public.forge_cartera001b_json_has_forbidden_key(payload)
  ),
  constraint quote_lifecycle_events_evidence_ck check (
    public.forge_cartera001b_valid_reference_array(evidence_references)
  ),
  constraint quote_lifecycle_events_freshness_ck check (
    jsonb_typeof(freshness_metadata) = 'object'
    and coalesce(freshness_metadata->>'status','') <> ''
  ),
  constraint quote_lifecycle_events_digest_ck check (
    event_digest ~ '^[a-f0-9]{64}$'
    and snapshot_digest ~ '^[a-f0-9]{64}$'
  ),
  constraint quote_lifecycle_events_time_ck check (
    recorded_at >= occurred_at
  ),
  constraint quote_lifecycle_events_contract_ck check (
    contract_version = 'CARTERA-001B.1'
  ),
  constraint quote_lifecycle_events_privacy_ck check (
    privacy_classification = 'ADVISOR_PRIVATE_MINIMIZED'
  ),
  constraint quote_lifecycle_events_owner_idempotency_uq unique (
    advisor_id,
    quote_id,
    idempotency_key
  )
);

create index if not exists quote_lifecycle_quotes_prospect_idx
  on public.quote_lifecycle_quotes(advisor_id, prospect_id, updated_at desc);
create index if not exists quote_lifecycle_versions_quote_idx
  on public.quote_lifecycle_versions(advisor_id, quote_id, version_number desc);
create index if not exists quote_lifecycle_events_prospect_idx
  on public.quote_lifecycle_events(advisor_id, prospect_id, occurred_at desc, recorded_at desc);
create index if not exists quote_lifecycle_events_quote_idx
  on public.quote_lifecycle_events(advisor_id, quote_id, occurred_at, event_id);

create or replace function public.forge_cartera001b_deny_append_only_mutation()
returns trigger
language plpgsql
set search_path = public, pg_temp
as $$
begin
  raise exception 'CARTERA001B_APPEND_ONLY_MUTATION_DENIED';
end;
$$;

drop trigger if exists forge_cartera001b_versions_append_only
  on public.quote_lifecycle_versions;
create trigger forge_cartera001b_versions_append_only
before update or delete on public.quote_lifecycle_versions
for each row execute function public.forge_cartera001b_deny_append_only_mutation();

drop trigger if exists forge_cartera001b_events_append_only
  on public.quote_lifecycle_events;
create trigger forge_cartera001b_events_append_only
before update or delete on public.quote_lifecycle_events
for each row execute function public.forge_cartera001b_deny_append_only_mutation();

alter table public.quote_lifecycle_quotes enable row level security;
alter table public.quote_lifecycle_quotes force row level security;
alter table public.quote_lifecycle_versions enable row level security;
alter table public.quote_lifecycle_versions force row level security;
alter table public.quote_lifecycle_events enable row level security;
alter table public.quote_lifecycle_events force row level security;

revoke all on public.quote_lifecycle_quotes from anon, authenticated;
revoke all on public.quote_lifecycle_versions from anon, authenticated;
revoke all on public.quote_lifecycle_events from anon, authenticated;

drop policy if exists quote_lifecycle_quotes_select_own
  on public.quote_lifecycle_quotes;
create policy quote_lifecycle_quotes_select_own
  on public.quote_lifecycle_quotes
  for select to authenticated
  using (advisor_id = auth.uid());

drop policy if exists quote_lifecycle_versions_select_own
  on public.quote_lifecycle_versions;
create policy quote_lifecycle_versions_select_own
  on public.quote_lifecycle_versions
  for select to authenticated
  using (advisor_id = auth.uid());

drop policy if exists quote_lifecycle_events_select_own
  on public.quote_lifecycle_events;
create policy quote_lifecycle_events_select_own
  on public.quote_lifecycle_events
  for select to authenticated
  using (advisor_id = auth.uid());

grant select on public.quote_lifecycle_quotes to authenticated;
grant select on public.quote_lifecycle_versions to authenticated;
grant select on public.quote_lifecycle_events to authenticated;

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
    if existing_event.prospect_id <> p_prospect_id
       or existing_event.snapshot_digest <> snapshot_hash
       or existing_event.payload->>'productReference' <> p_product_reference then
      raise exception 'CARTERA001B_EVENT_CONFLICT';
    end if;
    select * into quote_row from public.quote_lifecycle_quotes
      where id = existing_event.quote_id and advisor_id = actor_id;
    select * into version_row from public.quote_lifecycle_versions
      where id = existing_event.quote_version_id and advisor_id = actor_id;
    return jsonb_build_object(
      'quoteReference', quote_row.quote_reference,
      'quoteVersionReference', version_row.quote_version_reference,
      'prospectReference', quote_row.prospect_id,
      'productReference', quote_row.product_reference,
      'lifecycleState', quote_row.lifecycle_state,
      'eventIds', jsonb_build_array(existing_event.event_id),
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

  select * into quote_row from public.quote_lifecycle_quotes
  where advisor_id = actor_id and quote_reference = p_quote_reference;
  if not found then raise exception 'CARTERA001B_QUOTE_NOT_OWNED'; end if;

  select * into version_row from public.quote_lifecycle_versions
  where advisor_id = actor_id
    and quote_id = quote_row.id
    and quote_version_reference = p_quote_version_reference;
  if not found then raise exception 'CARTERA001B_QUOTE_VERSION_NOT_FOUND'; end if;

  if p_event_type = 'QUOTE_PRESENTED'
     and quote_row.lifecycle_state not in ('REVIEWED','PRESENTED') then
    raise exception 'CARTERA001B_STATE_TRANSITION_INVALID';
  end if;
  if p_event_type in ('QUOTE_PROSPECT_ACCEPTED','QUOTE_PROSPECT_REJECTED')
     and quote_row.lifecycle_state <> 'PRESENTED' then
    raise exception 'CARTERA001B_STATE_TRANSITION_INVALID';
  end if;

  if p_correction_of is not null then
    select * into corrected_event from public.quote_lifecycle_events
    where event_id = p_correction_of
      and advisor_id = actor_id
      and quote_id = quote_row.id;
    if not found then raise exception 'CARTERA001B_CORRECTION_TARGET_NOT_FOUND'; end if;
    if corrected_event.event_type <> p_event_type then
      raise exception 'CARTERA001B_CORRECTION_TYPE_MISMATCH';
    end if;
  end if;

  select * into existing_event from public.quote_lifecycle_events
  where advisor_id = actor_id
    and quote_id = quote_row.id
    and idempotency_key = p_idempotency_key;
  if found then
    if existing_event.event_type <> p_event_type
       or existing_event.quote_version_id <> version_row.id
       or coalesce(existing_event.correction_of,'') <> coalesce(p_correction_of,'') then
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
    'previousLifecycleState', quote_row.lifecycle_state,
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
    p_event_type, next_state, quote_row.lifecycle_state,
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

revoke all on function public.forge_cartera001b_confirm_reviewed_quote(
  uuid,text,jsonb,text,jsonb,jsonb,timestamptz,text
) from public, anon;
grant execute on function public.forge_cartera001b_confirm_reviewed_quote(
  uuid,text,jsonb,text,jsonb,jsonb,timestamptz,text
) to authenticated;

revoke all on function public.forge_cartera001b_append_quote_lifecycle_event(
  text,text,text,timestamptz,text,jsonb,text,text,text,text
) from public, anon;
grant execute on function public.forge_cartera001b_append_quote_lifecycle_event(
  text,text,text,timestamptz,text,jsonb,text,text,text,text
) to authenticated;

create or replace view public.quote_lifecycle_history
with (security_invoker = true)
as
select
  q.quote_reference,
  v.quote_version_reference,
  q.prospect_id,
  q.product_reference,
  e.lifecycle_state,
  e.event_id,
  e.event_type,
  e.occurred_at,
  e.recorded_at,
  e.evidence_references,
  e.freshness_metadata,
  e.confirmation_state,
  e.contract_version
from public.quote_lifecycle_events e
join public.quote_lifecycle_quotes q
  on q.id = e.quote_id and q.advisor_id = e.advisor_id
join public.quote_lifecycle_versions v
  on v.id = e.quote_version_id and v.advisor_id = e.advisor_id
where e.advisor_id = auth.uid();

grant select on public.quote_lifecycle_history to authenticated;

commit;
