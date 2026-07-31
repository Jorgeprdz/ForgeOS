# FORGE CARTERA 010C — Policy Timeline, Person and Account Projection Scope 001

Forge OS
Architecture Source Truth
Cartera / Productive Canonical Read Models

## Status

```text
PHASE=CARTERA_010C_POLICY_TIMELINE_PERSON_ACCOUNT_PROJECTION
STATUS=STARTED_SCOPE_AND_EVENT_CONTRACT_LOCKED
SOURCE_BRANCH=feature/cartera-010b-commercial-person-policy-role-foundation
SOURCE_COMMIT=73e1726f6f0ebf5f025e0dc197275503984a2705
IMPLEMENTATION_BRANCH=feature/cartera-010c-policy-timeline-person-account-projection
RUNTIME_MUTATION=YES_BOUNDED_PURE_CONTRACT
SCHEMA_MUTATION=NO
SUPABASE_REMOTE_MUTATION=NO
PRODUCT_UI_MUTATION=NO
CARTERA_010C_COMPLETE=NO
NEXT=CARTERA_010C_CANONICAL_READ_MODEL_AND_ROUTE_ADAPTER
```

## Purpose

CARTERA 010B established and remotely accepted canonical CommercialPerson,
CommercialAccount, Policy v2, PolicyRole, evidence, conflict and governed command
authorities. CARTERA 010C makes those authorities productively visible without
reintroducing the legacy Cartera database or turning a timeline into Policy
Truth.

010C owns four bounded outcomes:

1. FES-compatible Policy domain event contracts and append-only timeline
   projection;
2. owner-scoped Person and Account participation summaries;
3. a canonical Policy portfolio/detail read model;
4. adaptation of the existing `cartera` route away from direct legacy truth
   reads and writes.

This phase is an integration and projection phase. It is not OCR, bulk import,
renewal automation, task generation, payment operations or a visual redesign.

---

# 1. Proven legacy route liability

The existing root `cartera.js` is not canonical authority and may remain only as
a temporary route shell/adapter.

Its current behavior includes:

```text
LEGACY_STORAGE=legacy/quarantine/crmaddlife-indexeddb/db.js
LEGACY_STORE=cartera
LEGACY_STATE=CarteraState.data
LEGACY_IDENTITY_FIELD=cliente
LEGACY_POLICY_FIELD=poliza
LEGACY_DIRECT_CREATE=VISIBLE
LEGACY_DIRECT_EDIT=VISIBLE
LEGACY_DIRECT_DELETE=VISIBLE
LEGACY_EXCEL_IMPORT=VISIBLE
UNKNOWN_PREMIUM_DEFAULT=0
CURRENCY_DEFAULT=MXN
```

These behaviors conflict with the accepted 010B authority:

- IndexedDB is not canonical Person or Policy persistence;
- `cliente` is not CommercialPerson or PolicyRole authority;
- `poliza` free text is not canonical Policy identity;
- direct create/edit/delete bypass governed commands;
- unknown premium must not become zero;
- unknown currency must not become MXN;
- Excel import must not write canonical Policy Truth without evidence and human
  confirmation.

010C must not grant the legacy module new canonical write authority.

---

# 2. Canonical productive read model

The productive Cartera portfolio projection must compose only owner-scoped,
confirmed canonical authorities.

## 2.1 Policy portfolio item

Minimum projection fields:

```text
policyReference
productReference
carrierReference
statusValue
statusAsOf
completenessState
freshnessState
conflictState
currentVersion
issueDate
policyEffectiveFrom
policyEffectiveTo
currencyOrUnknown
premiumAmountOrUnknown
sumInsuredOrUnknown
generalParticipantSummary
personReferences
accountReferences
latestPolicyActivity
```

The projection may display Policy facts already confirmed by Policy
Intelligence. It must preserve `null`, `UNKNOWN`, hidden-by-scope and conflict as
different states.

