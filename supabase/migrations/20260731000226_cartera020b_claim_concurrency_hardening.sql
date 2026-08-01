-- CARTERA 020B claim concurrency hardening.
-- Repository construction only. This migration is NOT remote deployment authorization.

begin;

create or replace function public.forge_cartera020b_claim_evidence(
  p_worker_id text,
  p_lease_seconds integer default 300
)
returns jsonb
language plpgsql
security definer
set search_path = public, extensions, pg_temp
as $$
#variable_conflict use_variable
declare
  actor_id uuid := auth.uid();
  item public.cartera020b_evidence_inbox_items%rowtype;
  previous_worker_state text;
  claim_token uuid;
  claimed_at timestamptz := clock_timestamp();
  lease_expires_at timestamptz;
  transition_reference text;
  transition_digest text;
  transition_key text;
  reason_code text;
begin
  if actor_id is null then raise exception 'CARTERA020B_AUTH_REQUIRED'; end if;
  if p_worker_id is null or p_worker_id !~ '^[A-Za-z0-9][A-Za-z0-9._:@/-]{0,239}$' then
    raise exception 'CARTERA020B_WORKER_ID_INVALID';
  end if;
  if p_lease_seconds is null or p_lease_seconds < 30 or p_lease_seconds > 3600 then
    raise exception 'CARTERA020B_LEASE_SECONDS_OUT_OF_BOUNDS';
  end if;

  -- A worker may hold only one active claim. The advisory lock serializes
  -- concurrent claim calls for the same advisor/worker pair.
  perform pg_advisory_xact_lock(
    hashtextextended(actor_id::text || '|CLAIM_EVIDENCE|' || p_worker_id, 0)
  );

  select * into item
  from public.cartera020b_evidence_inbox_items i
  where i.advisor_id = actor_id
    and i.worker_state = 'CLAIMED'
    and i.lease_owner = p_worker_id
    and i.lease_expires_at > claimed_at
  order by i.updated_at
  limit 1
  for update skip locked;

  if item.id is not null then
    return jsonb_build_object(
      'status','CLAIMED','inboxItemId',item.id,'inboxReference',item.inbox_reference,
      'leaseToken',item.lease_token,'leaseExpiresAt',item.lease_expires_at,
      'workerState',item.worker_state,'stateVersion',item.state_version,
      'replayed',true,'createsPolicy',false
    );
  end if;

  select * into item
  from public.cartera020b_evidence_inbox_items i
  where i.advisor_id = actor_id
    and i.status not in ('confirmation_required','confirmed','rejected','blocked','archived')
    and (
      i.worker_state = 'AVAILABLE'
      or (i.worker_state = 'RETRY_WAIT' and i.next_retry_at <= claimed_at)
      or (i.worker_state = 'CLAIMED' and i.lease_expires_at <= claimed_at)
    )
  order by
    case when i.worker_state = 'RETRY_WAIT' then 0 when i.worker_state = 'CLAIMED' then 1 else 2 end,
    coalesce(i.next_retry_at, i.created_at), i.created_at
  limit 1
  for update skip locked;

  if item.id is null then
    return jsonb_build_object('status','NO_AVAILABLE_ITEM','replayed',false,'createsPolicy',false);
  end if;

  previous_worker_state := item.worker_state;
  reason_code := case when previous_worker_state = 'CLAIMED'
    then 'EXPIRED_LEASE_RECLAIMED' else 'CLAIM_ACQUIRED' end;
  claim_token := gen_random_uuid();
  lease_expires_at := claimed_at + make_interval(secs => p_lease_seconds);

  perform set_config('forge.cartera020b_command', 'on', true);
  update public.cartera020b_evidence_inbox_items i
  set worker_state = 'CLAIMED', lease_owner = p_worker_id,
      lease_token = claim_token, lease_expires_at = lease_expires_at,
      next_retry_at = null, state_version = i.state_version + 1,
      updated_at = claimed_at
  where i.id = item.id and i.advisor_id = actor_id
  returning * into item;

  transition_reference := 'transition/claim/' || claim_token::text;
  transition_key := 'claim/' || claim_token::text;
  transition_digest := encode(digest(
    jsonb_build_object(
      'advisorId',actor_id,'inboxReference',item.inbox_reference,
      'workerId',p_worker_id,'leaseToken',claim_token,
      'leaseSeconds',p_lease_seconds,'claimedAt',claimed_at
    )::text, 'sha256'
  ), 'hex');

  insert into public.cartera020b_evidence_transitions (
    advisor_id, transition_reference, inbox_item_id, from_status, to_status,
    from_worker_state, to_worker_state, reason_code, metadata,
    command_digest, idempotency_key, occurred_at, actor_id
  ) values (
    actor_id, transition_reference, item.id, item.status, item.status,
    previous_worker_state, 'CLAIMED', reason_code,
    jsonb_build_object('workerId',p_worker_id,'leaseExpiresAt',lease_expires_at),
    transition_digest, transition_key, claimed_at, actor_id
  );

  return jsonb_build_object(
    'status','CLAIMED','inboxItemId',item.id,'inboxReference',item.inbox_reference,
    'leaseToken',claim_token,'leaseExpiresAt',lease_expires_at,
    'workerState','CLAIMED','stateVersion',item.state_version,
    'replayed',false,'createsPolicy',false
  );
end;
$$;

revoke all on function public.forge_cartera020b_claim_evidence(text, integer) from public, anon, authenticated;
grant execute on function public.forge_cartera020b_claim_evidence(text, integer) to authenticated;

commit;