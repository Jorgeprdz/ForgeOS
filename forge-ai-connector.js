const { buildForgeAiPrompt } = require("./forge-ai-prompt-builder");
const {
  runForgeAiGuardrails,
  validateGeneratedText
} = require("./forge-ai-guardrails-engine");

const DEFAULT_MODEL = "gpt-5.5";

function clone(value) {
  return JSON.parse(JSON.stringify(value || {}));
}

function buildControlledError({ code, message, sourceDecision, modelUsed, safetyNotes }) {
  return {
    generatedText: null,
    error: {
      code,
      message
    },
    safetyNotes: safetyNotes || [],
    sourceDecision,
    modelUsed,
    aiUsed: false
  };
}

async function runForgeAiConnector(input = {}) {
  const sourceDecision = clone(input.structuredDecision);
  const modelUsed = process.env.FORGE_AI_MODEL || input.model || DEFAULT_MODEL;
  const guardrails = runForgeAiGuardrails(input);
  const prompt = buildForgeAiPrompt(input);

  if (!guardrails.approved) {
    return {
      generatedText: null,
      error: {
        code: "FORGE_AI_GUARDRAILS_BLOCKED",
        message: "Forge AI Connector input failed guardrails.",
        details: guardrails.errors
      },
      safetyNotes: guardrails.safetyNotes,
      sourceDecision,
      modelUsed,
      aiUsed: false
    };
  }

  if (input.dryRun === true) {
    return {
      generatedText: null,
      prompt: {
        instructions: prompt.instructions,
        input: prompt.input
      },
      safetyNotes: prompt.safetyNotes,
      sourceDecision,
      modelUsed,
      aiUsed: false
    };
  }

  if (!process.env.OPENAI_API_KEY) {
    return buildControlledError({
      code: "OPENAI_API_KEY_MISSING",
      message: "OPENAI_API_KEY is required to use Forge AI Connector.",
      sourceDecision,
      modelUsed,
      safetyNotes: prompt.safetyNotes
    });
  }

  let OpenAI;
  try {
    OpenAI = require("openai");
  } catch (error) {
    return buildControlledError({
      code: "OPENAI_SDK_MISSING",
      message: "The official openai SDK is required to use Forge AI Connector.",
      sourceDecision,
      modelUsed,
      safetyNotes: prompt.safetyNotes
    });
  }

  const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
  });

  const response = await client.responses.create({
    model: modelUsed,
    instructions: prompt.instructions,
    input: prompt.input
  });

  const generatedText = response.output_text || "";
  const outputGuardrails = validateGeneratedText({
    structuredDecision: sourceDecision,
    generatedText
  });

  if (outputGuardrails.length) {
    return {
      generatedText: null,
      error: {
        code: "FORGE_AI_OUTPUT_GUARDRAILS_BLOCKED",
        message: "Forge AI Connector blocked generated text after safety validation.",
        details: outputGuardrails
      },
      safetyNotes: prompt.safetyNotes,
      sourceDecision,
      modelUsed,
      aiUsed: true
    };
  }

  return {
    generatedText,
    safetyNotes: prompt.safetyNotes,
    sourceDecision,
    modelUsed,
    aiUsed: true
  };
}

module.exports = {
  runForgeAiConnector,
  DEFAULT_MODEL
};
