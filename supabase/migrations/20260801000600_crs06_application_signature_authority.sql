-- CRS 06 Application and Signature Authority
-- Repository migration. Remote deployment requires a separate explicit gate.

begin;

create extension if not exists pgcrypto;

create or replace function public.forge_crs06_valid_reference_array(p_value jsonb)
returns boolean
language sql
immutable
set search_path = public, pg_temp
as $$
  select p_value is not null
    and jsonb_typeof(p_value) = 'array'
    and jsonb_array_length(p_value) between 1 and 50
    and not exists (
      select 1 from jsonb_array_elements_text(p_value) item
      where item !~ '^[A-Za-z0-9][A-Za-z0-9._:@/-]{0,239}$'
    )
    and (
      select count(*) = count(distinct item)
      from jsonb_array_elements_text(p_value) item
    );
$$;

create table if not exists public.commercial_applications (
  id uuid primary key default gen_random_uuid(),
  application_reference text not null,
  advisor_id uuid not null references auth.users(id) on delete restrict,
  person_id uuid not null,
  quote_reference text not null,
  quote_version_reference text not null,
  prospect_reference text not null,
  product_reference text not null,
  current_version integer not null default 1 check (current_version > 0),
  lifecycle_state text not null check (lifecycle_state in (
    'DRAFT','READY_FOR_SIGNATURE','PARTIALLY_SIGNED','SIGNED','SUBMITTED',
    'REQUIREMENTS_PENDING','REQUIREMENTS_SATISFIED','APPROVED','DECLINED','WITHDRAWN'
  )),
  previous_lifecycle_state text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint commercial_applications_reference_uq unique (advisor_id, application_reference),
  constraint commercial_applications_owner_id_uq unique (advisor_id, id),
  constraint commercial_applications_person_fk foreign key (advisor_id, person_id)
    references public.commercial_people(advisor_id, id) on delete restrict
);

create table if not exists public.application_versions (
  id uuid primary key default gen_random_uuid(),
  application_id uuid not null,
  advisor_id uuid not null references auth.users(id) on delete restrict,
  version_reference text not null,
  version_number integer not null check (version_number > 0),
  document_reference text not null,
  snapshot_digest text not null check (snapshot_digest ~ '^[a-f0-9]{64}$'),
  source_evidence_references jsonb not null check (
    public.forge_crs06_valid_reference_array(source_evidence_references)
  ),
  created_at timestamptz not null default now(),
  correction_of uuid references public.application_versions(id) on delete restrict,
  constraint application_versions_application_fk foreign key (advisor_id, application_id)
    references public.commercial_applications(advisor_id, id) on delete restrict,
  constraint application_versions_reference_uq unique (advisor_id, version_reference),
  constraint application_versions_number_uq unique (advisor_id, application_id, version_number),
  constraint application_versions_owner_id_uq unique (advisor_id, id)
);

create table if not exists public.application_signers (
  id uuid primary key default gen_random_uuid(),
  application_id uuid not null,
  advisor_id uuid not null references auth.users(id) on delete restrict,
  signer_reference text not null,
  signer_role text not null check (signer_role in (
    'APPLICANT','INSURED','OWNER','PAYOR','LEGAL_REPRESENTATIVE','ADVISOR_WITNESS'
  )),
  required boolean not null default true,
  person_reference text,
  signature_state text not null default 'PENDING' check (
    signature_state in ('PENDING','SIGNED','DECLINED','VOIDED')
  ),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint application_signers_application_fk foreign key (advisor_id, application_id)
    references public.commercial_applications(advisor_id, id) on delete restrict,
  constraint application_signers_reference_uq unique (advisor_id, application_id, signer_reference),
  constraint application_signers_owner_id_uq unique (advisor_id, id)
);

