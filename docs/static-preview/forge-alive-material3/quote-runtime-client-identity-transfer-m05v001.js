const VERSION = "M05V-001";
const MISSING_CLIENT_LABEL = "Sin dato confirmado";

const state = {
  capturedName: "",
  scheduled: false,
  retryTimer: null,
};

function hasUsableName(value) {
  const normalized = String(value || "").trim();
  return Boolean(
    normalized
    && normalized.toLowerCase() !== MISSING_CLIENT_LABEL.toLowerCase()
    && normalized.toLowerCase() !== "prospecto vida mujer"
  );
}

function cleanName(value) {
  const normalized = String(value || "").trim();
  if (!hasUsableName(normalized) || normalized.length > 120) return "";
  return normalized;
}

function firstName(...values) {
  for (const value of values) {
    const candidate = cleanName(value);
    if (candidate) return candidate;
  }
  return "";
}

function candidateName() {
  const candidate = globalThis.ForgeAcceptedQuoteBridge
    ?.getCurrentQuoteCandidate?.();
  const native = candidate?.nativeResult || {};
  return firstName(
    candidate?.name,
    typeof candidate?.insured === "string" ? candidate.insured : null,
    candidate?.insured?.fullName,
    candidate?.insured?.name,
    candidate?.client?.fullName,
    candidate?.client?.name,
    candidate?.prospect?.fullName,
    candidate?.prospect?.name,
    candidate?.context?.clientName,
    candidate?.context?.insuredName,
    native?.name,
    native?.clientName,
    native?.insuredName,
    typeof native?.insured === "string" ? native.insured : null,
    typeof native?.prospect === "string" ? native.prospect : null,
  );
}

function confirmationPreviewName() {
  return firstName(
    document.querySelector('[data-quote-preview-value="name"]')?.textContent,
    document.querySelector('[data-quote-preview-value="insured"]')?.textContent,
  );
}

function captureName() {
  const next = confirmationPreviewName() || candidateName();
  if (next) state.capturedName = next;
  return state.capturedName;
}

function assignInput(input, value) {
  if (!input) return false;
  const next = cleanName(value);
  const current = String(input.value || "").trim();
  if (current === next) return false;
  input.value = next;
  input.dispatchEvent(new Event("input", { bubbles: true }));
  return true;
}

function syncIdentity() {
  state.scheduled = false;
  const name = captureName();
  const reviewInput = document.querySelector(
    "[data-quote-human-review-client]",
  );
  const printableInput = document.querySelector(
    "[data-m05e005-client-input]",
  );

  if (reviewInput) {
    const current = String(reviewInput.value || "").trim();
    if (name || current.toLowerCase() === MISSING_CLIENT_LABEL.toLowerCase()) {
      assignInput(reviewInput, name);
    }
  }
  if (printableInput && name) assignInput(printableInput, name);

  document.documentElement.dataset.quoteClientIdentityTransfer = VERSION;
  document.documentElement.dataset.quoteClientIdentityReady = name
    ? "true"
    : "false";

  if (!name && state.retryTimer === null) {
    state.retryTimer = globalThis.setTimeout(() => {
      state.retryTimer = null;
      schedule("bounded-retry");
    }, 120);
  }

  return Boolean(name);
}

function schedule() {
  if (state.scheduled) return;
  state.scheduled = true;
  const enqueue = globalThis.requestAnimationFrame
    ? globalThis.requestAnimationFrame.bind(globalThis)
    : (callback) => globalThis.setTimeout(callback, 0);
  enqueue(syncIdentity);
}

// M05E-004 previously dispatched the sentinel as if it were a real name.
// Rewrite it synchronously before downstream input handlers can persist it.
document.addEventListener("input", (event) => {
  const input = event.target?.closest?.("[data-quote-human-review-client]");
  if (!input) return;
  if (
    String(input.value || "").trim().toLowerCase()
    !== MISSING_CLIENT_LABEL.toLowerCase()
  ) {
    if (hasUsableName(input.value)) state.capturedName = input.value.trim();
    return;
  }
  input.value = captureName();
}, true);

document.addEventListener("click", (event) => {
  if (!event.target?.closest?.('[data-quote-preview-action="accept"]')) return;
  captureName();
  schedule("preview-accept");
  globalThis.setTimeout(() => schedule("preview-accepted"), 40);
}, true);

for (const eventName of [
  "forge:quote-candidate-ready",
  "forge:quote-preview-calculated",
  "forge:quote-human-review-updated",
  "forge:accepted-quote-confirmed",
  "forge:qpd06-state",
]) {
  globalThis.addEventListener?.(eventName, schedule);
}

schedule("boot");

globalThis.ForgeQuoteClientIdentityTransferM05V001 = Object.freeze({
  version: VERSION,
  captureName,
  getState() {
    return Object.freeze({
      capturedName: state.capturedName || null,
      ready: Boolean(state.capturedName),
    });
  },
  sync: syncIdentity,
});

export {
  VERSION,
  captureName,
  cleanName,
  syncIdentity,
};
