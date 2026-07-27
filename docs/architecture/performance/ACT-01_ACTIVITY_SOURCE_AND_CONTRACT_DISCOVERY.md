# ACT-01 — Activity Source and Contract Discovery

## Status

**DISCOVERY COMPLETE — IMPLEMENTATION NOT STARTED**

## Scope

This document records the current repository surfaces that participate in Activity,
Performance, Pipeline integration, scoring, persistence, coaching and manager
visibility.

It is a source map, not an implementation.

## Repository Authority

| Field | Value |
|---|---|
| Repository | `/storage/emulated/0/Forge OS Activity` |
| Branch | `feature/activity-domain-runtime-foundation` |
| Discovery base commit | `800d9d9a4d9e517b7d1aac7661a9aff40f37eaf9` |
| Generated at | `2026-07-27T03:22:10Z` |
| Foundational authority | `docs/architecture/performance/FORGE_PERFORMANCE_OPERATING_SYSTEM_001.md` |
| Constitutional metric boundary | `adr/ADR-014 — Productivity Metric Ownership Boundary.txt` |

## Discovery Totals

| Surface | Count |
|---|---:|
| Relevant tracked files | 344 |
| Activity-owned candidates | 5 |
| Pipeline candidates | 6 |
| Persistence candidates | 0 |
| Performance/score candidates | 4 |
| Intelligence candidates | 143 |
| Governance candidates | 30 |
| Dedicated activity-related test files | 148 |
| Activity-related migration/schema files | 0 |
| Governance references | 46 |

## Current Source Topology

The repository contains multiple Activity representations rather than one canonical
domain contract.

Observed root/runtime surfaces include:

- `actividad.js`
- `activity-feed.js`
- `activity-feed-engine.js`
- `activity-stream-engine.js`
- App-shell and dashboard bindings
- Pipeline and appointment-adjacent surfaces
- Productivity, score and points references
- ADR-013, ADR-014 and ADR-015 governance boundaries

## Contract Findings

### Activity Authority

Activity data currently appears across UI state, persistence, events, feeds,
pipeline-adjacent behavior and score calculations.

ACT-02 must establish one canonical `ActivityRecord` contract before runtime
migration begins.

### Pipeline Integration

Pipeline must produce or expose governed source events for:

- initial appointment scheduled;
- initial appointment completed;
- closing appointment scheduled;
- closing appointment completed;
- application submitted;
- policy paid;
- referral or valid new-name acquisition.

Scheduling must remain distinct from completion.

### Points and Score

Points must be derived from eligible confirmed activity.

ACT-02 and ACT-05 must prohibit direct point mutation without a source
`ActivityRecord`, scoring rule identity and rule version.

### Feed and Stream

Feed contract status: **CONTRACT_ALIGNMENT_REQUIRED**

The existing feed renderer, feed engine and activity stream must converge through
one projection contract rather than remain independent event shapes.

### Weekly Aggregation

Weekly aggregation status: **PERIOD_BOUNDARY_REVIEW_REQUIRED**

ACT-05 must prove explicit period boundaries, timezone behavior and evaluable-day
rules. A weekly metric must not silently aggregate all loaded history.

### Work Calendar

No absence of activity may be interpreted without Work Calendar context.

Weekend, holiday, vacation, incapacity, leave, training and convention states must
be represented as evaluability inputs rather than rewritten activity dates.

## Required Ownership Boundaries

| Owner | Owns | Must not own |
|---|---|---|
| Pipeline | Process stage and scheduled commercial actions | Productivity judgment |
| Activity | Observable action, confirmation, correction and reversal | Point values |
| Performance | Metrics, periods, conversions and governed score rules | Invented activity |
| FES | Evidence, provenance and reconciliation | Coaching judgment |
| Nash / Mick | Explainable coaching interpretation | Final human authority |
| Manager Intelligence | Coaching preparation and team support | Automatic punishment |
| Work Calendar | Evaluability | Rewriting occurrence truth |

## ACT-02 Entry Contract

ACT-02 may begin only with the following minimum contract decisions:

1. Stable `ActivityRecord.id`.
2. `advisorId`, `organizationId` and optional `managerId`.
3. Optional prospect, opportunity, appointment and policy references.
4. Activity type and subtype vocabulary.
5. Lifecycle state vocabulary.
6. Source event identity and evidence state.
7. Actual occurrence date separated from evaluation date.
8. Explicit confirmation method.
9. Correction and reversal semantics.
10. No embedded hardcoded point value.
11. Schema version.
12. Runtime validation and domain tests.

## Discovery Decision

The next implementation unit is:

```text
ACT-02_ACTIVITY_RECORD_CONTRACT
```

It must be implemented as a domain contract with tests before changing the existing
Activity UI, Pipeline behavior, score engine or manager surfaces.

## Non-Mutation Statement

This discovery does not modify FES, MUI, Pipeline runtime, Activity runtime,
database schema or UI behavior.


## Relevant Tracked Files

Count: **344**

