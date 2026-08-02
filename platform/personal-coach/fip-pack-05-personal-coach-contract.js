const CONTRACT_TYPE = "FORGE_PERSONAL_COACH_PACKET";
const CONTRACT_VERSION = "FIP-PACK-05-001";

const CONFIDENCE = Object.freeze(["LOW", "MEDIUM", "HIGH", "INSUFFICIENT_EVIDENCE"]);
const EXPERIMENT_STATUS = Object.freeze(["PLANNED", "ACTIVE", "COMPLETED", "CANCELLED"]);
const PLAY_STATUS = Object.freeze(["CANDIDATE", "PROMISING", "SUPPORTED", "RETIRED"]);

const forbiddenKeys = new Set([
  "personalityTruth", "humanWorth", "advisorRank", "disciplineScore", "motivationScore",
  "coachabilityScore", "punishment", "hrDecision", "automaticMessage", "automaticTask",
  "automaticCalendar", "automaticPipelineAdvance", "guaranteedGrowth", "causalProof"
]);

class FipPack05ContractError extends TypeError {
  constructor(code, message) {
    super(message);
    this.name = "FipPack05ContractError";
    this.code = code;
  }
}

const fail = (code, message) => { throw new FipPack05ContractError(code, message); };
const object = value => Boolean(value) && typeof value === "object" && !Array.isArray(value);
const text = (value, code, max = 500) => {
  const normalized = typeof value === "string" ? value.trim() : "";
  if (!normalized || normalized.length > max) fail(code, "Texto inválido.");
  return normalized;
};
const optionalText = (value, max = 1000) => value == null || value === "" ? null : text(String(value), "FIP05_TEXT_INVALID", max);
const list = value => Array.isArray(value) ? value : [];
const number = (value, fallback = 0) => Number.isFinite(Number(value)) ? Number(value) : fallback;
const isoDate = value => {
  const normalized = text(value, "FIP05_DATE_REQUIRED", 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(normalized)) fail("FIP05_DATE_INVALID", "Fecha inválida.");
  return normalized;
};
const freeze = value => {
  if (!value || typeof value !== "object" || Object.isFrozen(value)) return value;
  Object.freeze(value);
  Object.values(value).forEach(freeze);
  return value;
};
function assertNoForbidden(value, path = "packet") {
  if (Array.isArray(value)) return value.forEach((item, i) => assertNoForbidden(item, `${path}[${i}]`));
  if (!object(value)) return;
  Object.entries(value).forEach(([key, nested]) => {
    if (forbiddenKeys.has(key)) fail("FIP05_FORBIDDEN_FIELD", `Campo prohibido: ${path}.${key}`);
    assertNoForbidden(nested, `${path}.${key}`);
  });
}

const normalizeEvidence = evidence => freeze(list(evidence).map((item, index) => ({
  reference: text(item?.reference || `evidence-${index + 1}`, "FIP05_EVIDENCE_REFERENCE"),
  summary: text(item?.summary, "FIP05_EVIDENCE_SUMMARY", 700),
  sourceOwner: text(item?.sourceOwner, "FIP05_EVIDENCE_OWNER", 180),
  observedAt: optionalText(item?.observedAt, 80),
})));

