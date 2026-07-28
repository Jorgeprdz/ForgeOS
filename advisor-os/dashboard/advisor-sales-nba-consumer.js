const escapeHtml = value =>
  String(value ?? "").replace(
    /[&<>"']/g,
    char =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
      })[char],
  );

function renderResponseButtons(recommendation) {
  if (recommendation.responseActionsAllowed === false) {
    return "";
  }

  return `
    <button type="button" data-nba-response="ACCEPTED">Aceptar</button>
    <button type="button" data-nba-response="MODIFIED">Modificar</button>
    <button type="button" data-nba-response="SNOOZED">Posponer</button>
    <button type="button" data-nba-response="REJECTED">Rechazar</button>
  `;
}

export function renderAdvisorSalesNbaCard(recommendation) {
  if (
    !recommendation ||
    recommendation.recommendationAvailable === false
  ) {
    return `
      <section
        class="forge-dashboard-nba forge-dashboard-nba--limited"
        aria-labelledby="sales-nba-title"
      >
        <p class="forge-pipeline-kicker">Siguiente mejor acción</p>
        <h2 id="sales-nba-title">
          Aún no hay una recomendación con evidencia suficiente
        </h2>
        <p>
          ${escapeHtml(
            recommendation?.limitations?.[0] ||
              "Forge necesita compromisos o actividad verificable antes de recomendar una intervención.",
          )}
        </p>
        <div class="forge-dashboard-nba-actions">
          <button type="button" data-forge-route="advisor-sales-pipeline">
            Abrir Pipeline
          </button>
        </div>
      </section>
    `;
  }

  const signals = Array.isArray(recommendation.supportingSignals)
    ? recommendation.supportingSignals
        .map(signal => `<li>${escapeHtml(signal.label)}</li>`)
        .join("")
    : "";

  const uncertainty =
    Array.isArray(recommendation.uncertainty) &&
    recommendation.uncertainty.length
      ? recommendation.uncertainty
          .map(value => `<li>${escapeHtml(value)}</li>`)
          .join("")
      : "<li>Sin incertidumbre adicional registrada.</li>";

  const subjectLabel =
    recommendation.subjectLabel || recommendation.subjectId;
  const kicker = recommendation.kicker || "Haz esto hoy";
  const boundaryText =
    recommendation.boundaryText ||
    "El asesor decide. Forge no contactará automáticamente al prospecto.";

  return `
    <section
      class="forge-dashboard-nba"
      aria-labelledby="sales-nba-title"
      data-recommendation-id="${escapeHtml(recommendation.recommendationId)}"
      data-recommendation-source="${escapeHtml(
        recommendation.recommendationSource || "ADVISOR_SALES_NBA",
      )}"
    >
      <p class="forge-pipeline-kicker">${escapeHtml(kicker)}</p>
      <h2 id="sales-nba-title">
        ${escapeHtml(recommendation.recommendedAction)} ·
        ${escapeHtml(subjectLabel)}
      </h2>

      <div class="forge-dashboard-nba-grid">
        <div>
          <h3>¿Por qué ahora?</h3>
          <p>${escapeHtml(recommendation.whyNow)}</p>
          <ul>${signals}</ul>
        </div>

        <div>
          <h3>Objetivo</h3>
          <p>${escapeHtml(recommendation.targetOutcome)}</p>
          <h3>Incertidumbre</h3>
          <ul>${uncertainty}</ul>
        </div>

        <div>
          <h3>Canal y argumento</h3>
          <p>${escapeHtml(recommendation.suggestedChannel)}</p>
          <p>${escapeHtml(recommendation.suggestedArgument)}</p>
        </div>
      </div>

      <div class="forge-dashboard-nba-actions">
        ${renderResponseButtons(recommendation)}
        <button
          type="button"
          data-forge-route="advisor-sales-pipeline"
          data-forge-context-type="prospect"
          data-forge-context-id="${escapeHtml(recommendation.subjectId)}"
        >
          Abrir prospecto
        </button>
        <button type="button" data-forge-route="advisor-sales-pipeline">
          Abrir Pipeline
        </button>
      </div>

      <p class="forge-dashboard-nba-boundary">
        ${escapeHtml(boundaryText)}
      </p>
    </section>
  `;
}

export function hydrateAdvisorSalesNba(container, recommendation) {
  if (!container) return false;
  container.innerHTML = renderAdvisorSalesNbaCard(recommendation);
  return true;
}
