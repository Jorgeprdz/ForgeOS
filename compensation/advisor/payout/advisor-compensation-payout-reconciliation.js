"use strict";

const {
  clone,
  deepFreeze,
  sha256,
  validateAdvisorCompensationPayoutEvidence
} = require("./advisor-compensation-payout-evidence-contract");
const {
  PAYOUT_MATCH_STATUSES,
  PAYOUT_DIFFERENCE_TYPES,
  eligibleAggregates
} = require("./advisor-compensation-payout-matcher");
const {
  PAYOUT_CONFIRMATION_DECISIONS,
  validateAdvisorCompensationPayoutConfirmation
} = require("./advisor-compensation-payout-confirmation");
const {
  ADVISOR_COMPENSATION_PAYOUT_SOURCE_STATES,
  createAdvisorCompensationConfirmedPayoutRecord,
  validateAdvisorCompensationConfirmedPayoutRecord
} = require("../income/advisor-compensation-paid-truth-adapter");

const PAYOUT_RECONCILIATION_CONTRACT_VERSION = "ADVISOR_COMPENSATION_PAYOUT_RECONCILIATION_001";
const PAYOUT_RECONCILIATION_TYPES = Object.freeze({
  MATCHED: "MATCHED",
  UNDERPAYMENT: "UNDERPAYMENT",
  OVERPAYMENT: "OVERPAYMENT",
  GROUPED_PAYMENT: "GROUPED_PAYMENT",
  MISSING_COMMISSION: "MISSING_COMMISSION",
  RETROACTIVE_DIFFERENCE: "RETROACTIVE_DIFFERENCE",
  ADJUSTMENT: "ADJUSTMENT",
  REVERSAL: "REVERSAL",
  AMBIGUOUS: "AMBIGUOUS",
  UNMATCHED_PAYMENT: "UNMATCHED_PAYMENT"
});

