import assert from 'node:assert/strict';
import { mkdirSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname } from 'node:path';
import { createClient } from '@supabase/supabase-js';

const require = createRequire(import.meta.url);
const cartera = require('../platform/shared-commercial-model/cartera-010b-contract-validator.js');
const RUN_ID = process.env.FORGE_CONTACT_BOOKS_RUN_ID || '20260803_213631';
const SOURCE = `BETA1_022A_${RUN_ID}`;
const OUT = process.env.FORGE_CONTACT_BOOKS_ACCEPTANCE_EVIDENCE || 'artifacts/contact-books-001/acceptance.json';
const required = ['SUPABASE_URL','SUPABASE_ANON_KEY','ADVISOR_A_EMAIL','ADVISOR_A_PASSWORD','ADVISOR_B_EMAIL','ADVISOR_B_PASSWORD'];
for (const name of required) assert.ok(process.env[name], `${name}_MISSING`);
const options = { auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false } };
const make = () => createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY, options);
const clients = { A: make(), B: make() };
const credentials = {
  A: [process.env.ADVISOR_A_EMAIL, process.env.ADVISOR_A_PASSWORD],
  B: [process.env.ADVISOR_B_EMAIL, process.env.ADVISOR_B_PASSWORD],
};
const personReference = (owner, index) => `person:beta1022a:${RUN_ID}:${owner}:${String(index).padStart(3,'0')}`;
const key = (owner, operation) => `contact-books:${RUN_ID}:${owner}:${operation}`;
const stageRank = { referred_new: 0, contacted: 1, appointment_scheduled: 2, proposal: 3, decision: 4, client: 5 };

async function rpc(api, name, command) {
  const result = await api.rpc(name, { p_command: command });
  assert.ifError(result.error);
  return result.data;
}

async function login(api, owner) {
  const result = await api.auth.signInWithPassword({ email: credentials[owner][0], password: credentials[owner][1] });
  assert.ifError(result.error);
  const state = await api.rpc('forge_demo_current_session');
  assert.ifError(state.error);
  assert.equal(state.data?.dataClass, 'SYNTHETIC');
  assert.equal(state.data?.readOnly, false, `${owner}_WRITE_WINDOW_REQUIRED`);
  return result.data.user.id;
}

async function ensurePeople(api, owner, ownerId, prospects) {
  for (let offset = 0; offset < prospects.length; offset += 1) {
    const index = offset + 1;
    const prospect = prospects[offset];
    const existing = await api.from('commercial_people').select('id').eq('advisor_id',ownerId)
      .eq('person_reference',personReference(owner,index)).is('archived_at',null).maybeSingle();
    assert.ifError(existing.error);
    if (existing.data?.id) continue;
    const command = cartera.buildIdentityResolutionCommand({
      advisorId: ownerId,
      actorReference: ownerId,
      idempotencyKey: `identity-command:beta1022a:${RUN_ID}:${owner}:${String(index).padStart(3,'0')}`,
      decidedAt: new Date(Date.UTC(2026,7,3,14,index)).toISOString(),
      outcome: 'CREATE_CONFIRMED',
      sourceIdentity: { sourceDomain: 'FORGE_ACCEPTANCE', sourceIdentityType: 'PROSPECT', sourceRecordReference: `prospect:${prospect.id}`, prospectReference: prospect.id },
      existingPersonReference: null,
      newPerson: {
        personReference: personReference(owner,index), displayName: prospect.full_name, preferredName: null,
        normalizedName: `persona sintetica ${owner.toLowerCase()} ${String(index).padStart(3,'0')} ${RUN_ID}`,
        verifiedPhone: prospect.phone_normalized, verifiedEmail: prospect.email_normalized, birthDate: null, privacyClassification: 'PRIVATE',
      },
      candidatePersonReferences: [], evidenceReferences: [`identity-evidence:beta1022a:${RUN_ID}:${owner}:${String(index).padStart(3,'0')}`],
      reasonCode: 'ADVISOR_CONFIRMED_SYNTHETIC_ACCEPTANCE_PERSON',
    });
    const result = await api.rpc('forge_cartera010b_confirm_identity_resolution', { p_command: command });
    assert.ifError(result.error);
    assert.equal(result.data?.status,'CONFIRMED',`${owner}_IDENTITY_${index}_${result.data?.status}`);
  }
}

