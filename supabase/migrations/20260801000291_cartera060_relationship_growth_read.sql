-- CARTERA 060A–060D owner-scoped relationship growth review read model.
-- Growth candidates are explainable possibilities requiring advisor review.
-- This function never creates Pipeline opportunities, requests referrals,
-- contacts people, generates final messages or uses life context as a trigger.

begin;

create or replace function public.forge_cartera060_list_relationship_growth_reviews(
  p_payload jsonb default '{}'::jsonb
)
returns jsonb
language plpgsql
security definer
stable
set search_path = public, auth, pg_temp
as $$
declare
  advisor uuid := auth.uid();
  person_reference_value text;
  as_of_date_value date;
  limit_value integer;
  items_value jsonb;
begin
  if advisor is null then
    raise exception 'CARTERA060_AUTHENTICATION_REQUIRED';
  end if;
  if p_payload is null or jsonb_typeof(p_payload) <> 'object' then
    raise exception 'CARTERA060_PAYLOAD_INVALID';
  end if;

  person_reference_value := nullif(btrim(p_payload ->> 'personReference'), '');
  as_of_date_value := coalesce(nullif(p_payload ->> 'asOfDate', '')::date, current_date);
  limit_value := coalesce(nullif(p_payload ->> 'limit', '')::integer, 80);

  if person_reference_value is not null
     and person_reference_value !~ '^[A-Za-z0-9][A-Za-z0-9._:@/-]{0,239}$' then
    raise exception 'CARTERA060_PERSON_REFERENCE_INVALID';
  end if;
  if limit_value < 1 or limit_value > 100 then
    raise exception 'CARTERA060_LIMIT_INVALID';
  end if;

  with people as (
    select p.id, p.person_reference, p.display_name, p.preferred_name
    from public.commercial_people p
    where p.advisor_id = advisor
      and p.lifecycle_state <> 'ARCHIVED'
      and p.archived_at is null
      and (person_reference_value is null or p.person_reference = person_reference_value)
  ),
  policy_stats as (
    select
      r.participant_person_id as person_id,
      count(distinct p.id) filter (
        where coalesce(p.status_value, 'UNKNOWN') not in ('CANCELLED', 'TERMINATED', 'LAPSED')
      )::integer as active_policy_count,
      min(p.issue_date) as earliest_issue_date,
      min(p.policy_reference) as evidence_policy_reference
    from public.policy_roles r
    join public.canonical_policies p
      on p.id = r.policy_id
     and p.advisor_id = r.advisor_id
    where r.advisor_id = advisor
      and r.confirmation_state = 'CONFIRMED'
      and r.effective_to is null
      and r.archived_at is null
      and r.role_type <> 'BENEFICIARY'
      and p.archived_at is null
    group by r.participant_person_id
  ),
  latest_need as (
    select distinct on (m.person_id)
      m.person_id, m.memory_reference, m.memory_kind, m.occurred_at
    from public.cartera040_relationship_memory_entries m
    where m.advisor_id = advisor
      and m.record_state <> 'WITHDRAWN'
      and m.memory_kind in ('NEED', 'UNRESOLVED_COMMITMENT')
      and not exists (
        select 1 from public.cartera040_relationship_memory_entries newer
        where newer.advisor_id = advisor
          and newer.supersedes_memory_id = m.id
          and newer.record_state <> 'WITHDRAWN'
      )
    order by m.person_id, m.occurred_at desc, m.created_at desc
  ),
  latest_review as (
    select m.person_id, max(m.occurred_at)::date as reviewed_on
    from public.cartera040_relationship_memory_entries m
    where m.advisor_id = advisor
      and m.record_state <> 'WITHDRAWN'
      and m.memory_kind = 'ANNUAL_REVIEW'
    group by m.person_id
  ),
  referral_willingness as (
    select
      m.person_id,
      count(*)::integer as willingness_count,
      min(m.memory_reference) as evidence_memory_reference,
      max(m.occurred_at) as last_confirmed_at
    from public.cartera040_relationship_memory_entries m
    where m.advisor_id = advisor
      and m.record_state <> 'WITHDRAWN'
      and m.memory_kind = 'ORIGIN_REFERRAL'
      and m.value_code = 'WILLING_TO_INTRODUCE'
      and m.source_authority = 'CLIENT_CONFIRMED'
      and m.consent_state = 'CONFIRMED'
      and not exists (
        select 1 from public.cartera040_relationship_memory_entries newer
        where newer.advisor_id = advisor
          and newer.supersedes_memory_id = m.id
          and newer.record_state <> 'WITHDRAWN'
      )
    group by m.person_id
  ),
  recent_relationship as (
    select m.person_id, max(m.occurred_at) as last_relationship_at
    from public.cartera040_relationship_memory_entries m
    where m.advisor_id = advisor
      and m.record_state <> 'WITHDRAWN'
      and m.memory_kind in ('SERVICE_INTERACTION', 'ANNUAL_REVIEW', 'APPOINTMENT_CONTEXT')
      and m.occurred_at::date >= as_of_date_value - 180
    group by m.person_id
  ),
  candidates as (
    select
      person.person_reference,
      coalesce(person.preferred_name, person.display_name) as display_name,
      'SECOND_POLICY_REVIEW'::text as growth_class,
      jsonb_build_array(
        public.forge_cartera060_evidence_item(
          ps.evidence_policy_reference, 'POLICY_INTELLIGENCE', 'CONFIRMED_POLICY_FACT'
        ),
        public.forge_cartera060_evidence_item(
          need.memory_reference, 'RELATIONSHIP_MEMORY', 'CONFIRMED_MEMORY'
        )
      ) as evidence,
      'Tiene una relación de protección activa y una necesidad o compromiso confirmado aún visible.'::text as why_person,
      'Existe una necesidad confirmada que todavía no está representada por una segunda póliza activa.'::text as why_now,
      'La evidencia no prueba interés actual, capacidad económica ni aceptación de una nueva solución.'::text as uncertainty,
      'Preparar una revisión de necesidades y preguntar si desea actualizar su protección.'::text as minimum_action,
      'Confirmar interés actual, vigencia de la necesidad y consentimiento para abrir una oportunidad.'::text as must_confirm,
      false as willingness_confirmed
    from people person
    join policy_stats ps on ps.person_id = person.id
    join latest_need need on need.person_id = person.id
    where ps.active_policy_count = 1

    union all

    select
      person.person_reference,
      coalesce(person.preferred_name, person.display_name),
      'PROTECTION_REVIEW',
      jsonb_build_array(
        public.forge_cartera060_evidence_item(
          ps.evidence_policy_reference, 'POLICY_INTELLIGENCE', 'CONFIRMED_POLICY_FACT'
        )
      ),
      'Tiene protección vigente y no existe una revisión anual reciente confirmada.',
      'La póliza lleva al menos un año activa y la última revisión confirmada está ausente o desactualizada.',
      'No se infiere una brecha, insuficiencia, necesidad nueva ni riesgo de conservación.',
      'Proponer una revisión de servicio para validar que la protección sigue alineada.',
      'Confirmar fecha apropiada, alcance de servicio y cualquier cambio expresado por el cliente.',
      false
    from people person
    join policy_stats ps on ps.person_id = person.id
    left join latest_review review on review.person_id = person.id
    where ps.active_policy_count > 0
      and ps.earliest_issue_date <= as_of_date_value - 365
      and (review.reviewed_on is null or review.reviewed_on <= as_of_date_value - 365)

    union all

    select
      person.person_reference,
      coalesce(person.preferred_name, person.display_name),
      'REFERRAL_RELATIONSHIP',
      jsonb_build_array(
        public.forge_cartera060_evidence_item(
          willingness.evidence_memory_reference, 'RELATIONSHIP_MEMORY', 'CLIENT_CONFIRMED_WILLINGNESS'
        )
      ),
      'La persona confirmó explícitamente disposición para conectar al asesor con alguien más.',
      'Existe una confirmación vigente de voluntad, pero todavía requiere contexto humano apropiado.',
      'La voluntad confirmada no identifica a una persona referida ni autoriza contacto o solicitud automática.',
      'Revisar el contexto de la relación antes de decidir si corresponde conversar sobre una introducción.',
      'Confirmar que la disposición sigue vigente y obtener consentimiento específico antes de cualquier acción.',
      true
    from people person
    join referral_willingness willingness on willingness.person_id = person.id
    where willingness.willingness_count >= 1

    union all

    select
      person.person_reference,
      coalesce(person.preferred_name, person.display_name),
      'CENTER_OF_INFLUENCE',
      jsonb_build_array(
        public.forge_cartera060_evidence_item(
          willingness.evidence_memory_reference, 'RELATIONSHIP_MEMORY', 'CLIENT_CONFIRMED_WILLINGNESS'
        ),
        public.forge_cartera060_evidence_item(
          'RELATIONSHIP_ACTIVITY:' || person.person_reference,
          'RELATIONSHIP_MEMORY',
          'RECENT_CONFIRMED_RELATIONSHIP_ACTIVITY'
        )
      ),
      'La relación está activa y existen varias confirmaciones explícitas de disposición para introducir.',
      'La actividad reciente permite considerar una conversación de fortalecimiento relacional, no una petición automática.',
      'No se calcula influencia, valor de red, propensión, prioridad comercial ni obligación de referir.',
      'Preparar una conversación de relación y servicio sin pedir referidos automáticamente.',
      'Confirmar el propósito de la conversación y cualquier introducción específica con consentimiento.',
      true
    from people person
    join referral_willingness willingness on willingness.person_id = person.id
    join recent_relationship recent on recent.person_id = person.id
    where willingness.willingness_count >= 2
  ),
  projected as (
    select
      public.forge_cartera060_candidate_reference(
        c.person_reference, c.growth_class, c.evidence
      ) as candidate_reference,
      c.*
    from candidates c
  )
  select coalesce(
    jsonb_agg(
      jsonb_build_object(
        'candidateReference', candidate_reference,
        'growthClass', growth_class,
        'personReference', person_reference,
        'displayName', display_name,
        'whyThisPerson', why_person,
        'whyNow', why_now,
        'uncertainty', uncertainty,
        'smallestUsefulAction', minimum_action,
        'advisorMustConfirm', must_confirm,
        'evidence', evidence,
        'clientWillingnessConfirmed', willingness_confirmed,
        'candidateState', 'REVIEW_REQUIRED',
        'opportunityCreated', false,
        'contactExecuted', false,
        'referralRequested', false,
        'lifeContextUsed', false,
        'finalNbaPriority', false
      )
      order by growth_class, display_name, candidate_reference
    ),
    '[]'::jsonb
  )
  into items_value
  from (select * from projected limit limit_value) bounded;

  return jsonb_build_object(
    'scope', case when person_reference_value is null then 'PORTFOLIO' else 'PERSON' end,
    'personReference', person_reference_value,
    'asOfDate', as_of_date_value,
    'items', items_value,
    'boundaries', jsonb_build_object(
      'automaticOpportunityCreation', false,
      'automaticContactExecution', false,
      'finalMessageGeneration', false,
      'lifeContextAsSalesTrigger', false,
      'referralRequestExecution', false,
      'finalNbaPriorityTruth', false,
      'advisorConfirmationRequired', true
    ),
    'projectionAuthority', 'CARTERA060_RELATIONSHIP_GROWTH_REVIEW_READ_MODEL',
    'readOnly', true
  );
end;
$$;

revoke all on function public.forge_cartera060_list_relationship_growth_reviews(jsonb)
  from public, anon;
grant execute on function public.forge_cartera060_list_relationship_growth_reviews(jsonb)
  to authenticated;

comment on function public.forge_cartera060_list_relationship_growth_reviews(jsonb) is
  'Owner-scoped explainable relationship-growth review. No opportunity, contact, referral request, message, life-event trigger or final NBA priority is created.';

commit;
