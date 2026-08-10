"use strict";

const {
  createAdvisorCompensationPaymentIntakeService
} = require("../payment/advisor-compensation-payment-intake-service");
const {
  calculateAdvisorCommission
} = require("../engine/advisor-commission-engine");
const {
  createAdvisorCompensationEventAuthority
} = require("../events/advisor-compensation-event-authority");
const {
  materializeAdvisorCompensationProductReadModel,
  sixMonthPeriods
} = require("../materialization/advisor-compensation-product-read-model-materializer");

const PRODUCTIVE_GATE = "FORGE_ADVISOR_COMPENSATION_PRODUCTIVE_GATE";

function present(value) {
  return value !== undefined && value !== null && String(value).trim() !== "";
}

function required(value, code) {
  if (!present(value)) {
    const error = new Error(code);
    error.code = code;
    throw error;
  }
  return String(value).trim();
}

function baseDiagnostics(buildSha = null) {
  return {
    contract: PRODUCTIVE_GATE,
    STATE: "FAILED",
    AUTH_STATE: "OK",
    PAYMENT_AUTHORITY_STATE: "CONFIRMED",
    HANDOFF_STATE: "FAILED",
    STAGE_080_STATE: "NOT_RUN",
    STAGE_030_STATE: "NOT_RUN",
    STAGE_040_STATE: "NOT_RUN",
    STAGE_050_STATE: "NOT_RUN",
    LEDGER_STATE: "NOT_RUN",
    MATERIALIZATION_STATE: "NOT_RUN",
    INCOME_READ_STATE: "NOT_MATERIALIZED",
    IDEMPOTENCY_STATE: "NOT_RUN",
    DEMO_FALLBACK_USED: false,
    SYNTHETIC_WRITER_USED: false,
    UNKNOWN_COERCION_USED: false,
    UNKNOWN_ZERO: false,
    BUILD_SHA: buildSha || null
  };
}

function result(state, diagnostics, extra = {}) {
  diagnostics.STATE = state;
  diagnostics.HANDOFF_STATE = state;
  return Object.freeze({
    state,
    diagnostics: Object.freeze({ ...diagnostics }),
    ...extra
  });
}

function canonicalPayload(context) {
  const payment = context?.payment || {};
  const policyReference = required(
    context?.policy?.policyReference,
    "ADVISOR_COMPENSATION_011D_POLICY_REFERENCE_REQUIRED"
  );
  return {
    canonicalPaymentEvent: {
      advisorId: required(context?.advisorId, "ADVISOR_COMPENSATION_011D_ADVISOR_REQUIRED"),
      paymentEventReference: required(context?.paymentEventReference, "ADVISOR_COMPENSATION_011D_PAYMENT_REFERENCE_REQUIRED"),
      policyReference,
      confirmationState: payment.confirmationState,
      paymentEvidenceReference: payment.paymentEvidenceReference,
      paymentAmount: payment.paymentAmount,
      currency: payment.currency,
      paymentDate: payment.paymentDate,
      periodCoveredStart: payment.periodCoveredStart,
      periodCoveredEnd: payment.periodCoveredEnd,
      paymentSource: payment.paymentSource,
      evidenceReferences: payment.evidenceReferences,
      eventDigest: payment.eventDigest,
      idempotencyKey: payment.idempotencyKey,
      confirmedBy: payment.confirmedBy,
      confirmedAt: payment.confirmedAt
    },
    canonicalReconciliation: context?.reconciliation,
    canonicalPersonReference: context?.personReference,
    policyContext: {
      policyReference,
      advisorReference: context?.advisorId,
      productId: context?.policy?.productReference,
      variant: context?.policy?.variant || null,
      policyYear: Number.isInteger(context?.obligation?.policyYear) ? context.obligation.policyYear : null,
      sourceAuthority: "CARTERA_CANONICAL_POLICY_010B_030B",
      sourceSnapshotReference: context?.obligation?.policyTermsDigest || null
    }
  };
}