function fail(code, details = null) {
  const error = new Error(code);
  error.code = code;
  if (details !== null) error.details = details;
  throw error;
}
function round(value) {
  return Math.round(Number(value) * 100) / 100;
}
function evidenceLine(evidence, lineId) {
  const line = evidence.lines.find((item) => item.lineId === lineId);
  if (!line) fail("ADVISOR_COMPENSATION_PAYOUT_EVIDENCE_LINE_NOT_FOUND");
  return line;
}
function assertProposal(proposal, evidence) {
  if (!proposal || proposal.evidenceId !== evidence.evidenceId || proposal.evidenceDigest !== evidence.evidenceDigest) {
    fail("ADVISOR_COMPENSATION_PAYOUT_PROPOSAL_EVIDENCE_MISMATCH");
  }
  if (proposal.advisorReference !== evidence.advisorReference) {
    fail("ADVISOR_COMPENSATION_PAYOUT_PROPOSAL_OWNER_MISMATCH");
  }
  const line = evidenceLine(evidence, proposal.lineId);
  if (line.lineDigest !== proposal.lineDigest) {
    fail("ADVISOR_COMPENSATION_PAYOUT_PROPOSAL_LINE_DIGEST_MISMATCH");
  }
  return line;
}
function promoteAdvisorCompensationEarnedToPaid({
  evidence,
  proposal,
  confirmation,
  events = [],
  payoutRecordId = null
} = {}) {
  const evidenceValidation = validateAdvisorCompensationPayoutEvidence(evidence);
  if (!evidenceValidation.valid) fail("ADVISOR_COMPENSATION_PAYOUT_EVIDENCE_INVALID", evidenceValidation.errors);
  const line = assertProposal(proposal, evidence);
  const confirmationValidation = validateAdvisorCompensationPayoutConfirmation(confirmation, proposal);
  if (!confirmationValidation.valid) {
    fail("ADVISOR_COMPENSATION_PAYOUT_CONFIRMATION_INVALID", confirmationValidation.errors);
  }
  if (confirmation.decision !== PAYOUT_CONFIRMATION_DECISIONS.CONFIRMED) {
    fail("ADVISOR_COMPENSATION_PAYOUT_PROMOTION_REQUIRES_CONFIRMATION");
  }
  if (![PAYOUT_MATCH_STATUSES.EXACT, PAYOUT_MATCH_STATUSES.GROUPED, PAYOUT_MATCH_STATUSES.DIFFERENCE, PAYOUT_MATCH_STATUSES.AMBIGUOUS]
      .includes(proposal.status)) {
    fail("ADVISOR_COMPENSATION_PAYOUT_PROPOSAL_NOT_PROMOTABLE");
  }
  if (line.amount.value <= 0) {
    fail("ADVISOR_COMPENSATION_PAYOUT_PROMOTION_AMOUNT_MUST_BE_POSITIVE");
  }
  const aggregates = eligibleAggregates(events, evidence.advisorReference);
  const eligibleEventIds = new Set(aggregates.map((aggregate) => aggregate.earnedEventId));
  const selected = confirmation.selectedCompensationEventIds;
  if (selected.some((eventId) => !eligibleEventIds.has(eventId))) {
    fail("ADVISOR_COMPENSATION_PAYOUT_PROMOTION_EARNED_EVENT_REQUIRED");
  }
  const proposed = new Set(
    proposal.status === PAYOUT_MATCH_STATUSES.AMBIGUOUS
      ? proposal.candidateCompensationEventIds
      : proposal.matchedCompensationEventIds
  );
  if (selected.some((eventId) => !proposed.has(eventId))) {
    fail("ADVISOR_COMPENSATION_PAYOUT_PROMOTION_SELECTION_MISMATCH");
  }
  if (proposal.status !== PAYOUT_MATCH_STATUSES.AMBIGUOUS && selected.length !== proposed.size) {
    fail("ADVISOR_COMPENSATION_PAYOUT_PROMOTION_SELECTION_MISMATCH");
  }

  return createAdvisorCompensationConfirmedPayoutRecord({
    payoutRecordId: payoutRecordId || `payout:${evidence.evidenceId}:${line.lineId}`,
    advisorReference: evidence.advisorReference,
    periodKey: line.periodKey,
    amount: line.amount.value,
    currency: line.amount.currency,
    matchedCompensationEventIds: selected,
    payoutEvidenceReference: `${evidence.sourceAuthority}:${evidence.sourceReference}:${line.lineId}`,
    payoutEvidenceHash: evidence.evidenceHash,
    humanDecisionId: confirmation.humanDecisionId,
    confirmedAt: confirmation.decidedAt,
    sourceAuthority: evidence.sourceAuthority,
    metadata: {
      evidenceId: evidence.evidenceId,
      evidenceDigest: evidence.evidenceDigest,
      evidenceLineId: line.lineId,
      lineDigest: line.lineDigest,
      proposalId: proposal.proposalId,
      proposalDigest: proposal.proposalDigest,
      confirmationDigest: confirmation.confirmationDigest,
      matchStatus: proposal.status,
      differenceType: proposal.differenceType,
      expectedEarnedAmount: proposal.expectedEarnedAmount,
      statementAmount: proposal.statementAmount,
      differenceAmount: proposal.differenceAmount,
      policyReference: line.policyReference,
      concept: line.concept,
      carrierReference: line.carrierReference,
      paymentDate: line.paymentDate,
      paidPromotion: true
    }
  });
}

function reconciliationTypeForProposal(proposal, line, confirmedRecord = null) {
  if (line.kind === "RETROACTIVE_DIFFERENCE") return PAYOUT_RECONCILIATION_TYPES.RETROACTIVE_DIFFERENCE;
  if (line.kind === "ADJUSTMENT") return PAYOUT_RECONCILIATION_TYPES.ADJUSTMENT;
  if (line.kind === "REVERSAL") return PAYOUT_RECONCILIATION_TYPES.REVERSAL;
  if (proposal.status === PAYOUT_MATCH_STATUSES.GROUPED) return PAYOUT_RECONCILIATION_TYPES.GROUPED_PAYMENT;
  if (proposal.status === PAYOUT_MATCH_STATUSES.AMBIGUOUS) {
    return confirmedRecord ? PAYOUT_RECONCILIATION_TYPES.MATCHED : PAYOUT_RECONCILIATION_TYPES.AMBIGUOUS;
  }
  if (proposal.status === PAYOUT_MATCH_STATUSES.UNMATCHED) return PAYOUT_RECONCILIATION_TYPES.UNMATCHED_PAYMENT;
  if (proposal.differenceType === PAYOUT_DIFFERENCE_TYPES.UNDERPAYMENT) return PAYOUT_RECONCILIATION_TYPES.UNDERPAYMENT;
  if (proposal.differenceType === PAYOUT_DIFFERENCE_TYPES.OVERPAYMENT) return PAYOUT_RECONCILIATION_TYPES.OVERPAYMENT;
  return PAYOUT_RECONCILIATION_TYPES.MATCHED;
}

