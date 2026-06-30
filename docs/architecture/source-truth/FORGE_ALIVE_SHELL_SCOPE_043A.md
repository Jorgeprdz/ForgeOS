# 043A Forge Alive Shell Scope

## Phase

- Phase: `043A_FORGE_ALIVE_SHELL_SCOPE`
- Status: SCOPE CLOSED after validation.
- Next: `043B_FORGE_ALIVE_SHELL_IMPLEMENTATION`.

## GitHub Pages Availability Note

GitHub Pages is available as an optional future static hosting surface.

This does not authorize deployment in 043A.

This does not authorize a live app in 043A.

This does not authorize API calls, secrets, connectors, CRM mutation, persistence, analytics, tracking, or automatic actions.

If used later, GitHub Pages must be treated as a static read-only preview surface only, unless a separate Hosting / Deployment Boundary authorizes more.

## Closure Visibility Rule

Modulo cerrado sin Unified Build Tree actualizado = NO CERRADO.

## Why this exists

Forge now has:

```text
NBA Reason Why
-> Prompt Builder
-> LLM Draft Intake
-> Message Safety Validator
-> Human Approval Gate
-> Delivery Adapter Boundary
-> Send Execution Gate
-> Provider Runtime Boundary
-> Provider Connector Boundary
-> Connector Execution Gate
-> Connector Executor Boundary
-> External Dispatch Boundary
-> Provider Webhook Boundary
-> UI / Read Model Boundary
-> Audit / Persistence Boundary
-> Truth Promotion Boundary
-> Canonical Truth Registry Boundary
-> UI Rendering Boundary
```

UI rendering candidate is not user interface execution.

Forge Alive Shell candidate is not a live app.

GitHub Pages availability is not deployment authorization.

Forge Alive Shell is the next constitutional boundary.

It defines the first read-only shell that can make Forge feel alive by arranging already-safe render model candidates into a human-facing structure: status, reason why, warnings, limitations, source trace, blocked surfaces, and next review action.

043A scopes the shell only.

043A does not implement UI.

043A does not deploy to GitHub Pages.

043A does not create dashboard truth.

043A does not create routes or execute components.

043A does not persist state.

043A does not write canonical truth.

043A does not create business, metric, economic, compensation, revenue, payout, HR, ranking, lifecycle, or personality truth.

043A does not mutate CRM.

043A does not create tasks or calendar events.

043A does not call APIs.

043A does not execute actions.

## Current upstream closed layers

- `041B_CANONICAL_TRUTH_REGISTRY_IMPLEMENTATION`
- `042B_UI_RENDERING_BOUNDARY_IMPLEMENTATION`

## Forge Alive Shell definition

The Forge Alive Shell separates:

- read-only render model candidate
- Forge Alive card candidate
- signal card candidate
- status card candidate
- reason why card candidate
- warning / limitation card candidate
- source trace card candidate
- next review action card candidate
- empty state candidate
- blocked state candidate
- viewer role
- visual layout policy
- shell safety policy
- static hosting policy
- GitHub Pages availability note
- audit trail

from:

- actual UI rendering
- live route creation
- component execution
- app deployment
- GitHub Pages publish
- authentication
- API calls
- analytics / tracking
- persistence write
- canonical truth write
- business/metric/economic truth creation
- compensation/revenue/payout truth
- ranking/punishment/HR/personality truth
- advisor lifecycle truth
- task/calendar creation
- CRM mutation
- provider/external API calls
- send/action execution

This boundary may later prepare a Forge Alive Shell candidate, but it must not deploy it or run it as an app.

## Future input shape

The future 043B contract may consume:

- forgeAliveShellRequestId
- uiRenderingRequestId
- canonicalTruthRegistryRequestId
- truthPromotionRequestId
- auditPersistenceRequestId
- uiReadModelRequestId
- advisorId
- managerId
- viewerId
- viewerRole
- uiRenderingSnapshot
- forgeAliveRenderModelCandidate
- readOnlyActionCardCandidate
- signalCards
- statusCards
- reasonWhyCards
- warningCards
- limitationCards
- sourceTraceCards
- nextReviewActionCards
- emptyStateCandidate
- blockedStateCandidate
- layoutPolicySnapshot
- shellSafetyPolicySnapshot
- staticHostingPolicySnapshot
- githubPagesAvailabilitySnapshot
- privacyPolicySnapshot
- sourceEvidence
- sourceFreshness
- sourceOwners
- auditTrail
- idempotencyKey
- requestedUse
- createdAt
- expiresAt
- now

## Future output shape

The future 043B contract should output:

