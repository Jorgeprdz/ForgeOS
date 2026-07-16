const PACKET_TYPE = "QUOTE_TO_SALES_PRESENTATION_CONTEXT_PACKET";
const CLIENT_RATIONALE_PACKET_TYPE =
  "CLIENT_RECOMMENDATION_RATIONALE_PACKET";
const SOURCE = "FORGE_QUOTE_TO_SALES_PRESENTATION_CONTEXT_ADAPTER";
const SOURCE_PHASE =
  "R16H3_ADVISOR_REASON_WHY_DOMAIN_ISOLATION";
const PRESENTATION_COMMAND = "/Presentación";
const PRESENTATION_INTENT = "sales_presentation_prep";
const PRODUCT_ROUTE = "ALFRED_PRODUCT_INTELLIGENCE";

const FORBIDDEN_BINARY_KEYS = new Set([
  "arraybuffer",
  "base64",
  "binary",
  "blob",
  "dataurl",
  "file",
  "pdfbytes",
  "rawpdf",
]);

const FORBIDDEN_ADVISOR_PRIVATE_KEYS = new Set([
  "reasonwhy",
  "advisorreasonwhy",
  "underlyingmotivation",
  "emotionaldriver",
  "personaloutcome",
  "managercoachingsignal",
  "compensationcandidatecontext",
  "forecastcontext",
]);

const FORBIDDEN_ACTIONS = Object.freeze([
  "generate_prompt",
  "generate_slides",
  "export_presentation",
  "send_presentation",
  "write_crm",
  "mutate_quote",
  "create_product_truth",
  "invoke_provider_runtime",
  "read_raw_pdf",
  "consume_advisor_reason_why",
]);

function isPlainObject(value) {
  if (
    value === null ||
    typeof value !== "object" ||
    Array.isArray(value)
  ) {
    return false;
  }
  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}

function normalizeText(value) {
  return typeof value === "string" ? value.trim() : "";
}

function normalizedKey(key) {
  return String(key || "")
    .replace(/[-_\s]/g, "")
    .toLowerCase();
}

function cloneReviewValue(value, path = "$", seen = new Set()) {
  if (
    value === null ||
    typeof value === "string" ||
    typeof value === "boolean"
  ) {
    return value;
  }

  if (typeof value === "number") {
    if (!Number.isFinite(value)) {
      throw new TypeError(`${path} contains a non-finite number`);
    }
    return value;
  }

  if (Array.isArray(value)) {
    if (seen.has(value)) {
      throw new TypeError(`${path} contains a cycle`);
    }
    seen.add(value);
    const result = value.map((item, index) =>
      cloneReviewValue(item, `${path}[${index}]`, seen),
    );
    seen.delete(value);
    return result;
  }

  if (isPlainObject(value)) {
    if (seen.has(value)) {
      throw new TypeError(`${path} contains a cycle`);
    }
    seen.add(value);
    const result = {};

    for (const key of Object.keys(value).sort()) {
      const normalized = normalizedKey(key);
      if (FORBIDDEN_BINARY_KEYS.has(normalized)) {
        throw new TypeError(
          `${path}.${key} may expose raw file or PDF data`,
        );
      }
      if (FORBIDDEN_ADVISOR_PRIVATE_KEYS.has(normalized)) {
        throw new TypeError(
          `${path}.${key} may expose private advisor motivation`,
        );
      }

      const child = value[key];
      if (typeof child === "undefined") {
        continue;
      }
      if (
        typeof child === "function" ||
        typeof child === "symbol" ||
        typeof child === "bigint"
      ) {
        throw new TypeError(
          `${path}.${key} contains an unsupported value`,
        );
      }

      result[key] = cloneReviewValue(
        child,
        `${path}.${key}`,
        seen,
      );
    }

    seen.delete(value);
    return result;
  }

  throw new TypeError(
    `${path} must contain JSON-safe review data`,
  );
}

function hasRecordData(value) {
  return isPlainObject(value) && Object.keys(value).length > 0;
}

function stableSerialize(value) {
  if (
    value === null ||
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "boolean"
  ) {
    return JSON.stringify(value);
  }
  if (Array.isArray(value)) {
    return `[${value.map(stableSerialize).join(",")}]`;
  }
  return `{${Object.keys(value)
    .sort()
    .map(
      (key) =>
        `${JSON.stringify(key)}:${stableSerialize(value[key])}`,
    )
    .join(",")}}`;
}

function hashText(value) {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(16).padStart(8, "0");
}

function deepFreeze(value) {
  if (
    value === null ||
    typeof value !== "object" ||
    Object.isFrozen(value)
  ) {
    return value;
  }
  Object.freeze(value);
  for (const child of Object.values(value)) {
    deepFreeze(child);
  }
  return value;
}

