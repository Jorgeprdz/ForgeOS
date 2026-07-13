import assert from "node:assert/strict";

import {
  QUOTE_TO_SALES_PRESENTATION_CONTEXT_CONTRACT,
  assertQuoteToSalesPresentationContextBoundary,
  buildQuoteToSalesPresentationContext,
} from "../presentation/quote-to-sales-presentation-context-adapter.js";

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

const reasonWhy = {
  source: "TEST_ONLY_REASON_WHY",
  whyNow: "TEST_ONLY_WHY_NOW",
  whyThisPerson: "TEST_ONLY_WHY_THIS_PERSON",
  whyThisAction: "TEST_ONLY_WHY_THIS_ACTION",
};

const input = {
  reviewPacket,
  acceptedQuote,
  productIntelligence,
  reasonWhy,
  prospectContext: {
    name: "Maria",
    goal: "TEST_ONLY_GOAL",
  },
  advisorNotes: "TEST_ONLY_ADVISOR_NOTE",
};

{
  const packet =
    buildQuoteToSalesPresentationContext(input);

  assert.equal(
    packet.packetType,
    "QUOTE_TO_SALES_PRESENTATION_CONTEXT_PACKET",
  );
  assert.equal(
    packet.intentFamily,
    "sales_presentation_prep",
  );
  assert.equal(
    packet.routeFamily,
    "ALFRED_PRODUCT_INTELLIGENCE",
  );
  assert.equal(
    packet.authority.numericTruthOwner,
    "QUOTE_SOURCE_AND_PRODUCT_INTELLIGENCE",
  );
  assert.equal(
    packet.authority.narrativeLogicOwner,
    "REASON_WHY",
  );
  assert.equal(
    packet.authority.finalAuthority,
    "HUMAN",
  );
  assert.equal(
    packet.context.acceptedQuote.fields.annualPremium,
    12345,
  );
  assert.equal(
    packet.context.reasonWhy.whyNow,
    "TEST_ONLY_WHY_NOW",
  );
  assert.equal(
    packet.readiness.readyForPromptReview,
    true,
  );
  assert.deepEqual(
    packet.readiness.missingRequiredAuthorities,
    [],
  );
  assert.equal(
    packet.readiness.readyForSlidePlan,
    false,
  );
  assert.equal(
    packet.readiness.readyForExport,
    false,
  );
  assert.equal(
    packet.promptBuilderContract
      .outreachPromptBuilderReused,
    false,
  );
  assert.equal(
    packet.promptBuilderContract.promptGenerated,
    false,
  );
  assert.equal(
    packet.safety.generatesPrompt,
    false,
  );
  assert.equal(
    packet.safety.generatesSlides,
    false,
  );
  assert.equal(
    packet.safety.exportsPresentation,
    false,
  );
  assert.equal(
    packet.decision,
    "PASS_REVIEW_ONLY_CONTEXT_READY_NO_PROMPT",
  );
  assert.equal(
    assertQuoteToSalesPresentationContextBoundary(
      packet,
    ),
    true,
  );
  assert.equal(Object.isFrozen(packet), true);
  assert.equal(
    Object.isFrozen(packet.context.acceptedQuote),
    true,
  );

  pass(
    "complete authoritative context becomes review-ready without prompt or slides",
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
      advisorNotes: "TEST_ONLY_CHANGED_NOTE",
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
      "reason_why",
    ],
  );
  assert.equal(
    packet.decision,
    "HOLD_REVIEW_ONLY_CONTEXT_INCOMPLETE",
  );
  assert.equal(
    JSON.stringify(packet).includes("12345"),
    false,
  );
  assert.equal(
    assertQuoteToSalesPresentationContextBoundary(
      packet,
    ),
    true,
  );

  pass("missing authorities remain missing without invented data");
}

{
  const wrongIntent =
    buildQuoteToSalesPresentationContext({
      ...input,
      reviewPacket: {
        packetType: "MESSAGE_DRAFT_REVIEW_PACKET",
        sourceCommand: "/Mejora",
        intentFamily: "message_draft",
      },
    });

  assert.equal(
    wrongIntent.readiness
      .presentationIntentConfirmed,
    false,
  );
  assert.equal(
    wrongIntent.readiness.readyForPromptReview,
    false,
  );
  assert.ok(
    wrongIntent.readiness
      .missingRequiredAuthorities
      .includes("presentation_review_packet"),
  );

  pass("message prompt builder cannot masquerade as presentation intent");
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
        acceptedQuote: {
          nested: {
            base64: "FORBIDDEN_TEST_DATA",
          },
        },
      }),
    /raw file or PDF data/,
  );

  pass("raw PDF and binary-like payloads are rejected");
}

{
  assert.equal(
    QUOTE_TO_SALES_PRESENTATION_CONTEXT_CONTRACT
      .outreachPromptBuilderReused,
    false,
  );
  assert.equal(
    QUOTE_TO_SALES_PRESENTATION_CONTEXT_CONTRACT
      .promptGenerated,
    false,
  );
  assert.equal(
    QUOTE_TO_SALES_PRESENTATION_CONTEXT_CONTRACT
      .slidePlanGenerated,
    false,
  );
  assert.equal(
    QUOTE_TO_SALES_PRESENTATION_CONTEXT_CONTRACT
      .exportEnabled,
    false,
  );

  pass("contract remains context-only and review-only");
}

console.log(
  "STATUS=PASS_R16G1_CANONICAL_PRESENTATION_CONTEXT_ADAPTER_TEST",
);
