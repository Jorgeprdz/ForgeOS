import { forgeAliveSmartWidgetStackPreview } from "./smart-widget-stack-data.js";

const params = new URLSearchParams(window.location.search);

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined && text !== null) node.textContent = text;
  return node;
}

function list(title, items) {
  const wrap = el("div", "smart-widget-list");
  wrap.appendChild(el("h4", "", title));
  const ul = el("ul");
  for (const item of items || []) ul.appendChild(el("li", "", item));
  wrap.appendChild(ul);
  return wrap;
}

function pickContext() {
  const requested = params.get("context");
  const contexts = forgeAliveSmartWidgetStackPreview.contexts;
  if (requested) {
    const match = contexts.find((context) => context.id === requested);
    if (match) return match;
  }

  const hour = new Date().getHours();
  if (hour >= 15) return contexts.find((context) => context.id === "four-pm-review");
  if (hour >= 7 && hour <= 10) return contexts.find((context) => context.id === "morning-agenda");
  return contexts.find((context) => context.id === "follow-up-risk") || contexts[0];
}

function renderChip(text, tone) {
  const chip = el("span", `smart-widget-chip ${tone || ""}`.trim(), text);
  chip.setAttribute("aria-label", text);
  return chip;
}

function renderWidget(widget, index) {
  const card = el("article", "smart-widget-card glass");
  card.appendChild(el("p", "smart-widget-eyebrow", widget.family));
  card.appendChild(el("h3", "", widget.title));
  card.appendChild(el("p", "smart-widget-subtitle", widget.subtitle));

  const chips = el("div", "smart-widget-chips");
  chips.appendChild(renderChip("Human final authority", "gold"));
  chips.appendChild(renderChip("Review only", ""));
  chips.appendChild(renderChip("Not approved", ""));
  chips.appendChild(renderChip("Not sendable", ""));
  chips.appendChild(renderChip("Delivery locked", ""));
  card.appendChild(chips);

  const meta = el("div", "smart-widget-meta");
  meta.appendChild(el("span", "", `Priority ${widget.priority}`));
  meta.appendChild(el("span", "", index === 0 ? "Top context" : "Contextual"));
  card.appendChild(meta);

  card.appendChild(el("p", "smart-widget-why", `Why now: ${widget.whyNow}`));
  card.appendChild(list("Evidence", widget.evidence));
  card.appendChild(el("p", "smart-widget-uncertainty", `Uncertainty: ${widget.uncertainty}`));
  card.appendChild(el("p", "article-zero-reminder compact", forgeAliveSmartWidgetStackPreview.article0));
  card.appendChild(el("p", "smart-widget-prompt", widget.prompt));

  return card;
}

function renderContextNav(activeContext) {
  const nav = el("div", "smart-widget-contexts");
  for (const context of forgeAliveSmartWidgetStackPreview.contexts) {
    const item = el("a", context.id === activeContext.id ? "active" : "", context.label);
    item.href = `?context=${encodeURIComponent(context.id)}`;
    item.setAttribute("aria-label", `Preview context ${context.label}`);
    nav.appendChild(item);
  }
  return nav;
}

function main() {
  const target = document.getElementById("smart-widget-stack");
  if (!target) return;

  const context = pickContext();
  target.innerHTML = "";

  const header = el("header", "smart-widget-header");
  header.appendChild(el("p", "smart-widget-eyebrow", forgeAliveSmartWidgetStackPreview.version));
  header.appendChild(el("h2", "", "Smart Widget Stack"));
  header.appendChild(el("p", "smart-widget-subtitle", context.selectedWhen));
  header.appendChild(renderContextNav(context));
  target.appendChild(header);

  const grid = el("section", "smart-widget-grid");
  context.widgets
    .slice()
    .sort((a, b) => b.priority - a.priority)
    .forEach((widget, index) => grid.appendChild(renderWidget(widget, index)));
  target.appendChild(grid);
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", main);
} else {
  main();
}
