"use strict";

const {
  clone,
  deepFreeze,
  sha256
} = require("../events/advisor-compensation-event-contract");

const ADVISOR_COMPENSATION_PERIOD_SNAPSHOT_CONTRACT_VERSION =
  "ADVISOR_COMPENSATION_PERIOD_SNAPSHOT_001";

const ADVISOR_COMPENSATION_PERIOD_SNAPSHOT_STATUSES = Object.freeze({
  READY: "READY",
  PARTIAL: "PARTIAL",
  EMPTY: "EMPTY",
  BLOCKED: "BLOCKED"
});

const ADVISOR_COMPENSATION_REAL_BASES = Object.freeze({
  PAID: "PAID",
  EARNED: "EARNED",
  UNAVAILABLE: "UNAVAILABLE"
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
    "ADVISOR_COMPENSATION_PERIOD_SNAPSHOT_PERIOD_REQUIRED"
  );
  if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(periodKey)) {
    fail("ADVISOR_COMPENSATION_PERIOD_SNAPSHOT_PERIOD_INVALID");
  }
  return periodKey;
}

function moneyOrNull(value, code) {
  if (value === null) return null;
  if (value === undefined || value === "") fail(code);
  const amount = Number(value);
  if (!Number.isFinite(amount)) fail(code);
  return Math.round(amount * 100) / 100;
}

function nonNegativeMoney(value, code) {
  const amount = moneyOrNull(value, code);
  if (amount === null || amount < 0) fail(code);
  return amount;
}

function createAdvisorCompensationPeriodSnapshot(input = {}) {
  const status = requiredString(
    input.status,
    "ADVISOR_COMPENSATION_PERIOD_SNAPSHOT_STATUS_REQUIRED"
  );
  if (!Object.values(ADVISOR_COMPENSATION_PERIOD_SNAPSHOT_STATUSES)
      .includes(status)) {
    fail("ADVISOR_COMPENSATION_PERIOD_SNAPSHOT_STATUS_INVALID");
  }

  const currency = requiredString(
    input.currency,
    "ADVISOR_COMPENSATION_PERIOD_SNAPSHOT_CURRENCY_REQUIRED"
  ).toUpperCase();
  if (!/^[A-Z]{3}$/.test(currency)) {
    fail("ADVISOR_COMPENSATION_PERIOD_SNAPSHOT_CURRENCY_INVALID");
  }

  const estimated = nonNegativeMoney(
    input.estimatedAmount,
    "ADVISOR_COMPENSATION_PERIOD_SNAPSHOT_ESTIMATED_INVALID"
  );
  const earnedGross = nonNegativeMoney(
    input.earnedGrossAmount,
    "ADVISOR_COMPENSATION_PERIOD_SNAPSHOT_EARNED_GROSS_INVALID"
  );
  const adjustments = moneyOrNull(
    input.adjustmentAmount,
    "ADVISOR_COMPENSATION_PERIOD_SNAPSHOT_ADJUSTMENT_INVALID"
  );
  const reversals = moneyOrNull(
    input.reversalAmount,
    "ADVISOR_COMPENSATION_PERIOD_SNAPSHOT_REVERSAL_INVALID"
  );
  if (reversals > 0) {
    fail("ADVISOR_COMPENSATION_PERIOD_SNAPSHOT_REVERSAL_MUST_BE_NON_POSITIVE");
  }
  const earnedNet = moneyOrNull(
    input.earnedNetAmount,
    "ADVISOR_COMPENSATION_PERIOD_SNAPSHOT_EARNED_NET_INVALID"
  );
  if (earnedNet !== Math.round((earnedGross + adjustments + reversals) * 100) / 100) {
    fail("ADVISOR_COMPENSATION_PERIOD_SNAPSHOT_EARNED_RECONCILIATION_FAILED");
  }

  const paidAmount = moneyOrNull(
    input.paidAmount,
    "ADVISOR_COMPENSATION_PERIOD_SNAPSHOT_PAID_INVALID"
  );
  if (paidAmount !== null && paidAmount < 0) {
    fail("ADVISOR_COMPENSATION_PERIOD_SNAPSHOT_PAID_INVALID");
  }

  const realBasis = requiredString(
    input.realBasis,
    "ADVISOR_COMPENSATION_PERIOD_SNAPSHOT_REAL_BASIS_REQUIRED"
  );
  if (!Object.values(ADVISOR_COMPENSATION_REAL_BASES).includes(realBasis)) {
    fail("ADVISOR_COMPENSATION_PERIOD_SNAPSHOT_REAL_BASIS_INVALID");
  }
  const realAmount = moneyOrNull(
    input.realAmount,
    "ADVISOR_COMPENSATION_PERIOD_SNAPSHOT_REAL_INVALID"
  );
  if (realBasis === ADVISOR_COMPENSATION_REAL_BASES.UNAVAILABLE &&
      realAmount !== null) {
    fail("ADVISOR_COMPENSATION_PERIOD_SNAPSHOT_REAL_UNAVAILABLE_MUST_BE_NULL");
  }
  if (realBasis === ADVISOR_COMPENSATION_REAL_BASES.PAID &&
      realAmount !== paidAmount) {
    fail("ADVISOR_COMPENSATION_PERIOD_SNAPSHOT_REAL_PAID_MISMATCH");
  }
  if (realBasis === ADVISOR_COMPENSATION_REAL_BASES.EARNED &&
      realAmount !== earnedNet) {
    fail("ADVISOR_COMPENSATION_PERIOD_SNAPSHOT_REAL_EARNED_MISMATCH");
  }

  const potential = nonNegativeMoney(
    input.potentialAmount,
    "ADVISOR_COMPENSATION_PERIOD_SNAPSHOT_POTENTIAL_INVALID"
  );
  const atRisk = nonNegativeMoney(
    input.atRiskAmount,
    "ADVISOR_COMPENSATION_PERIOD_SNAPSHOT_AT_RISK_INVALID"
  );

  const snapshot = {
    contractVersion: ADVISOR_COMPENSATION_PERIOD_SNAPSHOT_CONTRACT_VERSION,
    snapshotId: requiredString(
      input.snapshotId,
      "ADVISOR_COMPENSATION_PERIOD_SNAPSHOT_ID_REQUIRED"
    ),
    advisorReference: requiredString(
      input.advisorReference,
      "ADVISOR_COMPENSATION_PERIOD_SNAPSHOT_ADVISOR_REQUIRED"
    ),
    periodKey: requiredPeriod(input.periodKey),
    currency,
    status,
    capturedAt: requiredString(
      input.capturedAt,
      "ADVISOR_COMPENSATION_PERIOD_SNAPSHOT_CAPTURED_AT_REQUIRED"
    ),
    amounts: {
      estimated,
      earned: {
        gross: earnedGross,
        adjustments,
        reversals,
        net: earnedNet
      },
      paid: {
        sourceState: requiredString(
          input.paidSourceState,
          "ADVISOR_COMPENSATION_PERIOD_SNAPSHOT_PAID_SOURCE_STATE_REQUIRED"
        ),
        value: paidAmount,
        knownZero: input.paidKnownZero === true
      },
      real: {
        basis: realBasis,
        value: realAmount
      },
      potential,
      atRisk
    },
    counts: clone(input.counts || {}),
    sourceHealth: clone(input.sourceHealth || {}),
    details: clone(input.details || {}),
    explanation: {
      realBasis,
      potentialExcludedFromReal: true,
      atRiskExcludedFromReal: true,
      estimatedExcludedFromEarned: true,
      paidRequiresConfirmedPayoutEvidence: true,
      unknownPaidIsNull: true,
      ...clone(input.explanation || {})
    },
    safeguards: {
      quoteAsIncome: false,
      issuedPremiumAsIncome: false,
      potentialAsRealIncome: false,
      estimatedAsEarnedIncome: false,
      earnedAsPaidIncome: false,
      unknownAsZero: false,
      externalMutationAuthorized: false,
      ...clone(input.safeguards || {})
    }
  };

  if (!Number.isFinite(Date.parse(snapshot.capturedAt)) ||
      !snapshot.capturedAt.includes("T")) {
    fail("ADVISOR_COMPENSATION_PERIOD_SNAPSHOT_CAPTURED_AT_INVALID");
  }

  snapshot.snapshotDigest = sha256(snapshot);
  return deepFreeze(snapshot);
}

