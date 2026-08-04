-- BETA1_022B: governed synthetic evidence ingress over the canonical ledgers.
-- No rate is accepted or calculated here. Amounts are explicit synthetic evidence.

begin;

create table public.advisor_compensation_synthetic_command_receipts (
  id uuid primary key default gen_random_uuid(),
  advisor_id uuid not null references auth.users(id) on delete restrict,
  run_id text not null,
  idempotency_key text not null,
  command_digest text not null check (command_digest ~ '^[a-f0-9]{64}$'),
  response jsonb not null check (jsonb_typeof(response) = 'object'),
  created_at timestamptz not null default now(),
  unique (advisor_id, idempotency_key)
);

alter table public.advisor_compensation_synthetic_command_receipts enable row level security;
alter table public.advisor_compensation_synthetic_command_receipts force row level security;
revoke all on public.advisor_compensation_synthetic_command_receipts from public, anon, authenticated;

create or replace function public.forge_advisor_compensation_accept_synthetic_evidence(p_command jsonb)
returns jsonb
language plpgsql
security definer
set search_path = public, extensions, pg_temp
as $$
declare
  actor uuid := auth.uid();
  demo jsonb;
  run_id constant text := '20260803_213631';
  data_class constant text := 'NON_PERSONAL_SYNTHETIC_ACCEPTANCE_DATA';
  key_value text := btrim(p_command->>'idempotencyKey');
  state_value text := p_command->>'state';
  period_value text := p_command->>'periodKey';
  policy_value text := btrim(p_command->>'policyReference');
  concept_value text := p_command->>'concept';
  currency_value text := coalesce(p_command->>'currency','MXN');
  amount_value numeric;
  digest_value text;
  prior public.advisor_compensation_synthetic_command_receipts%rowtype;
  response_value jsonb;
  evidence_value jsonb := p_command->'evidence';
  snapshot_value jsonb := p_command->'ruleSnapshot';
  event_value jsonb;
  event_digest_value text;
  estimated_event_id text;
  earned_event_id text;
  aggregate_value text;
  occurred_value timestamptz := now();
  matched_event_id text := p_command->>'matchedEventId';
  payment_event_value text := p_command->>'paymentEventReference';
  evidence_id text;
  decision_id text;
  payout_id text;
  payout_value jsonb;
  payout_digest_value text;
