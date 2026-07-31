-- QPD-05 printable quote persistence, versioning and reopen.
-- Repository migration only. Requires CARTERA-001B Quote lifecycle identity first.

begin;

create extension if not exists pgcrypto;

do $$
begin
  if to_regclass('public.quote_lifecycle_quotes') is null
     or to_regclass('public.quote_lifecycle_versions') is null
     or to_regprocedure('public.forge_cartera001b_json_has_forbidden_key(jsonb)') is null then
    raise exception 'QPD05_CARTERA001B_REQUIRED';
  end if;
end;
$$;

create table if not exists public.quote_printable_document_versions (
  id uuid primary key default gen_random_uuid(),
  advisor_id uuid not null references auth.users(id) on delete restrict,
  quote_id uuid not null,
  quote_version_id uuid not null,
  quote_reference text not null,
  quote_version_reference text not null,
  printable_version_reference text not null,
  document_reference text not null,
  product_profile_id text not null,
  page_format text not null,
  source_revision_hash text not null,
  quote_snapshot_digest text not null,
  record_digest text not null,
  idempotency_key text not null,
  record_payload jsonb not null,
  persisted_at timestamptz not null,
  created_at timestamptz not null default now(),
  constraint quote_printable_versions_quote_fk
    foreign key (advisor_id, quote_id)
    references public.quote_lifecycle_quotes(advisor_id, id)
    on delete restrict,
  constraint quote_printable_versions_quote_version_fk
    foreign key (advisor_id, quote_version_id)
    references public.quote_lifecycle_versions(advisor_id, id)
    on delete restrict,
  constraint quote_printable_versions_quote_reference_ck check (
    quote_reference ~ '^quote:[0-9a-f-]{36}$'
  ),
  constraint quote_printable_versions_quote_version_reference_ck check (
    quote_version_reference ~ '^quote-version:[0-9a-f-]{36}$'
  ),
  constraint quote_printable_versions_reference_ck check (
    printable_version_reference ~ '^qpd-version:[a-f0-9]{64}$'
  ),
  constraint quote_printable_versions_document_reference_ck check (
    document_reference ~ '^qpd-document:[a-f0-9]{64}$'
  ),
  constraint quote_printable_versions_product_profile_ck check (
    product_profile_id ~ '^[A-Z][A-Z0-9_]{1,63}$'
  ),
  constraint quote_printable_versions_page_format_ck check (
    page_format in ('A4', 'LETTER')
  ),
  constraint quote_printable_versions_source_revision_ck check (
    source_revision_hash ~ '^[a-f0-9]{8,128}$'
  ),
  constraint quote_printable_versions_digest_ck check (
    quote_snapshot_digest ~ '^[a-f0-9]{64}$'
    and record_digest ~ '^[a-f0-9]{64}$'
  ),
  constraint quote_printable_versions_idempotency_ck check (
    idempotency_key ~ '^[A-Za-z0-9][A-Za-z0-9._:@/-]{0,239}$'
  ),
  constraint quote_printable_versions_payload_object_ck check (
    jsonb_typeof(record_payload) = 'object'
  ),
  constraint quote_printable_versions_payload_contract_ck check (
    record_payload->>'packetType' = 'FORGE_QUOTE_PRINTABLE_VERSION_RECORD'
    and record_payload->>'contractVersion' = 'QPD05_VERSION_REPOSITORY_V1'
    and (record_payload->>'storageSchemaVersion')::integer = 1
  ),
  constraint quote_printable_versions_payload_safe_ck check (
    not public.forge_cartera001b_json_has_forbidden_key(record_payload)
    and record_payload::text !~* '"(rawPdf|pdfBytes|arrayBuffer|base64|binary|blob|bytes|dataUrl|html)"[[:space:]]*:'
  ),
  constraint quote_printable_versions_owner_reference_uq unique (
    advisor_id,
    printable_version_reference
  ),
  constraint quote_printable_versions_owner_idempotency_uq unique (
    advisor_id,
    idempotency_key
  ),
  constraint quote_printable_versions_owner_id_uq unique (
    advisor_id,
    id
  )
);

create index if not exists quote_printable_versions_quote_idx
  on public.quote_printable_document_versions(
    advisor_id,
    quote_reference,
    persisted_at desc,
    created_at desc
  );

create index if not exists quote_printable_versions_quote_version_idx
  on public.quote_printable_document_versions(
    advisor_id,
    quote_version_reference,
    persisted_at desc
  );

create or replace function public.forge_qpd05_deny_append_only_mutation()
returns trigger
language plpgsql
set search_path = public, pg_temp
as $$
begin
  raise exception 'QPD05_APPEND_ONLY_MUTATION_DENIED';
