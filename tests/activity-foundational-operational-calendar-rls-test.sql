\set ON_ERROR_STOP on

create role anon nologin;
create role authenticated nologin;
create schema auth;
create table auth.users (id uuid primary key);
create or replace function auth.uid()
returns uuid
language sql
stable
as $$
  select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid;
$$;

grant usage on schema auth to authenticated;
grant select on auth.users to authenticated;

\ir ../supabase/migrations/20260805000100_activity_operational_calendar_authority.sql

insert into auth.users (id) values
  ('11111111-1111-4111-8111-111111111111'),
  ('22222222-2222-4222-8222-222222222222');

set role authenticated;
set request.jwt.claim.sub = '11111111-1111-4111-8111-111111111111';

insert into public.operational_calendar_profiles (
  profile_reference, tenant_id, scope_type, advisor_id, timezone,
  working_weekdays, effective_from, effective_to, status,
  source_owner, source_reference, evidence_state,
  recorded_by, provenance, idempotency_key, command_digest
) values (
  'profile-advisor-a-v1',
  '11111111-1111-4111-8111-111111111111',
  'ADVISOR',
  '11111111-1111-4111-8111-111111111111',
  'America/Mexico_City',
  '["MONDAY","TUESDAY","WEDNESDAY","THURSDAY","FRIDAY"]'::jsonb,
  '2026-01-01', null, 'ACTIVE',
  'HUMAN_OWNER', 'owner-instruction-a', 'CONFIRMED',
  '11111111-1111-4111-8111-111111111111',
  '{"authorization":"FORGE_ACTIVITY_FOUNDATIONAL_AUTHORITIES_CLOSURE_001"}'::jsonb,
  'profile-a-v1', repeat('a', 64)
);

insert into public.operational_day_overrides (
  override_reference, tenant_id, advisor_id, local_date, override_type,
  status, source_owner, source_reference, evidence_state,
  recorded_by, provenance, idempotency_key, command_digest
) values (
  'holiday-a-2026-09-16',
  '11111111-1111-4111-8111-111111111111', null,
  '2026-09-16', 'HOLIDAY', 'CONFIRMED',
  'HUMAN_OWNER', 'holiday-source-a', 'CONFIRMED',
  '11111111-1111-4111-8111-111111111111', '{}'::jsonb,
  'holiday-a-2026-09-16', repeat('b', 64)
);

insert into public.advisor_time_off_periods (
  time_off_reference, tenant_id, advisor_id, start_date, end_date,
  timezone, status, category, confirmation_state,
  source_owner, source_reference, evidence_state,
  recorded_by, provenance, idempotency_key, command_digest
) values (
  'time-off-a-original',
  '11111111-1111-4111-8111-111111111111',
  '11111111-1111-4111-8111-111111111111',
  '2026-08-10', '2026-08-12', 'America/Mexico_City',
  'CONFIRMED', 'VACATION', 'CONFIRMED',
  'ADVISOR_CONFIRMED', 'time-off-source-a', 'CONFIRMED',
  '11111111-1111-4111-8111-111111111111', '{}'::jsonb,
  'time-off-a-original', repeat('c', 64)
) returning id as original_time_off_id \gset

insert into public.advisor_time_off_periods (
  time_off_reference, tenant_id, advisor_id, start_date, end_date,
  timezone, status, category, confirmation_state,
  source_owner, source_reference, evidence_state,
  correction_of, supersedes,
  recorded_by, provenance, idempotency_key, command_digest
) values (
  'time-off-a-correction',
  '11111111-1111-4111-8111-111111111111',
  '11111111-1111-4111-8111-111111111111',
  '2026-08-11', '2026-08-13', 'America/Mexico_City',
  'CORRECTED', 'VACATION', 'CONFIRMED',
  'ADVISOR_CONFIRMED', 'time-off-source-a-correction', 'CONFIRMED',
  :'original_time_off_id', :'original_time_off_id',
  '11111111-1111-4111-8111-111111111111', '{}'::jsonb,
  'time-off-a-correction', repeat('d', 64)
);

