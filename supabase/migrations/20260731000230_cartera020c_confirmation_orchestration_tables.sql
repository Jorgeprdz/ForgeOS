-- CARTERA 020C.3 persistent confirmation orchestration foundation.
-- Repository implementation only. This migration is NOT remote deployment authorization.
-- Canonical Person, Account, Policy and PolicyRole writes remain owned by accepted 010B RPCs.

begin;

create extension if not exists pgcrypto;

create table if not exists public.cartera020c_confirmation_reviews (
  id uuid primary key default gen_random_uuid(),
  advisor_id uuid not null references auth.users(id) on delete restrict,
  review_reference text not null,
  packet_id uuid not null,
  packet_reference text not null,
  inbox_item_id uuid not null,
  source_reference text not null,
  request_idempotency_key text not null,
  identity_batch_digest text not null check (identity_batch_digest ~ '^[a-f0-9]{64}$'),
  identity_account_decisions jsonb not null default '[]'::jsonb
    check (jsonb_typeof(identity_account_decisions) = 'array'),
  policy_request_idempotency_key text,
  policy_composition_digest text check (
    policy_composition_digest is null or policy_composition_digest ~ '^[a-f0-9]{64}$'
  ),
  policy_requested_at timestamptz,
  policy_requested_by uuid references auth.users(id) on delete restrict,
  state text not null check (
    state in (
      'IDENTITY_READY', 'IDENTITY_EXECUTING', 'IDENTITY_CONFIRMED',
      'POLICY_READY', 'POLICY_EXECUTING', 'RETRY_WAIT',
      'BLOCKED', 'REJECTED', 'CONFIRMED'
    )
  ),
  state_version integer not null default 1 check (state_version >= 1),
  identity_command_count integer not null default 0 check (identity_command_count >= 0),
  identity_success_count integer not null default 0 check (
    identity_success_count >= 0 and identity_success_count <= identity_command_count
  ),
  policy_command_count integer not null default 0 check (policy_command_count in (0, 1)),
  active_sequence integer check (active_sequence is null or active_sequence >= 1),
  total_attempt_count integer not null default 0 check (total_attempt_count >= 0),
  retry_count integer not null default 0 check (retry_count >= 0),
  next_retry_at timestamptz,
  last_error_code text,
  blocked_reason text,
  confirmed_policy_reference text,
  confirmed_policy_version_reference text,
  confirmed_evidence_version_reference text,
  requested_at timestamptz not null,
  requested_by uuid not null references auth.users(id) on delete restrict,
  confirmed_at timestamptz,
  creates_truth boolean not null default false check (creates_truth = false),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint cartera020c_review_reference_ck
    check (review_reference ~ '^[A-Za-z0-9][A-Za-z0-9._:@/-]{0,239}$'),
  constraint cartera020c_review_packet_reference_ck
    check (packet_reference ~ '^[A-Za-z0-9][A-Za-z0-9._:@/-]{0,239}$'),
  constraint cartera020c_review_source_reference_ck
    check (source_reference ~ '^[A-Za-z0-9][A-Za-z0-9._:@/-]{0,239}$'),
  constraint cartera020c_review_request_idempotency_ck
    check (request_idempotency_key ~ '^[A-Za-z0-9][A-Za-z0-9._:@/-]{0,159}$'),
  constraint cartera020c_review_policy_request_idempotency_ck
    check (policy_request_idempotency_key is null or policy_request_idempotency_key ~ '^[A-Za-z0-9][A-Za-z0-9._:@/-]{0,159}$'),
  constraint cartera020c_review_policy_request_actor_ck
    check (policy_requested_by is null or policy_requested_by = advisor_id),
  constraint cartera020c_review_policy_request_shape_ck check (
    (policy_request_idempotency_key is null and policy_composition_digest is null
      and policy_requested_at is null and policy_requested_by is null and policy_command_count = 0)
    or
    (policy_request_idempotency_key is not null and policy_composition_digest is not null
      and policy_requested_at is not null and policy_requested_by = advisor_id and policy_command_count = 1)
  ),
  constraint cartera020c_review_last_error_ck
    check (last_error_code is null or last_error_code ~ '^[A-Za-z0-9][A-Za-z0-9._:@/-]{0,159}$'),
  constraint cartera020c_review_blocked_reason_ck
    check (blocked_reason is null or length(blocked_reason) <= 500),
  constraint cartera020c_review_policy_reference_ck
    check (confirmed_policy_reference is null or confirmed_policy_reference ~ '^[A-Za-z0-9][A-Za-z0-9._:@/-]{0,239}$'),
  constraint cartera020c_review_policy_version_reference_ck
    check (confirmed_policy_version_reference is null or confirmed_policy_version_reference ~ '^[A-Za-z0-9][A-Za-z0-9._:@/-]{0,239}$'),
  constraint cartera020c_review_evidence_version_reference_ck
    check (confirmed_evidence_version_reference is null or confirmed_evidence_version_reference ~ '^[A-Za-z0-9][A-Za-z0-9._:@/-]{0,239}$'),
  constraint cartera020c_review_actor_ck check (requested_by = advisor_id),
  constraint cartera020c_review_retry_shape_ck check (
    state <> 'RETRY_WAIT' or next_retry_at is not null
  ),
  constraint cartera020c_review_confirmed_shape_ck check (
    state <> 'CONFIRMED'
    or (
      confirmed_at is not null
      and confirmed_policy_reference is not null
      and confirmed_policy_version_reference is not null
      and confirmed_evidence_version_reference is not null
    )
  ),
  constraint cartera020c_review_packet_owner_fk
    foreign key (packet_id, advisor_id)
    references public.cartera020b_policy_evidence_packets (id, advisor_id)
    on delete restrict,
  constraint cartera020c_review_inbox_owner_fk
    foreign key (inbox_item_id, advisor_id)
    references public.cartera020b_evidence_inbox_items (id, advisor_id)
    on delete restrict,
  unique (id, advisor_id),
  unique (advisor_id, review_reference),
  unique (advisor_id, packet_id),
  unique (advisor_id, request_idempotency_key)
);

