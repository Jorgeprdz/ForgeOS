begin;

do $cartera001b$
declare
  user_a uuid := gen_random_uuid();
  user_b uuid := gen_random_uuid();
  suffix text := replace(gen_random_uuid()::text, '-', '');
  prospect_a uuid;
  prospect_b uuid;
  snapshot jsonb;
  evidence jsonb := jsonb_build_array('document:' || repeat('a', 64));
  freshness jsonb;
  confirmed jsonb;
  replayed jsonb;
  presented jsonb;
  corrected jsonb;
  accepted jsonb;
  quote_ref text;
  version_ref text;
  presented_event text;
  row_count bigint;
  timeline_source text;
  timeline_type text;
  timeline_payload jsonb;
begin
  insert into auth.users (
    instance_id,id,aud,role,email,encrypted_password,email_confirmed_at,
    raw_app_meta_data,raw_user_meta_data,created_at,updated_at
  ) values
  (
    '00000000-0000-0000-0000-000000000000',user_a,
    'authenticated','authenticated','cartera001b-a-' || suffix || '@forge.invalid','',now(),
    '{"provider":"email","providers":["email"]}'::jsonb,'{}'::jsonb,now(),now()
  ),
  (
    '00000000-0000-0000-0000-000000000000',user_b,
    'authenticated','authenticated','cartera001b-b-' || suffix || '@forge.invalid','',now(),
    '{"provider":"email","providers":["email"]}'::jsonb,'{}'::jsonb,now(),now()
  );

  perform set_config('request.jwt.claim.sub', user_a::text, true);
  perform set_config('request.jwt.claim.role', 'authenticated', true);
  execute 'set local role authenticated';
  insert into public.prospects (
    advisor_id,alias,full_name,phone_normalized,source,initial_context
  ) values (
    user_a,'Cartera 001B A','Cartera 001B Advisor A',
    '525500' || right(suffix, 6),'cartera001b_remote_acceptance','Temporal acceptance prospect A.'
  ) returning id into prospect_a;
  execute 'reset role';

  perform set_config('request.jwt.claim.sub', user_b::text, true);
  perform set_config('request.jwt.claim.role', 'authenticated', true);
  execute 'set local role authenticated';
  insert into public.prospects (
    advisor_id,alias,full_name,phone_normalized,source,initial_context
  ) values (
    user_b,'Cartera 001B B','Cartera 001B Advisor B',
    '525501' || right(suffix, 6),'cartera001b_remote_acceptance','Temporal acceptance prospect B.'
  ) returning id into prospect_b;
  execute 'reset role';

  snapshot := jsonb_build_object(
    'packetType','ACCEPTED_QUOTE_AND_CALCULATION_REVIEW_SNAPSHOT',
    'reviewOnly',true,
    'acceptedQuote',jsonb_build_object(
      'product','ORVI',
      'source',jsonb_build_object('pdfSha256',repeat('a',64))
    ),
    'calculation',jsonb_build_object('product','ORVI'),
    'authority',jsonb_build_object('finalAuthority','HUMAN'),
    'safety',jsonb_build_object('rawPdfAllowed',false)
  );
  freshness := jsonb_build_object(
    'status','reviewed_current_session',
    'source','cartera001b_remote_acceptance',
    'capturedAt',now()
  );

  perform set_config('request.jwt.claim.sub', user_a::text, true);
  perform set_config('request.jwt.claim.role', 'authenticated', true);
  execute 'set local role authenticated';

  confirmed := public.forge_cartera001b_confirm_reviewed_quote(
    prospect_a,'product:orvi',snapshot,'quote-source:remote-' || suffix,
    evidence,freshness,now() - interval '2 minutes','cartera001b-confirm-' || suffix
  );

  if coalesce((confirmed->>'idempotentReplay')::boolean,true)
     or confirmed->>'lifecycleState' <> 'REVIEWED'
     or jsonb_array_length(confirmed->'eventIds') <> 2 then
    raise exception 'CARTERA001B_CONFIRMATION_INVALID';
  end if;
  quote_ref := confirmed->>'quoteReference';
  version_ref := confirmed->>'quoteVersionReference';

  select count(*) into row_count
  from public.quote_lifecycle_events e
  join public.quote_lifecycle_quotes q
    on q.id = e.quote_id and q.advisor_id = e.advisor_id
  where q.quote_reference = quote_ref;
  if row_count <> 2 then raise exception 'CARTERA001B_INITIAL_EVENT_COUNT_INVALID'; end if;

  select count(*) into row_count
  from public.prospect_timeline_events
  where advisor_id = user_a and prospect_id = prospect_a and event_source = 'QUOTE_AUTHORITY';
  if row_count <> 0 then raise exception 'CARTERA001B_REVIEW_PROJECTED_DECISION'; end if;

  replayed := public.forge_cartera001b_confirm_reviewed_quote(
    prospect_a,'product:orvi',snapshot,'quote-source:remote-' || suffix,
    evidence,jsonb_set(freshness,'{capturedAt}',to_jsonb(now())),
    now() - interval '1 minute','cartera001b-confirm-' || suffix
  );
  if not coalesce((replayed->>'idempotentReplay')::boolean,false)
     or replayed->>'quoteReference' <> quote_ref
     or replayed->>'quoteVersionReference' <> version_ref
     or jsonb_array_length(replayed->'eventIds') <> 2 then
    raise exception 'CARTERA001B_CONFIRM_REPLAY_INVALID';
  end if;

  begin
    perform public.forge_cartera001b_confirm_reviewed_quote(
      prospect_a,'product:orvi',snapshot,'quote-source:remote-' || suffix,
      jsonb_build_array('document:' || repeat('b',64)),freshness,now(),
      'cartera001b-confirm-' || suffix
    );
    raise exception 'CARTERA001B_CONFIRM_CONFLICT_MISSING';
  exception when others then
    if position('CARTERA001B_EVENT_CONFLICT' in sqlerrm) = 0 then raise; end if;
  end;

  begin
    insert into public.quote_lifecycle_quotes (
      quote_reference,advisor_id,prospect_id,product_reference,lifecycle_state
    ) values (
      'quote:' || gen_random_uuid()::text,user_a,prospect_a,'product:direct','DRAFT'
    );
    raise exception 'CARTERA001B_DIRECT_INSERT_UNEXPECTED';
  exception when insufficient_privilege then null;
  end;

  presented := public.forge_cartera001b_append_quote_lifecycle_event(
    quote_ref,version_ref,'QUOTE_PRESENTED',now() - interval '30 seconds',
    'quote-source:presentation-' || suffix,evidence,null,null,
    'cartera001b-present-' || suffix,null
  );
  if coalesce((presented->>'idempotentReplay')::boolean,true)
     or presented->>'lifecycleState' <> 'PRESENTED' then
    raise exception 'CARTERA001B_PRESENTATION_INVALID';
  end if;
  presented_event := presented->>'eventId';

  select event_source,event_type,payload
  into timeline_source,timeline_type,timeline_payload
  from public.prospect_timeline_events
  where id = (presented->>'prospectTimelineEventId')::uuid;
  if timeline_source <> 'QUOTE_AUTHORITY'
     or timeline_type <> 'PROPOSAL_PRESENTED'
     or timeline_payload->>'quoteReference' <> quote_ref
     or timeline_payload ?| array[
       'premium','annualPremium','sumAssured','coverage','deductible','coinsurance'
     ] then
    raise exception 'CARTERA001B_PRESENTATION_PROJECTION_INVALID';
  end if;

  replayed := public.forge_cartera001b_append_quote_lifecycle_event(
    quote_ref,version_ref,'QUOTE_PRESENTED',now(),
    'quote-source:presentation-' || suffix,evidence,null,null,
    'cartera001b-present-' || suffix,null
  );
  if not coalesce((replayed->>'idempotentReplay')::boolean,false)
     or replayed->>'eventId' <> presented_event then
    raise exception 'CARTERA001B_PRESENTATION_REPLAY_INVALID';
  end if;

  begin
    perform public.forge_cartera001b_append_quote_lifecycle_event(
      quote_ref,version_ref,'QUOTE_PRESENTED',now(),
      'quote-source:presentation-' || suffix,
      jsonb_build_array('document:' || repeat('b',64)),null,null,
      'cartera001b-present-' || suffix,null
    );
    raise exception 'CARTERA001B_PRESENTATION_CONFLICT_MISSING';
  exception when others then
    if position('CARTERA001B_EVENT_CONFLICT' in sqlerrm) = 0 then raise; end if;
  end;

  corrected := public.forge_cartera001b_append_quote_lifecycle_event(
    quote_ref,version_ref,'QUOTE_PRESENTED',now(),
    'quote-source:presentation-correction-' || suffix,evidence,null,null,
    'cartera001b-present-correction-' || suffix,presented_event
  );
  select count(*) into row_count
  from public.quote_lifecycle_events
  where event_id = corrected->>'eventId'
    and correction_of = presented_event
    and lifecycle_state = 'PRESENTED';
  if row_count <> 1 then raise exception 'CARTERA001B_CORRECTION_INVALID'; end if;

  accepted := public.forge_cartera001b_append_quote_lifecycle_event(
    quote_ref,version_ref,'QUOTE_PROSPECT_ACCEPTED',now(),
    'quote-source:decision-' || suffix,evidence,'CLIENT_CONFIRMED',null,
    'cartera001b-accept-' || suffix,null
  );
  if coalesce((accepted->>'idempotentReplay')::boolean,true)
     or accepted->>'lifecycleState' <> 'PROSPECT_ACCEPTED' then
    raise exception 'CARTERA001B_ACCEPTANCE_INVALID';
  end if;

  select event_source,event_type,payload
  into timeline_source,timeline_type,timeline_payload
  from public.prospect_timeline_events
  where id = (accepted->>'prospectTimelineEventId')::uuid;
  if timeline_source <> 'QUOTE_AUTHORITY'
     or timeline_type <> 'DECISION_RECORDED'
     or timeline_payload->>'decisionCode' <> 'QUOTE_ACCEPTED'
     or timeline_payload->>'reasonCode' <> 'CLIENT_CONFIRMED'
     or timeline_payload ?| array[
       'premium','annualPremium','sumAssured','coverage','deductible','coinsurance'
     ] then
    raise exception 'CARTERA001B_ACCEPTANCE_PROJECTION_INVALID';
  end if;

  replayed := public.forge_cartera001b_append_quote_lifecycle_event(
    quote_ref,version_ref,'QUOTE_PROSPECT_ACCEPTED',now(),
    'quote-source:decision-' || suffix,evidence,'CLIENT_CONFIRMED',null,
    'cartera001b-accept-' || suffix,null
  );
  if not coalesce((replayed->>'idempotentReplay')::boolean,false)
     or replayed->>'eventId' <> accepted->>'eventId' then
    raise exception 'CARTERA001B_ACCEPTANCE_REPLAY_INVALID';
  end if;

  begin
    perform public.forge_cartera001b_append_quote_lifecycle_event(
      quote_ref,version_ref,'QUOTE_PROSPECT_ACCEPTED',now(),
      'quote-source:decision-' || suffix,evidence,'CHANGED_REASON',null,
      'cartera001b-accept-' || suffix,null
    );
    raise exception 'CARTERA001B_DECISION_CONFLICT_MISSING';
  exception when others then
    if position('CARTERA001B_EVENT_CONFLICT' in sqlerrm) = 0 then raise; end if;
  end;

  begin
    perform public.forge_cartera001b_append_quote_lifecycle_event(
      quote_ref,version_ref,'QUOTE_CONVERTED_TO_APPLICATION',now(),
      'quote-source:application-' || suffix,evidence,null,'application:unproved',
      'cartera001b-application-' || suffix,null
    );
    raise exception 'CARTERA001B_APPLICATION_EFFECT_UNEXPECTED';
  exception when others then
    if position('CARTERA001B_APPLICATION_AUTHORITY_REQUIRED' in sqlerrm) = 0 then raise; end if;
  end;

  begin
    perform public.forge_cartera001b_append_quote_timeline_projection(
      prospect_a,'PROPOSAL_PRESENTED',now(),'quote-event:forbidden-direct-helper',
      jsonb_build_object('productReference','product:orvi','quoteReference',quote_ref),
      evidence,'quote-projection:forbidden-direct-helper'
    );
    raise exception 'CARTERA001B_INTERNAL_HELPER_EXECUTION_UNEXPECTED';
  exception when insufficient_privilege then null;
  end;

  execute 'reset role';

  perform set_config('request.jwt.claim.sub', user_b::text, true);
  perform set_config('request.jwt.claim.role', 'authenticated', true);
  execute 'set local role authenticated';
  select count(*) into row_count from public.quote_lifecycle_quotes;
  if row_count <> 0 then raise exception 'CARTERA001B_CROSS_TENANT_QUOTE_LEAK'; end if;
  select count(*) into row_count from public.quote_lifecycle_history;
  if row_count <> 0 then raise exception 'CARTERA001B_CROSS_TENANT_HISTORY_LEAK'; end if;
  begin
    perform public.forge_cartera001b_confirm_reviewed_quote(
      prospect_a,'product:orvi',snapshot,'quote-source:cross-' || suffix,
      evidence,freshness,now(),'cartera001b-cross-' || suffix
    );
    raise exception 'CARTERA001B_CROSS_TENANT_CONFIRM_UNEXPECTED';
  exception when others then
    if position('CARTERA001B_PROSPECT_NOT_OWNED' in sqlerrm) = 0 then raise; end if;
  end;
  begin
    perform public.forge_cartera001b_append_quote_lifecycle_event(
      quote_ref,version_ref,'QUOTE_PRESENTED',now(),'quote-source:cross-' || suffix,
      evidence,null,null,'cartera001b-cross-event-' || suffix,null
    );
    raise exception 'CARTERA001B_CROSS_TENANT_EVENT_UNEXPECTED';
  exception when others then
    if position('CARTERA001B_QUOTE_NOT_OWNED' in sqlerrm) = 0 then raise; end if;
  end;
  execute 'reset role';

  perform set_config('request.jwt.claim.sub', '', true);
  perform set_config('request.jwt.claim.role', 'anon', true);
  execute 'set local role anon';
  begin
    perform public.forge_cartera001b_confirm_reviewed_quote(
      prospect_a,'product:orvi',snapshot,'quote-source:anon-' || suffix,
      evidence,freshness,now(),'cartera001b-anon-' || suffix
    );
    raise exception 'CARTERA001B_ANON_EXECUTION_UNEXPECTED';
  exception when insufficient_privilege then null;
  end;
  execute 'reset role';

  begin
    update public.quote_lifecycle_versions
    set confirmation_state = 'DISPUTED'
    where quote_version_reference = version_ref;
    raise exception 'CARTERA001B_VERSION_MUTATION_UNEXPECTED';
  exception when others then
    if position('CARTERA001B_APPEND_ONLY_MUTATION_DENIED' in sqlerrm) = 0 then raise; end if;
  end;
  begin
    delete from public.quote_lifecycle_events where event_id = presented_event;
    raise exception 'CARTERA001B_EVENT_DELETE_UNEXPECTED';
  exception when others then
    if position('CARTERA001B_APPEND_ONLY_MUTATION_DENIED' in sqlerrm) = 0 then raise; end if;
  end;

  perform set_config('request.jwt.claim.sub', user_a::text, true);
  perform set_config('request.jwt.claim.role', 'authenticated', true);
  execute 'set local role authenticated';
  select count(*) into row_count
  from public.quote_lifecycle_history
  where quote_reference = quote_ref;
  if row_count < 5 then raise exception 'CARTERA001B_HISTORY_INCOMPLETE'; end if;
  execute 'reset role';

  raise notice 'PASS CARTERA001B_REMOTE_ACCEPTANCE';
end;
$cartera001b$;

rollback;
