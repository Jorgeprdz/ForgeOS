#!/usr/bin/env bash
set -euo pipefail

CHAIN="087ABCD_QUOTE_PREVIEW_SAFE_UX_COMPONENT_CONTRACT_FAST_TRACK"
REPO="${REPO:-/storage/emulated/0/Forge OS}"
STAMP="$(date +%Y%m%d_%H%M%S)"
REPORT="/data/data/com.termux/files/home/${CHAIN}_RESULT_${STAMP}.md"
BACKUP_DIR=".forge-backups/087abcd-safe-ux-component-contract-fast-track-${STAMP}"
SCRIPT_IN_REPO="tools/termux/forge_087abcd_quote_preview_safe_ux_component_contract_fast_track.sh"

PHASE_A="087A_QUOTE_PREVIEW_SAFE_UX_COMPONENT_CONTRACT_SCOPE"
DECISION_A="PASS_087A_QUOTE_PREVIEW_SAFE_UX_COMPONENT_CONTRACT_SCOPE"
LOCKED_A="QUOTE_PREVIEW_SAFE_UX_COMPONENT_CONTRACT_SCOPED"

PHASE_B="087B_QUOTE_PREVIEW_SAFE_UX_COMPONENT_CONTRACT_IMPLEMENTATION"
DECISION_B="PASS_087B_QUOTE_PREVIEW_SAFE_UX_COMPONENT_CONTRACT_IMPLEMENTATION"
LOCKED_B="QUOTE_PREVIEW_SAFE_UX_COMPONENT_CONTRACT_LOCAL_STATIC_READ_ONLY_IMPLEMENTED"

PHASE_C="087C_QUOTE_PREVIEW_SAFE_UX_COMPONENT_CONTRACT_QA_LOCK"
DECISION_C="PASS_087C_QUOTE_PREVIEW_SAFE_UX_COMPONENT_CONTRACT_QA_LOCK"
LOCKED_C="QUOTE_PREVIEW_SAFE_UX_COMPONENT_CONTRACT_QA_LOCKED"

PHASE_D="087D_QUOTE_PREVIEW_SAFE_UX_COMPONENT_CONTRACT_DECISION_LOCK"
DECISION_D="PASS_087D_QUOTE_PREVIEW_SAFE_UX_COMPONENT_CONTRACT_DECISION_LOCK"
LOCKED_D="QUOTE_PREVIEW_SAFE_UX_COMPONENT_CONTRACT_LOCKED_AS_LOCAL_STATIC_READ_ONLY_REFERENCE_REGISTRY"
NEXT_AFTER_D="088A_QUOTE_PREVIEW_SAFE_SCREEN_COMPOSITION_SCOPE"

BOUNDARY="no UI mutation; no component rendering; no backend real; no CRM/policy/quote/pipeline writes; no task/calendar/message; no provider execution with effects; no auth/secrets/browser persistence; no real engine execution; no parser/calculator/Banxico/PDF/OCR execution; no PDF file read; no hash computation over PDFs; no expected-value verification; no parser invocation; no deterministic calculation; no quote truth creation; no quote issuance; no quote send; no invented product/premium/coverage/projection/quote truth; no new extractor/parser/calculator; no real test execution"

READINESS_ADAPTER="platform/adapters/quote-preview/quote-preview-pdf-engine-canonical-execution-readiness-review-matrix-adapter-080b.js"
READINESS_TEST="tests/quote-preview-pdf-engine-canonical-execution-readiness-review-matrix-adapter-080b-test.js"
BOUNDARY_ADAPTER="platform/adapters/quote-preview/quote-preview-pdf-engine-preview-vs-quote-truth-boundary-registry-adapter-085b.js"
BOUNDARY_TEST="tests/quote-preview-pdf-engine-preview-vs-quote-truth-boundary-registry-adapter-085b-test.js"
UX_STATE_ADAPTER="platform/adapters/quote-preview/quote-preview-safe-ux-state-model-registry-adapter-086b.js"
UX_STATE_TEST="tests/quote-preview-safe-ux-state-model-registry-adapter-086b-test.js"

ADAPTER="platform/adapters/quote-preview/quote-preview-safe-ux-component-contract-registry-adapter-087b.js"
TEST="tests/quote-preview-safe-ux-component-contract-registry-adapter-087b-test.js"

ARCH_DOC_A="docs/architecture/source-truth/FORGE_QUOTE_PREVIEW_SAFE_UX_COMPONENT_CONTRACT_SCOPE_087A.md"
EVIDENCE_DOC_A="docs/evidence/FORGE_QUOTE_PREVIEW_SAFE_UX_COMPONENT_CONTRACT_SCOPE_087A.md"
CERT_DOC_A="docs/evidence/FORGE_QUOTE_PREVIEW_SAFE_UX_COMPONENT_CONTRACT_SCOPE_CERTIFICATE_087A.md"
AUDIT_JSON_A="docs/evidence/forge-quote-preview-safe-ux-component-contract-scope-audit-087a.json"

ARCH_DOC_B="docs/architecture/source-truth/FORGE_QUOTE_PREVIEW_SAFE_UX_COMPONENT_CONTRACT_IMPLEMENTATION_087B.md"
EVIDENCE_DOC_B="docs/evidence/FORGE_QUOTE_PREVIEW_SAFE_UX_COMPONENT_CONTRACT_IMPLEMENTATION_087B.md"
CERT_DOC_B="docs/evidence/FORGE_QUOTE_PREVIEW_SAFE_UX_COMPONENT_CONTRACT_IMPLEMENTATION_CERTIFICATE_087B.md"
AUDIT_JSON_B="docs/evidence/forge-quote-preview-safe-ux-component-contract-implementation-audit-087b.json"

ARCH_DOC_C="docs/architecture/source-truth/FORGE_QUOTE_PREVIEW_SAFE_UX_COMPONENT_CONTRACT_QA_LOCK_087C.md"
EVIDENCE_DOC_C="docs/evidence/FORGE_QUOTE_PREVIEW_SAFE_UX_COMPONENT_CONTRACT_QA_LOCK_087C.md"
CERT_DOC_C="docs/evidence/FORGE_QUOTE_PREVIEW_SAFE_UX_COMPONENT_CONTRACT_QA_LOCK_CERTIFICATE_087C.md"
AUDIT_JSON_C="docs/evidence/forge-quote-preview-safe-ux-component-contract-qa-audit-087c.json"

ARCH_DOC_D="docs/architecture/source-truth/FORGE_QUOTE_PREVIEW_SAFE_UX_COMPONENT_CONTRACT_DECISION_LOCK_087D.md"
EVIDENCE_DOC_D="docs/evidence/FORGE_QUOTE_PREVIEW_SAFE_UX_COMPONENT_CONTRACT_DECISION_LOCK_087D.md"
CERT_DOC_D="docs/evidence/FORGE_QUOTE_PREVIEW_SAFE_UX_COMPONENT_CONTRACT_DECISION_LOCK_CERTIFICATE_087D.md"
AUDIT_JSON_D="docs/evidence/forge-quote-preview-safe-ux-component-contract-decision-audit-087d.json"

CYAN="\033[1;36m"; GREEN="\033[1;38;5;46m"; YELLOW="\033[1;93m"; RED="\033[1;91m"; RESET="\033[0m"
stage(){ printf "\n${CYAN}========== %s ==========${RESET}\n" "$1"; }
pass(){ printf "${GREEN}PASS:${RESET} %s\n" "$1"; }
warn(){ printf "${YELLOW}WARN:${RESET} %s\n" "$1"; }
fail(){ printf "${RED}HOLD:${RESET} %s\n" "$1"; echo "DECISION=HOLD_${CHAIN}" | tee -a "$REPORT"; echo "REPORT=$REPORT" | tee -a "$REPORT"; exit 1; }
run(){ echo; echo "========== RUN =========="; printf '%q ' "$@"; echo; "$@"; }

find_latest_discovery_json(){
  if [ -n "${DISCOVERY_JSON:-}" ] && [ -f "$DISCOVERY_JSON" ]; then printf "%s\n" "$DISCOVERY_JSON"; return 0; fi
  find /data/data/com.termux/files/home -path "*/forge-discovery-*/*DISCOVERY_077A_PRECHECK_EXISTING_QUOTE_PDF_TESTS_AND_ENGINES_REPORT_*.json" -type f 2>/dev/null | sort | tail -1
}

replace_or_append_block(){
  local path="$1"; local phase="$2"; local block_file="$3"
  python3 - <<PY "$path" "$phase" "$block_file"
from pathlib import Path
import sys
path = Path(sys.argv[1]); phase = sys.argv[2]; block = Path(sys.argv[3]).read_text()
text = path.read_text()
start = f"<!-- FORGE:{phase}:START -->"; end = f"<!-- FORGE:{phase}:END -->"
if start in text and end in text:
    before = text.split(start)[0]; after = text.split(end, 1)[1]
    text = before.rstrip() + "\n\n" + block.strip() + "\n" + after
else:
    text = text.rstrip() + "\n\n" + block.strip() + "\n"
path.write_text(text.rstrip() + "\n")
PY
}

trim_tree_files(){
  python3 - <<'PYTRIM'
from pathlib import Path
for path in [Path("FORGE_MASTER_BUILD_TREE.md"), Path("docs/architecture/source-truth/FORGE_UNIFIED_BUILD_TREE_001.md"), Path("docs/roadmap/FORGE_ROADMAP_LOCK_001.md")]:
    path.write_text(path.read_text().rstrip() + "\n")
    print(f"trimmed EOF blanks: {path}")
PYTRIM
}

safety_scan(){
  local files=("$@")
  if rg -n 'localStorage|sessionStorage|fetch\(|XMLHttpRequest|navigator\.mediaDevices|SpeechRecognition|providerRuntimeEnabled:\s*true|networkCallsAllowed:\s*true|browserStorageEnabled:\s*true|mayCreateTruth:\s*true|maySendMessage:\s*true|mayWriteCrm:\s*true|mayCreateCalendarEvent:\s*true|renderAllowed\s*:\s*true|uiMutationAllowed\s*:\s*true|writeAllowed\s*:\s*true|quoteTruthAllowed\s*:\s*true|providerRuntimeAllowed\s*:\s*true|backendConnectionAllowed\s*:\s*true' "${files[@]}"; then
    fail "safety scan found prohibited runtime/browser/network/write/ui marker"
  fi
  if rg -n '"?(crmWrite|pipelineWrite|policyWrite|quoteWrite|taskCreate|calendarCreate|messageSend|authReal|providerRuntime|secretAccess|browserPersistence|realEngineExecution|realEffectsAllowed|realEffectsEnabled|backendConnection|pdfRead|ocrExecution|parserExecution|calculatorExecution|banxicoCall|testExecution)"?\s*[:=]\s*true\b' "${files[@]}"; then
    fail "real-effect flag true found"
  fi
  pass "safety scan clean"
}

