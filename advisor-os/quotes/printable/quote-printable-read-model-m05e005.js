import {
  ACCEPTED_QUOTE_SNAPSHOT_TYPE,
  CONTRACT_VERSION as BASE_CONTRACT_VERSION,
  QUOTE_PRINTABLE_READ_MODEL_TYPE,
  buildQuotePrintableReadModel as buildBaseQuotePrintableReadModel,
} from "./quote-printable-read-model.js";

const CONTRACT_VERSION = "M05E005_OPTIONAL_CLIENT_READ_MODEL_V1";
const MISSING_CLIENT_LABEL = "Sin dato confirmado";

function isRecord(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function hasText(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function clone(value) {
  if (typeof structuredClone === "function") return structuredClone(value);
  return JSON.parse(JSON.stringify(value));
}

function clientNameFrom(snapshot) {
  const quote = snapshot?.acceptedQuote || {};
  const values = [
    quote?.client?.fullName,
    quote?.client?.name,
    quote?.insured?.fullName,
    quote?.insured?.name,
    quote?.prospect?.fullName,
    quote?.prospect?.name,
    quote?.context?.clientName,
    quote?.context?.insuredName,
    quote?.nativeResult?.clientName,
    quote?.nativeResult?.insuredName,
    quote?.nativeResult?.prospectName,
    snapshot?.calculation?.clientName,
  ];
  return values.find(hasText)?.trim() || "";
}

function normalizePrintableReviewSnapshot(reviewSnapshot) {
  if (!isRecord(reviewSnapshot)) {
    throw new TypeError("reviewSnapshot must be a plain object");
  }
  if (reviewSnapshot.packetType !== ACCEPTED_QUOTE_SNAPSHOT_TYPE) {
    throw new TypeError("Unsupported accepted quote snapshot");
  }

  const normalized = clone(reviewSnapshot);
  if (!isRecord(normalized.acceptedQuote)) normalized.acceptedQuote = {};
  if (!isRecord(normalized.acceptedQuote.context)) {
    normalized.acceptedQuote.context = {};
  }

  const detected = clientNameFrom(normalized);
  if (!detected) {
    normalized.acceptedQuote.context.clientName = MISSING_CLIENT_LABEL;
    normalized.acceptedQuote.context.clientNameResolution =
      "OPTIONAL_UNAVAILABLE_PLACEHOLDER";
  }

  return normalized;
}

function buildQuotePrintableReadModel(options = {}) {
  const normalizedSnapshot = normalizePrintableReviewSnapshot(
    options.reviewSnapshot,
  );
  return buildBaseQuotePrintableReadModel({
    ...options,
    reviewSnapshot: normalizedSnapshot,
  });
}

export {
  ACCEPTED_QUOTE_SNAPSHOT_TYPE,
  BASE_CONTRACT_VERSION,
  CONTRACT_VERSION,
  MISSING_CLIENT_LABEL,
  QUOTE_PRINTABLE_READ_MODEL_TYPE,
  buildQuotePrintableReadModel,
  clientNameFrom,
  normalizePrintableReviewSnapshot,
};
