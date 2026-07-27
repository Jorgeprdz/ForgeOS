begin;

create extension if not exists pgcrypto;

create sequence if not exists public.forge_fes02_activity_event_change_seq;

create table if not exists public.activity_event_ledger (
  event_id text primary key,
  tenant_id uuid not null references auth.users(id) on delete restrict,
  origin_mutation_id text not null unique,
  event_type text not null,
  schema_version text not null,
  event_digest text not null,
  idempotency_key text not null,
  subject_type text not null,
  subject_id text not null,
  occurred_at timestamptz not null,
  recorded_at timestamptz not null,
  privacy_class text not null,
  confirmation_state text not null,
  correction_of text,
  canonical_event jsonb not null,
  change_seq bigint not null
    default nextval('public.forge_fes02_activity_event_change_seq'),
  inserted_at timestamptz not null default now(),
  constraint activity_event_ledger_tenant_event_uq
    unique (tenant_id, event_id),
  constraint activity_event_ledger_mutation_event_uq
    unique (tenant_id, origin_mutation_id, event_id),
  constraint activity_event_ledger_event_id_ck check (
    event_id ~ '^[A-Za-z0-9._:@/-]{1,240}$'
  ),
  constraint activity_event_ledger_mutation_id_ck check (
    origin_mutation_id ~ '^[A-Za-z0-9._:@/-]{1,240}$'
  ),
  constraint activity_event_ledger_schema_ck check (
    schema_version = 'forge.activity_event.v1'
  ),
  constraint activity_event_ledger_digest_ck check (
    event_digest ~ '^[A-Za-z0-9._:@/-]{1,240}$'
  ),
  constraint activity_event_ledger_idempotency_ck check (
    idempotency_key ~ '^[A-Za-z0-9._:@/-]{1,240}$'
  ),
  constraint activity_event_ledger_subject_type_ck check (
    subject_type in ('PROSPECT', 'APPOINTMENT', 'ACTIVITY', 'DUE_ACTION')
  ),
  constraint activity_event_ledger_privacy_ck check (
    privacy_class in ('OPERATIONAL', 'PRIVATE', 'SENSITIVE', 'RESTRICTED')
  ),
  constraint activity_event_ledger_confirmation_ck check (
    confirmation_state in ('UNCONFIRMED', 'REPORTED', 'CONFIRMED', 'DISPUTED')
  ),
  constraint activity_event_ledger_time_ck check (
    recorded_at >= occurred_at
  ),
  constraint activity_event_ledger_event_object_ck check (
    jsonb_typeof(canonical_event) = 'object'
  ),
  constraint activity_event_ledger_event_identity_ck check (
    canonical_event->>'event_id' = event_id
    and canonical_event->>'tenant_id' = tenant_id::text
    and canonical_event->>'event_type' = event_type
    and canonical_event->>'schema_version' = schema_version
    and canonical_event->>'idempotency_key' = idempotency_key
    and canonical_event->'subject'->>'type' = subject_type
    and canonical_event->'subject'->>'id' = subject_id
    and canonical_event->>'privacy_class' = privacy_class
    and canonical_event->>'confirmation_state' = confirmation_state
  ),
  constraint activity_event_ledger_learning_disabled_ck check (
    canonical_event->'learning_eligibility' = 'false'::jsonb
  ),
  constraint activity_event_ledger_safety_flags_ck check (
    canonical_event->'safety_flags'->'executes_business_action' = 'false'::jsonb
    and canonical_event->'safety_flags'->'mutates_external_provider' = 'false'::jsonb
    and canonical_event->'safety_flags'->'promotes_ai_output_to_truth' = 'false'::jsonb
    and canonical_event->'safety_flags'->'cross_tenant_data' = 'false'::jsonb
    and canonical_event->'safety_flags'->'eligible_for_global_learning' = 'false'::jsonb
  ),
  constraint activity_event_ledger_correction_json_ck check (
    (
      correction_of is null
      and canonical_event->'correction_of' = 'null'::jsonb
    )
    or canonical_event->>'correction_of' = correction_of
  )
);

