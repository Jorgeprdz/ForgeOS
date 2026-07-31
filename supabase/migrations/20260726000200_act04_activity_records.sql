begin

create extension if not exists pgcrypto
  with schema extensions

create table if not exists public.activity_records (
  id text primary key,
  organization_id text not null,
  advisor_id text not null,
  manager_id text,
  prospect_id text,
  opportunity_id text,
  appointment_id text,
  policy_id text,
  truth_key text not null,
  schema_version text not null,
  activity_type text not null,
  lifecycle text not null,
  source_system text not null,
  evidence_state text not null,
  occurred_at timestamptz not null,
  evaluation_date date not null,
  revision integer not null
    check (revision > 0),
  payload jsonb not null,
  created_at timestamptz not null,
  updated_at timestamptz not null,
  persisted_at timestamptz not null
    default now(),
  constraint activity_records_org_truth_unique
    unique (organization_id, truth_key),
  constraint activity_records_payload_object
    check (jsonb_typeof(payload) = 'object'),
  constraint activity_records_payload_id_match
    check (payload ->> 'id' = id),
  constraint activity_records_payload_org_match
    check (
      payload ->> 'organizationId' =
      organization_id
    ),
  constraint activity_records_payload_advisor_match
    check (
      payload ->> 'advisorId' =
      advisor_id
    ),
  constraint activity_records_payload_schema_match
    check (
      payload ->> 'schemaVersion' =
      schema_version
    ),
  constraint activity_records_payload_type_match
    check (
      payload ->> 'type' =
      activity_type
    ),
  constraint activity_records_payload_lifecycle_match
    check (
      payload ->> 'lifecycle' =
      lifecycle
    )
)

create index if not exists
  activity_records_org_advisor_occurred_idx
on public.activity_records (
  organization_id,
  advisor_id,
  occurred_at desc,
  id desc
)

create index if not exists
  activity_records_org_evaluation_idx
on public.activity_records (
  organization_id,
  evaluation_date,
  activity_type
)

create index if not exists
  activity_records_org_prospect_idx
on public.activity_records (
  organization_id,
  prospect_id
)
where prospect_id is not null

create index if not exists
  activity_records_org_appointment_idx
on public.activity_records (
  organization_id,
  appointment_id
)
where appointment_id is not null

create or replace function
  public.forge_activity_records_append_only_guard()
returns trigger
language plpgsql
set search_path = public, pg_temp
as $$
begin
  raise exception
    'activity_records is append-only'
    using errcode = '55000';
end;
$$

drop trigger if exists
  forge_activity_records_append_only_guard
on public.activity_records

create trigger
  forge_activity_records_append_only_guard
before update or delete
on public.activity_records
for each row
execute function
  public.forge_activity_records_append_only_guard()

alter table public.activity_records
  enable row level security

alter table public.activity_records
  force row level security

drop policy if exists
  activity_records_select_own
on public.activity_records

create policy activity_records_select_own
on public.activity_records
for select
to authenticated
using (
  advisor_id = auth.uid()::text
)

drop policy if exists
  activity_records_insert_own
on public.activity_records

create policy activity_records_insert_own
on public.activity_records
for insert
to authenticated
with check (
  advisor_id = auth.uid()::text
)

revoke all
on table public.activity_records
from anon, authenticated

create or replace function
  public.activity_records_append_v1(
    p_record jsonb,
    p_truth_key text
  )
returns jsonb
language plpgsql
security definer
set search_path = public, extensions, pg_temp
as $$
declare
  v_auth uuid := auth.uid();
  v_id text;
  v_org text;
  v_advisor text;
  v_relation_id text;
  v_expected_truth text;
  v_existing public.activity_records%rowtype;
  v_row public.activity_records%rowtype;
