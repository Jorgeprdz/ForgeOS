import {
  createAcceptedQuoteReviewSnapshotBoundary,
} from "../quote-runtime/forge-accepted-quote-review-snapshot.js";

const VERSION = "M05Z-001";
const UNDERLYING_KEYS = Object.freeze([
  "__m05z001UnderlyingBridge",
  "__m05e006UnderlyingBridge",
  "__m05e009UnderlyingBridge",
  "__m05r001UnderlyingBridge",
  "__m05e003UnderlyingBridge",
]);

const recoveryBoundary = createAcceptedQuoteReviewSnapshotBoundary();
const state = {
  snapshot: null,
  facade: null,
  source: null,
  scheduled: false,
  captureCount: 0,
  recoveryCount: 0,
};

function isRecord(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function validSnapshot(value) {
  return Boolean(
    isRecord(value)
    && value.reviewOnly === true
    && isRecord(value.acceptedQuote)
    && isRecord(value.calculation)
  );
}

function bridgeChain(root = globalThis.ForgeAcceptedQuoteBridge) {
  const queue = isRecord(root) ? [root] : [];
  const seen = new Set();
  const output = [];

  while (queue.length) {
    const bridge = queue.shift();
    if (!isRecord(bridge) || seen.has(bridge)) continue;
    seen.add(bridge);
    output.push(bridge);

    for (const key of UNDERLYING_KEYS) {
      const underlying = bridge[key];
      if (isRecord(underlying) && !seen.has(underlying)) {
        queue.push(underlying);
      }
    }
  }

  return output;
}

function remember(snapshot, reason = "bridge") {
  if (!validSnapshot(snapshot)) return null;
  state.snapshot = snapshot;
  state.captureCount += 1;

  if (typeof document !== "undefined") {
    document.documentElement.dataset.quotePrintableStateHandoff = VERSION;
    document.documentElement.dataset.quotePrintableStateReady = "true";
    document.documentElement.dataset.quotePrintableStateReason = reason;
  }
  return snapshot;
}

function readSnapshot(root = globalThis.ForgeAcceptedQuoteBridge) {
  for (const bridge of bridgeChain(root)) {
    if (bridge === state.facade) continue;
    try {
      const snapshot = bridge.getAcceptedQuoteReviewSnapshot?.();
      if (validSnapshot(snapshot)) return snapshot;
    } catch {
      // Continue through the bounded underlying bridge chain.
    }
  }
  return null;
}

function readCandidate(root = globalThis.ForgeAcceptedQuoteBridge) {
  for (const bridge of bridgeChain(root)) {
    if (bridge === state.facade) continue;
    try {
      const candidate = bridge.getCurrentQuoteCandidate?.();
      if (isRecord(candidate)) return candidate;
    } catch {}
  }
  return null;
}

function readCalculation(root = globalThis.ForgeAcceptedQuoteBridge) {
  for (const bridge of bridgeChain(root)) {
    if (bridge === state.facade) continue;
    try {
      const calculation = bridge.getCurrentQuotePreviewCalculation?.();
      if (isRecord(calculation)) return calculation;
    } catch {}
  }
  return null;
}

function acceptedUiState() {
  if (typeof document === "undefined") return false;
  const root = document.querySelector(
    '[data-forge-quotes-module][data-quote-accepted="true"]',
  );
  if (!root) return false;
  const confirm = root.querySelector(
    '[data-quote-next-action="confirm_quote"]',
  );
  return Boolean(
    !confirm
    || confirm.disabled === true
    || /cotización confirmada/i.test(confirm.textContent || "")
  );
}

function recoverConfirmedSnapshot(root = globalThis.ForgeAcceptedQuoteBridge) {
  if (!acceptedUiState()) return null;
  const acceptedQuote = readCandidate(root);
  const calculation = readCalculation(root);
  if (!acceptedQuote || !calculation) return null;

  try {
    const snapshot = recoveryBoundary.setSnapshot({
      acceptedQuote,
      calculation,
    });
    state.recoveryCount += 1;
    return remember(snapshot, "confirmed-ui-recovery");
  } catch {
    return null;
  }
}

function currentSnapshot(root = globalThis.ForgeAcceptedQuoteBridge) {
  return remember(readSnapshot(root), "bridge-chain")
    || state.snapshot
    || recoverConfirmedSnapshot(root);
}

function refreshPrintable(reason = "reconcile") {
  globalThis.ForgeQuotePrintableEntrypointQPD06?.refresh?.();
  globalThis.dispatchEvent?.(
    new CustomEvent("forge:printable-state-ready", {
      detail: Object.freeze({
        version: VERSION,
        reason,
        ready: Boolean(state.snapshot),
      }),
    }),
  );
}

function installFacade() {
  const current = globalThis.ForgeAcceptedQuoteBridge;
  if (!isRecord(current)) return false;

  if (current.__m05z001PrintableStateHandoff === true) {
    state.facade = current;
    state.source = current.__m05z001UnderlyingBridge || state.source;
    return true;
  }

  const source = current;
  const facade = Object.freeze({
    ...source,
    __m05z001PrintableStateHandoff: true,
    __m05z001UnderlyingBridge: source,
    getAcceptedQuoteReviewSnapshot() {
      return currentSnapshot(source);
    },
    async confirmCurrentQuoteCandidate(...args) {
      const accepted = await source.confirmCurrentQuoteCandidate?.(...args);
      remember(accepted, "confirm-return");
      currentSnapshot(source);
      refreshPrintable("confirm-return");
      return accepted;
    },
  });

  globalThis.ForgeAcceptedQuoteBridge = facade;
  state.facade = facade;
  state.source = source;

  if (typeof document !== "undefined") {
    document.documentElement.dataset.quotePrintableStateHandoff = VERSION;
  }
  return true;
}

function reconcile(reason = "manual") {
  installFacade();
  const snapshot = currentSnapshot(state.source || globalThis.ForgeAcceptedQuoteBridge);
  if (snapshot) refreshPrintable(reason);
  return Boolean(snapshot);
}

function schedule(reason = "scheduled") {
  if (state.scheduled) return;
  state.scheduled = true;
  const enqueue = globalThis.requestAnimationFrame
    ? globalThis.requestAnimationFrame.bind(globalThis)
    : (callback) => globalThis.setTimeout(callback, 0);
  enqueue(() => {
    state.scheduled = false;
    reconcile(reason);
  });
}

function clear() {
  state.snapshot = null;
  recoveryBoundary.clear();
  if (typeof document !== "undefined") {
    document.documentElement.dataset.quotePrintableStateReady = "false";
  }
  schedule("candidate-cleared");
}

for (const eventName of [
  "forge:accepted-quote-bridge-ready",
  "forge:quote-human-review-bridge-ready",
  "forge:vida-mujer-handoff-ready",
  "forge:quote-bridge-composed",
  "forge:quote-candidate-ready",
  "forge:quote-preview-calculated",
]) {
  globalThis.addEventListener?.(eventName, () => schedule(eventName));
}

globalThis.addEventListener?.("forge:accepted-quote-confirmed", (event) => {
  remember(
    event?.detail?.reviewSnapshot
      || event?.detail?.acceptedQuoteReviewSnapshot,
    "accepted-event",
  );
  reconcile("accepted-event");
  globalThis.setTimeout(() => reconcile("accepted-event-retry-1"), 60);
  globalThis.setTimeout(() => reconcile("accepted-event-retry-2"), 220);
});

globalThis.addEventListener?.("forge:quote-candidate-cleared", clear);

installFacade();
schedule("boot");

globalThis.ForgeQuotePrintableStateHandoffM05Z001 = Object.freeze({
  version: VERSION,
  clear,
  getSnapshot: () => currentSnapshot(
    state.source || globalThis.ForgeAcceptedQuoteBridge,
  ),
  getState() {
    return Object.freeze({
      ready: Boolean(state.snapshot),
      captureCount: state.captureCount,
      recoveryCount: state.recoveryCount,
      facadeInstalled:
        globalThis.ForgeAcceptedQuoteBridge
          ?.__m05z001PrintableStateHandoff === true,
    });
  },
  reconcile,
});

export {
  VERSION,
  acceptedUiState,
  bridgeChain,
  currentSnapshot,
  installFacade,
  reconcile,
  recoverConfirmedSnapshot,
  validSnapshot,
};