create table if not exists public.application_signature_evidence (
  id uuid primary key default gen_random_uuid(),
  application_id uuid not null,
  advisor_id uuid not null references auth.users(id) on delete restrict,
  signature_reference text not null,
  version_reference text not null,
  signer_reference text not null,
  evidence_type text not null check (evidence_type in (
    'PROVIDER_RECEIPT','SIGNED_DOCUMENT_DIGEST','HUMAN_REVIEW_RECEIPT'
  )),
  document_digest text not null check (document_digest ~ '^[a-f0-9]{64}$'),
  provider_reference text,
  signed_at timestamptz not null,
  captured_at timestamptz not null check (captured_at >= signed_at),
  evidence_references jsonb not null check (
    public.forge_crs06_valid_reference_array(evidence_references)
  ),
  confirmation_state text not null check (confirmation_state in ('VERIFIED','DISPUTED')),
  privacy_classification text not null check (
    privacy_classification in ('PRIVATE','SENSITIVE','RESTRICTED')
  ),
  idempotency_key text not null,
  confirmation_reference text not null,
  correction_of uuid references public.application_signature_evidence(id) on delete restrict,
  created_at timestamptz not null default now(),
  constraint application_signature_application_fk foreign key (advisor_id, application_id)
    references public.commercial_applications(advisor_id, id) on delete restrict,
  constraint application_signature_reference_uq unique (advisor_id, signature_reference),
  constraint application_signature_owner_idempotency_uq unique (advisor_id, application_id, idempotency_key)
);

create table if not exists public.application_requirements (
  id uuid primary key default gen_random_uuid(),
  application_id uuid not null,
  advisor_id uuid not null references auth.users(id) on delete restrict,
  requirement_reference text not null,
  requirement_code text not null,
  state text not null check (state in ('OPEN','SATISFIED','WAIVED','DISPUTED')),
  evidence_references jsonb not null default '[]'::jsonb,
  opened_at timestamptz not null,
  resolved_at timestamptz,
  review_reference text,
  correction_of uuid references public.application_requirements(id) on delete restrict,
  updated_at timestamptz not null default now(),
  constraint application_requirements_application_fk foreign key (advisor_id, application_id)
    references public.commercial_applications(advisor_id, id) on delete restrict,
  constraint application_requirements_reference_uq unique (advisor_id, application_id, requirement_reference),
  constraint application_requirements_owner_id_uq unique (advisor_id, id)
);

create table if not exists public.application_events (
  id uuid primary key default gen_random_uuid(),
  application_id uuid not null,
  advisor_id uuid not null references auth.users(id) on delete restrict,
  event_reference text not null,
  event_type text not null check (event_type in (
    'APPLICATION_CREATED','APPLICATION_VERSION_CREATED','APPLICATION_READY_FOR_SIGNATURE',
    'SIGNATURE_RECORDED','APPLICATION_SIGNED','APPLICATION_SUBMITTED',
    'REQUIREMENT_OPENED','REQUIREMENT_SATISFIED','REQUIREMENT_WAIVED',
    'REQUIREMENT_DISPUTED','APPLICATION_APPROVED','APPLICATION_DECLINED','APPLICATION_WITHDRAWN'
  )),
  version_reference text not null,
  lifecycle_state text not null,
  previous_lifecycle_state text,
  occurred_at timestamptz not null,
  recorded_at timestamptz not null default now() check (recorded_at >= occurred_at),
  source_reference text not null,
  evidence_references jsonb not null check (
    public.forge_crs06_valid_reference_array(evidence_references)
  ),
  idempotency_key text not null,
  confirmation_reference text not null,
  correction_of uuid references public.application_events(id) on delete restrict,
  event_digest text not null check (event_digest ~ '^[a-f0-9]{64}$'),
  created_at timestamptz not null default now(),
  constraint application_events_application_fk foreign key (advisor_id, application_id)
    references public.commercial_applications(advisor_id, id) on delete restrict,
  constraint application_events_reference_uq unique (advisor_id, event_reference),
  constraint application_events_owner_idempotency_uq unique (advisor_id, application_id, idempotency_key)
);

create index if not exists commercial_applications_person_idx
  on public.commercial_applications(advisor_id, person_id, updated_at desc);
create index if not exists application_versions_application_idx
  on public.application_versions(advisor_id, application_id, version_number desc);
create index if not exists application_signers_application_idx
  on public.application_signers(advisor_id, application_id, required, signature_state);
create index if not exists application_events_application_idx
  on public.application_events(advisor_id, application_id, occurred_at desc, recorded_at desc);

create or replace function public.forge_crs06_deny_append_only_mutation()
returns trigger
language plpgsql
set search_path = public, pg_temp
as $$
begin
  raise exception 'CRS06_APPEND_ONLY_MUTATION_DENIED';
end;
$$;

drop trigger if exists forge_crs06_versions_append_only on public.application_versions;
create trigger forge_crs06_versions_append_only
before update or delete on public.application_versions
for each row execute function public.forge_crs06_deny_append_only_mutation();