The projection must never infer:

```text
UNKNOWN_TO_ZERO
UNKNOWN_TO_MXN
UNKNOWN_TO_ACTIVE
HIDDEN_TO_EMPTY
CONFLICT_TO_CLEAR
PROSPECT_TO_CLIENT
```

## 2.2 General participant summary

General route reads must use governed authority and must not query
`policy_roles` directly.

```text
GENERAL_ROLE_READ_AUTHORITY=forge_cartera010b_list_general_policy_roles(text)
DIRECT_POLICY_ROLE_READ=FORBIDDEN
BENEFICIARY_GENERAL_PROJECTION=FORBIDDEN
```

Allowed general summaries may include confirmed owner, insured, additional
insured, payor and advisor role references when visible to the owning advisor.
Beneficiary identity, evidence and health-related details remain outside the
general portfolio read model.

## 2.3 Person and Account projection

A CommercialPerson projection may aggregate policies through confirmed
PolicyRole links but must not mutate Person identity or collapse multiple roles.

A CommercialAccount projection may aggregate confirmed members and policies but
must not imply consent, merge members or replace CommercialPerson identity.

Both projections must preserve:

- canonical opaque references;
- owner scope;
- confirmation state;
- effective periods;
- privacy/visibility classification;
- conflict and freshness state;
- explicit hidden/unknown states.

---

# 3. Policy domain Timeline boundary

010C introduces the strict repository contract:

```text
platform/event-evidence/policy-domain-event-contract.js
CONTRACT_TYPE=FORGE_POLICY_DOMAIN_EVENT
CONTRACT_VERSION=CARTERA-010C.1
```

Reserved subjects:

```text
POLICY
POLICY_ROLE
POLICY_EVIDENCE_VERSION
POLICY_IDENTITY_DECISION
```

Initial event taxonomy:

```text
POLICY_CONFIRMED
POLICY_VERSION_CONFIRMED
POLICY_CONFLICT_RECORDED
POLICY_ROLE_CONFIRMED
POLICY_ROLE_SUPERSEDED
POLICY_EVIDENCE_CONFIRMED
POLICY_IDENTITY_LINK_CONFIRMED
POLICY_IDENTITY_LINK_CORRECTED
POLICY_IDENTITY_UNRESOLVED
```

Timeline events carry commercial meaning and canonical references. They do not
copy Policy Truth.

Explicitly forbidden inside timeline payloads:

```text
premiumAmount
sumInsured
currency
paymentFrequency
policyNumber
beneficiary_or_beneficiaries
evidenceReferences
fieldClaims
provenance
documentHash
rawPayload
rawDocument
clientId
```

The Policy detail read model may separately join authorized current Policy facts.
The event ledger itself must remain minimized, append-only, evidence-bearing and
correction-aware.

---

# 4. Route integration boundary

010C may adapt the existing `cartera` route and shell. It must not perform a new
visual redesign.

The route must progress through this bounded replacement:

```text
legacy IndexedDB cartera read
→ canonical authenticated portfolio service
→ strict portfolio projection validator
→ existing route shell adapter
→ canonical Policy detail and minimized Timeline
```

The following visible actions must be removed or fail closed until separately
governed workflows exist:

```text
NEW_POLICY_DIRECT_WRITE=FORBIDDEN
EDIT_POLICY_DIRECT_WRITE=FORBIDDEN
DELETE_POLICY=FORBIDDEN
EXCEL_TO_CANONICAL_POLICY_DIRECT_IMPORT=FORBIDDEN
```

A future explicit review workflow may invoke the accepted 010B commands. 010C
must not simulate that workflow through legacy form saves.

---

# 5. Required reuse

Reuse canonically:

- accepted CARTERA 010B tables, RPCs, RLS and evidence closure;
- `forge_cartera010b_list_general_policy_roles(text)`;
- Event & Evidence append-only, idempotency, correction and conflict patterns;
- existing authenticated Supabase client/gateway patterns;
- existing route registry and Product UI shell;
- Policy Read Model freshness and safety semantics.

