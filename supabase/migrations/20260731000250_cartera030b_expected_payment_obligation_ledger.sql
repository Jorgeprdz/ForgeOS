-- CARTERA 030B expected payment obligation ledger foundation.
-- Repository implementation only. This migration is NOT remote deployment authorization.

begin;

create extension if not exists pgcrypto;

create table if not exists public.cartera030b_expected_payment_obligations (
  id uuid primary key default gen_random_uuid(),
  advisor_id uuid not null references auth.users(id) on delete restrict,
  obligation_reference text not null,
  policy_id uuid not null,
  policy_version_id uuid not null,
  policy_reference text not null,
  policy_version_reference text not null,
  policy_terms_digest text not null,
  obligation_kind text not null check (obligation_kind in ('PREMIUM_PAYMENT')),
  expected_date date,
  expected_amount numeric,
  currency text,
  payment_frequency text,
  policy_year integer,
  sequence_number integer not null check (sequence_number >= 1),
  status text not null check (
    status in (
      'SCHEDULED',
      'UPCOMING',
      'DETECTED',
      'CONFIRMATION_REQUIRED',
      'CONFIRMED',
      'PARTIAL',
      'OVERDUE',
      'NOT_FOUND',
      'CORRECTED',
      'CANCELLED'
    )
  ),
  schedule_rule_reference text,
  source_evidence_references jsonb not null default '[]'::jsonb,
  matched_payment_event_references jsonb not null default '[]'::jsonb,
  actual_date date,
  actual_amount numeric,
  confirmation_state text not null check (
    confirmation_state in (
      'SCHEDULE_DERIVED',
      'EVIDENCE_PENDING',
      'PAYMENT_CONFIRMED',
      'UNKNOWN'
    )
  ),
  timezone text not null,
  date_authority text not null,
  generation_idempotency_key text not null,
  generation_digest text not null,
  supersedes_obligation_id uuid,
  created_at timestamptz not null default now(),
  created_by uuid not null references auth.users(id) on delete restrict,
  updated_at timestamptz not null default now(),
  state_version integer not null default 1 check (state_version >= 1),
  constraint cartera030b_obligation_reference_ck
    check (obligation_reference ~ '^[A-Za-z0-9][A-Za-z0-9._:@/-]{0,239}$'),
  constraint cartera030b_obligation_policy_reference_ck
    check (policy_reference ~ '^[A-Za-z0-9][A-Za-z0-9._:@/-]{0,239}$'),
  constraint cartera030b_obligation_version_reference_ck
    check (policy_version_reference ~ '^[A-Za-z0-9][A-Za-z0-9._:@/-]{0,239}$'),
  constraint cartera030b_obligation_terms_digest_ck
    check (policy_terms_digest ~ '^[a-f0-9]{64}$'),
  constraint cartera030b_obligation_amount_ck
    check (expected_amount is null or expected_amount >= 0),
  constraint cartera030b_obligation_actual_amount_ck
    check (actual_amount is null or actual_amount >= 0),
  constraint cartera030b_obligation_currency_ck
    check (currency is null or currency ~ '^[A-Z]{3}$'),
  constraint cartera030b_obligation_frequency_ck
    check (
      payment_frequency is null
      or payment_frequency in ('MONTHLY', 'QUARTERLY', 'SEMIANNUAL', 'ANNUAL', 'SINGLE')
    ),
  constraint cartera030b_obligation_policy_year_ck
    check (policy_year is null or policy_year >= 1),
  constraint cartera030b_obligation_schedule_rule_ck
    check (
      schedule_rule_reference is null
      or schedule_rule_reference ~ '^[A-Za-z0-9][A-Za-z0-9._:@/-]{0,239}$'
    ),
  constraint cartera030b_obligation_source_evidence_ck
    check (jsonb_typeof(source_evidence_references) = 'array'),
  constraint cartera030b_obligation_payment_events_ck
    check (jsonb_typeof(matched_payment_event_references) = 'array'),
  constraint cartera030b_obligation_timezone_ck
    check (nullif(btrim(timezone), '') is not null and length(timezone) <= 120),
  constraint cartera030b_obligation_date_authority_ck
    check (date_authority = 'CONFIRMED_POLICY_TERMS_DERIVED'),
  constraint cartera030b_obligation_generation_key_ck
    check (generation_idempotency_key ~ '^[A-Za-z0-9][A-Za-z0-9._:@/-]{0,159}$'),
  constraint cartera030b_obligation_generation_digest_ck
    check (generation_digest ~ '^[a-f0-9]{64}$'),
  constraint cartera030b_obligation_actual_state_ck
    check (
      (
        status in ('CONFIRMED', 'PARTIAL')
        and confirmation_state = 'PAYMENT_CONFIRMED'
        and actual_date is not null
      )
      or
      (
        status not in ('CONFIRMED', 'PARTIAL')
        and (
          confirmation_state <> 'PAYMENT_CONFIRMED'
          or actual_date is not null
        )
      )
    ),
  constraint cartera030b_obligation_actor_ck
    check (created_by = advisor_id),
  constraint cartera030b_obligation_policy_owner_fk
    foreign key (policy_id, advisor_id)
    references public.canonical_policies (id, advisor_id)
    on delete restrict,
  constraint cartera030b_obligation_version_owner_fk
    foreign key (policy_version_id, advisor_id)
    references public.policy_versions (id, advisor_id)
    on delete restrict,
  constraint cartera030b_obligation_supersedes_owner_fk
    foreign key (supersedes_obligation_id, advisor_id)
    references public.cartera030b_expected_payment_obligations (id, advisor_id)
    on delete restrict,
  unique (id, advisor_id),
  unique (advisor_id, obligation_reference)
);