async function safeIncomeState(readIncome) {
  if (typeof readIncome !== "function") return "NOT_MATERIALIZED";
  try {
    const value = await readIncome();
    return value?.state || value?.sourceState || value?.status || "READY";
  } catch {
    return "BLOCKED";
  }
}

async function persistBlockedIntake({ advisorReference, event, claimIntake, diagnostics }) {
  if (typeof claimIntake !== "function") {
    diagnostics.STAGE_030_STATE = "FAIL";
    diagnostics.IDEMPOTENCY_STATE = "FAIL";
    return { ok: false, reason: "PRODUCTIVE_INTAKE_PERSISTENCE_REQUIRED" };
  }
  try {
    const claim = await claimIntake(advisorReference, event);
    diagnostics.IDEMPOTENCY_STATE = claim?.state || "FAIL";
    diagnostics.LEDGER_STATE = claim?.state || "FAIL";
    if (claim?.state === "CONFLICT") return { ok: false, conflict: true, reason: "STAGE_030_IDEMPOTENCY_CONFLICT" };
    if (!claim || !["CREATED", "REPLAYED"].includes(claim.state)) {
      return { ok: false, reason: "STAGE_030_PRODUCTIVE_PERSISTENCE_FAILED" };
    }
    return { ok: true, claim };
  } catch {
    diagnostics.STAGE_030_STATE = "FAIL";
    diagnostics.IDEMPOTENCY_STATE = "FAIL";
    diagnostics.LEDGER_STATE = "FAIL";
    return { ok: false, reason: "STAGE_030_PRODUCTIVE_PERSISTENCE_FAILED" };
  }
}

