#!/usr/bin/env bash
set -euo pipefail

CHAIN="083ABCD_QUOTE_PREVIEW_PDF_ENGINE_PARSER_OWNERSHIP_FAST_TRACK"
REPO="${REPO:-/storage/emulated/0/Forge OS}"
STAMP="$(date +%Y%m%d_%H%M%S)"
REPORT="/data/data/com.termux/files/home/${CHAIN}_RESULT_${STAMP}.md"
BACKUP_DIR=".forge-backups/083abcd-parser-ownership-fast-track-${STAMP}"
SCRIPT_IN_REPO="tools/termux/forge_083abcd_quote_preview_pdf_engine_parser_ownership_fast_track.sh"

PHASE_A="083A_QUOTE_PREVIEW_PDF_ENGINE_PARSER_OWNERSHIP_SCOPE"
DECISION_A="PASS_083A_QUOTE_PREVIEW_PDF_ENGINE_PARSER_OWNERSHIP_SCOPE"
LOCKED_A="QUOTE_PREVIEW_PDF_ENGINE_PARSER_OWNERSHIP_SCOPED"

PHASE_B="083B_QUOTE_PREVIEW_PDF_ENGINE_PARSER_OWNERSHIP_IMPLEMENTATION"
DECISION_B="PASS_083B_QUOTE_PREVIEW_PDF_ENGINE_PARSER_OWNERSHIP_IMPLEMENTATION"
LOCKED_B="QUOTE_PREVIEW_PDF_ENGINE_PARSER_OWNERSHIP_LOCAL_STATIC_READ_ONLY_IMPLEMENTED"

PHASE_C="083C_QUOTE_PREVIEW_PDF_ENGINE_PARSER_OWNERSHIP_QA_LOCK"
DECISION_C="PASS_083C_QUOTE_PREVIEW_PDF_ENGINE_PARSER_OWNERSHIP_QA_LOCK"
LOCKED_C="QUOTE_PREVIEW_PDF_ENGINE_PARSER_OWNERSHIP_QA_LOCKED"

PHASE_D="083D_QUOTE_PREVIEW_PDF_ENGINE_PARSER_OWNERSHIP_DECISION_LOCK"
DECISION_D="PASS_083D_QUOTE_PREVIEW_PDF_ENGINE_PARSER_OWNERSHIP_DECISION_LOCK"
LOCKED_D="QUOTE_PREVIEW_PDF_ENGINE_PARSER_OWNERSHIP_LOCKED_AS_LOCAL_STATIC_READ_ONLY_REFERENCE_REGISTRY"
NEXT_AFTER_D="084A_QUOTE_PREVIEW_PDF_ENGINE_DETERMINISTIC_INPUT_SOURCE_TRACE_SCOPE"

BOUNDARY="no UI mutation; no backend real; no CRM/policy/quote/pipeline writes; no task/calendar/message; no provider execution with effects; no auth/secrets/browser persistence; no real engine execution; no parser/calculator/Banxico/PDF/OCR execution; no PDF file read; no hash computation over PDFs; no expected-value verification; no parser invocation; no invented product/premium/coverage/projection/quote truth; no new extractor/parser/calculator; no real test execution"

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

ADAPTER="platform/adapters/quote-preview/quote-preview-pdf-engine-parser-ownership-registry-adapter-083b.js"
TEST="tests/quote-preview-pdf-engine-parser-ownership-registry-adapter-083b-test.js"

ARCH_DOC_A="docs/architecture/source-truth/FORGE_QUOTE_PREVIEW_PDF_ENGINE_PARSER_OWNERSHIP_SCOPE_083A.md"
EVIDENCE_DOC_A="docs/evidence/FORGE_QUOTE_PREVIEW_PDF_ENGINE_PARSER_OWNERSHIP_SCOPE_083A.md"
CERT_DOC_A="docs/evidence/FORGE_QUOTE_PREVIEW_PDF_ENGINE_PARSER_OWNERSHIP_SCOPE_CERTIFICATE_083A.md"
AUDIT_JSON_A="docs/evidence/forge-quote-preview-pdf-engine-parser-ownership-scope-audit-083a.json"

ARCH_DOC_B="docs/architecture/source-truth/FORGE_QUOTE_PREVIEW_PDF_ENGINE_PARSER_OWNERSHIP_IMPLEMENTATION_083B.md"
EVIDENCE_DOC_B="docs/evidence/FORGE_QUOTE_PREVIEW_PDF_ENGINE_PARSER_OWNERSHIP_IMPLEMENTATION_083B.md"
CERT_DOC_B="docs/evidence/FORGE_QUOTE_PREVIEW_PDF_ENGINE_PARSER_OWNERSHIP_IMPLEMENTATION_CERTIFICATE_083B.md"
AUDIT_JSON_B="docs/evidence/forge-quote-preview-pdf-engine-parser-ownership-implementation-audit-083b.json"

ARCH_DOC_C="docs/architecture/source-truth/FORGE_QUOTE_PREVIEW_PDF_ENGINE_PARSER_OWNERSHIP_QA_LOCK_083C.md"
EVIDENCE_DOC_C="docs/evidence/FORGE_QUOTE_PREVIEW_PDF_ENGINE_PARSER_OWNERSHIP_QA_LOCK_083C.md"
CERT_DOC_C="docs/evidence/FORGE_QUOTE_PREVIEW_PDF_ENGINE_PARSER_OWNERSHIP_QA_LOCK_CERTIFICATE_083C.md"
AUDIT_JSON_C="docs/evidence/forge-quote-preview-pdf-engine-parser-ownership-qa-audit-083c.json"

ARCH_DOC_D="docs/architecture/source-truth/FORGE_QUOTE_PREVIEW_PDF_ENGINE_PARSER_OWNERSHIP_DECISION_LOCK_083D.md"
EVIDENCE_DOC_D="docs/evidence/FORGE_QUOTE_PREVIEW_PDF_ENGINE_PARSER_OWNERSHIP_DECISION_LOCK_083D.md"
CERT_DOC_D="docs/evidence/FORGE_QUOTE_PREVIEW_PDF_ENGINE_PARSER_OWNERSHIP_DECISION_LOCK_CERTIFICATE_083D.md"
AUDIT_JSON_D="docs/evidence/forge-quote-preview-pdf-engine-parser-ownership-decision-audit-083d.json"

CYAN="\033[1;36m"
GREEN="\033[1;38;5;46m"
YELLOW="\033[1;93m"
RED="\033[1;91m"
RESET="\033[0m"

stage(){ printf "\n${CYAN}========== %s ==========${RESET}\n" "$1"; }
pass(){ printf "${GREEN}PASS:${RESET} %s\n" "$1"; }
warn(){ printf "${YELLOW}WARN:${RESET} %s\n" "$1"; }
fail(){
  printf "${RED}HOLD:${RESET} %s\n" "$1"
  echo "DECISION=HOLD_${CHAIN}" | tee -a "$REPORT"
  echo "REPORT=$REPORT" | tee -a "$REPORT"
  exit 1
}
run(){
  echo
  echo "========== RUN =========="
  printf '%q ' "$@"
  echo
  "$@"
}

find_latest_discovery_json(){
  if [ -n "${DISCOVERY_JSON:-}" ] && [ -f "$DISCOVERY_JSON" ]; then
    printf "%s\n" "$DISCOVERY_JSON"
    return 0
  fi
  find /data/data/com.termux/files/home -path "*/forge-discovery-*/*DISCOVERY_077A_PRECHECK_EXISTING_QUOTE_PDF_TESTS_AND_ENGINES_REPORT_*.json" -type f 2>/dev/null | sort | tail -1
}

replace_or_append_block(){
  local path="$1"
  local phase="$2"
  local block_file="$3"
  python3 - <<PY "$path" "$phase" "$block_file"
from pathlib import Path
import sys
path = Path(sys.argv[1])
phase = sys.argv[2]
block = Path(sys.argv[3]).read_text()
text = path.read_text()
start = f"<!-- FORGE:{phase}:START -->"
end = f"<!-- FORGE:{phase}:END -->"
if start in text and end in text:
    before = text.split(start)[0]
    after = text.split(end, 1)[1]
    text = before.rstrip() + "\n\n" + block.strip() + "\n" + after
else:
    text = text.rstrip() + "\n\n" + block.strip() + "\n"
path.write_text(text.rstrip() + "\n")
PY
}