export function createPersonalCoachPacket(input = {}) {
  if (!object(input)) fail("FIP05_PACKET_INVALID", "El packet debe ser un objeto.");
  assertNoForbidden(input);

  const weeklyIntent = freeze({
    weekStart: isoDate(input.weeklyIntent?.weekStart),
    primaryOutcome: text(input.weeklyIntent?.primaryOutcome, "FIP05_PRIMARY_OUTCOME", 500),
    productFocus: optionalText(input.weeklyIntent?.productFocus, 180),
    marketFocus: optionalText(input.weeklyIntent?.marketFocus, 180),
    availableMinutes: Math.max(0, number(input.weeklyIntent?.availableMinutes)),
    constraints: freeze(list(input.weeklyIntent?.constraints).map(item => text(item, "FIP05_CONSTRAINT", 240))),
  });

  const weeklyPlan = freeze({
    priorities: freeze(list(input.weeklyPlan?.priorities).slice(0, 3).map((item, index) => ({
      rank: index + 1,
      objective: text(item?.objective, "FIP05_PRIORITY_OBJECTIVE", 400),
      actionTarget: Math.max(0, number(item?.actionTarget)),
      metric: text(item?.metric, "FIP05_PRIORITY_METRIC", 180),
      reasonWhy: text(item?.reasonWhy, "FIP05_PRIORITY_REASON", 700),
      evidenceRefs: freeze(list(item?.evidenceRefs).map(ref => text(ref, "FIP05_PRIORITY_EVIDENCE", 240))),
    })),
    attentionBudgetRespected: input.weeklyPlan?.attentionBudgetRespected === true,
  });

  const journal = freeze(list(input.journal).map(entry => ({
    date: isoDate(entry?.date),
    observation: text(entry?.observation, "FIP05_JOURNAL_OBSERVATION", 1200),
    advisorInterpretation: optionalText(entry?.advisorInterpretation, 1200),
    treatedAsTruth: false,
  })));

  const experiments = freeze(list(input.experiments).map(item => {
    const status = text(item?.status || "PLANNED", "FIP05_EXPERIMENT_STATUS", 40).toUpperCase();
    if (!EXPERIMENT_STATUS.includes(status)) fail("FIP05_EXPERIMENT_STATUS_INVALID", "Estado de experimento inválido.");
    return freeze({
      reference: text(item?.reference, "FIP05_EXPERIMENT_REFERENCE", 180),
      hypothesis: text(item?.hypothesis, "FIP05_EXPERIMENT_HYPOTHESIS", 700),
      action: text(item?.action, "FIP05_EXPERIMENT_ACTION", 700),
      sampleTarget: Math.max(1, number(item?.sampleTarget, 1)),
      durationDays: Math.max(1, number(item?.durationDays, 1)),
      metric: text(item?.metric, "FIP05_EXPERIMENT_METRIC", 180),
      expectedResult: optionalText(item?.expectedResult, 500),
      observedResult: optionalText(item?.observedResult, 500),
      conclusion: optionalText(item?.conclusion, 700),
      status,
      causalProof: false,
    });
  }));

  const playbook = freeze(list(input.playbook).map(item => {
    const status = text(item?.status || "CANDIDATE", "FIP05_PLAY_STATUS", 40).toUpperCase();
    if (!PLAY_STATUS.includes(status)) fail("FIP05_PLAY_STATUS_INVALID", "Estado de jugada inválido.");
    const sampleSize = Math.max(0, number(item?.sampleSize));
    const confidence = text(item?.confidence || "INSUFFICIENT_EVIDENCE", "FIP05_CONFIDENCE", 40).toUpperCase();
    if (!CONFIDENCE.includes(confidence)) fail("FIP05_CONFIDENCE_INVALID", "Confianza inválida.");
    return freeze({
      reference: text(item?.reference, "FIP05_PLAY_REFERENCE", 180),
      situation: text(item?.situation, "FIP05_PLAY_SITUATION", 500),
      play: text(item?.play, "FIP05_PLAY", 700),
      sampleSize,
      advancedCount: Math.max(0, number(item?.advancedCount)),
      confidence: sampleSize < 5 ? "INSUFFICIENT_EVIDENCE" : confidence,
      status: sampleSize < 5 ? "CANDIDATE" : status,
      limitations: optionalText(item?.limitations, 500),
    });
  }));

  const opportunityRadar = freeze(list(input.opportunityRadar).map(item => ({
    reference: text(item?.reference, "FIP05_RADAR_REFERENCE", 180),
    observation: text(item?.observation, "FIP05_RADAR_OBSERVATION", 700),
    opportunity: text(item?.opportunity, "FIP05_RADAR_OPPORTUNITY", 700),
    confidence: CONFIDENCE.includes(String(item?.confidence || "").toUpperCase()) ? String(item.confidence).toUpperCase() : "INSUFFICIENT_EVIDENCE",
    recommendedExperiment: optionalText(item?.recommendedExperiment, 700),
    evidenceRefs: freeze(list(item?.evidenceRefs).map(ref => text(ref, "FIP05_RADAR_EVIDENCE", 240))),
  })));

  const coaching = freeze({
    whatWorked: freeze(list(input.coaching?.whatWorked).map(item => text(item, "FIP05_COACH_WORKED", 700))),
    whatDidNotWork: freeze(list(input.coaching?.whatDidNotWork).map(item => text(item, "FIP05_COACH_NOT_WORKED", 700))),
    repeat: freeze(list(input.coaching?.repeat).map(item => text(item, "FIP05_COACH_REPEAT", 700))),
    adjust: freeze(list(input.coaching?.adjust).map(item => text(item, "FIP05_COACH_ADJUST", 700))),
    stop: freeze(list(input.coaching?.stop).map(item => text(item, "FIP05_COACH_STOP", 700))),
    nextExperiment: optionalText(input.coaching?.nextExperiment, 700),
    comparisonBasis: "ADVISOR_OWN_HISTORY_FIRST",
  });

  const weeklyReview = freeze({
    whatHappened: text(input.weeklyReview?.whatHappened, "FIP05_REVIEW_HAPPENED", 1200),
    whatWorked: text(input.weeklyReview?.whatWorked, "FIP05_REVIEW_WORKED", 1200),
    whatDidNotWork: text(input.weeklyReview?.whatDidNotWork, "FIP05_REVIEW_NOT_WORKED", 1200),
    lostOpportunities: optionalText(input.weeklyReview?.lostOpportunities, 1200),
    mickPatterns: freeze(list(input.weeklyReview?.mickPatterns).map(item => text(item, "FIP05_REVIEW_MICK", 700))),
    nashResults: freeze(list(input.weeklyReview?.nashResults).map(item => text(item, "FIP05_REVIEW_NASH", 700))),
    lessons: freeze(list(input.weeklyReview?.lessons).map(item => text(item, "FIP05_REVIEW_LESSON", 700))),
    nextWeekAdjustments: freeze(list(input.weeklyReview?.nextWeekAdjustments).slice(0, 3).map(item => text(item, "FIP05_REVIEW_ADJUSTMENT", 700))),
  });

  return freeze({
    contractType: CONTRACT_TYPE,
    contractVersion: CONTRACT_VERSION,
    advisorReference: text(input.advisorReference, "FIP05_ADVISOR_REFERENCE", 240),
    weeklyIntent,
    weeklyPlan,
    journal,
    experiments,
    playbook,
    opportunityRadar,
    coaching,
    weeklyReview,
    evidence: normalizeEvidence(input.evidence),
    readOnlyRecommendation: true,
    humanApprovalRequired: true,
    boundaries: freeze({
      journalAsTruth: false,
      correlationAsCausation: false,
      guaranteedGrowth: false,
      personalityTruth: false,
      humanWorth: false,
      advisorRanking: false,
      surveillance: false,
      punishment: false,
      hrDecision: false,
      automaticMessage: false,
      automaticTask: false,
      automaticCalendar: false,
      automaticPipelineAdvance: false,
      automaticEnforcement: false,
    }),
  });
}

export { CONTRACT_TYPE, CONTRACT_VERSION, CONFIDENCE, EXPERIMENT_STATUS, PLAY_STATUS, FipPack05ContractError };