create unique index if not exists cartera030b_active_occurrence_uq
  on public.cartera030b_expected_payment_obligations (
    advisor_id,
    policy_version_id,
    obligation_kind,
    expected_date,
    sequence_number
  )
  where status not in ('CORRECTED', 'CANCELLED');

create index if not exists cartera030b_obligation_calendar_idx
  on public.cartera030b_expected_payment_obligations (
    advisor_id,
    expected_date,
    status,
    policy_id
  );

create table if not exists public.cartera030b_obligation_transitions (
  id uuid primary key default gen_random_uuid(),
  advisor_id uuid not null references auth.users(id) on delete restrict,
  transition_reference text not null,
  obligation_id uuid not null,
  from_status text,
  to_status text not null,
  expected_state_version integer,
  resulting_state_version integer not null,
  reason_code text not null,
  actor_reference text not null,
  evidence_references jsonb not null default '[]'::jsonb,
  payment_event_reference text,
  transition_digest text not null,
  idempotency_key text not null,
  occurred_at timestamptz not null default now(),
  created_by uuid not null references auth.users(id) on delete restrict,
  constraint cartera030b_transition_reference_ck
    check (transition_reference ~ '^[A-Za-z0-9][A-Za-z0-9._:@/-]{0,239}$'),
  constraint cartera030b_transition_state_version_ck
    check (expected_state_version is null or expected_state_version >= 1),
  constraint cartera030b_transition_result_version_ck
    check (resulting_state_version >= 1),
  constraint cartera030b_transition_reason_ck
    check (reason_code ~ '^[A-Za-z0-9][A-Za-z0-9._:@/-]{0,159}$'),
  constraint cartera030b_transition_actor_reference_ck
    check (actor_reference ~ '^[A-Za-z0-9][A-Za-z0-9._:@/-]{0,239}$'),
  constraint cartera030b_transition_evidence_ck
    check (jsonb_typeof(evidence_references) = 'array'),
  constraint cartera030b_transition_payment_event_ck
    check (
      payment_event_reference is null
      or payment_event_reference ~ '^[A-Za-z0-9][A-Za-z0-9._:@/-]{0,239}$'
    ),
  constraint cartera030b_transition_digest_ck
    check (transition_digest ~ '^[a-f0-9]{64}$'),
  constraint cartera030b_transition_idempotency_ck
    check (idempotency_key ~ '^[A-Za-z0-9][A-Za-z0-9._:@/-]{0,159}$'),
  constraint cartera030b_transition_actor_ck
    check (created_by = advisor_id),
  constraint cartera030b_transition_obligation_owner_fk
    foreign key (obligation_id, advisor_id)
    references public.cartera030b_expected_payment_obligations (id, advisor_id)
    on delete restrict,
  unique (id, advisor_id),
  unique (advisor_id, transition_reference),
  unique (advisor_id, idempotency_key)
);

