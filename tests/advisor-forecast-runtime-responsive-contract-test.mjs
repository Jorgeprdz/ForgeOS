import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const runtimeCss = fs.readFileSync(
  path.join(root, "docs/static-preview/forge-alive-material3/advisor-forecast-runtime-acceptance.css"),
  "utf8",
);
const detailCss = fs.readFileSync(
  path.join(root, "docs/static-preview/forge-alive-material3/advisor-forecast-detail-screen.css"),
  "utf8",
);

const tests = [
  ["reserves bottom safe area above floating nav pill", () => {
    assert.match(runtimeCss, /padding-bottom:\s*calc\(132px \+ env\(safe-area-inset-bottom\)\)/);
    assert.match(detailCss, /safe-area-inset-bottom/);
  }],
  ["activity plan collapses for mobile", () => {
    assert.match(runtimeCss, /@media \(max-width: 680px\)/);
    assert.match(runtimeCss, /\.advisor-forecast-plan-row\s*\{[\s\S]*grid-template-columns:\s*auto minmax\(0, 1fr\)/);
    assert.match(runtimeCss, /input\[type="date"\][\s\S]*grid-column:\s*2/);
  }],
  ["dates remain touch safe and full width on mobile", () => {
    assert.match(runtimeCss, /min-height:\s*42px/);
    assert.match(runtimeCss, /width:\s*100%/);
  }],
  ["source diagnostics remain scroll safe", () => {
    assert.match(runtimeCss, /\[data-advisor-forecast-sources\] pre[\s\S]*overflow:\s*auto/);
    assert.match(runtimeCss, /overflow-wrap:\s*anywhere/);
  }],
  ["Pipeline Forecast context remains within productive card surface", () => {
    assert.match(runtimeCss, /\[data-advisor-forecast-pipeline-context\]/);
    assert.match(runtimeCss, /margin:\s*16px/);
  }],
];

let failed = 0;
for (const [name, run] of tests) {
  try {
    run();
    console.log(`PASS ${name}`);
  } catch (error) {
    failed += 1;
    console.error(`FAIL ${name}`);
    console.error(error);
  }
}
console.log(`Total: ${tests.length} Pass: ${tests.length - failed} Fail: ${failed}`);
if (failed) process.exit(1);
