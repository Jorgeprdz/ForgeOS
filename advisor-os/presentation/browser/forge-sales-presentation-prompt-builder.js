const CONTEXT_PACKET_TYPE =
  "QUOTE_TO_SALES_PRESENTATION_CONTEXT_PACKET";
const PROMPT_PACKET_TYPE =
  "SALES_PRESENTATION_PROMPT_REVIEW_PACKET";

function isRecord(value) {
  return Boolean(
    value &&
      typeof value === "object" &&
      !Array.isArray(value),
  );
}

function deepFreeze(value, seen = new WeakSet()) {
  if (!value || typeof value !== "object" || seen.has(value)) {
    return value;
  }
  seen.add(value);
  for (const item of Object.values(value)) {
    deepFreeze(item, seen);
  }
  return Object.freeze(value);
}

function hash(value) {
  let output = 0x811c9dc5;
  for (let index = 0; index < value.length; index += 1) {
    output ^= value.charCodeAt(index);
    output = Math.imul(output, 0x01000193);
  }
  return (output >>> 0).toString(16).padStart(8, "0");
}

function buildSalesPresentationPromptReviewPacket({
  contextPacket,
} = {}) {
  if (!isRecord(contextPacket)) {
    throw new TypeError(
      "contextPacket must be a plain object",
    );
  }
  if (contextPacket.packetType !== CONTEXT_PACKET_TYPE) {
    throw new TypeError(
      "Unsupported context packet type",
    );
  }
  if (
    contextPacket.safety?.advisorReasonWhyAllowed !== false ||
    contextPacket.safety?.privateAdvisorMotivationAllowed !==
      false
  ) {
    throw new TypeError(
      "contextPacket does not protect advisor privacy",
    );
  }
  if (
    Object.prototype.hasOwnProperty.call(
      contextPacket,
      "reasonWhy",
    )
  ) {
    throw new TypeError(
      "Advisor Reason Why is forbidden in client presentation prompt",
    );
  }

  if (!contextPacket.contextReady) {
    return deepFreeze({
      packetType: PROMPT_PACKET_TYPE,
      reviewOnly: true,
      status: "HOLD_CONTEXT_NOT_READY",
      promptGenerated: false,
      sourceContextId:
        contextPacket.presentationContextId || null,
      missingAuthorities:
        contextPacket.missingAuthorities || [],
      prompt: null,
      safety: {
        slidePlanGenerated: false,
        exportEnabled: false,
        sendable: false,
        humanApprovalRequired: true,
        advisorReasonWhyAllowed: false,
        privateAdvisorMotivationAllowed: false,
        advisorNotesClientVisible: false,
      },
    });
  }

  const authoritativePayload = {
    acceptedQuote: contextPacket.acceptedQuote,
    calculation: contextPacket.calculation,
    productIntelligence:
      contextPacket.productIntelligence,
    prospectContext: contextPacket.prospectContext,
    clientObjective: contextPacket.clientObjective,
    clientRecommendationRationale:
      contextPacket.clientRecommendationRationale,
  };

  const promptText = [
    "Construye una presentación comercial clara y profesional.",
    "",
    "REGLAS",
    "1. Usa únicamente el CONTEXTO AUTORIZADO.",
    "2. No inventes cifras, coberturas, beneficios o escenarios.",
    "3. Conserva moneda, plazos y valores exactamente.",
    "4. Omite datos ausentes.",
    "5. Señala faltantes para revisión humana.",
    "6. No envíes ni exportes.",
    "7. Nunca uses motivaciones personales del asesor, metas del asesor, comisiones, bonos, ranking o coaching del manager.",
    "8. Usa clientRecommendationRationale únicamente para explicar el encaje documentado de la solución con el cliente.",
    "9. advisorNotes es contexto interno y no puede convertirse en texto visible para el cliente.",
    "",
    "CONTEXTO AUTORIZADO",
    JSON.stringify(authoritativePayload, null, 2),
  ].join("\n");

  return deepFreeze({
    packetType: PROMPT_PACKET_TYPE,
    contractVersion: "R16H3_PROMPT_V2",
    promptId:
      `presentation-prompt-${hash(
        `${contextPacket.presentationContextId}|${promptText}`,
      )}`,
    sourceContextId:
      contextPacket.presentationContextId,
    reviewOnly: true,
    status: "REVIEW_READY",
    promptGenerated: true,
    builder: {
      dedicatedPresentationPromptBuilder: true,
      outreachPromptBuilderReused: false,
    },
    prompt: {
      language: "es-MX",
      purpose: "SALES_PRESENTATION_CONSTRUCTION",
      text: promptText,
      authoritativePayload,
    },
    safety: {
      slidePlanGenerated: false,
      exportEnabled: false,
      sendable: false,
      humanApprovalRequired: true,
      advisorReasonWhyAllowed: false,
      privateAdvisorMotivationAllowed: false,
      advisorNotesClientVisible: false,
    },
  });
}

const api = Object.freeze({
  buildSalesPresentationPromptReviewPacket,
});

globalThis.ForgeSalesPresentationPromptBuilder = api;

export {
  PROMPT_PACKET_TYPE,
  buildSalesPresentationPromptReviewPacket,
};
