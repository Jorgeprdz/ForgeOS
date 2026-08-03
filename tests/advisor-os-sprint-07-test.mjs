import test from 'node:test';
import assert from 'node:assert/strict';
import { createPipelineToQuoteRuntime, PipelineToQuoteError } from '../advisor-os/quotes/pipeline-to-quote-runtime.js';

function authorities(overrides = {}) {
  return {
    personAuthority: { resolveConfirmedPerson: async ({ personReference }) => ({ personReference, displayName: 'Ana Torres' }) },
    pipelineAuthority: { resolveActiveProspect: async ({ prospectReference }) => ({ prospectReference, personReference: 'PERSON-1' }) },
    quoteAuthority: { createOrReuseQuote: async input => ({ quoteReference: 'QUOTE-1', personReference: input.personReference, prospectReference: input.prospectReference }) },
    printableAuthority: { preparePrintable: async ({ quoteReference }) => ({ quoteReference, previewUrl: '/quote-printable', fileName: 'Ana-Torres-QUOTE-1.pdf' }) },
    outcomeAuthority: { recordQuoteOutcome: async input => ({ mutationId: 'OUTCOME-1', ...input }) },
    nextActionAuthority: { scheduleFromQuoteOutcome: async input => ({ mutationId: 'ACTION-1', quoteReference: input.quoteReference }) },
    ...overrides,
  };
}

const input = { personReference: 'PERSON-1', prospectReference: 'PROSPECT-1', appointmentReference: 'APT-1', needReference: 'NEED-1', productReference: 'VIDA_MUJER', correlationId: 'CORR-1' };

test('person-to-quote preserves canonical identity and requires preview', async () => {
  const runtime = createPipelineToQuoteRuntime(authorities());
  const preview = await runtime.prepare(input);
  assert.equal(preview.status, 'PREVIEW_REQUIRED');
  assert.equal(preview.handoff.personReference, 'PERSON-1');
  const receipt = await runtime.createQuote(preview);
  assert.equal(receipt.status, 'QUOTE_READY');
  assert.equal(receipt.quote.personReference, 'PERSON-1');
});

test('cross-person prospect is rejected', async () => {
  const runtime = createPipelineToQuoteRuntime(authorities({ pipelineAuthority: { resolveActiveProspect: async () => ({ prospectReference: 'PROSPECT-1', personReference: 'PERSON-2' }) } }));
  await assert.rejects(() => runtime.prepare(input), error => error instanceof PipelineToQuoteError && error.code === 'PROSPECT_PERSON_MISMATCH');
});

test('printable handoff exposes preview print and download without direct rendering', async () => {
  const runtime = createPipelineToQuoteRuntime(authorities());
  const preview = await runtime.prepare(input);
  const quote = await runtime.createQuote(preview);
  const document = await runtime.prepareDocument(quote);
  assert.equal(document.status, 'DOCUMENT_READY');
  assert.equal(document.previewAllowed, true);
  assert.equal(document.printAllowed, true);
  assert.equal(document.downloadAllowed, true);
});

test('follow-up outcome delegates to next-action authority', async () => {
  const runtime = createPipelineToQuoteRuntime(authorities());
  const receipt = await runtime.captureOutcome({ quoteReference: 'QUOTE-1', outcome: 'FOLLOW_UP', personReference: 'PERSON-1', prospectReference: 'PROSPECT-1', dueAt: '2026-08-06T15:00:00-06:00' });
  assert.equal(receipt.status, 'OUTCOME_RECORDED');
  assert.equal(receipt.nextAction.mutationId, 'ACTION-1');
});

test('runtime fails closed when quote authority is absent', async () => {
  const runtime = createPipelineToQuoteRuntime(authorities({ quoteAuthority: null }));
  const preview = await runtime.prepare(input);
  await assert.rejects(() => runtime.createQuote(preview), error => error.code === 'QUOTE_AUTHORITY_REQUIRED');
});

test('diagnostics preserve boundaries', () => {
  const diagnostics = createPipelineToQuoteRuntime(authorities()).diagnostics();
  assert.deepEqual(diagnostics, { directDatabaseWrite: false, duplicatePersonCapture: false, quoteAuthorityReused: true, confirmationRequired: true });
});