async function classify(api, owner, ownerId) {
  const query = await api.from('prospects').select('id,full_name,phone_normalized,email_normalized,status,next_action_type,referrer_relationship,created_at')
    .eq('advisor_id',ownerId).eq('source',SOURCE).is('archived_at',null).order('full_name',{ ascending:true });
  assert.ifError(query.error);
  assert.equal(query.data.length,100);
  const prospects = query.data;
  const friendCount = prospects.filter(item => item.referrer_relationship === 'friend').length;
  const fallbackFriends = prospects.filter(item => item.referrer_relationship !== 'friend').slice(0,Math.max(0,40-friendCount));
  if (fallbackFriends.length) {
    const update = await api.from('prospects').update({ referrer_relationship: 'friend', updated_by: ownerId })
      .in('id',fallbackFriends.map(item => item.id)).eq('advisor_id',ownerId).eq('source',SOURCE);
    assert.ifError(update.error);
    for (const item of fallbackFriends) item.referrer_relationship = 'friend';
  }
  const eligible = prospects.filter(item => item.phone_normalized && (item.next_action_type || (stageRank[item.status] ?? -1) > stageRank.contacted));
  eligible.sort((left,right) => {
    const completeness = item => Number(Boolean(item.phone_normalized))+Number(Boolean(item.email_normalized))+Number(Boolean(item.next_action_type));
    return completeness(right)-completeness(left) || (stageRank[right.status]??-1)-(stageRank[left.status]??-1) || left.full_name.localeCompare(right.full_name);
  });
  const best = eligible.slice(0,30);
  const friends = prospects.filter(item => item.referrer_relationship === 'friend').sort((a,b) => a.full_name.localeCompare(b.full_name)).slice(0,40);
  assert.equal(best.length,30); assert.equal(friends.length,40);
  const indexById = new Map(prospects.map((item,index) => [item.id,index+1]));
  return { prospects, best: best.map(item => personReference(owner,indexById.get(item.id))), friends: friends.map(item => personReference(owner,indexById.get(item.id))), friendshipLabelsAdded: fallbackFriends.length };
}

async function createBook(api, owner, ownerId, name, suffix, members) {
  const created = await rpc(api,'forge_contact_books_create',{ ownerId,name,bookType:'CUSTOM',bookReference:`book:contact-books-001:${RUN_ID}:${owner}:${suffix}`,idempotencyKey:key(owner,`create:${suffix}`) });
  assert.ok(['CREATED','REPLAYED'].includes(created.status));
  const replay = await rpc(api,'forge_contact_books_create',{ ownerId,name,bookType:'CUSTOM',bookReference:`book:contact-books-001:${RUN_ID}:${owner}:${suffix}`,idempotencyKey:key(owner,`create:${suffix}`) });
  assert.equal(replay.status,'REPLAYED');
  const added = await rpc(api,'forge_contact_books_add_members',{ ownerId,bookReference:created.bookReference,personReferences:members,source:'SYNTHETIC_ACCEPTANCE',importBatchReference:`contact-books-001:${RUN_ID}`,idempotencyKey:key(owner,`add:${suffix}`) });
  assert.ok(['UPDATED','REPLAYED'].includes(added.status));
  const listed = await api.rpc('forge_contact_books_list_members',{ p_book_reference:created.bookReference });
  assert.ifError(listed.error); assert.equal(listed.data.length,members.length);
  return { bookReference:created.bookReference,count:listed.data.length,replay:replay.status };
}

