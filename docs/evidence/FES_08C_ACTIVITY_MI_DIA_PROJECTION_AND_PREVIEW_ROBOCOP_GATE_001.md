# FES 08C — Activity to Mi Día projection and governed preview gate

```text
PHASE=FES_08C_CANONICAL_ACCEPTED_ACTIVITY_TO_MI_DIA_PROJECTION
PHASE_STATUS=IMPLEMENTATION_AUTHORIZED
SOURCE_COMMIT=76632aaba2bf6b1d784891728eff64180ae329ca
RUNTIME_BRANCH=feature/nfast-09-timeline-to-conversation-brief-projection
ROBOCOP_GATE=OPEN
MIRANDA_APPROVAL=APPROVED_BY_PRODUCT_OWNER
BOARD_APPROVAL=APPROVED_BY_PRODUCT_OWNER
IMPLEMENTATION_READINESS=READY_WITH_CONDITIONS
```

## Constitutional authority

- `AGENTS.md`
- `docs/00-governance/FORGE_ROBOCOP_DIRECTIVES.md`
- `docs/00-governance/FORGE_ROBOCOP_AI_INTERPRETATION_ADDENDUM.md`
- `docs/00-governance/FORGE_GOVERNANCE_REGISTRY.md`
- `docs/01-constitution/FORGE_CONSTITUTION_MAP.md`
- `docs/architecture/source-truth/FORGE_EVENT_EVIDENCE_OPERATING_SYSTEM_001.md`
- `docs/architecture/source-truth/FES_08A_CANONICAL_FES_ACTIVITY_LINEAGE_BRIDGE_001.md`

Applicable ADRs are ADR-001 (Evidence Ownership / Source Validity), ADR-002
(One Metric / One Owner), ADR-010 (NASH Conversation Intelligence Boundary)
and ADR-014 (Productivity Metric Ownership Boundary). Product, policy,
forecast, compensation and recommendation ADRs are not applicable: FES 08C
does not create those truths or decisions.

## Exact boundary

FES 08C may add one deterministic read projection from an already accepted
`activity-record.v1` to the existing productive Mi Día binding. The adapter is
attached once, immediately after the canonical Activity RPC append returns.
It may invalidate the existing Mi Día read surface, but may not create another
Activity store, acceptance path, event schema, Pipeline transition or
Performance write.

FES 08C may also extend the existing FES Actions workflow to build the same
static browser artifact as Pages, test it inside CI and upload that bundle,
screenshots and an HTML report as ordinary Actions artifacts. It may not use
the `github-pages` environment or deploy action.

## Prohibited surfaces

```text
NASH_SOURCE_MUTATION=NO
NASH_LOGIC_DUPLICATION=NO
RAW_OBJECTION_EXPOSURE=NO
DATABASE_MIGRATION=NO
DIRECT_TABLE_ACCESS=NO
PERFORMANCE_WRITE=NO
PIPELINE_TRANSITION_FABRICATION=NO
MAIN_MUTATION=NO
PROTECTED_WORKTREES_MUTATION=NO
GITHUB_PAGES_ENVIRONMENT_MUTATION=NO
EXTERNAL_PREVIEW_PROVIDER=NO
```

## Validation

Dedicated Activity-to-Mi-Día tests, full FES/Activity/Performance regressions,
existing productive Pipeline browser acceptance, a production-equivalent
static build, browser screenshots, HTML report, artifact upload and exact-SHA
remote CI are mandatory.
