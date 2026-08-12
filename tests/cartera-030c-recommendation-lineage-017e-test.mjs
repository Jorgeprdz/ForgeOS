import test from "node:test";
import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const { projectCartera030cPaymentAction } = require("../platform/business-intelligence/cartera-030c-commercial-action-adapter-017e.js");
const { summarizeCommercialPilotEvidence } = require("../platform/business-intelligence/commercial-leverage-pilot-read-model.js");
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
  assert.match(sql, /CARTERA030C_PAYMENT_EVENT_READ_AFTER_WRITE_FAILED/);
  assert.match(sql, /CARTERA030C_PAYMENT_EVENT_READ_AFTER_WRITE_MISMATCH/);
  assert.match(sql, /paymentEventReadAfterWriteVerified', true/);
  assert.doesNotMatch(sql, /foreign key\s*\([^)]*recommendation_decision_reference/is);
  assert.doesNotMatch(sql, /update\s+public\.cartera030c_confirmed_payment_events/is);
  assert.doesNotMatch(sql, /evidence_references\s*=\s*.*recommendation_decision/is);
});

test("R4 command requires server-verified PaymentEvent read-after-write before client success", async () => {
  const service = await source("advisor-os/cartera/cartera-030c-confirmed-payment-reconciliation-service.js");
  const payment = await source("docs/static-preview/forge-aura/cartera/cartera-payment-aura-011c.js");
  assert.match(service, /recommendationDecisionReference/);
  assert.match(service, /\.\.\.\(recommendationDecisionReference \? \{ recommendationDecisionReference, paymentObligationReference \} : \{\}\)/);
  assert.match(payment, /lineage\.decision !== 'ACCEPTED'/);
  assert.match(payment, /lineage\.subjectType !== 'POLICY'/);
  assert.match(payment, /lineage\.actionOwner !== 'CARTERA_030C'/);
  assert.match(payment, /lineage\.actionTarget !== obligationReference/);
  assert.match(payment, /result\.data\.paymentEventReadAfterWriteVerified === true/);
  assert.match(payment, /result\.data\.paymentEvidenceReference\) === paymentEvidenceReference/);
  assert.match(payment, /CARTERA030C_PAYMENT_EVENT_READ_AFTER_WRITE_FAILED/);
  assert.match(payment, /recommendationActionTargetReference === obligationReference/);
});

test("verified 030C PaymentEvent projects into the existing commercial reconciler as EXPLICIT_LINEAGE", () => {
  const advisorId = "advisor-017e";
  const decisionEventId = "evt_1234567890abcdef1234567890abcdef";
  const recommendationReference = "signal-017e";
  const window = { from: "2026-08-12T00:00:00.000Z", to: "2026-08-13T00:00:00.000Z" };
  const presentation = {
    event_id: "evt_aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
    event_type: "RECOMMENDATION_PRESENTED",
    tenant_id: advisorId,
    subject: { type: "RECOMMENDATION", id: recommendationReference },
    source: { type: "SYSTEM_OBSERVED" },
    evidence_strength: "SYSTEM_OBSERVED",
    confirmation_state: "CONFIRMED",
    occurred_at: "2026-08-12T12:00:00.000Z",
    recorded_at: "2026-08-12T12:00:00.000Z",
    idempotency_key: "presentation:signal-017e",
    payload: { advisor_reference: advisorId, recommendation_reference: recommendationReference, recommendation_version: recommendationReference },
  };
  const decision = {
    event_id: decisionEventId,
    event_type: "SALES_NBA_ADVISOR_RESPONSE",
    tenant_id: advisorId,
    occurred_at: "2026-08-12T12:05:00.000Z",
    recorded_at: "2026-08-12T12:05:00.000Z",
    payload: {
      advisor_reference: advisorId,
      recommendation_reference: recommendationReference,
      recommendation_version: recommendationReference,
      decision: "ACCEPTED",
      recommendation_action_addressable: true,
      policy_reference: "POLICY-017E",
      payment_obligation_reference: "OBLIGATION-017E",
      action_owner: "CARTERA_030C",
      action_target_reference: "OBLIGATION-017E",
      expected_action: "CONFIRM_PAYMENT",
    },
  };
  const action = projectCartera030cPaymentAction({
    advisorId,
    response: {
      paymentEventReadAfterWriteVerified: true,
      paymentEventReference: "PAYMENT_EVENT:017e",
      policyReference: "POLICY-017E",
      paymentEvidenceReference: "EVIDENCE-017E",
      paymentEventConfirmedAt: "2026-08-12T12:10:00.000Z",
      recommendationDecisionReference: decisionEventId,
      recommendationLineageState: "EXPLICIT_LINEAGE",
      recommendationActionTargetReference: "OBLIGATION-017E",
    },
  });
  const summary = summarizeCommercialPilotEvidence({
    advisorId,
    observationWindow: window,
    presentationEvents: [presentation],
    decisionEvents: [decision],
    actionEvents: [action],
    funnelModel: null,
  });
  assert.equal(action.action_owner, "CARTERA_030C");
  assert.equal(action.canonical_activity_event, false);
  assert.equal(action.payload.payment_evidence_reference, "EVIDENCE-017E");
  assert.equal(action.payload.recommendation_decision_reference, decisionEventId);
  assert.equal(summary.actionLinkageEligibleAcceptedCount.value, 1);
  assert.equal(summary.explicitlyLinkedActionCount.value, 1);
  assert.equal(summary.actionAfterAcceptRate.value, 1);
  assert.equal(summary.correlations.decisionToAction[0].state, "EXPLICIT_LINEAGE");
  assert.equal(summary.causalAttribution, false);
});

