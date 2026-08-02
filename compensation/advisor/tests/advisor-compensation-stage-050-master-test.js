"use strict";
const assert = require("assert");
const C = require("../events/advisor-compensation-event-contract");
const F = require("../events/advisor-compensation-event-factory");
const G = require("../events/advisor-compensation-earned-promotion-gate");
const R = require("../events/advisor-compensation-event-repository");
const A = require("../events/advisor-compensation-adjustment-service");
const X = require("../events/advisor-compensation-event-authority");

let total = 0, passed = 0;
function test(name, fn) { total += 1; try { fn(); passed += 1; } catch (e) { console.error(`FAIL ${name}:`, e.stack || e); } }
function code(fn, expected) { assert.throws(fn, (e) => e?.code === expected); }

function calc(o = {}) {
  const calculationDigest = o.calculationDigest || C.sha256({ fixture: "commission", seed: o.seed || 1 });
  return {
    contractVersion: "ADVISOR_COMMISSION_CALCULATION_001", status: "CALCULATED",
    calculationId: `calc:${calculationDigest}`, calculationType: o.type || "LIFE_INITIAL",
    truthState: "ESTIMATED", eligibleForEarnedPromotion: o.eligible ?? false,
    calculatedAt: "2026-08-02T05:30:00.000Z", advisorReference: o.advisor || "advisor-1",
    policyReference: o.policy || "policy-1", paymentEventId: o.payment || "payment-event-1",
    product: { productId: "SMNYL_IMAGINA_SER", displayName: "Imagina Ser", lineOfBusiness: "VIDA_INDIVIDUAL", variantId: "DEFAULT", policyYear: 1 },
    rule: { ruleId: "rule-1", rulePackId: "pack-1", rulePackVersion: "1.0.0", rulePackDigest: o.ruleDigest || "a".repeat(64), governanceStatus: o.official ? "official" : "candidate", sourceState: o.official ? "OFFICIAL_SOURCE" : "LEGACY_RUNTIME", bandKey: "YEAR_1", commissionBasis: "CONFIRMED_PAID_PREMIUM", baseRate: 0.44, developmentFactor: 0.9, effectiveRate: 0.396 },
    basis: { basisState: "MATCHED_SCHEDULED_RECEIPT", currentConfirmedPaidPremium: 10000, accumulatedConfirmedPaidPremium: 10000, annualPremium: 120000, paymentFrequency: "MENSUAL" },
    production: { policyPoints: 2, weightedPremium: 120000 },
    amounts: { currency: "MXN", confirmedPaidPremium: 10000, accumulatedConfirmedPaidPremium: 10000, commissionAmount: o.amount ?? 3960, accumulatedCommissionAmount: o.amount ?? 3960 },
    period: { paymentDate: "2026-08-01", coveredStart: "2026-08-01", coveredEnd: "2026-08-31", asOf: "2026-08-01" },
    evidence: { paymentEvidenceReference: Object.hasOwn(o, "evidence") ? o.evidence : "evidence-1", evidenceHash: "hash-1", humanDecisionId: Object.hasOwn(o, "decision") ? o.decision : "decision-1" },
    explanation: { formula: "confirmed_paid_premium × base_rate × development_factor" }, calculationDigest
  };
}
function bonus(o = {}) { return { status: "CALCULATED", concept: o.concept || "TRAINING_ALLOWANCE", truthState: "ESTIMATED", qualifies: true, advisorReference: Object.hasOwn(o, "advisor") ? o.advisor : "advisor-1", amounts: { candidateAmount: o.amount ?? 9000 }, authority: { selectedAuthority: "ADVISOR_DEVELOPMENT_RULE_PACK", governanceStatus: "official" }, calculationDigest: o.digest || C.sha256({ bonus: o.concept || "TRAINING_ALLOWANCE" }), eligibleForEarnedPromotion: true, calculatedAt: "2026-08-02T05:31:00.000Z" }; }
function estimated(calculation, o = {}) { return F.createEstimatedAdvisorCompensationEvent({ calculation, advisorReference: o.advisor, periodKey: o.period, idempotencyKey: o.idem || `idem:${calculation.calculationDigest}`, correlationId: o.corr || "corr-1", createdAt: o.at || "2026-08-02T05:32:00.000Z", sequence: o.sequence || 1, previousEventId: o.previous || null, evidenceReferences: ["evidence-1"] }); }
function payment(o = {}) { return { eventId: o.id || "payment-event-1", truthClass: o.truth || "CONFIRMED_PAYMENT", interpretation: { readyForCalculation: o.ready ?? true }, safeguards: { payoutTruth: o.payout ?? false } }; }
function snapshot(o = {}) { return { governanceStatus: o.status || "official", officialSourceTruth: o.truth ?? true, calculatedDigest: o.digest || "a".repeat(64), capturedAt: "2026-08-02T05:00:00.000Z" }; }

