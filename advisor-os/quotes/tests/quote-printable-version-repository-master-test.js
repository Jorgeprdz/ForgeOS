import assert from "node:assert/strict";

import {
  ACCEPTED_QUOTE_SNAPSHOT_TYPE,
  buildQuotePrintableReadModel,
} from "../printable/quote-printable-read-model.js";
import {
  buildProductSpecificQuotePrintableDocument,
  buildProductSpecificQuotePrintableReadModel,
} from "../printable/quote-printable-product-profile.js";
import { buildQuotePrintablePdf } from "../printable/quote-printable-pdf-generator.js";
import {
  CONTRACT_VERSION,
  QUOTE_PRINTABLE_VERSION_TYPE,
  assertVersionRecord,
  createLocalStorageStore,
  createMemoryStore,
  createQuotePrintableVersionRecord,
  createQuotePrintableVersionRepository,
  reopenQuotePrintableVersion,
} from "../printable/quote-printable-version-repository.js";
import {
  APPEND_RPC,
  HISTORY_VIEW,
  createQuotePrintableSupabaseRepository,
} from "../printable/quote-printable-supabase-repository.js";

const pass = (number, message) => console.log(`PASS ${number} - ${message}`);

function reviewSnapshot() {
  return {
    packetType: ACCEPTED_QUOTE_SNAPSHOT_TYPE,
    reviewOnly: true,
    acceptedQuote: {
      quoteId: "quote-gmm-qpd05",
      acceptedAt: "2026-07-30T18:00:00-06:00",
      client: { fullName: "Cliente QPD05" },
      advisor: { name: "Jorge Palacios" },
      context: { productFamily: "GMM" },
      nativeResult: {
        product: "Alfa Medical Flex",
        productFamily: "GMM",
        hospitalLevel: "Íntegro",
      },
    },
    calculation: {
      product: "Alfa Medical Flex",
      productFamily: "GMM",
      plan: "Alfa Medical Flex Íntegro",
      currency: "MXN",
      paymentMode: "Anual",
      coveragePeriod: "Anual renovable",
      sumInsured: 50000000,
      annualPremium: 42000,
      totalAnnualPremium: 42000,
      deductible: 25000,
      coinsurancePercent: 10,
      coinsuranceCap: 60000,
      hospitalLevel: "Íntegro",
      hospitalNetwork: "Red nacional",
      calculatedAt: "2026-07-30T17:55:00-06:00",
    },
    productIntelligence: {
      schema: { id: "forge.product_intelligence.gmm", version: "1.0.0" },
      identity: { detected_product_name: "Alfa Medical Flex" },
      protection_summary: {
        basic_sum_assured: {
          value: 50000000,
          currency: "MXN",
          truth_status: "source_provided",
        },
      },
      premium_structure: {
        basic_annual_premium: {
          value: 42000,
          currency: "MXN",
          truth_status: "source_provided",
        },
        total_annual_premium: {
          value: 42000,
          currency: "MXN",
          truth_status: "source_provided",
        },
      },
      provenance: { source_date: "2026-07-30" },
    },
    authority: { finalAuthority: "HUMAN" },
    safety: { rawPdfAllowed: false },
  };
}

function assets(generatedAt = "2026-07-30T18:10:00-06:00") {
  const snapshot = reviewSnapshot();
  const base = buildQuotePrintableReadModel({
    reviewSnapshot: snapshot,
    generatedAt: "2026-07-30T18:05:00-06:00",
  });
  const readModel = buildProductSpecificQuotePrintableReadModel({
    readModel: base,
    reviewSnapshot: snapshot,
  });
  const printableDocument = buildProductSpecificQuotePrintableDocument({
    readModel,
    pageFormat: "A4",
  });
  const pdfPacket = buildQuotePrintablePdf({
    readModel,
    printableDocument,
    generatedAt,
    title: readModel.productProfile.documentTitle,
  });
  return { readModel, printableDocument, pdfPacket, generatedAt };
}

