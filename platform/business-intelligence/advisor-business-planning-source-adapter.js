"use strict";

function required(value, code) {
  const normalized = typeof value === "string" ? value.trim() : "";
  if (!normalized) throw new TypeError(code);
  return normalized;
}

function adaptMiDiaFollowUpReadModel({ advisorId, period, readModel } = {}) {
  const scopedAdvisorId = required(advisorId, "BUSINESS_PLANNING_ADVISOR_REQUIRED");
  const yearMonth = required(period?.yearMonth, "BUSINESS_PLANNING_YEAR_MONTH_REQUIRED");
  if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(yearMonth)) {
    throw new TypeError("BUSINESS_PLANNING_YEAR_MONTH_INVALID");
  }
  if (!readModel || readModel.readModelVersion !== "NFAST-09.3E") {
    throw new TypeError("BUSINESS_PLANNING_MI_DIA_READ_MODEL_UNSUPPORTED");
  }
  if (!Array.isArray(readModel.items)) {
    throw new TypeError("BUSINESS_PLANNING_MI_DIA_ITEMS_INVALID");
  }

  return Object.freeze({
    advisorId: scopedAdvisorId,
    period: Object.freeze({ yearMonth }),
    sourceAuthority: "MI_DIA_FOLLOW_UP_READ_MODEL",
    generatedAt: readModel.generatedAt,
    fingerprint: readModel.fingerprint,
    stale: readModel.items.some(item => item.stale === true),
    items: readModel.items,
    evidenceRefs: [readModel.fingerprint],
    limitations: Object.freeze([
      "Mi Día aporta compromisos fechados; no prueba por sí solo causalidad ni intención comercial.",
    ]),
  });
}

module.exports = { adaptMiDiaFollowUpReadModel };
