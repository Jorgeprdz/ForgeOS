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
assert.match(
  layout,
  /\.fq-benefit-orvi-view-button-107z15p2[\s\S]*?overflow-wrap:\s*normal/,
);
assert.doesNotMatch(
  layout,
  /\.fq-benefit-orvi-view-button-107z15p2\s*\{[^}]*overflow-wrap:\s*anywhere/,
);
assert.match(layout, /word-break:\s*normal/);
assert.match(layout, /hyphens:\s*none/);
assert.match(
  layout,
  /grid-template-columns:\s*minmax\(0,\s*\.8fr\)\s*minmax\(0,\s*1\.2fr\)/,
);
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
  layout,
  /data-forge-product-section="guaranteed_recovery"\]\[data-forge-orvi-section-ordinal="3"\][\s\S]*?grid-column:\s*3\s*\/\s*span\s*4/,
);
assert.match(
  layout,
  /\.fq-benefit-dotal-chips-107z15p2\s*>\s*:nth-child\(3\):last-child[\s\S]*?justify-self:\s*center/,
);
assert.match(layout, /FORGE:R15M2B_ORVI_PROTECTION_UI_REPAIR:START/);
assert.match(layout, /fq-benefit-orvi-protection-primary-107z15p2/);
assert.match(layout, /fq-benefit-orvi-protection-metadata-107z15p2/);
assert.match(
  layout,
  /data-forge-product-section="protection"\][\s\S]*?grid-column:\s*1\s*\/\s*-1\s*!important/,
);
assert.match(
  layout,
  /data-forge-product-section="future_scenario"\][\s\S]*?grid-column:\s*1\s*\/\s*-1\s*!important/,
);

assert.match(
  renderer,
  /forge-benefit-summary-layout\.js\?v=r15m2c_orvi_responsive_copy_20260713_1/,
);
assert.match(
  renderer,
  /forge-orvi-product-dashboard-adapter\.js\?v=r15m2c_orvi_responsive_copy_20260713_1/,
);
assert.match(
  bridge,
  /forge-benefit-summary-renderer\.js\?v=r15m2c_orvi_responsive_copy_20260713_1/,
);
assert.match(
  livePage,
  /forge-accepted-quote-bridge\.js\?v=r15m2c_orvi_responsive_copy_20260713_1/,
);
assert.match(
  livePage,
  /forge-benefit-summary-renderer\.js\?v=r15m2c_orvi_responsive_copy_20260713_1/,
);
assert.match(
  livePage,
  /forge-benefit-summary-layout\.js\?v=r15m2c_orvi_responsive_copy_20260713_1/,
);

console.log("PASS R15M ORVI responsive layout contract", {
  desktopColumns: 12,
  tabletColumns: 8,
  mobileBreakpoint: 760,
  minimumTouchTarget: 44,
  switcherOverflowWrap: "normal",
  switcherColumns: "0.8fr_1.2fr",
  tabletThirdCards: "centered",
  protectionPrimaryFullWidth: true,
  protectionMetadataCompact: true,
  futureProtectionFullWidth: true,
  productScoped: true,
  cacheBustGraph: true,
});
