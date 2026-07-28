import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");

const adr = read("adr/ADR-019 — UI-M03 Home and Alfred Material 3 Execution Authority.txt");
const roadmap = read("docs/roadmap/UI_MATERIAL3_RUNTIME_MIGRATION_ROADMAP_001.md");
const registry = read("docs/00-governance/FORGE_GOVERNANCE_REGISTRY.md");
const sourceTruth = read("docs/architecture/source-truth/UI_M03_CLEAN_HOME_REWRITE_CANDIDATE_001.md");

test("ADR-019 records the complete scoped UI-M03 execution authority", () => {
  for (const declaration of [
    "UI_M03_STATUS=EXECUTION_AUTHORIZED",
    "BOARD_APPROVAL=GRANTED",
    "MIRANDA_APPROVAL=GRANTED",
    "IMPLEMENTATION_READINESS=READY",
    "DESIGN_AUTHORITY=LOCKED_BUNDLE_93f1ed31",
    "APPROVED_PROTOTYPE_COMMIT=aeffc2e493ff9b5b3cf3cdb90e1f3c22d026b365",
    "RUNTIME_BRANCH=feature/ui-material3-runtime-migration",
    "CLEAN_ENTRYPOINT=docs/static-preview/forge-alive-material3/",
    "LEGACY_ENTRYPOINT_STATUS=FROZEN",
    "FUNCTIONAL_REPLACEMENT_ALLOWED=SCOPED_YES",
    "BACKEND_MUTATION=FORBIDDEN",
    "MAIN_MUTATION=FORBIDDEN",
    "UI_M04_STATUS=LOCKED",
    "HUMAN_VISUAL_ACCEPTANCE=PENDING",
  ]) {
    assert.match(adr, new RegExp(declaration.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  }
});

test("roadmap preserves UI-M03 and records the later UI-M04 authority", () => {
  assert.match(
    roadmap,
    /### UI-M03 — Productive Home bindings[\s\S]*?Status: \*\*EXECUTION_AUTHORIZED\*\*/,
  );
  assert.match(
    roadmap,
    /### UI-M04 — Canonical Forge Shell extraction and navigation contract[\s\S]*?Status: \*\*EXECUTION_AUTHORIZED\*\*/,
  );
});

test("registry and source truth point to the ratified scoped authority", () => {
  assert.match(registry, /## UI-M03 Execution Authority/);
  assert.match(registry, /UI-M03 status \| `EXECUTION_AUTHORIZED`/);
  assert.match(
    registry,
    /UI-M04 status \| `SUPERSEDED_BY_ADR_020_EXECUTION_AUTHORIZED`/,
  );
  assert.match(sourceTruth, /UI_M03_STATUS=EXECUTION_AUTHORIZED/);
  assert.match(sourceTruth, /FUNCTIONAL_REPLACEMENT_ALLOWED=SCOPED_YES/);
  assert.match(sourceTruth, /UI_M04_STATUS=LOCKED/);
});
