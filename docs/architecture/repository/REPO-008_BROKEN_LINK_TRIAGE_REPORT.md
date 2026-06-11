# REPO-008 Broken Link Triage Report

Report ID: REPO-008
Status: ARCHITECTURE DISCOVERY / TRIAGE COMPLETE

## 1. Executive Summary

The BUILD-003/REPO-007 harness currently reports 124 broken Markdown links. All 124 records were classified without modifying links, moving files, rewriting imports or executing migration.

Hard migration blockers remain clear: destination overwrite, protected root movement, runtime movement and inventory schema all pass. Broken links remain a warning class and should be remediated in governed waves.

## 2. Classification Counts

| Category | Count |
| --- | ---: |
| AUTO_FIX | 96 |
| ARCHIVE_REFERENCE | 25 |
| NEEDS_MOVE | 3 |

## 3. Broken Link Inventory

| # | Category | Source File | Referenced Path | Resolved Target | Link Type | Existence Status | Alternative Target(s) | Root Cause |
| ---: | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | AUTO_FIX | `docs/adr/PAQ-01-RECRUITMENT-INTELLIGENCE-DISCOVERY.md` | `FORGE_MASTER_BUILD_TREE.md` | `docs/adr/FORGE_MASTER_BUILD_TREE.md` | RELATIVE_MARKDOWN_LINK | TARGET_EXISTS_ELSEWHERE | `FORGE_MASTER_BUILD_TREE.md` | Protected root anchor referenced from moved documentation |
| 2 | AUTO_FIX | `docs/adr/PAQ-01-RECRUITMENT-INTELLIGENCE-DISCOVERY.md` | `AGENTS.md` | `docs/adr/AGENTS.md` | RELATIVE_MARKDOWN_LINK | TARGET_EXISTS_ELSEWHERE | `AGENTS.md` | Protected root anchor referenced from moved documentation |
| 3 | AUTO_FIX | `docs/adr/PAQ-01-RECRUITMENT-INTELLIGENCE-DISCOVERY.md` | `FORGE_CONSTITUTION_V3.md` | `docs/adr/FORGE_CONSTITUTION_V3.md` | RELATIVE_MARKDOWN_LINK | TARGET_EXISTS_ELSEWHERE | `FORGE_CONSTITUTION_V3.md` | Protected root anchor referenced from moved documentation |
| 4 | ARCHIVE_REFERENCE | `docs/adr/PAQ-01-RECRUITMENT-INTELLIGENCE-DISCOVERY.md` | `FORGE_FOUNDATION_LOCK.md` | `docs/adr/FORGE_FOUNDATION_LOCK.md` | RELATIVE_MARKDOWN_LINK | TARGET_EXISTS_ELSEWHERE | `docs/archive/FORGE_FOUNDATION_LOCK.md` | Target relocated to archive |
| 5 | AUTO_FIX | `docs/adr/PAQ-02-RECRUITMENT-DOMAIN-MODEL-ADDENDUM.md` | `FORGE_MASTER_BUILD_TREE.md` | `docs/adr/FORGE_MASTER_BUILD_TREE.md` | RELATIVE_MARKDOWN_LINK | TARGET_EXISTS_ELSEWHERE | `FORGE_MASTER_BUILD_TREE.md` | Protected root anchor referenced from moved documentation |
| 6 | AUTO_FIX | `docs/adr/PAQ-02-RECRUITMENT-DOMAIN-MODEL-ADDENDUM.md` | `AGENTS.md` | `docs/adr/AGENTS.md` | RELATIVE_MARKDOWN_LINK | TARGET_EXISTS_ELSEWHERE | `AGENTS.md` | Protected root anchor referenced from moved documentation |
| 7 | AUTO_FIX | `docs/adr/PAQ-02-RECRUITMENT-DOMAIN-MODEL-ADDENDUM.md` | `FORGE_CONSTITUTION_V3.md` | `docs/adr/FORGE_CONSTITUTION_V3.md` | RELATIVE_MARKDOWN_LINK | TARGET_EXISTS_ELSEWHERE | `FORGE_CONSTITUTION_V3.md` | Protected root anchor referenced from moved documentation |
| 8 | ARCHIVE_REFERENCE | `docs/adr/PAQ-02-RECRUITMENT-DOMAIN-MODEL-ADDENDUM.md` | `FORGE_FOUNDATION_LOCK.md` | `docs/adr/FORGE_FOUNDATION_LOCK.md` | RELATIVE_MARKDOWN_LINK | TARGET_EXISTS_ELSEWHERE | `docs/archive/FORGE_FOUNDATION_LOCK.md` | Target relocated to archive |
| 9 | AUTO_FIX | `docs/adr/PAQ-02-RECRUITMENT-DOMAIN-MODEL.md` | `FORGE_MASTER_BUILD_TREE.md` | `docs/adr/FORGE_MASTER_BUILD_TREE.md` | RELATIVE_MARKDOWN_LINK | TARGET_EXISTS_ELSEWHERE | `FORGE_MASTER_BUILD_TREE.md` | Protected root anchor referenced from moved documentation |
| 10 | AUTO_FIX | `docs/adr/PAQ-02-RECRUITMENT-DOMAIN-MODEL.md` | `AGENTS.md` | `docs/adr/AGENTS.md` | RELATIVE_MARKDOWN_LINK | TARGET_EXISTS_ELSEWHERE | `AGENTS.md` | Protected root anchor referenced from moved documentation |
| 11 | AUTO_FIX | `docs/adr/PAQ-02-RECRUITMENT-DOMAIN-MODEL.md` | `FORGE_CONSTITUTION_V3.md` | `docs/adr/FORGE_CONSTITUTION_V3.md` | RELATIVE_MARKDOWN_LINK | TARGET_EXISTS_ELSEWHERE | `FORGE_CONSTITUTION_V3.md` | Protected root anchor referenced from moved documentation |
| 12 | ARCHIVE_REFERENCE | `docs/adr/PAQ-02-RECRUITMENT-DOMAIN-MODEL.md` | `FORGE_FOUNDATION_LOCK.md` | `docs/adr/FORGE_FOUNDATION_LOCK.md` | RELATIVE_MARKDOWN_LINK | TARGET_EXISTS_ELSEWHERE | `docs/archive/FORGE_FOUNDATION_LOCK.md` | Target relocated to archive |
| 13 | AUTO_FIX | `docs/adr/PAQ-03-CAREER-CAPITAL-RELATIONSHIP-CAPITAL-BOUNDARY-REVIEW.md` | `FORGE_MASTER_BUILD_TREE.md` | `docs/adr/FORGE_MASTER_BUILD_TREE.md` | RELATIVE_MARKDOWN_LINK | TARGET_EXISTS_ELSEWHERE | `FORGE_MASTER_BUILD_TREE.md` | Protected root anchor referenced from moved documentation |
| 14 | AUTO_FIX | `docs/adr/PAQ-03-CAREER-CAPITAL-RELATIONSHIP-CAPITAL-BOUNDARY-REVIEW.md` | `AGENTS.md` | `docs/adr/AGENTS.md` | RELATIVE_MARKDOWN_LINK | TARGET_EXISTS_ELSEWHERE | `AGENTS.md` | Protected root anchor referenced from moved documentation |
| 15 | AUTO_FIX | `docs/adr/PAQ-03-CAREER-CAPITAL-RELATIONSHIP-CAPITAL-BOUNDARY-REVIEW.md` | `FORGE_CONSTITUTION_V3.md` | `docs/adr/FORGE_CONSTITUTION_V3.md` | RELATIVE_MARKDOWN_LINK | TARGET_EXISTS_ELSEWHERE | `FORGE_CONSTITUTION_V3.md` | Protected root anchor referenced from moved documentation |
| 16 | ARCHIVE_REFERENCE | `docs/adr/PAQ-03-CAREER-CAPITAL-RELATIONSHIP-CAPITAL-BOUNDARY-REVIEW.md` | `FORGE_FOUNDATION_LOCK.md` | `docs/adr/FORGE_FOUNDATION_LOCK.md` | RELATIVE_MARKDOWN_LINK | TARGET_EXISTS_ELSEWHERE | `docs/archive/FORGE_FOUNDATION_LOCK.md` | Target relocated to archive |
| 17 | AUTO_FIX | `docs/adr/PAQ-04-METRICS-OWNERSHIP-FINALIZATION.md` | `FORGE_MASTER_BUILD_TREE.md` | `docs/adr/FORGE_MASTER_BUILD_TREE.md` | RELATIVE_MARKDOWN_LINK | TARGET_EXISTS_ELSEWHERE | `FORGE_MASTER_BUILD_TREE.md` | Protected root anchor referenced from moved documentation |
| 18 | AUTO_FIX | `docs/adr/PAQ-04-METRICS-OWNERSHIP-FINALIZATION.md` | `AGENTS.md` | `docs/adr/AGENTS.md` | RELATIVE_MARKDOWN_LINK | TARGET_EXISTS_ELSEWHERE | `AGENTS.md` | Protected root anchor referenced from moved documentation |
| 19 | AUTO_FIX | `docs/adr/PAQ-04-METRICS-OWNERSHIP-FINALIZATION.md` | `FORGE_CONSTITUTION_V3.md` | `docs/adr/FORGE_CONSTITUTION_V3.md` | RELATIVE_MARKDOWN_LINK | TARGET_EXISTS_ELSEWHERE | `FORGE_CONSTITUTION_V3.md` | Protected root anchor referenced from moved documentation |
| 20 | ARCHIVE_REFERENCE | `docs/adr/PAQ-04-METRICS-OWNERSHIP-FINALIZATION.md` | `FORGE_FOUNDATION_LOCK.md` | `docs/adr/FORGE_FOUNDATION_LOCK.md` | RELATIVE_MARKDOWN_LINK | TARGET_EXISTS_ELSEWHERE | `docs/archive/FORGE_FOUNDATION_LOCK.md` | Target relocated to archive |
| 21 | AUTO_FIX | `docs/adr/PAQ-04-P200-MARKET-NATURAL-DISCOVERY-REVIEW.md` | `FORGE_MASTER_BUILD_TREE.md` | `docs/adr/FORGE_MASTER_BUILD_TREE.md` | RELATIVE_MARKDOWN_LINK | TARGET_EXISTS_ELSEWHERE | `FORGE_MASTER_BUILD_TREE.md` | Protected root anchor referenced from moved documentation |
| 22 | AUTO_FIX | `docs/adr/PAQ-04-P200-MARKET-NATURAL-DISCOVERY-REVIEW.md` | `AGENTS.md` | `docs/adr/AGENTS.md` | RELATIVE_MARKDOWN_LINK | TARGET_EXISTS_ELSEWHERE | `AGENTS.md` | Protected root anchor referenced from moved documentation |
| 23 | AUTO_FIX | `docs/adr/PAQ-04-P200-MARKET-NATURAL-DISCOVERY-REVIEW.md` | `FORGE_CONSTITUTION_V3.md` | `docs/adr/FORGE_CONSTITUTION_V3.md` | RELATIVE_MARKDOWN_LINK | TARGET_EXISTS_ELSEWHERE | `FORGE_CONSTITUTION_V3.md` | Protected root anchor referenced from moved documentation |
| 24 | ARCHIVE_REFERENCE | `docs/adr/PAQ-04-P200-MARKET-NATURAL-DISCOVERY-REVIEW.md` | `FORGE_FOUNDATION_LOCK.md` | `docs/adr/FORGE_FOUNDATION_LOCK.md` | RELATIVE_MARKDOWN_LINK | TARGET_EXISTS_ELSEWHERE | `docs/archive/FORGE_FOUNDATION_LOCK.md` | Target relocated to archive |
| 25 | AUTO_FIX | `docs/adr/PAQ-05-RELATIONSHIP-ACTIVATION-REVIEW.md` | `FORGE_MASTER_BUILD_TREE.md` | `docs/adr/FORGE_MASTER_BUILD_TREE.md` | RELATIVE_MARKDOWN_LINK | TARGET_EXISTS_ELSEWHERE | `FORGE_MASTER_BUILD_TREE.md` | Protected root anchor referenced from moved documentation |
| 26 | AUTO_FIX | `docs/adr/PAQ-05-RELATIONSHIP-ACTIVATION-REVIEW.md` | `AGENTS.md` | `docs/adr/AGENTS.md` | RELATIVE_MARKDOWN_LINK | TARGET_EXISTS_ELSEWHERE | `AGENTS.md` | Protected root anchor referenced from moved documentation |
| 27 | AUTO_FIX | `docs/adr/PAQ-05-RELATIONSHIP-ACTIVATION-REVIEW.md` | `FORGE_CONSTITUTION_V3.md` | `docs/adr/FORGE_CONSTITUTION_V3.md` | RELATIVE_MARKDOWN_LINK | TARGET_EXISTS_ELSEWHERE | `FORGE_CONSTITUTION_V3.md` | Protected root anchor referenced from moved documentation |
| 28 | ARCHIVE_REFERENCE | `docs/adr/PAQ-05-RELATIONSHIP-ACTIVATION-REVIEW.md` | `FORGE_FOUNDATION_LOCK.md` | `docs/adr/FORGE_FOUNDATION_LOCK.md` | RELATIVE_MARKDOWN_LINK | TARGET_EXISTS_ELSEWHERE | `docs/archive/FORGE_FOUNDATION_LOCK.md` | Target relocated to archive |
| 29 | AUTO_FIX | `docs/adr/PAQ-05-RULE-SNAPSHOT-HARDENING.md` | `FORGE_MASTER_BUILD_TREE.md` | `docs/adr/FORGE_MASTER_BUILD_TREE.md` | RELATIVE_MARKDOWN_LINK | TARGET_EXISTS_ELSEWHERE | `FORGE_MASTER_BUILD_TREE.md` | Protected root anchor referenced from moved documentation |
| 30 | AUTO_FIX | `docs/adr/PAQ-05-RULE-SNAPSHOT-HARDENING.md` | `AGENTS.md` | `docs/adr/AGENTS.md` | RELATIVE_MARKDOWN_LINK | TARGET_EXISTS_ELSEWHERE | `AGENTS.md` | Protected root anchor referenced from moved documentation |
| 31 | AUTO_FIX | `docs/adr/PAQ-05-RULE-SNAPSHOT-HARDENING.md` | `FORGE_CONSTITUTION_V3.md` | `docs/adr/FORGE_CONSTITUTION_V3.md` | RELATIVE_MARKDOWN_LINK | TARGET_EXISTS_ELSEWHERE | `FORGE_CONSTITUTION_V3.md` | Protected root anchor referenced from moved documentation |
| 32 | ARCHIVE_REFERENCE | `docs/adr/PAQ-05-RULE-SNAPSHOT-HARDENING.md` | `FORGE_FOUNDATION_LOCK.md` | `docs/adr/FORGE_FOUNDATION_LOCK.md` | RELATIVE_MARKDOWN_LINK | TARGET_EXISTS_ELSEWHERE | `docs/archive/FORGE_FOUNDATION_LOCK.md` | Target relocated to archive |
| 33 | AUTO_FIX | `docs/adr/PAQ-06-COMMERCIAL-EVENTS-TAXONOMY.md` | `FORGE_MASTER_BUILD_TREE.md` | `docs/adr/FORGE_MASTER_BUILD_TREE.md` | RELATIVE_MARKDOWN_LINK | TARGET_EXISTS_ELSEWHERE | `FORGE_MASTER_BUILD_TREE.md` | Protected root anchor referenced from moved documentation |
| 34 | AUTO_FIX | `docs/adr/PAQ-06-COMMERCIAL-EVENTS-TAXONOMY.md` | `AGENTS.md` | `docs/adr/AGENTS.md` | RELATIVE_MARKDOWN_LINK | TARGET_EXISTS_ELSEWHERE | `AGENTS.md` | Protected root anchor referenced from moved documentation |
| 35 | AUTO_FIX | `docs/adr/PAQ-06-COMMERCIAL-EVENTS-TAXONOMY.md` | `FORGE_CONSTITUTION_V3.md` | `docs/adr/FORGE_CONSTITUTION_V3.md` | RELATIVE_MARKDOWN_LINK | TARGET_EXISTS_ELSEWHERE | `FORGE_CONSTITUTION_V3.md` | Protected root anchor referenced from moved documentation |
| 36 | ARCHIVE_REFERENCE | `docs/adr/PAQ-06-COMMERCIAL-EVENTS-TAXONOMY.md` | `FORGE_FOUNDATION_LOCK.md` | `docs/adr/FORGE_FOUNDATION_LOCK.md` | RELATIVE_MARKDOWN_LINK | TARGET_EXISTS_ELSEWHERE | `docs/archive/FORGE_FOUNDATION_LOCK.md` | Target relocated to archive |
| 37 | AUTO_FIX | `docs/adr/PAQ-06-RECRUITMENT-HARDENING-REVIEW.md` | `FORGE_MASTER_BUILD_TREE.md` | `docs/adr/FORGE_MASTER_BUILD_TREE.md` | RELATIVE_MARKDOWN_LINK | TARGET_EXISTS_ELSEWHERE | `FORGE_MASTER_BUILD_TREE.md` | Protected root anchor referenced from moved documentation |
| 38 | AUTO_FIX | `docs/adr/PAQ-06-RECRUITMENT-HARDENING-REVIEW.md` | `AGENTS.md` | `docs/adr/AGENTS.md` | RELATIVE_MARKDOWN_LINK | TARGET_EXISTS_ELSEWHERE | `AGENTS.md` | Protected root anchor referenced from moved documentation |
| 39 | AUTO_FIX | `docs/adr/PAQ-06-RECRUITMENT-HARDENING-REVIEW.md` | `FORGE_CONSTITUTION_V3.md` | `docs/adr/FORGE_CONSTITUTION_V3.md` | RELATIVE_MARKDOWN_LINK | TARGET_EXISTS_ELSEWHERE | `FORGE_CONSTITUTION_V3.md` | Protected root anchor referenced from moved documentation |
| 40 | ARCHIVE_REFERENCE | `docs/adr/PAQ-06-RECRUITMENT-HARDENING-REVIEW.md` | `FORGE_FOUNDATION_LOCK.md` | `docs/adr/FORGE_FOUNDATION_LOCK.md` | RELATIVE_MARKDOWN_LINK | TARGET_EXISTS_ELSEWHERE | `docs/archive/FORGE_FOUNDATION_LOCK.md` | Target relocated to archive |
| 41 | AUTO_FIX | `docs/adr/PAQ-07-FOUNDATION-LOCK-REVIEW.md` | `FORGE_MASTER_BUILD_TREE.md` | `docs/adr/FORGE_MASTER_BUILD_TREE.md` | RELATIVE_MARKDOWN_LINK | TARGET_EXISTS_ELSEWHERE | `FORGE_MASTER_BUILD_TREE.md` | Protected root anchor referenced from moved documentation |
| 42 | AUTO_FIX | `docs/adr/PAQ-07-FOUNDATION-LOCK-REVIEW.md` | `AGENTS.md` | `docs/adr/AGENTS.md` | RELATIVE_MARKDOWN_LINK | TARGET_EXISTS_ELSEWHERE | `AGENTS.md` | Protected root anchor referenced from moved documentation |
| 43 | AUTO_FIX | `docs/adr/PAQ-07-FOUNDATION-LOCK-REVIEW.md` | `FORGE_CONSTITUTION_V3.md` | `docs/adr/FORGE_CONSTITUTION_V3.md` | RELATIVE_MARKDOWN_LINK | TARGET_EXISTS_ELSEWHERE | `FORGE_CONSTITUTION_V3.md` | Protected root anchor referenced from moved documentation |
| 44 | ARCHIVE_REFERENCE | `docs/adr/PAQ-07-FOUNDATION-LOCK-REVIEW.md` | `FORGE_FOUNDATION_LOCK.md` | `docs/adr/FORGE_FOUNDATION_LOCK.md` | RELATIVE_MARKDOWN_LINK | TARGET_EXISTS_ELSEWHERE | `docs/archive/FORGE_FOUNDATION_LOCK.md` | Target relocated to archive |
| 45 | AUTO_FIX | `docs/adr/PAQ-07-PARTNER-INTELLIGENCE-DISCOVERY.md` | `FORGE_MASTER_BUILD_TREE.md` | `docs/adr/FORGE_MASTER_BUILD_TREE.md` | RELATIVE_MARKDOWN_LINK | TARGET_EXISTS_ELSEWHERE | `FORGE_MASTER_BUILD_TREE.md` | Protected root anchor referenced from moved documentation |
| 46 | AUTO_FIX | `docs/adr/PAQ-07-PARTNER-INTELLIGENCE-DISCOVERY.md` | `AGENTS.md` | `docs/adr/AGENTS.md` | RELATIVE_MARKDOWN_LINK | TARGET_EXISTS_ELSEWHERE | `AGENTS.md` | Protected root anchor referenced from moved documentation |
| 47 | AUTO_FIX | `docs/adr/PAQ-07-PARTNER-INTELLIGENCE-DISCOVERY.md` | `FORGE_CONSTITUTION_V3.md` | `docs/adr/FORGE_CONSTITUTION_V3.md` | RELATIVE_MARKDOWN_LINK | TARGET_EXISTS_ELSEWHERE | `FORGE_CONSTITUTION_V3.md` | Protected root anchor referenced from moved documentation |
| 48 | ARCHIVE_REFERENCE | `docs/adr/PAQ-07-PARTNER-INTELLIGENCE-DISCOVERY.md` | `FORGE_FOUNDATION_LOCK.md` | `docs/adr/FORGE_FOUNDATION_LOCK.md` | RELATIVE_MARKDOWN_LINK | TARGET_EXISTS_ELSEWHERE | `docs/archive/FORGE_FOUNDATION_LOCK.md` | Target relocated to archive |
| 49 | AUTO_FIX | `docs/adr/PAQ-08-ADVISOR-DEVELOPMENT-INTELLIGENCE-DISCOVERY.md` | `FORGE_MASTER_BUILD_TREE.md` | `docs/adr/FORGE_MASTER_BUILD_TREE.md` | RELATIVE_MARKDOWN_LINK | TARGET_EXISTS_ELSEWHERE | `FORGE_MASTER_BUILD_TREE.md` | Protected root anchor referenced from moved documentation |
| 50 | AUTO_FIX | `docs/adr/PAQ-08-ADVISOR-DEVELOPMENT-INTELLIGENCE-DISCOVERY.md` | `AGENTS.md` | `docs/adr/AGENTS.md` | RELATIVE_MARKDOWN_LINK | TARGET_EXISTS_ELSEWHERE | `AGENTS.md` | Protected root anchor referenced from moved documentation |
| 51 | AUTO_FIX | `docs/adr/PAQ-08-ADVISOR-DEVELOPMENT-INTELLIGENCE-DISCOVERY.md` | `FORGE_CONSTITUTION_V3.md` | `docs/adr/FORGE_CONSTITUTION_V3.md` | RELATIVE_MARKDOWN_LINK | TARGET_EXISTS_ELSEWHERE | `FORGE_CONSTITUTION_V3.md` | Protected root anchor referenced from moved documentation |
| 52 | ARCHIVE_REFERENCE | `docs/adr/PAQ-08-ADVISOR-DEVELOPMENT-INTELLIGENCE-DISCOVERY.md` | `FORGE_FOUNDATION_LOCK.md` | `docs/adr/FORGE_FOUNDATION_LOCK.md` | RELATIVE_MARKDOWN_LINK | TARGET_EXISTS_ELSEWHERE | `docs/archive/FORGE_FOUNDATION_LOCK.md` | Target relocated to archive |
| 53 | AUTO_FIX | `docs/adr/PAQ-08-FOUNDATION-LOCK-FINAL-REVIEW.md` | `FORGE_MASTER_BUILD_TREE.md` | `docs/adr/FORGE_MASTER_BUILD_TREE.md` | RELATIVE_MARKDOWN_LINK | TARGET_EXISTS_ELSEWHERE | `FORGE_MASTER_BUILD_TREE.md` | Protected root anchor referenced from moved documentation |
| 54 | AUTO_FIX | `docs/adr/PAQ-08-FOUNDATION-LOCK-FINAL-REVIEW.md` | `AGENTS.md` | `docs/adr/AGENTS.md` | RELATIVE_MARKDOWN_LINK | TARGET_EXISTS_ELSEWHERE | `AGENTS.md` | Protected root anchor referenced from moved documentation |
| 55 | AUTO_FIX | `docs/adr/PAQ-08-FOUNDATION-LOCK-FINAL-REVIEW.md` | `FORGE_CONSTITUTION_V3.md` | `docs/adr/FORGE_CONSTITUTION_V3.md` | RELATIVE_MARKDOWN_LINK | TARGET_EXISTS_ELSEWHERE | `FORGE_CONSTITUTION_V3.md` | Protected root anchor referenced from moved documentation |
| 56 | ARCHIVE_REFERENCE | `docs/adr/PAQ-08-FOUNDATION-LOCK-FINAL-REVIEW.md` | `FORGE_FOUNDATION_LOCK.md` | `docs/adr/FORGE_FOUNDATION_LOCK.md` | RELATIVE_MARKDOWN_LINK | TARGET_EXISTS_ELSEWHERE | `docs/archive/FORGE_FOUNDATION_LOCK.md` | Target relocated to archive |
| 57 | AUTO_FIX | `docs/adr/PAQ-09-PRODUCTIVITY-INTELLIGENCE-DISCOVERY.md` | `FORGE_MASTER_BUILD_TREE.md` | `docs/adr/FORGE_MASTER_BUILD_TREE.md` | RELATIVE_MARKDOWN_LINK | TARGET_EXISTS_ELSEWHERE | `FORGE_MASTER_BUILD_TREE.md` | Protected root anchor referenced from moved documentation |
| 58 | AUTO_FIX | `docs/adr/PAQ-09-PRODUCTIVITY-INTELLIGENCE-DISCOVERY.md` | `AGENTS.md` | `docs/adr/AGENTS.md` | RELATIVE_MARKDOWN_LINK | TARGET_EXISTS_ELSEWHERE | `AGENTS.md` | Protected root anchor referenced from moved documentation |
| 59 | AUTO_FIX | `docs/adr/PAQ-09-PRODUCTIVITY-INTELLIGENCE-DISCOVERY.md` | `FORGE_CONSTITUTION_V3.md` | `docs/adr/FORGE_CONSTITUTION_V3.md` | RELATIVE_MARKDOWN_LINK | TARGET_EXISTS_ELSEWHERE | `FORGE_CONSTITUTION_V3.md` | Protected root anchor referenced from moved documentation |
| 60 | ARCHIVE_REFERENCE | `docs/adr/PAQ-09-PRODUCTIVITY-INTELLIGENCE-DISCOVERY.md` | `FORGE_FOUNDATION_LOCK.md` | `docs/adr/FORGE_FOUNDATION_LOCK.md` | RELATIVE_MARKDOWN_LINK | TARGET_EXISTS_ELSEWHERE | `docs/archive/FORGE_FOUNDATION_LOCK.md` | Target relocated to archive |
| 61 | AUTO_FIX | `docs/adr/PAQ-09.5-PRODUCTIVITY-INTELLIGENCE-ARCHITECTURE-LOCK.md` | `FORGE_MASTER_BUILD_TREE.md` | `docs/adr/FORGE_MASTER_BUILD_TREE.md` | RELATIVE_MARKDOWN_LINK | TARGET_EXISTS_ELSEWHERE | `FORGE_MASTER_BUILD_TREE.md` | Protected root anchor referenced from moved documentation |
| 62 | AUTO_FIX | `docs/adr/PAQ-09.5-PRODUCTIVITY-INTELLIGENCE-ARCHITECTURE-LOCK.md` | `AGENTS.md` | `docs/adr/AGENTS.md` | RELATIVE_MARKDOWN_LINK | TARGET_EXISTS_ELSEWHERE | `AGENTS.md` | Protected root anchor referenced from moved documentation |
| 63 | AUTO_FIX | `docs/adr/PAQ-09.5-PRODUCTIVITY-INTELLIGENCE-ARCHITECTURE-LOCK.md` | `FORGE_CONSTITUTION_V3.md` | `docs/adr/FORGE_CONSTITUTION_V3.md` | RELATIVE_MARKDOWN_LINK | TARGET_EXISTS_ELSEWHERE | `FORGE_CONSTITUTION_V3.md` | Protected root anchor referenced from moved documentation |
| 64 | ARCHIVE_REFERENCE | `docs/adr/PAQ-09.5-PRODUCTIVITY-INTELLIGENCE-ARCHITECTURE-LOCK.md` | `FORGE_FOUNDATION_LOCK.md` | `docs/adr/FORGE_FOUNDATION_LOCK.md` | RELATIVE_MARKDOWN_LINK | TARGET_EXISTS_ELSEWHERE | `docs/archive/FORGE_FOUNDATION_LOCK.md` | Target relocated to archive |
| 65 | AUTO_FIX | `docs/adr/PAQ-10-CONSERVATION-INTELLIGENCE-DISCOVERY.md` | `FORGE_MASTER_BUILD_TREE.md` | `docs/adr/FORGE_MASTER_BUILD_TREE.md` | RELATIVE_MARKDOWN_LINK | TARGET_EXISTS_ELSEWHERE | `FORGE_MASTER_BUILD_TREE.md` | Protected root anchor referenced from moved documentation |
| 66 | AUTO_FIX | `docs/adr/PAQ-10-CONSERVATION-INTELLIGENCE-DISCOVERY.md` | `AGENTS.md` | `docs/adr/AGENTS.md` | RELATIVE_MARKDOWN_LINK | TARGET_EXISTS_ELSEWHERE | `AGENTS.md` | Protected root anchor referenced from moved documentation |
| 67 | AUTO_FIX | `docs/adr/PAQ-10-CONSERVATION-INTELLIGENCE-DISCOVERY.md` | `FORGE_CONSTITUTION_V3.md` | `docs/adr/FORGE_CONSTITUTION_V3.md` | RELATIVE_MARKDOWN_LINK | TARGET_EXISTS_ELSEWHERE | `FORGE_CONSTITUTION_V3.md` | Protected root anchor referenced from moved documentation |
| 68 | ARCHIVE_REFERENCE | `docs/adr/PAQ-10-CONSERVATION-INTELLIGENCE-DISCOVERY.md` | `FORGE_FOUNDATION_LOCK.md` | `docs/adr/FORGE_FOUNDATION_LOCK.md` | RELATIVE_MARKDOWN_LINK | TARGET_EXISTS_ELSEWHERE | `docs/archive/FORGE_FOUNDATION_LOCK.md` | Target relocated to archive |
| 69 | AUTO_FIX | `docs/adr/PAQ-10.5-CONSERVATION-INTELLIGENCE-ARCHITECTURE-LOCK.md` | `FORGE_MASTER_BUILD_TREE.md` | `docs/adr/FORGE_MASTER_BUILD_TREE.md` | RELATIVE_MARKDOWN_LINK | TARGET_EXISTS_ELSEWHERE | `FORGE_MASTER_BUILD_TREE.md` | Protected root anchor referenced from moved documentation |
| 70 | AUTO_FIX | `docs/adr/PAQ-10.5-CONSERVATION-INTELLIGENCE-ARCHITECTURE-LOCK.md` | `AGENTS.md` | `docs/adr/AGENTS.md` | RELATIVE_MARKDOWN_LINK | TARGET_EXISTS_ELSEWHERE | `AGENTS.md` | Protected root anchor referenced from moved documentation |
| 71 | AUTO_FIX | `docs/adr/PAQ-10.5-CONSERVATION-INTELLIGENCE-ARCHITECTURE-LOCK.md` | `FORGE_CONSTITUTION_V3.md` | `docs/adr/FORGE_CONSTITUTION_V3.md` | RELATIVE_MARKDOWN_LINK | TARGET_EXISTS_ELSEWHERE | `FORGE_CONSTITUTION_V3.md` | Protected root anchor referenced from moved documentation |
| 72 | ARCHIVE_REFERENCE | `docs/adr/PAQ-10.5-CONSERVATION-INTELLIGENCE-ARCHITECTURE-LOCK.md` | `FORGE_FOUNDATION_LOCK.md` | `docs/adr/FORGE_FOUNDATION_LOCK.md` | RELATIVE_MARKDOWN_LINK | TARGET_EXISTS_ELSEWHERE | `docs/archive/FORGE_FOUNDATION_LOCK.md` | Target relocated to archive |
| 73 | AUTO_FIX | `docs/adr/PAQ-11.5-FORECAST-INTELLIGENCE-ARCHITECTURE.md` | `FORGE_MASTER_BUILD_TREE.md` | `docs/adr/FORGE_MASTER_BUILD_TREE.md` | RELATIVE_MARKDOWN_LINK | TARGET_EXISTS_ELSEWHERE | `FORGE_MASTER_BUILD_TREE.md` | Protected root anchor referenced from moved documentation |
| 74 | AUTO_FIX | `docs/adr/PAQ-11.5-FORECAST-INTELLIGENCE-ARCHITECTURE.md` | `AGENTS.md` | `docs/adr/AGENTS.md` | RELATIVE_MARKDOWN_LINK | TARGET_EXISTS_ELSEWHERE | `AGENTS.md` | Protected root anchor referenced from moved documentation |
| 75 | AUTO_FIX | `docs/adr/PAQ-11.5-FORECAST-INTELLIGENCE-ARCHITECTURE.md` | `FORGE_CONSTITUTION_V3.md` | `docs/adr/FORGE_CONSTITUTION_V3.md` | RELATIVE_MARKDOWN_LINK | TARGET_EXISTS_ELSEWHERE | `FORGE_CONSTITUTION_V3.md` | Protected root anchor referenced from moved documentation |
| 76 | AUTO_FIX | `docs/adr/PAQ-11.5-FORECAST-INTELLIGENCE-ARCHITECTURE.md` | `AGENTS.md` | `docs/adr/AGENTS.md` | RELATIVE_MARKDOWN_LINK | TARGET_EXISTS_ELSEWHERE | `AGENTS.md` | Protected root anchor referenced from moved documentation |
| 77 | AUTO_FIX | `docs/adr/PAQ-11.5-FORECAST-INTELLIGENCE-ARCHITECTURE.md` | `FORGE_CONSTITUTION_V3.md` | `docs/adr/FORGE_CONSTITUTION_V3.md` | RELATIVE_MARKDOWN_LINK | TARGET_EXISTS_ELSEWHERE | `FORGE_CONSTITUTION_V3.md` | Protected root anchor referenced from moved documentation |
| 78 | AUTO_FIX | `docs/adr/PAQ-12-ADVISOR-EXPERIENCE-INTELLIGENCE-PRODUCTIVITY.md` | `FORGE_MASTER_BUILD_TREE.md` | `docs/adr/FORGE_MASTER_BUILD_TREE.md` | RELATIVE_MARKDOWN_LINK | TARGET_EXISTS_ELSEWHERE | `FORGE_MASTER_BUILD_TREE.md` | Protected root anchor referenced from moved documentation |
| 79 | AUTO_FIX | `docs/adr/PAQ-12-ADVISOR-EXPERIENCE-INTELLIGENCE-PRODUCTIVITY.md` | `AGENTS.md` | `docs/adr/AGENTS.md` | RELATIVE_MARKDOWN_LINK | TARGET_EXISTS_ELSEWHERE | `AGENTS.md` | Protected root anchor referenced from moved documentation |
| 80 | AUTO_FIX | `docs/adr/PAQ-12-ADVISOR-EXPERIENCE-INTELLIGENCE-PRODUCTIVITY.md` | `FORGE_CONSTITUTION_V3.md` | `docs/adr/FORGE_CONSTITUTION_V3.md` | RELATIVE_MARKDOWN_LINK | TARGET_EXISTS_ELSEWHERE | `FORGE_CONSTITUTION_V3.md` | Protected root anchor referenced from moved documentation |
| 81 | ARCHIVE_REFERENCE | `docs/adr/PAQ-12-ADVISOR-EXPERIENCE-INTELLIGENCE-PRODUCTIVITY.md` | `FORGE_ADVISOR_EXPERIENCE_ARCHITECTURE.md` | `docs/adr/FORGE_ADVISOR_EXPERIENCE_ARCHITECTURE.md` | RELATIVE_MARKDOWN_LINK | TARGET_EXISTS_ELSEWHERE | `docs/archive/FORGE_ADVISOR_EXPERIENCE_ARCHITECTURE.md` | Target relocated to archive |
| 82 | ARCHIVE_REFERENCE | `docs/adr/PAQ-12-ADVISOR-EXPERIENCE-INTELLIGENCE-PRODUCTIVITY.md` | `SCHEMA_CATALOG.md` | `docs/adr/SCHEMA_CATALOG.md` | RELATIVE_MARKDOWN_LINK | TARGET_EXISTS_ELSEWHERE | `docs/archive/SCHEMA_CATALOG.md` | Target relocated to archive |
| 83 | AUTO_FIX | `docs/adr/PAQ-12-ADVISOR-EXPERIENCE-INTELLIGENCE-PRODUCTIVITY.md` | `schemas/advisor.schema.json` | `docs/adr/schemas/advisor.schema.json` | RELATIVE_MARKDOWN_LINK | TARGET_EXISTS_ELSEWHERE | `schemas/advisor.schema.json` | Schema path depth points to old relative location |
| 84 | AUTO_FIX | `docs/adr/PAQ-12.1-ADVISOR-EXPERIENCE-INTELLIGENCE-ARCHITECTURE.md` | `FORGE_MASTER_BUILD_TREE.md` | `docs/adr/FORGE_MASTER_BUILD_TREE.md` | RELATIVE_MARKDOWN_LINK | TARGET_EXISTS_ELSEWHERE | `FORGE_MASTER_BUILD_TREE.md` | Protected root anchor referenced from moved documentation |
| 85 | AUTO_FIX | `docs/adr/PAQ-12.1-ADVISOR-EXPERIENCE-INTELLIGENCE-ARCHITECTURE.md` | `AGENTS.md` | `docs/adr/AGENTS.md` | RELATIVE_MARKDOWN_LINK | TARGET_EXISTS_ELSEWHERE | `AGENTS.md` | Protected root anchor referenced from moved documentation |
| 86 | AUTO_FIX | `docs/adr/PAQ-12.1-ADVISOR-EXPERIENCE-INTELLIGENCE-ARCHITECTURE.md` | `FORGE_CONSTITUTION_V3.md` | `docs/adr/FORGE_CONSTITUTION_V3.md` | RELATIVE_MARKDOWN_LINK | TARGET_EXISTS_ELSEWHERE | `FORGE_CONSTITUTION_V3.md` | Protected root anchor referenced from moved documentation |
| 87 | ARCHIVE_REFERENCE | `docs/adr/PAQ-12.1-ADVISOR-EXPERIENCE-INTELLIGENCE-ARCHITECTURE.md` | `FORGE_FOUNDATION_LOCK.md` | `docs/adr/FORGE_FOUNDATION_LOCK.md` | RELATIVE_MARKDOWN_LINK | TARGET_EXISTS_ELSEWHERE | `docs/archive/FORGE_FOUNDATION_LOCK.md` | Target relocated to archive |
| 88 | ARCHIVE_REFERENCE | `docs/adr/PAQ-12.1-ADVISOR-EXPERIENCE-INTELLIGENCE-ARCHITECTURE.md` | `FORGE_ADVISOR_EXPERIENCE_ARCHITECTURE.md` | `docs/adr/FORGE_ADVISOR_EXPERIENCE_ARCHITECTURE.md` | RELATIVE_MARKDOWN_LINK | TARGET_EXISTS_ELSEWHERE | `docs/archive/FORGE_ADVISOR_EXPERIENCE_ARCHITECTURE.md` | Target relocated to archive |
| 89 | AUTO_FIX | `docs/adr/PAQ-12.1-ADVISOR-EXPERIENCE-INTELLIGENCE-ARCHITECTURE.md` | `PAQ-08.5-ARCHITECTURE-RISK-CORRECTION-RATIFICATION.md` | `docs/adr/PAQ-08.5-ARCHITECTURE-RISK-CORRECTION-RATIFICATION.md` | RELATIVE_MARKDOWN_LINK | TARGET_EXISTS_ELSEWHERE | `docs/architecture/constitution/PAQ-08.5-ARCHITECTURE-RISK-CORRECTION-RATIFICATION.md` | Constitution relocation |
| 90 | ARCHIVE_REFERENCE | `docs/architecture/README.md` | `../../FORGE_FOUNDATION_LOCK.md` | `FORGE_FOUNDATION_LOCK.md` | RELATIVE_MARKDOWN_LINK | TARGET_EXISTS_ELSEWHERE | `docs/archive/FORGE_FOUNDATION_LOCK.md` | Target relocated to archive |
| 91 | AUTO_FIX | `docs/architecture/README.md` | `../../PAQ-09-PRODUCTIVITY-INTELLIGENCE-DISCOVERY.md` | `PAQ-09-PRODUCTIVITY-INTELLIGENCE-DISCOVERY.md` | RELATIVE_MARKDOWN_LINK | TARGET_EXISTS_ELSEWHERE | `docs/adr/PAQ-09-PRODUCTIVITY-INTELLIGENCE-DISCOVERY.md` | Architecture README path depth points to old root location for ADR document |
| 92 | AUTO_FIX | `docs/architecture/README.md` | `../../PAQ-09.5-PRODUCTIVITY-INTELLIGENCE-ARCHITECTURE-LOCK.md` | `PAQ-09.5-PRODUCTIVITY-INTELLIGENCE-ARCHITECTURE-LOCK.md` | RELATIVE_MARKDOWN_LINK | TARGET_EXISTS_ELSEWHERE | `docs/adr/PAQ-09.5-PRODUCTIVITY-INTELLIGENCE-ARCHITECTURE-LOCK.md` | Architecture README path depth points to old root location for ADR document |
| 93 | AUTO_FIX | `docs/architecture/README.md` | `../../PAQ-10-CONSERVATION-INTELLIGENCE-DISCOVERY.md` | `PAQ-10-CONSERVATION-INTELLIGENCE-DISCOVERY.md` | RELATIVE_MARKDOWN_LINK | TARGET_EXISTS_ELSEWHERE | `docs/adr/PAQ-10-CONSERVATION-INTELLIGENCE-DISCOVERY.md` | Architecture README path depth points to old root location for ADR document |
| 94 | AUTO_FIX | `docs/architecture/README.md` | `../../PAQ-10.5-CONSERVATION-INTELLIGENCE-ARCHITECTURE-LOCK.md` | `PAQ-10.5-CONSERVATION-INTELLIGENCE-ARCHITECTURE-LOCK.md` | RELATIVE_MARKDOWN_LINK | TARGET_EXISTS_ELSEWHERE | `docs/adr/PAQ-10.5-CONSERVATION-INTELLIGENCE-ARCHITECTURE-LOCK.md` | Architecture README path depth points to old root location for ADR document |
| 95 | AUTO_FIX | `docs/architecture/constitution/FORGE_RATIFICATION_AND_FOUNDATION_CLOSURE.md` | `FORGE_MASTER_BUILD_TREE.md` | `docs/architecture/constitution/FORGE_MASTER_BUILD_TREE.md` | RELATIVE_MARKDOWN_LINK | TARGET_EXISTS_ELSEWHERE | `FORGE_MASTER_BUILD_TREE.md` | Protected root anchor referenced from moved documentation |
| 96 | AUTO_FIX | `docs/architecture/constitution/FORGE_RATIFICATION_AND_FOUNDATION_CLOSURE.md` | `AGENTS.md` | `docs/architecture/constitution/AGENTS.md` | RELATIVE_MARKDOWN_LINK | TARGET_EXISTS_ELSEWHERE | `AGENTS.md` | Protected root anchor referenced from moved documentation |
| 97 | AUTO_FIX | `docs/architecture/constitution/FORGE_RATIFICATION_AND_FOUNDATION_CLOSURE.md` | `FORGE_CONSTITUTION_V3.md` | `docs/architecture/constitution/FORGE_CONSTITUTION_V3.md` | RELATIVE_MARKDOWN_LINK | TARGET_EXISTS_ELSEWHERE | `FORGE_CONSTITUTION_V3.md` | Protected root anchor referenced from moved documentation |
| 98 | ARCHIVE_REFERENCE | `docs/architecture/constitution/FORGE_RATIFICATION_AND_FOUNDATION_CLOSURE.md` | `FORGE_FOUNDATION_LOCK.md` | `docs/architecture/constitution/FORGE_FOUNDATION_LOCK.md` | RELATIVE_MARKDOWN_LINK | TARGET_EXISTS_ELSEWHERE | `docs/archive/FORGE_FOUNDATION_LOCK.md` | Target relocated to archive |
| 99 | AUTO_FIX | `docs/archive/FORGE_OS_CURRENT_STATE_DOMAIN_COMPENSATION_ADVISOR_EXPERIENCE.md` | `FORGE_MASTER_BUILD_TREE.md` | `docs/archive/FORGE_MASTER_BUILD_TREE.md` | RELATIVE_MARKDOWN_LINK | TARGET_EXISTS_ELSEWHERE | `FORGE_MASTER_BUILD_TREE.md` | Protected root anchor referenced from moved documentation |
| 100 | AUTO_FIX | `docs/archive/FORGE_OS_CURRENT_STATE_DOMAIN_COMPENSATION_ADVISOR_EXPERIENCE.md` | `AGENTS.md` | `docs/archive/AGENTS.md` | RELATIVE_MARKDOWN_LINK | TARGET_EXISTS_ELSEWHERE | `AGENTS.md` | Protected root anchor referenced from moved documentation |
| 101 | AUTO_FIX | `docs/archive/FORGE_OS_CURRENT_STATE_DOMAIN_COMPENSATION_ADVISOR_EXPERIENCE.md` | `FORGE_CONSTITUTION_V3.md` | `docs/archive/FORGE_CONSTITUTION_V3.md` | RELATIVE_MARKDOWN_LINK | TARGET_EXISTS_ELSEWHERE | `FORGE_CONSTITUTION_V3.md` | Protected root anchor referenced from moved documentation |
| 102 | AUTO_FIX | `docs/archive/FORGE_PHASE_TRANSITION_FOUNDATION_TO_INTELLIGENCE.md` | `FORGE_MASTER_BUILD_TREE.md` | `docs/archive/FORGE_MASTER_BUILD_TREE.md` | RELATIVE_MARKDOWN_LINK | TARGET_EXISTS_ELSEWHERE | `FORGE_MASTER_BUILD_TREE.md` | Protected root anchor referenced from moved documentation |
| 103 | AUTO_FIX | `docs/archive/FORGE_PHASE_TRANSITION_FOUNDATION_TO_INTELLIGENCE.md` | `AGENTS.md` | `docs/archive/AGENTS.md` | RELATIVE_MARKDOWN_LINK | TARGET_EXISTS_ELSEWHERE | `AGENTS.md` | Protected root anchor referenced from moved documentation |
| 104 | AUTO_FIX | `docs/archive/FORGE_PHASE_TRANSITION_FOUNDATION_TO_INTELLIGENCE.md` | `FORGE_CONSTITUTION_V3.md` | `docs/archive/FORGE_CONSTITUTION_V3.md` | RELATIVE_MARKDOWN_LINK | TARGET_EXISTS_ELSEWHERE | `FORGE_CONSTITUTION_V3.md` | Protected root anchor referenced from moved documentation |
| 105 | NEEDS_MOVE | `docs/archive/FORGE_PROJECTION_INTELLIGENCE_CHECKPOINT_NOTE.md` | `FORGE_IMAGINA_SER_REAL_QUOTE_VALIDATION_REPORT.txt` | `docs/archive/FORGE_IMAGINA_SER_REAL_QUOTE_VALIDATION_REPORT.txt` | RELATIVE_MARKDOWN_LINK | TARGET_EXISTS_ELSEWHERE | `FORGE_IMAGINA_SER_REAL_QUOTE_VALIDATION_REPORT.txt` | Root validation artifact still pending ownership or archive placement |
| 106 | NEEDS_MOVE | `docs/archive/FORGE_PROJECTION_INTELLIGENCE_CHECKPOINT_NOTE.md` | `FORGE_PROJECTION_ENGINE_VS_EXCEL_VALIDATION_REPORT.txt` | `docs/archive/FORGE_PROJECTION_ENGINE_VS_EXCEL_VALIDATION_REPORT.txt` | RELATIVE_MARKDOWN_LINK | TARGET_EXISTS_ELSEWHERE | `FORGE_PROJECTION_ENGINE_VS_EXCEL_VALIDATION_REPORT.txt` | Root validation artifact still pending ownership or archive placement |
| 107 | NEEDS_MOVE | `docs/archive/FORGE_PROJECTION_INTELLIGENCE_CHECKPOINT_NOTE.md` | `FORGE_GLOBAL_UDI_PROJECTION_VALIDATION_REPORT.txt` | `docs/archive/FORGE_GLOBAL_UDI_PROJECTION_VALIDATION_REPORT.txt` | RELATIVE_MARKDOWN_LINK | TARGET_EXISTS_ELSEWHERE | `FORGE_GLOBAL_UDI_PROJECTION_VALIDATION_REPORT.txt` | Root validation artifact still pending ownership or archive placement |
| 108 | AUTO_FIX | `docs/archive/FORGE_PROJECTION_INTELLIGENCE_CHECKPOINT_NOTE.md` | `FORGE_GLOBAL_UDI_PROJECTION_PRODUCT_INTERPRETATION.md` | `docs/archive/FORGE_GLOBAL_UDI_PROJECTION_PRODUCT_INTERPRETATION.md` | RELATIVE_MARKDOWN_LINK | TARGET_EXISTS_ELSEWHERE | `docs/architecture/product-intelligence/FORGE_GLOBAL_UDI_PROJECTION_PRODUCT_INTERPRETATION.md` | Product intelligence relocation |
| 109 | AUTO_FIX | `docs/archive/FORGE_SHARED_COMMERCIAL_MODEL_EVIDENCE_PROVENANCE_FOUNDATION.md` | `FORGE_MASTER_BUILD_TREE.md` | `docs/archive/FORGE_MASTER_BUILD_TREE.md` | RELATIVE_MARKDOWN_LINK | TARGET_EXISTS_ELSEWHERE | `FORGE_MASTER_BUILD_TREE.md` | Protected root anchor referenced from moved documentation |
| 110 | AUTO_FIX | `docs/archive/FORGE_SHARED_COMMERCIAL_MODEL_EVIDENCE_PROVENANCE_FOUNDATION.md` | `AGENTS.md` | `docs/archive/AGENTS.md` | RELATIVE_MARKDOWN_LINK | TARGET_EXISTS_ELSEWHERE | `AGENTS.md` | Protected root anchor referenced from moved documentation |
| 111 | AUTO_FIX | `docs/archive/FORGE_SHARED_COMMERCIAL_MODEL_EVIDENCE_PROVENANCE_FOUNDATION.md` | `FORGE_CONSTITUTION_V3.md` | `docs/archive/FORGE_CONSTITUTION_V3.md` | RELATIVE_MARKDOWN_LINK | TARGET_EXISTS_ELSEWHERE | `FORGE_CONSTITUTION_V3.md` | Protected root anchor referenced from moved documentation |
| 112 | AUTO_FIX | `docs/archive/FORGE_SHARED_COMMERCIAL_MODEL_FOUNDATION_REVIEW.md` | `FORGE_MASTER_BUILD_TREE.md` | `docs/archive/FORGE_MASTER_BUILD_TREE.md` | RELATIVE_MARKDOWN_LINK | TARGET_EXISTS_ELSEWHERE | `FORGE_MASTER_BUILD_TREE.md` | Protected root anchor referenced from moved documentation |
| 113 | AUTO_FIX | `docs/archive/FORGE_SHARED_COMMERCIAL_MODEL_FOUNDATION_REVIEW.md` | `AGENTS.md` | `docs/archive/AGENTS.md` | RELATIVE_MARKDOWN_LINK | TARGET_EXISTS_ELSEWHERE | `AGENTS.md` | Protected root anchor referenced from moved documentation |
| 114 | AUTO_FIX | `docs/archive/FORGE_SHARED_COMMERCIAL_MODEL_FOUNDATION_REVIEW.md` | `FORGE_CONSTITUTION_V3.md` | `docs/archive/FORGE_CONSTITUTION_V3.md` | RELATIVE_MARKDOWN_LINK | TARGET_EXISTS_ELSEWHERE | `FORGE_CONSTITUTION_V3.md` | Protected root anchor referenced from moved documentation |
| 115 | AUTO_FIX | `docs/archive/FORGE_SHARED_COMMERCIAL_MODEL_IDENTITY_ATTRIBUTION_HARDENING.md` | `FORGE_MASTER_BUILD_TREE.md` | `docs/archive/FORGE_MASTER_BUILD_TREE.md` | RELATIVE_MARKDOWN_LINK | TARGET_EXISTS_ELSEWHERE | `FORGE_MASTER_BUILD_TREE.md` | Protected root anchor referenced from moved documentation |
| 116 | AUTO_FIX | `docs/archive/FORGE_SHARED_COMMERCIAL_MODEL_IDENTITY_ATTRIBUTION_HARDENING.md` | `AGENTS.md` | `docs/archive/AGENTS.md` | RELATIVE_MARKDOWN_LINK | TARGET_EXISTS_ELSEWHERE | `AGENTS.md` | Protected root anchor referenced from moved documentation |
| 117 | AUTO_FIX | `docs/archive/FORGE_SHARED_COMMERCIAL_MODEL_IDENTITY_ATTRIBUTION_HARDENING.md` | `FORGE_CONSTITUTION_V3.md` | `docs/archive/FORGE_CONSTITUTION_V3.md` | RELATIVE_MARKDOWN_LINK | TARGET_EXISTS_ELSEWHERE | `FORGE_CONSTITUTION_V3.md` | Protected root anchor referenced from moved documentation |
| 118 | AUTO_FIX | `docs/archive/FORGE_SHARED_COMMERCIAL_MODEL_PERIODS_OPERATIONAL_CLOCKS_HARDENING.md` | `FORGE_MASTER_BUILD_TREE.md` | `docs/archive/FORGE_MASTER_BUILD_TREE.md` | RELATIVE_MARKDOWN_LINK | TARGET_EXISTS_ELSEWHERE | `FORGE_MASTER_BUILD_TREE.md` | Protected root anchor referenced from moved documentation |
| 119 | AUTO_FIX | `docs/archive/FORGE_SHARED_COMMERCIAL_MODEL_PERIODS_OPERATIONAL_CLOCKS_HARDENING.md` | `AGENTS.md` | `docs/archive/AGENTS.md` | RELATIVE_MARKDOWN_LINK | TARGET_EXISTS_ELSEWHERE | `AGENTS.md` | Protected root anchor referenced from moved documentation |
| 120 | AUTO_FIX | `docs/archive/FORGE_SHARED_COMMERCIAL_MODEL_PERIODS_OPERATIONAL_CLOCKS_HARDENING.md` | `FORGE_CONSTITUTION_V3.md` | `docs/archive/FORGE_CONSTITUTION_V3.md` | RELATIVE_MARKDOWN_LINK | TARGET_EXISTS_ELSEWHERE | `FORGE_CONSTITUTION_V3.md` | Protected root anchor referenced from moved documentation |
| 121 | AUTO_FIX | `docs/archive/superseded/FORGE_CONSTITUTION_AMENDMENT_v1.1_ROOT_CONVERSION.md` | `FORGE_MASTER_BUILD_TREE.md` | `docs/archive/superseded/FORGE_MASTER_BUILD_TREE.md` | RELATIVE_MARKDOWN_LINK | TARGET_EXISTS_ELSEWHERE | `FORGE_MASTER_BUILD_TREE.md` | Protected root anchor referenced from moved documentation |
| 122 | AUTO_FIX | `docs/archive/superseded/FORGE_CONSTITUTION_AMENDMENT_v1.1_ROOT_CONVERSION.md` | `AGENTS.md` | `docs/archive/superseded/AGENTS.md` | RELATIVE_MARKDOWN_LINK | TARGET_EXISTS_ELSEWHERE | `AGENTS.md` | Protected root anchor referenced from moved documentation |
| 123 | AUTO_FIX | `docs/archive/superseded/FORGE_CONSTITUTION_AMENDMENT_v1.1_ROOT_CONVERSION.md` | `FORGE_CONSTITUTION_V3.md` | `docs/archive/superseded/FORGE_CONSTITUTION_V3.md` | RELATIVE_MARKDOWN_LINK | TARGET_EXISTS_ELSEWHERE | `FORGE_CONSTITUTION_V3.md` | Protected root anchor referenced from moved documentation |
| 124 | ARCHIVE_REFERENCE | `docs/archive/superseded/FORGE_CONSTITUTION_AMENDMENT_v1.1_ROOT_CONVERSION.md` | `FORGE_FOUNDATION_LOCK.md` | `docs/archive/superseded/FORGE_FOUNDATION_LOCK.md` | RELATIVE_MARKDOWN_LINK | TARGET_EXISTS_ELSEWHERE | `docs/archive/FORGE_FOUNDATION_LOCK.md` | Target relocated to archive |

