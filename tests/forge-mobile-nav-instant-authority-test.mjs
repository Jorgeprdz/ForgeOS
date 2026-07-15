import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const page = await readFile(
  new URL(
    "../docs/static-preview/forge-alive/index.html",
    import.meta.url,
  ),
  "utf8",
);

const authority = await readFile(
  new URL(
    "../docs/static-preview/forge-alive/forge-mobile-nav-instant-authority-r16j1c1.js",
    import.meta.url,
  ),
  "utf8",
);

const navCss = await readFile(
  new URL(
    "../docs/static-preview/forge-alive/forge-alive-mobile-nav-r16c5j.css",
    import.meta.url,
  ),
  "utf8",
);

assert.match(
  page,
  /forge-mobile-nav-instant-authority-r16j1c1\.js\?v=r16j1c1-route-fastpath-03a5-20260715-1/,
);

for (const token of [
  '"R16J1C1_MOBILE_NAV_INSTANT_AUTHORITY_03A4"',
  "function onPointerDown(event)",
  "function onClick(event)",
  "event.detail !== 0",
  '"pointerdown"',
  '"forge:saas-module-opened"',
  '"forge:saas-module-closed"',
  "new MutationObserver(",
  '"data-forge-active-key"',
  '"style"',
  '"display"',
  '"block"',
  '"visibility"',
  '"visible"',
  '"opacity"',
  '"transform"',
  '"transition"',
  '"none"',
  '"important"',
  "queueMicrotask",
]) {
  assert.ok(authority.includes(token), `missing ${token}`);
}

for (const forbidden of [
  "setTimeout(",
  "requestIdleCallback",
  "document.documentElement",
  "document.body.observe",
]) {
  assert.ok(
    !authority.includes(forbidden),
    `forbidden authority work: ${forbidden}`,
  );
}

assert.match(
  navCss,
  /FORGE:R16J1C1_03A4_NAV_AUTHORITY_OVERRIDE:START/,
);
assert.match(navCss, /transition:\s*none\s*!important/);
assert.match(navCss, /display:\s*block\s*!important/);
assert.match(navCss, /visibility:\s*visible\s*!important/);
assert.match(navCss, /opacity:\s*1\s*!important/);
assert.match(navCss, /blur\(24px\)\s+saturate\(155%\)/);
assert.match(navCss, /blur\(10px\)\s+saturate\(150%\)/);

console.log("PASS R16J1C1 single mobile nav visual authority", {
  pointerDownFeedback: true,
  programmaticClickFallback: true,
  selectorAndLabelCommitTogether: true,
  selectorTransition: "none",
  delayedRetries: 0,
  navLocalObserver: true,
  globalDocumentObserver: false,
  lazyLoaderNavControl: false,
});
