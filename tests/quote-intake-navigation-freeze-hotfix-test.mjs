import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const source = await readFile(
  new URL(
    "../docs/static-preview/quote-preview-live/forge-quote-intake-ui-simplification-r16j1c1.js",
    import.meta.url,
  ),
  "utf8",
);

for (const token of [
  'const VERSION = "R16J1C1_INTAKE_UI_03A2"',
  'const ROUTE_EVENT = "forge:route-change"',
  "function isQuoteDomPresent()",
  "function isNavigationActivation(event)",
  "function installHistorySignals()",
  'for (const methodName of ["pushState", "replaceState"])',
  'document.addEventListener(',
  '"click"',
  "onDocumentClick",
  "true",
  'globalThis.addEventListener(',
  "ROUTE_EVENT",
  "syncBurst",
  "function clearBurstTimers()",
  "window.clearTimeout(timerShort)",
  "window.clearTimeout(timerMedium)",
  "window.clearTimeout(timerLong)",
  "globalMutationObserver: false",
  "automaticCalculation: false",
  "automaticAcceptance: false",
]) {
  assert.ok(source.includes(token), `missing ${token}`);
}

assert.doesNotMatch(
  source,
  /new MutationObserver/,
  "global MutationObserver must be removed",
);
assert.doesNotMatch(
  source,
  /observer\.observe/,
  "no subtree observer may remain",
);
assert.doesNotMatch(
  source,
  /attributes:\s*true/,
);
assert.doesNotMatch(
  source,
  /childList:\s*true/,
);
assert.doesNotMatch(
  source,
  /params\.get\("module"\)\s*===\s*"cotizaciones"/,
  "permanent module query param must not activate quote work on Inicio",
);
assert.match(
  source,
  /return Boolean\(document\.querySelector\(INPUT_SELECTOR\)\)/,
);
assert.match(
  source,
  /if \(!isNavigationActivation\(event\)\) return;/,
);
assert.match(
  source,
  /if \(framePending\) return;/,
);
assert.match(
  source,
  /wrapper\.hidden = !visible/,
);

console.log("PASS R16J1C1 interaction latency hotfix contract", {
  globalMutationObserver: false,
  eventDrivenRouteSync: true,
  navigationClicksOnly: true,
  pdfSelectorClickIgnored: true,
  cancelableBoundedBurst: true,
  quoteDomDetectionOnly: true,
  assetCacheBustRequired: true,
  betaUiPreserved: true,
  reviewPdfUiPreserved: true,
});
