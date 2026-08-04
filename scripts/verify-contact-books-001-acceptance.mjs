import assert from 'node:assert/strict';
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';
import { createClient } from '@supabase/supabase-js';

const RUN_ID = process.env.FORGE_CONTACT_BOOKS_RUN_ID || '20260803_213631';
const OUT = process.env.FORGE_CONTACT_BOOKS_VERIFY_EVIDENCE || 'artifacts/contact-books-001/verification.json';
const required = ['SUPABASE_URL','SUPABASE_ANON_KEY','ADVISOR_A_EMAIL','ADVISOR_A_PASSWORD','ADVISOR_B_EMAIL','ADVISOR_B_PASSWORD'];
for (const name of required) assert.ok(process.env[name],`${name}_MISSING`);
const make = () => createClient(process.env.SUPABASE_URL,process.env.SUPABASE_ANON_KEY,{ auth:{ persistSession:false,autoRefreshToken:false,detectSessionInUrl:false } });
const clients = { A:make(),B:make() };
const credentials = { A:[process.env.ADVISOR_A_EMAIL,process.env.ADVISOR_A_PASSWORD],B:[process.env.ADVISOR_B_EMAIL,process.env.ADVISOR_B_PASSWORD] };
const reports = {};

try {
  for (const owner of ['A','B']) {
    const auth = await clients[owner].auth.signInWithPassword({ email:credentials[owner][0],password:credentials[owner][1] });
    assert.ifError(auth.error);
    const ownerId = auth.data.user.id;
    const state = await clients[owner].rpc('forge_demo_current_session');
    assert.ifError(state.error); assert.equal(state.data?.readOnly,true); assert.equal(state.data?.dataClass,'SYNTHETIC');
    const books = await clients[owner].rpc('forge_contact_books_list',{ p_include_archived:true,p_sort:'CREATED_AT_DESC' });
    assert.ifError(books.error);
    const expected = suffix => `book:contact-books-001:${RUN_ID}:${owner}:${suffix}`;
    const top = books.data.find(item => item.bookReference===expected('top-30'));
    const friends = books.data.find(item => item.bookReference===expected('friends'));
    assert.equal(top?.memberCount,30); assert.equal(friends?.memberCount,40);
    const topMembers = await clients[owner].rpc('forge_contact_books_list_members',{ p_book_reference:top.bookReference });
    const friendMembers = await clients[owner].rpc('forge_contact_books_list_members',{ p_book_reference:friends.bookReference });
    assert.ifError(topMembers.error); assert.ifError(friendMembers.error); assert.equal(topMembers.data.length,30); assert.equal(friendMembers.data.length,40);
    assert.equal(new Set(topMembers.data.map(item=>item.personReference)).size,30);
    assert.equal(new Set(friendMembers.data.map(item=>item.personReference)).size,40);
    const blocked = await clients[owner].rpc('forge_contact_books_archive',{ p_command:{ ownerId,bookReference:top.bookReference,idempotencyKey:`contact-books:${RUN_ID}:${owner}:sealed-mutation` } });
    assert.ok(blocked.error,'SEALED_MUTATION_MUST_BE_BLOCKED');
    reports[owner] = { ownerId,topReference:top.bookReference,friendsReference:friends.bookReference,topCount:30,friendsCount:40,sealedMutationBlocked:true };
  }
  const aReadsB = await clients.A.from('contact_books').select('id').eq('book_reference',reports.B.friendsReference);
  const bReadsA = await clients.B.from('contact_books').select('id').eq('book_reference',reports.A.friendsReference);
  assert.ifError(aReadsB.error); assert.ifError(bReadsA.error); assert.equal(aReadsB.data.length,0); assert.equal(bReadsA.data.length,0);
} finally {
  await Promise.allSettled([clients.A.auth.signOut(),clients.B.auth.signOut()]);
}

const sanitized = { runId:RUN_ID,dataClass:'NON_PERSONAL_SYNTHETIC_ACCEPTANCE_DATA',users:{ A:{ topCount:reports.A?.topCount,friendsCount:reports.A?.friendsCount,sealedMutationBlocked:reports.A?.sealedMutationBlocked },B:{ topCount:reports.B?.topCount,friendsCount:reports.B?.friendsCount,sealedMutationBlocked:reports.B?.sealedMutationBlocked } },tenantIsolation:{ ACannotReadB:true,BCannotReadA:true },syntheticDataSealed:true,status:'PASS' };
for (const name of required) assert.equal(JSON.stringify(sanitized).includes(process.env[name]),false,`SECRET_LEAK:${name}`);
mkdirSync(dirname(OUT),{ recursive:true }); writeFileSync(OUT,`${JSON.stringify(sanitized,null,2)}\n`);
console.log('CONTACT_BOOKS_001_REMOTE_VERIFICATION=PASS');
