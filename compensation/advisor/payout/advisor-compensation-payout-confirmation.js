"use strict";

const {
  clone,
  deepFreeze,
  sha256
} = require("./advisor-compensation-payout-evidence-contract");
const {
  PAYOUT_MATCH_CONTRACT_VERSION
} = require("./advisor-compensation-payout-matcher");

const PAYOUT_CONFIRMATION_CONTRACT_VERSION = "ADVISOR_COMPENSATION_PAYOUT_CONFIRMATION_001";
const PAYOUT_CONFIRMATION_DECISIONS = Object.freeze({
  CONFIRMED: "CONFIRMED",
  REJECTED: "REJECTED"
});

function fail(code) {
  const error = new Error(code);
  error.code = code;
  throw error;
}
function present(value) {
  return value !== undefined && value !== null && String(value).trim() !== "";
}
function required(value, code) {
  if (!present(value)) fail(code);
  return String(value).trim();
}

function createAdvisorCompensationPayoutConfirmation(input = {}) {
  const proposal = input.proposal;
  if (!proposal || proposal.contractVersion !== PAYOUT_MATCH_CONTRACT_VERSION) {
    fail("ADVISOR_COMPENSATION_PAYOUT_CONFIRMATION_PROPOSAL_INVALID");
  }
  const decision = required(
    input.decision,
    "ADVISOR_COMPENSATION_PAYOUT_CONFIRMATION_DECISION_REQUIRED"
  ).toUpperCase();
  if (!Object.values(PAYOUT_CONFIRMATION_DECISIONS).includes(decision)) {
    fail("ADVISOR_COMPENSATION_PAYOUT_CONFIRMATION_DECISION_INVALID");
  }
  const decidedAt = required(
    input.decidedAt,
    "ADVISOR_COMPENSATION_PAYOUT_CONFIRMATION_DATE_REQUIRED"
  );
  if (!decidedAt.includes("T") || !Number.isFinite(Date.parse(decidedAt))) {
    fail("ADVISOR_COMPENSATION_PAYOUT_CONFIRMATION_DATE_INVALID");
  }
  const confirmation = {
    contractVersion: PAYOUT_CONFIRMATION_CONTRACT_VERSION,
    humanDecisionId: required(
      input.humanDecisionId,
      "ADVISOR_COMPENSATION_PAYOUT_CONFIRMATION_ID_REQUIRED"
    ),
    advisorReference: proposal.advisorReference,
    proposalId: proposal.proposalId,
    proposalDigest: proposal.proposalDigest,
    evidenceId: proposal.evidenceId,
    lineId: proposal.lineId,
    decision,
    actorId: required(input.actorId, "ADVISOR_COMPENSATION_PAYOUT_CONFIRMATION_ACTOR_REQUIRED"),
    reason: required(input.reason, "ADVISOR_COMPENSATION_PAYOUT_CONFIRMATION_REASON_REQUIRED"),
    decidedAt,
    selectedCompensationEventIds: Object.freeze([
      ...new Set((input.selectedCompensationEventIds || proposal.matchedCompensationEventIds || [])
        .filter(present).map((item) => String(item).trim()))
    ]),
    metadata: clone(input.metadata || {}),
    safeguards: {
      humanDecision: true,
      automaticConfirmation: false,
      automaticPaidPromotion: false,
      externalMutationAuthorized: false
    }
  };
  if (decision === PAYOUT_CONFIRMATION_DECISIONS.CONFIRMED &&
      confirmation.selectedCompensationEventIds.length === 0) {
    fail("ADVISOR_COMPENSATION_PAYOUT_CONFIRMATION_MATCH_REQUIRED");
  }
  confirmation.confirmationDigest = sha256(confirmation);
  return deepFreeze(confirmation);
}

function validateAdvisorCompensationPayoutConfirmation(confirmation, proposal = null) {
  const errors = [];
  if (!confirmation || typeof confirmation !== "object") {
    return deepFreeze({ valid: false, errors: ["confirmation_missing"] });
  }
  if (confirmation.contractVersion !== PAYOUT_CONFIRMATION_CONTRACT_VERSION) {
    errors.push("confirmation_contract_invalid");
  }
  if (!Object.values(PAYOUT_CONFIRMATION_DECISIONS).includes(confirmation.decision)) {
    errors.push("confirmation_decision_invalid");
  }
  if (!/^[a-f0-9]{64}$/.test(confirmation.confirmationDigest || "")) {
    errors.push("confirmation_digest_invalid");
  }
  if (confirmation.safeguards?.humanDecision !== true) errors.push("human_decision_required");
  if (confirmation.safeguards?.automaticConfirmation !== false) errors.push("automatic_confirmation_must_be_false");
  if (proposal) {
    if (confirmation.proposalId !== proposal.proposalId) errors.push("confirmation_proposal_id_mismatch");
    if (confirmation.proposalDigest !== proposal.proposalDigest) errors.push("confirmation_proposal_digest_mismatch");
    if (confirmation.advisorReference !== proposal.advisorReference) errors.push("confirmation_owner_mismatch");
  }
  return deepFreeze({ valid: errors.length === 0, errors });
}

module.exports = {
  PAYOUT_CONFIRMATION_CONTRACT_VERSION,
  PAYOUT_CONFIRMATION_DECISIONS,
  createAdvisorCompensationPayoutConfirmation,
  validateAdvisorCompensationPayoutConfirmation
};
