import {
  getProductIntelligenceReadModelByFamily,
  getProductIntelligenceReadModelCatalog
} from '../product-intelligence/product-intelligence-read-model-adapter-073d.js';

export const ADAPTER_ID = 'forge.quote_preview.product_intelligence.binding.adapter.v1';
export const SCHEMA_VERSION = 'forge.quote_preview.product_intelligence.binding.v1';

export const SAFE_ERROR_CODES = Object.freeze({
  notBound: 'QUOTE_PREVIEW_PRODUCT_INTELLIGENCE_NOT_BOUND',
  productFamilyNotMapped: 'QUOTE_PREVIEW_PRODUCT_FAMILY_NOT_MAPPED',
  parserNotMapped: 'QUOTE_PREVIEW_PARSER_NOT_MAPPED',
  calculatorNotMapped: 'QUOTE_PREVIEW_CALCULATOR_NOT_MAPPED',
  sourceEvidenceRequired: 'QUOTE_PREVIEW_SOURCE_EVIDENCE_REQUIRED',
  freshnessRequired: 'QUOTE_PREVIEW_FRESHNESS_REQUIRED'
});

export const DEFAULT_SAFETY_FLAGS = Object.freeze({
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
  backendConnection: false,
  parserExecution: false,
  calculatorExecution: false,
  banxicoCall: false,
  pdfRead: false,
  providerCall: false,
  quoteGeneration: false,
  quoteSend: false
});

export const REQUIRED_BINDING_FIELDS = Object.freeze([
  'quote_preview_binding_id',
  'quote_preview_request_id',
  'product_intelligence_ref',
  'product_family',
  'parser_ref',
  'calculator_refs',
  'coverage_semantics_ref',
  'premium_semantics_ref',
  'currency_semantics_ref',
  'projection_semantics_ref',
  'evidence_requirements',
  'freshness_requirements',
  'blocked_effects',
  'safety_flags',
  'safe_error'
]);

const DEFAULT_BLOCKED_EFFECTS = Object.freeze([
  'pdf_read',
  'parser_execute',
  'calculator_execute',
  'banxico_call',
  'quote_generate',
  'provider_call',
  'quote_write',
  'quote_send',
  'crm_write',
  'policy_write',
  'pipeline_write',
  'task_create',
  'calendar_create',
  'message_send',
  'backend_connection',
  'browser_persistence',
  'secret_access',
  'real_engine_execution'
]);

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function normalizeText(value) {
  return String(value || '').trim().toLowerCase();
}

function getHintText(value) {
  if (!value) return '';
  if (typeof value === 'string') return value;
  return value.display_name || value.product_name || value.product_family || value.family || value.entity_id || '';
}

function makeStableId(value) {
  return normalizeText(value)
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_|_$/g, '')
    .slice(0, 80) || 'unbound';
}

function refsContain(refs = [], needle) {
  const normalizedNeedle = normalizeText(needle);
  if (!normalizedNeedle) return false;
  return refs.some((entry) => normalizeText(entry.ref || entry.evidence_id || entry.display_name).includes(normalizedNeedle));
}

function getCatalogRecords() {
  return getProductIntelligenceReadModelCatalog().readModel.records;
}

function findRecordByProductRef(productRefHint) {
  const hint = normalizeText(getHintText(productRefHint));
  if (!hint) return null;
  return getCatalogRecords().find((record) => {
    const productNames = record.product_ref?.product_names || [];
    return normalizeText(record.product_family).includes(hint)
      || productNames.some((name) => normalizeText(name).includes(hint) || hint.includes(normalizeText(name)));
  }) || null;
}

function findRecordByCarrierRef(carrierRefHint) {
  const hint = normalizeText(getHintText(carrierRefHint));
  if (!hint) return null;
  return getCatalogRecords().find((record) => normalizeText(record.carrier_ref?.display_name).includes(hint)) || null;
}

function findRecordByEvidenceRefs(sourceEvidenceRefs = []) {
  const hints = Array.isArray(sourceEvidenceRefs) ? sourceEvidenceRefs : [sourceEvidenceRefs];
  return getCatalogRecords().find((record) => hints.some((hint) => refsContain(record.evidence_refs, hint))) || null;
}

function resolveProductIntelligenceRecord(request = {}) {
  if (request.product_family_hint) {
    const envelope = getProductIntelligenceReadModelByFamily(request.product_family_hint);
    const record = envelope.readModel.records[0] || null;
    return {
      record,
      resolution: 'product_family_hint',
      errorCode: record ? null : SAFE_ERROR_CODES.productFamilyNotMapped
    };
  }

  const byProduct = findRecordByProductRef(request.product_ref_hint);
  if (byProduct) {
    return { record: byProduct, resolution: 'product_ref_hint', errorCode: null };
  }

  const byCarrier = findRecordByCarrierRef(request.carrier_ref_hint);
  if (byCarrier) {
    return { record: byCarrier, resolution: 'carrier_ref_hint', errorCode: null };
  }

  const byEvidence = findRecordByEvidenceRefs(request.source_evidence_refs);
  if (byEvidence) {
    return { record: byEvidence, resolution: 'source_evidence_refs', errorCode: null };
  }

  return {
    record: null,
    resolution: 'not_bound',
    errorCode: SAFE_ERROR_CODES.notBound
  };
}

