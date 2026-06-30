# 033A Provider Connector Boundary Scope

## Phase

- Phase: `033A_PROVIDER_CONNECTOR_BOUNDARY_SCOPE`
- Status: SCOPE CLOSED after validation.
- Next: `033B_PROVIDER_CONNECTOR_BOUNDARY_IMPLEMENTATION`.

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
```

Provider handoff is not provider runtime execution.

Provider runtime preparation is not connector execution.

Provider Connector Boundary is the next constitutional boundary.

It defines how Forge can model the edge between provider runtime readiness and external connector execution without calling external APIs, sending messages, or creating side effects.

## Current upstream closed layers

- `031B_SEND_EXECUTION_GATE_IMPLEMENTATION`
- `032B_PROVIDER_RUNTIME_BOUNDARY_IMPLEMENTATION`

## Provider Connector Boundary definition

The Provider Connector Boundary separates:

- provider payload candidate
- provider runtime readiness
- idempotency key
- credential/capability review
- dry-run intent
- audit packet

from:

- real connector invocation
- provider API call
- WhatsApp/SMS/email dispatch
- credential material exposure
- webhook registration
- retry execution
- queue execution
- scheduled send
- task/calendar creation

033A scopes the boundary only.

033A does not implement a connector.

033A does not call WhatsApp, SMS, email, calendar, tasks, CRM, or any external API.

## Future input shape

The future 033B contract may consume:

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
- providerRuntimeSnapshot
- providerPayloadCandidate
- providerName
- providerConnectorName
- providerConnectorMode
- channel
- finalSendText
- recipientDestination
- idempotencyKey
- dryRun
- environment
- credentialReviewSnapshot
- providerCapabilitySnapshot
- connectorCapabilitySnapshot
- connectorPolicySnapshot
- rateLimitSnapshot
- retryPolicySnapshot
- auditTrail
- sourceEvidence
- warnings
- limitations
- requestedUse
- createdAt
- expiresAt
- now

## Future output shape

The future 033B contract should output:

- providerConnectorBoundaryStatus
- decision
- providerConnectorRequestId
- providerRuntimeRequestId
- sendRequestId
- providerName
- providerConnectorName
- providerConnectorMode
- channel
- idempotencyKey
- dryRun
- connectorInvocationCandidate
- providerPayloadCandidate
- approvedForConnectorPreparation
- approvedForConnectorInvocation
- connectorInvocationAllowed
- externalApiCallAllowed
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
- providerRuntimeBoundaryRequired
- connectorAuditRequired
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

- READY_FOR_CONNECTOR_REVIEW
- APPROVED_FOR_CONNECTOR_PREPARATION
- APPROVED_FOR_CONNECTOR_DRY_RUN_ONLY
- NEEDS_PROVIDER_RUNTIME
- NEEDS_PROVIDER_PAYLOAD
- NEEDS_CONNECTOR_NAME
- NEEDS_CONNECTOR_CAPABILITY
- NEEDS_CONNECTOR_POLICY
- NEEDS_CREDENTIAL_REVIEW
- NEEDS_IDEMPOTENCY_KEY
- NEEDS_RATE_LIMIT_REVIEW
- NEEDS_RETRY_POLICY
- UNSUPPORTED_CONNECTOR
- UNSUPPORTED_PROVIDER
- UNSUPPORTED_CHANNEL
- EXPIRED_CONNECTOR_WINDOW
- BLOCKED
- UNKNOWN
- NOT_MODELED

## Proposed decisions

- REQUEST_CONNECTOR_REVIEW
- APPROVE_CONNECTOR_PREPARATION
- APPROVE_CONNECTOR_DRY_RUN_ONLY
- BLOCK_CONNECTOR
- NEEDS_MORE_CONTEXT
- EXPIRED
- NOT_MODELED

## Allowed uses

- CONNECTOR_REVIEW
- CONNECTOR_PAYLOAD_VALIDATION
- CONNECTOR_INVOCATION_PREP
- CONNECTOR_DRY_RUN_PREP
- WHATSAPP_CONNECTOR_REVIEW
- SMS_CONNECTOR_REVIEW
- EMAIL_CONNECTOR_REVIEW

## Forbidden uses

- AUTOMATIC_SEND
- SILENT_SEND
- AI_SELF_SEND
- EXTERNAL_API_CALL
- PROVIDER_DISPATCH
- CONNECTOR_INVOCATION_WITHOUT_RUNTIME_GATE
- CONNECTOR_INVOCATION_WITHOUT_IDEMPOTENCY
- CONNECTOR_INVOCATION_WITHOUT_AUDIT
- CONNECTOR_INVOCATION_WITHOUT_CREDENTIAL_REVIEW
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

## Required rules for 033B implementation

Tests must prove:

1. Missing Provider Runtime snapshot blocks connector preparation.
2. Missing provider payload candidate blocks connector preparation.
3. Missing connector name blocks connector preparation.
4. Missing connector capability blocks connector preparation.
5. Missing connector policy blocks connector preparation.
6. Missing credential review blocks connector preparation.
7. Missing idempotency key blocks connector preparation.
8. Missing rate-limit review blocks connector preparation.
9. Retry without policy blocks connector preparation.
10. Unsupported connector blocks connector preparation.
11. Unsupported provider blocks connector preparation.
12. Unsupported channel blocks connector preparation.
13. Expired connector window blocks connector preparation.
14. External API call remains false.
15. Connector invocation remains false unless a later executor is separately approved.
16. Provider dispatch remains false.
17. Sends message remains false.
18. Credential material exposure remains false.
19. Queue execution remains false.
20. Scheduled execution remains false.
21. Webhook side effects remain false.
22. Dry-run can be modeled without dispatch.
23. Connector invocation candidate can be prepared without external call.
24. Automatic send is blocked.
25. Silent send is blocked.
26. AI self-send is blocked.
27. Boundary does not create tasks/calendar.
28. Boundary does not create compensation/revenue/payout truth.
29. Boundary does not create ranking/punishment/HR/personality truth.
30. Inputs are not mutated.
31. Forbidden uses are blocked.
32. Allowed uses are allowed.
33. Audit is required.

## Relationship to Provider Runtime Boundary

Provider Runtime Boundary approves provider payload preparation.

Provider Connector Boundary consumes that payload candidate.

A provider payload candidate is not connector invocation.

## Relationship to actual connector execution

Connector execution must remain separate.

033B may prepare a connector invocation candidate and validate connector readiness.

033B must not directly call external providers unless a later explicitly approved connector executor is created and gated.

## Example scenarios

- Provider Runtime prepares a WhatsApp payload candidate. Provider Connector Boundary may validate a connector invocation candidate for WhatsApp Business but must not call the API.
- Connector capability is missing. Provider Connector Boundary blocks connector preparation.
- Credential review fails. Provider Connector Boundary blocks connector preparation.
- Dry-run mode may validate connector payload shape without dispatching.

## Open next phases

- `033B_PROVIDER_CONNECTOR_BOUNDARY_IMPLEMENTATION`
- Connector Execution Gate Scope
- Provider Webhook Boundary Scope
- UI / Read Model
- Audit / Persistence

## Forge Council Review

- Miranda: Connector risk is scoped before any external API action exists.
- Arqui Juve: Architecture stays maintainable because connector boundary and executor remain separate.
- Joy Mangano: Practical utility increases without sacrificing control.
- Nash: Conversation delivery remains gated beyond provider preparation.
- Mick: Execution support remains accountable, not automatic pressure.
- Patch Adams: Trust is preserved because external calls are not silent.
- Chris Gardner: Execution improves because connector readiness becomes auditable.
- Rocky: Consistency improves because idempotency, policy, and credential review are scoped.
- Nicky Spurgeon: Outreach remains ethical because connector invocation is blocked.
- Jordan Belfort: Conversion remains bounded by anti-manipulation and no-auto-send rules.
- Jurgen Klaric: Psychology supports voluntary action, not coercive automation.

## Final decision

SEMAFORO=PASS
DECISION=PASS_033A_PROVIDER_CONNECTOR_BOUNDARY_SCOPE_READY_FOR_IMPLEMENTATION
NEXT=033B_PROVIDER_CONNECTOR_BOUNDARY_IMPLEMENTATION

<!-- BEGIN FORGEOS:PROVIDER_CONNECTOR_BOUNDARY_IMPLEMENTATION_APPENDIX_033B -->
## 033B Implementation Appendix

- `033B_PROVIDER_CONNECTOR_BOUNDARY_IMPLEMENTATION` implemented Provider Connector Boundary Contract.
- Provider runtime preparation is not connector execution.
- Connector invocation candidate can be prepared.
- External API call remains false.
- Connector invocation remains false.
- Connector Execution Gate remains separate.
- Unified Build Tree updated.
- Next: `034A_CONNECTOR_EXECUTION_GATE_SCOPE`
<!-- END FORGEOS:PROVIDER_CONNECTOR_BOUNDARY_IMPLEMENTATION_APPENDIX_033B -->
