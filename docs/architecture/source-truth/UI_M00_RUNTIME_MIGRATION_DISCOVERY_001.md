# UI-M00 — Runtime Migration Discovery

## Contract

- Phase: `UI_M00_RUNTIME_MIGRATION_DISCOVERY`
- Documentation only: **YES**
- Runtime mutation: **NO**
- Source branch: `feature/nfast-09-timeline-to-conversation-brief-projection`
- Source commit: `7faf7ce20470fa076afdef1b75f909333686425b`
- Target branch: `feature/ui-material3-runtime-migration`
- UI authority branch: `feature/ui-material3-design-system`
- UI authority commit: `93f1ed317acad257ecd63879a37c977858d7eea2`
- UI prototype source commit: `aeffc2e493ff9b5b3cf3cdb90e1f3c22d026b365`

## Purpose

Establecer el mapa real del runtime antes de integrar tokens, shell, navegación, Alfred y Home Material 3.

La fase no modifica componentes productivos. Su salida es una base verificable para UI-M01.

## Repository inventory

- Tracked files: **4752**
- Runtime files: **1664**
- Route candidates: **10**
- Home candidates: **5**
- Shell candidates: **231**
- State candidates: **6**
- Data candidates: **193**
- Style candidates: **45**
- Alfred path candidates: **206**
- Domain candidates: **451**
- Test candidates: **498**

## Framework signals

- `Vite: 8.1.5`
- `Supabase JS: ^2.108.2`
- `Playwright Test: 1.61.1`

## Entrypoints

Total detectado: **22**.

- `app.js`
- `docs/10-gui/mobile-daily/app.js`
- `docs/10-gui/mobile-daily/index.html`
- `docs/index.html`
- `docs/quote-preview-live/app.js`
- `docs/quote-preview-live/index.html`
- `docs/static-preview/forge-alive/index.html`
- `docs/static-preview/forge-alive/nueva-cotizacion/index.html`
- `docs/static-preview/templates/forge-mobile/index.html`
- `index.html`
- `platform/intelligence/contracts/index.js`
- `platform/intelligence/runtime/index.js`
- `platform/truth/index.js`
- `platform/truth/validators/index.js`
- `src/intelligence/alpha-runtime/index.js`
- `src/intelligence/claimability/index.js`
- `src/intelligence/hdl/index.js`
- `src/intelligence/ledger/index.js`
- `src/intelligence/truth-resolution/index.js`
- `supabase/functions/nash-draft-provider/index.ts`
- `supabase/functions/semantic-extract/index.ts`
- `tests/e2e/fixtures/fes03-preflight/index.html`

## Routes and navigation candidates

Total detectado: **10**.

- `.github/workflows/pages.yml`
- `app.js`
- `docs/10-gui/mobile-daily/app.js`
- `docs/quote-preview-live/app.js`
- `docs/static-preview/quote-runtime/orvi-product-intelligence/views/orvi-dashboard-view-model.js`
- `platform/app/bootstrap.js`
- `platform/app/forge-app-shell.js`
- `platform/app/runtime-listeners.js`
- `platform/intelligence/router/IntelligenceRouter.js`
- `product-intelligence/views/orvi-dashboard-view-model.js`

## Home surface candidates

Total detectado: **5**.

- `advisor-os/dashboard/dashboard-executive.js`
- `daily-points-engine.js`
- `dashboard-widget-card.tsx`
- `dashboard.js`
- `legacy/dashboard-priority-engine.js`

## App shell candidates

Total detectado: **231**.

