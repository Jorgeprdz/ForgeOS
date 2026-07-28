import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const read = (path) =>
  readFileSync(new URL(`../${path}`, import.meta.url), "utf8");

const adr = read(
  "adr/ADR-020 — UI-M04 Canonical Forge Shell Execution Authority.txt",
);
const roadmap = read(
  "docs/roadmap/UI_MATERIAL3_RUNTIME_MIGRATION_ROADMAP_001.md",
);
const registry = read("docs/00-governance/FORGE_GOVERNANCE_REGISTRY.md");
const sourceTruth = read(
  "docs/architecture/source-truth/UI_M04_CANONICAL_FORGE_SHELL_AUTHORITY_001.md",
);
const masterTree = read("FORGE_MASTER_BUILD_TREE.md");
const unifiedTree = read(
  "docs/architecture/source-truth/FORGE_UNIFIED_BUILD_TREE_001.md",
);

test("UI-M04 has complete scoped constitutional authority", () => {
  for (const declaration of [
    "PHASE=UI-M04_CANONICAL_FORGE_SHELL_EXTRACTION_AND_NAVIGATION_CONTRACT",
    "PHASE_STATUS=EXECUTION_AUTHORIZED",
    "OWNER_APPROVAL=GRANTED",
    "MIRANDA_APPROVAL=GRANTED",
    "BOARD_APPROVAL=GRANTED",
    "IMPLEMENTATION_READINESS=READY",
    "SOURCE_COMMIT=f3c3d1dc6c65b6927c0ca7290d1ac90e138d4673",
    "RUNTIME_BRANCH=feature/ui-m04-canonical-forge-shell",
    "VISUAL_REDESIGN=FORBIDDEN",
    "QUOTE_AND_PRODUCT_BOUNDARIES=PROTECTED",
  ]) {
    assert.match(adr, new RegExp(declaration));
    assert.match(sourceTruth, new RegExp(declaration));
  }
});

test("roadmap and registry authorize only the scoped UI-M04 extraction", () => {
  assert.match(
    roadmap,
    /### UI-M04 — Canonical Forge Shell extraction and navigation contract[\s\S]*?Status: \*\*EXECUTION_AUTHORIZED\*\*/,
  );
  assert.match(registry, /## UI-M04 Canonical Forge Shell Execution Authority/);
  assert.match(registry, /Board scope selection \| `CANONICAL_FORGE_SHELL_EXTRACTION`/);
  assert.match(registry, /Deployment \| `FORBIDDEN`/);
});

test("both build trees record UI-M04 without rewriting R16C", () => {
  for (const tree of [masterTree, unifiedTree]) {
    assert.match(tree, /FORGE:UI_M04_CANONICAL_SHELL:START/);
    assert.match(
      tree,
      /UI-M04 Canonical Forge Shell Extraction and Navigation Contract/,
    );
    assert.match(tree, /FORGE:R16C_HOME_RESTORATION_SMART_WIDGET_DEDUPLICATION:START/);
    assert.match(
      tree,
      /(?:NEXT(?:=|:)|Next:) `?BOARD_SCOPE_SELECTION_AFTER_R16C/,
    );
  }
});
