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
  const reconciliation = context?.reconciliation || {};
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
    canonicalReconciliation: reconciliation,
    canonicalPersonReference: context?.personReference,
    policyContext: {
      policyReference: context?.policy?.policyReference,
      advisorReference: context?.advisorId,
      productId: context?.policy?.productReference,
      variant: context?.policy?.variant || null,
      policyYear: Number.isInteger(context?.obligation?.policyYear)
        ? context.obligation.policyYear
        : null,
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

async function orchestrateAdvisorCompensationHandoff({
  canonicalContext,
  productIdentities = [],
  officialRulePack = null,
  advisorMonthResolution = null,
  calculationContext = {},
  claimIntake,
  appendCompensationEvent,
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
  const payload = canonicalPayload(canonicalContext);

  let intake;
  try {
    const stage030 = createAdvisorCompensationPaymentIntakeService({ productIdentities });
    intake = stage030.intakeConfirmedPayment(payload);
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

  if (typeof claimIntake !== "function") {
    diagnostics.STAGE_030_STATE = "FAIL";
    return result("FAILED", diagnostics, { reason: "PRODUCTIVE_INTAKE_PERSISTENCE_REQUIRED" });
  }
  const claim = await claimIntake(advisorReference, intake.event);
  diagnostics.IDEMPOTENCY_STATE = claim?.state || "FAIL";
  if (claim?.state === "CONFLICT") {
    diagnostics.STAGE_030_STATE = "BLOCKED";
    return result("BLOCKED", diagnostics, { reason: "STAGE_030_IDEMPOTENCY_CONFLICT" });
  }
  if (!claim || !["CREATED", "REPLAYED"].includes(claim.state)) {
    diagnostics.STAGE_030_STATE = "FAIL";
    return result("FAILED", diagnostics, { reason: "STAGE_030_PERSISTENCE_FAILED" });
  }

  if (intake.event.interpretation?.readyForCalculation !== true) {
    diagnostics.STAGE_040_STATE = "BLOCKED";
    diagnostics.INCOME_READ_STATE = await safeIncomeState(readIncome);
    return result("BLOCKED", diagnostics, {
      reason: "PAYMENT_CONTEXT_INCOMPLETE",
      missingContext: intake.event.interpretation?.missingContext || [],
      amount: null
    });
  }

  if (!advisorMonthResolution || advisorMonthResolution.state !== "resolved" ||
      !Number.isInteger(advisorMonthResolution.careerMonth)) {
    diagnostics.STAGE_040_STATE = "BLOCKED";
    diagnostics.INCOME_READ_STATE = await safeIncomeState(readIncome);
    return result("BLOCKED", diagnostics, {
      reason: "ADVISOR_MONTH_AUTHORITY_UNAVAILABLE",
      advisorMonthResolution: advisorMonthResolution || null,
      amount: null
    });
  }

  if (!officialRulePack || officialRulePack.governanceStatus !== "official") {
    diagnostics.STAGE_040_STATE = "BLOCKED";
    diagnostics.INCOME_READ_STATE = await safeIncomeState(readIncome);
    return result("BLOCKED", diagnostics, {
      reason: "OFFICIAL_RULE_SNAPSHOT_UNAVAILABLE",
      amount: null
    });
  }

  const calculatedAt = clock();
  const calculation = calculateAdvisorCommission({
    paymentEvent: intake.event,
    rulePack: officialRulePack,
    calculationContext: {
      ...calculationContext,
      advisorMonth: advisorMonthResolution.careerMonth,
      paymentFrequency: calculationContext.paymentFrequency || canonicalContext?.policy?.paymentFrequency || null
    },
    calculatedAt
  });
  if (calculation?.status !== "CALCULATED") {
    diagnostics.STAGE_040_STATE = "BLOCKED";
    diagnostics.INCOME_READ_STATE = await safeIncomeState(readIncome);
    return result("BLOCKED", diagnostics, {
      reason: calculation?.reason || "STAGE_040_BLOCKED",
      calculation,
      amount: null
    });
  }
  diagnostics.STAGE_040_STATE = "PASS";

  const stage050 = createAdvisorCompensationEventAuthority();
  let recorded;
  try {
    recorded = stage050.recordEstimated({
      calculation,
      advisorReference,
      periodKey: intake.event.payment.paymentDate.slice(0, 7),
      idempotencyKey: `compensation:${intake.event.source.idempotencyKey}`,
      correlationId: intake.event.source.correlationId,
      createdAt: calculatedAt,
      evidenceReferences: intake.event.evidence.evidenceReferences,
      metadata: {
        phase: "FORGE_ADVISOR_COMPENSATION_PRODUCTIVE_HANDOFF_AND_MATERIALIZATION_011D",
        canonicalPaymentEventReference: canonicalContext.paymentEventReference,
        payoutTruth: false
      }
    });
  } catch (error) {
    diagnostics.STAGE_050_STATE = "FAIL";
    return result("FAILED", diagnostics, { reason: error?.code || "STAGE_050_FAILED" });
  }
  diagnostics.STAGE_050_STATE = "PASS";
  const compensationEvent = recorded?.event;

  if (typeof appendCompensationEvent !== "function") {
    diagnostics.LEDGER_STATE = "FAIL";
    return result("FAILED", diagnostics, { reason: "PRODUCTIVE_EVENT_PERSISTENCE_REQUIRED" });
  }
  const ledgerWrite = await appendCompensationEvent(advisorReference, compensationEvent);
  diagnostics.LEDGER_STATE = ledgerWrite?.state || "FAIL";
  if (!ledgerWrite || !["CREATED", "REPLAYED"].includes(ledgerWrite.state)) {
    return result(ledgerWrite?.state === "CONFLICT" ? "BLOCKED" : "FAILED", diagnostics, {
      reason: ledgerWrite?.state === "CONFLICT" ? "COMPENSATION_EVENT_CONFLICT" : "COMPENSATION_EVENT_WRITE_FAILED"
    });
  }

  const periodKey = compensationEvent.periodKey;
  const periodKeys = sixMonthPeriods(periodKey);
  if (typeof loadMaterializationInputs !== "function" || typeof appendReadModel !== "function") {
    diagnostics.MATERIALIZATION_STATE = "FAIL";
    return result("FAILED", diagnostics, {
      reason: "MATERIALIZATION_PERSISTENCE_REQUIRED",
      compensationEventState: ledgerWrite.state
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
      currency: intake.event.payment.currency,
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
        compensationEventState: ledgerWrite.state
      });
    }
  } catch (error) {
    diagnostics.MATERIALIZATION_STATE = "FAIL";
    diagnostics.INCOME_READ_STATE = await safeIncomeState(readIncome);
    return result("FAILED", diagnostics, {
      reason: error?.code || "READ_MODEL_MATERIALIZATION_FAILED",
      compensationEventState: ledgerWrite.state
    });
  }

  diagnostics.INCOME_READ_STATE = await safeIncomeState(readIncome);
  return result(ledgerWrite.state === "REPLAYED" ? "REPLAYED" : "COMPLETED", diagnostics, {
    paymentEventReference: canonicalContext.paymentEventReference,
    compensationEventId: compensationEvent.eventId,
    periodKey,
    amount: null,
    payoutTruth: false
  });
}

module.exports = {
  PRODUCTIVE_GATE,
  baseDiagnostics,
  canonicalPayload,
  orchestrateAdvisorCompensationHandoff
};
