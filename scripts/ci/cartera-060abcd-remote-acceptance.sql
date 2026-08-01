begin;

create temporary table cartera060_ids (
  user_a uuid not null,
  user_b uuid not null,
  person_a uuid not null,
  person_b uuid not null,
  policy_id uuid not null,
  evidence_id uuid not null,
  version_id uuid not null,
  role_id uuid not null
) on commit drop;

insert into cartera060_ids values (
  gen_random_uuid(), gen_random_uuid(), gen_random_uuid(), gen_random_uuid(),
  gen_random_uuid(), gen_random_uuid(), gen_random_uuid(), gen_random_uuid()
);

create temporary table cartera060_results (
  name text primary key,
  payload jsonb not null
) on commit drop;
grant select on cartera060_ids to authenticated;
grant select, insert on cartera060_results to authenticated;

insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at
)
select '00000000-0000-0000-0000-000000000000'::uuid, user_a,
  'authenticated', 'authenticated', 'cartera060-acceptance-a@forge.invalid', '', now(),
  '{}'::jsonb, '{}'::jsonb, now(), now()
from cartera060_ids
union all
select '00000000-0000-0000-0000-000000000000'::uuid, user_b,
  'authenticated', 'authenticated', 'cartera060-acceptance-b@forge.invalid', '', now(),
  '{}'::jsonb, '{}'::jsonb, now(), now()
from cartera060_ids;

insert into public.commercial_people (
  id, advisor_id, person_reference, display_name, preferred_name,
  normalized_name, lifecycle_state, privacy_classification,
  evidence_references, created_by
)
select person_a, user_a, 'CARTERA060_ACCEPTANCE:PERSON:A',
  'Ana Cartera 060', 'Ana', 'ana cartera 060', 'CONFIRMED', 'PRIVATE',
  jsonb_build_array('CARTERA060_ACCEPTANCE:IDENTITY:A'), user_a
from cartera060_ids
union all
select person_b, user_b, 'CARTERA060_ACCEPTANCE:PERSON:B',
  'Beto Cartera 060', 'Beto', 'beto cartera 060', 'CONFIRMED', 'PRIVATE',
  jsonb_build_array('CARTERA060_ACCEPTANCE:IDENTITY:B'), user_b
from cartera060_ids;

insert into public.canonical_policies (
  id, advisor_id, policy_reference, carrier_reference, policy_number,
  product_reference, issue_date, effective_from, effective_to,
  status_value, status_source, status_as_of, currency, premium_amount,
  payment_frequency, sum_insured, completeness_state, freshness_state,
  conflict_state, current_version, created_by
)
select policy_id, user_a, 'CARTERA060_ACCEPTANCE:POLICY:A',
  'CARTERA060_ACCEPTANCE:CARRIER', '060-A',
  'CARTERA060_ACCEPTANCE:PRODUCT', date '2024-01-15',
  timestamptz '2024-01-15 00:00:00+00', timestamptz '2030-01-14 23:59:59+00',
  'ACTIVE', 'CARTERA060_ACCEPTANCE', timestamptz '2026-08-01 00:00:00+00',
  'MXN', 1200, 'MONTHLY', 1000000, 'COMPLETE', 'CURRENT', 'CLEAR', 1, user_a
from cartera060_ids;

insert into public.policy_evidence_versions (
  id, advisor_id, evidence_version_reference, policy_id, document_hash,
  source_type, observed_at, verification_state, field_claims, provenance, created_by
)
select evidence_id, user_a, 'CARTERA060_ACCEPTANCE:POLICY_EVIDENCE:A', policy_id,
  repeat('a', 64), 'REMOTE_ACCEPTANCE_FIXTURE',
  timestamptz '2024-01-15 00:00:00+00', 'CONFIRMED', '{}'::jsonb,
  jsonb_build_object('acceptance', 'CARTERA060'), user_a
from cartera060_ids;

insert into public.policy_versions (
  id, advisor_id, policy_id, policy_version_reference, version_number,
  facts, facts_digest, evidence_version_id, confirmed_at, confirmed_by
)
select version_id, user_a, policy_id, 'CARTERA060_ACCEPTANCE:POLICY_VERSION:A', 1,
  jsonb_build_object('productReference', 'CARTERA060_ACCEPTANCE:PRODUCT'),
  repeat('b', 64), evidence_id, timestamptz '2024-01-15 00:00:00+00', user_a
from cartera060_ids;

insert into public.policy_roles (
  id, advisor_id, policy_role_reference, policy_id, policy_version_id,
  participant_person_id, role_type, confirmation_state,
  privacy_classification, visibility_scope, evidence_references,
  effective_from, role_version, created_by
)
select role_id, user_a, 'CARTERA060_ACCEPTANCE:POLICY_ROLE:A', policy_id, version_id,
  person_a, 'INSURED', 'CONFIRMED', 'PRIVATE', 'POLICY_TEAM',
  jsonb_build_array('CARTERA060_ACCEPTANCE:POLICY_ROLE_EVIDENCE:A'),
  timestamptz '2024-01-15 00:00:00+00', 1, user_a
from cartera060_ids;

insert into public.cartera040_relationship_memory_entries (
  advisor_id, memory_reference, person_id, person_reference,
  memory_kind, summary, value_code, occurred_at, source_authority,
  source_record_reference, evidence_references, sensitivity,
  consent_state, context_use, command_digest, idempotency_key, created_by
)
select user_a, 'CARTERA060_ACCEPTANCE:MEMORY:NEED', person_a,
  'CARTERA060_ACCEPTANCE:PERSON:A', 'NEED',
  'Necesidad de protección adicional confirmada.', null,
  timestamptz '2026-07-20 00:00:00+00', 'CLIENT_CONFIRMED',
  'CARTERA060_ACCEPTANCE:SOURCE:NEED',
  jsonb_build_array('CARTERA060_ACCEPTANCE:EVIDENCE:NEED'),
  'PERSONAL', 'NOT_REQUIRED', 'GENERAL_RELATIONSHIP',
  repeat('c', 64), 'CARTERA060_ACCEPTANCE:KEY:NEED', user_a
