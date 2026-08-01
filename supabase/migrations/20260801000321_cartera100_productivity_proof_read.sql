-- CARTERA 100C/100D productivity proof read model.
-- The read model composes evidence; it does not create human scores, rankings,
-- causal credit, enforcement, contact volume targets or automatic actions.

begin;

create or replace function public.forge_cartera100_list_productivity_proof(
  p_payload jsonb default '{}'::jsonb
)
returns jsonb
language plpgsql
security definer
stable
set search_path = public, auth, pg_temp
as $$
declare
  advisor uuid := auth.uid();
  start_date_value date;
  end_date_value date;
  limit_value integer;
  instrumentation_started_at constant timestamptz := timestamptz '2026-08-01 17:37:00+00';
  observations_value jsonb;
  recent_recommendations_value jsonb;
  relationship_review_count integer;
  relationship_review_evidence jsonb;
  referral_count integer;
  referral_evidence jsonb;
  protected_payment_count integer;
  protected_payment_evidence jsonb;
  authoritative_metrics_value jsonb;
  coverage_state_value text;
begin
  if advisor is null then raise exception 'CARTERA100_AUTHENTICATION_REQUIRED'; end if;
  if p_payload is null or jsonb_typeof(p_payload) <> 'object' then
    raise exception 'CARTERA100_PROOF_PAYLOAD_INVALID';
  end if;

  start_date_value := coalesce(
    nullif(p_payload ->> 'startDate', '')::date,
    date_trunc('month', current_date)::date
  );
  end_date_value := coalesce(nullif(p_payload ->> 'endDate', '')::date, current_date);
  limit_value := coalesce(nullif(p_payload ->> 'limit', '')::integer, 250);

  if start_date_value > end_date_value or limit_value < 1 or limit_value > 500 then
    raise exception 'CARTERA100_PROOF_INPUT_INVALID';
  end if;

  coverage_state_value := case
    when start_date_value::timestamptz >= instrumentation_started_at then 'COMPLETE'
    else 'PARTIAL'
  end;

  select coalesce(jsonb_agg(item order by occurred_at asc, observation_reference asc), '[]'::jsonb)
  into observations_value
  from (
    select
      o.occurred_at,
      o.observation_reference,
      jsonb_build_object(
        'observationReference', o.observation_reference,
        'metricKey', o.metric_key,
        'metricCategory', o.metric_category,
        'quantity', o.quantity,
        'unit', o.unit,
        'currency', o.currency,
        'metricState', case
          when coverage_state_value = 'PARTIAL'
            and o.metric_key in (
              'ACCEPTED_RECOMMENDATIONS',
              'COMPLETED_MINIMUM_USEFUL_ACTIONS',
              'USEFUL_RECOMMENDATION_FEEDBACK',
              'NOT_USEFUL_RECOMMENDATION_FEEDBACK',
              'INDEPENDENT_OUTCOME_FEEDBACK'
            ) then 'INCOMPLETE'
          else o.metric_state
        end,
        'sourceAuthority', o.source_authority,
        'sourceOwner', 'PRODUCTIVITY',
        'sourceRecordReference', o.source_record_reference,
        'recommendationReference', o.recommendation_reference,
        'outcomeReference', o.outcome_reference,
        'attributionState', o.attribution_state,
        'usefulnessFeedback', o.usefulness_feedback,
        'evidenceReferences', o.evidence_references,
        'occurredAt', o.occurred_at,
        'recordedAt', o.recorded_at,
        'freshness', 'CURRENT',
        'limitation', case
          when coverage_state_value = 'PARTIAL' then
            'La instrumentación comenzó después del inicio del periodo; el total puede estar incompleto.'
          else null
        end,
        'metadata', o.metadata
      ) as item
    from public.cartera100_productivity_observations o
    where o.advisor_id = advisor
      and o.occurred_at >= start_date_value::timestamptz
      and o.occurred_at < (end_date_value + 1)::timestamptz
    order by o.occurred_at asc, o.observation_reference asc
    limit limit_value
  ) bounded_observations;

  select
    count(*)::integer,
    coalesce(jsonb_agg(m.memory_reference order by m.occurred_at) filter (where m.memory_reference is not null), '[]'::jsonb)
  into relationship_review_count, relationship_review_evidence
  from public.cartera040_relationship_memory_entries m
  where m.advisor_id = advisor
    and m.memory_kind = 'ANNUAL_REVIEW'
    and m.record_state <> 'WITHDRAWN'
    and m.occurred_at >= start_date_value::timestamptz
    and m.occurred_at < (end_date_value + 1)::timestamptz
    and not exists (
      select 1
      from public.cartera040_relationship_memory_entries newer
      where newer.advisor_id = advisor
        and newer.supersedes_memory_id = m.id
        and newer.record_state <> 'WITHDRAWN'
    );

  select
    count(*)::integer,
    coalesce(jsonb_agg(m.memory_reference order by m.occurred_at) filter (where m.memory_reference is not null), '[]'::jsonb)
  into referral_count, referral_evidence
  from public.cartera040_relationship_memory_entries m
  where m.advisor_id = advisor
    and m.memory_kind = 'ORIGIN_REFERRAL'
    and m.value_code = 'WILLING_TO_INTRODUCE'
    and m.source_authority = 'CLIENT_CONFIRMED'
    and m.consent_state = 'CONFIRMED'
    and m.record_state <> 'WITHDRAWN'
    and m.occurred_at >= start_date_value::timestamptz
    and m.occurred_at < (end_date_value + 1)::timestamptz
    and not exists (
      select 1
      from public.cartera040_relationship_memory_entries newer
      where newer.advisor_id = advisor
        and newer.supersedes_memory_id = m.id
        and newer.record_state <> 'WITHDRAWN'
    );

  select
    count(distinct e.id)::integer,
    coalesce(jsonb_agg(distinct e.payment_event_reference) filter (where e.payment_event_reference is not null), '[]'::jsonb)
  into protected_payment_count, protected_payment_evidence
  from public.cartera030c_confirmed_payment_events e
  join public.cartera030b_expected_payment_obligations o
    on o.advisor_id = e.advisor_id
   and o.policy_id = e.policy_id
   and o.matched_payment_event_references ? e.payment_event_reference
  where e.advisor_id = advisor
    and e.confirmed_at >= start_date_value::timestamptz
    and e.confirmed_at < (end_date_value + 1)::timestamptz
    and e.confirmed_at::date <= o.expected_date;

  if jsonb_array_length(relationship_review_evidence) = 0 then
    relationship_review_evidence := jsonb_build_array(
      'CARTERA100:SCAN:RELATIONSHIP_REVIEWS:' || start_date_value || ':' || end_date_value
    );
  end if;
  if jsonb_array_length(referral_evidence) = 0 then
    referral_evidence := jsonb_build_array(
      'CARTERA100:SCAN:CONSENTED_REFERRALS:' || start_date_value || ':' || end_date_value
    );
  end if;
  if jsonb_array_length(protected_payment_evidence) = 0 then
    protected_payment_evidence := jsonb_build_array(
      'CARTERA100:SCAN:PROTECTED_PAYMENTS:' || start_date_value || ':' || end_date_value
    );
  end if;

  authoritative_metrics_value := jsonb_build_array(
    jsonb_build_object(
      'metricKey', 'RELATIONSHIP_REVIEWS_COMPLETED',
      'metricCategory', 'GROWTH',
      'state', case when relationship_review_count = 0 then 'ZERO' else 'KNOWN' end,
      'value', relationship_review_count,
      'unit', 'COUNT',
      'sourceAuthority', 'CARTERA040_RELATIONSHIP_MEMORY',
      'sourceOwner', 'RELATIONSHIP_MEMORY',
      'evidenceReferences', relationship_review_evidence,
      'freshness', 'CURRENT',
      'limitation', null
    ),
    jsonb_build_object(
      'metricKey', 'CONSENTED_REFERRALS_OBTAINED',
      'metricCategory', 'GROWTH',
      'state', case when referral_count = 0 then 'ZERO' else 'KNOWN' end,
      'value', referral_count,
      'unit', 'COUNT',
      'sourceAuthority', 'CARTERA040_RELATIONSHIP_MEMORY',
      'sourceOwner', 'RELATIONSHIP_MEMORY',
      'evidenceReferences', referral_evidence,
      'freshness', 'CURRENT',
      'limitation', 'Mide voluntad explícita confirmada; no implica contacto, referido ejecutado ni venta.'
    ),
    jsonb_build_object(
      'metricKey', 'PAYMENTS_CONFIRMED_BEFORE_RISK',
      'metricCategory', 'INCOME_PROTECTION',
      'state', case when protected_payment_count = 0 then 'ZERO' else 'KNOWN' end,
      'value', protected_payment_count,
      'unit', 'COUNT',
      'sourceAuthority', 'CARTERA030_PAYMENT_EVENT_AND_OBLIGATION',
      'sourceOwner', 'PAYMENT_EVENT',
      'evidenceReferences', protected_payment_evidence,
      'freshness', 'CURRENT',
      'limitation', 'Cuenta pagos confirmados vinculados a una obligación cuya confirmación ocurrió a más tardar en la fecha esperada.'
    )
  );

  select coalesce(jsonb_agg(item order by occurred_at desc), '[]'::jsonb)
  into recent_recommendations_value
  from (
    select distinct on (accepted.recommendation_reference)
      accepted.occurred_at,
      jsonb_build_object(
        'recommendationReference', accepted.recommendation_reference,
        'recommendationClass', coalesce(accepted.metadata ->> 'recommendationClass', 'UNCLASSIFIED'),
        'sourceAuthority', accepted.source_authority,
        'occurredAt', accepted.occurred_at,
        'evidenceReferences', accepted.evidence_references,
        'attributionState', accepted.attribution_state
      ) as item
    from public.cartera100_productivity_observations accepted
    where accepted.advisor_id = advisor
      and accepted.metric_key = 'ACCEPTED_RECOMMENDATIONS'
      and accepted.recommendation_reference is not null
      and accepted.occurred_at >= start_date_value::timestamptz
      and accepted.occurred_at < (end_date_value + 1)::timestamptz
    order by accepted.recommendation_reference, accepted.occurred_at desc
    limit 12
  ) recent;

  return jsonb_build_object(
    'period', jsonb_build_object(
      'startDate', start_date_value,
      'endDate', end_date_value,
      'timeZone', 'America/Mexico_City'
    ),
    'authoritativeMetrics', authoritative_metrics_value,
    'observations', observations_value,
    'recentRecommendations', recent_recommendations_value,
    'sourceState', jsonb_build_object(
      'productivityObservationLedger', coverage_state_value,
      'relationshipMemory', 'CONNECTED',
      'paymentEventAndObligation', 'CONNECTED',
      'policyIntakeAutomation', 'NOT_CONNECTED',
      'compensationDiscrepancies', 'NOT_CONNECTED',
      'activityHours', 'NOT_CONNECTED',
      'pipelineConversions', 'NOT_CONNECTED'
    ),
    'instrumentation', jsonb_build_object(
      'startedAt', instrumentation_started_at,
      'coverageState', coverage_state_value,
      'periodPredatesInstrumentation', coverage_state_value = 'PARTIAL'
    ),
    'boundaries', jsonb_build_object(
      'humanPerformanceScore', false,
      'advisorRanking', false,
      'humanWorthInference', false,
      'motivationInference', false,
      'disciplineInference', false,
      'enforcementRecommendation', false,
      'silentConsentInference', false,
      'contactVolumeOptimization', false,
      'causalityClaimWithoutEvidence', false,
      'automaticContactExecution', false,
      'automaticMessageGeneration', false,
      'automaticTaskCreation', false,
      'automaticCalendarCreation', false,
      'automaticOpportunityCreation', false,
      'advisorFeedbackRequiredForLearning', true
    ),
    'projectionAuthority', 'CARTERA100_PRODUCTIVITY_PROOF_READ_MODEL',
    'readOnly', true
  );
end;
$$;

revoke all on function public.forge_cartera100_list_productivity_proof(jsonb)
  from public, anon;
grant execute on function public.forge_cartera100_list_productivity_proof(jsonb)
  to authenticated;

comment on function public.forge_cartera100_list_productivity_proof(jsonb) is
  'Owner-scoped evidence-bound Cartera productivity proof. No human score, ranking, enforcement, silent consent or unsupported causal credit.';

commit;
