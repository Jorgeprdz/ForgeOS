begin;

do $fes02b$
declare
  v_user_a uuid := gen_random_uuid();
  v_user_b uuid := gen_random_uuid();
  v_suffix text := replace(gen_random_uuid()::text, '-', '');
  v_event_a_id text;
  v_event_correction_id text;
  v_event_missing_correction_id text;
  v_event_sensitive_id text;
  v_mutation_a_id text;
  v_mutation_conflict_id text;
  v_mutation_correction_id text;
  v_mutation_missing_correction_id text;
  v_mutation_sensitive_id text;
  v_event_a jsonb;
  v_record_a jsonb;
  v_mutation_a jsonb;
  v_conflict_mutation jsonb;
  v_correction_event jsonb;
  v_correction_record jsonb;
  v_correction_mutation jsonb;
  v_missing_correction_event jsonb;
  v_missing_correction_record jsonb;
  v_missing_correction_mutation jsonb;
  v_sensitive_event jsonb;
  v_sensitive_record jsonb;
  v_sensitive_mutation jsonb;
  v_result jsonb;
  v_replay jsonb;
  v_pull jsonb;
begin
  v_event_a_id := 'evt-fes02b-a-' || v_suffix;
  v_event_correction_id := 'evt-fes02b-correction-' || v_suffix;
  v_event_missing_correction_id := 'evt-fes02b-missing-' || v_suffix;
  v_event_sensitive_id := 'evt-fes02b-sensitive-' || v_suffix;
  v_mutation_a_id := 'mut-fes02b-a-' || v_suffix;
  v_mutation_conflict_id := 'mut-fes02b-conflict-' || v_suffix;
  v_mutation_correction_id := 'mut-fes02b-correction-' || v_suffix;
  v_mutation_missing_correction_id := 'mut-fes02b-missing-' || v_suffix;
  v_mutation_sensitive_id := 'mut-fes02b-sensitive-' || v_suffix;

  insert into auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at
  ) values
  (
    '00000000-0000-0000-0000-000000000000',
    v_user_a,
    'authenticated',
    'authenticated',
    'fes02b-a-' || v_suffix || '@forge.invalid',
    '',
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{}'::jsonb,
    now(),
    now()
  ),
  (
    '00000000-0000-0000-0000-000000000000',
    v_user_b,
    'authenticated',
    'authenticated',
    'fes02b-b-' || v_suffix || '@forge.invalid',
    '',
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{}'::jsonb,
    now(),
    now()
  );

  v_event_a := jsonb_build_object(
    'event_id', v_event_a_id,
    'event_type', 'PROSPECT_CREATED',
    'schema_version', 'forge.activity_event.v1',
    'tenant_id', v_user_a::text,
    'actor', jsonb_build_object('type', 'SYSTEM', 'id', 'forge-system'),
    'subject', jsonb_build_object('type', 'PROSPECT', 'id', 'prospect-fes02b-a'),
    'source', jsonb_build_object(
      'type', 'SYSTEM_OBSERVED',
      'reference', 'fes02b-source-a',
      'channel', 'FORGE_SYSTEM'
    ),
    'evidence_strength', 'SYSTEM_OBSERVED',
    'occurred_at', '2026-07-26T03:00:00.000Z',
    'recorded_at', '2026-07-26T03:00:01.000Z',
    'effective_period', null,
    'causation_id', null,
    'correlation_id', 'corr-fes02b-' || v_suffix,
    'idempotency_key', 'idem-fes02b-a-' || v_suffix,
    'privacy_class', 'PRIVATE',
    'learning_eligibility', false,
    'payload', jsonb_build_object(
      'prospect_reference', 'prospect-fes02b-a',
      'source_category', 'REFERRAL'
    ),
    'provenance', jsonb_build_object(
      'source_system', 'fes02b-remote-acceptance',
      'source_record_id', 'source-record-a-' || v_suffix,
      'captured_via', 'FORGE_SYSTEM',
      'evidence_references', jsonb_build_array('evidence-fes02b-a-' || v_suffix)
    ),
    'confirmation_state', 'CONFIRMED',
    'correction_of', null,
    'safety_flags', jsonb_build_object(
      'executes_business_action', false,
      'mutates_external_provider', false,
      'promotes_ai_output_to_truth', false,
      'cross_tenant_data', false,
      'eligible_for_global_learning', false
    )
  );

  v_record_a := jsonb_build_object(
    'ledger_version', 'forge.activity_ledger.v1',
    'record_key', v_user_a::text || ':' || v_event_a_id,
    'tenant_id', v_user_a::text,
    'event_id', v_event_a_id,
    'event_digest', 'digest-fes02b-a-' || v_suffix,
    'canonical_event', v_event_a,
    'evidence_references', jsonb_build_array(
      jsonb_build_object(
        'reference_id', 'evidence-fes02b-a-' || v_suffix,
        'reference_type', 'SYSTEM_OBSERVATION',
        'source_system', 'fes02b-remote-acceptance',
        'captured_at', '2026-07-26T03:00:01.000Z',
        'privacy_class', 'PRIVATE',
        'checksum', 'checksum-fes02b-a-' || v_suffix,
        'metadata', jsonb_build_object('capture_mode', 'SYSTEM_DERIVED')
      )
    ),
    'appended_at', '2026-07-26T03:00:02.000Z'
  );

  v_mutation_a := jsonb_build_object(
    'mutation_version', 'forge.activity_ledger_mutation.v1',
    'mutation_id', v_mutation_a_id,
    'operation', 'APPEND_EVENT',
    'tenant_id', v_user_a::text,
    'device_id', 'device-fes02b',
    'event_id', v_event_a_id,
    'event_digest', 'digest-fes02b-a-' || v_suffix,
    'ledger_record', v_record_a,
    'base_cursor', null,
    'created_at', '2026-07-26T03:00:02.000Z',
    'attempt_count', 0,
    'state', 'PENDING',
    'last_error_code', null
  );

  perform set_config('request.jwt.claim.sub', v_user_a::text, true);
  perform set_config('request.jwt.claim.role', 'authenticated', true);
  execute 'set local role authenticated';

  v_result := public.forge_fes02_append_activity_event(v_mutation_a);

  if v_result->>'status' <> 'ACKNOWLEDGED'
     or v_result->'receipt'->>'tenant_id' <> v_user_a::text
     or v_result->'receipt'->>'event_id' <> v_event_a_id then
    raise exception 'FES02B_ACKNOWLEDGEMENT_INVALID';
  end if;

  v_replay := public.forge_fes02_append_activity_event(v_mutation_a);

  if v_replay <> v_result then
    raise exception 'FES02B_IDEMPOTENT_REPLAY_INVALID';
  end if;

  v_pull := public.forge_fes02_pull_activity_events(null, 200);

  if jsonb_array_length(v_pull->'changes') <> 1
     or v_pull->'changes'->0->'ledger_record'->>'tenant_id' <> v_user_a::text then
    raise exception 'FES02B_TENANT_A_PULL_INVALID';
  end if;

  begin
    perform count(*) from public.activity_event_ledger;
    raise exception 'FES02B_DIRECT_TABLE_ACCESS_UNEXPECTED';
  exception
    when insufficient_privilege then
      null;
  end;

  execute 'reset role';

  v_conflict_mutation := jsonb_set(
    jsonb_set(
      jsonb_set(
        v_mutation_a,
        '{mutation_id}',
        to_jsonb(v_mutation_conflict_id)
      ),
      '{event_digest}',
      to_jsonb('digest-fes02b-conflict-' || v_suffix)
    ),
    '{ledger_record,event_digest}',
    to_jsonb('digest-fes02b-conflict-' || v_suffix)
  );

  perform set_config('request.jwt.claim.sub', v_user_a::text, true);
  perform set_config('request.jwt.claim.role', 'authenticated', true);
  execute 'set local role authenticated';

  v_result := public.forge_fes02_append_activity_event(v_conflict_mutation);

  if v_result->>'status' <> 'CONFLICT'
     or v_result->>'reason_code' <> 'REMOTE_EVENT_ID_DIGEST_CONFLICT' then
    raise exception 'FES02B_DIGEST_CONFLICT_INVALID';
  end if;

  execute 'reset role';

  v_correction_event := jsonb_set(
    jsonb_set(
      jsonb_set(
        jsonb_set(
          v_event_a,
          '{event_id}',
          to_jsonb(v_event_correction_id)
        ),
        '{idempotency_key}',
        to_jsonb('idem-fes02b-correction-' || v_suffix)
      ),
      '{correction_of}',
      to_jsonb(v_event_a_id)
    ),
    '{causation_id}',
    to_jsonb(v_event_a_id)
  );

  v_correction_record := jsonb_build_object(
    'ledger_version', 'forge.activity_ledger.v1',
    'record_key', v_user_a::text || ':' || v_event_correction_id,
    'tenant_id', v_user_a::text,
    'event_id', v_event_correction_id,
    'event_digest', 'digest-fes02b-correction-' || v_suffix,
    'canonical_event', v_correction_event,
    'evidence_references', jsonb_build_array(
      jsonb_build_object(
        'reference_id', 'evidence-fes02b-correction-' || v_suffix,
        'reference_type', 'USER_CONFIRMATION',
        'source_system', 'fes02b-remote-acceptance',
        'captured_at', '2026-07-26T03:01:01.000Z',
        'privacy_class', 'PRIVATE',
        'checksum', 'checksum-fes02b-correction-' || v_suffix,
        'metadata', jsonb_build_object('reason_code', 'SOURCE_CATEGORY_CORRECTION')
      )
    ),
    'appended_at', '2026-07-26T03:01:02.000Z'
  );

  v_correction_mutation := jsonb_build_object(
    'mutation_version', 'forge.activity_ledger_mutation.v1',
    'mutation_id', v_mutation_correction_id,
    'operation', 'APPEND_EVENT',
    'tenant_id', v_user_a::text,
    'device_id', 'device-fes02b',
    'event_id', v_event_correction_id,
    'event_digest', 'digest-fes02b-correction-' || v_suffix,
    'ledger_record', v_correction_record,
    'base_cursor', null,
    'created_at', '2026-07-26T03:01:02.000Z',
    'attempt_count', 0,
    'state', 'PENDING',
    'last_error_code', null
  );

  perform set_config('request.jwt.claim.sub', v_user_a::text, true);
  perform set_config('request.jwt.claim.role', 'authenticated', true);
  execute 'set local role authenticated';

  v_result := public.forge_fes02_append_activity_event(v_correction_mutation);

  if v_result->>'status' <> 'ACKNOWLEDGED' then
    raise exception 'FES02B_CORRECTION_APPEND_INVALID';
  end if;

  execute 'reset role';

  v_missing_correction_event := jsonb_set(
    jsonb_set(
      jsonb_set(
        v_event_a,
        '{event_id}',
        to_jsonb(v_event_missing_correction_id)
      ),
      '{idempotency_key}',
      to_jsonb('idem-fes02b-missing-' || v_suffix)
    ),
    '{correction_of}',
    to_jsonb('evt-fes02b-does-not-exist-' || v_suffix)
  );

  v_missing_correction_record := jsonb_build_object(
    'ledger_version', 'forge.activity_ledger.v1',
    'record_key', v_user_a::text || ':' || v_event_missing_correction_id,
    'tenant_id', v_user_a::text,
    'event_id', v_event_missing_correction_id,
    'event_digest', 'digest-fes02b-missing-' || v_suffix,
    'canonical_event', v_missing_correction_event,
    'evidence_references', '[]'::jsonb,
    'appended_at', '2026-07-26T03:02:02.000Z'
  );

  v_missing_correction_mutation := jsonb_build_object(
    'mutation_version', 'forge.activity_ledger_mutation.v1',
    'mutation_id', v_mutation_missing_correction_id,
    'operation', 'APPEND_EVENT',
    'tenant_id', v_user_a::text,
    'device_id', 'device-fes02b',
    'event_id', v_event_missing_correction_id,
    'event_digest', 'digest-fes02b-missing-' || v_suffix,
    'ledger_record', v_missing_correction_record,
    'base_cursor', null,
    'created_at', '2026-07-26T03:02:02.000Z',
    'attempt_count', 0,
    'state', 'PENDING',
    'last_error_code', null
  );

  perform set_config('request.jwt.claim.sub', v_user_a::text, true);
  perform set_config('request.jwt.claim.role', 'authenticated', true);
  execute 'set local role authenticated';

  begin
    perform public.forge_fes02_append_activity_event(
      v_missing_correction_mutation
    );
    raise exception 'FES02B_MISSING_CORRECTION_UNEXPECTED';
  exception
    when others then
      if position(
        'FES02_CORRECTION_ORIGINAL_NOT_FOUND' in sqlerrm
      ) = 0 then
        raise;
      end if;
  end;

  execute 'reset role';

  v_sensitive_event := jsonb_set(
    jsonb_set(
      v_event_a,
      '{event_id}',
      to_jsonb(v_event_sensitive_id)
    ),
    '{idempotency_key}',
    to_jsonb('idem-fes02b-sensitive-' || v_suffix)
  );

  v_sensitive_record := jsonb_build_object(
    'ledger_version', 'forge.activity_ledger.v1',
    'record_key', v_user_a::text || ':' || v_event_sensitive_id,
    'tenant_id', v_user_a::text,
    'event_id', v_event_sensitive_id,
    'event_digest', 'digest-fes02b-sensitive-' || v_suffix,
    'canonical_event', v_sensitive_event,
    'evidence_references', jsonb_build_array(
      jsonb_build_object(
        'reference_id', 'evidence-fes02b-sensitive-' || v_suffix,
        'reference_type', 'SYSTEM_OBSERVATION',
        'source_system', 'fes02b-remote-acceptance',
        'captured_at', '2026-07-26T03:03:01.000Z',
        'privacy_class', 'PRIVATE',
        'checksum', 'checksum-fes02b-sensitive-' || v_suffix,
        'metadata', jsonb_build_object('phone', '5555555555')
      )
    ),
    'appended_at', '2026-07-26T03:03:02.000Z'
  );

  v_sensitive_mutation := jsonb_build_object(
    'mutation_version', 'forge.activity_ledger_mutation.v1',
    'mutation_id', v_mutation_sensitive_id,
    'operation', 'APPEND_EVENT',
    'tenant_id', v_user_a::text,
    'device_id', 'device-fes02b',
    'event_id', v_event_sensitive_id,
    'event_digest', 'digest-fes02b-sensitive-' || v_suffix,
    'ledger_record', v_sensitive_record,
    'base_cursor', null,
    'created_at', '2026-07-26T03:03:02.000Z',
    'attempt_count', 0,
    'state', 'PENDING',
    'last_error_code', null
  );

  perform set_config('request.jwt.claim.sub', v_user_a::text, true);
  perform set_config('request.jwt.claim.role', 'authenticated', true);
  execute 'set local role authenticated';

  begin
    perform public.forge_fes02_append_activity_event(v_sensitive_mutation);
    raise exception 'FES02B_SENSITIVE_EVIDENCE_UNEXPECTED';
  exception
    when check_violation then
      null;
  end;

  execute 'reset role';

  perform set_config('request.jwt.claim.sub', v_user_b::text, true);
  perform set_config('request.jwt.claim.role', 'authenticated', true);
  execute 'set local role authenticated';

  v_pull := public.forge_fes02_pull_activity_events(null, 200);

  if jsonb_array_length(v_pull->'changes') <> 0 then
    raise exception 'FES02B_CROSS_TENANT_PULL_LEAK';
  end if;

  begin
    perform public.forge_fes02_append_activity_event(v_mutation_a);
    raise exception 'FES02B_TENANT_INJECTION_UNEXPECTED';
  exception
    when others then
      if position('FES02_TENANT_INJECTION_DENIED' in sqlerrm) = 0 then
        raise;
      end if;
  end;

  execute 'reset role';

  perform set_config('request.jwt.claim.sub', '', true);
  perform set_config('request.jwt.claim.role', 'anon', true);
  execute 'set local role anon';

  begin
    perform public.forge_fes02_pull_activity_events(null, 10);
    raise exception 'FES02B_ANON_RPC_UNEXPECTED';
  exception
    when insufficient_privilege then
      null;
  end;

  execute 'reset role';

  begin
    update public.activity_event_ledger
    set event_type = event_type
    where event_id = v_event_a_id;
    raise exception 'FES02B_APPEND_ONLY_UPDATE_UNEXPECTED';
  exception
    when others then
      if position('FES02_APPEND_ONLY_MUTATION_DENIED' in sqlerrm) = 0 then
        raise;
      end if;
  end;

  begin
    delete from public.activity_event_ledger
    where event_id = v_event_a_id;
    raise exception 'FES02B_APPEND_ONLY_DELETE_UNEXPECTED';
  exception
    when others then
      if position('FES02_APPEND_ONLY_MUTATION_DENIED' in sqlerrm) = 0 then
        raise;
      end if;
  end;

  if (
    select count(*)
    from public.activity_event_ledger
    where event_id like 'evt-fes02b-%'
  ) <> 2 then
    raise exception 'FES02B_LEDGER_ACCEPTANCE_COUNT_INVALID';
  end if;

  if (
    select count(*)
    from public.activity_event_mutations
    where mutation_id like 'mut-fes02b-%'
  ) <> 3 then
    raise exception 'FES02B_MUTATION_ACCEPTANCE_COUNT_INVALID';
  end if;

  if (
    select count(*)
    from public.activity_event_conflicts
    where event_id like 'evt-fes02b-%'
  ) <> 1 then
    raise exception 'FES02B_CONFLICT_ACCEPTANCE_COUNT_INVALID';
  end if;

  if (
    select count(*)
    from public.activity_event_evidence_references
    where reference_id like 'evidence-fes02b-%'
  ) <> 2 then
    raise exception 'FES02B_EVIDENCE_ACCEPTANCE_COUNT_INVALID';
  end if;

  if (
    select count(*)
    from auth.users
    where email like 'fes02b-%@forge.invalid'
  ) <> 2 then
    raise exception 'FES02B_TEMP_USER_ACCEPTANCE_COUNT_INVALID';
  end if;

  raise exception 'FES02_REMOTE_ACCEPTANCE_PASS'
    using errcode = 'P0001';
end;
$fes02b$;

commit;