- forgeAliveShellStatus
- decision
- forgeAliveShellRequestId
- uiRenderingRequestId
- viewerId
- viewerRole
- forgeAliveShellCandidate
- shellSections
- visibleCards
- visibleStatuses
- visibleReasonsWhy
- visibleWarnings
- visibleLimitations
- visibleSourceTrace
- visibleNextReviewActions
- allowedStaticPreviewCandidate
- eligibleForForgeAliveShellCandidate
- approvedForUiRendering
- rendersUi
- deploysApp
- publishesGitHubPages
- createsRoute
- executesComponent
- enablesInteractiveAction
- persistsState
- writesCanonicalTruth
- createsBusinessTruth
- createsMetricTruth
- createsEconomicTruth
- createsDeliveryTruth
- createsMessageTruth
- createsCompensationTruth
- createsPayoutTruth
- createsRevenueTruth
- createsRankingTruth
- createsPunishmentTruth
- createsHrTruth
- createsPromotionTruth
- createsAdvisorLifecycleTruth
- createsPersonalityTruth
- createsTask
- createsCalendarEvent
- mutatesCrm
- callsProviderApi
- callsExternalApi
- executesAction
- sendsMessage
- blockedUses
- allowedUses
- missingSignals
- unknownSignals
- warnings
- limitations
- evidenceRefs
- sourceEvidenceIds
- sourceOwners

## Proposed statuses

- READY_FOR_FORGE_ALIVE_SHELL_REVIEW
- APPROVED_FOR_FORGE_ALIVE_SHELL_CANDIDATE
- NEEDS_UI_RENDERING_BOUNDARY
- NEEDS_RENDER_MODEL_CANDIDATE
- NEEDS_LAYOUT_POLICY
- NEEDS_SHELL_SAFETY_POLICY
- NEEDS_STATIC_HOSTING_POLICY
- NEEDS_GITHUB_PAGES_REVIEW
- NEEDS_PRIVACY_POLICY
- NEEDS_VIEWER_ROLE
- NEEDS_SOURCE_EVIDENCE
- NEEDS_SOURCE_OWNER
- NEEDS_SOURCE_FRESHNESS
- STALE_SOURCE_FRESHNESS
- NEEDS_IDEMPOTENCY_KEY
- NEEDS_AUDIT_TRAIL
- UNSUPPORTED_VIEWER_ROLE
- UNSUPPORTED_SHELL_SECTION
- GITHUB_PAGES_DEPLOY_NOT_AUTHORIZED
- LIVE_APP_NOT_AUTHORIZED
- EXPIRED_FORGE_ALIVE_SHELL_WINDOW
- BLOCKED
- UNKNOWN
- NOT_MODELED

## Proposed decisions

- REQUEST_FORGE_ALIVE_SHELL_REVIEW
- APPROVE_FORGE_ALIVE_SHELL_CANDIDATE
- BLOCK_FORGE_ALIVE_SHELL
- NEEDS_MORE_CONTEXT
- EXPIRED
- NOT_MODELED

## Allowed uses

- FORGE_ALIVE_SHELL_REVIEW
- FORGE_ALIVE_SHELL_CANDIDATE_PREP
- READ_ONLY_SHELL_PREP
- STATIC_PREVIEW_CANDIDATE_PREP
- SIGNAL_CARD_LAYOUT_PREP
- SOURCE_TRACE_PANEL_PREP
- WARNING_LIMITATION_PANEL_PREP

## Forbidden uses

- UI_RENDERING
- LIVE_APP_EXECUTION
- GITHUB_PAGES_DEPLOY
- APP_DEPLOYMENT
- ROUTE_CREATION
- COMPONENT_EXECUTION
- INTERACTIVE_ACTION
- AUTHENTICATION
- ANALYTICS_TRACKING
- PERSISTENCE_WRITE
- CANONICAL_TRUTH_WRITE
- BUSINESS_TRUTH_CREATION
- METRIC_TRUTH_CREATION
- ECONOMIC_TRUTH_CREATION
- DELIVERY_TRUTH_CREATION
- MESSAGE_TRUTH_CREATION
- COMPENSATION_TRUTH
- PAYOUT_TRUTH
- REVENUE_TRUTH
- HUMAN_RANKING
- HR_DECISION
- PROMOTION_DECISION
- TERMINATION
- ADVISOR_LIFECYCLE_TRUTH
- PERSONALITY_TRUTH
- TASK_CREATION
- CALENDAR_CREATION
- CRM_MUTATION
- PROVIDER_API_CALL
- EXTERNAL_API_CALL
- SEND_MESSAGE
- ACTION_EXECUTION
- MANIPULATION
- SURVEILLANCE

## Required rules for 043B implementation

Tests must prove:

