# Forge Cross-Domain Decision Projection 004

Phase: `FORGE_CROSS_DOMAIN_DECISION_PROJECTION_004`

## Purpose

Phase 004 creates a neutral, read-only consumer projection over existing Forge intelligence authorities. It does not create a new business brain, score, recommendation engine, source of truth or persistence layer.

The canonical direction is:

```text
DOMAIN EVIDENCE / TRUTH
        ↓
OWNING INTELLIGENCE AUTHORITY
        ↓
AUTHORITY-SAFE ADAPTER
        ↓
FORGE_CROSS_DOMAIN_DECISION_PROJECTION
        ↓
WORKSPACE / ALFRED / HOME CONSUMER
        ↓
HUMAN ACTION IN OWNING DOMAIN
        ↓
DOMAIN EVENT / EVIDENCE
```

## Existing authorities preserved

| Domain | Owner retained | Projection role |
|---|---|---|
| Relationship | FIP Pack01 + CRS/Timeline upstream | transport commitment/health/evidence |
| Nash NBA | FIP Pack03 | transport recommendation/reason/evidence/action |
| Opportunity priority | FIP Pack04 | transport score/why-now/attention semantics without recalculation |
| Mick / Advisor | FIP Pack02 | transport coaching pattern/experiment only |
| Forecast | Manager OS Forecast with V3 read model; SMNYL pace component | transport planning state/projection only |
| Economic | Revenue Value / compensation/economic event authorities upstream | transport exact revenue bucket and amount semantics |
| Orchestration | FIP Pack07 Alfred | consume/compose projections; never own truth |

## Canonical projection contract

Implemented at:

`platform/decision-projection/forge-cross-domain-decision-projection.js`

Contract:

```text
FORGE_CROSS_DOMAIN_DECISION_PROJECTION
FCDP-004-001
```

A projection contains:

- stable decision reference;
- advisor scope;
- subject type/reference;
- source domain and decision family/type;
- source-owned truth state;
- title/reason/why-now;
- source-owned priority/urgency/confidence, when available;
- evidence with authority and freshness;
- limitations;
- delegated human action;
- source-owned impact semantics;
- provenance;
- lifecycle/staleness;
- feedback contract;
- explicit composition keys.

## What the contract explicitly does not do

```text
createsTruth=false
createsScore=false
calculatesPriority=false
calculatesConfidence=false
calculatesImpact=false
automaticExecutionAllowed=false
persistenceAllowed=false
```

Priority, confidence and impact values are invalid without their source authority. The projection does not generate them.

## Authority-safe adapters

Implemented at:

`platform/decision-projection/forge-cross-domain-decision-adapters.js`

### Relationship adapter

Consumes Pack01 foundation/commitments. It can project an explicit source state such as `OVERDUE`, `COOLING`, `AT_RISK` or `UNKNOWN`; it does not calculate relationship health or relationship score.

Expected feedback remains in Pipeline/Timeline or relationship evidence.

### Nash adapter

Consumes an already-created Pack03 Nash recommendation. It preserves:

- recommended action;
- why this person/action/now;
- confidence;
- evidence and limitations;
- human approval.

The adapter does not create a Next Best Action.

### Opportunity adapter

Consumes an already-created Pack04 priority. `priority.score` is transported verbatim with authority `FIP_PACK_04_OPPORTUNITY_AND_OPERATION`.

The projection contains no priority formula and cannot rank priorities.

### Mick adapter

Consumes a Pack02 Mick pattern and keeps it in family `COACHING`. A recommended experiment remains a coaching action owned by Coach/Activity; it never becomes automatic commercial execution.

### Advisor Forecast adapter

Consumes Advisor Forecast Read Model V2/V3, with V3 established by the Phase004 Forecast trace as the current decision-ready path.

It transports pace as `PROJECTED` with authority `SMNYL_PACE_FORECAST_ENGINE`, while provenance also names `MANAGER_OS_FORECAST`, Manager Advisor Forecast, Production Events, Pipeline and FES.

No money forecast is created.

### Revenue adapter

Consumes an already-classified `RevenueValue`. The exact bucket — for example `earned_estimated` or `paid_confirmed` — is used as the impact semantics and truth state. It is not promoted or translated into a stronger economic claim.

## Decision families

The neutral contract distinguishes:

```text
COMMERCIAL_ATTENTION
FOLLOW_UP
RELATIONSHIP
COACHING
PRODUCTIVITY
PLANNING
FORECAST
ECONOMIC
SERVICING
RISK
```

These families are presentation/composition categories. They do not replace owning domain types.

## Deduplication and conflict

Phase 004 does **not** merge domain truth objects.

`composeDecisionProjectionSet()` retains every owned projection. It only produces read-only composition groups when adapters provide an explicit `composition.key`.

Possible group relationships:

```text
AGREE
COMPLEMENT
CONFLICT
STALE
INSUFFICIENT_EVIDENCE
UNKNOWN
```

Rules are deliberately mechanical:

