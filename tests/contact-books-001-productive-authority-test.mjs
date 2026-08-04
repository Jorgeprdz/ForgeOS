import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { createContactBooksRuntime } from '../advisor-os/contact-books/contact-books-runtime.js';
import { createContactBooksSupabaseRepository } from '../advisor-os/contact-books/contact-books-supabase-repository.js';

const migrationPath = '../supabase/migrations/20260803000002_contact_books_productive_authority.sql';

test('Contact Books schema organizes CommercialPerson without copying contact truth', async () => {
  const sql = await readFile(new URL(migrationPath, import.meta.url), 'utf8');
  const schema = sql.slice(0, sql.indexOf('create or replace function'));
  assert.match(sql, /references public\.commercial_people\(id, advisor_id\) on delete restrict/);
  assert.match(sql, /references public\.contact_books\(id, owner_id\) on delete restrict/);
  assert.match(sql, /force row level security/g);
  assert.match(sql, /contact_books_owner_active_name_uq/);
  assert.match(sql, /contact_books_owner_active_project_200_uq/);
  assert.match(sql, /contact_book_memberships_active_uq/);
  assert.doesNotMatch(sql, /on delete cascade|create table public\.(people|persons|contacts)\b/i);
  assert.doesNotMatch(schema, /\b(phone|email|display_name|first_name|last_name)\b/i);
});

test('all mutations are owner-scoped RPC commands and direct writes stay revoked', async () => {
  const sql = await readFile(new URL(migrationPath, import.meta.url), 'utf8');
  for (const command of ['create','rename','archive','restore','add_members','remove_members','move_members','list','list_members','resolve_project_200']) {
    assert.match(sql, new RegExp(`forge_contact_books_${command.replace(/[.*+?^${}()|[\\]\\]/g, '\\$&')}`));
  }
  assert.match(sql, /auth\.uid\(\)/);
  assert.match(sql, /pg_advisory_xact_lock/);
  assert.match(sql, /IDEMPOTENCY_KEY_REUSED/);
  assert.match(sql, /revoke all on public\.contact_books from public, anon, authenticated/);
  assert.doesNotMatch(sql, /grant (insert|update|delete)/i);
  assert.match(sql, /DESTINATION_MEMBERSHIP_NOT_CONFIRMED/);
  assert.match(sql, /ORIGIN_MEMBERSHIP_REMOVAL_NOT_CONFIRMED/);
  assert.match(sql, /forge_demo_read_only_guard/);
});

test('Supabase repository uses RPCs only and rejects late or cross-user results', async () => {
  const calls = [];
  let generation = 1;
  let currentUserId = 'advisor-a';
  let listCount = 0;
  const client = { async rpc(name, args) {
    calls.push({ name, args });
    if (name === 'forge_contact_books_list') {
      listCount += 1;
      return { data: listCount === 1 ? [] : [{ bookId: 'b1', bookReference: 'book:a', name: 'Amigos' }], error: null };
    }
    return { data: { status: 'CREATED', bookId: 'b1', bookReference: 'book:a', readAfterWriteVerified: true }, error: null };
  } };
  const repository = createContactBooksSupabaseRepository({ client, userId: 'advisor-a', getCurrentUserId: () => currentUserId, getGeneration: () => generation });
  const runtime = createContactBooksRuntime({ repository });
  const created = await runtime.createBook({ ownerId: 'advisor-a', name: 'Amigos', idempotencyKey: 'stable-create' });
  assert.equal(created.book.bookReference, 'book:a');
  assert.equal(calls[0].name, 'forge_contact_books_create');
  assert.equal(calls[0].args.p_command.idempotencyKey, 'stable-create');
  assert.equal(repository.commandAuthority, true);
  assert.equal(repository.diagnostics().directDatabaseWrite, false);
  await assert.rejects(() => runtime.createBook({ ownerId: 'advisor-b', name: 'Ajeno' }), /SESSION_CHANGED/);

  client.rpc = async () => {
    generation += 1;
    return { data: [], error: null };
  };
  await assert.rejects(() => repository.listBooks({ ownerId: 'advisor-a' }), /LATE_RESULT_REJECTED/);
  currentUserId = 'advisor-b';
  await assert.rejects(() => repository.listBooks({ ownerId: 'advisor-a' }), /SESSION_CHANGED/);
});

