-- CARTERA 100A/100B append-only productivity observation authority.
-- Observations are evidence-bound operational facts. They are not human scores,
-- rankings, behavior truth, enforcement, silent consent or automatic execution.

begin;

create table if not exists public.cartera100_productivity_observations (
  id uuid primary key default gen_random_uuid(),
  advisor_id uuid not null references auth.users(id) on delete restrict,
  observation_reference text not null,
  metric_key text not null check (metric_key in (
    'POLICIES_IMPORTED_AUTOMATICALLY',
    'FIELDS_EXTRACTED',
    'WORK_MINUTES_AVOIDED',
    'IDENTITY_DUPLICATES_PREVENTED',
    'PAYMENT_EMAILS_DETECTED',
    'ADMIN_TASKS_ELIMINATED',
    'POLICY_REVIEW_MINUTES_TOTAL',
    'IMPORTED_POLICY_REVIEW_COUNT',
    'PAYMENTS_CONFIRMED_BEFORE_RISK',
    'RENEWALS_ATTENDED',
    'POSSIBLE_LAPSES_SURFACED',
    'COMMISSION_DISCREPANCIES_DETECTED',
    'CONSERVATION_ACTIONS_COMPLETED',
    'PROTECTED_EXPECTED_VALUE',
    'SECOND_POLICY_REVIEWS',
    'RELATIONSHIP_REVIEWS_COMPLETED',
    'WARM_OPPORTUNITIES_CREATED',
    'CONSENTED_REFERRALS_OBTAINED',
    'CENTERS_OF_INFLUENCE_STRENGTHENED',
    'OPPORTUNITIES_RETURNED_TO_PIPELINE',
    'ADVISOR_WORK_MINUTES',
    'CONFIRMED_PRODUCTION_COUNT',
    'ACCEPTED_RECOMMENDATIONS',
    'COMPLETED_MINIMUM_USEFUL_ACTIONS',
    'RESPONSE_ATTEMPTS',
    'RESPONSES_RECEIVED',
    'CONVERSION_STARTS',
    'CONVERSION_SUCCESSES',
    'SIGNAL_TO_ACTION_SECONDS_TOTAL',
    'SIGNAL_TO_ACTION_COUNT',
    'USEFUL_RECOMMENDATION_FEEDBACK',
    'NOT_USEFUL_RECOMMENDATION_FEEDBACK',
    'INDEPENDENT_OUTCOME_FEEDBACK'
  )),
  metric_category text not null check (metric_category in (
    'WORK_REDUCTION', 'INCOME_PROTECTION', 'GROWTH', 'PRODUCTIVITY', 'LEARNING'
  )),
  quantity numeric(20, 4) not null check (quantity >= 0),
  unit text not null check (unit in ('COUNT', 'MINUTES', 'SECONDS', 'CURRENCY')),
  currency text,
  metric_state text not null check (metric_state in (
    'KNOWN', 'ZERO', 'STALE', 'INCOMPLETE', 'CONFLICTING'
  )),
  source_authority text not null,
  source_record_reference text not null,
  recommendation_reference text,
  outcome_reference text,
  attribution_state text not null default 'NONE' check (attribution_state in (
    'NONE', 'UNKNOWN', 'TEMPORAL', 'ACTION_CONFIRMED', 'STATE_TRANSITION',
    'ADVISOR_REPORTED_RELATED', 'INDEPENDENT'
  )),
  usefulness_feedback text not null default 'UNSET' check (usefulness_feedback in (
    'UNSET', 'USEFUL', 'NOT_USEFUL', 'INDEPENDENT'
  )),
  evidence_references jsonb not null,
  occurred_at timestamptz not null,
  recorded_at timestamptz not null default now(),
  idempotency_key text not null,
  command_digest text not null,
  metadata jsonb not null default '{}'::jsonb,
  recorded_by uuid not null references auth.users(id) on delete restrict,
  constraint cartera100_observation_reference_ck
    check (observation_reference ~ '^[A-Za-z0-9][A-Za-z0-9._:@/-]{0,239}$'),
  constraint cartera100_source_authority_ck
    check (source_authority ~ '^[A-Z0-9][A-Z0-9._:@/-]{0,119}$'),
  constraint cartera100_source_record_ck
    check (source_record_reference ~ '^[A-Za-z0-9][A-Za-z0-9._:@/-]{0,239}$'),
  constraint cartera100_recommendation_reference_ck
    check (recommendation_reference is null or recommendation_reference ~ '^[A-Za-z0-9][A-Za-z0-9._:@/-]{0,239}$'),
  constraint cartera100_outcome_reference_ck
    check (outcome_reference is null or outcome_reference ~ '^[A-Za-z0-9][A-Za-z0-9._:@/-]{0,239}$'),
  constraint cartera100_currency_ck
    check ((unit = 'CURRENCY' and currency ~ '^[A-Z]{3,10}$') or (unit <> 'CURRENCY' and currency is null)),
  constraint cartera100_zero_state_ck
    check ((metric_state = 'ZERO' and quantity = 0) or metric_state <> 'ZERO'),
  constraint cartera100_evidence_ck
    check (
      jsonb_typeof(evidence_references) = 'array'
      and jsonb_array_length(evidence_references) >= 1
      and jsonb_array_length(evidence_references) <= 20
    ),
  constraint cartera100_idempotency_ck
    check (idempotency_key ~ '^[A-Za-z0-9][A-Za-z0-9._:@/-]{0,159}$'),
  constraint cartera100_digest_ck
    check (command_digest ~ '^[a-f0-9]{64}$'),
  constraint cartera100_metadata_ck
    check (
      jsonb_typeof(metadata) = 'object'
      and length(metadata::text) <= 5000
      and metadata::text !~* '"(advisorScore|productivityScore|humanScore|humanWorth|advisorWorth|advisorRanking|disciplineScore|motivationScore|coachabilityScore|employmentRecommendation|bankAccount|cardNumber|health|medicalInformation|finalMessage)"'
    ),
  constraint cartera100_actor_ck check (recorded_by = advisor_id),
  unique (id, advisor_id),
  unique (advisor_id, observation_reference),
  unique (advisor_id, idempotency_key)
);

