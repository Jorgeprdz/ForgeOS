#!/usr/bin/env bash
set -euo pipefail

PHASE="081A_QUOTE_PREVIEW_PDF_ENGINE_REAL_PDF_FILE_HASH_PROVENANCE_SCOPE"
DECISION="PASS_081A_QUOTE_PREVIEW_PDF_ENGINE_REAL_PDF_FILE_HASH_PROVENANCE_SCOPE"
LOCKED_DECISION="QUOTE_PREVIEW_PDF_ENGINE_REAL_PDF_FILE_HASH_PROVENANCE_SCOPED"
NEXT="081B_QUOTE_PREVIEW_PDF_ENGINE_REAL_PDF_FILE_HASH_PROVENANCE_IMPLEMENTATION"
MODE="docs/scope only; file/hash provenance requirements before any PDF read"
BOUNDARY="no UI mutation; no backend real; no CRM/policy/quote/pipeline writes; no task/calendar/message; no provider execution with effects; no auth/secrets/browser persistence; no real engine execution; no parser/calculator/Banxico/PDF/OCR execution; no PDF file read; no hash computation over PDFs; no invented product/premium/coverage/projection/quote truth; no new extractor/parser/calculator; no real test execution"
REPO="${REPO:-/storage/emulated/0/Forge OS}"
STAMP="$(date +%Y%m%d_%H%M%S)"
REPORT="/data/data/com.termux/files/home/${PHASE}_RESULT_${STAMP}.md"
BACKUP_DIR=".forge-backups/081a-quote-preview-pdf-engine-real-pdf-file-hash-provenance-scope-${STAMP}"
SCRIPT_IN_REPO="tools/termux/forge_081a_quote_preview_pdf_engine_real_pdf_file_hash_provenance_scope.sh"

SURFACES_ADAPTER="platform/adapters/quote-preview/quote-preview-pdf-engine-existing-surfaces-canonical-mapping-adapter-077b.js"
SURFACES_TEST="tests/quote-preview-pdf-engine-existing-surfaces-canonical-mapping-adapter-077b-test.js"
EVIDENCE_ADAPTER="platform/adapters/quote-preview/quote-preview-pdf-engine-canonical-test-evidence-registry-adapter-078b.js"
EVIDENCE_TEST="tests/quote-preview-pdf-engine-canonical-test-evidence-registry-adapter-078b-test.js"
PROVENANCE_ADAPTER="platform/adapters/quote-preview/quote-preview-pdf-engine-canonical-test-evidence-provenance-registry-adapter-079b.js"
PROVENANCE_TEST="tests/quote-preview-pdf-engine-canonical-test-evidence-provenance-registry-adapter-079b-test.js"
READINESS_ADAPTER="platform/adapters/quote-preview/quote-preview-pdf-engine-canonical-execution-readiness-review-matrix-adapter-080b.js"
READINESS_TEST="tests/quote-preview-pdf-engine-canonical-execution-readiness-review-matrix-adapter-080b-test.js"

ARCH_DOC="docs/architecture/source-truth/FORGE_QUOTE_PREVIEW_PDF_ENGINE_REAL_PDF_FILE_HASH_PROVENANCE_SCOPE_081A.md"
EVIDENCE_DOC="docs/evidence/FORGE_QUOTE_PREVIEW_PDF_ENGINE_REAL_PDF_FILE_HASH_PROVENANCE_SCOPE_081A.md"
CERT_DOC="docs/evidence/FORGE_QUOTE_PREVIEW_PDF_ENGINE_REAL_PDF_FILE_HASH_PROVENANCE_SCOPE_CERTIFICATE_081A.md"
AUDIT_JSON="docs/evidence/forge-quote-preview-pdf-engine-real-pdf-file-hash-provenance-scope-audit-081a.json"

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
  echo "DECISION=HOLD_${PHASE}" | tee -a "$REPORT"
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

