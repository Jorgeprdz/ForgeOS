# REPO-008 Broken Link Triage Summary

Status: TRIAGE COMPLETE / NO LINKS MODIFIED

Broken records classified: 124

## Classification Totals

| Category | Count |
| --- | ---: |
| AUTO_FIX | 96 |
| ARCHIVE_REFERENCE | 25 |
| NEEDS_MOVE | 3 |

## Root Cause Ranking

| Root Cause | Count |
| --- | ---: |
| Protected root anchor referenced from moved documentation | 89 |
| Target relocated to archive | 25 |
| Architecture README path depth points to old root location for ADR document | 4 |
| Root validation artifact still pending ownership or archive placement | 3 |
| Constitution relocation | 1 |
| Product intelligence relocation | 1 |
| Schema path depth points to old relative location | 1 |

## Remediation Waves

| Wave | Scope | Count |
| --- | --- | ---: |
| Wave 1 | Low-risk AUTO_FIX | 96 |
| Wave 2 | Archive references | 25 |
| Wave 3 | Needs Move | 3 |
| Wave 4 | Human Review | 0 |

## Highest-Risk Broken Links

| Target | Inbound Count | Why It Matters | Recommended Treatment |
| --- | ---: | --- | --- |
| `AGENTS.md` | 30 | Operational governance anchor | Rewrite relative path to protected root anchor. |
| `FORGE_CONSTITUTION_V3.md` | 30 | Constitutional anchor | Rewrite relative path to protected root anchor. |
| `FORGE_MASTER_BUILD_TREE.md` | 29 | Build tree governance anchor | Rewrite relative path to protected root anchor. |
| `FORGE_FOUNDATION_LOCK.md` | 22 | Foundation historical reference | Rewrite only as archive reference with historical context. |
| `FORGE_ADVISOR_EXPERIENCE_ARCHITECTURE.md` | 2 | Architecture reference | Rewrite only as archive reference with historical context. |
| `advisor.schema.json` | 1 | Architecture reference | Rewrite to schemas/advisor.schema.json. |
| `FORGE_GLOBAL_UDI_PROJECTION_PRODUCT_INTERPRETATION.md` | 1 | Architecture reference | Rewrite to product-intelligence destination. |
| `FORGE_GLOBAL_UDI_PROJECTION_VALIDATION_REPORT.txt` | 1 | Architecture reference | Do not rewrite until report ownership/move decision exists. |

## Recommended REPO-009 Scope

Prepare a Wave 1 dry-run rewrite map for `AUTO_FIX` links. Do not rewrite files yet. Validate the proposed target for each link and keep archive/needs-move links out of the first batch.
