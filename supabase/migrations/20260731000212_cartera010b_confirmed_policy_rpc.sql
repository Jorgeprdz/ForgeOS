-- CARTERA 010B.3B GOVERNED CONFIRMED POLICY WITH PARTIES RPC
-- Repository implementation only. This migration is NOT remote deployment authorization.

begin;

-- PolicyRole history remains immutable except for one governed temporal action:
-- closing the effective period of the exact role version being superseded.
create or replace function public.forge_cartera010b_policy_role_supersession_guard()
returns trigger
language plpgsql
security invoker
set search_path = public, pg_temp
as $$
begin
  if tg_op = 'DELETE' then
    raise exception 'CARTERA010B_APPEND_ONLY';
  end if;

  if current_setting('forge.cartera010b_governed_command', true) <> 'on' then
    raise exception 'CARTERA010B_APPEND_ONLY';
  end if;

  if new.id is distinct from old.id
     or new.advisor_id is distinct from old.advisor_id
     or new.policy_role_reference is distinct from old.policy_role_reference
     or new.policy_id is distinct from old.policy_id
     or new.policy_version_id is distinct from old.policy_version_id
     or new.participant_person_id is distinct from old.participant_person_id
     or new.participant_account_id is distinct from old.participant_account_id
     or new.role_type is distinct from old.role_type
     or new.confirmation_state is distinct from old.confirmation_state
     or new.privacy_classification is distinct from old.privacy_classification
     or new.visibility_scope is distinct from old.visibility_scope
     or new.evidence_references is distinct from old.evidence_references
     or new.effective_from is distinct from old.effective_from
     or new.role_version is distinct from old.role_version
     or new.correction_of is distinct from old.correction_of
     or new.created_at is distinct from old.created_at
     or new.created_by is distinct from old.created_by
     or new.archived_at is distinct from old.archived_at
     or new.archived_by is distinct from old.archived_by
     or new.archive_reason is distinct from old.archive_reason then
    raise exception 'CARTERA010B_POLICY_ROLE_SUPERSESSION_FIELDS_INVALID';
  end if;

  if old.effective_to is not null
     or new.effective_to is null
     or new.effective_to <= old.effective_from then
    raise exception 'CARTERA010B_POLICY_ROLE_SUPERSESSION_RANGE_INVALID';
  end if;

  return new;
end;
$$;

drop trigger if exists forge_cartera010b_append_only_guard
  on public.policy_roles;
drop trigger if exists forge_cartera010b_policy_role_supersession_guard
  on public.policy_roles;
create trigger forge_cartera010b_policy_role_supersession_guard
before update or delete on public.policy_roles
for each row execute function public.forge_cartera010b_policy_role_supersession_guard();

