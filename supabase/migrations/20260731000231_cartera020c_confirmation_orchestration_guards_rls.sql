-- CARTERA 020C.3 append-only audit, governed lifecycle guards and owner-private RLS.
-- Repository implementation only. Direct table mutation remains forbidden.

begin;

create or replace function public.cartera020c_forbid_mutation()
returns trigger
language plpgsql
set search_path = public, pg_temp
as $$
begin
  raise exception 'CARTERA020C_APPEND_ONLY';
end;
$$;

create or replace function public.cartera020c_review_transition_allowed(p_from text, p_to text)
returns boolean
language sql
immutable
set search_path = public, pg_temp
as $$
  select case
    when p_from = p_to then true
    when p_from = 'IDENTITY_READY' and p_to in (
      'IDENTITY_EXECUTING', 'IDENTITY_CONFIRMED', 'RETRY_WAIT', 'BLOCKED', 'REJECTED'
    ) then true
    when p_from = 'IDENTITY_EXECUTING' and p_to in (
      'IDENTITY_READY', 'IDENTITY_CONFIRMED', 'RETRY_WAIT', 'BLOCKED'
    ) then true
    when p_from = 'IDENTITY_CONFIRMED' and p_to in (
      'POLICY_READY', 'BLOCKED', 'REJECTED'
    ) then true
    when p_from = 'POLICY_READY' and p_to in (
      'POLICY_EXECUTING', 'RETRY_WAIT', 'BLOCKED', 'REJECTED'
    ) then true
    when p_from = 'POLICY_EXECUTING' and p_to in (
      'CONFIRMED', 'RETRY_WAIT', 'BLOCKED'
    ) then true
    when p_from = 'RETRY_WAIT' and p_to in (
      'IDENTITY_READY', 'POLICY_READY', 'BLOCKED', 'REJECTED'
    ) then true
    else false
  end;
$$;

create or replace function public.cartera020c_command_transition_allowed(p_from text, p_to text)
returns boolean
language sql
immutable
set search_path = public, pg_temp
as $$
  select case
    when p_from = p_to then true
    when p_from = 'PENDING' and p_to = 'EXECUTING' then true
    when p_from = 'EXECUTING' and p_to in (
      'SUCCEEDED', 'CONFLICT', 'RETRY_WAIT', 'FAILED_TERMINAL'
    ) then true
    when p_from = 'RETRY_WAIT' and p_to in ('PENDING', 'EXECUTING', 'FAILED_TERMINAL') then true
    else false
  end;
$$;

create or replace function public.cartera020c_guard_review_mutation()
returns trigger
language plpgsql
set search_path = public, pg_temp
as $$
begin
  if current_setting('forge.cartera020c_command', true) is distinct from 'on' then
    raise exception 'CARTERA020C_GOVERNED_COMMAND_REQUIRED';
  end if;
  if tg_op = 'DELETE' then
    raise exception 'CARTERA020C_DELETE_FORBIDDEN';
  end if;
  if old.id is distinct from new.id
     or old.advisor_id is distinct from new.advisor_id
     or old.review_reference is distinct from new.review_reference
     or old.packet_id is distinct from new.packet_id
     or old.packet_reference is distinct from new.packet_reference
     or old.inbox_item_id is distinct from new.inbox_item_id
     or old.source_reference is distinct from new.source_reference
     or old.request_idempotency_key is distinct from new.request_idempotency_key
     or old.identity_batch_digest is distinct from new.identity_batch_digest
     or old.identity_account_decisions is distinct from new.identity_account_decisions
     or old.identity_command_count is distinct from new.identity_command_count
     or old.requested_at is distinct from new.requested_at
     or old.requested_by is distinct from new.requested_by
     or old.creates_truth is distinct from new.creates_truth
     or old.created_at is distinct from new.created_at then
    raise exception 'CARTERA020C_REVIEW_IDENTITY_IMMUTABLE';
  end if;
  if not public.cartera020c_review_transition_allowed(old.state, new.state) then
    raise exception 'CARTERA020C_REVIEW_TRANSITION_INVALID';
  end if;
  if old.policy_request_idempotency_key is not null and (
       old.policy_request_idempotency_key is distinct from new.policy_request_idempotency_key
       or old.policy_composition_digest is distinct from new.policy_composition_digest
       or old.policy_requested_at is distinct from new.policy_requested_at
       or old.policy_requested_by is distinct from new.policy_requested_by
     ) then
    raise exception 'CARTERA020C_POLICY_COMPOSITION_IMMUTABLE';
  end if;
  if old.policy_command_count = 1 and new.policy_command_count <> 1 then
    raise exception 'CARTERA020C_POLICY_COMMAND_COUNT_IMMUTABLE';
  end if;
  if old.confirmed_at is not null and old.confirmed_at is distinct from new.confirmed_at then
    raise exception 'CARTERA020C_CONFIRMED_RESULT_IMMUTABLE';
  end if;
  return new;
end;
$$;

