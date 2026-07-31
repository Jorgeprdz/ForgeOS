const VERSION = "M05E-004";
const MISSING_CLIENT_LABEL = "Sin dato confirmado";

const state = {
  timer: null,
};

function hasText(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function isMissingLabel(value) {
  return String(value || "").trim().toLowerCase() === MISSING_CLIENT_LABEL.toLowerCase();
}

function cleanName(value) {
  if (!hasText(value)) return "";
  const output = value.trim();
  if (output.length > 120 || isMissingLabel(output)) return "";
  return output;
}

function knownCandidateName(candidate) {
  const values = [
    candidate?.client?.fullName,
    candidate?.client?.name,
    candidate?.insured?.fullName,
    candidate?.insured?.name,
    candidate?.prospect?.fullName,
    candidate?.prospect?.name,
    candidate?.context?.clientName,
    candidate?.context?.insuredName,
    candidate?.nativeResult?.clientName,
    candidate?.nativeResult?.insuredName,
    candidate?.nativeResult?.prospectName,
    typeof candidate?.nativeResult?.client === "string" ? candidate.nativeResult.client : null,
    typeof candidate?.nativeResult?.insured === "string" ? candidate.nativeResult.insured : null,
  ];
  return values.map(cleanName).find(Boolean) || "";
}

function recursivelyFindClientName(value, path = [], depth = 0, seen = new WeakSet()) {
  if (!value || depth > 5) return "";
  if (typeof value === "string") {
    const joined = path.join("_").toLowerCase();
    const clientContext = /(client|insured|asegurado|prospect)/.test(joined);
    const nameContext = /(name|nombre|full.?name)/.test(joined)
      || /(client|insured|asegurado)$/.test(joined);
    return clientContext && nameContext ? cleanName(value) : "";
  }
  if (typeof value !== "object" || seen.has(value)) return "";
  seen.add(value);
  for (const [key, nested] of Object.entries(value)) {
    const found = recursivelyFindClientName(nested, [...path, key], depth + 1, seen);
    if (found) return found;
  }
  return "";
}

function detectedClientName() {
  const bridge = globalThis.ForgeAcceptedQuoteBridge;
  const candidate = bridge?.getCurrentQuoteCandidate?.();
  const accepted = bridge?.getAcceptedQuoteReviewSnapshot?.()?.acceptedQuote;
  return knownCandidateName(candidate)
    || knownCandidateName(accepted)
    || recursivelyFindClientName(candidate)
    || recursivelyFindClientName(accepted)
    || "";
}

function ensureUxStyles() {
  if (document.querySelector("[data-quote-ux-closure-m05e004-styles]")) return;
  const style = document.createElement("style");
  style.dataset.quoteUxClosureM05e004Styles = "true";
  style.textContent = `
    [data-forge-qpd06-action="history"][hidden] {
      display: inline-flex !important;
    }
    [data-qpd-history-purpose] {
      display: none !important;
    }
  `;
  document.head.append(style);
}

function restoreHistory() {
  const history = document.querySelector('[data-forge-qpd06-action="history"]');
  if (!history) return;

  if (!history.dataset.m05e004HistoryRestored) {
    history.dataset.m05e004HistoryRestored = "true";
    try {
      Object.defineProperty(history, "hidden", {
        configurable: true,
        get: () => false,
        set: () => history.removeAttribute("hidden"),
      });
    } catch {
      // The author-level style above remains the bounded visual fallback.
    }
  }

  history.removeAttribute("hidden");
  history.setAttribute("aria-hidden", "false");
  history.disabled = false;
  history.removeAttribute("aria-disabled");
  history.title = "Consultar versiones imprimibles de esta cotización";
}

function setInputValue(input, value) {
  if (!input || input.value === value) return;
  input.value = value;
  input.dispatchEvent(new Event("input", { bubbles: true }));
}

function relaxClientConfirmation() {
  const projection = document.querySelector("[data-material3-quotes-projection]");
  const section = projection?.querySelector("[data-quote-human-review-m05e003]");
  const input = section?.querySelector("[data-quote-human-review-client]");
  if (!projection || !section || !input) return;

  const heading = section.querySelector("h3");
  if (heading) heading.textContent = "Datos del documento";

  const label = section.querySelector("label > span");
  if (label) label.textContent = "Cliente / asegurado";

  const help = section.querySelector("label > small");
  if (help) {
    help.textContent = "Opcional. Forge lo completa cuando está disponible y puedes editarlo antes de imprimir.";
  }

  const detected = detectedClientName();
  const current = input.value.trim();
  if (!current || (isMissingLabel(current) && detected)) {
    setInputValue(input, detected || MISSING_CLIENT_LABEL);
  }

  const status = section.querySelector("[data-quote-human-review-status]");
  if (status) {
    status.textContent = detected
      ? "Nombre tomado de la cotización. Puedes editarlo antes de imprimir."
      : "El nombre es opcional; el documento indicará “Sin dato confirmado”.";
  }

  const confirm = projection.querySelector('[data-quote-next-action="confirm_quote"]');
  if (confirm && /Captura cliente para confirmar/i.test(confirm.textContent || "")) {
    confirm.textContent = "Confirmar cotización";
  }

  projection.querySelector("[data-client-review-pending]")?.remove();
}

function enhance() {
  ensureUxStyles();
  relaxClientConfirmation();
  restoreHistory();
  document.documentElement.dataset.quoteCalculatorRuntime = VERSION;
}

function scheduleEnhance() {
  clearTimeout(state.timer);
  state.timer = setTimeout(enhance, 90);
}

for (const eventName of [
  "DOMContentLoaded",
  "forge:quotes-module-ready",
  "forge:quote-candidate-ready",
  "forge:quote-preview-calculated",
  "forge:accepted-quote-confirmed",
  "forge:qpd06-state",
  "forge:quote-human-review-updated",
]) {
  globalThis.addEventListener(eventName, scheduleEnhance);
}

const observer = new MutationObserver(scheduleEnhance);
observer.observe(document.documentElement, {
  childList: true,
  subtree: true,
});

scheduleEnhance();

globalThis.ForgeQuoteRuntimeUxClosureM05E004 = Object.freeze({
  version: VERSION,
  missingClientLabel: MISSING_CLIENT_LABEL,
  detectedClientName,
  enhance,
});

document.documentElement.dataset.quoteCalculatorRuntime = VERSION;
