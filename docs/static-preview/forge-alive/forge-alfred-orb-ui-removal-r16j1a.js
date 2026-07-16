(() => {
  "use strict";

  const VERSION = "R16J1C";
  const SUPPRESSED = "data-forge-alfred-orb-suppressed-r16j1a";
  const CLUSTER = "data-forge-alfred-orb-cluster-suppressed-r16j1c";
  const HALO = "data-forge-alfred-halo-suppressed-r16j1c";
  const HALO_HOST = "data-forge-alfred-halo-host-r16j1c";
  const MODE = "REAL_ORB_AND_HALO_CLUSTER_SUPPRESSION";

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
  let scanCount = 0;
  let suppressedCoreCount = 0;
  let suppressedHaloCount = 0;
  let lastSuppressedAt = null;

  const normalize = (value) =>
    String(value ?? "")
      .normalize("NFD")
      .replace(/\p{Diacritic}/gu, "")
      .toLowerCase()
      .replace(/\s+/g, " ")
      .trim();

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
            if (element.contentDocument) {
              found.push(element.contentDocument);
              queue.push(element.contentDocument);
            }
          } catch {
            // Cross-origin frames are outside the local preview authority.
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

  function descriptor(element) {
    const parts = [
      element.id,
      element.className,
      element.getAttribute?.("aria-label"),
      element.getAttribute?.("title"),
      element.getAttribute?.("name"),
      element.getAttribute?.("role"),
      element.textContent?.slice?.(0, 90),
    ];
    for (const attribute of element.attributes || []) {
      if (attribute.name.startsWith("data-") || attribute.name === "style") {
        parts.push(attribute.name, attribute.value);
      }
    }
    return normalize(parts.filter(Boolean).join(" "));
  }

  function bottomNavigation() {
    const direct = [
      "[data-forge-mobile-nav]",
      "[data-forge-bottom-nav]",
      "[data-forge-saas-mobile-nav-r16c5l]",
      "nav[aria-label]",
      "[role='navigation']",
    ];
    const candidates = new Set();
    for (const selector of direct) {
      for (const element of document.querySelectorAll(selector)) {
        candidates.add(element);
      }
    }
    for (const element of document.querySelectorAll("nav, footer, div")) {
      const style = getComputedStyle(element);
      const rect = element.getBoundingClientRect();
      const controls = element.querySelectorAll(
        "a, button, [role='button']",
      ).length;
      if (
        ["fixed", "sticky"].includes(style.position) &&
        rect.bottom >= innerHeight - 8 &&
        rect.width >= innerWidth * 0.65 &&
        rect.height >= 48 &&
        rect.height <= 180 &&
        controls >= 3
      ) {
        candidates.add(element);
      }
    }
    return [...candidates]
      .filter(visible)
      .sort((left, right) => {
        const l = left.getBoundingClientRect();
        const r = right.getBoundingClientRect();
        return r.top - l.top || r.width - l.width;
      })[0] || null;
  }

  function fixedLineage(element) {
    let current = element;
    for (let depth = 0; current && depth < 7; depth += 1) {
      const style = getComputedStyle(current);
      if (["fixed", "sticky", "absolute"].includes(style.position)) {
        return current;
      }
      current = current.parentElement;
    }
    return null;
  }

  function visualSignal(element, style) {
    const before = getComputedStyle(element, "::before");
    const after = getComputedStyle(element, "::after");
    const pseudo = [before, after].some(
      (item) =>
        item &&
        item.content !== "none" &&
        item.content !== "normal" &&
        (item.backgroundImage !== "none" ||
          item.boxShadow !== "none" ||
          item.filter !== "none"),
    );
    return (
      style.backgroundImage !== "none" ||
      style.boxShadow !== "none" ||
      style.filter !== "none" ||
      style.backdropFilter !== "none" ||
      pseudo ||
      Boolean(element.querySelector?.("canvas, svg, img"))
    );
  }

  function profile(element) {
    const style = getComputedStyle(element);
    const rect = element.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const radius = Number.parseFloat(style.borderRadius) || 0;
    const nav = bottomNavigation();
    const navRect = nav?.getBoundingClientRect?.() || null;
    const centerX = rect.left + width / 2;
    const centerY = rect.top + height / 2;
    return {
      style,
      rect,
      width,
      height,
      radius,
      nav,
      navRect,
      centerX,
      centerY,
      lowerRight:
        centerX >= innerWidth * 0.56 &&
        centerY >= innerHeight * 0.48,
      nearSquare:
        width > 0 &&
        height > 0 &&
        Math.abs(width - height) <= Math.max(width, height) * 0.34,
      roundish:
        radius >= Math.min(width, height) * 0.34 ||
        style.borderRadius.includes("%"),
      coreSize:
        width >= 44 && height >= 44 && width <= 170 && height <= 170,
      haloSize:
        width >= 105 && height >= 34 && width <= 460 && height <= 220,
      pillish:
        width / Math.max(height, 1) >= 1.35 &&
        (radius >= height * 0.32 || style.borderRadius.includes("%")),
      overlapsNavigation: Boolean(
        navRect && rect.bottom > navRect.top - 70 && rect.top < navRect.bottom,
      ),
      extendsAboveNavigation: Boolean(
        navRect && rect.top < navRect.top + 10,
      ),
      positioned: Boolean(fixedLineage(element)),
      visualSignal: visualSignal(element, style),
    };
  }

  function semantic(element) {
    const text = descriptor(element);
    return {
      text,
      alfred: /\balfred\b/.test(text),
      orb: /\borb\b|orb[-_]|[-_]orb/.test(text),
      assistant:
        /\bassistant\b|\basistente\b|\bvoice\b|\bmicrophone\b|\bmic\b/.test(text),
      halo: /\bhalo\b|\bglow\b|\baura\b/.test(text),
      floating: /\bfloating\b|\bfab\b|\boverlay\b/.test(text),
    };
  }

  function protectedInteractive(element) {
    if (!element?.closest) return false;
    if (
      element.closest(
        '[data-forge-quote-action-inline-r16j1c="true"], input, select, textarea',
      )
    ) {
      return true;
    }
    const control = element.closest("a, button, [role='button']");
    if (!control) return false;
    const text = normalize(
      `${control.textContent || ""} ${control.getAttribute?.("aria-label") || ""}`,
    );
    const assistantText = /alfred|orb|assistant|asistente|microphone|\bmic\b/.test(text);
    if (assistantText) return false;
    return /inicio|pipeline|clientes|cotizaciones|\bmas\b|\bmás\b/.test(text) ||
      Boolean(control.closest("nav, [role='navigation']"));
  }

  function coreCandidate(element) {
    if (!(element instanceof HTMLElement)) return false;
    if (
      element === document.body ||
      element === document.documentElement ||
      element.hasAttribute(SUPPRESSED) ||
      element.hasAttribute(CLUSTER)
    ) {
      return false;
    }
    const details = profile(element);
    const words = semantic(element);
    const strongSemantic =
      (words.alfred && (words.orb || words.assistant)) ||
      (words.orb && (words.assistant || words.floating));
    if (strongSemantic) return true;
    if (protectedInteractive(element)) return false;
    return Boolean(
      details.positioned &&
      details.lowerRight &&
      details.coreSize &&
      details.nearSquare &&
      details.roundish &&
      details.visualSignal &&
      (
        !details.nav ||
        !details.nav.contains(element) ||
        details.extendsAboveNavigation ||
        details.style.position === "absolute" ||
        details.style.position === "fixed"
      ),
    );
  }

  function haloCandidate(element) {
    if (!(element instanceof HTMLElement)) return false;
    if (
      element === document.body ||
      element === document.documentElement ||
      element.hasAttribute(HALO) ||
      element.hasAttribute(CLUSTER)
    ) {
      return false;
    }
    if (protectedInteractive(element)) return false;
    const details = profile(element);
    const words = semantic(element);
    const strongSemantic = words.halo && (words.alfred || words.orb || words.assistant);
    if (strongSemantic) return true;
    return Boolean(
      details.positioned &&
      details.lowerRight &&
      details.haloSize &&
      details.pillish &&
      details.visualSignal &&
      details.overlapsNavigation &&
      details.centerX >= innerWidth * 0.58,
    );
  }

  function overlapsExpanded(left, right, padding = 30) {
    return !(
      left.right + padding < right.left ||
      left.left - padding > right.right ||
      left.bottom + padding < right.top ||
      left.top - padding > right.bottom
    );
  }

  function clusterRoot(core) {
    const nav = bottomNavigation();
    let chosen = core;
    let current = core.parentElement;
    const coreRect = core.getBoundingClientRect();

    for (let depth = 0; current && depth < 6; depth += 1) {
      if (current === nav || current === document.body) break;
      const details = profile(current);
      if (
        details.width <= 460 &&
        details.height <= 280 &&
        overlapsExpanded(details.rect, coreRect, 20) &&
        (details.positioned || details.visualSignal)
      ) {
        chosen = current;
        current = current.parentElement;
        continue;
      }
      break;
    }
    return chosen;
  }

  function suppressElement(element, marker) {
    if (!element || element.hasAttribute(marker)) return false;
    element.setAttribute(marker, "true");
    element.setAttribute("aria-hidden", "true");
    element.setAttribute("tabindex", "-1");
    element.hidden = true;
    element.inert = true;
    if ("disabled" in element) {
      try { element.disabled = true; } catch { /* readonly custom element */ }
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
      element.style.setProperty(name, value, "important");
    }
    lastSuppressedAt = new Date().toISOString();
    return true;
  }

  function suppressCluster(core) {
    const root = clusterRoot(core);
    const rootRect = root.getBoundingClientRect();
    let cores = 0;
    let halos = 0;

    root.setAttribute(SUPPRESSED, "true");
    if (suppressElement(root, CLUSTER)) {
      cores += 1;
      suppressedCoreCount += 1;
    }

    const parent = root.parentElement;
    if (parent && parent !== document.body) {
      const nav = bottomNavigation();
      if (parent !== nav && profile(parent).width <= 460 && profile(parent).height <= 280) {
        parent.setAttribute(HALO_HOST, "true");
      }
      for (const sibling of parent.children) {
        if (sibling === root || !(sibling instanceof HTMLElement)) continue;
        if (
          visible(sibling) &&
          haloCandidate(sibling) &&
          overlapsExpanded(sibling.getBoundingClientRect(), rootRect, 44)
        ) {
          if (suppressElement(sibling, HALO)) {
            halos += 1;
            suppressedHaloCount += 1;
          }
        }
      }
    }

    for (const candidate of allElements()) {
      if (
        visible(candidate) &&
        haloCandidate(candidate) &&
        overlapsExpanded(candidate.getBoundingClientRect(), rootRect, 34)
      ) {
        if (suppressElement(candidate, HALO)) {
          halos += 1;
          suppressedHaloCount += 1;
        }
      }
    }

    return { cores, halos };
  }

  function visibleCoreCandidates() {
    return allElements().filter(
      (element) => visible(element) && coreCandidate(element),
    );
  }

  function visibleHaloCandidates() {
    return allElements().filter(
      (element) => visible(element) && haloCandidate(element),
    );
  }

  function scan() {
    scanCount += 1;
    let cores = 0;
    let halos = 0;
    const candidates = new Set();

    for (const root of roots()) {
      for (const selector of DIRECT_SELECTORS) {
        for (const element of root.querySelectorAll?.(selector) || []) {
          candidates.add(element);
        }
      }
    }
    for (const element of allElements()) {
      if (coreCandidate(element)) candidates.add(element);
    }

    for (const core of candidates) {
      if (!visible(core) && !DIRECT_SELECTORS.some((selector) => core.matches?.(selector))) {
        continue;
      }
      const result = suppressCluster(core);
      cores += result.cores;
      halos += result.halos;
    }

    for (const halo of visibleHaloCandidates()) {
      if (suppressElement(halo, HALO)) {
        halos += 1;
        suppressedHaloCount += 1;
      }
    }

    document.body?.setAttribute(
      "data-forge-alfred-orb-removed-r16j1a",
      "true",
    );
    document.body?.setAttribute(
      "data-forge-alfred-halo-removed-r16j1c",
      "true",
    );

    globalThis.dispatchEvent(
      new CustomEvent("forge:alfred-orb-ui-removal-r16j1a", {
        detail: Object.freeze({
          version: VERSION,
          mode: MODE,
          suppressedCoresThisScan: cores,
          suppressedHalosThisScan: halos,
          visibleCoreCandidateCount: visibleCoreCandidates().length,
          visibleHaloCandidateCount: visibleHaloCandidates().length,
          enginePreserved: true,
        }),
      }),
    );
    return cores + halos;
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
    const suppressed = allElements().filter(
      (element) =>
        element.hasAttribute?.(CLUSTER) ||
        element.hasAttribute?.(HALO),
    );
    return Object.freeze({
      version: VERSION,
      active: true,
      enginePreserved: true,
      removalMode: MODE,
      scanCount,
      suppressedCoreCount,
      suppressedHaloCount,
      suppressedElementCount: suppressed.length,
      visibleCandidateCount: visibleCoreCandidates().length,
      visibleHaloCandidateCount: visibleHaloCandidates().length,
      focusableSuppressedCount: suppressed.filter(
        (element) => !element.hidden && element.tabIndex >= 0 && visible(element),
      ).length,
      pointerEnabledSuppressedCount: suppressed.filter(
        (element) => getComputedStyle(element).pointerEvents !== "none",
      ).length,
      observerActive: false,
      lastSuppressedAt,
    });
  }

  function boot() {
    addEventListener("resize", schedule, { passive: true });
    addEventListener("load", schedule, { passive: true });
    addEventListener("forge:quote-runtime-ready", schedule);
    addEventListener("forge:saas-module-opened", schedule);

    // Do not run the geometry-heavy scan synchronously from a defer script.
    // Firefox can otherwise block the remaining runtime scripts before they
    // publish their public globals. CSS direct selectors still suppress known
    // orb mounts immediately; geometry discovery begins on the next frame.
    schedule();
  }

  const api = Object.freeze({
    version: VERSION,
    scan,
    schedule,
    getState: state,
    isCandidate: coreCandidate,
    isHaloCandidate: haloCandidate,
    getVisibleFloatingCandidates: visibleCoreCandidates,
    getVisibleHaloCandidates: visibleHaloCandidates,
    directSelectors: DIRECT_SELECTORS,
  });

  globalThis.ForgeAlfredOrbUiRemovalR16J1A = api;
  globalThis.ForgeAlfredOrbHaloRemediationR16J1C = api;

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot, { once: true });
  } else {
    boot();
  }
})();
