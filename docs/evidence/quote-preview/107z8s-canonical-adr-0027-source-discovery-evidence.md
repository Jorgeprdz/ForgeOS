# 107Z8S — Canonical ADR-0027 source discovery evidence

Status: **HOLD**

## Registry proofs

```json
[
  {
    "registry_path": "docs/06-repository-governance/reports/migration-inventory.json",
    "target_path": "docs/06-repository-governance/reports/migration-inventory.json",
    "link_label": "plain-path",
    "link_target": "docs/06-repository-governance/reports/migration-inventory.json",
    "target_sha256": "79f7272027e35647342b3c0f4dc303f8dd2abeeac01dcd5acaf32517273eaeb5",
    "registry_score": 5,
    "target_score": 5
  },
  {
    "registry_path": "docs/06-repository-governance/reports/migration-inventory.json",
    "target_path": "docs/06-repository-governance/reports/test-output/migration-inventory.json",
    "link_label": "plain-path",
    "link_target": "docs/06-repository-governance/reports/test-output/migration-inventory.json",
    "target_sha256": "0a0ac2ecf645d15b993090b5585f73be1184cd97775de9710e5471cc4f600ef6",
    "registry_score": 5,
    "target_score": 5
  },
  {
    "registry_path": "docs/06-repository-governance/reports/test-output/migration-inventory.json",
    "target_path": "docs/06-repository-governance/reports/migration-inventory.json",
    "link_label": "plain-path",
    "link_target": "docs/06-repository-governance/reports/migration-inventory.json",
    "target_sha256": "79f7272027e35647342b3c0f4dc303f8dd2abeeac01dcd5acaf32517273eaeb5",
    "registry_score": 5,
    "target_score": 5
  },
  {
    "registry_path": "docs/06-repository-governance/reports/test-output/migration-inventory.json",
    "target_path": "docs/06-repository-governance/reports/test-output/migration-inventory.json",
    "link_label": "plain-path",
    "link_target": "docs/06-repository-governance/reports/test-output/migration-inventory.json",
    "target_sha256": "0a0ac2ecf645d15b993090b5585f73be1184cd97775de9710e5471cc4f600ef6",
    "registry_score": 5,
    "target_score": 5
  }
]
```

## Direct eligible candidates

```json
[]
```

## Ranked candidates

### `compensation/partner-manager/partner-payment-cadence-engine.js`

- Score: `65`
- Status: `unknown`
- Reasons: `["exact_or_near_exact_rule_title", "adr_0027_identifier_in_content", "runtime_source_penalty"]`
- Title in text: `true`
- ADR id in text: `true`
- ADR id in path: `false`

- L3: `assertValidPaymentDistributionRulePack,`
- L4: `} from './partner-payment-distribution-rule-pack-validator.js';`
- L7: `GovernanceIdentityMissingError,`
- L8: `createRulePackIdentitySnapshot,`
- L9: `flattenRulePackIdentitySnapshot,`
- L10: `} from '../../governance/rule-pack-identity-snapshot.js';`
- L12: `export const PARTNER_PAYMENT_CADENCE_STATUSES = Object.freeze({`
- L69: `status: 'calculated_candidate',`
- L82: `status: rawConcept.status || 'calculated_candidate',`
- L106: `function isUncertainStatus(status = '') {`
- L107: `const normalized = String(status || '').toLowerCase();`
- L113: `|| normalized.includes('hidden_by_scope');`
- L133: `function pickRulePackMetadata({ rulePackIdentity }) {`
- L134: `const identity = createRulePackIdentitySnapshot({`
- L135: `rulePackIdentity,`
- L136: `calculatedAt: rulePackIdentity?.calculatedAt ?? null,`
- L137: `generatedAt: rulePackIdentity?.generatedAt ?? null,`
- L141: `return flattenRulePackIdentitySnapshot(identity);`
- L155: `if (anchor === 'explicit_payment_month') {`
- L171: `rulePackMetadata,`

### `docs/02-adr-candidates/ADR-0027_COMPENSATION_RULE_PACK_BOUNDARY.md`

- Score: `45`
- Status: `unknown`
- Reasons: `["adr_0027_identifier_in_content", "adr_0027_identifier_in_path"]`
- Title in text: `false`
- ADR id in text: `true`
- ADR id in path: `true`

- L1: `# ADR-0027: Compensation Rule Pack Boundary`
- L3: `## Status`
- L11: `Several compensation rules are variable by official document, carrier, year, contract, product, advisor role, partner career month, compensation plan version, commission statement policy or governance decision.`
- L36: `- Rule packs JSON translate official evidence into executable structured rules.`
- L38: `- Tests prove that engines obey rule packs.`
- L43: `Forge OS will establish a Compensation Rule Pack Boundary.`
- L45: `Any business rule that can change by official document, carrier, year, contract, product, role, compensation manual, commission statement policy or governance decision must live in versioned JSON rule packs.`
- L47: `JavaScript engines must not own variable business rules. Engines must operate as deterministic interpreters that consume rule packs, raw facts and evidence, then produce structured outputs.`
- L62: `- Statement reconciliation engines`
- L65: `## The Rule Pack Boundary`
- L67: `### What belongs in JSON rule packs`
- L69: `Rule packs may contain the executable translation of official evidence.`
- L71: `Rule packs may define:`
- L75: `- rulePackId`
- L76: `- rulePackVersion`
- L85: `- governance status`
- L87: `- rule pack hash once official`
- L132: `Rule packs may define official financial buckets used by engines, such as:`
- L150: `Rule packs may define required evidence for:`
- L163: `- Validate rule pack shape`

### `docs/architecture/source-truth/MANAGER_OS_MESSAGE_GENERATION_PROMPT_BUILDER_SCOPE_027A.md`

