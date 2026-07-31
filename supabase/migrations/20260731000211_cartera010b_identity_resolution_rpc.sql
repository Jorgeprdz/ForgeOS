-- CARTERA 010B.3A GOVERNED IDENTITY RESOLUTION RPC
-- Repository implementation only. This migration is NOT remote deployment authorization.

begin;

create or replace function public.forge_cartera010b_existing_receipt_response(
  p_actor_id uuid,
  p_command_type text,
  p_idempotency_key text,
  p_command_digest text,
  p_evidence_references jsonb,
  p_claims jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = public, extensions, pg_temp
as $$
declare
  receipt public.cartera010b_command_receipts%rowtype;
  conflict_reference text;
begin
  select * into receipt
  from public.cartera010b_command_receipts r
  where r.advisor_id = p_actor_id
    and r.command_type = p_command_type
    and r.idempotency_key = p_idempotency_key;

  if receipt.id is null then
    return null;
  end if;

  if receipt.command_digest = p_command_digest then
    return receipt.response_envelope || jsonb_build_object('replayed', true);
  end if;

  conflict_reference := 'COMMAND_REPLAY_CONFLICT:' || substr(
    encode(digest(
      p_actor_id::text || '|' || p_command_type || '|' ||
      p_idempotency_key || '|' || p_command_digest,
      'sha256'
    ), 'hex'), 1, 40
  );

  insert into public.policy_conflicts (
    advisor_id, conflict_reference, conflict_type, conflict_state,
    claims, evidence_references, command_type, idempotency_key,
    incoming_digest, existing_digest, recorded_by
  ) values (
    p_actor_id, conflict_reference, 'CHANGED_INPUT_REPLAY', 'OPEN',
    coalesce(p_claims, '{}'::jsonb),
    coalesce(p_evidence_references, '[]'::jsonb),
    p_command_type, p_idempotency_key, p_command_digest,
    receipt.command_digest, p_actor_id
  ) on conflict (advisor_id, conflict_reference) do nothing;

  return jsonb_build_object(
    'status', 'CONFLICT',
    'conflictType', 'CHANGED_INPUT_REPLAY',
    'conflictReference', conflict_reference,
    'idempotencyKey', p_idempotency_key,
    'serverCommandDigest', p_command_digest,
    'replayed', false
  );
end;
$$;

create or replace function public.forge_cartera010b_persist_receipt(
  p_actor_id uuid,
  p_command_type text,
  p_idempotency_key text,
  p_command_digest text,
  p_response jsonb,
  p_executed_at timestamptz
)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  insert into public.cartera010b_command_receipts (
    advisor_id, command_type, idempotency_key, command_digest,
    response_envelope, executed_at, executed_by
  ) values (
    p_actor_id, p_command_type, p_idempotency_key, p_command_digest,
    p_response, p_executed_at, p_actor_id
  );
  return p_response;
end;
$$;

create or replace function public.forge_cartera010b_record_command_conflict(
  p_actor_id uuid,
  p_command_type text,
  p_idempotency_key text,
  p_command_digest text,
  p_conflict_type text,
  p_policy_id uuid,
  p_claims jsonb,
  p_evidence_references jsonb,
  p_existing_digest text,
  p_recorded_at timestamptz
)
returns jsonb
language plpgsql
security definer
set search_path = public, extensions, pg_temp
as $$
declare
  conflict_reference text;
  response jsonb;
begin
  conflict_reference := p_conflict_type || ':' || substr(
    encode(digest(
      p_actor_id::text || '|' || p_command_type || '|' ||
      p_idempotency_key || '|' || p_command_digest,
      'sha256'
    ), 'hex'), 1, 40
  );

  insert into public.policy_conflicts (
    advisor_id, conflict_reference, policy_id, conflict_type,
    conflict_state, claims, evidence_references, command_type,
    idempotency_key, incoming_digest, existing_digest, recorded_by
  ) values (
    p_actor_id, conflict_reference, p_policy_id, p_conflict_type,
    'OPEN', coalesce(p_claims, '{}'::jsonb),
    coalesce(p_evidence_references, '[]'::jsonb), p_command_type,
    p_idempotency_key, p_command_digest, p_existing_digest, p_actor_id
  ) on conflict (advisor_id, conflict_reference) do nothing;

  response := jsonb_build_object(
    'status', 'CONFLICT',
    'conflictType', p_conflict_type,
    'conflictReference', conflict_reference,
    'idempotencyKey', p_idempotency_key,
    'serverCommandDigest', p_command_digest,
    'replayed', false
  );

  return public.forge_cartera010b_persist_receipt(
    p_actor_id, p_command_type, p_idempotency_key,
    p_command_digest, response, p_recorded_at
  );
end;
$$;

create or replace function public.forge_cartera010b_confirm_identity_resolution(
  p_command jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = public, extensions, pg_temp
as $$
#variable_conflict use_variable
declare
  actor_id uuid := auth.uid();
  advisor_id uuid;
  command_digest text;
  idempotency_key text;
  decided_at timestamptz;
  outcome text;
  source jsonb;
  source_domain text;
  source_type text;
  source_record text;
  prospect_id uuid;
  existing_reference text;
  new_person jsonb;
  candidates jsonb;
  evidence jsonb;
  reason_code text;
  prior_link public.commercial_source_identity_links%rowtype;
  person public.commercial_people%rowtype;
  decision_id uuid := gen_random_uuid();
  decision_reference text;
  link_reference text;
  replay jsonb;
  response jsonb;
begin
  if actor_id is null then raise exception 'CARTERA010B_AUTH_REQUIRED'; end if;
  if not public.forge_cartera010b_jsonb_keys_allowed(
       p_command,
       array[
         'contractType','contractVersion','advisorId','actorReference',
         'idempotencyKey','decidedAt','outcome','sourceIdentity',
         'existingPersonReference','newPerson','candidatePersonReferences',
         'evidenceReferences','reasonCode','commandDigest'
       ]
     )
     or p_command ->> 'contractType' <> 'FORGE_IDENTITY_RESOLUTION_COMMAND'
     or p_command ->> 'contractVersion' <> 'CARTERA-010B.1' then
    raise exception 'CARTERA010B_IDENTITY_COMMAND_CONTRACT_INVALID';
  end if;

  begin
    advisor_id := (p_command ->> 'advisorId')::uuid;
    decided_at := (p_command ->> 'decidedAt')::timestamptz;
  exception when others then
    raise exception 'CARTERA010B_IDENTITY_COMMAND_FIELDS_INVALID';
  end;
  if advisor_id <> actor_id or p_command ->> 'actorReference' <> actor_id::text then
    raise exception 'CARTERA010B_IDENTITY_OWNER_MISMATCH';
  end if;

  idempotency_key := nullif(btrim(p_command ->> 'idempotencyKey'), '');
  outcome := p_command ->> 'outcome';
  source := p_command -> 'sourceIdentity';
  source_domain := source ->> 'sourceDomain';
  source_type := source ->> 'sourceIdentityType';
  source_record := source ->> 'sourceRecordReference';
  existing_reference := nullif(btrim(p_command ->> 'existingPersonReference'), '');
  new_person := p_command -> 'newPerson';
  candidates := coalesce(p_command -> 'candidatePersonReferences', '[]'::jsonb);
  evidence := p_command -> 'evidenceReferences';
  reason_code := p_command ->> 'reasonCode';

  if idempotency_key is null
     or idempotency_key !~ '^[A-Za-z0-9][A-Za-z0-9._:@/-]{0,159}$'
     or outcome is null
     or outcome not in ('LINK_CONFIRMED','CREATE_CONFIRMED','UNRESOLVED','REJECTED_MATCH','CONFLICT','CORRECTED')
     or not public.forge_cartera010b_jsonb_keys_allowed(
       source, array['sourceDomain','sourceIdentityType','sourceRecordReference','prospectReference']
     )
     or source_domain is null
     or source_domain !~ '^[A-Za-z0-9][A-Za-z0-9._:@/-]{0,119}$'
     or source_type is null
     or source_type !~ '^[A-Za-z0-9][A-Za-z0-9._:@/-]{0,119}$'
     or source_record is null
     or source_record !~ '^[A-Za-z0-9][A-Za-z0-9._:@/-]{0,239}$'
     or reason_code is null
     or reason_code !~ '^[A-Za-z0-9][A-Za-z0-9._:@/-]{0,119}$'
     or not public.forge_cartera010b_reference_array_valid(candidates, 0, 100)
     or not public.forge_cartera010b_reference_array_valid(evidence, 1, 100)
     or decided_at is null
     or decided_at > now() + interval '5 minutes' then
    raise exception 'CARTERA010B_IDENTITY_COMMAND_INVALID';
  end if;

  if source ->> 'prospectReference' is not null then
    begin prospect_id := (source ->> 'prospectReference')::uuid;
    exception when others then raise exception 'CARTERA010B_PROSPECT_REFERENCE_INVALID'; end;
    if not exists (select 1 from public.prospects p where p.id = prospect_id and p.advisor_id = actor_id) then
      raise exception 'CARTERA010B_PROSPECT_NOT_OWNED';
    end if;
  elsif source_type = 'PROSPECT' then
    raise exception 'CARTERA010B_PROSPECT_REFERENCE_REQUIRED';
  end if;

  command_digest := public.forge_cartera010b_command_digest(p_command);
  perform pg_advisory_xact_lock(hashtextextended(actor_id::text || '|IDENTITY_RESOLUTION|' || idempotency_key, 0));
  perform pg_advisory_xact_lock(hashtextextended(actor_id::text || '|IDENTITY_SOURCE|' || source_domain || '|' || source_type || '|' || source_record, 0));
  replay := public.forge_cartera010b_existing_receipt_response(
    actor_id, 'IDENTITY_RESOLUTION', idempotency_key, command_digest,
    evidence, jsonb_build_object('sourceIdentity', source)
  );
  if replay is not null then return replay; end if;

  select * into prior_link
  from public.commercial_source_identity_links l
  where l.advisor_id = actor_id and l.source_domain = source_domain
    and l.source_identity_type = source_type
    and l.source_record_reference = source_record and l.effective_to is null
  order by l.effective_from desc limit 1 for update;

  if outcome = 'CREATE_CONFIRMED' and (
    existing_reference is not null
    or new_person is null
    or jsonb_typeof(new_person) <> 'object'
  ) then
    raise exception 'CARTERA010B_CREATE_COMMAND_INVALID';
  end if;
  if outcome = 'CORRECTED' and (
    (existing_reference is null and (new_person is null or jsonb_typeof(new_person) <> 'object'))
    or (existing_reference is not null and new_person is not null and new_person <> 'null'::jsonb)
  ) then
    raise exception 'CARTERA010B_CORRECTION_COMMAND_INVALID';
  end if;
  if prior_link.id is not null and outcome = 'CREATE_CONFIRMED' then
    return public.forge_cartera010b_record_command_conflict(
      actor_id, 'IDENTITY_RESOLUTION', idempotency_key, command_digest,
      'IDENTITY_UNRESOLVED', null,
      jsonb_build_object('sourceIdentity',source,'existingLinkReference',prior_link.link_reference),
      evidence, prior_link.command_digest, decided_at
    );
  end if;

  if outcome in ('UNRESOLVED','REJECTED_MATCH','CONFLICT') then
    if existing_reference is not null or (new_person is not null and new_person <> 'null'::jsonb) then
      raise exception 'CARTERA010B_UNRESOLVED_COMMAND_MUTATION_FORBIDDEN';
    end if;
  elsif outcome = 'LINK_CONFIRMED' then
    if existing_reference is null or (new_person is not null and new_person <> 'null'::jsonb) then
      raise exception 'CARTERA010B_LINK_COMMAND_INVALID';
    end if;
    select * into person from public.commercial_people p
    where p.advisor_id = actor_id and p.person_reference = existing_reference
      and p.lifecycle_state = 'CONFIRMED' and p.archived_at is null;
    if person.id is null then raise exception 'CARTERA010B_CONFIRMED_PERSON_NOT_FOUND'; end if;
  else
    if existing_reference is not null then
      select * into person from public.commercial_people p
      where p.advisor_id = actor_id and p.person_reference = existing_reference
        and p.lifecycle_state = 'CONFIRMED' and p.archived_at is null;
      if person.id is null then raise exception 'CARTERA010B_CONFIRMED_PERSON_NOT_FOUND'; end if;
    elsif new_person is not null and jsonb_typeof(new_person) = 'object' then
      if not public.forge_cartera010b_jsonb_keys_allowed(
           new_person,
           array['personReference','displayName','preferredName','normalizedName',
                 'verifiedPhone','verifiedEmail','birthDate','privacyClassification']
         )
         or new_person ->> 'personReference' !~ '^[A-Za-z0-9][A-Za-z0-9._:@/-]{0,239}$'
         or new_person ->> 'displayName' is null or new_person ->> 'normalizedName' is null
         or new_person ->> 'privacyClassification' not in ('PRIVATE','SENSITIVE','RESTRICTED') then
        raise exception 'CARTERA010B_NEW_PERSON_INVALID';
      end if;
      perform pg_advisory_xact_lock(hashtextextended(actor_id::text || '|PERSON_REFERENCE|' || new_person ->> 'personReference', 0));
      if exists (select 1 from public.commercial_people p where p.advisor_id = actor_id and p.person_reference = new_person ->> 'personReference') then
        return public.forge_cartera010b_record_command_conflict(
          actor_id, 'IDENTITY_RESOLUTION', idempotency_key, command_digest,
          'IDENTITY_UNRESOLVED', null,
          jsonb_build_object('reason','PERSON_REFERENCE_ALREADY_EXISTS','personReference',new_person ->> 'personReference'),
          evidence, null, decided_at
        );
      end if;
      insert into public.commercial_people (
        advisor_id, person_reference, display_name, preferred_name,
        normalized_name, verified_phone, verified_email, birth_date,
        lifecycle_state, privacy_classification, evidence_references,
        created_at, created_by, updated_at
      ) values (
        actor_id, new_person ->> 'personReference', new_person ->> 'displayName',
        nullif(btrim(new_person ->> 'preferredName'), ''), new_person ->> 'normalizedName',
        nullif(btrim(new_person ->> 'verifiedPhone'), ''), nullif(btrim(new_person ->> 'verifiedEmail'), ''),
        nullif(btrim(new_person ->> 'birthDate'), '')::date, 'CONFIRMED',
        new_person ->> 'privacyClassification', evidence, decided_at, actor_id, decided_at
      ) returning * into person;
    else
      raise exception 'CARTERA010B_RESOLVED_PERSON_REQUIRED';
    end if;
  end if;

  if prior_link.id is not null and outcome <> 'CORRECTED' then
    if person.id is not null and prior_link.person_id = person.id then
      response := jsonb_build_object('status','ALREADY_LINKED','personReference',person.person_reference,
        'linkReference',prior_link.link_reference,'idempotencyKey',idempotency_key,
        'serverCommandDigest',command_digest,'replayed',false);
      return public.forge_cartera010b_persist_receipt(actor_id,'IDENTITY_RESOLUTION',idempotency_key,command_digest,response,decided_at);
    end if;
    return public.forge_cartera010b_record_command_conflict(
      actor_id, 'IDENTITY_RESOLUTION', idempotency_key, command_digest,
      'IDENTITY_UNRESOLVED', null,
      jsonb_build_object('sourceIdentity',source,'existingLinkReference',prior_link.link_reference),
      evidence, prior_link.command_digest, decided_at
    );
  end if;

  if outcome = 'CORRECTED' then
    if prior_link.id is null then raise exception 'CARTERA010B_CORRECTION_SOURCE_LINK_REQUIRED'; end if;
    perform set_config('forge.cartera010b_governed_command', 'on', true);
    update public.commercial_source_identity_links set effective_to = decided_at
    where id = prior_link.id and advisor_id = actor_id;
  end if;

  decision_reference := 'IDENTITY_DECISION:' || substr(command_digest,1,40);
  insert into public.identity_resolution_decisions (
    id, advisor_id, decision_reference, source_domain, source_identity_type,
    source_record_reference, prospect_id, outcome, resolved_person_id,
    candidate_person_references, evidence_references, reason_code,
    command_digest, idempotency_key, decided_at, decided_by, correction_of
  ) values (
    decision_id, actor_id, decision_reference, source_domain, source_type,
    source_record, prospect_id, outcome,
    case when outcome in ('LINK_CONFIRMED','CREATE_CONFIRMED','CORRECTED') then person.id else null end,
    candidates, evidence, reason_code, command_digest, idempotency_key,
    decided_at, actor_id, case when outcome = 'CORRECTED' then prior_link.decision_id else null end
  );

  if outcome in ('LINK_CONFIRMED','CREATE_CONFIRMED','CORRECTED') then
    link_reference := 'IDENTITY_LINK:' || substr(command_digest,1,40);
    insert into public.commercial_source_identity_links (
      advisor_id, link_reference, person_id, source_domain, source_identity_type,
      source_record_reference, prospect_id, match_status, decision_id,
      evidence_references, idempotency_key, command_digest, effective_from,
      correction_of, created_by
    ) values (
      actor_id, link_reference, person.id, source_domain, source_type,
      source_record, prospect_id, outcome, decision_id, evidence,
      idempotency_key, command_digest, decided_at,
      case when outcome = 'CORRECTED' then prior_link.id else null end, actor_id
    );
  end if;

  response := jsonb_build_object(
    'status', case when person.id is null then 'RECORDED' else 'CONFIRMED' end,
    'outcome', outcome, 'decisionReference', decision_reference,
    'linkReference', link_reference, 'personReference', person.person_reference,
    'idempotencyKey', idempotency_key, 'serverCommandDigest', command_digest,
    'replayed', false
  );
  return public.forge_cartera010b_persist_receipt(
    actor_id, 'IDENTITY_RESOLUTION', idempotency_key,
    command_digest, response, decided_at
  );
end;
$$;

revoke all on function public.forge_cartera010b_existing_receipt_response(uuid,text,text,text,jsonb,jsonb) from public, anon, authenticated;
revoke all on function public.forge_cartera010b_persist_receipt(uuid,text,text,text,jsonb,timestamptz) from public, anon, authenticated;
revoke all on function public.forge_cartera010b_record_command_conflict(uuid,text,text,text,text,uuid,jsonb,jsonb,text,timestamptz) from public, anon, authenticated;
revoke all on function public.forge_cartera010b_confirm_identity_resolution(jsonb) from public, anon;
grant execute on function public.forge_cartera010b_confirm_identity_resolution(jsonb) to authenticated;

comment on function public.forge_cartera010b_confirm_identity_resolution(jsonb) is
  'CARTERA 010B governed identity resolution with server digest, deterministic replay, conflict persistence and controlled correction.';

commit;
