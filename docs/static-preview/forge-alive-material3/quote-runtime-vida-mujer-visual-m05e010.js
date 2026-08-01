const VERSION = "M05E-010";
const SCHEDULER_VERSION = "M05T-001";

function isRecord(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function normalize(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

function finite(value) {
  if (isRecord(value) && Object.hasOwn(value, "value")) return finite(value.value);
  if (value === null || value === undefined || value === "") return null;
  const parsed = typeof value === "number"
    ? value
    : Number(String(value).replace(/[^0-9.-]/g, ""));
  return Number.isFinite(parsed) ? parsed : null;
}

function firstFinite(...values) {
  for (const value of values) {
    const parsed = finite(value);
    if (parsed !== null) return parsed;
  }
  return null;
}

function currentCalculation() {
  return globalThis.ForgeAcceptedQuoteBridge
    ?.getCurrentQuotePreviewCalculation?.() || null;
}

function isVidaMujer(calculation = {}) {
  const native = calculation.nativeResult || {};
  const model = calculation.productIntelligence || {};
  return [
    calculation.product,
    calculation.productFamily,
    calculation.product_family,
    native.product,
    native.productFamily,
    native.product_family,
    model.schema?.id,
    model.identity?.detected_product_name,
  ].map(normalize).some((value) =>
    value.includes("vida_mujer") || value.includes("vidamujer"));
}

function totalContribution(calculation = {}) {
  const native = calculation.nativeResult || {};
  const premium = calculation.productIntelligence?.premium_structure || {};
  const annual = firstFinite(
    calculation.totalAnnualPremium,
    calculation.annualPremiumWithAve,
    calculation.annualPremium,
    native.totalAnnualPremium,
    native.annualPremiumWithAve,
    native.annualPremium,
    premium.total_annual_premium,
    premium.basic_annual_premium,
  );
  const years = firstFinite(
    calculation.paymentYears,
    native.paymentYears,
    native.premiumPayingYears,
    native.paymentTerm,
    premium.payment_term_years,
    20,
  );
  const totalUdi = firstFinite(
    calculation.totalContributed,
    calculation.totalContributedUdi,
    calculation.totalContributedUDI,
    native.totalContributed,
    native.totalContributedUdi,
    native.totalContributedUDI,
    annual !== null && years !== null ? annual * years : null,
  );
  const rate = firstFinite(
    calculation.udiRateMetadata?.currentUdiValue,
    calculation.udiRateMetadata?.value,
    calculation.currencyMetadata?.currentUdiValue,
    calculation.currencyMetadata?.value,
    native.udiRateMetadata?.value,
    native.currencyMetadata?.value,
    globalThis.ForgeQuoteUdiRateCache?.rates?.UDI_MXN?.value,
  );
  const totalMxn = firstFinite(
    calculation.totalContributedMXN,
    calculation.totalContributedMxn,
    native.totalContributedMXN,
    native.totalContributedMxn,
    totalUdi !== null && rate !== null ? totalUdi * rate : null,
  );
  return { annual, years, totalUdi, totalMxn, rate };
}

function format(value, maximumFractionDigits = 2) {
  return Number.isFinite(value)
    ? new Intl.NumberFormat("es-MX", { maximumFractionDigits }).format(value)
    : null;
}

function ensureStyles() {
  if (document.querySelector("[data-vida-mujer-visual-m05e010]")) return;
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = new URL(
    "./quote-runtime-vida-mujer-visual-m05e010.css?v=m05e-010",
    import.meta.url,
  ).href;
  link.dataset.vidaMujerVisualM05e010 = "true";
  document.head.append(link);
}

function appendValueLine(target, text, conversion = false) {
  const line = target.ownerDocument.createElement("span");
  line.className = conversion
    ? "quotes-value-line quotes-value-line--conversion"
    : "quotes-value-line";
  line.textContent = text;
  target.append(line);
}

function ensureTotalContributedCard(host, calculation) {
  const mandatory = host.querySelector('[data-quote-mandatory-metrics="true"]');
  if (!mandatory) return false;
  const totals = totalContribution(calculation);
  if (totals.totalUdi === null) return false;

  let card = mandatory.querySelector(
    '[data-quote-mandatory-metric="total-contributed"]',
  );
  if (!card) {
    card = host.ownerDocument.createElement("article");
    card.className = "quotes-mandatory-metric";
    card.dataset.quoteMandatoryMetric = "total-contributed";
    card.innerHTML = "<span>Total aportado</span><strong></strong>";
    mandatory.append(card);
  }

  const value = card.querySelector("strong");
  const expected = [
    `${format(totals.totalUdi)} UDI`,
    totals.totalMxn !== null
      ? `≈ $${format(totals.totalMxn)} MXN al valor UDI de hoy`
      : null,
  ].filter(Boolean);
  const current = [...value.querySelectorAll(".quotes-value-line")]
    .map((node) => node.textContent);
  if (JSON.stringify(current) !== JSON.stringify(expected)) {
    value.replaceChildren();
    expected.forEach((text, index) => appendValueLine(value, text, index > 0));
  }
  if (card.dataset.totalContributionBasis !== "current_udi_equivalence") {
    card.dataset.totalContributionBasis = "current_udi_equivalence";
  }
  return true;
}

function refineIdentity(host) {
  const identity = host.querySelector(".quotes-intelligence-identity");
  if (!identity) return;
  const paragraph = identity.querySelector("p");
  if (
    paragraph &&
    /información calculada con evidencia disponible/i.test(paragraph.textContent || "")
  ) {
    paragraph.textContent =
      "Protección, aportación y beneficios en vida reunidos en una sola lectura.";
  }
}

function refinePrintableCard() {
  const card = document.querySelector("[data-m05e005-printable-card]");
  const title = card?.querySelector(".forge-printable-card__title p");
  const formatNode = card?.querySelector(".forge-printable-card__format");
  const expectedTitle =
    "Propuesta comercial A4 horizontal, lista para revisar o compartir.";
  if (title && title.textContent !== expectedTitle) {
    title.textContent = expectedTitle;
  }
  if (formatNode && formatNode.textContent !== "A4 · horizontal") {
    formatNode.textContent = "A4 · horizontal";
  }
}

let lastAppliedCalculation = null;

function enhance(calculation = currentCalculation()) {
  ensureStyles();
  if (!calculation || !isVidaMujer(calculation)) return false;
  const host = document.querySelector('[data-product-dashboard="vida_mujer"]');
  if (!host) return false;
  if (
    calculation === lastAppliedCalculation
    && host.dataset.vidaMujerVisual === VERSION
  ) {
    return true;
  }

  if (host.dataset.vidaMujerVisual !== VERSION) {
    host.dataset.vidaMujerVisual = VERSION;
  }
  refineIdentity(host);
  ensureTotalContributedCard(host, calculation);
  refinePrintableCard();
  document.documentElement.dataset.vidaMujerVisualClosure = VERSION;
  document.documentElement.dataset.vidaMujerVisualScheduler = SCHEDULER_VERSION;
  lastAppliedCalculation = calculation;
  return true;
}

function confirmationDialogOpen() {
  const accept = document.querySelector('[data-quote-preview-action="accept"]');
  if (!accept) return false;
  const dialog = accept.closest('[role="dialog"], .forge-quote-preview-popup');
  if (!dialog) return false;
  return !dialog.hidden && dialog.getAttribute("aria-hidden") !== "true";
}

let scheduled = false;
let retryTimer = null;
let pendingReason = "boot";

function clearRetry() {
  if (retryTimer === null) return;
  globalThis.clearTimeout(retryTimer);
  retryTimer = null;
}

function flush() {
  scheduled = false;

  // The extraction confirmation must remain completely interaction-first.
  // Visual enrichment starts only after the modal is gone.
  if (confirmationDialogOpen()) {
    if (retryTimer === null) {
      retryTimer = globalThis.setTimeout(() => {
        retryTimer = null;
        schedule("confirmation-closed-retry");
      }, 120);
    }
    return false;
  }

  clearRetry();
  const calculation = currentCalculation();
  const applied = enhance(calculation);
  document.documentElement.dataset.vidaMujerVisualLastReason = pendingReason;
  if (!applied && retryTimer === null) {
    retryTimer = globalThis.setTimeout(() => {
      retryTimer = null;
      schedule("single-host-retry");
    }, 120);
  }
  return applied;
}

function schedule(reason = "event") {
  pendingReason = reason;
  if (scheduled) return;
  scheduled = true;
  const enqueue = globalThis.requestAnimationFrame
    ? (callback) => globalThis.requestAnimationFrame(callback)
    : (callback) => globalThis.setTimeout(callback, 0);
  enqueue(flush);
}

for (const eventName of [
  "forge:quote-preview-calculated",
  "forge:accepted-quote-confirmed",
  "forge:vida-mujer-handoff-ready",
  "forge:current-rate-authority-ready",
  "forge:qpd06-state",
]) {
  globalThis.addEventListener?.(eventName, () => schedule(eventName));
}

globalThis.addEventListener?.("click", (event) => {
  if (event.target?.closest?.('[data-quote-preview-action="accept"]')) {
    schedule("quote-preview-accepted");
  }
});

schedule("boot");

globalThis.ForgeVidaMujerVisualM05E010 = Object.freeze({
  version: VERSION,
  schedulerVersion: SCHEDULER_VERSION,
  enhance,
  schedule,
  totalContribution,
});

export {
  VERSION,
  enhance,
  isVidaMujer,
  schedule,
  totalContribution,
};
