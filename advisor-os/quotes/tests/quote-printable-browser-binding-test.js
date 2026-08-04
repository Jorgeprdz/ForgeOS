import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const root = new URL("../../../", import.meta.url);
const read = (path) =>
  readFileSync(new URL(path, root), "utf8");
const pass = (number, message) =>
  console.log(`PASS ${number} - ${message}`);

const entry = read(
  "docs/static-preview/quote-printable-entry/forge-quote-printable-entrypoint-qpd06.js",
);
const css = read(
  "docs/static-preview/quote-printable-entry/forge-quote-printable-entrypoint-qpd06.css",
);
const boundary = read(
  "docs/static-preview/quote-preview-live/forge-accepted-quote-review-snapshot.js",
);
const controller = read(
  "docs/static-preview/quote-printable-runtime/forge-quote-printable-route-controller.js",
);

for (const name of [
  "quote-printable-read-model.js",
  "quote-printable-document-composer.js",
  "quote-printable-pdf-generator.js",
  "quote-printable-product-profile.js",
  "quote-printable-version-repository.js",
]) {
  assert.equal(
    read(`docs/static-preview/quote-printable-runtime/${name}`),
    read(`advisor-os/quotes/printable/${name}`),
    `${name} browser mirror diverged from canonical runtime`,
  );
}
pass(1, "browser-published QPD runtime mirrors are byte-identical to canonical sources");

assert.match(
  boundary,
  /import\(\s*"\.\.\/quote-printable-entry\/forge-quote-printable-entrypoint-qpd06\.js/,
);
assert.match(
  boundary,
  /\.\.\/quote-printable-entry\/forge-quote-printable-entrypoint-qpd06\.css/,
);
assert.doesNotMatch(boundary, /\.\.\/forge-alive\//);
assert.match(boundary, /bootQuotePrintableRouteQpd06\(\)/);
assert.match(boundary, /typeof document === "undefined"/);
pass(2, "accepted quote boundary lazy-loads QPD only from the neutral browser runtime");

for (const label of [
  "Ver versión imprimible",
  "Descargar PDF",
  "Historial",
  "Reabrir",
]) {
  assert.match(entry, new RegExp(label));
}
pass(3, "productive route exposes preview, PDF, history and reopen actions");

assert.match(entry, /getAcceptedQuoteReviewSnapshot/);
assert.match(entry, /forge:accepted-quote-confirmed/);
assert.doesNotMatch(entry, /forge:accepted-quote-confirmed[\s\S]{0,160}(previewCurrent|downloadCurrent)\(\)/);
pass(4, "quote confirmation enables actions without automatic preview or download");

assert.match(entry, /ForgeQuoteLifecycleBrowserBridgeCartera001B/);
assert.match(entry, /captureCurrentAcceptedQuote/);
assert.match(
  controller,
  /BLOCKED_DURABLE_QUOTE_IDENTITY_REQUIRED/,
);
assert.match(
  entry,
  /Para guardar historial, abre Cotizaciones[\s\S]*desde un Prospect/,
);
pass(5, "durable history is gated by canonical Cartera Quote identity");

assert.match(entry, /sandbox=""/);
assert.match(entry, /frame\.srcdoc = bundle\.printableDocument\.html/);
assert.doesNotMatch(entry, /allow-scripts|allow-same-origin/);
pass(6, "printable HTML is previewed in a sandboxed non-script iframe");

assert.match(controller, /userInitiated !== true/);
assert.match(entry, /userInitiated: true/);
assert.doesNotMatch(entry, /window\.print|\.print\(\)/);
pass(7, "real PDF download requires a human click and never invokes browser print");

assert.match(controller, /IDEMPOTENT_REPLAY/);
assert.match(controller, /bundle\.persistedRecord/);
assert.match(controller, /reopenQuotePrintableVersion/);
pass(8, "view, download and reopen preserve append-only idempotent version semantics");

assert.match(css, /margin-bottom:\s*calc\(6\.5rem \+ env\(safe-area-inset-bottom\)\)/);
assert.match(css, /padding-bottom:\s*calc\(1rem \+ env\(safe-area-inset-bottom\)\)/);
assert.match(css, /@media \(max-width: 720px\)/);
pass(9, "mobile layout reserves safe space above the floating navigation pill");

assert.match(entry, /role="dialog"/);
assert.match(entry, /aria-modal="true"/);
assert.match(entry, /aria-live="polite"/);
assert.match(entry, /event\.key === "Escape"/);
pass(10, "preview and history workspace include keyboard and screen-reader contracts");

for (const forbidden of [
  "automaticSendAllowed: true",
  "quoteMutationAllowed: true",
  "recalculationAllowed: true",
  "window.print",
  "crmMutation",
  "taskCreation",
  "calendarCreation",
]) {
  assert.equal(
    `${entry}\n${controller}`.includes(forbidden),
    false,
    `forbidden productive effect found: ${forbidden}`,
  );
}
pass(11, "productive binding introduces no send, CRM, task, calendar or recalculation effects");

assert.match(entry, /globalThis\.ForgeQuotePrintableEntrypointQPD06/);
assert.match(entry, /activatePreview: previewCurrent/);
assert.match(entry, /downloadCurrent/);
assert.match(entry, /showHistory/);
assert.match(entry, /getState/);
pass(12, "browser entrypoint publishes a diagnostic and testable authority surface");

console.log("STATUS=PASS_QPD06_BROWSER_BINDING");
console.log("Quote Printable Browser Binding PASS 12/12");
