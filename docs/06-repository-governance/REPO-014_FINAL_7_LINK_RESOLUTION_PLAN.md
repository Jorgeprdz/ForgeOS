# REPO-014 Final 7 Link Resolution Plan

Report ID: REPO-014
Status: FINAL 7-LINK GOVERNANCE PLAN / NO EXECUTION

## Summary

The remaining 7 broken Markdown links are classified as follows:

| Classification | Count |
| --- | ---: |
| DUAL_LINK_REQUIRED | 4 |
| ARCHIVE_TARGET_REQUIRED | 3 |
| Total | 7 |

REPO-015 eligible count:

| Scope | Eligible Count | Notes |
| --- | ---: | --- |
| Link-only execution after dry-run | 4 | WAVE-B dual-link rewrites. |
| Movement plus rewrite after approval | 3 | NEEDS_MOVE target archival required first. |

## Final Resolution Table

| # | Source File | Current Broken Link | Recommended Treatment | Risk | Owner | Eligible for REPO-015 Execution? |
| ---: | --- | --- | --- | --- | --- | --- |
| 1 | `docs/adr/PAQ-07-FOUNDATION-LOCK-REVIEW.md` | `FORGE_FOUNDATION_LOCK.md` | Preserve visible historical name and rewrite target to `docs/archive/FORGE_FOUNDATION_LOCK.md` using source-relative path. | LOW | Archive + Constitution | YES |
| 2 | `docs/adr/PAQ-08-FOUNDATION-LOCK-FINAL-REVIEW.md` | `FORGE_FOUNDATION_LOCK.md` | Preserve visible historical name and rewrite target to `docs/archive/FORGE_FOUNDATION_LOCK.md` using source-relative path. | LOW | Archive + Constitution | YES |
| 3 | `docs/architecture/constitution/FORGE_RATIFICATION_AND_FOUNDATION_CLOSURE.md` | `FORGE_FOUNDATION_LOCK.md` | Preserve visible historical name and rewrite target to `docs/archive/FORGE_FOUNDATION_LOCK.md` using source-relative path; include execution note that Foundation Lock remains archived historical evidence. | MEDIUM | Archive + Constitution | YES |
| 4 | `docs/archive/superseded/FORGE_CONSTITUTION_AMENDMENT_v1.1_ROOT_CONVERSION.md` | `FORGE_FOUNDATION_LOCK.md` | Preserve visible historical name and rewrite target to `docs/archive/FORGE_FOUNDATION_LOCK.md` using source-relative path; do not imply canonical doctrine. | MEDIUM | Archive + Constitution | YES |
| 5 | `docs/archive/FORGE_PROJECTION_INTELLIGENCE_CHECKPOINT_NOTE.md` | `FORGE_IMAGINA_SER_REAL_QUOTE_VALIDATION_REPORT.txt` | Archive target under governed Product Intelligence projection evidence destination, then rewrite checkpoint link. | MEDIUM | Product Intelligence + Projection Evidence Archive | NO |
| 6 | `docs/archive/FORGE_PROJECTION_INTELLIGENCE_CHECKPOINT_NOTE.md` | `FORGE_PROJECTION_ENGINE_VS_EXCEL_VALIDATION_REPORT.txt` | Archive target under governed Product Intelligence projection evidence destination, then rewrite checkpoint link. | MEDIUM | Product Intelligence + Projection Evidence Archive | NO |
| 7 | `docs/archive/FORGE_PROJECTION_INTELLIGENCE_CHECKPOINT_NOTE.md` | `FORGE_GLOBAL_UDI_PROJECTION_VALIDATION_REPORT.txt` | Archive target under governed Product Intelligence projection evidence destination, then rewrite checkpoint link. | MEDIUM | Product Intelligence + Projection Evidence Archive | NO |

## Recommended Historical Link Policy

Historical constitutional and foundation links should not be converted to plain text and should not be silently normalized as if they were current operational docs.

Approved policy:

`DUAL_LINK_REQUIRED`

Preserve the original artifact name in the visible link text and point the link to the current archived location. Add contextual archive notes only when the source document could otherwise imply current doctrine.

## Recommended REPO-015 Scope

REPO-015 should execute only the 4 WAVE-B dual-link rewrites after a dry-run map confirms exact paths.

Expected source-relative targets:

| Source File | Expected New Target |
| --- | --- |
| `docs/adr/PAQ-07-FOUNDATION-LOCK-REVIEW.md` | `../archive/FORGE_FOUNDATION_LOCK.md` |
| `docs/adr/PAQ-08-FOUNDATION-LOCK-FINAL-REVIEW.md` | `../archive/FORGE_FOUNDATION_LOCK.md` |
| `docs/architecture/constitution/FORGE_RATIFICATION_AND_FOUNDATION_CLOSURE.md` | `../../archive/FORGE_FOUNDATION_LOCK.md` |
| `docs/archive/superseded/FORGE_CONSTITUTION_AMENDMENT_v1.1_ROOT_CONVERSION.md` | `../FORGE_FOUNDATION_LOCK.md` |

REPO-015 must not touch the 3 NEEDS_MOVE projection validation links unless a target archive move map is explicitly approved in the same authorization.

## Recommended REPO-016 Scope

REPO-016 should resolve the 3 NEEDS_MOVE records:

1. Create an approved move map for the 3 tracked root validation reports.
2. Move them to `docs/archive/product-intelligence/projection-evidence/` using `git mv`.
3. Rewrite the 3 checkpoint links to the new source-relative paths.
4. Run the migration harness check and `git diff --check`.

## Validation Required For Future Execution

```sh
node scripts/repo-doc-migration-harness.js check --output-dir docs/06-repository-governance/reports
git diff --check
git diff --name-only | rg '(^app\.js$|^index\.html$|^manifest\.json$|^service-worker\.js$|^sw-cache-config\.js$|\.js$|\.ts$|\.tsx$|\.jsx$|package.*\.json$)'
```

## Current Blockers

- No blocker for 4 WAVE-B dual-link rewrite planning.
- 3 NEEDS_MOVE records remain blocked by missing target placement approval.

## Final Verdict

REPO-015 should proceed as a narrow, link-only execution for 4 WAVE-B records. The 3 Product Intelligence validation reports should be handled in a later movement-authorized phase.

Confidence score: 0.88
