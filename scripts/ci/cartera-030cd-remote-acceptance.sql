begin;

create temporary table cartera030cd_ids (
  user_a uuid not null,
  user_b uuid not null,
  policy_id uuid not null,
  evidence_id uuid not null,
  version_id uuid not null
) on commit drop;

insert into cartera030cd_ids values (
  gen_random_uuid(), gen_random_uuid(), gen_random_uuid(), gen_random_uuid(), gen_random_uuid()
);

create temporary table cartera030cd_payloads (
  name text primary key,
  payload jsonb not null
) on commit drop;
create temporary table cartera030cd_results (
  name text primary key,
  payload jsonb not null
) on commit drop;

grant select on cartera030cd_ids to authenticated;
grant select on cartera030cd_payloads to authenticated;
grant select, insert, update on cartera030cd_results to authenticated;

insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at
)
select
  '00000000-0000-0000-0000-000000000000'::uuid,
  user_a, 'authenticated', 'authenticated',
  'cartera030cd-acceptance-a@forge.invalid', '', now(), '{}'::jsonb, '{}'::jsonb, now(), now()
from cartera030cd_ids
union all
select
  '00000000-0000-0000-0000-000000000000'::uuid,
  user_b, 'authenticated', 'authenticated',
  'cartera030cd-acceptance-b@forge.invalid', '', now(), '{}'::jsonb, '{}'::jsonb, now(), now()
from cartera030cd_ids;

insert into public.canonical_policies (
  id, advisor_id, policy_reference, carrier_reference, policy_number,
  product_reference, issue_date, effective_from, effective_to,
  status_value, status_source, status_as_of, currency, premium_amount,
  payment_frequency, sum_insured, completeness_state, freshness_state,
  conflict_state, current_version, created_by
)
select
  policy_id, user_a, 'CARTERA030CD_ACCEPTANCE:POLICY:A',
  'CARTERA030CD_ACCEPTANCE:CARRIER', '030CD-A',
  'CARTERA030CD_ACCEPTANCE:PRODUCT', date '2026-08-01',
  timestamptz '2026-08-01 00:00:00+00', timestamptz '2027-07-31 23:59:59+00',
  'ACTIVE', 'CARTERA030CD_ACCEPTANCE', now(), 'MXN', 1200,
  'MONTHLY', 1000000, 'COMPLETE', 'CURRENT', 'CLEAR', 1, user_a
from cartera030cd_ids;

insert into public.policy_evidence_versions (
  id, advisor_id, evidence_version_reference, policy_id, document_hash,
  source_type, observed_at, verification_state, field_claims, provenance, created_by
)
select
  evidence_id, user_a, 'CARTERA030CD_ACCEPTANCE:EVIDENCE:POLICY', policy_id,
  repeat('a', 64), 'REMOTE_ACCEPTANCE_FIXTURE', now(), 'CONFIRMED',
  '{}'::jsonb, jsonb_build_object('acceptance', 'CARTERA030CD'), user_a
from cartera030cd_ids;

insert into public.policy_versions (
  id, advisor_id, policy_id, policy_version_reference, version_number,
  facts, facts_digest, evidence_version_id, confirmed_at, confirmed_by
)
select
  version_id, user_a, policy_id, 'CARTERA030CD_ACCEPTANCE:POLICY_VERSION:A', 1,
  jsonb_build_object(
    'effectiveFrom', '2026-08-01',
    'paymentFrequency', 'MONTHLY',
    'premiumAmount', 1200,
    'currency', 'MXN'
  ),
  repeat('c', 64), evidence_id, now(), user_a
from cartera030cd_ids;

insert into cartera030cd_payloads (name, payload)
select 'generation', command_payload || jsonb_build_object(
  'authorization', jsonb_build_object(
    'authorized', true,
    'payloadDigest', public.forge_cartera030b_digest(command_payload)
  )
)
from (
  select jsonb_build_object(
    'policyReference', 'CARTERA030CD_ACCEPTANCE:POLICY:A',
    'policyVersionReference', 'CARTERA030CD_ACCEPTANCE:POLICY_VERSION:A',
    'generationHorizonDate', '2026-08-01',
    'timezone', 'America/Mexico_City',
    'amountSemantics', 'PER_OCCURRENCE',
    'scheduleRuleReference', 'CARTERA030CD_ACCEPTANCE:MONTHLY_PREMIUM_RULE',
    'sourceEvidenceReferences', jsonb_build_array('CARTERA030CD_ACCEPTANCE:EVIDENCE:POLICY'),
    'idempotencyKey', 'CARTERA030CD_ACCEPTANCE:GENERATE:A'
  ) as command_payload
) source;

