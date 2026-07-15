import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const page = await readFile(
  new URL(
    "../docs/static-preview/forge-alive/index.html",
    import.meta.url,
  ),
  "utf8",
);
const ui = await readFile(
  new URL(
    "../docs/static-preview/quote-preview-live/forge-quote-intake-ui-simplification-r16j1c1.js",
    import.meta.url,
  ),
  "utf8",
);
const css = await readFile(
  new URL(
    "../docs/static-preview/quote-preview-live/forge-quote-intake-ui-simplification-r16j1c1.css",
    import.meta.url,
  ),
  "utf8",
);

assert.match(
  page,
  /forge-quote-intake-ui-simplification-r16j1c1\.css\?v=r16j1c1-intake-beta-review-ui-20260715-1/,
);
assert.match(
  page,
  /forge-quote-intake-ui-simplification-r16j1c1\.js\?v=r16j1c1-intake-beta-review-ui-20260715-1/,
);

for (const token of [
  'textContent = "Beta"',
  'data-forge-beta-pill-r16j1c1',
  'data-forge-intake-noise-card-r16j1c1',
  'data-forge-review-inline-r16j1c1',
  'Revisar PDF',
  'forge:accepted-quote-packet-ready',
  'forge:quote-acceptance-state',
  'ForgeQuoteAcceptanceEntrypointR16J0A',
  'ForgeQuoteIntakeUiR16J1C1',
  'automaticCalculation: false',
  'automaticAcceptance: false',
]) {
  assert.ok(ui.includes(token), `UI missing ${token}`);
}

assert.match(
  ui,
  /button\[data-forge-confirm-quote-r16j0a="true"\]/,
);
assert.doesNotMatch(
  ui,
  /createElement\(["']button["']\)/,
  "must reuse the existing review action instead of adding a duplicate button",
);
assert.match(ui, /noiseCard\.hidden = true/);
assert.match(ui, /wrapper\.hidden = !visible/);
assert.match(ui, /VISIBLE_STATES\.has\(state\)/);

for (const token of [
  'min-height: 44px',
  'max-width: 100%',
  'min-width: 0',
  'min-height: 52px',
  ':focus-visible',
  '[hidden]',
]) {
  assert.ok(css.includes(token), `CSS missing ${token}`);
}

console.log("PASS R16J1C1 quote intake beta and review UI contract", {
  developmentNoiseReplacedByBetaPill: true,
  existingReviewActionReused: true,
  duplicateReviewButton: false,
  reviewLabel: "Revisar PDF",
  reviewHiddenBeforeReady: true,
  automaticCalculation: false,
  automaticAcceptance: false,
});
