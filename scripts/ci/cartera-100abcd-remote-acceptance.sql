begin;

create temporary table cartera100_ids (
  user_a uuid not null,
  user_b uuid not null,
  person_a uuid not null
) on commit drop;

insert into cartera100_ids values (gen_random_uuid(), gen_random_uuid(), gen_random_uuid());

create temporary table cartera100_results (
  name text primary key,
  payload jsonb not null
) on commit drop;
grant select on cartera100_ids to authenticated;
grant select, insert, update on cartera100_results to authenticated;

insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at
)
select '00000000-0000-0000-0000-000000000000'::uuid, user_a,
  'authenticated', 'authenticated', 'cartera100-acceptance-a@forge.invalid', '', now(),
  '{}'::jsonb, '{}'::jsonb, now(), now()
from cartera100_ids
union all
select '00000000-0000-0000-0000-000000000000'::uuid, user_b,
  'authenticated', 'authenticated', 'cartera100-acceptance-b@forge.invalid', '', now(),
  '{}'::jsonb, '{}'::jsonb, now(), now()
from cartera100_ids;

insert into public.commercial_people (
  id, advisor_id, person_reference, display_name, preferred_name,
  normalized_name, lifecycle_state, privacy_classification,
  evidence_references, created_by
)
select person_a, user_a, 'CARTERA100_ACCEPTANCE:PERSON:A',
  'Ana Cartera 100', 'Ana', 'ana cartera 100', 'CONFIRMED', 'PRIVATE',
  jsonb_build_array('CARTERA100_ACCEPTANCE:IDENTITY:A'), user_a
from cartera100_ids;

insert into public.cartera040_relationship_memory_entries (
  advisor_id, memory_reference, person_id, person_reference,
  memory_kind, summary, value_code, occurred_at, source_authority,
  source_record_reference, evidence_references, sensitivity,
  consent_state, context_use, command_digest, idempotency_key, created_by
)
select user_a, 'CARTERA100_ACCEPTANCE:MEMORY:REVIEW', person_a,
  'CARTERA100_ACCEPTANCE:PERSON:A', 'ANNUAL_REVIEW',
  'Revisión anual completada y confirmada.', null,
  timestamptz '2026-08-03 15:00:00+00', 'ADVISOR_CONFIRMED',
  'CARTERA100_ACCEPTANCE:SOURCE:REVIEW',
  jsonb_build_array('CARTERA100_ACCEPTANCE:EVIDENCE:REVIEW'),
  'PERSONAL', 'NOT_REQUIRED', 'SERVICE_ONLY',
  repeat('a', 64), 'CARTERA100_ACCEPTANCE:KEY:REVIEW', user_a
from cartera100_ids
union all
select user_a, 'CARTERA100_ACCEPTANCE:MEMORY:REFERRAL', person_a,
  'CARTERA100_ACCEPTANCE:PERSON:A', 'ORIGIN_REFERRAL',
  'La persona confirmó disposición para una introducción.', 'WILLING_TO_INTRODUCE',
  timestamptz '2026-08-04 15:00:00+00', 'CLIENT_CONFIRMED',
  'CARTERA100_ACCEPTANCE:SOURCE:REFERRAL',
  jsonb_build_array('CARTERA100_ACCEPTANCE:EVIDENCE:REFERRAL'),
  'PERSONAL', 'CONFIRMED', 'GENERAL_RELATIONSHIP',
  repeat('b', 64), 'CARTERA100_ACCEPTANCE:KEY:REFERRAL', user_a
from cartera100_ids;

select set_config('request.jwt.claim.sub', user_a::text, true) from cartera100_ids;
set local role authenticated;

do $$
declare
  command_payload jsonb;
  changed_payload jsonb;
  authorized_payload jsonb;
  first_result jsonb;
  replay_result jsonb;
  changed_result jsonb;
  feedback_payload jsonb;
  feedback_result jsonb;