create table if not exists public.activity_event_evidence_references (
  tenant_id uuid not null references auth.users(id) on delete restrict,
  event_id text not null,
  reference_id text not null,
  reference_type text not null,
  source_system text not null,
  captured_at timestamptz not null,
  privacy_class text not null,
  checksum text not null,
  metadata jsonb not null default '{}'::jsonb,
  inserted_at timestamptz not null default now(),
  primary key (tenant_id, event_id, reference_id),
  constraint activity_event_evidence_event_fk
    foreign key (tenant_id, event_id)
    references public.activity_event_ledger (tenant_id, event_id)
    on delete restrict,
  constraint activity_event_evidence_reference_id_ck check (
    reference_id ~ '^[A-Za-z0-9._:@/-]{1,240}$'
  ),
  constraint activity_event_evidence_type_ck check (
    reference_type in (
      'DOCUMENT',
      'EXTERNAL_PROVIDER_EVENT',
      'CALL_LOG',
      'MESSAGE_HANDOFF',
      'USER_CONFIRMATION',
      'SYSTEM_OBSERVATION'
    )
  ),
  constraint activity_event_evidence_privacy_ck check (
    privacy_class in ('OPERATIONAL', 'PRIVATE', 'SENSITIVE', 'RESTRICTED')
  ),
  constraint activity_event_evidence_checksum_ck check (
    checksum ~ '^[A-Za-z0-9._:@/-]{1,240}$'
  ),
  constraint activity_event_evidence_metadata_ck check (
    jsonb_typeof(metadata) = 'object'
    and not (
      metadata ?| array[
        'rawNotes',
        'raw_notes',
        'notes',
        'rawMessage',
        'messageText',
        'transcript',
        'prompt',
        'systemPrompt',
        'draft',
        'phone',
        'phoneNumber',
        'whatsapp',
        'email',
        'medical',
        'health',
        'income',
        'authToken',
        'accessToken',
        'refreshToken',
        'providerPayload',
        'providerResponse',
        'password',
        'secret'
      ]
    )
  )
);

create table if not exists public.activity_event_mutations (
  mutation_id text primary key,
  tenant_id uuid not null references auth.users(id) on delete restrict,
  event_id text not null,
  device_id text not null,
  event_digest text not null,
  operation text not null,
  ledger_record jsonb not null,
  base_cursor bigint,
  mutation_created_at timestamptz not null,
  received_at timestamptz not null default now(),
  result_status text not null,
  result_payload jsonb not null,
  constraint activity_event_mutations_identity_ck check (
    mutation_id ~ '^[A-Za-z0-9._:@/-]{1,240}$'
    and device_id ~ '^[A-Za-z0-9._:@/-]{1,240}$'
    and event_id ~ '^[A-Za-z0-9._:@/-]{1,240}$'
    and event_digest ~ '^[A-Za-z0-9._:@/-]{1,240}$'
  ),
  constraint activity_event_mutations_operation_ck check (
    operation = 'APPEND_EVENT'
  ),
  constraint activity_event_mutations_result_ck check (
    result_status in ('ACKNOWLEDGED', 'IDEMPOTENT_REPLAY', 'CONFLICT')
  ),
  constraint activity_event_mutations_json_ck check (
    jsonb_typeof(ledger_record) = 'object'
    and jsonb_typeof(result_payload) = 'object'
  )
);

create table if not exists public.activity_event_conflicts (
  conflict_id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references auth.users(id) on delete restrict,
  event_id text not null,
  mutation_id text not null,
  reason_code text not null,
  local_record jsonb not null,
  remote_record jsonb,
  conflict_status text not null default 'OPEN',
  detected_at timestamptz not null default now(),
  resolved_at timestamptz,
  constraint activity_event_conflicts_mutation_fk
    foreign key (mutation_id)
    references public.activity_event_mutations (mutation_id)
    on delete restrict,
  constraint activity_event_conflicts_status_ck check (
    conflict_status in ('OPEN', 'RESOLVED')
  ),
  constraint activity_event_conflicts_json_ck check (
    jsonb_typeof(local_record) = 'object'
    and (
      remote_record is null
      or jsonb_typeof(remote_record) = 'object'
    )
  )
);

