const { buildProspectContext } = require("./nash-prospect-context-builder");
const { runCouncil } = require("./nash-council-orchestrator");
const { buildMessageRecommendation } = require("./nash-message-recommendation-engine");
const { detectPersonality } = require("./nash-personality-engine");
const { buildNashFollowup } = require("./nash-followup-engine");
const { buildNextBestAction } = require("./nash-next-best-action-engine");
const { detectNashIntent } = require("./nash-intent-engine");

function runNash(input = {}) {
  const context = buildProspectContext(input);
  const intent = input.intent || detectNashIntent({
    rawText:
      input.rawText ||
      input.responseText ||
      input.prospectResponse ||
      input.message ||
      ""
  });
  const detectedObjectionIntent =
    intent.primaryIntent && intent.primaryIntent !== "UNKNOWN"
      ? intent.primaryIntent
      : null;

  const personality = detectPersonality({
    ...context,
    notes: input.notes || []
  });

  const council = runCouncil(context);

  const recommendation = buildMessageRecommendation({
    context,
    council,
    personality
  });

  const followup = buildNashFollowup({
    context,
    personality
  });

  const nextBestAction = buildNextBestAction({
    responseStatus: input.responseStatus || "NEW",
    daysSinceContact: input.daysSinceContact || 0,
    objectionType: input.objectionType || null,
    objectionIntent: input.objectionIntent || detectedObjectionIntent,
    intent,
    interestLevel: input.interestLevel || "UNKNOWN",
    relationshipEvent: input.relationshipEvent || null,
    personality: personality.personality
  });

  return {
    engine: "NASH",
    version: "0.1",
    objective:
      "Aumentar probabilidad de conversación, cita y venta.",
    context,
    intent,
    personality,
    council,
    recommendation,
    followup,
    nextBestAction
  };
}

module.exports = {
  runNash
};
