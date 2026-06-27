# REPO-011 Archive Reference Analysis

Report ID: REPO-011
Status: DISCOVERY / CLASSIFICATION COMPLETE / NO EXECUTION

## 1. Executive Summary

REPO-011 analyzed the 25 remaining `ARCHIVE_REFERENCE` links from REPO-008 after REPO-010 executed the 96 approved SAFE auto-fixes. No files were moved, no links were rewritten, no imports were changed and no runtime files were touched.

All 25 archive references point to targets that exist under `docs/archive/`. The primary governance question is not existence; it is whether future rewrites should simply redirect to archive or preserve explicit historical context.

## 2. Archive Classification Counts

| Classification | Count |
| --- | ---: |
| HISTORICAL_REFERENCE | 21 |
| ARCHIVE_REDIRECT | 3 |
| SUPERSEDED_DOCUMENT | 1 |

## 3. Ownership Counts

| Owner | Count |
| --- | ---: |
| Archive + Constitution | 22 |
| Archive + Advisor OS | 2 |
| Archive + Repository Governance | 1 |

## 4. Traceability Counts

| Traceability | Count |
| --- | ---: |
| SAFE_TO_REDIRECT | 21 |
| PRESERVE_HISTORICAL_LINK | 4 |

## 5. Wave Counts

| Wave | Count |
| --- | ---: |
| WAVE-A | 21 |
| WAVE-B | 4 |

## 6. Archive Reference Inventory

