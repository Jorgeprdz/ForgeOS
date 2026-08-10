"use strict";

const { sha256: stage080Sha256 } = require("../payment/cartera-080-confirmed-payment-consumer.js");
const { createAdvisorCompensationPaymentIntakeService } = require("../payment/advisor-compensation-payment-intake-service.js");
const { calculateAdvisorCommission } = require("../engine/advisor-commission-engine.js");
const { createAdvisorCompensationEventAuthority } = require("../events/advisor-compensation-event-authority.js");
const {
  materializeAdvisorCompensationProductReadModel,
  sixMonthPeriods
} = require("../materialization/advisor-compensation-product-read-model-materializer.js");
const { buildAdvisorCompensationCandidateRulePack } = require("../rules/advisor-compensation-candidate-rule-pack-builder.js");
const candidateSeed = require("../rules/rule-data/smnyl-advisor-compensation-2026.candidate.rule-pack.json");

const DEFAULT_RULE_PACK = Object.freeze(buildAdvisorCompensationCandidateRulePack(candidateSeed));

function present(value) {
  return value !== undefined && value !== null && String(value).trim() !== "";
}

function periodFromDate(value) {
  return typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value) ? value.slice(0, 7) : null;
}

function diagnostics(overrides = {}) {
  return Object.freeze({
    contract: "FORGE_ADVISOR_COMPENSATION_PRODUCTIVE_GATE",
    AUTH_STATE: "OK",
    PAYMENT_AUTHORITY_STATE: "CONFIRMED",
    HANDOFF_STATE: "RUNNING",
    STAGE_080_STATE: "NOT_RUN",
    STAGE_030_STATE: "NOT_RUN",
    STAGE_040_STATE: "NOT_RUN",
    STAGE_050_STATE: "NOT_RUN",
    LEDGER_STATE: "NOT_RUN",
    MATERIALIZATION_STATE: "NOT_RUN",
    INCOME_READ_STATE: "NOT_RUN",
    IDEMPOTENCY_STATE: "NOT_RUN",
    DEMO_FALLBACK_USED: false,
    SYNTHETIC_WRITER_USED: false,
    UNKNOWN_COERCION_USED: false,
    ...overrides
  });
}

function result(state, reason, gate, extra = {}) {
  return Object.freeze({
    contractVersion: "FORGE_ADVISOR_COMPENSATION_PRODUCTIVE_HANDOFF_011D",
    state,
    reason: reason || null,
    amount: null,
    payoutTruth: false,
    paidCommissionInferred: false,
    ...extra,
    gate: diagnostics({ HANDOFF_STATE: state, ...(gate || {}) })
  });
}

function canonicalCommand(context) {
  const payment = context.payment || {};
  const receipt = context.canonicalConfirmationReceipt || {};
  const obligationReference = context.obligation?.obligationReference;
  const personReference = context.personReference;
  if (!present(obligationReference)) throw Object.assign(new Error("ADVISOR_COMPENSATION_011D_OBLIGATION_CONTEXT_UNAVAILABLE"), { code: "ADVISOR_COMPENSATION_011D_OBLIGATION_CONTEXT_UNAVAILABLE" });
  if (!present(personReference)) throw Object.assign(new Error("ADVISOR_COMPENSATION_011D_PERSON_CONTEXT_UNAVAILABLE"), { code: "ADVISOR_COMPENSATION_011D_PERSON_CONTEXT_UNAVAILABLE" });
  if (!present(receipt.decisionId) || !present(receipt.actorId) || !present(receipt.decidedAt)
      || !present(receipt.reason) || !present(receipt.evidenceHash)
      || receipt.authorizationBasis !== "human_decision_receipt") {
    throw Object.assign(new Error("ADVISOR_COMPENSATION_011D_CANONICAL_CONFIRMATION_RECEIPT_INVALID"), { code: "ADVISOR_COMPENSATION_011D_CANONICAL_CONFIRMATION_RECEIPT_INVALID" });
  }
  return Object.freeze({
    paymentEvidenceReference: payment.paymentEvidenceReference,
    policyReference: context.policy?.policyReference,
    obligationReference,
    personReference,
    paymentAmount: payment.paymentAmount,
    currency: payment.currency || context.policy?.currency,
    paymentDate: payment.paymentDate,
    periodCoveredStart: payment.periodCoveredStart || null,
    periodCoveredEnd: payment.periodCoveredEnd || null,
    paymentSource: payment.paymentSource,
    evidenceReferences: Object.freeze(Array.isArray(payment.evidenceReferences) ? [...payment.evidenceReferences] : []),
    confirmationState: "confirmed",
    humanDecisionReceipt: Object.freeze({ ...receipt }),
    idempotencyKey: payment.idempotencyKey,
    correlationId: context.paymentEventReference,
    canonicalAuthority: "policy_payment_reconciliation_030c",
    commissionCalculationRequested: false
  });
}

