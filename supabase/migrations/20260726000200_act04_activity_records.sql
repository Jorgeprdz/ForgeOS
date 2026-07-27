begin;

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
  revision integer not null check (revision > 0),
  payload jsonb not null,
  created_at timestamptz not null,
  updated_at timestamptz not null,
  persisted_at timestamptz not null default now(),
  constraint activity_records_org_truth_unique unique (organization_id, truth_key),
  constraint activity_records_payload_object check (jsonb_typeof(payload) = 'object'),
  constraint activity_records_payload_id_match check (payload ->> 'id' = id),
  constraint activity_records_payload_org_match check (payload ->> 'organizationId' = organization_id),
  constraint activity_records_payload_advisor_match check (payload ->> 'advisorId' = advisor_id),
  constraint activity_records_payload_schema_match check (payload ->> 'schemaVersion' = schema_version),
  constraint activity_records_payload_type_match check (payload ->> 'type' = activity_type),
  constraint activity_records_payload_lifecycle_match check (payload ->> 'lifecycle' = lifecycle)
);

create index if not exists activity_records_org_advisor_occurred_idx on public.activity_records (organization_id, advisor_id, occurred_at desc, id desc);
create index if not exists activity_records_org_evaluation_idx on public.activity_records (organization_id, evaluation_date, activity_type);
create index if not exists activity_records_org_prospect_idx on public.activity_records (organization_id, prospect_id) where prospect_id is not null;
create index if not exists activity_records_org_appointment_idx on public.activity_records (organization_id, appointment_id) where appointment_id is not null;

create or replace function public.forge_activity_records_append_only_guard()
returns trigger language plpgsql as $$
begin
  raise exception 'activity_records is append-only' using errcode = '55000';
end;
$$;

drop trigger if exists forge_activity_records_append_only_guard on public.activity_records;
create trigger forge_activity_records_append_only_guard before update or delete on public.activity_records for each row execute function public.forge_activity_records_append_only_guard();

alter table public.activity_records enable row level security;
drop policy if exists activity_records_select_own on public.activity_records;
create policy activity_records_select_own on public.activity_records for select to authenticated using (advisor_id = auth.uid()::text);
drop policy if exists activity_records_insert_own on public.activity_records;
create policy activity_records_insert_own on public.activity_records for insert to authenticated with check (advisor_id = auth.uid()::text);

create or replace function public.activity_records_append_v1(p_record jsonb, p_truth_key text)
returns jsonb language plpgsql security invoker set search_path = public as $$
declare
  v_id text := nullif(btrim(p_record ->> 'id'), '');
  v_org text := nullif(btrim(p_record ->> 'organizationId'), '');
  v_advisor text := nullif(btrim(p_record ->> 'advisorId'), '');
  v_relation_id text;
  v_existing public.activity_records%rowtype;
  v_row public.activity_records%rowtype;
