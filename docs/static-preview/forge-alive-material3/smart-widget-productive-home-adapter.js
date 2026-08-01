const ADAPTER_STATE = Symbol.for("forge.smart-widgets.productive-home-adapter.v2");

function text(value) {
  return value === undefined || value === null ? "" : String(value);
}

function element(tag, className, content) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (content !== undefined) node.textContent = text(content);
  return node;
}

function formatMetric(metric) {
  if (!metric) return "";
  if (metric.display !== undefined && metric.display !== null) return text(metric.display);
  if (metric.value === undefined || metric.value === null) return "";
  return text(metric.value);
}

function chartPoints(chartReady) {
  const series = Array.isArray(chartReady?.series) ? chartReady.series : [];
  const direct = series
    .filter((entry) => !Array.isArray(entry?.points))
    .map((entry) => ({ x: entry?.x, value: Number(entry?.y ?? entry?.value) }))
    .filter((entry) => Number.isFinite(entry.value));
  if (direct.length) return direct;

  const aggregated = new Map();
  for (const item of series) {
    for (const point of Array.isArray(item?.points) ? item.points : []) {
      const value = Number(point?.value ?? point?.y);
      if (!Number.isFinite(value)) continue;
      const key = text(point?.x ?? point?.bucket ?? aggregated.size);
      aggregated.set(key, (aggregated.get(key) || 0) + value);
    }
  }
  return [...aggregated.entries()].map(([x, value]) => ({ x, value }));
}

function renderMiniChart(chartReady) {
  const points = chartPoints(chartReady);
  const values = points.map((point) => point.value);
  if (values.length < 2) return null;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = Math.max(1, max - min);
  const path = values.map((value, index) => {
    const x = values.length === 1 ? 60 : 4 + (112 * index) / (values.length - 1);
    const y = 25 - ((value - min) / range) * 20;
    return `${index === 0 ? "M" : "L"}${x.toFixed(2)} ${y.toFixed(2)}`;
  }).join(" ");
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("viewBox", "0 0 120 30");
  svg.setAttribute("aria-hidden", "true");
  svg.classList.add("productive-smart-widget-chart");
  const line = document.createElementNS("http://www.w3.org/2000/svg", "path");
  line.setAttribute("d", path);
  svg.appendChild(line);
  return svg;
}

function renderWidget(widget, { primary, onAction }) {
  const article = element("article", `productive-smart-widget ${primary ? "is-primary" : "is-supporting"}`);
  article.dataset.widgetId = widget.widgetId;
  article.dataset.widgetFamily = widget.widgetFamily;
  article.dataset.widgetState = widget.state;

  const eyebrow = element("p", "productive-smart-widget-eyebrow", primary ? "LO MÁS IMPORTANTE AHORA" : "TAMBIÉN IMPORTA");
  const title = element("h3", "productive-smart-widget-title", widget.title);
  const metric = element("strong", "productive-smart-widget-metric", formatMetric(widget.primaryMetric));
  const subtitle = element("p", "productive-smart-widget-subtitle", widget.subtitle);
  const reason = element("p", "productive-smart-widget-reason", widget.whyNow ? `Por qué ahora: ${widget.whyNow}` : "");

  article.append(eyebrow, title);
  if (metric.textContent) article.appendChild(metric);
  article.append(subtitle);
  const chart = renderMiniChart(widget.chartReady);
  if (chart) article.appendChild(chart);
  if (reason.textContent) article.appendChild(reason);

  const footer = element("div", "productive-smart-widget-footer");
  const confidence = element("span", "productive-smart-widget-confidence", `Confianza ${text(widget.confidence).toLowerCase()}`);
  footer.appendChild(confidence);

  if (widget.reviewAction?.label) {
    const action = element("button", "productive-smart-widget-action", widget.reviewAction.label);
    action.type = "button";
    action.addEventListener("click", () => onAction(widget));
    footer.appendChild(action);
  }
  article.appendChild(footer);
  return article;
}

function stateLabel(state) {
  const labels = {
    READY: "Conectado",
    PARTIAL: "Parcial",
    STALE: "Desactualizado",
    BLOCKED_BY_MISSING_EVIDENCE: "Falta evidencia",
    SOURCE_UNAVAILABLE: "Fuente no disponible",
    NOT_CONNECTED: "No conectado",
    SESSION_REQUIRED: "Requiere sesión",
    EMPTY: "Sin señales",
    LOADING: "Cargando",
    HIDDEN_BY_SCOPE: "Fuera de alcance",
  };
  return labels[state] || text(state);
}

function renderPending(root, message, state = "LOADING") {
  root.replaceChildren();
  root.hidden = false;
  root.dataset.smartWidgetStackState = state;
  const card = element("article", "productive-smart-widget productive-smart-widget-status");
  card.append(
    element("p", "productive-smart-widget-eyebrow", "RESUMEN DEL DÍA"),
    element("h3", "productive-smart-widget-title", message),
  );
  root.appendChild(card);
}

