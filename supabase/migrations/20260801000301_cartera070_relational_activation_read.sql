-- CARTERA 070A–070D owner-scoped relational activation read model.
-- It turns reviewed Cartera signals into a small capacity-fit deck.
-- Display order is not final NBA priority and no action is executed.

begin;

create or replace function public.forge_cartera070_list_relational_activation(
  p_payload jsonb default '{}'::jsonb
)
returns jsonb
language plpgsql
security definer
stable
set search_path = public, auth, extensions, pg_temp
as $$
declare
  advisor uuid := auth.uid();
  as_of_date_value date;
  available_minutes_value integer;
  max_cards_value integer;
  radar_value jsonb;
  growth_value jsonb;
  items_value jsonb;
  total_candidates_value integer;
  selected_minutes_value integer;
begin
  if advisor is null then
    raise exception 'CARTERA070_AUTHENTICATION_REQUIRED';
  end if;
  if p_payload is null or jsonb_typeof(p_payload) <> 'object' then
    raise exception 'CARTERA070_PAYLOAD_INVALID';
  end if;

  as_of_date_value := coalesce(nullif(p_payload ->> 'asOfDate', '')::date, current_date);
  available_minutes_value := coalesce(nullif(p_payload ->> 'availableMinutes', '')::integer, 60);
  max_cards_value := coalesce(nullif(p_payload ->> 'maxCards', '')::integer, 4);

  if available_minutes_value < 15 or available_minutes_value > 240 then
    raise exception 'CARTERA070_AVAILABLE_MINUTES_INVALID';
  end if;
  if max_cards_value < 1 or max_cards_value > 5 then
    raise exception 'CARTERA070_MAX_CARDS_INVALID';
  end if;

  radar_value := public.forge_cartera050_list_future_radar(jsonb_build_object(
    'asOfDate', as_of_date_value,
    'timezone', 'America/Mexico_City'
  ));
  growth_value := public.forge_cartera060_list_relationship_growth_reviews(jsonb_build_object(
    'asOfDate', as_of_date_value,
    'limit', 100
  ));

  with radar_source as (
    select value as item
    from jsonb_array_elements(coalesce(radar_value -> 'items', '[]'::jsonb))
    where nullif(value ->> 'personReference', '') is not null
  ),
  radar_candidates as (
    select
      case item ->> 'signalType'
        when 'UNCONFIRMED_PAYMENT_EVIDENCE' then 'CONFIRM_PAYMENT'
        when 'POSSIBLE_LATE_PAYMENT' then 'CONFIRM_PAYMENT'
        when 'EXPECTED_PAYMENT' then 'CONFIRM_PAYMENT'
        when 'POLICY_END_OR_RENEWAL_REVIEW' then 'PREPARE_RENEWAL'
        when 'POLICY_YEAR_TRANSITION' then 'PREPARE_RENEWAL'
        when 'RELATIONSHIP_REVIEW_DUE' then 'SCHEDULE_REVIEW'
        when 'INCOMPLETE_POLICY_DATA' then 'REQUEST_DOCUMENTATION'
        when 'UNRESOLVED_COMMITMENT' then 'COMPLETE_SERVICE_COMMITMENT'
        when 'POLICY_SERVICE_REQUIRED' then 'COMPLETE_SERVICE_COMMITMENT'
        else null
      end as action_class,
      item ->> 'signalReference' as source_signal_reference,
      item ->> 'personReference' as person_reference,
      coalesce(nullif(item ->> 'personDisplayName', ''), item ->> 'personReference') as display_name,
      nullif(item ->> 'policyReference', '') as policy_reference,
      item ->> 'sourceAuthority' as source_authority,
      item ->> 'truthClass' as truth_class,
      coalesce(nullif(item ->> 'horizon', ''), 'NO_DATE') as horizon,
      nullif(item ->> 'eventDate', '') as event_date,
      item ->> 'whyThisPerson' as why_this_person,
      item ->> 'whyNow' as why_now,
      item ->> 'uncertainty' as uncertainty,
      item ->> 'smallestUsefulAction' as smallest_useful_action,
      case item ->> 'signalType'
        when 'UNCONFIRMED_PAYMENT_EVIDENCE' then 'Confirmar póliza, monto, periodo y evidencia antes de registrar un pago.'
        when 'POSSIBLE_LATE_PAYMENT' then 'Confirmar con evidencia oficial si el pago ocurrió; la fecha vencida no prueba impago.'
        when 'EXPECTED_PAYMENT' then 'Confirmar si corresponde preparar seguimiento y cuál canal está autorizado.'
        when 'POLICY_END_OR_RENEWAL_REVIEW' then 'Confirmar reglas oficiales, fecha y alcance de la revisión antes de contactar.'
        when 'POLICY_YEAR_TRANSITION' then 'Confirmar condiciones aplicables y propósito de servicio.'
        when 'RELATIONSHIP_REVIEW_DUE' then 'Confirmar que la revisión sigue pendiente y acordar un momento apropiado.'
        when 'INCOMPLETE_POLICY_DATA' then 'Confirmar qué documento o campo falta y quién puede proporcionarlo.'
        else 'Confirmar que el compromiso sigue vigente y cuál es el cierre correcto.'
      end as advisor_must_confirm,
      public.forge_cartera070_evidence_item(
        item ->> 'sourceRecordReference',
        item ->> 'sourceAuthority',
        item ->> 'truthClass'
      ) as evidence_item
    from radar_source
  ),
  growth_source as (
    select value as item
    from jsonb_array_elements(coalesce(growth_value -> 'items', '[]'::jsonb))
  ),
  growth_candidates as (
    select
      case item ->> 'growthClass'
        when 'SECOND_POLICY_REVIEW' then 'REVIEW_SECOND_POLICY'
        when 'PROTECTION_REVIEW' then 'SCHEDULE_REVIEW'
        when 'REFERRAL_RELATIONSHIP' then 'THANK_REFERRER'
        when 'CENTER_OF_INFLUENCE' then 'STRENGTHEN_CENTER_OF_INFLUENCE'
        else null
      end as action_class,
      item ->> 'candidateReference' as source_signal_reference,
      item ->> 'personReference' as person_reference,
      item ->> 'displayName' as display_name,
      null::text as policy_reference,
      'RELATIONSHIP_GROWTH_INTELLIGENCE'::text as source_authority,
      'REVIEWED_CANDIDATE'::text as truth_class,
      'NO_DATE'::text as horizon,
      null::text as event_date,
      item ->> 'whyThisPerson' as why_this_person,
      item ->> 'whyNow' as why_now,
      item ->> 'uncertainty' as uncertainty,
      item ->> 'smallestUsefulAction' as smallest_useful_action,
      item ->> 'advisorMustConfirm' as advisor_must_confirm,
      public.forge_cartera070_evidence_item(
        item ->> 'candidateReference',
        'RELATIONSHIP_GROWTH_INTELLIGENCE',
        'REVIEW_REQUIRED'
      ) as evidence_item
    from growth_source
  ),
  active_people as (
    select distinct
      cp.id as person_id,
      cp.person_reference,
      coalesce(cp.preferred_name, cp.display_name) as display_name
    from public.policy_roles pr
    join public.canonical_policies p
      on p.id = pr.policy_id
     and p.advisor_id = pr.advisor_id
    join public.commercial_people cp
      on cp.id = pr.participant_person_id
     and cp.advisor_id = pr.advisor_id
    where pr.advisor_id = advisor
      and pr.confirmation_state = 'CONFIRMED'
      and pr.effective_to is null
      and pr.archived_at is null
      and pr.role_type <> 'BENEFICIARY'
      and p.archived_at is null
      and coalesce(p.status_value, 'UNKNOWN') not in ('CANCELLED', 'TERMINATED', 'LAPSED')
  ),
  missing_context_candidates as (
    select
      'RESOLVE_MISSING_CONTEXT'::text as action_class,
      'CARTERA070:MISSING_CONTEXT:' || person.person_reference as source_signal_reference,
      person.person_reference,
      person.display_name,
      null::text as policy_reference,
      'RELATIONSHIP_MEMORY'::text as source_authority,
      'RECOMMENDATION'::text as truth_class,
      'TODAY'::text as horizon,
      as_of_date_value::text as event_date,
      person.display_name || ' mantiene una relación activa y su contexto de contacto está incompleto.' as why_this_person,
      'Falta una preferencia confirmada de contacto o explicación para preparar una interacción útil.' as why_now,
      'La ausencia puede reflejar captura incompleta y no una falta real de preferencia.' as uncertainty,
      'Abrir el brief y completar sólo el contexto que la persona confirme.' as smallest_useful_action,
      'Confirmar la preferencia directamente con la persona antes de persistirla.' as advisor_must_confirm,
      public.forge_cartera070_evidence_item(
        'RELATIONSHIP_CONTEXT:' || person.person_reference,
        'RELATIONSHIP_MEMORY',
        'MISSING_CONFIRMED_CONTEXT'
      ) as evidence_item
    from active_people person
    where not exists (
      select 1
      from public.cartera040_relationship_memory_entries memory
      where memory.advisor_id = advisor
        and memory.person_id = person.person_id
        and memory.record_state <> 'WITHDRAWN'
        and memory.memory_kind in (
          'CONTACT_PREFERENCE',
          'CONTACT_TIME_PREFERENCE',
          'EXPLANATION_PREFERENCE'
        )
    )
  ),
  recovery_candidates as (
    select
      'RECOVER_RELATIONSHIP'::text as action_class,
      'CARTERA070:RECOVERY:' || person.person_reference as source_signal_reference,
      person.person_reference,
      person.display_name,
      null::text as policy_reference,
      'RELATIONSHIP_MEMORY'::text as source_authority,
      'RECOMMENDATION'::text as truth_class,
      'NO_DATE'::text as horizon,
      null::text as event_date,
      person.display_name || ' mantiene una relación activa en Cartera.' as why_this_person,
      'No existe una interacción relacional confirmada durante los últimos 180 días.' as why_now,
      'La ausencia de memoria no prueba abandono ni autoriza contacto automático.' as uncertainty,
      'Revisar el brief y decidir si corresponde una acción de servicio apropiada.' as smallest_useful_action,
      'Confirmar contexto, canal y propósito antes de cualquier contacto.' as advisor_must_confirm,
      public.forge_cartera070_evidence_item(
        'RELATIONSHIP_ACTIVITY:' || person.person_reference,
        'RELATIONSHIP_MEMORY',
        'NO_RECENT_CONFIRMED_ACTIVITY'
      ) as evidence_item
    from active_people person
    where not exists (
      select 1
      from public.cartera040_relationship_memory_entries memory
      where memory.advisor_id = advisor
        and memory.person_id = person.person_id
        and memory.record_state <> 'WITHDRAWN'
        and memory.memory_kind in ('SERVICE_INTERACTION', 'ANNUAL_REVIEW', 'APPOINTMENT_CONTEXT')
        and memory.occurred_at::date >= as_of_date_value - 180
    )
  ),
  all_candidates as (
    select * from radar_candidates where action_class is not null
    union all select * from growth_candidates where action_class is not null
    union all select * from missing_context_candidates
    union all select * from recovery_candidates
  ),
  normalized as (
    select distinct on (action_class, source_signal_reference, person_reference)
      public.forge_cartera070_action_reference(
        source_signal_reference,
        action_class,
        person_reference
      ) as action_reference,
      action_class,
      source_signal_reference,
      person_reference,
      display_name,
      policy_reference,
      source_authority,
      truth_class,
      horizon,
      event_date,
      why_this_person,
      why_now,
      uncertainty,
      smallest_useful_action,
      advisor_must_confirm,
      evidence_item,
      public.forge_cartera070_action_minutes(action_class) as estimated_minutes,
      case horizon
        when 'OVERDUE' then 0
        when 'CONFIRMATION_REQUIRED' then 1
        when 'TODAY' then 2
        when 'NEXT_7_DAYS' then 3
        when 'NEXT_30_DAYS' then 4
        when 'NEXT_90_DAYS' then 5
        else 6
      end as display_band
    from all_candidates
    order by action_class, source_signal_reference, person_reference
  ),
  ordered as (
    select
      candidate.*,
      row_number() over (
        order by display_band, event_date nulls last, estimated_minutes, action_reference
      ) as display_position,
      sum(estimated_minutes) over (
        order by display_band, event_date nulls last, estimated_minutes, action_reference
        rows between unbounded preceding and current row
      ) as cumulative_minutes
    from normalized candidate
  ),
  selected as (
    select *
    from ordered
    where display_position <= max_cards_value
      and cumulative_minutes <= available_minutes_value
  )
  select
    (select count(*)::integer from normalized),
    coalesce((select sum(estimated_minutes)::integer from selected), 0),
    coalesce(jsonb_agg(jsonb_build_object(
      'actionReference', action_reference,
      'actionClass', action_class,
      'actionLabel', replace(initcap(lower(action_class)), '_', ' '),
      'personReference', person_reference,
      'displayName', display_name,
      'policyReference', policy_reference,
      'sourceSignalReference', source_signal_reference,
      'sourceAuthority', source_authority,
      'truthClass', truth_class,
      'horizon', horizon,
      'eventDate', event_date,
      'whyThisPerson', why_this_person,
      'whyNow', why_now,
      'uncertainty', uncertainty,
      'smallestUsefulAction', smallest_useful_action,
      'advisorMustConfirm', advisor_must_confirm,
      'estimatedMinutes', estimated_minutes,
      'evidence', jsonb_build_array(evidence_item),
      'actionState', 'ADVISOR_REVIEW_REQUIRED',
      'nbaAuthorizationState', 'NOT_CONNECTED',
      'contactExecuted', false,
      'messageSent', false,
      'taskCreated', false,
      'calendarEventCreated', false,
      'opportunityCreated', false,
      'referralRequested', false,
      'finalNbaPriority', false,
      'variableRewardUsed', false,
      'artificialActivityCreated', false
    ) order by display_position), '[]'::jsonb)
  into total_candidates_value, selected_minutes_value, items_value
  from selected;

  return jsonb_build_object(
    'asOfDate', as_of_date_value,
    'availableMinutes', available_minutes_value,
    'maxCards', max_cards_value,
    'selectionMode', 'CAPACITY_FIT_DISPLAY_ORDER_NOT_FINAL_PRIORITY',
    'nbaAuthorityState', 'NOT_CONNECTED',
    'summary', jsonb_build_object(
      'totalCandidates', total_candidates_value,
      'selectedCards', jsonb_array_length(items_value),
      'selectedMinutes', selected_minutes_value,
      'capacityRemaining', greatest(0, available_minutes_value - selected_minutes_value)
    ),
    'items', items_value,
    'boundaries', jsonb_build_object(
      'automaticContactExecution', false,
      'automaticMessageSend', false,
      'automaticTaskCreation', false,
      'automaticCalendarCreation', false,
      'automaticOpportunityCreation', false,
      'referralRequestExecution', false,
      'finalNbaPriorityTruth', false,
      'variableRewardOptimization', false,
      'artificialActivityInflation', false,
      'advisorConfirmationRequired', true
    ),
    'projectionAuthority', 'CARTERA070_RELATIONAL_ACTIVATION_READ_MODEL',
    'readOnly', true
  );
end;
$$;

revoke all on function public.forge_cartera070_list_relational_activation(jsonb)
  from public, anon;
grant execute on function public.forge_cartera070_list_relational_activation(jsonb)
  to authenticated;

comment on function public.forge_cartera070_list_relational_activation(jsonb) is
  'Owner-scoped capacity-fit relational activation. It does not choose final NBA priority, optimize engagement, create artificial activity or execute actions.';

commit;
