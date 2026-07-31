import { QUOTE_PRINTABLE_READ_MODEL_TYPE } from "./quote-printable-read-model.js";
import {
  PRODUCT_PROFILE_TYPE,
  buildProductSpecificQuotePrintableDocument,
} from "./quote-printable-product-profile.js";
import {
  QUOTE_PRINTABLE_PDF_TYPE,
  buildQuotePrintablePdf,
} from "./quote-printable-pdf-generator.js";

const QUOTE_PRINTABLE_VERSION_TYPE = "FORGE_QUOTE_PRINTABLE_VERSION_RECORD";
const CONTRACT_VERSION = "QPD05_VERSION_REPOSITORY_V1";
const STORAGE_SCHEMA_VERSION = 1;
const DEFAULT_STORAGE_KEY = "forge:qpd05:quote-printable-versions:v1";
const FORBIDDEN_KEYS = new Set([
  "arraybuffer", "base64", "binary", "blob", "bytes",
  "dataurl", "html", "pdfbytes", "rawpdf",
]);

class QuotePrintableRepositoryError extends Error {
  constructor(code, message, details = null) {
    super(message);
    this.name = "QuotePrintableRepositoryError";
    this.code = code;
    this.details = details;
  }
}

function fail(code, message, details = null) {
  throw new QuotePrintableRepositoryError(code, message, details);
}

