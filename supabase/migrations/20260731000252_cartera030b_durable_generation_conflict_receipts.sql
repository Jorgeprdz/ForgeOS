-- CARTERA 030B durable generation conflict receipt hardening.
-- Additive replacement of the deployed 00251 generation RPC.

begin;

create or replace function public.forge_cartera030b_generate_expected_obligations(
  p_payload jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = public, auth, pg_temp
as $$
#variable_conflict use_variable
declare
  advisor uuid := auth.uid();
  command_payload jsonb;
  authorization_payload jsonb;
  supplied_digest text;
  command_digest text;
  policy_reference_value text;
  policy_version_reference_value text;
  horizon_date date;
  timezone_value text;
  amount_semantics text;
  schedule_rule_reference_value text;
  source_evidence_references_value jsonb;
  idempotency_key_value text;
  policy_row record;
  prior_receipt record;
  response_envelope jsonb;
  frequency_value text;
  interval_months integer;
  occurrence_index integer := 0;
  sequence_value integer;
  expected_date_value date;
  expected_amount_value numeric;
  policy_year_value integer;
  obligation_reference_value text;
  obligation_identity jsonb;
  occurrences jsonb := '[]'::jsonb;
  occurrence jsonb;
  inserted_obligation_id uuid;
  existing_obligation record;
  obligation_references jsonb := '[]'::jsonb;
  transition_reference_value text;
  transition_identity jsonb;
  conflict_reference_value text;
  conflict_claims jsonb;
  max_occurrences constant integer := 600;
begin
  if advisor is null then
    raise exception 'CARTERA030B_AUTHENTICATION_REQUIRED';
  end if;
  if p_payload is null or jsonb_typeof(p_payload) <> 'object' then
    raise exception 'CARTERA030B_PAYLOAD_INVALID';
  end if;

  authorization_payload := p_payload -> 'authorization';
  command_payload := p_payload - 'authorization';
  if authorization_payload is null
    or authorization_payload ->> 'authorized' <> 'true' then
    raise exception 'CARTERA030B_EXPLICIT_AUTHORIZATION_REQUIRED';
  end if;

  supplied_digest := authorization_payload ->> 'payloadDigest';
  command_digest := public.forge_cartera030b_digest(command_payload);
  if supplied_digest is null or supplied_digest <> command_digest then
    raise exception 'CARTERA030B_AUTHORIZATION_DIGEST_MISMATCH';
  end if;

  policy_reference_value := nullif(btrim(command_payload ->> 'policyReference'), '');
  policy_version_reference_value := nullif(btrim(command_payload ->> 'policyVersionReference'), '');
  horizon_date := nullif(command_payload ->> 'generationHorizonDate', '')::date;
  timezone_value := nullif(btrim(command_payload ->> 'timezone'), '');
  amount_semantics := coalesce(nullif(command_payload ->> 'amountSemantics', ''), 'UNKNOWN');
  schedule_rule_reference_value := nullif(btrim(command_payload ->> 'scheduleRuleReference'), '');
  source_evidence_references_value := coalesce(command_payload -> 'sourceEvidenceReferences', '[]'::jsonb);
  idempotency_key_value := nullif(btrim(command_payload ->> 'idempotencyKey'), '');

  if policy_reference_value is null
    or policy_version_reference_value is null
    or horizon_date is null
    or timezone_value is null
    or idempotency_key_value is null then
    raise exception 'CARTERA030B_REQUIRED_INPUT_MISSING';
  end if;
  if source_evidence_references_value is null
    or jsonb_typeof(source_evidence_references_value) <> 'array' then
    raise exception 'CARTERA030B_SOURCE_EVIDENCE_ARRAY_REQUIRED';
  end if;
  if amount_semantics not in ('UNKNOWN', 'PER_OCCURRENCE') then
    raise exception 'CARTERA030B_AMOUNT_SEMANTICS_INVALID';
  end if;
  if amount_semantics = 'PER_OCCURRENCE' and schedule_rule_reference_value is null then
    raise exception 'CARTERA030B_AMOUNT_RULE_REFERENCE_REQUIRED';
  end if;

  -- Serialize all governed generation commands for one advisor and PolicyVersion.
  perform pg_advisory_xact_lock(
    hashtextextended(advisor::text || ':' || policy_version_reference_value, 0)
  );

  select r.*
  into prior_receipt
  from public.cartera030b_command_receipts r
  where r.advisor_id = advisor
    and r.command_type = 'GENERATE_EXPECTED_OBLIGATIONS'
    and r.idempotency_key = idempotency_key_value;

  if found then
    if prior_receipt.command_digest = command_digest then
      return prior_receipt.response_envelope;
    end if;

    conflict_reference_value := 'OBLIGATION_CONFLICT:'
      || public.forge_cartera030b_digest(jsonb_build_object(
        'advisorId', advisor,
        'idempotencyKey', idempotency_key_value,
        'incomingDigest', command_digest,
        'existingDigest', prior_receipt.command_digest
      ));

    insert into public.cartera030b_obligation_conflicts (
      advisor_id,
      conflict_reference,
      conflict_type,
      conflict_state,
      claims,
      incoming_digest,
      existing_digest,
      evidence_references,
      recorded_by
    ) values (
      advisor,
      conflict_reference_value,
      'CHANGED_INPUT_REPLAY',
      'OPEN',
      jsonb_build_object('idempotencyKey', idempotency_key_value),
      command_digest,
      prior_receipt.command_digest,
      source_evidence_references_value,
      advisor
    )
    on conflict (advisor_id, conflict_reference) do nothing;

    return jsonb_build_object(
      'generationState', 'CONFLICT',
      'reason', 'CHANGED_INPUT_REPLAY',
      'conflictReference', conflict_reference_value,
      'obligationReferences', '[]'::jsonb,
      'warnings', jsonb_build_array('Existing idempotency key is bound to different input.')
    );
  end if;

  select
    p.id as policy_id,
    v.id as policy_version_id,
    p.policy_reference,
    v.policy_version_reference,
    v.facts_digest as policy_terms_digest,
    p.effective_from::date as anchor_date,
    p.effective_to::date as coverage_end_date,
    p.payment_frequency,
    p.premium_amount,
    p.currency,
    p.current_version,
    v.version_number
  into policy_row
  from public.canonical_policies p
  join public.policy_versions v
    on v.policy_id = p.id
   and v.advisor_id = p.advisor_id
  where p.advisor_id = advisor
    and p.policy_reference = policy_reference_value
    and v.policy_version_reference = policy_version_reference_value
    and p.archived_at is null;

  if not found then
    raise exception 'CARTERA030B_POLICY_VERSION_NOT_FOUND';
  end if;
  if policy_row.current_version <> policy_row.version_number then
    raise exception 'CARTERA030B_CURRENT_POLICY_VERSION_REQUIRED';
  end if;

  frequency_value := policy_row.payment_frequency;
  if policy_row.anchor_date is null then
    response_envelope := jsonb_build_object(
      'generationState', 'BLOCKED',
      'reason', 'UNKNOWN_ANCHOR_DATE',
      'obligationReferences', '[]'::jsonb,
      'warnings', jsonb_build_array('No due dates were guessed.')
    );
  elsif frequency_value is null or frequency_value = 'OTHER' then
    response_envelope := jsonb_build_object(
      'generationState', 'BLOCKED',
      'reason', 'UNKNOWN_PAYMENT_FREQUENCY',
      'obligationReferences', '[]'::jsonb,
      'warnings', jsonb_build_array('No recurrence was guessed.')
    );
  else
    interval_months := case frequency_value
      when 'MONTHLY' then 1
      when 'QUARTERLY' then 3
      when 'SEMIANNUAL' then 6
      when 'ANNUAL' then 12
      when 'SINGLE' then 0
      else null
    end;
    if interval_months is null then
      raise exception 'CARTERA030B_UNSUPPORTED_PAYMENT_FREQUENCY';
    end if;

    expected_amount_value := case
      when amount_semantics = 'PER_OCCURRENCE' then policy_row.premium_amount
      else null
    end;

    -- Build the complete deterministic batch before writing any ledger row.
    loop
      expected_date_value := case
        when frequency_value = 'SINGLE' then policy_row.anchor_date
        else public.forge_cartera030b_add_months_clamped(
          policy_row.anchor_date,
          occurrence_index * interval_months
        )
      end;

      exit when expected_date_value > horizon_date;
      exit when policy_row.coverage_end_date is not null
        and expected_date_value > policy_row.coverage_end_date;
      if occurrence_index >= max_occurrences then
        raise exception 'CARTERA030B_MAX_OCCURRENCES_EXCEEDED';
      end if;

      sequence_value := occurrence_index + 1;
      policy_year_value := greatest(
        1,
        extract(year from age(expected_date_value, policy_row.anchor_date))::integer + 1
      );
      obligation_identity := jsonb_build_object(
        'advisorId', advisor::text,
        'policyReference', policy_row.policy_reference,
        'policyVersionReference', policy_row.policy_version_reference,
        'policyTermsDigest', policy_row.policy_terms_digest,
        'obligationKind', 'PREMIUM_PAYMENT',
        'expectedDate', expected_date_value::text,
        'sequenceNumber', sequence_value,
        'paymentFrequency', frequency_value,
        'scheduleRuleReference', schedule_rule_reference_value
      );
      obligation_reference_value := 'PAYMENT_OBLIGATION:'
        || public.forge_cartera030b_digest(obligation_identity);

      occurrences := occurrences || jsonb_build_array(jsonb_build_object(
        'obligationReference', obligation_reference_value,
        'identity', obligation_identity,
        'expectedDate', expected_date_value,
        'sequenceNumber', sequence_value,
        'policyYear', policy_year_value
      ));

      exit when frequency_value = 'SINGLE';
      occurrence_index := occurrence_index + 1;
    end loop;

    -- Preflight the whole batch. A conflict is persisted before any new row is created.
    for occurrence in
      select value from jsonb_array_elements(occurrences)
    loop
      obligation_reference_value := occurrence ->> 'obligationReference';
      expected_date_value := (occurrence ->> 'expectedDate')::date;
      sequence_value := (occurrence ->> 'sequenceNumber')::integer;
      obligation_identity := occurrence -> 'identity';

      select o.*
      into existing_obligation
      from public.cartera030b_expected_payment_obligations o
      where o.advisor_id = advisor
        and o.obligation_reference = obligation_reference_value;

      if found and (
        existing_obligation.policy_version_id <> policy_row.policy_version_id
        or existing_obligation.policy_terms_digest <> policy_row.policy_terms_digest
        or existing_obligation.expected_date <> expected_date_value
        or existing_obligation.sequence_number <> sequence_value
        or existing_obligation.payment_frequency <> frequency_value
        or existing_obligation.expected_amount is distinct from expected_amount_value
        or existing_obligation.currency is distinct from policy_row.currency
        or existing_obligation.timezone <> timezone_value
        or existing_obligation.date_authority <> 'CONFIRMED_POLICY_TERMS_DERIVED'
        or existing_obligation.schedule_rule_reference is distinct from schedule_rule_reference_value
      ) then
        conflict_claims := obligation_identity || jsonb_build_object(
          'existingObligationReference', existing_obligation.obligation_reference,
          'existingPolicyTermsDigest', existing_obligation.policy_terms_digest,
          'existingGenerationDigest', existing_obligation.generation_digest
        );
        conflict_reference_value := 'OBLIGATION_CONFLICT:'
          || public.forge_cartera030b_digest(jsonb_build_object(
            'obligationReference', obligation_reference_value,
            'incomingDigest', command_digest,
            'existingDigest', existing_obligation.generation_digest
          ));

        insert into public.cartera030b_obligation_conflicts (
          advisor_id,
          conflict_reference,
          obligation_id,
          conflict_type,
          conflict_state,
          claims,
          incoming_digest,
          existing_digest,
          evidence_references,
          recorded_by
        ) values (
          advisor,
          conflict_reference_value,
          existing_obligation.id,
          'OBLIGATION_IDENTITY_COLLISION',
          'OPEN',
          conflict_claims,
          command_digest,
          existing_obligation.generation_digest,
          source_evidence_references_value,
          advisor
        )
        on conflict (advisor_id, conflict_reference) do nothing;

        response_envelope := jsonb_build_object(
          'generationState', 'CONFLICT',
          'reason', 'OBLIGATION_IDENTITY_COLLISION',
          'conflictReference', conflict_reference_value,
          'obligationReferences', '[]'::jsonb,
          'warnings', jsonb_build_array('A stable obligation reference is already bound to different persisted semantics.')
        );

        insert into public.cartera030b_command_receipts (
          advisor_id,
          command_type,
          idempotency_key,
          command_digest,
          response_envelope,
          executed_by
        ) values (
          advisor,
          'GENERATE_EXPECTED_OBLIGATIONS',
          idempotency_key_value,
          command_digest,
          response_envelope,
          advisor
        );

        return response_envelope;
      end if;
    end loop;

    -- Persist only after the complete batch has passed preflight.
    for occurrence in
      select value from jsonb_array_elements(occurrences)
    loop
      obligation_reference_value := occurrence ->> 'obligationReference';
      obligation_identity := occurrence -> 'identity';
      expected_date_value := (occurrence ->> 'expectedDate')::date;
      sequence_value := (occurrence ->> 'sequenceNumber')::integer;
      policy_year_value := (occurrence ->> 'policyYear')::integer;

      inserted_obligation_id := null;
      insert into public.cartera030b_expected_payment_obligations (
        advisor_id,
        obligation_reference,
        policy_id,
        policy_version_id,
        policy_reference,
        policy_version_reference,
        policy_terms_digest,
        obligation_kind,
        expected_date,
        expected_amount,
        currency,
        payment_frequency,
        policy_year,
        sequence_number,
        status,
        schedule_rule_reference,
        source_evidence_references,
        confirmation_state,
        timezone,
        date_authority,
        generation_idempotency_key,
        generation_digest,
        created_by
      ) values (
        advisor,
        obligation_reference_value,
        policy_row.policy_id,
        policy_row.policy_version_id,
        policy_row.policy_reference,
        policy_row.policy_version_reference,
        policy_row.policy_terms_digest,
        'PREMIUM_PAYMENT',
        expected_date_value,
        expected_amount_value,
        policy_row.currency,
        frequency_value,
        policy_year_value,
        sequence_value,
        'SCHEDULED',
        schedule_rule_reference_value,
        source_evidence_references_value,
        'SCHEDULE_DERIVED',
        timezone_value,
        'CONFIRMED_POLICY_TERMS_DERIVED',
        idempotency_key_value,
        command_digest,
        advisor
      )
      on conflict (advisor_id, obligation_reference) do nothing
      returning id into inserted_obligation_id;

      if inserted_obligation_id is not null then
        transition_identity := jsonb_build_object(
          'obligationReference', obligation_reference_value,
          'fromStatus', null,
          'toStatus', 'SCHEDULED',
          'reasonCode', 'GENERATED_FROM_CONFIRMED_POLICY_TERMS'
        );
        transition_reference_value := 'OBLIGATION_TRANSITION:'
          || public.forge_cartera030b_digest(transition_identity);

        insert into public.cartera030b_obligation_transitions (
          advisor_id,
          transition_reference,
          obligation_id,
          from_status,
          to_status,
          expected_state_version,
          resulting_state_version,
          reason_code,
          actor_reference,
          evidence_references,
          transition_digest,
          idempotency_key,
          created_by
        ) values (
          advisor,
          transition_reference_value,
          inserted_obligation_id,
          null,
          'SCHEDULED',
          null,
          1,
          'GENERATED_FROM_CONFIRMED_POLICY_TERMS',
          advisor::text,
          source_evidence_references_value,
          public.forge_cartera030b_digest(transition_identity),
          idempotency_key_value || ':' || sequence_value::text,
          advisor
        );
      end if;

      obligation_references := obligation_references
        || jsonb_build_array(obligation_reference_value);
    end loop;

    response_envelope := jsonb_build_object(
      'generationState', 'COMPLETE',
      'reason', null,
      'policyReference', policy_row.policy_reference,
      'policyVersionReference', policy_row.policy_version_reference,
      'policyTermsDigest', policy_row.policy_terms_digest,
      'obligationReferences', obligation_references,
      'warnings', case
        when policy_row.premium_amount is not null and amount_semantics <> 'PER_OCCURRENCE'
          then jsonb_build_array('PREMIUM_AMOUNT_SEMANTICS_UNKNOWN')
        else '[]'::jsonb
      end
    );
  end if;

  insert into public.cartera030b_command_receipts (
    advisor_id,
    command_type,
    idempotency_key,
    command_digest,
    response_envelope,
    executed_by
  ) values (
    advisor,
    'GENERATE_EXPECTED_OBLIGATIONS',
    idempotency_key_value,
    command_digest,
    response_envelope,
    advisor
  );

  return response_envelope;
end;
$$;

revoke all on function public.forge_cartera030b_generate_expected_obligations(jsonb)
  from public, anon;
grant execute on function public.forge_cartera030b_generate_expected_obligations(jsonb)
  to authenticated;

commit;
