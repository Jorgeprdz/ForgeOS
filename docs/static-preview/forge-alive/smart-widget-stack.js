import { forgeAliveSmartWidgetStackPreview } from "./smart-widget-stack-data.js?v=053L";

const SMART_WIDGET_FAMILY_LABELS = Object.freeze({
  COMMISSION_UPDATE_WIDGET_FAMILY: "ACTUALIZACION DE COMISION",
  FOLLOW_UP_RISK_WIDGET_FAMILY: "SEGUIMIENTO",
  DAILY_REVIEW_WIDGET_FAMILY: "REVISION DIARIA",
  MONTHLY_GOAL_WIDGET_FAMILY: "META MENSUAL",
  GENESIS_REVIEW_PACKET_WIDGET_FAMILY: "REVISION GENESIS",
  JUDGMENT_GATE_WIDGET_FAMILY: "JUICIO HUMANO",
});

function formatWidgetFamilyLabel(family) {
  const key = String(family || "");
  return SMART_WIDGET_FAMILY_LABELS[key] || key.replace(/_WIDGET_FAMILY$/, "").replaceAll("_", " ");
}

const params = new URLSearchParams(window.location.search);
const CARD_LEVEL_CAROUSEL_RULE = "one smart widget card per slide";

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

function flattenWidgets(contexts) {
  return contexts.flatMap((context) =>
    context.widgets
      .slice()
      .sort((a, b) => b.priority - a.priority)
      .map((widget, index) => ({
        ...widget,
        contextId: context.id,
        contextLabel: context.label,
        contextReason: context.selectedWhen,
        contextIndex: index,
      }))
  );
}

function initialCardIndex(cards) {
  const requested = params.get("context");
  if (requested) {
    const match = cards.findIndex((card) => card.contextId === requested);
    if (match >= 0) return match;
  }

  const hour = new Date().getHours();
  if (hour >= 15) return Math.max(0, cards.findIndex((card) => card.contextId === "four-pm-review"));
  if (hour >= 7 && hour <= 10) return Math.max(0, cards.findIndex((card) => card.contextId === "morning-agenda"));
  return Math.max(0, cards.findIndex((card) => card.contextId === "follow-up-risk"));
}

function renderChip(text, tone) {
  const chip = el("span", `smart-widget-chip ${tone || ""}`.trim(), text);
  chip.setAttribute("aria-label", text);
  return chip;
}

function renderDots(count, activeIndex) {
  const dots = el("div", "smart-widget-dots");
  dots.setAttribute("aria-label", "Smart widget card position");
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

function syncDotsFromScroll(root, carousel, cards) {
  const width = carousel.clientWidth || 1;
  const rawProgress = carousel.scrollLeft / width;
  const maxIndex = Math.max(0, cards.length - 1);
  const progress = Math.max(0, Math.min(maxIndex, rawProgress));
  const activeIndex = Math.max(0, Math.min(maxIndex, Math.round(progress)));
  updateDots(root, activeIndex, progress);
}

function renderEvidencia(items) {
  const wrap = el("div", "smart-widget-evidence");
  wrap.appendChild(el("span", "smart-widget-mini-label", "Evidencia"));
  wrap.appendChild(el("p", "", (items || []).join(" · ")));
  return wrap;
}

function renderWidget(card, index) {
  const slide = el("section", "smart-widget-slide");
  slide.setAttribute("aria-label", `${card.contextLabel}: ${card.title}`);

  const article = el("article", "smart-widget-card glass");

  const context = el("div", "smart-widget-slide-header");
  context.appendChild(el("p", "smart-widget-eyebrow", card.contextLabel));
  context.appendChild(el("h3", "", card.contextReason));
  context.appendChild(el("p", "smart-widget-subtitle", "Desliza una tarjeta a la vez."));
  article.appendChild(context);

  const top = el("div", "smart-widget-card-top");
  const titleBlock = el("div", "smart-widget-title-block");
  titleBlock.appendChild(el("p", "smart-widget-eyebrow", formatWidgetFamilyLabel(card.family)));
  titleBlock.appendChild(el("h3", "", card.title));
  titleBlock.appendChild(el("p", "smart-widget-subtitle", card.subtitle));
  top.appendChild(titleBlock);

  const priority = el("div", "smart-widget-priority");
  priority.appendChild(el("span", "", String(card.priority)));
  priority.appendChild(el("small", "", index === 0 ? "PRIORIDAD" : "SEÑAL"));
  top.appendChild(priority);
  article.appendChild(top);

  const chips = el("div", "smart-widget-chips");
  chips.appendChild(renderChip("Autoridad humana", "gold"));
  chips.appendChild(renderChip("Solo revisión", ""));
  chips.appendChild(renderChip("No aprobado", ""));
  chips.appendChild(renderChip("No enviable", ""));
  chips.appendChild(renderChip("Entrega bloqueada", ""));
  article.appendChild(chips);

  article.appendChild(el("p", "smart-widget-why", `Por qué ahora: ${card.whyNow}`));
  article.appendChild(renderEvidencia(card.evidence));
  article.appendChild(el("p", "smart-widget-uncertainty", `Incertidumbre: ${card.uncertainty}`));
  article.appendChild(el("p", "article-zero-reminder compact", forgeAliveSmartWidgetStackPreview.article0));
  article.appendChild(el("p", "smart-widget-prompt", card.prompt));

  slide.appendChild(article);
  return slide;
}

function main() {
  const target = document.getElementById("smart-widget-stack");
  if (!target) return;

  const contexts = forgeAliveSmartWidgetStackPreview.contexts;
  const cards = flattenWidgets(contexts);
  const activeIndex = initialCardIndex(cards);
  target.innerHTML = "";

  const header = el("header", "smart-widget-header glass");
  header.appendChild(el("p", "smart-widget-eyebrow", forgeAliveSmartWidgetStackPreview.version));
  header.appendChild(el("h2", "", "Señales para decidir"));
  header.appendChild(el("p", "smart-widget-subtitle", "Desliza una tarjeta. Forge muestra contexto; el humano decide."));
  target.appendChild(header);

  const carousel = el("section", "smart-widget-carousel card-level");
  carousel.setAttribute("aria-label", "Tarjetas de contexto vivo");
  cards.forEach((card, index) => carousel.appendChild(renderWidget(card, index)));
  target.appendChild(carousel);

  target.appendChild(renderDots(cards.length, activeIndex));

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
      syncDotsFromScroll(target, carousel, cards);
    });
  }, { passive: true });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", main);
} else {
  main();
}

