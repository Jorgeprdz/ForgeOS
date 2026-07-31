import {
  buildQuotePrintableReadModel,
} from "./quote-printable-read-model.js";
import {
  buildProductSpecificQuotePrintableDocument,
  buildProductSpecificQuotePrintableReadModel,
} from "./quote-printable-product-profile.js";
import {
  buildQuotePrintablePdf,
  downloadQuotePrintablePdf,
} from "./quote-printable-pdf-generator.js";
import {
  createLocalStorageStore,
  createMemoryStore,
  createQuotePrintableVersionRecord,
  createQuotePrintableVersionRepository,
  reopenQuotePrintableVersion,
} from "./quote-printable-version-repository.js";

const QPD06_ROUTE_CONTROLLER_VERSION = "QPD06_ROUTE_CONTROLLER_V1";
const PAGE_FORMATS = Object.freeze(["A4", "LETTER"]);

class QuotePrintableRouteError extends Error {
  constructor(code, message, details = null) {
    super(message);
    this.name = "QuotePrintableRouteError";
    this.code = code;
    this.details = details;
  }
}

function fail(code, message, details = null) {
  throw new QuotePrintableRouteError(code, message, details);
}

function isRecord(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function deepFreeze(value, seen = new WeakSet()) {
  if (!value || typeof value !== "object" || seen.has(value)) return value;
  seen.add(value);
  Object.values(value).forEach((item) => deepFreeze(item, seen));
  return Object.freeze(value);
}

function normalizePageFormat(value) {
  const normalized = String(value || "A4").trim().toUpperCase();
  const resolved = normalized === "CARTA" ? "LETTER" : normalized;
  if (!PAGE_FORMATS.includes(resolved)) {
    fail("PAGE_FORMAT_INVALID", "El formato de página no es compatible.");
  }
  return resolved;
}

function normalizeIdentity(value) {
  if (!isRecord(value)) return null;
  const identity = {
    quoteReference: String(value.quoteReference || "").trim(),
    quoteVersionReference: String(value.quoteVersionReference || "").trim(),
    prospectReference: String(value.prospectReference || "").trim(),
    productReference: String(value.productReference || "").trim(),
    quoteSnapshotDigest: String(
      value.quoteSnapshotDigest || value.snapshotDigest || "",
    ).trim(),
  };
  if (Object.values(identity).some((item) => !item)) return null;
  return deepFreeze(identity);
}

function identityFromLifecycleResult(value) {
  if (!isRecord(value) || value.durable !== true) return null;
  return normalizeIdentity(value);
}

function createRepository(storage) {
  if (storage?.getItem && storage?.setItem) {
    try {
      return createQuotePrintableVersionRepository({
        store: createLocalStorageStore({ storage }),
      });
    } catch {}
  }
  return createQuotePrintableVersionRepository({
    store: createMemoryStore(),
  });
}

function createQuotePrintableRouteController({
  snapshotProvider,
  identityProvider = null,
  storage = null,
  clock = () => new Date().toISOString(),
  downloadAdapter = downloadQuotePrintablePdf,
} = {}) {
  if (typeof snapshotProvider !== "function") {
    fail("SNAPSHOT_PROVIDER_REQUIRED", "Se requiere la fuente de cotización confirmada.");
  }
  if (identityProvider !== null && typeof identityProvider !== "function") {
    fail("IDENTITY_PROVIDER_INVALID", "La fuente de identidad durable no es válida.");
  }
  if (typeof clock !== "function") {
    fail("CLOCK_INVALID", "El reloj del controlador no es válido.");
  }
  if (typeof downloadAdapter !== "function") {
    fail("DOWNLOAD_ADAPTER_INVALID", "El adaptador de descarga no es válido.");
  }

  const repository = createRepository(storage);
  let pageFormat = "A4";
  let activeBundle = null;
  let durableIdentity = null;
  let lastPersistence = null;

  function snapshot() {
    const value = snapshotProvider();
    return isRecord(value) && value.reviewOnly === true ? value : null;
  }

  function setDurableIdentity(value) {
    durableIdentity = normalizeIdentity(value);
    return durableIdentity;
  }

  async function ensureDurableIdentity() {
    if (durableIdentity) return durableIdentity;
    if (!identityProvider) return null;
    const result = await identityProvider();
    const identity = identityFromLifecycleResult(result) || normalizeIdentity(result);
    if (identity) durableIdentity = identity;
    return durableIdentity;
  }

  function buildBundle({
    requestedPageFormat = pageFormat,
    generatedAt = clock(),
  } = {}) {
    const reviewSnapshot = snapshot();
    if (!reviewSnapshot) {
      fail(
        "ACCEPTED_QUOTE_REQUIRED",
        "Confirma una cotización antes de crear su versión imprimible.",
      );
    }
    const resolvedFormat = normalizePageFormat(requestedPageFormat);
    const readModel = buildQuotePrintableReadModel({
      reviewSnapshot,
      generatedAt,
    });
    const profiledReadModel =
      buildProductSpecificQuotePrintableReadModel({
        readModel,
        reviewSnapshot,
      });
    const printableDocument =
      buildProductSpecificQuotePrintableDocument({
        readModel: profiledReadModel,
        pageFormat: resolvedFormat,
      });
    const pdfPacket = buildQuotePrintablePdf({
      readModel: profiledReadModel,
      printableDocument,
      title: profiledReadModel.productProfile.documentTitle,
      generatedAt,
    });
    activeBundle = deepFreeze({
      generatedAt,
      pageFormat: resolvedFormat,
      readModel: profiledReadModel,
      printableDocument,
      pdfPacket,
      persistedRecord: null,
    });
    pageFormat = resolvedFormat;
    return activeBundle;
  }

  async function persistBundle(bundle = activeBundle) {
    if (!bundle) {
      fail("PRINTABLE_BUNDLE_REQUIRED", "Primero crea la versión imprimible.");
    }
    const identity = await ensureDurableIdentity();
    if (!identity) {
      lastPersistence = deepFreeze({
        status: "BLOCKED_DURABLE_QUOTE_IDENTITY_REQUIRED",
        durable: false,
      });
      return lastPersistence;
    }
    const record = createQuotePrintableVersionRecord({
      quoteIdentity: identity,
      readModel: bundle.readModel,
      printableDocument: bundle.printableDocument,
      pdfPacket: bundle.pdfPacket,
      generatedAt: bundle.generatedAt,
      persistedAt: clock(),
    });
    const result = repository.append(record);
    activeBundle = deepFreeze({
      ...bundle,
      persistedRecord: result.record,
    });
    lastPersistence = deepFreeze({
      status: result.status,
      durable: true,
      record: result.record,
    });
    return lastPersistence;
  }

  async function preview(options = {}) {
    const bundle = buildBundle(options);
    const persistence = await persistBundle(bundle);
    return deepFreeze({ bundle: activeBundle || bundle, persistence });
  }

  async function download({
    userInitiated = false,
    documentRef = globalThis.document,
    urlRef = globalThis.URL,
  } = {}) {
    if (userInitiated !== true) {
      fail("HUMAN_ACTION_REQUIRED", "La descarga requiere una acción humana explícita.");
    }
    const bundle = activeBundle || buildBundle();
    const persistence = await persistBundle(bundle);
    const receipt = downloadAdapter({
      pdfPacket: bundle.pdfPacket,
      userInitiated: true,
      documentRef,
      urlRef,
    });
    return deepFreeze({ receipt, persistence, bundle: activeBundle || bundle });
  }

  async function history() {
    const identity = await ensureDurableIdentity();
    if (!identity) return deepFreeze([]);
    return repository.listByQuote(identity.quoteReference);
  }

  function reopen(printableVersionReference) {
    const record = repository.get(printableVersionReference);
    if (!record) {
      fail("PRINTABLE_VERSION_NOT_FOUND", "La versión imprimible ya no está disponible.");
    }
    const reopened = reopenQuotePrintableVersion({ record });
    activeBundle = deepFreeze({
      generatedAt: record.generatedAt,
      pageFormat: record.pageFormat,
      readModel: reopened.readModel,
      printableDocument: reopened.printableDocument,
      pdfPacket: reopened.pdfPacket,
      persistedRecord: record,
    });
    durableIdentity = normalizeIdentity(record.quoteIdentity);
    return deepFreeze({ ...reopened, bundle: activeBundle });
  }

  function clearCurrentQuote() {
    activeBundle = null;
    durableIdentity = null;
    lastPersistence = null;
  }

  function setPageFormat(value) {
    pageFormat = normalizePageFormat(value);
    activeBundle = null;
    return pageFormat;
  }

  function state() {
    const accepted = Boolean(snapshot());
    const versions = durableIdentity
      ? repository.listByQuote(durableIdentity.quoteReference)
      : [];
    return deepFreeze({
      version: QPD06_ROUTE_CONTROLLER_VERSION,
      acceptedQuoteReady: accepted,
      pageFormat,
      printableReady: Boolean(activeBundle),
      durableIdentityReady: Boolean(durableIdentity),
      printableVersionCount: versions.length,
      latestPrintableVersionReference:
        versions[0]?.printableVersionReference || null,
      lastPersistenceStatus: lastPersistence?.status || null,
      automaticDownloadAllowed: false,
      automaticSendAllowed: false,
      quoteMutationAllowed: false,
      recalculationAllowed: false,
    });
  }

  return deepFreeze({
    version: QPD06_ROUTE_CONTROLLER_VERSION,
    buildBundle,
    clearCurrentQuote,
    download,
    ensureDurableIdentity,
    history,
    persistBundle,
    preview,
    reopen,
    setDurableIdentity,
    setPageFormat,
    state,
  });
}

export {
  PAGE_FORMATS,
  QPD06_ROUTE_CONTROLLER_VERSION,
  QuotePrintableRouteError,
  createQuotePrintableRouteController,
  identityFromLifecycleResult,
  normalizePageFormat,
};
