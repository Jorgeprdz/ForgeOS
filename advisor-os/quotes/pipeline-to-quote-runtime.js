const freeze = value => Object.freeze({ ...value });
const text = value => String(value || '').trim();

export class PipelineToQuoteError extends Error {
  constructor(code, message) { super(message); this.name = 'PipelineToQuoteError'; this.code = code; }
}
const fail = (code, message) => { throw new PipelineToQuoteError(code, message); };

function required(value, code, label) {
  const normalized = text(value);
  if (!normalized) fail(code, `${label} es obligatorio.`);
  return normalized;
}

export function normalizeQuoteHandoff(input = {}) {
  return freeze({
    personReference: required(input.personReference, 'PERSON_REFERENCE_REQUIRED', 'La persona'),
    prospectReference: required(input.prospectReference, 'PROSPECT_REFERENCE_REQUIRED', 'El prospecto'),
    appointmentReference: text(input.appointmentReference) || null,
    needReference: text(input.needReference) || null,
    productReference: required(input.productReference, 'PRODUCT_REFERENCE_REQUIRED', 'El producto'),
    sourceRoute: text(input.sourceRoute) || 'advisor-sales-pipeline',
    returnRoute: text(input.returnRoute) || 'advisor-sales-pipeline',
    correlationId: required(input.correlationId, 'CORRELATION_ID_REQUIRED', 'La correlación'),
  });
}

export function createPipelineToQuoteRuntime({
  personAuthority,
  pipelineAuthority,
  quoteAuthority,
  printableAuthority,
  outcomeAuthority,
  nextActionAuthority,
} = {}) {
  async function prepare(input = {}) {
    const handoff = normalizeQuoteHandoff(input);
    if (!personAuthority?.resolveConfirmedPerson) fail('PERSON_AUTHORITY_REQUIRED', 'La autoridad de Persona no está conectada.');
    if (!pipelineAuthority?.resolveActiveProspect) fail('PIPELINE_AUTHORITY_REQUIRED', 'La autoridad de Pipeline no está conectada.');
    const [person, prospect] = await Promise.all([
      personAuthority.resolveConfirmedPerson({ personReference: handoff.personReference }),
      pipelineAuthority.resolveActiveProspect({ prospectReference: handoff.prospectReference }),
    ]);
    if (person?.personReference !== handoff.personReference) fail('PERSON_IDENTITY_MISMATCH', 'La persona resuelta no coincide.');
    if (prospect?.personReference !== handoff.personReference) fail('PROSPECT_PERSON_MISMATCH', 'El prospecto pertenece a otra persona.');
    return freeze({ status: 'PREVIEW_REQUIRED', handoff, person, prospect, directWrite: false });
  }

  async function createQuote(preview) {
    if (preview?.status !== 'PREVIEW_REQUIRED') fail('QUOTE_PREVIEW_REQUIRED', 'La cotización requiere preview.');
    if (!quoteAuthority?.createOrReuseQuote) fail('QUOTE_AUTHORITY_REQUIRED', 'La autoridad de Cotizaciones no está conectada.');
    const quote = await quoteAuthority.createOrReuseQuote({ ...preview.handoff });
    if (!quote?.quoteReference) fail('QUOTE_RECEIPT_REQUIRED', 'La autoridad no devolvió recibo de cotización.');
    if (quote.personReference && quote.personReference !== preview.handoff.personReference) fail('QUOTE_PERSON_MISMATCH', 'La cotización quedó ligada a otra persona.');
    return freeze({ status: 'QUOTE_READY', quote, returnRoute: preview.handoff.returnRoute, correlationId: preview.handoff.correlationId });
  }

  async function prepareDocument(quoteReceipt) {
    if (quoteReceipt?.status !== 'QUOTE_READY') fail('QUOTE_READY_REQUIRED', 'Se requiere una cotización vigente.');
    if (!printableAuthority?.preparePrintable) fail('PRINTABLE_AUTHORITY_REQUIRED', 'La autoridad printable no está conectada.');
    const document = await printableAuthority.preparePrintable({ quoteReference: quoteReceipt.quote.quoteReference });
    return freeze({ status: 'DOCUMENT_READY', quote: quoteReceipt.quote, document, previewAllowed: true, printAllowed: true, downloadAllowed: true });
  }

  async function captureOutcome(input = {}) {
    const quoteReference = required(input.quoteReference, 'QUOTE_REFERENCE_REQUIRED', 'La cotización');
    const outcome = required(input.outcome, 'OUTCOME_REQUIRED', 'El resultado').toUpperCase();
    if (!['PRESENTED','FOLLOW_UP','ACCEPTED','REJECTED','POSTPONED'].includes(outcome)) fail('OUTCOME_INVALID', 'El resultado no es válido.');
    if (!outcomeAuthority?.recordQuoteOutcome) fail('OUTCOME_AUTHORITY_REQUIRED', 'La autoridad de resultado no está conectada.');
    const receipt = await outcomeAuthority.recordQuoteOutcome({ ...input, quoteReference, outcome });
    if (outcome === 'FOLLOW_UP' || outcome === 'POSTPONED') {
      if (!nextActionAuthority?.scheduleFromQuoteOutcome) fail('NEXT_ACTION_AUTHORITY_REQUIRED', 'La siguiente acción no está conectada.');
      const nextAction = await nextActionAuthority.scheduleFromQuoteOutcome({ ...input, quoteReference, outcome });
      return freeze({ status: 'OUTCOME_RECORDED', receipt, nextAction });
    }
    return freeze({ status: 'OUTCOME_RECORDED', receipt, nextAction: null });
  }

  return Object.freeze({ prepare, createQuote, prepareDocument, captureOutcome, diagnostics: () => freeze({ directDatabaseWrite: false, duplicatePersonCapture: false, quoteAuthorityReused: true, confirmationRequired: true }) });
}