const candidateCalc = calc();
const candidateEvent = estimated(candidateCalc);
const officialCalc = calc({ eligible: true, official: true, seed: 2 });
const officialEvent = estimated(officialCalc, { idem: "official-estimated" });
const ready = G.evaluateAdvisorCompensationEarnedPromotion({ estimatedEvent: officialEvent, calculation: officialCalc, paymentEvent: payment(), officialRuleSnapshot: snapshot() });
const earned = G.promoteAdvisorCompensationEventToEarned({ estimatedEvent: officialEvent, promotionEvaluation: ready, idempotencyKey: "earned-1", correlationId: "corr-earned", createdAt: "2026-08-02T05:40:00.000Z", actorId: "gate-1" });

[
  ["contract version", () => assert.equal(candidateEvent.contractVersion, "ADVISOR_COMPENSATION_EVENT_001")],
  ["states", () => assert.deepStrictEqual(Object.values(C.ADVISOR_COMPENSATION_EVENT_STATES), ["ESTIMATED","EARNED","ADJUSTED","REVERSED"])],
  ["kinds", () => assert.equal(C.ADVISOR_COMPENSATION_EVENT_KINDS.BONUS, "BONUS")],
  ["valid estimated", () => assert(C.validateAdvisorCompensationEvent(candidateEvent).valid)],
  ["deep frozen", () => assert(Object.isFrozen(candidateEvent.calculation))],
  ["event digest", () => assert.match(candidateEvent.eventDigest, /^[a-f0-9]{64}$/)],
  ["estimated state", () => assert.equal(candidateEvent.state, "ESTIMATED")],
  ["commission kind", () => assert.equal(candidateEvent.kind, "COMMISSION")],
  ["commission amount", () => assert.equal(candidateEvent.amount.value, 3960)],
  ["currency", () => assert.equal(candidateEvent.amount.currency, "MXN")],
  ["period derived", () => assert.equal(candidateEvent.periodKey, "2026-08")],
  ["calculation digest kept", () => assert.equal(candidateEvent.lineage.sourceCalculationDigest, candidateCalc.calculationDigest)],
  ["rule digest kept", () => assert.equal(candidateEvent.ruleSnapshot.rulePackDigest, "a".repeat(64))],
  ["payment evidence kept", () => assert.equal(candidateEvent.evidence.paymentEvidenceReference, "evidence-1")],
  ["human decision kept", () => assert.equal(candidateEvent.evidence.humanDecisionId, "decision-1")],
  ["not payout truth", () => assert.equal(candidateEvent.safeguards.payoutTruth, false)],
  ["no overwrite", () => assert.equal(candidateEvent.safeguards.overwriteAuthorized, false)],
  ["no delete", () => assert.equal(candidateEvent.safeguards.deleteAuthorized, false)],
  ["paid forbidden", () => code(() => C.createAdvisorCompensationEvent({ ...candidateEvent, state: "PAID" }), "ADVISOR_COMPENSATION_EVENT_STATE_INVALID")],
  ["negative base forbidden", () => code(() => C.createAdvisorCompensationEvent({ ...candidateEvent, eventId: "bad", amount: -1 }), "ADVISOR_COMPENSATION_BASE_EVENT_AMOUNT_NEGATIVE")],
  ["zero adjustment forbidden", () => code(() => C.createAdvisorCompensationEvent({ ...candidateEvent, eventId: "bad2", state: "ADJUSTED", kind: "ADJUSTMENT", amount: 0 }), "ADVISOR_COMPENSATION_EVENT_AMOUNT_INVALID")],
  ["positive reversal forbidden", () => code(() => C.createAdvisorCompensationEvent({ ...candidateEvent, eventId: "bad3", state: "REVERSED", kind: "REVERSAL", amount: 1 }), "ADVISOR_COMPENSATION_REVERSAL_AMOUNT_MUST_BE_NEGATIVE")],
  ["classify commission", () => assert.equal(F.classifyCalculation(candidateCalc).kind, "COMMISSION")],
  ["reject blocked calculation", () => code(() => F.classifyCalculation({ status: "BLOCKED" }), "ADVISOR_COMPENSATION_CALCULATION_NOT_CALCULATED")],
  ["record digest deterministic", () => assert.equal(F.calculateCalculationRecordDigest(candidateEvent), F.calculateCalculationRecordDigest(candidateEvent))],
  ["bonus kind", () => assert.equal(estimated(bonus(), { period: "2026-S1", idem: "bonus-1" }).kind, "BONUS")],
  ["bonus amount", () => assert.equal(estimated(bonus({ amount: 12000 }), { period: "2026-S1", idem: "bonus-2" }).amount.value, 12000)],
  ["explicit bonus advisor", () => assert.equal(estimated(bonus({ advisor: null }), { advisor: "advisor-2", period: "2026-S1", idem: "bonus-3" }).advisorReference, "advisor-2")],
  ["missing bonus advisor", () => code(() => estimated(bonus({ advisor: null }), { period: "2026-S1", idem: "bonus-4" }), "ADVISOR_COMPENSATION_EVENT_ADVISOR_REQUIRED")],
  ["candidate gate blocked", () => assert.equal(G.evaluateAdvisorCompensationEarnedPromotion({ estimatedEvent: candidateEvent, calculation: candidateCalc, paymentEvent: payment(), officialRuleSnapshot: snapshot() }).status, "BLOCKED")],
  ["official gate ready", () => assert.equal(ready.status, "READY")],
  ["promotion payment basis", () => assert.equal(ready.promotionBasis.confirmedPaymentEventId, "payment-event-1")],
  ["promotion rule basis", () => assert.equal(ready.promotionBasis.rulePackDigest, "a".repeat(64))],
  ["earned state", () => assert.equal(earned.state, "EARNED")],
  ["earned sequence", () => assert.equal(earned.sequence, 2)],
  ["earned previous", () => assert.equal(earned.previousEventId, officialEvent.eventId)],
  ["earned amount", () => assert.equal(earned.amount.value, officialEvent.amount.value)],
  ["earned not paid", () => assert.equal(earned.safeguards.payoutTruth, false)],
  ["blocked promotion throws", () => code(() => G.promoteAdvisorCompensationEventToEarned({ estimatedEvent: candidateEvent, promotionEvaluation: { status: "BLOCKED" }, idempotencyKey: "x", correlationId: "x", createdAt: "2026-08-02T05:40:00.000Z" }), "ADVISOR_COMPENSATION_EARNED_PROMOTION_NOT_READY")]
].forEach(([n,f]) => test(n,f));

