import { createQuoteRuntimeAdapter } from "./quote-runtime-adapter.js?v=ui-m05d-002";

const quotesStateKey = Symbol.for("forge.ui-m05b.quotes.state");
let stylePromise;

function ensureQuotesStyles() {
  if (stylePromise) return stylePromise;
  stylePromise = new Promise((resolve, reject) => {
    const existing = document.querySelector("[data-forge-quotes-styles]");
    if (existing?.sheet) return resolve();
    const stylesheet = existing || document.createElement("link");
    stylesheet.rel = "stylesheet";
    stylesheet.href = new URL("./quotes-module.css?v=ui-m05d-002", import.meta.url);
    stylesheet.dataset.forgeQuotesStyles = "true";
    stylesheet.addEventListener("load", resolve, { once: true });
    stylesheet.addEventListener("error", reject, { once: true });
    if (!existing) document.head.append(stylesheet);
  });
  return stylePromise;
}

function quotesWorkspaceMarkup() {
  return `
    <header class="quotes-hero">
      <div class="quotes-hero__copy">
        <p class="quotes-eyebrow">COTIZACIONES</p>
        <h1>Convierte una cotización en una decisión clara</h1>
        <p>Procesa el archivo localmente, revisa los datos extraídos y conserva
          la aprobación final antes de presentar.</p>
      </div>
      <div class="quotes-hero__signals" aria-label="Condiciones del workspace">
        <span>Procesamiento local</span>
        <span>Revisión humana</span>
      </div>
    </header>

    <div class="quotes-workspace">
      <section class="quotes-intake fq-upload-105dr" aria-labelledby="quotes-intake-title">
        <div class="quotes-section-heading">
          <span class="quotes-step">01</span>
          <div>
            <span class="quotes-kicker">ARCHIVO DE ORIGEN</span>
            <h2 id="quotes-intake-title">Carga tu cotización</h2>
            <p>PDF de Solución Online o JSON extraído. El archivo no se publica.</p>
          </div>
        </div>
        <div class="quotes-dropzone">
          <div class="quotes-file-icon" aria-hidden="true">↥</div>
          <div class="quotes-file-copy">
            <strong>Selecciona el archivo para comenzar</strong>
            <span>PDF o JSON · procesamiento en este navegador</span>
          </div>
          <label class="quotes-button quotes-button--tonal" for="fq-solution-online-pdf-105dr">
            Seleccionar archivo
          </label>
          <input id="fq-solution-online-pdf-105dr" class="quotes-file-input"
            type="file" accept=".json,application/json,.pdf,application/pdf"
            data-forge-local-file-picker-only="true">
        </div>
        <div class="quotes-intake__status">
          <span class="quotes-status-dot" aria-hidden="true"></span>
          <p class="fq-file-status-105dr" role="status" aria-live="polite">
            Selecciona un archivo para comenzar.
          </p>
        </div>
        <button class="quotes-button quotes-button--primary fq-send-pdf-105dr"
          type="button" disabled hidden aria-disabled="true" aria-hidden="true">
          Revisar resultado
        </button>
      </section>

      <div class="quotes-results" data-forge-intake-results hidden aria-hidden="true">
        <section class="quotes-card quotes-card--details" aria-labelledby="quotes-context-title">
          <div class="quotes-section-heading">
            <span class="quotes-step">02</span>
            <div>
              <span class="quotes-kicker">CONTEXTO</span>
              <h2 id="quotes-context-title">Cliente y propósito</h2>
            </div>
          </div>
          <div class="quotes-form-grid">
            <label class="quotes-field">
              <span>Cliente</span>
              <input id="fq-client-105dr" data-quote-input="client" type="text"
                autocomplete="off" placeholder="Nombre detectado o capturado">
              <small>Editable localmente; no escribe CRM.</small>
            </label>
            <label class="quotes-field">
              <span>Familia de producto</span>
              <input id="fq-product-family-105dr" data-quote-input="family"
                type="text" autocomplete="off" placeholder="Producto detectado">
              <small>Proviene del archivo y de Product Intelligence autorizado.</small>
            </label>
            <label class="quotes-field quotes-field--wide">
              <span>Contexto del cliente o prospecto</span>
              <textarea id="fq-objective-105dr" data-quote-input="objective"
                placeholder="Necesidad, objeción u objetivo comercial"></textarea>
            </label>
            <label class="quotes-field">
              <span>Intención de venta</span>
              <input id="fq-intent-105dr" data-quote-input="intent" type="text"
                autocomplete="off" placeholder="Protección, retiro, educación…">
            </label>
          </div>
        </section>

        <section class="quotes-card quotes-card--summary" aria-labelledby="quotes-summary-title">
          <div class="quotes-section-heading">
            <span class="quotes-step">03</span>
            <div>
              <span class="quotes-kicker">RESULTADO</span>
              <h2 id="quotes-summary-title">Resumen de la cotización</h2>
            </div>
          </div>
          <div class="quotes-result-grid" data-quote-result-grid>
            <article class="quotes-result quotes-result--feature">
              <span>Producto y plan</span>
              <strong data-quote-result="product">Pendiente</strong>
              <small data-quote-result="plan">Se completa desde el archivo</small>
            </article>
            <article class="quotes-result">
              <span>Suma asegurada</span>
              <strong data-quote-result="sumAssured">—</strong>
            </article>
            <article class="quotes-result quotes-result--gold">
              <span>Prima anual</span>
              <strong data-quote-result="annualPremium">—</strong>
            </article>
            <article class="quotes-result">
              <span>Moneda y vigencia</span>
              <strong data-quote-result="currencyTerm">—</strong>
            </article>
            <article class="quotes-result">
              <span>Total aportado</span>
              <strong data-quote-result="totalContributed">—</strong>
            </article>
            <article class="quotes-result">
              <span>Total recuperación</span>
              <strong data-quote-result="totalRecovery">—</strong>
            </article>
          </div>
          <div class="quotes-runtime-sections">
            <section data-quote-generic-results aria-labelledby="quotes-benefits-title">
              <h3 id="quotes-benefits-title">Valores, beneficios o escenarios relevantes</h3>
              <div data-quote-runtime-grid="benefits">
                <p class="quotes-empty">El resultado aparecerá después del cálculo.</p>
              </div>
            </section>
            <section aria-labelledby="quotes-missing-title">
              <h3 id="quotes-missing-title">Faltantes antes de presentar</h3>
              <div data-quote-runtime-grid="missing">
                <p class="quotes-empty">Forge señalará únicamente los datos faltantes.</p>
              </div>
            </section>
          </div>
          <section class="quotes-intelligence" data-quote-product-dashboard
            aria-label="Inteligencia completa del producto"></section>
        </section>

        <aside class="quotes-decision" aria-label="Estado y acciones">
          <section class="quotes-card quotes-card--status">
            <p class="quotes-kicker">READINESS</p>
            <h2>Decisión segura</h2>
            <div class="quotes-readiness" data-quote-readiness data-forge-state="pending">
              <span class="quotes-status-orb" aria-hidden="true"></span>
              <strong>Revisa el archivo para continuar</strong>
            </div>
            <p>Forge calcula; tú confirmas. Ninguna acción modifica CRM o persistencia.</p>
          </section>
          <section class="quotes-card quotes-card--actions" data-forge-actions-panel="true">
            <h2>Preview y aprobación</h2>
            <p>El cálculo automático permanece preliminar hasta tu confirmación.</p>
            <button class="quotes-button quotes-button--primary"
              data-quote-action="confirm" type="button" disabled>
              Confirmar cotización revisada
            </button>
            <button class="quotes-button quotes-button--tonal"
              data-forge-sales-presentation-entrypoint-r16j0="true"
              aria-describedby="forge-sales-presentation-status-r16j0"
              type="button" disabled>
              Abrir editor de presentación
            </button>
            <p id="forge-sales-presentation-status-r16j0"
              data-forge-sales-presentation-entrypoint-status-r16j0="true"
              aria-live="polite">Confirma primero una cotización.</p>
          </section>
        </aside>
      </div>
    </div>
  `;
}

export function createQuotesModule({ root, shell }) {
  if (root[quotesStateKey]) return root[quotesStateKey];
  let mounted = false;
  let runtime = null;

  const api = Object.freeze({
    id: "quotes",
    root,
    async mount() {
      root.hidden = false;
      root.dataset.moduleActive = "true";
      root.dataset.forgeModule = "dedicated-new-quote-static-route";
      if (!mounted) {
        mounted = true;
        root.innerHTML = quotesWorkspaceMarkup();
        try {
          await ensureQuotesStyles();
          runtime = createQuoteRuntimeAdapter({ root });
          await runtime.initialize();
          root.dataset.runtimeMounted = "true";
        } catch (error) {
          root.innerHTML = `<div class="quotes-error" role="alert">
            <strong>No pudimos preparar Cotizaciones.</strong>
            <span>${error.message}</span>
          </div>`;
          root.dataset.runtimeError = "true";
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
    getRuntime: () => runtime,
  });
  root[quotesStateKey] = api;
  return api;
}
