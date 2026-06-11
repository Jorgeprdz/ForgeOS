# Forge Phase 2.1 Build Tree Decision Notes

Status: Documentation-only notes.
FORGE_MASTER_BUILD_TREE.md was not updated in Phase 2.1.

## Purpose

Record domain review requirements before physical reorganization.

## Notes by Domain

- 09 UNIVERSAL COMMAND OS: keep Command OS as infrastructure. Alfred / Universal Command Bar remains advisor-facing experience.
- 10 PLATFORM SERVICES: app.js is DO NOT TOUCH without test plan. Event bus/domain events need consolidation ADR before changes.
- COMPENSATION INTELLIGENCE: SMNYL compensation modules require Rule Pack/source documentation before movement or formula approval.
- 04 PRODUCT INTELLIGENCE ENGINE: product-specific values and projections require source docs. Product Truth is not underwriting outcome.
- 07 POLICY & SALES OPERATIONS: cartera and policy lifecycle modules need import, lifecycle and fixture tests before any split.
- 12 ADVISOR EXPERIENCE INTELLIGENCE: UI can guide and explain, but must not own business truth.
- FORECAST INTELLIGENCE: projections need rate/source validation and must not promise income.
- 03 NASH CONVERSATION INTELLIGENCE / 02 SALES CONVERSION ENGINE: followup, objection and performance modules need ownership comparison before consolidation.
- 08 MANAGER & TEAM INTELLIGENCE: candidate and coachability modules need Recruitment vs Advisor Development boundary review.
- UNKNOWN / NEEDS REVIEW: no deletion or movement until owner decision.

## Suggested Build Tree Annotation Later

Phase 2.1 Decision Log pending before physical refactor.

## Final Position

Do not restructure Build Tree branches or file locations until Phase 2.1 decisions are reviewed and ADRs are accepted.