[
  ["payment mismatch", { paymentEvent: payment({ id: "other" }) }, "confirmed_payment_event_id_mismatch"],
  ["payment not confirmed", { paymentEvent: payment({ truth: "CLAIM" }) }, "confirmed_payment_event_required"],
  ["payment not ready", { paymentEvent: payment({ ready: false }) }, "confirmed_payment_event_not_ready"],
  ["payment payout invalid", { paymentEvent: payment({ payout: true }) }, "payment_event_payout_truth_invalid"],
  ["rule candidate", { officialRuleSnapshot: snapshot({ status: "candidate" }) }, "official_rule_snapshot_required"],
  ["rule source missing", { officialRuleSnapshot: snapshot({ truth: false }) }, "official_rule_source_truth_required"],
  ["rule digest mismatch", { officialRuleSnapshot: snapshot({ digest: "b".repeat(64) }) }, "rule_snapshot_digest_mismatch"]
].forEach(([n, change, reason]) => test(n, () => {
  const result = G.evaluateAdvisorCompensationEarnedPromotion({ estimatedEvent: officialEvent, calculation: officialCalc, paymentEvent: payment(), officialRuleSnapshot: snapshot(), ...change });
  assert(result.reasons.includes(reason));
}));

const noDecision = calc({ eligible: true, official: true, decision: null, seed: 3 });
const noDecisionEvent = estimated(noDecision, { idem: "no-decision" });
test("missing decision blocked", () => assert(G.evaluateAdvisorCompensationEarnedPromotion({ estimatedEvent: noDecisionEvent, calculation: noDecision, paymentEvent: payment(), officialRuleSnapshot: snapshot() }).reasons.includes("human_decision_reference_required")));
const noEvidence = calc({ eligible: true, official: true, evidence: null, seed: 4 });
const noEvidenceEvent = estimated(noEvidence, { idem: "no-evidence" });
test("missing evidence blocked", () => assert(G.evaluateAdvisorCompensationEarnedPromotion({ estimatedEvent: noEvidenceEvent, calculation: noEvidence, paymentEvent: payment(), officialRuleSnapshot: snapshot() }).reasons.includes("payment_evidence_reference_required")));

