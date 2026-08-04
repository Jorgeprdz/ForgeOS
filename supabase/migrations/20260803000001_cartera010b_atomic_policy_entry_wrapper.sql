-- BETA1_022 additive transaction boundary for manual and reviewed file entry.
-- Canonical truth remains owned by the accepted CARTERA 010B commands.

begin;

create or replace function public.forge_cartera010b_confirm_identity_and_policy(
  p_identity_command jsonb,
  p_policy_command jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = public, extensions, pg_temp
as $$
#variable_conflict use_variable
declare
  actor_id uuid := auth.uid();
  identity_receipt jsonb;
  policy_receipt jsonb;
  persisted_policy public.canonical_policies%rowtype;
  persisted_version public.policy_versions%rowtype;
  persisted_evidence public.policy_evidence_versions%rowtype;
  expected_role_count integer;
  persisted_role_count integer;
begin
  if actor_id is null then
    raise exception 'CARTERA010B_AUTH_REQUIRED';
  end if;
  if p_identity_command is null or jsonb_typeof(p_identity_command) <> 'object'
     or p_policy_command is null or jsonb_typeof(p_policy_command) <> 'object'
     or p_identity_command ->> 'advisorId' <> actor_id::text
     or p_identity_command ->> 'actorReference' <> actor_id::text
     or p_policy_command ->> 'advisorId' <> actor_id::text
     or p_policy_command ->> 'actorReference' <> actor_id::text then
    raise exception 'CARTERA010B_ATOMIC_ENTRY_SCOPE_INVALID';
  end if;

  perform pg_advisory_xact_lock(hashtextextended(
    actor_id::text || '|ATOMIC_POLICY_ENTRY|' || coalesce(p_policy_command ->> 'idempotencyKey', ''),
    0
  ));

  identity_receipt := public.forge_cartera010b_confirm_identity_resolution(p_identity_command);
  if identity_receipt ->> 'status' not in ('CONFIRMED', 'ALREADY_LINKED')
     or identity_receipt ->> 'personReference' is null then
    raise exception 'CARTERA010B_ATOMIC_IDENTITY_NOT_CONFIRMED';
  end if;

  if not exists (
    select 1
    from jsonb_array_elements(p_policy_command -> 'roles') role
    where role ->> 'participantPersonReference' = identity_receipt ->> 'personReference'
      and role ->> 'confirmationState' = 'CONFIRMED'
  ) then
    raise exception 'CARTERA010B_ATOMIC_POLICY_PERSON_MISMATCH';
  end if;

  policy_receipt := public.forge_cartera010b_confirm_policy_with_parties(p_policy_command);
  if policy_receipt ->> 'status' <> 'CONFIRMED' then
    raise exception 'CARTERA010B_ATOMIC_POLICY_NOT_CONFIRMED';
  end if;

  select p.* into persisted_policy
  from public.canonical_policies p
  where p.advisor_id = actor_id
    and p.policy_reference = policy_receipt ->> 'policyReference'
    and p.archived_at is null;
  if persisted_policy.id is null then
    raise exception 'CARTERA010B_ATOMIC_POLICY_READ_AFTER_WRITE_FAILED';
  end if;

  select v.* into persisted_version
  from public.policy_versions v
  where v.advisor_id = actor_id
    and v.policy_id = persisted_policy.id
    and v.policy_version_reference = policy_receipt ->> 'policyVersionReference';
  if persisted_version.id is null then
    raise exception 'CARTERA010B_ATOMIC_VERSION_READ_AFTER_WRITE_FAILED';
  end if;

  select e.* into persisted_evidence
  from public.policy_evidence_versions e
  where e.advisor_id = actor_id
    and e.policy_id = persisted_policy.id
    and e.evidence_version_reference = policy_receipt ->> 'evidenceVersionReference';
  if persisted_evidence.id is null then
    raise exception 'CARTERA010B_ATOMIC_EVIDENCE_READ_AFTER_WRITE_FAILED';
  end if;

  expected_role_count := jsonb_array_length(p_policy_command -> 'roles');
  select count(*)::integer into persisted_role_count
  from public.policy_roles r
  where r.advisor_id = actor_id
    and r.policy_id = persisted_policy.id
    and r.policy_version_id = persisted_version.id;
  if persisted_role_count <> expected_role_count then
    raise exception 'CARTERA010B_ATOMIC_ROLE_READ_AFTER_WRITE_FAILED';
  end if;

  return jsonb_build_object(
    'status', 'CONFIRMED',
    'transactionState', 'COMMITTED',
    'identityResult', identity_receipt,
    'policyResult', policy_receipt,
    'policyReference', policy_receipt ->> 'policyReference',
    'policyVersionReference', policy_receipt ->> 'policyVersionReference',
    'evidenceVersionReference', policy_receipt ->> 'evidenceVersionReference',
    'roleCount', persisted_role_count,
    'readAfterWriteVerified', true,
    'replayed', coalesce((identity_receipt ->> 'replayed')::boolean, false)
      and coalesce((policy_receipt ->> 'replayed')::boolean, false)
  );
end;
$$;

revoke all on function public.forge_cartera010b_confirm_identity_and_policy(jsonb, jsonb)
  from public, anon;
grant execute on function public.forge_cartera010b_confirm_identity_and_policy(jsonb, jsonb)
  to authenticated;

comment on function public.forge_cartera010b_confirm_identity_and_policy(jsonb, jsonb) is
  'Atomic owner-scoped wrapper around accepted CARTERA 010B identity and confirmed Policy commands with read-after-write verification.';

commit;
