# ORVI Real PDF Extraction, Projected Recovery Math And Protection UI Repair R15M2B

## Module

`R15M2B_ORVI_REAL_PDF_EXTRACTION_PROJECTED_RECOVERY_MATH_AND_PROTECTION_UI_REPAIR`

## Constitutional authority

- Article 0 and WALL-E: Forge strengthens human judgment and never becomes final decision authority.
- `FORGE_CONSTITUTION_V3.md`: Evidence First, Capture Once, No Invented Data, Product Semantics over number extraction, explicit-rate forecast boundary and Advisor First.
- ADR-001, ADR-002, ADR-003, ADR-004, ADR-005, ADR-007 and ADR-008.
- Repository-owner authorization repairs the real-PDF defect discovered after R15M2A and before R15M3.

R15M2B does not execute or close R15M3. Human visual acceptance remains pending.

## Confirmed extraction cause

PDF.js preserved `item.str`, X/Y transforms and item width. The browser row grouper sorted those positioned items but joined every fragment with one space and collapsed all whitespace. The canonical ORVI coverage parser correctly requires layout evidence between coverage, term, sum assured and premium columns. The flattened browser row therefore produced zero coverage rows, and the unchanged contract correctly rejected the envelope with `coverages:AT_LEAST_ONE_REQUIRED`.

Private, sanitized measurement confirmed:

- three PDF pages and 1,089 PDF.js items;
- positioned items with X/Y/width;
- 478 measured horizontal gaps;
- minimum observed inter-item gap 9.3173 PDF units;
- zero coverages after old single-space grouping;
- five source coverages after layout-aware grouping.

The browser grouper now preserves page breaks with form feed and inserts two spaces when the horizontal gap is at least eight PDF units. Smaller gaps retain one space. The threshold is deterministic and below the minimum gap observed in the real coverage layout.

The canonical parser, its browser mirror, the parser contract and `coverages:AT_LEAST_ONE_REQUIRED` are unchanged. No OCR, filename authority, invented coverage or fallback synthesis exists.

## Projected recovery presentation

The existing view model already provides the three evidence inputs required by the owner:

- `source_currency.total_recovery.value`;
- `future_mxn.projected_rate.value`;
- `current_mxn.cumulative_paid.value`.

R15M2B therefore derives presentation values in the ORVI visual adapter without replacing canonical source values:

```text
projectedRecoveryMxn =
  source_currency.total_recovery.value
  * future_mxn.projected_rate.value

projectedDifferenceMxn =
  projectedRecoveryMxn
  - current_mxn.cumulative_paid.value

projectedRecoveryPercentage =
  projectedRecoveryMxn
  / current_mxn.cumulative_paid.value
  * 100
```

Calculations use the complete stored projected rate. Display formatting may round the rate and caps the visible percentage at two decimals. Invalid or missing rate, recovery or positive denominator remains pending; zero is not invented.

Each derived presentation record carries formula, numerator source, denominator source where applicable, projected-rate source, `comparison_only_not_investment_return`, `not_investment_return=true` and the unrounded result value.

Guaranteed-recovery cards now contain exactly six rows:

1. Total aportado
2. Valor de rescate
3. Recuperación total
4. Diferencia proyectada
5. Porcentaje de recuperación proyectado
6. UDI proyectada

`Valor en efectivo` and the rescue-plus-cash explanation are absent. Surrender value displays only source UDI. Total contributed preserves source UDI plus current contributed MXN. Projected recovery never consumes `current_mxn.total_recovery`.

## Protection presentation

The existing reusable product dashboard remains authoritative. ORVI-scoped rendering and CSS replace the four narrow protection metrics with:

- one full-width `Protección contratada` section;
- one dominant source-currency sum assured;
- current MXN integrated directly below the primary metric;
- compact currency and payment-term metadata;
- one full-width `Protección estimada en MXN` section;
- three future scenario cards with projected MXN, projected UDI rate and `Escenario, no garantía`.

Desktop uses three future columns, tablet uses 2+1, and mobile uses one column. The existing sticky view switcher remains. No shared template API, selector, dashboard family or global product behavior was duplicated.

## Browser and privacy boundary

Chromium 138 was run against the existing page and the private real PDF through the existing selector. Engineering inspection covered selector, accepted state, modal, desktop, tablet and mobile. Nine screenshots and a report exist only under `/storage/emulated/0/ForgeGemini`; every image was opened and inspected. No screenshot, PDF, private JSON, extracted text, identity, source amount or private hash is committed.

## Closure record

```text
STATUS=PASS_REAL_PDF_EXTRACTION_PROJECTED_RECOVERY_AND_PROTECTION_UI_REPAIR
REAL_ORVI_PDF_SELECTOR=PASS
COVERAGES_AT_LEAST_ONE_REQUIRED_ERROR=FIXED
COVERAGE_CONTRACT_WEAKENED=NO
COVERAGE_INVENTED=NO
CANONICAL_ORVI_PARSER_USED=YES
CANONICAL_ORVI_MAPPER_USED=YES
JSON_REQUIRED_FOR_USER_FLOW=NO
PROTECTION_NARROW_FOUR_CARD_LAYOUT=REMOVED
PROTECTION_PRIMARY_METRIC_FULL_WIDTH=YES
PROTECTION_CURRENT_MXN_INTEGRATED=YES
RECOVERY_VISIBLE_ROW_COUNT=6
CASH_VALUE_VISIBLE=NO
RECOVERY_EXPLANATION_VISIBLE=NO
SURRENDER_VALUE_MXN_VISIBLE=NO
PROJECTED_RECOVERY_FORMULA=RECOVERY_UDI_TIMES_PROJECTED_UDI_RATE
PROJECTED_DIFFERENCE_FORMULA=PROJECTED_RECOVERY_MXN_MINUS_CURRENT_CONTRIBUTED_MXN
PROJECTED_PERCENTAGE_FORMULA=PROJECTED_RECOVERY_MXN_DIVIDED_BY_CURRENT_CONTRIBUTED_MXN
PROJECTED_CALCULATION_USES_FULL_PRECISION_RATE=YES
PROJECTED_PERCENTAGE_CLASSIFICATION=COMPARISON_ONLY_NOT_INVESTMENT_RETURN
RATE_CACHE_CHANGED=NO
PDF_COMMITTED=NO
SCREENSHOTS_COMMITTED=NO
CLIENT_CONTENT_COMMITTED=NO
RECOMMENDATION=null
HUMAN_DECISION_REQUIRED=true
MANUAL_VISUAL_ACCEPTANCE=PENDING_USER_REVIEW
NEXT=R15M3_ORVI_MANUAL_VISUAL_ACCEPTANCE_SIGNOFF_AND_RELEASE_CLOSE
```
