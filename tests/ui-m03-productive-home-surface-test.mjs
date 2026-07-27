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

test("UI-M03 R1 assets load exactly once", () => {
  assert.equal(
    index.split(
      "FORGE:UI_M03_PRODUCTIVE_HOME_SURFACE:START",
    ).length - 1,
    1,
  );
  assert.match(
    index,
    /forge-material3-home-surface\.css\?v=ui-m03-r1/,
  );
  assert.match(
    index,
    /forge-material3-home-surface\.js\?v=ui-m03-r1/,
  );
});

test("productive Home markup and handlers remain intact", () => {
  assert.match(source, /existingProductSurfacePreserved:\s*true/);
  assert.match(source, /productiveMarkupReplaced:\s*false/);
  assert.doesNotMatch(source, /\.remove\s*\(/);
  assert.doesNotMatch(source, /\.replaceWith\s*\(/);
  assert.doesNotMatch(source, /\.innerHTML\s*=/);
});

test("runtime selects one responsive product authority", () => {
  assert.match(source, /window\.innerWidth >= 900/);
  assert.match(source, /"workspace"/);
  assert.match(source, /"touch"/);
  assert.match(source, /data-forge-m3-home-layout/);
  assert.match(source, /setInactive/);
});

test("mobile blocks duplicate header and navigation", () => {
  assert.match(css, /max-width:\s*899px/);
  assert.match(
    css,
    /> \.hero[\s\S]*display:\s*none !important/,
  );
  assert.match(
    css,
    /\.forge-m3-shell__nav-pill[\s\S]*display:\s*none !important/,
  );
  assert.match(
    css,
    /\.bottom-nav\[data-forge-home-navigation-r16c="canonical"\]/,
  );
  assert.match(
    css,
    /grid-template-columns:\s*repeat\(4/,
  );
});

test("touch layouts keep the new Alfred launcher only", () => {
  assert.match(
    css,
    /\.forge-m3-shell__alfred-launcher[\s\S]*width:\s*76px/,
  );
  assert.match(
    css,
    /\[data-command-orb-layer\][\s\S]*display:\s*none !important/,
  );
});

test("tablet and desktop use the full productive workspace", () => {
  assert.match(css, /min-width:\s*900px/);
  assert.match(
    css,
    /\.forge-desktop-workspace-056y[\s\S]*grid-template-columns:[\s\S]*clamp\(210px/,
  );
  assert.match(
    css,
    /\.dw-sidebar-056y[\s\S]*display:\s*flex !important/,
  );
  assert.match(
    css,
    /\.dw-main-056y[\s\S]*grid-column:\s*2 !important/,
  );
});

test("workspace no longer reserves the isolated shell rail", () => {
  assert.match(
    css,
    /\.forge-m3-shell__header[\s\S]*width:\s*100% !important/,
  );
  assert.match(
    css,
    /\.forge-m3-shell__content[\s\S]*margin-left:\s*0 !important/,
  );
  assert.match(
    css,
    /\.forge-m3-shell__nav-region[\s\S]*display:\s*none !important/,
  );
  assert.match(
    css,
    /overflow-y:\s*auto !important/,
  );
});

test("inactive historical layouts cannot remain interactive", () => {
  assert.match(source, /toggleAttribute\("inert", inactive\)/);
  assert.match(source, /aria-hidden/);
  assert.equal(
    manifest.contracts.inactiveHistoricalLayoutsInteractive,
    false,
  );
});

test("UI-M03 R1 introduces no productive side effects", () => {
  assert.equal(/\bfetch\s*\(/.test(source), false);
  assert.equal(/\bsupabase\b/i.test(source), false);
  assert.equal(/\blocalStorage\b/.test(source), false);
  assert.equal(/\bsessionStorage\b/.test(source), false);
});

test("fail-closed public configuration remains visible", () => {
  assert.match(
    css,
    /data-forge-public-config-state="067g17a1"/,
  );
  assert.doesNotMatch(
    css,
    /data-forge-public-config-state="067g17a1"[\s\S]{0,400}display:\s*none/,
  );
});

test("manifest records owner rejection and correction", () => {
  assert.equal(
    manifest.status,
    "corrected_pending_owner_visual_acceptance",
  );
  assert.equal(
    manifest.ownerVisualReview.candidateAccepted,
    false,
  );
  assert.equal(
    manifest.surface.existingMarkupPreserved,
    true,
  );
  assert.equal(
    manifest.contracts.duplicateHeaderAllowed,
    false,
  );
  assert.equal(
    manifest.contracts.duplicateNavigationAllowed,
    false,
  );
});
