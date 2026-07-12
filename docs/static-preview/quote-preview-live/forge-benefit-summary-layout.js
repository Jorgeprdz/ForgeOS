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
