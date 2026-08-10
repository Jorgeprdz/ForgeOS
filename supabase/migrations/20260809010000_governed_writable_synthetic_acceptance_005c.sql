-- FORGE 005C: governed writable synthetic acceptance lifecycle.
-- Public demo behavior remains unchanged. Acceptance identities are separate, non-public,
-- synthetic accounts whose write window expires fail-closed at the database guard.

begin;

alter table public.forge_demo_advisors
  add column if not exists is_acceptance boolean not null default false,
  add column if not exists acceptance_purpose text,
  add column if not exists expires_at timestamptz;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conrelid = 'public.forge_demo_advisors'::regclass
      and conname = 'forge_demo_advisors_acceptance_boundary_ck'
  ) then
    alter table public.forge_demo_advisors
      add constraint forge_demo_advisors_acceptance_boundary_ck check (
        (
          is_acceptance = false
          and acceptance_purpose is null
          and expires_at is null
        )
        or
        (
          is_acceptance = true
          and is_public = false
          and data_class = 'SYNTHETIC'
          and acceptance_purpose = 'AUTOMATED_ACCEPTANCE_ONLY'
          and expires_at is not null
        )
      );
  end if;
end;
$$;

create or replace function public.forge_demo_current_session()
returns jsonb
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select case
    when auth.uid() is null then
      jsonb_build_object(
        'isDemo', false,
        'demoKey', null,
        'dataClass', null,
        'readOnly', false,
        'isPublic', false,
        'isAcceptance', false,
        'acceptancePurpose', null,
        'expiresAt', null
      )
    else coalesce(
      (
        select jsonb_build_object(
          'isDemo', true,
          'demoKey', d.demo_key,
          'dataClass', d.data_class,
          'readOnly', (
            d.read_only = true
            or (
              d.is_acceptance = true
              and (d.expires_at is null or d.expires_at <= now())
            )
          ),
          'isPublic', d.is_public,
          'isAcceptance', d.is_acceptance,
          'acceptancePurpose', d.acceptance_purpose,
          'expiresAt', d.expires_at
        )
        from public.forge_demo_advisors d
        where d.advisor_id = auth.uid()
      ),
      jsonb_build_object(
        'isDemo', false,
        'demoKey', null,
        'dataClass', null,
        'readOnly', false,
        'isPublic', false,
        'isAcceptance', false,
        'acceptancePurpose', null,
        'expiresAt', null
      )
    )
  end;
$$;

revoke all on function public.forge_demo_current_session() from public, anon;
grant execute on function public.forge_demo_current_session() to authenticated;

create or replace function public.forge_demo_read_only_guard()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  if auth.uid() is not null and exists (
    select 1
    from public.forge_demo_advisors d
    where d.advisor_id = auth.uid()
      and (
        d.read_only = true
        or (
          d.is_acceptance = true
          and (d.expires_at is null or d.expires_at <= now())
        )
      )
  ) then
    raise exception 'FORGE_DEMO_ACCOUNT_READ_ONLY'
      using errcode = '42501';
  end if;
  return coalesce(new, old);
end;
$$;

revoke all on function public.forge_demo_read_only_guard() from public, anon, authenticated;

comment on column public.forge_demo_advisors.is_acceptance is
  'True only for non-public synthetic acceptance identities; never for public demo users.';
comment on column public.forge_demo_advisors.acceptance_purpose is
  'Fixed to AUTOMATED_ACCEPTANCE_ONLY for governed acceptance identities.';
comment on column public.forge_demo_advisors.expires_at is
  'Fail-closed write-window expiry for acceptance identities.';

commit;