begin
  command_payload := jsonb_build_object(
    'metricKey', 'ACCEPTED_RECOMMENDATIONS',
    'metricCategory', 'PRODUCTIVITY',
    'quantity', 1,
    'unit', 'COUNT',
    'currency', null,
    'metricState', 'KNOWN',
    'sourceAuthority', 'CARTERA070_RELATIONAL_ACTIVATION',
    'sourceRecordReference', 'CARTERA100_ACCEPTANCE:ACTION:1',
    'recommendationReference', 'CARTERA100_ACCEPTANCE:RECOMMENDATION:1',
    'outcomeReference', null,
    'attributionState', 'ACTION_CONFIRMED',
    'usefulnessFeedback', 'UNSET',
    'evidenceReferences', jsonb_build_array('CARTERA100_ACCEPTANCE:EVIDENCE:ACTION:1'),
    'occurredAt', '2026-08-05T15:00:00.000Z',
    'idempotencyKey', 'CARTERA100_ACCEPTANCE:KEY:ACTION:1',
    'metadata', jsonb_build_object(
      'recommendationClass', 'CONFIRM_PAYMENT',
      'causalOutcomeClaimed', false,
      'automaticAction', false
    )
  );
  authorized_payload := command_payload || jsonb_build_object(
    'authorization', jsonb_build_object(
      'authorized', true,
      'payloadDigest', public.forge_cartera030b_digest(command_payload)
    )
  );

  first_result := public.forge_cartera100_record_productivity_observation(authorized_payload);
  replay_result := public.forge_cartera100_record_productivity_observation(authorized_payload);
  changed_payload := jsonb_set(
    jsonb_set(command_payload, '{quantity}', '2'::jsonb),
    '{metadata,changedInput}',
    'true'::jsonb,
    true
  );
  changed_result := public.forge_cartera100_record_productivity_observation(
    changed_payload || jsonb_build_object(
      'authorization', jsonb_build_object(
        'authorized', true,
        'payloadDigest', public.forge_cartera030b_digest(changed_payload)
      )
    )
  );

  if first_result ->> 'recordingState' <> 'COMPLETE'
     or first_result ->> 'humanScoreCreated' <> 'false'
     or first_result ->> 'advisorRankingCreated' <> 'false'
     or first_result ->> 'automaticActionExecuted' <> 'false'
     or first_result ->> 'causalCreditClaimed' <> 'false' then
    raise exception 'CARTERA100_FIRST_WRITE_BOUNDARY_FAILED';
  end if;
  if replay_result ->> 'observationReference' <> first_result ->> 'observationReference' then
    raise exception 'CARTERA100_IDEMPOTENT_REPLAY_FAILED';
  end if;
  if changed_result ->> 'recordingState' <> 'CONFLICT'
     or changed_result ->> 'reason' <> 'CHANGED_INPUT_REPLAY' then
    raise exception 'CARTERA100_CHANGED_INPUT_CONFLICT_FAILED';
  end if;

  feedback_payload := jsonb_build_object(
    'metricKey', 'INDEPENDENT_OUTCOME_FEEDBACK',
    'metricCategory', 'LEARNING',
    'quantity', 1,
    'unit', 'COUNT',
    'currency', null,
    'metricState', 'KNOWN',
    'sourceAuthority', 'ADVISOR_FEEDBACK',
    'sourceRecordReference', 'CARTERA100_ACCEPTANCE:RECOMMENDATION:1',
    'recommendationReference', 'CARTERA100_ACCEPTANCE:RECOMMENDATION:1',
    'outcomeReference', null,
    'attributionState', 'INDEPENDENT',
    'usefulnessFeedback', 'INDEPENDENT',
    'evidenceReferences', jsonb_build_array('CARTERA100_ACCEPTANCE:RECOMMENDATION:1'),
    'occurredAt', '2026-08-06T15:00:00.000Z',
    'idempotencyKey', 'CARTERA100_ACCEPTANCE:KEY:FEEDBACK:1',
    'metadata', jsonb_build_object(
      'explicitAdvisorFeedback', true,
      'permissionInferredFromSilence', false,
      'causalCreditClaimed', false
    )
  );
  feedback_result := public.forge_cartera100_record_productivity_observation(
    feedback_payload || jsonb_build_object(
      'authorization', jsonb_build_object(
        'authorized', true,
        'payloadDigest', public.forge_cartera030b_digest(feedback_payload)
      )
    )
  );
  if feedback_result ->> 'recordingState' <> 'COMPLETE'
     or feedback_result ->> 'attributionState' <> 'INDEPENDENT'
     or feedback_result ->> 'usefulnessFeedback' <> 'INDEPENDENT'
     or feedback_result ->> 'causalCreditClaimed' <> 'false' then
    raise exception 'CARTERA100_EXPLICIT_FEEDBACK_FAILED';
  end if;
end;
$$;

insert into cartera100_results (name, payload)
values (
  'owner',
  public.forge_cartera100_list_productivity_proof(jsonb_build_object(
    'startDate', '2026-08-02',
    'endDate', '2026-08-31',
    'limit', 100
  ))
);

do $$
declare
  result jsonb;
  accepted_count numeric;
  review_count numeric;
  referral_count numeric;
