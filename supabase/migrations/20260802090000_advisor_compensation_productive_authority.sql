begin;

create extension if not exists pgcrypto;

create or replace function public.forge_advisor_compensation_append_only_guard()
returns trigger
language plpgsql
set search_path = public, pg_temp
as $$
begin
  raise exception using
    errcode = '42501',
    message = 'ADVISOR_COMPENSATION_APPEND_ONLY_MUTATION_FORBIDDEN';
end;
$$;

create table if not exists public.advisor_compensation_event_ledger (
  id uuid primary key default gen_random_uuid(),
  advisor_id uuid not null,
  event_id text not null,
  aggregate_key text not null,
  idempotency_key text not null,
  period_key text not null check (period_key ~ '^\d{4}-(0[1-9]|1[0-2])$'),
  state text not null check (state in ('ESTIMATED','EARNED','ADJUSTED','REVERSED')),
  currency text not null check (currency ~ '^[A-Z]{3}$'),
  amount numeric(18,2) not null,
  event_digest text not null check (event_digest ~ '^[a-f0-9]{64}$'),
  payload jsonb not null,
  occurred_at timestamptz not null,
  created_at timestamptz not null default now(),
  created_by uuid null default auth.uid(),
  constraint advisor_compensation_event_owner_event_uq unique (advisor_id, event_id),
  constraint advisor_compensation_event_owner_idempotency_uq unique (advisor_id, idempotency_key)
);

create index if not exists advisor_compensation_event_period_idx
  on public.advisor_compensation_event_ledger (advisor_id, period_key, aggregate_key, occurred_at);

create table if not exists public.advisor_compensation_payout_evidence_ledger (
  id uuid primary key default gen_random_uuid(),
  advisor_id uuid not null,
  evidence_id text not null,
  period_key text not null check (period_key ~ '^\d{4}-(0[1-9]|1[0-2])$'),
  payment_date date not null,
  currency text not null check (currency ~ '^[A-Z]{3}$'),
  amount numeric(18,2) not null check (amount > 0),
  evidence_hash text not null check (evidence_hash ~ '^[a-f0-9]{64}$'),
  source_type text not null check (source_type in ('OFFICIAL_STATEMENT','CARRIER_REPORT','RECEIPT','CONTROLLED_MANUAL')),
  payload jsonb not null,
  created_at timestamptz not null default now(),
  created_by uuid null default auth.uid(),
  constraint advisor_compensation_payout_evidence_owner_id_uq unique (advisor_id, evidence_id),
  constraint advisor_compensation_payout_evidence_owner_hash_uq unique (advisor_id, evidence_hash)
);

create index if not exists advisor_compensation_payout_evidence_period_idx
  on public.advisor_compensation_payout_evidence_ledger (advisor_id, period_key, payment_date);

create table if not exists public.advisor_compensation_payout_decision_ledger (
  id uuid primary key default gen_random_uuid(),
  advisor_id uuid not null,
  decision_id text not null,
  evidence_id text not null,
  decision_state text not null check (decision_state in ('CONFIRMED','REJECTED')),
  matched_event_ids text[] not null default '{}',
  reason text not null,
  payload jsonb not null,
  decided_at timestamptz not null,
  decided_by uuid not null,
  created_at timestamptz not null default now(),
  constraint advisor_compensation_payout_decision_owner_id_uq unique (advisor_id, decision_id)
);

create index if not exists advisor_compensation_payout_decision_evidence_idx
  on public.advisor_compensation_payout_decision_ledger (advisor_id, evidence_id, decided_at);

create table if not exists public.advisor_compensation_payout_record_ledger (
  id uuid primary key default gen_random_uuid(),
  advisor_id uuid not null,
  payout_record_id text not null,
  period_key text not null check (period_key ~ '^\d{4}-(0[1-9]|1[0-2])$'),
  currency text not null check (currency ~ '^[A-Z]{3}$'),
  amount numeric(18,2) not null check (amount > 0),
  evidence_id text not null,
  decision_id text not null,
  matched_event_ids text[] not null check (cardinality(matched_event_ids) > 0),
  record_digest text not null check (record_digest ~ '^[a-f0-9]{64}$'),
  payload jsonb not null,
  confirmed_at timestamptz not null,
  created_at timestamptz not null default now(),
  constraint advisor_compensation_payout_record_owner_id_uq unique (advisor_id, payout_record_id),
  constraint advisor_compensation_payout_record_owner_digest_uq unique (advisor_id, record_digest)
);

create index if not exists advisor_compensation_payout_record_period_idx
  on public.advisor_compensation_payout_record_ledger (advisor_id, period_key, confirmed_at);

