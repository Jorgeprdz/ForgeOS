# Forge SeguBeca Calculation Authority Closure 001

## Closure

```text
SEGUBECA_CALCULATION_AUTHORITY=PASS
RECORDED=2026-08-01
SOURCE_MAIN_HEAD=5299e5a0d51a13e684a62ba03bbc020e019c4cb0
VALIDATED_IMPLEMENTATION_HEAD=43cdb6bd6b3390a323678bebeeb8af44722e0e69
AUTHORITY_VERSION=SEGUBECA-CALCULATION-AUTHORITY-001.1
PRODUCT_CALCULATION_REIMPLEMENTED=NO
PRODUCT_UI_MUTATION=NO
SCHEMA_MUTATION=NO
SUPABASE_MUTATION=NO
DATABASE_MIGRATION=NO
```

## Accepted authority composition

```text
CONTRACTUAL_PRODUCT_VALUES=SOLUCIONLINE_SOURCE_DOCUMENT
SOURCE_EXTRACTION=ACCEPTED_SEGUBECA_PDF_PARSER
ACCEPTED_NORMALIZATION=SEGUBECA_ACCEPTED_QUOTE_ADAPTER
CURRENT_AND_PROJECTED_MXN=FORGE_UDI_MXN_RUNTIME
PROMOTED_FACADE=advisor-os/quotes/products/segubeca/segubeca-calculation-authority.js
```

The promoted facade composes the accepted historical implementation. It does not replace or reproduce the insurer's actuarial calculation.

## Accepted financial behavior

```text
ANNUAL_UDI_GROWTH_RATE=0.045
UDI_GROWTH_IS_PRODUCT_YIELD=NO
PROJECTION_GUARANTEED=NO
MISSING_VERIFIED_UDI_RATE=BLOCKED_NO_VERIFIED_UDI_RATE
SOURCE_GUARANTEED_TABLE_PRECEDENCE=PASS
MATURITY_YEAR_MAPPING=PASS
ADMINISTRATION_YEAR_MAPPING=PASS
TOTAL_CONTRIBUTED_YEAR_BY_YEAR=PASS
FLAT_TOTAL_CONTRIBUTION_CONVERSION=BLOCKED
LEGACY_CURRENT_RATE_FIELDS_AUTHORITATIVE=NO
```

Synthetic acceptance preserved the source `35,339 UDI` accumulated contribution from the guaranteed table instead of replacing it with the unrounded multiplication of annual premium by contribution years.

The projected MXN total contains one schedule entry per source contribution year and is not equal to `source total UDI × current UDI`.

## Tests

```text
SEGUBECA_AUTHORITY_WORKFLOW_RUN=30722419644
SEGUBECA_AUTHORITY_WORKFLOW_CONCLUSION=SUCCESS
REP_17_WORKFLOW_RUN=30722419612
REP_17_WORKFLOW_CONCLUSION=SUCCESS
QPD_WORKFLOW_RUN=30722419615
QPD_WORKFLOW_CONCLUSION=SUCCESS
```

The focused workflow accepted:

- bounded changed paths;
- JavaScript syntax;
- facade source and projection behavior;
- historical Solucionline parser regression;
- historical projected-MXN runtime regression;
- source-authority and no-invention boundaries;
- REP-17 cross-module regression.

QPD additionally accepted canonical printable contracts, Product Intelligence restoration, UDI integration and browser acceptance.

## Non-authorizations

```text
PREMIUM_RECALCULATION=NO
SUM_ASSURED_RECALCULATION=NO
GUARANTEED_TABLE_RECALCULATION=NO
ADMINISTRATION_TABLE_RECALCULATION=NO
AUTOMATIC_QUOTE_ACCEPTANCE=NO
AUTOMATIC_APPLICATION_CREATION=NO
AUTOMATIC_POLICY_CREATION=NO
AUTOMATIC_PIPELINE_STAGE_ADVANCE=NO
QUOTE_PERSISTENCE_MUTATION=NO
CRM_MUTATION=NO
CARTERA_MUTATION=NO
```

## PR head governance

This evidence commit is documentation-only. GitHub PR gates must revalidate the final PR head before merge.

```text
FINAL_HEAD_BOUND_BY_GITHUB_PR_GATES=YES
MERGE_AUTHORIZATION=PENDING
NEXT_AFTER_MERGE=SEGUBECA_PRODUCTIVE_UI_BINDING_AND_REAL_PDF_ACCEPTANCE
```
