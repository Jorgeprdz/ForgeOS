# Forge Smart Widgets Productive Unified PASS 001

## Status

```text
PASS=FORGE_SMART_WIDGETS_PRODUCTIVE_UNIFIED_PASS_001
IMPLEMENTATION_BRANCH=feature/smart-widgets-productive-unified-pass
ACCOUNT_MUTATION=NOT_AUTHORIZED
REMOTE_DATABASE_MUTATION=NOT_EXECUTED
PRODUCTIVE_UI_MOUNT=NOT_EXECUTED
STATIC_MOCK_REPLACEMENT=NOT_EXECUTED
```

## Purpose

Implement every Smart Widget layer that can be safely developed now, including layers whose productive authority is not connected yet, while documenting the exact dependency required to activate each remaining surface.

This PASS does not convert unknown values to zero, does not treat inferences as confirmed facts, does not derive income from quotes or premium, and does not execute commercial actions.

## Implemented now

### 1. Productive presentation contract

Implemented:

- canonical widget states;
- productive widget families;
- common metric, comparison, trend, chart, evidence, uncertainty and freshness fields;
- read-only and human-final-authority boundaries;
- explicit blocked and not-connected states;
- stack contract with one primary, at most two supporting cards and full inventory.

File:

- `advisor-os/forge-alive/smart-widgets/productive-smart-widget-contract.mjs`

### 2. Productive providers

Implemented:

- `ACTIVITY_PROGRESS_WIDGET`;
- `MONTHLY_POLICY_GOAL_WIDGET`;
- `POLICY_SERVICE_RISK_WIDGET`;
- `OPPORTUNITY_CLOSE_LIKELIHOOD_WIDGET`;
- `INCOME_PROGRESS_WIDGET`.

File:

- `advisor-os/forge-alive/smart-widgets/productive-smart-widget-providers.mjs`

Provider boundaries:

- Activity consumes FES/REP facts and a separate Mick scoring snapshot.
- Monthly policy goal counts one `POLICY_SOLD_CONFIRMED` policy as one protected family and deduplicates by policy/month.
- Policy service distinguishes confirmed overdue, due soon, payment confirmation required, possible late payment and renewal due.
- Opportunity likelihood v1 is deterministic, versioned and signal-explainable; Nash may explain it but does not own or invent the percentage.
- Income consumes Compensation snapshots only and explicitly rejects quote/premium substitution.

### 3. Contextual ranking and stability

Implemented:

- eligibility filtering;
- hard business-priority preemption;
- confidence and state adjustments;
- time-of-day and month-end context;
- deterministic tie breaking;
- sticky primary;
- challenger margin;
- anti-flapping;
- visible limit of one primary plus two supporting widgets;
- dependency inventory;
- session-required fail closed behavior;
- late result and abort-compatible source loading.

File:

- `advisor-os/forge-alive/smart-widgets/productive-smart-widget-orchestrator.mjs`

Hard priority examples:

```text
CONFIRMED_OVERDUE_POLICY
  > PAYMENT_CONFIRMATION_REQUIRED
  > CONFIRMED_INCOME_AT_RISK
  > POLICY_RENEWAL_DUE
  > OPPORTUNITY_DECISION_DUE_TODAY
  > DAILY_ACTIVITY_RECOVERY
  > MONTH_END_GOAL_RISK
```

### 4. Source adapters

Implemented, but connection remains authority-dependent:

- Activity REP source adapter;
- monthly policy goal source adapter;
- Cartera Future Radar source adapter;
- Pipeline/Bitácora opportunity source adapter;
- Compensation income source adapter.

All adapters:

- require advisor scope;
- reject cross-advisor data;
- honor abort signals;
- expose honest disconnected states;
- perform no writes.

File:

- `advisor-os/forge-alive/smart-widgets/productive-smart-widget-source-adapters.mjs`

### 5. Monthly policy goal authority

Implemented in repository, not deployed remotely:

- append-only target history;
- one row per revision;
- owner-scoped RLS;
- authenticated RPC for new revisions;
- cross-advisor isolation;
- advisory transaction lock;
- no authenticated direct insert/update/delete grant;
- repository adapter for current-goal read and append.