drop trigger if exists forge_crs06_signature_evidence_append_only on public.application_signature_evidence;
create trigger forge_crs06_signature_evidence_append_only
before update or delete on public.application_signature_evidence
for each row execute function public.forge_crs06_deny_append_only_mutation();

drop trigger if exists forge_crs06_events_append_only on public.application_events;
create trigger forge_crs06_events_append_only
before update or delete on public.application_events
for each row execute function public.forge_crs06_deny_append_only_mutation();

alter table public.commercial_applications enable row level security;
alter table public.commercial_applications force row level security;
alter table public.application_versions enable row level security;
alter table public.application_versions force row level security;
alter table public.application_signers enable row level security;
alter table public.application_signers force row level security;
alter table public.application_signature_evidence enable row level security;
alter table public.application_signature_evidence force row level security;
alter table public.application_requirements enable row level security;
alter table public.application_requirements force row level security;
alter table public.application_events enable row level security;
alter table public.application_events force row level security;

revoke all on public.commercial_applications from anon, authenticated;
revoke all on public.application_versions from anon, authenticated;
revoke all on public.application_signers from anon, authenticated;
revoke all on public.application_signature_evidence from anon, authenticated;
revoke all on public.application_requirements from anon, authenticated;
revoke all on public.application_events from anon, authenticated;

drop policy if exists commercial_applications_select_own on public.commercial_applications;
create policy commercial_applications_select_own on public.commercial_applications
for select to authenticated using (advisor_id = auth.uid());
drop policy if exists application_versions_select_own on public.application_versions;
create policy application_versions_select_own on public.application_versions
for select to authenticated using (advisor_id = auth.uid());
drop policy if exists application_signers_select_own on public.application_signers;
create policy application_signers_select_own on public.application_signers
for select to authenticated using (advisor_id = auth.uid());
drop policy if exists application_signature_evidence_select_own on public.application_signature_evidence;
create policy application_signature_evidence_select_own on public.application_signature_evidence
for select to authenticated using (advisor_id = auth.uid());
drop policy if exists application_requirements_select_own on public.application_requirements;
create policy application_requirements_select_own on public.application_requirements
for select to authenticated using (advisor_id = auth.uid());
drop policy if exists application_events_select_own on public.application_events;
create policy application_events_select_own on public.application_events
for select to authenticated using (advisor_id = auth.uid());

grant select on public.commercial_applications to authenticated;
grant select on public.application_versions to authenticated;
grant select on public.application_signers to authenticated;
grant select on public.application_signature_evidence to authenticated;
grant select on public.application_requirements to authenticated;
grant select on public.application_events to authenticated;

create or replace function public.forge_crs06_event_digest(p_value jsonb)
returns text
language sql
immutable
set search_path = public, pg_temp
as $$ select encode(digest(convert_to(p_value::text, 'UTF8'), 'sha256'), 'hex'); $$;

create or replace function public.forge_crs06_create_application(
  p_person_reference text,
  p_quote_reference text,
  p_quote_version_reference text,
  p_prospect_reference text,
  p_product_reference text,
  p_document_reference text,
  p_snapshot_digest text,
  p_source_evidence_references jsonb,
  p_signers jsonb,
  p_occurred_at timestamptz,
  p_idempotency_key text,
  p_confirmation_reference text
)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  actor_id uuid := auth.uid();
  person_row public.commercial_people%rowtype;
  quote_row public.quote_lifecycle_quotes%rowtype;
  quote_version_row public.quote_lifecycle_versions%rowtype;
  application_row public.commercial_applications%rowtype;
  version_row public.application_versions%rowtype;
  existing_event public.application_events%rowtype;
  signer jsonb;
  event_ref text;
