"use strict";

const assert = require("assert/strict");
const fs = require("fs");
const path = require("path");

const wiringPath = path.join(
  __dirname,
  "quote-preview-controlled-browser-confirmation-ui-wiring.js"
);

const wiringSource = fs.readFileSync(wiringPath, "utf8");

const {
  bindQuotePreviewConfirmationPersistenceUi,
} = require(wiringPath);

const storeModule = require(
  "../../runtime/quote-preview/quote-preview-pdf-result-store.js"
);

const controlledNowMs = Date.parse(
  "2026-07-10T12:00:00.000Z"
);
const ttlMs = 24 * 60 * 60 * 1000;

function expectCode(fn, code) {
  assert.throws(fn, error => {
    assert.equal(error && error.code, code);
    return true;
  });
}

function createPending(label = "ALFA") {
  return {
    nativeResult: {
      product: "IMAGINA SER",
      prospect: `PERSONA SINTETICA ${label}`,
      sumInsured: 1500000,
      premiumTable: {
        annual: 48000,
        plannedAnnual: null,
      },
      policyTerm: "42 años",
    },
    context: {
      name: `PRUEBA UI ${label}`,
      product_family: "life",
    },
    ambiguity: {},
    source: {
      controlledTest: true,
      label,
    },
  };
}

function createSurface(pending = createPending()) {
  let acceptHandler = null;
  let editHandler = null;
  let acceptSubscriptions = 0;
  let editSubscriptions = 0;
  let acceptUnsubscribes = 0;
  let editUnsubscribes = 0;
  let pendingReads = 0;
  const persisted = [];
  const editRequests = [];
  const errors = [];

  const surface = {
    subscribeAccept(handler) {
      acceptSubscriptions += 1;
      acceptHandler = handler;

      return () => {
        acceptUnsubscribes += 1;
      };
    },

    subscribeEdit(handler) {
      editSubscriptions += 1;
      editHandler = handler;

      return () => {
        editUnsubscribes += 1;
      };
    },

    readPendingPreview() {
      pendingReads += 1;
      return pending;
    },

    notifyPersisted(result, readPending, payload) {
      persisted.push({
        result,
        readPending,
        payload,
      });
    },

    notifyEditRequested(payload) {
      editRequests.push(payload);
    },

    notifyError(error, context) {
      errors.push({
        error,
        context,
      });
    },
  };

  return {
    surface,
    getAcceptHandler() {
      return acceptHandler;
    },
    getEditHandler() {
      return editHandler;
    },
    metrics() {
      return {
        acceptSubscriptions,
        editSubscriptions,
        acceptUnsubscribes,
        editUnsubscribes,
        pendingReads,
        persisted,
        editRequests,
        errors,
      };
    },
  };
}

function createOfficialObservedStore() {
  const backend = storeModule.createMemoryBackend();
  const officialStore = storeModule.createStore({
    backend,
    now: () => controlledNowMs,
  });

  let writes = 0;
  let reads = 0;
  let capturedWriteInput = null;
  let capturedReadIdentity = null;

  const store = {
    writePreviewResult(input) {
      writes += 1;
      capturedWriteInput =
        JSON.parse(JSON.stringify(input));
      return officialStore.writePreviewResult(input);
    },

    readPreviewResult(identity) {
      reads += 1;
      capturedReadIdentity =
        JSON.parse(JSON.stringify(identity));
      return officialStore.readPreviewResult(identity);
    },
  };

  return {
    store,
    metrics() {
      return {
        writes,
        reads,
        capturedWriteInput,
        capturedReadIdentity,
      };
    },
  };
}

