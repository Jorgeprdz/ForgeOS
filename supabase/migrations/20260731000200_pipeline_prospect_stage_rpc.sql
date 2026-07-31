-- PIPELINE PROSPECT STAGE RPC AUTHORITY
-- One authenticated server-side authority for prospect stage transitions.
-- Ownership is checked explicitly; no advisor identity is accepted from the client.

begin;

create or replace function public.forge_pipeline_update_prospect_stage(
  p_prospect_id uuid,
  p_status text
)
returns public.prospects
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  actor_id uuid;
  persisted public.prospects%rowtype;
begin
  actor_id := auth.uid();

  if actor_id is null then
    raise exception 'PIPELINE_STAGE_AUTH_REQUIRED';
  end if;

  if p_prospect_id is null then
    raise exception 'PIPELINE_STAGE_PROSPECT_REQUIRED';
  end if;

  if p_status is null or p_status not in (
    'referred_new',
    'contacted',
    'appointment_scheduled',
    'proposal',
    'decision',
    'client'
  ) then
    raise exception 'PIPELINE_STAGE_NOT_ALLOWED';
  end if;

  update public.prospects
  set
    status = p_status,
    updated_by = actor_id
  where id = p_prospect_id
    and advisor_id = actor_id
    and archived_at is null
  returning * into persisted;

  if persisted.id is null then
    raise exception 'PIPELINE_STAGE_PROSPECT_NOT_OWNED';
  end if;

  if persisted.status is distinct from p_status then
    raise exception 'PIPELINE_STAGE_CONFIRMATION_MISMATCH';
  end if;

  return persisted;
end;
$$;

revoke all
on function public.forge_pipeline_update_prospect_stage(uuid, text)
from public, anon, authenticated;

grant execute
on function public.forge_pipeline_update_prospect_stage(uuid, text)
to authenticated;

comment on function public.forge_pipeline_update_prospect_stage(uuid, text) is
  'Authenticated owner-only prospect stage mutation authority. Returns the confirmed prospect row and preserves audit/Timeline triggers.';

notify pgrst, 'reload schema';

commit;
