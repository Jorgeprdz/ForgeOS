# FORGE CARTERA 020C — IDENTITY AND POLICY CONFIRMATION REVIEW SCOPE 001

Forge OS  
Architecture Source Truth  
Cartera / Governed Evidence Confirmation

## Status

`SCOPE_LOCKED / FIRST_CONTRACT_CUT_REPOSITORY_READY / PRODUCTIVE_EXECUTION_NOT_STARTED`

## Date

2026-07-31

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

Connect the accepted 020B pending-confirmation Evidence foundation to the already deployed 010B identity and confirmed-Policy authorities through one explicit advisor review boundary.

020C owns:

- productive identity review;
- person-link versus new-person decision;
- Account candidate review when relevant;
- PolicyRole participant review;
- restricted beneficiary review;
- existing-Policy duplicate/conflict decision;
- field and evidence review;
- deterministic command preparation;
- ordered execution of identity decisions before confirmed Policy persistence;
- review UI and productive command orchestration in later bounded cuts.

This first cut locks the contract and sequencing boundary. It does not yet persist review tasks, invoke Supabase RPCs or mutate the Cartera route.

---

# 1. Dependency gate

The accepted source contains:

- CARTERA 010B canonical CommercialPerson, CommercialAccount, Policy and PolicyRole persistence;
- `forge_cartera010b_confirm_identity_resolution(jsonb)`;
- `forge_cartera010b_confirm_policy_with_parties(jsonb)`;
- owner-scoped RLS and direct-write denial;
- CARTERA 020B persistent Evidence source, inbox, extraction, candidate and pending packet authorities;
- accepted admission, lease, retry, replay, RLS and concurrency behavior;
- no automatic Person, Policy or PolicyRole creation from parser output.

```text
CARTERA_020B_COMPLETE=YES
PENDING_POLICY_EVIDENCE_PACKET=AVAILABLE
IDENTITY_RESOLUTION_AUTHORITY=DEPLOYED
CONFIRMED_POLICY_AUTHORITY=DEPLOYED
CARTERA_020C_AUTHORIZED=YES
```

---

# 2. Canonical productive sequence

```text
pending PolicyEvidencePacket
→ advisor opens confirmation review
→ evidence and field review
→ identity candidate review
→ Person link/create/reject/conflict decision
→ Account candidate review when applicable
→ PolicyRole participant review
→ restricted-party review
→ existing-Policy duplicate/conflict decision
→ prepare governed identity commands
→ execute identity commands
→ verify resolved canonical participant references
→ prepare governed confirmed Policy command
→ explicit final advisor confirmation
→ execute confirmed Policy command
→ mark Evidence review resolved
```

The confirmed Policy command must never run before required identity decisions have succeeded.

No review suggestion, confidence score, parser output or preselected option creates canonical truth.

---

# 3. Existing authority reuse

## 3.1 Identity mutation — `REUSE_CANONICAL`

```text
forge_cartera010b_confirm_identity_resolution(jsonb)
```

020C must emit only the existing strict contract:

```text
FORGE_IDENTITY_RESOLUTION_COMMAND
CARTERA-010B.1
```

Allowed outcomes remain:

- `LINK_CONFIRMED`;
- `CREATE_CONFIRMED`;
- `UNRESOLVED`;
- `REJECTED_MATCH`;
- `CONFLICT`;
- `CORRECTED`.

Only resolved outcomes may advance a required Policy participant into the final Policy command.

## 3.2 Confirmed Policy mutation — `REUSE_CANONICAL`

```text
forge_cartera010b_confirm_policy_with_parties(jsonb)
```

020C must emit only the existing strict contract:

```text
FORGE_CONFIRMED_POLICY_COMMAND
CARTERA-010B.1
```

The command remains responsible for canonical Policy, Policy version, Evidence version and PolicyRole persistence.

020C must not write those tables directly.

## 3.3 Evidence confirmation primitives — `REUSE_WITH_STRICT_ADAPTER`

- `policy-operations/evidence-inbox/evidence-confirmation-task.js`;
- `policy-operations/policy-advisor-confirmation-gate.js`;
- `policy-operations/evidence/policy-evidence-packet.js`.

