# 038A UI / Read Model Boundary Scope

## Phase

- Phase: `038A_UI_READ_MODEL_SCOPE`
- Status: SCOPE CLOSED after validation.
- Next: `038B_UI_READ_MODEL_IMPLEMENTATION`.

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
```

External provider event candidate is not delivery truth.

Provider event read model candidate is not UI truth.

UI read model candidate is not UI rendering truth.

UI / Read Model Boundary is the next constitutional boundary.

It defines how Forge may prepare a read-only presentation model for advisor/manager action surfaces without becoming a CRM, dashboard, persistence layer, truth layer, or action executor.

038A scopes the boundary only.

038A does not implement UI.

038A does not render screens.

038A does not persist read models.

038A does not create delivery truth, message truth, tasks, calendar events, CRM mutations, or automatic follow-up.

## Current upstream closed layers

- `036B_EXTERNAL_DISPATCH_BOUNDARY_IMPLEMENTATION`
- `037B_PROVIDER_WEBHOOK_BOUNDARY_IMPLEMENTATION`

## UI / Read Model Boundary definition

The UI / Read Model Boundary separates:

- provider event read model candidate
- external dispatch request candidate
- executor command candidate
- delivery status review context
- warnings and limitations
- source evidence
- freshness metadata
- display labels
- recommended visible next action
- reason-why summary
- human review state

from:

- actual UI rendering
- dashboards
- CRM mutation
- persistence
- truth creation
- task/calendar creation
- send/delivery execution
- provider API calls
- automatic follow-up
- automatic retry
- ranking/punishment/HR decisions

This boundary may later prepare a read-only UI presentation model candidate, but it must not render, persist, execute, or create truth.

## Future input shape

The future 038B contract may consume:

- uiReadModelRequestId
- providerWebhookBoundaryRequestId
- externalDispatchRequestId
- sendRequestId
- deliveryRequestId
- approvalRequestId
- advisorId
- managerId
- personId
- personType
- roleViewing
- providerWebhookSnapshot
- providerEventReadModelCandidate
- providerEventType
- providerMessageRef
- channel
- statusLabel
- statusSeverity
- recommendedVisibleAction
- reasonWhySummary
- warnings
- limitations
- sourceEvidence
- sourceFreshness
- sourceOwners
- displayPolicySnapshot
- readModelPolicySnapshot
- visibilityPolicySnapshot
- auditTrail
- requestedUse
- createdAt
- expiresAt
- now

## Future output shape

The future 038B contract should output:

- uiReadModelStatus
- decision
- uiReadModelRequestId
- providerWebhookBoundaryRequestId
- externalDispatchRequestId
- sendRequestId
- advisorId
- managerId
- personId
- personType
- roleViewing
- uiPresentationModelCandidate
- visibleStatusLabel
- visibleSeverity
- visibleNextAction
- visibleReasonWhy
- visibleWarnings
- visibleLimitations
- evidenceRefs
- sourceEvidenceIds
- sourceOwners
- approvedForReadOnlyPresentationModel
- approvedForUiRendering
- rendersUi
- persistsReadModel
- createsDeliveryTruth
- createsMessageTruth
- createsTask
- createsCalendarEvent
- createsCompensationTruth
- createsPayoutTruth
- createsRevenueTruth
- createsRankingTruth
- createsPunishmentTruth
- createsHrTruth
- createsPromotionTruth
- createsAdvisorLifecycleTruth
- createsPersonalityTruth
- executesAction
- sendsMessage
- providerApiCallAllowed
- externalApiCallAllowed
- crmMutationAllowed
- automaticFollowUpAllowed
- automaticRetryAllowed
- blockedUses
- allowedUses
- missingSignals
- unknownSignals
- warnings
- limitations

## Proposed statuses

- READY_FOR_UI_READ_MODEL_REVIEW
- APPROVED_FOR_READ_ONLY_PRESENTATION_MODEL
- NEEDS_PROVIDER_WEBHOOK
- NEEDS_PROVIDER_EVENT_READ_MODEL
- NEEDS_DISPLAY_POLICY
- NEEDS_READ_MODEL_POLICY
- NEEDS_VISIBILITY_POLICY
- NEEDS_SOURCE_EVIDENCE
- NEEDS_SOURCE_OWNER
- NEEDS_SOURCE_FRESHNESS
- NEEDS_AUDIT_TRAIL
- UNSUPPORTED_VIEWER_ROLE
- UNSUPPORTED_STATUS
- EXPIRED_READ_MODEL_WINDOW
- BLOCKED
- UNKNOWN
- NOT_MODELED

## Proposed decisions

- REQUEST_UI_READ_MODEL_REVIEW
- APPROVE_READ_ONLY_PRESENTATION_MODEL
- BLOCK_UI_READ_MODEL
- NEEDS_MORE_CONTEXT
- EXPIRED
- NOT_MODELED

## Allowed uses

- UI_READ_MODEL_REVIEW
- READ_ONLY_PRESENTATION_MODEL_PREP
- ADVISOR_ACTION_CARD_PREP
- MANAGER_REVIEW_CARD_PREP
- DELIVERY_STATUS_DISPLAY_PREP
- WARNING_DISPLAY_PREP

## Forbidden uses

- UI_RENDERING
- DASHBOARD_CREATION
- CRM_MUTATION
- PERSISTENCE_WRITE
- DELIVERY_TRUTH_CREATION
- MESSAGE_TRUTH_CREATION
- AUTOMATIC_FOLLOW_UP
- AUTOMATIC_RETRY
- AUTOMATIC_SEND
- SEND_MESSAGE
- PROVIDER_API_CALL
- EXTERNAL_API_CALL
- WEBHOOK_SIDE_EFFECT
- TASK_CREATION
- CALENDAR_CREATION
- COMPENSATION_TRUTH
- PAYOUT_TRUTH
- REVENUE_TRUTH
- HUMAN_RANKING
- HR_DECISION
- PROMOTION_DECISION
- TERMINATION
- MANIPULATION
- SURVEILLANCE
- PERSONALITY_TRUTH

## Required rules for 038B implementation

Tests must prove:

1. Missing Provider Webhook snapshot blocks presentation model preparation.
2. Missing provider event read model candidate blocks.
3. Missing display policy blocks.
4. Missing read model policy blocks.
5. Missing visibility policy blocks.
6. Missing source evidence blocks.
7. Missing source owner blocks.
8. Missing source freshness blocks.
9. Stale source freshness blocks or requires review.
10. Missing audit trail blocks.
11. Unsupported viewer role blocks.
12. Unsupported status blocks.
13. Expired read model window blocks.
14. UI presentation model candidate can be prepared.
15. Actual UI rendering remains false.
16. Read model persistence remains false.
17. Delivery truth creation remains false.
18. Message truth creation remains false.
19. Task/calendar creation remains false.
20. CRM mutation remains false.
21. Provider/external API calls remain false.
22. Automatic follow-up/retry remains false.
23. Send execution remains false.
24. Compensation/revenue/payout truth remains false.
25. Ranking/punishment/HR/personality truth remains false.
26. Forbidden uses are blocked.
27. Allowed uses are allowed.
28. Inputs are not mutated.
29. Evidence/source/sourceOwners dedupe.
30. Warnings and limitations remain visible.

## Relationship to Provider Webhook Boundary

Provider Webhook Boundary prepares a provider event read model candidate.

UI / Read Model Boundary consumes that candidate.

A read model candidate is not truth, persistence, rendering, or action execution.

## Relationship to Audit / Persistence

Audit / Persistence remains separate.

038B may prepare a read-only presentation model candidate.

038B must not persist read models, create truth, or mutate CRM.

## Example scenarios

- Provider Webhook Boundary validates a delivery event candidate. UI / Read Model may prepare a visible status card candidate, but must not create delivery truth.
- A warning exists. UI / Read Model must preserve it visibly.
- Viewer role is unsupported. UI / Read Model blocks.
- Source freshness is stale. UI / Read Model blocks or requires review.

## Open next phases

- `038B_UI_READ_MODEL_IMPLEMENTATION`
- Audit / Persistence Scope
- Truth Promotion Boundary Scope

## Forge Council Review

- Miranda: Read-only presentation is scoped before any UI or persistence exists.
- Arqui Juve: Architecture stays maintainable because read model, UI rendering, persistence, and truth remain separate.
- Joy Mangano: Practical utility increases because advisors/managers can later see clear action surfaces.
- Nash: Conversation feedback remains visible but not converted into action automatically.
- Mick: Behavior coaching avoids false conclusions from unpromoted provider events.
- Patch Adams: Trust is preserved because warnings and limitations remain visible.
- Chris Gardner: Execution improves because status context becomes understandable without becoming truth.
- Rocky: Consistency improves because evidence, freshness, and audit are mandatory.
- Nicky Spurgeon: Outreach remains ethical because automatic follow-up is blocked.
- Jordan Belfort: Conversion remains bounded by anti-manipulation and no-auto-send rules.
- Jurgen Klaric: Psychology supports voluntary action through clarity, not coercive automation.

## Final decision

SEMAFORO=PASS
DECISION=PASS_038A_UI_READ_MODEL_SCOPE_READY_FOR_IMPLEMENTATION
NEXT=038B_UI_READ_MODEL_IMPLEMENTATION
