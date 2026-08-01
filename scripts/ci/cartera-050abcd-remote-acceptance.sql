begin;

create temporary table cartera050_ids (
  user_a uuid not null,
  user_b uuid not null,
  person_a uuid not null,
  policy_a uuid not null,
  evidence_a uuid not null,
  version_a uuid not null,
  role_a uuid not null
) on commit drop;

insert into cartera050_ids values (
  gen_random_uuid(), gen_random_uuid(), gen_random_uuid(), gen_random_uuid(),
  gen_random_uuid(), gen_random_uuid(), gen_random_uuid()
);

create temporary table cartera050_results (
  name text primary key,
  payload jsonb not null
) on commit drop;

grant select on cartera050_ids to authenticated;
grant select, insert, update on cartera050_results to authenticated;

insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at
)
select
  '00000000-0000-0000-0000-000000000000'::uuid,
  user_a, 'authenticated', 'authenticated',
  'cartera050-acceptance-a@forge.invalid', '', now(),
  '{}'::jsonb, '{}'::jsonb, now(), now()
from cartera050_ids
union all
select
  '00000000-0000-0000-0000-000000000000'::uuid,
  user_b, 'authenticated', 'authenticated',
  'cartera050-acceptance-b@forge.invalid', '', now(),
  '{}'::jsonb, '{}'::jsonb, now(), now()
from cartera050_ids;

insert into public.commercial_people (
  id, advisor_id, person_reference, display_name, preferred_name,
  normalized_name, lifecycle_state, privacy_classification,
  evidence_references, created_by
)
select
  person_a, user_a, 'CARTERA050_ACCEPTANCE:PERSON:A',
  'Ana Radar 050', 'Ana', 'ana radar 050',
  'CONFIRMED', 'PRIVATE',
  jsonb_build_array('CARTERA050_ACCEPTANCE:IDENTITY:A'), user_a
from cartera050_ids;

insert into public.canonical_policies (
  id, advisor_id, policy_reference, carrier_reference, policy_number,
  product_reference, issue_date, effective_from, effective_to,
  status_value, status_source, status_as_of, currency, premium_amount,
  payment_frequency, sum_insured, completeness_state, freshness_state,
  conflict_state, current_version, created_by
)
select
  policy_a, user_a, 'CARTERA050_ACCEPTANCE:POLICY:A',
  'CARTERA050_ACCEPTANCE:CARRIER', '050-A',
  'CARTERA050_ACCEPTANCE:PRODUCT', date '2025-08-05',
  timestamptz '2025-08-05 00:00:00+00', timestamptz '2026-08-20 23:59:59+00',
  'ACTIVE', 'CARTERA050_ACCEPTANCE', timestamptz '2026-08-01 00:00:00+00',
  'MXN', 1200, 'MONTHLY', 1000000, 'COMPLETE', 'CURRENT', 'CLEAR', 1, user_a
from cartera050_ids;

insert into public.policy_evidence_versions (
  id, advisor_id, evidence_version_reference, policy_id, document_hash,
  source_type, observed_at, verification_state, field_claims, provenance, created_by
)
select
  evidence_a, user_a, 'CARTERA050_ACCEPTANCE:POLICY_EVIDENCE:A', policy_a,
  repeat('d', 64), 'REMOTE_ACCEPTANCE_FIXTURE',
  timestamptz '2026-08-01 00:00:00+00', 'CONFIRMED', '{}'::jsonb,
  jsonb_build_object('acceptance', 'CARTERA050'), user_a
from cartera050_ids;

insert into public.policy_versions (
  id, advisor_id, policy_id, policy_version_reference, version_number,
  facts, facts_digest, evidence_version_id, confirmed_at, confirmed_by
)
select
  version_a, user_a, policy_a, 'CARTERA050_ACCEPTANCE:POLICY_VERSION:A', 1,
  jsonb_build_object('productReference', 'CARTERA050_ACCEPTANCE:PRODUCT'),
  repeat('e', 64), evidence_a, timestamptz '2026-08-01 00:00:00+00', user_a
from cartera050_ids;

insert into public.policy_roles (
  id, advisor_id, policy_role_reference, policy_id, policy_version_id,
  participant_person_id, role_type, confirmation_state,
  privacy_classification, visibility_scope, evidence_references,
  effective_from, role_version, created_by
)
select
  role_a, user_a, 'CARTERA050_ACCEPTANCE:POLICY_ROLE:A', policy_a, version_a,
  person_a, 'INSURED', 'CONFIRMED', 'PRIVATE', 'POLICY_TEAM',
  jsonb_build_array('CARTERA050_ACCEPTANCE:POLICY_ROLE_EVIDENCE:A'),
  timestamptz '2025-08-05 00:00:00+00', 1, user_a
