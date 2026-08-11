import { createPipelineModule as createBasePipelineModule } from "../pipeline/pipeline-module.js";
import { createPipelineAdapter } from "../pipeline/pipeline-adapter.js";

const WRAPPER_ID = "FORGE_GLOBAL_AURA_PIPELINE_CONSUMER_BRIDGE_008";

const esc = value => String(value ?? "")
  .replaceAll("&", "&amp;")
  .replaceAll("<", "&lt;")
  .replaceAll(">", "&gt;")
  .replaceAll('"', "&quot;")
  .replaceAll("'", "&#39;");

function reasonsHtml(reasons = []) {
  if (!Array.isArray(reasons) || !reasons.length) return "<li>Sin degradaciones informadas.</li>";
  return reasons.map(reason => `<li>${esc(reason)}</li>`).join("");
}

function technicalContextHtml(context = {}) {
  const sourceAuthorities = context?.provenance?.sourceAuthorities || [];
  return `
    <details class="aura-technical-disclosure" data-pipeline-context-technical>
      <summary>Información técnica</summary>
      <dl class="aura-detail">
        <div><dt>Consumer</dt><dd>${esc(context?.consumerId || "FORGE_PIPELINE_DOMAIN_INTELLIGENCE_CONSUMER_005A")}</dd></div>
        <div><dt>Estado</dt><dd>${esc(context?.state || "unavailable")}</dd></div>
        <div><dt>Identidad</dt><dd>${esc(context?.identityState || "UNKNOWN")}</dd></div>
        <div><dt>CommercialPerson</dt><dd>${esc(context?.personReference || "No vinculada")}</dd></div>
        <div><dt>Opportunity authority</dt><dd>${esc(context?.opportunityAuthorityState || "UNKNOWN")}</dd></div>
        <div><dt>Fuentes</dt><dd>${esc(sourceAuthorities.join(" · ") || "No disponibles")}</dd></div>
      </dl>
      <h4>Limitaciones y degradaciones</h4>
      <ul>${reasonsHtml(context?.degradedReasons)}</ul>
      <p>Prospect ≠ CommercialPerson. Recomendación ≠ decisión humana. Esta vista es read-only y no ejecuta acciones.</p>
    </details>
  `;
}

function projectionTechnicalHtml(item = {}) {
  return `
    <details class="aura-technical-disclosure" data-pipeline-projection-technical>
      <summary>Información técnica</summary>
      <dl class="aura-detail">
        <div><dt>Estado de verdad</dt><dd>${esc(item.truthState || "UNKNOWN")}</dd></div>
        <div><dt>Autoridades fuente</dt><dd>${esc((item.provenance?.sourceAuthorities || []).join(" · ") || "No informadas")}</dd></div>
        <div><dt>Decisión humana requerida</dt><dd>${item.humanDecisionRequired === false ? "No informada" : "Sí"}</dd></div>
        <div><dt>Referencia</dt><dd>${esc(item.decisionReference || "No informada")}</dd></div>
      </dl>
    </details>
  `;
}

function projectionsHtml(projections = []) {
  if (!Array.isArray(projections) || !projections.length) {
    return `
      <section class="aura-inline-empty" data-aura-governed-projections="EMPTY">
        <h3>Sin información adicional para decidir</h3>
        <p>Forge no encontró una recomendación respaldada por las fuentes disponibles. Los datos del prospecto siguen visibles para que tú decidas el siguiente paso.</p>
      </section>
    `;
  }

  return `<div class="aura-governed-projection-list">${projections.map(item => `
    <article class="aura-governed-projection" data-decision-reference="${esc(item.decisionReference)}">
      <p class="aura-eyebrow">${esc(item.domain || item.family || "CONTEXTO")}</p>
      <h3>${esc(item.title || "Información para revisar")}</h3>
      <p>${esc(item.whyNow || item.reason || "Forge no tiene una explicación adicional para esta señal.")}</p>
      ${item.recommendedAction?.label ? `<p><strong>Posible siguiente paso:</strong> ${esc(item.recommendedAction.label)}. Tú decides si hacerlo.</p>` : ""}
      ${projectionTechnicalHtml(item)}
    </article>
  `).join("")}</div>`;
}

