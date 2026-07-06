# Forge Backend Read Model Contracts Scope 064D

Status: SCOPED

Date: 2026-07-06

Phase:
`064D_BACKEND_READ_MODEL_CONTRACTS_SCOPE`

Base:
`064C_BACKEND_DOMAIN_CONTRACTS_SCOPE`

## Purpose

064D defines the backend read model contract layer required before Forge connects any read-only adapter.

064C defined backend domains. 064D defines how each domain must expose safe, explainable, freshness-aware read models to the UI, command bar, Alfred, and preview action contracts.

This phase is documentation and scope only. It does not implement adapters, mutate UI, write CRM records, create calendar items, deliver messages, authenticate users, execute providers, or run a real engine.

## Global Read Model Rule

No domain can be read by Forge as backend truth until its read model declares:

- `readModelId`;
- domain owner;
- source of truth;
- source evidence;
- canonical entity references;
- freshness timestamp;
- freshness status;
- empty-state semantics;
- error envelope;
- capability context;
- approval context when relevant;
- audit correlation id;
- stale-data behavior;
- UI-safe display fields;
- blocked mutation effects;
- QA evidence requirement.

## Required Read Envelope

Every backend read model must fit this envelope:

```text
readModelId
schemaVersion
domainId
sourceOfTruth
sourceEvidence
generatedAt
freshness
capabilities
approvalContext
entities
relationships
metrics
emptyState
errors
blockedEffects
audit
uiProjection
```

## Freshness Contract

Freshness statuses:

- `fresh`
- `possibly_stale`
- `stale`
- `source_unavailable`
- `not_connected`
- `preview_static`

Rules:

- `fresh` requires a source timestamp and source evidence.
- `possibly_stale` must show a visible caution in operational workflows.
- `stale` cannot drive recommendations without caution.
- `source_unavailable` cannot be treated as an empty business fact.
- `not_connected` means the module has no real adapter.
- `preview_static` means static preview data only.

## Empty-State Contract

Empty state is never allowed to mean "false" by default.

Required empty reasons:

- `no_records`
- `not_connected`
- `permission_blocked`
- `source_unavailable`
- `filter_no_match`
- `not_modeled`
- `pending_sync`
- `preview_placeholder`

## Error Contract

Every read model must use a safe error envelope:

```text
errorId
domainId
severity
recoverability
safeMessage
technicalClass
retryAllowed
sourceEvidence
auditCorrelationId
```

Errors cannot expose secrets, credentials, private provider payloads, or raw stack traces to the UI.

## Domain Read Model Inventory

