import { createPersonalCoachPacket } from "../../platform/personal-coach/fip-pack-05-personal-coach-contract.js";

const ratio = (numerator, denominator) => denominator > 0 ? numerator / denominator : null;
const confidenceFor = sampleSize => sampleSize >= 20 ? "HIGH" : sampleSize >= 10 ? "MEDIUM" : sampleSize >= 5 ? "LOW" : "INSUFFICIENT_EVIDENCE";

export function buildPersonalCoachPacket({
  advisorReference,
  weekStart,
  intention,
  activitySummary = {},
  relationshipSignals = [],
  advisorProfile = {},
  mickSignals = [],
  nashOutcomes = [],
  journalEntries = [],
  experiments = [],
  previousPlays = [],
  availableMinutes = 0,
  constraints = [],
}) {
  const completedActions = Number(activitySummary.completedActions || 0);
  const plannedActions = Number(activitySummary.plannedActions || 0);
  const followups = Number(activitySummary.followups || 0);
  const appointments = Number(activitySummary.appointments || 0);
  const applications = Number(activitySummary.applications || 0);
  const policies = Number(activitySummary.policies || 0);

  const followupConversion = ratio(appointments, followups);
  const applicationConversion = ratio(policies, applications);

  const priorities = [];
  const overdue = relationshipSignals.filter(signal => signal?.kind === "OVERDUE_COMMITMENT");
  const cooling = relationshipSignals.filter(signal => signal?.kind === "COOLING");
  const idealMarket = advisorProfile?.idealMarketCandidate || null;

  if (overdue.length) priorities.push({
    objective: `Recuperar ${Math.min(overdue.length, 10)} compromisos vencidos`,
    actionTarget: Math.min(overdue.length, 10),
    metric: "FOLLOWUPS_COMPLETED",
    reasonWhy: "Los compromisos vencidos ya tienen contexto y una razón explícita para retomar la conversación.",
    evidenceRefs: overdue.map(item => item.reference).filter(Boolean),
  });
  if (cooling.length) priorities.push({
    objective: `Revisar ${Math.min(cooling.length, 5)} relaciones en enfriamiento`,
    actionTarget: Math.min(cooling.length, 5),
    metric: "RELATIONSHIPS_REACTIVATED",
    reasonWhy: "La pérdida de momentum puede reducirse si existe una acción humana oportuna y contextual.",
    evidenceRefs: cooling.map(item => item.reference).filter(Boolean),
  });
  if (idealMarket) priorities.push({
    objective: `Probar actividad enfocada en ${idealMarket.label || idealMarket.market || "mercado candidato"}`,
    actionTarget: Math.max(5, Number(idealMarket.recommendedSample || 10)),
    metric: "QUALIFIED_CONVERSATIONS",
    reasonWhy: "Advisor Intelligence detectó una señal favorable, pero requiere más muestra antes de promoverla como estrategia estable.",
    evidenceRefs: idealMarket.evidenceRefs || [],
  });

  const radar = [];
  if (followupConversion !== null && followups >= 5) radar.push({
    reference: "radar-followup-conversion",
    observation: `La conversión observada de seguimiento a cita es ${(followupConversion * 100).toFixed(1)}% sobre ${followups} seguimientos.`,
    opportunity: followupConversion < 0.2 ? "Probar una nueva ventana o apertura de seguimiento." : "Aumentar el volumen del seguimiento que ya está generando citas.",
    confidence: confidenceFor(followups),
    recommendedExperiment: followupConversion < 0.2 ? "Comparar seguimiento entre día 3–5 contra la cadencia actual." : "Incrementar 20% el volumen manteniendo mensaje y ventana.",
    evidenceRefs: ["activity-followups", "activity-appointments"],
  });
  if (applicationConversion !== null && applications >= 3) radar.push({
    reference: "radar-application-conversion",
    observation: `La conversión observada de solicitud a póliza es ${(applicationConversion * 100).toFixed(1)}% sobre ${applications} solicitudes.`,
    opportunity: applicationConversion < 0.6 ? "Revisar requisitos, calidad de expediente y seguimiento operativo." : "Documentar la jugada operativa que mantiene la emisión.",
    confidence: confidenceFor(applications),
    recommendedExperiment: "Registrar el punto exacto de cada solicitud que no avanza y comparar causas.",
    evidenceRefs: ["activity-applications", "activity-policies"],
  });

  const normalizedExperiments = experiments.map(item => ({
    reference: item.reference,
    hypothesis: item.hypothesis,
    action: item.action,
    sampleTarget: item.sampleTarget,
    durationDays: item.durationDays,
    metric: item.metric,
    expectedResult: item.expectedResult,
    observedResult: item.observedResult,
    conclusion: item.conclusion,
    status: item.status,
  }));

  const playbook = previousPlays.map(item => ({
    ...item,
    confidence: item.confidence || confidenceFor(Number(item.sampleSize || 0)),
  }));

  const mickSummary = mickSignals.map(signal => signal.summary || signal.observation).filter(Boolean);
  const nashSummary = nashOutcomes.map(outcome => outcome.summary || outcome.result).filter(Boolean);
  const completionRate = ratio(completedActions, plannedActions);

  return createPersonalCoachPacket({
    advisorReference,
    weeklyIntent: {
      weekStart,
      primaryOutcome: intention.primaryOutcome,
      productFocus: intention.productFocus,
      marketFocus: intention.marketFocus,
      availableMinutes,
      constraints,
    },
    weeklyPlan: {
      priorities: priorities.slice(0, 3),
      attentionBudgetRespected: priorities.reduce((total, item) => total + item.actionTarget * 15, 0) <= availableMinutes,
    },
    journal: journalEntries,
    experiments: normalizedExperiments,
    playbook,
    opportunityRadar: radar,
    coaching: {
      whatWorked: completionRate !== null && completionRate >= 0.8 ? ["La ejecución del plan se mantuvo cercana a lo comprometido."] : [],
      whatDidNotWork: completionRate !== null && completionRate < 0.6 ? ["La ejecución quedó por debajo del plan y requiere reducir o reordenar prioridades."] : [],
      repeat: radar.filter(item => item.observation.includes("conversión") && !item.opportunity.startsWith("Probar")).map(item => item.opportunity),
      adjust: mickSummary,
      stop: [],
      nextExperiment: radar[0]?.recommendedExperiment || null,
    },
    weeklyReview: {
      whatHappened: `Se completaron ${completedActions} de ${plannedActions} acciones planeadas.`,
      whatWorked: completionRate === null ? "No hay suficiente información para calcular cumplimiento." : `Cumplimiento observado: ${(completionRate * 100).toFixed(1)}%.`,
      whatDidNotWork: mickSummary.length ? mickSummary.join(" ") : "No existe todavía una señal concluyente de ejecución deficiente.",
      lostOpportunities: overdue.length || cooling.length ? `${overdue.length} compromisos vencidos y ${cooling.length} relaciones en enfriamiento requieren revisión.` : null,
      mickPatterns: mickSummary,
      nashResults: nashSummary,
      lessons: radar.map(item => item.opportunity),
      nextWeekAdjustments: priorities.slice(0, 3).map(item => item.objective),
    },
    evidence: [
      { reference: "activity-summary", summary: "Resumen agregado de actividad del asesor.", sourceOwner: "ACTIVITY_AUTHORITY" },
      { reference: "relationship-signals", summary: "Señales explicables del Pack 01.", sourceOwner: "RELATIONSHIP_INTELLIGENCE" },
      { reference: "advisor-profile", summary: "Perfil dinámico y patrones del Pack 02.", sourceOwner: "ADVISOR_INTELLIGENCE" },
      { reference: "nash-outcomes", summary: "Resultados observados de recomendaciones del Pack 03.", sourceOwner: "NASH_CONTEXT" },
    ],
  });
}