- `actividad.js`
- `activity-feed-engine.js`
- `activity-feed.js`
- `activity-stream-engine.js`
- `advisor-os/followup/appointment-followup-engine.js`
- `advisor-os/prospecting/appointment-calendar-engine.js`
- `advisor-os/prospecting/appointment-opportunity-engine.js`
- `advisor-os/sales-pipeline/pipeline-live-route.js`
- `advisor-os/sales-pipeline/pipeline-stage-read-model.js`
- `advisor-os/sales-pipeline/pipeline-ui.css`
- `advisor-os/sales-pipeline/pipeline-ui.js`
- `advisor-os/sales-pipeline/prospect-context/pipeline-universal-prospect-context-adapter.js`
- `compensation/partner-manager/manager-precontract-rda-attribution-intake.js`
- `docs/03-discovery/MANAGER_OS_CONSOLIDATION_REPORT.md`
- `docs/03-discovery/manager-os/MANAGER-OS-001_LEGACY_FORMAT_DISCOVERY.md`
- `docs/03-discovery/MANAGER_OS_OPEN_QUESTIONS.md`
- `docs/04-manager-os/MANAGER_COMPENSATION_KNOWLEDGE_BASE.md`
- `docs/05-readiness/MANAGER_ADVISOR_ACCESS_MODEL_001.md`
- `docs/05-readiness/MANAGER_CARRIER_SCOPED_VISIBILITY_DISCOVERY_001.md`
- `docs/07-runtime/NASH-001_BOUNDARY_DOCUMENTATION.md`
- `docs/architecture/performance/FORGE_PERFORMANCE_OPERATING_SYSTEM_001.md`
- `docs/architecture/source-truth/MANAGER_OS_MESSAGE_GENERATION_PROMPT_BUILDER_SCOPE_027A.md`
- `docs/architecture/source-truth/MICK_EXISTING_ENGINE_INVENTORY_AND_PURPOSE_DISCOVERY_005B.md`
- `docs/architecture/source-truth/NASH_EXISTING_ENGINE_INVENTORY_AND_PURPOSE_DISCOVERY_005A.md`
- `docs/architecture/source-truth/NASH_FAST_TRACK_NFAST_04_DETERMINISTIC_CONVERSATION_BRIEF_CLOSURE.md`
- `docs/architecture/source-truth/NASH_FAST_TRACK_NFAST_05_PROVIDER_CONTRACT_HARDENING_CLOSURE.md`
- `docs/architecture/source-truth/NASH_MICK_NBA_RECONNECTION_IMPLEMENTATION_CLOSURE_006D.md`
- `docs/architecture/source-truth/NASH_MICK_NBA_RECONNECTION_SCOPE_006A.md`
- `docs/evidence/MANAGER_OS_ADVISOR_SIGNAL_CONSUMER_CONTRACT_CLOSURE_CERTIFICATE.md`
- `docs/evidence/MANAGER_OS_MESSAGE_GENERATION_PROMPT_BUILDER_CLOSURE_CERTIFICATE_027C.md`
- `docs/evidence/MANAGER_OS_RDA_ATTRIBUTION_TRUTH_CLOSURE_CERTIFICATE.md`
- `docs/evidence/MANAGER_OS_RDA_CONSUMER_CONTRACT_CLOSURE_CERTIFICATE.md`
- `docs/evidence/MICK_EXISTING_ENGINE_INVENTORY_AND_PURPOSE_DISCOVERY_CERTIFICATE_005B.md`
- `docs/evidence/NASH_EXISTING_ENGINE_INVENTORY_AND_PURPOSE_DISCOVERY_CERTIFICATE_005A.md`
- `docs/evidence/NASH_MICK_NBA_RECONNECTION_CLOSURE_CERTIFICATE_006D.md`
- `docs/evidence/NASH_MICK_NBA_RECONNECTION_SCOPE_CERTIFICATE_006A.md`
- `docs/roadmap/MANAGER_OS_CONTEXT_INTELLIGENCE_V1_CLOSURE_REPORT_026A.md`
- `docs/roadmap/MANAGER_OS_MESSAGE_GENERATION_PROMPT_BUILDER_SCOPE_027A.md`
- `docs/roadmap/MANAGER_OS_ROADMAP_ADDENDUM_022_EXTERNAL_CONTEXT_BRIDGE.md`
- `docs/roadmap/MANAGER_OS_ROADMAP_ADDENDUM_023_NASH_MANAGER_CONTEXT_INTAKE.md`
- `docs/roadmap/MANAGER_OS_ROADMAP_ADDENDUM_024_MICK_MANAGER_CONTEXT_INTAKE.md`
- `docs/roadmap/MANAGER_OS_ROADMAP_ADDENDUM_025_ENGAGEMENT_PRIVATE_MOTIVATION_CONTEXT_INTAKE.md`
- `docs/roadmap/MANAGER_OS_ROADMAP_LOCK_001.md`
- `fixtures/manager-report-demo.json`
- `fixtures/nash-decision-demo.json`
- `manager-os/advisor-signals/manager-advisor-signal-consumer-contract.js`
- `manager-os/advisor-snapshots/advisor-manager-snapshot-engine.js`
- `manager-os/advisor-tracking/manager-advisor-tracking-boundary-engine.js`
- `manager-os/alerts/manager-alert-engine.js`
- `manager-os/alfred-review-action-packet-read-model.js`
- `manager-os/alfred-review-action-packet-static-preview-binding.js`
- `manager-os/alfred-review-action-packet-static-preview-dom-renderer.js`
- `manager-os/alfred-review-action-packet-static-preview-dom-surface-binding.js`
- `manager-os/alfred-review-action-packet-static-preview-surface-binding.js`
- `manager-os/alfred-review-action-packet-ui-view-model.js`
- `manager-os/alfred-static-preview-dom-renderer-integration.js`
- `manager-os/alfred-universal-command-memory-read-model.js`
- `manager-os/audit-persistence/audit-persistence-boundary-contract.js`
- `manager-os/canonical-truth-registry/canonical-truth-registry-boundary-contract.js`
- `manager-os/coaching/dna-coaching-engine.js`
- `manager-os/coaching-intelligence/manager-advisor-coaching-engine.js`
- `manager-os/coaching-intelligence/manager-coaching-boundary-contract.js`
- `manager-os/coaching-intelligence/manager-coaching-intelligence-engine.js`
- `manager-os/coaching-intelligence/manager-recruitment-coaching-engine.js`
- `manager-os/coaching-intelligence/manager-team-coaching-engine.js`
- `manager-os/coaching/manager-coaching-engine.js`
- `manager-os/communication/manager-broadcast-engine.js`
- `manager-os/connector-execution/connector-execution-gate-boundary-contract.js`
- `manager-os/connector-executor/connector-executor-boundary-contract.js`
- `manager-os/dashboard-intelligence/manager-advisor-dashboard-engine.js`
- `manager-os/dashboard-intelligence/manager-dashboard-boundary-contract.js`
- `manager-os/dashboard-intelligence/manager-dashboard-intelligence-engine.js`
- `manager-os/dashboard-intelligence/manager-recruitment-dashboard-engine.js`
- `manager-os/dashboard-intelligence/manager-team-dashboard-engine.js`
- `manager-os/delivery/delivery-adapter-boundary-contract.js`
- `manager-os/external-context-bridge/manager-engagement-context-bridge.js`
- `manager-os/external-context-bridge/manager-external-context-bridge-boundary-contract.js`
- `manager-os/external-context-bridge/manager-external-context-bridge-orchestrator.js`
- `manager-os/external-context-bridge/manager-mick-behavior-context-bridge.js`
- `manager-os/external-context-bridge/manager-nash-conversation-context-bridge.js`
- `manager-os/external-dispatch/external-dispatch-boundary-contract.js`
- `manager-os/feed/manager-feed-engine.js`
- `manager-os/forecast/manager-advisor-forecast-engine.js`
- `manager-os/forecast/manager-forecast-boundary-contract.js`
- `manager-os/forecast/manager-forecast-intelligence-engine.js`
- `manager-os/forecast/manager-recruitment-forecast-engine.js`
- `manager-os/forecast/manager-team-forecast-engine.js`
- `manager-os/forge-alive/forge-alive-smart-widget-stack-read-model.js`
- `manager-os/forge-alive-shell/forge-alive-shell-boundary-contract.js`
- `manager-os/forge-alive-static-preview-milestone-closure/forge-alive-static-preview-milestone-closure-boundary-contract.js`
- `manager-os/genesis-beta-loop/fixtures/genesis-beta-loop-additional-scenarios.fixture.js`
- `manager-os/genesis-beta-loop/fixtures/jorge-maria-followup-15-days.fixture.js`
- `manager-os/genesis-beta-loop/genesis-beta-loop-human-review-packet.js`
- `manager-os/genesis-beta-loop/genesis-beta-loop-orchestrator-boundary-contract.js`
- `manager-os/genesis-beta-loop/genesis-beta-loop-real-adapter-wiring.js`
- `manager-os/genesis-beta-loop/genesis-beta-loop-ui-read-model.js`
- `manager-os/github-pages-static-preview/github-pages-static-preview-boundary-contract.js`
- `manager-os/historical-analytics/manager-advisor-historical-analytics-engine.js`
- `manager-os/historical-analytics/manager-historical-analytics-boundary-contract.js`
- `manager-os/historical-analytics/manager-historical-analytics-engine.js`
- `manager-os/historical-analytics/manager-recruitment-historical-analytics-engine.js`
- `manager-os/historical-analytics/storage/manager-historical-query-plan-contract.js`
- `manager-os/historical-analytics/storage/manager-historical-rollup-contract.js`
- `manager-os/historical-analytics/storage/manager-historical-storage-boundary-contract.js`
- `manager-os/human-approval/human-approval-gate-boundary-contract.js`
- `manager-os/message-generation/llm-draft-intake-boundary-contract.js`
- `manager-os/message-generation/manager-message-prompt-builder-boundary-contract.js`
- `manager-os/message-generation/manager-message-prompt-builder.js`
- `manager-os/message-generation/message-safety-validator.js`
- `manager-os/metrics/manager-advisor-metrics-engine.js`
- `manager-os/metrics/manager-metrics-boundary-contract.js`
- `manager-os/metrics/manager-metrics-intelligence-engine.js`
- `manager-os/metrics/manager-recruitment-metrics-engine.js`
- `manager-os/nba/nash-mick-nba-reconnection-engine.js`
- `manager-os/nba/nba-reason-why-boundary-contract.js`
- `manager-os/notifications/manager-notification-engine.js`
- `manager-os/presentation/quote-to-sales-presentation-context-adapter.js`
- `manager-os/presentation/sales-presentation-engine-ownership-registry.js`
- `manager-os/provider-connector/provider-connector-boundary-contract.js`
- `manager-os/provider-runtime/provider-runtime-boundary-contract.js`
- `manager-os/provider-webhook/provider-webhook-boundary-contract.js`
- `manager-os/public-url-verification/public-url-verification-boundary-contract.js`
- `manager-os/rda-attribution/manager-rda-attribution-truth-engine.js`
- `manager-os/rda-attribution/manager-rda-consumer-contract.js`
- `manager-os/recruitment/candidate-intelligence/candidate-assessment-engine.js`
- `manager-os/recruitment/candidate-intelligence/candidate-coachability-engine.js`
- `manager-os/recruitment/candidate-intelligence/candidate-evidence-provenance-engine.js`
- `manager-os/recruitment/candidate-intelligence/candidate-hard-factors-engine.js`
- `manager-os/recruitment/candidate-intelligence/candidate-market-quality-engine.js`
- `manager-os/recruitment/candidate-intelligence/candidate-vital-factors-engine.js`
- `manager-os/recruitment/events/manager-recruitment-event-capture-contract.js`
- `manager-os/recruitment/interview-flow/interview-flow-engine.js`
- `manager-os/recruitment/pipeline/recruitment-pipeline-engine.js`
- `manager-os/recruitment/precontract-gate/recruitment-to-precontract-gate.js`
- `manager-os/recruitment/rda-boundary/recruitment-rda-prerequisite-boundary.js`
- `manager-os/recruitment/snapshots/candidate-manager-snapshot-engine.js`
- `manager-os/recruitment/tests/candidate-assessment-master-test.js`
- `manager-os/recruitment/tests/candidate-coachability-master-test.js`
- `manager-os/recruitment/tests/candidate-evidence-provenance-master-test.js`
- `manager-os/recruitment/tests/candidate-hard-factors-master-test.js`
- `manager-os/recruitment/tests/candidate-manager-snapshot-engine-master-test.js`
- `manager-os/recruitment/tests/candidate-market-quality-master-test.js`
- `manager-os/recruitment/tests/candidate-vital-factors-master-test.js`
- `manager-os/recruitment/tests/interview-evidence-fixture-test.js`
- `manager-os/recruitment/tests/interview-flow-engine-master-test.js`
- `manager-os/recruitment/tests/manager-recruitment-event-capture-contract-master-test.js`
- `manager-os/recruitment/tests/recruitment-fixture-validation-test.js`
- `manager-os/recruitment/tests/recruitment-pipeline-engine-master-test.js`
- `manager-os/recruitment/tests/recruitment-rda-prerequisite-boundary-master-test.js`
- `manager-os/recruitment/tests/recruitment-to-precontract-gate-master-test.js`
- `manager-os/review-plan-intelligence/manager-advisor-review-plan-engine.js`
- `manager-os/review-plan-intelligence/manager-recruitment-review-plan-engine.js`
- `manager-os/review-plan-intelligence/manager-review-plan-boundary-contract.js`
- `manager-os/review-plan-intelligence/manager-review-plan-intelligence-engine.js`
- `manager-os/review-plan-intelligence/manager-team-review-plan-engine.js`
- `manager-os/roles/manager-role-engine.js`
- `manager-os/send-execution/send-execution-gate-boundary-contract.js`
- `manager-os/static-preview-deployment/static-preview-deployment-boundary-contract.js`
- `manager-os/static-preview-public-surface-decision/static-preview-public-surface-decision-boundary-contract.js`
- `manager-os/static-preview-release-note/static-preview-release-note-boundary-contract.js`
- `manager-os/static-preview-review-packet/static-preview-review-packet-boundary-contract.js`
- `manager-os/team-intelligence/activity/team-activity-engine.js`
- `manager-os/team-intelligence/dashboard/team-dashboard-engine.js`
- `manager-os/team-intelligence/momentum/team-momentum-engine.js`
- `manager-os/team-intelligence/structure/team-structure-engine.js`
- `manager-os/tests/accepted-quote-review-snapshot-boundary-master-test.js`
- `manager-os/tests/advisor-manager-snapshot-engine-master-test.js`
- `manager-os/tests/advisor-reason-why-presentation-domain-separation-master-test.js`
- `manager-os/tests/alfred-review-action-packet-read-model-master-test.js`
- `manager-os/tests/alfred-review-action-packet-static-preview-binding-master-test.js`
- `manager-os/tests/alfred-review-action-packet-static-preview-dom-renderer-master-test.js`
- `manager-os/tests/alfred-review-action-packet-static-preview-dom-surface-binding-master-test.js`
- `manager-os/tests/alfred-review-action-packet-static-preview-surface-binding-master-test.js`
- `manager-os/tests/alfred-review-action-packet-ui-view-model-master-test.js`
- `manager-os/tests/alfred-static-preview-dom-renderer-integration-master-test.js`
- `manager-os/tests/alfred-universal-command-memory-read-model-master-test.js`
- `manager-os/tests/audit-persistence-boundary-contract-master-test.js`
- `manager-os/tests/canonical-truth-registry-boundary-contract-master-test.js`
- `manager-os/tests/client-recommendation-rationale-boundary-master-test.js`
- `manager-os/tests/connector-execution-gate-boundary-contract-master-test.js`
- `manager-os/tests/connector-executor-boundary-contract-master-test.js`
- `manager-os/tests/delivery-adapter-boundary-contract-master-test.js`
- `manager-os/tests/external-dispatch-boundary-contract-master-test.js`
- `manager-os/tests/forge-alive-shell-boundary-contract-master-test.js`
- `manager-os/tests/forge-alive-smart-widget-stack-read-model-master-test.js`
- `manager-os/tests/forge-alive-static-preview-milestone-closure-boundary-contract-master-test.js`
- `manager-os/tests/genesis-beta-loop-additional-scenarios-fixture-master-test.js`
- `manager-os/tests/genesis-beta-loop-human-review-packet-master-test.js`
- `manager-os/tests/genesis-beta-loop-jorge-maria-followup-fixture-master-test.js`
- `manager-os/tests/genesis-beta-loop-orchestrator-boundary-contract-master-test.js`
- `manager-os/tests/genesis-beta-loop-real-adapter-wiring-master-test.js`
- `manager-os/tests/genesis-beta-loop-ui-read-model-master-test.js`
- `manager-os/tests/github-pages-static-preview-boundary-contract-master-test.js`
- `manager-os/tests/human-approval-gate-boundary-contract-master-test.js`
- `manager-os/tests/llm-draft-intake-boundary-contract-master-test.js`
- `manager-os/tests/manager-advisor-coaching-engine-master-test.js`
- `manager-os/tests/manager-advisor-dashboard-engine-master-test.js`
- `manager-os/tests/manager-advisor-forecast-engine-master-test.js`
- `manager-os/tests/manager-advisor-historical-analytics-engine-master-test.js`
- `manager-os/tests/manager-advisor-metrics-engine-master-test.js`
- `manager-os/tests/manager-advisor-review-plan-engine-master-test.js`
- `manager-os/tests/manager-advisor-signal-consumer-contract-master-test.js`
- `manager-os/tests/manager-advisor-tracking-boundary-hardening-master-test.js`
- `manager-os/tests/manager-coaching-boundary-contract-master-test.js`
- `manager-os/tests/manager-coaching-intelligence-engine-master-test.js`
- `manager-os/tests/manager-dashboard-boundary-contract-master-test.js`
- `manager-os/tests/manager-dashboard-intelligence-engine-master-test.js`
- `manager-os/tests/manager-engagement-context-bridge-master-test.js`
- `manager-os/tests/manager-external-context-bridge-boundary-contract-master-test.js`
- `manager-os/tests/manager-external-context-bridge-orchestrator-master-test.js`
- `manager-os/tests/manager-forecast-boundary-contract-master-test.js`
- `manager-os/tests/manager-forecast-intelligence-engine-master-test.js`
- `manager-os/tests/manager-historical-analytics-boundary-contract-master-test.js`
- `manager-os/tests/manager-historical-analytics-engine-master-test.js`
- `manager-os/tests/manager-historical-query-plan-contract-master-test.js`
- `manager-os/tests/manager-historical-rollup-contract-master-test.js`
- `manager-os/tests/manager-historical-storage-boundary-contract-master-test.js`
- `manager-os/tests/manager-message-prompt-builder-boundary-contract-master-test.js`
- `manager-os/tests/manager-message-prompt-builder-master-test.js`
- `manager-os/tests/manager-metrics-boundary-contract-master-test.js`
- `manager-os/tests/manager-metrics-intelligence-engine-master-test.js`
- `manager-os/tests/manager-mick-behavior-context-bridge-master-test.js`
- `manager-os/tests/manager-nash-conversation-context-bridge-master-test.js`
- `manager-os/tests/manager-rda-attribution-truth-engine-master-test.js`
- `manager-os/tests/manager-rda-consumer-contract-master-test.js`
- `manager-os/tests/manager-recruitment-coaching-engine-master-test.js`
- `manager-os/tests/manager-recruitment-dashboard-engine-master-test.js`
- `manager-os/tests/manager-recruitment-forecast-engine-master-test.js`
- `manager-os/tests/manager-recruitment-historical-analytics-engine-master-test.js`
- `manager-os/tests/manager-recruitment-metrics-engine-master-test.js`
- `manager-os/tests/manager-recruitment-review-plan-engine-master-test.js`
- `manager-os/tests/manager-review-plan-boundary-contract-master-test.js`
- `manager-os/tests/manager-review-plan-intelligence-engine-master-test.js`
- `manager-os/tests/manager-team-coaching-engine-master-test.js`
- `manager-os/tests/manager-team-dashboard-engine-master-test.js`
- `manager-os/tests/manager-team-forecast-engine-master-test.js`
- `manager-os/tests/manager-team-review-plan-engine-master-test.js`
- `manager-os/tests/message-safety-validator-master-test.js`
- `manager-os/tests/nash-mick-nba-reconnection-engine-master-test.js`
- `manager-os/tests/nba-reason-why-boundary-contract-master-test.js`
- `manager-os/tests/provider-connector-boundary-contract-master-test.js`
- `manager-os/tests/provider-runtime-boundary-contract-master-test.js`
- `manager-os/tests/provider-webhook-boundary-contract-master-test.js`
- `manager-os/tests/public-url-verification-boundary-contract-master-test.js`
- `manager-os/tests/quote-to-sales-presentation-context-adapter-master-test.js`
- `manager-os/tests/sales-presentation-browser-context-engine-master-test.js`
- `manager-os/tests/sales-presentation-editable-preview-master-test.js`
- `manager-os/tests/sales-presentation-engine-ownership-registry-master-test.js`
- `manager-os/tests/sales-presentation-existing-assembly-contract-e2e-master-test.js`
- `manager-os/tests/sales-presentation-export-adapter-master-test.js`
- `manager-os/tests/sales-presentation-human-approval-gate-master-test.js`
- `manager-os/tests/sales-presentation-prompt-engine-master-test.js`
- `manager-os/tests/sales-presentation-review-packet-engine-master-test.js`
- `manager-os/tests/sales-presentation-review-state-store-master-test.js`
- `manager-os/tests/sales-presentation-slide-plan-engine-master-test.js`
- `manager-os/tests/send-execution-gate-boundary-contract-master-test.js`
- `manager-os/tests/static-preview-deployment-boundary-contract-master-test.js`
- `manager-os/tests/static-preview-public-surface-decision-boundary-contract-master-test.js`
- `manager-os/tests/static-preview-release-note-boundary-contract-master-test.js`
- `manager-os/tests/static-preview-review-packet-boundary-contract-master-test.js`
- `manager-os/tests/truth-promotion-boundary-contract-master-test.js`
- `manager-os/tests/ui-read-model-boundary-contract-master-test.js`
- `manager-os/tests/ui-rendering-boundary-contract-master-test.js`
- `manager-os/truth-promotion/truth-promotion-boundary-contract.js`
- `manager-os/ui-read-model/ui-read-model-boundary-contract.js`
- `manager-os/ui-rendering/ui-rendering-boundary-contract.js`
- `mick/context-intake/mick-manager-behavior-review-packet-intake.js`
- `mick/context-intake/mick-manager-context-intake-boundary-contract.js`
- `mick/context-intake/mick-manager-context-intake-orchestrator.js`
- `mick/context-intake/mick-manager-no-surveillance-guardrail-intake.js`
- `mick/tests/mick-manager-behavior-review-packet-intake-master-test.js`
- `mick/tests/mick-manager-context-intake-boundary-contract-master-test.js`
- `mick/tests/mick-manager-context-intake-orchestrator-master-test.js`
- `mick/tests/mick-manager-no-surveillance-guardrail-intake-master-test.js`
- `nash-advisor-performance-engine.js`
- `nash-advisor-performance-master-test.js`
- `nash-coaching-insight-engine.js`
- `nash-coaching-insight-master-test.js`
- `nash-combat-intelligence-report-engine.js`
- `nash-combat-intelligence-report-test.js`
- `nash-combat-master-test.js`
- `nash-combat-orchestrator.js`
- `nash/context-intake/nash-manager-context-intake-boundary-contract.js`
- `nash/context-intake/nash-manager-context-intake-orchestrator.js`
- `nash/context-intake/nash-manager-conversation-prep-packet-intake.js`
- `nash/context-intake/nash-manager-safe-language-guardrail-intake.js`
- `nash/context-intake/nash-prospect-context-intake-boundary-contract.js`
- `nash/context-intake/nash-prospect-context-intake.js`
- `nash/context-intake/nash-universal-prospect-context-consumer.js`
- `nash/conversation-brief/nash-deterministic-conversation-brief-boundary-contract.js`
- `nash/conversation-brief/nash-provider-request-contract.js`
- `nash-core-engine.js`
- `nash-council-orchestrator.js`
- `nash-followup-engine.js`
- `nash-integration-master-test.js`
- `nash-intent-engine.js`
- `nash-intent-master-test.js`
- `nash-learning-engine.js`
- `nash-learning-master-test.js`
- `nash-manager-alert-engine.js`
- `nash-manager-alert-master-test.js`
- `nash-master-acceptance-test.js`
- `nash-master-intelligence-engine.js`
- `nash-master-intelligence-master-test.js`
- `nash-master-test.js`
- `nash-memory-engine.js`
- `nash-memory/maria_acceptance_001.json`
- `nash-memory/maria_test_001.json`
- `nash-memory-master-test.js`
- `nash-message-recommendation-engine.js`
- `nash-next-best-action-engine.js`
- `nash-next-best-action-master-test.js`
- `nash/optional-ai-draft-provider-boundary.js`
- `nash-personality-engine.js`
- `nash-personality-master-test.js`
- `nash-prospect-context-builder.js`
- `nash/remote-draft-provider-client-boundary.js`
- `nash-team-intelligence-engine.js`
- `nash-team-intelligence-master-test.js`
- `nash/tests/nash-deterministic-conversation-brief-boundary-contract-master-test.js`
- `nash/tests/nash-manager-context-intake-boundary-contract-master-test.js`
- `nash/tests/nash-manager-context-intake-orchestrator-master-test.js`
- `nash/tests/nash-manager-conversation-prep-packet-intake-master-test.js`
- `nash/tests/nash-manager-safe-language-guardrail-intake-master-test.js`
- `nash/tests/nash-prospect-context-intake-boundary-contract-master-test.js`
- `nash/tests/nash-prospect-context-intake-master-test.js`
- `nash/tests/nash-provider-request-contract-test.js`
- `nash/tests/nash-universal-prospect-context-consumer-master-test.js`
- `nash/tests/optional-ai-draft-provider-boundary-test.js`
- `nash/tests/remote-draft-provider-client-boundary-test.js`
- `nash-v03-master-test.js`
- `nash-v04-master-test.js`
- `performance-monitor.js`
- `performance-runtime.js`
- `pipeline-stage-engine.js`
- `schemas/manager-assignment.schema.json`
- `schemas/manager-report.schema.json`
- `schemas/nash-report.schema.json`
- `supabase/functions/nash-draft-provider/gemini-provider.mjs`
- `supabase/functions/nash-draft-provider/index.ts`
- `tests/manager-precontract-rda-attribution-intake-test.js`
- `tests/nash-draft-provider-edge-function-shell-test.mjs`
- `tests/nash-draft-provider-gemini-provider-test.mjs`
- `tests/pipeline-ui-stage-integration-067g12-test.js`

