-- FORGE ADVISOR COMPENSATION 011D
-- Atomic productive commit of existing Stage 030 intake + existing Stage 050 event.
-- No payment confirmation, commission formula, rate, payout inference, or synthetic writer lives here.
-- REMOTE_APPLY=NOT_AUTHORIZED by phase gate.

begin;

create or replace function public.forge_advisor_compensation_commit_event_011d(
  p_advisor_id uuid,
  p_payment_event jsonb,
  p_compensation_event jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  intake_event_id text;
  intake_idempotency text;
  intake_command_digest text;
  intake_semantic text;
  intake_evidence text;
  intake_payload_digest text;
  existing_intake public.advisor_compensation_payment_intake_ledger%rowtype;

  compensation_event_id text;
  compensation_aggregate text;
  compensation_idempotency text;
  compensation_period text;
  compensation_state text;
  compensation_currency text;
  compensation_amount numeric;
  compensation_digest text;
  compensation_occurred_at timestamptz;
  existing_compensation public.advisor_compensation_event_ledger%rowtype;

  intake_exists boolean := false;
  compensation_exists boolean := false;
  inserted_intake boolean := false;
  inserted_compensation boolean := false;
begin
  if p_advisor_id is null then
    raise exception 'ADVISOR_COMPENSATION_011D_ADVISOR_REQUIRED';
  end if;
  if p_payment_event is null or jsonb_typeof(p_payment_event) <> 'object' then
    raise exception 'ADVISOR_COMPENSATION_011D_EVENT_REQUIRED';
  end if;
  if p_compensation_event is null or jsonb_typeof(p_compensation_event) <> 'object' then
    raise exception 'ADVISOR_COMPENSATION_011D_COMPENSATION_EVENT_REQUIRED';
  end if;

  if nullif(p_payment_event #>> '{references,advisorReference}', '') is distinct from p_advisor_id::text then
    raise exception 'ADVISOR_COMPENSATION_011D_OWNER_MISMATCH';
  end if;
  if nullif(p_compensation_event ->> 'advisorReference', '') is distinct from p_advisor_id::text then
    raise exception 'ADVISOR_COMPENSATION_011D_OWNER_MISMATCH';
  end if;

  intake_event_id := nullif(btrim(p_payment_event ->> 'eventId'), '');
  intake_idempotency := nullif(btrim(p_payment_event #>> '{source,idempotencyKey}'), '');
  intake_command_digest := nullif(btrim(p_payment_event #>> '{source,commandDigest}'), '');
  intake_semantic := nullif(btrim(p_payment_event #>> '{fingerprints,semanticFingerprint}'), '');
  intake_evidence := nullif(btrim(p_payment_event #>> '{fingerprints,evidenceFingerprint}'), '');
  intake_payload_digest := encode(digest(convert_to(p_payment_event::text, 'utf8'), 'sha256'), 'hex');

  if intake_event_id is null or intake_idempotency is null or intake_command_digest is null
     or intake_semantic is null or intake_evidence is null then
    raise exception 'ADVISOR_COMPENSATION_011D_INTAKE_CONTRACT_INVALID';
  end if;

  if coalesce((p_compensation_event #>> '{safeguards,appendOnly}')::boolean, false) is not true
     or coalesce((p_compensation_event #>> '{safeguards,payoutTruth}')::boolean, true) is not false
     or coalesce((p_compensation_event #>> '{safeguards,paidPromotionAuthorized}')::boolean, true) is not false then
    raise exception 'ADVISOR_COMPENSATION_011D_EVENT_SAFEGUARDS_INVALID';
  end if;

  compensation_event_id := nullif(btrim(p_compensation_event ->> 'eventId'), '');
  compensation_aggregate := nullif(btrim(p_compensation_event ->> 'aggregateKey'), '');
  compensation_idempotency := nullif(btrim(p_compensation_event ->> 'idempotencyKey'), '');
  compensation_period := nullif(btrim(p_compensation_event ->> 'periodKey'), '');
  compensation_state := nullif(btrim(p_compensation_event ->> 'state'), '');
  compensation_currency := nullif(upper(btrim(p_compensation_event #>> '{amount,currency}')), '');
  compensation_amount := nullif(p_compensation_event #>> '{amount,value}', '')::numeric;
  compensation_digest := nullif(btrim(p_compensation_event ->> 'eventDigest'), '');
  compensation_occurred_at := nullif(btrim(p_compensation_event ->> 'createdAt'), '')::timestamptz;

  if compensation_event_id is null or compensation_aggregate is null or compensation_idempotency is null
     or compensation_period is null or compensation_period !~ '^\d{4}-(0[1-9]|1[0-2])$'
     or compensation_state not in ('ESTIMATED','EARNED','ADJUSTED','REVERSED')
     or compensation_currency !~ '^[A-Z]{3}$'
     or compensation_amount is null
     or compensation_digest !~ '^[a-f0-9]{64}$'
     or compensation_occurred_at is null then
    raise exception 'ADVISOR_COMPENSATION_011D_COMPENSATION_EVENT_CONTRACT_INVALID';
  end if;
  if compensation_state = 'PAID' then
    raise exception 'ADVISOR_COMPENSATION_PAID_EVENT_NOT_AUTHORIZED';
  end if;

  -- Stable transaction locks; timestamp is never an idempotency identity.
  perform pg_advisory_xact_lock(hashtextextended(p_advisor_id::text || ':030:' || intake_idempotency, 0));
  perform pg_advisory_xact_lock(hashtextextended(p_advisor_id::text || ':050:' || compensation_idempotency, 0));

  select * into existing_intake
  from public.advisor_compensation_payment_intake_ledger
  where advisor_id = p_advisor_id
    and (
      idempotency_key = intake_idempotency
      or event_id = intake_event_id
      or semantic_fingerprint = intake_semantic
      or evidence_fingerprint = intake_evidence
    )
  order by created_at asc
  limit 1;
  intake_exists := found;

  if intake_exists and not (
    existing_intake.payload_digest = intake_payload_digest
    and existing_intake.event_id = intake_event_id
    and existing_intake.idempotency_key = intake_idempotency
    and existing_intake.command_digest = intake_command_digest
    and existing_intake.semantic_fingerprint = intake_semantic
    and existing_intake.evidence_fingerprint = intake_evidence
  ) then
    return jsonb_build_object(
      'state','CONFLICT',
      'stage','STAGE_030',
      'eventId',existing_intake.event_id,
      'reason','INTAKE_IDEMPOTENCY_CONFLICT'
    );
  end if;

  select * into existing_compensation
  from public.advisor_compensation_event_ledger
  where advisor_id = p_advisor_id
    and (event_id = compensation_event_id or idempotency_key = compensation_idempotency)
  order by created_at asc
  limit 1;
  compensation_exists := found;

  if compensation_exists and not (
    existing_compensation.event_id = compensation_event_id
    and existing_compensation.idempotency_key = compensation_idempotency
    and existing_compensation.event_digest = compensation_digest
    and existing_compensation.payload = p_compensation_event
  ) then
    return jsonb_build_object(
      'state','CONFLICT',
      'stage','STAGE_050',
      'eventId',existing_compensation.event_id,
      'reason','COMPENSATION_EVENT_IDEMPOTENCY_CONFLICT'
    );
  end if;

  if not intake_exists then
    insert into public.advisor_compensation_payment_intake_ledger (
      advisor_id, event_id, idempotency_key, command_digest,
      semantic_fingerprint, evidence_fingerprint, payload_digest,
      payload, created_by
    ) values (
      p_advisor_id, intake_event_id, intake_idempotency, intake_command_digest,
      intake_semantic, intake_evidence, intake_payload_digest,
      p_payment_event, p_advisor_id
    );
    inserted_intake := true;
  end if;

  if not compensation_exists then
    insert into public.advisor_compensation_event_ledger (
      advisor_id, event_id, aggregate_key, idempotency_key, period_key,
      state, currency, amount, event_digest, payload, occurred_at, created_by
    ) values (
      p_advisor_id, compensation_event_id, compensation_aggregate,
      compensation_idempotency, compensation_period, compensation_state,
      compensation_currency, compensation_amount, compensation_digest,
      p_compensation_event, compensation_occurred_at, p_advisor_id
    );
    inserted_compensation := true;
  end if;

  if inserted_intake or inserted_compensation then
    return jsonb_build_object(
      'state','CREATED',
      'eventId',compensation_event_id,
      'intakeCreated',inserted_intake,
      'compensationEventCreated',inserted_compensation,
      'resumed',intake_exists <> compensation_exists
    );
  end if;

  return jsonb_build_object(
    'state','REPLAYED',
    'eventId',compensation_event_id,
    'intakeCreated',false,
    'compensationEventCreated',false,
    'resumed',false
  );
end;
$$;

revoke all on function public.forge_advisor_compensation_commit_event_011d(uuid,jsonb,jsonb)
  from public, anon, authenticated;
grant execute on function public.forge_advisor_compensation_commit_event_011d(uuid,jsonb,jsonb)
  to service_role;

comment on function public.forge_advisor_compensation_commit_event_011d(uuid,jsonb,jsonb) is
  '011D atomic service-role-only commit of already-validated Stage 030 intake and already-constructed Stage 050 compensation event. Append-only, owner-scoped, replay-safe; PAID/payout truth forbidden.';

commit;