- Score: `40`
- Status: `unknown`
- Reasons: `["adr_0027_identifier_in_path", "architecture_path"]`
- Title in text: `false`
- ADR id in text: `false`
- ADR id in path: `true`

- L3: `Status: SCOPED`
- L22: `- Draft is not approved communication.`
- L29: `## Closure State`
- L72: `Legacy Nash is useful as contextual source material only. It is not approved for direct Manager OS runtime execution. It must be wrapped behind a Manager OS message prompt builder boundary before any future message-generation layer consumes it.`
- L130: `- Prompt status.`
- L222: `Status: IMPLEMENTED_AND_CLOSED_FOR_PROMPT_INSTRUCTIONS_ONLY`
- L243: `- 'MANAGER_MESSAGE_PROMPT_BUILDER_BOUNDARY_STATUSES'`
- L246: `- 'MANAGER_MESSAGE_PROMPT_BUILDER_STATUSES'`
- L250: `Implemented statuses:`
- L296: `- 'promptStatus'`
- L330: `DRAFT_IS_NOT_APPROVED_COMMUNICATION=true`

### `docs/roadmap/MANAGER_OS_MESSAGE_GENERATION_PROMPT_BUILDER_SCOPE_027A.md`

- Score: `20`
- Status: `unknown`
- Reasons: `["adr_0027_identifier_in_path"]`
- Title in text: `false`
- ADR id in text: `false`
- ADR id in path: `true`

- L3: `Status: SCOPED`
- L27: `## Locked Status`
- L45: `Draft is not approved communication.`
- L59: `- Explicit false flags for draft, send, task, calendar, LLM runtime, Nash runtime, and downstream truth.`
- L82: `These engines are not approved for direct Manager OS runtime execution. They are prospect/advisor/manager-mixed legacy context and must be boundary-wrapped before any Manager OS message-generation flow can consume them.`
- L120: `- 'promptStatus'`
- L168: `## Final Scope Statement`
- L174: `Status: IMPLEMENTED_AND_CLOSED_FOR_PROMPT_INSTRUCTIONS_ONLY`
- L212: `028A should scope how future LLM draft intake and message safety validation consume Prompt Builder instructions without creating approved communications, sends, tasks, calendar events, or downstream truth.`

### `docs/06-repository-governance/reports/migration-inventory.json`

- Score: `5`
- Status: `unknown`
- Reasons: `["adr_0027_identifier_in_content", "constitution_or_governance", "evidence_or_report_penalty"]`
- Title in text: `false`
- ADR id in text: `true`
- ADR id in path: `false`

- L42: `".forge-backups/.005A101_clean_state_code",`
- L53: `".forge-backups/004G-E-antigravity-rescue-20260622-211328/status-after.txt",`
- L54: `".forge-backups/004G-E-antigravity-rescue-20260622-211328/status-before.txt",`
- L57: `".forge-backups/004G-E-final-activity-evidence-20260622-211654/status-before.txt",`
- L60: `".forge-backups/004G-E-fix-activity-number-helper-20260622-211951/status-before.txt",`
- L68: `".forge-backups/004G-F-1-explainability-discovery-20260622-233247/status.txt",`
- L82: `".forge-backups/004G-F-qualification-explainability-20260622-213820/status-before.txt",`
- L84: `".forge-backups/004G-F-register-explainability-test-20260622-214014/status-before.txt",`
- L85: `".forge-backups/004G-G-1-rule-pack-boundary-20260622-225940/diff-before.patch",`
- L86: `".forge-backups/004G-G-1-rule-pack-boundary-20260622-225940/payment-cadence-engine.before.js",`
- L87: `".forge-backups/004G-G-1-rule-pack-boundary-20260622-225940/payment-cadence-test.before.js",`
- L88: `".forge-backups/004G-G-1-rule-pack-boundary-20260622-225940/status-before.txt",`
- L90: `".forge-backups/004G-G-payment-cadence-engine-20260622-221137/status-before.txt",`
- L95: `".forge-backups/004G-H-monthly-cashflow-engine-20260622-230631/status-before.txt",`
- L98: `".forge-backups/004G-H-monthly-cashflow-engine-20260622-230722/status-before.txt",`
- L102: `".forge-backups/004G-I-identity-patch-20260622-232520/monthly-cashflow-engine.before.js",`
- L103: `".forge-backups/004G-I-identity-patch-20260622-232520/monthly-cashflow-test.before.js",`
- L104: `".forge-backups/004G-I-identity-patch-20260622-232520/payment-cadence-engine.before.js",`
- L105: `".forge-backups/004G-I-identity-patch-20260622-232520/payment-cadence-test.before.js",`
- L106: `".forge-backups/004G-I-identity-patch-20260622-232520/rule-pack-identity-snapshot.before.js",`

### `docs/06-repository-governance/reports/test-output/migration-inventory.json`

- Score: `5`
- Status: `unknown`
- Reasons: `["adr_0027_identifier_in_content", "constitution_or_governance", "evidence_or_report_penalty"]`
- Title in text: `false`
- ADR id in text: `true`
- ADR id in path: `false`

