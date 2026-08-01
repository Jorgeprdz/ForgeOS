-- CARTERA 040A/040C durable relationship memory authority.
-- Memory is evidence-backed advisor context. It is never automatic opportunity,
-- consent, client intent, final-message, contact-execution or sales-trigger truth.

begin;

create table if not exists public.cartera040_relationship_memory_entries (
  id uuid primary key default gen_random_uuid(),
  advisor_id uuid not null references auth.users(id) on delete restrict,
  memory_reference text not null,
  person_id uuid not null,
  person_reference text not null,
  memory_kind text not null check (
    memory_kind in (
      'ORIGIN_REFERRAL',
      'APPOINTMENT_CONTEXT',
      'NEED',
      'OBJECTION',
      'DECISION',
      'SERVICE_INTERACTION',
      'ANNUAL_REVIEW',
      'CONTACT_PREFERENCE',
      'CONTACT_TIME_PREFERENCE',
      'DECISION_PARTICIPANT',
      'EXPLANATION_PREFERENCE',
      'UNRESOLVED_COMMITMENT',
      'SERVICE_EXPECTATION',
      'LIFE_CONTEXT'
    )
  ),
  summary text not null,
  value_code text,
  occurred_at timestamptz not null,
  source_authority text not null check (
    source_authority in (
      'PIPELINE_TIMELINE',
      'POLICY_INTELLIGENCE',
      'PAYMENT_EVENT',
      'SERVICE_WORKFLOW',
      'ADVISOR_CONFIRMED',
      'CLIENT_CONFIRMED'
    )
  ),
  source_record_reference text not null,
  evidence_references jsonb not null,
  sensitivity text not null check (
    sensitivity in ('STANDARD', 'PERSONAL', 'SENSITIVE')
  ),
  consent_state text not null check (
    consent_state in ('NOT_REQUIRED', 'CONFIRMED', 'UNKNOWN', 'REVOKED')
  ),
  context_use text not null check (
    context_use in (
      'GENERAL_RELATIONSHIP',
      'SERVICE_ONLY',
      'CONVERSATION_PREPARATION'
    )
  ),
  record_state text not null default 'ACTIVE' check (
    record_state in ('ACTIVE', 'CORRECTION', 'WITHDRAWN')
  ),
  supersedes_memory_id uuid,
  command_digest text not null,
  idempotency_key text not null,
  created_at timestamptz not null default now(),
  created_by uuid not null references auth.users(id) on delete restrict,
  constraint cartera040_memory_reference_ck
    check (memory_reference ~ '^[A-Za-z0-9][A-Za-z0-9._:@/-]{0,239}$'),
  constraint cartera040_memory_person_reference_ck
    check (person_reference ~ '^[A-Za-z0-9][A-Za-z0-9._:@/-]{0,239}$'),
  constraint cartera040_memory_summary_ck
    check (
      nullif(btrim(summary), '') is not null
      and length(summary) <= 500
    ),
  constraint cartera040_memory_value_code_ck
    check (
      value_code is null
      or value_code ~ '^[A-Za-z0-9][A-Za-z0-9._:@/-]{0,119}$'
    ),
  constraint cartera040_memory_source_record_ck
    check (source_record_reference ~ '^[A-Za-z0-9][A-Za-z0-9._:@/-]{0,239}$'),
  constraint cartera040_memory_evidence_ck
    check (
      jsonb_typeof(evidence_references) = 'array'
      and jsonb_array_length(evidence_references) >= 1
      and jsonb_array_length(evidence_references) <= 20
    ),
  constraint cartera040_memory_digest_ck
    check (command_digest ~ '^[a-f0-9]{64}$'),
  constraint cartera040_memory_idempotency_ck
    check (idempotency_key ~ '^[A-Za-z0-9][A-Za-z0-9._:@/-]{0,159}$'),
  constraint cartera040_memory_actor_ck
    check (created_by = advisor_id),
  constraint cartera040_memory_life_context_ck
    check (
      memory_kind <> 'LIFE_CONTEXT'
      or (
        sensitivity = 'SENSITIVE'
        and consent_state = 'CONFIRMED'
        and context_use in ('SERVICE_ONLY', 'CONVERSATION_PREPARATION')
      )
    ),
  constraint cartera040_memory_sensitive_consent_ck
    check (
      sensitivity <> 'SENSITIVE'
      or consent_state = 'CONFIRMED'
    ),
  constraint cartera040_memory_person_owner_fk
    foreign key (person_id, advisor_id)
    references public.commercial_people (id, advisor_id)
    on delete restrict,
  constraint cartera040_memory_supersedes_owner_fk
    foreign key (supersedes_memory_id, advisor_id)
    references public.cartera040_relationship_memory_entries (id, advisor_id)
    on delete restrict,
  unique (id, advisor_id),
  unique (advisor_id, memory_reference),
  unique (advisor_id, idempotency_key)
);

