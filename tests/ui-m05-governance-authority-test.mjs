import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const read = (path) => readFileSync(path, "utf8");
const phase = "UI-M05_QUOTES_VISUAL_MIGRATION_AND_NAV_PILL_INTEGRATION";
const source = "979b134231e5ffaf18652cef82e47ff3332cf6fc";

test("UI-M05 has explicit scoped constitutional authority", () => {
  const adr = read(
    "adr/ADR-021 — UI-M05 Quotes Visual Migration Execution Authority.txt",
  );
  for (const declaration of [
    `PHASE=${phase}`,
    "PHASE_STATUS=EXECUTION_AUTHORIZED",
    "OWNER_APPROVAL=GRANTED",
    "MIRANDA_APPROVAL=GRANTED",
    "BOARD_APPROVAL=GRANTED",
    "IMPLEMENTATION_READINESS=READY",
    `SOURCE_COMMIT=${source}`,
    "RUNTIME_BRANCH=feature/ui-m05-quotes-visual-migration",
    "VISUAL_REDESIGN=AUTHORIZED",
    "QUOTE_FUNCTIONALITY_REDESIGN=FORBIDDEN",
    "QUOTE_AND_PRODUCT_BOUNDARIES=PROTECTED",
  ]) {
    assert.match(adr, new RegExp(declaration));
  }
});

test("registry, roadmap, source truth and build trees agree", () => {
  const files = [
    "docs/00-governance/FORGE_GOVERNANCE_REGISTRY.md",
    "docs/roadmap/UI_MATERIAL3_RUNTIME_MIGRATION_ROADMAP_001.md",
    "docs/architecture/source-truth/UI_M05_QUOTES_VISUAL_MIGRATION_AUTHORITY_001.md",
    "FORGE_MASTER_BUILD_TREE.md",
    "docs/architecture/source-truth/FORGE_UNIFIED_BUILD_TREE_001.md",
  ];
  for (const file of files) {
    const content = read(file);
    assert.match(content, new RegExp(phase), `${file} lacks phase`);
    assert.match(content, /EXECUTION_AUTHORIZED/, `${file} lacks status`);
  }
});

test("UI-M05 authorization preserves its functional boundaries", () => {
  const truth = read(
    "docs/architecture/source-truth/UI_M05_QUOTES_VISUAL_MIGRATION_AUTHORITY_001.md",
  );
  assert.match(truth, /QUOTE_FUNCTIONALITY_REDESIGN=FORBIDDEN/);
  assert.match(truth, /QUOTE_AND_PRODUCT_BOUNDARIES=PROTECTED/);
  assert.match(truth, /SUPABASE_REMOTE_MUTATION=FORBIDDEN/);
  assert.match(truth, /DEPLOYMENT=FORBIDDEN/);
});
