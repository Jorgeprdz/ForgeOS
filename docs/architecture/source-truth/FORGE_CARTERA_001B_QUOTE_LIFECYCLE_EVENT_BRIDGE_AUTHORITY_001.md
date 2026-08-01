# FORGE CARTERA — 001B Quote Lifecycle Event Bridge Authority 001

## Status

`EXECUTION_AUTHORIZED / REPOSITORY_RUNTIME_AND_SCHEMA_IMPLEMENTATION / SUPABASE_REMOTE_MUTATION_FORBIDDEN`

## Source gate

```text
PROGRAM=FORGE_CARTERA_RELATIONSHIP_INTELLIGENCE
PHASE=CARTERA_001B_QUOTE_LIFECYCLE_EVENT_BRIDGE
SOURCE_COMMIT=62634cc1d49a876b9e4767095c43b122393b3142
SOURCE_BRANCH=docs/cartera-relationship-intelligence-roadmap
IMPLEMENTATION_BRANCH=feature/cartera-001b-quote-lifecycle-event-bridge
RUNTIME_MUTATION=YES_BOUNDED
SCHEMA_MUTATION=YES_REPOSITORY_MIGRATION_ONLY
SUPABASE_REMOTE_MUTATION=NO
PRODUCT_CALCULATION_MUTATION=NO
PRODUCT_INTELLIGENCE_TRUTH_MUTATION=NO
PIPELINE_VISUAL_REDESIGN=NO
PROSPECT_DETAIL_UI_MUTATION=NO
APPLICATION_RUNTIME_MUTATION=NO
MESSAGE_OR_PROVIDER_EFFECTS=NO
```

## Owner authorization

The owner explicitly authorized execution on 2026-07-30 after `CARTERA_001A` closed discovery and identified the exact continuity break.

## Required reuse

1. Existing product-specific PDF parsing and Quote calculation.
2. Accepted Quote immutable review snapshot.
3. Quote Read Model evidence/freshness/safety envelope.
4. Quote Action Contract hashing, idempotency and approval rules.
5. Quote Approval Gate human-review boundary.
6. FES append-only, conflict, correction, local-first and RLS patterns.
7. NFAST-08 Prospect commercial Timeline RPC and minimized payload contract.
8. Existing Material 3 Quotes route.

## Authorized build

- domain-specific durable Quote identity and version storage;
- reviewed snapshot persistence with forbidden binary/raw-document key rejection;
- Quote lifecycle event contract;
- append-only Quote lifecycle events;
- authenticated RPC-only commands;
- Prospect ownership enforcement;
- idempotent replay and conflict rejection;
- correction lineage;
- browser bridge from the existing accepted Quote confirmation event;
- minimized projection of `QUOTE_PRESENTED` and explicit Prospect decisions into NFAST-08;
- safe blocked states for missing Prospect identity and missing Application authority;
- tests and closure evidence.

## Semantic lock

```text
QUOTE_REVIEW_CONFIRMED != QUOTE_PROSPECT_ACCEPTED
```

The existing “Confirmar cotización” interaction means the advisor reviewed the extracted/calculated Quote. It must never be promoted into a Prospect decision.

## Blocked

- orphan Quote persistence;
- automatic identity merge;
- automatic Prospect acceptance or rejection;
- copying premium, coverage, sum assured, deductible, coinsurance or calculation truth into Prospect Timeline;
- conversion to Application without a proved Application authority;
- a second generic event ledger;
- automatic task, calendar, message, provider, Policy or Compensation effects;
- remote migration deployment during this task.
