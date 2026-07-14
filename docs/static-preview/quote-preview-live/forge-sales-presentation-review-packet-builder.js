const CONTEXT_PACKET_TYPE = "QUOTE_TO_SALES_PRESENTATION_CONTEXT_PACKET";
const PROMPT_PACKET_TYPE = "SALES_PRESENTATION_PROMPT_REVIEW_PACKET";
const SLIDE_PLAN_PACKET_TYPE = "SALES_PRESENTATION_SLIDE_PLAN_REVIEW_PACKET";
const REVIEW_PACKET_TYPE = "SALES_PRESENTATION_REVIEW_PACKET";

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

function buildSalesPresentationReviewPacket({
  contextPacket,
  promptPacket,
  slidePlanPacket,
} = {}) {
  if (!isRecord(contextPacket) || contextPacket.packetType !== CONTEXT_PACKET_TYPE) {
    throw new TypeError("Unsupported context packet");
  }
  if (!isRecord(promptPacket) || promptPacket.packetType !== PROMPT_PACKET_TYPE) {
    throw new TypeError("Unsupported prompt packet");
  }
  if (!isRecord(slidePlanPacket) ||
      slidePlanPacket.packetType !== SLIDE_PLAN_PACKET_TYPE) {
    throw new TypeError("Unsupported slide plan packet");
  }

  const complete = contextPacket.contextReady === true &&
    promptPacket.promptGenerated === true &&
    slidePlanPacket.slidePlanGenerated === true;

  return deepFreeze({
    packetType: REVIEW_PACKET_TYPE,
    contractVersion: "R16G2B3F_REVIEW_V1",
    reviewId: `presentation-review-${hash([
      contextPacket.presentationContextId,
      promptPacket.promptId || "",
      slidePlanPacket.slidePlanId || "",
    ].join("|"))}`,
    reviewOnly: true,
    status: complete
      ? "PENDING_HUMAN_REVIEW"
      : "HOLD_INCOMPLETE_PRESENTATION_ARTIFACTS",
    artifactsReadyForReview: complete,
    artifacts: {
      context: contextPacket,
      prompt: promptPacket,
      slidePlan: slidePlanPacket,
    },
    approval: {
      required: true,
      humanApproved: false,
      approvedBy: null,
      approvedAt: null,
    },
    authorization: {
      previewAllowed: complete,
      editAllowed: complete,
      exportAuthorized: false,
      sendAuthorized: false,
      crmMutationAllowed: false,
      quoteMutationAllowed: false,
    },
    forbiddenActions: [
      "EXPORT_WITHOUT_APPROVAL",
      "SEND_WITHOUT_APPROVAL",
      "ALTER_QUOTE_VALUES",
      "INVENT_MISSING_FACTS",
    ],
  });
}

const api = Object.freeze({ buildSalesPresentationReviewPacket });
globalThis.ForgeSalesPresentationReviewPacketBuilder = api;

export {
  REVIEW_PACKET_TYPE,
  buildSalesPresentationReviewPacket,
};
