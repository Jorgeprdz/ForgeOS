begin;

create temporary table cartera030b_acceptance_ids (
  user_a uuid not null,
  user_b uuid not null,
  policy_a uuid not null,
  policy_b uuid not null,
  evidence_a uuid not null,
  evidence_b uuid not null,
  version_a uuid not null,
  version_b uuid not null,
  forged_reference text
) on commit drop;

insert into cartera030b_acceptance_ids values (
  gen_random_uuid(), gen_random_uuid(),
  gen_random_uuid(), gen_random_uuid(),
  gen_random_uuid(), gen_random_uuid(),
  gen_random_uuid(), gen_random_uuid(),
  null
);

create temporary table cartera030b_acceptance_payloads (
  name text primary key,
  payload jsonb not null
) on commit drop;

create temporary table cartera030b_acceptance_results (
  name text primary key,
  payload jsonb not null
) on commit drop;

grant select on cartera030b_acceptance_ids to authenticated;
grant select on cartera030b_acceptance_payloads to authenticated;
grant select, insert, update on cartera030b_acceptance_results to authenticated;

insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at
)
select
  '00000000-0000-0000-0000-000000000000'::uuid,
  user_a,
  'authenticated',
  'authenticated',
  'cartera030b-acceptance-a@forge.invalid',
  '',
  now(),
  '{}'::jsonb,
  '{}'::jsonb,
  now(),
  now()
from cartera030b_acceptance_ids
union all
select
  '00000000-0000-0000-0000-000000000000'::uuid,
  user_b,
  'authenticated',
  'authenticated',
  'cartera030b-acceptance-b@forge.invalid',
  '',
  now(),
  '{}'::jsonb,
  '{}'::jsonb,
  now(),
  now()
from cartera030b_acceptance_ids;

insert into public.canonical_policies (
  id, advisor_id, policy_reference, carrier_reference, policy_number,
  product_reference, issue_date, effective_from, effective_to,
  status_value, status_source, status_as_of, currency, premium_amount,
  payment_frequency, sum_insured, completeness_state, freshness_state,
  conflict_state, current_version, created_by
)
select
  policy_a,
  user_a,
  'CARTERA030B_ACCEPTANCE:POLICY:A',
  'CARTERA030B_ACCEPTANCE:CARRIER',
  '030B-A',
  'CARTERA030B_ACCEPTANCE:PRODUCT',
  date '2026-01-31',
  timestamptz '2026-01-31 00:00:00+00',
  timestamptz '2026-12-31 00:00:00+00',
  'ACTIVE',
  'CARTERA030B_ACCEPTANCE',
  now(),
  'MXN',
  1200,
  'MONTHLY',
  1000000,
  'COMPLETE',
  'CURRENT',
  'CLEAR',
  1,
  user_a
from cartera030b_acceptance_ids
union all
select
  policy_b,
  user_a,
  'CARTERA030B_ACCEPTANCE:POLICY:UNKNOWN_FREQUENCY',
  'CARTERA030B_ACCEPTANCE:CARRIER',
  '030B-B',
  'CARTERA030B_ACCEPTANCE:PRODUCT',
  date '2026-01-15',
  timestamptz '2026-01-15 00:00:00+00',
  timestamptz '2026-12-31 00:00:00+00',
  'ACTIVE',
  'CARTERA030B_ACCEPTANCE',
  now(),
  'MXN',
  900,
  'OTHER',
  500000,
  'COMPLETE',
  'CURRENT',
  'CLEAR',
  1,
  user_a
from cartera030b_acceptance_ids;

insert into public.policy_evidence_versions (
  id, advisor_id, evidence_version_reference, policy_id, document_hash,
  source_type, observed_at, verification_state, field_claims, provenance,
  created_by
)
select
  evidence_a,
  user_a,
  'CARTERA030B_ACCEPTANCE:EVIDENCE:A',
  policy_a,
  repeat('a', 64),
  'REMOTE_ACCEPTANCE_FIXTURE',
  now(),
  'CONFIRMED',
  '{}'::jsonb,
  jsonb_build_object('acceptance', 'CARTERA030B'),
  user_a
