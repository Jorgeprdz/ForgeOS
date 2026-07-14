const CONTEXT_PACKET_TYPE = "QUOTE_TO_SALES_PRESENTATION_CONTEXT_PACKET";
const PROMPT_PACKET_TYPE = "SALES_PRESENTATION_PROMPT_REVIEW_PACKET";

function isRecord(value) {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}

function deepFreeze(value, seen = new WeakSet()) {
  if (!value || typeof value !== "object" || seen.has(value)) return value;
  seen.add(value);
  for (const item of Object.values(value)) deepFreeze(item, seen);
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

function buildSalesPresentationPromptReviewPacket({ contextPacket } = {}) {
  if (!isRecord(contextPacket)) throw new TypeError("contextPacket must be a plain object");
  if (contextPacket.packetType !== CONTEXT_PACKET_TYPE) {
    throw new TypeError("Unsupported context packet type");
  }

  if (!contextPacket.contextReady) {
    return deepFreeze({
      packetType: PROMPT_PACKET_TYPE,
      reviewOnly: true,
      status: "HOLD_CONTEXT_NOT_READY",
      promptGenerated: false,
      sourceContextId: contextPacket.presentationContextId || null,
      missingAuthorities: contextPacket.missingAuthorities || [],
      prompt: null,
      safety: {
        slidePlanGenerated: false,
        exportEnabled: false,
        sendable: false,
        humanApprovalRequired: true,
      },
    });
  }

  const authoritativePayload = {
    acceptedQuote: contextPacket.acceptedQuote,
    calculation: contextPacket.calculation,
    productIntelligence: contextPacket.productIntelligence,
    prospectContext: contextPacket.prospectContext,
    advisorNotes: contextPacket.advisorNotes,
    clientObjective: contextPacket.clientObjective,
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
    "",
    "CONTEXTO AUTORIZADO",
    JSON.stringify(authoritativePayload, null, 2),
  ].join("\n");

  return deepFreeze({
    packetType: PROMPT_PACKET_TYPE,
    contractVersion: "R16G2B3F_PROMPT_V1",
    promptId: `presentation-prompt-${hash(
      `${contextPacket.presentationContextId}|${promptText}`,
    )}`,
    sourceContextId: contextPacket.presentationContextId,
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
    },
  });
}

const api = Object.freeze({ buildSalesPresentationPromptReviewPacket });
globalThis.ForgeSalesPresentationPromptBuilder = api;

export {
  PROMPT_PACKET_TYPE,
  buildSalesPresentationPromptReviewPacket,
};
