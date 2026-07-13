const PACKET_TYPE =
  "QUOTE_TO_SALES_PRESENTATION_CONTEXT_PACKET";
const SOURCE =
  "FORGE_QUOTE_TO_SALES_PRESENTATION_CONTEXT_ADAPTER";
const SOURCE_PHASE =
  "R16G1_CANONICAL_PRESENTATION_CONTEXT_ADAPTER";
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

  return (
    prototype === Object.prototype ||
    prototype === null
  );
}

function normalizeText(value) {
  return typeof value === "string"
    ? value.trim()
    : "";
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
      throw new TypeError(
        `${path} contains a non-finite number`,
      );
    }

    return value;
  }

  if (Array.isArray(value)) {
    if (seen.has(value)) {
      throw new TypeError(`${path} contains a cycle`);
    }

    seen.add(value);

    const result = value.map((item, index) =>
      cloneReviewValue(
        item,
        `${path}[${index}]`,
        seen,
      ),
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
      const normalizedKey = key
        .replace(/[-_\s]/g, "")
        .toLowerCase();

      if (FORBIDDEN_BINARY_KEYS.has(normalizedKey)) {
        throw new TypeError(
          `${path}.${key} may expose raw file or PDF data`,
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
  return (
    isPlainObject(value) &&
    Object.keys(value).length > 0
  );
}

function hasNarrativeData(value) {
  if (normalizeText(value)) {
    return true;
  }

  return hasRecordData(value);
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
    return (
      "[" +
      value.map(stableSerialize).join(",") +
      "]"
    );
  }

  const keys = Object.keys(value).sort();

  return (
    "{" +
    keys
      .map(
        (key) =>
          `${JSON.stringify(key)}:${stableSerialize(
            value[key],
          )}`,
      )
      .join(",") +
    "}"
  );
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
      packetType ===
        "PRODUCT_INTELLIGENCE_REVIEW_PACKET" &&
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
    if (
      Object.prototype.hasOwnProperty.call(
        reviewPacket,
        key,
      )
    ) {
      reference[key] = reviewPacket[key];
    }
  }

  return reference;
}

export function buildQuoteToSalesPresentationContext(
  input = {},
) {
  if (!isPlainObject(input)) {
    throw new TypeError(
      "presentation context input must be a plain object",
    );
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
  const reasonWhy = cloneReviewValue(
    input.reasonWhy || {},
    "$.reasonWhy",
  );
  const prospectContext = cloneReviewValue(
    input.prospectContext || {},
    "$.prospectContext",
  );
  const advisorNotes = normalizeText(
    input.advisorNotes,
  );

  const intentConfirmed =
    presentationIntentConfirmed(reviewPacket);
  const acceptedQuoteReady =
    hasRecordData(acceptedQuote);
  const productIntelligenceReady =
    hasRecordData(productIntelligence);
  const reasonWhyReady =
    hasNarrativeData(reasonWhy);

  const missingRequiredAuthorities = [];

  if (!intentConfirmed) {
    missingRequiredAuthorities.push(
      "presentation_review_packet",
    );
  }

  if (!acceptedQuoteReady) {
    missingRequiredAuthorities.push(
      "accepted_quote",
    );
  }

  if (!productIntelligenceReady) {
    missingRequiredAuthorities.push(
      "product_intelligence",
    );
  }

  if (!reasonWhyReady) {
    missingRequiredAuthorities.push(
      "reason_why",
    );
  }

  const readyForPromptReview =
    missingRequiredAuthorities.length === 0;

  const canonicalInput = {
    reviewPacket:
      compactReviewPacketReference(reviewPacket),
    acceptedQuote,
    productIntelligence,
    reasonWhy,
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
    reviewPacketReference:
      canonicalInput.reviewPacket,
    context: {
      acceptedQuote,
      productIntelligence,
      reasonWhy,
      prospectContext,
      advisorNotes,
    },
    authority: {
      numericTruthOwner:
        "QUOTE_SOURCE_AND_PRODUCT_INTELLIGENCE",
      narrativeLogicOwner: "REASON_WHY",
      finalAuthority: "HUMAN",
      inventedNumbersAllowed: false,
      unknownProductClaimsRemainUnknown: true,
    },
    readiness: {
      presentationIntentConfirmed:
        intentConfirmed,
      acceptedQuoteReady,
      productIntelligenceReady,
      reasonWhyReady,
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
    "REASON_WHY"
  ) {
    violations.push("narrative_logic_owner");
  }

  if (
    packet.authority?.finalAuthority !== "HUMAN"
  ) {
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
  })) {
    if (packet.safety?.[key] !== expected) {
      violations.push(`safety.${key}`);
    }
  }

  if (
    packet.promptBuilderContract
      ?.outreachPromptBuilderReused !== false
  ) {
    violations.push(
      "prompt_builder.outreach_reuse",
    );
  }

  if (
    packet.readiness?.readyForSlidePlan !== false ||
    packet.readiness?.readyForExport !== false
  ) {
    violations.push("premature_output_readiness");
  }

  if (violations.length > 0) {
    throw new Error(
      `presentation context boundary violation: ${violations.join(
        ", ",
      )}`,
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
    narrativeLogicOwner: "REASON_WHY",
    finalAuthority: "HUMAN",
    outreachPromptBuilderReused: false,
    promptGenerated: false,
    slidePlanGenerated: false,
    exportEnabled: false,
  });
