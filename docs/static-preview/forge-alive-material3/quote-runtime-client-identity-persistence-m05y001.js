import "./quote-runtime-printable-state-handoff-m05z001.js?v=m05z-001";

const VERSION = "M05Y-001";
const REJECTED_NAMES = new Set([
  "sin dato confirmado",
  "prospecto vida mujer",
  "cliente vida mujer",
]);

let scheduled = false;
let syncing = false;
let lastPersistedName = "";

function cleanName(value) {
  const name = String(value || "").trim();
  if (!name || name.length > 120) return "";
  if (REJECTED_NAMES.has(name.toLowerCase())) return "";
  return name;
}

function visibleClientName() {
  return cleanName(
    document.querySelector("[data-quote-human-review-client]")?.value,
  ) || cleanName(
    document.querySelector('[data-quote-preview-value="name"]')?.textContent,
  );
}

function bridgeClientName(bridge) {
  return cleanName(
    bridge?.getCurrentQuoteHumanReview?.()?.clientName,
  );
}

function persistIdentity() {
  scheduled = false;
  if (syncing) return false;

  const name = visibleClientName();
  if (!name) return false;
  const bridge = globalThis.ForgeAcceptedQuoteBridge;
  if (!bridge) return false;

  syncing = true;
  try {
    if (bridgeClientName(bridge) !== name) {
      bridge.setCurrentQuoteHumanReview?.({ clientName: name });
    }

    const printableInput = document.querySelector(
      "[data-m05e005-client-input]",
    );
    if (printableInput && printableInput.value !== name) {
      printableInput.value = name;
      printableInput.dispatchEvent(new Event("input", { bubbles: true }));
    }

    if (lastPersistedName !== name) {
      lastPersistedName = name;
      globalThis.setTimeout(() => {
        globalThis.ForgeQuotePrintableStateHandoffM05Z001?.reconcile?.(
          "client-identity-persisted",
        );
        globalThis.ForgeQuotePrintableEntrypointQPD06?.refresh?.();
      }, 0);
    }

    document.documentElement.dataset.quoteClientIdentityPersistence = VERSION;
    document.documentElement.dataset.quoteClientIdentityPersisted = "true";
    return true;
  } finally {
    syncing = false;
  }
}

function schedule() {
  if (scheduled) return;
  scheduled = true;
  const enqueue = globalThis.requestAnimationFrame
    ? globalThis.requestAnimationFrame.bind(globalThis)
    : (callback) => globalThis.setTimeout(callback, 0);
  enqueue(persistIdentity);
}

document.addEventListener("input", (event) => {
  if (event.target?.matches?.("[data-quote-human-review-client]")) schedule();
}, true);

document.addEventListener("click", (event) => {
  if (event.target?.closest?.('[data-quote-preview-action="accept"]')) {
    globalThis.setTimeout(schedule, 40);
  }
}, true);

for (const eventName of [
  "forge:quote-human-review-updated",
  "forge:accepted-quote-confirmed",
  "forge:qpd06-state",
]) {
  globalThis.addEventListener?.(eventName, schedule);
}

globalThis.ForgeQuoteClientIdentityPersistenceM05Y001 = Object.freeze({
  version: VERSION,
  persist: persistIdentity,
  schedule,
});

export { VERSION, persistIdentity, schedule };