alter table public.activity_event_ledger
  drop constraint if exists activity_event_ledger_correction_fk;
alter table public.activity_event_ledger
  add constraint activity_event_ledger_correction_fk
  foreign key (tenant_id, correction_of)
  references public.activity_event_ledger (tenant_id, event_id)
  on delete restrict
  deferrable initially deferred;

create index if not exists activity_event_ledger_tenant_change_idx
  on public.activity_event_ledger (tenant_id, change_seq);

create index if not exists activity_event_ledger_tenant_subject_idx
  on public.activity_event_ledger (
    tenant_id,
    subject_type,
    subject_id,
    occurred_at,
    event_id
  );

create index if not exists activity_event_ledger_correction_idx
  on public.activity_event_ledger (tenant_id, correction_of)
  where correction_of is not null;

create index if not exists activity_event_evidence_event_idx
  on public.activity_event_evidence_references (tenant_id, event_id);

create index if not exists activity_event_mutations_tenant_received_idx
  on public.activity_event_mutations (tenant_id, received_at desc);

create index if not exists activity_event_conflicts_open_idx
  on public.activity_event_conflicts (tenant_id, detected_at desc)
  where conflict_status = 'OPEN';

create or replace function public.forge_fes02_deny_append_only_mutation()
returns trigger
language plpgsql
set search_path = public, pg_temp
as $$
begin
  raise exception 'FES02_APPEND_ONLY_MUTATION_DENIED'
    using errcode = '55000';
end;
$$;

drop trigger if exists forge_fes02_activity_event_ledger_append_only
  on public.activity_event_ledger;
create trigger forge_fes02_activity_event_ledger_append_only
before update or delete on public.activity_event_ledger
for each row execute function public.forge_fes02_deny_append_only_mutation();

drop trigger if exists forge_fes02_activity_event_evidence_append_only
  on public.activity_event_evidence_references;
create trigger forge_fes02_activity_event_evidence_append_only
before update or delete on public.activity_event_evidence_references
for each row execute function public.forge_fes02_deny_append_only_mutation();

drop trigger if exists forge_fes02_activity_event_mutations_append_only
  on public.activity_event_mutations;
create trigger forge_fes02_activity_event_mutations_append_only
before update or delete on public.activity_event_mutations
for each row execute function public.forge_fes02_deny_append_only_mutation();

alter table public.activity_event_ledger enable row level security;
alter table public.activity_event_ledger force row level security;
alter table public.activity_event_evidence_references enable row level security;
alter table public.activity_event_evidence_references force row level security;
alter table public.activity_event_mutations enable row level security;
alter table public.activity_event_mutations force row level security;
alter table public.activity_event_conflicts enable row level security;
alter table public.activity_event_conflicts force row level security;

revoke all on public.activity_event_ledger from anon, authenticated;
revoke all on public.activity_event_evidence_references from anon, authenticated;
revoke all on public.activity_event_mutations from anon, authenticated;
revoke all on public.activity_event_conflicts from anon, authenticated;
revoke all on sequence public.forge_fes02_activity_event_change_seq
  from anon, authenticated;

drop policy if exists activity_event_ledger_own_policy
  on public.activity_event_ledger;
create policy activity_event_ledger_own_policy
  on public.activity_event_ledger
  for all
  to public
  using (tenant_id = auth.uid())
  with check (tenant_id = auth.uid());

drop policy if exists activity_event_evidence_own_policy
  on public.activity_event_evidence_references;
create policy activity_event_evidence_own_policy
  on public.activity_event_evidence_references
  for all
  to public
  using (tenant_id = auth.uid())
  with check (tenant_id = auth.uid());

drop policy if exists activity_event_mutations_own_policy
  on public.activity_event_mutations;
create policy activity_event_mutations_own_policy
  on public.activity_event_mutations
  for all
  to public
  using (tenant_id = auth.uid())
  with check (tenant_id = auth.uid());

drop policy if exists activity_event_conflicts_own_policy
  on public.activity_event_conflicts;