function firstRef(refs = []) {
  return refs[0] || null;
}

function buildSafeError(record, errorCode) {
  if (errorCode) return errorCode;
  if (!record) return SAFE_ERROR_CODES.notBound;
  if (!record.parser_refs?.length) return SAFE_ERROR_CODES.parserNotMapped;
  if (!record.calculator_refs?.length) return SAFE_ERROR_CODES.calculatorNotMapped;
  if (!record.evidence_refs?.length) return SAFE_ERROR_CODES.sourceEvidenceRequired;
  if (!record.freshness_metadata?.status) return SAFE_ERROR_CODES.freshnessRequired;
  return null;
}

function buildBindingFromRecord(request, record, resolution, errorCode = null) {
  const requestId = request.quote_preview_request_id || 'quote_preview_request_static_074b';
  const safeError = buildSafeError(record, errorCode);
  const productFamily = record?.product_family || getHintText(request.product_family_hint) || null;
  const bindingKey = `${requestId}_${productFamily || 'not_bound'}`;

  return {
    adapterId: ADAPTER_ID,
    schemaVersion: SCHEMA_VERSION,
    domainId: 'quote_preview',
    mode: 'read_only',
    routeClass: 'preview_safe',
    readModel: {
      status: record && !safeError ? 'ok' : record ? 'bound_with_gaps' : 'error'
    },
    quote_preview_binding_id: `quote_preview_product_intelligence_binding_${makeStableId(bindingKey)}_074b`,
    quote_preview_request_id: requestId,
    product_intelligence_ref: record ? {
      product_intelligence_id: record.product_intelligence_id,
      schemaVersion: record.schemaVersion,
      mode: record.mode,
      routeClass: record.routeClass,
      imported: false,
      executed: false
    } : null,
    product_family: productFamily,
    parser_ref: record ? firstRef(record.parser_refs) : null,
    calculator_refs: record ? clone(record.calculator_refs) : [],
    coverage_semantics_ref: record ? {
      status: record.coverage_semantics.status,
      mapped_refs: clone(record.coverage_semantics.mapped_refs || []),
      truth_claimed: false
    } : null,
    premium_semantics_ref: record ? {
      status: record.premium_semantics.status,
      mapped_refs: clone(record.premium_semantics.mapped_refs || []),
      truth_claimed: false
    } : null,
    currency_semantics_ref: record ? {
      status: record.currency_semantics.status,
      mapped_refs: clone(record.currency_semantics.mapped_refs || []),
      truth_claimed: false
    } : null,
    projection_semantics_ref: record ? {
      status: record.projection_semantics.status,
      mapped_refs: clone(record.projection_semantics.mapped_refs || []),
      truth_claimed: false
    } : null,
    evidence_requirements: {
      required: true,
      source_evidence_refs: Array.isArray(request.source_evidence_refs) ? clone(request.source_evidence_refs) : [],
      product_intelligence_evidence_refs: record ? clone(record.evidence_refs) : []
    },
    freshness_requirements: {
      required: true,
      product_intelligence_freshness: record ? clone(record.freshness_metadata) : null
    },
    resolution,
    blocked_effects: record
      ? Array.from(new Set([...DEFAULT_BLOCKED_EFFECTS, ...(record.blocked_effects || [])]))
      : clone(DEFAULT_BLOCKED_EFFECTS),
    safety_flags: clone(DEFAULT_SAFETY_FLAGS),
    execution_markers: {
      parserExecution: false,
      calculatorExecution: false,
      banxicoCall: false,
      pdfRead: false,
      realEngineExecution: false
    },
    quote_pdf_preview_role: record?.quote_semantics?.quote_pdf_preview_role || 'consumer_reference_only',
    imagina_ser_universal_architecture: productFamily === 'Imagina Ser'
      ? record?.product_identity?.universal_architecture === true
      : false,
    safe_error: safeError
  };
}

export function bindQuotePreviewToProductIntelligence(request = {}) {
  const { record, resolution, errorCode } = resolveProductIntelligenceRecord(request);
  return buildBindingFromRecord(request, record, resolution, errorCode);
}

export function buildQuotePreviewBindingNotBoundError(request = {}) {
  return buildBindingFromRecord(request, null, 'not_bound', SAFE_ERROR_CODES.notBound);
}

export function validateQuotePreviewBindingShape(binding) {
  const errors = [];

  if (!binding || typeof binding !== 'object') {
    return { valid: false, errors: ['binding_required'] };
  }

  if (binding.schemaVersion !== SCHEMA_VERSION) errors.push('schemaVersion');
  if (binding.domainId !== 'quote_preview') errors.push('domainId');
  if (binding.mode !== 'read_only') errors.push('mode');
  if (binding.routeClass !== 'preview_safe') errors.push('routeClass');

  REQUIRED_BINDING_FIELDS.forEach((field) => {
    if (!(field in binding)) errors.push(field);
  });

  Object.entries(binding.safety_flags || {}).forEach(([key, value]) => {
    if (value !== false) errors.push(`safety_flags.${key}`);
  });

  Object.entries(binding.execution_markers || {}).forEach(([key, value]) => {
    if (value !== false) errors.push(`execution_markers.${key}`);
  });

  return {
    valid: errors.length === 0,
    errors
  };
}
