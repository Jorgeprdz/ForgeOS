#!/usr/bin/env bash
set -euo pipefail

CHAIN="081BCD_QUOTE_PREVIEW_PDF_ENGINE_REAL_PDF_FILE_HASH_PROVENANCE_FAST_TRACK"
DECISION_B="PASS_081B_QUOTE_PREVIEW_PDF_ENGINE_REAL_PDF_FILE_HASH_PROVENANCE_IMPLEMENTATION"
LOCKED_B="QUOTE_PREVIEW_PDF_ENGINE_REAL_PDF_FILE_HASH_PROVENANCE_LOCAL_STATIC_READ_ONLY_IMPLEMENTED"
PHASE_B="081B_QUOTE_PREVIEW_PDF_ENGINE_REAL_PDF_FILE_HASH_PROVENANCE_IMPLEMENTATION"

DECISION_C="PASS_081C_QUOTE_PREVIEW_PDF_ENGINE_REAL_PDF_FILE_HASH_PROVENANCE_QA_LOCK"
LOCKED_C="QUOTE_PREVIEW_PDF_ENGINE_REAL_PDF_FILE_HASH_PROVENANCE_QA_LOCKED"
PHASE_C="081C_QUOTE_PREVIEW_PDF_ENGINE_REAL_PDF_FILE_HASH_PROVENANCE_QA_LOCK"

DECISION_D="PASS_081D_QUOTE_PREVIEW_PDF_ENGINE_REAL_PDF_FILE_HASH_PROVENANCE_DECISION_LOCK"
LOCKED_D="QUOTE_PREVIEW_PDF_ENGINE_REAL_PDF_FILE_HASH_PROVENANCE_LOCKED_AS_LOCAL_STATIC_READ_ONLY_NOT_VERIFIED_REFERENCE_REGISTRY"
PHASE_D="081D_QUOTE_PREVIEW_PDF_ENGINE_REAL_PDF_FILE_HASH_PROVENANCE_DECISION_LOCK"

NEXT_AFTER_D="082A_QUOTE_PREVIEW_PDF_ENGINE_EXPECTED_VALUE_SOURCE_TRACE_SCOPE"

MODE="fast-track B/C/D with separate commits; no execution"
BOUNDARY="no UI mutation; no backend real; no CRM/policy/quote/pipeline writes; no task/calendar/message; no provider execution with effects; no auth/secrets/browser persistence; no real engine execution; no parser/calculator/Banxico/PDF/OCR execution; no PDF file read; no hash computation over PDFs; no invented product/premium/coverage/projection/quote truth; no new extractor/parser/calculator; no real test execution"
REPO="${REPO:-/storage/emulated/0/Forge OS}"
STAMP="$(date +%Y%m%d_%H%M%S)"
REPORT="/data/data/com.termux/files/home/${CHAIN}_RESULT_${STAMP}.md"
BACKUP_DIR=".forge-backups/081bcd-real-pdf-file-hash-provenance-fast-track-${STAMP}"
SCRIPT_IN_REPO="tools/termux/forge_081bcd_quote_preview_pdf_engine_real_pdf_file_hash_provenance_fast_track.sh"

SURFACES_ADAPTER="platform/adapters/quote-preview/quote-preview-pdf-engine-existing-surfaces-canonical-mapping-adapter-077b.js"
SURFACES_TEST="tests/quote-preview-pdf-engine-existing-surfaces-canonical-mapping-adapter-077b-test.js"
EVIDENCE_ADAPTER="platform/adapters/quote-preview/quote-preview-pdf-engine-canonical-test-evidence-registry-adapter-078b.js"
EVIDENCE_TEST="tests/quote-preview-pdf-engine-canonical-test-evidence-registry-adapter-078b-test.js"
PROVENANCE_ADAPTER="platform/adapters/quote-preview/quote-preview-pdf-engine-canonical-test-evidence-provenance-registry-adapter-079b.js"
PROVENANCE_TEST="tests/quote-preview-pdf-engine-canonical-test-evidence-provenance-registry-adapter-079b-test.js"
READINESS_ADAPTER="platform/adapters/quote-preview/quote-preview-pdf-engine-canonical-execution-readiness-review-matrix-adapter-080b.js"
READINESS_TEST="tests/quote-preview-pdf-engine-canonical-execution-readiness-review-matrix-adapter-080b-test.js"

ADAPTER="platform/adapters/quote-preview/quote-preview-pdf-engine-real-pdf-file-hash-provenance-registry-adapter-081b.js"
TEST="tests/quote-preview-pdf-engine-real-pdf-file-hash-provenance-registry-adapter-081b-test.js"

ARCH_DOC_B="docs/architecture/source-truth/FORGE_QUOTE_PREVIEW_PDF_ENGINE_REAL_PDF_FILE_HASH_PROVENANCE_IMPLEMENTATION_081B.md"
EVIDENCE_DOC_B="docs/evidence/FORGE_QUOTE_PREVIEW_PDF_ENGINE_REAL_PDF_FILE_HASH_PROVENANCE_IMPLEMENTATION_081B.md"
CERT_DOC_B="docs/evidence/FORGE_QUOTE_PREVIEW_PDF_ENGINE_REAL_PDF_FILE_HASH_PROVENANCE_IMPLEMENTATION_CERTIFICATE_081B.md"
AUDIT_JSON_B="docs/evidence/forge-quote-preview-pdf-engine-real-pdf-file-hash-provenance-implementation-audit-081b.json"

ARCH_DOC_C="docs/architecture/source-truth/FORGE_QUOTE_PREVIEW_PDF_ENGINE_REAL_PDF_FILE_HASH_PROVENANCE_QA_LOCK_081C.md"
EVIDENCE_DOC_C="docs/evidence/FORGE_QUOTE_PREVIEW_PDF_ENGINE_REAL_PDF_FILE_HASH_PROVENANCE_QA_LOCK_081C.md"
CERT_DOC_C="docs/evidence/FORGE_QUOTE_PREVIEW_PDF_ENGINE_REAL_PDF_FILE_HASH_PROVENANCE_QA_LOCK_CERTIFICATE_081C.md"
AUDIT_JSON_C="docs/evidence/forge-quote-preview-pdf-engine-real-pdf-file-hash-provenance-qa-audit-081c.json"

ARCH_DOC_D="docs/architecture/source-truth/FORGE_QUOTE_PREVIEW_PDF_ENGINE_REAL_PDF_FILE_HASH_PROVENANCE_DECISION_LOCK_081D.md"
EVIDENCE_DOC_D="docs/evidence/FORGE_QUOTE_PREVIEW_PDF_ENGINE_REAL_PDF_FILE_HASH_PROVENANCE_DECISION_LOCK_081D.md"
CERT_DOC_D="docs/evidence/FORGE_QUOTE_PREVIEW_PDF_ENGINE_REAL_PDF_FILE_HASH_PROVENANCE_DECISION_LOCK_CERTIFICATE_081D.md"
AUDIT_JSON_D="docs/evidence/forge-quote-preview-pdf-engine-real-pdf-file-hash-provenance-decision-audit-081d.json"

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

  find /data/data/com.termux/files/home -path "*/forge-discovery-*/*DISCOVERY_077A_PRECHECK_EXISTING_QUOTE_PDF_TESTS_AND_ENGINES_REPORT_*.json" \
    -type f 2>/dev/null | sort | tail -1
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
    if not text.endswith("\n"):
        text += "\n"
    text = text + block.strip() + "\n"
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
    text = path.read_text()
    path.write_text(text.rstrip() + "\n")
    print(f"trimmed EOF blanks: {path}")
PYTRIM
}

safety_scan(){
  local files=("$@")
  if rg -n 'localStorage|sessionStorage|fetch\(|XMLHttpRequest|navigator\.mediaDevices|SpeechRecognition|providerRuntimeEnabled:\s*true|networkCallsAllowed:\s*true|browserStorageEnabled:\s*true|mayCreateTruth:\s*true|maySendMessage:\s*true|mayWriteCrm:\s*true|mayCreateCalendarEvent:\s*true' "${files[@]}"; then
    fail "safety scan found prohibited runtime/browser/network marker"
  fi

  if rg -n '"?(crmWrite|pipelineWrite|policyWrite|quoteWrite|taskCreate|calendarCreate|messageSend|authReal|providerRuntime|secretAccess|browserPersistence|realEngineExecution|realEffectsAllowed|realEffectsEnabled|backendConnection|pdfRead|ocrExecution|parserExecution|calculatorExecution|banxicoCall|testExecution)"?\s*[:=]\s*true\b' "${files[@]}"; then
    fail "real-effect flag true found"
  fi
  pass "safety scan clean"
}

stage_authorized_and_commit(){
  local commit_msg="$1"
  shift
  local authorized=("$@")
  git add "${authorized[@]}"

  run git diff --cached --name-only
  run git diff --cached --check

  local expected actual
  expected="$(mktemp)"
  actual="$(mktemp)"
  printf "%s\n" "${authorized[@]}" | sort > "$expected"
  git diff --cached --name-only | sort > "$actual"

  if ! diff -u "$expected" "$actual"; then
    fail "staged files differ from authorized boundary"
  fi

  pass "only authorized files staged"
  run git commit -m "$commit_msg"
  run git push origin HEAD:main
}

mkdir -p "$(dirname "$REPORT")"
touch "$REPORT"
exec > >(tee -a "$REPORT") 2>&1