- L42: `".forge-backups/.005A101_clean_state_code",`
- L53: `".forge-backups/004G-E-antigravity-rescue-20260622-211328/status-after.txt",`
- L54: `".forge-backups/004G-E-antigravity-rescue-20260622-211328/status-before.txt",`
- L57: `".forge-backups/004G-E-final-activity-evidence-20260622-211654/status-before.txt",`
- L60: `".forge-backups/004G-E-fix-activity-number-helper-20260622-211951/status-before.txt",`
- L68: `".forge-backups/004G-F-1-explainability-discovery-20260622-233247/status.txt",`
- L82: `".forge-backups/004G-F-qualification-explainability-20260622-213820/status-before.txt",`
- L84: `".forge-backups/004G-F-register-explainability-test-20260622-214014/status-before.txt",`
- L85: `".forge-backups/004G-G-1-rule-pack-boundary-20260622-225940/diff-before.patch",`
- L86: `".forge-backups/004G-G-1-rule-pack-boundary-20260622-225940/payment-cadence-engine.before.js",`
- L87: `".forge-backups/004G-G-1-rule-pack-boundary-20260622-225940/payment-cadence-test.before.js",`
- L88: `".forge-backups/004G-G-1-rule-pack-boundary-20260622-225940/status-before.txt",`
- L90: `".forge-backups/004G-G-payment-cadence-engine-20260622-221137/status-before.txt",`
- L95: `".forge-backups/004G-H-monthly-cashflow-engine-20260622-230631/status-before.txt",`
- L98: `".forge-backups/004G-H-monthly-cashflow-engine-20260622-230722/status-before.txt",`
- L102: `".forge-backups/004G-I-identity-patch-20260622-232520/monthly-cashflow-engine.before.js",`
- L103: `".forge-backups/004G-I-identity-patch-20260622-232520/monthly-cashflow-test.before.js",`
- L104: `".forge-backups/004G-I-identity-patch-20260622-232520/payment-cadence-engine.before.js",`
- L105: `".forge-backups/004G-I-identity-patch-20260622-232520/payment-cadence-test.before.js",`
- L106: `".forge-backups/004G-I-identity-patch-20260622-232520/rule-pack-identity-snapshot.before.js",`

### `docs/evidence/FORGE_QUOTE_PREVIEW_CANDIDATE_REVIEW_PACKET_DRY_RUN_106S.md`

- Score: `-5`
- Status: `unknown`
- Reasons: `["adr_0027_identifier_in_content", "evidence_or_report_penalty"]`
- Title in text: `false`
- ADR id in text: `true`
- ADR id in path: `false`

- L4: `STATUS=PASS`
- L13: `"status": "PASS",`
- L24: `"internalDryRunGuardAccepted": "HUMAN_REVIEW_PACKET_FROM_REDACTED_CANDIDATES_ONLY"`
- L50: `"sectionStatus": "ready_for_human_review",`
- L59: `"sectionStatus": "ready_for_human_review",`
- L68: `"sectionStatus": "ready_for_human_review",`
- L77: `"sectionStatus": "ready_for_human_review",`
- L86: `"sectionStatus": "ready_for_human_review",`
- L95: `"sectionStatus": "ready_for_human_review",`
- L106: `"sectionStatus": "ready_for_human_review",`
- L117: `"status": "found_redacted_placeholder_candidate",`
- L135: `"status": "found_redacted_placeholder_candidate",`
- L153: `"status": "found_redacted_placeholder_candidate",`
- L171: `"status": "found_redacted_placeholder_candidate",`
- L189: `"status": "found_redacted_placeholder_candidate",`
- L207: `"status": "found_redacted_placeholder_candidate",`
- L225: `"status": "found_redacted_placeholder_candidate",`
- L243: `"status": "found_redacted_placeholder_candidate",`
- L261: `"status": "found_redacted_placeholder_candidate",`
- L279: `"status": "found_redacted_placeholder_candidate",`

### `docs/evidence/FORGE_QUOTE_PREVIEW_FIELD_CANDIDATE_EXTRACTION_DRY_RUN_106Q.md`

- Score: `-5`
- Status: `unknown`
- Reasons: `["adr_0027_identifier_in_content", "evidence_or_report_penalty"]`
- Title in text: `false`
- ADR id in text: `true`
- ADR id in path: `false`

- L4: `STATUS=PASS`
- L13: `"status": "PASS",`
- L21: `"internalDryRunGuardAccepted": "REDACTED_FIELD_CANDIDATES_ONLY"`
- L54: `"status": "found_redacted_placeholder_candidate",`
- L86: `"status": "found_redacted_placeholder_candidate",`
- L118: `"status": "found_redacted_placeholder_candidate",`
- L150: `"status": "found_redacted_placeholder_candidate",`
- L182: `"status": "found_redacted_placeholder_candidate",`
- L214: `"status": "found_redacted_placeholder_candidate",`
- L246: `"status": "found_redacted_placeholder_candidate",`
- L278: `"status": "found_redacted_placeholder_candidate",`
- L310: `"status": "found_redacted_placeholder_candidate",`
- L342: `"status": "found_redacted_placeholder_candidate",`
- L374: `"status": "found_redacted_placeholder_candidate",`
- L406: `"status": "found_redacted_placeholder_candidate",`
- L438: `"status": "found_redacted_placeholder_candidate",`
- L470: `"status": "found_redacted_placeholder_candidate",`
- L502: `"status": "found_redacted_placeholder_candidate",`
- L534: `"status": "not_found_in_redacted_anchor_windows",`
- L566: `"status": "found_redacted_placeholder_candidate",`

### `docs/evidence/FORGE_QUOTE_PREVIEW_HUMAN_REVIEW_DECISION_DRY_RUN_106U.md`

- Score: `-5`
- Status: `unknown`
- Reasons: `["adr_0027_identifier_in_content", "evidence_or_report_penalty"]`
- Title in text: `false`
- ADR id in text: `true`
- ADR id in path: `false`

