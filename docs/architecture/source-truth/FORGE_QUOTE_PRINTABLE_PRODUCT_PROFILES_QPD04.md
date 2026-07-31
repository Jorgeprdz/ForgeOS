# Forge Quote Printable Product Profiles — QPD-04

Status: `PASS / IMPLEMENTED / GITHUB_ACCEPTED`

Date: `2026-07-30`

Branch: `feature/quote-printable-document-closure`

## Purpose

QPD-04 owns product-aware document composition for printable quotes.

It does not calculate values, change Product Intelligence, mutate the accepted quote or create product facts. It only detects the governed product family, selects confirmed fields, orders sections, applies product-specific labels and records missing recommended data.

## Canonical chain

```text
ACCEPTED_QUOTE_AND_CALCULATION_REVIEW_SNAPSHOT
→ FORGE_QUOTE_PRINTABLE_READ_MODEL
→ FORGE_QUOTE_PRINTABLE_PRODUCT_PROFILE
→ FORGE_QUOTE_PRINTABLE_DOCUMENT_HTML
→ FORGE_QUOTE_PRINTABLE_PDF
```

## Runtime

`advisor-os/quotes/printable/quote-printable-product-profile.js`

## Supported profiles

### ORVI

- conditions of the plan;
- life protection and coverages;
- premiums and contributions;
- recovery and projected income;
- source and exchange-rate evidence.

UDI-only fields are suppressed unless confirmed and relevant.

### Imagina Ser

- protection;
- contributions and AVE;
- recovery and retirement values;
- scenario, rate and source evidence.

### Vida Mujer

- specialized protection wording;
- confirmed women-specific coverages only;
- premium and available value sections;
- no invented specialized benefit.

### SeguBeca

- educational goal;
- delivery age;
- contractor protection;
- premiums and contributions;
- educational delivery;
- UDI value and source date.

The contractor-protection source includes the productive runtime path:

`acceptedQuote.nativeResult.recommendedCoverages`

### Gastos Médicos Mayores

- medical plan configuration;
- hospital level and network;
- territory and room type;
- insured members;
- deductible;
- coinsurance and cap;
- medical coverage and benefits;
- premium and source evidence.

Savings, contributions, recovery and retirement projections are suppressed completely.

## Generic fallback

Unknown families retain the generic QPD-01 composition and receive an explicit warning. No family is guessed from missing evidence.

## Authority

```text
QUOTE_TRUTH_OWNER=ACCEPTED_QUOTE_SOURCE
CALCULATION_TRUTH_OWNER=EXISTING_QUOTE_CALCULATION
PRODUCT_TRUTH_OWNER=PRODUCT_INTELLIGENCE
PRODUCT_PROFILE_OWNER=ADVISOR_OS_QUOTE_PRINTABLE_PRODUCT_PROFILE
FINAL_AUTHORITY=HUMAN
```

## Safety

```text
NEW_CALCULATION_ALLOWED=false
PRODUCT_MUTATION_ALLOWED=false
QUOTE_MUTATION_ALLOWED=false
FACT_INVENTION_ALLOWED=false
MISSING_VALUE_AS_ZERO_ALLOWED=false
AUTOMATIC_SEND_ALLOWED=false
PERSISTENCE_WRITTEN=false
HUMAN_REVIEW_REQUIRED=true
```

## Revision gate

The Accepted Quote Review Snapshot must reproduce the exact QPD-01 source revision hash. A profile cannot be composed from a snapshot belonging to another quote revision.

## Acceptance

```text
QPD01_CONTRACT=PASS_12_OF_12
QPD02_CONTRACT=PASS_12_OF_12
QPD03_CONTRACT=PASS_14_OF_14
QPD04_CONTRACT=PASS_15_OF_15
NODE_SYNTAX=PASS
DIFF_INTEGRITY=PASS
GITHUB_ACTIONS_RUN=30594868099
WORKFLOW_CONCLUSION=SUCCESS
```

## Next

`QPD05_PERSISTENCE_VERSIONING_AND_REOPEN`
