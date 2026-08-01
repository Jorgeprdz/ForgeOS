const DETAIL_SCREEN_VERSION = "AF-DETAIL-002";

function text(value) { return value === undefined || value === null ? "" : String(value); }
function finite(value) { return typeof value === "number" && Number.isFinite(value) ? value : null; }
function safeArray(value) { return Array.isArray(value) ? value : []; }
function escapeHtml(value) {
  return text(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function metric(value, suffix = "") {
  return finite(value) === null ? "Sin dato" : `${value}${suffix}`;
}

function contributorRows(readModel) {
  return safeArray(readModel?.opportunityForecast?.topContributors).map((entry) => ({
    opportunityId: entry.opportunityId || "Sin identificador",
    stage: entry.stage || "UNKNOWN",
    classification: entry.classification || "UNKNOWN",
    probability: finite(entry.probability),
    expectedPolicyContribution: finite(entry.expectedPolicyContribution),
  }));
}

export function buildAdvisorForecastDetailView(readModel = {}) {
  if (!["ADVISOR_FORECAST_READ_MODEL_V2", "ADVISOR_FORECAST_READ_MODEL_V3"].includes(readModel.schema)) {
    throw new TypeError("ADVISOR_FORECAST_READ_MODEL_V2 or V3 is required");
  }
  return Object.freeze({
    version: DETAIL_SCREEN_VERSION,
    state: readModel.state,
    periodLabel: readModel.periodLabel,
    confidence: readModel.confidence,
    healthStatus: readModel.healthStatus,
    summary: {
      target: finite(readModel.target),
      currentProduction: finite(readModel.currentProduction),
      paceProjection: finite(readModel.paceProjection),
      currentCoverage: finite(readModel.goalGap?.currentCoverage),
      paceCoverage: finite(readModel.goalGap?.paceCoverage),
    },
    gap: {
      state: readModel.goalGap?.state || null,
      confirmedGap: finite(readModel.goalGap?.confirmedGap),
      weightedPipelineContribution: finite(readModel.goalGap?.weightedPipelineContribution),
      remainingAfterWeightedPipeline: finite(readModel.goalGap?.remainingAfterWeightedPipeline),
      weightedPipelineCoverage: finite(readModel.goalGap?.weightedPipelineCoverage),
    },
    opportunities: {
      activeCount: finite(readModel.opportunityForecast?.activeOpportunityCount),
      atRiskCount: finite(readModel.opportunityForecast?.atRiskCount),
      unknownCount: finite(readModel.opportunityForecast?.unknownCount),
      contributors: contributorRows(readModel),
    },
    activityRequirement: readModel.activityRequirement ? {
      status: readModel.activityRequirement.status || null,
      confidence: readModel.activityRequirement.confidence || null,
      contactsRequired: finite(readModel.activityRequirement.contactsRequired),
      appointmentsRequired: finite(readModel.activityRequirement.appointmentsRequired),
      presentationsRequired: finite(readModel.activityRequirement.presentationsRequired),
      applicationsRequired: finite(readModel.activityRequirement.applicationsRequired),
      policiesRequired: finite(readModel.activityRequirement.policiesRequired),
      cadence: readModel.activityRequirement.cadence || null,
      missingRates: safeArray(readModel.activityRequirement.missingRates),
      humanConfirmationRequired: true,
    } : null,
    scenarios: readModel.scenarios || {},
    explanation: readModel.primaryExplanation || "No hay una explicación disponible.",
    risks: safeArray(readModel.riskSignals),
    missing: safeArray(readModel.missingInformation),
    stale: safeArray(readModel.staleInformation),
    evidenceRefs: safeArray(readModel.evidenceRefs),
    actions: safeArray(readModel.actions),
    readOnly: true,
    finalAuthority: "HUMAN",
    createsRevenueTruth: false,
    createsDatabaseWrite: false,
    createsTask: false,
  });
}

function renderContributors(contributors) {
  if (!contributors.length) return '<p class="advisor-forecast-empty">No hay oportunidades con evidencia suficiente para ponderar.</p>';
  return `<div class="advisor-forecast-contributors">${contributors.map((entry) => `
    <article class="advisor-forecast-contributor">
      <div>
        <strong>${escapeHtml(entry.opportunityId)}</strong>
        <span>${escapeHtml(entry.stage)} · ${escapeHtml(entry.classification)}</span>
      </div>
      <div class="advisor-forecast-contributor-metrics">
        <b>${metric(entry.probability, "%")}</b>
        <small>${metric(entry.expectedPolicyContribution)} póliza esperada</small>
      </div>
    </article>`).join("")}</div>`;
}

function renderActivityRequirement(requirement) {
  if (!requirement) return "";
  if (["INSUFFICIENT_DATA", "BLOCKED"].includes(requirement.status)) {
    const missing = requirement.missingRates.length ? ` Faltan: ${requirement.missingRates.join(", ")}.` : "";
    return `
    <section class="advisor-forecast-section advisor-forecast-boundary">
      <h3>Actividad necesaria</h3>
      <p>No existe evidencia suficiente para convertir la brecha en actividad confiable.${escapeHtml(missing)}</p>
    </section>`;
  }
  if (requirement.status === "GOAL_COVERED") {
    return `
    <section class="advisor-forecast-section advisor-forecast-boundary">
      <h3>Actividad necesaria</h3>
      <p>La brecha gobernada está cubierta; Forecast no prescribe actividad adicional.</p>
    </section>`;
  }
  return `
    <section class="advisor-forecast-section">
      <div class="advisor-forecast-section-heading">
        <h3>Actividad mínima para sostener la brecha</h3>
        <span>Confianza ${escapeHtml(text(requirement.confidence).toLowerCase())}</span>
      </div>
      <div class="advisor-forecast-summary-grid advisor-forecast-activity-grid">
        <article><span>Contactos</span><strong>${metric(requirement.contactsRequired)}</strong><small>prospección</small></article>
        <article><span>Citas</span><strong>${metric(requirement.appointmentsRequired)}</strong><small>mínimo estimado</small></article>
        <article><span>Presentaciones</span><strong>${metric(requirement.presentationsRequired)}</strong><small>mínimo estimado</small></article>
        <article><span>Solicitudes</span><strong>${metric(requirement.applicationsRequired)}</strong><small>para ${metric(requirement.policiesRequired)} pólizas</small></article>
      </div>
      <p class="advisor-forecast-empty">Es un mínimo de planeación basado en conversiones respaldadas por evidencia. Requiere revisión y confirmación humana antes de pasar a Actividad.</p>
    </section>`;
}

function renderActions(actions) {
  return actions.map((action) => `
    <button type="button" class="advisor-forecast-action" data-forecast-destination="${escapeHtml(action.destination)}">
      ${escapeHtml(action.label || "Abrir")}
    </button>`).join("");
}

export function renderAdvisorForecastDetailMarkup(readModel = {}) {
  const view = buildAdvisorForecastDetailView(readModel);
  return `
  <section class="advisor-forecast-detail" data-advisor-forecast-detail="${DETAIL_SCREEN_VERSION}" data-forecast-state="${escapeHtml(view.state)}">
    <header class="advisor-forecast-detail-header">
      <div>
        <p class="advisor-forecast-eyebrow">FORECAST · ${escapeHtml(view.periodLabel)}</p>
        <h2>Proyección mensual</h2>
        <p>${escapeHtml(view.explanation)}</p>
      </div>
      <div class="advisor-forecast-confidence">Confianza ${escapeHtml(text(view.confidence).toLowerCase())}</div>
    </header>

    <div class="advisor-forecast-summary-grid">
      <article><span>Confirmadas</span><strong>${metric(view.summary.currentProduction)}</strong><small>Meta ${metric(view.summary.target)}</small></article>
      <article><span>Ritmo de cierre</span><strong>${metric(view.summary.paceProjection)}</strong><small>${metric(view.summary.paceCoverage, "%")} de cobertura</small></article>
      <article><span>Pipeline ponderado</span><strong>${metric(view.gap.weightedPipelineContribution)}</strong><small>Contexto, no garantía</small></article>
      <article><span>Brecha residual</span><strong>${metric(view.gap.remainingAfterWeightedPipeline)}</strong><small>${escapeHtml(view.gap.state)}</small></article>
    </div>

    <section class="advisor-forecast-section">
      <div class="advisor-forecast-section-heading"><h3>Oportunidades que sostienen el forecast</h3><span>${metric(view.opportunities.activeCount)} activas · ${metric(view.opportunities.atRiskCount)} en riesgo</span></div>
      ${renderContributors(view.opportunities.contributors)}
    </section>

    ${renderActivityRequirement(view.activityRequirement)}

    <section class="advisor-forecast-section advisor-forecast-boundary">
      <h3>Cómo leer esta proyección</h3>
      <p>La producción confirmada proviene exclusivamente de POLICY_SOLD_CONFIRMED. El Pipeline y la actividad requerida son contexto de decisión: no crean ingreso, emisión, tarea ni cierre automático.</p>
    </section>

    <footer class="advisor-forecast-detail-actions">${renderActions(view.actions)}</footer>
  </section>`;
}

export function mountAdvisorForecastDetailScreen({ root, readModel, navigate = null } = {}) {
  if (!(root instanceof Element)) throw new TypeError("Advisor Forecast detail root is required");
  root.innerHTML = renderAdvisorForecastDetailMarkup(readModel);
  root.dataset.advisorForecastDetailMounted = DETAIL_SCREEN_VERSION;
  for (const button of root.querySelectorAll("[data-forecast-destination]")) {
    button.addEventListener("click", () => {
      const destination = button.dataset.forecastDestination;
      const action = safeArray(readModel.actions).find((entry) => entry.destination === destination);
      if (action && typeof navigate === "function") navigate(action, readModel);
    });
  }
  return Object.freeze({
    version: DETAIL_SCREEN_VERSION,
    unmount() {
      root.replaceChildren();
      root.dataset.advisorForecastDetailMounted = "unmounted";
    },
  });
}

export { DETAIL_SCREEN_VERSION };
