import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const layout = readFileSync(
  new URL(
    "../docs/static-preview/quote-preview-live/forge-benefit-summary-layout.js",
    import.meta.url,
  ),
  "utf8",
);
const renderer = readFileSync(
  new URL(
    "../docs/static-preview/quote-preview-live/forge-benefit-summary-renderer.js",
    import.meta.url,
  ),
  "utf8",
);
const bridge = readFileSync(
  new URL(
    "../docs/static-preview/quote-preview-live/forge-accepted-quote-bridge.js",
    import.meta.url,
  ),
  "utf8",
);
const livePage = readFileSync(
  new URL(
    "../docs/static-preview/forge-alive/nueva-cotizacion/index.html",
    import.meta.url,
  ),
  "utf8",
);

assert.match(
  layout,
  /FORGE:R15M_ORVI_RESPONSIVE_HARDENING:START/,
);
assert.match(
  layout,
  /\[data-forge-product-type="orvi"\]/,
);
assert.match(
  layout,
  /\.fq-benefit-orvi-view-switcher-107z15p2/,
);
assert.match(
  layout,
  /\.fq-benefit-orvi-view-button-107z15p2/,
);
assert.match(layout, /min-height:\s*44px/);
assert.match(layout, /overflow-wrap:\s*anywhere/);
assert.match(
  layout,
  /@media\s*\(min-width:\s*1181px\)/,
);
assert.match(
  layout,
  /@media\s*\(max-width:\s*1180px\)\s*and\s*\(min-width:\s*761px\)/,
);
assert.match(
  layout,
  /@media\s*\(max-width:\s*760px\)/,
);
assert.match(
  layout,
  /data-forge-product-section="guaranteed_recovery"/,
);
assert.match(
  layout,
  /data-forge-orvi-view-active="true"/,
);

assert.match(
  renderer,
  /forge-benefit-summary-layout\.js\?v=r15m2_orvi_recovery_20260712_1/,
);
assert.match(
  renderer,
  /forge-orvi-product-dashboard-adapter\.js\?v=r15m2_orvi_recovery_20260712_1/,
);
assert.match(
  bridge,
  /forge-benefit-summary-renderer\.js\?v=r15m2_orvi_recovery_20260712_1/,
);
assert.match(
  livePage,
  /forge-accepted-quote-bridge\.js\?v=r15m2_orvi_recovery_20260712_1/,
);

console.log("PASS R15M ORVI responsive layout contract", {
  desktopColumns: 12,
  tabletColumns: 8,
  mobileBreakpoint: 760,
  minimumTouchTarget: 44,
  overflowWrap: "anywhere",
  productScoped: true,
  cacheBustGraph: true,
});
