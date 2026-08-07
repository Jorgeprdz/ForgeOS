import {
  calculateActivityPoints,
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