## Dedicated Activity-Related Tests

Count: **148**

- `engagement/tests/engagement-manager-context-intake-boundary-contract-master-test.js`
- `engagement/tests/engagement-manager-context-intake-orchestrator-master-test.js`
- `engagement/tests/engagement-manager-dignity-guardrail-intake-master-test.js`
- `engagement/tests/engagement-manager-private-motivation-packet-intake-master-test.js`
- `manager-os/recruitment/tests/candidate-assessment-master-test.js`
- `manager-os/recruitment/tests/candidate-coachability-master-test.js`
- `manager-os/recruitment/tests/candidate-evidence-provenance-master-test.js`
- `manager-os/recruitment/tests/candidate-hard-factors-master-test.js`
- `manager-os/recruitment/tests/candidate-manager-snapshot-engine-master-test.js`
- `manager-os/recruitment/tests/candidate-market-quality-master-test.js`
- `manager-os/recruitment/tests/candidate-vital-factors-master-test.js`
- `manager-os/recruitment/tests/interview-evidence-fixture-test.js`
- `manager-os/recruitment/tests/interview-flow-engine-master-test.js`
- `manager-os/recruitment/tests/manager-recruitment-event-capture-contract-master-test.js`
- `manager-os/recruitment/tests/recruitment-fixture-validation-test.js`
- `manager-os/recruitment/tests/recruitment-pipeline-engine-master-test.js`
- `manager-os/recruitment/tests/recruitment-rda-prerequisite-boundary-master-test.js`
- `manager-os/recruitment/tests/recruitment-to-precontract-gate-master-test.js`
- `manager-os/tests/accepted-quote-review-snapshot-boundary-master-test.js`
- `manager-os/tests/advisor-manager-snapshot-engine-master-test.js`
- `manager-os/tests/advisor-reason-why-presentation-domain-separation-master-test.js`
- `manager-os/tests/alfred-review-action-packet-read-model-master-test.js`
- `manager-os/tests/alfred-review-action-packet-static-preview-binding-master-test.js`
- `manager-os/tests/alfred-review-action-packet-static-preview-dom-renderer-master-test.js`
- `manager-os/tests/alfred-review-action-packet-static-preview-dom-surface-binding-master-test.js`
- `manager-os/tests/alfred-review-action-packet-static-preview-surface-binding-master-test.js`
- `manager-os/tests/alfred-review-action-packet-ui-view-model-master-test.js`
- `manager-os/tests/alfred-static-preview-dom-renderer-integration-master-test.js`
- `manager-os/tests/alfred-universal-command-memory-read-model-master-test.js`
- `manager-os/tests/audit-persistence-boundary-contract-master-test.js`
- `manager-os/tests/canonical-truth-registry-boundary-contract-master-test.js`
- `manager-os/tests/client-recommendation-rationale-boundary-master-test.js`
- `manager-os/tests/connector-execution-gate-boundary-contract-master-test.js`
- `manager-os/tests/connector-executor-boundary-contract-master-test.js`
- `manager-os/tests/delivery-adapter-boundary-contract-master-test.js`
- `manager-os/tests/external-dispatch-boundary-contract-master-test.js`
- `manager-os/tests/forge-alive-shell-boundary-contract-master-test.js`
- `manager-os/tests/forge-alive-smart-widget-stack-read-model-master-test.js`
- `manager-os/tests/forge-alive-static-preview-milestone-closure-boundary-contract-master-test.js`
- `manager-os/tests/genesis-beta-loop-additional-scenarios-fixture-master-test.js`
- `manager-os/tests/genesis-beta-loop-human-review-packet-master-test.js`
- `manager-os/tests/genesis-beta-loop-jorge-maria-followup-fixture-master-test.js`
- `manager-os/tests/genesis-beta-loop-orchestrator-boundary-contract-master-test.js`
- `manager-os/tests/genesis-beta-loop-real-adapter-wiring-master-test.js`
- `manager-os/tests/genesis-beta-loop-ui-read-model-master-test.js`
- `manager-os/tests/github-pages-static-preview-boundary-contract-master-test.js`
- `manager-os/tests/human-approval-gate-boundary-contract-master-test.js`
- `manager-os/tests/llm-draft-intake-boundary-contract-master-test.js`
- `manager-os/tests/manager-advisor-coaching-engine-master-test.js`
- `manager-os/tests/manager-advisor-dashboard-engine-master-test.js`
- `manager-os/tests/manager-advisor-forecast-engine-master-test.js`
- `manager-os/tests/manager-advisor-historical-analytics-engine-master-test.js`
- `manager-os/tests/manager-advisor-metrics-engine-master-test.js`
- `manager-os/tests/manager-advisor-review-plan-engine-master-test.js`
- `manager-os/tests/manager-advisor-signal-consumer-contract-master-test.js`
- `manager-os/tests/manager-advisor-tracking-boundary-hardening-master-test.js`
- `manager-os/tests/manager-coaching-boundary-contract-master-test.js`
- `manager-os/tests/manager-coaching-intelligence-engine-master-test.js`
- `manager-os/tests/manager-dashboard-boundary-contract-master-test.js`
- `manager-os/tests/manager-dashboard-intelligence-engine-master-test.js`
- `manager-os/tests/manager-engagement-context-bridge-master-test.js`
- `manager-os/tests/manager-external-context-bridge-boundary-contract-master-test.js`
- `manager-os/tests/manager-external-context-bridge-orchestrator-master-test.js`
- `manager-os/tests/manager-forecast-boundary-contract-master-test.js`
- `manager-os/tests/manager-forecast-intelligence-engine-master-test.js`
- `manager-os/tests/manager-historical-analytics-boundary-contract-master-test.js`
- `manager-os/tests/manager-historical-analytics-engine-master-test.js`
- `manager-os/tests/manager-historical-query-plan-contract-master-test.js`
- `manager-os/tests/manager-historical-rollup-contract-master-test.js`
- `manager-os/tests/manager-historical-storage-boundary-contract-master-test.js`
- `manager-os/tests/manager-message-prompt-builder-boundary-contract-master-test.js`
- `manager-os/tests/manager-message-prompt-builder-master-test.js`
- `manager-os/tests/manager-metrics-boundary-contract-master-test.js`
- `manager-os/tests/manager-metrics-intelligence-engine-master-test.js`
- `manager-os/tests/manager-mick-behavior-context-bridge-master-test.js`
- `manager-os/tests/manager-nash-conversation-context-bridge-master-test.js`
- `manager-os/tests/manager-rda-attribution-truth-engine-master-test.js`
- `manager-os/tests/manager-rda-consumer-contract-master-test.js`
- `manager-os/tests/manager-recruitment-coaching-engine-master-test.js`
- `manager-os/tests/manager-recruitment-dashboard-engine-master-test.js`
- `manager-os/tests/manager-recruitment-forecast-engine-master-test.js`
- `manager-os/tests/manager-recruitment-historical-analytics-engine-master-test.js`
- `manager-os/tests/manager-recruitment-metrics-engine-master-test.js`
- `manager-os/tests/manager-recruitment-review-plan-engine-master-test.js`
- `manager-os/tests/manager-review-plan-boundary-contract-master-test.js`
- `manager-os/tests/manager-review-plan-intelligence-engine-master-test.js`
- `manager-os/tests/manager-team-coaching-engine-master-test.js`
- `manager-os/tests/manager-team-dashboard-engine-master-test.js`
- `manager-os/tests/manager-team-forecast-engine-master-test.js`
- `manager-os/tests/manager-team-review-plan-engine-master-test.js`
- `manager-os/tests/message-safety-validator-master-test.js`
- `manager-os/tests/nash-mick-nba-reconnection-engine-master-test.js`
- `manager-os/tests/nba-reason-why-boundary-contract-master-test.js`
- `manager-os/tests/provider-connector-boundary-contract-master-test.js`
- `manager-os/tests/provider-runtime-boundary-contract-master-test.js`
- `manager-os/tests/provider-webhook-boundary-contract-master-test.js`
- `manager-os/tests/public-url-verification-boundary-contract-master-test.js`
- `manager-os/tests/quote-to-sales-presentation-context-adapter-master-test.js`
- `manager-os/tests/sales-presentation-browser-context-engine-master-test.js`
- `manager-os/tests/sales-presentation-editable-preview-master-test.js`
- `manager-os/tests/sales-presentation-engine-ownership-registry-master-test.js`
- `manager-os/tests/sales-presentation-existing-assembly-contract-e2e-master-test.js`
- `manager-os/tests/sales-presentation-export-adapter-master-test.js`
- `manager-os/tests/sales-presentation-human-approval-gate-master-test.js`
- `manager-os/tests/sales-presentation-prompt-engine-master-test.js`
- `manager-os/tests/sales-presentation-review-packet-engine-master-test.js`
- `manager-os/tests/sales-presentation-review-state-store-master-test.js`
- `manager-os/tests/sales-presentation-slide-plan-engine-master-test.js`
- `manager-os/tests/send-execution-gate-boundary-contract-master-test.js`
- `manager-os/tests/static-preview-deployment-boundary-contract-master-test.js`
- `manager-os/tests/static-preview-public-surface-decision-boundary-contract-master-test.js`
- `manager-os/tests/static-preview-release-note-boundary-contract-master-test.js`
- `manager-os/tests/static-preview-review-packet-boundary-contract-master-test.js`
- `manager-os/tests/truth-promotion-boundary-contract-master-test.js`
- `manager-os/tests/ui-read-model-boundary-contract-master-test.js`
- `manager-os/tests/ui-rendering-boundary-contract-master-test.js`
- `mick/tests/mick-manager-behavior-review-packet-intake-master-test.js`
- `mick/tests/mick-manager-context-intake-boundary-contract-master-test.js`
- `mick/tests/mick-manager-context-intake-orchestrator-master-test.js`
- `mick/tests/mick-manager-no-surveillance-guardrail-intake-master-test.js`
- `nash/tests/nash-manager-context-intake-boundary-contract-master-test.js`
- `nash/tests/nash-manager-context-intake-orchestrator-master-test.js`
- `nash/tests/nash-manager-conversation-prep-packet-intake-master-test.js`
- `nash/tests/nash-manager-safe-language-guardrail-intake-master-test.js`
- `platform/core/tests/decision-pipeline-smoke-test.js`
- `tests/advisor-pipeline-live-navigation-067g16-browser-test.mjs`
- `tests/advisor-pipeline-live-navigation-067g16-test.mjs`
- `tests/advisor-sales-pipeline-ui-067g10-test.js`
- `tests/cuaderno-point-period-test.js`
- `tests/forge-067g17b-pipeline-productive-source-test.js`
- `tests/forge-067g17n-pipeline-cockpit-browser-test.mjs`
- `tests/forge-alive-static-pipeline-mount-067g16a-browser-test.mjs`
- `tests/forge-alive-static-pipeline-mount-067g16a-test.mjs`
- `tests/manager-precontract-rda-attribution-intake-test.js`
- `tests/opportunity-pipeline-read-model-normalization-067d-test.js`
- `tests/opportunity-pipeline-read-only-adapter-066b-test.js`
- `tests/orvi-guaranteed-value-checkpoint-analytics-test.mjs`
- `tests/partner-activity-bonus-calculator-test.js`
- `tests/partner-activity-bonus-contract-test.js`
- `tests/partner-annual-productivity-bonus-calculator-test.js`
- `tests/partner-annual-productivity-bonus-contract-test.js`
- `tests/partner-annual-productivity-bonus-orchestrator-test.js`
- `tests/partner-productivity-base-calculator-test.js`
- `tests/partner-productivity-base-contract-test.js`
- `tests/partner-productivity-multiplier-calculator-test.js`
- `tests/partner-productivity-multiplier-contract-test.js`
- `tests/pipeline-ui-stage-integration-067g12-test.js`
- `tests/presentation-pipeline-test.js`

