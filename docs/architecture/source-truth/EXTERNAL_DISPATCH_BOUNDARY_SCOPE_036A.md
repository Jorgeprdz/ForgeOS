# 036A External Dispatch Boundary Scope

## Phase

- Phase: `036A_EXTERNAL_DISPATCH_BOUNDARY_SCOPE`
- Status: SCOPE CLOSED after validation.
- Next: `036B_EXTERNAL_DISPATCH_BOUNDARY_IMPLEMENTATION`.

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
```

Connector execution handoff is not connector executor execution.

Executor command candidate is not external dispatch.

External Dispatch Boundary is the next constitutional boundary.

It defines the final external-action boundary before any actual outside-world dispatch could ever be modeled.

036A scopes the boundary only.

036A does not implement dispatch.

036A does not call WhatsApp, SMS, email, calendar, tasks, CRM, queue, webhook, provider APIs, or any external API.

## Current upstream closed layers

- `034B_CONNECTOR_EXECUTION_GATE_IMPLEMENTATION`
- `035B_CONNECTOR_EXECUTOR_BOUNDARY_IMPLEMENTATION`

## External Dispatch Boundary definition

The External Dispatch Boundary separates:

- executor command candidate
- connector executor readiness
- final dispatch confirmation
- idempotency key
- audit trail
- credential review
- executor policy
- rate-limit review
- retry policy
- dry-run intent

from:

- real external API call
- provider dispatch
- WhatsApp/SMS/email send
- connector invocation
- executor invocation
- queue execution
- scheduled execution
- webhook side effects
- task/calendar creation
- credential material exposure

This boundary may later prepare an external dispatch request candidate, but it must not execute it.

## Future input shape

The future 036B contract may consume:

- externalDispatchRequestId
- connectorExecutorRequestId
- connectorExecutionGateRequestId
- providerConnectorRequestId
- providerRuntimeRequestId
- sendRequestId
- deliveryRequestId
- approvalRequestId
- advisorId
- managerId
- senderId
- senderRole
- personId
- personType
- connectorExecutorSnapshot
- executorCommandCandidate
- connectorInvocationCandidate
- providerPayloadCandidate
- providerName
- providerConnectorName
- connectorExecutorName
- externalDispatchMode
- channel
- recipientDestination
- finalSendText
- idempotencyKey
- dryRun
- environment
- finalExternalDispatchConfirmation
- credentialReviewSnapshot
- executorCapabilitySnapshot
- executorPolicySnapshot
- dispatchCapabilitySnapshot
- dispatchPolicySnapshot
- rateLimitSnapshot
- retryPolicySnapshot
- auditTrail
- sourceEvidence
- warnings
- limitations
- requestedUse
- createdAt
- confirmedAt
- expiresAt
- now

## Future output shape

The future 036B contract should output:

- externalDispatchBoundaryStatus
- decision
- externalDispatchRequestId
- connectorExecutorRequestId
- connectorExecutionGateRequestId
- sendRequestId
- providerName
- providerConnectorName
- connectorExecutorName
- externalDispatchMode
- channel
- idempotencyKey
- dryRun
- externalDispatchRequestCandidate
- executorCommandCandidate
- approvedForExternalDispatchPreparation
- approvedForExternalDispatchExecution
- externalDispatchAllowed
- externalApiCallAllowed
- executorInvocationAllowed
- connectorInvocationAllowed
- providerDispatchAllowed
- sendsMessage
- credentialMaterialExposed
- retryAllowed
- queueExecutionAllowed
- scheduledExecutionAllowed
- webhookSideEffectAllowed
- automaticSendAllowed
- silentSendAllowed
- humanSendConfirmationRequired
- externalDispatchConfirmationRequired
- connectorExecutorBoundaryRequired
- externalDispatchAuditRequired
- blockedUses
- allowedUses
- missingSignals
- unknownSignals
- warnings
- limitations
- createsTask: false
- createsCalendarEvent: false
- createsCompensationTruth: false
- createsPayoutTruth: false
- createsRevenueTruth: false
- createsRankingTruth: false
- createsPunishmentTruth: false
- createsHrTruth: false
- createsPromotionTruth: false
- createsAdvisorLifecycleTruth: false
- createsPersonalityTruth: false

## Proposed statuses

- READY_FOR_EXTERNAL_DISPATCH_REVIEW
- APPROVED_FOR_EXTERNAL_DISPATCH_PREPARATION
- APPROVED_FOR_EXTERNAL_DISPATCH_DRY_RUN_ONLY
- NEEDS_CONNECTOR_EXECUTOR
- NEEDS_EXECUTOR_COMMAND_CANDIDATE
- NEEDS_EXTERNAL_DISPATCH_CONFIRMATION
- NEEDS_DISPATCH_CAPABILITY
- NEEDS_DISPATCH_POLICY
- NEEDS_IDEMPOTENCY_KEY
- NEEDS_AUDIT_TRAIL
- NEEDS_CREDENTIAL_REVIEW
- NEEDS_RATE_LIMIT_REVIEW
- NEEDS_RETRY_POLICY
- UNSUPPORTED_DISPATCH_MODE
- UNSUPPORTED_EXECUTOR
- UNSUPPORTED_CONNECTOR
- UNSUPPORTED_PROVIDER
- UNSUPPORTED_CHANNEL
- EXPIRED_DISPATCH_WINDOW
- BLOCKED
- UNKNOWN
- NOT_MODELED

## Proposed decisions

- REQUEST_EXTERNAL_DISPATCH_REVIEW
- APPROVE_EXTERNAL_DISPATCH_PREPARATION
- APPROVE_EXTERNAL_DISPATCH_DRY_RUN_ONLY
- BLOCK_EXTERNAL_DISPATCH
- NEEDS_MORE_CONTEXT
- EXPIRED
- NOT_MODELED

## Allowed uses

- EXTERNAL_DISPATCH_REVIEW
- EXTERNAL_DISPATCH_REQUEST_PREP
- EXTERNAL_DISPATCH_DRY_RUN_PREP
- WHATSAPP_DISPATCH_REVIEW
- SMS_DISPATCH_REVIEW
- EMAIL_DISPATCH_REVIEW

## Forbidden uses

- AUTOMATIC_SEND
- SILENT_SEND
- AI_SELF_SEND
- EXTERNAL_API_CALL
- EXTERNAL_DISPATCH
- EXECUTOR_INVOCATION
- CONNECTOR_INVOCATION
- CONNECTOR_EXECUTION
- PROVIDER_DISPATCH
- SEND_MESSAGE
- DISPATCH_WITHOUT_EXECUTOR_BOUNDARY
- DISPATCH_WITHOUT_HUMAN_CONFIRMATION
- DISPATCH_WITHOUT_IDEMPOTENCY
- DISPATCH_WITHOUT_AUDIT
- DISPATCH_WITHOUT_CREDENTIAL_REVIEW
- CREDENTIAL_MATERIAL_EXPOSURE
- WHATSAPP_API_SEND
- SMS_API_SEND
- EMAIL_API_SEND
- SCHEDULED_SEND
- QUEUE_EXECUTION
- RETRY_WITHOUT_POLICY
- WEBHOOK_SIDE_EFFECT
- AUTOMATIC_TASK_CREATION
- AUTOMATIC_CALENDAR_CREATION
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

## Required rules for 036B implementation

Tests must prove:

1. Missing Connector Executor snapshot blocks external dispatch preparation.
2. Missing executor command candidate blocks external dispatch preparation.
3. Missing final external dispatch confirmation blocks external dispatch preparation.
4. Missing dispatch capability blocks external dispatch preparation.
5. Missing dispatch policy blocks external dispatch preparation.
6. Missing idempotency key blocks external dispatch preparation.
7. Missing audit trail blocks external dispatch preparation.
8. Missing credential review blocks external dispatch preparation.
9. Missing rate-limit review blocks external dispatch preparation.
10. Retry without policy blocks external dispatch preparation.
11. Unsupported dispatch mode blocks external dispatch preparation.
12. Unsupported executor blocks external dispatch preparation.
13. Unsupported connector blocks external dispatch preparation.
14. Unsupported provider blocks external dispatch preparation.
15. Unsupported channel blocks external dispatch preparation.
16. Expired dispatch window blocks external dispatch preparation.
17. External API call remains false.
18. External dispatch execution remains false.
19. Executor invocation remains false.
20. Connector invocation remains false.
21. Provider dispatch remains false.
22. Sends message remains false.
23. Credential material exposure remains false.
24. Queue execution remains false.
25. Scheduled execution remains false.
26. Webhook side effects remain false.
27. Dry-run can be modeled without dispatch.
28. External dispatch request candidate can be prepared without external call.
29. Automatic send is blocked.
30. Silent send is blocked.
31. AI self-send is blocked.
32. Boundary does not create tasks/calendar.
33. Boundary does not create compensation/revenue/payout truth.
34. Boundary does not create ranking/punishment/HR/personality truth.
35. Inputs are not mutated.
36. Forbidden uses are blocked.
37. Allowed uses are allowed.
38. Audit is required.

## Relationship to Connector Executor Boundary

Connector Executor Boundary prepares an executor command candidate.

External Dispatch Boundary consumes that candidate.

An executor command candidate is not external dispatch.

## Relationship to actual outside-world dispatch

Actual outside-world dispatch must remain separate and requires future explicit constitutional approval.

036B may prepare an external dispatch request candidate when all gates pass.

036B must not directly call external APIs or send messages.

## Example scenarios

- Connector Executor prepares a Twilio command candidate. External Dispatch Boundary may prepare an external dispatch request candidate, but must not call Twilio.
- Final external dispatch confirmation is missing. External Dispatch Boundary blocks.
- Dispatch policy is missing. External Dispatch Boundary blocks.
- Dry-run mode may approve request preparation without dispatch.

## Open next phases

- `036B_EXTERNAL_DISPATCH_BOUNDARY_IMPLEMENTATION`
- Provider Webhook Boundary Scope
- UI / Read Model
- Audit / Persistence

## Forge Council Review

- Miranda: External dispatch is scoped before any outside-world action exists.
- Arqui Juve: Architecture stays maintainable because dispatch preparation and actual dispatch remain separate.
- Joy Mangano: Practical utility increases while preserving human control.
- Nash: Conversation delivery remains protected before the final outside-world edge.
- Mick: Execution remains accountable, not automatic pressure.
- Patch Adams: Trust is preserved because outside-world dispatch is not silent.
- Chris Gardner: Execution improves because dispatch readiness becomes auditable.
- Rocky: Consistency improves because confirmation, idempotency, and audit are mandatory.
- Nicky Spurgeon: Outreach remains ethical because external dispatch is blocked.
- Jordan Belfort: Conversion remains bounded by anti-manipulation and no-auto-send rules.
- Jurgen Klaric: Psychology supports voluntary action, not coercive automation.

## Final decision

SEMAFORO=PASS
DECISION=PASS_036A_EXTERNAL_DISPATCH_BOUNDARY_SCOPE_READY_FOR_IMPLEMENTATION
NEXT=036B_EXTERNAL_DISPATCH_BOUNDARY_IMPLEMENTATION
