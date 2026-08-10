-- FORGE ADVISOR COMPENSATION 011D
-- Productive handoff persistence/read context only.
-- This migration contains no commission formula, rate, default, payout inference, or synthetic writer.
-- REMOTE_APPLY=NOT_AUTHORIZED by phase gate.

begin;

create extension if not exists pgcrypto;

create table if not exists public.advisor_compensation_payment_intake_ledger (
  id uuid primary key default gen_random_uuid(),
  advisor_id uuid not null,
  event_id text not null,
  idempotency_key text not null,
  command_digest text not null,
  semantic_fingerprint text not null,
  evidence_fingerprint text not null,
  payload_digest text not null check (payload_digest ~ '^[a-f0-9]{64}$'),
  payload jsonb not null,
  created_at timestamptz not null default now(),
  created_by uuid null,
  constraint advisor_compensation_payment_intake_event_uq
    unique (advisor_id, event_id),
  constraint advisor_compensation_payment_intake_idempotency_uq
    unique (advisor_id, idempotency_key),
  constraint advisor_compensation_payment_intake_semantic_uq
    unique (advisor_id, semantic_fingerprint),
  constraint advisor_compensation_payment_intake_evidence_uq
    unique (advisor_id, evidence_fingerprint)
);

create index if not exists advisor_compensation_payment_intake_created_idx
  on public.advisor_compensation_payment_intake_ledger (advisor_id, created_at desc);

alter table public.advisor_compensation_payment_intake_ledger enable row level security;
alter table public.advisor_compensation_payment_intake_ledger force row level security;

revoke all on table public.advisor_compensation_payment_intake_ledger
  from public, anon, authenticated;

drop trigger if exists advisor_compensation_payment_intake_append_only
  on public.advisor_compensation_payment_intake_ledger;
create trigger advisor_compensation_payment_intake_append_only
before update or delete on public.advisor_compensation_payment_intake_ledger
for each row execute function public.forge_advisor_compensation_append_only_guard();

comment on table public.advisor_compensation_payment_intake_ledger is
  '011D server-governed Stage 030 persistence adapter ledger. Append-only; browser has no DML grants; no economic calculation occurs here.';

-- Owner-scoped context read. It reuses Cartera 030C/030B/010B truth and never writes.
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
        when 'POLICYHOLDER' then 1
        when 'OWNER' then 2
        when 'INSURED' then 3
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
  '011D owner-scoped read of canonical Cartera payment/policy/obligation context. No commission calculation or ledger mutation.';

