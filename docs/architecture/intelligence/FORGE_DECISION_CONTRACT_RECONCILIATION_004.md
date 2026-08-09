# Forge Decision Contract Reconciliation 004

Phase: `FORGE_CROSS_DOMAIN_DECISION_PROJECTION_004`

## Decision

Forge already has strong **domain-owned decision-shaped contracts**, but no single existing contract is neutral and complete enough to be the cross-domain consumer contract without taking ownership away from its source domains.

Therefore Phase 004 will not create a new intelligence engine. It will create a **read-only projection contract/adapter** whose only authority is transport and composition semantics.

```text
NEW_BUSINESS_ENGINE=NO
NEW_RECOMMENDATION_ENGINE=NO
NEW_SCORE=NO
NEW_TRUTH=NO
NEW_PERSISTENCE=NO
NEW_PRIORITY_FORMULA=NO
NEW_CONFIDENCE_FORMULA=NO
```

## Existing contracts reviewed

### FIP Pack 01 — Relationship Intelligence

Authority: `platform/relationship-intelligence/fip-pack-01-foundation-contract.js`

Provides:
- `CommercialPerson`-anchored relationship context;
- commitments and due/overdue states;
- health states including `COOLING`, `AT_RISK`, `WAITING_ON_ADVISOR` and `UNKNOWN`;
- evidence with authority/freshness;
- source-owned relationship score;
- explicit `unknownAsZero=false` and human-approval boundaries.

Role in Phase 004: **SOURCE AUTHORITY / ADAPTER INPUT**. The projection may transport its state, evidence and source-owned score but may not recalculate relationship health or score.

### FIP Pack 02 — Advisor Intelligence / Mick

Authority: `platform/advisor-intelligence/fip-pack-02-advisor-mick-contract.js`

Provides:
- evidence-backed advisor execution patterns;
- `OBSERVED`, `HYPOTHESIS`, `UNKNOWN`, `INSUFFICIENT_EVIDENCE` states;
- business impact and recommended experiment;
- evidence/sample/confidence/limitations;
- coaching-only and human-interpretation boundaries.

Role in Phase 004: **SOURCE AUTHORITY / ADAPTER INPUT**. Coaching recommendation remains distinct from commercial action.

### FIP Pack 03 — Nash

Authority: `platform/nash/fip-pack-03-nash-conversation-contract.js`

Provides the strongest action-shaped recommendation contract:
- advisor/person references;
- recommended action;
- why this person/action/now;
- expected impact;
- confidence;
- evidence with authority;
- limitations and alternatives;
- human approval required;
- automatic execution prohibited.

Role in Phase 004: **NBA / REASON-WHY AUTHORITY**. Projection transports Nash recommendation; it never creates an NBA itself.

### FIP Pack 04 — Opportunity and Operation

Authority: `platform/opportunity-intelligence/fip-pack-04-opportunity-operation-contract.js`

Provides:
- opportunities and evidence states;
- source-owned explainable priority score/components;
- attention budget;
- `whyNow`;
- forecast state and confidence;
- scenarios/assumptions/risks;
- explicit human approval and no-auto-execution boundaries.

Role in Phase 004: **OPPORTUNITY PRIORITY / OPERATION AUTHORITY**. The projection transports Pack04 priority; it may not re-score it.

### FIP Pack 07 — Alfred Productive Experience

Authority: `platform/alfred/fip-pack-07-productive-experience-contract.js`

Provides the strongest generic orchestration/presentation shell:
- source availability/freshness;
- insight kinds `FACT`, `ESTIMATE`, `HYPOTHESIS`, `RECOMMENDATION`, `ACTION_REQUIRING_APPROVAL`;
- confidence/evidence/action reference;
- surface widgets/deep links;
- explicit `alfredRole=ORCHESTRATOR`;
- separation of fact/estimate/hypothesis/recommendation/action;
- logout scrub and late-result rejection requirements.