| # | Source File | Broken Link Target | Current Archive Location | Canonical Replacement Target | Reference Classification | Owner | Traceability | Wave | Ownership Conflict |
| ---: | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | `docs/adr/PAQ-01-RECRUITMENT-INTELLIGENCE-DISCOVERY.md` | `FORGE_FOUNDATION_LOCK.md` | `docs/archive/FORGE_FOUNDATION_LOCK.md` | `docs/archive/FORGE_FOUNDATION_LOCK.md` | HISTORICAL_REFERENCE | Archive + Constitution | SAFE_TO_REDIRECT | WAVE-A | Shared historical target; Archive owns storage, domain owner owns meaning. |
| 2 | `docs/adr/PAQ-02-RECRUITMENT-DOMAIN-MODEL-ADDENDUM.md` | `FORGE_FOUNDATION_LOCK.md` | `docs/archive/FORGE_FOUNDATION_LOCK.md` | `docs/archive/FORGE_FOUNDATION_LOCK.md` | HISTORICAL_REFERENCE | Archive + Constitution | SAFE_TO_REDIRECT | WAVE-A | Shared historical target; Archive owns storage, domain owner owns meaning. |
| 3 | `docs/adr/PAQ-02-RECRUITMENT-DOMAIN-MODEL.md` | `FORGE_FOUNDATION_LOCK.md` | `docs/archive/FORGE_FOUNDATION_LOCK.md` | `docs/archive/FORGE_FOUNDATION_LOCK.md` | HISTORICAL_REFERENCE | Archive + Constitution | SAFE_TO_REDIRECT | WAVE-A | Shared historical target; Archive owns storage, domain owner owns meaning. |
| 4 | `docs/adr/PAQ-03-CAREER-CAPITAL-RELATIONSHIP-CAPITAL-BOUNDARY-REVIEW.md` | `FORGE_FOUNDATION_LOCK.md` | `docs/archive/FORGE_FOUNDATION_LOCK.md` | `docs/archive/FORGE_FOUNDATION_LOCK.md` | HISTORICAL_REFERENCE | Archive + Constitution | SAFE_TO_REDIRECT | WAVE-A | Shared historical target; Archive owns storage, domain owner owns meaning. |
| 5 | `docs/adr/PAQ-04-METRICS-OWNERSHIP-FINALIZATION.md` | `FORGE_FOUNDATION_LOCK.md` | `docs/archive/FORGE_FOUNDATION_LOCK.md` | `docs/archive/FORGE_FOUNDATION_LOCK.md` | HISTORICAL_REFERENCE | Archive + Constitution | SAFE_TO_REDIRECT | WAVE-A | Shared historical target; Archive owns storage, domain owner owns meaning. |
| 6 | `docs/adr/PAQ-04-P200-MARKET-NATURAL-DISCOVERY-REVIEW.md` | `FORGE_FOUNDATION_LOCK.md` | `docs/archive/FORGE_FOUNDATION_LOCK.md` | `docs/archive/FORGE_FOUNDATION_LOCK.md` | HISTORICAL_REFERENCE | Archive + Constitution | SAFE_TO_REDIRECT | WAVE-A | Shared historical target; Archive owns storage, domain owner owns meaning. |
| 7 | `docs/adr/PAQ-05-RELATIONSHIP-ACTIVATION-REVIEW.md` | `FORGE_FOUNDATION_LOCK.md` | `docs/archive/FORGE_FOUNDATION_LOCK.md` | `docs/archive/FORGE_FOUNDATION_LOCK.md` | HISTORICAL_REFERENCE | Archive + Constitution | SAFE_TO_REDIRECT | WAVE-A | Shared historical target; Archive owns storage, domain owner owns meaning. |
| 8 | `docs/adr/PAQ-05-RULE-SNAPSHOT-HARDENING.md` | `FORGE_FOUNDATION_LOCK.md` | `docs/archive/FORGE_FOUNDATION_LOCK.md` | `docs/archive/FORGE_FOUNDATION_LOCK.md` | HISTORICAL_REFERENCE | Archive + Constitution | SAFE_TO_REDIRECT | WAVE-A | Shared historical target; Archive owns storage, domain owner owns meaning. |
| 9 | `docs/adr/PAQ-06-COMMERCIAL-EVENTS-TAXONOMY.md` | `FORGE_FOUNDATION_LOCK.md` | `docs/archive/FORGE_FOUNDATION_LOCK.md` | `docs/archive/FORGE_FOUNDATION_LOCK.md` | HISTORICAL_REFERENCE | Archive + Constitution | SAFE_TO_REDIRECT | WAVE-A | Shared historical target; Archive owns storage, domain owner owns meaning. |
| 10 | `docs/adr/PAQ-06-RECRUITMENT-HARDENING-REVIEW.md` | `FORGE_FOUNDATION_LOCK.md` | `docs/archive/FORGE_FOUNDATION_LOCK.md` | `docs/archive/FORGE_FOUNDATION_LOCK.md` | HISTORICAL_REFERENCE | Archive + Constitution | SAFE_TO_REDIRECT | WAVE-A | Shared historical target; Archive owns storage, domain owner owns meaning. |
| 11 | `docs/adr/PAQ-07-FOUNDATION-LOCK-REVIEW.md` | `FORGE_FOUNDATION_LOCK.md` | `docs/archive/FORGE_FOUNDATION_LOCK.md` | `docs/archive/FORGE_FOUNDATION_LOCK.md` | HISTORICAL_REFERENCE | Archive + Constitution | PRESERVE_HISTORICAL_LINK | WAVE-B | Shared historical target; Archive owns storage, domain owner owns meaning. |
| 12 | `docs/adr/PAQ-07-PARTNER-INTELLIGENCE-DISCOVERY.md` | `FORGE_FOUNDATION_LOCK.md` | `docs/archive/FORGE_FOUNDATION_LOCK.md` | `docs/archive/FORGE_FOUNDATION_LOCK.md` | HISTORICAL_REFERENCE | Archive + Constitution | SAFE_TO_REDIRECT | WAVE-A | Shared historical target; Archive owns storage, domain owner owns meaning. |
| 13 | `docs/adr/PAQ-08-ADVISOR-DEVELOPMENT-INTELLIGENCE-DISCOVERY.md` | `FORGE_FOUNDATION_LOCK.md` | `docs/archive/FORGE_FOUNDATION_LOCK.md` | `docs/archive/FORGE_FOUNDATION_LOCK.md` | HISTORICAL_REFERENCE | Archive + Constitution | SAFE_TO_REDIRECT | WAVE-A | Shared historical target; Archive owns storage, domain owner owns meaning. |
| 14 | `docs/adr/PAQ-08-FOUNDATION-LOCK-FINAL-REVIEW.md` | `FORGE_FOUNDATION_LOCK.md` | `docs/archive/FORGE_FOUNDATION_LOCK.md` | `docs/archive/FORGE_FOUNDATION_LOCK.md` | HISTORICAL_REFERENCE | Archive + Constitution | PRESERVE_HISTORICAL_LINK | WAVE-B | Shared historical target; Archive owns storage, domain owner owns meaning. |
| 15 | `docs/adr/PAQ-09-PRODUCTIVITY-INTELLIGENCE-DISCOVERY.md` | `FORGE_FOUNDATION_LOCK.md` | `docs/archive/FORGE_FOUNDATION_LOCK.md` | `docs/archive/FORGE_FOUNDATION_LOCK.md` | HISTORICAL_REFERENCE | Archive + Constitution | SAFE_TO_REDIRECT | WAVE-A | Shared historical target; Archive owns storage, domain owner owns meaning. |
| 16 | `docs/adr/PAQ-09.5-PRODUCTIVITY-INTELLIGENCE-ARCHITECTURE-LOCK.md` | `FORGE_FOUNDATION_LOCK.md` | `docs/archive/FORGE_FOUNDATION_LOCK.md` | `docs/archive/FORGE_FOUNDATION_LOCK.md` | HISTORICAL_REFERENCE | Archive + Constitution | SAFE_TO_REDIRECT | WAVE-A | Shared historical target; Archive owns storage, domain owner owns meaning. |
| 17 | `docs/adr/PAQ-10-CONSERVATION-INTELLIGENCE-DISCOVERY.md` | `FORGE_FOUNDATION_LOCK.md` | `docs/archive/FORGE_FOUNDATION_LOCK.md` | `docs/archive/FORGE_FOUNDATION_LOCK.md` | HISTORICAL_REFERENCE | Archive + Constitution | SAFE_TO_REDIRECT | WAVE-A | Shared historical target; Archive owns storage, domain owner owns meaning. |
| 18 | `docs/adr/PAQ-10.5-CONSERVATION-INTELLIGENCE-ARCHITECTURE-LOCK.md` | `FORGE_FOUNDATION_LOCK.md` | `docs/archive/FORGE_FOUNDATION_LOCK.md` | `docs/archive/FORGE_FOUNDATION_LOCK.md` | HISTORICAL_REFERENCE | Archive + Constitution | SAFE_TO_REDIRECT | WAVE-A | Shared historical target; Archive owns storage, domain owner owns meaning. |
| 19 | `docs/adr/PAQ-12-ADVISOR-EXPERIENCE-INTELLIGENCE-PRODUCTIVITY.md` | `FORGE_ADVISOR_EXPERIENCE_ARCHITECTURE.md` | `docs/archive/FORGE_ADVISOR_EXPERIENCE_ARCHITECTURE.md` | `docs/archive/FORGE_ADVISOR_EXPERIENCE_ARCHITECTURE.md` | ARCHIVE_REDIRECT | Archive + Advisor OS | SAFE_TO_REDIRECT | WAVE-A | Shared historical target; Archive owns storage, domain owner owns meaning. |
| 20 | `docs/adr/PAQ-12-ADVISOR-EXPERIENCE-INTELLIGENCE-PRODUCTIVITY.md` | `SCHEMA_CATALOG.md` | `docs/archive/SCHEMA_CATALOG.md` | `docs/archive/SCHEMA_CATALOG.md` | ARCHIVE_REDIRECT | Archive + Repository Governance | SAFE_TO_REDIRECT | WAVE-A | Shared historical target; Archive owns storage, domain owner owns meaning. |
| 21 | `docs/adr/PAQ-12.1-ADVISOR-EXPERIENCE-INTELLIGENCE-ARCHITECTURE.md` | `FORGE_FOUNDATION_LOCK.md` | `docs/archive/FORGE_FOUNDATION_LOCK.md` | `docs/archive/FORGE_FOUNDATION_LOCK.md` | HISTORICAL_REFERENCE | Archive + Constitution | SAFE_TO_REDIRECT | WAVE-A | Shared historical target; Archive owns storage, domain owner owns meaning. |
| 22 | `docs/adr/PAQ-12.1-ADVISOR-EXPERIENCE-INTELLIGENCE-ARCHITECTURE.md` | `FORGE_ADVISOR_EXPERIENCE_ARCHITECTURE.md` | `docs/archive/FORGE_ADVISOR_EXPERIENCE_ARCHITECTURE.md` | `docs/archive/FORGE_ADVISOR_EXPERIENCE_ARCHITECTURE.md` | ARCHIVE_REDIRECT | Archive + Advisor OS | SAFE_TO_REDIRECT | WAVE-A | Shared historical target; Archive owns storage, domain owner owns meaning. |
| 23 | `docs/architecture/README.md` | `../../FORGE_FOUNDATION_LOCK.md` | `docs/archive/FORGE_FOUNDATION_LOCK.md` | `docs/archive/FORGE_FOUNDATION_LOCK.md` | HISTORICAL_REFERENCE | Archive + Constitution | SAFE_TO_REDIRECT | WAVE-A | Shared historical target; Archive owns storage, domain owner owns meaning. |
| 24 | `docs/architecture/constitution/FORGE_RATIFICATION_AND_FOUNDATION_CLOSURE.md` | `FORGE_FOUNDATION_LOCK.md` | `docs/archive/FORGE_FOUNDATION_LOCK.md` | `docs/archive/FORGE_FOUNDATION_LOCK.md` | HISTORICAL_REFERENCE | Archive + Constitution | PRESERVE_HISTORICAL_LINK | WAVE-B | Shared historical target; Archive owns storage, domain owner owns meaning. |
| 25 | `docs/archive/superseded/FORGE_CONSTITUTION_AMENDMENT_v1.1_ROOT_CONVERSION.md` | `FORGE_FOUNDATION_LOCK.md` | `docs/archive/FORGE_FOUNDATION_LOCK.md` | `docs/archive/FORGE_FOUNDATION_LOCK.md` | SUPERSEDED_DOCUMENT | Archive + Constitution | PRESERVE_HISTORICAL_LINK | WAVE-B | Shared historical target; Archive owns storage, domain owner owns meaning. |

