# Forge Shared Authority and Identity Convergence 003

Status: IMPLEMENTED_FOR_ACCEPTANCE

## Purpose

This phase closes the Pipeline → CommercialPerson → Cartera continuity boundary without introducing a second person model, identity store, Timeline or matching engine.

The productive rule is:

```text
Pipeline Prospect
  -> may remain UNRESOLVED
  -> may be presented as a candidate
  -> requires explicit advisor confirmation
  -> existing CARTERA_010B_IDENTITY_RESOLUTION command boundary
  -> canonical CommercialPerson
  -> governed Policy/Cartera attachment
```

## Authority map

| Concern | Authority | Phase 003 role |
|---|---|---|
| Prospect | existing Pipeline authority / CRS-03 | preserved |
| CommercialPerson | `CARTERA_010B_COMMERCIAL_PERSON` | preserved |
| Identity decision | `CARTERA_010B_IDENTITY_RESOLUTION` | reused |
| Source identity link | existing `commercial_source_identity_links` | reused |
| Identity audit | existing append-only `identity_resolution_decisions` | reused |
| Relationship | existing CRS relationship authority | preserved |
| Timeline | CRS-08 unified person Timeline projection | preserved |
| Policy attachment | existing Cartera 020C durable boundary | reused |
| UI | Forge Aura Light 2026 | minimal source wiring only |

## Before

Two implementation layers coexisted:

```text
cartera-module-v4.js
  -> source import of adapter v8

Aura index import map
  -> module-v4 public specifier mapped to module-v5
  -> module-v5 adapter-v9 specifier mapped to adapter-v10
```

The browser could therefore reach the newer convergence chain only through import-map indirection, while the semantic module source itself still named an older adapter. This was an avoidable source/runtime divergence.

## After

`cartera-module-v4.js` now directly imports `cartera-adapter-pages-v10.js` at the Phase 003 cache boundary.

No behavior or authority was reimplemented. The existing Aura import-map compatibility bridge remains available for older entrypoints, but the semantic source no longer declares v8 as its identity-capable adapter.

## Candidate resolution contract

Adapter v10 composes:

- current Cartera directory;
- owner-visible Pipeline `prospects`;
- active `commercial_source_identity_links` for `PROSPECT`;
- confirmed `commercial_people`.

An unresolved Pipeline Prospect is projected read-only as:

```text
source=PIPELINE_PROSPECT
reference=pipeline-prospect:<uuid>
secondary=Pipeline · requiere vinculación explícita
```

A Prospect already linked to a canonical person is projected through the canonical `person_reference` and is not duplicated.

This projection is not identity truth. It is a candidate read model.

## Human-decision boundary

When the advisor selects a `pipeline-prospect:<uuid>` candidate and submits the existing human review, adapter v10:

1. verifies the Prospect remains readable under the authenticated session;
2. checks whether an active canonical link already exists;
3. reuses that canonical person if already linked;
4. otherwise creates an explicit `CARTERA-010B.1` identity-resolution command;
5. obtains the actor through `client.auth.getUser()`;
6. invokes only `forge_cartera010b_confirm_identity_resolution`;
7. accepts only governed `CONFIRMED` / `ALREADY_LINKED` outcomes;
8. passes the returned canonical person reference into the existing Cartera confirmation flow.

No name, phone, email, fuzzy, AI or score-based automatic merge is introduced.

## Prospect lifecycle

```text
Pipeline Prospect
UNRESOLVED
   |
   | remains valid and visible as Pipeline context
   v
Advisor selects candidate in Cartera review
   |
   v
Human identity decision
   |
   +--> existing canonical CommercialPerson -> LINK_CONFIRMED
   |
   +--> governed canonical creation -> CREATE_CONFIRMED
```

The Prospect record is not silently replaced or rewritten by this phase.

## CommercialPerson lifecycle

CommercialPerson remains owned by Cartera 010B. Phase 003 creates no person table, no person ledger and no alternate canonical identifier.

All canonical creation/linking is performed by the existing identity-resolution RPC and its existing append-only decision/link authorities.

## Relationship continuity

Identity equality and advisor relationship are not collapsed into one record. Existing AdvisorCommercialRelationship / CRS composition remains independent. Phase 003 writes no parallel relationship state.

## Timeline continuity

CRS-08 remains the unified Timeline projection authority. Pipeline history can continue to be projected from the Prospect/source context after identity convergence. Phase 003 creates no Timeline writer and does not rewrite historical evidence.

## Policy linkage

After identity resolution returns a canonical person reference, the existing Cartera PDF/manual confirmation flow continues through the governed 020C prepare/attach boundary. Adapter v10 preserves the durable 020C wrapper already present in the repository.

## RLS and tenant isolation

Phase 003 adds no bypass.

The existing 010B foundation enables RLS on canonical identity tables and owner-scoped policies. Candidate reads use the authenticated Supabase client. The identity RPC validates `auth.uid()` and source/advisor ownership. A candidate not visible under the session cannot be confirmed by the browser path.

No `service_role` credential exists in the adapter and no direct frontend `insert/update/delete` to canonical person tables is introduced.

## Idempotency and concurrency

The existing identity RPC remains the concurrency/idempotency authority. Adapter v10 also checks active Prospect→person linkage before requesting a new decision and accepts governed `ALREADY_LINKED` as a successful durable state.

This phase does not create a second lock, receipt system or browser-side idempotency truth.

## Conflict / state handling

| State | Behavior |
|---|---|
| NO_MATCH | no automatic merge; existing create-new/human path remains |
| SINGLE_CANDIDATE | candidate is displayed; advisor still confirms |
| MULTIPLE_CANDIDATES | UI selection is human; no score-based winner |
| CONFLICTING_EVIDENCE | existing governed boundary must reject/return error; browser does not resolve conflict |
| ALREADY_RESOLVED / ALREADY_LINKED | canonical person is reused |
| STALE_CANDIDATE | current server/read authority wins; confirmation fails safely if no longer available |
| UNAUTHORIZED | RLS / RPC ownership boundary rejects or hides the record |

## Read/write ownership

```text
READ
Cartera directory + Pipeline Prospect candidates
-> read-model composition only

WRITE
explicit advisor confirmation
-> forge_cartera010b_confirm_identity_resolution
-> existing 010B append-only identity decision/link authority
-> existing 020C policy attachment
```

## Product/UI scope

No visual redesign was performed.

The existing semantic review already distinguishes candidate provenance using the option label/secondary text and requires `Confirmar e incorporar` before any identity command. Phase 003 changes only the productive adapter source binding plus tests/CI/evidence.

## No-new-authority declaration

```text
NEW_PERSON_AUTHORITY=0
NEW_PROSPECT_AUTHORITY=0
NEW_TIMELINE=0
NEW_IDENTITY_LEDGER=0
NEW_RELATIONSHIP_MODEL=0
NEW_DATABASE_TABLE=0
NEW_RPC=0
NEW_EDGE_FUNCTION=0
NEW_SCORING_MODEL=0
AUTO_IDENTITY_MERGE=0
```
