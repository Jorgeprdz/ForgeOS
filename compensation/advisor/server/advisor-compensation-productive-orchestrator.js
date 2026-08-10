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
  return {
    canonicalPaymentEvent: {
      advisorId: required(context?.advisorId, "ADVISOR_COMPENSATION_011D_ADVISOR_REQUIRED"),
      paymentEventReference: required(context?.paymentEventReference, "ADVISOR_COMPENSATION_011D_PAYMENT_REFERENCE_REQUIRED"),
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
      policyReference: context?.policy?.policyReference,
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
      return { ok: false, reason: "STAGE_030_PERSISTENCE_FAILED" };
    }
    return { ok: true, claim };
  } catch (error) {
    diagnostics.IDEMPOTENCY_STATE = "FAIL";
    diagnostics.LEDGER_STATE = "FAIL";
    return { ok: false, reason: error?.code || "STAGE_030_PERSISTENCE_FAILED" };
  }
}

async function blockAfterIntake({
  reason,
  diagnostics,
  advisorReference,
  event,
  claimIntake,
  readIncome,
  extra = {}
}) {
  const persisted = await persistBlockedIntake({ advisorReference, event, claimIntake, diagnostics });
  diagnostics.INCOME_READ_STATE = await safeIncomeState(readIncome);
  if (!persisted.ok) {
    return result(persisted.conflict ? "BLOCKED" : "FAILED", diagnostics, {
      reason: persisted.reason,
      amount: null,
      ...extra
    });
  }
  return result("BLOCKED", diagnostics, { reason, amount: null, ...extra });
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
  if (!canonicalContext || canonicalContext.state !== "ACCEPTED") {
    diagnostics.PAYMENT_AUTHORITY_STATE = canonicalContext?.state || "INVALID";
    return result("FAILED", diagnostics, { reason: canonicalContext?.state || "PAYMENT_NOT_FOUND" });
  }

  const advisorReference = required(canonicalContext.advisorId, "ADVISOR_COMPENSATION_011D_ADVISOR_REQUIRED");
  let intake;
  try {
    const stage030 = createAdvisorCompensationPaymentIntakeService({ productIdentities });
    intake = stage030.intakeConfirmedPayment(canonicalPayload(canonicalContext));
    diagnostics.STAGE_080_STATE = "PASS";
    diagnostics.STAGE_030_STATE = intake.intakeStatus === "ACCEPTED" ? "PASS" : "BLOCKED";
  } catch (error) {
    diagnostics.STAGE_080_STATE = String(error?.code || "").includes("CARTERA") ? "FAIL" : diagnostics.STAGE_080_STATE;
    diagnostics.STAGE_030_STATE = "FAIL";
    return result("FAILED", diagnostics, { reason: error?.code || "STAGE_030_FAILED" });
  }

  if (!intake?.event) {
    return result("BLOCKED", diagnostics, { reason: intake?.reason || "STAGE_030_BLOCKED" });
  }
  const paymentEvent = intake.event;

  if (paymentEvent.interpretation?.readyForCalculation !== true) {
    diagnostics.STAGE_040_STATE = "BLOCKED";
    return blockAfterIntake({
      reason: "PAYMENT_CONTEXT_INCOMPLETE",
      diagnostics,
      advisorReference,
      event: paymentEvent,
      claimIntake,
      readIncome,
      extra: { missingContext: paymentEvent.interpretation?.missingContext || [] }
    });
  }

  if (!advisorMonthResolution || advisorMonthResolution.state !== "resolved" ||
      !Number.isInteger(advisorMonthResolution.careerMonth)) {
    diagnostics.STAGE_040_STATE = "BLOCKED";
    return blockAfterIntake({
      reason: "ADVISOR_MONTH_AUTHORITY_UNAVAILABLE",
      diagnostics,
      advisorReference,
      event: paymentEvent,
      claimIntake,
      readIncome,
      extra: { advisorMonthResolution: advisorMonthResolution || null }
    });
  }

  const governanceStatus = officialRulePack?.metadata?.governanceStatus || officialRulePack?.governanceStatus;
  if (!officialRulePack || governanceStatus !== "official") {
    diagnostics.STAGE_040_STATE = "BLOCKED";
    return blockAfterIntake({
      reason: "OFFICIAL_RULE_SNAPSHOT_UNAVAILABLE",
      diagnostics,
      advisorReference,
      event: paymentEvent,
      claimIntake,
      readIncome,
      extra: { ruleGovernanceStatus: governanceStatus || "unknown" }
    });
  }

  const calculation = calculateAdvisorCommission({
    paymentEvent,
    rulePack: officialRulePack,
    calculationContext: {
      ...calculationContext,
      advisorMonth: advisorMonthResolution.careerMonth,
      paymentFrequency: calculationContext.paymentFrequency || canonicalContext?.policy?.paymentFrequency || null
    },
    calculatedAt: clock()
  });
  if (calculation?.status !== "CALCULATED") {
    diagnostics.STAGE_040_STATE = "BLOCKED";
    return blockAfterIntake({
      reason: calculation?.reason || "STAGE_040_BLOCKED",
      diagnostics,
      advisorReference,
      event: paymentEvent,
      claimIntake,
      readIncome,
      extra: { calculation }
    });
  }
  diagnostics.STAGE_040_STATE = "PASS";

  const calculatedAt = calculation.calculatedAt || clock();
  let compensationEvent;
  try {
    const stage050 = createAdvisorCompensationEventAuthority();
    const recorded = stage050.recordEstimated({
      calculation,
      advisorReference,
      periodKey: paymentEvent.payment.paymentDate.slice(0, 7),
      idempotencyKey: `compensation:${paymentEvent.source.idempotencyKey}`,
      correlationId: paymentEvent.source.correlationId,
      createdAt: calculatedAt,
      evidenceReferences: paymentEvent.evidence.evidenceReferences,
      metadata: {
        phase: "FORGE_ADVISOR_COMPENSATION_PRODUCTIVE_HANDOFF_AND_MATERIALIZATION_011D",
        canonicalPaymentEventReference: canonicalContext.paymentEventReference,
        payoutTruth: false
      }
    });
    compensationEvent = recorded?.event;
  } catch (error) {
    diagnostics.STAGE_050_STATE = "FAIL";
    return result("FAILED", diagnostics, { reason: error?.code || "STAGE_050_FAILED" });
  }
  diagnostics.STAGE_050_STATE = "PASS";

  if (typeof commitEconomicEvent !== "function") {
    diagnostics.LEDGER_STATE = "FAIL";
    return result("FAILED", diagnostics, { reason: "ATOMIC_PRODUCTIVE_COMMIT_REQUIRED" });
  }

  let commit;
  try {
    commit = await commitEconomicEvent(advisorReference, paymentEvent, compensationEvent);
  } catch (error) {
    diagnostics.LEDGER_STATE = "FAIL";
    diagnostics.IDEMPOTENCY_STATE = "FAIL";
    return result("FAILED", diagnostics, { reason: error?.code || "ATOMIC_PRODUCTIVE_COMMIT_FAILED" });
  }
  diagnostics.LEDGER_STATE = commit?.state || "FAIL";
  diagnostics.IDEMPOTENCY_STATE = commit?.state || "FAIL";
  if (!commit || !["CREATED", "REPLAYED"].includes(commit.state)) {
    return result(commit?.state === "CONFLICT" ? "BLOCKED" : "FAILED", diagnostics, {
      reason: commit?.state === "CONFLICT" ? "COMPENSATION_EVENT_CONFLICT" : "ATOMIC_PRODUCTIVE_COMMIT_FAILED"
    });
  }

  const periodKey = compensationEvent.periodKey;
  const periodKeys = sixMonthPeriods(periodKey);
  if (typeof loadMaterializationInputs !== "function" || typeof appendReadModel !== "function") {
    diagnostics.MATERIALIZATION_STATE = "FAIL";
    return result("FAILED", diagnostics, {
      reason: "MATERIALIZATION_PERSISTENCE_REQUIRED",
      compensationEventState: commit.state
    });
  }

  try {
    const inputs = await loadMaterializationInputs(advisorReference, periodKeys);
    const materialization = materializeAdvisorCompensationProductReadModel({
      advisorReference,
      periodKey,
      periodKeys,
      eventRows: inputs?.eventRows || [],
      payoutRows: inputs?.payoutRows || [],
      payoutSourceState: inputs?.payoutSourceState || "DISCONNECTED",
      forwardSignals: inputs?.forwardSignals || [],
      forwardSignalSourceState: inputs?.forwardSignalSourceState || "DISCONNECTED",
      currency: paymentEvent.payment.currency,
      capturedAt: clock(),
      metadata: {
        phase: "FORGE_ADVISOR_COMPENSATION_PRODUCTIVE_HANDOFF_AND_MATERIALIZATION_011D",
        canonicalPaymentEventReference: canonicalContext.paymentEventReference
      }
    });
    const materialized = await appendReadModel(advisorReference, materialization);
    diagnostics.MATERIALIZATION_STATE = materialized?.state || "FAIL";
    if (!materialized || !["CREATED", "ALREADY_MATERIALIZED"].includes(materialized.state)) {
      diagnostics.INCOME_READ_STATE = await safeIncomeState(readIncome);
      return result("FAILED", diagnostics, {
        reason: "READ_MODEL_MATERIALIZATION_FAILED",
        compensationEventState: commit.state
      });
    }
  } catch (error) {
    diagnostics.MATERIALIZATION_STATE = "FAIL";
    diagnostics.INCOME_READ_STATE = await safeIncomeState(readIncome);
    return result("FAILED", diagnostics, {
      reason: error?.code || "READ_MODEL_MATERIALIZATION_FAILED",
      compensationEventState: commit.state
    });
  }

  diagnostics.INCOME_READ_STATE = await safeIncomeState(readIncome);
  return result(commit.state === "REPLAYED" ? "REPLAYED" : "COMPLETED", diagnostics, {
    paymentEventReference: canonicalContext.paymentEventReference,
    compensationEventId: compensationEvent.eventId,
    periodKey,
    periodKeys: [...periodKeys],
    amount: null,
    payoutTruth: false
  });
}

module.exports = {
  PRODUCTIVE_GATE,
  baseDiagnostics,
  canonicalPayload,
  persistBlockedIntake,
  orchestrateAdvisorCompensationHandoff
};
