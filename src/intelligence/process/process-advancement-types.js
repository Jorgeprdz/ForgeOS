/**
 * ============================================================
 * PROCESS ADVANCEMENT TYPES
 * ADR-0019 — Process Advancement Intelligence
 * ============================================================
 */

const EVALUATED_ACTORS = Object.freeze({
  ADVISOR: "advisor",
  PROSPECT: "prospect",
  CLIENT: "client",
  REFERRER: "referrer",
  MANAGER: "manager",
  CARRIER: "carrier",
  UNDERWRITER: "underwriter",
  SYSTEM: "system",
  EXTERNAL_EVENT: "external_event",
  THIRD_PARTY: "third_party"
});

const DEPENDENCY_TYPES = Object.freeze({
  DECISION: "decision",
  DOCUMENTS: "documents",
  AVAILABILITY: "availability",
  OBJECTION: "objection",
  UNDERWRITING: "underwriting",
  APPROVAL: "approval",
  REFERRAL_CONTACT: "referral_contact",
  TIMING: "timing",
  PAYMENT: "payment",
  NETWORK_DISCOVERY: "network_discovery",
  MEDICAL_REQUIREMENT: "medical_requirement",
  PROPOSAL_DELIVERY: "proposal_delivery",
  EVIDENCE_VALIDATION: "evidence_validation",
  OTHER: "other"
});

const DEPENDENCY_STATUS = Object.freeze({
  ACTIVE: "active",
  RESOLVED: "resolved",
  BLOCKED: "blocked",
  MISSED: "missed",
  UNKNOWN: "unknown"
});

const CONFIDENCE_LEVELS = Object.freeze({
  HIGH: "high",
  MEDIUM: "medium",
  LOW: "low"
});

const COMMITMENT_STATES = Object.freeze({
  NONE: "none",
  ACTIVE: "active",
  MISSED: "missed",
  COMPLETED: "completed",
  EXPIRED: "expired",
  UNKNOWN: "unknown"
});

const COMMITMENT_QUALITY = Object.freeze({
  SPECIFIC: "specific",
  VAGUE: "vague",
  PASSIVE: "passive",
  MUTUAL: "mutual",
  ONE_SIDED: "one_sided",
  NEGATIVE: "negative",
  OPEN_LOOP: "open_loop",
  UNKNOWN: "unknown"
});

const PERMISSION_SIGNALS = Object.freeze({
  ALLOWED: "allowed",
  LIMITED: "limited",
  DENIED_TEMPORARILY: "denied_temporarily",
  DENIED_PERMANENTLY: "denied_permanently",
  UNKNOWN: "unknown"
});

const RISK_LEVELS = Object.freeze({
  LOW: "low",
  MEDIUM: "medium",
  HIGH: "high"
});

const PROCESS_MOVES = Object.freeze({
  GENERATE_AGREEMENT: "generate_agreement",
  HONOR_COMMITMENT: "honor_commitment",
  UNBLOCK_DEPENDENCY: "unblock_dependency",
  RESOLVE_BLOCKER: "resolve_blocker",
  REVALIDATE_PERMISSION: "revalidate_permission",
  WAIT_ON_DEPENDENCY: "wait_on_dependency",
  CLOSE_PROCESS: "close_process",
  NO_ACTION_REQUIRED: "no_action_required",
  HUMAN_REVIEW: "human_review"
});

module.exports = {
  EVALUATED_ACTORS,
  DEPENDENCY_TYPES,
  DEPENDENCY_STATUS,
  CONFIDENCE_LEVELS,
  COMMITMENT_STATES,
  COMMITMENT_QUALITY,
  PERMISSION_SIGNALS,
  RISK_LEVELS,
  PROCESS_MOVES
};