create index if not exists cartera100_observation_period_idx
  on public.cartera100_productivity_observations (
    advisor_id, occurred_at desc, metric_category, metric_key
  );

create index if not exists cartera100_recommendation_feedback_idx
  on public.cartera100_productivity_observations (
    advisor_id, recommendation_reference, recorded_at desc
  ) where recommendation_reference is not null;

create table if not exists public.cartera100_productivity_command_receipts (
  id uuid primary key default gen_random_uuid(),
  advisor_id uuid not null references auth.users(id) on delete restrict,
  idempotency_key text not null,
  command_digest text not null,
  observation_id uuid not null,
  response_envelope jsonb not null,
  executed_at timestamptz not null default now(),
  executed_by uuid not null references auth.users(id) on delete restrict,
  constraint cartera100_receipt_idempotency_ck
    check (idempotency_key ~ '^[A-Za-z0-9][A-Za-z0-9._:@/-]{0,159}$'),
  constraint cartera100_receipt_digest_ck check (command_digest ~ '^[a-f0-9]{64}$'),
  constraint cartera100_receipt_response_ck check (jsonb_typeof(response_envelope) = 'object'),
  constraint cartera100_receipt_actor_ck check (executed_by = advisor_id),
  constraint cartera100_receipt_observation_fk
    foreign key (observation_id, advisor_id)
    references public.cartera100_productivity_observations (id, advisor_id)
    on delete restrict,
  unique (advisor_id, idempotency_key)
);

drop trigger if exists cartera100_observation_append_only
  on public.cartera100_productivity_observations;
create trigger cartera100_observation_append_only
before update or delete on public.cartera100_productivity_observations
for each row execute function public.forge_cartera030b_append_only_guard();

drop trigger if exists cartera100_receipt_append_only
  on public.cartera100_productivity_command_receipts;
create trigger cartera100_receipt_append_only
before update or delete on public.cartera100_productivity_command_receipts
for each row execute function public.forge_cartera030b_append_only_guard();

alter table public.cartera100_productivity_observations enable row level security;
alter table public.cartera100_productivity_observations force row level security;
alter table public.cartera100_productivity_command_receipts enable row level security;
alter table public.cartera100_productivity_command_receipts force row level security;

