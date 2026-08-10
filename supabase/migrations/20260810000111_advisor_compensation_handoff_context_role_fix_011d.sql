-- FORGE ADVISOR COMPENSATION 011D
-- Forward-only correction for canonical PolicyRole priority in handoff context.
-- No economic formula or payment authority is introduced.
-- REMOTE_APPLY=NOT_AUTHORIZED by phase gate.

begin;

create or replace function public.forge_advisor_compensation_handoff_context_011d(
  p_payment_event_reference text
)
returns jsonb
language plpgsql
stable
security definer
set search_path = public, pg_temp
as $$
declare
  actor_id uuid;
  requested_reference text;
  result_payload jsonb;
begin
  actor_id := auth.uid();
  if actor_id is null then
    raise exception 'ADVISOR_COMPENSATION_011D_AUTH_REQUIRED';
  end if;

  requested_reference := nullif(btrim(p_payment_event_reference), '');
  if requested_reference is null
     or requested_reference !~ '^[A-Za-z0-9][A-Za-z0-9._:@/-]{0,239}$' then
    raise exception 'ADVISOR_COMPENSATION_011D_PAYMENT_REFERENCE_INVALID';
  end if;

  select jsonb_build_object(
    'state', 'ACCEPTED',
    'advisorId', e.advisor_id::text,
    'paymentEventReference', e.payment_event_reference,
    'payment', jsonb_build_object(
      'confirmationState', e.confirmation_state,
      'paymentEvidenceReference', e.payment_evidence_reference,
      'paymentAmount', e.payment_amount,
      'currency', e.currency,
      'paymentDate', e.payment_date,
      'periodCoveredStart', e.period_covered_start,
      'periodCoveredEnd', e.period_covered_end,
      'paymentSource', e.payment_source,
      'evidenceReferences', e.evidence_references,
      'eventDigest', e.event_digest,
      'idempotencyKey', e.idempotency_key,
      'confirmedBy', e.confirmed_by::text,
      'confirmedAt', e.confirmed_at
    ),
    'canonicalConfirmationReceipt', jsonb_build_object(
      'decisionId', 'CARTERA030C:' || e.payment_event_reference,
      'actorId', e.confirmed_by::text,
      'decidedAt', e.confirmed_at,
      'reason', 'canonical_cartera030c_confirmed_payment',
      'evidenceHash', e.event_digest,
      'authorizationBasis', 'human_decision_receipt'
    ),
    'policy', jsonb_build_object(
      'policyReference', p.policy_reference,
      'productReference', p.product_reference,
      'premiumAmount', p.premium_amount,
      'paymentFrequency', p.payment_frequency,
      'currency', p.currency,
      'issueDate', p.issue_date,
      'effectiveFrom', p.effective_from,
      'statusValue', p.status_value,
      'completenessState', p.completeness_state
    ),
    'obligation', case when o.id is null then null else jsonb_build_object(
      'obligationReference', o.obligation_reference,
      'policyYear', o.policy_year,
      'expectedAmount', o.expected_amount,
      'actualAmount', o.actual_amount,
      'paymentFrequency', o.payment_frequency,
      'expectedDate', o.expected_date,
      'actualDate', o.actual_date,
      'status', o.status,
      'confirmationState', o.confirmation_state,
      'policyTermsDigest', o.policy_terms_digest
    ) end,
    'personReference', person.person_reference,
    'reconciliation', case when r.id is null then null else jsonb_build_object(
      'outcome', r.outcome,
      'reconciliationReference', r.reconciliation_reference,
      'reconciliationDigest', r.reconciliation_digest,
      'recordedAt', r.recorded_at
    ) end,
    'lifecycle', null,
    'safeguards', jsonb_build_object(
      'paymentTruthOwner', 'CARTERA_CONFIRMED_PAYMENT_AUTHORITY',
      'commissionTruthOwner', 'ADVISOR_COMPENSATION',
      'payoutTruthEstablished', false,
      'syntheticWriterUsed', false,
      'unknownCoercedToZero', false
    )
  )
  into result_payload
  from public.cartera030c_confirmed_payment_events e
  join public.canonical_policies p
    on p.id = e.policy_id
   and p.advisor_id = e.advisor_id
  left join lateral (
    select rr.*
    from public.cartera030b_payment_reconciliations rr
    where rr.advisor_id = e.advisor_id
      and rr.payment_event_reference = e.payment_event_reference
      and rr.outcome in ('MATCHED','PARTIAL_MATCH')
    order by rr.recorded_at desc
    limit 1
  ) r on true
  left join public.cartera030b_expected_payment_obligations o
    on o.id = r.obligation_id
   and o.advisor_id = e.advisor_id
  left join lateral (
    select cp.person_reference
    from public.policy_roles pr
    join public.commercial_people cp
      on cp.id = pr.participant_person_id
     and cp.advisor_id = pr.advisor_id
    where pr.advisor_id = e.advisor_id
      and pr.policy_id = e.policy_id
      and pr.participant_person_id is not null
      and pr.confirmation_state = 'CONFIRMED'
      and pr.effective_to is null
      and pr.role_type <> 'BENEFICIARY'
    order by
      case pr.role_type
        when 'POLICY_OWNER' then 1
        when 'INSURED' then 2
        when 'PAYOR' then 3
        when 'ORIGINATING_ADVISOR' then 8
        when 'ADVISOR_OF_RECORD' then 8
        when 'SERVICING_ADVISOR' then 8
        else 9
      end,
      pr.effective_from desc,
      pr.created_at desc
    limit 1
  ) person on true
  where e.advisor_id = actor_id
    and e.payment_event_reference = requested_reference
    and e.confirmation_state = 'CONFIRMED'
  limit 1;

  if result_payload is null then
    return jsonb_build_object(
      'state', 'PAYMENT_NOT_FOUND',
      'paymentEventReference', requested_reference
    );
  end if;

  return result_payload;
end;
$$;

revoke all on function public.forge_advisor_compensation_handoff_context_011d(text)
  from public, anon;
grant execute on function public.forge_advisor_compensation_handoff_context_011d(text)
  to authenticated;

comment on function public.forge_advisor_compensation_handoff_context_011d(text) is
  '011D owner-scoped canonical 030C payment context. Policy person priority uses canonical PolicyRole vocabulary; canonical confirmation is adapted as receipt only, never re-decided.';

commit;