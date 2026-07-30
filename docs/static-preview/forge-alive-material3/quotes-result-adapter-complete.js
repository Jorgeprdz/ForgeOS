const UNKNOWN = "No disponible en la propuesta";
const PENDING = "Pendiente de confirmar";

function installCompleteQuoteStyles() {
  if (typeof document === "undefined") return;
  if (document.querySelector("[data-forge-complete-quote-styles]")) return;
  const style = document.createElement("style");
  style.dataset.forgeCompleteQuoteStyles = "true";
  style.textContent = `
    .quote-commercial__benefit-groups {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
      gap: 14px;
    }
    .quote-commercial__benefit-group {
      min-width: 0;
      border: 1px solid rgba(184, 211, 255, .14);
      border-radius: 18px;
      padding: 14px;
      background: rgba(255, 255, 255, .025);
    }
    .quote-commercial__benefit-group h3 {
      margin: 0 0 10px;
      color: var(--ink);
      font-size: 15px;
    }
    @media (max-width: 759px) {
      .quote-commercial__summary,
      .quote-commercial__review-grid,
      .quote-commercial__actions {
        grid-template-columns: minmax(0, 1fr);
      }
      .quote-commercial__list .quote-commercial__fact {
        grid-template-columns: minmax(0, 1fr);
      }
    }
  `;
  document.head.append(style);
}

installCompleteQuoteStyles();