test("unverified or internally inconsistent 030C responses cannot become commercial action lineage", () => {
  assert.throws(() => projectCartera030cPaymentAction({ advisorId: "advisor-017e", response: { paymentEventReadAfterWriteVerified: false } }), /CARTERA030C_ACTION_PERSISTENCE_NOT_VERIFIED/);
  assert.throws(() => projectCartera030cPaymentAction({
    advisorId: "advisor-017e",
    response: {
      paymentEventReadAfterWriteVerified: true,
      paymentEventReference: "PAYMENT_EVENT:017e",
      policyReference: "POLICY-017E",
      paymentEvidenceReference: "EVIDENCE-017E",
      paymentEventConfirmedAt: "2026-08-12T12:10:00.000Z",
      recommendationDecisionReference: "evt_1234567890abcdef1234567890abcdef",
      recommendationLineageState: "UNRESOLVED",
      recommendationActionTargetReference: "OBLIGATION-017E",
    },
  }), /CARTERA030C_ACTION_LINEAGE_STATE_INCONSISTENT/);
});

test("R4 individual Cartera pilot has one shared exact action-addressability authority", async () => {
  const enhancement = await source("advisor-os/cartera/cartera-050d-future-radar-enhancement.js");
  const authority = await source("platform/portfolio-intelligence/cartera-050e-actionable-payment-recommendation-017e.js");
  const view = await source("platform/portfolio-intelligence/cartera-050d-future-radar-view.js");
  assert.match(enhancement, /cartera-050e-actionable-payment-recommendation-017e\.js/);
  assert.match(enhancement, /isCartera017eActionablePaymentRecommendation/);
  assert.match(enhancement, /toCartera017eActionablePaymentRecommendation/);
  assert.match(enhancement, /platform\/event-evidence\/recommendation-decision-control-017c\.js/);
  assert.match(enhancement, /platform\/event-evidence\/recommendation-presentation-control-017e\.js/);
  assert.doesNotMatch(enhancement, /docs\/static-preview/);
  assert.doesNotMatch(enhancement, /function eligiblePaymentRecommendation/);
  assert.match(authority, /UNCONFIRMED_PAYMENT_EVIDENCE/);
  assert.match(authority, /PAYMENT_OBLIGATION/);
  assert.match(authority, /CARTERA_030C/);
  assert.match(authority, /CONFIRM_PAYMENT/);
  assert.match(authority, /Revisar la evidencia y confirmar o rechazar el pago\./);
  assert.match(view, /data-radar-decision="ACCEPT"/);
  assert.match(view, /data-open-policy/);
});

test("Aura Cartera mounts the exact R4 individual recommendation without replacing existing Cartera authority", async () => {
  const index = await source("docs/static-preview/forge-aura/index.html");
  const wrapper = await source("docs/static-preview/forge-aura/cartera/cartera-module-v13-017e.js");
  const auraRadar = await source("docs/static-preview/forge-aura/cartera/cartera-future-radar-017e.js");
  assert.match(index, /cartera-module-v13-017e\.js\?v=forge-commercial-pilot-evidence-017e-r4/);
  assert.match(wrapper, /cartera-module-v12-015\.js/);
  assert.match(wrapper, /createAuraCarteraFutureRadar017e/);
  assert.match(auraRadar, /cartera-050e-actionable-payment-recommendation-017e\.js/);
  assert.match(auraRadar, /forge_cartera050_list_future_radar/);
  assert.match(auraRadar, /createAuraDecisionControl/);
  assert.match(auraRadar, /createAuraPresentationEvidenceControl/);
  assert.match(auraRadar, /setRecommendationDecisionLineage/);
  assert.match(auraRadar, /event\?\.payload\?\.decision !== 'ACCEPTED'/);
  assert.match(auraRadar, /canonicalRow\.click\(\)/);
  assert.doesNotMatch(auraRadar, /create table|insert into|update public\./i);
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

test("Cartera Pages runtime can dependency-close shared evidence controls and R4 portfolio UI authorities", async () => {
  const baseBuilder = await source("scripts/build-advisor-presentation-pages-runtime-base.mjs");
  const pageBuilder = await source("scripts/build-advisor-presentation-pages-runtime.mjs");
  const decision = await source("platform/event-evidence/recommendation-decision-control-017c.js");
  const presentation = await source("platform/event-evidence/recommendation-presentation-control-017e.js");
  assert.match(baseBuilder, /CARTERA_PAGES_RUNTIME_IMPORT_OUTSIDE_SOURCE/);
  assert.match(pageBuilder, /cartera-050d-future-radar-view\.js/);
  assert.match(pageBuilder, /cartera-050e-actionable-payment-recommendation-017e\.js/);
  assert.match(decision, /import '\.\/sales-nba-advisor-response-evidence\.js'/);
  assert.match(presentation, /import '\.\/recommendation-presentation-evidence\.js'/);
});