export function createPipelineModule(options = {}) {
  const { root, adapterFactory = createPipelineAdapter } = options;
  if (!root) throw new Error("AURA_PIPELINE_ROOT_AND_CLIENT_REQUIRED");

  let adapter = null;
  let observer = null;
  let activeDialog = null;
  let mounted = false;
  const events = new AbortController();

  const base = createBasePipelineModule({
    ...options,
    adapterFactory: async args => {
      adapter = await adapterFactory(args);
      return adapter;
    },
  });

  function closeContextDialog({ restore = true } = {}) {
    const dialog = activeDialog;
    activeDialog = null;
    if (!dialog) return;
    const trigger = dialog._restoreFocus;
    dialog.remove();
    if (restore) trigger?.focus?.({ preventScroll: true });
  }

  function renderContextDialog(trigger, prospectId) {
    closeContextDialog({ restore: false });
    const layer = root.ownerDocument.createElement("div");
    layer.className = "aura-dialog-layer";
    layer.dataset.auraGovernedContextDialog = "true";
    layer.innerHTML = `
      <button class="aura-scrim" type="button" data-close-governed-context aria-label="Cerrar contexto"></button>
      <section class="aura-dialog aura-governed-dialog" role="dialog" aria-modal="true" aria-labelledby="aura-governed-context-title" tabindex="-1">
        <header>
          <div>
            <p class="aura-eyebrow">CONTEXTO PARA DECIDIR</p>
            <h2 id="aura-governed-context-title">Lo que Forge puede explicar de este prospecto</h2>
          </div>
          <button type="button" data-close-governed-context aria-label="Cerrar">×</button>
        </header>
        <div class="aura-dialog__body" data-governed-context-body aria-busy="true">
          <div class="aura-loading aura-loading--inline"><div aria-hidden="true"></div><p>Revisando la información disponible…</p></div>
        </div>
      </section>
    `;
    layer._restoreFocus = trigger;
    root.ownerDocument.body.append(layer);
    activeDialog = layer;

    const close = () => closeContextDialog();
    layer.querySelectorAll("[data-close-governed-context]").forEach(node => node.addEventListener("click", close));
    layer.addEventListener("keydown", event => {
      if (event.key === "Escape") {
        event.preventDefault();
        close();
      }
    });
    layer.querySelector(".aura-dialog")?.focus();

    const body = layer.querySelector("[data-governed-context-body]");
    const currentDialog = layer;
    Promise.resolve(adapter.intelligence(prospectId, { projections: [] }))
      .then(context => {
        if (activeDialog !== currentDialog) return;
        body.setAttribute("aria-busy", "false");
        const available = context?.state && context.state !== "unavailable";
        body.innerHTML = `
          <section class="aura-governed-context-summary" data-consumer-state="${esc(context?.state || "unavailable")}">
            <h3>${available ? "Forge encontró contexto adicional" : "Forge no encontró contexto adicional disponible"}</h3>
            <p>${available
              ? "Esta información complementa el registro del prospecto. Revísala antes de decidir qué hacer; Forge no ejecutará ninguna acción por ti."
              : "Puedes seguir trabajando con los datos del prospecto. Forge no va a inventar una recomendación para llenar lo que falta."}</p>
            ${technicalContextHtml(context)}
          </section>
          ${projectionsHtml(context?.projections)}
        `;
      })
      .catch(error => {
        if (activeDialog !== currentDialog) return;
        body.setAttribute("aria-busy", "false");
        body.innerHTML = `
          <section class="aura-inline-empty" data-aura-governed-projections="UNAVAILABLE">
            <h3>No pudimos consultar el contexto adicional</h3>
            <p>Puedes seguir usando los datos del prospecto y volver a intentarlo después. Forge no sustituirá la información faltante con una recomendación inventada.</p>
            <details class="aura-technical-disclosure" data-pipeline-context-technical>
              <summary>Información técnica</summary>
              <p>${esc(error?.code || error?.message || "PIPELINE_INTELLIGENCE_SOURCE_UNAVAILABLE")}</p>
            </details>
          </section>
        `;
      });
  }

  function normalizeOperationalSurface() {
    if (!root.isConnected && !mounted) return;

    const pipeline = root.querySelector(".aura-pipeline");
    if (pipeline) pipeline.dataset.aura008AuthorityMode = "OWNER_CONTEXT_FIRST";

    const headerCopy = root.querySelector(".aura-pipeline__header > div > p:not(.aura-eyebrow)");
    if (headerCopy && headerCopy.dataset.aura008Normalized !== "true") {
      headerCopy.dataset.aura008Normalized = "true";
      headerCopy.textContent = headerCopy.textContent
        .replace(/(\d+) requieren atención/, "$1 con datos por revisar")
        .replace("sin señales prioritarias verificadas", "sin pendientes destacados");
    }

    const attention = root.querySelector("[data-attention-layer]");
    if (attention && attention.dataset.aura008Normalized !== "true") {
      attention.dataset.aura008Normalized = "true";
      const eyebrow = attention.querySelector(".aura-eyebrow");
      const title = attention.querySelector("h2");
      const copy = attention.querySelector("header p:not(.aura-eyebrow)");
      if (eyebrow) eyebrow.textContent = "PARA REVISAR";
      if (title) title.textContent = attention.querySelector("[data-priority-kind]")
        ? "Datos del registro que conviene revisar"
        : "Sin pendientes destacados";
      if (copy) copy.textContent = "Estas señales salen de fechas, actividad y datos ya registrados. Te ayudan a revisar el Pipeline, pero no deciden por ti.";
      attention.querySelectorAll("[data-priority-kind]").forEach(card => {
        card.dataset.operationalFactKind = card.dataset.priorityKind || "";
      });
    }

    root.querySelectorAll(".aura-recommendation").forEach(node => {
      if (node.dataset.aura008Context === "true") return;
      node.dataset.aura008Context = "true";
      const record = node.closest("[data-record-id]");
      const id = record?.dataset.recordId || "";
      const actionable = Boolean(id && adapter?.intelligence);
      node.dataset.pipelineContextActionable = String(actionable);
      node.innerHTML = actionable ? `
        <div>
          <span>Contexto para decidir</span>
          <p>Forge puede mostrarte información adicional antes de que elijas el siguiente paso.</p>
        </div>
        <button type="button" data-pipeline-governed-context data-id="${esc(id)}">
          Ver contexto
        </button>
      ` : `
        <div>
          <span>Contexto para decidir</span>
          <p>No hay contexto adicional disponible para este registro. Puedes seguir con los datos visibles del prospecto.</p>
        </div>
      `;
    });

    root.querySelectorAll('[role="columnheader"]').forEach(node => {
      if (node.textContent.trim() === "Siguiente acción") node.textContent = "Contexto";
    });

    const sort = root.querySelector('[data-filter="sort"]');
    if (sort) {
      const priority = [...sort.options].find(option => option.value === "priority");
      if (priority && priority.textContent !== "Orden anterior") priority.textContent = "Orden anterior";
      if (sort.value === "priority" && sort.dataset.aura008SortNormalized !== "true") {
        sort.dataset.aura008SortNormalized = "true";
        queueMicrotask(() => {
          if (!sort.isConnected) return;
          sort.value = "next_commitment";
          sort.dispatchEvent(new Event("change", { bubbles: true }));
        });
      }
    }

    const quick = root.querySelector('[data-filter="quick"]');
    if (quick) {
      const label = quick.closest("label")?.querySelector("span");
      if (label && label.textContent !== "Pendientes") label.textContent = "Pendientes";
      const attentionOption = [...quick.options].find(option => option.value === "attention");
      if (attentionOption && attentionOption.textContent !== "Con datos por revisar") attentionOption.textContent = "Con datos por revisar";
    }
  }

  function observe() {
    if (observer) return;
    const Observer = root.ownerDocument.defaultView?.MutationObserver || globalThis.MutationObserver;
    if (!Observer) return;
    observer = new Observer(() => normalizeOperationalSurface());
    observer.observe(root, { childList: true, subtree: true });
  }

  root.addEventListener("click", event => {
    const button = event.target.closest("[data-pipeline-governed-context]");
    if (!button) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    const id = button.dataset.id;
    if (!id || !adapter?.intelligence) return;
    renderContextDialog(button, id);
  }, { capture: true, signal: events.signal });

  return Object.freeze({
    async mount() {
      mounted = true;
      await base.mount();
      observe();
      normalizeOperationalSurface();
      root.dataset.auraPipelineConsumerBridge = WRAPPER_ID;
    },
    async reload() {
      await base.reload?.();
      normalizeOperationalSurface();
    },
    async unmount() {
      mounted = false;
      observer?.disconnect();
      observer = null;
      closeContextDialog({ restore: false });
    },
    async scrub() {
      closeContextDialog({ restore: false });
    },
    async destroy() {
      mounted = false;
      observer?.disconnect();
      observer = null;
      closeContextDialog({ restore: false });
      events.abort();
      await base.destroy?.();
      adapter = null;
    },
    state: () => base.state?.(),
    diagnostics() {
      return Object.freeze({
        wrapperId: WRAPPER_ID,
        intelligenceConsumerConnected: Boolean(adapter?.intelligence),
        localNbaPresentedAsAuthority: false,
        createsTruth: false,
        createsScore: false,
        calculatesPriority: false,
        automaticExecutionAllowed: false,
        persistenceAllowed: false,
      });
    },
    states: base.states,
  });
}

export { WRAPPER_ID };
