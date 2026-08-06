# FORGE CARTERA — POLICY PERSISTENCE, IDENTITY AND PARTY RECONCILIATION 004

Forge OS  
Architecture Source Truth  
Cartera / Existing Asset Audit / Track A / Pass 4

## Status

`PASS_4_PERSISTENCE_IDENTITY_PARTY_AUDIT_COMPLETE / RUNTIME_MUTATION_NOT_AUTHORIZED`

## Date

2026-07-30

## Purpose

This pass reconciles the existing identity, Policy Truth, Policy Role, persistence, RLS and Event & Evidence assets before Cartera authorizes a productive policy runtime.

It answers:

1. What is the canonical durable identity?
2. What identity runtime already exists?
3. What Policy and Policy Party authority already exists?
4. Which persistence and RLS foundations are reusable?
5. Which schemas, tables, commands, repositories and events still have to be built?

This pass performs repository discovery and architecture classification only. It does not authorize schema, migration, RLS, database, route, UI or production mutation.

---

# 1. Executive decision

The repository contains a strong conceptual foundation and a partially implemented Prospect identity foundation, but it does not yet contain a productive canonical Policy persistence vertical.

The authoritative layers are:

```text
Shared Commercial Model Foundation Lock
→ CommercialPerson
→ CommercialAccount
→ CommercialRole / CommercialRelationship
→ Policy
→ PolicyRole
```

The implemented sales identity foundation is:

```text
advisor-prospect-identity-v1
→ prospect-identity-contract.js
→ prospects table
→ advisor ownership and RLS foundation
→ source lineage and evidence references
```

These layers are related, but they are not interchangeable.

## Locked decision

> CommercialPerson is the durable identity authority. Prospect identity remains a stable sales-domain identity and continuity reference. Cartera must resolve and link the existing prospect to CommercialPerson before creating a new person or persisting Policy parties.

No destructive rename of the existing `prospect_id` or `prospect_uuid` is required.

The existing prospect identifier must remain available as:

- a stable source identity;
- a commercial-lifecycle continuity reference;
- a timeline subject where the existing Pipeline and Prospect Detail contracts require it;
- an auditable link to the durable CommercialPerson.

It must not be silently promoted into a universal person model without the CommercialPerson bridge.

## Policy decision

> Policy persistence cannot use one `clientId` field. A Policy must link to one or more CommercialPerson or CommercialAccount subjects through governed PolicyRole records.

## Persistence decision

No productive repository evidence was found for:

- canonical CommercialPerson persistence;
- CommercialAccount persistence;
- Policy persistence;
- Policy Party / PolicyRole persistence;
- policy evidence links;
- policy version or conflict persistence;
- a Policy-specific event ledger.

Those are construction gaps, not additional discovery-only concepts.

---

# 2. Canonical identity foundation

## 2.1 Shared Commercial Model

Disposition: `REUSE_CANONICAL`

The Foundation Lock ratifies:

- `CommercialPerson` as durable identity;
- `CommercialAccount` as the family, household, business or client unit;
- `CommercialRole` as contextual role;
- `CommercialRelationship` as durable relationship;
- `CommercialAssignment` as formal responsibility;
- `CommercialAttribution` as credit or origin;
- `CommercialServicing` as operational care;
- `PolicyRole` as participation inside a policy.

Critical invariants:

- a person remains the same while roles change;
- advisor, prospect, client, candidate, partner and manager identifiers do not replace durable identity;
- PolicyRole is distinct from relationship, servicing, assignment and attribution;
- a Policy may involve several people and accounts;
- a Policy cannot be modeled by a single client field.

## 2.2 Existing Prospect identity contract

Assets:

- `schemas/advisor-prospect-identity-v1.schema.json`;
- `advisor-os/sales-pipeline/prospect-identity-contract.js`;
- `tests/advisor-prospect-identity-067g4-test.js`;
- `docs/architecture/source-truth/FORGE_PROSPECT_IDENTITY_SOURCE_LINEAGE_DECISION_067G4.md`.

Disposition: `REUSE_WITH_CANONICAL_PERSON_BRIDGE`

Useful implemented behavior:

