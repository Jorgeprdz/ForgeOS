-- CARTERA 010B.3C IDENTITY RESOLUTION PRECEDENCE HARDENING
-- Additive remote correction after PostgreSQL execution exposed operator precedence
-- in the advisory-lock key expression. No table, RLS or product authority expands.

begin;

do $cartera010b_precedence$
declare
  definition text;
  broken_expression constant text :=
    'actor_id::text || ''|PERSON_REFERENCE|'' || new_person ->> ''personReference''';
  fixed_expression constant text :=
    'actor_id::text || ''|PERSON_REFERENCE|'' || (new_person ->> ''personReference'')';
begin
  select pg_get_functiondef(
    'public.forge_cartera010b_confirm_identity_resolution(jsonb)'::regprocedure
  ) into definition;

  if definition is null then
    raise exception 'CARTERA010B_IDENTITY_RPC_NOT_FOUND';
  end if;

  if position(fixed_expression in definition) > 0 then
    return;
  end if;

  if position(broken_expression in definition) = 0 then
    raise exception 'CARTERA010B_IDENTITY_PRECEDENCE_TARGET_NOT_FOUND';
  end if;

  definition := replace(definition, broken_expression, fixed_expression);
  execute definition;
end;
$cartera010b_precedence$;

comment on function public.forge_cartera010b_confirm_identity_resolution(jsonb) is
  'CARTERA 010B governed identity resolution. PostgreSQL advisory-lock reference extraction is explicitly parenthesized.';

commit;