create table if not exists public.advisor_compensation_product_read_models (
  id uuid primary key default gen_random_uuid(),
  advisor_id uuid not null,
  period_key text not null check (period_key ~ '^\d{4}-(0[1-9]|1[0-2])$'),
  revision bigint not null check (revision > 0),
  source_state text not null check (source_state in ('READY','PARTIAL','EMPTY','BLOCKED','STALE')),
  snapshot_digest text not null check (snapshot_digest ~ '^[a-f0-9]{64}$'),
  history_digest text not null check (history_digest ~ '^[a-f0-9]{64}$'),
  snapshot_payload jsonb not null,
  history_payload jsonb not null,
  source_health jsonb not null default '{}'::jsonb,
  captured_at timestamptz not null,
  created_at timestamptz not null default now(),
  created_by uuid null default auth.uid(),
  constraint advisor_compensation_read_model_revision_uq unique (advisor_id, period_key, revision),
  constraint advisor_compensation_read_model_digest_uq unique (advisor_id, period_key, snapshot_digest, history_digest)
);

create index if not exists advisor_compensation_read_model_current_idx
  on public.advisor_compensation_product_read_models (advisor_id, period_key, revision desc, captured_at desc);

alter table public.advisor_compensation_event_ledger enable row level security;
alter table public.advisor_compensation_payout_evidence_ledger enable row level security;
alter table public.advisor_compensation_payout_decision_ledger enable row level security;
alter table public.advisor_compensation_payout_record_ledger enable row level security;
alter table public.advisor_compensation_product_read_models enable row level security;

alter table public.advisor_compensation_event_ledger force row level security;
alter table public.advisor_compensation_payout_evidence_ledger force row level security;
alter table public.advisor_compensation_payout_decision_ledger force row level security;
alter table public.advisor_compensation_payout_record_ledger force row level security;
alter table public.advisor_compensation_product_read_models force row level security;

drop policy if exists advisor_compensation_events_select_own on public.advisor_compensation_event_ledger;
create policy advisor_compensation_events_select_own
  on public.advisor_compensation_event_ledger
  for select to authenticated
  using (advisor_id = auth.uid());

drop policy if exists advisor_compensation_payout_evidence_select_own on public.advisor_compensation_payout_evidence_ledger;
create policy advisor_compensation_payout_evidence_select_own
  on public.advisor_compensation_payout_evidence_ledger
  for select to authenticated
  using (advisor_id = auth.uid());

drop policy if exists advisor_compensation_payout_decisions_select_own on public.advisor_compensation_payout_decision_ledger;
create policy advisor_compensation_payout_decisions_select_own
  on public.advisor_compensation_payout_decision_ledger
  for select to authenticated
  using (advisor_id = auth.uid());

drop policy if exists advisor_compensation_payout_records_select_own on public.advisor_compensation_payout_record_ledger;
create policy advisor_compensation_payout_records_select_own
  on public.advisor_compensation_payout_record_ledger
  for select to authenticated
  using (advisor_id = auth.uid());

drop policy if exists advisor_compensation_read_models_select_own on public.advisor_compensation_product_read_models;
create policy advisor_compensation_read_models_select_own
  on public.advisor_compensation_product_read_models
  for select to authenticated
  using (advisor_id = auth.uid());

create or replace trigger forge_advisor_compensation_events_append_only
before update or delete on public.advisor_compensation_event_ledger
for each row execute function public.forge_advisor_compensation_append_only_guard();

create or replace trigger forge_advisor_compensation_payout_evidence_append_only
before update or delete on public.advisor_compensation_payout_evidence_ledger
for each row execute function public.forge_advisor_compensation_append_only_guard();

create or replace trigger forge_advisor_compensation_payout_decisions_append_only
before update or delete on public.advisor_compensation_payout_decision_ledger
for each row execute function public.forge_advisor_compensation_append_only_guard();

create or replace trigger forge_advisor_compensation_payout_records_append_only
before update or delete on public.advisor_compensation_payout_record_ledger
for each row execute function public.forge_advisor_compensation_append_only_guard();

create or replace trigger forge_advisor_compensation_read_models_append_only
before update or delete on public.advisor_compensation_product_read_models
for each row execute function public.forge_advisor_compensation_append_only_guard();

revoke all on public.advisor_compensation_event_ledger from public, anon, authenticated;
revoke all on public.advisor_compensation_payout_evidence_ledger from public, anon, authenticated;
revoke all on public.advisor_compensation_payout_decision_ledger from public, anon, authenticated;
revoke all on public.advisor_compensation_payout_record_ledger from public, anon, authenticated;
revoke all on public.advisor_compensation_product_read_models from public, anon, authenticated;

