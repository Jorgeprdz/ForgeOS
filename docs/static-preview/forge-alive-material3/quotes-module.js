import { reconcileQuoteResult } from "./quotes-result-adapter.js?v=quote-calculator-parity-001";

const quotesStateKey = Symbol.for("forge.ui-m05.quotes.state");
let runtimePromise;
let stylePromise;

function resolveUrl(value, sourceUrl) {
  return new URL(value, sourceUrl).href;
}

function ensureQuotesStyles() {
  if (stylePromise) return stylePromise;
  stylePromise = new Promise((resolve, reject) => {
    const existing = document.querySelector("[data-forge-quotes-styles]");
    if (existing) {
      if (existing.sheet) resolve();
      else {
        existing.addEventListener("load", resolve, { once: true });
        existing.addEventListener("error", reject, { once: true });
      }
      return;
    }
    const stylesheet = document.createElement("link");
    stylesheet.rel = "stylesheet";
    stylesheet.href = new URL(
      "./quotes-module.css?v=ui-m05-008",
      import.meta.url,
    );
    stylesheet.dataset.forgeQuotesStyles = "true";
    stylesheet.addEventListener("load", resolve, { once: true });
    stylesheet.addEventListener("error", reject, { once: true });
    document.head.append(stylesheet);
  });
  return stylePromise;
}

async function materializeRuntime(root, engineHost, surface) {
  if (runtimePromise) return runtimePromise;
  runtimePromise = (async () => {
    const sourceUrl = new URL(
      import.meta.url.includes("/docs/static-preview/")
        ? "../forge-alive/nueva-cotizacion/index.html"
        : "../forge-alive-runtime/nueva-cotizacion/index.html",
      import.meta.url,
    );
    const response = await fetch(sourceUrl);
    if (!response.ok) {
      throw new Error(`Quotes source unavailable: ${response.status}`);
    }

    const source = await response.text();
    const documentSource = new DOMParser().parseFromString(
      source,
      "text/html",
    );
    const functionalModule = documentSource.querySelector(
      '[data-forge-module="dedicated-new-quote-static-route"]',
    );
    if (!functionalModule) {
      throw new Error("Functional Quotes runtime boundary missing");
    }

    functionalModule.querySelector(".fq-top-105dr")?.remove();

    const importedRuntime = document.importNode(
      functionalModule,
      true,
    );
    importedRuntime.dataset.material3QuotesEngine = "true";
    engineHost.replaceChildren(importedRuntime);

    const input = importedRuntime.querySelector(
      "#fq-solution-online-pdf-105dr",
    );
    const sourceStatus = importedRuntime.querySelector(
      ".fq-file-status-105dr",
    );
    const projection = surface.querySelector(
      "[data-material3-quotes-projection]",
    );
    const selectButton = surface.querySelector(
      "[data-material3-select-quote]",
    );
    const selectedFile = surface.querySelector(
      "[data-material3-selected-file]",
    );
    const visibleStatus = surface.querySelector(
      "[data-material3-quotes-status]",
    );

    if (!input || !projection || !selectButton || !visibleStatus) {
      throw new Error("Material 3 Quotes bridge boundary missing");
    }

    const syncStatus = () => {
      const message = sourceStatus?.textContent?.trim();
      if (message) visibleStatus.textContent = message;
    };

    const syncIntakeState = (state) => {
      const normalized = String(state || "empty")
        .trim()
        .toLowerCase();

      root.dataset.intakeState = normalized;
      syncStatus();

      if (["candidate_ready", "calculating", "ready"].includes(normalized)) {
        queueMicrotask(() => reconcileQuoteResult({
          bridge: globalThis.ForgeAcceptedQuoteBridge,
          projection,
          root,
        }));
      }
    };

    syncIntakeState(importedRuntime.dataset.forgeIntakeState);

    importedRuntime.addEventListener(
      "forge:quote-intake-state-change",
      (event) => {
        syncIntakeState(event.detail?.state);
      },
    );

    selectButton.addEventListener("click", () => {
      input.click();
    });

    input.addEventListener("change", () => {
      const file = input.files?.[0];
      selectedFile.textContent =
        file?.name || "Sin archivo seleccionado";
      projection.hidden = true;
      projection.replaceChildren();
      delete projection.dataset.material3QuoteProjectionReady;
      delete root.dataset.quoteProjectionReady;
    });

    const refreshProjection = () => {
      syncStatus();
      return reconcileQuoteResult({
        bridge: globalThis.ForgeAcceptedQuoteBridge,
        projection,
        root,
      });
    };

    const observer = new MutationObserver(() => {
      window.clearTimeout(observer.refreshTimer);
      observer.refreshTimer = window.setTimeout(
        refreshProjection,
        80,
      );
    });

    observer.observe(importedRuntime, {
      childList: true,
      subtree: true,
      characterData: true,
      attributes: true,
      attributeFilter: ["hidden", "data-forge-state"],
    });

    for (const eventName of [
      "forge:quote-preview-calculated",
      "forge:accepted-quote-confirmed",
      "forge:quote-candidate-ready",
      "forge:segubeca-productive-calculation-ready",
      "forge:segubeca-productive-quote-confirmed",
    ]) {
      window.addEventListener(eventName, () => {
        window.setTimeout(() => void refreshProjection(), 120);
      });
    }

    for (const script of documentSource.querySelectorAll("script")) {
      if (
        script.src.includes("forge-alive-mobile-nav-r16c5j")
      ) {
        continue;
      }

      const executable = document.createElement("script");
      if (script.src) {
        executable.src = resolveUrl(
          script.getAttribute("src"),
          sourceUrl,
        );
      } else {
        executable.textContent = script.textContent;
      }
      if (script.type) executable.type = script.type;
      executable.dataset.forgeQuotesRuntime = "true";
      document.body.append(executable);

      if (script.src && script.type !== "module") {
        await new Promise((resolve, reject) => {
          executable.addEventListener("load", resolve, {
            once: true,
          });
          executable.addEventListener("error", reject, {
            once: true,
          });
        });
      }
    }

    await import(
      "./segubeca-productive-ui-binding.js?v=segubeca-productive-ui-001-4"
    );
    globalThis.ForgeSegubecaProductiveUiBinding?.install?.();

    await refreshProjection();
    root.dataset.runtimeMounted = "true";
    window.dispatchEvent(
      new CustomEvent("forge:quotes-module-ready"),
    );
  })();

  return runtimePromise;
}

