import { createQuotesProductiveAdapter } from "./quotes-adapter.js";

const PRODUCT_OPTIONS = Object.freeze([
  ["", "Detectar desde la cotización"],
  ["imagina_ser", "Imagina Ser"],
  ["vida_mujer", "Vida Mujer"],
  ["segubeca", "SeguBeca"],
  ["orvi", "ORVI"],
  ["alfa_medical_flex", "Alfa Medical Flex"],
]);

const STATE_COPY = Object.freeze({
  EMPTY: ["Nueva cotización", "Carga un PDF para comenzar."],
  LOADING: ["Calculando cotización", "Forge está procesando la evidencia disponible."],
  READY: ["Cotización calculada", "Revisa la propuesta antes de confirmar."],
  PARTIAL: ["Cotización calculada con información pendiente", "Hay información que conviene revisar antes de confirmar."],
  ACCEPTED: ["Cotización confirmada", "La revisión humana quedó registrada para esta cotización."],
  ERROR: ["No se pudo calcular la cotización", "Revisa el archivo e inténtalo nuevamente."],
  UNAVAILABLE: ["Cotización no disponible", "La autoridad productiva necesaria no está disponible en este momento."],
});

const TABS = Object.freeze([
  ["summary", "Resumen"],
  ["benefits", "Beneficios"],
  ["projection", "Proyección"],
  ["evidence", "Evidencia"],
]);