grant select on public.advisor_compensation_event_ledger to authenticated;
grant select on public.advisor_compensation_payout_evidence_ledger to authenticated;
grant select on public.advisor_compensation_payout_decision_ledger to authenticated;
grant select on public.advisor_compensation_payout_record_ledger to authenticated;
grant select on public.advisor_compensation_product_read_models to authenticated;

create or replace function public.forge_advisor_compensation_authority_inventory()
returns jsonb
language sql
stable
security invoker
set search_path = public, pg_temp
as $$
  select jsonb_build_object(
    'ready',
      auth.uid() is not null
      and to_regclass('public.advisor_compensation_event_ledger') is not null
      and to_regclass('public.advisor_compensation_payout_evidence_ledger') is not null
      and to_regclass('public.advisor_compensation_payout_decision_ledger') is not null
      and to_regclass('public.advisor_compensation_payout_record_ledger') is not null
      and to_regclass('public.advisor_compensation_product_read_models') is not null,
    'contractVersion', 'ADVISOR_COMPENSATION_REMOTE_AUTHORITY_INVENTORY_100',
    'ownerScoped', true,
    'appendOnly', true,
    'directBrowserMutation', false,
    'readModelRpc', 'forge_advisor_compensation_read_product'
  );
$$;

create or replace function public.forge_advisor_compensation_read_product(
  p_period_key text,
  p_period_keys text[]
)
returns jsonb
language plpgsql
stable
security invoker
set search_path = public, pg_temp
as $$
declare
  v_advisor_id uuid := auth.uid();
  v_row public.advisor_compensation_product_read_models%rowtype;
  v_history jsonb;
begin
  if v_advisor_id is null then
    raise exception using errcode = '42501', message = 'SESSION_REQUIRED';
  end if;
  if p_period_key is null or p_period_key !~ '^\d{4}-(0[1-9]|1[0-2])$' then
    raise exception using errcode = '22023', message = 'ADVISOR_COMPENSATION_PERIOD_INVALID';
  end if;
  if p_period_keys is null or cardinality(p_period_keys) = 0
     or exists (select 1 from unnest(p_period_keys) value where value !~ '^\d{4}-(0[1-9]|1[0-2])$') then
    raise exception using errcode = '22023', message = 'ADVISOR_COMPENSATION_HISTORY_PERIODS_INVALID';
  end if;

  select * into v_row
  from public.advisor_compensation_product_read_models
  where advisor_id = v_advisor_id
    and period_key = p_period_key
  order by revision desc, captured_at desc, id desc
  limit 1;

  if not found then
    return jsonb_build_object(
      'sourceState', 'DISCONNECTED',
      'snapshot', null,
      'history', null,
      'sourceHealth', jsonb_build_object(
        'canonicalSnapshot', 'NOT_MATERIALIZED',
        'historicalSeries', 'NOT_MATERIALIZED'
      ),
      'errorCode', 'ADVISOR_COMPENSATION_PRODUCT_READ_MODEL_NOT_MATERIALIZED',
      'metadata', jsonb_build_object(
        'contractVersion', 'ADVISOR_COMPENSATION_REMOTE_PRODUCT_READ_100',
        'ownerScoped', true,
        'readOnly', true
      )
    );
  end if;

  select jsonb_set(
    v_row.history_payload,
    '{points}',
    coalesce(
      (
        select jsonb_agg(point order by point->>'periodKey')
        from jsonb_array_elements(v_row.history_payload->'points') point
        where point->>'periodKey' = any(p_period_keys)
      ),
      '[]'::jsonb
    ),
    true
  ) into v_history;

  return jsonb_build_object(
    'sourceState', v_row.source_state,
    'snapshot', v_row.snapshot_payload,
    'history', v_history,
    'sourceHealth', v_row.source_health,
    'metadata', jsonb_build_object(
      'contractVersion', 'ADVISOR_COMPENSATION_REMOTE_PRODUCT_READ_100',
      'revision', v_row.revision,
      'capturedAt', v_row.captured_at,
      'ownerScoped', true,
      'readOnly', true
    )
  );
end;
$$;

revoke all on function public.forge_advisor_compensation_authority_inventory() from public, anon;
revoke all on function public.forge_advisor_compensation_read_product(text, text[]) from public, anon;
grant execute on function public.forge_advisor_compensation_authority_inventory() to authenticated;
grant execute on function public.forge_advisor_compensation_read_product(text, text[]) to authenticated;

comment on table public.advisor_compensation_event_ledger is
  'Append-only Advisor Compensation event truth. Browser roles are read-only.';
comment on table public.advisor_compensation_product_read_models is
  'Append-only materialized monthly compensation snapshots and history. Browser roles are read-only.';
comment on function public.forge_advisor_compensation_read_product(text, text[]) is
  'Owner-scoped read-only product endpoint for Commissions and the Income Smart Widget.';

commit;
