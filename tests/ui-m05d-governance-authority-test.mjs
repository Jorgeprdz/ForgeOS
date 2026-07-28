import assert from "node:assert/strict";
import fs from "node:fs";

const files = [
  "adr/ADR-025 — UI-M05D Multi-Product Quote Experience Authority.txt",
  "docs/00-governance/FORGE_GOVERNANCE_REGISTRY.md",
  "docs/roadmap/UI_MATERIAL3_RUNTIME_MIGRATION_ROADMAP_001.md",
  "FORGE_MASTER_BUILD_TREE.md",
  "docs/architecture/source-truth/FORGE_UNIFIED_BUILD_TREE_001.md",
  "docs/architecture/source-truth/UI_M05D_QUOTES_MULTIPRODUCT_PARITY_001.md",
];
for (const file of files) {
  const source = fs.readFileSync(file, "utf8");
  assert.match(source, /UI-M05D_QUOTES_MULTI_PRODUCT_VISUAL_SYSTEM_AND_COMPLETE_RESULT_PARITY/);
  assert.match(source, /832b33d5f840d853c7fc337755e8349b0702b62d/);
  assert.match(source, /feature\/ui-m05d-quotes-multiproduct-complete-parity/);
}
const authority = fs.readFileSync(files.at(-1), "utf8");
assert.match(authority, /OWNER_VISUAL_ACCEPTANCE=REJECTED/);
assert.match(authority, /OWNER_FUNCTIONAL_ACCEPTANCE=REJECTED/);
assert.match(authority, /MULTI_PRODUCT_PRESENTATION_IMPLEMENTATION=AUTHORIZED/);
console.log("UI-M05D governance authority: PASS");
