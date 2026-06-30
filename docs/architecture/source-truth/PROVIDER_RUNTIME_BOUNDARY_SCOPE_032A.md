# 032A Provider Runtime Boundary Scope

## Phase

- Phase: `032A_PROVIDER_RUNTIME_BOUNDARY_SCOPE`
- Status: SCOPE CLOSED after validation.
- Next: `032B_PROVIDER_RUNTIME_BOUNDARY_IMPLEMENTATION`.

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
```

Delivery preparation is not send.

Send Execution Gate may approve provider handoff, but it does not call provider runtime.

Provider Runtime Boundary is the next constitutional boundary.

It defines how Forge can model a provider runtime handoff without silently sending, bypassing confirmation, or leaking uncontrolled external actions.

## Current upstream closed layers

- `030B_DELIVERY_ADAPTER_BOUNDARY_IMPLEMENTATION`
- `031B_SEND_EXECUTION_GATE_IMPLEMENTATION`

## Provider Runtime Boundary definition

The Provider Runtime Boundary separates:

- approved provider handoff candidate
- final human send confirmation
- channel and recipient destination
- artifact-bound send text

from:

- real external provider API call
- WhatsApp/SMS/email dispatch
- provider credential access
- retry/queue execution
- scheduled send
- webhook side effects
- task/calendar creation

032A scopes the boundary only.

032A does not implement provider runtime.

032A does not call WhatsApp, SMS, email, calendar, tasks, CRM, or any external API.

## Future input shape

The future 032B contract may consume:

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
- channel
- providerName
- providerMode
- providerHandoffSnapshot
- sendExecutionGateSnapshot
- deliveryCandidateSnapshot
- humanApprovalSnapshot
- safetyValidationSnapshot
- approvedArtifactHash
- currentArtifactHash
- finalSendText
- recipientDestination
- recipientReviewSnapshot
- finalHumanConfirmationSnapshot
- idempotencyKey
- dryRun
- environment
- credentialsAvailable
- providerCapabilitySnapshot
- rateLimitSnapshot
- retryPolicy
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

The future 032B contract should output:

- providerRuntimeBoundaryStatus
- decision
- providerRuntimeRequestId
- sendRequestId
- deliveryRequestId
- approvalRequestId
- channel
- providerName
- providerMode
- idempotencyKey
- dryRun
- finalSendText
- recipientDestination
- providerPayloadCandidate
- approvedForProviderRuntimePreparation
- approvedForProviderRuntimeExecution
- providerRuntimeCallAllowed
- providerDispatchAllowed
- sendsMessage
- providerCredentialAccessAllowed
- retryAllowed
- scheduledExecutionAllowed
- automaticSendAllowed
- silentSendAllowed
- humanSendConfirmationRequired
- sendExecutionGateRequired
- providerAuditRequired
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

- READY_FOR_PROVIDER_RUNTIME_REVIEW
- APPROVED_FOR_PROVIDER_RUNTIME_PREPARATION
- APPROVED_FOR_DRY_RUN_ONLY
- NEEDS_SEND_EXECUTION_GATE
- NEEDS_PROVIDER_HANDOFF
- NEEDS_FINAL_HUMAN_CONFIRMATION
- NEEDS_PROVIDER_NAME
- NEEDS_CHANNEL
- NEEDS_RECIPIENT_DESTINATION
- NEEDS_ARTIFACT_HASH
- ARTIFACT_CHANGED_REAPPROVAL_REQUIRED
- NEEDS_IDEMPOTENCY_KEY
- NEEDS_PROVIDER_CAPABILITY
- NEEDS_CREDENTIAL_REVIEW
- UNSAFE_MESSAGE_BLOCKED
- UNSUPPORTED_PROVIDER
- UNSUPPORTED_CHANNEL
- EXPIRED_RUNTIME_WINDOW
- BLOCKED
- UNKNOWN
- NOT_MODELED

## Proposed decisions

- REQUEST_PROVIDER_RUNTIME_REVIEW
- APPROVE_PROVIDER_RUNTIME_PREPARATION
- APPROVE_DRY_RUN_ONLY
- BLOCK_PROVIDER_RUNTIME
- NEEDS_MORE_CONTEXT
- EXPIRED
- NOT_MODELED

## Allowed uses

- PROVIDER_RUNTIME_REVIEW
- PROVIDER_HANDOFF_VALIDATION
- PROVIDER_PAYLOAD_PREP
- PROVIDER_DRY_RUN_PREP
- WHATSAPP_PROVIDER_REVIEW
- SMS_PROVIDER_REVIEW
- EMAIL_PROVIDER_REVIEW

## Forbidden uses

- AUTOMATIC_SEND
- SILENT_SEND
- AI_SELF_SEND
- PROVIDER_RUNTIME_CALL_WITHOUT_SEND_GATE
- PROVIDER_RUNTIME_CALL_WITHOUT_HUMAN_CONFIRMATION
- PROVIDER_RUNTIME_CALL_WITHOUT_IDEMPOTENCY
- PROVIDER_RUNTIME_CALL_WITHOUT_AUDIT
- PROVIDER_RUNTIME_CALL_WITHOUT_CREDENTIAL_REVIEW
- WHATSAPP_API_SEND
- SMS_API_SEND
- EMAIL_API_SEND
- SCHEDULED_SEND
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

## Required rules for 032B implementation

Tests must prove:

1. Missing Send Execution Gate snapshot blocks provider runtime preparation.
2. Missing provider handoff approval blocks provider runtime preparation.
3. Missing final human confirmation blocks provider runtime preparation.
4. Missing provider name blocks provider runtime preparation.
5. Missing channel blocks provider runtime preparation.
6. Missing recipient destination blocks provider runtime preparation.
7. Missing artifact hash blocks provider runtime preparation.
8. Changed artifact requires reapproval.
9. Unsafe safety result blocks provider runtime preparation.
10. Missing idempotency key blocks provider runtime preparation.
11. Missing provider capability blocks provider runtime preparation.
12. Missing credential review blocks provider runtime preparation.
13. Unsupported provider blocks provider runtime preparation.
14. Unsupported channel blocks provider runtime preparation.
15. Expired runtime window blocks provider runtime preparation.
16. Automatic send is blocked.
17. Silent send is blocked.
18. AI self-send is blocked.
19. Scheduled send is blocked.
20. Retry without policy is blocked.
21. Webhook side effects are blocked.
22. Provider runtime call remains false unless future explicit executor is separately approved.
23. Dry-run can be modeled without provider dispatch.
24. Provider payload preparation is allowed when all gates pass.
25. Boundary does not create tasks/calendar.
26. Boundary does not create compensation/revenue/payout truth.
27. Boundary does not create ranking/punishment/HR/personality truth.
28. Inputs are not mutated.
29. Forbidden uses are blocked.
30. Allowed uses are allowed.
31. Audit is required.

## Relationship to Send Execution Gate

Send Execution Gate approves provider handoff.

Provider Runtime Boundary consumes that approval.

Provider handoff approval is not provider runtime execution.

## Relationship to actual connectors

Connectors must remain separate from the Provider Runtime Boundary.

The Provider Runtime Boundary may prepare provider payloads and evaluate readiness.

It must not directly call external providers unless a later explicitly approved executor is created and gated.

## Example scenarios

- Jorge confirms final send intent for Maria. Send Execution Gate approves provider handoff. Provider Runtime Boundary may prepare a WhatsApp provider payload candidate but must not dispatch.
- SMS provider credentials are missing. Provider Runtime Boundary blocks runtime preparation.
- Artifact changed after final confirmation. Provider Runtime Boundary blocks and requires reapproval.
- Dry-run mode may validate payload structure without dispatching to provider.

## Open next phases

- `032B_PROVIDER_RUNTIME_BOUNDARY_IMPLEMENTATION`
- Provider Connector Boundary Scope
- UI / Read Model
- Audit / Persistence
- Provider Webhook Boundary Scope

## Forge Council Review

- Miranda: Provider runtime is scoped before any external action exists.
- Arqui Juve: Architecture stays maintainable because boundary, connector, and executor remain separate.
- Joy Mangano: Practical utility increases without sacrificing control.
- Nash: Conversation support remains human-confirmed before any provider handoff.
- Mick: Execution support remains accountable, not automatic pressure.
- Patch Adams: Trust is preserved because dispatch is not silent.
- Chris Gardner: Execution improves because provider readiness becomes auditable.
- Rocky: Consistency improves because idempotency, audit, and reapproval are scoped.
- Nicky Spurgeon: Outreach remains ethical because provider calls are gated.
- Jordan Belfort: Conversion remains bounded by anti-manipulation and no-auto-send rules.
- Jurgen Klaric: Psychology supports voluntary action, not coercive automation.

## Final decision

SEMAFORO=PASS
DECISION=PASS_032A_PROVIDER_RUNTIME_BOUNDARY_SCOPE_READY_FOR_IMPLEMENTATION
NEXT=032B_PROVIDER_RUNTIME_BOUNDARY_IMPLEMENTATION
