const { runForgeAiGuardrails } = require("./forge-ai-guardrails-engine");

function clone(value) {
  return JSON.parse(JSON.stringify(value || {}));
}

function buildForgeAiPrompt(input = {}) {
  const sourceDecision = clone(input.structuredDecision);
  const guardrails = runForgeAiGuardrails(input);

  const instructions = [
    "You are Forge AI Connector v0.1.",
    "Your only job is to convert an existing structured Forge OS decision into human language.",
    "Do not make new decisions.",
    "Do not change intent, diagnosis, psychology, nextBestAction, nextAction, or recommendedStrategy.",
    "Do not invent products, policy details, financial values, projections, rates, premiums, coverage amounts, dates, or relationship facts.",
    "Use only the structuredDecision fields provided by Forge OS.",
    "If the source decision does not contain enough detail, write a shorter message instead of adding facts.",
    "Return only the advisor-facing text. Do not include JSON."
  ].join("\n");

  const inputPayload = {
    mode: input.mode,
    tone: input.tone,
    structuredDecision: sourceDecision,
    task: "Draft human language based only on this structured decision."
  };

  return {
    engine: "FORGE_AI_PROMPT_BUILDER",
    version: "0.1",
    instructions,
    input: JSON.stringify(inputPayload, null, 2),
    sourceDecision,
    safetyNotes: guardrails.safetyNotes,
    guardrails
  };
}

module.exports = {
  buildForgeAiPrompt
};