create policy activity_event_conflicts_own_policy
  on public.activity_event_conflicts
  for all
  to public
  using (tenant_id = auth.uid())
  with check (tenant_id = auth.uid());

create or replace function public.forge_fes02_append_activity_event(
  p_mutation jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_tenant_id uuid := auth.uid();
  v_mutation_id text;
  v_device_id text;
  v_operation text;
  v_event_id text;
  v_event_digest text;
  v_record jsonb;
  v_event jsonb;
  v_evidence jsonb;
  v_base_cursor bigint;
  v_mutation_created_at timestamptz;
  v_existing_mutation public.activity_event_mutations%rowtype;
  v_existing_event public.activity_event_ledger%rowtype;
  v_inserted_event public.activity_event_ledger%rowtype;
  v_result jsonb;
  v_reference jsonb;
  v_allowed_mutation_keys text[] := array[
    'mutation_version',
    'mutation_id',
    'operation',
    'tenant_id',
    'device_id',
    'event_id',
    'event_digest',
    'ledger_record',
    'base_cursor',
    'created_at',
    'attempt_count',
    'state',
    'last_error_code'
  ];
  v_allowed_record_keys text[] := array[
    'ledger_version',
    'record_key',
    'tenant_id',
    'event_id',
    'event_digest',
    'canonical_event',
    'evidence_references',
    'appended_at'
  ];
begin
  if v_tenant_id is null then
    raise exception 'FES02_AUTH_REQUIRED'
      using errcode = '42501';
  end if;

  if p_mutation is null or jsonb_typeof(p_mutation) <> 'object' then
    raise exception 'FES02_MUTATION_INVALID'
      using errcode = '22023';
  end if;

  if exists (
    select 1
    from jsonb_object_keys(p_mutation) as supplied(key)
    where not (supplied.key = any(v_allowed_mutation_keys))
  ) then
    raise exception 'FES02_MUTATION_FIELD_DENIED'
      using errcode = '22023';
  end if;

  v_mutation_id := btrim(coalesce(p_mutation->>'mutation_id', ''));
  v_device_id := btrim(coalesce(p_mutation->>'device_id', ''));
  v_operation := btrim(coalesce(p_mutation->>'operation', ''));
  v_event_id := btrim(coalesce(p_mutation->>'event_id', ''));
  v_event_digest := btrim(coalesce(p_mutation->>'event_digest', ''));
  v_record := p_mutation->'ledger_record';
  v_base_cursor := nullif(p_mutation->>'base_cursor', '')::bigint;
  v_mutation_created_at := (p_mutation->>'created_at')::timestamptz;

  if coalesce(p_mutation->>'tenant_id', '') <> v_tenant_id::text then
    raise exception 'FES02_TENANT_INJECTION_DENIED'
      using errcode = '42501';
  end if;

  if v_mutation_id !~ '^[A-Za-z0-9._:@/-]{1,240}$'
     or v_device_id !~ '^[A-Za-z0-9._:@/-]{1,240}$'
     or v_event_id !~ '^[A-Za-z0-9._:@/-]{1,240}$'
     or v_event_digest !~ '^[A-Za-z0-9._:@/-]{1,240}$' then
    raise exception 'FES02_MUTATION_IDENTITY_INVALID'
      using errcode = '22023';
  end if;

  if v_operation <> 'APPEND_EVENT' then
    raise exception 'FES02_OPERATION_INVALID'
      using errcode = '22023';
  end if;

  if coalesce(p_mutation->>'mutation_version', '') <>
     'forge.activity_ledger_mutation.v1' then
    raise exception 'FES02_MUTATION_VERSION_INVALID'
      using errcode = '22023';
  end if;

  if coalesce(p_mutation->>'state', '') not in ('PENDING', 'RETRY') then
    raise exception 'FES02_MUTATION_STATE_INVALID'
      using errcode = '22023';
  end if;

  if v_record is null or jsonb_typeof(v_record) <> 'object' then
    raise exception 'FES02_LEDGER_RECORD_INVALID'
      using errcode = '22023';
  end if;

  if exists (
    select 1
    from jsonb_object_keys(v_record) as supplied(key)
    where not (supplied.key = any(v_allowed_record_keys))
  ) then
    raise exception 'FES02_LEDGER_RECORD_FIELD_DENIED'
      using errcode = '22023';
  end if;

  v_event := v_record->'canonical_event';
  v_evidence := coalesce(v_record->'evidence_references', '[]'::jsonb);

  if coalesce(v_record->>'ledger_version', '') <>
     'forge.activity_ledger.v1'
     or coalesce(v_record->>'tenant_id', '') <> v_tenant_id::text
     or coalesce(v_record->>'event_id', '') <> v_event_id
     or coalesce(v_record->>'event_digest', '') <> v_event_digest
     or coalesce(v_record->>'record_key', '') <>
        v_tenant_id::text || ':' || v_event_id then
    raise exception 'FES02_LEDGER_RECORD_IDENTITY_INVALID'
      using errcode = '22023';
  end if;

  if v_event is null or jsonb_typeof(v_event) <> 'object' then
    raise exception 'FES02_CANONICAL_EVENT_INVALID'
      using errcode = '22023';
  end if;

  if coalesce(v_event->>'schema_version', '') <>
     'forge.activity_event.v1'
     or coalesce(v_event->>'tenant_id', '') <> v_tenant_id::text
     or coalesce(v_event->>'event_id', '') <> v_event_id then
    raise exception 'FES02_CANONICAL_EVENT_IDENTITY_INVALID'
      using errcode = '22023';
  end if;

  if v_event->'learning_eligibility' <> 'false'::jsonb
     or v_event->'safety_flags'->'executes_business_action' <> 'false'::jsonb
     or v_event->'safety_flags'->'mutates_external_provider' <> 'false'::jsonb
     or v_event->'safety_flags'->'promotes_ai_output_to_truth' <> 'false'::jsonb
     or v_event->'safety_flags'->'cross_tenant_data' <> 'false'::jsonb
     or v_event->'safety_flags'->'eligible_for_global_learning' <> 'false'::jsonb then
    raise exception 'FES02_CANONICAL_EVENT_SAFETY_DENIED'
      using errcode = '22023';
  end if;

  if jsonb_typeof(v_evidence) <> 'array' then
    raise exception 'FES02_EVIDENCE_REFERENCES_INVALID'
      using errcode = '22023';
  end if;

  select *
  into v_existing_mutation
  from public.activity_event_mutations
  where mutation_id = v_mutation_id;

  if found then
    return v_existing_mutation.result_payload;
  end if;

  select *
  into v_existing_event
  from public.activity_event_ledger
  where event_id = v_event_id;

  if found then
    if v_existing_event.tenant_id = v_tenant_id
       and v_existing_event.event_digest = v_event_digest then
      v_result := jsonb_build_object(
        'status', 'IDEMPOTENT_REPLAY',
        'receipt', jsonb_build_object(
          'receipt_version', 'forge.activity_ledger_receipt.v1',
          'status', 'IDEMPOTENT_REPLAY',
          'tenant_id', v_tenant_id::text,
          'event_id', v_existing_event.event_id,
          'mutation_id', v_mutation_id,
          'server_sequence', v_existing_event.change_seq,
          'server_recorded_at', v_existing_event.inserted_at,
          'cursor', v_existing_event.change_seq::text
        )
      );

      insert into public.activity_event_mutations (
        mutation_id,
        tenant_id,
        event_id,
        device_id,
        event_digest,
        operation,
        ledger_record,
        base_cursor,
        mutation_created_at,
        result_status,
        result_payload
      ) values (
        v_mutation_id,
        v_tenant_id,
        v_event_id,
        v_device_id,
        v_event_digest,
        v_operation,
        v_record,
        v_base_cursor,
        v_mutation_created_at,
        'IDEMPOTENT_REPLAY',
        v_result
      );

      return v_result;
    end if;

    v_result := jsonb_build_object(
      'status', 'CONFLICT',
      'reason_code', 'REMOTE_EVENT_ID_DIGEST_CONFLICT',
      'remote_record', jsonb_build_object(
        'ledger_version', 'forge.activity_ledger.v1',
        'record_key',
          v_existing_event.tenant_id::text || ':' || v_existing_event.event_id,
        'tenant_id', v_existing_event.tenant_id::text,
        'event_id', v_existing_event.event_id,
        'event_digest', v_existing_event.event_digest,
        'canonical_event', v_existing_event.canonical_event,
        'evidence_references', coalesce(
          (
            select jsonb_agg(
              jsonb_build_object(
                'reference_id', r.reference_id,
                'reference_type', r.reference_type,
                'source_system', r.source_system,
                'captured_at', r.captured_at,
                'privacy_class', r.privacy_class,
                'checksum', r.checksum,
                'metadata', r.metadata
              )
              order by r.reference_id
            )
            from public.activity_event_evidence_references r
            where r.tenant_id = v_existing_event.tenant_id
              and r.event_id = v_existing_event.event_id
          ),
          '[]'::jsonb
        ),
        'appended_at', v_existing_event.inserted_at
      ),
      'detected_at', now()
    );

    insert into public.activity_event_mutations (
      mutation_id,
      tenant_id,
      event_id,
      device_id,
      event_digest,
      operation,
      ledger_record,
      base_cursor,
      mutation_created_at,
      result_status,
      result_payload
    ) values (
      v_mutation_id,
      v_tenant_id,
      v_event_id,
      v_device_id,
      v_event_digest,
      v_operation,
      v_record,
      v_base_cursor,
      v_mutation_created_at,
      'CONFLICT',
      v_result
    );

    insert into public.activity_event_conflicts (
      tenant_id,
      event_id,
      mutation_id,
      reason_code,
      local_record,
      remote_record
    ) values (
      v_tenant_id,
      v_event_id,
      v_mutation_id,
      'REMOTE_EVENT_ID_DIGEST_CONFLICT',
      v_record,
      v_result->'remote_record'
    );

    return v_result;
  end if;

  if nullif(v_event->>'correction_of', '') is not null
     and not exists (
       select 1
       from public.activity_event_ledger original
       where original.tenant_id = v_tenant_id
         and original.event_id = v_event->>'correction_of'
     ) then
    raise exception 'FES02_CORRECTION_ORIGINAL_NOT_FOUND'
      using errcode = '23503';
  end if;

  insert into public.activity_event_ledger (
    event_id,
    tenant_id,
    origin_mutation_id,
    event_type,
    schema_version,
    event_digest,
    idempotency_key,
    subject_type,
    subject_id,
    occurred_at,
    recorded_at,
    privacy_class,
    confirmation_state,
    correction_of,
    canonical_event
  ) values (
    v_event_id,
    v_tenant_id,
    v_mutation_id,
    v_event->>'event_type',
    v_event->>'schema_version',
    v_event_digest,
    v_event->>'idempotency_key',
    v_event->'subject'->>'type',
    v_event->'subject'->>'id',
    (v_event->>'occurred_at')::timestamptz,
    (v_event->>'recorded_at')::timestamptz,
    v_event->>'privacy_class',
    v_event->>'confirmation_state',
    nullif(v_event->>'correction_of', ''),
    v_event
  )
  returning * into v_inserted_event;

  for v_reference in
    select value
    from jsonb_array_elements(v_evidence)
  loop
    if jsonb_typeof(v_reference) <> 'object' then
      raise exception 'FES02_EVIDENCE_REFERENCE_INVALID'
        using errcode = '22023';
    end if;

    insert into public.activity_event_evidence_references (
      tenant_id,
      event_id,
      reference_id,
      reference_type,
      source_system,
      captured_at,
      privacy_class,
      checksum,
      metadata
    ) values (
      v_tenant_id,
      v_event_id,
      v_reference->>'reference_id',
      v_reference->>'reference_type',
      v_reference->>'source_system',
      (v_reference->>'captured_at')::timestamptz,
      v_reference->>'privacy_class',
      v_reference->>'checksum',
      coalesce(v_reference->'metadata', '{}'::jsonb)
    );
  end loop;

  v_result := jsonb_build_object(
    'status', 'ACKNOWLEDGED',
    'receipt', jsonb_build_object(
      'receipt_version', 'forge.activity_ledger_receipt.v1',
      'status', 'ACKNOWLEDGED',
      'tenant_id', v_tenant_id::text,
      'event_id', v_inserted_event.event_id,
      'mutation_id', v_mutation_id,
      'server_sequence', v_inserted_event.change_seq,
      'server_recorded_at', v_inserted_event.inserted_at,
      'cursor', v_inserted_event.change_seq::text
    )
  );

  insert into public.activity_event_mutations (
    mutation_id,
    tenant_id,
    event_id,
    device_id,
    event_digest,
    operation,
    ledger_record,
    base_cursor,
    mutation_created_at,
    result_status,
    result_payload
  ) values (
    v_mutation_id,
    v_tenant_id,
    v_event_id,
    v_device_id,
    v_event_digest,
    v_operation,
    v_record,
    v_base_cursor,
    v_mutation_created_at,
    'ACKNOWLEDGED',
    v_result
  );

  return v_result;
end;
$$;

create or replace function public.forge_fes02_pull_activity_events(
  p_cursor text default null,
  p_limit integer default 200
)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_tenant_id uuid := auth.uid();
  v_cursor bigint := coalesce(nullif(p_cursor, '')::bigint, 0);
  v_limit integer := greatest(1, least(coalesce(p_limit, 200), 500));
  v_changes jsonb;
  v_next_cursor bigint;
  v_has_more boolean;
begin
  if v_tenant_id is null then
    raise exception 'FES02_AUTH_REQUIRED'
      using errcode = '42501';
  end if;

  select
    coalesce(
      jsonb_agg(
        jsonb_build_object(
          'ledger_record', jsonb_build_object(
            'ledger_version', 'forge.activity_ledger.v1',
            'record_key', l.tenant_id::text || ':' || l.event_id,
            'tenant_id', l.tenant_id::text,
            'event_id', l.event_id,
            'event_digest', l.event_digest,
            'canonical_event', l.canonical_event,
            'evidence_references', coalesce(
              (
                select jsonb_agg(
                  jsonb_build_object(
                    'reference_id', r.reference_id,
                    'reference_type', r.reference_type,
                    'source_system', r.source_system,
                    'captured_at', r.captured_at,
                    'privacy_class', r.privacy_class,
                    'checksum', r.checksum,
                    'metadata', r.metadata
                  )
                  order by r.reference_id
                )
                from public.activity_event_evidence_references r
                where r.tenant_id = l.tenant_id
                  and r.event_id = l.event_id
              ),
              '[]'::jsonb
            ),
            'appended_at', l.inserted_at
          ),
          'receipt', jsonb_build_object(
            'receipt_version', 'forge.activity_ledger_receipt.v1',
            'status', 'ACKNOWLEDGED',
            'tenant_id', l.tenant_id::text,
            'event_id', l.event_id,
            'mutation_id', l.origin_mutation_id,
            'server_sequence', l.change_seq,
            'server_recorded_at', l.inserted_at,
            'cursor', l.change_seq::text
          )
        )
        order by l.change_seq
      ),
      '[]'::jsonb
    ),
    max(l.change_seq)
  into v_changes, v_next_cursor
  from (
    select *
    from public.activity_event_ledger
    where tenant_id = v_tenant_id
      and change_seq > v_cursor
    order by change_seq
    limit v_limit
  ) l;

  v_next_cursor := coalesce(v_next_cursor, v_cursor);

  select exists (
    select 1
    from public.activity_event_ledger
    where tenant_id = v_tenant_id
      and change_seq > v_next_cursor
  ) into v_has_more;

  return jsonb_build_object(
    'changes', v_changes,
    'cursor', v_next_cursor::text,
    'has_more', v_has_more
  );
end;
$$;

revoke all on function public.forge_fes02_append_activity_event(jsonb)
  from public, anon;
revoke all on function public.forge_fes02_pull_activity_events(text, integer)
  from public, anon;

grant execute on function public.forge_fes02_append_activity_event(jsonb)
  to authenticated;
grant execute on function public.forge_fes02_pull_activity_events(text, integer)
  to authenticated;

commit;