## Activity-Related Migrations and Schemas

Count: **0**

_No matching tracked files were found._

## Governance and Architecture References

Count: **46**

- `adr/ADR-016A-BENVENU-PURPOSE-SCARCITY-DIGNITY-BOUNDARY.md`
- `adr/_archive/ADR-014_ProductivityMetricOwnership_Final.txt`
- `adr/_archive/ADR-015_ManagerIntelligenceAuthority_Final.txt`
- `adr/_archive/ADR-016_AdvisorExperience_Benvenu_AntiDependence_Final.txt`
- `docs/02-adr-candidates/ADR-0022_MANAGER_OS_FIRST_CLASS_DOMAIN.md`
- `docs/02-adr-candidates/PAQ-09.5-PRODUCTIVITY-INTELLIGENCE-ARCHITECTURE-LOCK.md`
- `docs/02-adr-candidates/PAQ-09.5-PRODUCTIVITY-INTELLIGENCE-ARCHITECTURE-LOCK.txt`
- `docs/02-adr-candidates/PAQ-09-PRODUCTIVITY-INTELLIGENCE-ARQUITECTURA-CONCEPTUAL.txt`
- `docs/02-adr-candidates/PAQ-09-PRODUCTIVITY-INTELLIGENCE-DISCOVERY.md`
- `docs/02-adr-candidates/PAQ-09-PRODUCTIVITY-INTELLIGENCE-DISCOVERY.txt`
- `docs/02-adr-candidates/PAQ-09-Productivity-Intelligence.txt`
- `docs/02-adr-candidates/PAQ-12-ADVISOR-EXPERIENCE-INTELLIGENCE-PRODUCTIVITY.md`
- `docs/03-discovery/MANAGER_OS_CONSOLIDATION_REPORT.md`
- `docs/03-discovery/manager-os/MANAGER-OS-001_LEGACY_FORMAT_DISCOVERY.md`
- `docs/03-discovery/MANAGER_OS_OPEN_QUESTIONS.md`
- `docs/04-manager-os/FORGE_MANAGER_FRICTION_DISCOVERY.md`
- `docs/04-manager-os/MANAGER_COMPENSATION_KNOWLEDGE_BASE.md`
- `docs/05-readiness/MANAGER_ADVISOR_ACCESS_MODEL_001.md`
- `docs/05-readiness/MANAGER_CARRIER_SCOPED_VISIBILITY_DISCOVERY_001.md`
- `docs/07-runtime/MIGRATION-007C_NASH_BOUNDARY_NO_GO.md`
- `docs/07-runtime/NASH-001_BOUNDARY_DOCUMENTATION.md`
- `docs/architecture/performance/FORGE_PERFORMANCE_OPERATING_SYSTEM_001.md`
- `docs/architecture/source-truth/FORGE_GENESIS_PROFILE_INTAKE_AND_NASH_LOCK_001.md`
- `docs/architecture/source-truth/FORGE_NASH_PRODUCTION_CONVERSATION_ARCHITECTURE_NFAST_01.md`
- `docs/architecture/source-truth/MANAGER_OS_MESSAGE_GENERATION_PROMPT_BUILDER_SCOPE_027A.md`
- `docs/architecture/source-truth/MICK_EXISTING_ENGINE_INVENTORY_AND_PURPOSE_DISCOVERY_005B.md`
- `docs/architecture/source-truth/NASH_EXISTING_ENGINE_INVENTORY_AND_PURPOSE_DISCOVERY_005A.md`
- `docs/architecture/source-truth/NASH_FAST_TRACK_NFAST_04_DETERMINISTIC_CONVERSATION_BRIEF_CLOSURE.md`
- `docs/architecture/source-truth/NASH_FAST_TRACK_NFAST_05_PROVIDER_CONTRACT_HARDENING_CLOSURE.md`
- `docs/architecture/source-truth/NASH_MICK_NBA_RECONNECTION_IMPLEMENTATION_CLOSURE_006D.md`
- `docs/architecture/source-truth/NASH_MICK_NBA_RECONNECTION_SCOPE_006A.md`
- `docs/evidence/MANAGER_OS_ADVISOR_SIGNAL_CONSUMER_CONTRACT_CLOSURE_CERTIFICATE.md`
- `docs/evidence/MANAGER_OS_MESSAGE_GENERATION_PROMPT_BUILDER_CLOSURE_CERTIFICATE_027C.md`
- `docs/evidence/MANAGER_OS_RDA_ATTRIBUTION_TRUTH_CLOSURE_CERTIFICATE.md`
- `docs/evidence/MANAGER_OS_RDA_CONSUMER_CONTRACT_CLOSURE_CERTIFICATE.md`
- `docs/evidence/MICK_EXISTING_ENGINE_INVENTORY_AND_PURPOSE_DISCOVERY_CERTIFICATE_005B.md`
- `docs/evidence/NASH_EXISTING_ENGINE_INVENTORY_AND_PURPOSE_DISCOVERY_CERTIFICATE_005A.md`
- `docs/evidence/NASH_MICK_NBA_RECONNECTION_CLOSURE_CERTIFICATE_006D.md`
- `docs/evidence/NASH_MICK_NBA_RECONNECTION_SCOPE_CERTIFICATE_006A.md`
- `docs/roadmap/MANAGER_OS_CONTEXT_INTELLIGENCE_V1_CLOSURE_REPORT_026A.md`
- `docs/roadmap/MANAGER_OS_MESSAGE_GENERATION_PROMPT_BUILDER_SCOPE_027A.md`
- `docs/roadmap/MANAGER_OS_ROADMAP_ADDENDUM_022_EXTERNAL_CONTEXT_BRIDGE.md`
- `docs/roadmap/MANAGER_OS_ROADMAP_ADDENDUM_023_NASH_MANAGER_CONTEXT_INTAKE.md`
- `docs/roadmap/MANAGER_OS_ROADMAP_ADDENDUM_024_MICK_MANAGER_CONTEXT_INTAKE.md`
- `docs/roadmap/MANAGER_OS_ROADMAP_ADDENDUM_025_ENGAGEMENT_PRIVATE_MOTIVATION_CONTEXT_INTAKE.md`
- `docs/roadmap/MANAGER_OS_ROADMAP_LOCK_001.md`

