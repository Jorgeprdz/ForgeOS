"use strict";

const crypto = require("crypto");

const PAYOUT_EVIDENCE_CONTRACT_VERSION = "ADVISOR_COMPENSATION_PAYOUT_EVIDENCE_001";
const PAYOUT_EVIDENCE_SOURCE_TYPES = Object.freeze({
  OFFICIAL_STATEMENT: "OFFICIAL_STATEMENT",
  CARRIER_REPORT: "CARRIER_REPORT",
  RECEIPT: "RECEIPT",
  CONTROLLED_MANUAL: "CONTROLLED_MANUAL"
});
const PAYOUT_EVIDENCE_LINE_KINDS = Object.freeze({
  PAYMENT: "PAYMENT",
  ADJUSTMENT: "ADJUSTMENT",
  REVERSAL: "REVERSAL",
  RETROACTIVE_DIFFERENCE: "RETROACTIVE_DIFFERENCE"
});

function fail(code, details = null) {
  const error = new Error(code);
  error.code = code;
  if (details !== null) error.details = details;
  throw error;
}
function present(value) {
  return value !== undefined && value !== null && String(value).trim() !== "";
}
function requiredString(value, code) {
  if (!present(value)) fail(code);
  return String(value).trim();
}
function clone(value) {
  return value == null ? value : JSON.parse(JSON.stringify(value));
}
function deepFreeze(value) {
  if (!value || typeof value !== "object" || Object.isFrozen(value)) return value;
  Object.freeze(value);
  Object.values(value).forEach(deepFreeze);
  return value;
}
function stable(value) {
  if (Array.isArray(value)) return value.map(stable);
  if (!value || typeof value !== "object") return value;
  return Object.keys(value).sort().reduce((output, key) => {
    output[key] = stable(value[key]);
    return output;
  }, {});
}
function sha256(value) {
  return crypto.createHash("sha256").update(
    Buffer.isBuffer(value) || typeof value === "string"
      ? value
      : JSON.stringify(stable(value))
  ).digest("hex");
}
function requiredInstant(value, code) {
  const text = requiredString(value, code);
  if (!text.includes("T") || !Number.isFinite(Date.parse(text))) fail(code);
  return text;
}
function normalizeDate(value) {
  const text = requiredString(value, "ADVISOR_COMPENSATION_PAYOUT_LINE_DATE_REQUIRED");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(text) || !Number.isFinite(Date.parse(`${text}T00:00:00Z`))) {
    fail("ADVISOR_COMPENSATION_PAYOUT_LINE_DATE_INVALID");
  }
  return text;
}
function normalizePeriod(value, paymentDate) {
  const text = present(value) ? String(value).trim() : paymentDate.slice(0, 7);
  if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(text)) {
    fail("ADVISOR_COMPENSATION_PAYOUT_LINE_PERIOD_INVALID");
  }
  return text;
}
function normalizeMoney(value, kind) {
  if (value === null || value === undefined || value === "") {
    fail("ADVISOR_COMPENSATION_PAYOUT_LINE_AMOUNT_REQUIRED");
  }
  const amount = Math.round(Number(value) * 100) / 100;
  if (!Number.isFinite(amount) || amount === 0) {
    fail("ADVISOR_COMPENSATION_PAYOUT_LINE_AMOUNT_INVALID");
  }
  if (kind === PAYOUT_EVIDENCE_LINE_KINDS.PAYMENT && amount <= 0) {
    fail("ADVISOR_COMPENSATION_PAYOUT_PAYMENT_MUST_BE_POSITIVE");
  }
  if (kind === PAYOUT_EVIDENCE_LINE_KINDS.REVERSAL && amount >= 0) {
    fail("ADVISOR_COMPENSATION_PAYOUT_REVERSAL_MUST_BE_NEGATIVE");
  }
  return amount;
}
function normalizeLine(input = {}, defaultCurrency = "MXN") {
  const kind = requiredString(
    input.kind || PAYOUT_EVIDENCE_LINE_KINDS.PAYMENT,
    "ADVISOR_COMPENSATION_PAYOUT_LINE_KIND_REQUIRED"
  ).toUpperCase();
  if (!Object.values(PAYOUT_EVIDENCE_LINE_KINDS).includes(kind)) {
    fail("ADVISOR_COMPENSATION_PAYOUT_LINE_KIND_INVALID");
  }
  const paymentDate = normalizeDate(input.paymentDate);
  const currency = requiredString(
    input.currency || defaultCurrency,
    "ADVISOR_COMPENSATION_PAYOUT_LINE_CURRENCY_REQUIRED"
  ).toUpperCase();
  if (!/^[A-Z]{3}$/.test(currency)) {
    fail("ADVISOR_COMPENSATION_PAYOUT_LINE_CURRENCY_INVALID");
  }
  const line = {
    lineId: requiredString(input.lineId, "ADVISOR_COMPENSATION_PAYOUT_LINE_ID_REQUIRED"),
    kind,
    paymentDate,
    periodKey: normalizePeriod(input.periodKey, paymentDate),
    amount: { value: normalizeMoney(input.amount, kind), currency },
    concept: present(input.concept) ? String(input.concept).trim().toUpperCase() : null,
    policyReference: present(input.policyReference) ? String(input.policyReference).trim() : null,
    carrierReference: present(input.carrierReference) ? String(input.carrierReference).trim() : null,
    description: present(input.description) ? String(input.description).trim() : null,
    metadata: clone(input.metadata || {})
  };
  line.lineDigest = sha256(line);
  return deepFreeze(line);
}