const repo = R.createInMemoryAdvisorCompensationEventRepository();
[
  ["repo append", () => assert.equal(repo.append(officialEvent).status, "APPENDED")],
  ["repo replay", () => assert.equal(repo.append(officialEvent).status, "REPLAYED")],
  ["repo earned", () => assert.equal(repo.append(earned).status, "APPENDED")],
  ["repo count", () => assert.equal(repo.count(), 2)],
  ["repo timeline", () => assert.equal(repo.listByAggregate(earned.aggregateKey, "advisor-1").length, 2)],
  ["repo latest", () => assert.equal(repo.getLatest(earned.aggregateKey, "advisor-1").state, "EARNED")],
  ["repo owner scope", () => code(() => repo.getById(earned.eventId, "advisor-2"), "ADVISOR_COMPENSATION_OWNER_SCOPE_VIOLATION")],
  ["repo no update", () => assert.equal(repo.capabilities.update, false)],
  ["repo no overwrite", () => assert.equal(repo.capabilities.overwrite, false)],
  ["repo no delete", () => assert.equal(repo.capabilities.delete, false)],
  ["repo no remote", () => assert.equal(repo.capabilities.remotePersistence, false)]
].forEach(([n,f]) => test(n,f));

test("sequence conflict", () => { const e = C.createAdvisorCompensationEvent({ ...earned, eventId: "seq", idempotencyKey: "seq", sequence: 4, previousEventId: earned.eventId, amount: earned.amount.value, currency: "MXN" }); code(() => repo.append(e), "ADVISOR_COMPENSATION_EVENT_SEQUENCE_CONFLICT"); });
test("previous conflict", () => { const e = C.createAdvisorCompensationEvent({ ...earned, eventId: "prev", idempotencyKey: "prev", sequence: 3, previousEventId: officialEvent.eventId, amount: earned.amount.value, currency: "MXN" }); code(() => repo.append(e), "ADVISOR_COMPENSATION_PREVIOUS_EVENT_MISMATCH"); });
test("idempotency conflict", () => { const e = C.createAdvisorCompensationEvent({ ...earned, eventId: "idem-conflict", idempotencyKey: "earned-1", amount: 4000, currency: "MXN" }); code(() => repo.append(e), "ADVISOR_COMPENSATION_IDEMPOTENCY_CONFLICT"); });