commit_allowed_subset(){
  local msg="$1"; shift; local allowed=("$@")
  git add "${allowed[@]}"
  run git diff --cached --name-only
  run git diff --cached --check
  local allowed_file staged_file unexpected
  allowed_file="$(mktemp)"; staged_file="$(mktemp)"
  printf "%s\n" "${allowed[@]}" | sort > "$allowed_file"
  git diff --cached --name-only | sort > "$staged_file"
  unexpected="$(comm -23 "$staged_file" "$allowed_file" || true)"
  if [ -n "$unexpected" ]; then echo "$unexpected"; fail "staged files include files outside authorized boundary"; fi
  if [ ! -s "$staged_file" ]; then fail "no staged changes for commit"; fi
  pass "staged files are within authorized boundary"
  run git commit -m "$msg"
  run git push origin HEAD:main
}

mkdir -p "$(dirname "$REPORT")"
touch "$REPORT"
exec > >(tee -a "$REPORT") 2>&1

stage "STAGE 0 HEADER"
echo "CHAIN=$CHAIN"
echo "BOUNDARY=$BOUNDARY"
echo "REPORT=$REPORT"
echo "ROBOCOP_GATE=Article 0; 086D safe UX state model closed; component contracts only"

cd "$REPO" || fail "No existe repo: $REPO"

stage "STAGE 1 CHECKPOINT"
run git status --short --branch
run git log --oneline -15
run git diff --name-status
run git diff --cached --name-status

stage "STAGE 2 CLEAN INDEX ONLY"
run git reset

stage "STAGE 3 CONFIRM BASE 086D"
if git log --oneline -200 | grep -Eq "086D|safe ux state model decision|QUOTE_PREVIEW_SAFE_UX_STATE_MODEL_LOCKED_AS_LOCAL_STATIC_READ_ONLY_REFERENCE_REGISTRY"; then
  pass "086D base found in git log"
elif [ -f "docs/evidence/forge-quote-preview-safe-ux-state-model-decision-audit-086d.json" ]; then
  pass "086D audit fallback found"
else
  fail "086D base not found. Run 086A/B/C/D first."
fi

if [ -f "docs/evidence/forge-quote-preview-safe-ux-state-model-decision-audit-086d.json" ]; then
  run python3 -m json.tool docs/evidence/forge-quote-preview-safe-ux-state-model-decision-audit-086d.json
  if ! rg -n '"status"\s*:\s*"PASS"|"lockedDecision"\s*:\s*"QUOTE_PREVIEW_SAFE_UX_STATE_MODEL_LOCKED_AS_LOCAL_STATIC_READ_ONLY_REFERENCE_REGISTRY"|"next"\s*:\s*"087A_QUOTE_PREVIEW_SAFE_UX_COMPONENT_CONTRACT_SCOPE"' docs/evidence/forge-quote-preview-safe-ux-state-model-decision-audit-086d.json >/dev/null; then
    fail "086D audit exists but does not confirm PASS/087A next"
  fi
  pass "086D audit PASS/087A next confirmed"
fi

stage "STAGE 4 DISCOVERY EVIDENCE"
DISCOVERY_JSON_FOUND="$(find_latest_discovery_json || true)"
[ -n "$DISCOVERY_JSON_FOUND" ] && [ -f "$DISCOVERY_JSON_FOUND" ] || fail "Discovery JSON not found"

DISCOVERY_DIGEST_JSON="$(mktemp)"
python3 - <<'PY' "$DISCOVERY_JSON_FOUND" "$DISCOVERY_DIGEST_JSON"
import json, sys
from pathlib import Path
source = Path(sys.argv[1]); target = Path(sys.argv[2])
data = json.loads(source.read_text()); rec = data.get("recommendation", {})
if rec.get("do_not_create_new_pdf_extractor") is not True:
    raise SystemExit("Discovery does not block new extractor creation")
