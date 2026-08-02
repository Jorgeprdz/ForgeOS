const TYPES = Object.freeze({
  ACTION: "FIP_NASH_NEXT_BEST_ACTION",
  CONVERSATION: "FIP_NEXT_BEST_CONVERSATION",
  PREP: "FIP_CONVERSATION_PREP",
  MESSAGE: "FIP_CONTEXTUAL_MESSAGE_INSTRUCTION",
});

const CONFIDENCE = Object.freeze(["LOW", "MEDIUM", "HIGH", "INSUFFICIENT_EVIDENCE"]);
const CONVERSATION_TYPES = Object.freeze([
  "DISCOVERY", "FOLLOW_UP", "CLARIFICATION", "CLOSING", "RECOVERY",
  "ANNUAL_REVIEW", "RENEWAL", "REFERRAL", "COMPLEMENTARY_PROTECTION", "INFORMATION_UPDATE",
]);

class FipPack03ContractError extends TypeError {
  constructor(code, message, details = null) {
    super(message);
    this.name = "FipPack03ContractError";
    this.code = code;
    this.details = details;
  }
}

const fail = (code, message, details = null) => { throw new FipPack03ContractError(code, message, details); };
const obj = value => Boolean(value) && typeof value === "object" && !Array.isArray(value);
const text = (value, code, max = 800) => {
  const normalized = typeof value === "string" ? value.trim() : "";
  if (!normalized || normalized.length > max) fail(code, "Texto inválido.");
  return normalized;
};
const optional = (value, max = 800) => value === null || value === undefined || value === "" ? null : text(String(value), "FIP03_TEXT_INVALID", max);
const list = (value, mapper = item => item) => Array.isArray(value) ? value.map(mapper) : [];
const freeze = value => {
  if (!value || typeof value !== "object" || Object.isFrozen(value)) return value;
  Object.freeze(value); Object.values(value).forEach(freeze); return value;
};

const FORBIDDEN_KEYS = new Set([
  "sendNow", "automaticSend", "createTask", "createCalendarEvent", "advancePipeline",
  "createOpportunity", "createApplication", "createPolicy", "finalMessageApproved",
  "inventedIntent", "personalityTruth", "humanWorth", "manipulationDirective",
]);

function assertSafe(value, path = "output") {
  if (Array.isArray(value)) return value.forEach((item, index) => assertSafe(item, `${path}[${index}]`));
  if (!obj(value)) return;
  for (const [key, nested] of Object.entries(value)) {
    if (FORBIDDEN_KEYS.has(key)) fail("FIP03_FORBIDDEN_FIELD", "El contrato intenta ejecutar o inventar verdad.", { path: `${path}.${key}` });
    assertSafe(nested, `${path}.${key}`);
  }
}

function normalizeEvidence(input) {
  if (!obj(input)) fail("FIP03_EVIDENCE_INVALID", "La evidencia debe ser un objeto.");
  return freeze({
    reference: text(input.reference, "FIP03_EVIDENCE_REFERENCE_REQUIRED", 240),
    authority: text(input.authority, "FIP03_EVIDENCE_AUTHORITY_REQUIRED", 180),
    observedAt: optional(input.observedAt, 80),
    summary: optional(input.summary, 500),
  });
}

function normalizeConfidence(value) {
  const normalized = text(value || "INSUFFICIENT_EVIDENCE", "FIP03_CONFIDENCE_INVALID", 40).toUpperCase();
  if (!CONFIDENCE.includes(normalized)) fail("FIP03_CONFIDENCE_INVALID", "Confianza no permitida.");
  return normalized;
}

export function createNashRecommendation(input = {}) {
  if (!obj(input)) fail("FIP03_INPUT_INVALID", "La recomendación debe ser un objeto.");
  assertSafe(input);
  const evidence = list(input.evidence, normalizeEvidence);
  const confidence = normalizeConfidence(input.confidence);
  if (confidence !== "INSUFFICIENT_EVIDENCE" && evidence.length === 0) {
    fail("FIP03_EVIDENCE_REQUIRED", "Una recomendación con confianza requiere evidencia.");
  }
  return freeze({
    contractType: TYPES.ACTION,
    advisorReference: text(input.advisorReference, "FIP03_ADVISOR_REQUIRED", 240),
    personReference: text(input.personReference, "FIP03_PERSON_REQUIRED", 240),
    recommendedAction: text(input.recommendedAction, "FIP03_ACTION_REQUIRED", 500),
    whyThisPerson: text(input.whyThisPerson, "FIP03_WHY_PERSON_REQUIRED", 800),
    whyThisAction: text(input.whyThisAction, "FIP03_WHY_ACTION_REQUIRED", 800),
    whyNow: text(input.whyNow, "FIP03_WHY_NOW_REQUIRED", 800),
    expectedImpact: optional(input.expectedImpact, 500),
    confidence,
    limitations: list(input.limitations, item => text(item, "FIP03_LIMITATION_INVALID", 500)),
    evidence,
    alternatives: list(input.alternatives, item => text(item, "FIP03_ALTERNATIVE_INVALID", 500)),
    humanApprovalRequired: true,
    automaticExecutionAllowed: false,
  });
}

