-- CARTERA 010B.2 COMMERCIAL PERSON / POLICY ROLE PERSISTENCE FOUNDATION
-- Repository implementation only. This migration is NOT remote deployment authorization.
-- Canonical mutation remains blocked until governed command RPCs are added and accepted.

begin;

create extension if not exists pgcrypto;

create table if not exists public.commercial_people (
  id uuid primary key default gen_random_uuid(),
  advisor_id uuid not null references auth.users(id) on delete restrict,
  person_reference text not null,
  display_name text not null,
  preferred_name text,
  normalized_name text not null,
  verified_phone text,
  verified_email text,
  birth_date date,
  lifecycle_state text not null check (
    lifecycle_state in ('CANDIDATE', 'CONFIRMED', 'DISPUTED', 'ARCHIVED')
  ),
  privacy_classification text not null check (
    privacy_classification in ('PRIVATE', 'SENSITIVE', 'RESTRICTED')
  ),
  evidence_references jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  created_by uuid not null references auth.users(id) on delete restrict,
  updated_at timestamptz not null default now(),
  version integer not null default 1 check (version >= 1),
  archived_at timestamptz,
  archived_by uuid references auth.users(id) on delete restrict,
  archive_reason text,
  constraint commercial_people_reference_ck
    check (person_reference ~ '^[A-Za-z0-9][A-Za-z0-9._:@/-]{0,239}$'),
  constraint commercial_people_display_name_ck
    check (nullif(btrim(display_name), '') is not null and length(display_name) <= 240),
  constraint commercial_people_preferred_name_ck
    check (preferred_name is null or length(preferred_name) <= 160),
  constraint commercial_people_normalized_name_ck
    check (nullif(btrim(normalized_name), '') is not null and length(normalized_name) <= 240),
  constraint commercial_people_verified_phone_ck
    check (verified_phone is null or length(verified_phone) <= 40),
  constraint commercial_people_verified_email_ck
    check (verified_email is null or length(verified_email) <= 320),
  constraint commercial_people_evidence_array_ck
    check (jsonb_typeof(evidence_references) = 'array'),
  constraint commercial_people_owner_actor_ck
    check (created_by = advisor_id),
  constraint commercial_people_archive_metadata_ck
    check (
      (
        lifecycle_state <> 'ARCHIVED'
        and archived_at is null
        and archived_by is null
        and archive_reason is null
      )
      or
      (
        lifecycle_state = 'ARCHIVED'
        and archived_at is not null
        and archived_by = advisor_id
        and nullif(btrim(archive_reason), '') is not null
      )
    ),
  unique (id, advisor_id),
  unique (advisor_id, person_reference)
);

create index if not exists commercial_people_matching_idx
  on public.commercial_people (
    advisor_id,
    normalized_name,
    verified_phone,
    verified_email
  )
  where archived_at is null;

