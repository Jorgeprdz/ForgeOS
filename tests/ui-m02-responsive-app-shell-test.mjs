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

const fixturePath = path.join(
  root,
  "tests/fixtures/ui-m02-shell/index.html",
);

const fixtureCssPath = path.join(
  root,
  "tests/fixtures/ui-m02-shell/fixture.css",
);

const serverPath = path.join(
  root,
  "scripts/serve-ui-m02-acceptance-harness.mjs",
);

const configPath = path.join(
  root,
  "playwright.ui-m02.config.mjs",
);

const workflowPath = path.join(
  root,
  ".github/workflows/ui-m02-responsive-app-shell.yml",
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

    assert.match(source, /ForgeUiRuntimeFlag/);
    assert.match(source, /flag\.enabled !== true/);
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

    assert.equal(/\bfetch\s*\(/.test(source), false);
    assert.equal(/\bsupabase\b/i.test(source), false);
    assert.equal(/\blocalStorage\b/.test(source), false);
    assert.equal(/\bsessionStorage\b/.test(source), false);
  },
);

test(
  "all shell CSS is activated by Material 3 mode",
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
  "browser acceptance fixture loads production UI-M02 assets",
  () => {
    const fixture = read(fixturePath);

    assert.match(
      fixture,
      /forge-material3-feature-flag\.js/,
    );

    assert.match(
      fixture,
      /forge-material3-responsive-shell\.css/,
    );

    assert.match(
      fixture,
      /forge-material3-responsive-shell\.js/,
    );

    assert.match(fixture, /class="phone-shell"/);
    assert.match(fixture, /forge-mobile-nav-r16c5j/);
    assert.match(fixture, /dw-sidebar-056y/);
  },
);

test(
  "fixture applies legacy cascade pressure after shell CSS",
  () => {
    const fixture = read(fixturePath);
    const css = read(fixtureCssPath);

    assert.ok(
      fixture.indexOf(
        "forge-material3-responsive-shell.css",
      )
      < fixture.indexOf("./fixture.css"),
    );

    assert.match(
      css,
      /\.forge-mobile-nav-r16c5j[\s\S]*display:\s*block !important/,
    );

    assert.match(
      css,
      /\.dw-sidebar-056y[\s\S]*display:\s*grid !important/,
    );
  },
);

test(
  "acceptance server is static and Vite-free",
  () => {
    const server = read(serverPath);
    const config = read(configPath);

    assert.match(server, /node:http/);
    assert.match(server, /createReadStream/);
    assert.doesNotMatch(server, /\bvite\b/i);

    assert.match(
      config,
      /serve-ui-m02-acceptance-harness\.mjs/,
    );

    assert.match(
      config,
      /tests\/fixtures\/ui-m02-shell/,
    );

    assert.doesNotMatch(config, /\bvite\b/i);
    assert.doesNotMatch(config, /_ui_m02_site/);
  },
);

test(
  "Actions watches the isolated acceptance harness",
  () => {
    const workflow = read(workflowPath);

    assert.match(
      workflow,
      /serve-ui-m02-acceptance-harness\.mjs/,
    );

    assert.match(
      workflow,
      /tests\/fixtures\/ui-m02-shell\/\*\*/,
    );

    assert.doesNotMatch(
      workflow,
      /build-ui-m02-acceptance-site\.mjs/,
    );
  },
);
