# Human Approval Gate Scope 029A

Phase: 029A_HUMAN_APPROVAL_GATE_SCOPE

Mode: DOCS ONLY SCOPE + EXISTING TESTS

Status: SCOPED / READY_FOR_029B_IMPLEMENTATION

## Why Human Approval Gate Exists

Forge exists to convert signals into voluntary explained action.

NBA Reason Why explains the action. Prompt Builder prepares instruction. LLM Draft Intake receives candidate draft language. Message Safety Validator checks safety.

None of those equal human approval.

The Human Approval Gate exists to separate safe recommendation, safe prompt instruction, safe draft candidate, and safety validation from approved human communication, delivery preparation, and send execution.

Core rules:

- Prompt is not draft.
- Draft is not approved communication.
- Safety validation is not human approval.
- Human approval is not send.
- Delivery preparation is not send.
- Send execution requires a separate gate.

## Current Upstream Closed Layers

- 006D Nash + Mick + NBA Reconnection is closed for non-executing voluntary explained action.
- 028C LLM Draft Intake + Message Safety is closed for human-review-only language safety.
- Human Approval Gate remains open before this 029A scope.

Upstream layers can prepare explanation, instruction, draft candidate context, and safety review. They cannot approve communication, send messages, create tasks, create calendar events, or create downstream truth.

## Human Approval Gate Definition

The Human Approval Gate must verify:

- a real human reviewer exists
- the reviewer explicitly approves, rejects, or requests changes
- the reviewed artifact is exact and unchanged
- the artifact passed required safety checks
- warnings and limitations were visible
- approval is time-aware
- approval is auditable
- approval unlocks delivery preparation only
- send execution remains blocked

AI may not approve its own output.

## Future Input Shape

- `approvalRequestId`
- `advisorId`
- `managerId`
- `reviewerId`
- `reviewerRole`
- `personId`
- `personType`
- `channelCandidate`
- `approvalSurface`
- `nbaReasonWhySnapshot`
- `promptInstructionSnapshot`
- `draftCandidateSnapshot`
- `safetyValidationSnapshot`
- `sourceEvidence`
- `warnings`
- `limitations`
- `artifactHash`
- `requestedUse`
- `createdAt`
- `expiresAt`

## Future Output Shape

- `approvalGateStatus`
- `decision`
- `approvalRequestId`
- `reviewerId`
- `reviewerRole`
- `approvedArtifactHash`
- `approvedText`
- `rejectedReasons`
- `changeRequests`
- `warningsAcknowledged`
- `limitationsAcknowledged`
- `approvedForDeliveryPreparation`
- `approvedForSendExecution: false`
- `humanApprovalRequired: true`
- `automaticApprovalAllowed: false`
- `aiApprovalAllowed: false`
- `safetyValidationEqualsApproval: false`
- `createsMessageDraft: false`
- `sendsMessage: false`
- `createsTask: false`
- `createsCalendarEvent: false`
- `createsCompensationTruth: false`
- `createsPayoutTruth: false`
- `createsRevenueTruth: false`
- `createsRankingTruth: false`
- `createsPunishmentTruth: false`
- `createsHrTruth: false`
- `createsPromotionTruth: false`
- `createsAdvisorLifecycleTruth: false`
- `createsPersonalityTruth: false`
- `auditRequired: true`

## Proposed Statuses

- `READY_FOR_HUMAN_REVIEW`
- `APPROVED_FOR_DELIVERY_PREPARATION`
- `REJECTED_BY_HUMAN`
- `CHANGES_REQUESTED`
- `NEEDS_REVIEWER`
- `NEEDS_ARTIFACT`
- `NEEDS_SAFETY_VALIDATION`
- `NEEDS_WARNING_ACKNOWLEDGEMENT`
- `ARTIFACT_CHANGED_REAPPROVAL_REQUIRED`
- `EXPIRED_APPROVAL`
- `BLOCKED`
- `NOT_MODELED`

## Proposed Decisions

- `REQUEST_HUMAN_REVIEW`
- `APPROVE_FOR_DELIVERY_PREPARATION`
- `REJECT`
- `REQUEST_CHANGES`
- `BLOCK_DELIVERY`
- `EXPIRED`
- `NOT_MODELED`

## Allowed Uses

- `MESSAGE_DELIVERY_PREP_REVIEW`
- `FOLLOWUP_MESSAGE_REVIEW`
- `CANDIDATE_OUTREACH_REVIEW`
- `PROSPECT_OUTREACH_REVIEW`
- `MANAGER_COACHING_MESSAGE_REVIEW`
- `ONE_ON_ONE_MESSAGE_REVIEW`

## Forbidden Uses