- stable `prospectId`;
- advisor ownership;
- display name;
- normalized name;
- verified phone and email;
- evidence-bearing source claims;
- explicit verification status;
- relationship references;
- separation of facts, notes, source claims and model interpretations;
- prevention of foreign identities being embedded as the Prospect identity;
- test coverage for source lineage and interpretation boundaries.

Current boundary:

- owner is `ADVISOR_OS_SALES`;
- it is a Prospect identity, not the complete cross-domain CommercialPerson runtime;
- production writer remains blocked in the source decision;
- birth date, alternate names, identity conflicts, account memberships and durable role history are not resolved by this contract.

## 2.3 Legacy Prospect schema

Asset:

- `schemas/prospect.schema.json`.

Disposition: `DO_NOT_PROMOTE / COMPATIBILITY_ONLY`

Blocking behavior:

- open `additionalProperties` contract;
- status and notes mixed with identity;
- age used instead of durable birth-date evidence;
- marital state and children embedded as direct profile values;
- no source lineage requirement;
- no field-level verification or conflict handling.

The 067G4 decision already classifies this schema as compatibility-only.

---

# 3. Prospect persistence and RLS foundation

## 3.1 Migration foundation

Asset:

- `supabase/migrations/20260717000100_067g17a1_prospect_opportunity_security_foundation.sql`.

Disposition: `REUSE_SECURITY_AND_OWNERSHIP_PATTERN`

Useful behavior:

- advisor-owned `prospects` rows;
- composite `(id, advisor_id)` ownership key;
- owned child tables for opportunities, contact methods and provenance;
- archive metadata instead of frontend DELETE;
- ownership-transfer guard;
- immutable archive history;
- explicit RLS;
- `anon` revocation;
- authenticated SELECT, INSERT and UPDATE only;
- advisor-isolated policies;
- child foreign keys that preserve advisor ownership.

Current boundary:

- this is a Prospect and Opportunity persistence foundation;
- it does not create CommercialPerson, CommercialAccount, Policy or PolicyRole;
- repository evidence inspected by this pass does not prove current productive remote deployment;
- it cannot be copied blindly to beneficiary data because Policy parties may require narrower visibility and field-level privacy rules.

## 3.2 Required reuse

The future identity and Policy persistence layer should reuse these security principles:

```text
tenant or advisor ownership
→ composite owned foreign keys
→ no ownership transfer by ordinary update
→ archive instead of delete
→ append-only decision and event history
→ explicit RLS
→ no anonymous access
→ no cross-advisor reads or writes
```

It must not reuse the assumption that every domain object is owned exclusively through one sales Prospect row.

---

# 4. Policy Truth authority

## 4.1 ADR-006

Disposition: `REUSE_CANONICAL`

`ADR-006 — Policy Truth Boundary` establishes:

- Policy Intelligence owns Policy Truth;
- Policy Truth is policy-specific, evidence-backed, source-aware, date-aware, period-aware, status-aware and uncertainty-aware;
- OCR produces candidate evidence, not Policy Truth;
- a Quote is not an issued Policy;
- unknown Policy remains unknown;
- official documents and records outrank OCR, human memory and inference;
- policy claims require sufficient evidence;
- policy timelines contain confirmed or clearly labeled events;
- stale evidence must remain visible;
- recommendations and forecasts cannot rewrite Policy Truth.

ADR-006 is an authority contract. It explicitly does not implement schemas, database, storage, OCR, policy timeline or payment reconciliation.

## 4.2 Current Policy schema

Asset:

- `schemas/policy.schema.json`.

Disposition: `DO_NOT_PROMOTE / REBUILD_CANONICAL_POLICY_CONTRACT`

Useful compatibility fields:

- policy identifier;
- policy number;
- product name;
- carrier;
- premium;
- currency;
- payment frequency;
- sum insured;
- renewal and payment dates;
- status metadata.

Blocking issues:

- requires one `clientId`;
- does not model PolicyRole or multiple participants;
- no CommercialPerson or CommercialAccount reference;
- no policyholder versus insured distinction;
- no beneficiary or payer collection;
- no servicing, originating or advisor-of-record distinction;
- no field-level evidence or provenance;
- no effective-period or version contract;
- no conflict, freshness or completeness state;
- `additionalProperties: true` permits uncontrolled drift;
- operational dates and status can exist without an explicit evidence hierarchy.

