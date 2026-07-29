# REP-07 — Commissions Report Provider

```text
REP_07_COMMISSIONS_REPORT_PROVIDER=IMPLEMENTED_ACCEPTED
REPORTING_BRANCH=feature/universal-reporting-kernel-foundation
SOURCE_COMMIT=350da1905905bbec07c996da92b238240923f1d9
COMMISSION_REPORT_PERIOD_MODEL_SCHEMA=commission-report-period-read-model.v1
COMMISSION_REPORT_ENTRY_SCHEMA=commission-report-entry.v1
COMMISSION_REPORT_EXCLUSIONS_SCHEMA=commission-report-exclusions.v1
COMMISSIONS_REPORT_PROVIDER_SCHEMA=commissions-report-provider.v1
REPORT_DEFINITION_ID=commissions-ledger
REPORT_DEFINITION_VERSION=commissions-ledger.v1
COMMISSION_READ_AUTHORITY=YES
COMMISSION_CALCULATION_AUTHORITY=NO
COMMISSION_RATE_AUTHORITY=NO
BONUS_CALCULATION_AUTHORITY=NO
LEGACY_COMMISSION_ENGINE_AUTHORITY=NO
LEGACY_ZERO_SKELETON_AUTHORITY=NO
UNIVERSAL_AGGREGATION_AUTHORITY=NO
COMPARISON_AUTHORITY=NO
EXPORT_AUTHORITY=NO
PRODUCTIVE_UI_MUTATION=NO
REMOTE_DATABASE_MUTATION=NO
```

REP-07 projects accepted commission-ledger facts into the universal reporting
kernel. It does not calculate commission rates, weighted premium, Training
bonuses, Nuevo Profesional bonuses, LIMRA, IGC, or policy eligibility.

## Legacy boundary

The current `comisiones.js` motor contains UI-owned financial formulas. The
compatibility adapter under `legacy/crmaddlife` is still an empty skeleton and
explicitly requires parity before live wiring. Neither source is promoted to
domain truth by REP-07.

A runtime accepted by this provider must expose either:

- `commission-report-read-runtime.v1`; or
- `commission-ledger-read-composition.v1`.

The runtime returns `commission-report-period-read-model.v1`, containing
already-accepted initial and renewal ledger entries. Live persistence wiring is
outside this phase.

## Dimensions

- `effectiveDate`
- `commissionKind`
- `productPlan`
- `paymentFrequency`
- `policyYear`

## Measures

- `commissionAmount`
- `premiumAmount`
- `points`
- `policyCount`

All measures are additive and use `SUM`.

Next: `REP-08_PORTFOLIO_REPORT_PROVIDER`.