from cartera030b_acceptance_ids
union all
select
  evidence_b,
  user_a,
  'CARTERA030B_ACCEPTANCE:EVIDENCE:B',
  policy_b,
  repeat('b', 64),
  'REMOTE_ACCEPTANCE_FIXTURE',
  now(),
  'CONFIRMED',
  '{}'::jsonb,
  jsonb_build_object('acceptance', 'CARTERA030B'),
  user_a
from cartera030b_acceptance_ids;

insert into public.policy_versions (
  id, advisor_id, policy_id, policy_version_reference, version_number,
  facts, facts_digest, evidence_version_id, confirmed_at, confirmed_by
)
select
  version_a,
  user_a,
  policy_a,
  'CARTERA030B_ACCEPTANCE:POLICY_VERSION:A',
  1,
  jsonb_build_object(
    'effectiveFrom', '2026-01-31',
    'paymentFrequency', 'MONTHLY',
    'premiumAmount', 1200,
    'currency', 'MXN'
  ),
  repeat('c', 64),
  evidence_a,
  now(),
  user_a
from cartera030b_acceptance_ids
union all
select
  version_b,
  user_a,
  policy_b,
  'CARTERA030B_ACCEPTANCE:POLICY_VERSION:B',
  1,
  jsonb_build_object(
    'effectiveFrom', '2026-01-15',
    'paymentFrequency', 'OTHER',
    'premiumAmount', 900,
    'currency', 'MXN'
  ),
  repeat('d', 64),
  evidence_b,
  now(),
  user_a
from cartera030b_acceptance_ids;

insert into cartera030b_acceptance_payloads (name, payload)
select
  'initial',
  command_payload || jsonb_build_object(
    'authorization', jsonb_build_object(
      'authorized', true,
      'payloadDigest', public.forge_cartera030b_digest(command_payload)
    )
  )
from (
  select jsonb_build_object(
    'policyReference', 'CARTERA030B_ACCEPTANCE:POLICY:A',
    'policyVersionReference', 'CARTERA030B_ACCEPTANCE:POLICY_VERSION:A',
    'generationHorizonDate', '2026-05-31',
    'timezone', 'America/Mexico_City',
    'amountSemantics', 'UNKNOWN',
    'scheduleRuleReference', null,
    'sourceEvidenceReferences', jsonb_build_array('CARTERA030B_ACCEPTANCE:EVIDENCE:A'),
    'idempotencyKey', 'CARTERA030B_ACCEPTANCE:GENERATE:A'
  ) as command_payload
) source;

insert into cartera030b_acceptance_payloads (name, payload)
select
  'unknown-frequency',
  command_payload || jsonb_build_object(
    'authorization', jsonb_build_object(
      'authorized', true,
      'payloadDigest', public.forge_cartera030b_digest(command_payload)
    )
  )
from (
  select jsonb_build_object(
    'policyReference', 'CARTERA030B_ACCEPTANCE:POLICY:UNKNOWN_FREQUENCY',
    'policyVersionReference', 'CARTERA030B_ACCEPTANCE:POLICY_VERSION:B',
    'generationHorizonDate', '2026-06-30',
    'timezone', 'America/Mexico_City',
    'amountSemantics', 'UNKNOWN',
    'scheduleRuleReference', null,
    'sourceEvidenceReferences', jsonb_build_array('CARTERA030B_ACCEPTANCE:EVIDENCE:B'),
    'idempotencyKey', 'CARTERA030B_ACCEPTANCE:GENERATE:UNKNOWN_FREQUENCY'
  ) as command_payload
) source;

insert into cartera030b_acceptance_payloads (name, payload)
select
  'changed-input',
  command_payload || jsonb_build_object(
    'authorization', jsonb_build_object(
      'authorized', true,
      'payloadDigest', public.forge_cartera030b_digest(command_payload)
    )
  )
