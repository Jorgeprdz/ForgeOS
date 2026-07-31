
  identity_command_b := jsonb_build_object(
    'contractType','FORGE_IDENTITY_RESOLUTION_COMMAND',
    'contractVersion','CARTERA-010B.1',
    'advisorId',user_a::text,
    'actorReference',user_a::text,
    'idempotencyKey','CARTERA010B_ACCEPTANCE:IDENTITY:B:' || suffix,
    'decidedAt',t_identity + interval '30 seconds',
    'outcome','CREATE_CONFIRMED',
    'sourceIdentity',jsonb_build_object(
      'sourceDomain','ADVISOR_OS_MANUAL',
      'sourceIdentityType','MANUAL_RECORD',
      'sourceRecordReference',source_record_b,
      'prospectReference',null
    ),
    'existingPersonReference',null,
    'newPerson',jsonb_build_object(
      'personReference',person_b_reference,
      'displayName','Persona B aceptación remota',
      'preferredName','Persona B',
      'normalizedName','persona b aceptacion remota',
      'verifiedPhone',null,
      'verifiedEmail',null,
      'birthDate',null,
      'privacyClassification','PRIVATE'
    ),
    'candidatePersonReferences','[]'::jsonb,
    'evidenceReferences',jsonb_build_array('CARTERA010B_ACCEPTANCE:IDENTITY_EVIDENCE:B:' || suffix),
    'reasonCode','ADVISOR_CONFIRMED_NEW_PERSON'
  );
  response := public.forge_cartera010b_confirm_identity_resolution(identity_command_b);
  if response ->> 'status' <> 'CONFIRMED'
     or response ->> 'personReference' <> person_b_reference then
    raise exception 'CARTERA010B_SECOND_PERSON_CREATE_INVALID';
  end if;

  identity_correction := jsonb_build_object(
    'contractType','FORGE_IDENTITY_RESOLUTION_COMMAND',
    'contractVersion','CARTERA-010B.1',
    'advisorId',user_a::text,
    'actorReference',user_a::text,
    'idempotencyKey','CARTERA010B_ACCEPTANCE:IDENTITY:CORRECT:' || suffix,
    'decidedAt',t_correction,
    'outcome','CORRECTED',
    'sourceIdentity',jsonb_build_object(
      'sourceDomain','ADVISOR_OS_SALES',
      'sourceIdentityType','PROSPECT',
      'sourceRecordReference',source_record_a,
      'prospectReference',prospect_a::text
    ),
    'existingPersonReference',person_b_reference,
    'newPerson',null,
    'candidatePersonReferences',jsonb_build_array(person_a_reference,person_b_reference),
    'evidenceReferences',jsonb_build_array('CARTERA010B_ACCEPTANCE:IDENTITY_CORRECTION:' || suffix),
    'reasonCode','ADVISOR_CONFIRMED_CORRECTION'
  );
  response := public.forge_cartera010b_confirm_identity_resolution(identity_correction);
  if response ->> 'status' <> 'CONFIRMED'
     or response ->> 'outcome' <> 'CORRECTED'
     or response ->> 'personReference' <> person_b_reference then
    raise exception 'CARTERA010B_IDENTITY_CORRECTION_INVALID';
  end if;

  select count(*) into row_count
  from public.commercial_source_identity_links
  where id = old_link_id
    and advisor_id = user_a
    and effective_to = t_correction;
  if row_count <> 1 then
    raise exception 'CARTERA010B_IDENTITY_PRIOR_LINK_NOT_CLOSED';
  end if;

  select count(*) into row_count
  from public.commercial_source_identity_links
  where advisor_id = user_a
    and source_record_reference = source_record_a
    and effective_to is null
    and person_id = (
      select id from public.commercial_people
      where advisor_id = user_a and person_reference = person_b_reference
    );
  if row_count <> 1 then
    raise exception 'CARTERA010B_IDENTITY_CORRECTED_LINK_NOT_ACTIVE';
  end if;

  begin
    insert into public.commercial_people (
      advisor_id,person_reference,display_name,normalized_name,lifecycle_state,
      privacy_classification,created_by
    ) values (
      user_a,'CARTERA010B_ACCEPTANCE:DIRECT:' || suffix,
      'Direct write','direct write','CONFIRMED','PRIVATE',user_a
    );
    raise exception 'CARTERA010B_DIRECT_PERSON_WRITE_UNEXPECTED';
  exception when insufficient_privilege then null;
  end;

  execute 'reset role';

  policy_command_v1 := jsonb_build_object(
    'contractType','FORGE_CONFIRMED_POLICY_COMMAND',
    'contractVersion','CARTERA-010B.1',
    'advisorId',user_a::text,
    'actorReference',user_a::text,
    'idempotencyKey','CARTERA010B_ACCEPTANCE:POLICY:V1:' || suffix,
    'confirmedAt',t_policy_v1,
    'policy',jsonb_build_object(
      'contractType','FORGE_CANONICAL_POLICY',
      'schemaVersion','2.0.0',
      'policyReference',policy_reference,
      'advisorId',user_a::text,
      'carrierReference','CARRIER:SMNYL',
      'policyNumber',policy_number,
      'productReference','PRODUCT:ORVI',
      'issueDate',null,
      'effectiveFrom',null,
      'effectiveTo',null,
      'status',jsonb_build_object(
        'value','UNKNOWN',
        'source',evidence_v1,
        'asOf',t_policy_v1
      ),
      'currency',null,
      'premiumAmount',null,
      'paymentFrequency',null,
      'sumInsured',null,
      'completenessState','PARTIAL',
      'freshnessState','UNKNOWN',
      'conflictState','CLEAR',
      'evidenceVersionReferences',jsonb_build_array(evidence_v1),
      'currentVersion',1,
      'createdAt',t_policy_v1,
      'createdBy',user_a::text,
      'updatedAt',t_policy_v1,
      'archivedAt',null,
      'archivedBy',null,
      'archiveReason',null
    ),
    'roles',jsonb_build_array(
      jsonb_build_object(