-- Server-only Stage 030 persistence claim. Domain validation remains in existing JS Stage 030.
create or replace function public.forge_advisor_compensation_claim_intake_011d(
  p_advisor_id uuid,
  p_event jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  event_id_value text;
  idempotency_value text;
  command_digest_value text;
  semantic_value text;
  evidence_value text;
  payload_digest_value text;
  existing_row public.advisor_compensation_payment_intake_ledger%rowtype;
begin
  if p_advisor_id is null then raise exception 'ADVISOR_COMPENSATION_011D_ADVISOR_REQUIRED'; end if;
  if p_event is null or jsonb_typeof(p_event) <> 'object' then raise exception 'ADVISOR_COMPENSATION_011D_EVENT_REQUIRED'; end if;

  event_id_value := nullif(btrim(p_event ->> 'eventId'), '');
  idempotency_value := nullif(btrim(p_event #>> '{source,idempotencyKey}'), '');
  command_digest_value := nullif(btrim(p_event #>> '{source,commandDigest}'), '');
  semantic_value := nullif(btrim(p_event #>> '{fingerprints,semanticFingerprint}'), '');
  evidence_value := nullif(btrim(p_event #>> '{fingerprints,evidenceFingerprint}'), '');
  payload_digest_value := encode(digest(convert_to(p_event::text, 'utf8'), 'sha256'), 'hex');

  if event_id_value is null or idempotency_value is null or command_digest_value is null
     or semantic_value is null or evidence_value is null then
    raise exception 'ADVISOR_COMPENSATION_011D_INTAKE_CONTRACT_INVALID';
  end if;

  if nullif(p_event #>> '{references,advisorReference}', '') is distinct from p_advisor_id::text then
    raise exception 'ADVISOR_COMPENSATION_011D_OWNER_MISMATCH';
  end if;

  perform pg_advisory_xact_lock(hashtextextended(p_advisor_id::text || ':' || idempotency_value, 0));

  select * into existing_row
  from public.advisor_compensation_payment_intake_ledger
  where advisor_id = p_advisor_id
    and (
      idempotency_key = idempotency_value
      or event_id = event_id_value
      or semantic_fingerprint = semantic_value
      or evidence_fingerprint = evidence_value
    )
  order by created_at asc
  limit 1;

  if found then
    if existing_row.payload_digest = payload_digest_value
       and existing_row.event_id = event_id_value
       and existing_row.idempotency_key = idempotency_value
       and existing_row.semantic_fingerprint = semantic_value
       and existing_row.evidence_fingerprint = evidence_value then
      return jsonb_build_object('state','REPLAYED','eventId',existing_row.event_id);
    end if;
    return jsonb_build_object('state','CONFLICT','eventId',existing_row.event_id);
  end if;

  insert into public.advisor_compensation_payment_intake_ledger (
    advisor_id, event_id, idempotency_key, command_digest,
    semantic_fingerprint, evidence_fingerprint, payload_digest, payload, created_by
  ) values (
    p_advisor_id, event_id_value, idempotency_value, command_digest_value,
    semantic_value, evidence_value, payload_digest_value, p_event, p_advisor_id
  );

  return jsonb_build_object('state','CREATED','eventId',event_id_value);
end;
$$;

revoke all on function public.forge_advisor_compensation_claim_intake_011d(uuid,jsonb)
  from public, anon, authenticated;
grant execute on function public.forge_advisor_compensation_claim_intake_011d(uuid,jsonb)
  to service_role;

-- Server-only Stage 050 persistence. The event must already have been created/validated by existing JS authority.
create or replace function public.forge_advisor_compensation_append_event_011d(
  p_advisor_id uuid,
  p_event jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  event_id_value text;
  aggregate_value text;
  idempotency_value text;
  period_value text;
  state_value text;
  currency_value text;
  amount_value numeric;
  digest_value text;
  occurred_value timestamptz;
  existing_payload jsonb;
  existing_digest text;
begin
  if p_advisor_id is null then raise exception 'ADVISOR_COMPENSATION_011D_ADVISOR_REQUIRED'; end if;
  if p_event is null or jsonb_typeof(p_event) <> 'object' then raise exception 'ADVISOR_COMPENSATION_011D_COMPENSATION_EVENT_REQUIRED'; end if;
  if nullif(p_event ->> 'advisorReference','') is distinct from p_advisor_id::text then
    raise exception 'ADVISOR_COMPENSATION_011D_OWNER_MISMATCH';
  end if;
  if coalesce((p_event #>> '{safeguards,appendOnly}')::boolean,false) is not true
     or coalesce((p_event #>> '{safeguards,payoutTruth}')::boolean,true) is not false then
    raise exception 'ADVISOR_COMPENSATION_011D_EVENT_SAFEGUARDS_INVALID';
  end if;

  event_id_value := nullif(btrim(p_event ->> 'eventId'),'');
  aggregate_value := nullif(btrim(p_event ->> 'aggregateKey'),'');
  idempotency_value := nullif(btrim(p_event ->> 'idempotencyKey'),'');
  period_value := nullif(btrim(p_event ->> 'periodKey'),'');
  state_value := nullif(btrim(p_event ->> 'state'),'');
  currency_value := nullif(btrim(p_event #>> '{amount,currency}'),'');
  amount_value := nullif(p_event #>> '{amount,value}','')::numeric;
  digest_value := nullif(btrim(p_event ->> 'eventDigest'),'');
  occurred_value := nullif(btrim(p_event ->> 'createdAt'),'')::timestamptz;

  if event_id_value is null or aggregate_value is null or idempotency_value is null
     or period_value is null or state_value is null or currency_value is null
     or amount_value is null or digest_value !~ '^[a-f0-9]{64}$' or occurred_value is null then
    raise exception 'ADVISOR_COMPENSATION_011D_COMPENSATION_EVENT_CONTRACT_INVALID';
  end if;

  if state_value = 'PAID' then raise exception 'ADVISOR_COMPENSATION_PAID_EVENT_NOT_AUTHORIZED'; end if;

  perform pg_advisory_xact_lock(hashtextextended(p_advisor_id::text || ':' || idempotency_value, 0));

  select payload, event_digest into existing_payload, existing_digest
  from public.advisor_compensation_event_ledger
  where advisor_id = p_advisor_id
    and (event_id = event_id_value or idempotency_key = idempotency_value)
  order by created_at asc
  limit 1;

  if found then
    if existing_digest = digest_value and existing_payload = p_event then
      return jsonb_build_object('state','REPLAYED','eventId',event_id_value);
    end if;
    return jsonb_build_object('state','CONFLICT','eventId',event_id_value);
  end if;

  insert into public.advisor_compensation_event_ledger (
    advisor_id, event_id, aggregate_key, idempotency_key, period_key,
    state, currency, amount, event_digest, payload, occurred_at, created_by
  ) values (
    p_advisor_id, event_id_value, aggregate_value, idempotency_value, period_value,
    state_value, currency_value, amount_value, digest_value, p_event, occurred_value, p_advisor_id
  );

  return jsonb_build_object('state','CREATED','eventId',event_id_value);
end;
$$;

revoke all on function public.forge_advisor_compensation_append_event_011d(uuid,jsonb)
  from public, anon, authenticated;
grant execute on function public.forge_advisor_compensation_append_event_011d(uuid,jsonb)
  to service_role;

-- Server-only input read for the existing materializer. No SQL aggregation/calculation is performed.
create or replace function public.forge_advisor_compensation_materialization_inputs_011d(
  p_advisor_id uuid,
  p_period_keys text[]
)
returns jsonb
language plpgsql
stable
security definer
set search_path = public, pg_temp
as $$
declare
  event_rows jsonb;
  payout_rows jsonb;
begin
  if p_advisor_id is null then raise exception 'ADVISOR_COMPENSATION_011D_ADVISOR_REQUIRED'; end if;
  if p_period_keys is null or cardinality(p_period_keys) = 0 then
    raise exception 'ADVISOR_COMPENSATION_011D_PERIOD_KEYS_REQUIRED';
  end if;

  select coalesce(jsonb_agg(jsonb_build_object('payload', payload) order by occurred_at, created_at), '[]'::jsonb)
    into event_rows
  from public.advisor_compensation_event_ledger
  where advisor_id = p_advisor_id
    and period_key = any(p_period_keys);

  select coalesce(jsonb_agg(jsonb_build_object('payload', payload) order by confirmed_at, created_at), '[]'::jsonb)
    into payout_rows
  from public.advisor_compensation_payout_record_ledger
  where advisor_id = p_advisor_id
    and period_key = any(p_period_keys);

  return jsonb_build_object(
    'eventRows', event_rows,
    'payoutRows', payout_rows,
    'payoutSourceState', case when jsonb_array_length(payout_rows) = 0 then 'DISCONNECTED' else 'PARTIAL' end,
    'forwardSignals', '[]'::jsonb,
    'forwardSignalSourceState', 'DISCONNECTED'
  );
end;
$$;

revoke all on function public.forge_advisor_compensation_materialization_inputs_011d(uuid,text[])
  from public, anon, authenticated;
grant execute on function public.forge_advisor_compensation_materialization_inputs_011d(uuid,text[])
  to service_role;

-- Server-only append of the output already produced by the existing JS materializer.
create or replace function public.forge_advisor_compensation_append_read_model_011d(
  p_advisor_id uuid,
  p_materialization jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  period_value text;
  source_state_value text;
  snapshot_digest_value text;
  history_digest_value text;
  captured_value timestamptz;
  next_revision bigint;
  existing_revision bigint;
begin
  if p_advisor_id is null then raise exception 'ADVISOR_COMPENSATION_011D_ADVISOR_REQUIRED'; end if;
  if p_materialization is null or jsonb_typeof(p_materialization) <> 'object' then
    raise exception 'ADVISOR_COMPENSATION_011D_MATERIALIZATION_REQUIRED';
  end if;
  if nullif(p_materialization ->> 'advisorReference','') is distinct from p_advisor_id::text then
    raise exception 'ADVISOR_COMPENSATION_011D_OWNER_MISMATCH';
  end if;
  if coalesce((p_materialization #>> '{safeguards,directBrowserMutation}')::boolean,true) is not false
     or coalesce((p_materialization #>> '{safeguards,unknownAsZero}')::boolean,true) is not false then
    raise exception 'ADVISOR_COMPENSATION_011D_MATERIALIZATION_SAFEGUARDS_INVALID';
  end if;

  period_value := nullif(btrim(p_materialization ->> 'periodKey'),'');
  source_state_value := nullif(btrim(p_materialization ->> 'sourceState'),'');
  snapshot_digest_value := nullif(btrim(p_materialization ->> 'snapshotDigest'),'');
  history_digest_value := nullif(btrim(p_materialization ->> 'historyDigest'),'');
  captured_value := nullif(btrim(p_materialization ->> 'capturedAt'),'')::timestamptz;

  if period_value is null or source_state_value is null
     or snapshot_digest_value !~ '^[a-f0-9]{64}$'
     or history_digest_value !~ '^[a-f0-9]{64}$'
     or captured_value is null then
    raise exception 'ADVISOR_COMPENSATION_011D_MATERIALIZATION_CONTRACT_INVALID';
  end if;

  perform pg_advisory_xact_lock(hashtextextended(p_advisor_id::text || ':' || period_value, 0));

  select revision into existing_revision
  from public.advisor_compensation_product_read_models
  where advisor_id = p_advisor_id
    and period_key = period_value
    and snapshot_digest = snapshot_digest_value
    and history_digest = history_digest_value
  order by revision desc
  limit 1;

  if found then
    return jsonb_build_object('state','ALREADY_MATERIALIZED','revision',existing_revision);
  end if;

  select coalesce(max(revision),0) + 1 into next_revision
  from public.advisor_compensation_product_read_models
  where advisor_id = p_advisor_id and period_key = period_value;

  insert into public.advisor_compensation_product_read_models (
    advisor_id, period_key, revision, source_state, snapshot_digest, history_digest,
    snapshot_payload, history_payload, source_health, captured_at, created_by
  ) values (
    p_advisor_id, period_value, next_revision, source_state_value,
    snapshot_digest_value, history_digest_value,
    p_materialization -> 'snapshotPayload', p_materialization -> 'historyPayload',
    coalesce(p_materialization -> 'sourceHealth','{}'::jsonb), captured_value, p_advisor_id
  );

  return jsonb_build_object('state','CREATED','revision',next_revision);
end;
$$;

revoke all on function public.forge_advisor_compensation_append_read_model_011d(uuid,jsonb)
  from public, anon, authenticated;
grant execute on function public.forge_advisor_compensation_append_read_model_011d(uuid,jsonb)
  to service_role;

comment on function public.forge_advisor_compensation_claim_intake_011d(uuid,jsonb) is
  '011D service-role-only persistence for existing Stage 030 output; no payment confirmation or commission formula.';
comment on function public.forge_advisor_compensation_append_event_011d(uuid,jsonb) is
  '011D service-role-only append of existing Stage 050 canonical compensation event; PAID state forbidden.';
comment on function public.forge_advisor_compensation_materialization_inputs_011d(uuid,text[]) is
  '011D service-role-only owner-scoped rows for existing product read-model materializer; payout remains separate truth.';
comment on function public.forge_advisor_compensation_append_read_model_011d(uuid,jsonb) is
  '011D service-role-only append of existing materializer output; unknown-to-zero coercion forbidden.';

commit;
