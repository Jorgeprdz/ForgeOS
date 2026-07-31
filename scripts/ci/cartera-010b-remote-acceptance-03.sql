        'contractType','FORGE_POLICY_ROLE','schemaVersion','1.0.0',
        'policyRoleReference','CARTERA010B_ACCEPTANCE:ROLE:OWNER:' || suffix,
        'policyReference',policy_reference,'advisorId',user_a::text,
        'participantPersonReference',person_b_reference,
        'participantAccountReference',null,'roleType','POLICY_OWNER',
        'confirmationState','CONFIRMED','privacyClassification','PRIVATE',
        'visibilityScope','POLICY_TEAM',
        'evidenceReferences',jsonb_build_array(evidence_v1),
        'effectiveFrom',t_policy_v1,'effectiveTo',null,
        'createdAt',t_policy_v1,'createdBy',user_a::text,'version',1,
        'correctionOf',null,'archivedAt',null,'archivedBy',null,'archiveReason',null
      ),
      jsonb_build_object(
        'contractType','FORGE_POLICY_ROLE','schemaVersion','1.0.0',
        'policyRoleReference','CARTERA010B_ACCEPTANCE:ROLE:INSURED:' || suffix,
        'policyReference',policy_reference,'advisorId',user_a::text,
        'participantPersonReference',person_b_reference,
        'participantAccountReference',null,'roleType','INSURED',
        'confirmationState','CONFIRMED','privacyClassification','PRIVATE',
        'visibilityScope','POLICY_TEAM',
        'evidenceReferences',jsonb_build_array(evidence_v1),
        'effectiveFrom',t_policy_v1,'effectiveTo',null,
        'createdAt',t_policy_v1,'createdBy',user_a::text,'version',1,
        'correctionOf',null,'archivedAt',null,'archivedBy',null,'archiveReason',null
      ),
      jsonb_build_object(
        'contractType','FORGE_POLICY_ROLE','schemaVersion','1.0.0',
        'policyRoleReference','CARTERA010B_ACCEPTANCE:ROLE:PAYOR:' || suffix,
        'policyReference',policy_reference,'advisorId',user_a::text,
        'participantPersonReference',null,
        'participantAccountReference',account_reference,'roleType','PAYOR',
        'confirmationState','CONFIRMED','privacyClassification','PRIVATE',
        'visibilityScope','POLICY_TEAM',
        'evidenceReferences',jsonb_build_array(evidence_v1),
        'effectiveFrom',t_policy_v1,'effectiveTo',null,
        'createdAt',t_policy_v1,'createdBy',user_a::text,'version',1,
        'correctionOf',null,'archivedAt',null,'archivedBy',null,'archiveReason',null
      ),
      jsonb_build_object(
        'contractType','FORGE_POLICY_ROLE','schemaVersion','1.0.0',
        'policyRoleReference','CARTERA010B_ACCEPTANCE:ROLE:BENEFICIARY:' || suffix,
        'policyReference',policy_reference,'advisorId',user_a::text,
        'participantPersonReference',person_a_reference,
        'participantAccountReference',null,'roleType','BENEFICIARY',
        'confirmationState','CONFIRMED','privacyClassification','RESTRICTED',
        'visibilityScope','RESTRICTED_ROLE_VIEW',
        'evidenceReferences',jsonb_build_array(evidence_v1),
        'effectiveFrom',t_policy_v1,'effectiveTo',null,
        'createdAt',t_policy_v1,'createdBy',user_a::text,'version',1,
        'correctionOf',null,'archivedAt',null,'archivedBy',null,'archiveReason',null
      )
    ),
    'evidence',jsonb_build_object(
      'evidenceVersionReference',evidence_v1,
      'documentHash',repeat('a',64),
      'sourceType','ISSUED_POLICY_DOCUMENT',
      'observedAt',t_policy_v1,
      'verificationState','CONFIRMED',
      'fieldClaims',jsonb_build_object('policyNumber',policy_number),
      'provenance',jsonb_build_object('sourceSystem','POLICY_INTELLIGENCE')
    ),
    'lineage',jsonb_build_object(
      'quoteReference',null,
      'applicationReference',null,
      'previousPolicyVersionReference',null
    ),
    'commandDigest',repeat('e',64)
  );

  perform set_config('request.jwt.claim.sub', user_a::text, true);
  perform set_config('request.jwt.claim.role', 'authenticated', true);
  execute 'set local role authenticated';

  response := public.forge_cartera010b_confirm_policy_with_parties(policy_command_v1);
  if response ->> 'status' <> 'CONFIRMED'
     or (response ->> 'policyVersion')::integer <> 1
     or (response ->> 'roleCount')::integer <> 4
     or coalesce((response ->> 'replayed')::boolean, true) then
    raise exception 'CARTERA010B_POLICY_V1_INVALID';
  end if;
  policy_v1_reference := response ->> 'policyVersionReference';

  replay := public.forge_cartera010b_confirm_policy_with_parties(
    jsonb_set(policy_command_v1, '{commandDigest}', to_jsonb(repeat('1',64)))
  );
  if not coalesce((replay ->> 'replayed')::boolean, false)
     or replay ->> 'policyVersionReference' <> policy_v1_reference then
    raise exception 'CARTERA010B_POLICY_REPLAY_INVALID';
  end if;

  changed := public.forge_cartera010b_confirm_policy_with_parties(
    jsonb_set(policy_command_v1, '{policy,status,value}', '"ACTIVE"'::jsonb)
  );
  if changed ->> 'status' <> 'CONFLICT'
     or changed ->> 'conflictType' <> 'CHANGED_INPUT_REPLAY' then
    raise exception 'CARTERA010B_POLICY_CHANGED_REPLAY_NOT_CONFLICT';
  end if;

  select count(*) into row_count
  from public.canonical_policies p
  where p.advisor_id = user_a and p.policy_reference = policy_reference;
  if row_count <> 1 then raise exception 'CARTERA010B_POLICY_COUNT_INVALID'; end if;

  select count(*) into row_count
  from public.policy_versions v
  join public.canonical_policies p on p.id = v.policy_id and p.advisor_id = v.advisor_id
  where p.advisor_id = user_a and p.policy_reference = policy_reference;
  if row_count <> 1 then raise exception 'CARTERA010B_POLICY_VERSION_COUNT_INVALID'; end if;

  select count(*) into row_count
  from public.policy_roles r
  join public.canonical_policies p on p.id = r.policy_id and p.advisor_id = r.advisor_id
  where p.advisor_id = user_a and p.policy_reference = policy_reference;
  if row_count <> 4 then raise exception 'CARTERA010B_POLICY_ROLE_COUNT_INVALID'; end if;

  begin
    perform 1 from public.policy_roles limit 1;
    raise exception 'CARTERA010B_RESTRICTED_ROLE_TABLE_READ_UNEXPECTED';
  exception when insufficient_privilege then null;
  end;

  select count(*) into row_count from public.cartera_policy_roles_general;
  if row_count <> 3 then
    raise exception 'CARTERA010B_GENERAL_ROLE_VIEW_INVALID';
  end if;

  if exists (
    select 1 from public.cartera_policy_roles_general
    where role_type = 'BENEFICIARY'
       or visibility_scope <> 'POLICY_TEAM'
  ) then
    raise exception 'CARTERA010B_RESTRICTED_ROLE_LEAK';
  end if;

  execute 'reset role';

  policy_command_v2 := jsonb_set(
    jsonb_set(
      jsonb_set(
        jsonb_set(
          policy_command_v1,
          '{idempotencyKey}',
          to_jsonb('CARTERA010B_ACCEPTANCE:POLICY:V2:' || suffix)
        ),
        '{confirmedAt}',
        to_jsonb(t_policy_v2)
      ),
      '{policy,currentVersion}',
      '2'::jsonb
    ),