- `app-shell-manager.js`
- `docs/07-runtime/RUNTIME-002_APP_SHELL_DEPENDENCY_MAP.md`
- `docs/07-runtime/RUNTIME-003_APP_SHELL_COUPLING_MAP.md`
- `docs/07-runtime/RUNTIME-011_APP_SHELL_LAZY_LOADING_AUDIT.md`
- `docs/07-runtime/RUNTIME-012_NAVIGATION_CONTRACT.md`
- `docs/99-archive/05-legacy/LEGACY-001_CRMADDLIFE_SHELL_BOUNDARY_AUDIT.md`
- `docs/99-archive/05-legacy/LEGACY-001_FUTURE_FORGE_SHELL.md`
- `docs/99-archive/05-legacy/LEGACY-002_MINIMUM_NAVIGATION_CONTRACT.md`
- `docs/99-archive/05-legacy/LEGACY-002_NAVIGATION_DEPENDENCY_MAP.md`
- `docs/99-archive/05-legacy/LEGACY-002_NAVIGATION_OWNERSHIP_AUDIT.md`
- `docs/99-archive/05-legacy/LEGACY-003_NAVIGATION_RUNTIME_ADAPTER_PLAN.md`
- `docs/99-archive/05-legacy/LEGACY-004_NAVIGATION_RUNTIME_ADAPTER_EXECUTION_REPORT.md`
- `docs/architecture/source-truth/ALFRED_STATIC_PREVIEW_DESKTOP_CANVAS_LAYOUT_TUNING_CLOSURE_056G6.md`
- `docs/architecture/source-truth/ALFRED_STATIC_PREVIEW_SMART_WIDGET_RESPONSIVE_LAYOUT_FIX_CLOSURE_056G4.md`
- `docs/architecture/source-truth/FORGE_ADVISOR_OS_PIPELINE_LIVE_MOUNT_NAVIGATION_RECONCILIATION_067G16.md`
- `docs/architecture/source-truth/FORGE_ADVISOR_SALES_PIPELINE_RESPONSIVE_LAYOUT_COLOR_AND_ROUTE_HYDRATION_REPAIR_067G16C.md`
- `docs/architecture/source-truth/FORGE_ALIVE_COMMAND_BAR_DESKTOP_LANDSCAPE_LAYOUT_TUNING_CLOSURE_053Y.md`
- `docs/architecture/source-truth/FORGE_ALIVE_DESKTOP_LANDSCAPE_COCKPIT_LAYOUT_IMPLEMENTATION_CLOSURE_054B.md`
- `docs/architecture/source-truth/FORGE_ALIVE_DESKTOP_LANDSCAPE_COCKPIT_LAYOUT_SCOPE_054A.md`
- `docs/architecture/source-truth/FORGE_ALIVE_SHELL_IMPLEMENTATION_CLOSURE_043B.md`
- `docs/architecture/source-truth/FORGE_ALIVE_SHELL_SCOPE_043A.md`
- `docs/architecture/source-truth/FORGE_MOBILE_NAVIGATION_AND_SMART_WIDGET_PATTERN_SCOPE_057C.md`
- `docs/architecture/source-truth/FORGE_PROFILE_MENU_PREP_SIDEBAR_IDENTITY_REPAIR_CLOSURE_060Y.md`
- `docs/architecture/source-truth/FORGE_QUOTE_PREVIEW_LAYOUT_LABEL_MAP_DRY_RUN_106M.md`
- `docs/architecture/source-truth/FORGE_QUOTE_PREVIEW_LAYOUT_LABEL_MAP_GATE_106L.md`
- `docs/architecture/source-truth/FORGE_QUOTE_PREVIEW_SAFE_LOCAL_HASH_NAVIGATION_FAST_TRACK_101ABCD.md`
- `docs/architecture/source-truth/FORGE_QUOTE_PREVIEW_SAFE_LOCAL_HASH_NAVIGATION_NAV_ITEM_CLASS_REPAIR_104R2R.md`
- `docs/architecture/source-truth/FORGE_QUOTE_PREVIEW_SAFE_LOCAL_HASH_NAVIGATION_NAV_ITEM_SIZE_REPAIR_104R3.md`
- `docs/architecture/source-truth/FORGE_QUOTE_PREVIEW_SAFE_LOCAL_HASH_NAVIGATION_SOURCE_PATCH_FAST_TRACK_102BCD.md`
- `docs/architecture/source-truth/FORGE_QUOTE_PREVIEW_SAFE_LOCAL_HASH_NAVIGATION_SOURCE_PATCH_REGRESSION_FAST_TRACK_103ABCDEFG.md`
- `docs/architecture/source-truth/FORGE_QUOTE_PREVIEW_SAFE_LOCAL_HASH_NAVIGATION_SOURCE_PATCH_SCOPE_102A.md`
- `docs/architecture/source-truth/FORGE_QUOTE_PREVIEW_SAFE_LOCAL_HASH_NAVIGATION_VISIBLE_LINK_UI_REPAIR_104R.md`
- `docs/architecture/source-truth/FORGE_QUOTE_PREVIEW_SAFE_LOCAL_HASH_NAVIGATION_VISUAL_CONFIRMATION_FAST_TRACK_104ABCD.md`
- `docs/architecture/source-truth/FORGE_QUOTE_PREVIEW_SAFE_MODULE_ENTRY_NAVIGATION_BINDING_FAST_TRACK_098BCD.md`
- `docs/architecture/source-truth/FORGE_QUOTE_PREVIEW_SAFE_MODULE_ENTRY_NAVIGATION_BINDING_SCOPE_098A.md`
- `docs/architecture/source-truth/FORGE_QUOTE_PREVIEW_SAFE_MODULE_ENTRY_NAVIGATION_BINDING_SOURCE_PATCH_FAST_TRACK_099BCD.md`
- `docs/architecture/source-truth/FORGE_QUOTE_PREVIEW_SAFE_MODULE_ENTRY_NAVIGATION_BINDING_SOURCE_PATCH_REGRESSION_FAST_TRACK_100ABCDEFG.md`
- `docs/architecture/source-truth/FORGE_QUOTE_PREVIEW_SAFE_MODULE_ENTRY_NAVIGATION_BINDING_SOURCE_PATCH_SCOPE_099A.md`
- `docs/architecture/source-truth/FORGE_QUOTE_PREVIEW_SAFE_VISUAL_LAYOUT_SPEC_DECISION_LOCK_089D.md`
- `docs/architecture/source-truth/FORGE_QUOTE_PREVIEW_SAFE_VISUAL_LAYOUT_SPEC_IMPLEMENTATION_089B.md`
- `docs/architecture/source-truth/FORGE_QUOTE_PREVIEW_SAFE_VISUAL_LAYOUT_SPEC_QA_LOCK_089C.md`
- `docs/architecture/source-truth/FORGE_QUOTE_PREVIEW_SAFE_VISUAL_LAYOUT_SPEC_SCOPE_089A.md`
- `docs/architecture/source-truth/FORGE_QUOTE_PREVIEW_SAFE_VISUAL_LAYOUT_SPEC_TEMPLATE_RECONCILIATION_089R.md`
- `docs/architecture/source-truth/FORGE_TOPBAR_PROFILE_ICON_CLEANUP_CLOSURE_060Z.md`
- `docs/architecture/source-truth/FORGE_TOPBAR_PROFILE_ICON_CLEANUP_VISUAL_QA_LOCK_CLOSURE_061A.md`
- `docs/design/forge-ui/FORGE_MOBILE_NAVIGATION_AND_SMART_WIDGET_PATTERN_057C.md`
- `docs/evidence/ALFRED_STATIC_PREVIEW_DESKTOP_CANVAS_LAYOUT_TUNING_056G6.md`
- `docs/evidence/ALFRED_STATIC_PREVIEW_DESKTOP_CANVAS_LAYOUT_TUNING_CERTIFICATE_056G6.md`
- `docs/evidence/ALFRED_STATIC_PREVIEW_SMART_WIDGET_RESPONSIVE_LAYOUT_FIX_056G4.md`
- `docs/evidence/ALFRED_STATIC_PREVIEW_SMART_WIDGET_RESPONSIVE_LAYOUT_FIX_CERTIFICATE_056G4.md`
- `docs/evidence/FORGE_ALIVE_COMMAND_BAR_DESKTOP_LANDSCAPE_LAYOUT_TUNING_CERTIFICATE_053Y.md`
- `docs/evidence/FORGE_ALIVE_DESKTOP_LANDSCAPE_COCKPIT_LAYOUT_IMPLEMENTATION_CERTIFICATE_054B.md`
- `docs/evidence/FORGE_ALIVE_DESKTOP_LANDSCAPE_COCKPIT_LAYOUT_SCOPE_CERTIFICATE_054A.md`
- `docs/evidence/FORGE_ALIVE_SHELL_IMPLEMENTATION_CERTIFICATE_043B.md`
- `docs/evidence/FORGE_ALIVE_SHELL_SCOPE_CERTIFICATE_043A.md`
- `docs/evidence/FORGE_DESKTOP_SHELL_GRID_REPAIR_058D.md`
- `docs/evidence/FORGE_PROFILE_MENU_PREP_SIDEBAR_IDENTITY_REPAIR_060Y.md`
- `docs/evidence/FORGE_PROFILE_MENU_PREP_SIDEBAR_IDENTITY_REPAIR_CERTIFICATE_060Y.md`
- `docs/evidence/FORGE_QUOTE_PREVIEW_LAYOUT_LABEL_MAP_DRY_RUN_106M.md`
- `docs/evidence/FORGE_QUOTE_PREVIEW_LAYOUT_LABEL_MAP_GATE_106L.md`
- `docs/evidence/FORGE_QUOTE_PREVIEW_SAFE_LOCAL_HASH_NAVIGATION_FAST_TRACK_101ABCD.md`
- `docs/evidence/FORGE_QUOTE_PREVIEW_SAFE_LOCAL_HASH_NAVIGATION_FAST_TRACK_CERTIFICATE_101ABCD.md`
- `docs/evidence/FORGE_QUOTE_PREVIEW_SAFE_LOCAL_HASH_NAVIGATION_NAV_ITEM_CLASS_REPAIR_104R2R.md`
- `docs/evidence/FORGE_QUOTE_PREVIEW_SAFE_LOCAL_HASH_NAVIGATION_NAV_ITEM_CLASS_REPAIR_CERTIFICATE_104R2R.md`
- `docs/evidence/FORGE_QUOTE_PREVIEW_SAFE_LOCAL_HASH_NAVIGATION_NAV_ITEM_SIZE_REPAIR_104R3.md`
- `docs/evidence/FORGE_QUOTE_PREVIEW_SAFE_LOCAL_HASH_NAVIGATION_NAV_ITEM_SIZE_REPAIR_CERTIFICATE_104R3.md`
- `docs/evidence/FORGE_QUOTE_PREVIEW_SAFE_LOCAL_HASH_NAVIGATION_SOURCE_PATCH_FAST_TRACK_102BCD.md`
- `docs/evidence/FORGE_QUOTE_PREVIEW_SAFE_LOCAL_HASH_NAVIGATION_SOURCE_PATCH_FAST_TRACK_CERTIFICATE_102BCD.md`
- `docs/evidence/FORGE_QUOTE_PREVIEW_SAFE_LOCAL_HASH_NAVIGATION_SOURCE_PATCH_REGRESSION_FAST_TRACK_103ABCDEFG.md`
- `docs/evidence/FORGE_QUOTE_PREVIEW_SAFE_LOCAL_HASH_NAVIGATION_SOURCE_PATCH_REGRESSION_FAST_TRACK_CERTIFICATE_103ABCDEFG.md`
- `docs/evidence/FORGE_QUOTE_PREVIEW_SAFE_LOCAL_HASH_NAVIGATION_SOURCE_PATCH_SCOPE_102A.md`
- `docs/evidence/FORGE_QUOTE_PREVIEW_SAFE_LOCAL_HASH_NAVIGATION_SOURCE_PATCH_SCOPE_CERTIFICATE_102A.md`
- `docs/evidence/FORGE_QUOTE_PREVIEW_SAFE_LOCAL_HASH_NAVIGATION_VISIBLE_LINK_UI_REPAIR_104R.md`
- `docs/evidence/FORGE_QUOTE_PREVIEW_SAFE_LOCAL_HASH_NAVIGATION_VISIBLE_LINK_UI_REPAIR_CERTIFICATE_104R.md`
- `docs/evidence/FORGE_QUOTE_PREVIEW_SAFE_LOCAL_HASH_NAVIGATION_VISUAL_CONFIRMATION_FAST_TRACK_104ABCD.md`
- `docs/evidence/FORGE_QUOTE_PREVIEW_SAFE_LOCAL_HASH_NAVIGATION_VISUAL_CONFIRMATION_FAST_TRACK_CERTIFICATE_104ABCD.md`
- `docs/evidence/FORGE_QUOTE_PREVIEW_SAFE_MODULE_ENTRY_NAVIGATION_BINDING_FAST_TRACK_098BCD.md`
- `docs/evidence/FORGE_QUOTE_PREVIEW_SAFE_MODULE_ENTRY_NAVIGATION_BINDING_FAST_TRACK_CERTIFICATE_098BCD.md`
- `docs/evidence/FORGE_QUOTE_PREVIEW_SAFE_MODULE_ENTRY_NAVIGATION_BINDING_SCOPE_098A.md`
- `docs/evidence/FORGE_QUOTE_PREVIEW_SAFE_MODULE_ENTRY_NAVIGATION_BINDING_SCOPE_CERTIFICATE_098A.md`