const quoteIdentity = {
  quoteReference: "quote:11111111-1111-4111-8111-111111111111",
  quoteVersionReference: "quote-version:22222222-2222-4222-8222-222222222222",
  prospectReference: "33333333-3333-4333-8333-333333333333",
  productReference: "alfa-medical-flex",
  quoteSnapshotDigest: "a".repeat(64),
};

const firstAssets = assets();
const record = createQuotePrintableVersionRecord({
  quoteIdentity,
  ...firstAssets,
  persistedAt: "2026-07-30T18:11:00-06:00",
});
assert.equal(record.packetType, QUOTE_PRINTABLE_VERSION_TYPE);
assert.equal(record.contractVersion, CONTRACT_VERSION);
assert.match(record.printableVersionReference, /^qpd-version:[a-f0-9]{64}$/);
assert.equal(record.productProfileId, "GMM");
pass(1, "product-profiled PDF becomes a durable printable version record");

const serialized = JSON.stringify(record);
assert.doesNotMatch(serialized, /"html"\s*:/i);
assert.doesNotMatch(serialized, /"(bytes|blob|base64|pdfBytes|rawPdf)"\s*:/i);
assert.equal(record.safety.rawPdfPersisted, false);
assert.equal(record.safety.htmlPersisted, false);
pass(2, "record persists no HTML, PDF bytes, Blob or binary payload");

const memoryRepository = createQuotePrintableVersionRepository({
  store: createMemoryStore(),
});
assert.equal(memoryRepository.append(record).status, "APPENDED");
assert.equal(memoryRepository.append(record).status, "IDEMPOTENT_REPLAY");
assert.equal(memoryRepository.get(record.printableVersionReference).recordDigest, record.recordDigest);
pass(3, "memory repository appends once and replays idempotently");

const storageState = new Map();
const storage = {
  getItem: (key) => storageState.get(key) ?? null,
  setItem: (key, value) => storageState.set(key, value),
};
const browserRepositoryA = createQuotePrintableVersionRepository({
  store: createLocalStorageStore({ storage }),
});
browserRepositoryA.append(record);
const browserRepositoryB = createQuotePrintableVersionRepository({
  store: createLocalStorageStore({ storage }),
});
assert.equal(
  browserRepositoryB.get(record.printableVersionReference).recordDigest,
  record.recordDigest,
);
pass(4, "local-first repository reopens after a new browser repository instance");

const reopened = reopenQuotePrintableVersion({ record });
assert.equal(reopened.status, "REOPENED_EXACT_REVISION");
assert.equal(reopened.pdfPacket.binaryRevisionHash, record.renderManifest.binaryRevisionHash);
assert.equal(reopened.pdfPacket.byteLength, record.renderManifest.byteLength);
assert.equal(reopened.pdfPacket.pageCount, record.renderManifest.pageCount);
pass(5, "reopen regenerates the exact PDF revision and verifies its manifest");

const secondAssets = assets("2026-07-30T18:20:00-06:00");
const secondRecord = createQuotePrintableVersionRecord({
  quoteIdentity,
  ...secondAssets,
  persistedAt: "2026-07-30T18:21:00-06:00",
});
browserRepositoryB.append(secondRecord);
const versions = browserRepositoryB.listByQuote(quoteIdentity.quoteReference);
assert.equal(versions.length, 2);
assert.equal(versions[0].printableVersionReference, secondRecord.printableVersionReference);
assert.equal(browserRepositoryB.latestByQuote(quoteIdentity.quoteReference).recordDigest,
  secondRecord.recordDigest);
pass(6, "new renders append as versions and latest lookup never overwrites history");

assert.throws(() => browserRepositoryB.remove(record.printableVersionReference),
  /append-only/);
assert.throws(() => browserRepositoryB.replace(record), /append-only/);
pass(7, "local repositories deny update and delete operations");

const tampered = JSON.parse(JSON.stringify(record));
tampered.renderManifest.pageCount += 1;
assert.throws(() => assertVersionRecord(tampered), /digest mismatch/);
assert.throws(() => reopenQuotePrintableVersion({ record: tampered }), /digest mismatch/);
pass(8, "tampered persisted versions fail closed before reopen");

