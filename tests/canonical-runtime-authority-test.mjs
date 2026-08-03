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
assert.match(pagesWorkflow, /cleanForgeAliveSource/);
assert.match(pagesWorkflow, /forge-alive-material3/);
assert.match(pagesWorkflow, /canonicalForgeAliveTarget/);
assert.match(pagesWorkflow, /pipeline-bulk-import-mount\.js/);
assert.match(pagesWorkflow, /cartera-document-intake\.js/);
assert.match(pagesWorkflow, /whatsapp-ai-composer\.js/);
assert.doesNotMatch(pagesWorkflow, /prepare-productive-canonical-pages\.mjs/);

console.log("CANONICAL_RUNTIME_AUTHORITY_TEST=PASS");
