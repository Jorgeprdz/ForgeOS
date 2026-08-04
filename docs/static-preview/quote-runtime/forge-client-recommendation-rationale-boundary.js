const PACKET_TYPE = "CLIENT_RECOMMENDATION_RATIONALE_PACKET";
const SUBJECT_TYPE = "CLIENT_SOLUTION_FIT";
const CONTRACT_VERSION = "R16H3_CLIENT_RATIONALE_V1";

const FORBIDDEN_PRIVATE_KEYS = new Set([
  "advisorid",
  "managerid",
  "advisorreasonwhy",
  "reasonwhy",
  "underlyingmotivation",
  "emotionaldriver",
  "personaloutcome",
  "managercoachingsignal",
  "goalcontext",
  "compensationcandidatecontext",
  "forecastcontext",
  "commission",
  "bonus",
  "payout",
  "ranking",
  "humanranking",
  "personalitytruth",
  "suggestedmessageinstruction",
  "conversationangle",
  "objectionsupport",
]);

function isRecord(value) {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}

function normalizeKey(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
}

function cloneClientSafe(value, path = "clientRationale", seen = new WeakSet()) {
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
      cloneClientSafe(item, `${path}[${index}]`, seen),
    );
    seen.delete(value);
    return output;
  }

  if (!isRecord(value)) {
    throw new TypeError(`Non-plain object at ${path}`);
  }

  const output = {};
  for (const [key, item] of Object.entries(value)) {
    const normalized = normalizeKey(key);
    if (FORBIDDEN_PRIVATE_KEYS.has(normalized)) {
      throw new TypeError(
        `Private advisor motivation key is forbidden at ${path}.${key}`,
      );
    }
    output[key] = cloneClientSafe(item, `${path}.${key}`, seen);
  }

  seen.delete(value);
  return output;
}

function deepFreeze(value, seen = new WeakSet()) {
  if (!value || typeof value !== "object" || seen.has(value)) {
    return value;
  }
  seen.add(value);
  for (const child of Object.values(value)) {
    deepFreeze(child, seen);
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

function hasRationaleData(rationale) {
  return (
    isRecord(rationale) &&
    [
      "clientObjective",
      "documentedNeed",
      "solutionFit",
      "whyNow",
      "recommendedAction",
    ].some((key) => {
      const value = rationale[key];
      return (
        value !== null &&
        typeof value !== "undefined" &&
        (typeof value !== "string" || value.trim().length > 0)
      );
    })
  );
}

function buildClientRecommendationRationaleBoundary(input = {}) {
  if (!isRecord(input)) {
    throw new TypeError(
      "client recommendation rationale input must be a plain object",
    );
  }

  const rationale = cloneClientSafe(input);
  const rationaleReady = hasRationaleData(rationale);
  const packet = {
    packetType: PACKET_TYPE,
    contractVersion: CONTRACT_VERSION,
    subjectType: SUBJECT_TYPE,
    audience: ["ADVISOR", "CLIENT"],
    reviewOnly: true,
    rationale,
    rationaleReady,
    status: rationaleReady
      ? "REVIEW_READY_CLIENT_SOLUTION_FIT"
      : "HOLD_MISSING_CLIENT_SOLUTION_FIT",
    authorities: {
      factualOwner: "QUOTE_SOURCE_AND_PRODUCT_INTELLIGENCE",
      rationaleOwner: "CLIENT_RECOMMENDATION_RATIONALE",
      finalAuthority: "HUMAN",
    },
    safety: {
      advisorReasonWhyAllowed: false,
      managerCoachingContextAllowed: false,
      privateAdvisorMotivationAllowed: false,
      advisorNotesClientVisible: false,
      createsFinancialTruth: false,
      createsProductTruth: false,
      sendsMessage: false,
      exportsPresentation: false,
      writesCrm: false,
      humanApprovalRequired: true,
    },
  };

  packet.clientRationaleId =
    `client-rationale-${hash(stable(packet))}`;

  return deepFreeze(packet);
}

const api = Object.freeze({
  buildClientRecommendationRationaleBoundary,
});

globalThis.ForgeClientRecommendationRationaleBoundary = api;

export {
  CONTRACT_VERSION,
  PACKET_TYPE,
  SUBJECT_TYPE,
  buildClientRecommendationRationaleBoundary,
};
