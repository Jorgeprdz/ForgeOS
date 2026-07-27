-- NFAST-08.1 PROSPECT COMMERCIAL TIMELINE GOVERNANCE
-- Repository implementation only. This migration is not deployment authorization.
-- prospect_audit_events remains technical audit evidence and is not promoted,
-- copied, backfilled, projected, or exposed as the commercial Timeline.

begin;

create extension if not exists pgcrypto;

create table if not exists public.prospect_timeline_events (
  id uuid primary key default gen_random_uuid(),
  prospect_id uuid not null,
  advisor_id uuid not null references auth.users(id) on delete restrict,
  event_type text not null check (
    event_type in (
      'PROSPECT_CREATED',
      'STAGE_CHANGED',
      'PROSPECT_ARCHIVED',
      'CONTACT_ATTEMPTED',
      'CONVERSATION_RECORDED',
      'APPOINTMENT_SCHEDULED',
      'APPOINTMENT_RESCHEDULED',
      'APPOINTMENT_COMPLETED',
      'OBJECTION_RECORDED',
      'FOLLOW_UP_PLANNED',
      'PROPOSAL_PRESENTED',
      'DECISION_RECORDED'
    )
  ),
  event_source text not null check (
    event_source in (
      'PIPELINE',
      'ADVISOR_DECLARATION',
      'APPOINTMENT_AUTHORITY',
      'PROSPECT_DECLARATION',
      'PRODUCT_INTELLIGENCE',
      'QUOTE_AUTHORITY'
    )
  ),
  source_record_reference text not null,
  occurred_at timestamptz not null,
  recorded_at timestamptz not null default now(),
  created_by uuid not null references auth.users(id) on delete restrict,
  payload jsonb not null default '{}'::jsonb,
  evidence_references jsonb not null default '[]'::jsonb,
  idempotency_key text not null,
  contract_version text not null default 'NFAST-08.1',
  privacy_classification text not null default 'ADVISOR_PRIVATE_MINIMIZED',
  retention_policy text not null default 'NO_AUTOMATIC_DELETION_PENDING_POLICY',
  constraint prospect_timeline_events_owner_ck
    check (created_by = advisor_id),
  constraint prospect_timeline_events_source_reference_ck
    check (
      source_record_reference ~ '^[A-Za-z0-9._:-]{1,160}$'
    ),
  constraint prospect_timeline_events_idempotency_key_ck
    check (
      idempotency_key ~ '^[A-Za-z0-9._:-]{1,160}$'
    ),
  constraint prospect_timeline_events_payload_object_ck
    check (jsonb_typeof(payload) = 'object'),
  constraint prospect_timeline_events_evidence_array_ck
    check (jsonb_typeof(evidence_references) = 'array'),
  constraint prospect_timeline_events_contract_version_ck
    check (contract_version = 'NFAST-08.1'),
  constraint prospect_timeline_events_privacy_ck
    check (
      privacy_classification = 'ADVISOR_PRIVATE_MINIMIZED'
    ),
  constraint prospect_timeline_events_retention_ck
    check (
      retention_policy = 'NO_AUTOMATIC_DELETION_PENDING_POLICY'
    ),
  constraint prospect_timeline_events_prospect_owner_fk
    foreign key (prospect_id, advisor_id)
    references public.prospects (id, advisor_id)
    on delete restrict
);

create unique index if not exists
  prospect_timeline_events_idempotency_uq
on public.prospect_timeline_events (
  advisor_id,
  prospect_id,
  idempotency_key
);

create index if not exists
  prospect_timeline_events_read_idx
on public.prospect_timeline_events (
  advisor_id,
  prospect_id,
  occurred_at desc,
  recorded_at desc
);

create or replace function
  public.forge_nfast08_validate_timeline_payload(
    p_event_type text,
    p_payload jsonb
  )
returns boolean
language plpgsql
immutable
set search_path = public, pg_temp
as $$
declare
  allowed_keys text[];
  required_keys text[];
  payload_key text;
  payload_value jsonb;
  payload_text text;
  payload_key_count integer;
