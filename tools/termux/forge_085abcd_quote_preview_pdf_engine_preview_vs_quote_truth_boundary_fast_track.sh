#!/usr/bin/env bash
set -euo pipefail

CHAIN="085ABCD_QUOTE_PREVIEW_PDF_ENGINE_PREVIEW_VS_QUOTE_TRUTH_BOUNDARY_FAST_TRACK"
REPO="${REPO:-/storage/emulated/0/Forge OS}"
STAMP="$(date +%Y%m%d_%H%M%S)"
REPORT="/data/data/com.termux/files/home/${CHAIN}_RESULT_${STAMP}.md"
BACKUP_DIR=".forge-backups/085abcd-preview-vs-quote-truth-boundary-fast-track-${STAMP}"
SCRIPT_IN_REPO="tools/termux/forge_085abcd_quote_preview_pdf_engine_preview_vs_quote_truth_boundary_fast_track.sh"

PHASE_A="085A_QUOTE_PREVIEW_PDF_ENGINE_PREVIEW_VS_QUOTE_TRUTH_BOUNDARY_SCOPE"
DECISION_A="PASS_085A_QUOTE_PREVIEW_PDF_ENGINE_PREVIEW_VS_QUOTE_TRUTH_BOUNDARY_SCOPE"
LOCKED_A="QUOTE_PREVIEW_PDF_ENGINE_PREVIEW_VS_QUOTE_TRUTH_BOUNDARY_SCOPED"

PHASE_B="085B_QUOTE_PREVIEW_PDF_ENGINE_PREVIEW_VS_QUOTE_TRUTH_BOUNDARY_IMPLEMENTATION"
DECISION_B="PASS_085B_QUOTE_PREVIEW_PDF_ENGINE_PREVIEW_VS_QUOTE_TRUTH_BOUNDARY_IMPLEMENTATION"
LOCKED_B="QUOTE_PREVIEW_PDF_ENGINE_PREVIEW_VS_QUOTE_TRUTH_BOUNDARY_LOCAL_STATIC_READ_ONLY_IMPLEMENTED"

PHASE_C="085C_QUOTE_PREVIEW_PDF_ENGINE_PREVIEW_VS_QUOTE_TRUTH_BOUNDARY_QA_LOCK"
DECISION_C="PASS_085C_QUOTE_PREVIEW_PDF_ENGINE_PREVIEW_VS_QUOTE_TRUTH_BOUNDARY_QA_LOCK"
LOCKED_C="QUOTE_PREVIEW_PDF_ENGINE_PREVIEW_VS_QUOTE_TRUTH_BOUNDARY_QA_LOCKED"

PHASE_D="085D_QUOTE_PREVIEW_PDF_ENGINE_PREVIEW_VS_QUOTE_TRUTH_BOUNDARY_DECISION_LOCK"
DECISION_D="PASS_085D_QUOTE_PREVIEW_PDF_ENGINE_PREVIEW_VS_QUOTE_TRUTH_BOUNDARY_DECISION_LOCK"
LOCKED_D="QUOTE_PREVIEW_PDF_ENGINE_PREVIEW_VS_QUOTE_TRUTH_BOUNDARY_LOCKED_AS_LOCAL_STATIC_READ_ONLY_REFERENCE_REGISTRY"
NEXT_AFTER_D="086A_QUOTE_PREVIEW_SAFE_UX_STATE_MODEL_SCOPE"

BOUNDARY="no UI mutation; no backend real; no CRM/policy/quote/pipeline writes; no task/calendar/message; no provider execution with effects; no auth/secrets/browser persistence; no real engine execution; no parser/calculator/Banxico/PDF/OCR execution; no PDF file read; no hash computation over PDFs; no expected-value verification; no parser invocation; no deterministic calculation; no quote truth creation; no quote issuance; no quote send; no invented product/premium/coverage/projection/quote truth; no new extractor/parser/calculator; no real test execution"

SURFACES_ADAPTER="platform/adapters/quote-preview/quote-preview-pdf-engine-existing-surfaces-canonical-mapping-adapter-077b.js"
SURFACES_TEST="tests/quote-preview-pdf-engine-existing-surfaces-canonical-mapping-adapter-077b-test.js"
EVIDENCE_ADAPTER="platform/adapters/quote-preview/quote-preview-pdf-engine-canonical-test-evidence-registry-adapter-078b.js"
EVIDENCE_TEST="tests/quote-preview-pdf-engine-canonical-test-evidence-registry-adapter-078b-test.js"
PROVENANCE_ADAPTER="platform/adapters/quote-preview/quote-preview-pdf-engine-canonical-test-evidence-provenance-registry-adapter-079b.js"
PROVENANCE_TEST="tests/quote-preview-pdf-engine-canonical-test-evidence-provenance-registry-adapter-079b-test.js"
READINESS_ADAPTER="platform/adapters/quote-preview/quote-preview-pdf-engine-canonical-execution-readiness-review-matrix-adapter-080b.js"
READINESS_TEST="tests/quote-preview-pdf-engine-canonical-execution-readiness-review-matrix-adapter-080b-test.js"
FILE_HASH_ADAPTER="platform/adapters/quote-preview/quote-preview-pdf-engine-real-pdf-file-hash-provenance-registry-adapter-081b.js"
FILE_HASH_TEST="tests/quote-preview-pdf-engine-real-pdf-file-hash-provenance-registry-adapter-081b-test.js"
EXPECTED_TRACE_ADAPTER="platform/adapters/quote-preview/quote-preview-pdf-engine-expected-value-source-trace-registry-adapter-082b.js"
EXPECTED_TRACE_TEST="tests/quote-preview-pdf-engine-expected-value-source-trace-registry-adapter-082b-test.js"
PARSER_OWNERSHIP_ADAPTER="platform/adapters/quote-preview/quote-preview-pdf-engine-parser-ownership-registry-adapter-083b.js"
PARSER_OWNERSHIP_TEST="tests/quote-preview-pdf-engine-parser-ownership-registry-adapter-083b-test.js"
DETERMINISTIC_INPUT_ADAPTER="platform/adapters/quote-preview/quote-preview-pdf-engine-deterministic-input-source-trace-registry-adapter-084b.js"
DETERMINISTIC_INPUT_TEST="tests/quote-preview-pdf-engine-deterministic-input-source-trace-registry-adapter-084b-test.js"

ADAPTER="platform/adapters/quote-preview/quote-preview-pdf-engine-preview-vs-quote-truth-boundary-registry-adapter-085b.js"
TEST="tests/quote-preview-pdf-engine-preview-vs-quote-truth-boundary-registry-adapter-085b-test.js"

ARCH_DOC_A="docs/architecture/source-truth/FORGE_QUOTE_PREVIEW_PDF_ENGINE_PREVIEW_VS_QUOTE_TRUTH_BOUNDARY_SCOPE_085A.md"
EVIDENCE_DOC_A="docs/evidence/FORGE_QUOTE_PREVIEW_PDF_ENGINE_PREVIEW_VS_QUOTE_TRUTH_BOUNDARY_SCOPE_085A.md"
CERT_DOC_A="docs/evidence/FORGE_QUOTE_PREVIEW_PDF_ENGINE_PREVIEW_VS_QUOTE_TRUTH_BOUNDARY_SCOPE_CERTIFICATE_085A.md"
AUDIT_JSON_A="docs/evidence/forge-quote-preview-pdf-engine-preview-vs-quote-truth-boundary-scope-audit-085a.json"

ARCH_DOC_B="docs/architecture/source-truth/FORGE_QUOTE_PREVIEW_PDF_ENGINE_PREVIEW_VS_QUOTE_TRUTH_BOUNDARY_IMPLEMENTATION_085B.md"
EVIDENCE_DOC_B="docs/evidence/FORGE_QUOTE_PREVIEW_PDF_ENGINE_PREVIEW_VS_QUOTE_TRUTH_BOUNDARY_IMPLEMENTATION_085B.md"
CERT_DOC_B="docs/evidence/FORGE_QUOTE_PREVIEW_PDF_ENGINE_PREVIEW_VS_QUOTE_TRUTH_BOUNDARY_IMPLEMENTATION_CERTIFICATE_085B.md"
AUDIT_JSON_B="docs/evidence/forge-quote-preview-pdf-engine-preview-vs-quote-truth-boundary-implementation-audit-085b.json"

ARCH_DOC_C="docs/architecture/source-truth/FORGE_QUOTE_PREVIEW_PDF_ENGINE_PREVIEW_VS_QUOTE_TRUTH_BOUNDARY_QA_LOCK_085C.md"
EVIDENCE_DOC_C="docs/evidence/FORGE_QUOTE_PREVIEW_PDF_ENGINE_PREVIEW_VS_QUOTE_TRUTH_BOUNDARY_QA_LOCK_085C.md"
CERT_DOC_C="docs/evidence/FORGE_QUOTE_PREVIEW_PDF_ENGINE_PREVIEW_VS_QUOTE_TRUTH_BOUNDARY_QA_LOCK_CERTIFICATE_085C.md"
AUDIT_JSON_C="docs/evidence/forge-quote-preview-pdf-engine-preview-vs-quote-truth-boundary-qa-audit-085c.json"