stage "STAGE 0 HEADER"
echo "CHAIN=$CHAIN"
echo "MODE=$MODE"
echo "BOUNDARY=$BOUNDARY"
echo "REPORT=$REPORT"
echo "ROBOCOP_GATE=Article 0; fast-track B/C/D; file/hash registry only; no PDF read/hash computation"

cd "$REPO" || fail "No existe repo: $REPO"

stage "STAGE 1 CHECKPOINT"
run git status --short --branch
run git log --oneline -15
run git diff --name-status
run git diff --cached --name-status

stage "STAGE 2 CONFIRM BASE 081A"
if git log --oneline -60 | grep -Eq "081A|scope quote preview pdf real file hash provenance|QUOTE_PREVIEW_PDF_ENGINE_REAL_PDF_FILE_HASH_PROVENANCE_SCOPED"; then
  pass "081A commit found in recent history"
elif [ -f "docs/evidence/forge-quote-preview-pdf-engine-real-pdf-file-hash-provenance-scope-audit-081a.json" ]; then
  pass "081A audit fallback found"
else
  fail "081A base not found. Run 081A first; B/C/D fast-track depends on it."
fi

if [ -f "docs/evidence/forge-quote-preview-pdf-engine-real-pdf-file-hash-provenance-scope-audit-081a.json" ]; then
  run python3 -m json.tool docs/evidence/forge-quote-preview-pdf-engine-real-pdf-file-hash-provenance-scope-audit-081a.json
  if ! rg -n '"status"\s*:\s*"PASS"|"lockedDecision"\s*:\s*"QUOTE_PREVIEW_PDF_ENGINE_REAL_PDF_FILE_HASH_PROVENANCE_SCOPED"|"next"\s*:\s*"081B_QUOTE_PREVIEW_PDF_ENGINE_REAL_PDF_FILE_HASH_PROVENANCE_IMPLEMENTATION"' docs/evidence/forge-quote-preview-pdf-engine-real-pdf-file-hash-provenance-scope-audit-081a.json >/dev/null; then
    fail "081A audit exists but does not confirm PASS/081B next"
  fi
  pass "081A audit PASS/081B next confirmed"
else
  warn "081A audit file not found; relying on git log/tree markers"
fi

stage "STAGE 3 DISCOVERY EVIDENCE"
DISCOVERY_JSON_FOUND="$(find_latest_discovery_json || true)"
if [ -z "$DISCOVERY_JSON_FOUND" ] || [ ! -f "$DISCOVERY_JSON_FOUND" ]; then
  fail "Discovery JSON not found. Run discovery first or set DISCOVERY_JSON=/path/report.json"
fi

DISCOVERY_DIR="$(dirname "$DISCOVERY_JSON_FOUND")"
DISCOVERY_REPORT_MD="$(find "$DISCOVERY_DIR" -maxdepth 1 -type f -name '*DISCOVERY_077A_PRECHECK_EXISTING_QUOTE_PDF_TESTS_AND_ENGINES_REPORT_*.md' | sort | tail -1 || true)"

echo "DISCOVERY_JSON=$DISCOVERY_JSON_FOUND"
echo "DISCOVERY_DIR=$DISCOVERY_DIR"
echo "DISCOVERY_REPORT_MD=${DISCOVERY_REPORT_MD:-not_found}"

run python3 -m json.tool "$DISCOVERY_JSON_FOUND"

DISCOVERY_DIGEST_JSON="$(mktemp)"
python3 - <<'PY' "$DISCOVERY_JSON_FOUND" "$DISCOVERY_DIGEST_JSON"
import json, sys
from pathlib import Path

source = Path(sys.argv[1])
target = Path(sys.argv[2])
data = json.loads(source.read_text())
rec = data.get("recommendation", {})
counts = data.get("counts", {})

if rec.get("do_not_create_new_pdf_extractor") is not True:
    raise SystemExit("Discovery does not block new extractor creation")
if counts.get("test_files_total", 0) < 1:
    raise SystemExit("Discovery did not find tests")