from cartera050_ids;

insert into public.cartera030b_expected_payment_obligations (
  advisor_id, obligation_reference, policy_id, policy_version_id,
  policy_reference, policy_version_reference, policy_terms_digest,
  obligation_kind, expected_date, expected_amount, currency,
  payment_frequency, policy_year, sequence_number, status,
  schedule_rule_reference, source_evidence_references,
  matched_payment_event_references, confirmation_state, timezone,
  date_authority, generation_idempotency_key, generation_digest, created_by
)
select
  user_a, 'CARTERA050_ACCEPTANCE:OBLIGATION:UPCOMING', policy_a, version_a,
  'CARTERA050_ACCEPTANCE:POLICY:A', 'CARTERA050_ACCEPTANCE:POLICY_VERSION:A',
  repeat('e', 64), 'PREMIUM_PAYMENT', date '2026-08-03', 1200, 'MXN',
  'MONTHLY', 2, 1, 'SCHEDULED', 'CARTERA050_ACCEPTANCE:RULE:MONTHLY',
  '[]'::jsonb, '[]'::jsonb, 'SCHEDULE_DERIVED', 'America/Mexico_City',
  'CONFIRMED_POLICY_TERMS_DERIVED', 'CARTERA050_ACCEPTANCE:GEN:UPCOMING',
  repeat('f', 64), user_a
from cartera050_ids
union all
select
  user_a, 'CARTERA050_ACCEPTANCE:OBLIGATION:OVERDUE', policy_a, version_a,
  'CARTERA050_ACCEPTANCE:POLICY:A', 'CARTERA050_ACCEPTANCE:POLICY_VERSION:A',
  repeat('e', 64), 'PREMIUM_PAYMENT', date '2026-07-20', 1200, 'MXN',
  'MONTHLY', 1, 2, 'SCHEDULED', 'CARTERA050_ACCEPTANCE:RULE:MONTHLY',
  '[]'::jsonb, '[]'::jsonb, 'SCHEDULE_DERIVED', 'America/Mexico_City',
  'CONFIRMED_POLICY_TERMS_DERIVED', 'CARTERA050_ACCEPTANCE:GEN:OVERDUE',
  repeat('a', 64), user_a
from cartera050_ids;

insert into public.cartera040_relationship_memory_entries (
  advisor_id, memory_reference, person_id, person_reference,
  memory_kind, summary, occurred_at, source_authority,
  source_record_reference, evidence_references, sensitivity,
  consent_state, context_use, command_digest, idempotency_key, created_by
)
select
  user_a, 'CARTERA050_ACCEPTANCE:MEMORY:SERVICE', person_a,
  'CARTERA050_ACCEPTANCE:PERSON:A', 'SERVICE_EXPECTATION',
  'Revisar documentación de servicio pendiente.',
  timestamptz '2026-07-30 12:00:00+00', 'ADVISOR_CONFIRMED',
  'CARTERA050_ACCEPTANCE:SERVICE:1',
  jsonb_build_array('CARTERA050_ACCEPTANCE:EVIDENCE:SERVICE:1'),
  'PERSONAL', 'NOT_REQUIRED', 'GENERAL_RELATIONSHIP',
  repeat('b', 64), 'CARTERA050_ACCEPTANCE:MEMORY:SERVICE', user_a
from cartera050_ids;

select set_config('request.jwt.claim.sub', user_a::text, true) from cartera050_ids;
set local role authenticated;

insert into cartera050_results (name, payload)
values (
  'owner',
  public.forge_cartera050_list_future_radar(jsonb_build_object(
    'asOfDate', '2026-08-01',
    'timezone', 'America/Mexico_City'
  ))
);

reset role;
select set_config('request.jwt.claim.sub', user_b::text, true) from cartera050_ids;
set local role authenticated;

insert into cartera050_results (name, payload)
values (
  'other-advisor',
  public.forge_cartera050_list_future_radar(jsonb_build_object(
    'asOfDate', '2026-08-01',
    'timezone', 'America/Mexico_City'
  ))
);

reset role;

DO $$
declare
  owner_radar jsonb;
  other_radar jsonb;
  radar_text text;
