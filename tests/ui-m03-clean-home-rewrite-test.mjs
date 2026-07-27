import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const root = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);

const read = (relative) =>
  fs.readFileSync(path.join(root, relative), "utf8");

const index = read(
  "docs/static-preview/forge-alive-material3/index.html",
);
const css = read(
  "docs/static-preview/forge-alive-material3/app.css",
);
const source = read(
  "docs/static-preview/forge-alive-material3/app.js",
);
const manifest = JSON.parse(
  read(
    "docs/static-preview/forge-alive-material3/manifest.json",
  ),
);

test("clean entrypoint loads only clean assets", () => {
  assert.match(index, /app\.css\?v=ui-m03-clean-001/);
  assert.match(index, /app\.js\?v=ui-m03-clean-001/);
  assert.doesNotMatch(index, /forge-alive\/ui-material3-runtime/);
  assert.doesNotMatch(index, /forge-desktop-workspace-056y/);
  assert.doesNotMatch(index, /phone-shell/);
  assert.doesNotMatch(index, /forge-mobile-context-nav-057d/);
});

test("clean Home has one structural shell", () => {
  assert.equal(
    (index.match(/data-forge-clean-app/g) || []).length,
    1,
  );
  assert.equal(
    (index.match(/class="topbar"/g) || []).length,
    1,
  );
  assert.equal(
    (index.match(/class="sidebar"/g) || []).length,
    1,
  );
  assert.equal(
    (index.match(/class="bottom-nav"/g) || []).length,
    1,
  );
  assert.equal(
    (index.match(/class="alfred-fab"/g) || []).length,
    1,
  );
});

test("responsive contracts cover three viewports", () => {
  assert.match(css, /max-width:\s*820px/);
  assert.match(css, /max-width:\s*520px/);
  assert.match(css, /max-width:\s*1180px/);
  assert.match(css, /grid-template-columns:\s*236px/);
  assert.match(css, /bottom-nav/);
});

test("visual-only runtime has no productive effects", () => {
  assert.equal(/\bfetch\s*\(/.test(source), false);
  assert.equal(/\bsupabase\b/i.test(source), false);
  assert.equal(/\blocalStorage\b/.test(source), false);
  assert.equal(/\bsessionStorage\b/.test(source), false);
  assert.match(source, /productiveActionsConnected:\s*false/);
});

test("manifest freezes legacy and isolates clean root", () => {
  assert.equal(
    manifest.schema,
    "forge.ui.material3.clean-home.v1",
  );
  assert.equal(
    manifest.legacy.status,
    "frozen_functional_reference",
  );
  assert.equal(
    manifest.legacy.assetsLoadedByCleanEntrypoint,
    false,
  );
  assert.equal(manifest.contracts.cleanDom, true);
  assert.equal(manifest.contracts.singleHeader, true);
  assert.equal(
    manifest.contracts.businessLogicConnected,
    false,
  );
});