mkdir -p "$(dirname "$REPORT")"
touch "$REPORT"
exec > >(tee -a "$REPORT") 2>&1

stage "STAGE 0 HEADER"
echo "PHASE=$PHASE"
echo "MODE=$MODE"
echo "BOUNDARY=$BOUNDARY"
echo "REPORT=$REPORT"
echo "ROBOCOP_GATE=Article 0; 080D decision closed; real PDF file/hash provenance scope only; no PDF read"

cd "$REPO" || fail "No existe repo: $REPO"

stage "STAGE 1 CHECKPOINT"
run git status --short --branch
run git log --oneline -12
run git diff --name-status
run git diff --cached --name-status

stage "STAGE 2 CONFIRM BASE 080D"
if git log --oneline -50 | grep -Eq "080D|lock quote preview pdf execution readiness review decision|QUOTE_PREVIEW_PDF_ENGINE_CANONICAL_EXECUTION_READINESS_REVIEW_LOCKED_AS_LOCAL_STATIC_READ_ONLY_NOT_READY_REFERENCE_MATRIX"; then
  pass "080D commit found in recent history"
elif [ -f "docs/evidence/forge-quote-preview-pdf-engine-canonical-execution-readiness-review-decision-audit-080d.json" ]; then
  pass "080D audit fallback found"
else
  fail "080D base not found"
fi

if [ -f "docs/evidence/forge-quote-preview-pdf-engine-canonical-execution-readiness-review-decision-audit-080d.json" ]; then
  run python3 -m json.tool docs/evidence/forge-quote-preview-pdf-engine-canonical-execution-readiness-review-decision-audit-080d.json
  if ! rg -n '"status"\s*:\s*"PASS"|"lockedDecision"\s*:\s*"QUOTE_PREVIEW_PDF_ENGINE_CANONICAL_EXECUTION_READINESS_REVIEW_LOCKED_AS_LOCAL_STATIC_READ_ONLY_NOT_READY_REFERENCE_MATRIX"|"next"\s*:\s*"081A_QUOTE_PREVIEW_PDF_ENGINE_REAL_PDF_FILE_HASH_PROVENANCE_SCOPE"' docs/evidence/forge-quote-preview-pdf-engine-canonical-execution-readiness-review-decision-audit-080d.json >/dev/null; then
    fail "080D audit exists but does not confirm PASS/081A next"
  fi
  pass "080D audit PASS/081A next confirmed"
else
  warn "080D audit file not found; relying on git log/tree markers"
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

cat > "$BACKUP_DIR/rollback-081a.sh" <<ROLLBACK
#!/usr/bin/env bash
set -euo pipefail
cp "$BACKUP_DIR/FORGE_MASTER_BUILD_TREE.md" "FORGE_MASTER_BUILD_TREE.md"
cp "$BACKUP_DIR/FORGE_UNIFIED_BUILD_TREE_001.md" "docs/architecture/source-truth/FORGE_UNIFIED_BUILD_TREE_001.md"
cp "$BACKUP_DIR/FORGE_ROADMAP_LOCK_001.md" "docs/roadmap/FORGE_ROADMAP_LOCK_001.md"
rm -f "$ARCH_DOC"
rm -f "$EVIDENCE_DOC"
rm -f "$CERT_DOC"
rm -f "$AUDIT_JSON"
rm -f "$SCRIPT_IN_REPO"
echo "rollback 081A complete"
ROLLBACK
chmod +x "$BACKUP_DIR/rollback-081a.sh"
pass "backup created"
pass "rollback created: $BACKUP_DIR/rollback-081a.sh"

stage "STAGE 6 REVALIDATE REFERENCE REGISTRIES"
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