begin
  if v_auth is null then
    raise insufficient_privilege
      using message =
        'authenticated advisor required';
  end if;

  if jsonb_typeof(p_record) <> 'object' then
    raise exception
      'record must be a JSON object'
      using errcode = '22023';
  end if;

  v_id := nullif(
    btrim(p_record ->> 'id'),
    ''
  );
  v_org := nullif(
    btrim(p_record ->> 'organizationId'),
    ''
  );
  v_advisor := nullif(
    btrim(p_record ->> 'advisorId'),
    ''
  );

  if (
    v_id is null or
    v_org is null or
    v_advisor is null or
    nullif(btrim(p_truth_key), '') is null
  ) then
    raise exception
      'record identity is incomplete'
      using errcode = '22023';
  end if;

  if v_advisor <> v_auth::text then
    raise insufficient_privilege
      using message =
        'advisor identity injection denied';
  end if;

  v_expected_truth :=
    'activity:' ||
    encode(
      extensions.digest(
        concat_ws(
          chr(31),
          p_record ->> 'schemaVersion',
          v_org,
          v_advisor,
          p_record #>> '{source,system}',
          p_record #>> '{source,eventId}',
          p_record ->> 'type',
          p_record ->> 'occurredAt'
        ),
        'sha256'
      ),
      'hex'
    );

  if p_truth_key <> v_expected_truth then
    raise exception
      'activity truth key mismatch'
      using errcode = '23514';
  end if;

  select *
  into v_existing
  from public.activity_records
  where id = v_id;

  if found then
    if (
      v_existing.payload = p_record and
      v_existing.truth_key = p_truth_key
    ) then
      return jsonb_build_object(
        'row',
        to_jsonb(v_existing),
        'inserted',
        false
      );
    end if;

    raise unique_violation
      using message =
        'activity id already exists with different content';
  end if;

  select *
  into v_existing
  from public.activity_records
  where organization_id = v_org
    and truth_key = p_truth_key;

  if found then
    if v_existing.payload = p_record then
      return jsonb_build_object(
        'row',
        to_jsonb(v_existing),
        'inserted',
        false
      );
    end if;

    raise unique_violation
      using message =
        'activity truth key already exists with different content';
  end if;

  v_relation_id := coalesce(
    p_record #>> '{correction,activityId}',
    p_record #>> '{reversal,activityId}'
  );

  if v_relation_id is not null then
    perform 1
    from public.activity_records
    where id = v_relation_id
      and organization_id = v_org
      and advisor_id = v_advisor;

    if not found then
      raise no_data_found
        using message =
          'referenced activity does not exist in advisor scope';
    end if;
  end if;

  insert into public.activity_records (
    id,
    organization_id,
    advisor_id,
    manager_id,
    prospect_id,
    opportunity_id,
    appointment_id,
    policy_id,
    truth_key,
    schema_version,
    activity_type,
    lifecycle,
    source_system,
    evidence_state,
    occurred_at,
    evaluation_date,
    revision,
    payload,
    created_at,
    updated_at
  )
  values (
    v_id,
    v_org,
    v_advisor,
    nullif(p_record ->> 'managerId', ''),
    nullif(p_record ->> 'prospectId', ''),
    nullif(p_record ->> 'opportunityId', ''),
    nullif(p_record ->> 'appointmentId', ''),
    nullif(p_record ->> 'policyId', ''),
    p_truth_key,
    p_record ->> 'schemaVersion',
    p_record ->> 'type',
    p_record ->> 'lifecycle',
    p_record #>> '{source,system}',
    p_record #>> '{source,evidenceState}',
    (p_record ->> 'occurredAt')::timestamptz,
    (p_record ->> 'evaluationDate')::date,
    (p_record ->> 'revision')::integer,
    p_record,
    (p_record ->> 'createdAt')::timestamptz,
    (p_record ->> 'updatedAt')::timestamptz
  )
  returning *
  into v_row;

  return jsonb_build_object(
    'row',
    to_jsonb(v_row),
    'inserted',
    true
  );
