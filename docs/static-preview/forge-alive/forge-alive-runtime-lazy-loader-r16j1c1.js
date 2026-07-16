(() => {
  "use strict";

  const VERSION = "R16J1C1_RUNTIME_LAZY_03C1_PARSER_FIRST";
  const MODULE_KEY = "cotizaciones";
  const HOST_SELECTOR =
    '[data-forge-saas-module-host-r16c5l="cotizaciones"]';
  const FILE_INPUT_SELECTOR = 'input[type="file"]';
  const NAV_SELECTOR =
    ".forge-mobile-nav-r16c5k-home-visual" +
    "[data-forge-mobile-nav-r16c5j]";
  const NAV_ITEM_SELECTOR = ".forge-mobile-nav-r16c5j__item";

  const QUOTE_STYLES = Object.freeze([{"href": "assets/forge-quote-preview-confirmation-modal-107q.css", "media": ""}, {"href": "forge-sales-presentation-entrypoint-r16j0.css?v=r16j0-accepted-quote-sales-presentation-entrypoint-20260714-1", "media": ""}, {"href": "forge-quote-acceptance-entrypoint-r16j0a.css?v=r16j0a-quote-human-acceptance-20260714-1", "media": ""}, {"href": "forge-sales-presentation-workspace-r16j1.css?v=r16j1-workspace-ui-cleanup-20260714-1", "media": ""}, {"href": "forge-nueva-cotizacion-ui-cleanup-r16j1.css?v=r16j1-workspace-ui-cleanup-20260714-1", "media": ""}, {"href": "forge-quote-action-dock-r16j1b.css?v=r16j1b-segubeca-inline-orb-20260714-10", "media": ""}]);
  const QUOTE_SCRIPTS = Object.freeze([{"src": "../quote-preview-live/forge-pdf-browser-parser.js?v=r16j1c1-main-thread-latency-20260716-1", "type": "module"}, {"src": "assets/forge-quote-preview-confirmation-modal-107q.js", "type": ""}, {"src": "../quote-preview-live/forge-quote-preview-bundle.js", "type": ""}, {"src": "../quote-preview-live/forge-quote-calculators.js", "type": "module"}, {"src": "../quote-preview-live/forge-udi-mxn-runtime.js?v=r16j1c1-system-performance-repair-20260716-1", "type": "module"}, {"src": "../quote-preview-live/forge-quote-benefit-summary.js", "type": "module"}, {"src": "../quote-preview-live/forge-accepted-quote-adapter.js?v=r14g_segubeca_renderer_20260712_1", "type": "module"}, {"src": "../quote-preview-live/forge-benefit-summary-renderer.js?v=r16b_unified_dashboard_20260713_1", "type": "module"}, {"src": "../quote-preview-live/forge-benefit-summary-layout.js?v=r16b_unified_dashboard_20260713_1", "type": "module"}, {"src": "../quote-preview-live/forge-quote-intake-state.js?v=r16a_quote_intake_empty_state_20260713_1", "type": ""}, {"src": "../quote-preview-live/forge-accepted-quote-bridge.js?v=r16j1c1-main-thread-latency-20260716-1", "type": "module"}, {"src": "forge-sales-presentation-entrypoint-r16j0.js?v=r16j1c1-performance-repair-03c3-20260716-1", "type": ""}, {"src": "forge-quote-acceptance-entrypoint-r16j0a.js?v=r16j1c1-system-performance-repair-20260716-1", "type": ""}, {"src": "forge-quote-action-dock-r16j1b.js?v=r16j1c1-performance-repair-03c3-20260716-1", "type": ""}]);
  const DESKTOP_SCRIPTS = Object.freeze([{"src": "./alfred-desktop-dashboard.js?v=r16c_home_restoration_20260713_1", "type": ""}, {"src": "./alfred-desktop-command-workspace-056y.js?v=r16c_home_restoration_20260713_1", "type": ""}, {"src": "./desktop/forge-desktop-command-workspace-upgrade-058e.js?v=060n", "type": ""}, {"src": "./desktop/forge-local-read-model-preview-ui-binding-060l.js?v=060n", "type": ""}, {"src": "./desktop/forge-public-preview-interaction-visual-repair-060m.js?v=r16c_home_restoration_20260713_1", "type": ""}]);

  const loadedStyles = new Map();
  const loadedScripts = new Map();

  let quoteShellPromise = null;
  let quoteRuntimePromise = null;
  let desktopRuntimePromise = null;
  let replayingFileChange = false;
  let quoteRuntimeLoadCount = 0;

  function perfEnabled() {
    return new URL(location.href).searchParams.get("forgePerf") === "1";
  }

  function perfMark(name) {
    if (!perfEnabled()) return;
    performance.mark(name);
  }

  function perfMeasure(name, start, end) {
    if (!perfEnabled()) return;
    try {
      performance.measure(name, start, end);
    } catch {}
  }

  function absoluteUrl(value) {
    return new URL(value, document.baseURI).href;
  }

  function loadStyle(entry) {
    const key = absoluteUrl(entry.href);
    if (loadedStyles.has(key)) return loadedStyles.get(key);

    const existing = Array.from(
      document.querySelectorAll('link[rel="stylesheet"][href]'),
    ).find((link) => link.href === key);

    if (existing) {
      const ready = Promise.resolve(existing);
      loadedStyles.set(key, ready);
      return ready;
    }

    const ready = new Promise((resolve, reject) => {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = entry.href;
      link.dataset.forgeLazyQuoteStyleR16j1c1 = "true";
      if (entry.media) link.media = entry.media;
      link.addEventListener("load", () => resolve(link), { once: true });
      link.addEventListener(
        "error",
        () => reject(new Error(`No se pudo cargar ${entry.href}`)),
        { once: true },
      );
      document.head.appendChild(link);
    });

    loadedStyles.set(key, ready);
    return ready;
  }

  function loadScript(entry) {
    const key = absoluteUrl(entry.src);
    if (loadedScripts.has(key)) return loadedScripts.get(key);

    const existing = Array.from(
      document.querySelectorAll("script[src]"),
    ).find((script) => script.src === key);

    if (existing) {
      const ready = Promise.resolve(existing);
      loadedScripts.set(key, ready);
      return ready;
    }

    const ready = new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = entry.src;
      script.async = false;
      script.dataset.forgeLazyRuntimeScriptR16j1c1 = "true";
      if (entry.type) script.type = entry.type;
      script.addEventListener("load", () => resolve(script), { once: true });
      script.addEventListener(
        "error",
        () => reject(new Error(`No se pudo cargar ${entry.src}`)),
        { once: true },
      );
      document.body.appendChild(script);
    });

    loadedScripts.set(key, ready);
    return ready;
  }

  async function loadSequential(entries) {
    for (const entry of entries) {
      await loadScript(entry);
    }
  }

  function statusNode() {
    const host = document.querySelector(HOST_SELECTOR);
    if (!host) return null;

    let node = host.querySelector(
      "[data-forge-lazy-runtime-status-r16j1c1]",
    );
    if (node) return node;

    node = document.createElement("div");
    node.dataset.forgeLazyRuntimeStatusR16j1c1 = "true";
    node.setAttribute("role", "status");
    node.setAttribute("aria-live", "polite");
    Object.assign(node.style, {
      position: "sticky",
      top: "0",
      zIndex: "190",
      width: "fit-content",
      margin: "0.5rem auto",
      padding: "0.5rem 0.9rem",
      borderRadius: "999px",
      border: "1px solid rgba(103,242,239,.42)",
      background: "rgba(8,27,48,.88)",
      color: "#67f2ef",
      font: "800 12px/1.2 system-ui,sans-serif",
      boxShadow: "0 8px 24px rgba(0,0,0,.22)",
    });
    host.prepend(node);
    return node;
  }

  function setQuoteState(state, message = "") {
    const host = document.querySelector(HOST_SELECTOR);
    if (host) host.dataset.forgeLazyRuntimeStateR16j1c1 = state;
    document.body.dataset.forgeQuoteRuntimeStateR16j1c1 = state;

    const node = statusNode();
    if (!node) return;

    if (state === "loading") {
      node.hidden = false;
      node.textContent = message || "Preparando cotizaciones…";
    } else if (state === "error") {
      node.hidden = false;
      node.textContent =
        message || "No se pudo preparar Cotizaciones. Reintenta.";
      node.style.color = "#ffd29c";
    } else {
      node.hidden = true;
    }
  }

  async function loadQuoteShell() {
    if (quoteShellPromise) return quoteShellPromise;

    quoteShellPromise = Promise.resolve().then(() => {
      perfMark("FORGE_QUOTE_SHELL_LOAD_START");
      const host = document.querySelector(HOST_SELECTOR);

      if (host) {
        host.dataset.forgeLazyRuntimeStateR16j1c1 =
          "shell-ready";
      }

      document.body.dataset.forgeQuoteRuntimeStateR16j1c1 =
        "shell-ready";

      globalThis.dispatchEvent(
        new CustomEvent("forge:quote-shell-ready", {
          detail: {
            module: MODULE_KEY,
            version: VERSION,
          },
        }),
      );
      perfMark("FORGE_QUOTE_SHELL_READY");

      return true;
    });

    return quoteShellPromise;
  }

  async function loadQuoteRuntime() {
    if (quoteRuntimePromise) return quoteRuntimePromise;

    quoteRuntimeLoadCount += 1;
    quoteRuntimePromise = (async () => {
      try {
        perfMark("FORGE_QUOTE_RUNTIME_LOAD_START");
        perfMark("QUOTE_ROUTE_OPEN_START");
        await loadQuoteShell();

        setQuoteState(
          "loading",
          "Preparando extractor local…",
        );

        await Promise.all(
          QUOTE_STYLES.map(loadStyle),
        );
        await loadSequential(QUOTE_SCRIPTS);

        setQuoteState("ready");
        perfMark("FORGE_QUOTE_RUNTIME_READY");
        perfMark("FORGE_FIRST_QUOTE_INTERACTION_READY");
        perfMark("QUOTE_ROUTE_READY");
        perfMeasure(
          "QUOTE_ROUTE_MS",
          "QUOTE_ROUTE_OPEN_START",
          "QUOTE_ROUTE_READY",
        );

        globalThis.dispatchEvent(
          new CustomEvent("forge:quote-runtime-ready", {
            detail: {
              module: MODULE_KEY,
              version: VERSION,
            },
          }),
        );
        globalThis.ForgePdfBrowserParser
          ?.preloadPdfJsRuntime?.();
        const routeMeasure =
          performance.getEntriesByName(
            "HOME_TO_QUOTES_RUNTIME_MS",
          ).length
            ? "SECOND_HOME_TO_QUOTES_RUNTIME_MS"
            : "HOME_TO_QUOTES_RUNTIME_MS";
        if (perfEnabled()) {
          try {
            performance.measure(
              routeMeasure,
              "FORGE_CLICK_QUOTES",
              "FORGE_QUOTE_RUNTIME_READY",
            );
          } catch {}
        }

        return true;
      } catch (error) {
        quoteRuntimePromise = null;
        setQuoteState("error");
        console.error(
          "[Forge lazy quote runtime]",
          error,
        );
        throw error;
      }
    })();

    return quoteRuntimePromise;
  }

  async function loadDesktopRuntime() {
    if (!matchMedia("(min-width: 901px)").matches) return false;
    if (desktopRuntimePromise) return desktopRuntimePromise;
    desktopRuntimePromise = loadSequential(DESKTOP_SCRIPTS).then(() => true);
    return desktopRuntimePromise;
  }

  function visualNav() {
    return document.querySelector(NAV_SELECTOR);
  }

  function visualItem(key) {
    return visualNav()?.querySelector(
      ":scope > .forge-mobile-nav-r16c5j__items > " +
      `${NAV_ITEM_SELECTOR}[data-forge-nav-key="${key}"]`,
    ) || null;
  }

  function syncSelector(key) {
    const authority =
      globalThis.ForgeMobileNavInstantAuthorityR16J1C1;

    if (!authority) return false;
    return authority.sync(key);
  }

  function syncSelectorStable(key) {
    return syncSelector(key);
  }

  function requestedKey() {
    const url = new URL(location.href);
    if (
      url.searchParams.get("module") === MODULE_KEY ||
      document.body.dataset.forgeSaasActiveModuleR16c5l === MODULE_KEY
    ) {
      return MODULE_KEY;
    }
    return url.searchParams.get("nav") || "inicio";
  }

  function syncRequestedKey() {
    syncSelectorStable(requestedKey());
  }

  async function onFileChangeCapture(event) {
    const host = document.querySelector(HOST_SELECTOR);
    const target = event.target;
    const input =
      target instanceof HTMLInputElement &&
      target.matches(FILE_INPUT_SELECTOR) &&
      host?.contains(target)
        ? target
        : null;

    if (!input || replayingFileChange) return;

    const runtimeState =
      document.body.dataset.forgeQuoteRuntimeStateR16j1c1;

    if (runtimeState === "ready") return;

    const visibleStatus =
      input
        .closest(
          ".fq-file-dropzone-105dr, " +
          ".fq-upload-card-105dr, " +
          ".fq-upload-panel-105dr",
        )
        ?.querySelector(".fq-file-status-105dr") ||
      host?.querySelector(".fq-file-status-105dr");

    event.stopImmediatePropagation();

    if (visibleStatus) {
      visibleStatus.textContent =
        `PDF recibido: ${
          input.files?.[0]?.name || "archivo"
        }. Preparando extractor local...`;
    }

    try {
      await loadQuoteRuntime();
      replayingFileChange = true;
      input.dispatchEvent(
        new Event("change", {
          bubbles: true,
        }),
      );
    } catch (error) {
      if (visibleStatus) {
        visibleStatus.textContent =
          `No pude preparar el extractor: ${
            error?.message || error
          }`;
      }

      console.error(
        "[Forge parser-first file handoff]",
        error,
      );
    } finally {
      replayingFileChange = false;
    }
  }

  function onClick(event) {
    const item = event.target.closest(NAV_ITEM_SELECTOR);
    if (!item || !visualNav()?.contains(item)) return;

    const key = item.dataset.forgeNavKey;
    if (!key) return;

    syncSelectorStable(key);
  }

  function loadQuoteRuntimeAfterPaint() {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        loadQuoteRuntime().catch(() => {});
      });
    });
  }

  function boot() {
    perfMark("FORGE_BOOT_START");
    globalThis.addEventListener(
      "change",
      onFileChangeCapture,
      true,
    );

    globalThis.addEventListener(
      "forge:saas-module-opened",
      (event) => {
        if (event.detail?.module !== MODULE_KEY) return;
        loadQuoteRuntimeAfterPaint();
      },
    );

    globalThis.addEventListener(
      "popstate",
      () => {
        if (requestedKey() === MODULE_KEY) {
          loadQuoteRuntime().catch(() => {});
        }
      },
    );

    loadDesktopRuntime().catch((error) => {
      console.error(
        "[Forge lazy desktop runtime]",
        error,
      );
    });

    if (requestedKey() === MODULE_KEY) {
      loadQuoteRuntime().catch(() => {});
    } else {
      perfMark("FORGE_HOME_READY");
      perfMeasure(
        "BOOT_MS",
        "FORGE_BOOT_START",
        "FORGE_HOME_READY",
      );
    }

    /*
     * Navigation visuals are deliberately owned by
     * ForgeMobileNavInstantAuthorityR16J1C1.
     * This lazy loader never measures or moves the selector on route taps.
     */
    globalThis.ForgeRuntimeLazyLoaderR16J1C1 =
      Object.freeze({
        version: VERSION,
        loadQuoteShell,
        loadQuoteRuntime,
        loadDesktopRuntime,
        syncSelector,
        syncSelectorStable,
        getState() {
          return Object.freeze({
            quoteRuntime:
              document.body.dataset
                .forgeQuoteRuntimeStateR16j1c1 ||
              "idle",
            quoteRuntimeLoadCount,
            quoteScripts: QUOTE_SCRIPTS.length,
            quoteStyles: QUOTE_STYLES.length,
            desktopScripts: DESKTOP_SCRIPTS.length,
            activeKey: requestedKey(),
            automaticCalculation: true, automaticAcceptance: false,
          });
        },
      });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot, { once: true });
  } else {
    boot();
  }
})();
