import { forgeAliveSmartWidgetStackPreview } from "./smart-widget-stack-data.js?v=053K";

const params = new URLSearchParams(window.location.search);

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined && text !== null) node.textContent = text;
  return node;
}

function familyLabel(value) {
  return String(value || "")
    .replace(/_WIDGET_FAMILY$/, "")
    .replace(/_WIDGET$/, "")
    .replace(/_/g, " ")
    .toLowerCase();
}

function initialContextIndex(contexts) {
  const requested = params.get("context");
  if (requested) {
    const match = contexts.findIndex((context) => context.id === requested);
    if (match >= 0) return match;
  }

  const hour = new Date().getHours();
  if (hour >= 15) return Math.max(0, contexts.findIndex((context) => context.id === "four-pm-review"));
  if (hour >= 7 && hour <= 10) return Math.max(0, contexts.findIndex((context) => context.id === "morning-agenda"));
  return Math.max(0, contexts.findIndex((context) => context.id === "follow-up-risk"));
}

function renderChip(text, tone) {
  const chip = el("span", `smart-widget-chip ${tone || ""}`.trim(), text);
  chip.setAttribute("aria-label", text);
  return chip;
}

function renderDots(count, activeIndex) {
  const dots = el("div", "smart-widget-dots");
  dots.setAttribute("aria-label", "Smart widget position");
  dots.style.setProperty("--dot-progress", String(activeIndex));
  dots.style.setProperty("--dot-index", String(activeIndex));
  dots.style.setProperty("--dot-count", String(count));

  const glider = el("span", "smart-widget-dot-glider");
  glider.setAttribute("aria-hidden", "true");
  dots.appendChild(glider);

  for (let index = 0; index < count; index += 1) {
    const dot = el("span", index === activeIndex ? "smart-widget-dot active" : "smart-widget-dot");
    dot.setAttribute("aria-hidden", "true");
    dots.appendChild(dot);
  }

  return dots;
}

function updateDots(root, activeIndex, progress = activeIndex) {
  const dotsRoot = root.querySelector(".smart-widget-dots");
  if (!dotsRoot) return;

  const previousProgress = Number(dotsRoot.style.getPropertyValue("--dot-progress") || "0");
  dotsRoot.style.setProperty("--dot-progress", String(progress));
  dotsRoot.style.setProperty("--dot-index", String(activeIndex));

  dotsRoot.classList.toggle("moving-right", progress >= previousProgress);
  dotsRoot.classList.toggle("moving-left", progress < previousProgress);
  dotsRoot.classList.add("is-moving");

  window.clearTimeout(dotsRoot._glideTimer);
  dotsRoot._glideTimer = window.setTimeout(() => {
    dotsRoot.classList.remove("moving-left", "moving-right", "is-moving");
  }, 130);

  const dots = [...dotsRoot.querySelectorAll(".smart-widget-dot")];
  dots.forEach((dot, index) => dot.classList.toggle("active", index === activeIndex));
}

function syncDotsFromScroll(root, carousel, contexts) {
  const width = carousel.clientWidth || 1;
  const rawProgress = carousel.scrollLeft / width;
  const maxIndex = Math.max(0, contexts.length - 1);
  const progress = Math.max(0, Math.min(maxIndex, rawProgress));
  const activeIndex = Math.max(0, Math.min(maxIndex, Math.round(progress)));
  updateDots(root, activeIndex, progress);
}

function renderEvidence(items) {
  const wrap = el("div", "smart-widget-evidence");
  wrap.appendChild(el("span", "smart-widget-mini-label", "Evidence"));
  wrap.appendChild(el("p", "", (items || []).join(" · ")));
  return wrap;
}

function renderWidget(widget, index) {
  const card = el("article", "smart-widget-card glass");

  const top = el("div", "smart-widget-card-top");
  const titleBlock = el("div", "smart-widget-title-block");
  titleBlock.appendChild(el("p", "smart-widget-eyebrow", familyLabel(widget.family)));
  titleBlock.appendChild(el("h3", "", widget.title));
  titleBlock.appendChild(el("p", "smart-widget-subtitle", widget.subtitle));
  top.appendChild(titleBlock);

  const priority = el("div", "smart-widget-priority");
  priority.appendChild(el("span", "", String(widget.priority)));
  priority.appendChild(el("small", "", index === 0 ? "TOP" : "CTX"));
  top.appendChild(priority);
  card.appendChild(top);

  const chips = el("div", "smart-widget-chips");
  chips.appendChild(renderChip("Human final authority", "gold"));
  chips.appendChild(renderChip("Review only", ""));
  chips.appendChild(renderChip("Not approved", ""));
  chips.appendChild(renderChip("Not sendable", ""));
  chips.appendChild(renderChip("Delivery locked", ""));
  card.appendChild(chips);

  card.appendChild(el("p", "smart-widget-why", `Why now: ${widget.whyNow}`));
  card.appendChild(renderEvidence(widget.evidence));
  card.appendChild(el("p", "smart-widget-uncertainty", `Uncertainty: ${widget.uncertainty}`));
  card.appendChild(el("p", "article-zero-reminder compact", forgeAliveSmartWidgetStackPreview.article0));
  card.appendChild(el("p", "smart-widget-prompt", widget.prompt));

  return card;
}

function renderSlide(context) {
  const slide = el("section", "smart-widget-slide");
  slide.setAttribute("aria-label", context.label);

  const header = el("div", "smart-widget-slide-header");
  header.appendChild(el("p", "smart-widget-eyebrow", context.label));
  header.appendChild(el("h3", "", context.selectedWhen));
  header.appendChild(el("p", "smart-widget-subtitle", "Desliza para revisar otros contextos."));
  slide.appendChild(header);

  const stack = el("div", "smart-widget-slide-stack");
  context.widgets
    .slice()
    .sort((a, b) => b.priority - a.priority)
    .forEach((widget, index) => stack.appendChild(renderWidget(widget, index)));
  slide.appendChild(stack);

  return slide;
}

function main() {
  const target = document.getElementById("smart-widget-stack");
  if (!target) return;

  const contexts = forgeAliveSmartWidgetStackPreview.contexts;
  const activeIndex = initialContextIndex(contexts);
  target.innerHTML = "";

  const header = el("header", "smart-widget-header glass");
  header.appendChild(el("p", "smart-widget-eyebrow", forgeAliveSmartWidgetStackPreview.version));
  header.appendChild(el("h2", "", "Smart Widget Stack"));
  header.appendChild(el("p", "smart-widget-subtitle", "Desliza el stack. Forge muestra contexto; el humano decide."));
  target.appendChild(header);

  const carousel = el("section", "smart-widget-carousel");
  carousel.setAttribute("aria-label", "Swipe smart widget stack contexts");
  contexts.forEach((context) => carousel.appendChild(renderSlide(context)));
  target.appendChild(carousel);

  target.appendChild(renderDots(contexts.length, activeIndex));

  requestAnimationFrame(() => {
    const targetSlide = carousel.children[activeIndex];
    if (targetSlide) targetSlide.scrollIntoView({ behavior: "auto", inline: "start", block: "nearest" });
    updateDots(target, activeIndex);
  });

  let rafId = 0;
  carousel.addEventListener("scroll", () => {
    if (rafId) return;
    rafId = window.requestAnimationFrame(() => {
      rafId = 0;
      syncDotsFromScroll(target, carousel, contexts);
    });
  }, { passive: true });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", main);
} else {
  main();
}