end;
$$;

drop trigger if exists forge_qpd05_versions_append_only
  on public.quote_printable_document_versions;
create trigger forge_qpd05_versions_append_only
before update or delete on public.quote_printable_document_versions
for each row execute function public.forge_qpd05_deny_append_only_mutation();

alter table public.quote_printable_document_versions enable row level security;
alter table public.quote_printable_document_versions force row level security;

revoke all on public.quote_printable_document_versions from anon, authenticated;

drop policy if exists quote_printable_document_versions_select_own
  on public.quote_printable_document_versions;
create policy quote_printable_document_versions_select_own
  on public.quote_printable_document_versions
  for select to authenticated
  using (advisor_id = auth.uid());

grant select on public.quote_printable_document_versions to authenticated;

create or replace function public.forge_qpd05_append_printable_quote_version(
  p_quote_reference text,
  p_quote_version_reference text,
  p_record jsonb,
  p_idempotency_key text
)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  actor_id uuid := auth.uid();
  quote_row public.quote_lifecycle_quotes%rowtype;
  version_row public.quote_lifecycle_versions%rowtype;
  existing_row public.quote_printable_document_versions%rowtype;
  inserted_row public.quote_printable_document_versions%rowtype;
  payload_identity jsonb;
  payload_manifest jsonb;
  payload_reference text;
  payload_document_reference text;
  payload_record_digest text;
  payload_source_revision text;
  payload_profile text;
  payload_page_format text;
  payload_persisted_at timestamptz;
