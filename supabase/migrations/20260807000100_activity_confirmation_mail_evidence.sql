-- Activity daily human confirmation + privacy-safe mail evidence suggestions.
-- Suggestions never become points or policy truth without explicit advisor confirmation.
begin;

create extension if not exists pgcrypto;

create or replace function public.forge_activity_confirmation_append_only_guard()
returns trigger
language plpgsql
set search_path = public, pg_temp
as $$
begin
  raise exception 'ACTIVITY_CONFIRMATION_APPEND_ONLY';
end;
$$;

create table if not exists public.activity_metric_confirmations (
  id uuid primary key default gen_random_uuid(),
  advisor_id uuid not null references auth.users(id) on delete restrict,
  activity_date date not null,
  metric_key text not null check (metric_key in (
    'referidos','llamadas','citas_agendadas','citas_iniciales','citas_cierre',
    'solicitudes_firmadas','polizas_pagadas','referido_asesor'
  )),
  suggested_value integer check (suggested_value is null or suggested_value between 0 and 999),
  confirmed_value integer not null check (confirmed_value between 0 and 999),
  suggestion_sources jsonb not null default '[]'::jsonb check (jsonb_typeof(suggestion_sources) = 'array'),
  confirmation_kind text not null check (confirmation_kind in ('CONFIRMED','CORRECTED')),
  correction_of uuid,
  correction_reason text,
  idempotency_key text not null,
  confirmed_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  constraint activity_metric_confirmation_idempotency_uq unique (advisor_id, idempotency_key),
  constraint activity_metric_confirmation_owner_id_uq unique (advisor_id, id),
  constraint activity_metric_confirmation_correction_fk
    foreign key (advisor_id, correction_of)
    references public.activity_metric_confirmations(advisor_id, id)
    on delete restrict,
  constraint activity_metric_confirmation_correction_ck check (
    (correction_of is null and confirmation_kind = 'CONFIRMED' and correction_reason is null)
    or
    (correction_of is not null and confirmation_kind = 'CORRECTED' and correction_reason is not null)
  )
);

create index if not exists activity_metric_confirmations_day_idx
  on public.activity_metric_confirmations(advisor_id, activity_date, metric_key, confirmed_at desc, created_at desc);

create trigger activity_metric_confirmations_append_only
before update or delete on public.activity_metric_confirmations
for each row execute function public.forge_activity_confirmation_append_only_guard();

alter table public.activity_metric_confirmations enable row level security;
alter table public.activity_metric_confirmations force row level security;
revoke all on public.activity_metric_confirmations from anon, authenticated;
grant select on public.activity_metric_confirmations to authenticated;
create policy activity_metric_confirmations_select_own
on public.activity_metric_confirmations
for select to authenticated
using (advisor_id = auth.uid());

create table if not exists public.activity_mail_evidence_suggestions (
  id uuid primary key default gen_random_uuid(),
  advisor_id uuid not null references auth.users(id) on delete restrict,
  provider text not null check (provider in ('GMAIL','MICROSOFT_GRAPH','GENERIC_IMAP')),
  provider_message_ref text not null check (provider_message_ref ~ '^[a-f0-9]{64}$'),
  received_at timestamptz not null,
  sender_domain text,
  subject_digest text not null check (subject_digest ~ '^[a-f0-9]{64}$'),
  policy_reference_hint text,
  suggestion_type text not null check (suggestion_type = 'POLICY_PAYMENT_CONFIRMED'),
  suggested_metric text not null check (suggested_metric = 'polizas_pagadas'),
  suggested_value integer not null default 1 check (suggested_value = 1),
  confidence numeric not null check (confidence >= 0 and confidence <= 1),
  detector_version text not null,
  evidence_references jsonb not null default '[]'::jsonb check (jsonb_typeof(evidence_references) = 'array'),
  created_at timestamptz not null default now(),
  constraint activity_mail_evidence_provider_message_uq unique (advisor_id, provider, provider_message_ref)
);

create index if not exists activity_mail_evidence_day_idx
  on public.activity_mail_evidence_suggestions(advisor_id, received_at desc);

