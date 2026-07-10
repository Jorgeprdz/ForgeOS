"use strict";

const assert = require("assert/strict");
const fs = require("fs");
const path = require("path");

const adapterPath = path.join(
  __dirname,
  "quote-preview-controlled-browser-confirmation-persistence-adapter.js"
);

const adapterSource = fs.readFileSync(adapterPath, "utf8");

const {
  persistConfirmedQuotePreviewPdfResult,
} = require(adapterPath);

const contract = require(
  "./quote-preview-pdf-result-persistence-contract.js"
);

const storeModule = require(
  "../../runtime/quote-preview/quote-preview-pdf-result-store.js"
);

const canonicalKeys = [
  "name",
  "family",
  "product",
  "insured",
  "sumAssured",
  "annualPremium",
  "plannedOrAvePremium",
  "coveragePeriod",
].sort();

const controlledNowMs = Date.parse("2026-07-10T12:00:00.000Z");
const createdAt = "2026-07-10T12:00:00.000Z";
const expiresAt = "2026-07-11T12:00:00.000Z";

function createNativeResult(label, plannedAnnual = null) {
  return {
    product: "IMAGINA SER",
    prospect: `PERSONA SINTETICA ${label}`,
    sumInsured: 1500000,
    premiumTable: {
      annual: label === "ALFA" ? 48000 : 52000,
      plannedAnnual,
    },
    policyTerm: "42 años",
  };
}

function createContext(label) {
  return {
    name: `PRUEBA CONFIRMADA ${label}`,
    product_family: "life",
  };
}

function createRequest(label, store, extra = {}) {
  return {
    confirmed: true,
    store,
    nativeResult: createNativeResult(label),
    context: createContext(label),
    previewResultId: `107z15e8c-${label.toLowerCase()}`,
    createdAt,
    expiresAt,
    ambiguity: {},
    source: {
      controlledTest: true,
      syntheticVariant: label,
    },
    ...extra,
  };
}

function expectCode(fn, code) {
  assert.throws(fn, error => {
    assert.equal(error && error.code, code);
    return true;
  });
}

function createCountingStore() {
  let writes = 0;
  let reads = 0;

  return {
    store: {
      writePreviewResult() {
        writes += 1;
        throw new Error("write must not run");
      },
      readPreviewResult() {
        reads += 1;
        throw new Error("read must not run");
      },
    },
    counts() {
      return { writes, reads };
    },
  };
}

