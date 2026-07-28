# FES 08B — Nash Combat Browser Adapter Robocop Gate

```text
ROBOCOP_GATE=OPEN
ROBOCOP_AMENDMENT=APPROVED
MIRANDA_APPROVAL=APPROVED
BOARD_APPROVAL=APPROVED
SCOPE=FES_08B_BROWSER_SAFE_NASH_COMBAT_ADAPTER
LEGACY_NASH_MUTATION=NO
LEGACY_NASH_DUPLICATION=NO
HUMAN_APPROVAL_REQUIRED=YES
EXECUTION_AUTHORIZED=YES
```

## Constitutional authority

- `AGENTS.md`
- `FORGE_CONSTITUTION_V3.md`
- `docs/00-governance/FORGE_ROBOCOP_DIRECTIVES.md`
- `docs/00-governance/FORGE_ROBOCOP_AI_INTERPRETATION_ADDENDUM.md`
- `docs/00-governance/FORGE_GOVERNANCE_REGISTRY.md`
- FES 08 productive integration authority and FES 08A closure.
- Nash inventory classification `NASH_NEEDS_BOUNDARY_WRAPPER`.

## Fixed source authority

```text
SOURCE_FILE=nash-combat-orchestrator.js
SOURCE_GIT_BLOB_SHA=b836cf8b33cb3a6dbb46eff4c056e38f588d6401
SOURCE_SHA256=43d8f2f12de78b7de434d7d8ef9b12d1b9d719563646a20a3edf4856acad075d
SOURCE_SRI=sha256-Q9jy8S3ni33kNNfY75sS0bnXGVY2RqIKPt9IVqytB10=
SOURCE_MUTATION=FORBIDDEN
```

## Scope boundary

The adapter may execute only the unchanged approved CommonJS source in a
short-lived, hidden, same-origin iframe. It may capture only the five named
exports, sanitize the governed result, require existing draft safety
validation and exact human approval, and emit reference-only FES evidence.

It may not duplicate Nash logic, accept arbitrary URLs, use evaluated source
text, send a message, infer prospect intent truth, mutate Pipeline stages,
write Activity directly, or write Performance.

## Validation

- Git blob and source SHA/SRI pinning.
- Same-origin fixed URL and isolated-realm execution.
- Export validation, single-flight loading and guaranteed iframe removal.
- No parent-window pollution.
- No raw objection in governed output.
- Deep immutability and candidate-only authority.
- Exact-text human review before WhatsApp handoff.
- Existing Nash draft, FES, Activity and productive browser regressions.
