import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const roadmapPath = "docs/roadmap/FORGE_COMMERCIAL_RELATIONSHIP_SPINE_ROADMAP_001.md";
const annexPath = "docs/roadmap/FORGE_COMMERCIAL_RELATIONSHIP_SPINE_CORRECTION_ANNEX_001.md";
const sourceTruthPath = "docs/architecture/source-truth/FORGE_COMMERCIAL_RELATIONSHIP_SPINE_SOURCE_TRUTH_001.md";
const evidencePath = "docs/evidence/FORGE_CRS_00_ABCD_CLOSURE_001.md";

const roadmap = readFileSync(roadmapPath, "utf8");
const annex = readFileSync(annexPath, "utf8");
const sourceTruth = readFileSync(sourceTruthPath, "utf8");
const evidence = readFileSync(evidencePath, "utf8");

const expectedStages = Array.from({ length: 12 }, (_, index) =>
  `CRS_${String(index).padStart(2, "0")}`
);

function matches(pattern, input) {
  return [...input.matchAll(pattern)].map((match) => match[0]);
}

test("CRS keeps twelve historical governance stages and forty-eight A-D substages", () => {
  const stageHeadings = matches(/^## Stage \d{2} — .+$/gm, roadmap);
  const substageHeadings = matches(/^### CRS_\d{2}[A-D]_[A-Z0-9_]+$/gm, roadmap);

  assert.equal(stageHeadings.length, 12);
  assert.equal(substageHeadings.length, 48);

  for (const [index, stage] of expectedStages.entries()) {
    assert.match(stageHeadings[index], new RegExp(`Stage ${String(index).padStart(2, "0")}`));
    for (const suffix of ["A", "B", "C", "D"]) {
      const prefix = `### ${stage}${suffix}_`;
      assert.equal(
        substageHeadings.filter((heading) => heading.startsWith(prefix)).length,
        1,
        `${prefix} must appear exactly once`,
      );
    }
  }
});

test("the correction annex has execution precedence over original build language", () => {
  for (const token of [
    "AMENDS=FORGE_COMMERCIAL_RELATIONSHIP_SPINE_ROADMAP_001",
    "CORRECTION_TYPE=OWNER_DIRECTED_PATH_CORRECTION",
    "EXECUTION_PRECEDENCE=THIS_ANNEX_OVER_ORIGINAL_STAGE_BUILD_LANGUAGE",
    "ORIGINAL_ROADMAP_RETAINED_AS_HISTORICAL_PLANNING_EVIDENCE=YES",
    "ORIGINAL_BUILD_FROM_ZERO_PATH=SUPERSEDED",
  ]) {
    assert.ok(annex.includes(token), token);
  }
});

test("Cartera authorities are reused instead of reconstructed", () => {
  for (const token of [
    "CANONICAL_PERSON_AUTHORITY=REUSE_CARTERA_010B_COMMERCIAL_PERSON",
    "PROSPECT_PERSON_LINK_AUTHORITY=REUSE_CARTERA_010B_SOURCE_IDENTITY_LINKS",
    "POLICY_AND_ROLE_AUTHORITY=REUSE_CARTERA_010B_TO_020C",
    "PERSON_HISTORY_FOUNDATION=EXTEND_CARTERA_040B",
    "PERSON_WORKSPACE_FOUNDATION=PROMOTE_CARTERA_040D",
    "RELATIONSHIP_INTELLIGENCE_FOUNDATION=REUSE_CARTERA_050_TO_100",
    "CARTERA_EXISTING_AUTHORITIES=GOVERNING_FOUNDATION",
  ]) {
    assert.ok(annex.includes(token), token);
  }
});

test("duplicate identity, Timeline and relationship-intelligence construction is forbidden", () => {
  for (const token of [
    "NEW_COMMERCIAL_PERSON_TABLE=FORBIDDEN",
    "PARALLEL_IDENTITY_RESOLUTION=FORBIDDEN",
    "NEW_ADVISOR_COMMERCIAL_RELATIONSHIP_PERSISTENCE=NOT_AUTHORIZED_WITHOUT_PROVEN_GAP",
    "NEW_PERSON_TIMELINE_LEDGER=FORBIDDEN",
    "NEW_RELATIONSHIP_INTELLIGENCE_STACK=FORBIDDEN",
    "SECOND_PERSON_WORKSPACE=FORBIDDEN",
    "CARTERA_REBUILD=FORBIDDEN",
  ]) {
    assert.ok(annex.includes(token), token);
  }
});

test("the real remaining work is cross-module convergence and Application authority", () => {
  for (const token of [
    "CROSS_MODULE_PERSON_CONVERGENCE=REAL_REMAINING_WORK",
    "APPLICATION_AND_SIGNATURE_AUTHORITY=NEW_REQUIRED_CAPABILITY",
    "PIPELINE_CONVERGENCE=REMAINING",
    "ACTIVITY_FES_CONVERGENCE=REMAINING",
    "QUOTE_CONVERGENCE=REMAINING",
    "APPLICATION_AUTHORITY=NOT_YET_COMPLETE",
    "APPLICATION_TO_POLICY_LINEAGE=REQUIRED",
  ]) {
    assert.ok(annex.includes(token), token);
  }
});

test("Application remains distinct from signed request, approval and issued Policy", () => {
  for (const token of [
    "SIGNED_APPLICATION_IS_POLICY=NO",
    "SUBMITTED_APPLICATION_IS_POLICY=NO",
    "APPROVED_APPLICATION_IS_POLICY=NO",
    "ISSUANCE_EVIDENCE_REQUIRED_FOR_POLICY=YES",
  ]) {
    assert.ok(roadmap.includes(token) || annex.includes(token), token);
    assert.ok(sourceTruth.includes(token), token);
  }
});

test("Segubeca binds to the existing person authority and common link extension", () => {
  for (const token of [
    "SEGUBECA_CALCULATION_WORK_CAN_PROCEED=YES",
    "SEGUBECA_PRODUCTIVE_RELEASE_REQUIRES_EXISTING_PERSON_AUTHORITY_RECONCILIATION=YES",
    "SEGUBECA_PRODUCTIVE_RELEASE_REQUIRES_CRS_02_COMMON_LINK_EXTENSION=YES",
    "SEGUBECA_REQUIRES_NEW_COMMERCIAL_PERSON_AUTHORITY=NO",
    "SEGUBECA_PRODUCT_SPECIFIC_IDENTITY_ADAPTER=FORBIDDEN",
    "SEGUBECA_PRODUCT_SPECIFIC_CARTERA_ADAPTER=FORBIDDEN",
  ]) {
    assert.ok(annex.includes(token), token);
  }
});

test("all automatic and database mutation boundaries remain blocked", () => {
  for (const token of [
    "AUTOMATIC_IDENTITY_MERGE=FORBIDDEN",
    "AUTOMATIC_OPPORTUNITY_CREATION=FORBIDDEN",
    "AUTOMATIC_APPLICATION_CREATION=FORBIDDEN",
    "AUTOMATIC_POLICY_CREATION=FORBIDDEN",
    "AUTOMATIC_STAGE_ADVANCE=FORBIDDEN",
    "AUTOMATIC_CONTACT=FORBIDDEN",
    "AUTOMATIC_MESSAGE=FORBIDDEN",
    "AUTOMATIC_TASK=FORBIDDEN",
    "AUTOMATIC_CALENDAR=FORBIDDEN",
    "DATABASE_MUTATION_BY_THIS_ANNEX=NO",
  ]) {
    assert.ok(annex.includes(token), token);
  }
});

test("CRS 00 evidence closes all four corrected substages in one pass", () => {
  for (const token of [
    "CRS_00_ABCD_SINGLE_PASS=COMPLETE",
    "CRS_00A_REPOSITORY_DISCOVERY_AND_AUTHORITY_INVENTORY=PASS",
    "CRS_00B_CORRECTED_SOURCE_TRUTH_AND_CARTERA_REUSE_LOCK=PASS",
    "CRS_00C_CORRECTED_ROADMAP_GOVERNANCE_AND_VALIDATION=PASS",
    "CRS_00D_ACCEPTANCE_EVIDENCE_AND_CLOSURE=PASS",
    "NEXT=CRS_01A_EXISTING_CARTERA_AUTHORITY_PROMOTION_AND_GAP_LOCK",
  ]) {
    assert.ok(evidence.includes(token), token);
  }
});