The historical generic advisor gate mixes Policy, Payment and Commission confirmation and transforms fields into operational objects without the 010B identity/Policy command sequencing required here. It is not the productive 020C command authority.

020C therefore adds a bounded Policy confirmation-review adapter while preserving the generic primitives for their existing consumers.

---

# 4. Review contract

The first repository contract is:

```text
FORGE_IDENTITY_POLICY_CONFIRMATION_REVIEW
CARTERA-020C.1
```

Required ownership:

- `reviewReference`;
- `advisorId`;
- `actorReference` equal to the authenticated advisor;
- `packetReference`;
- `sourceReference`.

Required candidate groups:

- identity candidates;
- Account candidates when present;
- PolicyRole candidates;
- duplicate/existing Policy candidates;
- missing evidence;
- low-confidence fields;
- sensitive fields.

Every candidate remains:

```text
createsTruth=false
```

A packet is admissible only when:

```text
confirmationState=pending_confirmation | PENDING_CONFIRMATION
createsTruth=false
canInvokeConfirmedPolicyCommand=false
```

---

# 5. Review states

```text
PENDING_REVIEW
BLOCKED
READY_TO_CONFIRM
REJECTED
CONFIRMED
```

The review is `BLOCKED` while any required condition remains unresolved, including:

- missing evidence;
- low-confidence material field;
- sensitive field requiring explicit review;
- absent identity candidates;
- absent PolicyRole candidates;
- unresolved duplicate-Policy decision;
- unresolved required identity;
- unconfirmed PolicyRole participant;
- restricted role without restricted visibility.

`READY_TO_CONFIRM` means a deterministic command plan can be presented for final execution. It does not mean the commands have run.

---

# 6. Identity review

For each required person candidate, the advisor must explicitly choose one outcome.

No default choice is allowed.

## Link existing Person

Requires:

- selected owner-scoped confirmed `CommercialPerson` reference;
- candidate evidence;
- explicit `LINK_CONFIRMED` decision.

## Create new Person

Requires:

- explicit `CREATE_CONFIRMED` decision;
- complete strict new-person payload accepted by 010B;
- no silent phone/email/name merge;
- explicit privacy classification.

## Unresolved or conflict

`UNRESOLVED`, `REJECTED_MATCH` and `CONFLICT` remain valid review outcomes but cannot satisfy a required Policy participant for final confirmation.

## Correction

`CORRECTED` must preserve prior decision lineage and cannot silently replace identity history.

---

# 7. Account review

A `CommercialAccount` candidate remains a distinct entity from a Person.

020C may:

- select an existing owner-scoped Account;
- propose an Account relationship;
- reject an Account match;
- leave the Account unresolved when the Policy does not require it.

020C must not collapse Person and Account references into one client identifier.

Any Account membership persistence requires an existing governed authority or a separately authorized additive command. This first cut introduces no Account mutation.

---

# 8. PolicyRole review and privacy

Each PolicyRole candidate requires:

- candidate reference;
- role type;
- participant state;
- selected canonical Person or Account reference after identity review;
- confirmation state;
- visibility scope;
- evidence references;
- effective range when applicable.

General participant roles may enter the normal review projection.

Beneficiary roles are restricted:

```text
ROLE_TYPE=BENEFICIARY
VISIBILITY_SCOPE=RESTRICTED
GENERAL_REVIEW_PROJECTION=FORBIDDEN
GENERAL_DIRECTORY_PROJECTION=FORBIDDEN
```

Restricted roles still require explicit advisor review, but their details must remain outside general Cartera cards, search indexes, logs and ordinary artifacts.

---

# 9. Existing-Policy decision

The advisor must explicitly select one outcome:

```text
CREATE_NEW
UPDATE_EXISTING
BLOCK_AS_DUPLICATE
UNRESOLVED
```

`UNRESOLVED` cannot advance to confirmation.

## CREATE_NEW

Requires no unresolved carrier + policy-number collision candidate.

## UPDATE_EXISTING

Requires an owner-scoped canonical Policy reference and a version/correction plan compatible with the 010B command.

## BLOCK_AS_DUPLICATE

Resolves the review without creating Policy Truth.

No duplicate candidate may be silently ignored.

