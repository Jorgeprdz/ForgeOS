"use strict";

(function prospectQuoteDetailProjectionModule(root, factory) {
  const api = factory();
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  if (root) root.ForgeProspectQuoteDetailProjectionCartera001C = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function prospectQuoteDetailProjectionFactory() {
  const PROJECTION_VERSION = "CARTERA-001C.1";
  const SOURCE_AUTHORITY = "QUOTE_AUTHORITY";
  const ALLOWED_ROW_KEYS = Object.freeze([
    "quote_reference",
    "quote_version_reference",
    "prospect_id",
    "product_reference",
    "lifecycle_state",
    "event_id",
    "event_type",
    "occurred_at",
    "recorded_at",
    "evidence_references",
    "freshness_metadata",
    "confirmation_state",
    "contract_version",
  ]);
  const EVENT_TYPES = Object.freeze([
    "QUOTE_CREATED",
    "QUOTE_UPDATED",
    "QUOTE_RECALCULATED",
    "QUOTE_REVIEW_CONFIRMED",
    "QUOTE_PRESENTED",
    "QUOTE_PROSPECT_ACCEPTED",
    "QUOTE_PROSPECT_REJECTED",
    "QUOTE_CONVERTED_TO_APPLICATION",
  ]);
  const LIFECYCLE_STATES = Object.freeze([
    "DRAFT",
    "REVIEWED",
    "PRESENTED",
    "PROSPECT_ACCEPTED",
    "PROSPECT_REJECTED",
    "CONVERTED_TO_APPLICATION",
  ]);
  const EVENT_LABELS = Object.freeze({
    QUOTE_CREATED: "Cotización creada",
    QUOTE_UPDATED: "Cotización actualizada",
    QUOTE_RECALCULATED: "Cotización recalculada",
    QUOTE_REVIEW_CONFIRMED: "Cotización revisada",
    QUOTE_PRESENTED: "Propuesta presentada",
    QUOTE_PROSPECT_ACCEPTED: "Prospecto aceptó la cotización",
    QUOTE_PROSPECT_REJECTED: "Prospecto rechazó la cotización",
    QUOTE_CONVERTED_TO_APPLICATION: "Convertida a solicitud",
  });
  const LIFECYCLE_LABELS = Object.freeze({
    DRAFT: "Borrador",
    REVIEWED: "Revisada",
    PRESENTED: "Presentada",
    PROSPECT_ACCEPTED: "Aceptada",
    PROSPECT_REJECTED: "Rechazada",
    CONVERTED_TO_APPLICATION: "Solicitud",
  });

  class ProspectQuoteDetailProjectionError extends TypeError {
    constructor(code, message, details = null) {
      super(message);
      this.name = "ProspectQuoteDetailProjectionError";
      this.code = code;
      this.details = details;
    }
  }

  function fail(code, message, details = null) {
    throw new ProspectQuoteDetailProjectionError(code, message, details);
  }

  function isPlainObject(value) {
    if (!value || typeof value !== "object" || Array.isArray(value)) return false;
    const prototype = Object.getPrototypeOf(value);
    return prototype === Object.prototype || prototype === null;
  }

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function deepFreeze(value) {
    if (!value || typeof value !== "object" || Object.isFrozen(value)) return value;
    Object.freeze(value);
    Object.values(value).forEach(deepFreeze);
    return value;
  }

  function stableValue(value) {
    if (Array.isArray(value)) return value.map(stableValue);
    if (isPlainObject(value)) {
      return Object.fromEntries(Object.keys(value).sort().map(key => [key, stableValue(value[key])]));
    }
    return value;
  }

  function stableStringify(value) {
    return JSON.stringify(stableValue(value));
  }

  function stableDigest(value) {
    const text = typeof value === "string" ? value : stableStringify(value);
    let hash = 2166136261;
    for (let index = 0; index < text.length; index += 1) {
      hash ^= text.charCodeAt(index);
      hash = Math.imul(hash, 16777619);
    }
    return (hash >>> 0).toString(16).padStart(8, "0");
  }

  function requireOpaque(value, code, label, maximum = 240) {
    const normalized = String(value || "").trim();
    if (!normalized || normalized.length > maximum || !/^[A-Za-z0-9][A-Za-z0-9._:@/-]*$/.test(normalized)) {
      fail(code, `${label} no es válido.`);
    }
    return normalized;
  }

  function requireIso(value, code, label) {
    if (typeof value !== "string" || Number.isNaN(Date.parse(value))) {
      fail(code, `${label} no es válido.`);
    }
    return new Date(value).toISOString();
  }

  function assertAllowedKeys(row) {
    if (!isPlainObject(row)) fail("QUOTE_HISTORY_ROW_INVALID", "La fila de historial debe ser un objeto.");
    const unsupported = Object.keys(row).filter(key => !ALLOWED_ROW_KEYS.includes(key)).sort();
    if (unsupported.length) {
      fail("QUOTE_HISTORY_FORBIDDEN_FIELDS", "El historial contiene campos fuera de la proyección minimizada.", {
        unsupported_fields: unsupported,
      });
    }
  }

  function normalizeEvidence(value) {
    if (!Array.isArray(value) || value.length < 1 || value.length > 20) {
      fail("QUOTE_HISTORY_EVIDENCE_INVALID", "La fila requiere referencias de evidencia.");
    }
    const references = value.map(item => requireOpaque(item, "QUOTE_HISTORY_EVIDENCE_REFERENCE_INVALID", "La evidencia"));
    if (new Set(references).size !== references.length) {
      fail("QUOTE_HISTORY_EVIDENCE_DUPLICATED", "La evidencia no puede repetirse.");
    }
    return references;
  }

  function truthState(confirmationState) {
    const mapping = {
      CONFIRMED: "CONFIRMED",
      DISPUTED: "CONFLICT_REVIEW_REQUIRED",
      REPORTED: "REPORTED_REVIEWABLE",
      UNCONFIRMED: "PENDING_CONFIRMATION",
    };
    return mapping[confirmationState] || "UNKNOWN";
  }

  function normalizeRow(input, expectedProspectReference) {
    assertAllowedKeys(input);
    const row = {
      quote_reference: requireOpaque(input.quote_reference, "QUOTE_REFERENCE_INVALID", "La cotización"),
      quote_version_reference: requireOpaque(input.quote_version_reference, "QUOTE_VERSION_REFERENCE_INVALID", "La versión"),
      prospect_id: requireOpaque(input.prospect_id, "QUOTE_PROSPECT_REFERENCE_INVALID", "El prospecto"),
      product_reference: requireOpaque(input.product_reference, "QUOTE_PRODUCT_REFERENCE_INVALID", "El producto", 160),
      lifecycle_state: requireOpaque(input.lifecycle_state, "QUOTE_LIFECYCLE_STATE_INVALID", "El estado", 80),
      event_id: requireOpaque(input.event_id, "QUOTE_EVENT_REFERENCE_INVALID", "El evento"),
      event_type: requireOpaque(input.event_type, "QUOTE_EVENT_TYPE_INVALID", "El tipo de evento", 80),
      occurred_at: requireIso(input.occurred_at, "QUOTE_EVENT_OCCURRED_AT_INVALID", "La fecha efectiva"),
      recorded_at: requireIso(input.recorded_at, "QUOTE_EVENT_RECORDED_AT_INVALID", "La fecha de registro"),
      evidence_references: normalizeEvidence(input.evidence_references),
      freshness_metadata: isPlainObject(input.freshness_metadata) ? clone(input.freshness_metadata) : null,
      confirmation_state: requireOpaque(input.confirmation_state, "QUOTE_CONFIRMATION_STATE_INVALID", "La confirmación", 80),
      contract_version: requireOpaque(input.contract_version, "QUOTE_CONTRACT_VERSION_INVALID", "El contrato", 80),
    };
    if (row.prospect_id !== expectedProspectReference) {
      fail("QUOTE_HISTORY_PROSPECT_SCOPE_MISMATCH", "El historial mezcla Prospect distintos.", {
        expected_prospect_reference: expectedProspectReference,
        actual_prospect_reference: row.prospect_id,
        event_id: row.event_id,
      });
    }
    if (!EVENT_TYPES.includes(row.event_type)) {
      fail("QUOTE_EVENT_TYPE_UNSUPPORTED", "El evento no pertenece al ciclo de Quote autorizado.", {
        event_type: row.event_type,
      });
    }
    if (!LIFECYCLE_STATES.includes(row.lifecycle_state)) {
      fail("QUOTE_LIFECYCLE_STATE_UNSUPPORTED", "El estado de Quote no es proyectable.", {
        lifecycle_state: row.lifecycle_state,
      });
    }
    if (!row.freshness_metadata?.status) {
      fail("QUOTE_FRESHNESS_REQUIRED", "La fila de Quote requiere frescura explícita.");
    }
    return row;
  }

  function compareRows(left, right) {
    return left.occurred_at.localeCompare(right.occurred_at)
      || left.recorded_at.localeCompare(right.recorded_at)
      || left.event_id.localeCompare(right.event_id);
  }

  function projectTimelineItem(row, position) {
    return {
      position,
      event_id: row.event_id,
      event_type: row.event_type,
      label: EVENT_LABELS[row.event_type],
      quote_reference: row.quote_reference,
      quote_version_reference: row.quote_version_reference,
      product_reference: row.product_reference,
      lifecycle_state: row.lifecycle_state,
      lifecycle_label: LIFECYCLE_LABELS[row.lifecycle_state],
      occurred_at: row.occurred_at,
      recorded_at: row.recorded_at,
      truth_state: truthState(row.confirmation_state),
      source_authority: SOURCE_AUTHORITY,
      freshness_status: row.freshness_metadata.status,
      evidence_count: row.evidence_references.length,
    };
  }

  function projectQuote(reference, rows) {
    const ordered = [...rows].sort(compareRows);
    const latest = ordered[ordered.length - 1];
    const versionReferences = [...new Set(ordered.map(row => row.quote_version_reference))];
    const conflict = ordered.some(row => truthState(row.confirmation_state) === "CONFLICT_REVIEW_REQUIRED");
    return {
      quote_reference: reference,
      prospect_reference: latest.prospect_id,
      product_reference: latest.product_reference,
      lifecycle_state: latest.lifecycle_state,
      lifecycle_label: LIFECYCLE_LABELS[latest.lifecycle_state],
      truth_state: conflict ? "CONFLICT_REVIEW_REQUIRED" : truthState(latest.confirmation_state),
      latest_event_id: latest.event_id,
      latest_event_type: latest.event_type,
      latest_event_label: EVENT_LABELS[latest.event_type],
      latest_occurred_at: latest.occurred_at,
      latest_recorded_at: latest.recorded_at,
      latest_freshness_status: latest.freshness_metadata.status,
      current_version_reference: latest.quote_version_reference,
      version_references: versionReferences,
      version_count: versionReferences.length,
      event_count: ordered.length,
      evidence_count: new Set(ordered.flatMap(row => row.evidence_references)).size,
      source_authority: SOURCE_AUTHORITY,
    };
  }

  function createProspectQuoteDetailProjection({ prospectReference, rows = [] } = {}) {
    const prospectId = requireOpaque(
      prospectReference,
      "PROSPECT_REFERENCE_REQUIRED",
      "La referencia de Prospect",
    );
    if (!Array.isArray(rows)) fail("QUOTE_HISTORY_REQUIRED", "El historial de Quote debe ser una lista.");
    const normalizedRows = rows.map(row => normalizeRow(row, prospectId)).sort(compareRows);
    const grouped = new Map();
    for (const row of normalizedRows) {
      const existing = grouped.get(row.quote_reference) || [];
      existing.push(row);
      grouped.set(row.quote_reference, existing);
    }
    const quotes = [...grouped.entries()]
      .map(([reference, quoteRows]) => projectQuote(reference, quoteRows))
      .sort((left, right) => right.latest_occurred_at.localeCompare(left.latest_occurred_at));
    const timeline = normalizedRows
      .map((row, index) => projectTimelineItem(row, index + 1))
      .sort((left, right) => right.occurred_at.localeCompare(left.occurred_at)
        || right.recorded_at.localeCompare(left.recorded_at)
        || right.event_id.localeCompare(left.event_id));
    const state = quotes.length === 0
      ? "EMPTY"
      : quotes.some(quote => quote.truth_state === "CONFLICT_REVIEW_REQUIRED")
        ? "CONFLICT_REVIEW_REQUIRED"
        : "READY";
    const digestInput = {
      projection_version: PROJECTION_VERSION,
      prospect_reference: prospectId,
      source_authority: SOURCE_AUTHORITY,
      state,
      quotes,
      timeline,
      counters: {
        quote_count: quotes.length,
        quote_event_count: timeline.length,
        conflict_count: quotes.filter(quote => quote.truth_state === "CONFLICT_REVIEW_REQUIRED").length,
      },
    };
    return deepFreeze({
      ...digestInput,
      projection_digest: stableDigest(digestInput),
    });
  }

  function validateProspectQuoteDetailProjection(input) {
    try {
      const rebuilt = createProspectQuoteDetailProjection({
        prospectReference: input?.prospect_reference,
        rows: input?._source_rows || [],
      });
      return deepFreeze({ valid: stableStringify(rebuilt) === stableStringify(input), errors: [] });
    } catch (error) {
      return deepFreeze({
        valid: false,
        errors: [{
          code: error?.code || "PROSPECT_QUOTE_DETAIL_PROJECTION_INVALID",
          message: error?.message || "La proyección no es válida.",
          details: error?.details || null,
        }],
      });
    }
  }

  return deepFreeze({
    PROJECTION_VERSION,
    SOURCE_AUTHORITY,
    ALLOWED_ROW_KEYS,
    EVENT_TYPES,
    LIFECYCLE_STATES,
    EVENT_LABELS,
    LIFECYCLE_LABELS,
    ProspectQuoteDetailProjectionError,
    createProspectQuoteDetailProjection,
    validateProspectQuoteDetailProjection,
    _private: deepFreeze({ stableStringify, stableDigest, normalizeRow, compareRows, projectQuote, projectTimelineItem }),
  });
});
