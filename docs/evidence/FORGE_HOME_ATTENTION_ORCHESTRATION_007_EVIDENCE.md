# FORGE HOME ATTENTION ORCHESTRATION 007 — EVIDENCE

## Execution identity

```text
PHASE=FORGE_HOME_ATTENTION_ORCHESTRATION
PHASE_NUMBER=007
BRANCH=feature/forge-home-attention-orchestration-007
BASE_BRANCH=main
PHASE_007_BASE_MAIN_SHA=ed495b311f551c908d8aa9fd0d906ff7a853159a
PHASE_007_FINAL_HEAD=PR_HEAD_AT_GOVERNING_EXACT_HEAD_CI
AUTO_MERGE_PHASE_007=NO
AUTO_DEPLOY=NO
DEPLOY_PERFORMED=NO
PHASE_008_STARTED=NO
```

`PHASE_007_FINAL_HEAD` is resolved by the PR exact-head check and recorded in the PR/checkpoint because a Git commit cannot contain its own SHA without changing that SHA.

## Repaired lineage entering Phase007

```text
PHASE_004=MERGED
PHASE_004_PR=327
PHASE_004_HEAD=abc0cc1e57b13fb9fe318bf18169132db958b894
PHASE_004_MERGE_COMMIT=dd990fba5762ee84f35103d04871d474e2b2b8df

PHASE_005_SEPARATE_MERGE_REQUIRED=NO
PHASE_005_AUTHORITY_ACTIVATION=SATISFIED_THROUGH_005A

PHASE_005A=MERGED
PHASE_005A_PR=332
PHASE_005A_HEAD=aecfb3c65c7e1ce3f18bb7610c971d3eeaf593cb
PHASE_005A_MERGE_COMMIT=c74b49de6beb8a2895aebe135d29c8c10c5956bd

PHASE_006=MERGED
PHASE_006_PR=331
PHASE_006_HEAD=f49ba0ee0455148cde54f1b54d95744a3f7fab5e
PHASE_006_MERGE_COMMIT=ed495b311f551c908d8aa9fd0d906ff7a853159a
```

Phase007 was branched only after `main` contained the 004 Decision Projection authority, the 005/005A productive Pipeline intelligence consumer reconciliation, and Phase006 product/economic decision completion.

## Reuse-before-create result

Existing productive Home (`Inicio / Mi Día`) was preserved. Phase007 does not replace Agenda, Productive Smart Widget Orchestrator, Cartera Future Radar, Alfred, Activity/Productivity, Pipeline, Income, Forecast, Mick or Nash.

New code is limited to:

```text
ADAPTER
COMPOSITION
PRESENTATION_INTEGRATION
PAGES_AUTHORITY_ROUTING
TEST
EVIDENCE
WORKFLOW
```

No new domain engine, score, priority formula, product engine, forecast engine, compensation engine or identity engine is introduced.

## Phase007 architecture

```text
DOMAIN AUTHORITIES
        ↓
PRODUCTIVE SMART WIDGET ORCHESTRATOR
(source-owned visibility/order)
        ↓
FORGE_CROSS_DOMAIN_DECISION_PROJECTION
FCDP-004-001
        ↓
FORGE_HOME_ATTENTION_ORCHESTRATION
FHAO-007-001
        ↓
AURA HOME PRESENTATION
        ↓
HUMAN REVIEW / ACTION
```

The existing Productive Smart Widget Orchestrator remains the owner of its selection/order. Phase007 explicitly does not read `rankScore` to reorder, does not calculate a new score, does not choose a winner, and does not merge business meaning.

## Attention contract

Each transported attention item preserves, when supported by the upstream projection:

```text
SUBJECT
STATE
WHY_NOW
IMPACT
TRUTH_STATE
EVIDENCE
CONFIDENCE
LIMITATIONS
RECOMMENDED_HUMAN_ACTION
ACTION_OWNER
ACTION_TARGET
AS_OF
VALID_UNTIL
SOURCE_DOMAIN
SOURCE_AUTHORITY
PROVENANCE
```

Source-owned `reviewAction.type`, `reviewAction.label` and deep link are transported only as a human-reviewed action. The Productive Smart Widget contract already declares final authority as human; the FCDP action owner is therefore `ADVISOR`, automatic execution remains forbidden, and no domain write occurs.

## Truth and identity boundaries

```text
UNKNOWN != ZERO
SCENARIO != EXPECTED
EXPECTED != GENERATED
GENERATED != EARNED
EARNED != PAID
INFERENCE != CONFIRMED
PROSPECT != COMMERCIAL_PERSON
RECOMMENDATION != HUMAN_DECISION

HOME_IDENTITY_CONVERGENCE=NO
HOME_OPPORTUNITY_CREATION=NO
HOME_PIPELINE_ADVANCE=NO
HOME_PAYMENT_CONFIRMATION=NO
HOME_PAYOUT_INFERENCE=NO
```

Phase007 projects Home attention around the authenticated advisor and never converts a Pipeline Prospect into a CommercialPerson. The productive 005A Pipeline consumer and CRS-03 remain the identity boundary.

## Human action boundary

```text
CALL_AUTOMATION=NO
MESSAGE_AUTOMATION=NO
EMAIL_AUTOMATION=NO
TASK_CREATION=NO
CALENDAR_CREATION=NO
POLICY_ACCEPTANCE=NO
QUOTE_ACCEPTANCE=NO
IDENTITY_CONVERGENCE=NO
PIPELINE_ADVANCE=NO
```

