# ROOT DOCS MIGRATION BATCH 1 MOVE MAP

Status: GENERATED BEFORE PHYSICAL MOVE

Scope: tracked root-level `.md` and `.txt` documentation files only.

Explicit exclusions: `AGENTS.md`, `FORGE_CONSTITUTION_V3.md`, `FORGE_MASTER_BUILD_TREE.md`, files with `test`/`validation` in the filename, code/runtime files, untracked root docs that cannot be moved with `git mv` alone.

## Summary

| Action | Count |
| --- | ---: |
| BLOCKED_UNTRACKED | 5 |
| MOVE | 323 |
| SKIP_PROTECTED | 3 |
| SKIP_TEST_DOC | 10 |

## Post-execution Result

| Result | Count | Notes |
| --- | ---: | --- |
| EXECUTED_GIT_MV | 322 | Moved with `git mv`; no code/runtime files moved. |
| SKIP_DEST_EXISTS | 1 | `FORGE_CONSTITUTION_AMENDMENT_v1.1.md` was not moved because `docs/architecture/constitution/FORGE_CONSTITUTION_AMENDMENT_v1.1.md` already existed. |
| BLOCKED_UNTRACKED | 5 | Left in root because `git mv` cannot move untracked files without first changing tracking state. |
| SKIP_PROTECTED | 3 | `AGENTS.md`, `FORGE_CONSTITUTION_V3.md`, `FORGE_MASTER_BUILD_TREE.md`. |
| SKIP_TEST_DOC | 10 | Left in root due user exclusion for any test file. |

## Move Map

