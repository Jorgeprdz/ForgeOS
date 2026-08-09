# Forge Cross-Domain Decision Projection 004 — Acceptance

```text
PHASE=FORGE_CROSS_DOMAIN_DECISION_PROJECTION_004
BRANCH=feature/forge-cross-domain-decision-projection-004
PHASE_BASE_SHA=95755f7680fe235d515c02ec4ec06fa6c49eab17
IMPLEMENTATION_ACCEPTANCE_HEAD=4ac81208b2a8c2043fd2f942c505b784843bed99
PR=327
MERGE_TO_MAIN=NO
PRODUCTION_DEPLOYMENT=NO
PHASE_STATUS=PASS
```

## Executive result

Phase004 created **no new business intelligence engine**. It created a neutral, read-only projection contract and authority-safe adapters so existing Forge intelligences can be consumed through one stable semantic shape without changing source ownership.

```text
NEW_BUSINESS_ENGINE=0
NEW_RECOMMENDATION_ENGINE=0
NEW_SCORE=0
NEW_SOURCE_OF_TRUTH=0
NEW_PERSISTENCE=0
NEW_TABLE=0
NEW_MIGRATION=0
NEW_RPC=0
NEW_EDGE_FUNCTION=0
NEW_FORECAST_FORMULA=0
NEW_INCOME_FORMULA=0
UI_REDESIGN=0
```

The dedicated Phase004 CI passed on the implementation acceptance head after one deliberate correction to the test semantics. The initial test expected Relationship and Nash to become `AGREE`; the projection correctly classified them as `COMPLEMENT` because they have different domain meanings. The test was corrected rather than weakening or changing the runtime behavior.

## 1. What decision contract already existed?

Forge had several complementary decision-shaped contracts rather than one neutral universal contract:

- Pack01 Relationship Foundation;
- Pack02 Advisor Intelligence / Mick;
- Pack03 Nash Next Best Action;
- Pack04 Opportunity / Priority / Forecast / Scenario;
- Pack07 Alfred Productive Experience;
- Advisor Forecast V3 read model;
- Revenue Value economic truth-state model.

## 2. What contract became canonical?

No domain contract was promoted to universal truth.

The cross-domain **consumer projection contract** is:

```text
FORGE_CROSS_DOMAIN_DECISION_PROJECTION
FCDP-004-001
```

implemented at:

`platform/decision-projection/forge-cross-domain-decision-projection.js`

This is a read-only adapter contract, not a new decision authority.

## 3. Was a new engine created?

No.

`NEW_ENGINES=0`

## 4. Was a new score created?

No.

Pack04 priority score is transported verbatim. Pack01 relationship scoring stays Pack01-owned. No global score exists.

`NEW_SCORES=0`

## 5. Was a new source of truth created?

No.

`NEW_SOURCE_OF_TRUTH=0`

## 6. Was persistence created?

No. The projection is derived, ephemeral/read-only and has no Supabase client or storage.

`NEW_PERSISTENCE=0`

## 7. Who owns priority?

There is no global priority owner created by Phase004.

For the opportunity/operation path, Pack04 remains the owner of its explainable priority score and attention budget. Other domains retain their own priority semantics. The projection only transports source-owned priority plus authority.

## 8. Who owns NBA?

FIP Pack03 Nash owns the governed Next Best Action recommendation contract.

The Phase004 Nash adapter transports it; it never creates an NBA.

## 9. Who owns Forecast?

The dependency trace resolved the previously deferred question:

```text
CURRENT_CANONICAL_FORECAST_AUTHORITY=MANAGER_OS_FORECAST
CURRENT_FORECAST_COMPOSITION_PATH=ADVISOR_FORECAST_COMPOSER_V3
CURRENT_FORECAST_DECISION_READ_MODEL=ADVISOR_FORECAST_READ_MODEL_V3
PACE_PROJECTION_OWNER=SMNYL_PACE_FORECAST_ENGINE
SCENARIO_CONTEXT_OWNER=MANAGER_ADVISOR_FORECAST_ENGINE
```

## 10. What role does Alfred retain?

```text
ALFRED_ROLE=ORCHESTRATOR_CONSUMER
```

Pack07 may compose/present/route. It does not become domain truth owner, priority owner, Forecast owner or NBA owner.