begin
  select payload into result from cartera100_results where name = 'owner';
  select coalesce(sum((item ->> 'quantity')::numeric), 0)
  into accepted_count
  from jsonb_array_elements(result -> 'observations') item
  where item ->> 'metricKey' = 'ACCEPTED_RECOMMENDATIONS';
  select (item ->> 'value')::numeric into review_count
  from jsonb_array_elements(result -> 'authoritativeMetrics') item
  where item ->> 'metricKey' = 'RELATIONSHIP_REVIEWS_COMPLETED';
  select (item ->> 'value')::numeric into referral_count
  from jsonb_array_elements(result -> 'authoritativeMetrics') item
  where item ->> 'metricKey' = 'CONSENTED_REFERRALS_OBTAINED';

  if accepted_count <> 1 then raise exception 'CARTERA100_ACCEPTED_COUNT_INVALID'; end if;
  if review_count <> 1 then raise exception 'CARTERA100_RELATIONSHIP_REVIEW_COUNT_INVALID'; end if;
  if referral_count <> 1 then raise exception 'CARTERA100_CONSENTED_REFERRAL_COUNT_INVALID'; end if;
  if jsonb_array_length(result -> 'recentRecommendations') <> 1 then
    raise exception 'CARTERA100_RECENT_RECOMMENDATION_MISSING';
  end if;
  if result #>> '{instrumentation,coverageState}' <> 'COMPLETE'
     or result #>> '{sourceState,activityHours}' <> 'NOT_CONNECTED'
     or result #>> '{boundaries,humanPerformanceScore}' <> 'false'
     or result #>> '{boundaries,advisorRanking}' <> 'false'
     or result #>> '{boundaries,silentConsentInference}' <> 'false'
     or result #>> '{boundaries,contactVolumeOptimization}' <> 'false'
     or result #>> '{boundaries,causalityClaimWithoutEvidence}' <> 'false'
     or result #>> '{boundaries,advisorFeedbackRequiredForLearning}' <> 'true'
     or result ->> 'projectionAuthority' <> 'CARTERA100_PRODUCTIVITY_PROOF_READ_MODEL'
     or result ->> 'readOnly' <> 'true' then
    raise exception 'CARTERA100_PROOF_BOUNDARY_INVALID';
  end if;
end;
$$;

do $$
begin
  begin
    insert into public.cartera100_productivity_observations (
      advisor_id, observation_reference, metric_key, metric_category,
      quantity, unit, metric_state, source_authority, source_record_reference,
      evidence_references, occurred_at, idempotency_key, command_digest,
      metadata, recorded_by
    )
    select user_a, 'CARTERA100_ACCEPTANCE:DIRECT:1', 'ACCEPTED_RECOMMENDATIONS',
      'PRODUCTIVITY', 1, 'COUNT', 'KNOWN', 'DIRECT_WRITE',
      'CARTERA100_ACCEPTANCE:DIRECT:SOURCE',
      jsonb_build_array('CARTERA100_ACCEPTANCE:DIRECT:EVIDENCE'), now(),
      'CARTERA100_ACCEPTANCE:DIRECT:KEY', repeat('c', 64), '{}'::jsonb, user_a
    from cartera100_ids;
    raise exception 'CARTERA100_DIRECT_INSERT_UNEXPECTEDLY_ALLOWED';
  exception when insufficient_privilege then null;
  end;
end;
$$;

reset role;
select set_config('request.jwt.claim.sub', user_b::text, true) from cartera100_ids;
set local role authenticated;

insert into cartera100_results (name, payload)
values (
  'cross-advisor',
  public.forge_cartera100_list_productivity_proof(jsonb_build_object(
    'startDate', '2026-08-02',
    'endDate', '2026-08-31',
    'limit', 100
  ))
);

do $$
declare
  result jsonb;
begin
  select payload into result from cartera100_results where name = 'cross-advisor';
  if jsonb_array_length(result -> 'observations') <> 0
     or jsonb_array_length(result -> 'recentRecommendations') <> 0 then
    raise exception 'CARTERA100_CROSS_ADVISOR_OBSERVATION_LEAK';
  end if;
  if exists (
    select 1 from jsonb_array_elements(result -> 'authoritativeMetrics') item
    where (item ->> 'value')::numeric <> 0
  ) then
    raise exception 'CARTERA100_CROSS_ADVISOR_METRIC_LEAK';
  end if;
end;
$$;

reset role;

select 'PASS CARTERA100_TRANSACTIONAL_ACCEPTANCE' as acceptance;

rollback;
