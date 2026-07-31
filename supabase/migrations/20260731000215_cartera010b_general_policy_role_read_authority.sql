-- CARTERA 010B.3E GENERAL POLICY ROLE READ AUTHORITY
-- Additive correction after remote acceptance proved that a security-invoker view
-- cannot read the intentionally revoked policy_roles table. Direct table access
-- remains forbidden; this function exposes only owner-scoped, non-beneficiary rows.

begin;

create or replace function public.forge_cartera010b_list_general_policy_roles(
  p_policy_reference text
)
returns table (
  id uuid,
  advisor_id uuid,
  policy_role_reference text,
  policy_id uuid,
  policy_version_id uuid,
  participant_person_id uuid,
  participant_account_id uuid,
  role_type text,
  confirmation_state text,
  privacy_classification text,
  visibility_scope text,
  effective_from timestamptz,
  effective_to timestamptz,
  role_version integer,
  correction_of uuid,
  created_at timestamptz
)
language plpgsql
stable
security definer
set search_path = public, pg_temp
as $$
declare
  actor_id uuid;
  requested_policy_reference text;
begin
  actor_id := auth.uid();
  if actor_id is null then
    raise exception 'CARTERA010B_AUTH_REQUIRED';
  end if;

  requested_policy_reference := nullif(btrim(p_policy_reference), '');
  if requested_policy_reference is null
     or requested_policy_reference
       !~ '^[A-Za-z0-9][A-Za-z0-9._:@/-]{0,239}$' then
    raise exception 'CARTERA010B_POLICY_REFERENCE_INVALID';
  end if;

  return query
  select
    r.id,
    r.advisor_id,
    r.policy_role_reference,
    r.policy_id,
    r.policy_version_id,
    r.participant_person_id,
    r.participant_account_id,
    r.role_type,
    r.confirmation_state,
    r.privacy_classification,
    r.visibility_scope,
    r.effective_from,
    r.effective_to,
    r.role_version,
    r.correction_of,
    r.created_at
  from public.policy_roles r
  join public.canonical_policies p
    on p.id = r.policy_id
   and p.advisor_id = r.advisor_id
  where r.advisor_id = actor_id
    and p.policy_reference = requested_policy_reference
    and r.visibility_scope = 'POLICY_TEAM'
    and r.role_type <> 'BENEFICIARY'
  order by
    r.effective_from desc,
    r.role_type,
    r.policy_role_reference,
    r.role_version desc;
end;
$$;

revoke all on function
  public.forge_cartera010b_list_general_policy_roles(text)
from public, anon;
grant execute on function
  public.forge_cartera010b_list_general_policy_roles(text)
to authenticated;

comment on function
  public.forge_cartera010b_list_general_policy_roles(text) is
  'CARTERA 010B owner-scoped general PolicyRole read authority. Beneficiaries and restricted rows are structurally excluded; direct policy_roles access remains revoked.';

commit;
