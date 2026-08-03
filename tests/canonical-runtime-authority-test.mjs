import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const builder = await readFile(
  new URL("../scripts/prepare-forge-canonical-runtime.mjs", import.meta.url),
  "utf8",
);
const entry = await readFile(
  new URL("../scripts/build-advisor-presentation-pages-runtime.mjs", import.meta.url),
  "utf8",
);

assert.match(entry, /prepare-forge-canonical-runtime\.mjs/);
assert.match(builder, /PRODUCTIVE_CANONICAL_RUNTIME/);
assert.match(builder, /forge-alive-auth-entry-067g17b1\.js/);
assert.match(builder, /data-forge-static-view=\\"pipeline\\"/);
assert.match(builder, /pipeline-stage-filter-authority\.js/);
assert.match(builder, /pipeline-bulk-import-mount\.css/);
assert.match(builder, /Vista estática segura/);
assert.match(builder, /Miércoles, 26 de julio/);
assert.match(builder, /replaceAll\("Vista estática segura", ""\)/);
assert.match(builder, /replaceAll\("Miércoles, 26 de julio", ""\)/);

console.log("CANONICAL_RUNTIME_AUTHORITY_TEST=PASS");