from (
  select jsonb_build_object(
    'policyReference', 'CARTERA030B_ACCEPTANCE:POLICY:A',
    'policyVersionReference', 'CARTERA030B_ACCEPTANCE:POLICY_VERSION:A',
    'generationHorizonDate', '2026-06-30',
    'timezone', 'America/Mexico_City',
    'amountSemantics', 'UNKNOWN',
    'scheduleRuleReference', null,
    'sourceEvidenceReferences', jsonb_build_array('CARTERA030B_ACCEPTANCE:EVIDENCE:A'),
    'idempotencyKey', 'CARTERA030B_ACCEPTANCE:GENERATE:A'
  ) as command_payload
) source;

insert into cartera030b_acceptance_payloads (name, payload)
select
  'bad-digest',
  command_payload || jsonb_build_object(
    'authorization', jsonb_build_object(
      'authorized', true,
      'payloadDigest', repeat('0', 64)
    )
  )
from (
  select jsonb_build_object(
    'policyReference', 'CARTERA030B_ACCEPTANCE:POLICY:A',
    'policyVersionReference', 'CARTERA030B_ACCEPTANCE:POLICY_VERSION:A',
    'generationHorizonDate', '2026-05-31',
    'timezone', 'America/Mexico_City',
    'amountSemantics', 'UNKNOWN',
    'scheduleRuleReference', null,
    'sourceEvidenceReferences', jsonb_build_array('CARTERA030B_ACCEPTANCE:EVIDENCE:A'),
    'idempotencyKey', 'CARTERA030B_ACCEPTANCE:BAD_DIGEST'
  ) as command_payload
) source;

select set_config('request.jwt.claim.sub', user_a::text, true)
from cartera030b_acceptance_ids;
set local role authenticated;

insert into cartera030b_acceptance_results (name, payload)
select 'initial', public.forge_cartera030b_generate_expected_obligations(payload)
from cartera030b_acceptance_payloads
where name = 'initial';

reset role;

DO $$
declare
  result jsonb;
  dates date[];
  obligation_count integer;
  transition_count integer;
  receipt_count integer;
begin
  select payload into result
  from cartera030b_acceptance_results
  where name = 'initial';

  if result ->> 'generationState' <> 'COMPLETE' then
    raise exception 'CARTERA030B_INITIAL_GENERATION_NOT_COMPLETE:%', result;
  end if;
  if jsonb_array_length(result -> 'obligationReferences') <> 5 then
    raise exception 'CARTERA030B_INITIAL_GENERATION_COUNT_INVALID:%', result;
  end if;

  select count(*), array_agg(expected_date order by expected_date)
  into obligation_count, dates
  from public.cartera030b_expected_payment_obligations
  where policy_reference = 'CARTERA030B_ACCEPTANCE:POLICY:A';

  if obligation_count <> 5 then
    raise exception 'CARTERA030B_LEDGER_COUNT_INVALID:%', obligation_count;
  end if;
  if dates <> array[
    date '2026-01-31', date '2026-02-28', date '2026-03-31',
    date '2026-04-30', date '2026-05-31'
  ] then
    raise exception 'CARTERA030B_MONTH_END_RECURRENCE_INVALID:%', dates;
  end if;

  if exists (
    select 1
    from public.cartera030b_expected_payment_obligations
    where policy_reference = 'CARTERA030B_ACCEPTANCE:POLICY:A'
      and expected_amount is not null
  ) then
    raise exception 'CARTERA030B_UNKNOWN_AMOUNT_SEMANTICS_WAS_GUESSED';
  end if;

  select count(*) into transition_count
  from public.cartera030b_obligation_transitions t
  join public.cartera030b_expected_payment_obligations o
    on o.id = t.obligation_id and o.advisor_id = t.advisor_id
  where o.policy_reference = 'CARTERA030B_ACCEPTANCE:POLICY:A';

  select count(*) into receipt_count
  from public.cartera030b_command_receipts
  where idempotency_key = 'CARTERA030B_ACCEPTANCE:GENERATE:A';

  if transition_count <> 5 or receipt_count <> 1 then
    raise exception 'CARTERA030B_INITIAL_HISTORY_INVALID:transitions=%,receipts=%', transition_count, receipt_count;
  end if;