Reuse only through adapter/quarantine:

- root `cartera.js` route shell;
- legacy `cartera` IndexedDB rows as non-canonical compatibility input;
- existing policy timeline engines with no proven consumers;
- old client/policy utilities.

Do not promote:

- legacy IndexedDB as source of truth;
- `cliente`, `clientId` or free-text `poliza` as canonical identity;
- legacy edit/delete/import handlers;
- disconnected root policy engines as automatic authority;
- Prospect Timeline as Policy Truth storage;
- broad beneficiary reads.

---

# 6. Allowed construction surface

Initial 010C implementation is bounded to:

```text
platform/event-evidence/policy-domain-event-contract.js
platform/event-evidence/cartera-010c-*.js
platform/policy-intelligence/cartera-010c-*.js
advisor-os/cartera/**
cartera.js                                  # adapter/removal of legacy authority only
platform/routing/route-registry.js          # bounded route integration only
app.js                                      # bounded lazy binding only
supabase/migrations/*cartera010c*.sql        # separate remote gate required
schemas/*policy*projection*.schema.json
tests/cartera-010c-*.mjs
.github/workflows/cartera-010c-*.yml
docs/architecture/source-truth/FORGE_CARTERA_010C_*.md
docs/evidence/FORGE_CARTERA_010C_*.md
```

Anything outside this surface requires a scope amendment.

---

# 7. Explicitly outside 010C

- OCR worker or parser implementation;
- Excel/bulk canonical import;
- renewal calculations or renewal calendar;
- payment obligations;
- task, Calendar, WhatsApp or email effects;
- compensation or production credit;
- Relationship Memory intelligence;
- Future Radar, NBA, NASH or Candy Crush integration;
- automatic Policy creation;
- automatic identity merge;
- Material 3 redesign of Cartera;
- merge to production/main;
- automatic Supabase deployment.

---

# 8. Required acceptance matrix

010C cannot close without proving at least:

1. the portfolio reads canonical Policy rows, not legacy IndexedDB;
2. cross-advisor policies are invisible;
3. unknown premium/currency/status remain unknown;
4. general roles use governed read authority;
5. beneficiary data is absent from general portfolio projections;
6. person and account references remain distinct;
7. one Policy may project multiple insureds and a separate payor;
8. Policy Timeline events validate subject/event compatibility;
9. timeline payloads contain no Policy Truth or beneficiary leakage;
10. event correction preserves prior event lineage;
11. direct Policy create/edit/delete remains unavailable;
12. legacy Excel import cannot write canonical Policy Truth;
13. route empty/error/loading/conflict states are explicit;
14. existing Cartera route remains navigable;
15. mobile content reserves safe scroll space above the floating nav pill;
16. Product UI redesign is absent;
17. remote schema mutation uses a separate authorized gate;
18. all remote fixtures roll back with zero residue.

---

# 9. First-cut exit

```text
CARTERA_010C_SOURCE_PINNED=YES
LEGACY_ROUTE_AUTHORITY_CLASSIFIED=YES
CANONICAL_READ_MODEL_BOUNDARY=LOCKED
PERSON_ACCOUNT_PROJECTION_BOUNDARY=LOCKED
POLICY_TIMELINE_BOUNDARY=LOCKED
BENEFICIARY_PRIVACY_BOUNDARY=LOCKED
DIRECT_LEGACY_WRITES=FORBIDDEN
POLICY_DOMAIN_EVENT_CONTRACT=IMPLEMENTED_REPOSITORY_ONLY
CARTERA_010C_IMPLEMENTATION_STARTED=YES
CARTERA_010C_COMPLETE=NO
NEXT=CARTERA_010C_CANONICAL_READ_MODEL_AND_ROUTE_ADAPTER
```
