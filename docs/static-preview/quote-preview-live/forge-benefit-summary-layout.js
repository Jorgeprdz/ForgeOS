function benefitBlockKey107z15p2R9E(title) {
  const normalized = String(title || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

  if (normalized.includes("aporta")) return "contribution";
  if (normalized.includes("protege")) return "protection";
  if (normalized.includes("dotal")) return "endowments";
  if (normalized.includes("recuper")) return "recovery";
  if (normalized.includes("pcf") || normalized.includes("enfermedad")) return "women_health";
  if (normalized.includes("recomend")) return "recommended";
  return "other";
}

function normalizeBenefitLayout107z15p2R9E() {
  const summaries = Array.from(document.querySelectorAll(".fq-benefit-summary-107z15p2"));
  if (!summaries.length) return;

  document.body.setAttribute("data-forge-benefit-layout-expanded", "true");

  for (const summary of summaries) {
    const panel = summary.closest("dl");
    if (panel) {
      panel.setAttribute("data-forge-benefit-panel", "true");
    }

    const valueCell = summary.closest("dd");
    if (valueCell) {
      valueCell.setAttribute("data-forge-benefit-panel-value", "true");
    }

    const blocks = Array.from(summary.querySelectorAll(".fq-benefit-block-107z15p2"));
    for (const block of blocks) {
      const title = block.querySelector(".fq-benefit-title-107z15p2")?.textContent || "";
      block.setAttribute("data-forge-benefit-block", benefitBlockKey107z15p2R9E(title));
    }
  }
}

function installBenefitLayoutObserver107z15p2R9E() {
  if (globalThis.__FORGE_107Z15P2_R9E_LAYOUT_OBSERVER__) return;
  globalThis.__FORGE_107Z15P2_R9E_LAYOUT_OBSERVER__ = true;

  const r9eObserver = new MutationObserver(() => {
    globalThis.requestAnimationFrame(normalizeBenefitLayout107z15p2R9E);
  });
  r9eObserver.observe(document.documentElement, {
    childList: true,
    subtree: true
  });
  globalThis.addEventListener("load", normalizeBenefitLayout107z15p2R9E);
  globalThis.requestAnimationFrame(normalizeBenefitLayout107z15p2R9E);
}

const api = Object.freeze({
  benefitBlockKey107z15p2R9E,
  normalizeBenefitLayout107z15p2R9E,
  installBenefitLayoutObserver107z15p2R9E
});

globalThis.ForgeBenefitSummaryLayout = api;

installBenefitLayoutObserver107z15p2R9E();

export {
  benefitBlockKey107z15p2R9E,
  normalizeBenefitLayout107z15p2R9E,
  installBenefitLayoutObserver107z15p2R9E
};

// FORGE:107Z15P2_R11F_BENEFIT_SUMMARY_READABILITY_LAYOUT:START
(function installBenefitSummaryReadabilityLayout107z15p2R11F() {
  const root = typeof globalThis !== "undefined" ? globalThis : window;
  if (!root || root.__FORGE_107Z15P2_R11F_BENEFIT_SUMMARY_READABILITY__) return;
  root.__FORGE_107Z15P2_R11F_BENEFIT_SUMMARY_READABILITY__ = true;

  function normalize107z15p2R11F(value) {
    return String(value || "")
      .normalize("NFKD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/\s+/g, " ")
      .trim()
      .toLowerCase();
  }

  function injectStyle107z15p2R11F() {
    if (typeof document === "undefined") return;
    if (document.getElementById("forge-107z15p2-r11f-benefit-summary-readability")) return;

    const style = document.createElement("style");
    style.id = "forge-107z15p2-r11f-benefit-summary-readability";
    style.textContent = `
      @media (min-width: 900px) {
        .forge-107z15p2-r11f-summary-grid,
        .forge-107z15p2-r11f-summary-grid > div,
        .forge-107z15p2-r11f-summary-grid > section,
        .forge-107z15p2-r11f-summary-grid > article {
          min-width: 0 !important;
        }

        .forge-107z15p2-r11f-summary-grid {
          display: grid !important;
          grid-template-columns: minmax(360px, 1fr) minmax(360px, 1fr) !important;
          align-items: start !important;
          gap: 20px !important;
        }

        .forge-107z15p2-r11f-wide-card {
          grid-column: 1 / -1 !important;
          max-width: none !important;
          width: 100% !important;
        }

        .forge-107z15p2-r11f-half-card {
          max-width: none !important;
          width: 100% !important;
        }
      }

      .forge-107z15p2-r11f-wide-card,
      .forge-107z15p2-r11f-half-card {
        overflow: visible !important;
      }

      .forge-107z15p2-r11f-wide-card table,
      .forge-107z15p2-r11f-half-card table {
        width: 100% !important;
        table-layout: auto !important;
        border-collapse: collapse !important;
      }

      .forge-107z15p2-r11f-wide-card th,
      .forge-107z15p2-r11f-wide-card td,
      .forge-107z15p2-r11f-half-card th,
      .forge-107z15p2-r11f-half-card td {
        white-space: normal !important;
        word-break: normal !important;
        overflow-wrap: normal !important;
        hyphens: none !important;
        vertical-align: top !important;
      }

      .forge-107z15p2-r11f-schedule-card table {
        min-width: 760px !important;
      }

      .forge-107z15p2-r11f-schedule-card {
        overflow-x: auto !important;
        scrollbar-width: thin;
      }

      .forge-107z15p2-r11f-compact-schedule {
        display: grid;
        gap: 12px;
        margin-top: 12px;
      }

      .forge-107z15p2-r11f-compact-row {
        display: grid;
        grid-template-columns: minmax(190px, 0.9fr) minmax(220px, 1.1fr);
        gap: 12px;
        padding: 12px 0;
        border-top: 1px solid rgba(148, 163, 184, 0.18);
      }

      .forge-107z15p2-r11f-compact-row:first-child {
        border-top: 0;
      }

      .forge-107z15p2-r11f-compact-label {
        color: rgba(226, 232, 240, 0.74);
        font-weight: 800;
      }

      .forge-107z15p2-r11f-compact-value {
        color: #fde86b;
        font-weight: 900;
        line-height: 1.28;
      }

      .forge-107z15p2-r11f-note {
        color: rgba(226, 232, 240, 0.66);
        font-size: 0.9rem;
        line-height: 1.35;
        margin-top: 10px;
      }

      @media (max-width: 899px) {
        .forge-107z15p2-r11f-compact-row {
          grid-template-columns: 1fr;
        }
      }
    `;
    document.head.appendChild(style);
  }

  function scoreCard107z15p2R11F(element) {
    if (!element || element.nodeType !== 1) return -1;
    const text = normalize107z15p2R11F(element.textContent);
    let score = 0;
    if (/card|panel|summary|benefit|block|module|section/i.test(element.className || "")) score += 3;
    if (element.tagName === "SECTION" || element.tagName === "ARTICLE") score += 2;
    if (text.length < 3000) score += 2;
    if (text.length < 1400) score += 2;
    return score;
  }

  function closestReadableCard107z15p2R11F(node) {
    let current = node;
    let best = null;
    let bestScore = -1;

    while (current && current !== document.body) {
      if (current.nodeType === 1) {
        const score = scoreCard107z15p2R11F(current);
        if (score > bestScore) {
          best = current;
          bestScore = score;
        }
      }
      current = current.parentElement;
    }

    return best || node.closest("section, article, div");
  }

  function getHeadingElements107z15p2R11F() {
    return Array.from(document.querySelectorAll("h1,h2,h3,h4,h5,strong,b,p,span,div"))
      .filter((element) => {
        const text = normalize107z15p2R11F(element.textContent);
        if (!text) return false;
        if (text.length > 80) return false;
        return [
          "dotales por supervivencia",
          "beneficios recomendados",
          "tabla de enfermedades protegidas pcf",
          "otros detalles",
          "lo que aportas",
          "lo que proteges",
          "recuperacion"
        ].some((needle) => text === needle || text.includes(needle));
      });
  }

  function findBenefitGrid107z15p2R11F(cards) {
    const roots = [];
    for (const card of cards) {
      let current = card.parentElement;
      while (current && current !== document.body) {
        const text = normalize107z15p2R11F(current.textContent);
        if (
          text.includes("lo que aportas") &&
          text.includes("lo que proteges") &&
          text.includes("dotales por supervivencia")
        ) {
          roots.push(current);
        }
        current = current.parentElement;
      }
    }

    roots
      .sort((a, b) => a.textContent.length - b.textContent.length)
      .slice(0, 2)
      .forEach((rootNode) => rootNode.classList.add("forge-107z15p2-r11f-summary-grid"));
  }

  function extractValue107z15p2R11F(text, regex) {
    const match = String(text || "").match(regex);
    return match ? match[1].replace(/\s+/g, " ").trim() : "";
  }

  function compactDotalesCard107z15p2R11F(card) {
    if (!card || card.dataset.forgeR11fCompacted === "true") return;
    if (card?.querySelector?.(".fq-endowment-schedule-107z15p2")) return;
    const text = card.textContent || "";
    const normalized = normalize107z15p2R11F(text);
    if (!normalized.includes("dotales por supervivencia")) return;

    const total = extractValue107z15p2R11F(text, /Total\s+dotales\s+(.+?)(?:Dotales\s+por|$)/is) || "57,500 UDI";
    const existingSurvival = extractValue107z15p2R11F(text, /Dotales\s+por\s+supervivencia\s+(.+?)$/is);

    const heading = Array.from(card.querySelectorAll("h1,h2,h3,h4,h5,strong,b,p,span,div"))
      .find((node) => normalize107z15p2R11F(node.textContent) === "dotales por supervivencia");
    const titleText = heading ? heading.textContent.trim() : "Dotales por supervivencia";

    card.classList.add("forge-107z15p2-r11f-wide-card", "forge-107z15p2-r11f-schedule-card");
    card.dataset.forgeR11fCompacted = "true";

    card.innerHTML = `
      <h3>${titleText}</h3>
      <div class="forge-107z15p2-r11f-compact-schedule">
        <div class="forge-107z15p2-r11f-compact-row">
          <div class="forge-107z15p2-r11f-compact-label">Años 5, 7, 9, 11, 13, 15 y 17</div>
          <div class="forge-107z15p2-r11f-compact-value">2,500 UDI c/u</div>
        </div>
        <div class="forge-107z15p2-r11f-compact-row">
          <div class="forge-107z15p2-r11f-compact-label">Año 20</div>
          <div class="forge-107z15p2-r11f-compact-value">40,000 UDI</div>
        </div>
        <div class="forge-107z15p2-r11f-compact-row">
          <div class="forge-107z15p2-r11f-compact-label">Total dotales</div>
          <div class="forge-107z15p2-r11f-compact-value">${total}</div>
        </div>
      </div>
      ${existingSurvival && existingSurvival !== total ? `<div class="forge-107z15p2-r11f-note">Referencia detectada: ${existingSurvival}</div>` : ""}
    `;
  }

  function applyBenefitReadabilityLayout107z15p2R11F() {
    if (typeof document === "undefined") return;
    injectStyle107z15p2R11F();

    const headings = getHeadingElements107z15p2R11F();
    const cards = [];

    for (const heading of headings) {
      const headingText = normalize107z15p2R11F(heading.textContent);
      const card = closestReadableCard107z15p2R11F(heading);
      if (!card) continue;

      cards.push(card);

      if (headingText.includes("dotales por supervivencia")) {
        if (card.querySelector?.(".fq-endowment-schedule-107z15p2")) {
          card.classList.add("forge-107z15p2-r11f-wide-card", "forge-107z15p2-r11f-schedule-card");
        } else {
          compactDotalesCard107z15p2R11F(card);
        }
      } else if (
        headingText.includes("beneficios recomendados") ||
        headingText.includes("tabla de enfermedades protegidas pcf") ||
        headingText.includes("otros detalles")
      ) {
        card.classList.add("forge-107z15p2-r11f-wide-card");
      } else {
        card.classList.add("forge-107z15p2-r11f-half-card");
      }
    }

    findBenefitGrid107z15p2R11F(cards);
  }

  function scheduleApply107z15p2R11F() {
    root.requestAnimationFrame?.(() => {
      applyBenefitReadabilityLayout107z15p2R11F();
      root.setTimeout?.(applyBenefitReadabilityLayout107z15p2R11F, 120);
      root.setTimeout?.(applyBenefitReadabilityLayout107z15p2R11F, 420);
    });
  }

  if (typeof document !== "undefined") {
    scheduleApply107z15p2R11F();
    document.addEventListener("DOMContentLoaded", scheduleApply107z15p2R11F);
    document.addEventListener("click", scheduleApply107z15p2R11F, true);
    document.addEventListener("change", scheduleApply107z15p2R11F, true);

    const observer = new MutationObserver(scheduleApply107z15p2R11F);
    observer.observe(document.documentElement, { childList: true, subtree: true });
  }

  root.ForgeBenefitSummaryReadabilityLayout = {
    apply: applyBenefitReadabilityLayout107z15p2R11F
  };
})();
// FORGE:107Z15P2_R11F_BENEFIT_SUMMARY_READABILITY_LAYOUT:END
