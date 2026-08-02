# Forge SeguBeca Progressive Layout and Shared Print Recovery 001

## Owner direction

```text
RECORDED=2026-08-01
SOURCE_MAIN_HEAD=0fb32fd397878dec6c2e1dbe3b10a88b47202204
PASS=SEGUBECA_INFORMATIONAL_RELAYOUT_PLUS_SHARED_PRINT_RUNTIME_RECOVERY
```

The displayed SeguBeca information and calculations are accepted as correct. This pass must not change them. It may only:

1. promote the exact basic sum assured as the dominant top metric;
2. reorder the existing information into a progressive commercial sequence;
3. apply a distinct SeguBeca visual identity;
4. preserve the human-confirmed accepted snapshot;
5. recover shared print actions when the Quotes projection is reconciled or replaced.

## SeguBeca presentation authority

The progressive order is:

```text
01=SUM_ASSURED_HERO
02=PLAN_SUMMARY
03=PROTECTED_PARTICIPANTS
04=CONTRIBUTIONS
05=EDUCATION_GOAL
06=PAYOUT_METHOD
07=PROTECTION
08=INCLUDED_BENEFITS
09=ADDITIONAL_COVERAGES
10=SECONDARY_DETAILS_AND_UDI
11=MISSING_INFORMATION
```

The hero source is restricted to an existing rendered metric whose normalized label is exactly one of:

```text
Suma asegurada
Suma asegurada básica
```

It must not promote a longer coverage label merely because that label contains the words `suma asegurada`, including the disability coverage label observed in the productive screenshot.

The hero promotion reads the existing rendered UDI and MXN strings. It does not derive, convert or recalculate either value.

```text
HERO_VALUE_SOURCE=EXISTING_RENDERED_EXACT_SUM_ASSURED
HERO_RECALCULATION=NO
HERO_SOURCE_DUPLICATION=HIDDEN_AFTER_PROMOTION
```

## SeguBeca visual identity

```text
PRODUCT_THEME=SEGUBECA_BLUE_GOLD
PRIMARY_IDENTITY=EDUCATIONAL_BLUE
SECONDARY_ACCENT=SOFT_GOLD
VIDA_MUJER_PINK_CHANGED=NO
CARTERA_THEME_CHANGED=NO
```

The product theme changes presentation variables, borders, gradients and emphasis only. It does not modify any product field.

## Shared print root cause

The canonical printable runtime creates one card containing three actions:

```text
PREVIEW_OR_PRINT
DOWNLOAD_PDF
VERSION_HISTORY
```

The Quotes product projection may later be reconciled with `replaceChildren` or an equivalent DOM replacement. That replacement removes the already-mounted printable card. The previous runtime relied on a bounded timed retry and selected lifecycle events; it did not continuously detect a later projection replacement. Therefore the same failure could affect both Vida Mujer and SeguBeca.

```text
ROOT_CAUSE=SHARED_QUOTES_PROJECTION_REPLACEMENT_AFTER_PRINTABLE_MOUNT
PRODUCT_SPECIFIC_PRINT_CAUSE=NO
```

## Accepted snapshot module-identity root cause

During the recovery pass, the productive browser was found to import the same binding source with two different module URLs:

```text
QUOTES_MODULE_IMPORT=segubeca-productive-ui-binding.js?v=segubeca-productive-ui-001
ENTRYPOINT_IMPORT=segubeca-productive-ui-binding.js?v=segubeca-productive-ui-001-4
```

ES module identity includes the full URL, including the query string. The browser therefore created two independent module instances with separate module-scoped review boundaries. One instance calculated and confirmed the quote while the other was queried for the accepted snapshot and printable state.

The canonical binding URL is now shared by both loaders:

```text
SEGUBECA_BINDING_MODULE_URL=./segubeca-productive-ui-binding.js?v=segubeca-productive-ui-001-4
SEGUBECA_BINDING_MODULE_INSTANCE_COUNT=1
DUPLICATE_BINDING_MODULE_INSTANCE=FORBIDDEN
```

This is runtime identity convergence only. No product formula, contractual field or persistence authority is changed.

## Accepted snapshot lifecycle

The productive binding owns the local accepted review snapshot. The base bridge may clear its active candidate after human confirmation; that cleanup must not make the accepted snapshot disappear before printing.

