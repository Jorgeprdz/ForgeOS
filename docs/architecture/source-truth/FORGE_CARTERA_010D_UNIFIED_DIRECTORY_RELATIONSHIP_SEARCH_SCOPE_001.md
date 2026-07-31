# FORGE CARTERA 010D — Unified Directory and Relationship Search Scope 001

Forge OS
Architecture Source Truth
Cartera / Control Base Closure

## Status

```text
PHASE=CARTERA_010D_UNIFIED_DIRECTORY_RELATIONSHIP_SEARCH
STATUS=SCOPE_LOCKED_IMPLEMENTATION_STARTED
SOURCE_BRANCH=feature/cartera-010b-commercial-person-policy-role-foundation
SOURCE_COMMIT=f7aaf82586d051b94dc6f526c603f02c83f15a66
IMPLEMENTATION_BRANCH=feature/cartera-010d-unified-directory-relationship-search
RUNTIME_MUTATION=YES_BOUNDED_READ_ONLY
SCHEMA_MUTATION=NO
SUPABASE_REMOTE_MUTATION=NO
PRODUCT_UI_REDESIGN=NO
CARTERA_010D_COMPLETE=NO
NEXT=CARTERA_010D_CANONICAL_DIRECTORY_READ_MODEL_AND_SERVICE
```

## Purpose

CARTERA 010B established durable CommercialPerson, CommercialAccount, Policy and
PolicyRole authorities. CARTERA 010C made canonical policies, general
participants, Policy detail and minimized Timeline visible in the productive
Cartera route.

CARTERA 010D closes the remaining Point 1 control-base capability:

> The advisor can find any known person or policy in seconds and understand the
> basic relationship with the practice.

This phase creates one owner-scoped, read-only directory projection across
canonical people, accounts, policies, account memberships and governed general
PolicyRole reads.

## Canonical authorities

```text
commercial_people
commercial_accounts
commercial_account_memberships
canonical_policies
forge_cartera010b_list_general_policy_roles(text)
```

Direct authenticated reads from `policy_roles` remain forbidden.

## Directory entry kinds

```text
COMMERCIAL_PERSON
COMMERCIAL_ACCOUNT
POLICY
```

Each entry preserves its own canonical reference. A person, account and policy
must never be collapsed into one generic client identifier.

## Search coverage

The bounded search index may match:

- person display name and preferred name;
- verified phone and verified email;
- person reference;
- account label, type and reference;
- confirmed/corrected account relationship role;
- policy number and policy reference;
- carrier reference;
- product reference;
- confirmed/corrected general PolicyRole type;
- visible participant label and reference.

## Search privacy rule

Verified phone and email may participate in owner-scoped matching, but the
canonical directory projection must not expose those values.

```text
PHONE_SEARCHABLE=YES_OWNER_SCOPE
EMAIL_SEARCHABLE=YES_OWNER_SCOPE
PHONE_RENDERED=NO
EMAIL_RENDERED=NO
PHONE_SERIALIZED_IN_ENTRIES=NO
EMAIL_SERIALIZED_IN_ENTRIES=NO
```

A result may report `VERIFIED_PHONE` or `VERIFIED_EMAIL` as a match reason. It
must not echo the matched value.

## Relationship projection

Only active memberships and roles with confirmation state `CONFIRMED` or
`CORRECTED` may enter the current directory projection.

Person entries may summarize:

- linked account references and confirmed relationship roles;
- linked policy references and general policy roles;
- distinct policy and account counts.

Account entries may summarize:

- confirmed member references and relationship roles;
- linked policy references and general account policy roles;
- distinct person and policy counts.

Policy entries may summarize:

- visible general participant references and roles;
- carrier, product, status and policy number;
- distinct person and account counts.

Beneficiaries and restricted roles are not part of the general directory.
Absence from this projection must not be presented as proof that they do not
exist.

## Unknown and conflict boundary

010D must not infer or default:

```text
UNKNOWN_STATUS_TO_ACTIVE
MISSING_PHONE_TO_EMPTY_CONTACT
MISSING_EMAIL_TO_EMPTY_CONTACT
HIDDEN_ROLE_TO_ABSENT
PROSPECT_TO_CLIENT
ACCOUNT_MEMBERSHIP_TO_CONSENT
```

## Product route boundary

010D may adapt the existing Cartera route to expose a unified directory and
local search results. It must not redesign the route or introduce direct writes.

Allowed visible behavior:

- directory search;
- entry-kind labels;
- relationship and policy counts;
- basic relationship summaries;
- opening the existing canonical Policy detail from a Policy result.

Forbidden visible behavior:

- create, edit, delete or import canonical records;
- identity merge;
- beneficiary disclosure;
- phone/email echo from search matching;
- automatic contact action;
- OCR or document intake;
- payment, renewal, Calendar, task or compensation behavior.

## Explicitly outside 010D

- Portfolio Intake / Point 2;
- OCR, PDF or bulk import;
- identity candidate ranking or automatic fusion;
- payment obligations and renewals;
- Relationship Memory;
- Future Radar, NBA, NASH or Candy Crush activation;
- Material 3 redesign;
- schema changes or automatic Supabase deployment;
- merge to `main`.

## Required acceptance

010D cannot close without proving:

1. every read is authenticated and owner-scoped by RLS;
2. people, accounts and policies remain separate entry kinds;
3. search by name, preferred name, phone, email, policy number, carrier,
   product, account and relationship role works;
4. phone and email never appear in public entries or serialized UI state;
5. beneficiary and restricted roles fail closed;
6. direct `policy_roles` reads remain absent;
7. only current `CONFIRMED` or `CORRECTED` memberships/roles are projected;
8. cross-advisor entries are invisible;
9. empty, loading, error and no-match states are explicit;
10. the existing canonical Policy detail remains reachable;
11. mobile content keeps safe scroll space above the floating nav pill;
12. no direct canonical mutation control appears;
13. browser acceptance covers desktop and mobile;
14. remote fixtures are removed with residual count zero.

## First-cut exit

```text
CARTERA_010D_SOURCE_PINNED=YES
UNIFIED_DIRECTORY_ENTRY_KINDS=LOCKED
SEARCH_PRIVACY_BOUNDARY=LOCKED
RELATIONSHIP_PROJECTION_BOUNDARY=LOCKED
DIRECT_POLICY_ROLE_READ=FORBIDDEN
CARTERA_010D_IMPLEMENTATION_STARTED=YES
CARTERA_010D_COMPLETE=NO
NEXT=CARTERA_010D_CANONICAL_DIRECTORY_READ_MODEL_AND_SERVICE
```
