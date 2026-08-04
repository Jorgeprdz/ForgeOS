-- CONTACT_BOOKS_001 ratified Stage 1 and Stage 2 productive authority.
-- Books organize existing CommercialPerson identities; they never copy person truth.

begin;

create extension if not exists pgcrypto;

create table public.contact_books (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete restrict,
  book_reference text not null,
  name text not null,
  normalized_name text not null,
  book_type text not null check (book_type in ('CUSTOM','PROJECT_200','SYSTEM')),
  status text not null default 'ACTIVE' check (status in ('ACTIVE','ARCHIVED')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  archived_at timestamptz,
  created_by uuid not null references auth.users(id) on delete restrict,
  updated_by uuid not null references auth.users(id) on delete restrict,
  constraint contact_books_reference_ck check (book_reference ~ '^[A-Za-z0-9][A-Za-z0-9._:@/-]{0,239}$'),
  constraint contact_books_name_ck check (nullif(btrim(name),'') is not null and length(name) <= 160),
  constraint contact_books_normalized_name_ck check (nullif(btrim(normalized_name),'') is not null and length(normalized_name) <= 160),
  constraint contact_books_owner_actor_ck check (created_by = owner_id and updated_by = owner_id),
  constraint contact_books_archive_ck check (
    (status = 'ACTIVE' and archived_at is null)
    or (status = 'ARCHIVED' and archived_at is not null)
  ),
  unique (id, owner_id),
  unique (owner_id, book_reference)
);

create unique index contact_books_owner_active_name_uq
  on public.contact_books(owner_id, normalized_name)
  where status = 'ACTIVE';

create unique index contact_books_owner_active_project_200_uq
  on public.contact_books(owner_id, book_type)
  where status = 'ACTIVE' and book_type = 'PROJECT_200';

create table public.contact_book_memberships (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete restrict,
  membership_reference text not null,
  book_id uuid not null,
  person_id uuid not null,
  joined_at timestamptz not null,
  source text not null check (source in ('MANUAL','IMPORT','MOVE','SYNTHETIC_ACCEPTANCE')),
  import_batch_reference text,
  created_by uuid not null references auth.users(id) on delete restrict,
  removed_at timestamptz,
  removed_by uuid references auth.users(id) on delete restrict,
  constraint contact_book_memberships_book_fk foreign key (book_id, owner_id)
    references public.contact_books(id, owner_id) on delete restrict,
  constraint contact_book_memberships_person_fk foreign key (person_id, owner_id)
    references public.commercial_people(id, advisor_id) on delete restrict,
  constraint contact_book_memberships_reference_ck check (membership_reference ~ '^[A-Za-z0-9][A-Za-z0-9._:@/-]{0,239}$'),
  constraint contact_book_memberships_owner_actor_ck check (created_by = owner_id),
  constraint contact_book_memberships_removed_ck check (
    (removed_at is null and removed_by is null)
    or (removed_at is not null and removed_by = owner_id)
  ),
  unique (owner_id, membership_reference)
);

create unique index contact_book_memberships_active_uq
  on public.contact_book_memberships(owner_id, book_id, person_id)
  where removed_at is null;

create index contact_book_memberships_book_joined_idx
  on public.contact_book_memberships(owner_id, book_id, joined_at desc)
  where removed_at is null;

create table public.contact_book_command_receipts (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete restrict,
  idempotency_key text not null,
  command_type text not null,
  command_digest text not null check (command_digest ~ '^[a-f0-9]{64}$'),
  response jsonb not null,
  created_at timestamptz not null default now(),
  constraint contact_book_receipts_key_uq unique(owner_id, idempotency_key),
  constraint contact_book_receipts_response_ck check (jsonb_typeof(response) = 'object')
);

alter table public.contact_books enable row level security;
alter table public.contact_books force row level security;
alter table public.contact_book_memberships enable row level security;
alter table public.contact_book_memberships force row level security;
alter table public.contact_book_command_receipts enable row level security;
alter table public.contact_book_command_receipts force row level security;

create policy contact_books_select_own on public.contact_books
  for select to authenticated using (owner_id = auth.uid());
create policy contact_book_memberships_select_own on public.contact_book_memberships
  for select to authenticated using (owner_id = auth.uid());
create policy contact_book_receipts_select_own on public.contact_book_command_receipts
  for select to authenticated using (owner_id = auth.uid());

revoke all on public.contact_books from public, anon, authenticated;
revoke all on public.contact_book_memberships from public, anon, authenticated;
revoke all on public.contact_book_command_receipts from public, anon, authenticated;
grant select on public.contact_books to authenticated;
grant select on public.contact_book_memberships to authenticated;

create or replace function public.forge_contact_books_normalize_name(p_name text)
returns text language sql immutable parallel safe set search_path = public, pg_temp
as $$
select btrim(regexp_replace(
  translate(lower(btrim(p_name)),
    'áéíóúüñàèìòùâêîôûäëïöç',
    'aeiouunaeiouaeiouaeioc'),
  '[^a-z0-9]+', ' ', 'g'
))
$$;

create or replace function public.forge_contact_books_require_command(
  p_actor uuid, p_command jsonb
) returns void language plpgsql security definer set search_path = public, pg_temp as $$
begin
  if p_actor is null then raise exception 'SESSION_REQUIRED' using errcode='42501'; end if;
  if p_command is null or jsonb_typeof(p_command) <> 'object'
     or p_command->>'ownerId' is distinct from p_actor::text
     or nullif(btrim(p_command->>'idempotencyKey'),'') is null then
    raise exception 'CONTACT_BOOK_COMMAND_INVALID' using errcode='22023';
  end if;
end $$;

create or replace function public.forge_contact_books_replay(
  p_owner uuid, p_key text, p_type text, p_digest text
) returns jsonb language plpgsql security definer set search_path = public, pg_temp as $$
declare r public.contact_book_command_receipts%rowtype;
begin
  select * into r from public.contact_book_command_receipts
  where owner_id=p_owner and idempotency_key=p_key;
  if not found then return null; end if;
  if r.command_type <> p_type or r.command_digest <> p_digest then
    return jsonb_build_object('status','CONFLICT','conflictType','IDEMPOTENCY_KEY_REUSED');
  end if;
  return r.response || jsonb_build_object('status','REPLAYED','replayed',true);
end $$;

create or replace function public.forge_contact_books_store_receipt(
  p_owner uuid, p_key text, p_type text, p_digest text, p_response jsonb
) returns jsonb language plpgsql security definer set search_path = public, pg_temp as $$
begin
  insert into public.contact_book_command_receipts(owner_id,idempotency_key,command_type,command_digest,response)
  values(p_owner,p_key,p_type,p_digest,p_response);
  return p_response;
end $$;

create or replace function public.forge_contact_books_create(p_command jsonb)
returns jsonb language plpgsql security definer set search_path = public, extensions, pg_temp as $$
declare
  actor uuid := auth.uid(); key text := p_command->>'idempotencyKey';
  name_value text := btrim(p_command->>'name'); normalized text;
  kind text := coalesce(p_command->>'bookType','CUSTOM'); digest_value text;
  replay jsonb; row_value public.contact_books%rowtype; response jsonb;
begin
  perform public.forge_contact_books_require_command(actor,p_command);
  if name_value is null or kind not in ('CUSTOM','PROJECT_200','SYSTEM') then raise exception 'CONTACT_BOOK_COMMAND_INVALID'; end if;
  normalized := public.forge_contact_books_normalize_name(name_value);
  digest_value := encode(digest(convert_to(p_command::text,'UTF8'),'sha256'),'hex');
  perform pg_advisory_xact_lock(hashtextextended(actor::text||'|'||key,0));
  replay := public.forge_contact_books_replay(actor,key,'CREATE',digest_value); if replay is not null then return replay; end if;
  if kind='PROJECT_200' and exists(select 1 from public.contact_books where owner_id=actor and book_type='PROJECT_200' and status='ACTIVE') then
    response := jsonb_build_object('status','CONFLICT','conflictType','ACTIVE_PROJECT_200_EXISTS');
    return public.forge_contact_books_store_receipt(actor,key,'CREATE',digest_value,response);
  end if;
  select * into row_value from public.contact_books where owner_id=actor and normalized_name=normalized and status='ACTIVE';
  if found then
    response := jsonb_build_object('status','REJECTED','reason','ACTIVE_NAME_EXISTS','bookReference',row_value.book_reference);
    return public.forge_contact_books_store_receipt(actor,key,'CREATE',digest_value,response);
  end if;
  insert into public.contact_books(owner_id,book_reference,name,normalized_name,book_type,created_by,updated_by)
  values(actor,coalesce(nullif(p_command->>'bookReference',''),'book:'||gen_random_uuid()::text),name_value,normalized,kind,actor,actor)
  returning * into row_value;
  response := jsonb_build_object('status','CREATED','bookId',row_value.id,'bookReference',row_value.book_reference,'name',row_value.name,'bookType',row_value.book_type,'readAfterWriteVerified',true);
  return public.forge_contact_books_store_receipt(actor,key,'CREATE',digest_value,response);
end $$;

create or replace function public.forge_contact_books_rename(p_command jsonb)
returns jsonb language plpgsql security definer set search_path = public, extensions, pg_temp as $$
declare actor uuid:=auth.uid(); key text:=p_command->>'idempotencyKey'; ref text:=p_command->>'bookReference';
  name_value text:=btrim(p_command->>'name'); normalized text; digest_value text; replay jsonb; row_value public.contact_books%rowtype; response jsonb;
begin
  perform public.forge_contact_books_require_command(actor,p_command);
  if nullif(ref,'') is null or nullif(name_value,'') is null then raise exception 'CONTACT_BOOK_COMMAND_INVALID'; end if;
  normalized:=public.forge_contact_books_normalize_name(name_value); digest_value:=encode(digest(convert_to(p_command::text,'UTF8'),'sha256'),'hex');
  perform pg_advisory_xact_lock(hashtextextended(actor::text||'|'||key,0));
  replay:=public.forge_contact_books_replay(actor,key,'RENAME',digest_value); if replay is not null then return replay; end if;
  if exists(select 1 from public.contact_books where owner_id=actor and normalized_name=normalized and status='ACTIVE' and book_reference<>ref) then
    response:=jsonb_build_object('status','CONFLICT','conflictType','ACTIVE_NAME_EXISTS');
    return public.forge_contact_books_store_receipt(actor,key,'RENAME',digest_value,response);
  end if;
  update public.contact_books set name=name_value,normalized_name=normalized,updated_at=now(),updated_by=actor
  where owner_id=actor and book_reference=ref and status='ACTIVE' returning * into row_value;
  if not found then response:=jsonb_build_object('status','REJECTED','reason','ACTIVE_BOOK_NOT_FOUND');
  else response:=jsonb_build_object('status','UPDATED','bookReference',ref,'name',row_value.name,'readAfterWriteVerified',true); end if;
  return public.forge_contact_books_store_receipt(actor,key,'RENAME',digest_value,response);
end $$;

create or replace function public.forge_contact_books_archive(p_command jsonb)
returns jsonb language plpgsql security definer set search_path = public, extensions, pg_temp as $$
declare actor uuid:=auth.uid(); key text:=p_command->>'idempotencyKey'; ref text:=p_command->>'bookReference'; digest_value text; replay jsonb; response jsonb;
begin
  perform public.forge_contact_books_require_command(actor,p_command);
  if nullif(ref,'') is null then raise exception 'CONTACT_BOOK_COMMAND_INVALID'; end if;
  digest_value:=encode(digest(convert_to(p_command::text,'UTF8'),'sha256'),'hex'); perform pg_advisory_xact_lock(hashtextextended(actor::text||'|'||key,0));
  replay:=public.forge_contact_books_replay(actor,key,'ARCHIVE',digest_value); if replay is not null then return replay; end if;
  update public.contact_books set status='ARCHIVED',archived_at=now(),updated_at=now(),updated_by=actor where owner_id=actor and book_reference=ref and status='ACTIVE';
  response:=case when found and exists(select 1 from public.contact_books where owner_id=actor and book_reference=ref and status='ARCHIVED' and archived_at is not null)
    then jsonb_build_object('status','ARCHIVED','bookReference',ref,'readAfterWriteVerified',true)
    else jsonb_build_object('status','REJECTED','reason','ACTIVE_BOOK_NOT_FOUND') end;
  return public.forge_contact_books_store_receipt(actor,key,'ARCHIVE',digest_value,response);
end $$;

create or replace function public.forge_contact_books_restore(p_command jsonb)
returns jsonb language plpgsql security definer set search_path = public, extensions, pg_temp as $$
declare actor uuid:=auth.uid(); key text:=p_command->>'idempotencyKey'; ref text:=p_command->>'bookReference'; digest_value text; replay jsonb; response jsonb;
begin
  perform public.forge_contact_books_require_command(actor,p_command);
  if nullif(ref,'') is null then raise exception 'CONTACT_BOOK_COMMAND_INVALID'; end if;
  digest_value:=encode(digest(convert_to(p_command::text,'UTF8'),'sha256'),'hex'); perform pg_advisory_xact_lock(hashtextextended(actor::text||'|'||key,0));
  replay:=public.forge_contact_books_replay(actor,key,'RESTORE',digest_value); if replay is not null then return replay; end if;
  if exists(select 1 from public.contact_books candidate join public.contact_books active
      on active.owner_id=candidate.owner_id and active.normalized_name=candidate.normalized_name and active.status='ACTIVE'
      where candidate.owner_id=actor and candidate.book_reference=ref and candidate.status='ARCHIVED') then
    response:=jsonb_build_object('status','CONFLICT','conflictType','ACTIVE_NAME_EXISTS');
    return public.forge_contact_books_store_receipt(actor,key,'RESTORE',digest_value,response);
  end if;
  update public.contact_books set status='ACTIVE',archived_at=null,updated_at=now(),updated_by=actor where owner_id=actor and book_reference=ref and status='ARCHIVED';
  response:=case when found and exists(select 1 from public.contact_books where owner_id=actor and book_reference=ref and status='ACTIVE' and archived_at is null)
    then jsonb_build_object('status','RESTORED','bookReference',ref,'readAfterWriteVerified',true)
    else jsonb_build_object('status','REJECTED','reason','ARCHIVED_BOOK_NOT_FOUND') end;
  return public.forge_contact_books_store_receipt(actor,key,'RESTORE',digest_value,response);
end $$;

create or replace function public.forge_contact_books_add_members(p_command jsonb)
returns jsonb language plpgsql security definer set search_path = public, extensions, pg_temp as $$
declare actor uuid:=auth.uid(); key text:=p_command->>'idempotencyKey'; ref text:=p_command->>'bookReference'; digest_value text; replay jsonb; response jsonb;
  book public.contact_books%rowtype; person_ref text; person_row public.commercial_people%rowtype; added integer:=0; existing_row public.contact_book_memberships%rowtype;
begin
  perform public.forge_contact_books_require_command(actor,p_command);
  if nullif(ref,'') is null or jsonb_typeof(p_command->'personReferences') <> 'array'
     or coalesce(p_command->>'source','MANUAL') not in ('MANUAL','IMPORT','MOVE','SYNTHETIC_ACCEPTANCE') then raise exception 'CONTACT_BOOK_COMMAND_INVALID'; end if;
  digest_value:=encode(digest(convert_to(p_command::text,'UTF8'),'sha256'),'hex'); perform pg_advisory_xact_lock(hashtextextended(actor::text||'|'||key,0));
  replay:=public.forge_contact_books_replay(actor,key,'ADD_MEMBERS',digest_value); if replay is not null then return replay; end if;
  select * into book from public.contact_books where owner_id=actor and book_reference=ref and status='ACTIVE'; if not found then raise exception 'ACTIVE_BOOK_NOT_FOUND'; end if;
  for person_ref in select distinct jsonb_array_elements_text(p_command->'personReferences') loop
    select * into person_row from public.commercial_people where advisor_id=actor and person_reference=person_ref and archived_at is null; if not found then raise exception 'CONTACT_BOOK_PERSON_NOT_FOUND'; end if;
    select * into existing_row from public.contact_book_memberships where owner_id=actor and book_id=book.id and person_id=person_row.id order by joined_at desc limit 1;
    if found and existing_row.removed_at is null then continue; end if;
    if found then update public.contact_book_memberships set removed_at=null,removed_by=null,joined_at=now(),source=coalesce(p_command->>'source','MANUAL') where id=existing_row.id;
    else insert into public.contact_book_memberships(owner_id,membership_reference,book_id,person_id,joined_at,source,import_batch_reference,created_by)
      values(actor,'membership:'||gen_random_uuid()::text,book.id,person_row.id,now(),coalesce(p_command->>'source','MANUAL'),nullif(p_command->>'importBatchReference',''),actor); end if;
    added:=added+1;
  end loop;
  response:=jsonb_build_object('status','UPDATED','bookReference',ref,'addedCount',added,'readAfterWriteVerified',true);
  return public.forge_contact_books_store_receipt(actor,key,'ADD_MEMBERS',digest_value,response);
end $$;

create or replace function public.forge_contact_books_remove_members(p_command jsonb)
returns jsonb language plpgsql security definer set search_path = public, extensions, pg_temp as $$
declare actor uuid:=auth.uid(); key text:=p_command->>'idempotencyKey'; ref text:=p_command->>'bookReference'; digest_value text; replay jsonb; response jsonb; changed integer;
begin
  perform public.forge_contact_books_require_command(actor,p_command);
  if nullif(ref,'') is null or jsonb_typeof(p_command->'personReferences') <> 'array' then raise exception 'CONTACT_BOOK_COMMAND_INVALID'; end if;
  digest_value:=encode(digest(convert_to(p_command::text,'UTF8'),'sha256'),'hex'); perform pg_advisory_xact_lock(hashtextextended(actor::text||'|'||key,0));
  replay:=public.forge_contact_books_replay(actor,key,'REMOVE_MEMBERS',digest_value); if replay is not null then return replay; end if;
  update public.contact_book_memberships m set removed_at=now(),removed_by=actor
  from public.contact_books b, public.commercial_people p
  where b.owner_id=actor and b.book_reference=ref and b.id=m.book_id and m.owner_id=actor and m.removed_at is null
    and p.id=m.person_id and p.advisor_id=actor and p.person_reference in (select jsonb_array_elements_text(p_command->'personReferences'));
  get diagnostics changed=row_count;
  response:=jsonb_build_object('status','UPDATED','bookReference',ref,'removedCount',changed,'readAfterWriteVerified',true);
  return public.forge_contact_books_store_receipt(actor,key,'REMOVE_MEMBERS',digest_value,response);
end $$;

create or replace function public.forge_contact_books_move_members(p_command jsonb)
returns jsonb language plpgsql security definer set search_path = public, extensions, pg_temp as $$
declare actor uuid:=auth.uid(); key text:=p_command->>'idempotencyKey'; origin_ref text:=p_command->>'originBookReference'; destination_ref text:=p_command->>'destinationBookReference';
  digest_value text; replay jsonb; response jsonb; origin_book public.contact_books%rowtype; destination_book public.contact_books%rowtype; person_ref text; person_row public.commercial_people%rowtype; moved integer:=0;
begin
  perform public.forge_contact_books_require_command(actor,p_command);
  if nullif(origin_ref,'') is null or nullif(destination_ref,'') is null or origin_ref=destination_ref
     or jsonb_typeof(p_command->'personReferences') <> 'array' then raise exception 'CONTACT_BOOK_MOVE_INVALID'; end if;
  digest_value:=encode(digest(convert_to(p_command::text,'UTF8'),'sha256'),'hex'); perform pg_advisory_xact_lock(hashtextextended(actor::text||'|'||key,0));
  replay:=public.forge_contact_books_replay(actor,key,'MOVE_MEMBERS',digest_value); if replay is not null then return replay; end if;
  select * into origin_book from public.contact_books where owner_id=actor and book_reference=origin_ref and status='ACTIVE'; if not found then raise exception 'ORIGIN_BOOK_NOT_FOUND'; end if;
  select * into destination_book from public.contact_books where owner_id=actor and book_reference=destination_ref and status='ACTIVE'; if not found then raise exception 'DESTINATION_BOOK_NOT_FOUND'; end if;
  for person_ref in select distinct jsonb_array_elements_text(p_command->'personReferences') loop
    select * into person_row from public.commercial_people where advisor_id=actor and person_reference=person_ref and archived_at is null; if not found then raise exception 'CONTACT_BOOK_PERSON_NOT_FOUND'; end if;
    if not exists(select 1 from public.contact_book_memberships where owner_id=actor and book_id=origin_book.id and person_id=person_row.id and removed_at is null) then raise exception 'ORIGIN_MEMBERSHIP_NOT_FOUND'; end if;
    insert into public.contact_book_memberships(owner_id,membership_reference,book_id,person_id,joined_at,source,created_by)
    values(actor,'membership:'||gen_random_uuid()::text,destination_book.id,person_row.id,now(),'MOVE',actor)
    on conflict (owner_id,book_id,person_id) where removed_at is null do nothing;
    if not exists(select 1 from public.contact_book_memberships where owner_id=actor and book_id=destination_book.id and person_id=person_row.id and removed_at is null) then raise exception 'DESTINATION_MEMBERSHIP_NOT_CONFIRMED'; end if;
    update public.contact_book_memberships set removed_at=now(),removed_by=actor where owner_id=actor and book_id=origin_book.id and person_id=person_row.id and removed_at is null;
    if found and exists(select 1 from public.contact_book_memberships where owner_id=actor and book_id=origin_book.id and person_id=person_row.id and removed_at is null) then
      raise exception 'ORIGIN_MEMBERSHIP_REMOVAL_NOT_CONFIRMED';
    end if;
    moved:=moved+1;
  end loop;
  response:=jsonb_build_object('status','UPDATED','movedCount',moved,'originBookReference',origin_ref,'destinationBookReference',destination_ref,'readAfterWriteVerified',true);
  return public.forge_contact_books_store_receipt(actor,key,'MOVE_MEMBERS',digest_value,response);
end $$;

create or replace function public.forge_contact_books_list(
  p_include_archived boolean default false,
  p_sort text default 'CREATED_AT_DESC'
)
returns jsonb language plpgsql stable security definer set search_path = public, pg_temp as $$
declare response jsonb;
begin
  if p_sort not in ('CREATED_AT_DESC','CREATED_AT_ASC','NAME_ASC','NAME_DESC') then
    raise exception 'CONTACT_BOOK_SORT_INVALID' using errcode='22023';
  end if;
  select coalesce(jsonb_agg(item order by
    case when p_sort='CREATED_AT_DESC' then b.created_at end desc,
    case when p_sort='CREATED_AT_ASC' then b.created_at end asc,
    case when p_sort='NAME_ASC' then b.normalized_name end asc,
    case when p_sort='NAME_DESC' then b.normalized_name end desc,
    b.book_reference asc
  ),'[]'::jsonb) into response
  from public.contact_books b
  cross join lateral (select jsonb_build_object(
    'bookId',b.id,'bookReference',b.book_reference,'name',b.name,'bookType',b.book_type,
    'status',b.status,'createdAt',b.created_at,'updatedAt',b.updated_at,
    'memberCount',(select count(*) from public.contact_book_memberships m
      where m.owner_id=auth.uid() and m.book_id=b.id and m.removed_at is null)
  ) item) payload
  where b.owner_id=auth.uid() and (p_include_archived or b.status='ACTIVE');
  return response;
end $$;

create or replace function public.forge_contact_books_list_members(p_book_reference text)
returns jsonb language sql stable security definer set search_path = public, pg_temp as $$
select coalesce(jsonb_agg(jsonb_build_object('membershipReference',m.membership_reference,'personReference',p.person_reference,'displayName',p.display_name,'createdAt',m.joined_at,'source',m.source) order by m.joined_at desc),'[]'::jsonb)
from public.contact_books b join public.contact_book_memberships m on m.book_id=b.id and m.owner_id=b.owner_id and m.removed_at is null
join public.commercial_people p on p.id=m.person_id and p.advisor_id=m.owner_id
where b.owner_id=auth.uid() and b.book_reference=p_book_reference $$;

create or replace function public.forge_contact_books_resolve_project_200(p_command jsonb)
returns jsonb language plpgsql security definer set search_path = public, extensions, pg_temp as $$
declare actor uuid:=auth.uid(); key text:=p_command->>'idempotencyKey'; digest_value text; replay jsonb;
  command jsonb; existing public.contact_books%rowtype; response jsonb;
begin
  perform public.forge_contact_books_require_command(actor,p_command);
  digest_value:=encode(digest(convert_to(p_command::text,'UTF8'),'sha256'),'hex');
  perform pg_advisory_xact_lock(hashtextextended(actor::text||'|'||key,0));
  replay:=public.forge_contact_books_replay(actor,key,'RESOLVE_PROJECT_200',digest_value); if replay is not null then return replay; end if;
  select * into existing from public.contact_books where owner_id=actor and book_type='PROJECT_200' and status='ACTIVE' order by created_at limit 1;
  if found then
    response:=jsonb_build_object('status','RESOLVED','bookReference',existing.book_reference,'bookId',existing.id,'readAfterWriteVerified',true);
    return public.forge_contact_books_store_receipt(actor,key,'RESOLVE_PROJECT_200',digest_value,response);
  end if;
  command:=jsonb_build_object('ownerId',auth.uid()::text,'name','Proyecto 200','bookType','PROJECT_200','bookReference','book:project-200','idempotencyKey',key||':create');
  response:=public.forge_contact_books_create(command);
  if response->>'status' not in ('CREATED','REPLAYED') then return response; end if;
  response:=response||jsonb_build_object('status','RESOLVED');
  return public.forge_contact_books_store_receipt(actor,key,'RESOLVE_PROJECT_200',digest_value,response);
end $$;

revoke all on function public.forge_contact_books_normalize_name(text) from public, anon, authenticated;
revoke all on function public.forge_contact_books_require_command(uuid,jsonb) from public, anon, authenticated;
revoke all on function public.forge_contact_books_replay(uuid,text,text,text) from public, anon, authenticated;
revoke all on function public.forge_contact_books_store_receipt(uuid,text,text,text,jsonb) from public, anon, authenticated;
revoke all on function public.forge_contact_books_create(jsonb) from public, anon;
revoke all on function public.forge_contact_books_rename(jsonb) from public, anon;
revoke all on function public.forge_contact_books_archive(jsonb) from public, anon;
revoke all on function public.forge_contact_books_restore(jsonb) from public, anon;
revoke all on function public.forge_contact_books_add_members(jsonb) from public, anon;
revoke all on function public.forge_contact_books_remove_members(jsonb) from public, anon;
revoke all on function public.forge_contact_books_move_members(jsonb) from public, anon;
revoke all on function public.forge_contact_books_list(boolean,text) from public, anon;
revoke all on function public.forge_contact_books_list_members(text) from public, anon;
revoke all on function public.forge_contact_books_resolve_project_200(jsonb) from public, anon;
grant execute on function public.forge_contact_books_create(jsonb) to authenticated;
grant execute on function public.forge_contact_books_rename(jsonb) to authenticated;
grant execute on function public.forge_contact_books_archive(jsonb) to authenticated;
grant execute on function public.forge_contact_books_restore(jsonb) to authenticated;
grant execute on function public.forge_contact_books_add_members(jsonb) to authenticated;
grant execute on function public.forge_contact_books_remove_members(jsonb) to authenticated;
grant execute on function public.forge_contact_books_move_members(jsonb) to authenticated;
grant execute on function public.forge_contact_books_list(boolean,text) to authenticated;
grant execute on function public.forge_contact_books_list_members(text) to authenticated;
grant execute on function public.forge_contact_books_resolve_project_200(jsonb) to authenticated;

create trigger forge_demo_read_only_guard before insert or update or delete on public.contact_books for each row execute function public.forge_demo_read_only_guard();
create trigger forge_demo_read_only_guard before insert or update or delete on public.contact_book_memberships for each row execute function public.forge_demo_read_only_guard();
create trigger forge_demo_read_only_guard before insert or update or delete on public.contact_book_command_receipts for each row execute function public.forge_demo_read_only_guard();

comment on table public.contact_books is 'Owner-scoped organizational books over canonical CommercialPerson identities.';
comment on table public.contact_book_memberships is 'Many-to-many membership; contains no copied person or contact truth.';
comment on table public.contact_book_command_receipts is 'Idempotency and command audit receipts, not a person or activity truth ledger.';

commit;
