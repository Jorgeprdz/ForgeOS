/* FORGEOS:R16C_HOME_CANONICAL_RESPONSIVE_RECONCILER:START */
(function () {
  "use strict";

  const MOBILE_QUERY = "(max-width: 900px)";
  const SAFE_PREVIEW_BOUNDARY = Object.freeze({
    phase: "R16C_HOME_CANONICAL_RESPONSIVE_RECONCILER",
    officialQuoteAllowed: false,
    sendAllowed: false,
    crmWriteAllowed: false,
    calendarCreateAllowed: false,
    humanReviewRequired: true,
  });

  let reconcileFrame = 0;
  let observer = null;

  function isMobileSurface() {
    return window.matchMedia(MOBILE_QUERY).matches;
  }

  function visible(node) {
    if (!node || !node.isConnected) return false;
    const style = window.getComputedStyle(node);
    const box = node.getBoundingClientRect();
    return style.display !== "none" && style.visibility !== "hidden" && box.width > 0 && box.height > 0;
  }

  function removeObsoleteMobileMounts() {
    const obsoleteSelectors = [
      ".forge-ux99-focus-056q",
      ".forge-smart-widget-stable-056t",
      ".forge-smart-widget-pager-root-056l",
      ".forge-smart-widget-pager-root-056l2",
      ".forge-smart-widget-pager-root-056l3",
      ".alfred-command-root-056k3",
      ".alfred-command-root-056k4",
      ".alfred-command-root-056k5",
      ".forge-nav-root-056k7",
    ];
    obsoleteSelectors.forEach(function (selector) {
      document.querySelectorAll(selector).forEach(function (node) {
        node.remove();
      });
    });
  }

  function reconcileNavigation() {
    const navs = Array.from(document.querySelectorAll(".bottom-nav"));
    const nav = navs.shift();
    navs.forEach(function (duplicate) { duplicate.remove(); });
    if (!nav) return;

    nav.dataset.forgeHomeNavigationR16c = "canonical";
    const items = Array.from(nav.querySelectorAll("button[data-forge-home-section]"));
    if (!items.length) return;

    if (nav.dataset.forgeHomeNavigationBoundR16c !== "true") {
      nav.dataset.forgeHomeNavigationBoundR16c = "true";
      nav.addEventListener("click", function (event) {
        const selected = event.target.closest("button[data-forge-home-section]");
        if (!selected || !nav.contains(selected)) return;
        items.forEach(function (item) {
          const active = item === selected;
          item.classList.toggle("active", active);
          if (active) item.setAttribute("aria-current", "page");
          else item.removeAttribute("aria-current");
        });
        document.documentElement.dataset.forgeHomeSectionR16c = selected.dataset.forgeHomeSection || "inicio";
      });
    }

    const active = nav.querySelector('[aria-current="page"]') || items[0];
    items.forEach(function (item) {
      item.classList.toggle("active", item === active);
      if (item === active) item.setAttribute("aria-current", "page");
      else item.removeAttribute("aria-current");
    });
  }

  function reconcileCommandOrb() {
    const layers = Array.from(document.querySelectorAll("[data-command-orb-layer]"));
    const layer = layers.shift();
    layers.forEach(function (duplicate) { duplicate.remove(); });
    if (!layer) return;

    const mobileSlot = document.querySelector("[data-command-mobile-slot]");
    const desktopSlot = document.querySelector("[data-command-desktop-slot]");
    const target = isMobileSurface() ? mobileSlot : desktopSlot;
    if (target && layer.parentElement !== target) target.appendChild(layer);
    layer.dataset.forgeHomeCommandOrbR16c = "canonical";
  }

  function isDuplicateNextAction(widget) {
    if (!widget.matches(".forge-mobile-widget-057j")) return false;
    const title = widget.querySelector(".forge-widget-title-057j");
    return Boolean(title && /seguimiento prioritario/i.test(title.textContent || ""));
  }

  function reconcileSmartWidgets() {
    const desktopStack = document.getElementById("smart-widget-stack");
    const desktopSlot = document.querySelector("[data-smart-widget-desktop-slot]");
    if (desktopStack && desktopSlot && desktopStack.parentElement !== desktopSlot) {
      desktopSlot.appendChild(desktopStack);
    }
    if (desktopStack) desktopStack.dataset.smartWidgetSlot = "desktop";

    document.querySelectorAll(".forge-mobile-widget-057j").forEach(function (widget) {
      if (isDuplicateNextAction(widget)) widget.remove();
    });

    const staticWidgets = Array.from(document.querySelectorAll(".forge-smart-widget-static-056u"));
    const keeper = staticWidgets.shift();
    staticWidgets.forEach(function (duplicate) { duplicate.remove(); });
    if (keeper) {
      keeper.dataset.forgeHomeSmartWidgetR16c = "canonical";
      keeper.removeAttribute("hidden");
      keeper.removeAttribute("aria-hidden");
    }
  }

  function publishState() {
    const state = {
      mobile: isMobileSurface(),
      navigationCount: document.querySelectorAll(".bottom-nav").length,
      commandOrbCount: document.querySelectorAll("[data-command-orb-layer]").length,
      smartWidgetCount: document.querySelectorAll(".forge-smart-widget-static-056u").length,
      duplicateNextActionCount: Array.from(document.querySelectorAll(".forge-mobile-widget-057j")).filter(isDuplicateNextAction).length,
      navigationVisible: visible(document.querySelector(".bottom-nav")),
      commandOrbVisible: visible(document.querySelector("[data-command-orb-layer]")),
      safePreviewBoundary: SAFE_PREVIEW_BOUNDARY,
    };
    window.ForgeAliveHomeR16C = Object.freeze({ ...state, reconcile: scheduleReconcile });
    document.documentElement.dataset.forgeHomeR16c = "ready";
  }

  function reconcile() {
    reconcileFrame = 0;
    if (isMobileSurface()) removeObsoleteMobileMounts();
    reconcileNavigation();
    reconcileCommandOrb();
    reconcileSmartWidgets();
    publishState();
  }

  function scheduleReconcile() {
    if (reconcileFrame) return;
    reconcileFrame = window.requestAnimationFrame(reconcile);
  }

  function bindLifecycle() {
    if (document.documentElement.dataset.forgeHomeLifecycleR16c === "bound") return;
    document.documentElement.dataset.forgeHomeLifecycleR16c = "bound";

    window.addEventListener("pageshow", scheduleReconcile);
    window.addEventListener("popstate", scheduleReconcile);
    window.addEventListener("resize", scheduleReconcile, { passive: true });
    window.addEventListener("orientationchange", scheduleReconcile, { passive: true });
    document.addEventListener("visibilitychange", function () {
      if (!document.hidden) scheduleReconcile();
    });

    observer = new MutationObserver(scheduleReconcile);
    observer.observe(document.body, { childList: true, subtree: true });
  }

  function boot() {
    bindLifecycle();
    scheduleReconcile();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot, { once: true });
  } else {
    boot();
  }
}());
/* FORGEOS:R16C_HOME_CANONICAL_RESPONSIVE_RECONCILER:END */
