const CONTRACT_ID = "orvi.solucionline.pdf.parser-contract.v1";

export const ORVI_PDF_PARSER_CONTRACT_ID = CONTRACT_ID;
export const ORVI_PDF_PARSER_IMPLEMENTATION_REF = "product-intelligence/quotes/orvi-solucionline-pdf-text-parser.js";

export const ORVI_PDF_VALUE_STATES = Object.freeze([
  "numeric",
  "explicit_zero",
  "sin_costo",
  "amparado",
  "missing",
  "unreadable",
  "not_applicable",
]);

export const ORVI_PDF_CURRENCIES = Object.freeze(["UDI", "USD"]);

export const ORVI_PDF_TIMELINE_COLUMNS = Object.freeze([
  "real_age",
  "policy_year",
  "annual_premium",
  "additional_premium",
  "guaranteed_surrender_value",
  "cash_value",
  "total_recovery",
]);

export const ORVI_PDF_TO_PRODUCT_INTELLIGENCE_MAPPING = Object.freeze({
  "document.plan_label": "identity.plan_variant",
  "document.currency": "identity.currency",
  "insured.age": "participants.primary_insured.age",
  "insured.gender": "participants.primary_insured.gender",
  "insured.smoker": "participants.primary_insured.smoker",
  "coverages[0].annual_premium": "premium_structure.basic_annual_premium",
  "premium_summary.base_total_annual_premium": "premium_structure.total_annual_premium",
  "document.payment_term_years": "premium_structure.payment_term_years",
  "coverages[0].sum_assured": "protection_summary.basic_sum_assured",
  "document.coverage_duration_years": "protection_summary.coverage_duration_years",
  "guaranteed_values.rows": "guaranteed_value_timeline",
  "guaranteed_values.rows[].guaranteed_surrender_value": "guaranteed_value_timeline[].guaranteed_surrender_value",
  "guaranteed_values.rows[].cash_value": "guaranteed_value_timeline[].cash_value",
  "guaranteed_values.rows[].total_recovery": "guaranteed_value_timeline[].total_recovery",
  "source_trace": "source_trace",
});

const FORBIDDEN_IDENTITY_KEYS = new Set([
  "name",
  "client_name",
  "clientname",
  "insured_name",
  "policyholder_name",
  "advisor_name",
  "email",
  "phone",
  "telephone",
  "date_of_birth",
  "birth_date",
  "dob",
  "curp",
  "rfc",
]);

