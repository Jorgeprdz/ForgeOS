import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const read = (path) => readFileSync(path, "utf8");
const authority = [
  read("adr/ADR-023 — UI-M05B Quotes True Material 3 Redesign Authority.txt"),
  read("docs/00-governance/FORGE_GOVERNANCE_REGISTRY.md"),
  read("docs/architecture/source-truth/FORGE_UNIFIED_BUILD_TREE_001.md"),
  read("docs/architecture/source-truth/UI_M05B_QUOTES_TRUE_MATERIAL3_AUTHORITY_001.md"),
  read("docs/roadmap/UI_MATERIAL3_RUNTIME_MIGRATION_ROADMAP_001.md"),
  read("FORGE_MASTER_BUILD_TREE.md"),
].join("\n");

test("UI-M05B has explicit constitutional authority", () => {
  for (const contract of [
    "UI-M05B_QUOTES_TRUE_MATERIAL3_REDESIGN_AND_PUBLIC_RUNTIME_CORRECTION",
    "EXECUTION_AUTHORIZED",
    "OWNER_APPROVAL=GRANTED",
    "MIRANDA_APPROVAL=GRANTED",
    "BOARD_APPROVAL=GRANTED",
    "b13986224ec091f32ad309bb7af5765e1db78122",
    "feature/ui-m05b-quotes-true-material3-redesign",
  ]) assert.match(authority, new RegExp(contract));
});

test("UI-M05B requires a native rebuild and keeps boundaries closed", () => {
  for (const contract of [
    "TRUE_COMPONENT_REBUILD=REQUIRED",
    "LEGACY_DOM_TRANSPLANT=FORBIDDEN",
    "QUOTE_DOMAIN_BOUNDARIES=PROTECTED",
    "OWNER_VISUAL_ACCEPTANCE_REQUIRED=YES",
  ]) assert.match(authority, new RegExp(contract));
});
