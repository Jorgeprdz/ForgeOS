import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const [entry, generator, acceptance] = await Promise.all([
  readFile("scripts/build-advisor-presentation-pages-runtime.mjs", "utf8"),
  readFile("scripts/prepare-advisor-forecast-pages-runtime.mjs", "utf8"),
  readFile("docs/static-preview/forge-alive-material3/advisor-forecast-runtime-acceptance.js", "utf8"),
]);

assert.match(entry, /build-advisor-presentation-pages-runtime-base\.mjs/);
assert.match(entry, /prepare-advisor-forecast-pages-runtime\.mjs/);
assert.ok(
  entry.indexOf("build-advisor-presentation-pages-runtime-base.mjs")
    < entry.indexOf("prepare-advisor-forecast-pages-runtime.mjs"),
  "Forecast closure must run after Smart Widget generation",
);
assert.ok(
  entry.indexOf("prepare-advisor-forecast-pages-runtime.mjs")
    < entry.indexOf("forge-pages-transitive-cache-versioning.mjs"),
  "Forecast closure must run before transitive versioning",
);

for (const path of [
  "advisor-os/forge-alive/activity",
  "advisor-os/forge-alive/navigation",
  "advisor-forecast-activity-handoff.js",
  "advisor-forecast-navigation.js",
  "advisor-forecast-smart-widget.js",
  "productive-smart-widget-orchestrator.js",
  "productive-smart-widget-contract.js",
]) {
  assert.ok(generator.includes(path), `missing Pages closure authority: ${path}`);
}

assert.match(generator, /replaceAll\(sourceSpecifier, pagesSpecifier\)/);
assert.match(generator, /ADVISOR_FORECAST_PAGES_MJS_SPECIFIER_LEAK/);
assert.match(generator, /ADVISOR_FORECAST_PAGES_RUNTIME=PASS/);
assert.match(acceptance, /advisor-forecast-smart-widget\.mjs/);
assert.match(acceptance, /advisor-forecast-activity-handoff\.mjs/);

console.log("ADVISOR_FORECAST_PAGES_RUNTIME_CLOSURE_TEST=PASS");