/* FORGEOS:SMART_WIDGET_MOUSE_CONTROLS_056G3:START */
function initSmartWidgetMouseControls056G3() {
  const root = document.getElementById("smart-widget-stack");
  if (!root || root.dataset.mouseControls056g3 === "ready") return;

  const carousel = root.querySelector(".smart-widget-carousel");
  if (!carousel) return;

  root.dataset.mouseControls056g3 = "ready";
  carousel.setAttribute("tabindex", "0");
  carousel.setAttribute("aria-roledescription", "carousel");

  const controls = document.createElement("div");
  controls.className = "smart-widget-mouse-controls";
  controls.setAttribute("aria-label", "Controles de tarjetas de contexto");

  const previous = document.createElement("button");
  previous.type = "button";
  previous.className = "smart-widget-control smart-widget-control-previous";
  previous.setAttribute("aria-label", "Ver tarjeta anterior");
  previous.textContent = "Anterior";

  const next = document.createElement("button");
  next.type = "button";
  next.className = "smart-widget-control smart-widget-control-next";
  next.setAttribute("aria-label", "Ver tarjeta siguiente");
  next.textContent = "Siguiente";

  controls.appendChild(previous);
  controls.appendChild(next);
  carousel.insertAdjacentElement("beforebegin", controls);

  const getStep = () => {
    const firstCard = carousel.firstElementChild;
    if (!firstCard) return Math.max(280, Math.round(carousel.clientWidth * 0.82));
    const cardBox = firstCard.getBoundingClientRect();
    return Math.max(260, Math.round(cardBox.width + 18));
  };

  const updateButtons = () => {
    const maxScroll = Math.max(0, carousel.scrollWidth - carousel.clientWidth - 2);
    previous.disabled = carousel.scrollLeft <= 2;
    next.disabled = carousel.scrollLeft >= maxScroll;
  };

  previous.addEventListener("click", () => {
    carousel.scrollBy({ left: -getStep(), behavior: "smooth" });
  });

  next.addEventListener("click", () => {
    carousel.scrollBy({ left: getStep(), behavior: "smooth" });
  });

  carousel.addEventListener("scroll", updateButtons, { passive: true });
  window.addEventListener("resize", updateButtons);

  carousel.addEventListener("keydown", (event) => {
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      previous.click();
    }
    if (event.key === "ArrowRight") {
      event.preventDefault();
      next.click();
    }
  });

  updateButtons();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initSmartWidgetMouseControls056G3);
} else {
  initSmartWidgetMouseControls056G3();
}
/* FORGEOS:SMART_WIDGET_MOUSE_CONTROLS_056G3:END */
