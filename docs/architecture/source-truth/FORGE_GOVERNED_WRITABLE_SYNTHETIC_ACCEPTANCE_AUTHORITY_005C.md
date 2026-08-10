# Forge Governed Writable Synthetic Acceptance Authority 005C

```text
PHASE=FORGE_GOVERNED_WRITABLE_SYNTHETIC_ACCEPTANCE_AUTHORITY_005C
SHORT_NAME=WRITABLE_SYNTHETIC_ACCEPTANCE_005C
MODE=SECURITY_AND_ACCEPTANCE_INFRASTRUCTURE
BASE_SHA=9289197780efd23d70be7528a1191e0509cdae40
PREVIOUS_PHASE=FORGE_CARTERA_PIPELINE_IDENTITY_PRODUCTIVE_ACCEPTANCE_005B
PREVIOUS_PR=329
PREVIOUS_FAILURE_CLASS=AUTHORITY_GAP
PREVIOUS_PRODUCT_DEFECT=NO
```

## Constitutional Gate

Applicable authority:

- Article 0 Ratification 001: Forge strengthens human judgment and preserves explicit human checkpoints.
- `FORGE_CONSTITUTION_V3.md`: privacy-first data separation, no invented truth, advisor-controlled automation, deterministic testing.
- `docs/01-constitution/FORGE_CONSTITUTION_MAP.md`: evidence before opinion, human authority before artificial authority, capability before dependency.
- `docs/00-governance/FORGE_ROBOCOP_DIRECTIVES.md`: complete Constitutional Gate before implementation.
- ADR-001 Evidence Ownership / Source Validity.
- ADR-002 One Metric One Owner.
- ADR-003 Recommendation vs Decision Authority Boundary.
- ADR-004 No Invented Recommendations.
- ADR-006 Policy Truth Boundary.
- ADR-011 Relationship Intelligence Non-Manipulation Boundary.
- ADR-016 / ADR-016A capability and dignity boundaries.
- ADR-023 Advisor OS Productive Home and Core Modules Recovery Execution Authority.
- ADR-024 is not an execution authority for this phase because 05C has no UI/visual scope.
- ADR-025 / ADR-026 are newer but Cartera PDF semantic authorities and do not govern auth/acceptance infrastructure.

```text
CONSTITUTIONAL_GATE=PASS
ARTICLE_0=PASS
SECURITY_BOUNDARY_GATE=PASS
DATA_CLASSIFICATION_GATE=PASS
CONTROL_PLANE_GATE=PASS
DATA_PLANE_GATE=PASS
RLS_GATE=PASS
AUTH_GATE=PASS
SOURCE_TRUTH_GATE=PASS
HUMAN_AUTHORITY_GATE=PASS
MIRANDA_APPROVAL=APPROVED
BOARD_APPROVAL=APPROVED_FOR_SCOPED_ACCEPTANCE_INFRASTRUCTURE
ROBOCOP_UNLOCK_005C=GRANTED
```

## Discovery

Production currently has exactly the integrated synthetic demo identities `PUBLIC_A` and `CONTROL_B`; both are sealed `read_only=true`. 05B proved that reusing those credentials cannot satisfy productive write acceptance without changing their authority.

The existing `forge_demo_advisors` table already supplies the correct single classification surface and the existing `forge_demo_read_only_guard` is already attached to productive domain tables. BETA1 022A proves that domain fixtures can be written through authenticated A/B sessions with the anon key while the privileged controller changes only synthetic-account lifecycle metadata.

No parallel demo database, person authority, Policy authority, Pipeline authority or CRM is required.

## Architectural Decision

```text
ARCHITECTURAL_DECISION=DEDICATED_NON_PUBLIC_SYNTHETIC_ACCEPTANCE_IDENTITIES
ACCEPTANCE_A_KEY=ACCEPTANCE_A
ACCEPTANCE_B_KEY=ACCEPTANCE_B
DATA_CLASS=SYNTHETIC
IS_PUBLIC=false
PURPOSE=AUTOMATED_ACCEPTANCE_ONLY
PUBLIC_DEMO_REUSED=NO
```

The acceptance identities are distinct from `PUBLIC_A` and `CONTROL_B`.

### Control plane

The dedicated `forge-acceptance-admin` Edge Function may use privileged Supabase administration only to:

- create or update the two fixed acceptance Auth identities;
- rotate their credentials;
- classify them in `forge_demo_advisors`;
- open a bounded acceptance window;
- report sanitized acceptance/demo lifecycle status;
- seal the acceptance identities after a run.

It accepts only the fixed actions `PROVISION`, `OPEN`, `SEAL`, and `STATUS`. It accepts no arbitrary SQL, table, RPC, target identity or business-data payload.

