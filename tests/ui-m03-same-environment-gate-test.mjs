import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const root = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);
const read = (relative) =>
  fs.readFileSync(path.join(root, relative), "utf8");
const workflow = read(
  ".github/workflows/ui-m03-clean-home-rewrite.yml",
);
const gate = read("tools/ui-m03-same-environment-gate.mjs");

const profiles = [
  "mobile-390x844",
  "tablet-portrait-800x1280",
  "tablet-landscape-1100x800",
  "desktop-1440x900",
  "desktop-wide-1920x1080",
];

test("workflow materializes the approved source with complete history", () => {
  assert.match(workflow, /fetch-depth:\s*0/);
  assert.match(
    workflow,
    /aeffc2e493ff9b5b3cf3cdb90e1f3c22d026b365/,
  );
  assert.match(workflow, /git archive "\$AUTHORITY_COMMIT"/);
  assert.match(workflow, /ui\/design-system\/examples/);
  assert.match(workflow, /ui\/design-system\/forge-material3-tokens\.css/);
});

test("gate uses identical deterministic browser context settings", () => {
  for (const contract of [
    /locale:\s*"es-MX"/,
    /timezoneId:\s*"America\/Mexico_City"/,
    /colorScheme:\s*"dark"/,
    /reducedMotion:\s*"reduce"/,
    /deviceScaleFactor:\s*1/,
  ]) {
    assert.match(gate, contract);
  }
  assert.match(gate, /browser\.newContext\(contextOptions\)/g);
});

test("gate captures all five profiles and three required states", () => {
  for (const profile of profiles) {
    assert.match(gate, new RegExp(profile));
  }
  assert.match(
    gate,
    /for \(const state of \["viewport", "full", "alfred-open"\]\)/,
  );
  assert.match(gate, /authorityScreenshotCount === 15/);
  assert.match(gate, /candidateScreenshotCount === 15/);
});

test("workflow uploads evidence even when the visual comparison fails", () => {
  assert.match(
    workflow,
    /id:\s*same_environment_gate[\s\S]*?continue-on-error:\s*true/,
  );
  assert.match(
    workflow,
    /name:\s*Upload visual review artifact[\s\S]*?if:\s*always\(\)/,
  );
  assert.match(
    workflow,
    /name:\s*Enforce same-environment visual gate[\s\S]*?if:\s*always\(\)/,
  );
});

test("gate preserves the immutable visual thresholds", () => {
  for (const contract of [
    /ssimMinimum:\s*0\.995/,
    /differingPercentMaximum:\s*0\.5/,
    /structuralDiff:\s*0/,
    /missingComponents:\s*0/,
    /unexpectedComponents:\s*0/,
    /overflow:\s*0/,
  ]) {
    assert.match(gate, contract);
  }
});
