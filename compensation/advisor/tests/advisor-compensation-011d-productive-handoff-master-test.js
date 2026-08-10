"use strict";

const assert = require("assert");
const fs = require("fs");
const path = require("path");
const {
  consumeCartera030cCanonicalPayment,
  Cartera080ConfirmedPaymentConsumerError
} = require("../payment/cartera-080-confirmed-payment-consumer");
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
  orchestrateAdvisorCompensationHandoff,
  PRODUCTIVE_GATE
} = require("../server/advisor-compensation-productive-orchestrator");

console.log("\nFORGE ADVISOR COMPENSATION 011D PRODUCTIVE HANDOFF MASTER TEST\n");

const PRODUCTS = Object.freeze([
  Object.freeze({
    productId: "SMNYL_ORVI",
    carrierId: "SMNYL",
    displayName: "Orvi",
    aliases: ["ORVI", "Orvi"],
    lineOfBusiness: "VIDA_INDIVIDUAL"
  })
]);

function canonicalContext(overrides = {}) {
  const payment = {
    confirmationState: "CONFIRMED",
    paymentEvidenceReference: "evidence-011d-1",
    paymentAmount: 10000,
    currency: "MXN",
    paymentDate: "2026-08-01",
    periodCoveredStart: "2026-08-01",
    periodCoveredEnd: "2026-08-31",
    paymentSource: "CARTERA_CONFIRMED_PAYMENT",
    evidenceReferences: ["evidence-011d-1"],
    eventDigest: "a".repeat(64),
    idempotencyKey: "idem-011d-1",
    confirmedBy: "advisor-011d-1",
    confirmedAt: "2026-08-01T12:00:00.000Z",
    ...(overrides.payment || {})
  };
  return {
    state: "ACCEPTED",
    advisorId: "advisor-011d-1",
    paymentEventReference: "payment-011d-1",
    payment,
    policy: {
      policyReference: "policy-011d-1",
      productReference: "SMNYL_ORVI",
      premiumAmount: 120000,
      paymentFrequency: "MENSUAL",
      currency: "MXN",
      issueDate: "2026-01-01",
      effectiveFrom: "2026-01-01",
      statusValue: "ACTIVE",
      completenessState: "COMPLETE",
      ...(overrides.policy || {})
    },
    obligation: {
      obligationReference: "obligation-011d-1",
      policyYear: 1,
      expectedAmount: 10000,
      actualAmount: 10000,
      paymentFrequency: "MENSUAL",
      expectedDate: "2026-08-01",
      actualDate: "2026-08-01",
      status: "PAID_CONFIRMED",
      confirmationState: "CONFIRMED",
      policyTermsDigest: "b".repeat(64),
      ...(overrides.obligation || {})
    },
    personReference: "person-011d-1",
    reconciliation: {
      outcome: "MATCHED",
      obligationReference: "obligation-011d-1",
      reconciliationReference: "reconciliation-011d-1",
      reconciliationDigest: "c".repeat(64),
      recordedAt: "2026-08-01T12:00:01.000Z",
      ...(overrides.reconciliation || {})
    },
    lifecycle: null,
    safeguards: {
      paymentTruthOwner: "CARTERA_CONFIRMED_PAYMENT_AUTHORITY",
      commissionTruthOwner: "ADVISOR_COMPENSATION",
      payoutTruthEstablished: false,
      syntheticWriterUsed: false,
      unknownCoercedToZero: false
    },
    ...Object.fromEntries(Object.entries(overrides).filter(([key]) => !["payment","policy","obligation","reconciliation"].includes(key)))
  };
}

function canonicalConsumerInput(context = canonicalContext()) {
  return {
    paymentEvent: {
      advisorId: context.advisorId,
      paymentEventReference: context.paymentEventReference,
      confirmationState: context.payment.confirmationState,
      paymentEvidenceReference: context.payment.paymentEvidenceReference,
      paymentAmount: context.payment.paymentAmount,
      currency: context.payment.currency,
      paymentDate: context.payment.paymentDate,
      periodCoveredStart: context.payment.periodCoveredStart,
      periodCoveredEnd: context.payment.periodCoveredEnd,
      paymentSource: context.payment.paymentSource,
      evidenceReferences: context.payment.evidenceReferences,
      eventDigest: context.payment.eventDigest,
      idempotencyKey: context.payment.idempotencyKey,
      confirmedBy: context.payment.confirmedBy,
      confirmedAt: context.payment.confirmedAt
    },
    reconciliation: context.reconciliation,
    personReference: context.personReference
  };
}