export function createQuotesModule({ root, shell }) {
  if (root[quotesStateKey]) return root[quotesStateKey];
  let mounted = false;

  const api = Object.freeze({
    id: "quotes",
    root,
    async mount() {
      root.hidden = false;
      root.dataset.moduleActive = "true";

      if (!mounted) {
        mounted = true;
        root.dataset.intakeState = "empty";
        root.innerHTML = `
          <header class="quotes-module__header">
            <p>COTIZACIONES</p>
            <h1>Prepara una cotización clara</h1>
            <span>Procesamiento local · revisión humana</span>
          </header>

          <section
            class="quotes-module__upload"
            aria-labelledby="material3-quotes-upload-title"
          >
            <p class="quotes-module__kicker">CARGA LOCAL</p>
            <h2 id="material3-quotes-upload-title">
              Carga tu cotización
            </h2>
            <p>
              Selecciona el PDF de Solución Online. Se procesa
              localmente en tu navegador.
            </p>

            <div class="quotes-module__upload-controls">
              <button
                type="button"
                data-material3-select-quote
              >
                Seleccionar PDF
              </button>
              <span data-material3-selected-file>
                Sin archivo seleccionado
              </span>
            </div>

            <p
              class="quotes-module__status"
              data-material3-quotes-status
              role="status"
            >
              Selecciona un archivo para comenzar.
            </p>
          </section>

          <section
            class="quotes-module__projection"
            data-forge-intake-results
            data-material3-quotes-projection
            aria-label="Resultado de la cotización"
            hidden
          ></section>

          <div
            class="quotes-module__engine"
            data-forge-quotes-engine
            aria-hidden="true"
          ></div>
        `;

        try {
          await ensureQuotesStyles();
          await materializeRuntime(
            root,
            root.querySelector("[data-forge-quotes-engine]"),
            root,
          );
        } catch (error) {
          root.innerHTML = `
            <div class="quotes-module__error" role="alert">
              No pudimos preparar Cotizaciones. ${error.message}
            </div>
          `;
        }
      }

      shell.syncVisualViewport();
    },
    reconcile() {
      root.hidden = false;
      root.dataset.moduleActive = "true";
    },
    unmount() {
      root.hidden = true;
      root.dataset.moduleActive = "false";
    },
  });

  root[quotesStateKey] = api;
  return api;
}