trim_tree_files(){
  python3 - <<'PYTRIM'
from pathlib import Path
for path in [
    Path("FORGE_MASTER_BUILD_TREE.md"),
    Path("docs/architecture/source-truth/FORGE_UNIFIED_BUILD_TREE_001.md"),
    Path("docs/roadmap/FORGE_ROADMAP_LOCK_001.md"),
]:
    path.write_text(path.read_text().rstrip() + "\n")
    print(f"trimmed EOF blanks: {path}")
PYTRIM
}

safety_scan(){
  local files=("$@")
  if rg -n 'localStorage|sessionStorage|fetch\(|XMLHttpRequest|navigator\.mediaDevices|SpeechRecognition|providerRuntimeEnabled:\s*true|networkCallsAllowed:\s*true|browserStorageEnabled:\s*true|mayCreateTruth:\s*true|maySendMessage:\s*true|mayWriteCrm:\s*true|mayCreateCalendarEvent:\s*true|runParser\s*:\s*true|executeParser\s*:\s*true|parserRuntimeEnabled\s*:\s*true' "${files[@]}"; then
    fail "safety scan found prohibited runtime/browser/network/parser marker"
  fi
  if rg -n '"?(crmWrite|pipelineWrite|policyWrite|quoteWrite|taskCreate|calendarCreate|messageSend|authReal|providerRuntime|secretAccess|browserPersistence|realEngineExecution|realEffectsAllowed|realEffectsEnabled|backendConnection|pdfRead|ocrExecution|parserExecution|calculatorExecution|banxicoCall|testExecution)"?\s*[:=]\s*true\b' "${files[@]}"; then
    fail "real-effect flag true found"
  fi
  pass "safety scan clean"
}

commit_allowed_subset(){
  local msg="$1"
  shift
  local allowed=("$@")
  git add "${allowed[@]}"
  run git diff --cached --name-only
  run git diff --cached --check

  local allowed_file staged_file unexpected
  allowed_file="$(mktemp)"
  staged_file="$(mktemp)"
  printf "%s\n" "${allowed[@]}" | sort > "$allowed_file"
  git diff --cached --name-only | sort > "$staged_file"

  unexpected="$(comm -23 "$staged_file" "$allowed_file" || true)"
  if [ -n "$unexpected" ]; then
    echo "$unexpected"
    fail "staged files include files outside authorized boundary"
  fi

  if [ ! -s "$staged_file" ]; then
    fail "no staged changes for commit"
  fi

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
echo "ROBOCOP_GATE=Article 0; 082D expected-value source trace closed; parser ownership fast-track only; no parser invocation"

cd "$REPO" || fail "No existe repo: $REPO"

stage "STAGE 1 CHECKPOINT"
run git status --short --branch
run git log --oneline -15
run git diff --name-status
run git diff --cached --name-status

stage "STAGE 2 CLEAN INDEX ONLY"
run git reset

stage "STAGE 3 CONFIRM BASE 082D"
if git log --oneline -120 | grep -Eq "082D|expected value source trace decision|QUOTE_PREVIEW_PDF_ENGINE_EXPECTED_VALUE_SOURCE_TRACE_LOCKED_AS_LOCAL_STATIC_READ_ONLY_NOT_BOUND_NOT_VERIFIED_REFERENCE_REGISTRY"; then
  pass "082D base found in git log"
elif [ -f "docs/evidence/forge-quote-preview-pdf-engine-expected-value-source-trace-decision-audit-082d.json" ]; then
  pass "082D audit fallback found"
else
  fail "082D base not found. Run 082B/C/D first."
fi

if [ -f "docs/evidence/forge-quote-preview-pdf-engine-expected-value-source-trace-decision-audit-082d.json" ]; then
  run python3 -m json.tool docs/evidence/forge-quote-preview-pdf-engine-expected-value-source-trace-decision-audit-082d.json
  if ! rg -n '"status"\s*:\s*"PASS"|"lockedDecision"\s*:\s*"QUOTE_PREVIEW_PDF_ENGINE_EXPECTED_VALUE_SOURCE_TRACE_LOCKED_AS_LOCAL_STATIC_READ_ONLY_NOT_BOUND_NOT_VERIFIED_REFERENCE_REGISTRY"|"next"\s*:\s*"083A_QUOTE_PREVIEW_PDF_ENGINE_PARSER_OWNERSHIP_SCOPE"' docs/evidence/forge-quote-preview-pdf-engine-expected-value-source-trace-decision-audit-082d.json >/dev/null; then
    fail "082D audit exists but does not confirm PASS/083A next"
  fi
  pass "082D audit PASS/083A next confirmed"
else
  warn "082D audit file not found; relying on git log/tree markers"
fi

stage "STAGE 4 DISCOVERY EVIDENCE"
DISCOVERY_JSON_FOUND="$(find_latest_discovery_json || true)"
if [ -z "$DISCOVERY_JSON_FOUND" ] || [ ! -f "$DISCOVERY_JSON_FOUND" ]; then
  fail "Discovery JSON not found. Run discovery first or set DISCOVERY_JSON=/path/report.json"
fi

DISCOVERY_DIGEST_JSON="$(mktemp)"
python3 - <<'PY' "$DISCOVERY_JSON_FOUND" "$DISCOVERY_DIGEST_JSON"
import json, sys
from pathlib import Path

source = Path(sys.argv[1])
target = Path(sys.argv[2])
data = json.loads(source.read_text())
rec = data.get("recommendation", {})

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
  "$SURFACES_ADAPTER"
  "$SURFACES_TEST"
  "$EVIDENCE_ADAPTER"
  "$EVIDENCE_TEST"
  "$PROVENANCE_ADAPTER"
  "$PROVENANCE_TEST"
  "$READINESS_ADAPTER"
  "$READINESS_TEST"
  "$FILE_HASH_ADAPTER"
  "$FILE_HASH_TEST"
  "$EXPECTED_TRACE_ADAPTER"
  "$EXPECTED_TRACE_TEST"
)

for f in "${REQUIRED_FILES[@]}"; do
  [ -f "$f" ] || fail "Missing required file: $f"
  pass "$f"
done

stage "STAGE 6 BACKUP"
mkdir -p "$BACKUP_DIR"
cp FORGE_MASTER_BUILD_TREE.md "$BACKUP_DIR/FORGE_MASTER_BUILD_TREE.md"
cp docs/architecture/source-truth/FORGE_UNIFIED_BUILD_TREE_001.md "$BACKUP_DIR/FORGE_UNIFIED_BUILD_TREE_001.md"
cp docs/roadmap/FORGE_ROADMAP_LOCK_001.md "$BACKUP_DIR/FORGE_ROADMAP_LOCK_001.md"
pass "$BACKUP_DIR"

stage "STAGE 7 BASE VALIDATION"
run node --check "$SURFACES_ADAPTER"
run node "$SURFACES_TEST"
run node --check "$EVIDENCE_ADAPTER"
run node "$EVIDENCE_TEST"
run node --check "$PROVENANCE_ADAPTER"
run node "$PROVENANCE_TEST"
run node --check "$READINESS_ADAPTER"
run node "$READINESS_TEST"
run node --check "$FILE_HASH_ADAPTER"
run node "$FILE_HASH_TEST"
run node --check "$EXPECTED_TRACE_ADAPTER"
run node "$EXPECTED_TRACE_TEST"

# -------------------------------------------------------------------
# 083A SCOPE
# -------------------------------------------------------------------
stage "083A BUILD SCOPE"
PARSER_SCOPE_JSON="$(mktemp)"
node <<'NODE' > "$PARSER_SCOPE_JSON"
const readiness = require('./platform/adapters/quote-preview/quote-preview-pdf-engine-canonical-execution-readiness-review-matrix-adapter-080b.js');
const expectedTrace = require('./platform/adapters/quote-preview/quote-preview-pdf-engine-expected-value-source-trace-registry-adapter-082b.js');

const readinessCatalog = readiness.getQuotePreviewPdfCanonicalExecutionReadinessReviewMatrixCatalog();
const expectedTraceCatalog = expectedTrace.getQuotePreviewPdfEngineExpectedValueSourceTraceRegistryCatalog();
const parserGate = readiness.getReadinessGateById('parser_ownership_resolved');

