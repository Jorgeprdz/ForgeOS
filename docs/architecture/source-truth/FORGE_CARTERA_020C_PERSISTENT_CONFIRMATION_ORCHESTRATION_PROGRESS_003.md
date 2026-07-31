# FORGE CARTERA 020C — Persistent Confirmation Orchestration Progress 003

```text
PHASE=CARTERA_020C_PERSISTENT_CONFIRMATION_ORCHESTRATION
SOURCE_BRANCH=feature/cartera-020c-identity-policy-confirmation-review
SOURCE_COMMIT=6d072cd65d44a470df8069680fca11d737c1d910
PERSISTENT_CONFIRMATION_ORCHESTRATION=REPOSITORY_READY
SCHEMA_MUTATION=REPOSITORY_ONLY
SUPABASE_REMOTE_MUTATION=NO
PRODUCT_UI_MUTATION=NO
ACCOUNT_MUTATION=NOT_AUTHORIZED
CARTERA_020C_COMPLETE=NO
NEXT=CARTERA_020C_PERSISTENT_CONFIRMATION_REMOTE_ACCEPTANCE
```

## Purpose

This cut converts the accepted CARTERA 020C review and governed command composition into a durable, owner-scoped execution lifecycle without bypassing CARTERA 010B mutation authority.

The orchestration remains deliberately split into two explicit authorizations:

```text
authenticated advisor
→ persist reviewed Identity command batch
→ explicitly authorize Identity execution
→ execute exactly one governed Identity command per step
→ persist attempt and receipt
→ verify CARTERA 010B receipt, confirmed Person, decision and active source link
→ stop on conflict or enter bounded RETRY_WAIT
→ expose sanitized durable Identity results
→ compose Policy only from verified durable results
→ explicitly authorize confirmed Policy persistence
→ execute the accepted CARTERA 010B confirmed Policy RPC
→ verify canonical Policy, PolicyVersion, EvidenceVersion and exact PolicyRole count
→ advance the governed 020B Inbox item to confirmed
```

## Durable authorities

Repository migrations add five owner-scoped operational authorities:

- `cartera020c_confirmation_reviews`: optimistic lifecycle state, authorization digests, counters and final references;
- `cartera020c_confirmation_commands`: ordered owner-private Identity and Policy command payloads;
- `cartera020c_confirmation_attempts`: append-only execution attempt evidence;
- `cartera020c_confirmation_transitions`: append-only lifecycle history without contact or beneficiary values;
- `cartera020c_confirmation_conflicts`: deterministic changed-input, result and read-after-write conflicts.

These tables are operational orchestration authority only. They do not become Person, Account, Policy or PolicyRole truth.

## Authenticated RPC surface

```text
forge_cartera020c_prepare_identity_orchestration(jsonb)
forge_cartera020c_attach_policy_confirmation(jsonb)
forge_cartera020c_execute_next_confirmation_step(text, integer)
forge_cartera020c_get_confirmation_status(text)
forge_cartera020c_retry_confirmation(text, integer, timestamptz)
```

Each public RPC binds `auth.uid()`. Direct table writes and direct table reads remain revoked. Status is returned only through a sanitized owner-scoped projection that excludes command payloads, contact values and beneficiary details.

## Ordered mutation authority

The executor may invoke only the previously accepted CARTERA 010B authorities:

```text
forge_cartera010b_confirm_identity_resolution(command_payload)
forge_cartera010b_confirm_policy_with_parties(command_payload)
```

It does not directly insert, update or delete:

```text
commercial_people
commercial_accounts
canonical_policies
policy_versions
policy_evidence_versions
policy_roles
```

Identity commands must all reach durable `SUCCEEDED` and pass read-after-write verification before the Policy command can be attached or executed.

## Identity verification

A successful Identity receipt is insufficient by itself. The executor verifies, within the same transaction:

- the owner-scoped `cartera010b_command_receipts` row and server command digest;
- the exact confirmed `commercial_people` row;
- the matching `identity_resolution_decisions` row for new confirmations;
- the active `commercial_source_identity_links` row for the reviewed source candidate;
- the expected candidate, Person, outcome and idempotency key.

Any mismatch records an append-only conflict and blocks the review. The Policy stage remains unavailable.

## Policy verification

A successful confirmed Policy receipt is also verified against:

- the owner-scoped `cartera010b_command_receipts` row;
- the exact `canonical_policies` reference and current version;
- the exact `policy_versions` reference and version number;
- the exact `policy_evidence_versions` reference;
- the exact count of `policy_roles` persisted for that PolicyVersion.

Only after all checks pass does the governed 020B Inbox lifecycle advance from `confirmation_required` to `confirmed`. The immutable 020B PolicyEvidencePacket remains unchanged as evidence history.

## Retry and conflict behavior

```text
OPTIMISTIC_STATE_VERSION=REQUIRED
ONE_COMMAND_PER_EXECUTION_STEP=LOCKED
MAX_AUTOMATED_ATTEMPTS=5
RETRY_STATE=RETRY_WAIT
EARLY_RETRY=FORBIDDEN
CHANGED_INPUT_REPLAY=BLOCKING_CONFLICT
IDENTITY_RESULT_CONFLICT=BLOCKING_CONFLICT
POLICY_RESULT_CONFLICT=BLOCKING_CONFLICT
READ_AFTER_WRITE_MISMATCH=BLOCKING_CONFLICT
```

Transient execution failures enter a durable retry state with bounded exponential delay. Retrying is a separate authenticated action and cannot bypass `nextRetryAt` or optimistic state control.

## Account boundary

```text
ACCOUNT_MATCH_READ=OWNER_SCOPED
EXISTING_ACCOUNT_LINK=EXPLICIT_ONLY
ACCOUNT_CREATION_RPC=ABSENT
ACCOUNT_INSERT=FORBIDDEN
ACCOUNT_UPDATE=FORBIDDEN
ACCOUNT_DELETE=FORBIDDEN
ACCOUNT_MUTATION=NOT_AUTHORIZED
```

The orchestrator validates that every linked Account already exists, is owner-scoped, confirmed and active. It never creates or edits an Account.

## Privacy boundary

```text
DIRECT_ORCHESTRATION_TABLE_READ=REVOKED
STATUS_RPC=OWNER_SCOPED_SANITIZED
COMMAND_PAYLOAD_PROJECTION=FORBIDDEN
CONTACT_VALUE_PROJECTION=FORBIDDEN
BENEFICIARY_DETAIL_PROJECTION=FORBIDDEN
RESTRICTED_POLICY_DATA_FLAG=BOOLEAN_ONLY
```

Policy command payloads may contain restricted role data because they must reach the accepted 010B mutation authority. They remain owner-private and are never returned by the general status RPC.

## Repository acceptance

```text
CARTERA_020C_EXISTING_TESTS=30
PERSISTENT_ORCHESTRATION_SERVICE_TESTS=17
PERSISTENT_ORCHESTRATION_CONTRACT_TESTS=15
CARTERA_020C_TESTS=62
CARTERA_020C_PASS=62
INHERITED_CONFIRMATION_TESTS=3
INHERITED_CONFIRMATION_PASS=3
TOTAL_TARGETED_TESTS=65
TOTAL_TARGETED_PASS=65
TOTAL_TARGETED_FAIL=0
JAVASCRIPT_SYNTAX=PASS
SCHEMA_CONTRACT_CHECKS=PASS
PRODUCT_UI_DIFF=NONE
SUPABASE_REMOTE_MUTATION=NONE
```

This is not remote acceptance. The next gate must apply the migrations to the governed Supabase environment, execute authenticated productive-path and failure-path checks, verify replay/concurrency/rollback behavior and publish immutable remote evidence.

```text
CARTERA_020C_REVIEW_READ_MODEL=REPOSITORY_READY
CARTERA_020C_PERSON_ACCOUNT_POLICY_RECONCILIATION=REPOSITORY_READY
CARTERA_020C_GOVERNED_COMMAND_COMPOSER=REPOSITORY_READY
CARTERA_020C_PERSISTENT_CONFIRMATION_ORCHESTRATION=REPOSITORY_READY
IDENTITY_RESULT_VERIFICATION=LOCKED
RETRY_SAFE_ORDERED_EXECUTION=LOCKED
IDENTITY_READ_AFTER_WRITE=LOCKED
POLICY_READ_AFTER_WRITE=LOCKED
ACCOUNT_MUTATION=NOT_AUTHORIZED
CARTERA_020C_COMPLETE=NO
NEXT=CARTERA_020C_PERSISTENT_CONFIRMATION_REMOTE_ACCEPTANCE
```