create index if not exists cartera040_memory_person_read_idx
  on public.cartera040_relationship_memory_entries (
    advisor_id,
    person_id,
    occurred_at desc,
    created_at desc
  );

create index if not exists cartera040_memory_kind_read_idx
  on public.cartera040_relationship_memory_entries (
    advisor_id,
    person_id,
    memory_kind,
    occurred_at desc
  );

create table if not exists public.cartera040_relationship_memory_conflicts (
  id uuid primary key default gen_random_uuid(),
  advisor_id uuid not null references auth.users(id) on delete restrict,
  conflict_reference text not null,
  person_id uuid,
  memory_id uuid,
  conflict_type text not null check (
    conflict_type in (
      'CHANGED_INPUT_REPLAY',
      'MEMORY_IDENTITY_COLLISION',
      'SENSITIVE_CONTEXT_WITHOUT_CONSENT',
      'SUPERSESSION_TARGET_MISMATCH'
    )
  ),
  conflict_state text not null default 'OPEN' check (
    conflict_state in ('OPEN', 'RESOLVED', 'SUPERSEDED')
  ),
  claims jsonb not null,
  incoming_digest text,
  existing_digest text,
  evidence_references jsonb not null default '[]'::jsonb,
  recorded_at timestamptz not null default now(),
  recorded_by uuid not null references auth.users(id) on delete restrict,
  constraint cartera040_conflict_reference_ck
    check (conflict_reference ~ '^[A-Za-z0-9][A-Za-z0-9._:@/-]{0,239}$'),
  constraint cartera040_conflict_claims_ck
    check (jsonb_typeof(claims) = 'object'),
  constraint cartera040_conflict_incoming_ck
    check (incoming_digest is null or incoming_digest ~ '^[a-f0-9]{64}$'),
  constraint cartera040_conflict_existing_ck
    check (existing_digest is null or existing_digest ~ '^[a-f0-9]{64}$'),
  constraint cartera040_conflict_evidence_ck
    check (jsonb_typeof(evidence_references) = 'array'),
  constraint cartera040_conflict_actor_ck
    check (recorded_by = advisor_id),
  constraint cartera040_conflict_person_owner_fk
    foreign key (person_id, advisor_id)
    references public.commercial_people (id, advisor_id)
    on delete restrict,
  constraint cartera040_conflict_memory_owner_fk
    foreign key (memory_id, advisor_id)
    references public.cartera040_relationship_memory_entries (id, advisor_id)
    on delete restrict,
  unique (id, advisor_id),
  unique (advisor_id, conflict_reference)
);

create table if not exists public.cartera040_command_receipts (
  id uuid primary key default gen_random_uuid(),
  advisor_id uuid not null references auth.users(id) on delete restrict,
  command_type text not null check (
    command_type in ('RECORD_RELATIONSHIP_MEMORY')
  ),
  idempotency_key text not null,
  command_digest text not null,
  response_envelope jsonb not null,
  executed_at timestamptz not null default now(),
  executed_by uuid not null references auth.users(id) on delete restrict,
  constraint cartera040_receipt_idempotency_ck
    check (idempotency_key ~ '^[A-Za-z0-9][A-Za-z0-9._:@/-]{0,159}$'),
  constraint cartera040_receipt_digest_ck
    check (command_digest ~ '^[a-f0-9]{64}$'),
  constraint cartera040_receipt_response_ck
    check (jsonb_typeof(response_envelope) = 'object'),
  constraint cartera040_receipt_actor_ck
    check (executed_by = advisor_id),
  unique (id, advisor_id),
  unique (advisor_id, command_type, idempotency_key)
);

drop trigger if exists cartera040_memory_append_only
  on public.cartera040_relationship_memory_entries;
create trigger cartera040_memory_append_only
before update or delete on public.cartera040_relationship_memory_entries
for each row execute function public.forge_cartera030b_append_only_guard();

drop trigger if exists cartera040_conflict_append_only
  on public.cartera040_relationship_memory_conflicts;
create trigger cartera040_conflict_append_only
before update or delete on public.cartera040_relationship_memory_conflicts
for each row execute function public.forge_cartera030b_append_only_guard();

