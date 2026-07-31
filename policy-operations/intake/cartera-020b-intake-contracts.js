const REFERENCE_PATTERN = /^[A-Za-z0-9][A-Za-z0-9._:@/-]{0,239}$/;
const DIGEST_PATTERN = /^[a-f0-9]{64}$/;

export const INTAKE_EXTRACTION_STATUSES = Object.freeze({
  COMPLETE: 'COMPLETE',
  EMPTY: 'EMPTY',
  FAILED: 'FAILED',
  UNSUPPORTED: 'UNSUPPORTED',
  REVIEW_REQUIRED: 'REVIEW_REQUIRED',
});

export const INTAKE_DOCUMENT_TYPES = Object.freeze({
  POLICY: 'POLICY',
  RECEIPT: 'RECEIPT',
  ENDORSEMENT: 'ENDORSEMENT',
  UNKNOWN: 'UNKNOWN',
});

export const INTAKE_CLASSIFICATION_STATES = Object.freeze({
  MATCHED: 'MATCHED',
  AMBIGUOUS: 'AMBIGUOUS',
  UNKNOWN: 'UNKNOWN',
  REVIEW_REQUIRED: 'REVIEW_REQUIRED',
});

export const INTAKE_PARSER_RESOLUTION_STATES = Object.freeze({
  MATCHED: 'MATCHED',
  AMBIGUOUS: 'AMBIGUOUS',
  UNSUPPORTED: 'UNSUPPORTED',
  UNKNOWN_CARRIER: 'UNKNOWN_CARRIER',
  UNKNOWN_PRODUCT: 'UNKNOWN_PRODUCT',
});

export const INTAKE_FIELD_STATES = Object.freeze({
  EXTRACTED: 'EXTRACTED',
  UNKNOWN: 'UNKNOWN',
  MISSING: 'MISSING',
  CONFLICT: 'CONFLICT',
});

export const INTAKE_WORKER_STATES = Object.freeze({
  AVAILABLE: 'AVAILABLE',
  CLAIMED: 'CLAIMED',
  RETRY_WAIT: 'RETRY_WAIT',
  COMPLETED: 'COMPLETED',
  BLOCKED: 'BLOCKED',
  FAILED_TERMINAL: 'FAILED_TERMINAL',
});

function isPlainObject(value) {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) return false;
  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}

function assertPlainObject(value, label) {
  if (!isPlainObject(value)) throw new TypeError(`${label}_must_be_plain_object`);
}

function assertReference(value, label) {
  if (typeof value !== 'string' || !REFERENCE_PATTERN.test(value)) {
    throw new TypeError(`${label}_invalid_reference`);
  }
  return value;
}

function assertDigest(value, label = 'source_digest') {
  if (typeof value !== 'string' || !DIGEST_PATTERN.test(value)) {
    throw new TypeError(`${label}_must_be_sha256_hex`);
  }
  return value;
}

function asFiniteConfidence(value, { allowNull = true } = {}) {
  if (value === null && allowNull) return null;
  if (!Number.isFinite(value) || value < 0 || value > 1) {
    throw new TypeError('confidence_must_be_between_zero_and_one');
  }
  return value;
}

function asIso(value, label) {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) throw new TypeError(`${label}_must_be_iso_date`);
  return parsed.toISOString();
}

function freezeArray(values = []) {
  if (!Array.isArray(values)) throw new TypeError('value_must_be_array');
  return Object.freeze(values.map((value) => (
    isPlainObject(value) ? Object.freeze({ ...value }) : value
  )));
}

export function createExtractionEnvelope({
  provider,
  providerVersion,
  method,
  status,
  sourceDigest,
  pageCount = null,
  text = null,
  warnings = [],
  errors = [],
  startedAt,
  completedAt,
} = {}) {
  assertReference(provider, 'provider');
  assertReference(providerVersion, 'provider_version');
  assertReference(method, 'method');
  assertDigest(sourceDigest);

  if (!Object.values(INTAKE_EXTRACTION_STATUSES).includes(status)) {
    throw new TypeError('unsupported_extraction_status');
  }
  if (pageCount !== null && (!Number.isInteger(pageCount) || pageCount < 0)) {
    throw new TypeError('page_count_must_be_non_negative_integer');
  }
  if (text !== null && typeof text !== 'string') throw new TypeError('text_must_be_string_or_null');
  if ([INTAKE_EXTRACTION_STATUSES.EMPTY, INTAKE_EXTRACTION_STATUSES.FAILED, INTAKE_EXTRACTION_STATUSES.UNSUPPORTED].includes(status) && text) {
    throw new TypeError('non_complete_extraction_cannot_carry_text');
  }

  const normalizedStartedAt = asIso(startedAt, 'started_at');
  const normalizedCompletedAt = asIso(completedAt, 'completed_at');
  if (normalizedCompletedAt < normalizedStartedAt) throw new TypeError('completed_at_before_started_at');

  return Object.freeze({
    provider,
    providerVersion,
    method,
    status,
    sourceDigest,
    pageCount,
    text,
    warnings: freezeArray(warnings),
    errors: freezeArray(errors),
    startedAt: normalizedStartedAt,
    completedAt: normalizedCompletedAt,
    createsTruth: false,
  });
}

