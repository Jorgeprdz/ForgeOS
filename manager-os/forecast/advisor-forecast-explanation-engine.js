const SIGNAL_LABELS = Object.freeze({
  target: "meta mensual",
  production: "producción confirmada",
  pipeline: "Pipeline",
  activity: "actividad",
  appointments: "citas",
  followups: "seguimientos",
  prospecting: "prospección",
  referrals: "referidos",
  historicalContext: "histórico"
});

function asArray(value) { return Array.isArray(value) ? value : []; }
function unique(values) { return [...new Set(values.filter(Boolean))]; }
function clone(value) { return value == null ? value : JSON.parse(JSON.stringify(value)); }

function signalEntries(input) {
  return Object.keys(SIGNAL_LABELS).map((key) => ({ key, label: SIGNAL_LABELS[key], signal: input?.[key] || null }));
}

function buildAdvisorForecastExplanation({ input, paceProjection, forecastContext } = {}) {
  if (!input || typeof input !== "object") throw new TypeError("Advisor Forecast explanation input is required");

  const entries = signalEntries(input);
  const missing = entries.filter(({ signal }) => !signal || ["MISSING", "UNKNOWN"].includes(signal.state));
  const stale = entries.filter(({ signal }) => signal?.state === "STALE");
  const known = entries.filter(({ signal }) => signal && ["KNOWN", "ZERO", "STALE"].includes(signal.state));
  const risks = [];
  const supporting = [];

  const production = input.production;
  const target = input.target;
  const pipeline = input.pipeline;
  const activity = input.activity;

  if (paceProjection?.status === "READY" && typeof paceProjection.projectedPeriodClose === "number") {
    supporting.push({
      signal: "production",
      statement: `El ritmo confirmado apunta a ${paceProjection.projectedPeriodClose} pólizas al cierre del periodo.`,
      evidenceRefs: asArray(production?.evidenceRefs)
    });
  }

  if (target && production && typeof target.value === "number" && typeof production.value === "number") {
    const gap = Math.max(0, target.value - production.value);
    if (gap === 0) {
      supporting.push({ signal: "target", statement: "La producción confirmada ya cubre la meta mensual.", evidenceRefs: unique([...asArray(target.evidenceRefs), ...asArray(production.evidenceRefs)]) });
    } else {
      risks.push({ signal: "target", statement: `Faltan ${gap} pólizas confirmadas para cubrir la meta vigente.`, evidenceRefs: unique([...asArray(target.evidenceRefs), ...asArray(production.evidenceRefs)]) });
    }
  }

  if (pipeline?.state === "ZERO") risks.push({ signal: "pipeline", statement: "No hay oportunidades activas confirmadas en el Pipeline.", evidenceRefs: asArray(pipeline.evidenceRefs) });
  if (activity?.state === "ZERO") risks.push({ signal: "activity", statement: "La fuente de actividad confirma cero eventos en el periodo consultado.", evidenceRefs: asArray(activity.evidenceRefs) });
  if (typeof pipeline?.value === "number" && pipeline.value > 0) supporting.push({ signal: "pipeline", statement: `Hay ${pipeline.value} oportunidades activas sin ponderación comercial.`, evidenceRefs: asArray(pipeline.evidenceRefs) });
  if (typeof activity?.value === "number" && activity.value > 0) supporting.push({ signal: "activity", statement: `Se observan ${activity.value} eventos de actividad confirmados.`, evidenceRefs: asArray(activity.evidenceRefs) });

  const missingInformation = missing.map(({ key, label, signal }) => ({ signal: key, statement: `Falta contexto confiable de ${label}.`, reason: signal?.missingReason || asArray(signal?.uncertainty)[0] || "source_context_missing" }));
  const staleInformation = stale.map(({ key, label }) => ({ signal: key, statement: `El contexto de ${label} está desactualizado y requiere refresco.` }));

  let primaryExplanation;
  if (missingInformation.length > 0) primaryExplanation = `La proyección es parcial porque faltan ${missingInformation.length} señales necesarias.`;
  else if (staleInformation.length > 0) primaryExplanation = `La proyección usa ${staleInformation.length} señales desactualizadas y requiere revisión.`;
  else if (risks.length > 0) primaryExplanation = risks[0].statement;
  else if (supporting.length > 0) primaryExplanation = supporting[0].statement;
  else primaryExplanation = "No existe evidencia suficiente para explicar una proyección accionable.";

  return Object.freeze({
    explanationStatus: missingInformation.length ? "PARTIAL" : staleInformation.length ? "STALE" : "READY",
    primaryExplanation,
    supportingSignals: clone(supporting),
    riskSignals: clone(risks),
    missingInformation: clone(missingInformation),
    staleInformation: clone(staleInformation),
    recommendedAttention: clone([...missingInformation, ...staleInformation, ...risks].slice(0, 3)),
    evidenceRefs: unique([
      ...supporting.flatMap((entry) => asArray(entry.evidenceRefs)),
      ...risks.flatMap((entry) => asArray(entry.evidenceRefs)),
      ...asArray(forecastContext?.evidenceRefs)
    ]),
    unsupportedClaimsCreated: false,
    automaticActionCreated: false,
    sourceMutationPerformed: false
  });
}

module.exports = { buildAdvisorForecastExplanation };