begin
  if jsonb_typeof(p_record) <> 'object' or v_id is null or v_org is null or v_advisor is null or nullif(btrim(p_truth_key), '') is null then
    raise exception 'record identity is incomplete' using errcode = '22023';
  end if;

  select * into v_existing from public.activity_records where id = v_id;
  if found then
    if v_existing.payload = p_record and v_existing.truth_key = p_truth_key then
      return jsonb_build_object('row', to_jsonb(v_existing), 'inserted', false);
    end if;
    raise unique_violation using message = 'activity id already exists with different content';
  end if;

  select * into v_existing from public.activity_records where organization_id = v_org and truth_key = p_truth_key;
  if found then
    if v_existing.payload = p_record then
      return jsonb_build_object('row', to_jsonb(v_existing), 'inserted', false);
    end if;
    raise unique_violation using message = 'activity truth key already exists with different content';
  end if;

  v_relation_id := coalesce(p_record #>> '{correction,activityId}', p_record #>> '{reversal,activityId}');
  if v_relation_id is not null then
    perform 1 from public.activity_records where id = v_relation_id and organization_id = v_org and advisor_id = v_advisor;
    if not found then raise no_data_found using message = 'referenced activity does not exist in advisor scope'; end if;
  end if;

  insert into public.activity_records (
    id, organization_id, advisor_id, manager_id, prospect_id, opportunity_id, appointment_id, policy_id,
    truth_key, schema_version, activity_type, lifecycle, source_system, evidence_state, occurred_at,
    evaluation_date, revision, payload, created_at, updated_at
  ) values (
    v_id, v_org, v_advisor, nullif(p_record ->> 'managerId', ''), nullif(p_record ->> 'prospectId', ''),
    nullif(p_record ->> 'opportunityId', ''), nullif(p_record ->> 'appointmentId', ''), nullif(p_record ->> 'policyId', ''),
    p_truth_key, p_record ->> 'schemaVersion', p_record ->> 'type', p_record ->> 'lifecycle',
    p_record #>> '{source,system}', p_record #>> '{source,evidenceState}', (p_record ->> 'occurredAt')::timestamptz,
    (p_record ->> 'evaluationDate')::date, (p_record ->> 'revision')::integer, p_record,
    (p_record ->> 'createdAt')::timestamptz, (p_record ->> 'updatedAt')::timestamptz
  ) returning * into v_row;
  return jsonb_build_object('row', to_jsonb(v_row), 'inserted', true);
end;
$$;

create or replace function public.activity_records_get_by_id_v1(p_organization_id text, p_id text)
returns jsonb language sql stable security invoker set search_path = public as $$
  select to_jsonb(r) from public.activity_records r where r.organization_id = p_organization_id and r.id = p_id limit 1;
$$;

create or replace function public.activity_records_get_by_truth_v1(p_organization_id text, p_truth_key text)
returns jsonb language sql stable security invoker set search_path = public as $$
  select to_jsonb(r) from public.activity_records r where r.organization_id = p_organization_id and r.truth_key = p_truth_key limit 1;
$$;

create or replace function public.activity_records_list_v1(p_query jsonb)
returns jsonb language sql stable security invoker set search_path = public as $$
  select coalesce(jsonb_agg(to_jsonb(q)), '[]'::jsonb)
  from (
    select r.* from public.activity_records r
    where r.organization_id = p_query ->> 'organizationId'
      and (nullif(p_query ->> 'advisorId', '') is null or r.advisor_id = p_query ->> 'advisorId')
      and (not (p_query ? 'types') or p_query -> 'types' is null or r.activity_type in (select jsonb_array_elements_text(p_query -> 'types')))
      and (not (p_query ? 'lifecycles') or p_query -> 'lifecycles' is null or r.lifecycle in (select jsonb_array_elements_text(p_query -> 'lifecycles')))
      and (not (p_query ? 'sourceSystems') or p_query -> 'sourceSystems' is null or r.source_system in (select jsonb_array_elements_text(p_query -> 'sourceSystems')))
      and (not (p_query ? 'evidenceStates') or p_query -> 'evidenceStates' is null or r.evidence_state in (select jsonb_array_elements_text(p_query -> 'evidenceStates')))
      and (nullif(p_query ->> 'prospectId', '') is null or r.prospect_id = p_query ->> 'prospectId')
      and (nullif(p_query ->> 'opportunityId', '') is null or r.opportunity_id = p_query ->> 'opportunityId')
      and (nullif(p_query ->> 'appointmentId', '') is null or r.appointment_id = p_query ->> 'appointmentId')
      and (nullif(p_query ->> 'policyId', '') is null or r.policy_id = p_query ->> 'policyId')
      and (nullif(p_query ->> 'evaluationDateFrom', '') is null or r.evaluation_date >= (p_query ->> 'evaluationDateFrom')::date)
      and (nullif(p_query ->> 'evaluationDateTo', '') is null or r.evaluation_date <= (p_query ->> 'evaluationDateTo')::date)
      and (nullif(p_query ->> 'occurredAtFrom', '') is null or r.occurred_at >= (p_query ->> 'occurredAtFrom')::timestamptz)
      and (nullif(p_query ->> 'occurredAtTo', '') is null or r.occurred_at <= (p_query ->> 'occurredAtTo')::timestamptz)
      and (
        p_query -> 'cursor' is null
        or ((p_query ->> 'order') = 'asc' and (r.occurred_at, r.id) > ((p_query #>> '{cursor,occurredAt}')::timestamptz, p_query #>> '{cursor,id}'))
        or (coalesce(p_query ->> 'order', 'desc') = 'desc' and (r.occurred_at, r.id) < ((p_query #>> '{cursor,occurredAt}')::timestamptz, p_query #>> '{cursor,id}'))
      )
    order by
      case when p_query ->> 'order' = 'asc' then r.occurred_at end asc,
      case when p_query ->> 'order' = 'asc' then r.id end asc,
      case when coalesce(p_query ->> 'order', 'desc') = 'desc' then r.occurred_at end desc,
      case when coalesce(p_query ->> 'order', 'desc') = 'desc' then r.id end desc
    limit least(greatest(coalesce((p_query ->> 'limit')::integer, 101), 1), 501)
  ) q;
$$;

create or replace function public.activity_records_count_v1(p_query jsonb)
returns bigint language sql stable security invoker set search_path = public as $$
  select count(*) from public.activity_records r
  where r.organization_id = p_query ->> 'organizationId'
    and (nullif(p_query ->> 'advisorId', '') is null or r.advisor_id = p_query ->> 'advisorId');
$$;

grant execute on function public.activity_records_append_v1(jsonb, text) to authenticated;
grant execute on function public.activity_records_get_by_id_v1(text, text) to authenticated;
grant execute on function public.activity_records_get_by_truth_v1(text, text) to authenticated;
grant execute on function public.activity_records_list_v1(jsonb) to authenticated;
grant execute on function public.activity_records_count_v1(jsonb) to authenticated;

commit;
