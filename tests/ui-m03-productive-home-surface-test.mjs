import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const testDir = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(testDir, "..");

const read = (relative) =>
  fs.readFileSync(path.join(root, relative), "utf8");

const index = read(
  "docs/static-preview/forge-alive/index.html",
);
const css = read(
  "docs/static-preview/forge-alive/"
    + "ui-material3-runtime/"
    + "forge-material3-home-surface.css",
);
const source = read(
  "docs/static-preview/forge-alive/"
    + "ui-material3-runtime/"
    + "forge-material3-home-surface.js",
);
const manifest = JSON.parse(
  read(
    "docs/static-preview/forge-alive/"
      + "ui-material3-runtime/"
      + "forge-material3-home-surface-manifest.json",
  ),
);

test("UI-M03 assets load exactly once", () => {
  assert.equal(
    index.split(
      "FORGE:UI_M03_PRODUCTIVE_HOME_SURFACE:START",
    ).length - 1,
    1,
  );
  assert.equal(
    index.split(
      "forge-material3-home-surface.css",
    ).length - 1,
    1,
  );
  assert.equal(
    index.split(
      "forge-material3-home-surface.js",
    ).length - 1,
    1,
  );
});

test("UI-M03 wins the legacy home cascade", () => {
  assert.ok(
    index.indexOf("forge-material3-home-surface.css")
      > index.indexOf("forge-alive-home-restoration-r16c.css"),
  );
});

test("productive Home markup is preserved", () => {
  assert.match(source, /existingProductSurfacePreserved:\s*true/);
  assert.match(source, /productiveMarkupReplaced:\s*false/);
  assert.match(source, /data-forge-m3-home-preserved/);
  assert.doesNotMatch(source, /\.remove\s*\(/);
  assert.doesNotMatch(source, /\.replaceWith\s*\(/);
  assert.doesNotMatch(source, /\.innerHTML\s*=/);
});

test("runtime is feature-flagged and shell-bound", () => {
  assert.match(source, /ForgeUiRuntimeFlag/);
  assert.match(source, /flag\.enabled !== true/);
  assert.match(source, /data-forge-m3-shell/);
  assert.match(source, /data-forge-m3-product-surface/);
  assert.match(source, /forge:material3-shell-ready/);
  assert.match(source, /forge:material3-home-ready/);
});

test("UI-M03 introduces no productive side effects", () => {
  assert.equal(/\bfetch\s*\(/.test(source), false);
  assert.equal(/\bsupabase\b/i.test(source), false);
  assert.equal(/\blocalStorage\b/.test(source), false);
  assert.equal(/\bsessionStorage\b/.test(source), false);
});

test("dynamic Home widgets are reconciled idempotently", () => {
  assert.match(source, /MutationObserver/);
  assert.match(source, /data-forge-m3-home-ready/);
  assert.match(source, /hasAttribute\(readyMarker\)/);
  assert.match(source, /pageshow/);
});

test("all UI-M03 CSS is scoped to Material 3 Inicio", () => {
  assert.match(
    css,
    /html\[data-forge-ui-runtime="material3"\]/,
  );
  assert.match(
    css,
    /data-forge-m3-active-route="inicio"/,
  );
  assert.match(
    css,
    /data-forge-m3-home-surface="true"/,
  );
  assert.equal(/(^|\n):root\s*\{/.test(css), false);
  assert.equal(/(^|\n)body\s*\{/.test(css), false);
});

test("responsive and reduced-motion contracts exist", () => {
  assert.match(css, /max-width:\s*759px/);
  assert.match(css, /min-width:\s*760px/);
  assert.match(css, /max-width:\s*1199px/);
  assert.match(css, /prefers-reduced-motion:\s*reduce/);
  assert.match(css, /env\(safe-area-inset-bottom/);
});

test("legacy productive Home authorities remain loaded", () => {
  for (const asset of [
    "alfred-responsive-ui.js",
    "alfred-smart-widget-static-056u.js",
    "forge-mobile-widget-grid-057j.js",
    "forge-alive-home-restoration-r16c.css",
  ]) {
    assert.match(
      index,
      new RegExp(asset.replaceAll(".", "\\.")),
    );
  }
});

test("manifest locks UI-M03 boundaries", () => {
  assert.equal(
    manifest.schema,
    "forge.ui.material3.productive-home-surface.v1",
  );
  assert.equal(
    manifest.surface.existingMarkupPreserved,
    true,
  );
  assert.equal(
    manifest.surface.presentationMigrated,
    true,
  );
  assert.equal(
    manifest.contracts.productiveMarkupReplacement,
    false,
  );
  assert.equal(
    manifest.contracts.businessLogicMutation,
    false,
  );
  assert.equal(
    manifest.contracts.humanVisualAcceptanceRequired,
    true,
  );
});