## State and hooks candidates

Total detectado: **6**.

- `platform/intelligence/context/ContextBuilder.js`
- `platform/intelligence/context/ContextEnvelope.js`
- `src/services/forge-alpha-repository.js`
- `src/services/forge-alpha-service.js`
- `store.js`
- `tests/services/forge-alpha-service.test.js`

## Data binding candidates

Total detectado: **193**.

- `.github/workflows/deploy-supabase.yml`
- `FORGE_HUMAN_CAPITAL_ALLOCATION_FLOW.md`
- `FORGE_REPOSITORY_MIGRATION_PLAN.md`
- `SUPABASE_PROJECT_AUTHORITY_INVENTORY.md`
- `adr/ADR-018 — Economic Motivation Client First Boundary.txt`
- `advisor-os/offline/due-action-outbox-service.js`
- `advisor-os/offline/due-action-supabase-gateway.js`
- `advisor-os/offline/due-action-sync-service.js`
- `advisor-os/sales-pipeline/productive-prospect-service.js`
- `advisor-os/sales-pipeline/prospect-repository.js`
- `advisor-os/sales-pipeline/prospect-timeline/prospect-timeline-service.js`
- `ai-service.js`
- `base-repository.js`
- `cartera-repository.js`
- `cartera-service.js`
- `client-engagement-engine.js`
- `client-engagement-master-test.js`
- `docs/02-adr-candidates/PAQ-03-CAREER-CAPITAL-RELATIONSHIP-CAPITAL-BOUNDARY-REVIEW.md`
- `docs/02-adr-candidates/PAQ-03-CAREER-CAPITAL-RELATIONSHIP-CAPITAL-BOUNDARY-REVIEW.txt`
- `docs/03-discovery/FORGE_CLIENT_DECISION_MODEL_DISCOVERY.md`
- `docs/03-discovery/REPO-001_REPOSITORY_GOVERNANCE_DISCOVERY_REPORT.md`
- `docs/04-product-intelligence/ALFA_MEDICAL_CLIENT_MISUNDERSTANDING_DISCOVERY.md`
- `docs/05-readiness/SUPABASE_RLS_IMPLEMENTATION_READINESS_001.md`
- `docs/06-repository-governance/FORGE_CODEBASE_BUILD_TREE_UPDATE_REPORT.txt`
- `docs/06-repository-governance/FORGE_CODEBASE_CARTOGRAPHY_PHASE_1.md`
- `docs/06-repository-governance/FORGE_CODEBASE_DOMAIN_ASSIGNMENT_CONCISE.md`
- `docs/06-repository-governance/FORGE_CODEBASE_DOMAIN_ASSIGNMENT_SUMMARY.md`
- `docs/06-repository-governance/FORGE_CODEBASE_MODULE_INVENTORY_REPORT.txt`
- `docs/06-repository-governance/FORGE_CODEBASE_MODULE_TO_BRANCH_MAP.txt`
- `docs/06-repository-governance/FORGE_CODEBASE_UNKNOWN_REVIEW_QUEUE.txt`
- `docs/06-repository-governance/REPO-005_DOCUMENT_MIGRATION_EXECUTION_PLAN.md`
- `docs/06-repository-governance/REPO-006_DESTINATION_OVERWRITE_RISK_ANALYSIS.md`
- `docs/06-repository-governance/REPO-008_BROKEN_LINK_TRIAGE_REPORT.md`
- `docs/06-repository-governance/REPO-008_BROKEN_LINK_TRIAGE_SUMMARY.md`
- `docs/06-repository-governance/REPO-009_AUTO_FIX_DRY_RUN_DIFF.patch`
- `docs/06-repository-governance/REPO-009_AUTO_FIX_REWRITE_MAP.json`
- `docs/06-repository-governance/REPO-009_AUTO_FIX_REWRITE_MAP.md`
- `docs/06-repository-governance/REPO-010_EXECUTION_REPORT.md`
- `docs/06-repository-governance/REPO-011_ARCHIVE_REFERENCE_ANALYSIS.md`
- `docs/06-repository-governance/REPO-011_ARCHIVE_REFERENCE_SUMMARY.md`
- `docs/06-repository-governance/REPO-011_NEEDS_MOVE_AUDIT.md`
- `docs/06-repository-governance/REPO-012_EXECUTION_READINESS_REPORT.md`
- `docs/06-repository-governance/REPO-012_WAVE_A_DRY_RUN.patch`
- `docs/06-repository-governance/REPO-012_WAVE_A_REWRITE_MAP.json`
- `docs/06-repository-governance/REPO-012_WAVE_A_REWRITE_MAP.md`
- `docs/06-repository-governance/REPO-013_EXECUTION_REPORT.md`
- `docs/06-repository-governance/REPO-014_FINAL_7_LINK_RESOLUTION_PLAN.md`
- `docs/06-repository-governance/REPO-014_REMAINING_LINK_GOVERNANCE_REPORT.md`
- `docs/06-repository-governance/REPO-015_EXECUTION_REPORT.md`
- `docs/06-repository-governance/REPO-016_EXECUTION_READINESS_REPORT.md`
- `docs/06-repository-governance/REPO-016_PROJECTION_EVIDENCE_MOVE_MAP.md`
- `docs/06-repository-governance/REPO-016_PROJECTION_EVIDENCE_OWNERSHIP_ANALYSIS.md`
- `docs/06-repository-governance/REPO-017_EXECUTION_REPORT.md`
- `docs/06-repository-governance/REPO-018_EXECUTIVE_SUMMARY.md`
- `docs/06-repository-governance/REPO-018_REPOSITORY_MIGRATION_CLOSURE_REPORT.md`
- `docs/06-repository-governance/REPO-019_ROOT_SURFACE_GOVERNANCE_AUDIT.md`
- `docs/06-repository-governance/REPO-019_ROOT_SURFACE_MODEL.md`
- `docs/06-repository-governance/REPO_MIGRATION_HARNESS_v1.md`
- `docs/06-repository-governance/reports/ROOT_DOCS_MIGRATION_BATCH_3_MOVE_MAP.json`
- `docs/06-repository-governance/reports/ROOT_DOCS_MIGRATION_BATCH_3_MOVE_MAP.md`
- `docs/06-repository-governance/reports/broken-link-report.json`
- `docs/06-repository-governance/reports/broken-link-report.md`
- `docs/06-repository-governance/reports/duplicate-destination-report.json`
- `docs/06-repository-governance/reports/duplicate-destination-report.md`
- `docs/06-repository-governance/reports/inventory-schema-validation-report.json`
- `docs/06-repository-governance/reports/inventory-schema-validation-report.md`
- `docs/06-repository-governance/reports/migration-inventory.json`
- `docs/06-repository-governance/reports/migration-inventory.md`
- `docs/06-repository-governance/reports/migration-validation-report.json`
- `docs/06-repository-governance/reports/migration-validation-report.md`
- `docs/06-repository-governance/reports/reference-rewrite-plan.json`
- `docs/06-repository-governance/reports/reference-rewrite-plan.md`
- `docs/06-repository-governance/reports/repo-010-application-result.json`
- `docs/06-repository-governance/reports/repo-migration-check-report.json`
- `docs/06-repository-governance/reports/repo-migration-check-report.md`
- `docs/06-repository-governance/reports/test-output/broken-link-report.json`
- `docs/06-repository-governance/reports/test-output/broken-link-report.md`
- `docs/06-repository-governance/reports/test-output/duplicate-destination-report.json`
- `docs/06-repository-governance/reports/test-output/duplicate-destination-report.md`
- `docs/06-repository-governance/reports/test-output/inventory-schema-validation-report.json`