begin
  if actor_id is null then raise exception 'CRS06_AUTH_REQUIRED'; end if;
  if coalesce(p_confirmation_reference, '') = '' then raise exception 'CRS06_HUMAN_CONFIRMATION_REQUIRED'; end if;
  if p_snapshot_digest !~ '^[a-f0-9]{64}$' then raise exception 'CRS06_SNAPSHOT_DIGEST_INVALID'; end if;
  if not public.forge_crs06_valid_reference_array(p_source_evidence_references) then raise exception 'CRS06_EVIDENCE_INVALID'; end if;
  if p_signers is null or jsonb_typeof(p_signers) <> 'array' or jsonb_array_length(p_signers) < 1 then raise exception 'CRS06_SIGNERS_REQUIRED'; end if;

  select * into existing_event from public.application_events
  where advisor_id = actor_id and idempotency_key = p_idempotency_key limit 1;
  if found then
    select * into application_row from public.commercial_applications where id = existing_event.application_id;
    if application_row.quote_reference <> p_quote_reference or application_row.product_reference <> p_product_reference then
      raise exception 'CRS06_IDEMPOTENCY_CONFLICT';
    end if;
    return jsonb_build_object('status','IDEMPOTENT_REPLAY','applicationReference',application_row.application_reference,'idempotentReplay',true);
  end if;

  select * into person_row from public.commercial_people
  where advisor_id = actor_id and person_reference = p_person_reference
    and lifecycle_state = 'CONFIRMED' and archived_at is null;
  if not found then raise exception 'CRS06_CONFIRMED_PERSON_REQUIRED'; end if;

  select * into quote_row from public.quote_lifecycle_quotes
  where advisor_id = actor_id and quote_reference = p_quote_reference;
  if not found then raise exception 'CRS06_QUOTE_REQUIRED'; end if;
  select * into quote_version_row from public.quote_lifecycle_versions
  where advisor_id = actor_id and quote_id = quote_row.id
    and quote_version_reference = p_quote_version_reference;
  if not found then raise exception 'CRS06_QUOTE_VERSION_REQUIRED'; end if;
  if quote_row.prospect_id::text <> p_prospect_reference then raise exception 'CRS06_QUOTE_PROSPECT_MISMATCH'; end if;
  if quote_row.product_reference <> p_product_reference then raise exception 'CRS06_QUOTE_PRODUCT_MISMATCH'; end if;

  insert into public.commercial_applications (
    application_reference, advisor_id, person_id, quote_reference, quote_version_reference,
    prospect_reference, product_reference, current_version, lifecycle_state, previous_lifecycle_state,
    created_at, updated_at
  ) values (
    'application:' || gen_random_uuid()::text, actor_id, person_row.id, p_quote_reference,
    p_quote_version_reference, p_prospect_reference, p_product_reference, 1,
    'READY_FOR_SIGNATURE', 'DRAFT', p_occurred_at, now()
  ) returning * into application_row;

  insert into public.application_versions (
    application_id, advisor_id, version_reference, version_number, document_reference,
    snapshot_digest, source_evidence_references, created_at
  ) values (
    application_row.id, actor_id, 'application-version:' || gen_random_uuid()::text, 1,
    p_document_reference, p_snapshot_digest, p_source_evidence_references, p_occurred_at
  ) returning * into version_row;

  for signer in select value from jsonb_array_elements(p_signers)
  loop
    insert into public.application_signers (
      application_id, advisor_id, signer_reference, signer_role, required,
      person_reference, signature_state
    ) values (
      application_row.id, actor_id, signer->>'signerReference', signer->>'role',
      coalesce((signer->>'required')::boolean, true), signer->>'personReference',
      coalesce(signer->>'signatureState','PENDING')
    );
  end loop;

  event_ref := 'application-event:' || gen_random_uuid()::text;
  insert into public.application_events (
    application_id, advisor_id, event_reference, event_type, version_reference,
    lifecycle_state, previous_lifecycle_state, occurred_at, source_reference,
    evidence_references, idempotency_key, confirmation_reference, event_digest
  ) values (
    application_row.id, actor_id, event_ref, 'APPLICATION_READY_FOR_SIGNATURE',
    version_row.version_reference, 'READY_FOR_SIGNATURE', 'DRAFT', p_occurred_at,
    p_quote_reference, p_source_evidence_references, p_idempotency_key,
    p_confirmation_reference, public.forge_crs06_event_digest(jsonb_build_object(
      'eventReference',event_ref,'applicationReference',application_row.application_reference,
      'state','READY_FOR_SIGNATURE','snapshotDigest',p_snapshot_digest
    ))
  );

  return jsonb_build_object(
    'status','CONFIRMED','applicationReference',application_row.application_reference,
    'versionReference',version_row.version_reference,'eventReference',event_ref,
    'idempotentReplay',false,'policyCreated',false,'issuanceEvidenceRequiredForPolicy',true
  );
end;
$$;

