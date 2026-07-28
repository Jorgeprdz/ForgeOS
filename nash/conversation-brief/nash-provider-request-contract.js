"use strict";

const PROVIDER_REQUEST_VERSION = "NFAST-05.1";
const SUPPORTED_PROVIDERS = Object.freeze(["deterministic", "gemini", "openai"]);
const SUPPORTED_BRIEF_BUILDER_VERSIONS = Object.freeze(["NFAST-04.1"]);

const REQUEST_OUTCOMES = Object.freeze({
  VALID: "VALID",
  INVALID_REQUEST: "INVALID_REQUEST",
  BLOCKED_BRIEF: "BLOCKED_BRIEF"
});

const ALLOWED_REQUEST_KEYS = Object.freeze([
  "requestVersion",
  "providerId",
  "conversationBrief",
  "requestMetadata"
]);

const ALLOWED_METADATA_KEYS = Object.freeze([
  "requestId",
  "correlationId",
  "locale",
  "renderingVariation",
  "timeoutMs",
  "clientVersion",
  "requestVersion"
]);

const PROHIBITED_KEYS = Object.freeze([
  "pipeline",
  "pipelineObject",
  "rawPipeline",
  "productivePipeline",
  "prospectMessageContext",
  "fullUniversalContext",
  "universalContext",
  "rawUniversalContext",
  "rawNotes",
  "notes",
  "transcript",
  "transcripts",
  "freeText",
  "product",
  "productObject",
  "quote",
  "quoteObject",
  "strategyInstructions",
  "executionCommand",
  "toolDirective",
  "hiddenInstruction"
]);

const INJECTION_PATTERNS = Object.freeze([
  /ignore\s+(all\s+)?(previous|prior)\s+instructions/i,
  /system\s+prompt/i,
  /developer\s+message/i,
  /hidden\s+(role|instruction)/i,
  /<script[\s>]/i,
  /onerror\s*=/i,
  /tool[_ -]?use/i,
  /call\s+(the\s+)?(provider|gemini|api|tool)/i,
  /execute\s+(this|command|action)/i,
  /send\s+(this|message|whatsapp)/i,
  /open\s+whatsapp/i,
  /bypass\s+human\s+approval/i,
  /approved\s*[:=]\s*true/i
]);

function isObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function asArray(value) {
  if (value === undefined || value === null) return [];
  return Array.isArray(value) ? value : [value];
}

function unique(values) {
  return [...new Set(asArray(values).flatMap((value) => asArray(value)).filter((value) => value !== undefined && value !== null && value !== ""))];
}

function normalizeProvider(providerId) {
  return String(providerId || "deterministic").trim().toLowerCase();
}

function collectProhibitedKeys(value, path = "request", findings = []) {
  if (!isObject(value) && !Array.isArray(value)) return findings;
  const entries = Array.isArray(value) ? value.map((item, index) => [String(index), item]) : Object.entries(value);
  for (const [key, item] of entries) {
    const nextPath = Array.isArray(value) ? `${path}[${key}]` : `${path}.${key}`;
    if (PROHIBITED_KEYS.includes(key)) findings.push(nextPath);
    collectProhibitedKeys(item, nextPath, findings);
  }
  return findings;
}

function collectInjectionIndicators(value, path = "request", findings = []) {
  if (typeof value === "string") {
    for (const pattern of INJECTION_PATTERNS) {
      if (pattern.test(value)) findings.push({ path, indicator: pattern.source });
    }
    return findings;
  }
  if (Array.isArray(value)) {
    value.forEach((item, index) => collectInjectionIndicators(item, `${path}[${index}]`, findings));
    return findings;
  }
  if (isObject(value)) {
    Object.entries(value).forEach(([key, item]) => collectInjectionIndicators(item, `${path}.${key}`, findings));
  }
  return findings;
}

