"use strict";

const {
  clone,
  deepFreeze,
  createAdvisorCompensationPayoutEvidence
} = require("./advisor-compensation-payout-evidence-contract");
const {
  proposeAdvisorCompensationPayoutMatches
} = require("./advisor-compensation-payout-matcher");
const {
  createAdvisorCompensationPayoutConfirmation
} = require("./advisor-compensation-payout-confirmation");
const {
  promoteAdvisorCompensationEarnedToPaid,
  reconcileAdvisorCompensationPayout
} = require("./advisor-compensation-payout-reconciliation");

function fail(code) {
  const error = new Error(code);
  error.code = code;
  throw error;
}

function createAdvisorCompensationPayoutAuthority() {
  const evidenceById = new Map();
  const proposalById = new Map();
  const confirmationById = new Map();
  const payoutByLine = new Map();
  const payoutRecords = [];

  function intakeEvidence(input) {
    const evidence = input?.contractVersion
      ? input
      : createAdvisorCompensationPayoutEvidence(input);
    const existing = evidenceById.get(evidence.evidenceId);
    if (existing) {
      if (existing.evidenceDigest === evidence.evidenceDigest) {
        return deepFreeze({ status: "REPLAYED", evidence: clone(existing) });
      }
      fail("ADVISOR_COMPENSATION_PAYOUT_EVIDENCE_ID_CONFLICT");
    }
    evidenceById.set(evidence.evidenceId, evidence);
    return deepFreeze({ status: "APPENDED", evidence: clone(evidence) });
  }

  function proposeMatches({ evidenceId, events = [] } = {}) {
    const evidence = evidenceById.get(evidenceId);
    if (!evidence) fail("ADVISOR_COMPENSATION_PAYOUT_EVIDENCE_NOT_FOUND");
    const matchSet = proposeAdvisorCompensationPayoutMatches({ evidence, events });
    for (const proposal of matchSet.proposals) proposalById.set(proposal.proposalId, proposal);
    return matchSet;
  }

  function confirmMatch({ proposalId, ...input } = {}) {
    const proposal = proposalById.get(proposalId);
    if (!proposal) fail("ADVISOR_COMPENSATION_PAYOUT_PROPOSAL_NOT_FOUND");
    const confirmation = createAdvisorCompensationPayoutConfirmation({ ...input, proposal });
    const existing = confirmationById.get(confirmation.humanDecisionId);
    if (existing) {
      if (existing.confirmationDigest === confirmation.confirmationDigest) {
        return deepFreeze({ status: "REPLAYED", confirmation: clone(existing) });
      }
      fail("ADVISOR_COMPENSATION_PAYOUT_CONFIRMATION_ID_CONFLICT");
    }
    confirmationById.set(confirmation.humanDecisionId, confirmation);
    return deepFreeze({ status: "APPENDED", confirmation: clone(confirmation) });
  }

  function promotePaid({ evidenceId, proposalId, humanDecisionId, events = [], payoutRecordId = null } = {}) {
    const evidence = evidenceById.get(evidenceId);
    const proposal = proposalById.get(proposalId);
    const confirmation = confirmationById.get(humanDecisionId);
    if (!evidence) fail("ADVISOR_COMPENSATION_PAYOUT_EVIDENCE_NOT_FOUND");
    if (!proposal) fail("ADVISOR_COMPENSATION_PAYOUT_PROPOSAL_NOT_FOUND");
    if (!confirmation) fail("ADVISOR_COMPENSATION_PAYOUT_CONFIRMATION_NOT_FOUND");
    const lineKey = `${evidenceId}:${proposal.lineId}`;
    const promoted = promoteAdvisorCompensationEarnedToPaid({
      evidence,
      proposal,
      confirmation,
      events,
      payoutRecordId
    });
    const existing = payoutByLine.get(lineKey);
    if (existing) {
      if (existing.recordDigest === promoted.recordDigest) {
        return deepFreeze({ status: "REPLAYED", payoutRecord: clone(existing) });
      }
      fail("ADVISOR_COMPENSATION_PAYOUT_LINE_PROMOTION_CONFLICT");
    }
    payoutByLine.set(lineKey, promoted);
    payoutRecords.push(promoted);
    return deepFreeze({ status: "PROMOTED_PAID", payoutRecord: clone(promoted) });
  }

  function reconcile({ evidenceId, proposals = null, events = [], sourceState, asOf } = {}) {
    const evidence = evidenceById.get(evidenceId);
    if (!evidence) fail("ADVISOR_COMPENSATION_PAYOUT_EVIDENCE_NOT_FOUND");
    const selectedProposals = proposals || [...proposalById.values()].filter((item) => item.evidenceId === evidenceId);
    return reconcileAdvisorCompensationPayout({
      evidence,
      proposals: selectedProposals,
      payoutRecords,
      events,
      sourceState,
      asOf
    });
  }

  function listPayoutRecords(advisorReference) {
    return deepFreeze(payoutRecords.filter((item) => item.advisorReference === advisorReference).map(clone));
  }

  return Object.freeze({
    intakeEvidence,
    proposeMatches,
    confirmMatch,
    promotePaid,
    reconcile,
    listPayoutRecords,
    capabilities: Object.freeze({
      statementEvidenceIntake: true,
      officialStatementNormalization: true,
      controlledManualEvidence: true,
      proposedMatching: true,
      humanConfirmationRequired: true,
      paidPromotion: true,
      differenceReconciliation: true,
      appendOnly: true,
      automaticConfirmation: false,
      automaticPaidPromotion: false,
      remotePersistence: false,
      externalMutation: false
    })
  });
}

module.exports = {
  createAdvisorCompensationPayoutAuthority
};
