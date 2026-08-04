import assert from "node:assert/strict";

import {
  QUOTE_TO_SALES_PRESENTATION_CONTEXT_CONTRACT,
  assertQuoteToSalesPresentationContextBoundary,
  buildQuoteToSalesPresentationContext,
} from "../presentation/quote-to-sales-presentation-context-adapter.js";

import {
  buildClientRecommendationRationaleBoundary,
} from "../../docs/static-preview/quote-runtime/forge-client-recommendation-rationale-boundary.js";

function pass(message) {
  console.log(`PASS ${message}`);
}

const reviewPacket = {
  packetId: "TEST_ONLY_REVIEW_PACKET_MARIA",
  packetType: "PRODUCT_INTELLIGENCE_REVIEW_PACKET",
  sourceCommand: "/Presentación",
  normalizedCommand: "/Presentación",
  intentFamily: "sales_presentation_prep",
  routeFamily: "ALFRED_PRODUCT_INTELLIGENCE",
  primaryEntity: "Maria",
  decision: "PASS_REVIEW_ONLY_NO_EXECUTION",
};

const acceptedQuote = {
  source: "TEST_ONLY_ACCEPTED_QUOTE",
  previewResultId: "TEST_ONLY_PREVIEW_RESULT",
  fields: {
    productName: "TEST_ONLY_PRODUCT",
    annualPremium: 12345,
  },
};

const productIntelligence = {
  source: "TEST_ONLY_PRODUCT_INTELLIGENCE",
  confirmedClaims: [
    "TEST_ONLY_CONFIRMED_CLAIM",
  ],
  unknownClaims: [],
};

const clientRecommendationRationale =
  buildClientRecommendationRationaleBoundary({
    clientObjective:
      "TEST_ONLY_CLIENT_OBJECTIVE",
    documentedNeed:
      "TEST_ONLY_DOCUMENTED_NEED",
    solutionFit:
      "TEST_ONLY_SOLUTION_FIT",
    whyNow:
      "TEST_ONLY_CLIENT_WHY_NOW",
    recommendedAction:
      "TEST_ONLY_REVIEW_ACTION",
  });

const input = {
  reviewPacket,
  acceptedQuote,
  productIntelligence,
  clientRecommendationRationale,
  prospectContext: {
    name: "Maria",
    goal: "TEST_ONLY_GOAL",
  },
  advisorNotes:
    "TEST_ONLY_INTERNAL_ADVISOR_NOTE",
};

{
  const packet =
    buildQuoteToSalesPresentationContext(input);

  assert.equal(
    packet.packetType,
    "QUOTE_TO_SALES_PRESENTATION_CONTEXT_PACKET",
  );
  assert.equal(
    packet.authority.numericTruthOwner,
    "QUOTE_SOURCE_AND_PRODUCT_INTELLIGENCE",
  );
  assert.equal(
    packet.authority.narrativeLogicOwner,
    "CLIENT_RECOMMENDATION_RATIONALE_OR_HUMAN_REVIEW",
  );
  assert.equal(
    packet.authority.advisorReasonWhyOwner,
    "MANAGER_OS_PRIVATE_NOT_PRESENTATION_INPUT",
  );
  assert.equal(
    packet.context
      .clientRecommendationRationale
      .rationale.solutionFit,
    "TEST_ONLY_SOLUTION_FIT",
  );
  assert.equal(
    Object.prototype.hasOwnProperty.call(
      packet.context,
      "reasonWhy",
    ),
    false,
  );
  assert.equal(
    packet.safety.privateAdvisorMotivationAllowed,
    false,
  );
  assert.equal(
    packet.safety.advisorNotesClientVisible,
    false,
  );
  assert.equal(
    packet.readiness.readyForPromptReview,
    true,
  );
  assert.equal(
    assertQuoteToSalesPresentationContextBoundary(
      packet,
    ),
    true,
  );
  pass(
    "complete client-authoritative context is review-ready without Advisor Reason Why",
  );
}