function handoffReceipt(command) {
  const digest = stage080Sha256(command);
  return Object.freeze({
    status: "confirmed_handoff_recorded",
    compensationState: "not_interpreted",
    commissionCalculationPerformed: false,
    commandDigest: digest,
    paymentEvidenceReference: command.paymentEvidenceReference,
    policyReference: command.policyReference,
    obligationReference: command.obligationReference,
    humanDecisionId: command.humanDecisionReceipt.decisionId,
    idempotencyKey: command.idempotencyKey,
    correlationId: command.correlationId,
    handoffId: `${command.correlationId}:${command.idempotencyKey}`,
    replayed: false,
    downstreamResult: Object.freeze({ source: "CARTERA_030C_CANONICAL_PAYMENT", compensationRequested: true })
  });
}

function policyContext(context) {
  return Object.freeze({
    policyReference: context.policy?.policyReference,
    advisorReference: context.advisorId,
    productId: context.policy?.productReference || null,
    variant: context.policy?.variant || null,
    policyYear: Number.isInteger(context.obligation?.policyYear) ? context.obligation.policyYear : null,
    sourceAuthority: "CARTERA_010B_030B_030C_CANONICAL_CONTEXT",
    sourceSnapshotReference: context.obligation?.policyTermsDigest || context.payment?.eventDigest || null
  });
}

function resolveAdvisorMonth(resolveCareerClock, context) {
  if (typeof resolveCareerClock !== "function") {
    return Object.freeze({ ready: false, reason: "ADVISOR_MONTH_AUTHORITY_UNAVAILABLE", authorityReason: "resolver_not_bound", blockedIsZero: false });
  }
  const lifecycle = context.lifecycle || {};
  const resolved = resolveCareerClock({
    lifecycleStatus: lifecycle.lifecycleStatus,
    connectionDate: lifecycle.connectionDate,
    contestStartDate: lifecycle.contestStartDate,
    connectionEvidence: lifecycle.connectionEvidence,
    contestStartEvidence: lifecycle.contestStartEvidence,
    asOfDate: context.payment?.paymentDate
  });
  if (!resolved || resolved.state !== "resolved" || !Number.isInteger(resolved.careerMonth)) {
    return Object.freeze({
      ready: false,
      reason: "ADVISOR_MONTH_AUTHORITY_UNAVAILABLE",
      authorityReason: resolved?.reason || "career_clock_unresolved",
      blockedIsZero: false
    });
  }
  return Object.freeze({ ready: true, advisorMonth: resolved.careerMonth, authority: resolved });
}

function productiveRulePackReady(rulePack) {
  return rulePack?.metadata?.governanceStatus === "official";
}