function officialEngineEvent() {
  return {
    contractVersion: "ADVISOR_COMPENSATION_CONFIRMED_PAYMENT_EVENT_001",
    eventType: "CONFIRMED_PREMIUM_PAYMENT",
    truthClass: "CONFIRMED_PAYMENT",
    eventId: "payment-engine-011d",
    source: { commandDigest: "command-engine-011d" },
    references: {
      paymentEvidenceReference: "evidence-engine-011d",
      policyReference: "policy-engine-011d",
      obligationReference: "obligation-engine-011d",
      personReference: "person-engine-011d",
      advisorReference: "advisor-engine-011d"
    },
    productContext: { productId: "SMNYL_ORVI", lineOfBusiness: "VIDA_INDIVIDUAL", variant: "DEFAULT", policyYear: 1 },
    payment: { amount: 10000, currency: "MXN", paymentDate: "2026-08-01", periodCoveredStart: "2026-08-01", periodCoveredEnd: "2026-08-31" },
    evidence: { evidenceHash: "engine-evidence" },
    humanConfirmation: { decisionId: "engine-decision" },
    interpretation: { readyForCalculation: true, missingContext: [] },
    metadata: { policyContextSnapshotReference: "engine-policy-snapshot" },
    safeguards: { commissionCalculationRequested: false, commissionCalculationPerformed: false, compensationEventWritten: false, payoutTruth: false }
  };
}

function officialPack() {
  return {
    metadata: { governanceStatus: "official" },
    auxiliaryRules: {
      paymentFrequencyFactors: { MENSUAL: 1 / 12, TRIMESTRAL: 1 / 4, SEMESTRAL: 1 / 2, ANUAL: 1 },
      developmentFactor: { advisorMonthFrom: 1, advisorMonthTo: 12, factor: 0.9, sourceState: "OFFICIAL" },
      policyPoints: {
        excludedLegacyNames: [],
        gmmMinimumAnnualPremium: 10000,
        gmmPoints: 0.5,
        lifeThresholds: [
          { minimum: 0, maximumExclusive: 17000, points: 0 },
          { minimum: 17000, maximumExclusive: 65000, points: 1 },
          { minimum: 65000, maximumExclusive: 190000, points: 2 },
          { minimum: 190000, maximumExclusive: null, points: 3 }
        ]
      },
      premiumWeights: [{ productId: "SMNYL_ORVI", factor: 1 }]
    }
  };
}

function officialResolver() {
  return () => ({
    status: "READY_OFFICIAL",
    reason: null,
    productId: "SMNYL_ORVI",
    displayName: "Orvi",
    lineOfBusiness: "VIDA_INDIVIDUAL",
    ruleId: "OFFICIAL_TEST_ONLY_RULE",
    variantId: "DEFAULT",
    bandKey: "YEAR_1",
    rate: 0.44,
    commissionBasis: "ANNUAL_PREMIUM_WITH_PAYMENT_FREQUENCY_FACTOR",
    governanceStatus: "official",
    sourceState: "OFFICIAL_TEST_FIXTURE",
    rulePackId: "OFFICIAL_TEST_ONLY",
    rulePackVersion: "1",
    rulePackDigest: "d".repeat(64)
  });
}

const tests = [];
const add = (name, fn) => tests.push([name, fn]);

add("Stage 080 consumes persisted canonical 030C truth", () => {
  const value = consumeCartera030cCanonicalPayment(canonicalConsumerInput());
  assert.equal(value.sourceSystem, "CARTERA_030C");
  assert.equal(value.sourceAuthority, "policy_payment_reconciliation_030c");
  assert.equal(value.humanDecision.authorizationBasis, "cartera_030c_confirmed_payment_event");
  assert.equal(value.payoutTruth, false);
});

add("Stage 080 rejects unconfirmed canonical payment", () => {
  const input = canonicalConsumerInput(canonicalContext({ payment: { confirmationState: "PENDING" } }));
  assert.throws(
    () => consumeCartera030cCanonicalPayment(input),
    error => error instanceof Cartera080ConfirmedPaymentConsumerError &&
      error.code === "ADVISOR_COMPENSATION_CARTERA080_PAYMENT_NOT_CONFIRMED"
  );
});

add("Stage 080 rejects confirmed owner mismatch", () => {
  const input = canonicalConsumerInput(canonicalContext({ payment: { confirmedBy: "other-advisor" } }));
  assert.throws(
    () => consumeCartera030cCanonicalPayment(input),
    error => error instanceof Cartera080ConfirmedPaymentConsumerError &&
      error.code === "ADVISOR_COMPENSATION_CARTERA030C_CONFIRMED_OWNER_MISMATCH"
  );
});

