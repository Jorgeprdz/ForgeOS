const CONTEXT_PACKET_TYPE =
  "QUOTE_TO_SALES_PRESENTATION_CONTEXT_PACKET";
const SNAPSHOT_TYPE =
  "ACCEPTED_QUOTE_AND_CALCULATION_REVIEW_SNAPSHOT";
const CLIENT_RATIONALE_PACKET_TYPE =
  "CLIENT_RECOMMENDATION_RATIONALE_PACKET";

const FORBIDDEN_KEYS = new Set([
  "rawpdf",
  "pdfbytes",
  "binary",
  "blob",
  "file",
  "base64",
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

function isRecord(value) {
  return Boolean(
    value &&
      typeof value === "object" &&
      !Array.isArray(value),
  );
}

function normalizedKey(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
}

function cloneSafe(value, path = "root", seen = new WeakSet()) {
  if (
    value === null ||
    typeof value === "string" ||
    typeof value === "boolean"
  ) {
    return value;
  }

  if (typeof value === "number") {
    if (!Number.isFinite(value)) {
      throw new TypeError(`Non-finite number at ${path}`);
    }
    return value;
  }

  if (
    typeof value === "undefined" ||
    typeof value === "function" ||
    typeof value === "symbol" ||
    typeof value === "bigint"
  ) {
    throw new TypeError(`Non-JSON value at ${path}`);
  }

  if (seen.has(value)) {
    throw new TypeError(`Circular value at ${path}`);
  }
  seen.add(value);

  if (Array.isArray(value)) {
    const output = value.map((item, index) =>
      cloneSafe(item, `${path}[${index}]`, seen),
    );
    seen.delete(value);
    return output;
  }

  if (!isRecord(value)) {
    throw new TypeError(`Non-plain object at ${path}`);
  }

  const output = {};
  for (const [key, item] of Object.entries(value)) {
    const normalized = normalizedKey(key);
    if (FORBIDDEN_KEYS.has(normalized)) {
      throw new TypeError(
        `Forbidden raw document key at ${path}.${key}`,
      );
    }
    if (FORBIDDEN_ADVISOR_PRIVATE_KEYS.has(normalized)) {
      throw new TypeError(
        `Private advisor motivation key at ${path}.${key}`,
      );
    }
    output[key] = cloneSafe(item, `${path}.${key}`, seen);
  }

  seen.delete(value);
  return output;
}

function deepFreeze(value, seen = new WeakSet()) {
  if (!value || typeof value !== "object" || seen.has(value)) {
    return value;
  }
  seen.add(value);
  for (const item of Object.values(value)) {
    deepFreeze(item, seen);
  }
  return Object.freeze(value);
}

function stable(value) {
  if (value === null || typeof value !== "object") {
    return JSON.stringify(value);
  }
  if (Array.isArray(value)) {
    return `[${value.map(stable).join(",")}]`;
  }
  return `{${Object.keys(value)
    .sort()
    .map((key) => `${JSON.stringify(key)}:${stable(value[key])}`)
    .join(",")}}`;
}

function hash(value) {
  let output = 0x811c9dc5;
  for (let index = 0; index < value.length; index += 1) {
    output ^= value.charCodeAt(index);
    output = Math.imul(output, 0x01000193);
  }
  return (output >>> 0).toString(16).padStart(8, "0");
}

function optionalRecord(value, path) {
  if (value === null || typeof value === "undefined") {
    return null;
  }
  if (!isRecord(value)) {
    throw new TypeError(`${path} must be a plain object`);
  }
  return cloneSafe(value, path);
}

function optionalTextOrRecord(value, path) {
  if (value === null || typeof value === "undefined") {
    return null;
  }
  if (typeof value === "string") {
    return value.trim() || null;
  }
  if (Array.isArray(value) || isRecord(value)) {
    return cloneSafe(value, path);
  }
  throw new TypeError(`${path} has an unsupported type`);
}

function optionalClientRationale(value) {
  if (value === null || typeof value === "undefined") {
    return null;
  }
  if (!isRecord(value)) {
    throw new TypeError(
      "clientRecommendationRationale must be a packet",
    );
  }

  const packet = cloneSafe(
    value,
    "clientRecommendationRationale",
  );

  if (
    packet.packetType !== CLIENT_RATIONALE_PACKET_TYPE ||
    packet.subjectType !== "CLIENT_SOLUTION_FIT"
  ) {
    throw new TypeError(
      "Unsupported client recommendation rationale packet",
    );
  }

  if (
    packet.safety?.advisorReasonWhyAllowed !== false ||
    packet.safety?.managerCoachingContextAllowed !== false ||
    packet.safety?.privateAdvisorMotivationAllowed !== false
  ) {
    throw new TypeError(
      "Client rationale packet does not protect advisor privacy",
    );
  }

  return packet;
}

function buildSalesPresentationBrowserContext(input = {}) {
  if (!isRecord(input)) {
    throw new TypeError("context input must be a plain object");
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

  const {
    snapshot,
    prospectContext = null,
    advisorNotes = null,
    clientObjective = null,
    clientRecommendationRationale = null,
  } = input;

  if (!isRecord(snapshot)) {
    throw new TypeError("snapshot must be a plain object");
  }
  if (snapshot.packetType !== SNAPSHOT_TYPE) {
    throw new TypeError(
      `Unsupported snapshot type: ${snapshot.packetType || "UNKNOWN"}`,
    );
  }
  if (
    !isRecord(snapshot.acceptedQuote) ||
    !isRecord(snapshot.calculation)
  ) {
    throw new TypeError(
      "snapshot requires acceptedQuote and calculation",
    );
  }

  const acceptedQuote = cloneSafe(
    snapshot.acceptedQuote,
    "acceptedQuote",
  );
  const calculation = cloneSafe(
    snapshot.calculation,
    "calculation",
  );
  const productIntelligence =
    snapshot.productIntelligence === null
      ? null
      : optionalRecord(
          snapshot.productIntelligence,
          "productIntelligence",
        );

  const packet = {
    packetType: CONTEXT_PACKET_TYPE,
    contractVersion: "R16H3_CONTEXT_V2",
    reviewOnly: true,
    acceptedQuote,
    calculation,
    productIntelligence,
    clientRecommendationRationale:
      optionalClientRationale(
        clientRecommendationRationale,
      ),
    prospectContext: optionalRecord(
      prospectContext,
      "prospectContext",
    ),
    advisorNotes: optionalTextOrRecord(
      advisorNotes,
      "advisorNotes",
    ),
    clientObjective: optionalTextOrRecord(
      clientObjective,
      "clientObjective",
    ),
    contextReady: Boolean(productIntelligence),
    status: productIntelligence
      ? "REVIEW_READY"
      : "HOLD_MISSING_PRODUCT_INTELLIGENCE",
    missingAuthorities: productIntelligence
      ? []
      : ["PRODUCT_INTELLIGENCE"],
    authorities: {
      numericTruthOwner:
        "QUOTE_SOURCE_AND_PRODUCT_INTELLIGENCE",
      narrativeSource:
        "CLIENT_RECOMMENDATION_RATIONALE_OR_DOCUMENTED_CONTEXT",
      advisorReasonWhyOwner:
        "MANAGER_OS_PRIVATE_NOT_PRESENTATION_INPUT",
      finalAuthority: "HUMAN",
    },
    promptBuilder: {
      dedicatedPresentationPromptBuilderRequired: true,
      outreachPromptBuilderReused: false,
      presentationPromptGenerated: false,
    },
    safety: {
      promptGenerated: false,
      slidePlanGenerated: false,
      exportEnabled: false,
      sendable: false,
      humanApprovalRequired: true,
      rawPdfAllowed: false,
      advisorReasonWhyAllowed: false,
      privateAdvisorMotivationAllowed: false,
      advisorNotesClientVisible: false,
    },
  };

  packet.presentationContextId =
    `presentation-context-${hash(stable(packet))}`;

  return deepFreeze(packet);
}

const api = Object.freeze({
  buildSalesPresentationBrowserContext,
});

globalThis.ForgeSalesPresentationBrowserContextAdapter = api;

export {
  CONTEXT_PACKET_TYPE,
  SNAPSHOT_TYPE,
  buildSalesPresentationBrowserContext,
};
