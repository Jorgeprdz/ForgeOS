do $act04b_verify$
declare
  v_rls boolean;
  v_force boolean;
  v_trigger_count integer;
  v_policy_count integer;
  v_temp_users bigint;
  v_temp_rows bigint;
begin
  select
    c.relrowsecurity,
    c.relforcerowsecurity
  into
    v_rls,
    v_force
  from pg_class c
  join pg_namespace n
    on n.oid = c.relnamespace
  where n.nspname = 'public'
    and c.relname = 'activity_records';

  if not coalesce(v_rls, false) or
     not coalesce(v_force, false) then
    raise exception
      'ACT04B_RLS_NOT_FORCED';
  end if;

  if has_table_privilege(
    'authenticated',
    'public.activity_records',
    'select'
  ) then
    raise exception
      'ACT04B_DIRECT_SELECT_PRIVILEGE_PRESENT';
  end if;

  if has_table_privilege(
    'authenticated',
    'public.activity_records',
    'insert'
  ) then
    raise exception
      'ACT04B_DIRECT_INSERT_PRIVILEGE_PRESENT';
  end if;

  if has_function_privilege(
    'anon',
    'public.activity_records_append_v1(jsonb,text)',
    'execute'
  ) then
    raise exception
      'ACT04B_ANON_APPEND_PRIVILEGE_PRESENT';
  end if;

  if not has_function_privilege(
    'authenticated',
    'public.activity_records_append_v1(jsonb,text)',
    'execute'
  ) then
    raise exception
      'ACT04B_AUTH_APPEND_PRIVILEGE_MISSING';
  end if;

  if not (
    select p.prosecdef
    from pg_proc p
    where p.oid =
      'public.activity_records_append_v1(jsonb,text)'::regprocedure
  ) then
    raise exception
      'ACT04B_APPEND_NOT_SECURITY_DEFINER';
  end if;

  select count(*)
  into v_trigger_count
  from pg_trigger
  where tgrelid =
      'public.activity_records'::regclass
    and tgname =
      'forge_activity_records_append_only_guard'
    and not tgisinternal;

  if v_trigger_count <> 1 then
    raise exception
      'ACT04B_APPEND_ONLY_TRIGGER_INVALID';
  end if;

  select count(*)
  into v_policy_count
  from pg_policies
  where schemaname = 'public'
    and tablename = 'activity_records'
    and policyname in (
      'activity_records_select_own',
      'activity_records_insert_own'
    );

  if v_policy_count <> 2 then
    raise exception
      'ACT04B_POLICY_SET_INVALID';
  end if;

  select count(*)
  into v_temp_users
  from auth.users
  where email like
    'act04b-%@forge.invalid';

  select count(*)
  into v_temp_rows
  from public.activity_records
  where id like
    'activity-act04b-%';

  if v_temp_users <> 0 or
     v_temp_rows <> 0 then
    raise exception
      'ACT04B_TEMPORARY_RESIDUE_PRESENT';
  end if;

  if to_regclass(
    'public.activity_event_ledger'
  ) is null then
    raise exception
      'ACT04B_FES_REMOTE_AUTHORITY_MISSING';
  end if;

  if to_regclass(
    'public.prospect_due_actions'
  ) is null then
    raise exception
      'ACT04B_NFAST_REMOTE_AUTHORITY_MISSING';
  end if;
end;
$act04b_verify$;

select
  'ACT04B_REMOTE_VERIFY_PASS'
  as result;