create table if not exists public.cartera030b_payment_reconciliations (
  id uuid primary key default gen_random_uuid(),
  advisor_id uuid not null references auth.users(id) on delete restrict,
  reconciliation_reference text not null,
  obligation_id uuid not null,
  payment_event_reference text not null,
  outcome text not null check (
    outcome in ('MATCHED', 'PARTIAL_MATCH', 'AMBIGUOUS', 'NO_MATCH', 'CONFLICT')
  ),
  payment_date date,
  payment_amount numeric,
  currency text,
  evidence_references jsonb not null default '[]'::jsonb,
  allocation_authorization_reference text,
  reconciliation_digest text not null,
  idempotency_key text not null,
  recorded_at timestamptz not null default now(),
  recorded_by uuid not null references auth.users(id) on delete restrict,
  constraint cartera030b_reconciliation_reference_ck
    check (reconciliation_reference ~ '^[A-Za-z0-9][A-Za-z0-9._:@/-]{0,239}$'),
  constraint cartera030b_reconciliation_event_ck
    check (payment_event_reference ~ '^[A-Za-z0-9][A-Za-z0-9._:@/-]{0,239}$'),
  constraint cartera030b_reconciliation_amount_ck
    check (payment_amount is null or payment_amount >= 0),
  constraint cartera030b_reconciliation_currency_ck
    check (currency is null or currency ~ '^[A-Z]{3}$'),
  constraint cartera030b_reconciliation_evidence_ck
    check (jsonb_typeof(evidence_references) = 'array'),
  constraint cartera030b_reconciliation_allocation_ck
    check (
      allocation_authorization_reference is null
      or allocation_authorization_reference ~ '^[A-Za-z0-9][A-Za-z0-9._:@/-]{0,239}$'
    ),
  constraint cartera030b_reconciliation_digest_ck
    check (reconciliation_digest ~ '^[a-f0-9]{64}$'),
  constraint cartera030b_reconciliation_idempotency_ck
    check (idempotency_key ~ '^[A-Za-z0-9][A-Za-z0-9._:@/-]{0,159}$'),
  constraint cartera030b_reconciliation_actor_ck
    check (recorded_by = advisor_id),
  constraint cartera030b_reconciliation_obligation_owner_fk
    foreign key (obligation_id, advisor_id)
    references public.cartera030b_expected_payment_obligations (id, advisor_id)
    on delete restrict,
  unique (id, advisor_id),
  unique (advisor_id, reconciliation_reference),
  unique (advisor_id, idempotency_key),
  unique (advisor_id, obligation_id, payment_event_reference)
);

create table if not exists public.cartera030b_obligation_conflicts (
  id uuid primary key default gen_random_uuid(),
  advisor_id uuid not null references auth.users(id) on delete restrict,
  conflict_reference text not null,
  obligation_id uuid,
  conflict_type text not null check (
    conflict_type in (
      'CHANGED_INPUT_REPLAY',
      'OBLIGATION_IDENTITY_COLLISION',
      'STALE_STATE_VERSION',
      'PAYMENT_MATCH_AMBIGUOUS',
      'PAYMENT_AMOUNT_CONFLICT',
      'CURRENCY_CONFLICT',
      'POLICY_VERSION_CONFLICT'
    )
  ),
  conflict_state text not null check (conflict_state in ('OPEN', 'RESOLVED', 'SUPERSEDED')),
  claims jsonb not null,
  incoming_digest text,
  existing_digest text,
  evidence_references jsonb not null default '[]'::jsonb,
  recorded_at timestamptz not null default now(),
  recorded_by uuid not null references auth.users(id) on delete restrict,
  constraint cartera030b_conflict_reference_ck
    check (conflict_reference ~ '^[A-Za-z0-9][A-Za-z0-9._:@/-]{0,239}$'),
  constraint cartera030b_conflict_claims_ck
    check (jsonb_typeof(claims) = 'object'),
  constraint cartera030b_conflict_incoming_digest_ck
    check (incoming_digest is null or incoming_digest ~ '^[a-f0-9]{64}$'),
  constraint cartera030b_conflict_existing_digest_ck
    check (existing_digest is null or existing_digest ~ '^[a-f0-9]{64}$'),
  constraint cartera030b_conflict_evidence_ck
    check (jsonb_typeof(evidence_references) = 'array'),
  constraint cartera030b_conflict_actor_ck
    check (recorded_by = advisor_id),
  constraint cartera030b_conflict_obligation_owner_fk
    foreign key (obligation_id, advisor_id)
    references public.cartera030b_expected_payment_obligations (id, advisor_id)
    on delete restrict,
  unique (id, advisor_id),
  unique (advisor_id, conflict_reference)
);

