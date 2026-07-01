"use strict";

/**
 * Additional Genesis Beta Loop scenario fixtures.
 *
 * These fixtures prove Forge can represent commercial motivation
 * and goal-oriented follow-up without creating payout, revenue,
 * compensation, lifecycle, ranking, punishment, or HR truth.
 */

function buildAndresJuanBonusProximityFixture() {
  return {
    scenarioId: "ANDRES_JUAN_BONUS_PROXIMITY_001",
    actor: {
      advisorId: "andres",
      displayName: "Andres",
      role: "advisor",
    },
    targetPerson: {
      personId: "juan-prospect",
      displayName: "Juan",
      relationship: "prospect",
    },
    protectedContext: {
      advisorName: "Andres",
      targetPersonName: "Juan",
      goal: "acercarse a bono mediante actividad comercial responsable",
      commercialContext: "Andres could be close to a bonus if candidate commission materializes.",
      boundary: "candidate commission is not payout truth",
    },
    nashContext: {
      conversationAngle: "mensaje claro, consultivo y sin prometer resultado",
      tone: "profesional, breve, seguro",
      objectionSupport: "si Juan pide tiempo, ofrecer revisar dudas sin presion",
      doNotInventIntent: true,
    },
    mickContext: {
      executionSignal: "bonus proximity can support focus",
      consistencySignal: "prioritize a prospect with relative closure signal",
      noSurveillance: true,
      noPunishment: true,
    },
    nbaContext: {
      recommendedAction: "Dar seguimiento a Juan",
      targetPerson: "Juan",
      reasonWhy: "Juan tiene una senal relativa favorable y puede ayudar a Andres a acercarse a su objetivo.",
      whyNow: "La ventana comercial puede enfriarse si no se da seguimiento oportuno.",
      whyThisPerson: "Juan tiene mejor senal relativa que otros prospectos revisados.",
      whyThisAction: "Un seguimiento consultivo puede aclarar dudas y avanzar sin presion.",
      whyThisMessage: "El mensaje debe hablar de revisar dudas, no de urgencia falsa.",
      candidateCommissionContext: {
        amount: 3000,
        currency: "MXN",
        type: "candidate_estimate",
        notGuaranteed: true,
        notPayoutTruth: true,
      },
    },
    draftText: "Hola Juan, espero que estes muy bien. Queria retomar lo que platicamos para revisar tus dudas con calma y ver si esto hace sentido para ti. Sin presion.",
    humanApproval: {
      reviewer: "Andres",
      action: "APPROVE",
      artifactHash: "fixture-hash-andres-juan-v1",
      warningsAcknowledged: true,
      limitationsAcknowledged: true,
    },
    delivery: {
      channel: "whatsapp",
      recipientDestination: "+525511111111",
      manualHandoffOnly: true,
    },
    evidenceRefs: [
      "fixture.andres.bonus-proximity",
      "fixture.juan.relative-signal",
      "fixture.nash.consultative-message",
    ],
    sourceOwners: [
      "advisor-provided-context",
      "fixture-source",
    ],
    freshness: "FRESH",
    expected: {
      candidateCommissionOnly: true,
      notGuaranteed: true,
      notPayoutTruth: true,
      humanApprovalRequired: true,
      deliveryCandidateOnly: true,
      sendsMessage: false,
    },
  };
}

function buildLupitaMariaCarGoalFixture() {
  return {
    scenarioId: "LUPITA_MARIA_CAR_GOAL_001",
    actor: {
      advisorId: "lupita",
      displayName: "Lupita",
      role: "advisor",
    },
    targetPerson: {
      personId: "maria-prospect-lupita",
      displayName: "Maria",
      relationship: "prospect",
    },
    protectedContext: {
      advisorName: "Lupita",
      targetPersonName: "Maria",
      personalGoal: "comprar coche",
      commercialContext: "Lupita wants to move closer to a training allowance through consistent responsible activity.",
      boundary: "training allowance context is motivational context, not guaranteed compensation truth",
    },
    nashContext: {
      conversationAngle: "mensaje seguro, humano y orientado a retomar conversacion",
      tone: "calido, directo, sin presion",
      objectionSupport: "si Maria no puede hablar hoy, proponer otro momento",
      doNotInventIntent: true,
    },
    mickContext: {
      consistencySignal: "goal-linked activity can help Lupita focus",
      whyNowSignal: "Maria has a relative advancement signal",
      noSurveillance: true,
      noPunishment: true,
    },
    nbaContext: {
      recommendedAction: "Llamar o escribir a Maria",
      targetPerson: "Maria",
      reasonWhy: "Maria tiene una senal relativa de avance y puede ser buen siguiente paso.",
      whyNow: "Dar seguimiento hoy mantiene continuidad y apoya la consistencia de Lupita.",
      whyThisPerson: "Maria aparece como oportunidad relativa frente al objetivo de actividad.",
      whyThisAction: "Un contacto breve puede abrir conversacion sin presionar.",
      whyThisMessage: "El mensaje debe ser seguro, simple y humano.",
      goalContext: {
        goal: "comprar coche",
        trainingAllowanceContext: "candidate_motivation_context",
        notGuaranteed: true,
        notCompensationTruth: true,
      },
    },
    draftText: "Hola Maria, espero que estes muy bien. Te escribo para retomar lo que vimos y revisar si tiene sentido avanzar o resolver dudas. Lo vemos con calma.",
    humanApproval: {
      reviewer: "Lupita",
      action: "APPROVE",
      artifactHash: "fixture-hash-lupita-maria-v1",
      warningsAcknowledged: true,
      limitationsAcknowledged: true,
    },
    delivery: {
      channel: "whatsapp",
      recipientDestination: "+525522222222",
      manualHandoffOnly: true,
    },
    evidenceRefs: [
      "fixture.lupita.car-goal",
      "fixture.maria.relative-advancement",
      "fixture.mick.consistency-signal",
    ],
    sourceOwners: [
      "advisor-provided-context",
      "fixture-source",
    ],
    freshness: "FRESH",
    expected: {
      goalMotivationOnly: true,
      notGuaranteed: true,
      notCompensationTruth: true,
      humanApprovalRequired: true,
      deliveryCandidateOnly: true,
      sendsMessage: false,
    },
  };
}

module.exports = {
  buildAndresJuanBonusProximityFixture,
  buildLupitaMariaCarGoalFixture,
};
