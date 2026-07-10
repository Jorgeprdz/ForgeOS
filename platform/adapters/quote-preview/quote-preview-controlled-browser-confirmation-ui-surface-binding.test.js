"use strict";

const assert = require("assert/strict");
const fs = require("fs");
const path = require("path");

const bindingPath = path.join(
  __dirname,
  "quote-preview-controlled-browser-confirmation-ui-surface-binding.js"
);

const bindingSource = fs.readFileSync(
  bindingPath,
  "utf8"
);

const {
  bindQuotePreviewConfirmationUiSurface,
} = require(bindingPath);

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
      name: `PRUEBA SURFACE ${label}`,
      product_family: "life",
    },
    ambiguity: {},
    source: {
      controlledTest: true,
      label,
    },
  };
}

function createTarget() {
  const listeners = new Map();
  const added = [];
  const removed = [];

  return {
    target: {
      addEventListener(name, handler) {
        if (!listeners.has(name)) {
          listeners.set(name, new Set());
        }

        listeners.get(name).add(handler);
        added.push({ name, handler });
      },

      removeEventListener(name, handler) {
        if (listeners.has(name)) {
          listeners.get(name).delete(handler);
        }

        removed.push({ name, handler });
      },
    },

    dispatch(name, payload) {
      const handlers = listeners.has(name)
        ? [...listeners.get(name)]
        : [];

      const results = [];
      for (const handler of handlers) {
        results.push(handler(payload));
      }

      return results;
    },

    metrics() {
      return {
        added: [...added],
        removed: [...removed],
        active(name) {
          return listeners.has(name)
            ? listeners.get(name).size
            : 0;
        },
      };
    },
  };
}

function createObservedStore() {
  const backend = storeModule.createMemoryBackend();
  const officialStore = storeModule.createStore({
    backend,
    now: () => controlledNowMs,
  });

  let writes = 0;
  let reads = 0;

  return {
    store: {
      writePreviewResult(input) {
        writes += 1;
        return officialStore.writePreviewResult(input);
      },

      readPreviewResult(identity) {
        reads += 1;
        return officialStore.readPreviewResult(identity);
      },
    },

    metrics() {
      return { writes, reads };
    },
  };
}

