import { summarizeGmmQuote } from '../../../gmm-quote-summary-engine.js';

export const QUOTE_READ_MODEL_ADAPTER_ID = 'forge.quote.read_model.adapter.v1';
export const QUOTE_READ_MODEL_SAFE_ERROR = 'QUOTE_READ_MODEL_NOT_MODELED';
export const QUOTE_READ_MODEL_SCHEMA_VERSION = 'forge.backend.read_model.v1';
export const QUOTE_READ_MODEL_SOURCE_ENGINE = 'gmm-quote-summary-engine.js';

const PREVIEW_QUOTE_ID = 'quote_preview_gmm_lariza_alfa_medical_069c';
const PREVIEW_EVIDENCE_ID = 'quote_evidence_gmm_lariza_static_text_069c';

const SAFETY_FLAGS = Object.freeze({
  crmWrite: false,
  pipelineWrite: false,
  policyWrite: false,
  quoteWrite: false,
  taskCreate: false,
  calendarCreate: false,
  messageSend: false,
  authReal: false,
  providerRuntime: false,
  secretAccess: false,
  browserPersistence: false,
  realEngineExecution: false,
  realEffectsAllowed: false,
  realEffectsEnabled: false,
  backendConnection: false
});

const BLOCKED_EFFECTS = Object.freeze([
  'quote_create',
  'quote_update',
  'quote_delete',
  'quote_send',
  'quote_pdf_generate',
  'proposal_generate',
  'provider_call',
  'policy_write',
  'crm_write',
  'pipeline_write',
  'task_create',
  'calendar_create',
  'message_send',
  'auth_runtime',
  'secret_access',
  'browser_persistence',
  'backend_connection',
  'real_engine_execution'
]);

const PREVIEW_FRESHNESS = Object.freeze({
  status: 'preview_static',
  source_label: '069C local static GMM quote text',
  mapped_at: 'static_preview_069c'
});

const PREVIEW_GMM_QUOTE_TEXT = `
Estas a punto de proteger mejor tu salud.
CotizadorWeb Version 2.18.5.0
Fecha en que se elaboro la cotizacion: 05 de junio de 2026
Asesor: ANA KAREN GARZA LOPERENA
Fecha inicio vigencia: 05/06/2026
Acabas de cotizar un plan:
Alfa Medical
Plan: INTEGRO Zona: Norte Deducible: $25,000 Pesos
Coaseguro: 10% con limite de $97,000.00 Pesos
Suma Asegurada: $170,000,000 Pesos
Territorialidad: Nacional
Tabulador: GAMMA
Moneda: Pesos
Titular: Lariza Saenz Femenino 23 Riesgo Normal Esquema deducible Unico: $25,000.00 Esquema coaseguro Unico Prima $38,276.41
Eliminacion de Deducible por Accidente Suma Asegurada $25,000 Pesos Prima $975.55
Forma de Pago: ANUAL
Derecho de Poliza $1,600.00 IVA $6,536.31 PRIMA ANUAL $47,388.27
Esta cotizacion es ilustrativa y no forma parte del contrato de seguro.
`;

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function previewField(value, evidenceIds = [PREVIEW_EVIDENCE_ID]) {
  return {
    value,
    mode: 'preview_non_binding',
    source_evidence_ids: clone(evidenceIds),
    freshness_metadata: clone(PREVIEW_FRESHNESS)
  };
}

function makeAudit() {
  return {
    event: 'read_model_used',
    adapterId: QUOTE_READ_MODEL_ADAPTER_ID,
    sourceEngineRef: QUOTE_READ_MODEL_SOURCE_ENGINE,
    realEffectsAllowed: false
  };
}

function makeEmptyEnvelope(reason = 'no_modeled_quotes') {
  return {
    schemaVersion: QUOTE_READ_MODEL_SCHEMA_VERSION,
    domainId: 'quote',
    routeClass: 'read_only',
    readModel: {
      status: 'empty'
    },
    records: [],
    emptyState: {
      reason,
      message: 'No modeled quote read-model record matched this preview request.'
    },
    errors: reason === 'filter_no_match'
      ? [{
          code: QUOTE_READ_MODEL_SAFE_ERROR,
          safeMessage: 'Quote read model detail is not modeled for the requested id.',
          recoverable: true
        }]
      : [],
    audit: makeAudit(),
    freshness: clone(PREVIEW_FRESHNESS),
    blockedEffects: clone(BLOCKED_EFFECTS),
    safetyFlags: clone(SAFETY_FLAGS),
    canonicalQuoteTruthClaimed: false,
    newQuoteEngineCreated: false,
    newProductDatabaseCreated: false
  };
}

function hasModeledQuote(summary = {}) {
  return Boolean(summary.product && summary.plan && summary.prospect);
}

