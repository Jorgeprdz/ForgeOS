"use strict";

const {
  clone,
  deepFreeze,
  sha256
} = require("../events/advisor-compensation-event-contract");

const ADVISOR_COMPENSATION_FORWARD_SIGNAL_CONTRACT_VERSION =
  "ADVISOR_COMPENSATION_FORWARD_SIGNAL_001";

const ADVISOR_COMPENSATION_FORWARD_SIGNAL_KINDS = Object.freeze({
  POTENTIAL: "POTENTIAL",
  AT_RISK: "AT_RISK"
});

const ADVISOR_COMPENSATION_FORWARD_SIGNAL_STATES = Object.freeze({
  ACTIVE: "ACTIVE",
  RESOLVED: "RESOLVED",
  EXPIRED: "EXPIRED"
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
    "ADVISOR_COMPENSATION_FORWARD_SIGNAL_PERIOD_REQUIRED"
  );
  if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(periodKey)) {
    fail("ADVISOR_COMPENSATION_FORWARD_SIGNAL_PERIOD_INVALID");
  }
  return periodKey;
}

function requiredMoney(value) {
  if (value === null || value === undefined || value === "") {
    fail("ADVISOR_COMPENSATION_FORWARD_SIGNAL_AMOUNT_REQUIRED");
  }
  const amount = Number(value);
  if (!Number.isFinite(amount) || amount < 0) {
    fail("ADVISOR_COMPENSATION_FORWARD_SIGNAL_AMOUNT_INVALID");
  }
  return Math.round(amount * 100) / 100;
}

function createAdvisorCompensationForwardSignal(input = {}) {
  const kind = requiredString(
    input.kind,
    "ADVISOR_COMPENSATION_FORWARD_SIGNAL_KIND_REQUIRED"
  );
  if (!Object.values(ADVISOR_COMPENSATION_FORWARD_SIGNAL_KINDS).includes(kind)) {
    fail("ADVISOR_COMPENSATION_FORWARD_SIGNAL_KIND_INVALID");
  }

  const state = input.state || ADVISOR_COMPENSATION_FORWARD_SIGNAL_STATES.ACTIVE;
  if (!Object.values(ADVISOR_COMPENSATION_FORWARD_SIGNAL_STATES).includes(state)) {
    fail("ADVISOR_COMPENSATION_FORWARD_SIGNAL_STATE_INVALID");
  }

  const currency = requiredString(
    input.currency,
    "ADVISOR_COMPENSATION_FORWARD_SIGNAL_CURRENCY_REQUIRED"
  ).toUpperCase();
  if (!/^[A-Z]{3}$/.test(currency)) {
    fail("ADVISOR_COMPENSATION_FORWARD_SIGNAL_CURRENCY_INVALID");
  }

  const signal = {
    contractVersion: ADVISOR_COMPENSATION_FORWARD_SIGNAL_CONTRACT_VERSION,
    signalId: requiredString(
      input.signalId,
      "ADVISOR_COMPENSATION_FORWARD_SIGNAL_ID_REQUIRED"
    ),
    kind,
    state,
    advisorReference: requiredString(
      input.advisorReference,
      "ADVISOR_COMPENSATION_FORWARD_SIGNAL_ADVISOR_REQUIRED"
    ),
    periodKey: requiredPeriod(input.periodKey),
    amount: {
      value: requiredMoney(input.amount),
      currency
    },
    source: {
      authority: requiredString(
        input.sourceAuthority,
        "ADVISOR_COMPENSATION_FORWARD_SIGNAL_SOURCE_AUTHORITY_REQUIRED"
      ),
      reference: requiredString(
        input.sourceReference,
        "ADVISOR_COMPENSATION_FORWARD_SIGNAL_SOURCE_REFERENCE_REQUIRED"
      ),
      snapshotReference: present(input.sourceSnapshotReference)
        ? String(input.sourceSnapshotReference).trim()
        : null
    },
    reason: present(input.reason) ? String(input.reason).trim() : null,
    confidence: input.confidence === null || input.confidence === undefined ||
      input.confidence === ""
      ? null
      : Number(input.confidence),
    metadata: clone(input.metadata || {}),
    safeguards: {
      incomeTruth: false,
      earnedTruth: false,
      paidTruth: false,
      includedInRealIncome: false,
      probabilityWeightingApplied: false,
      externalMutationAuthorized: false
    }
  };

  if (signal.confidence !== null &&
      (!Number.isFinite(signal.confidence) ||
       signal.confidence < 0 ||
       signal.confidence > 1)) {
    fail("ADVISOR_COMPENSATION_FORWARD_SIGNAL_CONFIDENCE_INVALID");
  }

  signal.signalDigest = sha256(signal);
  return deepFreeze(signal);
}

