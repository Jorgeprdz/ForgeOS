# FES 07 Robocop Constitutional Gate 001

```text
ROBOCOP_GATE=OPEN
ROBOCOP_LOCK=ROBOCOP_LOCK_001
MIRANDA_APPROVAL=APPROVED_BY_PRODUCT_OWNER_FOR_THIS_SCOPE
BOARD_APPROVAL=APPROVED_BY_PRODUCT_OWNER_FOR_THIS_SCOPE
EXECUTION_AUTHORIZED=YES
```

## Applicable Constitution

- `AGENTS.md`: governed workflow, production events are facts, evidence before
  action and no invented truth.
- `FORGE_CONSTITUTION_V3.md`: privacy, determinism, human control, no invented
  data and incremental test-driven delivery.
- `docs/01-constitution/FORGE_CONSTITUTION_MAP.md`: Truth Governance,
  Authority Governance and Operational Semantics.
- `docs/00-governance/FORGE_ROBOCOP_DIRECTIVES.md`.
- `docs/00-governance/FORGE_ROBOCOP_AI_INTERPRETATION_ADDENDUM.md`.
- `docs/00-governance/FORGE_GOVERNANCE_REGISTRY.md`.
- `docs/architecture/source-truth/FORGE_EVENT_EVIDENCE_OPERATING_SYSTEM_001.md`.
- FES 07A scope and closure plus the approved FES 07B implementation manifest.

## Applicable ADRs

- ADR-001 — Evidence Ownership / Source Validity: governs reference provenance
  and forbids unsupported delivery truth.
- ADR-003 — Recommendation vs Decision / Authority Boundary: a local intent
  does not execute or decide external delivery.
- ADR-007 — Forecast Truth Boundary: scheduling, retry and fallback are not
  delivery facts.
- ADR-004 — No Invented Recommendations is not a primary runtime authority
  because FES 07 creates no recommendation. Its no-invention principle remains
  protected by the Constitution.
- Product, policy, compensation, NASH and Manager OS ADRs are not applicable:
  FES 07 neither consumes nor mutates those domains.

## Build Tree Area

```text
BUILD_TREE_AREA=FORGE_EVENT_AND_EVIDENCE_SYSTEM
PARENT_PHASE=FES_07_PUSH_AND_DEEP_LINK_RUNTIME
IMPLEMENTATION_PHASE=FES_07B_PUSH_AND_DEEP_LINK_RUNTIME_IMPLEMENTATION
ACCEPTANCE_PHASE=FES_07C_PUSH_AND_DEEP_LINK_RUNTIME_ACCEPTANCE
```

## Status and readiness

```text
FES_07A_SCOPE=CLOSED
FES_07B_DISCOVERY_STATUS=IMPLEMENTED_PENDING_ACCEPTANCE
FES_07C_DISCOVERY_STATUS=NEXT_AUTHORITATIVE_PHASE
IMPLEMENTATION_READINESS=READY_WITH_CONDITIONS
LOCAL_DEDICATED_EVIDENCE_REQUIRES_RERUN=YES
REMOTE_CI_REQUIRED=YES
```

## Scope boundary

- Adopt and validate the seven recovered FES 07B paths.
- Close FES 07B with local and exact-SHA remote evidence.
- Add the FES 07C manifest, isolated acceptance fixture or harness, tests,
  evidence and closure.
- Use the existing FES GitHub Actions workflow only as required for authorized
  acceptance.

## Prohibited surfaces

- `main`.
- Nash, Activity and UI worktrees.
- Productive UI, Nav Pill and `app.js`.
- Supabase remote, database schemas and migrations.
- Browser permission requests, service-worker registration, push subscription
  and external providers.
- Arbitrary external navigation.
- Canonical event, pipeline, Activity, ledger, timeline or projection mutation.

## Validation expectation

- JavaScript syntax validation.
- Dedicated FES 07B and FES 07C tests.
- Complete non-browser FES regression.
- Static forbidden-surface checks.
- Native Linux browser acceptance where applicable.
- Exact-SHA GitHub Actions evidence artifact.
- Local/remote commit alignment and clean FES worktree.
- Starting and closing protected-worktree fingerprints must match.

## Starting repository state

```text
FES_BRANCH=feature/nfast-09-timeline-to-conversation-brief-projection
FES_HEAD=d1aa6e13b962c96cd3e0cf6db47a0a2292ac37b9
FES_REMOTE_HEAD=d1aa6e13b962c96cd3e0cf6db47a0a2292ac37b9
FES_EXPECTED_RECOVERED_CHANGESET=YES
NASH_HEAD=bd00daffc779082ea548c74f2392dac72d5b8c8c
NASH_STAGED_DIFF_SHA256=49d13a109abb8de755ea008a3784452c949d164170f7a4dd445518fc2c7e2947
ACTIVITY_EFFECTIVE_HEAD=ba5dfc21c7d23325b49f16a453939c85ba5ca41b
ACTIVITY_WORKTREE_CLEAN=YES
UI_HEAD=f3c3d1dc6c65b6927c0ca7290d1ac90e138d4673
UI_WORKTREE_CLEAN=YES
LOCAL_MAIN_HEAD=e4441e794abaaf983472591e7c80ae545b0b3f67
ORIGIN_MAIN_HEAD=b13986224ec091f32ad309bb7af5765e1db78122
```

The parent repository retains stale linked-worktree metadata for the Activity
path, but the effective Activity checkout has its own `.git` directory. Its
effective clean baseline above is the protected baseline for this execution.
