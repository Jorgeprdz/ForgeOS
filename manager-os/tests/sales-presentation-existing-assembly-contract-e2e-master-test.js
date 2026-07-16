import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

import {
  PRESENTATION_ENGINE_ASSEMBLY_PLAN,
  PRESENTATION_ENGINE_OWNERSHIP_REGISTRY,
  assertPresentationEngineOwnershipRegistry,
  getPresentationEngineOwnershipById,
} from "../presentation/sales-presentation-engine-ownership-registry.js";

const root = process.cwd();
const read = (relativePath) =>
  fs.readFileSync(path.join(root, relativePath), "utf8");
const exists = (relativePath) =>
  fs.existsSync(path.join(root, relativePath));
const pass = (number, message) =>
  console.log(`PASS ${number} - ${message}`);

function owner(engineId) {
  const record = getPresentationEngineOwnershipById(engineId);
  assert.ok(record, `Missing ownership record: ${engineId}`);
  return record;
}

assert.equal(assertPresentationEngineOwnershipRegistry(), true);
assert.equal(
  PRESENTATION_ENGINE_OWNERSHIP_REGISTRY.length,
  12,
);
pass(1, "ownership registry is valid and contains 12 engines");

for (const record of PRESENTATION_ENGINE_OWNERSHIP_REGISTRY) {
  assert.equal(
    exists(record.runtime_location),
    true,
    `Missing runtime location: ${record.runtime_location}`,
  );
}
pass(2, "all registered runtime locations exist");

assert.deepEqual(
  PRESENTATION_ENGINE_ASSEMBLY_PLAN
    .new_runtime_connections_required,
  [],
);
assert.equal(
  PRESENTATION_ENGINE_ASSEMBLY_PLAN
    .runtime_assembly_authorized,
  false,
);
assert.equal(
  PRESENTATION_ENGINE_ASSEMBLY_PLAN.status,
  "VERIFIED_WIRING_WITH_CLIENT_RATIONALE_DOMAIN_BOUNDARY",
);
pass(3, "assembly preserves existing wiring and requires no new connections");

const bridgeOwner = owner("ACCEPTED_QUOTE_BRIDGE");
const bridge = read(bridgeOwner.runtime_location);
for (const api of [
  "buildClientRecommendationRationaleReviewBoundary",
  "startSalesPresentationReviewSession",
  "getCurrentSalesPresentationReviewState",
  "updateSalesPresentationReviewSlide",
  "approveCurrentSalesPresentationReview",
  "revokeCurrentSalesPresentationApproval",
  "authorizeCurrentSalesPresentationExport",
  "exportCurrentSalesPresentationToPrintPdf",
]) {
  assert.match(
    bridge,
    new RegExp(`\\b${api}\\b`),
    `Bridge source is missing ${api}`,
  );
}
pass(4, "bridge exposes client rationale and the complete review lifecycle");

const expectedChain = [
  "CLIENT_RECOMMENDATION_RATIONALE_BOUNDARY",
  "ACCEPTED_QUOTE_REVIEW_SNAPSHOT_BOUNDARY",
  "BROWSER_PRESENTATION_CONTEXT_ADAPTER",
  "DEDICATED_PRESENTATION_PROMPT_BUILDER",
  "SLIDE_PLAN_GENERATOR",
  "PRESENTATION_REVIEW_PACKET_BUILDER",
  "PRESENTATION_REVIEW_STATE_STORE",
  "EDITABLE_PRESENTATION_PREVIEW_AND_DYNAMIC_UI",
  "PRESENTATION_HUMAN_APPROVAL_GATE",
  "PRESENTATION_EXPORT_AUTHORIZATION_AND_PRINT_PDF_ADAPTER",
];
for (const engineId of expectedChain) {
  assert.ok(owner(engineId));
}
assert.equal(
  PRESENTATION_ENGINE_ASSEMBLY_PLAN
    .existing_logical_edges.length,
  10,
);
pass(5, "client rationale and ten logical edges are registered");

