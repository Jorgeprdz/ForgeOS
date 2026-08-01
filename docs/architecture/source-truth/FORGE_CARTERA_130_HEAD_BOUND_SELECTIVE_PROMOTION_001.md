# FORGE CARTERA 130 — HEAD-BOUND SELECTIVE PROMOTION 001

## Authorization

```text
EXACT_AUTHORIZATION_PHRASE=AUTHORIZE_CARTERA_120_SELECTIVE_PROMOTION
BOARD_APPROVAL=GRANTED
MERGE_AUTHORIZATION=GRANTED
CURRENT_MAIN_HEAD=9d014116f6b3f0a626d8848d680a5c607f924d99
ACCEPTED_PROGRAM_HEAD=b83a37abe3eb8b3a48c2fe89940b562e1367bfcc
```

## Execution model

130 starts from the exact current productive `main`, not from the divergent Cartera history. It copies accepted Cartera runtime families from the locked accepted program head, reconciles `app.js` against current main, promotes the accepted canonical `cartera.js`, and preserves the pre-promotion Cartera implementation under quarantine.

The selective manifest records target path, operation, source head, source blob and resulting target blob. `app.js` is explicitly marked `RECONCILE_CURRENT_MAIN`; it is never replaced with the historical program copy.

## Preserved productive capabilities

The promotion cannot modify the existing Material 3 Pages application, Activity, Dashboard, Forecast, Pipeline, Cotizaciones or unrelated workflows. The only cross-module runtime reconciliation is:

- the Cartera product binding in current `app.js`;
- the accepted quote-detail projection hook in Productive Pipeline bootstrap.

## Database posture

Accepted Cartera migrations are promoted into repository history so source and deployed database authority are reconcilable. This pass does not replay migrations or mutate Supabase remotely. Earlier transactional acceptance remains the evidence for already-applied migrations.

## Merge posture

After two successful native acceptance runs on the materialized head, zero unresolved threads, zero pending reviews and an unchanged locked `main`, the PR may be squash-merged using the explicit authorization receipt. Pages and canonical runtime acceptance must then be observed from the resulting merge head.
