import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const source = path => readFile(resolve(root, path), "utf8");

test("R4 adds exactly optional lineage to existing 030C PaymentEvent without repurposing payment evidence", async () => {
  const sql = await source("supabase/migrations/20260812000100_cartera030c_recommendation_decision_lineage_017e.sql");
  assert.match(sql, /add column recommendation_decision_reference text/);
  assert.match(sql, /recommendation_decision_reference is null/);
  assert.match(sql, /DECISION_NOT_ACCEPTED/);
  assert.match(sql, /recommendation_action_addressable/);
  assert.match(sql, /PAYMENT_OBLIGATION/);
  assert.match(sql, /CONFIRM_PAYMENT/);
  assert.match(sql, /CROSS_ADVISOR_DECISION_REFERENCE/);
  assert.match(sql, /DECISION_AFTER_ACTION/);
  assert.match(sql, /HISTORICAL_OR_ALREADY_WRITTEN_ACTION_NOT_RETROACTIVELY_LINKED/);
  assert.doesNotMatch(sql, /foreign key\s*\([^)]*recommendation_decision_reference/is);
  assert.doesNotMatch(sql, /update\s+public\.cartera030c_confirmed_payment_events/is);
  assert.doesNotMatch(sql, /evidence_references\s*=\s*.*recommendation_decision/is);
});

test("R4 command remains backward compatible and only transports lineage for exact accepted Cartera context", async () => {
  const service = await source("advisor-os/cartera/cartera-030c-confirmed-payment-reconciliation-service.js");
  const payment = await source("docs/static-preview/forge-aura/cartera/cartera-payment-aura-011c.js");
  assert.match(service, /recommendationDecisionReference/);
  assert.match(service, /\.\.\.\(recommendationDecisionReference \? \{ recommendationDecisionReference, paymentObligationReference \} : \{\}\)/);
  assert.match(payment, /lineage\.decision !== 'ACCEPTED'/);
  assert.match(payment, /lineage\.subjectType !== 'POLICY'/);
  assert.match(payment, /lineage\.actionOwner !== 'CARTERA_030C'/);
  assert.match(payment, /lineage\.actionTarget !== obligationReference/);
  assert.match(payment, /lineageReadAfterWriteVerified/);
});

test("R4 individual Cartera pilot is exact UNCONFIRMED_PAYMENT_EVIDENCE and reuses shared 017C/017E evidence controls", async () => {
  const enhancement = await source("advisor-os/cartera/cartera-050d-future-radar-enhancement.js");
  const view = await source("platform/portfolio-intelligence/cartera-050d-future-radar-view.js");
  assert.match(enhancement, /platform\/event-evidence\/recommendation-decision-control-017c\.js/);
  assert.match(enhancement, /platform\/event-evidence\/recommendation-presentation-control-017e\.js/);
  assert.doesNotMatch(enhancement, /docs\/static-preview/);
  assert.match(enhancement, /UNCONFIRMED_PAYMENT_EVIDENCE/);
  assert.match(enhancement, /sourceAuthority === 'PAYMENT_OBLIGATION'/);
  assert.match(enhancement, /actionOwner: 'CARTERA_030C'/);
  assert.match(enhancement, /type: 'PAYMENT_OBLIGATION'/);
  assert.match(enhancement, /expectedAction: 'CONFIRM_PAYMENT'/);
  assert.match(view, /data-radar-decision="ACCEPT"/);
  assert.match(view, /data-open-policy/);
});

test("R4 keeps MODIFY as decision evidence but excludes it from action-lineage transport", async () => {
  const session = await source("platform/event-evidence/recommendation-lineage-session-017e.js");
  const generic = await source("platform/event-evidence/recommendation-decision-action-lineage.js");
  const readModel = await source("platform/business-intelligence/commercial-leverage-pilot-read-model.js");
  assert.match(session, /decision !== "ACCEPTED"/);
  assert.match(generic, /token\(context\.decision\) !== "ACCEPTED"/);
  assert.match(readModel, /MODIFIED_NOT_ACTION_LINEAGE_ELIGIBLE/);
  assert.match(readModel, /ACTION_AFTER_ACCEPT_RATE/);
});

test("Cartera Pages runtime can dependency-close shared evidence controls without importing docs", async () => {
  const builder = await source("scripts/build-advisor-presentation-pages-runtime-base.mjs");
  const decision = await source("platform/event-evidence/recommendation-decision-control-017c.js");
  const presentation = await source("platform/event-evidence/recommendation-presentation-control-017e.js");
  assert.match(builder, /CARTERA_PAGES_RUNTIME_IMPORT_OUTSIDE_SOURCE/);
  assert.match(decision, /import '\.\/sales-nba-advisor-response-evidence\.js'/);
  assert.match(presentation, /import '\.\/recommendation-presentation-evidence\.js'/);
});
