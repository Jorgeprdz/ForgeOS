import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const runtime = await readFile(
  "docs/static-preview/forge-alive-material3/quote-runtime-printable-modal-layer-m05w001.js",
  "utf8",
);
const app = await readFile(
  "docs/static-preview/forge-alive-material3/app.js",
  "utf8",
);
const index = await readFile(
  "docs/static-preview/forge-alive-material3/index.html",
  "utf8",
);

assert.match(runtime, /const VERSION = "M05W-001"/);
assert.match(runtime, /\[data-m05e005-printable-modal\]/);
assert.match(runtime, /z-index:\s*2147483003\s*!important/);
assert.match(runtime, /forge-printable-modal-open-m05e005/);
assert.match(runtime, /forge-auth-floating-avatar-067g17b1/);
assert.match(runtime, /pointer-events:\s*none\s*!important/);
assert.match(
  app,
  /quote-runtime-printable-modal-layer-m05w001\.js\?v=m05w-001/,
);
assert.match(index, /ui-m05w-printable-modal-layer-001/);

console.log("UI_M05W_PRINTABLE_MODAL_LAYER=PASS");
