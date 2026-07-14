const SNAPSHOT_TYPE =
  "ACCEPTED_QUOTE_AND_CALCULATION_REVIEW_SNAPSHOT";

const FORBIDDEN_KEY_TOKENS = new Set([
  "arraybuffer",
  "base64",
  "binary",
  "blob",
  "dataurl",
  "file",
  "pdfbytes",
  "rawpdf",
]);

function isRecord(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return false;
  }

  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}

function normalizedKey(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
}

function assertAllowedKey(key, path) {
  if (FORBIDDEN_KEY_TOKENS.has(normalizedKey(key))) {
    throw new TypeError(
      `Forbidden binary or raw document key at ${path}.${String(key)}`,
    );
  }
}

function assertNotBinaryLike(value, path) {
  if (
    typeof ArrayBuffer !== "undefined" &&
    (
      value instanceof ArrayBuffer ||
      (
        typeof ArrayBuffer.isView === "function" &&
        ArrayBuffer.isView(value)
      )
    )
  ) {
    throw new TypeError(`Binary value is forbidden at ${path}`);
  }

  if (
    typeof Blob !== "undefined" &&
    value instanceof Blob
  ) {
    throw new TypeError(`Blob value is forbidden at ${path}`);
  }

  if (
    typeof File !== "undefined" &&
    value instanceof File
  ) {
    throw new TypeError(`File value is forbidden at ${path}`);
  }
}

function cloneReviewValue(value, path = "root", seen = new WeakSet()) {
  if (
    value === null ||
    typeof value === "string" ||
    typeof value === "boolean"
  ) {
    return value;
  }

  if (typeof value === "number") {
    if (!Number.isFinite(value)) {
      throw new TypeError(`Non-finite number is forbidden at ${path}`);
    }

    return value;
  }

  if (typeof value === "undefined") {
    throw new TypeError(`Undefined value is forbidden at ${path}`);
  }

  if (
    typeof value === "function" ||
    typeof value === "symbol" ||
    typeof value === "bigint"
  ) {
    throw new TypeError(`Non-JSON value is forbidden at ${path}`);
  }

  assertNotBinaryLike(value, path);

  if (seen.has(value)) {
    throw new TypeError(`Circular value is forbidden at ${path}`);
  }

  seen.add(value);

  if (Array.isArray(value)) {
    const output = value.map((item, index) =>
      cloneReviewValue(item, `${path}[${index}]`, seen)
    );

    seen.delete(value);
    return output;
  }

  if (!isRecord(value)) {
    throw new TypeError(`Non-plain object is forbidden at ${path}`);
  }

  const output = {};

  for (const [key, item] of Object.entries(value)) {
    assertAllowedKey(key, path);
    output[key] = cloneReviewValue(
      item,
      `${path}.${key}`,
      seen,
    );
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

function resolveProductIntelligence(acceptedQuote, calculation) {
  return (
    calculation?.productIntelligence ??
    calculation?.product_intelligence ??
    acceptedQuote?.productIntelligence ??
    acceptedQuote?.product_intelligence ??
    null
  );
}

function createAcceptedQuoteReviewSnapshotBoundary() {
  let currentSnapshot = null;

  function clear() {
    currentSnapshot = null;
    return null;
  }

  function setSnapshot({
    acceptedQuote,
    calculation,
  } = {}) {
    if (!isRecord(acceptedQuote)) {
      throw new TypeError(
        "acceptedQuote must be a plain object",
      );
    }

    if (!isRecord(calculation)) {
      throw new TypeError(
        "calculation must be a plain object",
      );
    }

    const acceptedQuoteClone = cloneReviewValue(
      acceptedQuote,
      "acceptedQuote",
    );

    const calculationClone = cloneReviewValue(
      calculation,
      "calculation",
    );

    const productIntelligenceClone = cloneReviewValue(
      resolveProductIntelligence(
        acceptedQuote,
        calculation,
      ),
      "productIntelligence",
    );

    currentSnapshot = deepFreeze({
      packetType: SNAPSHOT_TYPE,
      reviewOnly: true,
      acceptedQuote: acceptedQuoteClone,
      calculation: calculationClone,
      productIntelligence: productIntelligenceClone,
      authority: {
        numericTruthOwner:
          "QUOTE_SOURCE_AND_PRODUCT_INTELLIGENCE",
        finalAuthority: "HUMAN",
      },
      safety: {
        promptGenerated: false,
        slidePlanGenerated: false,
        exportEnabled: false,
        sendable: false,
        crmMutationAllowed: false,
        quoteMutationAllowed: false,
        rawPdfAllowed: false,
      },
    });

    return currentSnapshot;
  }

  function getSnapshot() {
    return currentSnapshot;
  }

  return Object.freeze({
    clear,
    getSnapshot,
    setSnapshot,
  });
}

export {
  SNAPSHOT_TYPE,
  createAcceptedQuoteReviewSnapshotBoundary,
};
