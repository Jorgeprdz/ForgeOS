# FORGE CARTERA 010B — Persistence Foundation Progress 001

Forge OS
Architecture Source Truth
Cartera / Commercial Person and Policy Role Foundation

## Status

```text
PHASE=CARTERA_010B_COMMERCIAL_PERSON_POLICY_ROLE_FOUNDATION
STATUS=REPOSITORY_PERSISTENCE_FOUNDATION_IMPLEMENTED
SOURCE_BRANCH=feature/cartera-001d-vertical-acceptance-closure
SOURCE_COMMIT=824dc48c74423cb1beb8b85a124d071b88ecf6a1
IMPLEMENTATION_BRANCH=feature/cartera-010b-commercial-person-policy-role-foundation
RUNTIME_CONTRACT_MUTATION=YES_BOUNDED
SCHEMA_MUTATION=YES_REPOSITORY_ONLY
PRODUCT_UI_MUTATION=NO
SUPABASE_REMOTE_MUTATION=NO
CARTERA_010B_COMPLETE=NO
NEXT=CARTERA_010B_GOVERNED_COMMAND_RPCS
```

## Implemented in this cut

The initial JSON Schemas are now backed by executable contract validation and a
productive repository migration surface for:

```text
CommercialPerson
IdentityResolutionDecision
Prospect / source identity link
CommercialAccount
CommercialAccountMembership
Canonical Policy v2 current projection
Policy Evidence Version
Policy Version
PolicyRole
Policy Conflict
Governed Command Receipt
```

The migration remains repository-only. It is not remote deployment
authorization.

## Identity boundary

Prospect remains a stable Sales-domain source identity. A Prospect may link to
one active CommercialPerson inside the owning advisor scope. The link is
append-only and correction-based.

The persistence foundation prevents:

- automatic person merge;
- a second Prospect table acting as universal identity;
- changed ownership;
- two active person links for the same Prospect;
- silent replacement of a prior identity decision;
- unresolved identity outcomes from becoming canonical person links.

## Policy boundary

Policy Truth uses one canonical Policy projection plus immutable evidence,
version and role history.

Unknown facts remain explicit:

```text
STATUS_UNKNOWN=ALLOWED_EXPLICITLY
CURRENCY_NULL=ALLOWED
PREMIUM_NULL=ALLOWED
PAYMENT_FREQUENCY_NULL=ALLOWED
SUM_INSURED_NULL=ALLOWED
UNKNOWN_DEFAULTING=FORBIDDEN
```

A PolicyRole links exactly one CommercialPerson or one CommercialAccount.
Beneficiary roles cannot use broad `POLICY_TEAM` visibility.

## Security boundary

All persistence paths carry `advisor_id` and use composite owner foreign keys.

```text
ANON_ACCESS=REVOKED
AUTHENTICATED_DIRECT_WRITE=REVOKED
AUTHENTICATED_OWNER_READ=RLS_ONLY
HARD_DELETE=FORBIDDEN
OWNERSHIP_TRANSFER=FORBIDDEN
IMMUTABLE_HISTORY=TRIGGER_ENFORCED
RESTRICTED_POLICY_ROLES=NOT_EXPOSED_BY_ORDINARY_TABLE_GRANT
```

The ordinary authenticated role receives no insert, update or delete authority
on canonical tables. Mutation authority is intentionally deferred to the next
010B cut: bounded `security definer` command RPCs.

## Runtime validators

`cartera-010b-contract-validator.js` provides deterministic validation and
command-envelope preparation for:

- CommercialPerson;
- CommercialAccount;
- Policy v2;
- PolicyRole;
- explicit identity resolution;
- confirmed Policy persistence.

The validators reject:

- unknown fields;
- role rows with both or neither participant kind;
- beneficiary visibility broader than permitted;
- unresolved identity commands carrying canonical mutations;
- `CREATE_CONFIRMED` without reviewed person data;
- Policy persistence containing unconfirmed roles;
- advisor, Policy or role scope mismatches;
- malformed evidence digests.

## Repository acceptance

```text
JAVASCRIPT_SYNTAX=PASS
TARGETED_TESTS=14
TARGETED_PASS=14
TARGETED_FAIL=0
PERSISTENCE_GRAPH=PASS
COMPOSITE_OWNER_FKS=PASS
APPEND_ONLY_GUARDS=PASS
RLS_STATIC_CONTRACT=PASS
DIRECT_APP_WRITES=REVOKED
UNKNOWN_POLICY_DEFAULTS=ABSENT
BENEFICIARY_VISIBILITY=BOUNDED
```

## Honest remaining work

010B is not complete. The following remain:

1. identity-resolution command RPC;
2. confirmed-Policy-with-parties command RPC;
3. deterministic identical replay and changed-input conflict behavior at the
   database command boundary;
4. transactional remote tests for cross-advisor denial, append-only behavior
   and role privacy;
5. remote migration deployment and rollback-clean acceptance evidence;
6. final 010B closure.

No Product UI, OCR, renewal, payment, communication, Calendar, compensation or
Cartera read-model integration is authorized in this cut.