function invalid(outcome, code, message, details = {}) {
  return Object.freeze({
    valid: false,
    outcome,
    code,
    message,
    retryable: false,
    providerAllowed: false,
    blockedFields: unique(details.blockedFields),
    unsupportedFields: unique(details.unsupportedFields),
    missingRequirements: unique(details.missingRequirements),
    promptInjectionIndicators: details.promptInjectionIndicators || []
  });
}

function validateConversationBrief(brief) {
  if (!isObject(brief)) {
    return invalid(REQUEST_OUTCOMES.INVALID_REQUEST, "MISSING_CONVERSATION_BRIEF", "conversationBrief must be an object.", {
      missingRequirements: ["conversationBrief"]
    });
  }

  const prohibitedFields = collectProhibitedKeys(brief, "conversationBrief");
  if (prohibitedFields.length > 0) {
    return invalid(REQUEST_OUTCOMES.INVALID_REQUEST, "PROHIBITED_RAW_CONTEXT", "conversationBrief contains prohibited raw context fields.", {
      blockedFields: prohibitedFields
    });
  }

  const indicators = unique([
    brief.safety && brief.safety.promptInjectionIndicators,
    collectInjectionIndicators(brief, "conversationBrief")
  ]);
  if (indicators.length > 0) {
    return invalid(REQUEST_OUTCOMES.BLOCKED_BRIEF, "PROMPT_INJECTION_INDICATOR", "conversationBrief contains prompt-injection indicators.", {
      promptInjectionIndicators: indicators
    });
  }

  if (brief.status !== "SUCCESS") {
    return invalid(REQUEST_OUTCOMES.BLOCKED_BRIEF, "BRIEF_NOT_SUCCESS", "Only SUCCESS deterministic conversation briefs may reach a provider.");
  }
  if (brief.providerAllowed !== true) {
    return invalid(REQUEST_OUTCOMES.BLOCKED_BRIEF, "PROVIDER_NOT_ALLOWED_BY_BRIEF", "conversationBrief.providerAllowed must be true.");
  }
  if (brief.humanApprovalRequired !== true || !brief.safety || brief.safety.humanApprovalRequired !== true) {
    return invalid(REQUEST_OUTCOMES.INVALID_REQUEST, "HUMAN_APPROVAL_REQUIRED", "conversationBrief must preserve humanApprovalRequired=true.");
  }
  if (brief.draftGenerated !== false || brief.providerInvoked !== false) {
    return invalid(REQUEST_OUTCOMES.BLOCKED_BRIEF, "BRIEF_ALREADY_USED", "conversationBrief must not have draftGenerated or providerInvoked before provider execution.");
  }
  if (!SUPPORTED_BRIEF_BUILDER_VERSIONS.includes(brief.version)) {
    return invalid(REQUEST_OUTCOMES.INVALID_REQUEST, "INVALID_BRIEF_BUILDER_VERSION", "conversationBrief version is not supported.");
  }
  if (!brief.lineage || brief.lineage.projectionType !== "CONVERSATION_CONTEXT") {
    return invalid(REQUEST_OUTCOMES.INVALID_REQUEST, "INVALID_PROJECTION_TYPE", "conversationBrief lineage must identify CONVERSATION_CONTEXT.");
  }
  if (!brief.lineage.deterministicBuilderVersion || !SUPPORTED_BRIEF_BUILDER_VERSIONS.includes(brief.lineage.deterministicBuilderVersion)) {
    return invalid(REQUEST_OUTCOMES.INVALID_REQUEST, "INVALID_BRIEF_BUILDER_VERSION", "conversationBrief lineage builder version is not supported.");
  }
  if (
    !Array.isArray(brief.lineage.sourceEvidenceIds) ||
    brief.lineage.sourceEvidenceIds.length === 0 ||
    !Array.isArray(brief.lineage.sourceOwners) ||
    brief.lineage.sourceOwners.length === 0 ||
    !brief.lineage.sourceContextVersion
  ) {
    return invalid(REQUEST_OUTCOMES.INVALID_REQUEST, "MISSING_LINEAGE", "conversationBrief must include governed lineage.");
  }
  if (brief.sourceContext && Array.isArray(brief.sourceContext.blockedContext) && brief.sourceContext.blockedContext.length > 0) {
    return invalid(REQUEST_OUTCOMES.BLOCKED_BRIEF, "BLOCKED_BRIEF", "conversationBrief contains blocked context.", {
      blockedFields: brief.sourceContext.blockedContext
    });
  }

  return Object.freeze({ valid: true, outcome: REQUEST_OUTCOMES.VALID });
}

