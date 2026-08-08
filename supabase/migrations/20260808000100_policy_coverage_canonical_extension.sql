-- FORGE CARTERA POLICY COVERAGE MODEL AUTHORITY 001
-- Repository-only additive extension of the accepted CARTERA 010B Policy authority.
-- This migration is NOT authorization to execute against remote Supabase.
-- Product Coverage taxonomy does not prove contracted Policy Coverage.

begin;

create extension if not exists pgcrypto;

-- Reuse the existing governed command receipt authority for the bounded child command.
alter table public.cartera010b_command_receipts
  drop constraint if exists cartera010b_command_receipts_command_type_check;
alter table public.cartera010b_command_receipts
  drop constraint if exists cartera010b_command_receipts_command_type_ck;
alter table public.cartera010b_command_receipts
  add constraint cartera010b_command_receipts_command_type_ck
  check (command_type in ('IDENTITY_RESOLUTION', 'CONFIRMED_POLICY', 'POLICY_COVERAGES'));

create table if not exists public.policy_coverages (
  id uuid primary key default gen_random_uuid(),
  advisor_id uuid not null references auth.users(id) on delete restrict,
  policy_id uuid not null,
  policy_coverage_reference text not null,
  product_coverage_reference text,
  coverage_code text,
  coverage_label text,
  coverage_kind text not null,
  coverage_state text,
  sum_insured numeric,
  currency text,
  premium_amount numeric,
  premium_currency text,
  annex_reference text,
  rider_reference text,
  effective_from timestamptz,
  effective_to timestamptz,
  coverage_period_value numeric,
  coverage_period_unit text,
  payment_period_value numeric,
  payment_period_unit text,
  source_evidence_references jsonb not null,
  verification_state text not null check (
    verification_state in ('UNVERIFIED', 'REVIEWED', 'CONFIRMED', 'DISPUTED')
  ),
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
  created_at timestamptz not null,
  created_by uuid not null references auth.users(id) on delete restrict,
  updated_at timestamptz not null,
  archived_at timestamptz,
  archived_by uuid references auth.users(id) on delete restrict,
  archive_reason text,
  constraint policy_coverages_reference_ck
    check (policy_coverage_reference ~ '^[A-Za-z0-9][A-Za-z0-9._:@/-]{0,239}$'),
  constraint policy_coverages_product_reference_ck
    check (
      product_coverage_reference is null
      or product_coverage_reference ~ '^[A-Za-z0-9][A-Za-z0-9._:@/-]{0,239}$'
    ),
  constraint policy_coverages_code_ck
    check (coverage_code is null or length(coverage_code) between 1 and 120),
  constraint policy_coverages_label_ck
    check (coverage_label is null or length(coverage_label) between 1 and 240),
  constraint policy_coverages_kind_ck
    check (coverage_kind ~ '^[A-Za-z0-9][A-Za-z0-9._:@/-]{0,119}$'),
  constraint policy_coverages_state_ck
    check (
      coverage_state is null
      or coverage_state ~ '^[A-Za-z0-9][A-Za-z0-9._:@/-]{0,119}$'
    ),
  constraint policy_coverages_sum_insured_ck
    check (sum_insured is null or sum_insured >= 0),
  constraint policy_coverages_currency_ck
    check (currency is null or currency ~ '^[A-Z]{3}$'),
  constraint policy_coverages_premium_ck
    check (premium_amount is null or premium_amount >= 0),
  constraint policy_coverages_premium_currency_ck
    check (premium_currency is null or premium_currency ~ '^[A-Z]{3}$'),
  constraint policy_coverages_annex_ck
    check (
      annex_reference is null
      or annex_reference ~ '^[A-Za-z0-9][A-Za-z0-9._:@/-]{0,239}$'
    ),
  constraint policy_coverages_rider_ck
    check (
      rider_reference is null
      or rider_reference ~ '^[A-Za-z0-9][A-Za-z0-9._:@/-]{0,239}$'
    ),
  constraint policy_coverages_effective_range_ck
    check (effective_to is null or effective_from is null or effective_to > effective_from),
  constraint policy_coverages_coverage_period_ck
    check (
      (coverage_period_value is null and coverage_period_unit is null)
      or (
        coverage_period_value > 0
        and coverage_period_unit ~ '^[A-Za-z0-9][A-Za-z0-9._:@/-]{0,39}$'
      )
    ),
  constraint policy_coverages_payment_period_ck
    check (
      (payment_period_value is null and payment_period_unit is null)
      or (
        payment_period_value > 0
        and payment_period_unit ~ '^[A-Za-z0-9][A-Za-z0-9._:@/-]{0,39}$'
      )
    ),
  constraint policy_coverages_evidence_ck
    check (
      jsonb_typeof(source_evidence_references) = 'array'
      and jsonb_array_length(source_evidence_references) >= 1
    ),
  constraint policy_coverages_actor_ck check (created_by = advisor_id),
  constraint policy_coverages_archive_ck
    check (
      (archived_at is null and archived_by is null and archive_reason is null)
      or (
        archived_at is not null
        and archived_by = advisor_id
        and nullif(btrim(archive_reason), '') is not null
      )
    ),
  constraint policy_coverages_policy_owner_fk
    foreign key (policy_id, advisor_id)
    references public.canonical_policies (id, advisor_id)
    on delete restrict,
  unique (id, advisor_id),
  unique (advisor_id, policy_coverage_reference)
);

