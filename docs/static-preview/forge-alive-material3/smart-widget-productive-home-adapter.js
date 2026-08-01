const ADAPTER_STATE = Symbol.for("forge.smart-widgets.productive-home-adapter.v1");

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

function renderMiniChart(chartReady) {
  const series = Array.isArray(chartReady?.series) ? chartReady.series : [];
  const values = series.map((point) => Number(point.y ?? point.value)).filter(Number.isFinite);
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

function renderWidget(widget, { primary, navigate }) {
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

  if (widget.deepLink && widget.reviewAction?.label) {
    const action = element("button", "productive-smart-widget-action", widget.reviewAction.label);
    action.type = "button";
    action.addEventListener("click", () => navigate(widget.deepLink, widget));
    footer.appendChild(action);
  }
  article.appendChild(footer);
  return article;
}

function renderPending(root, message) {
  root.replaceChildren();
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
  navigate = (deepLink) => { window.location.href = deepLink; },
  now = () => new Date().toISOString(),
  timeZone = "America/Mexico_City",
} = {}) {
  if (!(root instanceof Element)) throw new TypeError("Smart Widget Home adapter root is required");
  if (typeof buildStack !== "function") throw new TypeError("Smart Widget Home adapter buildStack is required");
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
    const allButton = element("button", "productive-smart-widget-see-all", "Ver todo");
    allButton.type = "button";
    heading.appendChild(allButton);
    root.appendChild(heading);

    const visible = Array.isArray(stack.visible) ? stack.visible : [];
    if (!visible.length) {
      renderPending(root, "No hay una señal suficientemente confiable en este momento.");
      return;
    }

    const cards = element("div", "productive-smart-widget-cards");
    visible.forEach((widget, index) => cards.appendChild(renderWidget(widget, {
      primary: index === 0,
      navigate,
    })));
    root.appendChild(cards);

    const inventory = element("section", "productive-smart-widget-inventory");
    inventory.hidden = true;
    inventory.setAttribute("aria-label", "Todas las señales disponibles");
    for (const widget of Array.isArray(stack.inventory) ? stack.inventory : []) {
      const row = element("div", "productive-smart-widget-inventory-row");
      row.append(element("strong", "", widget.title), element("span", "", widget.state));
      inventory.appendChild(row);
    }
    root.appendChild(inventory);
    allButton.addEventListener("click", () => {
      inventory.hidden = !inventory.hidden;
      allButton.textContent = inventory.hidden ? "Ver todo" : "Ocultar";
    });
  }

  async function reconcile({ session, sources, additionalWidgets = [] } = {}) {
    if (!mounted) return null;
    abortCurrent();
    controller = new AbortController();
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
        signal: controller.signal,
      });
      if (controller.signal.aborted || revision !== requestRevision) return null;
      render(stack);
      if (stack.primary?.widgetId) {
        previousSelection = {
          primaryWidgetId: stack.primary.widgetId,
          selectedAt: stack.generatedAt || now(),
        };
      }
      return stack;
    } catch (error) {
      if (error?.name === "AbortError" || controller.signal.aborted || revision !== requestRevision) return null;
      console.error("Forge productive Smart Widgets reconcile failed", error);
      renderPending(root, "Las señales no están disponibles. Forge no mostrará datos inventados.");
      root.dataset.smartWidgetStackState = "SOURCE_UNAVAILABLE";
      return null;
    }
  }

  function mount() {
    if (mounted) return;
    mounted = true;
    root.hidden = false;
    root.dataset.productiveSmartWidgetAdapter = "mounted";
  }

  function unmount() {
    mounted = false;
    requestRevision += 1;
    abortCurrent("smart-widget-unmount");
    currentStack = null;
    previousSelection = null;
    root.replaceChildren();
    root.hidden = true;
    root.dataset.productiveSmartWidgetAdapter = "unmounted";
  }

  const api = Object.freeze({
    mount,
    reconcile,
    unmount,
    getStack: () => currentStack,
  });
  root[ADAPTER_STATE] = api;
  return api;
}