create table if not exists public.identity_resolution_decisions (
  id uuid primary key default gen_random_uuid(),
  advisor_id uuid not null references auth.users(id) on delete restrict,
  decision_reference text not null,
  source_domain text not null,
  source_identity_type text not null,
  source_record_reference text not null,
  prospect_id uuid,
  outcome text not null check (
    outcome in (
      'MATCH_CANDIDATE',
      'LINK_CONFIRMED',
      'CREATE_CONFIRMED',
      'UNRESOLVED',
      'REJECTED_MATCH',
      'CONFLICT',
      'CORRECTED'
    )
  ),
  resolved_person_id uuid,
  candidate_person_references jsonb not null default '[]'::jsonb,
  evidence_references jsonb not null,
  reason_code text not null,
  command_digest text not null,
  idempotency_key text not null,
  decided_at timestamptz not null,
  decided_by uuid not null references auth.users(id) on delete restrict,
  correction_of uuid,
  created_at timestamptz not null default now(),
  constraint identity_resolution_decisions_reference_ck
    check (decision_reference ~ '^[A-Za-z0-9][A-Za-z0-9._:@/-]{0,239}$'),
  constraint identity_resolution_decisions_source_domain_ck
    check (source_domain ~ '^[A-Za-z0-9][A-Za-z0-9._:@/-]{0,119}$'),
  constraint identity_resolution_decisions_source_type_ck
    check (source_identity_type ~ '^[A-Za-z0-9][A-Za-z0-9._:@/-]{0,119}$'),
  constraint identity_resolution_decisions_source_record_ck
    check (source_record_reference ~ '^[A-Za-z0-9][A-Za-z0-9._:@/-]{0,239}$'),
  constraint identity_resolution_decisions_candidate_array_ck
    check (jsonb_typeof(candidate_person_references) = 'array'),
  constraint identity_resolution_decisions_evidence_array_ck
    check (
      jsonb_typeof(evidence_references) = 'array'
      and jsonb_array_length(evidence_references) >= 1
    ),
  constraint identity_resolution_decisions_reason_ck
    check (reason_code ~ '^[A-Za-z0-9][A-Za-z0-9._:@/-]{0,119}$'),
  constraint identity_resolution_decisions_digest_ck
    check (command_digest ~ '^[a-f0-9]{64}$'),
  constraint identity_resolution_decisions_idempotency_ck
    check (idempotency_key ~ '^[A-Za-z0-9][A-Za-z0-9._:@/-]{0,159}$'),
  constraint identity_resolution_decisions_actor_ck
    check (decided_by = advisor_id),
  constraint identity_resolution_decisions_resolution_ck
    check (
      (
        outcome in ('LINK_CONFIRMED', 'CREATE_CONFIRMED', 'CORRECTED')
        and resolved_person_id is not null
      )
      or
      (
        outcome not in ('LINK_CONFIRMED', 'CREATE_CONFIRMED', 'CORRECTED')
        and resolved_person_id is null
      )
    ),
  constraint identity_resolution_decisions_prospect_owner_fk
    foreign key (prospect_id, advisor_id)
    references public.prospects (id, advisor_id)
    on delete restrict,
  constraint identity_resolution_decisions_person_owner_fk
    foreign key (resolved_person_id, advisor_id)
    references public.commercial_people (id, advisor_id)
    on delete restrict,
  constraint identity_resolution_decisions_correction_owner_fk
    foreign key (correction_of, advisor_id)
    references public.identity_resolution_decisions (id, advisor_id)
    on delete restrict,
  unique (id, advisor_id),
  unique (advisor_id, decision_reference),
  unique (advisor_id, idempotency_key)
);

create index if not exists identity_resolution_decisions_source_idx
  on public.identity_resolution_decisions (
    advisor_id,
    source_domain,
    source_identity_type,
    source_record_reference,
    decided_at desc
  );

create table if not exists public.commercial_source_identity_links (
  id uuid primary key default gen_random_uuid(),
  advisor_id uuid not null references auth.users(id) on delete restrict,
  link_reference text not null,
  person_id uuid not null,
  source_domain text not null,
  source_identity_type text not null,
  source_record_reference text not null,
  prospect_id uuid,
  match_status text not null check (
    match_status in ('LINK_CONFIRMED', 'CREATE_CONFIRMED', 'CORRECTED')
  ),
  decision_id uuid not null,
  evidence_references jsonb not null,
  idempotency_key text not null,
  command_digest text not null,
  effective_from timestamptz not null,
  effective_to timestamptz,
  correction_of uuid,
  created_at timestamptz not null default now(),
  created_by uuid not null references auth.users(id) on delete restrict,
  constraint commercial_source_identity_links_reference_ck
    check (link_reference ~ '^[A-Za-z0-9][A-Za-z0-9._:@/-]{0,239}$'),
  constraint commercial_source_identity_links_source_domain_ck
    check (source_domain ~ '^[A-Za-z0-9][A-Za-z0-9._:@/-]{0,119}$'),
  constraint commercial_source_identity_links_source_type_ck
    check (source_identity_type ~ '^[A-Za-z0-9][A-Za-z0-9._:@/-]{0,119}$'),
  constraint commercial_source_identity_links_source_record_ck
    check (source_record_reference ~ '^[A-Za-z0-9][A-Za-z0-9._:@/-]{0,239}$'),
  constraint commercial_source_identity_links_prospect_source_ck
    check (
      source_identity_type <> 'PROSPECT'
      or prospect_id is not null
    ),
  constraint commercial_source_identity_links_evidence_ck
    check (
      jsonb_typeof(evidence_references) = 'array'
      and jsonb_array_length(evidence_references) >= 1
    ),
  constraint commercial_source_identity_links_idempotency_ck
    check (idempotency_key ~ '^[A-Za-z0-9][A-Za-z0-9._:@/-]{0,159}$'),
  constraint commercial_source_identity_links_digest_ck
    check (command_digest ~ '^[a-f0-9]{64}$'),
  constraint commercial_source_identity_links_effective_range_ck
    check (effective_to is null or effective_to > effective_from),
  constraint commercial_source_identity_links_actor_ck
    check (created_by = advisor_id),
  constraint commercial_source_identity_links_person_owner_fk
    foreign key (person_id, advisor_id)
    references public.commercial_people (id, advisor_id)
    on delete restrict,
  constraint commercial_source_identity_links_decision_owner_fk
    foreign key (decision_id, advisor_id)
    references public.identity_resolution_decisions (id, advisor_id)
    on delete restrict,
  constraint commercial_source_identity_links_prospect_owner_fk
    foreign key (prospect_id, advisor_id)
    references public.prospects (id, advisor_id)
    on delete restrict,
  constraint commercial_source_identity_links_correction_owner_fk
    foreign key (correction_of, advisor_id)
    references public.commercial_source_identity_links (id, advisor_id)
    on delete restrict,
  unique (id, advisor_id),
  unique (advisor_id, link_reference),
  unique (advisor_id, idempotency_key)
);