drop trigger if exists cartera040_receipt_append_only
  on public.cartera040_command_receipts;
create trigger cartera040_receipt_append_only
before update or delete on public.cartera040_command_receipts
for each row execute function public.forge_cartera030b_append_only_guard();

alter table public.cartera040_relationship_memory_entries enable row level security;
alter table public.cartera040_relationship_memory_entries force row level security;
alter table public.cartera040_relationship_memory_conflicts enable row level security;
alter table public.cartera040_relationship_memory_conflicts force row level security;
alter table public.cartera040_command_receipts enable row level security;
alter table public.cartera040_command_receipts force row level security;

create policy cartera040_memory_owner_select
on public.cartera040_relationship_memory_entries
for select to authenticated
using (advisor_id = auth.uid());

create policy cartera040_conflicts_owner_select
on public.cartera040_relationship_memory_conflicts
for select to authenticated
using (advisor_id = auth.uid());

create policy cartera040_receipts_owner_select
on public.cartera040_command_receipts
for select to authenticated
using (advisor_id = auth.uid());

revoke all on public.cartera040_relationship_memory_entries from anon, authenticated;
revoke all on public.cartera040_relationship_memory_conflicts from anon, authenticated;
revoke all on public.cartera040_command_receipts from anon, authenticated;

create or replace function public.forge_cartera040_validate_reference_array(
  p_references jsonb
)
returns boolean
language plpgsql
immutable
strict
set search_path = public, pg_temp
as $$
declare
  reference_value text;
begin
  if jsonb_typeof(p_references) <> 'array'
    or jsonb_array_length(p_references) < 1
    or jsonb_array_length(p_references) > 20 then
    return false;
  end if;

  for reference_value in
    select value from jsonb_array_elements_text(p_references)
  loop
    if reference_value !~ '^[A-Za-z0-9][A-Za-z0-9._:@/-]{0,239}$' then
      return false;
    end if;
  end loop;

  return (
    select count(*) = count(distinct value)
    from jsonb_array_elements_text(p_references)
  );
end;
$$;

