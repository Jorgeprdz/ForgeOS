# Forge Opportunity Pipeline Read-Only Adapter Scope 066A

Status: SCOPED

Date: 2026-07-06

Phase:
`066A_OPPORTUNITY_PIPELINE_READ_ONLY_ADAPTER_SCOPE`

Base:
`065D_CLIENT_CRM_READ_ONLY_ADAPTER_DECISION_LOCK`

## Purpose

066A scopes the Opportunity Pipeline read-only adapter after the Client CRM read-only adapter was implemented, QA-locked, and decision-locked.

This is a documentation/scope phase only. It does not implement code, connect a backend, call a CRM, mutate pipeline state, create tasks, create calendar records, send messages, access auth, access secrets, execute providers, mutate UI, persist browser data, or run a real engine.

## Adapter Identity

Adapter id:
`forge.opportunity_pipeline.read_only.adapter.v1`

Adapter mode:
`read_only`

Route class:
`read_only`

Domain:
`opportunity_pipeline`

First implementation constraint:
local static fixture, non-sensitive sample fixture, generated fixture, or read-only adapter mock only.

## Routes Scoped

- `forge.api.read.opportunity_pipeline.list.v1`
- `forge.api.read.opportunity_pipeline.detail.v1`

These routes may return modeled read envelopes only. They must not mutate opportunity stages, create opportunities, update opportunities, delete opportunities, create follow-up tasks, create calendar events, send communications, call providers, access secrets, or execute actions.

## Allowed Reads

The adapter may expose only modeled, non-sensitive, read-only summary/detail fields:

- `opportunity_id`
- `client_ref`
- `display_name`
- `stage`
- `status`
- `priority`
- `expected_value_preview`
- `probability`
- `next_action`
- `followup_due_state`
- `risk_flags`
- `policy_summary_refs`
- `quote_summary_refs`
- `source_evidence_ids`
- `freshness_metadata`

All values must be fixture-backed or read-model-backed in the first implementation.

## Forbidden Effects

The adapter must block:

- opportunity create;
- opportunity update;
- opportunity delete;
- opportunity merge;
- opportunity stage mutation;
- follow-up task creation;
- calendar creation;
- message send;
- quote creation;
- policy update;
- provider call;
- secret access;
- browser persistence;
- action execution;
- real engine execution.

## Read Model Shape

Each successful response must return a `forge.backend.read_model.v1` envelope with:

- `readModelId`
- `schemaVersion`
- `domainId`
- `sourceOfTruth`
- `sourceEvidence`
- `generatedAt`
- `freshness`
- `capabilities`
- `approvalContext`
- `entities`
- `relationships`
- `metrics`
- `emptyState`
- `errors`
- `blockedEffects`
- `audit`
- `uiProjection`

Entity rows should use:

- `entityType`
- `entityId`
- `displayName`
- `clientRef`
- `stage`
- `status`
- `priority`
- `expectedValuePreview`
- `probability`
- `nextAction`
- `followupDueState`
- `riskFlags`
- `sourceEvidence`
- `freshness`

## Empty State And Safe Errors

The first implementation must return safe empty states instead of throwing raw provider or storage errors.

Allowed empty reasons:

- `no_records`
- `not_connected`
- `permission_blocked`
- `source_unavailable`
- `filter_no_match`
- `not_modeled`
- `pending_sync`
- `preview_placeholder`

Scoped safe error codes:

- `OPPORTUNITY_PIPELINE_SOURCE_UNAVAILABLE`
- `OPPORTUNITY_PIPELINE_PERMISSION_BLOCKED`
- `OPPORTUNITY_PIPELINE_SCHEMA_MISMATCH`
- `OPPORTUNITY_PIPELINE_STALE_SOURCE`
- `OPPORTUNITY_PIPELINE_NOT_MODELED`
- `OPPORTUNITY_PIPELINE_UNSAFE_FIELD_BLOCKED`

## Capabilities

May grant:

- `opportunity.read.preview`
- `opportunity.read.summary`
- `opportunity.read.detail`

Must not grant:

- `opportunity.write`
- `opportunity.stage.update`
- `task.create`
- `calendar.create`
- `message.send`
- `quote.create`
- `policy.update`
- `provider.call`
- `secret.read`
- `action.execute`

## Audit Requirement

Every adapter read must produce an audit-shaped event:

- `eventType`: `read_model_used`
- `domainId`: `opportunity_pipeline`
- `adapterId`: `forge.opportunity_pipeline.read_only.adapter.v1`
- `routeClass`: `read_only`
- real effects disabled

## Safety Requirement

The first implementation must expose explicit safety flags and every flag must be false:

- CRM write;
- pipeline write;
- task create;
- calendar create;
- message send;
- auth real;
- provider runtime;
- secret access;
- browser persistence;
- real engine execution.

## Implementation Gate

066A unlocks:

`066B_OPPORTUNITY_PIPELINE_READ_ONLY_ADAPTER_IMPLEMENTATION`

066B may create a local/static adapter and tests only. It must not connect real backend systems or run provider engines.

## Decision

DECISION=PASS_066A_OPPORTUNITY_PIPELINE_READ_ONLY_ADAPTER_SCOPE

NEXT=066B_OPPORTUNITY_PIPELINE_READ_ONLY_ADAPTER_IMPLEMENTATION
