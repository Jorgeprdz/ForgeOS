begin;

create temporary table cartera070_ids (
  user_a uuid not null,
  user_b uuid not null,
  person_a uuid not null,
  person_c uuid not null,
  person_b uuid not null,
  policy_id uuid not null,
  evidence_id uuid not null,
  version_id uuid not null,
  role_a_id uuid not null,
  role_c_id uuid not null,
  obligation_id uuid not null
) on commit drop;

insert into cartera070_ids values (
  gen_random_uuid(), gen_random_uuid(), gen_random_uuid(), gen_random_uuid(),
  gen_random_uuid(), gen_random_uuid(), gen_random_uuid(), gen_random_uuid(),
  gen_random_uuid(), gen_random_uuid(), gen_random_uuid()
);

create temporary table cartera070_results (
  name text primary key,
  payload jsonb not null
) on commit drop;
grant select on cartera070_ids to authenticated;
grant select, insert on cartera070_results to authenticated;

insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at
)
select '00000000-0000-0000-0000-000000000000'::uuid, user_a,
  'authenticated', 'authenticated', 'cartera070-acceptance-a@forge.invalid', '', now(),
  '{}'::jsonb, '{}'::jsonb, now(), now()
from cartera070_ids
union all
select '00000000-0000-0000-0000-000000000000'::uuid, user_b,
  'authenticated', 'authenticated', 'cartera070-acceptance-b@forge.invalid', '', now(),
  '{}'::jsonb, '{}'::jsonb, now(), now()
from cartera070_ids;

insert into public.commercial_people (
  id, advisor_id, person_reference, display_name, preferred_name,
  normalized_name, lifecycle_state, privacy_classification,
  evidence_references, created_by
)
select person_a, user_a, 'CARTERA070_ACCEPTANCE:PERSON:A',
  'Ana Cartera 070', 'Ana', 'ana cartera 070', 'CONFIRMED', 'PRIVATE',
  jsonb_build_array('CARTERA070_ACCEPTANCE:IDENTITY:A'), user_a
from cartera070_ids
union all
select person_c, user_a, 'CARTERA070_ACCEPTANCE:PERSON:C',
  'Carla Cartera 070', 'Carla', 'carla cartera 070', 'CONFIRMED', 'PRIVATE',
  jsonb_build_array('CARTERA070_ACCEPTANCE:IDENTITY:C'), user_a
from cartera070_ids
union all
select person_b, user_b, 'CARTERA070_ACCEPTANCE:PERSON:B',
  'Beto Cartera 070', 'Beto', 'beto cartera 070', 'CONFIRMED', 'PRIVATE',
  jsonb_build_array('CARTERA070_ACCEPTANCE:IDENTITY:B'), user_b
from cartera070_ids;

insert into public.canonical_policies (
  id, advisor_id, policy_reference, carrier_reference, policy_number,
  product_reference, issue_date, effective_from, effective_to,
  status_value, status_source, status_as_of, currency, premium_amount,
  payment_frequency, sum_insured, completeness_state, freshness_state,
  conflict_state, current_version, created_by
)
select policy_id, user_a, 'CARTERA070_ACCEPTANCE:POLICY:A',
  'CARTERA070_ACCEPTANCE:CARRIER', '070-A',
  'CARTERA070_ACCEPTANCE:PRODUCT', date '2024-01-15',
  timestamptz '2024-01-15 00:00:00+00', timestamptz '2026-09-15 23:59:59+00',
  'ACTIVE', 'CARTERA070_ACCEPTANCE', timestamptz '2026-08-01 00:00:00+00',
  'MXN', 1200, 'MONTHLY', 1000000, 'INCOMPLETE', 'CURRENT', 'CLEAR', 1, user_a
from cartera070_ids;

