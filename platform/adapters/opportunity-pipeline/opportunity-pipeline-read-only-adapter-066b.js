"use strict";

const ADAPTER_ID = "forge.opportunity_pipeline.read_only.adapter.v1";
const ROUTES = Object.freeze({
  list: "forge.api.read.opportunity_pipeline.list.v1",
  detail: "forge.api.read.opportunity_pipeline.detail.v1"
});

const FIXTURE_OPPORTUNITIES = Object.freeze([
  Object.freeze({
    entityType: "opportunity",
    entityId: "opp_preview_lariza_review",
    displayName: "Lariza - revision GMM",
    clientRef: Object.freeze({ entityType: "client", entityId: "client_preview_lariza", displayName: "Lariza" }),
    stage: "followup_review",
    status: "open_preview",
    priority: "high",
    expectedValuePreview: { currency: "MXN", amount: 0, mode: "preview_placeholder" },
    probability: "medium",
    nextAction: "review_pending_quote_context",
    followupDueState: "due_now",
    riskFlags: Object.freeze(["followup_cooling", "quote_context_needed"]),
    policySummaryRefs: Object.freeze(["policy_preview_gmm_lariza"]),
    quoteSummaryRefs: Object.freeze(["quote_preview_lariza_pending"]),
    sourceEvidence: Object.freeze(["066B local static fixture"]),
    freshness: Object.freeze({ status: "preview_static" })
  }),
  Object.freeze({
    entityType: "opportunity",
    entityId: "opp_preview_octavio_open",
    displayName: "Octavio - apertura de oportunidad",
    clientRef: Object.freeze({ entityType: "client", entityId: "client_preview_octavio", displayName: "Octavio" }),
    stage: "initial_contact",
    status: "open_preview",
    priority: "normal",
    expectedValuePreview: { currency: "MXN", amount: 0, mode: "preview_placeholder" },
    probability: "early",
    nextAction: "confirm_need_and_timing",
    followupDueState: "scheduled_preview",
    riskFlags: Object.freeze([]),
    policySummaryRefs: Object.freeze([]),
    quoteSummaryRefs: Object.freeze([]),
    sourceEvidence: Object.freeze(["066B local static fixture"]),
    freshness: Object.freeze({ status: "preview_static" })
  })
]);

const FORBIDDEN_EFFECTS = Object.freeze([
  "opportunity_create",
  "opportunity_update",
  "opportunity_delete",
  "opportunity_merge",
  "opportunity_stage_mutation",
  "task_create",
  "calendar_create",
  "message_send",
  "quote_create",
  "policy_update",
  "provider_call",
  "secret_access",
  "browser_persistence",
  "action_execution",
  "real_engine_execution"
]);

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function nowIso(context) {
  return context && context.generatedAt ? context.generatedAt : "2026-07-06T00:00:00-06:00";
}

function makeAuditEvent(routeId, generatedAt) {
  return {
    auditEventId: `audit_066b_${routeId.replace(/[^a-z0-9]+/gi, "_").toLowerCase()}`,
    eventType: "read_model_used",
    domainId: "opportunity_pipeline",
    routeId,
    adapterId: ADAPTER_ID,
    realEffectsAllowed: false,
    providerRuntime: false,
    createdAt: generatedAt
  };
}

function makeReadEnvelope({ routeId, entities, generatedAt, emptyState = null, errors = [] }) {
  const auditEvent = makeAuditEvent(routeId, generatedAt);
  return {
    readModelId: `forge.opportunity_pipeline.read_model.${routeId.endsWith(".detail.v1") ? "detail" : "list"}.066b`,
    schemaVersion: "forge.backend.read_model.v1",
    domainId: "opportunity_pipeline",
    sourceOfTruth: "local_static_fixture_only",
    sourceEvidence: ["platform/adapters/opportunity-pipeline/opportunity-pipeline-read-only-adapter-066b.js"],
    generatedAt,
    freshness: { status: "preview_static" },
    capabilities: ["opportunity.read.preview", "opportunity.read.summary", "opportunity.read.detail"],
    approvalContext: { requiresApproval: false, reason: "read_only_no_effect" },
    entities,
    relationships: entities.map((entity) => ({
      relationshipType: "opportunity_client",
      fromEntityId: entity.entityId,
      toEntityId: entity.clientRef.entityId
    })),
    metrics: {
      recordsReturned: entities.length,
      highPriorityCount: entities.filter((entity) => entity.priority === "high").length
    },
    emptyState,
    errors,
    blockedEffects: clone(FORBIDDEN_EFFECTS),
    audit: { auditEventId: auditEvent.auditEventId, eventType: auditEvent.eventType },
    uiProjection: {
      title: entities.length === 1 ? entities[0].displayName : "Opportunity Pipeline",
      subtitle: "Opportunity Pipeline read-only preview fixture"
    },
    safety: {
      crmWrite: false,
      pipelineWrite: false,
      taskCreate: false,
      calendarCreate: false,
      messageSend: false,
      authReal: false,
      providerRuntime: false,
      secretAccess: false,
      browserPersistence: false,
      realEngineExecution: false,
      realEffectsAllowed: false
    },
    auditEvent
  };
}

function listOpportunities(options = {}) {
  return makeReadEnvelope({
    routeId: ROUTES.list,
    entities: clone(FIXTURE_OPPORTUNITIES),
    generatedAt: nowIso(options)
  });
}

function getOpportunityDetail(opportunityId, options = {}) {
  const generatedAt = nowIso(options);
  const opportunity = FIXTURE_OPPORTUNITIES.find((item) => item.entityId === opportunityId);
  if (!opportunity) {
    return makeReadEnvelope({
      routeId: ROUTES.detail,
      entities: [],
      generatedAt,
      emptyState: { reason: "filter_no_match", message: "No opportunity matched the requested preview fixture id." },
      errors: [{ code: "OPPORTUNITY_PIPELINE_NOT_MODELED", safeMessage: "Opportunity is not modeled in the local read-only fixture.", recoverable: true }]
    });
  }
  return makeReadEnvelope({ routeId: ROUTES.detail, entities: [clone(opportunity)], generatedAt });
}

function getAdapterManifest() {
  return {
    adapterId: ADAPTER_ID,
    adapterType: "local_static_fixture",
    adapterMode: "read_only",
    routeClass: "read_only",
    domainId: "opportunity_pipeline",
    routes: clone(ROUTES),
    forbiddenEffects: clone(FORBIDDEN_EFFECTS),
    providerRuntime: false,
    secretAccess: false,
    realEffectsAllowed: false
  };
}

module.exports = { ADAPTER_ID, ROUTES, getAdapterManifest, listOpportunities, getOpportunityDetail };
