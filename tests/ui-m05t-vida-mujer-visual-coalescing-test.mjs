import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const visual = await readFile(
  "docs/static-preview/forge-alive-material3/quote-runtime-vida-mujer-visual-m05e010.js",
  "utf8",
);
const app = await readFile(
  "docs/static-preview/forge-alive-material3/app.js",
  "utf8",
);

assert.match(visual, /const SCHEDULER_VERSION = "M05T-001"/);
assert.match(visual, /if \(scheduled\) return;/);
assert.match(visual, /confirmationDialogOpen\(\)/);
assert.match(visual, /lastAppliedCalculation/);
assert.match(visual, /requestAnimationFrame/);
assert.doesNotMatch(visual, /\[0, 60, 180, 450, 900\]/);
assert.doesNotMatch(visual, /"forge:quotes-module-ready"/);
assert.doesNotMatch(visual, /"forge:quote-candidate-ready"/);
assert.match(app, /quote-runtime-vida-mujer-visual-m05e010\.js\?v=m05t-001-coalesced/);
assert.doesNotMatch(app, /for \(const \[path, name\] of optionalAuthorities\)/);

console.log("UI_M05T_VIDA_MUJER_VISUAL_COALESCING=PASS");
