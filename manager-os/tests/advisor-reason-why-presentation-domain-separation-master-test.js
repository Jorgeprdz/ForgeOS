import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

import {
  buildClientRecommendationRationaleBoundary,
} from "../../docs/static-preview/quote-preview-live/forge-client-recommendation-rationale-boundary.js";

import {
  buildSalesPresentationBrowserContext,
} from "../../advisor-os/presentation/browser/forge-sales-presentation-browser-context-adapter.js";

import {
  buildSalesPresentationPromptReviewPacket,
} from "../../advisor-os/presentation/browser/forge-sales-presentation-prompt-builder.js";

import {
  buildSalesPresentationSlidePlanReviewPacket,
} from "../../advisor-os/presentation/browser/forge-sales-presentation-slide-plan-generator.js";

const pass = (number, message) =>
  console.log(`PASS ${number} - ${message}`);

const root = process.cwd();
const read = (file) =>
  fs.readFileSync(path.join(root, file), "utf8");

const snapshot = {
  packetType:
    "ACCEPTED_QUOTE_AND_CALCULATION_REVIEW_SNAPSHOT",
  acceptedQuote: {
    source: "TEST_ACCEPTED_QUOTE",
  },
  calculation: {
    product: "TEST_PRODUCT",
    currency: "MXN",
    paymentYears: 10,
  },
  productIntelligence: {
    identity: {
      detected_product_name: "TEST_PRODUCT",
    },
  },
};

const rationale =
  buildClientRecommendationRationaleBoundary({
    clientObjective:
      "Proteger la educación de su hija.",
    documentedNeed:
      "Mantener la meta ante una interrupción del ingreso.",
    solutionFit:
      "La solución aporta protección y ahorro documentados.",
    whyNow:
      "El horizonte de ahorro ya está corriendo.",
    recommendedAction:
      "Revisar y confirmar cifras con el cliente.",
  });

const context =
  buildSalesPresentationBrowserContext({
    snapshot,
    prospectContext: {
      name: "Cliente de prueba",
    },
    advisorNotes:
      "NOTA_INTERNA_NO_VISIBLE_AL_CLIENTE",
    clientObjective:
      "Proteger la educación de su hija.",
    clientRecommendationRationale: rationale,
  });

assert.equal(
  context.clientRecommendationRationale.packetType,
  "CLIENT_RECOMMENDATION_RATIONALE_PACKET",
);
assert.equal(
  context.safety.advisorReasonWhyAllowed,
  false,
);
pass(1, "browser context accepts only client rationale boundary");

for (const forbidden of [
  {
    reasonWhy:
      "Quiero comprar un coche.",
  },
  {
    advisorReasonWhy:
      "Quiero una casa.",
  },
  {
    managerCoachingSignal:
      "Conectar con sus hijos.",
  },
]) {
  assert.throws(
    () =>
      buildSalesPresentationBrowserContext({
        snapshot,
        ...forbidden,
      }),
    /belongs to manager-os/i,
  );
}
pass(2, "browser context rejects Advisor Reason Why inputs");

const prompt =
  buildSalesPresentationPromptReviewPacket({
    contextPacket: context,
  });
assert.equal(prompt.promptGenerated, true);
assert.equal(
  Object.prototype.hasOwnProperty.call(
    prompt.prompt.authoritativePayload,
    "advisorNotes",
  ),
  false,
);
assert.equal(
  JSON.stringify(
    prompt.prompt.authoritativePayload,
  ).includes(
    "NOTA_INTERNA_NO_VISIBLE_AL_CLIENTE",
  ),
  false,
);
pass(3, "advisor notes are excluded from prompt payload");

assert.equal(
  JSON.stringify(
    prompt.prompt.authoritativePayload,
  ).includes("Quiero comprar un coche"),
  false,
);
assert.equal(
  prompt.safety.privateAdvisorMotivationAllowed,
  false,
);
pass(4, "private advisor motivation is absent from prompt");

