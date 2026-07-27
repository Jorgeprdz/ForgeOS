begin;

do $act04b$
declare
  v_user_a uuid := gen_random_uuid();
  v_user_b uuid := gen_random_uuid();
  v_suffix text :=
    replace(
      gen_random_uuid()::text,
      '-',
      ''
    );
  v_org text;
  v_id text;
  v_event_id text;
  v_truth text;
  v_record jsonb;
  v_result jsonb;
  v_replay jsonb;
  v_read jsonb;
  v_list jsonb;
  v_count bigint;
begin
  v_org := 'org-act04b-' || v_suffix;
  v_id := 'activity-act04b-' || v_suffix;
  v_event_id :=
    'event-act04b-' || v_suffix;

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
  )
  values
  (
    '00000000-0000-0000-0000-000000000000',
    v_user_a,
    'authenticated',
    'authenticated',
    'act04b-a-' || v_suffix ||
      '@forge.invalid',
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
    'act04b-b-' || v_suffix ||
      '@forge.invalid',
    '',
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{}'::jsonb,
    now(),
    now()
  );

  v_record := jsonb_build_object(
    'schemaVersion',
    'activity-record.v1',
    'id',
    v_id,
    'organizationId',
    v_org,
    'advisorId',
    v_user_a::text,
    'managerId',
    null,
    'prospectId',
    'prospect-act04b-' || v_suffix,
    'opportunityId',
    'opportunity-act04b-' || v_suffix,
    'appointmentId',
    'appointment-act04b-' || v_suffix,
    'policyId',
    null,
    'type',
    'INITIAL_APPOINTMENT_COMPLETED',
    'subtype',
    'FIRST_MEETING',
    'lifecycle',
    'CONFIRMED',
    'source',
    jsonb_build_object(
      'system',
      'PIPELINE',
      'eventId',
      v_event_id,
      'recordedAt',
      '2026-07-26T15:10:00.000Z',
      'producerVersion',
      'pipeline.v1',
      'evidenceState',
      'VERIFIED'
    ),
    'occurredAt',
    '2026-07-26T15:00:00.000Z',
    'evaluationDate',
    '2026-07-26',
    'timeZone',
    'America/Mexico_City',
    'confirmation',
    jsonb_build_object(
      'method',
      'PIPELINE_STATE',
      'confirmedAt',
      '2026-07-26T15:12:00.000Z',
      'confirmedBy',
      v_user_a::text
    ),
    'correction',
    null,
    'reversal',
    null,
    'metadata',
    jsonb_build_object(
      'acceptance',
      'ACT-04B'
    ),
    'revision',
    1,
    'createdAt',
    '2026-07-26T15:10:00.000Z',
    'updatedAt',
    '2026-07-26T15:12:00.000Z'
  );

  v_truth :=
    'activity:' ||
    encode(
      extensions.digest(
        concat_ws(
          chr(31),
          v_record ->> 'schemaVersion',
          v_org,
          v_user_a::text,
          v_record #>> '{source,system}',
          v_event_id,
          v_record ->> 'type',
          v_record ->> 'occurredAt'
        ),
        'sha256'
      ),
      'hex'
    );

  perform set_config(
    'request.jwt.claim.sub',
    v_user_a::text,
    true
  );
  perform set_config(
    'request.jwt.claim.role',
    'authenticated',
    true
  );
  execute 'set local role authenticated';

  v_result :=
    public.activity_records_append_v1(
      v_record,
      v_truth
    );

  if (
    v_result ->> 'inserted' <> 'true' or
    v_result #>> '{row,id}' <> v_id
  ) then
    raise exception
      'ACT04B_APPEND_INVALID';
  end if;

  v_replay :=
    public.activity_records_append_v1(
      v_record,
      v_truth
    );

  if (
    v_replay ->> 'inserted' <> 'false' or
    v_replay #>> '{row,id}' <> v_id
  ) then
    raise exception
      'ACT04B_IDEMPOTENT_REPLAY_INVALID';
  end if;

  v_read :=
    public.activity_records_get_by_id_v1(
      v_org,
      v_id
    );

  if v_read ->> 'id' <> v_id then
    raise exception
      'ACT04B_GET_BY_ID_INVALID';
  end if;

  v_read :=
    public.activity_records_get_by_truth_v1(
      v_org,
      v_truth
    );

  if v_read ->> 'truth_key' <> v_truth then
    raise exception
      'ACT04B_GET_BY_TRUTH_INVALID';
  end if;

  v_list :=
    public.activity_records_list_v1(
      jsonb_build_object(
        'organizationId',
        v_org,
        'advisorId',
        null,
        'types',
        null,
        'lifecycles',
        null,
        'sourceSystems',
        null,
        'evidenceStates',
        null,
        'prospectId',
        null,
        'opportunityId',
        null,
        'appointmentId',
        null,
        'policyId',
        null,
        'evaluationDateFrom',
        null,
        'evaluationDateTo',
        null,
        'occurredAtFrom',
        null,
        'occurredAtTo',
        null,
        'order',
        'desc',
        'limit',
        101,
        'cursor',
        null
      )
    );

  if (
    jsonb_array_length(v_list) <> 1 or
    v_list -> 0 ->> 'id' <> v_id
  ) then
    raise exception
      'ACT04B_JSON_NULL_QUERY_INVALID';
  end if;

  v_count :=
    public.activity_records_count_v1(
      jsonb_build_object(
        'organizationId',
        v_org,
        'advisorId',
        null
      )
    );

  if v_count <> 1 then
    raise exception
      'ACT04B_COUNT_INVALID';
  end if;

  begin
    perform count(*)
    from public.activity_records;

    raise exception
      'ACT04B_DIRECT_TABLE_ACCESS_UNEXPECTED';
  exception
    when insufficient_privilege then
      null;
  end;

  begin
    perform
      public.activity_records_append_v1(
        jsonb_set(
          v_record,
          '{id}',
          to_jsonb(
            'activity-act04b-bad-' ||
            v_suffix
          )
        ),
        'activity:' || repeat('0', 64)
      );

    raise exception
      'ACT04B_BAD_TRUTH_ACCEPTED';
  exception
    when check_violation then
      null;
  end;

  execute 'reset role';

  perform set_config(
    'request.jwt.claim.sub',
    v_user_b::text,
    true
  );
  perform set_config(
    'request.jwt.claim.role',
    'authenticated',
    true
  );
  execute 'set local role authenticated';

  v_read :=
    public.activity_records_get_by_id_v1(
      v_org,
      v_id
    );

  if v_read is not null then
    raise exception
      'ACT04B_CROSS_ADVISOR_READ_LEAK';
  end if;

  begin
    perform
      public.activity_records_append_v1(
        v_record,
        v_truth
      );

    raise exception
      'ACT04B_ADVISOR_INJECTION_UNEXPECTED';
  exception
    when insufficient_privilege then
      null;
  end;

  execute 'reset role';

  perform set_config(
    'request.jwt.claim.sub',
    '',
    true
  );
  perform set_config(
    'request.jwt.claim.role',
    'anon',
    true
  );
  execute 'set local role anon';

  begin
    perform
      public.activity_records_list_v1(
        jsonb_build_object(
          'organizationId',
          v_org
        )
      );

    raise exception
      'ACT04B_ANON_RPC_UNEXPECTED';
  exception
    when insufficient_privilege then
      null;
  end;

  execute 'reset role';

  begin
    update public.activity_records
    set updated_at = updated_at
    where id = v_id;

    raise exception
      'ACT04B_APPEND_ONLY_UPDATE_UNEXPECTED';
  exception
    when object_not_in_prerequisite_state then
      null;
  end;

  begin
    delete from public.activity_records
    where id = v_id;

    raise exception
      'ACT04B_APPEND_ONLY_DELETE_UNEXPECTED';
  exception
    when object_not_in_prerequisite_state then
      null;
  end;

  raise exception
    'ACT04B_REMOTE_ACCEPTANCE_PASS';
end;
$act04b$;