create unique index if not exists cartera020c_review_policy_request_idempotency_uq
  on public.cartera020c_confirmation_reviews (advisor_id, policy_request_idempotency_key)
  where policy_request_idempotency_key is not null;

create table if not exists public.cartera020c_confirmation_commands (
  id uuid primary key default gen_random_uuid(),
  advisor_id uuid not null references auth.users(id) on delete restrict,
  command_reference text not null,
  review_id uuid not null,
  sequence_number integer not null check (sequence_number >= 1),
  stage text not null check (stage in ('IDENTITY_RESOLUTION', 'CONFIRMED_POLICY')),
  candidate_reference text,
  command_type text not null check (command_type in ('IDENTITY_RESOLUTION', 'CONFIRMED_POLICY')),
  idempotency_key text not null,
  command_digest text not null check (command_digest ~ '^[a-f0-9]{64}$'),
  command_payload jsonb not null check (jsonb_typeof(command_payload) = 'object'),
  expected_result jsonb not null default '{}'::jsonb check (jsonb_typeof(expected_result) = 'object'),
  contains_restricted_data boolean not null default false,
  status text not null default 'PENDING' check (
    status in ('PENDING', 'EXECUTING', 'SUCCEEDED', 'CONFLICT', 'RETRY_WAIT', 'FAILED_TERMINAL')
  ),
  attempt_count integer not null default 0 check (attempt_count >= 0),
  next_retry_at timestamptz,
  last_error_code text,
  receipt_payload jsonb,
  result_digest text check (result_digest is null or result_digest ~ '^[a-f0-9]{64}$'),
  executed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint cartera020c_command_reference_ck
    check (command_reference ~ '^[A-Za-z0-9][A-Za-z0-9._:@/-]{0,239}$'),
  constraint cartera020c_command_candidate_reference_ck
    check (candidate_reference is null or candidate_reference ~ '^[A-Za-z0-9][A-Za-z0-9._:@/-]{0,239}$'),
  constraint cartera020c_command_idempotency_ck
    check (idempotency_key ~ '^[A-Za-z0-9][A-Za-z0-9._:@/-]{0,159}$'),
  constraint cartera020c_command_last_error_ck
    check (last_error_code is null or last_error_code ~ '^[A-Za-z0-9][A-Za-z0-9._:@/-]{0,159}$'),
  constraint cartera020c_command_stage_type_ck check (stage = command_type),
  constraint cartera020c_command_candidate_shape_ck check (
    (stage = 'IDENTITY_RESOLUTION' and candidate_reference is not null)
    or (stage = 'CONFIRMED_POLICY' and candidate_reference is null)
  ),
  constraint cartera020c_command_retry_shape_ck check (
    status <> 'RETRY_WAIT' or next_retry_at is not null
  ),
  constraint cartera020c_command_receipt_shape_ck check (
    (status = 'SUCCEEDED' and receipt_payload is not null and result_digest is not null and executed_at is not null)
    or status <> 'SUCCEEDED'
  ),
  constraint cartera020c_command_review_owner_fk
    foreign key (review_id, advisor_id)
    references public.cartera020c_confirmation_reviews (id, advisor_id)
    on delete restrict,
  unique (id, advisor_id),
  unique (advisor_id, command_reference),
  unique (advisor_id, command_type, idempotency_key),
  unique (review_id, sequence_number)
);

