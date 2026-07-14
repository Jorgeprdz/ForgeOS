const CONTEXT_PACKET_TYPE = "QUOTE_TO_SALES_PRESENTATION_CONTEXT_PACKET";
const SNAPSHOT_TYPE = "ACCEPTED_QUOTE_AND_CALCULATION_REVIEW_SNAPSHOT";
const FORBIDDEN_KEYS = new Set(["rawpdf", "pdfbytes", "binary", "blob", "file", "base64"]);

function isRecord(value) {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}

function normalizedKey(value) {
  return String(value || "").toLowerCase().replace(/[^a-z0-9]/g, "");
}

function cloneSafe(value, path = "root", seen = new WeakSet()) {
  if (value === null || typeof value === "string" || typeof value === "boolean") {
    return value;
  }

  if (typeof value === "number") {
    if (!Number.isFinite(value)) throw new TypeError(`Non-finite number at ${path}`);
    return value;
  }

  if (typeof value === "undefined" || typeof value === "function" ||
      typeof value === "symbol" || typeof value === "bigint") {
    throw new TypeError(`Non-JSON value at ${path}`);
  }

  if (
    (typeof ArrayBuffer !== "undefined" &&
      (value instanceof ArrayBuffer || ArrayBuffer.isView?.(value))) ||
    (typeof Blob !== "undefined" && value instanceof Blob) ||
    (typeof File !== "undefined" && value instanceof File)
  ) {
    throw new TypeError(`Binary value at ${path}`);
  }

  if (seen.has(value)) throw new TypeError(`Circular value at ${path}`);
  seen.add(value);

  if (Array.isArray(value)) {
    const output = value.map((item, index) =>
      cloneSafe(item, `${path}[${index}]`, seen));
    seen.delete(value);
    return output;
  }

  if (!isRecord(value)) throw new TypeError(`Non-plain object at ${path}`);

  const output = {};
  for (const [key, item] of Object.entries(value)) {
    if (FORBIDDEN_KEYS.has(normalizedKey(key))) {
      throw new TypeError(`Forbidden raw document key at ${path}.${key}`);
    }
    output[key] = cloneSafe(item, `${path}.${key}`, seen);
  }

  seen.delete(value);
  return output;
}

function deepFreeze(value, seen = new WeakSet()) {
  if (!value || typeof value !== "object" || seen.has(value)) return value;
  seen.add(value);
  for (const item of Object.values(value)) deepFreeze(item, seen);
  return Object.freeze(value);
}

function stable(value) {
  if (value === null || typeof value !== "object") return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(stable).join(",")}]`;
  return `{${Object.keys(value).sort()
    .map(key => `${JSON.stringify(key)}:${stable(value[key])}`).join(",")}}`;
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
  if (value === null || typeof value === "undefined") return null;
  if (!isRecord(value)) throw new TypeError(`${path} must be a plain object`);
  return cloneSafe(value, path);
}

function optionalTextOrRecord(value, path) {
  if (value === null || typeof value === "undefined") return null;
  if (typeof value === "string") return value.trim() || null;
  if (Array.isArray(value) || isRecord(value)) return cloneSafe(value, path);
  throw new TypeError(`${path} has an unsupported type`);
}

function buildSalesPresentationBrowserContext({
  snapshot,
  prospectContext = null,
  advisorNotes = null,
  clientObjective = null,
} = {}) {
  if (!isRecord(snapshot)) throw new TypeError("snapshot must be a plain object");
  if (snapshot.packetType !== SNAPSHOT_TYPE) {
    throw new TypeError(`Unsupported snapshot type: ${snapshot.packetType || "UNKNOWN"}`);
  }
  if (!isRecord(snapshot.acceptedQuote) || !isRecord(snapshot.calculation)) {
    throw new TypeError("snapshot requires acceptedQuote and calculation");
  }

  const acceptedQuote = cloneSafe(snapshot.acceptedQuote, "acceptedQuote");
  const calculation = cloneSafe(snapshot.calculation, "calculation");
  const productIntelligence = snapshot.productIntelligence === null
    ? null
    : optionalRecord(snapshot.productIntelligence, "productIntelligence");

  const packet = {
    packetType: CONTEXT_PACKET_TYPE,
    contractVersion: "R16G2B3F_CONTEXT_V1",
    reviewOnly: true,
    acceptedQuote,
    calculation,
    productIntelligence,
    prospectContext: optionalRecord(prospectContext, "prospectContext"),
    advisorNotes: optionalTextOrRecord(advisorNotes, "advisorNotes"),
    clientObjective: optionalTextOrRecord(clientObjective, "clientObjective"),
    contextReady: Boolean(productIntelligence),
    status: productIntelligence
      ? "REVIEW_READY"
      : "HOLD_MISSING_PRODUCT_INTELLIGENCE",
    missingAuthorities: productIntelligence ? [] : ["PRODUCT_INTELLIGENCE"],
    authorities: {
      numericTruthOwner: "QUOTE_SOURCE_AND_PRODUCT_INTELLIGENCE",
      narrativeSource: "GROUNDED_PRESENTATION_CONTEXT_ONLY",
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
    },
  };

  packet.presentationContextId =
    `presentation-context-${hash(stable(packet))}`;

  return deepFreeze(packet);
}

const api = Object.freeze({ buildSalesPresentationBrowserContext });
globalThis.ForgeSalesPresentationBrowserContextAdapter = api;

export {
  CONTEXT_PACKET_TYPE,
  SNAPSHOT_TYPE,
  buildSalesPresentationBrowserContext,
};
