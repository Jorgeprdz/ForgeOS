# FORGE CRS 09 — Productive Person Workspace

**Document ID:** `FORGE_CRS_09_PRODUCTIVE_PERSON_WORKSPACE_001`
**Stage:** `CRS_09ABCD_PRODUCTIVE_PERSON_WORKSPACE`
**Status:** `IMPLEMENTED_PENDING_ACCEPTANCE`
**Canonical UI route:** `?nav=persona`
**Route class:** contextual, authenticated, not a primary navigation destination

## 1. Purpose

CRS 09 turns the accepted Commercial Relationship Spine into one productive workspace centered on a confirmed `CommercialPerson` and its `AdvisorCommercialRelationship`.

The workspace is a read-only composition surface. It does not become a CRM truth store, a second Timeline, a policy ledger, an application authority, or a mutation gateway.

## 2. Canonical roots

| Concern | Authority |
|---|---|
| Person identity | `CARTERA_010B_COMMERCIAL_PERSON` |
| Advisor relationship | CRS 01 / CRS 02 relationship derivation |
| Source identity resolution | `commercial_source_identity_links` with one active confirmed link |
| Unified chronology | `CRS_08_UNIFIED_PERSON_TIMELINE_READ_MODEL` |

A workspace may be requested by:

1. canonical `personReference`; or
2. an explicit source identity (`PROSPECT`, `QUOTE`, `APPLICATION`, or `POLICY`) that already has one active authoritative link.

CRS 09 never performs automatic identity matching, linking, merging, or correction.

## 3. Information architecture

The workspace exposes exactly eight sections:

| Section | Owning authority | Workspace behavior |
|---|---|---|
| Identity | CommercialPerson | Canonical identity summary only |
| Opportunities | Pipeline Prospect Authority | Read-only opportunity projection and deep link |
| Commitments | FES Activity Event Ledger | Commitment-shaped Activity facts from CRS 08 |
| Interactions | FES Activity Event Ledger | Non-commitment Activity facts from CRS 08 |
| Quotes | Quote Lifecycle Authority | Read-only quote lifecycle projection and deep link |
| Applications | Application Authority | Read-only application lineage projection |
| Policies | Cartera Policy Authority / CRS 07 | Read-only policy lineage projection and deep link |
| Timeline | CRS 08 | Unified, minimized, privacy-bounded chronology |

Each section reports one honest state:

- `AVAILABLE`
- `EMPTY`
- `DEGRADED`
- `UNAVAILABLE`

A degraded source remains visible. The workspace never silently substitutes local, legacy, cached, or invented records.

## 4. Navigation model

`persona` is a contextual route and is intentionally absent from `FORGE_NAVIGATION_ITEMS`.

Primary entry points are:

- Pipeline: opens from a Productive Prospect using source identity `PROSPECT`.
- Cartera: opens from a canonical `COMMERCIAL_PERSON` directory entry.
- Activity, Quotes, and Cartera contextual headers: reopen the current person when `person` already travels in the URL context.

The route stores `from=<origin>` in the URL so the back action returns to the originating module. Domain actions use internal deep links and remain owned by their module.

## 5. Mutation ownership

CRS 09 contains no local create, update, delete, submit, approve, issue, send, schedule, or persistence controls.

| Domain | Mutation owner |
|---|---|
| Prospect stage and Pipeline state | Pipeline authority |
| Activity and commitments | FES / Activity authority |
| Quote lifecycle | Quote authority |
| Application lifecycle and signature | Application authority |
| Policy facts and roles | Cartera / policy authority |
| Identity resolution and corrections | Existing governed identity authorities |

The workspace emits navigation only. It does not call domain mutation RPCs.

## 6. Privacy and minimization

The contract rejects copied fields and payloads including contact details, addresses, government identifiers, medical data, bank data, signatures, documents, raw provider payloads, messages, notes, credentials, tokens, and policy numbers.

Items contain only bounded labels, summaries, states, references, timestamps, lineage, minimal facts, authority, privacy classification, and internal deep links.

Cross-person composition is forbidden. Every bounded fact that declares a `personReference` must match the workspace root.

## 7. Session and concurrency lifecycle

The Material 3 module requires the productive authenticated bootstrap.

On logout, auth error, or route unmount it:

- increments the generation token;
- removes the active advisor and workspace model;
- clears rendered private content;
- rejects any late asynchronous result from the prior generation.

No private workspace snapshot is persisted to browser storage.

## 8. Responsive acceptance

The surface provides:

- two-column composition on desktop;
- one-column composition on tablet/mobile;
- sticky horizontal section navigation;
- minimum 42–48 px interactive targets;
- focus-visible states;
- mobile safe-area clearance above the intentional floating navigation pill;
- reduced-motion handling.

## 9. Runtime publication

The Pages runtime closure publishes the CRS 02, CRS 07, CRS 08, and CRS 09 browser authorities required by the Material 3 route, plus:

- `person-workspace-module.js`
- `person-workspace-module.css`
- `person-workspace-entry-bridge.js`
- `person-workspace-entry-bridge.css`

A missing authority or static asset must fail the runtime closure instead of producing a false-green Pages artifact.

## 10. Non-goals

CRS 09 does not:

- add a sixth primary navigation item;
- create a new database table or migration;
- persist a workspace snapshot;
- create opportunities automatically;
- resolve identities automatically;
- send messages;
- schedule calendar events;
- mutate applications or policies;
- copy raw domain payloads;
- replace CRS 08 with a second chronology.

## 11. Acceptance evidence

Targeted acceptance is defined by:

- `tests/crs-09-person-workspace-contract-test.mjs`
- `tests/crs-09-person-workspace-service-test.mjs`
- `tests/crs-09-person-workspace-ui-test.mjs`
- `tests/crs-09-person-workspace-entry-bridge-test.mjs`
- `tests/pages-public-demo-runtime-closure-test.mjs`
- `.github/workflows/crs-09-productive-person-workspace.yml`

Final acceptance requires a green pull request workflow and controlled merge authorization from the owner.