function createAdvisorCompensationProductiveHandoff011d({
  persistence,
  resolveCareerClock,
  rulePack = DEFAULT_RULE_PACK,
  now = () => new Date().toISOString()
} = {}) {
  if (!persistence?.commitCompensation || !persistence?.loadMaterializationInputs || !persistence?.appendReadModel) {
    throw Object.assign(new Error("ADVISOR_COMPENSATION_011D_PERSISTENCE_ADAPTER_REQUIRED"), { code: "ADVISOR_COMPENSATION_011D_PERSISTENCE_ADAPTER_REQUIRED" });
  }

  return Object.freeze({
    async execute({ advisorId, context } = {}) {
      if (!present(advisorId)) return result("FAILED", "AUTH_REQUIRED", { AUTH_STATE: "FAIL", PAYMENT_AUTHORITY_STATE: "NOT_RUN" });
      if (!context || context.state !== "ACCEPTED") {
        return result("BLOCKED", context?.state || "PAYMENT_NOT_FOUND", { PAYMENT_AUTHORITY_STATE: context?.state === "PAYMENT_NOT_FOUND" ? "NOT_FOUND" : "INVALID" });
      }
      if (context.advisorId !== advisorId) return result("FAILED", "OWNER_MISMATCH", { PAYMENT_AUTHORITY_STATE: "INVALID" });
      if (context.payment?.confirmationState !== "CONFIRMED") return result("BLOCKED", "PAYMENT_NOT_CONFIRMED", { PAYMENT_AUTHORITY_STATE: "INVALID" });

      let intake;
      try {
        const command = canonicalCommand(context);
        const receipt = handoffReceipt(command);
        intake = createAdvisorCompensationPaymentIntakeService({ productIdentities: rulePack?.productIdentities || [] })
          .intakeConfirmedPayment({ command, handoffReceipt: receipt, policyContext: policyContext(context) });
      } catch (error) {
        return result("BLOCKED", error?.code || error?.message || "STAGE_030_FAILED", { STAGE_080_STATE: "FAIL", STAGE_030_STATE: "FAIL" });
      }

      const paymentEvent = intake.event;
      if (!paymentEvent) return result("BLOCKED", intake.reason || "STAGE_030_BLOCKED", { STAGE_080_STATE: "PASS", STAGE_030_STATE: "BLOCKED" });

      const advisorMonth = resolveAdvisorMonth(resolveCareerClock, context);
      if (!advisorMonth.ready) {
        return result("BLOCKED", "ADVISOR_MONTH_AUTHORITY_UNAVAILABLE", {
          STAGE_080_STATE: "PASS", STAGE_030_STATE: "PASS", STAGE_040_STATE: "BLOCKED", LEDGER_STATE: "NOT_RUN", IDEMPOTENCY_STATE: "RETRY_SAFE"
        }, { blockedBy: advisorMonth.authorityReason, paymentEventId: paymentEvent.eventId });
      }

      if (!productiveRulePackReady(rulePack)) {
        return result("BLOCKED", "OFFICIAL_RULE_PACK_UNAVAILABLE", {
          STAGE_080_STATE: "PASS", STAGE_030_STATE: "PASS", STAGE_040_STATE: "BLOCKED", LEDGER_STATE: "NOT_RUN", IDEMPOTENCY_STATE: "RETRY_SAFE"
        }, { ruleGovernanceStatus: rulePack?.metadata?.governanceStatus || "unknown", paymentEventId: paymentEvent.eventId });
      }

      const annualPremium = Number(context.policy?.annualPremium);
      if (!Number.isFinite(annualPremium) || annualPremium <= 0) {
        return result("BLOCKED", "ANNUAL_PREMIUM_AUTHORITY_UNAVAILABLE", {
          STAGE_080_STATE: "PASS", STAGE_030_STATE: "PASS", STAGE_040_STATE: "BLOCKED", LEDGER_STATE: "NOT_RUN", IDEMPOTENCY_STATE: "RETRY_SAFE"
        });
      }

      const calculation = calculateAdvisorCommission({
        paymentEvent,
        rulePack,
        calculationContext: {
          annualPremium,
          paymentFrequency: context.policy?.paymentFrequency,
          advisorMonth: advisorMonth.advisorMonth,
          contractAge: context.policy?.contractAge ?? null,
          accumulatedConfirmedPaidPremium: context.policy?.accumulatedConfirmedPaidPremium ?? null,
          isPersonal: context.policy?.isPersonal === true,
          asOf: context.payment?.paymentDate
        },
        calculatedAt: now()
      });
      if (!calculation || calculation.status !== "CALCULATED") {
        return result("BLOCKED", calculation?.reason || "STAGE_040_BLOCKED", { STAGE_080_STATE: "PASS", STAGE_030_STATE: "PASS", STAGE_040_STATE: "BLOCKED", LEDGER_STATE: "NOT_RUN" });
      }

      const periodKey = periodFromDate(context.payment?.paymentDate);
      if (!periodKey) return result("BLOCKED", "COMPENSATION_PERIOD_UNAVAILABLE", { STAGE_080_STATE: "PASS", STAGE_030_STATE: "PASS", STAGE_040_STATE: "PASS" });

      let canonicalEvent;
      try {
        canonicalEvent = createAdvisorCompensationEventAuthority().recordEstimated({
          calculation,
          advisorReference: advisorId,
          periodKey,
          idempotencyKey: `011D:${context.paymentEventReference}:${calculation.calculationDigest}`,
          correlationId: context.paymentEventReference,
          createdAt: now(),
          evidenceReferences: paymentEvent.evidence?.evidenceReferences || [],
          metadata: { sourcePaymentEventReference: context.paymentEventReference, productiveHandoff: "011D" }
        }).event;
      } catch (error) {
        return result("FAILED", error?.code || "STAGE_050_FAILED", { STAGE_080_STATE: "PASS", STAGE_030_STATE: "PASS", STAGE_040_STATE: "PASS", STAGE_050_STATE: "FAIL" });
      }

      let commit;
      try {
        commit = await persistence.commitCompensation(advisorId, paymentEvent, canonicalEvent);
      } catch (error) {
        return result("FAILED", error?.code || "COMPENSATION_ATOMIC_COMMIT_FAILED", {
          STAGE_080_STATE: "PASS", STAGE_030_STATE: "PASS", STAGE_040_STATE: "PASS", STAGE_050_STATE: "PASS", LEDGER_STATE: "FAIL", IDEMPOTENCY_STATE: "FAIL"
        });
      }
      if (commit?.state === "CONFLICT") {
        return result("BLOCKED", commit.reason || "IDEMPOTENCY_CONFLICT", {
          STAGE_080_STATE: "PASS", STAGE_030_STATE: "PASS", STAGE_040_STATE: "PASS", STAGE_050_STATE: "PASS", LEDGER_STATE: "CONFLICT", IDEMPOTENCY_STATE: "CONFLICT"
        });
      }

      const periodKeys = [...sixMonthPeriods(periodKey)];
      let materialization;
      let materializationWrite;
      try {
        const inputs = await persistence.loadMaterializationInputs(advisorId, periodKeys);
        materialization = materializeAdvisorCompensationProductReadModel({
          advisorReference: advisorId,
          periodKey,
          periodKeys,
          eventRows: inputs?.eventRows || [],
          payoutRows: inputs?.payoutRows || [],
          payoutSourceState: inputs?.payoutSourceState || "DISCONNECTED",
          forwardSignals: inputs?.forwardSignals || [],
          forwardSignalSourceState: inputs?.forwardSignalSourceState || "DISCONNECTED",
          currency: canonicalEvent.amount.currency,
          capturedAt: now(),
          metadata: { productiveHandoff: "011D" }
        });
        materializationWrite = await persistence.appendReadModel(advisorId, materialization);
      } catch (error) {
        return result("FAILED", error?.code || "MATERIALIZATION_FAILED", {
          STAGE_080_STATE: "PASS", STAGE_030_STATE: "PASS", STAGE_040_STATE: "PASS", STAGE_050_STATE: "PASS",
          LEDGER_STATE: commit?.state || "CREATED", MATERIALIZATION_STATE: "FAIL", IDEMPOTENCY_STATE: commit?.state === "REPLAYED" ? "REPLAYED" : "CLAIMED"
        }, { compensationEventState: commit?.state || "CREATED", materializationState: "FAILED", periodKey, periodKeys });
      }

      const replayed = commit?.state === "REPLAYED" || materializationWrite?.state === "ALREADY_MATERIALIZED";
      return result(replayed ? "REPLAYED" : "COMPLETED", null, {
        STAGE_080_STATE: "PASS", STAGE_030_STATE: "PASS", STAGE_040_STATE: "PASS", STAGE_050_STATE: "PASS",
        LEDGER_STATE: commit?.state || "CREATED", MATERIALIZATION_STATE: materializationWrite?.state || "CREATED", IDEMPOTENCY_STATE: replayed ? "REPLAYED" : "CLAIMED"
      }, {
        periodKey,
        periodKeys,
        compensationEventId: canonicalEvent.eventId,
        snapshotDigest: materialization.snapshotDigest,
        historyDigest: materialization.historyDigest
      });
    }
  });
}

module.exports = {
  DEFAULT_RULE_PACK,
  canonicalCommand,
  handoffReceipt,
  policyContext,
  resolveAdvisorMonth,
  productiveRulePackReady,
  createAdvisorCompensationProductiveHandoff011d
};