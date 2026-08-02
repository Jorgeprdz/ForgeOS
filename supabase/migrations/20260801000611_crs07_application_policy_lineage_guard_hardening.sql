-- CRS 07 append-only correction: PostgreSQL NULL-safe governed-context guard.
-- Migration 00610 is already recorded remotely and remains immutable.

begin;

create or replace function public.forge_crs07_application_policy_lineage_insert_guard()
returns trigger
language plpgsql
security invoker
set search_path = public, pg_temp
as $$
declare
  application_row public.commercial_applications%rowtype;
  policy_row public.canonical_policies%rowtype;
  evidence_row public.policy_evidence_versions%rowtype;
  previous_row public.policy_versions%rowtype;
  distinct_policy_count integer;
begin
  if new.application_reference is null then
    return new;
  end if;

  if current_setting('forge.crs07_application_policy_lineage_command', true)
       is distinct from 'on' then
    raise exception 'CRS07_APPLICATION_LINEAGE_REQUIRES_GOVERNED_COMMAND';
  end if;

  select * into application_row
  from public.commercial_applications a
  where a.advisor_id = new.advisor_id
    and a.application_reference = new.application_reference;
  if not found then
    raise exception 'CRS07_APPLICATION_LINEAGE_NOT_FOUND';
  end if;
  if application_row.lifecycle_state <> 'APPROVED' then
    raise exception 'CRS07_APPROVED_APPLICATION_REQUIRED';
  end if;
  if new.quote_reference is null
     or new.quote_reference <> application_row.quote_reference then
    raise exception 'CRS07_QUOTE_LINEAGE_MISMATCH';
  end if;

  select * into policy_row
  from public.canonical_policies p
  where p.advisor_id = new.advisor_id
    and p.id = new.policy_id;
  if not found then
    raise exception 'CRS07_POLICY_REQUIRED';
  end if;
  if policy_row.product_reference <> application_row.product_reference then
    raise exception 'CRS07_PRODUCT_LINEAGE_MISMATCH';
  end if;

  select * into evidence_row
  from public.policy_evidence_versions e
  where e.advisor_id = new.advisor_id
    and e.id = new.evidence_version_id;
  if not found then
    raise exception 'CRS07_ISSUANCE_EVIDENCE_REQUIRED';
  end if;
  if evidence_row.verification_state <> 'CONFIRMED' then
    raise exception 'CRS07_ISSUANCE_EVIDENCE_NOT_CONFIRMED';
  end if;
  if evidence_row.source_type not in (
    'CARTERA020B_POLICY_PACKET',
    'POLICY_CONTRACT',
    'POLICY_SCHEDULE',
    'POLICY_ADMIN_RECORD',
    'ISSUANCE_CONFIRMATION',
    'CARRIER_ISSUANCE_RECEIPT'
  ) then
    raise exception 'CRS07_ISSUANCE_EVIDENCE_SOURCE_WEAK';
  end if;
  if coalesce(evidence_row.provenance ->> 'issuanceConfirmed', 'false') <> 'true'
     or evidence_row.provenance ->> 'applicationReference' <> new.application_reference
     or nullif(btrim(evidence_row.provenance ->> 'sourceAuthority'), '') is null then
    raise exception 'CRS07_ISSUANCE_PROVENANCE_INVALID';
  end if;

  if new.version_number > 1 then
    select * into previous_row
    from public.policy_versions v
    where v.advisor_id = new.advisor_id
      and v.policy_id = new.policy_id
      and v.version_number = new.version_number - 1;
    if not found then
      raise exception 'CRS07_PREVIOUS_POLICY_VERSION_REQUIRED';
    end if;
    if previous_row.application_reference is distinct from new.application_reference
       or previous_row.quote_reference is distinct from new.quote_reference then
      raise exception 'CRS07_POLICY_LINEAGE_IMMUTABLE';
    end if;
  end if;

  select count(distinct v.policy_id) into distinct_policy_count
  from public.policy_versions v
  where v.advisor_id = new.advisor_id
    and v.application_reference = new.application_reference
    and v.policy_id <> new.policy_id;
  if distinct_policy_count > 0 then
    raise exception 'CRS07_APPLICATION_MULTIPLE_POLICY_CONFLICT';
  end if;

  return new;
end;
$$;

revoke all on function public.forge_crs07_application_policy_lineage_insert_guard()
  from public, anon, authenticated;

commit;