end;
$$;

select set_config('request.jwt.claim.sub', user_a::text, true)
from cartera030b_acceptance_ids;
set local role authenticated;

insert into cartera030b_acceptance_results (name, payload)
select 'replay', public.forge_cartera030b_generate_expected_obligations(payload)
from cartera030b_acceptance_payloads
where name = 'initial';

insert into cartera030b_acceptance_results (name, payload)
select 'unknown-frequency', public.forge_cartera030b_generate_expected_obligations(payload)
from cartera030b_acceptance_payloads
where name = 'unknown-frequency';

DO $$
begin
  perform public.forge_cartera030b_generate_expected_obligations(payload)
  from cartera030b_acceptance_payloads
  where name = 'bad-digest';
  raise exception 'CARTERA030B_BAD_DIGEST_WAS_ACCEPTED';
exception
  when others then
    if position('CARTERA030B_AUTHORIZATION_DIGEST_MISMATCH' in sqlerrm) = 0 then
      raise;
    end if;
end;
$$;

reset role;

DO $$
declare
  initial_result jsonb;
  replay_result jsonb;
  blocked_result jsonb;
begin
  select payload into initial_result from cartera030b_acceptance_results where name = 'initial';
  select payload into replay_result from cartera030b_acceptance_results where name = 'replay';
  select payload into blocked_result from cartera030b_acceptance_results where name = 'unknown-frequency';

  if replay_result <> initial_result then
    raise exception 'CARTERA030B_IDENTICAL_REPLAY_RESPONSE_CHANGED';
  end if;
  if (select count(*) from public.cartera030b_expected_payment_obligations
      where policy_reference = 'CARTERA030B_ACCEPTANCE:POLICY:A') <> 5 then
    raise exception 'CARTERA030B_IDENTICAL_REPLAY_DUPLICATED_OBLIGATIONS';
  end if;
  if blocked_result ->> 'generationState' <> 'BLOCKED'
    or blocked_result ->> 'reason' <> 'UNKNOWN_PAYMENT_FREQUENCY' then
    raise exception 'CARTERA030B_UNKNOWN_FREQUENCY_NOT_BLOCKED:%', blocked_result;
  end if;
  if exists (
    select 1 from public.cartera030b_expected_payment_obligations
    where policy_reference = 'CARTERA030B_ACCEPTANCE:POLICY:UNKNOWN_FREQUENCY'
  ) then
    raise exception 'CARTERA030B_UNKNOWN_FREQUENCY_CREATED_OBLIGATION';
  end if;
end;
$$;

select set_config('request.jwt.claim.sub', user_a::text, true)
from cartera030b_acceptance_ids;
set local role authenticated;

insert into cartera030b_acceptance_results (name, payload)
select
  'calendar-owner',
  public.forge_cartera030b_list_expected_obligations(jsonb_build_object(
    'policyReference', 'CARTERA030B_ACCEPTANCE:POLICY:A',
    'asOfDate', '2026-02-15',
    'timezone', 'America/Mexico_City'
  ));

reset role;

select set_config('request.jwt.claim.sub', user_b::text, true)
from cartera030b_acceptance_ids;
set local role authenticated;

insert into cartera030b_acceptance_results (name, payload)
select
  'calendar-cross-advisor',
  public.forge_cartera030b_list_expected_obligations(jsonb_build_object(
    'policyReference', 'CARTERA030B_ACCEPTANCE:POLICY:A',
    'asOfDate', '2026-02-15',
    'timezone', 'America/Mexico_City'
  ));

DO $$
begin
  perform 1 from public.cartera030b_expected_payment_obligations limit 1;
  raise exception 'CARTERA030B_DIRECT_READ_UNEXPECTEDLY_ALLOWED';