create index if not exists cartera020c_commands_next_idx
  on public.cartera020c_confirmation_commands (
    advisor_id, review_id, status, next_retry_at, sequence_number
  );

create table if not exists public.cartera020c_confirmation_attempts (
  id uuid primary key default gen_random_uuid(),
  advisor_id uuid not null references auth.users(id) on delete restrict,
  attempt_reference text not null,
  review_id uuid not null,
  command_id uuid not null,
  attempt_number integer not null check (attempt_number >= 1),
  attempt_state text not null check (
    attempt_state in ('SUCCEEDED', 'CONFLICT', 'RETRY_SCHEDULED', 'FAILED_TERMINAL')
  ),
  error_code text,
  receipt_digest text check (receipt_digest is null or receipt_digest ~ '^[a-f0-9]{64}$'),
  metadata jsonb not null default '{}'::jsonb check (jsonb_typeof(metadata) = 'object'),
  started_at timestamptz not null,
  completed_at timestamptz not null,
  actor_id uuid not null references auth.users(id) on delete restrict,
  created_at timestamptz not null default now(),
  constraint cartera020c_attempt_reference_ck
    check (attempt_reference ~ '^[A-Za-z0-9][A-Za-z0-9._:@/-]{0,239}$'),
  constraint cartera020c_attempt_error_ck
    check (error_code is null or error_code ~ '^[A-Za-z0-9][A-Za-z0-9._:@/-]{0,159}$'),
  constraint cartera020c_attempt_actor_ck check (actor_id = advisor_id),
  constraint cartera020c_attempt_time_ck check (completed_at >= started_at),
  constraint cartera020c_attempt_review_owner_fk
    foreign key (review_id, advisor_id)
    references public.cartera020c_confirmation_reviews (id, advisor_id)
    on delete restrict,
  constraint cartera020c_attempt_command_owner_fk
    foreign key (command_id, advisor_id)
    references public.cartera020c_confirmation_commands (id, advisor_id)
    on delete restrict,
  unique (id, advisor_id),
  unique (advisor_id, attempt_reference),
  unique (command_id, attempt_number)
);

