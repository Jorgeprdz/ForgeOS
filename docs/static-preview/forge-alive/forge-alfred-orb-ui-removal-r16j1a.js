(() => {
  "use strict";

  const VERSION = "R16J1A";
  const MARKER =
    "data-forge-alfred-orb-suppressed-r16j1a";
  const MODE = "REAL_DOM_GEOMETRY_SUPPRESSION";

  const DIRECT_SELECTORS = Object.freeze([
    '[data-forge-alfred-orb="true"]',
    '[data-alfred-orb="true"]',
    '[data-forge-assistant-orb="true"]',
    '[data-forge-floating-assistant="true"]',
    "#alfred-orb",
    ".alfred-orb",
    ".forge-alfred-orb",
    ".alfred-assistant-orb",
    ".forge-assistant-orb",
    ".forge-voice-assistant-orb",
  ]);

  let scheduled = false;
  let observer = null;
  let scanCount = 0;
  let suppressedCount = 0;
  let lastSuppressedAt = null;

  const normalize = (value) =>
    String(value ?? "")
      .normalize("NFD")
      .replace(/\p{Diacritic}/gu, "")
      .toLowerCase()
      .replace(/\s+/g, " ")
      .trim();

  function descriptor(element) {
    const parts = [
      element.id,
      element.className,
      element.getAttribute?.("aria-label"),
      element.getAttribute?.("title"),
      element.getAttribute?.("name"),
      element.getAttribute?.("role"),
      element.textContent?.slice?.(0, 80),
    ];

    for (const attribute of element.attributes || []) {
      if (
        attribute.name.startsWith("data-") ||
        attribute.name === "style"
      ) {
        parts.push(attribute.name, attribute.value);
      }
    }

    return normalize(parts.filter(Boolean).join(" "));
  }

  function roots() {
    const found = [document];
    const queue = [document];
    const visited = new Set();

    while (queue.length) {
      const root = queue.shift();
      if (!root || visited.has(root)) continue;
      visited.add(root);

      for (const element of root.querySelectorAll?.("*") || []) {
        if (element.shadowRoot) {
          found.push(element.shadowRoot);
          queue.push(element.shadowRoot);
        }

        if (element.tagName === "IFRAME") {
          try {
            const frameDocument = element.contentDocument;
            if (frameDocument) {
              found.push(frameDocument);
              queue.push(frameDocument);
            }
          } catch {
            // Cross-origin frames are outside this local preview scope.
          }
        }
      }
    }

    return found;
  }

  function allElements() {
    return roots().flatMap((root) => [
      ...(root.querySelectorAll?.("*") || []),
    ]);
  }

  function visible(element) {
    if (!(element instanceof Element) || element.hidden) return false;

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

  function navigationRelated(element) {
    if (!element?.closest) return false;

    return Boolean(
      element.closest(
        [
          "nav",
          '[role="navigation"]',
          "footer",
          '[data-forge-mobile-nav]',
          '[data-forge-bottom-nav]',
          '[data-forge-saas-mobile-nav-r16c5l]',
          '[data-forge-quote-action-dock-r16j1b="true"]',
        ].join(","),
      ),
    );
  }

  function fixedLineage(element) {
    let current = element;

    for (let depth = 0; current && depth < 6; depth += 1) {
      const style = getComputedStyle(current);

      if (["fixed", "sticky"].includes(style.position)) {
        return current;
      }

      current = current.parentElement;
    }

    return null;
  }

  function profile(element) {
    const style = getComputedStyle(element);
    const before = getComputedStyle(element, "::before");
    const after = getComputedStyle(element, "::after");
    const rect = element.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const radius = parseFloat(style.borderRadius) || 0;
    const viewportWidth = Math.max(innerWidth, 1);
    const viewportHeight = Math.max(innerHeight, 1);
    const centerX = rect.left + width / 2;
    const centerY = rect.top + height / 2;
    const bottomGap = viewportHeight - rect.bottom;
    const fixedRoot = fixedLineage(element);
    const pseudoVisual = [before, after].some((pseudo) =>
      pseudo &&
      pseudo.content !== "none" &&
      pseudo.content !== "normal" &&
      (
        pseudo.backgroundImage !== "none" ||
        pseudo.boxShadow !== "none" ||
        pseudo.filter !== "none"
      ),
    );
    const visualSignal =
      style.backgroundImage !== "none" ||
      style.boxShadow !== "none" ||
      style.filter !== "none" ||
      pseudoVisual ||
      Boolean(element.querySelector?.("canvas, svg, img"));

    return {
      rect,
      width,
      height,
      centerX,
      centerY,
      bottomGap,
      radius,
      fixedRoot,
      nearSquare:
        width > 0 &&
        height > 0 &&
        Math.abs(width - height) <= Math.max(width, height) * 0.38,
      roundish:
        radius >= Math.min(width, height) * 0.3 ||
        style.borderRadius.includes("%"),
      lowerRight:
        centerX >= viewportWidth * 0.58 &&
        centerY >= viewportHeight * 0.5 &&
        bottomGap >= 18 &&
        bottomGap <= 300,
      compact:
        width >= 34 &&
        height >= 34 &&
        width <= 190 &&
        height <= 190,
      visualSignal,
      position: style.position,
      zIndex: Number.parseInt(style.zIndex, 10) || 0,
    };
  }

  function semanticCandidate(element, details = profile(element)) {
    const text = descriptor(element);
    const hasAlfred = /\balfred\b/.test(text);
    const hasOrb = /\borb\b|orb[-_]|[-_]orb/.test(text);
    const hasAssistant =
      /\bassistant\b|\basistente\b|\bvoice\b|\bmicrophone\b|\bmic\b/.test(text);
    const hasFloating =
      /\bfloating\b|\bfab\b|\boverlay\b|\bhalo\b/.test(text);

    return (
      (hasAlfred && (hasOrb || hasAssistant || details.roundish)) ||
      (hasOrb && (hasAssistant || hasFloating)) ||
      (hasAssistant && hasFloating && details.roundish)
    );
  }

  function geometryCandidate(element, details = profile(element)) {
    return Boolean(
      details.fixedRoot &&
      details.compact &&
      details.nearSquare &&
      details.roundish &&
      details.lowerRight &&
      details.visualSignal &&
      !navigationRelated(element),
    );
  }

  function shouldSuppress(element) {
    if (!(element instanceof HTMLElement)) return false;
    if (
      element === document.documentElement ||
      element === document.body ||
      element.hasAttribute(MARKER)
    ) {
      return false;
    }

    const details = profile(element);
    const semantic = semanticCandidate(element, details);
    const inNavigation = navigationRelated(element);
    const text = descriptor(element);
    const strongSemantic =
      /\borb\b|orb[-_]|[-_]orb|floating.*assistant|assistant.*floating|alfred.*assistant/.test(
        text,
      );

    if (semantic && (!inNavigation || strongSemantic)) {
      return true;
    }

    if (inNavigation) return false;
    return geometryCandidate(element, details);
  }

  function suppressionRoot(element) {
    let chosen = element;
    let current = element.parentElement;

    for (let depth = 0; current && depth < 5; depth += 1) {
      if (navigationRelated(current)) break;

      const details = profile(current);
      const containsCandidate = current.contains(element);
      const suitableWrapper =
        containsCandidate &&
        details.lowerRight &&
        details.width <= 280 &&
        details.height <= 280 &&
        (["fixed", "sticky", "absolute"].includes(details.position) ||
          details.fixedRoot);

      if (!suitableWrapper) break;
      chosen = current;
      current = current.parentElement;
    }

    return chosen;
  }

  function directCandidates() {
    const candidates = new Set();

    for (const root of roots()) {
      for (const selector of DIRECT_SELECTORS) {
        for (const element of root.querySelectorAll?.(selector) || []) {
          candidates.add(element);
        }
      }
    }

    return [...candidates];
  }

  function suppress(element) {
    const root = suppressionRoot(element);

    if (!root || root.hasAttribute(MARKER)) return false;

    root.setAttribute(MARKER, "true");
    root.setAttribute("aria-hidden", "true");
    root.setAttribute("tabindex", "-1");
    root.hidden = true;
    root.inert = true;

    if ("disabled" in root) {
      try {
        root.disabled = true;
      } catch {
        // Custom elements may expose readonly properties.
      }
    }

    for (const [name, value] of [
      ["display", "none"],
      ["visibility", "hidden"],
      ["opacity", "0"],
      ["pointer-events", "none"],
      ["animation", "none"],
      ["filter", "none"],
      ["box-shadow", "none"],
      ["transform", "none"],
    ]) {
      root.style.setProperty(name, value, "important");
    }

    suppressedCount += 1;
    lastSuppressedAt = new Date().toISOString();
    return true;
  }

  function visibleFloatingCandidates() {
    return allElements().filter((element) =>
      !element.hasAttribute?.(MARKER) &&
      visible(element) &&
      shouldSuppress(element),
    );
  }

  function suppressedElements() {
    return allElements().filter((element) =>
      element.hasAttribute?.(MARKER),
    );
  }

  function scan() {
    scanCount += 1;
    let suppressedThisScan = 0;
    const candidates = new Set(directCandidates());

    for (const element of allElements()) {
      if (shouldSuppress(element)) candidates.add(element);
    }

    for (const element of candidates) {
      if (suppress(element)) suppressedThisScan += 1;
    }

    document.body?.setAttribute(
      "data-forge-alfred-orb-removed-r16j1a",
      "true",
    );

    globalThis.dispatchEvent(
      new CustomEvent("forge:alfred-orb-ui-removal-r16j1a", {
        detail: Object.freeze({
          version: VERSION,
          mode: MODE,
          suppressedThisScan,
          suppressedCount,
          scanCount,
          visibleFloatingCandidateCount:
            visibleFloatingCandidates().length,
          enginePreserved: true,
        }),
      }),
    );

    return suppressedThisScan;
  }

  function schedule() {
    if (scheduled) return;

    scheduled = true;
    requestAnimationFrame(() => {
      scheduled = false;
      scan();
    });
  }

  function state() {
    const suppressed = suppressedElements();
    const visibleCandidates = visibleFloatingCandidates();
    const focusable = suppressed.filter((element) =>
      !element.hidden &&
      element.tabIndex >= 0 &&
      visible(element),
    );
    const pointerEnabled = suppressed.filter(
      (element) =>
        getComputedStyle(element).pointerEvents !== "none",
    );

    return Object.freeze({
      version: VERSION,
      active: true,
      enginePreserved: true,
      removalMode: MODE,
      scanCount,
      suppressedCount,
      suppressedElementCount: suppressed.length,
      visibleCandidateCount: visibleCandidates.length,
      focusableSuppressedCount: focusable.length,
      pointerEnabledSuppressedCount: pointerEnabled.length,
      observerActive: Boolean(observer),
      lastSuppressedAt,
    });
  }

  function boot() {
    scan();

    observer = new MutationObserver(schedule);
    observer.observe(document.documentElement, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: [
        "class",
        "id",
        "style",
        "hidden",
        "aria-label",
        "title",
        "role",
      ],
    });

    addEventListener("resize", schedule, { passive: true });
    addEventListener("load", schedule, { passive: true });
    schedule();
  }

  globalThis.ForgeAlfredOrbUiRemovalR16J1A = Object.freeze({
    version: VERSION,
    scan,
    schedule,
    getState: state,
    isCandidate: shouldSuppress,
    getVisibleFloatingCandidates: visibleFloatingCandidates,
    directSelectors: DIRECT_SELECTORS,
  });

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot, {
      once: true,
    });
  } else {
    boot();
  }
})();
