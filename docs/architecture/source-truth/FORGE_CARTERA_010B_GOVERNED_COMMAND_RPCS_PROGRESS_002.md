# FORGE CARTERA 010B — Governed Command RPCs Progress 002

Forge OS
Architecture Source Truth
Cartera / Commercial Person and Policy Role Foundation

## Status

```text
PHASE=CARTERA_010B_GOVERNED_COMMAND_RPCS
STATUS=REPOSITORY_IMPLEMENTED_PENDING_REMOTE_ACCEPTANCE
SOURCE_BRANCH=docs/cartera-010a-identity-policy-persistence-scope
SOURCE_COMMIT=f07930c0c14a3fbb2b7fb9d08a017a010ddf07ba
IMPLEMENTATION_BRANCH=feature/cartera-010b-commercial-person-policy-role-foundation
PRODUCT_UI_MUTATION=NO
SUPABASE_REMOTE_MUTATION=NO
CARTERA_010B_COMPLETE=NO
NEXT=CARTERA_010B_REMOTE_DEPLOYMENT_AND_TRANSACTIONAL_ACCEPTANCE
```

## Implemented command authority

Migrations `20260731000210` through `20260731000212` add the only
authenticated canonical mutation paths authorized in this cut:

```text
forge_cartera010b_confirm_identity_resolution(jsonb)
forge_cartera010b_confirm_policy_with_parties(jsonb)
```

Both functions are `security definer`, pin the bounded search path
`public, extensions, pg_temp`, derive the advisor from `auth.uid()` and reject
commands whose advisor or actor references do not match the authenticated owner.
No direct `INSERT`, `UPDATE` or `DELETE` grant is added to canonical tables.

## Identity-resolution command

The identity command supports:

- linking a governed Sales source identity to an existing confirmed
  `CommercialPerson`;
- creating a new confirmed person only after explicit `CREATE_CONFIRMED` input;
- recording unresolved, rejected and conflict decisions without canonical person
  or link mutation;
- returning an existing active link without duplication;
- converting a competing active link into a durable identity conflict;
- correcting an existing source link by closing its effective period and adding
  a new append-only link with correction lineage;
- preserving Prospect ownership through the existing composite owner key.

The correction path does not weaken direct-write protection. A dedicated trigger
allows exactly one governed transition on the prior link: `effective_to` may move
from `NULL` to a valid closing timestamp. Every other field remains immutable,
and direct authenticated table writes remain revoked.

## Confirmed-Policy command

The Policy command requires:

- a strict `Policy v2` payload owned by the authenticated advisor;
- `CLEAR` conflict state before canonical persistence;
- reviewed or confirmed issued-Policy evidence;
- the new evidence reference inside the Policy evidence-reference collection;
- one or more `CONFIRMED` PolicyRole records;
- exactly one confirmed, non-archived person or account participant per role;
- restricted visibility for beneficiary roles;
- deterministic version sequencing and exact previous-version lineage;
- no mutation of archived Policy current rows.

The command persists one atomic vertical:

```text
canonical Policy current projection
→ Policy evidence version
→ immutable Policy version
→ immutable multi-party PolicyRole versions
→ command receipt
```

Policy-number collision, repeated evidence identity and changed-input replay do
not overwrite Policy Truth. They create durable conflict envelopes instead.
PolicyRole correction closes only the prior effective period under governed
command context; every other historical role field remains immutable.

## Idempotency and concurrency

The server ignores the client-supplied digest as authority. It removes
`commandDigest` from the JSON command and calculates a server-owned SHA-256
digest over the remaining canonical `jsonb` envelope.

Each command uses transaction-scoped advisory locks for:

- advisor + command type + idempotency key;
- advisor + source identity;
- advisor + new person reference;
- advisor + carrier + Policy number;
- advisor + Policy reference.

Identical replay returns the original durable receipt. Reusing one idempotency
key with changed input creates `CHANGED_INPUT_REPLAY` conflict evidence and does
not execute the new canonical mutation.

## Repository acceptance

```text
NEW_RPC_MIGRATION=PASS_STATIC_CONTRACT
GOVERNED_COMMAND_TESTS=9
GOVERNED_COMMAND_PASS=9
GOVERNED_COMMAND_FAIL=0
DIRECT_TABLE_WRITE_GRANTS=NONE
PRODUCT_UI_DIFF=NONE
REMOTE_DEPLOYMENT=NOT_RUN
REMOTE_TRANSACTIONAL_ACCEPTANCE=NOT_RUN
```

The repository tests prove contract shape and safety markers. They do not claim
that the migration has been applied to Supabase or that cross-advisor behavior
has been exercised against the remote database.

## Remaining before 010B closure

1. Run the complete repository workflow on the final branch head.
2. Authorize and deploy migrations `20260731000200` through `20260731000212`
   through a separate remote gate.
3. Execute transactional acceptance for identity create/link/correct, Policy
   create/version, multi-party roles, identical replay and changed-input conflict.
4. Prove cross-advisor denial, restricted beneficiary reads and direct-write
   revocation.
5. Roll back all remote fixtures and prove zero residue.
6. Record evidence, close 010B and authorize 010C.