Files:

- `supabase/migrations/20260801000400_smart_widget_monthly_policy_goals.sql`
- `advisor-os/forge-alive/smart-widgets/advisor-monthly-policy-goal-repository.mjs`

Activation still requires the normal migration deployment and remote transactional acceptance. The repository changes alone do not mutate the remote database.

### 6. Productive Material 3 home adapter

Implemented, not mounted:

- renders one primary and up to two supporting cards;
- renders existing chart-ready series without recalculating business measures;
- exposes `Ver todo` inventory;
- supports deep-link review actions;
- aborts stale reconciliation;
- rejects late results;
- clears private state on unmount/session loss;
- shows honest unavailable states;
- includes mobile, tablet, desktop and reduced-motion CSS.

Files:

- `docs/static-preview/forge-alive-material3/smart-widget-productive-home-adapter.js`
- `docs/static-preview/forge-alive-material3/smart-widget-productive-home-adapter.css`

The current static metric cards remain untouched until the productive orchestrator is published to the browser surface and minimum authorities are connected. This prevents a half-migrated home screen.

## Test coverage

Implemented tests:

- anonymous session renders no private widgets;
- REP chart data is preserved;
- missing Mick scoring does not fabricate points;
- monthly sold-policy deduplication;
- historical goal comparison;
- missing goal is blocked, not zero;
- disconnected Cartera is not represented as zero risk;
- confirmed overdue remains distinct from inferred late payment;
- deterministic explainable opportunity likelihood;
- decision-due-today priority;
- Income cannot consume quote projection;
- hard-priority ordering;
- anti-flapping;
- maximum one primary and two supporting cards;
- source abort handling;
- cross-advisor source isolation;
- monthly goal repository validation;
- monthly goal RLS and append-only migration assertions;
- legacy Smart Widget read-model regression.

Files:

- `tests/productive-smart-widget-orchestrator-master-test.mjs`
- `tests/productive-smart-widget-source-adapters-test.mjs`
- `tests/smart-widget-monthly-policy-goal-authority-test.mjs`
- `.github/workflows/smart-widgets-productive-validation.yml`

## Connection status by widget

### Activity

```text
PROVIDER=IMPLEMENTED
REP_ADAPTER=IMPLEMENTED
CHART_READY_SUPPORT=IMPLEMENTED
PRODUCTIVE_BROWSER_BINDING=PENDING
MICK_25_POINT_SCORING_SNAPSHOT=PENDING
```

Dependencies:

1. publish/import the productive orchestrator on the Material 3 Pages surface;
2. connect the current Activity Reporting Runtime;
3. define and expose the authoritative Mick points snapshot with rule version.

Until item 3 exists, Activity may show confirmed event totals and real charts as `PARTIAL`, but it must not claim `18 / 25`.

### Monthly policy goal

```text
PROVIDER=IMPLEMENTED
HISTORICAL_COMPARISON=IMPLEMENTED
PERSISTENCE_MIGRATION=IMPLEMENTED_NOT_DEPLOYED
REPOSITORY=IMPLEMENTED
GOAL_EDITOR=PENDING
POLICY_SOLD_FACT_SOURCE=PENDING_CONNECTION
```

Dependencies:

1. deploy migration `20260801000400` through the normal remote gate;
2. add the human goal-entry/editor surface;
3. connect canonical `POLICY_SOLD_CONFIRMED` production facts;
4. remote RLS and cross-advisor acceptance.

### Policy service risk

```text
PROVIDER=IMPLEMENTED
DISCONNECTED_ADAPTER=IMPLEMENTED
PRODUCTIVE_DATA=PENDING
```

Dependency:

- promote and connect at least Cartera 050 Future Radar authority to the current main/runtime surface.

The provider already understands the required distinctions. It must not copy Cartera logic or query its internal tables directly.

Later Cartera 060/070 growth and relational activation may provide additional widget families, but they do not block the payment/vencimiento widget. Cartera 080 may improve email/payment/compensation evidence connection.

### Opportunity close likelihood