create index if not exists policy_coverages_policy_read_idx
  on public.policy_coverages (advisor_id, policy_id, policy_coverage_reference)
  where archived_at is null;

create table if not exists public.policy_coverage_versions (
  id uuid primary key default gen_random_uuid(),
  advisor_id uuid not null references auth.users(id) on delete restrict,
  policy_coverage_id uuid not null,
  policy_id uuid not null,
  policy_version_id uuid not null,
  evidence_version_id uuid not null,
  policy_coverage_version_reference text not null,
  version_number integer not null check (version_number >= 1),
  facts jsonb not null,
  facts_digest text not null,
  source_evidence_references jsonb not null,
  previous_coverage_version_id uuid,
  correction_of uuid,
  confirmed_at timestamptz not null,
  confirmed_by uuid not null references auth.users(id) on delete restrict,
  created_at timestamptz not null default now(),
  constraint policy_coverage_versions_reference_ck
    check (policy_coverage_version_reference ~ '^[A-Za-z0-9][A-Za-z0-9._:@/-]{0,239}$'),
  constraint policy_coverage_versions_facts_ck check (jsonb_typeof(facts) = 'object'),
  constraint policy_coverage_versions_digest_ck check (facts_digest ~ '^[a-f0-9]{64}$'),
  constraint policy_coverage_versions_evidence_ck
    check (
      jsonb_typeof(source_evidence_references) = 'array'
      and jsonb_array_length(source_evidence_references) >= 1
    ),
  constraint policy_coverage_versions_actor_ck check (confirmed_by = advisor_id),
  constraint policy_coverage_versions_coverage_owner_fk
    foreign key (policy_coverage_id, advisor_id)
    references public.policy_coverages (id, advisor_id)
    on delete restrict,
  constraint policy_coverage_versions_policy_owner_fk
    foreign key (policy_id, advisor_id)
    references public.canonical_policies (id, advisor_id)
    on delete restrict,
  constraint policy_coverage_versions_policy_version_owner_fk
    foreign key (policy_version_id, advisor_id)
    references public.policy_versions (id, advisor_id)
    on delete restrict,
  constraint policy_coverage_versions_evidence_version_owner_fk
    foreign key (evidence_version_id, advisor_id)
    references public.policy_evidence_versions (id, advisor_id)
    on delete restrict,
  constraint policy_coverage_versions_previous_owner_fk
    foreign key (previous_coverage_version_id, advisor_id)
    references public.policy_coverage_versions (id, advisor_id)
    on delete restrict,
  constraint policy_coverage_versions_correction_owner_fk
    foreign key (correction_of, advisor_id)
    references public.policy_coverage_versions (id, advisor_id)
    on delete restrict,
  unique (id, advisor_id),
  unique (advisor_id, policy_coverage_version_reference),
  unique (advisor_id, policy_coverage_id, version_number)
);

create index if not exists policy_coverage_versions_policy_idx
  on public.policy_coverage_versions (
    advisor_id, policy_id, policy_coverage_id, version_number desc
  );

create or replace function public.forge_policy_coverage_current_guard()
returns trigger
language plpgsql
security invoker
set search_path = public, pg_temp
as $$
begin
  if tg_op = 'DELETE' then
    raise exception 'POLICY_COVERAGE_HARD_DELETE_FORBIDDEN';
  end if;
  if current_setting('forge.policy_coverage_governed_command', true) <> 'on' then
    raise exception 'POLICY_COVERAGE_GOVERNED_COMMAND_REQUIRED';
  end if;
  if new.advisor_id is distinct from old.advisor_id
     or new.policy_id is distinct from old.policy_id
     or new.policy_coverage_reference is distinct from old.policy_coverage_reference
     or new.created_at is distinct from old.created_at
     or new.created_by is distinct from old.created_by then
    raise exception 'POLICY_COVERAGE_IDENTITY_IMMUTABLE';
  end if;
  if old.archived_at is not null and (
    new.archived_at is distinct from old.archived_at
    or new.archived_by is distinct from old.archived_by
    or new.archive_reason is distinct from old.archive_reason
  ) then
    raise exception 'POLICY_COVERAGE_ARCHIVE_HISTORY_IMMUTABLE';
  end if;
  return new;
end;
$$;

