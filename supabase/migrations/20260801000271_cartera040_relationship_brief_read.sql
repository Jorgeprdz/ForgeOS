-- CARTERA 040B/040D unified relationship history and pre-contact brief.
-- This read surface composes existing authorities; it does not create identity,
-- opportunity, consent, client intent, NASH message or contact-execution truth.

begin;

create or replace function public.forge_cartera040_list_relationship_brief(
  p_payload jsonb
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
  history_limit_value integer;
  person_row record;
  linked_prospect_id uuid;
  accounts_value jsonb;
  policies_value jsonb;
  preferences_value jsonb;
  commitments_value jsonb;
  life_context_value jsonb;
  history_value jsonb;
  response_envelope jsonb;
begin
  if advisor is null then
    raise exception 'CARTERA040_AUTHENTICATION_REQUIRED';
  end if;
  if p_payload is null or jsonb_typeof(p_payload) <> 'object' then
    raise exception 'CARTERA040_BRIEF_PAYLOAD_INVALID';
  end if;

  person_reference_value := nullif(btrim(p_payload ->> 'personReference'), '');
  history_limit_value := coalesce(nullif(p_payload ->> 'limit', '')::integer, 60);

  if person_reference_value is null
    or person_reference_value !~ '^[A-Za-z0-9][A-Za-z0-9._:@/-]{0,239}$'
    or history_limit_value < 1
    or history_limit_value > 100 then
    raise exception 'CARTERA040_BRIEF_INPUT_INVALID';
  end if;

  select p.*
  into person_row
  from public.commercial_people p
  where p.advisor_id = advisor
    and p.person_reference = person_reference_value
    and p.lifecycle_state <> 'ARCHIVED'
    and p.archived_at is null;

  if not found then
    raise exception 'CARTERA040_PERSON_NOT_FOUND';
  end if;

  select l.prospect_id
  into linked_prospect_id
  from public.commercial_source_identity_links l
  where l.advisor_id = advisor
    and l.person_id = person_row.id
    and l.source_identity_type = 'PROSPECT'
    and l.prospect_id is not null
    and l.effective_to is null
  order by l.effective_from desc
  limit 1;

  select coalesce(jsonb_agg(item order by display_label), '[]'::jsonb)
  into accounts_value
  from (
    select distinct
      a.display_label,
      jsonb_build_object(
        'accountReference', a.account_reference,
        'displayLabel', a.display_label,
        'accountType', a.account_type,
        'relationshipRole', m.relationship_role,
        'confirmationState', m.confirmation_state
      ) as item
    from public.commercial_account_memberships m
    join public.commercial_accounts a
      on a.id = m.account_id
     and a.advisor_id = m.advisor_id
    where m.advisor_id = advisor
      and m.person_id = person_row.id
      and m.confirmation_state = 'CONFIRMED'
      and m.effective_to is null
      and a.archived_at is null
  ) account_rows;

  select coalesce(jsonb_agg(item order by product_reference, policy_reference), '[]'::jsonb)
  into policies_value
  from (
    select distinct
      p.product_reference,
      p.policy_reference,
      jsonb_build_object(
        'policyReference', p.policy_reference,
        'carrierReference', p.carrier_reference,
        'productReference', p.product_reference,
        'status', p.status_value,
        'statusAsOf', p.status_as_of,
        'roleType', r.role_type
      ) as item
    from public.policy_roles r
    join public.canonical_policies p
      on p.id = r.policy_id
     and p.advisor_id = r.advisor_id
    where r.advisor_id = advisor
      and r.participant_person_id = person_row.id
      and r.confirmation_state = 'CONFIRMED'
      and r.effective_to is null
      and r.archived_at is null
      and p.archived_at is null
      and r.role_type <> 'BENEFICIARY'
      and r.visibility_scope in ('POLICY_TEAM', 'OWNING_ADVISOR_ONLY')
  ) policy_rows;

  select coalesce(jsonb_agg(item order by occurred_at desc), '[]'::jsonb)
  into preferences_value
  from (
    select
      m.occurred_at,
      jsonb_build_object(
        'memoryReference', m.memory_reference,
        'kind', m.memory_kind,
        'summary', m.summary,
        'valueCode', m.value_code,
        'occurredAt', m.occurred_at,
        'sourceAuthority', m.source_authority,
        'consentState', m.consent_state,
        'contextUse', m.context_use,
        'truthClass', 'CONFIRMED_MEMORY'
      ) as item
    from public.cartera040_relationship_memory_entries m
    where m.advisor_id = advisor
      and m.person_id = person_row.id
      and m.record_state <> 'WITHDRAWN'
      and m.memory_kind in (
        'CONTACT_PREFERENCE',
        'CONTACT_TIME_PREFERENCE',
        'DECISION_PARTICIPANT',
        'EXPLANATION_PREFERENCE',
        'SERVICE_EXPECTATION'
      )
      and not exists (
        select 1
        from public.cartera040_relationship_memory_entries newer
        where newer.advisor_id = advisor
          and newer.supersedes_memory_id = m.id
          and newer.record_state <> 'WITHDRAWN'
      )
  ) preference_rows;

  select coalesce(jsonb_agg(item order by occurred_at desc), '[]'::jsonb)
  into commitments_value
  from (
    select
      m.occurred_at,
      jsonb_build_object(
        'memoryReference', m.memory_reference,
        'kind', m.memory_kind,
        'summary', m.summary,
        'occurredAt', m.occurred_at,
        'sourceAuthority', m.source_authority,
        'contextUse', m.context_use,
        'truthClass', 'CONFIRMED_MEMORY'
      ) as item
    from public.cartera040_relationship_memory_entries m
    where m.advisor_id = advisor
      and m.person_id = person_row.id
      and m.record_state <> 'WITHDRAWN'
      and m.memory_kind = 'UNRESOLVED_COMMITMENT'
      and not exists (
        select 1
        from public.cartera040_relationship_memory_entries newer
        where newer.advisor_id = advisor
          and newer.supersedes_memory_id = m.id
          and newer.record_state <> 'WITHDRAWN'
      )
  ) commitment_rows;

  select coalesce(jsonb_agg(item order by occurred_at desc), '[]'::jsonb)
  into life_context_value
  from (
    select
      m.occurred_at,
      jsonb_build_object(
        'memoryReference', m.memory_reference,
        'summary', m.summary,
        'occurredAt', m.occurred_at,
        'sourceAuthority', m.source_authority,
        'consentState', m.consent_state,
        'contextUse', m.context_use,
        'truthClass', 'CONFIRMED_SENSITIVE_CONTEXT',
        'salesTrigger', false
      ) as item
    from public.cartera040_relationship_memory_entries m
    where m.advisor_id = advisor
      and m.person_id = person_row.id
      and m.record_state <> 'WITHDRAWN'
      and m.memory_kind = 'LIFE_CONTEXT'
      and m.sensitivity = 'SENSITIVE'
      and m.consent_state = 'CONFIRMED'
      and m.context_use in ('SERVICE_ONLY', 'CONVERSATION_PREPARATION')
      and not exists (
        select 1
        from public.cartera040_relationship_memory_entries newer
        where newer.advisor_id = advisor
          and newer.supersedes_memory_id = m.id
          and newer.record_state <> 'WITHDRAWN'
      )
  ) context_rows;

  select coalesce(jsonb_agg(item order by occurred_at desc, sort_key desc), '[]'::jsonb)
  into history_value
  from (
    select *
    from (
      select
        m.occurred_at,
        m.created_at as sort_key,
        jsonb_build_object(
          'eventType', m.memory_kind,
          'title', replace(initcap(lower(m.memory_kind)), '_', ' '),
          'summary', m.summary,
          'occurredAt', m.occurred_at,
          'sourceAuthority', m.source_authority,
          'sourceRecordReference', m.source_record_reference,
          'truthClass', case
            when m.memory_kind = 'LIFE_CONTEXT' then 'CONFIRMED_SENSITIVE_CONTEXT'
            else 'CONFIRMED_MEMORY'
          end,
          'consentState', m.consent_state,
          'contextUse', m.context_use,
          'salesTrigger', false
        ) as item
      from public.cartera040_relationship_memory_entries m
      where m.advisor_id = advisor
        and m.person_id = person_row.id
        and m.record_state <> 'WITHDRAWN'
        and (
          m.memory_kind <> 'LIFE_CONTEXT'
          or (
            m.sensitivity = 'SENSITIVE'
            and m.consent_state = 'CONFIRMED'
          )
        )
        and not exists (
          select 1
          from public.cartera040_relationship_memory_entries newer
          where newer.advisor_id = advisor
            and newer.supersedes_memory_id = m.id
            and newer.record_state <> 'WITHDRAWN'
        )

      union all

      select
        t.occurred_at,
        t.recorded_at as sort_key,
        jsonb_build_object(
          'eventType', t.event_type,
          'title', replace(initcap(lower(t.event_type)), '_', ' '),
          'summary', coalesce(
            nullif(t.payload ->> 'outcome', ''),
            nullif(t.payload ->> 'decisionCode', ''),
            nullif(t.payload ->> 'objectionCode', ''),
            nullif(t.payload ->> 'followUpType', ''),
            replace(initcap(lower(t.event_type)), '_', ' ')
          ),
          'occurredAt', t.occurred_at,
          'sourceAuthority', t.event_source,
          'sourceRecordReference', t.source_record_reference,
          'truthClass', 'CONFIRMED_EVENT',
          'consentState', 'NOT_APPLICABLE',
          'contextUse', 'GENERAL_RELATIONSHIP',
          'salesTrigger', false
        ) as item
      from public.prospect_timeline_events t
      where linked_prospect_id is not null
        and t.advisor_id = advisor
        and t.prospect_id = linked_prospect_id

      union all

      select
        policy_history.occurred_at,
        policy_history.sort_key,
        policy_history.item
      from (
        select distinct on (p.id)
          v.confirmed_at as occurred_at,
          v.created_at as sort_key,
          jsonb_build_object(
            'eventType', 'POLICY_CONFIRMED',
            'title', 'Póliza confirmada',
            'summary', p.product_reference,
            'occurredAt', v.confirmed_at,
            'sourceAuthority', 'POLICY_INTELLIGENCE',
            'sourceRecordReference', p.policy_reference,
            'truthClass', 'CONFIRMED_POLICY_FACT',
            'consentState', 'NOT_APPLICABLE',
            'contextUse', 'GENERAL_RELATIONSHIP',
            'salesTrigger', false
          ) as item
        from public.policy_roles r
        join public.canonical_policies p
          on p.id = r.policy_id
         and p.advisor_id = r.advisor_id
        join public.policy_versions v
          on v.policy_id = p.id
         and v.advisor_id = p.advisor_id
         and v.version_number = p.current_version
        where r.advisor_id = advisor
          and r.participant_person_id = person_row.id
          and r.confirmation_state = 'CONFIRMED'
          and r.effective_to is null
          and r.archived_at is null
          and p.archived_at is null
          and r.role_type <> 'BENEFICIARY'
        order by p.id, v.confirmed_at desc
      ) policy_history

      union all

      select
        e.confirmed_at as occurred_at,
        e.created_at as sort_key,
        jsonb_build_object(
          'eventType', 'PAYMENT_CONFIRMED',
          'title', 'Pago confirmado',
          'summary', case
            when e.currency is null then e.payment_amount::text
            else e.payment_amount::text || ' ' || e.currency
          end,
          'occurredAt', e.confirmed_at,
          'sourceAuthority', 'PAYMENT_EVENT',
          'sourceRecordReference', e.payment_event_reference,
          'truthClass', 'CONFIRMED_PAYMENT_EVENT',
          'consentState', 'NOT_APPLICABLE',
          'contextUse', 'SERVICE_ONLY',
          'salesTrigger', false
        ) as item
      from public.cartera030c_confirmed_payment_events e
      where e.advisor_id = advisor
        and exists (
          select 1
          from public.policy_roles r
          where r.advisor_id = advisor
            and r.policy_id = e.policy_id
            and r.participant_person_id = person_row.id
            and r.confirmation_state = 'CONFIRMED'
            and r.effective_to is null
            and r.archived_at is null
            and r.role_type <> 'BENEFICIARY'
        )
    ) all_history
    order by occurred_at desc, sort_key desc
    limit history_limit_value
  ) bounded_history;

  response_envelope := jsonb_build_object(
    'person', jsonb_build_object(
      'personReference', person_row.person_reference,
      'displayName', person_row.display_name,
      'preferredName', person_row.preferred_name,
      'lifecycleState', person_row.lifecycle_state,
      'privacyClassification', person_row.privacy_classification
    ),
    'summary', jsonb_build_object(
      'lastInteractionAt', case
        when jsonb_array_length(history_value) = 0 then null
        else history_value -> 0 ->> 'occurredAt'
      end,
      'accountCount', jsonb_array_length(accounts_value),
      'activePolicyCount', jsonb_array_length(policies_value),
      'preferenceCount', jsonb_array_length(preferences_value),
      'openCommitmentCount', jsonb_array_length(commitments_value),
      'confirmedLifeContextCount', jsonb_array_length(life_context_value),
      'historyCount', jsonb_array_length(history_value)
    ),
    'network', jsonb_build_object(
      'accounts', accounts_value,
      'policies', policies_value
    ),
    'preferences', preferences_value,
    'commitments', commitments_value,
    'lifeContext', life_context_value,
    'history', history_value,
    'boundaries', jsonb_build_object(
      'lifeContextIsSalesTrigger', false,
      'automaticOpportunityCreation', false,
      'automaticContactExecution', false,
      'finalMessageGeneration', false,
      'rawEvidenceExposed', false,
      'beneficiaryDataExposed', false,
      'paymentInstrumentDataExposed', false,
      'advisorConfirmationRequired', true
    ),
    'projectionAuthority', 'CARTERA040_RELATIONSHIP_MEMORY_READ_MODEL',
    'readOnly', true
  );

  return response_envelope;
end;
$$;

revoke all on function public.forge_cartera040_list_relationship_brief(jsonb)
  from public, anon;
grant execute on function public.forge_cartera040_list_relationship_brief(jsonb)
  to authenticated;

commit;