test('productive move selects the single atomic RPC path and deduplicates people', async () => {
  const moved = [];
  const repository = {
    async moveMembers(input) { moved.push(input); return { status: 'UPDATED', movedCount: input.personIds.length }; },
  };
  const runtime = createContactBooksRuntime({ repository });
  const result = await runtime.movePeopleBetweenBooks({ ownerId: 'advisor-a', originBookId: 'one', destinationBookId: 'two', personIds: ['p1','p1','p2'], idempotencyKey: 'move-1' });
  assert.equal(result.movedCount, 2);
  assert.deepEqual(moved[0].personIds, ['p1','p2']);
  assert.equal(runtime.diagnostics().atomicRemoteMove, true);
});

test('Material 3 connector exposes exactly two permanent actions without app.js changes', async () => {
  const source = await readFile(new URL('../docs/static-preview/forge-alive-material3/contact-books-material3.js', import.meta.url), 'utf8');
  const repository = await readFile(new URL('../advisor-os/contact-books/contact-books-supabase-repository.js', import.meta.url), 'utf8');
  const intake = await readFile(new URL('../docs/static-preview/forge-alive-material3/cartera-document-intake.js', import.meta.url), 'utf8');
  assert.match(source, />Carga masiva<\/button><button[^>]+>\+ Nuevo libro<\/button>/);
  assert.match(repository, /CONTACT_BOOK_LATE_RESULT_REJECTED|LATE_RESULT_REJECTED/);
  assert.match(source, /demoReadOnly = event\.detail\?\.isDemo === true \? event\.detail\?\.readOnly !== false : false/);
  assert.match(repository, /p_sort: sort/);
  assert.match(source, /forge:auth-state-changed/);
  assert.match(source, /function scrub\(\)/);
  assert.match(intake, /contact-books-material3\.js/);
  assert.doesNotMatch(source, /app\.js|\.from\(|insert\(|update\(|delete\(/);
});

test('controlled deployment and A/B acceptance runners preserve synthetic and canonical boundaries', async () => {
  const deploy = await readFile(new URL('../scripts/deploy-contact-books-001-migration.mjs', import.meta.url), 'utf8');
  const seed = await readFile(new URL('../scripts/seed-contact-books-001-acceptance.mjs', import.meta.url), 'utf8');
  const verify = await readFile(new URL('../scripts/verify-contact-books-001-acceptance.mjs', import.meta.url), 'utf8');
  assert.match(deploy, /SUPABASE_ACCESS_TOKEN_MISSING/);
  assert.match(deploy, /relforcerowsecurity/);
  assert.doesNotMatch(deploy, /service_role/i);
  assert.match(seed, /NON_PERSONAL_SYNTHETIC_ACCEPTANCE_DATA/);
  assert.match(seed, /forge_cartera010b_confirm_identity_resolution/);
  assert.match(seed, /person:beta1022a:/);
  assert.match(seed, /assert\.equal\(best\.length,30\)/);
  assert.match(seed, /assert\.equal\(friends\.length,40\)/);
  assert.match(seed, /ACannotReadB:true,BCannotReadA:true,ACannotMutateB:true,BCannotMutateA:true/);
  assert.match(seed, /ATOMIC_MOVE_FAILURE_EXPECTED/);
  assert.match(seed, /DIRECT_TABLE_WRITE_MUST_BE_BLOCKED/);
  assert.match(seed, /project200Idempotent:true/);
  assert.match(seed, /duplication:'ABSENT'/);
  assert.match(seed, /batchReplay:addReplay\.status/);
  assert.match(verify, /SEALED_MUTATION_MUST_BE_BLOCKED/);
  assert.match(verify, /syntheticDataSealed:true/);
  assert.doesNotMatch(seed, /service_role|admin\.createUser/i);
});