insert into public.policy_evidence_versions (
  id, advisor_id, evidence_version_reference, policy_id, document_hash,
  source_type, observed_at, verification_state, field_claims, provenance, created_by
)
select evidence_id, user_a, 'CARTERA070_ACCEPTANCE:POLICY_EVIDENCE:A', policy_id,
  repeat('a', 64), 'REMOTE_ACCEPTANCE_FIXTURE',
  timestamptz '2024-01-15 00:00:00+00', 'CONFIRMED', '{}'::jsonb,
  jsonb_build_object('acceptance', 'CARTERA070'), user_a
from cartera070_ids;

insert into public.policy_versions (
  id, advisor_id, policy_id, policy_version_reference, version_number,
  facts, facts_digest, evidence_version_id, confirmed_at, confirmed_by
)
select version_id, user_a, policy_id, 'CARTERA070_ACCEPTANCE:POLICY_VERSION:A', 1,
  jsonb_build_object('productReference', 'CARTERA070_ACCEPTANCE:PRODUCT'),
  repeat('b', 64), evidence_id, timestamptz '2024-01-15 00:00:00+00', user_a
from cartera070_ids;

insert into public.policy_roles (
  id, advisor_id, policy_role_reference, policy_id, policy_version_id,
  participant_person_id, role_type, confirmation_state,
  privacy_classification, visibility_scope, evidence_references,
  effective_from, role_version, created_by
)
select role_a_id, user_a, 'CARTERA070_ACCEPTANCE:POLICY_ROLE:A', policy_id, version_id,
  person_a, 'INSURED', 'CONFIRMED', 'PRIVATE', 'POLICY_TEAM',
  jsonb_build_array('CARTERA070_ACCEPTANCE:POLICY_ROLE_EVIDENCE:A'),
  timestamptz '2024-01-15 00:00:00+00', 1, user_a
from cartera070_ids
union all
select role_c_id, user_a, 'CARTERA070_ACCEPTANCE:POLICY_ROLE:C', policy_id, version_id,
  person_c, 'POLICYHOLDER', 'CONFIRMED', 'PRIVATE', 'POLICY_TEAM',
  jsonb_build_array('CARTERA070_ACCEPTANCE:POLICY_ROLE_EVIDENCE:C'),
  timestamptz '2024-01-15 00:00:00+00', 1, user_a
from cartera070_ids;

insert into public.cartera030b_expected_payment_obligations (
  id, advisor_id, obligation_reference, policy_id, policy_version_id,
  policy_reference, policy_version_reference, policy_terms_digest,
  obligation_kind, expected_date, expected_amount, currency,
  payment_frequency, policy_year, sequence_number, status,
  schedule_rule_reference, source_evidence_references,
  matched_payment_event_references, confirmation_state, timezone,
  date_authority, generation_idempotency_key, generation_digest, created_by
)
select obligation_id, user_a, 'CARTERA070_ACCEPTANCE:OBLIGATION:A', policy_id, version_id,
  'CARTERA070_ACCEPTANCE:POLICY:A', 'CARTERA070_ACCEPTANCE:POLICY_VERSION:A',
  repeat('c', 64), 'PREMIUM_PAYMENT', date '2026-08-01', 1200, 'MXN',
  'MONTHLY', 3, 1, 'CONFIRMATION_REQUIRED',
  'CARTERA070_ACCEPTANCE:SCHEDULE:RULE',
  jsonb_build_array('CARTERA070_ACCEPTANCE:PAYMENT_EVIDENCE:A'),
  '[]'::jsonb, 'EVIDENCE_PENDING', 'America/Mexico_City',
  'CONFIRMED_POLICY_TERMS_DERIVED', 'CARTERA070_ACCEPTANCE:GENERATION:A',
  repeat('d', 64), user_a
from cartera070_ids;

