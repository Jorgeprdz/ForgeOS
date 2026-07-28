import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import fs from "node:fs";

const source = "832b33d5f840d853c7fc337755e8349b0702b62d";
const expected = JSON.parse(
  fs.readFileSync("docs/evidence/ui-m05d-protected-boundary-manifest.json", "utf8"),
).protectedTrees;

for (const [path, tree] of Object.entries(expected)) {
  assert.equal(
    execFileSync("git", ["rev-parse", `${source}:${path}`], { encoding: "utf8" }).trim(),
    tree,
  );
}
assert.equal(
  execFileSync("git", ["diff", "--name-only", source, "--", ...Object.keys(expected)], {
    encoding: "utf8",
  }).trim(),
  "",
);
console.log("UI-M05D protected boundaries: PASS");
