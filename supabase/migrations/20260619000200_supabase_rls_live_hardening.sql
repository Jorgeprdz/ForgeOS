-- SUPABASE RLS LIVE HARDENING 001
-- Purpose:
-- Align live Supabase RLS policies with repo-owned RLS beta foundation.
-- Removes legacy anon allow-all alpha policies.
-- Evidence: live DB had anon ALL policies on prospects, alpha_events, forge_outputs, validation_results.

begin;

create extension if not exists pgcrypto;

create table if not exists public.crm_data (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  coleccion text not null,
  datos jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, coleccion)
);

create table if not exists public.prospects (
  id uuid primary key default gen_random_uuid(),
  advisor_id uuid not null references auth.users(id) on delete cascade,
  alias text,
  created_at timestamptz not null default now()
);

create table if not exists public.alpha_events (
  id uuid primary key default gen_random_uuid(),
  advisor_id uuid not null references auth.users(id) on delete cascade,
  prospect_id uuid references public.prospects(id) on delete set null,
  raw_note text,
  canonical_events jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.forge_outputs (
  id uuid primary key default gen_random_uuid(),
  advisor_id uuid not null references auth.users(id) on delete cascade,
  event_id uuid references public.alpha_events(id) on delete cascade,
  output jsonb not null default '{}'::jsonb,
  evidence jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.validation_results (
  id uuid primary key default gen_random_uuid(),
  advisor_id uuid not null references auth.users(id) on delete cascade,
  output_id uuid references public.forge_outputs(id) on delete cascade,
  result jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

-- Live schema alignment for pre-existing alpha tables.
-- Do not force NOT NULL here because legacy rows may exist without ownership.
-- RLS policies below only expose rows with advisor_id = auth.uid().
alter table public.prospects
  add column if not exists advisor_id uuid references auth.users(id) on delete cascade;

alter table public.alpha_events
  add column if not exists advisor_id uuid references auth.users(id) on delete cascade;

alter table public.forge_outputs
  add column if not exists advisor_id uuid references auth.users(id) on delete cascade;

alter table public.validation_results
  add column if not exists advisor_id uuid references auth.users(id) on delete cascade;

create index if not exists crm_data_user_collection_idx
  on public.crm_data (user_id, coleccion);

create index if not exists prospects_advisor_idx
  on public.prospects (advisor_id);

create index if not exists alpha_events_advisor_idx
  on public.alpha_events (advisor_id);

create index if not exists alpha_events_prospect_idx
  on public.alpha_events (prospect_id);

create index if not exists forge_outputs_advisor_idx
  on public.forge_outputs (advisor_id);

create index if not exists forge_outputs_event_idx
  on public.forge_outputs (event_id);

create index if not exists validation_results_advisor_idx
  on public.validation_results (advisor_id);

create index if not exists validation_results_output_idx
  on public.validation_results (output_id);

alter table public.crm_data enable row level security;
alter table public.prospects enable row level security;
alter table public.alpha_events enable row level security;
alter table public.forge_outputs enable row level security;
alter table public.validation_results enable row level security;

-- Remove legacy alpha policies found in live DB.
drop policy if exists "alpha prospects allow all" on public.prospects;
drop policy if exists "alpha events allow all" on public.alpha_events;
drop policy if exists "alpha outputs allow all" on public.forge_outputs;
drop policy if exists "alpha validations allow all" on public.validation_results;

-- Remove any prior repo-aligned policies before recreating them idempotently.
drop policy if exists "crm_data_select_own_rows" on public.crm_data;
drop policy if exists "crm_data_insert_own_rows" on public.crm_data;
drop policy if exists "crm_data_update_own_rows" on public.crm_data;
drop policy if exists "crm_data_delete_own_rows" on public.crm_data;

drop policy if exists "prospects_select_own_rows" on public.prospects;
drop policy if exists "prospects_insert_own_rows" on public.prospects;
drop policy if exists "prospects_update_own_rows" on public.prospects;
drop policy if exists "prospects_delete_own_rows" on public.prospects;

drop policy if exists "alpha_events_select_own_rows" on public.alpha_events;
drop policy if exists "alpha_events_insert_own_rows" on public.alpha_events;

drop policy if exists "forge_outputs_select_own_rows" on public.forge_outputs;
drop policy if exists "forge_outputs_insert_own_rows" on public.forge_outputs;

drop policy if exists "validation_results_select_own_rows" on public.validation_results;
drop policy if exists "validation_results_insert_own_rows" on public.validation_results;

-- Table privileges. RLS still owns row-level access.
revoke all on table public.crm_data from anon;
revoke all on table public.prospects from anon;
revoke all on table public.alpha_events from anon;
revoke all on table public.forge_outputs from anon;
revoke all on table public.validation_results from anon;

revoke all on table public.crm_data from authenticated;
revoke all on table public.prospects from authenticated;
revoke all on table public.alpha_events from authenticated;
revoke all on table public.forge_outputs from authenticated;
revoke all on table public.validation_results from authenticated;

grant select, insert, update, delete on table public.crm_data to authenticated;
grant select, insert, update, delete on table public.prospects to authenticated;
grant select, insert on table public.alpha_events to authenticated;
grant select, insert on table public.forge_outputs to authenticated;
grant select, insert on table public.validation_results to authenticated;

create policy "crm_data_select_own_rows"
  on public.crm_data
  for select
  to authenticated
  using (user_id = auth.uid());

create policy "crm_data_insert_own_rows"
  on public.crm_data
  for insert
  to authenticated
  with check (user_id = auth.uid());

create policy "crm_data_update_own_rows"
  on public.crm_data
  for update
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "crm_data_delete_own_rows"
  on public.crm_data
  for delete
  to authenticated
  using (user_id = auth.uid());

create policy "prospects_select_own_rows"
  on public.prospects
  for select
  to authenticated
  using (advisor_id = auth.uid());

create policy "prospects_insert_own_rows"
  on public.prospects
  for insert
  to authenticated
  with check (advisor_id = auth.uid());

create policy "prospects_update_own_rows"
  on public.prospects
  for update
  to authenticated
  using (advisor_id = auth.uid())
  with check (advisor_id = auth.uid());

create policy "prospects_delete_own_rows"
  on public.prospects
  for delete
  to authenticated
  using (advisor_id = auth.uid());

create policy "alpha_events_select_own_rows"
  on public.alpha_events
  for select
  to authenticated
  using (advisor_id = auth.uid());

create policy "alpha_events_insert_own_rows"
  on public.alpha_events
  for insert
  to authenticated
  with check (
    advisor_id = auth.uid()
    and (
      prospect_id is null
      or exists (
        select 1
        from public.prospects p
        where p.id = prospect_id
          and p.advisor_id = auth.uid()
      )
    )
  );

create policy "forge_outputs_select_own_rows"
  on public.forge_outputs
  for select
  to authenticated
  using (advisor_id = auth.uid());

create policy "forge_outputs_insert_own_rows"
  on public.forge_outputs
  for insert
  to authenticated
  with check (
    advisor_id = auth.uid()
    and (
      event_id is null
      or exists (
        select 1
        from public.alpha_events e
        where e.id = event_id
          and e.advisor_id = auth.uid()
      )
    )
  );

create policy "validation_results_select_own_rows"
  on public.validation_results
  for select
  to authenticated
  using (advisor_id = auth.uid());

create policy "validation_results_insert_own_rows"
  on public.validation_results
  for insert
  to authenticated
  with check (
    advisor_id = auth.uid()
    and (
      output_id is null
      or exists (
        select 1
        from public.forge_outputs o
        where o.id = output_id
          and o.advisor_id = auth.uid()
      )
    )
  );

commit;