create or replace function public.forge_crs06_add_application_version(
  p_application_reference text,
  p_document_reference text,
  p_snapshot_digest text,
  p_source_evidence_references jsonb,
  p_occurred_at timestamptz,
  p_idempotency_key text,
  p_confirmation_reference text,
  p_correction_of text default null
)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  actor_id uuid := auth.uid();
  app public.commercial_applications%rowtype;
  prior public.application_versions%rowtype;
  v public.application_versions%rowtype;
  existing public.application_events%rowtype;
  event_ref text;
begin
  if actor_id is null then raise exception 'CRS06_AUTH_REQUIRED'; end if;
  if coalesce(p_confirmation_reference,'') = '' then raise exception 'CRS06_HUMAN_CONFIRMATION_REQUIRED'; end if;
  select * into app from public.commercial_applications where advisor_id = actor_id and application_reference = p_application_reference for update;
  if not found then raise exception 'CRS06_APPLICATION_REQUIRED'; end if;
  select * into existing from public.application_events where advisor_id = actor_id and application_id = app.id and idempotency_key = p_idempotency_key;
  if found then
    if existing.source_reference <> p_document_reference then raise exception 'CRS06_IDEMPOTENCY_CONFLICT'; end if;
    return jsonb_build_object('status','IDEMPOTENT_REPLAY','applicationReference',app.application_reference,'idempotentReplay',true);
  end if;
  select * into prior from public.application_versions where advisor_id = actor_id and application_id = app.id and version_number = app.current_version;
  insert into public.application_versions (
    application_id, advisor_id, version_reference, version_number, document_reference,
    snapshot_digest, source_evidence_references, created_at, correction_of
  ) values (
    app.id, actor_id, 'application-version:' || gen_random_uuid()::text, app.current_version + 1,
    p_document_reference, p_snapshot_digest, p_source_evidence_references, p_occurred_at,
    case when p_correction_of is null then null else prior.id end
  ) returning * into v;
  update public.commercial_applications set current_version = v.version_number,
    previous_lifecycle_state = lifecycle_state, lifecycle_state = 'READY_FOR_SIGNATURE', updated_at = now()
    where id = app.id;
  update public.application_signers set signature_state = 'PENDING', updated_at = now()
    where application_id = app.id and advisor_id = actor_id and required = true;
  event_ref := 'application-event:' || gen_random_uuid()::text;
  insert into public.application_events (
    application_id,advisor_id,event_reference,event_type,version_reference,lifecycle_state,
    previous_lifecycle_state,occurred_at,source_reference,evidence_references,idempotency_key,
    confirmation_reference,event_digest
  ) values (
    app.id,actor_id,event_ref,'APPLICATION_VERSION_CREATED',v.version_reference,'READY_FOR_SIGNATURE',
    app.lifecycle_state,p_occurred_at,p_document_reference,p_source_evidence_references,p_idempotency_key,
    p_confirmation_reference,public.forge_crs06_event_digest(jsonb_build_object('eventReference',event_ref,'version',v.version_reference))
  );
  return jsonb_build_object('status','CONFIRMED','applicationReference',app.application_reference,'versionReference',v.version_reference,'idempotentReplay',false);
end;
$$;

create or replace function public.forge_crs06_record_signature_evidence(
  p_application_reference text,
  p_version_reference text,
  p_signer_reference text,
  p_signature_reference text,
  p_evidence_type text,
  p_document_digest text,
  p_provider_reference text,
  p_signed_at timestamptz,
  p_captured_at timestamptz,
  p_evidence_references jsonb,
  p_confirmation_state text,
  p_privacy_classification text,
  p_idempotency_key text,
  p_confirmation_reference text,
  p_correction_of text default null
)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  actor_id uuid := auth.uid();
  app public.commercial_applications%rowtype;
  signer public.application_signers%rowtype;
  existing public.application_signature_evidence%rowtype;
  evidence public.application_signature_evidence%rowtype;
  remaining integer;
  next_state text;
  event_ref text;
