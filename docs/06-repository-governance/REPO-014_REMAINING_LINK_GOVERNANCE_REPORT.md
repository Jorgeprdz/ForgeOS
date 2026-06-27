# REPO-014 Remaining Broken Link Governance Report

Report ID: REPO-014
Status: GOVERNANCE DISCOVERY / NO EXECUTION

## Executive Summary

REPO-014 reviewed the 7 broken Markdown links remaining after REPO-013. The current broken-link report confirms:

| Category | Count |
| --- | ---: |
| WAVE-B / PRESERVE_HISTORICAL_LINK | 4 |
| NEEDS_MOVE | 3 |
| Total remaining broken links | 7 |

No files were moved, no links were rewritten, no imports were changed and no runtime files were modified.

The final 7 links should not be handled as a bulk rewrite. They require two different governance decisions:

- WAVE-B links should preserve historical filename meaning while pointing to the archived location.
- NEEDS_MOVE links should remain blocked until their root validation report targets receive governed archive placement.

## Source Reports Loaded

- `docs/06-repository-governance/REPO-013_EXECUTION_REPORT.md`
- `docs/06-repository-governance/REPO-011_ARCHIVE_REFERENCE_ANALYSIS.md`
- `docs/06-repository-governance/REPO-011_NEEDS_MOVE_AUDIT.md`
- `docs/06-repository-governance/reports/broken-link-report.json`

## Current Verification

| Check | Result |
| --- | ---: |
| Broken links in current harness report | 7 |
| WAVE-B records in REPO-011 | 4 |
| NEEDS_MOVE records in REPO-011 | 3 |
| Count discrepancy | 0 |

## WAVE-B Provenance Policy

The 4 WAVE-B records all involve `FORGE_FOUNDATION_LOCK.md`. The target currently exists at:

`docs/archive/FORGE_FOUNDATION_LOCK.md`

These links are historically sensitive because the source files discuss foundation closure, ratification or superseded constitutional material. A simple path rewrite would make Markdown validation pass, but it may weaken the fact that the original reference name is part of the historical record.

Recommended WAVE-B policy:

`DUAL_LINK_REQUIRED`

The execution should preserve the historical artifact name in the visible text and link it to the current archived location. If the surrounding prose could imply current doctrine, add a short contextual note in the execution report or adjacent archive governance documentation rather than changing doctrine text.

## WAVE-B Item Analysis

| # | Source File | Broken Target | Historical Meaning | Current Canonical Location | Provenance Risk | Classification |
| ---: | --- | --- | --- | --- | --- | --- |
| 1 | `docs/adr/PAQ-07-FOUNDATION-LOCK-REVIEW.md` | `FORGE_FOUNDATION_LOCK.md` | Foundation lock review references the closure artifact as part of ratification lineage. | `docs/archive/FORGE_FOUNDATION_LOCK.md` | Low if visible name is preserved; medium if rewritten without context. | DUAL_LINK_REQUIRED |
| 2 | `docs/adr/PAQ-08-FOUNDATION-LOCK-FINAL-REVIEW.md` | `FORGE_FOUNDATION_LOCK.md` | Final foundation lock review references the same historical closure artifact. | `docs/archive/FORGE_FOUNDATION_LOCK.md` | Low if visible name is preserved; medium if rewritten as ordinary current documentation. | DUAL_LINK_REQUIRED |
| 3 | `docs/architecture/constitution/FORGE_RATIFICATION_AND_FOUNDATION_CLOSURE.md` | `FORGE_FOUNDATION_LOCK.md` | Ratification and closure document names Foundation Lock as a constitutional/foundation artifact. | `docs/archive/FORGE_FOUNDATION_LOCK.md` | Medium because this document contains canonical closure context. | DUAL_LINK_REQUIRED |
| 4 | `docs/archive/superseded/FORGE_CONSTITUTION_AMENDMENT_v1.1_ROOT_CONVERSION.md` | `FORGE_FOUNDATION_LOCK.md` | Superseded root conversion references Foundation Lock from historical root context. | `docs/archive/FORGE_FOUNDATION_LOCK.md` | Medium because the source itself is non-canonical and archived. | DUAL_LINK_REQUIRED |

## NEEDS_MOVE Ownership Policy

The 3 NEEDS_MOVE links appear in:

`docs/archive/FORGE_PROJECTION_INTELLIGENCE_CHECKPOINT_NOTE.md`

The referenced targets exist only at repository root:

