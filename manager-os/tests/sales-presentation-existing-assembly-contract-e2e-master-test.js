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
assert.equal(PRESENTATION_ENGINE_OWNERSHIP_REGISTRY.length, 11);
pass(1, "ownership registry is valid and contains 11 engines");

for (const record of PRESENTATION_ENGINE_OWNERSHIP_REGISTRY) {
  assert.equal(
    exists(record.runtime_location),
    true,
    `Missing runtime location: ${record.runtime_location}`,
  );
}
pass(2, "all registered runtime locations exist");

assert.deepEqual(
  PRESENTATION_ENGINE_ASSEMBLY_PLAN.new_runtime_connections_required,
  [],
);
assert.equal(
  PRESENTATION_ENGINE_ASSEMBLY_PLAN.runtime_assembly_authorized,
  false,
);
assert.equal(
  PRESENTATION_ENGINE_ASSEMBLY_PLAN.status,
  "PLANNED_EXISTING_WIRING_NO_NEW_CONNECTIONS",
);
pass(3, "assembly plan requires no new runtime connections");

const bridgeOwner = owner("ACCEPTED_QUOTE_BRIDGE");
const bridge = read(bridgeOwner.runtime_location);
for (const api of [
  "startSalesPresentationReviewSession",
  "getCurrentSalesPresentationReviewState",
  "updateSalesPresentationReviewSlide",
  "approveCurrentSalesPresentationReview",
  "revokeCurrentSalesPresentationApproval",
  "authorizeCurrentSalesPresentationExport",
  "exportCurrentSalesPresentationToPrintPdf",
]) {
  assert.equal(
    bridgeOwner.public_api.includes(api),
    true,
    `Bridge registry is missing ${api}`,
  );
  assert.match(bridge, new RegExp(`\\b${api}\\b`));
}
pass(4, "bridge exposes the complete public review lifecycle");

const expectedChain = [
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
  PRESENTATION_ENGINE_ASSEMBLY_PLAN.existing_logical_edges.length,
  9,
);
pass(5, "all browser lifecycle engines and nine logical edges are registered");

const browserRuntimeFiles = PRESENTATION_ENGINE_OWNERSHIP_REGISTRY
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
assert.match(
  serverContext.data_owner,
  /externally-supplied-reason-why/,
);
assert.equal(
  serverContext.forbidden_uses.includes("import or execute Reason Why"),
  true,
);
assert.equal(
  serverContext.forbidden_uses.includes(
    "generate or recalculate Reason Why",
  ),
  true,
);
pass(7, "server context keeps Reason Why as external data authority");

const contextSource = read(serverContext.runtime_location);
assert.doesNotMatch(
  contextSource,
  /from\s+["'][^"']*(?:reason[-_]?why|nba)[^"']*["']/i,
);
assert.match(contextSource, /\binput\.reasonWhy\b/);
assert.match(
  contextSource,
  /narrativeLogicOwner\s*:\s*["']REASON_WHY["']/,
);
pass(8, "Reason Why payload is carried without importing its engine");

const packetOwner = owner("PRESENTATION_REVIEW_PACKET_BUILDER");
assert.equal(packetOwner.data_owner, "review-bundle-only");
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
    `Review packet boundary is missing: ${forbidden}`,
  );
}
pass(9, "review packet owns the immutable bundle and no downstream effect");

const stateOwner = owner("PRESENTATION_REVIEW_STATE_STORE");
assert.equal(stateOwner.data_owner, "review-session-state");
for (const api of [
  "initializeSalesPresentationReviewState",
  "updateSalesPresentationSlide",
  "applySalesPresentationApprovalDecision",
  "applySalesPresentationExportAuthorization",
]) {
  assert.equal(
    stateOwner.public_api.includes(api),
    true,
    `Review state registry is missing ${api}`,
  );
}
for (const forbidden of [
  "edit facts",
  "preserve approval after edit",
  "preserve export authorization after edit",
]) {
  assert.equal(stateOwner.forbidden_uses.includes(forbidden), true);
}
pass(10, "review state owns revisions, controlled edits and gate invalidation");

const previewOwner = owner(
  "EDITABLE_PRESENTATION_PREVIEW_AND_DYNAMIC_UI",
);
for (const api of [
  "buildSalesPresentationEditablePreviewModel",
  "openSalesPresentationReviewUi",
  "bindSalesPresentationReviewUi",
]) {
  assert.equal(previewOwner.public_api.includes(api), true);
}
assert.equal(previewOwner.truth_ownership, "READ_ONLY_FACT_RENDERING");
assert.equal(previewOwner.forbidden_uses.includes("edit facts"), true);
assert.equal(
  previewOwner.forbidden_uses.includes("static HTML mutation"),
  true,
);
pass(11, "dynamic preview remains read-only for facts and dynamically mounted");

const approvalOwner = owner("PRESENTATION_HUMAN_APPROVAL_GATE");
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
  assert.equal(approvalOwner.forbidden_uses.includes(forbidden), true);
}
pass(12, "approval remains identified, human and revision-bound");

const exportOwner = owner(
  "PRESENTATION_EXPORT_AUTHORIZATION_AND_PRINT_PDF_ADAPTER",
);
assert.equal(
  exportOwner.output_contract,
  "PRINT_PDF authorization and print-safe HTML",
);
for (const api of [
  "authorizeSalesPresentationExport",
  "buildSalesPresentationPrintableHtml",
  "printSalesPresentationToPdf",
]) {
  assert.equal(exportOwner.public_api.includes(api), true);
}
for (const forbidden of [
  "PPTX claim",
  "send",
  "CRM mutation",
  "export unapproved revision",
  "create approval decision",
]) {
  assert.equal(exportOwner.forbidden_uses.includes(forbidden), true);
}
pass(13, "export remains Print/PDF-only and cannot create approval");

assert.equal(bridgeOwner.truth_ownership, "NO_INDEPENDENT_TRUTH");
assert.equal(
  bridgeOwner.assembly_status,
  "PUBLIC_BROWSER_ORCHESTRATOR_REGISTERED",
);
for (const forbidden of [
  "create financial facts",
  "create narrative truth",
  "bypass approval",
  "send",
  "CRM mutation",
]) {
  assert.equal(bridgeOwner.forbidden_uses.includes(forbidden), true);
}
pass(14, "bridge remains orchestration-only and owns no independent truth");

assert.equal(
  PRESENTATION_ENGINE_ASSEMBLY_PLAN.protected_decisions.length,
  3,
);
const decisions = PRESENTATION_ENGINE_ASSEMBLY_PLAN.protected_decisions
  .map((entry) => entry.decision)
  .join("\n");
assert.match(decisions, /server canonical composition/i);
assert.match(decisions, /review packet owns immutable initial bundle/i);
assert.match(decisions, /human gate owns approval decision/i);
pass(15, "three responsibility overlap decisions are preserved");

const requiredTests = [
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
  assert.equal(exists(testFile), true, `Missing test: ${testFile}`);
}
assert.equal(
  PRESENTATION_ENGINE_ASSEMBLY_PLAN.next_verification,
  "R16H2_EXISTING_PRESENTATION_ASSEMBLY_CONTRACT_AND_E2E_RELEASE_FAST_TRACK",
);
pass(16, "all component contracts are present for R16H2 verification");

console.log(
  "STATUS=PASS_R16H2_EXISTING_PRESENTATION_ASSEMBLY_CONTRACT_E2E_TEST",
);
console.log("Existing Presentation Assembly Contract E2E PASS 16/16");