- L4: `STATUS=PASS`
- L13: `"status": "PASS",`
- L23: `"internalDryRunGuardAccepted": "LOCATION_DISPOSITIONS_ONLY_NO_VALUE_APPROVAL"`
- L45: `"sourceCandidateStatus": "found_redacted_placeholder_candidate",`
- L63: `"approvedRealValue": null,`
- L64: `"approvedQuoteTruth": false,`
- L65: `"approvedForUiPopulation": false,`
- L66: `"approvedForPresentationGeneration": false,`
- L87: `"sourceCandidateStatus": "found_redacted_placeholder_candidate",`
- L105: `"approvedRealValue": null,`
- L106: `"approvedQuoteTruth": false,`
- L107: `"approvedForUiPopulation": false,`
- L108: `"approvedForPresentationGeneration": false,`
- L129: `"sourceCandidateStatus": "found_redacted_placeholder_candidate",`
- L147: `"approvedRealValue": null,`
- L148: `"approvedQuoteTruth": false,`
- L149: `"approvedForUiPopulation": false,`
- L150: `"approvedForPresentationGeneration": false,`
- L171: `"sourceCandidateStatus": "found_redacted_placeholder_candidate",`
- L189: `"approvedRealValue": null,`

### `docs/evidence/FORGE_QUOTE_PREVIEW_LOCAL_ONLY_ACTUAL_PDF_LOOKUP_DRY_RUN_107C.md`

- Score: `-5`
- Status: `unknown`
- Reasons: `["adr_0027_identifier_in_content", "evidence_or_report_penalty"]`
- Title in text: `false`
- ADR id in text: `true`
- ADR id in path: `false`

- L4: `STATUS=PASS`
- L13: `"status": "PASS",`
- L22: `"authorizationFrom107AAccepted": true,`
- L23: `"executionGateFrom107BAccepted": true,`
- L65: `"approvedRealValue": null,`
- L66: `"matchStatus": "anchor_window_found_redacted_signals_only",`
- L127: `"approvedRealValue": null,`
- L128: `"matchStatus": "anchor_window_found_redacted_signals_only",`
- L189: `"approvedRealValue": null,`
- L190: `"matchStatus": "anchor_window_found_redacted_signals_only",`
- L251: `"approvedRealValue": null,`
- L252: `"matchStatus": "anchor_window_found_redacted_signals_only",`
- L313: `"approvedRealValue": null,`
- L314: `"matchStatus": "anchor_window_found_redacted_signals_only",`
- L375: `"approvedRealValue": null,`
- L376: `"matchStatus": "anchor_window_found_redacted_signals_only",`
- L437: `"approvedRealValue": null,`
- L438: `"matchStatus": "anchor_window_found_redacted_signals_only",`
- L499: `"approvedRealValue": null,`
- L500: `"matchStatus": "anchor_window_found_redacted_signals_only",`

### `docs/evidence/FORGE_QUOTE_PREVIEW_MANUAL_PDF_LOOKUP_PACKET_DRY_RUN_106X.md`

- Score: `-5`
- Status: `unknown`
- Reasons: `["adr_0027_identifier_in_content", "evidence_or_report_penalty"]`
- Title in text: `false`
- ADR id in text: `true`
- ADR id in path: `false`

- L4: `STATUS=PASS`
- L13: `"status": "PASS",`
- L24: `"internalDryRunGuardAccepted": "MANUAL_LOOKUP_PACKET_ONLY_NO_PDF_ACCESS"`
- L57: `"approvedRealValue": null,`
- L58: `"approvedQuoteTruth": false,`
- L59: `"lookupInstruction": "Later human operator may inspect the original PDF manually only after an explicit future authorization gate.",`
- L60: `"lookupStatus": "prepared_for_future_manual_pdf_lookup",`
- L76: `"futureActualPdfLookupRequiresExplicitGate": true,`
- L90: `"approvedRealValue": null,`
- L91: `"approvedQuoteTruth": false,`
- L92: `"lookupInstruction": "Later human operator may inspect the original PDF manually only after an explicit future authorization gate.",`
- L93: `"lookupStatus": "prepared_for_future_manual_pdf_lookup",`
- L109: `"futureActualPdfLookupRequiresExplicitGate": true,`
- L123: `"approvedRealValue": null,`
- L124: `"approvedQuoteTruth": false,`
- L125: `"lookupInstruction": "Later human operator may inspect the original PDF manually only after an explicit future authorization gate.",`
- L126: `"lookupStatus": "prepared_for_future_manual_pdf_lookup",`
- L142: `"futureActualPdfLookupRequiresExplicitGate": true,`
- L156: `"approvedRealValue": null,`
- L157: `"approvedQuoteTruth": false,`

### `docs/evidence/FORGE_QUOTE_PREVIEW_REDACTED_LOOKUP_RESULT_MAPPING_DRY_RUN_107F.md`

- Score: `-5`
- Status: `unknown`
- Reasons: `["adr_0027_identifier_in_content", "evidence_or_report_penalty"]`
- Title in text: `false`
- ADR id in text: `true`
- ADR id in path: `false`

- L4: `STATUS=PASS`
- L6: `LOCKED_DECISION=REDACTED_LOOKUP_RESULT_MAPPING_DRY_RUN_COMPLETE_WITH_FIELD_CANDIDATE_STATES_NO_VALUES_NO_TRUTH`
- L13: `"status": "PASS",`
- L15: `"lockedDecision": "REDACTED_LOOKUP_RESULT_MAPPING_DRY_RUN_COMPLETE_WITH_FIELD_CANDIDATE_STATES_NO_VALUES_NO_TRUTH",`
- L31: `"fieldCandidateStatesMaterialized": true,`
- L55: `"candidateState": "redacted_signal_candidate_requires_manual_value_later",`
- L56: `"mappingStatus": "mapped_redacted_signals",`
- L100: `"approvedRealValue": null,`
- L102: `"humanValueCaptureStatus": "pending_manual_value_capture_gate",`
- L123: `"candidateState": "redacted_signal_candidate_requires_manual_value_later",`
- L124: `"mappingStatus": "mapped_redacted_signals",`
- L156: `"approvedRealValue": null,`
- L158: `"humanValueCaptureStatus": "pending_manual_value_capture_gate",`
- L179: `"candidateState": "redacted_signal_candidate_requires_manual_value_later",`
- L180: `"mappingStatus": "mapped_redacted_signals",`
- L206: `"approvedRealValue": null,`
- L208: `"humanValueCaptureStatus": "pending_manual_value_capture_gate",`
- L229: `"candidateState": "redacted_signal_candidate_requires_manual_value_later",`
- L230: `"mappingStatus": "mapped_redacted_signals",`
- L256: `"approvedRealValue": null,`

