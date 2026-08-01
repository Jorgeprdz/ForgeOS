# Forge SeguBeca Calculation Authority 001

## Status

```text
STATUS=IMPLEMENTED_PENDING_PR_ACCEPTANCE
SOURCE_MAIN_HEAD=5299e5a0d51a13e684a62ba03bbc020e019c4cb0
AUTHORITY_VERSION=SEGUBECA-CALCULATION-AUTHORITY-001.1
DELIVERY_MODE=HISTORICAL_AUTHORITY_PROMOTION_NOT_REIMPLEMENTATION
PRODUCT_UI_MUTATION=NO
SCHEMA_MUTATION=NO
SUPABASE_MUTATION=NO
DATABASE_MIGRATION=NO
```

## Governing decision

SeguBeca uses a split authority model:

```text
CONTRACTUAL_PRODUCT_VALUES=SOLUCIONLINE_SOURCE_DOCUMENT
SOURCE_EXTRACTION=ACCEPTED_SEGUBECA_PDF_PARSER
ACCEPTED_NORMALIZATION=SEGUBECA_ACCEPTED_QUOTE_ADAPTER
CURRENT_AND_PROJECTED_MXN=FORGE_UDI_MXN_RUNTIME
```

Forge does not rebuild the actuarial product from inputs.

```text
PREMIUM_RECALCULATION=FORBIDDEN
SUM_ASSURED_RECALCULATION=FORBIDDEN
GUARANTEED_TABLE_RECALCULATION=FORBIDDEN
ADMINISTRATION_TABLE_RECALCULATION=FORBIDDEN
MONTHLY_EDUCATION_PAYOUT_RECALCULATION=FORBIDDEN
```

The authoritative PDF surfaces include, when present:

- product and plan variant;
- contracting party and associated minor;
- contribution term;
- base sum assured / education target;
- annual premium;
- annual premium with recommended benefits;
- guaranteed-value table;
- accumulated contribution;
- recovery and cash values;
- administration-of-savings table;
- monthly and accumulated education delivery;
- contractor protections and optional coverages;
- source administration interest rate.

## Reused accepted implementation

```text
PARSER=docs/static-preview/quote-preview-live/forge-segubeca-solucionline-parser.js
PACKET_ADAPTER=docs/static-preview/quote-preview-live/forge-pdf-browser-parser.js
ACCEPTED_CALCULATION=docs/static-preview/quote-preview-live/forge-accepted-quote-adapter.js
UDI_MXN_RUNTIME=docs/static-preview/quote-preview-live/forge-udi-mxn-runtime.js
PRODUCT_DASHBOARD=docs/static-preview/quote-preview-live/forge-segubeca-product-dashboard-adapter.js
```

Historical closure lineage:

```text
R14C=SEGUBECA_SOLUCIONLINE_PDF_INTAKE
R14E=SEGUBECA_ACCEPTED_RUNTIME_MAPPING
R14J=SEGUBECA_PROJECTED_MXN_RUNTIME
PRODUCT_INTELLIGENCE_MERGE=ef8be3a045ef41b6b4d47ca34867aa495cd0edc8
```

The promoted facade is:

```text
advisor-os/quotes/products/segubeca/segubeca-calculation-authority.js
```

It exposes one governed path from accepted PDF evidence to normalized contractual facts and the year-aware commercial MXN projection.

## Contractual fact precedence

### Total contributed

```text
1=nativeResult.totalContributed
2=packet.totalContributed
3=finalGuaranteedRow.accumulatedAnnualPremiumWithAve
4=annualPremium × paymentYears only when source total is absent
```

The source guaranteed table must win over multiplication. A rounded source amount such as `35,339 UDI` must not be silently replaced by `2,524.19 × 14 = 35,338.66 UDI`.

### Total recovery

```text
1=nativeResult.totalRecovery
2=packet.totalRecovery
3=finalGuaranteedRow.totalRecovery
4=finalAdministrationRow.accumulatedDelivery
```

