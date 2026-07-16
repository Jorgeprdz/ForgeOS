import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const loader = await readFile(
  new URL(
    "../docs/static-preview/forge-alive/forge-alive-runtime-lazy-loader-r16j1c1.js",
    import.meta.url,
  ),
  "utf8",
);
const router = await readFile(
  new URL(
    "../docs/static-preview/forge-alive/forge-alive-saas-router-r16c5l.js",
    import.meta.url,
  ),
  "utf8",
);
const parser = await readFile(
  new URL(
    "../docs/static-preview/quote-preview-live/forge-pdf-browser-parser.js",
    import.meta.url,
  ),
  "utf8",
);
const cleanup = await readFile(
  new URL(
    "../docs/static-preview/forge-alive/forge-nueva-cotizacion-ui-cleanup-r16j1.js",
    import.meta.url,
  ),
  "utf8",
);
const orbRemoval = await readFile(
  new URL(
    "../docs/static-preview/forge-alive/forge-alfred-orb-ui-removal-r16j1a.js",
    import.meta.url,
  ),
  "utf8",
);

assert.doesNotMatch(
  loader,
  /if\s*\(\s*key\s*===\s*MODULE_KEY\s*\)\s*\{\s*loadQuoteRuntime\(/,
);
assert.match(
  loader,
  /function loadQuoteRuntimeAfterPaint\(\)[\s\S]*requestAnimationFrame\([\s\S]*requestAnimationFrame\([\s\S]*loadQuoteRuntime\(\)/,
);
assert.match(
  loader,
  /forge:saas-module-opened[\s\S]*loadQuoteRuntimeAfterPaint\(\)/,
);
assert.match(loader, /if \(quoteRuntimePromise\) return quoteRuntimePromise/);
assert.match(router, /FORGE_ROUTE_VISUALLY_READY/);
assert.match(router, /__FORGE_PERF_REPORT__/);
assert.match(router, /__FORGE_START_PERF_CAPTURE__/);
assert.match(router, /__FORGE_STOP_PERF_CAPTURE__/);
assert.match(router, /EVENT_BUFFER_MAX = 30/);
assert.match(router, /LONG_TASK_BUFFER_MAX = 50/);
assert.doesNotMatch(router, /data-forge-perf-copy/);
assert.doesNotMatch(cleanup, /setInterval/);
assert.doesNotMatch(cleanup, /new MutationObserver/);
assert.doesNotMatch(orbRemoval, /new MutationObserver/);
assert.match(router, /observer\.disconnect\(\)/);
assert.match(router, /removeEventListener\(type, listener, options\)/);
assert.match(parser, /Promise\.all\(\[\s*loadPdfJs107z15p2R11E\(\)/);
assert.match(parser, /preloadPdfJsRuntime107z15p2R11E/);
assert.doesNotMatch(parser, /disableWorker\s*:\s*true/);

console.log("PASS route runtime non-blocking and PDF.js memoization contract");