### `docs/evidence/forge-quote-preview-candidate-review-packet-dry-run-106s.json`

- Score: `-5`
- Status: `unknown`
- Reasons: `["adr_0027_identifier_in_content", "evidence_or_report_penalty"]`
- Title in text: `false`
- ADR id in text: `true`
- ADR id in path: `false`

- L3: `"status": "PASS",`
- L14: `"internalDryRunGuardAccepted": "HUMAN_REVIEW_PACKET_FROM_REDACTED_CANDIDATES_ONLY"`
- L40: `"sectionStatus": "ready_for_human_review",`
- L49: `"sectionStatus": "ready_for_human_review",`
- L58: `"sectionStatus": "ready_for_human_review",`
- L67: `"sectionStatus": "ready_for_human_review",`
- L76: `"sectionStatus": "ready_for_human_review",`
- L85: `"sectionStatus": "ready_for_human_review",`
- L96: `"sectionStatus": "ready_for_human_review",`
- L107: `"status": "found_redacted_placeholder_candidate",`
- L125: `"status": "found_redacted_placeholder_candidate",`
- L143: `"status": "found_redacted_placeholder_candidate",`
- L161: `"status": "found_redacted_placeholder_candidate",`
- L179: `"status": "found_redacted_placeholder_candidate",`
- L197: `"status": "found_redacted_placeholder_candidate",`
- L215: `"status": "found_redacted_placeholder_candidate",`
- L233: `"status": "found_redacted_placeholder_candidate",`
- L251: `"status": "found_redacted_placeholder_candidate",`
- L269: `"status": "found_redacted_placeholder_candidate",`
- L287: `"status": "found_redacted_placeholder_candidate",`

### `docs/evidence/forge-quote-preview-candidate-review-packet-dry-run-audit-106s.json`

- Score: `-5`
- Status: `unknown`
- Reasons: `["adr_0027_identifier_in_content", "evidence_or_report_penalty"]`
- Title in text: `false`
- ADR id in text: `true`
- ADR id in path: `false`

- L3: `"status": "PASS",`
- L8: `"internalDryRunGuardAccepted": true,`
- L30: `"status": "PASS",`
- L41: `"internalDryRunGuardAccepted": "HUMAN_REVIEW_PACKET_FROM_REDACTED_CANDIDATES_ONLY"`
- L67: `"sectionStatus": "ready_for_human_review",`
- L76: `"sectionStatus": "ready_for_human_review",`
- L85: `"sectionStatus": "ready_for_human_review",`
- L94: `"sectionStatus": "ready_for_human_review",`
- L103: `"sectionStatus": "ready_for_human_review",`
- L112: `"sectionStatus": "ready_for_human_review",`
- L123: `"sectionStatus": "ready_for_human_review",`
- L134: `"status": "found_redacted_placeholder_candidate",`
- L152: `"status": "found_redacted_placeholder_candidate",`
- L170: `"status": "found_redacted_placeholder_candidate",`
- L188: `"status": "found_redacted_placeholder_candidate",`
- L206: `"status": "found_redacted_placeholder_candidate",`
- L224: `"status": "found_redacted_placeholder_candidate",`
- L242: `"status": "found_redacted_placeholder_candidate",`
- L260: `"status": "found_redacted_placeholder_candidate",`
- L278: `"status": "found_redacted_placeholder_candidate",`

### `docs/evidence/forge-quote-preview-field-candidate-extraction-dry-run-106q.json`

- Score: `-5`
- Status: `unknown`
- Reasons: `["adr_0027_identifier_in_content", "evidence_or_report_penalty"]`
- Title in text: `false`
- ADR id in text: `true`
- ADR id in path: `false`

- L3: `"status": "PASS",`
- L11: `"internalDryRunGuardAccepted": "REDACTED_FIELD_CANDIDATES_ONLY"`
- L44: `"status": "found_redacted_placeholder_candidate",`
- L76: `"status": "found_redacted_placeholder_candidate",`
- L108: `"status": "found_redacted_placeholder_candidate",`
- L140: `"status": "found_redacted_placeholder_candidate",`
- L172: `"status": "found_redacted_placeholder_candidate",`
- L204: `"status": "found_redacted_placeholder_candidate",`
- L236: `"status": "found_redacted_placeholder_candidate",`
- L268: `"status": "found_redacted_placeholder_candidate",`
- L300: `"status": "found_redacted_placeholder_candidate",`
- L332: `"status": "found_redacted_placeholder_candidate",`
- L364: `"status": "found_redacted_placeholder_candidate",`
- L396: `"status": "found_redacted_placeholder_candidate",`
- L428: `"status": "found_redacted_placeholder_candidate",`
- L460: `"status": "found_redacted_placeholder_candidate",`
- L492: `"status": "found_redacted_placeholder_candidate",`
- L524: `"status": "not_found_in_redacted_anchor_windows",`
- L556: `"status": "found_redacted_placeholder_candidate",`
- L588: `"status": "found_redacted_placeholder_candidate",`

### `docs/evidence/forge-quote-preview-field-candidate-extraction-dry-run-audit-106q.json`

