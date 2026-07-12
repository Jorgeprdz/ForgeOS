function benefitBlockKey107z15p2R9E(title) {
  const normalized = String(title || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  if (normalized.includes("aporta")) return "contribution";
  if (normalized.includes("protege")) return "protection";
  if (normalized.includes("dotal")) return "endowments";
  if (normalized.includes("recuper")) return "recovery";
  if (normalized.includes("pcf") || normalized.includes("enfermedad")) return "women_health";
  if (normalized.includes("recomend")) return "recommended";
  return "other";
}

function normalizeBenefitLayout107z15p2R9E() {
  const summaries = document.querySelectorAll(".fq-benefit-dashboard-107z15p2");
  if (!summaries.length) return;
  document.body.setAttribute("data-forge-benefit-layout-expanded", "true");
  for (const summary of summaries) {
    summary.closest("dl")?.setAttribute("data-forge-benefit-panel", "true");
    summary.closest("dd")?.setAttribute("data-forge-benefit-panel-value", "true");
  }
}

function installBenefitLayoutObserver107z15p2R9E() {
  normalizeBenefitLayout107z15p2R9E();
}

function installBenefitDashboardStyles107z15p2R11M() {
  if (document.getElementById("forge-benefit-dashboard-r11m")) return;
  const style = document.createElement("style");
  style.id = "forge-benefit-dashboard-r11m";
  style.textContent = `
    :root {
      --fq-r11m-title: #f4d85d;
      --fq-r11m-udi: #f5dc6c;
      --fq-r11m-mxn: #76c9ee;
      --fq-r11m-label: rgba(226, 232, 240, .76);
      --fq-r11m-good: #8bd6a4;
      --fq-r11m-muted: rgba(148, 163, 184, .76);
      --fq-r11m-line: rgba(125, 211, 252, .14);
      --fq-r11m-panel: rgba(8, 20, 39, .72);
      --fq-r11m-tile: rgba(255, 255, 255, .035);
    }

    body[data-forge-benefit-layout-expanded="true"] .fq-quote-summary-105dr {
      width: 100% !important;
      max-width: 100% !important;
      margin-inline: auto !important;
      overflow: visible !important;
    }
    body[data-forge-benefit-layout-expanded="true"] .fq-grid-105dr {
      grid-template-columns: minmax(0, 1fr) !important;
    }
    body[data-forge-benefit-layout-expanded="true"] .fq-grid-105dr > div {
      width: 100% !important;
      min-width: 0 !important;
    }
    body[data-forge-benefit-layout-expanded="true"] .fq-summary-row-105dr:has(.fq-benefit-dashboard-107z15p2) {
      grid-template-columns: minmax(0, 1fr) !important;
    }
    body[data-forge-benefit-layout-expanded="true"] .fq-summary-row-105dr:has(.fq-benefit-dashboard-107z15p2) > .fq-summary-label-105dr {
      display: none !important;
    }
    body[data-forge-benefit-layout-expanded="true"] .fq-quote-summary-105dr .fq-runtime-grid-107z15e8s dl[data-forge-benefit-panel="true"] {
      display: block !important;
      width: 100% !important;
      max-width: 100% !important;
    }
    body[data-forge-benefit-layout-expanded="true"] .fq-quote-summary-105dr .fq-runtime-grid-107z15e8s dl[data-forge-benefit-panel="true"] > dt {
      display: none !important;
    }
    body[data-forge-benefit-layout-expanded="true"] [data-forge-benefit-panel="true"],
    body[data-forge-benefit-layout-expanded="true"] [data-forge-benefit-panel-value="true"] {
      width: 100% !important; max-width: none !important; min-width: 0 !important; overflow: visible !important;
    }

    .fq-benefit-dashboard-107z15p2 {
      display: grid !important;
      grid-template-columns: repeat(12, minmax(0, 1fr)) !important;
      gap: 20px !important;
      align-items: start !important;
      width: 100% !important;
      min-width: 0 !important;
      max-width: none !important;
    }
    .fq-benefit-card-107z15p2 {
      grid-column: span 4;
      min-width: 0;
      padding: 20px;
      border: 1px solid var(--fq-r11m-line);
      border-radius: 18px;
      background: linear-gradient(150deg, rgba(16, 35, 61, .82), var(--fq-r11m-panel));
      box-shadow: 0 16px 40px rgba(0, 0, 0, .12);
      overflow: hidden;
    }
    .fq-benefit-card-107z15p2[data-forge-benefit-block="contribution"] { grid-column: span 8; }
    .fq-benefit-card-107z15p2[data-forge-benefit-block="protection"] { grid-column: span 4; }
    .fq-benefit-card-107z15p2[data-forge-benefit-block="recovery"] { grid-column: span 3; }
    .fq-benefit-card-107z15p2[data-forge-benefit-block="women_health"] { grid-column: span 5; }
    .fq-benefit-card-107z15p2[data-forge-benefit-block="recommended"] { grid-column: span 4; }
    .fq-benefit-card-107z15p2[data-forge-benefit-block="endowments"],
    .fq-benefit-card-107z15p2[data-forge-benefit-block="other"] { grid-column: 1 / -1; }
    .fq-benefit-card-title-107z15p2 {
      margin: 0 0 16px;
      color: var(--fq-r11m-title);
      font-size: 1.02rem;
      font-weight: 900;
      line-height: 1.25;
      letter-spacing: .01em;
    }

    .fq-benefit-mini-grid-107z15p2 { display: grid; grid-template-columns: repeat(5, minmax(0, 1fr)); gap: 10px; }
    .fq-benefit-mini-card-107z15p2,
    .fq-benefit-row-107z15p2,
    .fq-benefit-recommended-card-107z15p2,
    .fq-benefit-dotal-chip-107z15p2,
    .fq-benefit-dotal-summary-107z15p2 {
      min-width: 0;
      border: 1px solid var(--fq-r11m-line);
      border-radius: 13px;
      background: var(--fq-r11m-tile);
    }
    .fq-benefit-mini-card-107z15p2 { padding: 12px; }
    .fq-benefit-label-107z15p2 { color: var(--fq-r11m-label); font-size: .75rem; font-weight: 800; line-height: 1.28; }
    .fq-benefit-value-107z15p2 { margin-top: 7px; color: var(--fq-r11m-udi); font-size: .91rem; font-weight: 900; line-height: 1.3; }
    .fq-benefit-value-part-107z15p2 { display: block; }
    .fq-benefit-value-part-107z15p2 + .fq-benefit-value-part-107z15p2 { margin-top: 3px; }
    .fq-benefit-value-part-107z15p2[data-value-kind="mxn"] { color: var(--fq-r11m-mxn); font-size: .78rem; font-weight: 800; }
    .fq-benefit-value-part-107z15p2[data-value-kind="status"] { color: var(--fq-r11m-good); font-weight: 850; }
    .fq-benefit-value-part-107z15p2[data-value-kind="note"] { color: var(--fq-r11m-muted); font-size: .74rem; font-weight: 650; }

    .fq-benefit-rows-107z15p2 { display: grid; gap: 8px; }
    .fq-benefit-row-107z15p2 { display: grid; grid-template-columns: minmax(105px, .9fr) minmax(0, 1.1fr); gap: 10px; align-items: start; padding: 10px 11px; }
    .fq-benefit-row-107z15p2 .fq-benefit-value-107z15p2 { margin-top: 0; }

    .fq-benefit-dotales-107z15p2 { display: grid; gap: 12px; }
    .fq-benefit-dotales-kicker-107z15p2 { margin: 0; color: var(--fq-r11m-label); font-size: .78rem; font-weight: 850; }
    .fq-benefit-dotal-chips-107z15p2 { display: grid; grid-template-columns: repeat(7, minmax(105px, 1fr)); gap: 10px; }
    .fq-benefit-dotal-chip-107z15p2 { padding: 11px 9px; text-align: center; }
    .fq-benefit-dotal-year-107z15p2 { color: var(--fq-r11m-label); font-size: .75rem; font-weight: 850; }
    .fq-benefit-dotal-udi-107z15p2 { display: block; margin-top: 5px; color: var(--fq-r11m-udi); font-size: .88rem; font-weight: 950; white-space: nowrap; }
    .fq-benefit-dotal-mxn-107z15p2 { display: block; margin-top: 3px; color: var(--fq-r11m-mxn); font-size: .7rem; font-weight: 750; line-height: 1.25; }
    .fq-benefit-dotal-totals-107z15p2 { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px; }
    .fq-benefit-dotal-summary-107z15p2 { padding: 12px 14px; }

    .fq-benefit-pcf-grid-107z15p2 { display: grid; grid-template-columns: minmax(0, 1fr); gap: 8px; max-height: 520px; overflow-y: auto; scrollbar-width: thin; padding-right: 3px; }
    .fq-benefit-pcf-grid-107z15p2 .fq-benefit-row-107z15p2 { grid-template-columns: minmax(150px, 1.15fr) minmax(125px, .85fr); }

    .fq-benefit-recommended-total-107z15p2 { margin-bottom: 10px; padding: 12px; border-radius: 13px; background: rgba(244, 216, 93, .07); border: 1px solid rgba(244, 216, 93, .15); }
    .fq-benefit-recommended-total-107z15p2 .fq-benefit-row-107z15p2 { grid-template-columns: 1fr; }
    .fq-benefit-recommended-grid-107z15p2 { display: grid; gap: 9px; }
    .fq-benefit-recommended-card-107z15p2 { padding: 12px; }
    .fq-benefit-recommended-name-107z15p2 { margin: 0 0 9px; color: #eef6ff; font-size: .88rem; font-weight: 900; }
    .fq-benefit-recommended-fields-107z15p2 { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 7px 10px; }
    .fq-benefit-recommended-field-107z15p2 { min-width: 0; }
    .fq-benefit-recommended-field-107z15p2 .fq-benefit-value-107z15p2 { margin-top: 3px; font-size: .82rem; }

    .fq-benefit-card-107z15p2 *, .fq-benefit-card-107z15p2 {
      word-break: normal !important;
      overflow-wrap: normal !important;
      hyphens: none !important;
    }

    @media (max-width: 1180px) and (min-width: 761px) {
      .fq-benefit-dashboard-107z15p2 { grid-template-columns: repeat(8, minmax(0, 1fr)) !important; gap: 16px !important; }
      .fq-benefit-card-107z15p2 { grid-column: span 4; }
      .fq-benefit-card-107z15p2[data-forge-benefit-block="contribution"],
      .fq-benefit-card-107z15p2[data-forge-benefit-block="protection"] { grid-column: span 4; }
      .fq-benefit-card-107z15p2[data-forge-benefit-block="endowments"],
      .fq-benefit-card-107z15p2[data-forge-benefit-block="other"] { grid-column: 1 / -1; }
      .fq-benefit-mini-grid-107z15p2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
      .fq-benefit-dotal-chips-107z15p2 { grid-template-columns: repeat(4, minmax(115px, 1fr)); }
      .fq-benefit-pcf-grid-107z15p2 { grid-template-columns: 1fr; }
      .fq-benefit-card-107z15p2[data-forge-benefit-block="recommended"] { grid-column: 1 / -1; }
      .fq-benefit-card-107z15p2[data-forge-benefit-block="recommended"] .fq-benefit-recommended-grid-107z15p2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
    }

    @media (max-width: 760px) {
      .fq-benefit-dashboard-107z15p2 { display: block !important; }
      .fq-benefit-card-107z15p2 { margin-bottom: 14px; }
      .fq-benefit-mini-grid-107z15p2, .fq-benefit-dotal-chips-107z15p2, .fq-benefit-dotal-totals-107z15p2,
      .fq-benefit-pcf-grid-107z15p2, .fq-benefit-recommended-fields-107z15p2 { grid-template-columns: 1fr; }
    }
  `;
  document.head.appendChild(style);
}

const api = Object.freeze({ benefitBlockKey107z15p2R9E, normalizeBenefitLayout107z15p2R9E, installBenefitLayoutObserver107z15p2R9E });
globalThis.ForgeBenefitSummaryLayout = api;
installBenefitDashboardStyles107z15p2R11M();

export { benefitBlockKey107z15p2R9E, normalizeBenefitLayout107z15p2R9E, installBenefitLayoutObserver107z15p2R9E };