## 4. Root Causes

| Root Cause | Count |
| --- | ---: |
| Protected root anchor referenced from moved documentation | 89 |
| Target relocated to archive | 25 |
| Architecture README path depth points to old root location for ADR document | 4 |
| Root validation artifact still pending ownership or archive placement | 3 |
| Constitution relocation | 1 |
| Product intelligence relocation | 1 |
| Schema path depth points to old relative location | 1 |

## 5. Ownership Matrix

| Category | Constitutional Owner | Governance Rule |
| --- | --- | --- |
| AUTO_FIX | Repository Governance | Approves automated path rewrite when target exists exactly elsewhere and ownership is already known. |
| ARCHIVE_REFERENCE | Archive Governance | Ensures historical documents are linked as archive, not current doctrine. |
| NEEDS_MOVE | Repository Governance + Evidence Archive Governance | Decides target placement before any link rewrite. |
| DEAD_LINK | Repository Governance | Requires deletion-history evidence before removing references. |
| HUMAN_REVIEW | Constitution Council | Handles ambiguous ownership or constitutional impact. |

## 6. Remediation Waves

| Wave | Scope | Categories | Estimated Count | Risk | Validation Required |
| --- | --- | --- | ---: | --- | --- |
| Wave 1 | Low-risk AUTO_FIX | AUTO_FIX | 96 | Low | Run harness links and check reports; verify protected root relative paths. |
| Wave 2 | Archive references | ARCHIVE_REFERENCE | 25 | Low-medium | Confirm archive intent is visible in link text or surrounding prose. |
| Wave 3 | Needs Move | NEEDS_MOVE | 3 | Medium | Resolve ownership before rewriting any link. |
| Wave 4 | Human Review | HUMAN_REVIEW + DEAD_LINK | 0 | High | Council review before removal or rewrite. |

