# FORGE CARTERA 020C — IDENTITY AND POLICY CONFIRMATION REVIEW SCOPE 001

Forge OS
Architecture Source Truth
Cartera / Governed Evidence Confirmation

## Status

`SCOPE_LOCKED / FIRST_CONTRACT_CUT_REPOSITORY_READY / PRODUCTIVE_EXECUTION_NOT_STARTED`

## Execution identity

```text
PROGRAM=FORGE_CARTERA_RELATIONSHIP_INTELLIGENCE
AUTHORIZED_PHASE=CARTERA_020C_IDENTITY_AND_POLICY_CONFIRMATION_REVIEW
SOURCE_BRANCH=feature/cartera-010b-commercial-person-policy-role-foundation
SOURCE_COMMIT=528533e5ba6e060a844e5facbc127eea145542b9
IMPLEMENTATION_BRANCH=feature/cartera-020c-identity-policy-confirmation-review
CARTERA_020B_COMPLETE=YES
CARTERA_020B_REMOTE_ACCEPTED=YES
SCHEMA_MUTATION=NO_FIRST_CUT
SUPABASE_REMOTE_MUTATION=NO
PRODUCT_UI_MUTATION=NO_FIRST_CUT
```

## Purpose

Connect the accepted 020B pending-confirmation Evidence foundation to the deployed 010B identity and confirmed-Policy authorities through an explicit advisor review boundary.

020C owns identity review, Account and PolicyRole candidate review, restricted beneficiary review, duplicate-Policy decisions, deterministic command preparation, ordered execution and the later productive review UI.

This first cut defines contracts only. It does not persist review tasks, execute RPCs, add migrations or mutate the Cartera route.

## Canonical sequence

```text
pending PolicyEvidencePacket
→ evidence and field review
→ identity candidate review
→ Person link/create/reject/conflict decision
→ Account candidate review when applicable
→ PolicyRole participant review
→ restricted-party review
→ existing-Policy duplicate/conflict decision
→ prepare identity commands
→ execute and verify identity resolution
→ prepare confirmed Policy command
→ explicit final advisor confirmation
→ execute confirmed Policy command
→ resolve Evidence review
```

The confirmed Policy command cannot run before all required identity decisions succeed.

## Reused authorities

```text
forge_cartera010b_confirm_identity_resolution(jsonb)
forge_cartera010b_confirm_policy_with_parties(jsonb)
```

020C emits the existing contracts only:

```text
FORGE_IDENTITY_RESOLUTION_COMMAND / CARTERA-010B.1
FORGE_CONFIRMED_POLICY_COMMAND / CARTERA-010B.1
```

Direct writes to CommercialPerson, canonical Policy, Policy versions, Evidence versions or PolicyRole tables remain forbidden.

The historical generic advisor confirmation gate is preserved for existing consumers, but it is not promoted as the productive 020C authority because it mixes Policy, Payment and Commission paths and does not enforce identity-before-Policy ordering.

## Review contract

```text
FORGE_IDENTITY_POLICY_CONFIRMATION_REVIEW
CARTERA-020C.1
```

Required ownership:

- review reference;
- advisor reference;
- actor reference equal to the advisor;
- packet reference;
- source reference.

A packet is admissible only when:

```text
confirmationState=pending_confirmation | PENDING_CONFIRMATION
createsTruth=false
canInvokeConfirmedPolicyCommand=false
```

Every identity, Account, PolicyRole and duplicate-Policy candidate must also declare:

```text
createsTruth=false
```

## Review states

```text
PENDING_REVIEW
BLOCKED
READY_TO_CONFIRM
REJECTED
CONFIRMED
```

Missing evidence, low-confidence material fields, sensitive fields, absent identity candidates, absent PolicyRole candidates, unresolved duplicate decisions, unresolved required identities and unconfirmed roles block confirmation.

`READY_TO_CONFIRM` means a deterministic plan may be presented. It does not mean commands have executed.

## Identity review

Allowed decisions remain:

```text
LINK_CONFIRMED
CREATE_CONFIRMED
UNRESOLVED
REJECTED_MATCH
CONFLICT
CORRECTED
```

Only `LINK_CONFIRMED`, `CREATE_CONFIRMED` and `CORRECTED` may satisfy a required Policy participant.

No candidate may be preselected. New-person creation requires the complete strict 010B payload, privacy classification and explicit advisor action. Phone, email or normalized name may not cause silent merge.

## Account boundary