from cartera060_ids
union all
select user_a, 'CARTERA060_ACCEPTANCE:MEMORY:REFERRAL:1', person_a,
  'CARTERA060_ACCEPTANCE:PERSON:A', 'ORIGIN_REFERRAL',
  'Confirmó disposición para una introducción.', 'WILLING_TO_INTRODUCE',
  timestamptz '2026-07-22 00:00:00+00', 'CLIENT_CONFIRMED',
  'CARTERA060_ACCEPTANCE:SOURCE:REFERRAL:1',
  jsonb_build_array('CARTERA060_ACCEPTANCE:EVIDENCE:REFERRAL:1'),
  'PERSONAL', 'CONFIRMED', 'GENERAL_RELATIONSHIP',
  repeat('d', 64), 'CARTERA060_ACCEPTANCE:KEY:REFERRAL:1', user_a
from cartera060_ids
union all
select user_a, 'CARTERA060_ACCEPTANCE:MEMORY:REFERRAL:2', person_a,
  'CARTERA060_ACCEPTANCE:PERSON:A', 'ORIGIN_REFERRAL',
  'Reconfirmó disposición para otra introducción.', 'WILLING_TO_INTRODUCE',
  timestamptz '2026-07-25 00:00:00+00', 'CLIENT_CONFIRMED',
  'CARTERA060_ACCEPTANCE:SOURCE:REFERRAL:2',
  jsonb_build_array('CARTERA060_ACCEPTANCE:EVIDENCE:REFERRAL:2'),
  'PERSONAL', 'CONFIRMED', 'GENERAL_RELATIONSHIP',
  repeat('e', 64), 'CARTERA060_ACCEPTANCE:KEY:REFERRAL:2', user_a
from cartera060_ids
union all
select user_a, 'CARTERA060_ACCEPTANCE:MEMORY:SERVICE', person_a,
  'CARTERA060_ACCEPTANCE:PERSON:A', 'SERVICE_INTERACTION',
  'Interacción reciente de servicio.', null,
  timestamptz '2026-07-29 00:00:00+00', 'ADVISOR_CONFIRMED',
  'CARTERA060_ACCEPTANCE:SOURCE:SERVICE',
  jsonb_build_array('CARTERA060_ACCEPTANCE:EVIDENCE:SERVICE'),
  'PERSONAL', 'NOT_REQUIRED', 'SERVICE_ONLY',
  repeat('f', 64), 'CARTERA060_ACCEPTANCE:KEY:SERVICE', user_a
from cartera060_ids;

select set_config('request.jwt.claim.sub', user_a::text, true) from cartera060_ids;
set local role authenticated;

insert into cartera060_results (name, payload)
values (
  'owner',
  public.forge_cartera060_list_relationship_growth_reviews(jsonb_build_object(
    'asOfDate', '2026-08-01',
    'limit', 80
  ))
);

do $$
declare
  result jsonb;
begin
  select payload into result from cartera060_results where name = 'owner';
  if jsonb_array_length(result -> 'items') <> 4 then
    raise exception 'CARTERA060_EXPECTED_FOUR_CANDIDATES';
  end if;
  if not (result -> 'items' @> '[{"growthClass":"SECOND_POLICY_REVIEW"}]'::jsonb)
     or not (result -> 'items' @> '[{"growthClass":"PROTECTION_REVIEW"}]'::jsonb)
     or not (result -> 'items' @> '[{"growthClass":"REFERRAL_RELATIONSHIP"}]'::jsonb)
     or not (result -> 'items' @> '[{"growthClass":"CENTER_OF_INFLUENCE"}]'::jsonb) then
    raise exception 'CARTERA060_GROWTH_CLASSES_MISSING';
  end if;
  if jsonb_path_exists(result, '$.items[*] ? (@.lifeContextUsed == true)')
     or jsonb_path_exists(result, '$.items[*] ? (@.opportunityCreated == true)')
     or jsonb_path_exists(result, '$.items[*] ? (@.contactExecuted == true)')
     or jsonb_path_exists(result, '$.items[*] ? (@.referralRequested == true)')
     or jsonb_path_exists(result, '$.items[*] ? (@.finalNbaPriority == true)') then
    raise exception 'CARTERA060_RESTRICTED_EFFECT_EXPOSED';
  end if;
end;
$$;

reset role;
select set_config('request.jwt.claim.sub', user_b::text, true) from cartera060_ids;
set local role authenticated;

insert into cartera060_results (name, payload)
values (
  'cross-advisor',
  public.forge_cartera060_list_relationship_growth_reviews(jsonb_build_object(
    'personReference', 'CARTERA060_ACCEPTANCE:PERSON:A',
    'asOfDate', '2026-08-01'
  ))
);

do $$
declare
  result jsonb;
begin
  select payload into result from cartera060_results where name = 'cross-advisor';
  if jsonb_array_length(result -> 'items') <> 0 then
    raise exception 'CARTERA060_CROSS_ADVISOR_LEAK';
  end if;
end;
$$;

reset role;
rollback;
select 'PASS CARTERA060_TRANSACTIONAL_ACCEPTANCE' as acceptance;
