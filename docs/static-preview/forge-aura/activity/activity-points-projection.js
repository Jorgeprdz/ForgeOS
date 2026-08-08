import "./activity-capture-directory-ux.js";
import {
  calculateActivityPoints,
  findPointCombinations,
  POINTS_AUTHORITY_METADATA,
} from "../../../platform/productivity/activity-points-authority-adapter.js";

const LABELS = Object.freeze({
  referidos: "Referidos",
  llamadas: "Llamadas",
  citas_agendadas: "Citas agendadas",
  citas_iniciales: "Citas iniciales",
  citas_cierre: "Citas de cierre",
  solicitudes_firmadas: "Solicitudes firmadas",
  polizas_pagadas: "Pólizas pagadas",
  referido_asesor: "Referido de asesor",
});

const ACTION_LABELS = Object.freeze({
  referidos: "Referido recibido",
  llamadas: "Llamada completada",
  citas_agendadas: "Cita agendada",
  citas_iniciales: "Cita inicial realizada",
  citas_cierre: "Cita de cierre realizada",
});

const MANUAL_ACTIONABLE_METRICS = new Set(Object.keys(ACTION_LABELS));
const OFFICIAL_COMBINATION_LIMIT = 4096;

function freeze(value) {
  if (!value || typeof value !== "object" || Object.isFrozen(value)) return value;
  Object.values(value).forEach(freeze);
  return Object.freeze(value);
}

function candidateInput(result = {}) {
  return result.activityPointsInput
    || result.pointsInput
    || result.scoringInput
    || null;
}

export function projectOfficialActivityPoints(result = {}) {
  const candidate = candidateInput(result);
  const score = calculateActivityPoints({
    counts: candidate?.counts || {},
    ruleSnapshot: candidate?.ruleSnapshot,
    period: candidate?.period || result.period?.current || null,
    timezone: candidate?.timezone || result.timeZone || "America/Mexico_City",
  });

  return freeze({
    ...score,
    labels: LABELS,
    authority: score.authority || POINTS_AUTHORITY_METADATA,
    sourceConnected: true,
    evidenceComplete: score.state === "READY",
  });
}

export function pointRuleRows(projection) {
  return Object.entries(projection?.weights || {}).map(([metricKey, points]) => freeze({
    metricKey,
    label: LABELS[metricKey] || metricKey,
    points,
  }));
}

export function pointImpactForMetric(projection, metricKey) {
  const points = projection?.weights?.[metricKey];
  return Number.isInteger(points) && points >= 0 ? points : null;
}

export function recommendOfficialActivityActions(projection, { maxUnits = 4 } = {}) {
  if (projection?.state !== "READY" || !Number.isInteger(projection.remaining) || projection.remaining <= 0) {
    return null;
  }

  // The official adapter owns enumeration and scoring. We request its complete
  // bounded candidate set first, then apply the Activity manual-action safety
  // boundary so a policy/application truth is never suggested merely for points.
  const candidates = findPointCombinations(projection.remaining, {
    maxUnits,
    limit: OFFICIAL_COMBINATION_LIMIT,
  }).filter(candidate => Object.keys(candidate.counts).every(metricKey => MANUAL_ACTIONABLE_METRICS.has(metricKey)));
  if (!candidates.length) return null;

  const candidate = candidates[0];
  const actions = Object.entries(candidate.counts).flatMap(([metricKey, count]) => {
    const unitPoints = pointImpactForMetric(projection, metricKey);
    if (!unitPoints || count < 1) return [];
    return [freeze({
      metricKey,
      label: ACTION_LABELS[metricKey] || LABELS[metricKey] || metricKey,
      count,
      unitPoints,
      points: unitPoints * count,
    })];
  });
  if (!actions.length) return null;

  return freeze({
    remaining: projection.remaining,
    exact: candidate.exact,
    totalPoints: candidate.totalPoints,
    excessPoints: candidate.excessPoints,
    actions,
    reason: candidate.exact
      ? `Estas acciones suman exactamente los ${projection.remaining} puntos pendientes usando el baremo oficial.`
      : `Esta combinación cubre los ${projection.remaining} puntos pendientes usando el baremo oficial, con ${candidate.excessPoints} punto${candidate.excessPoints === 1 ? "" : "s"} adicional${candidate.excessPoints === 1 ? "" : "es"}.`,
    decisionBoundary: "Es una opción, no una instrucción. Tú decides qué acción tiene sentido hacer.",
  });
}

export const ACTIVITY_POINT_LABELS = LABELS;