## 7. Top 25 Priority Links

| Rank | Category | Source File | Referenced Path | Inbound Target Count | Importance | Recommended Treatment |
| ---: | --- | --- | --- | ---: | --- | --- |
| 1 | AUTO_FIX | `docs/adr/PAQ-01-RECRUITMENT-INTELLIGENCE-DISCOVERY.md` | `FORGE_CONSTITUTION_V3.md` | 30 | Constitutional | Rewrite relative path to protected root anchor. |
| 2 | AUTO_FIX | `docs/adr/PAQ-02-RECRUITMENT-DOMAIN-MODEL-ADDENDUM.md` | `FORGE_CONSTITUTION_V3.md` | 30 | Constitutional | Rewrite relative path to protected root anchor. |
| 3 | AUTO_FIX | `docs/adr/PAQ-02-RECRUITMENT-DOMAIN-MODEL.md` | `FORGE_CONSTITUTION_V3.md` | 30 | Constitutional | Rewrite relative path to protected root anchor. |
| 4 | AUTO_FIX | `docs/adr/PAQ-03-CAREER-CAPITAL-RELATIONSHIP-CAPITAL-BOUNDARY-REVIEW.md` | `FORGE_CONSTITUTION_V3.md` | 30 | Constitutional | Rewrite relative path to protected root anchor. |
| 5 | AUTO_FIX | `docs/adr/PAQ-04-METRICS-OWNERSHIP-FINALIZATION.md` | `FORGE_CONSTITUTION_V3.md` | 30 | Constitutional | Rewrite relative path to protected root anchor. |
| 6 | AUTO_FIX | `docs/adr/PAQ-04-P200-MARKET-NATURAL-DISCOVERY-REVIEW.md` | `FORGE_CONSTITUTION_V3.md` | 30 | Constitutional | Rewrite relative path to protected root anchor. |
| 7 | AUTO_FIX | `docs/adr/PAQ-05-RELATIONSHIP-ACTIVATION-REVIEW.md` | `FORGE_CONSTITUTION_V3.md` | 30 | Constitutional | Rewrite relative path to protected root anchor. |
| 8 | AUTO_FIX | `docs/adr/PAQ-05-RULE-SNAPSHOT-HARDENING.md` | `FORGE_CONSTITUTION_V3.md` | 30 | Constitutional | Rewrite relative path to protected root anchor. |
| 9 | AUTO_FIX | `docs/adr/PAQ-06-COMMERCIAL-EVENTS-TAXONOMY.md` | `FORGE_CONSTITUTION_V3.md` | 30 | Constitutional | Rewrite relative path to protected root anchor. |
| 10 | AUTO_FIX | `docs/adr/PAQ-06-RECRUITMENT-HARDENING-REVIEW.md` | `FORGE_CONSTITUTION_V3.md` | 30 | Constitutional | Rewrite relative path to protected root anchor. |
| 11 | AUTO_FIX | `docs/adr/PAQ-07-FOUNDATION-LOCK-REVIEW.md` | `FORGE_CONSTITUTION_V3.md` | 30 | Constitutional | Rewrite relative path to protected root anchor. |
| 12 | AUTO_FIX | `docs/adr/PAQ-07-PARTNER-INTELLIGENCE-DISCOVERY.md` | `FORGE_CONSTITUTION_V3.md` | 30 | Constitutional | Rewrite relative path to protected root anchor. |
| 13 | AUTO_FIX | `docs/adr/PAQ-08-ADVISOR-DEVELOPMENT-INTELLIGENCE-DISCOVERY.md` | `FORGE_CONSTITUTION_V3.md` | 30 | Constitutional | Rewrite relative path to protected root anchor. |
| 14 | AUTO_FIX | `docs/adr/PAQ-08-FOUNDATION-LOCK-FINAL-REVIEW.md` | `FORGE_CONSTITUTION_V3.md` | 30 | Constitutional | Rewrite relative path to protected root anchor. |
| 15 | AUTO_FIX | `docs/adr/PAQ-09-PRODUCTIVITY-INTELLIGENCE-DISCOVERY.md` | `FORGE_CONSTITUTION_V3.md` | 30 | Constitutional | Rewrite relative path to protected root anchor. |
| 16 | AUTO_FIX | `docs/adr/PAQ-09.5-PRODUCTIVITY-INTELLIGENCE-ARCHITECTURE-LOCK.md` | `FORGE_CONSTITUTION_V3.md` | 30 | Constitutional | Rewrite relative path to protected root anchor. |
| 17 | AUTO_FIX | `docs/adr/PAQ-10-CONSERVATION-INTELLIGENCE-DISCOVERY.md` | `FORGE_CONSTITUTION_V3.md` | 30 | Constitutional | Rewrite relative path to protected root anchor. |
| 18 | AUTO_FIX | `docs/adr/PAQ-10.5-CONSERVATION-INTELLIGENCE-ARCHITECTURE-LOCK.md` | `FORGE_CONSTITUTION_V3.md` | 30 | Constitutional | Rewrite relative path to protected root anchor. |
| 19 | AUTO_FIX | `docs/adr/PAQ-11.5-FORECAST-INTELLIGENCE-ARCHITECTURE.md` | `FORGE_CONSTITUTION_V3.md` | 30 | Constitutional | Rewrite relative path to protected root anchor. |
| 20 | AUTO_FIX | `docs/adr/PAQ-11.5-FORECAST-INTELLIGENCE-ARCHITECTURE.md` | `FORGE_CONSTITUTION_V3.md` | 30 | Constitutional | Rewrite relative path to protected root anchor. |
| 21 | AUTO_FIX | `docs/adr/PAQ-12-ADVISOR-EXPERIENCE-INTELLIGENCE-PRODUCTIVITY.md` | `FORGE_CONSTITUTION_V3.md` | 30 | Constitutional | Rewrite relative path to protected root anchor. |
| 22 | AUTO_FIX | `docs/adr/PAQ-12.1-ADVISOR-EXPERIENCE-INTELLIGENCE-ARCHITECTURE.md` | `FORGE_CONSTITUTION_V3.md` | 30 | Constitutional | Rewrite relative path to protected root anchor. |
| 23 | AUTO_FIX | `docs/architecture/constitution/FORGE_RATIFICATION_AND_FOUNDATION_CLOSURE.md` | `FORGE_CONSTITUTION_V3.md` | 30 | Constitutional | Rewrite relative path to protected root anchor. |
| 24 | AUTO_FIX | `docs/archive/FORGE_OS_CURRENT_STATE_DOMAIN_COMPENSATION_ADVISOR_EXPERIENCE.md` | `FORGE_CONSTITUTION_V3.md` | 30 | Constitutional | Rewrite relative path to protected root anchor. |
| 25 | AUTO_FIX | `docs/archive/FORGE_PHASE_TRANSITION_FOUNDATION_TO_INTELLIGENCE.md` | `FORGE_CONSTITUTION_V3.md` | 30 | Constitutional | Rewrite relative path to protected root anchor. |

