begin;

do $cartera010b$
#variable_conflict use_variable
declare
  user_a uuid := gen_random_uuid();
  user_b uuid := gen_random_uuid();
  suffix text := replace(gen_random_uuid()::text, '-', '');
  prospect_a uuid;
  prospect_b uuid;
  account_a uuid;
  t_identity timestamptz := clock_timestamp() - interval '4 minutes';
  t_correction timestamptz := clock_timestamp() - interval '3 minutes';
  t_policy_v1 timestamptz := clock_timestamp() - interval '2 minutes';
  t_policy_v2 timestamptz := clock_timestamp() - interval '1 minute';
  person_a_reference text := 'CARTERA010B_ACCEPTANCE:PERSON:A:' || suffix;
  person_b_reference text := 'CARTERA010B_ACCEPTANCE:PERSON:B:' || suffix;
  account_reference text := 'CARTERA010B_ACCEPTANCE:ACCOUNT:A:' || suffix;
  source_record_a text := 'CARTERA010B_ACCEPTANCE:PROSPECT:' || suffix;
  source_record_b text := 'CARTERA010B_ACCEPTANCE:MANUAL:' || suffix;
  policy_reference text := 'CARTERA010B_ACCEPTANCE:POLICY:' || suffix;
  collision_policy_reference text := 'CARTERA010B_ACCEPTANCE:POLICY:COLLISION:' || suffix;
  policy_number text := 'REMOTE-' || upper(substr(suffix, 1, 18));
  evidence_v1 text := 'CARTERA010B_ACCEPTANCE:EVIDENCE:V1:' || suffix;
  evidence_v2 text := 'CARTERA010B_ACCEPTANCE:EVIDENCE:V2:' || suffix;
  identity_command_a jsonb;
  identity_command_b jsonb;
  identity_correction jsonb;
  policy_command_v1 jsonb;
  policy_command_v2 jsonb;
  response jsonb;
  replay jsonb;
  changed jsonb;
  policy_v1_reference text;
  policy_v2_reference text;
  row_count bigint;
  old_link_id uuid;
  old_role_closed_count bigint;
