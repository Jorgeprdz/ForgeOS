# FORGE CARTERA 010A — Identity and Policy Persistence Scope 001

Forge OS  
Architecture Source Truth  
Cartera / Control Base and Canonical Persistence

## Status

```text
PHASE=CARTERA_010A_IDENTITY_POLICY_PERSISTENCE_SCOPE
STATUS=CLOSED_SCOPE_AND_AUTHORITY_LOCKED
SOURCE_BRANCH=feature/cartera-001d-vertical-acceptance-closure
SOURCE_COMMIT=2a957ef07f2579b7fe780287d66ad20422ab5e1f
IMPLEMENTATION_BRANCH=docs/cartera-010a-identity-policy-persistence-scope
RUNTIME_MUTATION=NO
SCHEMA_MUTATION=NO
SUPABASE_REMOTE_MUTATION=NO
PRODUCT_UI_MUTATION=NO
MERGE_PERFORMED=NO
NEXT=CARTERA_010B_COMMERCIAL_PERSON_POLICY_ROLE_FOUNDATION
```

## Purpose

CARTERA 001 closed Quote-to-Prospect continuity. CARTERA 010 begins the first
post-sale control base. This phase does not build persistence. It fixes the
identity, Policy, party, evidence, command, security and allowed-path contracts
that 010B must obey.

The objective is to prevent Cartera from becoming any of the following:

- a second Prospect table;
- a static client directory;
- a Policy table with one free-text `clientId`;
- a duplicate Policy Truth owner;
- a second generic event ledger;
- an OCR-to-database shortcut;
- a tenant-unsafe repository;
- a UI-first implementation without canonical identity.

---

# 1. Authority resolution

## 1.1 Canonical durable identity

```text
CANONICAL_DURABLE_IDENTITY=COMMERCIAL_PERSON
PROSPECT_IDENTITY=STABLE_SALES_SOURCE_IDENTITY
PROSPECT_DESTRUCTIVE_RENAME=FORBIDDEN
PROSPECT_AUTOMATIC_PROMOTION_TO_PERSON=FORBIDDEN
AUTOMATIC_IDENTITY_MERGE=FORBIDDEN
```

`CommercialPerson` is the durable human identity. Existing Prospect identity
remains intact as a sales-domain source identity and continuity reference.

A known Prospect must link to one CommercialPerson through a governed source
identity link. It must not be copied into a second person record and must not be
silently treated as the universal person identifier.

## 1.2 Canonical account authority

`CommercialAccount` represents the commercial unit around which relationships,
policies and servicing may be organized.

Required account categories are conceptually:

- individual;
- household or family;
- business;
- corporate;
- family business;
- group or affinity.

A person may belong to multiple accounts through time-bounded, evidence-bearing
memberships. Account membership does not replace person identity.

## 1.3 Policy Truth ownership

```text
POLICY_TRUTH_OWNER=POLICY_INTELLIGENCE
CARTERA_ROLE=REVIEW_WORKFLOW_AND_READ_MODEL_COMPOSITION
QUOTE_IS_POLICY=FALSE
APPLICATION_IS_POLICY=FALSE
OCR_IS_POLICY_TRUTH=FALSE
```

Policy Intelligence owns Policy facts, parties, status, coverage and effective
periods. Cartera owns advisor-facing review, orchestration and projections.

## 1.4 Policy participation

```text
POLICY_PARTICIPATION_AUTHORITY=POLICY_ROLE
SINGLE_CLIENT_ID_AUTHORITY=FORBIDDEN
```

A Policy may involve multiple CommercialPerson and CommercialAccount subjects.
Participation is expressed through PolicyRole records, not one owner/client
field.

---

# 2. Required 010B logical contracts

010B must implement the following logical records. Physical table and function
names may be adjusted only if the same ownership and invariants remain explicit.

## 2.1 CommercialPerson

Minimum responsibilities:

