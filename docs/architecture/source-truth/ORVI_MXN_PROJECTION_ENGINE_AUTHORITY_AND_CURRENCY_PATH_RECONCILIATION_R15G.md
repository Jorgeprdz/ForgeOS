# ORVI MXN Projection Engine Authority And Currency Path Reconciliation R15G

## Decision

`PASS_R15G_ORVI_MXN_PROJECTION_ENGINE_AUTHORITY_AND_CURRENCY_PATH_RECONCILIATION`

- Canonical owner: `product-intelligence`.
- Authority registry: `product-intelligence/currency/orvi-mxn-projection-authority.js`.
- UDI current path: `READY_VERIFIED_RATE`.
- UDI future path: `READY_4_5_SCENARIO_NOT_GUARANTEED`.
- USD current path: `READY_VERIFIED_FIX_RATE`.
- USD future path: `BLOCKED_PENDING_EXPLICIT_SCENARIO_RATE_AUTHORITY`.
- Runtime wiring: `NO`.
- Dashboard wiring: `NO`.
- Recommendation: `null`.
- Next: `R15H_ORVI_UDI_MXN_PROJECTION_ADAPTER_AND_USD_CURRENT_EQUIVALENCE`.

## Rate authority versus projection authority

A current rate and a future assumption are different evidence classes.

A verified current-rate provider may authorize current MXN equivalence. It does not authorize a future growth assumption by itself.

The registry therefore separates:

1. Source-currency amount.
2. Current verified rate.
3. Future scenario assumption.
4. Projection timing.
5. Calculation label.
6. Guarantee status.
7. Consumer authorization.

No current rate value or date is persisted in this authority module.

## UDI path

### Current

- Rate key: `UDI_MXN`.
- Rate must be verified at execution time.
- Formula class: source amount multiplied by current verified UDI rate.
- Status: ready for implementation.

### Future

- Base rate must be verified.
- Scenario rate: 4.5% annual compound growth.
- Evidence role: derived scenario and projection evidence only.
- Guarantee status: not guaranteed.
- Required label: `PROJECTED_UDI_4_5_PERCENT_SCENARIO_NOT_GUARANTEED`.
- Status: ready for implementation.

The tracked workbook contains `2` ORVI formula occurrence(s) supporting the 4.5% scenario. The workbook does not become parser or contractual authority.

## USD path

### Current

- Rate key: `USD_MXN_FIX`.
- Rate must be verified at execution time.
- Formula class: source amount multiplied by current verified FIX rate.
- Status: ready for implementation.

### Future

- No authorized default annual USD/MXN growth assumption was established.
- The current FIX rate is not a forecast.
- Generic compound math is not assumption authority.
- Status: blocked.

An explicit, governed scenario-rate decision is required before future USD values may be projected.

## Projection timing

The canonical rule is:

`years_from_base = policy_year - 1`

Therefore:

- policy year 1 uses the verified base rate;
- policy year 6 uses five years of projection;
- policy year 10 uses nine years;
- policy year 20 uses nineteen years.

This matches the existing UDI timeline convention and prevents a one-year forward shift.

## Legacy boundaries

- `orvi-client-report-test.js` is a legacy scenario surface, not source or Product Intelligence authority.
- `orvi-mxn-conversion-engine.js` is mathematical utility only.
- `UNRESOLVED` is product-specific and has no ORVI authority.
- `docs/static-preview/quote-preview-live/forge-rate-cache.json` is a current-rate cache candidate, not a future forecast.
- `docs/quote-preview-live/forge-quote-calculators.mjs` is a verified UDI metadata and scenario-math candidate.

## Authorized fields for the next adapter

For UDI:

- current MXN equivalent of sum assured;
- projected MXN scenario of sum assured at dynamic checkpoint years;
- current MXN equivalent of guaranteed values;
- projected MXN scenario of guaranteed values;
- current and projected MXN comparison fields for cumulative paid and recovery.

For USD:

- current MXN equivalents only;
- future MXN fields must return an explicit blocked state.

## Prohibited

- No stale value silently treated as verified.
- No future USD default.
- No hidden rate assumption.
- No future value labeled guaranteed.
- No investment-return classification.
- No recommendation.
- No runtime, dashboard, or UI integration.

## Next

`R15H_ORVI_UDI_MXN_PROJECTION_ADAPTER_AND_USD_CURRENT_EQUIVALENCE`
