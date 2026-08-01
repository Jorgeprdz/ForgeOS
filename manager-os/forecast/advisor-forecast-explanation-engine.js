const {
  ADVISOR_FORECAST_STATUSES
} = require("./advisor-forecast-composer");

function present(value) { return value !== undefined && value !== null && value !== ""; }
function asArray(value) { if (!present(value)) return []; return Array.isArray(value) ? value.filter(present) : [value].filter(present); }
function unique(values) { return [...new Set(values.filter(present))]; }
function clone(value) { return present(value) ? JSON.parse(JSON.stringify(value)) : value; }
function deepFreeze(value) {
  if (!value || typeof value !== "object" || Object.isFrozen(value)) return value;
  Object.values(value).forEach(deepFreeze);
  return Object.freeze(value);
}
function metric(value) {
  return typeof value === "number"
    ? new Intl.NumberFormat("es-MX", { maximumFractionDigits: 1 }).format(value)
    : "sin dato";
}
function fact({ code, tone = "INFO", message, evidenceRefs = [], sourceAuthorities = [] }) {
  return {
    code,
    tone,
    message,
    evidenceRefs: unique(asArray(evidenceRefs)),
    sourceAuthorities: unique(asArray(sourceAuthorities)),
    referenceOnly: true
  };
}
function signalFact(signal, code, label, unitLabel) {
  if (!signal || !["KNOWN", "ZERO", "STALE"].includes(signal.state)) return null;
  return fact({
    code,
    tone: signal.state === "STALE" ? "CAUTION" : "INFO",
    message: `${label}: ${metric(signal.value)} ${unitLabel}${signal.state === "STALE" ? " (dato desactualizado)" : ""}.`,
    evidenceRefs: signal.evidenceRefs,
    sourceAuthorities: [signal.sourceAuthority]
  });
}
function primaryExplanation(composer) {
  const target = metric(composer.current.target);
  const projection = metric(composer.pace.baselineProjection);
  switch (composer.forecastStatus) {
    case ADVISOR_FORECAST_STATUSES.ON_TRACK:
      return `El ritmo de pólizas confirmadas proyecta ${projection} frente a una meta mensual de ${target}.`;
    case ADVISOR_FORECAST_STATUSES.AT_RISK:
      return `El ritmo proyecta ${projection} pólizas: está cerca de la meta de ${target}, pero todavía queda por debajo.`;
    case ADVISOR_FORECAST_STATUSES.BEHIND:
      return `El ritmo actual proyecta ${projection} pólizas, por debajo de la meta mensual de ${target}.`;
    case ADVISOR_FORECAST_STATUSES.NEEDS_UPDATE:
      return "La proyección conserva datos anteriores, pero necesita actualizar las fuentes críticas antes de tratarla como vigente.";
    default:
      return "No hay información suficiente para calcular una proyección responsable del periodo.";
  }
}
function buildAdvisorForecastExplanation(composer) {
  if (!composer || composer.contractVersion !== "ADVISOR_FORECAST_COMPOSER_V1") {
    throw new TypeError("Advisor Forecast Composer V1 result is required");
  }
  const supportingSignals = [];
  const riskSignals = [];
  const recommendations = [];

  if (composer.pace.status === "READY") {
    supportingSignals.push(fact({
      code: "CONFIRMED_POLICY_PACE",
      message: `Con ${metric(composer.current.production)} pólizas confirmadas en ${composer.pace.elapsedDays} días, el ritmo base proyecta ${metric(composer.pace.baselineProjection)} al cierre del periodo.`,
      evidenceRefs: composer.evidence.evidenceRefs,
      sourceAuthorities: ["PRODUCTION_EVENTS", "SMNYL_PACE_FORECAST_COMPATIBLE_V1"]
    }));
    supportingSignals.push(fact({
      code: "FORECAST_SCENARIO_RANGE",
      message: `Los escenarios de ritmo van de ${metric(composer.pace.scenarios.conservative)} a ${metric(composer.pace.scenarios.stretch)} pólizas; son contexto, no certeza de cierre.`,
      evidenceRefs: composer.evidence.evidenceRefs,
      sourceAuthorities: ["MANAGER_ADVISOR_FORECAST_ENGINE"]
    }));
  }

  const pipeline = composer.operationalContext.pipeline;
  if (pipeline && ["KNOWN", "ZERO", "STALE"].includes(pipeline.state)) {
    supportingSignals.push(fact({
      code: "ACTIVE_PIPELINE_CONTEXT",
      tone: pipeline.state === "STALE" ? "CAUTION" : "INFO",
      message: `Pipeline registra ${metric(pipeline.value)} oportunidades activas; en esta etapa no se ponderan por monto ni probabilidad.`,
      evidenceRefs: pipeline.evidenceRefs,
      sourceAuthorities: [pipeline.sourceAuthority, "BITACORA"]
    }));
    if (pipeline.state === "ZERO") {
      riskSignals.push(fact({
        code: "PIPELINE_EXPLICIT_ZERO",
        tone: "RISK",
        message: "El Pipeline confirmado está en cero para el contexto disponible.",
        evidenceRefs: pipeline.evidenceRefs,
        sourceAuthorities: [pipeline.sourceAuthority]
      }));
      recommendations.push({
        actionId: "OPEN_PIPELINE",
        label: "Revisar Pipeline",
        target: "PIPELINE",
        requiresHumanAction: true
      });
    }
  }

  const activityFact = signalFact(
    composer.operationalContext.activity,
    "CONFIRMED_ACTIVITY_CONTEXT",
    "Actividad confirmada",
    "eventos"
  );
  if (activityFact) supportingSignals.push(activityFact);

  if ([
    ADVISOR_FORECAST_STATUSES.AT_RISK,
    ADVISOR_FORECAST_STATUSES.BEHIND
  ].includes(composer.forecastStatus)) {
    riskSignals.push(fact({
      code: "PACE_BELOW_TARGET",
      tone: "RISK",
      message: `La proyección base es ${metric(composer.pace.baselineProjection)} frente a una meta de ${metric(composer.current.target)} pólizas.`,
      evidenceRefs: composer.evidence.evidenceRefs,
      sourceAuthorities: ["PRODUCTION_EVENTS", "ADVISOR_MONTHLY_POLICY_GOAL"]
    }));
    recommendations.push({
      actionId: "REVIEW_PIPELINE",
      label: "Revisar oportunidades",
      target: "PIPELINE",
      requiresHumanAction: true
    });
    recommendations.push({
      actionId: "OPEN_ACTIVITY",
      label: "Revisar actividad",
      target: "ACTIVITY",
      requiresHumanAction: true
    });
  }

  const unavailableFields = Object.entries(composer.signalQuality.byState)
    .filter(([, state]) => ["UNKNOWN", "MISSING"].includes(state))
    .map(([field]) => field);
  const staleFields = Object.entries(composer.signalQuality.byState)
    .filter(([, state]) => state === "STALE")
    .map(([field]) => field);

  if (unavailableFields.length) {
    riskSignals.push(fact({
      code: "MISSING_OR_UNKNOWN_SIGNALS",
      tone: "CAUTION",
      message: `Faltan señales utilizables: ${unavailableFields.join(", ")}.`,
      sourceAuthorities: ["ADVISOR_FORECAST_INPUT_V1"]
    }));
    recommendations.push({
      actionId: "UPDATE_FORECAST_SOURCES",
      label: "Actualizar fuentes",
      target: "FORECAST_SOURCES",
      requiresHumanAction: true
    });
  }

  if (staleFields.length) {
    riskSignals.push(fact({
      code: "STALE_SIGNALS",
      tone: "CAUTION",
      message: `Hay señales desactualizadas: ${staleFields.join(", ")}.`,
      sourceAuthorities: ["ADVISOR_FORECAST_INPUT_V1"]
    }));
    recommendations.push({
      actionId: "REFRESH_FORECAST_SOURCES",
      label: "Actualizar datos",
      target: "FORECAST_SOURCES",
      requiresHumanAction: true
    });
  }

  if (!recommendations.length) {
    recommendations.push({
      actionId: "OPEN_FORECAST_DETAIL",
      label: "Ver Forecast",
      target: "FORECAST_DETAIL",
      requiresHumanAction: true
    });
  }

  const result = {
    contractVersion: "ADVISOR_FORECAST_EXPLANATION_V1",
    advisorId: composer.advisorId,
    period: clone(composer.period),
    explanationStatus: composer.forecastStatus === ADVISOR_FORECAST_STATUSES.INSUFFICIENT_DATA
      ? "INSUFFICIENT_DATA"
      : (riskSignals.length ? "PARTIAL" : "READY"),
    primaryExplanation: primaryExplanation(composer),
    supportingSignals: supportingSignals.slice(0, 5),
    riskSignals: riskSignals.slice(0, 5),
    missingInformation: unavailableFields,
    staleInformation: staleFields,
    recommendedAttention: [
      ...new Map(recommendations.map((entry) => [entry.actionId, entry])).values()
    ].slice(0, 3),
    evidenceRefs: unique([
      ...composer.evidence.evidenceRefs,
      ...supportingSignals.flatMap((entry) => entry.evidenceRefs),
      ...riskSignals.flatMap((entry) => entry.evidenceRefs)
    ]),
    uncertainty: unique([
      ...composer.confidenceLimitations,
      "Explanation describes observed and projected context only; it does not assert hidden causation."
    ]),
    automaticActionAllowed: false,
    createsTruth: false
  };
  return deepFreeze(result);
}

module.exports = {
  buildAdvisorForecastExplanation
};
