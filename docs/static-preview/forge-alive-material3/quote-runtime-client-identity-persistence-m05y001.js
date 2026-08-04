import "./quote-runtime-printable-state-handoff-m05z001.js?v=m05z-002-single-instance";

const VERSION = "M05Y-001";
const REJECTED_NAMES = new Set([
  "sin dato confirmado",
  "prospecto vida mujer",
  "cliente vida mujer",
]);

let scheduled = false;
let syncing = false;
let lastPersistedName = "";
let scheduledReason = "scheduled";

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
    document.querySelector("[data-m05e005-client-input]")?.value,
  ) || cleanName(
    document.querySelector('[data-quote-preview-value="name"]')?.textContent,
  );
}

function bridgeClientName(bridge) {
  return cleanName(
    bridge?.getCurrentQuoteHumanReview?.()?.clientName,
  );
}

function persistIdentity(reason = scheduledReason) {
  scheduled = false;
  scheduledReason = "scheduled";
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
    document.documentElement.dataset.quoteClientIdentityPersistenceReason = reason;
    return true;
  } finally {
    syncing = false;
  }
}

function schedule(reason = "scheduled") {
  scheduledReason = reason;
  if (scheduled) return;
  scheduled = true;
  const enqueue = globalThis.requestAnimationFrame
    ? globalThis.requestAnimationFrame.bind(globalThis)
    : (callback) => globalThis.setTimeout(callback, 0);
  enqueue(() => persistIdentity(reason));
}

function persistBeforeGovernedAction(event) {
  const target = event.target;
  if (!target?.closest) return;

  const confirmsQuote = target.closest(
    '[data-quote-next-action="confirm_quote"]',
  );
  const acceptsPreview = target.closest(
    '[data-quote-preview-action="accept"]',
  );
  const printableAction = target.closest(
    '[data-m05e005-action="preview"], [data-m05e005-action="download"]',
  );

  if (confirmsQuote) {
    // Never traverse the accepted-quote bridge from the capture phase of the
    // governed confirmation click. The review data has already been updated
    // by input/change events; any final reconciliation is safely deferred.
    schedule("confirmation-click-deferred");
    return;
  }

  if (acceptsPreview || printableAction) {
    schedule(
      acceptsPreview
        ? "preview-accept-click-deferred"
        : "printable-action-click-deferred",
    );
  }

  if (acceptsPreview) {
    globalThis.setTimeout(
      () => schedule("preview-accept-post-action"),
      40,
    );
  }
}

document.addEventListener("input", (event) => {
  if (event.target?.matches?.(
    "[data-quote-human-review-client], [data-m05e005-client-input]",
  )) {
    schedule("identity-input");
  }
}, true);

document.addEventListener("change", (event) => {
  if (event.target?.matches?.(
    "[data-quote-human-review-client], [data-m05e005-client-input]",
  )) {
    schedule("identity-change");
  }
}, true);

document.addEventListener("click", persistBeforeGovernedAction, true);

for (const eventName of [
  "forge:quote-human-review-updated",
  "forge:accepted-quote-confirmed",
  "forge:qpd06-state",
]) {
  globalThis.addEventListener?.(eventName, () => {
    // These events can originate while bridge wrappers are still publishing
    // state. Coalesce persistence outside the dispatch stack.
    schedule(eventName);
  });
}

globalThis.ForgeQuoteClientIdentityPersistenceM05Y001 = Object.freeze({
  version: VERSION,
  persist: persistIdentity,
  schedule,
});

export { VERSION, persistIdentity, schedule };