end;
$$

create or replace function
  public.activity_records_get_by_id_v1(
    p_organization_id text,
    p_id text
  )
returns jsonb
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select to_jsonb(r)
  from public.activity_records r
  where auth.uid() is not null
    and r.advisor_id = auth.uid()::text
    and r.organization_id = p_organization_id
    and r.id = p_id
  limit 1;
$$

create or replace function
  public.activity_records_get_by_truth_v1(
    p_organization_id text,
    p_truth_key text
  )
returns jsonb
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select to_jsonb(r)
  from public.activity_records r
  where auth.uid() is not null
    and r.advisor_id = auth.uid()::text
    and r.organization_id = p_organization_id
    and r.truth_key = p_truth_key
  limit 1;
$$

create or replace function
  public.activity_records_list_v1(
    p_query jsonb
  )
returns jsonb
language plpgsql
stable
security definer
set search_path = public, pg_temp
as $$
declare
  v_auth uuid := auth.uid();
  v_org text;
  v_order text;
  v_limit integer;
  v_cursor_at timestamptz;
  v_cursor_id text;
  v_result jsonb;
begin
  if v_auth is null then
    raise insufficient_privilege
      using message =
        'authenticated advisor required';
  end if;

  if jsonb_typeof(p_query) <> 'object' then
    raise exception
      'query must be a JSON object'
      using errcode = '22023';
  end if;

  v_org := nullif(
    btrim(p_query ->> 'organizationId'),
    ''
  );
  v_order := coalesce(
    nullif(p_query ->> 'order', ''),
    'desc'
  );
  v_limit := least(
    greatest(
      coalesce(
        nullif(
          p_query ->> 'limit',
          ''
        )::integer,
        101
      ),
      1
    ),
    501
  );

  if v_org is null then
    raise exception
      'organizationId is required'
      using errcode = '22023';
  end if;

  if v_order not in ('asc', 'desc') then
    raise exception
      'order is invalid'
      using errcode = '22023';
  end if;

  if jsonb_typeof(
    p_query -> 'cursor'
  ) = 'object' then
    v_cursor_at :=
      nullif(
        p_query #>> '{cursor,occurredAt}',
        ''
      )::timestamptz;
    v_cursor_id :=
      nullif(
        p_query #>> '{cursor,id}',
        ''
      );
  end if;

  select coalesce(
    jsonb_agg(
      to_jsonb(filtered)
      order by
        case when v_order = 'asc'
          then filtered.occurred_at end asc,
        case when v_order = 'asc'
          then filtered.id end asc,
        case when v_order = 'desc'
          then filtered.occurred_at end desc,
        case when v_order = 'desc'
          then filtered.id end desc
    ),
    '[]'::jsonb
  )
  into v_result
  from (
    select r.*
    from public.activity_records r
    where r.advisor_id = v_auth::text
      and r.organization_id = v_org
      and (
        nullif(
          p_query ->> 'advisorId',
          ''
        ) is null
        or r.advisor_id =
          p_query ->> 'advisorId'
      )
      and (
        case
          when jsonb_typeof(
            p_query -> 'types'
          ) = 'array'
          then r.activity_type in (
            select jsonb_array_elements_text(
              p_query -> 'types'
            )
          )
          else true
        end
      )
      and (
        case
          when jsonb_typeof(
            p_query -> 'lifecycles'
          ) = 'array'
          then r.lifecycle in (
            select jsonb_array_elements_text(
              p_query -> 'lifecycles'
            )
          )
          else true
        end
      )
      and (
        case
          when jsonb_typeof(
            p_query -> 'sourceSystems'
          ) = 'array'
          then r.source_system in (
            select jsonb_array_elements_text(
              p_query -> 'sourceSystems'
            )
          )
          else true
        end
      )
      and (
        case
          when jsonb_typeof(
            p_query -> 'evidenceStates'
          ) = 'array'
          then r.evidence_state in (
            select jsonb_array_elements_text(
              p_query -> 'evidenceStates'
            )
          )
          else true
        end
      )
      and (
        nullif(
          p_query ->> 'prospectId',
          ''
        ) is null
        or r.prospect_id =
          p_query ->> 'prospectId'
      )
      and (
        nullif(
          p_query ->> 'opportunityId',
          ''
        ) is null
        or r.opportunity_id =
          p_query ->> 'opportunityId'
      )
      and (
        nullif(
          p_query ->> 'appointmentId',
          ''
        ) is null
        or r.appointment_id =
          p_query ->> 'appointmentId'
      )
      and (
        nullif(
          p_query ->> 'policyId',
          ''
        ) is null
        or r.policy_id =
          p_query ->> 'policyId'
      )
      and (
        nullif(
          p_query ->> 'evaluationDateFrom',
          ''
        ) is null
        or r.evaluation_date >=
          (
            p_query ->>
              'evaluationDateFrom'
          )::date
      )
      and (
        nullif(
          p_query ->> 'evaluationDateTo',
          ''
        ) is null
        or r.evaluation_date <=
          (
            p_query ->>
              'evaluationDateTo'
          )::date
      )
      and (
        nullif(
          p_query ->> 'occurredAtFrom',
          ''
        ) is null
        or r.occurred_at >=
          (
            p_query ->>
              'occurredAtFrom'
          )::timestamptz
      )
      and (
        nullif(
          p_query ->> 'occurredAtTo',
          ''
        ) is null
        or r.occurred_at <=
          (
            p_query ->>
              'occurredAtTo'
          )::timestamptz
      )
      and (
        v_cursor_at is null
        or (
          v_order = 'desc'
          and (
            r.occurred_at < v_cursor_at
            or (
              r.occurred_at = v_cursor_at
              and r.id < v_cursor_id
            )
          )
        )
        or (
          v_order = 'asc'
          and (
            r.occurred_at > v_cursor_at
            or (
              r.occurred_at = v_cursor_at
              and r.id > v_cursor_id
            )
          )
        )
      )
    order by
      case when v_order = 'asc'
        then r.occurred_at end asc,
      case when v_order = 'asc'
        then r.id end asc,
      case when v_order = 'desc'
        then r.occurred_at end desc,
      case when v_order = 'desc'
        then r.id end desc
    limit v_limit
  ) filtered;

  return v_result;
