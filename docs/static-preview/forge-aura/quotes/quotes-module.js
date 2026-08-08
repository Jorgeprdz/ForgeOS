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
  EMPTY: ["Carga una cotización", "El PDF será leído localmente y los motores productivos existentes construirán la propuesta."],
  LOADING: ["Leyendo cotización", "Extrayendo la verdad contractual y calculando con los motores existentes."],
  READY: ["Cotización lista para revisar", "Los datos todavía no están aceptados. Revisa la propuesta antes de confirmar."],
  ACCEPTED: ["Cotización confirmada", "La versión revisada ya puede alimentar el documento imprimible y Presentation Maker."],
  PARTIAL: ["Cotización con información parcial", "Se conserva lo que sí está respaldado. Los faltantes permanecen visibles."],
  ERROR: ["No se pudo procesar", "Forge no inventó valores. Revisa el archivo o vuelve a cargar una cotización válida."],
  UNAVAILABLE: ["Motor no disponible", "La autoridad productiva necesaria no está disponible en este momento."],
});

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
    .replace(/^./, (character) => character.toUpperCase());
}

function compactValue(value) {
  if (value === null || value === undefined || value === "") return "Sin dato confirmado";
  if (typeof value === "string" || typeof value === "number") return String(value);
  if (typeof value === "boolean") return value ? "Sí" : "No";
  if (Array.isArray(value)) {
    const visible = value.slice(0, 5).map(compactValue).filter(Boolean);
    return visible.length ? visible.join(" · ") : "Sin datos confirmados";
  }
  if (typeof value === "object") {
    return Object.entries(value)
      .filter(([, item]) => item !== null && item !== undefined && item !== "")
      .slice(0, 6)
      .map(([key, item]) => `${humanizeKey(key)}: ${compactValue(item)}`)
      .join(" · ") || "Sin datos confirmados";
  }
  return String(value);
}

function factsMarkup(facts, emptyCopy) {
  if (!facts?.length) return `<p class="aura-quotes__empty-copy">${esc(emptyCopy)}</p>`;
  return `<dl class="aura-quotes__facts">${facts.map((fact) => `
    <div><dt>${esc(fact.label)}</dt><dd>${esc(fact.display ?? fact.value)}</dd></div>`).join("")}</dl>`;
}

function blockLines(block) {
  const lines = Array.isArray(block?.lines) ? block.lines : [];
  if (!lines.length) return "";
  return `<dl class="aura-quotes__block-lines">${lines.map((line) => `
    <div><dt>${esc(line.label || humanizeKey(line.id))}</dt><dd>${esc(compactValue(line.value ?? line.display ?? line.severity))}</dd></div>`).join("")}</dl>`;
}

function scenarioMarkup(block) {
  const scenarios = Array.isArray(block?.scenarios) ? block.scenarios : [];
  if (!scenarios.length) return "";
  return `<div class="aura-quotes__scenario-grid">${scenarios.map((scenario) => `
    <article><span>${esc(scenario.label || humanizeKey(scenario.id))}</span><strong>${esc(compactValue(scenario.singlePayment || scenario.monthlyIncome || scenario.annualIncome))}</strong>${scenario.targetAge ? `<small>Horizonte: edad ${esc(scenario.targetAge)}</small>` : ""}</article>`).join("")}</div>`;
}

function benefitBlocksMarkup(blocks) {
  const visible = (blocks || []).filter((block) => block?.type !== "missing_information");
  if (!visible.length) return `<p class="aura-quotes__empty-copy">El producto no publicó bloques adicionales para esta cotización.</p>`;
  return visible.map((block) => `
    <article class="aura-quotes__benefit-block" data-block-type="${esc(block.type || "unknown")}">
      <header><span>Product Intelligence</span><h4>${esc(block.title || humanizeKey(block.type))}</h4></header>
      ${blockLines(block)}${scenarioMarkup(block)}
    </article>`).join("");
}

function missingInformation(viewModel) {
  const fromBlocks = (viewModel?.benefitBlocks || [])
    .filter((block) => block?.type === "missing_information")
    .flatMap((block) => (block.lines || []).map((line) => line.label || line.id).filter(Boolean));
  const fromIntelligence = viewModel?.intelligence?.missing || [];
  return [...new Set([...fromBlocks, ...fromIntelligence].map(String).filter(Boolean))];
}

