begin;

create temporary table cartera040_ids (
  user_a uuid not null,
  user_b uuid not null,
  person_a uuid not null,
  person_b uuid not null,
  account_id uuid not null,
  membership_id uuid not null,
  policy_id uuid not null,
  evidence_id uuid not null,
  version_id uuid not null,
  role_id uuid not null,
  payment_event_id uuid not null
) on commit drop;

insert into cartera040_ids values (
  gen_random_uuid(), gen_random_uuid(), gen_random_uuid(), gen_random_uuid(),
  gen_random_uuid(), gen_random_uuid(), gen_random_uuid(), gen_random_uuid(),
  gen_random_uuid(), gen_random_uuid(), gen_random_uuid()
);

create temporary table cartera040_payloads (
  name text primary key,
  payload jsonb not null
) on commit drop;

create temporary table cartera040_results (
  name text primary key,
  payload jsonb not null
) on commit drop;

grant select on cartera040_ids to authenticated;
grant select on cartera040_payloads to authenticated;
grant select, insert, update on cartera040_results to authenticated;

insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at
)
select
  '00000000-0000-0000-0000-000000000000'::uuid,
  user_a, 'authenticated', 'authenticated',
  'cartera040-acceptance-a@forge.invalid', '', now(),
  '{}'::jsonb, '{}'::jsonb, now(), now()
from cartera040_ids
union all
select
  '00000000-0000-0000-0000-000000000000'::uuid,
  user_b, 'authenticated', 'authenticated',
  'cartera040-acceptance-b@forge.invalid', '', now(),
  '{}'::jsonb, '{}'::jsonb, now(), now()
from cartera040_ids;

insert into public.commercial_people (
  id, advisor_id, person_reference, display_name, preferred_name,
  normalized_name, lifecycle_state, privacy_classification,
  evidence_references, created_by
)
select
  person_a, user_a, 'CARTERA040_ACCEPTANCE:PERSON:A',
  'Ana Cartera 040', 'Ana', 'ana cartera 040',
  'CONFIRMED', 'PRIVATE',
  jsonb_build_array('CARTERA040_ACCEPTANCE:IDENTITY:A'), user_a
from cartera040_ids
union all
select
  person_b, user_b, 'CARTERA040_ACCEPTANCE:PERSON:B',
  'Beto Cartera 040', 'Beto', 'beto cartera 040',
  'CONFIRMED', 'PRIVATE',
  jsonb_build_array('CARTERA040_ACCEPTANCE:IDENTITY:B'), user_b
from cartera040_ids;

insert into public.commercial_accounts (
  id, advisor_id, account_reference, account_type, display_label,
  lifecycle_state, privacy_classification, evidence_references, created_by
)
select
  account_id, user_a, 'CARTERA040_ACCEPTANCE:ACCOUNT:A', 'HOUSEHOLD',
  'Familia Cartera 040', 'CONFIRMED', 'PRIVATE',
  jsonb_build_array('CARTERA040_ACCEPTANCE:ACCOUNT_EVIDENCE:A'), user_a
from cartera040_ids;

insert into public.commercial_account_memberships (
  id, advisor_id, membership_reference, account_id, person_id,
  relationship_role, confirmation_state, privacy_classification,
  evidence_references, effective_from, created_by
)
select
  membership_id, user_a, 'CARTERA040_ACCEPTANCE:MEMBERSHIP:A',
  account_id, person_a, 'HOUSEHOLD_MEMBER', 'CONFIRMED', 'PRIVATE',
  jsonb_build_array('CARTERA040_ACCEPTANCE:MEMBERSHIP_EVIDENCE:A'),
  timestamptz '2026-07-01 00:00:00+00', user_a
from cartera040_ids;

insert into public.canonical_policies (
  id, advisor_id, policy_reference, carrier_reference, policy_number,
  product_reference, issue_date, effective_from, effective_to,
  status_value, status_source, status_as_of, currency, premium_amount,
  payment_frequency, sum_insured, completeness_state, freshness_state,
  conflict_state, current_version, created_by
)
select
  policy_id, user_a, 'CARTERA040_ACCEPTANCE:POLICY:A',
  'CARTERA040_ACCEPTANCE:CARRIER', '040-A',
  'CARTERA040_ACCEPTANCE:PRODUCT', date '2026-07-15',
  timestamptz '2026-07-15 00:00:00+00', timestamptz '2027-07-14 23:59:59+00',
  'ACTIVE', 'CARTERA040_ACCEPTANCE', timestamptz '2026-07-15 00:00:00+00',
  'MXN', 1200, 'MONTHLY', 1000000, 'COMPLETE', 'CURRENT', 'CLEAR', 1, user_a
