-- CRS 07 append-only correction: remove PL/pgSQL column/variable ambiguity.
-- Migrations 00610 and 00611 remain immutable in remote history.

begin;

create or replace function public.forge_crs07_confirm_issued_policy_from_application(
  p_command jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = public, extensions, pg_temp
as $$
#variable_conflict error
declare
  actor_id uuid := auth.uid();
  v_application_reference text;
  v_quote_reference text;
  v_product_reference text;
  v_source_type text;
  application_row public.commercial_applications%rowtype;
  person_row public.commercial_people%rowtype;
  response jsonb;
begin
  if actor_id is null then
    raise exception 'CRS07_AUTH_REQUIRED';
  end if;
  if p_command is null
     or jsonb_typeof(p_command) <> 'object'
     or p_command ->> 'contractType' <> 'FORGE_CONFIRMED_POLICY_COMMAND'
     or p_command ->> 'advisorId' <> actor_id::text
     or p_command ->> 'actorReference' <> actor_id::text then
    raise exception 'CRS07_CONFIRMED_POLICY_COMMAND_INVALID';
  end if;

  v_application_reference := nullif(btrim(p_command -> 'lineage' ->> 'applicationReference'), '');
  v_quote_reference := nullif(btrim(p_command -> 'lineage' ->> 'quoteReference'), '');
  v_product_reference := nullif(btrim(p_command -> 'policy' ->> 'productReference'), '');
  v_source_type := nullif(btrim(p_command -> 'evidence' ->> 'sourceType'), '');

  if v_application_reference is null then
    raise exception 'CRS07_APPLICATION_REFERENCE_REQUIRED';
  end if;

  select a.* into application_row
  from public.commercial_applications a
  where a.advisor_id = actor_id
    and a.application_reference = v_application_reference
  for update;
  if not found then
    raise exception 'CRS07_APPLICATION_REQUIRED';
  end if;
  if application_row.lifecycle_state <> 'APPROVED' then
    raise exception 'CRS07_APPROVED_APPLICATION_REQUIRED';
  end if;

  select p.* into person_row
  from public.commercial_people p
  where p.advisor_id = actor_id
    and p.id = application_row.person_id
    and p.lifecycle_state = 'CONFIRMED'
    and p.archived_at is null;
  if not found then
    raise exception 'CRS07_CONFIRMED_PERSON_REQUIRED';
  end if;

  if v_quote_reference is null
     or v_quote_reference <> application_row.quote_reference then
    raise exception 'CRS07_QUOTE_LINEAGE_MISMATCH';
  end if;
  if v_product_reference is null
     or v_product_reference <> application_row.product_reference then
    raise exception 'CRS07_PRODUCT_LINEAGE_MISMATCH';
  end if;
  if p_command -> 'evidence' ->> 'verificationState' <> 'CONFIRMED' then
    raise exception 'CRS07_ISSUANCE_EVIDENCE_NOT_CONFIRMED';
  end if;
  if v_source_type not in (
    'CARTERA020B_POLICY_PACKET',
    'POLICY_CONTRACT',
    'POLICY_SCHEDULE',
    'POLICY_ADMIN_RECORD',
    'ISSUANCE_CONFIRMATION',
    'CARRIER_ISSUANCE_RECEIPT'
  ) then
    raise exception 'CRS07_ISSUANCE_EVIDENCE_SOURCE_WEAK';
  end if;
  if coalesce(p_command -> 'evidence' -> 'provenance' ->> 'issuanceConfirmed', 'false') <> 'true'
     or p_command -> 'evidence' -> 'provenance' ->> 'applicationReference' <> v_application_reference
     or nullif(btrim(p_command -> 'evidence' -> 'provenance' ->> 'sourceAuthority'), '') is null then
    raise exception 'CRS07_ISSUANCE_PROVENANCE_INVALID';
  end if;

  if not exists (
    select 1
    from jsonb_array_elements(p_command -> 'roles') role
    where role ->> 'participantPersonReference' = person_row.person_reference
      and role ->> 'roleType' in ('POLICY_OWNER', 'INSURED', 'ADDITIONAL_INSURED', 'PAYOR')
      and role ->> 'confirmationState' = 'CONFIRMED'
  ) then
    raise exception 'CRS07_APPLICATION_PERSON_POLICY_ROLE_REQUIRED';
  end if;

  perform set_config('forge.crs07_application_policy_lineage_command', 'on', true);
  response := public.forge_cartera010b_confirm_policy_with_parties(p_command);

  if response ->> 'status' <> 'CONFIRMED' then
    return response || jsonb_build_object(
      'applicationReference', v_application_reference,
      'applicationPolicyLineageVerified', false,
      'policyCreatedByApplication', false,
      'quoteUsedAsPolicyAuthority', false,
      'issuanceEvidenceRequired', true,
      'automaticPolicyCreation', false
    );
  end if;

  return response || jsonb_build_object(
    'applicationReference', v_application_reference,
    'applicationPolicyLineageVerified', true,
    'policyCreatedByApplication', false,
    'quoteUsedAsPolicyAuthority', false,
    'issuanceEvidenceRequired', true,
    'automaticPolicyCreation', false
  );
end;
$$;

revoke all on function public.forge_crs07_confirm_issued_policy_from_application(jsonb)
  from public, anon;
grant execute on function public.forge_crs07_confirm_issued_policy_from_application(jsonb)
  to authenticated;

commit;
