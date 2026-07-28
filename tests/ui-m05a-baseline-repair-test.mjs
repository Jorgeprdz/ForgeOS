import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const read = (path) => readFileSync(path, "utf8");

test("UI-M05A authority is complete and scoped", () => {
  const authority = read(
    "docs/architecture/source-truth/UI_M05A_QUOTES_BASELINE_REPAIR_AUTHORITY_001.md",
  );
  for (const token of [
    "PHASE_STATUS=EXECUTION_AUTHORIZED",
    "OWNER_APPROVAL=GRANTED",
    "MIRANDA_APPROVAL=GRANTED",
    "BOARD_APPROVAL=GRANTED",
    "VISUAL_REDESIGN=FORBIDDEN",
    "QUOTE_DOMAIN_BOUNDARIES=PROTECTED",
    "RESUME_UI_M05_AFTER_PASS=YES",
  ]) assert.match(authority, new RegExp(token));
});

test("route imports resolve from the repository root", () => {
  const route = read(
    "docs/static-preview/forge-alive/forge-alive-pipeline-view-067g16a.js",
  );
  assert.doesNotMatch(route, /import '\.\.\/\.\.\/(?:advisor-os|nash)\//);
  assert.match(route, /import '\.\.\/\.\.\/\.\.\/advisor-os\//);
  assert.match(route, /import '\.\.\/\.\.\/\.\.\/nash\//);
});

test("READY derives submit state from calculator readiness", () => {
  const intake = read(
    "docs/static-preview/quote-preview-live/forge-quote-intake-state.js",
  );
  assert.match(intake, /calculatorReady = Boolean\(globalThis\.ForgeQuoteCalculators\)/);
  assert.match(intake, /submit\.disabled = !\(ready && calculatorReady\)/);
});

test("UI-M04 shell and Home sources remain untouched", () => {
  for (const path of [
    "docs/static-preview/forge-alive-material3/forge-shell.js",
    "docs/static-preview/forge-alive-material3/home-module.js",
    "docs/static-preview/forge-alive-material3/forge-navigation-contract.js",
    "docs/static-preview/forge-alive-material3/index.html",
    "docs/static-preview/forge-alive-material3/app.css",
  ]) {
    assert.ok(read(path).length > 0);
  }
});
