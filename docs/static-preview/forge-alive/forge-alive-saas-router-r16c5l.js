(() => {
  "use strict";

  const MODULE_KEY = "cotizaciones";
  const HOST_SELECTOR =
    '[data-forge-saas-module-host-r16c5l="cotizaciones"]';
  const VISUAL_NAV_SELECTOR =
    ".forge-mobile-nav-r16c5k-home-visual" +
    "[data-forge-mobile-nav-r16c5j]";
  const NAV_ITEM_SELECTOR =
    ".forge-mobile-nav-r16c5j__item";
  const OPEN_SELECTOR =
    '[data-forge-open-saas-module-r16c5l="cotizaciones"]';
  const CLOSE_SELECTOR =
    "[data-forge-saas-module-close-r16c5l]";

  function perfEnabled() {
    return new URL(location.href).searchParams.get("forgePerf") === "1";
  }

  function perfMark(name) {
    if (perfEnabled()) performance.mark(name);
  }

  const perfState = {
    timestamps: {},
    events: [],
    longTasks: [],
  };

  function perfTimestamp(name, value = performance.now()) {
    if (perfEnabled()) perfState.timestamps[name] = value;
    return value;
  }

  function rounded(value) {
    return Number.isFinite(value) ? Math.round(value * 10) / 10 : null;
  }

  function delta(start, end) {
    const a = perfState.timestamps[start];
    const b = perfState.timestamps[end];
    return rounded(Number.isFinite(a) && Number.isFinite(b) ? b - a : NaN);
  }

  function installPerformanceObservers() {
    if (!perfEnabled() || globalThis.__FORGE_PERF_OBSERVERS_BOUND__) return;
    globalThis.__FORGE_PERF_OBSERVERS_BOUND__ = true;
    const observe = (type, callback) => {
      try {
        const observer = new PerformanceObserver((list) => {
          list.getEntries().forEach(callback);
        });
        observer.observe({ type, buffered: true });
      } catch {}
    };
    observe("event", (entry) => {
      perfState.events.push({
        name: entry.name,
        startTime: rounded(entry.startTime),
        duration: rounded(entry.duration),
        interactionId: entry.interactionId || null,
      });
    });
    observe("first-input", (entry) => {
      perfState.events.push({
        name: "first-input",
        startTime: rounded(entry.startTime),
        duration: rounded(entry.duration),
        processingStart: rounded(entry.processingStart),
      });
    });
    observe("longtask", (entry) => {
      perfState.longTasks.push({
        startTime: rounded(entry.startTime),
        duration: rounded(entry.duration),
        name: entry.name,
      });
    });
  }

  function updateDetailedReports() {
    if (!perfEnabled()) return;
    const click = perfState.timestamps.CLICK_EVENT_RECEIVED_TS;
    const eventDurations = perfState.events
      .map((entry) => entry.duration)
      .filter(Number.isFinite);
    globalThis.__FORGE_LONG_TASK_REPORT__ = Object.freeze({
      LONG_TASK_COUNT: perfState.longTasks.length,
      LONG_TASK_TOTAL_MS: rounded(
        perfState.longTasks.reduce((sum, entry) => sum + entry.duration, 0),
      ),
      LONGEST_TASK_MS: rounded(Math.max(
        0,
        ...perfState.longTasks.map((entry) => entry.duration),
      )),
      LONG_TASKS_FIRST_2_SECONDS_AFTER_CLICK: perfState.longTasks.filter(
        (entry) =>
          Number.isFinite(click) &&
          entry.startTime >= click &&
          entry.startTime <= click + 2000,
      ),
      tasks: [...perfState.longTasks],
    });
    globalThis.__FORGE_EVENT_TIMING_REPORT__ = Object.freeze({
      POINTERDOWN_TO_CLICK_MS: delta("POINTER_DOWN_TS", "CLICK_EVENT_RECEIVED_TS"),
      CLICK_DISPATCH_DELAY_MS: delta("POINTER_UP_TS", "CLICK_EVENT_RECEIVED_TS"),
      CLICK_HANDLER_SYNC_MS: delta("CLICK_HANDLER_START_TS", "CLICK_HANDLER_END_TS"),
      CLICK_TO_ROUTE_STATE_MS: delta("CLICK_EVENT_RECEIVED_TS", "ROUTE_STATE_UPDATED_TS"),
      CLICK_TO_FIRST_RAF_MS: delta("CLICK_EVENT_RECEIVED_TS", "FIRST_RAF_TS"),
      CLICK_TO_NEXT_PAINT_MS: delta("CLICK_EVENT_RECEIVED_TS", "SECOND_RAF_TS"),
      CLICK_TO_IDLE_MS: delta("CLICK_EVENT_RECEIVED_TS", "FIRST_IDLE_AFTER_CLICK_TS"),
      INP_APPROX_MS:
        eventDurations.length ? rounded(Math.max(...eventDurations)) : null,
      MAX_EVENT_DURATION_MS:
        eventDurations.length ? rounded(Math.max(...eventDurations)) : null,
      HAPTIC_OWNER: "BROWSER_OR_OS",
      events: [...perfState.events],
      timestamps: { ...perfState.timestamps },
    });
  }

  function exportPerformanceReport() {
    updateDetailedReports();
    const text = JSON.stringify({
      performance: reportPerformance(),
      events: globalThis.__FORGE_EVENT_TIMING_REPORT__ || null,
      longTasks: globalThis.__FORGE_LONG_TASK_REPORT__ || null,
      pdf: globalThis.__FORGE_PDF_TIMELINE__ || null,
    });
    navigator.clipboard?.writeText?.(text).catch?.(() => {});
    return text;
  }

  function reportPerformance() {
    if (!perfEnabled()) return null;
    const duration = (name) =>
      performance.getEntriesByName(name).at(-1)?.duration ?? null;
    const report = Object.freeze({
      INDEX_SCRIPT_COUNT: 27,
      INDEX_DUPLICATE_SCRIPT_COUNT: 1,
      INDEX_BLOCKING_SCRIPT_COUNT: 5,
      INDEX_MODULEPRELOAD_COUNT: 0,
      APP_BOOT_SYNC_WORK_MS: null,
      APP_BOOT_LISTENER_COUNT: null,
      APP_GLOBAL_RENDER_COUNT: null,
      APP_ROUTE_HANDLER_COUNT: 1,
      APP_STORAGE_SYNC_MS: 0,
      APP_OBSERVER_COUNT: null,
      APP_TIMER_COUNT: null,
      HOME_TO_QUOTES_VISUAL_MS:
        duration("HOME_TO_QUOTES_VISUAL_MS"),
      HOME_TO_QUOTES_RUNTIME_MS:
        duration("HOME_TO_QUOTES_RUNTIME_MS"),
      QUOTES_TO_HOME_VISUAL_MS:
        duration("QUOTES_TO_HOME_VISUAL_MS"),
      SECOND_HOME_TO_QUOTES_VISUAL_MS:
        duration("SECOND_HOME_TO_QUOTES_VISUAL_MS"),
      SECOND_HOME_TO_QUOTES_RUNTIME_MS:
        duration("SECOND_HOME_TO_QUOTES_RUNTIME_MS"),
      PDF_SELECTED_TO_POPUP_MS:
        duration("PDF_SELECTED_TO_POPUP_MS"),
      PDFJS_IMPORT_MS: duration("PDFJS_IMPORT_MS"),
      PDF_OPEN_MS: duration("PDF_OPEN_MS"),
      TEXT_EXTRACTION_MS: duration("TEXT_EXTRACTION_MS"),
      PACKET_TO_POPUP_MS: duration("PACKET_TO_POPUP_MS"),
    });
    globalThis.__FORGE_PERF_REPORT__ = report;
    return report;
  }

  function markVisualReady(route) {
    requestAnimationFrame(() => {
      perfTimestamp("FIRST_RAF_TS");
      perfMark("FORGE_ROUTE_VISUALLY_READY");
      const opening = route === MODULE_KEY;
      const visualMeasure =
        opening &&
        performance.getEntriesByName(
          "HOME_TO_QUOTES_VISUAL_MS",
        ).length
          ? "SECOND_HOME_TO_QUOTES_VISUAL_MS"
          : opening
            ? "HOME_TO_QUOTES_VISUAL_MS"
            : "QUOTES_TO_HOME_VISUAL_MS";
      try {
        performance.measure(
          visualMeasure,
          opening ? "FORGE_CLICK_QUOTES" : "FORGE_CLICK_HOME",
          "FORGE_ROUTE_VISUALLY_READY",
        );
      } catch {}
      globalThis.dispatchEvent(
        new CustomEvent("forge:route-visually-ready", {
          detail: { route },
        }),
      );
      requestAnimationFrame(() => {
        perfTimestamp("SECOND_RAF_TS");
        perfTimestamp("FIRST_PAINT_AFTER_CLICK_TS");
        const idle = () => {
          perfTimestamp("FIRST_IDLE_AFTER_CLICK_TS");
          updateDetailedReports();
          reportPerformance();
        };
        if (typeof requestIdleCallback === "function") {
          requestIdleCallback(idle, { timeout: 1000 });
        } else {
          setTimeout(idle, 0);
        }
      });
    });
  }

  function installPerfCopyAction() {
    if (!perfEnabled() || document.querySelector("[data-forge-perf-copy]")) {
      return;
    }
    const button = document.createElement("button");
    button.type = "button";
    button.dataset.forgePerfCopy = "true";
    button.textContent = "Copiar diagnóstico Forge";
    Object.assign(button.style, {
      position: "fixed",
      right: "12px",
      top: "12px",
      zIndex: "9999",
      padding: "8px 12px",
    });
    button.addEventListener("click", async () => {
      const text = exportPerformanceReport();
      await navigator.clipboard?.writeText?.(text);
    });
    document.body.appendChild(button);
  }

  /* FORGEOS:R16J1C1_03A5_CONSTANT_TIME_ROUTER:START */
  const SHELL_SELECTOR = ".phone-shell";
  const FAST_CLASS =
    "forge-saas-module-active-r16j1c1";
  const FAST_STYLE_ID =
    "forge-saas-module-fastpath-style-r16j1c1";

  function ensureFastPathStyle() {
    if (document.getElementById(FAST_STYLE_ID)) {
      return true;
    }

    const style = document.createElement("style");
    style.id = FAST_STYLE_ID;
    style.textContent = `
      .phone-shell.${FAST_CLASS}
        > :not(
          [data-forge-saas-module-host-r16c5l="cotizaciones"]
        ):not(
          [data-command-mobile-slot]
        ):not(
          .forge-home-nav-controller-r16c5k
        ):not(
          .forge-mobile-nav-r16c5k-home-visual
        ) {
        display: none !important;
      }

      .phone-shell.${FAST_CLASS}
        > [data-forge-saas-module-host-r16c5l="cotizaciones"] {
        display: block !important;
      }
    `;

    document.head.appendChild(style);
    return true;
  }

  function isolateShellForModule(moduleHost) {
    const shell = moduleHost.closest(SHELL_SELECTOR);

    if (!shell) return false;

    ensureFastPathStyle();
    shell.classList.add(FAST_CLASS);
    return true;
  }

  function restoreShellAfterModule() {
    const shell = host()?.closest(SHELL_SELECTOR);

    if (!shell) return false;

    shell.classList.remove(FAST_CLASS);
    return true;
  }
  /* FORGEOS:R16J1C1_03A5_CONSTANT_TIME_ROUTER:END */

  function host() {
    return document.querySelector(HOST_SELECTOR);
  }

  function visualNav() {
    return document.querySelector(VISUAL_NAV_SELECTOR);
  }

  function visualItem(key) {
    const nav = visualNav();

    return nav
      ? nav.querySelector(
          `${NAV_ITEM_SELECTOR}[data-forge-nav-key="${key}"]`,
        )
      : null;
  }

  function setVisualActive(key) {
    const nav = visualNav();
    const selected = visualItem(key);

    if (!nav || !selected) return;

    nav.querySelectorAll(NAV_ITEM_SELECTOR).forEach((item) => {
      const active = item === selected;

      item.classList.toggle("active", active);

      if (active) {
        item.setAttribute("aria-current", "page");
      } else {
        item.removeAttribute("aria-current");
      }
    });

    nav.dataset.forgeActiveKey = key;
  }

  function moduleIsOpen() {
    return (
      document.body.dataset.forgeSaasActiveModuleR16c5l ===
      MODULE_KEY
    );
  }

  function cleanModuleParams(url) {
    url.searchParams.delete("module");
    return url;
  }

  function openModule(options = {}) {
    const moduleHost = host();
    if (!moduleHost) return false;

    perfMark("FORGE_ROUTE_AUTHORITY_START");
    document.body.dataset.forgeSaasActiveModuleR16c5l =
      MODULE_KEY;
    document.body.dataset.forgeSaasModuleTransitionR16c5l =
      "enter";
    document.body.dataset.forgeDesiredNavKeyR16j1c1 =
      MODULE_KEY;
    perfTimestamp("ROUTE_STATE_UPDATED_TS");
    perfMark("FORGE_ROUTE_DATASET_UPDATED");

    isolateShellForModule(moduleHost);
    moduleHost.hidden = false;
    perfMark("FORGE_ROUTE_CLASSES_UPDATED");

    /*
     * The router owns route state, but never measures or styles the
     * selector. It delegates the target key to the single visual
     * authority. This also covers HTMLElement.click(), keyboard
     * activation and tests where pointerdown is intentionally absent.
     */
    globalThis
      .ForgeMobileNavInstantAuthorityR16J1C1
      ?.sync(MODULE_KEY);

    const url = new URL(window.location.href);
    url.searchParams.set("module", MODULE_KEY);
    url.searchParams.set("v", "r16j1c1-fast");

    if (options.history !== false) {
      history.pushState(
        { forgeModule: MODULE_KEY },
        "",
        url,
      );
    }

    document.title = "Nueva cotización · Forge Alive";

    if (window.scrollY !== 0) {
      window.scrollTo(0, 0);
    }

    window.dispatchEvent(
      new CustomEvent("forge:saas-module-opened", {
        detail: { module: MODULE_KEY },
      }),
    );
    markVisualReady(MODULE_KEY);

    return true;
  }

  function closeModule(options = {}) {
    const moduleHost = host();
    if (!moduleHost) return false;

    perfMark("FORGE_ROUTE_AUTHORITY_START");
    moduleHost.hidden = true;
    restoreShellAfterModule();

    delete document.body.dataset
      .forgeSaasActiveModuleR16c5l;
    delete document.body.dataset
      .forgeSaasModuleTransitionR16c5l;
    perfTimestamp("ROUTE_STATE_UPDATED_TS");
    perfMark("FORGE_ROUTE_DATASET_UPDATED");
    perfMark("FORGE_ROUTE_CLASSES_UPDATED");

    const targetKey = options.targetKey || "inicio";

    document.body.dataset.forgeDesiredNavKeyR16j1c1 =
      targetKey;

    globalThis
      .ForgeMobileNavInstantAuthorityR16J1C1
      ?.sync(targetKey);

    if (options.history !== false) {
      const url = cleanModuleParams(
        new URL(window.location.href),
      );
      url.searchParams.set("nav", targetKey);
      url.searchParams.set("v", "r16j1c1-fast");

      history.pushState(
        {
          forgeModule: null,
          forgeSection: targetKey,
        },
        "",
        url,
      );
    }

    document.title = "Forge Alive Vista Estática";

    window.dispatchEvent(
      new CustomEvent("forge:saas-module-closed", {
        detail: {
          module: MODULE_KEY,
          targetKey,
        },
      }),
    );
    markVisualReady(targetKey);

    return true;
  }

  function requestedModule() {
    return new URLSearchParams(
      window.location.search,
    ).get("module");
  }

  function bindNavigationCapture() {
    const captureInput = (name) => (event) => {
      if (!perfEnabled() || !event.target?.closest?.(
        `${OPEN_SELECTOR}, ${CLOSE_SELECTOR}, ${NAV_ITEM_SELECTOR}`,
      )) return;
      perfTimestamp(name, event.timeStamp || performance.now());
    };
    window.addEventListener("pointerdown", captureInput("POINTER_DOWN_TS"), {
      capture: true,
      passive: true,
    });
    window.addEventListener("touchstart", captureInput("TOUCH_START_TS"), {
      capture: true,
      passive: true,
    });
    window.addEventListener("pointerup", captureInput("POINTER_UP_TS"), {
      capture: true,
      passive: true,
    });
    window.addEventListener(
      "click",
      (event) => {
        if (event.target.closest?.(
          `${OPEN_SELECTOR}, ${CLOSE_SELECTOR}, ${NAV_ITEM_SELECTOR}`,
        )) {
          perfTimestamp("CLICK_EVENT_RECEIVED_TS", event.timeStamp || performance.now());
          perfTimestamp("CLICK_HANDLER_START_TS");
          perfTimestamp("NAVIGATION_REQUEST_TS");
        }
        const openTarget = event.target.closest(OPEN_SELECTOR);

        if (openTarget) {
          perfMark("FORGE_CLICK_QUOTES");
          event.preventDefault();
          event.stopImmediatePropagation();
          openModule();
          perfTimestamp("CLICK_HANDLER_END_TS");
          return;
        }

        const navItem = event.target.closest(NAV_ITEM_SELECTOR);

        if (
          navItem &&
          visualNav()?.contains(navItem)
        ) {
          const key = navItem.dataset.forgeNavKey;

          if (key === MODULE_KEY) {
            perfMark("FORGE_CLICK_QUOTES");
            event.preventDefault();
            event.stopImmediatePropagation();
            openModule();
            perfTimestamp("CLICK_HANDLER_END_TS");
            return;
          }

          if (moduleIsOpen()) {
            perfMark("FORGE_CLICK_HOME");
            closeModule({
              history: false,
              targetKey: key || "inicio",
            });
            perfTimestamp("CLICK_HANDLER_END_TS");
          }

          return;
        }

        const closeTarget = event.target.closest(CLOSE_SELECTOR);

        if (closeTarget) {
          perfMark("FORGE_CLICK_HOME");
          event.preventDefault();
          closeModule();
          perfTimestamp("CLICK_HANDLER_END_TS");
          return;
        }

        if (moduleIsOpen()) {
          const anchor = event.target.closest(
            `${HOST_SELECTOR} a`,
          );

          if (
            anchor &&
            (
              anchor.textContent.trim().startsWith("←") ||
              anchor.getAttribute("href")?.startsWith("../")
            )
          ) {
            event.preventDefault();
            closeModule();
            perfTimestamp("CLICK_HANDLER_END_TS");
          }
        }
      },
      true,
    );
  }

  function bindHistory() {
    window.addEventListener("popstate", () => {
      if (requestedModule() === MODULE_KEY) {
        openModule({ history: false });
        return;
      }

      if (moduleIsOpen()) {
        closeModule({ history: false });
      }
    });
  }

  function init() {
    ensureFastPathStyle();
    installPerformanceObservers();
    installPerfCopyAction();
    bindNavigationCapture();
    bindHistory();

    if (requestedModule() === MODULE_KEY) {
      openModule({ history: false });
    }
  }

  window.ForgeSaasRouterR16C5L = Object.freeze({
    openNewQuote: () => openModule(),
    closeNewQuote: () => closeModule(),
    isNewQuoteOpen: () => moduleIsOpen(),
  });
  globalThis.__FORGE_EXPORT_PERF_REPORT__ = exportPerformanceReport;

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, {
      once: true,
    });
  } else {
    init();
  }
})();