begin
  if actor_id is null then raise exception 'CRS06_AUTH_REQUIRED'; end if;
  if coalesce(p_confirmation_reference,'') = '' then raise exception 'CRS06_HUMAN_CONFIRMATION_REQUIRED'; end if;
  select * into app from public.commercial_applications where advisor_id = actor_id and application_reference = p_application_reference for update;
  if not found then raise exception 'CRS06_APPLICATION_REQUIRED'; end if;
  select * into existing from public.application_signature_evidence where advisor_id = actor_id and application_id = app.id and idempotency_key = p_idempotency_key;
  if found then
    if existing.document_digest <> p_document_digest or existing.signer_reference <> p_signer_reference then raise exception 'CRS06_IDEMPOTENCY_CONFLICT'; end if;
    return jsonb_build_object('status','IDEMPOTENT_REPLAY','signatureReference',existing.signature_reference,'idempotentReplay',true);
  end if;
  select * into signer from public.application_signers where advisor_id = actor_id and application_id = app.id and signer_reference = p_signer_reference for update;
  if not found then raise exception 'CRS06_SIGNER_REQUIRED'; end if;
  insert into public.application_signature_evidence (
    application_id,advisor_id,signature_reference,version_reference,signer_reference,evidence_type,
    document_digest,provider_reference,signed_at,captured_at,evidence_references,confirmation_state,
    privacy_classification,idempotency_key,confirmation_reference
  ) values (
    app.id,actor_id,p_signature_reference,p_version_reference,p_signer_reference,p_evidence_type,
    p_document_digest,p_provider_reference,p_signed_at,p_captured_at,p_evidence_references,p_confirmation_state,
    p_privacy_classification,p_idempotency_key,p_confirmation_reference
  ) returning * into evidence;
  update public.application_signers set signature_state = case when p_confirmation_state = 'VERIFIED' then 'SIGNED' else signature_state end,
    updated_at = now() where id = signer.id;
  select count(*) into remaining from public.application_signers
    where application_id = app.id and advisor_id = actor_id and required = true and signature_state <> 'SIGNED';
  next_state := case when remaining = 0 then 'SIGNED' else 'PARTIALLY_SIGNED' end;
  update public.commercial_applications set previous_lifecycle_state = lifecycle_state,
    lifecycle_state = next_state, updated_at = now() where id = app.id;
  event_ref := 'application-event:' || gen_random_uuid()::text;
  insert into public.application_events (
    application_id,advisor_id,event_reference,event_type,version_reference,lifecycle_state,
    previous_lifecycle_state,occurred_at,source_reference,evidence_references,idempotency_key,
    confirmation_reference,event_digest
  ) values (
    app.id,actor_id,event_ref,case when remaining = 0 then 'APPLICATION_SIGNED' else 'SIGNATURE_RECORDED' end,
    p_version_reference,next_state,app.lifecycle_state,p_signed_at,p_signature_reference,p_evidence_references,
    p_idempotency_key || ':event',p_confirmation_reference,
    public.forge_crs06_event_digest(jsonb_build_object('eventReference',event_ref,'signatureReference',p_signature_reference,'state',next_state))
  );
  return jsonb_build_object('status','CONFIRMED','signatureReference',evidence.signature_reference,'lifecycleState',next_state,'idempotentReplay',false,'policyCreated',false);
end;
$$;

create or replace function public.forge_crs06_submit_application(
  p_application_reference text,
  p_submission_reference text,
  p_source_evidence_references jsonb,
  p_occurred_at timestamptz,
  p_idempotency_key text,
  p_confirmation_reference text
)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  actor_id uuid := auth.uid(); app public.commercial_applications%rowtype;
  v public.application_versions%rowtype; existing public.application_events%rowtype; event_ref text;
begin
  if actor_id is null then raise exception 'CRS06_AUTH_REQUIRED'; end if;
  if coalesce(p_confirmation_reference,'') = '' then raise exception 'CRS06_HUMAN_CONFIRMATION_REQUIRED'; end if;
  select * into app from public.commercial_applications where advisor_id = actor_id and application_reference = p_application_reference for update;
  if not found then raise exception 'CRS06_APPLICATION_REQUIRED'; end if;
  select * into existing from public.application_events where advisor_id = actor_id and application_id = app.id and idempotency_key = p_idempotency_key;
  if found then
    if existing.source_reference <> p_submission_reference then raise exception 'CRS06_IDEMPOTENCY_CONFLICT'; end if;
    return jsonb_build_object('status','IDEMPOTENT_REPLAY','applicationReference',app.application_reference,'idempotentReplay',true);
  end if;
  if app.lifecycle_state <> 'SIGNED' then raise exception 'CRS06_SIGNED_APPLICATION_REQUIRED'; end if;
  select * into v from public.application_versions where advisor_id = actor_id and application_id = app.id and version_number = app.current_version;
  update public.commercial_applications set previous_lifecycle_state = lifecycle_state,
    lifecycle_state = 'SUBMITTED', updated_at = now() where id = app.id;
  event_ref := 'application-event:' || gen_random_uuid()::text;
  insert into public.application_events (
    application_id,advisor_id,event_reference,event_type,version_reference,lifecycle_state,
    previous_lifecycle_state,occurred_at,source_reference,evidence_references,idempotency_key,
    confirmation_reference,event_digest
  ) values (
    app.id,actor_id,event_ref,'APPLICATION_SUBMITTED',v.version_reference,'SUBMITTED','SIGNED',
    p_occurred_at,p_submission_reference,p_source_evidence_references,p_idempotency_key,
    p_confirmation_reference,public.forge_crs06_event_digest(jsonb_build_object('eventReference',event_ref,'submission',p_submission_reference))
  );
  return jsonb_build_object('status','CONFIRMED','applicationReference',app.application_reference,'lifecycleState','SUBMITTED','idempotentReplay',false,'policyCreated',false);
