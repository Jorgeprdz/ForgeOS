begin;

create sequence if not exists public.forge_nfast09_due_action_change_seq;

create table if not exists public.prospect_due_actions (
  prospect_id uuid primary key,
  advisor_id uuid not null references auth.users(id) on delete restrict,
  next_action_type text,
  next_action_at timestamptz,
  due_action_state text not null,
  due_action_version bigint not null,
  acknowledgement_state text not null default 'UNSEEN',
  acknowledged_at timestamptz,
  acknowledged_on_device_id text,
  snoozed_until timestamptz,
  tombstone boolean not null default false,
  server_revision bigint not null default 1,
  change_seq bigint not null default nextval('public.forge_nfast09_due_action_change_seq'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint prospect_due_actions_owner_fk
    foreign key (prospect_id, advisor_id)
    references public.prospects (id, advisor_id)
    on delete restrict,
  constraint prospect_due_actions_state_ck check (
    due_action_state in (
      'SCHEDULED',
      'COMPLETED',
      'CANCELLED',
      'CONFLICT_REVIEW_REQUIRED'
    )
  ),
  constraint prospect_due_actions_ack_ck check (
    acknowledgement_state in (
      'UNSEEN',
      'SNOOZED',
      'SEEN',
      'ACKNOWLEDGED'
    )
  ),
  constraint prospect_due_actions_version_ck check (due_action_version >= 1),
  constraint prospect_due_actions_revision_ck check (server_revision >= 1),
  constraint prospect_due_actions_schedule_ck check (
    due_action_state <> 'SCHEDULED'
    or (
      next_action_type is not null
      and btrim(next_action_type) <> ''
      and next_action_at is not null
      and tombstone = false
    )
  ),
  constraint prospect_due_actions_tombstone_ck check (
    tombstone = false
    or due_action_state in ('COMPLETED', 'CANCELLED')
  )
);

create table if not exists public.prospect_due_action_mutations (
  mutation_id text primary key,
  advisor_id uuid not null references auth.users(id) on delete restrict,
  prospect_id uuid not null,
  device_id text not null,
  due_action_version bigint not null,
  operation text not null,
  authorized_patch jsonb not null default '{}'::jsonb,
  base_server_revision bigint,
  mutation_created_at timestamptz not null,
  received_at timestamptz not null default now(),
  result_status text not null,
  result_payload jsonb not null,
  constraint prospect_due_action_mutations_owner_fk
    foreign key (prospect_id, advisor_id)
    references public.prospects (id, advisor_id)
    on delete restrict,
  constraint prospect_due_action_mutations_operation_ck check (
    operation in (
      'SCHEDULE',
      'RESCHEDULE',
      'COMPLETE',
      'CANCEL',
      'MARK_SEEN',
      'ACKNOWLEDGE',
      'SNOOZE'
    )
  ),
  constraint prospect_due_action_mutations_result_ck check (
    result_status in ('ACKNOWLEDGED', 'CONFLICT')
  ),
  constraint prospect_due_action_mutations_patch_ck check (
    jsonb_typeof(authorized_patch) = 'object'
  ),
  constraint prospect_due_action_mutations_result_payload_ck check (
    jsonb_typeof(result_payload) = 'object'
  )
);

create table if not exists public.prospect_due_action_conflicts (
  conflict_id uuid primary key default gen_random_uuid(),
  advisor_id uuid not null references auth.users(id) on delete restrict,
  prospect_id uuid not null,
  mutation_id text not null,
  due_action_version bigint not null,
  local_operation text not null,
  local_authorized_patch jsonb not null,
  base_server_revision bigint,
  remote_server_revision bigint,
  local_candidate jsonb not null,
  remote_candidate jsonb not null,
  reason_code text not null,
  conflict_status text not null default 'OPEN',
  detected_at timestamptz not null default now(),
  resolved_at timestamptz,
  constraint prospect_due_action_conflicts_owner_fk
    foreign key (prospect_id, advisor_id)
    references public.prospects (id, advisor_id)
    on delete restrict,
  constraint prospect_due_action_conflicts_mutation_fk
    foreign key (mutation_id)
    references public.prospect_due_action_mutations (mutation_id)
    on delete restrict,
  constraint prospect_due_action_conflicts_status_ck check (
    conflict_status in ('OPEN', 'RESOLVED')
  ),
  constraint prospect_due_action_conflicts_candidates_ck check (
    jsonb_typeof(local_candidate) = 'object'
    and jsonb_typeof(remote_candidate) = 'object'
    and jsonb_typeof(local_authorized_patch) = 'object'
  )
);

create index if not exists prospect_due_actions_incremental_idx
  on public.prospect_due_actions (advisor_id, change_seq);

create index if not exists prospect_due_actions_priority_idx
  on public.prospect_due_actions (
    advisor_id,
    due_action_state,
    next_action_at
  );

create index if not exists prospect_due_action_mutations_advisor_idx
  on public.prospect_due_action_mutations (advisor_id, received_at desc);

create index if not exists prospect_due_action_conflicts_open_idx
  on public.prospect_due_action_conflicts (advisor_id, detected_at desc)
  where conflict_status = 'OPEN';

alter table public.prospect_due_actions enable row level security;
alter table public.prospect_due_actions force row level security;
alter table public.prospect_due_action_mutations enable row level security;
alter table public.prospect_due_action_mutations force row level security;
alter table public.prospect_due_action_conflicts enable row level security;
alter table public.prospect_due_action_conflicts force row level security;

revoke all on public.prospect_due_actions from anon, authenticated;
revoke all on public.prospect_due_action_mutations from anon, authenticated;
revoke all on public.prospect_due_action_conflicts from anon, authenticated;
revoke all on sequence public.forge_nfast09_due_action_change_seq
  from anon, authenticated;

drop policy if exists prospect_due_actions_own_policy
  on public.prospect_due_actions;
create policy prospect_due_actions_own_policy
  on public.prospect_due_actions
  for all
  to public
  using (advisor_id = auth.uid())
  with check (advisor_id = auth.uid());

drop policy if exists prospect_due_action_mutations_own_policy
  on public.prospect_due_action_mutations;
create policy prospect_due_action_mutations_own_policy
  on public.prospect_due_action_mutations
  for all
  to public
  using (advisor_id = auth.uid())
  with check (advisor_id = auth.uid());

drop policy if exists prospect_due_action_conflicts_own_policy
  on public.prospect_due_action_conflicts;
create policy prospect_due_action_conflicts_own_policy
  on public.prospect_due_action_conflicts
  for all
  to public
  using (advisor_id = auth.uid())
  with check (advisor_id = auth.uid());

create or replace function public.forge_nfast09_ack_rank(p_state text)
returns integer
language sql
immutable
strict
set search_path = public
as $$
  select case p_state
    when 'UNSEEN' then 0
    when 'SNOOZED' then 1
    when 'SEEN' then 2
    when 'ACKNOWLEDGED' then 3
    else -1
  end;
$$;

create or replace function public.forge_nfast09_due_action_json(
  p_action public.prospect_due_actions,
  p_display_name text
)
returns jsonb
language sql
stable
set search_path = public
as $$
  select jsonb_build_object(
    'advisorPartitionKey', p_action.advisor_id::text,
    'prospectReference', p_action.prospect_id::text,
    'approvedDisplayName', p_display_name,
    'nextActionType', p_action.next_action_type,
    'nextActionAt', p_action.next_action_at,
    'dueActionState', p_action.due_action_state,
    'dueActionVersion', p_action.due_action_version,
    'serverRevision', p_action.server_revision::text,
    'remoteUpdatedAt', p_action.updated_at,
    'localUpdatedAt', p_action.updated_at,
    'lastSyncedAt', null,
    'syncState', 'SYNCED',
    'acknowledgementState', p_action.acknowledgement_state,
    'acknowledgedAt', p_action.acknowledged_at,
    'acknowledgedOnDeviceId', p_action.acknowledged_on_device_id,
    'snoozedUntil', p_action.snoozed_until,
    'tombstone', p_action.tombstone
  );
$$;

create or replace function public.forge_nfast09_push_due_action_mutation(
  p_mutation jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_advisor_id uuid := auth.uid();
  v_mutation_id text;
  v_device_id text;
  v_prospect_id uuid;
  v_display_name text;
  v_operation text;
  v_patch jsonb;
  v_due_action_version bigint;
  v_base_server_revision bigint;
  v_mutation_created_at timestamptz;
  v_existing_mutation public.prospect_due_action_mutations%rowtype;
  v_action public.prospect_due_actions%rowtype;
  v_remote_before public.prospect_due_actions%rowtype;
  v_result jsonb;
  v_conflict boolean := false;
  v_conflict_reason text := null;
  v_next_ack text;
  v_next_type text;
  v_next_at timestamptz;
  v_next_snooze timestamptz;
  v_allowed_input_keys text[] := array[
    'mutationId',
    'deviceId',
    'advisorPartitionKey',
    'prospectReference',
    'dueActionVersion',
    'operation',
    'authorizedPatch',
    'baseServerRevision',
    'createdAt',
    'attemptCount',
    'syncState'
  ];
  v_allowed_patch_keys text[] := array[
    'approvedDisplayName',
    'nextActionType',
    'nextActionAt',
    'acknowledgementState',
    'acknowledgedAt',
    'acknowledgedOnDeviceId',
    'snoozedUntil',
    'dueActionState',
    'dueActionVersion',
    'tombstone'
  ];
begin
  if v_advisor_id is null then
    raise exception 'NFAST09_AUTH_REQUIRED'
      using errcode = '42501';
  end if;

  if p_mutation is null or jsonb_typeof(p_mutation) <> 'object' then
    raise exception 'NFAST09_MUTATION_INVALID'
      using errcode = '22023';
  end if;

  if exists (
    select 1
    from jsonb_object_keys(p_mutation) as supplied(key)
    where not (supplied.key = any(v_allowed_input_keys))
  ) then
    raise exception 'NFAST09_MUTATION_FIELD_DENIED'
      using errcode = '22023';
  end if;

  if coalesce(p_mutation->>'advisorPartitionKey', '') <> v_advisor_id::text then
    raise exception 'NFAST09_ADVISOR_INJECTION_DENIED'
      using errcode = '42501';
  end if;

  v_mutation_id := btrim(coalesce(p_mutation->>'mutationId', ''));
  v_device_id := btrim(coalesce(p_mutation->>'deviceId', ''));
  v_operation := btrim(coalesce(p_mutation->>'operation', ''));
  v_patch := coalesce(p_mutation->'authorizedPatch', '{}'::jsonb);

  if v_mutation_id !~ '^[A-Za-z0-9._:@/-]{1,180}$'
     or v_device_id !~ '^[A-Za-z0-9._:@/-]{1,180}$' then
    raise exception 'NFAST09_MUTATION_IDENTITY_INVALID'
      using errcode = '22023';
  end if;

  if v_operation not in (
    'SCHEDULE',
    'RESCHEDULE',
    'COMPLETE',
    'CANCEL',
    'MARK_SEEN',
    'ACKNOWLEDGE',
    'SNOOZE'
  ) then
    raise exception 'NFAST09_OPERATION_INVALID'
      using errcode = '22023';
  end if;

  if jsonb_typeof(v_patch) <> 'object' then
    raise exception 'NFAST09_PATCH_INVALID'
      using errcode = '22023';
  end if;

  if exists (
    select 1
    from jsonb_object_keys(v_patch) as supplied(key)
    where not (supplied.key = any(v_allowed_patch_keys))
  ) then
    raise exception 'NFAST09_PATCH_FIELD_DENIED'
      using errcode = '22023';
  end if;

  if v_patch ?| array[
    'rawNotes',
    'notes',
    'initialContext',
    'phone',
    'whatsapp',
    'email',
    'income',
    'health',
    'family',
    'draft',
    'message',
    'providerPayload',
    'authToken'
  ] then
    raise exception 'NFAST09_SENSITIVE_DATA_DENIED'
      using errcode = '22023';
  end if;

  begin
    v_prospect_id := (p_mutation->>'prospectReference')::uuid;
    v_due_action_version := (p_mutation->>'dueActionVersion')::bigint;
    v_mutation_created_at := (p_mutation->>'createdAt')::timestamptz;

    if nullif(p_mutation->>'baseServerRevision', '') is not null then
      v_base_server_revision :=
        (p_mutation->>'baseServerRevision')::bigint;
    end if;
  exception
    when others then
      raise exception 'NFAST09_MUTATION_FIELD_INVALID'
        using errcode = '22023';
  end;

  if v_due_action_version < 1 then
    raise exception 'NFAST09_VERSION_INVALID'
      using errcode = '22023';
  end if;

  select *
  into v_existing_mutation
  from public.prospect_due_action_mutations
  where mutation_id = v_mutation_id;

  if found then
    if v_existing_mutation.advisor_id <> v_advisor_id then
      raise exception 'NFAST09_MUTATION_COLLISION_DENIED'
        using errcode = '42501';
    end if;
    return v_existing_mutation.result_payload;
  end if;

  select full_name
  into v_display_name
  from public.prospects
  where id = v_prospect_id
    and advisor_id = v_advisor_id
    and archived_at is null;

  if not found then
    raise exception 'NFAST09_PROSPECT_NOT_FOUND'
      using errcode = 'P0002';
  end if;

  select *
  into v_action
  from public.prospect_due_actions
  where prospect_id = v_prospect_id
    and advisor_id = v_advisor_id
  for update;

  if not found then
    if v_operation <> 'SCHEDULE' or v_due_action_version <> 1 then
      v_conflict := true;
      v_conflict_reason := 'REMOTE_ACTION_MISSING';

      insert into public.prospect_due_actions (
        prospect_id,
        advisor_id,
        next_action_type,
        next_action_at,
        due_action_state,
        due_action_version,
        acknowledgement_state,
        tombstone,
        server_revision,
        change_seq,
        created_at,
        updated_at
      ) values (
        v_prospect_id,
        v_advisor_id,
        null,
        null,
        'CONFLICT_REVIEW_REQUIRED',
        greatest(v_due_action_version, 1),
        'UNSEEN',
        false,
        1,
        nextval('public.forge_nfast09_due_action_change_seq'),
        now(),
        now()
      ) returning * into v_action;

      v_remote_before := v_action;
      v_remote_before.due_action_state := 'CANCELLED';
      v_remote_before.tombstone := true;
    else
      v_next_type := nullif(btrim(v_patch->>'nextActionType'), '');

      begin
        v_next_at := (v_patch->>'nextActionAt')::timestamptz;
      exception
        when others then
          raise exception 'NFAST09_NEXT_ACTION_INVALID'
            using errcode = '22023';
      end;

      if v_next_type is null or v_next_at is null then
        raise exception 'NFAST09_SCHEDULE_FIELDS_REQUIRED'
          using errcode = '22023';
      end if;

      insert into public.prospect_due_actions (
        prospect_id,
        advisor_id,
        next_action_type,
        next_action_at,
        due_action_state,
        due_action_version,
        acknowledgement_state,
        acknowledged_at,
        acknowledged_on_device_id,
        snoozed_until,
        tombstone,
        server_revision,
        change_seq,
        created_at,
        updated_at
      ) values (
        v_prospect_id,
        v_advisor_id,
        v_next_type,
        v_next_at,
        'SCHEDULED',
        1,
        'UNSEEN',
        null,
        null,
        null,
        false,
        1,
        nextval('public.forge_nfast09_due_action_change_seq'),
        now(),
        now()
      ) returning * into v_action;
    end if;
  else
    v_remote_before := v_action;

    if v_operation in ('MARK_SEEN', 'ACKNOWLEDGE', 'SNOOZE') then
      if v_due_action_version > v_action.due_action_version then
        v_conflict := true;
        v_conflict_reason := 'FUTURE_ACKNOWLEDGEMENT_VERSION';
      elsif v_due_action_version < v_action.due_action_version then
        null;
      else
        v_next_ack := case v_operation
          when 'MARK_SEEN' then 'SEEN'
          when 'ACKNOWLEDGE' then 'ACKNOWLEDGED'
          when 'SNOOZE' then 'SNOOZED'
        end;

        if public.forge_nfast09_ack_rank(v_next_ack)
           > public.forge_nfast09_ack_rank(v_action.acknowledgement_state) then
          v_action.acknowledgement_state := v_next_ack;
          v_action.acknowledged_at := now();
          v_action.acknowledged_on_device_id := v_device_id;
        end if;

        if v_operation = 'SNOOZE' then
          begin
            v_next_snooze := (v_patch->>'snoozedUntil')::timestamptz;
          exception
            when others then
              raise exception 'NFAST09_SNOOZE_INVALID'
                using errcode = '22023';
          end;

          if v_next_snooze is null then
            raise exception 'NFAST09_SNOOZE_REQUIRED'
              using errcode = '22023';
          end if;

          v_action.snoozed_until := v_next_snooze;
        end if;

        update public.prospect_due_actions
        set acknowledgement_state = v_action.acknowledgement_state,
            acknowledged_at = v_action.acknowledged_at,
            acknowledged_on_device_id = v_action.acknowledged_on_device_id,
            snoozed_until = v_action.snoozed_until,
            server_revision = server_revision + 1,
            change_seq = nextval('public.forge_nfast09_due_action_change_seq'),
            updated_at = now()
        where prospect_id = v_prospect_id
          and advisor_id = v_advisor_id
        returning * into v_action;
      end if;
    else
      if v_operation = 'SCHEDULE' then
        v_conflict := true;
        v_conflict_reason := 'REMOTE_ACTION_ALREADY_EXISTS';
      elsif v_base_server_revision is distinct from v_action.server_revision then
        v_conflict := true;
        v_conflict_reason := 'REMOTE_REVISION_CHANGED';
      elsif v_operation = 'RESCHEDULE'
            and v_due_action_version <> v_action.due_action_version + 1 then
        v_conflict := true;
        v_conflict_reason := 'RESCHEDULE_VERSION_CONFLICT';
      elsif v_operation in ('COMPLETE', 'CANCEL')
            and v_due_action_version <> v_action.due_action_version then
        v_conflict := true;
        v_conflict_reason := 'LIFECYCLE_VERSION_CONFLICT';
      end if;

      if not v_conflict then
        if v_operation = 'RESCHEDULE' then
          v_next_type := nullif(btrim(v_patch->>'nextActionType'), '');

          begin
            v_next_at := (v_patch->>'nextActionAt')::timestamptz;
          exception
            when others then
              raise exception 'NFAST09_NEXT_ACTION_INVALID'
                using errcode = '22023';
          end;

          if v_next_type is null or v_next_at is null then
            raise exception 'NFAST09_RESCHEDULE_FIELDS_REQUIRED'
              using errcode = '22023';
          end if;

          update public.prospect_due_actions
          set next_action_type = v_next_type,
              next_action_at = v_next_at,
              due_action_state = 'SCHEDULED',
              due_action_version = v_due_action_version,
              acknowledgement_state = 'UNSEEN',
              acknowledged_at = null,
              acknowledged_on_device_id = null,
              snoozed_until = null,
              tombstone = false,
              server_revision = server_revision + 1,
              change_seq = nextval('public.forge_nfast09_due_action_change_seq'),
              updated_at = now()
          where prospect_id = v_prospect_id
            and advisor_id = v_advisor_id
          returning * into v_action;
        elsif v_operation = 'COMPLETE' then
          update public.prospect_due_actions
          set due_action_state = 'COMPLETED',
              tombstone = true,
              server_revision = server_revision + 1,
              change_seq = nextval('public.forge_nfast09_due_action_change_seq'),
              updated_at = now()
          where prospect_id = v_prospect_id
            and advisor_id = v_advisor_id
          returning * into v_action;
        elsif v_operation = 'CANCEL' then
          update public.prospect_due_actions
          set due_action_state = 'CANCELLED',
              tombstone = true,
              server_revision = server_revision + 1,
              change_seq = nextval('public.forge_nfast09_due_action_change_seq'),
              updated_at = now()
          where prospect_id = v_prospect_id
            and advisor_id = v_advisor_id
          returning * into v_action;
        end if;
      end if;
    end if;
  end if;

  if v_conflict then
    if v_remote_before.prospect_id is null then
      v_remote_before := v_action;
    end if;

    update public.prospect_due_actions
    set due_action_state = 'CONFLICT_REVIEW_REQUIRED',
        tombstone = false,
        server_revision = server_revision + 1,
        change_seq = nextval('public.forge_nfast09_due_action_change_seq'),
        updated_at = now()
    where prospect_id = v_prospect_id
      and advisor_id = v_advisor_id
    returning * into v_action;

    v_result := jsonb_build_object(
      'status', 'CONFLICT',
      'mutationId', v_mutation_id,
      'detectedAt', now(),
      'reasonCode', v_conflict_reason,
      'remoteRecord',
        public.forge_nfast09_due_action_json(v_remote_before, v_display_name)
    );

    insert into public.prospect_due_action_mutations (
      mutation_id,
      advisor_id,
      prospect_id,
      device_id,
      due_action_version,
      operation,
      authorized_patch,
      base_server_revision,
      mutation_created_at,
      result_status,
      result_payload
    ) values (
      v_mutation_id,
      v_advisor_id,
      v_prospect_id,
      v_device_id,
      v_due_action_version,
      v_operation,
      v_patch,
      v_base_server_revision,
      v_mutation_created_at,
      'CONFLICT',
      v_result
    );

    insert into public.prospect_due_action_conflicts (
      advisor_id,
      prospect_id,
      mutation_id,
      due_action_version,
      local_operation,
      local_authorized_patch,
      base_server_revision,
      remote_server_revision,
      local_candidate,
      remote_candidate,
      reason_code,
      conflict_status,
      detected_at
    ) values (
      v_advisor_id,
      v_prospect_id,
      v_mutation_id,
      v_due_action_version,
      v_operation,
      v_patch,
      v_base_server_revision,
      v_remote_before.server_revision,
      jsonb_build_object(
        'operation', v_operation,
        'dueActionVersion', v_due_action_version,
        'authorizedPatch', v_patch,
        'deviceId', v_device_id,
        'createdAt', v_mutation_created_at
      ),
      public.forge_nfast09_due_action_json(v_remote_before, v_display_name),
      v_conflict_reason,
      'OPEN',
      now()
    );

    return v_result;
  end if;

  v_result := jsonb_build_object(
    'status', 'ACKNOWLEDGED',
    'mutationId', v_mutation_id,
    'acknowledgedAt', now(),
    'serverRevision', v_action.server_revision::text,
    'serverRecord',
      public.forge_nfast09_due_action_json(v_action, v_display_name)
  );

  insert into public.prospect_due_action_mutations (
    mutation_id,
    advisor_id,
    prospect_id,
    device_id,
    due_action_version,
    operation,
    authorized_patch,
    base_server_revision,
    mutation_created_at,
    result_status,
    result_payload
  ) values (
    v_mutation_id,
    v_advisor_id,
    v_prospect_id,
    v_device_id,
    v_due_action_version,
    v_operation,
    v_patch,
    v_base_server_revision,
    v_mutation_created_at,
    'ACKNOWLEDGED',
    v_result
  );

  return v_result;
end;
$$;

create or replace function public.forge_nfast09_pull_due_action_changes(
  p_cursor text default null,
  p_limit integer default 100
)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_advisor_id uuid := auth.uid();
  v_cursor bigint := 0;
  v_limit integer;
  v_records jsonb := '[]'::jsonb;
  v_next_cursor bigint := 0;
  v_has_more boolean := false;
begin
  if v_advisor_id is null then
    raise exception 'NFAST09_AUTH_REQUIRED'
      using errcode = '42501';
  end if;

  if p_cursor is not null and btrim(p_cursor) <> '' then
    begin
      v_cursor := p_cursor::bigint;
    exception
      when others then
        raise exception 'NFAST09_CURSOR_INVALID'
          using errcode = '22023';
    end;
  end if;

  if v_cursor < 0 then
    raise exception 'NFAST09_CURSOR_INVALID'
      using errcode = '22023';
  end if;

  v_limit := least(greatest(coalesce(p_limit, 100), 1), 500);

  with candidate as (
    select
      action as action_row,
      action.change_seq,
      prospect.full_name,
      row_number() over (order by action.change_seq) as row_number
    from public.prospect_due_actions as action
    join public.prospects as prospect
      on prospect.id = action.prospect_id
     and prospect.advisor_id = action.advisor_id
    where action.advisor_id = v_advisor_id
      and action.change_seq > v_cursor
    order by action.change_seq
    limit v_limit + 1
  ),
  page as (
    select *
    from candidate
    where row_number <= v_limit
    order by change_seq
  )
  select
    coalesce(
      jsonb_agg(
        public.forge_nfast09_due_action_json(
          page.action_row,
          page.full_name
        ) order by page.change_seq
      ),
      '[]'::jsonb
    ),
    coalesce(max(page.change_seq), v_cursor)
  into v_records, v_next_cursor
  from page;

  select exists (
    select 1
    from public.prospect_due_actions
    where advisor_id = v_advisor_id
      and change_seq > v_next_cursor
  ) into v_has_more;

  return jsonb_build_object(
    'records', v_records,
    'nextCursor', v_next_cursor::text,
    'hasMore', v_has_more
  );
end;
$$;

revoke all on function public.forge_nfast09_ack_rank(text)
  from public, anon, authenticated;
revoke all on function public.forge_nfast09_due_action_json(
  public.prospect_due_actions,
  text
) from public, anon, authenticated;
revoke all on function public.forge_nfast09_push_due_action_mutation(jsonb)
  from public, anon;
revoke all on function public.forge_nfast09_pull_due_action_changes(text, integer)
  from public, anon;

grant execute on function public.forge_nfast09_push_due_action_mutation(jsonb)
  to authenticated;
grant execute on function public.forge_nfast09_pull_due_action_changes(text, integer)
  to authenticated;

commit;
