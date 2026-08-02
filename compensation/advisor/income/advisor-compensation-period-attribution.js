"use strict";

function present(value) {
  return value !== undefined && value !== null && String(value).trim() !== "";
}

function fail(code) {
  const error = new Error(code);
  error.code = code;
  throw error;
}

function isMonthlyPeriodKey(value) {
  return typeof value === "string" &&
    /^\d{4}-(0[1-9]|1[0-2])$/.test(value);
}

function resolveAdvisorCompensationMonthlyPeriod(event) {
  if (!event || typeof event !== "object") {
    fail("ADVISOR_COMPENSATION_PERIOD_EVENT_REQUIRED");
  }

  const eventPeriod = present(event.periodKey)
    ? String(event.periodKey).trim()
    : null;
  const attributedPeriod = present(event.metadata?.incomePeriodKey)
    ? String(event.metadata.incomePeriodKey).trim()
    : null;

  if (attributedPeriod && !isMonthlyPeriodKey(attributedPeriod)) {
    fail("ADVISOR_COMPENSATION_MONTHLY_PERIOD_ATTRIBUTION_INVALID");
  }

  if (isMonthlyPeriodKey(eventPeriod)) {
    if (attributedPeriod && attributedPeriod !== eventPeriod) {
      fail("ADVISOR_COMPENSATION_MONTHLY_PERIOD_ATTRIBUTION_CONFLICT");
    }
    return Object.freeze({
      monthlyPeriodKey: eventPeriod,
      source: "EVENT_PERIOD_KEY",
      sourcePeriodKey: eventPeriod
    });
  }

  if (attributedPeriod) {
    return Object.freeze({
      monthlyPeriodKey: attributedPeriod,
      source: "EXPLICIT_INCOME_PERIOD_ATTRIBUTION",
      sourcePeriodKey: eventPeriod
    });
  }

  fail("ADVISOR_COMPENSATION_MONTHLY_PERIOD_ATTRIBUTION_REQUIRED");
}

module.exports = {
  isMonthlyPeriodKey,
  resolveAdvisorCompensationMonthlyPeriod
};
