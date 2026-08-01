-- CARTERA 070A–070D deterministic relational activation helpers.
-- Candy Crush remains a subordinate experience policy under ADR-016.
-- These helpers do not calculate NBA priority, points, rewards or execution truth.

begin;

create or replace function public.forge_cartera070_action_reference(
  p_source_signal_reference text,
  p_action_class text,
  p_person_reference text
)
returns text
language sql
immutable
strict
set search_path = public, extensions, pg_temp
as $$
  select 'RELATIONAL_ACTION:' || encode(
    extensions.digest(
      convert_to(
        btrim(p_source_signal_reference) || '|' ||
        upper(btrim(p_action_class)) || '|' ||
        btrim(p_person_reference),
        'UTF8'
      ),
      'sha256'
    ),
    'hex'
  );
$$;

create or replace function public.forge_cartera070_evidence_item(
  p_reference text,
  p_authority text,
  p_truth_class text
)
returns jsonb
language sql
immutable
strict
set search_path = public, pg_temp
as $$
  select jsonb_build_object(
    'reference', btrim(p_reference),
    'authority', upper(btrim(p_authority)),
    'truthClass', upper(btrim(p_truth_class))
  );
$$;

create or replace function public.forge_cartera070_action_minutes(
  p_action_class text
)
returns integer
language sql
immutable
strict
set search_path = public, pg_temp
as $$
  select case upper(btrim(p_action_class))
    when 'CONFIRM_PAYMENT' then 10
    when 'PREPARE_RENEWAL' then 25
    when 'SCHEDULE_REVIEW' then 10
    when 'RESOLVE_MISSING_CONTEXT' then 15
    when 'REQUEST_DOCUMENTATION' then 10
    when 'RECOVER_RELATIONSHIP' then 15
    when 'REVIEW_SECOND_POLICY' then 20
    when 'STRENGTHEN_CENTER_OF_INFLUENCE' then 20
    when 'THANK_REFERRER' then 10
    when 'COMPLETE_SERVICE_COMMITMENT' then 15
    else 15
  end;
$$;

revoke all on function public.forge_cartera070_action_reference(text,text,text) from public, anon;
revoke all on function public.forge_cartera070_evidence_item(text,text,text) from public, anon;
revoke all on function public.forge_cartera070_action_minutes(text) from public, anon;
grant execute on function public.forge_cartera070_action_reference(text,text,text) to authenticated;
grant execute on function public.forge_cartera070_evidence_item(text,text,text) to authenticated;
grant execute on function public.forge_cartera070_action_minutes(text) to authenticated;

comment on function public.forge_cartera070_action_reference(text,text,text) is
  'Deterministic display-card identity only; not task, execution, priority or engagement truth.';

commit;