## 11. Can one person produce decisions from multiple domains?

Yes. A single `CommercialPerson`/person reference can have Relationship, Follow-up, Nash/Commercial Attention and other projections while each retains its owning authority.

## 12. Are equivalent decisions deduplicated?

They are **composition-grouped**, not destructively merged.

An explicit composition key is required. All original projections remain in the set.

## 13. Are different decisions preserved?

Yes. Different families under the same explicit composition context are classified `COMPLEMENT` and both remain visible to a consumer.

## 14. Are conflicts preserved?

Yes.

Different explicit action keys in the same composition context produce:

```text
relationship=CONFLICT
winnerDecisionReference=null
automaticResolutionAllowed=false
```

## 15. Is provenance preserved?

Yes. Every projection requires `sourceAuthorities` and may include source references, adapter ids, evidence authority/freshness and evaluated time.

## 16. Are economic semantics preserved?

Yes. The Revenue adapter uses the **exact Revenue Value bucket** as its truth/impact semantics. For example:

```text
earned_estimated != paid_confirmed
```

Forecast remains `PROJECTED`; it is not payout truth.

## 17. Can a consumer act without reinterpretation?

Yes. The consumer proof uses only projection fields to:

```text
format
render
route/delegate
```

It does not infer, rescore or recalculate confidence/impact.

## 18. Can the feedback that resolves a decision be identified?

Yes. Projection feedback declares owning domain + expected event names, for example:

- follow-up → Activity/Commitment event;
- coaching → Activity pattern / coach review;
- Forecast → observed outcome / confirmed policy event.

The projection does not write those events.

## 19. Does RLS still govern inputs?

Yes. Phase004 adds no source query path. Inputs must already have passed their owning source/session/RLS boundaries.

## 20. Is there cross-tenant leakage?

No new path is introduced. The projection has no client/query capability and therefore cannot expand source scope.

Inherited source suites continue to enforce advisor/session boundaries.

## 21. Can the projection layer bypass RLS?

No.

```text
PROJECTION_HAS_SUPABASE_CLIENT=NO
PROJECTION_DATABASE_ACCESS=NO
PROJECTION_RPC_ACCESS=NO
```

## 22. Does the session eliminate stale advisor decisions?

Phase004 creates no session store. It inherits the Pack07/Forecast requirements for logout scrub, advisor-switch scrub and late-result rejection. Forecast runtime acceptance remains green in the Phase004 CI source-authority regression.

No cross-session persistence was introduced.

## 23. What is the canonical Forecast authority?

`MANAGER_OS_FORECAST`, with responsibility split through the already-reconciled source map rather than one monolithic calculation owner.

## 24. What Forecast implementations remain adapters/legacy?

- Composer v1/v2 remain inherited generations upstream of V3.
- Composer V3 is current composition path.
- Read Model V3 is current decision-ready read model.
- Productive SmartWidget is presentation consumer.
- SMNYL Forecast owns monthly pace through adapter.
- Manager Advisor Forecast owns scenario context.
- root `revenue-forecast-engine.js` is rejected for Advisor Forecast by existing runtime reconciliation.

No legacy file was deleted in this phase.

## 25. Was Forecast deferred?

No. The repository contained a later authoritative runtime reconciliation and runtime acceptance sufficient to resolve the Blueprint002 ambiguity.

```text
FORECAST_AUTHORITY_STATUS=RESOLVED
FORECAST_PROJECTION=PASS
```

# Representative traces

```text
TRACE_1_FOLLOW_UP_OVERDUE=PASS
TRACE_2_RELATIONSHIP_COOLING=PASS
TRACE_3_NASH_NBA=PASS
TRACE_4_MICK_COACHING=PASS
TRACE_5_ADVISOR_FORECAST_V3=PASS
TRACE_6_MULTI_AUTHORITY_SAME_PERSON=PASS
```

Additional:

```text
PACK04_PRIORITY_TRANSPORT_EXACT=PASS
REVENUE_BUCKET_PRESERVATION=PASS
CONFLICT_PRESERVATION=PASS
STALE_PRESERVATION=PASS
CONSUMER_PROOF=PASS
STATIC_NO_PERSISTENCE_NO_SCORE_LOCK=PASS
```

# Source authority regression CI

Dedicated workflow:

`.github/workflows/forge-cross-domain-decision-projection-004.yml`

Implementation acceptance head result:

```text
PHASE004_SCOPE_LOCK=PASS
SYNTAX=PASS
PHASE004_DECISION_TRACES=PASS
PACK01_RELATIONSHIP=PASS
PACK02_ADVISOR_MICK=PASS
PACK03_NASH=PASS
PACK04_OPPORTUNITY=PASS
PACK07_ALFRED=PASS
ADVISOR_FORECAST_V3_CHAIN=PASS
NO_PERSISTENCE_NO_NEW_ENGINE=PASS
SECURITY_BOUNDARY=PASS
CI_RESULT=SUCCESS
```

The first CI attempt failed only because the Trace 6 test incorrectly expected `AGREE`. The contract correctly returned `COMPLEMENT`; the expectation was corrected and the next implementation head passed the complete workflow.

# Phase004 exact diff counts

Counts below include this Acceptance document and compare against the exact Phase003 base, not against `main`:

```text
FILES_CHANGED=9
PRODUCTION_FILES_CHANGED=2
TEST_FILES_CHANGED=1
DOC_FILES_CHANGED=5
WORKFLOW_FILES_CHANGED=1

NEW_ENGINES=0
NEW_SCORES=0
NEW_TABLES=0
NEW_MIGRATIONS=0
NEW_RPC=0
NEW_EDGE_FUNCTIONS=0

AUTHORITIES_ADAPTED=6
DECISION_TYPES_PROJECTED=7
REPRESENTATIVE_TRACES=6
DUPLICATE_GROUP_BEHAVIORS_TESTED=3
CONFLICT_CASES_TESTED=1

CI_RESULT=PASS
SECURITY_RESULT=PASS
FORECAST_AUTHORITY_STATUS=RESOLVED
```

Six adapter authority families:

1. Relationship / Pack01;
2. Nash / Pack03;
3. Opportunity / Pack04;
4. Mick / Pack02;
5. Advisor Forecast / Manager OS Forecast V3;
6. Revenue Value.

Seven representative projection types implemented:

1. `FOLLOW_UP_DUE / COMMITMENT_REVIEW`;
2. `RELATIONSHIP_HEALTH_REVIEW`;
3. `NEXT_BEST_ACTION`;
4. `OPPORTUNITY_PRIORITY`;
5. `MICK_EXECUTION_PATTERN`;
6. `ADVISOR_MONTHLY_FORECAST`;
7. `REVENUE_TRUTH_STATE`.

# Pass gate

```text
PREVIOUS_PHASE_003=PASS
CANONICAL_DECISION_CONTRACT_DISCOVERED_OR_RECONCILED=YES

NEW_BUSINESS_ENGINE=ZERO
NEW_SCORE=ZERO
NEW_SOURCE_OF_TRUTH=ZERO

PROVENANCE_PRESERVED=YES
IMPACT_SEMANTICS_PRESERVED=YES
HUMAN_DECISION_BOUNDARY_PRESERVED=YES

RELATIONSHIP_PROJECTION=PASS
OPPORTUNITY_PROJECTION=PASS
NASH_PROJECTION=PASS
ADVISOR_OR_MICK_PROJECTION=PASS
FORECAST_PROJECTION=PASS
ECONOMIC_TRUTH_STATE_PROJECTION=PASS

DEDUPLICATION_BEHAVIOR=PASS
CONFLICT_BEHAVIOR=PASS
STALE_BEHAVIOR=PASS

SECURITY=PASS
CI=PASS
```

# Known limitations / deliberate boundaries

1. Phase004 does not wire the projection into every Aura module. That is Phase005.
2. Phase004 does not redesign Home or create a final attention queue. That remains Phase007.
3. No new browser UI acceptance is claimed because no Phase004 UI surface was created.
4. The projection does not perform global ranking. This is deliberate.
5. Composition never drops a source decision or chooses a conflict winner.
6. Economic mapping currently proves Revenue Value truth-state transport; full Product + Economic experience completion remains a later assembly phase.

# Next phase

```text
NEXT_RECOMMENDED_PHASE=FORGE_DOMAIN_INTELLIGENCE_ACTIVATION_005
```

Phase005 should connect the stable projection contract to the owning module workspaces without moving business logic into Aura.
