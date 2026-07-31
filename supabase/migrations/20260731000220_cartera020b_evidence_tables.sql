-- CARTERA 020B persistent Evidence Inbox, resumable worker and parser-candidate foundation.
-- Repository construction only. This migration is NOT remote deployment authorization.
-- No function in this migration creates CommercialPerson, Policy or PolicyRole truth.

begin;

create extension if not exists pgcrypto;

create table if not exists public.cartera020b_evidence_sources (
  id uuid primary key default gen_random_uuid(),
  advisor_id uuid not null references auth.users(id) on delete restrict,
  source_reference text not null,
  organization_reference text,
  source_type text not null check (source_type in ('UPLOAD', 'SCAN', 'INTEGRATION_IMPORT')),
  original_filename text not null,
  mime_type text not null check (mime_type in ('application/pdf', 'text/plain')),
  byte_size bigint not null check (byte_size between 1 and 26214400),
  document_digest text not null check (document_digest ~ '^[a-f0-9]{64}$'),
  storage_reference text not null,
  purpose text not null,
  received_at timestamptz not null,
  received_by uuid not null references auth.users(id) on delete restrict,
  source_status text not null default 'RECEIVED' check (source_status in ('RECEIVED', 'BLOCKED', 'ARCHIVED')),
  metadata jsonb not null default '{}'::jsonb check (jsonb_typeof(metadata) = 'object'),
  created_at timestamptz not null default now(),
  constraint cartera020b_evidence_sources_reference_ck
    check (source_reference ~ '^[A-Za-z0-9][A-Za-z0-9._:@/-]{0,239}$'),
  constraint cartera020b_evidence_sources_org_ck
    check (organization_reference is null or organization_reference ~ '^[A-Za-z0-9][A-Za-z0-9._:@/-]{0,239}$'),
  constraint cartera020b_evidence_sources_storage_ck
    check (storage_reference ~ '^[A-Za-z0-9][A-Za-z0-9._:@/-]{0,239}$'),
  constraint cartera020b_evidence_sources_purpose_ck
    check (purpose ~ '^[A-Za-z0-9][A-Za-z0-9._:@/-]{0,119}$'),
  constraint cartera020b_evidence_sources_actor_ck check (received_by = advisor_id),
  unique (id, advisor_id),
  unique (advisor_id, source_reference),
  unique (advisor_id, document_digest, purpose)
);

