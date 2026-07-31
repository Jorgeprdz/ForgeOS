-- CARTERA 020B additive JSON-null hardening.
-- PostgreSQL jsonb 'null' is not SQL NULL; normalize optional payloads before validation.

begin;

do $cartera020b_json_null_hardening$
declare
  function_definition text;
  patched_definition text;
  old_attempt constant text := '  attempt := result -> ''attempt'';';
  old_candidate constant text := '  candidate := result -> ''candidate'';';
  old_packet constant text := '  packet := result -> ''packet'';';
  new_attempt constant text := '  attempt := nullif(result -> ''attempt'', ''null''::jsonb);';
  new_candidate constant text := '  candidate := nullif(result -> ''candidate'', ''null''::jsonb);';
  new_packet constant text := '  packet := nullif(result -> ''packet'', ''null''::jsonb);';
begin
  select pg_get_functiondef(
    'public.forge_cartera020b_record_processing_result(jsonb)'::regprocedure
  ) into function_definition;

  if function_definition is null then
    raise exception 'CARTERA020B_PROCESSING_RESULT_FUNCTION_MISSING';
  end if;

  if position(old_attempt in function_definition) = 0
     or position(old_candidate in function_definition) = 0
     or position(old_packet in function_definition) = 0 then
    raise exception 'CARTERA020B_JSON_NULL_PATCH_SOURCE_NOT_FOUND';
  end if;

  patched_definition := replace(function_definition, old_attempt, new_attempt);
  patched_definition := replace(patched_definition, old_candidate, new_candidate);
  patched_definition := replace(patched_definition, old_packet, new_packet);

  if patched_definition = function_definition then
    raise exception 'CARTERA020B_JSON_NULL_PATCH_NO_CHANGE';
  end if;

  execute patched_definition;
end;
$cartera020b_json_null_hardening$;

do $cartera020b_json_null_verify$
declare
  function_definition text;
begin
  select pg_get_functiondef(
    'public.forge_cartera020b_record_processing_result(jsonb)'::regprocedure
  ) into function_definition;

  if position('attempt := nullif(result -> ''attempt'', ''null''::jsonb);' in function_definition) = 0
     or position('candidate := nullif(result -> ''candidate'', ''null''::jsonb);' in function_definition) = 0
     or position('packet := nullif(result -> ''packet'', ''null''::jsonb);' in function_definition) = 0 then
    raise exception 'CARTERA020B_JSON_NULL_HARDENING_NOT_ACTIVE';
  end if;
end;
$cartera020b_json_null_verify$;

revoke all on function public.forge_cartera020b_record_processing_result(jsonb)
  from public, anon, authenticated;
grant execute on function public.forge_cartera020b_record_processing_result(jsonb)
  to authenticated;

commit;