function validateProviderDraftRequest(request) {
  if (!isObject(request)) {
    return invalid(REQUEST_OUTCOMES.INVALID_REQUEST, "REQUEST_INVALID", "Provider request must be an object.");
  }

  const unsupportedFields = Object.keys(request).filter((key) => !ALLOWED_REQUEST_KEYS.includes(key));
  if (unsupportedFields.length > 0) {
    return invalid(REQUEST_OUTCOMES.INVALID_REQUEST, "UNSUPPORTED_TOP_LEVEL_FIELD", "Provider request contains unsupported top-level fields.", {
      unsupportedFields
    });
  }

  const providerId = normalizeProvider(request.providerId);
  if (!SUPPORTED_PROVIDERS.includes(providerId)) {
    return invalid(REQUEST_OUTCOMES.INVALID_REQUEST, "UNKNOWN_PROVIDER_ERROR", "Provider selection is not supported.");
  }

  if (request.requestVersion !== PROVIDER_REQUEST_VERSION) {
    return invalid(REQUEST_OUTCOMES.INVALID_REQUEST, "INVALID_REQUEST_VERSION", "Provider requestVersion is not supported.");
  }

  const metadata = request.requestMetadata || {};
  if (!isObject(metadata)) {
    return invalid(REQUEST_OUTCOMES.INVALID_REQUEST, "REQUEST_METADATA_INVALID", "requestMetadata must be an object when supplied.");
  }
  const unsupportedMetadata = Object.keys(metadata).filter((key) => !ALLOWED_METADATA_KEYS.includes(key));
  if (unsupportedMetadata.length > 0) {
    return invalid(REQUEST_OUTCOMES.INVALID_REQUEST, "UNSUPPORTED_METADATA_FIELD", "requestMetadata contains unsupported fields.", {
      unsupportedFields: unsupportedMetadata.map((key) => `requestMetadata.${key}`)
    });
  }

  const prohibitedFields = collectProhibitedKeys(request, "request");
  if (prohibitedFields.length > 0) {
    return invalid(REQUEST_OUTCOMES.INVALID_REQUEST, "PROHIBITED_RAW_CONTEXT", "Provider request contains prohibited raw context fields.", {
      blockedFields: prohibitedFields
    });
  }

  const injectionIndicators = collectInjectionIndicators(metadata, "request.requestMetadata");
  if (injectionIndicators.length > 0) {
    return invalid(REQUEST_OUTCOMES.BLOCKED_BRIEF, "EXECUTION_COMMAND_REJECTED", "Provider request metadata contains execution instructions.", {
      promptInjectionIndicators: injectionIndicators
    });
  }

  const briefValidation = validateConversationBrief(request.conversationBrief);
  if (!briefValidation.valid) return briefValidation;

  return Object.freeze({
    valid: true,
    outcome: REQUEST_OUTCOMES.VALID,
    providerId,
    requestVersion: request.requestVersion,
    requestMetadata: Object.freeze({ ...metadata }),
    conversationBrief: request.conversationBrief
  });
}

const api = Object.freeze({
  PROVIDER_REQUEST_VERSION,
  SUPPORTED_PROVIDERS,
  SUPPORTED_BRIEF_BUILDER_VERSIONS,
  REQUEST_OUTCOMES,
  validateConversationBrief,
  validateProviderDraftRequest,
  _private: {
    collectProhibitedKeys,
    collectInjectionIndicators,
    normalizeProvider
  }
});

if (typeof globalThis !== "undefined") {
  globalThis.ForgeNashProviderRequestContract = api;
}
if (typeof module !== "undefined" && module.exports) {
  module.exports = api;
}
