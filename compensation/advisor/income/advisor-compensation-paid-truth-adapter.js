"use strict";

const {
  clone,
  deepFreeze,
  sha256
} = require("../events/advisor-compensation-event-contract");

const ADVISOR_COMPENSATION_PAYOUT_RECORD_CONTRACT_VERSION =
  "ADVISOR_COMPENSATION_CONFIRMED_PAYOUT_RECORD_001";

const ADVISOR_COMPENSATION_PAYOUT_SOURCE_STATES = Object.freeze({
  AVAILABLE: "AVAILABLE",
  DISCONNECTED: "DISCONNECTED",
  PARTIAL: "PARTIAL",
  STALE: "STALE"
});

function present(value) {
  return value !== undefined && value !== null && String(value).trim() !== "";
}

function fail(code) {
  const error = new Error(code);
  error.code = code;
  throw error;
}

function requiredString(value, code) {
  if (!present(value)) fail(code);
  return String(value).trim();
}

function requiredPeriod(value) {
  const periodKey = requiredString(
    value,
    "ADVISOR_COMPENSATION_PAYOUT_PERIOD_REQUIRED"
  );
  if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(periodKey)) {
    fail("ADVISOR_COMPENSATION_PAYOUT_PERIOD_INVALID");
  }
  return periodKey;
}

function requiredPositiveMoney(value) {
  if (value === null || value === undefined || value === "") {
    fail("ADVISOR_COMPENSATION_PAYOUT_AMOUNT_REQUIRED");
  }
  const amount = Number(value);
  if (!Number.isFinite(amount) || amount <= 0) {
    fail("ADVISOR_COMPENSATION_PAYOUT_AMOUNT_INVALID");
  }
  return Math.round(amount * 100) / 100;
}

function createAdvisorCompensationConfirmedPayoutRecord(input = {}) {
  const currency = requiredString(
    input.currency,
    "ADVISOR_COMPENSATION_PAYOUT_CURRENCY_REQUIRED"
  ).toUpperCase();
  if (!/^[A-Z]{3}$/.test(currency)) {
    fail("ADVISOR_COMPENSATION_PAYOUT_CURRENCY_INVALID");
  }

  const matchedCompensationEventIds = Object.freeze([
    ...new Set(
      (Array.isArray(input.matchedCompensationEventIds)
        ? input.matchedCompensationEventIds
        : [])
        .filter(present)
        .map((item) => String(item).trim())
    )
  ]);
  if (matchedCompensationEventIds.length === 0) {
    fail("ADVISOR_COMPENSATION_PAYOUT_MATCHED_EVENT_REQUIRED");
  }

  const record = {
    contractVersion: ADVISOR_COMPENSATION_PAYOUT_RECORD_CONTRACT_VERSION,
    payoutRecordId: requiredString(
      input.payoutRecordId,
      "ADVISOR_COMPENSATION_PAYOUT_RECORD_ID_REQUIRED"
    ),
    truthClass: "CONFIRMED_COMPENSATION_PAYOUT",
    confirmationState: "CONFIRMED",
    advisorReference: requiredString(
      input.advisorReference,
      "ADVISOR_COMPENSATION_PAYOUT_ADVISOR_REQUIRED"
    ),
    periodKey: requiredPeriod(input.periodKey),
    amount: {
      value: requiredPositiveMoney(input.amount),
      currency
    },
    matchedCompensationEventIds,
    payoutEvidenceReference: requiredString(
      input.payoutEvidenceReference,
      "ADVISOR_COMPENSATION_PAYOUT_EVIDENCE_REQUIRED"
    ),
    payoutEvidenceHash: requiredString(
      input.payoutEvidenceHash,
      "ADVISOR_COMPENSATION_PAYOUT_EVIDENCE_HASH_REQUIRED"
    ),
    humanDecisionId: requiredString(
      input.humanDecisionId,
      "ADVISOR_COMPENSATION_PAYOUT_HUMAN_DECISION_REQUIRED"
    ),
    confirmedAt: requiredString(
      input.confirmedAt,
      "ADVISOR_COMPENSATION_PAYOUT_CONFIRMED_AT_REQUIRED"
    ),
    sourceAuthority: requiredString(
      input.sourceAuthority,
      "ADVISOR_COMPENSATION_PAYOUT_SOURCE_AUTHORITY_REQUIRED"
    ),
    metadata: clone(input.metadata || {}),
    safeguards: {
      payoutTruth: true,
      automaticConfirmation: false,
      eventPromotionPerformed: false,
      externalMutationAuthorized: false
    }
  };

  if (!Number.isFinite(Date.parse(record.confirmedAt)) ||
      !record.confirmedAt.includes("T")) {
    fail("ADVISOR_COMPENSATION_PAYOUT_CONFIRMED_AT_INVALID");
  }

  record.recordDigest = sha256(record);
  return deepFreeze(record);
}