insert into public.cartera040_relationship_memory_entries (
  advisor_id, memory_reference, person_id, person_reference,
  memory_kind, summary, value_code, occurred_at, source_authority,
  source_record_reference, evidence_references, sensitivity,
  consent_state, context_use, command_digest, idempotency_key, created_by
)
select user_a, 'CARTERA070_ACCEPTANCE:MEMORY:NEED', person_a,
  'CARTERA070_ACCEPTANCE:PERSON:A', 'NEED',
  'Necesidad de protección adicional confirmada.', null,
  timestamptz '2026-07-20 00:00:00+00', 'CLIENT_CONFIRMED',
  'CARTERA070_ACCEPTANCE:SOURCE:NEED',
  jsonb_build_array('CARTERA070_ACCEPTANCE:EVIDENCE:NEED'),
  'PERSONAL', 'NOT_REQUIRED', 'GENERAL_RELATIONSHIP',
  repeat('e', 64), 'CARTERA070_ACCEPTANCE:KEY:NEED', user_a
from cartera070_ids
union all
select user_a, 'CARTERA070_ACCEPTANCE:MEMORY:REFERRAL:1', person_a,
  'CARTERA070_ACCEPTANCE:PERSON:A', 'ORIGIN_REFERRAL',
  'Confirmó disposición para una introducción.', 'WILLING_TO_INTRODUCE',
  timestamptz '2026-07-22 00:00:00+00', 'CLIENT_CONFIRMED',
  'CARTERA070_ACCEPTANCE:SOURCE:REFERRAL:1',
  jsonb_build_array('CARTERA070_ACCEPTANCE:EVIDENCE:REFERRAL:1'),
  'PERSONAL', 'CONFIRMED', 'GENERAL_RELATIONSHIP',
  repeat('f', 64), 'CARTERA070_ACCEPTANCE:KEY:REFERRAL:1', user_a
from cartera070_ids
union all
select user_a, 'CARTERA070_ACCEPTANCE:MEMORY:REFERRAL:2', person_a,
  'CARTERA070_ACCEPTANCE:PERSON:A', 'ORIGIN_REFERRAL',
  'Reconfirmó disposición para otra introducción.', 'WILLING_TO_INTRODUCE',
  timestamptz '2026-07-25 00:00:00+00', 'CLIENT_CONFIRMED',
  'CARTERA070_ACCEPTANCE:SOURCE:REFERRAL:2',
  jsonb_build_array('CARTERA070_ACCEPTANCE:EVIDENCE:REFERRAL:2'),
  'PERSONAL', 'CONFIRMED', 'GENERAL_RELATIONSHIP',
  repeat('1', 64), 'CARTERA070_ACCEPTANCE:KEY:REFERRAL:2', user_a
from cartera070_ids
union all
select user_a, 'CARTERA070_ACCEPTANCE:MEMORY:SERVICE', person_a,
  'CARTERA070_ACCEPTANCE:PERSON:A', 'SERVICE_INTERACTION',
  'Interacción reciente de servicio.', null,
  timestamptz '2026-07-29 00:00:00+00', 'ADVISOR_CONFIRMED',
  'CARTERA070_ACCEPTANCE:SOURCE:SERVICE',
  jsonb_build_array('CARTERA070_ACCEPTANCE:EVIDENCE:SERVICE'),
  'PERSONAL', 'NOT_REQUIRED', 'SERVICE_ONLY',
  repeat('2', 64), 'CARTERA070_ACCEPTANCE:KEY:SERVICE', user_a
from cartera070_ids
union all
select user_a, 'CARTERA070_ACCEPTANCE:MEMORY:COMMITMENT', person_a,
  'CARTERA070_ACCEPTANCE:PERSON:A', 'UNRESOLVED_COMMITMENT',
  'Enviar resumen de servicio acordado.', null,
  timestamptz '2026-07-30 00:00:00+00', 'ADVISOR_CONFIRMED',
  'CARTERA070_ACCEPTANCE:SOURCE:COMMITMENT',
  jsonb_build_array('CARTERA070_ACCEPTANCE:EVIDENCE:COMMITMENT'),
  'PERSONAL', 'NOT_REQUIRED', 'SERVICE_ONLY',
  repeat('3', 64), 'CARTERA070_ACCEPTANCE:KEY:COMMITMENT', user_a