function esc(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function normalized(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

function humanizeKey(value) {
  return String(value || "")
    .replace(/[_-]+/g, " ")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/^./, character => character.toUpperCase());
}

function compactValue(value) {
  if (value === null || value === undefined || value === "") return null;
  if (typeof value === "string" || typeof value === "number") return String(value);
  if (typeof value === "boolean") return value ? "Sí" : "No";
  if (Array.isArray(value)) {
    const visible = value.map(compactValue).filter(Boolean).slice(0, 6);
    return visible.length ? visible.join(" · ") : null;
  }
  if (typeof value === "object") {
    const visible = Object.entries(value)
      .map(([key, item]) => [humanizeKey(key), compactValue(item)])
      .filter(([, item]) => item)
      .slice(0, 6);
    return visible.length ? visible.map(([key, item]) => `${key}: ${item}`).join(" · ") : null;
  }
  return String(value);
}

function factsMarkup(facts, emptyCopy = "No hay información confirmada para mostrar en esta sección.") {
  const visible = (facts || []).filter(fact => compactValue(fact?.display ?? fact?.value));
  if (!visible.length) return `<p class="aura-quotes__empty-copy">${esc(emptyCopy)}</p>`;
  return `<dl class="aura-quotes__facts">${visible.map(fact => `
    <div>
      <dt>${esc(fact.label || humanizeKey(fact.id))}</dt>
      <dd>${esc(compactValue(fact.display ?? fact.value))}</dd>
    </div>`).join("")}</dl>`;
}

function blockLines(block) {
  const lines = Array.isArray(block?.lines) ? block.lines : [];
  const visible = lines
    .map(line => ({ label: line.label || humanizeKey(line.id), value: compactValue(line.value ?? line.display ?? line.severity) }))
    .filter(line => line.value);
  if (!visible.length) return "";
  return `<dl class="aura-quotes__facts aura-quotes__facts--compact">${visible.map(line => `
    <div><dt>${esc(line.label)}</dt><dd>${esc(line.value)}</dd></div>`).join("")}</dl>`;
}

function scenarioMarkup(block, { evidence = false } = {}) {
  const scenarios = Array.isArray(block?.scenarios) ? block.scenarios : [];
  if (!scenarios.length) return "";
  return `<div class="aura-quotes__scenario-list">${scenarios.map(scenario => {
    const value = compactValue(scenario.singlePayment ?? scenario.monthlyIncome ?? scenario.annualIncome);
    if (!value) return "";
    return `<article class="aura-quotes__scenario">
      <div><span>${esc(scenario.label || humanizeKey(scenario.id))}</span><strong>${esc(value)}</strong></div>
      <dl>
        ${scenario.targetAge ? `<div><dt>Horizonte</dt><dd>Edad ${esc(scenario.targetAge)}</dd></div>` : ""}
        <div><dt>Tipo de verdad</dt><dd>PROJECTION</dd></div>
        ${evidence ? `<div><dt>Fuente</dt><dd>Motor productivo existente</dd></div>` : ""}
      </dl>
    </article>`;
  }).join("")}</div>`;
}

function missingInformation(viewModel) {
  const fromBlocks = (viewModel?.benefitBlocks || [])
    .filter(block => block?.type === "missing_information")
    .flatMap(block => (block.lines || []).map(line => line.label || line.id).filter(Boolean));
  const fromIntelligence = viewModel?.intelligence?.missing || [];
  return [...new Set([...fromBlocks, ...fromIntelligence].map(String).filter(Boolean))];
}

function productMismatch(expected, actualFamily) {
  if (!expected || !actualFamily || actualFamily === "unknown") return false;
  return normalized(expected) !== normalized(actualFamily);
}

function primaryFact(viewModel) {
  const facts = viewModel?.contractual || [];
  return facts.find(fact => fact.id === "annual_premium")
    || facts.find(fact => fact.id === "sum_assured")
    || facts[0]
    || null;
}

function clientContext(viewModel) {
  const client = (viewModel?.contractual || []).find(fact => fact.id === "client");
  return compactValue(client?.display ?? client?.value);
}

function persistenceMessage(receipt) {
  if (!receipt) return "Confirmada en esta sesión.";
  if (receipt.durable === true) return "Confirmada y vinculada al historial productivo.";
  if (receipt.status === "BLOCKED_IDENTITY_REQUIRED") return "Confirmada en esta sesión. Ábrela desde un Prospect para guardarla en su historial.";
  if (receipt.status === "LOCAL_REVIEW_ONLY") return receipt.message || "Confirmada localmente; la continuidad durable no está disponible.";
  return receipt.message || "Confirmada; la continuidad durable quedó pendiente.";
}

function attentionItems(viewModel, expectedProduct) {
  const items = [];
  const missing = missingInformation(viewModel);
  if (productMismatch(expectedProduct, viewModel?.family)) {
    items.push({
      tone: "warning",
      title: "Producto distinto al esperado",
      why: `El archivo fue identificado como ${viewModel?.product || "otro producto"}. La selección manual no reemplazó la identidad detectada en la cotización.`,
      action: "Revisar evidencia",
    });
  }
  if (missing.length) {
    items.push({
      tone: "warning",
      title: "Información pendiente",
      why: `${missing.slice(0, 4).join(" · ")}${missing.length > 4 ? " · …" : ""}. La ausencia permanece visible y no se convirtió en cero.`,
      action: "Revisar evidencia",
    });
  }
  if (viewModel && !viewModel.economicEvidence?.available) {
    items.push({
      tone: "info",
      title: "Referencia económica no disponible",
      why: "Forge conserva los importes respaldados y no sustituye la referencia faltante con un valor inventado.",
      action: "Ver evidencia",
    });
  }
  return items.slice(0, 3);
}

function intelligenceMarkup(model) {
  if (!model) return `<p class="aura-quotes__empty-copy">Este archivo no publicó información adicional de producto para esta vista.</p>`;
  const rows = [
    ["Objetivo", model.objective],
    ["Estructura", model.structure],
    ["Componentes", model.components],
    ["Restricciones", model.restrictions],
    ["Observaciones", model.notes],
  ].map(([label, value]) => [label, compactValue(value)]).filter(([, value]) => value);
  if (!rows.length) return `<p class="aura-quotes__empty-copy">No hay atributos adicionales confirmados para mostrar.</p>`;
  return `<dl class="aura-quotes__facts">${rows.map(([label, value]) => `<div><dt>${esc(label)}</dt><dd>${esc(value)}</dd></div>`).join("")}</dl>`;
}

function benefitsMarkup(viewModel) {
  const blocks = (viewModel?.benefitBlocks || []).filter(block => block?.type !== "missing_information");
  const intelligence = intelligenceMarkup(viewModel?.intelligence);
  const blockMarkup = blocks.length
    ? `<div class="aura-quotes__benefit-list">${blocks.map(block => `
      <section class="aura-quotes__benefit-group">
        <h3>${esc(block.title || humanizeKey(block.type))}</h3>
        ${blockLines(block)}
        ${scenarioMarkup(block)}
      </section>`).join("")}</div>`
    : `<p class="aura-quotes__empty-copy">El producto no publicó bloques adicionales para esta cotización.</p>`;
  return `<div class="aura-quotes__stack"><section><h3>Información del producto</h3>${intelligence}</section>${blockMarkup}</div>`;
}

function projectionMarkup(viewModel) {
  const projected = viewModel?.projected || [];
  const scenarioBlocks = (viewModel?.benefitBlocks || []).filter(block => Array.isArray(block?.scenarios) && block.scenarios.length);
  const hasProjection = projected.length || scenarioBlocks.length;
  return `<div class="aura-quotes__stack">
    <div class="aura-quotes__projection-note" role="note">
      <strong>Proyección / estimación.</strong>
      <span>No constituye garantía contractual.</span>
    </div>
    ${hasProjection ? `
      <section>
        <h3>Escenarios publicados</h3>
        ${factsMarkup(projected, "")}
        ${scenarioBlocks.map(block => scenarioMarkup(block, { evidence: true })).join("")}
        <dl class="aura-quotes__evidence-meta">
          <div><dt>Tipo de verdad</dt><dd>PROJECTION / ESTIMATE / SCENARIO</dd></div>
          <div><dt>Fuente</dt><dd>Motores productivos existentes de Cotizaciones</dd></div>
        </dl>
      </section>` : `<p class="aura-quotes__empty-copy">Esta cotización no publicó una proyección disponible para presentar.</p>`}
  </div>`;
}

function economicEvidenceMarkup(evidence) {
  if (!evidence?.available) {
    return `<div class="aura-quotes__evidence-state" data-tone="warning"><strong>UNAVAILABLE</strong><span>No existe una referencia económica disponible para esta cotización. No se creó un valor sustituto.</span></div>`;
  }
  const rows = [
    ["Valor utilizado", evidence.value],
    ["Fecha de referencia", evidence.asOf],
    ["Fuente", evidence.source],
    ["Estado", evidence.status],
  ].map(([label, value]) => [label, compactValue(value)]).filter(([, value]) => value);
  return `<dl class="aura-quotes__facts">${rows.map(([label, value]) => `<div><dt>${esc(label)}</dt><dd>${esc(value)}</dd></div>`).join("")}</dl>`;
}

function evidenceMarkup(viewModel, accepted, lifecycleReceipt) {
  const missing = missingInformation(viewModel);
  return `<div class="aura-quotes__stack">
    <section>
      <h3>Provenance</h3>
      <dl class="aura-quotes__evidence-meta">
        <div><dt>Archivo fuente</dt><dd>${esc(viewModel?.sourceFile || "No publicado por el runtime")}</dd></div>
        <div><dt>Fuente del paquete</dt><dd>${esc(compactValue(viewModel?.source) || "No publicada")}</dd></div>
        <div><dt>Revisión humana</dt><dd>${accepted ? "Confirmada" : "Pendiente"}</dd></div>
        ${accepted ? `<div><dt>Persistencia / lifecycle</dt><dd>${esc(persistenceMessage(lifecycleReceipt))}</dd></div>` : ""}
      </dl>
    </section>
    <section>
      <h3>Verdad contractual</h3>
      ${factsMarkup(viewModel?.contractual, "No hay campos contractuales publicables en esta cotización.")}
    </section>
    <section>
      <h3>Referencia económica</h3>
      ${economicEvidenceMarkup(viewModel?.economicEvidence)}
      ${factsMarkup(viewModel?.current, "No hay equivalencias actuales confirmadas para este producto.")}
    </section>
    <section>
      <h3>Campos pendientes</h3>
      ${missing.length ? `<ul class="aura-quotes__missing-list">${missing.map(item => `<li>${esc(item)}</li>`).join("")}</ul>` : `<p class="aura-quotes__empty-copy">No hay faltantes publicados por Product Intelligence para esta cotización.</p>`}
    </section>
    <section>
      <h3>Clasificación de verdad</h3>
      <dl class="aura-quotes__evidence-meta">
        <div><dt>Documento / Accepted Quote</dt><dd>EVIDENCE_PACKET / quote-specific facts</dd></div>
        <div><dt>Beneficios de producto</dt><dd>PRODUCT_TRUTH consumido; no redefinido por frontend</dd></div>
        <div><dt>Proyección</dt><dd>FORECAST / DECISION_SUPPORT</dd></div>
        <div><dt>Decisión</dt><dd>HUMAN_DECISION requerida para confirmar</dd></div>
      </dl>
    </section>
  </div>`;
}

export function createQuotesModule({ root, client, globalState, adapterFactory = createQuotesProductiveAdapter } = {}) {
  if (!root) throw new Error("AURA_QUOTES_ROOT_REQUIRED");
  const adapter = adapterFactory({ client });
  let status = "EMPTY";
  let errorMessage = "";
  let busyAction = "";
  let expectedProduct = "";
  let printablePreview = null;
  let selectedTab = "summary";

  const current = () => adapter.state();

  function stateHeader() {
    const copy = STATE_COPY[status] || STATE_COPY.EMPTY;
    return `<div class="aura-quotes__state" data-state="${esc(status)}" role="status" aria-live="polite">
      <span class="aura-quotes__state-dot" aria-hidden="true"></span>
      <div><strong>${esc(copy[0])}</strong><small>${esc(errorMessage || copy[1])}</small></div>
    </div>`;
  }

  function topBar(viewModel) {
    const context = clientContext(viewModel);
    return `<header class="aura-quotes__topbar" aria-label="Cotizaciones">
      <div class="aura-quotes__topbar-title">
        <span class="aura-quotes__eyebrow">Forge Aura</span>
        <div><h1>Cotizaciones</h1>${context ? `<p>${esc(context)}</p>` : ""}</div>
      </div>
      <div class="aura-quotes__topbar-actions">
        ${status !== "EMPTY" ? stateHeader() : ""}
        <button type="button" class="aura-quotes__button aura-quotes__button--primary" data-quotes-action="new">+ Nueva cotización</button>
      </div>
    </header>`;
  }

  function intakeMarkup() {
    const failed = status === "ERROR" || status === "UNAVAILABLE";
    const copy = STATE_COPY[status] || STATE_COPY.EMPTY;
    return `<section class="aura-quotes__empty" aria-labelledby="quotes-empty-title">
      <div class="aura-quotes__empty-copy-block">
        <span class="aura-quotes__eyebrow">${failed ? "Estado de cotización" : "Nueva cotización"}</span>
        <h2 id="quotes-empty-title">${failed ? esc(copy[0]) : "Convierte una cotización en una propuesta lista para presentar."}</h2>
        <p>${failed ? esc(errorMessage || copy[1]) : "Sube el PDF. Forge reutiliza la detección, extracción, cálculo y evidencia existentes para construir una propuesta revisable."}</p>
      </div>
      <label class="aura-quotes__dropzone" data-quotes-dropzone>
        <input type="file" accept=".pdf,application/pdf,.json,application/json" data-quotes-file data-forge-pdf-owner="native" ${busyAction ? "disabled" : ""}>
        <span aria-hidden="true" class="aura-quotes__upload-mark">↑</span>
        <strong>${failed ? "Prueba con otro archivo" : "Arrastra el PDF aquí"}</strong>
        <span>o</span>
        <b>${busyAction === "load" ? "Procesando…" : "Seleccionar archivo"}</b>
        <small>PDF productivo. JSON se admite únicamente como paquete técnico compatible para pruebas gobernadas.</small>
      </label>
      <details class="aura-quotes__manual-product">
        <summary>Elegir producto manualmente</summary>
        <div>
          <label for="quotes-product">Producto esperado</label>
          <select id="quotes-product" data-quotes-product ${busyAction ? "disabled" : ""}>
            ${PRODUCT_OPTIONS.map(([value, label]) => `<option value="${value}" ${expectedProduct === value ? "selected" : ""}>${esc(label)}</option>`).join("")}
          </select>
          <p>Esta selección sólo permite advertir una inconsistencia. Nunca reemplaza la identidad que determine la evidencia procesada.</p>
        </div>
      </details>
    </section>`;
  }

  function loadingMarkup() {
    return `<section class="aura-quotes__processing" aria-labelledby="quotes-processing-title" aria-busy="true">
      <div><span class="aura-quotes__eyebrow">Proceso productivo</span><h2 id="quotes-processing-title">Calculando cotización</h2><p>Forge sólo muestra hitos que puede conocer desde este boundary. No se presentan porcentajes ficticios.</p></div>
      <ol aria-live="polite">
        <li data-progress="complete"><span>✓</span><div><strong>Archivo recibido</strong><small>El archivo fue entregado al runtime de Cotizaciones.</small></div></li>
        <li data-progress="active"><span>•</span><div><strong>Procesando evidencia y motores productivos</strong><small>La siguiente actualización aparecerá cuando exista un resultado real.</small></div></li>
      </ol>
    </section>`;
  }

  function attentionMarkup(viewModel) {
    const items = attentionItems(viewModel, expectedProduct);
    if (!items.length) return "";
    return `<section class="aura-quotes__attention" aria-labelledby="quotes-attention-title">
      <header><span class="aura-quotes__eyebrow">Requiere atención</span><h2 id="quotes-attention-title">Revisa antes de decidir</h2></header>
      <div>${items.map(item => `<article data-tone="${esc(item.tone)}">
        <div><strong>${esc(item.title)}</strong><p>${esc(item.why)}</p></div>
        <button type="button" class="aura-quotes__text-action" data-quotes-tab-jump="evidence">${esc(item.action)}</button>
      </article>`).join("")}</div>
    </section>`;
  }

  function tabsMarkup(viewModel, accepted, lifecycleReceipt) {
    const panel = selectedTab === "summary"
      ? factsMarkup(viewModel.contractual, "No hay campos contractuales publicables en esta cotización.")
      : selectedTab === "benefits"
        ? benefitsMarkup(viewModel)
        : selectedTab === "projection"
          ? projectionMarkup(viewModel)
          : evidenceMarkup(viewModel, accepted, lifecycleReceipt);
    return `<section class="aura-quotes__workspace" aria-label="Detalle de cotización">
      <div class="aura-quotes__tabs" role="tablist" aria-label="Contenido de la cotización">
        ${TABS.map(([id, label]) => `<button type="button" role="tab" id="quotes-tab-${id}" aria-controls="quotes-panel-${id}" aria-selected="${String(selectedTab === id)}" tabindex="${selectedTab === id ? "0" : "-1"}" data-quotes-tab="${id}">${label}</button>`).join("")}
      </div>
      <div class="aura-quotes__tabpanel" role="tabpanel" id="quotes-panel-${selectedTab}" aria-labelledby="quotes-tab-${selectedTab}" tabindex="0">${panel}</div>
    </section>`;
  }

  function resultMarkup(viewModel, accepted, lifecycleReceipt) {
    const primary = primaryFact(viewModel);
    return `<main class="aura-quotes__result">
      <section class="aura-quotes__hero" aria-labelledby="quotes-product-title">
        <div class="aura-quotes__hero-copy">
          <span class="aura-quotes__eyebrow">Producto identificado</span>
          <h2 id="quotes-product-title">${esc(viewModel.product || "Producto no confirmado")}</h2>
          ${primary ? `<div class="aura-quotes__hero-metric"><strong>${esc(compactValue(primary.display ?? primary.value))}</strong><span>${esc(primary.label)}</span></div>` : ""}
          <p>${viewModel.sourceFile ? `Fuente: ${esc(viewModel.sourceFile)}` : "La fuente del archivo no fue publicada por este runtime."}</p>
        </div>
        <div class="aura-quotes__hero-status" data-status="${accepted ? "accepted" : status.toLowerCase()}">
          <span aria-hidden="true"></span>
          <div><strong>${esc((STATE_COPY[status] || STATE_COPY.READY)[0])}</strong><small>${accepted ? "Decisión humana registrada" : "Todavía requiere revisión humana"}</small></div>
        </div>
      </section>
      ${attentionMarkup(viewModel)}
      ${tabsMarkup(viewModel, accepted, lifecycleReceipt)}
    </main>`;
  }

  function contextualCta(state) {
    if (!state.viewModel) return "";
    if (state.accepted) {
      return `<section class="aura-quotes__contextual-cta" aria-label="Acciones de cotización confirmada">
        <div><span>✓ Cotización confirmada</span><small>${esc(persistenceMessage(state.lifecycleReceipt))}</small></div>
        <div class="aura-quotes__cta-actions">
          <button type="button" class="aura-quotes__button" data-quotes-action="preview" ${busyAction ? "disabled" : ""}>${busyAction === "preview" ? "Preparando…" : "Ver PDF"}</button>
          <button type="button" class="aura-quotes__button" data-quotes-action="download" ${busyAction ? "disabled" : ""}>${busyAction === "download" ? "Generando…" : "Descargar PDF"}</button>
          <button type="button" class="aura-quotes__button aura-quotes__button--primary" data-quotes-action="presentation" ${busyAction ? "disabled" : ""}>Crear presentación</button>
        </div>
      </section>`;
    }
    const partial = status === "PARTIAL";
    return `<section class="aura-quotes__contextual-cta" aria-label="Siguiente decisión">
      <div><span>${partial ? "Información pendiente" : "Cotización calculada"}</span><small>${partial ? "Revisa los faltantes visibles antes de confirmar." : "La cotización aún no representa una decisión humana."}</small></div>
      <div class="aura-quotes__cta-actions">
        <button type="button" class="aura-quotes__button aura-quotes__button--primary" data-quotes-action="accept" ${!state.viewModel || busyAction ? "disabled" : ""}>${busyAction === "accept" ? "Confirmando…" : "Revisar y confirmar"}</button>
      </div>
    </section>`;
  }

  function previewModal() {
    if (!printablePreview) return "";
    return `<section class="aura-quotes__modal" data-quotes-preview-modal role="dialog" aria-modal="true" aria-labelledby="quotes-preview-title">
      <button type="button" class="aura-quotes__modal-scrim" data-quotes-action="close-preview" aria-label="Cerrar vista previa"></button>
      <div class="aura-quotes__modal-panel" data-quotes-modal-panel tabindex="-1">
        <header><div><span class="aura-quotes__eyebrow">Documento imprimible</span><h2 id="quotes-preview-title">Vista previa</h2></div><button type="button" class="aura-quotes__icon-button" data-quotes-action="close-preview" aria-label="Cerrar">×</button></header>
        <iframe title="Vista previa de la cotización" sandbox="" srcdoc="${esc(printablePreview.bundle.printableDocument.html)}"></iframe>
        <footer><span>${esc(printablePreview.bundle.pageFormat || "A4")} · ${esc(printablePreview.bundle.pdfPacket?.pageCount || "—")} página(s)</span><button type="button" class="aura-quotes__button aura-quotes__button--primary" data-quotes-action="download">Descargar PDF</button></footer>
      </div>
    </section>`;
  }

  function render() {
    const state = current();
    const viewModel = state.viewModel;
    const content = status === "LOADING"
      ? loadingMarkup()
      : viewModel
        ? resultMarkup(viewModel, state.accepted, state.lifecycleReceipt)
        : intakeMarkup();
    root.innerHTML = `<div class="aura-quotes" data-aura-quotes data-state="${esc(status)}">
      ${topBar(viewModel)}
      <div class="aura-quotes__live" role="status" aria-live="polite">${esc(errorMessage || (STATE_COPY[status] || STATE_COPY.EMPTY)[0])}</div>
      ${content}
      ${contextualCta(state)}
      <p class="aura-quotes__disclaimer">Forge presenta evidencia y proyecciones de autoridades existentes. La vista no reemplaza el documento contractual ni convierte una proyección en garantía.</p>
    </div>${previewModal()}`;
    bindDom();
    if (printablePreview) queueMicrotask(() => root.querySelector("[data-quotes-modal-panel]")?.focus());
  }

  async function run(action, operation) {
    busyAction = action;
    render();
    try {
      return await operation();
    } catch (error) {
      const message = error?.message || String(error);
      errorMessage = message;
      status = /no disponible|unavailable/i.test(message) ? "UNAVAILABLE" : "ERROR";
      globalState?.(message, "error");
      throw error;
    } finally {
      busyAction = "";
      render();
    }
  }

  async function processFile(file) {
    if (!file) return;
    status = "LOADING";
    errorMessage = "";
    selectedTab = "summary";
    busyAction = "load";
    render();
    try {
      const result = await adapter.loadFile(file);
      status = missingInformation(result.viewModel).length ? "PARTIAL" : "READY";
      globalState?.(status === "PARTIAL" ? "Cotización calculada con información pendiente. Revisa antes de confirmar." : "Cotización calculada. Revisa y confirma cuando estés listo.");
    } catch (error) {
      errorMessage = error?.message || String(error);
      status = /no disponible|unavailable/i.test(errorMessage) ? "UNAVAILABLE" : "ERROR";
      globalState?.(errorMessage, "error");
    } finally {
      busyAction = "";
      render();
    }
  }

  function resetQuote() {
    adapter.clear();
    printablePreview = null;
    expectedProduct = "";
    errorMessage = "";
    busyAction = "";
    selectedTab = "summary";
    status = "EMPTY";
    render();
    queueMicrotask(() => root.querySelector("[data-quotes-file]")?.focus());
  }

  function closePreview() {
    printablePreview = null;
    render();
    queueMicrotask(() => root.querySelector('[data-quotes-action="preview"]')?.focus({ preventScroll: true }));
  }

  function bindModalKeyboard() {
    const panel = root.querySelector("[data-quotes-modal-panel]");
    if (!panel) return;
    panel.addEventListener("keydown", event => {
      if (event.key === "Escape") {
        event.preventDefault();
        closePreview();
        return;
      }
      if (event.key !== "Tab") return;
      const focusable = [...panel.querySelectorAll("button:not(:disabled), iframe, [tabindex]:not([tabindex='-1'])")];
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    });
  }

  function bindTabs() {
    const tabButtons = [...root.querySelectorAll("[data-quotes-tab]")];
    tabButtons.forEach((button, index) => {
      button.addEventListener("click", () => {
        selectedTab = button.dataset.quotesTab;
        render();
        queueMicrotask(() => root.querySelector(`[data-quotes-tab="${selectedTab}"]`)?.focus());
      });
      button.addEventListener("keydown", event => {
        if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
        event.preventDefault();
        let target = index;
        if (event.key === "Home") target = 0;
        else if (event.key === "End") target = tabButtons.length - 1;
        else target = (index + (event.key === "ArrowRight" ? 1 : -1) + tabButtons.length) % tabButtons.length;
        selectedTab = tabButtons[target].dataset.quotesTab;
        render();
        queueMicrotask(() => root.querySelector(`[data-quotes-tab="${selectedTab}"]`)?.focus());
      });
    });
    root.querySelectorAll("[data-quotes-tab-jump]").forEach(button => button.addEventListener("click", () => {
      selectedTab = button.dataset.quotesTabJump;
      render();
      queueMicrotask(() => root.querySelector(`[data-quotes-tab="${selectedTab}"]`)?.focus());
    }));
  }

  function bindDom() {
    const fileInput = root.querySelector("[data-quotes-file]");
    const productSelect = root.querySelector("[data-quotes-product]");
    const dropzone = root.querySelector("[data-quotes-dropzone]");

    productSelect?.addEventListener("change", () => { expectedProduct = productSelect.value; });
    fileInput?.addEventListener("change", () => processFile(fileInput.files?.[0]));
    dropzone?.addEventListener("dragover", event => { event.preventDefault(); dropzone.dataset.dragging = "true"; });
    dropzone?.addEventListener("dragleave", () => { delete dropzone.dataset.dragging; });
    dropzone?.addEventListener("drop", event => {
      event.preventDefault();
      delete dropzone.dataset.dragging;
      processFile(event.dataTransfer?.files?.[0]);
    });

    bindTabs();
    bindModalKeyboard();

    root.querySelectorAll("[data-quotes-action]").forEach(button => {
      button.addEventListener("click", async () => {
        const action = button.dataset.quotesAction;
        if (action === "new") { resetQuote(); return; }
        if (action === "close-preview") { closePreview(); return; }
        if (action === "accept") {
          await run("accept", async () => {
            const result = await adapter.accept();
            status = "ACCEPTED";
            errorMessage = "";
            globalState?.(`Cotización confirmada. ${persistenceMessage(result.lifecycleReceipt)}`);
          }).catch(() => {});
          return;
        }
        if (action === "preview") {
          await run("preview", async () => { printablePreview = await adapter.previewPrintable("A4"); }).catch(() => {});
          return;
        }
        if (action === "download") {
          await run("download", () => adapter.downloadPrintable("A4")).catch(() => {});
          return;
        }
        if (action === "presentation") {
          try {
            adapter.openPresentation();
            globalState?.("Presentation Maker abierto. La aprobación y exportación continúan bajo revisión humana.");
          } catch (error) {
            globalState?.(error?.message || String(error), "error");
          }
        }
      });
    });
  }

  return Object.freeze({
    async mount() { status = "EMPTY"; selectedTab = "summary"; render(); },
    async unmount() { printablePreview = null; root.replaceChildren(); },
    async scrub() { adapter.clear(); expectedProduct = ""; errorMessage = ""; status = "EMPTY"; selectedTab = "summary"; },
    destroy() { root.replaceChildren(); },
  });
}

export const __quotesPremiumDecisionTest = Object.freeze({
  missingInformation,
  productMismatch,
  attentionItems,
  primaryFact,
});