begin
  if p_payload is null or jsonb_typeof(p_payload) <> 'object' then
    return false;
  end if;

  select count(*)
  into payload_key_count
  from jsonb_object_keys(p_payload);

  if payload_key_count > 8 then
    return false;
  end if;

  allowed_keys := case p_event_type
    when 'CONTACT_ATTEMPTED'
      then array['channel','outcome','direction']
    when 'CONVERSATION_RECORDED'
      then array['channel','outcome','nextStepType']
    when 'APPOINTMENT_SCHEDULED'
      then array['appointmentReference','scheduledAt']
    when 'APPOINTMENT_RESCHEDULED'
      then array['appointmentReference','scheduledAt']
    when 'APPOINTMENT_COMPLETED'
      then array['appointmentReference','outcome']
    when 'OBJECTION_RECORDED'
      then array['objectionCode','resolutionStatus']
    when 'FOLLOW_UP_PLANNED'
      then array['followUpType','dueAt']
    when 'PROPOSAL_PRESENTED'
      then array['productReference','quoteReference']
    when 'DECISION_RECORDED'
      then array['decisionCode','reasonCode']
    else array[]::text[]
  end;

  required_keys := case p_event_type
    when 'CONTACT_ATTEMPTED'
      then array['channel','outcome']
    when 'CONVERSATION_RECORDED'
      then array['channel','outcome']
    when 'APPOINTMENT_SCHEDULED'
      then array['appointmentReference','scheduledAt']
    when 'APPOINTMENT_RESCHEDULED'
      then array['appointmentReference','scheduledAt']
    when 'APPOINTMENT_COMPLETED'
      then array['appointmentReference','outcome']
    when 'OBJECTION_RECORDED'
      then array['objectionCode']
    when 'FOLLOW_UP_PLANNED'
      then array['followUpType','dueAt']
    when 'PROPOSAL_PRESENTED'
      then array['productReference']
    when 'DECISION_RECORDED'
      then array['decisionCode']
    else array[]::text[]
  end;

  if cardinality(allowed_keys) = 0 then
    return false;
  end if;

  foreach payload_key in array required_keys loop
    if not p_payload ? payload_key then
      return false;
    end if;

    if p_payload -> payload_key in ('null'::jsonb, '""'::jsonb) then
      return false;
    end if;
  end loop;

  for payload_key, payload_value in
    select key, value
    from jsonb_each(p_payload)
  loop
    if not (payload_key = any(allowed_keys)) then
      return false;
    end if;

    if payload_key = any(array[
      'advisorId',
      'advisor_id',
      'createdBy',
      'created_by',
      'rawText',
      'draftText',
      'draftCandidate',
      'conversationBrief',
      'providerRequest',
      'providerResponse',
      'prompt',
      'systemPrompt',
      'initialContext',
      'initial_context',
      'notes',
      'internalNotes',
      'beforeState',
      'before_state',
      'afterState',
      'after_state',
      'phone',
      'whatsapp',
      'email',
      'dateOfBirth',
      'date_of_birth',
      'income',
      'estimatedIncome',
      'health',
      'medicalInformation',
      'familyContext',
      'conversationHistory',
      'transcript'
    ]) then
      return false;
    end if;

    if jsonb_typeof(payload_value) not in (
      'string',
      'number',
      'boolean',
      'null'
    ) then
      return false;
    end if;

    if jsonb_typeof(payload_value) = 'string' then
      payload_text := payload_value #>> '{}';

      if length(payload_text) > 160 then
        return false;
      end if;

      if payload_key = any(array[
        'appointmentReference',
        'productReference',
        'quoteReference'
      ]) and payload_text !~ '^[A-Za-z0-9._:-]{1,160}$' then
        return false;
      end if;

      if payload_key = any(array['scheduledAt','dueAt']) then
        begin
          perform payload_text::timestamptz;
        exception when others then
          return false;
        end;
      end if;
    end if;
  end loop;

  return true;