- an explicit shared composition key is required;
- different explicit action keys produce `CONFLICT`;
- different decision families under the same explicit key produce `COMPLEMENT`;
- explicitly merge-compatible same-family/same-action projections can be labelled `AGREE`;
- any stale contributor preserves `STALE`;
- no winner is ever selected.

```text
winnerDecisionReference=null
automaticResolutionAllowed=false
rankingPerformed=false
businessMeaningMerged=false
```

This is deduplication metadata for consumers, not an autonomous decision engine.

## Priority ownership

There is no new global priority formula.

Pack04 remains the current opportunity priority owner where its contract applies. Other domains may carry their own owned priority semantics. Phase004 transports values and authority only.

Alfred/Home may later compose bounded attention in Phase007, but Phase004 does not grant Alfred permission to re-score domain decisions.

## NBA ownership

Nash Pack03 remains owner of the governed Next Best Action recommendation contract.

A cross-domain projection may expose that recommendation alongside Relationship/Opportunity evidence. It cannot manufacture an NBA from unrelated fields.

## Forecast ownership

See `FORGE_FORECAST_AUTHORITY_TRACE_004.md`.

Resolved hierarchy:

```text
MANAGER_OS_FORECAST = runtime/composition owner
ADVISOR_FORECAST_COMPOSER_V3 = current composition path
ADVISOR_FORECAST_READ_MODEL_V3 = current decision-ready read model
SMNYL_PACE_FORECAST_ENGINE = monthly pace owner
MANAGER_ADVISOR_FORECAST_ENGINE = scenario context owner
```

Forecast remains planning context, not economic/payment/compensation truth.

## Economic semantics

Phase004 reuses Revenue Value buckets rather than inventing an economic enum.

Therefore:

```text
potential
!= pending_payment
!= payment_confirmed
!= earned_estimated
!= paid_confirmed
```

Unknown/blocked/not-modeled states remain explicit.

A Forecast projection cannot become `earned_estimated` or `paid_confirmed` merely because it contains a numeric projection.

## Provenance

Every projection requires at least one `sourceAuthority`.

When available it also carries:

- source references;
- adapter id;
- evidence authorities;
- observed/freshness timestamps;
- evaluation time;
- limitations.

A consumer can therefore answer “why is Forge showing this?” without reverse-engineering UI logic.

## Human boundary

All Phase004 action projections default to human decision required. The contract rejects `automaticExecutionAllowed=true`.

The owning workspace remains responsible for mutations. The projection layer does not write Pipeline, Activity, Timeline, Policy, Revenue, Calendar, Tasks or messages.

## Feedback contract

The projection may declare which owning domain events would indicate that the decision was addressed, for example:

```text
FOLLOW_UP_DUE
→ ACTIVITY_RECORDED / COMMITMENT_RESCHEDULED / COMMITMENT_FULFILLED

MICK_EXECUTION_PATTERN
→ ACTIVITY_PATTERN_CHANGED / COACH_REVIEW_RECORDED

ADVISOR_MONTHLY_FORECAST
→ OBSERVED_OUTCOME / POLICY_SOLD_CONFIRMED
```

This is not machine learning or automatic mutation. It is a consumer/delegation contract.

## Lifecycle and staleness

Projection lifecycle supports:

```text
DERIVED
ACTIVE
STALE
SUPERSEDED
RESOLVED
EXPIRED
```

Adapters may mark `STALE` only from explicit stale source evidence/state. They do not invent freshness thresholds.

## Security boundary

The projection layer has no Supabase client, database calls, RPCs or persistence. It operates only on already-authorized upstream objects.

Therefore it cannot expand tenant visibility. Security remains owned by source RLS/session boundaries.

Consumer/session requirements from Pack07/Forecast remain:

- logout scrub;
- advisor-switch scrub;
- late-result rejection;
- stale decision rejection by the consumer/runtime when source generation changes.

These are tested through inherited source suites; Phase004 itself introduces no session store.

## Consumer proof

The contract is intentionally sufficient for a consumer to perform only:

```text
format
render
route/delegate
```

The consumer does not need to calculate, infer, rescore, reclassify confidence or reinterpret economic semantics.

## Representative traces

1. Timeline-backed overdue Pack01 commitment → `FOLLOW_UP_DUE`.
2. Pack01 `COOLING` relationship state → relationship review projection.
3. Pack03 Nash recommendation → `NEXT_BEST_ACTION`, human-only.
4. Pack02 Mick observed pattern → coaching experiment.
5. Advisor Forecast V3 → projected planning decision.
6. Relationship + Nash same-person follow-up → `AGREE` composition group with no dropped authority or winner.

Additional tests cover Pack04 exact score transport, Revenue bucket preservation, conflicts and stale sources.

## No-UI declaration

No Home, Pipeline, Cartera, Activity, Income or Aura visual surface is redesigned in Phase004.

The output is semantic infrastructure for Phase005 domain activation.

```text
NEW_ENGINE=0
NEW_SCORE=0
NEW_TRUTH=0
NEW_TABLE=0
NEW_MIGRATION=0
NEW_RPC=0
NEW_EDGE_FUNCTION=0
UI_REDESIGN=0
PRODUCTION_DEPLOYMENT=0
```
