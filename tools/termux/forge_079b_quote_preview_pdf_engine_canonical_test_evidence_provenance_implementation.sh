#!/usr/bin/env bash
set -euo pipefail

PHASE="079B_QUOTE_PREVIEW_PDF_ENGINE_CANONICAL_TEST_EVIDENCE_PROVENANCE_IMPLEMENTATION"
DECISION="PASS_079B_QUOTE_PREVIEW_PDF_ENGINE_CANONICAL_TEST_EVIDENCE_PROVENANCE_IMPLEMENTATION"
LOCKED_DECISION="QUOTE_PREVIEW_PDF_ENGINE_CANONICAL_TEST_EVIDENCE_PROVENANCE_LOCAL_STATIC_READ_ONLY_IMPLEMENTED"
NEXT="079C_QUOTE_PREVIEW_PDF_ENGINE_CANONICAL_TEST_EVIDENCE_PROVENANCE_QA_LOCK"
MODE="local/static/read-only test evidence provenance registry implementation"
BOUNDARY="no UI mutation; no backend real; no CRM/policy/quote/pipeline writes; no task/calendar/message; no provider execution with effects; no auth/secrets/browser persistence; no real engine execution; no parser/calculator/Banxico/PDF/OCR execution; no invented product/premium/coverage/projection/quote truth; no new extractor/parser/calculator; no real test execution"
REPO="${REPO:-/storage/emulated/0/Forge OS}"
STAMP="$(date +%Y%m%d_%H%M%S)"
REPORT="/data/data/com.termux/files/home/${PHASE}_RESULT_${STAMP}.md"
BACKUP_DIR=".forge-backups/079b-quote-preview-pdf-engine-canonical-test-evidence-provenance-implementation-${STAMP}"
SCRIPT_IN_REPO="tools/termux/forge_079b_quote_preview_pdf_engine_canonical_test_evidence_provenance_implementation.sh"

SURFACES_ADAPTER="platform/adapters/quote-preview/quote-preview-pdf-engine-existing-surfaces-canonical-mapping-adapter-077b.js"
SURFACES_TEST="tests/quote-preview-pdf-engine-existing-surfaces-canonical-mapping-adapter-077b-test.js"
EVIDENCE_ADAPTER="platform/adapters/quote-preview/quote-preview-pdf-engine-canonical-test-evidence-registry-adapter-078b.js"
EVIDENCE_TEST="tests/quote-preview-pdf-engine-canonical-test-evidence-registry-adapter-078b-test.js"
ADAPTER="platform/adapters/quote-preview/quote-preview-pdf-engine-canonical-test-evidence-provenance-registry-adapter-079b.js"
TEST="tests/quote-preview-pdf-engine-canonical-test-evidence-provenance-registry-adapter-079b-test.js"

ARCH_DOC="docs/architecture/source-truth/FORGE_QUOTE_PREVIEW_PDF_ENGINE_CANONICAL_TEST_EVIDENCE_PROVENANCE_IMPLEMENTATION_079B.md"
EVIDENCE_DOC="docs/evidence/FORGE_QUOTE_PREVIEW_PDF_ENGINE_CANONICAL_TEST_EVIDENCE_PROVENANCE_IMPLEMENTATION_079B.md"
CERT_DOC="docs/evidence/FORGE_QUOTE_PREVIEW_PDF_ENGINE_CANONICAL_TEST_EVIDENCE_PROVENANCE_IMPLEMENTATION_CERTIFICATE_079B.md"
AUDIT_JSON="docs/evidence/forge-quote-preview-pdf-engine-canonical-test-evidence-provenance-implementation-audit-079b.json"

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
echo "ROBOCOP_GATE=Article 0; 079A scope closed; provenance registry implementation only"

cd "$REPO" || fail "No existe repo: $REPO"

stage "STAGE 1 CHECKPOINT"
run git status --short --branch
run git log --oneline -12
run git diff --name-status
run git diff --cached --name-status

stage "STAGE 2 CONFIRM BASE 079A"
if git log --oneline -50 | grep -Eq "079A|scope quote preview pdf canonical test evidence provenance|QUOTE_PREVIEW_PDF_ENGINE_CANONICAL_TEST_EVIDENCE_PROVENANCE_SCOPED"; then
  pass "079A commit found in recent history"
elif [ -f "docs/evidence/forge-quote-preview-pdf-engine-canonical-test-evidence-provenance-scope-audit-079a.json" ]; then
  pass "079A audit fallback found"
else
  fail "079A base not found"
fi

if [ -f "docs/evidence/forge-quote-preview-pdf-engine-canonical-test-evidence-provenance-scope-audit-079a.json" ]; then
  run python3 -m json.tool docs/evidence/forge-quote-preview-pdf-engine-canonical-test-evidence-provenance-scope-audit-079a.json
  if ! rg -n '"status"\s*:\s*"PASS"|"lockedDecision"\s*:\s*"QUOTE_PREVIEW_PDF_ENGINE_CANONICAL_TEST_EVIDENCE_PROVENANCE_SCOPED"|"next"\s*:\s*"079B_QUOTE_PREVIEW_PDF_ENGINE_CANONICAL_TEST_EVIDENCE_PROVENANCE_IMPLEMENTATION"' docs/evidence/forge-quote-preview-pdf-engine-canonical-test-evidence-provenance-scope-audit-079a.json >/dev/null; then
    fail "079A audit exists but does not confirm PASS/079B next"
  fi
  pass "079A audit PASS/079B next confirmed"
else
  warn "079A audit file not found; relying on git log/tree markers"
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

cat > "$BACKUP_DIR/rollback-079b.sh" <<ROLLBACK
#!/usr/bin/env bash
set -euo pipefail
cp "$BACKUP_DIR/FORGE_MASTER_BUILD_TREE.md" "FORGE_MASTER_BUILD_TREE.md"
cp "$BACKUP_DIR/FORGE_UNIFIED_BUILD_TREE_001.md" "docs/architecture/source-truth/FORGE_UNIFIED_BUILD_TREE_001.md"
cp "$BACKUP_DIR/FORGE_ROADMAP_LOCK_001.md" "docs/roadmap/FORGE_ROADMAP_LOCK_001.md"
rm -f "$ADAPTER"
rm -f "$TEST"
rm -f "$ARCH_DOC"
rm -f "$EVIDENCE_DOC"
rm -f "$CERT_DOC"
rm -f "$AUDIT_JSON"
rm -f "$SCRIPT_IN_REPO"
echo "rollback 079B complete"
ROLLBACK
chmod +x "$BACKUP_DIR/rollback-079b.sh"
pass "backup created"
pass "rollback created: $BACKUP_DIR/rollback-079b.sh"

stage "STAGE 6 REVALIDATE BASE REGISTRIES"
run node --check "$SURFACES_ADAPTER"
run node --check "$SURFACES_TEST"
run node "$SURFACES_TEST"
run node --check "$EVIDENCE_ADAPTER"
run node --check "$EVIDENCE_TEST"
run node "$EVIDENCE_TEST"

stage "STAGE 7 IMPLEMENT PROVENANCE REGISTRY"
mkdir -p "$(dirname "$ADAPTER")"

cat > "$ADAPTER" <<'NODE'
'use strict';

const evidenceRegistry = require('./quote-preview-pdf-engine-canonical-test-evidence-registry-adapter-078b.js');

