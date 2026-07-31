-- PIPELINE POINT 7 — PROSPECT CONTEXT JOURNAL
-- Repository implementation only. Deployment requires the normal Supabase migration gate.
-- Free text remains outside NFAST-08 minimized Timeline payloads; Timeline stores only an opaque JOURNAL reference.

begin;

create extension if not exists pgcrypto;

create table if not exists public.prospect_journal_entries (
  id uuid primary key default gen_random_uuid(),
  advisor_id uuid not null references auth.users(id) on delete restrict,
  prospect_id uuid not null,
  content text not null,
  capture_method text not null default 'text',
  source text not null default 'PIPELINE_CONTEXT',
  created_at timestamptz not null default now(),
  created_by uuid not null references auth.users(id) on delete restrict,
  constraint prospect_journal_entries_owner_fk
    foreign key (prospect_id, advisor_id)
    references public.prospects (id, advisor_id)
    on delete restrict,
  constraint prospect_journal_entries_actor_ck
    check (created_by = advisor_id),
  constraint prospect_journal_entries_content_ck
    check (char_length(btrim(content)) between 1 and 4000),
  constraint prospect_journal_entries_capture_method_ck
    check (capture_method in ('text', 'voice')),
  constraint prospect_journal_entries_source_ck
    check (source = 'PIPELINE_CONTEXT')
);

create index if not exists prospect_journal_entries_read_idx
  on public.prospect_journal_entries (advisor_id, prospect_id, created_at desc);

create or replace function public.forge_pipeline_prospect_journal_append_only_guard()
returns trigger
language plpgsql
security invoker
set search_path = public, pg_temp
as $$
begin
  raise exception 'PROSPECT_JOURNAL_APPEND_ONLY';
end;
$$;

drop trigger if exists forge_pipeline_prospect_journal_append_only_guard
  on public.prospect_journal_entries;
create trigger forge_pipeline_prospect_journal_append_only_guard
before update or delete on public.prospect_journal_entries
for each row execute function public.forge_pipeline_prospect_journal_append_only_guard();

create or replace function public.forge_pipeline_link_journal_to_timeline()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  journal_reference text;
begin
  if auth.uid() is null or new.advisor_id is distinct from auth.uid() then
    raise exception 'PROSPECT_JOURNAL_OWNER_MISMATCH';
  end if;

  journal_reference := 'JOURNAL:' || new.id::text;

  insert into public.prospect_timeline_events (
    prospect_id,
    advisor_id,
    event_type,
    event_source,
    source_record_reference,
    occurred_at,
    created_by,
    payload,
    evidence_references,
    idempotency_key
  ) values (
    new.prospect_id,
    new.advisor_id,
    'CONVERSATION_RECORDED',
    'ADVISOR_DECLARATION',
    journal_reference,
    new.created_at,
    new.created_by,
    jsonb_build_object(
      'channel', case when new.capture_method = 'voice' then 'VOICE_NOTE' else 'TEXT_NOTE' end,
      'outcome', 'CAPTURED',
      'nextStepType', 'JOURNAL_ENTRY'
    ),
    jsonb_build_array(journal_reference),
    journal_reference
  )
  on conflict (advisor_id, prospect_id, idempotency_key) do nothing;

  return new;
end;
$$;

drop trigger if exists forge_pipeline_link_journal_to_timeline
  on public.prospect_journal_entries;
create trigger forge_pipeline_link_journal_to_timeline
after insert on public.prospect_journal_entries
for each row execute function public.forge_pipeline_link_journal_to_timeline();

alter table public.prospect_journal_entries enable row level security;

revoke all on table public.prospect_journal_entries from anon;
revoke all on table public.prospect_journal_entries from authenticated;
grant select, insert on table public.prospect_journal_entries to authenticated;

drop policy if exists prospect_journal_entries_select_own on public.prospect_journal_entries;
create policy prospect_journal_entries_select_own
on public.prospect_journal_entries
for select to authenticated
using (advisor_id = auth.uid());

drop policy if exists prospect_journal_entries_insert_own on public.prospect_journal_entries;
create policy prospect_journal_entries_insert_own
on public.prospect_journal_entries
for insert to authenticated
with check (
  advisor_id = auth.uid()
  and created_by = auth.uid()
  and exists (
    select 1 from public.prospects p
    where p.id = prospect_journal_entries.prospect_id
      and p.advisor_id = auth.uid()
      and p.archived_at is null
  )
);

revoke all on function public.forge_pipeline_prospect_journal_append_only_guard() from public, anon, authenticated;
revoke all on function public.forge_pipeline_link_journal_to_timeline() from public, anon, authenticated;

commit;