### Data plane

All domain writes are executed only by the acceptance runner using:

```text
SUPABASE_ANON_KEY
+ signInWithPassword
+ auth.uid()
+ existing productive RLS
+ existing productive tables/RPCs
```

The data-plane runner must not receive or reference `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_ACCESS_TOKEN`, Management API database/query endpoints, or an admin client.

```text
CONTROL_PLANE_PRIVILEGE != BUSINESS_DATA_AUTHORITY
SERVICE_ROLE_ALLOWED_ONLY_FOR_CONTROL_PLANE=YES
SERVICE_ROLE_ALLOWED_FOR_DOMAIN_WRITES=NO
```

## Fail-closed expiry

05C adds only lifecycle metadata to the existing synthetic-account classifier:

- `is_acceptance`
- `acceptance_purpose`
- `expires_at`

For acceptance identities, the existing domain guard is strengthened so writes are rejected when either:

```text
read_only=true
OR
expires_at IS NULL
OR
expires_at <= now()
```

This makes a lost runner or missed cleanup fail closed without changing public demo behavior.

Public demo rows remain `is_acceptance=false`; their existing `read_only` contract is unchanged.

## Fixture lifecycle

```text
PROVISION
→ AUTHENTICATE
→ OPEN_BOUNDED_WINDOW
→ RUN_AUTHENTICATED_DOMAIN_WRITE
→ VERIFY_RLS_AND_READ_AFTER_WRITE
→ OWNER_SCOPED_ARCHIVE_CLEANUP
→ SEAL
→ ROTATE_ACCEPTANCE_CREDENTIALS
```

No administrative cleanup writes are permitted against `prospects`, `commercial_people`, `commercial_source_identity_links`, `canonical_policies`, `policy_roles` or any other product truth surface.

## AA matrix

05C must productively prove:

- AA-01: dedicated synthetic classification and no public-demo reuse.
- AA-02: A/B authenticate via anon key and password.
- AA-03: A writes a synthetic Prospect through productive RLS.
- AA-04: B cannot read or modify A's Prospect.
- AA-05: no privileged business write.
- AA-06: deterministic rerun yields one fixture identity.
- AA-07: owner-scoped cleanup/reset strategy.
- AA-08: `PUBLIC_A` and `CONTROL_B` remain sealed before/during/after.
- AA-09: acceptance window has database-enforced automatic expiry plus explicit always-seal.
- AA-10: zero real-data exposure.

## Scope

In scope:

- synthetic acceptance identity governance;
- lifecycle metadata and fail-closed expiry;
- dedicated acceptance control plane;
- authenticated acceptance runner;
- workflow gates, tests and evidence.

Out of scope:

- Cartera or Pipeline runtime/UI;
- Identity matching or CommercialPerson architecture;
- Policy Truth changes;
- Activity, Income, Quotes or Product Intelligence;
- public demo content;
- real advisor/client data;
- any new domain source of truth.

## Deployment boundary

Implementation may reach a review-ready PR and static CI without production mutation. Applying the 05C migration or deploying `forge-acceptance-admin` is a separate explicit human `workflow_dispatch` checkpoint.

```text
AUTO_MERGE=NO
AUTO_DEPLOY=NO
DIRECT_MAIN_MUTATION=NO
```

05C can emit `FINAL_ROBOCOP_005C=PASS` only after AA-01 through AA-10 are proven remotely and the temporary pre-merge dispatcher extension has been removed.

## Remote acceptance closure

The governed remote checkpoint was executed from the exact accepted revision and is recorded in `docs/evidence/FORGE_WRITABLE_SYNTHETIC_ACCEPTANCE_005C_REMOTE_EVIDENCE.md`.

```text
ACCEPTANCE_SHA=8dd479edb31dffcca618dba03f217534c8653b39
WORKFLOW_RUN_ID=31337249510
REMOTE_ACCEPTANCE=PASS
AA01=PASS
AA02=PASS
AA03=PASS
AA04=PASS
AA05=PASS
AA06=PASS
AA07=PASS
AA08=PASS
AA09=PASS
AA10=PASS
POST_RUN_SEALED=PASS
REAL_DATA_TOUCHED=NO
PUBLIC_DEMO_MUTATED=NO
SERVICE_ROLE_DOMAIN_WRITE=NO
RLS_BYPASS=NO
TEMP_DISPATCHER_REMOVED=PASS
```

`FINAL_ROBOCOP_005C=PASS` and `PHASE_STATUS=PASS` are emitted only by the final PR gate after it independently verifies the committed evidence, exact restoration of the dispatcher to the base contract, bounded diff, preserved identity/session boundaries, and REP-17.