```text
DETERMINISTIC_MODEL_V1=IMPLEMENTED
EXPLAINABILITY=IMPLEMENTED
CONFIDENCE=IMPLEMENTED
BITACORA_SIGNAL_EXTRACTION=PENDING_CONNECTION
NASH_EXPLANATION=PENDING_CONNECTION
```

Dependencies:

1. map canonical Pipeline/Bitácora facts to the v1 signal vocabulary;
2. preserve evidence references and timestamps;
3. calibrate weights against real outcomes before treating the percentage as statistically calibrated;
4. connect Nash only as explanation, never as hidden percentage authority.

Until calibration exists, the UI must label the result as an explainable commercial estimate with confidence.

### Income

```text
PROVIDER=IMPLEMENTED
DISCONNECTED_ADAPTER=IMPLEMENTED
QUOTE_SUBSTITUTION=BLOCKED
PRODUCTIVE_DATA=PENDING
```

Dependency:

- `COMPENSATION_INCOME_TRUTH_MINIMUM` must expose scoped snapshots for:
  - income real;
  - income earned;
  - income paid;
  - income potential;
  - income at risk;
  - evidence and period.

Cartera 080 may connect payment/compensation evidence, but Smart Widgets still requires Compensation to own the final income classifications. Quotes, premium and pipeline value cannot be shown as confirmed income.

## Productive mount gate

The Material 3 adapter may replace the current fixed `Resumen del día` only when all of the following pass:

```text
PUBLIC_BROWSER_ORCHESTRATOR=AVAILABLE
AUTH_SESSION_BRIDGE=CONNECTED
ACTIVITY_REP_SOURCE=CONNECTED
MONTHLY_GOAL_STATE=READY_OR_EXPLICITLY_BLOCKED
PIPELINE_BITACORA_SOURCE=CONNECTED_OR_HIDDEN_BY_SCOPE
CARTERA_SOURCE=CONNECTED_OR_NOT_CONNECTED_HONESTLY
INCOME_SOURCE=CONNECTED_OR_NOT_CONNECTED_HONESTLY
LOGOUT_SCRUB=PASS
LATE_RESULT_REJECTION=PASS
PAGES_ASSET_PUBLICATION=PASS
MOBILE_TABLET_DESKTOP_QA=PASS
```

## Deliberately not included

- remote migration execution;
- direct account mutation;
- automatic messages;
- automatic task/calendar creation;
- automatic Pipeline stage changes;
- automatic opportunity creation;
- autonomous final NBA priority;
- payout calculation;
- bonus/contest implementation;
- Cartera 060/070 promotion;
- Compensation implementation outside the minimum source contract.

These are not silently deferred Smart Widget behaviors. They are separate authority domains or explicit safety boundaries.

## Final state

```text
PRODUCTIVE_WIDGET_CONTRACT=PASS
PRODUCTIVE_WIDGET_PROVIDERS=PASS
CONTEXTUAL_RANKING=PASS
STABILITY_AND_ANTI_FLAPPING=PASS
SOURCE_ADAPTERS=PASS
MONTHLY_GOAL_AUTHORITY_REPOSITORY=PASS_NOT_DEPLOYED
MATERIAL3_HOME_ADAPTER=PASS_NOT_MOUNTED
TESTS_LOCAL=PASS
REMOTE_CI=PENDING_PR_RUN

ACTIVITY_WIDGET=DEVELOPED_PARTIAL_UNTIL_MICK_SCORING
MONTHLY_GOAL_WIDGET=DEVELOPED_PENDING_MIGRATION_AND_FACT_CONNECTION
POLICY_SERVICE_WIDGET=DEVELOPED_PENDING_CARTERA_CONNECTION
OPPORTUNITY_WIDGET=DEVELOPED_PENDING_BITACORA_MAPPING_AND_CALIBRATION
INCOME_WIDGET=DEVELOPED_PENDING_COMPENSATION_AUTHORITY

STATIC_FAKE_METRICS_REMOVED=NO
REASON=PRODUCTIVE_MOUNT_GATE_NOT_YET_SATISFIED
NEXT=OPEN_PR_RUN_CI_THEN_CONNECT_AUTHORITIES_INCREMENTALLY_WITHOUT_REWRITING_WIDGETS
```