exception
  when insufficient_privilege then null;
end;
$$;

DO $$
begin
  insert into public.cartera030b_obligation_conflicts (
    advisor_id, conflict_reference, conflict_type, conflict_state,
    claims, recorded_by
  ) values (
    auth.uid(), 'CARTERA030B_ACCEPTANCE:DIRECT_WRITE',
    'CHANGED_INPUT_REPLAY', 'OPEN', '{}'::jsonb, auth.uid()
  );
  raise exception 'CARTERA030B_DIRECT_WRITE_UNEXPECTEDLY_ALLOWED';
exception
  when insufficient_privilege then null;
end;
$$;

reset role;

DO $$
declare
  owner_calendar jsonb;
  cross_calendar jsonb;
  owner_text text;
begin
  select payload into owner_calendar
  from cartera030b_acceptance_results
  where name = 'calendar-owner';

  select payload into cross_calendar
  from cartera030b_acceptance_results
  where name = 'calendar-cross-advisor';

  if jsonb_array_length(owner_calendar -> 'items') <> 5 then
    raise exception 'CARTERA030B_OWNER_CALENDAR_COUNT_INVALID:%', owner_calendar;
  end if;
  if jsonb_array_length(cross_calendar -> 'items') <> 0 then
    raise exception 'CARTERA030B_CROSS_ADVISOR_CALENDAR_LEAK:%', cross_calendar;
  end if;

  owner_text := lower(owner_calendar::text);
  if owner_text ~ '(source_evidence|matched_payment|beneficiary|bank_account|clabe|card_number|payment_token)' then
    raise exception 'CARTERA030B_CALENDAR_PRIVACY_LEAK:%', owner_calendar;
  end if;
  if owner_text ~ '(lapsed|cancelled by carrier|coverage cancelled)' then
    raise exception 'CARTERA030B_CALENDAR_LAPSE_INFERENCE:%', owner_calendar;
  end if;
  if not exists (
    select 1
    from jsonb_array_elements(owner_calendar -> 'items') item
    where item ->> 'date' = '2026-01-31'
      and item ->> 'status' = 'OVERDUE'
      and item ->> 'ledgerStatus' = 'SCHEDULED'
  ) then
    raise exception 'CARTERA030B_OVERDUE_PROJECTION_INVALID:%', owner_calendar;
  end if;
end;
$$;

grant select on public.cartera030b_expected_payment_obligations to authenticated;
select set_config('request.jwt.claim.sub', user_b::text, true)
from cartera030b_acceptance_ids;
set local role authenticated;

insert into cartera030b_acceptance_results (name, payload)
select 'rls-cross-advisor', jsonb_build_object(
  'visibleRows', count(*)
)
from public.cartera030b_expected_payment_obligations;

reset role;
revoke select on public.cartera030b_expected_payment_obligations from authenticated;

DO $$
begin
  if coalesce((
    select (payload ->> 'visibleRows')::integer
    from cartera030b_acceptance_results
    where name = 'rls-cross-advisor'
  ), -1) <> 0 then
    raise exception 'CARTERA030B_RLS_CROSS_ADVISOR_VISIBLE';
  end if;
end;
$$;

