begin;

-- FORGE_ACTIVITY_FOUNDATIONAL_AUTHORITIES_CLOSURE_001
-- Additive operational-calendar authority. No UI, task or external calendar event is created.

create extension if not exists pgcrypto;

create or replace function public.forge_opcal_valid_working_weekdays(p_days jsonb)
returns boolean
language sql
immutable
strict
set search_path = public, pg_temp
as $$
  select case
    when jsonb_typeof(p_days) <> 'array' then false
    when jsonb_array_length(p_days) not between 1 and 7 then false
    else jsonb_array_length(p_days) = (select count(distinct value) from jsonb_array_elements_text(p_days))
      and not exists (
        select 1 from jsonb_array_elements_text(p_days) as supplied(value)
        where supplied.value not in ('MONDAY','TUESDAY','WEDNESDAY','THURSDAY','FRIDAY','SATURDAY','SUNDAY')
      )
  end;
$$;

create or replace function public.forge_opcal_is_iana_timezone(p_timezone text)
returns boolean
language sql
stable
strict
set search_path = pg_catalog, public, pg_temp
as $$ select exists (select 1 from pg_catalog.pg_timezone_names where name = p_timezone); $$;

create or replace function public.forge_opcal_deny_mutation()
returns trigger language plpgsql set search_path = public, pg_temp as $$
begin raise exception 'OPCAL_APPEND_ONLY_MUTATION_DENIED' using errcode = '55000'; end;
$$;

create table if not exists public.operational_calendar_profiles (
  id uuid primary key default gen_random_uuid(),
  profile_reference text not null,
  tenant_id uuid not null references auth.users(id) on delete restrict,
  scope_type text not null check (scope_type in ('ORGANIZATION','ADVISOR')),
  advisor_id uuid references auth.users(id) on delete restrict,
  timezone text not null,
  working_weekdays jsonb not null,
  effective_from date not null,
  effective_to date,
  status text not null default 'ACTIVE' check (status in ('ACTIVE','SUPERSEDED','CANCELLED')),
  source_owner text not null,
  source_reference text not null,
  evidence_state text not null check (evidence_state in ('CONFIRMED','OBSERVED','PROVISIONAL','INCOMPLETE','UNKNOWN','CONFLICTING','STALE')),
  correction_of uuid,
  supersedes uuid,
  recorded_by uuid not null references auth.users(id) on delete restrict,
  recorded_at timestamptz not null default now(),
  provenance jsonb not null default '{}'::jsonb,
  idempotency_key text not null,
  command_digest text not null,
  constraint opcal_profile_scope_ck check ((scope_type = 'ORGANIZATION' and advisor_id is null) or (scope_type = 'ADVISOR' and advisor_id is not null)),
  constraint opcal_profile_timezone_ck check (public.forge_opcal_is_iana_timezone(timezone)),
  constraint opcal_profile_weekdays_ck check (public.forge_opcal_valid_working_weekdays(working_weekdays)),
  constraint opcal_profile_period_ck check (effective_to is null or effective_to >= effective_from),
  constraint opcal_profile_actor_ck check (recorded_by = tenant_id),
  constraint opcal_profile_refs_ck check (
    profile_reference ~ '^[A-Za-z0-9][A-Za-z0-9._:@/-]{0,239}$' and source_owner ~ '^[A-Z0-9][A-Z0-9._:@/-]{0,119}$'
    and source_reference ~ '^[A-Za-z0-9][A-Za-z0-9._:@/-]{0,239}$' and idempotency_key ~ '^[A-Za-z0-9][A-Za-z0-9._:@/-]{0,159}$'
    and command_digest ~ '^[a-f0-9]{64}$'
  ),
  constraint opcal_profile_provenance_ck check (jsonb_typeof(provenance) = 'object' and length(provenance::text) <= 5000 and provenance::text !~* '"(health|medical|familyReason|privateReason|password|secret|token)"'),
  unique (tenant_id, profile_reference), unique (tenant_id, idempotency_key), unique (id, tenant_id)
);

do $$ begin
  alter table public.operational_calendar_profiles add constraint opcal_profile_correction_fk foreign key (correction_of, tenant_id) references public.operational_calendar_profiles (id, tenant_id) on delete restrict deferrable initially deferred;
exception when duplicate_object then null; end $$;
do $$ begin
  alter table public.operational_calendar_profiles add constraint opcal_profile_supersedes_fk foreign key (supersedes, tenant_id) references public.operational_calendar_profiles (id, tenant_id) on delete restrict deferrable initially deferred;