async function validateCommands(api, owner, ownerId, people) {
  const origin = await rpc(api,'forge_contact_books_create',{ ownerId,name:`Validación origen ${owner}`,bookType:'CUSTOM',bookReference:`book:contact-books-001:${RUN_ID}:${owner}:validation-origin`,idempotencyKey:key(owner,'validation:create-origin') });
  const destination = await rpc(api,'forge_contact_books_create',{ ownerId,name:`Validación destino ${owner}`,bookType:'CUSTOM',bookReference:`book:contact-books-001:${RUN_ID}:${owner}:validation-destination`,idempotencyKey:key(owner,'validation:create-destination') });
  const originReference = origin.bookReference;
  const destinationReference = destination.bookReference;
  const renamed = await rpc(api,'forge_contact_books_rename',{ ownerId,bookReference:originReference,name:`Validación origen renombrado ${owner}`,idempotencyKey:key(owner,'validation:rename') });
  assert.ok(['UPDATED','REPLAYED'].includes(renamed.status));
  const archived = await rpc(api,'forge_contact_books_archive',{ ownerId,bookReference:destinationReference,idempotencyKey:key(owner,'validation:archive') });
  assert.ok(['ARCHIVED','REPLAYED'].includes(archived.status));
  const restored = await rpc(api,'forge_contact_books_restore',{ ownerId,bookReference:destinationReference,idempotencyKey:key(owner,'validation:restore') });
  assert.ok(['RESTORED','REPLAYED'].includes(restored.status));
  const duplicate = await rpc(api,'forge_contact_books_create',{ ownerId,name:`Validación origen renombrado ${owner}`,bookType:'CUSTOM',bookReference:`book:contact-books-001:${RUN_ID}:${owner}:duplicate`,idempotencyKey:key(owner,'validation:duplicate') });
  assert.ok(['REJECTED','REPLAYED'].includes(duplicate.status));
  await rpc(api,'forge_contact_books_add_members',{ ownerId,bookReference:originReference,personReferences:people.slice(0,3),source:'SYNTHETIC_ACCEPTANCE',idempotencyKey:key(owner,'validation:add') });
  const removed = await rpc(api,'forge_contact_books_remove_members',{ ownerId,bookReference:originReference,personReferences:[people[0]],idempotencyKey:key(owner,'validation:remove') });
  assert.ok(['UPDATED','REPLAYED'].includes(removed.status));
  const personStillExists = await api.from('commercial_people').select('id').eq('advisor_id',ownerId).eq('person_reference',people[0]).single();
  assert.ifError(personStillExists.error);
  await rpc(api,'forge_contact_books_add_members',{ ownerId,bookReference:originReference,personReferences:[people[0]],source:'SYNTHETIC_ACCEPTANCE',idempotencyKey:key(owner,'validation:re-add') });
  const moved = await rpc(api,'forge_contact_books_move_members',{ ownerId,originBookReference:originReference,destinationBookReference:destinationReference,personReferences:[people[0]],idempotencyKey:key(owner,'validation:move') });
  assert.ok(['UPDATED','REPLAYED'].includes(moved.status));
  const beforeRollback = await api.rpc('forge_contact_books_list_members',{ p_book_reference:originReference });
  assert.ifError(beforeRollback.error);
  const rollback = await api.rpc('forge_contact_books_move_members',{ p_command:{ ownerId,originBookReference:originReference,destinationBookReference:destinationReference,personReferences:[people[1],`person:missing:${RUN_ID}:${owner}`],idempotencyKey:key(owner,'validation:rollback') } });
  assert.ok(rollback.error,'ATOMIC_MOVE_FAILURE_EXPECTED');
  const afterRollbackOrigin = await api.rpc('forge_contact_books_list_members',{ p_book_reference:originReference });
  const afterRollbackDestination = await api.rpc('forge_contact_books_list_members',{ p_book_reference:destinationReference });
  assert.ifError(afterRollbackOrigin.error); assert.ifError(afterRollbackDestination.error);
  assert.equal(afterRollbackOrigin.data.some(item => item.personReference===people[1]),true);
  assert.equal(afterRollbackDestination.data.some(item => item.personReference===people[1]),false);
  const byName = await api.rpc('forge_contact_books_list',{ p_include_archived:true,p_sort:'NAME_ASC' });
  const byDate = await api.rpc('forge_contact_books_list',{ p_include_archived:true,p_sort:'CREATED_AT_DESC' });
  assert.ifError(byName.error); assert.ifError(byDate.error);
  const names = byName.data.map(item => item.name.normalize('NFKD').replace(/[\u0300-\u036f]/g,'').toLowerCase());
  assert.deepEqual(names,[...names].sort((a,b)=>a.localeCompare(b)));
  const dates = byDate.data.map(item => Date.parse(item.createdAt));
  assert.deepEqual(dates,[...dates].sort((a,b)=>b-a));
  const direct = await api.from('contact_books').insert({ owner_id:ownerId,book_reference:`book:forbidden:${RUN_ID}:${owner}`,name:'Forbidden',normalized_name:'forbidden',book_type:'CUSTOM',created_by:ownerId,updated_by:ownerId });
  assert.ok(direct.error,'DIRECT_TABLE_WRITE_MUST_BE_BLOCKED');
  return { rename:true,archiveRestore:true,removePreservesPerson:true,atomicMove:true,rollback:true,sortByName:true,sortByDate:true,directWriteBlocked:true,beforeRollbackCount:beforeRollback.data.length };
}