function isRecord(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function normalizedKey(value) {
  return String(value || "").toLowerCase().replace(/[^a-z0-9]/g, "");
}

function cloneJson(value, path = "root", seen = new WeakSet()) {
  if (value === null || ["string", "boolean"].includes(typeof value)) return value;
  if (typeof value === "number") {
    if (!Number.isFinite(value)) fail("NON_FINITE_NUMBER", `Non-finite number at ${path}`);
    return value;
  }
  if (typeof value === "undefined") fail("UNDEFINED_VALUE", `Undefined value at ${path}`);
  if (["function", "symbol", "bigint"].includes(typeof value)) {
    fail("NON_JSON_VALUE", `Non-JSON value at ${path}`);
  }
  if (typeof ArrayBuffer !== "undefined" &&
      (value instanceof ArrayBuffer || ArrayBuffer.isView?.(value))) {
    fail("BINARY_VALUE", `Binary value at ${path}`);
  }
  if (seen.has(value)) fail("CIRCULAR_VALUE", `Circular value at ${path}`);
  seen.add(value);
  if (Array.isArray(value)) {
    const output = value.map((item, index) => cloneJson(item, `${path}[${index}]`, seen));
    seen.delete(value);
    return output;
  }
  if (!isRecord(value)) fail("NON_PLAIN_OBJECT", `Non-plain object at ${path}`);
  const output = {};
  for (const [key, item] of Object.entries(value)) {
    if (FORBIDDEN_KEYS.has(normalizedKey(key))) {
      fail("FORBIDDEN_PERSISTED_KEY", `Forbidden persisted key at ${path}.${key}`);
    }
    output[key] = cloneJson(item, `${path}.${key}`, seen);
  }
  seen.delete(value);
  return output;
}

function deepFreeze(value, seen = new WeakSet()) {
  if (!value || typeof value !== "object" || seen.has(value)) return value;
  seen.add(value);
  Object.values(value).forEach((item) => deepFreeze(item, seen));
  return Object.freeze(value);
}

function stableValue(value) {
  if (Array.isArray(value)) return value.map(stableValue);
  if (isRecord(value)) {
    return Object.fromEntries(
      Object.keys(value).sort().map((key) => [key, stableValue(value[key])]),
    );
  }
  return value;
}

function stableStringify(value) {
  return JSON.stringify(stableValue(value));
}

function fnv1a32(text, seed) {
  let output = seed >>> 0;
  for (let index = 0; index < text.length; index += 1) {
    output ^= text.charCodeAt(index);
    output = Math.imul(output, 16777619);
  }
  return (output >>> 0).toString(16).padStart(8, "0");
}

function stableDigest(value) {
  const text = typeof value === "string" ? value : stableStringify(value);
  return [
    2166136261, 2166136261 ^ 0x9e3779b9,
    2166136261 ^ 0x85ebca6b, 2166136261 ^ 0xc2b2ae35,
    2166136261 ^ 0x27d4eb2f, 2166136261 ^ 0x165667b1,
    2166136261 ^ 0xd3a2646c, 2166136261 ^ 0xfd7046c5,
  ].map((seed) => fnv1a32(text, seed)).join("");
}

function opaque(value, code, label, maximum = 240) {
  const normalized = String(value || "").trim();
  if (!normalized || normalized.length > maximum ||
      !/^[A-Za-z0-9][A-Za-z0-9._:@/-]*$/.test(normalized)) {
    fail(code, `${label} is invalid`);
  }
  return normalized;
}

function iso(value, code, label) {
  if (typeof value !== "string" || Number.isNaN(Date.parse(value))) {
    fail(code, `${label} is invalid`);
  }
  return new Date(value).toISOString();
}

function normalizeQuoteIdentity(value) {
  if (!isRecord(value)) fail("QUOTE_IDENTITY_REQUIRED", "Durable Quote identity is required");
  return {
    quoteReference: opaque(value.quoteReference, "QUOTE_REFERENCE_INVALID", "Quote reference"),
    quoteVersionReference: opaque(value.quoteVersionReference,
      "QUOTE_VERSION_REFERENCE_INVALID", "Quote version reference"),
    prospectReference: opaque(value.prospectReference,
      "PROSPECT_REFERENCE_INVALID", "Prospect reference"),
    productReference: opaque(value.productReference,
      "PRODUCT_REFERENCE_INVALID", "Product reference"),
    quoteSnapshotDigest: opaque(value.quoteSnapshotDigest,
      "QUOTE_SNAPSHOT_DIGEST_INVALID", "Quote snapshot digest", 128),
  };
}

function assertReadModel(value) {
  if (!isRecord(value) || value.packetType !== QUOTE_PRINTABLE_READ_MODEL_TYPE ||
      value.status !== "READY_FOR_DOCUMENT_COMPOSITION" ||
      value.productProfile?.packetType !== PRODUCT_PROFILE_TYPE) {
    fail("READ_MODEL_INVALID", "Product-profiled printable read model is required");
  }
  return value;
}

function assertDocument(value) {
  if (!isRecord(value) || value.status !== "PRINTABLE_HTML_READY") {
    fail("PRINTABLE_DOCUMENT_INVALID", "Composed printable document is required");
  }
  return value;
}

function assertPdfPacket(value) {
  if (!isRecord(value) || value.packetType !== QUOTE_PRINTABLE_PDF_TYPE ||
      value.status !== "PDF_BINARY_READY") {
    fail("PDF_PACKET_INVALID", "Real PDF packet is required");
  }
  return value;
}

function recordPayload(record) {
  const payload = cloneJson(record);
  delete payload.recordDigest;
  return payload;
}

function assertVersionRecord(record) {
  if (!isRecord(record) || record.packetType !== QUOTE_PRINTABLE_VERSION_TYPE ||
      record.contractVersion !== CONTRACT_VERSION) {
    fail("VERSION_RECORD_INVALID", "Unsupported printable version record");
  }
  if (stableDigest(recordPayload(record)) !== record.recordDigest) {
    fail("VERSION_DIGEST_MISMATCH", "Printable version record digest mismatch");
  }
  assertReadModel(record.readModelSnapshot);
  normalizeQuoteIdentity(record.quoteIdentity);
  return deepFreeze(cloneJson(record));
}

function createQuotePrintableVersionRecord({
  quoteIdentity, readModel, printableDocument, pdfPacket,
  generatedAt, persistedAt = new Date().toISOString(),
} = {}) {
  const identity = normalizeQuoteIdentity(quoteIdentity);
  assertReadModel(readModel);
  assertDocument(printableDocument);
  assertPdfPacket(pdfPacket);
  if ([printableDocument, pdfPacket].some((item) =>
    item.sourceDocumentId !== readModel.documentId ||
    item.sourceRevisionHash !== readModel.sourceRevisionHash)) {
    fail("SOURCE_REVISION_MISMATCH", "Printable assets do not share the same source revision");
  }
  if (pdfPacket.fileName !== printableDocument.fileName) {
    fail("FILE_NAME_MISMATCH", "Printable document and PDF filename mismatch");
  }
  const generated = iso(generatedAt, "GENERATED_AT_INVALID", "Generation time");
  const persisted = iso(persistedAt, "PERSISTED_AT_INVALID", "Persistence time");
  if (Date.parse(persisted) < Date.parse(generated)) {
    fail("PERSISTED_BEFORE_GENERATED", "Persistence time cannot precede generation time");
  }
  const versionSeed = {
    quoteVersionReference: identity.quoteVersionReference,
    sourceRevisionHash: readModel.sourceRevisionHash,
    productProfileId: readModel.productProfile.id,
    pageFormat: printableDocument.pageFormat,
    generatedAt: generated,
    pdfBinaryRevisionHash: pdfPacket.binaryRevisionHash,
  };
  const base = {
    packetType: QUOTE_PRINTABLE_VERSION_TYPE,
    contractVersion: CONTRACT_VERSION,
    storageSchemaVersion: STORAGE_SCHEMA_VERSION,
    printableVersionReference: `qpd-version:${stableDigest(versionSeed)}`,
    documentReference: `qpd-document:${stableDigest({
      quoteReference: identity.quoteReference,
      pageFormat: printableDocument.pageFormat,
    })}`,
    quoteIdentity: identity,
    sourceDocumentId: readModel.documentId,
    sourceRevisionHash: readModel.sourceRevisionHash,
    productProfileId: readModel.productProfile.id,
    productProfileLabel: readModel.productProfile.label,
    pageFormat: printableDocument.pageFormat,
    generatedAt: generated,
    persistedAt: persisted,
    readModelSnapshot: cloneJson(readModel, "readModelSnapshot"),
    renderManifest: {
      printableReadModelContractVersion: readModel.contractVersion,
      documentContractVersion: printableDocument.contractVersion,
      pdfContractVersion: pdfPacket.contractVersion,
      fileName: printableDocument.fileName,
      mediaType: pdfPacket.mediaType,
      pageCount: pdfPacket.pageCount,
      byteLength: pdfPacket.byteLength,
      binaryRevisionHash: pdfPacket.binaryRevisionHash,
    },
    authority: {
      quoteIdentityOwner: "CARTERA_001B_QUOTE_LIFECYCLE",
      documentVersionOwner: "ADVISOR_OS_QUOTE_PRINTABLE_DOCUMENT",
      finalAuthority: "HUMAN",
    },
    safety: {
      appendOnly: true,
      rawPdfPersisted: false,
      htmlPersisted: false,
      binaryPersisted: false,
      recalculationAllowed: false,
      quoteMutationAllowed: false,
      productMutationAllowed: false,
      automaticDownloadAllowed: false,
      automaticSendAllowed: false,
      humanReviewRequired: true,
    },
  };
  return assertVersionRecord({ ...base, recordDigest: stableDigest(base) });
}

function createMemoryStore(initialRecords = []) {
  let records = initialRecords.map(assertVersionRecord);
  return {
    readAll: () => records.map(cloneJson),
    writeAll: (next) => { records = next.map(assertVersionRecord); },
  };
}

function createLocalStorageStore({ storage, storageKey = DEFAULT_STORAGE_KEY } = {}) {
  if (!storage?.getItem || !storage?.setItem) {
    fail("LOCAL_STORAGE_REQUIRED", "A Storage-compatible adapter is required");
  }
  return {
    readAll() {
      const raw = storage.getItem(storageKey);
      if (!raw) return [];
      let parsed;
      try { parsed = JSON.parse(raw); }
      catch { fail("LOCAL_STORAGE_CORRUPTED", "Stored printable versions are corrupted"); }
      if (!isRecord(parsed) || parsed.schemaVersion !== STORAGE_SCHEMA_VERSION ||
          !Array.isArray(parsed.records)) {
        fail("LOCAL_STORAGE_SCHEMA_INVALID", "Stored printable version schema is invalid");
      }
      return parsed.records;
    },
    writeAll(records) {
      storage.setItem(storageKey, JSON.stringify({
        schemaVersion: STORAGE_SCHEMA_VERSION,
        records,
      }));
    },
  };
}

function createQuotePrintableVersionRepository({ store = createMemoryStore() } = {}) {
  if (!store?.readAll || !store?.writeAll) fail("STORE_REQUIRED", "A version store is required");
  const read = () => {
    const records = store.readAll();
    if (!Array.isArray(records)) fail("STORE_PAYLOAD_INVALID", "Store payload must be an array");
    return records.map(assertVersionRecord);
  };
  const append = (record) => {
    const validated = assertVersionRecord(record);
    const records = read();
    const existing = records.find((item) =>
      item.printableVersionReference === validated.printableVersionReference);
    if (existing) {
      if (existing.recordDigest !== validated.recordDigest) {
        fail("APPEND_CONFLICT", "Version reference exists with different content");
      }
      return deepFreeze({ status: "IDEMPOTENT_REPLAY", record: existing });
    }
    store.writeAll([...records, validated]);
    return deepFreeze({ status: "APPENDED", record: validated });
  };
  const get = (reference) => read().find((item) =>
    item.printableVersionReference === opaque(reference,
      "PRINTABLE_VERSION_REFERENCE_INVALID", "Printable version reference")) || null;
  const listByQuote = (reference) => deepFreeze(read()
    .filter((item) => item.quoteIdentity.quoteReference === opaque(reference,
      "QUOTE_REFERENCE_INVALID", "Quote reference"))
    .sort((a, b) => Date.parse(b.persistedAt) - Date.parse(a.persistedAt)));
  return deepFreeze({
    append,
    get,
    listByQuote,
    latestByQuote: (reference) => listByQuote(reference)[0] || null,
    remove: () => fail("APPEND_ONLY_DELETE_DENIED", "Printable versions are append-only"),
    replace: () => fail("APPEND_ONLY_UPDATE_DENIED", "Printable versions are append-only"),
    diagnostics: () => deepFreeze({
      contractVersion: CONTRACT_VERSION,
      storageSchemaVersion: STORAGE_SCHEMA_VERSION,
      appendOnly: true,
      rawPdfPersisted: false,
      htmlPersisted: false,
      remoteEffects: false,
    }),
  });
}

function reopenQuotePrintableVersion({ record } = {}) {
  const validated = assertVersionRecord(record);
  const readModel = deepFreeze(cloneJson(validated.readModelSnapshot));
  const printableDocument = buildProductSpecificQuotePrintableDocument({
    readModel,
    pageFormat: validated.pageFormat,
  });
  const pdfPacket = buildQuotePrintablePdf({
    readModel,
    printableDocument,
    generatedAt: validated.generatedAt,
    title: readModel.productProfile.documentTitle,
  });
  const manifest = validated.renderManifest;
  const mismatches = [
    ["fileName", printableDocument.fileName, manifest.fileName],
    ["binaryRevisionHash", pdfPacket.binaryRevisionHash, manifest.binaryRevisionHash],
    ["pageCount", pdfPacket.pageCount, manifest.pageCount],
    ["byteLength", pdfPacket.byteLength, manifest.byteLength],
    ["pdfContractVersion", pdfPacket.contractVersion, manifest.pdfContractVersion],
  ].filter(([, actual, expected]) => actual !== expected).map(([key]) => key);
  if (mismatches.length) {
    fail("REOPEN_RENDER_MISMATCH", "Reopened version does not match its manifest", { mismatches });
  }
  return deepFreeze({
    status: "REOPENED_EXACT_REVISION",
    record: validated,
    readModel,
    printableDocument,
    pdfPacket,
  });
}

export {
  CONTRACT_VERSION,
  DEFAULT_STORAGE_KEY,
  QUOTE_PRINTABLE_VERSION_TYPE,
  STORAGE_SCHEMA_VERSION,
  QuotePrintableRepositoryError,
  assertVersionRecord,
  createLocalStorageStore,
  createMemoryStore,
  createQuotePrintableVersionRecord,
  createQuotePrintableVersionRepository,
  reopenQuotePrintableVersion,
  stableDigest,
  stableStringify,
};