const slidePlan =
  buildSalesPresentationSlidePlanReviewPacket({
    contextPacket: context,
    promptPacket: prompt,
  });

const serializedSlides =
  JSON.stringify(slidePlan.slides);
assert.equal(
  serializedSlides.includes(
    "NOTA_INTERNA_NO_VISIBLE_AL_CLIENTE",
  ),
  false,
);
assert.equal(
  serializedSlides.includes(
    "Quiero comprar un coche",
  ),
  false,
);
pass(5, "private advisor data is absent from slides");

const fitSlide =
  slidePlan.slides.find(
    (slide) => slide.id === "solution-fit",
  );
assert.ok(fitSlide);
assert.ok(
  fitSlide.facts.some(
    (fact) =>
      fact.sourcePath ===
      "clientRecommendationRationale.rationale.solutionFit",
  ),
);
pass(6, "client solution-fit rationale receives its own slide");

assert.equal(
  slidePlan.slides.some((slide) =>
    slide.facts.some(
      (fact) =>
        fact.sourcePath === "advisorNotes",
    ),
  ),
  false,
);
pass(7, "advisor notes never become slide facts");

for (const file of [
  "manager-os/presentation/quote-to-sales-presentation-context-adapter.js",
  "docs/static-preview/quote-preview-live/forge-sales-presentation-browser-context-adapter.js",
  "docs/static-preview/quote-preview-live/forge-sales-presentation-prompt-builder.js",
  "docs/static-preview/quote-preview-live/forge-sales-presentation-slide-plan-generator.js",
  "docs/static-preview/quote-preview-live/forge-accepted-quote-bridge.js",
]) {
  const source = read(file);
  assert.doesNotMatch(
    source,
    /\binput\.reasonWhy\b/,
  );
  assert.doesNotMatch(
    source,
    /narrativeLogicOwner\s*:\s*["']REASON_WHY["']/,
  );
}
pass(8, "presentation runtime no longer consumes Advisor Reason Why");

const managerReasonWhy = read(
  "manager-os/nba/nba-reason-why-boundary-contract.js",
);
assert.match(
  managerReasonWhy,
  /MANAGER_COACHING_CONTEXT/,
);
assert.match(
  managerReasonWhy,
  /advisorId/,
);
assert.match(
  managerReasonWhy,
  /goalContext/,
);
pass(9, "Advisor Reason Why remains in manager-os");

assert.match(
  managerReasonWhy,
  /reason_why_is_not_coercion/,
);
assert.match(
  managerReasonWhy,
  /human_approval_required_before_action/,
);
pass(10, "manager coaching boundary remains non-coercive");

assert.equal(
  rationale.safety.managerCoachingContextAllowed,
  false,
);
assert.equal(
  rationale.safety.advisorNotesClientVisible,
  false,
);
pass(11, "client rationale boundary rejects manager coaching data");

assert.equal(
  context.authorities.advisorReasonWhyOwner,
  "MANAGER_OS_PRIVATE_NOT_PRESENTATION_INPUT",
);
assert.equal(
  context.authorities.narrativeSource,
  "CLIENT_RECOMMENDATION_RATIONALE_OR_DOCUMENTED_CONTEXT",
);
pass(12, "authority names are explicit and non-ambiguous");

assert.equal(
  slidePlan.safety.advisorNotesClientVisible,
  false,
);
assert.equal(
  slidePlan.safety.privateAdvisorMotivationAllowed,
  false,
);
pass(13, "slide plan carries privacy flags");

assert.equal(Object.isFrozen(rationale), true);
assert.equal(Object.isFrozen(context), true);
assert.equal(Object.isFrozen(prompt), true);
assert.equal(Object.isFrozen(slidePlan), true);
pass(14, "all client presentation packets remain immutable");

console.log(
  "STATUS=PASS_R16H3_ADVISOR_REASON_WHY_PRESENTATION_DOMAIN_SEPARATION_TEST",
);
console.log(
  "Advisor Reason Why Presentation Domain Separation PASS 14/14",
);
