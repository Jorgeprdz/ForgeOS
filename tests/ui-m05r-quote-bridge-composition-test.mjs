import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const app = await readFile(
  "docs/static-preview/forge-alive-material3/app.js",
  "utf8",
);
const composition = await readFile(
  "docs/static-preview/forge-alive-material3/quote-runtime-bridge-composition-m05r001.js",
  "utf8",
);

const hotfix = app.indexOf("quote-runtime-hotfix-m05e003.js?v=m05q-001-loop-closure");
const handoff = app.indexOf("quote-runtime-vida-mujer-handoff-m05e009.js?v=m05r-001-bridge-composition");
const bridge = app.indexOf("quote-runtime-bridge-composition-m05r001.js?v=m05r-001");
const visual = app.indexOf("quote-runtime-vida-mujer-visual-m05e010.js?v=m05t-001-coalesced");

assert.ok(hotfix >= 0, "hotfix authority missing");
assert.ok(handoff > hotfix, "Vida Mujer handoff must follow hotfix");
assert.ok(bridge > handoff, "bridge composition must follow both wrappers");
assert.ok(visual > bridge, "visual authority must follow bridge composition");
assert.doesNotMatch(app, /for \(const \[path, name\] of optionalAuthorities\)/);
assert.match(app, /await startOptionalQuoteAuthority\(/);
assert.match(composition, /__m05e003Wrapped: true/);
assert.match(composition, /__m05e009VidaMujerHandoff: true/);
assert.match(composition, /if \(alreadyComposed\(current\)\)/);
assert.match(composition, /if \(state\.timer !== null\) return/);
assert.match(composition, /dataset\.quoteBridgeComposition = VERSION/);

console.log("UI_M05R_QUOTE_BRIDGE_COMPOSITION=PASS");