create unique index if not exists
  commercial_source_identity_links_active_source_uq
on public.commercial_source_identity_links (
  advisor_id,
  source_domain,
  source_identity_type,
  source_record_reference
)
where effective_to is null;

create unique index if not exists
  commercial_source_identity_links_active_prospect_uq
on public.commercial_source_identity_links (
  advisor_id,
  prospect_id
)
where prospect_id is not null and effective_to is null;

create table if not exists public.commercial_accounts (
  id uuid primary key default gen_random_uuid(),
  advisor_id uuid not null references auth.users(id) on delete restrict,
  account_reference text not null,
  account_type text not null check (
    account_type in (
      'INDIVIDUAL',
      'HOUSEHOLD',
      'BUSINESS',
      'CORPORATE',
      'FAMILY_BUSINESS',
      'GROUP_AFFINITY'
    )
  ),
  display_label text not null,
  lifecycle_state text not null check (
    lifecycle_state in ('CANDIDATE', 'CONFIRMED', 'DISPUTED', 'ARCHIVED')
  ),
  privacy_classification text not null check (
    privacy_classification in ('PRIVATE', 'SENSITIVE', 'RESTRICTED')
  ),
  evidence_references jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  created_by uuid not null references auth.users(id) on delete restrict,
  updated_at timestamptz not null default now(),
  version integer not null default 1 check (version >= 1),
  archived_at timestamptz,
  archived_by uuid references auth.users(id) on delete restrict,
  archive_reason text,
  constraint commercial_accounts_reference_ck
    check (account_reference ~ '^[A-Za-z0-9][A-Za-z0-9._:@/-]{0,239}$'),
  constraint commercial_accounts_label_ck
    check (nullif(btrim(display_label), '') is not null and length(display_label) <= 240),
  constraint commercial_accounts_evidence_array_ck
    check (jsonb_typeof(evidence_references) = 'array'),
  constraint commercial_accounts_actor_ck
    check (created_by = advisor_id),
  constraint commercial_accounts_archive_metadata_ck
    check (
      (
        lifecycle_state <> 'ARCHIVED'
        and archived_at is null
        and archived_by is null
        and archive_reason is null
      )
      or
      (
        lifecycle_state = 'ARCHIVED'
        and archived_at is not null
        and archived_by = advisor_id
        and nullif(btrim(archive_reason), '') is not null
      )
    ),
  unique (id, advisor_id),
  unique (advisor_id, account_reference)
);

create table if not exists public.commercial_account_memberships (
  id uuid primary key default gen_random_uuid(),
  advisor_id uuid not null references auth.users(id) on delete restrict,
  membership_reference text not null,
  account_id uuid not null,
  person_id uuid not null,
  relationship_role text not null,
  confirmation_state text not null check (
    confirmation_state in ('CONFIRMED', 'PROPOSED', 'DISPUTED', 'CORRECTED')
  ),
  privacy_classification text not null check (
    privacy_classification in ('PRIVATE', 'SENSITIVE', 'RESTRICTED')
  ),
  evidence_references jsonb not null,
  effective_from timestamptz not null,
  effective_to timestamptz,
  correction_of uuid,
  created_at timestamptz not null default now(),
  created_by uuid not null references auth.users(id) on delete restrict,
  constraint commercial_account_memberships_reference_ck
    check (membership_reference ~ '^[A-Za-z0-9][A-Za-z0-9._:@/-]{0,239}$'),
  constraint commercial_account_memberships_role_ck
    check (relationship_role ~ '^[A-Za-z0-9][A-Za-z0-9._:@/-]{0,119}$'),
  constraint commercial_account_memberships_evidence_ck
    check (
      jsonb_typeof(evidence_references) = 'array'
      and jsonb_array_length(evidence_references) >= 1
    ),
  constraint commercial_account_memberships_range_ck
    check (effective_to is null or effective_to > effective_from),
  constraint commercial_account_memberships_actor_ck
    check (created_by = advisor_id),
  constraint commercial_account_memberships_account_owner_fk
    foreign key (account_id, advisor_id)
    references public.commercial_accounts (id, advisor_id)
    on delete restrict,
  constraint commercial_account_memberships_person_owner_fk
    foreign key (person_id, advisor_id)
    references public.commercial_people (id, advisor_id)
    on delete restrict,
  constraint commercial_account_memberships_correction_owner_fk
    foreign key (correction_of, advisor_id)
    references public.commercial_account_memberships (id, advisor_id)
    on delete restrict,
  unique (id, advisor_id),
  unique (advisor_id, membership_reference)
);