function mapQuoteSummary(summary) {
  const sourceEvidenceIds = [PREVIEW_EVIDENCE_ID];
  const coverageParts = [
    summary.product,
    summary.plan,
    summary.territoriality ? `territoriality:${summary.territoriality}` : null,
    summary.zone ? `zone:${summary.zone}` : null,
    summary.tabulator ? `tabulator:${summary.tabulator}` : null
  ].filter(Boolean);

  return {
    quote_id: PREVIEW_QUOTE_ID,
    client_ref: {
      entity_type: 'client',
      entity_id: 'client_preview_lariza',
      display_name: summary.prospect || 'Lariza Saenz'
    },
    policy_ref: null,
    opportunity_ref: {
      entity_type: 'opportunity',
      entity_id: 'opp_candidate_preview_lariza_gmm_review',
      display_name: 'Lariza GMM quote review candidate'
    },
    product_ref: {
      product_name: summary.product,
      plan_name: summary.plan,
      mode: 'preview_from_quote_text'
    },
    quote_type: 'gmm_quote_preview',
    quote_status: 'preview_static',
    carrier_ref: null,
    premium_preview: previewField({
      amount: summary.premium,
      currency: summary.currency || 'Pesos',
      binding: false
    }, sourceEvidenceIds),
    coverage_summary: previewField({
      summary: coverageParts,
      optional_coverages: summary.optionalCoverages || [],
      warnings: summary.warnings || []
    }, sourceEvidenceIds),
    deductible_preview: previewField({
      amount: summary.deductible,
      currency: summary.currency || 'Pesos',
      binding: false
    }, sourceEvidenceIds),
    coinsurance_preview: previewField({
      percent: summary.coinsurance,
      cap: summary.coinsuranceCap,
      binding: false
    }, sourceEvidenceIds),
    sum_assured_preview: previewField({
      amount: summary.sumInsured,
      currency: summary.currency || 'Pesos',
      binding: false
    }, sourceEvidenceIds),
    payment_frequency: previewField(summary.paymentMode || 'ANUAL', sourceEvidenceIds),
    assumptions: [
      'Quote values are preview/non-binding.',
      'Issued policy controls contractual terms.',
      'No provider execution or quote write occurred.'
    ],
    source_engine_ref: QUOTE_READ_MODEL_SOURCE_ENGINE,
    source_evidence_ids: sourceEvidenceIds,
    freshness_metadata: clone(PREVIEW_FRESHNESS),
    audit_event: 'read_model_used',
    blocked_effects: clone(BLOCKED_EFFECTS),
    safety_flags: clone(SAFETY_FLAGS),
    canonicalQuoteTruthClaimed: false
  };
}

function makeOkEnvelope(records) {
  return {
    schemaVersion: QUOTE_READ_MODEL_SCHEMA_VERSION,
    domainId: 'quote',
    routeClass: 'read_only',
    readModel: {
      status: records.length ? 'ok' : 'empty'
    },
    records,
    emptyState: records.length ? null : {
      reason: 'no_modeled_quotes',
      message: 'No modeled quote read-model records are available.'
    },
    errors: [],
    audit: makeAudit(),
    freshness: clone(PREVIEW_FRESHNESS),
    blockedEffects: clone(BLOCKED_EFFECTS),
    safetyFlags: clone(SAFETY_FLAGS),
    canonicalQuoteTruthClaimed: false,
    newQuoteEngineCreated: false,
    newProductDatabaseCreated: false
  };
}

export function getQuoteReadModelManifest() {
  return {
    adapterId: QUOTE_READ_MODEL_ADAPTER_ID,
    adapterType: 'local_static_existing_engine_wrapper',
    adapterMode: 'read_only',
    routeClass: 'read_only',
    domainId: 'quote',
    schemaVersion: QUOTE_READ_MODEL_SCHEMA_VERSION,
    freshness: { status: 'preview_static' },
    sourceEngineRef: QUOTE_READ_MODEL_SOURCE_ENGINE,
    safeErrorCode: QUOTE_READ_MODEL_SAFE_ERROR,
    canonicalQuoteTruthClaimed: false,
    newQuoteEngineCreated: false,
    newProductDatabaseCreated: false,
    blockedEffects: clone(BLOCKED_EFFECTS),
    safetyFlags: clone(SAFETY_FLAGS)
  };
}

export function listQuotes(input = {}) {
  if (input && input.forceEmpty === true) {
    return makeEmptyEnvelope('no_modeled_quotes');
  }

  const text = typeof input.text === 'string' && input.text.trim()
    ? input.text
    : PREVIEW_GMM_QUOTE_TEXT;
  const summary = summarizeGmmQuote({ text });

  if (!hasModeledQuote(summary)) {
    return makeEmptyEnvelope('no_modeled_quotes');
  }

  return makeOkEnvelope([mapQuoteSummary(summary)]);
}

export function getQuoteDetail(quoteId) {
  if (!quoteId || typeof quoteId !== 'string') {
    return {
      ...makeEmptyEnvelope('invalid_input'),
      readModel: { status: 'error' },
      errors: [{
        code: QUOTE_READ_MODEL_SAFE_ERROR,
        safeMessage: 'Quote read model detail requires a quote id.',
        recoverable: true
      }]
    };
  }

  const envelope = listQuotes();
  const record = envelope.records.find((quote) => quote.quote_id === quoteId);

  if (!record) {
    return makeEmptyEnvelope('filter_no_match');
  }

  return makeOkEnvelope([record]);
}