insert into cartera030cd_payloads (name, payload)
select 'payment', command_payload || jsonb_build_object(
  'authorization', jsonb_build_object(
    'authorized', true,
    'payloadDigest', public.forge_cartera030b_digest(command_payload)
  )
)
from (
  select jsonb_build_object(
    'policyReference', 'CARTERA030CD_ACCEPTANCE:POLICY:A',
    'paymentEvidenceReference', 'CARTERA030CD_ACCEPTANCE:PAYMENT_EVIDENCE:A',
    'paymentAmount', 1200,
    'currency', 'MXN',
    'paymentDate', '2026-08-01',
    'periodCoveredStart', '2026-08-01',
    'periodCoveredEnd', '2026-08-31',
    'paymentSource', 'payment_proof',
    'evidenceReferences', jsonb_build_array('CARTERA030CD_ACCEPTANCE:PAYMENT_EVIDENCE:A'),
    'confirmationState', 'CONFIRMED',
    'idempotencyKey', 'CARTERA030CD_ACCEPTANCE:RECONCILE:A'
  ) as command_payload
) source;

insert into cartera030cd_payloads (name, payload)
select 'payment-changed', command_payload || jsonb_build_object(
  'authorization', jsonb_build_object(
    'authorized', true,
    'payloadDigest', public.forge_cartera030b_digest(command_payload)
  )
)
from (
  select jsonb_build_object(
    'policyReference', 'CARTERA030CD_ACCEPTANCE:POLICY:A',
    'paymentEvidenceReference', 'CARTERA030CD_ACCEPTANCE:PAYMENT_EVIDENCE:A',
    'paymentAmount', 1100,
    'currency', 'MXN',
    'paymentDate', '2026-08-01',
    'periodCoveredStart', '2026-08-01',
    'periodCoveredEnd', '2026-08-31',
    'paymentSource', 'payment_proof',
    'evidenceReferences', jsonb_build_array('CARTERA030CD_ACCEPTANCE:PAYMENT_EVIDENCE:A'),
    'confirmationState', 'CONFIRMED',
    'idempotencyKey', 'CARTERA030CD_ACCEPTANCE:RECONCILE:A'
  ) as command_payload
) source;

select set_config('request.jwt.claim.sub', user_a::text, true) from cartera030cd_ids;
set local role authenticated;

insert into cartera030cd_results (name, payload)
select 'generation', public.forge_cartera030b_generate_expected_obligations(payload)
from cartera030cd_payloads where name = 'generation';

insert into cartera030cd_results (name, payload)
select 'payment', public.forge_cartera030c_record_and_reconcile_confirmed_payment(payload)
from cartera030cd_payloads where name = 'payment';

insert into cartera030cd_results (name, payload)
select 'payment-replay', public.forge_cartera030c_record_and_reconcile_confirmed_payment(payload)
from cartera030cd_payloads where name = 'payment';

insert into cartera030cd_results (name, payload)
select 'payment-changed', public.forge_cartera030c_record_and_reconcile_confirmed_payment(payload)
from cartera030cd_payloads where name = 'payment-changed';

insert into cartera030cd_results (name, payload)
values ('calendar-owner', public.forge_cartera030d_list_policy_payment_calendar(jsonb_build_object(
  'policyReference', 'CARTERA030CD_ACCEPTANCE:POLICY:A',
  'asOfDate', '2026-08-01',
  'timezone', 'America/Mexico_City'
)));

DO $$
begin
  perform 1 from public.cartera030c_confirmed_payment_events limit 1;
  raise exception 'CARTERA030CD_DIRECT_EVENT_READ_UNEXPECTEDLY_ALLOWED';
exception
  when insufficient_privilege then null;
end;
$$;

DO $$
begin
  insert into public.cartera030c_confirmed_payment_events (
    advisor_id, payment_event_reference, policy_id, policy_reference,
    payment_evidence_reference, payment_amount, payment_date, payment_source,
    confirmation_state, event_digest, idempotency_key, confirmed_by, confirmed_at
  )
  select user_a, 'PAYMENT_EVENT:DIRECT', policy_id, 'CARTERA030CD_ACCEPTANCE:POLICY:A',
    'PAYMENT_EVIDENCE:DIRECT', 1, date '2026-08-01', 'manual_capture',
    'CONFIRMED', repeat('a', 64), 'DIRECT', user_a, now()
  from cartera030cd_ids;
  raise exception 'CARTERA030CD_DIRECT_EVENT_WRITE_UNEXPECTEDLY_ALLOWED';