## Selected Repository Evidence

### Daily Activity Storage and Counters

Matches: **17**

```text
actividad.js:438:                'actividad_diaria'
actividad.js:688:                'actividad_diaria',
actividad.js:696:                'actividad_diaria',
dashboard.js:84:     * @param {Array} historial — registros de actividad_diaria
dashboard.js:1417:                    () => DB.obtenerTodos('actividad_diaria'),
docs/05-readiness/SUPABASE_RLS_IMPLEMENTATION_READINESS_001.md:212:- `actividad_diaria`
docs/07-runtime/RUNTIME-012_DASHBOARD_LAZY_LOAD_PLAN.md:90:| `DB` | Reads `actividad_diaria` and `cartera`. |
docs/07-runtime/RUNTIME-012_DASHBOARD_LAZY_LOAD_PLAN.md:126:- Reads `actividad_diaria` and `cartera` from `DB`.
docs/07-runtime/RUNTIME-013_DASHBOARD_LAZY_LOAD_EXECUTION_REPORT.md:209:- Dashboard data still comes from `DB.obtenerTodos('actividad_diaria')` and `DB.obtenerTodos('cartera')`.
docs/09-live-mvp/DASHBOARD-LIVE-001_DECISION_ENGINE_SPEC.md:41:- `actividad_diaria`
docs/09-live-mvp/DASHBOARD-LIVE-001_DECISION_ENGINE_SPEC.md:156:- `actividad_diaria`
docs/09-live-mvp/LIVE-002_DECISION_COCKPIT_V0.md:51:- `actividad_diaria` records
docs/evidence/quote-preview/107z6-runtime-owner-entrypoint-or-adr-preparation-evidence.md:1975:- Events: `["actividad_diaria", "cartera", "realtime:update", "sync:completed", "sync:failed"]`
docs/evidence/quote-preview/107z6-runtime-owner-entrypoint-or-adr-preparation.json:1602:        "actividad_diaria",
platform/sync/sync-orchestrator.js:31:            'actividad_diaria',
platform/sync/sync-orchestrator.js:35:                    'actividad_diaria',
storage-engine.js:20:    'actividad_diaria',
```