## 7. Constitutional Traceability Test

Rewriting an archive reference to its current `docs/archive/` path does not delete provenance by itself. The risk is semantic: a future reader may mistake an archived artifact for current doctrine if surrounding text does not identify it as historical.

- `SAFE_TO_REDIRECT`: target is an archived supporting document and direct archive path preserves traceability.
- `PRESERVE_HISTORICAL_LINK`: target or source has constitutional/foundation/superseded significance; future execution should preserve historical wording or add explicit archive context in the execution report.
- `NEEDS_DUAL_REFERENCE`: no records currently require dual links.

## 8. Execution Readiness

| Wave | Scope | Count | Execution Readiness | Rule |
| --- | --- | ---: | --- | --- |
| WAVE-A | Low-risk archive redirects | 21 | Ready for dry-run rewrite map | Rewrite direct archive path only; do not alter prose. |
| WAVE-B | Historical references requiring provenance language | 4 | Plan first | May rewrite path, but execution report must preserve historical/foundation context. |
| WAVE-C | Human review required | 0 | Not ready | No execution without council review. |

## 9. Recommended Next Action

Recommended REPO-012 scope: create a dry-run rewrite map for WAVE-A archive redirects only. Keep WAVE-B separate because Foundation Lock and superseded-document references carry stronger historical provenance requirements.
