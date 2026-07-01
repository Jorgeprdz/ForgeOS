"use strict";

/**
 * First real Genesis Beta Loop scenario fixture.
 *
 * Scenario:
 * Jorge follows up with Maria after 15 days.
 *
 * Purpose:
 * Prove the loop can turn protected context into voluntary explained action
 * and delivery preparation without sending or creating downstream truth.
 */

function buildJorgeMariaFollowup15DaysFixture() {
  return {
    scenarioId: "JORGE_MARIA_FOLLOWUP_15_DAYS_001",
    actor: {
      managerId: "jorge-palacios",
      displayName: "Jorge",
      role: "manager",
    },
    targetPerson: {
      personId: "maria-prospect",
      displayName: "Maria",
      relationship: "prospect",
    },
    protectedContext: {
      managerId: "jorge-palacios",
      advisorOrManagerName: "Jorge",
      targetPersonName: "Maria",
      relationshipContext: "Previous conversation with pending follow-up.",
      followupContext: "15 days since last conversation.",
      goal: "Retomar conversacion sin presion.",
    },
    nashContext: {
      conversationAngle: "mensaje ligero, humano, sin presion",
      tone: "calido, breve, claro",
      objectionSupport: "si esta ocupada, abrir puerta a retomar despues",
      doNotInventIntent: true,
    },
    mickContext: {
      lastContactDaysAgo: 15,
      consistencySignal: "follow-up pending",
      whyNowSignal: "window may cool if follow-up is delayed",
      noSurveillance: true,
    },
    nbaContext: {
      recommendedAction: "Retomar conversacion con Maria",
      targetPerson: "Maria",
      reasonWhy: "Hay seguimiento pendiente y conviene reabrir la conversacion de forma ligera.",
      whyNow: "Han pasado 15 dias; la ventana puede enfriarse.",
      whyThisPerson: "Maria tiene contexto previo y una conversacion pendiente.",
      whyThisAction: "Un follow-up breve reduce friccion y permite recuperar continuidad.",
      whyThisMessage: "Un mensaje sin presion protege confianza y abre respuesta voluntaria.",
    },
    draftText: "Hola Maria, espero que estes muy bien. Te escribo para retomar nuestra conversacion de hace unos dias, sin presion. Si te parece, podemos verlo con calma esta semana.",
    humanApproval: {
      reviewer: "Jorge",
      action: "APPROVE",
      artifactHash: "fixture-hash-jorge-maria-15-days-v1",
      warningsAcknowledged: true,
      limitationsAcknowledged: true,
      reviewedAt: "2026-07-01T00:00:00.000Z",
    },
    delivery: {
      channel: "whatsapp",
      recipientDestination: "+525500000000",
      manualHandoffOnly: true,
    },
    evidenceRefs: [
      "fixture.relationship.previous-conversation",
      "fixture.followup.15-days",
      "fixture.nash.light-message",
      "fixture.mick.pending-followup",
    ],
    sourceOwners: [
      "manager-provided-context",
      "fixture-source",
    ],
    freshness: "FRESH",
    expected: {
      voluntaryExplainedAction: true,
      humanApprovalRequired: true,
      deliveryCandidateOnly: true,
      sendsMessage: false,
      executesSend: false,
      createsRevenueTruth: false,
      createsCompensationTruth: false,
      createsPayoutTruth: false,
      createsLifecycleTruth: false,
      createsHrTruth: false,
      createsRankingTruth: false,
      createsPunishmentTruth: false,
    },
  };
}

module.exports = {
  buildJorgeMariaFollowup15DaysFixture,
};
