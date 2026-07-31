-- CARTERA 020B append-only guards and state transition authority.
begin;
create or replace function public.cartera020b_forbid_mutation()
returns trigger
language plpgsql
set search_path = public, pg_temp
as $$
begin
  raise exception 'CARTERA020B_APPEND_ONLY';
end;
$$;

create or replace function public.cartera020b_guard_inbox_mutation()
returns trigger
language plpgsql
set search_path = public, pg_temp
as $$
begin
  if current_setting('forge.cartera020b_command', true) is distinct from 'on' then
    raise exception 'CARTERA020B_GOVERNED_COMMAND_REQUIRED';
  end if;
  if tg_op = 'DELETE' then
    raise exception 'CARTERA020B_DELETE_FORBIDDEN';
  end if;
  if old.advisor_id is distinct from new.advisor_id
     or old.source_id is distinct from new.source_id
     or old.inbox_reference is distinct from new.inbox_reference then
    raise exception 'CARTERA020B_IDENTITY_IMMUTABLE';
  end if;
  return new;
end;
$$;

create or replace function public.cartera020b_transition_allowed(p_from text, p_to text)
returns boolean
language sql
immutable
set search_path = public, pg_temp
as $$
  select case
    when p_from = p_to then true
    when p_from = 'received' and p_to in ('classified', 'blocked', 'archived') then true
    when p_from = 'classified' and p_to in ('extraction_candidate_created', 'blocked', 'archived') then true
    when p_from = 'extraction_candidate_created' and p_to in ('packet_created', 'blocked', 'archived') then true
    when p_from = 'packet_created' and p_to in ('confirmation_required', 'blocked', 'archived') then true
    when p_from = 'confirmation_required' and p_to in ('blocked', 'archived') then true
    else false
  end;
$$;

drop trigger if exists cartera020b_sources_append_only on public.cartera020b_evidence_sources;
create trigger cartera020b_sources_append_only before update or delete on public.cartera020b_evidence_sources for each row execute function public.cartera020b_forbid_mutation();
drop trigger if exists cartera020b_inbox_governed_mutation on public.cartera020b_evidence_inbox_items;
create trigger cartera020b_inbox_governed_mutation before update or delete on public.cartera020b_evidence_inbox_items for each row execute function public.cartera020b_guard_inbox_mutation();
drop trigger if exists cartera020b_transitions_append_only on public.cartera020b_evidence_transitions;
create trigger cartera020b_transitions_append_only before update or delete on public.cartera020b_evidence_transitions for each row execute function public.cartera020b_forbid_mutation();
drop trigger if exists cartera020b_attempts_append_only on public.cartera020b_extraction_attempts;
create trigger cartera020b_attempts_append_only before update or delete on public.cartera020b_extraction_attempts for each row execute function public.cartera020b_forbid_mutation();
drop trigger if exists cartera020b_candidates_append_only on public.cartera020b_extraction_candidates;
create trigger cartera020b_candidates_append_only before update or delete on public.cartera020b_extraction_candidates for each row execute function public.cartera020b_forbid_mutation();
drop trigger if exists cartera020b_packets_append_only on public.cartera020b_policy_evidence_packets;
create trigger cartera020b_packets_append_only before update or delete on public.cartera020b_policy_evidence_packets for each row execute function public.cartera020b_forbid_mutation();
drop trigger if exists cartera020b_receipts_append_only on public.cartera020b_command_receipts;
create trigger cartera020b_receipts_append_only before update or delete on public.cartera020b_command_receipts for each row execute function public.cartera020b_forbid_mutation();
drop trigger if exists cartera020b_conflicts_append_only on public.cartera020b_command_conflicts;
create trigger cartera020b_conflicts_append_only before update or delete on public.cartera020b_command_conflicts for each row execute function public.cartera020b_forbid_mutation();

commit;
