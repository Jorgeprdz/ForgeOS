-- SMART WIDGETS PRODUCTIVE PASS — MONTHLY POLICY GOAL AUTHORITY
-- Repository implementation only. Deployment requires the normal Supabase migration gate.
-- One family protected is one POLICY_SOLD_CONFIRMED fact; this table owns only the advisor's monthly target.

begin;

create extension if not exists pgcrypto;

create table if not exists public.advisor_monthly_policy_goals (
  id uuid primary key default gen_random_uuid(),
  advisor_id uuid not null references auth.users(id) on delete restrict,
  year_month date not null,
  target_policy_count integer not null,
  revision integer not null,
  reason text,
  evidence_reference text,
  effective_from timestamptz not null default now(),
  supersedes_goal_id uuid references public.advisor_monthly_policy_goals(id) on delete restrict,
  created_at timestamptz not null default now(),
  created_by uuid not null references auth.users(id) on delete restrict,
  constraint advisor_monthly_policy_goals_month_ck
    check (extract(day from year_month) = 1),
  constraint advisor_monthly_policy_goals_target_ck
    check (target_policy_count between 1 and 1000),
  constraint advisor_monthly_policy_goals_revision_ck
    check (revision >= 1),
  constraint advisor_monthly_policy_goals_actor_ck
    check (created_by = advisor_id),
  constraint advisor_monthly_policy_goals_reason_ck
    check (reason is null or char_length(btrim(reason)) between 1 and 500),
  constraint advisor_monthly_policy_goals_evidence_ck
    check (evidence_reference is null or char_length(btrim(evidence_reference)) between 1 and 500),
  constraint advisor_monthly_policy_goals_revision_uq
    unique (advisor_id, year_month, revision)
);

create index if not exists advisor_monthly_policy_goals_current_idx
  on public.advisor_monthly_policy_goals (advisor_id, year_month, revision desc);

create or replace function public.forge_advisor_monthly_policy_goal_append_only_guard()
returns trigger
language plpgsql
security invoker
set search_path = public, pg_temp
as $$
begin
  raise exception 'ADVISOR_MONTHLY_POLICY_GOAL_APPEND_ONLY';
end;
$$;

drop trigger if exists forge_advisor_monthly_policy_goal_append_only_guard
  on public.advisor_monthly_policy_goals;
create trigger forge_advisor_monthly_policy_goal_append_only_guard
before update or delete on public.advisor_monthly_policy_goals
for each row execute function public.forge_advisor_monthly_policy_goal_append_only_guard();

create or replace function public.forge_set_monthly_policy_goal(
  p_year_month date,
  p_target_policy_count integer,
  p_reason text default null,
  p_evidence_reference text default null
)
returns public.advisor_monthly_policy_goals
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_advisor_id uuid := auth.uid();
  v_previous public.advisor_monthly_policy_goals;
  v_inserted public.advisor_monthly_policy_goals;
begin
  if v_advisor_id is null then
    raise exception 'AUTHENTICATION_REQUIRED';
  end if;
  if p_year_month is null or extract(day from p_year_month) <> 1 then
    raise exception 'YEAR_MONTH_MUST_BE_FIRST_DAY';
  end if;
  if p_target_policy_count is null or p_target_policy_count < 1 or p_target_policy_count > 1000 then
    raise exception 'TARGET_POLICY_COUNT_OUT_OF_RANGE';
  end if;
  if p_reason is not null and char_length(btrim(p_reason)) not between 1 and 500 then
    raise exception 'GOAL_REASON_INVALID';
  end if;
  if p_evidence_reference is not null and char_length(btrim(p_evidence_reference)) not between 1 and 500 then
    raise exception 'GOAL_EVIDENCE_REFERENCE_INVALID';
  end if;

  perform pg_advisory_xact_lock(hashtextextended(v_advisor_id::text || ':' || p_year_month::text, 0));

  select * into v_previous
  from public.advisor_monthly_policy_goals
  where advisor_id = v_advisor_id
    and year_month = p_year_month
  order by revision desc
  limit 1;

  insert into public.advisor_monthly_policy_goals (
    advisor_id,
    year_month,
    target_policy_count,
    revision,
    reason,
    evidence_reference,
    effective_from,
    supersedes_goal_id,
    created_by
  ) values (
    v_advisor_id,
    p_year_month,
    p_target_policy_count,
    coalesce(v_previous.revision, 0) + 1,
    nullif(btrim(p_reason), ''),
    nullif(btrim(p_evidence_reference), ''),
    now(),
    v_previous.id,
    v_advisor_id
  )
  returning * into v_inserted;

  return v_inserted;
end;
$$;

alter table public.advisor_monthly_policy_goals enable row level security;

revoke all on table public.advisor_monthly_policy_goals from anon, authenticated;
grant select on table public.advisor_monthly_policy_goals to authenticated;

drop policy if exists advisor_monthly_policy_goals_select_own
  on public.advisor_monthly_policy_goals;
create policy advisor_monthly_policy_goals_select_own
on public.advisor_monthly_policy_goals
for select to authenticated
using (advisor_id = auth.uid());

revoke all on function public.forge_advisor_monthly_policy_goal_append_only_guard() from public, anon, authenticated;
revoke all on function public.forge_set_monthly_policy_goal(date, integer, text, text) from public, anon;
grant execute on function public.forge_set_monthly_policy_goal(date, integer, text, text) to authenticated;

commit;
