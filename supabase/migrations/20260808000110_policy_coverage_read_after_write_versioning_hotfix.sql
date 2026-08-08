-- FORGE POLICY COVERAGE READ-AFTER-WRITE VERSIONING HOTFIX 001
-- Forward-only repair of the verification block inside the existing canonical
-- Policy Coverage writer. The deployed 20260808000100 migration remains immutable.
--
-- Scope invariant:
-- - no table/schema/permission changes
-- - no history deletion or rewrite
-- - no Policy/Product/Evidence ownership change
-- - same public writer signature and client contract
--
-- The current production function is deliberately used as the source definition,
-- but this migration refuses to run unless the exact known defective fragment is
-- present exactly once. pg_get_functiondef returns CREATE OR REPLACE FUNCTION;
-- only that verified fragment is replaced before the definition is executed.

begin;

do $hotfix$
declare
  function_definition text;
  old_fragment constant text := $old$
  select count(*)::integer into persisted_count
  from public.policy_coverage_versions cv
  join public.policy_coverages c
    on c.id = cv.policy_coverage_id and c.advisor_id = cv.advisor_id
  where cv.advisor_id = actor_id
    and cv.policy_id = persisted_policy.id
    and cv.policy_version_id = persisted_policy_version.id
    and c.policy_coverage_reference in (
      select value ->> 'policyCoverageReference'
      from jsonb_array_elements(coverage_items)
    );
$old$;
  new_fragment constant text := $new$
  select count(*)::integer into persisted_count
  from jsonb_array_elements(coverage_items) as command_item(value)
  where 1 = (
    select count(*)
    from public.policy_coverages c
    join public.policy_coverage_versions cv
      on cv.policy_coverage_id = c.id
     and cv.advisor_id = c.advisor_id
    where c.advisor_id = actor_id
      and c.policy_id = persisted_policy.id
      and c.policy_coverage_reference = command_item.value ->> 'policyCoverageReference'
      and cv.policy_id = persisted_policy.id
      and cv.policy_version_id = persisted_policy_version.id
      and cv.evidence_version_id = persisted_evidence.id
      and cv.version_number = (command_item.value ->> 'currentVersion')::integer
      and cv.facts_digest = public.forge_cartera010b_command_digest(command_item.value)
  );
$new$;
  occurrence_count integer;
begin
  function_definition := pg_get_functiondef(
    'public.forge_policy_intelligence_confirm_policy_coverages(jsonb)'::regprocedure
  );

  if function_definition is null then
    raise exception 'POLICY_COVERAGE_RAW_HOTFIX_BASE_FUNCTION_MISSING';
  end if;

  occurrence_count := (
    length(function_definition) - length(replace(function_definition, old_fragment, ''))
  ) / nullif(length(old_fragment), 0);

  if occurrence_count <> 1 then
    raise exception 'POLICY_COVERAGE_RAW_HOTFIX_BASE_MISMATCH';
  end if;

  function_definition := replace(function_definition, old_fragment, new_fragment);

  if position(old_fragment in function_definition) <> 0
     or position(new_fragment in function_definition) = 0 then
    raise exception 'POLICY_COVERAGE_RAW_HOTFIX_REWRITE_NOT_EXACT';
  end if;

  execute function_definition;
end;
$hotfix$;

commit;