const report = { runId:RUN_ID,dataClass:'NON_PERSONAL_SYNTHETIC_ACCEPTANCE_DATA',users:{},isolation:{},status:'PENDING' };
try {
  const ids = {};
  [ids.A,ids.B] = await Promise.all([login(clients.A,'A'),login(clients.B,'B')]);
  assert.notEqual(ids.A,ids.B);
  for (const owner of ['A','B']) {
    const classified = await classify(clients[owner],owner,ids[owner]);
    await ensurePeople(clients[owner],owner,ids[owner],classified.prospects);
    report.users[owner] = {
      los30:await createBook(clients[owner],owner,ids[owner],'Los 30 mejores','top-30',classified.best),
      amigos:await createBook(clients[owner],owner,ids[owner],'Mis amigos','friends',classified.friends),
      friendshipLabelsAdded:classified.friendshipLabelsAdded,
      commands:await validateCommands(clients[owner],owner,ids[owner],classified.best),
    };
  }
  const foreignA = await rpc(clients.A,'forge_contact_books_archive',{ ownerId:ids.B,bookReference:report.users.B.amigos.bookReference,idempotencyKey:key('A','cross-owner') }).then(() => null, error => error);
  assert.ok(foreignA);
  const aReadsB = await clients.A.from('contact_books').select('id').eq('book_reference',report.users.B.amigos.bookReference);
  const bReadsA = await clients.B.from('contact_books').select('id').eq('book_reference',report.users.A.amigos.bookReference);
  assert.ifError(aReadsB.error); assert.ifError(bReadsA.error); assert.equal(aReadsB.data.length,0); assert.equal(bReadsA.data.length,0);
  report.isolation = { ACannotReadB:true,BCannotReadA:true,ACannotMutateB:true };
  report.status = 'PASS';
} finally {
  await Promise.allSettled([clients.A.auth.signOut(),clients.B.auth.signOut()]);
}
for (const name of required) assert.equal(JSON.stringify(report).includes(process.env[name]),false,`SECRET_LEAK:${name}`);
mkdirSync(dirname(OUT),{ recursive:true });
writeFileSync(OUT,`${JSON.stringify(report,null,2)}\n`);
console.log('CONTACT_BOOKS_001_SYNTHETIC_ACCEPTANCE=PASS');