### Scheduled Appointment References

Matches: **10**

```text
actividad.js:20:    citas_agendadas: 3,
actividad.js:37:    citas_agendadas: 0,
actividad.js:607:                    weekly.citas_agendadas,
actividad.js:771:        ${ActivityState.current.citas_agendadas}
daily-points-engine.js:28:    citas_agendadas: 3,
dashboard.js:45:        citas_agendadas:  2,
dashboard.js:113:                        ((reg.citas_agendadas     || 0) * p.citas_agendadas)  +
dashboard.js:531:        if (faltantes >= 15) return 'citas_agendadas';
docs/09-live-mvp/DASHBOARD-LIVE-001_DECISION_ENGINE_SPEC.md:169:- citas_agendadas
docs/09-live-mvp/LIVE-002_DECISION_COCKPIT_V0.md:57:  - citas_agendadas
```

### Closing Appointment References

Matches: **7**

```text
actividad.js:24:    citas_cierre: 3,
actividad.js:41:    citas_cierre: 0,
daily-points-engine.js:32:    citas_cierre: 3,
dashboard.js:47:        citas_cierre:     5,
dashboard.js:115:                        ((reg.citas_cierre        || 0) * p.citas_cierre)     +
docs/09-live-mvp/DASHBOARD-LIVE-001_DECISION_ENGINE_SPEC.md:171:- citas_cierre
docs/09-live-mvp/LIVE-002_DECISION_COCKPIT_V0.md:59:  - citas_cierre
```

### Paid Policy References

Matches: **19**

