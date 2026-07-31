import assert from "node:assert/strict";
import test from "node:test";
import { createRequire } from "node:module";
import { readFileSync } from "node:fs";

const require = createRequire(import.meta.url);
const projectionModule = require("../platform/event-evidence/prospect-quote-detail-projection.js");
const ui = require("../advisor-os/sales-pipeline/prospect-quote-detail-projection-ui.js");
const bootstrapSource = readFileSync(
  new URL("../advisor-os/sales-pipeline/productive-prospect-bootstrap.js", import.meta.url),
  "utf8",
);
const uiSource = readFileSync(
  new URL("../advisor-os/sales-pipeline/prospect-quote-detail-projection-ui.js", import.meta.url),
  "utf8",
);

const prospectReference = "11111111-1111-4111-8111-111111111111";
const row = {
  quote_reference: "quote:22222222-2222-4222-8222-222222222222",
  quote_version_reference: "quote-version:33333333-3333-4333-8333-333333333333",
  prospect_id: prospectReference,
  product_reference: "product:<orvi>",
  lifecycle_state: "PRESENTED",
  event_id: "quote-event:44444444-4444-4444-8444-444444444444",
  event_type: "QUOTE_PRESENTED",
  occurred_at: "2026-07-30T21:00:00.000Z",
  recorded_at: "2026-07-30T21:00:01.000Z",
  evidence_references: ["document:aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"],
  freshness_metadata: { status: "reviewed_current_session", source: "test" },
  confirmation_state: "CONFIRMED",
  contract_version: "CARTERA-001B.1",
};

test("UI renders a read-only Quote summary and minimized timeline", () => {
  const projection = projectionModule.createProspectQuoteDetailProjection({
    prospectReference,
    rows: [row],
  });
  const html = ui.renderProjection(projection);
  assert.match(html, /Cotizaciones/);
  assert.match(html, /Actividad de cotización/);
  assert.match(html, /Propuesta presentada/);
  assert.match(html, /data-source-authority="QUOTE_AUTHORITY"/);
  assert.match(html, /product:&lt;orvi&gt;/);
  assert.doesNotMatch(html, /premium|prima|coverage|cobertura|deductible|coinsurance/i);
  assert.doesNotMatch(html, /aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa/);
});

test("empty projection is explicit instead of inventing Quote state", () => {
  const projection = projectionModule.createProspectQuoteDetailProjection({
    prospectReference,
    rows: [],
  });
  const html = ui.renderProjection(projection);
  assert.match(html, /todavía no tiene cotizaciones vinculadas/);
  assert.doesNotMatch(html, /Activa|Aceptada|Presentada/);
});

test("bootstrap loads all 001C dependencies through the productive client authority", () => {
  assert.match(bootstrapSource, /quote-lifecycle-supabase-service\.js/);
  assert.match(bootstrapSource, /prospect-quote-detail-projection\.js/);
  assert.match(bootstrapSource, /prospect-quote-detail-projection-ui\.js/);
  assert.match(bootstrapSource, /ui\.bind\(\{client:activeClient,document:global\.document\}\)/);
  assert.match(bootstrapSource, /cartera001cState="READY"/);
});

test("detail binding is delegated and never creates automatic effects", () => {
  assert.match(uiSource, /\[data-open-prospect\]/);
  assert.match(uiSource, /listProspectQuoteHistory/);
  assert.match(uiSource, /automaticExternalEffects: false/);
  assert.match(uiSource, /quoteTruthDuplicated: false/);
  assert.doesNotMatch(uiSource, /insert\(|update\(|delete\(|appendLifecycleEvent\(|confirmReviewedQuote\(/);
});

test("UI error messages remain bounded and do not echo remote errors", () => {
  const html = ui.renderError({ code: "NETWORK_ERROR", message: "secret remote payload" });
  assert.match(html, /No pudimos consultar las cotizaciones/);
  assert.doesNotMatch(html, /secret remote payload/);
});
