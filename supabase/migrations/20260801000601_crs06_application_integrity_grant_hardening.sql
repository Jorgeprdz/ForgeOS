-- CRS 06E Application integrity and grant hardening

begin;

alter table public.application_events
  add column if not exists command_digest text;
update public.application_events
set command_digest = event_digest
where command_digest is null;
alter table public.application_events
  alter column command_digest set not null;

alter table public.application_signature_evidence
  add column if not exists command_digest text;
update public.application_signature_evidence
set command_digest = encode(
  digest(
    convert_to(
      jsonb_build_object(
        'applicationId', application_id,
        'signatureReference', signature_reference,
        'versionReference', version_reference,
        'signerReference', signer_reference,
        'documentDigest', document_digest,
        'idempotencyKey', idempotency_key
      )::text,
      'UTF8'
    ),
    'sha256'
  ),
  'hex'
)
where command_digest is null;
alter table public.application_signature_evidence
  alter column command_digest set not null;

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conrelid = 'public.application_events'::regclass
      and conname = 'application_events_command_digest_ck'
  ) then
    alter table public.application_events
      add constraint application_events_command_digest_ck
      check (command_digest ~ '^[a-f0-9]{64}$');
  end if;

  if not exists (
    select 1 from pg_constraint
    where conrelid = 'public.application_signature_evidence'::regclass
      and conname = 'application_signature_command_digest_ck'
  ) then
    alter table public.application_signature_evidence
      add constraint application_signature_command_digest_ck
      check (command_digest ~ '^[a-f0-9]{64}$');
  end if;
end;
$$;

revoke execute on function public.forge_crs06_valid_reference_array(jsonb)
  from public, anon, authenticated;
revoke execute on function public.forge_crs06_event_digest(jsonb)
  from public, anon, authenticated;
revoke execute on function public.forge_crs06_create_application(text,text,text,text,text,text,text,jsonb,jsonb,timestamptz,text,text)
  from public, anon;
revoke execute on function public.forge_crs06_add_application_version(text,text,text,jsonb,timestamptz,text,text,text)
  from public, anon;
revoke execute on function public.forge_crs06_record_signature_evidence(text,text,text,text,text,text,text,timestamptz,timestamptz,jsonb,text,text,text,text,text)
  from public, anon;
revoke execute on function public.forge_crs06_submit_application(text,text,jsonb,timestamptz,text,text)
  from public, anon;
revoke execute on function public.forge_crs06_record_requirement(text,text,text,text,jsonb,timestamptz,timestamptz,text,text,text,text)
  from public, anon;
revoke execute on function public.forge_crs06_record_decision(text,text,text,jsonb,timestamptz,text,text)
  from public, anon;

grant execute on function public.forge_crs06_create_application(text,text,text,text,text,text,text,jsonb,jsonb,timestamptz,text,text)
  to authenticated;
grant execute on function public.forge_crs06_add_application_version(text,text,text,jsonb,timestamptz,text,text,text)
  to authenticated;
grant execute on function public.forge_crs06_record_signature_evidence(text,text,text,text,text,text,text,timestamptz,timestamptz,jsonb,text,text,text,text,text)
  to authenticated;
grant execute on function public.forge_crs06_submit_application(text,text,jsonb,timestamptz,text,text)
  to authenticated;
grant execute on function public.forge_crs06_record_requirement(text,text,text,text,jsonb,timestamptz,timestamptz,text,text,text,text)
  to authenticated;
grant execute on function public.forge_crs06_record_decision(text,text,text,jsonb,timestamptz,text,text)
  to authenticated;

commit;