exception when duplicate_object then null; end $$;

create table if not exists public.operational_day_overrides (
  id uuid primary key default gen_random_uuid(),
  override_reference text not null,
  tenant_id uuid not null references auth.users(id) on delete restrict,
  advisor_id uuid references auth.users(id) on delete restrict,
  local_date date not null,
  override_type text not null check (override_type in ('HOLIDAY','ORGANIZATION_CLOSED','WORKING_OVERRIDE','NON_WORKING_OVERRIDE')),
  status text not null default 'CONFIRMED' check (status in ('CONFIRMED','CANCELLED','CORRECTED')),
  source_owner text not null,
  source_reference text not null,
  evidence_state text not null check (evidence_state in ('CONFIRMED','OBSERVED','PROVISIONAL','INCOMPLETE','UNKNOWN','CONFLICTING','STALE')),
  correction_of uuid,
  recorded_by uuid not null references auth.users(id) on delete restrict,
  recorded_at timestamptz not null default now(),
  provenance jsonb not null default '{}'::jsonb,
  idempotency_key text not null,
  command_digest text not null,
  constraint opcal_override_actor_ck check (recorded_by = tenant_id),
  constraint opcal_override_refs_ck check (
    override_reference ~ '^[A-Za-z0-9][A-Za-z0-9._:@/-]{0,239}$' and source_owner ~ '^[A-Z0-9][A-Z0-9._:@/-]{0,119}$'
    and source_reference ~ '^[A-Za-z0-9][A-Za-z0-9._:@/-]{0,239}$' and idempotency_key ~ '^[A-Za-z0-9][A-Za-z0-9._:@/-]{0,159}$'
    and command_digest ~ '^[a-f0-9]{64}$'
  ),
  constraint opcal_override_provenance_ck check (jsonb_typeof(provenance) = 'object' and length(provenance::text) <= 5000 and provenance::text !~* '"(health|medical|familyReason|privateReason|password|secret|token)"'),
  unique (tenant_id, override_reference), unique (tenant_id, idempotency_key), unique (id, tenant_id)
);

do $$ begin
  alter table public.operational_day_overrides add constraint opcal_override_correction_fk foreign key (correction_of, tenant_id) references public.operational_day_overrides (id, tenant_id) on delete restrict deferrable initially deferred;
exception when duplicate_object then null; end $$;

create table if not exists public.advisor_time_off_periods (
  id uuid primary key default gen_random_uuid(),
  time_off_reference text not null,
  tenant_id uuid not null references auth.users(id) on delete restrict,
  advisor_id uuid not null references auth.users(id) on delete restrict,
  start_date date not null,
  end_date date not null,
  timezone text not null,
  status text not null check (status in ('CONFIRMED','CANCELLED','CORRECTED')),
  category text,
  confirmation_state text not null check (confirmation_state in ('REPORTED','CONFIRMED','DISPUTED')),
  source_owner text not null,
  source_reference text not null,
  evidence_state text not null check (evidence_state in ('CONFIRMED','OBSERVED','PROVISIONAL','INCOMPLETE','UNKNOWN','CONFLICTING','STALE')),
  correction_of uuid,
  supersedes uuid,
  archived boolean not null default false,
  recorded_by uuid not null references auth.users(id) on delete restrict,
  recorded_at timestamptz not null default now(),
  provenance jsonb not null default '{}'::jsonb,
  idempotency_key text not null,
  command_digest text not null,
  constraint opcal_time_off_period_ck check (end_date >= start_date),
  constraint opcal_time_off_timezone_ck check (public.forge_opcal_is_iana_timezone(timezone)),
  constraint opcal_time_off_actor_ck check (recorded_by = advisor_id and tenant_id = advisor_id),
  constraint opcal_time_off_category_ck check (category is null or category in ('VACATION','PERSONAL','OTHER_PRIVATE')),
  constraint opcal_time_off_refs_ck check (
    time_off_reference ~ '^[A-Za-z0-9][A-Za-z0-9._:@/-]{0,239}$' and source_owner ~ '^[A-Z0-9][A-Z0-9._:@/-]{0,119}$'
    and source_reference ~ '^[A-Za-z0-9][A-Za-z0-9._:@/-]{0,239}$' and idempotency_key ~ '^[A-Za-z0-9][A-Za-z0-9._:@/-]{0,159}$'
    and command_digest ~ '^[a-f0-9]{64}$'
  ),
  constraint opcal_time_off_privacy_ck check (jsonb_typeof(provenance) = 'object' and length(provenance::text) <= 3000 and provenance::text !~* '"(reason|health|medical|diagnosis|family|password|secret|token)"'),
  unique (tenant_id, time_off_reference), unique (tenant_id, idempotency_key), unique (id, tenant_id)
);

