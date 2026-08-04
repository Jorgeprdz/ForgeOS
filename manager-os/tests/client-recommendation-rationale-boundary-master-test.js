import assert from "node:assert/strict";

import {
  PACKET_TYPE,
  SUBJECT_TYPE,
  buildClientRecommendationRationaleBoundary,
} from "../../docs/static-preview/quote-runtime/forge-client-recommendation-rationale-boundary.js";

const pass = (number, message) =>
  console.log(`PASS ${number} - ${message}`);

const input = {
  clientObjective:
    "Proteger la continuidad educativa de su hija.",
  documentedNeed:
    "Mantener la meta aun si el ingreso se interrumpe.",
  solutionFit:
    "La solución combina protección y ahorro documentados.",
  whyNow:
    "El horizonte de ahorro ya comenzó.",
  recommendedAction:
    "Revisar cifras y confirmar el monto con el cliente.",
  evidenceRefs: ["QUOTE-1", "CLIENT-OBJECTIVE-1"],
  sourceOwners: ["accepted-quote", "human-advisor"],
  freshness: "CURRENT",
};

const packet =
  buildClientRecommendationRationaleBoundary(input);

assert.equal(packet.packetType, PACKET_TYPE);
assert.equal(packet.subjectType, SUBJECT_TYPE);
assert.equal(packet.rationaleReady, true);
pass(1, "builds a client solution-fit rationale packet");

assert.equal(
  packet.rationale.solutionFit,
  input.solutionFit,
);
assert.equal(
  packet.rationale.clientObjective,
  input.clientObjective,
);
pass(2, "preserves supplied client rationale without invention");

assert.equal(
  packet.authorities.factualOwner,
  "QUOTE_SOURCE_AND_PRODUCT_INTELLIGENCE",
);
assert.equal(
  packet.authorities.rationaleOwner,
  "CLIENT_RECOMMENDATION_RATIONALE",
);
assert.equal(packet.authorities.finalAuthority, "HUMAN");
pass(3, "keeps factual and rationale authorities separate");

assert.equal(packet.safety.advisorReasonWhyAllowed, false);
assert.equal(
  packet.safety.managerCoachingContextAllowed,
  false,
);
assert.equal(
  packet.safety.privateAdvisorMotivationAllowed,
  false,
);
pass(4, "blocks private advisor motivation by contract");

for (const forbidden of [
  { reasonWhy: "Quiero comprar un coche." },
  {
    advisorReasonWhy:
      "Quiero darles todo a mis hijos.",
  },
  {
    underlyingMotivation:
      "Quiero comprar una casa.",
  },
  {
    managerCoachingSignal:
      "Conectar actividad con su familia.",
  },
  {
    compensationCandidateContext: {
      commission: 100000,
    },
  },
]) {
  assert.throws(
    () =>
      buildClientRecommendationRationaleBoundary({
        ...input,
        ...forbidden,
      }),
    /private advisor motivation/i,
  );
}
pass(5, "rejects Advisor Reason Why and manager coaching keys");

assert.throws(
  () =>
    buildClientRecommendationRationaleBoundary({
      ...input,
      nested: {
        forecastContext: {
          bonus: 50000,
        },
      },
    }),
  /private advisor motivation/i,
);
pass(6, "rejects nested compensation and forecast context");

const empty =
  buildClientRecommendationRationaleBoundary({});
assert.equal(empty.rationaleReady, false);
assert.equal(
  empty.status,
  "HOLD_MISSING_CLIENT_SOLUTION_FIT",
);
pass(7, "missing rationale remains missing without invention");

assert.equal(packet.safety.createsFinancialTruth, false);
assert.equal(packet.safety.createsProductTruth, false);
assert.equal(packet.safety.sendsMessage, false);
assert.equal(packet.safety.exportsPresentation, false);
assert.equal(packet.safety.writesCrm, false);
pass(8, "creates no financial, product, send, export or CRM truth");

assert.equal(Object.isFrozen(packet), true);
assert.equal(Object.isFrozen(packet.rationale), true);
assert.equal(Object.isFrozen(packet.safety), true);
pass(9, "packet is deeply immutable");

const second =
  buildClientRecommendationRationaleBoundary(input);
assert.equal(
  packet.clientRationaleId,
  second.clientRationaleId,
);
pass(10, "client rationale id is deterministic");

const changed =
  buildClientRecommendationRationaleBoundary({
    ...input,
    whyNow: "Nueva evidencia documentada.",
  });
assert.notEqual(
  packet.clientRationaleId,
  changed.clientRationaleId,
);
pass(11, "client rationale id changes with supplied evidence");

assert.deepEqual(input.evidenceRefs, [
  "QUOTE-1",
  "CLIENT-OBJECTIVE-1",
]);
assert.equal(
  Object.prototype.hasOwnProperty.call(
    input,
    "clientRationaleId",
  ),
  false,
);
pass(12, "input is not mutated");

console.log(
  "STATUS=PASS_R16H3_CLIENT_RECOMMENDATION_RATIONALE_BOUNDARY_TEST",
);
console.log(
  "Client Recommendation Rationale Boundary PASS 12/12",
);