const ADAPTER_ID = 'forge.quote_preview.pdf_engine.canonical_test_evidence.provenance.registry.adapter.v1';
const SCHEMA_VERSION = 'forge.quote_preview.pdf_engine.canonical_test_evidence.provenance.registry.v1';
const DOMAIN_ID = 'quote_preview_pdf_engine_canonical_test_evidence_provenance';
const MODE = 'read_only';
const ROUTE_CLASS = 'preview_safe';

const PROVENANCE_TYPES = Object.freeze({
  REAL_PDF_FILE: 'real_pdf_file_provenance',
  OCR_TEXT_OUTPUT: 'ocr_text_output_provenance',
  FIXTURE_TEXT: 'fixture_text_provenance',
  EXPECTED_VALUE: 'expected_value_provenance',
  DETERMINISTIC_INPUT: 'deterministic_input_provenance',
  RATE_CACHE: 'rate_cache_provenance',
  PROVIDER_METADATA: 'provider_metadata_provenance',
  GOVERNANCE_ASSERTION: 'governance_assertion_provenance',
  ENGINE_REFERENCE: 'engine_reference_provenance',
});

const PROVENANCE_STATUSES = Object.freeze({
  SOURCE_TRACE_REQUIRED: 'source_trace_required',
  FILE_OR_HASH_REQUIRED: 'file_or_hash_required',
  FIXTURE_ONLY: 'fixture_only',
  GOVERNANCE_ONLY: 'governance_only',
  RUNTIME_GATE_REQUIRED: 'runtime_gate_required',
  ENGINE_REF_REQUIRED: 'engine_ref_required',
  DECISION_REQUIRED: 'decision_required',
});

const SOURCE_KINDS = Object.freeze({
  EXISTING_TEST_FILE: 'existing_test_file',
  EXISTING_ENGINE_FILE: 'existing_engine_file',
  TEXT_FIXTURE: 'text_fixture',
  REAL_PDF_FIXTURE: 'real_pdf_fixture',
  EXPECTED_VALUE_ASSERTION: 'expected_value_assertion',
  RATE_CACHE_METADATA: 'rate_cache_metadata',
  GOVERNANCE_ASSERTION: 'governance_assertion',
});

const VERIFICATION_POLICIES = Object.freeze({
  STATIC_CLASSIFICATION_ONLY: 'static_classification_only',
  REQUIRE_FILE_PATH_OR_HASH_BEFORE_EXECUTION: 'require_file_path_or_hash_before_execution',
  REQUIRE_EXPECTED_VALUE_SOURCE_BEFORE_EXECUTION: 'require_expected_value_source_before_execution',
  REQUIRE_RUNTIME_GATE_BEFORE_PROVIDER_CALL: 'require_runtime_gate_before_provider_call',
  REQUIRE_ENGINE_REF_MATCH_BEFORE_EXECUTION: 'require_engine_ref_match_before_execution',
});