begin
  if actor is null then raise exception 'SESSION_REQUIRED' using errcode='42501'; end if;
  if p_command is null or jsonb_typeof(p_command) <> 'object'
     or p_command->>'ownerId' is distinct from actor::text
     or p_command->>'runId' is distinct from run_id
     or p_command->>'dataClass' is distinct from data_class
     or nullif(key_value,'') is null then
    raise exception 'SYNTHETIC_COMPENSATION_COMMAND_INVALID' using errcode='22023';
  end if;

  demo := public.forge_demo_current_session();
  if coalesce((demo->>'isDemo')::boolean,false) is not true
     or demo->>'dataClass' is distinct from 'SYNTHETIC'
     or coalesce((demo->>'readOnly')::boolean,true) is true then
    raise exception 'SYNTHETIC_COMPENSATION_WINDOW_CLOSED' using errcode='42501';
  end if;

  if state_value not in ('UNKNOWN','ESTIMATED','EARNED','PAID')
     or period_value !~ '^\d{4}-(0[1-9]|1[0-2])$'
     or currency_value <> 'MXN'
     or p_command ? 'rate' or p_command ? 'commissionRate'
     or coalesce(snapshot_value,'{}'::jsonb) ? 'rate' then
    raise exception 'SYNTHETIC_COMPENSATION_BOUNDARY_REJECTED' using errcode='22023';
  end if;

  digest_value := encode(digest(convert_to(p_command::text,'UTF8'),'sha256'),'hex');
  perform pg_advisory_xact_lock(hashtextextended(actor::text||'|'||key_value,0));
  select * into prior from public.advisor_compensation_synthetic_command_receipts
    where advisor_id=actor and idempotency_key=key_value;
  if found then
    if prior.command_digest <> digest_value then
      return jsonb_build_object('status','CONFLICT','conflictType','IDEMPOTENCY_KEY_REUSED');
    end if;
    return prior.response || jsonb_build_object('status','REPLAYED','replayed',true);
  end if;

  if state_value = 'UNKNOWN' then
    if p_command ? 'amount' and p_command->'amount' <> 'null'::jsonb then
      raise exception 'UNKNOWN_AMOUNT_MUST_BE_NULL' using errcode='22023';
    end if;
    response_value := jsonb_build_object('status','CREATED','truthState','UNKNOWN','amount',null,
      'periodKey',period_value,'readAfterWriteVerified',true,'realWorldClaim',false);
  else
    if jsonb_typeof(evidence_value) <> 'object'
       or nullif(evidence_value->>'reference','') is null
       or evidence_value->>'hash' !~ '^[a-f0-9]{64}$'
       or coalesce((evidence_value->>'synthetic')::boolean,false) is not true
       or coalesce((evidence_value->>'rateApplied')::boolean,true) is true then
      raise exception 'EXPLICIT_SYNTHETIC_EVIDENCE_REQUIRED' using errcode='22023';
    end if;
    amount_value := (p_command->>'amount')::numeric;
    if amount_value <= 0 then raise exception 'EXPLICIT_SYNTHETIC_AMOUNT_REQUIRED' using errcode='22023'; end if;
    if concept_value not in ('LIFE_INITIAL','LIFE_RENEWAL') then
      raise exception 'COMMISSION_CONCEPT_INVALID' using errcode='22023';
    end if;
    if not exists (
      select 1 from public.canonical_policies
      where advisor_id=actor and policy_reference=policy_value
        and policy_reference like 'policy:beta1022a:'||run_id||':%'
    ) then raise exception 'SYNTHETIC_POLICY_NOT_FOUND' using errcode='22023'; end if;

    if state_value in ('ESTIMATED','EARNED') then
      if jsonb_typeof(snapshot_value) <> 'object'
         or snapshot_value->>'reference' is null
         or snapshot_value->>'digest' !~ '^[a-f0-9]{64}$'
         or coalesce((snapshot_value->>'syntheticAcceptanceOnly')::boolean,false) is not true then
        raise exception 'SYNTHETIC_RULE_SNAPSHOT_REQUIRED' using errcode='22023';
      end if;
      if state_value = 'EARNED' and not exists (
        select 1 from public.cartera030c_confirmed_payment_events
        where advisor_id=actor and payment_event_reference=payment_event_value
          and policy_reference=policy_value and confirmation_state='CONFIRMED'
      ) then raise exception 'CONFIRMED_PAYMENT_EVENT_REQUIRED_FOR_EARNED' using errcode='22023'; end if;
      aggregate_value := 'synthetic:'||run_id||':'||actor::text||':'||policy_value||':'||concept_value;
      estimated_event_id := 'ace:'||encode(digest(convert_to(key_value||':estimated','UTF8'),'sha256'),'hex');
      event_value := jsonb_build_object(
        'contractVersion','ADVISOR_COMPENSATION_EVENT_001','eventId',estimated_event_id,
        'aggregateKey',aggregate_value,'sequence',1,'previousEventId',null,'state','ESTIMATED',
        'kind','COMMISSION','concept',concept_value,'advisorReference',actor::text,
        'policyReference',policy_value,'paymentEventId',case when state_value='EARNED' then payment_event_value else null end,'periodKey',period_value,
        'amount',jsonb_build_object('value',amount_value,'currency',currency_value),
        'calculation',jsonb_build_object('source','EXPLICIT_SYNTHETIC_EVIDENCE_AMOUNT','rateApplied',false),
        'ruleSnapshot',snapshot_value||jsonb_build_object('officialSourceTruth',false),
        'evidence',evidence_value,'lineage',jsonb_build_object('runId',run_id,'dataClass',data_class),
        'reason','GOVERNED_SYNTHETIC_ACCEPTANCE','actorId',actor::text,
        'idempotencyKey',key_value||':estimated','correlationId',key_value,'createdAt',occurred_value,
        'safeguards',jsonb_build_object('appendOnly',true,'overwriteAuthorized',false,'deleteAuthorized',false,
          'payoutTruth',false,'paidPromotionAuthorized',false,'externalMutationAuthorized',false,
          'realPayoutClaim',false,'directBrowserMutation',false),
        'metadata',jsonb_build_object('runId',run_id,'dataClass',data_class,'incomePeriodKey',period_value)
      );
      event_digest_value := encode(digest(convert_to(event_value::text,'UTF8'),'sha256'),'hex');
      event_value := event_value||jsonb_build_object('eventDigest',event_digest_value);
      insert into public.advisor_compensation_event_ledger(advisor_id,event_id,aggregate_key,idempotency_key,
        period_key,state,currency,amount,event_digest,payload,occurred_at,created_by)
      values(actor,estimated_event_id,aggregate_value,key_value||':estimated',period_value,'ESTIMATED',currency_value,
        amount_value,event_digest_value,event_value,occurred_value,actor);

      earned_event_id := null;
      if state_value = 'EARNED' then
        earned_event_id := 'ace:'||encode(digest(convert_to(key_value||':earned','UTF8'),'sha256'),'hex');
        event_value := event_value||jsonb_build_object('eventId',earned_event_id,'sequence',2,
          'previousEventId',estimated_event_id,'state','EARNED','idempotencyKey',key_value||':earned');
        event_value := event_value - 'eventDigest';
        event_digest_value := encode(digest(convert_to(event_value::text,'UTF8'),'sha256'),'hex');
        event_value := event_value||jsonb_build_object('eventDigest',event_digest_value);
        insert into public.advisor_compensation_event_ledger(advisor_id,event_id,aggregate_key,idempotency_key,
          period_key,state,currency,amount,event_digest,payload,occurred_at,created_by)
        values(actor,earned_event_id,aggregate_value,key_value||':earned',period_value,'EARNED',currency_value,
          amount_value,event_digest_value,event_value,occurred_value + interval '1 millisecond',actor);
      end if;
      response_value := jsonb_build_object('status','CREATED','truthState',state_value,'amount',amount_value,
        'currency',currency_value,'periodKey',period_value,'estimatedEventId',estimated_event_id,
        'earnedEventId',earned_event_id,'readAfterWriteVerified',true,'realWorldClaim',false);
    else
      if nullif(matched_event_id,'') is null or not exists (
        select 1 from public.advisor_compensation_event_ledger
        where advisor_id=actor and event_id=matched_event_id and state='EARNED'
          and period_key=period_value and payload#>>'{metadata,runId}'=run_id
      ) or jsonb_typeof(p_command->'humanDecision') <> 'object'
        or coalesce((p_command#>>'{humanDecision,confirmed}')::boolean,false) is not true then
        raise exception 'SYNTHETIC_PAYOUT_EVIDENCE_AND_DECISION_REQUIRED' using errcode='22023';
      end if;
      evidence_id := 'ace-evidence:'||encode(digest(convert_to(key_value,'UTF8'),'sha256'),'hex');
      decision_id := 'ace-decision:'||encode(digest(convert_to(key_value,'UTF8'),'sha256'),'hex');
      payout_id := 'ace-payout:'||encode(digest(convert_to(key_value,'UTF8'),'sha256'),'hex');
      insert into public.advisor_compensation_payout_evidence_ledger(advisor_id,evidence_id,period_key,payment_date,
        currency,amount,evidence_hash,source_type,payload,created_by)
      values(actor,evidence_id,period_value,coalesce((evidence_value->>'paymentDate')::date,current_date),currency_value,
        amount_value,evidence_value->>'hash','CONTROLLED_MANUAL',evidence_value||jsonb_build_object(
          'runId',run_id,'dataClass',data_class,'realWorldClaim',false),actor);
      insert into public.advisor_compensation_payout_decision_ledger(advisor_id,decision_id,evidence_id,decision_state,
        matched_event_ids,reason,payload,decided_at,decided_by)
      values(actor,decision_id,evidence_id,'CONFIRMED',array[matched_event_id],
        'GOVERNED_SYNTHETIC_ACCEPTANCE',p_command->'humanDecision'||jsonb_build_object('runId',run_id,'realWorldClaim',false),now(),actor);
      payout_value := jsonb_build_object('contractVersion','ADVISOR_COMPENSATION_CONFIRMED_PAYOUT_RECORD_001',
        'payoutRecordId',payout_id,'truthClass','CONFIRMED_COMPENSATION_PAYOUT','confirmationState','CONFIRMED',
        'advisorReference',actor::text,'periodKey',period_value,
        'amount',jsonb_build_object('value',amount_value,'currency',currency_value),
        'matchedCompensationEventIds',jsonb_build_array(matched_event_id),
        'payoutEvidenceReference',evidence_id,'payoutEvidenceHash',evidence_value->>'hash',
        'humanDecisionId',decision_id,'confirmedAt',now(),'sourceAuthority','GOVERNED_SYNTHETIC_ACCEPTANCE',
        'metadata',jsonb_build_object('runId',run_id,'dataClass',data_class,'realWorldClaim',false),
        'safeguards',jsonb_build_object('payoutTruth',true,'automaticConfirmation',false,
          'eventPromotionPerformed',false,'externalMutationAuthorized',false));
      payout_digest_value := encode(digest(convert_to(payout_value::text,'UTF8'),'sha256'),'hex');
      payout_value := payout_value||jsonb_build_object('recordDigest',payout_digest_value);
      insert into public.advisor_compensation_payout_record_ledger(advisor_id,payout_record_id,period_key,currency,
        amount,evidence_id,decision_id,matched_event_ids,record_digest,payload,confirmed_at)
      values(actor,payout_id,period_value,currency_value,amount_value,evidence_id,decision_id,array[matched_event_id],
        payout_digest_value,payout_value,now());
      response_value := jsonb_build_object('status','CREATED','truthState','PAID','amount',amount_value,
        'currency',currency_value,'periodKey',period_value,'payoutRecordId',payout_id,
        'readAfterWriteVerified',true,'realWorldClaim',false);
    end if;
  end if;

  insert into public.advisor_compensation_synthetic_command_receipts(advisor_id,run_id,idempotency_key,command_digest,response)
  values(actor,run_id,key_value,digest_value,response_value);
  return response_value;
end;
$$;

revoke all on function public.forge_advisor_compensation_accept_synthetic_evidence(jsonb) from public, anon;
grant execute on function public.forge_advisor_compensation_accept_synthetic_evidence(jsonb) to authenticated;

create trigger forge_demo_read_only_guard_compensation_receipts
before insert or update or delete on public.advisor_compensation_synthetic_command_receipts
for each row execute function public.forge_demo_read_only_guard();

comment on table public.advisor_compensation_synthetic_command_receipts is
  'Idempotency receipts for RUN_ID-scoped synthetic acceptance; not compensation truth.';

commit;
