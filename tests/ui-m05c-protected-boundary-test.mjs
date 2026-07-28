import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import fs from "node:fs";

const source = "ba96e2c5c2fc4a4149af6f6a5561dd13cf1895e5";
const protectedPaths = [
  "docs/static-preview/quote-preview-live",
  "product-intelligence",
  "supabase",
];
const expectedTrees = {
  "docs/static-preview/quote-preview-live": "8274e49f96b5f834f88ca3adca35d39299452f5f",
  "product-intelligence": "5ec0943b0d5410ca496c8aa6bdc1471499fe6aa6",
  "supabase": "97b73b4f8a6d2e2af0affaea5f8da007fe22cce6",
};

for (const path of protectedPaths) {
  const sourceTree = execFileSync("git", ["rev-parse", `${source}:${path}`], { encoding: "utf8" }).trim();
  const currentTree = execFileSync("git", ["rev-parse", `HEAD:${path}`], { encoding: "utf8" }).trim();
  assert.equal(sourceTree, expectedTrees[path]);
  assert.equal(currentTree, sourceTree);
}

const changedProtected = execFileSync(
  "git",
  ["diff", "--name-only", source, "--", ...protectedPaths],
  { encoding: "utf8" },
).trim();
assert.equal(changedProtected, "");

const manifest = JSON.parse(
  fs.readFileSync("docs/evidence/ui-m05c-protected-boundary-manifest.json", "utf8"),
);
assert.equal(manifest.protectedMutationCount, 0);

console.log("UI-M05C protected boundaries: PASS");