{
  for (const forbidden of [
    {
      reasonWhy:
        "El asesor quiere comprar un coche.",
    },
    {
      advisorReasonWhy:
        "El asesor quiere una casa.",
    },
    {
      managerCoachingSignal:
        "Conectar ventas con sus hijos.",
    },
  ]) {
    assert.throws(
      () =>
        buildQuoteToSalesPresentationContext({
          ...input,
          ...forbidden,
        }),
      /belongs to manager-os/i,
    );
  }
  pass(
    "Advisor Reason Why and coaching signals are rejected",
  );
}

{
  const packet =
    buildQuoteToSalesPresentationContext({
      ...input,
      clientRecommendationRationale: null,
    });
  assert.equal(
    packet.readiness.readyForPromptReview,
    true,
  );
  assert.equal(
    packet.readiness
      .clientRecommendationRationaleReady,
    false,
  );
  assert.equal(
    packet.context.clientRecommendationRationale,
    null,
  );
  pass(
    "client rationale is optional and missing context is not invented",
  );
}

{
  const first =
    buildQuoteToSalesPresentationContext(input);
  const second =
    buildQuoteToSalesPresentationContext(input);
  const changed =
    buildQuoteToSalesPresentationContext({
      ...input,
      advisorNotes:
        "TEST_ONLY_CHANGED_INTERNAL_NOTE",
    });
  assert.equal(
    first.presentationContextId,
    second.presentationContextId,
  );
  assert.notEqual(
    first.presentationContextId,
    changed.presentationContextId,
  );
  pass("presentation context id is deterministic");
}

{
  const packet =
    buildQuoteToSalesPresentationContext();
  assert.equal(
    packet.readiness.readyForPromptReview,
    false,
  );
  assert.deepEqual(
    packet.readiness.missingRequiredAuthorities,
    [
      "presentation_review_packet",
      "accepted_quote",
      "product_intelligence",
    ],
  );
  assert.equal(
    packet.decision,
    "HOLD_REVIEW_ONLY_CONTEXT_INCOMPLETE",
  );
  assert.equal(
    assertQuoteToSalesPresentationContextBoundary(
      packet,
    ),
    true,
  );
  pass(
    "required authorities remain missing without invented data",
  );
}

{
  assert.throws(
    () =>
      buildQuoteToSalesPresentationContext({
        ...input,
        acceptedQuote: {
          rawPdf: "FORBIDDEN_TEST_BYTES",
        },
      }),
    /raw file or PDF data/,
  );
  assert.throws(
    () =>
      buildQuoteToSalesPresentationContext({
        ...input,
        prospectContext: {
          underlyingMotivation:
            "PRIVATE_ADVISOR_SIGNAL",
        },
      }),
    /private advisor motivation/,
  );
  pass(
    "raw documents and nested advisor motivation are rejected",
  );
}

{
  assert.equal(
    QUOTE_TO_SALES_PRESENTATION_CONTEXT_CONTRACT
      .advisorReasonWhyAllowed,
    false,
  );
  assert.equal(
    QUOTE_TO_SALES_PRESENTATION_CONTEXT_CONTRACT
      .privateAdvisorMotivationAllowed,
    false,
  );
  assert.equal(
    QUOTE_TO_SALES_PRESENTATION_CONTEXT_CONTRACT
      .advisorNotesClientVisible,
    false,
  );
  assert.equal(
    QUOTE_TO_SALES_PRESENTATION_CONTEXT_CONTRACT
      .outreachPromptBuilderReused,
    false,
  );
  assert.equal(
    QUOTE_TO_SALES_PRESENTATION_CONTEXT_CONTRACT
      .exportEnabled,
    false,
  );
  pass(
    "contract remains client-context-only, private and review-only",
  );
}

console.log(
  "STATUS=PASS_R16G1_CANONICAL_PRESENTATION_CONTEXT_ADAPTER_TEST",
);
console.log(
  "STATUS=PASS_R16H3_CLIENT_PRESENTATION_CONTEXT_DOMAIN_SEPARATION_TEST",
);