function esc(value) {
  return String(value ?? "").replace(/[&<>"']/g, character => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  })[character]);
}

function hasValue(value) {
  return value !== null && value !== undefined && value !== "";
}

function first(...values) {
  return values.find(hasValue);
}

function asObject(value) {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value
    : {};
}

function humanize(value) {
  return String(value ?? "")
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/^./, character => character.toUpperCase());
}

function formatAmount(value, currency) {
  if (!hasValue(value)) return null;
  if (typeof value === "object") {
    const ordered = ["mxn", "udi", "usd"];
    const key = ordered.find(unit => Number.isFinite(Number(value?.[unit])));
    return key ? formatAmount(value[key], key.toUpperCase()) : null;
  }
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return String(value);
  const formatted = new Intl.NumberFormat("es-MX", {
    maximumFractionDigits: 2,
  }).format(numeric);
  return `${formatted}${currency ? ` ${currency}` : ""}`;
}

function formatPercent(value) {
  if (!hasValue(value)) return null;
  const text = String(value).trim();
  if (text.endsWith("%")) return text;
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return text;
  const normalized = Math.abs(numeric) <= 1 ? numeric * 100 : numeric;
  return `${new Intl.NumberFormat("es-MX", {
    maximumFractionDigits: 4,
  }).format(normalized)}%`;
}

function schemaLabel(value) {
  if (!hasValue(value)) return null;
  const match = String(value).match(/(?:^|[._-])v?(\d+(?:\.\d+)*)$/i);
  return match ? `Versión ${match[1]}` : "Esquema gobernado";
}

function formatScalar(value, currency) {
  if (!hasValue(value)) return null;
  if (typeof value === "boolean") return value ? "Sí" : "No";
  if (typeof value === "number") return formatAmount(value, currency);
  return String(value);
}

function compactFacts(entries) {
  return entries
    .map(([label, value]) => ({ label, value }))
    .filter(item => hasValue(item.value));
}

function quoteSources(candidate, calculation) {
  const packet = asObject(candidate);
  const native = asObject(first(packet.nativeResult, packet.native_result, packet.result));
  const context = asObject(packet.context);
  const premiumTable = asObject(first(native.premiumTable, native.premium_table));
  const calc = asObject(calculation);
  const currency = first(
    native.currency,
    packet.currency,
    calc.currency,
    context.currency,
  );
  return { packet, native, context, premiumTable, calc, currency };
}

function benefitBlocks(packet, currency) {
  const benefitSummary = asObject(first(packet.benefitSummary, packet.benefit_summary));
  const blocks = Array.isArray(benefitSummary.blocks) ? benefitSummary.blocks : [];

  return blocks.flatMap((block, blockIndex) => {
    if (!block || typeof block !== "object") return [];
    const type = String(block.type || "").trim();
    if (type === "missing_information") return [];

    const title = first(block.title, block.label, type ? humanize(type) : null, `Bloque ${blockIndex + 1}`);
    const items = [];

    for (const line of Array.isArray(block.lines) ? block.lines : []) {
      if (!line || typeof line !== "object" || !line.label) continue;
      const value = first(
        formatAmount(line.value, line.unit || currency),
        formatScalar(line.text, currency),
      );
      if (hasValue(value)) items.push({ label: String(line.label), value });
    }

    for (const benefit of Array.isArray(block.benefits) ? block.benefits : []) {
      if (!benefit || typeof benefit !== "object") continue;
      const name = first(benefit.name, benefit.label, benefit.title, "Beneficio");
      const direct = first(
        formatAmount(benefit.value, benefit.unit || currency),
        formatScalar(benefit.description, currency),
      );
      if (hasValue(direct)) items.push({ label: String(name), value: direct });

      for (const field of Array.isArray(benefit.fields) ? benefit.fields : []) {
        if (!field || typeof field !== "object" || !field.label) continue;
        const value = first(
          formatAmount(field.value, field.unit || currency),
          formatScalar(field.text, currency),
        );
        if (hasValue(value)) {
          items.push({
            label: `${name} · ${field.label}`,
            value,
          });
        }
      }
    }

    for (const item of Array.isArray(block.items) ? block.items : []) {
      if (!item || typeof item !== "object") continue;
      const label = first(item.label, item.name, item.title);
      const value = first(
        formatAmount(item.value, item.unit || currency),
        formatScalar(item.description, currency),
      );
      if (label && hasValue(value)) items.push({ label: String(label), value });
    }

    return items.length ? [{ title: String(title), items }] : [];
  });
}

function missingInformation(packet) {
  const benefitSummary = asObject(first(packet.benefitSummary, packet.benefit_summary));
  const blocks = Array.isArray(benefitSummary.blocks) ? benefitSummary.blocks : [];
  return blocks
    .filter(block => block?.type === "missing_information")
    .flatMap(block => Array.isArray(block.missing) ? block.missing : [])
    .filter(item => typeof item === "string" && item.trim())
    .map(item => item.trim());
}

function warningsFrom(packet, calculation) {
  const values = [
    ...(Array.isArray(packet.warnings) ? packet.warnings : []),
    ...(Array.isArray(calculation.warnings) ? calculation.warnings : []),
    ...(Array.isArray(calculation.assumptions) ? calculation.assumptions : []),
  ];
  return [...new Set(values.filter(item => typeof item === "string" && item.trim()).map(item => item.trim()))];
}

function commercialProjection(candidate, calculation) {
  const { packet, native, context, premiumTable, calc, currency } = quoteSources(candidate, calculation);

  const client = first(
    native.prospect,
    native.client,
    native.insured,
    packet.insured,
    packet.primaryInsured,
    packet.clientName,
    packet.prospect,
    packet.name,
    packet.participants?.primary_insured,
  );
  const family = first(
    context.productFamily,
    context.product_family,
    packet.productFamily,
    packet.family,
    native.detectedQuoteDomain,
    native.family,
  );
  const product = first(
    native.product,
    packet.productName,
    packet.product,
    packet.displayName,
  );
  const plan = first(native.plan, packet.plan, packet.productVersion, packet.version);

  const sumAssured = first(native.sumInsured, native.sumAssured, packet.sumAssured, packet.sumInsured);
  const annualPremium = first(
    premiumTable.annual,
    native.totalAnnualPremium,
    native.annualPremium,
    packet.annualPremium,
    calc.annualPremium,
  );
  const plannedAnnual = Object.prototype.hasOwnProperty.call(premiumTable, "plannedAnnual")
    ? premiumTable.plannedAnnual
    : first(
      native.plannedAnnual,
      native.annualPremiumWithRecommended,
      packet.annualPremiumWithRecommended,
      packet.plannedOrAvePremium,
      calc.contributionAmount,
    );
  const annualAvePremium = first(
    native.annualAvePremium,
    native.primaAveAnual,
    premiumTable.annualAve,
    packet.annualAvePremium,
  );
  const accumulatedWithAve = first(
    native.annualPremiumAccumulatedWithAve,
    native.primaTotalAcumuladaConAve,
    premiumTable.accumulatedWithAve,
    packet.annualPremiumAccumulatedWithAve,
  );
  const baseAnnualPremium = first(native.baseAnnualPremium, packet.baseAnnualPremium);
  const paymentMode = first(native.paymentMode, packet.paymentMode, packet.paymentFrequency, calc.paymentFrequency);

  const coveragePeriod = first(native.policyTerm, native.coveragePeriod, packet.coveragePeriod);
  const paymentTerm = first(native.paymentTerm, packet.paymentTerm, packet.paymentYears, calc.paymentYears);
  const guaranteePeriod = first(native.guaranteePeriod, packet.guaranteePeriod);

  const totalContributed = first(
    native.totalContributed,
    native.totalContributions,
    packet.totalContributed,
    packet.totalContributions,
  );
  const totalRecovery = first(
    native.totalRecovery,
    native.recoveryTotal,
    packet.totalRecovery,
    packet.recoveryTotal,
    calc.totalRecovery,
  );

  const objective = first(
    packet.objective,
    packet.solutionObjective,
    context.objective,
  );

  const identity = compactFacts([
    ["Cliente / asegurado", client],
    ["Edad", first(native.age, packet.age, packet.primaryAge, packet.participants?.primary_age)],
    ["Familia", family],
    ["Producto", product],
    ["Plan", plan],
    ["Objetivo", objective],
  ]);

  const premiums = compactFacts([
    ["Suma asegurada", formatAmount(sumAssured, currency)],
    ["Prima básica anual", formatAmount(baseAnnualPremium, currency)],
    ["Prima anual", formatAmount(annualPremium, currency)],
    ["Prima total anual con AVE", formatAmount(plannedAnnual, currency)],
    ["Prima AVE anual", formatAmount(annualAvePremium, currency)],
    ["Prima acumulada con AVE", formatAmount(accumulatedWithAve, currency)],
    ["Forma de pago", paymentMode],
    ["Moneda", currency],
  ]);

  const term = compactFacts([
    ["Vigencia / plazo de cobertura", coveragePeriod],
    ["Plazo de pagos", paymentTerm ? `${paymentTerm}${typeof paymentTerm === "number" ? " años" : ""}` : null],
    ["Periodo de garantía", guaranteePeriod],
    ["Fecha de inicio", first(native.startDate, packet.startDate, calc.startDate)],
    ["Fecha final", first(native.endDate, packet.endDate, calc.endDate)],
  ]);

  const recovery = compactFacts([
    ["Total aportado", formatAmount(totalContributed, currency)],
    ["Recuperación total", formatAmount(totalRecovery, currency)],
    ["Valor proyectado", formatAmount(calc.projectedValue, currency)],
    ["Valor garantizado", formatAmount(calc.guaranteedValue, currency)],
    ["Valor en efectivo", formatAmount(calc.cashValue, currency)],
  ]);

  const scenarios = compactFacts([
    ["Tasa de retiro", formatPercent(first(native.retirementInterestRate, packet.retirementInterestRate))],
    ["Escenario base", formatAmount(first(native.retirementScenarioBase, packet.retirementScenarioBase), currency)],
    ["Escenario favorable", formatAmount(first(native.retirementScenarioFavorable, packet.retirementScenarioFavorable), currency)],
    ["Escenario desfavorable", formatAmount(first(native.retirementScenarioUnfavorable, packet.retirementScenarioUnfavorable), currency)],
  ]);

  const quoteDetails = compactFacts([
    ["Fecha de cotización", first(native.quoteDate, packet.quoteDate)],
    ["Asesor", first(native.advisor, packet.advisor)],
    ["Documento fuente", first(packet.fileName, packet.sourceDocument, context.sourceDocument)],
  ]);

  const pending = missingInformation(packet);
  for (const [label, value] of [
    ["Cliente / asegurado", client],
    ["Familia", family],
    ["Producto", product],
    ["Plan", plan],
    ["Suma asegurada", sumAssured],
    ["Prima anual", annualPremium],
    ["Forma de pago", paymentMode],
    ["Moneda", currency],
    ["Vigencia", coveragePeriod],
  ]) {
    if (!hasValue(value)) pending.push(label);
  }

  return Object.freeze({
    title: product || plan || "Propuesta detectada",
    identity: Object.freeze(identity),
    premiums: Object.freeze(premiums),
    term: Object.freeze(term),
    recovery: Object.freeze(recovery),
    scenarios: Object.freeze(scenarios),
    benefitBlocks: Object.freeze(benefitBlocks(packet, currency)),
    quoteDetails: Object.freeze(quoteDetails),
    warnings: Object.freeze(warningsFrom(packet, calc)),
    pending: Object.freeze([...new Set(pending)]),
    evidence: Object.freeze({
      authority: "ForgeAcceptedQuoteBridge",
      schemaVersion: first(packet.schemaVersion, packet.schema_version),
      calculationState: calculation ? "Cálculo preliminar disponible" : "Cálculo pendiente",
    }),
    nextActions: Object.freeze([
      Object.freeze({ id: "review_pending", label: "Revisar datos pendientes", enabled: pending.length > 0 }),
      Object.freeze({ id: "confirm_quote", label: "Confirmar cotización", enabled: true }),
    ]),
  });
}

function fact(label, value, fallback = UNKNOWN) {
  return `
    <div class="quote-commercial__fact">
      <dt>${esc(label)}</dt>
      <dd>${hasValue(value)
        ? esc(value)
        : `<span class="quote-result__unknown">${esc(fallback)}</span>`}</dd>
    </div>`;
}

function itemList(items, emptyLabel = PENDING) {
  if (!items.length) {
    return `<p class="quote-result__unknown">${esc(emptyLabel)}</p>`;
  }
  return `<dl class="quote-commercial__list">${items.map(item => fact(item.label, item.value)).join("")}</dl>`;
}

function section({ kicker, title, items, attribute }) {
  return `
    <section data-quote-result-section ${attribute}>
      <p class="quotes-module__kicker">${esc(kicker)}</p>
      <h2>${esc(title)}</h2>
      ${itemList(items)}
    </section>`;
}

function benefitSections(blocks) {
  if (!blocks.length) {
    return section({
      kicker: "PROTECCIONES Y BENEFICIOS",
      title: "Información disponible",
      items: [],
      attribute: "data-quote-benefits",
    });
  }
  return `
    <section data-quote-result-section data-quote-benefits>
      <p class="quotes-module__kicker">PROTECCIONES Y BENEFICIOS</p>
      <h2>Detalle de la propuesta</h2>
      <div class="quote-commercial__benefit-groups">
        ${blocks.map(block => `
          <article class="quote-commercial__benefit-group">
            <h3>${esc(block.title)}</h3>
            ${itemList(block.items)}
          </article>`).join("")}
      </div>
    </section>`;
}

export function buildQuoteResultViewModel(bridge) {
  if (!bridge) {
    return Object.freeze({
      state: "blocked",
      commercial: null,
      error: "La autoridad de cotización no está disponible.",
      humanConfirmationRequired: true,
    });
  }

  const candidate = bridge.getCurrentQuoteCandidate?.() || null;
  const calculation = bridge.getCurrentQuotePreviewCalculation?.() || null;
  const calculationState = bridge.getCurrentQuotePreviewCalculationState?.() || {};
  const rawState = String(calculationState.state || "").toUpperCase();
  const invalidCandidate = candidate !== null && typeof candidate !== "object";
  const state = calculationState.error ? "error"
    : invalidCandidate ? "invalid"
      : /EXTRACT|LOAD|CALCULAT/.test(rawState) && !candidate ? "loading"
        : candidate && calculation ? "ready"
          : candidate ? "partial"
            : "empty";

  let commercial = null;
  let projectionError = null;
  if (candidate && !invalidCandidate) {
    try {
      commercial = commercialProjection(candidate, calculation);
    } catch {
      projectionError = "No pudimos preparar la lectura comercial completa.";
    }
  }

  return Object.freeze({
    state: projectionError ? "projection_error" : state,
    commercial,
    candidateAvailable: Boolean(candidate && !invalidCandidate),
    calculationAvailable: Boolean(calculation),
    error: calculationState.error || projectionError || null,
    humanConfirmationRequired: calculationState.humanConfirmationRequired !== false,
    sourceAuthority: "ForgeAcceptedQuoteBridge",
  });
}

export function renderQuoteResult(viewModel) {
  const { state, commercial } = viewModel;
  if (state === "empty") {
    return `<section class="quote-result__state" data-quote-empty-state><h2>Sin información suficiente</h2><p>Selecciona una propuesta para preparar su lectura comercial.</p></section>`;
  }
  if (state === "loading") {
    return `<section class="quote-result__state" data-quote-progress><h2>Preparando lectura comercial</h2><p>Estamos extrayendo los datos de la propuesta.</p><progress></progress></section>`;
  }
  if (["blocked", "error", "invalid", "projection_error"].includes(state)) {
    const heading = state === "invalid" ? "Paquete inválido"
      : state === "projection_error" ? "Error de proyección"
        : "No pudimos preparar el resultado";
    return `<section class="quote-result__state quote-result__state--error" data-quote-error-state><h2>${heading}</h2><p>${esc(viewModel.error?.message || viewModel.error || "Intenta cargar nuevamente la propuesta.")}</p><button type="button" data-quote-retry>Volver a intentar</button></section>`;
  }
  if (!commercial) {
    return `<section class="quote-result__state" data-quote-partial-state><h2>Información parcial</h2><p>Requiere validación antes de continuar.</p></section>`;
  }

  const warnings = commercial.warnings.length
    ? commercial.warnings
    : ["Vista preliminar no vinculante. Confirma los datos antes de usarla."];

  return `
    <div class="quote-commercial" data-material3-quote-result-ready data-quote-commercial-projection>
      <section class="quote-commercial__hero" data-quote-result-section data-quote-product-identity>
        <p class="quotes-module__kicker">LECTURA COMERCIAL COMPLETA</p>
        <h2>${esc(commercial.title)}</h2>
        ${itemList(commercial.identity)}
      </section>

      ${section({
        kicker: "APORTACIONES Y PRIMAS",
        title: "Importes de la propuesta",
        items: commercial.premiums,
        attribute: "data-quote-contribution",
      })}

      ${section({
        kicker: "COBERTURA Y VIGENCIA",
        title: "Plazos disponibles",
        items: commercial.term,
        attribute: "data-quote-term",
      })}

      ${section({
        kicker: "VALORES Y RECUPERACIÓN",
        title: "Resultados económicos",
        items: commercial.recovery,
        attribute: "data-quote-calculation-values",
      })}

      ${section({
        kicker: "ESCENARIOS",
        title: "Supuestos disponibles",
        items: commercial.scenarios,
        attribute: "data-quote-scenarios",
      })}

      ${benefitSections(commercial.benefitBlocks)}

      ${section({
        kicker: "DATOS DE LA COTIZACIÓN",
        title: "Origen de la propuesta",
        items: commercial.quoteDetails,
        attribute: "data-quote-details",
      })}

      <section data-quote-result-section data-quote-evidence-warnings>
        <p class="quotes-module__kicker">REVISIÓN HUMANA</p>
        <h2>Alertas y datos pendientes</h2>
        <div class="quote-commercial__review-grid">
          <div>
            <h3>Alertas</h3>
            <ul>${warnings.map(warning => `<li>${esc(warning)}</li>`).join("")}</ul>
          </div>
          <div>
            <h3>Pendiente de confirmar</h3>
            ${commercial.pending.length
              ? `<ul>${commercial.pending.map(item => `<li>${esc(item)}</li>`).join("")}</ul>`
              : "<p>Sin pendientes detectados. Requiere validación humana final.</p>"}
          </div>
        </div>
      </section>

      <details class="quote-commercial__evidence" data-quote-technical-evidence>
        <summary>Evidencia técnica resumida</summary>
        <dl>
          ${fact("Autoridad", commercial.evidence.authority)}
          ${fact("Versión de esquema", schemaLabel(commercial.evidence.schemaVersion))}
          ${fact("Cálculo", commercial.evidence.calculationState)}
          ${fact("Confirmación humana", viewModel.humanConfirmationRequired ? "Requerida" : PENDING)}
        </dl>
      </details>

      <footer class="quote-commercial__actions" data-quote-last-actions>
        ${commercial.nextActions.map(action => `<button type="button" data-quote-next-action="${esc(action.id)}" ${action.enabled ? "" : "disabled"}>${esc(action.label)}</button>`).join("")}
      </footer>
    </div>`;
}

export async function reconcileQuoteResult({ bridge, projection, root }) {
  let viewModel = buildQuoteResultViewModel(bridge);
  if (
    viewModel.state === "partial"
    && typeof bridge?.calculateCurrentQuoteCandidatePreview === "function"
  ) {
    try {
      await bridge.calculateCurrentQuoteCandidatePreview();
    } catch {
      // The extracted proposal remains useful as a partial, recoverable view.
    }
    viewModel = buildQuoteResultViewModel(bridge);
  }
  projection.innerHTML = renderQuoteResult(viewModel);
  projection.hidden = false;
  root.dataset.intakeState = viewModel.state;
  root.dataset.quoteProjectionReady = String(
    viewModel.state === "ready" || viewModel.state === "partial",
  );
  projection.dataset.material3QuoteProjectionReady = String(
    viewModel.state === "ready" || viewModel.state === "partial",
  );
  return viewModel;
}

export { UNKNOWN as QUOTE_UNKNOWN_LABEL };