- stable opaque person reference;
- advisor or tenant scope;
- display identity separated from normalized matching attributes;
- privacy classification;
- lifecycle state without role collapse;
- created/confirmed actor and timestamps;
- archival state without destructive delete;
- version or correction lineage;
- no embedded policies, commissions, assignments, servicing or calculated scores.

CommercialPerson must never decide:

- who receives compensation;
- who receives production credit;
- who services a Policy;
- which advisor originated a sale;
- current manager or office as timeless truth.

## 2.2 Source identity link

The Prospect-to-Person bridge must preserve:

- CommercialPerson reference;
- source domain and source identity type;
- stable Prospect reference;
- advisor/tenant owner;
- source lineage;
- evidence references;
- match status;
- advisor decision;
- decision actor and time;
- idempotency identity;
- correction or supersession lineage.

One active Prospect source identity may resolve to at most one active
CommercialPerson link inside the same owner scope. A conflicting prior link must
enter review; it must never be overwritten silently.

## 2.3 Identity candidate, decision and conflict

Identity resolution must distinguish:

```text
MATCH_CANDIDATE
LINK_CONFIRMED
CREATE_CONFIRMED
UNRESOLVED
REJECTED_MATCH
CONFLICT
CORRECTED
```

Candidate evidence may include normalized name, verified phone, verified email,
birth-date evidence, account relationship, recent Quote/Application/Policy
references and document provenance.

Name equality alone is insufficient for automatic fusion.

Every decision must preserve:

- candidate set;
- evidence used;
- confidence or uncertainty;
- decision outcome;
- actor;
- timestamp;
- source packet or event;
- correction lineage.

## 2.4 CommercialAccount and membership

CommercialAccount must support:

- stable account reference;
- account type;
- display label;
- advisor/tenant scope;
- privacy classification;
- evidence and freshness;
- archive/correction behavior.

Membership must support:

- person reference;
- account reference;
- membership/relationship role;
- effective period;
- evidence;
- confirmation state;
- privacy scope;
- correction lineage.

No account may silently merge its members or imply shared consent.

## 2.5 Canonical Policy

The canonical Policy contract must be strict and version-aware.

Minimum responsibilities:

- stable opaque Policy reference;
- advisor/tenant scope;
- carrier reference and policy number;
- product reference;
- issue date and effective period when evidenced;
- status with source and as-of time;
- currency, premium, payment frequency, sum insured and coverage facts only when
  explicitly supported by evidence;
- completeness, freshness, conflict and uncertainty state;
- source document and evidence-version references;
- current projection over append-only versions and corrections;
- archive state without destructive delete.

The following defaulting is forbidden:

```text
UNKNOWN_TO_ZERO=FORBIDDEN
UNKNOWN_TO_MXN=FORBIDDEN
UNKNOWN_TO_ACTIVE=FORBIDDEN
UNKNOWN_TO_STABLE=FORBIDDEN
UNKNOWN_TO_MANUAL=FORBIDDEN
```

Policy number collision must produce conflict review or deterministic replay. It
must not overwrite another Policy.

## 2.6 PolicyRole

A PolicyRole links exactly one Policy to exactly one participant subject:

- CommercialPerson; or
- CommercialAccount.

Exactly one participant kind must be populated per role.

Required role taxonomy for the foundation:

```text
POLICY_OWNER
INSURED
ADDITIONAL_INSURED
PAYOR
BENEFICIARY
ADVISOR_OF_RECORD
ORIGINATING_ADVISOR
SERVICING_ADVISOR
```

Each role must preserve:

- effective period;
- confirmation state;
- evidence references;
- privacy classification;
- visibility scope;
- actor and timestamp;
- correction/supersession lineage;
- archive state without destructive deletion.

Beneficiary and health-related party information must allow narrower visibility
than the general Policy row.

PolicyRole must not collapse assignment, attribution, servicing or compensation
into one advisor field.

## 2.7 Policy evidence, versions and conflicts

