-- CARTERA 020B packet handoff replay hardening.
-- Additive pre-deployment correction discovered while preparing remote acceptance.
-- An existing pending packet may be referenced again only when its complete
-- non-truth payload is identical. Changed packet input fails closed.

begin;

create or replace function public.forge_cartera020b_guard_packet_insert_replay()
returns trigger
language plpgsql
security invoker
set search_path = public, pg_temp
as $$
declare
  existing public.cartera020b_policy_evidence_packets%rowtype;
begin
  select * into existing
  from public.cartera020b_policy_evidence_packets p
  where p.advisor_id = new.advisor_id
    and p.candidate_id = new.candidate_id
  limit 1;

  if existing.id is null then
    return new;
  end if;

  if existing.packet_reference is distinct from new.packet_reference
     or existing.inbox_item_id is distinct from new.inbox_item_id
     or existing.document_type is distinct from new.document_type
     or existing.extracted_fields is distinct from new.extracted_fields
     or existing.extraction_confidence is distinct from new.extraction_confidence
     or existing.warnings is distinct from new.warnings
     or existing.identity_candidates is distinct from new.identity_candidates
     or existing.policy_role_candidates is distinct from new.policy_role_candidates
     or existing.existing_policy_candidates is distinct from new.existing_policy_candidates
     or existing.confirmation_state is distinct from 'PENDING_CONFIRMATION'
     or new.confirmation_state is distinct from 'PENDING_CONFIRMATION'
     or existing.creates_truth is distinct from false
     or new.creates_truth is distinct from false then
    raise exception 'CARTERA020B_PACKET_CHANGED_REPLAY';
  end if;

  -- The packet already exists with identical pending-confirmation content.
  -- Returning NULL skips only the duplicate INSERT; the governed command may
  -- continue the Inbox state transition without creating another packet row.
  return null;
end;
$$;

drop trigger if exists forge_cartera020b_packet_insert_replay_guard
  on public.cartera020b_policy_evidence_packets;
create trigger forge_cartera020b_packet_insert_replay_guard
before insert on public.cartera020b_policy_evidence_packets
for each row execute function public.forge_cartera020b_guard_packet_insert_replay();

revoke all on function public.forge_cartera020b_guard_packet_insert_replay()
  from public, anon, authenticated;

commit;