create trigger activity_mail_evidence_append_only
before update or delete on public.activity_mail_evidence_suggestions
for each row execute function public.forge_activity_confirmation_append_only_guard();

alter table public.activity_mail_evidence_suggestions enable row level security;
alter table public.activity_mail_evidence_suggestions force row level security;
revoke all on public.activity_mail_evidence_suggestions from anon, authenticated;
grant select on public.activity_mail_evidence_suggestions to authenticated;
create policy activity_mail_evidence_select_own
on public.activity_mail_evidence_suggestions
for select to authenticated
using (advisor_id = auth.uid());

-- One user action confirms all eight metrics atomically. If any metric is invalid,
-- the PostgreSQL transaction rolls back the whole daily reconciliation.
create or replace function public.forge_activity_confirm_daily_metrics(p_payload jsonb)
returns jsonb
language plpgsql
security definer
set search_path = public, auth, pg_temp
as $$
declare
  advisor uuid := auth.uid();
  activity_date_value date;
  metrics_value jsonb;
  batch_idempotency_key text;
  item jsonb;
  metric_key_value text;
  suggested_value_value integer;
  confirmed_value_value integer;
  suggestion_sources_value jsonb;
  correction_of_value uuid;
  correction_reason_value text;
  row_idempotency_key text;
  confirmation_kind_value text;
  expected_metric_keys text[] := array[
    'referidos','llamadas','citas_agendadas','citas_iniciales','citas_cierre',
    'solicitudes_firmadas','polizas_pagadas','referido_asesor'
  ];
  seen_metric_keys text[] := array[]::text[];
  latest record;
  existing record;
  inserted public.activity_metric_confirmations;
  result_rows jsonb := '[]'::jsonb;
  inserted_count integer := 0;