function createAdvisorCompensationPayoutEvidence(input = {}) {
  const sourceType = requiredString(
    input.sourceType,
    "ADVISOR_COMPENSATION_PAYOUT_EVIDENCE_SOURCE_TYPE_REQUIRED"
  ).toUpperCase();
  if (!Object.values(PAYOUT_EVIDENCE_SOURCE_TYPES).includes(sourceType)) {
    fail("ADVISOR_COMPENSATION_PAYOUT_EVIDENCE_SOURCE_TYPE_INVALID");
  }
  const evidenceHash = requiredString(
    input.evidenceHash,
    "ADVISOR_COMPENSATION_PAYOUT_EVIDENCE_HASH_REQUIRED"
  ).toLowerCase();
  if (!/^[a-f0-9]{64}$/.test(evidenceHash)) {
    fail("ADVISOR_COMPENSATION_PAYOUT_EVIDENCE_HASH_INVALID");
  }
  const rawLines = Array.isArray(input.lines) ? input.lines : [];
  if (rawLines.length === 0) fail("ADVISOR_COMPENSATION_PAYOUT_EVIDENCE_LINES_REQUIRED");
  const lines = rawLines.map((line) => normalizeLine(line, input.currency || "MXN"));
  const seen = new Set();
  for (const line of lines) {
    if (seen.has(line.lineId)) fail("ADVISOR_COMPENSATION_PAYOUT_LINE_ID_DUPLICATE");
    seen.add(line.lineId);
  }
  const manualControl = {
    actorId: present(input.manualActorId) ? String(input.manualActorId).trim() : null,
    reason: present(input.manualReason) ? String(input.manualReason).trim() : null
  };
  if (sourceType === PAYOUT_EVIDENCE_SOURCE_TYPES.CONTROLLED_MANUAL &&
      (!manualControl.actorId || !manualControl.reason)) {
    fail("ADVISOR_COMPENSATION_CONTROLLED_MANUAL_AUTHORITY_REQUIRED");
  }
  const evidence = {
    contractVersion: PAYOUT_EVIDENCE_CONTRACT_VERSION,
    evidenceId: requiredString(input.evidenceId, "ADVISOR_COMPENSATION_PAYOUT_EVIDENCE_ID_REQUIRED"),
    advisorReference: requiredString(input.advisorReference, "ADVISOR_COMPENSATION_PAYOUT_EVIDENCE_ADVISOR_REQUIRED"),
    sourceType,
    sourceAuthority: requiredString(input.sourceAuthority, "ADVISOR_COMPENSATION_PAYOUT_EVIDENCE_AUTHORITY_REQUIRED"),
    sourceReference: requiredString(input.sourceReference, "ADVISOR_COMPENSATION_PAYOUT_EVIDENCE_REFERENCE_REQUIRED"),
    receivedAt: requiredInstant(input.receivedAt, "ADVISOR_COMPENSATION_PAYOUT_EVIDENCE_RECEIVED_AT_INVALID"),
    evidenceHash,
    fileName: present(input.fileName) ? String(input.fileName).trim() : null,
    mimeType: present(input.mimeType) ? String(input.mimeType).trim().toLowerCase() : null,
    manualControl,
    lines,
    metadata: clone(input.metadata || {}),
    safeguards: {
      officialEvidencePreferred: true,
      controlledManualRequiresActorAndReason: true,
      automaticConfirmation: false,
      paidTruthCreated: false,
      externalMutationAuthorized: false
    }
  };
  evidence.evidenceDigest = sha256(evidence);
  return deepFreeze(evidence);
}

function validateAdvisorCompensationPayoutEvidence(evidence) {
  const errors = [];
  if (!evidence || typeof evidence !== "object") return deepFreeze({ valid: false, errors: ["evidence_missing"] });
  if (evidence.contractVersion !== PAYOUT_EVIDENCE_CONTRACT_VERSION) errors.push("evidence_contract_invalid");
  if (!Object.values(PAYOUT_EVIDENCE_SOURCE_TYPES).includes(evidence.sourceType)) errors.push("evidence_source_type_invalid");
  if (!/^[a-f0-9]{64}$/.test(evidence.evidenceHash || "")) errors.push("evidence_hash_invalid");
  if (!/^[a-f0-9]{64}$/.test(evidence.evidenceDigest || "")) errors.push("evidence_digest_invalid");
  if (!Array.isArray(evidence.lines) || evidence.lines.length === 0) errors.push("evidence_lines_missing");
  if (evidence.safeguards?.automaticConfirmation !== false) errors.push("automatic_confirmation_must_be_false");
  if (evidence.safeguards?.paidTruthCreated !== false) errors.push("intake_cannot_create_paid_truth");
  return deepFreeze({ valid: errors.length === 0, errors });
}

module.exports = {
  PAYOUT_EVIDENCE_CONTRACT_VERSION,
  PAYOUT_EVIDENCE_SOURCE_TYPES,
  PAYOUT_EVIDENCE_LINE_KINDS,
  present,
  clone,
  deepFreeze,
  sha256,
  normalizeLine,
  createAdvisorCompensationPayoutEvidence,
  validateAdvisorCompensationPayoutEvidence
};
