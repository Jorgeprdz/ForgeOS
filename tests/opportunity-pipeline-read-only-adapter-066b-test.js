"use strict";

const assert = require("assert");
const {
  ADAPTER_ID,
  ROUTES,
  getAdapterManifest,
  listOpportunities,
  getOpportunityDetail
} = require("../platform/adapters/opportunity-pipeline/opportunity-pipeline-read-only-adapter-066b");

function assertNoEffects(envelope) {
  assert.strictEqual(envelope.safety.crmWrite, false);
  assert.strictEqual(envelope.safety.pipelineWrite, false);
  assert.strictEqual(envelope.safety.taskCreate, false);
  assert.strictEqual(envelope.safety.calendarCreate, false);
  assert.strictEqual(envelope.safety.messageSend, false);
  assert.strictEqual(envelope.safety.authReal, false);
  assert.strictEqual(envelope.safety.providerRuntime, false);
  assert.strictEqual(envelope.safety.secretAccess, false);
  assert.strictEqual(envelope.safety.browserPersistence, false);
  assert.strictEqual(envelope.safety.realEngineExecution, false);
  assert.strictEqual(envelope.safety.realEffectsAllowed, false);
  assert.ok(envelope.blockedEffects.includes("opportunity_stage_mutation"));
  assert.ok(envelope.blockedEffects.includes("provider_call"));
}

const manifest = getAdapterManifest();
assert.strictEqual(manifest.adapterId, ADAPTER_ID);
assert.strictEqual(manifest.adapterMode, "read_only");
assert.strictEqual(manifest.routeClass, "read_only");
assert.strictEqual(manifest.domainId, "opportunity_pipeline");
assert.strictEqual(manifest.providerRuntime, false);
assert.strictEqual(manifest.secretAccess, false);
assert.strictEqual(manifest.realEffectsAllowed, false);

const list = listOpportunities();
assert.strictEqual(list.schemaVersion, "forge.backend.read_model.v1");
assert.strictEqual(list.domainId, "opportunity_pipeline");
assert.strictEqual(list.sourceOfTruth, "local_static_fixture_only");
assert.strictEqual(list.freshness.status, "preview_static");
assert.strictEqual(list.auditEvent.routeId, ROUTES.list);
assert.strictEqual(list.auditEvent.eventType, "read_model_used");
assert.strictEqual(list.entities.length, 2);
assert.strictEqual(list.metrics.highPriorityCount, 1);
assertNoEffects(list);

const detail = getOpportunityDetail("opp_preview_lariza_review");
assert.strictEqual(detail.entities.length, 1);
assert.strictEqual(detail.entities[0].clientRef.entityId, "client_preview_lariza");
assert.strictEqual(detail.entities[0].priority, "high");
assert.strictEqual(detail.auditEvent.routeId, ROUTES.detail);
assertNoEffects(detail);

const missing = getOpportunityDetail("missing_opportunity");
assert.strictEqual(missing.entities.length, 0);
assert.strictEqual(missing.emptyState.reason, "filter_no_match");
assert.strictEqual(missing.errors[0].code, "OPPORTUNITY_PIPELINE_NOT_MODELED");
assertNoEffects(missing);

console.log("PASS opportunity pipeline read-only adapter 066B");