const FORBIDDEN_STRING_PATTERNS = Object.freeze([
  { label: "EMAIL", pattern: /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/ },
  { label: "DATE_OF_BIRTH_LIKE", pattern: /\b\d{2}\/\d{2}\/\d{4}\b/ },
  { label: "LOCAL_STORAGE_PATH", pattern: /\/storage\/emulated\/0\//i },
  { label: "REAL_SOURCE_FILENAME", pattern: /Solucionline_\d+/i },
]);

function isPlainObject(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function isFiniteNumber(value) {
  return typeof value === "number" && Number.isFinite(value);
}

function findForbiddenStringPattern(value, path = "root") {
  if (typeof value === "string") {
    for (const entry of FORBIDDEN_STRING_PATTERNS) {
      if (entry.pattern.test(value)) return `${path}:${entry.label}`;
    }
    return null;
  }

  if (Array.isArray(value)) {
    for (let index = 0; index < value.length; index += 1) {
      const hit = findForbiddenStringPattern(value[index], `${path}[${index}]`);
      if (hit) return hit;
    }
    return null;
  }

  if (!isPlainObject(value)) return null;

  for (const [key, nested] of Object.entries(value)) {
    const hit = findForbiddenStringPattern(nested, `${path}.${key}`);
    if (hit) return hit;
  }

  return null;
}

function hasForbiddenIdentityKey(value, path = "root") {
  if (Array.isArray(value)) {
    for (let index = 0; index < value.length; index += 1) {
      const hit = hasForbiddenIdentityKey(value[index], `${path}[${index}]`);
      if (hit) return hit;
    }
    return null;
  }

  if (!isPlainObject(value)) return null;

  for (const [key, nested] of Object.entries(value)) {
    const normalized = key.toLowerCase().replace(/[^a-z0-9_]/g, "");
    if (FORBIDDEN_IDENTITY_KEYS.has(normalized)) {
      return `${path}.${key}`;
    }
    const hit = hasForbiddenIdentityKey(nested, `${path}.${key}`);
    if (hit) return hit;
  }

  return null;
}

export function createOrviPdfValue({
  state,
  value = null,
  unit = null,
  displayed_text = null,
  source_page = null,
  source_section = null,
  confidence = null,
} = {}) {
  return Object.freeze({
    state: state ?? "missing",
    value,
    unit,
    displayed_text,
    source_page,
    source_section,
    confidence,
  });
}

function validateStatefulValue(value, path, errors) {
  if (!isPlainObject(value)) {
    errors.push(`${path}:VALUE_OBJECT_REQUIRED`);
    return;
  }

  if (!ORVI_PDF_VALUE_STATES.includes(value.state)) {
    errors.push(`${path}:INVALID_STATE`);
    return;
  }

  if (value.state === "numeric") {
    if (!isFiniteNumber(value.value)) errors.push(`${path}:NUMERIC_VALUE_REQUIRED`);
  } else if (value.state === "explicit_zero") {
    if (value.value !== 0) errors.push(`${path}:EXPLICIT_ZERO_MUST_EQUAL_ZERO`);
  } else if (value.value !== null) {
    errors.push(`${path}:NON_NUMERIC_STATE_MUST_HAVE_NULL_VALUE`);
  }

  if (value.confidence !== null) {
    if (!isFiniteNumber(value.confidence) || value.confidence < 0 || value.confidence > 1) {
      errors.push(`${path}:INVALID_CONFIDENCE`);
    }
  }
}

function validateTimelineRows(rows, currency, errors) {
  if (!Array.isArray(rows) || rows.length < 3) {
    errors.push("guaranteed_values.rows:AT_LEAST_THREE_ROWS_REQUIRED");
    return;
  }

  let previousPolicyYear = 0;
  let previousRealAge = 0;

  rows.forEach((row, index) => {
    const path = `guaranteed_values.rows[${index}]`;
    if (!isPlainObject(row)) {
      errors.push(`${path}:ROW_OBJECT_REQUIRED`);
      return;
    }

    if (!Number.isInteger(row.real_age) || row.real_age <= 0) {
      errors.push(`${path}.real_age:POSITIVE_INTEGER_REQUIRED`);
    }
    if (!Number.isInteger(row.policy_year) || row.policy_year <= 0) {
      errors.push(`${path}.policy_year:POSITIVE_INTEGER_REQUIRED`);
    }
    if (index > 0 && row.policy_year <= previousPolicyYear) {
      errors.push(`${path}.policy_year:STRICTLY_INCREASING_REQUIRED`);
    }
    if (index > 0 && row.real_age <= previousRealAge) {
      errors.push(`${path}.real_age:STRICTLY_INCREASING_REQUIRED`);
    }

    previousPolicyYear = row.policy_year;
    previousRealAge = row.real_age;

    for (const field of (
      [
        "annual_premium",
        "additional_premium",
        "guaranteed_surrender_value",
        "cash_value",
        "total_recovery",
      ]
    )) {
      validateStatefulValue(row[field], `${path}.${field}`, errors);
      if (isPlainObject(row[field]) && row[field].unit !== currency) {
        errors.push(`${path}.${field}:UNIT_MUST_MATCH_DOCUMENT_CURRENCY`);
      }
    }
  });
}

export function validateOrviPdfParserEnvelope(envelope) {
  const errors = [];

  if (!isPlainObject(envelope)) {
    return Object.freeze({ valid: false, errors: Object.freeze(["ENVELOPE_OBJECT_REQUIRED"]) });
  }

  if (envelope.contract_id !== CONTRACT_ID) errors.push("CONTRACT_ID_MISMATCH");
  if (typeof envelope.synthetic_fixture !== "boolean") errors.push("SYNTHETIC_FIXTURE_BOOLEAN_REQUIRED");
  if (envelope.product_type !== "orvi") errors.push("PRODUCT_TYPE_MUST_BE_ORVI");
  if (envelope.source_type !== "solucionline_pdf") errors.push("SOURCE_TYPE_MUST_BE_SOLUCIONLINE_PDF");

  const forbiddenPath = hasForbiddenIdentityKey(envelope);
  if (forbiddenPath) errors.push(`PRIVACY_FORBIDDEN_KEY:${forbiddenPath}`);

  const forbiddenString = findForbiddenStringPattern(envelope);
  if (forbiddenString) errors.push(`PRIVACY_FORBIDDEN_STRING:${forbiddenString}`);

  if (!isPlainObject(envelope.document)) {
    errors.push("document:OBJECT_REQUIRED");
  } else {
    if (typeof envelope.document.plan_label !== "string" || !envelope.document.plan_label.trim()) {
      errors.push("document.plan_label:NON_EMPTY_STRING_REQUIRED");
    }
    if (!ORVI_PDF_CURRENCIES.includes(envelope.document.currency)) {
      errors.push("document.currency:UDI_OR_USD_REQUIRED");
    }
    if (!Number.isInteger(envelope.document.payment_term_years) || envelope.document.payment_term_years <= 0) {
      errors.push("document.payment_term_years:POSITIVE_INTEGER_REQUIRED");
    }
    if (
      envelope.document.coverage_duration_years !== null
      && (!Number.isInteger(envelope.document.coverage_duration_years)
        || envelope.document.coverage_duration_years <= 0)
    ) {
      errors.push("document.coverage_duration_years:POSITIVE_INTEGER_OR_NULL_REQUIRED");
    }
    if (envelope.document.illustrative_not_contract !== true) {
      errors.push("document.illustrative_not_contract:MUST_BE_TRUE");
    }
  }

  const currency = envelope.document?.currency;

  if (!isPlainObject(envelope.insured)) {
    errors.push("insured:OBJECT_REQUIRED");
  } else {
    if (!Number.isInteger(envelope.insured.age) || envelope.insured.age <= 0) {
      errors.push("insured.age:POSITIVE_INTEGER_REQUIRED");
    }
    if (!["female", "male", "other", "unknown"].includes(envelope.insured.gender)) {
      errors.push("insured.gender:INVALID_ENUM");
    }
    if (![true, false, null].includes(envelope.insured.smoker)) {
      errors.push("insured.smoker:BOOLEAN_OR_NULL_REQUIRED");
    }
  }

  if (!Array.isArray(envelope.coverages) || envelope.coverages.length < 1) {
    errors.push("coverages:AT_LEAST_ONE_REQUIRED");
  } else {
    envelope.coverages.forEach((coverage, index) => {
      const path = `coverages[${index}]`;
      if (!isPlainObject(coverage)) {
        errors.push(`${path}:OBJECT_REQUIRED`);
        return;
      }
      if (typeof coverage.label !== "string" || !coverage.label.trim()) {
        errors.push(`${path}.label:NON_EMPTY_STRING_REQUIRED`);
      }
      validateStatefulValue(coverage.sum_assured, `${path}.sum_assured`, errors);
      validateStatefulValue(coverage.annual_premium, `${path}.annual_premium`, errors);
      for (const field of [coverage.sum_assured, coverage.annual_premium]) {
        if (isPlainObject(field) && field.unit !== currency) {
          errors.push(`${path}:UNIT_MUST_MATCH_DOCUMENT_CURRENCY`);
        }
      }
    });
  }

  if (!isPlainObject(envelope.premium_summary)) {
    errors.push("premium_summary:OBJECT_REQUIRED");
  } else {
    validateStatefulValue(
      envelope.premium_summary.base_total_annual_premium,
      "premium_summary.base_total_annual_premium",
      errors,
    );
    validateStatefulValue(
      envelope.premium_summary.displayed_total_with_recommended,
      "premium_summary.displayed_total_with_recommended",
      errors,
    );
    validateStatefulValue(
      envelope.premium_summary.visible_line_item_sum,
      "premium_summary.visible_line_item_sum",
      errors,
    );

    for (const field of [
      envelope.premium_summary.base_total_annual_premium,
      envelope.premium_summary.displayed_total_with_recommended,
      envelope.premium_summary.visible_line_item_sum,
    ]) {
      if (isPlainObject(field) && field.unit !== currency) {
        errors.push("premium_summary:UNIT_MUST_MATCH_DOCUMENT_CURRENCY");
      }
    }

    const reconciliation = envelope.premium_summary.reconciliation;
    if (!isPlainObject(reconciliation)) {
      errors.push("premium_summary.reconciliation:OBJECT_REQUIRED");
    } else {
      const allowed = [
        "source_displayed_total_reconciles",
        "source_displayed_total_unreconciled",
        "not_evaluated",
      ];
      if (!allowed.includes(reconciliation.status)) {
        errors.push("premium_summary.reconciliation:INVALID_STATUS");
      }
      if (reconciliation.recomputed_override_applied !== false) {
        errors.push("premium_summary.reconciliation:RECOMPUTED_OVERRIDE_FORBIDDEN");
      }
      if (reconciliation.source_total_preserved !== true) {
        errors.push("premium_summary.reconciliation:SOURCE_TOTAL_MUST_BE_PRESERVED");
      }
    }
  }

  if (!isPlainObject(envelope.guaranteed_values)) {
    errors.push("guaranteed_values:OBJECT_REQUIRED");
  } else {
    if (JSON.stringify(envelope.guaranteed_values.columns) !== JSON.stringify(ORVI_PDF_TIMELINE_COLUMNS)) {
      errors.push("guaranteed_values.columns:CANONICAL_SEVEN_COLUMNS_REQUIRED");
    }
    validateTimelineRows(envelope.guaranteed_values.rows, currency, errors);
  }

  if (!isPlainObject(envelope.privacy)) {
    errors.push("privacy:OBJECT_REQUIRED");
  } else {
    if (envelope.privacy.pii_redacted !== true) errors.push("privacy.pii_redacted:MUST_BE_TRUE");
    if (envelope.privacy.real_source_values_copied !== false) {
      errors.push("privacy.real_source_values_copied:MUST_BE_FALSE");
    }
    if (!Array.isArray(envelope.privacy.retained_identity_fields)
      || envelope.privacy.retained_identity_fields.length !== 0) {
      errors.push("privacy.retained_identity_fields:MUST_BE_EMPTY");
    }
  }

  if (!isPlainObject(envelope.ownership)) {
    errors.push("ownership:OBJECT_REQUIRED");
  } else {
    if (envelope.ownership.canonical_owner !== "product-intelligence") {
      errors.push("ownership.canonical_owner:MUST_BE_PRODUCT_INTELLIGENCE");
    }
    if (![null, ORVI_PDF_PARSER_IMPLEMENTATION_REF].includes(envelope.ownership.parser_ref)) {
      errors.push("ownership.parser_ref:NULL_OR_AUTHORIZED_IMPLEMENTATION_REQUIRED");
    }
    if (envelope.ownership.runtime_ref !== null) errors.push("ownership.runtime_ref:MUST_REMAIN_NULL_IN_R15D");
    if (envelope.ownership.renderer_ref !== null) errors.push("ownership.renderer_ref:MUST_REMAIN_NULL_IN_R15D");
  }

  if (envelope.recommendation !== null) errors.push("RECOMMENDATION_NOT_AUTHORIZED");
  if (envelope.mxn_projection !== null) errors.push("MXN_PROJECTION_NOT_AUTHORIZED");

  return Object.freeze({
    valid: errors.length === 0,
    errors: Object.freeze(errors),
  });
}

export function assertValidOrviPdfParserEnvelope(envelope) {
  const result = validateOrviPdfParserEnvelope(envelope);
  if (!result.valid) {
    throw new TypeError(`Invalid ORVI PDF parser envelope: ${result.errors.join(",")}`);
  }
  return envelope;
}
