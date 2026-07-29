# REP-08 — Portfolio Report Provider

```text
REP_08_PORTFOLIO_REPORT_PROVIDER=IMPLEMENTED_ACCEPTED
REPORTING_BRANCH=feature/universal-reporting-kernel-foundation
SOURCE_COMMIT=49be490a3fbf278d3361df5ed008ef26724f1c56
PORTFOLIO_POLICY_PERIOD_MODEL_SCHEMA=portfolio-policy-period-read-model.v1
PORTFOLIO_POLICY_ENTRY_SCHEMA=portfolio-policy-entry.v1
PORTFOLIO_POLICY_EXCLUSIONS_SCHEMA=portfolio-policy-exclusions.v1
PORTFOLIO_REPORT_PROVIDER_SCHEMA=portfolio-report-provider.v1
REPORT_DEFINITION_ID=portfolio-policy-issuance
REPORT_DEFINITION_VERSION=portfolio-policy-issuance.v1
PORTFOLIO_READ_AUTHORITY=YES
PORTFOLIO_MUTATION_AUTHORITY=NO
PREMIUM_CALCULATION_AUTHORITY=NO
POLICY_STATUS_DERIVATION_AUTHORITY=NO
RENEWAL_DERIVATION_AUTHORITY=NO
FOREIGN_EXCHANGE_AUTHORITY=NO
CLIENT_PII_PROJECTION_AUTHORITY=NO
UNIVERSAL_AGGREGATION_AUTHORITY=NO
COMPARISON_AUTHORITY=NO
EXPORT_AUTHORITY=NO
PRODUCTIVE_UI_MUTATION=NO
REMOTE_DATABASE_MUTATION=NO
```

REP-08 projects accepted policy facts into the universal reporting kernel. The
period axis is policy emission date. Policy status is observed at the request
`asOf`; this phase does not invent historical status snapshots.

The current cartera normalizer supplies emission, plan, variant, currency,
payment frequency, collection channel, premium, sum assured, personal-policy
scope and status. REP-08 preserves those facts without mutating cartera.

## Dimensions

- `emissionDate`
- `policyStatus`
- `productPlan`
- `productVariant`
- `currency`
- `paymentFrequency`
- `collectionChannel`
- `policyScope`

## Measures

- `premiumAmount`
- `sumAssuredAmount`
- `policyCount`

Monetary measures require the `currency` dimension. No foreign-exchange
conversion is permitted in this provider.

No client name or policy number is projected.

Next: `REP-09_ACTIVITY_REPORT_PROVIDER`.