from cartera040_ids;

insert into public.policy_evidence_versions (
  id, advisor_id, evidence_version_reference, policy_id, document_hash,
  source_type, observed_at, verification_state, field_claims, provenance, created_by
)
select
  evidence_id, user_a, 'CARTERA040_ACCEPTANCE:POLICY_EVIDENCE:A', policy_id,
  repeat('a', 64), 'REMOTE_ACCEPTANCE_FIXTURE',
  timestamptz '2026-07-15 00:00:00+00', 'CONFIRMED', '{}'::jsonb,
  jsonb_build_object('acceptance', 'CARTERA040'), user_a
from cartera040_ids;

insert into public.policy_versions (
  id, advisor_id, policy_id, policy_version_reference, version_number,
  facts, facts_digest, evidence_version_id, confirmed_at, confirmed_by
)
select
  version_id, user_a, policy_id, 'CARTERA040_ACCEPTANCE:POLICY_VERSION:A', 1,
  jsonb_build_object('productReference', 'CARTERA040_ACCEPTANCE:PRODUCT'),
  repeat('b', 64), evidence_id, timestamptz '2026-07-15 00:00:00+00', user_a
from cartera040_ids;

insert into public.policy_roles (
  id, advisor_id, policy_role_reference, policy_id, policy_version_id,
  participant_person_id, role_type, confirmation_state,
  privacy_classification, visibility_scope, evidence_references,
  effective_from, role_version, created_by
)
select
  role_id, user_a, 'CARTERA040_ACCEPTANCE:POLICY_ROLE:A', policy_id, version_id,
  person_a, 'INSURED', 'CONFIRMED', 'PRIVATE', 'POLICY_TEAM',
  jsonb_build_array('CARTERA040_ACCEPTANCE:POLICY_ROLE_EVIDENCE:A'),
  timestamptz '2026-07-15 00:00:00+00', 1, user_a
from cartera040_ids;

insert into public.cartera030c_confirmed_payment_events (
  id, advisor_id, payment_event_reference, policy_id, policy_reference,
  payment_evidence_reference, carrier_reference, payment_amount, currency,
  payment_date, period_covered_start, period_covered_end, payment_source,
  evidence_references, confirmation_state, event_digest, idempotency_key,
  confirmed_by, confirmed_at
)
select
  payment_event_id, user_a, 'CARTERA040_ACCEPTANCE:PAYMENT_EVENT:A',
  policy_id, 'CARTERA040_ACCEPTANCE:POLICY:A',
  'CARTERA040_ACCEPTANCE:PAYMENT_EVIDENCE:A',
  'CARTERA040_ACCEPTANCE:CARRIER', 1200, 'MXN', date '2026-07-20',
  date '2026-07-15', date '2026-08-14', 'payment_proof',
  jsonb_build_array('CARTERA040_ACCEPTANCE:PAYMENT_EVIDENCE:A'),
  'CONFIRMED', repeat('c', 64), 'CARTERA040_ACCEPTANCE:PAYMENT:A',
  user_a, timestamptz '2026-07-20 00:00:00+00'
from cartera040_ids;

insert into cartera040_payloads (name, payload)
select 'preference', command_payload || jsonb_build_object(
  'authorization', jsonb_build_object(
    'authorized', true,
    'payloadDigest', public.forge_cartera030b_digest(command_payload)
  )
)
from (
  select jsonb_build_object(
    'personReference', 'CARTERA040_ACCEPTANCE:PERSON:A',
    'memoryKind', 'CONTACT_PREFERENCE',
    'summary', 'Prefiere contacto por WhatsApp.',
    'valueCode', 'WHATSAPP',
    'occurredAt', '2026-08-01T04:00:00.000Z',
    'sourceAuthority', 'CLIENT_CONFIRMED',
    'sourceRecordReference', 'CARTERA040_ACCEPTANCE:SERVICE:1',
    'evidenceReferences', jsonb_build_array('CARTERA040_ACCEPTANCE:EVIDENCE:1'),
    'sensitivity', 'PERSONAL',
    'consentState', 'NOT_REQUIRED',
    'contextUse', 'GENERAL_RELATIONSHIP',
    'idempotencyKey', 'CARTERA040_ACCEPTANCE:MEMORY:1',
    'supersedesMemoryReference', null
  ) as command_payload
) source;

