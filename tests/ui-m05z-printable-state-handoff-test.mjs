import assert from "node:assert/strict";
import { pathToFileURL } from "node:url";
import path from "node:path";

const originals = {
  addEventListener: globalThis.addEventListener,
  dispatchEvent: globalThis.dispatchEvent,
  document: globalThis.document,
  bridge: globalThis.ForgeAcceptedQuoteBridge,
  printable: globalThis.ForgeQuotePrintableEntrypointQPD06,
  customEvent: globalThis.CustomEvent,
};

const listeners = new Map();
globalThis.addEventListener = (name, listener) => {
  const bucket = listeners.get(name) || [];
  bucket.push(listener);
  listeners.set(name, bucket);
};
globalThis.dispatchEvent = (event) => {
  for (const listener of listeners.get(event.type) || []) listener(event);
  return true;
};
if (typeof globalThis.CustomEvent !== "function") {
  globalThis.CustomEvent = class CustomEvent extends Event {
    constructor(type, options = {}) {
      super(type);
      this.detail = options.detail;
    }
  };
}

delete globalThis.document;

const acceptedSnapshot = Object.freeze({
  packetType: "ACCEPTED_QUOTE_AND_CALCULATION_REVIEW_SNAPSHOT",
  reviewOnly: true,
  acceptedQuote: Object.freeze({
    context: Object.freeze({ clientName: "Alejandra Moleres" }),
    nativeResult: Object.freeze({ product: "Vida Mujer" }),
  }),
  calculation: Object.freeze({
    product: "Vida Mujer",
    annualPremium: 3890.21,
  }),
  productIntelligence: null,
  authority: Object.freeze({ finalAuthority: "HUMAN" }),
  safety: Object.freeze({ quoteMutationAllowed: false }),
});

let bridgeSnapshot = acceptedSnapshot;
const baseBridge = Object.freeze({
  getAcceptedQuoteReviewSnapshot: () => bridgeSnapshot,
  getCurrentQuoteCandidate: () => acceptedSnapshot.acceptedQuote,
  getCurrentQuotePreviewCalculation: () => acceptedSnapshot.calculation,
  confirmCurrentQuoteCandidate: async () => acceptedSnapshot,
});

// Reproduce the production split: the visible confirmation layer still reaches
// the accepted base bridge, while the current global facade reports null.
globalThis.ForgeAcceptedQuoteBridge = Object.freeze({
  ...baseBridge,
  __m05e009UnderlyingBridge: baseBridge,
  getAcceptedQuoteReviewSnapshot: () => null,
});

let refreshCount = 0;
globalThis.ForgeQuotePrintableEntrypointQPD06 = Object.freeze({
  refresh() {
    refreshCount += 1;
  },
});

const moduleUrl = pathToFileURL(path.resolve(
  "docs/static-preview/forge-alive-material3/quote-runtime-printable-state-handoff-m05z001.js",
));
moduleUrl.searchParams.set("test", String(Date.now()));
const handoff = await import(moduleUrl.href);

const confirmButton = {
  disabled: true,
  textContent: "Cotización confirmada",
};
const quotesRoot = {
  querySelector(selector) {
    return selector.includes("confirm_quote") ? confirmButton : null;
  },
};
globalThis.document = {
  documentElement: { dataset: {} },
  querySelector(selector) {
    return selector.includes("data-quote-accepted") ? quotesRoot : null;
  },
};

assert.equal(handoff.reconcile("split-bridge-test"), true);
assert.equal(
  globalThis.ForgeAcceptedQuoteBridge.__m05z001PrintableStateHandoff,
  true,
);
assert.equal(
  globalThis.ForgeAcceptedQuoteBridge.getAcceptedQuoteReviewSnapshot(),
  acceptedSnapshot,
);
assert.equal(
  globalThis.document.documentElement.dataset.quotePrintableStateReady,
  "true",
);
assert.ok(refreshCount > 0, "printable authority must be refreshed");

// Also cover an already-confirmed UI after the direct snapshot accessor was
// lost: candidate + calculation may restore only the read-only print snapshot.
bridgeSnapshot = null;
globalThis.ForgeQuotePrintableStateHandoffM05Z001.clear();
assert.equal(handoff.reconcile("confirmed-ui-recovery-test"), true);
const recovered = globalThis.ForgeAcceptedQuoteBridge
  .getAcceptedQuoteReviewSnapshot();
assert.equal(recovered.reviewOnly, true);
assert.equal(recovered.acceptedQuote.context.clientName, "Alejandra Moleres");
assert.equal(recovered.calculation.annualPremium, 3890.21);
assert.ok(
  globalThis.ForgeQuotePrintableStateHandoffM05Z001.getState().recoveryCount > 0,
  "confirmed UI recovery must be recorded",
);

console.log("UI_M05Z_PRINTABLE_STATE_HANDOFF=PASS");
console.log("SPLIT_BRIDGE_RECONCILIATION=PASS");
console.log("CONFIRMED_UI_READ_MODEL_RECOVERY=PASS");
console.log("QUOTE_MUTATION=NOT_AUTHORIZED");

if (originals.addEventListener === undefined) delete globalThis.addEventListener;
else globalThis.addEventListener = originals.addEventListener;
if (originals.dispatchEvent === undefined) delete globalThis.dispatchEvent;
else globalThis.dispatchEvent = originals.dispatchEvent;
if (originals.document === undefined) delete globalThis.document;
else globalThis.document = originals.document;
if (originals.bridge === undefined) delete globalThis.ForgeAcceptedQuoteBridge;
else globalThis.ForgeAcceptedQuoteBridge = originals.bridge;
if (originals.printable === undefined) {
  delete globalThis.ForgeQuotePrintableEntrypointQPD06;
} else {
  globalThis.ForgeQuotePrintableEntrypointQPD06 = originals.printable;
}
if (originals.customEvent === undefined) delete globalThis.CustomEvent;
else globalThis.CustomEvent = originals.customEvent;