create or replace function public.forge_cartera010b_confirm_policy_with_parties(
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
  command_digest text;
  idempotency_key text;
  confirmed_at timestamptz;
  policy jsonb;
  roles jsonb;
  evidence jsonb;
  lineage jsonb;
  policy_reference text;
  carrier_reference text;
  policy_number text;
  product_reference text;
  requested_version integer;
  evidence_reference text;
  evidence_observed_at timestamptz;
  issue_date date;
  policy_effective_from timestamptz;
  policy_effective_to timestamptz;
  status_as_of timestamptz;
  premium_amount numeric;
  sum_insured numeric;
  reference_policy public.canonical_policies%rowtype;
  number_policy public.canonical_policies%rowtype;
  persisted_policy public.canonical_policies%rowtype;
  previous_version public.policy_versions%rowtype;
  existing_evidence public.policy_evidence_versions%rowtype;
  evidence_version_id uuid;
  policy_version_id uuid := gen_random_uuid();
  policy_version_reference text;
  facts_digest text;
  role jsonb;
  role_reference text;
  role_version integer;
  role_effective_from timestamptz;
  role_effective_to timestamptz;
  correction_reference text;
  correction_role public.policy_roles%rowtype;
  person_id uuid;
  account_id uuid;
  replay jsonb;
  response jsonb;
begin
  if actor_id is null then
    raise exception 'CARTERA010B_AUTH_REQUIRED';
  end if;

  if not public.forge_cartera010b_jsonb_keys_allowed(
       p_command,
       array[
         'contractType','contractVersion','advisorId','actorReference',
         'idempotencyKey','confirmedAt','policy','roles','evidence',
         'lineage','commandDigest'
       ]
     )
     or p_command ->> 'contractType' <> 'FORGE_CONFIRMED_POLICY_COMMAND'
     or p_command ->> 'contractVersion' <> 'CARTERA-010B.1' then
    raise exception 'CARTERA010B_POLICY_COMMAND_CONTRACT_INVALID';
  end if;

  begin
    advisor_id := (p_command ->> 'advisorId')::uuid;
    confirmed_at := (p_command ->> 'confirmedAt')::timestamptz;
  exception when others then
    raise exception 'CARTERA010B_POLICY_COMMAND_FIELDS_INVALID';
  end;

  if advisor_id <> actor_id
     or p_command ->> 'actorReference' <> actor_id::text then
    raise exception 'CARTERA010B_POLICY_COMMAND_OWNER_MISMATCH';
  end if;

  idempotency_key := nullif(btrim(p_command ->> 'idempotencyKey'), '');
  policy := p_command -> 'policy';
  roles := p_command -> 'roles';
  evidence := p_command -> 'evidence';
  lineage := coalesce(p_command -> 'lineage', '{}'::jsonb);

  if idempotency_key is null
     or idempotency_key !~ '^[A-Za-z0-9][A-Za-z0-9._:@/-]{0,159}$'
     or confirmed_at is null
     or confirmed_at > now() + interval '5 minutes'
     or not public.forge_cartera010b_jsonb_keys_allowed(
       policy,
       array[
         'contractType','schemaVersion','policyReference','advisorId',
         'carrierReference','policyNumber','productReference','issueDate',
         'effectiveFrom','effectiveTo','status','currency','premiumAmount',
         'paymentFrequency','sumInsured','completenessState','freshnessState',
         'conflictState','evidenceVersionReferences','currentVersion',
         'createdAt','createdBy','updatedAt','archivedAt','archivedBy',
         'archiveReason'
       ]
     )
     or roles is null or jsonb_typeof(roles) <> 'array'
     or jsonb_array_length(roles) < 1 or jsonb_array_length(roles) > 100
     or not public.forge_cartera010b_jsonb_keys_allowed(
       evidence,
       array[
         'evidenceVersionReference','documentHash','sourceType','observedAt',
         'verificationState','fieldClaims','provenance'
       ]
     )
     or not public.forge_cartera010b_jsonb_keys_allowed(
       lineage,
       array['quoteReference','applicationReference','previousPolicyVersionReference']
     ) then
    raise exception 'CARTERA010B_POLICY_COMMAND_INVALID';
  end if;

  policy_reference := nullif(btrim(policy ->> 'policyReference'), '');
  carrier_reference := nullif(btrim(policy ->> 'carrierReference'), '');
  policy_number := nullif(btrim(policy ->> 'policyNumber'), '');
  product_reference := nullif(btrim(policy ->> 'productReference'), '');
  evidence_reference := nullif(btrim(evidence ->> 'evidenceVersionReference'), '');

  if policy ->> 'contractType' <> 'FORGE_CANONICAL_POLICY'
     or policy ->> 'schemaVersion' <> '2.0.0'
     or policy ->> 'advisorId' <> actor_id::text
     or policy ->> 'createdBy' <> actor_id::text
     or policy_reference is null
     or policy_reference !~ '^[A-Za-z0-9][A-Za-z0-9._:@/-]{0,239}$'
     or carrier_reference is null
     or carrier_reference !~ '^[A-Za-z0-9][A-Za-z0-9._:@/-]{0,239}$'
     or policy_number is null or length(policy_number) > 160
     or product_reference is null
     or product_reference !~ '^[A-Za-z0-9][A-Za-z0-9._:@/-]{0,239}$'
     or policy ->> 'conflictState' <> 'CLEAR'
     or nullif(btrim(policy ->> 'archivedAt'), '') is not null
     or nullif(btrim(policy ->> 'archivedBy'), '') is not null
     or nullif(btrim(policy ->> 'archiveReason'), '') is not null
     or not public.forge_cartera010b_jsonb_keys_allowed(
       policy -> 'status', array['value','source','asOf']
     )
     or policy -> 'status' ->> 'value' not in (
       'PENDING','ISSUED','ACTIVE','SUSPENDED','LAPSED','CANCELLED',
       'MATURED','CLAIMED','UNKNOWN'
     )
     or policy -> 'status' ->> 'source' !~ '^[A-Za-z0-9][A-Za-z0-9._:@/-]{0,239}$'
     or policy ->> 'completenessState' not in ('COMPLETE','PARTIAL','UNKNOWN')
     or policy ->> 'freshnessState' not in ('CURRENT','STALE','UNKNOWN')
     or not public.forge_cartera010b_reference_array_valid(
       policy -> 'evidenceVersionReferences', 1, 100
     )
     or evidence_reference is null
     or not (policy -> 'evidenceVersionReferences' ? evidence_reference)
     or evidence ->> 'documentHash' !~ '^[a-f0-9]{64}$'
     or evidence ->> 'sourceType' !~ '^[A-Za-z0-9][A-Za-z0-9._:@/-]{0,119}$'
     or evidence ->> 'verificationState' not in ('REVIEWED', 'CONFIRMED')
     or jsonb_typeof(evidence -> 'fieldClaims') <> 'object'
     or jsonb_typeof(evidence -> 'provenance') <> 'object' then
    raise exception 'CARTERA010B_CONFIRMED_POLICY_PAYLOAD_INVALID';
  end if;

  begin
    requested_version := (policy ->> 'currentVersion')::integer;
    issue_date := nullif(btrim(policy ->> 'issueDate'), '')::date;
    policy_effective_from := nullif(btrim(policy ->> 'effectiveFrom'), '')::timestamptz;
    policy_effective_to := nullif(btrim(policy ->> 'effectiveTo'), '')::timestamptz;
    status_as_of := (policy -> 'status' ->> 'asOf')::timestamptz;
    evidence_observed_at := (evidence ->> 'observedAt')::timestamptz;
    premium_amount := nullif(btrim(policy ->> 'premiumAmount'), '')::numeric;
    sum_insured := nullif(btrim(policy ->> 'sumInsured'), '')::numeric;
    perform (policy ->> 'createdAt')::timestamptz;
    perform (policy ->> 'updatedAt')::timestamptz;
  exception when others then
    raise exception 'CARTERA010B_CONFIRMED_POLICY_TYPES_INVALID';
  end;

  if requested_version < 1
     or status_as_of is null or status_as_of > confirmed_at + interval '5 minutes'
     or evidence_observed_at is null or evidence_observed_at > confirmed_at + interval '5 minutes'
     or (policy_effective_from is not null and policy_effective_to is not null
         and policy_effective_to <= policy_effective_from)
     or premium_amount < 0 or sum_insured < 0
     or (policy ->> 'currency' is not null
         and policy ->> 'currency' !~ '^[A-Z]{3}$')
     or (policy ->> 'paymentFrequency' is not null
         and policy ->> 'paymentFrequency' not in (
           'MONTHLY','QUARTERLY','SEMIANNUAL','ANNUAL','SINGLE','OTHER'
         ))
     or (nullif(btrim(lineage ->> 'quoteReference'), '') is not null
         and lineage ->> 'quoteReference' !~ '^[A-Za-z0-9][A-Za-z0-9._:@/-]{0,239}$')
     or (nullif(btrim(lineage ->> 'applicationReference'), '') is not null
         and lineage ->> 'applicationReference' !~ '^[A-Za-z0-9][A-Za-z0-9._:@/-]{0,239}$')
     or (nullif(btrim(lineage ->> 'previousPolicyVersionReference'), '') is not null
         and lineage ->> 'previousPolicyVersionReference' !~ '^[A-Za-z0-9][A-Za-z0-9._:@/-]{0,239}$') then
    raise exception 'CARTERA010B_CONFIRMED_POLICY_VALUES_INVALID';
  end if;

  if (
    select count(*) from jsonb_array_elements(roles)
  ) <> (
    select count(distinct concat_ws('|', value ->> 'policyRoleReference', value ->> 'version'))
    from jsonb_array_elements(roles)
  ) then
    raise exception 'CARTERA010B_POLICY_ROLE_DUPLICATE_VERSION';
  end if;

  command_digest := public.forge_cartera010b_command_digest(p_command);
  perform pg_advisory_xact_lock(hashtextextended(
    actor_id::text || '|CONFIRMED_POLICY|' || idempotency_key, 0
  ));
  perform pg_advisory_xact_lock(hashtextextended(
    actor_id::text || '|POLICY_NUMBER|' || carrier_reference || '|' || policy_number, 0
  ));
  perform pg_advisory_xact_lock(hashtextextended(
    actor_id::text || '|POLICY_REFERENCE|' || policy_reference, 0
  ));

  replay := public.forge_cartera010b_existing_receipt_response(
    actor_id, 'CONFIRMED_POLICY', idempotency_key, command_digest,
    policy -> 'evidenceVersionReferences',
    jsonb_build_object('policyReference', policy_reference)
  );
  if replay is not null then
    return replay;
  end if;

  select * into reference_policy
  from public.canonical_policies p
  where p.advisor_id = actor_id and p.policy_reference = policy_reference
  for update;

  select * into number_policy
  from public.canonical_policies p
  where p.advisor_id = actor_id
    and p.carrier_reference = carrier_reference
    and p.policy_number = policy_number
  for update;

  if number_policy.id is not null
     and (reference_policy.id is null or number_policy.id <> reference_policy.id) then
    return public.forge_cartera010b_record_command_conflict(
      actor_id, 'CONFIRMED_POLICY', idempotency_key, command_digest,
      'POLICY_NUMBER_COLLISION', number_policy.id,
      jsonb_build_object(
        'incomingPolicyReference', policy_reference,
        'existingPolicyReference', number_policy.policy_reference,
        'carrierReference', carrier_reference,
        'policyNumber', policy_number
      ),
      policy -> 'evidenceVersionReferences', null, confirmed_at
    );
  end if;

  if reference_policy.id is not null and (
    reference_policy.carrier_reference <> carrier_reference
    or reference_policy.policy_number <> policy_number
  ) then
    return public.forge_cartera010b_record_command_conflict(
      actor_id, 'CONFIRMED_POLICY', idempotency_key, command_digest,
      'FIELD_CLAIM_CONFLICT', reference_policy.id,
      jsonb_build_object(
        'policyReference', policy_reference,
        'incomingCarrierReference', carrier_reference,
        'existingCarrierReference', reference_policy.carrier_reference,
        'incomingPolicyNumber', policy_number,
        'existingPolicyNumber', reference_policy.policy_number
      ),
      policy -> 'evidenceVersionReferences', null, confirmed_at
    );
  end if;

  select * into existing_evidence
  from public.policy_evidence_versions e
  where e.advisor_id = actor_id
    and e.evidence_version_reference = evidence_reference;

  if existing_evidence.id is not null then
    return public.forge_cartera010b_record_command_conflict(
      actor_id, 'CONFIRMED_POLICY', idempotency_key, command_digest,
      'EVIDENCE_CONFLICT', existing_evidence.policy_id,
      jsonb_build_object('evidenceVersionReference', evidence_reference),
      policy -> 'evidenceVersionReferences', existing_evidence.document_hash,
      confirmed_at
    );
  end if;

  if reference_policy.id is null then
    if requested_version <> 1
       or nullif(btrim(lineage ->> 'previousPolicyVersionReference'), '') is not null then
      raise exception 'CARTERA010B_NEW_POLICY_VERSION_INVALID';
    end if;
  else
    if reference_policy.archived_at is not null
       or requested_version <> reference_policy.current_version + 1 then
      raise exception 'CARTERA010B_POLICY_VERSION_SEQUENCE_INVALID';
    end if;

    select * into previous_version
    from public.policy_versions v
    where v.advisor_id = actor_id
      and v.policy_id = reference_policy.id
      and v.version_number = reference_policy.current_version;

    if previous_version.id is null
       or lineage ->> 'previousPolicyVersionReference'
          is distinct from previous_version.policy_version_reference then
      raise exception 'CARTERA010B_PREVIOUS_POLICY_VERSION_MISMATCH';
    end if;
  end if;

  -- Validate every role and participant before inserting the Policy current row.
  for role in select value from jsonb_array_elements(roles)
  loop
    if not public.forge_cartera010b_jsonb_keys_allowed(
         role,
         array[
           'contractType','schemaVersion','policyRoleReference','policyReference',
           'advisorId','participantPersonReference','participantAccountReference',
           'roleType','confirmationState','privacyClassification','visibilityScope',
           'evidenceReferences','effectiveFrom','effectiveTo','createdAt','createdBy',
           'version','correctionOf','archivedAt','archivedBy','archiveReason'
         ]
       )
       or role ->> 'contractType' <> 'FORGE_POLICY_ROLE'
       or role ->> 'schemaVersion' <> '1.0.0'
       or role ->> 'advisorId' <> actor_id::text
       or role ->> 'createdBy' <> actor_id::text
       or role ->> 'policyReference' <> policy_reference
       or role ->> 'confirmationState' <> 'CONFIRMED'
       or role ->> 'roleType' not in (
         'POLICY_OWNER','INSURED','ADDITIONAL_INSURED','PAYOR','BENEFICIARY',
         'ADVISOR_OF_RECORD','ORIGINATING_ADVISOR','SERVICING_ADVISOR'
       )
       or role ->> 'privacyClassification' not in ('PRIVATE','SENSITIVE','RESTRICTED')
       or role ->> 'visibilityScope' not in (
         'POLICY_TEAM','OWNING_ADVISOR_ONLY','RESTRICTED_ROLE_VIEW'
       )
       or not public.forge_cartera010b_reference_array_valid(
         role -> 'evidenceReferences', 1, 100
       )
       or not (role -> 'evidenceReferences' ? evidence_reference)
       or nullif(btrim(role ->> 'archivedAt'), '') is not null
       or nullif(btrim(role ->> 'archivedBy'), '') is not null
       or nullif(btrim(role ->> 'archiveReason'), '') is not null then
      raise exception 'CARTERA010B_POLICY_ROLE_INVALID';
    end if;

    role_reference := nullif(btrim(role ->> 'policyRoleReference'), '');
    correction_reference := nullif(btrim(role ->> 'correctionOf'), '');
    begin
      role_version := (role ->> 'version')::integer;
      role_effective_from := (role ->> 'effectiveFrom')::timestamptz;
      role_effective_to := nullif(btrim(role ->> 'effectiveTo'), '')::timestamptz;
      perform (role ->> 'createdAt')::timestamptz;
    exception when others then
      raise exception 'CARTERA010B_POLICY_ROLE_TYPES_INVALID';
    end;

    if role_reference is null
       or role_reference !~ '^[A-Za-z0-9][A-Za-z0-9._:@/-]{0,239}$'
       or role_version < 1
       or role_effective_from is null
       or (role_effective_to is not null and role_effective_to <= role_effective_from)
       or (correction_reference is not null
           and correction_reference !~ '^[A-Za-z0-9][A-Za-z0-9._:@/-]{0,239}$')
       or (role ->> 'roleType' = 'BENEFICIARY'
           and role ->> 'visibilityScope' = 'POLICY_TEAM') then
      if role ->> 'roleType' = 'BENEFICIARY'
         and role ->> 'visibilityScope' = 'POLICY_TEAM' then
        raise exception 'CARTERA010B_BENEFICIARY_VISIBILITY_TOO_BROAD';
      end if;
      raise exception 'CARTERA010B_POLICY_ROLE_VALUES_INVALID';
    end if;

    if (nullif(btrim(role ->> 'participantPersonReference'), '') is null)
       = (nullif(btrim(role ->> 'participantAccountReference'), '') is null) then
      raise exception 'CARTERA010B_POLICY_ROLE_PARTICIPANT_XOR_INVALID';
    end if;

    person_id := null;
    account_id := null;
    if nullif(btrim(role ->> 'participantPersonReference'), '') is not null then
      select p.id into person_id
      from public.commercial_people p
      where p.advisor_id = actor_id
        and p.person_reference = role ->> 'participantPersonReference'
        and p.lifecycle_state = 'CONFIRMED' and p.archived_at is null;
      if person_id is null then
        raise exception 'CARTERA010B_POLICY_ROLE_PERSON_UNRESOLVED';
      end if;
    else
      select a.id into account_id
      from public.commercial_accounts a
      where a.advisor_id = actor_id
        and a.account_reference = role ->> 'participantAccountReference'
        and a.lifecycle_state = 'CONFIRMED' and a.archived_at is null;
      if account_id is null then
        raise exception 'CARTERA010B_POLICY_ROLE_ACCOUNT_UNRESOLVED';
      end if;
    end if;

    if reference_policy.id is null and correction_reference is not null then
      raise exception 'CARTERA010B_NEW_POLICY_ROLE_CORRECTION_FORBIDDEN';
    end if;
  end loop;

  if reference_policy.id is null then
    insert into public.canonical_policies (
      advisor_id, policy_reference, carrier_reference, policy_number,
      product_reference, issue_date, effective_from, effective_to,
      status_value, status_source, status_as_of, currency, premium_amount,
      payment_frequency, sum_insured, completeness_state, freshness_state,
      conflict_state, current_version, created_at, created_by, updated_at
    ) values (
      actor_id, policy_reference, carrier_reference, policy_number,
      product_reference, issue_date, policy_effective_from, policy_effective_to,
      policy -> 'status' ->> 'value', policy -> 'status' ->> 'source', status_as_of,
      nullif(btrim(policy ->> 'currency'), ''), premium_amount,
      nullif(btrim(policy ->> 'paymentFrequency'), ''), sum_insured,
      policy ->> 'completenessState', policy ->> 'freshnessState', 'CLEAR',
      requested_version, confirmed_at, actor_id, confirmed_at
    ) returning * into persisted_policy;
  else
    persisted_policy := reference_policy;
  end if;

  insert into public.policy_evidence_versions (
    advisor_id, evidence_version_reference, policy_id, document_hash,
    source_type, observed_at, verification_state, field_claims, provenance,
    created_at, created_by
  ) values (
    actor_id, evidence_reference, persisted_policy.id,
    evidence ->> 'documentHash', evidence ->> 'sourceType', evidence_observed_at,
    evidence ->> 'verificationState', evidence -> 'fieldClaims',
    evidence -> 'provenance', confirmed_at, actor_id
  ) returning id into evidence_version_id;

  facts_digest := public.forge_cartera010b_command_digest(policy);
  policy_version_reference := 'POLICY_VERSION:' || substr(
    encode(digest(
      actor_id::text || '|' || policy_reference || '|' ||
      requested_version::text || '|' || facts_digest,
      'sha256'
    ), 'hex'), 1, 40
  );

  insert into public.policy_versions (
    id, advisor_id, policy_id, policy_version_reference, version_number,
    facts, facts_digest, evidence_version_id, quote_reference,
    application_reference, previous_policy_version_id, confirmed_at, confirmed_by
  ) values (
    policy_version_id, actor_id, persisted_policy.id, policy_version_reference,
    requested_version, policy, facts_digest, evidence_version_id,
    nullif(btrim(lineage ->> 'quoteReference'), ''),
    nullif(btrim(lineage ->> 'applicationReference'), ''),
    previous_version.id, confirmed_at, actor_id
  );

  for role in select value from jsonb_array_elements(roles)
  loop
    role_reference := role ->> 'policyRoleReference';
    role_version := (role ->> 'version')::integer;
    role_effective_from := (role ->> 'effectiveFrom')::timestamptz;
    role_effective_to := nullif(btrim(role ->> 'effectiveTo'), '')::timestamptz;
    correction_reference := nullif(btrim(role ->> 'correctionOf'), '');
    person_id := null;
    account_id := null;
    correction_role.id := null;

    if nullif(btrim(role ->> 'participantPersonReference'), '') is not null then
      select p.id into person_id
      from public.commercial_people p
      where p.advisor_id = actor_id
        and p.person_reference = role ->> 'participantPersonReference';
    else
      select a.id into account_id
      from public.commercial_accounts a
      where a.advisor_id = actor_id
        and a.account_reference = role ->> 'participantAccountReference';
    end if;

    if correction_reference is not null then
      select * into correction_role
      from public.policy_roles r
      where r.advisor_id = actor_id
        and r.policy_id = persisted_policy.id
        and r.policy_role_reference = correction_reference
        and r.effective_to is null
      order by r.role_version desc limit 1 for update;

      if correction_role.id is null then
        raise exception 'CARTERA010B_POLICY_ROLE_CORRECTION_TARGET_NOT_FOUND';
      end if;

      perform set_config('forge.cartera010b_governed_command', 'on', true);
      update public.policy_roles
      set effective_to = role_effective_from
      where id = correction_role.id and advisor_id = actor_id;
    elsif reference_policy.id is not null and exists (
      select 1 from public.policy_roles r
      where r.advisor_id = actor_id
        and r.policy_id = persisted_policy.id
        and r.policy_role_reference = role_reference
        and r.effective_to is null
    ) then
      raise exception 'CARTERA010B_POLICY_ROLE_CORRECTION_REQUIRED';
    end if;

    insert into public.policy_roles (
      advisor_id, policy_role_reference, policy_id, policy_version_id,
      participant_person_id, participant_account_id, role_type,
      confirmation_state, privacy_classification, visibility_scope,
      evidence_references, effective_from, effective_to, role_version,
      correction_of, created_at, created_by
    ) values (
      actor_id, role_reference, persisted_policy.id, policy_version_id,
      person_id, account_id, role ->> 'roleType', 'CONFIRMED',
      role ->> 'privacyClassification', role ->> 'visibilityScope',
      role -> 'evidenceReferences', role_effective_from, role_effective_to,
      role_version, correction_role.id, confirmed_at, actor_id
    );
  end loop;

  if reference_policy.id is not null then
    update public.canonical_policies
    set product_reference = product_reference,
        issue_date = issue_date,
        effective_from = policy_effective_from,
        effective_to = policy_effective_to,
        status_value = policy -> 'status' ->> 'value',
        status_source = policy -> 'status' ->> 'source',
        status_as_of = status_as_of,
        currency = nullif(btrim(policy ->> 'currency'), ''),
        premium_amount = premium_amount,
        payment_frequency = nullif(btrim(policy ->> 'paymentFrequency'), ''),
        sum_insured = sum_insured,
        completeness_state = policy ->> 'completenessState',
        freshness_state = policy ->> 'freshnessState',
        conflict_state = 'CLEAR',
        current_version = requested_version,
        updated_at = confirmed_at
    where id = persisted_policy.id and advisor_id = actor_id
    returning * into persisted_policy;
  end if;

  response := jsonb_build_object(
    'status','CONFIRMED',
    'policyReference',policy_reference,
    'policyVersionReference',policy_version_reference,
    'policyVersion',requested_version,
    'evidenceVersionReference',evidence_reference,
    'roleCount',jsonb_array_length(roles),
    'idempotencyKey',idempotency_key,
    'serverCommandDigest',command_digest,
    'replayed',false
  );

  return public.forge_cartera010b_persist_receipt(
    actor_id, 'CONFIRMED_POLICY', idempotency_key,
    command_digest, response, confirmed_at
  );
end;
$$;

revoke all on function public.forge_cartera010b_confirm_policy_with_parties(jsonb)
  from public, anon;
grant execute on function public.forge_cartera010b_confirm_policy_with_parties(jsonb)
  to authenticated;

comment on function public.forge_cartera010b_confirm_policy_with_parties(jsonb) is
  'CARTERA 010B governed confirmed Policy mutation with server-owned digest, strict evidence, confirmed participants, multi-party roles and deterministic replay/conflict behavior.';

commit;