function presentationIntentConfirmed(reviewPacket) {
  if (!hasRecordData(reviewPacket)) {
    return false;
  }

  const command = normalizeText(
    reviewPacket.sourceCommand ||
      reviewPacket.normalizedCommand ||
      reviewPacket.command,
  ).toLowerCase();
  const intent = normalizeText(
    reviewPacket.intentFamily,
  ).toLowerCase();
  const packetType = normalizeText(
    reviewPacket.packetType,
  ).toUpperCase();

  return (
    intent === PRESENTATION_INTENT ||
    command === PRESENTATION_COMMAND.toLowerCase() ||
    command === "/presentacion" ||
    command === "/presentación" ||
    (
      packetType === "PRODUCT_INTELLIGENCE_REVIEW_PACKET" &&
      command.includes("present")
    )
  );
}

function compactReviewPacketReference(reviewPacket) {
  if (!hasRecordData(reviewPacket)) {
    return {};
  }

  const reference = {};
  for (const key of [
    "packetId",
    "packetType",
    "source",
    "sourceCommand",
    "normalizedCommand",
    "intentFamily",
    "routeFamily",
    "primaryEntity",
    "decision",
  ]) {
    if (Object.prototype.hasOwnProperty.call(reviewPacket, key)) {
      reference[key] = reviewPacket[key];
    }
  }
  return reference;
}

function validateClientRecommendationRationale(value) {
  if (value === null || typeof value === "undefined") {
    return null;
  }

  const packet = cloneReviewValue(
    value,
    "$.clientRecommendationRationale",
  );

  if (
    packet.packetType !== CLIENT_RATIONALE_PACKET_TYPE ||
    packet.subjectType !== "CLIENT_SOLUTION_FIT"
  ) {
    throw new TypeError(
      "clientRecommendationRationale must use the client solution-fit boundary",
    );
  }

  if (
    packet.safety?.advisorReasonWhyAllowed !== false ||
    packet.safety?.managerCoachingContextAllowed !== false ||
    packet.safety?.privateAdvisorMotivationAllowed !== false
  ) {
    throw new TypeError(
      "clientRecommendationRationale does not protect advisor privacy",
    );
  }

  return packet;
}

export function buildQuoteToSalesPresentationContext(
  input = {},
) {
  if (!isPlainObject(input)) {
    throw new TypeError(
      "presentation context input must be a plain object",
    );
  }

  for (const key of [
    "reasonWhy",
    "advisorReasonWhy",
    "advisorMotivation",
    "managerCoachingSignal",
  ]) {
    if (Object.prototype.hasOwnProperty.call(input, key)) {
      throw new TypeError(
        `${key} belongs to manager-os and is forbidden in client presentation context`,
      );
    }
  }

  const reviewPacket = cloneReviewValue(
    input.reviewPacket || {},
    "$.reviewPacket",
  );
  const acceptedQuote = cloneReviewValue(
    input.acceptedQuote || {},
    "$.acceptedQuote",
  );
  const productIntelligence = cloneReviewValue(
    input.productIntelligence || {},
    "$.productIntelligence",
  );
  const clientRecommendationRationale =
    validateClientRecommendationRationale(
      input.clientRecommendationRationale,
    );
  const prospectContext = cloneReviewValue(
    input.prospectContext || {},
    "$.prospectContext",
  );
  const advisorNotes = normalizeText(input.advisorNotes);

  const intentConfirmed =
    presentationIntentConfirmed(reviewPacket);
  const acceptedQuoteReady = hasRecordData(acceptedQuote);
  const productIntelligenceReady =
    hasRecordData(productIntelligence);
  const clientRecommendationRationaleReady = Boolean(
    clientRecommendationRationale?.rationaleReady,
  );

  const missingRequiredAuthorities = [];
  if (!intentConfirmed) {
    missingRequiredAuthorities.push(
      "presentation_review_packet",
    );
  }
  if (!acceptedQuoteReady) {
    missingRequiredAuthorities.push("accepted_quote");
  }
  if (!productIntelligenceReady) {
    missingRequiredAuthorities.push(
      "product_intelligence",
    );
  }

  const readyForPromptReview =
    missingRequiredAuthorities.length === 0;

  const canonicalInput = {
    reviewPacket:
      compactReviewPacketReference(reviewPacket),
    acceptedQuote,
    productIntelligence,
    clientRecommendationRationale,
    prospectContext,
    advisorNotes,
  };

  const presentationContextId =
    `FORGE_PRESENTATION_CONTEXT_${hashText(
      stableSerialize(canonicalInput),
    )}`;

  const packet = {
    presentationContextId,
    packetType: PACKET_TYPE,
    source: SOURCE,
    sourcePhase: SOURCE_PHASE,
    sourceCommand: PRESENTATION_COMMAND,
    intentFamily: PRESENTATION_INTENT,
    routeFamily: PRODUCT_ROUTE,
    reviewPacketReference: canonicalInput.reviewPacket,
    context: {
      acceptedQuote,
      productIntelligence,
      clientRecommendationRationale,
      prospectContext,
      advisorNotes,
    },
    authority: {
      numericTruthOwner:
        "QUOTE_SOURCE_AND_PRODUCT_INTELLIGENCE",
      narrativeLogicOwner:
        "CLIENT_RECOMMENDATION_RATIONALE_OR_HUMAN_REVIEW",
      advisorReasonWhyOwner:
        "MANAGER_OS_PRIVATE_NOT_PRESENTATION_INPUT",
      finalAuthority: "HUMAN",
      inventedNumbersAllowed: false,
      unknownProductClaimsRemainUnknown: true,
    },
    readiness: {
      presentationIntentConfirmed: intentConfirmed,
      acceptedQuoteReady,
      productIntelligenceReady,
      clientRecommendationRationaleReady,
      readyForPromptReview,
      readyForSlidePlan: false,
      readyForExport: false,
      missingRequiredAuthorities,
    },
    promptBuilderContract: {
      dedicatedPresentationPromptBuilderRequired: true,
      outreachPromptBuilderReused: false,
      promptGenerated: false,
      providerRuntimeEnabled: false,
      advisorNotesClientVisible: false,
    },
    safety: {
      previewOnly: true,
      reviewOnly: true,
      notApproved: true,
      notSendable: true,
      createsTruth: false,
      executesRuntime: false,
      writesCrm: false,
      mutatesQuote: false,
      readsRawPdf: false,
      invokesProvider: false,
      generatesPrompt: false,
      generatesSlides: false,
      exportsPresentation: false,
      advisorReasonWhyAllowed: false,
      privateAdvisorMotivationAllowed: false,
      advisorNotesClientVisible: false,
    },
    forbiddenActions: [...FORBIDDEN_ACTIONS],
    decision: readyForPromptReview
      ? "PASS_REVIEW_ONLY_CONTEXT_READY_NO_PROMPT"
      : "HOLD_REVIEW_ONLY_CONTEXT_INCOMPLETE",
  };

  return deepFreeze(packet);
}

