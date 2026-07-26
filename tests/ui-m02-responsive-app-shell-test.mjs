import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const testDir = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(testDir, "..");

const entry = path.join(
  root,
  "docs/static-preview/forge-alive/index.html",
);

const runtimeRoot = path.join(
  root,
  "docs/static-preview/forge-alive/ui-material3-runtime",
);

const cssPath = path.join(
  runtimeRoot,
  "forge-material3-responsive-shell.css",
);

const jsPath = path.join(
  runtimeRoot,
  "forge-material3-responsive-shell.js",
);

const manifestPath = path.join(
  runtimeRoot,
  "forge-material3-responsive-shell-manifest.json",
);

const acceptanceBuildPath = path.join(
  root,
  "scripts/build-ui-m02-acceptance-site.mjs",
);

const read = (target) =>
  fs.readFileSync(target, "utf8");

test(
  "real product entrypoint loads UI-M02 exactly once",
  () => {
    const html = read(entry);
    const count = (value) =>
      html.split(value).length - 1;

    assert.equal(
      count("FORGE:UI_M02_RESPONSIVE_APP_SHELL:START"),
      1,
    );

    assert.equal(
      count("forge-material3-responsive-shell.css"),
      1,
    );

    assert.equal(
      count("forge-material3-responsive-shell.js"),
      1,
    );
  },
);

test(
  "shell runtime is gated by the UI-M01 feature flag",
  () => {
    const source = read(jsPath);

    assert.match(
      source,
      /ForgeUiRuntimeFlag/,
    );

    assert.match(
      source,
      /flag\.enabled !== true/,
    );

    assert.match(
      source,
      /data-forge-m3-shell-ready/,
    );
  },
);

test(
  "shell preserves the productive Home surface",
  () => {
    const source = read(jsPath);

    assert.match(source, /\.phone-shell/);
    assert.match(
      source,
      /data-forge-m3-product-surface/,
    );

    assert.match(
      source,
      /productiveHomeReplaced:\s*false/,
    );
  },
);

test(
  "shell exposes the approved responsive modes",
  () => {
    const source = read(jsPath);

    for (const mode of [
      "mobile",
      "tablet-portrait",
      "tablet-landscape",
      "desktop",
    ]) {
      assert.match(
        source,
        new RegExp(`"${mode}"`),
      );
    }
  },
);

test(
  "shell contains navigation and Alfred surfaces",
  () => {
    const source = read(jsPath);

    for (const marker of [
      "data-forge-m3-header",
      "data-forge-m3-nav-region",
      "data-forge-m3-open-alfred",
      "data-forge-m3-alfred-sheet",
      "forge:material3-shell-ready",
    ]) {
      assert.match(
        source,
        new RegExp(marker),
      );
    }
  },
);

test(
  "UI-M02 does not introduce productive side effects",
  () => {
    const source = read(jsPath);

    assert.equal(
      /\bfetch\s*\(/.test(source),
      false,
    );

    assert.equal(
      /\bsupabase\b/i.test(source),
      false,
    );

    assert.equal(
      /\blocalStorage\b/.test(source),
      false,
    );

    assert.equal(
      /\bsessionStorage\b/.test(source),
      false,
    );
  },
);

test(
  "all shell CSS is activated by material3 mode",
  () => {
    const css = read(cssPath);

    assert.match(
      css,
      /html\[data-forge-ui-runtime="material3"\]/,
    );

    assert.equal(
      /(^|\n):root\s*\{/.test(css),
      false,
    );

    assert.equal(
      /(^|\n)body\s*\{/.test(css),
      false,
    );
  },
);

test(
  "manifest preserves runtime boundaries",
  () => {
    const manifest = JSON.parse(read(manifestPath));

    assert.equal(
      manifest.schema,
      "forge.ui.material3.responsive-shell.v1",
    );

    assert.equal(manifest.defaultMode, "legacy");

    assert.equal(
      manifest.contracts.productiveHomeReplacement,
      false,
    );

    assert.equal(
      manifest.contracts.productiveAlfredConnection,
      false,
    );

    assert.equal(
      manifest.contracts.defaultVisualMutation,
      false,
    );

    assert.equal(
      manifest.contracts.featureFlagRequired,
      true,
    );

    assert.deepEqual(
      manifest.shell.routes,
      [
        "inicio",
        "pipeline",
        "cotizaciones",
      ],
    );
  },
);

test(
  "acceptance site mirrors the Pages public layout",
  () => {
    const source = read(acceptanceBuildPath);

    assert.match(source, /_ui_m02_site/);
    assert.match(
      source,
      /advisor-os\/sales-pipeline\//,
    );
    assert.match(
      source,
      /file\.startsWith\("docs\/"\)/,
    );
    assert.match(
      source,
      /UI_M02_ACCEPTANCE_SITE=PASS/,
    );
  },
);

test(
  "legacy navigation is strongly disabled in Material 3 mode",
  () => {
    const css = read(cssPath);

    assert.match(
      css,
      /body\[data-forge-mobile-nav-page-r16c5j\][\s\S]*\.forge-mobile-nav-r16c5j/,
    );

    assert.match(
      css,
      /width:\s*0 !important/,
    );

    assert.match(
      css,
      /height:\s*0 !important/,
    );
  },
);

test(
  "rail layouts reserve width instead of overflowing",
  () => {
    const css = read(cssPath);

    assert.match(
      css,
      /width:\s*calc\(100% - 112px\)/,
    );

    assert.match(
      css,
      /width:\s*calc\(100% - 128px\)/,
    );

    assert.match(
      css,
      /overflow-x:\s*clip/,
    );
  },
);