function run() {
  assert.equal(
    typeof bindQuotePreviewConfirmationUiSurface,
    "function"
  );

  expectCode(
    () => bindQuotePreviewConfirmationUiSurface(),
    "QUOTE_PREVIEW_ACCEPT_TARGET_REQUIRED"
  );

  expectCode(
    () => bindQuotePreviewConfirmationUiSurface({
      acceptTarget: {},
    }),
    "QUOTE_PREVIEW_ACCEPT_TARGET_ADD_REQUIRED"
  );

  const validAccept = createTarget();

  expectCode(
    () => bindQuotePreviewConfirmationUiSurface({
      acceptTarget: validAccept.target,
      editTarget: {},
    }),
    "QUOTE_PREVIEW_EDIT_TARGET_ADD_REQUIRED"
  );

  const validEdit = createTarget();

  expectCode(
    () => bindQuotePreviewConfirmationUiSurface({
      acceptTarget: validAccept.target,
      editTarget: validEdit.target,
    }),
    "QUOTE_PREVIEW_SURFACE_READ_PENDING_REQUIRED"
  );

  const acceptTarget = createTarget();
  const editTarget = createTarget();
  const observedStore = createObservedStore();
  const persisted = [];
  const edits = [];
  const errors = [];
  let pendingReads = 0;
  let idCalls = 0;

  const binding = bindQuotePreviewConfirmationUiSurface({
    acceptTarget: acceptTarget.target,
    editTarget: editTarget.target,
    readPendingPreview(payload) {
      pendingReads += 1;
      assert.deepStrictEqual(payload, {
        origin: "accept-default",
      });
      return createPending("ALFA");
    },
    store: observedStore.store,
    createPreviewResultId(pending, payload) {
      idCalls += 1;
      assert.equal(
        pending.nativeResult.prospect,
        "PERSONA SINTETICA ALFA"
      );
      assert.deepStrictEqual(payload, {
        origin: "accept-default",
      });
      return "107z15e8g-alfa";
    },
    now: () => controlledNowMs,
    ttlMs,
    notifyPersisted(result, pending, payload) {
      persisted.push({
        result,
        pending,
        payload,
      });
    },
    notifyEditRequested(payload) {
      edits.push(payload);
    },
    notifyError(error, context) {
      errors.push({ error, context });
    },
  });

  assert.equal(
    acceptTarget.metrics().active("click"),
    1
  );
  assert.equal(
    editTarget.metrics().active("click"),
    1
  );
  assert.equal(
    acceptTarget.metrics().added.length,
    1
  );
  assert.equal(
    editTarget.metrics().added.length,
    1
  );

  const acceptResults = acceptTarget.dispatch(
    "click",
    { origin: "accept-default" }
  );

  assert.equal(acceptResults.length, 1);
  assert.equal(
    acceptResults[0].identity.previewResultId,
    "107z15e8g-alfa"
  );
  assert.equal(pendingReads, 1);
  assert.equal(idCalls, 1);
  assert.deepStrictEqual(
    observedStore.metrics(),
    { writes: 1, reads: 1 }
  );
  assert.equal(persisted.length, 1);
  assert.deepStrictEqual(
    persisted[0].payload,
    { origin: "accept-default" }
  );

  const beforeEdit = observedStore.metrics();

  const editResults = editTarget.dispatch(
    "click",
    { origin: "edit-default" }
  );

  const afterEdit = observedStore.metrics();

  assert.deepStrictEqual(editResults, [
    {
      action: "edit",
      persisted: false,
    },
  ]);
  assert.deepStrictEqual(afterEdit, beforeEdit);
  assert.equal(edits.length, 1);
  assert.deepStrictEqual(
    edits[0],
    { origin: "edit-default" }
  );
  assert.equal(errors.length, 0);

  const customAccept = createTarget();
  const customEdit = createTarget();
  const customStore = createObservedStore();
  let customPendingReads = 0;

  const customBinding =
    bindQuotePreviewConfirmationUiSurface({
      acceptTarget: customAccept.target,
      editTarget: customEdit.target,
      acceptEventName: "confirm-quote",
      editEventName: "edit-quote",
      readPendingPreview() {
        customPendingReads += 1;
        return createPending("BETA");
      },
      store: customStore.store,
      createPreviewResultId() {
        return "107z15e8g-beta";
      },
      now: () => controlledNowMs,
      ttlMs,
    });

  assert.equal(
    customAccept.metrics().active("confirm-quote"),
    1
  );
  assert.equal(
    customEdit.metrics().active("edit-quote"),
    1
  );
  assert.equal(
    customAccept.metrics().active("click"),
    0
  );
  assert.equal(
    customEdit.metrics().active("click"),
    0
  );

  customAccept.dispatch("confirm-quote", {
    origin: "custom-accept",
  });

  assert.equal(customPendingReads, 1);
  assert.deepStrictEqual(
    customStore.metrics(),
    { writes: 1, reads: 1 }
  );

  const customBeforeEdit = customStore.metrics();

  customEdit.dispatch("edit-quote", {
    origin: "custom-edit",
  });

  assert.deepStrictEqual(
    customStore.metrics(),
    customBeforeEdit
  );

  const errorAccept = createTarget();
  const errorEdit = createTarget();
  const errorStore = createObservedStore();
  const notifiedErrors = [];

  const errorBinding =
    bindQuotePreviewConfirmationUiSurface({
      acceptTarget: errorAccept.target,
      editTarget: errorEdit.target,
      readPendingPreview() {
        return createPending("ERROR");
      },
      store: errorStore.store,
      createPreviewResultId() {
        throw Object.assign(
          new Error("synthetic id failure"),
          { code: "SYNTHETIC_ID_FAILURE" }
        );
      },
      now: () => controlledNowMs,
      ttlMs,
      notifyError(error, context) {
        notifiedErrors.push({ error, context });
      },
    });

  expectCode(
    () => errorAccept.dispatch("click", {
      origin: "error-accept",
    }),
    "SYNTHETIC_ID_FAILURE"
  );

  assert.equal(notifiedErrors.length, 1);
  assert.equal(
    notifiedErrors[0].context.action,
    "accept"
  );
  assert.deepStrictEqual(
    errorStore.metrics(),
    { writes: 0, reads: 0 }
  );

  const acceptAdded =
    acceptTarget.metrics().added[0];
  const editAdded =
    editTarget.metrics().added[0];

  assert.equal(binding.dispose(), true);
  assert.equal(binding.dispose(), false);

  assert.equal(
    acceptTarget.metrics().active("click"),
    0
  );
  assert.equal(
    editTarget.metrics().active("click"),
    0
  );
  assert.equal(
    acceptTarget.metrics().removed.length,
    1
  );
  assert.equal(
    editTarget.metrics().removed.length,
    1
  );
  assert.strictEqual(
    acceptTarget.metrics().removed[0].handler,
    acceptAdded.handler
  );
  assert.strictEqual(
    editTarget.metrics().removed[0].handler,
    editAdded.handler
  );

  const beforeDisposedDispatch =
    observedStore.metrics();

  assert.deepStrictEqual(
    acceptTarget.dispatch("click", {
      origin: "after-dispose",
    }),
    []
  );
  assert.deepStrictEqual(
    editTarget.dispatch("click", {
      origin: "after-dispose",
    }),
    []
  );
  assert.deepStrictEqual(
    observedStore.metrics(),
    beforeDisposedDispatch
  );

  assert.equal(customBinding.dispose(), true);
  assert.equal(errorBinding.dispose(), true);

  assert.equal(/\blocalStorage\b/.test(bindingSource), false);
  assert.equal(/\bwindow\b/.test(bindingSource), false);
  assert.equal(/\bdocument\b/.test(bindingSource), false);
  assert.equal(
    /\bquerySelector\b|\bgetElementById\b/.test(
      bindingSource
    ),
    false
  );
  assert.equal(
    /\bcreateStore\b|\bcreateMemoryBackend\b/.test(
      bindingSource
    ),
    false
  );
  assert.equal(
    /forge-quote-pdf-preview-engine/.test(
      bindingSource
    ),
    false
  );
  assert.equal(
    /generic[-_ ]bridge/i.test(bindingSource),
    false
  );

  const requireMatches = [
    ...bindingSource.matchAll(
      /require\(\s*["']([^"']+)["']\s*\)/g
    ),
  ].map(match => match[1]);

  assert.deepStrictEqual(requireMatches, [
    "./quote-preview-controlled-browser-confirmation-ui-wiring.js",
  ]);

  const result = {
    chain:
      "107Z15E8G_CONTROLLED_BROWSER_CONFIRMATION_UI_SURFACE_BINDING_SCOPED_IMPLEMENTATION_GATE",
    status: "PASS",
    testsPass: true,
    testCount: 16,
    acceptTargetValidated: true,
    editTargetValidated: true,
    readPendingPreviewValidated: true,
    defaultAcceptEventName: "click",
    defaultEditEventName: "click",
    customEventNamesPass: true,
    acceptForwardedToExistingWiring: true,
    acceptPersistencePass: true,
    editForwardedWithoutPersistence: true,
    editStoreWrites: 0,
    editStoreReads: 0,
    notifyPersistedPass: true,
    notifyEditRequestedPass: true,
    notifyErrorPass: true,
    exactListenerRemovalPass: true,
    disposeIdempotent: true,
    eventsAfterDisposeNoEffect: true,
    noWindowGlobal: true,
    noDocumentGlobal: true,
    noDomSelectors: true,
    directLocalStorageAccess: false,
    backendCreation: false,
    newEngineIntroduced: false,
    genericBridgeIntroduced: false,
    quoteTruthPromotionIntroduced: false,
    surfaceBindingExport:
      "bindQuotePreviewConfirmationUiSurface",
    next:
      "107Z15E8H_CONTROLLED_BROWSER_CONFIRMATION_COMPOSITION_AUTHORIZATION_GATE",
  };

  if (process.env.TEST_RESULT_JSON) {
    fs.writeFileSync(
      process.env.TEST_RESULT_JSON,
      JSON.stringify(result, null, 2) + "\n"
    );
  }

  console.log(
    "PASS_107Z15E8G_SURFACE_BINDING_UNIT_TESTS=true"
  );
  console.log("TEST_COUNT=16");
  console.log("DEFAULT_EVENTS=click,click");
  console.log("EDIT_STORE_WRITES=0");
  console.log("EXACT_LISTENER_REMOVAL=true");
  console.log("EVENTS_AFTER_DISPOSE_NO_EFFECT=true");
}

try {
  run();
} catch (error) {
  const result = {
    chain:
      "107Z15E8G_CONTROLLED_BROWSER_CONFIRMATION_UI_SURFACE_BINDING_SCOPED_IMPLEMENTATION_GATE",
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
    "HOLD_107Z15E8G_SURFACE_BINDING_UNIT_TESTS=true"
  );
  console.error(
    error && error.stack ? error.stack : String(error)
  );
  process.exitCode = 1;
}