end;
$$

create or replace function
  public.activity_records_count_v1(
    p_query jsonb
  )
returns bigint
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select count(*)
  from public.activity_records r
  where auth.uid() is not null
    and r.advisor_id = auth.uid()::text
    and r.organization_id =
      p_query ->> 'organizationId'
    and (
      nullif(
        p_query ->> 'advisorId',
        ''
      ) is null
      or r.advisor_id =
        p_query ->> 'advisorId'
    );
$$

revoke all
on function
  public.activity_records_append_v1(
    jsonb,
    text
  )
from public, anon

revoke all
on function
  public.activity_records_get_by_id_v1(
    text,
    text
  )
from public, anon

revoke all
on function
  public.activity_records_get_by_truth_v1(
    text,
    text
  )
from public, anon

revoke all
on function
  public.activity_records_list_v1(
    jsonb
  )
from public, anon

revoke all
on function
  public.activity_records_count_v1(
    jsonb
  )
from public, anon

grant execute
on function
  public.activity_records_append_v1(
    jsonb,
    text
  )
to authenticated

grant execute
on function
  public.activity_records_get_by_id_v1(
    text,
    text
  )
to authenticated

grant execute
on function
  public.activity_records_get_by_truth_v1(
    text,
    text
  )
to authenticated

grant execute
on function
  public.activity_records_list_v1(
    jsonb
  )
to authenticated

grant execute
on function
  public.activity_records_count_v1(
    jsonb
  )
to authenticated

commit