begin
  if advisor is null then raise exception 'ACTIVITY_CONFIRMATION_AUTH_REQUIRED'; end if;
  if p_payload is null or jsonb_typeof(p_payload) <> 'object' then raise exception 'ACTIVITY_CONFIRMATION_PAYLOAD_INVALID'; end if;
  if exists (
    select 1 from jsonb_object_keys(p_payload) key
    where key not in ('activityDate','metrics','idempotencyKey')
  ) then raise exception 'ACTIVITY_CONFIRMATION_FIELD_DENIED'; end if;

  activity_date_value := nullif(p_payload->>'activityDate','')::date;
  metrics_value := p_payload->'metrics';
  batch_idempotency_key := nullif(btrim(p_payload->>'idempotencyKey'),'');

  if activity_date_value is null or metrics_value is null or jsonb_typeof(metrics_value) <> 'array'
    or jsonb_array_length(metrics_value) <> 8 or batch_idempotency_key is null then
    raise exception 'ACTIVITY_CONFIRMATION_REQUIRED_INPUT_MISSING';
  end if;
  if batch_idempotency_key !~ '^[A-Za-z0-9][A-Za-z0-9._:@/-]{0,119}$' then
    raise exception 'ACTIVITY_CONFIRMATION_IDEMPOTENCY_INVALID';
  end if;

  -- Serialize confirmations for the same advisor/day so two tabs cannot fork a correction chain.
  perform pg_advisory_xact_lock(hashtextextended(advisor::text || ':' || activity_date_value::text, 0));

  for item in select value from jsonb_array_elements(metrics_value)
  loop
    if item is null or jsonb_typeof(item) <> 'object' then
      raise exception 'ACTIVITY_CONFIRMATION_METRIC_PAYLOAD_INVALID';
    end if;
    if exists (
      select 1 from jsonb_object_keys(item) key
      where key not in ('metricKey','suggestedValue','confirmedValue','suggestionSources','correctionOf','correctionReason')
    ) then raise exception 'ACTIVITY_CONFIRMATION_METRIC_FIELD_DENIED'; end if;

    metric_key_value := nullif(item->>'metricKey','');
    suggested_value_value := nullif(item->>'suggestedValue','')::integer;
    confirmed_value_value := nullif(item->>'confirmedValue','')::integer;
    suggestion_sources_value := coalesce(item->'suggestionSources','[]'::jsonb);
    correction_of_value := nullif(item->>'correctionOf','')::uuid;
    correction_reason_value := nullif(btrim(item->>'correctionReason'),'');

    if metric_key_value is null or not (metric_key_value = any(expected_metric_keys)) then
      raise exception 'ACTIVITY_CONFIRMATION_METRIC_INVALID';
    end if;
    if metric_key_value = any(seen_metric_keys) then
      raise exception 'ACTIVITY_CONFIRMATION_METRIC_DUPLICATE';
    end if;
    seen_metric_keys := array_append(seen_metric_keys, metric_key_value);

    if confirmed_value_value is null or confirmed_value_value < 0 or confirmed_value_value > 999
      or (suggested_value_value is not null and (suggested_value_value < 0 or suggested_value_value > 999)) then
      raise exception 'ACTIVITY_CONFIRMATION_VALUE_INVALID';
    end if;
    if jsonb_typeof(suggestion_sources_value) <> 'array' then
      raise exception 'ACTIVITY_CONFIRMATION_SOURCES_INVALID';
    end if;

    row_idempotency_key := batch_idempotency_key || ':' || metric_key_value;
    select * into existing
    from public.activity_metric_confirmations
    where advisor_id = advisor and idempotency_key = row_idempotency_key;

    if existing.id is not null then
      if existing.activity_date <> activity_date_value
        or existing.metric_key <> metric_key_value
        or existing.confirmed_value <> confirmed_value_value then
        raise exception 'ACTIVITY_CONFIRMATION_IDEMPOTENT_REPLAY_MISMATCH';
      end if;
      result_rows := result_rows || jsonb_build_array(jsonb_build_object(
        'id', existing.id,
        'metricKey', existing.metric_key,
        'confirmedValue', existing.confirmed_value,
        'state', 'IDEMPOTENT_REPLAY'
      ));
      continue;
    end if;

    select * into latest
    from public.activity_metric_confirmations
    where advisor_id = advisor
      and activity_date = activity_date_value
      and metric_key = metric_key_value
    order by confirmed_at desc, created_at desc, id desc
    limit 1;

    if latest.id is null then
      if correction_of_value is not null or correction_reason_value is not null then
        raise exception 'ACTIVITY_CONFIRMATION_UNEXPECTED_CORRECTION';
      end if;
      confirmation_kind_value := 'CONFIRMED';
    else
      if correction_of_value is null or correction_of_value <> latest.id then
        raise exception 'ACTIVITY_CONFIRMATION_LATEST_CORRECTION_REQUIRED';
      end if;
      if correction_reason_value is null then
        raise exception 'ACTIVITY_CONFIRMATION_CORRECTION_REASON_REQUIRED';
      end if;
      confirmation_kind_value := 'CORRECTED';
    end if;

    insert into public.activity_metric_confirmations(
      advisor_id, activity_date, metric_key, suggested_value, confirmed_value,
      suggestion_sources, confirmation_kind, correction_of, correction_reason, idempotency_key
    ) values (
      advisor, activity_date_value, metric_key_value, suggested_value_value, confirmed_value_value,
      suggestion_sources_value, confirmation_kind_value, correction_of_value, correction_reason_value, row_idempotency_key
    ) returning * into inserted;

    inserted_count := inserted_count + 1;
    result_rows := result_rows || jsonb_build_array(jsonb_build_object(
      'id', inserted.id,
      'metricKey', inserted.metric_key,
      'confirmedValue', inserted.confirmed_value,
      'confirmationKind', inserted.confirmation_kind,
      'state', 'RECORDED'
    ));
  end loop;

  if array_length(seen_metric_keys, 1) <> 8 then
    raise exception 'ACTIVITY_CONFIRMATION_ALL_METRICS_REQUIRED';
  end if;

  return jsonb_build_object(
    'state', case when inserted_count = 0 then 'IDEMPOTENT_REPLAY' else 'RECORDED' end,
    'activityDate', activity_date_value,
    'metricCount', 8,
    'rows', result_rows
  );
end;
$$;

revoke all on function public.forge_activity_confirm_daily_metrics(jsonb) from public, anon;
grant execute on function public.forge_activity_confirm_daily_metrics(jsonb) to authenticated;