end;
$$;

create or replace function
  public.forge_nfast08_validate_evidence_references(
    p_evidence_references jsonb
  )
returns boolean
language plpgsql
immutable
set search_path = public, pg_temp
as $$
declare
  evidence_value jsonb;
  evidence_text text;
begin
  if p_evidence_references is null
     or jsonb_typeof(p_evidence_references) <> 'array'
     or jsonb_array_length(p_evidence_references) > 20 then
    return false;
  end if;

  for evidence_value in
    select value
    from jsonb_array_elements(p_evidence_references)
  loop
    if jsonb_typeof(evidence_value) <> 'string' then
      return false;
    end if;

    evidence_text := evidence_value #>> '{}';

    if evidence_text !~ '^[A-Za-z0-9._:-]{1,160}$' then
      return false;
    end if;
  end loop;

  if (
    select count(*)
    from jsonb_array_elements_text(p_evidence_references)
  ) <> (
    select count(distinct value)
    from jsonb_array_elements_text(p_evidence_references)
  ) then
    return false;
  end if;

  return true;
end;
$$;

create or replace function
  public.forge_nfast08_timeline_append_only_guard()
returns trigger
language plpgsql
security invoker
set search_path = public, pg_temp
as $$
begin
  raise exception 'NFAST08_TIMELINE_APPEND_ONLY';
end;
$$;

drop trigger if exists
  forge_nfast08_timeline_append_only_guard
on public.prospect_timeline_events;

create trigger
  forge_nfast08_timeline_append_only_guard
before update or delete
on public.prospect_timeline_events
for each row
execute function
  public.forge_nfast08_timeline_append_only_guard();

create or replace function
  public.forge_nfast08_append_prospect_timeline_event(
    p_prospect_id uuid,
    p_event_type text,
    p_occurred_at timestamptz,
    p_source_record_reference text,
    p_payload jsonb default '{}'::jsonb,
    p_evidence_references jsonb default '[]'::jsonb,
    p_idempotency_key text default null
  )
returns public.prospect_timeline_events
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  actor_id uuid;
  stable_key text;
  persisted public.prospect_timeline_events%rowtype;
begin
  actor_id := auth.uid();

  if actor_id is null then
    raise exception 'NFAST08_AUTH_REQUIRED';
  end if;

  if p_event_type not in (
    'CONTACT_ATTEMPTED',
    'CONVERSATION_RECORDED',
    'APPOINTMENT_SCHEDULED',
    'APPOINTMENT_RESCHEDULED',
    'APPOINTMENT_COMPLETED',
    'OBJECTION_RECORDED',
    'FOLLOW_UP_PLANNED',
    'PROPOSAL_PRESENTED',
    'DECISION_RECORDED'
  ) then
    raise exception 'NFAST08_TIMELINE_EVENT_TYPE_INVALID';
  end if;

  if p_occurred_at is null
     or p_occurred_at > now() + interval '5 minutes' then
    raise exception 'NFAST08_OCCURRED_AT_INVALID';
  end if;

  if p_source_record_reference is null
     or p_source_record_reference
       !~ '^[A-Za-z0-9._:-]{1,160}$' then
    raise exception 'NFAST08_SOURCE_REFERENCE_INVALID';
  end if;

  if not public.forge_nfast08_validate_timeline_payload(
    p_event_type,
    coalesce(p_payload, '{}'::jsonb)
  ) then
    raise exception 'NFAST08_TIMELINE_PAYLOAD_INVALID';
  end if;

  if not public.forge_nfast08_validate_evidence_references(
    coalesce(p_evidence_references, '[]'::jsonb)
  ) then
    raise exception 'NFAST08_EVIDENCE_REFERENCES_INVALID';
  end if;

  if not exists (
    select 1
    from public.prospects p
    where p.id = p_prospect_id
      and p.advisor_id = actor_id
  ) then
    raise exception 'NFAST08_PROSPECT_NOT_OWNED';
  end if;

  stable_key := nullif(btrim(p_idempotency_key), '');

  if stable_key is null then
    stable_key :=
      'NFAST08:' ||
      encode(
        digest(
          concat_ws(
            '|',
            actor_id::text,
            p_prospect_id::text,
            p_event_type,
            p_occurred_at::text,
            p_source_record_reference
          ),
          'sha256'
        ),
        'hex'
      );
  end if;

  if stable_key !~ '^[A-Za-z0-9._:-]{1,160}$' then
    raise exception 'NFAST08_IDEMPOTENCY_KEY_INVALID';
  end if;

  insert into public.prospect_timeline_events (
    prospect_id,
    advisor_id,
    event_type,
    event_source,
    source_record_reference,
    occurred_at,
    created_by,
    payload,
    evidence_references,
    idempotency_key
  )
  values (
    p_prospect_id,
    actor_id,
    p_event_type,
    'ADVISOR_DECLARATION',
    p_source_record_reference,
    p_occurred_at,
    actor_id,
    coalesce(p_payload, '{}'::jsonb),
    coalesce(p_evidence_references, '[]'::jsonb),
    stable_key
  )
  on conflict (
    advisor_id,
    prospect_id,
    idempotency_key
  )
  do nothing
  returning *
  into persisted;

  if persisted.id is null then
    select *
    into persisted
    from public.prospect_timeline_events
    where advisor_id = actor_id
      and prospect_id = p_prospect_id
      and idempotency_key = stable_key;
  end if;

  return persisted;
