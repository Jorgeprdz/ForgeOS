import { createFipPack01Foundation } from "../../platform/relationship-intelligence/fip-pack-01-foundation-contract.js";

const clone = value => value === undefined ? undefined : JSON.parse(JSON.stringify(value));

export function buildRelationshipFoundationReadModel(input = {}) {
  const snapshot = clone(input);
  const timeline = Array.isArray(snapshot.timeline) ? snapshot.timeline : [];
  const interactions = timeline
    .filter(item => item && ["ACTIVITY", "MEETING", "MESSAGE", "CALL", "QUOTE", "APPLICATION", "POLICY"].includes(item.type))
    .sort((a, b) => new Date(b.occurredAt || 0) - new Date(a.occurredAt || 0));
  const lastMeaningfulInteractionAt = snapshot.lastMeaningfulInteractionAt || interactions[0]?.occurredAt || null;

  return createFipPack01Foundation({
    advisorReference: snapshot.advisorReference,
    personReference: snapshot.personReference,
    generatedAt: snapshot.generatedAt,
    currentCommercialState: snapshot.currentCommercialState,
    lastMeaningfulInteractionAt,
    sourceAvailability: snapshot.sourceAvailability,
    evidenceDigest: snapshot.evidenceDigest,
    commitments: snapshot.commitments,
    healthState: snapshot.healthState,
    healthReason: snapshot.healthReason,
    healthConfidence: snapshot.healthConfidence,
    healthEvidence: snapshot.healthEvidence,
    objections: snapshot.objections,
    lossRisks: snapshot.lossRisks,
    scoreDimensions: snapshot.scoreDimensions,
    relations: snapshot.relations,
  });
}

export function deriveRelationshipFoundationSignals(input = {}) {
  const now = new Date(input.generatedAt || Date.now());
  const last = input.lastMeaningfulInteractionAt ? new Date(input.lastMeaningfulInteractionAt) : null;
  const daysSinceInteraction = last && !Number.isNaN(last.getTime())
    ? Math.floor((now.getTime() - last.getTime()) / 86400000)
    : null;
  const overdue = Array.isArray(input.commitments)
    ? input.commitments.filter(item => item?.dueAt && !item?.fulfilledAt && new Date(item.dueAt) < now).length
    : 0;

  let healthState = "UNKNOWN";
  let healthReason = "No existe evidencia suficiente para determinar la salud de la relación.";
  let healthConfidence = 0;
  if (overdue > 0) {
    healthState = "WAITING_ON_ADVISOR";
    healthReason = `${overdue} compromiso(s) vencido(s) requieren revisión humana.`;
    healthConfidence = 0.9;
  } else if (daysSinceInteraction !== null && daysSinceInteraction <= 7) {
    healthState = "ACTIVE";
    healthReason = "Existe una interacción significativa reciente.";
    healthConfidence = 0.8;
  } else if (daysSinceInteraction !== null && daysSinceInteraction <= 21) {
    healthState = "COOLING";
    healthReason = "La relación está fuera de la ventana reciente observada.";
    healthConfidence = 0.65;
  } else if (daysSinceInteraction !== null && daysSinceInteraction > 21) {
    healthState = "COLD";
    healthReason = "No existe una interacción significativa reciente.";
    healthConfidence = 0.7;
  }

  return { daysSinceInteraction, overdueCommitments: overdue, healthState, healthReason, healthConfidence };
}