CommercialAccount remains distinct from CommercialPerson. Person and Account references cannot collapse into a generic client ID.

This first cut introduces no Account mutation. Any missing governed Account-membership command requires separate authorization.

## PolicyRole and beneficiary privacy

Every PolicyRole candidate requires an explicit participant and confirmation decision.

Beneficiary roles are restricted:

```text
ROLE_TYPE=BENEFICIARY
VISIBILITY_SCOPE=RESTRICTED
GENERAL_REVIEW_PROJECTION=FORBIDDEN
GENERAL_DIRECTORY_PROJECTION=FORBIDDEN
```

Restricted-party details must not enter general Cartera cards, search indexes, logs or ordinary artifacts.

## Existing-Policy decision

The advisor must explicitly select:

```text
CREATE_NEW
UPDATE_EXISTING
BLOCK_AS_DUPLICATE
UNRESOLVED
```

`UNRESOLVED` cannot advance. Duplicate candidates cannot be silently ignored.

## Field review

Confirmed fields preserve candidate value, advisor edit, confidence, source location, extraction method, parser identity/version, Evidence reference, reviewer and review time.

Unknown values remain `null` or explicit `UNKNOWN`.

Forbidden defaults include:

- premium zero;
- MXN currency;
- active status;
- payment frequency;
- carrier;
- product;
- participant identity.

## Confirmation plan

```text
FORGE_IDENTITY_POLICY_CONFIRMATION_PLAN
CARTERA-020C.1
```

Required order:

```text
IDENTITY_RESOLUTION
CONFIRMED_POLICY
```

The plan contains payloads but executes nothing:

```text
createsTruth=false
invokesRemoteCommand=false
requiresExplicitExecution=true
```

The later productive orchestrator must bind the authenticated advisor, use deterministic idempotency, verify identity read-after-write, stop on conflict and invoke confirmed Policy only after all required participants resolve.

## First-cut paths

Allowed:

```text
policy-operations/intake/cartera-020c-*.js
tests/cartera-020c-*.mjs
docs/architecture/source-truth/FORGE_CARTERA_020C_*.md
.github/workflows/cartera-020c-*.yml
.github/workflows/cartera-020b-foundation.yml  # bounded retirement only
```

Blocked:

- Supabase migrations;
- `cartera.js`;
- Product UI;
- RPC execution;
- remote mutation;
- storage mutation;
- Payment or Commission confirmation;
- Pipeline, Quote, Calendar, message, task, compensation or opportunity effects.

## Following implementation cuts

### 020C.1 — Review read model and candidate reconciliation

Load pending packet authorities, reconcile owner-scoped Person/Account/Policy candidates, separate restricted roles and expose explicit blockers.

### 020C.2 — Governed command composer

Build strict identity commands, verify their results, then build the strict confirmed Policy command with deterministic replay behavior.

### 020C.3 — Persistent confirmation orchestration

Add durable review lifecycle and retry-safe ordered execution only through a separately accepted persistence and remote gate.

### 020C.4 — Cartera review UI

Add the productive pending-review experience, explicit final confirmation, restricted-party privacy, desktop/mobile browser acceptance and safe bottom scroll space above the floating navigation pill.

## Negative gates

020C must not auto-select or auto-create Person, Account, Policy or PolicyRole truth; call confirmed Policy before identity resolution; expose beneficiary data generally; default unknown facts; infer consent; create Payment, payout, commission, revenue, tasks, Calendar events, messages, opportunities or recommendations; or execute remote mutation in this cut.

## First-cut exit gate

```text
SOURCE_COMMIT_VERIFIED=YES
CARTERA_020B_INTEGRATED=YES
INHERITED_020B_GATE_RETIREMENT=BOUNDED
IDENTITY_REVIEW_CONTRACT=REPOSITORY_READY
POLICY_ROLE_REVIEW_CONTRACT=REPOSITORY_READY
DUPLICATE_POLICY_DECISION=LOCKED
RESTRICTED_BENEFICIARY_BOUNDARY=LOCKED
IDENTITY_BEFORE_POLICY_ORDER=LOCKED
CONFIRMATION_PLAN_EXECUTION=EXPLICIT_ONLY
SCHEMA_MUTATION=NO
SUPABASE_REMOTE_MUTATION=NO
PRODUCT_UI_MUTATION=NO
CARTERA_020C_COMPLETE=NO
NEXT=CARTERA_020C_REVIEW_READ_MODEL_AND_CANDIDATE_RECONCILIATION
```
