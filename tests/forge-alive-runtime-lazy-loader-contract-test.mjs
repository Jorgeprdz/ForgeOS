import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const page = await readFile(
  new URL(
    "../docs/static-preview/forge-alive/index.html",
    import.meta.url,
  ),
  "utf8",
);

const loader = await readFile(
  new URL(
    "../docs/static-preview/forge-alive/forge-alive-runtime-lazy-loader-r16j1c1.js",
    import.meta.url,
  ),
  "utf8",
);

assert.match(
  page,
  /forge-alive-runtime-lazy-loader-r16j1c1\.js\?v=r16j1c1-runtime-lazy-nav-sync-20260715-1/,
);

assert.doesNotMatch(
  page,
  /new\s+MutationObserver\(\s*markRenderedControls\s*\)/,
);

for (const token of [
  '"R16J1C1_RUNTIME_LAZY_NAV_SYNC_03A3"',
  "const QUOTE_STYLES",
  "const QUOTE_SCRIPTS",
  "const DESKTOP_SCRIPTS",
  "function loadQuoteShell()",
  "function loadQuoteRuntime()",
  "function onFileChangeCapture(event)",
  "replayingFileChange",
  "event.stopImmediatePropagation()",
  'new Event("change"',
  '"forge:quote-shell-ready"',
  "function loadDesktopRuntime()",
  "function syncSelector(key",
  "function syncSelectorStable(key",
  "Geometry authority:",
  '"width"',
  '"height"',
  '"opacity"',
  '"transform"',
  '"important"',
  ":scope > .forge-mobile-nav-r16c5j__items > ",
  '"forge:saas-module-opened"',
  '"forge:saas-module-closed"',
  '"forge:quote-runtime-ready"',
  "Opening Cotizaciones loads only its visual shell.",
  "The 21 extraction,",
  "automaticCalculation: false",
  "automaticAcceptance: false",
]) {
  assert.ok(loader.includes(token), `missing ${token}`);
}

for (const asset of [
  "forge-quote-preview-bundle.js",
  "forge-quote-calculators.js",
  "forge-udi-mxn-runtime.js",
  "forge-quote-benefit-summary.js",
  "forge-quote-preview-confirmation-modal-107q.js",
]) {
  assert.ok(loader.includes(asset), `manifest missing ${asset}`);
}

assert.doesNotMatch(
  page,
  /<script[^>]+src="\.\.\/quote-preview-live\/forge-quote-preview-bundle\.js"/,
);
assert.doesNotMatch(
  page,
  /<script[^>]+src="\.\/desktop\//,
);

assert.doesNotMatch(
  loader,
  /requestIdleCallback|prefetchQuoteRuntime|rel = "prefetch"/,
  "No quote prefetch path may remain",
);

assert.match(
  loader,
  /addEventListener\([\s\S]*"change"[\s\S]*onFileChangeCapture[\s\S]*true/,
  "File change must be intercepted in capture phase",
);

assert.match(
  loader,
  /event\.stopImmediatePropagation\(\)[\s\S]*await loadQuoteRuntime\(\)[\s\S]*dispatchEvent\([\s\S]*new Event\("change"/,
  "Change must be replayed only after runtime readiness",
);

assert.match(
  page,
  /forge-quote-intake-ui-simplification-r16j1c1\.css/,
);
assert.match(
  page,
  /forge-quote-intake-ui-simplification-r16j1c1\.js/,
);
assert.match(page, /forge-alive-mobile-nav-r16c5j\.css/);
assert.match(page, /forge-alive-mobile-nav-r16c5j\.js/);
assert.match(page, /forge-alive-home-nav-bridge-r16c5k\.js/);

console.log("PASS R16J1C1 lazy runtime contract", {
  globalObserver: false,
  quoteHeavyRuntimeOnHome: false,
  desktopRuntimeOnMobile: false,
  intakeUiPreserved: true,
  inAppRouterPreserved: true,
  selectorBubbleEventDriven: true,
  automaticCalculation: false,
  automaticAcceptance: false,
});