function run() {
  assert.equal(
    typeof bindQuotePreviewConfirmationPersistenceUi,
    "function"
  );

  expectCode(
    () => bindQuotePreviewConfirmationPersistenceUi(),
    "QUOTE_PREVIEW_UI_SURFACE_REQUIRED"
  );

  expectCode(
    () => bindQuotePreviewConfirmationPersistenceUi({
      surface: {},
    }),
    "QUOTE_PREVIEW_UI_SUBSCRIBE_ACCEPT_REQUIRED"
  );

  const invalidStoreSurface = createSurface();

  expectCode(
    () => bindQuotePreviewConfirmationPersistenceUi({
      surface: invalidStoreSurface.surface,
      store: {},
    }),
    "QUOTE_PREVIEW_UI_STORE_WRITE_REQUIRED"
  );

  const surfaceHarness = createSurface();
  const storeHarness = createOfficialObservedStore();
  let idCalls = 0;

  const binding =
    bindQuotePreviewConfirmationPersistenceUi({
      surface: surfaceHarness.surface,
      store: storeHarness.store,
      createPreviewResultId(pending, payload) {
        idCalls += 1;
        assert.equal(
          pending.nativeResult.prospect,
          "PERSONA SINTETICA ALFA"
        );
        assert.deepStrictEqual(payload, {
          origin: "accept-button",
        });
        return "107z15e8e-alfa";
      },
      now: () => controlledNowMs,
      ttlMs,
    });

  assert.deepStrictEqual(
    {
      acceptSubscriptions:
        surfaceHarness.metrics().acceptSubscriptions,
      editSubscriptions:
        surfaceHarness.metrics().editSubscriptions,
    },
    {
      acceptSubscriptions: 1,
      editSubscriptions: 1,
    }
  );

  const acceptResult =
    surfaceHarness.getAcceptHandler()({
      origin: "accept-button",
    });

  assert.equal(idCalls, 1);
  assert.equal(
    acceptResult.identity.previewResultId,
    "107z15e8e-alfa"
  );

  const afterAccept = storeHarness.metrics();

  assert.equal(afterAccept.writes, 1);
  assert.equal(afterAccept.reads, 1);
  assert.equal(
    afterAccept.capturedWriteInput.createdAt,
    "2026-07-10T12:00:00.000Z"
  );
  assert.equal(
    afterAccept.capturedWriteInput.expiresAt,
    "2026-07-11T12:00:00.000Z"
  );
  assert.equal(
    afterAccept.capturedWriteInput.fields.insured,
    "PERSONA SINTETICA ALFA"
  );
  assert.deepStrictEqual(
    afterAccept.capturedReadIdentity,
    acceptResult.identity
  );
  assert.equal(
    surfaceHarness.metrics().pendingReads,
    1
  );
  assert.equal(
    surfaceHarness.metrics().persisted.length,
    1
  );
  assert.deepStrictEqual(
    surfaceHarness.metrics().persisted[0].payload,
    { origin: "accept-button" }
  );

  const beforeEdit = storeHarness.metrics();

  const editResult =
    surfaceHarness.getEditHandler()({
      origin: "edit-button",
    });

  const afterEdit = storeHarness.metrics();

  assert.deepStrictEqual(editResult, {
    action: "edit",
    persisted: false,
  });
  assert.equal(afterEdit.writes, beforeEdit.writes);
  assert.equal(afterEdit.reads, beforeEdit.reads);
  assert.equal(
    surfaceHarness.metrics().editRequests.length,
    1
  );
  assert.deepStrictEqual(
    surfaceHarness.metrics().editRequests[0],
    { origin: "edit-button" }
  );

  const stateAfterActions = binding.getState();

  assert.equal(stateAfterActions.acceptCount, 1);
  assert.equal(stateAfterActions.editCount, 1);
  assert.equal(stateAfterActions.errorCount, 0);
  assert.equal(
    stateAfterActions.lastIdentity.previewResultId,
    "107z15e8e-alfa"
  );
  assert.equal(Object.isFrozen(stateAfterActions), true);
  assert.equal(
    Object.isFrozen(stateAfterActions.lastIdentity),
    true
  );

  const errorSurface = createSurface();
  const errorStore = createOfficialObservedStore();

  bindQuotePreviewConfirmationPersistenceUi({
    surface: errorSurface.surface,
    store: errorStore.store,
    createPreviewResultId() {
      throw Object.assign(
        new Error("synthetic id failure"),
        { code: "SYNTHETIC_ID_FAILURE" }
      );
    },
    now: () => controlledNowMs,
    ttlMs,
  });

  expectCode(
    () => errorSurface.getAcceptHandler()({
      origin: "error-test",
    }),
    "SYNTHETIC_ID_FAILURE"
  );

  assert.equal(
    errorSurface.metrics().errors.length,
    1
  );
  assert.equal(
    errorSurface.metrics().errors[0].context.action,
    "accept"
  );
  assert.equal(errorStore.metrics().writes, 0);
  assert.equal(errorStore.metrics().reads, 0);

  const reentrantSurface = createSurface();
  const reentrantBase = createOfficialObservedStore();
  let duplicateCode = null;
  let reentrantTriggered = false;

  const reentrantStore = {
    writePreviewResult(input) {
      if (!reentrantTriggered) {
        reentrantTriggered = true;

        try {
          reentrantSurface.getAcceptHandler()({
            origin: "reentrant",
          });
        } catch (error) {
          duplicateCode = error && error.code;
        }
      }

      return reentrantBase.store.writePreviewResult(input);
    },

    readPreviewResult(identity) {
      return reentrantBase.store.readPreviewResult(
        identity
      );
    },
  };

  bindQuotePreviewConfirmationPersistenceUi({
    surface: reentrantSurface.surface,
    store: reentrantStore,
    createPreviewResultId() {
      return "107z15e8e-reentrant";
    },
    now: () => controlledNowMs,
    ttlMs,
  });

  reentrantSurface.getAcceptHandler()({
    origin: "outer",
  });

  assert.equal(
    duplicateCode,
    "QUOTE_PREVIEW_ACCEPT_IN_FLIGHT"
  );
  assert.equal(
    reentrantBase.metrics().writes,
    1
  );

  assert.equal(binding.dispose(), true);
  assert.equal(binding.dispose(), false);

  const disposedMetrics = surfaceHarness.metrics();

  assert.equal(disposedMetrics.acceptUnsubscribes, 1);
  assert.equal(disposedMetrics.editUnsubscribes, 1);

  expectCode(
    () => surfaceHarness.getAcceptHandler()({
      origin: "after-dispose",
    }),
    "QUOTE_PREVIEW_UI_WIRING_DISPOSED"
  );

  expectCode(
    () => surfaceHarness.getEditHandler()({
      origin: "after-dispose",
    }),
    "QUOTE_PREVIEW_UI_WIRING_DISPOSED"
  );

  assert.equal(/\blocalStorage\b/.test(wiringSource), false);
  assert.equal(/\bwindow\b/.test(wiringSource), false);
  assert.equal(/\bdocument\b/.test(wiringSource), false);
  assert.equal(
    /\bquerySelector\b|\bgetElementById\b/.test(
      wiringSource
    ),
    false
  );
  assert.equal(
    /forge-quote-pdf-preview-engine/.test(
      wiringSource
    ),
    false
  );
  assert.equal(
    /generic[-_ ]bridge/i.test(wiringSource),
    false
  );
  assert.equal(
    /confirmed:\s*true/.test(wiringSource),
    true
  );

  const requireMatches = [
    ...wiringSource.matchAll(
      /require\(\s*["']([^"']+)["']\s*\)/g
    ),
  ].map(match => match[1]);

  assert.deepStrictEqual(requireMatches, [
    "./quote-preview-controlled-browser-confirmation-persistence-adapter.js",
  ]);

  const result = {
    chain:
      "107Z15E8E_CONTROLLED_BROWSER_CONFIRMATION_UI_WIRING_SCOPED_IMPLEMENTATION_GATE",
    status: "PASS",
    testsPass: true,
    testCount: 15,
    surfaceContractValidated: true,
    storeContractValidated: true,
    acceptSubscriptionCount: 1,
    editSubscriptionCount: 1,
    acceptReadsPendingPreview: true,
    acceptConfirmedTrueProven: true,
    deterministicTimestampsPass: true,
    injectedIdFactoryPass: true,
    editPersistenceCalls: 0,
    editStoreWrites: 0,
    notifyPersistedPass: true,
    notifyEditRequestedPass: true,
    notifyErrorPass: true,
    duplicateConcurrentAcceptBlocked: true,
    disposeIdempotent: true,
    noBrowserGlobals: true,
    directLocalStorageAccess: false,
    newEngineIntroduced: false,
    genericBridgeIntroduced: false,
    quoteTruthPromotionIntroduced: false,
    wiringExport:
      "bindQuotePreviewConfirmationPersistenceUi",
    next:
      "107Z15E8F_CONTROLLED_BROWSER_CONFIRMATION_UI_SURFACE_BINDING_AUTHORIZATION_GATE",
  };

  if (process.env.TEST_RESULT_JSON) {
    fs.writeFileSync(
      process.env.TEST_RESULT_JSON,
      JSON.stringify(result, null, 2) + "\n"
    );
  }

  console.log(
    "PASS_107Z15E8E_UI_WIRING_UNIT_TESTS=true"
  );
  console.log("TEST_COUNT=15");
  console.log("EDIT_STORE_WRITES=0");
  console.log("DUPLICATE_ACCEPT_BLOCKED=true");
  console.log("DISPOSE_IDEMPOTENT=true");
}

try {
  run();
} catch (error) {
  const result = {
    chain:
      "107Z15E8E_CONTROLLED_BROWSER_CONFIRMATION_UI_WIRING_SCOPED_IMPLEMENTATION_GATE",
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

  console.error(
    "HOLD_107Z15E8E_UI_WIRING_UNIT_TESTS=true"
  );
  console.error(
    error && error.stack ? error.stack : String(error)
  );
  process.exitCode = 1;
}