create unique index if not exists
  commercial_account_memberships_active_uq
on public.commercial_account_memberships (
  advisor_id,
  account_id,
  person_id,
  relationship_role
)
where effective_to is null;

create table if not exists public.canonical_policies (
  id uuid primary key default gen_random_uuid(),
  advisor_id uuid not null references auth.users(id) on delete restrict,
  policy_reference text not null,
  carrier_reference text not null,
  policy_number text not null,
  product_reference text not null,
  issue_date date,
  effective_from timestamptz,
  effective_to timestamptz,
  status_value text not null check (
    status_value in (
      'PENDING',
      'ISSUED',
      'ACTIVE',
      'SUSPENDED',
      'LAPSED',
      'CANCELLED',
      'MATURED',
      'CLAIMED',
      'UNKNOWN'
    )
  ),
  status_source text not null,
  status_as_of timestamptz not null,
  currency text,
  premium_amount numeric,
  payment_frequency text,
  sum_insured numeric,
  completeness_state text not null check (
    completeness_state in ('COMPLETE', 'PARTIAL', 'UNKNOWN')
  ),
  freshness_state text not null check (
    freshness_state in ('CURRENT', 'STALE', 'UNKNOWN')
  ),
  conflict_state text not null check (
    conflict_state in ('CLEAR', 'CONFLICT', 'UNRESOLVED')
  ),
  current_version integer not null check (current_version >= 1),
  created_at timestamptz not null default now(),
  created_by uuid not null references auth.users(id) on delete restrict,
  updated_at timestamptz not null default now(),
  archived_at timestamptz,
  archived_by uuid references auth.users(id) on delete restrict,
  archive_reason text,
  constraint canonical_policies_reference_ck
    check (policy_reference ~ '^[A-Za-z0-9][A-Za-z0-9._:@/-]{0,239}$'),
  constraint canonical_policies_carrier_ck
    check (carrier_reference ~ '^[A-Za-z0-9][A-Za-z0-9._:@/-]{0,239}$'),
  constraint canonical_policies_number_ck
    check (nullif(btrim(policy_number), '') is not null and length(policy_number) <= 160),
  constraint canonical_policies_product_ck
    check (product_reference ~ '^[A-Za-z0-9][A-Za-z0-9._:@/-]{0,239}$'),
  constraint canonical_policies_effective_range_ck
    check (effective_to is null or effective_from is null or effective_to > effective_from),
  constraint canonical_policies_status_source_ck
    check (status_source ~ '^[A-Za-z0-9][A-Za-z0-9._:@/-]{0,239}$'),
  constraint canonical_policies_currency_ck
    check (currency is null or currency ~ '^[A-Z]{3}$'),
  constraint canonical_policies_premium_ck
    check (premium_amount is null or premium_amount >= 0),
  constraint canonical_policies_frequency_ck
    check (
      payment_frequency is null
      or payment_frequency in (
        'MONTHLY',
        'QUARTERLY',
        'SEMIANNUAL',
        'ANNUAL',
        'SINGLE',
        'OTHER'
      )
    ),
  constraint canonical_policies_sum_insured_ck
    check (sum_insured is null or sum_insured >= 0),
  constraint canonical_policies_actor_ck
    check (created_by = advisor_id),
  constraint canonical_policies_archive_metadata_ck
    check (
      (
        archived_at is null
        and archived_by is null
        and archive_reason is null
      )
      or
      (
        archived_at is not null
        and archived_by = advisor_id
        and nullif(btrim(archive_reason), '') is not null
      )
    ),
  unique (id, advisor_id),
  unique (advisor_id, policy_reference),
  unique (advisor_id, carrier_reference, policy_number)
);