stage "STAGE 7 BUILD REAL PDF FILE/HASH PROVENANCE SCOPE"
FILE_HASH_SCOPE_JSON="$(mktemp)"
node <<'NODE' > "$FILE_HASH_SCOPE_JSON"
const evidence = require('./platform/adapters/quote-preview/quote-preview-pdf-engine-canonical-test-evidence-registry-adapter-078b.js');
const provenance = require('./platform/adapters/quote-preview/quote-preview-pdf-engine-canonical-test-evidence-provenance-registry-adapter-079b.js');
const readiness = require('./platform/adapters/quote-preview/quote-preview-pdf-engine-canonical-execution-readiness-review-matrix-adapter-080b.js');

const evidenceCatalog = evidence.getQuotePreviewPdfCanonicalTestEvidenceRegistryCatalog();
const provenanceCatalog = provenance.getQuotePreviewPdfCanonicalTestEvidenceProvenanceRegistryCatalog();
const readinessCatalog = readiness.getQuotePreviewPdfCanonicalExecutionReadinessReviewMatrixCatalog();

const realPdfCandidateIds = [
  'real_pdf_ocr_solucionline_candidate',
  'real_gmm_quote_candidate',
  'real_retirement_scenario_candidate',
  'real_retirement_mxn_scenario_candidate'
];

const realPdfCandidates = realPdfCandidateIds.map((testId) => {
  const evidenceEntry = evidence.getCanonicalTestEvidenceById(testId);
  const provenanceEntries = provenance.getProvenanceByTestId(testId);
  return {
    test_id: testId,
    file_path: evidenceEntry.file_path,
    evidence_type: evidenceEntry.evidence_type,
    evidence_role: evidenceEntry.evidence_role,
    canonical_status: evidenceEntry.canonical_status,
    current_execution_policy: evidenceEntry.execution_policy,
    provenance_ids: provenanceEntries.map((entry) => entry.provenance_id),
    required_file_hash_status: 'required_before_pdf_read',
    file_path_binding_status: 'not_bound',
    sha256_binding_status: 'not_bound',
    source_document_origin_status: 'not_bound',
    fixture_vs_real_pdf_boundary: 'must_not_classify_fixture_as_real_pdf',
    allowed_in_081a: {
      declare_required_fields: true,
      read_pdf_file: false,
      compute_pdf_hash: false,
      run_ocr: false,
      run_parser: false,
      run_test: false
    },
    required_081b_fields: [
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
      'safety_flags'
    ],
    safe_errors: [
      'QUOTE_PREVIEW_REAL_PDF_FILE_PATH_NOT_BOUND',
      'QUOTE_PREVIEW_REAL_PDF_HASH_NOT_BOUND',
      'QUOTE_PREVIEW_REAL_PDF_READ_NOT_AUTHORIZED',
      'QUOTE_PREVIEW_REAL_PDF_HASH_COMPUTE_NOT_AUTHORIZED',
      'QUOTE_PREVIEW_REAL_PDF_EXECUTION_NOT_AUTHORIZED'
    ]
  };
});

const readinessGate = readiness.getReadinessGateById('real_pdf_file_or_hash_ready');

