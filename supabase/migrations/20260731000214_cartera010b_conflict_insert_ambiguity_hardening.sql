-- CARTERA 010B.3D CONFLICT INSERT AMBIGUITY HARDENING
-- Additive correction after PostgreSQL execution exposed PL/pgSQL variable/column
-- ambiguity in ON CONFLICT targets. Durable conflict behavior remains unchanged.

begin;

do $cartera010b_conflict_ambiguity$
declare
  signature text;
  definition text;
  broken_expression constant text :=
    'on conflict (advisor_id, conflict_reference) do nothing';
  fixed_expression constant text :=
    'on conflict on constraint policy_conflicts_advisor_id_conflict_reference_key do nothing';
begin
  foreach signature in array array[
    'public.forge_cartera010b_existing_receipt_response(uuid,text,text,text,jsonb,jsonb)',
    'public.forge_cartera010b_record_command_conflict(uuid,text,text,text,text,uuid,jsonb,jsonb,text,timestamptz)'
  ]
  loop
    select pg_get_functiondef(signature::regprocedure) into definition;

    if definition is null then
      raise exception 'CARTERA010B_CONFLICT_HELPER_NOT_FOUND:%', signature;
    end if;

    if position(fixed_expression in definition) > 0 then
      continue;
    end if;

    if position(broken_expression in definition) = 0 then
      raise exception 'CARTERA010B_CONFLICT_AMBIGUITY_TARGET_NOT_FOUND:%', signature;
    end if;

    definition := replace(definition, broken_expression, fixed_expression);
    execute definition;
  end loop;
end;
$cartera010b_conflict_ambiguity$;

comment on function public.forge_cartera010b_existing_receipt_response(uuid,text,text,text,jsonb,jsonb) is
  'CARTERA 010B deterministic receipt replay. Conflict insertion targets the explicit unique constraint.';
comment on function public.forge_cartera010b_record_command_conflict(uuid,text,text,text,text,uuid,jsonb,jsonb,text,timestamptz) is
  'CARTERA 010B durable command conflict writer. Conflict insertion targets the explicit unique constraint.';

commit;