```text
ACCEPTED_SNAPSHOT_CREATED_BY=HUMAN_CONFIRMATION
ACCEPTED_SNAPSHOT_AVAILABLE_AFTER_BASE_CANDIDATE_CLEANUP=YES
ACCEPTED_SNAPSHOT_CLEARED_ON=NEXT_QUOTE_CANDIDATE_OR_EXPLICIT_CLEAR
ACCEPTED_SNAPSHOT_AUTOMATIC_CREATION=NO
```

The accepted snapshot is a local review/read boundary. It does not create a policy, advance Pipeline, mutate CRM or persist a quote remotely.

## Recovery contract

`M05W-002` observes projection-relevant DOM changes. After a human acceptance signal, when an accepted quote is ready but the printable card is absent, it invokes the existing canonical printable entrypoint `refresh()` and verifies that exactly one card with all three actions is present again.

It does not implement PDF generation, does not click an action and does not download a document.

When no accepted snapshot exists, the guard waits for the next real event and does not poll indefinitely or mutate the projection.

```text
PRINTABLE_AUTHORITY_REIMPLEMENTED=NO
PRINTABLE_CARD_DUPLICATION=FORBIDDEN
PRINTABLE_ACTION_COUNT=3
AUTOMATIC_PREVIEW=NO
AUTOMATIC_DOWNLOAD=NO
AUTOMATIC_HISTORY_OPEN=NO
```

## Calculation and data boundaries

```text
SEGUBECA_CALCULATION_AUTHORITY_CHANGED=NO
SEGUBECA_PRODUCT_FORMULA_CHANGED=NO
SEGUBECA_UDI_RATE_CHANGED=NO
SEGUBECA_UDI_PROJECTION_CHANGED=NO
SEGUBECA_CONTRACTUAL_VALUES_CHANGED=NO
SEGUBECA_PDF_PARSER_CHANGED=NO
SEGUBECA_ACCEPTED_PACKET_CHANGED=NO
QUOTE_MUTATION=NOT_AUTHORIZED
CRM_MUTATION=NOT_AUTHORIZED
PIPELINE_MUTATION=NOT_AUTHORIZED
CARTERA_MUTATION=NOT_AUTHORIZED
SUPABASE_MUTATION=NOT_AUTHORIZED
DATABASE_MUTATION=NO
```

The following accepted values must remain unchanged in the real-PDF regression fixture:

```text
ANNUAL_PREMIUM=2524.19_UDI
PAYMENT_YEARS=14
TOTAL_CONTRIBUTED=35339_UDI
TOTAL_RECOVERY=30000_UDI
UDI_PROJECTION_RATE=0.045
PROJECTION_GUARANTEED=NO
FLAT_TOTAL_CONVERSION_AUTHORIZED=NO
```

## Required acceptance

```text
EXACT_SUM_ASSURED_HERO=PASS_REQUIRED
PROGRESSIVE_SECTION_ORDER=PASS_REQUIRED
SEGUBECA_BLUE_GOLD_THEME=PASS_REQUIRED
ORIGINAL_DISPLAYED_INFORMATION_PRESERVED=PASS_REQUIRED
SINGLE_BINDING_MODULE_INSTANCE=PASS_REQUIRED
ACCEPTED_SNAPSHOT_AFTER_HUMAN_CONFIRMATION=PASS_REQUIRED
VIDA_MUJER_PRINT_ACTIONS_SURVIVE_RECONCILIATION=PASS_REQUIRED
SEGUBECA_PRINT_ACTIONS_SURVIVE_RECONCILIATION=PASS_REQUIRED
SINGLE_PRINTABLE_CARD=PASS_REQUIRED
THREE_PRINTABLE_ACTIONS=PASS_REQUIRED
SEGUBECA_REAL_PDF_REGRESSION=PASS_REQUIRED
QPD_BROWSER_REGRESSION=PASS_REQUIRED
PAGES_ARTIFACT_VERSIONING=PASS_REQUIRED
REP_17=PASS_REQUIRED
```

## Merge boundary

```text
MAIN_MUTATION=NO_UNTIL_EXPLICIT_AUTHORIZATION
MERGE_METHOD=CONTROLLED_SQUASH_ONLY
MERGE_AUTHORIZATION=PENDING
```