create table if not exists public.cartera020b_evidence_inbox_items (
  id uuid primary key default gen_random_uuid(),
  advisor_id uuid not null references auth.users(id) on delete restrict,
  inbox_reference text not null,
  source_id uuid not null,
  visibility_scope text not null default 'ADVISOR_PRIVATE' check (
    visibility_scope in ('ADVISOR_PRIVATE', 'ADVISOR_AND_AUTHORIZED_OPERATORS', 'ORGANIZATION_REVIEW')
  ),
  status text not null default 'received' check (
    status in (
      'received', 'classified', 'extraction_candidate_created', 'packet_created',
      'confirmation_required', 'confirmed', 'rejected', 'blocked', 'archived'
    )
  ),
  document_type_candidate text not null default 'UNKNOWN' check (
    document_type_candidate in ('POLICY', 'RECEIPT', 'ENDORSEMENT', 'UNKNOWN')
  ),
  classification_state text not null default 'UNKNOWN' check (
    classification_state in ('MATCHED', 'AMBIGUOUS', 'UNKNOWN', 'REVIEW_REQUIRED')
  ),
  classification_confidence numeric check (
    classification_confidence is null or classification_confidence between 0 and 1
  ),
  worker_state text not null default 'AVAILABLE' check (
    worker_state in ('AVAILABLE', 'CLAIMED', 'RETRY_WAIT', 'COMPLETED', 'BLOCKED', 'FAILED_TERMINAL')
  ),
  lease_owner text,
  lease_token uuid,
  lease_expires_at timestamptz,
  retry_count integer not null default 0 check (retry_count >= 0),
  next_retry_at timestamptz,
  last_error_code text,
  state_version integer not null default 1 check (state_version >= 1),
  blocked_reason text,
  warnings jsonb not null default '[]'::jsonb check (jsonb_typeof(warnings) = 'array'),
  metadata jsonb not null default '{}'::jsonb check (jsonb_typeof(metadata) = 'object'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint cartera020b_inbox_reference_ck
    check (inbox_reference ~ '^[A-Za-z0-9][A-Za-z0-9._:@/-]{0,239}$'),
  constraint cartera020b_inbox_lease_owner_ck
    check (lease_owner is null or lease_owner ~ '^[A-Za-z0-9][A-Za-z0-9._:@/-]{0,239}$'),
  constraint cartera020b_inbox_error_code_ck
    check (last_error_code is null or last_error_code ~ '^[A-Za-z0-9][A-Za-z0-9._:@/-]{0,119}$'),
  constraint cartera020b_inbox_blocked_reason_ck
    check (blocked_reason is null or length(blocked_reason) <= 500),
  constraint cartera020b_inbox_claim_shape_ck check (
    (
      worker_state = 'CLAIMED'
      and lease_owner is not null
      and lease_token is not null
      and lease_expires_at is not null
    )
    or
    (
      worker_state <> 'CLAIMED'
      and lease_owner is null
      and lease_token is null
      and lease_expires_at is null
    )
  ),
  constraint cartera020b_inbox_retry_shape_ck check (
    worker_state <> 'RETRY_WAIT' or next_retry_at is not null
  ),
  constraint cartera020b_inbox_source_owner_fk
    foreign key (source_id, advisor_id)
    references public.cartera020b_evidence_sources (id, advisor_id)
    on delete restrict,
  unique (id, advisor_id),
  unique (advisor_id, inbox_reference),
  unique (advisor_id, source_id)
);

create index if not exists cartera020b_inbox_claim_idx
  on public.cartera020b_evidence_inbox_items (
    advisor_id, worker_state, next_retry_at, created_at
  )
  where status not in ('confirmation_required', 'confirmed', 'rejected', 'blocked', 'archived');

create table if not exists public.cartera020b_evidence_transitions (
  id uuid primary key default gen_random_uuid(),
  advisor_id uuid not null references auth.users(id) on delete restrict,
  transition_reference text not null,
  inbox_item_id uuid not null,
  from_status text not null,
  to_status text not null,
  from_worker_state text not null,
  to_worker_state text not null,
  reason_code text not null,
  metadata jsonb not null default '{}'::jsonb check (jsonb_typeof(metadata) = 'object'),
  command_digest text not null check (command_digest ~ '^[a-f0-9]{64}$'),
  idempotency_key text not null,
  occurred_at timestamptz not null,
  actor_id uuid not null references auth.users(id) on delete restrict,
  created_at timestamptz not null default now(),
  constraint cartera020b_transition_reference_ck
    check (transition_reference ~ '^[A-Za-z0-9][A-Za-z0-9._:@/-]{0,239}$'),
  constraint cartera020b_transition_reason_ck
    check (reason_code ~ '^[A-Za-z0-9][A-Za-z0-9._:@/-]{0,119}$'),
  constraint cartera020b_transition_idempotency_ck
    check (idempotency_key ~ '^[A-Za-z0-9][A-Za-z0-9._:@/-]{0,159}$'),
  constraint cartera020b_transition_actor_ck check (actor_id = advisor_id),
  constraint cartera020b_transition_item_owner_fk
    foreign key (inbox_item_id, advisor_id)
    references public.cartera020b_evidence_inbox_items (id, advisor_id)
    on delete restrict,
  unique (id, advisor_id),
  unique (advisor_id, transition_reference),
  unique (advisor_id, idempotency_key)
);

create table if not exists public.cartera020b_extraction_attempts (
  id uuid primary key default gen_random_uuid(),
  advisor_id uuid not null references auth.users(id) on delete restrict,
  attempt_reference text not null,
  inbox_item_id uuid not null,
  provider text not null,
  provider_version text not null,
  extraction_method text not null,
  extraction_status text not null check (
    extraction_status in ('COMPLETE', 'EMPTY', 'FAILED', 'UNSUPPORTED', 'REVIEW_REQUIRED')
  ),
  source_digest text not null check (source_digest ~ '^[a-f0-9]{64}$'),
  page_count integer check (page_count is null or page_count >= 0),
  text_available boolean not null default false,
  text_digest text check (text_digest is null or text_digest ~ '^[a-f0-9]{64}$'),
  output_reference text,
  warnings jsonb not null default '[]'::jsonb check (jsonb_typeof(warnings) = 'array'),
  errors jsonb not null default '[]'::jsonb check (jsonb_typeof(errors) = 'array'),
  started_at timestamptz not null,
  completed_at timestamptz not null,
  created_at timestamptz not null default now(),
  constraint cartera020b_attempt_reference_ck
    check (attempt_reference ~ '^[A-Za-z0-9][A-Za-z0-9._:@/-]{0,239}$'),
  constraint cartera020b_attempt_provider_ck
    check (provider ~ '^[A-Za-z0-9][A-Za-z0-9._:@/-]{0,119}$'),
  constraint cartera020b_attempt_provider_version_ck
    check (provider_version ~ '^[A-Za-z0-9][A-Za-z0-9._:@/-]{0,119}$'),
  constraint cartera020b_attempt_method_ck
    check (extraction_method ~ '^[A-Za-z0-9][A-Za-z0-9._:@/-]{0,119}$'),
  constraint cartera020b_attempt_output_ck
    check (output_reference is null or output_reference ~ '^[A-Za-z0-9][A-Za-z0-9._:@/-]{0,239}$'),
  constraint cartera020b_attempt_time_ck check (completed_at >= started_at),
  constraint cartera020b_attempt_text_ck check (
    (text_available and text_digest is not null and output_reference is not null)
    or
    (not text_available and text_digest is null)
  ),
  constraint cartera020b_attempt_item_owner_fk
    foreign key (inbox_item_id, advisor_id)
    references public.cartera020b_evidence_inbox_items (id, advisor_id)
    on delete restrict,
  unique (id, advisor_id),
  unique (advisor_id, attempt_reference)
);

create table if not exists public.cartera020b_extraction_candidates (
  id uuid primary key default gen_random_uuid(),
  advisor_id uuid not null references auth.users(id) on delete restrict,
  candidate_reference text not null,
  inbox_item_id uuid not null,
  attempt_id uuid,
  candidate_type text not null check (candidate_type in ('POLICY', 'UNKNOWN')),
  classification jsonb not null check (jsonb_typeof(classification) = 'object'),
  extracted_fields jsonb not null check (jsonb_typeof(extracted_fields) = 'object'),
  overall_confidence numeric check (overall_confidence is null or overall_confidence between 0 and 1),
  extraction_source text not null,
  parser_id text,
  parser_version text,
  warnings jsonb not null default '[]'::jsonb check (jsonb_typeof(warnings) = 'array'),
  missing_fields jsonb not null default '[]'::jsonb check (jsonb_typeof(missing_fields) = 'array'),
  creates_truth boolean not null default false check (creates_truth = false),
  created_at timestamptz not null default now(),
  constraint cartera020b_candidate_reference_ck
    check (candidate_reference ~ '^[A-Za-z0-9][A-Za-z0-9._:@/-]{0,239}$'),
  constraint cartera020b_candidate_source_ck
    check (extraction_source ~ '^[A-Za-z0-9][A-Za-z0-9._:@/-]{0,119}$'),
  constraint cartera020b_candidate_parser_ck check (
    (parser_id is null and parser_version is null)
    or
    (
      parser_id ~ '^[A-Za-z0-9][A-Za-z0-9._:@/-]{0,119}$'
      and parser_version ~ '^[A-Za-z0-9][A-Za-z0-9._:@/-]{0,119}$'
    )
  ),
  constraint cartera020b_candidate_item_owner_fk
    foreign key (inbox_item_id, advisor_id)
    references public.cartera020b_evidence_inbox_items (id, advisor_id)
    on delete restrict,
  constraint cartera020b_candidate_attempt_owner_fk
    foreign key (attempt_id, advisor_id)
    references public.cartera020b_extraction_attempts (id, advisor_id)
    on delete restrict,
  unique (id, advisor_id),
  unique (advisor_id, candidate_reference)
);

create table if not exists public.cartera020b_policy_evidence_packets (
  id uuid primary key default gen_random_uuid(),
  advisor_id uuid not null references auth.users(id) on delete restrict,
  packet_reference text not null,
  inbox_item_id uuid not null,
  candidate_id uuid not null,
  document_type text not null check (document_type in ('POLICY', 'UNKNOWN')),
  extracted_fields jsonb not null check (jsonb_typeof(extracted_fields) = 'object'),
  extraction_confidence numeric check (extraction_confidence is null or extraction_confidence between 0 and 1),
  warnings jsonb not null default '[]'::jsonb check (jsonb_typeof(warnings) = 'array'),
  identity_candidates jsonb not null default '[]'::jsonb check (jsonb_typeof(identity_candidates) = 'array'),
  policy_role_candidates jsonb not null default '[]'::jsonb check (jsonb_typeof(policy_role_candidates) = 'array'),
  existing_policy_candidates jsonb not null default '[]'::jsonb check (jsonb_typeof(existing_policy_candidates) = 'array'),
  confirmation_state text not null default 'PENDING_CONFIRMATION' check (
    confirmation_state = 'PENDING_CONFIRMATION'
  ),
  creates_truth boolean not null default false check (creates_truth = false),
  created_at timestamptz not null default now(),
  constraint cartera020b_packet_reference_ck
    check (packet_reference ~ '^[A-Za-z0-9][A-Za-z0-9._:@/-]{0,239}$'),
  constraint cartera020b_packet_item_owner_fk
    foreign key (inbox_item_id, advisor_id)
    references public.cartera020b_evidence_inbox_items (id, advisor_id)
    on delete restrict,
  constraint cartera020b_packet_candidate_owner_fk
    foreign key (candidate_id, advisor_id)
    references public.cartera020b_extraction_candidates (id, advisor_id)
    on delete restrict,
  unique (id, advisor_id),
  unique (advisor_id, packet_reference),
  unique (advisor_id, candidate_id)
);

create table if not exists public.cartera020b_command_receipts (
  id uuid primary key default gen_random_uuid(),
  advisor_id uuid not null references auth.users(id) on delete restrict,
  command_type text not null,
  idempotency_key text not null,
  command_digest text not null check (command_digest ~ '^[a-f0-9]{64}$'),
  response_payload jsonb not null check (jsonb_typeof(response_payload) = 'object'),
  created_at timestamptz not null default now(),
  constraint cartera020b_receipt_command_type_ck
    check (command_type in ('ADMIT_EVIDENCE', 'RECORD_PROCESSING_RESULT')),
  constraint cartera020b_receipt_idempotency_ck
    check (idempotency_key ~ '^[A-Za-z0-9][A-Za-z0-9._:@/-]{0,159}$'),
  unique (id, advisor_id),
  unique (advisor_id, command_type, idempotency_key)
);

create table if not exists public.cartera020b_command_conflicts (
  id uuid primary key default gen_random_uuid(),
  advisor_id uuid not null references auth.users(id) on delete restrict,
  conflict_reference text not null,
  command_type text not null,
  idempotency_key text not null,
  existing_digest text not null check (existing_digest ~ '^[a-f0-9]{64}$'),
  received_digest text not null check (received_digest ~ '^[a-f0-9]{64}$'),
  reason_code text not null default 'CHANGED_INPUT_REPLAY',
  created_at timestamptz not null default now(),
  constraint cartera020b_conflict_reference_ck
    check (conflict_reference ~ '^[A-Za-z0-9][A-Za-z0-9._:@/-]{0,239}$'),
  constraint cartera020b_conflict_command_type_ck
    check (command_type in ('ADMIT_EVIDENCE', 'RECORD_PROCESSING_RESULT')),
  constraint cartera020b_conflict_idempotency_ck
    check (idempotency_key ~ '^[A-Za-z0-9][A-Za-z0-9._:@/-]{0,159}$'),
  constraint cartera020b_conflict_reason_ck
    check (reason_code = 'CHANGED_INPUT_REPLAY'),
  unique (id, advisor_id),
  unique (advisor_id, conflict_reference)
);

commit;