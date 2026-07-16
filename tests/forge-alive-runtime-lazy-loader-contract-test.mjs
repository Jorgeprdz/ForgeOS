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
  /forge-alive-runtime-lazy-loader-r16j1c1\.js\?v=r16j1c1-parser-first-03c1-20260716-2/,
);

assert.match(
  page,
  /forge-mobile-nav-instant-authority-r16j1c1\.js\?v=r16j1c1-route-fastpath-03a5-20260715-1/,
);

for (const token of [
  '"R16J1C1_RUNTIME_LAZY_03C1_PARSER_FIRST"',
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
  '"forge:quote-runtime-ready"',
  "QUOTE_STYLES.map(loadStyle)",
  "ForgeMobileNavInstantAuthorityR16J1C1",
  "This lazy loader never measures or moves the selector",
  "automaticCalculation: true",
  "automaticAcceptance: false",
]) {
  assert.ok(loader.includes(token), `missing ${token}`);
}

for (const forbidden of [
  "setTimeout(() => syncSelector(key), 80)",
  "setTimeout(() => syncSelector(key), 240)",
  'globalThis.dispatchEvent(new Event("resize"))',
  'document.addEventListener("click", onClick, true)',
  'setQuoteState("shell-loading"',
  "requestIdleCallback",
  "prefetchQuoteRuntime",
  'rel = "prefetch"',
]) {
  assert.ok(
    !loader.includes(forbidden),
    `forbidden loader work remains: ${forbidden}`,
  );
}

assert.equal(
  loader.split("QUOTE_STYLES.map(loadStyle)").length - 1,
  1,
);

assert.match(
  loader,
  /addEventListener\([\s\S]*"change"[\s\S]*onFileChangeCapture[\s\S]*true/,
);

assert.match(
  loader,
  /event\.stopImmediatePropagation\(\)[\s\S]*await loadQuoteRuntime\(\)[\s\S]*dispatchEvent\([\s\S]*new Event\("change"/,
);

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

console.log("PASS R16J1C1 lazy runtime decoupled contract", {
  globalObserver: false,
  quoteHeavyRuntimeOnHome: false,
  quoteStyleLoadOnRoute: false,
  quoteRuntimeOnFileChange: true,
  lazyLoaderNavControl: false,
  dedicatedNavAuthority: true,
  automaticCalculation: true,
  automaticAcceptance: false,
});
