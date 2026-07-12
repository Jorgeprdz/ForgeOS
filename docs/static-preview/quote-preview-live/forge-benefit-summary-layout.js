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

// FORGE:107Z15P2_R11H_DOTALES_UI_AND_CONTRIBUTION_ROWS:START
(function installDotalesUiAndContributionRows107z15p2R11H() {
  const root = typeof globalThis !== "undefined" ? globalThis : window;
  if (!root || root.__FORGE_107Z15P2_R11H_DOTALES_UI__) return;
  root.__FORGE_107Z15P2_R11H_DOTALES_UI__ = true;

  function normalize107z15p2R11H(value) {
    return String(value || "")
      .normalize("NFKD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/\s+/g, " ")
      .trim()
      .toLowerCase();
  }

  function injectStyle107z15p2R11H() {
    if (typeof document === "undefined") return;
    if (document.getElementById("forge-107z15p2-r11h-dotales-ui")) return;

    const style = document.createElement("style");
    style.id = "forge-107z15p2-r11h-dotales-ui";
    style.textContent = `
      .forge-r11h-dotales-card {
        grid-column: 1 / -1 !important;
        width: 100% !important;
        max-width: none !important;
        overflow: visible !important;
        position: relative !important;
        z-index: 1 !important;
      }

      .forge-r11h-dotales-card .fq-endowment-schedule-107z15p2,
      .forge-r11h-dotales-card .fq-endowment-schedule-card-107z15p2,
      .forge-r11h-dotales-card .fq-endowment-schedule-table-107z15p2 {
        display: none !important;
      }

      .forge-r11h-dotales-ui {
        display: grid;
        gap: 14px;
        width: 100%;
        overflow: visible;
      }

      .forge-r11h-dotales-help {
        display: inline-flex;
        width: fit-content;
        max-width: 100%;
        border: 1px solid rgba(245, 216, 74, 0.28);
        border-radius: 999px;
        padding: 7px 12px;
        background: rgba(245, 216, 74, 0.08);
        color: rgba(255, 255, 255, 0.78);
        font-size: 0.92rem;
        font-weight: 900;
      }

      .forge-r11h-dotales-chips {
        display: grid;
        grid-template-columns: repeat(7, minmax(86px, 1fr));
        gap: 10px;
      }

      .forge-r11h-dotales-chip,
      .forge-r11h-dotales-summary-item {
        min-width: 0;
        border: 1px solid rgba(132, 222, 245, 0.16);
        border-radius: 14px;
        background: rgba(255, 255, 255, 0.045);
        padding: 11px;
      }

      .forge-r11h-dotales-year {
        color: rgba(226, 232, 240, 0.78);
        font-size: 0.86rem;
        font-weight: 900;
      }

      .forge-r11h-dotales-udi {
        margin-top: 6px;
        color: #f5d84a;
        font-size: 0.98rem;
        font-weight: 950;
        line-height: 1.16;
      }

      .forge-r11h-dotales-mxn {
        margin-top: 6px;
        color: #f5d84a;
        font-size: 0.78rem;
        font-weight: 850;
        line-height: 1.18;
        opacity: 0.92;
      }

      .forge-r11h-dotales-summary {
        display: grid;
        grid-template-columns: minmax(220px, 0.7fr) minmax(260px, 1fr);
        gap: 12px;
      }

      .forge-r11h-dotales-summary-label {
        color: rgba(226, 232, 240, 0.78);
        font-size: 0.9rem;
        font-weight: 900;
      }

      .forge-r11h-dotales-summary-value {
        margin-top: 7px;
        color: #f5d84a;
        font-size: 1.08rem;
        font-weight: 950;
        line-height: 1.18;
      }

      .forge-r11h-dotales-summary-mxn {
        margin-top: 5px;
        color: #f5d84a;
        font-size: 0.86rem;
        font-weight: 850;
        line-height: 1.2;
      }

      @media (max-width: 1180px) {
        .forge-r11h-dotales-chips {
          grid-template-columns: repeat(4, minmax(94px, 1fr));
        }

        .forge-r11h-dotales-summary {
          grid-template-columns: 1fr;
        }
      }

      @media (max-width: 760px) {
        .forge-r11h-dotales-chips {
          grid-template-columns: repeat(2, minmax(110px, 1fr));
        }
      }

      body[data-forge-benefit-layout-expanded="true"] .fq-quote-summary-105dr .fq-benefit-block-107z15p2,
      body[data-forge-benefit-layout-expanded="true"] .fq-quote-summary-105dr [class*="benefit"] {
        word-break: normal !important;
        overflow-wrap: normal !important;
        hyphens: none !important;
      }
    `;
    document.head.appendChild(style);
  }

  function looksLikeCard107z15p2R11H(element) {
    if (!element || element.nodeType !== 1) return false;
    const className = String(element.className || "");
    const tag = element.tagName;
    return /card|block|panel|summary|section|benefit/i.test(className) ||
      tag === "SECTION" ||
      tag === "ARTICLE";
  }

  function closestCard107z15p2R11H(node) {
    let current = node;
    let best = null;
    let bestScore = -1;

    while (current && current !== document.body) {
      if (looksLikeCard107z15p2R11H(current)) {
        const textLength = (current.textContent || "").length;
        let score = 10000 - textLength;
        if (/fq-benefit-block-107z15p2/.test(String(current.className || ""))) score += 5000;
        if ((current.textContent || "").length < 2500) score += 1000;
        if (score > bestScore) {
          best = current;
          bestScore = score;
        }
      }
      current = current.parentElement;
    }

    return best || node.closest("section, article, div");
  }

  function findCardByTitle107z15p2R11H(title) {
    const normalizedTitle = normalize107z15p2R11H(title);
    const nodes = Array.from(document.querySelectorAll("h1,h2,h3,h4,h5,strong,b,p,span,div"));
    const heading = nodes.find((node) => {
      const text = normalize107z15p2R11H(node.textContent);
      return text === normalizedTitle || text.includes(normalizedTitle);
    });
    return heading ? closestCard107z15p2R11H(heading) : null;
  }

  function extractScheduleFromExisting107z15p2R11H(card) {
    const result = {
      years: ["5", "7", "9", "11", "13", "15", "17"],
      udis: [],
      mxns: [],
      finalUdi: "40,000 UDI",
      finalMxn: "",
      totalUdi: "57,500 UDI",
      totalMxn: ""
    };

    const table = card.querySelector(".fq-endowment-schedule-table-107z15p2");
    if (table) {
      const rows = Array.from(table.querySelectorAll("tr")).map((tr) => {
        return Array.from(tr.children).map((cell) => cell.textContent.trim());
      });

      const yearsRow = rows.find((row) => normalize107z15p2R11H(row[0]) === "anos");
      const udiRow = rows.find((row) => normalize107z15p2R11H(row[0]) === "udi");
      const mxnRow = rows.find((row) => normalize107z15p2R11H(row[0]) === "mxn");

      if (yearsRow?.length > 1) result.years = yearsRow.slice(1);
      if (udiRow?.length > 1) result.udis = udiRow.slice(1);
      if (mxnRow?.length > 1) result.mxns = mxnRow.slice(1);
    }

    if (!result.udis.length) {
      result.udis = result.years.map(() => "2,500 UDI");
    }

    const scheduleCards = Array.from(card.querySelectorAll(".fq-endowment-schedule-card-107z15p2"));
    for (const item of scheduleCards) {
      const text = item.textContent || "";
      const normalized = normalize107z15p2R11H(text);
      const strong = item.querySelector("strong")?.textContent?.trim();

      if (normalized.includes("ano 20")) {
        if (strong) result.finalUdi = strong;
        const mxn = Array.from(item.querySelectorAll("span"))
          .map((node) => node.textContent.trim())
          .find((value) => /MXN/i.test(value));
        if (mxn) result.finalMxn = mxn;
      }

      if (normalized.includes("total dotales") || normalized.includes("recuperacion por supervivencia")) {
        if (strong) result.totalUdi = strong;
        const mxn = Array.from(item.querySelectorAll("span"))
          .map((node) => node.textContent.trim())
          .find((value) => /MXN/i.test(value));
        if (mxn) result.totalMxn = mxn;
      }
    }

    const fullText = card.textContent || "";
    if (!result.finalMxn) {
      const match = fullText.match(/40,000\s+UDI\s*[·•-]?\s*(≈\s*\$[0-9,]+\s*MXN)/i);
      if (match) result.finalMxn = match[1];
    }
    if (!result.totalMxn) {
      const match = fullText.match(/57,500\s+UDI\s*[·•-]?\s*(≈\s*\$[0-9,]+\s*MXN)/i);
      if (match) result.totalMxn = match[1];
    }

    return result;
  }

  function rebuildDotalesCard107z15p2R11H() {
    const card = findCardByTitle107z15p2R11H("Dotales por supervivencia");
    if (!card) return;
    if (card.dataset.forgeR11hDotales === "true") return;

    const data = extractScheduleFromExisting107z15p2R11H(card);
    card.classList.add("forge-r11h-dotales-card");
    card.dataset.forgeR11hDotales = "true";

    const oldSchedules = Array.from(card.querySelectorAll(".forge-r11h-dotales-ui"));
    oldSchedules.forEach((node) => node.remove());

    const legacySchedule = card.querySelector(".fq-endowment-schedule-107z15p2");
    if (!legacySchedule && !normalize107z15p2R11H(card.textContent).includes("57,500")) return;

    const ui = document.createElement("div");
    ui.className = "forge-r11h-dotales-ui";

    const help = document.createElement("div");
    help.className = "forge-r11h-dotales-help";
    help.textContent = "5% = 2,500 UDI c/u";
    ui.appendChild(help);

    const chips = document.createElement("div");
    chips.className = "forge-r11h-dotales-chips";

    data.years.forEach((year, index) => {
      const chip = document.createElement("div");
      chip.className = "forge-r11h-dotales-chip";

      const yearNode = document.createElement("div");
      yearNode.className = "forge-r11h-dotales-year";
      yearNode.textContent = `Año ${year}`;

      const udiNode = document.createElement("div");
      udiNode.className = "forge-r11h-dotales-udi";
      udiNode.textContent = data.udis[index] || "2,500 UDI";

      chip.append(yearNode, udiNode);

      const mxnValue = data.mxns[index];
      if (mxnValue) {
        const mxnNode = document.createElement("div");
        mxnNode.className = "forge-r11h-dotales-mxn";
        mxnNode.textContent = mxnValue;
        chip.appendChild(mxnNode);
      }

      chips.appendChild(chip);
    });

    ui.appendChild(chips);

    const summary = document.createElement("div");
    summary.className = "forge-r11h-dotales-summary";

    const finalItem = document.createElement("div");
    finalItem.className = "forge-r11h-dotales-summary-item";
    finalItem.innerHTML = `
      <div class="forge-r11h-dotales-summary-label">Año 20 (80%)</div>
      <div class="forge-r11h-dotales-summary-value"></div>
      <div class="forge-r11h-dotales-summary-mxn"></div>
    `;
    finalItem.querySelector(".forge-r11h-dotales-summary-value").textContent = data.finalUdi || "40,000 UDI";
    finalItem.querySelector(".forge-r11h-dotales-summary-mxn").textContent = data.finalMxn || "";

    const totalItem = document.createElement("div");
    totalItem.className = "forge-r11h-dotales-summary-item";
    totalItem.innerHTML = `
      <div class="forge-r11h-dotales-summary-label">Total dotales / recuperación por supervivencia</div>
      <div class="forge-r11h-dotales-summary-value"></div>
      <div class="forge-r11h-dotales-summary-mxn"></div>
    `;
    totalItem.querySelector(".forge-r11h-dotales-summary-value").textContent = data.totalUdi || "57,500 UDI";
    totalItem.querySelector(".forge-r11h-dotales-summary-mxn").textContent = data.totalMxn || "";

    summary.append(finalItem, totalItem);
    ui.appendChild(summary);

    const legacyRows = Array.from(card.querySelectorAll(".fq-endowment-schedule-107z15p2, .forge-107z15p2-r11f-compact-schedule"));
    legacyRows.forEach((node) => {
      node.style.display = "none";
      node.setAttribute("aria-hidden", "true");
    });

    const titleNode = Array.from(card.querySelectorAll("h1,h2,h3,h4,h5,strong,b,p,span,div"))
      .find((node) => normalize107z15p2R11H(node.textContent) === "dotales por supervivencia");

    if (titleNode) {
      titleNode.insertAdjacentElement("afterend", ui);
    } else {
      card.prepend(ui);
    }
  }

  function rowText107z15p2R11H(node) {
    return normalize107z15p2R11H(node?.textContent || "");
  }

  function rowCandidates107z15p2R11H(card) {
    if (!card) return [];
    return Array.from(card.querySelectorAll("tr, li, .fq-benefit-row-107z15p2, .fq-benefit-detail-row-107z15p2, div"))
      .filter((node) => {
        const text = rowText107z15p2R11H(node);
        return text.length > 0 && text.length < 260;
      });
  }

  function findBestRowByLabel107z15p2R11H(card, label) {
    const needle = normalize107z15p2R11H(label);
    const rows = rowCandidates107z15p2R11H(card);
    return rows
      .filter((row) => rowText107z15p2R11H(row).includes(needle))
      .sort((left, right) => rowText107z15p2R11H(left).length - rowText107z15p2R11H(right).length)[0] || null;
  }

  function moveContributionRows107z15p2R11H() {
    const contributionCard = findCardByTitle107z15p2R11H("Lo que aportas");
    const detailsCard = findCardByTitle107z15p2R11H("Otros detalles");
    if (!contributionCard || !detailsCard) return;

    const labels = [
      "Prima anual base",
      "Prima AVE anual",
      "Prima anual total con AVE",
      "Plazo de pago"
    ];

    for (const label of labels) {
      if (rowText107z15p2R11H(contributionCard).includes(normalize107z15p2R11H(label))) continue;

      const sourceRow = findBestRowByLabel107z15p2R11H(detailsCard, label);
      if (!sourceRow) continue;

      const clone = sourceRow.cloneNode(true);
      clone.setAttribute("data-forge-r11h-moved-contribution", "true");
      contributionCard.appendChild(clone);
      sourceRow.remove();
    }
  }

  function applyR11H107z15p2() {
    if (typeof document === "undefined") return;
    injectStyle107z15p2R11H();
    rebuildDotalesCard107z15p2R11H();
    moveContributionRows107z15p2R11H();
  }

  function schedule107z15p2R11H() {
    root.requestAnimationFrame?.(() => {
      applyR11H107z15p2();
      root.setTimeout?.(applyR11H107z15p2, 80);
      root.setTimeout?.(applyR11H107z15p2, 260);
      root.setTimeout?.(applyR11H107z15p2, 700);
    });
  }

  if (typeof document !== "undefined") {
    schedule107z15p2R11H();
    document.addEventListener("DOMContentLoaded", schedule107z15p2R11H);
    document.addEventListener("click", schedule107z15p2R11H, true);
    document.addEventListener("change", schedule107z15p2R11H, true);

    const observer = new MutationObserver(schedule107z15p2R11H);
    observer.observe(document.documentElement, { childList: true, subtree: true });
  }

  root.ForgeR11HDotalesUi = {
    apply: applyR11H107z15p2
  };
})();
// FORGE:107Z15P2_R11H_DOTALES_UI_AND_CONTRIBUTION_ROWS:END

// FORGE:107Z15P2_R11I_DESKTOP_BOARD_LAYOUT:START
(function installDesktopBoardLayout107z15p2R11I() {
  const root = typeof globalThis !== "undefined" ? globalThis : window;
  if (!root || root.__FORGE_107Z15P2_R11I_DESKTOP_BOARD__) return;
  root.__FORGE_107Z15P2_R11I_DESKTOP_BOARD__ = true;

  const TITLES_107Z15P2_R11I = {
    contribution: "Lo que aportas",
    protection: "Lo que proteges",
    dotales: "Dotales por supervivencia",
    recovery: "Recuperación",
    pcf: "Tabla de enfermedades protegidas PCF",
    recommended: "Beneficios recomendados",
    details: "Otros detalles"
  };

  function normalize107z15p2R11I(value) {
    return String(value || "")
      .normalize("NFKD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/\s+/g, " ")
      .trim()
      .toLowerCase();
  }

  function injectStyle107z15p2R11I() {
    if (typeof document === "undefined") return;
    if (document.getElementById("forge-107z15p2-r11i-desktop-board")) return;

    const style = document.createElement("style");
    style.id = "forge-107z15p2-r11i-desktop-board";
    style.textContent = `
      :root {
        --forge-r11i-title: #f5d84a;
        --forge-r11i-label: rgba(226, 232, 240, 0.78);
        --forge-r11i-udi: #ffe66d;
        --forge-r11i-mxn: #7dd3fc;
        --forge-r11i-note: rgba(148, 163, 184, 0.78);
        --forge-r11i-line: rgba(132, 222, 245, 0.16);
        --forge-r11i-card: rgba(255, 255, 255, 0.045);
      }

      body[data-forge-benefit-layout-expanded="true"] .fq-quote-summary-105dr {
        width: min(96vw, 1480px) !important;
        max-width: none !important;
        overflow: visible !important;
      }

      .forge-r11i-board {
        display: grid !important;
        grid-template-columns: repeat(12, minmax(0, 1fr)) !important;
        gap: 18px !important;
        align-items: start !important;
        width: 100% !important;
        max-width: none !important;
        overflow: visible !important;
      }

      .forge-r11i-card {
        min-width: 0 !important;
        width: 100% !important;
        max-width: none !important;
        position: relative !important;
        z-index: 1 !important;
        overflow: hidden !important;
      }

      .forge-r11i-card-contribution { grid-column: span 7 !important; }
      .forge-r11i-card-protection { grid-column: span 5 !important; }
      .forge-r11i-card-dotales { grid-column: 1 / -1 !important; }
      .forge-r11i-card-recovery { grid-column: span 4 !important; }
      .forge-r11i-card-pcf { grid-column: span 4 !important; }
      .forge-r11i-card-recommended { grid-column: span 4 !important; }
      .forge-r11i-card-details { grid-column: 1 / -1 !important; opacity: 0.92; }

      .forge-r11i-card h1,
      .forge-r11i-card h2,
      .forge-r11i-card h3,
      .forge-r11i-card h4,
      .forge-r11i-card h5 {
        color: var(--forge-r11i-title) !important;
      }

      .forge-r11i-card .fq-benefit-row-107z15p2,
      .forge-r11i-card .fq-benefit-detail-row-107z15p2,
      .forge-r11i-card tr,
      .forge-r11i-card li {
        border-color: var(--forge-r11i-line) !important;
      }

      .forge-r11i-card * {
        word-break: normal !important;
        overflow-wrap: normal !important;
        hyphens: none !important;
      }

      .forge-r11i-contribution-grid {
        display: grid;
        grid-template-columns: repeat(5, minmax(116px, 1fr));
        gap: 10px;
        margin-top: 12px;
      }

      .forge-r11i-contribution-tile {
        min-width: 0;
        border: 1px solid var(--forge-r11i-line);
        border-radius: 13px;
        background: var(--forge-r11i-card);
        padding: 10px;
      }

      .forge-r11i-contribution-label {
        color: var(--forge-r11i-label);
        font-size: 0.75rem;
        font-weight: 900;
        line-height: 1.15;
      }

      .forge-r11i-contribution-value {
        margin-top: 7px;
        color: var(--forge-r11i-udi);
        font-size: 0.94rem;
        font-weight: 950;
        line-height: 1.15;
      }

      .forge-r11i-contribution-value .forge-r11i-mxn,
      .forge-r11i-mxn {
        color: var(--forge-r11i-mxn) !important;
      }

      .forge-r11i-note {
        color: var(--forge-r11i-note) !important;
      }

      .forge-r11i-card-dotales .forge-r11h-dotales-chips {
        grid-template-columns: repeat(7, minmax(94px, 1fr)) !important;
        gap: 12px !important;
      }

      .forge-r11i-card-dotales .forge-r11h-dotales-summary {
        grid-template-columns: repeat(2, minmax(260px, 1fr)) !important;
      }

      .forge-r11i-card-dotales .forge-r11h-dotales-ui + *,
      .forge-r11i-card-dotales .forge-r11h-dotales-ui ~ .fq-benefit-row-107z15p2,
      .forge-r11i-card-dotales .forge-r11h-dotales-ui ~ .fq-benefit-detail-row-107z15p2 {
        display: none !important;
      }

      @media (max-width: 1220px) {
        .forge-r11i-board {
          grid-template-columns: repeat(8, minmax(0, 1fr)) !important;
        }

        .forge-r11i-card-contribution,
        .forge-r11i-card-protection,
        .forge-r11i-card-recovery,
        .forge-r11i-card-pcf,
        .forge-r11i-card-recommended {
          grid-column: span 4 !important;
        }

        .forge-r11i-card-dotales,
        .forge-r11i-card-details {
          grid-column: 1 / -1 !important;
        }

        .forge-r11i-contribution-grid {
          grid-template-columns: repeat(3, minmax(120px, 1fr));
        }

        .forge-r11i-card-dotales .forge-r11h-dotales-chips {
          grid-template-columns: repeat(4, minmax(110px, 1fr)) !important;
        }
      }

      @media (max-width: 760px) {
        .forge-r11i-board {
          grid-template-columns: 1fr !important;
        }

        .forge-r11i-card-contribution,
        .forge-r11i-card-protection,
        .forge-r11i-card-dotales,
        .forge-r11i-card-recovery,
        .forge-r11i-card-pcf,
        .forge-r11i-card-recommended,
        .forge-r11i-card-details {
          grid-column: 1 / -1 !important;
        }

        .forge-r11i-contribution-grid,
        .forge-r11i-card-dotales .forge-r11h-dotales-chips,
        .forge-r11i-card-dotales .forge-r11h-dotales-summary {
          grid-template-columns: 1fr !important;
        }
      }
    `;
    document.head.appendChild(style);
  }

  function findTitleNode107z15p2R11I(title) {
    const needle = normalize107z15p2R11I(title);
    return Array.from(document.querySelectorAll("h1,h2,h3,h4,h5,strong,b,p,span,div"))
      .filter((node) => {
        const text = normalize107z15p2R11I(node.textContent);
        return text && text.length <= 96 && (text === needle || text.includes(needle));
      })
      .sort((left, right) => normalize107z15p2R11I(left.textContent).length - normalize107z15p2R11I(right.textContent).length)[0] || null;
  }

  function scoreCard107z15p2R11I(element) {
    if (!element || element.nodeType !== 1) return -1;
    const textLength = (element.textContent || "").length;
    const className = String(element.className || "");
    let score = 0;
    if (/fq-benefit-block-107z15p2|forge-r11h-dotales-card|card|panel|block|summary|section/i.test(className)) score += 1000;
    if (element.tagName === "SECTION" || element.tagName === "ARTICLE") score += 200;
    if (textLength < 2600) score += 1000;
    if (textLength < 1400) score += 400;
    score -= Math.floor(textLength / 10);
    return score;
  }

  function closestCard107z15p2R11I(node) {
    let current = node;
    let best = null;
    let bestScore = -1;

    while (current && current !== document.body) {
      const score = scoreCard107z15p2R11I(current);
      if (score > bestScore) {
        best = current;
        bestScore = score;
      }
      current = current.parentElement;
    }

    return best || node.closest("section, article, div");
  }

  function findCard107z15p2R11I(title) {
    const titleNode = findTitleNode107z15p2R11I(title);
    return titleNode ? closestCard107z15p2R11I(titleNode) : null;
  }

  function getCards107z15p2R11I() {
    const cards = {};
    for (const [key, title] of Object.entries(TITLES_107Z15P2_R11I)) {
      const card = findCard107z15p2R11I(title);
      if (card) cards[key] = card;
    }
    return cards;
  }

  function rowText107z15p2R11I(node) {
    return normalize107z15p2R11I(node?.textContent || "");
  }

  function rowCandidates107z15p2R11I(card) {
    if (!card) return [];
    return Array.from(card.querySelectorAll("tr, li, .fq-benefit-row-107z15p2, .fq-benefit-detail-row-107z15p2, div"))
      .filter((node) => {
        if (node.closest(".forge-r11i-contribution-grid")) return false;
        if (node.closest(".forge-r11h-dotales-ui")) return false;
        const text = rowText107z15p2R11I(node);
        return text.length > 0 && text.length < 260;
      });
  }

  function findBestRow107z15p2R11I(card, label) {
    const needle = normalize107z15p2R11I(label);
    return rowCandidates107z15p2R11I(card)
      .filter((row) => rowText107z15p2R11I(row).includes(needle))
      .sort((left, right) => rowText107z15p2R11I(left).length - rowText107z15p2R11I(right).length)[0] || null;
  }

  function extractLabelValue107z15p2R11I(row, label) {
    if (!row) return null;
    const raw = String(row.textContent || "").replace(/\s+/g, " ").trim();
    const normalizedLabel = normalize107z15p2R11I(label);

    const children = Array.from(row.children || []).filter((child) => child.textContent.trim());
    if (children.length >= 2) {
      const childTexts = children.map((child) => child.textContent.replace(/\s+/g, " ").trim()).filter(Boolean);
      const value = childTexts.slice(1).join(" · ");
      return value || raw.replace(new RegExp(label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i"), "").trim();
    }

    const lowerRaw = normalize107z15p2R11I(raw);
    const index = lowerRaw.indexOf(normalizedLabel);
    if (index >= 0) {
      const approximateStart = raw.toLowerCase().indexOf(label.toLowerCase());
      if (approximateStart >= 0) {
        return raw.slice(approximateStart + label.length).trim();
      }
    }

    return raw;
  }

  function splitMxn107z15p2R11I(value) {
    const text = String(value || "").replace(/\s+/g, " ").trim();
    const match = text.match(/^(.*?)(≈\s*\$[0-9,]+\s*MXN.*)$/i);
    if (!match) return text;
    return `${match[1].trim()} <span class="forge-r11i-mxn">${match[2].trim()}</span>`;
  }

  function buildContributionBoard107z15p2R11I(cards) {
    const contribution = cards.contribution;
    if (!contribution) return;
    if (contribution.querySelector(".forge-r11i-contribution-grid")) return;

    const details = cards.details || document;
    const wanted = [
      ["Total aportado / Prima anual acumulada con AVE", contribution, ["Total aportado / Prima anual acumulada con AVE", "Total aportado"]],
      ["Prima anual base", details, ["Prima anual base"]],
      ["Prima AVE anual", details, ["Prima AVE anual"]],
      ["Prima anual total con AVE", details, ["Prima anual total con AVE"]],
      ["Plazo de pago", details, ["Plazo de pago"]]
    ];

    const rows = [];
    for (const [label, sourceCard, labels] of wanted) {
      let sourceRow = null;
      let sourceLabel = null;
      for (const candidateLabel of labels) {
        sourceRow = findBestRow107z15p2R11I(sourceCard, candidateLabel);
        if (sourceRow) {
          sourceLabel = candidateLabel;
          break;
        }
      }
      if (!sourceRow) continue;
      const value = extractLabelValue107z15p2R11I(sourceRow, sourceLabel || label);
      if (!value) continue;
      rows.push({ label, value, sourceRow });
    }

    if (!rows.length) return;

    const grid = document.createElement("div");
    grid.className = "forge-r11i-contribution-grid";

    for (const row of rows) {
      const tile = document.createElement("div");
      tile.className = "forge-r11i-contribution-tile";

      const labelNode = document.createElement("div");
      labelNode.className = "forge-r11i-contribution-label";
      labelNode.textContent = row.label;

      const valueNode = document.createElement("div");
      valueNode.className = "forge-r11i-contribution-value";
      valueNode.innerHTML = splitMxn107z15p2R11I(row.value);

      tile.append(labelNode, valueNode);
      grid.appendChild(tile);

      if (row.sourceRow && row.sourceRow.closest(".forge-r11i-card-details")) {
        row.sourceRow.style.display = "none";
        row.sourceRow.setAttribute("aria-hidden", "true");
      } else if (row.sourceRow && row.label.startsWith("Total aportado")) {
        row.sourceRow.style.display = "none";
        row.sourceRow.setAttribute("aria-hidden", "true");
      }
    }

    const title = findTitleNode107z15p2R11I(TITLES_107Z15P2_R11I.contribution);
    if (title && contribution.contains(title)) {
      title.insertAdjacentElement("afterend", grid);
    } else {
      contribution.prepend(grid);
    }
  }

  function hideDotalesLegacyRows107z15p2R11I(card) {
    if (!card) return;

    const legacyRows = rowCandidates107z15p2R11I(card)
      .filter((row) => {
        const text = rowText107z15p2R11I(row);
        if (!text) return false;
        if (text === "dotales por supervivencia") return false;
        return text.includes("total dotales") ||
          text.includes("dotales por supervivencia") ||
          text.includes("anos 5, 7, 9, 11, 13, 15 y 17") ||
          text.includes("ano 20 (80%)");
      });

    legacyRows.forEach((row) => {
      if (row.closest(".forge-r11h-dotales-ui")) return;
      row.style.display = "none";
      row.setAttribute("aria-hidden", "true");
    });
  }

  function commonParent107z15p2R11I(cards) {
    const list = Object.values(cards).filter(Boolean);
    if (!list.length) return null;
    let current = list[0].parentElement;
    while (current && current !== document.body) {
      if (list.every((card) => current.contains(card))) return current;
      current = current.parentElement;
    }
    return list[0].parentElement;
  }

  function buildBoard107z15p2R11I(cards) {
    const orderedKeys = ["contribution", "protection", "dotales", "recovery", "pcf", "recommended", "details"];
    const orderedCards = orderedKeys.map((key) => cards[key]).filter(Boolean);
    if (!orderedCards.length) return;

    orderedKeys.forEach((key) => {
      const card = cards[key];
      if (!card) return;
      card.classList.add("forge-r11i-card", `forge-r11i-card-${key}`);
      card.dataset.forgeR11iCard = key;
    });

    const existing = document.querySelector(".forge-r11i-board");
    if (existing) {
      orderedCards.forEach((card) => {
        if (card.parentElement !== existing) existing.appendChild(card);
      });
      return;
    }

    const parent = commonParent107z15p2R11I(cards);
    if (!parent) return;

    const board = document.createElement("div");
    board.className = "forge-r11i-board";
    board.dataset.forgeR11iBoard = "true";

    parent.insertBefore(board, orderedCards[0]);

    for (const card of orderedCards) {
      board.appendChild(card);
    }
  }

  function apply107z15p2R11I() {
    if (typeof document === "undefined") return;
    injectStyle107z15p2R11I();

    const cards = getCards107z15p2R11I();
    buildBoard107z15p2R11I(cards);
    buildContributionBoard107z15p2R11I(cards);
    hideDotalesLegacyRows107z15p2R11I(cards.dotales);
  }

  function schedule107z15p2R11I() {
    root.requestAnimationFrame?.(() => {
      apply107z15p2R11I();
      root.setTimeout?.(apply107z15p2R11I, 120);
      root.setTimeout?.(apply107z15p2R11I, 360);
      root.setTimeout?.(apply107z15p2R11I, 900);
    });
  }

  if (typeof document !== "undefined") {
    schedule107z15p2R11I();
    document.addEventListener("DOMContentLoaded", schedule107z15p2R11I);
    document.addEventListener("click", schedule107z15p2R11I, true);
    document.addEventListener("change", schedule107z15p2R11I, true);

    const observer = new MutationObserver(schedule107z15p2R11I);
    observer.observe(document.documentElement, { childList: true, subtree: true });
  }

  root.ForgeR11IDesktopBoardLayout = {
    apply: apply107z15p2R11I
  };
})();
// FORGE:107Z15P2_R11I_DESKTOP_BOARD_LAYOUT:END