do $$ begin
  alter table public.advisor_time_off_periods add constraint opcal_time_off_correction_fk foreign key (correction_of, tenant_id) references public.advisor_time_off_periods (id, tenant_id) on delete restrict deferrable initially deferred;
exception when duplicate_object then null; end $$;
do $$ begin
  alter table public.advisor_time_off_periods add constraint opcal_time_off_supersedes_fk foreign key (supersedes, tenant_id) references public.advisor_time_off_periods (id, tenant_id) on delete restrict deferrable initially deferred;
exception when duplicate_object then null; end $$;

create index if not exists opcal_profile_effective_idx on public.operational_calendar_profiles (tenant_id, advisor_id, effective_from, effective_to);
create index if not exists opcal_override_date_idx on public.operational_day_overrides (tenant_id, advisor_id, local_date);
create index if not exists opcal_time_off_period_idx on public.advisor_time_off_periods (tenant_id, advisor_id, start_date, end_date);

drop trigger if exists opcal_profiles_append_only on public.operational_calendar_profiles;
create trigger opcal_profiles_append_only before update or delete on public.operational_calendar_profiles for each row execute function public.forge_opcal_deny_mutation();
drop trigger if exists opcal_overrides_append_only on public.operational_day_overrides;
create trigger opcal_overrides_append_only before update or delete on public.operational_day_overrides for each row execute function public.forge_opcal_deny_mutation();
drop trigger if exists opcal_time_off_append_only on public.advisor_time_off_periods;
create trigger opcal_time_off_append_only before update or delete on public.advisor_time_off_periods for each row execute function public.forge_opcal_deny_mutation();

alter table public.operational_calendar_profiles enable row level security;
alter table public.operational_calendar_profiles force row level security;
alter table public.operational_day_overrides enable row level security;
alter table public.operational_day_overrides force row level security;
alter table public.advisor_time_off_periods enable row level security;
alter table public.advisor_time_off_periods force row level security;

revoke all on public.operational_calendar_profiles from anon, authenticated;
revoke all on public.operational_day_overrides from anon, authenticated;
revoke all on public.advisor_time_off_periods from anon, authenticated;

drop policy if exists opcal_profile_owner_select on public.operational_calendar_profiles;
create policy opcal_profile_owner_select on public.operational_calendar_profiles for select to authenticated using (tenant_id = auth.uid() and (advisor_id is null or advisor_id = auth.uid()));
drop policy if exists opcal_profile_owner_insert on public.operational_calendar_profiles;
create policy opcal_profile_owner_insert on public.operational_calendar_profiles for insert to authenticated with check (tenant_id = auth.uid() and recorded_by = auth.uid() and (advisor_id is null or advisor_id = auth.uid()));
drop policy if exists opcal_override_owner_select on public.operational_day_overrides;
create policy opcal_override_owner_select on public.operational_day_overrides for select to authenticated using (tenant_id = auth.uid() and (advisor_id is null or advisor_id = auth.uid()));
drop policy if exists opcal_override_owner_insert on public.operational_day_overrides;
create policy opcal_override_owner_insert on public.operational_day_overrides for insert to authenticated with check (tenant_id = auth.uid() and recorded_by = auth.uid() and (advisor_id is null or advisor_id = auth.uid()));
drop policy if exists opcal_time_off_owner_select on public.advisor_time_off_periods;
create policy opcal_time_off_owner_select on public.advisor_time_off_periods for select to authenticated using (tenant_id = auth.uid() and advisor_id = auth.uid());
drop policy if exists opcal_time_off_owner_insert on public.advisor_time_off_periods;
create policy opcal_time_off_owner_insert on public.advisor_time_off_periods for insert to authenticated with check (tenant_id = auth.uid() and advisor_id = auth.uid() and recorded_by = auth.uid());

grant select, insert on public.operational_calendar_profiles to authenticated;
grant select, insert on public.operational_day_overrides to authenticated;
grant select, insert on public.advisor_time_off_periods to authenticated;

commit;
