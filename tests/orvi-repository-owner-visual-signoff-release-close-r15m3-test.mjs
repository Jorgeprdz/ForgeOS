import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8");

const [
  masterTree,
  unifiedTree,
  architecture,
  evidenceMarkdown,
  evidenceJson,
  bridge,
  layout,
  dashboardAdapter,
] = await Promise.all([
  read("FORGE_MASTER_BUILD_TREE.md"),
  read("docs/architecture/source-truth/FORGE_UNIFIED_BUILD_TREE_001.md"),
  read("docs/architecture/source-truth/ORVI_REPOSITORY_OWNER_VISUAL_SIGNOFF_AND_RELEASE_CLOSE_R15M3.md"),
  read("docs/evidence/r15m3-orvi-repository-owner-visual-signoff-and-release-close.md"),
  read("docs/evidence/r15m3-orvi-repository-owner-visual-signoff.json"),
  read("docs/static-preview/quote-runtime/forge-accepted-quote-bridge.js"),
  read("docs/static-preview/quote-runtime/forge-benefit-summary-layout.js"),
  read("docs/static-preview/quote-runtime/forge-orvi-product-dashboard-adapter.js"),
]);

const evidence = JSON.parse(evidenceJson);
const moduleId = "R15M3_ORVI_REPOSITORY_OWNER_VISUAL_SIGNOFF_AND_RELEASE_CLOSE";
const releaseStatus = "PASS_ORVI_RELEASE_CLOSED";
const next = "BOARD_SCOPE_SELECTION_AFTER_ORVI_RELEASE_CLOSE";

assert.match(masterTree, new RegExp(moduleId));
assert.match(unifiedTree, new RegExp(moduleId));
assert.match(
  architecture,
  /STATUS=PASS_REPOSITORY_OWNER_VISUAL_SIGNOFF_AND_ORVI_RELEASE_CLOSE/,
);
assert.match(
  evidenceMarkdown,
  /REPOSITORY_OWNER_VISUAL_DECISION=PASS/,
);

assert.equal(evidence.schema, "forge.orvi.repository-owner-visual-signoff.v1");
assert.equal(evidence.moduleId, moduleId);
assert.equal(evidence.ownerDecision, "PASS");
assert.deepEqual(new Set(Object.values(evidence.criteria)), new Set(["PASS"]));
assert.equal(Object.keys(evidence.criteria).length, 14);
assert.equal(evidence.recoveryVisibleRowCount, 6);
assert.equal(evidence.cashValueVisible, false);
assert.equal(evidence.surrenderValueMxnVisible, false);
assert.equal(evidence.jsonRequiredForUserFlow, false);
assert.equal(evidence.runtimeChanged, false);
assert.equal(evidence.productIntelligenceChanged, false);
assert.equal(evidence.rateCacheChanged, false);
assert.equal(evidence.financialCalculationsChanged, false);
assert.equal(evidence.screenshotsStoredOutsideRepository, true);
assert.equal(evidence.screenshotsCommitted, false);
assert.equal(evidence.pdfCommitted, false);
assert.equal(evidence.clientContentCommitted, false);
assert.equal(evidence.recommendation, null);
assert.equal(evidence.humanDecisionRequired, true);
assert.equal(evidence.releaseStatus, releaseStatus);
assert.equal(evidence.next, next);

assert.match(
  bridge,
  /PDF procesado localmente\. Listo para revisar\./,
);
assert.match(
  layout,
  /grid-template-columns:\s*minmax\(0,\s*\.8fr\)\s*minmax\(0,\s*1\.2fr\)/,
);
assert.match(layout, /overflow-wrap:\s*normal/);
assert.match(
  layout,
  /data-forge-product-section="guaranteed_recovery"\]\[data-forge-orvi-section-ordinal="3"\][\s\S]*?grid-column:\s*3\s*\/\s*span\s*4/,
);
assert.match(
  dashboardAdapter,
  /source_currency\.total_recovery\.value \* future_mxn\.projected_rate\.value/,
);
assert.match(
  dashboardAdapter,
  /projected_total_recovery\.value - current_mxn\.cumulative_paid\.value/,
);
assert.match(
  dashboardAdapter,
  /projected_total_recovery\.value \/ current_mxn\.cumulative_paid\.value \* 100/,
);
assert.doesNotMatch(dashboardAdapter, /"Valor en efectivo"/);
assert.match(dashboardAdapter, /"UDI proyectada"/);

console.log("PASS R15M3 ORVI repository-owner visual signoff release close", {
  ownerDecision: evidence.ownerDecision,
  criteria: Object.keys(evidence.criteria).length,
  recoveryVisibleRowCount: evidence.recoveryVisibleRowCount,
  runtimeChanged: evidence.runtimeChanged,
  releaseStatus: evidence.releaseStatus,
  next: evidence.next,
});