create table if not exists public.cartera030b_command_receipts (
  id uuid primary key default gen_random_uuid(),
  advisor_id uuid not null references auth.users(id) on delete restrict,
  command_type text not null check (
    command_type in ('GENERATE_EXPECTED_OBLIGATIONS', 'RECONCILE_PAYMENT_EVENT', 'CORRECT_OBLIGATION')
  ),
  idempotency_key text not null,
  command_digest text not null,
  response_envelope jsonb not null,
  executed_at timestamptz not null default now(),
  executed_by uuid not null references auth.users(id) on delete restrict,
  constraint cartera030b_receipt_idempotency_ck
    check (idempotency_key ~ '^[A-Za-z0-9][A-Za-z0-9._:@/-]{0,159}$'),
  constraint cartera030b_receipt_digest_ck
    check (command_digest ~ '^[a-f0-9]{64}$'),
  constraint cartera030b_receipt_response_ck
    check (jsonb_typeof(response_envelope) = 'object'),
  constraint cartera030b_receipt_actor_ck
    check (executed_by = advisor_id),
  unique (id, advisor_id),
  unique (advisor_id, command_type, idempotency_key)
);

create or replace function public.forge_cartera030b_append_only_guard()
returns trigger
language plpgsql
security invoker
set search_path = public, pg_temp
as $$
begin
  raise exception 'CARTERA030B_APPEND_ONLY';
end;
$$;

create or replace function public.forge_cartera030b_obligation_update_guard()
returns trigger
language plpgsql
security invoker
set search_path = public, pg_temp
as $$
begin
  if tg_op = 'DELETE' then
    raise exception 'CARTERA030B_HARD_DELETE_FORBIDDEN';
  end if;
  if new.advisor_id is distinct from old.advisor_id
    or new.policy_id is distinct from old.policy_id
    or new.policy_version_id is distinct from old.policy_version_id
    or new.obligation_reference is distinct from old.obligation_reference
    or new.policy_terms_digest is distinct from old.policy_terms_digest
    or new.expected_date is distinct from old.expected_date
    or new.sequence_number is distinct from old.sequence_number then
    raise exception 'CARTERA030B_OBLIGATION_IDENTITY_IMMUTABLE';
  end if;
  if new.state_version is distinct from old.state_version + 1 then
    raise exception 'CARTERA030B_STATE_VERSION_INVALID';
  end if;
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists forge_cartera030b_obligation_update_guard
  on public.cartera030b_expected_payment_obligations;
create trigger forge_cartera030b_obligation_update_guard
before update or delete on public.cartera030b_expected_payment_obligations
for each row execute function public.forge_cartera030b_obligation_update_guard();

do $$
declare
  table_name text;
begin
  foreach table_name in array array[
    'cartera030b_obligation_transitions',
    'cartera030b_payment_reconciliations',
    'cartera030b_obligation_conflicts',
    'cartera030b_command_receipts'
  ] loop
    execute format(
      'drop trigger if exists forge_cartera030b_append_only_guard on public.%I',
      table_name
    );
    execute format(
      'create trigger forge_cartera030b_append_only_guard before update or delete on public.%I for each row execute function public.forge_cartera030b_append_only_guard()',
      table_name
    );
  end loop;
end;
$$;

do $$
declare
  table_name text;
begin
  foreach table_name in array array[
    'cartera030b_expected_payment_obligations',
    'cartera030b_obligation_transitions',
    'cartera030b_payment_reconciliations',
    'cartera030b_obligation_conflicts',
    'cartera030b_command_receipts'
  ] loop
    execute format('alter table public.%I enable row level security', table_name);
    execute format('alter table public.%I force row level security', table_name);
    execute format('revoke all on table public.%I from public, anon, authenticated', table_name);
  end loop;
end;
$$;

revoke all on function public.forge_cartera030b_append_only_guard() from public, anon, authenticated;
revoke all on function public.forge_cartera030b_obligation_update_guard() from public, anon, authenticated;

commit;