create table if not exists public.cartera020c_confirmation_transitions (
  id uuid primary key default gen_random_uuid(),
  advisor_id uuid not null references auth.users(id) on delete restrict,
  transition_reference text not null,
  review_id uuid not null,
  from_state text not null,
  to_state text not null,
  event_type text not null,
  sequence_number integer,
  reason_code text not null,
  state_version integer not null check (state_version >= 1),
  metadata jsonb not null default '{}'::jsonb check (jsonb_typeof(metadata) = 'object'),
  occurred_at timestamptz not null,
  actor_id uuid not null references auth.users(id) on delete restrict,
  created_at timestamptz not null default now(),
  constraint cartera020c_transition_reference_ck
    check (transition_reference ~ '^[A-Za-z0-9][A-Za-z0-9._:@/-]{0,239}$'),
  constraint cartera020c_transition_event_ck
    check (event_type ~ '^[A-Za-z0-9][A-Za-z0-9._:@/-]{0,119}$'),
  constraint cartera020c_transition_reason_ck
    check (reason_code ~ '^[A-Za-z0-9][A-Za-z0-9._:@/-]{0,159}$'),
  constraint cartera020c_transition_sequence_ck
    check (sequence_number is null or sequence_number >= 1),
  constraint cartera020c_transition_actor_ck check (actor_id = advisor_id),
  constraint cartera020c_transition_review_owner_fk
    foreign key (review_id, advisor_id)
    references public.cartera020c_confirmation_reviews (id, advisor_id)
    on delete restrict,
  unique (id, advisor_id),
  unique (advisor_id, transition_reference),
  unique (review_id, state_version)
);

create table if not exists public.cartera020c_confirmation_conflicts (
  id uuid primary key default gen_random_uuid(),
  advisor_id uuid not null references auth.users(id) on delete restrict,
  conflict_reference text not null,
  review_reference text not null,
  conflict_type text not null check (
    conflict_type in (
      'CHANGED_INPUT_REPLAY', 'IDENTITY_RESULT_CONFLICT',
      'IDENTITY_READ_AFTER_WRITE_MISMATCH', 'POLICY_RESULT_CONFLICT',
      'POLICY_READ_AFTER_WRITE_MISMATCH', 'EXECUTION_FAILED_TERMINAL'
    )
  ),
  idempotency_key text not null,
  existing_digest text,
  incoming_digest text not null check (incoming_digest ~ '^[a-f0-9]{64}$'),
  command_reference text,
  recorded_at timestamptz not null,
  recorded_by uuid not null references auth.users(id) on delete restrict,
  created_at timestamptz not null default now(),
  constraint cartera020c_conflict_reference_ck
    check (conflict_reference ~ '^[A-Za-z0-9][A-Za-z0-9._:@/-]{0,239}$'),
  constraint cartera020c_conflict_review_reference_ck
    check (review_reference ~ '^[A-Za-z0-9][A-Za-z0-9._:@/-]{0,239}$'),
  constraint cartera020c_conflict_idempotency_ck
    check (idempotency_key ~ '^[A-Za-z0-9][A-Za-z0-9._:@/-]{0,159}$'),
  constraint cartera020c_conflict_existing_digest_ck
    check (existing_digest is null or existing_digest ~ '^[a-f0-9]{64}$'),
  constraint cartera020c_conflict_command_reference_ck
    check (command_reference is null or command_reference ~ '^[A-Za-z0-9][A-Za-z0-9._:@/-]{0,239}$'),
  constraint cartera020c_conflict_actor_ck check (recorded_by = advisor_id),
  unique (id, advisor_id),
  unique (advisor_id, conflict_reference)
);

comment on table public.cartera020c_confirmation_reviews is
  'Owner-scoped durable CARTERA 020C review lifecycle. This table is operational authority, not Person, Account, Policy or PolicyRole truth.';
comment on table public.cartera020c_confirmation_commands is
  'Ordered owner-private command queue. Payloads are never projected by the general status RPC.';
comment on table public.cartera020c_confirmation_attempts is
  'Append-only execution attempts with minimal metadata and receipt digests.';
comment on table public.cartera020c_confirmation_transitions is
  'Append-only lifecycle transitions without beneficiary or contact values.';

commit;