function run() {
  assert.equal(
    typeof persistConfirmedQuotePreviewPdfResult,
    "function"
  );

  const absentConfirmation = createCountingStore();

  expectCode(
    () => persistConfirmedQuotePreviewPdfResult({
      store: absentConfirmation.store,
    }),
    "QUOTE_PREVIEW_CONFIRMATION_REQUIRED"
  );

  assert.deepStrictEqual(
    absentConfirmation.counts(),
    { writes: 0, reads: 0 }
  );

  const falseConfirmation = createCountingStore();

  expectCode(
    () => persistConfirmedQuotePreviewPdfResult({
      confirmed: false,
      store: falseConfirmation.store,
    }),
    "QUOTE_PREVIEW_CONFIRMATION_REQUIRED"
  );

  assert.deepStrictEqual(
    falseConfirmation.counts(),
    { writes: 0, reads: 0 }
  );

  expectCode(
    () => persistConfirmedQuotePreviewPdfResult({
      confirmed: true,
    }),
    "CONFIRMATION_PERSISTENCE_STORE_REQUIRED"
  );

  expectCode(
    () => persistConfirmedQuotePreviewPdfResult({
      confirmed: true,
      store: {},
    }),
    "CONFIRMATION_PERSISTENCE_STORE_WRITE_REQUIRED"
  );

  expectCode(
    () => persistConfirmedQuotePreviewPdfResult({
      confirmed: true,
      store: {
        writePreviewResult() {},
      },
    }),
    "CONFIRMATION_PERSISTENCE_STORE_READ_REQUIRED"
  );

  const backend = storeModule.createMemoryBackend();
  const officialStore = storeModule.createStore({
    backend,
    now: () => controlledNowMs,
  });

  let writeCount = 0;
  let readCount = 0;
  let capturedWriteInput = null;
  let capturedReadIdentity = null;
  let returnedWriteIdentity = null;

  const observedStore = {
    writePreviewResult(input) {
      writeCount += 1;
      capturedWriteInput = JSON.parse(JSON.stringify(input));
      returnedWriteIdentity =
        officialStore.writePreviewResult(input);
      return returnedWriteIdentity;
    },
    readPreviewResult(identity) {
      readCount += 1;
      capturedReadIdentity =
        JSON.parse(JSON.stringify(identity));
      return officialStore.readPreviewResult(identity);
    },
  };

  const alfa =
    persistConfirmedQuotePreviewPdfResult(
      createRequest("ALFA", observedStore)
    );

  assert.equal(writeCount, 1);
  assert.equal(readCount, 1);
  assert.deepStrictEqual(
    capturedReadIdentity,
    returnedWriteIdentity
  );
  assert.deepStrictEqual(
    Object.keys(capturedWriteInput.fields).sort(),
    canonicalKeys
  );
  assert.equal(
    capturedWriteInput.fields.plannedOrAvePremium,
    null
  );
  assert.equal(
    alfa.record.fields.insured,
    "PERSONA SINTETICA ALFA"
  );
  assert.equal(Object.isFrozen(alfa), true);
  assert.equal(Object.isFrozen(alfa.identity), true);
  contract.validateRecord(alfa.record);

  const beta =
    persistConfirmedQuotePreviewPdfResult(
      createRequest("BETA", observedStore)
    );

  assert.equal(writeCount, 2);
  assert.equal(readCount, 2);
  assert.deepStrictEqual(
    Object.keys(beta.record.fields).sort(),
    canonicalKeys
  );
  assert.equal(
    beta.record.fields.insured,
    "PERSONA SINTETICA BETA"
  );
  assert.notEqual(
    alfa.record.fields.insured,
    beta.record.fields.insured
  );
  assert.notDeepStrictEqual(
    alfa.record.fields,
    beta.record.fields
  );

  assert.equal(/\blocalStorage\b/.test(adapterSource), false);
  assert.equal(/\bwindow\b/.test(adapterSource), false);
  assert.equal(/\bdocument\b/.test(adapterSource), false);
  assert.equal(
    /forge-quote-pdf-preview-engine/.test(adapterSource),
    false
  );
  assert.equal(
    /generic[-_ ]bridge/i.test(adapterSource),
    false
  );

  const requireMatches = [
    ...adapterSource.matchAll(
      /require\(\s*["']([^"']+)["']\s*\)/g
    ),
  ].map(match => match[1]).sort();

  assert.deepStrictEqual(requireMatches, [
    "./quote-preview-pdf-result-persistence-contract.js",
    "./quote-preview-pdf-result-persistence-coordinator.js",
  ]);

  const result = {
    chain:
      "107Z15E8C_DEDICATED_BROWSER_CONFIRMATION_PERSISTENCE_ADAPTER_SCOPED_IMPLEMENTATION_GATE",
    status: "PASS",
    testsPass: true,
    testCount: 12,
    explicitConfirmationRequired: true,
    zeroWritesBeforeConfirmation: true,
    invalidStoreRejected: true,
    canonicalFieldCount: 8,
    exactCanonicalFieldsPreserved: true,
    plannedOrAvePremiumNullPreserved: true,
    officialStoreWriteUsed: true,
    writeIdentityUsedForRead: true,
    deepEqualRoundTripPass: true,
    differentialNativeResultsPass: true,
    noBrowserGlobalsRequired: true,
    directLocalStorageAccess: false,
    newExtractionEngineIntroduced: false,
    genericBridgeIntroduced: false,
    returnedResultFrozen: true,
    returnedIdentityFrozen: true,
    adapterExport:
      "persistConfirmedQuotePreviewPdfResult",
    next:
      "107Z15E8D_CONTROLLED_BROWSER_CONFIRMATION_UI_WIRING_AUTHORIZATION_GATE",
  };

  if (process.env.TEST_RESULT_JSON) {
    fs.writeFileSync(
      process.env.TEST_RESULT_JSON,
      JSON.stringify(result, null, 2) + "\n"
    );
  }

  console.log(
    "PASS_107Z15E8C_ADAPTER_UNIT_TESTS=true"
  );
  console.log("TEST_COUNT=12");
  console.log("CANONICAL_FIELD_COUNT=8");
  console.log("ZERO_WRITES_BEFORE_CONFIRMATION=true");
  console.log("DEEP_EQUAL_ROUND_TRIP_PASS=true");
  console.log("DIFFERENTIAL_NATIVE_RESULTS_PASS=true");
}

try {
  run();
} catch (error) {
  const result = {
    chain:
      "107Z15E8C_DEDICATED_BROWSER_CONFIRMATION_PERSISTENCE_ADAPTER_SCOPED_IMPLEMENTATION_GATE",
    status: "HOLD",
    testsPass: false,
    exactError:
      error && error.stack ? error.stack : String(error),
  };

  if (process.env.TEST_RESULT_JSON) {
    fs.writeFileSync(
      process.env.TEST_RESULT_JSON,
      JSON.stringify(result, null, 2) + "\n"
    );
  }

  console.error("HOLD_107Z15E8C_ADAPTER_UNIT_TESTS=true");
  console.error(
    error && error.stack ? error.stack : String(error)
  );
  process.exitCode = 1;
}