export function createClassificationCandidate({
  documentType = INTAKE_DOCUMENT_TYPES.UNKNOWN,
  confidence = null,
  matchedEvidence = [],
  competingCandidates = [],
  state = null,
  warnings = [],
  requiresReview = null,
} = {}) {
  if (!Object.values(INTAKE_DOCUMENT_TYPES).includes(documentType)) {
    throw new TypeError('unsupported_document_type');
  }
  const normalizedConfidence = asFiniteConfidence(confidence);
  const competitors = freezeArray(competingCandidates);
  const ambiguous = competitors.length > 0;
  const resolvedState = state ?? (
    documentType === INTAKE_DOCUMENT_TYPES.UNKNOWN
      ? INTAKE_CLASSIFICATION_STATES.UNKNOWN
      : ambiguous
        ? INTAKE_CLASSIFICATION_STATES.AMBIGUOUS
        : INTAKE_CLASSIFICATION_STATES.MATCHED
  );
  if (!Object.values(INTAKE_CLASSIFICATION_STATES).includes(resolvedState)) {
    throw new TypeError('unsupported_classification_state');
  }

  return Object.freeze({
    documentType,
    confidence: normalizedConfidence,
    matchedEvidence: freezeArray(matchedEvidence),
    competingCandidates: competitors,
    state: resolvedState,
    warnings: freezeArray(warnings),
    requiresReview: requiresReview ?? (
      resolvedState !== INTAKE_CLASSIFICATION_STATES.MATCHED || normalizedConfidence === null || normalizedConfidence < 0.85
    ),
    createsTruth: false,
  });
}

export function createPolicyFieldCandidate({
  fieldName,
  rawValue = null,
  normalizedValue = null,
  confidence = null,
  sourceLocation = null,
  extractionMethod,
  parserId,
  parserVersion,
  state = null,
  warnings = [],
} = {}) {
  assertReference(fieldName, 'field_name');
  assertReference(extractionMethod, 'extraction_method');
  assertReference(parserId, 'parser_id');
  assertReference(parserVersion, 'parser_version');
  if (sourceLocation !== null) assertPlainObject(sourceLocation, 'source_location');

  const normalizedConfidence = asFiniteConfidence(confidence);
  const resolvedState = state ?? (
    rawValue === null && normalizedValue === null
      ? INTAKE_FIELD_STATES.UNKNOWN
      : INTAKE_FIELD_STATES.EXTRACTED
  );
  if (!Object.values(INTAKE_FIELD_STATES).includes(resolvedState)) {
    throw new TypeError('unsupported_field_state');
  }
  if (resolvedState === INTAKE_FIELD_STATES.UNKNOWN && (rawValue !== null || normalizedValue !== null)) {
    throw new TypeError('unknown_field_cannot_carry_value');
  }

  return Object.freeze({
    fieldName,
    rawValue,
    normalizedValue,
    confidence: normalizedConfidence,
    sourceLocation: sourceLocation === null ? null : Object.freeze({ ...sourceLocation }),
    extractionMethod,
    parserId,
    parserVersion,
    state: resolvedState,
    warnings: freezeArray(warnings),
    createsTruth: false,
  });
}

export function createParserDescriptor({
  parserId,
  parserVersion,
  carrier,
  documentType,
  product = '*',
  priority = 0,
  parse,
} = {}) {
  assertReference(parserId, 'parser_id');
  assertReference(parserVersion, 'parser_version');
  if (carrier !== '*') assertReference(carrier, 'carrier');
  if (product !== '*') assertReference(product, 'product');
  if (!Object.values(INTAKE_DOCUMENT_TYPES).includes(documentType)) {
    throw new TypeError('unsupported_parser_document_type');
  }
  if (!Number.isInteger(priority)) throw new TypeError('parser_priority_must_be_integer');
  if (parse !== undefined && parse !== null && typeof parse !== 'function') throw new TypeError('parse_must_be_function');

  return Object.freeze({
    parserId,
    parserVersion,
    carrier,
    documentType,
    product,
    priority,
    parse: parse ?? null,
  });
}

export function validateAdmissionMetadata({
  ownerAdvisorId,
  organizationId = null,
  originalFilename,
  mimeType,
  byteSize,
  documentDigest,
  storageReference,
  purpose = 'POLICY_INTAKE',
  idempotencyKey,
} = {}) {
  assertReference(ownerAdvisorId, 'owner_advisor_id');
  if (organizationId !== null) assertReference(organizationId, 'organization_id');
  if (typeof originalFilename !== 'string' || originalFilename.length < 1 || originalFilename.length > 255) {
    throw new TypeError('invalid_original_filename');
  }
  if (typeof mimeType !== 'string' || mimeType.length < 1 || mimeType.length > 160) {
    throw new TypeError('invalid_mime_type');
  }
  if (!Number.isInteger(byteSize) || byteSize < 1 || byteSize > 25 * 1024 * 1024) {
    throw new TypeError('byte_size_out_of_bounds');
  }
  assertDigest(documentDigest, 'document_digest');
  assertReference(storageReference, 'storage_reference');
  assertReference(purpose, 'purpose');
  assertReference(idempotencyKey, 'idempotency_key');

  return Object.freeze({
    ownerAdvisorId,
    organizationId,
    originalFilename,
    mimeType,
    byteSize,
    documentDigest,
    storageReference,
    purpose,
    idempotencyKey,
  });
}

export function intakeCreatesPolicyTruth() {
  return false;
}