digest = {
  "discoveryJson": str(source),
  "counts": data.get("counts", {}),
  "knownSurfacesPresent": data.get("known_surfaces_present", []),
  "realQuoteTestCandidateFiles": data.get("real_quote_test_candidate_files", []),
  "recommendation": rec,
  "artifacts": data.get("artifacts", {}),
}
target.write_text(json.dumps(digest, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
print("DISCOVERY_DIGEST_VALID")
print(target.read_text())
PY

stage "STAGE 5 REQUIRED FILES"
REQUIRED_FILES=(
  "FORGE_MASTER_BUILD_TREE.md"
  "docs/architecture/source-truth/FORGE_UNIFIED_BUILD_TREE_001.md"
  "docs/roadmap/FORGE_ROADMAP_LOCK_001.md"
  "$READINESS_ADAPTER" "$READINESS_TEST"
  "$BOUNDARY_ADAPTER" "$BOUNDARY_TEST"
  "$UX_STATE_ADAPTER" "$UX_STATE_TEST"
)
for f in "${REQUIRED_FILES[@]}"; do [ -f "$f" ] || fail "Missing required file: $f"; pass "$f"; done

stage "STAGE 6 BACKUP"
mkdir -p "$BACKUP_DIR"
cp FORGE_MASTER_BUILD_TREE.md "$BACKUP_DIR/FORGE_MASTER_BUILD_TREE.md"
cp docs/architecture/source-truth/FORGE_UNIFIED_BUILD_TREE_001.md "$BACKUP_DIR/FORGE_UNIFIED_BUILD_TREE_001.md"
cp docs/roadmap/FORGE_ROADMAP_LOCK_001.md "$BACKUP_DIR/FORGE_ROADMAP_LOCK_001.md"
pass "$BACKUP_DIR"

stage "STAGE 7 BASE VALIDATION"
run node --check "$READINESS_ADAPTER"; run node "$READINESS_TEST"
run node --check "$BOUNDARY_ADAPTER"; run node "$BOUNDARY_TEST"
run node --check "$UX_STATE_ADAPTER"; run node "$UX_STATE_TEST"

# -------------------------------------------------------------------
# 087A SCOPE
# -------------------------------------------------------------------
stage "087A BUILD SCOPE"
COMPONENT_SCOPE_JSON="$(mktemp)"
node <<'NODE' > "$COMPONENT_SCOPE_JSON"
const ux = require('./platform/adapters/quote-preview/quote-preview-safe-ux-state-model-registry-adapter-086b.js');
const boundary = require('./platform/adapters/quote-preview/quote-preview-pdf-engine-preview-vs-quote-truth-boundary-registry-adapter-085b.js');

const uxCatalog = ux.getQuotePreviewSafeUxStateModelRegistryCatalog();
const boundaryCatalog = boundary.getQuotePreviewPdfEnginePreviewVsQuoteTruthBoundaryRegistryCatalog();

const components = [
  {
    component_id: 'quote_preview_shell',
    component_name: 'QuotePreviewShell',
    component_kind: 'layout_container_contract',
    responsibility: 'Owns read-only composition slots and passes safe UX state to children.',
    consumes_state_ids: uxCatalog.states.map((state) => state.state_id),
    required_props: ['state_id', 'badges', 'safe_actions', 'blocked_actions'],
    allowed_actions: ['view_empty_state', 'view_reference_preview', 'open_evidence_panel', 'open_provenance_panel', 'request_human_review'],
    blocked_actions: ['issue_quote', 'send_quote', 'write_quote', 'write_crm', 'write_policy', 'write_pipeline', 'connect_provider', 'connect_backend', 'run_parser', 'run_calculator', 'call_banxico', 'read_pdf'],
    render_allowed: false,
    ui_mutation_allowed: false,
    quote_truth_allowed: false,
    execution_allowed: false,
    write_allowed: false
  },
  {
    component_id: 'quote_preview_status_card',
    component_name: 'QuotePreviewStatusCard',
    component_kind: 'status_card_contract',
    responsibility: 'Shows current state label, description, severity and required preview/not-quote badges.',
    consumes_state_ids: uxCatalog.states.map((state) => state.state_id),
    required_props: ['display_label', 'description', 'state_kind', 'required_badges'],
    allowed_actions: ['view_reference_preview'],
    blocked_actions: ['issue_quote', 'send_quote', 'write_quote'],
    render_allowed: false,
    ui_mutation_allowed: false,
    quote_truth_allowed: false,
    execution_allowed: false,
    write_allowed: false
  },
  {
    component_id: 'quote_preview_evidence_panel',
    component_name: 'QuotePreviewEvidencePanel',
    component_kind: 'evidence_panel_contract',
    responsibility: 'Shows evidence/provenance references without reading PDFs or executing parsers.',
    consumes_state_ids: ['pdf_candidate_detected', 'file_hash_not_verified', 'source_trace_not_bound', 'preview_reference_available', 'ready_for_human_review'],
    required_props: ['evidence_refs', 'provenance_refs', 'source_trace_status', 'verification_status'],
    allowed_actions: ['open_evidence_panel', 'open_provenance_panel'],
    blocked_actions: ['read_pdf', 'run_parser', 'run_calculator', 'call_banxico'],
    render_allowed: false,
    ui_mutation_allowed: false,
    quote_truth_allowed: false,
    execution_allowed: false,
    write_allowed: false
  },
  {
    component_id: 'quote_preview_warning_stack',
    component_name: 'QuotePreviewWarningStack',
    component_kind: 'warning_stack_contract',
    responsibility: 'Displays blocking/warning reasons in priority order.',
    consumes_state_ids: ['file_hash_not_verified', 'source_trace_not_bound', 'parser_owner_decision_required', 'deterministic_inputs_not_verified', 'quote_truth_blocked'],
    required_props: ['safe_errors', 'blocked_actions', 'required_badges'],
    allowed_actions: ['open_evidence_panel', 'open_provenance_panel'],
    blocked_actions: ['issue_quote', 'send_quote', 'write_quote', 'connect_backend'],
    render_allowed: false,
    ui_mutation_allowed: false,
    quote_truth_allowed: false,
    execution_allowed: false,
    write_allowed: false
  },
  {
    component_id: 'quote_preview_value_table',
    component_name: 'QuotePreviewValueTable',
    component_kind: 'read_only_value_table_contract',
    responsibility: 'Shows preview/reference values only when labeled as not verified and not quote.',
    consumes_state_ids: ['preview_reference_available', 'ready_for_human_review', 'deterministic_inputs_not_verified', 'source_trace_not_bound'],
    required_props: ['rows', 'source_trace_status', 'verification_status', 'required_badges'],
    allowed_actions: ['view_reference_preview', 'copy_preview_reference_summary'],
    blocked_actions: ['write_quote', 'issue_quote', 'send_quote', 'run_calculator'],
    render_allowed: false,
    ui_mutation_allowed: false,
    quote_truth_allowed: false,
    execution_allowed: false,
    write_allowed: false
  },
  {
    component_id: 'quote_preview_action_bar',
    component_name: 'QuotePreviewActionBar',
    component_kind: 'safe_action_contract',
    responsibility: 'Exposes only safe read/review actions and blocks quote/provider/write actions.',
    consumes_state_ids: uxCatalog.states.map((state) => state.state_id),
    required_props: ['allowed_actions', 'blocked_actions'],
    allowed_actions: ['view_reference_preview', 'open_evidence_panel', 'open_provenance_panel', 'request_human_review', 'copy_preview_reference_summary'],
    blocked_actions: ['issue_quote', 'send_quote', 'write_quote', 'write_crm', 'write_policy', 'write_pipeline', 'connect_provider', 'connect_backend'],
    render_allowed: false,
    ui_mutation_allowed: false,
    quote_truth_allowed: false,
    execution_allowed: false,
    write_allowed: false
  },
  {
    component_id: 'quote_preview_human_review_card',
    component_name: 'QuotePreviewHumanReviewCard',
    component_kind: 'human_review_contract',
    responsibility: 'Explains why human review is required and exposes review request as a non-effect action.',
    consumes_state_ids: ['ready_for_human_review', 'parser_owner_decision_required', 'quote_truth_blocked'],
    required_props: ['review_reason', 'safe_errors', 'required_badges'],
    allowed_actions: ['request_human_review', 'open_evidence_panel'],
    blocked_actions: ['issue_quote', 'send_quote', 'write_quote', 'connect_provider', 'connect_backend'],
    render_allowed: false,
    ui_mutation_allowed: false,
    quote_truth_allowed: false,
    execution_allowed: false,
    write_allowed: false
  },
  {
    component_id: 'quote_preview_badges_bar',
    component_name: 'QuotePreviewBadgesBar',
    component_kind: 'badge_contract',
    responsibility: 'Shows preview/no-quote/no-verified badges required by state and boundary.',
    consumes_state_ids: uxCatalog.states.map((state) => state.state_id),
    required_props: ['required_badges'],
    allowed_actions: ['view_reference_preview'],
    blocked_actions: ['issue_quote', 'send_quote', 'write_quote'],
    render_allowed: false,
    ui_mutation_allowed: false,
    quote_truth_allowed: false,
    execution_allowed: false,
    write_allowed: false
  }
];

const scope = {
  status: 'PASS',
  phase: '087A_QUOTE_PREVIEW_SAFE_UX_COMPONENT_CONTRACT_SCOPE',
  scope_type: 'safe_ux_component_contract_scope_only',
  safe_ux_state_status_before_087a: uxCatalog.overall_ux_state_status,
  preview_vs_quote_truth_boundary_status_before_087a: boundaryCatalog.overall_boundary_status,
  component_count: components.length,
  components,
  required_087b_output: {
    adapter_type: 'local_static_read_only_safe_ux_component_contract_registry',
    must_not_render_components: true,
    must_not_mutate_ui: true,
    must_not_create_quote_truth: true,
    must_not_write_quote: true,
    must_not_connect_backend: true,
    must_map_components_to_safe_states: true,
    required_fields: [
      'component_id',
      'component_name',
      'component_kind',
      'responsibility',
      'consumes_state_ids',
      'required_props',
      'allowed_actions',
      'blocked_actions',
      'render_allowed',
      'ui_mutation_allowed',
      'quote_truth_allowed',
      'execution_allowed',
      'write_allowed',
      'required_badges',
      'safe_errors',
      'safety_flags'
    ]
  },
  next_decision_after_087d: 'quote_preview_safe_screen_composition_scope',
  safety_flags: {
    crmWrite: false,
    pipelineWrite: false,
    policyWrite: false,
    quoteWrite: false,
    taskCreate: false,
    calendarCreate: false,
    messageSend: false,
    authReal: false,
    providerRuntime: false,
    secretAccess: false,
    browserPersistence: false,
    realEngineExecution: false,
    realEffectsAllowed: false,
    realEffectsEnabled: false,
    backendConnection: false,
    pdfRead: false,
    ocrExecution: false,
    parserExecution: false,
    calculatorExecution: false,
    banxicoCall: false,
    testExecution: false
  }
};

if (scope.safe_ux_state_status_before_087a !== 'safe_state_model_mapped_no_effects') throw new Error('087A requires 086D safe UX state model base');
if (scope.preview_vs_quote_truth_boundary_status_before_087a !== 'preview_boundary_mapped_quote_truth_blocked') throw new Error('087A requires 085D boundary base');
console.log(JSON.stringify(scope, null, 2));
NODE

cat "$COMPONENT_SCOPE_JSON"

stage "087A WRITE DOCS / EVIDENCE"
mkdir -p "$(dirname "$ARCH_DOC_A")" "$(dirname "$EVIDENCE_DOC_A")"

cat > "$ARCH_DOC_A" <<EOF
# Forge Quote Preview Safe UX Component Contract Scope 087A

PHASE=$PHASE_A

STATUS=PASS

DECISION=$DECISION_A

LOCKED_DECISION=$LOCKED_A

NEXT=$PHASE_B

## Purpose

087A scopes safe UX component contracts for Quote Preview.

This phase follows 086D, where the safe UX state model was locked as local/static/read-only reference registry.

## Important Boundary

087A does not render components.

087A does not mutate UI.

087A does not create quote truth, issue quotes, send quotes, connect backend, write CRM/policy/pipeline/quote records, read PDFs, run parsers, run calculators, call Banxico, or execute real tests.

087A only scopes component contracts that later screen composition may consume.

## Scoped Component Contracts

- \`QuotePreviewShell\`
- \`QuotePreviewStatusCard\`
- \`QuotePreviewEvidencePanel\`
- \`QuotePreviewWarningStack\`
- \`QuotePreviewValueTable\`
- \`QuotePreviewActionBar\`
- \`QuotePreviewHumanReviewCard\`
- \`QuotePreviewBadgesBar\`

## Required 087B Shape

087B must implement a local/static/read-only safe UX component contract registry.

## Final Decision

DECISION=$DECISION_A

LOCKED_DECISION=$LOCKED_A

NEXT=$PHASE_B
EOF

cat > "$EVIDENCE_DOC_A" <<EOF
# Forge Quote Preview Safe UX Component Contract Scope 087A

PHASE=$PHASE_A

STATUS=PASS

DECISION=$DECISION_A

LOCKED_DECISION=$LOCKED_A

NEXT=$PHASE_B

## Evidence Summary

087A scopes safe UX component contracts only.

## Discovery Evidence

\`\`\`json
$(cat "$DISCOVERY_DIGEST_JSON")
\`\`\`

## Component Contract Scope

\`\`\`json
$(cat "$COMPONENT_SCOPE_JSON")
\`\`\`

## Final

DECISION=$DECISION_A

LOCKED_DECISION=$LOCKED_A

NEXT=$PHASE_B
EOF

cat > "$CERT_DOC_A" <<EOF
# Forge Quote Preview Safe UX Component Contract Scope Certificate 087A

PHASE=$PHASE_A

CERTIFICATE_STATUS=PASS

DECISION=$DECISION_A

LOCKED_DECISION=$LOCKED_A

NEXT=$PHASE_B

087A certifies that safe UX component contracts have been scoped before screen composition.

$DECISION_A
EOF

cat > "$AUDIT_JSON_A" <<EOF
{
  "phase": "$PHASE_A",
  "status": "PASS",
  "decision": "$DECISION_A",
  "lockedDecision": "$LOCKED_A",
  "base": {
    "phase": "086D_QUOTE_PREVIEW_SAFE_UX_STATE_MODEL_DECISION_LOCK",
    "confirmed": true,
    "lockedDecision": "QUOTE_PREVIEW_SAFE_UX_STATE_MODEL_LOCKED_AS_LOCAL_STATIC_READ_ONLY_REFERENCE_REGISTRY"
  },
  "next": "$PHASE_B",
  "scopeType": "safe_ux_component_contract_scope_only",
  "componentContractScope": $(cat "$COMPONENT_SCOPE_JSON"),
  "discoveryEvidence": $(cat "$DISCOVERY_DIGEST_JSON"),
  "notAuthorized": {
    "componentRendering": false,
    "uiMutation": false,
    "quoteTruthCreation": false,
    "quoteWrite": false,
    "crmWrite": false,
    "policyWrite": false,
    "pipelineWrite": false,
    "backendConnection": false
  },
  "safetyFlags": {
    "crmWrite": false,
    "pipelineWrite": false,
    "policyWrite": false,
    "quoteWrite": false,
    "taskCreate": false,
    "calendarCreate": false,
    "messageSend": false,
    "authReal": false,
    "providerRuntime": false,
    "secretAccess": false,
    "browserPersistence": false,
    "realEngineExecution": false,
    "realEffectsAllowed": false,
    "realEffectsEnabled": false,
    "backendConnection": false,
    "pdfRead": false,
    "ocrExecution": false,
    "parserExecution": false,
    "calculatorExecution": false,
    "banxicoCall": false,
    "testExecution": false
  }
}
EOF

TREE_BLOCK_A="$(mktemp)"
cat > "$TREE_BLOCK_A" <<EOF
<!-- FORGE:$PHASE_A:START -->
## 087A Quote Preview Safe UX Component Contract Scope

087A scopes safe UX component contracts for Quote Preview.

Locked decision:
\`$LOCKED_A\`

Scoped component contracts:

- \`QuotePreviewShell\`
- \`QuotePreviewStatusCard\`
- \`QuotePreviewEvidencePanel\`
- \`QuotePreviewWarningStack\`
- \`QuotePreviewValueTable\`
- \`QuotePreviewActionBar\`
- \`QuotePreviewHumanReviewCard\`
- \`QuotePreviewBadgesBar\`

087B must implement a local/static/read-only safe UX component contract registry.

Boundaries:

- no component rendering;
- no UI mutation;
- no quote truth creation;
- no quote write/send;
- no CRM/policy/pipeline writes;
- no provider/backend connection.

DECISION=$DECISION_A

LOCKED_DECISION=$LOCKED_A

NEXT=$PHASE_B
<!-- FORGE:$PHASE_A:END -->
EOF

for tree in FORGE_MASTER_BUILD_TREE.md docs/architecture/source-truth/FORGE_UNIFIED_BUILD_TREE_001.md docs/roadmap/FORGE_ROADMAP_LOCK_001.md; do
  replace_or_append_block "$tree" "$PHASE_A" "$TREE_BLOCK_A"
done
trim_tree_files

mkdir -p "$(dirname "$SCRIPT_IN_REPO")"
cp "$0" "$SCRIPT_IN_REPO"
chmod +x "$SCRIPT_IN_REPO"

run bash -n "$SCRIPT_IN_REPO"
run python3 -m json.tool "$AUDIT_JSON_A"
run rg -n "$PHASE_A|$DECISION_A|$LOCKED_A|$PHASE_B|Safe UX Component Contract|QuotePreviewShell|QuotePreviewValueTable|no component rendering" \
  FORGE_MASTER_BUILD_TREE.md docs/architecture/source-truth/FORGE_UNIFIED_BUILD_TREE_001.md docs/roadmap/FORGE_ROADMAP_LOCK_001.md \
  "$ARCH_DOC_A" "$EVIDENCE_DOC_A" "$CERT_DOC_A" "$AUDIT_JSON_A"
run git diff --check
safety_scan FORGE_MASTER_BUILD_TREE.md docs/architecture/source-truth/FORGE_UNIFIED_BUILD_TREE_001.md docs/roadmap/FORGE_ROADMAP_LOCK_001.md "$ARCH_DOC_A" "$EVIDENCE_DOC_A" "$CERT_DOC_A" "$AUDIT_JSON_A"

commit_allowed_subset \
  "docs: scope quote preview safe ux component contracts" \
  FORGE_MASTER_BUILD_TREE.md docs/architecture/source-truth/FORGE_UNIFIED_BUILD_TREE_001.md docs/roadmap/FORGE_ROADMAP_LOCK_001.md \
  "$ARCH_DOC_A" "$EVIDENCE_DOC_A" "$CERT_DOC_A" "$AUDIT_JSON_A" "$SCRIPT_IN_REPO"

# -------------------------------------------------------------------
# 087B IMPLEMENTATION
# -------------------------------------------------------------------
stage "087B IMPLEMENT ADAPTER"
mkdir -p "$(dirname "$ADAPTER")" "$(dirname "$TEST")"

cat > "$ADAPTER" <<'NODE'
'use strict';

const ux = require('./quote-preview-safe-ux-state-model-registry-adapter-086b.js');
const boundary = require('./quote-preview-pdf-engine-preview-vs-quote-truth-boundary-registry-adapter-085b.js');

const ADAPTER_ID = 'forge.quote_preview.safe_ux_component_contract.registry.adapter.v1';
const SCHEMA_VERSION = 'forge.quote_preview.safe_ux_component_contract.registry.v1';
const DOMAIN_ID = 'quote_preview_safe_ux_component_contract';
const MODE = 'read_only';
const ROUTE_CLASS = 'preview_safe';

const COMPONENT_KINDS = Object.freeze({
  LAYOUT_CONTAINER_CONTRACT: 'layout_container_contract',
  STATUS_CARD_CONTRACT: 'status_card_contract',
  EVIDENCE_PANEL_CONTRACT: 'evidence_panel_contract',
  WARNING_STACK_CONTRACT: 'warning_stack_contract',
  READ_ONLY_VALUE_TABLE_CONTRACT: 'read_only_value_table_contract',
  SAFE_ACTION_CONTRACT: 'safe_action_contract',
  HUMAN_REVIEW_CONTRACT: 'human_review_contract',
  BADGE_CONTRACT: 'badge_contract',
});

const SAFE_ERROR_CODES = Object.freeze({
  COMPONENT_CONTRACT_NOT_MAPPED: 'QUOTE_PREVIEW_COMPONENT_CONTRACT_NOT_MAPPED',
  COMPONENT_RENDERING_NOT_AUTHORIZED: 'QUOTE_PREVIEW_COMPONENT_RENDERING_NOT_AUTHORIZED',
  UI_MUTATION_NOT_AUTHORIZED: 'QUOTE_PREVIEW_COMPONENT_UI_MUTATION_NOT_AUTHORIZED',
  QUOTE_TRUTH_NOT_AUTHORIZED: 'QUOTE_PREVIEW_COMPONENT_QUOTE_TRUTH_NOT_AUTHORIZED',
  WRITE_NOT_AUTHORIZED: 'QUOTE_PREVIEW_COMPONENT_WRITE_NOT_AUTHORIZED',
  EXECUTION_NOT_AUTHORIZED: 'QUOTE_PREVIEW_COMPONENT_EXECUTION_NOT_AUTHORIZED',
  PREVIEW_LABEL_REQUIRED: 'QUOTE_PREVIEW_COMPONENT_PREVIEW_LABEL_REQUIRED',
});

const DEFAULT_SAFETY_FLAGS = Object.freeze({
  crmWrite: false,
  pipelineWrite: false,
  policyWrite: false,
  quoteWrite: false,
  taskCreate: false,
  calendarCreate: false,
  messageSend: false,
  authReal: false,
  providerRuntime: false,
  secretAccess: false,
  browserPersistence: false,
  realEngineExecution: false,
  realEffectsAllowed: false,
  realEffectsEnabled: false,
  backendConnection: false,
  pdfRead: false,
  ocrExecution: false,
  parserExecution: false,
  calculatorExecution: false,
  banxicoCall: false,
  testExecution: false,
});

const REQUIRED_COMPONENT_CONTRACT_FIELDS = Object.freeze([
  'component_id',
  'component_name',
  'component_kind',
  'responsibility',
  'consumes_state_ids',
  'required_props',
  'allowed_actions',
  'blocked_actions',
  'render_allowed',
  'ui_mutation_allowed',
  'quote_truth_allowed',
  'execution_allowed',
  'write_allowed',
  'required_badges',
  'safe_errors',
  'safety_flags',
]);

const ALL_BLOCKED_ACTIONS = Object.freeze([
  'issue_quote',
  'send_quote',
  'write_quote',
  'write_crm',
  'write_policy',
  'write_pipeline',
  'connect_provider',
  'connect_backend',
  'run_parser',
  'run_calculator',
  'call_banxico',
  'read_pdf',
]);

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function freezeContract(contract) {
  return Object.freeze({
    ...contract,
    consumes_state_ids: Object.freeze([...(contract.consumes_state_ids || [])]),
    required_props: Object.freeze([...(contract.required_props || [])]),
    allowed_actions: Object.freeze([...(contract.allowed_actions || [])]),
    blocked_actions: Object.freeze([...(contract.blocked_actions || [])]),
    required_badges: Object.freeze([...(contract.required_badges || [])]),
    safe_errors: Object.freeze([...(contract.safe_errors || [])]),
    safety_flags: Object.freeze({ ...DEFAULT_SAFETY_FLAGS, ...(contract.safety_flags || {}) }),
  });
}

function buildBaseContract({
  componentId,
  componentName,
  componentKind,
  responsibility,
  consumesStateIds,
  requiredProps,
  allowedActions,
  blockedActions = ALL_BLOCKED_ACTIONS,
  requiredBadges = ['preview', 'no_es_cotizacion'],
}) {
  return freezeContract({
    component_id: componentId,
    component_name: componentName,
    component_kind: componentKind,
    responsibility,
    consumes_state_ids: consumesStateIds,
    required_props: requiredProps,
    allowed_actions: allowedActions,
    blocked_actions: blockedActions,
    render_allowed: false,
    ui_mutation_allowed: false,
    quote_truth_allowed: false,
    execution_allowed: false,
    write_allowed: false,
    required_badges: requiredBadges,
    safe_errors: [
      SAFE_ERROR_CODES.COMPONENT_RENDERING_NOT_AUTHORIZED,
      SAFE_ERROR_CODES.UI_MUTATION_NOT_AUTHORIZED,
      SAFE_ERROR_CODES.QUOTE_TRUTH_NOT_AUTHORIZED,
      SAFE_ERROR_CODES.WRITE_NOT_AUTHORIZED,
      SAFE_ERROR_CODES.EXECUTION_NOT_AUTHORIZED,
      SAFE_ERROR_CODES.PREVIEW_LABEL_REQUIRED,
    ],
  });
}

function getAllStateIds() {
  return ux.getQuotePreviewSafeUxStateModelRegistryCatalog().states.map((state) => state.state_id);
}

const allStateIds = getAllStateIds();

const COMPONENT_CONTRACTS = Object.freeze([
  buildBaseContract({
    componentId: 'quote_preview_shell',
    componentName: 'QuotePreviewShell',
    componentKind: COMPONENT_KINDS.LAYOUT_CONTAINER_CONTRACT,
    responsibility: 'Owns read-only composition slots and passes safe UX state to children.',
    consumesStateIds: allStateIds,
    requiredProps: ['state_id', 'badges', 'safe_actions', 'blocked_actions'],
    allowedActions: ['view_empty_state', 'view_reference_preview', 'open_evidence_panel', 'open_provenance_panel', 'request_human_review'],
  }),
  buildBaseContract({
    componentId: 'quote_preview_status_card',
    componentName: 'QuotePreviewStatusCard',
    componentKind: COMPONENT_KINDS.STATUS_CARD_CONTRACT,
    responsibility: 'Shows current state label, description, severity and required preview/not-quote badges.',
    consumesStateIds: allStateIds,
    requiredProps: ['display_label', 'description', 'state_kind', 'required_badges'],
    allowedActions: ['view_reference_preview'],
  }),
  buildBaseContract({
    componentId: 'quote_preview_evidence_panel',
    componentName: 'QuotePreviewEvidencePanel',
    componentKind: COMPONENT_KINDS.EVIDENCE_PANEL_CONTRACT,
    responsibility: 'Shows evidence and provenance references without reading PDFs or executing parsers.',
    consumesStateIds: ['pdf_candidate_detected', 'file_hash_not_verified', 'source_trace_not_bound', 'preview_reference_available', 'ready_for_human_review'],
    requiredProps: ['evidence_refs', 'provenance_refs', 'source_trace_status', 'verification_status'],
    allowedActions: ['open_evidence_panel', 'open_provenance_panel'],
    blockedActions: ['read_pdf', 'run_parser', 'run_calculator', 'call_banxico', 'write_quote', 'issue_quote', 'send_quote'],
  }),
  buildBaseContract({
    componentId: 'quote_preview_warning_stack',
    componentName: 'QuotePreviewWarningStack',
    componentKind: COMPONENT_KINDS.WARNING_STACK_CONTRACT,
    responsibility: 'Displays blocking and warning reasons in priority order.',
    consumesStateIds: ['file_hash_not_verified', 'source_trace_not_bound', 'parser_owner_decision_required', 'deterministic_inputs_not_verified', 'quote_truth_blocked'],
    requiredProps: ['safe_errors', 'blocked_actions', 'required_badges'],
    allowedActions: ['open_evidence_panel', 'open_provenance_panel'],
  }),
  buildBaseContract({
    componentId: 'quote_preview_value_table',
    componentName: 'QuotePreviewValueTable',
    componentKind: COMPONENT_KINDS.READ_ONLY_VALUE_TABLE_CONTRACT,
    responsibility: 'Shows preview/reference values only when labeled as not verified and not quote.',
    consumesStateIds: ['preview_reference_available', 'ready_for_human_review', 'deterministic_inputs_not_verified', 'source_trace_not_bound'],
    requiredProps: ['rows', 'source_trace_status', 'verification_status', 'required_badges'],
    allowedActions: ['view_reference_preview', 'copy_preview_reference_summary'],
  }),
  buildBaseContract({
    componentId: 'quote_preview_action_bar',
    componentName: 'QuotePreviewActionBar',
    componentKind: COMPONENT_KINDS.SAFE_ACTION_CONTRACT,
    responsibility: 'Exposes only safe read/review actions and blocks quote/provider/write actions.',
    consumesStateIds: allStateIds,
    requiredProps: ['allowed_actions', 'blocked_actions'],
    allowedActions: ['view_reference_preview', 'open_evidence_panel', 'open_provenance_panel', 'request_human_review', 'copy_preview_reference_summary'],
  }),
  buildBaseContract({
    componentId: 'quote_preview_human_review_card',
    componentName: 'QuotePreviewHumanReviewCard',
    componentKind: COMPONENT_KINDS.HUMAN_REVIEW_CONTRACT,
    responsibility: 'Explains why human review is required and exposes review request as a non-effect action.',
    consumesStateIds: ['ready_for_human_review', 'parser_owner_decision_required', 'quote_truth_blocked'],
    requiredProps: ['review_reason', 'safe_errors', 'required_badges'],
    allowedActions: ['request_human_review', 'open_evidence_panel'],
    requiredBadges: ['preview', 'no_es_cotizacion', 'requiere_revision_humana'],
  }),
  buildBaseContract({
    componentId: 'quote_preview_badges_bar',
    componentName: 'QuotePreviewBadgesBar',
    componentKind: COMPONENT_KINDS.BADGE_CONTRACT,
    responsibility: 'Shows preview/no-quote/no-verified badges required by state and boundary.',
    consumesStateIds: allStateIds,
    requiredProps: ['required_badges'],
    allowedActions: ['view_reference_preview'],
  }),
]);

function getSourceRefs() {
  const uxCatalog = ux.getQuotePreviewSafeUxStateModelRegistryCatalog();
  const boundaryCatalog = boundary.getQuotePreviewPdfEnginePreviewVsQuoteTruthBoundaryRegistryCatalog();
  return {
    safe_ux_state_model: {
      adapter_id: uxCatalog.adapter_id,
      schemaVersion: uxCatalog.schemaVersion,
      overall_ux_state_status: uxCatalog.overall_ux_state_status,
      state_count: uxCatalog.states.length,
    },
    preview_vs_quote_truth_boundary: {
      adapter_id: boundaryCatalog.adapter_id,
      schemaVersion: boundaryCatalog.schemaVersion,
      overall_boundary_status: boundaryCatalog.overall_boundary_status,
    },
  };
}

function getQuotePreviewSafeUxComponentContractRegistryCatalog() {
  return {
    adapter_id: ADAPTER_ID,
    schemaVersion: SCHEMA_VERSION,
    domainId: DOMAIN_ID,
    mode: MODE,
    routeClass: ROUTE_CLASS,
    registry_type: 'local_static_read_only_safe_ux_component_contract_registry',
    overall_component_contract_status: 'component_contracts_mapped_no_render_no_effects',
    component_rendering_allowed_in_registry: false,
    ui_mutation_allowed_in_registry: false,
    quote_truth_allowed_in_registry: false,
    execution_allowed_in_registry: false,
    write_allowed_in_registry: false,
    quote_write_allowed_in_registry: false,
    crm_write_allowed_in_registry: false,
    policy_write_allowed_in_registry: false,
    pipeline_write_allowed_in_registry: false,
    provider_runtime_allowed_in_registry: false,
    backend_connection_allowed_in_registry: false,
    required_component_contract_fields: [...REQUIRED_COMPONENT_CONTRACT_FIELDS],
    safe_errors: Object.values(SAFE_ERROR_CODES),
    safety_flags: clone(DEFAULT_SAFETY_FLAGS),
    source_refs: getSourceRefs(),
    component_contracts: clone(COMPONENT_CONTRACTS),
  };
}

function buildComponentContractSafeError(componentId, code = SAFE_ERROR_CODES.COMPONENT_CONTRACT_NOT_MAPPED) {
  return {
    schemaVersion: SCHEMA_VERSION,
    domainId: DOMAIN_ID,
    mode: MODE,
    routeClass: ROUTE_CLASS,
    readModelStatus: 'error',
    component_id: componentId || null,
    component_name: null,
    component_kind: null,
    responsibility: 'Unmapped component contract. No rendering or effects allowed.',
    consumes_state_ids: [],
    required_props: [],
    allowed_actions: [],
    blocked_actions: [...ALL_BLOCKED_ACTIONS],
    render_allowed: false,
    ui_mutation_allowed: false,
    quote_truth_allowed: false,
    execution_allowed: false,
    write_allowed: false,
    required_badges: ['no_es_cotizacion'],
    safe_errors: [code, SAFE_ERROR_CODES.COMPONENT_RENDERING_NOT_AUTHORIZED, SAFE_ERROR_CODES.QUOTE_TRUTH_NOT_AUTHORIZED, SAFE_ERROR_CODES.WRITE_NOT_AUTHORIZED],
    safety_flags: clone(DEFAULT_SAFETY_FLAGS),
    safe_error: {
      code,
      message: 'Component contract is not mapped. Rendering, quote truth, execution, and writes are blocked.',
    },
  };
}

function getComponentContractById(componentId) {
  const match = COMPONENT_CONTRACTS.find((contract) => contract.component_id === componentId);
  return match ? clone(match) : buildComponentContractSafeError(componentId);
}

function getComponentContractByName(componentName) {
  const match = COMPONENT_CONTRACTS.find((contract) => contract.component_name === componentName);
  return match ? clone(match) : buildComponentContractSafeError(componentName);
}

function getComponentContractsByKind(componentKind) {
  return clone(COMPONENT_CONTRACTS.filter((contract) => contract.component_kind === componentKind));
}

function getComponentContractsByStateId(stateId) {
  return clone(COMPONENT_CONTRACTS.filter((contract) => contract.consumes_state_ids.includes(stateId)));
}

function getNonRenderingComponentContracts() {
  return clone(COMPONENT_CONTRACTS.filter((contract) => contract.render_allowed === false));
}

function getNonWritableComponentContracts() {
  return clone(COMPONENT_CONTRACTS.filter((contract) => contract.write_allowed === false));
}

function getQuoteTruthBlockedComponentContracts() {
  return clone(COMPONENT_CONTRACTS.filter((contract) => contract.quote_truth_allowed === false));
}

function validateComponentContractShape(contract) {
  const errors = [];
  if (!contract || typeof contract !== 'object') return { ok: false, valid: false, errors: ['component_contract_object_required'] };

  for (const field of REQUIRED_COMPONENT_CONTRACT_FIELDS) {
    if (!(field in contract)) errors.push(`missing_${field}`);
  }

  if (contract.render_allowed !== false) errors.push('render_allowed_must_be_false');
  if (contract.ui_mutation_allowed !== false) errors.push('ui_mutation_allowed_must_be_false');
  if (contract.quote_truth_allowed !== false) errors.push('quote_truth_allowed_must_be_false');
  if (contract.execution_allowed !== false) errors.push('execution_allowed_must_be_false');
  if (contract.write_allowed !== false) errors.push('write_allowed_must_be_false');

  const badges = Array.isArray(contract.required_badges) ? contract.required_badges : [];
  if (!badges.includes('no_es_cotizacion')) errors.push('component_contract_must_include_no_es_cotizacion_badge');

  for (const [key, value] of Object.entries(contract.safety_flags || {})) {
    if (value !== false) errors.push(`safety_flag_not_false_${key}`);
  }

  return { ok: errors.length === 0, valid: errors.length === 0, errors };
}

function validateComponentContractRegistryCatalog(catalog) {
  const errors = [];
  if (!catalog || typeof catalog !== 'object') return { ok: false, valid: false, errors: ['catalog_object_required'] };

  if (catalog.schemaVersion !== SCHEMA_VERSION) errors.push('invalid_schemaVersion');
  if (catalog.domainId !== DOMAIN_ID) errors.push('invalid_domainId');
  if (catalog.mode !== MODE) errors.push('invalid_mode');
  if (catalog.routeClass !== ROUTE_CLASS) errors.push('invalid_routeClass');
  if (catalog.overall_component_contract_status !== 'component_contracts_mapped_no_render_no_effects') errors.push('overall_component_contract_status_must_remain_no_effects');

  for (const flagName of [
    'component_rendering_allowed_in_registry',
    'ui_mutation_allowed_in_registry',
    'quote_truth_allowed_in_registry',
    'execution_allowed_in_registry',
    'write_allowed_in_registry',
    'quote_write_allowed_in_registry',
    'crm_write_allowed_in_registry',
    'policy_write_allowed_in_registry',
    'pipeline_write_allowed_in_registry',
    'provider_runtime_allowed_in_registry',
    'backend_connection_allowed_in_registry',
  ]) {
    if (catalog[flagName] !== false) errors.push(`${flagName}_must_be_false`);
  }

  for (const [key, value] of Object.entries(catalog.safety_flags || {})) {
    if (value !== false) errors.push(`catalog_safety_flag_not_false_${key}`);
  }

  const contracts = Array.isArray(catalog.component_contracts) ? catalog.component_contracts : [];
  if (contracts.length !== 8) errors.push('eight_component_contracts_required');

  for (const contract of contracts) {
    const result = validateComponentContractShape(contract);
    if (!result.ok) errors.push(...result.errors.map((error) => `${contract.component_id || 'unknown'}:${error}`));
  }

  return { ok: errors.length === 0, valid: errors.length === 0, errors };
}

module.exports = {
  ADAPTER_ID,
  SCHEMA_VERSION,
  DOMAIN_ID,
  MODE,
  ROUTE_CLASS,
  COMPONENT_KINDS,
  SAFE_ERROR_CODES,
  DEFAULT_SAFETY_FLAGS,
  REQUIRED_COMPONENT_CONTRACT_FIELDS,
  COMPONENT_CONTRACTS,
  getQuotePreviewSafeUxComponentContractRegistryCatalog,
  getComponentContractById,
  getComponentContractByName,
  getComponentContractsByKind,
  getComponentContractsByStateId,
  getNonRenderingComponentContracts,
  getNonWritableComponentContracts,
  getQuoteTruthBlockedComponentContracts,
  buildComponentContractSafeError,
  validateComponentContractShape,
  validateComponentContractRegistryCatalog,
};
NODE

cat > "$TEST" <<'NODE'
'use strict';

const assert = require('node:assert/strict');

const adapter = require('../platform/adapters/quote-preview/quote-preview-safe-ux-component-contract-registry-adapter-087b.js');

assert.equal(adapter.ADAPTER_ID, 'forge.quote_preview.safe_ux_component_contract.registry.adapter.v1');
assert.equal(adapter.SCHEMA_VERSION, 'forge.quote_preview.safe_ux_component_contract.registry.v1');
assert.equal(adapter.MODE, 'read_only');
assert.equal(adapter.ROUTE_CLASS, 'preview_safe');

const catalog = adapter.getQuotePreviewSafeUxComponentContractRegistryCatalog();

assert.equal(catalog.schemaVersion, adapter.SCHEMA_VERSION);
assert.equal(catalog.domainId, 'quote_preview_safe_ux_component_contract');
assert.equal(catalog.registry_type, 'local_static_read_only_safe_ux_component_contract_registry');
assert.equal(catalog.overall_component_contract_status, 'component_contracts_mapped_no_render_no_effects');
assert.equal(catalog.component_contracts.length, 8);
assert.equal(adapter.validateComponentContractRegistryCatalog(catalog).ok, true);

for (const flag of [
  'component_rendering_allowed_in_registry',
  'ui_mutation_allowed_in_registry',
  'quote_truth_allowed_in_registry',
  'execution_allowed_in_registry',
  'write_allowed_in_registry',
  'quote_write_allowed_in_registry',
  'crm_write_allowed_in_registry',
  'policy_write_allowed_in_registry',
  'pipeline_write_allowed_in_registry',
  'provider_runtime_allowed_in_registry',
  'backend_connection_allowed_in_registry',
]) {
  assert.equal(catalog[flag], false, `${flag} must be false`);
}

for (const contract of catalog.component_contracts) {
  for (const field of adapter.REQUIRED_COMPONENT_CONTRACT_FIELDS) assert(field in contract, `${contract.component_id} missing ${field}`);
  assert.equal(contract.render_allowed, false);
  assert.equal(contract.ui_mutation_allowed, false);
  assert.equal(contract.quote_truth_allowed, false);
  assert.equal(contract.execution_allowed, false);
  assert.equal(contract.write_allowed, false);
  assert(contract.required_badges.includes('no_es_cotizacion'));
  assert(contract.safe_errors.includes(adapter.SAFE_ERROR_CODES.COMPONENT_RENDERING_NOT_AUTHORIZED));
  assert(contract.safe_errors.includes(adapter.SAFE_ERROR_CODES.UI_MUTATION_NOT_AUTHORIZED));
  assert(contract.safe_errors.includes(adapter.SAFE_ERROR_CODES.QUOTE_TRUTH_NOT_AUTHORIZED));
  assert.equal(adapter.validateComponentContractShape(contract).ok, true);
}

assert.equal(adapter.getNonRenderingComponentContracts().length, 8);
assert.equal(adapter.getNonWritableComponentContracts().length, 8);
assert.equal(adapter.getQuoteTruthBlockedComponentContracts().length, 8);

const shell = adapter.getComponentContractByName('QuotePreviewShell');
assert.equal(shell.component_id, 'quote_preview_shell');
assert(shell.consumes_state_ids.includes('quote_truth_blocked'));

const table = adapter.getComponentContractById('quote_preview_value_table');
assert.equal(table.component_kind, adapter.COMPONENT_KINDS.READ_ONLY_VALUE_TABLE_CONTRACT);
assert(table.allowed_actions.includes('copy_preview_reference_summary'));
assert(table.blocked_actions.includes('write_quote'));

const actionBar = adapter.getComponentContractByName('QuotePreviewActionBar');
assert.equal(actionBar.component_kind, adapter.COMPONENT_KINDS.SAFE_ACTION_CONTRACT);
assert(actionBar.blocked_actions.includes('connect_backend'));
assert(actionBar.blocked_actions.includes('write_quote'));

const human = adapter.getComponentContractByName('QuotePreviewHumanReviewCard');
assert.equal(human.component_kind, adapter.COMPONENT_KINDS.HUMAN_REVIEW_CONTRACT);
assert(human.allowed_actions.includes('request_human_review'));
assert(human.required_badges.includes('requiere_revision_humana'));

assert(adapter.getComponentContractsByStateId('preview_reference_available').length >= 4);
assert(adapter.getComponentContractsByStateId('quote_truth_blocked').length >= 4);

const missing = adapter.getComponentContractById('missing_component');
assert.equal(missing.readModelStatus, 'error');
assert.equal(missing.render_allowed, false);
assert.equal(missing.quote_truth_allowed, false);
assert.equal(missing.write_allowed, false);
assert(missing.safe_errors.includes(adapter.SAFE_ERROR_CODES.COMPONENT_CONTRACT_NOT_MAPPED));
assert.equal(adapter.validateComponentContractShape(missing).ok, true);

for (const [key, value] of Object.entries(adapter.DEFAULT_SAFETY_FLAGS)) {
  assert.equal(value, false, `DEFAULT_SAFETY_FLAGS.${key} must be false`);
}

for (const contract of catalog.component_contracts) {
  for (const [key, value] of Object.entries(contract.safety_flags || {})) {
    assert.equal(value, false, `${contract.component_id}.${key} must be false`);
  }
}

const combined = JSON.stringify({ catalog, missing, flags: adapter.DEFAULT_SAFETY_FLAGS });
for (const fragment of [
  '"pdfRead":' + 'true',
  '"ocrExecution":' + 'true',
  '"parserExecution":' + 'true',
  '"calculatorExecution":' + 'true',
  '"banxicoCall":' + 'true',
  '"realEngineExecution":' + 'true',
  '"providerRuntime":' + 'true',
  '"quoteWrite":' + 'true',
  '"backendConnection":' + 'true',
  '"testExecution":' + 'true',
]) {
  assert(!combined.includes(fragment), `forbidden true flag found: ${fragment}`);
}

console.log('PASS quote preview safe ux component contract registry adapter 087B');
NODE

run node --check "$ADAPTER"
run node --check "$TEST"
run node "$TEST"

stage "087B WRITE DOCS / EVIDENCE"
cat > "$ARCH_DOC_B" <<EOF
# Forge Quote Preview Safe UX Component Contract Implementation 087B

PHASE=$PHASE_B

STATUS=PASS

DECISION=$DECISION_B

LOCKED_DECISION=$LOCKED_B

NEXT=$PHASE_C

## Purpose

087B implements a local/static/read-only safe UX component contract registry.

The registry defines component contracts for Quote Preview. It does not render components, mutate UI, create quote truth, issue quotes, send quotes, connect backend, write CRM/policy/pipeline/quote records, or execute real effects.

## Implemented Files

- \`$ADAPTER\`
- \`$TEST\`

## Registry Status

\`component_contracts_mapped_no_render_no_effects\`

## Component Contracts

- \`QuotePreviewShell\`
- \`QuotePreviewStatusCard\`
- \`QuotePreviewEvidencePanel\`
- \`QuotePreviewWarningStack\`
- \`QuotePreviewValueTable\`
- \`QuotePreviewActionBar\`
- \`QuotePreviewHumanReviewCard\`
- \`QuotePreviewBadgesBar\`

Every component contract preserves:

- \`render_allowed=false\`
- \`ui_mutation_allowed=false\`
- \`quote_truth_allowed=false\`
- \`execution_allowed=false\`
- \`write_allowed=false\`

## Final Decision

DECISION=$DECISION_B

LOCKED_DECISION=$LOCKED_B

NEXT=$PHASE_C
EOF

cat > "$EVIDENCE_DOC_B" <<EOF
# Forge Quote Preview Safe UX Component Contract Implementation 087B

PHASE=$PHASE_B

STATUS=PASS

DECISION=$DECISION_B

LOCKED_DECISION=$LOCKED_B

NEXT=$PHASE_C

## Evidence Summary

087B implements a local/static/read-only safe UX component contract registry.

## Discovery Evidence

\`\`\`json
$(cat "$DISCOVERY_DIGEST_JSON")
\`\`\`

## Test Evidence

The focused test validates:

- adapter identity and schema;
- registry shape;
- eight component contracts exist;
- every component blocks rendering, UI mutation, quote truth, execution, and writes;
- \`QuotePreviewValueTable\` remains read-only;
- \`QuotePreviewActionBar\` exposes only safe actions;
- \`QuotePreviewHumanReviewCard\` exposes non-effect human review action;
- no component can write or execute;
- all safety flags remain false.

## Final

DECISION=$DECISION_B

LOCKED_DECISION=$LOCKED_B

NEXT=$PHASE_C
EOF

cat > "$CERT_DOC_B" <<EOF
# Forge Quote Preview Safe UX Component Contract Implementation Certificate 087B

PHASE=$PHASE_B

CERTIFICATE_STATUS=PASS

DECISION=$DECISION_B

LOCKED_DECISION=$LOCKED_B

NEXT=$PHASE_C

087B certifies that Forge now has a local/static/read-only safe UX component contract registry.

$DECISION_B
EOF

cat > "$AUDIT_JSON_B" <<EOF
{
  "phase": "$PHASE_B",
  "status": "PASS",
  "decision": "$DECISION_B",
  "lockedDecision": "$LOCKED_B",
  "base": {
    "phase": "$PHASE_A",
    "confirmed": true,
    "lockedDecision": "$LOCKED_A"
  },
  "next": "$PHASE_C",
  "implementation": {
    "adapter": "$ADAPTER",
    "test": "$TEST",
    "adapterId": "forge.quote_preview.safe_ux_component_contract.registry.adapter.v1",
    "schemaVersion": "forge.quote_preview.safe_ux_component_contract.registry.v1",
    "registryType": "local_static_read_only_safe_ux_component_contract_registry",
    "overallComponentContractStatus": "component_contracts_mapped_no_render_no_effects",
    "componentRenderingIntroduced": false,
    "uiMutationIntroduced": false,
    "quoteTruthCreationIntroduced": false,
    "providerRuntimeIntroduced": false,
    "backendConnectionIntroduced": false,
    "quoteWriteIntroduced": false
  },
  "discoveryEvidence": $(cat "$DISCOVERY_DIGEST_JSON"),
  "componentContracts": {
    "count": 8,
    "allRenderingBlocked": true,
    "allUiMutationBlocked": true,
    "allQuoteTruthBlocked": true,
    "allExecutionBlocked": true,
    "allWritesBlocked": true,
    "valueTableReadOnly": true,
    "humanReviewContractPresent": true
  },
  "safetyFlags": {
    "crmWrite": false,
    "pipelineWrite": false,
    "policyWrite": false,
    "quoteWrite": false,
    "taskCreate": false,
    "calendarCreate": false,
    "messageSend": false,
    "authReal": false,
    "providerRuntime": false,
    "secretAccess": false,
    "browserPersistence": false,
    "realEngineExecution": false,
    "realEffectsAllowed": false,
    "realEffectsEnabled": false,
    "backendConnection": false,
    "pdfRead": false,
    "ocrExecution": false,
    "parserExecution": false,
    "calculatorExecution": false,
    "banxicoCall": false,
    "testExecution": false
  }
}
EOF

TREE_BLOCK_B="$(mktemp)"
cat > "$TREE_BLOCK_B" <<EOF
<!-- FORGE:$PHASE_B:START -->
## 087B Quote Preview Safe UX Component Contract Implementation

087B implements a local/static/read-only safe UX component contract registry.

Locked decision:
\`$LOCKED_B\`

Implemented:

- \`$ADAPTER\`
- \`$TEST\`

Registry status:

- \`component_contracts_mapped_no_render_no_effects\`

Component contracts:

- \`QuotePreviewShell\`
- \`QuotePreviewStatusCard\`
- \`QuotePreviewEvidencePanel\`
- \`QuotePreviewWarningStack\`
- \`QuotePreviewValueTable\`
- \`QuotePreviewActionBar\`
- \`QuotePreviewHumanReviewCard\`
- \`QuotePreviewBadgesBar\`

Every component contract preserves:

- \`render_allowed=false\`
- \`ui_mutation_allowed=false\`
- \`quote_truth_allowed=false\`
- \`execution_allowed=false\`
- \`write_allowed=false\`

DECISION=$DECISION_B

LOCKED_DECISION=$LOCKED_B

NEXT=$PHASE_C
<!-- FORGE:$PHASE_B:END -->
EOF

for tree in FORGE_MASTER_BUILD_TREE.md docs/architecture/source-truth/FORGE_UNIFIED_BUILD_TREE_001.md docs/roadmap/FORGE_ROADMAP_LOCK_001.md; do
  replace_or_append_block "$tree" "$PHASE_B" "$TREE_BLOCK_B"
done
trim_tree_files

stage "087B VALIDATION / COMMIT"
run bash -n "$SCRIPT_IN_REPO"
run node --check "$ADAPTER"
run node --check "$TEST"
run node "$TEST"
run python3 -m json.tool "$AUDIT_JSON_B"
run rg -n "$PHASE_B|$DECISION_B|$LOCKED_B|$PHASE_C|component_contracts_mapped_no_render_no_effects|QuotePreviewActionBar|render_allowed=false|write_allowed=false" \
  FORGE_MASTER_BUILD_TREE.md docs/architecture/source-truth/FORGE_UNIFIED_BUILD_TREE_001.md docs/roadmap/FORGE_ROADMAP_LOCK_001.md \
  "$ARCH_DOC_B" "$EVIDENCE_DOC_B" "$CERT_DOC_B" "$AUDIT_JSON_B" "$ADAPTER" "$TEST"
run git diff --check
safety_scan FORGE_MASTER_BUILD_TREE.md docs/architecture/source-truth/FORGE_UNIFIED_BUILD_TREE_001.md docs/roadmap/FORGE_ROADMAP_LOCK_001.md "$ARCH_DOC_B" "$EVIDENCE_DOC_B" "$CERT_DOC_B" "$AUDIT_JSON_B" "$ADAPTER" "$TEST"

commit_allowed_subset \
  "feat: implement quote preview safe ux component contract registry" \
  FORGE_MASTER_BUILD_TREE.md docs/architecture/source-truth/FORGE_UNIFIED_BUILD_TREE_001.md docs/roadmap/FORGE_ROADMAP_LOCK_001.md \
  "$ADAPTER" "$TEST" "$ARCH_DOC_B" "$EVIDENCE_DOC_B" "$CERT_DOC_B" "$AUDIT_JSON_B" "$SCRIPT_IN_REPO"

# -------------------------------------------------------------------
# 087C QA
# -------------------------------------------------------------------
stage "087C SEMANTIC QA"
SEMANTIC_QA_JSON="$(mktemp)"
node <<'NODE' > "$SEMANTIC_QA_JSON"
const assert = require("node:assert/strict");
const contracts = require("./platform/adapters/quote-preview/quote-preview-safe-ux-component-contract-registry-adapter-087b.js");

const catalog = contracts.getQuotePreviewSafeUxComponentContractRegistryCatalog();
assert.equal(catalog.overall_component_contract_status, "component_contracts_mapped_no_render_no_effects");
assert.equal(contracts.validateComponentContractRegistryCatalog(catalog).ok, true);
assert.equal(catalog.component_contracts.length, 8);
assert.equal(contracts.getNonRenderingComponentContracts().length, 8);
assert.equal(contracts.getNonWritableComponentContracts().length, 8);
assert.equal(contracts.getQuoteTruthBlockedComponentContracts().length, 8);

for (const contract of catalog.component_contracts) {
  assert.equal(contract.render_allowed, false);
  assert.equal(contract.ui_mutation_allowed, false);
  assert.equal(contract.quote_truth_allowed, false);
  assert.equal(contract.execution_allowed, false);
  assert.equal(contract.write_allowed, false);
  assert.equal(contracts.validateComponentContractShape(contract).ok, true);
}

assert.equal(contracts.getComponentContractByName("QuotePreviewValueTable").component_kind, contracts.COMPONENT_KINDS.READ_ONLY_VALUE_TABLE_CONTRACT);
assert.equal(contracts.getComponentContractByName("QuotePreviewActionBar").component_kind, contracts.COMPONENT_KINDS.SAFE_ACTION_CONTRACT);
assert.equal(contracts.getComponentContractByName("QuotePreviewHumanReviewCard").allowed_actions.includes("request_human_review"), true);

for (const [key, value] of Object.entries(contracts.DEFAULT_SAFETY_FLAGS || {})) {
  assert.equal(value, false, `DEFAULT_SAFETY_FLAGS.${key} must be false`);
}

console.log(JSON.stringify({
  status: "PASS",
  catalogValidated: true,
  componentContractCount: catalog.component_contracts.length,
  nonRenderingContractCount: contracts.getNonRenderingComponentContracts().length,
  nonWritableContractCount: contracts.getNonWritableComponentContracts().length,
  quoteTruthBlockedContractCount: contracts.getQuoteTruthBlockedComponentContracts().length,
  valueTableReadOnly: true,
  actionBarSafeOnly: true,
  humanReviewContractPresent: true,
  allSafetyFlagsFalse: true
}, null, 2));
NODE

cat "$SEMANTIC_QA_JSON"

cat > "$ARCH_DOC_C" <<EOF
# Forge Quote Preview Safe UX Component Contract QA Lock 087C

PHASE=$PHASE_C

STATUS=PASS

DECISION=$DECISION_C

LOCKED_DECISION=$LOCKED_C

NEXT=$PHASE_D

## Purpose

087C QA locks the 087B safe UX component contract registry.

## QA Validated

- registry shape validates;
- eight component contracts exist;
- every component blocks rendering;
- every component blocks UI mutation;
- every component blocks quote truth;
- every component blocks execution;
- every component blocks writes;
- value table is read-only;
- action bar exposes safe actions only;
- human review contract exists;
- all safety flags remain false.

## Final Decision

DECISION=$DECISION_C

LOCKED_DECISION=$LOCKED_C

NEXT=$PHASE_D
EOF

cat > "$EVIDENCE_DOC_C" <<EOF
# Forge Quote Preview Safe UX Component Contract QA Lock 087C

PHASE=$PHASE_C

STATUS=PASS

DECISION=$DECISION_C

LOCKED_DECISION=$LOCKED_C

NEXT=$PHASE_D

## Semantic QA

\`\`\`json
$(cat "$SEMANTIC_QA_JSON")
\`\`\`

## Discovery Evidence

\`\`\`json
$(cat "$DISCOVERY_DIGEST_JSON")
\`\`\`

## Final

DECISION=$DECISION_C

LOCKED_DECISION=$LOCKED_C

NEXT=$PHASE_D
EOF

cat > "$CERT_DOC_C" <<EOF
# Forge Quote Preview Safe UX Component Contract QA Lock Certificate 087C

PHASE=$PHASE_C

CERTIFICATE_STATUS=PASS

DECISION=$DECISION_C

LOCKED_DECISION=$LOCKED_C

NEXT=$PHASE_D

087C certifies that safe UX component contract registry is QA locked.

$DECISION_C
EOF

cat > "$AUDIT_JSON_C" <<EOF
{
  "phase": "$PHASE_C",
  "status": "PASS",
  "decision": "$DECISION_C",
  "lockedDecision": "$LOCKED_C",
  "base": {
    "phase": "$PHASE_B",
    "confirmed": true,
    "lockedDecision": "$LOCKED_B"
  },
  "next": "$PHASE_D",
  "semanticQa": $(cat "$SEMANTIC_QA_JSON"),
  "discoveryEvidence": $(cat "$DISCOVERY_DIGEST_JSON"),
  "qaValidated": {
    "registryShapeValidates": true,
    "componentContractCount": 8,
    "allRenderingBlocked": true,
    "allUiMutationBlocked": true,
    "allQuoteTruthBlocked": true,
    "allExecutionBlocked": true,
    "allWritesBlocked": true,
    "valueTableReadOnly": true,
    "actionBarSafeOnly": true,
    "humanReviewContractPresent": true,
    "allSafetyFlagsFalse": true
  },
  "safetyFlags": {
    "crmWrite": false,
    "pipelineWrite": false,
    "policyWrite": false,
    "quoteWrite": false,
    "taskCreate": false,
    "calendarCreate": false,
    "messageSend": false,
    "authReal": false,
    "providerRuntime": false,
    "secretAccess": false,
    "browserPersistence": false,
    "realEngineExecution": false,
    "realEffectsAllowed": false,
    "realEffectsEnabled": false,
    "backendConnection": false,
    "pdfRead": false,
    "ocrExecution": false,
    "parserExecution": false,
    "calculatorExecution": false,
    "banxicoCall": false,
    "testExecution": false
  }
}
EOF

TREE_BLOCK_C="$(mktemp)"
cat > "$TREE_BLOCK_C" <<EOF
<!-- FORGE:$PHASE_C:START -->
## 087C Quote Preview Safe UX Component Contract QA Lock

087C QA locks the 087B safe UX component contract registry.

Locked decision:
\`$LOCKED_C\`

QA validated:

- registry shape validates;
- eight component contracts exist;
- every component blocks rendering;
- every component blocks UI mutation;
- every component blocks quote truth;
- every component blocks execution;
- every component blocks writes;
- value table is read-only;
- action bar exposes safe actions only;
- human review contract exists;
- all safety flags remain false.

DECISION=$DECISION_C

LOCKED_DECISION=$LOCKED_C

NEXT=$PHASE_D
<!-- FORGE:$PHASE_C:END -->
EOF

for tree in FORGE_MASTER_BUILD_TREE.md docs/architecture/source-truth/FORGE_UNIFIED_BUILD_TREE_001.md docs/roadmap/FORGE_ROADMAP_LOCK_001.md; do
  replace_or_append_block "$tree" "$PHASE_C" "$TREE_BLOCK_C"
done
trim_tree_files

stage "087C VALIDATION / COMMIT"
run bash -n "$SCRIPT_IN_REPO"
run node --check "$ADAPTER"
run node --check "$TEST"
run node "$TEST"
run python3 -m json.tool "$AUDIT_JSON_C"
run rg -n "$PHASE_C|$DECISION_C|$LOCKED_C|$PHASE_D|QA locks|eight component contracts|value table is read-only|human review contract" \
  FORGE_MASTER_BUILD_TREE.md docs/architecture/source-truth/FORGE_UNIFIED_BUILD_TREE_001.md docs/roadmap/FORGE_ROADMAP_LOCK_001.md \
  "$ARCH_DOC_C" "$EVIDENCE_DOC_C" "$CERT_DOC_C" "$AUDIT_JSON_C"
run git diff --check
safety_scan FORGE_MASTER_BUILD_TREE.md docs/architecture/source-truth/FORGE_UNIFIED_BUILD_TREE_001.md docs/roadmap/FORGE_ROADMAP_LOCK_001.md "$ARCH_DOC_C" "$EVIDENCE_DOC_C" "$CERT_DOC_C" "$AUDIT_JSON_C" "$ADAPTER" "$TEST"

commit_allowed_subset \
  "docs: lock quote preview safe ux component contract qa" \
  FORGE_MASTER_BUILD_TREE.md docs/architecture/source-truth/FORGE_UNIFIED_BUILD_TREE_001.md docs/roadmap/FORGE_ROADMAP_LOCK_001.md \
  "$ARCH_DOC_C" "$EVIDENCE_DOC_C" "$CERT_DOC_C" "$AUDIT_JSON_C" "$SCRIPT_IN_REPO"

# -------------------------------------------------------------------
# 087D DECISION
# -------------------------------------------------------------------
stage "087D DECISION ASSERTIONS"
DECISION_QA_JSON="$(mktemp)"
node <<'NODE' > "$DECISION_QA_JSON"
const assert = require("node:assert/strict");
const contracts = require("./platform/adapters/quote-preview/quote-preview-safe-ux-component-contract-registry-adapter-087b.js");

const catalog = contracts.getQuotePreviewSafeUxComponentContractRegistryCatalog();
assert.equal(catalog.overall_component_contract_status, "component_contracts_mapped_no_render_no_effects");
assert.equal(contracts.validateComponentContractRegistryCatalog(catalog).ok, true);
assert.equal(catalog.component_contracts.length, 8);
assert.equal(contracts.getNonRenderingComponentContracts().length, 8);
assert.equal(contracts.getNonWritableComponentContracts().length, 8);
assert.equal(contracts.getQuoteTruthBlockedComponentContracts().length, 8);

for (const contract of catalog.component_contracts) {
  assert.equal(contract.render_allowed, false);
  assert.equal(contract.ui_mutation_allowed, false);
  assert.equal(contract.quote_truth_allowed, false);
  assert.equal(contract.execution_allowed, false);
  assert.equal(contract.write_allowed, false);
}

console.log(JSON.stringify({
  status: "PASS",
  locked_as: "local_static_read_only_reference_registry",
  overall_component_contract_status: catalog.overall_component_contract_status,
  component_contract_count: catalog.component_contracts.length,
  non_rendering_contract_count: contracts.getNonRenderingComponentContracts().length,
  non_writable_contract_count: contracts.getNonWritableComponentContracts().length,
  quote_truth_blocked_contract_count: contracts.getQuoteTruthBlockedComponentContracts().length,
  next_scope: "088A_QUOTE_PREVIEW_SAFE_SCREEN_COMPOSITION_SCOPE",
  all_safety_flags_false: true
}, null, 2));
NODE

cat "$DECISION_QA_JSON"

cat > "$ARCH_DOC_D" <<EOF
# Forge Quote Preview Safe UX Component Contract Decision Lock 087D

PHASE=$PHASE_D

STATUS=PASS

DECISION=$DECISION_D

LOCKED_DECISION=$LOCKED_D

NEXT=$NEXT_AFTER_D

## Purpose

087D decision-locks the 087B/087C safe UX component contract registry as a local/static/read-only reference registry.

## Locked Meaning

The registry is approved only as:

- local/static;
- read-only;
- safe component contract reference model;
- no component rendering;
- no UI mutation;
- no quote truth;
- no execution;
- no writes.

## Confirmed

- eight component contracts exist;
- every component blocks rendering;
- every component blocks UI mutation;
- every component blocks quote truth;
- every component blocks execution;
- every component blocks writes;
- value table is read-only;
- action bar exposes safe actions only;
- human review contract exists.

## Next Architectural Unlock

088A may scope safe screen composition for Quote Preview.

088A must not execute tests, read PDFs, run OCR, run parsers, run calculators, call Banxico/providers, connect backend, write quotes, mutate UI, render components, or create real effects.

## Final Decision

DECISION=$DECISION_D

LOCKED_DECISION=$LOCKED_D

NEXT=$NEXT_AFTER_D
EOF

cat > "$EVIDENCE_DOC_D" <<EOF
# Forge Quote Preview Safe UX Component Contract Decision Lock 087D

PHASE=$PHASE_D

STATUS=PASS

DECISION=$DECISION_D

LOCKED_DECISION=$LOCKED_D

NEXT=$NEXT_AFTER_D

## Decision Assertions

\`\`\`json
$(cat "$DECISION_QA_JSON")
\`\`\`

## Discovery Evidence

\`\`\`json
$(cat "$DISCOVERY_DIGEST_JSON")
\`\`\`

## Final

DECISION=$DECISION_D

LOCKED_DECISION=$LOCKED_D

NEXT=$NEXT_AFTER_D
EOF

cat > "$CERT_DOC_D" <<EOF
# Forge Quote Preview Safe UX Component Contract Decision Lock Certificate 087D

PHASE=$PHASE_D

CERTIFICATE_STATUS=PASS

DECISION=$DECISION_D

LOCKED_DECISION=$LOCKED_D

NEXT=$NEXT_AFTER_D

087D certifies that safe UX component contract registry is locked as local/static/read-only reference registry.

$DECISION_D
EOF

cat > "$AUDIT_JSON_D" <<EOF
{
  "phase": "$PHASE_D",
  "status": "PASS",
  "decision": "$DECISION_D",
  "lockedDecision": "$LOCKED_D",
  "base": {
    "phase": "$PHASE_C",
    "confirmed": true,
    "lockedDecision": "$LOCKED_C"
  },
  "next": "$NEXT_AFTER_D",
  "lockedAs": "local_static_read_only_reference_registry",
  "decisionAssertions": $(cat "$DECISION_QA_JSON"),
  "discoveryEvidence": $(cat "$DISCOVERY_DIGEST_JSON"),
  "confirmed": {
    "registryShapeValidates": true,
    "componentContractCount": 8,
    "allRenderingBlocked": true,
    "allUiMutationBlocked": true,
    "allQuoteTruthBlocked": true,
    "allExecutionBlocked": true,
    "allWritesBlocked": true,
    "valueTableReadOnly": true,
    "actionBarSafeOnly": true,
    "humanReviewContractPresent": true,
    "allSafetyFlagsFalse": true
  },
  "nextScope": {
    "phase": "$NEXT_AFTER_D",
    "purpose": "quote_preview_safe_screen_composition_scope",
    "executionAllowed": false,
    "uiMutationAllowed": false,
    "componentRenderingAllowed": false
  },
  "safetyFlags": {
    "crmWrite": false,
    "pipelineWrite": false,
    "policyWrite": false,
    "quoteWrite": false,
    "taskCreate": false,
    "calendarCreate": false,
    "messageSend": false,
    "authReal": false,
    "providerRuntime": false,
    "secretAccess": false,
    "browserPersistence": false,
    "realEngineExecution": false,
    "realEffectsAllowed": false,
    "realEffectsEnabled": false,
    "backendConnection": false,
    "pdfRead": false,
    "ocrExecution": false,
    "parserExecution": false,
    "calculatorExecution": false,
    "banxicoCall": false,
    "testExecution": false
  }
}
EOF

TREE_BLOCK_D="$(mktemp)"
cat > "$TREE_BLOCK_D" <<EOF
<!-- FORGE:$PHASE_D:START -->
## 087D Quote Preview Safe UX Component Contract Decision Lock

087D decision-locks the 087B/087C safe UX component contract registry as a local/static/read-only reference registry.

Locked decision:
\`$LOCKED_D\`

Confirmed:

- eight component contracts exist;
- every component blocks rendering;
- every component blocks UI mutation;
- every component blocks quote truth;
- every component blocks execution;
- every component blocks writes;
- value table is read-only;
- action bar exposes safe actions only;
- human review contract exists.

Next:

- \`$NEXT_AFTER_D\` may scope safe screen composition.
- No component rendering, UI mutation, or execution is authorized.

DECISION=$DECISION_D

LOCKED_DECISION=$LOCKED_D

NEXT=$NEXT_AFTER_D
<!-- FORGE:$PHASE_D:END -->
EOF

for tree in FORGE_MASTER_BUILD_TREE.md docs/architecture/source-truth/FORGE_UNIFIED_BUILD_TREE_001.md docs/roadmap/FORGE_ROADMAP_LOCK_001.md; do
  replace_or_append_block "$tree" "$PHASE_D" "$TREE_BLOCK_D"
done
trim_tree_files

stage "087D VALIDATION / COMMIT"
run bash -n "$SCRIPT_IN_REPO"
run node --check "$ADAPTER"
run node --check "$TEST"
run node "$TEST"
run python3 -m json.tool "$AUDIT_JSON_D"
run rg -n "$PHASE_D|$DECISION_D|$LOCKED_D|$NEXT_AFTER_D|Safe UX Component Contract|decision-locks|safe screen composition|No component rendering" \
  FORGE_MASTER_BUILD_TREE.md docs/architecture/source-truth/FORGE_UNIFIED_BUILD_TREE_001.md docs/roadmap/FORGE_ROADMAP_LOCK_001.md \
  "$ARCH_DOC_D" "$EVIDENCE_DOC_D" "$CERT_DOC_D" "$AUDIT_JSON_D"
run git diff --check
safety_scan FORGE_MASTER_BUILD_TREE.md docs/architecture/source-truth/FORGE_UNIFIED_BUILD_TREE_001.md docs/roadmap/FORGE_ROADMAP_LOCK_001.md "$ARCH_DOC_D" "$EVIDENCE_DOC_D" "$CERT_DOC_D" "$AUDIT_JSON_D" "$ADAPTER" "$TEST"

commit_allowed_subset \
  "docs: lock quote preview safe ux component contract decision" \
  FORGE_MASTER_BUILD_TREE.md docs/architecture/source-truth/FORGE_UNIFIED_BUILD_TREE_001.md docs/roadmap/FORGE_ROADMAP_LOCK_001.md \
  "$ARCH_DOC_D" "$EVIDENCE_DOC_D" "$CERT_DOC_D" "$AUDIT_JSON_D" "$SCRIPT_IN_REPO"

stage "FINAL CHECKPOINT"
run git status --short --branch
run git log --oneline -16

SUMMARY=$(cat <<EOF
PASS_087ABCD_QUOTE_PREVIEW_SAFE_UX_COMPONENT_CONTRACT_FAST_TRACK_COMMIT_PUSH_COMPLETE
PASS_A=$DECISION_A
LOCKED_A=$LOCKED_A
PASS_B=$DECISION_B
LOCKED_B=$LOCKED_B
PASS_C=$DECISION_C
LOCKED_C=$LOCKED_C
PASS_D=$DECISION_D
LOCKED_D=$LOCKED_D
NEXT=$NEXT_AFTER_D
DISCOVERY_JSON=$DISCOVERY_JSON_FOUND
BACKUP=$BACKUP_DIR
REPORT=$REPORT
EOF
)

echo
echo "$SUMMARY"

if command -v termux-clipboard-set >/dev/null 2>&1; then
  printf "%s\n" "$SUMMARY" | termux-clipboard-set
  pass "final summary copied to clipboard"
else
  warn "termux-clipboard-set not available; summary not copied"
fi

echo "Reporte: $REPORT"