## 8. Grouped Target Summary

| Target | Inbound Count | Category | Alternative Target(s) | Root Cause | Owner |
| --- | ---: | --- | --- | --- | --- |
| `AGENTS.md` | 30 | AUTO_FIX | AGENTS.md | Protected root anchor referenced from moved documentation | Repository Governance + Operational/Constitution/Architecture Governance |
| `FORGE_CONSTITUTION_V3.md` | 30 | AUTO_FIX | FORGE_CONSTITUTION_V3.md | Protected root anchor referenced from moved documentation | Repository Governance + Operational/Constitution/Architecture Governance |
| `FORGE_MASTER_BUILD_TREE.md` | 29 | AUTO_FIX | FORGE_MASTER_BUILD_TREE.md | Protected root anchor referenced from moved documentation | Repository Governance + Operational/Constitution/Architecture Governance |
| `FORGE_FOUNDATION_LOCK.md` | 22 | ARCHIVE_REFERENCE | docs/archive/FORGE_FOUNDATION_LOCK.md | Target relocated to archive | Archive Governance |
| `FORGE_ADVISOR_EXPERIENCE_ARCHITECTURE.md` | 2 | ARCHIVE_REFERENCE | docs/archive/FORGE_ADVISOR_EXPERIENCE_ARCHITECTURE.md | Target relocated to archive | Archive Governance |
| `advisor.schema.json` | 1 | AUTO_FIX | schemas/advisor.schema.json | Schema path depth points to old relative location | Schema Governance + Repository Governance |
| `FORGE_GLOBAL_UDI_PROJECTION_PRODUCT_INTERPRETATION.md` | 1 | AUTO_FIX | docs/architecture/product-intelligence/FORGE_GLOBAL_UDI_PROJECTION_PRODUCT_INTERPRETATION.md | Product intelligence relocation | Product Intelligence Governance |
| `FORGE_GLOBAL_UDI_PROJECTION_VALIDATION_REPORT.txt` | 1 | NEEDS_MOVE | FORGE_GLOBAL_UDI_PROJECTION_VALIDATION_REPORT.txt | Root validation artifact still pending ownership or archive placement | Repository Governance + Evidence Archive Governance |
| `FORGE_IMAGINA_SER_REAL_QUOTE_VALIDATION_REPORT.txt` | 1 | NEEDS_MOVE | FORGE_IMAGINA_SER_REAL_QUOTE_VALIDATION_REPORT.txt | Root validation artifact still pending ownership or archive placement | Repository Governance + Evidence Archive Governance |
| `FORGE_PROJECTION_ENGINE_VS_EXCEL_VALIDATION_REPORT.txt` | 1 | NEEDS_MOVE | FORGE_PROJECTION_ENGINE_VS_EXCEL_VALIDATION_REPORT.txt | Root validation artifact still pending ownership or archive placement | Repository Governance + Evidence Archive Governance |
| `PAQ-08.5-ARCHITECTURE-RISK-CORRECTION-RATIFICATION.md` | 1 | AUTO_FIX | docs/architecture/constitution/PAQ-08.5-ARCHITECTURE-RISK-CORRECTION-RATIFICATION.md | Constitution relocation | Constitution Governance |
| `PAQ-09-PRODUCTIVITY-INTELLIGENCE-DISCOVERY.md` | 1 | AUTO_FIX | docs/adr/PAQ-09-PRODUCTIVITY-INTELLIGENCE-DISCOVERY.md | Architecture README path depth points to old root location for ADR document | Repository Governance + ADR Governance |
| `PAQ-09.5-PRODUCTIVITY-INTELLIGENCE-ARCHITECTURE-LOCK.md` | 1 | AUTO_FIX | docs/adr/PAQ-09.5-PRODUCTIVITY-INTELLIGENCE-ARCHITECTURE-LOCK.md | Architecture README path depth points to old root location for ADR document | Repository Governance + ADR Governance |
| `PAQ-10-CONSERVATION-INTELLIGENCE-DISCOVERY.md` | 1 | AUTO_FIX | docs/adr/PAQ-10-CONSERVATION-INTELLIGENCE-DISCOVERY.md | Architecture README path depth points to old root location for ADR document | Repository Governance + ADR Governance |
| `PAQ-10.5-CONSERVATION-INTELLIGENCE-ARCHITECTURE-LOCK.md` | 1 | AUTO_FIX | docs/adr/PAQ-10.5-CONSERVATION-INTELLIGENCE-ARCHITECTURE-LOCK.md | Architecture README path depth points to old root location for ADR document | Repository Governance + ADR Governance |
| `SCHEMA_CATALOG.md` | 1 | ARCHIVE_REFERENCE | docs/archive/SCHEMA_CATALOG.md | Target relocated to archive | Archive Governance |

## 9. Recommended Next Action

Recommended REPO-009 scope: generate a dry-run rewrite map for Wave 1 `AUTO_FIX` links only. The map should include old link, proposed relative link, target proof and owner. It should not write changes until separately approved.

Wave 1 should start with protected root anchors from `docs/adr/*` because the target files exist, are protected by governance, and the issue is relative path depth rather than missing ownership.
