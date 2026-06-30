"use strict";

const {
  STATUS,
  DECISION,
  buildMickManagerContextIntakeBoundary,
} = require("./mick-manager-context-intake-boundary-contract");

const UNSAFE_LANGUAGE_PATTERNS = Object.freeze([
  {
    type: "SURVEILLANCE_LANGUAGE",
    pattern: /(surveillance|vigilancia|vigilar|monitoreo permanente|monitoring|watch every|observar todo|rastreo|tracking permanente|controlar cada)/i,
  },
  {
    type: "SHAME_LANGUAGE",
    pattern: /(shame|vergüenza|flojo|lazy|mediocre|no sirve|irresponsable|qué pena)/i,
  },
  {
    type: "PERSONALITY_JUDGMENT",
    pattern: /(personalidad|personality|diagnóstico|diagnosis|incapaz|not coachable|no es coachable|es flojo|is lazy|es irresponsable|mal asesor)/i,
  },
  {
    type: "PUNISHMENT_LANGUAGE",
    pattern: /(punishment|punish|castigo|castigar|sanción|sancionar|te saco|termination|terminate|despedido|despedir|fuera del equipo)/i,
  },
  {
    type: "HR_DISCIPLINE_LANGUAGE",
    pattern: /(hr|recursos humanos|disciplinary|disciplinario|acta administrativa|sanción laboral|evaluación laboral|labor evaluation)/i,
  },
  {
    type: "PRESSURE_MECHANICS",
    pattern: /(leaderboard|ranking público|public ranking|presión|pressure|amenaza|compare everyone|comparar a todos|tabla pública)/i,
  },
]);

function isPlainObject(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function clone(value) {
  if (value === undefined) return undefined;
  return JSON.parse(JSON.stringify(value));
}

function asArray(value) {
  if (value === undefined || value === null) return [];
  return Array.isArray(value) ? value : [value];
}

function dedupeFindings(findings) {
  const seen = new Set();
  const result = [];

  for (const item of findings) {
    const key = `${item.type}:${item.sample}`;
    if (seen.has(key)) continue;
    seen.add(key);
    result.push(item);
  }

  return result;
}

function collectSamples(input) {
  const raw = isPlainObject(input) ? input : {};

  return [
    ...asArray(raw.languageSamples),
    ...asArray(raw.samples),
    ...asArray(raw.managerLanguage),
    ...asArray(raw.reviewLanguage),
    ...asArray(raw.behaviorLanguage),
    ...asArray(raw.coachingLanguage),
  ]
    .map((sample) => {
      if (typeof sample === "string") return sample;
      if (isPlainObject(sample)) return sample.text || sample.sample || sample.language || sample.label || "";
      return String(sample || "");
    })
    .filter(Boolean);
}

function buildMickManagerNoSurveillanceGuardrailIntake(input = {}, options = {}) {
  const raw = isPlainObject(input) ? clone(input) : {};
  const boundary = buildMickManagerContextIntakeBoundary(raw, options);
  const samples = collectSamples(raw);

  const findings = [];
  samples.forEach((sample) => {
    UNSAFE_LANGUAGE_PATTERNS.forEach((rule) => {
      if (rule.pattern.test(sample)) {
        findings.push({
          type: rule.type,
          sample,
          contextOnly: true,
          requiresHumanReview: true,
        });
      }
    });
  });

  const unsafeLanguageFindings = dedupeFindings(findings);
  const warnings = [...boundary.warnings];

  if (samples.length === 0) {
    warnings.push("MISSING_LANGUAGE_SAMPLES_REMAINS_REVIEW_CONTEXT_NOT_ZERO");
  }

  if (unsafeLanguageFindings.length > 0) {
    warnings.push("UNSAFE_LANGUAGE_REQUIRES_HUMAN_REVIEW");
  }

  let status = boundary.status;
  let decision = boundary.decision;

  if (decision !== DECISION.BLOCK && (samples.length === 0 || unsafeLanguageFindings.length > 0)) {
    status = status === STATUS.UNKNOWN ? STATUS.UNKNOWN : STATUS.REVIEW_REQUIRED;
    decision = DECISION.REVIEW;
  }

  const flags = boundary.flags;

  return {
    type: "MICK_MANAGER_NO_SURVEILLANCE_GUARDRAIL_INTAKE",
    contextOnly: true,
    intakeOnly: true,
    status,
    decision,
    allowed: decision === DECISION.ALLOW,
    blocked: decision === DECISION.BLOCK,
    requiresHumanReview: decision === DECISION.REVIEW,
    samples,
    unsafeLanguageFindings,
    warnings: Array.from(new Set(warnings)),
    missing: boundary.missing,
    evidenceSources: boundary.evidenceSources,
    sourceOwners: boundary.sourceOwners,
    freshness: boundary.freshness,
    autoRewriteAllowed: false,
    autoSendAllowed: false,
    autoTaskAllowed: false,
    autoEscalationAllowed: false,
    flags,
    ...flags,
  };
}

module.exports = {
  STATUS,
  DECISION,
  UNSAFE_LANGUAGE_PATTERNS,
  buildMickManagerNoSurveillanceGuardrailIntake,
};
