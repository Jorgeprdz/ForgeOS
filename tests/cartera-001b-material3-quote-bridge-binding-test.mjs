import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const app = readFileSync(
  new URL("../docs/static-preview/forge-alive-material3/app.js", import.meta.url),
  "utf8",
);
const browserBridge = readFileSync(
  new URL(
    "../docs/static-preview/quote-runtime/forge-quote-lifecycle-browser-bridge-cartera001b.js",
    import.meta.url,
  ),
  "utf8",
);

test("Material 3 loads the bounded Quote lifecycle bridge", () => {
  assert.match(app, /forge-quote-lifecycle-browser-bridge-cartera001b\.js/);
  assert.match(browserBridge, /forge:accepted-quote-confirmed/);
  assert.match(browserBridge, /getAcceptedQuoteReviewSnapshot/);
});

test("unknown prospect blocks orphan Quote persistence", () => {
  assert.match(browserBridge, /BLOCKED_IDENTITY_REQUIRED/);
  assert.match(browserBridge, /PROSPECT_IDENTITY_REQUIRED/);
  assert.match(browserBridge, /orphanQuotePersistenceAllowed:\s*false/);
});

test("browser bridge preserves copilot boundaries", () => {
  assert.match(browserBridge, /automaticIdentityMerge:\s*false/);
  assert.match(browserBridge, /automaticProspectDecision:\s*false/);
  assert.match(browserBridge, /automaticApplicationCreation:\s*false/);
  assert.match(browserBridge, /automaticExternalEffects:\s*false/);
});
