"use strict";

const {
  clone,
  deepFreeze,
  sha256,
  validateAdvisorCompensationPayoutEvidence
} = require("./advisor-compensation-payout-evidence-contract");
const {
  validateAdvisorCompensationEvent
} = require("../events/advisor-compensation-event-contract");
const {
  projectAggregate
} = require("../income/advisor-compensation-event-income-projector");

const PAYOUT_MATCH_CONTRACT_VERSION = "ADVISOR_COMPENSATION_PAYOUT_MATCH_001";
const PAYOUT_MATCH_STATUSES = Object.freeze({
  EXACT: "EXACT",
  GROUPED: "GROUPED",
  DIFFERENCE: "DIFFERENCE",
  AMBIGUOUS: "AMBIGUOUS",
  UNMATCHED: "UNMATCHED"
});
const PAYOUT_DIFFERENCE_TYPES = Object.freeze({
  NONE: "NONE",
  UNDERPAYMENT: "UNDERPAYMENT",
  OVERPAYMENT: "OVERPAYMENT"
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
function unique(values) {
  return [...new Set(values.filter(Boolean))];
}
function eligibleAggregates(events, advisorReference) {
  if (!Array.isArray(events)) fail("ADVISOR_COMPENSATION_PAYOUT_MATCH_EVENTS_ARRAY_REQUIRED");
  const byAggregate = new Map();
  const byId = new Map();
  for (const event of events) {
    const validation = validateAdvisorCompensationEvent(event);
    if (!validation.valid) fail("ADVISOR_COMPENSATION_PAYOUT_MATCH_EVENT_INVALID", validation.errors);
    if (event.advisorReference !== advisorReference) continue;
    const existing = byId.get(event.eventId);
    if (existing && existing.eventDigest !== event.eventDigest) {
      fail("ADVISOR_COMPENSATION_PAYOUT_MATCH_EVENT_ID_CONFLICT");
    }
    if (existing) continue;
    byId.set(event.eventId, event);
    byAggregate.set(event.aggregateKey, [...(byAggregate.get(event.aggregateKey) || []), event]);
  }
  return [...byAggregate.values()].map(projectAggregate).filter((aggregate) =>
    aggregate.earnedEventId && aggregate.earnedNetAmount > 0 && aggregate.latestState !== "REVERSED"
  );
}
function identityCompatible(line, aggregate) {
  if (line.periodKey !== aggregate.periodKey) return false;
  if (line.amount.currency !== aggregate.currency) return false;
  if (line.policyReference && line.policyReference !== aggregate.policyReference) return false;
  if (line.concept && line.concept !== aggregate.concept) return false;
  return true;
}
function matchScore(line, aggregate) {
  let score = 0;
  if (line.policyReference && line.policyReference === aggregate.policyReference) score += 50;
  if (line.concept && line.concept === aggregate.concept) score += 25;
  if (line.periodKey === aggregate.periodKey) score += 15;
  if (line.amount.currency === aggregate.currency) score += 10;
  if (round(line.amount.value) === round(aggregate.earnedNetAmount)) score += 40;
  return score;
}
function subsetsForAmount(candidates, target, maxCandidates = 10) {
  const source = candidates.slice(0, maxCandidates);
  const results = [];
  function walk(index, selected, total) {
    if (results.length > 8) return;
    if (selected.length >= 2 && round(total) === round(target)) {
      results.push([...selected]);
      return;
    }
    if (index >= source.length || total > target) return;
    walk(index + 1, [...selected, source[index]], total + source[index].earnedNetAmount);
    walk(index + 1, selected, total);
  }
  walk(0, [], 0);
  return results;
}
function proposalForLine(evidence, line, aggregates) {
  const candidates = aggregates.filter((aggregate) => identityCompatible(line, aggregate));
  const exact = candidates.filter((aggregate) =>
    round(aggregate.earnedNetAmount) === round(line.amount.value)
  ).sort((a, b) => matchScore(line, b) - matchScore(line, a) || a.aggregateKey.localeCompare(b.aggregateKey));

  let status = PAYOUT_MATCH_STATUSES.UNMATCHED;
  let matched = [];
  let alternatives = [];
  if (exact.length === 1) {
    status = PAYOUT_MATCH_STATUSES.EXACT;
    matched = exact;
  } else if (exact.length > 1) {
    status = PAYOUT_MATCH_STATUSES.AMBIGUOUS;
    alternatives = exact;
  } else {
    const grouped = subsetsForAmount(candidates, line.amount.value);
    if (grouped.length === 1) {
      status = PAYOUT_MATCH_STATUSES.GROUPED;
      matched = grouped[0];
    } else if (grouped.length > 1) {
      status = PAYOUT_MATCH_STATUSES.AMBIGUOUS;
      alternatives = grouped.flat();
    } else if (candidates.length === 1) {
      status = PAYOUT_MATCH_STATUSES.DIFFERENCE;
      matched = candidates;
    }
  }

  const expectedAmount = matched.length
    ? round(matched.reduce((sum, aggregate) => sum + aggregate.earnedNetAmount, 0))
    : null;
  const differenceAmount = expectedAmount === null ? null : round(line.amount.value - expectedAmount);
  const differenceType = differenceAmount === null || differenceAmount === 0
    ? PAYOUT_DIFFERENCE_TYPES.NONE
    : differenceAmount < 0
      ? PAYOUT_DIFFERENCE_TYPES.UNDERPAYMENT
      : PAYOUT_DIFFERENCE_TYPES.OVERPAYMENT;

  const proposal = {
    contractVersion: PAYOUT_MATCH_CONTRACT_VERSION,
    evidenceId: evidence.evidenceId,
    evidenceDigest: evidence.evidenceDigest,
    lineId: line.lineId,
    lineDigest: line.lineDigest,
    advisorReference: evidence.advisorReference,
    status,
    matchedAggregateKeys: matched.map((item) => item.aggregateKey),
    matchedCompensationEventIds: unique(matched.map((item) => item.earnedEventId)),
    candidateAggregateKeys: unique([...matched, ...alternatives].map((item) => item.aggregateKey)),
    candidateCompensationEventIds: unique([...matched, ...alternatives].map((item) => item.earnedEventId)),
    statementAmount: line.amount.value,
    expectedEarnedAmount: expectedAmount,
    differenceAmount,
    differenceType,
    currency: line.amount.currency,
    periodKey: line.periodKey,
    concept: line.concept,
    policyReference: line.policyReference,
    carrierReference: line.carrierReference,
    confirmationRequired: true,
    consequential: status !== PAYOUT_MATCH_STATUSES.EXACT || differenceType !== PAYOUT_DIFFERENCE_TYPES.NONE,
    safeguards: {
      automaticMatchConfirmation: false,
      automaticPaidPromotion: false,
      ownerScopeEnforced: true,
      currencyScopeEnforced: true,
      unknownIsNotZero: true
    }
  };
  proposal.proposalId = `payout-match:${sha256(proposal).slice(0, 32)}`;
  proposal.proposalDigest = sha256(proposal);
  return deepFreeze(proposal);
}

function proposeAdvisorCompensationPayoutMatches({ evidence, events = [] } = {}) {
  const validation = validateAdvisorCompensationPayoutEvidence(evidence);
  if (!validation.valid) fail("ADVISOR_COMPENSATION_PAYOUT_EVIDENCE_INVALID", validation.errors);
  const aggregates = eligibleAggregates(events, evidence.advisorReference);
  const proposals = evidence.lines.map((line) => proposalForLine(evidence, line, aggregates));
  return deepFreeze({
    contractVersion: "ADVISOR_COMPENSATION_PAYOUT_MATCH_SET_001",
    evidenceId: evidence.evidenceId,
    evidenceDigest: evidence.evidenceDigest,
    advisorReference: evidence.advisorReference,
    proposalCount: proposals.length,
    exactCount: proposals.filter((item) => item.status === PAYOUT_MATCH_STATUSES.EXACT).length,
    groupedCount: proposals.filter((item) => item.status === PAYOUT_MATCH_STATUSES.GROUPED).length,
    differenceCount: proposals.filter((item) => item.status === PAYOUT_MATCH_STATUSES.DIFFERENCE).length,
    ambiguousCount: proposals.filter((item) => item.status === PAYOUT_MATCH_STATUSES.AMBIGUOUS).length,
    unmatchedCount: proposals.filter((item) => item.status === PAYOUT_MATCH_STATUSES.UNMATCHED).length,
    proposals: proposals.map(clone),
    safeguards: {
      proposalsOnly: true,
      humanConfirmationRequired: true,
      paidTruthCreated: false,
      externalMutationAuthorized: false
    }
  });
}

module.exports = {
  PAYOUT_MATCH_CONTRACT_VERSION,
  PAYOUT_MATCH_STATUSES,
  PAYOUT_DIFFERENCE_TYPES,
  eligibleAggregates,
  proposalForLine,
  proposeAdvisorCompensationPayoutMatches
};
