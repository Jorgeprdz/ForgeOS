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
    stylesheet.href = new URL("./quotes-module.css?v=ui-m05-004", import.meta.url);
    stylesheet.dataset.forgeQuotesStyles = "true";
    stylesheet.addEventListener("load", resolve, { once: true });
    stylesheet.addEventListener("error", reject, { once: true });
    document.head.append(stylesheet);
  });
  return stylePromise;
}

async function materializeRuntime(root, host) {
  if (runtimePromise) return runtimePromise;
  runtimePromise = (async () => {
    const sourceUrl = new URL(
      import.meta.url.includes("/docs/static-preview/")
        ? "../forge-alive/nueva-cotizacion/index.html"
        : "../forge-alive-runtime/nueva-cotizacion/index.html",
      import.meta.url,
    );
    const response = await fetch(sourceUrl);
    if (!response.ok) throw new Error(`Quotes source unavailable: ${response.status}`);
    const source = await response.text();
    const documentSource = new DOMParser().parseFromString(source, "text/html");
    const functionalModule = documentSource.querySelector(
      '[data-forge-module="dedicated-new-quote-static-route"]',
    );
    if (!functionalModule) throw new Error("Functional Quotes runtime boundary missing");

    functionalModule.querySelector(".fq-top-105dr")?.remove();

    const importedRuntime = document.importNode(
      functionalModule,
      true,
    );

    host.replaceChildren(importedRuntime);

    const syncIntakeState = (state) => {
      const normalized = String(state || "empty")
        .trim()
        .toLowerCase();

      root.dataset.intakeState = normalized;
    };

    syncIntakeState(
      importedRuntime.dataset.forgeIntakeState,
    );

    importedRuntime.addEventListener(
      "forge:quote-intake-state-change",
      (event) => {
        syncIntakeState(event.detail?.state);
      },
    );

    for (const script of documentSource.querySelectorAll("script")) {
      if (script.src.includes("forge-alive-mobile-nav-r16c5j")) continue;
      const executable = document.createElement("script");
      if (script.src) executable.src = resolveUrl(script.getAttribute("src"), sourceUrl);
      else executable.textContent = script.textContent;
      if (script.type) executable.type = script.type;
      executable.dataset.forgeQuotesRuntime = "true";
      document.body.append(executable);
      if (script.src && script.type !== "module") {
        await new Promise((resolve, reject) => {
          executable.addEventListener("load", resolve, { once: true });
          executable.addEventListener("error", reject, { once: true });
        });
      }
    }
    root.dataset.runtimeMounted = "true";
    window.dispatchEvent(new CustomEvent("forge:quotes-module-ready"));
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
          <div data-forge-quotes-runtime-host>
            <div class="quotes-module__loading" role="status">Preparando el workspace funcional…</div>
          </div>
        `;
        try {
          await ensureQuotesStyles();
          await materializeRuntime(
            root,
            root.querySelector("[data-forge-quotes-runtime-host]"),
          );
        } catch (error) {
          root.innerHTML = `<div class="quotes-module__error" role="alert">
            No pudimos preparar Cotizaciones. ${error.message}
          </div>`;
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
