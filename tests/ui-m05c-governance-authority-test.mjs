import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const authorityFiles = [
  "adr/ADR-024 — UI-M05C Product Intelligence Presentation Parity Authority.txt",
  "docs/00-governance/FORGE_GOVERNANCE_REGISTRY.md",
  "docs/roadmap/UI_MATERIAL3_RUNTIME_MIGRATION_ROADMAP_001.md",
  "FORGE_MASTER_BUILD_TREE.md",
  "docs/architecture/source-truth/FORGE_UNIFIED_BUILD_TREE_001.md",
  "docs/architecture/source-truth/UI_M05C_QUOTES_PRODUCT_INTELLIGENCE_PARITY_001.md",
];

const required = [
  "UI-M05C_QUOTES_PRODUCT_INTELLIGENCE_PRESENTATION_PARITY",
  "EXECUTION_AUTHORIZED",
  "ba96e2c5c2fc4a4149af6f6a5561dd13cf1895e5",
  "feature/ui-m05c-quotes-product-intelligence-parity",
];

for (const relative of authorityFiles) {
  const source = fs.readFileSync(path.join(root, relative), "utf8");
  for (const marker of required) {
    assert.match(source, new RegExp(marker.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  }
}

const sourceTruth = fs.readFileSync(
  path.join(root, "docs/architecture/source-truth/UI_M05C_QUOTES_PRODUCT_INTELLIGENCE_PARITY_001.md"),
  "utf8",
);
assert.match(sourceTruth, /MATERIAL3_IDENTITY=PROTECTED/);
assert.match(sourceTruth, /LEGACY_DOM_IMPORT=FORBIDDEN/);
assert.match(sourceTruth, /QUOTE_DOMAIN_BOUNDARIES=PROTECTED/);
assert.match(sourceTruth, /OWNER_FUNCTIONAL_ACCEPTANCE=PENDING/);

console.log("UI-M05C governance authority test: PASS");