insert into cartera040_payloads (name, payload)
select 'preference-changed', command_payload || jsonb_build_object(
  'authorization', jsonb_build_object(
    'authorized', true,
    'payloadDigest', public.forge_cartera030b_digest(command_payload)
  )
)
from (
  select jsonb_build_object(
    'personReference', 'CARTERA040_ACCEPTANCE:PERSON:A',
    'memoryKind', 'CONTACT_PREFERENCE',
    'summary', 'Prefiere contacto por teléfono.',
    'valueCode', 'PHONE',
    'occurredAt', '2026-08-01T04:00:00.000Z',
    'sourceAuthority', 'CLIENT_CONFIRMED',
    'sourceRecordReference', 'CARTERA040_ACCEPTANCE:SERVICE:1',
    'evidenceReferences', jsonb_build_array('CARTERA040_ACCEPTANCE:EVIDENCE:1'),
    'sensitivity', 'PERSONAL',
    'consentState', 'NOT_REQUIRED',
    'contextUse', 'GENERAL_RELATIONSHIP',
    'idempotencyKey', 'CARTERA040_ACCEPTANCE:MEMORY:1',
    'supersedesMemoryReference', null
  ) as command_payload
) source;

insert into cartera040_payloads (name, payload)
select 'life-context', command_payload || jsonb_build_object(
  'authorization', jsonb_build_object(
    'authorized', true,
    'payloadDigest', public.forge_cartera030b_digest(command_payload)
  )
)
from (
  select jsonb_build_object(
    'personReference', 'CARTERA040_ACCEPTANCE:PERSON:A',
    'memoryKind', 'LIFE_CONTEXT',
    'summary', 'Confirmó un cambio familiar relevante para preparar la conversación.',
    'valueCode', null,
    'occurredAt', '2026-08-01T04:05:00.000Z',
    'sourceAuthority', 'CLIENT_CONFIRMED',
    'sourceRecordReference', 'CARTERA040_ACCEPTANCE:SERVICE:2',
    'evidenceReferences', jsonb_build_array('CARTERA040_ACCEPTANCE:EVIDENCE:2'),
    'sensitivity', 'SENSITIVE',
    'consentState', 'CONFIRMED',
    'contextUse', 'CONVERSATION_PREPARATION',
    'idempotencyKey', 'CARTERA040_ACCEPTANCE:MEMORY:2',
    'supersedesMemoryReference', null
  ) as command_payload
) source;

insert into cartera040_payloads (name, payload)
select 'life-context-unconsented', command_payload || jsonb_build_object(
  'authorization', jsonb_build_object(
    'authorized', true,
    'payloadDigest', public.forge_cartera030b_digest(command_payload)
  )
)
from (
  select jsonb_build_object(
    'personReference', 'CARTERA040_ACCEPTANCE:PERSON:A',
    'memoryKind', 'LIFE_CONTEXT',
    'summary', 'Contexto sin consentimiento.',
    'valueCode', null,
    'occurredAt', '2026-08-01T04:06:00.000Z',
    'sourceAuthority', 'ADVISOR_CONFIRMED',
    'sourceRecordReference', 'CARTERA040_ACCEPTANCE:SERVICE:3',
    'evidenceReferences', jsonb_build_array('CARTERA040_ACCEPTANCE:EVIDENCE:3'),
    'sensitivity', 'SENSITIVE',
    'consentState', 'UNKNOWN',
    'contextUse', 'CONVERSATION_PREPARATION',
    'idempotencyKey', 'CARTERA040_ACCEPTANCE:MEMORY:3',
    'supersedesMemoryReference', null
  ) as command_payload
) source;

select set_config('request.jwt.claim.sub', user_a::text, true) from cartera040_ids;
set local role authenticated;

insert into cartera040_results (name, payload)
select 'preference', public.forge_cartera040_record_relationship_memory(payload)
from cartera040_payloads where name = 'preference';

insert into cartera040_results (name, payload)
select 'preference-replay', public.forge_cartera040_record_relationship_memory(payload)
from cartera040_payloads where name = 'preference';