## Alfred candidates

Total detectado: **409**.

- `adr/ADR-016A-BENVENU-PURPOSE-SCARCITY-DIGNITY-BOUNDARY.md`
- `docs/00-governance/FORGE_ROBOCOP_AI_INTERPRETATION_ADDENDUM.md`
- `docs/01-constitution/FORGE_CONSTITUTION_CANDIDATES.md`
- `docs/01-constitution/FORGE_CONSTITUTION_DIGEST_001.md`
- `docs/01-constitution/FORGE_TRUTH_DEPENDENCY_MAP.md`
- `docs/02-adr-candidates/PAQ-12-ADVISOR-EXPERIENCE-INTELLIGENCE-PRODUCTIVITY.md`
- `docs/02-adr-candidates/PAQ-12.1-ADVISOR-EXPERIENCE-INTELLIGENCE-ARCHITECTURE.md`
- `docs/02-adr-candidates/PAQ-12.x.y-FIRST-WOW-MOMENT-DISCOVERY.md`
- `docs/02-adr-candidates/forge-intelligence-runtime/FIR-001-FORGE-INTELLIGENCE-RUNTIME-SPECIFICATION.md`
- `docs/02-adr-candidates/forge-intelligence-runtime/FIR-002-INTELLIGENCE-CONTRACT-SPECIFICATION.md`
- `docs/02-adr-candidates/forge-intelligence-runtime/FIR-003-CONTEXT-ENVELOPE-SPECIFICATION.md`
- `docs/02-adr-candidates/forge-intelligence-runtime/FIR-004-ACTION-AUTHORITY-SPECIFICATION.md`
- `docs/02-build-tree/FORGE_PHASE_2_1_BUILD_TREE_DECISION_NOTES.md`
- `docs/02-build-tree/FORGE_PHASE_2_X_CONCEPTUAL_BUILD_TREE.md`
- `docs/03-discovery/FORGE_CAREER_LIFECYCLE_MODEL_DISCOVERY.md`
- `docs/03-discovery/FORGE_CAREER_OPERATING_SYSTEM_DISCOVERY.md`
- `docs/03-discovery/FORGE_PROFESSIONAL_DEVELOPMENT_MODEL_DISCOVERY.md`
- `docs/05-readiness/MANAGER_CARRIER_SCOPED_VISIBILITY_DISCOVERY_001.md`
- `docs/05-readiness/SUPABASE_RLS_IMPLEMENTATION_READINESS_001.md`
- `docs/05-truth/BANXICO_RATE_SOURCE_AUDIT_001.md`
- `docs/05-truth/EVIDENCE_STATE_CONTRACT_001.md`
- `docs/05-truth/FORGE_BOOKMARK_001_TRUTH_VALIDATORS_PHASE_A_LOCK.md`
- `docs/05-truth/MARKET_DATA_SOURCE_REGISTRY_001.md`
- `docs/05-truth/RULE_SNAPSHOT_GOVERNANCE_001.md`
- `docs/05-truth/SOURCE_OWNERSHIP_REGISTRY_001.md`
- `docs/05-truth/TRUTH_BOUNDARY_001_SOURCE_TRUTH_AND_EVIDENCE_STATE.md`
- `docs/05-truth/TRUTH_BOUNDARY_002_TRUTH_TYPE_CONTRACT.md`
- `docs/05-truth/TRUTH_BOUNDARY_003_VALIDATOR_READINESS_PLAN.md`
- `docs/05-truth/TRUTH_VALIDATOR_IMPLEMENTATION_PLAN_001.md`
- `docs/06-repository-governance/FORGE_CODEBASE_CARTOGRAPHY_PHASE_1.md`
- `docs/06-repository-governance/FORGE_CODEBASE_DOMAIN_ASSIGNMENT_CONCISE.md`
- `docs/06-repository-governance/FORGE_CODEBASE_DOMAIN_ASSIGNMENT_SUMMARY.md`
- `docs/10-design/FORGE_GREEN_OWL_ENGINE_LOCK_001.md`
- `docs/10-design/FORGE_HOME_SMART_WIDGETS_CONTEXTUAL_RULE_001.md`
- `docs/10-design/FORGE_UI_LOCK_001_MI_DIA_ALFRED_COMMAND_COCKPIT.md`
- `docs/99-archive/FORGE_BENVENU_LEOPARD_EXPERIENCE_SPEC.md`
- `docs/99-archive/FORGE_PHASE_2_1_ARCHITECTURE_DECISION_LOG.md`
- `docs/99-archive/FORGE_PHASE_2_X_ARCHITECTURE_REVIEW.md`
- `docs/99-archive/FORGE_PHASE_2_X_CLOSEOUT_NOTE.md`
- `docs/99-archive/FORGE_PHASE_2_X_MODULE_MARKDOWN_BUNDLE.md`
- `docs/architecture/source-truth/ALFRED_MOBILE_DESIGN_CLOSURE_056U.md`
- `docs/architecture/source-truth/ALFRED_REVIEW_ACTION_PACKET_CONTRACT_SCOPE_054L.md`
- `docs/architecture/source-truth/ALFRED_REVIEW_ACTION_PACKET_OUTPUT_REVIEW_CLOSURE_054N.md`
- `docs/architecture/source-truth/ALFRED_REVIEW_ACTION_PACKET_READ_MODEL_IMPLEMENTATION_CLOSURE_054M.md`
- `docs/architecture/source-truth/ALFRED_REVIEW_ACTION_PACKET_STATIC_PREVIEW_BINDING_IMPLEMENTATION_CLOSURE_054S.md`
- `docs/architecture/source-truth/ALFRED_REVIEW_ACTION_PACKET_STATIC_PREVIEW_BINDING_OUTPUT_REVIEW_CLOSURE_054T.md`
- `docs/architecture/source-truth/ALFRED_REVIEW_ACTION_PACKET_STATIC_PREVIEW_BINDING_SCOPE_054R.md`
- `docs/architecture/source-truth/ALFRED_REVIEW_ACTION_PACKET_STATIC_PREVIEW_DOM_RENDERER_IMPLEMENTATION_CLOSURE_055B.md`
- `docs/architecture/source-truth/ALFRED_REVIEW_ACTION_PACKET_STATIC_PREVIEW_DOM_RENDERER_OUTPUT_REVIEW_CLOSURE_055C.md`
- `docs/architecture/source-truth/ALFRED_REVIEW_ACTION_PACKET_STATIC_PREVIEW_DOM_RENDERER_SCOPE_055A.md`
- `docs/architecture/source-truth/ALFRED_REVIEW_ACTION_PACKET_STATIC_PREVIEW_DOM_SURFACE_BINDING_IMPLEMENTATION_CLOSURE_054Y.md`
- `docs/architecture/source-truth/ALFRED_REVIEW_ACTION_PACKET_STATIC_PREVIEW_DOM_SURFACE_BINDING_OUTPUT_REVIEW_CLOSURE_054Z.md`
- `docs/architecture/source-truth/ALFRED_REVIEW_ACTION_PACKET_STATIC_PREVIEW_DOM_SURFACE_BINDING_SCOPE_054X.md`
- `docs/architecture/source-truth/ALFRED_REVIEW_ACTION_PACKET_STATIC_PREVIEW_SURFACE_BINDING_IMPLEMENTATION_CLOSURE_054V.md`
- `docs/architecture/source-truth/ALFRED_REVIEW_ACTION_PACKET_STATIC_PREVIEW_SURFACE_BINDING_OUTPUT_REVIEW_CLOSURE_054W.md`
- `docs/architecture/source-truth/ALFRED_REVIEW_ACTION_PACKET_STATIC_PREVIEW_SURFACE_BINDING_SCOPE_054U.md`
- `docs/architecture/source-truth/ALFRED_REVIEW_ACTION_PACKET_UI_BINDING_SCOPE_054O.md`
- `docs/architecture/source-truth/ALFRED_REVIEW_ACTION_PACKET_UI_VIEW_MODEL_IMPLEMENTATION_CLOSURE_054P.md`
- `docs/architecture/source-truth/ALFRED_REVIEW_ACTION_PACKET_UI_VIEW_MODEL_OUTPUT_REVIEW_CLOSURE_054Q.md`
- `docs/architecture/source-truth/ALFRED_STATIC_PREVIEW_DASHBOARD_PREMIUM_POLISH_CLOSURE_056H.md`
- `docs/architecture/source-truth/ALFRED_STATIC_PREVIEW_DESKTOP_BLANK_CSS_CASCADE_FIX_CLOSURE_056G8.md`
- `docs/architecture/source-truth/ALFRED_STATIC_PREVIEW_DESKTOP_CANVAS_LAYOUT_TUNING_CLOSURE_056G6.md`
- `docs/architecture/source-truth/ALFRED_STATIC_PREVIEW_DESKTOP_INTERACTIVE_DASHBOARD_REWORK_CLOSURE_056G7.md`
- `docs/architecture/source-truth/ALFRED_STATIC_PREVIEW_DOM_RENDERER_INTEGRATION_IMPLEMENTATION_CLOSURE_055E.md`
- `docs/architecture/source-truth/ALFRED_STATIC_PREVIEW_DOM_RENDERER_INTEGRATION_OUTPUT_REVIEW_CLOSURE_055F.md`
- `docs/architecture/source-truth/ALFRED_STATIC_PREVIEW_DOM_RENDERER_INTEGRATION_SCOPE_055D.md`
- `docs/architecture/source-truth/ALFRED_STATIC_PREVIEW_DOM_RENDERER_MOUNT_ACCESSIBILITY_QA_CLOSURE_056G.md`
- `docs/architecture/source-truth/ALFRED_STATIC_PREVIEW_DOM_RENDERER_MOUNT_FAB_PLACEMENT_TUNING_CLOSURE_056G2.md`
- `docs/architecture/source-truth/ALFRED_STATIC_PREVIEW_DOM_RENDERER_MOUNT_FLOATING_ACTION_FIX_CLOSURE_056G1.md`
- `docs/architecture/source-truth/ALFRED_STATIC_PREVIEW_DOM_RENDERER_MOUNT_OUTPUT_REVIEW_CLOSURE_056C.md`
- `docs/architecture/source-truth/ALFRED_STATIC_PREVIEW_DOM_RENDERER_MOUNT_PLACEMENT_TUNING_CLOSURE_056E.md`
- `docs/architecture/source-truth/ALFRED_STATIC_PREVIEW_DOM_RENDERER_MOUNT_PRODUCT_POLISH_CLOSURE_056F.md`
- `docs/architecture/source-truth/ALFRED_STATIC_PREVIEW_DOM_RENDERER_MOUNT_SCOPE_056A.md`
- `docs/architecture/source-truth/ALFRED_STATIC_PREVIEW_DOM_RENDERER_MOUNT_VISUAL_QA_CLOSURE_056D.md`
- `docs/architecture/source-truth/ALFRED_STATIC_PREVIEW_LANDSCAPE_FLOW_FIX_CLOSURE_056G5.md`
- `docs/architecture/source-truth/ALFRED_STATIC_PREVIEW_MOBILE_VISUAL_QA_REPAIR_CLOSURE_056J.md`
- `docs/architecture/source-truth/ALFRED_STATIC_PREVIEW_RESPONSIVE_CSS_SPLIT_MOBILE_RESTORE_CLOSURE_056I.md`
- `docs/architecture/source-truth/ALFRED_STATIC_PREVIEW_SMART_WIDGET_MOUSE_MOBILE_FIX_CLOSURE_056G3.md`
- `docs/architecture/source-truth/ALFRED_STATIC_PREVIEW_SMART_WIDGET_RESPONSIVE_LAYOUT_FIX_CLOSURE_056G4.md`
- `docs/architecture/source-truth/ALFRED_UNIVERSAL_COMMAND_MEMORY_OUTPUT_REVIEW_CLOSURE_054K.md`