## UDI and MXN rules

The UDI base must be verified through the accepted metadata provider.

```text
UDI_SERIES=SP68257
MISSING_VERIFIED_RATE=BLOCKED_NO_VERIFIED_UDI_RATE
HARD_CODED_RATE=FORBIDDEN
```

SeguBeca uses the accepted non-guaranteed UDI scenario:

```text
ANNUAL_UDI_GROWTH_RATE=0.045
PROJECTED_UDI_YEAR_N=CURRENT_UDI × (1 + 0.045)^(N - 1)
PROJECTION_GUARANTEED=NO
```

The 4.5% is an UDI growth scenario. It is not product yield, illustrated return or a guarantee from the insurer.

### Policy-year mapping

```text
CURRENT_ANNUAL_PREMIUM=POLICY_YEAR_1
CURRENT_COVERAGES=POLICY_YEAR_1
EDUCATION_TARGET=MATURITY_YEAR
MONTHLY_EDUCATION_DELIVERY=MATURITY_YEAR
ADMINISTRATION_ROW=MATURITY_YEAR + ADMINISTRATION_YEAR - 1
FINAL_ACCUMULATED_DELIVERY=FINAL_ADMINISTRATION_YEAR
FINAL_GUARANTEED_RECOVERY=FINAL_CONTRIBUTION_YEAR
```

### Total contributed MXN

Flat conversion is forbidden:

```text
TOTAL_UDI × CURRENT_UDI=NOT_AUTHORITATIVE
TOTAL_UDI × FINAL_PROJECTED_UDI=NOT_AUTHORITATIVE
```

The accepted calculation distributes the source total across the source payment term and converts each installment with that policy year's projected UDI:

```text
ANNUAL_INSTALLMENT_UDI=SOURCE_TOTAL_CONTRIBUTED_UDI / SOURCE_PAYMENT_YEARS
TOTAL_CONTRIBUTED_MXN=Σ(ANNUAL_INSTALLMENT_UDI × PROJECTED_UDI_FOR_EACH_YEAR)
```

The generated `projectedContributionSchedule` is required evidence for the projected total.

## Compatibility fields

The historical accepted adapter exposes current-rate compatibility fields such as `totalContributedMXN`. They remain available for legacy consumers but are not the authority for the projected commercial reading.

```text
LEGACY_CURRENT_RATE_FIELDS_PRESERVED=YES
LEGACY_CURRENT_RATE_FIELDS_AUTHORITATIVE=NO
CANONICAL_PROJECTED_TOTAL=nativeResult.totalContributedAmount
```

## Safety boundaries

```text
AUTOMATIC_QUOTE_ACCEPTANCE=FORBIDDEN
AUTOMATIC_APPLICATION_CREATION=FORBIDDEN
AUTOMATIC_POLICY_CREATION=FORBIDDEN
AUTOMATIC_PIPELINE_STAGE_ADVANCE=FORBIDDEN
CRM_MUTATION=NO
CARTERA_MUTATION=NO
QUOTE_PERSISTENCE_MUTATION=NO
PRODUCT_UI_MUTATION=NO
```

## Acceptance

```text
SOURCE_TABLE_PRECEDENCE=PASS_REQUIRED
UDI_RATE_PROVENANCE=PASS_REQUIRED
SEGUBECA_UDI_GROWTH_RATE_4_5=PASS_REQUIRED
MATURITY_YEAR_MAPPING=PASS_REQUIRED
ADMINISTRATION_YEAR_MAPPING=PASS_REQUIRED
TOTAL_CONTRIBUTED_YEAR_BY_YEAR=PASS_REQUIRED
FLAT_TOTAL_CONVERSION=BLOCKED
NO_VERIFIED_UDI_RATE=FAIL_CLOSED
OTHER_PRODUCT_REWRITE=FORBIDDEN
REP_17=PASS_REQUIRED
```