-- Cross-tenant writes must fail under RLS.
do $$
begin
  begin
    insert into public.operational_calendar_profiles (
      profile_reference, tenant_id, scope_type, advisor_id, timezone,
      working_weekdays, effective_from, status,
      source_owner, source_reference, evidence_state,
      recorded_by, provenance, idempotency_key, command_digest
    ) values (
      'cross-tenant-profile',
      '22222222-2222-4222-8222-222222222222',
      'ADVISOR', '22222222-2222-4222-8222-222222222222',
      'UTC', '["MONDAY"]'::jsonb, '2026-01-01', 'ACTIVE',
      'HUMAN_OWNER', 'cross-tenant-source', 'CONFIRMED',
      '22222222-2222-4222-8222-222222222222', '{}'::jsonb,
      'cross-tenant-profile', repeat('e', 64)
    );
    raise exception 'EXPECTED_RLS_REJECTION_NOT_RAISED';
  exception
    when insufficient_privilege then null;
    when check_violation then null;
  end;
end;
$$;

-- Idempotency must reject a duplicate command.
do $$
begin
  begin
    insert into public.operational_day_overrides (
      override_reference, tenant_id, advisor_id, local_date, override_type,
      status, source_owner, source_reference, evidence_state,
      recorded_by, provenance, idempotency_key, command_digest
    ) values (
      'holiday-a-duplicate-reference',
      '11111111-1111-4111-8111-111111111111', null,
      '2026-09-17', 'HOLIDAY', 'CONFIRMED',
      'HUMAN_OWNER', 'holiday-source-duplicate', 'CONFIRMED',
      '11111111-1111-4111-8111-111111111111', '{}'::jsonb,
      'holiday-a-2026-09-16', repeat('f', 64)
    );
    raise exception 'EXPECTED_IDEMPOTENCY_REJECTION_NOT_RAISED';
  exception
    when unique_violation then null;
  end;
end;
$$;

-- Existing records are append-only. Authenticated users have no UPDATE grant;
-- the trigger remains defense-in-depth for privileged writers.
do $$
begin
  begin
    update public.operational_calendar_profiles
      set timezone = 'UTC'
      where profile_reference = 'profile-advisor-a-v1';
    raise exception 'EXPECTED_APPEND_ONLY_REJECTION_NOT_RAISED';
  exception
    when insufficient_privilege then null;
    when sqlstate '55000' then null;
  end;
end;
$$;

reset role;
set role authenticated;
set request.jwt.claim.sub = '22222222-2222-4222-8222-222222222222';

insert into public.operational_calendar_profiles (
  profile_reference, tenant_id, scope_type, advisor_id, timezone,
  working_weekdays, effective_from, status,
  source_owner, source_reference, evidence_state,
  recorded_by, provenance, idempotency_key, command_digest
) values (
  'profile-advisor-b-v1',
  '22222222-2222-4222-8222-222222222222',
  'ADVISOR', '22222222-2222-4222-8222-222222222222',
  'Europe/Madrid', '["TUESDAY","THURSDAY"]'::jsonb,
  '2026-01-01', 'ACTIVE',
  'HUMAN_OWNER', 'owner-instruction-b', 'CONFIRMED',
  '22222222-2222-4222-8222-222222222222', '{}'::jsonb,
  'profile-b-v1', repeat('1', 64)
);

reset role;
set role authenticated;
set request.jwt.claim.sub = '11111111-1111-4111-8111-111111111111';

do $$
declare
  visible_profiles integer;
  visible_overrides integer;
  visible_time_off integer;
begin
  select count(*) into visible_profiles from public.operational_calendar_profiles;
  select count(*) into visible_overrides from public.operational_day_overrides;
  select count(*) into visible_time_off from public.advisor_time_off_periods;
  if visible_profiles <> 1 then raise exception 'TENANT_PROFILE_ISOLATION_FAILED:%', visible_profiles; end if;
  if visible_overrides <> 1 then raise exception 'TENANT_OVERRIDE_ISOLATION_FAILED:%', visible_overrides; end if;
  if visible_time_off <> 2 then raise exception 'TENANT_TIME_OFF_ISOLATION_FAILED:%', visible_time_off; end if;
end;
$$;

reset role;

select 'OPERATIONAL_CALENDAR_MIGRATION_EXECUTION=PASS' as result;
select 'RLS_NON_WEAKENING=PASS' as result;
select 'TENANT_ISOLATION=PASS' as result;
select 'IDEMPOTENCY=PASS' as result;
select 'CORRECTION_AUDIT=PASS' as result;
select 'APPEND_ONLY=PASS' as result;