insert into cartera040_results (name, payload)
select 'preference-changed', public.forge_cartera040_record_relationship_memory(payload)
from cartera040_payloads where name = 'preference-changed';

insert into cartera040_results (name, payload)
select 'life-context', public.forge_cartera040_record_relationship_memory(payload)
from cartera040_payloads where name = 'life-context';

DO $$
declare
  unsafe_payload jsonb;
begin
  select payload into unsafe_payload
  from cartera040_payloads
  where name = 'life-context-unconsented';

  begin
    perform public.forge_cartera040_record_relationship_memory(unsafe_payload);
    raise exception 'CARTERA040_UNCONSENTED_LIFE_CONTEXT_UNEXPECTEDLY_ACCEPTED';
  exception
    when others then
      if position('CARTERA040_SENSITIVE_CONTEXT_REQUIRES_CONSENT' in sqlerrm) = 0
        and position('CARTERA040_LIFE_CONTEXT_BOUNDARY_VIOLATION' in sqlerrm) = 0 then
        raise;
      end if;
  end;
end;
$$;

insert into cartera040_results (name, payload)
values (
  'brief-owner',
  public.forge_cartera040_list_relationship_brief(jsonb_build_object(
    'personReference', 'CARTERA040_ACCEPTANCE:PERSON:A',
    'limit', 60
  ))
);

DO $$
begin
  perform 1 from public.cartera040_relationship_memory_entries limit 1;
  raise exception 'CARTERA040_DIRECT_MEMORY_READ_UNEXPECTEDLY_ALLOWED';
exception
  when insufficient_privilege then null;
end;
$$;

DO $$
begin
  insert into public.cartera040_relationship_memory_entries (
    advisor_id, memory_reference, person_id, person_reference,
    memory_kind, summary, occurred_at, source_authority,
    source_record_reference, evidence_references, sensitivity,
    consent_state, context_use, command_digest, idempotency_key, created_by
  )
  select
    user_a, 'RELATIONSHIP_MEMORY:DIRECT', person_a,
    'CARTERA040_ACCEPTANCE:PERSON:A', 'SERVICE_INTERACTION',
    'Direct write', now(), 'ADVISOR_CONFIRMED',
    'CARTERA040_ACCEPTANCE:DIRECT',
    jsonb_build_array('CARTERA040_ACCEPTANCE:DIRECT'),
    'PERSONAL', 'NOT_REQUIRED', 'GENERAL_RELATIONSHIP',
    repeat('a', 64), 'CARTERA040_ACCEPTANCE:DIRECT', user_a
  from cartera040_ids;
  raise exception 'CARTERA040_DIRECT_MEMORY_WRITE_UNEXPECTEDLY_ALLOWED';
exception
  when insufficient_privilege then null;
end;
$$;

reset role;
select set_config('request.jwt.claim.sub', user_b::text, true) from cartera040_ids;
set local role authenticated;

DO $$
begin
  perform public.forge_cartera040_list_relationship_brief(jsonb_build_object(
    'personReference', 'CARTERA040_ACCEPTANCE:PERSON:A',
    'limit', 60
  ));
  raise exception 'CARTERA040_CROSS_ADVISOR_BRIEF_UNEXPECTEDLY_ALLOWED';
exception
  when others then
    if position('CARTERA040_PERSON_NOT_FOUND' in sqlerrm) = 0 then
      raise;
    end if;
end;
$$;

reset role;

DO $$
declare
  preference jsonb;
  replay jsonb;
  changed jsonb;
  life_context jsonb;
  brief jsonb;
  brief_text text;