DO $$
begin
  begin
    update public.cartera030b_expected_payment_obligations
    set status = 'UPCOMING'
    where policy_reference = 'CARTERA030B_ACCEPTANCE:POLICY:A'
      and expected_date = date '2026-01-31';
    raise exception 'CARTERA030B_STALE_STATE_UPDATE_ACCEPTED';
  exception
    when others then
      if position('CARTERA030B_STATE_VERSION_INVALID' in sqlerrm) = 0 then
        raise;
      end if;
  end;

  update public.cartera030b_expected_payment_obligations
  set status = 'UPCOMING', state_version = state_version + 1
  where policy_reference = 'CARTERA030B_ACCEPTANCE:POLICY:A'
    and expected_date = date '2026-01-31';

  if not exists (
    select 1 from public.cartera030b_expected_payment_obligations
    where policy_reference = 'CARTERA030B_ACCEPTANCE:POLICY:A'
      and expected_date = date '2026-01-31'
      and status = 'UPCOMING'
      and state_version = 2
  ) then
    raise exception 'CARTERA030B_VALID_STATE_VERSION_UPDATE_FAILED';
  end if;

  begin
    update public.cartera030b_obligation_transitions
    set reason_code = 'MUTATED'
    where id = (
      select id from public.cartera030b_obligation_transitions order by occurred_at limit 1
    );
    raise exception 'CARTERA030B_APPEND_ONLY_UPDATE_ACCEPTED';
  exception
    when others then
      if position('CARTERA030B_APPEND_ONLY' in sqlerrm) = 0 then
        raise;
      end if;
  end;
end;
$$;

select set_config('request.jwt.claim.sub', user_a::text, true)
from cartera030b_acceptance_ids;
set local role authenticated;

DO $$
declare
  response jsonb;
begin
  begin
    select public.forge_cartera030b_generate_expected_obligations(payload)
    into response
    from cartera030b_acceptance_payloads
    where name = 'changed-input';

    insert into cartera030b_acceptance_results (name, payload)
    values ('changed-input', response)
    on conflict (name) do update set payload = excluded.payload;
  exception
    when others then
      if position('CARTERA030B_CHANGED_INPUT_REPLAY' in sqlerrm) = 0 then
        raise;
      end if;
      insert into cartera030b_acceptance_results (name, payload)
      values ('changed-input', jsonb_build_object('generationState', 'ERROR', 'reason', 'CHANGED_INPUT_REPLAY'))
      on conflict (name) do update set payload = excluded.payload;
  end;
end;
$$;

reset role;

DO $$
begin
  if not exists (
    select 1
    from public.cartera030b_obligation_conflicts
    where conflict_type = 'CHANGED_INPUT_REPLAY'
      and claims ->> 'idempotencyKey' = 'CARTERA030B_ACCEPTANCE:GENERATE:A'
  ) then
    raise exception 'CARTERA030B_CHANGED_INPUT_CONFLICT_NOT_DURABLE';
  end if;
end;
$$;

update cartera030b_acceptance_ids ids
set forged_reference = 'PAYMENT_OBLIGATION:' || public.forge_cartera030b_digest(
  jsonb_build_object(
    'advisorId', ids.user_a::text,
    'policyReference', 'CARTERA030B_ACCEPTANCE:POLICY:A',
    'policyVersionReference', 'CARTERA030B_ACCEPTANCE:POLICY_VERSION:A',
    'policyTermsDigest', repeat('c', 64),
    'obligationKind', 'PREMIUM_PAYMENT',
    'expectedDate', '2026-06-30',
    'sequenceNumber', 6,
    'paymentFrequency', 'MONTHLY',
    'scheduleRuleReference', null
  )
);

insert into public.cartera030b_expected_payment_obligations (
  advisor_id, obligation_reference, policy_id, policy_version_id,
  policy_reference, policy_version_reference, policy_terms_digest,
  obligation_kind, expected_date, expected_amount, currency,
  payment_frequency, policy_year, sequence_number, status,
  schedule_rule_reference, source_evidence_references,
  matched_payment_event_references, confirmation_state, timezone,
  date_authority, generation_idempotency_key, generation_digest,
  created_by
)
select
  user_a,
  forged_reference,
  policy_a,
  version_a,
  'CARTERA030B_ACCEPTANCE:POLICY:A',
  'CARTERA030B_ACCEPTANCE:POLICY_VERSION:A',
  repeat('e', 64),
  'PREMIUM_PAYMENT',
  date '2026-06-30',
  null,
  'MXN',
  'MONTHLY',
  1,
  6,
  'SCHEDULED',
  null,
  '[]'::jsonb,
  '[]'::jsonb,
  'SCHEDULE_DERIVED',
  'America/Mexico_City',
  'CONFIRMED_POLICY_TERMS_DERIVED',
  'CARTERA030B_ACCEPTANCE:FORGED',
  repeat('f', 64),
  user_a