const badAssets = assets();
assert.throws(() => createQuotePrintableVersionRecord({
  quoteIdentity: { ...quoteIdentity, quoteSnapshotDigest: "" },
  ...badAssets,
}), /snapshot digest/i);
assert.throws(() => createQuotePrintableVersionRecord({
  quoteIdentity,
  ...badAssets,
  persistedAt: "2026-07-30T18:00:00-06:00",
}), /cannot precede/);
pass(9, "missing durable identity and invalid chronology are rejected");

const rpcCalls = [];
const rows = [
  { record_payload: secondRecord, persisted_at: secondRecord.persistedAt },
  { record_payload: record, persisted_at: record.persistedAt },
];
function queryBuilder(resultRows) {
  return {
    select() { return this; },
    eq() { return this; },
    order() { return this; },
    limit(limit) { return Promise.resolve({ data: resultRows.slice(0, limit), error: null }); },
    maybeSingle() { return Promise.resolve({ data: resultRows[0] || null, error: null }); },
  };
}
const supabaseClient = {
  auth: { getUser: async () => ({ data: { user: { id: "advisor-1" } }, error: null }) },
  rpc: async (name, args) => {
    rpcCalls.push({ name, args });
    return {
      data: {
        printableVersionReference: record.printableVersionReference,
        documentReference: record.documentReference,
        recordDigest: record.recordDigest,
        idempotentReplay: false,
      },
      error: null,
    };
  },
  from: (name) => {
    assert.equal(name, HISTORY_VIEW);
    return queryBuilder(rows);
  },
};
const remote = createQuotePrintableSupabaseRepository(supabaseClient);
const remoteAppend = await remote.append(record);
assert.equal(remoteAppend.status, "APPENDED");
assert.equal(rpcCalls[0].name, APPEND_RPC);
assert.equal(rpcCalls[0].args.p_quote_reference, quoteIdentity.quoteReference);
assert.equal(rpcCalls[0].args.p_quote_version_reference,
  quoteIdentity.quoteVersionReference);
pass(10, "Supabase gateway appends through the governed RPC and canonical Quote identity");

assert.equal((await remote.get(record.printableVersionReference)).recordDigest,
  secondRecord.recordDigest);
assert.equal((await remote.listByQuote(quoteIdentity.quoteReference)).length, 2);
assert.equal((await remote.latestByQuote(quoteIdentity.quoteReference)).recordDigest,
  secondRecord.recordDigest);
pass(11, "remote repository can reopen and list versions across device sessions");

const diagnostics = remote.diagnostics();
assert.equal(diagnostics.directInsertAllowed, false);
assert.equal(diagnostics.directUpdateAllowed, false);
assert.equal(diagnostics.directDeleteAllowed, false);
assert.equal(diagnostics.requiresCartera001B, true);
assert.equal(diagnostics.rawPdfPersisted, false);
pass(12, "remote adapter preserves RPC-only, Cartera-dependent and no-binary boundaries");

const expiredClient = {
  auth: { getUser: async () => ({ data: { user: null }, error: null }) },
  rpc: async () => ({ data: null, error: null }),
  from: () => queryBuilder([]),
};
await assert.rejects(
  () => createQuotePrintableSupabaseRepository(expiredClient).append(record),
  /sesión expiró/,
);
pass(13, "remote persistence fails closed without an authenticated advisor");

const conflictClient = {
  auth: supabaseClient.auth,
  rpc: async () => ({ data: null, error: { message: "QPD05_RECORD_CONFLICT" } }),
  from: () => queryBuilder([]),
};
await assert.rejects(
  () => createQuotePrintableSupabaseRepository(conflictClient).append(record),
  /contenido distinto/,
);
pass(14, "remote idempotency conflicts surface as a safe governed error");

assert.equal(Object.isFrozen(record), true);
assert.equal(Object.isFrozen(record.readModelSnapshot), true);
assert.equal(Object.isFrozen(reopened), true);
assert.throws(() => { record.pageFormat = "LETTER"; }, TypeError);
pass(15, "records and reopened packets remain deeply immutable");

console.log("STATUS=PASS_QPD05_PERSISTENCE_VERSIONING_AND_REOPEN");
console.log("Quote Printable Persistence PASS 15/15");