begin
  if actor_id is null then
    raise exception 'QPD05_AUTH_REQUIRED';
  end if;
  if p_quote_reference is null
     or p_quote_reference !~ '^quote:[0-9a-f-]{36}$' then
    raise exception 'QPD05_QUOTE_REFERENCE_INVALID';
  end if;
  if p_quote_version_reference is null
     or p_quote_version_reference !~ '^quote-version:[0-9a-f-]{36}$' then
    raise exception 'QPD05_QUOTE_VERSION_REFERENCE_INVALID';
  end if;
  if p_record is null or jsonb_typeof(p_record) <> 'object' then
    raise exception 'QPD05_RECORD_INVALID';
  end if;
  if public.forge_cartera001b_json_has_forbidden_key(p_record)
     or p_record::text ~* '"(rawPdf|pdfBytes|arrayBuffer|base64|binary|blob|bytes|dataUrl|html)"[[:space:]]*:' then
    raise exception 'QPD05_RECORD_FORBIDDEN_CONTENT';
  end if;
  if coalesce(p_record->>'packetType','') <> 'FORGE_QUOTE_PRINTABLE_VERSION_RECORD'
     or coalesce(p_record->>'contractVersion','') <> 'QPD05_VERSION_REPOSITORY_V1'
     or coalesce((p_record->>'storageSchemaVersion')::integer, 0) <> 1 then
    raise exception 'QPD05_RECORD_INVALID';
  end if;
  if p_idempotency_key is null
     or p_idempotency_key !~ '^[A-Za-z0-9][A-Za-z0-9._:@/-]{0,239}$' then
    raise exception 'QPD05_IDEMPOTENCY_INVALID';
  end if;

  select * into quote_row
  from public.quote_lifecycle_quotes
  where advisor_id = actor_id
    and quote_reference = p_quote_reference;
  if not found then
    raise exception 'QPD05_QUOTE_NOT_OWNED';
  end if;

  select * into version_row
  from public.quote_lifecycle_versions
  where advisor_id = actor_id
    and quote_id = quote_row.id
    and quote_version_reference = p_quote_version_reference;
  if not found then
    raise exception 'QPD05_QUOTE_VERSION_NOT_FOUND';
  end if;

  payload_identity := p_record->'quoteIdentity';
  payload_manifest := p_record->'renderManifest';
  payload_reference := p_record->>'printableVersionReference';
  payload_document_reference := p_record->>'documentReference';
  payload_record_digest := p_record->>'recordDigest';
  payload_source_revision := p_record->>'sourceRevisionHash';
  payload_profile := p_record->>'productProfileId';
  payload_page_format := p_record->>'pageFormat';
  payload_persisted_at := (p_record->>'persistedAt')::timestamptz;

  if payload_identity is null
     or payload_identity->>'quoteReference' <> quote_row.quote_reference
     or payload_identity->>'quoteVersionReference' <> version_row.quote_version_reference
     or payload_identity->>'prospectReference' <> quote_row.prospect_id::text
     or payload_identity->>'productReference' <> quote_row.product_reference
     or payload_identity->>'quoteSnapshotDigest' <> version_row.snapshot_digest then
    raise exception 'QPD05_QUOTE_IDENTITY_MISMATCH';
  end if;
  if payload_reference !~ '^qpd-version:[a-f0-9]{64}$'
     or payload_document_reference !~ '^qpd-document:[a-f0-9]{64}$'
     or payload_record_digest !~ '^[a-f0-9]{64}$'
     or payload_source_revision !~ '^[a-f0-9]{8,128}$'
     or payload_profile !~ '^[A-Z][A-Z0-9_]{1,63}$'
     or payload_page_format not in ('A4','LETTER')
     or payload_persisted_at is null then
    raise exception 'QPD05_RECORD_INVALID';
  end if;
  if payload_manifest is null
     or jsonb_typeof(payload_manifest) <> 'object'
     or payload_manifest->>'mediaType' <> 'application/pdf'
     or coalesce((payload_manifest->>'pageCount')::integer, 0) < 1
     or coalesce((payload_manifest->>'byteLength')::integer, 0) < 1
     or coalesce(payload_manifest->>'binaryRevisionHash','') !~ '^[a-f0-9]{8,128}$' then
    raise exception 'QPD05_RENDER_MANIFEST_INVALID';
  end if;

  select * into existing_row
  from public.quote_printable_document_versions
  where advisor_id = actor_id
    and idempotency_key = p_idempotency_key;
  if found then
    if existing_row.printable_version_reference <> payload_reference
       or existing_row.record_digest <> payload_record_digest
       or existing_row.record_payload <> p_record then
      raise exception 'QPD05_RECORD_CONFLICT';
    end if;
    return jsonb_build_object(
      'printableVersionReference', existing_row.printable_version_reference,
      'documentReference', existing_row.document_reference,
      'quoteReference', existing_row.quote_reference,
      'quoteVersionReference', existing_row.quote_version_reference,
      'recordDigest', existing_row.record_digest,
      'persistedAt', existing_row.persisted_at,
      'idempotentReplay', true
    );
  end if;

  select * into existing_row
  from public.quote_printable_document_versions
  where advisor_id = actor_id
    and printable_version_reference = payload_reference;
  if found then
    if existing_row.record_digest <> payload_record_digest
       or existing_row.record_payload <> p_record then
      raise exception 'QPD05_RECORD_CONFLICT';
    end if;
    return jsonb_build_object(
      'printableVersionReference', existing_row.printable_version_reference,
      'documentReference', existing_row.document_reference,
      'quoteReference', existing_row.quote_reference,
      'quoteVersionReference', existing_row.quote_version_reference,
      'recordDigest', existing_row.record_digest,
      'persistedAt', existing_row.persisted_at,
      'idempotentReplay', true
    );
  end if;

  insert into public.quote_printable_document_versions (
    advisor_id,
    quote_id,
    quote_version_id,
    quote_reference,
    quote_version_reference,
    printable_version_reference,
    document_reference,
    product_profile_id,
    page_format,
    source_revision_hash,
    quote_snapshot_digest,
    record_digest,
    idempotency_key,
    record_payload,
    persisted_at
  ) values (
    actor_id,
    quote_row.id,
    version_row.id,
    quote_row.quote_reference,
    version_row.quote_version_reference,
    payload_reference,
    payload_document_reference,
    payload_profile,
    payload_page_format,
    payload_source_revision,
    version_row.snapshot_digest,
    payload_record_digest,
    p_idempotency_key,
    p_record,
    payload_persisted_at
  ) returning * into inserted_row;

  return jsonb_build_object(
    'printableVersionReference', inserted_row.printable_version_reference,
    'documentReference', inserted_row.document_reference,
    'quoteReference', inserted_row.quote_reference,
    'quoteVersionReference', inserted_row.quote_version_reference,
    'recordDigest', inserted_row.record_digest,
    'persistedAt', inserted_row.persisted_at,
    'idempotentReplay', false
  );
end;
$$;

revoke all on function public.forge_qpd05_append_printable_quote_version(
  text,text,jsonb,text
) from public, anon;
grant execute on function public.forge_qpd05_append_printable_quote_version(
  text,text,jsonb,text
) to authenticated;

create or replace view public.quote_printable_document_history
with (security_invoker = true)
as
select
  quote_reference,
  quote_version_reference,
  printable_version_reference,
  document_reference,
  product_profile_id,
  page_format,
  source_revision_hash,
  quote_snapshot_digest,
  record_digest,
  record_payload,
  persisted_at,
  created_at
from public.quote_printable_document_versions
where advisor_id = auth.uid();

grant select on public.quote_printable_document_history to authenticated;

commit;