from cartera030b_acceptance_ids;

insert into cartera030b_acceptance_payloads (name, payload)
select
  'identity-collision',
  command_payload || jsonb_build_object(
    'authorization', jsonb_build_object(
      'authorized', true,
      'payloadDigest', public.forge_cartera030b_digest(command_payload)
    )
  )
from (
  select jsonb_build_object(
    'policyReference', 'CARTERA030B_ACCEPTANCE:POLICY:A',
    'policyVersionReference', 'CARTERA030B_ACCEPTANCE:POLICY_VERSION:A',
    'generationHorizonDate', '2026-06-30',
    'timezone', 'America/Mexico_City',
    'amountSemantics', 'UNKNOWN',
    'scheduleRuleReference', null,
    'sourceEvidenceReferences', jsonb_build_array('CARTERA030B_ACCEPTANCE:EVIDENCE:A'),
    'idempotencyKey', 'CARTERA030B_ACCEPTANCE:GENERATE:IDENTITY_COLLISION'
  ) as command_payload
) source;

select set_config('request.jwt.claim.sub', user_a::text, true)
from cartera030b_acceptance_ids;
set local role authenticated;

DO $$
declare
  response jsonb;
begin
  begin
    select public.forge_cartera030b_generate_expected_obligations(payload)
    into response
    from cartera030b_acceptance_payloads
    where name = 'identity-collision';

    insert into cartera030b_acceptance_results (name, payload)
    values ('identity-collision', response)
    on conflict (name) do update set payload = excluded.payload;
  exception
    when others then
      if position('CARTERA030B_OBLIGATION_IDENTITY_COLLISION' in sqlerrm) = 0 then
        raise;
      end if;
      insert into cartera030b_acceptance_results (name, payload)
      values ('identity-collision', jsonb_build_object('generationState', 'ERROR', 'reason', 'OBLIGATION_IDENTITY_COLLISION'))
      on conflict (name) do update set payload = excluded.payload;
  end;
end;
$$;

reset role;

DO $$
begin
  if not exists (
    select 1
    from public.cartera030b_obligation_conflicts c
    join cartera030b_acceptance_ids ids on ids.forged_reference = (
      c.claims ->> 'obligationReference'
    )
    where c.conflict_type = 'OBLIGATION_IDENTITY_COLLISION'
  ) then
    raise exception 'CARTERA030B_IDENTITY_COLLISION_CONFLICT_NOT_DURABLE_DIAGNOSTIC:response=%,forged=%,conflicts=%',
    (select payload from cartera030b_acceptance_results where name = 'identity-collision'),
    (select forged_reference from cartera030b_acceptance_ids),
    coalesce((
      select jsonb_agg(jsonb_build_object(
        'type', c.conflict_type,
        'reference', c.conflict_reference,
        'obligationReference', c.claims ->> 'obligationReference',
        'claims', c.claims
      ) order by c.recorded_at)
      from public.cartera030b_obligation_conflicts c
      where c.advisor_id = (select user_a from cartera030b_acceptance_ids)
    ), '[]'::jsonb);
  end if;

  if to_regprocedure('public.forge_cartera030b_reconcile_payment_event(jsonb)') is not null then
    raise exception 'CARTERA030B_UNVERIFIED_PAYMENT_RECONCILIATION_RPC_EXPOSED';
  end if;
end;
$$;

rollback;
select
  'PASS CARTERA030B_TRANSACTIONAL_ACCEPTANCE'::text as acceptance,
  'YES'::text as fixtures_rolled_back,
  'PASS'::text as deterministic_recurrence,
  'PASS'::text as conflict_persistence,
  'PASS'::text as rls_cross_advisor,
  'PASS'::text as sanitized_calendar;