export function assertQuoteToSalesPresentationContextBoundary(
  packet,
) {
  if (!isPlainObject(packet)) {
    throw new TypeError(
      "presentation context packet must be an object",
    );
  }

  const violations = [];

  if (packet.packetType !== PACKET_TYPE) {
    violations.push("packet_type");
  }
  if (packet.source !== SOURCE) {
    violations.push("source");
  }
  if (
    packet.authority?.numericTruthOwner !==
    "QUOTE_SOURCE_AND_PRODUCT_INTELLIGENCE"
  ) {
    violations.push("numeric_truth_owner");
  }
  if (
    packet.authority?.narrativeLogicOwner !==
    "CLIENT_RECOMMENDATION_RATIONALE_OR_HUMAN_REVIEW"
  ) {
    violations.push("narrative_logic_owner");
  }
  if (
    packet.authority?.advisorReasonWhyOwner !==
    "MANAGER_OS_PRIVATE_NOT_PRESENTATION_INPUT"
  ) {
    violations.push("advisor_reason_why_owner");
  }
  if (packet.authority?.finalAuthority !== "HUMAN") {
    violations.push("final_authority");
  }

  for (const [key, expected] of Object.entries({
    previewOnly: true,
    reviewOnly: true,
    notApproved: true,
    notSendable: true,
    createsTruth: false,
    executesRuntime: false,
    writesCrm: false,
    mutatesQuote: false,
    readsRawPdf: false,
    invokesProvider: false,
    generatesPrompt: false,
    generatesSlides: false,
    exportsPresentation: false,
    advisorReasonWhyAllowed: false,
    privateAdvisorMotivationAllowed: false,
    advisorNotesClientVisible: false,
  })) {
    if (packet.safety?.[key] !== expected) {
      violations.push(`safety.${key}`);
    }
  }

  if (
    packet.promptBuilderContract
      ?.outreachPromptBuilderReused !== false
  ) {
    violations.push("prompt_builder.outreach_reuse");
  }
  if (
    packet.readiness?.readyForSlidePlan !== false ||
    packet.readiness?.readyForExport !== false
  ) {
    violations.push("premature_output_readiness");
  }
  if (
    Object.prototype.hasOwnProperty.call(
      packet.context || {},
      "reasonWhy",
    )
  ) {
    violations.push("advisor_reason_why_leak");
  }

  if (violations.length > 0) {
    throw new Error(
      `presentation context boundary violation: ${violations.join(", ")}`,
    );
  }

  return true;
}

export const QUOTE_TO_SALES_PRESENTATION_CONTEXT_CONTRACT =
  deepFreeze({
    packetType: PACKET_TYPE,
    source: SOURCE,
    sourcePhase: SOURCE_PHASE,
    sourceCommand: PRESENTATION_COMMAND,
    intentFamily: PRESENTATION_INTENT,
    routeFamily: PRODUCT_ROUTE,
    numericTruthOwner:
      "QUOTE_SOURCE_AND_PRODUCT_INTELLIGENCE",
    narrativeLogicOwner:
      "CLIENT_RECOMMENDATION_RATIONALE_OR_HUMAN_REVIEW",
    advisorReasonWhyOwner:
      "MANAGER_OS_PRIVATE_NOT_PRESENTATION_INPUT",
    finalAuthority: "HUMAN",
    advisorReasonWhyAllowed: false,
    privateAdvisorMotivationAllowed: false,
    advisorNotesClientVisible: false,
    outreachPromptBuilderReused: false,
    promptGenerated: false,
    slidePlanGenerated: false,
    exportEnabled: false,
  });