```text
actividad.js:28:    pagadas: 10
actividad.js:45:    pagadas: 0
actividad.js:617:                Solicitudes → Pagadas
actividad.js:622:                    weekly.pagadas,
actividad.js:773:        Pagadas:
actividad.js:774:        ${ActivityState.current.pagadas}
comisiones.js:163:        (p.renovacionesPagadas||[]).forEach(r=>{
daily-points-engine.js:16:| Pólizas Pagadas = 10
daily-points-engine.js:36:    polizas_pagadas: 10,
dashboard.js:49:        pagadas:          15,
dashboard.js:117:                        ((reg.pagadas             || 0) * p.pagadas);
docs/09-live-mvp/DASHBOARD-LIVE-001_DECISION_ENGINE_SPEC.md:173:- pagadas
docs/09-live-mvp/LIVE-002_DECISION_COCKPIT_V0.md:61:  - pagadas
docs/10-design/FORGE_GREEN_OWL_ENGINE_LOCK_001.md:49:Current activity categories include referidos, llamadas, citas agendadas, citas iniciales, citas de cierre, solicitudes and polizas pagadas.
docs/99-archive/COMPENSATION_DOMAIN_MODEL.md:497:- Primas netas pagadas GMMI initial.
docs/99-archive/COMPENSATION_DOMAIN_MODEL.md:498:- Primas netas pagadas GMMI renewal.
docs/99-archive/COMPENSATION_DOMAIN_MODEL.md:853:| Pólizas pagadas | Policies with paid first receipt / eligible payment | Input / derived | All policy-count bonuses | Period snapshot |
docs/99-archive/RECRUITMENT_KNOWLEDGE_BASE.md:841:Pólizas pagadas:
docs/architecture/performance/FORGE_PERFORMANCE_OPERATING_SYSTEM_001.md:942:> Tu racha de 43 días terminó. Durante ese periodo realizaste 61 citas iniciales, 18 citas de cierre y 11 pólizas pagadas. Ese logro permanece en tu histórico. Hoy puedes iniciar una nueva racha.
```

### Activity Event Dispatch

Matches: **24**

```text
actividad.js:496:        'actividad:updated',
actividad.js:711:            'actividad:saved',
advisor-os/referrals/referrals-engine.js:45:        ultimaActividad:
ai-context-engine.js:36:            ultimaActividad:
assistant-memory-engine.js:19:    ultimaActividad: null
docs/02-adr-candidates/PAQ-04-METRICS-OWNERSHIP-FINALIZATION.txt:582:Actividad:
docs/05-shared-commercial-model/PAQ-04-METRICS-OWNERSHIP-FINALIZATION.md:582:Actividad:
docs/07-runtime/RUNTIME-012_DASHBOARD_LAZY_LOAD_PLAN.md:34:    actividad:   { render: renderActividad,    bind: bindActividadEvents    },
docs/07-runtime/RUNTIME-012_DASHBOARD_LAZY_LOAD_PLAN.md:153:    actividad: { render: renderActividad, bind: bindActividadEvents },
docs/07-runtime/RUNTIME-012_NAVIGATION_CONTRACT.md:58:    actividad: {
docs/evidence/quote-preview/107z15e3-canonical-field-source-model-decision.json:2031:              "excerpt": "   actividades = []\n\n}) {\n\n    return {\n\n        lead: {\n\n            nombre:\n                lead.nombre,\n\n            temperatura:\n                lead.temperatura,\n\n            productoInteres:\n                lead.productoInteres,\n\n            ultimaActividad:\n                lead.ultimaActividad\n        },\n\n        advisor: {\n\n            nombre:\n             "
docs/evidence/quote-preview/107z15e3-canonical-field-source-model-decision.json:2036:              "excerpt": "{\n\n        lead: {\n\n            nombre:\n                lead.nombre,\n\n            temperatura:\n                lead.temperatura,\n\n            productoInteres:\n                lead.productoInteres,\n\n            ultimaActividad:\n                lead.ultimaActividad\n        },\n\n        advisor: {\n\n            nombre:\n                advisor.nombre,\n\n            puntos"
docs/evidence/quote-preview/107z15e3-canonical-field-source-model-decision.json:2041:              "excerpt": "   actividades = []\n\n}) {\n\n    return {\n\n        lead: {\n\n            nombre:\n                lead.nombre,\n\n            temperatura:\n                lead.temperatura,\n\n            productoInteres:\n                lead.productoInteres,\n\n            ultimaActividad:\n                lead.ultimaActividad\n        },\n\n        advisor: {\n\n            nombre:\n              "
docs/evidence/quote-preview/107z15e3-canonical-field-source-model-decision.json:2046:              "excerpt": "{\n\n        lead: {\n\n            nombre:\n                lead.nombre,\n\n            temperatura:\n                lead.temperatura,\n\n            productoInteres:\n                lead.productoInteres,\n\n            ultimaActividad:\n                lead.ultimaActividad\n        },\n\n        advisor: {\n\n            nombre:\n                advisor.nombre,\n\n            puntos:"
docs/evidence/quote-preview/107z6-runtime-owner-entrypoint-or-adr-preparation-evidence.md:2269:- Events: `["actividad:saved", "actividad:updated", "click"]`
docs/evidence/quote-preview/107z6-runtime-owner-entrypoint-or-adr-preparation.json:1837:        "actividad:saved",
docs/evidence/quote-preview/107z6-runtime-owner-entrypoint-or-adr-preparation.json:1838:        "actividad:updated",
docs/static-preview/forge-alive/forge-mobile-pattern-057d.js:24:      actividad: '<path d="M3 12h4l2-6 4 12 2-6h6"></path>',
manager-os/tests/manager-advisor-tracking-boundary-hardening-master-test.js:137:          diasSinActividad: 0,
platform/routing/route-registry.js:37:        actividad:   { render: renderActividad,    bind: bindActividadEvents    },
state-manager.js:24:            actividad: [],
tests/advisor-pipeline-live-navigation-067g16-test.mjs:17:    renderActividad: noop,
tests/partner-month7-real-income-scenario-test.js:656:      actividad: concepts.activity.amount,
tests/partner-month7-real-income-scenario-test.js:1007:  actividad: monthResult.concepts.activity.amount,
```

### Persistence References

Matches: **27**

```text
app.js:18://       → DB.init()                    (inicializa IndexedDB)
dashboard.js:1494:     * Permite cancelar fetches de IndexedDB cuando el usuario navega.
docs/07-runtime/RUNTIME-002_APP_SHELL_DEPENDENCY_MAP.md:48:| db.js | Platform | YES | Storage/IndexedDB bootstrap through DB.init(). | NO | NO |
docs/07-runtime/RUNTIME-002_PLATFORM_BOUNDARY_FINDINGS.md:17:| db.js / storage-engine.js | Local storage facade and IndexedDB. | Platform-owned. |
docs/07-runtime/RUNTIME-010_PLATFORM_BOUNDARY_AUDIT.md:22:- **Purpose:** Manages a persistent IndexedDB queue for data mutations (UPSERT/DELETE) to ensure eventual consistency when the device is offline.
docs/07-runtime/RUNTIME-010_PLATFORM_BOUNDARY_AUDIT.md:23:- **Dependency Profile:** Infrastructure-heavy (`IndexedDB`, `Network`, `Supabase`).
docs/07-runtime/RUNTIME-011_MINIMUM_BOOT_SURFACE.md:45:| Yes | `db.js` | IndexedDB initialization happens before authenticated route render. |
docs/07-runtime/RUNTIME-012_EXECUTION_READINESS.md:151:- Dashboard sections hydrate after IndexedDB reads.
docs/09-live-mvp/DASHBOARD-LIVE-001_DECISION_ENGINE_SPEC.md:11:Scope: Define how Forge computes the first three advisor decisions using existing IndexedDB data and existing live routes.
docs/09-live-mvp/DASHBOARD-LIVE-001_DECISION_ENGINE_SPEC.md:40:- IndexedDB access through existing DB usage
docs/09-live-mvp/DASHBOARD-LIVE-001_DECISION_ENGINE_SPEC.md:94:- data exists in IndexedDB
docs/09-live-mvp/DASHBOARD-LIVE-003_DECISION_TELEMETRY.md:44:Telemetry uses existing IndexedDB capability only.
docs/12-deployment/SUPABASE_AUTH_GITHUB_PAGES.md:91:- IndexedDB and local telemetry remain available.
docs/architecture/source-truth/FORGE_ADVISOR_PROSPECT_INGESTION_DECISION_067G9.md:3:Status: `REPOSITORY_INTERFACE_AND_LOCAL_TEST_ADAPTER_IMPLEMENTED`; `PRODUCTION_WRITER_IMPLEMENTED=NO`. Ingestion validates Advisor ownership, idempotency, duplicate decision and source lineage, then creates or links without destructive merge and emits an ingestion receipt. The only adapter is explicitly in-memory/test and its read model declares productionTruth false. localStorage, IndexedDB and fixtures are not canonical. A server repository requires separately approved backend infrastructure. Next: 067G10 after mandatory UI-system discovery.
docs/architecture/source-truth/GITHUB_PAGES_STATIC_PREVIEW_SCOPE_044A.md:94:- no localStorage/sessionStorage/indexedDB writes
docs/architecture/source-truth/GITHUB_PAGES_STATIC_PREVIEW_SCOPE_044A.md:160:- writesIndexedDb
docs/architecture/source-truth/GITHUB_PAGES_STATIC_PREVIEW_SCOPE_044A.md:300:30. No cookies/localStorage/sessionStorage/indexedDB writes appear.
docs/evidence/quote-preview/107z15e8-controlled-browser-canonical-persistence-integration-decision.json:943:      "snippet": "return /localStorage|sessionStorage|indexedDB|document\\.cookie|cookie\\s*=/i.test(text);",
docs/evidence/quote-preview/107z15e8b1-controlled-browser-entrypoint-discovery.json:1073:            "snippet": "return /localStorage|sessionStorage|indexedDB|document\\.cookie|cookie\\s*=/i.test(text);"
manager-os/github-pages-static-preview/github-pages-static-preview-boundary-contract.js:173:  return /localStorage|sessionStorage|indexedDB|document\.cookie|cookie\s*=/i.test(text);
```

