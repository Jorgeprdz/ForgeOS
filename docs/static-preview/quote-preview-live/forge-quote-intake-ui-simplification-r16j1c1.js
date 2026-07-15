(() => {
  "use strict";

  const VERSION = "R16J1C1_INTAKE_UI_03A2";
  const ROUTE_EVENT = "forge:route-change";
  const HISTORY_PATCH_FLAG =
    "__forgeQuoteIntakeHistoryPatchedR16J1C1";

  const BETA_ATTR = "data-forge-beta-pill-r16j1c1";
  const NOISE_ATTR =
    "data-forge-intake-noise-card-r16j1c1";
  const INLINE_ATTR =
    "data-forge-review-inline-r16j1c1";

  const WRAPPER_SELECTOR =
    '[data-forge-quote-acceptance-r16j0a="true"]';
  const BUTTON_SELECTOR =
    'button[data-forge-confirm-quote-r16j0a="true"]';
  const STATUS_SELECTOR =
    '[data-forge-pdf-status="true"]';
  const INPUT_SELECTOR =
    '[data-forge-local-packet-input="true"]';

  const NAV_LABEL_PATTERN =
    /^(inicio|pipeline|clientes|cotizaciones|más)$/i;

  const LABELS = Object.freeze({
    READY: "Revisar PDF",
    CONFIRMING: "Revisando PDF…",
    ACCEPTED: "PDF revisado",
    ERROR: "Reintentar revisión",
  });

  const VISIBLE_STATES = new Set(Object.keys(LABELS));
  const refreshedAcceptanceWrappers = new WeakSet();

  let framePending = false;
  let timerShort = 0;
  let timerMedium = 0;
  let timerLong = 0;

  function normalizeText(value) {
    return String(value || "")
      .replace(/\s+/g, " ")
      .trim();
  }

  function textIncludes(element, token) {
    return normalizeText(element?.textContent)
      .toLocaleLowerCase("es")
      .includes(token.toLocaleLowerCase("es"));
  }

  function isQuoteDomPresent() {
    return Boolean(document.querySelector(INPUT_SELECTOR));
  }

  function findHeadingByText(token) {
    return (
      Array.from(document.querySelectorAll("h1, h2, h3"))
        .find((heading) => textIncludes(heading, token)) ||
      null
    );
  }

  function findNoiseCard() {
    const heading =
      findHeadingByText("Nuevo borrador de cotización");

    if (!heading) return null;

    let candidate = heading.parentElement;
    let best = null;

    for (let depth = 0; candidate && depth < 7; depth += 1) {
      const text = normalizeText(candidate.textContent);
      const hasBadges =
        text.includes("Preview") &&
        text.includes("Requiere revisión humana") &&
        text.includes("Sin efectos reales");
      const containsUpload =
        text.includes("Carga tu cotización");

      if (hasBadges && !containsUpload) {
        best = candidate;
      }

      if (containsUpload) break;
      candidate = candidate.parentElement;
    }

    return best || heading.parentElement;
  }

  function installBetaPill() {
    const existing = document.querySelector(
      `[${BETA_ATTR}="true"]`,
    );
    if (existing) return existing;

    const noiseCard = findNoiseCard();
    if (!noiseCard?.parentElement) return null;

    const pill = document.createElement("div");
    pill.setAttribute(BETA_ATTR, "true");
    pill.setAttribute("role", "status");
    pill.setAttribute(
      "aria-label",
      "Función en versión beta",
    );
    pill.textContent = "Beta";

    if (!noiseCard.hasAttribute(NOISE_ATTR)) {
      noiseCard.setAttribute(NOISE_ATTR, "true");
    }
    if (!noiseCard.hidden) noiseCard.hidden = true;
    if (noiseCard.getAttribute("aria-hidden") !== "true") {
      noiseCard.setAttribute("aria-hidden", "true");
    }

    noiseCard.parentElement.insertBefore(pill, noiseCard);
    return pill;
  }

  function findUploadCard() {
    const input = document.querySelector(INPUT_SELECTOR);
    if (!input) return null;

    let candidate = input.parentElement;
    let best = null;

    for (let depth = 0; candidate && depth < 8; depth += 1) {
      if (textIncludes(candidate, "Carga tu cotización")) {
        best = candidate;
      }

      if (
        best &&
        candidate.querySelector?.(STATUS_SELECTOR) &&
        candidate.querySelector?.(INPUT_SELECTOR)
      ) {
        best = candidate;
        break;
      }

      candidate = candidate.parentElement;
    }

    return best || input.parentElement;
  }

  function getReviewState(button, wrapper) {
    return String(
      button?.dataset?.forgeQuoteAcceptanceStateR16j0a ||
      wrapper?.dataset?.forgeQuoteAcceptanceStateR16j0a ||
      "",
    ).toUpperCase();
  }

  function applyLabel(button, state) {
    const label = LABELS[state];
    if (!button || !label) return;

    if (normalizeText(button.textContent) !== label) {
      button.textContent = label;
    }

    const ariaLabel =
      state === "READY"
        ? "Revisar el PDF extraído"
        : label;

    if (button.getAttribute("aria-label") !== ariaLabel) {
      button.setAttribute("aria-label", ariaLabel);
    }

    if (
      button.dataset.forgeReviewUiStateR16j1c1 !== state
    ) {
      button.dataset.forgeReviewUiStateR16j1c1 = state;
    }
  }

  function placeReviewAction() {
    const wrapper = document.querySelector(WRAPPER_SELECTOR);
    const button = document.querySelector(BUTTON_SELECTOR);
    const uploadCard = findUploadCard();
    const pdfStatus =
      uploadCard?.querySelector?.(STATUS_SELECTOR);

    if (!wrapper || !button || !uploadCard) return false;

    if (!wrapper.hasAttribute(INLINE_ATTR)) {
      wrapper.setAttribute(INLINE_ATTR, "true");
    }

    const target =
      pdfStatus?.parentElement ||
      uploadCard.querySelector?.(
        '[data-forge-pdf-upload-zone="true"]',
      ) ||
      uploadCard;

    if (wrapper.parentElement !== target) {
      target.appendChild(wrapper);
    }

    return true;
  }

  function refreshAcceptanceRuntimeOnce() {
    const wrapper = document.querySelector(WRAPPER_SELECTOR);
    const runtime =
      globalThis.ForgeQuoteAcceptanceEntrypointR16J0A;

    if (
      !wrapper ||
      refreshedAcceptanceWrappers.has(wrapper) ||
      typeof runtime?.refresh !== "function"
    ) {
      return;
    }

    try {
      runtime.refresh();
      refreshedAcceptanceWrappers.add(wrapper);
    } catch {}
  }

  function syncReviewAction() {
    const wrapper = document.querySelector(WRAPPER_SELECTOR);
    const button = document.querySelector(BUTTON_SELECTOR);

    if (!wrapper || !button) return false;

    const state = getReviewState(button, wrapper);
    const visible = VISIBLE_STATES.has(state);
    const ariaHidden = String(!visible);

    if (wrapper.hidden !== !visible) {
      wrapper.hidden = !visible;
    }
    if (wrapper.getAttribute("aria-hidden") !== ariaHidden) {
      wrapper.setAttribute("aria-hidden", ariaHidden);
    }

    if (visible) applyLabel(button, state);
    return visible;
  }

  function syncQuoteUi() {
    if (!isQuoteDomPresent()) return;

    installBetaPill();
    placeReviewAction();
    refreshAcceptanceRuntimeOnce();
    syncReviewAction();
  }

  function scheduleSync() {
    if (framePending) return;

    framePending = true;
    requestAnimationFrame(() => {
      framePending = false;
      syncQuoteUi();
    });
  }

  function clearBurstTimers() {
    window.clearTimeout(timerShort);
    window.clearTimeout(timerMedium);
    window.clearTimeout(timerLong);
    timerShort = 0;
    timerMedium = 0;
    timerLong = 0;
  }

  function syncBurst() {
    clearBurstTimers();
    scheduleSync();

    timerShort =
      window.setTimeout(scheduleSync, 70);
    timerMedium =
      window.setTimeout(scheduleSync, 220);
    timerLong =
      window.setTimeout(scheduleSync, 650);
  }

  function isNavigationActivation(event) {
    const control = event.target?.closest?.(
      "a, button, [role='button'], [data-nav], " +
      "[data-route], [data-forge-nav]",
    );

    if (!control) return false;

    const text = normalizeText(control.textContent);
    if (NAV_LABEL_PATTERN.test(text)) return true;

    const routeHint = [
      control.getAttribute("href"),
      control.getAttribute("data-nav"),
      control.getAttribute("data-route"),
      control.getAttribute("data-forge-nav"),
      control.getAttribute("aria-label"),
    ]
      .filter(Boolean)
      .join(" ")
      .toLocaleLowerCase("es");

    return [
      "inicio",
      "pipeline",
      "clientes",
      "cotizaciones",
      "mas",
      "más",
    ].some((token) => routeHint.includes(token));
  }

  function onDocumentClick(event) {
    if (!isNavigationActivation(event)) return;
    syncBurst();
  }

  function installHistorySignals() {
    if (history[HISTORY_PATCH_FLAG]) return;

    for (const methodName of ["pushState", "replaceState"]) {
      const original = history[methodName];

      if (typeof original !== "function") continue;

      history[methodName] = function (...args) {
        const result = original.apply(this, args);
        globalThis.dispatchEvent(new Event(ROUTE_EVENT));
        return result;
      };
    }

    Object.defineProperty(history, HISTORY_PATCH_FLAG, {
      value: true,
      configurable: false,
      enumerable: false,
      writable: false,
    });
  }

  function getPublicState() {
    const wrapper = document.querySelector(WRAPPER_SELECTOR);
    const button = document.querySelector(BUTTON_SELECTOR);

    return Object.freeze({
      betaVisible: Boolean(
        document.querySelector(`[${BETA_ATTR}="true"]`),
      ),
      reviewState: getReviewState(button, wrapper),
      reviewVisible: Boolean(wrapper && !wrapper.hidden),
      reviewLabel: normalizeText(button?.textContent),
      navigationSyncPending: framePending,
      globalMutationObserver: false,
      automaticCalculation: false,
      automaticAcceptance: false,
    });
  }

  function disconnect() {
    clearBurstTimers();
    document.removeEventListener(
      "click",
      onDocumentClick,
      true,
    );
    globalThis.removeEventListener(
      ROUTE_EVENT,
      syncBurst,
    );
    globalThis.removeEventListener(
      "popstate",
      syncBurst,
    );
    globalThis.removeEventListener(
      "hashchange",
      syncBurst,
    );
  }

  function boot() {
    if (
      globalThis.ForgeQuoteIntakeUiR16J1C1?.version ===
      VERSION
    ) {
      return;
    }

    installHistorySignals();

    document.addEventListener(
      "click",
      onDocumentClick,
      true,
    );
    globalThis.addEventListener(
      ROUTE_EVENT,
      syncBurst,
    );
    globalThis.addEventListener(
      "popstate",
      syncBurst,
    );
    globalThis.addEventListener(
      "hashchange",
      syncBurst,
    );
    globalThis.addEventListener(
      "forge:accepted-quote-packet-ready",
      syncBurst,
    );
    globalThis.addEventListener(
      "forge:quote-acceptance-state",
      scheduleSync,
    );
    globalThis.addEventListener(
      "forge:accepted-quote-confirmed",
      scheduleSync,
    );
    globalThis.addEventListener(
      "forge:accepted-quote-confirmation-error",
      scheduleSync,
    );

    globalThis.ForgeQuoteIntakeUiR16J1C1 =
      Object.freeze({
        version: VERSION,
        refresh: syncBurst,
        getState: getPublicState,
        disconnect,
      });

    syncBurst();
  }

  if (document.readyState === "loading") {
    document.addEventListener(
      "DOMContentLoaded",
      boot,
      { once: true },
    );
  } else {
    boot();
  }
})();
