import assert from "node:assert/strict";

import {
  PRESENTATION_ENGINE_ASSEMBLY_PLAN,
  PRESENTATION_ENGINE_OWNERSHIP_REGISTRY,
  PRESENTATION_ENGINE_OWNERSHIP_REQUIRED_FIELDS,
  assertPresentationEngineOwnershipRegistry,
  getPresentationEngineOwnershipById,
  getPresentationEngineOwnershipRegistry,
} from "../presentation/sales-presentation-engine-ownership-registry.js";

const pass = (number, message) => {
  console.log(`PASS ${number} - ${message}`);
};

assert.equal(PRESENTATION_ENGINE_OWNERSHIP_REGISTRY.length, 11);
pass(1, "registry contains exactly 11 engines");

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

assert.equal(assertPresentationEngineOwnershipRegistry(), true);
assert.equal(
  new Set(
    PRESENTATION_ENGINE_OWNERSHIP_REGISTRY.map(
      (record) => record.engine_id,
    ),
  ).size,
  11,
);
assert.equal(
  new Set(
    PRESENTATION_ENGINE_OWNERSHIP_REGISTRY.map(
      (record) => record.runtime_location,
    ),
  ).size,
  11,
);
pass(3, "engine ids and runtime locations are unique");

assert.equal(Object.isFrozen(PRESENTATION_ENGINE_OWNERSHIP_REGISTRY), true);
assert.equal(
  Object.isFrozen(PRESENTATION_ENGINE_OWNERSHIP_REGISTRY[0]),
  true,
);
assert.equal(Object.isFrozen(PRESENTATION_ENGINE_ASSEMBLY_PLAN), true);
pass(4, "registry and assembly plan are deeply immutable");

const serverContext = getPresentationEngineOwnershipById(
  "QUOTE_TO_SALES_PRESENTATION_CONTEXT_ADAPTER",
);
const browserContext = getPresentationEngineOwnershipById(
  "BROWSER_PRESENTATION_CONTEXT_ADAPTER",
);
assert.equal(serverContext.browser_ready, false);
assert.equal(serverContext.server_ready, true);
assert.equal(browserContext.browser_ready, true);
assert.ok(
  serverContext.forbidden_uses.includes(
    "mount directly in static browser preview",
  ),
);
assert.ok(
  browserContext.forbidden_uses.includes(
    "claim server canonical ownership",
  ),
);
pass(5, "server composition and browser projection stay separate");

assert.match(
  serverContext.data_owner,
  /externally-supplied-reason-why/,
);
assert.equal(
  serverContext.forbidden_uses.includes(
    "import or execute Reason Why",
  ),
  true,
);
assert.equal(
  serverContext.forbidden_uses.includes(
    "generate or recalculate Reason Why",
  ),
  true,
);
assert.equal(
  serverContext.forbidden_uses.includes("consume Reason Why"),
  false,
);
pass(6, "Reason Why is external data authority carried but not owned");

const bridge = getPresentationEngineOwnershipById(
  "ACCEPTED_QUOTE_BRIDGE",
);
assert.equal(bridge.truth_ownership, "NO_INDEPENDENT_TRUTH");
assert.equal(
  bridge.assembly_status,
  "PUBLIC_BROWSER_ORCHESTRATOR_REGISTERED",
);
pass(7, "bridge remains orchestration-only");

const packet = getPresentationEngineOwnershipById(
  "PRESENTATION_REVIEW_PACKET_BUILDER",
);
const state = getPresentationEngineOwnershipById(
  "PRESENTATION_REVIEW_STATE_STORE",
);
assert.equal(packet.data_owner, "review-bundle-only");
assert.equal(state.data_owner, "review-session-state");
assert.ok(
  packet.forbidden_uses.includes(
    "retain mutable review session state",
  ),
);
pass(8, "immutable packet and revisioned session ownership are separated");

const approval = getPresentationEngineOwnershipById(
  "PRESENTATION_HUMAN_APPROVAL_GATE",
);
const exportAdapter = getPresentationEngineOwnershipById(
  "PRESENTATION_EXPORT_AUTHORIZATION_AND_PRINT_PDF_ADAPTER",
);
assert.equal(
  approval.truth_ownership,
  "HUMAN_DECISION_AUTHORITY",
);
assert.ok(
  approval.forbidden_uses.includes(
    "authorize export by itself",
  ),
);
assert.ok(
  exportAdapter.forbidden_uses.includes(
    "create approval decision",
  ),
);
pass(9, "human approval and export authorization remain separate");

assert.equal(
  PRESENTATION_ENGINE_ASSEMBLY_PLAN.existing_logical_edges.length,
  9,
);
assert.equal(
  PRESENTATION_ENGINE_ASSEMBLY_PLAN.new_runtime_connections_required
    .length,
  0,
);
pass(10, "existing logical chain is registered without new connections");

for (const record of PRESENTATION_ENGINE_OWNERSHIP_REGISTRY) {
  const forbidden = record.forbidden_uses.join("|").toLowerCase();
  if (
    record.engine_id !==
    "PRESENTATION_EXPORT_AUTHORIZATION_AND_PRINT_PDF_ADAPTER"
  ) {
    assert.doesNotMatch(forbidden, /pptx export implemented/);
  }
}
assert.equal(
  exportAdapter.output_contract,
  "PRINT_PDF authorization and print-safe HTML",
);
assert.ok(exportAdapter.forbidden_uses.includes("PPTX claim"));
assert.ok(exportAdapter.forbidden_uses.includes("send"));
assert.ok(exportAdapter.forbidden_uses.includes("CRM mutation"));
pass(11, "effect boundaries remain Print/PDF-only with send and CRM blocked");

assert.equal(
  getPresentationEngineOwnershipRegistry(),
  PRESENTATION_ENGINE_OWNERSHIP_REGISTRY,
);
assert.equal(
  PRESENTATION_ENGINE_ASSEMBLY_PLAN.runtime_assembly_authorized,
  false,
);
assert.equal(
  PRESENTATION_ENGINE_ASSEMBLY_PLAN.status,
  "PLANNED_EXISTING_WIRING_NO_NEW_CONNECTIONS",
);
assert.equal(
  PRESENTATION_ENGINE_ASSEMBLY_PLAN.next_verification,
  "R16H2_EXISTING_PRESENTATION_ASSEMBLY_CONTRACT_AND_E2E_RELEASE_FAST_TRACK",
);
pass(12, "R16H2 is the only authorized next verification");

console.log(
  "STATUS=PASS_R16H1_PRESENTATION_ENGINE_OWNERSHIP_REGISTRY_TEST",
);
console.log("Presentation Engine Ownership Registry PASS 12/12");
