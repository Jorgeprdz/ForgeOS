-- PHASE 017E-R4: optional explicit recommendation-decision lineage on the existing CARTERA 030C PaymentEvent owner.
-- Payment truth/evidence semantics remain unchanged. No backfill, no FK to FES, no parallel ledger.

begin;

alter table public.cartera030c_confirmed_payment_events
  add column recommendation_decision_reference text;

alter table public.cartera030c_confirmed_payment_events
  add constraint cartera030c_recommendation_decision_reference_ck
  check (
    recommendation_decision_reference is null
    or recommendation_decision_reference ~ '^evt_[a-f0-9]{32}$'
  );

comment on column public.cartera030c_confirmed_payment_events.recommendation_decision_reference is
  'Optional canonical SALES_NBA_ADVISOR_RESPONSE event_id explicitly associated with this real payment action. Lineage only; never payment evidence or causality.';

create or replace function public.forge_cartera030c_record_and_reconcile_confirmed_payment(
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
  command_digest text;
  policy_reference_value text;
  evidence_reference_value text;
  payment_amount_value numeric;
  currency_value text;
  payment_date_value date;
  period_start_value date;
  period_end_value date;
  payment_source_value text;
  evidence_references_value jsonb;
  confirmation_state_value text;
  idempotency_key_value text;
  recommendation_decision_reference_requested text;
  recommendation_decision_reference_value text;
  payment_obligation_reference_value text;
  recommendation_lineage_state text := 'NOT_REQUESTED';
  recommendation_lineage_reason text;
  action_occurred_at timestamptz := now();
  decision_row record;
  decision_payload jsonb;
  target_obligation record;
  policy_row record;
  prior_receipt record;
  existing_event record;
  persisted_event record;
  event_identity jsonb;
  event_reference_value text;
  event_digest_value text;
  event_id_value uuid;
  candidate record;
  candidate_id_value uuid;
  candidate_reference_value text;
  candidate_count integer;
  response_envelope jsonb;
  outcome_value text;
  conflict_type_value text;
  conflict_reference_value text;
  reconciliation_reference_value text;
  transition_reference_value text;
  resulting_status text;
  resulting_amount numeric;
  resulting_state_version integer;
  payment_event_refs jsonb;
begin
  if advisor is null then
    raise exception 'CARTERA030C_AUTHENTICATION_REQUIRED';
  end if;
  if p_payload is null or jsonb_typeof(p_payload) <> 'object' then
    raise exception 'CARTERA030C_PAYLOAD_INVALID';
  end if;

  authorization_payload := p_payload -> 'authorization';
  command_payload := p_payload - 'authorization';
  if authorization_payload is null or authorization_payload ->> 'authorized' <> 'true' then
    raise exception 'CARTERA030C_EXPLICIT_AUTHORIZATION_REQUIRED';
  end if;
  supplied_digest := authorization_payload ->> 'payloadDigest';
  command_digest := public.forge_cartera030b_digest(command_payload);
  if supplied_digest is null or supplied_digest <> command_digest then
    raise exception 'CARTERA030C_AUTHORIZATION_DIGEST_MISMATCH';
  end if;

  policy_reference_value := nullif(btrim(command_payload ->> 'policyReference'), '');
  evidence_reference_value := nullif(btrim(command_payload ->> 'paymentEvidenceReference'), '');
  payment_amount_value := nullif(command_payload ->> 'paymentAmount', '')::numeric;
  currency_value := nullif(upper(btrim(command_payload ->> 'currency')), '');
  payment_date_value := nullif(command_payload ->> 'paymentDate', '')::date;
  period_start_value := nullif(command_payload ->> 'periodCoveredStart', '')::date;
  period_end_value := nullif(command_payload ->> 'periodCoveredEnd', '')::date;
  payment_source_value := nullif(btrim(command_payload ->> 'paymentSource'), '');
  evidence_references_value := coalesce(command_payload -> 'evidenceReferences', '[]'::jsonb);
  confirmation_state_value := nullif(upper(btrim(command_payload ->> 'confirmationState')), '');
  idempotency_key_value := nullif(btrim(command_payload ->> 'idempotencyKey'), '');
  recommendation_decision_reference_requested := nullif(btrim(command_payload ->> 'recommendationDecisionReference'), '');
  payment_obligation_reference_value := nullif(btrim(command_payload ->> 'paymentObligationReference'), '');

  if policy_reference_value is null or evidence_reference_value is null
    or payment_amount_value is null or payment_amount_value <= 0
    or payment_date_value is null or payment_source_value is null
    or confirmation_state_value <> 'CONFIRMED' or idempotency_key_value is null then
    raise exception 'CARTERA030C_REQUIRED_CONFIRMED_PAYMENT_INPUT_MISSING';
  end if;
  if currency_value is not null and currency_value !~ '^[A-Z]{3}$' then
    raise exception 'CARTERA030C_CURRENCY_INVALID';
  end if;
  if evidence_references_value is null or jsonb_typeof(evidence_references_value) <> 'array' then
    raise exception 'CARTERA030C_EVIDENCE_REFERENCES_ARRAY_REQUIRED';
  end if;
  if period_start_value is not null and period_end_value is not null and period_start_value > period_end_value then
    raise exception 'CARTERA030C_PERIOD_INVALID';
  end if;
  if payment_source_value not in ('policy_receipt', 'payment_proof', 'bank_proof', 'carrier_statement', 'manual_capture', 'integration') then
    raise exception 'CARTERA030C_PAYMENT_SOURCE_INVALID';
  end if;

  perform pg_advisory_xact_lock(hashtextextended(advisor::text || ':' || idempotency_key_value, 0));

  select r.* into prior_receipt
  from public.cartera030b_command_receipts r
  where r.advisor_id = advisor
    and r.command_type = 'RECONCILE_PAYMENT_EVENT'
    and r.idempotency_key = idempotency_key_value;

  if found then
    if prior_receipt.command_digest = command_digest then
      select e.* into persisted_event
      from public.cartera030c_confirmed_payment_events e
      where e.advisor_id = advisor
        and e.payment_event_reference = prior_receipt.response_envelope ->> 'paymentEventReference'
      limit 1;
      if not found then
        raise exception 'CARTERA030C_PAYMENT_EVENT_READ_AFTER_WRITE_FAILED';
      end if;
      if persisted_event.policy_reference <> policy_reference_value
        or persisted_event.payment_evidence_reference <> evidence_reference_value
        or persisted_event.payment_amount <> payment_amount_value
        or persisted_event.currency is distinct from currency_value
        or persisted_event.payment_date <> payment_date_value
        or persisted_event.period_covered_start is distinct from period_start_value
        or persisted_event.period_covered_end is distinct from period_end_value
        or persisted_event.payment_source <> payment_source_value
        or persisted_event.evidence_references <> evidence_references_value
        or persisted_event.confirmation_state <> 'CONFIRMED' then
        raise exception 'CARTERA030C_PAYMENT_EVENT_READ_AFTER_WRITE_MISMATCH';
      end if;
      return prior_receipt.response_envelope || jsonb_build_object(
        'policyReference', persisted_event.policy_reference,
        'paymentEventReference', persisted_event.payment_event_reference,
        'paymentEvidenceReference', persisted_event.payment_evidence_reference,
        'paymentEventConfirmedAt', persisted_event.confirmed_at,
        'recommendationDecisionReference', persisted_event.recommendation_decision_reference,
        'recommendationLineageState', case
          when persisted_event.recommendation_decision_reference is null then coalesce(prior_receipt.response_envelope ->> 'recommendationLineageState', 'UNLINKED')
          else 'EXPLICIT_LINEAGE'
        end,
        'paymentEventReadAfterWriteVerified', true
      );
    end if;
    conflict_reference_value := 'PAYMENT_EVENT_CONFLICT:' || public.forge_cartera030b_digest(jsonb_build_object(
      'advisorId', advisor::text,
      'idempotencyKey', idempotency_key_value,
      'incomingDigest', command_digest,
      'existingDigest', prior_receipt.command_digest
    ));
    insert into public.cartera030c_payment_event_conflicts (
      advisor_id, conflict_reference, conflict_type, claims,
      incoming_digest, existing_digest, recorded_by
    ) values (
      advisor, conflict_reference_value, 'CHANGED_EVENT_REPLAY',
      jsonb_build_object('idempotencyKey', idempotency_key_value),
      command_digest, prior_receipt.command_digest, advisor
    ) on conflict (advisor_id, conflict_reference) do nothing;
    return jsonb_build_object(
      'reconciliationState', 'CONFLICT',
      'reason', 'CHANGED_EVENT_REPLAY',
      'conflictReference', conflict_reference_value
    );
  end if;

  select p.id, p.policy_reference, p.carrier_reference
  into policy_row
  from public.canonical_policies p
  where p.advisor_id = advisor
    and p.policy_reference = policy_reference_value
    and p.archived_at is null;
  if not found then
    raise exception 'CARTERA030C_POLICY_NOT_FOUND';
  end if;

  -- Optional lineage is validated independently of payment truth. Invalid lineage is omitted, never fabricated.
  if recommendation_decision_reference_requested is not null then
    recommendation_lineage_state := 'UNRESOLVED';
    if recommendation_decision_reference_requested !~ '^evt_[a-f0-9]{32}$' then
      recommendation_lineage_reason := 'DECISION_REFERENCE_INVALID';
    elsif payment_obligation_reference_value is null then
      recommendation_lineage_reason := 'PAYMENT_OBLIGATION_REFERENCE_REQUIRED';
    else
      select l.event_id, l.tenant_id, l.event_type, l.occurred_at, l.canonical_event
      into decision_row
      from public.activity_event_ledger l
      where l.event_id = recommendation_decision_reference_requested
      limit 1;

      if not found then
        recommendation_lineage_reason := 'DECISION_REFERENCE_NOT_FOUND';
      elsif decision_row.tenant_id <> advisor then
        recommendation_lineage_reason := 'CROSS_ADVISOR_DECISION_REFERENCE';
      elsif decision_row.event_type <> 'SALES_NBA_ADVISOR_RESPONSE'
        or decision_row.canonical_event ->> 'event_type' <> 'SALES_NBA_ADVISOR_RESPONSE' then
        recommendation_lineage_reason := 'DECISION_EVENT_TYPE_INCOMPATIBLE';
      elsif decision_row.occurred_at > action_occurred_at then
        recommendation_lineage_reason := 'DECISION_AFTER_ACTION';
      else
        decision_payload := decision_row.canonical_event -> 'payload';
        if decision_payload ->> 'advisor_reference' <> advisor::text then
          recommendation_lineage_reason := 'DECISION_ADVISOR_INCOMPATIBLE';
        elsif decision_payload ->> 'decision' <> 'ACCEPTED' then
          recommendation_lineage_reason := 'DECISION_NOT_ACCEPTED';
        elsif decision_payload ->> 'recommendation_action_addressable' <> 'true' then
          recommendation_lineage_reason := 'RECOMMENDATION_NOT_ACTION_ADDRESSABLE';
        elsif nullif(decision_payload ->> 'recommendation_reference', '') is null
          or decision_payload ->> 'signal_reference' <> decision_payload ->> 'recommendation_reference' then
          recommendation_lineage_reason := 'RECOMMENDATION_IDENTITY_INCOMPATIBLE';
        elsif decision_payload ->> 'policy_reference' <> policy_reference_value then
          recommendation_lineage_reason := 'POLICY_IDENTITY_INCOMPATIBLE';
        elsif decision_payload ->> 'payment_obligation_reference' <> payment_obligation_reference_value then
          recommendation_lineage_reason := 'PAYMENT_OBLIGATION_IDENTITY_INCOMPATIBLE';
        elsif decision_payload ->> 'action_owner' <> 'CARTERA_030C' then
          recommendation_lineage_reason := 'ACTION_OWNER_INCOMPATIBLE';
        elsif decision_payload ->> 'action_target_type' <> 'PAYMENT_OBLIGATION'
          or decision_payload ->> 'action_target_reference' <> payment_obligation_reference_value then
          recommendation_lineage_reason := 'ACTION_TARGET_INCOMPATIBLE';
        elsif decision_payload ->> 'expected_action' <> 'CONFIRM_PAYMENT' then
          recommendation_lineage_reason := 'EXPECTED_ACTION_INCOMPATIBLE';
        else
          select o.id, o.obligation_reference, o.expected_date
          into target_obligation
          from public.cartera030b_expected_payment_obligations o
          where o.advisor_id = advisor
            and o.policy_id = policy_row.id
            and o.obligation_reference = payment_obligation_reference_value
            and o.status not in ('CORRECTED', 'CANCELLED')
          limit 1;

          if not found then
            recommendation_lineage_reason := 'PAYMENT_OBLIGATION_NOT_FOUND';
          elsif not (
            target_obligation.expected_date = payment_date_value
            or (
              period_start_value is not null and period_end_value is not null
              and target_obligation.expected_date between period_start_value and period_end_value
            )
          ) then
            recommendation_lineage_reason := 'PAYMENT_OBLIGATION_ACTION_INCOMPATIBLE';
          else
            recommendation_decision_reference_value := recommendation_decision_reference_requested;
            recommendation_lineage_state := 'EXPLICIT_LINEAGE';
            recommendation_lineage_reason := null;
          end if;
        end if;
      end if;
    end if;
  end if;

  event_identity := jsonb_build_object(
    'advisorId', advisor::text,
    'policyReference', policy_reference_value,
    'paymentEvidenceReference', evidence_reference_value,
    'paymentAmount', payment_amount_value,
    'currency', currency_value,
    'paymentDate', payment_date_value::text,
    'periodCoveredStart', period_start_value::text,
    'periodCoveredEnd', period_end_value::text,
    'paymentSource', payment_source_value
  );
  event_digest_value := public.forge_cartera030b_digest(event_identity);
  event_reference_value := 'PAYMENT_EVENT:' || event_digest_value;

  select e.* into existing_event
  from public.cartera030c_confirmed_payment_events e
  where e.advisor_id = advisor
    and (e.payment_event_reference = event_reference_value
      or e.payment_evidence_reference = evidence_reference_value);

  if found then
    if existing_event.event_digest <> event_digest_value then
      conflict_reference_value := 'PAYMENT_EVENT_CONFLICT:' || public.forge_cartera030b_digest(jsonb_build_object(
        'advisorId', advisor::text,
        'paymentEvidenceReference', evidence_reference_value,
        'incomingDigest', event_digest_value,
        'existingDigest', existing_event.event_digest
      ));
      insert into public.cartera030c_payment_event_conflicts (
        advisor_id, conflict_reference, payment_event_id, conflict_type,
        claims, incoming_digest, existing_digest, recorded_by
      ) values (
        advisor, conflict_reference_value, existing_event.id,
        'PAYMENT_EVENT_IDENTITY_COLLISION',
        jsonb_build_object('paymentEvidenceReference', evidence_reference_value),
        event_digest_value, existing_event.event_digest, advisor
      ) on conflict (advisor_id, conflict_reference) do nothing;
      return jsonb_build_object(
        'reconciliationState', 'CONFLICT',
        'reason', 'PAYMENT_EVENT_IDENTITY_COLLISION',
        'policyReference', existing_event.policy_reference,
        'paymentEventReference', existing_event.payment_event_reference,
        'paymentEvidenceReference', existing_event.payment_evidence_reference,
        'paymentEventConfirmedAt', existing_event.confirmed_at,
        'paymentEventReadAfterWriteVerified', true,
        'recommendationDecisionReference', existing_event.recommendation_decision_reference,
        'recommendationLineageState', case when existing_event.recommendation_decision_reference is null then 'UNLINKED' else 'EXPLICIT_LINEAGE' end,
        'conflictReference', conflict_reference_value
      );
    end if;

    select r.* into prior_receipt
    from public.cartera030b_command_receipts r
    where r.advisor_id = advisor
      and r.command_type = 'RECONCILE_PAYMENT_EVENT'
      and r.response_envelope ->> 'paymentEventReference' = existing_event.payment_event_reference
    order by r.executed_at
    limit 1;
    if found then
      response_envelope := prior_receipt.response_envelope
        || jsonb_build_object(
          'policyReference', existing_event.policy_reference,
          'paymentEventReference', existing_event.payment_event_reference,
          'paymentEvidenceReference', existing_event.payment_evidence_reference,
          'paymentEventConfirmedAt', existing_event.confirmed_at,
          'paymentEventReadAfterWriteVerified', true,
          'recommendationDecisionReference', existing_event.recommendation_decision_reference,
          'recommendationLineageState', case when existing_event.recommendation_decision_reference is null then 'UNLINKED' else 'EXPLICIT_LINEAGE' end,
          'recommendationLineageReason', case
            when existing_event.recommendation_decision_reference is null and recommendation_decision_reference_requested is not null
              then 'HISTORICAL_OR_ALREADY_WRITTEN_ACTION_NOT_RETROACTIVELY_LINKED'
            else null
          end
        );
      insert into public.cartera030b_command_receipts (
        advisor_id, command_type, idempotency_key, command_digest,
        response_envelope, executed_by
      ) values (
        advisor, 'RECONCILE_PAYMENT_EVENT', idempotency_key_value,
        command_digest, response_envelope, advisor
      );
      return response_envelope;
    end if;
  else
    insert into public.cartera030c_confirmed_payment_events (
      advisor_id, payment_event_reference, policy_id, policy_reference,
      payment_evidence_reference, carrier_reference, payment_amount, currency,
      payment_date, period_covered_start, period_covered_end, payment_source,
      evidence_references, confirmation_state, event_digest, idempotency_key,
      confirmed_by, confirmed_at, recommendation_decision_reference
    ) values (
      advisor, event_reference_value, policy_row.id, policy_reference_value,
      evidence_reference_value, policy_row.carrier_reference, payment_amount_value,
      currency_value, payment_date_value, period_start_value, period_end_value,
      payment_source_value, evidence_references_value, 'CONFIRMED', event_digest_value,
      idempotency_key_value, advisor, action_occurred_at, recommendation_decision_reference_value
    ) returning id into event_id_value;
  end if;

  if event_id_value is null then
    event_id_value := existing_event.id;
    recommendation_decision_reference_value := existing_event.recommendation_decision_reference;
    recommendation_lineage_state := case
      when existing_event.recommendation_decision_reference is null then 'UNLINKED'
      else 'EXPLICIT_LINEAGE'
    end;
    if recommendation_decision_reference_value is null and recommendation_decision_reference_requested is not null then
      recommendation_lineage_reason := 'HISTORICAL_OR_ALREADY_WRITTEN_ACTION_NOT_RETROACTIVELY_LINKED';
    end if;
  end if;

  -- Real read-after-write: re-read the existing PaymentEvent authority and verify payment identity/evidence and optional lineage.
  select e.* into persisted_event
  from public.cartera030c_confirmed_payment_events e
  where e.id = event_id_value
    and e.advisor_id = advisor
  limit 1;
  if not found then
    raise exception 'CARTERA030C_PAYMENT_EVENT_READ_AFTER_WRITE_FAILED';
  end if;
  if persisted_event.payment_event_reference <> event_reference_value
    or persisted_event.policy_reference <> policy_reference_value
    or persisted_event.payment_evidence_reference <> evidence_reference_value
    or persisted_event.payment_amount <> payment_amount_value
    or persisted_event.currency is distinct from currency_value
    or persisted_event.payment_date <> payment_date_value
    or persisted_event.period_covered_start is distinct from period_start_value
    or persisted_event.period_covered_end is distinct from period_end_value
    or persisted_event.payment_source <> payment_source_value
    or persisted_event.evidence_references <> evidence_references_value
    or persisted_event.confirmation_state <> 'CONFIRMED'
    or persisted_event.event_digest <> event_digest_value
    or persisted_event.recommendation_decision_reference is distinct from recommendation_decision_reference_value then
    raise exception 'CARTERA030C_PAYMENT_EVENT_READ_AFTER_WRITE_MISMATCH';
  end if;
  recommendation_decision_reference_value := persisted_event.recommendation_decision_reference;

  select count(*) into candidate_count
  from public.cartera030b_expected_payment_obligations o
  where o.advisor_id = advisor
    and o.policy_id = policy_row.id
    and o.status not in ('CORRECTED', 'CANCELLED')
    and (
      o.expected_date = payment_date_value
      or (
        period_start_value is not null and period_end_value is not null
        and o.expected_date between period_start_value and period_end_value
      )
    );

  if candidate_count = 1 then
    select o.* into candidate
    from public.cartera030b_expected_payment_obligations o
    where o.advisor_id = advisor
      and o.policy_id = policy_row.id
      and o.status not in ('CORRECTED', 'CANCELLED')
      and (
        o.expected_date = payment_date_value
        or (
          period_start_value is not null and period_end_value is not null
          and o.expected_date between period_start_value and period_end_value
        )
      )
    for update;
    candidate_id_value := candidate.id;
    candidate_reference_value := candidate.obligation_reference;
  end if;

  if candidate_count = 0 then
    outcome_value := 'NO_MATCH';
    conflict_type_value := 'NO_OBLIGATION_MATCH';
  elsif candidate_count > 1 then
    outcome_value := 'AMBIGUOUS';
    conflict_type_value := 'AMBIGUOUS_OBLIGATION_MATCH';
  elsif candidate.currency is not null and currency_value is not null and candidate.currency <> currency_value then
    outcome_value := 'CONFLICT';
    conflict_type_value := 'CURRENCY_MISMATCH';
  else
    resulting_amount := coalesce(candidate.actual_amount, 0) + payment_amount_value;
    if candidate.expected_amount is not null and resulting_amount > candidate.expected_amount then
      outcome_value := 'CONFLICT';
      conflict_type_value := 'PAYMENT_AMOUNT_EXCEEDS_OBLIGATION';
    elsif candidate.expected_amount is not null and resulting_amount < candidate.expected_amount then
      outcome_value := 'PARTIAL_MATCH';
      resulting_status := 'PARTIAL';
    else
      outcome_value := 'MATCHED';
      resulting_status := 'CONFIRMED';
    end if;
  end if;

  if conflict_type_value is not null then
    conflict_reference_value := 'PAYMENT_EVENT_CONFLICT:' || public.forge_cartera030b_digest(jsonb_build_object(
      'advisorId', advisor::text,
      'paymentEventReference', event_reference_value,
      'conflictType', conflict_type_value,
      'obligationReference', candidate_reference_value
    ));
    insert into public.cartera030c_payment_event_conflicts (
      advisor_id, conflict_reference, payment_event_id, obligation_id,
      conflict_type, claims, incoming_digest, recorded_by
    ) values (
      advisor, conflict_reference_value, event_id_value, candidate_id_value,
      conflict_type_value,
      jsonb_build_object(
        'paymentEventReference', event_reference_value,
        'policyReference', policy_reference_value,
        'candidateCount', candidate_count,
        'obligationReference', candidate_reference_value
      ),
      command_digest, advisor
    ) on conflict (advisor_id, conflict_reference) do nothing;
  end if;

  if outcome_value in ('MATCHED', 'PARTIAL_MATCH') then
    payment_event_refs := case
      when candidate.matched_payment_event_references @> jsonb_build_array(event_reference_value)
        then candidate.matched_payment_event_references
      else candidate.matched_payment_event_references || jsonb_build_array(event_reference_value)
    end;
    resulting_state_version := candidate.state_version + 1;

    update public.cartera030b_expected_payment_obligations
    set status = resulting_status,
        matched_payment_event_references = payment_event_refs,
        actual_date = payment_date_value,
        actual_amount = resulting_amount,
        confirmation_state = 'PAYMENT_CONFIRMED',
        state_version = resulting_state_version
    where id = candidate.id
      and advisor_id = advisor
      and state_version = candidate.state_version;
    if not found then
      raise exception 'CARTERA030C_STALE_STATE_VERSION';
    end if;

    transition_reference_value := 'OBLIGATION_TRANSITION:' || public.forge_cartera030b_digest(jsonb_build_object(
      'obligationReference', candidate_reference_value,
      'paymentEventReference', event_reference_value,
      'resultingStateVersion', resulting_state_version
    ));
    insert into public.cartera030b_obligation_transitions (
      advisor_id, transition_reference, obligation_id, from_status, to_status,
      expected_state_version, resulting_state_version, reason_code,
      actor_reference, evidence_references, payment_event_reference,
      transition_digest, idempotency_key, created_by
    ) values (
      advisor, transition_reference_value, candidate.id, candidate.status,
      resulting_status, candidate.state_version, resulting_state_version,
      outcome_value, advisor::text, evidence_references_value,
      event_reference_value,
      public.forge_cartera030b_digest(jsonb_build_object(
        'transitionReference', transition_reference_value,
        'outcome', outcome_value
      )),
      idempotency_key_value || ':transition', advisor
    );
  end if;

  reconciliation_reference_value := 'PAYMENT_RECONCILIATION:' || public.forge_cartera030b_digest(jsonb_build_object(
    'paymentEventReference', event_reference_value,
    'obligationReference', candidate_reference_value,
    'outcome', outcome_value
  ));
  insert into public.cartera030b_payment_reconciliations (
    advisor_id, reconciliation_reference, obligation_id,
    payment_event_reference, outcome, payment_date, payment_amount,
    currency, evidence_references, reconciliation_digest,
    idempotency_key, recorded_by
  ) values (
    advisor, reconciliation_reference_value, candidate_id_value,
    event_reference_value, outcome_value, payment_date_value,
    payment_amount_value, currency_value, evidence_references_value,
    public.forge_cartera030b_digest(jsonb_build_object(
      'reconciliationReference', reconciliation_reference_value,
      'outcome', outcome_value
    )),
    idempotency_key_value, advisor
  );

  response_envelope := jsonb_build_object(
    'reconciliationState', case when outcome_value in ('MATCHED', 'PARTIAL_MATCH') then 'COMPLETE' else 'REVIEW_REQUIRED' end,
    'outcome', outcome_value,
    'reason', conflict_type_value,
    'policyReference', persisted_event.policy_reference,
    'paymentEventReference', persisted_event.payment_event_reference,
    'paymentEvidenceReference', persisted_event.payment_evidence_reference,
    'paymentEventConfirmedAt', persisted_event.confirmed_at,
    'paymentEventReadAfterWriteVerified', true,
    'obligationReference', candidate_reference_value,
    'recommendationActionTargetReference', case
      when persisted_event.recommendation_decision_reference is null then null
      else payment_obligation_reference_value
    end,
    'conflictReference', conflict_reference_value,
    'resultingStatus', resulting_status,
    'resultingActualAmount', resulting_amount,
    'recommendationDecisionReference', persisted_event.recommendation_decision_reference,
    'recommendationLineageState', recommendation_lineage_state,
    'recommendationLineageReason', recommendation_lineage_reason
  );

  insert into public.cartera030b_command_receipts (
    advisor_id, command_type, idempotency_key, command_digest,
    response_envelope, executed_by
  ) values (
    advisor, 'RECONCILE_PAYMENT_EVENT', idempotency_key_value,
    command_digest, response_envelope, advisor
  );

  return response_envelope;
end;
$$;

revoke all on function public.forge_cartera030c_record_and_reconcile_confirmed_payment(jsonb) from public, anon;
grant execute on function public.forge_cartera030c_record_and_reconcile_confirmed_payment(jsonb) to authenticated;

comment on function public.forge_cartera030c_record_and_reconcile_confirmed_payment(jsonb) is
  'Persists confirmed PaymentEvent truth, re-reads that persisted action, and reconciles exactly one expected obligation when deterministic. Optionally retains validated ACCEPTED recommendation-decision lineage; never treats it as payment evidence or causality.';

commit;