function validateAdvisorCompensationForwardSignal(signal) {
  const errors = [];
  if (!signal || typeof signal !== "object") {
    return Object.freeze({
      valid: false,
      errors: Object.freeze(["forward_signal_missing"])
    });
  }
  if (signal.contractVersion !==
      ADVISOR_COMPENSATION_FORWARD_SIGNAL_CONTRACT_VERSION) {
    errors.push("forward_signal_contract_version_invalid");
  }
  if (!Object.values(ADVISOR_COMPENSATION_FORWARD_SIGNAL_KINDS)
      .includes(signal.kind)) {
    errors.push("forward_signal_kind_invalid");
  }
  if (!Object.values(ADVISOR_COMPENSATION_FORWARD_SIGNAL_STATES)
      .includes(signal.state)) {
    errors.push("forward_signal_state_invalid");
  }
  if (!Number.isFinite(signal.amount?.value) || signal.amount.value < 0) {
    errors.push("forward_signal_amount_invalid");
  }
  if (!/^[A-Z]{3}$/.test(signal.amount?.currency || "")) {
    errors.push("forward_signal_currency_invalid");
  }
  if (!/^[a-f0-9]{64}$/.test(signal.signalDigest || "")) {
    errors.push("forward_signal_digest_invalid");
  }
  if (signal.safeguards?.incomeTruth !== false) {
    errors.push("forward_signal_income_truth_must_be_false");
  }
  if (signal.safeguards?.includedInRealIncome !== false) {
    errors.push("forward_signal_real_income_must_be_false");
  }
  return Object.freeze({
    valid: errors.length === 0,
    errors: Object.freeze(errors)
  });
}

function projectAdvisorCompensationForwardSignals({
  signals = [],
  advisorReference,
  periodKey,
  currency = "MXN"
} = {}) {
  if (!Array.isArray(signals)) {
    fail("ADVISOR_COMPENSATION_FORWARD_SIGNALS_ARRAY_REQUIRED");
  }
  const expectedCurrency = String(currency).toUpperCase();
  const seen = new Map();
  const active = [];

  for (const signal of signals) {
    const validation = validateAdvisorCompensationForwardSignal(signal);
    if (!validation.valid) {
      const error = new Error("ADVISOR_COMPENSATION_FORWARD_SIGNAL_INVALID");
      error.code = "ADVISOR_COMPENSATION_FORWARD_SIGNAL_INVALID";
      error.details = validation.errors;
      throw error;
    }
    if (signal.advisorReference !== advisorReference ||
        signal.periodKey !== periodKey) {
      continue;
    }
    if (signal.amount.currency !== expectedCurrency) {
      fail("ADVISOR_COMPENSATION_FORWARD_SIGNAL_CURRENCY_MISMATCH");
    }
    const previous = seen.get(signal.signalId);
    if (previous && previous.signalDigest !== signal.signalDigest) {
      fail("ADVISOR_COMPENSATION_FORWARD_SIGNAL_ID_CONFLICT");
    }
    seen.set(signal.signalId, signal);
    if (signal.state === ADVISOR_COMPENSATION_FORWARD_SIGNAL_STATES.ACTIVE) {
      active.push(signal);
    }
  }

  const sum = (kind) => Math.round(
    active
      .filter((signal) => signal.kind === kind)
      .reduce((total, signal) => total + signal.amount.value, 0) * 100
  ) / 100;

  return deepFreeze({
    potentialAmount: sum(ADVISOR_COMPENSATION_FORWARD_SIGNAL_KINDS.POTENTIAL),
    atRiskAmount: sum(ADVISOR_COMPENSATION_FORWARD_SIGNAL_KINDS.AT_RISK),
    activeSignalCount: active.length,
    potentialCount: active.filter((item) =>
      item.kind === ADVISOR_COMPENSATION_FORWARD_SIGNAL_KINDS.POTENTIAL
    ).length,
    atRiskCount: active.filter((item) =>
      item.kind === ADVISOR_COMPENSATION_FORWARD_SIGNAL_KINDS.AT_RISK
    ).length,
    signals: active.map(clone),
    safeguards: {
      includedInRealIncome: false,
      probabilityWeightingApplied: false,
      externalMutationAuthorized: false
    }
  });
}

module.exports = {
  ADVISOR_COMPENSATION_FORWARD_SIGNAL_CONTRACT_VERSION,
  ADVISOR_COMPENSATION_FORWARD_SIGNAL_KINDS,
  ADVISOR_COMPENSATION_FORWARD_SIGNAL_STATES,
  createAdvisorCompensationForwardSignal,
  validateAdvisorCompensationForwardSignal,
  projectAdvisorCompensationForwardSignals
};