const adjustment = A.createAdvisorCompensationAdjustmentEvent({ baseEvent: earned, amountDelta: 250, concept: C.ADVISOR_COMPENSATION_EVENT_CONCEPTS.RATE_CORRECTION, reason: "Corrección documentada", actorId: "reviewer-1", evidenceReferences: ["rate-note-1"], idempotencyKey: "adjust-1", correlationId: "corr-adjust", createdAt: "2026-08-02T05:45:00.000Z" });
[
  ["adjust state", () => assert.equal(adjustment.state, "ADJUSTED")],
  ["adjust delta", () => assert.equal(adjustment.amount.value, 250)],
  ["adjust net", () => assert.equal(adjustment.metadata.resultingNetAmount, 4210)],
  ["adjust previous", () => assert.equal(adjustment.previousEventId, earned.eventId)],
  ["adjust append", () => assert.equal(repo.append(adjustment).status, "APPENDED")],
  ["adjust no reason", () => code(() => A.createAdvisorCompensationAdjustmentEvent({ baseEvent: earned, amountDelta: 1, actorId: "a", idempotencyKey: "a", correlationId: "a", createdAt: "2026-08-02T05:45:00.000Z" }), "ADVISOR_COMPENSATION_ADJUSTMENT_REASON_REQUIRED")],
  ["adjust zero", () => code(() => A.createAdvisorCompensationAdjustmentEvent({ baseEvent: earned, amountDelta: 0, reason: "x", actorId: "a", idempotencyKey: "a", correlationId: "a", createdAt: "2026-08-02T05:45:00.000Z" }), "ADVISOR_COMPENSATION_ADJUSTMENT_DELTA_INVALID")],
  ["estimated not adjustable", () => code(() => A.createAdvisorCompensationAdjustmentEvent({ baseEvent: candidateEvent, amountDelta: 1, reason: "x", actorId: "a", idempotencyKey: "a", correlationId: "a", createdAt: "2026-08-02T05:45:00.000Z" }), "ADVISOR_COMPENSATION_ADJUSTMENT_BASE_EVENT_INVALID")]
].forEach(([n,f]) => test(n,f));

const repo2 = R.createInMemoryAdvisorCompensationEventRepository(); repo2.append(officialEvent); repo2.append(earned);
const reversal = A.createAdvisorCompensationReversalEvent({ baseEvent: earned, reason: "Cancelación documentada", actorId: "reviewer-2", evidenceReferences: ["cancel-1"], idempotencyKey: "reverse-1", correlationId: "corr-reverse", createdAt: "2026-08-02T05:50:00.000Z" });
[
  ["reverse state", () => assert.equal(reversal.state, "REVERSED")],
  ["reverse negative", () => assert.equal(reversal.amount.value, -3960)],
  ["reverse net", () => assert.equal(reversal.metadata.resultingNetAmount, 0)],
  ["reverse target", () => assert.equal(reversal.lineage.reversedEventId, earned.eventId)],
  ["reverse append", () => assert.equal(repo2.append(reversal).status, "APPENDED")],
  ["reverse no reason", () => code(() => A.createAdvisorCompensationReversalEvent({ baseEvent: earned, actorId: "a", idempotencyKey: "r", correlationId: "r", createdAt: "2026-08-02T05:50:00.000Z" }), "ADVISOR_COMPENSATION_REVERSAL_REASON_REQUIRED")]
].forEach(([n,f]) => test(n,f));

const authority = X.createAdvisorCompensationEventAuthority();
const ar = authority.recordEstimated({ calculation: officialCalc, idempotencyKey: "auth-est", correlationId: "auth", createdAt: "2026-08-02T06:00:00.000Z" });
const ae = authority.evaluateEarnedPromotion({ estimatedEvent: ar.event, calculation: officialCalc, paymentEvent: payment(), officialRuleSnapshot: snapshot() });
const ap = authority.promoteToEarned({ estimatedEvent: ar.event, calculation: officialCalc, paymentEvent: payment(), officialRuleSnapshot: snapshot(), promotionEvaluation: ae, idempotencyKey: "auth-earned", correlationId: "auth", createdAt: "2026-08-02T06:01:00.000Z" });
[
  ["authority estimated", () => assert.equal(ar.status, "APPENDED")],
  ["authority gate", () => assert.equal(ae.status, "READY")],
  ["authority earned", () => assert.equal(ap.event.state, "EARNED")],
  ["authority order", () => assert.deepStrictEqual(authority.getTimeline(ap.event.aggregateKey, "advisor-1").map(e => e.sequence), [1,2])],
  ["authority append only", () => assert.equal(authority.capabilities.appendOnly, true)],
  ["authority paid false", () => assert.equal(authority.capabilities.paidPromotion, false)],
  ["authority remote false", () => assert.equal(authority.capabilities.remotePersistence, false)]
].forEach(([n,f]) => test(n,f));

console.log(`MASTER_TEST_TOTAL=${total}`);
console.log(`MASTER_TEST_PASS=${passed}`);
console.log(`MASTER_TEST_FAIL=${total-passed}`);
console.log(`STAGE_050_COMPLETE=${total===passed?"YES":"NO"}`);
if (total !== passed) process.exit(1);
