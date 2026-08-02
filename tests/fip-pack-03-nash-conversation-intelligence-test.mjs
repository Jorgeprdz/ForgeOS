import assert from "node:assert/strict";
import { buildNashConversationPacket } from "../advisor-os/nash/fip-pack-03-nash-conversation-service.js";
import { createContextualMessageInstruction, FipPack03ContractError } from "../platform/nash/fip-pack-03-nash-conversation-contract.js";

const packet = buildNashConversationPacket({
  advisorReference: "advisor:jorge",
  personReference: "person:ana",
  personSummary: "Ana, relación comercial existente.",
  relationshipSummary: "Cotización abierta con seguimiento pendiente.",
  relationshipFoundation: {
    healthState: "COOLING",
    commitments: [{ status: "OVERDUE", summary: "Retomar después del viaje" }],
    objections: [{ type: "LIQUIDITY", summary: "Prefiere revisar liquidez primero" }],
  },
  advisorIntelligence: { preferredTone: "WARM_CONSULTATIVE" },
  mickReview: { pattern: "FOLLOW_UP_DELAY" },
  lastInteractions: ["Cotización enviada", "Cliente pidió retomar después del viaje"],
  evidence: [{ reference: "timeline:event:1", authority: "CRS_08_UNIFIED_PERSON_TIMELINE", summary: "Compromiso observado" }],
});

assert.equal(packet.recommendation.automaticExecutionAllowed, false);
assert.equal(packet.recommendation.humanApprovalRequired, true);
assert.equal(packet.conversation.conversationType, "CLARIFICATION");
assert.equal(packet.messageInstruction.finalDraftAllowed, false);
assert.equal(packet.messageInstruction.sendAllowed, false);
assert.ok(packet.prep.questionsToAsk.length > 0);
assert.throws(() => createContextualMessageInstruction({
  purpose: "Contacto", callToAction: "Responder", sendNow: true,
}), error => error instanceof FipPack03ContractError && error.code === "FIP03_FORBIDDEN_FIELD");

const unknown = buildNashConversationPacket({
  advisorReference: "advisor:jorge",
  personReference: "person:unknown",
  relationshipFoundation: {},
  evidence: [],
});
assert.equal(unknown.recommendation.confidence, "INSUFFICIENT_EVIDENCE");

console.log("FIP_PACK_03_NASH_AND_CONVERSATION_INTELLIGENCE=PASS");
