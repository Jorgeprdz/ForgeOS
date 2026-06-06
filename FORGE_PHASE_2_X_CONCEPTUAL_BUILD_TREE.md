# Forge OS Phase 2.X Conceptual Build Tree Update

Status: Conceptual only. FORGE_MASTER_BUILD_TREE.md was not modified.

## LEGACY_CRM_ADDLIFE_ROOT

- app.js
- dashboard.js
- utils.js
- store.js
- runtime.js
- db.js
- sync-engine.js
- service-worker.js
- index.* if present

Rule: DO NOT TOUCH or REVIEW REQUIRED until migration ADR and tests exist.

## FORGE CORE / PLATFORM SERVICES

- App Shell / Root Orchestration
- Runtime, storage, sync, service worker, logger, telemetry
- Event bus and domain event infrastructure
- Package/config/schema files as protected surfaces

## DOMAIN BRANCHES

- Revenue Generation
- Sales Conversion
- Nash Conversation Intelligence
- Product Intelligence
- Relationship Intelligence
- Learning Intelligence
- Policy & Sales Operations
- Manager & Team Intelligence
- Command OS
- Alfred / Universal Command Bar
- Advisor Experience Intelligence
- Productivity Intelligence
- Conservation Intelligence
- Forecast Intelligence
- Compensation Intelligence
- Economic Motivation
- Shared Commercial Model
- Shared Core
- Evidence & Provenance
- RuleSnapshot / Rule Pack
- PeriodSnapshot / Operational Clocks

## Required ADRs Before Physical Movement

- Legacy CRM AddLife Root migration ADR
- Alfred / Universal Command Bar vs Command OS ADR
- Compensation vs RuleSnapshot / Rule Pack ADR
- Forecast Predictive Truth vs Economic Motivation ADR
- Policy & Sales Operations / Cartera split ADR
- Event Bus / Domain Events consolidation ADR
- Nash vs Sales Conversion vs Mick/Productivity ownership ADR

## Final Note

This conceptual Build Tree is a planning artifact only. It does not alter the repository Build Tree or approve file movement.
