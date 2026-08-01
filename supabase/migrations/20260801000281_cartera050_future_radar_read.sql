-- CARTERA 050A-050D owner-scoped, sanitized Future Radar read model.
-- Cartera composes authoritative facts; it does not calculate conservation,
-- compensation, lapse, final NBA priority, opportunity or message truth.
-- Supported truth classes: CONFIRMED_FACT, SCHEDULED_EVENT, DETECTED_EVIDENCE, INFERENCE, RECOMMENDATION.

begin;

create or replace function public.forge_cartera050_list_future_radar(
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
  as_of_date_value date;
  timezone_value text;
  items jsonb;
  summary jsonb;
begin
  if advisor is null then
    raise exception 'CARTERA050_AUTHENTICATION_REQUIRED';
  end if;
  if p_payload is null or jsonb_typeof(p_payload) <> 'object' then
    raise exception 'CARTERA050_PAYLOAD_INVALID';
  end if;

  as_of_date_value := coalesce(nullif(p_payload ->> 'asOfDate', '')::date, current_date);
  timezone_value := coalesce(nullif(btrim(p_payload ->> 'timezone'), ''), 'America/Mexico_City');
  if length(timezone_value) > 120 then
    raise exception 'CARTERA050_TIMEZONE_INVALID';
  end if;

  with policy_person as (
    select distinct on (pr.policy_id)
      pr.policy_id,
      cp.person_reference,
      cp.display_name
    from public.policy_roles pr
    join public.commercial_people cp
      on cp.id = pr.participant_person_id
     and cp.advisor_id = pr.advisor_id
    where pr.advisor_id = advisor
      and pr.confirmation_state = 'CONFIRMED'
    order by
      pr.policy_id,
      case pr.role_type
        when 'POLICYHOLDER' then 0
        when 'OWNER' then 1
        when 'INSURED' then 2
        else 3
      end,
      cp.person_reference
  ),
  payment_signals as (
    select
      'CARTERA050:PAYMENT:' || o.obligation_reference as signal_reference,
      pp.person_reference,
      pp.display_name as person_display_name,
      o.policy_reference,
      case
        when o.status = 'CONFIRMATION_REQUIRED' or o.confirmation_state = 'EVIDENCE_PENDING'
          then 'UNCONFIRMED_PAYMENT_EVIDENCE'
        when o.expected_date < as_of_date_value then 'POSSIBLE_LATE_PAYMENT'
        else 'EXPECTED_PAYMENT'
      end as signal_type,
      o.expected_date as event_date,
      case
        when o.status = 'CONFIRMATION_REQUIRED' or o.confirmation_state = 'EVIDENCE_PENDING'
          then 'CONFIRMATION_REQUIRED'
        else public.forge_cartera050_horizon(o.expected_date, as_of_date_value)
      end as horizon,
      case
        when o.status = 'CONFIRMATION_REQUIRED' or o.confirmation_state = 'EVIDENCE_PENDING'
          then 'DETECTED_EVIDENCE'
        when o.expected_date < as_of_date_value then 'INFERENCE'
        else 'SCHEDULED_EVENT'
      end as truth_class,
      'PAYMENT_OBLIGATION' as source_authority,
      o.obligation_reference as source_record_reference,
      coalesce(pp.display_name, pp.person_reference, o.policy_reference) ||
        ' participa en la póliza asociada a esta obligación.' as why_this_person,
      case
        when o.status = 'CONFIRMATION_REQUIRED' or o.confirmation_state = 'EVIDENCE_PENDING'
          then 'Existe evidencia pendiente o una discrepancia que requiere revisión humana.'
        when o.expected_date < as_of_date_value
          then 'La fecha esperada ya pasó y no existe confirmación durable asociada.'
        else 'La obligación está dentro del horizonte operativo de 90 días.'
      end as why_now,
      jsonb_build_array(
        'Obligación esperada ' || o.obligation_reference,
        'Fecha esperada ' || o.expected_date::text,
        case
          when o.expected_amount is null then 'Monto desconocido'
          else 'Monto esperado ' || o.expected_amount::text || coalesce(' ' || o.currency, '')
        end
      ) as evidence_summary,
      case
        when o.expected_date < as_of_date_value
          then 'Una fecha vencida no prueba falta de pago, cancelación ni pérdida de cobertura.'
        when o.status = 'CONFIRMATION_REQUIRED' or o.confirmation_state = 'EVIDENCE_PENDING'
          then 'La evidencia detectada no equivale a PaymentEvent confirmado.'
        else 'La fecha deriva de términos confirmados, pero no confirma que el pago ocurrirá.'
      end as uncertainty,
      case
        when o.status = 'CONFIRMATION_REQUIRED' or o.confirmation_state = 'EVIDENCE_PENDING'
          then 'Revisar la evidencia y confirmar o rechazar el pago.'
        when o.expected_date < as_of_date_value
          then 'Verificar el estado con evidencia oficial antes de contactar.'
        else 'Revisar que la persona conozca la fecha y decidir si requiere seguimiento.'
      end as smallest_useful_action,
      true as advisor_confirmation_required
    from public.cartera030b_expected_payment_obligations o
    left join policy_person pp on pp.policy_id = o.policy_id
    where o.advisor_id = advisor
      and o.expected_date is not null
      and o.status not in ('CONFIRMED', 'CORRECTED', 'CANCELLED')
      and (
        o.expected_date <= as_of_date_value + 90
        or o.status = 'CONFIRMATION_REQUIRED'
        or o.confirmation_state = 'EVIDENCE_PENDING'
      )
  ),
  policy_end_signals as (
    select
      'CARTERA050:POLICY_END:' || p.policy_reference as signal_reference,
      pp.person_reference,
      pp.display_name as person_display_name,
      p.policy_reference,
      'POLICY_END_OR_RENEWAL_REVIEW' as signal_type,
      p.effective_to::date as event_date,
      public.forge_cartera050_horizon(p.effective_to::date, as_of_date_value) as horizon,
      'SCHEDULED_EVENT' as truth_class,
      'POLICY_INTELLIGENCE' as source_authority,
      p.policy_reference as source_record_reference,
      coalesce(pp.display_name, pp.person_reference, p.policy_reference) ||
        ' participa en una póliza con fecha contractual próxima.' as why_this_person,
      'La fecha de fin o revisión contractual está dentro del horizonte operativo.' as why_now,
      jsonb_build_array(
        'Póliza ' || p.policy_reference,
        'Fecha efectiva hasta ' || p.effective_to::date::text,
        'Estado proyectado ' || coalesce(p.status_value, 'UNKNOWN')
      ) as evidence_summary,
      'La fecha de fin no confirma renovación, cancelación, lapse ni continuidad de cobertura.' as uncertainty,
      'Abrir la póliza, revisar sus reglas oficiales y preparar una revisión de servicio.' as smallest_useful_action,
      true as advisor_confirmation_required
    from public.canonical_policies p
    left join policy_person pp on pp.policy_id = p.id
    where p.advisor_id = advisor
      and p.effective_to is not null
      and p.effective_to::date between as_of_date_value - 90 and as_of_date_value + 90
      and coalesce(p.status_value, 'UNKNOWN') not in ('CANCELLED')
  ),
  anniversary_signals as (
    select
      'CARTERA050:POLICY_YEAR:' || p.policy_reference || ':' ||
        public.forge_cartera050_next_anniversary(p.effective_from::date, as_of_date_value)::text
        as signal_reference,
      pp.person_reference,
      pp.display_name as person_display_name,
      p.policy_reference,
      'POLICY_YEAR_TRANSITION' as signal_type,
      public.forge_cartera050_next_anniversary(p.effective_from::date, as_of_date_value) as event_date,
      public.forge_cartera050_horizon(
        public.forge_cartera050_next_anniversary(p.effective_from::date, as_of_date_value),
        as_of_date_value
      ) as horizon,
      'SCHEDULED_EVENT' as truth_class,
      'POLICY_INTELLIGENCE' as source_authority,
      p.policy_reference as source_record_reference,
      coalesce(pp.display_name, pp.person_reference, p.policy_reference) ||
        ' participa en una póliza que cambia de año contractual.' as why_this_person,
      'El próximo aniversario cae dentro de los siguientes 90 días.' as why_now,
      jsonb_build_array(
        'Póliza ' || p.policy_reference,
        'Fecha efectiva desde ' || p.effective_from::date::text,
        'Próximo aniversario ' || public.forge_cartera050_next_anniversary(
          p.effective_from::date,
          as_of_date_value
        )::text
      ) as evidence_summary,
      'El aniversario se deriva de la fecha efectiva; las reglas de renovación o servicio dependen de la póliza y compañía.' as uncertainty,
      'Revisar cambios de año, condiciones y necesidades de servicio con la póliza abierta.' as smallest_useful_action,
      true as advisor_confirmation_required
    from public.canonical_policies p
    left join policy_person pp on pp.policy_id = p.id
    where p.advisor_id = advisor
      and p.effective_from is not null
      and public.forge_cartera050_next_anniversary(p.effective_from::date, as_of_date_value)
        <= as_of_date_value + 90
      and coalesce(p.status_value, 'UNKNOWN') not in ('CANCELLED')
  ),
  document_signals as (
    select
      'CARTERA050:DOCUMENT:' || p.policy_reference as signal_reference,
      pp.person_reference,
      pp.display_name as person_display_name,
      p.policy_reference,
      'INCOMPLETE_POLICY_DATA' as signal_type,
      as_of_date_value as event_date,
      'TODAY' as horizon,
      'RECOMMENDATION' as truth_class,
      'DOCUMENT_INTAKE' as source_authority,
      p.policy_reference as source_record_reference,
      coalesce(pp.display_name, pp.person_reference, p.policy_reference) ||
        ' está vinculado a una póliza cuya información requiere revisión.' as why_this_person,
      'La póliza está incompleta, desactualizada o mantiene un conflicto visible.' as why_now,
      jsonb_build_array(
        'Completitud ' || coalesce(p.completeness_state, 'UNKNOWN'),
        'Frescura ' || coalesce(p.freshness_state, 'UNKNOWN'),
        'Conflicto ' || coalesce(p.conflict_state, 'UNKNOWN')
      ) as evidence_summary,
      'La condición de datos no prueba un problema contractual ni de cobertura.' as uncertainty,
      'Abrir el documento fuente y confirmar únicamente los campos respaldados por evidencia.' as smallest_useful_action,
      true as advisor_confirmation_required
    from public.canonical_policies p
    left join policy_person pp on pp.policy_id = p.id
    where p.advisor_id = advisor
      and (
        coalesce(p.completeness_state, 'UNKNOWN') <> 'COMPLETE'
        or coalesce(p.freshness_state, 'UNKNOWN') <> 'CURRENT'
        or coalesce(p.conflict_state, 'UNKNOWN') <> 'CLEAR'
      )
  ),
  active_relationships as (
    select distinct
      cp.id as person_id,
      cp.person_reference,
      cp.display_name
    from public.policy_roles pr
    join public.canonical_policies p
      on p.id = pr.policy_id
     and p.advisor_id = pr.advisor_id
    join public.commercial_people cp
      on cp.id = pr.participant_person_id
     and cp.advisor_id = pr.advisor_id
    where pr.advisor_id = advisor
      and pr.confirmation_state = 'CONFIRMED'
      and coalesce(p.status_value, 'UNKNOWN') not in ('CANCELLED')
  ),
  review_signals as (
    select
      'CARTERA050:REVIEW:' || relationship.person_reference as signal_reference,
      relationship.person_reference,
      relationship.display_name as person_display_name,
      null::text as policy_reference,
      'RELATIONSHIP_REVIEW_DUE' as signal_type,
      as_of_date_value as event_date,
      'TODAY' as horizon,
      'RECOMMENDATION' as truth_class,
      'RELATIONSHIP_MEMORY' as source_authority,
      coalesce(last_review.memory_reference, relationship.person_reference) as source_record_reference,
      relationship.display_name || ' mantiene una relación activa con la cartera.' as why_this_person,
      case
        when last_review.occurred_at is null then 'No existe una revisión anual confirmada en la memoria relacional.'
        else 'La última revisión anual confirmada ocurrió hace más de 330 días.'
      end as why_now,
      jsonb_build_array(
        case
          when last_review.occurred_at is null then 'Sin ANNUAL_REVIEW confirmada'
          else 'Última revisión ' || last_review.occurred_at::date::text
        end,
        'Relación activa respaldada por rol de póliza confirmado'
      ) as evidence_summary,
      'La ausencia de una revisión registrada puede reflejar datos incompletos; no prueba desatención.' as uncertainty,
      'Revisar el brief relacional y decidir si conviene programar una revisión de servicio.' as smallest_useful_action,
      true as advisor_confirmation_required
    from active_relationships relationship
    left join lateral (
      select m.memory_reference, m.occurred_at
      from public.cartera040_relationship_memory_entries m
      where m.advisor_id = advisor
        and m.person_id = relationship.person_id
        and m.memory_kind = 'ANNUAL_REVIEW'
        and m.record_state = 'ACTIVE'
      order by m.occurred_at desc, m.created_at desc
      limit 1
    ) last_review on true
    where last_review.occurred_at is null
       or last_review.occurred_at::date < as_of_date_value - 330
  ),
  service_signals as (
    select
      'CARTERA050:SERVICE:' || m.memory_reference as signal_reference,
      m.person_reference,
      cp.display_name as person_display_name,
      null::text as policy_reference,
      case m.memory_kind
        when 'UNRESOLVED_COMMITMENT' then 'UNRESOLVED_COMMITMENT'
        else 'POLICY_SERVICE_REQUIRED'
      end as signal_type,
      as_of_date_value as event_date,
      'TODAY' as horizon,
      'RECOMMENDATION' as truth_class,
      'RELATIONSHIP_MEMORY' as source_authority,
      m.memory_reference as source_record_reference,
      cp.display_name || ' tiene contexto de servicio confirmado y aún visible.' as why_this_person,
      'La memoria relacional contiene un compromiso o expectativa de servicio activa.' as why_now,
      jsonb_build_array(
        'Memoria ' || m.memory_reference,
        'Tipo ' || m.memory_kind,
        'Registrada ' || m.occurred_at::date::text
      ) as evidence_summary,
      'La memoria no confirma por sí sola que el compromiso siga pendiente; el asesor debe revisarlo.' as uncertainty,
      'Abrir el brief, verificar vigencia y resolver o corregir el compromiso.' as smallest_useful_action,
      true as advisor_confirmation_required
    from public.cartera040_relationship_memory_entries m
    join public.commercial_people cp
      on cp.id = m.person_id
     and cp.advisor_id = m.advisor_id
    where m.advisor_id = advisor
      and m.record_state = 'ACTIVE'
      and m.memory_kind in ('UNRESOLVED_COMMITMENT', 'SERVICE_EXPECTATION')
  ),
  all_signals as (
    select * from payment_signals
    union all select * from policy_end_signals
    union all select * from anniversary_signals
    union all select * from document_signals
    union all select * from review_signals
    union all select * from service_signals
  ),
  visible as (
    select * from all_signals where horizon <> 'LATER'
  )
  select coalesce(jsonb_agg(jsonb_build_object(
    'signalReference', signal_reference,
    'personReference', person_reference,
    'personDisplayName', person_display_name,
    'policyReference', policy_reference,
    'signalType', signal_type,
    'eventDate', event_date,
    'horizon', horizon,
    'truthClass', truth_class,
    'sourceAuthority', source_authority,
    'sourceRecordReference', source_record_reference,
    'whyThisPerson', why_this_person,
    'whyNow', why_now,
    'evidenceSummary', evidence_summary,
    'uncertainty', uncertainty,
    'smallestUsefulAction', smallest_useful_action,
    'advisorConfirmationRequired', advisor_confirmation_required,
    'readOnly', true
  ) order by
    case horizon
      when 'CONFIRMATION_REQUIRED' then 0
      when 'OVERDUE' then 1
      when 'TODAY' then 2
      when 'NEXT_7_DAYS' then 3
      when 'NEXT_30_DAYS' then 4
      when 'NEXT_90_DAYS' then 5
      else 6
    end,
    event_date,
    signal_reference
  ), '[]'::jsonb)
  into items
  from visible;

  with policy_person as (
    select distinct on (pr.policy_id)
      pr.policy_id,
      cp.person_reference,
      cp.display_name
    from public.policy_roles pr
    join public.commercial_people cp
      on cp.id = pr.participant_person_id
     and cp.advisor_id = pr.advisor_id
    where pr.advisor_id = advisor
      and pr.confirmation_state = 'CONFIRMED'
    order by pr.policy_id, cp.person_reference
  ),
  summary_source as (
    select case
      when o.status = 'CONFIRMATION_REQUIRED' or o.confirmation_state = 'EVIDENCE_PENDING'
        then 'CONFIRMATION_REQUIRED'
      else public.forge_cartera050_horizon(o.expected_date, as_of_date_value)
    end as horizon
    from public.cartera030b_expected_payment_obligations o
    where o.advisor_id = advisor
      and o.expected_date is not null
      and o.status not in ('CONFIRMED', 'CORRECTED', 'CANCELLED')
      and (o.expected_date <= as_of_date_value + 90
        or o.status = 'CONFIRMATION_REQUIRED'
        or o.confirmation_state = 'EVIDENCE_PENDING')
  )
  select jsonb_build_object(
    'paymentToday', count(*) filter (where horizon = 'TODAY'),
    'paymentNext7Days', count(*) filter (where horizon = 'NEXT_7_DAYS'),
    'paymentNext30Days', count(*) filter (where horizon = 'NEXT_30_DAYS'),
    'paymentNext90Days', count(*) filter (where horizon = 'NEXT_90_DAYS'),
    'paymentOverdue', count(*) filter (where horizon = 'OVERDUE'),
    'paymentConfirmationRequired', count(*) filter (where horizon = 'CONFIRMATION_REQUIRED')
  ) into summary
  from summary_source;

  return jsonb_build_object(
    'asOfDate', as_of_date_value,
    'timezone', timezone_value,
    'items', items,
    'nativeSummary', summary,
    'sourceAvailability', jsonb_build_object(
      'policyPayment', 'AVAILABLE',
      'relationshipMemory', 'AVAILABLE',
      'documentIntake', 'AVAILABLE',
      'conservationIntelligence', 'ADAPTER_REQUIRED',
      'compensationIntelligence', 'ADAPTER_REQUIRED'
    ),
    'readOnly', true,
    'boundaries', jsonb_build_object(
      'automaticContact', false,
      'automaticOpportunity', false,
      'finalMessageGeneration', false,
      'lapseInference', false,
      'compensationCalculation', false,
      'conservationFormulaOwnership', false,
      'finalPriorityTruth', false,
      'humanConfirmationRequired', true
    )
  );
end;
$$;

revoke all on function public.forge_cartera050_list_future_radar(jsonb) from public, anon;
grant execute on function public.forge_cartera050_list_future_radar(jsonb) to authenticated;

comment on function public.forge_cartera050_list_future_radar(jsonb) is
  'Owner-scoped sanitized Today/7/30/90 Future Radar. It composes Policy, Payment and Relationship facts and exposes adapter boundaries for Conservation and Compensation without owning their formulas.';

commit;