from cartera070_ids;

select set_config('request.jwt.claim.sub', user_a::text, true) from cartera070_ids;
set local role authenticated;

insert into cartera070_results (name, payload)
values (
  'owner',
  public.forge_cartera070_list_relational_activation(jsonb_build_object(
    'asOfDate', '2026-08-01',
    'availableMinutes', 60,
    'maxCards', 4
  ))
);

do $$
declare
  result jsonb;
  selected_minutes integer;
  selected_cards integer;
begin
  select payload into result from cartera070_results where name = 'owner';
  selected_minutes := (result #>> '{summary,selectedMinutes}')::integer;
  selected_cards := jsonb_array_length(result -> 'items');
  if selected_cards < 1 or selected_cards > 4 then
    raise exception 'CARTERA070_SELECTED_CARD_COUNT_INVALID';
  end if;
  if selected_minutes > 60 then
    raise exception 'CARTERA070_CAPACITY_EXCEEDED';
  end if;
  if (result #>> '{summary,totalCandidates}')::integer < selected_cards then
    raise exception 'CARTERA070_TOTAL_CANDIDATES_INVALID';
  end if;
  if not (result -> 'items' @> '[{"actionClass":"CONFIRM_PAYMENT"}]'::jsonb) then
    raise exception 'CARTERA070_CONFIRM_PAYMENT_CARD_MISSING';
  end if;
  if result ->> 'selectionMode' <> 'CAPACITY_FIT_DISPLAY_ORDER_NOT_FINAL_PRIORITY'
     or result ->> 'nbaAuthorityState' <> 'NOT_CONNECTED' then
    raise exception 'CARTERA070_SELECTION_AUTHORITY_INVALID';
  end if;
  if jsonb_path_exists(result, '$.items[*] ? (@.contactExecuted == true)')
     or jsonb_path_exists(result, '$.items[*] ? (@.messageSent == true)')
     or jsonb_path_exists(result, '$.items[*] ? (@.taskCreated == true)')
     or jsonb_path_exists(result, '$.items[*] ? (@.calendarEventCreated == true)')
     or jsonb_path_exists(result, '$.items[*] ? (@.opportunityCreated == true)')
     or jsonb_path_exists(result, '$.items[*] ? (@.referralRequested == true)')
     or jsonb_path_exists(result, '$.items[*] ? (@.finalNbaPriority == true)')
     or jsonb_path_exists(result, '$.items[*] ? (@.variableRewardUsed == true)')
     or jsonb_path_exists(result, '$.items[*] ? (@.artificialActivityCreated == true)') then
    raise exception 'CARTERA070_RESTRICTED_EFFECT_EXPOSED';
  end if;
  if result #>> '{boundaries,advisorConfirmationRequired}' <> 'true'
     or result #>> '{boundaries,variableRewardOptimization}' <> 'false'
     or result #>> '{boundaries,artificialActivityInflation}' <> 'false' then
    raise exception 'CARTERA070_BOUNDARY_INVALID';
  end if;
end;
$$;

reset role;
select set_config('request.jwt.claim.sub', user_b::text, true) from cartera070_ids;
set local role authenticated;

insert into cartera070_results (name, payload)
values (
  'cross-advisor',
  public.forge_cartera070_list_relational_activation(jsonb_build_object(
    'asOfDate', '2026-08-01',
    'availableMinutes', 60,
    'maxCards', 4
  ))
);

do $$
declare
  result jsonb;
begin
  select payload into result from cartera070_results where name = 'cross-advisor';
  if jsonb_array_length(result -> 'items') <> 0
     or (result #>> '{summary,totalCandidates}')::integer <> 0 then
    raise exception 'CARTERA070_CROSS_ADVISOR_LEAK';
  end if;
end;
$$;

reset role;
rollback;
select 'PASS CARTERA070_TRANSACTIONAL_ACCEPTANCE' as acceptance;
