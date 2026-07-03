export const genesisBetaLoopCards = [
  {
    cardId: "genesis-beta-loop-card-JORGE_MARIA_FOLLOWUP_15_DAYS_001",
    scenarioId: "JORGE_MARIA_FOLLOWUP_15_DAYS_001",
    title: "Revisión de seguimiento Jorge / Maria",
    subtitle: "contexto relacional, no aprobación de envío",
    statusLabel: "READY_FOR_HUMAN_REVIEW_PACKET",
    decisionLabel: "PRESENT_TO_HUMAN_FOR_REVIEW_ONLY",
    safetyBadge: "READY_FOR_HUMAN_REVIEW",
    draftQualityBadge: "DRAFT_READY_FOR_HUMAN_REVIEW",
    approvalBadge: "NOT_APPROVED",
    boundaryBadge: "REVIEW_ONLY_NOT_SENDABLE",
    evidenceRefs: [
      "conversación relacional previa",
      "seguimiento 15 días",
      "mensaje ligero Nash",
      "seguimiento Mick pendiente"
    ],
    sourceOwners: ["manager-provided-context", "fixture-source"],
    freshness: "FRESH",
    reasoningSummary: "Jorge tiene contexto de seguimiento relacional pendiente. La tarjeta ayuda al humano a revisar si una reconexión ligera y respetuosa es apropiada.",
    uncertaintySummary: "La entrega permanece bloqueada porque aún se requiere revisor humano real y aprobación explícita.",
    missingContext: ["reviewer_required"],
    candidateDraftPreview: "Hola Maria, espero que estes muy bien. Queria retomar nuestra conversacion con calma y saber si te gustaria que lo revisemos juntos esta semana.",
    humanReviewQuestions: [
      "¿Qué evidencia sostiene este seguimiento?",
      "¿Qué contexto falta?",
      "¿Este mensaje podría crear presión o dependencia?"
    ],
    approvalPrerequisites: [
      "real_human_reviewer_required",
      "exact_artifact_review_required",
      "explicit_human_approval_gate_required",
      "delivery_preparation_remains_locked_until_approval"
    ],
    blockedReason: ["APPROVED_FOR_DELIVERY_PREPARATION_REQUIRED", "reviewer_required"]
  },
  {
    cardId: "genesis-beta-loop-card-ANDRES_JUAN_BONUS_PROXIMITY_001",
    scenarioId: "ANDRES_JUAN_BONUS_PROXIMITY_001",
    title: "Revisión de cercanía a bono Andres / Juan",
    subtitle: "contexto motivacional / estimación candidata, no es cálculo final de pago",
    statusLabel: "READY_FOR_HUMAN_REVIEW_PACKET",
    decisionLabel: "PRESENT_TO_HUMAN_FOR_REVIEW_ONLY",
    safetyBadge: "READY_FOR_HUMAN_REVIEW",
    draftQualityBadge: "DRAFT_READY_FOR_HUMAN_REVIEW",
    approvalBadge: "NOT_APPROVED",
    boundaryBadge: "REVIEW_ONLY_NOT_SENDABLE",
    evidenceRefs: [
      "cercanía a bono",
      "señal relativa de Juan",
      "mensaje consultivo"
    ],
    sourceOwners: ["advisor-provided-context", "fixture-source"],
    freshness: "FRESH",
    reasoningSummary: "La cercanía a bono se muestra solo como contexto motivacional para revisión humana, no como cálculo final de pago ni certeza de compensación.",
    uncertaintySummary: "La entrega permanece bloqueada porque aún se requiere revisor humano real y aprobación explícita.",
    missingContext: ["reviewer_required"],
    candidateDraftPreview: "Juan, vi que hay una oportunidad que podria valer la pena revisar con calma. Si te hace sentido, podemos ver juntos que falta y decidir el siguiente paso.",
    humanReviewQuestions: [
      "¿La cercanía a bono se usa solo como contexto?",
      "¿Esto podría sonar como certeza de pago?",
      "¿Qué debe verificar el humano antes de aprobar?"
    ],
    approvalPrerequisites: [
      "real_human_reviewer_required",
      "exact_artifact_review_required",
      "explicit_human_approval_gate_required",
      "delivery_preparation_remains_locked_until_approval"
    ],
    blockedReason: ["APPROVED_FOR_DELIVERY_PREPARATION_REQUIRED", "reviewer_required"]
  },
  {
    cardId: "genesis-beta-loop-card-LUPITA_MARIA_CAR_GOAL_001",
    scenarioId: "LUPITA_MARIA_CAR_GOAL_001",
    title: "Revisión de meta de coche Lupita / Maria",
    subtitle: "contexto motivacional, no verdad de compensación",
    statusLabel: "READY_FOR_HUMAN_REVIEW_PACKET",
    decisionLabel: "PRESENT_TO_HUMAN_FOR_REVIEW_ONLY",
    safetyBadge: "READY_FOR_HUMAN_REVIEW",
    draftQualityBadge: "DRAFT_READY_FOR_HUMAN_REVIEW",
    approvalBadge: "NOT_APPROVED",
    boundaryBadge: "REVIEW_ONLY_NOT_SENDABLE",
    evidenceRefs: [
      "meta de coche",
      "avance relativo de Maria",
      "señal de consistencia Mick"
    ],
    sourceOwners: ["advisor-provided-context", "fixture-source"],
    freshness: "FRESH",
    reasoningSummary: "La meta de coche se trata como contexto motivacional para revisión, no como verdad de compensación ni resultado garantizado.",
    uncertaintySummary: "La entrega permanece bloqueada porque aún se requiere revisor humano real y aprobación explícita.",
    missingContext: ["reviewer_required"],
    candidateDraftPreview: "Maria, me acorde de la meta del coche y pense que puede servir como referencia para ordenar el siguiente paso. Si quieres, lo revisamos con calma.",
    humanReviewQuestions: [
      "¿Esto respeta la agencia de Maria?",
      "¿La meta se usa como motivación y no como presión?",
      "¿Qué debe aprender el asesor de este caso?"
    ],
    approvalPrerequisites: [
      "real_human_reviewer_required",
      "exact_artifact_review_required",
      "explicit_human_approval_gate_required",
      "delivery_preparation_remains_locked_until_approval"
    ],
    blockedReason: ["APPROVED_FOR_DELIVERY_PREPARATION_REQUIRED", "reviewer_required"]
  }
];
