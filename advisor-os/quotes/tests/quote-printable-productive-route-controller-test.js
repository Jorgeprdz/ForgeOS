import assert from "node:assert/strict";

import {
  createQuotePrintableRouteController,
  identityFromLifecycleResult,
  normalizePageFormat,
} from "../../../docs/static-preview/quote-printable-runtime/forge-quote-printable-route-controller.js";

const pass = (number, message) =>
  console.log(`PASS ${number} - ${message}`);

function createStorage() {
  const values = new Map();
  return {
    getItem(key) {
      return values.has(key) ? values.get(key) : null;
    },
    setItem(key, value) {
      values.set(key, String(value));
    },
    dump() {
      return [...values.values()].join("\n");
    },
  };
}

function collectNormalizedKeys(value, output = []) {
  if (Array.isArray(value)) {
    value.forEach((item) => collectNormalizedKeys(item, output));
    return output;
  }
  if (!value || typeof value !== "object") return output;
  for (const [key, item] of Object.entries(value)) {
    output.push(String(key).toLowerCase().replace(/[^a-z0-9]/g, ""));
    collectNormalizedKeys(item, output);
  }
  return output;
}

function snapshot() {
  return {
    packetType: "ACCEPTED_QUOTE_AND_CALCULATION_REVIEW_SNAPSHOT",
    reviewOnly: true,
    acceptedQuote: {
      quoteId: "quote-orvi-browser",
      acceptedAt: "2026-07-30T18:00:00-06:00",
      client: { fullName: "Cliente navegador" },
      advisor: { name: "Jorge Palacios" },
      context: { productFamily: "ORVI" },
      nativeResult: {
        product: "ORVI 10 PAY USD",
        productFamily: "ORVI",
      },
      source: {
        pdfSha256:
          "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
      },
    },
    calculation: {
      product: "ORVI 10 PAY USD",
      productFamily: "ORVI",
      plan: "ORVI 10 PAY",
      currency: "USD",
      paymentMode: "Anual",
      paymentYears: 10,
      coveragePeriod: "10 años",
      sumInsured: 1000000,
      annualPremium: 12000,
      totalAnnualPremium: 14000,
      totalContributed: 100000,
      totalRecovery: 154000,
      monthlyIncomeMXN: 23100,
      calculatedAt: "2026-07-30T17:55:00-06:00",
    },
    productIntelligence: {
      schema: {
        id: "forge.product_intelligence.orvi",
        version: "1.0.0",
      },
      identity: {
        detected_product_name: "ORVI 10 PAY USD",
      },
      protection_summary: {
        basic_sum_assured: {
          value: 1000000,
          currency: "USD",
          truth_status: "source_provided",
        },
      },
      premium_structure: {
        payment_term_years: 10,
        basic_annual_premium: {
          value: 12000,
          currency: "USD",
          truth_status: "source_provided",
        },
        total_annual_premium: {
          value: 14000,
          currency: "USD",
          truth_status: "source_provided",
        },
      },
      provenance: {
        source_date: "2026-07-30",
      },
    },
    authority: {
      numericTruthOwner: "QUOTE_SOURCE_AND_PRODUCT_INTELLIGENCE",
      finalAuthority: "HUMAN",
    },
    safety: {
      exportEnabled: false,
      sendable: false,
      crmMutationAllowed: false,
      quoteMutationAllowed: false,
      rawPdfAllowed: false,
    },
  };
}

const identity = Object.freeze({
  durable: true,
  quoteReference: "quote:11111111-1111-4111-8111-111111111111",
  quoteVersionReference:
    "quote-version:22222222-2222-4222-8222-222222222222",
  prospectReference: "33333333-3333-4333-8333-333333333333",
  productReference: "product:orvi-10-pay-usd",
  snapshotDigest:
    "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
});

assert.equal(normalizePageFormat("Carta"), "LETTER");
assert.equal(normalizePageFormat("a4"), "A4");
pass(1, "A4 and Carta page formats normalize for the productive route");

assert.deepEqual(identityFromLifecycleResult(identity), {
  quoteReference: identity.quoteReference,
  quoteVersionReference: identity.quoteVersionReference,
  prospectReference: identity.prospectReference,
  productReference: identity.productReference,
  quoteSnapshotDigest: identity.snapshotDigest,
});
pass(2, "durable Cartera lifecycle receipts become canonical QPD identity");

let currentSnapshot = null;
const storage = createStorage();
const times = [
  "2026-07-30T18:10:00-06:00",
  "2026-07-30T18:11:00-06:00",
  "2026-07-30T18:12:00-06:00",
  "2026-07-30T18:13:00-06:00",
];
let downloadCalls = 0;
const controller = createQuotePrintableRouteController({
  snapshotProvider: () => currentSnapshot,
  identityProvider: async () => identity,
  storage,
  clock: () => times.shift() || "2026-07-30T18:14:00-06:00",
  downloadAdapter({ pdfPacket, userInitiated }) {
    assert.equal(userInitiated, true);
    assert.equal(pdfPacket.status, "PDF_BINARY_READY");
    downloadCalls += 1;
    return Object.freeze({
      status: "DOWNLOAD_DISPATCHED",
      fileName: pdfPacket.fileName,
      byteLength: pdfPacket.byteLength,
      binaryRevisionHash: pdfPacket.binaryRevisionHash,
    });
  },
});

