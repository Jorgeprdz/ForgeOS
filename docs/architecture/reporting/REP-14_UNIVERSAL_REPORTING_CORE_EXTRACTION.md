# REP-14 — Universal Reporting Core Extraction

Status: IN PROGRESS
Date: 2026-07-31
Branch: `integration/reporting-source-truth-reconciliation`

```text
SCOPE=DOMAIN_NEUTRAL_REPORTING_CORE
PROVIDERS=NOT_INCLUDED
UI=NOT_INCLUDED
EXPORTS=NOT_INCLUDED
AI=NOT_INCLUDED
```

## Extraction boundary

The reporting core is being extracted from the parked source branch into the current production-based integration branch. Only universal contracts and runtimes are authorized.

## Authorized files

- reporting kernel contract
- reporting calendar policy
- report definition
- report comparison definition
- report provider port
- universal reporting kernel
- universal period resolver
- universal report aggregation runtime
- report comparison engine

## Required closure gates

```text
EXACT_SOURCE_EXTRACTION=PASS_REQUIRED
IMPORT_GRAPH=PASS_REQUIRED
ISOLATED_TESTS=PASS_REQUIRED
NO_PROVIDER_REGISTRATION=PASS_REQUIRED
NO_UI_COUPLING=PASS_REQUIRED
NO_EXPORT_COUPLING=PASS_REQUIRED
NO_AI_COUPLING=PASS_REQUIRED
```
