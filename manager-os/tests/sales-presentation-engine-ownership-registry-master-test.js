import assert from "node:assert/strict";

import {
  PRESENTATION_ENGINE_ASSEMBLY_PLAN,
  PRESENTATION_ENGINE_OWNERSHIP_REGISTRY,
  PRESENTATION_ENGINE_OWNERSHIP_REQUIRED_FIELDS,
  assertPresentationEngineOwnershipRegistry,
  getPresentationEngineOwnershipById,
  getPresentationEngineOwnershipRegistry,
} from "../presentation/sales-presentation-engine-ownership-registry.js";

const pass = (number, message) =>
  console.log(`PASS ${number} - ${message}`);

assert.equal(
  PRESENTATION_ENGINE_OWNERSHIP_REGISTRY.length,
  12,
);
pass(1, "registry contains exactly 12 engines");

assert.equal(
  PRESENTATION_ENGINE_OWNERSHIP_REQUIRED_FIELDS.length,
  15,
);
for (const record of PRESENTATION_ENGINE_OWNERSHIP_REGISTRY) {
  for (const field of PRESENTATION_ENGINE_OWNERSHIP_REQUIRED_FIELDS) {
    assert.ok(field in record);
  }
}
pass(2, "all 15 ownership fields are complete");

assert.equal(
  assertPresentationEngineOwnershipRegistry(),
  true,
);
assert.equal(
  new Set(
    PRESENTATION_ENGINE_OWNERSHIP_REGISTRY.map(
      (record) => record.engine_id,
    ),
  ).size,
  12,
);
pass(3, "engine ids and runtime locations are unique");

assert.equal(
  Object.isFrozen(
    PRESENTATION_ENGINE_OWNERSHIP_REGISTRY,
  ),
  true,
);
assert.equal(
  Object.isFrozen(PRESENTATION_ENGINE_ASSEMBLY_PLAN),
  true,
);
pass(4, "registry and assembly plan are immutable");

const serverContext =
  getPresentationEngineOwnershipById(
    "QUOTE_TO_SALES_PRESENTATION_CONTEXT_ADAPTER",
  );
const browserContext =
  getPresentationEngineOwnershipById(
    "BROWSER_PRESENTATION_CONTEXT_ADAPTER",
  );

assert.equal(serverContext.browser_ready, false);
assert.equal(serverContext.server_ready, true);
assert.equal(browserContext.browser_ready, true);
pass(5, "server composition and browser projection stay separate");

assert.doesNotMatch(
  serverContext.data_owner,
  /reason-why/i,
);
assert.match(
  serverContext.data_owner,
  /client-recommendation-rationale/,
);
assert.equal(
  serverContext.forbidden_uses.includes(
    "consume Advisor Reason Why",
  ),
  true,
);
assert.equal(
  serverContext.forbidden_uses.includes(
    "consume manager coaching context",
  ),
  true,
);
pass(6, "presentation context rejects Advisor Reason Why");

const clientRationale =
  getPresentationEngineOwnershipById(
    "CLIENT_RECOMMENDATION_RATIONALE_BOUNDARY",
  );
assert.equal(
  clientRationale.data_owner,
  "client-solution-fit-rationale-only",
);
assert.equal(
  clientRationale.truth_ownership,
  "NO_NEW_FACTS_VALIDATED_CLIENT_RATIONALE",
);
assert.equal(clientRationale.browser_ready, true);
assert.equal(clientRationale.server_ready, true);
pass(7, "client rationale owns only client solution fit");

for (const forbidden of [
  "consume Advisor Reason Why",
  "consume manager coaching context",
  "consume compensation or forecast context",
  "expose advisor notes",
]) {
  assert.equal(
    clientRationale.forbidden_uses.includes(forbidden),
    true,
  );
}
pass(8, "client rationale blocks private advisor domains");

const bridge =
  getPresentationEngineOwnershipById(
    "ACCEPTED_QUOTE_BRIDGE",
  );
assert.equal(
  bridge.truth_ownership,
  "NO_INDEPENDENT_TRUTH",
);
pass(9, "bridge remains orchestration-only");

const packet =
  getPresentationEngineOwnershipById(
    "PRESENTATION_REVIEW_PACKET_BUILDER",
  );
const state =
  getPresentationEngineOwnershipById(
    "PRESENTATION_REVIEW_STATE_STORE",
  );
assert.equal(packet.data_owner, "review-bundle-only");
assert.equal(state.data_owner, "review-session-state");
pass(10, "review packet and review session remain separate");

const approval =
  getPresentationEngineOwnershipById(
    "PRESENTATION_HUMAN_APPROVAL_GATE",
  );
const exportAdapter =
  getPresentationEngineOwnershipById(
    "PRESENTATION_EXPORT_AUTHORIZATION_AND_PRINT_PDF_ADAPTER",
  );
assert.equal(
  approval.truth_ownership,
  "HUMAN_DECISION_AUTHORITY",
);
assert.equal(
  exportAdapter.output_contract,
  "PRINT_PDF authorization and print-safe HTML",
);
pass(11, "approval and export authorization remain separate");

assert.equal(
  PRESENTATION_ENGINE_ASSEMBLY_PLAN
    .existing_logical_edges.length,
  10,
);
assert.equal(
  PRESENTATION_ENGINE_ASSEMBLY_PLAN
    .protected_decisions.length,
  4,
);
assert.equal(
  PRESENTATION_ENGINE_ASSEMBLY_PLAN
    .new_runtime_connections_required.length,
  0,
);
pass(12, "ten edges and four domain decisions are registered");

const decisions =
  PRESENTATION_ENGINE_ASSEMBLY_PLAN
    .protected_decisions
    .map((entry) => entry.decision)
    .join("\n");
assert.match(
  decisions,
  /Advisor Reason Why remains private manager-os coaching signal/i,
);
pass(13, "Advisor Reason Why privacy decision is explicit");

assert.equal(
  getPresentationEngineOwnershipRegistry(),
  PRESENTATION_ENGINE_OWNERSHIP_REGISTRY,
);
assert.equal(
  PRESENTATION_ENGINE_ASSEMBLY_PLAN
    .runtime_assembly_authorized,
  false,
);
assert.equal(
  PRESENTATION_ENGINE_ASSEMBLY_PLAN
    .next_verification,
  "R16J2_ADVISOR_OS_PRESENTATION_RUNTIME_RECONCILIATION",
);
pass(14, "R16J2 is the authorized reconciliation");

console.log(
  "STATUS=PASS_R16H1_PRESENTATION_ENGINE_OWNERSHIP_REGISTRY_TEST",
);
console.log(
  "STATUS=PASS_R16H3_PRESENTATION_ENGINE_OWNERSHIP_REGISTRY_TEST",
);
console.log(
  "Presentation Engine Ownership Registry PASS 14/14",
);