exception
  when insufficient_privilege then null;
end;
$$;

reset role;

DO $$
declare
  generation jsonb;
  payment jsonb;
  replay jsonb;
  changed jsonb;
  calendar jsonb;
  calendar_text text;
begin
  select payload into generation from cartera030cd_results where name = 'generation';
  select payload into payment from cartera030cd_results where name = 'payment';
  select payload into replay from cartera030cd_results where name = 'payment-replay';
  select payload into changed from cartera030cd_results where name = 'payment-changed';
  select payload into calendar from cartera030cd_results where name = 'calendar-owner';

  if generation ->> 'generationState' <> 'COMPLETE'
    or jsonb_array_length(generation -> 'obligationReferences') <> 1 then
    raise exception 'CARTERA030CD_GENERATION_INVALID:%', generation;
  end if;
  if payment ->> 'reconciliationState' <> 'COMPLETE'
    or payment ->> 'outcome' <> 'MATCHED'
    or payment ->> 'resultingStatus' <> 'CONFIRMED' then
    raise exception 'CARTERA030CD_PAYMENT_RECONCILIATION_INVALID:%', payment;
  end if;
  if replay <> payment then
    raise exception 'CARTERA030CD_PAYMENT_REPLAY_CHANGED:%:%', payment, replay;
  end if;
  if changed ->> 'reconciliationState' <> 'CONFLICT'
    or changed ->> 'reason' <> 'CHANGED_EVENT_REPLAY' then
    raise exception 'CARTERA030CD_CHANGED_REPLAY_NOT_CONFLICT:%', changed;
  end if;

  if (select count(*) from public.cartera030c_confirmed_payment_events
      where policy_reference = 'CARTERA030CD_ACCEPTANCE:POLICY:A') <> 1 then
    raise exception 'CARTERA030CD_PAYMENT_EVENT_COUNT_INVALID';
  end if;
  if not exists (
    select 1 from public.cartera030b_expected_payment_obligations
    where policy_reference = 'CARTERA030CD_ACCEPTANCE:POLICY:A'
      and status = 'CONFIRMED'
      and confirmation_state = 'PAYMENT_CONFIRMED'
      and actual_amount = 1200
      and jsonb_array_length(matched_payment_event_references) = 1
  ) then
    raise exception 'CARTERA030CD_OBLIGATION_NOT_CONFIRMED';
  end if;
  if not exists (
    select 1 from public.cartera030c_payment_event_conflicts
    where conflict_type = 'CHANGED_EVENT_REPLAY'
      and claims ->> 'idempotencyKey' = 'CARTERA030CD_ACCEPTANCE:RECONCILE:A'
  ) then
    raise exception 'CARTERA030CD_CHANGED_REPLAY_CONFLICT_NOT_DURABLE';
  end if;

  if (calendar -> 'summary' ->> 'confirmed')::integer <> 1
    or jsonb_array_length(calendar -> 'items') <> 1
    or calendar -> 'items' -> 0 ->> 'status' <> 'CONFIRMED'
    or calendar ->> 'paymentTruthAuthority' <> 'CONFIRMED_PAYMENT_EVENT_ONLY'
    or (calendar ->> 'lapseInference')::boolean <> false then
    raise exception 'CARTERA030CD_CALENDAR_INVALID:%', calendar;
  end if;
  calendar_text := lower(calendar::text);
  if calendar_text ~ '(evidence_references|beneficiary|bank_account|clabe|card_number|payment_token)' then
    raise exception 'CARTERA030CD_CALENDAR_PRIVACY_LEAK:%', calendar;
  end if;
end;
$$;

select set_config('request.jwt.claim.sub', user_b::text, true) from cartera030cd_ids;
set local role authenticated;
insert into cartera030cd_results (name, payload)
values ('calendar-cross-advisor', public.forge_cartera030d_list_policy_payment_calendar(jsonb_build_object(
  'asOfDate', '2026-08-01',
  'timezone', 'America/Mexico_City'
)));
reset role;

DO $$
begin
  if jsonb_array_length((select payload -> 'items' from cartera030cd_results where name = 'calendar-cross-advisor')) <> 0 then
    raise exception 'CARTERA030CD_CROSS_ADVISOR_CALENDAR_LEAK';
  end if;
end;
$$;

rollback;
select
  'PASS CARTERA030CD_TRANSACTIONAL_ACCEPTANCE'::text as acceptance,
  'YES'::text as fixtures_rolled_back,
  'PASS'::text as confirmed_payment_event,
  'PASS'::text as deterministic_reconciliation,
  'PASS'::text as sanitized_product_calendar;