This schema may remain as compatibility input during migration. It must not become the persistence contract for Cartera.

---

# 5. PolicyRole / Policy Party authority

## 5.1 Conceptual authority

Disposition: `REUSE_CANONICAL_ARCHITECTURE / RUNTIME_GAP`

The Shared Commercial Model requires PolicyRole and distinguishes at least:

### Client and coverage roles

- `POLICY_OWNER` / policyholder;
- `INSURED`;
- `ADDITIONAL_INSURED`;
- `PAYOR`;
- `BENEFICIARY` when applicable;
- account-level participant for family, business or corporate policies.

### Advisor and operating roles

- `ADVISOR_OF_RECORD`;
- `ORIGINATING_ADVISOR`;
- `SERVICING_ADVISOR`.

### Derived or separately governed economic roles

- compensation recipient;
- manager attribution.

Economic and manager roles must not be treated as static identity fields. They remain governed by Compensation, Attribution, Assignment and Rule Snapshot authorities.

## 5.2 Runtime finding

Repository search and direct inspection did not prove:

- a `PolicyRole` schema;
- a Policy Party contract;
- a Policy Party repository;
- Policy Party migrations;
- Policy Party RLS;
- Policy Party tests;
- a production adapter that resolves parties from a Policy Evidence Packet.

Therefore PolicyRole is foundation-locked architecture, but its productive runtime remains a canonical construction gap.

## 5.3 Privacy boundary

Beneficiary and health-related party information may be sensitive.

The future contract must support:

- role-level evidence;
- effective dates;
- confirmation state;
- privacy classification;
- source document reference;
- visibility scope;
- reversible correction;
- unresolved or masked party candidates;
- no automatic contact or consent inference.

---

# 6. Policy Read Model

Assets:

- `platform/adapters/policy-read-model/policy-read-model-adapter-068b.js`;
- `tests/policy-read-model-adapter-068b-test.js`.

Disposition: `REUSE_ENVELOPE_AND_SAFETY_MODEL_ONLY`

Strengths:

- read-only mode;
- explicit blocked effects;
- freshness metadata;
- evidence references;
- audit envelope;
- safe missing-state behavior;
- explicit `canonicalPolicyTruthClaimed: false`;
- tests that enforce the static read-only boundary.

Blocking facts:

- data is local static fixture data;
- `client_ref` is singular;
- no PolicyRole projection exists;
- no backend connection or browser persistence exists;
- all Policy writes are intentionally blocked.

Required reuse:

- preserve the read-model envelope, safety flags, freshness and blocked-effect semantics;
- replace fixture source only after canonical Policy and PolicyRole persistence exists;
- extend the read model with reviewed parties, evidence state, conflicts and source freshness.

---

# 7. Event & Evidence persistence

## 7.1 Prospect Timeline

Assets:

- `supabase/migrations/20260724000100_nfast08_prospect_timeline_governance.sql`;
- Prospect Timeline service and tests.

Disposition: `REUSE_PERSON_TIMELINE_PROJECTION / DO_NOT_USE_AS_POLICY_TRUTH`

Strengths:

- advisor-owned append-only timeline events;
- evidence references;
- idempotency;
- privacy minimization;
- strict payload allowlists;
- RLS and ownership checks.

Boundary:

- event types are sales and conversation events;
- subject is a Prospect;
- it does not own Policy facts, Policy status or Policy lifecycle;
- it cannot store Policy parties or Policy Truth.

Policy and quote events may project commercial meaning into the person timeline through governed adapters. They must remain owned by Quote or Policy authority.

## 7.2 FES Activity Event Ledger

Assets:

- `platform/event-evidence/activity-ledger-contract.js`;
- `supabase/migrations/20260726000100_fes02_activity_event_ledger.sql`;
- gateway, browser runtime, sync service and tests.

Disposition: `REUSE_CANONICAL_LEDGER_PATTERN / POLICY_CONTRACT_EXTENSION_REQUIRED`