However Pack07 is **not sufficient as the canonical cross-domain decision contract** because it does not require:
- subject reference/type per insight;
- source domain/decision type;
- action owner and target;
- impact semantics and authority;
- detailed provenance/adapters;
- feedback contract;
- decision lifecycle/staleness fields;
- conflict/deduplication keys.

Its current service also flattens richer domain outputs into generic insights and orders them for orchestration. That is valid for Alfred but cannot become cross-domain truth.

Role in Phase 004: **ORCHESTRATOR / CONSUMER**, not decision truth owner.

### Revenue Value

Authority: `revenue/revenue-value.js`

Provides economic truth-state buckets such as:
- `potential`;
- `pending_policy_confirmation`;
- `pending_payment`;
- `payment_confirmed`;
- `earned_estimated`;
- `paid_confirmed`;
- `unknown` / `blocked` / `not_modeled`.

It explicitly treats Forecast as not payout truth.

Role in Phase 004: **ECONOMIC IMPACT SEMANTICS AUTHORITY**. Projection transports the bucket/source state; it must not collapse or rename it into stronger truth.

## Reconciliation matrix

| Concept | Existing field/authority | Decision |
|---|---|---|
| subject | Pack01/Pack03 person reference; domain-specific refs | ADAPT, no new identity |
| source domain | implicit in owning contract | ADD AS PROVENANCE LABEL |
| decision type/family | domain contract type and state | ADAPT WITHOUT REINTERPRETATION |
| priority | Pack04 priority score/components | REUSE EXACTLY |
| recommendation | Pack03 Nash | REUSE EXACTLY |
| relationship state | Pack01 | REUSE EXACTLY |
| coaching pattern | Pack02 Mick | REUSE EXACTLY |
| forecast | Manager OS Advisor Forecast V3 + source owners | REUSE / PROJECT |
| economic state | Revenue Value buckets | REUSE EXACTLY |
| confidence | source contract | TRANSPORT ONLY |
| evidence | Pack01/02/03/04/Forecast/Revenue | NORMALIZE REFERENCES ONLY |
| action | Pack03/Forecast/domain actions | TRANSPORT / DELEGATE |
| human boundary | all FIP contracts / Forecast | PRESERVE |
| Alfred surface | Pack07 | CONSUMER/ORCHESTRATOR |
| feedback | Decision Surface Matrix + owning domain event | ADD AS DECLARED DELEGATION CONTRACT |
| lifecycle/staleness | source freshness/as-of/state | DERIVED ONLY FROM EXPLICIT SOURCE DATES/STATES |

## Canonical result

No existing contract is promoted wholesale as the universal decision authority.

The canonical cross-domain **consumer shape** for Phase 004 is therefore:

```text
OWNED DOMAIN OUTPUT
  → authority-safe adapter
  → FORGE_CROSS_DOMAIN_DECISION_PROJECTION
  → consumer / Alfred / workspace
```

The projection contract is neutral because it:
- accepts already-computed source meaning;
- requires provenance;
- carries source-owned confidence/priority/impact state;
- is read-only and ephemeral;
- cannot calculate or mutate domain truth;
- never authorizes automatic commercial action.

## Gap proven before implementation

```text
SINGLE_EXISTING_NEUTRAL_DECISION_CONTRACT=NO
PACK07_GENERIC_ENOUGH_FOR_ORCHESTRATION=YES
PACK07_COMPLETE_ENOUGH_FOR_DOMAIN_DECISION_TRANSPORT=NO
PACK03_ACTION_GRAMMAR_REUSABLE=YES
PACK04_PRIORITY_FORECAST_GRAMMAR_REUSABLE=YES
PACK01_RELATIONSHIP_SEMANTICS_REUSABLE=YES
PACK02_COACHING_SEMANTICS_REUSABLE=YES
REVENUE_TRUTH_STATE_REUSABLE=YES
NEUTRAL_READ_ONLY_PROJECTION_ADAPTER_REQUIRED=YES
```