end;
$$;

create or replace function
  public.forge_nfast08_capture_pipeline_timeline()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  actor_id uuid;
  event_time timestamptz;
  source_reference text;
begin
  actor_id := auth.uid();

  if actor_id is null then
    return new;
  end if;

  if new.advisor_id is distinct from actor_id then
    raise exception 'NFAST08_PIPELINE_OWNER_MISMATCH';
  end if;

  event_time := coalesce(new.updated_at, now());
  source_reference :=
    'PIPELINE_PROSPECT:' || new.id::text;

  if tg_op = 'INSERT' then
    insert into public.prospect_timeline_events (
      prospect_id,
      advisor_id,
      event_type,
      event_source,
      source_record_reference,
      occurred_at,
      created_by,
      payload,
      evidence_references,
      idempotency_key
    )
    values (
      new.id,
      new.advisor_id,
      'PROSPECT_CREATED',
      'PIPELINE',
      source_reference,
      coalesce(new.created_at, event_time),
      new.advisor_id,
      jsonb_build_object(
        'stage',
        new.status
      ),
      '[]'::jsonb,
      'NFAST08:PIPELINE:PROSPECT_CREATED:' || new.id::text
    )
    on conflict do nothing;

    return new;
  end if;

  if new.status is distinct from old.status then
    insert into public.prospect_timeline_events (
      prospect_id,
      advisor_id,
      event_type,
      event_source,
      source_record_reference,
      occurred_at,
      created_by,
      payload,
      evidence_references,
      idempotency_key
    )
    values (
      new.id,
      new.advisor_id,
      'STAGE_CHANGED',
      'PIPELINE',
      source_reference,
      event_time,
      new.advisor_id,
      jsonb_build_object(
        'fromStage',
        old.status,
        'toStage',
        new.status
      ),
      '[]'::jsonb,
      'NFAST08:PIPELINE:STAGE_CHANGED:' ||
        new.id::text || ':' ||
        encode(
          digest(
            concat_ws(
              '|',
              old.status,
              new.status,
              event_time::text
            ),
            'sha256'
          ),
          'hex'
        )
    )
    on conflict do nothing;
  end if;

  if (
    new.next_action_type is distinct from old.next_action_type
    or new.next_action_at is distinct from old.next_action_at
  ) and new.next_action_at is not null then
    insert into public.prospect_timeline_events (
      prospect_id,
      advisor_id,
      event_type,
      event_source,
      source_record_reference,
      occurred_at,
      created_by,
      payload,
      evidence_references,
      idempotency_key
    )
    values (
      new.id,
      new.advisor_id,
      'FOLLOW_UP_PLANNED',
      'PIPELINE',
      source_reference,
      event_time,
      new.advisor_id,
      jsonb_build_object(
        'followUpType',
        coalesce(
          nullif(btrim(new.next_action_type), ''),
          'UNSPECIFIED'
        ),
        'dueAt',
        new.next_action_at
      ),
      '[]'::jsonb,
      'NFAST08:PIPELINE:FOLLOW_UP_PLANNED:' ||
        new.id::text || ':' ||
        encode(
          digest(
            concat_ws(
              '|',
              new.next_action_type,
              new.next_action_at::text,
              event_time::text
            ),
            'sha256'
          ),
          'hex'
        )
    )
    on conflict do nothing;
  end if;

  if new.archived_at is not null
     and old.archived_at is null then
    insert into public.prospect_timeline_events (
      prospect_id,
      advisor_id,
      event_type,
      event_source,
      source_record_reference,
      occurred_at,
      created_by,
      payload,
      evidence_references,
      idempotency_key
    )
    values (
      new.id,
      new.advisor_id,
      'PROSPECT_ARCHIVED',
      'PIPELINE',
      source_reference,
      new.archived_at,
      new.advisor_id,
      jsonb_build_object(
        'reasonCode',
        'ARCHIVED_BY_ADVISOR'
      ),
      '[]'::jsonb,
      'NFAST08:PIPELINE:PROSPECT_ARCHIVED:' || new.id::text
    )
    on conflict do nothing;
  end if;

  return new;
