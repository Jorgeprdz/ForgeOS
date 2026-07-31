-- CARTERA 020B advisor-private RLS and direct-write boundary.
begin;

alter table public.cartera020b_evidence_sources enable row level security;
alter table public.cartera020b_evidence_sources force row level security;
alter table public.cartera020b_evidence_inbox_items enable row level security;
alter table public.cartera020b_evidence_inbox_items force row level security;
alter table public.cartera020b_evidence_transitions enable row level security;
alter table public.cartera020b_evidence_transitions force row level security;
alter table public.cartera020b_extraction_attempts enable row level security;
alter table public.cartera020b_extraction_attempts force row level security;
alter table public.cartera020b_extraction_candidates enable row level security;
alter table public.cartera020b_extraction_candidates force row level security;
alter table public.cartera020b_policy_evidence_packets enable row level security;
alter table public.cartera020b_policy_evidence_packets force row level security;
alter table public.cartera020b_command_receipts enable row level security;
alter table public.cartera020b_command_receipts force row level security;
alter table public.cartera020b_command_conflicts enable row level security;
alter table public.cartera020b_command_conflicts force row level security;

create policy cartera020b_sources_select_own on public.cartera020b_evidence_sources for select to authenticated using (advisor_id = auth.uid());
create policy cartera020b_inbox_select_own on public.cartera020b_evidence_inbox_items for select to authenticated using (advisor_id = auth.uid());
create policy cartera020b_transitions_select_own on public.cartera020b_evidence_transitions for select to authenticated using (advisor_id = auth.uid());
create policy cartera020b_attempts_select_own on public.cartera020b_extraction_attempts for select to authenticated using (advisor_id = auth.uid());
create policy cartera020b_candidates_select_own on public.cartera020b_extraction_candidates for select to authenticated using (advisor_id = auth.uid());
create policy cartera020b_packets_select_own on public.cartera020b_policy_evidence_packets for select to authenticated using (advisor_id = auth.uid());
create policy cartera020b_receipts_select_own on public.cartera020b_command_receipts for select to authenticated using (advisor_id = auth.uid());
create policy cartera020b_conflicts_select_own on public.cartera020b_command_conflicts for select to authenticated using (advisor_id = auth.uid());

revoke all on public.cartera020b_evidence_sources from anon, authenticated;
revoke all on public.cartera020b_evidence_inbox_items from anon, authenticated;
revoke all on public.cartera020b_evidence_transitions from anon, authenticated;
revoke all on public.cartera020b_extraction_attempts from anon, authenticated;
revoke all on public.cartera020b_extraction_candidates from anon, authenticated;
revoke all on public.cartera020b_policy_evidence_packets from anon, authenticated;
revoke all on public.cartera020b_command_receipts from anon, authenticated;
revoke all on public.cartera020b_command_conflicts from anon, authenticated;

grant select on public.cartera020b_evidence_sources to authenticated;
grant select on public.cartera020b_evidence_inbox_items to authenticated;
grant select on public.cartera020b_evidence_transitions to authenticated;
grant select on public.cartera020b_extraction_attempts to authenticated;
grant select on public.cartera020b_extraction_candidates to authenticated;
grant select on public.cartera020b_policy_evidence_packets to authenticated;
grant select on public.cartera020b_command_receipts to authenticated;
grant select on public.cartera020b_command_conflicts to authenticated;

commit;
