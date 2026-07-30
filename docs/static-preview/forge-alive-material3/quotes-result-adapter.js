const UNKNOWN = "No disponible en la propuesta";
const PENDING = "Pendiente de confirmar";

function esc(value) {
  return String(value ?? "").replace(/[&<>"']/g, character => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  })[character]);
}

function first(...values) {
  return values.find(value => value !== null && value !== undefined && value !== "");
}

function boundedStrings(values, limit = 8) {
  return (Array.isArray(values) ? values : [])
    .filter(value => typeof value === "string" && value.trim())
    .slice(0, limit)
    .map(value => value.trim());
}

function formatAmount(value, currency) {
  if (value === null || value === undefined || value === "") return null;
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

function summaryBlocks(candidate) {
  return Array.isArray(candidate?.benefitSummary?.blocks)
    ? candidate.benefitSummary.blocks
    : [];
}

function blockLines(candidate, types) {
  return summaryBlocks(candidate)
    .filter(block => types.includes(block?.type))
    .flatMap(block => Array.isArray(block.lines) ? block.lines : [])
    .slice(0, 12);
}

function lineItems(candidate, types) {
  return blockLines(candidate, types).flatMap(line => {
    const value = formatAmount(line?.value, line?.unit);
    return line?.label && value
      ? [{ label: String(line.label), value }]
      : [];
  });
}

function protectionItems(candidate) {
  const direct = lineItems(candidate, ["protection_summary"]);
  const additional = summaryBlocks(candidate)
    .filter(block => block?.type === "additional_coverages")
    .flatMap(block => Array.isArray(block.benefits) ? block.benefits : [])
    .slice(0, 6)
    .flatMap(benefit => {
      const value = formatAmount(benefit?.value, candidate?.currency)
        || first(
          ...(Array.isArray(benefit?.fields)
            ? benefit.fields.map(field => formatAmount(field?.value, candidate?.currency))
            : []),
        );
      return benefit?.name && value
        ? [{ label: String(benefit.name), value }]
        : [];
    });
  return [...direct, ...additional].slice(0, 10);
}

function missingInformation(candidate) {
  return summaryBlocks(candidate)
    .filter(block => block?.type === "missing_information")
    .flatMap(block => boundedStrings(block.missing, 10));
}

function commercialProjection(candidate, calculation) {
  const currency = first(candidate?.currency, calculation?.currency);
  const participantName = first(
    candidate?.insured,
    candidate?.primaryInsured,
    candidate?.prospect,
    candidate?.clientName,
    candidate?.name,
    candidate?.participants?.primary_insured,
  );
  const participantAge = first(
    candidate?.age,
    candidate?.primaryAge,
    candidate?.participants?.primary_age,
  );
  const objective = first(
    candidate?.objective,
    candidate?.solutionObjective,
    lineItems(candidate, ["education_goal"])[0]?.value
      ? `Meta educativa: ${lineItems(candidate, ["education_goal"])[0].value}`
      : null,
  );
  const contributionAmount = first(
    candidate?.annualPremiumWithRecommended,
    candidate?.plannedOrAvePremium,
    candidate?.annualPremium,
    calculation?.annualPremium,
    calculation?.contributionAmount,
  );
  const paymentYears = first(candidate?.paymentYears, calculation?.paymentYears);
  const projectedBenefits = [
    ...lineItems(candidate, ["education_goal", "payout_options", "secondary_details"]),
    ...[
      ["Valor proyectado", calculation?.projectedValue],
      ["Valor garantizado", calculation?.guaranteedValue],
      ["Valor en efectivo", calculation?.cashValue],
      ["Recuperación total", first(calculation?.totalRecovery, candidate?.totalRecovery)],
    ].flatMap(([label, value]) => {
      const formatted = formatAmount(value, currency);
      return formatted ? [{ label, value: formatted }] : [];
    }),
  ].slice(0, 12);
  const protections = protectionItems(candidate);
  const confirmedFacts = [
    ["Suma asegurada", formatAmount(candidate?.sumAssured, currency)],
    ["Prima base anual", formatAmount(candidate?.annualPremium, currency)],
    ["Beneficiario educativo", candidate?.childOrEducationBeneficiary],
    ["Inicio", first(candidate?.startDate, calculation?.startDate)],
    ["Fin", first(candidate?.endDate, calculation?.endDate)],
  ].flatMap(([label, value]) => value ? [{ label, value: String(value) }] : []);
  const warnings = [
    ...boundedStrings(candidate?.warnings),
    ...boundedStrings(calculation?.warnings),
    ...boundedStrings(calculation?.assumptions),
  ].slice(0, 10);
  const pendingConfirmation = missingInformation(candidate);
  if (!participantName) pendingConfirmation.push("Persona asegurada");
  if (contributionAmount === null || contributionAmount === undefined) {
    pendingConfirmation.push("Prima o aportación");
  }
  if (!first(candidate?.coveragePeriod, paymentYears)) {
    pendingConfirmation.push("Plazo");
  }

  return Object.freeze({
    product: Object.freeze({
      name: first(candidate?.productName, candidate?.product, candidate?.displayName) || null,
      family: first(candidate?.productFamily, candidate?.family) || null,
      version: first(candidate?.productVersion, candidate?.version) || null,
    }),
    participant: Object.freeze({
      name: participantName || null,
      age: participantAge ?? null,
      role: participantName ? "Persona asegurada" : null,
    }),
    objective: objective || null,
    contribution: Object.freeze({
      amount: contributionAmount ?? null,
      currency: currency || null,
      frequency: first(candidate?.paymentFrequency, calculation?.paymentFrequency, contributionAmount ? "Anual" : null) || null,
    }),
    term: Object.freeze({
      duration: first(
        candidate?.coveragePeriod,
        paymentYears ? `${paymentYears} años` : null,
      ) || null,
      startDate: first(candidate?.startDate, calculation?.startDate) || null,
      endDate: first(candidate?.endDate, calculation?.endDate) || null,
    }),
    projectedBenefits: Object.freeze(projectedBenefits),
    protections: Object.freeze(protections),
    confirmedFacts: Object.freeze(confirmedFacts),
    warnings: Object.freeze(warnings),
    pendingConfirmation: Object.freeze([...new Set(pendingConfirmation)].slice(0, 10)),
    nextActions: Object.freeze([
      Object.freeze({
        id: "review_pending",
        label: "Revisar datos pendientes",
        enabled: pendingConfirmation.length > 0,
      }),
      Object.freeze({
        id: "confirm_quote",
        label: "Confirmar cotización",
        enabled: Boolean(candidate),
      }),
    ]),
    evidence: Object.freeze({
      authority: "ForgeAcceptedQuoteBridge",
      sourceDocument: first(candidate?.fileName, candidate?.sourceDocument) || null,
      schemaVersion: candidate?.schemaVersion || null,
      calculationState: calculation ? "Cálculo preliminar disponible" : "Cálculo pendiente",
    }),
  });
}

function fact(label, value, fallback = UNKNOWN) {
  return `
    <div class="quote-commercial__fact">
      <dt>${esc(label)}</dt>
      <dd>${value === null || value === undefined || value === ""
        ? `<span class="quote-result__unknown">${esc(fallback)}</span>`
        : esc(value)}</dd>
    </div>`;
}

function itemList(items, emptyLabel = PENDING) {
  if (!items.length) {
    return `<p class="quote-result__unknown">${esc(emptyLabel)}</p>`;
  }
  return `<dl class="quote-commercial__list">${items.map(item =>
    fact(item.label, item.value)
  ).join("")}</dl>`;
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
      projectionError = "No pudimos preparar la lectura comercial.";
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

  const contribution = formatAmount(
    commercial.contribution.amount,
    commercial.contribution.currency,
  );
  const warnings = commercial.warnings.length
    ? commercial.warnings
    : ["Vista preliminar no vinculante. Confirma los datos antes de usarla."];
  return `
    <div class="quote-commercial" data-material3-quote-result-ready data-quote-commercial-projection>
      <section class="quote-commercial__hero" data-quote-result-section data-quote-product-identity>
        <p class="quotes-module__kicker">LECTURA COMERCIAL</p>
        <h2>${esc(commercial.product.name || PENDING)}</h2>
        <dl class="quote-commercial__summary">
          ${fact("Familia", commercial.product.family)}
          ${fact("Participante", commercial.participant.name)}
          ${fact("Rol", commercial.participant.role)}
          ${fact("Edad", commercial.participant.age)}
          ${fact("Objetivo", commercial.objective, PENDING)}
        </dl>
      </section>

      <section data-quote-result-section data-quote-contribution>
        <p class="quotes-module__kicker">APORTACIÓN Y PLAZO</p>
        <h2>Resumen de la propuesta</h2>
        <dl class="quote-commercial__summary">
          ${fact("Prima o aportación", contribution, PENDING)}
          ${fact("Periodicidad", commercial.contribution.frequency, PENDING)}
          ${fact("Plazo", commercial.term.duration, PENDING)}
          ${fact("Fecha de inicio", commercial.term.startDate)}
          ${fact("Fecha final", commercial.term.endDate)}
        </dl>
      </section>

      <section data-quote-result-section data-quote-calculation-values>
        <p class="quotes-module__kicker">BENEFICIOS PROYECTADOS</p>
        <h2>Valores disponibles</h2>
        ${itemList(commercial.projectedBenefits)}
      </section>

      <section data-quote-result-section data-quote-protections>
        <p class="quotes-module__kicker">PROTECCIONES</p>
        <h2>Coberturas incluidas</h2>
        ${itemList(commercial.protections)}
      </section>

      <section data-quote-result-section data-quote-confirmed-facts>
        <p class="quotes-module__kicker">INFORMACIÓN CONFIRMADA</p>
        <h2>Datos presentes en la propuesta</h2>
        ${itemList(commercial.confirmedFacts, UNKNOWN)}
      </section>

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
            ${commercial.pendingConfirmation.length
              ? `<ul>${commercial.pendingConfirmation.map(item => `<li>${esc(item)}</li>`).join("")}</ul>`
              : "<p>Sin pendientes detectados. Requiere validación humana final.</p>"}
          </div>
        </div>
      </section>

      <details class="quote-commercial__evidence" data-quote-technical-evidence>
        <summary>Evidencia técnica resumida</summary>
        <dl>
          ${fact("Autoridad", commercial.evidence.authority)}
          ${fact("Documento fuente", commercial.evidence.sourceDocument)}
          ${fact("Versión de esquema", commercial.evidence.schemaVersion)}
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
      // The commercial candidate remains useful as a partial, recoverable view.
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