const parserCandidates = [
  {
    ownership_id: 'owner_policy_ocr_engine_reference',
    parser_surface_id: 'policy_ocr_engine',
    parser_kind: 'ocr_engine_reference',
    file_path: 'policy-operations/evidence/policy-ocr-engine.js',
    owner_domain: 'policy_operations_evidence',
    candidate_role: 'existing_ocr_engine_reference_only',
    ownership_status: 'existing_reference_not_parser_execution_owner',
    execution_allowed: false
  },
  {
    ownership_id: 'owner_solucionline_retirement_parser',
    parser_surface_id: 'solucionline_retirement_parser',
    parser_kind: 'retirement_pdf_parser',
    file_path: 'product-intelligence/evidence/solucionline-retirement-parser.js',
    owner_domain: 'product_intelligence_evidence',
    candidate_role: 'retirement_parser_candidate',
    ownership_status: 'decision_required',
    execution_allowed: false
  },
  {
    ownership_id: 'owner_gmm_quote_parser',
    parser_surface_id: 'gmm_quote_parser',
    parser_kind: 'gmm_pdf_parser',
    file_path: 'product-intelligence/evidence/gmm-quote-parser.js',
    owner_domain: 'product_intelligence_evidence',
    candidate_role: 'gmm_parser_candidate',
    ownership_status: 'decision_required',
    execution_allowed: false
  },
  {
    ownership_id: 'owner_quote_pdf_preview_engine',
    parser_surface_id: 'quote_pdf_preview_engine',
    parser_kind: 'preview_engine_not_parser_truth',
    file_path: 'product-intelligence/evidence/forge-quote-pdf-preview-engine.js',
    owner_domain: 'product_intelligence_evidence',
    candidate_role: 'preview_reference_only',
    ownership_status: 'not_parser_owner',
    execution_allowed: false
  }
];