create index if not exists canonical_policies_read_idx
  on public.canonical_policies (
    advisor_id,
    status_value,
    status_as_of desc
  )
  where archived_at is null;

create table if not exists public.policy_evidence_versions (
  id uuid primary key default gen_random_uuid(),
  advisor_id uuid not null references auth.users(id) on delete restrict,
  evidence_version_reference text not null,
  policy_id uuid not null,
  document_hash text not null,
  source_type text not null,
  observed_at timestamptz not null,
  verification_state text not null check (
    verification_state in ('UNVERIFIED', 'REVIEWED', 'CONFIRMED', 'DISPUTED')
  ),
  field_claims jsonb not null,
  provenance jsonb not null,
  correction_of uuid,
  created_at timestamptz not null default now(),
  created_by uuid not null references auth.users(id) on delete restrict,
  constraint policy_evidence_versions_reference_ck
    check (evidence_version_reference ~ '^[A-Za-z0-9][A-Za-z0-9._:@/-]{0,239}$'),
  constraint policy_evidence_versions_hash_ck
    check (document_hash ~ '^[a-f0-9]{64}$'),
  constraint policy_evidence_versions_source_ck
    check (source_type ~ '^[A-Za-z0-9][A-Za-z0-9._:@/-]{0,119}$'),
  constraint policy_evidence_versions_claims_ck
    check (jsonb_typeof(field_claims) = 'object'),
  constraint policy_evidence_versions_provenance_ck
    check (jsonb_typeof(provenance) = 'object'),
  constraint policy_evidence_versions_actor_ck
    check (created_by = advisor_id),
  constraint policy_evidence_versions_policy_owner_fk
    foreign key (policy_id, advisor_id)
    references public.canonical_policies (id, advisor_id)
    on delete restrict,
  constraint policy_evidence_versions_correction_owner_fk
    foreign key (correction_of, advisor_id)
    references public.policy_evidence_versions (id, advisor_id)
    on delete restrict,
  unique (id, advisor_id),
  unique (advisor_id, evidence_version_reference)
);

create table if not exists public.policy_versions (
  id uuid primary key default gen_random_uuid(),
  advisor_id uuid not null references auth.users(id) on delete restrict,
  policy_id uuid not null,
  policy_version_reference text not null,
  version_number integer not null check (version_number >= 1),
  facts jsonb not null,
  facts_digest text not null,
  evidence_version_id uuid not null,
  quote_reference text,
  application_reference text,
  previous_policy_version_id uuid,
  correction_of uuid,
  confirmed_at timestamptz not null,
  confirmed_by uuid not null references auth.users(id) on delete restrict,
  created_at timestamptz not null default now(),
  constraint policy_versions_reference_ck
    check (policy_version_reference ~ '^[A-Za-z0-9][A-Za-z0-9._:@/-]{0,239}$'),
  constraint policy_versions_facts_ck
    check (jsonb_typeof(facts) = 'object'),
  constraint policy_versions_digest_ck
    check (facts_digest ~ '^[a-f0-9]{64}$'),
  constraint policy_versions_quote_reference_ck
    check (
      quote_reference is null
      or quote_reference ~ '^[A-Za-z0-9][A-Za-z0-9._:@/-]{0,239}$'
    ),
  constraint policy_versions_application_reference_ck
    check (
      application_reference is null
      or application_reference ~ '^[A-Za-z0-9][A-Za-z0-9._:@/-]{0,239}$'
    ),
  constraint policy_versions_actor_ck
    check (confirmed_by = advisor_id),
  constraint policy_versions_policy_owner_fk
    foreign key (policy_id, advisor_id)
    references public.canonical_policies (id, advisor_id)
    on delete restrict,
  constraint policy_versions_evidence_owner_fk
    foreign key (evidence_version_id, advisor_id)
    references public.policy_evidence_versions (id, advisor_id)
    on delete restrict,
  constraint policy_versions_previous_owner_fk
    foreign key (previous_policy_version_id, advisor_id)
    references public.policy_versions (id, advisor_id)
    on delete restrict,
  constraint policy_versions_correction_owner_fk
    foreign key (correction_of, advisor_id)
    references public.policy_versions (id, advisor_id)
    on delete restrict,
  unique (id, advisor_id),
  unique (advisor_id, policy_version_reference),
  unique (advisor_id, policy_id, version_number)
);

