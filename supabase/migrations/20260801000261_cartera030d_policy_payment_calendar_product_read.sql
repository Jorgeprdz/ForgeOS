-- CARTERA 030D sanitized product read model for policy and payment calendar.

begin;

create or replace function public.forge_cartera030d_list_policy_payment_calendar(
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
  policy_reference_value text;
  as_of_date_value date;
  timezone_value text;
  items jsonb;
  summary jsonb;
begin
  if advisor is null then
    raise exception 'CARTERA030D_AUTHENTICATION_REQUIRED';
  end if;
  if p_payload is null or jsonb_typeof(p_payload) <> 'object' then
    raise exception 'CARTERA030D_PAYLOAD_INVALID';
  end if;

  policy_reference_value := nullif(btrim(p_payload ->> 'policyReference'), '');
  as_of_date_value := coalesce(nullif(p_payload ->> 'asOfDate', '')::date, current_date);
  timezone_value := coalesce(nullif(btrim(p_payload ->> 'timezone'), ''), 'America/Mexico_City');
  if length(timezone_value) > 120 then
    raise exception 'CARTERA030D_TIMEZONE_INVALID';
  end if;

  with projected as (
    select
      o.obligation_reference,
      o.policy_reference,
      o.expected_date,
      o.expected_amount,
      o.currency,
      o.status as ledger_status,
      o.confirmation_state,
      o.actual_date,
      o.actual_amount,
      o.date_authority,
      jsonb_array_length(o.matched_payment_event_references) as payment_event_count,
      case
        when o.status = 'CONFIRMATION_REQUIRED' or o.confirmation_state = 'EVIDENCE_PENDING'
          then 'CONFIRMATION_REQUIRED'
        when o.status not in ('CONFIRMED', 'CORRECTED', 'CANCELLED') and o.expected_date < as_of_date_value
          then 'OVERDUE'
        when o.expected_date = as_of_date_value then 'TODAY'
        when o.expected_date <= as_of_date_value + 7 then 'NEXT_7_DAYS'
        when o.expected_date <= as_of_date_value + 30 then 'NEXT_30_DAYS'
        when o.expected_date <= as_of_date_value + 90 then 'NEXT_90_DAYS'
        else 'LATER'
      end as horizon,
      case
        when o.status not in ('CONFIRMED', 'CORRECTED', 'CANCELLED') and o.expected_date < as_of_date_value
          then 'OVERDUE'
        else o.status
      end as display_status
    from public.cartera030b_expected_payment_obligations o
    where o.advisor_id = advisor
      and (policy_reference_value is null or o.policy_reference = policy_reference_value)
  ), visible as (
    select * from projected
    where horizon <> 'LATER'
       or ledger_status in ('CONFIRMED', 'PARTIAL', 'CONFIRMATION_REQUIRED')
  )
  select coalesce(jsonb_agg(jsonb_build_object(
    'obligationReference', obligation_reference,
    'policyReference', policy_reference,
    'expectedDate', expected_date,
    'expectedAmount', expected_amount,
    'currency', currency,
    'status', display_status,
    'ledgerStatus', ledger_status,
    'confirmationState', confirmation_state,
    'actualDate', actual_date,
    'actualAmount', actual_amount,
    'paymentEventCount', payment_event_count,
    'horizon', horizon,
    'dateAuthority', date_authority,
    'explanation', case
      when display_status = 'CONFIRMED' then 'Pago confirmado con PaymentEvent durable.'
      when display_status = 'PARTIAL' then 'Pago parcial confirmado; existe saldo pendiente.'
      when horizon = 'OVERDUE' then 'La fecha esperada pasó. Esto no prueba cancelación ni pérdida de cobertura.'
      when horizon = 'CONFIRMATION_REQUIRED' then 'Existe evidencia o conflicto que requiere revisión humana.'
      else 'Obligación esperada derivada de términos confirmados de la póliza.'
    end
  ) order by expected_date nulls last, obligation_reference), '[]'::jsonb)
  into items
  from visible;

  with projected as (
    select
      o.status,
      o.confirmation_state,
      o.expected_date,
      case
        when o.status = 'CONFIRMATION_REQUIRED' or o.confirmation_state = 'EVIDENCE_PENDING'
          then 'CONFIRMATION_REQUIRED'
        when o.status not in ('CONFIRMED', 'CORRECTED', 'CANCELLED') and o.expected_date < as_of_date_value
          then 'OVERDUE'
        when o.expected_date = as_of_date_value then 'TODAY'
        when o.expected_date <= as_of_date_value + 7 then 'NEXT_7_DAYS'
        when o.expected_date <= as_of_date_value + 30 then 'NEXT_30_DAYS'
        when o.expected_date <= as_of_date_value + 90 then 'NEXT_90_DAYS'
        else 'LATER'
      end as horizon
    from public.cartera030b_expected_payment_obligations o
    where o.advisor_id = advisor
      and (policy_reference_value is null or o.policy_reference = policy_reference_value)
  )
  select jsonb_build_object(
    'today', count(*) filter (where horizon = 'TODAY'),
    'next7Days', count(*) filter (where horizon = 'NEXT_7_DAYS'),
    'next30Days', count(*) filter (where horizon = 'NEXT_30_DAYS'),
    'next90Days', count(*) filter (where horizon = 'NEXT_90_DAYS'),
    'overdue', count(*) filter (where horizon = 'OVERDUE'),
    'confirmationRequired', count(*) filter (where horizon = 'CONFIRMATION_REQUIRED'),
    'confirmed', count(*) filter (where status = 'CONFIRMED'),
    'partial', count(*) filter (where status = 'PARTIAL')
  ) into summary
  from projected;

  return jsonb_build_object(
    'scope', case when policy_reference_value is null then 'PORTFOLIO' else 'POLICY' end,
    'policyReference', policy_reference_value,
    'asOfDate', as_of_date_value,
    'timezone', timezone_value,
    'summary', summary,
    'items', items,
    'readOnly', true,
    'paymentTruthAuthority', 'CONFIRMED_PAYMENT_EVENT_ONLY',
    'lapseInference', false
  );
end;
$$;

revoke all on function public.forge_cartera030d_list_policy_payment_calendar(jsonb) from public, anon;
grant execute on function public.forge_cartera030d_list_policy_payment_calendar(jsonb) to authenticated;

comment on function public.forge_cartera030d_list_policy_payment_calendar(jsonb) is
  'Sanitized owner-scoped Cartera calendar projection. It excludes raw evidence, beneficiaries, payment instruments, payout and compensation truth.';

commit;
