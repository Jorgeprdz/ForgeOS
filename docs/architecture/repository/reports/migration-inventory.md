# Migration Inventory

Status: REPORT ONLY / NO FILES MOVED

Generated At: 2026-06-11T04:45:01.590Z

## Counts

| Metric | Count |
| --- | ---: |
| allFiles | 1223 |
| trackedFiles | 1178 |
| untrackedFiles | 14 |
| rootFiles | 721 |
| rootDocs | 26 |
| protectedAssets | 8 |
| codeFiles | 792 |
| destinationCandidates | 23 |

## Safety

| Property | Value |
| --- | --- |
| writes | reports_only |
| movesFiles | false |
| rewritesReferences | false |
| deletesFiles | false |

## Destination Candidates

| Action | Source | Destination | Reason |
| --- | --- | --- | --- |
| SKIP_PROTECTED | `AGENTS.md` | - | Protected root asset; harness must reject movement. |
| SKIP_DEST_EXISTS | `FORGE_CONSTITUTION_AMENDMENT_v1.1.md` | `docs/architecture/constitution/FORGE_CONSTITUTION_AMENDMENT_v1.1.md` | Destination already exists; harness refuses overwrite. |
| SKIP_PROTECTED | `FORGE_CONSTITUTION_V3.md` | - | Protected root asset; harness must reject movement. |
| BLOCKED_UNTRACKED | `FORGE_DUAL_INTELLIGENCE_OPERATIONAL_BLUEPRINT.md` | `docs/archive/FORGE_DUAL_INTELLIGENCE_OPERATIONAL_BLUEPRINT.md` | Untracked file; git mv cannot be used without explicit tracking decision. |
| SKIP_TEST_DOC | `FORGE_GLOBAL_UDI_PROJECTION_VALIDATION_REPORT.txt` | `docs/archive/FORGE_GLOBAL_UDI_PROJECTION_VALIDATION_REPORT.txt` | Filename indicates test/validation artifact; requires separate evidence policy. |
| SKIP_TEST_DOC | `FORGE_GMM_EVIDENCE_PACKET_VALIDATION.md` | `docs/architecture/product-intelligence/FORGE_GMM_EVIDENCE_PACKET_VALIDATION.md` | Filename indicates test/validation artifact; requires separate evidence policy. |
| SKIP_TEST_DOC | `FORGE_GMM_RED_TEAM_RETEST_REPORT.txt` | `docs/architecture/product-intelligence/FORGE_GMM_RED_TEAM_RETEST_REPORT.txt` | Filename indicates test/validation artifact; requires separate evidence policy. |
| SKIP_TEST_DOC | `FORGE_GMM_SOURCE_VALIDATION_WORKFLOW.md` | `docs/architecture/product-intelligence/FORGE_GMM_SOURCE_VALIDATION_WORKFLOW.md` | Filename indicates test/validation artifact; requires separate evidence policy. |
| BLOCKED_UNTRACKED | `FORGE_HUMAN_CAPITAL_ALLOCATION_FLOW.md` | `docs/archive/FORGE_HUMAN_CAPITAL_ALLOCATION_FLOW.md` | Untracked file; git mv cannot be used without explicit tracking decision. |
| SKIP_TEST_DOC | `FORGE_IMAGINA_SER_REAL_QUOTE_VALIDATION_REPORT.txt` | `docs/architecture/product-intelligence/FORGE_IMAGINA_SER_REAL_QUOTE_VALIDATION_REPORT.txt` | Filename indicates test/validation artifact; requires separate evidence policy. |
| SKIP_TEST_DOC | `FORGE_IMPLEMENTATION_READINESS_001C_TRUTH_VALIDATION_RESULT_CONTRACT.txt` | `docs/architecture/discovery/FORGE_IMPLEMENTATION_READINESS_001C_TRUTH_VALIDATION_RESULT_CONTRACT.txt` | Filename indicates test/validation artifact; requires separate evidence policy. |
| SKIP_TEST_DOC | `FORGE_LARIZA_PEDRO_CAMARENA_TEST.md` | `docs/archive/FORGE_LARIZA_PEDRO_CAMARENA_TEST.md` | Filename indicates test/validation artifact; requires separate evidence policy. |
| BLOCKED_UNTRACKED | `FORGE_MANAGER_OS_BLUEPRINT.md` | `docs/architecture/manager-os/FORGE_MANAGER_OS_BLUEPRINT.md` | Untracked file; git mv cannot be used without explicit tracking decision. |
| SKIP_PROTECTED | `FORGE_MASTER_BUILD_TREE.md` | - | Protected root asset; harness must reject movement. |
| SKIP_TEST_DOC | `FORGE_PROJECTION_ENGINE_VS_EXCEL_VALIDATION_REPORT.txt` | `docs/archive/FORGE_PROJECTION_ENGINE_VS_EXCEL_VALIDATION_REPORT.txt` | Filename indicates test/validation artifact; requires separate evidence policy. |
| BLOCKED_UNTRACKED | `FORGE_REPOSITORY_MIGRATION_PLAN.md` | `docs/architecture/repository/FORGE_REPOSITORY_MIGRATION_PLAN.md` | Untracked file; git mv cannot be used without explicit tracking decision. |
| SKIP_TEST_DOC | `FORGE_UDI_PROJECTION_VALIDATION_REPORT.txt` | `docs/archive/FORGE_UDI_PROJECTION_VALIDATION_REPORT.txt` | Filename indicates test/validation artifact; requires separate evidence policy. |
| SKIP_TEST_DOC | `FORGE_VALIDATION_REQUIREMENTS_REPORT.md` | `docs/archive/FORGE_VALIDATION_REQUIREMENTS_REPORT.md` | Filename indicates test/validation artifact; requires separate evidence policy. |
| BLOCKED_UNTRACKED | `ROOT_DOCS_MIGRATION_BATCH_1_MOVE_MAP.md` | `docs/architecture/repository/ROOT_DOCS_MIGRATION_BATCH_1_MOVE_MAP.md` | Untracked file; git mv cannot be used without explicit tracking decision. |
| MOVE | `ROOT_DOCS_MIGRATION_BATCH_2_MOVE_MAP.md` | `docs/architecture/repository/ROOT_DOCS_MIGRATION_BATCH_2_MOVE_MAP.md` | Tracked root documentation file with destination candidate. |
| MOVE | `broken-link-report.md` | `docs/archive/broken-link-report.md` | Tracked root documentation file with destination candidate. |
| MOVE | `duplicate-destination-report.md` | `docs/archive/duplicate-destination-report.md` | Tracked root documentation file with destination candidate. |
| REVIEW_REQUIRED | `forge-full-inventory.txt` | `docs/archive/forge-full-inventory.txt` | File is neither tracked nor clearly untracked in current git view. |
| SKIP_TEST_DOC | `inventory-schema-validation-report.md` | `docs/archive/inventory-schema-validation-report.md` | Filename indicates test/validation artifact; requires separate evidence policy. |
| SKIP_TEST_DOC | `migration-validation-report.md` | `docs/architecture/repository/migration-validation-report.md` | Filename indicates test/validation artifact; requires separate evidence policy. |
| MOVE | `reference-rewrite-plan.md` | `docs/archive/reference-rewrite-plan.md` | Tracked root documentation file with destination candidate. |
