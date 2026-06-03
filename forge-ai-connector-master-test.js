const { buildForgeAiPrompt } = require("./forge-ai-prompt-builder");
const {
  runForgeAiGuardrails,
  findInventedProducts,
  findInventedFinancialValues
} = require("./forge-ai-guardrails-engine");
const { runForgeAiConnector } = require("./forge-ai-connector");

console.log("\nFORGE AI CONNECTOR MASTER TEST v0.1\n");

const originalApiKey = process.env.OPENAI_API_KEY;
delete process.env.OPENAI_API_KEY;

const structuredDecision = {
  prospect: {
    name: "María",
    prospectId: "PROSPECT_MARIA_001"
  },
  personality: {
    personality: "PROTECTOR",
    confidence: 85
  },
  intent: {
    primaryIntent: "REAL_BUDGET_CONSTRAINT",
    confidence: 80
  },
  diagnosis: "La objeción viene de una limitación real de flujo.",
  psychology: {
    psychology: "Validar situación y explorar opciones sin presionar.",
    recommendedStrategy: "Validar flujo y explorar escenarios."
  },
  nextBestAction: {
    action: "ASK_CLARIFYING_QUESTION",
    reason: "Entender si la barrera es flujo temporal o prioridad."
  },
  recommendedStrategy: "Responder con empatía y hacer una pregunta breve."
};

function sameJson(left, right) {
  return JSON.stringify(left) === JSON.stringify(right);
}

function passLine(name, pass) {
  console.log(`${pass ? "PASS" : "FAIL"} ${name}`);
}

async function run() {
  const missingKeyResult = await runForgeAiConnector({
    mode: "OBJECTION_RESPONSE",
    structuredDecision,
    tone: "warm"
  });

  const promptReport = buildForgeAiPrompt({
    mode: "OBJECTION_RESPONSE",
    structuredDecision,
    tone: "warm"
  });

  const inventedProducts = findInventedProducts({
    structuredDecision,
    generatedText: "Podemos resolverlo con Retiro Plus."
  });

  const inventedFinancialValues = findInventedFinancialValues({
    structuredDecision,
    generatedText: "La prima sería de $1,500 MXN y el rendimiento de 8%."
  });

  const guardrailProductBlock = runForgeAiGuardrails({
    mode: "OBJECTION_RESPONSE",
    structuredDecision,
    tone: "warm",
    generatedText: "Te recomiendo Imagina Ser para este caso."
  });

  const dryRunResult = await runForgeAiConnector({
    mode: "OBJECTION_RESPONSE",
    structuredDecision,
    tone: "warm",
    dryRun: true
  });

  const tests = [
    {
      name: "Controlled error without OPENAI_API_KEY",
      pass:
        missingKeyResult.error &&
        missingKeyResult.error.code === "OPENAI_API_KEY_MISSING" &&
        missingKeyResult.aiUsed === false
    },
    {
      name: "Prompt builder does not invent source fields",
      pass:
        promptReport.sourceDecision.prospect.name === "María" &&
        promptReport.sourceDecision.intent.primaryIntent === "REAL_BUDGET_CONSTRAINT" &&
        !Object.prototype.hasOwnProperty.call(promptReport.sourceDecision, "inventedProduct") &&
        !Object.prototype.hasOwnProperty.call(promptReport.sourceDecision, "financialProjection")
    },
    {
      name: "Guardrails block invented products",
      pass:
        inventedProducts.includes("retiro plus") ||
        guardrailProductBlock.errors.some(error => error.code === "INVENTED_PRODUCT_BLOCKED")
    },
    {
      name: "Guardrails block invented financial values",
      pass: inventedFinancialValues.length >= 2
    },
    {
      name: "Connector preserves sourceDecision",
      pass: sameJson(dryRunResult.sourceDecision, structuredDecision)
    },
    {
      name: "Connector supports dryRun without OpenAI",
      pass: dryRunResult.aiUsed === false && !dryRunResult.error
    },
    {
      name: "DryRun returns inspectable prompt",
      pass:
        !!dryRunResult.prompt &&
        dryRunResult.prompt.instructions.includes("Do not make new decisions") &&
        dryRunResult.prompt.input.includes("structuredDecision")
    }
  ];

  console.log("Resultados\n");

  tests.forEach(test => {
    passLine(test.name, test.pass);
  });

  const pass = tests.filter(test => test.pass).length;
  const fail = tests.length - pass;

  console.log("\nResumen:");
  console.log(`Total: ${tests.length}`);
  console.log(`Pass: ${pass}`);
  console.log(`Fail: ${fail}`);

  if (originalApiKey) {
    process.env.OPENAI_API_KEY = originalApiKey;
  }

  if (fail > 0) {
    console.log("\nFORGE AI CONNECTOR v0.1 NEEDS REVIEW");
    process.exit(1);
  }

  console.log("\nFORGE AI CONNECTOR v0.1 PASS");
}

run().catch(error => {
  if (originalApiKey) {
    process.env.OPENAI_API_KEY = originalApiKey;
  }

  console.error(error);
  process.exit(1);
});
