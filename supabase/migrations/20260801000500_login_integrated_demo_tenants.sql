-- FORGE LOGIN-INTEGRATED DEMO TENANTS
-- Same productive runtime and domain tables; no parallel demo data model.
-- Demo accounts are classified server-side and sealed read-only after controlled seeding.

begin;

create table if not exists public.forge_demo_advisors (
  advisor_id uuid primary key references auth.users(id) on delete restrict,
  demo_key text not null unique,
  data_class text not null default 'SYNTHETIC',
  is_public boolean not null default false,
  read_only boolean not null default true,
  seeded_at timestamptz,
  sealed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint forge_demo_advisors_key_ck check (
    demo_key ~ '^[A-Z][A-Z0-9_]{1,39}$'
  ),
  constraint forge_demo_advisors_data_class_ck check (
    data_class = 'SYNTHETIC'
  )
);

alter table public.forge_demo_advisors enable row level security;
alter table public.forge_demo_advisors force row level security;
revoke all on table public.forge_demo_advisors from public, anon, authenticated;

create or replace function public.forge_demo_current_session()
returns jsonb
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select case
    when auth.uid() is null then
      jsonb_build_object(
        'isDemo', false,
        'demoKey', null,
        'dataClass', null,
        'readOnly', false
      )
    else coalesce(
      (
        select jsonb_build_object(
          'isDemo', true,
          'demoKey', d.demo_key,
          'dataClass', d.data_class,
          'readOnly', d.read_only,
          'isPublic', d.is_public
        )
        from public.forge_demo_advisors d
        where d.advisor_id = auth.uid()
      ),
      jsonb_build_object(
        'isDemo', false,
        'demoKey', null,
        'dataClass', null,
        'readOnly', false
      )
    )
  end;
$$;

revoke all on function public.forge_demo_current_session() from public, anon;
grant execute on function public.forge_demo_current_session() to authenticated;

create or replace function public.forge_demo_read_only_guard()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  if auth.uid() is not null and exists (
    select 1
    from public.forge_demo_advisors d
    where d.advisor_id = auth.uid()
      and d.read_only = true
  ) then
    raise exception 'FORGE_DEMO_ACCOUNT_READ_ONLY'
      using errcode = '42501';
  end if;
  return coalesce(new, old);
end;
$$;

revoke all on function public.forge_demo_read_only_guard() from public, anon, authenticated;

-- A demo account reuses the productive tables and RPCs, but the public session
-- cannot mutate those authorities after the controlled seed has been sealed.
do $$
declare
  table_name text;
  guarded_tables text[] := array[
    'prospects',
    'opportunities',
    'prospect_contact_methods',
    'prospect_provenance',
    'opportunity_status_history',
    'prospect_journal_entries',
    'prospect_timeline_events',
    'quote_lifecycle_quotes',
    'quote_lifecycle_versions',
    'quote_lifecycle_events',
    'commercial_people',
    'identity_resolution_decisions',
    'commercial_source_identity_links',
    'commercial_accounts',
    'commercial_account_memberships',
    'canonical_policies',
    'policy_evidence_versions',
    'policy_versions',
    'policy_roles',
    'policy_conflicts',
    'cartera010b_command_receipts',
    'expected_payment_obligations',
    'payment_reconciliation_events',
    'relationship_memory_events',
    'advisor_monthly_policy_goals',
    'activity_event_ledger',
    'activity_event_evidence_references',
    'activity_event_mutations',
    'activity_event_conflicts'
  ];
begin
  foreach table_name in array guarded_tables loop
    if to_regclass('public.' || table_name) is not null then
      execute format(
        'drop trigger if exists forge_demo_read_only_guard on public.%I',
        table_name
      );
      execute format(
        'create trigger forge_demo_read_only_guard before insert or update or delete on public.%I for each row execute function public.forge_demo_read_only_guard()',
        table_name
      );
    end if;
  end loop;
end;
$$;

commit;