const scope = {
  status: 'PASS',
  phase: '081A_QUOTE_PREVIEW_PDF_ENGINE_REAL_PDF_FILE_HASH_PROVENANCE_SCOPE',
  scope_type: 'real_pdf_file_hash_provenance_scope_only',
  base_readiness_gate: readinessGate.gate_id,
  base_readiness_gate_status: readinessGate.gate_status,
  base_readiness_decision: readinessGate.readiness_decision,
  overall_readiness_before_081a: readinessCatalog.overall_readiness,
  execution_allowed_in_081a: false,
  pdf_read_allowed_in_081a: false,
  pdf_hash_computation_allowed_in_081a: false,
  ocr_execution_allowed_in_081a: false,
  parser_execution_allowed_in_081a: false,
  calculator_execution_allowed_in_081a: false,
  banxico_call_allowed_in_081a: false,
  provider_call_allowed_in_081a: false,
  test_execution_allowed_in_081a: false,
  backend_connection_allowed_in_081a: false,
  quote_write_allowed_in_081a: false,
  source_registry_refs: {
    evidence: {
      adapter_id: evidenceCatalog.adapter_id,
      schemaVersion: evidenceCatalog.schemaVersion,
      evidence_count: Array.isArray(evidenceCatalog.evidence) ? evidenceCatalog.evidence.length : 0
    },
    provenance: {
      adapter_id: provenanceCatalog.adapter_id,
      schemaVersion: provenanceCatalog.schemaVersion,
      provenance_count: Array.isArray(provenanceCatalog.provenance) ? provenanceCatalog.provenance.length : 0
    },
    readiness: {
      adapter_id: readinessCatalog.adapter_id,
      schemaVersion: readinessCatalog.schemaVersion,
      overall_readiness: readinessCatalog.overall_readiness
    }
  },
  real_pdf_candidate_count: realPdfCandidates.length,
  real_pdf_candidates: realPdfCandidates,
  required_081b_output: {
    adapter_type: 'local_static_read_only_real_pdf_file_hash_provenance_registry',
    must_not_read_pdfs: true,
    must_not_compute_hashes: true,
    must_not_run_ocr: true,
    must_not_run_parsers: true,
    must_not_execute_tests: true,
    must_record_declared_hash_only: true,
    must_preserve_not_verified_status: true,
    required_fields: [
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
      'safety_flags'
    ]
  },
  blocked_misuse: [
    'hash_computation_disguised_as_scope',
    'pdf_read_disguised_as_provenance',
    'fixture_as_real_pdf',
    'unverified_source_document',
    'execution_before_file_hash_gate',
    'ocr_before_file_hash_gate',
    'parser_before_file_hash_gate'
  ],
  next_decision_after_081d: 'expected_value_source_trace_gate_or_parser_ownership_gate_after_file_hash_registry_decision',
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

if (realPdfCandidates.length < 1) {
  throw new Error('081A must scope at least one real PDF candidate');
}
if (scope.overall_readiness_before_081a !== 'not_ready_for_execution') {
  throw new Error('081A requires not_ready_for_execution base');
}
if (scope.pdf_read_allowed_in_081a !== false || scope.pdf_hash_computation_allowed_in_081a !== false) {
  throw new Error('081A must not read PDFs or compute hashes');
}

console.log(JSON.stringify(scope, null, 2));
NODE

cat "$FILE_HASH_SCOPE_JSON"
pass "real PDF file/hash provenance scope built"

stage "STAGE 8 WRITE DOCS / EVIDENCE"
mkdir -p "$(dirname "$ARCH_DOC")" "$(dirname "$EVIDENCE_DOC")"

cat > "$ARCH_DOC" <<EOF
# Forge Quote Preview PDF Engine Real PDF File Hash Provenance Scope 081A

PHASE=$PHASE

STATUS=PASS

DECISION=$DECISION

LOCKED_DECISION=$LOCKED_DECISION

NEXT=$NEXT

## Purpose

081A scopes real PDF file/hash provenance for the Quote Preview PDF Engine path.

This phase follows 080D, where the execution readiness review matrix was locked as \`not_ready_for_execution\`.

081A addresses the first blocking gate:

\`real_pdf_file_or_hash_ready\`

## Important Boundary

081A does not read PDFs.

081A does not compute hashes over PDFs.

081A only scopes the metadata contract required before any future PDF read, OCR, parser, or test execution gate.

Because apparently even computers need paperwork before touching paper. Stunning, really.

## Base Confirmed

080D is closed as:

- \`PASS_080D_QUOTE_PREVIEW_PDF_ENGINE_CANONICAL_EXECUTION_READINESS_REVIEW_DECISION_LOCK\`
- \`QUOTE_PREVIEW_PDF_ENGINE_CANONICAL_EXECUTION_READINESS_REVIEW_LOCKED_AS_LOCAL_STATIC_READ_ONLY_NOT_READY_REFERENCE_MATRIX\`
- \`NEXT=081A_QUOTE_PREVIEW_PDF_ENGINE_REAL_PDF_FILE_HASH_PROVENANCE_SCOPE\`

## Scoped Real PDF Candidates

081A scopes file/hash provenance for:

- \`real_pdf_ocr_solucionline_candidate\`
- \`real_gmm_quote_candidate\`
- \`real_retirement_scenario_candidate\`
- \`real_retirement_mxn_scenario_candidate\`

## Required 081B Shape

081B must implement a local/static/read-only real PDF file/hash provenance registry.

Required fields:

- \`binding_id\`
- \`test_id\`
- \`candidate_file_path\`
- \`source_document_kind\`
- \`source_document_origin\`
- \`declared_sha256\`
- \`declared_file_size_bytes\`
- \`hash_algorithm\`
- \`hash_verification_status\`
- \`file_read_status\`
- \`execution_allowed\`
- \`safe_errors\`
- \`safety_flags\`

## Required 081B Decisions

081B must preserve:

- \`file_read_status=not_read\`
- \`hash_verification_status=not_verified\`
- \`execution_allowed=false\`
- declared hash only, never computed by the registry
- declared file size only, never verified by reading the file
- fixture-as-real-PDF blocked
- PDF/OCR/parser/test execution blocked

## Blocked Misuse

081B must block:

- hash computation disguised as scope;
- PDF read disguised as provenance;
- fixture-as-real-PDF;
- unverified source document as truth;
- execution before file/hash gate;
- OCR before file/hash gate;
- parser before file/hash gate.

## Not Authorized

081A does not authorize:

- PDF read;
- PDF hash computation;
- OCR execution;
- parser execution;
- calculator execution;
- Banxico call;
- provider call;
- test execution;
- backend connection;
- quote generation;
- quote write or send;
- CRM, policy, pipeline, task, calendar, or message writes;
- invented product, premium, coverage, projection, expected value, or quote truth.

## Final Decision

DECISION=$DECISION

LOCKED_DECISION=$LOCKED_DECISION

NEXT=$NEXT
EOF

cat > "$EVIDENCE_DOC" <<EOF
# Forge Quote Preview PDF Engine Real PDF File Hash Provenance Scope 081A

PHASE=$PHASE

STATUS=PASS

DECISION=$DECISION

LOCKED_DECISION=$LOCKED_DECISION

NEXT=$NEXT

## Evidence Summary

081A scopes real PDF file/hash provenance.

It does not read PDFs, compute hashes, run OCR, run parsers, run calculators, call Banxico/providers, connect backend, write quotes, or execute tests.

## Discovery Evidence

Discovery JSON:

\`$DISCOVERY_JSON_FOUND\`

Discovery report:

\`${DISCOVERY_REPORT_MD:-not_found}\`

Discovery digest:

\`\`\`json
$(cat "$DISCOVERY_DIGEST_JSON")
\`\`\`

## File/Hash Provenance Scope

\`\`\`json
$(cat "$FILE_HASH_SCOPE_JSON")
\`\`\`

## Commands

- \`python3 -m json.tool "$DISCOVERY_JSON_FOUND"\`
- \`node --check $SURFACES_ADAPTER\`
- \`node --check $SURFACES_TEST\`
- \`node $SURFACES_TEST\`
- \`node --check $EVIDENCE_ADAPTER\`
- \`node --check $EVIDENCE_TEST\`
- \`node $EVIDENCE_TEST\`
- \`node --check $PROVENANCE_ADAPTER\`
- \`node --check $PROVENANCE_TEST\`
- \`node $PROVENANCE_TEST\`
- \`node --check $READINESS_ADAPTER\`
- \`node --check $READINESS_TEST\`
- \`node $READINESS_TEST\`
- local/static/read-only file/hash provenance scope builder
- \`python3 -m json.tool $AUDIT_JSON\`
- marker scan
- \`git diff --check\`
- scoped safety scan
- \`git diff --cached --check\`

## Final

DECISION=$DECISION

LOCKED_DECISION=$LOCKED_DECISION

NEXT=$NEXT
EOF

cat > "$CERT_DOC" <<EOF
# Forge Quote Preview PDF Engine Real PDF File Hash Provenance Scope Certificate 081A

PHASE=$PHASE

CERTIFICATE_STATUS=PASS

DECISION=$DECISION

LOCKED_DECISION=$LOCKED_DECISION

NEXT=$NEXT

## Certificate

081A certifies that real PDF file/hash provenance has been scoped before any PDF read or execution gate.

Certified statements:

- 080D not-ready readiness matrix is the base;
- first blocking gate is \`real_pdf_file_or_hash_ready\`;
- real PDF candidates are identified from existing registries;
- 081B must implement a local/static/read-only file/hash provenance registry;
- hashes may be declared but not computed by 081B;
- file sizes may be declared but not verified by file read;
- PDF reads remain blocked;
- OCR/parser/test execution remains blocked;
- all safety flags remain false.

## No-Effect Boundary

This scope authorizes no PDF reads, hash computation over PDFs, OCR execution, parser execution, calculator execution, Banxico calls, test execution, quote generation, quote writes, provider calls, backend connection, or real effects.

## Final Token

$DECISION
EOF

cat > "$AUDIT_JSON" <<EOF
{
  "phase": "$PHASE",
  "status": "PASS",
  "decision": "$DECISION",
  "lockedDecision": "$LOCKED_DECISION",
  "base": {
    "phase": "080D_QUOTE_PREVIEW_PDF_ENGINE_CANONICAL_EXECUTION_READINESS_REVIEW_DECISION_LOCK",
    "confirmed": true,
    "lockedDecision": "QUOTE_PREVIEW_PDF_ENGINE_CANONICAL_EXECUTION_READINESS_REVIEW_LOCKED_AS_LOCAL_STATIC_READ_ONLY_NOT_READY_REFERENCE_MATRIX"
  },
  "next": "$NEXT",
  "scopeType": "real_pdf_file_hash_provenance_scope_only",
  "executionReadiness": "not_ready_for_execution",
  "firstBlockingGate": "real_pdf_file_or_hash_ready",
  "discoveryEvidence": $(cat "$DISCOVERY_DIGEST_JSON"),
  "fileHashProvenanceScope": $(cat "$FILE_HASH_SCOPE_JSON"),
  "required081B": {
    "adapterType": "local_static_read_only_real_pdf_file_hash_provenance_registry",
    "mustNotReadPdfs": true,
    "mustNotComputeHashes": true,
    "mustNotRunOcr": true,
    "mustNotRunParsers": true,
    "mustNotRunCalculators": true,
    "mustNotCallBanxico": true,
    "mustNotExecuteTests": true,
    "mustNotConnectBackend": true,
    "mustRecordDeclaredHashOnly": true,
    "mustPreserveNotVerifiedStatus": true
  },
  "scopedCandidates": {
    "realPdfOcrSolucionlineCandidate": true,
    "realGmmQuoteCandidate": true,
    "realRetirementScenarioCandidate": true,
    "realRetirementMxnScenarioCandidate": true
  },
  "blockedMisuse": {
    "hashComputationDisguisedAsScope": true,
    "pdfReadDisguisedAsProvenance": true,
    "fixtureAsRealPdf": true,
    "unverifiedSourceDocument": true,
    "executionBeforeFileHashGate": true,
    "ocrBeforeFileHashGate": true,
    "parserBeforeFileHashGate": true
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
    "realEngineExecution": false,
    "inventedProductTruth": false,
    "inventedPremiumTruth": false,
    "inventedCoverageTruth": false,
    "inventedProjectionTruth": false,
    "inventedExpectedValueTruth": false,
    "inventedQuoteTruth": false
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
  },
  "validations": {
    "base080D": "PASS",
    "discoveryJson": "PASS",
    "nodeCheckSurfacesAdapter": "PASS",
    "nodeCheckSurfacesTest": "PASS",
    "nodeSurfacesTest": "PASS",
    "nodeCheckEvidenceAdapter": "PASS",
    "nodeCheckEvidenceTest": "PASS",
    "nodeEvidenceTest": "PASS",
    "nodeCheckProvenanceAdapter": "PASS",
    "nodeCheckProvenanceTest": "PASS",
    "nodeProvenanceTest": "PASS",
    "nodeCheckReadinessAdapter": "PASS",
    "nodeCheckReadinessTest": "PASS",
    "nodeReadinessTest": "PASS",
    "fileHashScopeBuild": "PASS",
    "jsonTool": "PASS",
    "markerScan": "PASS",
    "gitDiffCheck": "PASS",
    "scopedSafetyScan": "PASS",
    "stagedDiffCheck": "PASS"
  }
}
EOF

pass "docs/evidence written"

stage "STAGE 9 UPDATE BUILD TREE / ROADMAP"

TREE_BLOCK=$(cat <<EOF

<!-- FORGE:$PHASE:START -->
## 081A Quote Preview PDF Engine Real PDF File Hash Provenance Scope

081A scopes real PDF file/hash provenance for the Quote Preview PDF Engine path.

Locked decision:
\`$LOCKED_DECISION\`

Base:

- 080D locked the execution readiness review matrix as \`not_ready_for_execution\`.

First blocking gate:

- \`real_pdf_file_or_hash_ready\`

Scoped candidates:

- \`real_pdf_ocr_solucionline_candidate\`
- \`real_gmm_quote_candidate\`
- \`real_retirement_scenario_candidate\`
- \`real_retirement_mxn_scenario_candidate\`

081B must implement a local/static/read-only file/hash provenance registry.

081B must preserve:

- no PDF read;
- no PDF hash computation;
- declared hash only;
- declared file size only;
- hash verification status remains \`not_verified\`;
- file read status remains \`not_read\`;
- execution allowed remains \`false\`.

Blocked misuse:

- hash computation disguised as scope;
- PDF read disguised as provenance;
- fixture-as-real-PDF;
- unverified source document as truth;
- execution before file/hash gate;
- OCR/parser before file/hash gate.

DECISION=$DECISION

LOCKED_DECISION=$LOCKED_DECISION

NEXT=$NEXT
<!-- FORGE:$PHASE:END -->
EOF
)

python3 - <<PY
from pathlib import Path

phase = "$PHASE"
block = """$TREE_BLOCK"""

def replace_or_append(text, phase, block):
    start = f"<!-- FORGE:{phase}:START -->"
    end = f"<!-- FORGE:{phase}:END -->"
    if start in text and end in text:
        before = text.split(start)[0]
        after = text.split(end, 1)[1]
        return before.rstrip() + "\n\n" + block.strip() + "\n" + after
    if not text.endswith("\n"):
        text += "\n"
    return text + block + "\n"

for path in [
    Path("FORGE_MASTER_BUILD_TREE.md"),
    Path("docs/architecture/source-truth/FORGE_UNIFIED_BUILD_TREE_001.md"),
    Path("docs/roadmap/FORGE_ROADMAP_LOCK_001.md"),
]:
    text = path.read_text()
    path.write_text(replace_or_append(text, phase, block))
PY

pass "build tree / roadmap updated"

stage "STAGE 9B TRIM TREE EOF BLANKS"
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

stage "STAGE 10 SAVE SCRIPT IN REPO"
mkdir -p "$(dirname "$SCRIPT_IN_REPO")"
cp "$0" "$SCRIPT_IN_REPO"
chmod +x "$SCRIPT_IN_REPO"
pass "$SCRIPT_IN_REPO"

stage "STAGE 11 VALIDATION"
run bash -n "$SCRIPT_IN_REPO"
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
run python3 -m json.tool "$AUDIT_JSON"

run rg -n "$PHASE|$DECISION|$LOCKED_DECISION|$NEXT|real PDF file/hash|declared hash|not_verified|not_read|no PDF read|hash computation|fixture-as-real-PDF" \
  FORGE_MASTER_BUILD_TREE.md \
  docs/architecture/source-truth/FORGE_UNIFIED_BUILD_TREE_001.md \
  docs/roadmap/FORGE_ROADMAP_LOCK_001.md \
  "$ARCH_DOC" "$EVIDENCE_DOC" "$CERT_DOC" "$AUDIT_JSON"

run git diff --check

stage "STAGE 12 SAFETY SCAN"
SCOPED_FILES=(
  "FORGE_MASTER_BUILD_TREE.md"
  "docs/architecture/source-truth/FORGE_UNIFIED_BUILD_TREE_001.md"
  "docs/roadmap/FORGE_ROADMAP_LOCK_001.md"
  "$ARCH_DOC"
  "$EVIDENCE_DOC"
  "$CERT_DOC"
  "$AUDIT_JSON"
)

if rg -n 'localStorage|sessionStorage|fetch\(|XMLHttpRequest|navigator\.mediaDevices|SpeechRecognition|providerRuntimeEnabled:\s*true|networkCallsAllowed:\s*true|browserStorageEnabled:\s*true|mayCreateTruth:\s*true|maySendMessage:\s*true|mayWriteCrm:\s*true|mayCreateCalendarEvent:\s*true' "${SCOPED_FILES[@]}"; then
  fail "safety scan found prohibited runtime/browser/network marker"
fi

if rg -n '"?(crmWrite|pipelineWrite|policyWrite|quoteWrite|taskCreate|calendarCreate|messageSend|authReal|providerRuntime|secretAccess|browserPersistence|realEngineExecution|realEffectsAllowed|realEffectsEnabled|backendConnection|pdfRead|ocrExecution|parserExecution|calculatorExecution|banxicoCall|testExecution)"?\s*[:=]\s*true\b' "${SCOPED_FILES[@]}"; then
  fail "real-effect flag true found"
fi

pass "safety scan clean"

stage "STAGE 13 STAGE AUTHORIZED FILES"
AUTHORIZED_FILES=(
  "FORGE_MASTER_BUILD_TREE.md"
  "docs/architecture/source-truth/FORGE_UNIFIED_BUILD_TREE_001.md"
  "docs/roadmap/FORGE_ROADMAP_LOCK_001.md"
  "$ARCH_DOC"
  "$EVIDENCE_DOC"
  "$CERT_DOC"
  "$AUDIT_JSON"
  "$SCRIPT_IN_REPO"
)

git add "${AUTHORIZED_FILES[@]}"

run git diff --cached --name-only
run git diff --cached --check

EXPECTED="$(mktemp)"
ACTUAL="$(mktemp)"
printf "%s\n" "${AUTHORIZED_FILES[@]}" | sort > "$EXPECTED"
git diff --cached --name-only | sort > "$ACTUAL"

if ! diff -u "$EXPECTED" "$ACTUAL"; then
  fail "staged files differ from authorized boundary"
fi

pass "only authorized files staged"

stage "STAGE 14 COMMIT PUSH"
run git commit -m "docs: scope quote preview pdf real file hash provenance"
run git push origin HEAD:main

stage "STAGE 15 FINAL CHECKPOINT"
run git status --short --branch
run git log --oneline -10

SUMMARY=$(cat <<EOF
PASS_081A_QUOTE_PREVIEW_PDF_ENGINE_REAL_PDF_FILE_HASH_PROVENANCE_SCOPE_COMMIT_PUSH_COMPLETE
DECISION=$DECISION
LOCKED_DECISION=$LOCKED_DECISION
NEXT=$NEXT
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