end;
$$;

create or replace function public.forge_crs06_record_requirement(
  p_application_reference text,
  p_requirement_reference text,
  p_requirement_code text,
  p_state text,
  p_evidence_references jsonb,
  p_opened_at timestamptz,
  p_resolved_at timestamptz,
  p_review_reference text,
  p_idempotency_key text,
  p_confirmation_reference text,
  p_correction_of text default null
)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  actor_id uuid := auth.uid(); app public.commercial_applications%rowtype;
  v public.application_versions%rowtype; existing public.application_events%rowtype; event_ref text;
  event_type text; next_state text;
begin
  if actor_id is null then raise exception 'CRS06_AUTH_REQUIRED'; end if;
  if coalesce(p_confirmation_reference,'') = '' then raise exception 'CRS06_HUMAN_CONFIRMATION_REQUIRED'; end if;
  select * into app from public.commercial_applications where advisor_id = actor_id and application_reference = p_application_reference for update;
  if not found then raise exception 'CRS06_APPLICATION_REQUIRED'; end if;
  select * into existing from public.application_events where advisor_id = actor_id and application_id = app.id and idempotency_key = p_idempotency_key;
  if found then
    if existing.source_reference <> p_requirement_reference then raise exception 'CRS06_IDEMPOTENCY_CONFLICT'; end if;
    return jsonb_build_object('status','IDEMPOTENT_REPLAY','requirementReference',p_requirement_reference,'idempotentReplay',true);
  end if;
  insert into public.application_requirements (
    application_id,advisor_id,requirement_reference,requirement_code,state,evidence_references,
    opened_at,resolved_at,review_reference,updated_at
  ) values (
    app.id,actor_id,p_requirement_reference,p_requirement_code,p_state,coalesce(p_evidence_references,'[]'::jsonb),
    p_opened_at,p_resolved_at,p_review_reference,now()
  ) on conflict (advisor_id,application_id,requirement_reference) do update set
    state = excluded.state,evidence_references = excluded.evidence_references,
    resolved_at = excluded.resolved_at,review_reference = excluded.review_reference,updated_at = now();
  event_type := case p_state when 'OPEN' then 'REQUIREMENT_OPENED' when 'SATISFIED' then 'REQUIREMENT_SATISFIED' when 'WAIVED' then 'REQUIREMENT_WAIVED' else 'REQUIREMENT_DISPUTED' end;
  next_state := case when p_state in ('OPEN','DISPUTED') then 'REQUIREMENTS_PENDING'
    when exists (select 1 from public.application_requirements where application_id = app.id and state in ('OPEN','DISPUTED')) then 'REQUIREMENTS_PENDING'
    else 'REQUIREMENTS_SATISFIED' end;
  update public.commercial_applications set previous_lifecycle_state = lifecycle_state,lifecycle_state = next_state,updated_at = now() where id = app.id;
  select * into v from public.application_versions where advisor_id = actor_id and application_id = app.id and version_number = app.current_version;
  event_ref := 'application-event:' || gen_random_uuid()::text;
  insert into public.application_events (
    application_id,advisor_id,event_reference,event_type,version_reference,lifecycle_state,
    previous_lifecycle_state,occurred_at,source_reference,evidence_references,idempotency_key,
    confirmation_reference,event_digest
  ) values (
    app.id,actor_id,event_ref,event_type,v.version_reference,next_state,app.lifecycle_state,
    coalesce(p_resolved_at,p_opened_at),p_requirement_reference,
    case when jsonb_array_length(coalesce(p_evidence_references,'[]'::jsonb)) = 0 then jsonb_build_array(p_requirement_reference) else p_evidence_references end,
    p_idempotency_key,p_confirmation_reference,
    public.forge_crs06_event_digest(jsonb_build_object('eventReference',event_ref,'requirement',p_requirement_reference,'state',p_state))
  );
  return jsonb_build_object('status','CONFIRMED','requirementReference',p_requirement_reference,'lifecycleState',next_state,'idempotentReplay',false);