function reconcileAdvisorCompensationPayout({
  evidence,
  proposals = [],
  payoutRecords,
  events = [],
  sourceState = ADVISOR_COMPENSATION_PAYOUT_SOURCE_STATES.AVAILABLE,
  asOf
} = {}) {
  const evidenceValidation = validateAdvisorCompensationPayoutEvidence(evidence);
  if (!evidenceValidation.valid) fail("ADVISOR_COMPENSATION_PAYOUT_EVIDENCE_INVALID", evidenceValidation.errors);
  if (!Object.values(ADVISOR_COMPENSATION_PAYOUT_SOURCE_STATES).includes(sourceState)) {
    fail("ADVISOR_COMPENSATION_PAYOUT_RECONCILIATION_SOURCE_STATE_INVALID");
  }
  if (sourceState === ADVISOR_COMPENSATION_PAYOUT_SOURCE_STATES.DISCONNECTED) {
    const report = {
      contractVersion: PAYOUT_RECONCILIATION_CONTRACT_VERSION,
      advisorReference: evidence.advisorReference,
      evidenceId: evidence.evidenceId,
      sourceState,
      status: "BLOCKED",
      asOf: asOf || null,
      totals: { expectedEarned: null, confirmedPaid: null, difference: null },
      items: [],
      safeguards: {
        unknownIsNotZero: true,
        automaticPaidPromotion: false,
        paidTruthAvailable: false,
        externalMutationAuthorized: false
      }
    };
    report.reportDigest = sha256(report);
    return deepFreeze(report);
  }
  if (!Array.isArray(payoutRecords)) fail("ADVISOR_COMPENSATION_PAYOUT_RECONCILIATION_RECORDS_REQUIRED");
  const aggregates = eligibleAggregates(events, evidence.advisorReference);
  const validRecords = [];
  for (const record of payoutRecords) {
    const validation = validateAdvisorCompensationConfirmedPayoutRecord(record);
    if (!validation.valid) fail("ADVISOR_COMPENSATION_PAYOUT_RECORD_INVALID", validation.errors);
    if (record.advisorReference === evidence.advisorReference) validRecords.push(record);
  }
  const paidEventIds = new Set(validRecords.flatMap((record) => record.matchedCompensationEventIds));
  const items = [];
  for (const proposal of proposals) {
    const line = assertProposal(proposal, evidence);
    const confirmedRecord = validRecords.find((record) => record.metadata?.proposalId === proposal.proposalId) || null;
    items.push({
      reconciliationId: `reconciliation:${proposal.proposalId}`,
      type: reconciliationTypeForProposal(proposal, line, confirmedRecord),
      evidenceLineId: line.lineId,
      proposalId: proposal.proposalId,
      matchedCompensationEventIds: clone(proposal.matchedCompensationEventIds),
      expectedAmount: proposal.expectedEarnedAmount,
      statementAmount: proposal.statementAmount,
      differenceAmount: proposal.differenceAmount,
      currency: proposal.currency,
      periodKey: proposal.periodKey,
      policyReference: proposal.policyReference,
      concept: proposal.concept,
      carrierReference: proposal.carrierReference,
      confirmedPaid: Boolean(confirmedRecord) || proposal.matchedCompensationEventIds.some((id) => paidEventIds.has(id))
    });
  }
  for (const aggregate of aggregates) {
    if (!paidEventIds.has(aggregate.earnedEventId)) {
      items.push({
        reconciliationId: `missing:${aggregate.aggregateKey}`,
        type: PAYOUT_RECONCILIATION_TYPES.MISSING_COMMISSION,
        evidenceLineId: null,
        proposalId: null,
        matchedCompensationEventIds: [aggregate.earnedEventId],
        expectedAmount: aggregate.earnedNetAmount,
        statementAmount: 0,
        differenceAmount: round(-aggregate.earnedNetAmount),
        currency: aggregate.currency,
        periodKey: aggregate.periodKey,
        policyReference: aggregate.policyReference,
        concept: aggregate.concept,
        carrierReference: null,
        confirmedPaid: false
      });
    }
    if (aggregate.adjustmentAmount !== 0) {
      items.push({
        reconciliationId: `adjustment:${aggregate.aggregateKey}`,
        type: PAYOUT_RECONCILIATION_TYPES.ADJUSTMENT,
        evidenceLineId: null,
        proposalId: null,
        matchedCompensationEventIds: clone(aggregate.adjustmentEventIds),
        expectedAmount: aggregate.adjustmentAmount,
        statementAmount: null,
        differenceAmount: null,
        currency: aggregate.currency,
        periodKey: aggregate.periodKey,
        policyReference: aggregate.policyReference,
        concept: aggregate.concept,
        carrierReference: null,
        confirmedPaid: aggregate.adjustmentEventIds.some((id) => paidEventIds.has(id))
      });
    }
    if (aggregate.reversalAmount !== 0) {
      items.push({
        reconciliationId: `reversal:${aggregate.aggregateKey}`,
        type: PAYOUT_RECONCILIATION_TYPES.REVERSAL,
        evidenceLineId: null,
        proposalId: null,
        matchedCompensationEventIds: clone(aggregate.reversalEventIds),
        expectedAmount: aggregate.reversalAmount,
        statementAmount: null,
        differenceAmount: null,
        currency: aggregate.currency,
        periodKey: aggregate.periodKey,
        policyReference: aggregate.policyReference,
        concept: aggregate.concept,
        carrierReference: null,
        confirmedPaid: aggregate.reversalEventIds.some((id) => paidEventIds.has(id))
      });
    }
  }
  const expectedEarned = round(aggregates.reduce((sum, item) => sum + item.earnedNetAmount, 0));
  const confirmedPaid = round(validRecords.reduce((sum, record) => sum + record.amount.value, 0));
  const difference = round(confirmedPaid - expectedEarned);
  const unresolved = items.filter((item) => [
    PAYOUT_RECONCILIATION_TYPES.AMBIGUOUS,
    PAYOUT_RECONCILIATION_TYPES.UNMATCHED_PAYMENT,
    PAYOUT_RECONCILIATION_TYPES.MISSING_COMMISSION,
    PAYOUT_RECONCILIATION_TYPES.UNDERPAYMENT,
    PAYOUT_RECONCILIATION_TYPES.OVERPAYMENT
  ].includes(item.type));
  const report = {
    contractVersion: PAYOUT_RECONCILIATION_CONTRACT_VERSION,
    advisorReference: evidence.advisorReference,
    evidenceId: evidence.evidenceId,
    sourceState,
    status: unresolved.length ? "PARTIAL" : "READY",
    asOf: asOf || null,
    totals: { expectedEarned, confirmedPaid, difference },
    counts: {
      earnedAggregates: aggregates.length,
      payoutRecords: validRecords.length,
      reconciliationItems: items.length,
      unresolved: unresolved.length
    },
    items,
    safeguards: {
      unknownIsNotZero: true,
      automaticPaidPromotion: false,
      paidTruthAvailable: true,
      ownerScopeEnforced: true,
      externalMutationAuthorized: false
    }
  };
  report.reportDigest = sha256(report);
  return deepFreeze(report);
}

module.exports = {
  PAYOUT_RECONCILIATION_CONTRACT_VERSION,
  PAYOUT_RECONCILIATION_TYPES,
  promoteAdvisorCompensationEarnedToPaid,
  reconcileAdvisorCompensationPayout
};