const scope = {
  status: 'PASS',
  phase: '083A_QUOTE_PREVIEW_PDF_ENGINE_PARSER_OWNERSHIP_SCOPE',
  scope_type: 'parser_ownership_scope_only',
  base_readiness_gate: parserGate.gate_id,
  base_readiness_gate_status: parserGate.gate_status,
  base_readiness_decision: parserGate.readiness_decision,
  overall_readiness_before_083a: readinessCatalog.overall_readiness,
  expected_trace_registry_status_before_083a: expectedTraceCatalog.overall_trace_status,
  execution_allowed_in_083a: false,
  parser_execution_allowed_in_083a: false,
  pdf_read_allowed_in_083a: false,
  ocr_execution_allowed_in_083a: false,
  calculator_execution_allowed_in_083a: false,
  banxico_call_allowed_in_083a: false,
  provider_call_allowed_in_083a: false,
  test_execution_allowed_in_083a: false,
  backend_connection_allowed_in_083a: false,
  quote_write_allowed_in_083a: false,
  parser_candidate_count: parserCandidates.length,
  parser_candidates: parserCandidates,
  required_083b_output: {
    adapter_type: 'local_static_read_only_parser_ownership_registry',
    must_not_run_parsers: true,
    must_not_read_pdfs: true,
    must_not_run_ocr: true,
    must_not_run_calculators: true,
    must_not_call_banxico: true,
    must_not_execute_tests: true,
    must_not_connect_backend: true,
    must_record_ownership_only: true,
    must_preserve_execution_allowed_false: true,
    required_fields: [
      'ownership_id',
      'parser_surface_id',
      'parser_kind',
      'file_path',
      'owner_domain',
      'candidate_role',
      'ownership_status',
      'execution_allowed',
      'blocked_misuse',
      'safe_errors',
      'safety_flags'
    ]
  },
  blocked_misuse: [
    'duplicate_parser_creation',
    'parser_execution_disguised_as_ownership',
    'preview_engine_as_parser_truth',
    'ocr_engine_as_quote_truth',
    'fixture_as_real_pdf',
    'unowned_parser_execution',
    'new_parser_before_ownership_decision'
  ],
  next_decision_after_083d: 'deterministic_input_source_trace_scope',
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

if (scope.overall_readiness_before_083a !== 'not_ready_for_execution') {
  throw new Error('083A requires not_ready_for_execution base');
}
if (parserCandidates.length < 1) {
  throw new Error('083A must scope parser candidates');
}

console.log(JSON.stringify(scope, null, 2));
NODE

cat "$PARSER_SCOPE_JSON"

stage "083A WRITE DOCS / EVIDENCE"
mkdir -p "$(dirname "$ARCH_DOC_A")" "$(dirname "$EVIDENCE_DOC_A")"

cat > "$ARCH_DOC_A" <<EOF
# Forge Quote Preview PDF Engine Parser Ownership Scope 083A

PHASE=$PHASE_A

STATUS=PASS

DECISION=$DECISION_A

LOCKED_DECISION=$LOCKED_A

NEXT=$PHASE_B

## Purpose

083A scopes parser ownership for the Quote Preview PDF Engine path.

This phase follows 082D, where expected-value source trace was locked as local/static/read-only not-bound/not-verified reference registry.

083A addresses the blocking gate:

\`parser_ownership_resolved\`

## Important Boundary

083A does not run parsers.

083A does not read PDFs.

083A does not run OCR, calculators, Banxico, providers, backend, or tests.

083A only scopes the ownership registry required before any parser can be considered for future controlled execution. Yes, even parsers need an org chart now. Somehow this is progress.

## Scoped Parser Candidates

- \`policy-operations/evidence/policy-ocr-engine.js\`
- \`product-intelligence/evidence/solucionline-retirement-parser.js\`
- \`product-intelligence/evidence/gmm-quote-parser.js\`
- \`product-intelligence/evidence/forge-quote-pdf-preview-engine.js\`

## Required 083B Shape

083B must implement a local/static/read-only parser ownership registry.

Required fields:

- \`ownership_id\`
- \`parser_surface_id\`
- \`parser_kind\`
- \`file_path\`
- \`owner_domain\`
- \`candidate_role\`
- \`ownership_status\`
- \`execution_allowed\`
- \`blocked_misuse\`
- \`safe_errors\`
- \`safety_flags\`

## Required 083B Decisions

083B must preserve:

- \`execution_allowed=false\`
- no parser execution;
- no PDF read;
- no OCR execution;
- no calculator execution;
- no Banxico/provider call;
- no new parser creation;
- preview engine is not parser truth.

## Final Decision

DECISION=$DECISION_A

LOCKED_DECISION=$LOCKED_A

NEXT=$PHASE_B
EOF

cat > "$EVIDENCE_DOC_A" <<EOF
# Forge Quote Preview PDF Engine Parser Ownership Scope 083A

PHASE=$PHASE_A

STATUS=PASS

DECISION=$DECISION_A

LOCKED_DECISION=$LOCKED_A

NEXT=$PHASE_B

## Evidence Summary

083A scopes parser ownership only.

## Discovery Evidence

\`\`\`json
$(cat "$DISCOVERY_DIGEST_JSON")
\`\`\`

## Parser Ownership Scope

\`\`\`json
$(cat "$PARSER_SCOPE_JSON")
\`\`\`

## Final

DECISION=$DECISION_A

LOCKED_DECISION=$LOCKED_A

NEXT=$PHASE_B
EOF

cat > "$CERT_DOC_A" <<EOF
# Forge Quote Preview PDF Engine Parser Ownership Scope Certificate 083A

PHASE=$PHASE_A

CERTIFICATE_STATUS=PASS

DECISION=$DECISION_A

LOCKED_DECISION=$LOCKED_A

NEXT=$PHASE_B

083A certifies that parser ownership has been scoped before any parser execution gate.

$DECISION_A
EOF

cat > "$AUDIT_JSON_A" <<EOF
{
  "phase": "$PHASE_A",
  "status": "PASS",
  "decision": "$DECISION_A",
  "lockedDecision": "$LOCKED_A",
  "base": {
    "phase": "082D_QUOTE_PREVIEW_PDF_ENGINE_EXPECTED_VALUE_SOURCE_TRACE_DECISION_LOCK",
    "confirmed": true,
    "lockedDecision": "QUOTE_PREVIEW_PDF_ENGINE_EXPECTED_VALUE_SOURCE_TRACE_LOCKED_AS_LOCAL_STATIC_READ_ONLY_NOT_BOUND_NOT_VERIFIED_REFERENCE_REGISTRY"
  },
  "next": "$PHASE_B",
  "scopeType": "parser_ownership_scope_only",
  "parserOwnershipScope": $(cat "$PARSER_SCOPE_JSON"),
  "discoveryEvidence": $(cat "$DISCOVERY_DIGEST_JSON"),
  "notAuthorized": {
    "pdfRead": false,
    "ocrExecution": false,
    "parserExecution": false,
    "calculatorExecution": false,
    "banxicoCall": false,
    "providerCall": false,
    "testExecution": false,
    "backendConnection": false,
    "quoteWrite": false
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
## 083A Quote Preview PDF Engine Parser Ownership Scope

083A scopes parser ownership for the Quote Preview PDF Engine path.

Locked decision:
\`$LOCKED_A\`

Active blocking gate:

- \`parser_ownership_resolved\`

Scoped parser candidates:

- \`policy-operations/evidence/policy-ocr-engine.js\`
- \`product-intelligence/evidence/solucionline-retirement-parser.js\`
- \`product-intelligence/evidence/gmm-quote-parser.js\`
- \`product-intelligence/evidence/forge-quote-pdf-preview-engine.js\`

083B must implement a local/static/read-only parser ownership registry.

Boundaries:

- no parser execution;
- no PDF read;
- no OCR/calculator/Banxico/provider/test execution;
- no new parser creation;
- preview engine is not parser truth.

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
run rg -n "$PHASE_A|$DECISION_A|$LOCKED_A|$PHASE_B|parser ownership|parser_ownership_resolved|no parser execution|preview engine is not parser truth" \
  FORGE_MASTER_BUILD_TREE.md docs/architecture/source-truth/FORGE_UNIFIED_BUILD_TREE_001.md docs/roadmap/FORGE_ROADMAP_LOCK_001.md \
  "$ARCH_DOC_A" "$EVIDENCE_DOC_A" "$CERT_DOC_A" "$AUDIT_JSON_A"
run git diff --check
safety_scan FORGE_MASTER_BUILD_TREE.md docs/architecture/source-truth/FORGE_UNIFIED_BUILD_TREE_001.md docs/roadmap/FORGE_ROADMAP_LOCK_001.md "$ARCH_DOC_A" "$EVIDENCE_DOC_A" "$CERT_DOC_A" "$AUDIT_JSON_A"

commit_allowed_subset \
  "docs: scope quote preview pdf parser ownership" \
  FORGE_MASTER_BUILD_TREE.md docs/architecture/source-truth/FORGE_UNIFIED_BUILD_TREE_001.md docs/roadmap/FORGE_ROADMAP_LOCK_001.md \
  "$ARCH_DOC_A" "$EVIDENCE_DOC_A" "$CERT_DOC_A" "$AUDIT_JSON_A" "$SCRIPT_IN_REPO"

# -------------------------------------------------------------------
# 083B IMPLEMENTATION
# -------------------------------------------------------------------
stage "083B IMPLEMENT ADAPTER"
mkdir -p "$(dirname "$ADAPTER")" "$(dirname "$TEST")"

cat > "$ADAPTER" <<'NODE'
'use strict';

const readiness = require('./quote-preview-pdf-engine-canonical-execution-readiness-review-matrix-adapter-080b.js');
const expectedTrace = require('./quote-preview-pdf-engine-expected-value-source-trace-registry-adapter-082b.js');

const ADAPTER_ID = 'forge.quote_preview.pdf_engine.parser_ownership.registry.adapter.v1';
const SCHEMA_VERSION = 'forge.quote_preview.pdf_engine.parser_ownership.registry.v1';
const DOMAIN_ID = 'quote_preview_pdf_engine_parser_ownership';
const MODE = 'read_only';
const ROUTE_CLASS = 'preview_safe';

const OWNERSHIP_STATUSES = Object.freeze({
  EXISTING_REFERENCE_ONLY: 'existing_reference_only',
  DECISION_REQUIRED: 'decision_required',
  NOT_PARSER_OWNER: 'not_parser_owner',
});

const PARSER_KINDS = Object.freeze({
  OCR_ENGINE_REFERENCE: 'ocr_engine_reference',
  RETIREMENT_PDF_PARSER: 'retirement_pdf_parser',
  GMM_PDF_PARSER: 'gmm_pdf_parser',
  PREVIEW_ENGINE_NOT_PARSER_TRUTH: 'preview_engine_not_parser_truth',
});

const SAFE_ERROR_CODES = Object.freeze({
  OWNERSHIP_NOT_MAPPED: 'QUOTE_PREVIEW_PARSER_OWNERSHIP_NOT_MAPPED',
  PARSER_EXECUTION_NOT_AUTHORIZED: 'QUOTE_PREVIEW_PARSER_EXECUTION_NOT_AUTHORIZED',
  PDF_READ_NOT_AUTHORIZED: 'QUOTE_PREVIEW_PARSER_PDF_READ_NOT_AUTHORIZED',
  OCR_EXECUTION_NOT_AUTHORIZED: 'QUOTE_PREVIEW_PARSER_OCR_EXECUTION_NOT_AUTHORIZED',
  DUPLICATE_PARSER_CREATION_BLOCKED: 'QUOTE_PREVIEW_DUPLICATE_PARSER_CREATION_BLOCKED',
  PREVIEW_ENGINE_AS_PARSER_TRUTH_BLOCKED: 'QUOTE_PREVIEW_PREVIEW_ENGINE_AS_PARSER_TRUTH_BLOCKED',
  UNOWNED_PARSER_EXECUTION_BLOCKED: 'QUOTE_PREVIEW_UNOWNED_PARSER_EXECUTION_BLOCKED',
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

const REQUIRED_OWNERSHIP_FIELDS = Object.freeze([
  'ownership_id',
  'parser_surface_id',
  'parser_kind',
  'file_path',
  'owner_domain',
  'candidate_role',
  'ownership_status',
  'execution_allowed',
  'blocked_misuse',
  'safe_errors',
  'safety_flags',
]);

function freezeOwnership(entry) {
  return Object.freeze({
    ...entry,
    blocked_misuse: Object.freeze([...(entry.blocked_misuse || [])]),
    safe_errors: Object.freeze([...(entry.safe_errors || [])]),
    safety_flags: Object.freeze({ ...DEFAULT_SAFETY_FLAGS, ...(entry.safety_flags || {}) }),
  });
}

const PARSER_OWNERSHIP_ENTRIES = Object.freeze([
  freezeOwnership({
    ownership_id: 'owner_policy_ocr_engine_reference',
    parser_surface_id: 'policy_ocr_engine',
    parser_kind: PARSER_KINDS.OCR_ENGINE_REFERENCE,
    file_path: 'policy-operations/evidence/policy-ocr-engine.js',
    owner_domain: 'policy_operations_evidence',
    candidate_role: 'existing_ocr_engine_reference_only',
    ownership_status: OWNERSHIP_STATUSES.EXISTING_REFERENCE_ONLY,
    execution_allowed: false,
    blocked_misuse: ['ocr_engine_as_quote_truth', 'ocr_execution_before_pdf_file_hash_gate', 'ocr_execution_disguised_as_parser_ownership'],
    safe_errors: [
      SAFE_ERROR_CODES.OCR_EXECUTION_NOT_AUTHORIZED,
      SAFE_ERROR_CODES.PDF_READ_NOT_AUTHORIZED,
      SAFE_ERROR_CODES.PARSER_EXECUTION_NOT_AUTHORIZED,
    ],
  }),
  freezeOwnership({
    ownership_id: 'owner_solucionline_retirement_parser',
    parser_surface_id: 'solucionline_retirement_parser',
    parser_kind: PARSER_KINDS.RETIREMENT_PDF_PARSER,
    file_path: 'product-intelligence/evidence/solucionline-retirement-parser.js',
    owner_domain: 'product_intelligence_evidence',
    candidate_role: 'retirement_parser_candidate',
    ownership_status: OWNERSHIP_STATUSES.DECISION_REQUIRED,
    execution_allowed: false,
    blocked_misuse: ['parser_execution_disguised_as_ownership', 'new_parser_before_ownership_decision', 'unowned_parser_execution'],
    safe_errors: [
      SAFE_ERROR_CODES.PARSER_EXECUTION_NOT_AUTHORIZED,
      SAFE_ERROR_CODES.UNOWNED_PARSER_EXECUTION_BLOCKED,
      SAFE_ERROR_CODES.DUPLICATE_PARSER_CREATION_BLOCKED,
    ],
  }),
  freezeOwnership({
    ownership_id: 'owner_gmm_quote_parser',
    parser_surface_id: 'gmm_quote_parser',
    parser_kind: PARSER_KINDS.GMM_PDF_PARSER,
    file_path: 'product-intelligence/evidence/gmm-quote-parser.js',
    owner_domain: 'product_intelligence_evidence',
    candidate_role: 'gmm_parser_candidate',
    ownership_status: OWNERSHIP_STATUSES.DECISION_REQUIRED,
    execution_allowed: false,
    blocked_misuse: ['parser_execution_disguised_as_ownership', 'new_parser_before_ownership_decision', 'unowned_parser_execution'],
    safe_errors: [
      SAFE_ERROR_CODES.PARSER_EXECUTION_NOT_AUTHORIZED,
      SAFE_ERROR_CODES.UNOWNED_PARSER_EXECUTION_BLOCKED,
      SAFE_ERROR_CODES.DUPLICATE_PARSER_CREATION_BLOCKED,
    ],
  }),
  freezeOwnership({
    ownership_id: 'owner_quote_pdf_preview_engine',
    parser_surface_id: 'quote_pdf_preview_engine',
    parser_kind: PARSER_KINDS.PREVIEW_ENGINE_NOT_PARSER_TRUTH,
    file_path: 'product-intelligence/evidence/forge-quote-pdf-preview-engine.js',
    owner_domain: 'product_intelligence_evidence',
    candidate_role: 'preview_reference_only',
    ownership_status: OWNERSHIP_STATUSES.NOT_PARSER_OWNER,
    execution_allowed: false,
    blocked_misuse: ['preview_engine_as_parser_truth', 'preview_engine_as_quote_truth', 'parser_execution_disguised_as_preview'],
    safe_errors: [
      SAFE_ERROR_CODES.PREVIEW_ENGINE_AS_PARSER_TRUTH_BLOCKED,
      SAFE_ERROR_CODES.PARSER_EXECUTION_NOT_AUTHORIZED,
    ],
  }),
]);

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function getSourceRefs() {
  const readinessCatalog = readiness.getQuotePreviewPdfCanonicalExecutionReadinessReviewMatrixCatalog();
  const expectedTraceCatalog = expectedTrace.getQuotePreviewPdfEngineExpectedValueSourceTraceRegistryCatalog();
  return {
    readiness: {
      adapter_id: readinessCatalog.adapter_id,
      schemaVersion: readinessCatalog.schemaVersion,
      overall_readiness: readinessCatalog.overall_readiness,
    },
    expected_trace: {
      adapter_id: expectedTraceCatalog.adapter_id,
      schemaVersion: expectedTraceCatalog.schemaVersion,
      overall_trace_status: expectedTraceCatalog.overall_trace_status,
    },
  };
}

function getQuotePreviewPdfEngineParserOwnershipRegistryCatalog() {
  return {
    adapter_id: ADAPTER_ID,
    schemaVersion: SCHEMA_VERSION,
    domainId: DOMAIN_ID,
    mode: MODE,
    routeClass: ROUTE_CLASS,
    registry_type: 'local_static_read_only_parser_ownership_registry',
    overall_ownership_status: 'ownership_mapped_execution_blocked',
    parser_execution_allowed_in_registry: false,
    pdf_read_allowed_in_registry: false,
    ocr_execution_allowed_in_registry: false,
    calculator_execution_allowed_in_registry: false,
    banxico_call_allowed_in_registry: false,
    provider_call_allowed_in_registry: false,
    test_execution_allowed_in_registry: false,
    backend_connection_allowed_in_registry: false,
    quote_write_allowed_in_registry: false,
    product_intelligence_upstream: true,
    quote_preview_downstream: true,
    required_ownership_fields: [...REQUIRED_OWNERSHIP_FIELDS],
    safe_errors: Object.values(SAFE_ERROR_CODES),
    safety_flags: clone(DEFAULT_SAFETY_FLAGS),
    source_refs: getSourceRefs(),
    ownership_entries: clone(PARSER_OWNERSHIP_ENTRIES),
  };
}

function buildParserOwnershipSafeError(ownershipId, code = SAFE_ERROR_CODES.OWNERSHIP_NOT_MAPPED) {
  return {
    schemaVersion: SCHEMA_VERSION,
    domainId: DOMAIN_ID,
    mode: MODE,
    routeClass: ROUTE_CLASS,
    readModelStatus: 'error',
    ownership_id: ownershipId || null,
    parser_surface_id: null,
    parser_kind: null,
    file_path: null,
    owner_domain: null,
    candidate_role: null,
    ownership_status: OWNERSHIP_STATUSES.DECISION_REQUIRED,
    execution_allowed: false,
    blocked_misuse: ['unmapped_parser_ownership_execution', 'parser_execution_disguised_as_ownership'],
    safe_errors: [code, SAFE_ERROR_CODES.PARSER_EXECUTION_NOT_AUTHORIZED, SAFE_ERROR_CODES.UNOWNED_PARSER_EXECUTION_BLOCKED],
    safety_flags: clone(DEFAULT_SAFETY_FLAGS),
    safe_error: {
      code,
      message: 'Parser ownership is not mapped. Parser execution is blocked.',
    },
  };
}

function getParserOwnershipById(ownershipId) {
  const match = PARSER_OWNERSHIP_ENTRIES.find((entry) => entry.ownership_id === ownershipId);
  return match ? clone(match) : buildParserOwnershipSafeError(ownershipId);
}

function getParserOwnershipBySurfaceId(surfaceId) {
  const match = PARSER_OWNERSHIP_ENTRIES.find((entry) => entry.parser_surface_id === surfaceId);
  return match ? clone(match) : buildParserOwnershipSafeError(surfaceId);
}

function getParserOwnershipEntriesByStatus(status) {
  return clone(PARSER_OWNERSHIP_ENTRIES.filter((entry) => entry.ownership_status === status));
}

function getDecisionRequiredParserOwnershipEntries() {
  return getParserOwnershipEntriesByStatus(OWNERSHIP_STATUSES.DECISION_REQUIRED);
}

function getNonExecutableParserOwnershipEntries() {
  return clone(PARSER_OWNERSHIP_ENTRIES.filter((entry) => entry.execution_allowed === false));
}

function validateParserOwnershipShape(entry) {
  const errors = [];

  if (!entry || typeof entry !== 'object') {
    return { ok: false, valid: false, errors: ['parser_ownership_object_required'] };
  }

  for (const field of REQUIRED_OWNERSHIP_FIELDS) {
    if (!(field in entry)) errors.push(`missing_${field}`);
  }

  if (entry.execution_allowed !== false) errors.push('execution_allowed_must_be_false');

  for (const [key, value] of Object.entries(entry.safety_flags || {})) {
    if (value !== false) errors.push(`safety_flag_not_false_${key}`);
  }

  return {
    ok: errors.length === 0,
    valid: errors.length === 0,
    errors,
  };
}

function validateParserOwnershipRegistryCatalog(catalog) {
  const errors = [];

  if (!catalog || typeof catalog !== 'object') {
    return { ok: false, valid: false, errors: ['catalog_object_required'] };
  }

  if (catalog.schemaVersion !== SCHEMA_VERSION) errors.push('invalid_schemaVersion');
  if (catalog.domainId !== DOMAIN_ID) errors.push('invalid_domainId');
  if (catalog.mode !== MODE) errors.push('invalid_mode');
  if (catalog.routeClass !== ROUTE_CLASS) errors.push('invalid_routeClass');
  if (catalog.overall_ownership_status !== 'ownership_mapped_execution_blocked') errors.push('overall_ownership_status_must_remain_execution_blocked');

  for (const flagName of [
    'parser_execution_allowed_in_registry',
    'pdf_read_allowed_in_registry',
    'ocr_execution_allowed_in_registry',
    'calculator_execution_allowed_in_registry',
    'banxico_call_allowed_in_registry',
    'provider_call_allowed_in_registry',
    'test_execution_allowed_in_registry',
    'backend_connection_allowed_in_registry',
    'quote_write_allowed_in_registry',
  ]) {
    if (catalog[flagName] !== false) errors.push(`${flagName}_must_be_false`);
  }

  for (const [key, value] of Object.entries(catalog.safety_flags || {})) {
    if (value !== false) errors.push(`catalog_safety_flag_not_false_${key}`);
  }

  const entries = Array.isArray(catalog.ownership_entries) ? catalog.ownership_entries : [];
  if (entries.length !== 4) errors.push('four_parser_ownership_entries_required');

  for (const entry of entries) {
    const result = validateParserOwnershipShape(entry);
    if (!result.ok) errors.push(...result.errors.map((error) => `${entry.ownership_id || 'unknown'}:${error}`));
  }

  return {
    ok: errors.length === 0,
    valid: errors.length === 0,
    errors,
  };
}

module.exports = {
  ADAPTER_ID,
  SCHEMA_VERSION,
  DOMAIN_ID,
  MODE,
  ROUTE_CLASS,
  OWNERSHIP_STATUSES,
  PARSER_KINDS,
  SAFE_ERROR_CODES,
  DEFAULT_SAFETY_FLAGS,
  REQUIRED_OWNERSHIP_FIELDS,
  PARSER_OWNERSHIP_ENTRIES,
  getQuotePreviewPdfEngineParserOwnershipRegistryCatalog,
  getParserOwnershipById,
  getParserOwnershipBySurfaceId,
  getParserOwnershipEntriesByStatus,
  getDecisionRequiredParserOwnershipEntries,
  getNonExecutableParserOwnershipEntries,
  buildParserOwnershipSafeError,
  validateParserOwnershipShape,
  validateParserOwnershipRegistryCatalog,
};
NODE

cat > "$TEST" <<'NODE'
'use strict';

const assert = require('node:assert/strict');

const adapter = require('../platform/adapters/quote-preview/quote-preview-pdf-engine-parser-ownership-registry-adapter-083b.js');

assert.equal(adapter.ADAPTER_ID, 'forge.quote_preview.pdf_engine.parser_ownership.registry.adapter.v1');
assert.equal(adapter.SCHEMA_VERSION, 'forge.quote_preview.pdf_engine.parser_ownership.registry.v1');
assert.equal(adapter.MODE, 'read_only');
assert.equal(adapter.ROUTE_CLASS, 'preview_safe');

const catalog = adapter.getQuotePreviewPdfEngineParserOwnershipRegistryCatalog();

assert.equal(catalog.schemaVersion, adapter.SCHEMA_VERSION);
assert.equal(catalog.domainId, 'quote_preview_pdf_engine_parser_ownership');
assert.equal(catalog.registry_type, 'local_static_read_only_parser_ownership_registry');
assert.equal(catalog.overall_ownership_status, 'ownership_mapped_execution_blocked');
assert.equal(catalog.product_intelligence_upstream, true);
assert.equal(catalog.quote_preview_downstream, true);
assert.equal(catalog.ownership_entries.length, 4);
assert.equal(adapter.validateParserOwnershipRegistryCatalog(catalog).ok, true);

for (const flag of [
  'parser_execution_allowed_in_registry',
  'pdf_read_allowed_in_registry',
  'ocr_execution_allowed_in_registry',
  'calculator_execution_allowed_in_registry',
  'banxico_call_allowed_in_registry',
  'provider_call_allowed_in_registry',
  'test_execution_allowed_in_registry',
  'backend_connection_allowed_in_registry',
  'quote_write_allowed_in_registry',
]) {
  assert.equal(catalog[flag], false, `${flag} must be false`);
}

for (const entry of catalog.ownership_entries) {
  for (const field of adapter.REQUIRED_OWNERSHIP_FIELDS) {
    assert(field in entry, `${entry.ownership_id} missing ${field}`);
  }
  assert.equal(entry.execution_allowed, false);
  assert(entry.safe_errors.includes(adapter.SAFE_ERROR_CODES.PARSER_EXECUTION_NOT_AUTHORIZED));
  assert.equal(adapter.validateParserOwnershipShape(entry).ok, true);
}

const policy = adapter.getParserOwnershipById('owner_policy_ocr_engine_reference');
assert.equal(policy.parser_kind, adapter.PARSER_KINDS.OCR_ENGINE_REFERENCE);
assert.equal(policy.ownership_status, adapter.OWNERSHIP_STATUSES.EXISTING_REFERENCE_ONLY);
assert(policy.safe_errors.includes(adapter.SAFE_ERROR_CODES.OCR_EXECUTION_NOT_AUTHORIZED));

const retirement = adapter.getParserOwnershipById('owner_solucionline_retirement_parser');
assert.equal(retirement.parser_kind, adapter.PARSER_KINDS.RETIREMENT_PDF_PARSER);
assert.equal(retirement.ownership_status, adapter.OWNERSHIP_STATUSES.DECISION_REQUIRED);
assert(retirement.safe_errors.includes(adapter.SAFE_ERROR_CODES.UNOWNED_PARSER_EXECUTION_BLOCKED));

const gmm = adapter.getParserOwnershipBySurfaceId('gmm_quote_parser');
assert.equal(gmm.parser_kind, adapter.PARSER_KINDS.GMM_PDF_PARSER);
assert.equal(gmm.ownership_status, adapter.OWNERSHIP_STATUSES.DECISION_REQUIRED);

const preview = adapter.getParserOwnershipById('owner_quote_pdf_preview_engine');
assert.equal(preview.parser_kind, adapter.PARSER_KINDS.PREVIEW_ENGINE_NOT_PARSER_TRUTH);
assert.equal(preview.ownership_status, adapter.OWNERSHIP_STATUSES.NOT_PARSER_OWNER);
assert(preview.safe_errors.includes(adapter.SAFE_ERROR_CODES.PREVIEW_ENGINE_AS_PARSER_TRUTH_BLOCKED));

assert.equal(adapter.getDecisionRequiredParserOwnershipEntries().length, 2);
assert.equal(adapter.getNonExecutableParserOwnershipEntries().length, 4);

const missing = adapter.getParserOwnershipById('missing_parser_owner');
assert.equal(missing.readModelStatus, 'error');
assert.equal(missing.execution_allowed, false);
assert(missing.safe_errors.includes(adapter.SAFE_ERROR_CODES.OWNERSHIP_NOT_MAPPED));
assert(missing.safe_errors.includes(adapter.SAFE_ERROR_CODES.PARSER_EXECUTION_NOT_AUTHORIZED));
assert.equal(adapter.validateParserOwnershipShape(missing).ok, true);

for (const [key, value] of Object.entries(adapter.DEFAULT_SAFETY_FLAGS)) {
  assert.equal(value, false, `DEFAULT_SAFETY_FLAGS.${key} must be false`);
}

for (const entry of catalog.ownership_entries) {
  for (const [key, value] of Object.entries(entry.safety_flags || {})) {
    assert.equal(value, false, `${entry.ownership_id}.${key} must be false`);
  }
}

const combined = JSON.stringify({
  catalog,
  missing,
  flags: adapter.DEFAULT_SAFETY_FLAGS,
  safeErrors: adapter.SAFE_ERROR_CODES,
});

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

console.log('PASS quote preview pdf engine parser ownership registry adapter 083B');
NODE

run node --check "$ADAPTER"
run node --check "$TEST"
run node "$TEST"

stage "083B WRITE DOCS / EVIDENCE"
cat > "$ARCH_DOC_B" <<EOF
# Forge Quote Preview PDF Engine Parser Ownership Implementation 083B

PHASE=$PHASE_B

STATUS=PASS

DECISION=$DECISION_B

LOCKED_DECISION=$LOCKED_B

NEXT=$PHASE_C

## Purpose

083B implements a local/static/read-only parser ownership registry.

The registry records ownership and execution boundaries only. It does not run parsers, read PDFs, run OCR, run calculators, call Banxico, call providers, connect backend, write quotes, or execute real tests.

## Implemented Files

- \`$ADAPTER\`
- \`$TEST\`

## Registry Status

\`ownership_mapped_execution_blocked\`

## Ownership Entries

- \`owner_policy_ocr_engine_reference\`
- \`owner_solucionline_retirement_parser\`
- \`owner_gmm_quote_parser\`
- \`owner_quote_pdf_preview_engine\`

Every entry remains:

- \`execution_allowed=false\`

## Final Decision

DECISION=$DECISION_B

LOCKED_DECISION=$LOCKED_B

NEXT=$PHASE_C
EOF

cat > "$EVIDENCE_DOC_B" <<EOF
# Forge Quote Preview PDF Engine Parser Ownership Implementation 083B

PHASE=$PHASE_B

STATUS=PASS

DECISION=$DECISION_B

LOCKED_DECISION=$LOCKED_B

NEXT=$PHASE_C

## Evidence Summary

083B implements a local/static/read-only parser ownership registry.

## Discovery Evidence

\`\`\`json
$(cat "$DISCOVERY_DIGEST_JSON")
\`\`\`

## Test Evidence

The focused test validates:

- adapter identity and schema;
- registry shape;
- required ownership fields;
- all four parser ownership entries exist;
- decision-required parsers are marked correctly;
- preview engine is not parser truth;
- execution remains false;
- missing ownership returns safe error;
- all safety flags remain false.

## Final

DECISION=$DECISION_B

LOCKED_DECISION=$LOCKED_B

NEXT=$PHASE_C
EOF

cat > "$CERT_DOC_B" <<EOF
# Forge Quote Preview PDF Engine Parser Ownership Implementation Certificate 083B

PHASE=$PHASE_B

CERTIFICATE_STATUS=PASS

DECISION=$DECISION_B

LOCKED_DECISION=$LOCKED_B

NEXT=$PHASE_C

083B certifies that Forge now has a local/static/read-only parser ownership registry.

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
    "adapterId": "forge.quote_preview.pdf_engine.parser_ownership.registry.adapter.v1",
    "schemaVersion": "forge.quote_preview.pdf_engine.parser_ownership.registry.v1",
    "registryType": "local_static_read_only_parser_ownership_registry",
    "overallOwnershipStatus": "ownership_mapped_execution_blocked",
    "parserExecutionIntroduced": false,
    "pdfReadIntroduced": false,
    "ocrExecutionIntroduced": false,
    "calculatorExecutionIntroduced": false,
    "banxicoCallIntroduced": false,
    "testExecutionIntroduced": false,
    "backendConnectionIntroduced": false,
    "quoteTruthIntroduced": false,
    "newParserCreated": false
  },
  "discoveryEvidence": $(cat "$DISCOVERY_DIGEST_JSON"),
  "ownership": {
    "policyOcrEngineReference": "existing_reference_only",
    "solucionlineRetirementParser": "decision_required",
    "gmmQuoteParser": "decision_required",
    "quotePdfPreviewEngine": "not_parser_owner"
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
## 083B Quote Preview PDF Engine Parser Ownership Implementation

083B implements a local/static/read-only parser ownership registry.

Locked decision:
\`$LOCKED_B\`

Implemented:

- \`$ADAPTER\`
- \`$TEST\`

Registry status:

- \`ownership_mapped_execution_blocked\`

Ownership entries:

- \`owner_policy_ocr_engine_reference\`
- \`owner_solucionline_retirement_parser\`
- \`owner_gmm_quote_parser\`
- \`owner_quote_pdf_preview_engine\`

Boundaries:

- no parser execution;
- no PDF read;
- no OCR/calculator/Banxico/provider/test execution;
- no backend or quote write;
- no new parser creation.

DECISION=$DECISION_B

LOCKED_DECISION=$LOCKED_B

NEXT=$PHASE_C
<!-- FORGE:$PHASE_B:END -->
EOF

for tree in FORGE_MASTER_BUILD_TREE.md docs/architecture/source-truth/FORGE_UNIFIED_BUILD_TREE_001.md docs/roadmap/FORGE_ROADMAP_LOCK_001.md; do
  replace_or_append_block "$tree" "$PHASE_B" "$TREE_BLOCK_B"
done
trim_tree_files

stage "083B VALIDATION / COMMIT"
run bash -n "$SCRIPT_IN_REPO"
run node --check "$ADAPTER"
run node --check "$TEST"
run node "$TEST"
run python3 -m json.tool "$AUDIT_JSON_B"
run rg -n "$PHASE_B|$DECISION_B|$LOCKED_B|$PHASE_C|parser ownership registry|ownership_mapped_execution_blocked|execution_allowed=false|not parser truth|decision_required" \
  FORGE_MASTER_BUILD_TREE.md docs/architecture/source-truth/FORGE_UNIFIED_BUILD_TREE_001.md docs/roadmap/FORGE_ROADMAP_LOCK_001.md \
  "$ARCH_DOC_B" "$EVIDENCE_DOC_B" "$CERT_DOC_B" "$AUDIT_JSON_B" "$ADAPTER" "$TEST"
run git diff --check
safety_scan FORGE_MASTER_BUILD_TREE.md docs/architecture/source-truth/FORGE_UNIFIED_BUILD_TREE_001.md docs/roadmap/FORGE_ROADMAP_LOCK_001.md "$ARCH_DOC_B" "$EVIDENCE_DOC_B" "$CERT_DOC_B" "$AUDIT_JSON_B" "$ADAPTER" "$TEST"

commit_allowed_subset \
  "feat: implement quote preview pdf parser ownership registry" \
  FORGE_MASTER_BUILD_TREE.md docs/architecture/source-truth/FORGE_UNIFIED_BUILD_TREE_001.md docs/roadmap/FORGE_ROADMAP_LOCK_001.md \
  "$ADAPTER" "$TEST" "$ARCH_DOC_B" "$EVIDENCE_DOC_B" "$CERT_DOC_B" "$AUDIT_JSON_B" "$SCRIPT_IN_REPO"

# -------------------------------------------------------------------
# 083C QA
# -------------------------------------------------------------------
stage "083C SEMANTIC QA"
SEMANTIC_QA_JSON="$(mktemp)"
node <<'NODE' > "$SEMANTIC_QA_JSON"
const assert = require("node:assert/strict");
const ownership = require("./platform/adapters/quote-preview/quote-preview-pdf-engine-parser-ownership-registry-adapter-083b.js");

const catalog = ownership.getQuotePreviewPdfEngineParserOwnershipRegistryCatalog();
assert.equal(catalog.overall_ownership_status, "ownership_mapped_execution_blocked");
assert.equal(ownership.validateParserOwnershipRegistryCatalog(catalog).ok, true);
assert.equal(catalog.ownership_entries.length, 4);

for (const entry of catalog.ownership_entries) {
  assert.equal(entry.execution_allowed, false);
  assert(entry.safe_errors.includes(ownership.SAFE_ERROR_CODES.PARSER_EXECUTION_NOT_AUTHORIZED));
  assert.equal(ownership.validateParserOwnershipShape(entry).ok, true);
}

assert.equal(ownership.getDecisionRequiredParserOwnershipEntries().length, 2);
assert.equal(ownership.getNonExecutableParserOwnershipEntries().length, 4);
assert.equal(ownership.getParserOwnershipById("owner_quote_pdf_preview_engine").ownership_status, ownership.OWNERSHIP_STATUSES.NOT_PARSER_OWNER);

for (const [key, value] of Object.entries(ownership.DEFAULT_SAFETY_FLAGS || {})) {
  assert.equal(value, false, `DEFAULT_SAFETY_FLAGS.${key} must be false`);
}

console.log(JSON.stringify({
  status: "PASS",
  catalogValidated: true,
  ownershipCount: catalog.ownership_entries.length,
  decisionRequiredCount: ownership.getDecisionRequiredParserOwnershipEntries().length,
  nonExecutableCount: ownership.getNonExecutableParserOwnershipEntries().length,
  previewEngineNotParserTruth: true,
  allExecutionsFalse: true,
  noParserExecution: true,
  noPdfRead: true,
  noOcrExecution: true,
  noCalculatorExecution: true,
  noBanxicoCall: true,
  noTestExecution: true,
  noBackendConnection: true,
  noQuoteWrite: true,
  allSafetyFlagsFalse: true
}, null, 2));
NODE

cat "$SEMANTIC_QA_JSON"

cat > "$ARCH_DOC_C" <<EOF
# Forge Quote Preview PDF Engine Parser Ownership QA Lock 083C

PHASE=$PHASE_C

STATUS=PASS

DECISION=$DECISION_C

LOCKED_DECISION=$LOCKED_C

NEXT=$PHASE_D

## Purpose

083C QA locks the 083B parser ownership registry.

## QA Validated

- registry shape validates;
- four ownership entries exist;
- two parser entries remain decision-required;
- preview engine remains not parser truth;
- every execution remains false;
- all safety flags remain false.

## Final Decision

DECISION=$DECISION_C

LOCKED_DECISION=$LOCKED_C

NEXT=$PHASE_D
EOF

cat > "$EVIDENCE_DOC_C" <<EOF
# Forge Quote Preview PDF Engine Parser Ownership QA Lock 083C

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
# Forge Quote Preview PDF Engine Parser Ownership QA Lock Certificate 083C

PHASE=$PHASE_C

CERTIFICATE_STATUS=PASS

DECISION=$DECISION_C

LOCKED_DECISION=$LOCKED_C

NEXT=$PHASE_D

083C certifies that parser ownership registry is QA locked.

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
    "ownershipCount": 4,
    "decisionRequiredCount": 2,
    "previewEngineNotParserTruth": true,
    "executionAllowedFalse": true,
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
## 083C Quote Preview PDF Engine Parser Ownership QA Lock

083C QA locks the 083B parser ownership registry.

Locked decision:
\`$LOCKED_C\`

QA validated:

- registry shape validates;
- four ownership entries exist;
- two parser entries remain decision-required;
- preview engine remains not parser truth;
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

stage "083C VALIDATION / COMMIT"
run bash -n "$SCRIPT_IN_REPO"
run node --check "$ADAPTER"
run node --check "$TEST"
run node "$TEST"
run python3 -m json.tool "$AUDIT_JSON_C"
run rg -n "$PHASE_C|$DECISION_C|$LOCKED_C|$PHASE_D|QA locks|decision-required|not parser truth|every execution remains false" \
  FORGE_MASTER_BUILD_TREE.md docs/architecture/source-truth/FORGE_UNIFIED_BUILD_TREE_001.md docs/roadmap/FORGE_ROADMAP_LOCK_001.md \
  "$ARCH_DOC_C" "$EVIDENCE_DOC_C" "$CERT_DOC_C" "$AUDIT_JSON_C"
run git diff --check
safety_scan FORGE_MASTER_BUILD_TREE.md docs/architecture/source-truth/FORGE_UNIFIED_BUILD_TREE_001.md docs/roadmap/FORGE_ROADMAP_LOCK_001.md "$ARCH_DOC_C" "$EVIDENCE_DOC_C" "$CERT_DOC_C" "$AUDIT_JSON_C" "$ADAPTER" "$TEST"

commit_allowed_subset \
  "docs: lock quote preview pdf parser ownership qa" \
  FORGE_MASTER_BUILD_TREE.md docs/architecture/source-truth/FORGE_UNIFIED_BUILD_TREE_001.md docs/roadmap/FORGE_ROADMAP_LOCK_001.md \
  "$ARCH_DOC_C" "$EVIDENCE_DOC_C" "$CERT_DOC_C" "$AUDIT_JSON_C" "$SCRIPT_IN_REPO"

# -------------------------------------------------------------------
# 083D DECISION LOCK
# -------------------------------------------------------------------
stage "083D DECISION ASSERTIONS"
DECISION_QA_JSON="$(mktemp)"
node <<'NODE' > "$DECISION_QA_JSON"
const assert = require("node:assert/strict");
const ownership = require("./platform/adapters/quote-preview/quote-preview-pdf-engine-parser-ownership-registry-adapter-083b.js");

const catalog = ownership.getQuotePreviewPdfEngineParserOwnershipRegistryCatalog();
assert.equal(catalog.overall_ownership_status, "ownership_mapped_execution_blocked");
assert.equal(ownership.validateParserOwnershipRegistryCatalog(catalog).ok, true);
assert.equal(catalog.ownership_entries.length, 4);
assert.equal(ownership.getDecisionRequiredParserOwnershipEntries().length, 2);
assert.equal(ownership.getNonExecutableParserOwnershipEntries().length, 4);

for (const entry of catalog.ownership_entries) {
  assert.equal(entry.execution_allowed, false);
}

console.log(JSON.stringify({
  status: "PASS",
  locked_as: "local_static_read_only_reference_registry",
  overall_ownership_status: catalog.overall_ownership_status,
  ownership_count: catalog.ownership_entries.length,
  decision_required_count: ownership.getDecisionRequiredParserOwnershipEntries().length,
  non_executable_count: ownership.getNonExecutableParserOwnershipEntries().length,
  preview_engine_not_parser_truth: true,
  parser_execution_blocked: true,
  next_scope: "084A_QUOTE_PREVIEW_PDF_ENGINE_DETERMINISTIC_INPUT_SOURCE_TRACE_SCOPE",
  all_safety_flags_false: true
}, null, 2));
NODE

cat "$DECISION_QA_JSON"

cat > "$ARCH_DOC_D" <<EOF
# Forge Quote Preview PDF Engine Parser Ownership Decision Lock 083D

PHASE=$PHASE_D

STATUS=PASS

DECISION=$DECISION_D

LOCKED_DECISION=$LOCKED_D

NEXT=$NEXT_AFTER_D

## Purpose

083D decision-locks the 083B/083C parser ownership registry as a local/static/read-only reference registry.

## Locked Meaning

The registry is approved only as:

- local/static;
- read-only;
- reference registry;
- parser ownership map;
- no parser execution;
- no new parser creation.

## Confirmed

- four ownership entries exist;
- two parser entries remain decision-required;
- preview engine is not parser truth;
- all executions remain false;
- parser execution remains blocked.

## Next Architectural Unlock

084A may scope deterministic input source trace.

084A must not execute tests, read PDFs, run OCR, run parsers, run calculators, call Banxico/providers, connect backend, write quotes, or create real effects.

## Final Decision

DECISION=$DECISION_D

LOCKED_DECISION=$LOCKED_D

NEXT=$NEXT_AFTER_D
EOF

cat > "$EVIDENCE_DOC_D" <<EOF
# Forge Quote Preview PDF Engine Parser Ownership Decision Lock 083D

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
# Forge Quote Preview PDF Engine Parser Ownership Decision Lock Certificate 083D

PHASE=$PHASE_D

CERTIFICATE_STATUS=PASS

DECISION=$DECISION_D

LOCKED_DECISION=$LOCKED_D

NEXT=$NEXT_AFTER_D

083D certifies that parser ownership registry is locked as local/static/read-only reference registry.

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
    "ownershipCount": 4,
    "decisionRequiredCount": 2,
    "previewEngineNotParserTruth": true,
    "allExecutionsFalse": true,
    "allSafetyFlagsFalse": true
  },
  "nextScope": {
    "phase": "$NEXT_AFTER_D",
    "purpose": "deterministic_input_source_trace_scope",
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
## 083D Quote Preview PDF Engine Parser Ownership Decision Lock

083D decision-locks the 083B/083C parser ownership registry as a local/static/read-only reference registry.

Locked decision:
\`$LOCKED_D\`

Confirmed:

- four ownership entries exist;
- two parser entries remain decision-required;
- preview engine remains not parser truth;
- every execution remains false;
- parser execution remains blocked.

Next:

- \`$NEXT_AFTER_D\` may scope deterministic input source trace only.
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

stage "083D VALIDATION / COMMIT"
run bash -n "$SCRIPT_IN_REPO"
run node --check "$ADAPTER"
run node --check "$TEST"
run node "$TEST"
run python3 -m json.tool "$AUDIT_JSON_D"
run rg -n "$PHASE_D|$DECISION_D|$LOCKED_D|$NEXT_AFTER_D|parser ownership registry|decision-locks|deterministic input source trace|parser execution remains blocked" \
  FORGE_MASTER_BUILD_TREE.md docs/architecture/source-truth/FORGE_UNIFIED_BUILD_TREE_001.md docs/roadmap/FORGE_ROADMAP_LOCK_001.md \
  "$ARCH_DOC_D" "$EVIDENCE_DOC_D" "$CERT_DOC_D" "$AUDIT_JSON_D"
run git diff --check
safety_scan FORGE_MASTER_BUILD_TREE.md docs/architecture/source-truth/FORGE_UNIFIED_BUILD_TREE_001.md docs/roadmap/FORGE_ROADMAP_LOCK_001.md "$ARCH_DOC_D" "$EVIDENCE_DOC_D" "$CERT_DOC_D" "$AUDIT_JSON_D" "$ADAPTER" "$TEST"

commit_allowed_subset \
  "docs: lock quote preview pdf parser ownership decision" \
  FORGE_MASTER_BUILD_TREE.md docs/architecture/source-truth/FORGE_UNIFIED_BUILD_TREE_001.md docs/roadmap/FORGE_ROADMAP_LOCK_001.md \
  "$ARCH_DOC_D" "$EVIDENCE_DOC_D" "$CERT_DOC_D" "$AUDIT_JSON_D" "$SCRIPT_IN_REPO"

stage "FINAL CHECKPOINT"
run git status --short --branch
run git log --oneline -16

SUMMARY=$(cat <<EOF
PASS_083ABCD_QUOTE_PREVIEW_PDF_ENGINE_PARSER_OWNERSHIP_FAST_TRACK_COMMIT_PUSH_COMPLETE
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
