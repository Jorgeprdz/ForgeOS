# 040A Truth Promotion Boundary Scope

## Phase

- Phase: `040A_TRUTH_PROMOTION_BOUNDARY_SCOPE`
- Status: SCOPE CLOSED after validation.
- Next: `040B_TRUTH_PROMOTION_BOUNDARY_IMPLEMENTATION`.

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
```

Audit event candidate is not persistence.

Audit persistence candidate is not business truth.

Truth promotion candidate is not canonical truth.

Canonical Truth Registry remains separate.

Truth Promotion Boundary is the next constitutional boundary.

It defines when an audited candidate may be reviewed for promotion eligibility without writing canonical truth, mutating metrics, creating compensation/revenue/payout truth, creating HR/ranking/personality truth, creating tasks/calendar, mutating CRM, or executing actions.

040A scopes the boundary only.

040A does not implement truth promotion.

040A does not write Canonical Truth Registry.

040A does not create metric truth.

040A does not create business truth.

040A does not create delivery/message truth.

040A does not create compensation, revenue, payout, ranking, punishment, HR, lifecycle, or personality truth.

## Current upstream closed layers

- `038B_UI_READ_MODEL_IMPLEMENTATION`
- `039B_AUDIT_PERSISTENCE_IMPLEMENTATION`

## Truth Promotion Boundary definition

The Truth Promotion Boundary separates:

- audit persistence record candidate
- audited evidence chain
- source evidence IDs
- source owners
- source freshness
- retention/privacy/immutability snapshots
- candidate fact type
- candidate fact value
- candidate confidence
- candidate limitation set
- promotion policy snapshot
- metric ownership review
- truth ownership review
- conflict review
- human review state
- audit trail

from:

- canonical truth write
- business truth creation
- metric truth creation
- delivery/message truth creation
- compensation/revenue/payout truth
- ranking/punishment/HR/personality truth
- advisor lifecycle truth
- task/calendar creation
- CRM mutation
- UI rendering
- persistence write
- provider/external API calls
- send/action execution

This boundary may later validate truth promotion readiness and prepare a truth promotion review candidate, but it must not promote anything into canonical truth.

## Future input shape

The future 040B contract may consume:

- truthPromotionRequestId
- auditPersistenceRequestId
- uiReadModelRequestId
- providerWebhookBoundaryRequestId
- externalDispatchRequestId
- sendRequestId
- advisorId
- managerId
- personId
- personType
- actorId
- actorRole
- auditPersistenceSnapshot
- auditPersistenceRecordCandidate
- candidateFactType
- candidateFactValue
- candidateFactSource
- candidateFactOwner
- candidateConfidence
- candidateLimitations
- candidateWarnings
- promotionPolicySnapshot
- metricOwnershipSnapshot
- truthOwnershipSnapshot
- conflictReviewSnapshot
- humanTruthReviewSnapshot
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

The future 040B contract should output:

- truthPromotionStatus
- decision
- truthPromotionRequestId
- auditPersistenceRequestId
- uiReadModelRequestId
- advisorId
- managerId
- personId
- personType
- candidateFactType
- candidateFactValue
- truthPromotionReviewCandidate
- eligibleForTruthPromotionReview
- approvedForCanonicalTruthWrite
- writesCanonicalTruth
- createsBusinessTruth
- createsMetricTruth
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
- rendersUi
- persistsRecord
- providerApiCallAllowed
- externalApiCallAllowed
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

- READY_FOR_TRUTH_PROMOTION_REVIEW
- APPROVED_FOR_TRUTH_PROMOTION_REVIEW_CANDIDATE
- NEEDS_AUDIT_PERSISTENCE
- NEEDS_AUDIT_PERSISTENCE_RECORD_CANDIDATE
- NEEDS_CANDIDATE_FACT_TYPE
- NEEDS_CANDIDATE_FACT_VALUE
- NEEDS_CANDIDATE_FACT_OWNER
- NEEDS_PROMOTION_POLICY
- NEEDS_METRIC_OWNERSHIP_REVIEW
- NEEDS_TRUTH_OWNERSHIP_REVIEW
- NEEDS_CONFLICT_REVIEW
- NEEDS_HUMAN_TRUTH_REVIEW
- NEEDS_SOURCE_EVIDENCE
- NEEDS_SOURCE_OWNER
- NEEDS_SOURCE_FRESHNESS
- STALE_SOURCE_FRESHNESS
- NEEDS_IDEMPOTENCY_KEY
- NEEDS_AUDIT_TRAIL
- UNSUPPORTED_FACT_TYPE
- UNSUPPORTED_OWNER
- CONFLICT_DETECTED
- EXPIRED_TRUTH_PROMOTION_WINDOW
- BLOCKED
- UNKNOWN
- NOT_MODELED

## Proposed decisions

- REQUEST_TRUTH_PROMOTION_REVIEW
- APPROVE_TRUTH_PROMOTION_REVIEW_CANDIDATE
- BLOCK_TRUTH_PROMOTION
- NEEDS_MORE_CONTEXT
- EXPIRED
- NOT_MODELED

## Allowed uses

- TRUTH_PROMOTION_REVIEW
- TRUTH_PROMOTION_CANDIDATE_PREP
- DELIVERY_TRUTH_REVIEW_PREP
- MESSAGE_TRUTH_REVIEW_PREP
- ACTIVITY_TRUTH_REVIEW_PREP
- EVIDENCE_TO_TRUTH_REVIEW_PREP

## Forbidden uses

- CANONICAL_TRUTH_WRITE
- BUSINESS_TRUTH_CREATION
- METRIC_TRUTH_CREATION
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
- PERSISTENCE_WRITE
- UI_RENDERING
- DASHBOARD_CREATION
- PROVIDER_API_CALL
- EXTERNAL_API_CALL
- SEND_MESSAGE
- ACTION_EXECUTION
- MANIPULATION
- SURVEILLANCE

## Required rules for 040B implementation

Tests must prove:

1. Missing Audit / Persistence snapshot blocks truth promotion review candidate preparation.
2. Missing audit persistence record candidate blocks.
3. Missing candidate fact type blocks.
4. Missing candidate fact value blocks.
5. Missing candidate fact owner blocks.
6. Missing promotion policy blocks.
7. Missing metric ownership review blocks.
8. Missing truth ownership review blocks.
9. Missing conflict review blocks.
10. Missing human truth review blocks.
11. Missing source evidence blocks.
12. Missing source owner blocks.
13. Missing source freshness blocks.
14. Stale source freshness blocks or requires review.
15. Missing idempotency key blocks.
16. Missing audit trail blocks.
17. Unsupported fact type blocks.
18. Unsupported owner blocks.
19. Conflict detected blocks.
20. Expired truth promotion window blocks.
21. Truth promotion review candidate can be prepared.
22. Canonical truth write remains false.
23. Business/metric truth creation remains false.
24. Delivery/message truth creation remains false.
25. Compensation/revenue/payout truth remains false.
26. Ranking/punishment/HR/personality truth remains false.
27. Advisor lifecycle truth remains false.
28. Task/calendar creation remains false.
29. CRM mutation remains false.
30. Persistence write remains false.
31. UI rendering remains false.
32. Provider/external API calls remain false.
33. Send/action execution remains false.
34. Forbidden uses are blocked.
35. Allowed uses are allowed.
36. Inputs are not mutated.
37. Evidence/source/sourceOwners dedupe.
38. Warnings and limitations remain visible.
39. Canonical Truth Registry remains separate.
40. Explicit zero/false values are preserved as review context, not treated as missing.

## Relationship to Audit / Persistence Boundary

Audit / Persistence Boundary prepares an audit persistence record candidate.

Truth Promotion Boundary consumes that candidate.

A truth promotion review candidate is not canonical truth.

## Relationship to Canonical Truth Registry

Canonical Truth Registry remains separate.

040B may prepare truth promotion review candidates.

040B must not write canonical truth or create business truth.

## Example scenarios

- Audit / Persistence prepares a record candidate for a provider delivered event. Truth Promotion may prepare a review candidate, but cannot create delivery truth.
- Conflict review detects mismatch between provider event and local evidence. Truth Promotion blocks.
- Candidate fact owner is missing. Truth Promotion blocks.
- Candidate fact value is zero or false. Truth Promotion preserves it as review context if explicitly provided.

## Open next phases

- `040B_TRUTH_PROMOTION_BOUNDARY_IMPLEMENTATION`
- Canonical Truth Registry Scope
- UI Rendering Boundary Scope

## Forge Council Review

- Miranda: Truth is scoped before anything becomes canonical.
- Arqui Juve: Architecture stays maintainable because eligibility, canonical write, metrics, and ownership remain separate.
- Joy Mangano: Practical utility increases because evidence can become reviewable without becoming unsafe truth.
- Nash: Conversation outcomes remain protected from premature truth creation.
- Mick: Behavior intelligence avoids false coaching based on unpromoted events.
- Patch Adams: Trust is preserved because warnings and limitations survive the promotion review.
- Chris Gardner: Execution improves because truth readiness becomes traceable.
- Rocky: Consistency improves because ownership, conflict review, human review, idempotency, and audit are mandatory.
- Nicky Spurgeon: Outreach remains ethical because action execution and CRM mutation are blocked.
- Jordan Belfort: Conversion remains bounded by anti-manipulation and no-auto-truth rules.
- Jurgen Klaric: Psychology supports voluntary action through explainable truth, not coercive automation.

## Final decision

SEMAFORO=PASS
DECISION=PASS_040A_TRUTH_PROMOTION_BOUNDARY_SCOPE_READY_FOR_IMPLEMENTATION
NEXT=040B_TRUTH_PROMOTION_BOUNDARY_IMPLEMENTATION

<!-- BEGIN FORGEOS:TRUTH_PROMOTION_IMPLEMENTATION_APPENDIX_040B -->
## 040B Implementation Appendix

- `040B_TRUTH_PROMOTION_BOUNDARY_IMPLEMENTATION` implemented Truth Promotion Boundary Contract.
- Truth promotion candidate is not canonical truth.
- Canonical Truth Registry remains separate.
- Truth promotion review candidate can be prepared.
- Canonical truth write remains false.
- Business/metric truth creation remains false.
- Delivery/message truth creation remains false.
- Explicit zero/false values are preserved as review context, not treated as missing.
- Unified Build Tree updated.
- Next: `041A_CANONICAL_TRUTH_REGISTRY_SCOPE`
<!-- END FORGEOS:TRUTH_PROMOTION_IMPLEMENTATION_APPENDIX_040B -->