assert.equal(controller.state().acceptedQuoteReady, false);
await assert.rejects(
  controller.preview(),
  /Confirma una cotización/,
);
pass(3, "route remains closed until the advisor confirms a quote");

currentSnapshot = snapshot();
const preview = await controller.preview({
  requestedPageFormat: "LETTER",
});
assert.equal(preview.bundle.printableDocument.status, "PRINTABLE_HTML_READY");
assert.equal(preview.bundle.pdfPacket.status, "PDF_BINARY_READY");
assert.equal(preview.bundle.pageFormat, "LETTER");
assert.equal(preview.persistence.status, "APPENDED");
assert.equal(preview.persistence.durable, true);
pass(4, "confirmed quote opens a product-aware printable preview and appends a version");

const storedPayload = JSON.parse(storage.dump());
const storedKeys = collectNormalizedKeys(storedPayload);
for (const forbidden of [
  "pdfbytes",
  "rawpdf",
  "arraybuffer",
  "base64",
  "binary",
  "blob",
  "html",
]) {
  assert.equal(storedKeys.includes(forbidden), false);
}
assert.equal(storage.dump().includes("%PDF-1.4"), false);
assert.equal(storage.dump().includes("<!doctype html>"), false);
pass(5, "browser storage persists no PDF bytes, raw PDF, Base64 or HTML payload");

const history = await controller.history();
assert.equal(history.length, 1);
assert.equal(
  history[0].quoteIdentity.quoteVersionReference,
  identity.quoteVersionReference,
);
pass(6, "history is scoped to canonical Quote and Quote Version identity");

await assert.rejects(
  controller.download({ userInitiated: false }),
  /acción humana explícita/,
);
pass(7, "download remains blocked without an explicit human action");

const downloaded = await controller.download({
  userInitiated: true,
  documentRef: {},
  urlRef: {},
});
assert.equal(downloaded.receipt.status, "DOWNLOAD_DISPATCHED");
assert.equal(downloaded.persistence.status, "IDEMPOTENT_REPLAY");
assert.equal(downloadCalls, 1);
assert.equal((await controller.history()).length, 1);
pass(8, "preview then download reuses the same durable version idempotently");

const reopened = controller.reopen(
  history[0].printableVersionReference,
);
assert.equal(reopened.status, "REOPENED_EXACT_REVISION");
assert.equal(
  reopened.pdfPacket.binaryRevisionHash,
  preview.bundle.pdfPacket.binaryRevisionHash,
);
assert.equal(
  reopened.pdfPacket.byteLength,
  preview.bundle.pdfPacket.byteLength,
);
pass(9, "historical version reopens with the exact verified PDF revision");

const controllerAfterReload = createQuotePrintableRouteController({
  snapshotProvider: () => currentSnapshot,
  identityProvider: async () => identity,
  storage,
  clock: () => "2026-07-30T18:20:00-06:00",
  downloadAdapter() {
    throw new Error("download not expected");
  },
});
await controllerAfterReload.ensureDurableIdentity();
const afterReloadHistory = await controllerAfterReload.history();
assert.equal(afterReloadHistory.length, 1);
const reopenedAfterReload = controllerAfterReload.reopen(
  afterReloadHistory[0].printableVersionReference,
);
assert.equal(
  reopenedAfterReload.pdfPacket.binaryRevisionHash,
  preview.bundle.pdfPacket.binaryRevisionHash,
);
pass(10, "local-first history survives a new browser controller instance");

const localOnlyController = createQuotePrintableRouteController({
  snapshotProvider: () => currentSnapshot,
  identityProvider: async () => ({
    durable: false,
    status: "LOCAL_REVIEW_ONLY",
  }),
  clock: (() => {
    const localTimes = [
      "2026-07-30T18:30:00-06:00",
      "2026-07-30T18:31:00-06:00",
    ];
    return () => localTimes.shift();
  })(),
});
const localOnly = await localOnlyController.preview();
assert.equal(localOnly.bundle.pdfPacket.status, "PDF_BINARY_READY");
assert.equal(
  localOnly.persistence.status,
  "BLOCKED_DURABLE_QUOTE_IDENTITY_REQUIRED",
);
assert.equal((await localOnlyController.history()).length, 0);
pass(11, "preview works locally while history fails closed without Cartera identity");

controller.clearCurrentQuote();
assert.equal(controller.state().printableReady, false);
assert.equal(controller.state().durableIdentityReady, false);
assert.equal(controller.state().automaticDownloadAllowed, false);
assert.equal(controller.state().automaticSendAllowed, false);
pass(12, "clearing the quote removes active identity and preserves default-false effects");

console.log("STATUS=PASS_QPD06_PRODUCTIVE_ROUTE_CONTROLLER");
console.log("Quote Printable Productive Route Controller PASS 12/12");