---

# 10. Field review

Every confirmed field must preserve:

- original candidate state;
- candidate value;
- advisor edit when present;
- confidence;
- source location;
- extraction method;
- parser identity and version;
- Evidence source reference;
- reviewer identity and time.

Unknown values remain `null` or explicit `UNKNOWN`.

020C must not default:

- premium to zero;
- currency to MXN;
- status to active;
- payment frequency;
- carrier;
- product;
- participant identity.

A materially edited field must remain distinguishable from an extracted and merely confirmed field.

---

# 11. Command plan

The deterministic plan contract is:

```text
FORGE_IDENTITY_POLICY_CONFIRMATION_PLAN
CARTERA-020C.1
```

Required order:

```text
IDENTITY_RESOLUTION
CONFIRMED_POLICY
```

The plan contains command payloads but does not execute them.

```text
createsTruth=false
invokesRemoteCommand=false
requiresExplicitExecution=true
```

The productive orchestrator must later provide:

- exact authenticated advisor binding;
- per-command idempotency keys;
- read-after-write identity verification;
- fail-closed stop after any conflict or rejection;
- final confirmed Policy invocation only after all required participants resolve;
- exact response and receipt persistence;
- retry-safe behavior without duplicate Person or Policy creation.

---

# 12. First-cut allowed paths

```text
policy-operations/intake/cartera-020c-*.js
tests/cartera-020c-*.mjs
docs/architecture/source-truth/FORGE_CARTERA_020C_*.md
.github/workflows/cartera-020c-*.yml
```

Blocked in this cut:

- Supabase migrations;
- `cartera.js`;
- Product UI;
- direct RPC execution;
- remote Supabase mutation;
- storage mutation;
- Payment or Commission confirmation;
- Pipeline, Quote, Calendar, message, task, compensation or opportunity behavior.

---

# 13. Required implementation cuts after scope acceptance

## 020C.1 — Review read model and candidate reconciliation

- load pending packet and candidate authorities;
- owner-bound Person, Account and Policy candidate lookup;
- restricted role separation;
- explicit blockers and review state.

## 020C.2 — Governed command composer

- strict identity command creation;
- read-after-write identity resolution;
- strict confirmed Policy command creation;
- deterministic idempotency and conflict behavior.

## 020C.3 — Persistent confirmation tasks and orchestration

- durable review lifecycle;
- retry-safe ordered execution;
- receipts and failure state;
- no automatic confirmation.

Any new schema or RPC requires a separate repository proposal and remote acceptance gate.

## 020C.4 — Cartera review UI

- pending-review inbox;
- evidence and field review;
- identity selector/create proposal;
- Account and PolicyRole review;
- duplicate-Policy choice;
- explicit final confirmation;
- restricted-party privacy;
- desktop/mobile browser acceptance;
- safe bottom scroll space above the floating navigation pill.

---

# 14. Required first-cut tests

1. only pending non-truth packets enter review;
2. advisor and actor must match;
3. candidates cannot claim to create truth;
4. missing evidence and low-confidence fields block confirmation;
5. identity decisions must cover every candidate;
6. unresolved identity cannot advance;
7. duplicate-Policy decision is explicit;
8. every PolicyRole candidate is explicitly confirmed;
9. beneficiary visibility is restricted;
10. beneficiary candidates are excluded from general projection;
11. the plan orders identity before Policy;
12. the plan does not execute RPCs;
13. unknown field values are not defaulted;
14. no Product UI, schema or remote mutation occurs.

---

# 15. Global negative gates

020C must not:

- auto-select a Person match;
- auto-create or merge a Person;
- auto-select an Account;
- auto-create a Policy;
- auto-write PolicyRole rows;
- call the confirmed Policy command before identity resolution;
- silently ignore duplicate candidates;
- expose beneficiary data in general projections;
- promote parser confidence into consent;
- default unknown values;
- infer communication consent;
- create Payment, payout, commission or revenue truth;
- create tasks, calendar events, messages, opportunities or recommendations;
- execute remote mutation in the first cut.

---

# 16. First-cut exit gate

```text
SOURCE_COMMIT_VERIFIED=YES
CARTERA_020B_INTEGRATED=YES
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
