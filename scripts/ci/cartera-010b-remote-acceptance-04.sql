    '{policy,evidenceVersionReferences}',
    jsonb_build_array(evidence_v2)
  );
  policy_command_v2 := jsonb_set(policy_command_v2,'{policy,status,source}',to_jsonb(evidence_v2));
  policy_command_v2 := jsonb_set(policy_command_v2,'{policy,status,asOf}',to_jsonb(t_policy_v2));
  policy_command_v2 := jsonb_set(policy_command_v2,'{policy,updatedAt}',to_jsonb(t_policy_v2));
  policy_command_v2 := jsonb_set(policy_command_v2,'{roles}',(
    select jsonb_agg(
      jsonb_set(
        jsonb_set(
          jsonb_set(
            jsonb_set(
              jsonb_set(value,'{evidenceReferences}',jsonb_build_array(evidence_v2)),
              '{effectiveFrom}',to_jsonb(t_policy_v2)
            ),
            '{createdAt}',to_jsonb(t_policy_v2)
          ),
          '{version}','2'::jsonb
        ),
        '{correctionOf}',to_jsonb(value ->> 'policyRoleReference')
      )
    )
    from jsonb_array_elements(policy_command_v1 -> 'roles')
  ));
  policy_command_v2 := jsonb_set(policy_command_v2,'{evidence}',jsonb_build_object(
    'evidenceVersionReference',evidence_v2,
    'documentHash',repeat('b',64),
    'sourceType','POLICY_STATUS_DOCUMENT',
    'observedAt',t_policy_v2,
    'verificationState','CONFIRMED',
    'fieldClaims',jsonb_build_object('status','ACTIVE'),
    'provenance',jsonb_build_object('sourceSystem','POLICY_INTELLIGENCE')
  ));
  policy_command_v2 := jsonb_set(
    policy_command_v2,
    '{lineage,previousPolicyVersionReference}',
    to_jsonb(policy_v1_reference)
  );
  policy_command_v2 := jsonb_set(policy_command_v2,'{commandDigest}',to_jsonb(repeat('d',64)));

  perform set_config('request.jwt.claim.sub', user_a::text, true);
  perform set_config('request.jwt.claim.role', 'authenticated', true);
  execute 'set local role authenticated';

  response := public.forge_cartera010b_confirm_policy_with_parties(policy_command_v2);
  if response ->> 'status' <> 'CONFIRMED'
     or (response ->> 'policyVersion')::integer <> 2
     or (response ->> 'roleCount')::integer <> 4 then
    raise exception 'CARTERA010B_POLICY_V2_INVALID';
  end if;
  policy_v2_reference := response ->> 'policyVersionReference';

  -- Version and temporal-history invariants require internal inspection of tables
  -- that remain intentionally unreadable by authenticated clients.
  execute 'reset role';

  select p.current_version into row_count
  from public.canonical_policies p
  where p.advisor_id = user_a and p.policy_reference = policy_reference;
  if row_count <> 2 then raise exception 'CARTERA010B_POLICY_CURRENT_VERSION_INVALID'; end if;

  select count(*) into row_count
  from public.policy_versions v
  join public.canonical_policies p on p.id = v.policy_id and p.advisor_id = v.advisor_id
  where p.advisor_id = user_a and p.policy_reference = policy_reference;
  if row_count <> 2 then raise exception 'CARTERA010B_POLICY_VERSION_TWO_COUNT_INVALID'; end if;

  select count(*) into old_role_closed_count
  from public.policy_roles r
  join public.canonical_policies p on p.id = r.policy_id and p.advisor_id = r.advisor_id
  where p.advisor_id = user_a
    and p.policy_reference = policy_reference
    and r.role_version = 1
    and r.effective_to = t_policy_v2;
  if old_role_closed_count <> 4 then
    raise exception 'CARTERA010B_POLICY_ROLE_SUPERSESSION_INVALID';
  end if;

  select count(*) into row_count
  from public.policy_roles r
  join public.canonical_policies p on p.id = r.policy_id and p.advisor_id = r.advisor_id
  where p.advisor_id = user_a
    and p.policy_reference = policy_reference
    and r.role_version = 2
    and r.effective_to is null;
  if row_count <> 4 then
    raise exception 'CARTERA010B_POLICY_ACTIVE_ROLE_VERSION_INVALID';
  end if;

  perform set_config('request.jwt.claim.sub', user_a::text, true);
  perform set_config('request.jwt.claim.role', 'authenticated', true);
  execute 'set local role authenticated';

  changed := public.forge_cartera010b_confirm_policy_with_parties(
    jsonb_set(
      jsonb_set(
        policy_command_v1,
        '{idempotencyKey}',
        to_jsonb('CARTERA010B_ACCEPTANCE:POLICY:COLLISION:' || suffix)
      ),
      '{policy,policyReference}',
      to_jsonb(collision_policy_reference)
    )
  );
  if changed ->> 'status' <> 'CONFLICT'
     or changed ->> 'conflictType' <> 'POLICY_NUMBER_COLLISION' then
    raise exception 'CARTERA010B_POLICY_NUMBER_COLLISION_NOT_RECORDED';
  end if;

  execute 'reset role';

  begin
    update public.policy_versions
    set facts = jsonb_build_object('tampered',true)
    where policy_version_reference = policy_v1_reference;
    raise exception 'CARTERA010B_POLICY_VERSION_MUTATION_UNEXPECTED';
  exception when others then
    if position('CARTERA010B_APPEND_ONLY' in sqlerrm) = 0 then raise; end if;
  end;

  begin
    delete from public.policy_roles
    where advisor_id = user_a and role_version = 1;
    raise exception 'CARTERA010B_POLICY_ROLE_DELETE_UNEXPECTED';
  exception when others then
    if position('CARTERA010B_APPEND_ONLY' in sqlerrm) = 0 then raise; end if;
  end;

  perform set_config('request.jwt.claim.sub', user_b::text, true);
  perform set_config('request.jwt.claim.role', 'authenticated', true);
  execute 'set local role authenticated';

  select count(*) into row_count from public.commercial_people;
  if row_count <> 0 then raise exception 'CARTERA010B_CROSS_ADVISOR_PERSON_LEAK'; end if;
  select count(*) into row_count from public.canonical_policies;
  if row_count <> 0 then raise exception 'CARTERA010B_CROSS_ADVISOR_POLICY_LEAK'; end if;
  select count(*) into row_count
  from public.forge_cartera010b_list_general_policy_roles(policy_reference);
  if row_count <> 0 then raise exception 'CARTERA010B_CROSS_ADVISOR_ROLE_LEAK'; end if;

  begin
    perform public.forge_cartera010b_confirm_identity_resolution(
      jsonb_set(
        jsonb_set(identity_command_a,'{advisorId}',to_jsonb(user_b::text)),
        '{actorReference}',to_jsonb(user_b::text)
      )
    );
    raise exception 'CARTERA010B_CROSS_ADVISOR_IDENTITY_COMMAND_UNEXPECTED';
  exception when others then
    if position('CARTERA010B_PROSPECT_NOT_OWNED' in sqlerrm) = 0 then raise; end if;
  end;

  execute 'reset role';

  perform set_config('request.jwt.claim.sub', '', true);
  perform set_config('request.jwt.claim.role', 'anon', true);
  execute 'set local role anon';
  begin
    perform public.forge_cartera010b_confirm_identity_resolution(identity_command_a);
    raise exception 'CARTERA010B_ANON_IDENTITY_EXECUTION_UNEXPECTED';
  exception when insufficient_privilege then null;
  end;
  begin
    perform public.forge_cartera010b_confirm_policy_with_parties(policy_command_v1);
    raise exception 'CARTERA010B_ANON_POLICY_EXECUTION_UNEXPECTED';
  exception when insufficient_privilege then null;
  end;
  begin
    perform public.forge_cartera010b_list_general_policy_roles(policy_reference);
    raise exception 'CARTERA010B_ANON_GENERAL_ROLE_READ_UNEXPECTED';
  exception when insufficient_privilege then null;
  end;
  execute 'reset role';

  raise notice 'PASS CARTERA010B_REMOTE_ACCEPTANCE';
end;
$cartera010b$;

rollback;
