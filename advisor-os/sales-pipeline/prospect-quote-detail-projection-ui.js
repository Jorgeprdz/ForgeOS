"use strict";

(function prospectQuoteDetailProjectionUIModule(root, factory) {
  const api = factory(root);
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  if (root) root.ForgeProspectQuoteDetailProjectionUICartera001C = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function prospectQuoteDetailProjectionUIFactory(root) {
  const UI_VERSION = "CARTERA-001C-UI.1";
  const SECTION_SELECTOR = "[data-cartera001c-quote-detail]";
  const STYLE_ID = "forge-cartera001c-quote-detail-style";
  let binding = null;

  function esc(value) {
    return String(value ?? "").replace(/[&<>"']/g, character => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    })[character]);
  }

  function humanDate(value) {
    if (!value) return "Fecha no disponible";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "Fecha no disponible";
    return new Intl.DateTimeFormat("es-MX", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date).replace(" de ", " ").replace(" de ", " ");
  }

  function shortReference(value) {
    const text = String(value || "");
    if (text.length <= 22) return text;
    return `${text.slice(0, 12)}…${text.slice(-7)}`;
  }

  function ensureStyles(documentRef) {
    if (!documentRef?.head || documentRef.getElementById(STYLE_ID)) return;
    const style = documentRef.createElement("style");
    style.id = STYLE_ID;
    style.textContent = `
      .forge-cartera001c-quotes{margin:18px 0 4px;padding:16px;border:1px solid color-mix(in srgb,currentColor 14%,transparent);border-radius:18px;background:color-mix(in srgb,var(--md-sys-color-surface-container-low,#f7f2fa) 92%,transparent)}
      .forge-cartera001c-quotes__head{display:flex;align-items:flex-start;justify-content:space-between;gap:12px;margin-bottom:12px}
      .forge-cartera001c-quotes__eyebrow{margin:0 0 4px;font-size:.72rem;font-weight:800;letter-spacing:.08em;text-transform:uppercase;opacity:.72}
      .forge-cartera001c-quotes h3,.forge-cartera001c-quotes h4{margin:0}
      .forge-cartera001c-quotes__count{display:inline-flex;min-width:28px;height:28px;align-items:center;justify-content:center;border-radius:999px;background:color-mix(in srgb,currentColor 10%,transparent);font-weight:800}
      .forge-cartera001c-quote-grid{display:grid;gap:10px}
      .forge-cartera001c-quote-card{padding:13px;border-radius:14px;background:var(--md-sys-color-surface,#fff);box-shadow:0 1px 0 color-mix(in srgb,currentColor 10%,transparent)}
      .forge-cartera001c-quote-card__top{display:flex;align-items:flex-start;justify-content:space-between;gap:10px}
      .forge-cartera001c-quote-card p{margin:4px 0 0;font-size:.82rem;opacity:.72}
      .forge-cartera001c-badge{display:inline-flex;align-items:center;padding:5px 8px;border-radius:999px;font-size:.72rem;font-weight:800;background:color-mix(in srgb,var(--md-sys-color-primary,#6750a4) 12%,transparent);color:var(--md-sys-color-primary,#6750a4)}
      .forge-cartera001c-badge[data-truth="CONFLICT_REVIEW_REQUIRED"]{background:color-mix(in srgb,#b3261e 12%,transparent);color:#b3261e}
      .forge-cartera001c-quote-meta{display:flex;flex-wrap:wrap;gap:6px 12px;margin-top:10px;font-size:.76rem;opacity:.76}
      .forge-cartera001c-timeline{margin-top:16px;padding-top:14px;border-top:1px solid color-mix(in srgb,currentColor 12%,transparent)}
      .forge-cartera001c-timeline ol{list-style:none;margin:10px 0 0;padding:0;display:grid;gap:10px}
      .forge-cartera001c-timeline li{position:relative;padding-left:18px}
      .forge-cartera001c-timeline li::before{content:"";position:absolute;left:2px;top:.42rem;width:8px;height:8px;border-radius:50%;background:var(--md-sys-color-primary,#6750a4)}
      .forge-cartera001c-timeline strong{display:block;font-size:.86rem}
      .forge-cartera001c-timeline span{display:block;margin-top:2px;font-size:.75rem;opacity:.7}
      .forge-cartera001c-state{margin:0;padding:12px;border-radius:12px;background:color-mix(in srgb,currentColor 6%,transparent);font-size:.84rem}
      .forge-cartera001c-state[data-state="ERROR"]{color:#b3261e;background:color-mix(in srgb,#b3261e 8%,transparent)}
      @media (min-width:700px){.forge-cartera001c-quote-grid{grid-template-columns:repeat(2,minmax(0,1fr))}}
    `;
    documentRef.head.append(style);
  }

  function loadingTemplate() {
    return `<section class="forge-cartera001c-quotes" data-cartera001c-quote-detail data-state="LOADING" aria-live="polite"><div class="forge-cartera001c-quotes__head"><div><p class="forge-cartera001c-quotes__eyebrow">CARTERA · QUOTE</p><h3>Cotizaciones</h3></div></div><p class="forge-cartera001c-state">Consultando historial confirmado…</p></section>`;
  }

  function emptyTemplate() {
    return `<div class="forge-cartera001c-quotes__head"><div><p class="forge-cartera001c-quotes__eyebrow">CARTERA · QUOTE</p><h3>Cotizaciones</h3></div><span class="forge-cartera001c-quotes__count">0</span></div><p class="forge-cartera001c-state" data-state="EMPTY">Este prospecto todavía no tiene cotizaciones vinculadas.</p>`;
  }

  function quoteCardTemplate(quote) {
    return `<article class="forge-cartera001c-quote-card" data-quote-reference="${esc(quote.quote_reference)}"><div class="forge-cartera001c-quote-card__top"><div><h4>${esc(quote.product_reference)}</h4><p title="${esc(quote.quote_reference)}">${esc(shortReference(quote.quote_reference))}</p></div><span class="forge-cartera001c-badge" data-truth="${esc(quote.truth_state)}">${esc(quote.lifecycle_label)}</span></div><div class="forge-cartera001c-quote-meta"><span>${esc(quote.latest_event_label)}</span><span>${esc(humanDate(quote.latest_occurred_at))}</span><span>${quote.event_count} evento${quote.event_count === 1 ? "" : "s"}</span><span>${quote.version_count} versión${quote.version_count === 1 ? "" : "es"}</span></div></article>`;
  }

  function timelineItemTemplate(item) {
    return `<li data-quote-event-id="${esc(item.event_id)}" data-source-authority="${esc(item.source_authority)}"><strong>${esc(item.label)}</strong><span>${esc(item.product_reference)} · ${esc(humanDate(item.occurred_at))}</span><span title="${esc(item.quote_reference)}">${esc(shortReference(item.quote_reference))} · ${esc(item.freshness_status)}</span></li>`;
  }

  function readyTemplate(projection) {
    return `<div class="forge-cartera001c-quotes__head"><div><p class="forge-cartera001c-quotes__eyebrow">CARTERA · QUOTE</p><h3>Cotizaciones</h3></div><span class="forge-cartera001c-quotes__count">${projection.counters.quote_count}</span></div><div class="forge-cartera001c-quote-grid">${projection.quotes.map(quoteCardTemplate).join("")}</div><section class="forge-cartera001c-timeline" aria-labelledby="cartera001c-timeline-title"><h4 id="cartera001c-timeline-title">Actividad de cotización</h4><ol>${projection.timeline.map(timelineItemTemplate).join("")}</ol></section>`;
  }

  function renderProjection(projection) {
    if (!projection || projection.state === "EMPTY") return emptyTemplate();
    return readyTemplate(projection);
  }

  function renderError(error) {
    const message = error?.code === "AUTH_REQUIRED"
      ? "Inicia sesión nuevamente para consultar las cotizaciones."
      : error?.code === "PROSPECT_NOT_FOUND"
        ? "No encontramos un historial de cotización para este prospecto."
        : "No pudimos consultar las cotizaciones en este momento.";
    return `<div class="forge-cartera001c-quotes__head"><div><p class="forge-cartera001c-quotes__eyebrow">CARTERA · QUOTE</p><h3>Cotizaciones</h3></div></div><p class="forge-cartera001c-state" data-state="ERROR">${esc(message)}</p>`;
  }

  function insertLoadingSection(documentRef) {
    const dialog = documentRef.querySelector("[data-prospect-detail-dialog]");
    if (!dialog) return null;
    dialog.querySelector(SECTION_SELECTOR)?.remove();
    const article = dialog.querySelector("article");
    if (!article) return null;
    const secondary = article.querySelector(".forge-prospect-secondary");
    const footer = article.querySelector("footer");
    const wrapper = documentRef.createElement("div");
    wrapper.innerHTML = loadingTemplate();
    const section = wrapper.firstElementChild;
    if (secondary) article.insertBefore(section, secondary);
    else if (footer) article.insertBefore(section, footer);
    else article.append(section);
    return section;
  }

  async function mountForProspect(prospectReference, state = binding) {
    if (!state?.document || !state?.service || !state?.projection) return false;
    const requestId = ++state.requestId;
    const section = insertLoadingSection(state.document);
    if (!section) return false;
    section.dataset.prospectReference = prospectReference;
    try {
      const rows = await state.service.listProspectQuoteHistory(prospectReference, { limit: 100 });
      if (requestId !== state.requestId || !section.isConnected) return false;
      const projection = state.projection.createProspectQuoteDetailProjection({
        prospectReference,
        rows,
      });
      section.dataset.state = projection.state;
      section.dataset.projectionVersion = projection.projection_version;
      section.dataset.projectionDigest = projection.projection_digest;
      section.innerHTML = renderProjection(projection);
      return true;
    } catch (error) {
      if (requestId !== state.requestId || !section.isConnected) return false;
      section.dataset.state = "ERROR";
      section.innerHTML = renderError(error);
      return false;
    }
  }

  function bind({ client, document: documentRef = root?.document } = {}) {
    if (!client || !documentRef?.addEventListener) throw new Error("CARTERA001C_UI_DEPENDENCY_REQUIRED");
    if (binding?.document === documentRef) return binding.api;
    const serviceFactory = root.ForgeQuoteLifecycleSupabaseServiceCartera001B;
    const projection = root.ForgeProspectQuoteDetailProjectionCartera001C;
    if (!serviceFactory?.create || !projection?.createProspectQuoteDetailProjection) {
      throw new Error("CARTERA001C_PROJECTION_DEPENDENCY_REQUIRED");
    }
    binding?.controller?.abort();
    const controller = new AbortController();
    const state = {
      client,
      document: documentRef,
      service: serviceFactory.create(client),
      projection,
      controller,
      requestId: 0,
      lastProspectReference: null,
      api: null,
    };
    ensureStyles(documentRef);
    documentRef.addEventListener("click", event => {
      const trigger = event.target?.closest?.("[data-open-prospect]");
      if (!trigger?.dataset?.openProspect) return;
      const prospectReference = trigger.dataset.openProspect;
      state.lastProspectReference = prospectReference;
      root.setTimeout(() => void mountForProspect(prospectReference, state), 0);
    }, { capture: true, signal: controller.signal });
    state.api = Object.freeze({
      version: UI_VERSION,
      mountForProspect: prospectReference => mountForProspect(prospectReference, state),
      diagnostics: () => Object.freeze({
        version: UI_VERSION,
        bound: !controller.signal.aborted,
        lastProspectReference: state.lastProspectReference,
        automaticExternalEffects: false,
        quoteTruthDuplicated: false,
        sourceAuthority: "QUOTE_AUTHORITY",
      }),
    });
    binding = state;
    return state.api;
  }

  return Object.freeze({
    UI_VERSION,
    bind,
    renderProjection,
    renderError,
    loadingTemplate,
    emptyTemplate,
    quoteCardTemplate,
    timelineItemTemplate,
    _private: Object.freeze({ esc, humanDate, shortReference, ensureStyles, insertLoadingSection, mountForProspect }),
  });
});