export function createProductiveSmartWidgetHomeAdapter({
  root,
  buildStack,
  onAction = (widget) => {
    if (widget?.deepLink) window.location.href = widget.deepLink;
  },
  now = () => new Date().toISOString(),
  timeZone = "America/Mexico_City",
} = {}) {
  if (!(root instanceof Element)) throw new TypeError("Smart Widget Home adapter root is required");
  if (typeof buildStack !== "function") throw new TypeError("Smart Widget Home adapter buildStack is required");
  if (typeof onAction !== "function") throw new TypeError("Smart Widget Home adapter onAction is required");
  if (root[ADAPTER_STATE]) return root[ADAPTER_STATE];

  let mounted = false;
  let requestRevision = 0;
  let controller = null;
  let previousSelection = null;
  let currentStack = null;

  function abortCurrent(reason = "smart-widget-reconcile") {
    if (!controller?.signal.aborted) controller?.abort(reason);
    controller = null;
  }

  function render(stack) {
    currentStack = stack;
    root.replaceChildren();
    root.dataset.smartWidgetStackState = stack.stackStatus;

    if (stack.stackStatus === "SESSION_REQUIRED") {
      root.hidden = true;
      return;
    }
    root.hidden = false;

    const heading = element("div", "productive-smart-widget-heading");
    heading.append(element("p", "productive-smart-widget-section-title", "RESUMEN DEL DÍA"));
    const allButton = element("button", "productive-smart-widget-see-all", "Ver fuentes");
    allButton.type = "button";
    heading.appendChild(allButton);
    root.appendChild(heading);

    const visible = Array.isArray(stack.visible) ? stack.visible : [];
    if (!visible.length) {
      renderPending(root, "No hay una señal suficientemente confiable en este momento.", "EMPTY");
      return;
    }

    const cards = element("div", "productive-smart-widget-cards");
    visible.forEach((widget, index) => cards.appendChild(renderWidget(widget, {
      primary: index === 0,
      onAction,
    })));
    root.appendChild(cards);

    const inventory = element("section", "productive-smart-widget-inventory");
    inventory.hidden = true;
    inventory.setAttribute("aria-label", "Estado de las fuentes del resumen");
    for (const widget of Array.isArray(stack.inventory) ? stack.inventory : []) {
      const row = element("div", "productive-smart-widget-inventory-row");
      row.dataset.widgetState = widget.state;
      row.append(element("strong", "", widget.title), element("span", "", stateLabel(widget.state)));
      inventory.appendChild(row);
    }
    root.appendChild(inventory);
    allButton.addEventListener("click", () => {
      inventory.hidden = !inventory.hidden;
      allButton.textContent = inventory.hidden ? "Ver fuentes" : "Ocultar fuentes";
    });
  }

  async function reconcile({ session, sources, additionalWidgets = [] } = {}) {
    if (!mounted) return null;
    abortCurrent();
    controller = new AbortController();
    const activeController = controller;
    const revision = ++requestRevision;
    renderPending(root, "Leyendo las señales que importan ahora…");

    try {
      const stack = await buildStack({
        now: now(),
        timeZone,
        session,
        sources,
        additionalWidgets,
        previousSelection,
        signal: activeController.signal,
      });
      if (activeController.signal.aborted || revision !== requestRevision) return null;
      render(stack);
      if (stack.primary?.widgetId) {
        previousSelection = {
          primaryWidgetId: stack.primary.widgetId,
          selectedAt: stack.generatedAt || now(),
        };
      }
      return stack;
    } catch (error) {
      if (error?.name === "AbortError" || activeController.signal.aborted || revision !== requestRevision) return null;
      console.error("Forge productive Smart Widgets reconcile failed", error);
      renderPending(root, "Las señales no están disponibles. Forge no mostrará datos inventados.", "SOURCE_UNAVAILABLE");
      return null;
    }
  }

  function mount() {
    if (mounted) return;
    mounted = true;
    root.hidden = false;
    root.dataset.productiveSmartWidgetAdapter = "mounted";
  }

  function scrub(reason = "session-scrub") {
    requestRevision += 1;
    abortCurrent(reason);
    currentStack = null;
    previousSelection = null;
    root.replaceChildren();
    root.hidden = true;
    root.dataset.smartWidgetStackState = "SESSION_REQUIRED";
    root.dataset.productiveSmartWidgetScrub = reason;
  }

  function unmount() {
    mounted = false;
    scrub("smart-widget-unmount");
    root.dataset.productiveSmartWidgetAdapter = "unmounted";
  }

  const api = Object.freeze({
    mount,
    reconcile,
    scrub,
    unmount,
    getStack: () => currentStack,
  });
  root[ADAPTER_STATE] = api;
  return api;
}

export const PRODUCTIVE_SMART_WIDGET_CHART_BINDING_VERSION = "REP_CHART_READY_SERIES_POINTS_V1";