Strengths:

- append-only ledger;
- deterministic event digest;
- idempotency;
- evidence-reference records;
- correction links;
- conflict persistence;
- local outbox and sync pattern;
- RLS and tenant isolation;
- safety and privacy validation;
- tested gateway and browser-runtime surfaces.

Current boundary:

- the database subject types are restricted to `PROSPECT`, `APPOINTMENT`, `ACTIVITY` and `DUE_ACTION`;
- the current canonical event contract is activity-oriented;
- it does not accept `POLICY`, `POLICY_PARTY`, `PAYMENT_OBLIGATION` or `PAYMENT` subjects;
- it must not be bypassed by writing Policy facts directly into Prospect Timeline payloads.

## 7.3 Required event decision

Cartera must not create another generic event infrastructure.

The implementation phase must choose one governed FES-compatible route:

1. extend the canonical Event & Evidence subject and event contracts to include Policy-domain subjects; or
2. implement a Policy-domain ledger using the same FES envelope, evidence, correction, idempotency, sync and RLS contracts.

Either route must preserve one Event & Evidence operating system and domain ownership.

---

# 8. Productive persistence target

The minimum target vertical is:

```text
EvidenceSource
→ EvidenceInboxItem
→ PolicyEvidencePacket
→ identity candidates
→ CommercialPerson resolution decision
→ PolicyRole candidates
→ advisor confirmation
→ confirmed Policy command
→ canonical persistence
→ Policy event append
→ person Timeline projection
→ Policy Read Model
→ Cartera projection
```

## Candidate persistence responsibilities

Exact physical names require a separately authorized implementation scope. Conceptually the persistence layer must provide:

### Identity

- durable CommercialPerson record;
- source-identity link from Prospect and other domains;
- normalized identity attributes;
- source lineage;
- identity match candidates;
- confirmed link/create decision;
- conflict and correction history.

### Account

- CommercialAccount for individual, household, family, business or corporate context;
- person-to-account membership and role;
- evidence and effective period.

### Policy

- stable Policy identity;
- carrier and policy number;
- product reference;
- issue and effective periods;
- status with source and as-of time;
- financial and coverage facts with evidence;
- completeness, freshness and conflict states;
- current version projection over append-only evidence and events.

### Policy parties

- Policy reference;
- CommercialPerson or CommercialAccount reference;
- PolicyRole type;
- effective period;
- confirmation state;
- evidence references;
- privacy and visibility classification;
- archived or corrected state without destructive history rewrite.

### Evidence and events

- source document hash and reference;
- field-level evidence links;
- Policy evidence version;
- append-only Policy events;
- correction events;
- person and account projections.

---

# 9. Security and RLS requirements

The future implementation must prove:

1. advisor or tenant ownership for every Policy and party path;
2. no cross-advisor read, insert, update, confirmation or archive;
3. no anonymous access;
4. no frontend DELETE;
5. archive and correction history cannot be silently reversed;
6. identity ownership cannot be transferred through an ordinary update;
7. child records cannot reference a Policy or person outside the authorized owner scope;
8. beneficiary and sensitive party data obey narrower visibility where required;
9. advisor confirmation actor and evidence references are preserved;
10. unknown, blocked and hidden-by-scope are never converted to zero, absent or rejected;
11. writes occur through governed commands or security-definer functions with idempotency;
12. Policy events and evidence are append-only.

---

# 10. Test inventory and required additions

## Existing tests to preserve

- Prospect identity source-lineage test;
- prospect migration security static tests;
- Prospect Timeline migration and RLS tests;
- FES ledger migration, gateway, browser runtime and sync tests;
- Policy Evidence Packet tests;
- Advisor Confirmation Gate tests;
- Policy Read Model safety-boundary test.

## Tests required before productive Policy persistence