create policy cartera100_observation_owner_select
on public.cartera100_productivity_observations
for select to authenticated
using (advisor_id = auth.uid());

create policy cartera100_receipt_owner_select
on public.cartera100_productivity_command_receipts
for select to authenticated
using (advisor_id = auth.uid());

revoke all on public.cartera100_productivity_observations from anon, authenticated;
revoke all on public.cartera100_productivity_command_receipts from anon, authenticated;

create or replace function public.forge_cartera100_validate_reference_array(
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
  for reference_value in select value from jsonb_array_elements_text(p_references)
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

create or replace function public.forge_cartera100_record_productivity_observation(
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
  command_digest_value text;
  metric_key_value text;
  metric_category_value text;
  quantity_value numeric;
  unit_value text;
  currency_value text;
  metric_state_value text;
  source_authority_value text;
  source_record_reference_value text;
  recommendation_reference_value text;
  outcome_reference_value text;
  attribution_state_value text;
  usefulness_feedback_value text;
  evidence_references_value jsonb;
  occurred_at_value timestamptz;
  idempotency_key_value text;
  metadata_value jsonb;
  prior_receipt record;
  observation_identity jsonb;
  observation_reference_value text;
  observation_id_value uuid;
  response_envelope jsonb;
begin
  if advisor is null then raise exception 'CARTERA100_AUTHENTICATION_REQUIRED'; end if;
  if p_payload is null or jsonb_typeof(p_payload) <> 'object' then
    raise exception 'CARTERA100_PAYLOAD_INVALID';
  end if;

  authorization_payload := p_payload -> 'authorization';
  command_payload := p_payload - 'authorization';
  if authorization_payload is null or authorization_payload ->> 'authorized' <> 'true' then
    raise exception 'CARTERA100_EXPLICIT_AUTHORIZATION_REQUIRED';
  end if;
  supplied_digest := authorization_payload ->> 'payloadDigest';
  command_digest_value := public.forge_cartera030b_digest(command_payload);
  if supplied_digest is null or supplied_digest <> command_digest_value then
    raise exception 'CARTERA100_AUTHORIZATION_DIGEST_MISMATCH';
  end if;

  metric_key_value := nullif(upper(btrim(command_payload ->> 'metricKey')), '');
  metric_category_value := nullif(upper(btrim(command_payload ->> 'metricCategory')), '');
  quantity_value := nullif(command_payload ->> 'quantity', '')::numeric;
  unit_value := nullif(upper(btrim(command_payload ->> 'unit')), '');
  currency_value := nullif(upper(btrim(command_payload ->> 'currency')), '');
  metric_state_value := nullif(upper(btrim(command_payload ->> 'metricState')), '');
  source_authority_value := nullif(upper(btrim(command_payload ->> 'sourceAuthority')), '');
  source_record_reference_value := nullif(btrim(command_payload ->> 'sourceRecordReference'), '');
  recommendation_reference_value := nullif(btrim(command_payload ->> 'recommendationReference'), '');
  outcome_reference_value := nullif(btrim(command_payload ->> 'outcomeReference'), '');
  attribution_state_value := coalesce(nullif(upper(btrim(command_payload ->> 'attributionState')), ''), 'NONE');
  usefulness_feedback_value := coalesce(nullif(upper(btrim(command_payload ->> 'usefulnessFeedback')), ''), 'UNSET');
  evidence_references_value := coalesce(command_payload -> 'evidenceReferences', '[]'::jsonb);
  occurred_at_value := nullif(command_payload ->> 'occurredAt', '')::timestamptz;
  idempotency_key_value := nullif(btrim(command_payload ->> 'idempotencyKey'), '');
  metadata_value := coalesce(command_payload -> 'metadata', '{}'::jsonb);

  if metric_key_value is null or metric_category_value is null or quantity_value is null
    or unit_value is null or metric_state_value is null or source_authority_value is null
    or source_record_reference_value is null or occurred_at_value is null
    or idempotency_key_value is null then
    raise exception 'CARTERA100_REQUIRED_INPUT_MISSING';
  end if;

  if source_authority_value !~ '^[A-Z0-9][A-Z0-9._:@/-]{0,119}$'
    or source_record_reference_value !~ '^[A-Za-z0-9][A-Za-z0-9._:@/-]{0,239}$'
    or (recommendation_reference_value is not null and recommendation_reference_value !~ '^[A-Za-z0-9][A-Za-z0-9._:@/-]{0,239}$')
    or (outcome_reference_value is not null and outcome_reference_value !~ '^[A-Za-z0-9][A-Za-z0-9._:@/-]{0,239}$')
    or idempotency_key_value !~ '^[A-Za-z0-9][A-Za-z0-9._:@/-]{0,159}$'
    or not public.forge_cartera100_validate_reference_array(evidence_references_value)
    or jsonb_typeof(metadata_value) <> 'object' or length(metadata_value::text) > 5000 then
    raise exception 'CARTERA100_INPUT_FORMAT_INVALID';
  end if;

  if metadata_value::text ~* '"(advisorScore|productivityScore|humanScore|humanWorth|advisorWorth|advisorRanking|disciplineScore|motivationScore|coachabilityScore|employmentRecommendation|bankAccount|cardNumber|health|medicalInformation|finalMessage)"' then
    raise exception 'CARTERA100_RESTRICTED_METADATA';
  end if;

  select r.* into prior_receipt
  from public.cartera100_productivity_command_receipts r
  where r.advisor_id = advisor and r.idempotency_key = idempotency_key_value;

  if found then
    if prior_receipt.command_digest = command_digest_value then
      return prior_receipt.response_envelope;
    end if;
    return jsonb_build_object(
      'recordingState', 'CONFLICT',
      'reason', 'CHANGED_INPUT_REPLAY',
      'idempotencyKey', idempotency_key_value,
      'humanScoreCreated', false,
      'automaticActionExecuted', false
    );
  end if;

  observation_identity := jsonb_build_object(
    'advisorId', advisor::text,
    'metricKey', metric_key_value,
    'metricCategory', metric_category_value,
    'quantity', quantity_value,
    'unit', unit_value,
    'currency', currency_value,
    'sourceAuthority', source_authority_value,
    'sourceRecordReference', source_record_reference_value,
    'recommendationReference', recommendation_reference_value,
    'outcomeReference', outcome_reference_value,
    'occurredAt', occurred_at_value,
    'evidenceReferences', evidence_references_value
  );
  observation_reference_value := 'PRODUCTIVITY_OBSERVATION:'
    || public.forge_cartera030b_digest(observation_identity);

  insert into public.cartera100_productivity_observations (
    advisor_id, observation_reference, metric_key, metric_category,
    quantity, unit, currency, metric_state, source_authority,
    source_record_reference, recommendation_reference, outcome_reference,
    attribution_state, usefulness_feedback, evidence_references,
    occurred_at, idempotency_key, command_digest, metadata, recorded_by
  ) values (
    advisor, observation_reference_value, metric_key_value, metric_category_value,
    quantity_value, unit_value, currency_value, metric_state_value, source_authority_value,
    source_record_reference_value, recommendation_reference_value, outcome_reference_value,
    attribution_state_value, usefulness_feedback_value, evidence_references_value,
    occurred_at_value, idempotency_key_value, command_digest_value, metadata_value, advisor
  ) returning id into observation_id_value;

  response_envelope := jsonb_build_object(
    'recordingState', 'COMPLETE',
    'observationReference', observation_reference_value,
    'metricKey', metric_key_value,
    'metricCategory', metric_category_value,
    'recommendationReference', recommendation_reference_value,
    'attributionState', attribution_state_value,
    'usefulnessFeedback', usefulness_feedback_value,
    'humanScoreCreated', false,
    'advisorRankingCreated', false,
    'automaticActionExecuted', false,
    'causalCreditClaimed', false
  );

  insert into public.cartera100_productivity_command_receipts (
    advisor_id, idempotency_key, command_digest, observation_id,
    response_envelope, executed_by
  ) values (
    advisor, idempotency_key_value, command_digest_value, observation_id_value,
    response_envelope, advisor
  );

  return response_envelope;
end;
$$;

revoke all on function public.forge_cartera100_record_productivity_observation(jsonb)
  from public, anon;
grant execute on function public.forge_cartera100_record_productivity_observation(jsonb)
  to authenticated;

commit;