_Excerpt limited to 20 lines; full evidence remains reproducible through repository search._

### Score References

Matches: **7306**

```text
FORGE_LARIZA_PEDRO_CAMARENA_TEST.md:3:## Presentation Score
FORGE_LARIZA_PEDRO_CAMARENA_TEST.md:5:Score: 8.5 / 10
FORGE_MANAGER_OS_BLUEPRINT.md:67:- **No Direct Leakage:** Manager OS "Veto" or "RODI" scores must **NEVER** be visible to the Advisor.
FORGE_MASTER_BUILD_TREE.md:989:- evidence-to-score provenance
FORGE_MASTER_BUILD_TREE.md:991:- scored, missing, unsupported, evidence-backed and input-backed signals
FORGE_MASTER_BUILD_TREE.md:994:Evidence-to-score provenance:
FORGE_MASTER_BUILD_TREE.md:1005:- Candidate score is not absolute truth.
FORGE_MASTER_BUILD_TREE.md:14559:- Best structural score: `7`.
FORGE_REPOSITORY_MIGRATION_PLAN.md:173:| `decision-appendix-master-test.js` | ./shared-benefit-hierarchy-engine => shared-benefit-hierarchy-engine.js<br>./shared-recovery-analysis-engine => shared-recovery-analysis-engine.js<br>./shared-decision-clarity-engine => shared-decision-clarity-engine.js<br>./shared-client-language-engine => shared-client-language-engine.js<br>./shared-price-placement-engine => shared-price-placement-engine.js<br>./shared-decision-score-engine => shared-decision-score-engine.js<br>... +1 | - |
FORGE_REPOSITORY_MIGRATION_PLAN.md:295:| `smnyl-executive-dashboard-engine.js` | ./smnyl-kpi-engine.js => smnyl-kpi-engine.js<br>./smnyl-health-score-engine.js => smnyl-health-score-engine.js<br>./smnyl-forecast-engine.js => smnyl-forecast-engine.js | `smnyl-operating-system-engine.js` |
FORGE_REPOSITORY_MIGRATION_PLAN.md:361:| `advisor-score-engine.js` | advisor-os | `advisor-os/advisor-score-engine.js` | BAJO |
FORGE_REPOSITORY_MIGRATION_PLAN.md:427:| `financial-risk-score-engine.js` | legacy | `legacy/financial-risk-score-engine.js` | MEDIO |
FORGE_REPOSITORY_MIGRATION_PLAN.md:537:| `policy-relationship-score-engine.js` | policy-operations | `policy-operations/policy-relationship-score-engine.js` | BAJO |
FORGE_REPOSITORY_MIGRATION_PLAN.md:568:| `prospect-score-engine.js` | advisor-os | `advisor-os/prospect-score-engine.js` | BAJO |
FORGE_REPOSITORY_MIGRATION_PLAN.md:590:| `referral-score-engine.js` | advisor-os | `advisor-os/referral-score-engine.js` | BAJO |
FORGE_REPOSITORY_MIGRATION_PLAN.md:932:| `advisor-score-engine.js` | advisor-os | `advisor-os/advisor-score-engine.js` | BAJO | - | 7 - Advisor OS |
FORGE_REPOSITORY_MIGRATION_PLAN.md:1027:| `decision-appendix-master-test.js` | tests | `tests/decision-appendix-master-test.js` | ALTO | ./shared-benefit-hierarchy-engine => shared-benefit-hierarchy-engine.js<br>./shared-recovery-analysis-engine => shared-recovery-analysis-engine.js<br>./shared-decision-clarity-engine => shared-decision-clarity-engine.js<br>./shared-client-language-engine => shared-client-language-engine.js<br>./shared-price-placement-engine => shared-price-placement-engine.js<br>./shared-decision-score-engine => shared-decision-score-engine.js<br>... +1 | 2 - Tests y fixtures |
FORGE_REPOSITORY_MIGRATION_PLAN.md:1098:| `financial-risk-score-engine.js` | legacy | `legacy/financial-risk-score-engine.js` | MEDIO | - | 11 - Legacy quarantine |
FORGE_REPOSITORY_MIGRATION_PLAN.md:1370:| `policy-relationship-score-engine.js` | policy-operations | `policy-operations/policy-relationship-score-engine.js` | BAJO | - | 6 - Policy operations |
FORGE_REPOSITORY_MIGRATION_PLAN.md:1413:| `prospect-score-engine.js` | advisor-os | `advisor-os/prospect-score-engine.js` | BAJO | - | 7 - Advisor OS |
FORGE_REPOSITORY_MIGRATION_PLAN.md:1445:| `referral-score-engine.js` | advisor-os | `advisor-os/referral-score-engine.js` | BAJO | - | 7 - Advisor OS |
FORGE_REPOSITORY_MIGRATION_PLAN.md:1555:| `shared-decision-score-engine.js` | shared-intelligence | `shared-intelligence/shared-decision-score-engine.js` | MEDIO | - | 3 - Shared intelligence |
FORGE_REPOSITORY_MIGRATION_PLAN.md:1596:| `smnyl-executive-dashboard-engine.js` | compensation | `compensation/smnyl-executive-dashboard-engine.js` | MEDIO | ./smnyl-kpi-engine.js => smnyl-kpi-engine.js<br>./smnyl-health-score-engine.js => smnyl-health-score-engine.js<br>./smnyl-forecast-engine.js => smnyl-forecast-engine.js | 9 - Compensation |
FORGE_REPOSITORY_MIGRATION_PLAN.md:1600:| `smnyl-health-score-engine.js` | compensation | `compensation/smnyl-health-score-engine.js` | MEDIO | - | 9 - Compensation |
```

_Excerpt limited to 24 lines; full evidence remains reproducible through repository search._

### Manager References

Matches: **14329**

```text
AGENTS.md:5:Forge OS is a Sales Operating System built for financial advisors, managers and commercial organizations.
AGENTS.md:28:Candidate → Precontract → Advisor → Manager / Partner → Director»
AGENTS.md:34:Help advisors and managers:
AGENTS.md:58:- Manager Intelligence
AGENTS.md:63:«Help advisors become more productive and managers become better developers of people.»
AGENTS.md:78:10. Forge is manager-aware
AGENTS.md:395:- Mick tracks whether the advisor, candidate, precontract candidate or manager does the behaviors that create commercial outcomes.
AGENTS.md:396:- Mick applies across Recruitment, Precontract, Advisor and Manager workflows.
AGENTS.md:425:- Manager Alerts
AGENTS.md:543:Contest Intelligence, Compensation Intelligence and Manager Compensation Intelligence are rule-based interpretations.
AGENTS.md:551:- Manager Compensation Intelligence
AGENTS.md:562:- Product Knowledge, Commission Schedules, Contest Rules and Manager Compensation Rules must remain separate.
AGENTS.md:648:## Manager & Team Intelligence
AGENTS.md:700:Help managers identify future producers.
AGENTS.md:712:→ ManagerAssignment[]
AGENTS.md:723:- Manager and office changes are assignments or events, not overwrites.
AGENTS.md:827:And tell the manager:
FORGE_CONSTITUTION_V3.md:65:| **Advisor First** | The advisor is the primary customer; the manager is secondary and exists to help develop the advisor. The system augments—*does not replace*—the advisor. | `[Repository + Constitutional]` – Advisor‑Centric Empowerment (repo) + explicit “Advisor First”. |
FORGE_CONSTITUTION_V3.md:72:| **Production Events Principle** | Production Events are facts; Career, Contest, Compensation, Conservation, and Manager Intelligence are rule-based interpretations of those facts. | `[Constitutional]`. |
FORGE_CONSTITUTION_V3.md:85:| **Continuous Improvement Loop** | Engines produce coaching, manager, and team insights that feed back into product refinement. | `[Repository]` – Council roles (Coaching Insight, Manager Alert, Team Intelligence). |
```

_Excerpt limited to 20 lines; full evidence remains reproducible through repository search._

## Source Manifest

The machine-readable manifest is published alongside this document:

- `docs/architecture/performance/ACT-01_ACTIVITY_SOURCE_MANIFEST.tsv`

## Closure

ACT-01 is closed when this report and its manifest are committed and published on `feature/activity-domain-runtime-foundation` with FES, MUI and `main` unchanged.