## Activity, timeline and projection candidates

Total detectado: **1088**.

- `AGENTS.md`
- `FORGE_CONSTITUTION_V3.md`
- `FORGE_DUAL_INTELLIGENCE_OPERATIONAL_BLUEPRINT.md`
- `FORGE_HUMAN_CAPITAL_ALLOCATION_FLOW.md`
- `FORGE_MANAGER_OS_BLUEPRINT.md`
- `FORGE_REPOSITORY_MIGRATION_PLAN.md`
- `FORGE_UDI_PROJECTION_VALIDATION_REPORT.txt`
- `actividad.js`
- `activity-feed-engine.js`
- `activity-feed.js`
- `activity-stream-engine.js`
- `adr/ADR-010 — NASH Conversation Intelligence Boundary.txt`
- `adr/ADR-016A-BENVENU-PURPOSE-SCARCITY-DIGNITY-BOUNDARY.md`
- `advisor-lifecycle/lifecycle-to-compensation-gate.js`
- `advisor-os/advisor-activity-timeline.js`
- `advisor-os/conversation/ai-first-contact-message-engine.js`
- `advisor-os/conversation/first-contact-ai-suggestion-engine.js`
- `advisor-os/conversation/first-contact-delivery-engine.js`
- `advisor-os/conversation/first-contact-options-engine.js`
- `advisor-os/conversation/first-contact-script-engine.js`
- `advisor-os/conversation/first-contact-tone-engine.js`
- `advisor-os/conversation/first-contact.entity.js`
- `advisor-os/conversation/objection-battle-engine.js`
- `advisor-os/conversation/objection-classifier-engine.js`
- `advisor-os/conversation/objection-intent-engine.js`
- `advisor-os/conversation/objection-memory-engine.js`
- `advisor-os/conversation/objection-prompt-builder.js`
- `advisor-os/conversation/objection-resolution-engine.js`
- `advisor-os/conversation/objection-response-strategy-engine.js`
- `advisor-os/presentation/sales-presentation-engine-ownership-registry.js`
- `advisor-os/prospect-personality.constants.js`
- `advisor-os/prospect-status.constants.js`
- `advisor-os/prospecting/appointment-calendar-engine.js`
- `advisor-os/prospecting/appointment-opportunity-engine.js`
- `advisor-os/prospecting/center-of-influence-engine.js`
- `advisor-os/prospecting/close-prompt-builder.js`
- `advisor-os/prospecting/close-readiness-engine.js`
- `advisor-os/prospecting/close-strategy-engine.js`
- `advisor-os/prospecting/prospect-next-action-engine.js`
- `advisor-os/prospecting/prospect-pipeline-engine.js`
- `advisor-os/prospecting/prospect-profile-engine.js`
- `advisor-os/prospecting/prospect-score-engine.js`
- `advisor-os/prospecting/prospect-segment-performance-engine.js`
- `advisor-os/prospecting/prospect.entity.js`
- `advisor-os/referrals/referral-timeline-engine.js`
- `advisor-os/sales-pipeline/productive-prospect-bootstrap.js`
- `advisor-os/sales-pipeline/productive-prospect-service.js`
- `advisor-os/sales-pipeline/productive-prospect-ui.js`
- `advisor-os/sales-pipeline/prospect-context/pipeline-universal-prospect-context-adapter.js`
- `advisor-os/sales-pipeline/prospect-context/universal-governed-prospect-context-contract.js`
- `advisor-os/sales-pipeline/prospect-detail.js`
- `advisor-os/sales-pipeline/prospect-due-action-priority-contract.js`
- `advisor-os/sales-pipeline/prospect-duplicate-review.js`
- `advisor-os/sales-pipeline/prospect-identity-contract.js`
- `advisor-os/sales-pipeline/prospect-repository.js`
- `advisor-os/sales-pipeline/prospect-timeline/prospect-timeline-contract.js`
- `advisor-os/sales-pipeline/prospect-timeline/prospect-timeline-service.js`
- `commission-projection-engine.js`
- `compensation/contracts/bonus-calculation-result.js`
- `compensation/partner-manager/advisor-economic-output.js`
- `compensation/partner-manager/partner-2026-rule-pack-loader.js`
- `compensation/partner-manager/partner-2026-rule-pack-validator.js`
- `compensation/partner-manager/partner-activity-bonus-calculator.js`
- `compensation/partner-manager/partner-activity-bonus-contract.js`
- `compensation/partner-manager/partner-compensation-concept-registry.js`
- `compensation/partner-manager/partner-compensation-input-gate.js`
- `compensation/partner-manager/partner-monthly-cashflow-projection-engine.js`
- `compensation/partner-manager/partner-monthly-income-candidate-orchestrator.js`
- `compensation/partner-manager/partner-production-bonus-contract.js`
- `compensation/partner-manager/partner-productivity-base-calculator.js`
- `compensation/partner-manager/partner-productivity-base-contract.js`
- `compensation/partner-manager/partner-quarterly-bonus-calculator.js`
- `compensation/partner-manager/rule-data/smnyl_partner_compensation_2026_rules_canonical_draft.json`
- `compensation/partner-manager/rule-data/smnyl_partner_compensation_2026_rules_official_v1.json`
- `compensation/partner-manager/rule-packs/smnyl-partner-compensation-2026-payment-distribution.rule-pack.json`
- `dashboard.js`
- `decision-appendix-master-test.js`
- `design-system-preview.html`
- `docs/01-constitution/FORGE_CONSTITUTION_AMENDMENT_v1.1.md`
- `docs/01-constitution/FORGE_CONSTITUTION_AMENDMENT_v1.3.md`

## Migration boundaries

- The approved UI branch remains visual authority.
- NFAST/FES contracts remain data and behavior authority.
- UI-M01 may add tokens and primitives but must not replace productive bindings.
- The new app shell must remain behind an explicit feature flag until Home acceptance passes.
- No backend, Supabase, migration or remote data mutation belongs to UI-M00.

## UI-M01 entry gate

UI-M01 can begin when:

- the source and UI authority commits above remain resolvable;
- the runtime worktree is clean;
- the inventory JSON validates;
- this discovery commit is present on the remote target branch.

## Decision

- UI migration: **STARTED**
- Full surface migration: **NOT STARTED**
- Current priority: **FOUNDATION ONLY**
- Next phase: `UI_M01_TOKENS_PRIMITIVES_AND_FEATURE_FLAG`