function intelligenceMarkup(model) {
  if (!model) return `<div class="aura-quotes__notice" data-tone="neutral"><strong>Product Intelligence</strong><span>No publicó información adicional para este archivo.</span></div>`;
  const rows = [
    ["Objetivo", model.objective],
    ["Estructura", model.structure],
    ["Restricciones", model.restrictions],
    ["Componentes", model.components],
    ["Observaciones", model.notes],
  ].filter(([, value]) => value !== null && value !== undefined && compactValue(value) !== "Sin datos confirmados");
  return rows.length
    ? `<dl class="aura-quotes__intelligence">${rows.map(([label, value]) => `<div><dt>${esc(label)}</dt><dd>${esc(compactValue(value))}</dd></div>`).join("")}</dl>`
    : `<p class="aura-quotes__empty-copy">No hay atributos adicionales confirmados para mostrar.</p>`;
}

function economicMarkup(evidence) {
  if (!evidence?.available) return `<div class="aura-quotes__notice" data-tone="warning"><strong>Referencia económica no disponible</strong><span>Forge conserva los importes contractuales; no sustituye la tasa faltante con un valor inventado.</span></div>`;
  return `<dl class="aura-quotes__facts">
    ${evidence.value !== null && evidence.value !== undefined ? `<div><dt>Valor utilizado</dt><dd>${esc(evidence.value)}</dd></div>` : ""}
    ${evidence.asOf ? `<div><dt>Fecha de referencia</dt><dd>${esc(evidence.asOf)}</dd></div>` : ""}
    ${evidence.source ? `<div><dt>Fuente</dt><dd>${esc(evidence.source)}</dd></div>` : ""}
    ${evidence.status ? `<div><dt>Estado</dt><dd>${esc(evidence.status)}</dd></div>` : ""}
  </dl>`;
}

function persistenceMessage(receipt) {
  if (!receipt) return "Confirmada en esta sesión.";
  if (receipt.durable === true) return "Confirmada y vinculada al historial productivo.";
  if (receipt.status === "BLOCKED_IDENTITY_REQUIRED") return "Confirmada en esta sesión. Ábrela desde un Prospect para guardarla en su historial.";
  if (receipt.status === "LOCAL_REVIEW_ONLY") return receipt.message || "Confirmada localmente; la continuidad durable no está disponible.";
  return receipt.message || "Confirmada; la continuidad durable quedó pendiente.";
}

function productMismatch(expected, actualFamily) {
  if (!expected || !actualFamily || actualFamily === "unknown") return false;
  return normalized(expected) !== normalized(actualFamily);
}

