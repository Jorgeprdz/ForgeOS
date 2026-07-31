# FORGE CARTERA 020C — GOVERNED COMMAND COMPOSER PROGRESS 002

Forge OS
Architecture Source Truth
Cartera / Governed Evidence Confirmation

## Status

```text
PHASE=CARTERA_020C_GOVERNED_COMMAND_COMPOSER
STATUS=REPOSITORY_IMPLEMENTED_PENDING_PERSISTENT_ORCHESTRATION
SOURCE_BRANCH=feature/cartera-010b-commercial-person-policy-role-foundation
SOURCE_COMMIT=528533e5ba6e060a844e5facbc127eea145542b9
IMPLEMENTATION_BRANCH=feature/cartera-020c-identity-policy-confirmation-review
IMPLEMENTATION_CUT_HEAD=6d072cd65d44a470df8069680fca11d737c1d910
SCHEMA_MUTATION=NO
SUPABASE_REMOTE_MUTATION=NO
PRODUCT_UI_MUTATION=NO
RPC_EXECUTION=NO
CARTERA_020C_COMPLETE=NO
NEXT=CARTERA_020C_PERSISTENT_CONFIRMATION_ORCHESTRATION
```

## Purpose

This cut converts the accepted 020C review read model into strict, deterministic
010B command payloads without executing them. It preserves the required
identity-before-Policy order and prevents review candidates from becoming Truth
through composition alone.

## Two-stage command sequence

```text
accepted 020C review
→ explicit Person decisions
→ explicit existing-Account decisions
→ FORGE_IDENTITY_RESOLUTION_COMMAND batch
→ later explicit RPC execution
→ verify durable Identity receipts
→ explicit field, role and duplicate-Policy decisions
→ FORGE_CONFIRMED_POLICY_COMMAND
→ later explicit final execution
```

The confirmed Policy command cannot be composed from an unresolved or conflict
Identity result. Successful Identity receipts must identify the exact command,
selected Person and idempotency key and must contain a valid server digest.

## Reused governed contracts

The composer emits only the already accepted 010B mutation contracts:

```text
FORGE_IDENTITY_RESOLUTION_COMMAND / CARTERA-010B.1
FORGE_CONFIRMED_POLICY_COMMAND / CARTERA-010B.1
```

The implementation reuses the canonical 010B contract validator and therefore
preserves strict key sets, canonical enum values, deterministic client command
digests and immutable payloads. The server remains authoritative for the final
SHA-256 command digest when an RPC is eventually executed.

## Identity command batch

`composeCartera020cIdentityCommandBatch` requires one explicit decision for
every Person and Account candidate.

Person decisions may:

- link a reconciled confirmed Person;
- create a Person only with the complete strict 010B new-Person payload;
- correct an existing source link only with one explicit replacement Person.

No Person is automatically selected from name, phone or email matches. Matching
values remain private review inputs.

The command source identity is deterministically bound to the 020C candidate:

```text
sourceDomain=CARTERA_EVIDENCE
sourceIdentityType=POLICY_PACKET_IDENTITY_CANDIDATE
sourceRecordReference=<identity candidate reference>
```

Idempotency keys are deterministic over the review, packet, candidate, decision,
selected/new Person and decision timestamp.

## Account boundary

010B exposes no governed Account-creation RPC in this phase. Consequently 020C
may only link a reconciled, already confirmed `CommercialAccount` reference.

```text
ACCOUNT_LINK_EXISTING=AUTHORIZED
ACCOUNT_CREATE=NOT_AUTHORIZED
ACCOUNT_DIRECT_WRITE=FORBIDDEN
REQUIRED_ACCOUNT_SKIP=FORBIDDEN
```

This preserves `CommercialPerson` and `CommercialAccount` as distinct canonical
entities and prevents a generic client identity from being invented.

## Identity result verification

`verifyCartera020cIdentityCommandResults` accepts only:

```text
status=CONFIRMED | ALREADY_LINKED
receipt.idempotencyKey=command.idempotencyKey
receipt.personReference=expected selected/created Person
receipt.serverCommandDigest=<64 lowercase hex characters>
```

A conflict, mismatched Person, mismatched idempotency key, invalid digest or
incomplete result set stops the Policy stage.

## Confirmed Policy composition

`composeCartera020cConfirmedPolicyPlan` composes the strict Policy vertical only
after verified Identity results. It requires:

- an explicit decision for every extracted general field;
- reviewer identity and review timestamp per field;
- reviewed or confirmed Evidence;
- one explicit participant and confirmation decision per PolicyRole;
- an explicit duplicate-Policy decision;
- exact previous-version lineage for `UPDATE_EXISTING`;
- current version 1 and no previous lineage for `CREATE_NEW`.

Field claims preserve:

```text
candidateValue
confirmedValue
candidateState
confidence
sourceLocation
extractionMethod
parserId
parserVersion
evidenceReference
reviewedBy
reviewedAt
```

Unknown premium, currency, payment frequency and sum insured remain `null`; the
composer introduces no commercial defaults.

## PolicyRole vocabulary and privacy

Review vocabulary is translated to the canonical 010B command vocabulary:

```text
OWNER → POLICY_OWNER
RESTRICTED → RESTRICTED_ROLE_VIEW
```

Beneficiary roles always require `RESTRICTED_ROLE_VIEW` and restricted privacy.
Each role contains exactly one verified Person or existing confirmed Account
reference. No beneficiary detail enters a general projection or log.

## Execution boundary

The composer contains no Supabase client, `.rpc(...)`, table mutation or direct
canonical write. Every returned envelope declares:

```text
createsTruth=false
invokesRemoteCommand=false
requiresExplicitExecution=true
```

Persistent lifecycle, retries, receipt storage, read-after-write verification and
actual ordered RPC invocation belong to the separately gated next cut.

## Repository acceptance target

```text
CARTERA_020C_TESTS=30
CARTERA_020C_PASS=30
INHERITED_CONFIRMATION_TESTS=3
INHERITED_CONFIRMATION_PASS=3
TOTAL_TARGETED_TESTS=33
TOTAL_TARGETED_PASS=33
TOTAL_TARGETED_FAIL=0
SCHEMA_DIFF=NONE
PRODUCT_UI_DIFF=NONE
SUPABASE_REMOTE_MUTATION=NONE
RPC_EXECUTION=NONE
```

## Exit markers

```text
CARTERA_020C_REVIEW_READ_MODEL=REPOSITORY_READY
CARTERA_020C_PERSON_ACCOUNT_POLICY_RECONCILIATION=REPOSITORY_READY
CARTERA_020C_GOVERNED_COMMAND_COMPOSER=REPOSITORY_READY
IDENTITY_RESULT_VERIFICATION=LOCKED
ACCOUNT_MUTATION=NOT_AUTHORIZED
IDENTITY_BEFORE_POLICY_ORDER=LOCKED
CONFIRMATION_PLAN_EXECUTION=EXPLICIT_ONLY
CARTERA_020C_COMPLETE=NO
NEXT=CARTERA_020C_PERSISTENT_CONFIRMATION_ORCHESTRATION
```