digest = {
    "discoveryJson": str(source),
    "counts": counts,
    "knownSurfacesPresent": data.get("known_surfaces_present", []),
    "realQuoteTestCandidateFiles": data.get("real_quote_test_candidate_files", []),
    "recommendation": rec,
    "artifacts": data.get("artifacts", {}),
}
target.write_text(json.dumps(digest, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
print("DISCOVERY_DIGEST_VALID")
print(target.read_text())
PY

pass "discovery evidence confirmed"

stage "STAGE 4 REQUIRED FILES"
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
)

for f in "${REQUIRED_FILES[@]}"; do
  [ -f "$f" ] || fail "Missing required file: $f"
  pass "$f"
done

stage "STAGE 5 BACKUP"
mkdir -p "$BACKUP_DIR"
cp FORGE_MASTER_BUILD_TREE.md "$BACKUP_DIR/FORGE_MASTER_BUILD_TREE.md"
cp docs/architecture/source-truth/FORGE_UNIFIED_BUILD_TREE_001.md "$BACKUP_DIR/FORGE_UNIFIED_BUILD_TREE_001.md"
cp docs/roadmap/FORGE_ROADMAP_LOCK_001.md "$BACKUP_DIR/FORGE_ROADMAP_LOCK_001.md"

cat > "$BACKUP_DIR/rollback-081bcd.sh" <<ROLLBACK
#!/usr/bin/env bash
set -euo pipefail
cp "$BACKUP_DIR/FORGE_MASTER_BUILD_TREE.md" "FORGE_MASTER_BUILD_TREE.md"
cp "$BACKUP_DIR/FORGE_UNIFIED_BUILD_TREE_001.md" "docs/architecture/source-truth/FORGE_UNIFIED_BUILD_TREE_001.md"
cp "$BACKUP_DIR/FORGE_ROADMAP_LOCK_001.md" "docs/roadmap/FORGE_ROADMAP_LOCK_001.md"
rm -f "$ADAPTER"
rm -f "$TEST"
rm -f "$ARCH_DOC_B" "$EVIDENCE_DOC_B" "$CERT_DOC_B" "$AUDIT_JSON_B"
rm -f "$ARCH_DOC_C" "$EVIDENCE_DOC_C" "$CERT_DOC_C" "$AUDIT_JSON_C"
rm -f "$ARCH_DOC_D" "$EVIDENCE_DOC_D" "$CERT_DOC_D" "$AUDIT_JSON_D"
rm -f "$SCRIPT_IN_REPO"
echo "rollback 081BCD file cleanup complete; committed history requires git reset/revert if already pushed"
ROLLBACK
chmod +x "$BACKUP_DIR/rollback-081bcd.sh"
pass "backup created"
pass "rollback created: $BACKUP_DIR/rollback-081bcd.sh"

stage "STAGE 6 REVALIDATE BASE REGISTRIES"
run node --check "$SURFACES_ADAPTER"
run node --check "$SURFACES_TEST"
run node "$SURFACES_TEST"
run node --check "$EVIDENCE_ADAPTER"
run node --check "$EVIDENCE_TEST"
run node "$EVIDENCE_TEST"
run node --check "$PROVENANCE_ADAPTER"
run node --check "$PROVENANCE_TEST"
run node "$PROVENANCE_TEST"
run node --check "$READINESS_ADAPTER"
run node --check "$READINESS_TEST"
run node "$READINESS_TEST"

# -------------------------------------------------------------------
# 081B IMPLEMENTATION
# -------------------------------------------------------------------
stage "081B IMPLEMENT ADAPTER"
mkdir -p "$(dirname "$ADAPTER")"

cat > "$ADAPTER" <<'NODE'
'use strict';

const evidence = require('./quote-preview-pdf-engine-canonical-test-evidence-registry-adapter-078b.js');
const provenance = require('./quote-preview-pdf-engine-canonical-test-evidence-provenance-registry-adapter-079b.js');
const readiness = require('./quote-preview-pdf-engine-canonical-execution-readiness-review-matrix-adapter-080b.js');

const ADAPTER_ID = 'forge.quote_preview.pdf_engine.real_pdf_file_hash_provenance.registry.adapter.v1';
const SCHEMA_VERSION = 'forge.quote_preview.pdf_engine.real_pdf_file_hash_provenance.registry.v1';
const DOMAIN_ID = 'quote_preview_pdf_engine_real_pdf_file_hash_provenance';
const MODE = 'read_only';
const ROUTE_CLASS = 'preview_safe';

const SOURCE_DOCUMENT_KINDS = Object.freeze({
  REAL_PDF_CANDIDATE: 'real_pdf_candidate',
  UNDECLARED: 'undeclared',
});

const HASH_ALGORITHMS = Object.freeze({
  SHA256: 'sha256',
  UNDECLARED: 'undeclared',
});

const HASH_VERIFICATION_STATUSES = Object.freeze({
  NOT_VERIFIED: 'not_verified',
  DECLARED_ONLY: 'declared_only',
  REJECTED: 'rejected',
});

const FILE_READ_STATUSES = Object.freeze({
  NOT_READ: 'not_read',
  READ_NOT_AUTHORIZED: 'read_not_authorized',
});

const SAFE_ERROR_CODES = Object.freeze({
  BINDING_NOT_MAPPED: 'QUOTE_PREVIEW_REAL_PDF_FILE_HASH_BINDING_NOT_MAPPED',
  FILE_PATH_NOT_BOUND: 'QUOTE_PREVIEW_REAL_PDF_FILE_PATH_NOT_BOUND',
  HASH_NOT_BOUND: 'QUOTE_PREVIEW_REAL_PDF_HASH_NOT_BOUND',
  FILE_SIZE_NOT_BOUND: 'QUOTE_PREVIEW_REAL_PDF_FILE_SIZE_NOT_BOUND',
  PDF_READ_NOT_AUTHORIZED: 'QUOTE_PREVIEW_REAL_PDF_READ_NOT_AUTHORIZED',
  HASH_COMPUTE_NOT_AUTHORIZED: 'QUOTE_PREVIEW_REAL_PDF_HASH_COMPUTE_NOT_AUTHORIZED',
  EXECUTION_NOT_AUTHORIZED: 'QUOTE_PREVIEW_REAL_PDF_EXECUTION_NOT_AUTHORIZED',
  FIXTURE_AS_REAL_PDF_BLOCKED: 'QUOTE_PREVIEW_REAL_PDF_FIXTURE_AS_REAL_PDF_BLOCKED',
  UNVERIFIED_SOURCE_DOCUMENT_BLOCKED: 'QUOTE_PREVIEW_REAL_PDF_UNVERIFIED_SOURCE_DOCUMENT_BLOCKED',
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

const REQUIRED_BINDING_FIELDS = Object.freeze([
  'binding_id',
  'test_id',
  'candidate_file_path',
  'source_document_kind',
  'source_document_origin',
  'declared_sha256',
  'declared_file_size_bytes',
  'hash_algorithm',
  'hash_verification_status',
  'file_read_status',
  'execution_allowed',
  'safe_errors',
  'safety_flags',
]);

function freezeBinding(binding) {
  return Object.freeze({
    ...binding,
    related_evidence_refs: Object.freeze([...(binding.related_evidence_refs || [])]),
    related_provenance_refs: Object.freeze([...(binding.related_provenance_refs || [])]),
    blocked_misuse: Object.freeze([...(binding.blocked_misuse || [])]),
    safe_errors: Object.freeze([...(binding.safe_errors || [])]),
    safety_flags: Object.freeze({ ...DEFAULT_SAFETY_FLAGS, ...(binding.safety_flags || {}) }),
  });
}

const REAL_PDF_FILE_HASH_BINDINGS = Object.freeze([
  freezeBinding({
    binding_id: 'binding_real_pdf_ocr_solucionline_file_hash',
    test_id: 'real_pdf_ocr_solucionline_candidate',
    candidate_file_path: null,
    source_document_kind: SOURCE_DOCUMENT_KINDS.REAL_PDF_CANDIDATE,
    source_document_origin: 'not_declared',
    declared_sha256: null,
    declared_file_size_bytes: null,
    hash_algorithm: HASH_ALGORITHMS.SHA256,
    hash_verification_status: HASH_VERIFICATION_STATUSES.NOT_VERIFIED,
    file_read_status: FILE_READ_STATUSES.NOT_READ,
    execution_allowed: false,
    related_evidence_refs: ['tests/real-pdf-ocr-test.js'],
    related_provenance_refs: ['prov_real_pdf_ocr_solucionline_file'],
    blocked_misuse: ['pdf_read_before_file_hash_gate', 'hash_compute_before_file_hash_gate', 'fixture_as_real_pdf', 'ocr_before_file_hash_gate'],
    safe_errors: [
      SAFE_ERROR_CODES.FILE_PATH_NOT_BOUND,
      SAFE_ERROR_CODES.HASH_NOT_BOUND,
      SAFE_ERROR_CODES.PDF_READ_NOT_AUTHORIZED,
      SAFE_ERROR_CODES.HASH_COMPUTE_NOT_AUTHORIZED,
      SAFE_ERROR_CODES.EXECUTION_NOT_AUTHORIZED,
    ],
  }),
  freezeBinding({
    binding_id: 'binding_real_gmm_quote_pdf_file_hash',
    test_id: 'real_gmm_quote_candidate',
    candidate_file_path: null,
    source_document_kind: SOURCE_DOCUMENT_KINDS.REAL_PDF_CANDIDATE,
    source_document_origin: 'not_declared',
    declared_sha256: null,
    declared_file_size_bytes: null,
    hash_algorithm: HASH_ALGORITHMS.SHA256,
    hash_verification_status: HASH_VERIFICATION_STATUSES.NOT_VERIFIED,
    file_read_status: FILE_READ_STATUSES.NOT_READ,
    execution_allowed: false,
    related_evidence_refs: ['tests/real-gmm-quote-test.js'],
    related_provenance_refs: ['prov_real_gmm_quote_pdf_file'],
    blocked_misuse: ['pdf_read_before_file_hash_gate', 'hash_compute_before_file_hash_gate', 'fixture_as_real_pdf', 'parser_before_file_hash_gate'],
    safe_errors: [
      SAFE_ERROR_CODES.FILE_PATH_NOT_BOUND,
      SAFE_ERROR_CODES.HASH_NOT_BOUND,
      SAFE_ERROR_CODES.PDF_READ_NOT_AUTHORIZED,
      SAFE_ERROR_CODES.HASH_COMPUTE_NOT_AUTHORIZED,
      SAFE_ERROR_CODES.EXECUTION_NOT_AUTHORIZED,
    ],
  }),
  freezeBinding({
    binding_id: 'binding_real_retirement_scenario_pdf_file_hash',
    test_id: 'real_retirement_scenario_candidate',
    candidate_file_path: null,
    source_document_kind: SOURCE_DOCUMENT_KINDS.REAL_PDF_CANDIDATE,
    source_document_origin: 'not_declared',
    declared_sha256: null,
    declared_file_size_bytes: null,
    hash_algorithm: HASH_ALGORITHMS.SHA256,
    hash_verification_status: HASH_VERIFICATION_STATUSES.NOT_VERIFIED,
    file_read_status: FILE_READ_STATUSES.NOT_READ,
    execution_allowed: false,
    related_evidence_refs: ['tests/real-retirement-scenario-test.js'],
    related_provenance_refs: ['prov_real_retirement_parser_pdf_file'],
    blocked_misuse: ['pdf_read_before_file_hash_gate', 'hash_compute_before_file_hash_gate', 'fixture_as_real_pdf', 'parser_before_file_hash_gate'],
    safe_errors: [
      SAFE_ERROR_CODES.FILE_PATH_NOT_BOUND,
      SAFE_ERROR_CODES.HASH_NOT_BOUND,
      SAFE_ERROR_CODES.PDF_READ_NOT_AUTHORIZED,
      SAFE_ERROR_CODES.HASH_COMPUTE_NOT_AUTHORIZED,
      SAFE_ERROR_CODES.EXECUTION_NOT_AUTHORIZED,
    ],
  }),
  freezeBinding({
    binding_id: 'binding_real_retirement_mxn_scenario_pdf_file_hash',
    test_id: 'real_retirement_mxn_scenario_candidate',
    candidate_file_path: null,
    source_document_kind: SOURCE_DOCUMENT_KINDS.REAL_PDF_CANDIDATE,
    source_document_origin: 'not_declared',
    declared_sha256: null,
    declared_file_size_bytes: null,
    hash_algorithm: HASH_ALGORITHMS.SHA256,
    hash_verification_status: HASH_VERIFICATION_STATUSES.NOT_VERIFIED,
    file_read_status: FILE_READ_STATUSES.NOT_READ,
    execution_allowed: false,
    related_evidence_refs: ['tests/real-retirement-mxn-scenario-test.js'],
    related_provenance_refs: ['prov_real_retirement_mxn_expected_values'],
    blocked_misuse: ['pdf_read_before_file_hash_gate', 'hash_compute_before_file_hash_gate', 'fixture_as_real_pdf', 'parser_before_file_hash_gate', 'calculator_before_expected_value_trace_gate'],
    safe_errors: [
      SAFE_ERROR_CODES.FILE_PATH_NOT_BOUND,
      SAFE_ERROR_CODES.HASH_NOT_BOUND,
      SAFE_ERROR_CODES.PDF_READ_NOT_AUTHORIZED,
      SAFE_ERROR_CODES.HASH_COMPUTE_NOT_AUTHORIZED,
      SAFE_ERROR_CODES.EXECUTION_NOT_AUTHORIZED,
    ],
  }),
]);

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function getSourceRefs() {
  const evidenceCatalog = evidence.getQuotePreviewPdfCanonicalTestEvidenceRegistryCatalog();
  const provenanceCatalog = provenance.getQuotePreviewPdfCanonicalTestEvidenceProvenanceRegistryCatalog();
  const readinessCatalog = readiness.getQuotePreviewPdfCanonicalExecutionReadinessReviewMatrixCatalog();

  return {
    evidence: {
      adapter_id: evidenceCatalog.adapter_id,
      schemaVersion: evidenceCatalog.schemaVersion,
      evidence_count: Array.isArray(evidenceCatalog.evidence) ? evidenceCatalog.evidence.length : 0,
    },
    provenance: {
      adapter_id: provenanceCatalog.adapter_id,
      schemaVersion: provenanceCatalog.schemaVersion,
      provenance_count: Array.isArray(provenanceCatalog.provenance) ? provenanceCatalog.provenance.length : 0,
    },
    readiness: {
      adapter_id: readinessCatalog.adapter_id,
      schemaVersion: readinessCatalog.schemaVersion,
      overall_readiness: readinessCatalog.overall_readiness,
    },
  };
}

function getQuotePreviewPdfEngineRealPdfFileHashProvenanceRegistryCatalog() {
  return {
    adapter_id: ADAPTER_ID,
    schemaVersion: SCHEMA_VERSION,
    domainId: DOMAIN_ID,
    mode: MODE,
    routeClass: ROUTE_CLASS,
    registry_type: 'local_static_read_only_real_pdf_file_hash_provenance_registry',
    overall_binding_status: 'not_bound_not_verified_not_ready',
    execution_allowed_in_registry: false,
    pdf_read_allowed_in_registry: false,
    pdf_hash_computation_allowed_in_registry: false,
    ocr_execution_allowed_in_registry: false,
    parser_execution_allowed_in_registry: false,
    calculator_execution_allowed_in_registry: false,
    banxico_call_allowed_in_registry: false,
    provider_call_allowed_in_registry: false,
    test_execution_allowed_in_registry: false,
    backend_connection_allowed_in_registry: false,
    quote_write_allowed_in_registry: false,
    product_intelligence_upstream: true,
    quote_preview_downstream: true,
    required_binding_fields: [...REQUIRED_BINDING_FIELDS],
    safe_errors: Object.values(SAFE_ERROR_CODES),
    safety_flags: clone(DEFAULT_SAFETY_FLAGS),
    source_refs: getSourceRefs(),
    bindings: clone(REAL_PDF_FILE_HASH_BINDINGS),
  };
}

function getRealPdfFileHashBindingById(bindingId) {
  const match = REAL_PDF_FILE_HASH_BINDINGS.find((binding) => binding.binding_id === bindingId);
  return match ? clone(match) : buildRealPdfFileHashBindingSafeError(bindingId);
}

function getRealPdfFileHashBindingsByTestId(testId) {
  return clone(REAL_PDF_FILE_HASH_BINDINGS.filter((binding) => binding.test_id === testId));
}

function getUnboundRealPdfFileHashBindings() {
  return clone(
    REAL_PDF_FILE_HASH_BINDINGS.filter((binding) =>
      !binding.candidate_file_path ||
      !binding.declared_sha256 ||
      binding.declared_file_size_bytes === null ||
      binding.declared_file_size_bytes === undefined
    )
  );
}

function getNotVerifiedRealPdfFileHashBindings() {
  return clone(
    REAL_PDF_FILE_HASH_BINDINGS.filter((binding) =>
      binding.hash_verification_status !== HASH_VERIFICATION_STATUSES.DECLARED_ONLY
    )
  );
}

function buildRealPdfFileHashBindingSafeError(bindingId, code = SAFE_ERROR_CODES.BINDING_NOT_MAPPED) {
  return {
    schemaVersion: SCHEMA_VERSION,
    domainId: DOMAIN_ID,
    mode: MODE,
    routeClass: ROUTE_CLASS,
    readModelStatus: 'error',
    binding_id: bindingId || null,
    test_id: null,
    candidate_file_path: null,
    source_document_kind: SOURCE_DOCUMENT_KINDS.UNDECLARED,
    source_document_origin: 'not_declared',
    declared_sha256: null,
    declared_file_size_bytes: null,
    hash_algorithm: HASH_ALGORITHMS.UNDECLARED,
    hash_verification_status: HASH_VERIFICATION_STATUSES.NOT_VERIFIED,
    file_read_status: FILE_READ_STATUSES.NOT_READ,
    execution_allowed: false,
    related_evidence_refs: [],
    related_provenance_refs: [],
    blocked_misuse: ['unmapped_real_pdf_binding_execution', 'pdf_read_before_file_hash_gate', 'hash_compute_before_file_hash_gate'],
    safe_errors: [code, SAFE_ERROR_CODES.EXECUTION_NOT_AUTHORIZED, SAFE_ERROR_CODES.PDF_READ_NOT_AUTHORIZED],
    safety_flags: clone(DEFAULT_SAFETY_FLAGS),
    safe_error: {
      code,
      message: 'Real PDF file/hash binding is not mapped. PDF read, hash computation, and execution are blocked.',
    },
  };
}

function validateRealPdfFileHashBindingShape(binding) {
  const errors = [];

  if (!binding || typeof binding !== 'object') {
    return { ok: false, valid: false, errors: ['binding_object_required'] };
  }

  for (const field of REQUIRED_BINDING_FIELDS) {
    if (!(field in binding)) errors.push(`missing_${field}`);
  }

  if (binding.execution_allowed !== false) errors.push('execution_allowed_must_be_false');
  if (binding.file_read_status !== FILE_READ_STATUSES.NOT_READ) errors.push('file_read_status_must_remain_not_read');
  if (binding.hash_verification_status !== HASH_VERIFICATION_STATUSES.NOT_VERIFIED) errors.push('hash_verification_status_must_remain_not_verified');

  for (const [key, value] of Object.entries(binding.safety_flags || {})) {
    if (value !== false) errors.push(`safety_flag_not_false_${key}`);
  }

  const serialized = JSON.stringify(binding);
  const forbiddenFragments = [
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
  ];

  for (const fragment of forbiddenFragments) {
    if (serialized.includes(fragment)) errors.push(`forbidden_true_fragment_${fragment}`);
  }

  return {
    ok: errors.length === 0,
    valid: errors.length === 0,
    errors,
  };
}

function validateRealPdfFileHashRegistryCatalog(catalog) {
  const errors = [];

  if (!catalog || typeof catalog !== 'object') {
    return { ok: false, valid: false, errors: ['catalog_object_required'] };
  }

  if (catalog.schemaVersion !== SCHEMA_VERSION) errors.push('invalid_schemaVersion');
  if (catalog.domainId !== DOMAIN_ID) errors.push('invalid_domainId');
  if (catalog.mode !== MODE) errors.push('invalid_mode');
  if (catalog.routeClass !== ROUTE_CLASS) errors.push('invalid_routeClass');
  if (catalog.overall_binding_status !== 'not_bound_not_verified_not_ready') errors.push('overall_binding_status_must_remain_not_ready');

  for (const flagName of [
    'execution_allowed_in_registry',
    'pdf_read_allowed_in_registry',
    'pdf_hash_computation_allowed_in_registry',
    'ocr_execution_allowed_in_registry',
    'parser_execution_allowed_in_registry',
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

  const bindings = Array.isArray(catalog.bindings) ? catalog.bindings : [];
  if (!bindings.length) errors.push('bindings_required');

  for (const binding of bindings) {
    const result = validateRealPdfFileHashBindingShape(binding);
    if (!result.ok) errors.push(...result.errors.map((error) => `${binding.binding_id || 'unknown'}:${error}`));
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
  SOURCE_DOCUMENT_KINDS,
  HASH_ALGORITHMS,
  HASH_VERIFICATION_STATUSES,
  FILE_READ_STATUSES,
  SAFE_ERROR_CODES,
  DEFAULT_SAFETY_FLAGS,
  REQUIRED_BINDING_FIELDS,
  REAL_PDF_FILE_HASH_BINDINGS,
  getQuotePreviewPdfEngineRealPdfFileHashProvenanceRegistryCatalog,
  getRealPdfFileHashBindingById,
  getRealPdfFileHashBindingsByTestId,
  getUnboundRealPdfFileHashBindings,
  getNotVerifiedRealPdfFileHashBindings,
  buildRealPdfFileHashBindingSafeError,
  validateRealPdfFileHashBindingShape,
  validateRealPdfFileHashRegistryCatalog,
};
NODE

pass "$ADAPTER written"

stage "081B IMPLEMENT TEST"
mkdir -p "$(dirname "$TEST")"

cat > "$TEST" <<'NODE'
'use strict';

const assert = require('node:assert/strict');

const adapter = require('../platform/adapters/quote-preview/quote-preview-pdf-engine-real-pdf-file-hash-provenance-registry-adapter-081b.js');

assert.equal(adapter.ADAPTER_ID, 'forge.quote_preview.pdf_engine.real_pdf_file_hash_provenance.registry.adapter.v1');
assert.equal(adapter.SCHEMA_VERSION, 'forge.quote_preview.pdf_engine.real_pdf_file_hash_provenance.registry.v1');
assert.equal(adapter.MODE, 'read_only');
assert.equal(adapter.ROUTE_CLASS, 'preview_safe');

assert.equal(typeof adapter.getQuotePreviewPdfEngineRealPdfFileHashProvenanceRegistryCatalog, 'function');
assert.equal(typeof adapter.getRealPdfFileHashBindingById, 'function');
assert.equal(typeof adapter.getRealPdfFileHashBindingsByTestId, 'function');
assert.equal(typeof adapter.getUnboundRealPdfFileHashBindings, 'function');
assert.equal(typeof adapter.getNotVerifiedRealPdfFileHashBindings, 'function');
assert.equal(typeof adapter.buildRealPdfFileHashBindingSafeError, 'function');
assert.equal(typeof adapter.validateRealPdfFileHashBindingShape, 'function');
assert.equal(typeof adapter.validateRealPdfFileHashRegistryCatalog, 'function');

const catalog = adapter.getQuotePreviewPdfEngineRealPdfFileHashProvenanceRegistryCatalog();

assert.equal(catalog.schemaVersion, adapter.SCHEMA_VERSION);
assert.equal(catalog.domainId, 'quote_preview_pdf_engine_real_pdf_file_hash_provenance');
assert.equal(catalog.mode, 'read_only');
assert.equal(catalog.routeClass, 'preview_safe');
assert.equal(catalog.registry_type, 'local_static_read_only_real_pdf_file_hash_provenance_registry');
assert.equal(catalog.overall_binding_status, 'not_bound_not_verified_not_ready');

for (const flag of [
  'execution_allowed_in_registry',
  'pdf_read_allowed_in_registry',
  'pdf_hash_computation_allowed_in_registry',
  'ocr_execution_allowed_in_registry',
  'parser_execution_allowed_in_registry',
  'calculator_execution_allowed_in_registry',
  'banxico_call_allowed_in_registry',
  'provider_call_allowed_in_registry',
  'test_execution_allowed_in_registry',
  'backend_connection_allowed_in_registry',
  'quote_write_allowed_in_registry',
]) {
  assert.equal(catalog[flag], false, `${flag} must be false`);
}

assert.equal(catalog.product_intelligence_upstream, true);
assert.equal(catalog.quote_preview_downstream, true);
assert(Array.isArray(catalog.bindings));
assert.equal(catalog.bindings.length, 4);
assert.equal(adapter.validateRealPdfFileHashRegistryCatalog(catalog).ok, true);

for (const binding of catalog.bindings) {
  for (const field of adapter.REQUIRED_BINDING_FIELDS) {
    assert(field in binding, `${binding.binding_id} missing ${field}`);
  }

  assert.equal(binding.candidate_file_path, null);
  assert.equal(binding.declared_sha256, null);
  assert.equal(binding.declared_file_size_bytes, null);
  assert.equal(binding.hash_algorithm, adapter.HASH_ALGORITHMS.SHA256);
  assert.equal(binding.hash_verification_status, adapter.HASH_VERIFICATION_STATUSES.NOT_VERIFIED);
  assert.equal(binding.file_read_status, adapter.FILE_READ_STATUSES.NOT_READ);
  assert.equal(binding.execution_allowed, false);
  assert(binding.safe_errors.includes(adapter.SAFE_ERROR_CODES.FILE_PATH_NOT_BOUND));
  assert(binding.safe_errors.includes(adapter.SAFE_ERROR_CODES.HASH_NOT_BOUND));
  assert(binding.safe_errors.includes(adapter.SAFE_ERROR_CODES.PDF_READ_NOT_AUTHORIZED));
  assert(binding.safe_errors.includes(adapter.SAFE_ERROR_CODES.HASH_COMPUTE_NOT_AUTHORIZED));
  assert(binding.safe_errors.includes(adapter.SAFE_ERROR_CODES.EXECUTION_NOT_AUTHORIZED));
  assert.equal(adapter.validateRealPdfFileHashBindingShape(binding).ok, true);
}

const requiredBindings = [
  'binding_real_pdf_ocr_solucionline_file_hash',
  'binding_real_gmm_quote_pdf_file_hash',
  'binding_real_retirement_scenario_pdf_file_hash',
  'binding_real_retirement_mxn_scenario_pdf_file_hash',
];

for (const bindingId of requiredBindings) {
  const binding = adapter.getRealPdfFileHashBindingById(bindingId);
  assert.equal(binding.binding_id, bindingId);
}

const byTest = adapter.getRealPdfFileHashBindingsByTestId('real_retirement_mxn_scenario_candidate');
assert.equal(byTest.length, 1);
assert.equal(byTest[0].binding_id, 'binding_real_retirement_mxn_scenario_pdf_file_hash');

const unbound = adapter.getUnboundRealPdfFileHashBindings();
assert.equal(unbound.length, 4);

const notVerified = adapter.getNotVerifiedRealPdfFileHashBindings();
assert.equal(notVerified.length, 4);

const missing = adapter.getRealPdfFileHashBindingById('missing_binding');
assert.equal(missing.readModelStatus, 'error');
assert.equal(missing.execution_allowed, false);
assert.equal(missing.file_read_status, adapter.FILE_READ_STATUSES.NOT_READ);
assert.equal(missing.hash_verification_status, adapter.HASH_VERIFICATION_STATUSES.NOT_VERIFIED);
assert(missing.safe_errors.includes(adapter.SAFE_ERROR_CODES.BINDING_NOT_MAPPED));
assert(missing.safe_errors.includes(adapter.SAFE_ERROR_CODES.EXECUTION_NOT_AUTHORIZED));
assert(missing.safe_errors.includes(adapter.SAFE_ERROR_CODES.PDF_READ_NOT_AUTHORIZED));
assert.equal(adapter.validateRealPdfFileHashBindingShape(missing).ok, true);

for (const [key, value] of Object.entries(adapter.DEFAULT_SAFETY_FLAGS)) {
  assert.equal(value, false, `DEFAULT_SAFETY_FLAGS.${key} must be false`);
}

for (const binding of catalog.bindings) {
  for (const [key, value] of Object.entries(binding.safety_flags || {})) {
    assert.equal(value, false, `${binding.binding_id}.${key} must be false`);
  }
}

const combined = JSON.stringify({
  catalog,
  missing,
  flags: adapter.DEFAULT_SAFETY_FLAGS,
  safeErrors: adapter.SAFE_ERROR_CODES,
});

const forbiddenFragments = [
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
];

for (const fragment of forbiddenFragments) {
  assert(!combined.includes(fragment), `forbidden true flag found: ${fragment}`);
}

console.log('PASS quote preview pdf engine real pdf file hash provenance registry adapter 081B');
NODE

pass "$TEST written"

stage "081B WRITE DOCS / EVIDENCE"
mkdir -p "$(dirname "$ARCH_DOC_B")" "$(dirname "$EVIDENCE_DOC_B")"

cat > "$ARCH_DOC_B" <<EOF
# Forge Quote Preview PDF Engine Real PDF File Hash Provenance Implementation 081B

PHASE=$PHASE_B

STATUS=PASS

DECISION=$DECISION_B

LOCKED_DECISION=$LOCKED_B

NEXT=$PHASE_C

## Purpose

081B implements a local/static/read-only real PDF file/hash provenance registry.

The registry binds real PDF candidate evidence to metadata placeholders only. It does not read PDF files, compute hashes, run OCR, run parsers, run calculators, call Banxico, call providers, connect backend, write quotes, or execute real tests.

## Implemented Files

- \`$ADAPTER\`
- \`$TEST\`

## Adapter Contract

- \`ADAPTER_ID\`: \`forge.quote_preview.pdf_engine.real_pdf_file_hash_provenance.registry.adapter.v1\`
- \`SCHEMA_VERSION\`: \`forge.quote_preview.pdf_engine.real_pdf_file_hash_provenance.registry.v1\`
- \`domainId\`: \`quote_preview_pdf_engine_real_pdf_file_hash_provenance\`
- \`mode\`: \`read_only\`
- \`routeClass\`: \`preview_safe\`

## Registry Status

The registry explicitly reports:

\`not_bound_not_verified_not_ready\`

## Bound Candidates

- \`real_pdf_ocr_solucionline_candidate\`
- \`real_gmm_quote_candidate\`
- \`real_retirement_scenario_candidate\`
- \`real_retirement_mxn_scenario_candidate\`

Each candidate remains:

- \`candidate_file_path=null\`
- \`declared_sha256=null\`
- \`declared_file_size_bytes=null\`
- \`hash_verification_status=not_verified\`
- \`file_read_status=not_read\`
- \`execution_allowed=false\`

## Not Authorized

081B does not authorize PDF reads, PDF hash computation, OCR execution, parser execution, calculator execution, Banxico calls, provider calls, test execution, backend connection, quote generation, quote writes, or real effects.

## Final Decision

DECISION=$DECISION_B

LOCKED_DECISION=$LOCKED_B

NEXT=$PHASE_C
EOF

cat > "$EVIDENCE_DOC_B" <<EOF
# Forge Quote Preview PDF Engine Real PDF File Hash Provenance Implementation 081B

PHASE=$PHASE_B

STATUS=PASS

DECISION=$DECISION_B

LOCKED_DECISION=$LOCKED_B

NEXT=$PHASE_C

## Evidence Summary

081B implements a local/static/read-only real PDF file/hash provenance registry.

It creates metadata-only bindings for real PDF candidates. The bindings are not verified and do not allow execution.

## Discovery Evidence

Discovery JSON:

\`$DISCOVERY_JSON_FOUND\`

Discovery report:

\`${DISCOVERY_REPORT_MD:-not_found}\`

Discovery digest:

\`\`\`json
$(cat "$DISCOVERY_DIGEST_JSON")
\`\`\`

## Test Evidence

The focused test validates:

- adapter identity and schema;
- registry shape;
- required binding fields;
- all four real PDF candidate bindings exist;
- candidate file path is null;
- declared sha256 is null;
- declared file size is null;
- hash verification remains \`not_verified\`;
- file read status remains \`not_read\`;
- execution remains false;
- missing binding returns safe error;
- all safety flags remain false.

## Final

DECISION=$DECISION_B

LOCKED_DECISION=$LOCKED_B

NEXT=$PHASE_C
EOF

cat > "$CERT_DOC_B" <<EOF
# Forge Quote Preview PDF Engine Real PDF File Hash Provenance Implementation Certificate 081B

PHASE=$PHASE_B

CERTIFICATE_STATUS=PASS

DECISION=$DECISION_B

LOCKED_DECISION=$LOCKED_B

NEXT=$PHASE_C

## Certificate

081B certifies that Forge now has a local/static/read-only real PDF file/hash provenance registry.

Certified statements:

- registry is read-only;
- real PDF candidate bindings exist;
- bindings remain unbound and not verified;
- PDF reads are blocked;
- hash computation is blocked;
- OCR/parser/test execution is blocked;
- backend/quote writes are blocked;
- all safety flags remain false.

## Final Token

$DECISION_B
EOF

cat > "$AUDIT_JSON_B" <<EOF
{
  "phase": "$PHASE_B",
  "status": "PASS",
  "decision": "$DECISION_B",
  "lockedDecision": "$LOCKED_B",
  "base": {
    "phase": "081A_QUOTE_PREVIEW_PDF_ENGINE_REAL_PDF_FILE_HASH_PROVENANCE_SCOPE",
    "confirmed": true,
    "lockedDecision": "QUOTE_PREVIEW_PDF_ENGINE_REAL_PDF_FILE_HASH_PROVENANCE_SCOPED"
  },
  "next": "$PHASE_C",
  "implementation": {
    "adapter": "$ADAPTER",
    "test": "$TEST",
    "adapterId": "forge.quote_preview.pdf_engine.real_pdf_file_hash_provenance.registry.adapter.v1",
    "schemaVersion": "forge.quote_preview.pdf_engine.real_pdf_file_hash_provenance.registry.v1",
    "domainId": "quote_preview_pdf_engine_real_pdf_file_hash_provenance",
    "mode": "read_only",
    "routeClass": "preview_safe",
    "registryType": "local_static_read_only_real_pdf_file_hash_provenance_registry",
    "overallBindingStatus": "not_bound_not_verified_not_ready",
    "pdfReadIntroduced": false,
    "hashComputationIntroduced": false,
    "ocrExecutionIntroduced": false,
    "parserExecutionIntroduced": false,
    "calculatorExecutionIntroduced": false,
    "banxicoCallIntroduced": false,
    "testExecutionIntroduced": false,
    "backendConnectionIntroduced": false,
    "quoteTruthIntroduced": false,
    "newExtractorCreated": false,
    "newParserCreated": false,
    "newCalculatorCreated": false
  },
  "discoveryEvidence": $(cat "$DISCOVERY_DIGEST_JSON"),
  "bindings": {
    "realPdfOcrSolucionline": "not_bound_not_verified",
    "realGmmQuote": "not_bound_not_verified",
    "realRetirementScenario": "not_bound_not_verified",
    "realRetirementMxnScenario": "not_bound_not_verified"
  },
  "notAuthorized": {
    "pdfRead": false,
    "pdfHashComputation": false,
    "ocrExecution": false,
    "parserExecution": false,
    "calculatorExecution": false,
    "banxicoCall": false,
    "providerCall": false,
    "testExecution": false,
    "backendConnection": false,
    "quoteGeneration": false,
    "quoteWrite": false,
    "quoteSend": false,
    "crmWrite": false,
    "policyWrite": false,
    "pipelineWrite": false,
    "taskCreate": false,
    "calendarCreate": false,
    "messageSend": false,
    "realEngineExecution": false
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

stage "081B UPDATE BUILD TREE / ROADMAP"
TREE_BLOCK_B="$(mktemp)"
cat > "$TREE_BLOCK_B" <<EOF
<!-- FORGE:$PHASE_B:START -->
## 081B Quote Preview PDF Engine Real PDF File Hash Provenance Implementation

081B implements a local/static/read-only real PDF file/hash provenance registry.

Locked decision:
\`$LOCKED_B\`

Implemented:

- \`$ADAPTER\`
- \`$TEST\`

Registry status:

- \`not_bound_not_verified_not_ready\`

Bound candidates:

- \`real_pdf_ocr_solucionline_candidate\`
- \`real_gmm_quote_candidate\`
- \`real_retirement_scenario_candidate\`
- \`real_retirement_mxn_scenario_candidate\`

Every binding remains:

- \`candidate_file_path=null\`
- \`declared_sha256=null\`
- \`declared_file_size_bytes=null\`
- \`hash_verification_status=not_verified\`
- \`file_read_status=not_read\`
- \`execution_allowed=false\`

Boundaries:

- no PDF read;
- no hash computation;
- no OCR/parser/calculator/Banxico/provider/test execution;
- no backend or quote write.

DECISION=$DECISION_B

LOCKED_DECISION=$LOCKED_B

NEXT=$PHASE_C
<!-- FORGE:$PHASE_B:END -->
EOF

for tree in FORGE_MASTER_BUILD_TREE.md docs/architecture/source-truth/FORGE_UNIFIED_BUILD_TREE_001.md docs/roadmap/FORGE_ROADMAP_LOCK_001.md; do
  replace_or_append_block "$tree" "$PHASE_B" "$TREE_BLOCK_B"
done
trim_tree_files

stage "081B VALIDATION / COMMIT"
run bash -n "$0"
run node --check "$ADAPTER"
run node --check "$TEST"
run node "$TEST"
run python3 -m json.tool "$AUDIT_JSON_B"
run rg -n "$PHASE_B|$DECISION_B|$LOCKED_B|$PHASE_C|real PDF file hash|not_bound_not_verified_not_ready|not_verified|not_read|execution_allowed=false" \
  FORGE_MASTER_BUILD_TREE.md docs/architecture/source-truth/FORGE_UNIFIED_BUILD_TREE_001.md docs/roadmap/FORGE_ROADMAP_LOCK_001.md \
  "$ARCH_DOC_B" "$EVIDENCE_DOC_B" "$CERT_DOC_B" "$AUDIT_JSON_B" "$ADAPTER" "$TEST"
run git diff --check
safety_scan FORGE_MASTER_BUILD_TREE.md docs/architecture/source-truth/FORGE_UNIFIED_BUILD_TREE_001.md docs/roadmap/FORGE_ROADMAP_LOCK_001.md "$ARCH_DOC_B" "$EVIDENCE_DOC_B" "$CERT_DOC_B" "$AUDIT_JSON_B" "$ADAPTER" "$TEST"

mkdir -p "$(dirname "$SCRIPT_IN_REPO")"
cp "$0" "$SCRIPT_IN_REPO"
chmod +x "$SCRIPT_IN_REPO"

stage_authorized_and_commit \
  "feat: implement quote preview pdf real file hash provenance registry" \
  FORGE_MASTER_BUILD_TREE.md \
  docs/architecture/source-truth/FORGE_UNIFIED_BUILD_TREE_001.md \
  docs/roadmap/FORGE_ROADMAP_LOCK_001.md \
  "$ADAPTER" "$TEST" "$ARCH_DOC_B" "$EVIDENCE_DOC_B" "$CERT_DOC_B" "$AUDIT_JSON_B" "$SCRIPT_IN_REPO"

# -------------------------------------------------------------------
# 081C QA LOCK
# -------------------------------------------------------------------
stage "081C SEMANTIC QA"
SEMANTIC_QA_JSON="$(mktemp)"
node <<'NODE' > "$SEMANTIC_QA_JSON"
const assert = require("node:assert/strict");
const fileHash = require("./platform/adapters/quote-preview/quote-preview-pdf-engine-real-pdf-file-hash-provenance-registry-adapter-081b.js");

function resultOk(result) {
  if (result === true) return true;
  if (result && result.ok === true) return true;
  if (result && result.valid === true) return true;
  if (result && result.isValid === true) return true;
  if (result && Array.isArray(result.errors) && result.errors.length === 0) return true;
  return false;
}

assert.equal(fileHash.ADAPTER_ID, "forge.quote_preview.pdf_engine.real_pdf_file_hash_provenance.registry.adapter.v1");
assert.equal(fileHash.SCHEMA_VERSION, "forge.quote_preview.pdf_engine.real_pdf_file_hash_provenance.registry.v1");
assert.equal(fileHash.MODE, "read_only");
assert.equal(fileHash.ROUTE_CLASS, "preview_safe");

const catalog = fileHash.getQuotePreviewPdfEngineRealPdfFileHashProvenanceRegistryCatalog();
assert.equal(catalog.registry_type, "local_static_read_only_real_pdf_file_hash_provenance_registry");
assert.equal(catalog.overall_binding_status, "not_bound_not_verified_not_ready");
assert.equal(resultOk(fileHash.validateRealPdfFileHashRegistryCatalog(catalog)), true);
assert.equal(catalog.bindings.length, 4);

for (const flag of [
  "execution_allowed_in_registry",
  "pdf_read_allowed_in_registry",
  "pdf_hash_computation_allowed_in_registry",
  "ocr_execution_allowed_in_registry",
  "parser_execution_allowed_in_registry",
  "calculator_execution_allowed_in_registry",
  "banxico_call_allowed_in_registry",
  "provider_call_allowed_in_registry",
  "test_execution_allowed_in_registry",
  "backend_connection_allowed_in_registry",
  "quote_write_allowed_in_registry",
]) {
  assert.equal(catalog[flag], false, `${flag} must be false`);
}

const requiredIds = [
  "binding_real_pdf_ocr_solucionline_file_hash",
  "binding_real_gmm_quote_pdf_file_hash",
  "binding_real_retirement_scenario_pdf_file_hash",
  "binding_real_retirement_mxn_scenario_pdf_file_hash",
];

for (const id of requiredIds) {
  const binding = fileHash.getRealPdfFileHashBindingById(id);
  assert.equal(binding.binding_id, id);
  assert.equal(binding.candidate_file_path, null);
  assert.equal(binding.declared_sha256, null);
  assert.equal(binding.declared_file_size_bytes, null);
  assert.equal(binding.hash_verification_status, fileHash.HASH_VERIFICATION_STATUSES.NOT_VERIFIED);
  assert.equal(binding.file_read_status, fileHash.FILE_READ_STATUSES.NOT_READ);
  assert.equal(binding.execution_allowed, false);
  assert(binding.safe_errors.includes(fileHash.SAFE_ERROR_CODES.FILE_PATH_NOT_BOUND));
  assert(binding.safe_errors.includes(fileHash.SAFE_ERROR_CODES.HASH_NOT_BOUND));
  assert(binding.safe_errors.includes(fileHash.SAFE_ERROR_CODES.PDF_READ_NOT_AUTHORIZED));
  assert(binding.safe_errors.includes(fileHash.SAFE_ERROR_CODES.HASH_COMPUTE_NOT_AUTHORIZED));
  assert(binding.safe_errors.includes(fileHash.SAFE_ERROR_CODES.EXECUTION_NOT_AUTHORIZED));
  assert.equal(resultOk(fileHash.validateRealPdfFileHashBindingShape(binding)), true);
}

assert.equal(fileHash.getUnboundRealPdfFileHashBindings().length, 4);
assert.equal(fileHash.getNotVerifiedRealPdfFileHashBindings().length, 4);

const missing = fileHash.getRealPdfFileHashBindingById("missing_binding_for_081c");
assert.equal(missing.readModelStatus, "error");
assert.equal(missing.execution_allowed, false);
assert(missing.safe_errors.includes(fileHash.SAFE_ERROR_CODES.BINDING_NOT_MAPPED));
assert(missing.safe_errors.includes(fileHash.SAFE_ERROR_CODES.PDF_READ_NOT_AUTHORIZED));
assert(missing.safe_errors.includes(fileHash.SAFE_ERROR_CODES.EXECUTION_NOT_AUTHORIZED));
assert.equal(resultOk(fileHash.validateRealPdfFileHashBindingShape(missing)), true);

for (const [key, value] of Object.entries(fileHash.DEFAULT_SAFETY_FLAGS || {})) {
  assert.equal(value, false, `DEFAULT_SAFETY_FLAGS.${key} must be false`);
}

for (const binding of catalog.bindings) {
  for (const [key, value] of Object.entries(binding.safety_flags || {})) {
    assert.equal(value, false, `${binding.binding_id}.${key} must be false`);
  }
}

const combined = JSON.stringify({ catalog, missing, flags: fileHash.DEFAULT_SAFETY_FLAGS });
const forbiddenFragments = [
  '"pdfRead":' + 'true',
  '"ocrExecution":' + 'true',
  '"parserExecution":' + 'true',
  '"calculatorExecution":' + 'true',
  '"banxicoCall":' + 'true',
  '"realEngineExecution":' + 'true',
  '"providerRuntime":' + 'true',
  '"quoteWrite":' + 'true',
  '"backendConnection":' + 'true',
  '"testExecution":' + 'true'
];

for (const fragment of forbiddenFragments) {
  assert(!combined.includes(fragment), `forbidden true flag found: ${fragment}`);
}

console.log(JSON.stringify({
  status: "PASS",
  adapterId: fileHash.ADAPTER_ID,
  schemaVersion: fileHash.SCHEMA_VERSION,
  catalogValidated: true,
  bindingCount: catalog.bindings.length,
  allBindingsUnbound: true,
  allBindingsNotVerified: true,
  allBindingsNotRead: true,
  allBindingsExecutionAllowedFalse: true,
  unboundBindingsCount: fileHash.getUnboundRealPdfFileHashBindings().length,
  notVerifiedBindingsCount: fileHash.getNotVerifiedRealPdfFileHashBindings().length,
  missingBindingSafeErrorValidated: true,
  noPdfRead: true,
  noHashComputation: true,
  noOcrExecution: true,
  noParserExecution: true,
  noCalculatorExecution: true,
  noBanxicoCall: true,
  noProviderCall: true,
  noTestExecution: true,
  noBackendConnection: true,
  noQuoteWrite: true,
  allSafetyFlagsFalse: true
}, null, 2));
NODE

cat "$SEMANTIC_QA_JSON"
pass "081C semantic QA passed"

stage "081C WRITE DOCS / EVIDENCE"
cat > "$ARCH_DOC_C" <<EOF
# Forge Quote Preview PDF Engine Real PDF File Hash Provenance QA Lock 081C

PHASE=$PHASE_C

STATUS=PASS

DECISION=$DECISION_C

LOCKED_DECISION=$LOCKED_C

NEXT=$PHASE_D

## Purpose

081C QA locks the 081B real PDF file/hash provenance registry.

The QA confirms that all real PDF bindings remain metadata-only, unbound, not verified, not read, and not executable.

## QA Validated

- adapter identity and schema;
- registry shape;
- required binding fields;
- all four real PDF candidates;
- \`candidate_file_path=null\`;
- \`declared_sha256=null\`;
- \`declared_file_size_bytes=null\`;
- \`hash_verification_status=not_verified\`;
- \`file_read_status=not_read\`;
- \`execution_allowed=false\`;
- missing binding safe error;
- all safety flags false.

## Not Authorized

081C does not authorize PDF reads, hash computation, OCR execution, parser execution, calculator execution, Banxico calls, provider calls, test execution, backend connection, quote generation, quote writes, or real effects.

## Final Decision

DECISION=$DECISION_C

LOCKED_DECISION=$LOCKED_C

NEXT=$PHASE_D
EOF

cat > "$EVIDENCE_DOC_C" <<EOF
# Forge Quote Preview PDF Engine Real PDF File Hash Provenance QA Lock 081C

PHASE=$PHASE_C

STATUS=PASS

DECISION=$DECISION_C

LOCKED_DECISION=$LOCKED_C

NEXT=$PHASE_D

## Evidence Summary

081C validates the 081B registry as local/static/read-only and no-effect.

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
# Forge Quote Preview PDF Engine Real PDF File Hash Provenance QA Lock Certificate 081C

PHASE=$PHASE_C

CERTIFICATE_STATUS=PASS

DECISION=$DECISION_C

LOCKED_DECISION=$LOCKED_C

NEXT=$PHASE_D

## Certificate

081C certifies that the real PDF file/hash provenance registry is QA locked.

Certified statements:

- all candidate bindings remain unbound;
- all hashes remain not verified;
- all files remain not read;
- all executions remain false;
- all safety flags remain false.

## Final Token

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
  "adapter": "$ADAPTER",
  "test": "$TEST",
  "semanticQa": $(cat "$SEMANTIC_QA_JSON"),
  "discoveryEvidence": $(cat "$DISCOVERY_DIGEST_JSON"),
  "qaValidated": {
    "registryShapeValidates": true,
    "bindingCount": 4,
    "allBindingsUnbound": true,
    "allBindingsNotVerified": true,
    "allBindingsNotRead": true,
    "executionAllowedFalse": true,
    "missingBindingSafeError": true,
    "allSafetyFlagsFalse": true
  },
  "notAuthorized": {
    "pdfRead": false,
    "pdfHashComputation": false,
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

stage "081C UPDATE BUILD TREE / ROADMAP"
TREE_BLOCK_C="$(mktemp)"
cat > "$TREE_BLOCK_C" <<EOF
<!-- FORGE:$PHASE_C:START -->
## 081C Quote Preview PDF Engine Real PDF File Hash Provenance QA Lock

081C QA locks the 081B real PDF file/hash provenance registry.

Locked decision:
\`$LOCKED_C\`

QA validated:

- registry shape validates;
- all four real PDF candidate bindings exist;
- every binding remains unbound;
- every hash remains \`not_verified\`;
- every file remains \`not_read\`;
- every execution remains \`false\`;
- missing binding returns safe error;
- all safety flags remain false;
- no PDF read/hash computation/OCR/parser/test execution is authorized.

DECISION=$DECISION_C

LOCKED_DECISION=$LOCKED_C

NEXT=$PHASE_D
<!-- FORGE:$PHASE_C:END -->
EOF

for tree in FORGE_MASTER_BUILD_TREE.md docs/architecture/source-truth/FORGE_UNIFIED_BUILD_TREE_001.md docs/roadmap/FORGE_ROADMAP_LOCK_001.md; do
  replace_or_append_block "$tree" "$PHASE_C" "$TREE_BLOCK_C"
done
trim_tree_files

stage "081C VALIDATION / COMMIT"
run bash -n "$SCRIPT_IN_REPO"
run node --check "$ADAPTER"
run node --check "$TEST"
run node "$TEST"
run python3 -m json.tool "$AUDIT_JSON_C"
run rg -n "$PHASE_C|$DECISION_C|$LOCKED_C|$PHASE_D|QA locks|not_verified|not_read|unbound|execution remains false" \
  FORGE_MASTER_BUILD_TREE.md docs/architecture/source-truth/FORGE_UNIFIED_BUILD_TREE_001.md docs/roadmap/FORGE_ROADMAP_LOCK_001.md \
  "$ARCH_DOC_C" "$EVIDENCE_DOC_C" "$CERT_DOC_C" "$AUDIT_JSON_C"
run git diff --check
safety_scan FORGE_MASTER_BUILD_TREE.md docs/architecture/source-truth/FORGE_UNIFIED_BUILD_TREE_001.md docs/roadmap/FORGE_ROADMAP_LOCK_001.md "$ARCH_DOC_C" "$EVIDENCE_DOC_C" "$CERT_DOC_C" "$AUDIT_JSON_C" "$ADAPTER" "$TEST"

stage_authorized_and_commit \
  "docs: lock quote preview pdf real file hash provenance qa" \
  FORGE_MASTER_BUILD_TREE.md \
  docs/architecture/source-truth/FORGE_UNIFIED_BUILD_TREE_001.md \
  docs/roadmap/FORGE_ROADMAP_LOCK_001.md \
  "$ARCH_DOC_C" "$EVIDENCE_DOC_C" "$CERT_DOC_C" "$AUDIT_JSON_C" "$SCRIPT_IN_REPO"

# -------------------------------------------------------------------
# 081D DECISION LOCK
# -------------------------------------------------------------------
stage "081D DECISION ASSERTIONS"
DECISION_QA_JSON="$(mktemp)"
node <<'NODE' > "$DECISION_QA_JSON"
const assert = require("node:assert/strict");
const fileHash = require("./platform/adapters/quote-preview/quote-preview-pdf-engine-real-pdf-file-hash-provenance-registry-adapter-081b.js");

function resultOk(result) {
  if (result === true) return true;
  if (result && result.ok === true) return true;
  if (result && result.valid === true) return true;
  if (result && result.isValid === true) return true;
  if (result && Array.isArray(result.errors) && result.errors.length === 0) return true;
  return false;
}

const catalog = fileHash.getQuotePreviewPdfEngineRealPdfFileHashProvenanceRegistryCatalog();
assert.equal(catalog.overall_binding_status, "not_bound_not_verified_not_ready");
assert.equal(resultOk(fileHash.validateRealPdfFileHashRegistryCatalog(catalog)), true);
assert.equal(catalog.bindings.length, 4);

for (const binding of catalog.bindings) {
  assert.equal(binding.candidate_file_path, null);
  assert.equal(binding.declared_sha256, null);
  assert.equal(binding.declared_file_size_bytes, null);
  assert.equal(binding.hash_verification_status, fileHash.HASH_VERIFICATION_STATUSES.NOT_VERIFIED);
  assert.equal(binding.file_read_status, fileHash.FILE_READ_STATUSES.NOT_READ);
  assert.equal(binding.execution_allowed, false);
}

assert.equal(fileHash.getUnboundRealPdfFileHashBindings().length, 4);
assert.equal(fileHash.getNotVerifiedRealPdfFileHashBindings().length, 4);

for (const [key, value] of Object.entries(fileHash.DEFAULT_SAFETY_FLAGS || {})) {
  assert.equal(value, false, `DEFAULT_SAFETY_FLAGS.${key} must be false`);
}

console.log(JSON.stringify({
  status: "PASS",
  locked_as: "local_static_read_only_not_verified_reference_registry",
  adapter_id: fileHash.ADAPTER_ID,
  schema_version: fileHash.SCHEMA_VERSION,
  overall_binding_status: catalog.overall_binding_status,
  bindings_count: catalog.bindings.length,
  all_bindings_unbound: true,
  all_hashes_not_verified: true,
  all_files_not_read: true,
  all_executions_false: true,
  next_scope: "082A_QUOTE_PREVIEW_PDF_ENGINE_EXPECTED_VALUE_SOURCE_TRACE_SCOPE",
  pdf_read_blocked: true,
  hash_computation_blocked: true,
  ocr_execution_blocked: true,
  parser_execution_blocked: true,
  test_execution_blocked: true,
  backend_connection_blocked: true,
  quote_write_blocked: true,
  all_safety_flags_false: true
}, null, 2));
NODE

cat "$DECISION_QA_JSON"
pass "081D decision assertions passed"

stage "081D WRITE DOCS / EVIDENCE"
cat > "$ARCH_DOC_D" <<EOF
# Forge Quote Preview PDF Engine Real PDF File Hash Provenance Decision Lock 081D

PHASE=$PHASE_D

STATUS=PASS

DECISION=$DECISION_D

LOCKED_DECISION=$LOCKED_D

NEXT=$NEXT_AFTER_D

## Purpose

081D decision-locks the 081B/081C real PDF file/hash provenance registry as a local/static/read-only not-verified reference registry.

The registry remains a metadata guardrail only.

## Locked Meaning

The registry is approved only as:

- local/static;
- read-only;
- reference registry;
- real PDF candidate metadata binding;
- not-bound;
- not-verified;
- not-read;
- not-executable.

## Confirmed

- all four real PDF candidate bindings exist;
- no candidate file path is bound;
- no declared sha256 is bound;
- no declared file size is bound;
- hash verification remains \`not_verified\`;
- file read status remains \`not_read\`;
- execution remains \`false\`;
- PDF reads remain blocked;
- hash computation remains blocked;
- OCR/parser/test execution remains blocked.

## Next Architectural Unlock

082A may scope expected-value source trace.

082A must not execute tests, read PDFs, run OCR, run parsers, run calculators, call Banxico/providers, connect backend, write quotes, or create real effects.

## Final Decision

DECISION=$DECISION_D

LOCKED_DECISION=$LOCKED_D

NEXT=$NEXT_AFTER_D
EOF

cat > "$EVIDENCE_DOC_D" <<EOF
# Forge Quote Preview PDF Engine Real PDF File Hash Provenance Decision Lock 081D

PHASE=$PHASE_D

STATUS=PASS

DECISION=$DECISION_D

LOCKED_DECISION=$LOCKED_D

NEXT=$NEXT_AFTER_D

## Evidence Summary

081D locks the real PDF file/hash provenance registry as a local/static/read-only not-verified reference registry.

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
# Forge Quote Preview PDF Engine Real PDF File Hash Provenance Decision Lock Certificate 081D

PHASE=$PHASE_D

CERTIFICATE_STATUS=PASS

DECISION=$DECISION_D

LOCKED_DECISION=$LOCKED_D

NEXT=$NEXT_AFTER_D

## Certificate

081D certifies that the real PDF file/hash provenance registry is locked as a local/static/read-only not-verified reference registry.

Certified statements:

- all bindings remain unbound;
- all hashes remain not verified;
- all files remain not read;
- all executions remain false;
- next work is expected-value source trace scope;
- no PDF reads, hash computation, OCR/parser/test execution, backend, or quote writes are authorized.

## Final Token

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
  "lockedAs": "local_static_read_only_not_verified_reference_registry",
  "adapter": "$ADAPTER",
  "test": "$TEST",
  "decisionAssertions": $(cat "$DECISION_QA_JSON"),
  "discoveryEvidence": $(cat "$DISCOVERY_DIGEST_JSON"),
  "confirmed": {
    "registryShapeValidates": true,
    "bindingsCount": 4,
    "allBindingsUnbound": true,
    "allHashesNotVerified": true,
    "allFilesNotRead": true,
    "allExecutionsFalse": true,
    "allSafetyFlagsFalse": true
  },
  "nextScope": {
    "phase": "$NEXT_AFTER_D",
    "purpose": "expected_value_source_trace_scope",
    "executionAllowed": false
  },
  "notAuthorized": {
    "pdfRead": false,
    "pdfHashComputation": false,
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

stage "081D UPDATE BUILD TREE / ROADMAP"
TREE_BLOCK_D="$(mktemp)"
cat > "$TREE_BLOCK_D" <<EOF
<!-- FORGE:$PHASE_D:START -->
## 081D Quote Preview PDF Engine Real PDF File Hash Provenance Decision Lock

081D decision-locks the 081B/081C real PDF file/hash provenance registry as a local/static/read-only not-verified reference registry.

Locked decision:
\`$LOCKED_D\`

Confirmed:

- all four real PDF candidate bindings exist;
- all bindings remain unbound;
- all hashes remain \`not_verified\`;
- all files remain \`not_read\`;
- all executions remain \`false\`;
- PDF reads remain blocked;
- hash computation remains blocked;
- OCR/parser/test execution remains blocked.

Next:

- \`$NEXT_AFTER_D\` may scope expected-value source trace only.
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

stage "081D VALIDATION / COMMIT"
run bash -n "$SCRIPT_IN_REPO"
run node --check "$ADAPTER"
run node --check "$TEST"
run node "$TEST"
run python3 -m json.tool "$AUDIT_JSON_D"
run rg -n "$PHASE_D|$DECISION_D|$LOCKED_D|$NEXT_AFTER_D|not-verified reference registry|all bindings remain unbound|all hashes remain|all files remain|No execution" \
  FORGE_MASTER_BUILD_TREE.md docs/architecture/source-truth/FORGE_UNIFIED_BUILD_TREE_001.md docs/roadmap/FORGE_ROADMAP_LOCK_001.md \
  "$ARCH_DOC_D" "$EVIDENCE_DOC_D" "$CERT_DOC_D" "$AUDIT_JSON_D"
run git diff --check
safety_scan FORGE_MASTER_BUILD_TREE.md docs/architecture/source-truth/FORGE_UNIFIED_BUILD_TREE_001.md docs/roadmap/FORGE_ROADMAP_LOCK_001.md "$ARCH_DOC_D" "$EVIDENCE_DOC_D" "$CERT_DOC_D" "$AUDIT_JSON_D" "$ADAPTER" "$TEST"

stage_authorized_and_commit \
  "docs: lock quote preview pdf real file hash provenance decision" \
  FORGE_MASTER_BUILD_TREE.md \
  docs/architecture/source-truth/FORGE_UNIFIED_BUILD_TREE_001.md \
  docs/roadmap/FORGE_ROADMAP_LOCK_001.md \
  "$ARCH_DOC_D" "$EVIDENCE_DOC_D" "$CERT_DOC_D" "$AUDIT_JSON_D" "$SCRIPT_IN_REPO"

stage "FINAL CHECKPOINT"
run git status --short --branch
run git log --oneline -12

SUMMARY=$(cat <<EOF
PASS_081BCD_QUOTE_PREVIEW_PDF_ENGINE_REAL_PDF_FILE_HASH_PROVENANCE_FAST_TRACK_COMMIT_PUSH_COMPLETE
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
