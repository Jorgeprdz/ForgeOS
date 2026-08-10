export const WHATSAPP_CONTEXT_VERSION = "FORGE_WHATSAPP_CONTEXT_ENVELOPE_001";
export const WHATSAPP_PLAN_VERSION = "FORGE_WHATSAPP_MESSAGE_PLAN_001";
export const WHATSAPP_BASE_VERSION = "FORGE_WHATSAPP_BASE_MESSAGE_001";

const clean = (value, max = 500) => typeof value === "string" ? value.trim().slice(0, max) : "";
const field = (value, source = "UNAVAILABLE", confirmed = false) => ({ value: clean(value), source, confirmed: Boolean(confirmed) });

export function createWhatsAppContextEnvelope(input = {}) {
  const person = input.person || {};
  const referral = input.referral || {};
  const advisor = input.advisor || {};
  const intent = input.commercialIntent || {};
  const envelope = {
    contract: WHATSAPP_CONTEXT_VERSION,
    person: {
      id: field(person.id, person.source, person.confirmed),
      name: field(person.name, person.source, person.confirmed),
      identity: field(person.identity, person.identitySource, person.identityConfirmed),
      occupation: field(person.occupation, person.occupationSource, person.occupationConfirmed),
      relationship: field(person.relationship, person.relationshipSource, person.relationshipConfirmed),
      stage: field(person.stage, person.stageSource, person.stageConfirmed),
      lastActivity: field(person.lastActivity, person.activitySource, person.activityConfirmed),
    },
    referral: {
      referrerName: field(referral.referrerName, referral.source, referral.confirmed),
      reason: field(referral.reason, referral.source, referral.reasonConfirmed),
      summary: field(referral.summary, referral.source, referral.summaryConfirmed),
      permissionToMention: Boolean(referral.permissionToMention),
    },
    advisor: {
      name: field(advisor.name, advisor.source, advisor.confirmed),
      profession: field(advisor.profession, advisor.source, advisor.confirmed),
      relevance: field(advisor.relevance, advisor.relevanceSource, advisor.relevanceConfirmed),
      valueStatement: field(advisor.valueStatement, advisor.valueSource, advisor.valueConfirmed),
    },
    helpHypothesis: {
      text: field(input.helpHypothesis?.text, input.helpHypothesis?.source, input.helpHypothesis?.confirmed),
      certainty: input.helpHypothesis?.confirmed ? "CONFIRMED" : "HYPOTHESIS",
    },
    commercialIntent: {
      type: clean(intent.type, 80),
      cta: clean(intent.cta, 300),
      tone: clean(intent.tone, 80) || "natural_directo",
    },
    prohibitedClaims: Array.isArray(input.prohibitedClaims) ? input.prohibitedClaims.map(v => clean(v, 200)).filter(Boolean) : [],
    sourceEvidence: Array.isArray(input.sourceEvidence) ? input.sourceEvidence : [],
    missingContext: [],
  };
  if (!envelope.person.name.value || !envelope.person.name.confirmed) envelope.missingContext.push("CONFIRMED_PERSON_NAME");
  if (!envelope.advisor.profession.value || !envelope.advisor.profession.confirmed) envelope.missingContext.push("CONFIRMED_ADVISOR_PROFESSION");
  if (!envelope.commercialIntent.cta) envelope.missingContext.push("LOCKED_CTA");
  if (envelope.referral.referrerName.value && !envelope.referral.permissionToMention) envelope.missingContext.push("REFERRER_MENTION_NOT_AUTHORIZED");
  if (envelope.referral.referrerName.value && !envelope.referral.reason.value) envelope.missingContext.push("REFERRAL_REASON");
  envelope.state = envelope.missingContext.some(v => ["CONFIRMED_PERSON_NAME", "CONFIRMED_ADVISOR_PROFESSION", "LOCKED_CTA"].includes(v)) ? "BLOCKED" : envelope.missingContext.length ? "PARTIAL" : "READY";
  return Object.freeze(envelope);
}