const browserRuntimeFiles =
  PRESENTATION_ENGINE_OWNERSHIP_REGISTRY
    .filter((record) => record.browser_ready)
    .map((record) => record.runtime_location);

for (const file of browserRuntimeFiles) {
  const source = read(file);
  assert.doesNotMatch(
    source,
    /manager-os\/presentation\/quote-to-sales-presentation-context-adapter/,
  );
}
pass(6, "static browser runtime does not import the server context adapter");

const serverContext = owner(
  "QUOTE_TO_SALES_PRESENTATION_CONTEXT_ADAPTER",
);
assert.equal(serverContext.browser_ready, false);
assert.equal(serverContext.server_ready, true);
assert.doesNotMatch(
  serverContext.data_owner,
  /reason-why/i,
);
assert.match(
  serverContext.data_owner,
  /client-recommendation-rationale/,
);
for (const forbidden of [
  "consume Advisor Reason Why",
  "consume manager coaching context",
  "expose private advisor motivation",
]) {
  assert.equal(
    serverContext.forbidden_uses.includes(forbidden),
    true,
  );
}
pass(7, "server context excludes Advisor Reason Why and manager coaching");

const contextSource = read(serverContext.runtime_location);
assert.doesNotMatch(
  contextSource,
  /\binput\.reasonWhy\b/,
);
assert.doesNotMatch(
  contextSource,
  /narrativeLogicOwner\s*:\s*["']REASON_WHY["']/,
);
assert.match(
  contextSource,
  /CLIENT_RECOMMENDATION_RATIONALE_OR_HUMAN_REVIEW/,
);
assert.match(
  contextSource,
  /MANAGER_OS_PRIVATE_NOT_PRESENTATION_INPUT/,
);
pass(8, "client rationale replaces ambiguous Reason Why ownership");

const clientRationale = owner(
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
for (const forbidden of [
  "consume Advisor Reason Why",
  "consume manager coaching context",
  "consume compensation or forecast context",
  "expose advisor notes",
  "invent client need",
  "invent product fit",
]) {
  assert.equal(
    clientRationale.forbidden_uses.includes(forbidden),
    true,
  );
}
pass(9, "client rationale owns solution fit and rejects private advisor data");

const packetOwner = owner(
  "PRESENTATION_REVIEW_PACKET_BUILDER",
);
assert.equal(
  packetOwner.data_owner,
  "review-bundle-only",
);
for (const forbidden of [
  "approve",
  "authorize export",
  "send",
  "CRM mutation",
  "retain mutable review session state",
]) {
  assert.equal(
    packetOwner.forbidden_uses.includes(forbidden),
    true,
  );
}
pass(10, "review packet owns only the immutable review bundle");

const stateOwner = owner(
  "PRESENTATION_REVIEW_STATE_STORE",
);
assert.equal(
  stateOwner.data_owner,
  "review-session-state",
);
for (const forbidden of [
  "edit facts",
  "preserve approval after edit",
  "preserve export authorization after edit",
]) {
  assert.equal(
    stateOwner.forbidden_uses.includes(forbidden),
    true,
  );
}
pass(11, "review state owns revisions and gate invalidation");

const previewOwner = owner(
  "EDITABLE_PRESENTATION_PREVIEW_AND_DYNAMIC_UI",
);
assert.equal(
  previewOwner.truth_ownership,
  "READ_ONLY_FACT_RENDERING",
);
assert.equal(
  previewOwner.forbidden_uses.includes("edit facts"),
  true,
);
assert.equal(
  previewOwner.forbidden_uses.includes(
    "static HTML mutation",
  ),
  true,
);
pass(12, "dynamic preview remains read-only for facts");

const approvalOwner = owner(
  "PRESENTATION_HUMAN_APPROVAL_GATE",
);
assert.equal(
  approvalOwner.truth_ownership,
  "HUMAN_DECISION_AUTHORITY",
);
for (const forbidden of [
  "AI approval",
  "anonymous approval",
  "carry approval across revisions",
  "authorize export by itself",
]) {
  assert.equal(
    approvalOwner.forbidden_uses.includes(forbidden),
    true,
  );
}
pass(13, "approval remains identified, human and revision-bound");

const exportOwner = owner(
  "PRESENTATION_EXPORT_AUTHORIZATION_AND_PRINT_PDF_ADAPTER",
);
assert.equal(
  exportOwner.output_contract,
  "PRINT_PDF authorization and print-safe HTML",
);
for (const forbidden of [
  "PPTX claim",
  "send",
  "CRM mutation",
  "export unapproved revision",
  "create approval decision",
]) {
  assert.equal(
    exportOwner.forbidden_uses.includes(forbidden),
    true,
  );
}
pass(14, "export remains Print/PDF-only and cannot create approval");

assert.equal(
  bridgeOwner.truth_ownership,
  "NO_INDEPENDENT_TRUTH",
);
for (const forbidden of [
  "create financial facts",
  "create narrative truth",
  "bypass approval",
  "send",
  "CRM mutation",
]) {
  assert.equal(
    bridgeOwner.forbidden_uses.includes(forbidden),
    true,
  );
}
pass(15, "bridge remains orchestration-only");

assert.equal(
  PRESENTATION_ENGINE_ASSEMBLY_PLAN
    .protected_decisions.length,
  4,
);
const decisions =
  PRESENTATION_ENGINE_ASSEMBLY_PLAN
    .protected_decisions
    .map((entry) => entry.decision)
    .join("\n");
assert.match(
  decisions,
  /Advisor Reason Why remains private manager-os coaching signal/i,
);
assert.match(
  decisions,
  /server canonical composition/i,
);
assert.match(
  decisions,
  /review packet owns immutable initial bundle/i,
);
assert.match(
  decisions,
  /human gate owns approval decision/i,
);
pass(16, "four responsibility and domain decisions are preserved");

const requiredTests = [
  "manager-os/tests/client-recommendation-rationale-boundary-master-test.js",
  "manager-os/tests/advisor-reason-why-presentation-domain-separation-master-test.js",
  "manager-os/tests/sales-presentation-engine-ownership-registry-master-test.js",
  "manager-os/tests/quote-to-sales-presentation-context-adapter-master-test.js",
  "manager-os/tests/accepted-quote-review-snapshot-boundary-master-test.js",
  "manager-os/tests/sales-presentation-browser-context-engine-master-test.js",
  "manager-os/tests/sales-presentation-prompt-engine-master-test.js",
  "manager-os/tests/sales-presentation-slide-plan-engine-master-test.js",
  "manager-os/tests/sales-presentation-review-packet-engine-master-test.js",
  "manager-os/tests/sales-presentation-review-state-store-master-test.js",
  "manager-os/tests/sales-presentation-editable-preview-master-test.js",
  "manager-os/tests/sales-presentation-human-approval-gate-master-test.js",
  "manager-os/tests/sales-presentation-export-adapter-master-test.js",
  "manager-os/tests/nba-reason-why-boundary-contract-master-test.js",
];
for (const testFile of requiredTests) {
  assert.equal(
    exists(testFile),
    true,
    `Missing test: ${testFile}`,
  );
}
assert.equal(
  PRESENTATION_ENGINE_ASSEMBLY_PLAN.next_verification,
  "R16J2_ADVISOR_OS_PRESENTATION_RUNTIME_RECONCILIATION",
);
pass(17, "all component contracts are present and R16J2 is authorized");

console.log(
  "STATUS=PASS_R16H2_EXISTING_PRESENTATION_ASSEMBLY_CONTRACT_E2E_TEST",
);
console.log(
  "STATUS=PASS_R16H3_PRESENTATION_ASSEMBLY_DOMAIN_SEPARATION_E2E_TEST",
);
console.log(
  "Existing Presentation Assembly Domain Separation E2E PASS 17/17",
);
