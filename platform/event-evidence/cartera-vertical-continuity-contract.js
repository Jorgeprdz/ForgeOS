"use strict";

(function carteraVerticalContinuityContractModule(root, factory) {
  const api = factory();
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  if (root) root.ForgeCarteraVerticalContinuityContract001D = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function carteraVerticalContinuityContractFactory() {
  const CONTRACT_VERSION = "CARTERA-001D.1";
  const SOURCE_AUTHORITY = "QUOTE_AUTHORITY";
  const REQUIRED_QUOTE_EVENTS = Object.freeze([
    "QUOTE_CREATED",
    "QUOTE_REVIEW_CONFIRMED",
    "QUOTE_PRESENTED",
    "QUOTE_PROSPECT_ACCEPTED",
  ]);
  const REQUIRED_TIMELINE_EVENTS = Object.freeze([
    "PROPOSAL_PRESENTED",
    "DECISION_RECORDED",
  ]);
  const FORBIDDEN_KEYS = Object.freeze([
    "premium",
    "annualpremium",
    "monthlypremium",
    "paymentamount",
    "sumassured",
    "coverage",
    "coverages",
    "deductible",
    "coinsurance",
    "rawpdf",
    "pdfbase64",
    "binary",
  ]);

  function isRecord(value) {
    if (!value || typeof value !== "object" || Array.isArray(value)) return false;
    const prototype = Object.getPrototypeOf(value);
    return prototype === Object.prototype || prototype === null;
  }

  function deepFreeze(value) {
    if (!value || typeof value !== "object" || Object.isFrozen(value)) return value;
    Object.freeze(value);
    Object.values(value).forEach(deepFreeze);
    return value;
  }

  function stableValue(value) {
    if (Array.isArray(value)) return value.map(stableValue);
    if (isRecord(value)) {
      return Object.fromEntries(Object.keys(value).sort().map(key => [key, stableValue(value[key])]));
    }
    return value;
  }

  function stableStringify(value) {
    return JSON.stringify(stableValue(value));
  }

  function digest(value) {
    const text = typeof value === "string" ? value : stableStringify(value);
    let hash = 2166136261;
    for (let index = 0; index < text.length; index += 1) {
      hash ^= text.charCodeAt(index);
      hash = Math.imul(hash, 16777619);
    }
    return (hash >>> 0).toString(16).padStart(8, "0");
  }

  function normalizeKey(value) {
    return String(value || "").toLowerCase().replace(/[^a-z0-9]/g, "");
  }

  function findForbiddenKeys(value, path = "$", output = []) {
    if (Array.isArray(value)) {
      value.forEach((item, index) => findForbiddenKeys(item, `${path}[${index}]`, output));
      return output;
    }
    if (!isRecord(value)) return output;
    for (const [key, child] of Object.entries(value)) {
      if (FORBIDDEN_KEYS.includes(normalizeKey(key))) output.push(`${path}.${key}`);
      findForbiddenKeys(child, `${path}.${key}`, output);
    }
    return output;
  }

  function opaque(value) {
    const text = String(value || "").trim();
    return Boolean(text && text.length <= 240 && /^[A-Za-z0-9][A-Za-z0-9._:@/-]*$/.test(text));
  }

  function uuid(value) {
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
      String(value || "").trim(),
    );
  }

  function iso(value) {
    return typeof value === "string" && !Number.isNaN(Date.parse(value));
  }

  function error(errors, code, message, details = null) {
    errors.push({ code, message, details });
  }

  function validateReceipt(receipt, expected, errors, label) {
    if (!isRecord(receipt)) {
      error(errors, `${label}_REQUIRED`, `${label} is required.`);
      return;
    }
    if (receipt.prospectReference !== expected.prospectReference) {
      error(errors, `${label}_PROSPECT_MISMATCH`, `${label} points to a different Prospect.`);
    }
    if (receipt.quoteReference !== expected.quoteReference) {
      error(errors, `${label}_QUOTE_MISMATCH`, `${label} points to a different Quote.`);
    }
    if (receipt.quoteVersionReference !== expected.quoteVersionReference) {
      error(errors, `${label}_VERSION_MISMATCH`, `${label} points to a different Quote Version.`);
    }
  }

  function validateCarteraVerticalContinuity(input = {}) {
    const errors = [];
    const prospectReference = String(input.prospectReference || "").trim();
    const confirmationReceipt = input.confirmationReceipt;
    const lifecycleReceipts = Array.isArray(input.lifecycleReceipts) ? input.lifecycleReceipts : [];
    const quoteHistoryRows = Array.isArray(input.quoteHistoryRows) ? input.quoteHistoryRows : [];
    const timelineRows = Array.isArray(input.timelineRows) ? input.timelineRows : [];
    const projection = input.projection;
    const renderedText = String(input.renderedText || "");

    if (!uuid(prospectReference)) {
      error(errors, "PROSPECT_REFERENCE_INVALID", "The vertical chain requires one valid Prospect UUID.");
    }
    if (!isRecord(confirmationReceipt)) {
      error(errors, "CONFIRMATION_RECEIPT_REQUIRED", "The durable confirmation receipt is required.");
    }

    const quoteReference = String(confirmationReceipt?.quoteReference || "").trim();
    const quoteVersionReference = String(confirmationReceipt?.quoteVersionReference || "").trim();
    if (!opaque(quoteReference)) error(errors, "QUOTE_REFERENCE_INVALID", "The durable Quote reference is invalid.");
    if (!opaque(quoteVersionReference)) error(errors, "QUOTE_VERSION_REFERENCE_INVALID", "The durable Quote Version reference is invalid.");
    if (confirmationReceipt?.prospectReference !== prospectReference) {
      error(errors, "CONFIRMATION_PROSPECT_MISMATCH", "The confirmation receipt points to another Prospect.");
    }
    if (confirmationReceipt?.lifecycleState !== "REVIEWED") {
      error(errors, "CONFIRMATION_STATE_INVALID", "The first durable receipt must end in REVIEWED.");
    }
    if (!Array.isArray(confirmationReceipt?.eventIds) || confirmationReceipt.eventIds.length !== 2) {
      error(errors, "CONFIRMATION_EVENT_IDS_INVALID", "The reviewed Quote must produce exactly two initial events.");
    }

    const expected = { prospectReference, quoteReference, quoteVersionReference };
    const receiptStates = new Set();
    const receiptEventIds = new Set();
    for (const receipt of lifecycleReceipts) {
      validateReceipt(receipt, expected, errors, "LIFECYCLE_RECEIPT");
      if (receipt?.lifecycleState) receiptStates.add(receipt.lifecycleState);
      if (!opaque(receipt?.eventId)) error(errors, "LIFECYCLE_EVENT_ID_INVALID", "A lifecycle receipt has no durable event identity.");
      else if (receiptEventIds.has(receipt.eventId)) error(errors, "LIFECYCLE_EVENT_ID_DUPLICATED", "Lifecycle receipts repeat an event identity.");
      else receiptEventIds.add(receipt.eventId);
    }
    for (const state of ["PRESENTED", "PROSPECT_ACCEPTED"]) {
      if (!receiptStates.has(state)) error(errors, `LIFECYCLE_${state}_MISSING`, `The ${state} lifecycle receipt is missing.`);
    }

    if (quoteHistoryRows.length < REQUIRED_QUOTE_EVENTS.length) {
      error(errors, "QUOTE_HISTORY_INCOMPLETE", "The Quote history does not contain the complete vertical chain.");
    }
    const historyTypes = new Set();
    const historyEventIds = new Set();
    for (const row of quoteHistoryRows) {
      if (!isRecord(row)) {
        error(errors, "QUOTE_HISTORY_ROW_INVALID", "A Quote history row is invalid.");
        continue;
      }
      if (row.prospect_id !== prospectReference) error(errors, "QUOTE_HISTORY_PROSPECT_MISMATCH", "Quote history crosses Prospect scope.");
      if (row.quote_reference !== quoteReference) error(errors, "QUOTE_HISTORY_QUOTE_MISMATCH", "Quote history crosses durable Quote identity.");
      if (row.quote_version_reference !== quoteVersionReference) error(errors, "QUOTE_HISTORY_VERSION_MISMATCH", "Quote history crosses Quote Version identity.");
      if (!iso(row.occurred_at) || !iso(row.recorded_at)) error(errors, "QUOTE_HISTORY_TIMESTAMP_INVALID", "Quote history requires effective and recorded timestamps.");
      historyTypes.add(row.event_type);
      if (!opaque(row.event_id)) error(errors, "QUOTE_HISTORY_EVENT_ID_INVALID", "Quote history contains an invalid event identity.");
      else if (historyEventIds.has(row.event_id)) error(errors, "QUOTE_HISTORY_EVENT_DUPLICATED", "Quote history repeats an event identity.");
      else historyEventIds.add(row.event_id);
      const forbidden = findForbiddenKeys(row);
      if (forbidden.length) error(errors, "QUOTE_HISTORY_TRUTH_LEAK", "Quote history contains forbidden Quote Truth fields.", { paths: forbidden });
    }
    for (const type of REQUIRED_QUOTE_EVENTS) {
      if (!historyTypes.has(type)) error(errors, `QUOTE_HISTORY_${type}_MISSING`, `Quote history is missing ${type}.`);
    }
    const latestHistory = [...quoteHistoryRows]
      .filter(row => isRecord(row) && iso(row.occurred_at))
      .sort((left, right) => String(right.occurred_at).localeCompare(String(left.occurred_at))
        || String(right.recorded_at).localeCompare(String(left.recorded_at)))[0];
    if (latestHistory?.lifecycle_state !== "PROSPECT_ACCEPTED") {
      error(errors, "QUOTE_HISTORY_FINAL_STATE_INVALID", "The latest Quote history state must be PROSPECT_ACCEPTED.");
    }

    const timelineTypes = new Set();
    const timelineLinks = new Set();
    for (const row of timelineRows) {
      if (!isRecord(row)) {
        error(errors, "TIMELINE_ROW_INVALID", "A Prospect Timeline row is invalid.");
        continue;
      }
      if (row.prospect_id !== prospectReference) error(errors, "TIMELINE_PROSPECT_MISMATCH", "Timeline crosses Prospect scope.");
      if (row.event_source !== SOURCE_AUTHORITY) error(errors, "TIMELINE_SOURCE_INVALID", "Quote events must retain QUOTE_AUTHORITY.");
      if (!iso(row.occurred_at)) error(errors, "TIMELINE_TIMESTAMP_INVALID", "Timeline requires an effective timestamp.");
      timelineTypes.add(row.event_type);
      if (row.source_record_reference) timelineLinks.add(row.source_record_reference);
      const forbidden = findForbiddenKeys(row.payload);
      if (forbidden.length) error(errors, "TIMELINE_QUOTE_TRUTH_LEAK", "Prospect Timeline duplicates forbidden Quote Truth.", { paths: forbidden });
    }
    for (const type of REQUIRED_TIMELINE_EVENTS) {
      if (!timelineTypes.has(type)) error(errors, `TIMELINE_${type}_MISSING`, `Prospect Timeline is missing ${type}.`);
    }
    const decision = timelineRows.find(row => row?.event_type === "DECISION_RECORDED");
    if (decision?.payload?.decisionCode !== "QUOTE_ACCEPTED") {
      error(errors, "TIMELINE_DECISION_INVALID", "The final Timeline decision must be QUOTE_ACCEPTED.");
    }
    for (const receipt of lifecycleReceipts) {
      if (receipt?.eventId && !timelineLinks.has(receipt.eventId)) {
        error(errors, "TIMELINE_EVENT_LINK_MISSING", "A lifecycle event is not linked to its Prospect Timeline projection.", {
          eventId: receipt.eventId,
        });
      }
    }

    if (!isRecord(projection)) {
      error(errors, "PROJECTION_REQUIRED", "The CARTERA 001C projection is required.");
    } else {
      if (projection.projection_version !== "CARTERA-001C.1") error(errors, "PROJECTION_VERSION_INVALID", "The Prospect Detail projection version is invalid.");
      if (projection.source_authority !== SOURCE_AUTHORITY) error(errors, "PROJECTION_SOURCE_INVALID", "The projection lost Quote authority.");
      if (projection.prospect_reference !== prospectReference) error(errors, "PROJECTION_PROSPECT_MISMATCH", "The projection points to another Prospect.");
      if (projection.state !== "READY") error(errors, "PROJECTION_STATE_INVALID", "The accepted vertical chain must produce a READY projection.");
      if (projection.counters?.quote_count !== 1) error(errors, "PROJECTION_QUOTE_COUNT_INVALID", "The vertical chain must project exactly one durable Quote.");
      if (projection.counters?.quote_event_count !== quoteHistoryRows.length) error(errors, "PROJECTION_EVENT_COUNT_INVALID", "Projection and Quote history event counts diverge.");
      const quote = Array.isArray(projection.quotes) ? projection.quotes[0] : null;
      if (quote?.quote_reference !== quoteReference || quote?.current_version_reference !== quoteVersionReference) {
        error(errors, "PROJECTION_IDENTITY_MISMATCH", "The Prospect Detail projection lost durable Quote identity.");
      }
      if (quote?.lifecycle_state !== "PROSPECT_ACCEPTED") error(errors, "PROJECTION_FINAL_STATE_INVALID", "The Prospect Detail projection must end in PROSPECT_ACCEPTED.");
      const forbidden = findForbiddenKeys(projection);
      if (forbidden.length) error(errors, "PROJECTION_QUOTE_TRUTH_LEAK", "The Prospect Detail projection contains forbidden Quote Truth.", { paths: forbidden });
    }

    const normalizedRendered = renderedText.toLowerCase().replace(/[^a-z0-9áéíóúñ]/g, "");
    for (const forbidden of ["prima", "cobertura", "sumaasegurada", "deducible", "coaseguro"]) {
      if (normalizedRendered.includes(forbidden)) error(errors, "RENDERED_QUOTE_TRUTH_LEAK", "Rendered Prospect Detail contains forbidden financial Quote Truth.", { token: forbidden });
    }
    if (/document:[a-f0-9]{32,128}/i.test(renderedText)) {
      error(errors, "RENDERED_RAW_EVIDENCE_LEAK", "Rendered Prospect Detail exposes raw evidence references.");
    }

    const summary = {
      prospectReference,
      quoteReference,
      quoteVersionReference,
      historyEventCount: quoteHistoryRows.length,
      timelineEventCount: timelineRows.length,
      projectedQuoteCount: projection?.counters?.quote_count ?? null,
      finalLifecycleState: projection?.quotes?.[0]?.lifecycle_state ?? latestHistory?.lifecycle_state ?? null,
      sourceAuthority: projection?.source_authority ?? null,
    };
    return deepFreeze({
      contractVersion: CONTRACT_VERSION,
      valid: errors.length === 0,
      errors,
      summary,
      continuityDigest: digest(summary),
      automaticExternalEffects: false,
      applicationCreationAllowed: false,
    });
  }

  return deepFreeze({
    CONTRACT_VERSION,
    SOURCE_AUTHORITY,
    REQUIRED_QUOTE_EVENTS,
    REQUIRED_TIMELINE_EVENTS,
    FORBIDDEN_KEYS,
    validateCarteraVerticalContinuity,
    _private: deepFreeze({ stableStringify, digest, findForbiddenKeys, opaque, uuid, iso }),
  });
});