- `FORGE_IMAGINA_SER_REAL_QUOTE_VALIDATION_REPORT.txt`
- `FORGE_PROJECTION_ENGINE_VS_EXCEL_VALIDATION_REPORT.txt`
- `FORGE_GLOBAL_UDI_PROJECTION_VALIDATION_REPORT.txt`

These are tracked validation/evidence reports, not runtime assets. They belong to Product Intelligence evidence, specifically projection validation evidence. However, no governed destination has been approved yet for root validation report artifacts. Because the targets still exist at root, the correct policy is not to rewrite first; the target placement must be approved first.

Recommended NEEDS_MOVE policy:

`ARCHIVE_TARGET_REQUIRED`

The targets should be archived under a governed Product Intelligence evidence destination before links are rewritten.

Recommended destination family for future execution:

`docs/archive/product-intelligence/projection-evidence/`

This keeps the reports historical/evidentiary rather than implying active runtime ownership.

## NEEDS_MOVE Item Analysis

| # | Source File | Missing Target | Exists Elsewhere? | Correct Owner | Correct Destination Domain | Recommended Classification |
| ---: | --- | --- | --- | --- | --- | --- |
| 1 | `docs/archive/FORGE_PROJECTION_INTELLIGENCE_CHECKPOINT_NOTE.md` | `FORGE_IMAGINA_SER_REAL_QUOTE_VALIDATION_REPORT.txt` | Exists at repository root only. | Product Intelligence + Projection Evidence Archive | `docs/archive/product-intelligence/projection-evidence/` | ARCHIVE_TARGET_REQUIRED |
| 2 | `docs/archive/FORGE_PROJECTION_INTELLIGENCE_CHECKPOINT_NOTE.md` | `FORGE_PROJECTION_ENGINE_VS_EXCEL_VALIDATION_REPORT.txt` | Exists at repository root only. | Product Intelligence + Projection Evidence Archive | `docs/archive/product-intelligence/projection-evidence/` | ARCHIVE_TARGET_REQUIRED |
| 3 | `docs/archive/FORGE_PROJECTION_INTELLIGENCE_CHECKPOINT_NOTE.md` | `FORGE_GLOBAL_UDI_PROJECTION_VALIDATION_REPORT.txt` | Exists at repository root only. | Product Intelligence + Projection Evidence Archive | `docs/archive/product-intelligence/projection-evidence/` | ARCHIVE_TARGET_REQUIRED |

## Historical Link Traceability Rule

Evaluated candidate policies:

| Policy | Result | Reason |
| --- | --- | --- |
| A. Rewrite to archive location | Rejected as default | It fixes validation but can hide historical naming context for constitutional/foundation documents. |
| B. Preserve original text and add parenthetical archive note | Approved for high-context prose | Best when the surrounding paragraph needs explicit historical explanation. |
| C. Convert broken link to inline code filename | Rejected as default | It preserves text but intentionally leaves navigation unavailable. |
| D. Add dual reference: original name + current location | Approved default | It preserves visible historical name while restoring Markdown navigation. |

Recommended rule:

For historical constitutional or foundation references, preserve the original artifact name as the visible link text and point the link to the current archived location. Add contextual archive language only when the surrounding prose could confuse archived evidence with current doctrine.

Practical pattern:

Visible text: `FORGE_FOUNDATION_LOCK.md`
Target path: `../archive/FORGE_FOUNDATION_LOCK.md`

For archived/superseded sources where the relative path differs, compute the relative path from the source file to `docs/archive/FORGE_FOUNDATION_LOCK.md`.

## REPO-015 Execution Readiness

REPO-015 should be split into two execution groups:

| Group | Scope | Count | Execution Status |
| --- | --- | ---: | --- |
| REPO-015A | WAVE-B dual-link path rewrites for `FORGE_FOUNDATION_LOCK.md` | 4 | Eligible after dry-run map |
| REPO-015B | Move/archive Product Intelligence validation report targets, then rewrite checkpoint links | 3 | Blocked until target placement is approved |

## Remaining Blockers

- The 3 projection validation report targets need a governed archive destination before any rewrite.
- If REPO-015 includes file movement for the targets, it must use a separate approved move map and validation pass.
- WAVE-B rewrites require relative path calculation per source file, especially the superseded archive source.

## Final Recommendation

Proceed with REPO-015 as a two-part plan:

1. Create a dry-run map for 4 WAVE-B dual-link rewrites.
2. Separately approve archival movement for the 3 root validation reports into Product Intelligence projection evidence archive before rewriting those links.

Confidence score: 0.88
