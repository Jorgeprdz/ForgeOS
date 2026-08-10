# FORGE FULL COMMERCIAL LOOP ACCEPTANCE 009 — DISCOVERY

```text
PHASE=FORGE_FULL_COMMERCIAL_LOOP_ACCEPTANCE
PHASE_NUMBER=009
BASE_SHA=c0057f8eba3e1b016d7ef61023fda594d0c12b77
BRANCH=feature/forge-full-commercial-loop-acceptance-009
CHECKPOINT=CHECKPOINT_009_C4_SOURCE_OF_TRUTH
```

## Existing end-to-end spine

Phase 009 discovered and reuses CRS-11 rather than creating a second commercial loop. CRS-11 is a read-only acceptance authority over the accepted CRS 00–10 spine and explicitly creates no second business authority, database, route, timeline, score or mutation surface.

```text
CRS_11_CONTRACT=platform/shared-commercial-model/crs-11-end-to-end-acceptance-contract.js
CRS_11_CONTRACT_TEST=tests/crs-11-end-to-end-acceptance-contract-test.mjs
CRS_11_JOURNEY_TEST=tests/crs-11-end-to-end-journey-service-test.mjs
CRS_11_BROWSER_TEST=tests/e2e/crs-11-end-to-end-relationship-visual.spec.mjs
CRS_11_WORKFLOW=.github/workflows/crs-11-end-to-end-relationship-acceptance.yml
REUSE_CRS_11=YES
NEW_COMMERCIAL_SPINE=NO
```

## Source-of-truth matrix

| Stage | Producer | Source of truth | Consumer | Persistence / read model | Provenance | Human state |
|---|---|---|---|---|---|---|
| Prospect | Productive Prospect service + Pipeline Stage RPC | `public.prospects`, Productive Prospect service, Pipeline stage authority | CRS-03 / Aura Pipeline | existing Prospect persistence | prospect ref, advisor, stage event, CRS-02 envelope | may remain identity `UNRESOLVED` |
| Contact | FES canonical activity event | FES-01 canonical event | FES ledger / CRS-04 / Activity | FES-02 append-only ledger | evidence/source/privacy/correlation/timestamps | event can exist without person resolution |
| Appointment | FES canonical activity event | FES-01/FES-02 | CRS-04 / Timeline / Activity | FES ledger + FES projections | activity ref, event type, source identity, correction lineage | no automatic calendar/contact/action |
| Quote | Quote persistence + Accepted Quote / Product Intelligence | Quote authority / product-specific decision read model | CRS-05 / Aura Quotes | existing quote/version authority | quote/version/prospect/person/correlation/product calculation authority | acceptance remains distinct from Policy |
| Policy | Cartera / Policy Truth | Cartera policy authority | Cartera / CRS timeline / economic consumers | existing Policy persistence | policy/application/person/correlation/issuance evidence | issuance evidence required |
| Payment | Cartera 030C + Cartera 080 human handoff | confirmed premium payment event | Advisor Compensation payment consumer | existing payment evidence/obligation/handoff contracts | evidence, policy, obligation, person, decision, idempotency, correlation | human-confirmed premium payment; not payout |
| Commission | Advisor Compensation | compensation rule snapshot + commission engine + compensation event truth | Income/read models | canonical compensation contracts/snapshots | policy/product/payment/rule/calculation/payout refs | `POTENTIAL/ESTIMATED/EARNED/PAID/...` explicit |
| Renewal | Policy lifecycle + forward-signal/forecast + compensation aggregates | Policy/Forecast/Compensation authorities | Income/Home/renewal consumers | existing policy/forecast/economic read models | policy/period/rule/source signal | expected remains expected until generated evidence |

## Authority transition classification

| Transition | Classification | Reason |
|---|---|---|
| Prospect → Contact | CANONICAL + HUMAN_ACTION | FES records contact/activity facts; no autonomous contact |
| Contact → Appointment | CANONICAL + HUMAN_CONFIRMATION | Appointment is an FES event/commitment fact, not inferred from contact |
| Appointment → Quote | ADAPTER / HUMAN_CONFIRMATION | Quote authority consumes explicit commercial context; appointment does not fabricate quote |
| Quote → Policy | HUMAN_CONFIRMATION / CANONICAL_EXTERNAL_AUTHORITY | accepted Quote remains separate from Application/Policy; Cartera owns Policy |
| Policy → Payment | CANONICAL + HUMAN_CONFIRMATION | Cartera payment reconciliation/handoff owns confirmed premium payment |
| Payment → Commission | ADAPTER | Advisor Compensation consumes payment evidence; rules determine earned interpretation |
| Policy → Renewal | PROJECTION until lifecycle fact exists | renewal expected remains forward signal/scenario until generated event |
| Renewal → Commission | ADAPTER | compensation authority interprets renewal commission from applicable evidence/rules |

