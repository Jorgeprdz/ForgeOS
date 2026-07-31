-- PIPELINE STAGE / NFAST TIMELINE DIGEST SEARCH PATH REPAIR
-- Supabase installs pgcrypto in a managed extension schema. The NFAST Timeline
-- functions intentionally use a restricted search_path, but they must include
-- the actual pgcrypto schema so digest() can execute during prospect updates.

begin;

do $repair$
declare
  pgcrypto_schema text;
  append_signature constant text :=
    'public.forge_nfast08_append_prospect_timeline_event(uuid,text,timestamptz,text,jsonb,jsonb,text)';
begin
  select namespace.nspname
  into pgcrypto_schema
  from pg_extension extension
  join pg_namespace namespace
    on namespace.oid = extension.extnamespace
  where extension.extname = 'pgcrypto';

  if pgcrypto_schema is null then
    raise exception 'PIPELINE_STAGE_PGCRYPTO_EXTENSION_MISSING';
  end if;

  if to_regprocedure('public.forge_nfast08_capture_pipeline_timeline()') is null then
    raise exception 'PIPELINE_STAGE_TIMELINE_CAPTURE_FUNCTION_MISSING';
  end if;

  if to_regprocedure(append_signature) is null then
    raise exception 'PIPELINE_STAGE_TIMELINE_APPEND_FUNCTION_MISSING';
  end if;

  execute format(
    'alter function public.forge_nfast08_capture_pipeline_timeline() set search_path = public, %I, pg_temp',
    pgcrypto_schema
  );

  execute format(
    'alter function %s set search_path = public, %I, pg_temp',
    append_signature,
    pgcrypto_schema
  );
end;
$repair$;

comment on function public.forge_nfast08_capture_pipeline_timeline() is
  'NFAST-08 prospect Timeline capture. Restricted search_path includes the managed pgcrypto schema required by digest().';

comment on function public.forge_nfast08_append_prospect_timeline_event(uuid,text,timestamptz,text,jsonb,jsonb,text) is
  'NFAST-08 governed Timeline append RPC. Restricted search_path includes the managed pgcrypto schema required by digest().';

commit;