- `AUTOMATIC_APPROVAL`
- `AI_SELF_APPROVAL`
- `SAFETY_VALIDATION_AS_APPROVAL`
- `AUTOMATIC_SEND`
- `SEND_EXECUTION`
- `AUTOMATIC_TASK_CREATION`
- `AUTOMATIC_CALENDAR_CREATION`
- `APPROVE_CHANGED_ARTIFACT`
- `APPROVE_WITHOUT_REVIEWER`
- `APPROVE_WITHOUT_ARTIFACT_HASH`
- `APPROVE_UNSAFE_MESSAGE`
- `APPROVE_WITHOUT_WARNING_VISIBILITY`
- `COMPENSATION_TRUTH`
- `PAYOUT_TRUTH`
- `REVENUE_TRUTH`
- `HUMAN_RANKING`
- `HR_DECISION`
- `PROMOTION_DECISION`
- `TERMINATION`
- `MANIPULATION`
- `SURVEILLANCE`
- `PERSONALITY_TRUTH`

## Required Rules For 029B Implementation

Tests must prove:

- safety validation is not approval
- AI cannot approve
- missing reviewer blocks approval
- missing artifact blocks approval
- missing artifact hash blocks approval
- changed artifact requires reapproval
- unsafe safety result blocks approval
- warnings must be visible or acknowledged
- approval expires when expired
- approved gate does not send
- approved gate does not create tasks/calendar
- approved gate only unlocks delivery preparation
- send execution remains false
- all truth/action flags remain false except `humanApprovalRequired` and `auditRequired`
- inputs are not mutated

## Exact-artifact binding Rule

Human approval applies only to the exact artifact reviewed.

Any draft text, prompt instruction, reason why, target person, channel, or material change invalidates approval and requires reapproval.

The future implementation must bind approval to `artifactHash`, visible warnings, visible limitations, reviewer identity, reviewer role, request time, and expiration time.

## Relationship To Delivery Adapter

Human Approval Gate may unlock:

- delivery preparation
- channel candidate formatting
- link preparation

Human Approval Gate must not unlock:

- actual send
- auto-send
- scheduled send
- task execution
- calendar execution

## Relationship To Send Execution Gate

Send Execution Gate must be separate.

Even an approved message must pass a final send gate.

Human approval is not message send. Delivery preparation is not send. Send execution remains blocked until a separate Send Execution Gate is scoped, implemented, tested, and approved.

## Example Scenarios

### Jorge approves a Maria follow-up message

Jorge reviews the NBA Reason Why, prompt instruction, draft candidate, safety validation result, warnings, limitations, and exact artifact hash. If he explicitly approves, the artifact may move to delivery preparation only. It still cannot send.

### Jorge requests changes to soften candidate outreach

Jorge reviews a candidate outreach draft and requests softer language. That decision returns change requests. The changed draft must pass safety validation and come back for approval again.

### Unsafe message is blocked despite attempted approval

If a draft includes pressure, shame, unsupported product claims, false urgency, manipulation, or unsafe claims, approval must be blocked even if a user tries to approve it.

### Approved draft is edited

If an approved draft is edited after approval, the artifact hash no longer matches. The prior approval is invalid and reapproval is required.

## Open Next Phases

- `029B_HUMAN_APPROVAL_GATE_IMPLEMENTATION`
- `030A_DELIVERY_ADAPTER_BOUNDARY_SCOPE`
- `031A_SEND_EXECUTION_GATE_SCOPE`
- UI / Read Model
- Audit / Persistence

## What Forge Learned

- Forge can now explain action, prepare prompt instructions, receive draft candidates, and validate safety, but the final authority before delivery preparation must be a human.
- The Human Approval Gate is an explicit, attributable, time-aware, artifact-bound, auditable contract.
- Human approval unlocks delivery preparation only.
- Send execution remains a separate constitutional boundary.

## Forge Council Review

- Miranda: This makes Forge better because it prevents the language layer from quietly becoming execution.
- Arqui Juve: The architecture is clean because approval, delivery preparation, and send execution are separate contracts.
- Joy Mangano: This is useful in real work because managers can approve exact communication artifacts with confidence.
- Nash: Conversation support remains human-reviewed and does not become automatic message send.
- Mick: Behavior context cannot become pressure, surveillance, or punishment through approval.
- Patch Adams: Human trust is preserved because approval is explicit, attributable, and auditable.
- Chris Gardner: Execution support improves because the human can choose action without Forge acting silently.
- Rocky: Consistency improves because every approved artifact must match the exact reviewed version.
- Nicky Spurgeon: Networking and referrals remain ethical because human approval precedes delivery preparation.
- Jordan Belfort: Conversion support remains bounded; manipulation and automatic send stay forbidden.
- Jurgen Klaric: Psychology supports clarity and voluntary action, not coercion.

Council review is advisory only and does not override Constitution, ADRs, tests, evidence, or source-truth boundaries.

## Final Scope Decision

SEMAFORO=🟢 PASS

DECISION=PASS_029A_HUMAN_APPROVAL_GATE_SCOPE_READY_FOR_COMMIT_VALIDATION

NEXT=029B_HUMAN_APPROVAL_GATE_IMPLEMENTATION