1. existing Prospect resolves to one CommercialPerson without duplicate creation;
2. two similar names produce review, not automatic merge;
3. a new confirmed person preserves source lineage and actor;
4. one Policy supports owner, insured and payer as different people;
5. one Policy supports multiple insureds and beneficiaries;
6. a CommercialAccount may be the payer or policy owner where allowed;
7. Policy Party effective periods preserve historical changes;
8. beneficiary data is hidden outside authorized scope;
9. unconfirmed Policy Evidence Packet cannot persist Policy;
10. confirmation without an identity decision cannot persist Policy;
11. policy number collision produces conflict review;
12. cross-advisor Policy and party access is denied;
13. archive does not delete Policy or party history;
14. a Policy event is append-only and evidence-backed;
15. Policy event projection appears in the person timeline without becoming Prospect-owned truth;
16. Policy Read Model reads from the canonical source and preserves safety/freshness envelopes;
17. legacy `clientId` input is migrated through identity resolution rather than copied as Policy ownership truth.

---

# 11. Reuse classification

## Reuse canonically

- Shared Commercial Model Foundation Lock;
- CommercialPerson, CommercialAccount and PolicyRole concepts;
- ADR-006 Policy Truth Boundary;
- Evidence Inbox and Policy Evidence Packet;
- Event & Evidence operating-system principles;
- no-delete, ownership, RLS, append-only and idempotency patterns.

## Reuse with adapters

- Advisor Prospect Identity contract;
- Prospect source lineage;
- current Prospect table and RLS foundation;
- Prospect Timeline projection;
- FES ledger contracts, local store, outbox, gateway and sync patterns;
- Policy Read Model envelope.

## Do not promote

- `schemas/prospect.schema.json` as durable identity;
- `schemas/policy.schema.json` as canonical Policy persistence;
- one `clientId` as policy participation;
- static Policy fixtures as Policy Truth;
- Prospect Timeline as Policy event authority;
- Activity Ledger subject restrictions as if Policy were already supported;
- quarantined IndexedDB as Person or Policy truth.

---

# 12. Canonical build gaps

The pass confirms these true construction gaps:

1. CommercialPerson schema and runtime contract;
2. durable identity persistence;
3. Prospect-to-CommercialPerson identity link;
4. identity-resolution decision and conflict persistence;
5. CommercialAccount and membership persistence;
6. canonical Policy schema v2;
7. PolicyRole / Policy Party schema and contract;
8. Policy and Policy Party persistence;
9. Policy evidence and field-provenance links;
10. Policy status/version/conflict model;
11. Policy write command and confirmation gate integration;
12. Policy-specific RLS and privacy rules;
13. FES-compatible Policy event contract and persistence;
14. person/account Timeline projections from Policy events;
15. productive Policy repository and read-model adapter;
16. vertical identity-to-policy integration tests.

---

# 13. Pass 4 result

## Confirmed

- CommercialPerson, CommercialAccount and PolicyRole are Foundation Lock authorities.
- Prospect Identity has a tested source-lineage contract.
- Prospect ownership, archive and RLS patterns are reusable.
- Policy Truth has a final ADR.
- Event & Evidence has a strong append-only ledger and sync foundation.
- Policy Read Model has a safe tested envelope.

## Not yet implemented as a productive vertical

- durable CommercialPerson runtime;
- CommercialAccount runtime;
- PolicyRole runtime;
- Policy persistence;
- Policy Party persistence;
- Policy-specific RLS;
- Policy event contract;
- identity-aware confirmed Policy command;
- productive Policy repository/read adapter.

## Final decision

`PASS_4_POLICY_PERSISTENCE_IDENTITY_PARTY_AUTHORITY_RECONCILED`

`CANONICAL_IDENTITY=COMMERCIAL_PERSON`

`PROSPECT_IDENTITY=STABLE_SALES_REFERENCE_AND_CONTINUITY_LINK`

`POLICY_PARTICIPATION=POLICY_ROLE_NOT_CLIENT_ID`

`POLICY_TRUTH_OWNER=POLICY_INTELLIGENCE`

`EVENT_INFRASTRUCTURE=FES_COMPATIBLE_NO_NEW_GENERIC_LEDGER`

`NEXT_AUDIT=POLICY_DETAIL_TIMELINE_RENEWALS_TASKS_RECONCILIATION`

The next Track A pass must inspect Policy Detail, Policy Timeline, renewal, risk, alert, review and task foundations against the identity, PolicyRole, evidence and event authorities locked here.