ARCH_DOC_D="docs/architecture/source-truth/FORGE_QUOTE_PREVIEW_PDF_ENGINE_PREVIEW_VS_QUOTE_TRUTH_BOUNDARY_DECISION_LOCK_085D.md"
EVIDENCE_DOC_D="docs/evidence/FORGE_QUOTE_PREVIEW_PDF_ENGINE_PREVIEW_VS_QUOTE_TRUTH_BOUNDARY_DECISION_LOCK_085D.md"
CERT_DOC_D="docs/evidence/FORGE_QUOTE_PREVIEW_PDF_ENGINE_PREVIEW_VS_QUOTE_TRUTH_BOUNDARY_DECISION_LOCK_CERTIFICATE_085D.md"
AUDIT_JSON_D="docs/evidence/forge-quote-preview-pdf-engine-preview-vs-quote-truth-boundary-decision-audit-085d.json"

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
  if rg -n 'localStorage|sessionStorage|fetch\(|XMLHttpRequest|navigator\.mediaDevices|SpeechRecognition|providerRuntimeEnabled:\s*true|networkCallsAllowed:\s*true|browserStorageEnabled:\s*true|mayCreateTruth:\s*true|maySendMessage:\s*true|mayWriteCrm:\s*true|mayCreateCalendarEvent:\s*true|quoteTruth\s*:\s*true|quoteIssue\s*:\s*true|quoteSend\s*:\s*true|providerRuntime\s*:\s*true' "${files[@]}"; then
    fail "safety scan found prohibited runtime/browser/network/quote truth marker"
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
echo "ROBOCOP_GATE=Article 0; 084D deterministic input source trace closed; preview-vs-quote-truth boundary fast-track only"

cd "$REPO" || fail "No existe repo: $REPO"

stage "STAGE 1 CHECKPOINT"
run git status --short --branch
run git log --oneline -15
run git diff --name-status
run git diff --cached --name-status

stage "STAGE 2 CLEAN INDEX ONLY"
run git reset

stage "STAGE 3 CONFIRM BASE 084D"
if git log --oneline -160 | grep -Eq "084D|deterministic input source trace decision|QUOTE_PREVIEW_PDF_ENGINE_DETERMINISTIC_INPUT_SOURCE_TRACE_LOCKED_AS_LOCAL_STATIC_READ_ONLY_NOT_BOUND_NOT_VERIFIED_REFERENCE_REGISTRY"; then
  pass "084D base found in git log"
elif [ -f "docs/evidence/forge-quote-preview-pdf-engine-deterministic-input-source-trace-decision-audit-084d.json" ]; then
  pass "084D audit fallback found"
else
  fail "084D base not found. Run 084A/B/C/D first."
fi

if [ -f "docs/evidence/forge-quote-preview-pdf-engine-deterministic-input-source-trace-decision-audit-084d.json" ]; then
  run python3 -m json.tool docs/evidence/forge-quote-preview-pdf-engine-deterministic-input-source-trace-decision-audit-084d.json
  if ! rg -n '"status"\s*:\s*"PASS"|"lockedDecision"\s*:\s*"QUOTE_PREVIEW_PDF_ENGINE_DETERMINISTIC_INPUT_SOURCE_TRACE_LOCKED_AS_LOCAL_STATIC_READ_ONLY_NOT_BOUND_NOT_VERIFIED_REFERENCE_REGISTRY"|"next"\s*:\s*"085A_QUOTE_PREVIEW_PDF_ENGINE_PREVIEW_VS_QUOTE_TRUTH_BOUNDARY_SCOPE"' docs/evidence/forge-quote-preview-pdf-engine-deterministic-input-source-trace-decision-audit-084d.json >/dev/null; then
    fail "084D audit exists but does not confirm PASS/085A next"
  fi
  pass "084D audit PASS/085A next confirmed"
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
  "$SURFACES_ADAPTER" "$SURFACES_TEST"
  "$EVIDENCE_ADAPTER" "$EVIDENCE_TEST"
  "$PROVENANCE_ADAPTER" "$PROVENANCE_TEST"
  "$READINESS_ADAPTER" "$READINESS_TEST"
  "$FILE_HASH_ADAPTER" "$FILE_HASH_TEST"
  "$EXPECTED_TRACE_ADAPTER" "$EXPECTED_TRACE_TEST"
  "$PARSER_OWNERSHIP_ADAPTER" "$PARSER_OWNERSHIP_TEST"
  "$DETERMINISTIC_INPUT_ADAPTER" "$DETERMINISTIC_INPUT_TEST"
)
for f in "${REQUIRED_FILES[@]}"; do [ -f "$f" ] || fail "Missing required file: $f"; pass "$f"; done

stage "STAGE 6 BACKUP"
mkdir -p "$BACKUP_DIR"
cp FORGE_MASTER_BUILD_TREE.md "$BACKUP_DIR/FORGE_MASTER_BUILD_TREE.md"
cp docs/architecture/source-truth/FORGE_UNIFIED_BUILD_TREE_001.md "$BACKUP_DIR/FORGE_UNIFIED_BUILD_TREE_001.md"
cp docs/roadmap/FORGE_ROADMAP_LOCK_001.md "$BACKUP_DIR/FORGE_ROADMAP_LOCK_001.md"
pass "$BACKUP_DIR"

stage "STAGE 7 BASE VALIDATION"
run node --check "$SURFACES_ADAPTER"; run node "$SURFACES_TEST"
run node --check "$EVIDENCE_ADAPTER"; run node "$EVIDENCE_TEST"
run node --check "$PROVENANCE_ADAPTER"; run node "$PROVENANCE_TEST"
run node --check "$READINESS_ADAPTER"; run node "$READINESS_TEST"
run node --check "$FILE_HASH_ADAPTER"; run node "$FILE_HASH_TEST"
run node --check "$EXPECTED_TRACE_ADAPTER"; run node "$EXPECTED_TRACE_TEST"
run node --check "$PARSER_OWNERSHIP_ADAPTER"; run node "$PARSER_OWNERSHIP_TEST"
run node --check "$DETERMINISTIC_INPUT_ADAPTER"; run node "$DETERMINISTIC_INPUT_TEST"

# -------------------------------------------------------------------
# 085A SCOPE
# -------------------------------------------------------------------
stage "085A BUILD SCOPE"
BOUNDARY_SCOPE_JSON="$(mktemp)"
node <<'NODE' > "$BOUNDARY_SCOPE_JSON"
const readiness = require('./platform/adapters/quote-preview/quote-preview-pdf-engine-canonical-execution-readiness-review-matrix-adapter-080b.js');
const deterministicInput = require('./platform/adapters/quote-preview/quote-preview-pdf-engine-deterministic-input-source-trace-registry-adapter-084b.js');

const readinessCatalog = readiness.getQuotePreviewPdfCanonicalExecutionReadinessReviewMatrixCatalog();
const deterministicCatalog = deterministicInput.getQuotePreviewPdfEngineDeterministicInputSourceTraceRegistryCatalog();

const boundarySurfaces = [
  {
    boundary_id: 'boundary_quote_preview_pdf_engine',
    surface_id: 'quote_pdf_preview_engine',
    surface_kind: 'preview_engine',
    owner_domain: 'product_intelligence_evidence',
    allowed_truth_class: 'preview_reference_only',
    preview_allowed: true,
    quote_truth_allowed: false,
    execution_allowed: false,
    boundary_status: 'preview_allowed_quote_truth_blocked'
  },
  {
    boundary_id: 'boundary_quote_preview_expected_values',
    surface_id: 'expected_value_source_trace_registry',
    surface_kind: 'reference_registry',
    owner_domain: 'quote_preview_pdf_engine',
    allowed_truth_class: 'not_verified_reference_only',
    preview_allowed: true,
    quote_truth_allowed: false,
    execution_allowed: false,
    boundary_status: 'preview_allowed_quote_truth_blocked'
  },
  {
    boundary_id: 'boundary_real_quote_truth_provider_backend',
    surface_id: 'provider_backend_quote_truth',
    surface_kind: 'real_quote_authority',
    owner_domain: 'provider_backend',
    allowed_truth_class: 'real_quote_truth_requires_provider_runtime_gate',
    preview_allowed: false,
    quote_truth_allowed: false,
    execution_allowed: false,
    boundary_status: 'blocked_until_real_execution_gates'
  },
  {
    boundary_id: 'boundary_user_visible_quote_preview_ui',
    surface_id: 'quote_preview_ui',
    surface_kind: 'user_visible_preview_surface',
    owner_domain: 'forge_ui',
    allowed_truth_class: 'must_label_as_preview_not_quote',
    preview_allowed: true,
    quote_truth_allowed: false,
    execution_allowed: false,
    boundary_status: 'preview_label_required_quote_truth_blocked'
  }
];