async function orchestrateAdvisorCompensationHandoff({
  canonicalContext,
  productIdentities = [],
  officialRulePack = null,
  advisorMonthResolution = null,
  calculationContext = {},
  claimIntake,
  commitEconomicEvent,
  loadMaterializationInputs,
  appendReadModel,
  readIncome,
  clock = () => new Date().toISOString(),
  buildSha = null
} = {}) {
  const diagnostics = baseDiagnostics(buildSha);
  let intakeEvent;
  try {
    const payload = canonicalPayload(canonicalContext);
    const intake = createAdvisorCompensationPaymentIntakeService({ productIdentities })
      .intakeConfirmedPayment(payload);
    diagnostics.STAGE_080_STATE = "PASS";
    if (!intake?.event || !["ACCEPTED", "REPLAYED"].includes(intake.intakeStatus)) {
      diagnostics.STAGE_030_STATE = "FAIL";
      diagnostics.IDEMPOTENCY_STATE = intake?.conflictType ? "CONFLICT" : "FAIL";
      return result("FAILED", diagnostics, { reason: intake?.reason || "STAGE_030_REJECTED", amount: null });
    }
    diagnostics.STAGE_030_STATE = "PASS";
    intakeEvent = intake.event;
  } catch (error) {
    diagnostics.STAGE_080_STATE = "FAIL";
    diagnostics.STAGE_030_STATE = "FAIL";
    return result("FAILED", diagnostics, { reason: error?.code || error?.message || "STAGE_080_030_FAILED", amount: null });
  }

  const advisorReference = intakeEvent.references?.advisorReference;
  if (!present(advisorReference)) {
    diagnostics.STAGE_030_STATE = "FAIL";
    return result("FAILED", diagnostics, { reason: "ADVISOR_ATTRIBUTION_REQUIRED", amount: null });
  }

  if (!advisorMonthResolution || advisorMonthResolution.state !== "resolved" ||
      !Number.isInteger(advisorMonthResolution.careerMonth)) {
    const persisted = await persistBlockedIntake({
      advisorReference,
      event: intakeEvent,
      claimIntake,
      diagnostics
    });
    diagnostics.STAGE_040_STATE = "BLOCKED";
    diagnostics.INCOME_READ_STATE = await safeIncomeState(readIncome);
    if (!persisted.ok) {
      return result(persisted.conflict ? "BLOCKED" : "FAILED", diagnostics, {
        reason: persisted.reason,
        amount: null
      });
    }
    return result("BLOCKED", diagnostics, {
      reason: "ADVISOR_MONTH_AUTHORITY_UNAVAILABLE",
      amount: null,
      blockedBy: advisorMonthResolution?.reason || "career_clock_unresolved"
    });
  }

  if (!officialRulePack || officialRulePack?.metadata?.governanceStatus !== "official") {
    const persisted = await persistBlockedIntake({
      advisorReference,
      event: intakeEvent,
      claimIntake,
      diagnostics
    });
    diagnostics.STAGE_040_STATE = "BLOCKED";
    diagnostics.INCOME_READ_STATE = await safeIncomeState(readIncome);
    if (!persisted.ok) {
      return result(persisted.conflict ? "BLOCKED" : "FAILED", diagnostics, {
        reason: persisted.reason,
        amount: null
      });
    }
    return result("BLOCKED", diagnostics, {
      reason: "OFFICIAL_RULE_SNAPSHOT_UNAVAILABLE",
      amount: null
    });
  }

  const annualPremium = Number(calculationContext.annualPremium);
  if (!Number.isFinite(annualPremium) || annualPremium <= 0) {
    const persisted = await persistBlockedIntake({ advisorReference, event: intakeEvent, claimIntake, diagnostics });
    diagnostics.STAGE_040_STATE = "BLOCKED";
    diagnostics.INCOME_READ_STATE = await safeIncomeState(readIncome);
    return result(persisted.ok ? "BLOCKED" : "FAILED", diagnostics, {
      reason: persisted.ok ? "ANNUAL_PREMIUM_AUTHORITY_UNAVAILABLE" : persisted.reason,
      amount: null
    });
  }

  const calculation = calculateAdvisorCommission({
    paymentEvent: intakeEvent,
    rulePack: officialRulePack,
    calculationContext: {
      ...calculationContext,
      annualPremium,
      advisorMonth: advisorMonthResolution.careerMonth,
      paymentFrequency: calculationContext.paymentFrequency || canonicalContext?.policy?.paymentFrequency,
      asOf: calculationContext.asOf || canonicalContext?.payment?.paymentDate
    },
    calculatedAt: clock()
  });
  if (!calculation || calculation.status !== "CALCULATED") {
    const persisted = await persistBlockedIntake({ advisorReference, event: intakeEvent, claimIntake, diagnostics });
    diagnostics.STAGE_040_STATE = "BLOCKED";
    diagnostics.INCOME_READ_STATE = await safeIncomeState(readIncome);
    return result(persisted.ok ? "BLOCKED" : "FAILED", diagnostics, {
      reason: persisted.ok ? calculation?.reason || "STAGE_040_BLOCKED" : persisted.reason,
      amount: null
    });
  }
  diagnostics.STAGE_040_STATE = "PASS";

  let compensationEvent;
  try {
    const periodKey = String(canonicalContext?.payment?.paymentDate || "").slice(0, 7);
    const authority = createAdvisorCompensationEventAuthority();
    compensationEvent = authority.recordEstimated({
      calculation,
      advisorReference,
      periodKey,
      idempotencyKey: `011D:${canonicalContext.paymentEventReference}:${calculation.calculationDigest}`,
      correlationId: canonicalContext.paymentEventReference,
      createdAt: clock(),
      evidenceReferences: intakeEvent.evidence?.evidenceReferences || [],
      metadata: { productiveHandoff: "011D", sourcePaymentEventReference: canonicalContext.paymentEventReference }
    }).event;
    diagnostics.STAGE_050_STATE = "PASS";
  } catch (error) {
    diagnostics.STAGE_050_STATE = "FAIL";
    return result("FAILED", diagnostics, { reason: error?.code || "STAGE_050_FAILED", amount: null });
  }

  if (typeof commitEconomicEvent !== "function") {
    diagnostics.LEDGER_STATE = "FAIL";
    return result("FAILED", diagnostics, { reason: "PRODUCTIVE_EVENT_COMMIT_REQUIRED", amount: null });
  }

  let commit;
  try {
    commit = await commitEconomicEvent(advisorReference, intakeEvent, compensationEvent);
  } catch {
    diagnostics.LEDGER_STATE = "FAIL";
    diagnostics.IDEMPOTENCY_STATE = "FAIL";
    return result("FAILED", diagnostics, { reason: "PRODUCTIVE_EVENT_COMMIT_FAILED", amount: null });
  }
  diagnostics.LEDGER_STATE = commit?.state || "FAIL";
  diagnostics.IDEMPOTENCY_STATE = commit?.state || "FAIL";
  if (commit?.state === "CONFLICT") {
    return result("BLOCKED", diagnostics, { reason: commit.reason || "PRODUCTIVE_EVENT_CONFLICT", amount: null });
  }
  if (!commit || !["CREATED", "REPLAYED"].includes(commit.state)) {
    return result("FAILED", diagnostics, { reason: "PRODUCTIVE_EVENT_COMMIT_FAILED", amount: null });
  }

  const periodKey = compensationEvent.periodKey;
  const periodKeys = [...sixMonthPeriods(periodKey)];
  if (typeof loadMaterializationInputs !== "function" || typeof appendReadModel !== "function") {
    diagnostics.MATERIALIZATION_STATE = "FAIL";
    diagnostics.INCOME_READ_STATE = await safeIncomeState(readIncome);
    return result("FAILED", diagnostics, {
      reason: "MATERIALIZATION_AUTHORITY_REQUIRED",
      amount: null,
      eventCommitted: true,
      compensationEventId: compensationEvent.eventId,
      periodKey,
      periodKeys
    });
  }

  let materialization;
  try {
    const inputs = await loadMaterializationInputs(advisorReference, periodKeys);
    materialization = materializeAdvisorCompensationProductReadModel({
      advisorReference,
      periodKey,
      periodKeys,
      eventRows: inputs?.eventRows || [],
      payoutRows: inputs?.payoutRows || [],
      payoutSourceState: inputs?.payoutSourceState || "DISCONNECTED",
      forwardSignals: inputs?.forwardSignals || [],
      forwardSignalSourceState: inputs?.forwardSignalSourceState || "DISCONNECTED",
      currency: compensationEvent.amount.currency,
      capturedAt: clock(),
      metadata: { productiveHandoff: "011D" }
    });
    const written = await appendReadModel(advisorReference, materialization);
    diagnostics.MATERIALIZATION_STATE = written?.state || "FAIL";
    if (!written || !["CREATED", "ALREADY_MATERIALIZED"].includes(written.state)) {
      diagnostics.INCOME_READ_STATE = await safeIncomeState(readIncome);
      return result("FAILED", diagnostics, {
        reason: "MATERIALIZATION_WRITE_FAILED",
        amount: null,
        eventCommitted: true,
        compensationEventId: compensationEvent.eventId,
        periodKey,
        periodKeys
      });
    }
  } catch {
    diagnostics.MATERIALIZATION_STATE = "FAIL";
    diagnostics.INCOME_READ_STATE = await safeIncomeState(readIncome);
    return result("FAILED", diagnostics, {
      reason: "MATERIALIZATION_FAILED",
      amount: null,
      eventCommitted: true,
      compensationEventId: compensationEvent.eventId,
      periodKey,
      periodKeys
    });
  }

  diagnostics.INCOME_READ_STATE = await safeIncomeState(readIncome);
  const replayed = commit.state === "REPLAYED" || diagnostics.MATERIALIZATION_STATE === "ALREADY_MATERIALIZED";
  return result(replayed ? "REPLAYED" : "COMPLETED", diagnostics, {
    amount: null,
    compensationEventId: compensationEvent.eventId,
    periodKey,
    periodKeys,
    snapshotDigest: materialization.snapshotDigest,
    historyDigest: materialization.historyDigest
  });
}

module.exports = {
  PRODUCTIVE_GATE,
  canonicalPayload,
  baseDiagnostics,
  orchestrateAdvisorCompensationHandoff
};