add("Stage 030 accepts canonical 030C event through existing intake", () => {
  const context = canonicalContext();
  const service = createAdvisorCompensationPaymentIntakeService({ productIdentities: PRODUCTS });
  const result = service.intakeConfirmedPayment({
    canonicalPaymentEvent: canonicalConsumerInput(context).paymentEvent,
    canonicalReconciliation: context.reconciliation,
    canonicalPersonReference: context.personReference,
    policyContext: {
      policyReference: context.policy.policyReference,
      advisorReference: context.advisorId,
      productId: context.policy.productReference,
      variant: "DEFAULT",
      policyYear: context.obligation.policyYear,
      sourceAuthority: "CARTERA_CANONICAL_POLICY_010B_030B",
      sourceSnapshotReference: context.obligation.policyTermsDigest
    }
  });
  assert.equal(result.intakeStatus, "ACCEPTED");
  assert.equal(result.event.references.advisorReference, context.advisorId);
  assert.equal(result.event.safeguards.payoutTruth, false);
});

add("productive orchestrator blocks when advisorMonth evidence is unavailable", async () => {
  const result = await orchestrateAdvisorCompensationHandoff({
    canonicalContext: canonicalContext(),
    productIdentities: PRODUCTS,
    advisorMonthResolution: null,
    officialRulePack: { metadata: { governanceStatus: "official" } },
    claimIntake: async () => ({ state: "CREATED" }),
    readIncome: async () => ({ state: "NOT_MATERIALIZED" })
  });
  assert.equal(result.state, "BLOCKED");
  assert.equal(result.reason, "ADVISOR_MONTH_AUTHORITY_UNAVAILABLE");
  assert.equal(result.amount, null);
  assert.equal(result.diagnostics.STAGE_040_STATE, "BLOCKED");
  assert.equal(result.diagnostics.UNKNOWN_ZERO, false);
});

add("productive orchestrator blocks candidate/unproven Rule Pack", async () => {
  const result = await orchestrateAdvisorCompensationHandoff({
    canonicalContext: canonicalContext(),
    productIdentities: PRODUCTS,
    advisorMonthResolution: { state: "resolved", careerMonth: 13 },
    officialRulePack: { metadata: { governanceStatus: "candidate" } },
    claimIntake: async () => ({ state: "CREATED" }),
    readIncome: async () => ({ state: "NOT_MATERIALIZED" })
  });
  assert.equal(result.state, "BLOCKED");
  assert.equal(result.reason, "OFFICIAL_RULE_SNAPSHOT_UNAVAILABLE");
  assert.equal(result.amount, null);
  assert.equal(result.diagnostics.STAGE_050_STATE, "NOT_RUN");
});

add("existing Stage 040 executes with explicit official test evidence", () => {
  const calculation = calculateAdvisorCommission({
    paymentEvent: officialEngineEvent(),
    rulePack: officialPack(),
    calculationContext: { annualPremium: 120000, paymentFrequency: "Mensual", advisorMonth: 13, contractAge: null },
    ruleResolver: officialResolver(),
    calculatedAt: "2026-08-01T12:00:00.000Z"
  });
  assert.equal(calculation.status, "CALCULATED");
  assert.equal(calculation.eligibleForEarnedPromotion, true);
  assert.equal(calculation.safeguards.payoutTruth, false);
});

add("candidate Stage 040 result never becomes eligible for earned promotion", () => {
  const calculation = calculateAdvisorCommission({
    paymentEvent: officialEngineEvent(),
    rulePack: { ...officialPack(), metadata: { governanceStatus: "candidate" } },
    calculationContext: { annualPremium: 120000, paymentFrequency: "Mensual", advisorMonth: 13, contractAge: null },
    ruleResolver: () => ({ ...officialResolver()(), status: "READY_CANDIDATE", governanceStatus: "candidate", sourceState: "CANDIDATE" }),
    calculatedAt: "2026-08-01T12:00:00.000Z"
  });
  assert.equal(calculation.status, "CALCULATED");
  assert.equal(calculation.eligibleForEarnedPromotion, false);
});

add("existing Stage 050 records ESTIMATED without inferring PAID", () => {
  const calculation = calculateAdvisorCommission({
    paymentEvent: officialEngineEvent(),
    rulePack: officialPack(),
    calculationContext: { annualPremium: 120000, paymentFrequency: "Mensual", advisorMonth: 13, contractAge: null },
    ruleResolver: officialResolver(),
    calculatedAt: "2026-08-01T12:00:00.000Z"
  });
  const authority = createAdvisorCompensationEventAuthority();
  const recorded = authority.recordEstimated({
    calculation,
    advisorReference: "advisor-engine-011d",
    periodKey: "2026-08",
    idempotencyKey: "stage050-011d-1",
    correlationId: "correlation-011d-1",
    createdAt: "2026-08-01T12:00:00.000Z",
    evidenceReferences: ["evidence-engine-011d"]
  });
  assert.equal(recorded.event.state, "ESTIMATED");
  assert.equal(recorded.event.safeguards.payoutTruth, false);
});