const SAFE_ERROR_CODES = Object.freeze({
  PROVENANCE_NOT_MAPPED: 'QUOTE_PREVIEW_PDF_TEST_EVIDENCE_PROVENANCE_NOT_MAPPED',
  PROVENANCE_EXECUTION_NOT_AUTHORIZED: 'QUOTE_PREVIEW_PDF_TEST_EVIDENCE_PROVENANCE_EXECUTION_NOT_AUTHORIZED',
  PDF_READ_NOT_AUTHORIZED: 'QUOTE_PREVIEW_PDF_TEST_EVIDENCE_PROVENANCE_PDF_READ_NOT_AUTHORIZED',
  OCR_EXECUTION_NOT_AUTHORIZED: 'QUOTE_PREVIEW_PDF_TEST_EVIDENCE_PROVENANCE_OCR_EXECUTION_NOT_AUTHORIZED',
  PARSER_EXECUTION_NOT_AUTHORIZED: 'QUOTE_PREVIEW_PDF_TEST_EVIDENCE_PROVENANCE_PARSER_EXECUTION_NOT_AUTHORIZED',
  CALCULATOR_EXECUTION_NOT_AUTHORIZED: 'QUOTE_PREVIEW_PDF_TEST_EVIDENCE_PROVENANCE_CALCULATOR_EXECUTION_NOT_AUTHORIZED',
  BANXICO_CALL_NOT_AUTHORIZED: 'QUOTE_PREVIEW_PDF_TEST_EVIDENCE_PROVENANCE_BANXICO_CALL_NOT_AUTHORIZED',
  FIXTURE_AS_REAL_PDF_BLOCKED: 'QUOTE_PREVIEW_PDF_TEST_EVIDENCE_FIXTURE_AS_REAL_PDF_BLOCKED',
  GOVERNANCE_AS_EXTRACTION_PROOF_BLOCKED: 'QUOTE_PREVIEW_PDF_TEST_EVIDENCE_GOVERNANCE_AS_EXTRACTION_PROOF_BLOCKED',
  INVENTED_EXPECTED_VALUE_BLOCKED: 'QUOTE_PREVIEW_PDF_TEST_EVIDENCE_INVENTED_EXPECTED_VALUE_BLOCKED',
  UNTRACEABLE_PROJECTION_BLOCKED: 'QUOTE_PREVIEW_PDF_TEST_EVIDENCE_UNTRACEABLE_PROJECTION_BLOCKED',
  PROVIDER_RUNTIME_GATE_REQUIRED: 'QUOTE_PREVIEW_PDF_TEST_EVIDENCE_PROVIDER_RUNTIME_GATE_REQUIRED',
  DUPLICATE_ENGINE_CREATION_BLOCKED: 'QUOTE_PREVIEW_PDF_TEST_EVIDENCE_DUPLICATE_ENGINE_CREATION_BLOCKED',
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

const REQUIRED_PROVENANCE_FIELDS = Object.freeze([
  'provenance_id',
  'test_id',
  'file_path',
  'provenance_type',
  'provenance_status',
  'source_kind',
  'source_path',
  'source_hash_required',
  'expected_value_source_required',
  'engine_refs',
  'blocked_misuse',
  'verification_policy',
  'safe_errors',
  'safety_flags',
]);

function freezeEntry(entry) {
  return Object.freeze({
    ...entry,
    engine_refs: Object.freeze([...(entry.engine_refs || [])]),
    blocked_misuse: Object.freeze([...(entry.blocked_misuse || [])]),
    safe_errors: Object.freeze([...(entry.safe_errors || [])]),
    safety_flags: Object.freeze({ ...DEFAULT_SAFETY_FLAGS, ...(entry.safety_flags || {}) }),
  });
}

const PROVENANCE_REGISTRY = Object.freeze([
  freezeEntry({
    provenance_id: 'prov_real_pdf_ocr_solucionline_file',
    test_id: 'real_pdf_ocr_solucionline_candidate',
    file_path: 'tests/real-pdf-ocr-test.js',
    provenance_type: PROVENANCE_TYPES.REAL_PDF_FILE,
    provenance_status: PROVENANCE_STATUSES.FILE_OR_HASH_REQUIRED,
    source_kind: SOURCE_KINDS.REAL_PDF_FIXTURE,
    source_path: null,
    source_hash_required: true,
    expected_value_source_required: false,
    engine_refs: ['policy-operations/evidence/policy-ocr-engine.js'],
    blocked_misuse: ['fixture_as_real_pdf', 'missing_pdf_origin', 'unverified_source_document', 'parser_ownership'],
    verification_policy: VERIFICATION_POLICIES.REQUIRE_FILE_PATH_OR_HASH_BEFORE_EXECUTION,
    safe_errors: [
      SAFE_ERROR_CODES.PROVENANCE_EXECUTION_NOT_AUTHORIZED,
      SAFE_ERROR_CODES.PDF_READ_NOT_AUTHORIZED,
      SAFE_ERROR_CODES.FIXTURE_AS_REAL_PDF_BLOCKED,
    ],
  }),
  freezeEntry({
    provenance_id: 'prov_real_gmm_quote_pdf_file',
    test_id: 'real_gmm_quote_candidate',
    file_path: 'tests/real-gmm-quote-test.js',
    provenance_type: PROVENANCE_TYPES.REAL_PDF_FILE,
    provenance_status: PROVENANCE_STATUSES.FILE_OR_HASH_REQUIRED,
    source_kind: SOURCE_KINDS.REAL_PDF_FIXTURE,
    source_path: null,
    source_hash_required: true,
    expected_value_source_required: false,
    engine_refs: [
      'policy-operations/evidence/policy-ocr-engine.js',
      'product-intelligence/evidence/gmm-quote-parser.js',
    ],
    blocked_misuse: ['fixture_as_real_pdf', 'missing_pdf_origin', 'unverified_source_document', 'quote_truth_creation'],
    verification_policy: VERIFICATION_POLICIES.REQUIRE_FILE_PATH_OR_HASH_BEFORE_EXECUTION,
    safe_errors: [
      SAFE_ERROR_CODES.PROVENANCE_EXECUTION_NOT_AUTHORIZED,
      SAFE_ERROR_CODES.PDF_READ_NOT_AUTHORIZED,
      SAFE_ERROR_CODES.PARSER_EXECUTION_NOT_AUTHORIZED,
    ],
  }),
  freezeEntry({
    provenance_id: 'prov_gmm_out_of_pocket_expected_values',
    test_id: 'gmm_out_of_pocket_candidate',
    file_path: 'tests/gmm-out-of-pocket-test.js',
    provenance_type: PROVENANCE_TYPES.EXPECTED_VALUE,
    provenance_status: PROVENANCE_STATUSES.SOURCE_TRACE_REQUIRED,
    source_kind: SOURCE_KINDS.EXPECTED_VALUE_ASSERTION,
    source_path: null,
    source_hash_required: false,
    expected_value_source_required: true,
    engine_refs: [
      'product-intelligence/evidence/gmm-quote-parser.js',
      'gmm-quote-summary-engine.js',
    ],
    blocked_misuse: ['invented_expected_value', 'hardcoded_financial_truth', 'summary_parser_boundary_drift'],
    verification_policy: VERIFICATION_POLICIES.REQUIRE_EXPECTED_VALUE_SOURCE_BEFORE_EXECUTION,
    safe_errors: [
      SAFE_ERROR_CODES.INVENTED_EXPECTED_VALUE_BLOCKED,
      SAFE_ERROR_CODES.PARSER_EXECUTION_NOT_AUTHORIZED,
      SAFE_ERROR_CODES.CALCULATOR_EXECUTION_NOT_AUTHORIZED,
    ],
  }),
  freezeEntry({
    provenance_id: 'prov_real_retirement_parser_pdf_file',
    test_id: 'real_retirement_scenario_candidate',
    file_path: 'tests/real-retirement-scenario-test.js',
    provenance_type: PROVENANCE_TYPES.REAL_PDF_FILE,
    provenance_status: PROVENANCE_STATUSES.FILE_OR_HASH_REQUIRED,
    source_kind: SOURCE_KINDS.REAL_PDF_FIXTURE,
    source_path: null,
    source_hash_required: true,
    expected_value_source_required: false,
    engine_refs: [
      'product-intelligence/evidence/solucionline-retirement-parser.js',
      'product-intelligence/evidence/forge-quote-pdf-preview-engine.js',
    ],
    blocked_misuse: ['fixture_as_real_pdf', 'parallel_parser_growth_before_decision', 'unverified_source_document'],
    verification_policy: VERIFICATION_POLICIES.REQUIRE_FILE_PATH_OR_HASH_BEFORE_EXECUTION,
    safe_errors: [
      SAFE_ERROR_CODES.PROVENANCE_EXECUTION_NOT_AUTHORIZED,
      SAFE_ERROR_CODES.PDF_READ_NOT_AUTHORIZED,
      SAFE_ERROR_CODES.PARSER_EXECUTION_NOT_AUTHORIZED,
    ],
  }),
  freezeEntry({
    provenance_id: 'prov_real_retirement_mxn_expected_values',
    test_id: 'real_retirement_mxn_scenario_candidate',
    file_path: 'tests/real-retirement-mxn-scenario-test.js',
    provenance_type: PROVENANCE_TYPES.EXPECTED_VALUE,
    provenance_status: PROVENANCE_STATUSES.SOURCE_TRACE_REQUIRED,
    source_kind: SOURCE_KINDS.EXPECTED_VALUE_ASSERTION,
    source_path: null,
    source_hash_required: false,
    expected_value_source_required: true,
    engine_refs: [
      'product-intelligence/evidence/solucionline-retirement-parser.js',
      'retirement-future-udi-projection-engine.js',
      'imagina-ser-future-mxn-bridge.js',
    ],
    blocked_misuse: ['invented_expected_value', 'untraceable_projection', 'invented_udi_growth', 'hardcoded_financial_truth'],
    verification_policy: VERIFICATION_POLICIES.REQUIRE_EXPECTED_VALUE_SOURCE_BEFORE_EXECUTION,
    safe_errors: [
      SAFE_ERROR_CODES.INVENTED_EXPECTED_VALUE_BLOCKED,
      SAFE_ERROR_CODES.UNTRACEABLE_PROJECTION_BLOCKED,
      SAFE_ERROR_CODES.CALCULATOR_EXECUTION_NOT_AUTHORIZED,
    ],
  }),
  freezeEntry({
    provenance_id: 'prov_imagina_ser_master_rate_cache_boundary',
    test_id: 'imagina_ser_master_candidate',
    file_path: 'imagina-ser-master-test.js',
    provenance_type: PROVENANCE_TYPES.RATE_CACHE,
    provenance_status: PROVENANCE_STATUSES.RUNTIME_GATE_REQUIRED,
    source_kind: SOURCE_KINDS.RATE_CACHE_METADATA,
    source_path: null,
    source_hash_required: false,
    expected_value_source_required: true,
    engine_refs: [
      'imagina-ser-future-mxn-bridge.js',
      'retirement-future-udi-projection-engine.js',
      'exchange-rate-cache-engine.js',
    ],
    blocked_misuse: ['provider_runtime_without_gate', 'network_call_without_gate', 'secret_access_without_gate', 'invented_expected_value'],
    verification_policy: VERIFICATION_POLICIES.REQUIRE_RUNTIME_GATE_BEFORE_PROVIDER_CALL,
    safe_errors: [
      SAFE_ERROR_CODES.PROVIDER_RUNTIME_GATE_REQUIRED,
      SAFE_ERROR_CODES.BANXICO_CALL_NOT_AUTHORIZED,
      SAFE_ERROR_CODES.INVENTED_EXPECTED_VALUE_BLOCKED,
    ],
  }),
  freezeEntry({
    provenance_id: 'prov_imagina_ser_banxico_provider_metadata',
    test_id: 'imagina_ser_banxico_integration_candidate',
    file_path: 'imagina-ser-banxico-integration-test.js',
    provenance_type: PROVENANCE_TYPES.PROVIDER_METADATA,
    provenance_status: PROVENANCE_STATUSES.RUNTIME_GATE_REQUIRED,
    source_kind: SOURCE_KINDS.RATE_CACHE_METADATA,
    source_path: null,
    source_hash_required: false,
    expected_value_source_required: true,
    engine_refs: [
      'exchange-rate-cache-engine.js',
      'shared-banxico-rate-engine.js',
      'shared-banxico-edge-provider.js',
    ],
    blocked_misuse: ['provider_runtime_without_gate', 'network_call_without_gate', 'secret_access_without_gate'],
    verification_policy: VERIFICATION_POLICIES.REQUIRE_RUNTIME_GATE_BEFORE_PROVIDER_CALL,
    safe_errors: [
      SAFE_ERROR_CODES.PROVIDER_RUNTIME_GATE_REQUIRED,
      SAFE_ERROR_CODES.BANXICO_CALL_NOT_AUTHORIZED,
    ],
  }),
  freezeEntry({
    provenance_id: 'prov_retirement_future_udi_deterministic_inputs',
    test_id: 'retirement_future_udi_projection_smoke_candidate',
    file_path: 'retirement-future-udi-projection-smoke-test.js',
    provenance_type: PROVENANCE_TYPES.DETERMINISTIC_INPUT,
    provenance_status: PROVENANCE_STATUSES.SOURCE_TRACE_REQUIRED,
    source_kind: SOURCE_KINDS.EXPECTED_VALUE_ASSERTION,
    source_path: null,
    source_hash_required: false,
    expected_value_source_required: true,
    engine_refs: ['retirement-future-udi-projection-engine.js'],
    blocked_misuse: ['invented_udi_growth', 'invented_current_udi', 'untraceable_projection', 'hardcoded_financial_truth'],
    verification_policy: VERIFICATION_POLICIES.REQUIRE_EXPECTED_VALUE_SOURCE_BEFORE_EXECUTION,
    safe_errors: [
      SAFE_ERROR_CODES.INVENTED_EXPECTED_VALUE_BLOCKED,
      SAFE_ERROR_CODES.UNTRACEABLE_PROJECTION_BLOCKED,
      SAFE_ERROR_CODES.CALCULATOR_EXECUTION_NOT_AUTHORIZED,
    ],
  }),
  freezeEntry({
    provenance_id: 'prov_quote_pdf_preview_fixture_text',
    test_id: 'quote_pdf_preview_fixture_candidate',
    file_path: 'tests/product-intelligence/forge-quote-pdf-preview-engine-test.js',
    provenance_type: PROVENANCE_TYPES.FIXTURE_TEXT,
    provenance_status: PROVENANCE_STATUSES.FIXTURE_ONLY,
    source_kind: SOURCE_KINDS.TEXT_FIXTURE,
    source_path: 'inline_or_local_text_fixture',
    source_hash_required: true,
    expected_value_source_required: false,
    engine_refs: ['product-intelligence/evidence/forge-quote-pdf-preview-engine.js'],
    blocked_misuse: ['real_pdf_claim', 'ocr_claim', 'quote_truth_claim', 'fixture_as_real_pdf'],
    verification_policy: VERIFICATION_POLICIES.STATIC_CLASSIFICATION_ONLY,
    safe_errors: [
      SAFE_ERROR_CODES.FIXTURE_AS_REAL_PDF_BLOCKED,
      SAFE_ERROR_CODES.PROVENANCE_EXECUTION_NOT_AUTHORIZED,
    ],
  }),
  freezeEntry({
    provenance_id: 'prov_repo_promotion_governance_assertion',
    test_id: 'repo_promotion_guardrail_candidate',
    file_path: 'tests/quote-preview-pdf-engine-repo-promotion-adapter-076b-test.js',
    provenance_type: PROVENANCE_TYPES.GOVERNANCE_ASSERTION,
    provenance_status: PROVENANCE_STATUSES.GOVERNANCE_ONLY,
    source_kind: SOURCE_KINDS.GOVERNANCE_ASSERTION,
    source_path: 'platform/adapters/quote-preview/quote-preview-pdf-engine-repo-promotion-adapter-076b.js',
    source_hash_required: false,
    expected_value_source_required: false,
    engine_refs: ['platform/adapters/quote-preview/quote-preview-pdf-engine-repo-promotion-adapter-076b.js'],
    blocked_misuse: ['real_pdf_claim', 'parser_claim', 'extraction_claim', 'financial_value_claim'],
    verification_policy: VERIFICATION_POLICIES.STATIC_CLASSIFICATION_ONLY,
    safe_errors: [
      SAFE_ERROR_CODES.GOVERNANCE_AS_EXTRACTION_PROOF_BLOCKED,
      SAFE_ERROR_CODES.PROVENANCE_EXECUTION_NOT_AUTHORIZED,
    ],
  }),
  freezeEntry({
    provenance_id: 'prov_existing_surfaces_mapping_governance_assertion',
    test_id: 'existing_surfaces_mapping_guardrail_candidate',
    file_path: 'tests/quote-preview-pdf-engine-existing-surfaces-canonical-mapping-adapter-077b-test.js',
    provenance_type: PROVENANCE_TYPES.GOVERNANCE_ASSERTION,
    provenance_status: PROVENANCE_STATUSES.GOVERNANCE_ONLY,
    source_kind: SOURCE_KINDS.GOVERNANCE_ASSERTION,
    source_path: 'platform/adapters/quote-preview/quote-preview-pdf-engine-existing-surfaces-canonical-mapping-adapter-077b.js',
    source_hash_required: false,
    expected_value_source_required: false,
    engine_refs: ['platform/adapters/quote-preview/quote-preview-pdf-engine-existing-surfaces-canonical-mapping-adapter-077b.js'],
    blocked_misuse: ['real_pdf_claim', 'parser_claim', 'extraction_claim', 'financial_value_claim'],
    verification_policy: VERIFICATION_POLICIES.STATIC_CLASSIFICATION_ONLY,
    safe_errors: [
      SAFE_ERROR_CODES.GOVERNANCE_AS_EXTRACTION_PROOF_BLOCKED,
      SAFE_ERROR_CODES.PROVENANCE_EXECUTION_NOT_AUTHORIZED,
    ],
  }),
  freezeEntry({
    provenance_id: 'prov_engine_refs_existing_catalog_requirement',
    test_id: 'all_cataloged_test_evidence',
    file_path: null,
    provenance_type: PROVENANCE_TYPES.ENGINE_REFERENCE,
    provenance_status: PROVENANCE_STATUSES.ENGINE_REF_REQUIRED,
    source_kind: SOURCE_KINDS.EXISTING_ENGINE_FILE,
    source_path: '077B_existing_surfaces_canonical_mapping_catalog',
    source_hash_required: false,
    expected_value_source_required: false,
    engine_refs: [
      'policy-operations/evidence/policy-ocr-engine.js',
      'product-intelligence/evidence/solucionline-retirement-parser.js',
      'product-intelligence/evidence/gmm-quote-parser.js',
      'gmm-quote-summary-engine.js',
      'retirement-future-udi-projection-engine.js',
      'imagina-ser-future-mxn-bridge.js',
      'exchange-rate-cache-engine.js',
      'shared-banxico-rate-engine.js',
      'shared-banxico-edge-provider.js',
    ],
    blocked_misuse: ['new_engine_creation', 'duplicate_parser_creation', 'duplicate_calculator_creation', 'duplicate_provider_creation'],
    verification_policy: VERIFICATION_POLICIES.REQUIRE_ENGINE_REF_MATCH_BEFORE_EXECUTION,
    safe_errors: [
      SAFE_ERROR_CODES.DUPLICATE_ENGINE_CREATION_BLOCKED,
      SAFE_ERROR_CODES.PROVENANCE_EXECUTION_NOT_AUTHORIZED,
    ],
  }),
]);

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function getEvidenceCatalog() {
  return evidenceRegistry.getQuotePreviewPdfCanonicalTestEvidenceRegistryCatalog();
}

function getQuotePreviewPdfCanonicalTestEvidenceProvenanceRegistryCatalog() {
  const evidenceCatalog = getEvidenceCatalog();

  return {
    adapter_id: ADAPTER_ID,
    schemaVersion: SCHEMA_VERSION,
    domainId: DOMAIN_ID,
    mode: MODE,
    routeClass: ROUTE_CLASS,
    registry_type: 'local_static_read_only_test_evidence_provenance_registry',
    execution_allowed_in_registry: false,
    pdf_read_allowed_in_registry: false,
    ocr_execution_allowed_in_registry: false,
    parser_execution_allowed_in_registry: false,
    calculator_execution_allowed_in_registry: false,
    banxico_call_allowed_in_registry: false,
    provider_call_allowed_in_registry: false,
    test_execution_allowed_in_registry: false,
    product_intelligence_upstream: true,
    quote_preview_downstream: true,
    required_provenance_fields: [...REQUIRED_PROVENANCE_FIELDS],
    safe_errors: Object.values(SAFE_ERROR_CODES),
    safety_flags: clone(DEFAULT_SAFETY_FLAGS),
    evidence_catalog_ref: {
      adapter_id: evidenceCatalog.adapter_id,
      schemaVersion: evidenceCatalog.schemaVersion,
      evidence_count: Array.isArray(evidenceCatalog.evidence) ? evidenceCatalog.evidence.length : 0,
    },
    provenance: clone(PROVENANCE_REGISTRY),
  };
}

function getProvenanceById(provenanceId) {
  const match = PROVENANCE_REGISTRY.find((entry) => entry.provenance_id === provenanceId);
  return match ? clone(match) : buildProvenanceSafeError(provenanceId);
}

function getProvenanceByTestId(testId) {
  return clone(PROVENANCE_REGISTRY.filter((entry) => entry.test_id === testId));
}

function getProvenanceByType(provenanceType) {
  const normalized = String(provenanceType || '').trim().toLowerCase();
  return clone(PROVENANCE_REGISTRY.filter((entry) => entry.provenance_type.toLowerCase() === normalized));
}

function getExpectedValueProvenanceEntries() {
  return getProvenanceByType(PROVENANCE_TYPES.EXPECTED_VALUE);
}

function getFixtureOnlyProvenanceEntries() {
  return getProvenanceByType(PROVENANCE_TYPES.FIXTURE_TEXT);
}

function getGovernanceOnlyProvenanceEntries() {
  return getProvenanceByType(PROVENANCE_TYPES.GOVERNANCE_ASSERTION);
}

function getRuntimeGateProvenanceEntries() {
  return clone(PROVENANCE_REGISTRY.filter((entry) => entry.provenance_status === PROVENANCE_STATUSES.RUNTIME_GATE_REQUIRED));
}

function buildProvenanceSafeError(provenanceId, code = SAFE_ERROR_CODES.PROVENANCE_NOT_MAPPED) {
  return {
    schemaVersion: SCHEMA_VERSION,
    domainId: DOMAIN_ID,
    mode: MODE,
    routeClass: ROUTE_CLASS,
    readModelStatus: 'error',
    provenance_id: provenanceId || null,
    test_id: null,
    file_path: null,
    provenance_type: null,
    provenance_status: PROVENANCE_STATUSES.DECISION_REQUIRED,
    source_kind: null,
    source_path: null,
    source_hash_required: true,
    expected_value_source_required: true,
    engine_refs: [],
    blocked_misuse: ['new_provenance_creation_before_catalog_decision', 'unmapped_test_evidence_execution'],
    verification_policy: VERIFICATION_POLICIES.STATIC_CLASSIFICATION_ONLY,
    safe_errors: [code, SAFE_ERROR_CODES.PROVENANCE_EXECUTION_NOT_AUTHORIZED],
    safety_flags: clone(DEFAULT_SAFETY_FLAGS),
    safe_error: {
      code,
      message: 'Test evidence provenance is not mapped. Execution and new provenance creation are blocked before catalog decision.',
    },
  };
}

function validateProvenanceShape(entry) {
  const errors = [];

  if (!entry || typeof entry !== 'object') {
    return { ok: false, valid: false, errors: ['provenance_object_required'] };
  }

  for (const field of REQUIRED_PROVENANCE_FIELDS) {
    if (!(field in entry)) errors.push(`missing_${field}`);
  }

  if (entry.safety_flags) {
    for (const [key, value] of Object.entries(entry.safety_flags)) {
      if (value !== false) errors.push(`safety_flag_not_false_${key}`);
    }
  }

  const serialized = JSON.stringify(entry);
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

function validateProvenanceRegistryCatalog(catalog) {
  const errors = [];

  if (!catalog || typeof catalog !== 'object') {
    return { ok: false, valid: false, errors: ['catalog_object_required'] };
  }

  if (catalog.schemaVersion !== SCHEMA_VERSION) errors.push('invalid_schemaVersion');
  if (catalog.domainId !== DOMAIN_ID) errors.push('invalid_domainId');
  if (catalog.mode !== MODE) errors.push('invalid_mode');
  if (catalog.routeClass !== ROUTE_CLASS) errors.push('invalid_routeClass');

  for (const flagName of [
    'execution_allowed_in_registry',
    'pdf_read_allowed_in_registry',
    'ocr_execution_allowed_in_registry',
    'parser_execution_allowed_in_registry',
    'calculator_execution_allowed_in_registry',
    'banxico_call_allowed_in_registry',
    'provider_call_allowed_in_registry',
    'test_execution_allowed_in_registry',
  ]) {
    if (catalog[flagName] !== false) errors.push(`${flagName}_must_be_false`);
  }

  for (const [key, value] of Object.entries(catalog.safety_flags || {})) {
    if (value !== false) errors.push(`catalog_safety_flag_not_false_${key}`);
  }

  const provenance = Array.isArray(catalog.provenance) ? catalog.provenance : [];
  if (!provenance.length) errors.push('provenance_required');

  for (const entry of provenance) {
    const result = validateProvenanceShape(entry);
    if (!result.ok) errors.push(...result.errors.map((error) => `${entry.provenance_id || 'unknown'}:${error}`));
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
  PROVENANCE_TYPES,
  PROVENANCE_STATUSES,
  SOURCE_KINDS,
  VERIFICATION_POLICIES,
  SAFE_ERROR_CODES,
  DEFAULT_SAFETY_FLAGS,
  REQUIRED_PROVENANCE_FIELDS,
  PROVENANCE_REGISTRY,
  getQuotePreviewPdfCanonicalTestEvidenceProvenanceRegistryCatalog,
  getProvenanceById,
  getProvenanceByTestId,
  getProvenanceByType,
  getExpectedValueProvenanceEntries,
  getFixtureOnlyProvenanceEntries,
  getGovernanceOnlyProvenanceEntries,
  getRuntimeGateProvenanceEntries,
  buildProvenanceSafeError,
  validateProvenanceShape,
  validateProvenanceRegistryCatalog,
};
NODE

pass "$ADAPTER written"

stage "STAGE 8 IMPLEMENT TEST"
mkdir -p "$(dirname "$TEST")"

cat > "$TEST" <<'NODE'
'use strict';

const assert = require('node:assert/strict');

const adapter = require('../platform/adapters/quote-preview/quote-preview-pdf-engine-canonical-test-evidence-provenance-registry-adapter-079b.js');

assert.equal(adapter.ADAPTER_ID, 'forge.quote_preview.pdf_engine.canonical_test_evidence.provenance.registry.adapter.v1');
assert.equal(adapter.SCHEMA_VERSION, 'forge.quote_preview.pdf_engine.canonical_test_evidence.provenance.registry.v1');
assert.equal(adapter.MODE, 'read_only');
assert.equal(adapter.ROUTE_CLASS, 'preview_safe');

assert.equal(typeof adapter.getQuotePreviewPdfCanonicalTestEvidenceProvenanceRegistryCatalog, 'function');
assert.equal(typeof adapter.getProvenanceById, 'function');
assert.equal(typeof adapter.getProvenanceByTestId, 'function');
assert.equal(typeof adapter.getProvenanceByType, 'function');
assert.equal(typeof adapter.getExpectedValueProvenanceEntries, 'function');
assert.equal(typeof adapter.getFixtureOnlyProvenanceEntries, 'function');
assert.equal(typeof adapter.getGovernanceOnlyProvenanceEntries, 'function');
assert.equal(typeof adapter.getRuntimeGateProvenanceEntries, 'function');
assert.equal(typeof adapter.validateProvenanceShape, 'function');
assert.equal(typeof adapter.validateProvenanceRegistryCatalog, 'function');

const catalog = adapter.getQuotePreviewPdfCanonicalTestEvidenceProvenanceRegistryCatalog();

assert.equal(catalog.schemaVersion, adapter.SCHEMA_VERSION);
assert.equal(catalog.domainId, 'quote_preview_pdf_engine_canonical_test_evidence_provenance');
assert.equal(catalog.mode, 'read_only');
assert.equal(catalog.routeClass, 'preview_safe');
assert.equal(catalog.registry_type, 'local_static_read_only_test_evidence_provenance_registry');

for (const flag of [
  'execution_allowed_in_registry',
  'pdf_read_allowed_in_registry',
  'ocr_execution_allowed_in_registry',
  'parser_execution_allowed_in_registry',
  'calculator_execution_allowed_in_registry',
  'banxico_call_allowed_in_registry',
  'provider_call_allowed_in_registry',
  'test_execution_allowed_in_registry',
]) {
  assert.equal(catalog[flag], false, `${flag} must be false`);
}

assert.equal(catalog.product_intelligence_upstream, true);
assert.equal(catalog.quote_preview_downstream, true);
assert(Array.isArray(catalog.provenance));
assert(catalog.provenance.length >= 10);
assert.equal(adapter.validateProvenanceRegistryCatalog(catalog).ok, true);

for (const entry of catalog.provenance) {
  for (const field of adapter.REQUIRED_PROVENANCE_FIELDS) {
    assert(field in entry, `${entry.provenance_id} missing ${field}`);
  }
  assert.equal(adapter.validateProvenanceShape(entry).ok, true);
}

const byId = (id) => adapter.getProvenanceById(id);

const realPdf = byId('prov_real_pdf_ocr_solucionline_file');
assert.equal(realPdf.provenance_type, adapter.PROVENANCE_TYPES.REAL_PDF_FILE);
assert.equal(realPdf.provenance_status, adapter.PROVENANCE_STATUSES.FILE_OR_HASH_REQUIRED);
assert.equal(realPdf.source_hash_required, true);
assert(realPdf.blocked_misuse.includes('fixture_as_real_pdf'));
assert(realPdf.safe_errors.includes(adapter.SAFE_ERROR_CODES.PDF_READ_NOT_AUTHORIZED));

const gmmExpected = byId('prov_gmm_out_of_pocket_expected_values');
assert.equal(gmmExpected.provenance_type, adapter.PROVENANCE_TYPES.EXPECTED_VALUE);
assert.equal(gmmExpected.expected_value_source_required, true);
assert(gmmExpected.safe_errors.includes(adapter.SAFE_ERROR_CODES.INVENTED_EXPECTED_VALUE_BLOCKED));

const retirementMxn = byId('prov_real_retirement_mxn_expected_values');
assert(retirementMxn.engine_refs.includes('retirement-future-udi-projection-engine.js'));
assert(retirementMxn.engine_refs.includes('imagina-ser-future-mxn-bridge.js'));
assert(retirementMxn.blocked_misuse.includes('untraceable_projection'));

const banxico = byId('prov_imagina_ser_banxico_provider_metadata');
assert.equal(banxico.provenance_status, adapter.PROVENANCE_STATUSES.RUNTIME_GATE_REQUIRED);
assert.equal(banxico.verification_policy, adapter.VERIFICATION_POLICIES.REQUIRE_RUNTIME_GATE_BEFORE_PROVIDER_CALL);
assert(banxico.safe_errors.includes(adapter.SAFE_ERROR_CODES.BANXICO_CALL_NOT_AUTHORIZED));

const fixture = byId('prov_quote_pdf_preview_fixture_text');
assert.equal(fixture.provenance_type, adapter.PROVENANCE_TYPES.FIXTURE_TEXT);
assert.equal(fixture.provenance_status, adapter.PROVENANCE_STATUSES.FIXTURE_ONLY);
assert(fixture.blocked_misuse.includes('fixture_as_real_pdf'));
assert(fixture.safe_errors.includes(adapter.SAFE_ERROR_CODES.FIXTURE_AS_REAL_PDF_BLOCKED));

const governance = byId('prov_repo_promotion_governance_assertion');
assert.equal(governance.provenance_type, adapter.PROVENANCE_TYPES.GOVERNANCE_ASSERTION);
assert.equal(governance.provenance_status, adapter.PROVENANCE_STATUSES.GOVERNANCE_ONLY);
assert(governance.blocked_misuse.includes('extraction_claim'));
assert(governance.safe_errors.includes(adapter.SAFE_ERROR_CODES.GOVERNANCE_AS_EXTRACTION_PROOF_BLOCKED));

const engineRef = byId('prov_engine_refs_existing_catalog_requirement');
assert.equal(engineRef.provenance_type, adapter.PROVENANCE_TYPES.ENGINE_REFERENCE);
assert(engineRef.blocked_misuse.includes('duplicate_parser_creation'));
assert(engineRef.safe_errors.includes(adapter.SAFE_ERROR_CODES.DUPLICATE_ENGINE_CREATION_BLOCKED));

const byTest = adapter.getProvenanceByTestId('real_retirement_mxn_scenario_candidate');
assert(byTest.some((entry) => entry.provenance_id === 'prov_real_retirement_mxn_expected_values'));

const expectedValueEntries = adapter.getExpectedValueProvenanceEntries();
assert(expectedValueEntries.some((entry) => entry.provenance_id === 'prov_gmm_out_of_pocket_expected_values'));
assert(expectedValueEntries.some((entry) => entry.provenance_id === 'prov_real_retirement_mxn_expected_values'));

const fixtureOnly = adapter.getFixtureOnlyProvenanceEntries();
assert.equal(fixtureOnly.length, 1);
assert.equal(fixtureOnly[0].provenance_id, 'prov_quote_pdf_preview_fixture_text');

const governanceOnly = adapter.getGovernanceOnlyProvenanceEntries();
assert(governanceOnly.length >= 2);
assert(governanceOnly.some((entry) => entry.provenance_id === 'prov_repo_promotion_governance_assertion'));

const runtimeGate = adapter.getRuntimeGateProvenanceEntries();
assert(runtimeGate.some((entry) => entry.provenance_id === 'prov_imagina_ser_banxico_provider_metadata'));

const missing = adapter.getProvenanceById('missing_provenance');
assert.equal(missing.readModelStatus, 'error');
assert(missing.safe_errors.includes(adapter.SAFE_ERROR_CODES.PROVENANCE_NOT_MAPPED));
assert(missing.safe_errors.includes(adapter.SAFE_ERROR_CODES.PROVENANCE_EXECUTION_NOT_AUTHORIZED));
assert.equal(adapter.validateProvenanceShape(missing).ok, true);

for (const [key, value] of Object.entries(adapter.DEFAULT_SAFETY_FLAGS)) {
  assert.equal(value, false, `DEFAULT_SAFETY_FLAGS.${key} must be false`);
}

for (const entry of catalog.provenance) {
  for (const [key, value] of Object.entries(entry.safety_flags || {})) {
    assert.equal(value, false, `${entry.provenance_id}.${key} must be false`);
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

console.log('PASS quote preview pdf engine canonical test evidence provenance registry adapter 079B');
NODE

pass "$TEST written"

stage "STAGE 9 WRITE DOCS / EVIDENCE"
mkdir -p "$(dirname "$ARCH_DOC")" "$(dirname "$EVIDENCE_DOC")"

cat > "$ARCH_DOC" <<EOF
# Forge Quote Preview PDF Engine Canonical Test Evidence Provenance Implementation 079B

PHASE=$PHASE

STATUS=PASS

DECISION=$DECISION

LOCKED_DECISION=$LOCKED_DECISION

NEXT=$NEXT

## Purpose

079B implements a local/static/read-only provenance registry for canonical test evidence.

The registry classifies where evidence must come from before any future runtime or executable evidence gate. It does not execute real tests, read PDFs, run OCR, run parsers, run calculators, call Banxico, call providers, connect backend, write quotes, or create real effects.

## Implemented Files

- \`$ADAPTER\`
- \`$TEST\`

## Adapter Contract

- \`ADAPTER_ID\`: \`forge.quote_preview.pdf_engine.canonical_test_evidence.provenance.registry.adapter.v1\`
- \`SCHEMA_VERSION\`: \`forge.quote_preview.pdf_engine.canonical_test_evidence.provenance.registry.v1\`
- \`domainId\`: \`quote_preview_pdf_engine_canonical_test_evidence_provenance\`
- \`mode\`: \`read_only\`
- \`routeClass\`: \`preview_safe\`

## Provenance Types

079B classifies:

- real PDF file provenance;
- OCR text output provenance;
- fixture text provenance;
- expected value provenance;
- deterministic input provenance;
- rate/cache provenance;
- provider metadata provenance;
- governance assertion provenance;
- engine reference provenance.

## Critical Boundaries

079B explicitly blocks:

- fixture-as-real-PDF claims;
- governance-as-extraction-proof claims;
- invented expected values;
- untraceable projections;
- hardcoded financial truth;
- provider runtime without future gate;
- network calls without future gate;
- secret access without future gate;
- duplicate engine creation;
- duplicate parser creation;
- duplicate calculator creation.

## Registry Fields

Each provenance entry contains:

- \`provenance_id\`
- \`test_id\`
- \`file_path\`
- \`provenance_type\`
- \`provenance_status\`
- \`source_kind\`
- \`source_path\`
- \`source_hash_required\`
- \`expected_value_source_required\`
- \`engine_refs\`
- \`blocked_misuse\`
- \`verification_policy\`
- \`safe_errors\`
- \`safety_flags\`

## Not Authorized

079B does not authorize:

- PDF read;
- OCR execution;
- parser execution;
- calculator execution;
- Banxico call;
- provider call;
- test execution;
- quote generation;
- quote write or send;
- CRM, policy, pipeline, task, calendar, or message writes;
- backend connection;
- real engine execution;
- invented product, premium, coverage, projection, expected value, or quote truth.

## Final Decision

DECISION=$DECISION

LOCKED_DECISION=$LOCKED_DECISION

NEXT=$NEXT
EOF

cat > "$EVIDENCE_DOC" <<EOF
# Forge Quote Preview PDF Engine Canonical Test Evidence Provenance Implementation 079B

PHASE=$PHASE

STATUS=PASS

DECISION=$DECISION

LOCKED_DECISION=$LOCKED_DECISION

NEXT=$NEXT

## Evidence Summary

079B implements a local/static/read-only provenance registry.

It classifies provenance requirements without executing tests or engines.

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
- provenance registry shape;
- required provenance fields;
- real PDF file provenance;
- expected value provenance;
- Banxico/provider runtime gate;
- fixture-only provenance;
- governance-only provenance;
- existing engine reference requirement;
- missing provenance safe error;
- all safety flags false.

## Commands

- \`node --check $SURFACES_ADAPTER\`
- \`node --check $SURFACES_TEST\`
- \`node $SURFACES_TEST\`
- \`node --check $EVIDENCE_ADAPTER\`
- \`node --check $EVIDENCE_TEST\`
- \`node $EVIDENCE_TEST\`
- \`node --check $ADAPTER\`
- \`node --check $TEST\`
- \`node $TEST\`
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
# Forge Quote Preview PDF Engine Canonical Test Evidence Provenance Implementation Certificate 079B

PHASE=$PHASE

CERTIFICATE_STATUS=PASS

DECISION=$DECISION

LOCKED_DECISION=$LOCKED_DECISION

NEXT=$NEXT

## Certificate

079B certifies that Forge now has a local/static/read-only provenance registry for canonical test evidence.

Certified statements:

- provenance requirements are classified before execution;
- fixture-as-real-PDF claims are blocked;
- governance-as-extraction-proof claims are blocked;
- invented expected values are blocked;
- untraceable projections are blocked;
- Banxico/provider runtime requires a future gate;
- existing engine refs are required;
- no real tests are executed;
- no PDFs are read;
- no OCR/parsers/calculators/Banxico/providers are executed;
- all safety flags remain false.

## No-Effect Boundary

This implementation authorizes no PDF reads, OCR execution, parser execution, calculator execution, Banxico calls, test execution, quote generation, quote writes, provider calls, backend connection, or real effects.

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
    "phase": "079A_QUOTE_PREVIEW_PDF_ENGINE_CANONICAL_TEST_EVIDENCE_PROVENANCE_SCOPE",
    "confirmed": true,
    "lockedDecision": "QUOTE_PREVIEW_PDF_ENGINE_CANONICAL_TEST_EVIDENCE_PROVENANCE_SCOPED"
  },
  "next": "$NEXT",
  "implementation": {
    "adapter": "$ADAPTER",
    "test": "$TEST",
    "adapterId": "forge.quote_preview.pdf_engine.canonical_test_evidence.provenance.registry.adapter.v1",
    "schemaVersion": "forge.quote_preview.pdf_engine.canonical_test_evidence.provenance.registry.v1",
    "domainId": "quote_preview_pdf_engine_canonical_test_evidence_provenance",
    "mode": "read_only",
    "routeClass": "preview_safe",
    "registryType": "local_static_read_only_test_evidence_provenance_registry",
    "testExecutionIntroduced": false,
    "pdfReadIntroduced": false,
    "ocrExecutionIntroduced": false,
    "parserExecutionIntroduced": false,
    "calculatorExecutionIntroduced": false,
    "banxicoCallIntroduced": false,
    "providerExecutionIntroduced": false,
    "newExtractorCreated": false,
    "newParserCreated": false,
    "newCalculatorCreated": false
  },
  "discoveryEvidence": $(cat "$DISCOVERY_DIGEST_JSON"),
  "classifiedProvenanceTypes": [
    "real_pdf_file_provenance",
    "ocr_text_output_provenance",
    "fixture_text_provenance",
    "expected_value_provenance",
    "deterministic_input_provenance",
    "rate_cache_provenance",
    "provider_metadata_provenance",
    "governance_assertion_provenance",
    "engine_reference_provenance"
  ],
  "classificationRules": {
    "fixtureAsRealPdfBlocked": true,
    "governanceAsExtractionProofBlocked": true,
    "inventedExpectedFinancialValuesBlocked": true,
    "untraceableProjectionsBlocked": true,
    "providerRuntimeRequiresFutureGate": true,
    "engineReferencesMustUseExistingCatalog": true
  },
  "notAuthorized": {
    "pdfRead": false,
    "ocrExecution": false,
    "parserExecution": false,
    "calculatorExecution": false,
    "banxicoCall": false,
    "providerCall": false,
    "testExecution": false,
    "quoteGeneration": false,
    "quoteWrite": false,
    "quoteSend": false,
    "crmWrite": false,
    "policyWrite": false,
    "pipelineWrite": false,
    "taskCreate": false,
    "calendarCreate": false,
    "messageSend": false,
    "backendConnection": false,
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
    "base079A": "PASS",
    "discoveryJson": "PASS",
    "nodeCheckSurfacesAdapter": "PASS",
    "nodeCheckSurfacesTest": "PASS",
    "nodeSurfacesTest": "PASS",
    "nodeCheckEvidenceAdapter": "PASS",
    "nodeCheckEvidenceTest": "PASS",
    "nodeEvidenceTest": "PASS",
    "nodeCheckAdapter": "PASS",
    "nodeCheckTest": "PASS",
    "nodeTest": "PASS",
    "jsonTool": "PASS",
    "markerScan": "PASS",
    "gitDiffCheck": "PASS",
    "scopedSafetyScan": "PASS",
    "stagedDiffCheck": "PASS"
  }
}
EOF

pass "docs/evidence written"

stage "STAGE 10 UPDATE BUILD TREE / ROADMAP"

TREE_BLOCK=$(cat <<EOF

<!-- FORGE:$PHASE:START -->
## 079B Quote Preview PDF Engine Canonical Test Evidence Provenance Implementation

079B implements a local/static/read-only provenance registry for canonical test evidence.

Locked decision:
\`$LOCKED_DECISION\`

Implemented:

- \`$ADAPTER\`
- \`$TEST\`

The registry classifies provenance requirements without executing tests or engines.

Classified provenance types:

- real PDF file provenance;
- OCR text output provenance;
- fixture text provenance;
- expected value provenance;
- deterministic input provenance;
- rate/cache provenance;
- provider metadata provenance;
- governance assertion provenance;
- existing engine reference provenance.

Boundaries:

- fixture-as-real-PDF claims are blocked;
- governance-as-extraction-proof claims are blocked;
- invented expected values are blocked;
- untraceable projections are blocked;
- Banxico/provider runtime requires future gate;
- duplicate engine/parser/calculator creation is blocked;
- no PDF/OCR/parser/calculator/Banxico/provider/test execution is authorized.

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

stage "STAGE 10B TRIM TREE EOF BLANKS"
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

stage "STAGE 11 SAVE SCRIPT IN REPO"
mkdir -p "$(dirname "$SCRIPT_IN_REPO")"
cp "$0" "$SCRIPT_IN_REPO"
chmod +x "$SCRIPT_IN_REPO"
pass "$SCRIPT_IN_REPO"

stage "STAGE 12 VALIDATION"
run bash -n "$SCRIPT_IN_REPO"
run node --check "$SURFACES_ADAPTER"
run node --check "$SURFACES_TEST"
run node "$SURFACES_TEST"
run node --check "$EVIDENCE_ADAPTER"
run node --check "$EVIDENCE_TEST"
run node "$EVIDENCE_TEST"
run node --check "$ADAPTER"
run node --check "$TEST"
run node "$TEST"
run python3 -m json.tool "$AUDIT_JSON"

run rg -n "$PHASE|$DECISION|$LOCKED_DECISION|$NEXT|provenance registry|fixture-as-real-PDF|governance-as-extraction-proof|invented expected|untraceable projections|future gate|duplicate engine" \
  FORGE_MASTER_BUILD_TREE.md \
  docs/architecture/source-truth/FORGE_UNIFIED_BUILD_TREE_001.md \
  docs/roadmap/FORGE_ROADMAP_LOCK_001.md \
  "$ARCH_DOC" "$EVIDENCE_DOC" "$CERT_DOC" "$AUDIT_JSON" "$ADAPTER" "$TEST"

run git diff --check

stage "STAGE 13 SAFETY SCAN"
SCOPED_FILES=(
  "FORGE_MASTER_BUILD_TREE.md"
  "docs/architecture/source-truth/FORGE_UNIFIED_BUILD_TREE_001.md"
  "docs/roadmap/FORGE_ROADMAP_LOCK_001.md"
  "$ARCH_DOC"
  "$EVIDENCE_DOC"
  "$CERT_DOC"
  "$AUDIT_JSON"
  "$ADAPTER"
  "$TEST"
)

if rg -n 'localStorage|sessionStorage|fetch\(|XMLHttpRequest|navigator\.mediaDevices|SpeechRecognition|providerRuntimeEnabled:\s*true|networkCallsAllowed:\s*true|browserStorageEnabled:\s*true|mayCreateTruth:\s*true|maySendMessage:\s*true|mayWriteCrm:\s*true|mayCreateCalendarEvent:\s*true' "${SCOPED_FILES[@]}"; then
  fail "safety scan found prohibited runtime/browser/network marker"
fi

if rg -n '"?(crmWrite|pipelineWrite|policyWrite|quoteWrite|taskCreate|calendarCreate|messageSend|authReal|providerRuntime|secretAccess|browserPersistence|realEngineExecution|realEffectsAllowed|realEffectsEnabled|backendConnection|pdfRead|ocrExecution|parserExecution|calculatorExecution|banxicoCall|testExecution)"?\s*[:=]\s*true\b' "${SCOPED_FILES[@]}"; then
  fail "real-effect flag true found"
fi

pass "safety scan clean"

stage "STAGE 14 STAGE AUTHORIZED FILES"
AUTHORIZED_FILES=(
  "FORGE_MASTER_BUILD_TREE.md"
  "docs/architecture/source-truth/FORGE_UNIFIED_BUILD_TREE_001.md"
  "docs/roadmap/FORGE_ROADMAP_LOCK_001.md"
  "$ADAPTER"
  "$TEST"
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

stage "STAGE 15 COMMIT PUSH"
run git commit -m "feat: implement quote preview pdf canonical test evidence provenance registry"
run git push origin HEAD:main

stage "STAGE 16 FINAL CHECKPOINT"
run git status --short --branch
run git log --oneline -10

SUMMARY=$(cat <<EOF
PASS_079B_QUOTE_PREVIEW_PDF_ENGINE_CANONICAL_TEST_EVIDENCE_PROVENANCE_IMPLEMENTATION_COMMIT_PUSH_COMPLETE
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