function validateAdvisorCompensationPeriodSnapshot(snapshot) {
  const errors = [];
  if (!snapshot || typeof snapshot !== "object") {
    return Object.freeze({
      valid: false,
      errors: Object.freeze(["period_snapshot_missing"])
    });
  }
  if (snapshot.contractVersion !==
      ADVISOR_COMPENSATION_PERIOD_SNAPSHOT_CONTRACT_VERSION) {
    errors.push("period_snapshot_contract_version_invalid");
  }
  if (!Object.values(ADVISOR_COMPENSATION_PERIOD_SNAPSHOT_STATUSES)
      .includes(snapshot.status)) {
    errors.push("period_snapshot_status_invalid");
  }
  if (!Object.values(ADVISOR_COMPENSATION_REAL_BASES)
      .includes(snapshot.amounts?.real?.basis)) {
    errors.push("period_snapshot_real_basis_invalid");
  }
  if (!/^[a-f0-9]{64}$/.test(snapshot.snapshotDigest || "")) {
    errors.push("period_snapshot_digest_invalid");
  }
  if (snapshot.safeguards?.quoteAsIncome !== false) {
    errors.push("quote_as_income_must_be_false");
  }
  if (snapshot.safeguards?.estimatedAsEarnedIncome !== false) {
    errors.push("estimated_as_earned_must_be_false");
  }
  if (snapshot.safeguards?.earnedAsPaidIncome !== false) {
    errors.push("earned_as_paid_must_be_false");
  }
  if (snapshot.safeguards?.unknownAsZero !== false) {
    errors.push("unknown_as_zero_must_be_false");
  }
  return Object.freeze({
    valid: errors.length === 0,
    errors: Object.freeze(errors)
  });
}

module.exports = {
  ADVISOR_COMPENSATION_PERIOD_SNAPSHOT_CONTRACT_VERSION,
  ADVISOR_COMPENSATION_PERIOD_SNAPSHOT_STATUSES,
  ADVISOR_COMPENSATION_REAL_BASES,
  createAdvisorCompensationPeriodSnapshot,
  validateAdvisorCompensationPeriodSnapshot
};
