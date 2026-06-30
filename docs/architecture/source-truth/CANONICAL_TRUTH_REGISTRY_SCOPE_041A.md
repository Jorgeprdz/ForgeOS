# 041A Canonical Truth Registry Scope

## Phase

- Phase: `041A_CANONICAL_TRUTH_REGISTRY_SCOPE`
- Status: SCOPE CLOSED after validation.
- Next: `041B_CANONICAL_TRUTH_REGISTRY_IMPLEMENTATION`.

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
```

Truth promotion candidate is not canonical truth.

Canonical truth entry candidate is not canonical truth write.

Canonical Truth Registry is the next constitutional boundary.

It defines how Forge may prepare a canonical truth entry candidate from an approved truth promotion review candidate without writing persistence, mutating CRM, executing actions, creating derived metrics, creating compensation/revenue/payout truth, or making HR/ranking/personality decisions.

041A scopes the boundary only.

041A does not implement the registry.

041A does not write canonical truth.

041A does not write files or databases.

041A does not create business, metric, compensation, revenue, payout, HR, ranking, lifecycle, or personality truth.

041A does not mutate CRM.

041A does not create tasks or calendar events.

041A does not execute actions.

## Current upstream closed layers

- `039B_AUDIT_PERSISTENCE_IMPLEMENTATION`
- `040B_TRUTH_PROMOTION_BOUNDARY_IMPLEMENTATION`

## Canonical Truth Registry definition

The Canonical Truth Registry separates:

- truth promotion review candidate
- candidate fact type
- candidate fact value
- candidate fact owner
- approved ownership review
- conflict review
- human truth review
- source evidence IDs
- source owners
- source freshness
- warnings and limitations
- idempotency key
- audit trail
- canonical truth entry candidate

from:

- actual canonical truth write
- storage persistence
- metric aggregation
- compensation/revenue/payout calculation
- ranking/punishment/HR/personality truth
- advisor lifecycle truth
- task/calendar creation
- CRM mutation
- UI rendering
- provider/external API calls
- send/action execution

This boundary may later validate canonical truth registry readiness and prepare a canonical truth entry candidate, but it must not persist it or trigger downstream metric/truth systems.

## Future input shape

The future 041B contract may consume:

- canonicalTruthRegistryRequestId
- truthPromotionRequestId
- auditPersistenceRequestId
- uiReadModelRequestId
- advisorId
- managerId
- personId
- personType
- actorId
- actorRole
- truthPromotionSnapshot
- truthPromotionReviewCandidate
- candidateFactType
- candidateFactValue
- candidateFactOwner
- candidateFactSource
- candidateConfidence
- candidateWarnings
- candidateLimitations
- canonicalTruthPolicySnapshot
- canonicalKeyPolicySnapshot
- canonicalOwnerPolicySnapshot
- immutabilityPolicySnapshot
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

The future 041B contract should output:

- canonicalTruthRegistryStatus
- decision
- canonicalTruthRegistryRequestId
- truthPromotionRequestId
- auditPersistenceRequestId
- uiReadModelRequestId
- advisorId
- managerId
- personId
- personType
- candidateFactType
- candidateFactValue
- candidateFactOwner
- canonicalTruthEntryCandidate
- eligibleForCanonicalTruthEntryPreparation
- approvedForCanonicalTruthWrite
- writesCanonicalTruth
- persistsRecord
- writesFile
- writesDatabase
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

- READY_FOR_CANONICAL_TRUTH_REGISTRY_REVIEW
- APPROVED_FOR_CANONICAL_TRUTH_ENTRY_CANDIDATE
- NEEDS_TRUTH_PROMOTION
- NEEDS_TRUTH_PROMOTION_REVIEW_CANDIDATE
- NEEDS_CANDIDATE_FACT_TYPE
- NEEDS_CANDIDATE_FACT_VALUE
- NEEDS_CANDIDATE_FACT_OWNER
- NEEDS_CANONICAL_TRUTH_POLICY
- NEEDS_CANONICAL_KEY_POLICY
- NEEDS_CANONICAL_OWNER_POLICY
- NEEDS_IMMUTABILITY_POLICY
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
- DUPLICATE_CANONICAL_KEY
- CONFLICT_DETECTED
- EXPIRED_CANONICAL_TRUTH_WINDOW
- BLOCKED
- UNKNOWN
- NOT_MODELED

## Proposed decisions

- REQUEST_CANONICAL_TRUTH_REGISTRY_REVIEW
- APPROVE_CANONICAL_TRUTH_ENTRY_CANDIDATE
- BLOCK_CANONICAL_TRUTH_REGISTRY
- NEEDS_MORE_CONTEXT
- EXPIRED
- NOT_MODELED

## Allowed uses

- CANONICAL_TRUTH_REGISTRY_REVIEW
- CANONICAL_TRUTH_ENTRY_CANDIDATE_PREP
- DELIVERY_CANONICAL_TRUTH_ENTRY_PREP
- MESSAGE_CANONICAL_TRUTH_ENTRY_PREP
- ACTIVITY_CANONICAL_TRUTH_ENTRY_PREP
- EVIDENCE_CANONICAL_ENTRY_PREP

## Forbidden uses

- CANONICAL_TRUTH_WRITE
- PERSISTENCE_WRITE
- FILE_WRITE
- DATABASE_WRITE
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
- UI_RENDERING
- DASHBOARD_CREATION
- PROVIDER_API_CALL
- EXTERNAL_API_CALL
- SEND_MESSAGE
- ACTION_EXECUTION
- MANIPULATION
- SURVEILLANCE

## Required rules for 041B implementation

Tests must prove:

1. Missing Truth Promotion snapshot blocks canonical entry candidate preparation.
2. Missing truth promotion review candidate blocks.
3. Missing candidate fact type blocks.
4. Missing candidate fact value blocks.
5. Missing candidate fact owner blocks.
6. Missing canonical truth policy blocks.
7. Missing canonical key policy blocks.
8. Missing canonical owner policy blocks.
9. Missing immutability policy blocks.
10. Missing conflict review blocks.
11. Missing human truth review blocks.
12. Missing source evidence blocks.
13. Missing source owner blocks.
14. Missing source freshness blocks.
15. Stale source freshness blocks or requires review.
16. Missing idempotency key blocks.
17. Missing audit trail blocks.
18. Unsupported fact type blocks.
19. Unsupported owner blocks.
20. Duplicate canonical key blocks.
21. Conflict detected blocks.
22. Expired canonical truth window blocks.
23. Canonical truth entry candidate can be prepared.
24. Canonical truth write remains false.
25. Persistence/file/database writes remain false.
26. Business/metric truth creation remains false.
27. Delivery/message truth creation remains false.
28. Compensation/revenue/payout truth remains false.
29. Ranking/punishment/HR/personality truth remains false.
30. Advisor lifecycle truth remains false.
31. Task/calendar creation remains false.
32. CRM mutation remains false.
33. UI rendering remains false.
34. Provider/external API calls remain false.
35. Send/action execution remains false.
36. Forbidden uses are blocked.
37. Allowed uses are allowed.
38. Inputs are not mutated.
39. Evidence/source/sourceOwners dedupe.
40. Warnings and limitations remain visible.
41. Explicit zero/false values are preserved as review context, not treated as missing.
42. Canonical entry candidate includes immutable source trace.

## Relationship to Truth Promotion Boundary

Truth Promotion Boundary prepares a truth promotion review candidate.

Canonical Truth Registry consumes that candidate.

A canonical truth entry candidate is not a canonical truth write.

## Relationship to Metric / Economic Truth

Metric / Economic Truth remains separate.

041B may prepare canonical truth entry candidates.

041B must not aggregate metrics, calculate compensation, calculate revenue, calculate payout, rank humans, or create HR truth.

## Example scenarios

- Truth Promotion prepares a review candidate for delivery status. Canonical Truth Registry may prepare a canonical entry candidate, but cannot write canonical truth.
- Candidate key duplicates a prior entry. Canonical Truth Registry blocks.
- Candidate fact value is zero or false. Canonical Truth Registry preserves it as review context if explicitly provided.
- Conflict review detects mismatch. Canonical Truth Registry blocks.

## Open next phases

- `041B_CANONICAL_TRUTH_REGISTRY_IMPLEMENTATION`
- Metric / Economic Truth Scope
- UI Rendering Boundary Scope

## Forge Council Review

- Miranda: Canonical truth entry is scoped before any registry write exists.
- Arqui Juve: Architecture stays maintainable because entry preparation, write, persistence, metric aggregation, and ownership remain separate.
- Joy Mangano: Practical utility increases because truth can become traceable without causing unsafe downstream effects.
- Nash: Conversation outcomes remain protected from premature canonical registration.
- Mick: Behavior intelligence avoids false coaching from unregistered facts.
- Patch Adams: Trust is preserved because warnings, limitations, and source trace remain visible.
- Chris Gardner: Execution improves because canonical readiness becomes explainable.
- Rocky: Consistency improves because ownership, conflict review, human review, idempotency, and audit are mandatory.
- Nicky Spurgeon: Outreach remains ethical because CRM mutation and automatic action are blocked.
- Jordan Belfort: Conversion remains bounded by anti-manipulation and no-auto-truth rules.
- Jurgen Klaric: Psychology supports voluntary action through explainable canonical truth, not coercive automation.

## Final decision

SEMAFORO=PASS
DECISION=PASS_041A_CANONICAL_TRUTH_REGISTRY_SCOPE_READY_FOR_IMPLEMENTATION
NEXT=041B_CANONICAL_TRUTH_REGISTRY_IMPLEMENTATION