begin
  insert into auth.users (
    instance_id,id,aud,role,email,encrypted_password,email_confirmed_at,
    raw_app_meta_data,raw_user_meta_data,created_at,updated_at
  ) values
  (
    '00000000-0000-0000-0000-000000000000',user_a,
    'authenticated','authenticated','cartera010b-a-' || suffix || '@forge.invalid','',now(),
    '{"provider":"email","providers":["email"]}'::jsonb,'{}'::jsonb,now(),now()
  ),
  (
    '00000000-0000-0000-0000-000000000000',user_b,
    'authenticated','authenticated','cartera010b-b-' || suffix || '@forge.invalid','',now(),
    '{"provider":"email","providers":["email"]}'::jsonb,'{}'::jsonb,now(),now()
  );

  perform set_config('request.jwt.claim.sub', user_a::text, true);
  perform set_config('request.jwt.claim.role', 'authenticated', true);
  execute 'set local role authenticated';
  insert into public.prospects (
    advisor_id,alias,full_name,phone_normalized,source,initial_context
  ) values (
    user_a,'Cartera 010B A','Cartera 010B Advisor A',
    '525510' || right(suffix, 6),'cartera010b_remote_acceptance',
    'Temporal acceptance prospect A.'
  ) returning id into prospect_a;
  execute 'reset role';

  perform set_config('request.jwt.claim.sub', user_b::text, true);
  perform set_config('request.jwt.claim.role', 'authenticated', true);
  execute 'set local role authenticated';
  insert into public.prospects (
    advisor_id,alias,full_name,phone_normalized,source,initial_context
  ) values (
    user_b,'Cartera 010B B','Cartera 010B Advisor B',
    '525511' || right(suffix, 6),'cartera010b_remote_acceptance',
    'Temporal acceptance prospect B.'
  ) returning id into prospect_b;
  execute 'reset role';

  insert into public.commercial_accounts (
    advisor_id,account_reference,account_type,display_label,lifecycle_state,
    privacy_classification,evidence_references,created_at,created_by,updated_at
  ) values (
    user_a,account_reference,'HOUSEHOLD','Familia aceptación 010B','CONFIRMED',
    'PRIVATE',jsonb_build_array('CARTERA010B_ACCEPTANCE:ACCOUNT_EVIDENCE:' || suffix),
    t_policy_v1,user_a,t_policy_v1
  ) returning id into account_a;

  identity_command_a := jsonb_build_object(
    'contractType','FORGE_IDENTITY_RESOLUTION_COMMAND',
    'contractVersion','CARTERA-010B.1',
    'advisorId',user_a::text,
    'actorReference',user_a::text,
    'idempotencyKey','CARTERA010B_ACCEPTANCE:IDENTITY:A:' || suffix,
    'decidedAt',t_identity,
    'outcome','CREATE_CONFIRMED',
    'sourceIdentity',jsonb_build_object(
      'sourceDomain','ADVISOR_OS_SALES',
      'sourceIdentityType','PROSPECT',
      'sourceRecordReference',source_record_a,
      'prospectReference',prospect_a::text
    ),
    'existingPersonReference',null,
    'newPerson',jsonb_build_object(
      'personReference',person_a_reference,
      'displayName','Persona A aceptación remota',
      'preferredName','Persona A',
      'normalizedName','persona a aceptacion remota',
      'verifiedPhone',null,
      'verifiedEmail',null,
      'birthDate',null,
      'privacyClassification','PRIVATE'
    ),
    'candidatePersonReferences','[]'::jsonb,
    'evidenceReferences',jsonb_build_array('CARTERA010B_ACCEPTANCE:IDENTITY_EVIDENCE:A:' || suffix),
    'reasonCode','ADVISOR_CONFIRMED_NEW_PERSON',
    'commandDigest',repeat('f',64)
  );

  perform set_config('request.jwt.claim.sub', user_a::text, true);
  perform set_config('request.jwt.claim.role', 'authenticated', true);
  execute 'set local role authenticated';

  response := public.forge_cartera010b_confirm_identity_resolution(identity_command_a);
  if response ->> 'status' <> 'CONFIRMED'
     or response ->> 'personReference' <> person_a_reference
     or coalesce((response ->> 'replayed')::boolean, true) then
    raise exception 'CARTERA010B_IDENTITY_CREATE_INVALID';
  end if;

  replay := public.forge_cartera010b_confirm_identity_resolution(
    jsonb_set(identity_command_a, '{commandDigest}', to_jsonb(repeat('0',64)))
  );
  if not coalesce((replay ->> 'replayed')::boolean, false)
     or replay ->> 'personReference' <> person_a_reference
     or replay ->> 'serverCommandDigest' <> response ->> 'serverCommandDigest' then
    raise exception 'CARTERA010B_IDENTITY_REPLAY_INVALID';
  end if;

  changed := public.forge_cartera010b_confirm_identity_resolution(
    jsonb_set(identity_command_a, '{reasonCode}', '"CHANGED_REASON"'::jsonb)
  );
  if changed ->> 'status' <> 'CONFLICT'
     or changed ->> 'conflictType' <> 'CHANGED_INPUT_REPLAY' then
    raise exception 'CARTERA010B_IDENTITY_CHANGED_REPLAY_NOT_CONFLICT';
  end if;

  select count(*) into row_count
  from public.policy_conflicts
  where advisor_id = user_a
    and conflict_type = 'CHANGED_INPUT_REPLAY'
    and command_type = 'IDENTITY_RESOLUTION'
    and idempotency_key = identity_command_a ->> 'idempotencyKey';
  if row_count <> 1 then
    raise exception 'CARTERA010B_IDENTITY_REPLAY_CONFLICT_NOT_PERSISTED';
  end if;

  select id into old_link_id
  from public.commercial_source_identity_links
  where advisor_id = user_a
    and source_record_reference = source_record_a
    and effective_to is null;
