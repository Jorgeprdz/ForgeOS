import { createOpportunityOperationEnvelope } from "../../platform/opportunity-intelligence/fip-pack-04-opportunity-operation-contract.js";

const byReference = items => new Map((Array.isArray(items) ? items : []).map(item => [item.reference, item]));

export function buildOpportunityOperationEnvelope({
  advisorReference,
  asOf,
  relationshipFoundations = [],
  advisorProfile = {},
  nashPackets = [],
  availableMinutes = 90,
  maxActions = 5,
  declaredEnergy = null,
} = {}) {
  const nashByPerson = byReference(nashPackets.map(packet => ({ ...packet, reference: packet.personReference })));
  const opportunities = [];
  const annualReviews = [];
  const referralMoments = [];
  const priorities = [];
  const forecast = [];
  const scenarios = [];

  for (const foundation of relationshipFoundations) {
    const personReference = foundation.personReference;
    const evidenceRefs = [foundation.contractVersion, ...(foundation.evidenceRefs || [])].filter(Boolean);
    const nash = nashByPerson.get(personReference);
    const commitmentOverdue = foundation.commitments?.some(item => item.status === "OVERDUE");
    const cooling = ["COOLING", "COLD", "AT_RISK"].includes(foundation.health?.state);
    const reviewDue = foundation.annualReviewDue === true;
    const positiveMoment = foundation.positiveMilestone === true;

    if (Array.isArray(foundation.coverageGaps) && foundation.coverageGaps.length > 0) {
      foundation.coverageGaps.forEach((gap, index) => opportunities.push({
        reference: `${personReference}:gap:${index + 1}`,
        type: "PROTECTION_GAP",
        state: gap.observed === true ? "OBSERVED_NEED" : "COMMERCIAL_HYPOTHESIS",
        summary: gap.summary,
        evidenceRefs,
        confidence: gap.confidence || "UNKNOWN",
        requiresDiscovery: true,
      }));
    }

    if (reviewDue) annualReviews.push({
      reference: `${personReference}:annual-review`,
      trigger: foundation.annualReviewTrigger || "POLICY_ANNIVERSARY",
      dueDate: foundation.annualReviewDate || null,
      evidenceRefs,
      status: "PROPOSED",
    });

    if (positiveMoment) referralMoments.push({
      reference: `${personReference}:referral`,
      moment: foundation.positiveMilestoneType || "POSITIVE_RELATIONSHIP_MOMENT",
      reason: foundation.referralReason || "Existe un hito positivo respaldado por evidencia.",
      evidenceRefs,
    });

    const advisorFit = advisorProfile.idealClientReferences?.includes(personReference) ? 90 : 50;
    priorities.push({
      reference: personReference,
      label: foundation.personLabel || personReference,
      components: {
        urgency: commitmentOverdue ? 95 : cooling ? 80 : 40,
        impact: nash?.expectedImpactScore ?? 60,
        risk: cooling ? 85 : 35,
        commitment: commitmentOverdue ? 100 : 30,
        advisorFit,
        evidenceConfidence: foundation.score?.confidence === "HIGH" ? 90 : foundation.score?.confidence === "MEDIUM" ? 70 : 40,
        effortPenalty: nash?.estimatedEffortScore ?? 30,
      },
      whyNow: commitmentOverdue
        ? "Existe un compromiso vencido que requiere revisión humana."
        : cooling
          ? "La relación presenta señales de pérdida de momentum."
          : nash?.whyNow || "La relación puede revisarse según capacidad disponible.",
      evidenceRefs,
    });

    forecast.push({
      outcome: `${personReference}:NEXT_MEANINGFUL_INTERACTION`,
      state: foundation.score?.confidence ? "ESTIMATED" : "UNKNOWN",
      probability: foundation.score?.confidence ? Math.min(0.95, Math.max(0.05, (foundation.score.total || 50) / 100)) : null,
      timingRange: commitmentOverdue ? "0-3_DAYS" : cooling ? "3-10_DAYS" : "7-21_DAYS",
      confidence: foundation.score?.confidence || "UNKNOWN",
      evidenceRefs,
      limitations: ["No garantiza respuesta ni conversión.", "Requiere datos de actividad suficientemente frescos."],
    });

    scenarios.push(
      {
        id: `${personReference}:ACT_NOW`,
        action: nash?.recommendedAction || "REVIEW_RELATIONSHIP",
        assumptions: ["La evidencia actual permanece vigente.", "El asesor confirma capacidad y contexto."],
        estimatedImpact: cooling ? "Puede preservar optionalidad comercial." : "Puede clarificar el siguiente paso.",
        risks: ["La persona puede no responder.", "La recomendación puede cambiar con nueva evidencia."],
        confidence: foundation.score?.confidence || "UNKNOWN",
      },
      {
        id: `${personReference}:WAIT`,
        action: "WAIT_AND_REASSESS",
        assumptions: ["No existe compromiso inmediato que obligue seguimiento."],
        estimatedImpact: cooling ? "Puede aumentar el riesgo de pérdida de momentum." : "Conserva capacidad para casos más urgentes.",
        risks: ["La relación puede enfriarse.", "Puede vencer un compromiso no detectado."],
        confidence: "LOW",
      }
    );
  }

  return createOpportunityOperationEnvelope({
    advisorReference,
    asOf,
    opportunities,
    annualReviews,
    referralMoments,
    priorities,
    attentionBudget: { availableMinutes, maxActions, declaredEnergy, constraints: [] },
    forecast,
    scenarios,
  });
}
