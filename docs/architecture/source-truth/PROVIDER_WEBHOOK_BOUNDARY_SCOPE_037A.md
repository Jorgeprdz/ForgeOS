# 037A Provider Webhook Boundary Scope

## Phase

- Phase: `037A_PROVIDER_WEBHOOK_BOUNDARY_SCOPE`
- Status: SCOPE CLOSED after validation.
- Next: `037B_PROVIDER_WEBHOOK_BOUNDARY_IMPLEMENTATION`.

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
```

External dispatch request candidate is not external dispatch.

External dispatch preparation is not provider webhook handling.

Provider Webhook Boundary is the next constitutional boundary.

It defines how Forge may model provider webhook intake/readiness after external dispatch preparation without registering webhooks, opening listeners, calling provider APIs, creating truth, creating tasks, creating calendar events, or treating external provider status as verified business truth.

037A scopes the boundary only.

037A does not implement webhook handling.

037A does not call WhatsApp, SMS, email, calendar, tasks, CRM, queue, webhook, provider APIs, or any external API.

## Current upstream closed layers

- `035B_CONNECTOR_EXECUTOR_BOUNDARY_IMPLEMENTATION`
- `036B_EXTERNAL_DISPATCH_BOUNDARY_IMPLEMENTATION`

## Provider Webhook Boundary definition

The Provider Webhook Boundary separates:

- external dispatch request candidate
- provider webhook event candidate
- webhook source metadata
- signature verification snapshot
- idempotency key
- provider event type
- provider message reference
- audit trail
- dedupe review
- replay protection review
- schema validation snapshot

from:

- real webhook listener registration
- external provider API call
- provider delivery truth
- message delivery truth
- task/calendar creation
- compensation/revenue/payout truth
- CRM mutation
- automatic follow-up
- automatic retry
- webhook side effects

This boundary may later validate a webhook event candidate and prepare a provider event read model candidate, but it must not create truth or side effects.

## Future input shape

The future 037B contract may consume:

- providerWebhookBoundaryRequestId
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
- personId
- personType
- externalDispatchSnapshot
- externalDispatchRequestCandidate
- webhookEventCandidate
- providerName
- providerConnectorName
- connectorExecutorName
- externalDispatchMode
- channel
- providerMessageRef
- providerEventType
- providerEventTimestamp
- idempotencyKey
- replayProtectionSnapshot
- signatureVerificationSnapshot
- webhookSchemaValidationSnapshot
- webhookCapabilitySnapshot
- webhookPolicySnapshot
- dedupeSnapshot
- auditTrail
- sourceEvidence
- warnings
- limitations
- requestedUse
- createdAt
- receivedAt
- expiresAt
- now

## Future output shape

The future 037B contract should output:

- providerWebhookBoundaryStatus
- decision
- providerWebhookBoundaryRequestId
- externalDispatchRequestId
- sendRequestId
- providerName
- providerConnectorName
- connectorExecutorName
- externalDispatchMode
- channel
- providerMessageRef
- providerEventType
- idempotencyKey
- webhookEventCandidate
- providerEventReadModelCandidate
- approvedForWebhookIntakeReview
- approvedForWebhookSideEffects
- webhookSideEffectAllowed
- externalApiCallAllowed
- providerApiCallAllowed
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
- automaticFollowUpAllowed
- automaticRetryAllowed
- crmMutationAllowed
- blockedUses
- allowedUses
- missingSignals
- unknownSignals
- warnings
- limitations

## Proposed statuses

- READY_FOR_WEBHOOK_REVIEW
- APPROVED_FOR_WEBHOOK_READ_MODEL_PREPARATION
- NEEDS_EXTERNAL_DISPATCH
- NEEDS_WEBHOOK_EVENT_CANDIDATE
- NEEDS_PROVIDER_MESSAGE_REF
- NEEDS_PROVIDER_EVENT_TYPE
- NEEDS_SIGNATURE_VERIFICATION
- NEEDS_SCHEMA_VALIDATION
- NEEDS_REPLAY_PROTECTION
- NEEDS_DEDUPE_REVIEW
- NEEDS_WEBHOOK_CAPABILITY
- NEEDS_WEBHOOK_POLICY
- NEEDS_IDEMPOTENCY_KEY
- NEEDS_AUDIT_TRAIL
- UNSUPPORTED_PROVIDER
- UNSUPPORTED_CHANNEL
- UNSUPPORTED_EVENT_TYPE
- EXPIRED_WEBHOOK_WINDOW
- BLOCKED
- UNKNOWN
- NOT_MODELED

## Proposed decisions

- REQUEST_WEBHOOK_REVIEW
- APPROVE_WEBHOOK_READ_MODEL_PREPARATION
- BLOCK_WEBHOOK
- NEEDS_MORE_CONTEXT
- EXPIRED
- NOT_MODELED

## Allowed uses

- PROVIDER_WEBHOOK_REVIEW
- PROVIDER_WEBHOOK_READ_MODEL_PREP
- WHATSAPP_WEBHOOK_REVIEW
- SMS_WEBHOOK_REVIEW
- EMAIL_WEBHOOK_REVIEW
- DELIVERY_STATUS_REVIEW
- BOUNCE_STATUS_REVIEW

## Forbidden uses

- WEBHOOK_LISTENER_REGISTRATION
- WEBHOOK_SIDE_EFFECT
- EXTERNAL_API_CALL
- PROVIDER_API_CALL
- PROVIDER_DISPATCH
- EXTERNAL_DISPATCH
- EXECUTOR_INVOCATION
- CONNECTOR_INVOCATION
- SEND_MESSAGE
- DELIVERY_TRUTH_CREATION
- MESSAGE_TRUTH_CREATION
- CRM_MUTATION
- AUTOMATIC_FOLLOW_UP
- AUTOMATIC_RETRY
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

## Required rules for 037B implementation

Tests must prove:

1. Missing External Dispatch snapshot blocks webhook read model preparation.
2. Missing webhook event candidate blocks.
3. Missing provider message reference blocks.
4. Missing provider event type blocks.
5. Missing signature verification blocks.
6. Missing schema validation blocks.
7. Missing replay protection blocks.
8. Missing dedupe review blocks.
9. Missing webhook capability blocks.
10. Missing webhook policy blocks.
11. Missing idempotency key blocks.
12. Missing audit trail blocks.
13. Unsupported provider blocks.
14. Unsupported channel blocks.
15. Unsupported event type blocks.
16. Expired webhook window blocks.
17. External API call remains false.
18. Provider API call remains false.
19. Webhook side effects remain false.
20. Delivery truth creation remains false.
21. Message truth creation remains false.
22. CRM mutation remains false.
23. Automatic follow-up remains false.
24. Automatic retry remains false.
25. Task/calendar creation remains false.
26. Compensation/revenue/payout truth remains false.
27. Ranking/punishment/HR/personality truth remains false.
28. Provider event read model candidate can be prepared without truth.
29. Forbidden uses are blocked.
30. Allowed uses are allowed.
31. Inputs are not mutated.
32. Evidence/source/sourceOwners dedupe.
33. Audit is required.

## Relationship to External Dispatch Boundary

External Dispatch Boundary prepares an external dispatch request candidate.

Provider Webhook Boundary consumes provider event candidates related to external dispatch.

External provider event candidate is not delivery truth.

An external provider event candidate is not delivery truth.

## Relationship to audit/persistence

Audit / Persistence remains separate.

037B may prepare a read model candidate.

037B must not persist truth, create tasks, create calendar events, or mutate CRM.

## Example scenarios

- A provider sends a delivery event candidate. Provider Webhook Boundary may validate it and prepare a read model candidate, but must not create delivery truth.
- Signature verification is missing. Provider Webhook Boundary blocks.
- Replay protection is missing. Provider Webhook Boundary blocks.
- Webhook event says delivered. Forge can model the event candidate but cannot convert it into business truth in this boundary.

## Open next phases

- `037B_PROVIDER_WEBHOOK_BOUNDARY_IMPLEMENTATION`
- UI / Read Model Scope
- Audit / Persistence Scope
- Truth Promotion Boundary Scope

## Forge Council Review

- Miranda: Webhook intake is scoped before any provider status becomes truth.
- Arqui Juve: Architecture stays maintainable because webhook boundary and persistence/truth remain separate.
- Joy Mangano: Practical utility increases while preserving control over provider events.
- Nash: Conversation delivery feedback remains protected from premature truth creation.
- Mick: Behavior coaching avoids false execution conclusions from unverified provider events.
- Patch Adams: Trust is preserved because provider events are not silently treated as truth.
- Chris Gardner: Execution improves because event review becomes auditable.
- Rocky: Consistency improves because signature, replay, dedupe, and audit are mandatory.
- Nicky Spurgeon: Outreach remains ethical because automatic follow-up is blocked.
- Jordan Belfort: Conversion remains bounded by anti-manipulation and no-auto-retry rules.
- Jurgen Klaric: Psychology supports voluntary action, not coercive automation.

## Final decision

SEMAFORO=PASS
DECISION=PASS_037A_PROVIDER_WEBHOOK_BOUNDARY_SCOPE_READY_FOR_IMPLEMENTATION
NEXT=037B_PROVIDER_WEBHOOK_BOUNDARY_IMPLEMENTATION
