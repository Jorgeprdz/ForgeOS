const FINANCIAL_VALUE_PATTERN = /(?:\$|mxn|usd|prima|suma asegurada|rendimiento|porcentaje|retorno|valor financiero|cash value|ave|clp)\s*[\d,.]+|[\d,.]+\s*(?:%|mxn|usd|pesos|dolares)/gi;

const PROTECTED_PRODUCT_NAMES = [
  "imagina ser",
  "vida mujer",
  "segu beca",
  "segubeca",
  "alfa medical",
  "gmm familiar",
  "vida proteccion",
  "vida protección",
  "retirement",
  "retiro plus"
];

function normalizeText(value) {
  return String(value || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function collectSourceText(value) {
  if (value === null || value === undefined) return "";
  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }
  if (Array.isArray(value)) {
    return value.map(collectSourceText).join(" ");
  }
  if (typeof value === "object") {
    return Object.keys(value)
      .map(key => `${key} ${collectSourceText(value[key])}`)
      .join(" ");
  }
  return "";
}

function hasStructuredDecision(input = {}) {
  return !!input.structuredDecision && typeof input.structuredDecision === "object";
}

function validateRequiredInput(input = {}) {
  const errors = [];
  const allowedModes = [
    "FIRST_CONTACT",
    "FOLLOWUP",
    "OBJECTION_RESPONSE",
    "RELATIONSHIP_CHECKIN"
  ];
  const allowedTones = ["warm", "direct", "professional", "casual"];

  if (!allowedModes.includes(input.mode)) {
    errors.push({
      code: "INVALID_MODE",
      message: "Forge AI Connector requires a supported mode."
    });
  }

  if (!allowedTones.includes(input.tone)) {
    errors.push({
      code: "INVALID_TONE",
      message: "Forge AI Connector requires a supported tone."
    });
  }

  if (!hasStructuredDecision(input)) {
    errors.push({
      code: "STRUCTURED_DECISION_REQUIRED",
      message: "structuredDecision is required and must be an object."
    });
  }

  return errors;
}

function findInventedProducts({ structuredDecision = {}, generatedText = "" } = {}) {
  const sourceText = normalizeText(collectSourceText(structuredDecision));
  const candidateText = normalizeText(generatedText);

  if (!candidateText) return [];

  return PROTECTED_PRODUCT_NAMES.filter(productName => {
    const normalizedProduct = normalizeText(productName);
    return candidateText.includes(normalizedProduct) && !sourceText.includes(normalizedProduct);
  });
}

function extractFinancialValues(text = "") {
  return String(text).match(FINANCIAL_VALUE_PATTERN) || [];
}

function findInventedFinancialValues({ structuredDecision = {}, generatedText = "" } = {}) {
  const sourceText = normalizeText(collectSourceText(structuredDecision));
  const values = extractFinancialValues(generatedText);

  return values.filter(value => !sourceText.includes(normalizeText(value)));
}

function validateGeneratedText({ structuredDecision = {}, generatedText = "" } = {}) {
  const errors = [];
  const inventedProducts = findInventedProducts({ structuredDecision, generatedText });
  const inventedFinancialValues = findInventedFinancialValues({
    structuredDecision,
    generatedText
  });

  if (inventedProducts.length) {
    errors.push({
      code: "INVENTED_PRODUCT_BLOCKED",
      message: "Generated text references products not present in the source decision.",
      details: inventedProducts
    });
  }

  if (inventedFinancialValues.length) {
    errors.push({
      code: "INVENTED_FINANCIAL_VALUE_BLOCKED",
      message: "Generated text references financial values not present in the source decision.",
      details: inventedFinancialValues
    });
  }

  return errors;
}

function runForgeAiGuardrails(input = {}) {
  const errors = validateRequiredInput(input);

  if (input.generatedText) {
    errors.push(
      ...validateGeneratedText({
        structuredDecision: input.structuredDecision,
        generatedText: input.generatedText
      })
    );
  }

  return {
    engine: "FORGE_AI_GUARDRAILS_ENGINE",
    version: "0.1",
    approved: errors.length === 0,
    errors,
    protectedFields: ["intent", "diagnosis", "nextBestAction"],
    safetyNotes: [
      "AI may only convert structured decisions into human language.",
      "AI must not create products, financial values, diagnosis, intent, or next best action.",
      "Source decisions remain authoritative."
    ]
  };
}

module.exports = {
  runForgeAiGuardrails,
  validateRequiredInput,
  validateGeneratedText,
  findInventedProducts,
  findInventedFinancialValues,
  collectSourceText
};
