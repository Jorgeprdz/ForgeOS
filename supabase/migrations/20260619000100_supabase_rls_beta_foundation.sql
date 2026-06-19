-- SUPABASE RLS BETA FOUNDATION 001
-- Source-controlled schema truth for individual advisor ownership.
-- Deployment is not currently repo-verifiable through GitHub Actions.

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

drop policy if exists "crm_data_select_own_rows" on public.crm_data;
create policy "crm_data_select_own_rows"
  on public.crm_data
  for select
  using (user_id = auth.uid());

drop policy if exists "crm_data_insert_own_rows" on public.crm_data;
create policy "crm_data_insert_own_rows"
  on public.crm_data
  for insert
  with check (user_id = auth.uid());

drop policy if exists "crm_data_update_own_rows" on public.crm_data;
create policy "crm_data_update_own_rows"
  on public.crm_data
  for update
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

drop policy if exists "crm_data_delete_own_rows" on public.crm_data;
create policy "crm_data_delete_own_rows"
  on public.crm_data
  for delete
  using (user_id = auth.uid());

drop policy if exists "prospects_select_own_rows" on public.prospects;
create policy "prospects_select_own_rows"
  on public.prospects
  for select
  using (advisor_id = auth.uid());

drop policy if exists "prospects_insert_own_rows" on public.prospects;
create policy "prospects_insert_own_rows"
  on public.prospects
  for insert
  with check (advisor_id = auth.uid());

drop policy if exists "prospects_update_own_rows" on public.prospects;
create policy "prospects_update_own_rows"
  on public.prospects
  for update
  using (advisor_id = auth.uid())
  with check (advisor_id = auth.uid());

drop policy if exists "prospects_delete_own_rows" on public.prospects;
create policy "prospects_delete_own_rows"
  on public.prospects
  for delete
  using (advisor_id = auth.uid());

drop policy if exists "alpha_events_select_own_rows" on public.alpha_events;
create policy "alpha_events_select_own_rows"
  on public.alpha_events
  for select
  using (advisor_id = auth.uid());

drop policy if exists "alpha_events_insert_own_rows" on public.alpha_events;
create policy "alpha_events_insert_own_rows"
  on public.alpha_events
  for insert
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

-- Alpha events are append-only for beta. Corrections must create new evidence.

drop policy if exists "forge_outputs_select_own_rows" on public.forge_outputs;
create policy "forge_outputs_select_own_rows"
  on public.forge_outputs
  for select
  using (advisor_id = auth.uid());

drop policy if exists "forge_outputs_insert_own_rows" on public.forge_outputs;
create policy "forge_outputs_insert_own_rows"
  on public.forge_outputs
  for insert
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

-- Forge outputs are append-only for beta. Recomputed outputs should be new rows.

drop policy if exists "validation_results_select_own_rows" on public.validation_results;
create policy "validation_results_select_own_rows"
  on public.validation_results
  for select
  using (advisor_id = auth.uid());

drop policy if exists "validation_results_insert_own_rows" on public.validation_results;
create policy "validation_results_insert_own_rows"
  on public.validation_results
  for insert
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

-- Validation results are append-only for beta to preserve human evidence history.
