import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const guardWorkflow = readFileSync(
  ".github/workflows/restore-productive-forge-alive-authority.yml",
  "utf8",
);
const pagesWorkflow = readFileSync(".github/workflows/pages.yml", "utf8");
const liveAcceptance = readFileSync(
  ".github/workflows/pages-beta1-live-screenshot.yml",
  "utf8",
);
const liveAcceptanceTool = readFileSync(
  "tools/pages-beta1-live-screenshot.mjs",
  "utf8",
);

test("legacy canonical republishing is retired", () => {
  assert.doesNotMatch(guardWorkflow, /workflow_run:/);
  assert.doesNotMatch(guardWorkflow, /actions\/deploy-pages/);
  assert.doesNotMatch(guardWorkflow, /upload-pages-artifact/);
  assert.doesNotMatch(guardWorkflow, /prepare-productive-canonical-pages\.mjs/);
  assert.doesNotMatch(guardWorkflow, /pages:\s*write/);
});

test("the primary Pages workflow is the single canonical publisher", () => {
  assert.match(pagesWorkflow, /cleanForgeAliveSource/);
  assert.match(pagesWorkflow, /forge-alive-material3/);
  assert.match(pagesWorkflow, /canonicalForgeAliveTarget/);
  assert.match(pagesWorkflow, /actions\/deploy-pages@v4/);
});

test("Beta 1 live acceptance exercises the stable canonical route", () => {
  assert.match(
    liveAcceptance,
    /https:\/\/jorgeprdz\.github\.io\/ForgeOS\/static-preview\/forge-alive\//,
  );
  assert.doesNotMatch(liveAcceptance, /forge-alive-material3/);
  assert.match(liveAcceptanceTool, /signInWithPassword/);
  assert.match(liveAcceptanceTool, /unauthenticatedProtectedNavigationRejected/);
  assert.match(liveAcceptanceTool, /if \(!report\.authenticated\) process\.exitCode = 1/);
  assert.match(
    liveAcceptanceTool,
    /if \(!report\.unauthenticatedProtectedNavigationRejected\) process\.exitCode = 1/,
  );
});
