# Migration Validation Report

Status: PASS_WITH_REVIEW_ITEMS

This report validates the generated plan. It does not move files.

## Checks

| Check | Count | Status |
| --- | ---: | --- |
| Destination collisions | 1 | REVIEW_REQUIRED |
| Protected root violations | 0 | PASS |
| Runtime files in MOVE list | 0 | PASS |
| Duplicate destinations | 0 | PASS |
| Broken ownership rules / review required | 1 | REVIEW_REQUIRED |

## Destination Collisions

| Source | Destination |
| --- | --- |
| `FORGE_CONSTITUTION_AMENDMENT_v1.1.md` | `docs/architecture/constitution/FORGE_CONSTITUTION_AMENDMENT_v1.1.md` |

## Review Required

| Source | Reason |
| --- | --- |
| `forge-full-inventory.txt` | File is neither tracked nor clearly untracked in current git view. |