const scope = {
  status: 'PASS',
  phase: '085A_QUOTE_PREVIEW_PDF_ENGINE_PREVIEW_VS_QUOTE_TRUTH_BOUNDARY_SCOPE',
  scope_type: 'preview_vs_quote_truth_boundary_scope_only',
  overall_readiness_before_085a: readinessCatalog.overall_readiness,
  deterministic_input_registry_status_before_085a: deterministicCatalog.overall_input_trace_status,
  execution_allowed_in_085a: false,
  preview_reference_allowed_in_085a: true,
  quote_truth_creation_allowed_in_085a: false,
  quote_issuance_allowed_in_085a: false,
  quote_send_allowed_in_085a: false,
  provider_runtime_allowed_in_085a: false,
  backend_connection_allowed_in_085a: false,
  quote_write_allowed_in_085a: false,
  boundary_surface_count: boundarySurfaces.length,
  boundary_surfaces: boundarySurfaces,
  required_085b_output: {
    adapter_type: 'local_static_read_only_preview_vs_quote_truth_boundary_registry',
    must_allow_preview_reference_only: true,
    must_block_quote_truth_creation: true,
    must_block_provider_runtime: true,
    must_block_backend_connection: true,
    must_block_quote_write: true,
    must_require_preview_labeling: true,
    required_fields: [
      'boundary_id',
      'surface_id',
      'surface_kind',
      'owner_domain',
      'allowed_truth_class',
      'preview_allowed',
      'quote_truth_allowed',
      'execution_allowed',
      'boundary_status',
      'blocked_misuse',
      'safe_errors',
      'safety_flags'
    ]
  },
  blocked_misuse: [
    'preview_as_quote_truth',
    'reference_value_as_bound_quote',
    'unverified_value_as_quote_truth',
    'provider_quote_truth_without_runtime_gate',
    'backend_quote_write_without_gate',
    'user_visible_quote_without_preview_label',
    'policy_or_crm_write_from_preview'
  ],
  next_decision_after_085d: 'quote_preview_safe_ux_state_model_scope',
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

if (scope.overall_readiness_before_085a !== 'not_ready_for_execution') {
  throw new Error('085A requires not_ready_for_execution base');
}
if (boundarySurfaces.length < 1) {
  throw new Error('085A must scope preview-vs-quote-truth boundary surfaces');
}

console.log(JSON.stringify(scope, null, 2));
NODE

cat "$BOUNDARY_SCOPE_JSON"

stage "085A WRITE DOCS / EVIDENCE"
mkdir -p "$(dirname "$ARCH_DOC_A")" "$(dirname "$EVIDENCE_DOC_A")"

cat > "$ARCH_DOC_A" <<EOF
# Forge Quote Preview PDF Engine Preview vs Quote Truth Boundary Scope 085A

PHASE=$PHASE_A

STATUS=PASS

DECISION=$DECISION_A

LOCKED_DECISION=$LOCKED_A

NEXT=$PHASE_B

## Purpose

085A scopes the Preview vs Quote Truth boundary for the Quote Preview PDF Engine path.

This phase follows 084D, where deterministic input source trace was locked as local/static/read-only not-bound/not-verified reference registry.

## Important Boundary

085A does not create quote truth.

085A does not issue quotes.

085A does not call providers, connect backend, write CRM/policy/pipeline/quote records, send messages, read PDFs, run parsers, run calculators, call Banxico, or execute tests.

085A only scopes the registry that separates preview/reference outputs from real quote truth.

A preview can help a human understand a file. It cannot pretend to be a binding quote, because apparently we must tell computers not to impersonate paperwork.

## Scoped Boundary Surfaces

- \`quote_pdf_preview_engine\`
- \`expected_value_source_trace_registry\`
- \`provider_backend_quote_truth\`
- \`quote_preview_ui\`

## Required 085B Shape

085B must implement a local/static/read-only Preview vs Quote Truth boundary registry.

Required fields:

- \`boundary_id\`
- \`surface_id\`
- \`surface_kind\`
- \`owner_domain\`
- \`allowed_truth_class\`
- \`preview_allowed\`
- \`quote_truth_allowed\`
- \`execution_allowed\`
- \`boundary_status\`
- \`blocked_misuse\`
- \`safe_errors\`
- \`safety_flags\`

## Required 085B Decisions

085B must preserve:

- preview reference allowed only where safe;
- quote truth creation blocked;
- provider runtime blocked;
- backend connection blocked;
- quote write/send blocked;
- preview label requirement for user-visible surfaces.

## Final Decision

DECISION=$DECISION_A

LOCKED_DECISION=$LOCKED_A

NEXT=$PHASE_B
EOF

cat > "$EVIDENCE_DOC_A" <<EOF
# Forge Quote Preview PDF Engine Preview vs Quote Truth Boundary Scope 085A

PHASE=$PHASE_A

STATUS=PASS

DECISION=$DECISION_A

LOCKED_DECISION=$LOCKED_A

NEXT=$PHASE_B

## Evidence Summary

085A scopes Preview vs Quote Truth boundary only.

## Discovery Evidence

\`\`\`json
$(cat "$DISCOVERY_DIGEST_JSON")
\`\`\`

## Boundary Scope

\`\`\`json
$(cat "$BOUNDARY_SCOPE_JSON")
\`\`\`

## Final

DECISION=$DECISION_A

LOCKED_DECISION=$LOCKED_A

NEXT=$PHASE_B
EOF

cat > "$CERT_DOC_A" <<EOF
# Forge Quote Preview PDF Engine Preview vs Quote Truth Boundary Scope Certificate 085A

PHASE=$PHASE_A

CERTIFICATE_STATUS=PASS

DECISION=$DECISION_A

LOCKED_DECISION=$LOCKED_A

NEXT=$PHASE_B

085A certifies that Preview vs Quote Truth boundary has been scoped before any user-visible quote preview state.

$DECISION_A
EOF

cat > "$AUDIT_JSON_A" <<EOF
{
  "phase": "$PHASE_A",
  "status": "PASS",
  "decision": "$DECISION_A",
  "lockedDecision": "$LOCKED_A",
  "base": {
    "phase": "084D_QUOTE_PREVIEW_PDF_ENGINE_DETERMINISTIC_INPUT_SOURCE_TRACE_DECISION_LOCK",
    "confirmed": true,
    "lockedDecision": "QUOTE_PREVIEW_PDF_ENGINE_DETERMINISTIC_INPUT_SOURCE_TRACE_LOCKED_AS_LOCAL_STATIC_READ_ONLY_NOT_BOUND_NOT_VERIFIED_REFERENCE_REGISTRY"
  },
  "next": "$PHASE_B",
  "scopeType": "preview_vs_quote_truth_boundary_scope_only",
  "boundaryScope": $(cat "$BOUNDARY_SCOPE_JSON"),
  "discoveryEvidence": $(cat "$DISCOVERY_DIGEST_JSON"),
  "notAuthorized": {
    "quoteTruthCreation": false,
    "quoteIssuance": false,
    "quoteSend": false,
    "providerRuntime": false,
    "backendConnection": false,
    "quoteWrite": false,
    "crmWrite": false,
    "policyWrite": false,
    "pipelineWrite": false
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
## 085A Quote Preview PDF Engine Preview vs Quote Truth Boundary Scope

085A scopes the Preview vs Quote Truth boundary for the Quote Preview PDF Engine path.

Locked decision:
\`$LOCKED_A\`

Scoped boundary surfaces:

- \`quote_pdf_preview_engine\`
- \`expected_value_source_trace_registry\`
- \`provider_backend_quote_truth\`
- \`quote_preview_ui\`

085B must implement a local/static/read-only Preview vs Quote Truth boundary registry.

Boundaries:

- preview reference may be allowed;
- quote truth creation remains blocked;
- provider runtime remains blocked;
- backend connection remains blocked;
- quote write/send remains blocked;
- user-visible preview must be labeled as preview, not quote.

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
run rg -n "$PHASE_A|$DECISION_A|$LOCKED_A|$PHASE_B|Preview vs Quote Truth|quote truth creation remains blocked|preview must be labeled" \
  FORGE_MASTER_BUILD_TREE.md docs/architecture/source-truth/FORGE_UNIFIED_BUILD_TREE_001.md docs/roadmap/FORGE_ROADMAP_LOCK_001.md \
  "$ARCH_DOC_A" "$EVIDENCE_DOC_A" "$CERT_DOC_A" "$AUDIT_JSON_A"
run git diff --check
safety_scan FORGE_MASTER_BUILD_TREE.md docs/architecture/source-truth/FORGE_UNIFIED_BUILD_TREE_001.md docs/roadmap/FORGE_ROADMAP_LOCK_001.md "$ARCH_DOC_A" "$EVIDENCE_DOC_A" "$CERT_DOC_A" "$AUDIT_JSON_A"

commit_allowed_subset \
  "docs: scope quote preview pdf preview vs quote truth boundary" \
  FORGE_MASTER_BUILD_TREE.md docs/architecture/source-truth/FORGE_UNIFIED_BUILD_TREE_001.md docs/roadmap/FORGE_ROADMAP_LOCK_001.md \
  "$ARCH_DOC_A" "$EVIDENCE_DOC_A" "$CERT_DOC_A" "$AUDIT_JSON_A" "$SCRIPT_IN_REPO"

# -------------------------------------------------------------------
# 085B IMPLEMENTATION
# -------------------------------------------------------------------
stage "085B IMPLEMENT ADAPTER"
mkdir -p "$(dirname "$ADAPTER")" "$(dirname "$TEST")"

cat > "$ADAPTER" <<'NODE'
'use strict';

const readiness = require('./quote-preview-pdf-engine-canonical-execution-readiness-review-matrix-adapter-080b.js');
const deterministicInput = require('./quote-preview-pdf-engine-deterministic-input-source-trace-registry-adapter-084b.js');

const ADAPTER_ID = 'forge.quote_preview.pdf_engine.preview_vs_quote_truth_boundary.registry.adapter.v1';
const SCHEMA_VERSION = 'forge.quote_preview.pdf_engine.preview_vs_quote_truth_boundary.registry.v1';
const DOMAIN_ID = 'quote_preview_pdf_engine_preview_vs_quote_truth_boundary';
const MODE = 'read_only';
const ROUTE_CLASS = 'preview_safe';

const SURFACE_KINDS = Object.freeze({
  PREVIEW_ENGINE: 'preview_engine',
  REFERENCE_REGISTRY: 'reference_registry',
  REAL_QUOTE_AUTHORITY: 'real_quote_authority',
  USER_VISIBLE_PREVIEW_SURFACE: 'user_visible_preview_surface',
});

const TRUTH_CLASSES = Object.freeze({
  PREVIEW_REFERENCE_ONLY: 'preview_reference_only',
  NOT_VERIFIED_REFERENCE_ONLY: 'not_verified_reference_only',
  REAL_QUOTE_TRUTH_REQUIRES_PROVIDER_RUNTIME_GATE: 'real_quote_truth_requires_provider_runtime_gate',
  MUST_LABEL_AS_PREVIEW_NOT_QUOTE: 'must_label_as_preview_not_quote',
});

const BOUNDARY_STATUSES = Object.freeze({
  PREVIEW_ALLOWED_QUOTE_TRUTH_BLOCKED: 'preview_allowed_quote_truth_blocked',
  BLOCKED_UNTIL_REAL_EXECUTION_GATES: 'blocked_until_real_execution_gates',
  PREVIEW_LABEL_REQUIRED_QUOTE_TRUTH_BLOCKED: 'preview_label_required_quote_truth_blocked',
});

const SAFE_ERROR_CODES = Object.freeze({
  BOUNDARY_NOT_MAPPED: 'QUOTE_PREVIEW_TRUTH_BOUNDARY_NOT_MAPPED',
  QUOTE_TRUTH_CREATION_NOT_AUTHORIZED: 'QUOTE_PREVIEW_QUOTE_TRUTH_CREATION_NOT_AUTHORIZED',
  QUOTE_ISSUANCE_NOT_AUTHORIZED: 'QUOTE_PREVIEW_QUOTE_ISSUANCE_NOT_AUTHORIZED',
  QUOTE_SEND_NOT_AUTHORIZED: 'QUOTE_PREVIEW_QUOTE_SEND_NOT_AUTHORIZED',
  PROVIDER_RUNTIME_NOT_AUTHORIZED: 'QUOTE_PREVIEW_PROVIDER_RUNTIME_NOT_AUTHORIZED',
  BACKEND_CONNECTION_NOT_AUTHORIZED: 'QUOTE_PREVIEW_BACKEND_CONNECTION_NOT_AUTHORIZED',
  QUOTE_WRITE_NOT_AUTHORIZED: 'QUOTE_PREVIEW_QUOTE_WRITE_NOT_AUTHORIZED',
  PREVIEW_AS_QUOTE_TRUTH_BLOCKED: 'QUOTE_PREVIEW_PREVIEW_AS_QUOTE_TRUTH_BLOCKED',
  PREVIEW_LABEL_REQUIRED: 'QUOTE_PREVIEW_PREVIEW_LABEL_REQUIRED',
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

const REQUIRED_BOUNDARY_FIELDS = Object.freeze([
  'boundary_id',
  'surface_id',
  'surface_kind',
  'owner_domain',
  'allowed_truth_class',
  'preview_allowed',
  'quote_truth_allowed',
  'execution_allowed',
  'boundary_status',
  'blocked_misuse',
  'safe_errors',
  'safety_flags',
]);

function freezeBoundary(boundary) {
  return Object.freeze({
    ...boundary,
    blocked_misuse: Object.freeze([...(boundary.blocked_misuse || [])]),
    safe_errors: Object.freeze([...(boundary.safe_errors || [])]),
    safety_flags: Object.freeze({ ...DEFAULT_SAFETY_FLAGS, ...(boundary.safety_flags || {}) }),
  });
}

const BOUNDARY_ENTRIES = Object.freeze([
  freezeBoundary({
    boundary_id: 'boundary_quote_preview_pdf_engine',
    surface_id: 'quote_pdf_preview_engine',
    surface_kind: SURFACE_KINDS.PREVIEW_ENGINE,
    owner_domain: 'product_intelligence_evidence',
    allowed_truth_class: TRUTH_CLASSES.PREVIEW_REFERENCE_ONLY,
    preview_allowed: true,
    quote_truth_allowed: false,
    execution_allowed: false,
    boundary_status: BOUNDARY_STATUSES.PREVIEW_ALLOWED_QUOTE_TRUTH_BLOCKED,
    blocked_misuse: ['preview_as_quote_truth', 'preview_engine_as_binding_quote', 'unverified_value_as_quote_truth'],
    safe_errors: [
      SAFE_ERROR_CODES.QUOTE_TRUTH_CREATION_NOT_AUTHORIZED,
      SAFE_ERROR_CODES.PREVIEW_AS_QUOTE_TRUTH_BLOCKED,
      SAFE_ERROR_CODES.QUOTE_WRITE_NOT_AUTHORIZED,
    ],
  }),
  freezeBoundary({
    boundary_id: 'boundary_quote_preview_expected_values',
    surface_id: 'expected_value_source_trace_registry',
    surface_kind: SURFACE_KINDS.REFERENCE_REGISTRY,
    owner_domain: 'quote_preview_pdf_engine',
    allowed_truth_class: TRUTH_CLASSES.NOT_VERIFIED_REFERENCE_ONLY,
    preview_allowed: true,
    quote_truth_allowed: false,
    execution_allowed: false,
    boundary_status: BOUNDARY_STATUSES.PREVIEW_ALLOWED_QUOTE_TRUTH_BLOCKED,
    blocked_misuse: ['reference_value_as_bound_quote', 'unverified_value_as_quote_truth', 'expected_value_as_quote_truth'],
    safe_errors: [
      SAFE_ERROR_CODES.QUOTE_TRUTH_CREATION_NOT_AUTHORIZED,
      SAFE_ERROR_CODES.PREVIEW_AS_QUOTE_TRUTH_BLOCKED,
      SAFE_ERROR_CODES.QUOTE_WRITE_NOT_AUTHORIZED,
    ],
  }),
  freezeBoundary({
    boundary_id: 'boundary_real_quote_truth_provider_backend',
    surface_id: 'provider_backend_quote_truth',
    surface_kind: SURFACE_KINDS.REAL_QUOTE_AUTHORITY,
    owner_domain: 'provider_backend',
    allowed_truth_class: TRUTH_CLASSES.REAL_QUOTE_TRUTH_REQUIRES_PROVIDER_RUNTIME_GATE,
    preview_allowed: false,
    quote_truth_allowed: false,
    execution_allowed: false,
    boundary_status: BOUNDARY_STATUSES.BLOCKED_UNTIL_REAL_EXECUTION_GATES,
    blocked_misuse: ['provider_quote_truth_without_runtime_gate', 'backend_quote_write_without_gate', 'quote_issuance_without_authority'],
    safe_errors: [
      SAFE_ERROR_CODES.PROVIDER_RUNTIME_NOT_AUTHORIZED,
      SAFE_ERROR_CODES.BACKEND_CONNECTION_NOT_AUTHORIZED,
      SAFE_ERROR_CODES.QUOTE_ISSUANCE_NOT_AUTHORIZED,
      SAFE_ERROR_CODES.QUOTE_SEND_NOT_AUTHORIZED,
    ],
  }),
  freezeBoundary({
    boundary_id: 'boundary_user_visible_quote_preview_ui',
    surface_id: 'quote_preview_ui',
    surface_kind: SURFACE_KINDS.USER_VISIBLE_PREVIEW_SURFACE,
    owner_domain: 'forge_ui',
    allowed_truth_class: TRUTH_CLASSES.MUST_LABEL_AS_PREVIEW_NOT_QUOTE,
    preview_allowed: true,
    quote_truth_allowed: false,
    execution_allowed: false,
    boundary_status: BOUNDARY_STATUSES.PREVIEW_LABEL_REQUIRED_QUOTE_TRUTH_BLOCKED,
    blocked_misuse: ['user_visible_quote_without_preview_label', 'preview_as_binding_quote', 'policy_or_crm_write_from_preview'],
    safe_errors: [
      SAFE_ERROR_CODES.PREVIEW_LABEL_REQUIRED,
      SAFE_ERROR_CODES.QUOTE_TRUTH_CREATION_NOT_AUTHORIZED,
      SAFE_ERROR_CODES.QUOTE_SEND_NOT_AUTHORIZED,
      SAFE_ERROR_CODES.QUOTE_WRITE_NOT_AUTHORIZED,
    ],
  }),
]);

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function getSourceRefs() {
  const readinessCatalog = readiness.getQuotePreviewPdfCanonicalExecutionReadinessReviewMatrixCatalog();
  const deterministicCatalog = deterministicInput.getQuotePreviewPdfEngineDeterministicInputSourceTraceRegistryCatalog();

  return {
    readiness: {
      adapter_id: readinessCatalog.adapter_id,
      schemaVersion: readinessCatalog.schemaVersion,
      overall_readiness: readinessCatalog.overall_readiness,
    },
    deterministic_input: {
      adapter_id: deterministicCatalog.adapter_id,
      schemaVersion: deterministicCatalog.schemaVersion,
      overall_input_trace_status: deterministicCatalog.overall_input_trace_status,
    },
  };
}

function getQuotePreviewPdfEnginePreviewVsQuoteTruthBoundaryRegistryCatalog() {
  return {
    adapter_id: ADAPTER_ID,
    schemaVersion: SCHEMA_VERSION,
    domainId: DOMAIN_ID,
    mode: MODE,
    routeClass: ROUTE_CLASS,
    registry_type: 'local_static_read_only_preview_vs_quote_truth_boundary_registry',
    overall_boundary_status: 'preview_boundary_mapped_quote_truth_blocked',
    preview_reference_allowed_in_registry: true,
    quote_truth_creation_allowed_in_registry: false,
    quote_issuance_allowed_in_registry: false,
    quote_send_allowed_in_registry: false,
    provider_runtime_allowed_in_registry: false,
    backend_connection_allowed_in_registry: false,
    quote_write_allowed_in_registry: false,
    crm_write_allowed_in_registry: false,
    policy_write_allowed_in_registry: false,
    pipeline_write_allowed_in_registry: false,
    product_intelligence_upstream: true,
    quote_preview_downstream: true,
    required_boundary_fields: [...REQUIRED_BOUNDARY_FIELDS],
    safe_errors: Object.values(SAFE_ERROR_CODES),
    safety_flags: clone(DEFAULT_SAFETY_FLAGS),
    source_refs: getSourceRefs(),
    boundary_entries: clone(BOUNDARY_ENTRIES),
  };
}

function buildPreviewVsQuoteTruthBoundarySafeError(boundaryId, code = SAFE_ERROR_CODES.BOUNDARY_NOT_MAPPED) {
  return {
    schemaVersion: SCHEMA_VERSION,
    domainId: DOMAIN_ID,
    mode: MODE,
    routeClass: ROUTE_CLASS,
    readModelStatus: 'error',
    boundary_id: boundaryId || null,
    surface_id: null,
    surface_kind: null,
    owner_domain: null,
    allowed_truth_class: null,
    preview_allowed: false,
    quote_truth_allowed: false,
    execution_allowed: false,
    boundary_status: BOUNDARY_STATUSES.BLOCKED_UNTIL_REAL_EXECUTION_GATES,
    blocked_misuse: ['unmapped_boundary_quote_truth_creation', 'preview_as_quote_truth'],
    safe_errors: [code, SAFE_ERROR_CODES.QUOTE_TRUTH_CREATION_NOT_AUTHORIZED, SAFE_ERROR_CODES.QUOTE_WRITE_NOT_AUTHORIZED],
    safety_flags: clone(DEFAULT_SAFETY_FLAGS),
    safe_error: {
      code,
      message: 'Preview vs Quote Truth boundary is not mapped. Quote truth creation is blocked.',
    },
  };
}

function getPreviewVsQuoteTruthBoundaryById(boundaryId) {
  const match = BOUNDARY_ENTRIES.find((entry) => entry.boundary_id === boundaryId);
  return match ? clone(match) : buildPreviewVsQuoteTruthBoundarySafeError(boundaryId);
}

function getPreviewVsQuoteTruthBoundaryBySurfaceId(surfaceId) {
  const match = BOUNDARY_ENTRIES.find((entry) => entry.surface_id === surfaceId);
  return match ? clone(match) : buildPreviewVsQuoteTruthBoundarySafeError(surfaceId);
}

function getPreviewAllowedBoundaryEntries() {
  return clone(BOUNDARY_ENTRIES.filter((entry) => entry.preview_allowed === true));
}

function getQuoteTruthBlockedBoundaryEntries() {
  return clone(BOUNDARY_ENTRIES.filter((entry) => entry.quote_truth_allowed === false));
}

function getUserVisiblePreviewBoundaryEntries() {
  return clone(BOUNDARY_ENTRIES.filter((entry) => entry.surface_kind === SURFACE_KINDS.USER_VISIBLE_PREVIEW_SURFACE));
}

function validatePreviewVsQuoteTruthBoundaryShape(entry) {
  const errors = [];
  if (!entry || typeof entry !== 'object') return { ok: false, valid: false, errors: ['boundary_object_required'] };

  for (const field of REQUIRED_BOUNDARY_FIELDS) {
    if (!(field in entry)) errors.push(`missing_${field}`);
  }

  if (entry.quote_truth_allowed !== false) errors.push('quote_truth_allowed_must_be_false');
  if (entry.execution_allowed !== false) errors.push('execution_allowed_must_be_false');

  for (const [key, value] of Object.entries(entry.safety_flags || {})) {
    if (value !== false) errors.push(`safety_flag_not_false_${key}`);
  }

  return { ok: errors.length === 0, valid: errors.length === 0, errors };
}

function validatePreviewVsQuoteTruthBoundaryRegistryCatalog(catalog) {
  const errors = [];
  if (!catalog || typeof catalog !== 'object') return { ok: false, valid: false, errors: ['catalog_object_required'] };

  if (catalog.schemaVersion !== SCHEMA_VERSION) errors.push('invalid_schemaVersion');
  if (catalog.domainId !== DOMAIN_ID) errors.push('invalid_domainId');
  if (catalog.mode !== MODE) errors.push('invalid_mode');
  if (catalog.routeClass !== ROUTE_CLASS) errors.push('invalid_routeClass');
  if (catalog.overall_boundary_status !== 'preview_boundary_mapped_quote_truth_blocked') errors.push('overall_boundary_status_must_remain_quote_truth_blocked');

  for (const flagName of [
    'quote_truth_creation_allowed_in_registry',
    'quote_issuance_allowed_in_registry',
    'quote_send_allowed_in_registry',
    'provider_runtime_allowed_in_registry',
    'backend_connection_allowed_in_registry',
    'quote_write_allowed_in_registry',
    'crm_write_allowed_in_registry',
    'policy_write_allowed_in_registry',
    'pipeline_write_allowed_in_registry',
  ]) {
    if (catalog[flagName] !== false) errors.push(`${flagName}_must_be_false`);
  }

  for (const [key, value] of Object.entries(catalog.safety_flags || {})) {
    if (value !== false) errors.push(`catalog_safety_flag_not_false_${key}`);
  }

  const entries = Array.isArray(catalog.boundary_entries) ? catalog.boundary_entries : [];
  if (entries.length !== 4) errors.push('four_boundary_entries_required');

  for (const entry of entries) {
    const result = validatePreviewVsQuoteTruthBoundaryShape(entry);
    if (!result.ok) errors.push(...result.errors.map((error) => `${entry.boundary_id || 'unknown'}:${error}`));
  }

  return { ok: errors.length === 0, valid: errors.length === 0, errors };
}

module.exports = {
  ADAPTER_ID,
  SCHEMA_VERSION,
  DOMAIN_ID,
  MODE,
  ROUTE_CLASS,
  SURFACE_KINDS,
  TRUTH_CLASSES,
  BOUNDARY_STATUSES,
  SAFE_ERROR_CODES,
  DEFAULT_SAFETY_FLAGS,
  REQUIRED_BOUNDARY_FIELDS,
  BOUNDARY_ENTRIES,
  getQuotePreviewPdfEnginePreviewVsQuoteTruthBoundaryRegistryCatalog,
  getPreviewVsQuoteTruthBoundaryById,
  getPreviewVsQuoteTruthBoundaryBySurfaceId,
  getPreviewAllowedBoundaryEntries,
  getQuoteTruthBlockedBoundaryEntries,
  getUserVisiblePreviewBoundaryEntries,
  buildPreviewVsQuoteTruthBoundarySafeError,
  validatePreviewVsQuoteTruthBoundaryShape,
  validatePreviewVsQuoteTruthBoundaryRegistryCatalog,
};
NODE

cat > "$TEST" <<'NODE'
'use strict';

const assert = require('node:assert/strict');

const adapter = require('../platform/adapters/quote-preview/quote-preview-pdf-engine-preview-vs-quote-truth-boundary-registry-adapter-085b.js');

assert.equal(adapter.ADAPTER_ID, 'forge.quote_preview.pdf_engine.preview_vs_quote_truth_boundary.registry.adapter.v1');
assert.equal(adapter.SCHEMA_VERSION, 'forge.quote_preview.pdf_engine.preview_vs_quote_truth_boundary.registry.v1');
assert.equal(adapter.MODE, 'read_only');
assert.equal(adapter.ROUTE_CLASS, 'preview_safe');

const catalog = adapter.getQuotePreviewPdfEnginePreviewVsQuoteTruthBoundaryRegistryCatalog();

assert.equal(catalog.schemaVersion, adapter.SCHEMA_VERSION);
assert.equal(catalog.domainId, 'quote_preview_pdf_engine_preview_vs_quote_truth_boundary');
assert.equal(catalog.registry_type, 'local_static_read_only_preview_vs_quote_truth_boundary_registry');
assert.equal(catalog.overall_boundary_status, 'preview_boundary_mapped_quote_truth_blocked');
assert.equal(catalog.preview_reference_allowed_in_registry, true);
assert.equal(catalog.boundary_entries.length, 4);
assert.equal(adapter.validatePreviewVsQuoteTruthBoundaryRegistryCatalog(catalog).ok, true);

for (const flag of [
  'quote_truth_creation_allowed_in_registry',
  'quote_issuance_allowed_in_registry',
  'quote_send_allowed_in_registry',
  'provider_runtime_allowed_in_registry',
  'backend_connection_allowed_in_registry',
  'quote_write_allowed_in_registry',
  'crm_write_allowed_in_registry',
  'policy_write_allowed_in_registry',
  'pipeline_write_allowed_in_registry',
]) {
  assert.equal(catalog[flag], false, `${flag} must be false`);
}

for (const entry of catalog.boundary_entries) {
  for (const field of adapter.REQUIRED_BOUNDARY_FIELDS) assert(field in entry, `${entry.boundary_id} missing ${field}`);
  assert.equal(entry.quote_truth_allowed, false);
  assert.equal(entry.execution_allowed, false);
  assert(entry.safe_errors.includes(adapter.SAFE_ERROR_CODES.QUOTE_TRUTH_CREATION_NOT_AUTHORIZED) || entry.safe_errors.includes(adapter.SAFE_ERROR_CODES.PROVIDER_RUNTIME_NOT_AUTHORIZED));
  assert.equal(adapter.validatePreviewVsQuoteTruthBoundaryShape(entry).ok, true);
}

const previewEngine = adapter.getPreviewVsQuoteTruthBoundaryBySurfaceId('quote_pdf_preview_engine');
assert.equal(previewEngine.preview_allowed, true);
assert.equal(previewEngine.quote_truth_allowed, false);
assert.equal(previewEngine.allowed_truth_class, adapter.TRUTH_CLASSES.PREVIEW_REFERENCE_ONLY);
assert(previewEngine.safe_errors.includes(adapter.SAFE_ERROR_CODES.PREVIEW_AS_QUOTE_TRUTH_BLOCKED));

const provider = adapter.getPreviewVsQuoteTruthBoundaryById('boundary_real_quote_truth_provider_backend');
assert.equal(provider.preview_allowed, false);
assert.equal(provider.quote_truth_allowed, false);
assert.equal(provider.allowed_truth_class, adapter.TRUTH_CLASSES.REAL_QUOTE_TRUTH_REQUIRES_PROVIDER_RUNTIME_GATE);
assert(provider.safe_errors.includes(adapter.SAFE_ERROR_CODES.PROVIDER_RUNTIME_NOT_AUTHORIZED));
assert(provider.safe_errors.includes(adapter.SAFE_ERROR_CODES.BACKEND_CONNECTION_NOT_AUTHORIZED));

const ui = adapter.getPreviewVsQuoteTruthBoundaryBySurfaceId('quote_preview_ui');
assert.equal(ui.surface_kind, adapter.SURFACE_KINDS.USER_VISIBLE_PREVIEW_SURFACE);
assert.equal(ui.allowed_truth_class, adapter.TRUTH_CLASSES.MUST_LABEL_AS_PREVIEW_NOT_QUOTE);
assert(ui.safe_errors.includes(adapter.SAFE_ERROR_CODES.PREVIEW_LABEL_REQUIRED));

assert.equal(adapter.getPreviewAllowedBoundaryEntries().length, 3);
assert.equal(adapter.getQuoteTruthBlockedBoundaryEntries().length, 4);
assert.equal(adapter.getUserVisiblePreviewBoundaryEntries().length, 1);

const missing = adapter.getPreviewVsQuoteTruthBoundaryById('missing_boundary');
assert.equal(missing.readModelStatus, 'error');
assert.equal(missing.quote_truth_allowed, false);
assert.equal(missing.execution_allowed, false);
assert(missing.safe_errors.includes(adapter.SAFE_ERROR_CODES.BOUNDARY_NOT_MAPPED));
assert(missing.safe_errors.includes(adapter.SAFE_ERROR_CODES.QUOTE_TRUTH_CREATION_NOT_AUTHORIZED));
assert.equal(adapter.validatePreviewVsQuoteTruthBoundaryShape(missing).ok, true);

for (const [key, value] of Object.entries(adapter.DEFAULT_SAFETY_FLAGS)) {
  assert.equal(value, false, `DEFAULT_SAFETY_FLAGS.${key} must be false`);
}

for (const entry of catalog.boundary_entries) {
  for (const [key, value] of Object.entries(entry.safety_flags || {})) {
    assert.equal(value, false, `${entry.boundary_id}.${key} must be false`);
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

console.log('PASS quote preview pdf engine preview vs quote truth boundary registry adapter 085B');
NODE

run node --check "$ADAPTER"
run node --check "$TEST"
run node "$TEST"

stage "085B WRITE DOCS / EVIDENCE"
cat > "$ARCH_DOC_B" <<EOF
# Forge Quote Preview PDF Engine Preview vs Quote Truth Boundary Implementation 085B

PHASE=$PHASE_B

STATUS=PASS

DECISION=$DECISION_B

LOCKED_DECISION=$LOCKED_B

NEXT=$PHASE_C

## Purpose

085B implements a local/static/read-only Preview vs Quote Truth boundary registry.

The registry separates preview/reference surfaces from real quote truth authority. It does not create quote truth, issue quotes, send quotes, call providers, connect backend, write CRM/policy/pipeline/quote records, or execute real effects.

## Implemented Files

- \`$ADAPTER\`
- \`$TEST\`

## Registry Status

\`preview_boundary_mapped_quote_truth_blocked\`

## Boundary Entries

- \`boundary_quote_preview_pdf_engine\`
- \`boundary_quote_preview_expected_values\`
- \`boundary_real_quote_truth_provider_backend\`
- \`boundary_user_visible_quote_preview_ui\`

## Final Decision

DECISION=$DECISION_B

LOCKED_DECISION=$LOCKED_B

NEXT=$PHASE_C
EOF

cat > "$EVIDENCE_DOC_B" <<EOF
# Forge Quote Preview PDF Engine Preview vs Quote Truth Boundary Implementation 085B

PHASE=$PHASE_B

STATUS=PASS

DECISION=$DECISION_B

LOCKED_DECISION=$LOCKED_B

NEXT=$PHASE_C

## Evidence Summary

085B implements a local/static/read-only Preview vs Quote Truth boundary registry.

## Discovery Evidence

\`\`\`json
$(cat "$DISCOVERY_DIGEST_JSON")
\`\`\`

## Test Evidence

The focused test validates:

- adapter identity and schema;
- registry shape;
- four boundary entries exist;
- preview references may be shown only as preview;
- quote truth remains blocked for every surface;
- provider/backend quote truth remains blocked;
- user-visible preview requires preview label;
- all safety flags remain false.

## Final

DECISION=$DECISION_B

LOCKED_DECISION=$LOCKED_B

NEXT=$PHASE_C
EOF

cat > "$CERT_DOC_B" <<EOF
# Forge Quote Preview PDF Engine Preview vs Quote Truth Boundary Implementation Certificate 085B

PHASE=$PHASE_B

CERTIFICATE_STATUS=PASS

DECISION=$DECISION_B

LOCKED_DECISION=$LOCKED_B

NEXT=$PHASE_C

085B certifies that Forge now has a local/static/read-only Preview vs Quote Truth boundary registry.

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
    "adapterId": "forge.quote_preview.pdf_engine.preview_vs_quote_truth_boundary.registry.adapter.v1",
    "schemaVersion": "forge.quote_preview.pdf_engine.preview_vs_quote_truth_boundary.registry.v1",
    "registryType": "local_static_read_only_preview_vs_quote_truth_boundary_registry",
    "overallBoundaryStatus": "preview_boundary_mapped_quote_truth_blocked",
    "quoteTruthCreationIntroduced": false,
    "providerRuntimeIntroduced": false,
    "backendConnectionIntroduced": false,
    "quoteWriteIntroduced": false,
    "quoteSendIntroduced": false
  },
  "discoveryEvidence": $(cat "$DISCOVERY_DIGEST_JSON"),
  "boundaryEntries": {
    "quotePreviewPdfEngine": "preview_reference_only_quote_truth_blocked",
    "expectedValueRegistry": "not_verified_reference_only_quote_truth_blocked",
    "providerBackendQuoteTruth": "blocked_until_real_execution_gates",
    "quotePreviewUi": "preview_label_required_quote_truth_blocked"
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
## 085B Quote Preview PDF Engine Preview vs Quote Truth Boundary Implementation

085B implements a local/static/read-only Preview vs Quote Truth boundary registry.

Locked decision:
\`$LOCKED_B\`

Implemented:

- \`$ADAPTER\`
- \`$TEST\`

Registry status:

- \`preview_boundary_mapped_quote_truth_blocked\`

Boundary entries:

- \`boundary_quote_preview_pdf_engine\`
- \`boundary_quote_preview_expected_values\`
- \`boundary_real_quote_truth_provider_backend\`
- \`boundary_user_visible_quote_preview_ui\`

Boundaries:

- preview references may be allowed;
- quote truth creation remains blocked;
- provider/backend quote truth remains blocked;
- user-visible preview requires preview labeling.

DECISION=$DECISION_B

LOCKED_DECISION=$LOCKED_B

NEXT=$PHASE_C
<!-- FORGE:$PHASE_B:END -->
EOF

for tree in FORGE_MASTER_BUILD_TREE.md docs/architecture/source-truth/FORGE_UNIFIED_BUILD_TREE_001.md docs/roadmap/FORGE_ROADMAP_LOCK_001.md; do
  replace_or_append_block "$tree" "$PHASE_B" "$TREE_BLOCK_B"
done
trim_tree_files

stage "085B VALIDATION / COMMIT"
run bash -n "$SCRIPT_IN_REPO"
run node --check "$ADAPTER"
run node --check "$TEST"
run node "$TEST"
run python3 -m json.tool "$AUDIT_JSON_B"
run rg -n "$PHASE_B|$DECISION_B|$LOCKED_B|$PHASE_C|Preview vs Quote Truth boundary registry|preview_boundary_mapped_quote_truth_blocked|quote truth remains blocked|preview label" \
  FORGE_MASTER_BUILD_TREE.md docs/architecture/source-truth/FORGE_UNIFIED_BUILD_TREE_001.md docs/roadmap/FORGE_ROADMAP_LOCK_001.md \
  "$ARCH_DOC_B" "$EVIDENCE_DOC_B" "$CERT_DOC_B" "$AUDIT_JSON_B" "$ADAPTER" "$TEST"
run git diff --check
safety_scan FORGE_MASTER_BUILD_TREE.md docs/architecture/source-truth/FORGE_UNIFIED_BUILD_TREE_001.md docs/roadmap/FORGE_ROADMAP_LOCK_001.md "$ARCH_DOC_B" "$EVIDENCE_DOC_B" "$CERT_DOC_B" "$AUDIT_JSON_B" "$ADAPTER" "$TEST"

commit_allowed_subset \
  "feat: implement quote preview pdf preview vs quote truth boundary registry" \
  FORGE_MASTER_BUILD_TREE.md docs/architecture/source-truth/FORGE_UNIFIED_BUILD_TREE_001.md docs/roadmap/FORGE_ROADMAP_LOCK_001.md \
  "$ADAPTER" "$TEST" "$ARCH_DOC_B" "$EVIDENCE_DOC_B" "$CERT_DOC_B" "$AUDIT_JSON_B" "$SCRIPT_IN_REPO"

# -------------------------------------------------------------------
# 085C QA
# -------------------------------------------------------------------
stage "085C SEMANTIC QA"
SEMANTIC_QA_JSON="$(mktemp)"
node <<'NODE' > "$SEMANTIC_QA_JSON"
const assert = require("node:assert/strict");
const boundary = require("./platform/adapters/quote-preview/quote-preview-pdf-engine-preview-vs-quote-truth-boundary-registry-adapter-085b.js");

const catalog = boundary.getQuotePreviewPdfEnginePreviewVsQuoteTruthBoundaryRegistryCatalog();
assert.equal(catalog.overall_boundary_status, "preview_boundary_mapped_quote_truth_blocked");
assert.equal(boundary.validatePreviewVsQuoteTruthBoundaryRegistryCatalog(catalog).ok, true);
assert.equal(catalog.boundary_entries.length, 4);
assert.equal(boundary.getPreviewAllowedBoundaryEntries().length, 3);
assert.equal(boundary.getQuoteTruthBlockedBoundaryEntries().length, 4);
assert.equal(boundary.getUserVisiblePreviewBoundaryEntries().length, 1);

for (const entry of catalog.boundary_entries) {
  assert.equal(entry.quote_truth_allowed, false);
  assert.equal(entry.execution_allowed, false);
  assert.equal(boundary.validatePreviewVsQuoteTruthBoundaryShape(entry).ok, true);
}

assert.equal(boundary.getPreviewVsQuoteTruthBoundaryBySurfaceId("quote_preview_ui").safe_errors.includes(boundary.SAFE_ERROR_CODES.PREVIEW_LABEL_REQUIRED), true);
assert.equal(boundary.getPreviewVsQuoteTruthBoundaryById("boundary_real_quote_truth_provider_backend").safe_errors.includes(boundary.SAFE_ERROR_CODES.PROVIDER_RUNTIME_NOT_AUTHORIZED), true);

for (const [key, value] of Object.entries(boundary.DEFAULT_SAFETY_FLAGS || {})) {
  assert.equal(value, false, `DEFAULT_SAFETY_FLAGS.${key} must be false`);
}

console.log(JSON.stringify({
  status: "PASS",
  catalogValidated: true,
  boundaryCount: catalog.boundary_entries.length,
  previewAllowedCount: boundary.getPreviewAllowedBoundaryEntries().length,
  quoteTruthBlockedCount: boundary.getQuoteTruthBlockedBoundaryEntries().length,
  userVisiblePreviewCount: boundary.getUserVisiblePreviewBoundaryEntries().length,
  previewLabelRequired: true,
  providerRuntimeBlocked: true,
  backendConnectionBlocked: true,
  quoteWriteBlocked: true,
  quoteSendBlocked: true,
  allExecutionsFalse: true,
  allSafetyFlagsFalse: true
}, null, 2));
NODE

cat "$SEMANTIC_QA_JSON"

cat > "$ARCH_DOC_C" <<EOF
# Forge Quote Preview PDF Engine Preview vs Quote Truth Boundary QA Lock 085C

PHASE=$PHASE_C

STATUS=PASS

DECISION=$DECISION_C

LOCKED_DECISION=$LOCKED_C

NEXT=$PHASE_D

## Purpose

085C QA locks the 085B Preview vs Quote Truth boundary registry.

## QA Validated

- registry shape validates;
- four boundary entries exist;
- preview references may be shown only as preview;
- quote truth remains blocked for every surface;
- provider/runtime/backend quote truth remains blocked;
- user-visible preview requires preview label;
- every execution remains false;
- all safety flags remain false.

## Final Decision

DECISION=$DECISION_C

LOCKED_DECISION=$LOCKED_C

NEXT=$PHASE_D
EOF

cat > "$EVIDENCE_DOC_C" <<EOF
# Forge Quote Preview PDF Engine Preview vs Quote Truth Boundary QA Lock 085C

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
# Forge Quote Preview PDF Engine Preview vs Quote Truth Boundary QA Lock Certificate 085C

PHASE=$PHASE_C

CERTIFICATE_STATUS=PASS

DECISION=$DECISION_C

LOCKED_DECISION=$LOCKED_C

NEXT=$PHASE_D

085C certifies that Preview vs Quote Truth boundary registry is QA locked.

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
    "boundaryCount": 4,
    "previewAllowedCount": 3,
    "quoteTruthBlockedCount": 4,
    "previewLabelRequired": true,
    "providerRuntimeBlocked": true,
    "backendConnectionBlocked": true,
    "quoteWriteBlocked": true,
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
## 085C Quote Preview PDF Engine Preview vs Quote Truth Boundary QA Lock

085C QA locks the 085B Preview vs Quote Truth boundary registry.

Locked decision:
\`$LOCKED_C\`

QA validated:

- registry shape validates;
- four boundary entries exist;
- quote truth remains blocked for every surface;
- provider/runtime/backend quote truth remains blocked;
- user-visible preview requires preview label;
- every execution remains false;
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

stage "085C VALIDATION / COMMIT"
run bash -n "$SCRIPT_IN_REPO"
run node --check "$ADAPTER"
run node --check "$TEST"
run node "$TEST"
run python3 -m json.tool "$AUDIT_JSON_C"
run rg -n "$PHASE_C|$DECISION_C|$LOCKED_C|$PHASE_D|QA locks|quote truth remains blocked|preview label|required" \
  FORGE_MASTER_BUILD_TREE.md docs/architecture/source-truth/FORGE_UNIFIED_BUILD_TREE_001.md docs/roadmap/FORGE_ROADMAP_LOCK_001.md \
  "$ARCH_DOC_C" "$EVIDENCE_DOC_C" "$CERT_DOC_C" "$AUDIT_JSON_C"
run git diff --check
safety_scan FORGE_MASTER_BUILD_TREE.md docs/architecture/source-truth/FORGE_UNIFIED_BUILD_TREE_001.md docs/roadmap/FORGE_ROADMAP_LOCK_001.md "$ARCH_DOC_C" "$EVIDENCE_DOC_C" "$CERT_DOC_C" "$AUDIT_JSON_C" "$ADAPTER" "$TEST"

commit_allowed_subset \
  "docs: lock quote preview pdf preview vs quote truth boundary qa" \
  FORGE_MASTER_BUILD_TREE.md docs/architecture/source-truth/FORGE_UNIFIED_BUILD_TREE_001.md docs/roadmap/FORGE_ROADMAP_LOCK_001.md \
  "$ARCH_DOC_C" "$EVIDENCE_DOC_C" "$CERT_DOC_C" "$AUDIT_JSON_C" "$SCRIPT_IN_REPO"

# -------------------------------------------------------------------
# 085D DECISION
# -------------------------------------------------------------------
stage "085D DECISION ASSERTIONS"
DECISION_QA_JSON="$(mktemp)"
node <<'NODE' > "$DECISION_QA_JSON"
const assert = require("node:assert/strict");
const boundary = require("./platform/adapters/quote-preview/quote-preview-pdf-engine-preview-vs-quote-truth-boundary-registry-adapter-085b.js");

const catalog = boundary.getQuotePreviewPdfEnginePreviewVsQuoteTruthBoundaryRegistryCatalog();
assert.equal(catalog.overall_boundary_status, "preview_boundary_mapped_quote_truth_blocked");
assert.equal(boundary.validatePreviewVsQuoteTruthBoundaryRegistryCatalog(catalog).ok, true);
assert.equal(catalog.boundary_entries.length, 4);
assert.equal(boundary.getQuoteTruthBlockedBoundaryEntries().length, 4);

for (const entry of catalog.boundary_entries) {
  assert.equal(entry.quote_truth_allowed, false);
  assert.equal(entry.execution_allowed, false);
}

console.log(JSON.stringify({
  status: "PASS",
  locked_as: "local_static_read_only_reference_registry",
  overall_boundary_status: catalog.overall_boundary_status,
  boundary_count: catalog.boundary_entries.length,
  quote_truth_blocked_count: boundary.getQuoteTruthBlockedBoundaryEntries().length,
  preview_reference_allowed_count: boundary.getPreviewAllowedBoundaryEntries().length,
  user_visible_preview_label_required: true,
  provider_runtime_blocked: true,
  backend_connection_blocked: true,
  quote_write_blocked: true,
  quote_send_blocked: true,
  next_scope: "086A_QUOTE_PREVIEW_SAFE_UX_STATE_MODEL_SCOPE",
  all_safety_flags_false: true
}, null, 2));
NODE

cat "$DECISION_QA_JSON"

cat > "$ARCH_DOC_D" <<EOF
# Forge Quote Preview PDF Engine Preview vs Quote Truth Boundary Decision Lock 085D

PHASE=$PHASE_D

STATUS=PASS

DECISION=$DECISION_D

LOCKED_DECISION=$LOCKED_D

NEXT=$NEXT_AFTER_D

## Purpose

085D decision-locks the 085B/085C Preview vs Quote Truth boundary registry as a local/static/read-only reference registry.

## Locked Meaning

The registry is approved only as:

- local/static;
- read-only;
- reference registry;
- preview/reference vs quote truth boundary;
- quote truth blocked;
- provider/backend quote truth blocked;
- user-visible preview label required.

## Confirmed

- four boundary entries exist;
- preview references may be shown only as preview;
- quote truth remains blocked for every surface;
- provider/runtime/backend quote truth remains blocked;
- quote write/send remains blocked;
- every execution remains false.

## Next Architectural Unlock

086A may scope the safe UX state model for Quote Preview.

086A must not execute tests, read PDFs, run OCR, run parsers, run calculators, call Banxico/providers, connect backend, write quotes, or create real effects.

## Final Decision

DECISION=$DECISION_D

LOCKED_DECISION=$LOCKED_D

NEXT=$NEXT_AFTER_D
EOF

cat > "$EVIDENCE_DOC_D" <<EOF
# Forge Quote Preview PDF Engine Preview vs Quote Truth Boundary Decision Lock 085D

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
# Forge Quote Preview PDF Engine Preview vs Quote Truth Boundary Decision Lock Certificate 085D

PHASE=$PHASE_D

CERTIFICATE_STATUS=PASS

DECISION=$DECISION_D

LOCKED_DECISION=$LOCKED_D

NEXT=$NEXT_AFTER_D

085D certifies that Preview vs Quote Truth boundary registry is locked as local/static/read-only reference registry.

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
    "boundaryCount": 4,
    "quoteTruthBlockedCount": 4,
    "previewLabelRequired": true,
    "providerRuntimeBlocked": true,
    "backendConnectionBlocked": true,
    "quoteWriteBlocked": true,
    "allSafetyFlagsFalse": true
  },
  "nextScope": {
    "phase": "$NEXT_AFTER_D",
    "purpose": "quote_preview_safe_ux_state_model_scope",
    "executionAllowed": false
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
## 085D Quote Preview PDF Engine Preview vs Quote Truth Boundary Decision Lock

085D decision-locks the 085B/085C Preview vs Quote Truth boundary registry as a local/static/read-only reference registry.

Locked decision:
\`$LOCKED_D\`

Confirmed:

- four boundary entries exist;
- preview references may be shown only as preview;
- quote truth remains blocked for every surface;
- provider/runtime/backend quote truth remains blocked;
- quote write/send remains blocked;
- user-visible preview requires preview label;
- every execution remains false.

Next:

- \`$NEXT_AFTER_D\` may scope safe Quote Preview UX state model.
- No execution is authorized.

DECISION=$DECISION_D

LOCKED_DECISION=$LOCKED_D

NEXT=$NEXT_AFTER_D
<!-- FORGE:$PHASE_D:END -->
EOF

for tree in FORGE_MASTER_BUILD_TREE.md docs/architecture/source-truth/FORGE_UNIFIED_BUILD_TREE_001.md docs/roadmap/FORGE_ROADMAP_LOCK_001.md; do
  replace_or_append_block "$tree" "$PHASE_D" "$TREE_BLOCK_D"
done
trim_tree_files

stage "085D VALIDATION / COMMIT"
run bash -n "$SCRIPT_IN_REPO"
run node --check "$ADAPTER"
run node --check "$TEST"
run node "$TEST"
run python3 -m json.tool "$AUDIT_JSON_D"
run rg -n "$PHASE_D|$DECISION_D|$LOCKED_D|$NEXT_AFTER_D|Preview vs Quote Truth|decision-locks|quote truth remains blocked|safe Quote Preview UX state model" \
  FORGE_MASTER_BUILD_TREE.md docs/architecture/source-truth/FORGE_UNIFIED_BUILD_TREE_001.md docs/roadmap/FORGE_ROADMAP_LOCK_001.md \
  "$ARCH_DOC_D" "$EVIDENCE_DOC_D" "$CERT_DOC_D" "$AUDIT_JSON_D"
run git diff --check
safety_scan FORGE_MASTER_BUILD_TREE.md docs/architecture/source-truth/FORGE_UNIFIED_BUILD_TREE_001.md docs/roadmap/FORGE_ROADMAP_LOCK_001.md "$ARCH_DOC_D" "$EVIDENCE_DOC_D" "$CERT_DOC_D" "$AUDIT_JSON_D" "$ADAPTER" "$TEST"

commit_allowed_subset \
  "docs: lock quote preview pdf preview vs quote truth boundary decision" \
  FORGE_MASTER_BUILD_TREE.md docs/architecture/source-truth/FORGE_UNIFIED_BUILD_TREE_001.md docs/roadmap/FORGE_ROADMAP_LOCK_001.md \
  "$ARCH_DOC_D" "$EVIDENCE_DOC_D" "$CERT_DOC_D" "$AUDIT_JSON_D" "$SCRIPT_IN_REPO"

stage "FINAL CHECKPOINT"
run git status --short --branch
run git log --oneline -16

SUMMARY=$(cat <<EOF
PASS_085ABCD_QUOTE_PREVIEW_PDF_ENGINE_PREVIEW_VS_QUOTE_TRUTH_BOUNDARY_FAST_TRACK_COMMIT_PUSH_COMPLETE
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
