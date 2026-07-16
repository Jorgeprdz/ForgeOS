(() => {
  "use strict";

  const VERSION = "R16J1";
  const params = new URLSearchParams(location.search);
  const debugValue = params.get("debug");
  const DEBUG_MODE =
    debugValue === "1" || debugValue === "true";

  const DEBUG_HEADINGS = new Set([
    "product intelligence",
    "readiness del preview",
  ]);

  const DEBUG_PREFIXES = [
    "flujo activo:",
    "la presentacion se abre en revision editable",
  ];

  let scheduled = false;

  const normalize = (value) =>
    String(value ?? "")
      .normalize("NFD")
      .replace(/\p{Diacritic}/gu, "")
      .toLowerCase()
      .replace(/\s+/g, " ")
      .trim();

  function findSectionByHeading(label) {
    return [...document.querySelectorAll("h2, h3")].find(
      (heading) => normalize(heading.textContent) === label,
    )?.closest("section, article") ||
      [...document.querySelectorAll("h2, h3")].find(
        (heading) => normalize(heading.textContent) === label,
      )?.parentElement ||
      null;
  }

  function markDebugSections() {
    let count = 0;

    for (const heading of DEBUG_HEADINGS) {
      const section = findSectionByHeading(heading);

      if (!section) continue;

      section.dataset.forgeDebugOnlyR16j1 = "true";
      count += 1;
    }

    return count;
  }

  function markDebugDetails() {
    let count = 0;

    for (const element of document.querySelectorAll(
      "p, small, li",
    )) {
      const text = normalize(element.textContent);

      if (
        DEBUG_PREFIXES.some((prefix) =>
          text.startsWith(prefix),
        )
      ) {
        element.dataset.forgeDebugOnlyR16j1 = "true";
        count += 1;
      }
    }

    return count;
  }

  function ensureWatermark() {
    let watermark = document.querySelector(
      '[data-forge-watermark-r16j1="true"]',
    );

    if (!watermark) {
      watermark = document.createElement("div");
      watermark.dataset.forgeWatermarkR16j1 = "true";
      watermark.setAttribute("aria-hidden", "true");
      document.body.appendChild(watermark);
    }

    watermark.textContent = DEBUG_MODE
      ? "DEBUG · Forge · R16J1"
      : "Forge · R16J1";
  }

  function findActionsSection() {
    return findSectionByHeading("acciones seguras");
  }

  function ensureCompactStatus() {
    const actions = findActionsSection();

    if (!actions) return null;

    let strip = actions.querySelector(
      '[data-forge-user-status-r16j1="true"]',
    );

    if (!strip) {
      strip = document.createElement("div");
      strip.dataset.forgeUserStatusR16j1 = "true";
      strip.setAttribute("role", "status");
      strip.setAttribute("aria-live", "polite");

      const heading = [...actions.querySelectorAll("h2, h3")]
        .find(
          (candidate) =>
            normalize(candidate.textContent) ===
            "acciones seguras",
        );

      heading?.insertAdjacentElement("afterend", strip);
    }

    return strip;
  }

  function deriveUserState() {
    const acceptance = document.querySelector(
      'button[data-forge-confirm-quote-r16j0a="true"]',
    );
    const presentation = document.querySelector(
      'button[data-forge-sales-presentation-entrypoint-r16j0="true"]',
    );

    const acceptanceState =
      acceptance?.dataset
        ?.forgeQuoteAcceptanceStateR16j0a || "";

    const presentationState =
      presentation?.dataset
        ?.forgeSalesPresentationStateR16j0 || "";

    if (presentationState === "SESSION_READY") {
      return {
        state: "PRESENTATION_READY",
        label: "Presentación lista para revisar",
      };
    }

    if (
      presentationState === "READY" ||
      acceptanceState === "ACCEPTED"
    ) {
      return {
        state: "QUOTE_ACCEPTED",
        label: "Cotización confirmada",
      };
    }

    if (acceptanceState === "READY") {
      return {
        state: "PENDING_CONFIRMATION",
        label: "Pendiente de confirmación",
      };
    }

    if (acceptanceState === "CONFIRMING") {
      return {
        state: "CONFIRMING",
        label: "Confirmando cotización…",
      };
    }

    return {
      state: "EMPTY",
      label: "Carga una cotización para comenzar",
    };
  }

  function compactRuntimeMessages() {
    const acceptanceStatus = document.querySelector(
      '[data-forge-confirm-quote-status-r16j0a="true"]',
    );
    const presentationStatus = document.querySelector(
      '[data-forge-sales-presentation-entrypoint-status-r16j0="true"]',
    );

    const acceptanceState = document.querySelector(
      'button[data-forge-confirm-quote-r16j0a="true"]',
    )?.dataset?.forgeQuoteAcceptanceStateR16j0a;

    const presentationState = document.querySelector(
      'button[data-forge-sales-presentation-entrypoint-r16j0="true"]',
    )?.dataset?.forgeSalesPresentationStateR16j0;

    const acceptanceCopy = {
      BRIDGE_WAIT: "Preparando confirmación…",
      WAITING: "Pendiente de cotización",
      READY: "Revisa y confirma",
      CONFIRMING: "Confirmando…",
      ACCEPTED: "Cotización confirmada",
    };

    const presentationCopy = {
      BRIDGE_WAIT: "Preparando presentación…",
      NO_QUOTE: "Confirma primero la cotización",
      READY: "Lista para generar",
      GENERATING: "Creando revisión…",
      SESSION_READY: "Presentación lista",
    };

    if (
      acceptanceStatus &&
      acceptanceState !== "ERROR"
    ) {
      const copy =
        acceptanceCopy[acceptanceState] ||
        "Pendiente de cotización";

      if (acceptanceStatus.textContent !== copy) {
        acceptanceStatus.textContent = copy;
      }
    }

    if (
      presentationStatus &&
      presentationState !== "ERROR"
    ) {
      const copy =
        presentationCopy[presentationState] ||
        "Confirma primero la cotización";

      if (presentationStatus.textContent !== copy) {
        presentationStatus.textContent = copy;
      }
    }
  }

  function apply() {
    const intake = document.querySelector(
      "[data-forge-intake-results]",
    );

    if (!intake) return false;

    document.body.dataset.forgeNuevaCotizacionCleanR16j1 =
      "true";
    document.body.dataset.forgeDebugR16j1 =
      String(DEBUG_MODE);

    const debugSections = markDebugSections();
    const debugDetails = markDebugDetails();

    ensureWatermark();

    const strip = ensureCompactStatus();
    const userState = deriveUserState();

    if (strip) {
      strip.dataset.state = userState.state;
      strip.textContent = userState.label;
    }

    compactRuntimeMessages();

    globalThis.dispatchEvent(
      new CustomEvent("forge:r16j1-ui-cleanup-applied", {
        detail: Object.freeze({
          version: VERSION,
          debugMode: DEBUG_MODE,
          debugSections,
          debugDetails,
          bottomSafeArea: true,
        }),
      }),
    );

    return true;
  }

  function schedule() {
    if (scheduled) return;

    scheduled = true;

    requestAnimationFrame(() => {
      scheduled = false;
      apply();
    });
  }

  function boot() {
    apply();
    [
      "forge:quote-runtime-ready",
      "forge:quote-preview-calculated",
      "forge:accepted-quote-review-snapshot-created",
      "forge:quote-acceptance-state-changed",
      "forge:sales-presentation-state-changed",
      "forge:saas-module-opened",
    ].forEach((eventName) => {
      globalThis.addEventListener(eventName, schedule);
    });
  }

  globalThis.ForgeNuevaCotizacionUiCleanupR16J1 =
    Object.freeze({
      version: VERSION,
      debugMode: DEBUG_MODE,
      apply,
      getState() {
        return Object.freeze({
          debugMode: DEBUG_MODE,
          debugOnlyCount: document.querySelectorAll(
            '[data-forge-debug-only-r16j1="true"]',
          ).length,
          watermark: document.querySelector(
            '[data-forge-watermark-r16j1="true"]',
          )?.textContent || "",
          bottomSafeArea: true,
        });
      },
    });

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
