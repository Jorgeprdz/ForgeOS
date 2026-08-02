import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const buildEntry = await readFile("scripts/build-advisor-presentation-pages-runtime.mjs", "utf8");
const versioner = await readFile("scripts/forge-pages-transitive-cache-versioning.mjs", "utf8");

assert.match(buildEntry, /build-advisor-presentation-pages-runtime-base\.mjs/);
assert.match(buildEntry, /forge-pages-transitive-cache-versioning\.mjs/);
assert.match(versioner, /GITHUB_SHA/);
assert.match(versioner, /home-module\.js\?v=\$\{buildSha\}/);
assert.match(versioner, /home-productive-orchestrator\.js\?v=\$\{buildSha\}/);
assert.match(versioner, /activity-ledger-reporting-bridge\.js\?v=\$\{buildSha\}/);
assert.match(versioner, /smart-widget-productive-home-adapter\.js\?v=\$\{buildSha\}/);
assert.match(versioner, /smart-widget-productive-home-adapter\.css\?v=\$\{buildSha\}/);
assert.match(versioner, /FORGE_PAGES_TRANSITIVE_CACHE_VERSIONING=PASS/);
assert.doesNotMatch(versioner, /localStorage\.clear|sessionStorage\.clear|indexedDB\.deleteDatabase|caches\.delete/);

console.log("FORGE_PAGES_TRANSITIVE_ASSET_CACHE_INVALIDATION=PASS");
console.log("SESSION_AND_LOCAL_DATA_PRESERVATION=PASS");