export function planWhatsAppMessage(envelope) {
  if (!envelope || envelope.contract !== WHATSAPP_CONTEXT_VERSION) throw new Error("INVALID_WHATSAPP_CONTEXT");
  if (envelope.state === "BLOCKED") return { contract: WHATSAPP_PLAN_VERSION, state: "BLOCKED", blocks: [], reasons: envelope.missingContext };
  const blocks = [];
  blocks.push({ type: "GREETING", state: "INCLUDED", value: `Hola, ${envelope.person.name.value}.` });
  if (envelope.referral.referrerName.value && envelope.referral.permissionToMention && envelope.referral.reason.value) {
    blocks.push({ type: "IDENTITY_BRIDGE", state: "INCLUDED", value: `${envelope.referral.referrerName.value} me compartió tu contacto.` });
    blocks.push({ type: "REFERRAL_REASON", state: "INCLUDED", value: `Me comentó que ${envelope.referral.reason.value}.` });
  } else {
    blocks.push({ type: "IDENTITY_BRIDGE", state: "OMITTED", reason: "NO_GOVERNED_REFERRAL_CONTEXT" });
  }
  blocks.push({ type: "ADVISOR_RELEVANCE", state: "INCLUDED", value: `Me dedico a ${envelope.advisor.profession.value}.` });
  const help = envelope.advisor.valueStatement.value || envelope.helpHypothesis.text.value;
  if (help) {
    const prefix = envelope.helpHypothesis.certainty === "HYPOTHESIS" && !envelope.advisor.valueStatement.value ? "Creo que podría ayudarte a" : "Puedo ayudarte a";
    blocks.push({ type: "HELP_VALUE", state: "INCLUDED", value: `${prefix} ${help}.` });
  }
  blocks.push({ type: "CTA", state: "INCLUDED", value: envelope.commercialIntent.cta, locked: true });
  return Object.freeze({ contract: WHATSAPP_PLAN_VERSION, state: "READY", blocks });
}

export function renderWhatsAppBaseMessage(plan) {
  if (!plan || plan.contract !== WHATSAPP_PLAN_VERSION || plan.state !== "READY") throw new Error("WHATSAPP_PLAN_NOT_READY");
  const text = plan.blocks.filter(block => block.state === "INCLUDED").map(block => block.value).join(" ").replace(/\s+/g, " ").trim();
  const cta = plan.blocks.find(block => block.type === "CTA")?.value || "";
  return Object.freeze({ contract: WHATSAPP_BASE_VERSION, text, cta, requiresHumanReview: true });
}

const tokenSet = value => new Set((clean(value, 5000).match(/[\p{L}\p{N}][\p{L}\p{N}.-]*/gu) || []).map(v => v.toLocaleLowerCase("es-MX")));
const protectedEntities = value => (clean(value, 5000).match(/(?:\b[A-ZÁÉÍÓÚÑ][\p{L}.-]+(?:\s+[A-ZÁÉÍÓÚÑ][\p{L}.-]+)*)|(?:\b\d+(?:[.,]\d+)?\b)/gu) || [];

export function validateHumanizedMessage({ baseMessage, humanizedMessage, prohibitedClaims = [] } = {}) {
  const base = clean(baseMessage, 5000);
  const candidate = clean(humanizedMessage, 5000);
  if (!base || !candidate) return { state: "REJECT_EMPTY", safeText: base };
  const baseTokens = tokenSet(base);
  const candidateEntities = protectedEntities(candidate);
  const newEntities = candidateEntities.filter(entity => !base.toLocaleLowerCase("es-MX").includes(entity.toLocaleLowerCase("es-MX")));
  if (newEntities.length) return { state: "REJECT_ENTITY_MUTATION", newEntities, safeText: base };
  const claim = prohibitedClaims.find(item => candidate.toLocaleLowerCase("es-MX").includes(clean(item).toLocaleLowerCase("es-MX")));
  if (claim) return { state: "REJECT_UNSUPPORTED_PROMISE", claim, safeText: base };
  const candidateTokens = tokenSet(candidate);
  const novelty = [...candidateTokens].filter(token => token.length > 5 && !baseTokens.has(token));
  if (novelty.length > 8) return { state: "REJECT_NEW_FACT", novelty, safeText: base };
  return { state: "PASS", safeText: candidate };
}