010B must provide durable support for:

- Policy evidence version;
- document hash and provenance;
- field-level evidence links;
- observed/effective/as-of timestamps;
- confidence and verification state;
- conflicting claims;
- advisor-confirmed resolution;
- correction lineage;
- immutable prior versions.

A parser, OCR provider or Evidence Packet may propose facts. Only a governed
confirmed command may persist canonical Policy and PolicyRole state.

---

# 3. Governed commands

010B must expose command authority rather than ordinary frontend table writes.

Minimum command boundaries:

## 3.1 Confirm identity resolution

A governed identity command must support:

- link an existing Prospect/source identity to an existing CommercialPerson;
- create a CommercialPerson only after explicit reviewed `CREATE_CONFIRMED`;
- reject or leave a candidate unresolved;
- replay identical commands idempotently;
- reject changed-input replay as conflict;
- preserve actor, evidence and decision reason.

## 3.2 Confirm Policy with parties

A governed Policy command must require:

- confirmed person/account decisions for every participant that requires a
  canonical subject;
- explicit Policy Evidence Packet or equivalent governed evidence reference;
- reviewed Policy facts;
- reviewed PolicyRole collection;
- advisor/tenant ownership;
- deterministic idempotency identity;
- conflict behavior for changed input or policy-number collision;
- append-only version and correction behavior.

The command must fail closed when identity, evidence or ownership is unresolved.

## 3.3 Application boundary

```text
QUOTE_ACCEPTANCE_CREATES_POLICY=NO
APPLICATION_CREATES_POLICY_WITHOUT_EVIDENCE=NO
AUTOMATIC_POLICY_CREATION=NO
```

Quote and Application references may be preserved as lineage, but neither may
create Policy Truth without the separately governed issued-Policy evidence and
confirmation path.

---

# 4. Security and RLS lock

010B must prove all of the following:

1. every person, account, membership, Policy, role, evidence and conflict path is
   bound to one advisor or tenant scope;
2. no cross-advisor read, insert, update, confirmation, correction or archive;
3. no anonymous access;
4. no ordinary ownership transfer;
5. no frontend hard delete;
6. child rows cannot reference a parent outside the authorized owner scope;
7. direct app-role writes to canonical tables are revoked when governed commands
   own mutation;
8. identity decisions, Policy versions, evidence and corrections are append-only;
9. sensitive PolicyRole data may have narrower visibility;
10. hidden-by-scope and unknown remain distinguishable;
11. security-definer commands pin a bounded `search_path`;
12. command replay and changed-input conflicts are deterministic.

The existing Prospect ownership migration is a reusable security pattern, not a
schema to copy blindly.

---

# 5. Event and projection boundary

010A reserves FES-compatible Policy domain subjects for later integration:

```text
POLICY
POLICY_ROLE
POLICY_EVIDENCE_VERSION
POLICY_IDENTITY_DECISION
```

010B may define the domain event contract required by its persistence commands,
but productive Policy Timeline, person/account projection and legacy Cartera
route integration belong to `CARTERA_010C`.

No new generic ledger is authorized. Policy events must reuse or extend the
Event & Evidence operating model with domain-specific validation.

Prospect Timeline must never become Policy Truth storage.

---

# 6. Legacy and reuse lock

## Reuse canonically

- CommercialPerson, CommercialAccount and PolicyRole foundation concepts;
- ADR-006 Policy Truth Boundary;
- Evidence Source, Evidence Inbox and Policy Evidence Packet;
- Advisor Confirmation Gate;
- FES append-only, evidence, correction, conflict, idempotency and RLS patterns;
- Policy Read Model safety/freshness envelope;
- Prospect ownership, archive and composite-key security patterns.

## Reuse through adapters

- `advisor-prospect-identity-v1` as the Prospect source identity contract;
- existing Prospect persistence and source lineage;
- existing Quote/Application references as lineage only;
- current Policy static/legacy records as compatibility input only;
- current `cartera` route only after 010C removes direct truth writes.