end;
$$;

create or replace function public.forge_crs06_record_decision(
  p_application_reference text,
  p_decision text,
  p_decision_reference text,
  p_source_evidence_references jsonb,
  p_occurred_at timestamptz,
  p_idempotency_key text,
  p_confirmation_reference text
)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  actor_id uuid := auth.uid(); app public.commercial_applications%rowtype;
  v public.application_versions%rowtype; existing public.application_events%rowtype; event_ref text;
  next_state text; event_type text;
begin
  if actor_id is null then raise exception 'CRS06_AUTH_REQUIRED'; end if;
  if coalesce(p_confirmation_reference,'') = '' then raise exception 'CRS06_HUMAN_CONFIRMATION_REQUIRED'; end if;
  if p_decision not in ('APPROVED','DECLINED') then raise exception 'CRS06_DECISION_INVALID'; end if;
  select * into app from public.commercial_applications where advisor_id = actor_id and application_reference = p_application_reference for update;
  if not found then raise exception 'CRS06_APPLICATION_REQUIRED'; end if;
  select * into existing from public.application_events where advisor_id = actor_id and application_id = app.id and idempotency_key = p_idempotency_key;
  if found then
    if existing.source_reference <> p_decision_reference then raise exception 'CRS06_IDEMPOTENCY_CONFLICT'; end if;
    return jsonb_build_object('status','IDEMPOTENT_REPLAY','applicationReference',app.application_reference,'idempotentReplay',true);
  end if;
  if p_decision = 'APPROVED' and exists (
    select 1 from public.application_requirements where application_id = app.id and state in ('OPEN','DISPUTED')
  ) then raise exception 'CRS06_UNRESOLVED_REQUIREMENTS_BLOCK_APPROVAL'; end if;
  next_state := p_decision;
  event_type := case when p_decision = 'APPROVED' then 'APPLICATION_APPROVED' else 'APPLICATION_DECLINED' end;
  update public.commercial_applications set previous_lifecycle_state = lifecycle_state,lifecycle_state = next_state,updated_at = now() where id = app.id;
  select * into v from public.application_versions where advisor_id = actor_id and application_id = app.id and version_number = app.current_version;
  event_ref := 'application-event:' || gen_random_uuid()::text;
  insert into public.application_events (
    application_id,advisor_id,event_reference,event_type,version_reference,lifecycle_state,
    previous_lifecycle_state,occurred_at,source_reference,evidence_references,idempotency_key,
    confirmation_reference,event_digest
  ) values (
    app.id,actor_id,event_ref,event_type,v.version_reference,next_state,app.lifecycle_state,
    p_occurred_at,p_decision_reference,p_source_evidence_references,p_idempotency_key,
    p_confirmation_reference,public.forge_crs06_event_digest(jsonb_build_object('eventReference',event_ref,'decision',p_decision))
  );
  return jsonb_build_object(
    'status','CONFIRMED','applicationReference',app.application_reference,'lifecycleState',next_state,
    'idempotentReplay',false,'policyCreated',false,'issuanceEvidenceRequiredForPolicy',true
  );
end;
$$;

grant execute on function public.forge_crs06_create_application(text,text,text,text,text,text,text,jsonb,jsonb,timestamptz,text,text) to authenticated;
grant execute on function public.forge_crs06_add_application_version(text,text,text,jsonb,timestamptz,text,text,text) to authenticated;
grant execute on function public.forge_crs06_record_signature_evidence(text,text,text,text,text,text,text,timestamptz,timestamptz,jsonb,text,text,text,text,text) to authenticated;
grant execute on function public.forge_crs06_submit_application(text,text,jsonb,timestamptz,text,text) to authenticated;
grant execute on function public.forge_crs06_record_requirement(text,text,text,text,jsonb,timestamptz,timestamptz,text,text,text,text) to authenticated;
grant execute on function public.forge_crs06_record_decision(text,text,text,jsonb,timestamptz,text,text) to authenticated;

commit;
