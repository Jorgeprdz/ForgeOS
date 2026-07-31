begin;

do $cartera001d$
declare
  user_a uuid := gen_random_uuid();
  user_b uuid := gen_random_uuid();
  suffix text := replace(gen_random_uuid()::text, '-', '');
  prospect_a uuid;
  snapshot jsonb;
  evidence jsonb := jsonb_build_array('document:' || repeat('d', 64));
  freshness jsonb;
  confirmed jsonb;
  presented jsonb;
  accepted jsonb;
  quote_ref text;
  version_ref text;
  row_count bigint;
  distinct_count bigint;
  latest_state text;
  link_count bigint;
  timeline_count bigint;
begin
  select count(*) into row_count
  from supabase_migrations.schema_migrations
  where version in (
    '20260730000100',
    '20260730000110',
    '20260730000120',
    '20260730000130'
  );
  if row_count <> 4 then raise exception 'CARTERA001D_REQUIRED_MIGRATIONS_MISSING'; end if;

  if to_regprocedure('public.forge_cartera001b_confirm_reviewed_quote(uuid,text,jsonb,text,jsonb,jsonb,timestamptz,text)') is null
     or to_regprocedure('public.forge_cartera001b_append_quote_lifecycle_event(text,text,text,timestamptz,text,jsonb,text,text,text,text)') is null
     or to_regclass('public.quote_lifecycle_history') is null then
    raise exception 'CARTERA001D_REMOTE_AUTHORITY_MISSING';
  end if;

  insert into auth.users (
    instance_id,id,aud,role,email,encrypted_password,email_confirmed_at,
    raw_app_meta_data,raw_user_meta_data,created_at,updated_at
  ) values
  (
    '00000000-0000-0000-0000-000000000000',user_a,
    'authenticated','authenticated','cartera001d-a-' || suffix || '@forge.invalid','',now(),
    '{"provider":"email","providers":["email"]}'::jsonb,'{}'::jsonb,now(),now()
  ),
  (
    '00000000-0000-0000-0000-000000000000',user_b,
    'authenticated','authenticated','cartera001d-b-' || suffix || '@forge.invalid','',now(),
    '{"provider":"email","providers":["email"]}'::jsonb,'{}'::jsonb,now(),now()
  );

  perform set_config('request.jwt.claim.sub', user_a::text, true);
  perform set_config('request.jwt.claim.role', 'authenticated', true);
  execute 'set local role authenticated';

  insert into public.prospects (
    advisor_id,alias,full_name,phone_normalized,source,initial_context
  ) values (
    user_a,'Cartera 001D','Cartera 001D Vertical Acceptance',
    '525502' || right(suffix, 6),'cartera001d_vertical_acceptance',
    'Transactional vertical acceptance fixture.'
  ) returning id into prospect_a;

  snapshot := jsonb_build_object(
    'packetType','ACCEPTED_QUOTE_AND_CALCULATION_REVIEW_SNAPSHOT',
    'reviewOnly',true,
    'acceptedQuote',jsonb_build_object(
      'product','ORVI',
      'source',jsonb_build_object('pdfSha256',repeat('d',64))
    ),
    'calculation',jsonb_build_object('product','ORVI'),
    'authority',jsonb_build_object('finalAuthority','HUMAN'),
    'safety',jsonb_build_object('rawPdfAllowed',false)
  );
  freshness := jsonb_build_object(
    'status','reviewed_current_session',
    'source','cartera001d_remote_vertical_acceptance',
    'capturedAt',now()
  );

  confirmed := public.forge_cartera001b_confirm_reviewed_quote(
    prospect_a,
    'product:orvi',
    snapshot,
    'quote-source:cartera001d-review-' || suffix,
    evidence,
    freshness,
    now() - interval '3 minutes',
    'cartera001d-confirm-' || suffix
  );
  if coalesce((confirmed->>'idempotentReplay')::boolean,true)
     or confirmed->>'prospectReference' <> prospect_a::text
     or confirmed->>'lifecycleState' <> 'REVIEWED'
     or jsonb_array_length(confirmed->'eventIds') <> 2 then
    raise exception 'CARTERA001D_CONFIRMATION_RECEIPT_INVALID';
  end if;
  quote_ref := confirmed->>'quoteReference';
  version_ref := confirmed->>'quoteVersionReference';
  if quote_ref is null or version_ref is null then
    raise exception 'CARTERA001D_DURABLE_IDENTITY_MISSING';
  end if;

  presented := public.forge_cartera001b_append_quote_lifecycle_event(
    quote_ref,
    version_ref,
    'QUOTE_PRESENTED',
    now() - interval '2 minutes',
    'quote-source:cartera001d-presentation-' || suffix,
    evidence,
    null,
    null,
    'cartera001d-presented-' || suffix,
    null
  );
  if coalesce((presented->>'idempotentReplay')::boolean,true)
     or presented->>'quoteReference' <> quote_ref
     or presented->>'quoteVersionReference' <> version_ref
     or presented->>'prospectReference' <> prospect_a::text
     or presented->>'lifecycleState' <> 'PRESENTED'
     or presented->>'eventId' is null
     or presented->>'prospectTimelineEventId' is null then
    raise exception 'CARTERA001D_PRESENTATION_RECEIPT_INVALID';
  end if;

  accepted := public.forge_cartera001b_append_quote_lifecycle_event(
    quote_ref,
    version_ref,
    'QUOTE_PROSPECT_ACCEPTED',
    now() - interval '1 minute',
    'quote-source:cartera001d-decision-' || suffix,
    evidence,
    'CLIENT_CONFIRMED',
    null,
    'cartera001d-accepted-' || suffix,
    null
  );
  if coalesce((accepted->>'idempotentReplay')::boolean,true)
     or accepted->>'quoteReference' <> quote_ref
     or accepted->>'quoteVersionReference' <> version_ref
     or accepted->>'prospectReference' <> prospect_a::text
     or accepted->>'lifecycleState' <> 'PROSPECT_ACCEPTED'
     or accepted->>'eventId' is null
     or accepted->>'prospectTimelineEventId' is null then
    raise exception 'CARTERA001D_ACCEPTANCE_RECEIPT_INVALID';
  end if;

  select count(*), count(distinct quote_reference), count(distinct quote_version_reference)
  into row_count, distinct_count, link_count
  from public.quote_lifecycle_history
  where prospect_id = prospect_a
    and quote_reference = quote_ref;
  if row_count <> 4 or distinct_count <> 1 or link_count <> 1 then
    raise exception 'CARTERA001D_HISTORY_IDENTITY_CHAIN_INVALID';
  end if;

  select lifecycle_state into latest_state
  from public.quote_lifecycle_history
  where prospect_id = prospect_a and quote_reference = quote_ref
  order by occurred_at desc, recorded_at desc, event_id desc
  limit 1;
  if latest_state <> 'PROSPECT_ACCEPTED' then
    raise exception 'CARTERA001D_HISTORY_FINAL_STATE_INVALID';
  end if;

  select count(distinct event_type) into distinct_count
  from public.quote_lifecycle_history
  where prospect_id = prospect_a
    and quote_reference = quote_ref
    and event_type in (
      'QUOTE_CREATED',
      'QUOTE_REVIEW_CONFIRMED',
      'QUOTE_PRESENTED',
      'QUOTE_PROSPECT_ACCEPTED'
    );
  if distinct_count <> 4 then raise exception 'CARTERA001D_HISTORY_EVENTS_INCOMPLETE'; end if;

  if exists (
    select 1
    from public.quote_lifecycle_history h
    where h.prospect_id = prospect_a
      and h.quote_reference = quote_ref
      and to_jsonb(h) ?| array[
        'premium','annualPremium','monthlyPremium','paymentAmount',
        'sumAssured','coverage','coverages','deductible','coinsurance',
        'rawPdf','pdfBase64','binary'
      ]
  ) then
    raise exception 'CARTERA001D_HISTORY_QUOTE_TRUTH_LEAK';
  end if;

  select count(*) into timeline_count
  from public.quote_lifecycle_events e
  join public.quote_lifecycle_quotes q
    on q.id = e.quote_id and q.advisor_id = e.advisor_id
  join public.prospect_timeline_events p
    on p.id = e.prospect_timeline_event_id
   and p.advisor_id = e.advisor_id
   and p.prospect_id = e.prospect_id
  where q.quote_reference = quote_ref
    and e.event_type in ('QUOTE_PRESENTED','QUOTE_PROSPECT_ACCEPTED')
    and p.event_source = 'QUOTE_AUTHORITY'
    and (
      (e.event_type = 'QUOTE_PRESENTED'
        and p.event_type = 'PROPOSAL_PRESENTED'
        and p.payload->>'quoteReference' = quote_ref)
      or
      (e.event_type = 'QUOTE_PROSPECT_ACCEPTED'
        and p.event_type = 'DECISION_RECORDED'
        and p.payload->>'decisionCode' = 'QUOTE_ACCEPTED'
        and p.payload->>'reasonCode' = 'CLIENT_CONFIRMED')
    );
  if timeline_count <> 2 then raise exception 'CARTERA001D_TIMELINE_LINKAGE_INVALID'; end if;

  select count(*) into link_count
  from public.quote_lifecycle_events e
  join public.quote_lifecycle_quotes q
    on q.id = e.quote_id and q.advisor_id = e.advisor_id
  where q.quote_reference = quote_ref
    and e.event_type in ('QUOTE_CREATED','QUOTE_REVIEW_CONFIRMED')
    and e.prospect_timeline_event_id is not null;
  if link_count <> 0 then raise exception 'CARTERA001D_REVIEW_TIMELINE_EFFECT_INVALID'; end if;

  if exists (
    select 1
    from public.quote_lifecycle_events e
    join public.quote_lifecycle_quotes q
      on q.id = e.quote_id and q.advisor_id = e.advisor_id
    join public.prospect_timeline_events p
      on p.id = e.prospect_timeline_event_id
    where q.quote_reference = quote_ref
      and p.payload ?| array[
        'premium','annualPremium','monthlyPremium','paymentAmount',
        'sumAssured','coverage','coverages','deductible','coinsurance',
        'rawPdf','pdfBase64','binary'
      ]
  ) then
    raise exception 'CARTERA001D_TIMELINE_QUOTE_TRUTH_LEAK';
  end if;

  execute 'reset role';
  perform set_config('request.jwt.claim.sub', user_b::text, true);
  perform set_config('request.jwt.claim.role', 'authenticated', true);
  execute 'set local role authenticated';

  select count(*) into row_count from public.quote_lifecycle_history;
  if row_count <> 0 then raise exception 'CARTERA001D_CROSS_TENANT_HISTORY_LEAK'; end if;
  select count(*) into row_count
  from public.prospect_timeline_events
  where event_source = 'QUOTE_AUTHORITY';
  if row_count <> 0 then raise exception 'CARTERA001D_CROSS_TENANT_TIMELINE_LEAK'; end if;

  execute 'reset role';
  raise notice 'PASS CARTERA001D_REMOTE_VERTICAL_ACCEPTANCE';
  raise notice 'QUOTE_HISTORY_ROWS=4';
  raise notice 'QUOTE_TIMELINE_ROWS=2';
  raise notice 'FINAL_LIFECYCLE_STATE=PROSPECT_ACCEPTED';
  raise notice 'TEST_FIXTURES_ROLLED_BACK=YES';
end;
$cartera001d$;

rollback;