export function createQuotesModule({ root, client, globalState } = {}) {
  if (!root) throw new Error("AURA_QUOTES_ROOT_REQUIRED");
  const adapter = createQuotesProductiveAdapter({ client });
  let status = "EMPTY";
  let errorMessage = "";
  let busyAction = "";
  let expectedProduct = "";
  let printablePreview = null;
  let lastFocused = null;

  const current = () => adapter.state();
  const setStatus = (next, message = "") => { status = next; errorMessage = message; render(); };

  function stateHeader() {
    const copy = STATE_COPY[status] || STATE_COPY.EMPTY;
    return `<div class="aura-quotes__state" data-state="${esc(status)}" role="status" aria-live="polite"><span aria-hidden="true" class="aura-quotes__state-dot"></span><div><strong>${esc(copy[0])}</strong><small>${esc(errorMessage || copy[1])}</small></div></div>`;
  }

  function renderEmpty() {
    return `<section class="aura-quotes__welcome" aria-labelledby="quotes-welcome-title"><div><span class="aura-quotes__eyebrow">Cotizaciones · Productive Truth</span><h2 id="quotes-welcome-title">De PDF real a propuesta revisable</h2><p>Forge detecta el producto, extrae el Accepted Quote y reutiliza los cálculos, proyecciones y evidencia económica existentes.</p></div><div class="aura-quotes__truth-legend" aria-label="Niveles de verdad"><span data-truth="contractual">Contractual</span><span data-truth="current">Referencia actual</span><span data-truth="projected">Proyección / estimación</span></div></section>`;
  }

  function renderResult(viewModel, accepted, lifecycleReceipt) {
    const missing = missingInformation(viewModel);
    const mismatch = productMismatch(expectedProduct, viewModel.family);
    return `
      <section class="aura-quotes__result-head"><div><span class="aura-quotes__eyebrow">Producto detectado</span><h2>${esc(viewModel.product)}</h2><p>${viewModel.sourceFile ? `Fuente: ${esc(viewModel.sourceFile)}` : "Fuente: paquete de cotización aceptable"}</p></div><span class="aura-quotes__acceptance" data-accepted="${String(accepted)}">${accepted ? "Accepted Quote confirmado" : "Pendiente de confirmación humana"}</span></section>
      ${mismatch ? `<div class="aura-quotes__notice" data-tone="warning"><strong>Producto distinto al esperado</strong><span>El archivo fue identificado como ${esc(viewModel.product)}. Forge no sobrescribió la verdad del PDF con la selección previa.</span></div>` : ""}
      ${accepted ? `<div class="aura-quotes__notice" data-tone="success"><strong>Continuidad</strong><span>${esc(persistenceMessage(lifecycleReceipt))}</span></div>` : ""}
      ${missing.length ? `<div class="aura-quotes__notice" data-tone="warning"><strong>Información pendiente</strong><span>${esc(missing.join(" · "))}</span></div>` : ""}
      <div class="aura-quotes__truth-grid">
        <section class="aura-quotes__truth-card" data-truth="contractual"><header><span>01 · Contractual</span><h3>Lo que dice la cotización</h3><p>Datos extraídos del documento/Accepted Quote. No se recalculan para presentación.</p></header>${factsMarkup(viewModel.contractual, "No hay campos contractuales publicables en esta cotización.")}</section>
        <section class="aura-quotes__truth-card" data-truth="current"><header><span>02 · Referencia actual</span><h3>Equivalencias y evidencia</h3><p>Valores actuales sólo cuando el runtime económico existente dispone de referencia.</p></header>${factsMarkup(viewModel.current, "No hay equivalencias actuales confirmadas para este producto.")}${economicMarkup(viewModel.economicEvidence)}</section>
        <section class="aura-quotes__truth-card" data-truth="projected"><header><span>03 · Proyección</span><h3>Escenarios estimados</h3><p>Escenarios del motor productivo. No son garantía contractual.</p></header>${factsMarkup(viewModel.projected, "Este producto no publicó proyecciones monetarias para esta cotización.")}</section>
      </div>
      <section class="aura-quotes__section" aria-labelledby="quotes-intelligence-title"><header><div><span class="aura-quotes__eyebrow">Product Intelligence</span><h3 id="quotes-intelligence-title">Cómo está estructurada la solución</h3></div><small>Lectura de autoridades existentes</small></header>${intelligenceMarkup(viewModel.intelligence)}<div class="aura-quotes__benefit-grid">${benefitBlocksMarkup(viewModel.benefitBlocks)}</div></section>`;
  }

  function actionMarkup(state) {
    const accepted = state.accepted;
    return `<section class="aura-quotes__actions" aria-label="Acciones de cotización"><div><span class="aura-quotes__eyebrow">Siguiente decisión</span><h3>${accepted ? "Cotización lista para usar" : "Confirma sólo después de revisar"}</h3><p>${accepted ? "Documento imprimible y Presentation Maker consumen el mismo snapshot aceptado." : "La confirmación congela un snapshot revisado y mantiene la autoridad humana."}</p></div><div class="aura-quotes__action-buttons">
      <button type="button" class="aura-quotes__button aura-quotes__button--primary" data-quotes-action="accept" ${accepted || !state.viewModel || busyAction ? "disabled" : ""}>${busyAction === "accept" ? "Confirmando…" : accepted ? "Cotización confirmada" : "Confirmar Accepted Quote"}</button>
      <button type="button" class="aura-quotes__button" data-quotes-action="preview" ${!accepted || busyAction ? "disabled" : ""}>${busyAction === "preview" ? "Preparando…" : "Ver versión imprimible"}</button>
      <button type="button" class="aura-quotes__button" data-quotes-action="download" ${!accepted || busyAction ? "disabled" : ""}>${busyAction === "download" ? "Generando…" : "Descargar PDF"}</button>
      <button type="button" class="aura-quotes__button" data-quotes-action="presentation" ${!accepted || busyAction ? "disabled" : ""}>Abrir Presentation Maker</button></div></section>`;
  }

  function previewModal() {
    if (!printablePreview) return "";
    return `<section class="aura-quotes__modal" data-quotes-preview-modal role="dialog" aria-modal="true" aria-labelledby="quotes-preview-title"><button type="button" class="aura-quotes__modal-scrim" data-quotes-action="close-preview" aria-label="Cerrar vista previa"></button><div class="aura-quotes__modal-panel"><header><div><span class="aura-quotes__eyebrow">Documento imprimible</span><h2 id="quotes-preview-title">Vista previa</h2></div><button type="button" class="aura-quotes__icon-button" data-quotes-action="close-preview" aria-label="Cerrar">×</button></header><iframe title="Vista previa de la cotización" sandbox="" srcdoc="${esc(printablePreview.bundle.printableDocument.html)}"></iframe><footer><span>${esc(printablePreview.bundle.pageFormat || "A4")} · ${esc(printablePreview.bundle.pdfPacket?.pageCount || "—")} página(s)</span><button type="button" class="aura-quotes__button aura-quotes__button--primary" data-quotes-action="download">Descargar PDF</button></footer></div></section>`;
  }

  function render() {
    const state = current();
    const viewModel = state.viewModel;
    root.innerHTML = `<div class="aura-quotes" data-aura-quotes data-state="${esc(status)}"><header class="aura-quotes__page-header"><div><span class="aura-quotes__eyebrow">FORGE AURA · COTIZACIONES</span><h1>Cotizaciones</h1><p>Convierte una cotización real en una propuesta clara sin mover la fuente de verdad.</p></div>${stateHeader()}</header>
      <section class="aura-quotes__intake" aria-labelledby="quotes-intake-title"><div><span class="aura-quotes__eyebrow">Nueva cotización</span><h2 id="quotes-intake-title">Carga el archivo productivo</h2><p>El producto se detecta desde el documento. La selección previa sólo sirve para advertir inconsistencias.</p></div><div class="aura-quotes__intake-controls"><label><span>Producto / solución esperada</span><select data-quotes-product ${busyAction ? "disabled" : ""}>${PRODUCT_OPTIONS.map(([value, label]) => `<option value="${value}" ${expectedProduct === value ? "selected" : ""}>${esc(label)}</option>`).join("")}</select></label><label class="aura-quotes__file"><span>PDF de Solución Online</span><input type="file" accept=".pdf,application/pdf,.json,application/json" data-quotes-file ${busyAction ? "disabled" : ""}><b>${busyAction === "load" ? "Procesando…" : state.packet ? "Cambiar cotización" : "Seleccionar archivo"}</b><small>PDF productivo; JSON aceptado sólo como paquete técnico compatible.</small></label></div></section>
      ${viewModel ? renderResult(viewModel, state.accepted, state.lifecycleReceipt) : renderEmpty()}${actionMarkup(state)}<p class="aura-quotes__disclaimer">Forge presenta evidencia y proyecciones de los motores existentes. Esta vista no reemplaza el documento contractual ni convierte una proyección en garantía.</p></div>${previewModal()}`;
    bindDom();
    if (printablePreview) queueMicrotask(() => root.querySelector('[data-quotes-action="close-preview"]')?.focus());
  }

  async function run(action, operation) {
    busyAction = action;
    render();
    try { return await operation(); }
    catch (error) {
      const message = error?.message || String(error);
      globalState?.(message, "error");
      setStatus(message.includes("disponible") ? "UNAVAILABLE" : "ERROR", message);
      throw error;
    } finally { busyAction = ""; render(); }
  }

  function closePreview() {
    printablePreview = null;
    render();
    lastFocused?.focus?.({ preventScroll: true });
    lastFocused = null;
  }

  function bindDom() {
    const fileInput = root.querySelector("[data-quotes-file]");
    const productSelect = root.querySelector("[data-quotes-product]");
    productSelect?.addEventListener("change", () => { expectedProduct = productSelect.value; });
    fileInput?.addEventListener("change", async () => {
      const file = fileInput.files?.[0];
      if (!file) return;
      status = "LOADING"; busyAction = "load"; render();
      try {
        const result = await adapter.loadFile(file);
        status = missingInformation(result.viewModel).length ? "PARTIAL" : "READY";
        errorMessage = "";
        globalState?.("Cotización procesada. Revisa antes de confirmar.");
      } catch (error) {
        status = "ERROR";
        errorMessage = error?.message || String(error);
        globalState?.(errorMessage, "error");
      } finally { busyAction = ""; render(); }
    });

    root.querySelectorAll("[data-quotes-action]").forEach((button) => {
      button.addEventListener("click", async () => {
        const action = button.dataset.quotesAction;
        if (action === "close-preview") { closePreview(); return; }
        if (action === "accept") {
          await run("accept", async () => {
            const result = await adapter.accept();
            status = "ACCEPTED"; errorMessage = "";
            globalState?.(persistenceMessage(result.lifecycleReceipt));
          }).catch(() => {});
          return;
        }
        if (action === "preview") {
          lastFocused = button;
          await run("preview", async () => { printablePreview = await adapter.previewPrintable("A4"); }).catch(() => {});
          return;
        }
        if (action === "download") { await run("download", () => adapter.downloadPrintable("A4")).catch(() => {}); return; }
        if (action === "presentation") {
          try {
            adapter.openPresentation();
            globalState?.("Presentation Maker abierto. La aprobación y exportación siguen siendo humanas.");
          } catch (error) { globalState?.(error?.message || String(error), "error"); }
        }
      });
    });
  }

  return Object.freeze({
    async mount() { status = "EMPTY"; render(); },
    async unmount() { printablePreview = null; root.replaceChildren(); },
    async scrub() { adapter.clear(); expectedProduct = ""; errorMessage = ""; status = "EMPTY"; },
    destroy() { root.replaceChildren(); },
  });
}
