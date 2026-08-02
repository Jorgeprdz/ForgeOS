const VERSION = "M05W-002";
const PROJECTION_SELECTOR = "[data-material3-quotes-projection]";
const CARD_SELECTOR = "[data-m05e005-printable-card]";
const ACTION_SELECTOR = "[data-m05e005-action]";

let observer = null;
let scheduled = false;
let retryTimer = null;
let acceptanceTimer = null;
let lastReason = "boot";
let restoreCount = 0;
let acceptedSignal = false;

function projection() {
  return document.querySelector(PROJECTION_SELECTOR);
}

function printableCard(host = projection()) {
  return host?.querySelector(CARD_SELECTOR) || null;
}

function printableActionsReady(host = projection()) {
  const card = printableCard(host);
  return Boolean(
    card
      && card.hidden !== true
      && card.querySelectorAll(ACTION_SELECTOR).length >= 3,
  );
}

function authority() {
  return globalThis.ForgeQuotePrintableEntrypointQPD06 || null;
}

function acceptedQuoteReady(runtime = authority()) {
  return runtime?.getState?.()?.acceptedQuoteReady === true;
}

function mark(status, reason = lastReason) {
  document.documentElement.dataset.printablePresenceGuard = VERSION;
  document.documentElement.dataset.printablePresenceStatus = status;
  document.documentElement.dataset.printablePresenceReason = reason;
  document.documentElement.dataset.printablePresenceRestoreCount = String(restoreCount);
  document.documentElement.dataset.printablePresenceAcceptedSignal = String(acceptedSignal);
}

function clearRetry() {
  if (retryTimer === null) return;
  globalThis.clearTimeout(retryTimer);
  retryTimer = null;
}

function clearAcceptanceTimer() {
  if (acceptanceTimer === null) return;
  globalThis.clearTimeout(acceptanceTimer);
  acceptanceTimer = null;
}

function retry(reason) {
  if (retryTimer !== null) return;
  retryTimer = globalThis.setTimeout(() => {
    retryTimer = null;
    schedule(`${reason}-retry`);
  }, 120);
}

function ensurePresence(reason = lastReason) {
  if (!acceptedSignal) {
    clearRetry();
    mark("waiting-human-acceptance", reason);
    return false;
  }

  const host = projection();
  if (!host || host.hidden) {
    mark("waiting-projection", reason);
    retry(reason);
    return false;
  }

  const runtime = authority();
  if (!runtime?.refresh) {
    mark("waiting-authority", reason);
    retry(reason);
    return false;
  }

  if (!acceptedQuoteReady(runtime)) {
    mark("waiting-accepted-snapshot", reason);
    retry(reason);
    return false;
  }

  if (printableActionsReady(host)) {
    clearRetry();
    mark("ready", reason);
    return true;
  }

  runtime.refresh();
  const restored = printableActionsReady(host);
  if (restored) {
    restoreCount += 1;
    clearRetry();
    mark("restored", reason);
    globalThis.dispatchEvent(new CustomEvent(
      "forge:quote-printable-actions-restored",
      {
        detail: Object.freeze({
          version: VERSION,
          reason,
          restoreCount,
        }),
      },
    ));
    return true;
  }

  mark("waiting-runtime-convergence", reason);
  retry(reason);
  return false;
}

function schedule(reason = "event") {
  lastReason = reason;
  if (scheduled) return;
  scheduled = true;
  queueMicrotask(() => {
    scheduled = false;
    ensurePresence(lastReason);
  });
}

function nodeTouchesProjection(node, host) {
  if (!node || node.nodeType !== 1) return false;
  return node === host
    || host?.contains(node)
    || node.matches?.(PROJECTION_SELECTOR)
    || Boolean(node.querySelector?.(PROJECTION_SELECTOR));
}

function mutationRequiresRecovery(records) {
  if (!acceptedSignal) return false;

  const host = projection();
  if (host && printableActionsReady(host)) return false;

  return records.some((record) => {
    if (record.target === host || host?.contains(record.target)) return true;
    return [...record.addedNodes, ...record.removedNodes]
      .some((node) => nodeTouchesProjection(node, host));
  });
}

function installObserver() {
  if (observer || !document.documentElement) return false;
  observer = new MutationObserver((records) => {
    if (mutationRequiresRecovery(records)) {
      schedule("projection-dom-reconciled");
    }
  });
  observer.observe(document.documentElement, {
    childList: true,
    subtree: true,
  });
  return true;
}

function acceptSignal(reason) {
  clearAcceptanceTimer();
  acceptedSignal = true;
  schedule(reason);
}

function deferAcceptanceSignal(reason) {
  clearAcceptanceTimer();
  acceptanceTimer = globalThis.setTimeout(() => {
    acceptanceTimer = null;
    acceptSignal(`${reason}-settled`);
  }, 0);
}

function clearAcceptance(reason) {
  acceptedSignal = false;
  clearAcceptanceTimer();
  clearRetry();
  mark("waiting-human-acceptance", reason);
}

function install() {
  installObserver();
  mark("waiting-human-acceptance", "install");
  return true;
}

globalThis.addEventListener?.(
  "forge:accepted-quote-confirmed",
  () => deferAcceptanceSignal("forge:accepted-quote-confirmed"),
);

globalThis.addEventListener?.(
  "forge:segubeca-productive-quote-confirmed",
  () => acceptSignal("forge:segubeca-productive-quote-confirmed"),
);

for (const eventName of [
  "forge:quotes-module-ready",
  "forge:quote-candidate-ready",
  "forge:quote-preview-calculated",
  "forge:segubeca-productive-calculation-ready",
  "forge:vida-mujer-handoff-ready",
  "forge:qpd06-state",
  "forge:quote-runtime-ready",
]) {
  globalThis.addEventListener?.(eventName, () => {
    if (acceptedSignal) schedule(eventName);
  });
}

globalThis.addEventListener?.("forge:quote-candidate-cleared", () => {
  clearAcceptance("quote-candidate-cleared");
});

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", install, { once: true });
} else {
  queueMicrotask(install);
}

globalThis.ForgeQuotePrintablePresenceGuardM05W002 = Object.freeze({
  version: VERSION,
  acceptedQuoteReady,
  acceptSignal,
  clearAcceptance,
  deferAcceptanceSignal,
  ensurePresence,
  install,
  printableActionsReady,
  schedule,
});

export {
  VERSION,
  acceptedQuoteReady,
  acceptSignal,
  clearAcceptance,
  deferAcceptanceSignal,
  ensurePresence,
  install,
  printableActionsReady,
  schedule,
};