function validateAdvisorCompensationConfirmedPayoutRecord(record) {
  const errors = [];
  if (!record || typeof record !== "object") {
    return Object.freeze({
      valid: false,
      errors: Object.freeze(["payout_record_missing"])
    });
  }
  if (record.contractVersion !==
      ADVISOR_COMPENSATION_PAYOUT_RECORD_CONTRACT_VERSION) {
    errors.push("payout_record_contract_version_invalid");
  }
  if (record.truthClass !== "CONFIRMED_COMPENSATION_PAYOUT") {
    errors.push("payout_truth_class_invalid");
  }
  if (record.confirmationState !== "CONFIRMED") {
    errors.push("payout_confirmation_state_invalid");
  }
  if (!Number.isFinite(record.amount?.value) || record.amount.value <= 0) {
    errors.push("payout_amount_invalid");
  }
  if (!/^[A-Z]{3}$/.test(record.amount?.currency || "")) {
    errors.push("payout_currency_invalid");
  }
  if (!Array.isArray(record.matchedCompensationEventIds) ||
      record.matchedCompensationEventIds.length === 0) {
    errors.push("payout_matched_event_required");
  }
  if (!record.payoutEvidenceReference) {
    errors.push("payout_evidence_required");
  }
  if (!record.humanDecisionId) {
    errors.push("payout_human_decision_required");
  }
  if (!/^[a-f0-9]{64}$/.test(record.recordDigest || "")) {
    errors.push("payout_record_digest_invalid");
  }
  if (record.safeguards?.payoutTruth !== true) {
    errors.push("payout_truth_required");
  }
  if (record.safeguards?.automaticConfirmation !== false) {
    errors.push("automatic_confirmation_must_be_false");
  }
  return Object.freeze({
    valid: errors.length === 0,
    errors: Object.freeze(errors)
  });
}

function projectAdvisorCompensationPayoutTruth({
  records,
  sourceState = null,
  advisorReference,
  periodKey,
  currency = "MXN",
  asOf = null
} = {}) {
  if (records === null || records === undefined) {
    return deepFreeze({
      sourceState:
        sourceState || ADVISOR_COMPENSATION_PAYOUT_SOURCE_STATES.DISCONNECTED,
      amount: null,
      recordCount: 0,
      records: [],
      knownZero: false,
      asOf,
      safeguards: {
        unknownIsNotZero: true,
        paidRequiresPayoutEvidence: true,
        eventPromotionPerformed: false
      }
    });
  }

  if (!Array.isArray(records)) {
    fail("ADVISOR_COMPENSATION_PAYOUT_RECORDS_ARRAY_REQUIRED");
  }

  const normalizedSourceState =
    sourceState || ADVISOR_COMPENSATION_PAYOUT_SOURCE_STATES.AVAILABLE;
  if (!Object.values(ADVISOR_COMPENSATION_PAYOUT_SOURCE_STATES)
      .includes(normalizedSourceState)) {
    fail("ADVISOR_COMPENSATION_PAYOUT_SOURCE_STATE_INVALID");
  }
  if (normalizedSourceState ===
      ADVISOR_COMPENSATION_PAYOUT_SOURCE_STATES.DISCONNECTED) {
    fail("ADVISOR_COMPENSATION_PAYOUT_RECORDS_WITH_DISCONNECTED_SOURCE");
  }

  const expectedCurrency = String(currency).toUpperCase();
  const seen = new Map();
  const matched = [];

  for (const record of records) {
    const validation = validateAdvisorCompensationConfirmedPayoutRecord(record);
    if (!validation.valid) {
      const error = new Error("ADVISOR_COMPENSATION_PAYOUT_RECORD_INVALID");
      error.code = "ADVISOR_COMPENSATION_PAYOUT_RECORD_INVALID";
      error.details = validation.errors;
      throw error;
    }
    if (record.advisorReference !== advisorReference ||
        record.periodKey !== periodKey) {
      continue;
    }
    if (record.amount.currency !== expectedCurrency) {
      fail("ADVISOR_COMPENSATION_PAYOUT_CURRENCY_MISMATCH");
    }
    const previous = seen.get(record.payoutRecordId);
    if (previous && previous.recordDigest !== record.recordDigest) {
      fail("ADVISOR_COMPENSATION_PAYOUT_RECORD_ID_CONFLICT");
    }
    seen.set(record.payoutRecordId, record);
    matched.push(record);
  }

  const amount = Math.round(
    matched.reduce((total, record) => total + record.amount.value, 0) * 100
  ) / 100;

  return deepFreeze({
    sourceState: normalizedSourceState,
    amount,
    recordCount: matched.length,
    records: matched.map(clone),
    knownZero: matched.length === 0,
    asOf,
    safeguards: {
      unknownIsNotZero: true,
      paidRequiresPayoutEvidence: true,
      eventPromotionPerformed: false
    }
  });
}

module.exports = {
  ADVISOR_COMPENSATION_PAYOUT_RECORD_CONTRACT_VERSION,
  ADVISOR_COMPENSATION_PAYOUT_SOURCE_STATES,
  createAdvisorCompensationConfirmedPayoutRecord,
  validateAdvisorCompensationConfirmedPayoutRecord,
  projectAdvisorCompensationPayoutTruth
};
