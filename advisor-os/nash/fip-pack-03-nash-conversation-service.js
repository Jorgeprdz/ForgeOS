import {
  createNashRecommendation,
  createNextBestConversation,
  createConversationPrep,
  createContextualMessageInstruction,
} from "../../platform/nash/fip-pack-03-nash-conversation-contract.js";

export function buildNashConversationPacket(input = {}) {
  const relationship = input.relationshipFoundation || {};
  const advisor = input.advisorIntelligence || {};
  const mick = input.mickReview || {};
  const primaryCommitment = Array.isArray(relationship.commitments) ? relationship.commitments[0] : null;
  const primaryObjection = Array.isArray(relationship.objections) ? relationship.objections[0] : null;
  const evidence = Array.isArray(input.evidence) ? input.evidence : [];
  const insufficient = evidence.length === 0;

  const recommendation = createNashRecommendation({
    advisorReference: input.advisorReference,
    personReference: input.personReference,
    recommendedAction: primaryCommitment?.status === "OVERDUE" ? "Revisar y retomar el compromiso vencido" : "Preparar una conversación de seguimiento",
    whyThisPerson: relationship.healthState === "COOLING" ? "La relación muestra pérdida de momentum." : "Existe contexto comercial abierto que requiere revisión humana.",
    whyThisAction: primaryCommitment ? "Existe un compromiso explícito que da contexto a la acción." : "El seguimiento permite aclarar el siguiente paso sin asumir intención.",
    whyNow: mick.pattern === "FOLLOW_UP_DELAY" ? "El patrón de ejecución observado indica retraso respecto a la cadencia habitual." : "La frescura disponible sugiere revisar la relación ahora.",
    expectedImpact: "Recuperar claridad y acordar un siguiente paso verificable.",
    confidence: insufficient ? "INSUFFICIENT_EVIDENCE" : "MEDIUM",
    limitations: insufficient ? ["No hay evidencia suficiente para una recomendación fuerte."] : [],
    evidence,
    alternatives: ["Esperar hasta el compromiso acordado", "Solicitar información faltante antes de contactar"],
  });

  const conversation = createNextBestConversation({
    conversationType: primaryObjection ? "CLARIFICATION" : "FOLLOW_UP",
    objective: primaryObjection ? "Aclarar la objeción principal y acordar un siguiente paso." : "Retomar contexto y confirmar si la necesidad sigue vigente.",
    openingAngle: primaryCommitment ? "Retomar el compromiso previo con lenguaje respetuoso y específico." : "Reconectar desde el último contexto verificable.",
    questions: primaryObjection ? ["¿Qué parte necesitas revisar antes de decidir?", "¿Qué información falta para avanzar?"] : ["¿Sigue teniendo sentido retomar este tema?"],
    objectionSupport: primaryObjection ? [String(primaryObjection.summary || primaryObjection.type || "Objeción registrada")] : [],
    avoidRepeating: ["No repetir la propuesta completa sin confirmar la objeción activa."],
    desiredNextStep: "Acordar una acción y fecha concretas.",
    confidence: insufficient ? "INSUFFICIENT_EVIDENCE" : "MEDIUM",
  });

  const prep = createConversationPrep({
    personSummary: input.personSummary || "Persona con relación comercial existente.",
    relationshipSummary: input.relationshipSummary || `Estado actual: ${relationship.healthState || "UNKNOWN"}.`,
    lastInteractions: input.lastInteractions || [],
    commitments: (relationship.commitments || []).map(item => item.summary || item.label || item.status),
    objections: (relationship.objections || []).map(item => item.summary || item.type),
    questionsToAsk: conversation.questions,
    risksAndUnknowns: recommendation.limitations,
    sourceFreshness: input.sourceFreshness || null,
  });

  const messageInstruction = createContextualMessageInstruction({
    channel: input.channel || "WHATSAPP",
    purpose: conversation.objective,
    contextToMention: primaryCommitment ? [primaryCommitment.summary || "Compromiso previo"] : ["Último contexto verificable"],
    tone: advisor.preferredTone || "WARM_PROFESSIONAL",
    callToAction: conversation.desiredNextStep,
    prohibitedClaims: ["No prometer resultados", "No inventar intención", "No presionar usando información personal"],
  });

  return Object.freeze({ recommendation, conversation, prep, messageInstruction, readOnly: true });
}
