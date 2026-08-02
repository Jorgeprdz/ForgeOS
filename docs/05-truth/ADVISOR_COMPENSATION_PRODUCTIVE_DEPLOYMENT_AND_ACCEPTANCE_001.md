# Advisor Compensation — Productive Deployment and Acceptance 001

## Purpose

Stage 100 closes the Advisor Compensation implementation by proving the complete
repository, transactional, browser and public-distribution boundaries while keeping
remote mutations behind an explicit deployment authorization.

The stage does not reinterpret a pull request as permission to change productive
Supabase state. Repository readiness and actual remote deployment are separate gates.

## Dependency

```text
BASE_STAGE=ADVISOR_COMPENSATION_090_PAYOUT_EVIDENCE_AND_RECONCILIATION
BASE_SHA=89910d34aeae26eb5ab5f01afc24f5ccfc28b6c1
STACKED_BRANCH=feat/advisor-compensation-100-productive-acceptance
MERGE=NOT_AUTHORIZED
```

## 100A — Repository acceptance

The acceptance runner executes every Advisor Compensation master contract available
under `compensation/advisor/tests`, plus the Stage 070 product UI, Stage 080 Income
Smart Widget and productive Smart Widget regressions.

It also verifies:

- syntax for the productive provider, canonical module and Pages distribution;
- no return to IndexedDB, Cartera, quote or default-rate calculations;
- canonical snapshot and history contracts;
- the Material 3 `?nav=comisiones` registration;
- logout/session scrub and late-result rejection;
- append-only SQL, forced RLS and owner isolation;
- a read-only Pages distribution with no commission engine or payout mutation code.

## 100B — Remote deployment

Prepared migration:

```text
MIGRATION=20260802090000_advisor_compensation_productive_authority
PROJECT_REF=rmlxigxysujsuwzgoimv
```

Prepared remote authorities:

```text
advisor_compensation_event_ledger
advisor_compensation_payout_evidence_ledger
advisor_compensation_payout_decision_ledger
advisor_compensation_payout_record_ledger
advisor_compensation_product_read_models
forge_advisor_compensation_authority_inventory()
forge_advisor_compensation_read_product(text,text[])
```

All five ledgers are append-only. RLS is enabled and forced. The browser role receives
owner-scoped `SELECT` and read-RPC execution only. Direct `INSERT`, `UPDATE`, `DELETE`
and `TRUNCATE` remain revoked.

Remote application requires all of the following:

```text
ADVISOR_COMPENSATION_REMOTE_DEPLOYMENT=APPLY_ADVISOR_COMPENSATION_STAGE_100
SUPABASE_PROJECT_REF=rmlxigxysujsuwzgoimv
SUPABASE_ACCESS_TOKEN=<secret>
```

Without the exact authorization token, the deployment script must fail before making a
network request.

## 100C — Transactional acceptance

The guarded remote gate is prepared to verify in a transaction:

- authenticated owner reads only their compensation product;
- another advisor's value cannot leak through the RPC;
- browser-role direct insert remains forbidden;
- the read model preserves `PAID`, `EARNED` and history contracts;
- acceptance fixtures are rolled back;
- residual fixture count is zero.

Life, GMM, initial, renewal, adjustment, reversal, payout, idempotency and conflict
coverage are retained through the complete Stage 000–090 master-test inventory.

## 100D — Browser and Pages acceptance

The canonical Material 3 shell now exposes:

```text
PUBLIC_ROUTE=?nav=comisiones
HOME_INCOME_DEEP_LINK=?nav=comisiones
```

The public runtime:

- registers Commissions in the same route registry as Home, Pipeline, Activity,
  Quotes and Cartera;
- resolves the authenticated advisor from the productive bootstrap;
- probes the remote authority before installing the provider;
- displays `DISCONNECTED` when the authority is unavailable;
- rejects cross-owner and late results;
- scrubs private data on logout, expired session and route unmount;
- reserves safe bottom space above the floating mobile navigation;
- publishes only read contracts and rendering code, never calculation engines,
  rule packs or payout mutation services.

Browser acceptance covers login, logout, reload, expired session, disconnected source,
Commissions truth cards, six-month history and mobile/tablet/desktop layouts.

## 100E — Rollback and closure

- the superseded Stage 100 bootstrap was removed;
- remote transactional fixtures use `ROLLBACK`;
- CI artifacts live only under `artifacts/`;
- no productive fixture is created by pull-request CI;
- no remote migration is applied without the exact authorization token;
- no merge is performed automatically.

## Honest stage states

```text
REPOSITORY_ACCEPTANCE=PASS_OR_FAIL_FROM_CI
PAGES_ARTIFACT_ACCEPTANCE=PASS_OR_FAIL_FROM_CI
BROWSER_ACCEPTANCE=PASS_OR_FAIL_FROM_CI
REMOTE_DEPLOYMENT=PREPARED_NOT_APPLIED
TRANSACTIONAL_REMOTE_ACCEPTANCE=PREPARED_NOT_EXECUTED
PUBLIC_PAGES_DEPLOYMENT=NOT_EXECUTED_ON_STACKED_PR
```

Stage 100 may be declared fully complete only after:

1. all Stage 100 CI jobs pass on the exact head;
2. the complete stacked PR chain is merged under explicit authorization;
3. the guarded remote deployment is explicitly authorized and succeeds;
4. the main-branch Pages deployment succeeds;
5. the public authenticated route is accepted against the deployed SHA;
6. rollback and zero-residual evidence are recorded.

## Safeguards

```text
UNKNOWN_IS_NOT_ZERO=YES
QUOTE_AS_INCOME=NO
ISSUED_PREMIUM_AS_PAID=NO
POLICY_PREMIUM_AS_PAID_COMMISSION=NO
AUTOMATIC_PAYOUT_CONFIRMATION=NO
AUTOMATIC_REMOTE_DEPLOYMENT=NO
DIRECT_BROWSER_COMPENSATION_MUTATION=NO
PRODUCT_RECOMMENDATION_BY_COMMISSION=NO
MERGE=NOT_AUTHORIZED
```
