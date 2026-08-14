-- POST-017E HOTFIX 001
-- Repair the existing CARTERA-010B governed correction authority.
-- No new table, schema, ledger, truth owner, auth model or RLS model is introduced.
-- A bounded PolicyRole that is still effective must be shorten-able when a reviewed
-- correction supersedes it; the previous guard only admitted open-ended roles.

begin;

create or replace function public.forge_cartera010b_policy_role_supersession_guard()
returns trigger
language plpgsql
security invoker
set search_path = public, pg_temp
as $$
begin
  if tg_op = 'DELETE' then
    raise exception 'CARTERA010B_APPEND_ONLY';
  end if;

  if current_setting('forge.cartera010b_governed_command', true) <> 'on' then
    raise exception 'CARTERA010B_APPEND_ONLY';
  end if;

  if new.id is distinct from old.id
     or new.advisor_id is distinct from old.advisor_id
     or new.policy_role_reference is distinct from old.policy_role_reference
     or new.policy_id is distinct from old.policy_id
     or new.policy_version_id is distinct from old.policy_version_id
     or new.participant_person_id is distinct from old.participant_person_id
     or new.participant_account_id is distinct from old.participant_account_id
     or new.role_type is distinct from old.role_type
     or new.confirmation_state is distinct from old.confirmation_state
     or new.privacy_classification is distinct from old.privacy_classification
     or new.visibility_scope is distinct from old.visibility_scope
     or new.evidence_references is distinct from old.evidence_references
     or new.effective_from is distinct from old.effective_from
     or new.role_version is distinct from old.role_version
     or new.correction_of is distinct from old.correction_of
     or new.created_at is distinct from old.created_at
     or new.created_by is distinct from old.created_by
     or new.archived_at is distinct from old.archived_at
     or new.archived_by is distinct from old.archived_by
     or new.archive_reason is distinct from old.archive_reason then
    raise exception 'CARTERA010B_POLICY_ROLE_SUPERSESSION_FIELDS_INVALID';
  end if;

  -- A governed correction may only shorten the previous interval. It may never
  -- erase history, extend the interval, reopen a closed role or move its start.
  if new.effective_to is null
     or new.effective_to <= old.effective_from
     or (old.effective_to is not null and new.effective_to >= old.effective_to) then
    raise exception 'CARTERA010B_POLICY_ROLE_SUPERSESSION_RANGE_INVALID';
  end if;

  return new;
end;
$$;

-- Patch only the two bounded-role predicates inside the existing governed writer.
-- Fail closed if the deployed definition is not the authority version expected by
-- this hotfix; this prevents silently manufacturing a different correction path.
do $repair$
declare
  original_definition text;
  patched_definition text;
  old_correction_predicate text := E'        and r.policy_role_reference = correction_reference\n        and r.effective_to is null\n      order by r.role_version desc limit 1 for update;';
  new_correction_predicate text := E'        and r.policy_role_reference = correction_reference\n        and r.effective_from < role_effective_from\n        and (r.effective_to is null or r.effective_to > role_effective_from)\n      order by r.role_version desc limit 1 for update;';
  old_overlap_predicate text := E'        and r.policy_role_reference = role_reference\n        and r.effective_to is null\n    ) then';
  new_overlap_predicate text := E'        and r.policy_role_reference = role_reference\n        and r.effective_from < role_effective_from\n        and (r.effective_to is null or r.effective_to > role_effective_from)\n    ) then';
begin
  select pg_get_functiondef('public.forge_cartera010b_confirm_policy_with_parties(jsonb)'::regprocedure)
    into original_definition;

  if original_definition is null then
    raise exception 'POST017E_HOTFIX001_GOVERNED_POLICY_AUTHORITY_MISSING';
  end if;

  patched_definition := replace(
    original_definition,
    old_correction_predicate,
    new_correction_predicate
  );
  if patched_definition = original_definition then
    raise exception 'POST017E_HOTFIX001_CORRECTION_PREDICATE_DRIFT';
  end if;

  original_definition := patched_definition;
  patched_definition := replace(
    original_definition,
    old_overlap_predicate,
    new_overlap_predicate
  );
  if patched_definition = original_definition then
    raise exception 'POST017E_HOTFIX001_OVERLAP_PREDICATE_DRIFT';
  end if;

  execute patched_definition;
end;
$repair$;

commit;