| Action | Source | Destination | Reason |
| --- | --- | --- | --- |
| SKIP_PROTECTED | `AGENTS.md` | - | Protected root governance anchor. |
| MOVE | `ALFA_MEDICAL_ACCIDENT_RULES.md` | `docs/04-product-intelligence/ALFA_MEDICAL_ACCIDENT_RULES.md` | Tracked root documentation file within batch scope. |
| MOVE | `ALFA_MEDICAL_ADVISOR_RISK_AREAS.md` | `docs/04-product-intelligence/ALFA_MEDICAL_ADVISOR_RISK_AREAS.md` | Tracked root documentation file within batch scope. |
| MOVE | `ALFA_MEDICAL_ARCHITECTURE_EXECUTIVE_SUMMARY.txt` | `docs/04-product-intelligence/ALFA_MEDICAL_ARCHITECTURE_EXECUTIVE_SUMMARY.txt` | Tracked root documentation file within batch scope. |
| MOVE | `ALFA_MEDICAL_AUTHORIZATION_RULES.md` | `docs/04-product-intelligence/ALFA_MEDICAL_AUTHORIZATION_RULES.md` | Tracked root documentation file within batch scope. |
| MOVE | `ALFA_MEDICAL_CLIENT_MISUNDERSTANDING_DISCOVERY.md` | `docs/04-product-intelligence/ALFA_MEDICAL_CLIENT_MISUNDERSTANDING_DISCOVERY.md` | Tracked root documentation file within batch scope. |
| MOVE | `ALFA_MEDICAL_CONFIDENCE_BOUNDARIES.md` | `docs/04-product-intelligence/ALFA_MEDICAL_CONFIDENCE_BOUNDARIES.md` | Tracked root documentation file within batch scope. |
| MOVE | `ALFA_MEDICAL_COVERAGE_MAP.md` | `docs/04-product-intelligence/ALFA_MEDICAL_COVERAGE_MAP.md` | Tracked root documentation file within batch scope. |
| MOVE | `ALFA_MEDICAL_COVERAGE_RULES.md` | `docs/04-product-intelligence/ALFA_MEDICAL_COVERAGE_RULES.md` | Tracked root documentation file within batch scope. |
| MOVE | `ALFA_MEDICAL_DECISION_CLARITY_TRANSLATIONS.md` | `docs/04-product-intelligence/ALFA_MEDICAL_DECISION_CLARITY_TRANSLATIONS.md` | Tracked root documentation file within batch scope. |
| MOVE | `ALFA_MEDICAL_DECISION_FLOW_ARCHITECTURE.md` | `docs/04-product-intelligence/ALFA_MEDICAL_DECISION_FLOW_ARCHITECTURE.md` | Tracked root documentation file within batch scope. |
| MOVE | `ALFA_MEDICAL_EVENT_FAMILY_ARCHITECTURE.md` | `docs/04-product-intelligence/ALFA_MEDICAL_EVENT_FAMILY_ARCHITECTURE.md` | Tracked root documentation file within batch scope. |
| MOVE | `ALFA_MEDICAL_EVIDENCE_REQUIREMENTS.md` | `docs/04-product-intelligence/ALFA_MEDICAL_EVIDENCE_REQUIREMENTS.md` | Tracked root documentation file within batch scope. |
| MOVE | `ALFA_MEDICAL_EXCLUSION_INTELLIGENCE.md` | `docs/04-product-intelligence/ALFA_MEDICAL_EXCLUSION_INTELLIGENCE.md` | Tracked root documentation file within batch scope. |
| MOVE | `ALFA_MEDICAL_FINANCIAL_RESPONSIBILITY_DISCOVERY.md` | `docs/04-product-intelligence/ALFA_MEDICAL_FINANCIAL_RESPONSIBILITY_DISCOVERY.md` | Tracked root documentation file within batch scope. |
| MOVE | `ALFA_MEDICAL_FINANCIAL_RULES.md` | `docs/04-product-intelligence/ALFA_MEDICAL_FINANCIAL_RULES.md` | Tracked root documentation file within batch scope. |
| MOVE | `ALFA_MEDICAL_FOREIGN_COVERAGE_RULES.md` | `docs/04-product-intelligence/ALFA_MEDICAL_FOREIGN_COVERAGE_RULES.md` | Tracked root documentation file within batch scope. |
| MOVE | `ALFA_MEDICAL_FORGE_COVERAGE_INTELLIGENCE_FOUNDATION.md` | `docs/04-product-intelligence/ALFA_MEDICAL_FORGE_COVERAGE_INTELLIGENCE_FOUNDATION.md` | Tracked root documentation file within batch scope. |
| MOVE | `ALFA_MEDICAL_FORGE_GAP_INTELLIGENCE_FOUNDATION.md` | `docs/04-product-intelligence/ALFA_MEDICAL_FORGE_GAP_INTELLIGENCE_FOUNDATION.md` | Tracked root documentation file within batch scope. |
| MOVE | `ALFA_MEDICAL_HUMAN_REVIEW_GATE_ARCHITECTURE.md` | `docs/04-product-intelligence/ALFA_MEDICAL_HUMAN_REVIEW_GATE_ARCHITECTURE.md` | Tracked root documentation file within batch scope. |
| MOVE | `ALFA_MEDICAL_HUMAN_REVIEW_RULES.md` | `docs/04-product-intelligence/ALFA_MEDICAL_HUMAN_REVIEW_RULES.md` | Tracked root documentation file within batch scope. |
| MOVE | `ALFA_MEDICAL_INPUT_FREQUENCY_ANALYSIS.md` | `docs/04-product-intelligence/ALFA_MEDICAL_INPUT_FREQUENCY_ANALYSIS.md` | Tracked root documentation file within batch scope. |
| MOVE | `ALFA_MEDICAL_INPUT_INVENTORY.md` | `docs/04-product-intelligence/ALFA_MEDICAL_INPUT_INVENTORY.md` | Tracked root documentation file within batch scope. |
| MOVE | `ALFA_MEDICAL_MATERNITY_RULES.md` | `docs/04-product-intelligence/ALFA_MEDICAL_MATERNITY_RULES.md` | Tracked root documentation file within batch scope. |
| MOVE | `ALFA_MEDICAL_MINIMUM_DATASETS.md` | `docs/04-product-intelligence/ALFA_MEDICAL_MINIMUM_DATASETS.md` | Tracked root documentation file within batch scope. |
| MOVE | `ALFA_MEDICAL_PREEXISTENCE_RULES.md` | `docs/04-product-intelligence/ALFA_MEDICAL_PREEXISTENCE_RULES.md` | Tracked root documentation file within batch scope. |
| MOVE | `ALFA_MEDICAL_PRODUCT_INTELLIGENCE_DISCOVERY.md` | `docs/04-product-intelligence/ALFA_MEDICAL_PRODUCT_INTELLIGENCE_DISCOVERY.md` | Tracked root documentation file within batch scope. |
| MOVE | `ALFA_MEDICAL_QUESTION_STRATEGY.md` | `docs/04-product-intelligence/ALFA_MEDICAL_QUESTION_STRATEGY.md` | Tracked root documentation file within batch scope. |
| MOVE | `ALFA_MEDICAL_REAL_LIFE_EVENT_LIBRARY.md` | `docs/04-product-intelligence/ALFA_MEDICAL_REAL_LIFE_EVENT_LIBRARY.md` | Tracked root documentation file within batch scope. |
| MOVE | `ALFA_MEDICAL_RULE_DEPENDENCY_MAP.md` | `docs/04-product-intelligence/ALFA_MEDICAL_RULE_DEPENDENCY_MAP.md` | Tracked root documentation file within batch scope. |
| MOVE | `ALFA_MEDICAL_RULE_INVENTORY.md` | `docs/04-product-intelligence/ALFA_MEDICAL_RULE_INVENTORY.md` | Tracked root documentation file within batch scope. |
| MOVE | `ALFA_MEDICAL_SHARED_RULE_LIBRARY_CANDIDATES.md` | `docs/04-product-intelligence/ALFA_MEDICAL_SHARED_RULE_LIBRARY_CANDIDATES.md` | Tracked root documentation file within batch scope. |
| MOVE | `ALFA_MEDICAL_UNKNOWN_QUESTIONS_QUEUE.txt` | `docs/04-product-intelligence/ALFA_MEDICAL_UNKNOWN_QUESTIONS_QUEUE.txt` | Tracked root documentation file within batch scope. |
| MOVE | `ALFA_MEDICAL_UNKNOWN_RULE_GAPS.txt` | `docs/04-product-intelligence/ALFA_MEDICAL_UNKNOWN_RULE_GAPS.txt` | Tracked root documentation file within batch scope. |
| MOVE | `ALFA_MEDICAL_WAITING_PERIOD_RULES.md` | `docs/04-product-intelligence/ALFA_MEDICAL_WAITING_PERIOD_RULES.md` | Tracked root documentation file within batch scope. |
| MOVE | `BUILD_TREE_UPDATE_REPORT.txt` | `docs/02-build-tree/BUILD_TREE_UPDATE_REPORT.txt` | Tracked root documentation file within batch scope. |
| MOVE | `COMPENSATION_DOMAIN_MODEL.md` | `docs/archive/COMPENSATION_DOMAIN_MODEL.md` | Tracked root documentation file within batch scope. |
| MOVE | `DIAGRAMA_RAZONAMIENTO_EDWIN_IS15.md` | `docs/archive/DIAGRAMA_RAZONAMIENTO_EDWIN_IS15.md` | Tracked root documentation file within batch scope. |
| MOVE | `FIRST_WOW_MOMENT_CANDIDATES.txt` | `docs/archive/FIRST_WOW_MOMENT_CANDIDATES.txt` | Tracked root documentation file within batch scope. |
| MOVE | `FIXTURE_CATALOG.md` | `docs/archive/FIXTURE_CATALOG.md` | Tracked root documentation file within batch scope. |
| MOVE | `FORGE_ACTION_SAFETY_COMPONENTS_DISCOVERY.md` | `docs/03-discovery/FORGE_ACTION_SAFETY_COMPONENTS_DISCOVERY.md` | Tracked root documentation file within batch scope. |
| MOVE | `FORGE_ACTION_SAFETY_DESTROYERS_DISCOVERY.md` | `docs/03-discovery/FORGE_ACTION_SAFETY_DESTROYERS_DISCOVERY.md` | Tracked root documentation file within batch scope. |
| MOVE | `FORGE_ACTION_SAFETY_DISCOVERY.md` | `docs/03-discovery/FORGE_ACTION_SAFETY_DISCOVERY.md` | Tracked root documentation file within batch scope. |
| MOVE | `FORGE_ACTION_SAFETY_MODEL_CANDIDATE.md` | `docs/03-discovery/FORGE_ACTION_SAFETY_MODEL_CANDIDATE.md` | Tracked root documentation file within batch scope. |
| MOVE | `FORGE_ACTION_SAFETY_SIGNALS_DISCOVERY.md` | `docs/03-discovery/FORGE_ACTION_SAFETY_SIGNALS_DISCOVERY.md` | Tracked root documentation file within batch scope. |
| MOVE | `FORGE_ACTION_SAFETY_VS_FRICTION_DISCOVERY.md` | `docs/03-discovery/FORGE_ACTION_SAFETY_VS_FRICTION_DISCOVERY.md` | Tracked root documentation file within batch scope. |
| MOVE | `FORGE_ACTION_SAFETY_VS_READINESS_DISCOVERY.md` | `docs/03-discovery/FORGE_ACTION_SAFETY_VS_READINESS_DISCOVERY.md` | Tracked root documentation file within batch scope. |
| MOVE | `FORGE_ADR_0019_FD_0001_STABILITY_REVIEW_REPORT.txt` | `docs/adr/FORGE_ADR_0019_FD_0001_STABILITY_REVIEW_REPORT.txt` | Tracked root documentation file within batch scope. |
| MOVE | `FORGE_ADVISOR_EXPERIENCE_ARCHITECTURE.md` | `docs/archive/FORGE_ADVISOR_EXPERIENCE_ARCHITECTURE.md` | Tracked root documentation file within batch scope. |
| MOVE | `FORGE_ADVISOR_FRICTION_DISCOVERY.md` | `docs/03-discovery/FORGE_ADVISOR_FRICTION_DISCOVERY.md` | Tracked root documentation file within batch scope. |
| MOVE | `FORGE_ADVISOR_INSIGHTS.md` | `docs/archive/FORGE_ADVISOR_INSIGHTS.md` | Tracked root documentation file within batch scope. |
| MOVE | `FORGE_ALFA_MEDICAL_VS_FLEX_PRODUCT_INTELLIGENCE_NOTES.txt` | `docs/04-product-intelligence/FORGE_ALFA_MEDICAL_VS_FLEX_PRODUCT_INTELLIGENCE_NOTES.txt` | Tracked root documentation file within batch scope. |
| MOVE | `FORGE_ARCHITECTURAL_CONSTITUTION_v3.md` | `docs/architecture/constitution/FORGE_ARCHITECTURAL_CONSTITUTION_v3.md` | Tracked root documentation file within batch scope. |
| MOVE | `FORGE_ARTICLE_0_DISCOVERY.md` | `docs/architecture/constitution/FORGE_ARTICLE_0_DISCOVERY.md` | Tracked root documentation file within batch scope. |
| MOVE | `FORGE_ARTICLE_0_POSITION_IN_CONSTITUTION.md` | `docs/architecture/constitution/FORGE_ARTICLE_0_POSITION_IN_CONSTITUTION.md` | Tracked root documentation file within batch scope. |
| MOVE | `FORGE_ARTICLE_0_SUCCESS_MEASURES.md` | `docs/architecture/constitution/FORGE_ARTICLE_0_SUCCESS_MEASURES.md` | Tracked root documentation file within batch scope. |
| MOVE | `FORGE_BENVENU_EXPERIENCE_LOCK.md` | `docs/archive/FORGE_BENVENU_EXPERIENCE_LOCK.md` | Tracked root documentation file within batch scope. |
| MOVE | `FORGE_BENVENU_LEOPARD_COPY_DIRECTIONS.txt` | `docs/archive/FORGE_BENVENU_LEOPARD_COPY_DIRECTIONS.txt` | Tracked root documentation file within batch scope. |
| MOVE | `FORGE_BENVENU_LEOPARD_EXPERIENCE_SPEC.md` | `docs/archive/FORGE_BENVENU_LEOPARD_EXPERIENCE_SPEC.md` | Tracked root documentation file within batch scope. |
| MOVE | `FORGE_CAREER_LIFECYCLE_MODEL_DISCOVERY.md` | `docs/03-discovery/FORGE_CAREER_LIFECYCLE_MODEL_DISCOVERY.md` | Tracked root documentation file within batch scope. |
| MOVE | `FORGE_CAREER_LIFECYCLE_RISKS_AND_BOUNDARIES.txt` | `docs/03-discovery/FORGE_CAREER_LIFECYCLE_RISKS_AND_BOUNDARIES.txt` | Tracked root documentation file within batch scope. |
| MOVE | `FORGE_CAREER_OPERATING_SYSTEM_DISCOVERY.md` | `docs/03-discovery/FORGE_CAREER_OPERATING_SYSTEM_DISCOVERY.md` | Tracked root documentation file within batch scope. |
| MOVE | `FORGE_CAREER_OS_IMPLICATIONS.txt` | `docs/03-discovery/FORGE_CAREER_OS_IMPLICATIONS.txt` | Tracked root documentation file within batch scope. |
| MOVE | `FORGE_CAREER_OS_LOCK_CANDIDATES.txt` | `docs/03-discovery/FORGE_CAREER_OS_LOCK_CANDIDATES.txt` | Tracked root documentation file within batch scope. |
| MOVE | `FORGE_CAREER_STAGE_LOCK_CANDIDATES.txt` | `docs/03-discovery/FORGE_CAREER_STAGE_LOCK_CANDIDATES.txt` | Tracked root documentation file within batch scope. |
| MOVE | `FORGE_CAREER_STAGE_OWNERSHIP_DISCOVERY.txt` | `docs/03-discovery/FORGE_CAREER_STAGE_OWNERSHIP_DISCOVERY.txt` | Tracked root documentation file within batch scope. |
| MOVE | `FORGE_CHECKPOINT_EXECUTIVE_SUMMARY.txt` | `docs/archive/FORGE_CHECKPOINT_EXECUTIVE_SUMMARY.txt` | Tracked root documentation file within batch scope. |
| MOVE | `FORGE_CLIENT_DECISION_MODEL_DISCOVERY.md` | `docs/03-discovery/FORGE_CLIENT_DECISION_MODEL_DISCOVERY.md` | Tracked root documentation file within batch scope. |
| MOVE | `FORGE_CLIENT_PRESENTATION_SIMULATION.md` | `docs/archive/FORGE_CLIENT_PRESENTATION_SIMULATION.md` | Tracked root documentation file within batch scope. |
| MOVE | `FORGE_CODEBASE_BUILD_TREE_UPDATE_REPORT.txt` | `docs/06-repository-governance/FORGE_CODEBASE_BUILD_TREE_UPDATE_REPORT.txt` | Tracked root documentation file within batch scope. |
| MOVE | `FORGE_CODEBASE_CARTOGRAPHY_PHASE_1.md` | `docs/06-repository-governance/FORGE_CODEBASE_CARTOGRAPHY_PHASE_1.md` | Tracked root documentation file within batch scope. |
| MOVE | `FORGE_CODEBASE_DOMAIN_ASSIGNMENT_CONCISE.md` | `docs/06-repository-governance/FORGE_CODEBASE_DOMAIN_ASSIGNMENT_CONCISE.md` | Tracked root documentation file within batch scope. |
| MOVE | `FORGE_CODEBASE_DOMAIN_ASSIGNMENT_SUMMARY.md` | `docs/06-repository-governance/FORGE_CODEBASE_DOMAIN_ASSIGNMENT_SUMMARY.md` | Tracked root documentation file within batch scope. |
| MOVE | `FORGE_CODEBASE_MODULE_INVENTORY_REPORT.txt` | `docs/06-repository-governance/FORGE_CODEBASE_MODULE_INVENTORY_REPORT.txt` | Tracked root documentation file within batch scope. |
| MOVE | `FORGE_CODEBASE_MODULE_TO_BRANCH_MAP.txt` | `docs/06-repository-governance/FORGE_CODEBASE_MODULE_TO_BRANCH_MAP.txt` | Tracked root documentation file within batch scope. |
| MOVE | `FORGE_CODEBASE_UNKNOWN_REVIEW_QUEUE.txt` | `docs/06-repository-governance/FORGE_CODEBASE_UNKNOWN_REVIEW_QUEUE.txt` | Tracked root documentation file within batch scope. |
| MOVE | `FORGE_CODEX_PROMPT_001_SOURCE_OWNERSHIP_REGISTRY_V0_1.txt` | `docs/archive/FORGE_CODEX_PROMPT_001_SOURCE_OWNERSHIP_REGISTRY_V0_1.txt` | Tracked root documentation file within batch scope. |
| MOVE | `FORGE_COMPENSATION_INTELLIGENCE_ARCHITECTURE.md` | `docs/archive/FORGE_COMPENSATION_INTELLIGENCE_ARCHITECTURE.md` | Tracked root documentation file within batch scope. |
| SKIP_DEST_EXISTS | `FORGE_CONSTITUTION_AMENDMENT_v1.1.md` | `docs/architecture/constitution/FORGE_CONSTITUTION_AMENDMENT_v1.1.md` | Destination already existed; skipped to avoid overwrite/delete. |
| MOVE | `FORGE_CONSTITUTION_AMENDMENT_v1.1.txt` | `docs/architecture/constitution/FORGE_CONSTITUTION_AMENDMENT_v1.1.txt` | Tracked root documentation file within batch scope. |
| MOVE | `FORGE_CONSTITUTION_CANDIDATES.md` | `docs/architecture/constitution/FORGE_CONSTITUTION_CANDIDATES.md` | Tracked root documentation file within batch scope. |
| MOVE | `FORGE_CONSTITUTION_LOCK_PREPARATION.md` | `docs/architecture/constitution/FORGE_CONSTITUTION_LOCK_PREPARATION.md` | Tracked root documentation file within batch scope. |
| SKIP_PROTECTED | `FORGE_CONSTITUTION_V3.md` | - | Protected root governance anchor. |
| MOVE | `FORGE_CORPORATE_VS_FIELD_INTELLIGENCE_COMPARISON.md` | `docs/archive/FORGE_CORPORATE_VS_FIELD_INTELLIGENCE_COMPARISON.md` | Tracked root documentation file within batch scope. |
| MOVE | `FORGE_CURRENCY_INTELLIGENCE_AUDIT_REPORT.txt` | `docs/archive/FORGE_CURRENCY_INTELLIGENCE_AUDIT_REPORT.txt` | Tracked root documentation file within batch scope. |
| MOVE | `FORGE_DECISION_VS_TRANSACTION_DISCOVERY.md` | `docs/03-discovery/FORGE_DECISION_VS_TRANSACTION_DISCOVERY.md` | Tracked root documentation file within batch scope. |
| MOVE | `FORGE_DEPENDENCY_BLOCKERS.txt` | `docs/archive/FORGE_DEPENDENCY_BLOCKERS.txt` | Tracked root documentation file within batch scope. |
| MOVE | `FORGE_DEPENDENCY_SIGNAL_DISCOVERY.md` | `docs/03-discovery/FORGE_DEPENDENCY_SIGNAL_DISCOVERY.md` | Tracked root documentation file within batch scope. |
| MOVE | `FORGE_DEVELOPMENT_BOUNDARIES_AND_RISKS.txt` | `docs/archive/FORGE_DEVELOPMENT_BOUNDARIES_AND_RISKS.txt` | Tracked root documentation file within batch scope. |
| MOVE | `FORGE_DEVELOPMENT_DRIVERS_DISCOVERY.txt` | `docs/03-discovery/FORGE_DEVELOPMENT_DRIVERS_DISCOVERY.txt` | Tracked root documentation file within batch scope. |
| MOVE | `FORGE_DEVELOPMENT_LOCK_CANDIDATES.txt` | `docs/archive/FORGE_DEVELOPMENT_LOCK_CANDIDATES.txt` | Tracked root documentation file within batch scope. |
| MOVE | `FORGE_DISCOVERY_CONSOLIDATION_REPORT.md` | `docs/03-discovery/FORGE_DISCOVERY_CONSOLIDATION_REPORT.md` | Tracked root documentation file within batch scope. |
| MOVE | `FORGE_DOCS_CHECKPOINT_PAQ_ORDER_REPORT.md` | `docs/archive/FORGE_DOCS_CHECKPOINT_PAQ_ORDER_REPORT.md` | Tracked root documentation file within batch scope. |
| MOVE | `FORGE_DOMAIN_ARCHITECTURE_GAP_ANALYSIS.txt` | `docs/archive/FORGE_DOMAIN_ARCHITECTURE_GAP_ANALYSIS.txt` | Tracked root documentation file within batch scope. |
| BLOCKED_UNTRACKED | `FORGE_DUAL_INTELLIGENCE_OPERATIONAL_BLUEPRINT.md` | `docs/archive/FORGE_DUAL_INTELLIGENCE_OPERATIONAL_BLUEPRINT.md` | Untracked root doc; git mv cannot move it without first changing tracking state. |
| MOVE | `FORGE_ETHICAL_BOUNDARY_REVIEW.md` | `docs/archive/FORGE_ETHICAL_BOUNDARY_REVIEW.md` | Tracked root documentation file within batch scope. |
| MOVE | `FORGE_EXCELLENCE_BOUNDARIES_AND_RISKS.txt` | `docs/03-discovery/FORGE_EXCELLENCE_BOUNDARIES_AND_RISKS.txt` | Tracked root documentation file within batch scope. |
| MOVE | `FORGE_EXCELLENCE_DIMENSIONS_DISCOVERY.txt` | `docs/03-discovery/FORGE_EXCELLENCE_DIMENSIONS_DISCOVERY.txt` | Tracked root documentation file within batch scope. |
| MOVE | `FORGE_EXCELLENCE_LOCK_CANDIDATES.txt` | `docs/03-discovery/FORGE_EXCELLENCE_LOCK_CANDIDATES.txt` | Tracked root documentation file within batch scope. |
| MOVE | `FORGE_FALSE_READINESS_DISCOVERY.md` | `docs/03-discovery/FORGE_FALSE_READINESS_DISCOVERY.md` | Tracked root documentation file within batch scope. |
| MOVE | `FORGE_FOUNDATION_LOCK.md` | `docs/archive/FORGE_FOUNDATION_LOCK.md` | Tracked root documentation file within batch scope. |
| MOVE | `FORGE_FRICTION_INTELLIGENCE_DISCOVERY.md` | `docs/03-discovery/FORGE_FRICTION_INTELLIGENCE_DISCOVERY.md` | Tracked root documentation file within batch scope. |
| MOVE | `FORGE_FRICTION_PATTERN_LIBRARY.md` | `docs/03-discovery/FORGE_FRICTION_PATTERN_LIBRARY.md` | Tracked root documentation file within batch scope. |
| MOVE | `FORGE_GLOBAL_UDI_PROJECTION_PRODUCT_INTERPRETATION.md` | `docs/04-product-intelligence/FORGE_GLOBAL_UDI_PROJECTION_PRODUCT_INTERPRETATION.md` | Tracked root documentation file within batch scope. |
| MOVE | `FORGE_GLOBAL_UDI_PROJECTION_REASONING_DIAGRAM.md` | `docs/archive/FORGE_GLOBAL_UDI_PROJECTION_REASONING_DIAGRAM.md` | Tracked root documentation file within batch scope. |
| SKIP_TEST_DOC | `FORGE_GLOBAL_UDI_PROJECTION_VALIDATION_REPORT.txt` | - | Filename indicates test/validation artifact; user excluded any test file. |
| MOVE | `FORGE_GMM_ASSESSMENT_LANGUAGE_ARCHITECTURE.md` | `docs/04-product-intelligence/FORGE_GMM_ASSESSMENT_LANGUAGE_ARCHITECTURE.md` | Tracked root documentation file within batch scope. |
| MOVE | `FORGE_GMM_BLUEPRINT_EXECUTIVE_SUMMARY.txt` | `docs/04-product-intelligence/FORGE_GMM_BLUEPRINT_EXECUTIVE_SUMMARY.txt` | Tracked root documentation file within batch scope. |
| MOVE | `FORGE_GMM_COMPONENT_CATALOG.md` | `docs/04-product-intelligence/FORGE_GMM_COMPONENT_CATALOG.md` | Tracked root documentation file within batch scope. |
| MOVE | `FORGE_GMM_COMPONENT_RESPONSIBILITIES.md` | `docs/04-product-intelligence/FORGE_GMM_COMPONENT_RESPONSIBILITIES.md` | Tracked root documentation file within batch scope. |
| MOVE | `FORGE_GMM_COVERAGE_INTELLIGENCE_BLUEPRINT.md` | `docs/04-product-intelligence/FORGE_GMM_COVERAGE_INTELLIGENCE_BLUEPRINT.md` | Tracked root documentation file within batch scope. |
| MOVE | `FORGE_GMM_COVERAGE_INTELLIGENCE_PACK_REPORT.txt` | `docs/04-product-intelligence/FORGE_GMM_COVERAGE_INTELLIGENCE_PACK_REPORT.txt` | Tracked root documentation file within batch scope. |
| MOVE | `FORGE_GMM_CURRENT_STORY_ANALYSIS.md` | `docs/04-product-intelligence/FORGE_GMM_CURRENT_STORY_ANALYSIS.md` | Tracked root documentation file within batch scope. |
| MOVE | `FORGE_GMM_DOCUMENT_PRIORITY_MODEL.md` | `docs/04-product-intelligence/FORGE_GMM_DOCUMENT_PRIORITY_MODEL.md` | Tracked root documentation file within batch scope. |
| MOVE | `FORGE_GMM_EMOTION_VS_EDUCATION_ANALYSIS.md` | `docs/04-product-intelligence/FORGE_GMM_EMOTION_VS_EDUCATION_ANALYSIS.md` | Tracked root documentation file within batch scope. |
| MOVE | `FORGE_GMM_EVENT_EVIDENCE_PACKETS.md` | `docs/04-product-intelligence/FORGE_GMM_EVENT_EVIDENCE_PACKETS.md` | Tracked root documentation file within batch scope. |
| MOVE | `FORGE_GMM_EVENT_ROUTING_ARCHITECTURE.md` | `docs/04-product-intelligence/FORGE_GMM_EVENT_ROUTING_ARCHITECTURE.md` | Tracked root documentation file within batch scope. |
| MOVE | `FORGE_GMM_EVIDENCE_ARCHITECTURE.md` | `docs/04-product-intelligence/FORGE_GMM_EVIDENCE_ARCHITECTURE.md` | Tracked root documentation file within batch scope. |
| MOVE | `FORGE_GMM_EVIDENCE_COMPLETENESS_MODEL.md` | `docs/04-product-intelligence/FORGE_GMM_EVIDENCE_COMPLETENESS_MODEL.md` | Tracked root documentation file within batch scope. |
| MOVE | `FORGE_GMM_EVIDENCE_GAP_DETECTION.md` | `docs/04-product-intelligence/FORGE_GMM_EVIDENCE_GAP_DETECTION.md` | Tracked root documentation file within batch scope. |
| MOVE | `FORGE_GMM_EVIDENCE_PACKET_EXECUTIVE_SUMMARY.txt` | `docs/04-product-intelligence/FORGE_GMM_EVIDENCE_PACKET_EXECUTIVE_SUMMARY.txt` | Tracked root documentation file within batch scope. |
| MOVE | `FORGE_GMM_EVIDENCE_PACKET_STANDARD.md` | `docs/04-product-intelligence/FORGE_GMM_EVIDENCE_PACKET_STANDARD.md` | Tracked root documentation file within batch scope. |
| SKIP_TEST_DOC | `FORGE_GMM_EVIDENCE_PACKET_VALIDATION.md` | - | Filename indicates test/validation artifact; user excluded any test file. |
| MOVE | `FORGE_GMM_HUMAN_REVIEW_ARCHITECTURE.md` | `docs/04-product-intelligence/FORGE_GMM_HUMAN_REVIEW_ARCHITECTURE.md` | Tracked root documentation file within batch scope. |
| MOVE | `FORGE_GMM_HUMAN_REVIEW_EVIDENCE.md` | `docs/04-product-intelligence/FORGE_GMM_HUMAN_REVIEW_EVIDENCE.md` | Tracked root documentation file within batch scope. |
| MOVE | `FORGE_GMM_IMPLEMENTATION_READINESS_REPORT.md` | `docs/04-product-intelligence/FORGE_GMM_IMPLEMENTATION_READINESS_REPORT.md` | Tracked root documentation file within batch scope. |
| MOVE | `FORGE_GMM_IMPLEMENTATION_SPRINT_1_REPORT.txt` | `docs/04-product-intelligence/FORGE_GMM_IMPLEMENTATION_SPRINT_1_REPORT.txt` | Tracked root documentation file within batch scope. |
| MOVE | `FORGE_GMM_IMPLEMENTATION_SPRINT_2_REPORT.txt` | `docs/04-product-intelligence/FORGE_GMM_IMPLEMENTATION_SPRINT_2_REPORT.txt` | Tracked root documentation file within batch scope. |
| MOVE | `FORGE_GMM_IMPLEMENTATION_SPRINT_3_REPORT.txt` | `docs/04-product-intelligence/FORGE_GMM_IMPLEMENTATION_SPRINT_3_REPORT.txt` | Tracked root documentation file within batch scope. |
| MOVE | `FORGE_GMM_IMPLEMENTATION_SPRINT_4_REPORT.txt` | `docs/04-product-intelligence/FORGE_GMM_IMPLEMENTATION_SPRINT_4_REPORT.txt` | Tracked root documentation file within batch scope. |
| MOVE | `FORGE_GMM_NEXT_EVIDENCE_STRATEGY.md` | `docs/04-product-intelligence/FORGE_GMM_NEXT_EVIDENCE_STRATEGY.md` | Tracked root documentation file within batch scope. |
| MOVE | `FORGE_GMM_NEXT_EVOLUTION_RECOMMENDATIONS.txt` | `docs/04-product-intelligence/FORGE_GMM_NEXT_EVOLUTION_RECOMMENDATIONS.txt` | Tracked root documentation file within batch scope. |
| MOVE | `FORGE_GMM_POST_PACKET_IMPLEMENTATION_READINESS.md` | `docs/04-product-intelligence/FORGE_GMM_POST_PACKET_IMPLEMENTATION_READINESS.md` | Tracked root documentation file within batch scope. |
| MOVE | `FORGE_GMM_PRODUCT_FAMILY_ARCHITECTURE.md` | `docs/04-product-intelligence/FORGE_GMM_PRODUCT_FAMILY_ARCHITECTURE.md` | Tracked root documentation file within batch scope. |
| MOVE | `FORGE_GMM_PRODUCT_ROUTING_ARCHITECTURE.md` | `docs/04-product-intelligence/FORGE_GMM_PRODUCT_ROUTING_ARCHITECTURE.md` | Tracked root documentation file within batch scope. |
| MOVE | `FORGE_GMM_PRODUCT_SOURCE_REGISTRY.md` | `docs/04-product-intelligence/FORGE_GMM_PRODUCT_SOURCE_REGISTRY.md` | Tracked root documentation file within batch scope. |
| MOVE | `FORGE_GMM_PROSPECT_EXPERIENCE_ANALYSIS.md` | `docs/04-product-intelligence/FORGE_GMM_PROSPECT_EXPERIENCE_ANALYSIS.md` | Tracked root documentation file within batch scope. |
| MOVE | `FORGE_GMM_QUESTION_STRATEGY_ARCHITECTURE.md` | `docs/04-product-intelligence/FORGE_GMM_QUESTION_STRATEGY_ARCHITECTURE.md` | Tracked root documentation file within batch scope. |
| MOVE | `FORGE_GMM_RED_TEAM_REPORT.txt` | `docs/04-product-intelligence/FORGE_GMM_RED_TEAM_REPORT.txt` | Tracked root documentation file within batch scope. |
| SKIP_TEST_DOC | `FORGE_GMM_RED_TEAM_RETEST_REPORT.txt` | - | Filename indicates test/validation artifact; user excluded any test file. |
| MOVE | `FORGE_GMM_RULE_EVALUATION_ARCHITECTURE.md` | `docs/04-product-intelligence/FORGE_GMM_RULE_EVALUATION_ARCHITECTURE.md` | Tracked root documentation file within batch scope. |
| MOVE | `FORGE_GMM_RULE_PROVENANCE_MODEL.md` | `docs/04-product-intelligence/FORGE_GMM_RULE_PROVENANCE_MODEL.md` | Tracked root documentation file within batch scope. |
| MOVE | `FORGE_GMM_SALES_INTELLIGENCE_PACK_REPORT.txt` | `docs/04-product-intelligence/FORGE_GMM_SALES_INTELLIGENCE_PACK_REPORT.txt` | Tracked root documentation file within batch scope. |
| MOVE | `FORGE_GMM_SHARED_INTELLIGENCE_REVIEW.md` | `docs/04-product-intelligence/FORGE_GMM_SHARED_INTELLIGENCE_REVIEW.md` | Tracked root documentation file within batch scope. |
| MOVE | `FORGE_GMM_SHARED_SOURCE_REVIEW.md` | `docs/04-product-intelligence/FORGE_GMM_SHARED_SOURCE_REVIEW.md` | Tracked root documentation file within batch scope. |
| MOVE | `FORGE_GMM_SOURCE_AUTHORITY_HIERARCHY.md` | `docs/04-product-intelligence/FORGE_GMM_SOURCE_AUTHORITY_HIERARCHY.md` | Tracked root documentation file within batch scope. |
| MOVE | `FORGE_GMM_SOURCE_CONFLICT_ARCHITECTURE.md` | `docs/04-product-intelligence/FORGE_GMM_SOURCE_CONFLICT_ARCHITECTURE.md` | Tracked root documentation file within batch scope. |
| MOVE | `FORGE_GMM_SOURCE_QUALITY_CLASSIFICATION.md` | `docs/04-product-intelligence/FORGE_GMM_SOURCE_QUALITY_CLASSIFICATION.md` | Tracked root documentation file within batch scope. |
| MOVE | `FORGE_GMM_SOURCE_REGISTRY_DISCOVERY.md` | `docs/04-product-intelligence/FORGE_GMM_SOURCE_REGISTRY_DISCOVERY.md` | Tracked root documentation file within batch scope. |
| MOVE | `FORGE_GMM_SOURCE_REGISTRY_EXECUTIVE_SUMMARY.txt` | `docs/04-product-intelligence/FORGE_GMM_SOURCE_REGISTRY_EXECUTIVE_SUMMARY.txt` | Tracked root documentation file within batch scope. |
| MOVE | `FORGE_GMM_SOURCE_RETIREMENT_MODEL.md` | `docs/04-product-intelligence/FORGE_GMM_SOURCE_RETIREMENT_MODEL.md` | Tracked root documentation file within batch scope. |
| SKIP_TEST_DOC | `FORGE_GMM_SOURCE_VALIDATION_WORKFLOW.md` | - | Filename indicates test/validation artifact; user excluded any test file. |
| MOVE | `FORGE_GMM_SOURCE_VERSIONING_MODEL.md` | `docs/04-product-intelligence/FORGE_GMM_SOURCE_VERSIONING_MODEL.md` | Tracked root documentation file within batch scope. |
| MOVE | `FORGE_GMM_STORY_STRUCTURE_DISCOVERY.md` | `docs/04-product-intelligence/FORGE_GMM_STORY_STRUCTURE_DISCOVERY.md` | Tracked root documentation file within batch scope. |
| MOVE | `FORGE_GMM_UNIVERSAL_EVIDENCE_PACKET.md` | `docs/04-product-intelligence/FORGE_GMM_UNIVERSAL_EVIDENCE_PACKET.md` | Tracked root documentation file within batch scope. |
| MOVE | `FORGE_HIDDEN_FRICTIONS_DISCOVERY.md` | `docs/03-discovery/FORGE_HIDDEN_FRICTIONS_DISCOVERY.md` | Tracked root documentation file within batch scope. |
| BLOCKED_UNTRACKED | `FORGE_HUMAN_CAPITAL_ALLOCATION_FLOW.md` | `docs/archive/FORGE_HUMAN_CAPITAL_ALLOCATION_FLOW.md` | Untracked root doc; git mv cannot move it without first changing tracking state. |
| MOVE | `FORGE_HUMAN_DECISION_DISCOVERY_CHECKPOINT.md` | `docs/03-discovery/FORGE_HUMAN_DECISION_DISCOVERY_CHECKPOINT.md` | Tracked root documentation file within batch scope. |
| MOVE | `FORGE_HUMAN_DEVELOPMENT_BUSINESS_FOUNDATIONAL_TRUTH.md` | `docs/archive/FORGE_HUMAN_DEVELOPMENT_BUSINESS_FOUNDATIONAL_TRUTH.md` | Tracked root documentation file within batch scope. |
| MOVE | `FORGE_HUMAN_JUDGMENT_PRESERVATION_DISCOVERY.md` | `docs/03-discovery/FORGE_HUMAN_JUDGMENT_PRESERVATION_DISCOVERY.md` | Tracked root documentation file within batch scope. |
| MOVE | `FORGE_IMAGINA_SER_CLOSURE_REPORT.txt` | `docs/archive/FORGE_IMAGINA_SER_CLOSURE_REPORT.txt` | Tracked root documentation file within batch scope. |
| MOVE | `FORGE_IMAGINA_SER_EXTRACTOR_FIX_REPORT.txt` | `docs/archive/FORGE_IMAGINA_SER_EXTRACTOR_FIX_REPORT.txt` | Tracked root documentation file within batch scope. |
| SKIP_TEST_DOC | `FORGE_IMAGINA_SER_REAL_QUOTE_VALIDATION_REPORT.txt` | - | Filename indicates test/validation artifact; user excluded any test file. |
| MOVE | `FORGE_IMPLEMENTATION_AUDIT_REPORT.txt` | `docs/archive/FORGE_IMPLEMENTATION_AUDIT_REPORT.txt` | Tracked root documentation file within batch scope. |
| MOVE | `FORGE_IMPLEMENTATION_READINESS_001A_REPORT.txt` | `docs/03-discovery/FORGE_IMPLEMENTATION_READINESS_001A_REPORT.txt` | Tracked root documentation file within batch scope. |
| MOVE | `FORGE_IMPLEMENTATION_READINESS_001A_SOURCE_OWNERSHIP_REGISTRY.txt` | `docs/03-discovery/FORGE_IMPLEMENTATION_READINESS_001A_SOURCE_OWNERSHIP_REGISTRY.txt` | Tracked root documentation file within batch scope. |
| MOVE | `FORGE_IMPLEMENTATION_READINESS_001B_EVIDENCE_STATE_VOCABULARY.txt` | `docs/03-discovery/FORGE_IMPLEMENTATION_READINESS_001B_EVIDENCE_STATE_VOCABULARY.txt` | Tracked root documentation file within batch scope. |
| MOVE | `FORGE_IMPLEMENTATION_READINESS_001B_PROPOSITION_SUPPORT_CONDITION_VOCABULARY.txt` | `docs/03-discovery/FORGE_IMPLEMENTATION_READINESS_001B_PROPOSITION_SUPPORT_CONDITION_VOCABULARY.txt` | Tracked root documentation file within batch scope. |
| MOVE | `FORGE_IMPLEMENTATION_READINESS_001B_REPORT.txt` | `docs/03-discovery/FORGE_IMPLEMENTATION_READINESS_001B_REPORT.txt` | Tracked root documentation file within batch scope. |
| MOVE | `FORGE_IMPLEMENTATION_READINESS_001C_DISCOVERY_LOCK.txt` | `docs/03-discovery/FORGE_IMPLEMENTATION_READINESS_001C_DISCOVERY_LOCK.txt` | Tracked root documentation file within batch scope. |
| MOVE | `FORGE_IMPLEMENTATION_READINESS_001C_REPORT.txt` | `docs/03-discovery/FORGE_IMPLEMENTATION_READINESS_001C_REPORT.txt` | Tracked root documentation file within batch scope. |
| SKIP_TEST_DOC | `FORGE_IMPLEMENTATION_READINESS_001C_TRUTH_VALIDATION_RESULT_CONTRACT.txt` | - | Filename indicates test/validation artifact; user excluded any test file. |
| MOVE | `FORGE_IMPLEMENTATION_READINESS_001D_REPORT.txt` | `docs/03-discovery/FORGE_IMPLEMENTATION_READINESS_001D_REPORT.txt` | Tracked root documentation file within batch scope. |
| MOVE | `FORGE_IMPLEMENTATION_READINESS_001D_UNKNOWN_STALE_CONFLICT_HANDLING_CONTRACT.txt` | `docs/03-discovery/FORGE_IMPLEMENTATION_READINESS_001D_UNKNOWN_STALE_CONFLICT_HANDLING_CONTRACT.txt` | Tracked root documentation file within batch scope. |
| MOVE | `FORGE_IMPLEMENTATION_READINESS_001E_CROSS_DOMAIN_QA_HARNESS.txt` | `docs/03-discovery/FORGE_IMPLEMENTATION_READINESS_001E_CROSS_DOMAIN_QA_HARNESS.txt` | Tracked root documentation file within batch scope. |
| MOVE | `FORGE_IMPLEMENTATION_READINESS_001E_REPORT.txt` | `docs/03-discovery/FORGE_IMPLEMENTATION_READINESS_001E_REPORT.txt` | Tracked root documentation file within batch scope. |
| MOVE | `FORGE_IMPLEMENTATION_READINESS_001F_IMPLEMENTATION_PLAN_V0_1.txt` | `docs/03-discovery/FORGE_IMPLEMENTATION_READINESS_001F_IMPLEMENTATION_PLAN_V0_1.txt` | Tracked root documentation file within batch scope. |
| MOVE | `FORGE_IMPLEMENTATION_READINESS_001F_REPORT.txt` | `docs/03-discovery/FORGE_IMPLEMENTATION_READINESS_001F_REPORT.txt` | Tracked root documentation file within batch scope. |
| MOVE | `FORGE_IMPLEMENTATION_READINESS_001_EVIDENCE_SOURCE_TRUTH_LAYER.txt` | `docs/03-discovery/FORGE_IMPLEMENTATION_READINESS_001_EVIDENCE_SOURCE_TRUTH_LAYER.txt` | Tracked root documentation file within batch scope. |
| MOVE | `FORGE_JUDGMENT_DEVELOPMENT_DISCOVERY.md` | `docs/03-discovery/FORGE_JUDGMENT_DEVELOPMENT_DISCOVERY.md` | Tracked root documentation file within batch scope. |
| MOVE | `FORGE_JUDGMENT_EVIDENCE_PATTERNS.txt` | `docs/03-discovery/FORGE_JUDGMENT_EVIDENCE_PATTERNS.txt` | Tracked root documentation file within batch scope. |
| MOVE | `FORGE_JUDGMENT_VS_PRODUCTION_ANALYSIS.md` | `docs/04-product-intelligence/FORGE_JUDGMENT_VS_PRODUCTION_ANALYSIS.md` | Tracked root documentation file within batch scope. |
| MOVE | `FORGE_LARIZA_ADVISOR_COPILOT.md` | `docs/archive/FORGE_LARIZA_ADVISOR_COPILOT.md` | Tracked root documentation file within batch scope. |
| MOVE | `FORGE_LARIZA_CLIENT_PRESENTATION.md` | `docs/archive/FORGE_LARIZA_CLIENT_PRESENTATION.md` | Tracked root documentation file within batch scope. |
| MOVE | `FORGE_LARIZA_DECISION_CLARITY_REVIEW.md` | `docs/archive/FORGE_LARIZA_DECISION_CLARITY_REVIEW.md` | Tracked root documentation file within batch scope. |
| MOVE | `FORGE_LARIZA_EXECUTIVE_SUMMARY.txt` | `docs/archive/FORGE_LARIZA_EXECUTIVE_SUMMARY.txt` | Tracked root documentation file within batch scope. |
| SKIP_TEST_DOC | `FORGE_LARIZA_PEDRO_CAMARENA_TEST.md` | - | Filename indicates test/validation artifact; user excluded any test file. |
| MOVE | `FORGE_LARIZA_QUOTE_REVIEW.md` | `docs/04-product-intelligence/FORGE_LARIZA_QUOTE_REVIEW.md` | Tracked root documentation file within batch scope. |
| MOVE | `FORGE_LOCK_CANDIDATE_REVIEW.md` | `docs/archive/FORGE_LOCK_CANDIDATE_REVIEW.md` | Tracked root documentation file within batch scope. |
| MOVE | `FORGE_LOCK_PRIORITY_ORDER.txt` | `docs/archive/FORGE_LOCK_PRIORITY_ORDER.txt` | Tracked root documentation file within batch scope. |
| MOVE | `FORGE_MANAGER_FRICTION_DISCOVERY.md` | `docs/04-manager-os/FORGE_MANAGER_FRICTION_DISCOVERY.md` | Tracked root documentation file within batch scope. |
| BLOCKED_UNTRACKED | `FORGE_MANAGER_OS_BLUEPRINT.md` | `docs/04-manager-os/FORGE_MANAGER_OS_BLUEPRINT.md` | Untracked root doc; git mv cannot move it without first changing tracking state. |
| SKIP_PROTECTED | `FORGE_MASTER_BUILD_TREE.md` | - | Protected root governance anchor. |
| MOVE | `FORGE_MISSING_SOURCES_REPORT.md` | `docs/archive/FORGE_MISSING_SOURCES_REPORT.md` | Tracked root documentation file within batch scope. |
| MOVE | `FORGE_NEXT_DISCOVERY_PRIORITY_REPORT.md` | `docs/03-discovery/FORGE_NEXT_DISCOVERY_PRIORITY_REPORT.md` | Tracked root documentation file within batch scope. |
| MOVE | `FORGE_OS_CURRENT_STATE_DOMAIN_COMPENSATION_ADVISOR_EXPERIENCE.md` | `docs/archive/FORGE_OS_CURRENT_STATE_DOMAIN_COMPENSATION_ADVISOR_EXPERIENCE.md` | Tracked root documentation file within batch scope. |
| MOVE | `FORGE_OS_CURRENT_STATE_DOMAIN_COMPENSATION_ADVISOR_EXPERIENCE.txt` | `docs/archive/FORGE_OS_CURRENT_STATE_DOMAIN_COMPENSATION_ADVISOR_EXPERIENCE.txt` | Tracked root documentation file within batch scope. |
| MOVE | `FORGE_PAQ12_MARKDOWN_CONVERSION_BUNDLE.txt` | `docs/archive/FORGE_PAQ12_MARKDOWN_CONVERSION_BUNDLE.txt` | Tracked root documentation file within batch scope. |
| MOVE | `FORGE_PAQ_MARKDOWN_CONVERSION_BUNDLE.txt` | `docs/archive/FORGE_PAQ_MARKDOWN_CONVERSION_BUNDLE.txt` | Tracked root documentation file within batch scope. |
| MOVE | `FORGE_PEDRO_CAMARENA_INTELLIGENCE_DISCOVERY.md` | `docs/03-discovery/FORGE_PEDRO_CAMARENA_INTELLIGENCE_DISCOVERY.md` | Tracked root documentation file within batch scope. |
| MOVE | `FORGE_PHASE_2_1_ARCHITECTURE_DECISION_LOG.md` | `docs/archive/FORGE_PHASE_2_1_ARCHITECTURE_DECISION_LOG.md` | Tracked root documentation file within batch scope. |
| MOVE | `FORGE_PHASE_2_1_BUILD_TREE_DECISION_NOTES.md` | `docs/02-build-tree/FORGE_PHASE_2_1_BUILD_TREE_DECISION_NOTES.md` | Tracked root documentation file within batch scope. |
| MOVE | `FORGE_PHASE_2_1_DO_NOT_TOUCH_LIST.txt` | `docs/02-build-tree/FORGE_PHASE_2_1_DO_NOT_TOUCH_LIST.txt` | Tracked root documentation file within batch scope. |
| MOVE | `FORGE_PHASE_2_1_MODULE_DECISION_TABLE.txt` | `docs/02-build-tree/FORGE_PHASE_2_1_MODULE_DECISION_TABLE.txt` | Tracked root documentation file within batch scope. |
| MOVE | `FORGE_PHASE_2_1_REFACTOR_CANDIDATE_QUEUE.txt` | `docs/02-build-tree/FORGE_PHASE_2_1_REFACTOR_CANDIDATE_QUEUE.txt` | Tracked root documentation file within batch scope. |
| MOVE | `FORGE_PHASE_2_2_REFACTOR_PLANNING_SUMMARY.txt` | `docs/02-build-tree/FORGE_PHASE_2_2_REFACTOR_PLANNING_SUMMARY.txt` | Tracked root documentation file within batch scope. |
| MOVE | `FORGE_PHASE_2_HUMAN_REVIEW_SUMMARY.txt` | `docs/archive/FORGE_PHASE_2_HUMAN_REVIEW_SUMMARY.txt` | Tracked root documentation file within batch scope. |
| MOVE | `FORGE_PHASE_2_X_ARCHITECTURE_REVIEW.md` | `docs/archive/FORGE_PHASE_2_X_ARCHITECTURE_REVIEW.md` | Tracked root documentation file within batch scope. |
| MOVE | `FORGE_PHASE_2_X_CLOSEOUT_NOTE.md` | `docs/archive/FORGE_PHASE_2_X_CLOSEOUT_NOTE.md` | Tracked root documentation file within batch scope. |
| MOVE | `FORGE_PHASE_2_X_CONCEPTUAL_BUILD_TREE.md` | `docs/02-build-tree/FORGE_PHASE_2_X_CONCEPTUAL_BUILD_TREE.md` | Tracked root documentation file within batch scope. |
| MOVE | `FORGE_PHASE_2_X_CONSOLIDATE_LATER_QUEUE.txt` | `docs/02-build-tree/FORGE_PHASE_2_X_CONSOLIDATE_LATER_QUEUE.txt` | Tracked root documentation file within batch scope. |
| MOVE | `FORGE_PHASE_2_X_DELETE_LATER_ONLY_IF_PROVEN_UNUSED_QUEUE.txt` | `docs/02-build-tree/FORGE_PHASE_2_X_DELETE_LATER_ONLY_IF_PROVEN_UNUSED_QUEUE.txt` | Tracked root documentation file within batch scope. |
| MOVE | `FORGE_PHASE_2_X_DO_NOT_TOUCH_LIST.txt` | `docs/02-build-tree/FORGE_PHASE_2_X_DO_NOT_TOUCH_LIST.txt` | Tracked root documentation file within batch scope. |
| MOVE | `FORGE_PHASE_2_X_MODULE_DECISION_TABLE.txt` | `docs/02-build-tree/FORGE_PHASE_2_X_MODULE_DECISION_TABLE.txt` | Tracked root documentation file within batch scope. |
| MOVE | `FORGE_PHASE_2_X_MODULE_MARKDOWN_BUNDLE.md` | `docs/archive/FORGE_PHASE_2_X_MODULE_MARKDOWN_BUNDLE.md` | Tracked root documentation file within batch scope. |
| MOVE | `FORGE_PHASE_2_X_MOVE_LATER_QUEUE.txt` | `docs/02-build-tree/FORGE_PHASE_2_X_MOVE_LATER_QUEUE.txt` | Tracked root documentation file within batch scope. |
| MOVE | `FORGE_PHASE_2_X_REFACTOR_CANDIDATE_QUEUE.txt` | `docs/02-build-tree/FORGE_PHASE_2_X_REFACTOR_CANDIDATE_QUEUE.txt` | Tracked root documentation file within batch scope. |
| MOVE | `FORGE_PHASE_2_X_REFACTOR_SUMMARY.txt` | `docs/02-build-tree/FORGE_PHASE_2_X_REFACTOR_SUMMARY.txt` | Tracked root documentation file within batch scope. |
| MOVE | `FORGE_PHASE_2_X_REVIEW_REQUIRED_QUEUE.txt` | `docs/02-build-tree/FORGE_PHASE_2_X_REVIEW_REQUIRED_QUEUE.txt` | Tracked root documentation file within batch scope. |
| MOVE | `FORGE_PHASE_TRANSITION_CONSTITUTION_TO_IMPLEMENTATION.txt` | `docs/architecture/constitution/FORGE_PHASE_TRANSITION_CONSTITUTION_TO_IMPLEMENTATION.txt` | Tracked root documentation file within batch scope. |
| MOVE | `FORGE_PHASE_TRANSITION_FOUNDATION_TO_INTELLIGENCE.md` | `docs/archive/FORGE_PHASE_TRANSITION_FOUNDATION_TO_INTELLIGENCE.md` | Tracked root documentation file within batch scope. |
| MOVE | `FORGE_PHASE_TRANSITION_FOUNDATION_TO_INTELLIGENCE.txt` | `docs/archive/FORGE_PHASE_TRANSITION_FOUNDATION_TO_INTELLIGENCE.txt` | Tracked root documentation file within batch scope. |
| MOVE | `FORGE_PROFESSIONAL_DEVELOPMENT_MODEL_DISCOVERY.md` | `docs/03-discovery/FORGE_PROFESSIONAL_DEVELOPMENT_MODEL_DISCOVERY.md` | Tracked root documentation file within batch scope. |
| MOVE | `FORGE_PROFESSIONAL_EXCELLENCE_MODEL_DISCOVERY.md` | `docs/03-discovery/FORGE_PROFESSIONAL_EXCELLENCE_MODEL_DISCOVERY.md` | Tracked root documentation file within batch scope. |
| MOVE | `FORGE_PROFESSIONAL_SALES_LAW_CANDIDATES.md` | `docs/03-discovery/FORGE_PROFESSIONAL_SALES_LAW_CANDIDATES.md` | Tracked root documentation file within batch scope. |
| MOVE | `FORGE_PROFESSIONAL_SALES_PROCESS_DISCOVERY.md` | `docs/03-discovery/FORGE_PROFESSIONAL_SALES_PROCESS_DISCOVERY.md` | Tracked root documentation file within batch scope. |
| SKIP_TEST_DOC | `FORGE_PROJECTION_ENGINE_VS_EXCEL_VALIDATION_REPORT.txt` | - | Filename indicates test/validation artifact; user excluded any test file. |
| MOVE | `FORGE_PROJECTION_INTELLIGENCE_CHECKPOINT_NOTE.md` | `docs/archive/FORGE_PROJECTION_INTELLIGENCE_CHECKPOINT_NOTE.md` | Tracked root documentation file within batch scope. |
| MOVE | `FORGE_PROSPECT_DECISION_TIMELINE_DISCOVERY.md` | `docs/03-discovery/FORGE_PROSPECT_DECISION_TIMELINE_DISCOVERY.md` | Tracked root documentation file within batch scope. |
| MOVE | `FORGE_QUOTE_VS_POLICY_ANALYSIS.md` | `docs/04-product-intelligence/FORGE_QUOTE_VS_POLICY_ANALYSIS.md` | Tracked root documentation file within batch scope. |
| MOVE | `FORGE_RATIFICATION_AND_FOUNDATION_CLOSURE.md` | `docs/architecture/constitution/FORGE_RATIFICATION_AND_FOUNDATION_CLOSURE.md` | Tracked root documentation file within batch scope. |
| MOVE | `FORGE_RATIFICATION_AND_FOUNDATION_CLOSURE.txt` | `docs/architecture/constitution/FORGE_RATIFICATION_AND_FOUNDATION_CLOSURE.txt` | Tracked root documentation file within batch scope. |
| MOVE | `FORGE_READINESS_INTELLIGENCE_DISCOVERY.md` | `docs/03-discovery/FORGE_READINESS_INTELLIGENCE_DISCOVERY.md` | Tracked root documentation file within batch scope. |
| MOVE | `FORGE_READINESS_MODEL_CANDIDATE.md` | `docs/03-discovery/FORGE_READINESS_MODEL_CANDIDATE.md` | Tracked root documentation file within batch scope. |
| MOVE | `FORGE_READINESS_SIGNALS_DISCOVERY.md` | `docs/03-discovery/FORGE_READINESS_SIGNALS_DISCOVERY.md` | Tracked root documentation file within batch scope. |
| MOVE | `FORGE_READINESS_VS_FRICTION_COMPARISON.md` | `docs/03-discovery/FORGE_READINESS_VS_FRICTION_COMPARISON.md` | Tracked root documentation file within batch scope. |
| MOVE | `FORGE_REAL_WORLD_CASE_REVIEW.md` | `docs/archive/FORGE_REAL_WORLD_CASE_REVIEW.md` | Tracked root documentation file within batch scope. |
| MOVE | `FORGE_REAL_WORLD_EXECUTIVE_SUMMARY.txt` | `docs/archive/FORGE_REAL_WORLD_EXECUTIVE_SUMMARY.txt` | Tracked root documentation file within batch scope. |
| BLOCKED_UNTRACKED | `FORGE_REPOSITORY_MIGRATION_PLAN.md` | `docs/06-repository-governance/FORGE_REPOSITORY_MIGRATION_PLAN.md` | Untracked root doc; git mv cannot move it without first changing tracking state. |
| MOVE | `FORGE_RETIREMENT_FUTURE_UDI_PROJECTION_REPORT.txt` | `docs/archive/FORGE_RETIREMENT_FUTURE_UDI_PROJECTION_REPORT.txt` | Tracked root documentation file within batch scope. |
| MOVE | `FORGE_RETIREMENT_FUTURE_UDI_REASONING_DIAGRAM.md` | `docs/archive/FORGE_RETIREMENT_FUTURE_UDI_REASONING_DIAGRAM.md` | Tracked root documentation file within batch scope. |
| MOVE | `FORGE_SALES_DECISION_SEQUENCE_DISCOVERY.md` | `docs/03-discovery/FORGE_SALES_DECISION_SEQUENCE_DISCOVERY.md` | Tracked root documentation file within batch scope. |
| MOVE | `FORGE_SHARED_COMMERCIAL_MODEL_EVIDENCE_PROVENANCE_FOUNDATION.md` | `docs/archive/FORGE_SHARED_COMMERCIAL_MODEL_EVIDENCE_PROVENANCE_FOUNDATION.md` | Tracked root documentation file within batch scope. |
| MOVE | `FORGE_SHARED_COMMERCIAL_MODEL_EVIDENCE_PROVENANCE_FOUNDATION.txt` | `docs/archive/FORGE_SHARED_COMMERCIAL_MODEL_EVIDENCE_PROVENANCE_FOUNDATION.txt` | Tracked root documentation file within batch scope. |
| MOVE | `FORGE_SHARED_COMMERCIAL_MODEL_FOUNDATION_REVIEW.md` | `docs/archive/FORGE_SHARED_COMMERCIAL_MODEL_FOUNDATION_REVIEW.md` | Tracked root documentation file within batch scope. |
| MOVE | `FORGE_SHARED_COMMERCIAL_MODEL_FOUNDATION_REVIEW.txt` | `docs/archive/FORGE_SHARED_COMMERCIAL_MODEL_FOUNDATION_REVIEW.txt` | Tracked root documentation file within batch scope. |
| MOVE | `FORGE_SHARED_COMMERCIAL_MODEL_IDENTITY_ATTRIBUTION_HARDENING.md` | `docs/archive/FORGE_SHARED_COMMERCIAL_MODEL_IDENTITY_ATTRIBUTION_HARDENING.md` | Tracked root documentation file within batch scope. |
| MOVE | `FORGE_SHARED_COMMERCIAL_MODEL_IDENTITY_ATTRIBUTION_HARDENING.txt` | `docs/archive/FORGE_SHARED_COMMERCIAL_MODEL_IDENTITY_ATTRIBUTION_HARDENING.txt` | Tracked root documentation file within batch scope. |
| MOVE | `FORGE_SHARED_COMMERCIAL_MODEL_PERIODS_OPERATIONAL_CLOCKS_HARDENING.md` | `docs/archive/FORGE_SHARED_COMMERCIAL_MODEL_PERIODS_OPERATIONAL_CLOCKS_HARDENING.md` | Tracked root documentation file within batch scope. |
| MOVE | `FORGE_SHARED_COMMERCIAL_MODEL_PERIODS_OPERATIONAL_CLOCKS_HARDENING.txt` | `docs/archive/FORGE_SHARED_COMMERCIAL_MODEL_PERIODS_OPERATIONAL_CLOCKS_HARDENING.txt` | Tracked root documentation file within batch scope. |
| MOVE | `FORGE_SHARED_DOMAIN_MODEL.md` | `docs/archive/FORGE_SHARED_DOMAIN_MODEL.md` | Tracked root documentation file within batch scope. |
| MOVE | `FORGE_SHARED_POLICY_CURRENCY_TIMELINE_RECOMMENDATION.md` | `docs/archive/FORGE_SHARED_POLICY_CURRENCY_TIMELINE_RECOMMENDATION.md` | Tracked root documentation file within batch scope. |
| MOVE | `FORGE_SKYNET_BOUNDARIES_AND_RISKS.txt` | `docs/03-discovery/FORGE_SKYNET_BOUNDARIES_AND_RISKS.txt` | Tracked root documentation file within batch scope. |
| MOVE | `FORGE_SKYNET_DISCOVERY.md` | `docs/03-discovery/FORGE_SKYNET_DISCOVERY.md` | Tracked root documentation file within batch scope. |
| MOVE | `FORGE_SKYNET_GOVERNANCE_MODEL.md` | `docs/03-discovery/FORGE_SKYNET_GOVERNANCE_MODEL.md` | Tracked root documentation file within batch scope. |
| MOVE | `FORGE_SKYNET_LAW_CANDIDATES.txt` | `docs/03-discovery/FORGE_SKYNET_LAW_CANDIDATES.txt` | Tracked root documentation file within batch scope. |
| MOVE | `FORGE_SOURCE_OWNERSHIP_REGISTRY_V0_1_IMPLEMENTATION_REPORT.txt` | `docs/archive/FORGE_SOURCE_OWNERSHIP_REGISTRY_V0_1_IMPLEMENTATION_REPORT.txt` | Tracked root documentation file within batch scope. |
| MOVE | `FORGE_TEMP_BANXICO_ENABLEMENT_REPORT.txt` | `docs/archive/FORGE_TEMP_BANXICO_ENABLEMENT_REPORT.txt` | Tracked root documentation file within batch scope. |
| MOVE | `FORGE_TRUTHS_CONSOLIDATION_REPORT.txt` | `docs/archive/FORGE_TRUTHS_CONSOLIDATION_REPORT.txt` | Tracked root documentation file within batch scope. |
| MOVE | `FORGE_TRUTH_CLASSIFICATION_MATRIX.md` | `docs/architecture/constitution/FORGE_TRUTH_CLASSIFICATION_MATRIX.md` | Tracked root documentation file within batch scope. |
| MOVE | `FORGE_TRUTH_DEPENDENCY_MAP.md` | `docs/architecture/constitution/FORGE_TRUTH_DEPENDENCY_MAP.md` | Tracked root documentation file within batch scope. |
| MOVE | `FORGE_UDI_HISTORICAL_GROWTH_REPORT.txt` | `docs/archive/FORGE_UDI_HISTORICAL_GROWTH_REPORT.txt` | Tracked root documentation file within batch scope. |
| SKIP_TEST_DOC | `FORGE_UDI_PROJECTION_VALIDATION_REPORT.txt` | - | Filename indicates test/validation artifact; user excluded any test file. |
| MOVE | `FORGE_UNIVERSAL_SALES_PRINCIPLES_DISCOVERY.md` | `docs/03-discovery/FORGE_UNIVERSAL_SALES_PRINCIPLES_DISCOVERY.md` | Tracked root documentation file within batch scope. |
| MOVE | `FORGE_UNKNOWN_QUESTIONS_QUEUE.txt` | `docs/archive/FORGE_UNKNOWN_QUESTIONS_QUEUE.txt` | Tracked root documentation file within batch scope. |
| SKIP_TEST_DOC | `FORGE_VALIDATION_REQUIREMENTS_REPORT.md` | - | Filename indicates test/validation artifact; user excluded any test file. |
| MOVE | `FORGE_WALL_E_PROBLEM_ANALYSIS.txt` | `docs/03-discovery/FORGE_WALL_E_PROBLEM_ANALYSIS.txt` | Tracked root documentation file within batch scope. |
| MOVE | `IMAGINA_SER_EDWIN_ADVISOR_INTERPRETATION_REPORT.md` | `docs/archive/IMAGINA_SER_EDWIN_ADVISOR_INTERPRETATION_REPORT.md` | Tracked root documentation file within batch scope. |
| MOVE | `IMAGINA_SER_EDWIN_RAW_SOURCE_REPORT.md` | `docs/archive/IMAGINA_SER_EDWIN_RAW_SOURCE_REPORT.md` | Tracked root documentation file within batch scope. |
| MOVE | `IMAGINA_SER_EDWIN_REASONING_DIAGRAM.md` | `docs/archive/IMAGINA_SER_EDWIN_REASONING_DIAGRAM.md` | Tracked root documentation file within batch scope. |
| MOVE | `INTERVIEW_KNOWLEDGE_BASE.md` | `docs/archive/INTERVIEW_KNOWLEDGE_BASE.md` | Tracked root documentation file within batch scope. |
| MOVE | `MANAGER_COMPENSATION_KNOWLEDGE_BASE.md` | `docs/04-manager-os/MANAGER_COMPENSATION_KNOWLEDGE_BASE.md` | Tracked root documentation file within batch scope. |
| MOVE | `PACKAGE_NOTES.md` | `docs/archive/PACKAGE_NOTES.md` | Tracked root documentation file within batch scope. |
| MOVE | `PAQ-01-RECRUITMENT-INTELLIGENCE-DISCOVERY.md` | `docs/adr/PAQ-01-RECRUITMENT-INTELLIGENCE-DISCOVERY.md` | Tracked root documentation file within batch scope. |
| MOVE | `PAQ-01-RECRUITMENT-INTELLIGENCE-DISCOVERY.txt` | `docs/adr/PAQ-01-RECRUITMENT-INTELLIGENCE-DISCOVERY.txt` | Tracked root documentation file within batch scope. |
| MOVE | `PAQ-02-RECRUITMENT-DOMAIN-MODEL-ADDENDUM.md` | `docs/adr/PAQ-02-RECRUITMENT-DOMAIN-MODEL-ADDENDUM.md` | Tracked root documentation file within batch scope. |
| MOVE | `PAQ-02-RECRUITMENT-DOMAIN-MODEL-ADDENDUM.txt` | `docs/adr/PAQ-02-RECRUITMENT-DOMAIN-MODEL-ADDENDUM.txt` | Tracked root documentation file within batch scope. |
| MOVE | `PAQ-02-RECRUITMENT-DOMAIN-MODEL.md` | `docs/adr/PAQ-02-RECRUITMENT-DOMAIN-MODEL.md` | Tracked root documentation file within batch scope. |
| MOVE | `PAQ-02-RECRUITMENT-DOMAIN-MODEL.txt` | `docs/adr/PAQ-02-RECRUITMENT-DOMAIN-MODEL.txt` | Tracked root documentation file within batch scope. |
| MOVE | `PAQ-03-CAREER-CAPITAL-RELATIONSHIP-CAPITAL-BOUNDARY-REVIEW.md` | `docs/adr/PAQ-03-CAREER-CAPITAL-RELATIONSHIP-CAPITAL-BOUNDARY-REVIEW.md` | Tracked root documentation file within batch scope. |
| MOVE | `PAQ-03-CAREER-CAPITAL-RELATIONSHIP-CAPITAL-BOUNDARY-REVIEW.txt` | `docs/adr/PAQ-03-CAREER-CAPITAL-RELATIONSHIP-CAPITAL-BOUNDARY-REVIEW.txt` | Tracked root documentation file within batch scope. |
| MOVE | `PAQ-04-METRICS-OWNERSHIP-FINALIZATION.md` | `docs/adr/PAQ-04-METRICS-OWNERSHIP-FINALIZATION.md` | Tracked root documentation file within batch scope. |
| MOVE | `PAQ-04-METRICS-OWNERSHIP-FINALIZATION.txt` | `docs/adr/PAQ-04-METRICS-OWNERSHIP-FINALIZATION.txt` | Tracked root documentation file within batch scope. |
| MOVE | `PAQ-04-P200-MARKET-NATURAL-DISCOVERY-REVIEW.md` | `docs/adr/PAQ-04-P200-MARKET-NATURAL-DISCOVERY-REVIEW.md` | Tracked root documentation file within batch scope. |
| MOVE | `PAQ-04-P200-MARKET-NATURAL-DISCOVERY-REVIEW.txt` | `docs/adr/PAQ-04-P200-MARKET-NATURAL-DISCOVERY-REVIEW.txt` | Tracked root documentation file within batch scope. |
| MOVE | `PAQ-05-RELATIONSHIP-ACTIVATION-REVIEW.md` | `docs/adr/PAQ-05-RELATIONSHIP-ACTIVATION-REVIEW.md` | Tracked root documentation file within batch scope. |
| MOVE | `PAQ-05-RELATIONSHIP-ACTIVATION-REVIEW.txt` | `docs/adr/PAQ-05-RELATIONSHIP-ACTIVATION-REVIEW.txt` | Tracked root documentation file within batch scope. |
| MOVE | `PAQ-05-RULE-SNAPSHOT-HARDENING.md` | `docs/adr/PAQ-05-RULE-SNAPSHOT-HARDENING.md` | Tracked root documentation file within batch scope. |
| MOVE | `PAQ-05-RULE-SNAPSHOT-HARDENING.txt` | `docs/adr/PAQ-05-RULE-SNAPSHOT-HARDENING.txt` | Tracked root documentation file within batch scope. |
| MOVE | `PAQ-06-COMMERCIAL-EVENTS-TAXONOMY.md` | `docs/adr/PAQ-06-COMMERCIAL-EVENTS-TAXONOMY.md` | Tracked root documentation file within batch scope. |
| MOVE | `PAQ-06-COMMERCIAL-EVENTS-TAXONOMY.txt` | `docs/adr/PAQ-06-COMMERCIAL-EVENTS-TAXONOMY.txt` | Tracked root documentation file within batch scope. |
| MOVE | `PAQ-06-RECRUITMENT-HARDENING-REVIEW.md` | `docs/adr/PAQ-06-RECRUITMENT-HARDENING-REVIEW.md` | Tracked root documentation file within batch scope. |
| MOVE | `PAQ-06-RECRUITMENT-HARDENING-REVIEW.txt` | `docs/adr/PAQ-06-RECRUITMENT-HARDENING-REVIEW.txt` | Tracked root documentation file within batch scope. |
| MOVE | `PAQ-07-FOUNDATION-LOCK-REVIEW.md` | `docs/adr/PAQ-07-FOUNDATION-LOCK-REVIEW.md` | Tracked root documentation file within batch scope. |
| MOVE | `PAQ-07-FOUNDATION-LOCK-REVIEW.txt` | `docs/adr/PAQ-07-FOUNDATION-LOCK-REVIEW.txt` | Tracked root documentation file within batch scope. |
| MOVE | `PAQ-07-PARTNER-INTELLIGENCE-DISCOVERY.md` | `docs/adr/PAQ-07-PARTNER-INTELLIGENCE-DISCOVERY.md` | Tracked root documentation file within batch scope. |
| MOVE | `PAQ-07-PARTNER-INTELLIGENCE-DISCOVERY.txt` | `docs/adr/PAQ-07-PARTNER-INTELLIGENCE-DISCOVERY.txt` | Tracked root documentation file within batch scope. |
| MOVE | `PAQ-08-ADVISOR-DEVELOPMENT-INTELLIGENCE-DISCOVERY.md` | `docs/adr/PAQ-08-ADVISOR-DEVELOPMENT-INTELLIGENCE-DISCOVERY.md` | Tracked root documentation file within batch scope. |
| MOVE | `PAQ-08-ADVISOR-DEVELOPMENT-INTELLIGENCE-DISCOVERY.txt` | `docs/adr/PAQ-08-ADVISOR-DEVELOPMENT-INTELLIGENCE-DISCOVERY.txt` | Tracked root documentation file within batch scope. |
| MOVE | `PAQ-08-FOUNDATION-LOCK-FINAL-REVIEW.md` | `docs/adr/PAQ-08-FOUNDATION-LOCK-FINAL-REVIEW.md` | Tracked root documentation file within batch scope. |
| MOVE | `PAQ-08-FOUNDATION-LOCK-FINAL-REVIEW.txt` | `docs/adr/PAQ-08-FOUNDATION-LOCK-FINAL-REVIEW.txt` | Tracked root documentation file within batch scope. |
| MOVE | `PAQ-08.5-ARCHITECTURE-RISK-CORRECTION-RATIFICATION.md` | `docs/architecture/constitution/PAQ-08.5-ARCHITECTURE-RISK-CORRECTION-RATIFICATION.md` | Tracked root documentation file within batch scope. |
| MOVE | `PAQ-08.5-ARCHITECTURE-RISK-CORRECTION-RATIFICATION.txt` | `docs/architecture/constitution/PAQ-08.5-ARCHITECTURE-RISK-CORRECTION-RATIFICATION.txt` | Tracked root documentation file within batch scope. |
| MOVE | `PAQ-09-PRODUCTIVITY-INTELLIGENCE-ARQUITECTURA-CONCEPTUAL.txt` | `docs/adr/PAQ-09-PRODUCTIVITY-INTELLIGENCE-ARQUITECTURA-CONCEPTUAL.txt` | Tracked root documentation file within batch scope. |
| MOVE | `PAQ-09-PRODUCTIVITY-INTELLIGENCE-DISCOVERY.md` | `docs/adr/PAQ-09-PRODUCTIVITY-INTELLIGENCE-DISCOVERY.md` | Tracked root documentation file within batch scope. |
| MOVE | `PAQ-09-PRODUCTIVITY-INTELLIGENCE-DISCOVERY.txt` | `docs/adr/PAQ-09-PRODUCTIVITY-INTELLIGENCE-DISCOVERY.txt` | Tracked root documentation file within batch scope. |
| MOVE | `PAQ-09-Productivity-Intelligence.txt` | `docs/adr/PAQ-09-Productivity-Intelligence.txt` | Tracked root documentation file within batch scope. |
| MOVE | `PAQ-09.5-PRODUCTIVITY-INTELLIGENCE-ARCHITECTURE-LOCK.md` | `docs/adr/PAQ-09.5-PRODUCTIVITY-INTELLIGENCE-ARCHITECTURE-LOCK.md` | Tracked root documentation file within batch scope. |
| MOVE | `PAQ-09.5-PRODUCTIVITY-INTELLIGENCE-ARCHITECTURE-LOCK.txt` | `docs/adr/PAQ-09.5-PRODUCTIVITY-INTELLIGENCE-ARCHITECTURE-LOCK.txt` | Tracked root documentation file within batch scope. |
| MOVE | `PAQ-10-CONSERVATION-INTELLIGENCE-DISCOVERY.md` | `docs/adr/PAQ-10-CONSERVATION-INTELLIGENCE-DISCOVERY.md` | Tracked root documentation file within batch scope. |
| MOVE | `PAQ-10-CONSERVATION-INTELLIGENCE-DISCOVERY.txt` | `docs/adr/PAQ-10-CONSERVATION-INTELLIGENCE-DISCOVERY.txt` | Tracked root documentation file within batch scope. |
| MOVE | `PAQ-10.5-CONSERVATION-INTELLIGENCE-ARCHITECTURE-LOCK.md` | `docs/adr/PAQ-10.5-CONSERVATION-INTELLIGENCE-ARCHITECTURE-LOCK.md` | Tracked root documentation file within batch scope. |
| MOVE | `PAQ-10.5-CONSERVATION-INTELLIGENCE-ARCHITECTURE-LOCK.txt` | `docs/adr/PAQ-10.5-CONSERVATION-INTELLIGENCE-ARCHITECTURE-LOCK.txt` | Tracked root documentation file within batch scope. |
| MOVE | `PAQ-11-FORECAST-INTELLIGENCE-DISCOVERY.md` | `docs/adr/PAQ-11-FORECAST-INTELLIGENCE-DISCOVERY.md` | Tracked root documentation file within batch scope. |
| MOVE | `PAQ-11-FORECAST-INTELLIGENCE-DISCOVERY.txt` | `docs/adr/PAQ-11-FORECAST-INTELLIGENCE-DISCOVERY.txt` | Tracked root documentation file within batch scope. |
| MOVE | `PAQ-11-FORECAST-INTELLIGENCE-MARKDOWN-REVIEW.txt` | `docs/adr/PAQ-11-FORECAST-INTELLIGENCE-MARKDOWN-REVIEW.txt` | Tracked root documentation file within batch scope. |
| MOVE | `PAQ-11.5-FORECAST-INTELLIGENCE-ARCHITECTURE.md` | `docs/adr/PAQ-11.5-FORECAST-INTELLIGENCE-ARCHITECTURE.md` | Tracked root documentation file within batch scope. |
| MOVE | `PAQ-11.5.2-FORECAST-INTELLIGENCE-ARCHITECTURE-LOCK.md` | `docs/adr/PAQ-11.5.2-FORECAST-INTELLIGENCE-ARCHITECTURE-LOCK.md` | Tracked root documentation file within batch scope. |
| MOVE | `PAQ-11.5.2-FORECAST-INTELLIGENCE-LOCK-REVIEW.txt` | `docs/adr/PAQ-11.5.2-FORECAST-INTELLIGENCE-LOCK-REVIEW.txt` | Tracked root documentation file within batch scope. |
| MOVE | `PAQ-11.5.2-FORECAST-INTELLIGENCE.md` | `docs/adr/PAQ-11.5.2-FORECAST-INTELLIGENCE.md` | Tracked root documentation file within batch scope. |
| MOVE | `PAQ-12-ADVISOR-EXPERIENCE-INTELLIGENCE-PRODUCTIVITY.md` | `docs/adr/PAQ-12-ADVISOR-EXPERIENCE-INTELLIGENCE-PRODUCTIVITY.md` | Tracked root documentation file within batch scope. |
| MOVE | `PAQ-12.1-ADVISOR-EXPERIENCE-INTELLIGENCE-ARCHITECTURE.md` | `docs/adr/PAQ-12.1-ADVISOR-EXPERIENCE-INTELLIGENCE-ARCHITECTURE.md` | Tracked root documentation file within batch scope. |
| MOVE | `PAQ-12.x.y-FIRST-WOW-MOMENT-DISCOVERY.md` | `docs/adr/PAQ-12.x.y-FIRST-WOW-MOMENT-DISCOVERY.md` | Tracked root documentation file within batch scope. |
| MOVE | `READINESS_INTELLIGENCE_DISCOVERY.md` | `docs/03-discovery/READINESS_INTELLIGENCE_DISCOVERY.md` | Tracked root documentation file within batch scope. |
| MOVE | `READINESS_RISKS_AND_BOUNDARIES.txt` | `docs/03-discovery/READINESS_RISKS_AND_BOUNDARIES.txt` | Tracked root documentation file within batch scope. |
| MOVE | `READINESS_SIGNALS_AND_ANTI_SIGNALS.txt` | `docs/03-discovery/READINESS_SIGNALS_AND_ANTI_SIGNALS.txt` | Tracked root documentation file within batch scope. |
| MOVE | `READINESS_VS_POTENTIAL_VS_EXCELLENCE.md` | `docs/03-discovery/READINESS_VS_POTENTIAL_VS_EXCELLENCE.md` | Tracked root documentation file within batch scope. |
| MOVE | `RECRUITMENT_DOMAIN_MODEL.md` | `docs/archive/RECRUITMENT_DOMAIN_MODEL.md` | Tracked root documentation file within batch scope. |
| MOVE | `RECRUITMENT_KNOWLEDGE_BASE.md` | `docs/archive/RECRUITMENT_KNOWLEDGE_BASE.md` | Tracked root documentation file within batch scope. |
| MOVE | `REPORTE_FUENTE_ORIGINAL_EDWIN_IS15.md` | `docs/archive/REPORTE_FUENTE_ORIGINAL_EDWIN_IS15.md` | Tracked root documentation file within batch scope. |
| MOVE | `REPORTE_INTERPRETACION_FORGE_EDWIN_IS15.md` | `docs/archive/REPORTE_INTERPRETACION_FORGE_EDWIN_IS15.md` | Tracked root documentation file within batch scope. |
| MOVE | `REPORTE_VALIDACION_EDWIN_IS15.txt` | `docs/archive/REPORTE_VALIDACION_EDWIN_IS15.txt` | Tracked root documentation file within batch scope. |
| MOVE | `SCHEMA_CATALOG.md` | `docs/archive/SCHEMA_CATALOG.md` | Tracked root documentation file within batch scope. |
| MOVE | `SHARED_POLICY_CURRENCY_TIMELINE_ENGINE_REPORT.txt` | `docs/archive/SHARED_POLICY_CURRENCY_TIMELINE_ENGINE_REPORT.txt` | Tracked root documentation file within batch scope. |
| BLOCKED_UNTRACKED | `forge-full-inventory.txt` | `docs/archive/forge-full-inventory.txt` | Untracked root doc; git mv cannot move it without first changing tracking state. |
| MOVE | `forge-inventory.txt` | `docs/archive/forge-inventory.txt` | Tracked root documentation file within batch scope. |
| MOVE | `imagina-ser-source.txt` | `docs/04-product-intelligence/imagina-ser-source.txt` | Tracked root documentation file within batch scope. |
| MOVE | `orvi-source.txt` | `docs/04-product-intelligence/orvi-source.txt` | Tracked root documentation file within batch scope. |
| MOVE | `segu-beca-quote-ocr.txt` | `docs/04-product-intelligence/segu-beca-quote-ocr.txt` | Tracked root documentation file within batch scope. |
| MOVE | `vida-mujer-knowledge-source.txt` | `docs/04-product-intelligence/vida-mujer-knowledge-source.txt` | Tracked root documentation file within batch scope. |
| MOVE | `vida-mujer-quote-ocr.txt` | `docs/04-product-intelligence/vida-mujer-quote-ocr.txt` | Tracked root documentation file within batch scope. |