create table if not exists public.policy_roles (
  id uuid primary key default gen_random_uuid(),
  advisor_id uuid not null references auth.users(id) on delete restrict,
  policy_role_reference text not null,
  policy_id uuid not null,
  policy_version_id uuid not null,
  participant_person_id uuid,
  participant_account_id uuid,
  role_type text not null check (
    role_type in (
      'POLICY_OWNER',
      'INSURED',
      'ADDITIONAL_INSURED',
      'PAYOR',
      'BENEFICIARY',
      'ADVISOR_OF_RECORD',
      'ORIGINATING_ADVISOR',
      'SERVICING_ADVISOR'
    )
  ),
  confirmation_state text not null check (
    confirmation_state in ('CONFIRMED', 'PROPOSED', 'DISPUTED', 'CORRECTED')
  ),
  privacy_classification text not null check (
    privacy_classification in ('PRIVATE', 'SENSITIVE', 'RESTRICTED')
  ),
  visibility_scope text not null check (
    visibility_scope in (
      'POLICY_TEAM',
      'OWNING_ADVISOR_ONLY',
      'RESTRICTED_ROLE_VIEW'
    )
  ),
  evidence_references jsonb not null,
  effective_from timestamptz not null,
  effective_to timestamptz,
  role_version integer not null check (role_version >= 1),
  correction_of uuid,
  created_at timestamptz not null default now(),
  created_by uuid not null references auth.users(id) on delete restrict,
  archived_at timestamptz,
  archived_by uuid references auth.users(id) on delete restrict,
  archive_reason text,
  constraint policy_roles_reference_ck
    check (policy_role_reference ~ '^[A-Za-z0-9][A-Za-z0-9._:@/-]{0,239}$'),
  constraint policy_roles_participant_xor_ck
    check (
      (participant_person_id is not null and participant_account_id is null)
      or
      (participant_person_id is null and participant_account_id is not null)
    ),
  constraint policy_roles_beneficiary_visibility_ck
    check (
      role_type <> 'BENEFICIARY'
      or visibility_scope in ('OWNING_ADVISOR_ONLY', 'RESTRICTED_ROLE_VIEW')
    ),
  constraint policy_roles_evidence_ck
    check (
      jsonb_typeof(evidence_references) = 'array'
      and jsonb_array_length(evidence_references) >= 1
    ),
  constraint policy_roles_effective_range_ck
    check (effective_to is null or effective_to > effective_from),
  constraint policy_roles_actor_ck
    check (created_by = advisor_id),
  constraint policy_roles_archive_metadata_ck
    check (
      (
        archived_at is null
        and archived_by is null
        and archive_reason is null
      )
      or
      (
        archived_at is not null
        and archived_by = advisor_id
        and nullif(btrim(archive_reason), '') is not null
      )
    ),
  constraint policy_roles_policy_owner_fk
    foreign key (policy_id, advisor_id)
    references public.canonical_policies (id, advisor_id)
    on delete restrict,
  constraint policy_roles_version_owner_fk
    foreign key (policy_version_id, advisor_id)
    references public.policy_versions (id, advisor_id)
    on delete restrict,
  constraint policy_roles_person_owner_fk
    foreign key (participant_person_id, advisor_id)
    references public.commercial_people (id, advisor_id)
    on delete restrict,
  constraint policy_roles_account_owner_fk
    foreign key (participant_account_id, advisor_id)
    references public.commercial_accounts (id, advisor_id)
    on delete restrict,
  constraint policy_roles_correction_owner_fk
    foreign key (correction_of, advisor_id)
    references public.policy_roles (id, advisor_id)
    on delete restrict,
  unique (id, advisor_id),
  unique (advisor_id, policy_role_reference, role_version)
);

create index if not exists policy_roles_policy_read_idx
  on public.policy_roles (
    advisor_id,
    policy_id,
    role_type,
    effective_from desc
  );

