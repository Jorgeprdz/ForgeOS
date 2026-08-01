import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const intake = await readFile(
  "docs/static-preview/forge-alive-material3/quote-runtime-intake-readiness-m05x001.js",
  "utf8",
);
const identity = await readFile(
  "docs/static-preview/forge-alive-material3/quote-runtime-client-identity-persistence-m05y001.js",
  "utf8",
);
const app = await readFile(
  "docs/static-preview/forge-alive-material3/app.js",
  "utf8",
);
const index = await readFile(
  "docs/static-preview/forge-alive-material3/index.html",
  "utf8",
);
const acceptance = await readFile(
  "tests/e2e/ui-m05p-real-vida-mujer-pdf.spec.mjs",
  "utf8",
);

assert.match(intake, /const VERSION = "M05X-001"/);
assert.match(intake, /input\.disabled = blocked/);
assert.match(intake, /aria-busy/);
assert.match(intake, /quoteIntakeReadiness = state\.ready \? "ready" : "preparing"/);
assert.match(intake, /function markReady\(\)/);
assert.match(intake, /forge:quote-intake-ready/);
assert.match(app, /quote-runtime-intake-readiness-m05x001\.js\?v=m05x-001/);
assert.match(app, /markPreparing\?\.\(\)/);
assert.match(app, /finally \{[\s\S]*markReady\?\.\(\)/);

const transferIndex = app.indexOf(
  "quote-runtime-client-identity-transfer-m05v001.js",
);
const persistenceIndex = app.indexOf(
  "quote-runtime-client-identity-persistence-m05y001.js",
);
const visualIndex = app.indexOf(
  "quote-runtime-vida-mujer-visual-m05e010.js",
);
assert.ok(transferIndex >= 0);
assert.ok(persistenceIndex > transferIndex);
assert.ok(visualIndex > persistenceIndex);
assert.match(
  app,
  /quote-runtime-client-identity-persistence-m05y001\.js\?v=m05y-002-single-m05z-instance/,
);

assert.match(identity, /const VERSION = "M05Y-001"/);
assert.match(identity, /"cliente vida mujer"/);
assert.match(identity, /setCurrentQuoteHumanReview/);
assert.match(identity, /ForgeQuotePrintableEntrypointQPD06\?\.refresh/);
assert.match(identity, /data-m05e005-client-input/);
assert.match(identity, /quote-runtime-printable-state-handoff-m05z001\.js\?v=m05z-002-single-instance/);
assert.match(index, /ui-m05x-quote-intake-ready-001/);
assert.match(acceptance, /data-quote-intake-readiness/);
assert.match(acceptance, /toBeEnabled/);
assert.match(acceptance, /suggestedFilename\(\)\)\.toMatch\(\/alejandra-moleres/i);

console.log("UI_M05X_QUOTE_INTAKE_READINESS=PASS");
