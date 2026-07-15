(() => {
  "use strict";

  const VERSION = "R16J1C1_INTAKE_UI_03A";
  const BETA_ATTR = "data-forge-beta-pill-r16j1c1";
  const NOISE_ATTR = "data-forge-intake-noise-card-r16j1c1";
  const INLINE_ATTR = "data-forge-review-inline-r16j1c1";

  const WRAPPER_SELECTOR =
    '[data-forge-quote-acceptance-r16j0a="true"]';
  const BUTTON_SELECTOR =
    'button[data-forge-confirm-quote-r16j0a="true"]';
  const STATUS_SELECTOR =
    '[data-forge-pdf-status="true"]';
  const INPUT_SELECTOR =
    '[data-forge-local-packet-input="true"]';

  const LABELS = Object.freeze({
    READY: "Revisar PDF",
    CONFIRMING: "Revisando PDF…",
    ACCEPTED: "PDF revisado",
    ERROR: "Reintentar revisión",
  });

  const VISIBLE_STATES = new Set(
    Object.keys(LABELS),
  );

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

  function shouldRun() {
    const params = new URLSearchParams(location.search);
    if (params.get("module") === "cotizaciones") {
      return true;
    }

    return Array.from(
      document.querySelectorAll("h1, h2, h3"),
    ).some(
      (heading) =>
        textIncludes(heading, "Nueva cotización") ||
        textIncludes(heading, "Nuevo borrador de cotización"),
    );
  }

  function findHeadingByText(token) {
    return Array.from(
      document.querySelectorAll("h1, h2, h3"),
    ).find((heading) => textIncludes(heading, token)) || null;
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

      if (containsUpload) {
        break;
      }

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

    noiseCard.setAttribute(NOISE_ATTR, "true");
    noiseCard.hidden = true;
    noiseCard.setAttribute("aria-hidden", "true");
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

    button.setAttribute(
      "aria-label",
      state === "READY"
        ? "Revisar el PDF extraído"
        : label,
    );
    button.dataset.forgeReviewUiStateR16j1c1 = state;
  }

  function placeReviewAction() {
    const wrapper = document.querySelector(WRAPPER_SELECTOR);
    const button = document.querySelector(BUTTON_SELECTOR);
    const uploadCard = findUploadCard();
    const pdfStatus = uploadCard?.querySelector?.(STATUS_SELECTOR);

    if (!wrapper || !button || !uploadCard) {
      return false;
    }

    wrapper.setAttribute(INLINE_ATTR, "true");

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

  function syncReviewAction() {
    const wrapper = document.querySelector(WRAPPER_SELECTOR);
    const button = document.querySelector(BUTTON_SELECTOR);

    if (!wrapper || !button) {
      return false;
    }

    const state = getReviewState(button, wrapper);
    const visible = VISIBLE_STATES.has(state);

    wrapper.hidden = !visible;
    wrapper.setAttribute(
      "aria-hidden",
      String(!visible),
    );

    if (visible) {
      applyLabel(button, state);
    }

    return visible;
  }

  function refreshAcceptanceRuntime() {
    try {
      globalThis.ForgeQuoteAcceptanceEntrypointR16J0A
        ?.refresh?.();
    } catch {}
  }

  function settle() {
    installBetaPill();
    placeReviewAction();
    refreshAcceptanceRuntime();
    syncReviewAction();
  }

  function settleBurst() {
    settle();
    queueMicrotask(settle);

    requestAnimationFrame(() => {
      settle();
      window.setTimeout(settle, 0);
      window.setTimeout(settle, 120);
      window.setTimeout(settle, 500);
    });
  }

  function boot() {
    if (!shouldRun()) return;

    settleBurst();

    globalThis.addEventListener(
      "forge:accepted-quote-packet-ready",
      settleBurst,
    );
    globalThis.addEventListener(
      "forge:quote-acceptance-state",
      settleBurst,
    );
    globalThis.addEventListener(
      "forge:accepted-quote-confirmed",
      settleBurst,
    );
    globalThis.addEventListener(
      "forge:accepted-quote-confirmation-error",
      settleBurst,
    );

    const observer = new MutationObserver(() => {
      settle();
    });

    observer.observe(document.documentElement, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: [
        "hidden",
        "data-forge-quote-acceptance-state-r16j0a",
      ],
    });

    globalThis.ForgeQuoteIntakeUiR16J1C1 = Object.freeze({
      version: VERSION,
      refresh: settleBurst,
      getState() {
        const wrapper =
          document.querySelector(WRAPPER_SELECTOR);
        const button =
          document.querySelector(BUTTON_SELECTOR);

        return Object.freeze({
          betaVisible: Boolean(
            document.querySelector(
              `[${BETA_ATTR}="true"]`,
            ),
          ),
          reviewState: getReviewState(button, wrapper),
          reviewVisible: Boolean(
            wrapper && !wrapper.hidden,
          ),
          reviewLabel:
            normalizeText(button?.textContent),
          automaticCalculation: false,
          automaticAcceptance: false,
        });
      },
    });
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