begin
  select payload into preference from cartera040_results where name = 'preference';
  select payload into replay from cartera040_results where name = 'preference-replay';
  select payload into changed from cartera040_results where name = 'preference-changed';
  select payload into life_context from cartera040_results where name = 'life-context';
  select payload into brief from cartera040_results where name = 'brief-owner';

  if preference ->> 'recordingState' <> 'COMPLETE'
    or preference ->> 'memoryKind' <> 'CONTACT_PREFERENCE' then
    raise exception 'CARTERA040_PREFERENCE_RECORD_INVALID:%', preference;
  end if;

  if replay <> preference then
    raise exception 'CARTERA040_EXACT_REPLAY_CHANGED:%:%', preference, replay;
  end if;

  if changed ->> 'recordingState' <> 'CONFLICT'
    or changed ->> 'reason' <> 'CHANGED_INPUT_REPLAY' then
    raise exception 'CARTERA040_CHANGED_REPLAY_NOT_CONFLICT:%', changed;
  end if;

  if life_context ->> 'recordingState' <> 'COMPLETE'
    or life_context ->> 'consentState' <> 'CONFIRMED'
    or (life_context ->> 'lifeContextIsSalesTrigger')::boolean then
    raise exception 'CARTERA040_LIFE_CONTEXT_RESULT_INVALID:%', life_context;
  end if;

  if (select count(*) from public.cartera040_relationship_memory_entries
      where person_reference = 'CARTERA040_ACCEPTANCE:PERSON:A') <> 2 then
    raise exception 'CARTERA040_MEMORY_COUNT_INVALID';
  end if;

  if not exists (
    select 1 from public.cartera040_relationship_memory_conflicts
    where conflict_type = 'CHANGED_INPUT_REPLAY'
      and claims ->> 'idempotencyKey' = 'CARTERA040_ACCEPTANCE:MEMORY:1'
  ) then
    raise exception 'CARTERA040_CHANGED_REPLAY_CONFLICT_NOT_DURABLE';
  end if;

  if jsonb_array_length(brief -> 'preferences') <> 1
    or jsonb_array_length(brief -> 'lifeContext') <> 1
    or jsonb_array_length(brief -> 'network' -> 'accounts') <> 1
    or jsonb_array_length(brief -> 'network' -> 'policies') <> 1
    or jsonb_array_length(brief -> 'history') <> 4 then
    raise exception 'CARTERA040_BRIEF_COMPOSITION_INVALID:%', brief;
  end if;

  if not exists (
    select 1
    from jsonb_array_elements(brief -> 'history') item
    where item ->> 'eventType' = 'POLICY_CONFIRMED'
  ) or not exists (
    select 1
    from jsonb_array_elements(brief -> 'history') item
    where item ->> 'eventType' = 'PAYMENT_CONFIRMED'
  ) then
    raise exception 'CARTERA040_MULTI_AUTHORITY_HISTORY_MISSING:%', brief;
  end if;

  if (brief -> 'boundaries' ->> 'lifeContextIsSalesTrigger')::boolean
    or (brief -> 'boundaries' ->> 'automaticOpportunityCreation')::boolean
    or (brief -> 'boundaries' ->> 'automaticContactExecution')::boolean
    or (brief -> 'boundaries' ->> 'finalMessageGeneration')::boolean
    or (brief -> 'boundaries' ->> 'rawEvidenceExposed')::boolean
    or (brief -> 'boundaries' ->> 'beneficiaryDataExposed')::boolean
    or (brief -> 'boundaries' ->> 'paymentInstrumentDataExposed')::boolean then
    raise exception 'CARTERA040_BRIEF_BOUNDARY_INVALID:%', brief;
  end if;

  -- Inspect concrete restricted data keys, not the safe boundary metadata that
  -- explicitly reports those categories as false.
  brief_text := lower(brief::text);
  if brief_text like '%verified_phone%'
    or brief_text like '%verified_email%'
    or brief_text like '%"beneficiaryreference":%'
    or brief_text like '%"beneficiaryname":%'
    or brief_text like '%"beneficiaryrole":%'
    or brief_text like '%"paymentinstrumentreference":%'
    or brief_text like '%"bankaccount":%'
    or brief_text like '%"routingnumber":%'
    or brief_text like '%evidence_references%'
    or brief_text like '%"documentref":%'
    or brief_text like '%providerresponse%'
    or brief_text like '%transcript%' then
    raise exception 'CARTERA040_RESTRICTED_DATA_LEAK:%', brief_text;
  end if;

  if coalesce((preference ->> 'automaticOpportunityCreated')::boolean, true)
    or coalesce((preference ->> 'automaticContactExecuted')::boolean, true)
    or coalesce((preference ->> 'finalMessageGenerated')::boolean, true) then
    raise exception 'CARTERA040_AUTOPILOT_OUTPUT_INVALID:%', preference;
  end if;
end;
$$;

rollback;

select 'PASS CARTERA040_TRANSACTIONAL_ACCEPTANCE' as acceptance;
