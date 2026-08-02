const VERSION = "SEGUBECA-PROGRESSIVE-LAYOUT-001";
const THEME = "SEGUBECA_BLUE_GOLD";
const STYLE_MARKER = "data-segubeca-progressive-layout-styles";
const PROJECTION_SELECTOR = "[data-material3-quotes-projection]";
const DASHBOARD_SELECTOR = '[data-forge-product-type="segubeca"]';
const HERO_SELECTOR = '[data-forge-hero-metric="true"]';

const SECTION_ORDER = Object.freeze({
  hero: 1,
  summary: 2,
  participants: 3,
  contribution: 4,
  education_goal: 5,
  payout: 6,
  protection: 7,
  included_benefits: 8,
  additional_coverages: 9,
  secondary_details: 10,
  missing_information: 11,
});

const SECTION_SPANS = Object.freeze({
  hero: 12,
  summary: 6,
  participants: 6,
  contribution: 6,
  education_goal: 6,
  payout: 6,
  protection: 6,
  included_benefits: 6,
  additional_coverages: 6,
  secondary_details: 12,
  missing_information: 12,
});

let observer = null;
let observedProjection = null;
let scheduled = false;
let lastReason = "boot";

function normalize(value) {
  return String(value || "")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

function exactSumAssuredLabel(value) {
  const key = normalize(value);
  return key === "suma asegurada" || key === "suma asegurada basica";
}

function installStyles() {
  if (document.querySelector(`[${STYLE_MARKER}]`)) return false;
  const style = document.createElement("style");
  style.setAttribute(STYLE_MARKER, "true");
  style.textContent = `
    ${PROJECTION_SELECTOR}[data-product-dashboard="segubeca"] {
      --segubeca-blue: #5bb6ff;
      --segubeca-blue-strong: #2389e8;
      --segubeca-blue-soft: rgba(91, 182, 255, .16);
      --segubeca-gold: #f2c75c;
      --segubeca-line: rgba(91, 182, 255, .30);
    }
    ${PROJECTION_SELECTOR}[data-product-dashboard="segubeca"] ${DASHBOARD_SELECTOR} {
      --fq-r11m-title: var(--segubeca-blue);
      --fq-r11m-udi: #d8ecff;
      --fq-r11m-mxn: var(--segubeca-gold);
      --fq-r11m-line: var(--segubeca-line);
      --fq-r11m-panel: rgba(7, 25, 48, .86);
      --fq-r11m-tile: rgba(50, 142, 225, .07);
      grid-auto-flow: row !important;
    }
    ${PROJECTION_SELECTOR}[data-product-dashboard="segubeca"] ${DASHBOARD_SELECTOR} .fq-benefit-card-107z15p2 {
      border-color: var(--segubeca-line);
      background: linear-gradient(150deg, rgba(22, 67, 112, .58), rgba(7, 23, 44, .90));
      box-shadow: 0 18px 42px rgba(2, 17, 35, .20);
    }
    ${PROJECTION_SELECTOR}[data-product-dashboard="segubeca"] ${DASHBOARD_SELECTOR} ${HERO_SELECTOR} {
      grid-column: 1 / -1 !important;
      padding: clamp(24px, 3vw, 36px);
      border-color: rgba(91, 182, 255, .54);
      background:
        radial-gradient(circle at 82% 18%, rgba(242, 199, 92, .17), transparent 34%),
        linear-gradient(135deg, rgba(35, 137, 232, .42), rgba(7, 29, 57, .96));
      box-shadow: 0 22px 56px rgba(2, 18, 39, .34), inset 0 1px 0 rgba(255, 255, 255, .08);
    }
    ${PROJECTION_SELECTOR}[data-product-dashboard="segubeca"] .fq-benefit-hero-label-r16b {
      color: var(--segubeca-gold);
      font-size: .84rem;
      font-weight: 900;
      letter-spacing: .08em;
      text-transform: uppercase;
    }
    ${PROJECTION_SELECTOR}[data-product-dashboard="segubeca"] .fq-benefit-hero-value-r16b {
      color: #f5faff;
      font-size: clamp(2rem, 4vw, 3.65rem);
      font-weight: 950;
      line-height: 1.02;
      letter-spacing: -.035em;
    }
    ${PROJECTION_SELECTOR}[data-product-dashboard="segubeca"] .fq-benefit-hero-secondary-value-r16b {
      color: var(--segubeca-gold);
      font-weight: 900;
    }
    ${PROJECTION_SELECTOR}[data-product-dashboard="segubeca"] .segubeca-authority-note {
      border-color: rgba(91, 182, 255, .34);
      background: linear-gradient(135deg, rgba(35, 137, 232, .14), rgba(7, 29, 57, .62));
    }
    ${PROJECTION_SELECTOR}[data-product-dashboard="segubeca"] .segubeca-authority-note strong {
      color: var(--segubeca-blue);
    }
    [data-segubeca-promoted-hero-source="true"] { display: none !important; }
    @media (max-width: 760px) {
      ${PROJECTION_SELECTOR}[data-product-dashboard="segubeca"] ${DASHBOARD_SELECTOR} ${HERO_SELECTOR} {
        padding: 22px 18px;
      }
      ${PROJECTION_SELECTOR}[data-product-dashboard="segubeca"] .fq-benefit-hero-value-r16b {
        font-size: clamp(1.8rem, 10vw, 2.75rem);
      }
    }
  `;
  document.head.append(style);
  return true;
}

function metricLabelNode(node) {
  return node?.querySelector?.([
    ".fq-benefit-label-107z15p2",
    ".fq-benefit-compact-metadata-label-r16b",
    ".quotes-mandatory-metric > span:first-child",
    "dt",
  ].join(", ")) || null;
}

function metricValueNode(node) {
  return node?.querySelector?.([
    ".fq-benefit-value-107z15p2",
    ".fq-benefit-compact-metadata-value-r16b",
    ".quotes-mandatory-metric > strong",
    "dd",
  ].join(", ")) || null;
}

function exactSumAssuredMetric(projection, hero) {
  const candidates = projection.querySelectorAll([
    ".quotes-mandatory-metric",
    ".fq-benefit-mini-card-107z15p2",
    ".fq-benefit-row-107z15p2",
    ".fq-benefit-compact-metadata-item-r16b",
  ].join(", "));
  for (const node of candidates) {
    if (node === hero || hero?.contains(node) || node.hidden) continue;
    const label = metricLabelNode(node);
    const value = metricValueNode(node);
    if (label && value && exactSumAssuredLabel(label.textContent)) {
      return { node, value };
    }
  }
  return null;
}

function valueParts(valueNode) {
  const explicitLines = [...valueNode.querySelectorAll(
    ".quotes-value-line, .fq-benefit-value-part-107z15p2",
  )]
    .map((node) => String(node.textContent || "").trim())
    .filter(Boolean);
  if (explicitLines.length) {
    return {
      primary: explicitLines[0],
      secondary: explicitLines.slice(1).join(" · ") || null,
    };
  }
  const text = String(valueNode.textContent || "").replace(/\s+/g, " ").trim();
  if (!text) return { primary: null, secondary: null };
  const match = text.match(/^(.*?\bUDI)\s*(?:·|\n)?\s*(≈\s*\$.*)$/i);
  return match
    ? { primary: match[1].trim(), secondary: match[2].trim() }
    : { primary: text, secondary: null };
}

function ensureHeroSecondary(hero, secondaryValue) {
  let secondary = hero.querySelector(".fq-benefit-hero-secondary-r16b");
  if (!secondaryValue) {
    secondary?.remove();
    return;
  }
  if (!secondary) {
    secondary = document.createElement("div");
    secondary.className = "fq-benefit-hero-secondary-r16b";
    hero.append(secondary);
  }
  let label = secondary.querySelector(".fq-benefit-hero-secondary-label-r16b");
  if (!label) {
    label = document.createElement("div");
    label.className = "fq-benefit-hero-secondary-label-r16b";
    secondary.append(label);
  }
  if (label.textContent !== "Equivalencia en MXN") label.textContent = "Equivalencia en MXN";
  let value = secondary.querySelector(".fq-benefit-hero-secondary-value-r16b");
  if (!value) {
    value = document.createElement("div");
    value.className = "fq-benefit-hero-secondary-value-r16b";
    secondary.append(value);
  }
  if (value.textContent !== secondaryValue) value.textContent = secondaryValue;
}

function promoteSumAssured(projection, dashboard) {
  const hero = dashboard.querySelector(HERO_SELECTOR);
  if (!hero) return false;
  const metric = exactSumAssuredMetric(projection, hero);
  if (!metric) {
    return exactSumAssuredLabel(
      hero.querySelector(".fq-benefit-hero-label-r16b")?.textContent,
    );
  }
  const parts = valueParts(metric.value);
  const heroLabel = hero.querySelector(".fq-benefit-hero-label-r16b");
  const heroValue = hero.querySelector(".fq-benefit-hero-value-r16b");
  if (!parts.primary || !heroLabel || !heroValue) return false;
  if (heroLabel.textContent !== "Suma asegurada") heroLabel.textContent = "Suma asegurada";
  if (heroValue.textContent !== parts.primary) heroValue.textContent = parts.primary;
  ensureHeroSecondary(hero, parts.secondary);
  hero.dataset.forgeHeroSourceField = "sum_assured_exact_display";
  hero.dataset.segubecaHeroPromoted = "true";
  metric.node.dataset.segubecaPromotedHeroSource = "true";
  return true;
}

function sectionKind(node) {
  if (node.matches?.(HERO_SELECTOR)) return "hero";
  return String(
    node.dataset?.forgeProductSection
      || node.dataset?.forgeLayoutRole
      || node.dataset?.forgeBenefitBlock
      || "",
  ).trim();
}

function arrangeSections(dashboard) {
  const current = [...dashboard.children];
  const desired = current
    .map((node, originalIndex) => ({ node, originalIndex, kind: sectionKind(node) }))
    .sort((left, right) => {
      const leftOrder = SECTION_ORDER[left.kind] ?? 100;
      const rightOrder = SECTION_ORDER[right.kind] ?? 100;
      return leftOrder - rightOrder || left.originalIndex - right.originalIndex;
    });

  for (const { node, kind } of desired) {
    const order = SECTION_ORDER[kind];
    const span = SECTION_SPANS[kind];
    if (Number.isInteger(order)) {
      node.dataset.forgeLayoutOrder = String(order);
      if (node.style.order !== String(order)) node.style.order = String(order);
    }
    if (Number.isInteger(span)) {
      node.dataset.forgeDesktopSpan = String(span);
      node.dataset.forgeTabletSpan = kind === "hero" || span === 12 ? "8" : "4";
      const gridColumn = span === 12 ? "1 / -1" : "span 6";
      if (node.style.gridColumn !== gridColumn) node.style.gridColumn = gridColumn;
    }
  }

  const orderChanged = desired.some(({ node }, index) => current[index] !== node);
  if (orderChanged) dashboard.append(...desired.map(({ node }) => node));
}

function reconnectObserver(projection) {
  if (!observer || observedProjection !== projection) return;
  observer.observe(projection, { childList: true, subtree: true });
}

function apply(reason = "manual") {
  installStyles();
  const projection = document.querySelector(PROJECTION_SELECTOR);
  const dashboard = projection?.querySelector(DASHBOARD_SELECTOR);
  if (!projection || !dashboard) return false;

  const observing = observer && observedProjection === projection;
  if (observing) observer.disconnect();
  try {
    projection.dataset.segubecaTheme = THEME;
    dashboard.dataset.forgeProductTheme = "segubeca_blue_gold";
    dashboard.dataset.forgeProductLayout = "segubeca_progressive_001";
    promoteSumAssured(projection, dashboard);
    arrangeSections(dashboard);
    document.documentElement.dataset.segubecaProgressiveLayout = VERSION;
    document.documentElement.dataset.segubecaProgressiveLayoutLastReason = reason;
    return true;
  } finally {
    if (observing) reconnectObserver(projection);
  }
}

function schedule(reason = "event") {
  lastReason = reason;
  if (scheduled) return;
  scheduled = true;
  const enqueue = globalThis.requestAnimationFrame
    ? (callback) => globalThis.requestAnimationFrame(callback)
    : (callback) => globalThis.setTimeout(callback, 0);
  enqueue(() => {
    scheduled = false;
    apply(lastReason);
  });
}

function observeProjection() {
  const projection = document.querySelector(PROJECTION_SELECTOR);
  if (!projection) return false;
  if (observedProjection === projection && observer) {
    schedule("projection-reused");
    return true;
  }
  observer?.disconnect();
  observedProjection = projection;
  observer = new MutationObserver(() => schedule("projection-mutated"));
  reconnectObserver(projection);
  schedule("projection-observed");
  return true;
}

function install() {
  installStyles();
  observeProjection();
  schedule("install");
  return true;
}

for (const eventName of [
  "forge:quotes-module-ready",
  "forge:quote-preview-calculated",
  "forge:segubeca-productive-calculation-ready",
  "forge:accepted-quote-confirmed",
  "forge:segubeca-productive-quote-confirmed",
]) {
  globalThis.addEventListener?.(eventName, () => {
    observeProjection();
    schedule(eventName);
  });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", install, { once: true });
} else {
  queueMicrotask(install);
}

globalThis.ForgeSegubecaProgressiveLayout = Object.freeze({
  version: VERSION,
  theme: THEME,
  apply,
  install,
  schedule,
});

export {
  SECTION_ORDER,
  SECTION_SPANS,
  THEME,
  VERSION,
  apply,
  install,
  schedule,
};