create table if not exists public.policy_conflicts (
  id uuid primary key default gen_random_uuid(),
  advisor_id uuid not null references auth.users(id) on delete restrict,
  conflict_reference text not null,
  policy_id uuid,
  conflict_type text not null check (
    conflict_type in (
      'POLICY_NUMBER_COLLISION',
      'CHANGED_INPUT_REPLAY',
      'FIELD_CLAIM_CONFLICT',
      'IDENTITY_UNRESOLVED',
      'PARTICIPANT_SCOPE_MISMATCH',
      'EVIDENCE_CONFLICT'
    )
  ),
  conflict_state text not null check (
    conflict_state in ('OPEN', 'RESOLVED', 'SUPERSEDED')
  ),
  claims jsonb not null,
  evidence_references jsonb not null default '[]'::jsonb,
  command_type text,
  idempotency_key text,
  incoming_digest text,
  existing_digest text,
  resolution jsonb,
  correction_of uuid,
  recorded_at timestamptz not null default now(),
  recorded_by uuid not null references auth.users(id) on delete restrict,
  constraint policy_conflicts_reference_ck
    check (conflict_reference ~ '^[A-Za-z0-9][A-Za-z0-9._:@/-]{0,239}$'),
  constraint policy_conflicts_claims_ck
    check (jsonb_typeof(claims) = 'object'),
  constraint policy_conflicts_evidence_ck
    check (jsonb_typeof(evidence_references) = 'array'),
  constraint policy_conflicts_idempotency_ck
    check (
      idempotency_key is null
      or idempotency_key ~ '^[A-Za-z0-9][A-Za-z0-9._:@/-]{0,159}$'
    ),
  constraint policy_conflicts_incoming_digest_ck
    check (incoming_digest is null or incoming_digest ~ '^[a-f0-9]{64}$'),
  constraint policy_conflicts_existing_digest_ck
    check (existing_digest is null or existing_digest ~ '^[a-f0-9]{64}$'),
  constraint policy_conflicts_resolution_ck
    check (resolution is null or jsonb_typeof(resolution) = 'object'),
  constraint policy_conflicts_actor_ck
    check (recorded_by = advisor_id),
  constraint policy_conflicts_policy_owner_fk
    foreign key (policy_id, advisor_id)
    references public.canonical_policies (id, advisor_id)
    on delete restrict,
  constraint policy_conflicts_correction_owner_fk
    foreign key (correction_of, advisor_id)
    references public.policy_conflicts (id, advisor_id)
    on delete restrict,
  unique (id, advisor_id),
  unique (advisor_id, conflict_reference)
);

create table if not exists public.cartera010b_command_receipts (
  id uuid primary key default gen_random_uuid(),
  advisor_id uuid not null references auth.users(id) on delete restrict,
  command_type text not null check (
    command_type in ('IDENTITY_RESOLUTION', 'CONFIRMED_POLICY')
  ),
  idempotency_key text not null,
  command_digest text not null,
  response_envelope jsonb not null,
  executed_at timestamptz not null default now(),
  executed_by uuid not null references auth.users(id) on delete restrict,
  constraint cartera010b_command_receipts_idempotency_ck
    check (idempotency_key ~ '^[A-Za-z0-9][A-Za-z0-9._:@/-]{0,159}$'),
  constraint cartera010b_command_receipts_digest_ck
    check (command_digest ~ '^[a-f0-9]{64}$'),
  constraint cartera010b_command_receipts_response_ck
    check (jsonb_typeof(response_envelope) = 'object'),
  constraint cartera010b_command_receipts_actor_ck
    check (executed_by = advisor_id),
  unique (id, advisor_id),
  unique (advisor_id, command_type, idempotency_key)
);

create or replace function public.forge_cartera010b_append_only_guard()
returns trigger
language plpgsql
security invoker
set search_path = public, pg_temp
as $$
begin
  raise exception 'CARTERA010B_APPEND_ONLY';
end;
$$;

create or replace function public.forge_cartera010b_owned_archive_guard()
returns trigger
language plpgsql
security invoker
set search_path = public, pg_temp
as $$
begin
  if tg_op = 'DELETE' then
    raise exception 'CARTERA010B_HARD_DELETE_FORBIDDEN';
  end if;

  if new.advisor_id is distinct from old.advisor_id then
    raise exception 'CARTERA010B_OWNERSHIP_TRANSFER_FORBIDDEN';
  end if;

  if old.archived_at is not null and (
    new.archived_at is distinct from old.archived_at
    or new.archived_by is distinct from old.archived_by
    or new.archive_reason is distinct from old.archive_reason
  ) then
    raise exception 'CARTERA010B_ARCHIVE_HISTORY_IMMUTABLE';
  end if;

  if new.archived_at is not null and (
    new.archived_by is distinct from new.advisor_id
    or nullif(btrim(new.archive_reason), '') is null
  ) then
    raise exception 'CARTERA010B_ARCHIVE_METADATA_INVALID';
  end if;

  new.updated_at := now();
  new.version := old.version + 1;
  return new;
end;
$$;

