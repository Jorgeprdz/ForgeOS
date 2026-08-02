"use strict";

const {
  COMMISSION_BASIS_STATES
} = require("./advisor-commission-calculation-contract");

function normalizeFrequency(value) {
  if (value === undefined || value === null) return null;
  return String(value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toUpperCase();
}

function roundMoney(value) {
  return Math.round((Number(value) + Number.EPSILON) * 100) / 100;
}

function resolveAdvisorCommissionPaymentBasis({
  paymentAmount,
  annualPremium,
  paymentFrequency,
  accumulatedConfirmedPaidPremium = null,
  paymentFrequencyFactors = {},
  tolerance = 0.01
} = {}) {
  const paid = Number(paymentAmount);
  const annual = Number(annualPremium);
  if (!Number.isFinite(paid) || paid <= 0) {
    return Object.freeze({ status: "BLOCKED", reason: "confirmed_payment_amount_invalid" });
  }
  if (!Number.isFinite(annual) || annual <= 0) {
    return Object.freeze({ status: "BLOCKED", reason: "annual_premium_required" });
  }

  const frequency = normalizeFrequency(paymentFrequency);
  if (!frequency || !Object.prototype.hasOwnProperty.call(paymentFrequencyFactors, frequency)) {
    return Object.freeze({
      status: "BLOCKED",
      reason: "payment_frequency_not_supported",
      paymentFrequency: frequency
    });
  }

  const factor = Number(paymentFrequencyFactors[frequency]);
  if (!Number.isFinite(factor) || factor <= 0 || factor > 1) {
    return Object.freeze({ status: "BLOCKED", reason: "payment_frequency_factor_invalid" });
  }

  const expectedScheduledReceipt = roundMoney(annual * factor);
  const accumulated = accumulatedConfirmedPaidPremium === null ||
    accumulatedConfirmedPaidPremium === undefined ||
    accumulatedConfirmedPaidPremium === ""
    ? paid
    : Number(accumulatedConfirmedPaidPremium);

  if (!Number.isFinite(accumulated) || accumulated < paid) {
    return Object.freeze({
      status: "BLOCKED",
      reason: "accumulated_paid_premium_invalid"
    });
  }

  let basisState = COMMISSION_BASIS_STATES.MATCHED_SCHEDULED_RECEIPT;
  if (paid < expectedScheduledReceipt - tolerance) {
    basisState = COMMISSION_BASIS_STATES.PARTIAL_PAYMENT;
  } else if (paid > expectedScheduledReceipt + tolerance) {
    basisState = COMMISSION_BASIS_STATES.EXCESS_PAYMENT;
  }

  return Object.freeze({
    status: "READY",
    reason: null,
    paymentFrequency: frequency,
    paymentFrequencyFactor: factor,
    annualPremium: roundMoney(annual),
    currentConfirmedPaidPremium: roundMoney(paid),
    accumulatedConfirmedPaidPremium: roundMoney(accumulated),
    expectedScheduledReceipt,
    paymentCoverageRatio: expectedScheduledReceipt > 0
      ? Math.round((paid / expectedScheduledReceipt) * 1e8) / 1e8
      : null,
    basisState,
    commissionableBasisCurrent: roundMoney(paid),
    commissionableBasisAccumulated: roundMoney(accumulated),
    basisAuthority: "CONFIRMED_PAYMENT_EVENT",
    issuedPremiumUsedAsPaidPremium: false,
    annualPremiumUsedAsCashTruth: false
  });
}

module.exports = {
  normalizeFrequency,
  roundMoney,
  resolveAdvisorCommissionPaymentBasis
};
