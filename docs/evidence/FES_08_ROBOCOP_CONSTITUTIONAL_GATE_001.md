# FES 08 Robocop Constitutional Gate 001

```text
ROBOCOP_GATE=OPEN
ROBOCOP_LOCK=ROBOCOP_LOCK_001
MIRANDA_APPROVAL=APPROVED_BY_PRODUCT_OWNER
BOARD_APPROVAL=APPROVED_BY_PRODUCT_OWNER
HUMAN_VISUAL_ACCEPTANCE=REQUIRED_AFTER_REMOTE_PREVIEW
EXECUTION_AUTHORIZED=YES
```

## Applicable Constitution

- `AGENTS.md`: governed workflow, Event & Evidence facts, human action
  authority and no invented truth.
- `FORGE_CONSTITUTION_V3.md`: privacy, determinism, human control and tested
  incremental delivery.
- `docs/00-governance/FORGE_ROBOCOP_DIRECTIVES.md`.
- `docs/00-governance/FORGE_ROBOCOP_AI_INTERPRETATION_ADDENDUM.md`.
- `docs/00-governance/FORGE_GOVERNANCE_REGISTRY.md`.
- `docs/architecture/source-truth/FORGE_EVENT_EVIDENCE_OPERATING_SYSTEM_001.md`.
- FES 01 through FES 07 closures.

## Applicable ADRs and authorities

- ADR-001 — Evidence Ownership / Source Validity.
- ADR-003 — Recommendation vs Decision / Authority Boundary.
- ADR-004 — No Invented Recommendations.
- ADR-009 — NBA Philosophy.
- ADR-010 — NASH Conversation Intelligence Boundary.
- ADR-011 — Relationship Intelligence Non-Manipulation Boundary.
- Productive Forge Alive authority:
  `FORGE_ALIVE_STATIC_ENTRYPOINT_PIPELINE_MOUNT_RECONCILIATION_DECISION_067G16A.md`,
  `FORGE_ADVISOR_SALES_PIPELINE_RESPONSIVE_LAYOUT_COLOR_AND_ROUTE_HYDRATION_REPAIR_067G16C.md`
  and the NFAST-07 Pipeline runtime integration closure.
- Activity authority: FES 01, FES 02, FES 03C/03E and FES 05 closures.
- Performance read authority: commits
  `ce93446b4b8f06fd97dbab818781cead8f58b7be` and
  `e4add929295f4b9edd3fb9e3ba88c98ad63df817` on the protected Performance
  branch.
- UI-M04 is a visual and shell reference only under the Owner Packet. It is not
  the productive runtime target, and no Material 3 tree merge is authorized.

## Build Tree Area

```text
BUILD_TREE_AREA=FES_08_FORGE_ALIVE_PRODUCTIVE_INTEGRATION
PRODUCTIVE_PIPELINE=IN_SCOPE
PROSPECT_DETAIL=IN_SCOPE
ACTIVITY=CANONICAL_APPEND_AND_PROJECTION_AUTHORITY
MI_DIA=ACCEPTED_PROJECTION_CONSUMER
PERFORMANCE=READ_ONLY_ACTIVITY_CONSUMER
NASH_AND_NASH_COMBAT=GOVERNED_ACTION_WORKSPACES
```

## Status and readiness

```text
FES_07_PUSH_AND_DEEP_LINK_RUNTIME=CLOSED
PRODUCTIVE_PIPELINE_IMPLEMENTATION=HISTORICALLY_PRESENT
PRODUCTIVE_TARGET=docs/static-preview/forge-alive/
INTEGRATION_MODE=RESTORE_AND_ADAPT
IMPLEMENTATION_READINESS=READY_WITH_CONDITIONS
```

Conditions are an exact capability inventory, a per-file implementation
manifest, dedicated and complete regressions, native Linux CI, remote preview
and human visual acceptance.

## Scope boundary

- The productive Pipeline and narrowly scoped governed adapters identified by
  discovery.
- Pipeline, Prospect Detail, call confirmation, reviewed WhatsApp/NASH,
  Nash Combat, Google Calendar confirmation, Activity projection refresh and
  Performance read integration.
- Exact tests, evidence and existing workflow changes required for acceptance.

## Prohibited surfaces

- `main`.
- Protected Nash, Activity and UI worktrees.
- Database schema, migration and direct table access.
- Performance scoring policy or direct Performance writes.
- Cotizaciones behavior.
- Global shell redesign or complete Material 3 tree merge.
- Calendar replacement.
- Automatic call, message, appointment or objection-result inference.
- External side effects in CI.

## Validation expectation

- Dedicated FES 08 tests.
- Complete FES, Activity, Pipeline, NASH, Nash Combat and Performance read
  regressions.
- Chromium desktop, tablet and mobile acceptance.
- Forbidden-surface audit and evidence artifact.
- Exact-SHA remote CI and approved preview.
- Human visual acceptance before phase closure.

## Starting fingerprints

```text
FES_BRANCH=feature/nfast-09-timeline-to-conversation-brief-projection
FES_HEAD=89530d5e22e188d97ae04c48e8a3bed664339297
FES_REMOTE_HEAD=89530d5e22e188d97ae04c48e8a3bed664339297
FES_WORKTREE_CLEAN=YES
NASH_HEAD=bd00daffc779082ea548c74f2392dac72d5b8c8c
NASH_STAGED_DIFF_SHA256=49d13a109abb8de755ea008a3784452c949d164170f7a4dd445518fc2c7e2947
ACTIVITY_HEAD=4254e294187f71acaec785a2782a62d9908a4a98
ACTIVITY_WORKTREE_CLEAN=YES
UI_HEAD=f3c3d1dc6c65b6927c0ca7290d1ac90e138d4673
UI_WORKTREE_CLEAN=YES
LOCAL_MAIN_HEAD=e4441e794abaaf983472591e7c80ae545b0b3f67
ORIGIN_MAIN_HEAD=b13986224ec091f32ad309bb7af5765e1db78122
```
