import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const pagesWorkflow = await readFile(
  new URL("../.github/workflows/pages.yml", import.meta.url),
  "utf8",
);
const entry = await readFile(
  new URL("../scripts/build-advisor-presentation-pages-runtime.mjs", import.meta.url),
  "utf8",
);

assert.doesNotMatch(entry, /prepare-forge-canonical-runtime\.mjs/);
assert.match(pagesWorkflow, /const canonicalSource = 'docs\/static-preview\/forge-alive-material3'/);
assert.match(pagesWorkflow, /const canonicalTarget = path\.join\(siteDir, 'static-preview', 'forge-alive'\)/);
assert.match(pagesWorkflow, /fs\.cpSync\(canonicalSource, canonicalTarget, \{ recursive: true \}\)/);
assert.match(pagesWorkflow, /prepare-forge-alive-pages-runtime-closure\.mjs _site/);
assert.match(pagesWorkflow, /_site\/platform\/commands\/command-registry\.js/);
assert.match(pagesWorkflow, /_site\/platform\/commands\/alfred-action-registry\.js/);
assert.doesNotMatch(pagesWorkflow, /prepare-productive-canonical-pages\.mjs/);

console.log("CANONICAL_RUNTIME_AUTHORITY_TEST=PASS");