add("Watch Tower contract is explicit and fail-closed", async () => {
  const result = await orchestrateAdvisorCompensationHandoff({
    canonicalContext: canonicalContext(),
    productIdentities: PRODUCTS,
    advisorMonthResolution: null,
    officialRulePack: null,
    claimIntake: async () => ({ state: "REPLAYED" }),
    readIncome: async () => ({ state: "BLOCKED" })
  });
  assert.equal(result.diagnostics.contract, PRODUCTIVE_GATE);
  assert.equal(result.diagnostics.DEMO_FALLBACK_USED, false);
  assert.equal(result.diagnostics.SYNTHETIC_WRITER_USED, false);
  assert.equal(result.diagnostics.UNKNOWN_COERCION_USED, false);
  assert.equal(result.diagnostics.UNKNOWN_ZERO, false);
});

add("011D migration keeps browser away from canonical writes", () => {
  const migration = fs.readFileSync(path.resolve(__dirname, "../../../supabase/migrations/20260810000110_advisor_compensation_productive_handoff_011d.sql"), "utf8");
  assert.match(migration, /revoke all on table public\.advisor_compensation_payment_intake_ledger\s+from public, anon, authenticated/i);
  assert.match(migration, /grant execute on function public\.forge_advisor_compensation_claim_intake_011d\(uuid,jsonb\)\s+to service_role/i);
  assert.match(migration, /grant execute on function public\.forge_advisor_compensation_append_event_011d\(uuid,jsonb\)\s+to service_role/i);
  assert.doesNotMatch(migration, /grant execute[\s\S]{0,180}forge_advisor_compensation_(claim_intake|append_event)_011d[\s\S]{0,180}authenticated/i);
});

add("atomic commit locks replay keys and never mutates payout ledger", () => {
  const migration = fs.readFileSync(path.resolve(__dirname, "../../../supabase/migrations/20260810000112_advisor_compensation_atomic_commit_011d.sql"), "utf8");
  assert.match(migration, /pg_advisory_xact_lock/i);
  assert.match(migration, /REPLAYED/i);
  assert.match(migration, /CONFLICT/i);
  assert.match(migration, /advisor_compensation_event_ledger/i);
  assert.doesNotMatch(migration, /insert\s+into\s+public\.advisor_compensation_payout/i);
});

add("server context has explicit owner-mismatch and payment-state gates", () => {
  const migration = fs.readFileSync(path.resolve(__dirname, "../../../supabase/migrations/20260810000111_advisor_compensation_handoff_context_hardening_011d.sql"), "utf8");
  assert.match(migration, /OWNER_MISMATCH/);
  assert.match(migration, /PAYMENT_NOT_CONFIRMED/);
  assert.match(migration, /to service_role/i);
  assert.doesNotMatch(migration, /grant execute[\s\S]{0,180}handoff_context_server_011d[\s\S]{0,180}authenticated/i);
});

add("Aura handoff sends only payment event reference and never an amount", () => {
  const aura = fs.readFileSync(path.resolve(__dirname, "../../../docs/static-preview/forge-aura/cartera/cartera-compensation-handoff-aura-011d.js"), "utf8");
  assert.match(aura, /paymentEventReference/);
  assert.match(aura, /readAfterWriteVerified/);
  assert.doesNotMatch(aura, /commissionRate|commissionAmount|advisorId\s*:/);
});

add("Edge requires bearer identity and uses server-only context", () => {
  const edge = fs.readFileSync(path.resolve(__dirname, "../../../supabase/functions/advisor-compensation-handoff/index.ts"), "utf8");
  assert.match(edge, /AUTH_REQUIRED/);
  assert.match(edge, /auth\.getUser/);
  assert.match(edge, /forge_advisor_compensation_handoff_context_server_011d/);
  assert.match(edge, /officialRulePack:\s*null/);
  assert.match(edge, /advisorMonthResolution:\s*null/);
  assert.doesNotMatch(edge, /commissionRate\s*:/);
});

(async () => {
  let passed = 0;
  for (const [name, fn] of tests) {
    try {
      await fn();
      passed += 1;
      console.log(`PASS ${name}`);
    } catch (error) {
      console.error(`FAIL ${name}`);
      console.error(error && error.stack ? error.stack : error);
      process.exitCode = 1;
      break;
    }
  }
  console.log(`\n011D_RESULT ${passed}/${tests.length} PASS`);
  if (passed !== tests.length) process.exitCode = 1;
})();
