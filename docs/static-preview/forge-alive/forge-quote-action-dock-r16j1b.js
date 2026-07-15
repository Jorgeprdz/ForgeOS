(() => {
  "use strict";

  const VERSION = "R16J1B";
  const INLINE_MARKER =
    "data-forge-quote-action-dock-r16j1b";
  const PROXY_MARKER =
    "data-forge-quote-action-proxy-r16j1b";
  const PROXY_STATE =
    "data-forge-quote-action-state-r16j1b";
  const LEGACY_MARKER =
    "data-forge-legacy-actions-hidden-r16j1b";
  const UPLOAD_SURFACE_MARKER =
    "data-forge-quote-upload-surface-r16j1b";

  const CONFIRM_SELECTOR =
    'button[data-forge-confirm-quote-r16j0a="true"]';
  const PRESENTATION_SELECTOR =
    'button[data-forge-sales-presentation-entrypoint-r16j0="true"]';
  const CONFIRM_STATUS_SELECTOR =
    '[data-forge-confirm-quote-status-r16j0a="true"]';
  const PRESENTATION_STATUS_SELECTOR =
    '[data-forge-sales-presentation-entrypoint-status-r16j0="true"]';
  const INPUT_SELECTOR =
    '[data-forge-local-packet-input="true"]';

  let observer = null;
  let scheduled = false;
  let applying = false;

  const normalize = (value) =>
    String(value ?? "")
      .normalize("NFD")
      .replace(/\p{Diacritic}/gu, "")
      .toLowerCase()
      .replace(/\s+/g, " ")
      .trim();

  function heading(label) {
    return [...document.querySelectorAll("h2, h3")].find(
      (element) =>
        normalize(element.textContent) === normalize(label),
    ) || null;
  }

  function uploadSurface() {
    const found = heading("Carga tu cotización");
    const surface =
      found?.closest("section, article") ||
      found?.parentElement ||
      null;

    if (surface) {
      surface.setAttribute(UPLOAD_SURFACE_MARKER, "true");
    }

    return surface;
  }

  function isVisible(element) {
    if (!element || element.hidden) return false;

    const style = getComputedStyle(element);
    const rect = element.getBoundingClientRect();

    return (
      style.display !== "none" &&
      style.visibility !== "hidden" &&
      Number(style.opacity || 1) > 0.01 &&
      rect.width > 0 &&
      rect.height > 0
    );
  }

  function controls(selector) {
    return [...document.querySelectorAll(selector)];
  }

  function setAttributeIfDifferent(element, name, value) {
    if (!element) return;

    const next = String(value);

    if (element.getAttribute(name) !== next) {
      element.setAttribute(name, next);
    }
  }

  function setTextIfDifferent(element, value) {
    if (!element) return;

    const next = String(value ?? "");

    if (element.textContent !== next) {
      element.textContent = next;
    }
  }

  function isConfirmBound(element) {
    return (
      element?.dataset?.forgeQuoteAcceptanceBoundR16j0a ===
      "true"
    );
  }

  function isPresentationBound(element) {
    return (
      element?.dataset?.forgeSalesPresentationBoundR16j0 ===
        "true" ||
      element?.dataset
        ?.forgeSalesPresentationEntrypointBoundR16j0 === "true"
    );
  }

  function scoreConfirm(element) {
    const state =
      element?.dataset?.forgeQuoteAcceptanceStateR16j0a || "";

    return (
      (isConfirmBound(element) ? 1000 : 0) +
      (state === "ACCEPTED" ? 200 : 0) +
      (state === "READY" ? 160 : 0) +
      (!element.disabled ? 40 : 0) +
      (isVisible(element) ? 5 : 0)
    );
  }

  function scorePresentation(element) {
    const state =
      element?.dataset?.forgeSalesPresentationStateR16j0 || "";

    return (
      (isPresentationBound(element) ? 1000 : 0) +
      (state === "SESSION_READY" ? 220 : 0) +
      (state === "READY" ? 200 : 0) +
      (state === "ERROR" ? 180 : 0) +
      (!element.disabled ? 40 : 0) +
      (isVisible(element) ? 5 : 0)
    );
  }

  function best(selector, scorer) {
    return controls(selector)
      .map((element, index) => ({
        element,
        index,
        score: scorer(element),
      }))
      .sort(
        (left, right) =>
          right.score - left.score || left.index - right.index,
      )[0]?.element || null;
  }

  function targetFor(kind) {
    return kind === "confirm"
      ? best(CONFIRM_SELECTOR, scoreConfirm)
      : best(PRESENTATION_SELECTOR, scorePresentation);
  }

  function statusFor(kind, target) {
    const selector =
      kind === "confirm"
        ? CONFIRM_STATUS_SELECTOR
        : PRESENTATION_STATUS_SELECTOR;
    const describedId = target?.getAttribute("aria-describedby");

    if (describedId) {
      const exact = [...document.querySelectorAll(selector)].find(
        (element) => element.id === describedId,
      );

      if (exact) return exact;
    }

    return document.querySelector(selector);
  }

  function topLevelChild(surface, element) {
    if (!surface || !element || !surface.contains(element)) {
      return null;
    }

    let current = element;

    while (current.parentElement && current.parentElement !== surface) {
      current = current.parentElement;
    }

    return current.parentElement === surface ? current : null;
  }

  function styleReference(surface, target) {
    if (target?.className && String(target.className).trim()) {
      return target;
    }

    const candidates = [
      ...surface.querySelectorAll("button, [role='button']"),
    ];

    return (
      candidates.find((element) =>
        normalize(element.textContent).includes("revisar resultado"),
      ) ||
      candidates.find(isVisible) ||
      candidates[0] ||
      null
    );
  }

  function ensureInline(surface) {
    let inline = document.querySelector(
      `[${INLINE_MARKER}="true"]`,
    );

    if (!inline) {
      inline = document.createElement("div");
      inline.setAttribute(INLINE_MARKER, "true");
      inline.setAttribute(
        "aria-label",
        "Acción actual de la cotización",
      );
      inline.innerHTML = `
        <button type="button" ${PROXY_MARKER}="confirm">
          Confirmar cotización
        </button>
        <p data-forge-quote-action-proxy-status-r16j1b="confirm"
           aria-live="polite"></p>
        <button type="button" ${PROXY_MARKER}="presentation">
          Generar presentación de venta
        </button>
        <p data-forge-quote-action-proxy-status-r16j1b="presentation"
           aria-live="polite"></p>
      `;
    }

    if (!surface.contains(inline)) {
      const input = surface.querySelector(INPUT_SELECTOR);
      const anchor =
        topLevelChild(surface, input) ||
        topLevelChild(
          surface,
          [...surface.querySelectorAll("button")].find(
            (element) =>
              normalize(element.textContent).includes(
                "revisar resultado",
              ),
          ),
        );

      if (anchor) {
        anchor.insertAdjacentElement("afterend", inline);
      } else {
        surface.appendChild(inline);
      }
    }

    return inline;
  }

  function hideLegacyActionSections(inline) {
    for (const candidate of document.querySelectorAll(
      "section, article",
    )) {
      if (candidate.contains(inline)) continue;

      const title = candidate.querySelector(":scope > h2, :scope > h3");

      if (
        normalize(title?.textContent) !==
        normalize("Acciones seguras")
      ) {
        continue;
      }

      candidate.setAttribute(LEGACY_MARKER, "true");
      candidate.hidden = true;
      candidate.setAttribute("aria-hidden", "true");
      candidate.style.setProperty("display", "none", "important");
    }
  }

  function proxy(kind) {
    return document.querySelector(
      `button[${PROXY_MARKER}="${kind}"]`,
    );
  }

  function proxyStatus(kind) {
    return document.querySelector(
      `[data-forge-quote-action-proxy-status-r16j1b="${kind}"]`,
    );
  }

  function authorityFor(kind) {
    return kind === "confirm"
      ? globalThis.ForgeQuoteAcceptanceEntrypointR16J0A || null
      : globalThis.ForgeSalesPresentationEntrypointR16J0 || null;
  }

  function authorityMethod(kind, authority = authorityFor(kind)) {
    if (kind === "confirm") {
      return typeof authority?.confirm === "function"
        ? authority.confirm
        : null;
    }

    return typeof authority?.activate === "function"
      ? authority.activate
      : null;
  }

  function targetState(kind, target) {
    const runtimeState = authorityFor(kind)?.getState?.() || "";

    if (runtimeState) return runtimeState;

    return kind === "confirm"
      ? target?.dataset?.forgeQuoteAcceptanceStateR16j0a || "NO_QUOTE"
      : target?.dataset?.forgeSalesPresentationStateR16j0 || "NO_QUOTE";
  }

  function interactive(kind, state) {
    const method = authorityMethod(kind);

    if (!method) return false;

    return kind === "confirm"
      ? state === "READY"
      : ["READY", "SESSION_READY", "ERROR"].includes(state);
  }

  function labelFor(kind, state) {
    if (kind === "confirm") return "Confirmar cotización";
    if (state === "SESSION_READY") return "Abrir presentación de venta";
    if (state === "ERROR") return "Reintentar presentación de venta";
    return "Generar presentación de venta";
  }

  function applyExistingVisualClass(kind, button, target, surface) {
    const reference = styleReference(surface, target);
    const sourceClass = String(reference?.className || "").trim();

    if (sourceClass && button.className !== sourceClass) {
      button.className = sourceClass;
    }

    setAttributeIfDifferent(
      button,
      "data-forge-visual-source-r16j1b",
      sourceClass ? "existing_component_class" : "native_button",
    );
  }

  function syncProxy(kind, surface) {
    const button = proxy(kind);
    const status = proxyStatus(kind);
    const target = targetFor(kind);
    const state = targetState(kind, target);
    const allowed = interactive(kind, state);
    const sourceStatus = statusFor(kind, target);

    if (!button || !status) return false;

    applyExistingVisualClass(kind, button, target, surface);
    setAttributeIfDifferent(button, PROXY_STATE, state);
    setAttributeIfDifferent(button, "aria-disabled", String(!allowed));
    setTextIfDifferent(button, labelFor(kind, state));
    button.disabled = !allowed;

    const showConfirm = kind === "confirm" && state === "READY";
    const showPresentation =
      kind === "presentation" &&
      ["READY", "SESSION_READY", "ERROR"].includes(state);
    const show = showConfirm || showPresentation;

    button.hidden = !show;
    button.setAttribute("aria-hidden", String(!show));

    const statusText =
      kind === "confirm" && showConfirm
        ? sourceStatus?.textContent?.trim() || "Revisa y confirma."
        : kind === "presentation" && state === "ERROR"
          ? sourceStatus?.textContent?.trim() ||
            "No se pudo abrir la presentación."
          : "";

    setTextIfDifferent(status, statusText);
    status.hidden = !statusText;
    status.setAttribute("aria-hidden", String(!statusText));
    setAttributeIfDifferent(status, "data-forge-state", state);

    return show;
  }

  function sync() {
    const surface = uploadSurface();
    const inline = document.querySelector(
      `[${INLINE_MARKER}="true"]`,
    );

    if (!surface || !inline) return false;

    const confirmShown = syncProxy("confirm", surface);
    const presentationShown = syncProxy("presentation", surface);
    const visible = confirmShown || presentationShown;

    inline.hidden = !visible;
    inline.setAttribute("aria-hidden", String(!visible));

    globalThis.dispatchEvent(
      new CustomEvent("forge:quote-action-dock-r16j1b", {
        detail: state(),
      }),
    );

    return true;
  }

  async function invoke(kind) {
    const target = targetFor(kind);
    const authority = authorityFor(kind);
    const method = authorityMethod(kind, authority);
    const current = targetState(kind, target);

    if (!interactive(kind, current) || !method) {
      sync();
      return false;
    }

    try {
      await method.call(authority);
    } finally {
      globalThis.ForgeQuoteAcceptanceEntrypointR16J0A?.refresh?.();
      globalThis.ForgeSalesPresentationEntrypointR16J0?.refresh?.();
      queueMicrotask(sync);
      requestAnimationFrame(sync);
      setTimeout(sync, 50);
      setTimeout(sync, 250);
    }

    return true;
  }

  function bindProxy(kind) {
    const button = proxy(kind);

    if (!button || button.dataset.forgeProxyBoundR16j1b === "true") {
      return;
    }

    button.dataset.forgeProxyBoundR16j1b = "true";
    button.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      void invoke(kind);
    });
  }

  function state() {
    const surface = uploadSurface();
    const inline = document.querySelector(
      `[${INLINE_MARKER}="true"]`,
    );
    const confirmProxy = proxy("confirm");
    const presentationProxy = proxy("presentation");

    return Object.freeze({
      version: VERSION,
      mode: "INLINE_CANONICAL_UPLOAD_SURFACE",
      docked: Boolean(inline),
      inlineWithinUpload: Boolean(
        surface && inline && surface.contains(inline),
      ),
      canonicalUploadSurfaceMarked: Boolean(
        surface?.getAttribute(UPLOAD_SURFACE_MARKER) === "true",
      ),
      dockVisible: isVisible(inline),
      separateActionCardCount: [
        ...document.querySelectorAll("section, article"),
      ].filter((candidate) => {
        const title = candidate.querySelector(
          ":scope > h2, :scope > h3",
        );
        return (
          normalize(title?.textContent) ===
          normalize("Acciones seguras")
        );
      }).filter(isVisible).length,
      confirmProxyVisible: isVisible(confirmProxy),
      presentationProxyVisible: isVisible(presentationProxy),
      confirmProxyState:
        confirmProxy?.getAttribute(PROXY_STATE) || "",
      presentationProxyState:
        presentationProxy?.getAttribute(PROXY_STATE) || "",
      confirmAuthorityReady: Boolean(authorityMethod("confirm")),
      presentationAuthorityReady: Boolean(
        authorityMethod("presentation"),
      ),
      existingComponentClassesReused:
        [confirmProxy, presentationProxy]
          .filter(Boolean)
          .every(
            (button) =>
              button.getAttribute(
                "data-forge-visual-source-r16j1b",
              ) === "existing_component_class",
          ),
      automaticInvocation: false,
    });
  }

  function apply() {
    if (applying) return false;

    applying = true;

    try {
      const surface = uploadSurface();

      if (!surface) return false;

      const inline = ensureInline(surface);
      hideLegacyActionSections(inline);
      bindProxy("confirm");
      bindProxy("presentation");
      sync();
      return true;
    } finally {
      applying = false;
    }
  }

  function schedule() {
    if (scheduled || applying) return;

    scheduled = true;
    requestAnimationFrame(() => {
      scheduled = false;
      apply();
    });
  }

  function boot() {
    apply();

    observer = new MutationObserver(schedule);
    observer.observe(document.documentElement, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: [
        "hidden",
        "class",
        "disabled",
        "aria-disabled",
        "data-forge-quote-acceptance-state-r16j0a",
        "data-forge-sales-presentation-state-r16j0",
        "data-forge-quote-acceptance-bound-r16j0a",
        "data-forge-sales-presentation-bound-r16j0",
        "data-forge-sales-presentation-entrypoint-bound-r16j0",
      ],
    });
  }

  globalThis.ForgeQuoteActionDockR16J1B = Object.freeze({
    version: VERSION,
    apply,
    schedule,
    sync,
    invoke,
    getState: state,
  });

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot, {
      once: true,
    });
  } else {
    boot();
  }
})();