| Domain | Required Read Models | Required Empty States | Required Errors | Freshness Requirement | Connection Rule |
|---|---|---|---|---|---|
| Client / CRM | `client.list.v1`, `client.detail.v1`, `client.risk_context.v1`, `client.identity_match.v1` | no clients, not connected, permission blocked, duplicate unresolved | source unavailable, identity conflict, permission denied | source timestamp per record | no CRM read adapter until client identity and consent are modeled |
| Opportunity / Pipeline | `opportunity.priority_list.v1`, `opportunity.detail.v1`, `pipeline.summary.v1`, `pipeline.stage_distribution.v1` | no opportunities, no stage match, pending sync | stage taxonomy mismatch, source unavailable | generatedAt plus opportunity updatedAt | no recommendation without stage source evidence |
| Quote / Cotizacion | `quote.workspace_preview.v1`, `quote.request_summary.v1`, `quote.comparison.v1`, `quote.status.v1` | no quote workspace, quote not prepared, provider not connected | quote input incomplete, provider unavailable, assumption mismatch | quote timestamp plus assumption version | quote reads remain preview until carrier truth boundary exists |
| Policy / Poliza | `policy.summary.v1`, `policy.detail.v1`, `policy.renewal_list.v1`, `policy.timeline.v1` | no policies, no renewal due, source not connected | policy source unavailable, evidence missing, stale policy data | official policy evidence timestamp required | no policy truth without evidence reference |
| Document / Evidence | `document.list.v1`, `document.extraction_summary.v1`, `document.confidence_report.v1`, `evidence.provenance.v1` | no documents, extraction pending, low confidence | OCR failed, unsupported document, provenance missing | extraction timestamp and source hash required | no extracted truth without confidence/provenance |
| Follow-up / Task | `task.followup_list.v1`, `task.risk_queue.v1`, `task.due_summary.v1` | no tasks, no overdue tasks, source unavailable | invalid due date, owner missing, task source unavailable | due date and source updatedAt required | read-only task view before writes |
| Calendar Intent | `calendar.upcoming_preview.v1`, `calendar.draft_meeting.v1`, `calendar.availability_hint.v1` | no appointments, calendar not connected, no availability | calendar source unavailable, permission blocked | calendar source timestamp required | calendar create/update remains blocked |
| Communication | `communication.draft_preview.v1`, `communication.history_summary.v1`, `message.approval_context.v1` | no history, no draft, channel not connected | channel unavailable, recipient missing, approval missing | source timestamp per history item | no delivery from read model |
| Profile / Auth | `profile.summary.v1`, `profile.role_context.v1`, `profile.avatar_context.v1` | no profile, auth not connected, role unknown | identity unavailable, role conflict | session/context timestamp required | profile UI remains preview until auth contract |
| Settings / Preferences | `settings.workspace_preferences.v1`, `settings.theme_context.v1` | no preferences, defaults active, not connected | preference unavailable, invalid setting | preference version required | persistence blocked until settings contract |
| Command / Action Router | `command.catalog.v1`, `action.registry.v1`, `action.preview_payload.v1` | no commands, command not modeled, target missing | action unavailable, blocked effect, target unresolved | generatedAt and contract version required | preview-only until domain contracts are locked |
| Approval / Audit | `approval.status.v1`, `audit.trail_preview.v1`, `blocked.reason_list.v1` | no approval required, no audit events, not connected | approval missing, audit unavailable | audit correlation timestamp required | required before write adapter |
| Capability / Permission | `capability.context.v1`, `permission.blocked_effects.v1` | no capability, role missing, effect blocked | permission denied, capability unknown | evaluatedAt required | central evaluator before writes |
| Backend API Boundary | `api.route_manifest.v1`, `api.health_preview.v1`, `api.effect_policy.v1` | no routes, route not implemented, not connected | route unavailable, schema mismatch | route manifest version required | route implementation waits for 064F |
| Error / Empty State | `error.catalog.v1`, `empty_state.catalog.v1` | not modeled, source unavailable, preview placeholder | unknown error, unsafe error, retry blocked | catalog version required | must exist before adapter |
| Sync / Freshness | `sync.status.v1`, `freshness.summary.v1`, `source.evidence_index.v1` | no sync, not connected, pending sync | conflict, stale source, source unavailable | source timestamp and sync timestamp required | read adapters must emit freshness |

## UI Projection Rule

Backend read models cannot be passed directly into UI components. Each read model needs a UI projection:

- compact list projection;
- detail projection;
- command result projection;
- mobile projection;
- empty projection;
- error projection.

The projection must omit implementation-only details, secrets, raw provider payloads, and unsafe internal failure data.

## Explicit Non-Scope

064D does not authorize:

- adapter implementation;
- backend route implementation;
- database schema implementation;
- UI mutation;
- CRM mutation;
- calendar creation;
- message delivery;
- authentication changes;
- provider execution;
- browser persistence behavior;
- browser request behavior;
- real engine execution.

## Recommended Next Work

064E should define approval and audit contracts.

064F should define backend API and adapter boundaries.

064G should define a read-only adapter dry run only after 064E and 064F are closed.

## Final Decision

064D scopes backend read model contracts for all active backend domains.

DECISION=PASS_064D_BACKEND_READ_MODEL_CONTRACTS_SCOPE

NEXT=064E_BACKEND_APPROVAL_AND_AUDIT_CONTRACTS_SCOPE