create or replace function public.forge_cartera040_record_relationship_memory(
  p_payload jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = public, auth, extensions, pg_temp
as $$
#variable_conflict use_variable
declare
  advisor uuid := auth.uid();
  command_payload jsonb;
  authorization_payload jsonb;
  supplied_digest text;
  command_digest text;
  person_reference_value text;
  memory_kind_value text;
  summary_value text;
  value_code_value text;
  occurred_at_value timestamptz;
  source_authority_value text;
  source_record_reference_value text;
  evidence_references_value jsonb;
  sensitivity_value text;
  consent_state_value text;
  context_use_value text;
  idempotency_key_value text;
  supersedes_reference_value text;
  person_row record;
  prior_receipt record;
  superseded_row record;
  superseded_id_value uuid;
  memory_identity jsonb;
  memory_reference_value text;
  memory_id_value uuid;
  record_state_value text;
  response_envelope jsonb;
  conflict_reference_value text;
begin
  if advisor is null then
    raise exception 'CARTERA040_AUTHENTICATION_REQUIRED';
  end if;
  if p_payload is null or jsonb_typeof(p_payload) <> 'object' then
    raise exception 'CARTERA040_PAYLOAD_INVALID';
  end if;

  authorization_payload := p_payload -> 'authorization';
  command_payload := p_payload - 'authorization';
  if authorization_payload is null
    or authorization_payload ->> 'authorized' <> 'true' then
    raise exception 'CARTERA040_EXPLICIT_AUTHORIZATION_REQUIRED';
  end if;

  supplied_digest := authorization_payload ->> 'payloadDigest';
  command_digest := public.forge_cartera030b_digest(command_payload);
  if supplied_digest is null or supplied_digest <> command_digest then
    raise exception 'CARTERA040_AUTHORIZATION_DIGEST_MISMATCH';
  end if;

  person_reference_value := nullif(btrim(command_payload ->> 'personReference'), '');
  memory_kind_value := nullif(upper(btrim(command_payload ->> 'memoryKind')), '');
  summary_value := nullif(btrim(command_payload ->> 'summary'), '');
  value_code_value := nullif(upper(btrim(command_payload ->> 'valueCode')), '');
  occurred_at_value := nullif(command_payload ->> 'occurredAt', '')::timestamptz;
  source_authority_value := nullif(upper(btrim(command_payload ->> 'sourceAuthority')), '');
  source_record_reference_value := nullif(btrim(command_payload ->> 'sourceRecordReference'), '');
  evidence_references_value := coalesce(command_payload -> 'evidenceReferences', '[]'::jsonb);
  sensitivity_value := nullif(upper(btrim(command_payload ->> 'sensitivity')), '');
  consent_state_value := nullif(upper(btrim(command_payload ->> 'consentState')), '');
  context_use_value := nullif(upper(btrim(command_payload ->> 'contextUse')), '');
  idempotency_key_value := nullif(btrim(command_payload ->> 'idempotencyKey'), '');
  supersedes_reference_value := nullif(btrim(command_payload ->> 'supersedesMemoryReference'), '');

  if person_reference_value is null
    or memory_kind_value is null
    or summary_value is null
    or length(summary_value) > 500
    or occurred_at_value is null
    or source_authority_value is null
    or source_record_reference_value is null
    or sensitivity_value is null
    or consent_state_value is null
    or context_use_value is null
    or idempotency_key_value is null then
    raise exception 'CARTERA040_REQUIRED_INPUT_MISSING';
  end if;

  if person_reference_value !~ '^[A-Za-z0-9][A-Za-z0-9._:@/-]{0,239}$'
    or source_record_reference_value !~ '^[A-Za-z0-9][A-Za-z0-9._:@/-]{0,239}$'
    or idempotency_key_value !~ '^[A-Za-z0-9][A-Za-z0-9._:@/-]{0,159}$'
    or (value_code_value is not null and value_code_value !~ '^[A-Za-z0-9][A-Za-z0-9._:@/-]{0,119}$')
    or not public.forge_cartera040_validate_reference_array(evidence_references_value) then
    raise exception 'CARTERA040_INPUT_FORMAT_INVALID';
  end if;

  if memory_kind_value not in (
      'ORIGIN_REFERRAL',
      'APPOINTMENT_CONTEXT',
      'NEED',
      'OBJECTION',
      'DECISION',
      'SERVICE_INTERACTION',
      'ANNUAL_REVIEW',
      'CONTACT_PREFERENCE',
      'CONTACT_TIME_PREFERENCE',
      'DECISION_PARTICIPANT',
      'EXPLANATION_PREFERENCE',
      'UNRESOLVED_COMMITMENT',
      'SERVICE_EXPECTATION',
      'LIFE_CONTEXT'
    )
    or source_authority_value not in (
      'PIPELINE_TIMELINE',
      'POLICY_INTELLIGENCE',
      'PAYMENT_EVENT',
      'SERVICE_WORKFLOW',
      'ADVISOR_CONFIRMED',
      'CLIENT_CONFIRMED'
    )
    or sensitivity_value not in ('STANDARD', 'PERSONAL', 'SENSITIVE')
    or consent_state_value not in ('NOT_REQUIRED', 'CONFIRMED', 'UNKNOWN', 'REVOKED')
    or context_use_value not in (
      'GENERAL_RELATIONSHIP',
      'SERVICE_ONLY',
      'CONVERSATION_PREPARATION'
    ) then
    raise exception 'CARTERA040_ENUM_INVALID';
  end if;

  if sensitivity_value = 'SENSITIVE' and consent_state_value <> 'CONFIRMED' then
    raise exception 'CARTERA040_SENSITIVE_CONTEXT_REQUIRES_CONSENT';
  end if;

  if memory_kind_value = 'LIFE_CONTEXT'
    and (
      sensitivity_value <> 'SENSITIVE'
      or consent_state_value <> 'CONFIRMED'
      or context_use_value not in ('SERVICE_ONLY', 'CONVERSATION_PREPARATION')
    ) then
    raise exception 'CARTERA040_LIFE_CONTEXT_BOUNDARY_VIOLATION';
  end if;

  select p.*
  into person_row
  from public.commercial_people p
  where p.advisor_id = advisor
    and p.person_reference = person_reference_value
    and p.lifecycle_state <> 'ARCHIVED'
    and p.archived_at is null;

  if not found then
    raise exception 'CARTERA040_PERSON_NOT_FOUND';
  end if;

  select r.*
  into prior_receipt
  from public.cartera040_command_receipts r
  where r.advisor_id = advisor
    and r.command_type = 'RECORD_RELATIONSHIP_MEMORY'
    and r.idempotency_key = idempotency_key_value;

  if found then
    if prior_receipt.command_digest = command_digest then
      return prior_receipt.response_envelope;
    end if;

    conflict_reference_value := 'RELATIONSHIP_MEMORY_CONFLICT:'
      || public.forge_cartera030b_digest(jsonb_build_object(
        'advisorId', advisor,
        'idempotencyKey', idempotency_key_value,
        'incomingDigest', command_digest,
        'existingDigest', prior_receipt.command_digest
      ));

    insert into public.cartera040_relationship_memory_conflicts (
      advisor_id,
      conflict_reference,
      person_id,
      conflict_type,
      claims,
      incoming_digest,
      existing_digest,
      evidence_references,
      recorded_by
    ) values (
      advisor,
      conflict_reference_value,
      person_row.id,
      'CHANGED_INPUT_REPLAY',
      jsonb_build_object(
        'idempotencyKey', idempotency_key_value,
        'personReference', person_reference_value
      ),
      command_digest,
      prior_receipt.command_digest,
      evidence_references_value,
      advisor
    )
    on conflict (advisor_id, conflict_reference) do nothing;

    return jsonb_build_object(
      'recordingState', 'CONFLICT',
      'reason', 'CHANGED_INPUT_REPLAY',
      'conflictReference', conflict_reference_value,
      'personReference', person_reference_value,
      'automaticOpportunityCreated', false,
      'automaticContactExecuted', false,
      'finalMessageGenerated', false
    );
  end if;

  superseded_id_value := null;
  if supersedes_reference_value is not null then
    select m.*
    into superseded_row
    from public.cartera040_relationship_memory_entries m
    where m.advisor_id = advisor
      and m.memory_reference = supersedes_reference_value;

    if not found or superseded_row.person_id <> person_row.id then
      raise exception 'CARTERA040_SUPERSESSION_TARGET_MISMATCH';
    end if;
    superseded_id_value := superseded_row.id;
  end if;

  record_state_value := case
    when supersedes_reference_value is null then 'ACTIVE'
    else 'CORRECTION'
  end;

  memory_identity := jsonb_build_object(
    'advisorId', advisor::text,
    'personReference', person_reference_value,
    'memoryKind', memory_kind_value,
    'summary', summary_value,
    'valueCode', value_code_value,
    'occurredAt', occurred_at_value,
    'sourceAuthority', source_authority_value,
    'sourceRecordReference', source_record_reference_value,
    'evidenceReferences', evidence_references_value,
    'sensitivity', sensitivity_value,
    'consentState', consent_state_value,
    'contextUse', context_use_value,
    'supersedesMemoryReference', supersedes_reference_value
  );
  memory_reference_value := 'RELATIONSHIP_MEMORY:'
    || public.forge_cartera030b_digest(memory_identity);

  insert into public.cartera040_relationship_memory_entries (
    advisor_id,
    memory_reference,
    person_id,
    person_reference,
    memory_kind,
    summary,
    value_code,
    occurred_at,
    source_authority,
    source_record_reference,
    evidence_references,
    sensitivity,
    consent_state,
    context_use,
    record_state,
    supersedes_memory_id,
    command_digest,
    idempotency_key,
    created_by
  ) values (
    advisor,
    memory_reference_value,
    person_row.id,
    person_reference_value,
    memory_kind_value,
    summary_value,
    value_code_value,
    occurred_at_value,
    source_authority_value,
    source_record_reference_value,
    evidence_references_value,
    sensitivity_value,
    consent_state_value,
    context_use_value,
    record_state_value,
    superseded_id_value,
    command_digest,
    idempotency_key_value,
    advisor
  )
  returning id into memory_id_value;

  response_envelope := jsonb_build_object(
    'recordingState', 'COMPLETE',
    'reason', null,
    'personReference', person_reference_value,
    'memoryReference', memory_reference_value,
    'memoryKind', memory_kind_value,
    'recordState', record_state_value,
    'consentState', consent_state_value,
    'contextUse', context_use_value,
    'automaticOpportunityCreated', false,
    'automaticContactExecuted', false,
    'finalMessageGenerated', false,
    'lifeContextIsSalesTrigger', false
  );

  insert into public.cartera040_command_receipts (
    advisor_id,
    command_type,
    idempotency_key,
    command_digest,
    response_envelope,
    executed_by
  ) values (
    advisor,
    'RECORD_RELATIONSHIP_MEMORY',
    idempotency_key_value,
    command_digest,
    response_envelope,
    advisor
  );

  return response_envelope;
end;
$$;

revoke all on function public.forge_cartera040_record_relationship_memory(jsonb)
  from public, anon;
grant execute on function public.forge_cartera040_record_relationship_memory(jsonb)
  to authenticated;

commit;