create or replace function public.forge_activity_record_mail_suggestion(p_payload jsonb)
returns jsonb
language plpgsql
security definer
set search_path = public, auth, pg_temp
as $$
declare
  advisor uuid := auth.uid();
  provider_value text;
  provider_message_ref_value text;
  received_at_value timestamptz;
  sender_domain_value text;
  subject_digest_value text;
  policy_reference_hint_value text;
  suggestion_type_value text;
  suggested_metric_value text;
  suggested_value_value integer;
  confidence_value numeric;
  detector_version_value text;
  evidence_references_value jsonb;
  inserted public.activity_mail_evidence_suggestions;
begin
  if advisor is null then raise exception 'MAIL_EVIDENCE_AUTH_REQUIRED'; end if;
  if p_payload is null or jsonb_typeof(p_payload) <> 'object' then raise exception 'MAIL_EVIDENCE_PAYLOAD_INVALID'; end if;
  if exists (
    select 1 from jsonb_object_keys(p_payload) key
    where key not in ('provider','providerMessageRef','receivedAt','senderDomain','subjectDigest','policyReferenceHint','suggestionType','suggestedMetric','suggestedValue','confidence','detectorVersion','evidenceReferences')
  ) then raise exception 'MAIL_EVIDENCE_FIELD_DENIED'; end if;

  provider_value := nullif(p_payload->>'provider','');
  provider_message_ref_value := nullif(p_payload->>'providerMessageRef','');
  received_at_value := nullif(p_payload->>'receivedAt','')::timestamptz;
  sender_domain_value := nullif(lower(btrim(p_payload->>'senderDomain')),'');
  subject_digest_value := nullif(p_payload->>'subjectDigest','');
  policy_reference_hint_value := nullif(btrim(p_payload->>'policyReferenceHint'),'');
  suggestion_type_value := nullif(p_payload->>'suggestionType','');
  suggested_metric_value := nullif(p_payload->>'suggestedMetric','');
  suggested_value_value := nullif(p_payload->>'suggestedValue','')::integer;
  confidence_value := nullif(p_payload->>'confidence','')::numeric;
  detector_version_value := nullif(btrim(p_payload->>'detectorVersion'),'');
  evidence_references_value := coalesce(p_payload->'evidenceReferences','[]'::jsonb);

  if provider_value not in ('GMAIL','MICROSOFT_GRAPH','GENERIC_IMAP')
    or provider_message_ref_value !~ '^[a-f0-9]{64}$'
    or received_at_value is null
    or subject_digest_value !~ '^[a-f0-9]{64}$'
    or suggestion_type_value <> 'POLICY_PAYMENT_CONFIRMED'
    or suggested_metric_value <> 'polizas_pagadas'
    or suggested_value_value <> 1
    or confidence_value is null or confidence_value < 0 or confidence_value > 1
    or detector_version_value is null
    or jsonb_typeof(evidence_references_value) <> 'array'
  then raise exception 'MAIL_EVIDENCE_SUGGESTION_INVALID'; end if;

  insert into public.activity_mail_evidence_suggestions(
    advisor_id, provider, provider_message_ref, received_at, sender_domain, subject_digest,
    policy_reference_hint, suggestion_type, suggested_metric, suggested_value, confidence,
    detector_version, evidence_references
  ) values (
    advisor, provider_value, provider_message_ref_value, received_at_value, sender_domain_value, subject_digest_value,
    policy_reference_hint_value, suggestion_type_value, suggested_metric_value, suggested_value_value, confidence_value,
    detector_version_value, evidence_references_value
  ) on conflict (advisor_id, provider, provider_message_ref) do nothing
  returning * into inserted;

  if inserted.id is null then
    select * into inserted from public.activity_mail_evidence_suggestions
    where advisor_id = advisor and provider = provider_value and provider_message_ref = provider_message_ref_value;
    return jsonb_build_object('state','IDEMPOTENT_REPLAY','id',inserted.id);
  end if;
  return jsonb_build_object('state','SUGGESTION_RECORDED','id',inserted.id);
end;
$$;

revoke all on function public.forge_activity_record_mail_suggestion(jsonb) from public, anon;
grant execute on function public.forge_activity_record_mail_suggestion(jsonb) to authenticated;

commit;