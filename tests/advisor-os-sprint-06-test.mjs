import test from 'node:test';
import assert from 'node:assert/strict';
import { createContactBooksRuntime } from '../advisor-os/contact-books/contact-books-runtime.js';
import { parseCsv, workbookToRows, mapRows, detectPlan200, reconcileDuplicates, createBulkImportEngine } from '../advisor-os/contact-books/bulk-import-engine.js';
import { createContactBooksUiModel, nextImportStep } from '../advisor-os/contact-books/contact-books-ui-model.js';

function repositoryFixture() {
  const books = []; const memberships = [];
  const api = {
    async findActiveBookByNormalizedName({ ownerId, normalizedName }) { return books.find(book => book.ownerId === ownerId && book.normalizedName === normalizedName) || null; },
    async createBook(input) { const book = { ...input, bookId: `book-${books.length + 1}` }; books.push(book); return book; },
    async ensureMembership(input) { const existing = memberships.find(item => item.bookId === input.bookId && item.personId === input.personId); if (existing) return existing; const membership = { ...input, membershipId: `membership-${memberships.length + 1}` }; memberships.push(membership); return membership; },
    async removeMembership({ bookId, personId }) { const index = memberships.findIndex(item => item.bookId === bookId && item.personId === personId); if (index >= 0) memberships.splice(index, 1); },
    async listBookMembers({ bookId }) { return memberships.filter(item => item.bookId === bookId).map((item, index) => ({ ...item, displayName: index ? 'Ana' : 'Zoe', createdAt: index ? '2026-08-01T00:00:00Z' : '2026-08-02T00:00:00Z' })); },
    async transaction(callback) { return callback(api); },
    books, memberships,
  };
  return api;
}

test('books are idempotent, many-to-many and newest-first by default', async () => {
  const repository = repositoryFixture();
  const runtime = createContactBooksRuntime({ repository, clock: () => '2026-08-03T00:00:00Z' });
  const first = await runtime.resolveProject200Book({ ownerId: 'advisor-1' });
  const second = await runtime.resolveProject200Book({ ownerId: 'advisor-1' });
  assert.equal(first.book.bookId, second.book.bookId);
  await runtime.addPeopleToBook({ ownerId: 'advisor-1', bookId: first.book.bookId, personIds: ['p1','p2','p1'] });
  assert.equal(repository.memberships.length, 2);
  const list = await runtime.listBookMembers({ ownerId: 'advisor-1', bookId: first.book.bookId });
  assert.equal(list.sort, 'CREATED_AT_DESC');
  assert.equal(list.members[0].displayName, 'Zoe');
  assert.equal(runtime.diagnostics().secondPersonStore, false);
});

test('CSV parser, mapping and duplicate reconciliation preserve extra context', () => {
  const rows = parseCsv('Nombre completo,Teléfono,Correo,Estado civil\nMariana López,+52 55 1234 5678,m@x.mx,Viuda');
  const mapped = mapRows(rows);
  assert.equal(mapped.contacts[0].phone, '5512345678');
  assert.equal(mapped.contacts[0].context['Estado civil'], 'Viuda');
  const decisions = reconcileDuplicates(mapped.contacts, [{ personId: 'person-1', phone: '55 1234 5678' }]);
  assert.equal(decisions[0].classification, 'STRONG_MATCH');
  assert.equal(decisions[0].overwriteExistingFields, false);
});

test('safe workbook adapter detects Plan 200 structurally', () => {
  const workbook = { sheetNames: ['Captura'], readSheet: () => [['Nombre','Teléfono','Ocupación','Estado civil','Tiempo de conocerla','Potencial de referidos'],['Ana','555','Ventas','Soltera','5 años','Excelente']] };
  const result = workbookToRows(workbook);
  const detection = detectPlan200({ fileName: '4.-Plan 200.xlsx', sheetNames: result.sheetNames, headers: result.rows[0] });
  assert.equal(result.selectedSheet, 'Captura');
  assert.equal(detection.detected, true);
  assert.equal(detection.template, 'PLAN_200');
  assert.throws(() => workbookToRows({}), /SAFE_WORKBOOK_DECODER_REQUIRED/);
});

test('Plan 200 import reuses person authority, creates membership, context and auto-open receipt', async () => {
  const repository = repositoryFixture();
  const booksRuntime = createContactBooksRuntime({ repository });
  const contexts = []; const batches = [];
  const engine = createBulkImportEngine({
    booksRuntime,
    personAuthority: { async reconcileImportedContact({ contact }) { return { personId: contact.phone === '1' ? 'p1' : 'p2', created: contact.phone === '1' }; } },
    batchRepository: {
      async start(input) { const batch = { ...input, importBatchId: 'batch-1' }; batches.push(batch); return batch; },
      async complete(input) { return input; },
    },
    contextSink: { async append(event) { contexts.push(event); } },
  });
  const contacts = [
    { sourceRow: 2, displayName: 'Ana', phone: '1', context: { Relación: 'Amiga' } },
    { sourceRow: 3, displayName: 'Beto', phone: '2', context: {} },
  ];
  const result = await engine.importPrepared({ ownerId: 'advisor-1', fileName: 'Plan 200.xlsx', fileType: 'XLSX', prepared: reconcileDuplicates(contacts), detectedTemplate: 'PLAN_200' });
  assert.equal(result.destinationBookId, result.autoOpenBookId);
  assert.equal(repository.memberships.length, 2);
  assert.equal(contexts[0].type, 'CONTACT_CONTEXT_IMPORTED');
  assert.equal(engine.diagnostics().formulaExecution, false);
});

test('UI keeps only two permanent actions and Plan 200 skips destination selection', () => {
  const model = createContactBooksUiModel({ selectedPersonIds: ['p1','p2'] });
  assert.deepEqual(model.permanentActions.map(item => item.id), ['BULK_IMPORT','CREATE_BOOK']);
  assert.equal(model.selection.contextualActions.includes('MOVE_TO_BOOK'), true);
  assert.equal(model.mobileSafeAreaRequired, true);
  assert.equal(nextImportStep({ step: 'PREVIEW', detectedTemplate: 'PLAN_200' }).step, 'CONFIRM');
  assert.equal(nextImportStep({ step: 'PREVIEW', detectedTemplate: 'GENERIC' }).step, 'CHOOSE_DESTINATION');
});

test('Pipeline activation fails closed without canonical authority', async () => {
  const repository = repositoryFixture();
  const engine = createBulkImportEngine({ booksRuntime: createContactBooksRuntime({ repository }), personAuthority: {}, batchRepository: {} });
  const result = await engine.activateInPipeline({ ownerId: 'advisor-1', personIds: ['p1'], originBookId: 'book-1' });
  assert.equal(result.ok, false);
  assert.equal(result.reason, 'PIPELINE_AUTHORITY_NOT_REGISTERED');
});
