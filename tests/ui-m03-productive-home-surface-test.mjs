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

test("UI-M03 R2 assets load exactly once", () => {
  assert.equal(
    index.split(
      "FORGE:UI_M03_PRODUCTIVE_HOME_SURFACE:START",
    ).length - 1,
    1,
  );
  assert.match(
    index,
    /forge-material3-home-surface\.css\?v=ui-m03-r2/,
  );
  assert.match(
    index,
    /forge-material3-home-surface\.js\?v=ui-m03-r2/,
  );
});

test("R2 creates a dedicated Material 3 Home stage", () => {
  assert.match(source, /data-forge-m3-home-stage/);
  assert.match(source, /document\.createElement\("main"\)/);
  assert.match(source, /content\.insertBefore\(stage, product\)/);
});

test("productive nodes are moved, never cloned or replaced", () => {
  assert.match(source, /stage\.appendChild\(node\)/);
  assert.match(source, /productiveNodesMoved:\s*true/);
  assert.match(source, /productiveNodesCloned:\s*false/);
  assert.match(source, /productiveMarkupReplaced:\s*false/);
  assert.doesNotMatch(source, /cloneNode/);
  assert.doesNotMatch(source, /\.innerHTML\s*=/);
  assert.doesNotMatch(source, /\.replaceWith\s*\(/);
});

test("legacy product tree is structurally hidden on Home", () => {
  assert.match(source, /product\.hidden = hidden/);
  assert.match(
    source,
    /data-forge-m3-legacy-tree-hidden/,
  );
  assert.match(
    css,
    /\[data-forge-m3-legacy-tree-hidden\][\s\S]*display:\s*none !important/,
  );
});

test("moved nodes restore to exact original anchors", () => {
  assert.match(source, /document\.createComment/);
  assert.match(source, /records\.set/);
  assert.match(source, /anchor\.parentNode\.insertBefore/);
  assert.match(source, /restoreAll/);
});

test("non-Home routes restore the productive tree", () => {
  assert.match(source, /isHomeRoute/);
  assert.match(source, /route-not-home/);
  assert.match(source, /setProductHidden\(product, false\)/);
  assert.match(source, /forge:material3-navigation/);
  assert.match(
    source,
    /data-forge-m3-active-route/,
  );
});

test("touch projection excludes historical desktop layouts", () => {
  assert.match(
    source,
    /!node\.closest\(workspaceSelector\)/,
  );
  assert.match(
    source,
    /!node\.closest\("\.alfred-desktop-app-056g7"\)/,
  );
  assert.match(
    source,
    /canonical"\]/,
  );
});

test("dynamic old mobile context navigation is suppressed", () => {
  assert.match(css, /\.forge-mobile-context-nav-057d/);
  assert.match(
    css,
    /\.forge-mobile-context-nav-057d[\s\S]*display:\s*none !important/,
  );
});

test("workspace projects only the productive desktop authority", () => {
  assert.match(
    source,
    /const workspaceSelector =[\s\S]*forge-desktop-workspace-056y/,
  );
  assert.match(
    source,
    /collectWorkspaceNodes/,
  );
  assert.match(
    css,
    /\.forge-m3-home-stage[\s\S]*> \.forge-desktop-workspace-056y/,
  );
});

test("workspace duplicate brand and profile are hidden", () => {
  assert.match(css, /\.dw-brand-056y/);
  assert.match(css, /\.dw-sidebar-profile-056y/);
  assert.match(
    css,
    /\.dw-sidebar-profile-056y[\s\S]*display:\s*none !important/,
  );
});

test("R2 introduces no productive side effects", () => {
  assert.equal(/\bfetch\s*\(/.test(source), false);
  assert.equal(/\bsupabase\b/i.test(source), false);
  assert.equal(/\blocalStorage\b/.test(source), false);
  assert.equal(/\bsessionStorage\b/.test(source), false);
});

test("manifest locks structural projection boundaries", () => {
  assert.equal(
    manifest.schema,
    "forge.ui.material3.productive-home-surface.v2",
  );
  assert.equal(
    manifest.projection.cloneNodes,
    false,
  );
  assert.equal(
    manifest.projection.replaceMarkup,
    false,
  );
  assert.equal(
    manifest.projection.legacyTreeVisibleOnHome,
    false,
  );
  assert.equal(
    manifest.projection.restoreLegacyTreeOutsideHome,
    true,
  );
  assert.equal(
    manifest.contracts.duplicateInterfaceAllowed,
    false,
  );
});