1. Missing UI Rendering Boundary snapshot blocks shell candidate preparation.
2. Missing render model candidate blocks.
3. Missing layout policy blocks.
4. Missing shell safety policy blocks.
5. Missing static hosting policy blocks.
6. Missing GitHub Pages review blocks when GitHub Pages is requested.
7. Missing privacy policy blocks.
8. Missing viewer role blocks.
9. Missing source evidence blocks.
10. Missing source owner blocks.
11. Missing source freshness blocks.
12. Stale source freshness blocks or requires review.
13. Missing idempotency key blocks.
14. Missing audit trail blocks.
15. Unsupported viewer role blocks.
16. Unsupported shell section blocks.
17. GitHub Pages deployment is blocked.
18. Live app execution is blocked.
19. Expired Forge Alive shell window blocks.
20. Forge Alive shell candidate can be prepared.
21. Actual UI rendering remains false.
22. GitHub Pages publish remains false.
23. App deployment remains false.
24. Route/component execution remains false.
25. Interactive action remains false.
26. Authentication remains false.
27. Analytics/tracking remains false.
28. Persistence remains false.
29. Canonical truth write remains false.
30. Business/metric/economic truth creation remains false.
31. Delivery/message truth creation remains false.
32. Compensation/revenue/payout truth remains false.
33. Ranking/punishment/HR/personality truth remains false.
34. Advisor lifecycle truth remains false.
35. Task/calendar creation remains false.
36. CRM mutation remains false.
37. Provider/external API calls remain false.
38. Send/action execution remains false.
39. Forbidden uses are blocked.
40. Allowed uses are allowed.
41. Inputs are not mutated.
42. Evidence/source/sourceOwners dedupe.
43. Warnings and limitations remain visible.
44. Source trace remains visible.
45. Empty and blocked states are represented safely.
46. GitHub Pages availability is preserved as infrastructure note only.
47. Forge Alive shell candidate is read-only.
48. Metric / Economic Truth remains separate.

## Forge Alive MVP Direction

The first Forge Alive Shell should feel like:

```text
Forge está despierto.
Forge ve señales.
Forge entiende por qué algo importa.
Forge muestra advertencias.
Forge muestra qué está bloqueado.
Forge explica el siguiente paso de revisión.
Forge no ejecuta nada sin permiso.
```

Initial sections:

- Signal Inbox
- Reason Why Panel
- Warnings / Limitations Panel
- Source Trace Panel
- Review Queue
- Blocked Surfaces Panel
- Next Review Action Panel
- System Health Strip

## GitHub Pages Future Use

GitHub Pages may later host a static read-only preview if and only if:

- no secrets
- no live API calls
- no provider connectors
- no CRM mutation
- no analytics/tracking unless separately scoped
- no authentication unless separately scoped
- no persistence
- no truth writes
- no action execution
- no personal sensitive production data
- all data is mock, redacted, or explicitly safe sample data
- a hosting/deployment boundary or shell implementation explicitly permits static preview candidate only

043A does not deploy.

043B should still not deploy.

A later phase may create a GitHub Pages Static Preview Boundary if needed.

## Relationship to Metric / Economic Truth

Metric / Economic Truth remains separate and planned.

Forge Alive Shell must not calculate or display compensation, revenue, payout, ranking, or economic conclusions.

## Open next phases

- `043B_FORGE_ALIVE_SHELL_IMPLEMENTATION`
- `044A_GITHUB_PAGES_STATIC_PREVIEW_SCOPE` if needed
- Metric / Economic Truth Scope

## Forge Council Review

- Miranda: Shell is scoped as read-only before any live UI exists.
- Arqui Juve: Architecture stays maintainable because shell, rendering, hosting, persistence, truth, and actions remain separate.
- Joy Mangano: Practical utility increases because Forge becomes visible without becoming risky.
- Nash: Conversation intelligence can be shown as explanation, not automatic action.
- Mick: Behavior signals can be displayed without scoring or punishment.
- Patch Adams: Trust is preserved because limitations and source trace remain visible.
- Chris Gardner: Execution improves because advisors see what needs review.
- Rocky: Consistency improves because every section is read-only and evidence-backed.
- Nicky Spurgeon: Outreach remains ethical because no interactive send or CRM mutation exists.
- Jordan Belfort: Conversion remains bounded by no manipulation, no auto-send, and no hidden action.
- Jurgen Klaric: Psychology supports voluntary action through clarity, not coercion.

## Final decision

SEMAFORO=PASS
DECISION=PASS_043A_FORGE_ALIVE_SHELL_SCOPE_READY_FOR_IMPLEMENTATION
NEXT=043B_FORGE_ALIVE_SHELL_IMPLEMENTATION

<!-- BEGIN FORGEOS:FORGE_ALIVE_SHELL_IMPLEMENTATION_APPENDIX_043B -->
## 043B Implementation Appendix

- `043B_FORGE_ALIVE_SHELL_IMPLEMENTATION` implemented Forge Alive Shell Boundary Contract.
- Forge Alive Shell candidate is not a live app.
- GitHub Pages availability is not deployment authorization.
- Forge Alive shell candidate can be prepared.
- Actual UI rendering remains false.
- GitHub Pages publish remains false.
- App deployment, routes, components, authentication, analytics/tracking remain false.
- Persistence, truth, CRM mutation, task/calendar, API calls, and action execution remain false.
- Metric / Economic Truth remains separate and planned.
- Unified Build Tree updated.
- Next: `044A_GITHUB_PAGES_STATIC_PREVIEW_SCOPE`
<!-- END FORGEOS:FORGE_ALIVE_SHELL_IMPLEMENTATION_APPENDIX_043B -->
