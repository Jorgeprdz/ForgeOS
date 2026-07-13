import assert from "node:assert/strict";
import { readFile, access } from "node:fs/promises";

const root = new URL("../", import.meta.url);
const read = (path) => readFile(new URL(path, root), "utf8");

const authorityPaths = [
  "docs/architecture/source-truth/ALFRED_MOBILE_DESIGN_CLOSURE_056U.md",
  "docs/evidence/ALFRED_MOBILE_VISUAL_QA_LOCK_057H.md",
  "docs/evidence/FORGE_MOBILE_WIDGET_GRID_VISUAL_QA_LOCK_057K.md",
  "docs/evidence/FORGE_PREMIUM_FINAL_VISUAL_REPAIR_QA_LOCK_061H.md",
];
await Promise.all(authorityPaths.map((path) => access(new URL(path, root))));

const [html, responsive, widget, widgetGrid, dedup, css, architecture, evidence, masterTree, unifiedTree] = await Promise.all([
  read("docs/static-preview/forge-alive/index.html"),
  read("docs/static-preview/forge-alive/alfred-responsive-ui.js"),
  read("docs/static-preview/forge-alive/alfred-smart-widget-static-056u.js"),
  read("docs/static-preview/forge-alive/forge-mobile-widget-grid-057j.js"),
  read("docs/static-preview/forge-alive/forge-mobile-widget-grid-dedup-057m.js"),
  read("docs/static-preview/forge-alive/forge-alive-home-restoration-r16c.css"),
  read("docs/architecture/source-truth/FORGE_ALIVE_HOME_RESTORATION_SMART_WIDGET_DEDUPLICATION_AND_PRODUCT_UI_CONSISTENCY_R16C.md"),
  read("docs/evidence/r16c-forge-alive-home-restoration-smart-widget-deduplication-and-product-ui-consistency.md"),
  read("FORGE_MASTER_BUILD_TREE.md"),
  read("docs/architecture/source-truth/FORGE_UNIFIED_BUILD_TREE_001.md"),
]);

assert.equal((html.match(/class="bottom-nav"/g) || []).length, 1, "one navigation pill host");
assert.equal((html.match(/class="command-orb-layer"/g) || []).length, 1, "one command orb host");
assert.equal((html.match(/forge-smart-widget-static-056u/g) || []).length >= 1, true, "approved static Smart Widget remains");
assert.doesNotMatch(html, /alfred-ux99-hard-mount\.(?:css|js)/, "obsolete UX99 mount is not loaded");
assert.doesNotMatch(html, /alfred-smart-widget-stable-056t\.(?:css|js)/, "obsolete dynamic widget is not loaded");
assert.doesNotMatch(html, /data-smart-widget-mobile-slot/, "obsolete mobile widget slot is removed");
assert.match(html, /forge-alive-home-restoration-r16c\.css\?v=r16c_home_restoration_20260713_1/);

for (const eventName of ["pageshow", "popstate", "visibilitychange", "DOMContentLoaded", "MutationObserver"]) {
  assert.match(responsive, new RegExp(eventName), `idempotent ${eventName} reconciliation`);
}
assert.match(responsive, /dataset\.forgeHomeLifecycleR16c === "bound"/, "lifecycle binds once");
assert.match(responsive, /node\.remove\(\)/, "obsolete hosts are removed from the DOM");
assert.match(responsive, /widget\.remove\(\)/, "duplicate grid next action is removed structurally");
assert.match(responsive, /navigationCount:/);
assert.match(responsive, /commandOrbCount:/);
assert.match(responsive, /smartWidgetCount:/);

assert.doesNotMatch(widgetGrid, /Seguimiento prioritario/, "widget grid no longer constructs a duplicate Smart Widget");
assert.match(dedup, /widget\.remove\(\)/, "deduplication removes duplicate nodes instead of hiding them");
assert.doesNotMatch(dedup, /hidden\s*=/, "deduplication is not a CSS/hidden-only workaround");

assert.match(widget, /data-forge-home-carousel-previous-r16c/);
assert.match(widget, /data-forge-home-carousel-next-r16c/);
assert.match(widget, /touchstart/);
assert.match(widget, /touchend/);
assert.match(widget, /requestAnimationFrame/);
assert.match(widget, /aria-hidden/);
assert.match(widget, /card\.hidden = cardIndex !== index/, "only the active canonical card remains visible and exposed");

for (const token of [
  "env(safe-area-inset-top",
  "env(safe-area-inset-right",
  "env(safe-area-inset-bottom",
  "env(safe-area-inset-left",
  "100svh",
  "100dvh",
  "-webkit-text-size-adjust: 100%",
  "-webkit-backdrop-filter",
  "color-scheme: dark",
]) assert.ok(css.includes(token), token);
assert.match(css, /min-height: 58px/, "navigation touch targets exceed 44px");
assert.match(css, /min-width: 68px/, "command orb touch target exceeds 44px");
assert.match(css, /touch-action: pan-y/, "carousel preserves vertical scrolling");
assert.match(css, /overflow-x: hidden/, "mobile horizontal overflow is constrained");

for (const document of [architecture, evidence]) {
  for (const marker of [
    "STATUS=PASS_FORGE_ALIVE_HOME_RESTORATION_SMART_WIDGET_DEDUPLICATION_AND_PRODUCT_UI_CONSISTENCY",
    "MOBILE_SMART_WIDGET_AUTHORITY=STATIC_CANONICAL_056U",
    "MOBILE_SMART_WIDGET_VISIBLE_INSTANCE_COUNT=1",
    "IOS_ENGINE=PLAYWRIGHT_WEBKIT",
    "FLOATING_OVERLAY_ACCEPTED_BY_OWNER=YES",
    "ABSOLUTE_PHYSICAL_SEPARATION_REQUIRED=NO",
    "NEXT=BOARD_SCOPE_SELECTION_AFTER_R16C",
  ]) assert.ok(document.includes(marker), marker);
}
for (const tree of [masterTree, unifiedTree]) {
  assert.match(tree, /FORGE:R16C_HOME_RESTORATION_SMART_WIDGET_DEDUPLICATION:START/);
  assert.match(tree, /BOARD_SCOPE_SELECTION_AFTER_R16C/);
}

console.log("PASS forge alive home restoration R16C static contract");