create or replace function public.cartera020c_guard_command_mutation()
returns trigger
language plpgsql
set search_path = public, pg_temp
as $$
begin
  if current_setting('forge.cartera020c_command', true) is distinct from 'on' then
    raise exception 'CARTERA020C_GOVERNED_COMMAND_REQUIRED';
  end if;
  if tg_op = 'DELETE' then
    raise exception 'CARTERA020C_DELETE_FORBIDDEN';
  end if;
  if old.id is distinct from new.id
     or old.advisor_id is distinct from new.advisor_id
     or old.command_reference is distinct from new.command_reference
     or old.review_id is distinct from new.review_id
     or old.sequence_number is distinct from new.sequence_number
     or old.stage is distinct from new.stage
     or old.candidate_reference is distinct from new.candidate_reference
     or old.command_type is distinct from new.command_type
     or old.idempotency_key is distinct from new.idempotency_key
     or old.command_digest is distinct from new.command_digest
     or old.command_payload is distinct from new.command_payload
     or old.expected_result is distinct from new.expected_result
     or old.contains_restricted_data is distinct from new.contains_restricted_data
     or old.created_at is distinct from new.created_at then
    raise exception 'CARTERA020C_COMMAND_IDENTITY_IMMUTABLE';
  end if;
  if not public.cartera020c_command_transition_allowed(old.status, new.status) then
    raise exception 'CARTERA020C_COMMAND_TRANSITION_INVALID';
  end if;
  if old.receipt_payload is not null and old.receipt_payload is distinct from new.receipt_payload then
    raise exception 'CARTERA020C_COMMAND_RECEIPT_IMMUTABLE';
  end if;
  return new;
end;
$$;

drop trigger if exists cartera020c_reviews_governed_mutation
  on public.cartera020c_confirmation_reviews;
create trigger cartera020c_reviews_governed_mutation
before update or delete on public.cartera020c_confirmation_reviews
for each row execute function public.cartera020c_guard_review_mutation();

drop trigger if exists cartera020c_commands_governed_mutation
  on public.cartera020c_confirmation_commands;
create trigger cartera020c_commands_governed_mutation
before update or delete on public.cartera020c_confirmation_commands
for each row execute function public.cartera020c_guard_command_mutation();

drop trigger if exists cartera020c_attempts_append_only
  on public.cartera020c_confirmation_attempts;
create trigger cartera020c_attempts_append_only
before update or delete on public.cartera020c_confirmation_attempts
for each row execute function public.cartera020c_forbid_mutation();

drop trigger if exists cartera020c_transitions_append_only
  on public.cartera020c_confirmation_transitions;
create trigger cartera020c_transitions_append_only
before update or delete on public.cartera020c_confirmation_transitions
for each row execute function public.cartera020c_forbid_mutation();

drop trigger if exists cartera020c_conflicts_append_only
  on public.cartera020c_confirmation_conflicts;
create trigger cartera020c_conflicts_append_only
before update or delete on public.cartera020c_confirmation_conflicts
for each row execute function public.cartera020c_forbid_mutation();

-- 020C owns the advisor confirmation exit from the immutable 020B Evidence packet.
-- The packet remains append-only; only the governed inbox lifecycle may advance.
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
    when p_from = 'confirmation_required' and p_to in ('confirmed', 'rejected', 'blocked', 'archived') then true
    else false
  end;
$$;

alter table public.cartera020c_confirmation_reviews enable row level security;
alter table public.cartera020c_confirmation_reviews force row level security;
alter table public.cartera020c_confirmation_commands enable row level security;
alter table public.cartera020c_confirmation_commands force row level security;
alter table public.cartera020c_confirmation_attempts enable row level security;
alter table public.cartera020c_confirmation_attempts force row level security;
alter table public.cartera020c_confirmation_transitions enable row level security;
alter table public.cartera020c_confirmation_transitions force row level security;
alter table public.cartera020c_confirmation_conflicts enable row level security;
alter table public.cartera020c_confirmation_conflicts force row level security;

create policy cartera020c_reviews_select_own
  on public.cartera020c_confirmation_reviews
  for select to authenticated using (advisor_id = auth.uid());
create policy cartera020c_commands_select_own
  on public.cartera020c_confirmation_commands
  for select to authenticated using (advisor_id = auth.uid());
create policy cartera020c_attempts_select_own
  on public.cartera020c_confirmation_attempts
  for select to authenticated using (advisor_id = auth.uid());
create policy cartera020c_transitions_select_own
  on public.cartera020c_confirmation_transitions
  for select to authenticated using (advisor_id = auth.uid());
create policy cartera020c_conflicts_select_own
  on public.cartera020c_confirmation_conflicts
  for select to authenticated using (advisor_id = auth.uid());

revoke all on public.cartera020c_confirmation_reviews from public, anon, authenticated;
revoke all on public.cartera020c_confirmation_commands from public, anon, authenticated;
revoke all on public.cartera020c_confirmation_attempts from public, anon, authenticated;
revoke all on public.cartera020c_confirmation_transitions from public, anon, authenticated;
revoke all on public.cartera020c_confirmation_conflicts from public, anon, authenticated;

-- No direct SELECT grants are issued. Owner-scoped, sanitized RPCs are the only read surface;
-- this prevents PolicyRole and beneficiary payloads from becoming a general projection.

commit;
