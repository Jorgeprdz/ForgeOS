# Advisor Compensation Product UI Connection 001

Status: STAGE 070 CONTROLLED IMPLEMENTATION

## Constitutional gate

```text
APPLICABLE_CONSTITUTION=FORGE_OS_AGENTS_AND_ADVISOR_COMPENSATION_STAGE_000
APPLICABLE_ADR=ADR_017_COMPENSATION_INTELLIGENCE_EVIDENCE_BOUNDARY
BUILD_TREE_AREA=ADVISOR_OS_COMPENSATION_AND_PRODUCT_UI
DISCOVERY_STATUS=COMPLETE
IMPLEMENTATION_READINESS=READY
MIRANDA_APPROVAL=OWNER_GO_070_ONE_PASS
BOARD_APPROVAL_STATUS=STAGE_000_ROADMAP_AUTHORITY_ACTIVE
SCOPE_BOUNDARY=ADVISOR_COMPENSATION_PRODUCT_UI_READ_ONLY
PROHIBITED_SURFACES=DATABASE_WRITES_POLICY_MUTATION_PAYOUT_PROMOTION_PRODUCT_RECOMMENDATION
VALIDATION_EXPECTATION=CONTRACT_BROWSER_RESPONSIVE_SESSION
```

## Purpose

Replace the legacy Commissions route that read `DB.obtenerTodos('cartera')` and calculated commission truth inside the browser.

The product surface now consumes only:

```text
ADVISOR_COMPENSATION_PERIOD_SNAPSHOT_001
ADVISOR_COMPENSATION_HISTORY_SERIES_001
```

The UI does not calculate commissions, infer rates, read Cartera as an economic source or use IndexedDB as a fallback.

## Stage 070 substages

### 070A — Source replacement

The product source contract is:

```text
ADVISOR_COMPENSATION_PRODUCT_READ_MODEL_001
```

Providers may expose either:

```text
loadCompensationProduct(context)
```

or:

```text
loadPeriodSnapshot(context)
loadHistorySeries(context)
```

Every request includes the authenticated advisor, selected monthly period, six historical periods, AbortSignal, request ID and read-only marker.

The provider registry allows the productive source to be registered without coupling the UI to Supabase, IndexedDB or a specific transport.

No provider produces:

```text
STATE=DISCONNECTED
SNAPSHOT=null
HISTORY=null
```

It never activates the old Cartera calculation.

### 070B — Honest UI states

Supported states:

```text
LOADING
READY
PARTIAL
EMPTY
BLOCKED
STALE
ERROR
DISCONNECTED
```

Loading never shows old figures. Empty means the source was available and reported no movements. Partial preserves unknowns. Stale remains visibly labeled. Error never reuses a previous period as current. Disconnected explains that the canonical source is absent.

### 070C — Monthly summary and detail

The monthly surface displays separately:

```text
REAL
PAID
EARNED_NET
ESTIMATED
POTENTIAL
AT_RISK
ADJUSTMENTS
REVERSALS
```

`REAL` always displays its explicit basis: `PAID`, `EARNED` or `UNAVAILABLE`.

Each aggregate detail preserves concept, policy reference, latest event state, amounts, calculation digest, Rule Pack digest and append-only explanation.

### 070D — Historical view

The historical section reuses six canonical monthly points. It renders the best-known real amount for each period while retaining its basis label. It does not reconstruct compensation from policies.

### 070E — Simulator separation

Simulation is rendered in a separate surface with:

```text
SIMULATION ≠ TRUTH
```

A scenario is not included in `PAID`, `EARNED` or `REAL`. No simulated amount is generated in Stage 070.

### 070F — Responsive and session acceptance

The product surface includes desktop, tablet and mobile layouts, safe space above the floating navigation pill, 44 px controls, overflow protection, AbortController cancellation, request-generation and session checks, late-result rejection, route cleanup, AppState scrub and DOM scrub.

## Legacy retirement

The active `comisiones.js` route no longer contains:

```text
DB.obtenerTodos('cartera')
TASAS_VIDA
TASAS_GMM
TRAINING_METAS
getTasaVida
getTasaGMM
calcularMotor
```

Legacy copies remain archival only and are not imported by the active route.

## Product source boundary

Stage 070 establishes the product UI connection contract and provider registry. The default absence of a provider is deliberately honest: `DISCONNECTED`.

A productive provider must return canonical Stage 060 snapshots. Stage 080 will reuse the same productive period snapshot for the Income Smart Widget and must not create another compensation calculation.

## Security and privacy

The route obtains advisor ownership from authenticated `AppState.user.id`.

A result is discarded when the route was unmounted, a newer request exists, the request was aborted, the authenticated advisor changed or the route root changed.

## Forbidden shortcuts

```text
INDEXEDDB_FALLBACK=NO
CARTERA_FALLBACK=NO
UI_CALCULATION=NO
DEFAULT_RATE=NO
QUOTE_AS_INCOME=NO
ISSUED_PREMIUM_AS_INCOME=NO
POTENTIAL_AS_REAL=NO
SIMULATION_AS_TRUTH=NO
EARNED_AS_PAID=NO
UNKNOWN_AS_ZERO=NO
```

## Exit gate

```text
COMPENSATION_UI_CANONICAL_SOURCE=PASS
TRUTH_STATE_LABELING=PASS
DETAIL_EXPLAINABILITY=PASS
HISTORICAL_VIEW=PASS
SIMULATOR_BOUNDARY=PASS
RESPONSIVE_CONTRACT=PASS
SESSION_SCRUB=PASS
LATE_RESULT_REJECTION=PASS
STAGE_070_COMPLETE=YES
```