## Do not promote

- `schemas/prospect.schema.json` as universal identity;
- `schemas/policy.schema.json` as canonical Policy persistence;
- `clientId` as Policy ownership or participation truth;
- static Policy fixtures as canonical truth;
- localStorage or isolated IndexedDB as canonical Person/Policy authority;
- Prospect Timeline as Policy event authority;
- OCR or parser output as direct Policy writes;
- automatic merge, task, message, Calendar, cross-sell or Policy creation.

---

# 7. 010B allowed construction surface

010B is authorized only inside bounded areas equivalent to:

```text
schemas/commercial-person-*.schema.json
schemas/commercial-account-*.schema.json
schemas/policy-v2-*.schema.json
schemas/policy-role-*.schema.json
platform/shared-commercial-model/**
platform/policy-intelligence/**
platform/event-evidence/**          # Policy-domain contract extension only
supabase/migrations/<cartera010b_identity_policy_foundation>.sql
tests/cartera-010b-*.mjs
tests/policy-*.mjs                  # only directly relevant additions
.github/workflows/cartera-010b-*.yml
docs/architecture/source-truth/FORGE_CARTERA_010B_*.md
docs/evidence/FORGE_CARTERA_010B_*.md
```

Changes outside this surface require an explicit scope amendment.

## Explicitly outside 010B

- Cartera or Policy UI redesign;
- document upload/OCR worker implementation;
- bulk import;
- payment obligations or renewal calendar;
- relationship-memory UI;
- Future Radar;
- NBA, NASH or Candy Crush integration;
- Calendar, WhatsApp, email or task execution;
- compensation computation;
- production merge;
- automatic remote deployment without a separate acceptance gate.

---

# 8. Required 010B tests

010B cannot close without tests proving at least:

1. a known Prospect links to one CommercialPerson without duplicate creation;
2. similar names require review and never auto-merge;
3. a confirmed new person preserves evidence, actor and source lineage;
4. identical identity command replay is idempotent;
5. changed-input replay produces conflict;
6. one Policy supports different owner, insured and payor people;
7. one Policy supports multiple insureds and beneficiaries;
8. an account may participate where the role permits it;
9. PolicyRole effective periods preserve history;
10. sensitive beneficiary information is denied outside scope;
11. unconfirmed evidence cannot persist Policy Truth;
12. unresolved identity blocks Policy persistence;
13. Policy-number collision cannot silently overwrite;
14. cross-advisor access is denied across every child path;
15. archive/correction preserves prior Policy and role history;
16. app roles cannot directly mutate canonical tables;
17. unknown financial/status fields remain unknown;
18. bounded command `search_path` and RLS remain enforced;
19. legacy `clientId` input cannot bypass identity resolution;
20. no Quote/Application event creates Policy automatically.

---

# 9. 010A acceptance and closure

```text
CANONICAL_PERSON_AUTHORITY=LOCKED
PROSPECT_SOURCE_LINK_BOUNDARY=LOCKED
COMMERCIAL_ACCOUNT_BOUNDARY=LOCKED
POLICY_TRUTH_BOUNDARY=LOCKED
POLICY_ROLE_TAXONOMY=LOCKED
EVIDENCE_AND_CONFLICT_BOUNDARY=LOCKED
COMMAND_AUTHORITY=LOCKED
RLS_AND_PRIVACY_BOUNDARY=LOCKED
FES_COMPATIBILITY_BOUNDARY=LOCKED
LEGACY_COMPATIBILITY_BOUNDARY=LOCKED
ALLOWED_PATHS=LOCKED
REQUIRED_TEST_MATRIX=LOCKED
```

Exit decision:

```text
CARTERA_010A_COMPLETE=YES
CARTERA_010B_AUTHORIZED=YES
CARTERA_010B_NEXT=YES
MERGE_PERFORMED=NO
```