## Identity continuity

CRS-03 establishes:

```text
PIPELINE_PROSPECT_AUTHORITY=PRODUCTIVE_EXISTING
COMMERCIAL_PERSON_AUTHORITY=CARTERA_010B
IDENTITY_STATES=LINKED_UNRESOLVED
NEW_PROSPECT_INITIAL_CONVERGENCE=PERSON_UNRESOLVED
COMMERCIAL_PERSON_CREATED_AUTOMATICALLY=NO
IDENTITY_RESOLVED_AUTOMATICALLY=NO
AUTOMATIC_IDENTITY_MERGE=FORBIDDEN
```

CRS-04 carries Activity/FES facts without auto-inventing a Prospect relationship. Missing source identity or missing governed Cartera link remains explicit `UNRESOLVED`.

CRS-11 proves one canonical person can retain multiple commercial movements, quotes and policies while authority remains domain-owned.

## Economic continuity

Advisor Compensation owns the state model:

```text
UNKNOWN
POTENTIAL
ESTIMATED
EARNED
PAID
ADJUSTED
REVERSED
BLOCKED
CONFLICTING
```

Hard distinctions:

```text
QUOTE != ISSUED_POLICY
ISSUED_POLICY != PAID_PREMIUM
PAID_PREMIUM != EARNED_COMMISSION_UNLESS_RULES_APPLY
EARNED_COMMISSION != PAID_COMMISSION
SCENARIO != EXPECTED != GENERATED
UNKNOWN != ZERO
INITIAL != RENEWAL
```

Income is a read-only presentation consumer. Expected renewals are typed forward signals; pipeline impact is a scenario; generated income requires canonical earned evidence; paid-to-advisor requires payout evidence.

## Navigation / Home continuity

Phase 008 already repaired owner-routing context. Home remains attention orchestration and transports decision/source context to owner routes without recalculating the originating decision. Pipeline consumes governed intelligence when available and no longer presents local historical heuristic priority as global truth.

## Provenance continuity requirements

Phase 009 acceptance must preserve where supplied by the existing contract:

```text
entity_reference
domain_reference
source_reference
decision_reference
event_reference
timestamp
actor/advisor
tenant
authority
state
confidence_or_degradation
correlation_id
idempotency_reference
```

## FORGE_009_GAP_MATRIX

| Area | Gap class | Existing authority | Existing contract | Broken consumer | Minimal fix | Domain owner | new_truth_required |
|---|---|---|---|---|---|---|---|
| Cross-domain loop A–H | TEST_GAP | CRS-11 + Cartera + Compensation + Income/Forecast | existing contracts named above | no single Phase009 acceptance harness | add Phase009 integration/static/browser acceptance using existing owners | Phase009 acceptance only | NO |
| Prospect identity | NO_GAP | Cartera 010B + CRS-03 | CRS-03 | none proven | none | Cartera/Pipeline | NO |
| Contact/Appointment | NO_GAP | FES + CRS-04 | CRS-04 | none proven | none | FES | NO |
| Quotes | NO_GAP | Quote/Product Intelligence | Accepted Quote/product-specific read model | none proven | regression only | Quotes/Product Intelligence | NO |
| Policy | NO_GAP | Cartera Policy | Policy Truth/Cartera contracts | none proven | regression only | Cartera | NO |
| Payment | NO_GAP | Cartera 030C/080 | confirmed-payment handoff | none proven | regression only | Cartera | NO |
| Compensation | NO_GAP | Advisor Compensation | payment/commission/payout contracts | none proven | regression only | Advisor Compensation | NO |
| Renewal expected/generated | NO_GAP | Forecast/Policy/Compensation | forward-signal + economic contracts | none proven | regression only | Forecast/Policy/Compensation | NO |
| Home/routing context | NO_GAP | Phase 007/008 | FCDP/FHAO/router context | none proven post-008 | regression only | Home/router | NO |
| RLS/tenant isolation | TEST_GAP | existing RLS/auth boundaries | CRS-11 security acceptance + auth/REP17 | Phase009 needs explicit assertion | compose existing security tests | existing owners | NO |

```text
AUTHORITY_GAP=0
CONTRACT_GAP=0
PROVENANCE_GAP_PROVEN=0
PRODUCTIVE_FIX_REQUIRED=NO
NEW_TRUTH_REQUIRED=NO
REUSE_BEFORE_CREATE_GATE_009=PASS
CHECKPOINT_009_C4=PASS
CHECKPOINT_009_C5=PASS
```

## Authorized next work

Phase 009 is authorized to add only acceptance tests, test fixtures if necessary, workflow and evidence. Productive runtime code remains preserve-only unless the new acceptance suite proves a concrete defect.