drop trigger if exists forge_policy_coverage_current_guard on public.policy_coverages;
create trigger forge_policy_coverage_current_guard
before update or delete on public.policy_coverages
for each row execute function public.forge_policy_coverage_current_guard();

drop trigger if exists forge_policy_coverage_version_append_only_guard
  on public.policy_coverage_versions;
create trigger forge_policy_coverage_version_append_only_guard
before update or delete on public.policy_coverage_versions
for each row execute function public.forge_cartera010b_append_only_guard();

alter table public.policy_coverages enable row level security;
alter table public.policy_coverage_versions enable row level security;

revoke all on table public.policy_coverages from public, anon, authenticated;
revoke all on table public.policy_coverage_versions from public, anon, authenticated;
grant select on table public.policy_coverages to authenticated;
grant select on table public.policy_coverage_versions to authenticated;

drop policy if exists policy_coverages_select_own on public.policy_coverages;
create policy policy_coverages_select_own
on public.policy_coverages for select to authenticated
using (advisor_id = auth.uid());

drop policy if exists policy_coverage_versions_select_own on public.policy_coverage_versions;
create policy policy_coverage_versions_select_own
on public.policy_coverage_versions for select to authenticated
using (advisor_id = auth.uid());

create or replace function public.forge_policy_intelligence_confirm_policy_coverages(
  p_command jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = public, extensions, pg_temp
as $$
#variable_conflict use_variable
declare
  actor_id uuid := auth.uid();
  advisor_id uuid;
  idempotency_key text;
  command_digest text;
  confirmed_at timestamptz;
  policy_reference text;
  policy_version_reference text;
  evidence_version_reference text;
  coverage_items jsonb;
  persisted_policy public.canonical_policies%rowtype;
  persisted_policy_version public.policy_versions%rowtype;
  persisted_evidence public.policy_evidence_versions%rowtype;
  coverage jsonb;
  existing_coverage public.policy_coverages%rowtype;
  previous_version public.policy_coverage_versions%rowtype;
  correction_version public.policy_coverage_versions%rowtype;
  coverage_id uuid;
  coverage_reference text;
  generated_version_reference text;
  requested_version integer;
  facts_digest text;
  coverage_effective_from timestamptz;
  coverage_effective_to timestamptz;
  sum_insured numeric;
  premium_amount numeric;
  coverage_period_value numeric;
  payment_period_value numeric;
  replay jsonb;
  response jsonb;
  persisted_count integer;
begin
  if actor_id is null then
    raise exception 'POLICY_COVERAGE_AUTH_REQUIRED';
  end if;

  if not public.forge_cartera010b_jsonb_keys_allowed(
       p_command,
       array[
         'contractType','contractVersion','advisorId','actorReference',
         'idempotencyKey','confirmedAt','policyReference',
         'policyVersionReference','evidenceVersionReference','coverages',
         'commandDigest'
       ]
     )
     or p_command ->> 'contractType' <> 'FORGE_CONFIRMED_POLICY_COVERAGES_COMMAND'
     or p_command ->> 'contractVersion' <> 'POLICY-COVERAGE-1.0' then
    raise exception 'POLICY_COVERAGE_COMMAND_CONTRACT_INVALID';
  end if;

  begin
    advisor_id := (p_command ->> 'advisorId')::uuid;
    confirmed_at := (p_command ->> 'confirmedAt')::timestamptz;
  exception when others then
    raise exception 'POLICY_COVERAGE_COMMAND_FIELDS_INVALID';
  end;

  if advisor_id <> actor_id or p_command ->> 'actorReference' <> actor_id::text then
    raise exception 'POLICY_COVERAGE_OWNER_MISMATCH';
  end if;

  idempotency_key := nullif(btrim(p_command ->> 'idempotencyKey'), '');
  policy_reference := nullif(btrim(p_command ->> 'policyReference'), '');
  policy_version_reference := nullif(btrim(p_command ->> 'policyVersionReference'), '');
  evidence_version_reference := nullif(btrim(p_command ->> 'evidenceVersionReference'), '');
  coverage_items := p_command -> 'coverages';

  if idempotency_key is null
     or idempotency_key !~ '^[A-Za-z0-9][A-Za-z0-9._:@/-]{0,159}$'
     or confirmed_at is null
     or confirmed_at > now() + interval '5 minutes'
     or policy_reference is null
     or policy_reference !~ '^[A-Za-z0-9][A-Za-z0-9._:@/-]{0,239}$'
     or policy_version_reference is null
     or policy_version_reference !~ '^[A-Za-z0-9][A-Za-z0-9._:@/-]{0,239}$'
     or evidence_version_reference is null
     or evidence_version_reference !~ '^[A-Za-z0-9][A-Za-z0-9._:@/-]{0,239}$'
     or coverage_items is null
     or jsonb_typeof(coverage_items) <> 'array'
     or jsonb_array_length(coverage_items) < 1
     or jsonb_array_length(coverage_items) > 200 then
    raise exception 'POLICY_COVERAGE_COMMAND_INVALID';
  end if;

  if (select count(*) from jsonb_array_elements(coverage_items)) <>
     (select count(distinct value ->> 'policyCoverageReference') from jsonb_array_elements(coverage_items)) then
    raise exception 'POLICY_COVERAGE_DUPLICATE_LOGICAL_REFERENCE';
  end if;

  select * into persisted_policy
  from public.canonical_policies p
  where p.advisor_id = actor_id
    and p.policy_reference = policy_reference
    and p.archived_at is null
  for update;
  if persisted_policy.id is null then
    raise exception 'POLICY_COVERAGE_POLICY_NOT_FOUND';
  end if;

  select * into persisted_policy_version
  from public.policy_versions v
  where v.advisor_id = actor_id
    and v.policy_id = persisted_policy.id
    and v.policy_version_reference = policy_version_reference;
  if persisted_policy_version.id is null then
    raise exception 'POLICY_COVERAGE_POLICY_VERSION_NOT_FOUND';
  end if;

  select * into persisted_evidence
  from public.policy_evidence_versions e
  where e.advisor_id = actor_id
    and e.policy_id = persisted_policy.id
    and e.evidence_version_reference = evidence_version_reference;
  if persisted_evidence.id is null
     or persisted_evidence.verification_state not in ('REVIEWED', 'CONFIRMED') then
    raise exception 'POLICY_COVERAGE_EVIDENCE_NOT_REVIEWED';
  end if;

  command_digest := public.forge_cartera010b_command_digest(p_command);
  perform pg_advisory_xact_lock(hashtextextended(
    actor_id::text || '|POLICY_COVERAGES|' || idempotency_key, 0
  ));
  perform pg_advisory_xact_lock(hashtextextended(
    actor_id::text || '|POLICY_REFERENCE|' || policy_reference, 0
  ));

  replay := public.forge_cartera010b_existing_receipt_response(
    actor_id, 'POLICY_COVERAGES', idempotency_key, command_digest,
    jsonb_build_array(evidence_version_reference),
    jsonb_build_object('policyReference', policy_reference)
  );
  if replay is not null then
    return replay;
  end if;

  for coverage in select value from jsonb_array_elements(coverage_items)
  loop
    if not public.forge_cartera010b_jsonb_keys_allowed(
         coverage,
         array[
           'contractType','schemaVersion','policyCoverageReference','advisorId',
           'policyReference','policyVersionReference','productCoverageReference',
           'coverageCode','coverageLabel','coverageKind','coverageState',
           'sumInsured','currency','premiumAmount','premiumCurrency',
           'annexReference','riderReference','effectiveFrom','effectiveTo',
           'coveragePeriodValue','coveragePeriodUnit','paymentPeriodValue',
           'paymentPeriodUnit','sourceEvidenceReferences','verificationState',
           'completenessState','freshnessState','conflictState','currentVersion',
           'previousCoverageVersionReference','correctionOf','createdAt','createdBy',
           'updatedAt','archivedAt','archivedBy','archiveReason'
         ]
       ) then
      raise exception 'POLICY_COVERAGE_FACT_KEYS_INVALID';
    end if;

    coverage_reference := nullif(btrim(coverage ->> 'policyCoverageReference'), '');
    if coverage ->> 'contractType' <> 'FORGE_POLICY_COVERAGE'
       or coverage ->> 'schemaVersion' <> '1.0.0'
       or coverage ->> 'advisorId' <> actor_id::text
       or coverage ->> 'policyReference' <> policy_reference
       or coverage ->> 'policyVersionReference' <> policy_version_reference
       or coverage ->> 'createdBy' <> actor_id::text
       or coverage_reference is null
       or coverage_reference !~ '^[A-Za-z0-9][A-Za-z0-9._:@/-]{0,239}$'
       or coverage ->> 'coverageKind' !~ '^[A-Za-z0-9][A-Za-z0-9._:@/-]{0,119}$'
       or coverage ->> 'verificationState' not in ('REVIEWED','CONFIRMED')
       or coverage ->> 'completenessState' not in ('COMPLETE','PARTIAL','UNKNOWN')
       or coverage ->> 'freshnessState' not in ('CURRENT','STALE','UNKNOWN')
       or coverage ->> 'conflictState' <> 'CLEAR'
       or not public.forge_cartera010b_reference_array_valid(
         coverage -> 'sourceEvidenceReferences', 1, 100
       )
       or not (coverage -> 'sourceEvidenceReferences' ? evidence_version_reference)
       or nullif(btrim(coverage ->> 'archivedAt'), '') is not null
       or nullif(btrim(coverage ->> 'archivedBy'), '') is not null
       or nullif(btrim(coverage ->> 'archiveReason'), '') is not null then
      raise exception 'POLICY_COVERAGE_FACT_INVALID';
    end if;

    begin
      requested_version := (coverage ->> 'currentVersion')::integer;
      coverage_effective_from := nullif(btrim(coverage ->> 'effectiveFrom'), '')::timestamptz;
      coverage_effective_to := nullif(btrim(coverage ->> 'effectiveTo'), '')::timestamptz;
      sum_insured := nullif(btrim(coverage ->> 'sumInsured'), '')::numeric;
      premium_amount := nullif(btrim(coverage ->> 'premiumAmount'), '')::numeric;
      coverage_period_value := nullif(btrim(coverage ->> 'coveragePeriodValue'), '')::numeric;
      payment_period_value := nullif(btrim(coverage ->> 'paymentPeriodValue'), '')::numeric;
      perform (coverage ->> 'createdAt')::timestamptz;
      perform (coverage ->> 'updatedAt')::timestamptz;
    exception when others then
      raise exception 'POLICY_COVERAGE_FACT_TYPES_INVALID';
    end;

    if requested_version < 1
       or sum_insured < 0
       or premium_amount < 0
       or coverage_period_value <= 0
       or payment_period_value <= 0
       or (coverage_effective_from is not null and coverage_effective_to is not null
           and coverage_effective_to <= coverage_effective_from)
       or (coverage ->> 'currency' is not null and coverage ->> 'currency' !~ '^[A-Z]{3}$')
       or (coverage ->> 'premiumCurrency' is not null and coverage ->> 'premiumCurrency' !~ '^[A-Z]{3}$')
       or ((coverage_period_value is null) <> (nullif(btrim(coverage ->> 'coveragePeriodUnit'), '') is null))
       or ((payment_period_value is null) <> (nullif(btrim(coverage ->> 'paymentPeriodUnit'), '') is null))
       or (nullif(btrim(coverage ->> 'coverageState'), '') is not null
           and coverage ->> 'coverageState' !~ '^[A-Za-z0-9][A-Za-z0-9._:@/-]{0,119}$') then
      raise exception 'POLICY_COVERAGE_FACT_VALUES_INVALID';
    end if;

    perform pg_advisory_xact_lock(hashtextextended(
      actor_id::text || '|POLICY_COVERAGE_REFERENCE|' || coverage_reference, 0
    ));

    existing_coverage.id := null;
    previous_version.id := null;
    correction_version.id := null;

    select * into existing_coverage
    from public.policy_coverages c
    where c.advisor_id = actor_id
      and c.policy_coverage_reference = coverage_reference
    for update;

    if existing_coverage.id is not null and existing_coverage.policy_id <> persisted_policy.id then
      return public.forge_cartera010b_record_command_conflict(
        actor_id, 'POLICY_COVERAGES', idempotency_key, command_digest,
        'FIELD_CLAIM_CONFLICT', persisted_policy.id,
        jsonb_build_object(
          'policyCoverageReference', coverage_reference,
          'reason', 'COVERAGE_REFERENCE_BOUND_TO_OTHER_POLICY'
        ),
        coverage -> 'sourceEvidenceReferences', null, confirmed_at
      );
    end if;

    if existing_coverage.id is not null then
      select * into previous_version
      from public.policy_coverage_versions cv
      where cv.advisor_id = actor_id
        and cv.policy_coverage_id = existing_coverage.id
      order by cv.version_number desc
      limit 1;

      if previous_version.id is null
         or requested_version <> existing_coverage.current_version + 1
         or coverage ->> 'previousCoverageVersionReference'
            is distinct from previous_version.policy_coverage_version_reference then
        raise exception 'POLICY_COVERAGE_VERSION_CONFLICT';
      end if;
      coverage_id := existing_coverage.id;
    else
      if requested_version <> 1
         or nullif(btrim(coverage ->> 'previousCoverageVersionReference'), '') is not null
         or nullif(btrim(coverage ->> 'correctionOf'), '') is not null then
        raise exception 'POLICY_COVERAGE_INITIAL_VERSION_INVALID';
      end if;
      coverage_id := gen_random_uuid();
    end if;

    if nullif(btrim(coverage ->> 'correctionOf'), '') is not null then
      select * into correction_version
      from public.policy_coverage_versions cv
      where cv.advisor_id = actor_id
        and cv.policy_coverage_id = coverage_id
        and cv.policy_coverage_version_reference = coverage ->> 'correctionOf';
      if correction_version.id is null then
        raise exception 'POLICY_COVERAGE_CORRECTION_TARGET_NOT_FOUND';
      end if;
    end if;

    facts_digest := public.forge_cartera010b_command_digest(coverage);
    generated_version_reference := 'POLICY_COVERAGE_VERSION:' || substr(
      encode(digest(
        actor_id::text || '|' || coverage_reference || '|' ||
        requested_version::text || '|' || facts_digest,
        'sha256'
      ), 'hex'), 1, 40
    );

    if existing_coverage.id is null then
      insert into public.policy_coverages (
        id, advisor_id, policy_id, policy_coverage_reference,
        product_coverage_reference, coverage_code, coverage_label, coverage_kind,
        coverage_state, sum_insured, currency, premium_amount, premium_currency,
        annex_reference, rider_reference, effective_from, effective_to,
        coverage_period_value, coverage_period_unit, payment_period_value,
        payment_period_unit, source_evidence_references, verification_state,
        completeness_state, freshness_state, conflict_state, current_version,
        created_at, created_by, updated_at
      ) values (
        coverage_id, actor_id, persisted_policy.id, coverage_reference,
        nullif(btrim(coverage ->> 'productCoverageReference'), ''),
        nullif(btrim(coverage ->> 'coverageCode'), ''),
        nullif(btrim(coverage ->> 'coverageLabel'), ''), coverage ->> 'coverageKind',
        nullif(btrim(coverage ->> 'coverageState'), ''), sum_insured,
        nullif(btrim(coverage ->> 'currency'), ''), premium_amount,
        nullif(btrim(coverage ->> 'premiumCurrency'), ''),
        nullif(btrim(coverage ->> 'annexReference'), ''),
        nullif(btrim(coverage ->> 'riderReference'), ''),
        coverage_effective_from, coverage_effective_to,
        coverage_period_value, nullif(btrim(coverage ->> 'coveragePeriodUnit'), ''),
        payment_period_value, nullif(btrim(coverage ->> 'paymentPeriodUnit'), ''),
        coverage -> 'sourceEvidenceReferences', coverage ->> 'verificationState',
        coverage ->> 'completenessState', coverage ->> 'freshnessState', 'CLEAR',
        requested_version, confirmed_at, actor_id, confirmed_at
      );
    else
      perform set_config('forge.policy_coverage_governed_command', 'on', true);
      update public.policy_coverages
      set product_coverage_reference = nullif(btrim(coverage ->> 'productCoverageReference'), ''),
          coverage_code = nullif(btrim(coverage ->> 'coverageCode'), ''),
          coverage_label = nullif(btrim(coverage ->> 'coverageLabel'), ''),
          coverage_kind = coverage ->> 'coverageKind',
          coverage_state = nullif(btrim(coverage ->> 'coverageState'), ''),
          sum_insured = sum_insured,
          currency = nullif(btrim(coverage ->> 'currency'), ''),
          premium_amount = premium_amount,
          premium_currency = nullif(btrim(coverage ->> 'premiumCurrency'), ''),
          annex_reference = nullif(btrim(coverage ->> 'annexReference'), ''),
          rider_reference = nullif(btrim(coverage ->> 'riderReference'), ''),
          effective_from = coverage_effective_from,
          effective_to = coverage_effective_to,
          coverage_period_value = coverage_period_value,
          coverage_period_unit = nullif(btrim(coverage ->> 'coveragePeriodUnit'), ''),
          payment_period_value = payment_period_value,
          payment_period_unit = nullif(btrim(coverage ->> 'paymentPeriodUnit'), ''),
          source_evidence_references = coverage -> 'sourceEvidenceReferences',
          verification_state = coverage ->> 'verificationState',
          completeness_state = coverage ->> 'completenessState',
          freshness_state = coverage ->> 'freshnessState',
          conflict_state = 'CLEAR',
          current_version = requested_version,
          updated_at = confirmed_at
      where id = coverage_id and advisor_id = actor_id;
    end if;

    insert into public.policy_coverage_versions (
      advisor_id, policy_coverage_id, policy_id, policy_version_id,
      evidence_version_id, policy_coverage_version_reference, version_number,
      facts, facts_digest, source_evidence_references,
      previous_coverage_version_id, correction_of, confirmed_at, confirmed_by
    ) values (
      actor_id, coverage_id, persisted_policy.id, persisted_policy_version.id,
      persisted_evidence.id, generated_version_reference, requested_version,
      coverage, facts_digest, coverage -> 'sourceEvidenceReferences',
      previous_version.id, correction_version.id, confirmed_at, actor_id
    );
  end loop;

  select count(*)::integer into persisted_count
  from public.policy_coverage_versions cv
  join public.policy_coverages c
    on c.id = cv.policy_coverage_id and c.advisor_id = cv.advisor_id
  where cv.advisor_id = actor_id
    and cv.policy_id = persisted_policy.id
    and cv.policy_version_id = persisted_policy_version.id
    and c.policy_coverage_reference in (
      select value ->> 'policyCoverageReference'
      from jsonb_array_elements(coverage_items)
    );

  if persisted_count <> jsonb_array_length(coverage_items) then
    raise exception 'POLICY_COVERAGE_READ_AFTER_WRITE_FAILED';
  end if;

  response := jsonb_build_object(
    'status', 'CONFIRMED',
    'policyReference', policy_reference,
    'policyVersionReference', policy_version_reference,
    'evidenceVersionReference', evidence_version_reference,
    'coverageCount', persisted_count,
    'idempotencyKey', idempotency_key,
    'serverCommandDigest', command_digest,
    'readAfterWriteVerified', true,
    'replayed', false
  );

  return public.forge_cartera010b_persist_receipt(
    actor_id, 'POLICY_COVERAGES', idempotency_key,
    command_digest, response, confirmed_at
  );
end;
$$;

revoke all on function public.forge_policy_intelligence_confirm_policy_coverages(jsonb)
  from public, anon;
grant execute on function public.forge_policy_intelligence_confirm_policy_coverages(jsonb)
  to authenticated;

-- Atomic orchestration for a single human-confirmed operation. It reuses, rather
-- than replaces, the existing identity + Policy command authority.
create or replace function public.forge_cartera010b_confirm_identity_policy_and_coverages(
  p_identity_command jsonb,
  p_policy_command jsonb,
  p_coverage_command jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = public, extensions, pg_temp
as $$
declare
  actor_id uuid := auth.uid();
  base_result jsonb;
  coverage_result jsonb;
  normalized_coverage_command jsonb;
  normalized_coverages jsonb;
begin
  if actor_id is null then
    raise exception 'POLICY_COVERAGE_AUTH_REQUIRED';
  end if;

  base_result := public.forge_cartera010b_confirm_identity_and_policy(
    p_identity_command, p_policy_command
  );
  if base_result ->> 'status' <> 'CONFIRMED'
     or base_result ->> 'transactionState' <> 'COMMITTED'
     or coalesce((base_result ->> 'readAfterWriteVerified')::boolean, false) is not true then
    raise exception 'POLICY_COVERAGE_BASE_POLICY_NOT_CONFIRMED';
  end if;

  if p_coverage_command is null
     or jsonb_typeof(p_coverage_command) <> 'object'
     or jsonb_typeof(p_coverage_command -> 'coverages') <> 'array' then
    raise exception 'POLICY_COVERAGE_ATOMIC_COMMAND_INVALID';
  end if;

  select jsonb_agg(
    item || jsonb_build_object(
      'advisorId', actor_id::text,
      'policyReference', base_result ->> 'policyReference',
      'policyVersionReference', base_result ->> 'policyVersionReference',
      'createdBy', actor_id::text
    )
  ) into normalized_coverages
  from jsonb_array_elements(p_coverage_command -> 'coverages') item;

  normalized_coverage_command := p_coverage_command || jsonb_build_object(
    'advisorId', actor_id::text,
    'actorReference', actor_id::text,
    'policyReference', base_result ->> 'policyReference',
    'policyVersionReference', base_result ->> 'policyVersionReference',
    'evidenceVersionReference', base_result ->> 'evidenceVersionReference',
    'coverages', normalized_coverages
  );

  coverage_result := public.forge_policy_intelligence_confirm_policy_coverages(
    normalized_coverage_command
  );
  if coverage_result ->> 'status' <> 'CONFIRMED'
     or coalesce((coverage_result ->> 'readAfterWriteVerified')::boolean, false) is not true then
    raise exception 'POLICY_COVERAGE_ATOMIC_COVERAGE_NOT_CONFIRMED';
  end if;

  return jsonb_build_object(
    'status', 'CONFIRMED',
    'transactionState', 'COMMITTED',
    'identityResult', base_result -> 'identityResult',
    'policyResult', base_result -> 'policyResult',
    'coverageResult', coverage_result,
    'policyReference', base_result ->> 'policyReference',
    'policyVersionReference', base_result ->> 'policyVersionReference',
    'evidenceVersionReference', base_result ->> 'evidenceVersionReference',
    'coverageCount', (coverage_result ->> 'coverageCount')::integer,
    'readAfterWriteVerified', true
  );
end;
$$;

revoke all on function public.forge_cartera010b_confirm_identity_policy_and_coverages(jsonb, jsonb, jsonb)
  from public, anon;
grant execute on function public.forge_cartera010b_confirm_identity_policy_and_coverages(jsonb, jsonb, jsonb)
  to authenticated;

-- Safe projection for future Cartera/Aura consumption. Absence of child rows is
-- not represented as proof that the Policy has no coverage.
create or replace function public.forge_policy_intelligence_read_policy_coverages(
  p_policy_reference text
)
returns jsonb
language plpgsql
security definer
stable
set search_path = public, pg_temp
as $$
declare
  actor_id uuid := auth.uid();
  policy_row public.canonical_policies%rowtype;
  current_policy_version public.policy_versions%rowtype;
  detail_state text;
  coverage_payload jsonb;
begin
  if actor_id is null then
    raise exception 'POLICY_COVERAGE_AUTH_REQUIRED';
  end if;
  if p_policy_reference is null
     or p_policy_reference !~ '^[A-Za-z0-9][A-Za-z0-9._:@/-]{0,239}$' then
    raise exception 'POLICY_COVERAGE_POLICY_REFERENCE_INVALID';
  end if;

  select * into policy_row
  from public.canonical_policies p
  where p.advisor_id = actor_id
    and p.policy_reference = p_policy_reference
    and p.archived_at is null;
  if policy_row.id is null then
    return jsonb_build_object(
      'status', 'NOT_FOUND',
      'policyReference', p_policy_reference,
      'coverageDetailState', 'UNKNOWN'
    );
  end if;

  select * into current_policy_version
  from public.policy_versions v
  where v.advisor_id = actor_id
    and v.policy_id = policy_row.id
    and v.version_number = policy_row.current_version
  order by v.confirmed_at desc
  limit 1;

  if not exists (
    select 1 from public.policy_coverages c
    where c.advisor_id = actor_id and c.policy_id = policy_row.id
      and c.archived_at is null
  ) then
    detail_state := case
      when policy_row.sum_insured is not null or policy_row.premium_amount is not null
        then 'LEGACY_POLICY_SUMMARY_ONLY'
      else 'COVERAGE_DETAIL_NOT_CAPTURED'
    end;
    coverage_payload := '[]'::jsonb;
  else
    if exists (
      select 1 from public.policy_coverages c
      where c.advisor_id = actor_id and c.policy_id = policy_row.id
        and c.archived_at is null
        and (
          c.verification_state <> 'CONFIRMED'
          or c.completeness_state <> 'COMPLETE'
          or c.freshness_state <> 'CURRENT'
          or c.conflict_state <> 'CLEAR'
        )
    ) then
      detail_state := 'COVERAGE_DETAIL_PARTIAL';
    else
      detail_state := 'COVERAGE_DETAIL_AVAILABLE';
    end if;

    select coalesce(jsonb_agg(item order by item ->> 'coverageReference'), '[]'::jsonb)
    into coverage_payload
    from (
      select jsonb_build_object(
        'coverageReference', c.policy_coverage_reference,
        'productCoverageReference', c.product_coverage_reference,
        'code', c.coverage_code,
        'label', c.coverage_label,
        'kind', c.coverage_kind,
        'coverageState', c.coverage_state,
        'sumInsured', c.sum_insured,
        'currency', c.currency,
        'premiumAmount', c.premium_amount,
        'premiumCurrency', c.premium_currency,
        'annexReference', c.annex_reference,
        'riderReference', c.rider_reference,
        'effectiveFrom', c.effective_from,
        'effectiveTo', c.effective_to,
        'coveragePeriod', case
          when c.coverage_period_value is null then null
          else jsonb_build_object('value', c.coverage_period_value, 'unit', c.coverage_period_unit)
        end,
        'paymentPeriod', case
          when c.payment_period_value is null then null
          else jsonb_build_object('value', c.payment_period_value, 'unit', c.payment_period_unit)
        end,
        'truthState', jsonb_build_object(
          'verification', c.verification_state,
          'completeness', c.completeness_state,
          'freshness', c.freshness_state,
          'conflict', c.conflict_state
        ),
        'currentVersion', c.current_version
      ) as item
      from public.policy_coverages c
      where c.advisor_id = actor_id
        and c.policy_id = policy_row.id
        and c.archived_at is null
    ) safe_projection;
  end if;

  return jsonb_build_object(
    'status', 'OK',
    'policyReference', policy_row.policy_reference,
    'policyVersionReference', current_policy_version.policy_version_reference,
    'coverageDetailState', detail_state,
    'coverages', coverage_payload
  );
end;
$$;

revoke all on function public.forge_policy_intelligence_read_policy_coverages(text)
  from public, anon;
grant execute on function public.forge_policy_intelligence_read_policy_coverages(text)
  to authenticated;

comment on table public.policy_coverages is
  'Policy Intelligence-owned current projection of evidence-backed contracted Policy Coverage. Product coverage references are taxonomy only and do not prove contraction.';
comment on table public.policy_coverage_versions is
  'Append-only Policy Coverage history bound to exact PolicyVersion and Policy Evidence Version.';
comment on function public.forge_policy_intelligence_confirm_policy_coverages(jsonb) is
  'Governed human-confirmed child command for Policy Coverage. Reuses CARTERA 010B idempotency/evidence/conflict authority; no automatic confirmation.';
comment on function public.forge_policy_intelligence_read_policy_coverages(text) is
  'Safe Policy Coverage projection with honest legacy/no-detail states and no beneficiary/raw-document/internal-id exposure.';

commit;
