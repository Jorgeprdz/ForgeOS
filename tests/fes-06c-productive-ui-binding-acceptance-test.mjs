import test from "node:test";
import assert from "node:assert/strict";
import {
  readFileSync,
} from "node:fs";

const packageJson =
  JSON.parse(
    readFileSync(
      "package.json",
      "utf8",
    ),
  );

const workflow =
  readFileSync(
    ".github/workflows/fes-event-evidence-ci.yml",
    "utf8",
  );

const config =
  readFileSync(
    "playwright.fes06c.config.mjs",
    "utf8",
  );

const fixture =
  readFileSync(
    "tests/e2e/fixtures/" +
    "fes06c-productive-ui-binding/index.html",
    "utf8",
  );

const spec =
  readFileSync(
    "tests/e2e/" +
    "fes-06c-productive-ui-binding-acceptance.spec.mjs",
    "utf8",
  );

const view =
  readFileSync(
    "docs/static-preview/forge-alive/" +
    "forge-alive-pipeline-view-067g16a.js",
    "utf8",
  );

test("FES 06C package command exists", () => {
  assert.equal(
    packageJson.scripts[
      "test:e2e:fes06c"
    ],
    "playwright test --config=playwright.fes06c.config.mjs",
  );
});

test("FES 06C workflow step exists", () => {
  assert.match(
    workflow,
    /Run Productive UI browser acceptance/,
  );
});

test("FES 06C workflow invokes the package command", () => {
  assert.match(
    workflow,
    /npm run test:e2e:fes06c/,
  );
});

test("FES 06C workflow uploads its report", () => {
  assert.match(
    workflow,
    /artifacts\/fes06c-playwright-report/,
  );
});

test("FES 06C workflow uploads its results", () => {
  assert.match(
    workflow,
    /artifacts\/fes06c-playwright-results\.json/,
  );
});

test("FES 06C workflow watches the productive binding", () => {
  assert.match(
    workflow,
    /advisor-os\/event-evidence\/\*\*/,
  );
});

test("FES 06C workflow watches the productive view", () => {
  assert.match(
    workflow,
    /docs\/static-preview\/forge-alive\/forge-alive-pipeline-view-067g16a\.js/,
  );
});

test("FES 06C config uses chromium", () => {
  assert.match(
    config,
    /name:\s*"chromium"/,
  );
});

test("FES 06C config has a dedicated report", () => {
  assert.match(
    config,
    /fes06c-playwright-report/,
  );
});

test("FES 06C config retains failure evidence", () => {
  assert.match(
    config,
    /trace:\s*"retain-on-failure"/,
  );
  assert.match(
    config,
    /video:\s*"retain-on-failure"/,
  );
});

test("FES 06C fixture imports the real binding", () => {
  assert.match(
    fixture,
    /productive-ui-projection-binding\.js/,
  );
});

test("FES 06C fixture mounts the home binding", () => {
  assert.match(
    fixture,
    /binding\.mountHome/,
  );
});

test("FES 06C fixture mounts the pipeline binding", () => {
  assert.match(
    fixture,
    /binding\.mountPipeline/,
  );
});

test("FES 06C fixture exposes a prospect detail dialog", () => {
  assert.match(
    fixture,
    /data-prospect-detail-dialog/,
  );
});

test("FES 06C browser test covers mobile", () => {
  assert.match(
    spec,
    /mobile-390x844/,
  );
});

test("FES 06C browser test covers tablet", () => {
  assert.match(
    spec,
    /tablet-768x1024/,
  );
});

test("FES 06C browser test covers desktop", () => {
  assert.match(
    spec,
    /desktop-1440x900/,
  );
});

test("FES 06C browser test checks overflow", () => {
  assert.match(
    spec,
    /expect\(result\.overflow\)\s*\.toBe\(0\)/,
  );
});

test("FES 06C browser test checks private content", () => {
  assert.match(
    spec,
    /expect\(result\.privateContent\)\s*\.toEqual\(\[\]\)/,
  );
});

test("FES 06C browser test checks action controls", () => {
  assert.match(
    spec,
    /expect\(result\.actionControls\)\s*\.toBe\(0\)/,
  );
});

test("FES 06C browser test checks explicit states", () => {
  for (
    const state
    of [
      "LOADING",
      "EMPTY",
      "UNAVAILABLE",
      "INVALID",
    ]
  ) {
    assert.match(
      spec,
      new RegExp(`"${state}"`),
    );
  }
});

test("FES 06C browser test checks idempotent replay", () => {
  assert.match(
    spec,
    /ready replay is idempotent/,
  );
});

test("FES 06B productive view imports the binding", () => {
  assert.match(
    view,
    /productive-ui-projection-binding\.js/,
  );
});

test("FES 06B productive view mounts home", () => {
  assert.match(
    view,
    /mountHome\(shell\(\)\)/,
  );
});

test("FES 06B productive view mounts pipeline", () => {
  assert.match(
    view,
    /mountPipeline\(outlet\)/,
  );
});
