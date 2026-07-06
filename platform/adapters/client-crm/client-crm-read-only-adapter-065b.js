"use strict";

const ADAPTER_ID = "forge.client_crm.read_only.adapter.v1";
const ROUTES = Object.freeze({
  list: "forge.api.read.client_crm.list.v1",
  detail: "forge.api.read.client_crm.detail.v1"
});

const FIXTURE_CLIENTS = Object.freeze([
  Object.freeze({
    entityType: "client",
    entityId: "client_preview_lariza",
    displayName: "Lariza",
    status: "active_preview",
    segment: "seguimiento_en_riesgo",
    ownerId: "owner_static_preview",
    ownerName: "Alfred",
    contactReadiness: "needs_followup",
    lastInteractionAt: "2026-07-06T00:00:00-06:00",
    followupRisk: "high",
    policyRefs: Object.freeze(["policy_preview_gmm_lariza"]),
    opportunityRefs: Object.freeze(["opp_preview_lariza_review"]),
    sourceEvidence: Object.freeze(["065B local static fixture"]),
    freshness: Object.freeze({ status: "preview_static" })
  }),
  Object.freeze({
    entityType: "client",
    entityId: "client_preview_octavio",
    displayName: "Octavio",
    status: "active_preview",
    segment: "registro_preview",
    ownerId: "owner_static_preview",
    ownerName: "Alfred",
    contactReadiness: "preview_only",
    lastInteractionAt: "2026-07-06T00:00:00-06:00",
    followupRisk: "low",
    policyRefs: Object.freeze([]),
    opportunityRefs: Object.freeze(["opp_preview_octavio_open"]),
    sourceEvidence: Object.freeze(["065B local static fixture"]),
    freshness: Object.freeze({ status: "preview_static" })
  })
]);

const FORBIDDEN_EFFECTS = Object.freeze([
  "client_create",
  "client_update",
  "client_delete",
  "client_merge",
  "task_create",
  "calendar_create",
  "message_send",
  "quote_create",
  "policy_update",
  "provider_call",
  "browser_persistence",
  "action_execution"
]);

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function nowIso(context) {
  return context && context.generatedAt ? context.generatedAt : "2026-07-06T00:00:00-06:00";
}

function makeAuditEvent(routeId, generatedAt) {
  return {
    auditEventId: `audit_065b_${routeId.replace(/[^a-z0-9]+/gi, "_").toLowerCase()}`,
    eventType: "read_model_used",
    domainId: "client_crm",
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
    readModelId: `forge.client_crm.read_model.${routeId.endsWith(".detail.v1") ? "detail" : "list"}.065b`,
    schemaVersion: "forge.backend.read_model.v1",
    domainId: "client_crm",
    sourceOfTruth: "local_static_fixture_only",
    sourceEvidence: ["platform/adapters/client-crm/client-crm-read-only-adapter-065b.js"],
    generatedAt,
    freshness: { status: "preview_static" },
    capabilities: ["client.read.preview", "client.read.summary", "client.read.detail"],
    approvalContext: {
      requiresApproval: false,
      reason: "read_only_no_effect"
    },
    entities,
    relationships: [],
    metrics: {
      recordsReturned: entities.length
    },
    emptyState,
    errors,
    blockedEffects: clone(FORBIDDEN_EFFECTS),
    audit: {
      auditEventId: auditEvent.auditEventId,
      eventType: auditEvent.eventType
    },
    uiProjection: {
      title: entities.length === 1 ? entities[0].displayName : "Clientes",
      subtitle: "Client CRM read-only preview fixture"
    },
    safety: {
      crmWrite: false,
      calendarCreate: false,
      messageSend: false,
      authReal: false,
      providerRuntime: false,
      browserPersistence: false,
      realEngineExecution: false,
      realEffectsAllowed: false
    },
    auditEvent
  };
}

function listClients(options = {}) {
  const generatedAt = nowIso(options);
  return makeReadEnvelope({
    routeId: ROUTES.list,
    entities: clone(FIXTURE_CLIENTS),
    generatedAt
  });
}

function getClientDetail(clientId, options = {}) {
  const generatedAt = nowIso(options);
  const client = FIXTURE_CLIENTS.find((item) => item.entityId === clientId);

  if (!client) {
    return makeReadEnvelope({
      routeId: ROUTES.detail,
      entities: [],
      generatedAt,
      emptyState: {
        reason: "filter_no_match",
        message: "No client matched the requested preview fixture id."
      },
      errors: [
        {
          code: "CLIENT_CRM_NOT_MODELED",
          safeMessage: "Client is not modeled in the local read-only fixture.",
          recoverable: true
        }
      ]
    });
  }

  return makeReadEnvelope({
    routeId: ROUTES.detail,
    entities: [clone(client)],
    generatedAt
  });
}

function getAdapterManifest() {
  return {
    adapterId: ADAPTER_ID,
    adapterType: "local_static_fixture",
    adapterMode: "read_only",
    routeClass: "read_only",
    domainId: "client_crm",
    routes: clone(ROUTES),
    forbiddenEffects: clone(FORBIDDEN_EFFECTS),
    providerRuntime: false,
    secretAccess: false,
    realEffectsAllowed: false
  };
}

module.exports = {
  ADAPTER_ID,
  ROUTES,
  getAdapterManifest,
  listClients,
  getClientDetail
};
