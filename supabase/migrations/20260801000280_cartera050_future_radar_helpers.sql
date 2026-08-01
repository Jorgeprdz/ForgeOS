-- CARTERA 050A/050B deterministic future-radar helpers.
-- These helpers classify dates and anniversaries only. They do not own
-- conservation formulas, compensation formulas, lapse truth or NBA priority.

begin;

create or replace function public.forge_cartera050_horizon(
  p_event_date date,
  p_as_of_date date
)
returns text
language sql
immutable
strict
set search_path = public, pg_temp
as $$
  select case
    when p_event_date < p_as_of_date then 'OVERDUE'
    when p_event_date = p_as_of_date then 'TODAY'
    when p_event_date <= p_as_of_date + 7 then 'NEXT_7_DAYS'
    when p_event_date <= p_as_of_date + 30 then 'NEXT_30_DAYS'
    when p_event_date <= p_as_of_date + 90 then 'NEXT_90_DAYS'
    else 'LATER'
  end;
$$;

create or replace function public.forge_cartera050_next_anniversary(
  p_anchor_date date,
  p_as_of_date date
)
returns date
language plpgsql
immutable
strict
set search_path = public, pg_temp
as $$
declare
  target_year integer := extract(year from p_as_of_date)::integer;
  target_month integer := extract(month from p_anchor_date)::integer;
  target_day integer := extract(day from p_anchor_date)::integer;
  max_day integer;
  candidate date;
begin
  max_day := extract(day from (
    make_date(target_year, target_month, 1) + interval '1 month - 1 day'
  ))::integer;
  candidate := make_date(target_year, target_month, least(target_day, max_day));

  if candidate < p_as_of_date then
    target_year := target_year + 1;
    max_day := extract(day from (
      make_date(target_year, target_month, 1) + interval '1 month - 1 day'
    ))::integer;
    candidate := make_date(target_year, target_month, least(target_day, max_day));
  end if;

  return candidate;
end;
$$;

revoke all on function public.forge_cartera050_horizon(date, date) from public, anon, authenticated;
revoke all on function public.forge_cartera050_next_anniversary(date, date) from public, anon, authenticated;

grant execute on function public.forge_cartera050_horizon(date, date) to authenticated;
grant execute on function public.forge_cartera050_next_anniversary(date, date) to authenticated;

comment on function public.forge_cartera050_horizon(date, date) is
  'Deterministic Today/7/30/90/overdue date classification. It is not final priority truth.';
comment on function public.forge_cartera050_next_anniversary(date, date) is
  'Deterministic next anniversary with leap-day clamping. It does not infer carrier renewal.';

commit;