- Score: `-5`
- Status: `unknown`
- Reasons: `["adr_0027_identifier_in_content", "evidence_or_report_penalty"]`
- Title in text: `false`
- ADR id in text: `true`
- ADR id in path: `false`

- L3: `"status": "PASS",`
- L8: `"internalDryRunGuardAccepted": true,`
- L30: `"status": "PASS",`
- L38: `"internalDryRunGuardAccepted": "REDACTED_FIELD_CANDIDATES_ONLY"`
- L71: `"status": "found_redacted_placeholder_candidate",`
- L103: `"status": "found_redacted_placeholder_candidate",`
- L135: `"status": "found_redacted_placeholder_candidate",`
- L167: `"status": "found_redacted_placeholder_candidate",`
- L199: `"status": "found_redacted_placeholder_candidate",`
- L231: `"status": "found_redacted_placeholder_candidate",`
- L263: `"status": "found_redacted_placeholder_candidate",`
- L295: `"status": "found_redacted_placeholder_candidate",`
- L327: `"status": "found_redacted_placeholder_candidate",`
- L359: `"status": "found_redacted_placeholder_candidate",`
- L391: `"status": "found_redacted_placeholder_candidate",`
- L423: `"status": "found_redacted_placeholder_candidate",`
- L455: `"status": "found_redacted_placeholder_candidate",`
- L487: `"status": "found_redacted_placeholder_candidate",`
- L519: `"status": "found_redacted_placeholder_candidate",`
- L551: `"status": "not_found_in_redacted_anchor_windows",`

### `docs/evidence/forge-quote-preview-human-review-decision-dry-run-106u.json`

- Score: `-5`
- Status: `unknown`
- Reasons: `["adr_0027_identifier_in_content", "evidence_or_report_penalty"]`
- Title in text: `false`
- ADR id in text: `true`
- ADR id in path: `false`

- L3: `"status": "PASS",`
- L13: `"internalDryRunGuardAccepted": "LOCATION_DISPOSITIONS_ONLY_NO_VALUE_APPROVAL"`
- L35: `"sourceCandidateStatus": "found_redacted_placeholder_candidate",`
- L53: `"approvedRealValue": null,`
- L54: `"approvedQuoteTruth": false,`
- L55: `"approvedForUiPopulation": false,`
- L56: `"approvedForPresentationGeneration": false,`
- L77: `"sourceCandidateStatus": "found_redacted_placeholder_candidate",`
- L95: `"approvedRealValue": null,`
- L96: `"approvedQuoteTruth": false,`
- L97: `"approvedForUiPopulation": false,`
- L98: `"approvedForPresentationGeneration": false,`
- L119: `"sourceCandidateStatus": "found_redacted_placeholder_candidate",`
- L137: `"approvedRealValue": null,`
- L138: `"approvedQuoteTruth": false,`
- L139: `"approvedForUiPopulation": false,`
- L140: `"approvedForPresentationGeneration": false,`
- L161: `"sourceCandidateStatus": "found_redacted_placeholder_candidate",`
- L179: `"approvedRealValue": null,`
- L180: `"approvedQuoteTruth": false,`

### `docs/evidence/forge-quote-preview-human-review-decision-dry-run-audit-106u.json`

- Score: `-5`
- Status: `unknown`
- Reasons: `["adr_0027_identifier_in_content", "evidence_or_report_penalty"]`
- Title in text: `false`
- ADR id in text: `true`
- ADR id in path: `false`

- L3: `"status": "PASS",`
- L8: `"internalDryRunGuardAccepted": true,`
- L34: `"status": "PASS",`
- L44: `"internalDryRunGuardAccepted": "LOCATION_DISPOSITIONS_ONLY_NO_VALUE_APPROVAL"`
- L66: `"sourceCandidateStatus": "found_redacted_placeholder_candidate",`
- L84: `"approvedRealValue": null,`
- L85: `"approvedQuoteTruth": false,`
- L86: `"approvedForUiPopulation": false,`
- L87: `"approvedForPresentationGeneration": false,`
- L108: `"sourceCandidateStatus": "found_redacted_placeholder_candidate",`
- L126: `"approvedRealValue": null,`
- L127: `"approvedQuoteTruth": false,`
- L128: `"approvedForUiPopulation": false,`
- L129: `"approvedForPresentationGeneration": false,`
- L150: `"sourceCandidateStatus": "found_redacted_placeholder_candidate",`
- L168: `"approvedRealValue": null,`
- L169: `"approvedQuoteTruth": false,`
- L170: `"approvedForUiPopulation": false,`
- L171: `"approvedForPresentationGeneration": false,`
- L192: `"sourceCandidateStatus": "found_redacted_placeholder_candidate",`

### `docs/evidence/forge-quote-preview-local-only-actual-pdf-lookup-dry-run-107c.json`

- Score: `-5`
- Status: `unknown`
- Reasons: `["adr_0027_identifier_in_content", "evidence_or_report_penalty"]`
- Title in text: `false`
- ADR id in text: `true`
- ADR id in path: `false`

- L3: `"status": "PASS",`
- L12: `"authorizationFrom107AAccepted": true,`
- L13: `"executionGateFrom107BAccepted": true,`
- L55: `"approvedRealValue": null,`
- L56: `"matchStatus": "anchor_window_found_redacted_signals_only",`
- L117: `"approvedRealValue": null,`
- L118: `"matchStatus": "anchor_window_found_redacted_signals_only",`
- L179: `"approvedRealValue": null,`
- L180: `"matchStatus": "anchor_window_found_redacted_signals_only",`
- L241: `"approvedRealValue": null,`
- L242: `"matchStatus": "anchor_window_found_redacted_signals_only",`
- L303: `"approvedRealValue": null,`
- L304: `"matchStatus": "anchor_window_found_redacted_signals_only",`
- L365: `"approvedRealValue": null,`
- L366: `"matchStatus": "anchor_window_found_redacted_signals_only",`
- L427: `"approvedRealValue": null,`
- L428: `"matchStatus": "anchor_window_found_redacted_signals_only",`
- L489: `"approvedRealValue": null,`
- L490: `"matchStatus": "anchor_window_found_redacted_signals_only",`
- L551: `"approvedRealValue": null,`