All recommended actions remain `humanApprovalRequired=true` and `automaticExecutionAllowed=false`.

## Home states

The orchestration contract supports:

```text
LOADING
READY
EMPTY
UNKNOWN
PARTIAL
STALE
ERROR
```

A source-unavailable result with no projected attention items is `UNKNOWN`, never a false `EMPTY` or zero.

## Home writes

```text
HOME_DOMAIN_WRITES=0
PRODUCT_WRITES=0
NEW_PERSISTENCE=NO
NEW_SCHEMA=NO
NEW_RLS=NO
RLS_BYPASS=NO
SERVICE_ROLE_DOMAIN_WRITE=NO
```

Existing authenticated-session before/after read checks, generation/revision rejection, abort handling and scrub boundaries remain in the Home adapter/module.

## Existing Home preserved

The existing Home continues to present:

1. authenticated greeting / Mi Día;
2. Alfred primary briefing;
3. Agenda `Ahora / Hoy`;
4. Cartera attention detail;
5. Activity-owned `Tu ritmo`;
6. Mick evidence-bound observation state.

The change in Phase007 is that the primary attention briefing and attention count now consume `FHAO-007-001`, which itself consumes `FCDP-004-001`. Agenda/Cartera/Rhythm/Mick remain supporting authority surfaces and are not converted into a new global score.

## Pages import graph

`scripts/prepare-aura-home-pages-authorities.mjs` adds canonical Phase007 attention entrypoints and recursively copies their local dependency closure, including the canonical Phase004 Decision Projection module, into the Pages-local Home authority roots without source rewrite.

```text
CANONICAL_REPOSITORY_MODULES_COPIED_WITHOUT_REWRITE=YES
DUPLICATE_DECISION_PROJECTION_ENGINE=NO
DUPLICATE_ATTENTION_ENGINE=NO
VISUAL_ASSETS_ADDED_BY_AUTHORITY_CLOSURE=0
```

## Constitutional / ADR authorities actually found and preserved

- Forge Constitution / Article 0 boundaries already consumed by the Productive Smart Widget contract.
- ADR-023 Advisor OS Productive Home and Core Modules Recovery Execution Authority.
- ADR-024 Forge Aura Light 2026 Canonical Redesign Design Authority.
- Existing Evidence Ownership / One Metric One Owner / Recommendation-vs-Decision / No Invented Recommendations boundaries referenced by the already-governed Phase004 and Home acceptance.
- Existing Relationship, Nash, Mick, Productivity, Manager Intelligence, Compensation, Economic Motivation, Forecast, Client First, Source Truth, Identity, Auth/RLS and REP-17 boundaries exercised by the lineage/regression gates.
- FCDP-004-001 as the single cross-domain Decision Projection authority.
- CRS-03 / 005A as the productive Prospect↔CommercialPerson identity consumer boundary.

No new ADR is invented by Phase007.

## Test matrix

The governing workflow executes:

```text
HOME01=attention comes from Decision Projection
HOME02=no local business recalculation
HOME03=authority preserved
HOME04=provenance preserved
HOME05=unknown preserved
HOME06=stale visible
HOME07=partial visible
HOME08=no automatic commercial action
HOME09=no domain writes
HOME10=Prospect identity not inferred
HOME11=economic truth semantics preserved
HOME12=client-first preserved
HOME13=authenticated session preserved
HOME14=REP-17 preserved
HOME15=responsive behavior preserved
```

It additionally reruns:

- Phase004 Decision Projection regression;
- Phase005A authority reconciliation regression;
- Phase006 product/economic decision completion regression;
- existing Aura Home contract acceptance;
- Authenticated Session Controls;
- REP-17;
- productive Pages runtime generation;
- Pages import graph regression;
- existing Aura Home Playwright responsive/accessibility acceptance;
- bounded diff / whitespace.

## Final Assembly Lineage Robocop contract

The workflow must establish:

```text
PHASE004_PRESENT_IN_MAIN=PASS
PHASE005_AUTHORITIES_PRESENT_IN_MAIN=PASS
PHASE005A_DISPOSITION_RESOLVED=PASS
PHASE006_PRESENT_IN_MAIN=PASS

DECISION_PROJECTION_SINGLE_AUTHORITY=PASS
DOMAIN_AUTHORITY_PRESERVATION=PASS
PRODUCT_DECISION_BOUNDARY=PASS
ECONOMIC_TRUTH_BOUNDARY=PASS
CLIENT_FIRST=PASS

HOME_ATTENTION_ORCHESTRATION=PASS

NEW_DUPLICATE_ENGINE=NO
NEW_DUPLICATE_TRUTH_OWNER=NO
NEW_GLOBAL_SCORE=NO
NEW_GLOBAL_PRIORITY_FORMULA=NO

AUTH_SESSION=PASS
RLS_BOUNDARY=PASS
REP_17=PASS
MAIN_LINEAGE_COHERENT=PASS
```

## Merge / deploy checkpoint

Phase007 is intentionally not authorized for automatic merge.

```text
PHASE_STATUS=PENDING_EXACT_HEAD_CI
MERGE_READY=PENDING_EXACT_HEAD_CI
HUMAN_CHECKPOINT=PENDING_EXACT_HEAD_CI

AUTO_MERGE_PHASE_007=NO
AUTO_DEPLOY=NO
DEPLOY_PERFORMED=NO
PHASE_008_STARTED=NO
```

The final PR body/checkpoint records the exact governing `PHASE_007_FINAL_HEAD`, workflow run and final PASS after CI completes.
