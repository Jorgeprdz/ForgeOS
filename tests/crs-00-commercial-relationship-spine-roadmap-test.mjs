import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const roadmapPath = "docs/roadmap/FORGE_COMMERCIAL_RELATIONSHIP_SPINE_ROADMAP_001.md";
const sourceTruthPath = "docs/architecture/source-truth/FORGE_COMMERCIAL_RELATIONSHIP_SPINE_SOURCE_TRUTH_001.md";

const roadmap = readFileSync(roadmapPath, "utf8");
const sourceTruth = readFileSync(sourceTruthPath, "utf8");

const expectedStages = [
  "CRS_00",
  "CRS_01",
  "CRS_02",
  "CRS_03",
  "CRS_04",
  "CRS_05",
  "CRS_06",
  "CRS_07",
  "CRS_08",
  "CRS_09",
  "CRS_10",
  "CRS_11",
];

const requiredRoadmapTokens = [
  "CANONICAL_ROOT=CommercialPerson",
  "RELATIONSHIP_ROOT=AdvisorCommercialRelationship",
  "UNIFIED_TIMELINE=COMPOSED_READ_MODEL",
  "CENTRAL_DUPLICATE_TRUTH_STORE=FORBIDDEN",
  "STAGES=12",
  "SUBSTAGES=48",
  "SUBSTAGE_PATTERN=A_B_C_D",
  "PERSON_DUPLICATION=FORBIDDEN",
  "AUTOMATIC_IDENTITY_MERGE=FORBIDDEN",
  "AUTOMATIC_APPLICATION_CREATION=FORBIDDEN",
  "AUTOMATIC_POLICY_CREATION=FORBIDDEN",
  "AUTOMATIC_STAGE_ADVANCE=FORBIDDEN",
  "CALCULATION_COPY_OUTSIDE_QUOTE=FORBIDDEN",
  "PR_144_ROLE=QUOTE_TO_POLICY_LINEAGE_EDGE",
  "PR_144_ROLE_IS_SYSTEM_SPINE=NO",
  "SEGUBECA_PRODUCTIVE_RELEASE_REQUIRES_CRS_01_02=YES",
  "SEGUBECA_PRODUCT_SPECIFIC_IDENTITY_ADAPTER=FORBIDDEN",
  "SEGUBECA_PRODUCT_SPECIFIC_CARTERA_ADAPTER=FORBIDDEN",
];

const requiredSourceTruthTokens = [
  "SOURCE_TRUTH=FORGE_COMMERCIAL_RELATIONSHIP_SPINE_001",
  "CANONICAL_PERSON_ROOT=CommercialPerson",
  "CANONICAL_ADVISOR_EDGE=AdvisorCommercialRelationship",
  "GAP_01=ADVISOR_COMMERCIAL_RELATIONSHIP_CONTRACT",
  "GAP_02=COMMON_PERSON_DOMAIN_LINK_ENVELOPE",
  "GAP_06=APPLICATION_AND_SIGNATURE_AUTHORITY",
  "SIGNED_APPLICATION_IS_POLICY=NO",
  "ISSUANCE_EVIDENCE_REQUIRED_FOR_POLICY=YES",
  "FES_TIMELINE_FOUNDATION=REUSE",
  "CRS_TIMELINE_PARALLEL_TRUTH=FORBIDDEN",
];

function matches(pattern, input) {
  return [...input.matchAll(pattern)].map((match) => match[0]);
}

test("CRS 00 locks exactly twelve stages", () => {
  const headings = matches(/^## Stage \d{2} — .+$/gm, roadmap);
  assert.equal(headings.length, 12);
  for (const [index, stage] of expectedStages.entries()) {
    assert.match(headings[index], new RegExp(`Stage ${String(index).padStart(2, "0")}`));
    assert.ok(roadmap.includes(stage));
  }
});

test("CRS roadmap contains exactly forty-eight A-D substages", () => {
  const headings = matches(/^### CRS_\d{2}[A-D]_[A-Z0-9_]+$/gm, roadmap);
  assert.equal(headings.length, 48);

  for (const stage of expectedStages) {
    for (const suffix of ["A", "B", "C", "D"]) {
      const prefix = `### ${stage}${suffix}_`;
      assert.equal(
        headings.filter((heading) => heading.startsWith(prefix)).length,
        1,
        `${prefix} must appear exactly once`,
      );
    }
  }
});

test("roadmap preserves canonical person, module authorities and safety boundaries", () => {
  for (const token of requiredRoadmapTokens) assert.ok(roadmap.includes(token), token);
});

test("source truth records accepted foundations and real gaps", () => {
  for (const token of requiredSourceTruthTokens) assert.ok(sourceTruth.includes(token), token);
});

test("Application remains distinct from signed request and issued Policy", () => {
  for (const token of [
    "SIGNED_APPLICATION_IS_POLICY=NO",
    "SUBMITTED_APPLICATION_IS_POLICY=NO",
    "APPROVED_APPLICATION_IS_POLICY=NO",
    "ISSUANCE_EVIDENCE_REQUIRED_FOR_POLICY=YES",
  ]) {
    assert.ok(roadmap.includes(token), token);
    assert.ok(sourceTruth.includes(token), token);
  }
});

test("CRS 00 is documentation and governance only", () => {
  for (const token of [
    "CRS_00_RUNTIME_MUTATION=NO",
    "CRS_00_SCHEMA_MUTATION=NO",
    "CRS_00_PRODUCT_UI_MUTATION=NO",
    "CRS_00_SUPABASE_MUTATION=NO",
  ]) {
    assert.ok(roadmap.includes(token), token);
  }

  for (const token of [
    "RUNTIME_MUTATION=NO",
    "PRODUCT_UI_MUTATION=NO",
    "SCHEMA_MUTATION=NO",
    "SUPABASE_MUTATION=NO",
  ]) {
    assert.ok(sourceTruth.includes(token), token);
  }
});

test("Segubeca may progress but cannot create a private relationship integration", () => {
  assert.ok(roadmap.includes("SEGUBECA_CALCULATION_WORK_CAN_PROCEED=YES"));
  assert.ok(roadmap.includes("SEGUBECA_PRODUCTIVE_RELEASE_REQUIRES_CRS_01_02=YES"));
  assert.ok(roadmap.includes("SEGUBECA_PRODUCT_SPECIFIC_IDENTITY_ADAPTER=FORBIDDEN"));
  assert.ok(roadmap.includes("SEGUBECA_PRODUCT_SPECIFIC_CARTERA_ADAPTER=FORBIDDEN"));
});