### `docs/evidence/forge-quote-preview-local-only-actual-pdf-lookup-dry-run-audit-107c.json`

- Score: `-5`
- Status: `unknown`
- Reasons: `["adr_0027_identifier_in_content", "evidence_or_report_penalty"]`
- Title in text: `false`
- ADR id in text: `true`
- ADR id in path: `false`

- L3: `"status": "PASS",`
- L7: `"authorizationFrom107AAccepted": true,`
- L8: `"executionGateFrom107BAccepted": true,`
- L36: `"status": "PASS",`
- L45: `"authorizationFrom107AAccepted": true,`
- L46: `"executionGateFrom107BAccepted": true,`
- L88: `"approvedRealValue": null,`
- L89: `"matchStatus": "anchor_window_found_redacted_signals_only",`
- L150: `"approvedRealValue": null,`
- L151: `"matchStatus": "anchor_window_found_redacted_signals_only",`
- L212: `"approvedRealValue": null,`
- L213: `"matchStatus": "anchor_window_found_redacted_signals_only",`
- L274: `"approvedRealValue": null,`
- L275: `"matchStatus": "anchor_window_found_redacted_signals_only",`
- L336: `"approvedRealValue": null,`
- L337: `"matchStatus": "anchor_window_found_redacted_signals_only",`
- L398: `"approvedRealValue": null,`
- L399: `"matchStatus": "anchor_window_found_redacted_signals_only",`
- L460: `"approvedRealValue": null,`
- L461: `"matchStatus": "anchor_window_found_redacted_signals_only",`

### `docs/evidence/forge-quote-preview-manual-pdf-lookup-packet-dry-run-106x.json`

- Score: `-5`
- Status: `unknown`
- Reasons: `["adr_0027_identifier_in_content", "evidence_or_report_penalty"]`
- Title in text: `false`
- ADR id in text: `true`
- ADR id in path: `false`

- L3: `"status": "PASS",`
- L14: `"internalDryRunGuardAccepted": "MANUAL_LOOKUP_PACKET_ONLY_NO_PDF_ACCESS"`
- L47: `"approvedRealValue": null,`
- L48: `"approvedQuoteTruth": false,`
- L49: `"lookupInstruction": "Later human operator may inspect the original PDF manually only after an explicit future authorization gate.",`
- L50: `"lookupStatus": "prepared_for_future_manual_pdf_lookup",`
- L66: `"futureActualPdfLookupRequiresExplicitGate": true,`
- L80: `"approvedRealValue": null,`
- L81: `"approvedQuoteTruth": false,`
- L82: `"lookupInstruction": "Later human operator may inspect the original PDF manually only after an explicit future authorization gate.",`
- L83: `"lookupStatus": "prepared_for_future_manual_pdf_lookup",`
- L99: `"futureActualPdfLookupRequiresExplicitGate": true,`
- L113: `"approvedRealValue": null,`
- L114: `"approvedQuoteTruth": false,`
- L115: `"lookupInstruction": "Later human operator may inspect the original PDF manually only after an explicit future authorization gate.",`
- L116: `"lookupStatus": "prepared_for_future_manual_pdf_lookup",`
- L132: `"futureActualPdfLookupRequiresExplicitGate": true,`
- L146: `"approvedRealValue": null,`
- L147: `"approvedQuoteTruth": false,`
- L148: `"lookupInstruction": "Later human operator may inspect the original PDF manually only after an explicit future authorization gate.",`

### `docs/evidence/forge-quote-preview-manual-pdf-lookup-packet-dry-run-audit-106x.json`

- Score: `-5`
- Status: `unknown`
- Reasons: `["adr_0027_identifier_in_content", "evidence_or_report_penalty"]`
- Title in text: `false`
- ADR id in text: `true`
- ADR id in path: `false`

- L3: `"status": "PASS",`
- L26: `"futureActualPdfLookupRequiresExplicitGate": true,`
- L34: `"status": "PASS",`
- L45: `"internalDryRunGuardAccepted": "MANUAL_LOOKUP_PACKET_ONLY_NO_PDF_ACCESS"`
- L78: `"approvedRealValue": null,`
- L79: `"approvedQuoteTruth": false,`
- L80: `"lookupInstruction": "Later human operator may inspect the original PDF manually only after an explicit future authorization gate.",`
- L81: `"lookupStatus": "prepared_for_future_manual_pdf_lookup",`
- L97: `"futureActualPdfLookupRequiresExplicitGate": true,`
- L111: `"approvedRealValue": null,`
- L112: `"approvedQuoteTruth": false,`
- L113: `"lookupInstruction": "Later human operator may inspect the original PDF manually only after an explicit future authorization gate.",`
- L114: `"lookupStatus": "prepared_for_future_manual_pdf_lookup",`
- L130: `"futureActualPdfLookupRequiresExplicitGate": true,`
- L144: `"approvedRealValue": null,`
- L145: `"approvedQuoteTruth": false,`
- L146: `"lookupInstruction": "Later human operator may inspect the original PDF manually only after an explicit future authorization gate.",`
- L147: `"lookupStatus": "prepared_for_future_manual_pdf_lookup",`
- L163: `"futureActualPdfLookupRequiresExplicitGate": true,`
- L177: `"approvedRealValue": null,`

### `docs/evidence/forge-quote-preview-redacted-lookup-result-mapping-dry-run-107f.json`