begin
  select payload into owner_radar from cartera050_results where name = 'owner';
  select payload into other_radar from cartera050_results where name = 'other-advisor';

  if owner_radar ->> 'asOfDate' <> '2026-08-01'
    or owner_radar ->> 'timezone' <> 'America/Mexico_City'
    or coalesce((owner_radar ->> 'readOnly')::boolean, false) is not true then
    raise exception 'CARTERA050_ENVELOPE_INVALID:%', owner_radar;
  end if;

  if jsonb_array_length(owner_radar -> 'items') < 6 then
    raise exception 'CARTERA050_SIGNAL_COUNT_INVALID:%', owner_radar;
  end if;

  if not exists (
    select 1 from jsonb_array_elements(owner_radar -> 'items') item
    where item ->> 'signalType' = 'EXPECTED_PAYMENT'
      and item ->> 'horizon' = 'NEXT_7_DAYS'
      and item ->> 'truthClass' = 'SCHEDULED_EVENT'
  ) then
    raise exception 'CARTERA050_EXPECTED_PAYMENT_MISSING:%', owner_radar;
  end if;

  if not exists (
    select 1 from jsonb_array_elements(owner_radar -> 'items') item
    where item ->> 'signalType' = 'POSSIBLE_LATE_PAYMENT'
      and item ->> 'horizon' = 'OVERDUE'
      and item ->> 'truthClass' = 'INFERENCE'
  ) then
    raise exception 'CARTERA050_LATE_PAYMENT_INFERENCE_MISSING:%', owner_radar;
  end if;

  if not exists (
    select 1 from jsonb_array_elements(owner_radar -> 'items') item
    where item ->> 'signalType' = 'POLICY_YEAR_TRANSITION'
      and item ->> 'eventDate' = '2026-08-05'
  ) then
    raise exception 'CARTERA050_POLICY_YEAR_TRANSITION_MISSING:%', owner_radar;
  end if;

  if not exists (
    select 1 from jsonb_array_elements(owner_radar -> 'items') item
    where item ->> 'signalType' = 'RELATIONSHIP_REVIEW_DUE'
  ) then
    raise exception 'CARTERA050_RELATIONSHIP_REVIEW_MISSING:%', owner_radar;
  end if;

  if not exists (
    select 1 from jsonb_array_elements(owner_radar -> 'items') item
    where item ->> 'signalType' = 'POLICY_SERVICE_REQUIRED'
  ) then
    raise exception 'CARTERA050_SERVICE_SIGNAL_MISSING:%', owner_radar;
  end if;

  if exists (
    select 1 from jsonb_array_elements(owner_radar -> 'items') item
    where nullif(item ->> 'whyThisPerson', '') is null
       or nullif(item ->> 'whyNow', '') is null
       or jsonb_array_length(item -> 'evidenceSummary') < 1
       or nullif(item ->> 'uncertainty', '') is null
       or nullif(item ->> 'smallestUsefulAction', '') is null
       or coalesce((item ->> 'advisorConfirmationRequired')::boolean, false) is not true
  ) then
    raise exception 'CARTERA050_EXPLAINABILITY_CONTRACT_INVALID:%', owner_radar;
  end if;

  if (owner_radar -> 'boundaries' ->> 'automaticContact')::boolean
    or (owner_radar -> 'boundaries' ->> 'automaticOpportunity')::boolean
    or (owner_radar -> 'boundaries' ->> 'finalMessageGeneration')::boolean
    or (owner_radar -> 'boundaries' ->> 'lapseInference')::boolean
    or (owner_radar -> 'boundaries' ->> 'compensationCalculation')::boolean
    or (owner_radar -> 'boundaries' ->> 'conservationFormulaOwnership')::boolean
    or (owner_radar -> 'boundaries' ->> 'finalPriorityTruth')::boolean
    or (owner_radar -> 'boundaries' ->> 'humanConfirmationRequired')::boolean is not true then
    raise exception 'CARTERA050_BOUNDARIES_INVALID:%', owner_radar;
  end if;

  if owner_radar -> 'sourceAvailability' ->> 'conservationIntelligence' <> 'ADAPTER_REQUIRED'
    or owner_radar -> 'sourceAvailability' ->> 'compensationIntelligence' <> 'ADAPTER_REQUIRED' then
    raise exception 'CARTERA050_EXTERNAL_AUTHORITY_BOUNDARY_INVALID:%', owner_radar;
  end if;

  if jsonb_array_length(other_radar -> 'items') <> 0 then
    raise exception 'CARTERA050_CROSS_ADVISOR_LEAK:%', other_radar;
  end if;

  radar_text := lower(owner_radar::text);
  if radar_text like '%"evidencereferences"%'
    or radar_text like '%"rawevidence"%'
    or radar_text like '%"beneficiary"%'
    or radar_text like '%"paymentinstrument"%'
    or radar_text like '%"bankaccount"%'
    or radar_text like '%"commissionformula"%'
    or radar_text like '%"riskScore"%'
    or radar_text like '%"finalmessage"%'
    or radar_text like '%"priorityscore"%' then
    raise exception 'CARTERA050_RESTRICTED_DATA_LEAK:%', radar_text;
  end if;
end;
$$;

rollback;

select 'PASS CARTERA050_TRANSACTIONAL_ACCEPTANCE' as acceptance;