drop trigger if exists forge_cartera010b_people_owned_archive_guard
  on public.commercial_people;
create trigger forge_cartera010b_people_owned_archive_guard
before update or delete on public.commercial_people
for each row execute function public.forge_cartera010b_owned_archive_guard();

drop trigger if exists forge_cartera010b_accounts_owned_archive_guard
  on public.commercial_accounts;
create trigger forge_cartera010b_accounts_owned_archive_guard
before update or delete on public.commercial_accounts
for each row execute function public.forge_cartera010b_owned_archive_guard();

-- Policy current rows are mutable only through future governed commands.
create or replace function public.forge_cartera010b_policy_current_guard()
returns trigger
language plpgsql
security invoker
set search_path = public, pg_temp
as $$
begin
  if tg_op = 'DELETE' then
    raise exception 'CARTERA010B_HARD_DELETE_FORBIDDEN';
  end if;

  if new.advisor_id is distinct from old.advisor_id then
    raise exception 'CARTERA010B_OWNERSHIP_TRANSFER_FORBIDDEN';
  end if;

  if old.archived_at is not null and (
    new.archived_at is distinct from old.archived_at
    or new.archived_by is distinct from old.archived_by
    or new.archive_reason is distinct from old.archive_reason
  ) then
    raise exception 'CARTERA010B_ARCHIVE_HISTORY_IMMUTABLE';
  end if;

  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists forge_cartera010b_policy_current_guard
  on public.canonical_policies;
create trigger forge_cartera010b_policy_current_guard
before update or delete on public.canonical_policies
for each row execute function public.forge_cartera010b_policy_current_guard();

do $$
declare
  table_name text;
begin
  foreach table_name in array array[
    'identity_resolution_decisions',
    'commercial_source_identity_links',
    'commercial_account_memberships',
    'policy_evidence_versions',
    'policy_versions',
    'policy_roles',
    'policy_conflicts',
    'cartera010b_command_receipts'
  ] loop
    execute format(
      'drop trigger if exists forge_cartera010b_append_only_guard on public.%I',
      table_name
    );
    execute format(
      'create trigger forge_cartera010b_append_only_guard before update or delete on public.%I for each row execute function public.forge_cartera010b_append_only_guard()',
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
    'commercial_people',
    'identity_resolution_decisions',
    'commercial_source_identity_links',
    'commercial_accounts',
    'commercial_account_memberships',
    'canonical_policies',
    'policy_evidence_versions',
    'policy_versions',
    'policy_roles',
    'policy_conflicts',
    'cartera010b_command_receipts'
  ] loop
    execute format('alter table public.%I enable row level security', table_name);
    execute format('revoke all on table public.%I from anon', table_name);
    execute format('revoke all on table public.%I from authenticated', table_name);
    execute format('grant select on table public.%I to authenticated', table_name);
    execute format(
      'drop policy if exists %I on public.%I',
      table_name || '_select_own',
      table_name
    );
    execute format(
      'create policy %I on public.%I for select to authenticated using (advisor_id = auth.uid())',
      table_name || '_select_own',
      table_name
    );
  end loop;
end;
$$;

-- Sensitive/restricted role rows are not exposed through the ordinary table grant.
-- The general view deliberately excludes beneficiaries and restricted visibility.
revoke select on table public.policy_roles from authenticated;

create or replace view public.cartera_policy_roles_general
with (security_invoker = true)
as
select
  id,
  advisor_id,
  policy_role_reference,
  policy_id,
  policy_version_id,
  participant_person_id,
  participant_account_id,
  role_type,
  confirmation_state,
  privacy_classification,
  visibility_scope,
  effective_from,
  effective_to,
  role_version,
  correction_of,
  created_at
from public.policy_roles
where visibility_scope = 'POLICY_TEAM'
  and role_type <> 'BENEFICIARY';

revoke all on public.cartera_policy_roles_general from anon;
grant select on public.cartera_policy_roles_general to authenticated;

comment on table public.commercial_people is
  'CARTERA 010B durable CommercialPerson identity. Prospect remains a Sales source identity.';
comment on table public.canonical_policies is
  'CARTERA 010B canonical Policy current projection. Unknown financial/status facts remain explicit null or UNKNOWN.';
comment on table public.policy_roles is
  'CARTERA 010B immutable multi-party PolicyRole versions; exactly one person or account participant.';
comment on table public.cartera010b_command_receipts is
  'Reserved idempotency authority for governed identity and confirmed-Policy commands. Direct app writes remain revoked.';

commit;
