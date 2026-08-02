import assert from "node:assert/strict";
import { createPersonalCoachPacket, FipPack05ContractError } from "../platform/personal-coach/fip-pack-05-personal-coach-contract.js";
import { buildPersonalCoachPacket } from "../advisor-os/personal-coach/fip-pack-05-personal-coach-service.js";

const packet = buildPersonalCoachPacket({
  advisorReference: "advisor-jorge",
  weekStart: "2026-08-03",
  intention: {
    primaryOutcome: "Generar dos solicitudes de Vida y recuperar compromisos vencidos.",
    productFocus: "VIDA",
    marketFocus: "REFERIDOS",
  },
  activitySummary: {
    plannedActions: 20,
    completedActions: 14,
    followups: 10,
    appointments: 3,
    applications: 5,
    policies: 3,
  },
  relationshipSignals: [
    { kind: "OVERDUE_COMMITMENT", reference: "rel-ana" },
    { kind: "OVERDUE_COMMITMENT", reference: "rel-luis" },
    { kind: "COOLING", reference: "rel-maria" },
  ],
  advisorProfile: {
    idealMarketCandidate: {
      label: "Mujeres profesionistas independientes",
      recommendedSample: 10,
      evidenceRefs: ["advisor-segment-01"],
    },
  },
  mickSignals: [{ summary: "Los seguimientos se hicieron fuera de la ventana observada más efectiva." }],
  nashOutcomes: [{ summary: "Dos de tres recomendaciones aceptadas generaron conversación." }],
  journalEntries: [{
    date: "2026-08-02",
    observation: "Me costó pedir referidos después de las entregas.",
    advisorInterpretation: "Necesito una apertura más natural.",
  }],
  experiments: [{
    reference: "exp-referrals-after-delivery",
    hypothesis: "Pedir referidos después de una entrega positiva aumentará conversaciones calificadas.",
    action: "Pedir un referido en cada entrega durante dos semanas.",
    sampleTarget: 10,
    durationDays: 14,
    metric: "QUALIFIED_REFERRALS",
    expectedResult: "Al menos tres referidos calificados.",
    status: "PLANNED",
  }],
  previousPlays: [{
    reference: "play-think-about-it",
    situation: "La persona dice que quiere pensarlo.",
    play: "Aclarar qué criterio necesita revisar antes de decidir.",
    sampleSize: 12,
    advancedCount: 8,
    confidence: "MEDIUM",
    status: "PROMISING",
  }],
  availableMinutes: 360,
  constraints: ["Máximo tres prioridades principales."],
});

assert.equal(packet.contractType, "FORGE_PERSONAL_COACH_PACKET");
assert.equal(packet.weeklyPlan.priorities.length, 3);
assert.equal(packet.weeklyPlan.priorities[0].rank, 1);
assert.equal(packet.journal[0].treatedAsTruth, false);
assert.equal(packet.experiments[0].causalProof, false);
assert.equal(packet.playbook[0].status, "PROMISING");
assert.equal(packet.coaching.comparisonBasis, "ADVISOR_OWN_HISTORY_FIRST");
assert.equal(packet.weeklyReview.nextWeekAdjustments.length, 3);
assert.equal(packet.boundaries.guaranteedGrowth, false);
assert.equal(packet.boundaries.automaticTask, false);
assert.equal(packet.boundaries.personalityTruth, false);
assert.equal(packet.humanApprovalRequired, true);
assert.ok(Object.isFrozen(packet));
assert.ok(Object.isFrozen(packet.weeklyPlan));

const smallSample = createPersonalCoachPacket({
  advisorReference: "advisor-jorge",
  weeklyIntent: {
    weekStart: "2026-08-03",
    primaryOutcome: "Probar una jugada.",
    availableMinutes: 60,
    constraints: [],
  },
  weeklyPlan: { priorities: [], attentionBudgetRespected: true },
  journal: [],
  experiments: [],
  playbook: [{
    reference: "small-play",
    situation: "Seguimiento",
    play: "Mensaje corto",
    sampleSize: 3,
    advancedCount: 3,
    confidence: "HIGH",
    status: "SUPPORTED",
  }],
  opportunityRadar: [],
  coaching: {},
  weeklyReview: {
    whatHappened: "Muestra pequeña.",
    whatWorked: "No concluyente.",
    whatDidNotWork: "No concluyente.",
    mickPatterns: [],
    nashResults: [],
    lessons: [],
    nextWeekAdjustments: [],
  },
  evidence: [],
});
assert.equal(smallSample.playbook[0].confidence, "INSUFFICIENT_EVIDENCE");
assert.equal(smallSample.playbook[0].status, "CANDIDATE");

assert.throws(() => createPersonalCoachPacket({
  advisorReference: "advisor-jorge",
  personalityTruth: "avoidant",
}), error => error instanceof FipPack05ContractError && error.code === "FIP05_FORBIDDEN_FIELD");

console.log("FIP_PACK_05_PERSONAL_COACH=PASS");
