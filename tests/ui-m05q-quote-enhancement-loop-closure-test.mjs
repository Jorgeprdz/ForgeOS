import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const path =
  "docs/static-preview/forge-alive-material3/quote-runtime-hotfix-m05e003.js";
const source = await readFile(path, "utf8");

assert.match(source, /const LOOP_CLOSURE_VERSION = "M05Q-001";/);
assert.match(source, /if \(state\.refreshTimer !== null\) return;/);
assert.doesNotMatch(source, /clearTimeout\(state\.refreshTimer\)/);
assert.match(source, /observer\?\.disconnect\(\);/);
assert.match(source, /observer\.observe\(root, observerOptions\);/);
assert.match(source, /document\.querySelector\("\[data-forge-quotes-module\]"\)/);
assert.match(source, /if \(state\.enhancing\) return false;/);
assert.match(source, /setTextOnce\(/);
assert.match(source, /setDisabledOnce\(/);
assert.match(source, /setHiddenOnce\(/);
assert.match(source, /if \(transitioned \|\| !state\.printableReady\)/);
assert.match(
  source,
  /dataset\.quoteEnhancementLoopClosure = LOOP_CLOSURE_VERSION/,
);

console.log("UI_M05Q_QUOTE_ENHANCEMENT_LOOP_CLOSURE=PASS");