end;
$$;

drop trigger if exists
  forge_nfast08_capture_pipeline_timeline
on public.prospects;

create trigger
  forge_nfast08_capture_pipeline_timeline
after insert or update
on public.prospects
for each row
execute function
  public.forge_nfast08_capture_pipeline_timeline();

alter table public.prospect_timeline_events
  enable row level security;

revoke all
on table public.prospect_timeline_events
from public, anon, authenticated;

grant select
on table public.prospect_timeline_events
to authenticated;

drop policy if exists
  prospect_timeline_events_select_own
on public.prospect_timeline_events;

create policy
  prospect_timeline_events_select_own
on public.prospect_timeline_events
for select
to authenticated
using (advisor_id = auth.uid());

revoke all
on function
  public.forge_nfast08_append_prospect_timeline_event(
    uuid,
    text,
    timestamptz,
    text,
    jsonb,
    jsonb,
    text
  )
from public, anon, authenticated;

grant execute
on function
  public.forge_nfast08_append_prospect_timeline_event(
    uuid,
    text,
    timestamptz,
    text,
    jsonb,
    jsonb,
    text
  )
to authenticated;

revoke all
on function
  public.forge_nfast08_capture_pipeline_timeline()
from public, anon, authenticated;

revoke all
on function
  public.forge_nfast08_timeline_append_only_guard()
from public, anon, authenticated;

create or replace view
  public.prospect_commercial_timeline
with (security_invoker = true)
as
select
  id,
  prospect_id,
  advisor_id,
  event_type,
  event_source,
  source_record_reference,
  occurred_at,
  recorded_at,
  payload,
  evidence_references,
  contract_version,
  privacy_classification,
  retention_policy
from public.prospect_timeline_events;

revoke all
on public.prospect_commercial_timeline
from public, anon, authenticated;

grant select
on public.prospect_commercial_timeline
to authenticated;

comment on table public.prospect_timeline_events is
  'NFAST-08 commercial Timeline. Append-only, advisor-private, minimized. Not a draft, prompt, transcript, note, or technical audit store.';

comment on table public.prospect_audit_events is
  'Technical audit evidence only. It is not the NFAST-08 commercial Timeline and must not be projected into NASH without a later governed stage.';

commit;