- Score: `-5`
- Status: `unknown`
- Reasons: `["adr_0027_identifier_in_content", "evidence_or_report_penalty"]`
- Title in text: `false`
- ADR id in text: `true`
- ADR id in path: `false`

- L3: `"status": "PASS",`
- L5: `"lockedDecision": "REDACTED_LOOKUP_RESULT_MAPPING_DRY_RUN_COMPLETE_WITH_FIELD_CANDIDATE_STATES_NO_VALUES_NO_TRUTH",`
- L21: `"fieldCandidateStatesMaterialized": true,`
- L45: `"candidateState": "redacted_signal_candidate_requires_manual_value_later",`
- L46: `"mappingStatus": "mapped_redacted_signals",`
- L90: `"approvedRealValue": null,`
- L92: `"humanValueCaptureStatus": "pending_manual_value_capture_gate",`
- L113: `"candidateState": "redacted_signal_candidate_requires_manual_value_later",`
- L114: `"mappingStatus": "mapped_redacted_signals",`
- L146: `"approvedRealValue": null,`
- L148: `"humanValueCaptureStatus": "pending_manual_value_capture_gate",`
- L169: `"candidateState": "redacted_signal_candidate_requires_manual_value_later",`
- L170: `"mappingStatus": "mapped_redacted_signals",`
- L196: `"approvedRealValue": null,`
- L198: `"humanValueCaptureStatus": "pending_manual_value_capture_gate",`
- L219: `"candidateState": "redacted_signal_candidate_requires_manual_value_later",`
- L220: `"mappingStatus": "mapped_redacted_signals",`
- L246: `"approvedRealValue": null,`
- L248: `"humanValueCaptureStatus": "pending_manual_value_capture_gate",`
- L269: `"candidateState": "redacted_signal_candidate_requires_manual_value_later",`

### `docs/evidence/forge-quote-preview-redacted-lookup-result-mapping-dry-run-audit-107f.json`

- Score: `-5`
- Status: `unknown`
- Reasons: `["adr_0027_identifier_in_content", "evidence_or_report_penalty"]`
- Title in text: `false`
- ADR id in text: `true`
- ADR id in path: `false`

- L3: `"status": "PASS",`
- L5: `"lockedDecision": "REDACTED_LOOKUP_RESULT_MAPPING_DRY_RUN_COMPLETE_WITH_FIELD_CANDIDATE_STATES_NO_VALUES_NO_TRUTH",`
- L9: `"fieldCandidateStatesMaterialized": true,`
- L33: `"status": "PASS",`
- L35: `"lockedDecision": "REDACTED_LOOKUP_RESULT_MAPPING_DRY_RUN_COMPLETE_WITH_FIELD_CANDIDATE_STATES_NO_VALUES_NO_TRUTH",`
- L51: `"fieldCandidateStatesMaterialized": true,`
- L75: `"candidateState": "redacted_signal_candidate_requires_manual_value_later",`
- L76: `"mappingStatus": "mapped_redacted_signals",`
- L120: `"approvedRealValue": null,`
- L122: `"humanValueCaptureStatus": "pending_manual_value_capture_gate",`
- L143: `"candidateState": "redacted_signal_candidate_requires_manual_value_later",`
- L144: `"mappingStatus": "mapped_redacted_signals",`
- L176: `"approvedRealValue": null,`
- L178: `"humanValueCaptureStatus": "pending_manual_value_capture_gate",`
- L199: `"candidateState": "redacted_signal_candidate_requires_manual_value_later",`
- L200: `"mappingStatus": "mapped_redacted_signals",`
- L226: `"approvedRealValue": null,`
- L228: `"humanValueCaptureStatus": "pending_manual_value_capture_gate",`
- L249: `"candidateState": "redacted_signal_candidate_requires_manual_value_later",`
- L250: `"mappingStatus": "mapped_redacted_signals",`

### `docs/evidence/MANAGER_OS_MESSAGE_GENERATION_PROMPT_BUILDER_CLOSURE_CERTIFICATE_027C.md`

- Score: `-10`
- Status: `unknown`
- Reasons: `["adr_0027_identifier_in_path", "evidence_or_report_penalty"]`
- Title in text: `false`
- ADR id in text: `false`
- ADR id in path: `true`

- L3: `Status: CLOSED`
- L40: `- Draft is not approved communication.`
- L80: `DRAFT_IS_NOT_APPROVED_COMMUNICATION=true`

## Final discovery result

```json
{
  "OUTCOME": "ADR_0027_MULTIPLE_CANONICAL_CANDIDATES",
  "CANONICAL_SOURCE_PROVEN": false,
  "CANONICAL_SOURCE_PATH": "",
  "PROOF_MODE": "",
  "CANONICAL_SOURCE_AMBIGUOUS": true,
  "CANDIDATE_COUNT": 25,
  "DIRECT_ELIGIBLE_COUNT": 0,
  "REGISTRY_PROOF_COUNT": 4,
  "ADR_ALREADY_CONTAINS_REQUIRED_RULE": true,
  "NEXT_GATE": "107Z8S1_ADR_0027_CANONICAL_SOURCE_DISAMBIGUATION_GATE"
}
```

## Safety receipt

```json
{
  "NEW_ENGINE_CREATED": false,
  "NEW_CACHE_CREATED": false,
  "DUPLICATE_BRIDGE_CREATED": false,
  "PDF_READ_EXECUTED": false,
  "PARSER_EXECUTED": false,
  "OCR_EXECUTED": false,
  "SOURCE_UI_CHANGED": false,
  "QUOTE_TRUTH_ALLOWED": false,
  "REAL_ENGINE_EXECUTION": false,
  "BACKEND_CONNECTION": false,
  "TEST_EXECUTION": false
}
```
