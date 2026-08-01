-- CARTERA 060A/060B deterministic growth-review helpers.
-- These helpers classify evidence-backed review candidates only.
-- They do not create opportunities, contact people, request referrals,
-- generate final messages, calculate scores or use life context as a sales trigger.

begin;

create or replace function public.forge_cartera060_candidate_reference(
  p_person_reference text,
  p_growth_class text,
  p_evidence_references jsonb
)
returns text
language sql
immutable
strict
set search_path = public, extensions, pg_temp
as $$
  select 'CARTERA060_GROWTH:' || substr(
    public.forge_cartera030b_digest(
      jsonb_build_object(
        'personReference', p_person_reference,
        'growthClass', p_growth_class,
        'evidenceReferences', p_evidence_references
      )
    ),
    1,
    48
  )
$$;

create or replace function public.forge_cartera060_evidence_item(
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
    'reference', p_reference,
    'authority', p_authority,
    'truthClass', p_truth_class
  )
$$;

revoke all on function public.forge_cartera060_candidate_reference(text, text, jsonb)
  from public, anon, authenticated;
revoke all on function public.forge_cartera060_evidence_item(text, text, text)
  from public, anon, authenticated;

comment on function public.forge_cartera060_candidate_reference(text, text, jsonb) is
  'Deterministic identity for a read-only Cartera relationship-growth review candidate.';
comment on function public.forge_cartera060_evidence_item(text, text, text) is
  'Sanitized evidence descriptor for Cartera relationship-growth review.';

commit;