export function createNextBestConversation(input = {}) {
  if (!obj(input)) fail("FIP03_CONVERSATION_INVALID", "La conversación debe ser un objeto.");
  assertSafe(input);
  const type = text(input.conversationType, "FIP03_CONVERSATION_TYPE_REQUIRED", 60).toUpperCase();
  if (!CONVERSATION_TYPES.includes(type)) fail("FIP03_CONVERSATION_TYPE_INVALID", "Tipo de conversación no permitido.");
  return freeze({
    contractType: TYPES.CONVERSATION,
    conversationType: type,
    objective: text(input.objective, "FIP03_OBJECTIVE_REQUIRED", 500),
    openingAngle: text(input.openingAngle, "FIP03_OPENING_REQUIRED", 700),
    questions: list(input.questions, item => text(item, "FIP03_QUESTION_INVALID", 500)),
    objectionSupport: list(input.objectionSupport, item => text(item, "FIP03_OBJECTION_INVALID", 600)),
    avoidRepeating: list(input.avoidRepeating, item => text(item, "FIP03_AVOID_INVALID", 500)),
    desiredNextStep: text(input.desiredNextStep, "FIP03_NEXT_STEP_REQUIRED", 500),
    confidence: normalizeConfidence(input.confidence),
    humanJudgmentRequired: true,
  });
}

export function createConversationPrep(input = {}) {
  if (!obj(input)) fail("FIP03_PREP_INVALID", "La preparación debe ser un objeto.");
  assertSafe(input);
  return freeze({
    contractType: TYPES.PREP,
    personSummary: text(input.personSummary, "FIP03_PERSON_SUMMARY_REQUIRED", 1200),
    relationshipSummary: text(input.relationshipSummary, "FIP03_RELATIONSHIP_SUMMARY_REQUIRED", 1200),
    lastInteractions: list(input.lastInteractions, item => text(item, "FIP03_INTERACTION_INVALID", 700)),
    commitments: list(input.commitments, item => text(item, "FIP03_COMMITMENT_INVALID", 700)),
    objections: list(input.objections, item => text(item, "FIP03_OBJECTION_INVALID", 700)),
    questionsToAsk: list(input.questionsToAsk, item => text(item, "FIP03_QUESTION_INVALID", 500)),
    risksAndUnknowns: list(input.risksAndUnknowns, item => text(item, "FIP03_RISK_INVALID", 700)),
    sourceFreshness: optional(input.sourceFreshness, 120),
    readOnly: true,
  });
}

export function createContextualMessageInstruction(input = {}) {
  if (!obj(input)) fail("FIP03_MESSAGE_INVALID", "La instrucción debe ser un objeto.");
  assertSafe(input);
  return freeze({
    contractType: TYPES.MESSAGE,
    channel: text(input.channel || "WHATSAPP", "FIP03_CHANNEL_REQUIRED", 40).toUpperCase(),
    purpose: text(input.purpose, "FIP03_PURPOSE_REQUIRED", 400),
    contextToMention: list(input.contextToMention, item => text(item, "FIP03_CONTEXT_INVALID", 500)),
    tone: text(input.tone || "WARM_PROFESSIONAL", "FIP03_TONE_REQUIRED", 80),
    callToAction: text(input.callToAction, "FIP03_CTA_REQUIRED", 400),
    prohibitedClaims: list(input.prohibitedClaims, item => text(item, "FIP03_PROHIBITED_INVALID", 500)),
    finalDraftAllowed: false,
    sendAllowed: false,
    humanApprovalRequired: true,
  });
}

export { TYPES, CONFIDENCE, CONVERSATION_TYPES, FipPack03ContractError, assertSafe };
