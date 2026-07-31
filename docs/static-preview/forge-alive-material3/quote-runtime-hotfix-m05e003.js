const VERSION = "M05E-003";
const MAX_CACHE_AGE_HOURS = 18;
const MAX_SOURCE_AGE_DAYS = 7;

const state = {
  clientName: "",
  cache: null,
  cacheState: "LOADING",
  bridgeSource: null,
  wrappedBridge: null,
  refreshTimer: null,
};

function isRecord(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function hasText(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function clone(value) {
  if (typeof structuredClone === "function") return structuredClone(value);
  return JSON.parse(JSON.stringify(value));
}

function deepFreeze(value, seen = new WeakSet()) {
  if (!value || typeof value !== "object" || seen.has(value)) return value;
  seen.add(value);
  Object.values(value).forEach((item) => deepFreeze(item, seen));
  return Object.freeze(value);
}

function parseSourceDate(value) {
  const raw = String(value || "").trim();
  const mx = raw.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (mx) {
    return new Date(Date.UTC(Number(mx[3]), Number(mx[2]) - 1, Number(mx[1])));
  }
  const parsed = new Date(raw);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function hoursOld(value) {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return Infinity;
  return Math.max(0, Date.now() - parsed.getTime()) / 36e5;
}

function daysOld(value) {
  const parsed = parseSourceDate(value);
  if (!parsed) return Infinity;
  return Math.max(0, Date.now() - parsed.getTime()) / 864e5;
}

function validateRateCache(cache) {
  const rate = cache?.rates?.UDI_MXN;
  const value = Number(rate?.value);
  const cacheStatus = String(cache?.cacheStatus || "").toUpperCase();
  const validStatus = ["CACHE_REFRESHED", "CACHE_HIT", "LIVE_REFRESHED"].includes(cacheStatus);
  const valid = Boolean(
    isRecord(cache) &&
    isRecord(rate) &&
    Number.isFinite(value) &&
    value > 0 &&
    rate.source === "BANXICO_SIE_API" &&
    rate.mode === "LATEST_VERIFIED" &&
    validStatus &&
    hoursOld(cache.cachedAt) <= MAX_CACHE_AGE_HOURS &&
    daysOld(rate.date) <= MAX_SOURCE_AGE_DAYS
  );
  return {
    valid,
    value: valid ? value : null,
    date: rate?.date || null,
    source: rate?.source || null,
    reason: valid ? null : "UDI_CACHE_STALE_OR_INVALID",
  };
}

async function fetchJson(url) {
  const response = await fetch(url, { cache: "no-store" });
  if (!response.ok) throw new Error(`RATE_FETCH_${response.status}`);
  return response.json();
}

async function loadCurrentRateCache() {
  const candidates = [
    new URL("../../../api/forge-market-rates", import.meta.url).href,
    new URL("../../../forge-rate-cache.json", import.meta.url).href,
  ];

  for (const url of candidates) {
    try {
      const payload = await fetchJson(url);
      const cache = payload?.ok === true
        ? {
            cachedAt: payload.cachedAt || new Date().toISOString(),
            rates: payload.rates,
            cacheStatus: payload.cacheStatus || "LIVE_REFRESHED",
          }
        : payload;
      const validation = validateRateCache(cache);
      if (validation.valid) return { cache, validation, url };
    } catch {
      // Try the next bounded source. No stale value is silently accepted.
    }
  }

  return {
    cache: {
      cachedAt: null,
      cacheStatus: "STALE_BLOCKED",
      stale: true,
      rates: {
        UDI_MXN: {
          value: null,
          source: "not_available",
          date: null,
          mode: "BLOCKED",
          stale: true,
        },
      },
    },
    validation: {
      valid: false,
      value: null,
      date: null,
      source: null,
      reason: "UDI_CACHE_STALE_OR_INVALID",
    },
    url: null,
  };
}

async function initializeRateAuthority() {
  const result = await loadCurrentRateCache();
  state.cache = result.cache;
  state.cacheState = result.validation.valid ? "READY" : "BLOCKED";
  globalThis.ForgeQuoteUdiRateCache = result.cache;
  globalThis.ForgeQuoteRateCache = result.cache;
  globalThis.ForgeOrviRateProvider = async () => result.cache;
  document.documentElement.dataset.forgeUdiRateState = state.cacheState.toLowerCase();
  document.documentElement.dataset.forgeUdiRateDate = result.validation.date || "blocked";
  globalThis.dispatchEvent?.(new CustomEvent("forge:current-rate-authority-ready", {
    detail: Object.freeze({
      version: VERSION,
      state: state.cacheState,
      date: result.validation.date,
      source: result.validation.source,
      value: result.validation.value,
      sourceUrl: result.url,
    }),
  }));
}

function candidateClientName(candidate) {
  const candidates = [
    candidate?.client?.fullName,
    candidate?.client?.name,
    candidate?.prospect?.fullName,
    candidate?.prospect?.name,
    candidate?.context?.clientName,
    candidate?.context?.insuredName,
    candidate?.nativeResult?.clientName,
    candidate?.nativeResult?.prospect,
    candidate?.nativeResult?.insured,
  ];
  return candidates.find(hasText)?.trim() || "";
}

function snapshotClientName(snapshot) {
  return candidateClientName(snapshot?.acceptedQuote || {});
}

function currentClientName() {
  if (hasText(state.clientName)) return state.clientName.trim();
  const bridge = state.wrappedBridge || globalThis.ForgeAcceptedQuoteBridge;
  const candidate = bridge?.getCurrentQuoteCandidate?.();
  return candidateClientName(candidate);
}

function patchCandidate(candidate, clientName) {
  if (!isRecord(candidate) || !hasText(clientName)) return candidate;
  try {
    if (!isRecord(candidate.context)) candidate.context = {};
    candidate.context.clientName = clientName.trim();
    if (isRecord(candidate.nativeResult) && !hasText(candidate.nativeResult.clientName)) {
      candidate.nativeResult.clientName = clientName.trim();
    }
  } catch {
    // The printable snapshot wrapper below remains the bounded fallback.
  }
  return candidate;
}

function patchSnapshot(snapshot) {
  if (!isRecord(snapshot)) return snapshot;
  if (snapshotClientName(snapshot)) return snapshot;
  const clientName = currentClientName();
  if (!clientName) return snapshot;
  const output = clone(snapshot);
  if (!isRecord(output.acceptedQuote.context)) output.acceptedQuote.context = {};
  output.acceptedQuote.context.clientName = clientName;
  if (!isRecord(output.acceptedQuote.client)) output.acceptedQuote.client = {};
  output.acceptedQuote.client.name = clientName;
  if (isRecord(output.acceptedQuote.nativeResult)) {
    output.acceptedQuote.nativeResult.clientName = clientName;
  }
  return deepFreeze(output);
}

function installBridgeWrapper() {
  const current = globalThis.ForgeAcceptedQuoteBridge;
  if (!current || current.__m05e003Wrapped === true) {
    if (current?.__m05e003Wrapped) state.wrappedBridge = current;
    return Boolean(current);
  }

  state.bridgeSource = current;
  const wrapper = Object.freeze({
    ...current,
    __m05e003Wrapped: true,
    setCurrentQuoteHumanReview(patch = {}) {
      if (hasText(patch.clientName)) state.clientName = patch.clientName.trim();
      patchCandidate(current.getCurrentQuoteCandidate?.(), state.clientName);
      scheduleEnhance();
      globalThis.dispatchEvent?.(new CustomEvent("forge:quote-human-review-updated", {
        detail: Object.freeze({ version: VERSION, clientNameReady: Boolean(currentClientName()) }),
      }));
      return Object.freeze({ clientName: currentClientName() || null });
    },
    getCurrentQuoteHumanReview() {
      return Object.freeze({ clientName: currentClientName() || null });
    },
    getAcceptedQuoteReviewSnapshot() {
      return patchSnapshot(current.getAcceptedQuoteReviewSnapshot?.());
    },
    async confirmCurrentQuoteCandidate() {
      const clientName = currentClientName();
      if (!clientName) {
        throw new Error("Captura el nombre del cliente o asegurado antes de confirmar.");
      }
      patchCandidate(current.getCurrentQuoteCandidate?.(), clientName);
      const accepted = await current.confirmCurrentQuoteCandidate();
      return patchSnapshot(accepted);
    },
  });

  globalThis.ForgeAcceptedQuoteBridge = wrapper;
  state.wrappedBridge = wrapper;
  globalThis.dispatchEvent?.(new CustomEvent("forge:quote-human-review-bridge-ready", {
    detail: Object.freeze({ version: VERSION }),
  }));
  return true;
}

function formatMxn(value) {
  return `≈ $${new Intl.NumberFormat("es-MX", {
    maximumFractionDigits: 2,
  }).format(value)} MXN hoy`;
}

function parseUdiFromNode(node) {
  const match = String(node?.textContent || "").replaceAll(",", "").match(/([0-9]+(?:\.[0-9]+)?)\s*UDI/i);
  return match ? Number(match[1]) : null;
}

function ensureAnnualContributionMxn(projection) {
  const rate = validateRateCache(state.cache);
  const card = projection.querySelector('[data-quote-mandatory-metric="annual-contribution"]');
  const strong = card?.querySelector("strong");
  if (!strong) return;
  const old = strong.querySelector("[data-current-annual-contribution-mxn]");
  if (!rate.valid) {
    if (!old) {
      const blocked = strong.ownerDocument.createElement("span");
      blocked.dataset.currentAnnualContributionMxn = "blocked";
      blocked.className = "quotes-value-line quotes-value-line--conversion";
      blocked.textContent = "MXN bloqueado: actualiza la UDI vigente";
      strong.append(blocked);
    }
    return;
  }
  const udi = parseUdiFromNode(strong);
  if (!Number.isFinite(udi)) return;
  const text = formatMxn(udi * rate.value);
  if (old) {
    old.textContent = text;
    old.dataset.currentAnnualContributionMxn = "ready";
    return;
  }
  const line = strong.ownerDocument.createElement("span");
  line.dataset.currentAnnualContributionMxn = "ready";
  line.className = "quotes-value-line quotes-value-line--conversion";
  line.textContent = text;
  strong.append(line);
}

function ensureRateEvidence(projection) {
  const section = projection.querySelector("[data-quote-rate-metadata]");
  if (!section) return;
  const rate = validateRateCache(state.cache);
  let status = section.querySelector("[data-live-udi-rate-evidence]");
  if (!status) {
    status = section.ownerDocument.createElement("p");
    status.dataset.liveUdiRateEvidence = "true";
    section.append(status);
  }
  status.textContent = rate.valid
    ? `UDI vigente: ${rate.value} MXN · ${rate.date} · BANXICO SIE`
    : "UDI vigente no disponible. Las equivalencias MXN permanecen bloqueadas.";
  status.dataset.tone = rate.valid ? "success" : "error";
}

function ensureReviewForm(projection) {
  const actions = projection.querySelector("[data-quote-last-actions]");
  if (!actions) return null;
  let section = projection.querySelector("[data-quote-human-review-m05e003]");
  if (!section) {
    section = projection.ownerDocument.createElement("section");
    section.className = "quote-commercial__review quote-human-review-m05e003";
    section.dataset.quoteHumanReviewM05e003 = "true";
    section.innerHTML = `
      <h3>Datos para confirmar e imprimir</h3>
      <label class="quotes-field">
        <span>Cliente / asegurado</span>
        <input type="text" autocomplete="off" data-quote-human-review-client
          placeholder="Nombre completo">
        <small>Revisión humana local. No modifica CRM.</small>
      </label>
      <p data-quote-human-review-status role="status" aria-live="polite"></p>
    `;
    actions.before(section);
  }

  const input = section.querySelector("[data-quote-human-review-client]");
  if (input && !input.dataset.bound) {
    input.dataset.bound = "true";
    input.addEventListener("input", () => {
      state.clientName = input.value.trim();
      installBridgeWrapper();
      state.wrappedBridge?.setCurrentQuoteHumanReview?.({ clientName: state.clientName });
      configureActionState(projection, section);
      configurePrintableActions(projection, section);
    });
  }
  const detected = currentClientName();
  if (input && !input.value && detected) input.value = detected;
  return section;
}

function ensureClientPendingEvidence(projection, ready) {
  const review = projection.querySelector("[data-quote-evidence-warnings]");
  const list = review?.querySelector("ul");
  if (!list) return;
  let item = list.querySelector("[data-client-review-pending]");
  if (!ready && !item) {
    item = list.ownerDocument.createElement("li");
    item.dataset.clientReviewPending = "true";
    item.textContent = "Cliente / asegurado requerido para confirmar e imprimir.";
    list.prepend(item);
  }
  if (ready && item) item.remove();
}

function configureActionState(projection, reviewSection) {
  const clientName = currentClientName();
  const accepted = state.wrappedBridge?.getAcceptedQuoteReviewSnapshot?.();
  const confirm = projection.querySelector('[data-quote-next-action="confirm_quote"]');
  const review = projection.querySelector('[data-quote-next-action="review_pending"]');
  const status = reviewSection?.querySelector("[data-quote-human-review-status]");
  const input = reviewSection?.querySelector("[data-quote-human-review-client]");

  ensureClientPendingEvidence(projection, Boolean(clientName));

  if (review) {
    review.disabled = false;
    review.removeAttribute("aria-disabled");
    if (!review.dataset.m05e003Bound) {
      review.dataset.m05e003Bound = "true";
      review.addEventListener("click", () => input?.focus(), { capture: true });
    }
  }

  if (confirm && !confirm.dataset.m05e003Bound) {
    confirm.dataset.m05e003Bound = "true";
    confirm.addEventListener("click", (event) => {
      if (currentClientName()) return;
      event.preventDefault();
      event.stopImmediatePropagation();
      input?.focus();
      if (status) status.textContent = "Captura el nombre antes de confirmar.";
    }, { capture: true });
  }

  if (!confirm) return;
  if (accepted && clientName) {
    confirm.disabled = true;
    confirm.textContent = "Cotización confirmada";
    projection.closest("[data-forge-quotes-module]")?.setAttribute("data-quote-accepted", "true");
    if (status) status.textContent = "Cotización confirmada y lista para imprimir.";
    globalThis.ForgeQuotePrintableEntrypointQPD06?.refresh?.();
  } else {
    confirm.disabled = false;
    if (!clientName) confirm.textContent = "Captura cliente para confirmar";
    else if (/Captura cliente|Cotización confirmada/.test(confirm.textContent)) {
      confirm.textContent = "Confirmar cotización";
    }
    if (status) status.textContent = clientName
      ? "Datos completos. Confirma la cotización."
      : "Falta el nombre del cliente o asegurado.";
  }
}

function configurePrintableActions(projection, reviewSection) {
  const api = globalThis.ForgeQuotePrintableEntrypointQPD06;
  const qpdState = api?.getState?.() || {};
  const clientReady = Boolean(currentClientName());
  const input = reviewSection?.querySelector("[data-quote-human-review-client]");
  const actions = document.querySelector('[data-forge-qpd06-actions="true"]');
  if (!actions) return;

  const history = actions.querySelector('[data-forge-qpd06-action="history"]');
  if (history) {
    history.hidden = qpdState.durableIdentityReady !== true;
    history.setAttribute("aria-hidden", String(history.hidden));
  }

  let note = actions.querySelector("[data-qpd-history-purpose]");
  if (!note) {
    note = actions.ownerDocument.createElement("small");
    note.dataset.qpdHistoryPurpose = "true";
    actions.append(note);
  }
  note.textContent = qpdState.durableIdentityReady
    ? "Historial conserva versiones imprimibles de esta cotización."
    : "Historial disponible al abrir la cotización desde un prospecto.";

  for (const action of ["preview", "download"]) {
    const button = actions.querySelector(`[data-forge-qpd06-action="${action}"]`);
    if (!button) continue;
    button.disabled = !clientReady || qpdState.acceptedQuoteReady !== true;
    button.setAttribute("aria-disabled", String(button.disabled));
    if (!button.dataset.m05e003Bound) {
      button.dataset.m05e003Bound = "true";
      button.addEventListener("click", (event) => {
        if (currentClientName()) return;
        event.preventDefault();
        event.stopImmediatePropagation();
        input?.focus();
      }, { capture: true });
    }
  }
}

function enhance() {
  installBridgeWrapper();
  const projection = document.querySelector("[data-material3-quotes-projection]");
  if (!projection || projection.hidden) return;
  projection.dataset.quoteCalculatorRuntime = VERSION;
  ensureAnnualContributionMxn(projection);
  ensureRateEvidence(projection);
  const reviewSection = ensureReviewForm(projection);
  configureActionState(projection, reviewSection);
  configurePrintableActions(projection, reviewSection);
}

function scheduleEnhance() {
  clearTimeout(state.refreshTimer);
  state.refreshTimer = setTimeout(enhance, 40);
}

for (const eventName of [
  "forge:quotes-module-ready",
  "forge:quote-candidate-ready",
  "forge:quote-preview-calculated",
  "forge:accepted-quote-confirmed",
  "forge:qpd06-state",
]) {
  globalThis.addEventListener(eventName, scheduleEnhance);
}

const observer = new MutationObserver(scheduleEnhance);
observer.observe(document.documentElement, {
  childList: true,
  subtree: true,
  attributes: true,
  attributeFilter: ["hidden", "disabled", "data-forge-state"],
});

await initializeRateAuthority();
scheduleEnhance();

globalThis.ForgeQuoteRuntimeHotfixM05E003 = Object.freeze({
  version: VERSION,
  currentClientName,
  enhance,
  getRateState: () => Object.freeze({ state: state.cacheState, cache: state.cache }),
});

document.documentElement.dataset.quoteCalculatorRuntime = VERSION;
