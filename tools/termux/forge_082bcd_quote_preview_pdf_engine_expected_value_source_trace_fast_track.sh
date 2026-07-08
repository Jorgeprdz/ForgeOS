#!/usr/bin/env bash
set -euo pipefail

CHAIN="082BCD_QUOTE_PREVIEW_PDF_ENGINE_EXPECTED_VALUE_SOURCE_TRACE_FAST_TRACK"
REPO="${REPO:-/storage/emulated/0/Forge OS}"
STAMP="$(date +%Y%m%d_%H%M%S)"
REPORT="/data/data/com.termux/files/home/${CHAIN}_RESULT_${STAMP}.md"
BACKUP_DIR=".forge-backups/082bcd-expected-value-source-trace-fast-track-${STAMP}"
SCRIPT_IN_REPO="tools/termux/forge_082bcd_quote_preview_pdf_engine_expected_value_source_trace_fast_track.sh"

PHASE_B="082B_QUOTE_PREVIEW_PDF_ENGINE_EXPECTED_VALUE_SOURCE_TRACE_IMPLEMENTATION"
DECISION_B="PASS_082B_QUOTE_PREVIEW_PDF_ENGINE_EXPECTED_VALUE_SOURCE_TRACE_IMPLEMENTATION"
LOCKED_B="QUOTE_PREVIEW_PDF_ENGINE_EXPECTED_VALUE_SOURCE_TRACE_LOCAL_STATIC_READ_ONLY_IMPLEMENTED"
PHASE_C="082C_QUOTE_PREVIEW_PDF_ENGINE_EXPECTED_VALUE_SOURCE_TRACE_QA_LOCK"
DECISION_C="PASS_082C_QUOTE_PREVIEW_PDF_ENGINE_EXPECTED_VALUE_SOURCE_TRACE_QA_LOCK"
LOCKED_C="QUOTE_PREVIEW_PDF_ENGINE_EXPECTED_VALUE_SOURCE_TRACE_QA_LOCKED"
PHASE_D="082D_QUOTE_PREVIEW_PDF_ENGINE_EXPECTED_VALUE_SOURCE_TRACE_DECISION_LOCK"
DECISION_D="PASS_082D_QUOTE_PREVIEW_PDF_ENGINE_EXPECTED_VALUE_SOURCE_TRACE_DECISION_LOCK"
LOCKED_D="QUOTE_PREVIEW_PDF_ENGINE_EXPECTED_VALUE_SOURCE_TRACE_LOCKED_AS_LOCAL_STATIC_READ_ONLY_NOT_BOUND_NOT_VERIFIED_REFERENCE_REGISTRY"
NEXT_AFTER_D="083A_QUOTE_PREVIEW_PDF_ENGINE_PARSER_OWNERSHIP_SCOPE"

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

ADAPTER="platform/adapters/quote-preview/quote-preview-pdf-engine-expected-value-source-trace-registry-adapter-082b.js"
TEST="tests/quote-preview-pdf-engine-expected-value-source-trace-registry-adapter-082b-test.js"

ARCH_DOC_B="docs/architecture/source-truth/FORGE_QUOTE_PREVIEW_PDF_ENGINE_EXPECTED_VALUE_SOURCE_TRACE_IMPLEMENTATION_082B.md"
EVIDENCE_DOC_B="docs/evidence/FORGE_QUOTE_PREVIEW_PDF_ENGINE_EXPECTED_VALUE_SOURCE_TRACE_IMPLEMENTATION_082B.md"
CERT_DOC_B="docs/evidence/FORGE_QUOTE_PREVIEW_PDF_ENGINE_EXPECTED_VALUE_SOURCE_TRACE_IMPLEMENTATION_CERTIFICATE_082B.md"
AUDIT_JSON_B="docs/evidence/forge-quote-preview-pdf-engine-expected-value-source-trace-implementation-audit-082b.json"
ARCH_DOC_C="docs/architecture/source-truth/FORGE_QUOTE_PREVIEW_PDF_ENGINE_EXPECTED_VALUE_SOURCE_TRACE_QA_LOCK_082C.md"
EVIDENCE_DOC_C="docs/evidence/FORGE_QUOTE_PREVIEW_PDF_ENGINE_EXPECTED_VALUE_SOURCE_TRACE_QA_LOCK_082C.md"
CERT_DOC_C="docs/evidence/FORGE_QUOTE_PREVIEW_PDF_ENGINE_EXPECTED_VALUE_SOURCE_TRACE_QA_LOCK_CERTIFICATE_082C.md"
AUDIT_JSON_C="docs/evidence/forge-quote-preview-pdf-engine-expected-value-source-trace-qa-audit-082c.json"
ARCH_DOC_D="docs/architecture/source-truth/FORGE_QUOTE_PREVIEW_PDF_ENGINE_EXPECTED_VALUE_SOURCE_TRACE_DECISION_LOCK_082D.md"
EVIDENCE_DOC_D="docs/evidence/FORGE_QUOTE_PREVIEW_PDF_ENGINE_EXPECTED_VALUE_SOURCE_TRACE_DECISION_LOCK_082D.md"
CERT_DOC_D="docs/evidence/FORGE_QUOTE_PREVIEW_PDF_ENGINE_EXPECTED_VALUE_SOURCE_TRACE_DECISION_LOCK_CERTIFICATE_082D.md"
AUDIT_JSON_D="docs/evidence/forge-quote-preview-pdf-engine-expected-value-source-trace-decision-audit-082d.json"

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
path=Path(sys.argv[1]); phase=sys.argv[2]; block=Path(sys.argv[3]).read_text()
text=path.read_text()
start=f"<!-- FORGE:{phase}:START -->"; end=f"<!-- FORGE:{phase}:END -->"
if start in text and end in text:
    text=text.split(start)[0].rstrip()+"\n\n"+block.strip()+"\n"+text.split(end,1)[1]
else:
    text=text.rstrip()+"\n\n"+block.strip()+"\n"
path.write_text(text.rstrip()+"\n")
PY
}

trim_tree_files(){
  python3 - <<'PY'
from pathlib import Path
for p in [Path("FORGE_MASTER_BUILD_TREE.md"),Path("docs/architecture/source-truth/FORGE_UNIFIED_BUILD_TREE_001.md"),Path("docs/roadmap/FORGE_ROADMAP_LOCK_001.md")]:
    p.write_text(p.read_text().rstrip()+"\n")
    print(f"trimmed EOF blanks: {p}")
PY
}

safety_scan(){
  local files=("$@")
  if rg -n 'localStorage|sessionStorage|fetch\(|XMLHttpRequest|navigator\.mediaDevices|SpeechRecognition|providerRuntimeEnabled:\s*true|networkCallsAllowed:\s*true|browserStorageEnabled:\s*true|mayCreateTruth:\s*true|maySendMessage:\s*true|mayWriteCrm:\s*true|mayCreateCalendarEvent:\s*true' "${files[@]}"; then fail "safety scan found prohibited runtime/browser/network marker"; fi
  if rg -n '"?(crmWrite|pipelineWrite|policyWrite|quoteWrite|taskCreate|calendarCreate|messageSend|authReal|providerRuntime|secretAccess|browserPersistence|realEngineExecution|realEffectsAllowed|realEffectsEnabled|backendConnection|pdfRead|ocrExecution|parserExecution|calculatorExecution|banxicoCall|testExecution)"?\s*[:=]\s*true\b' "${files[@]}"; then fail "real-effect flag true found"; fi
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
  [ -s "$staged_file" ] || fail "no staged changes for commit"
  pass "staged files are within authorized boundary"
  run git commit -m "$msg"
  run git push origin HEAD:main
}

mkdir -p "$(dirname "$REPORT")"; touch "$REPORT"; exec > >(tee -a "$REPORT") 2>&1

stage "STAGE 0 HEADER"
echo "CHAIN=$CHAIN"
echo "BOUNDARY=no PDF read; no hash computation; no OCR/parser/calculator/Banxico/provider/test execution; no expected-value verification; no backend; no quote write"
echo "REPORT=$REPORT"

cd "$REPO" || fail "No existe repo: $REPO"

stage "STAGE 1 CHECKPOINT / CLEAN INDEX"
run git status --short --branch
run git log --oneline -15
run git diff --name-status
run git diff --cached --name-status
run git reset

stage "STAGE 2 CONFIRM BASE 082A"
if git log --oneline -100 | grep -Eq "082A|scope quote preview pdf expected value source trace|QUOTE_PREVIEW_PDF_ENGINE_EXPECTED_VALUE_SOURCE_TRACE_SCOPED"; then
  pass "082A base found in git log"
elif [ -f "docs/evidence/forge-quote-preview-pdf-engine-expected-value-source-trace-scope-audit-082a.json" ]; then
  pass "082A audit fallback found"
else
  fail "082A base not found. Run 082A first."
fi

if [ -f "docs/evidence/forge-quote-preview-pdf-engine-expected-value-source-trace-scope-audit-082a.json" ]; then
  run python3 -m json.tool docs/evidence/forge-quote-preview-pdf-engine-expected-value-source-trace-scope-audit-082a.json
  if ! rg -n '"status"\s*:\s*"PASS"|"lockedDecision"\s*:\s*"QUOTE_PREVIEW_PDF_ENGINE_EXPECTED_VALUE_SOURCE_TRACE_SCOPED"|"next"\s*:\s*"082B_QUOTE_PREVIEW_PDF_ENGINE_EXPECTED_VALUE_SOURCE_TRACE_IMPLEMENTATION"' docs/evidence/forge-quote-preview-pdf-engine-expected-value-source-trace-scope-audit-082a.json >/dev/null; then
    fail "082A audit exists but does not confirm PASS/082B next"
  fi
fi

stage "STAGE 3 DISCOVERY"
DISCOVERY_JSON_FOUND="$(find_latest_discovery_json || true)"
[ -n "$DISCOVERY_JSON_FOUND" ] && [ -f "$DISCOVERY_JSON_FOUND" ] || fail "Discovery JSON not found"
DISCOVERY_DIGEST_JSON="$(mktemp)"
python3 - <<'PY' "$DISCOVERY_JSON_FOUND" "$DISCOVERY_DIGEST_JSON"
import json, sys
from pathlib import Path
source=Path(sys.argv[1]); target=Path(sys.argv[2]); data=json.loads(source.read_text()); rec=data.get("recommendation",{})
if rec.get("do_not_create_new_pdf_extractor") is not True:
    raise SystemExit("Discovery does not block new extractor creation")
digest={"discoveryJson":str(source),"counts":data.get("counts",{}),"knownSurfacesPresent":data.get("known_surfaces_present",[]),"realQuoteTestCandidateFiles":data.get("real_quote_test_candidate_files",[]),"recommendation":rec,"artifacts":data.get("artifacts",{})}
target.write_text(json.dumps(digest,indent=2,ensure_ascii=False)+"\n")
print("DISCOVERY_DIGEST_VALID")
PY

stage "STAGE 4 REQUIRED FILES / BACKUP"
for f in FORGE_MASTER_BUILD_TREE.md docs/architecture/source-truth/FORGE_UNIFIED_BUILD_TREE_001.md docs/roadmap/FORGE_ROADMAP_LOCK_001.md "$SURFACES_ADAPTER" "$SURFACES_TEST" "$EVIDENCE_ADAPTER" "$EVIDENCE_TEST" "$PROVENANCE_ADAPTER" "$PROVENANCE_TEST" "$READINESS_ADAPTER" "$READINESS_TEST" "$FILE_HASH_ADAPTER" "$FILE_HASH_TEST"; do
  [ -f "$f" ] || fail "Missing required file: $f"
done
mkdir -p "$BACKUP_DIR"
cp FORGE_MASTER_BUILD_TREE.md "$BACKUP_DIR/FORGE_MASTER_BUILD_TREE.md"
cp docs/architecture/source-truth/FORGE_UNIFIED_BUILD_TREE_001.md "$BACKUP_DIR/FORGE_UNIFIED_BUILD_TREE_001.md"
cp docs/roadmap/FORGE_ROADMAP_LOCK_001.md "$BACKUP_DIR/FORGE_ROADMAP_LOCK_001.md"
pass "$BACKUP_DIR"

stage "STAGE 5 BASE VALIDATION"
run node --check "$SURFACES_ADAPTER"; run node "$SURFACES_TEST"
run node --check "$EVIDENCE_ADAPTER"; run node "$EVIDENCE_TEST"
run node --check "$PROVENANCE_ADAPTER"; run node "$PROVENANCE_TEST"
run node --check "$READINESS_ADAPTER"; run node "$READINESS_TEST"
run node --check "$FILE_HASH_ADAPTER"; run node "$FILE_HASH_TEST"

stage "082B IMPLEMENT ADAPTER"
mkdir -p "$(dirname "$ADAPTER")" "$(dirname "$TEST")" "$(dirname "$ARCH_DOC_B")" "$(dirname "$EVIDENCE_DOC_B")" "$(dirname "$SCRIPT_IN_REPO")"

cat > "$ADAPTER" <<'NODE'
'use strict';

const evidence = require('./quote-preview-pdf-engine-canonical-test-evidence-registry-adapter-078b.js');
const provenance = require('./quote-preview-pdf-engine-canonical-test-evidence-provenance-registry-adapter-079b.js');
const readiness = require('./quote-preview-pdf-engine-canonical-execution-readiness-review-matrix-adapter-080b.js');
const fileHash = require('./quote-preview-pdf-engine-real-pdf-file-hash-provenance-registry-adapter-081b.js');

const ADAPTER_ID = 'forge.quote_preview.pdf_engine.expected_value_source_trace.registry.adapter.v1';
const SCHEMA_VERSION = 'forge.quote_preview.pdf_engine.expected_value_source_trace.registry.v1';
const DOMAIN_ID = 'quote_preview_pdf_engine_expected_value_source_trace';
const MODE = 'read_only';
const ROUTE_CLASS = 'preview_safe';

const SOURCE_TRACE_STATUSES = Object.freeze({ NOT_BOUND: 'not_bound' });
const VERIFICATION_STATUSES = Object.freeze({ NOT_VERIFIED: 'not_verified' });
const EXPECTED_VALUE_KINDS = Object.freeze({
  GMM_OUT_OF_POCKET_EXPECTED_VALUE: 'gmm_out_of_pocket_expected_value',
  RETIREMENT_MXN_PROJECTION_EXPECTED_VALUE: 'retirement_mxn_projection_expected_value',
  DETERMINISTIC_PROJECTION_INPUT_TRACE: 'deterministic_projection_input_trace',
});

const SAFE_ERROR_CODES = Object.freeze({
  TRACE_NOT_MAPPED: 'QUOTE_PREVIEW_EXPECTED_VALUE_SOURCE_TRACE_NOT_MAPPED',
  SOURCE_TRACE_NOT_BOUND: 'QUOTE_PREVIEW_EXPECTED_VALUE_SOURCE_TRACE_NOT_BOUND',
  EXPECTED_VALUE_NOT_VERIFIED: 'QUOTE_PREVIEW_EXPECTED_VALUE_NOT_VERIFIED',
  EXECUTION_NOT_AUTHORIZED: 'QUOTE_PREVIEW_EXPECTED_VALUE_EXECUTION_NOT_AUTHORIZED',
  INVENTED_EXPECTED_VALUE_BLOCKED: 'QUOTE_PREVIEW_INVENTED_EXPECTED_VALUE_BLOCKED',
  UNTRACEABLE_PROJECTION_BLOCKED: 'QUOTE_PREVIEW_UNTRACEABLE_PROJECTION_BLOCKED',
  DETERMINISTIC_INPUT_SOURCE_TRACE_NOT_BOUND: 'QUOTE_PREVIEW_DETERMINISTIC_INPUT_SOURCE_TRACE_NOT_BOUND',
  PARSER_EXECUTION_NOT_AUTHORIZED: 'QUOTE_PREVIEW_EXPECTED_VALUE_PARSER_EXECUTION_NOT_AUTHORIZED',
  CALCULATOR_EXECUTION_NOT_AUTHORIZED: 'QUOTE_PREVIEW_EXPECTED_VALUE_CALCULATOR_EXECUTION_NOT_AUTHORIZED',
  BANXICO_CALL_NOT_AUTHORIZED: 'QUOTE_PREVIEW_EXPECTED_VALUE_BANXICO_CALL_NOT_AUTHORIZED',
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

const REQUIRED_TRACE_FIELDS = Object.freeze([
  'trace_id',
  'test_id',
  'expected_value_kind',
  'product_family',
  'source_registry_refs',
  'required_source_trace',
  'source_trace_status',
  'verification_status',
  'execution_allowed',
  'blocked_misuse',
  'safe_errors',
  'safety_flags',
]);

function freezeTrace(trace) {
  return Object.freeze({
    ...trace,
    source_registry_refs: Object.freeze([...(trace.source_registry_refs || [])]),
    blocked_misuse: Object.freeze([...(trace.blocked_misuse || [])]),
    safe_errors: Object.freeze([...(trace.safe_errors || [])]),
    safety_flags: Object.freeze({ ...DEFAULT_SAFETY_FLAGS, ...(trace.safety_flags || {}) }),
  });
}

function makeTrace(params) {
  return freezeTrace({
    trace_id: params.trace_id,
    test_id: params.test_id,
    expected_value_kind: params.expected_value_kind,
    product_family: params.product_family,
    source_registry_refs: params.source_registry_refs,
    required_source_trace: params.required_source_trace,
    source_trace_status: SOURCE_TRACE_STATUSES.NOT_BOUND,
    verification_status: VERIFICATION_STATUSES.NOT_VERIFIED,
    execution_allowed: false,
    blocked_misuse: params.blocked_misuse,
    safe_errors: [
      SAFE_ERROR_CODES.SOURCE_TRACE_NOT_BOUND,
      SAFE_ERROR_CODES.EXPECTED_VALUE_NOT_VERIFIED,
      SAFE_ERROR_CODES.EXECUTION_NOT_AUTHORIZED,
      ...params.safe_errors,
    ],
  });
}

const EXPECTED_VALUE_SOURCE_TRACES = Object.freeze([
  makeTrace({
    trace_id: 'trace_gmm_out_of_pocket_expected_values',
    test_id: 'gmm_out_of_pocket_candidate',
    expected_value_kind: EXPECTED_VALUE_KINDS.GMM_OUT_OF_POCKET_EXPECTED_VALUE,
    product_family: 'gmm',
    source_registry_refs: ['prov_gmm_out_of_pocket_expected_values', 'tests/gmm-out-of-pocket-test.js', 'gmm-quote-summary-engine.js'],
    required_source_trace: 'pdf_derived_fields_or_fixture_source_or_existing_summary_engine',
    blocked_misuse: ['invented_expected_value', 'fixture_as_real_pdf', 'governance_as_extraction_proof', 'parser_execution_before_source_trace'],
    safe_errors: [SAFE_ERROR_CODES.INVENTED_EXPECTED_VALUE_BLOCKED, SAFE_ERROR_CODES.PARSER_EXECUTION_NOT_AUTHORIZED],
  }),
  makeTrace({
    trace_id: 'trace_real_retirement_mxn_expected_values',
    test_id: 'real_retirement_mxn_scenario_candidate',
    expected_value_kind: EXPECTED_VALUE_KINDS.RETIREMENT_MXN_PROJECTION_EXPECTED_VALUE,
    product_family: 'retirement',
    source_registry_refs: ['prov_real_retirement_mxn_expected_values', 'tests/real-retirement-mxn-scenario-test.js', 'imagina-ser-future-mxn-bridge.js', 'retirement-future-udi-projection-engine.js'],
    required_source_trace: 'pdf_derived_fields_plus_existing_projection_engine_inputs',
    blocked_misuse: ['invented_expected_value', 'untraceable_projection', 'invented_udi_growth', 'invented_current_udi', 'calculator_execution_before_source_trace'],
    safe_errors: [SAFE_ERROR_CODES.INVENTED_EXPECTED_VALUE_BLOCKED, SAFE_ERROR_CODES.UNTRACEABLE_PROJECTION_BLOCKED, SAFE_ERROR_CODES.CALCULATOR_EXECUTION_NOT_AUTHORIZED],
  }),
  makeTrace({
    trace_id: 'trace_retirement_future_udi_deterministic_inputs',
    test_id: 'retirement_future_udi_projection_smoke_candidate',
    expected_value_kind: EXPECTED_VALUE_KINDS.DETERMINISTIC_PROJECTION_INPUT_TRACE,
    product_family: 'retirement',
    source_registry_refs: ['prov_retirement_future_udi_deterministic_inputs', 'retirement-future-udi-projection-smoke-test.js', 'retirement-future-udi-projection-engine.js'],
    required_source_trace: 'existing_repo_engine_or_config_for_udi_current_value_and_growth_assumption',
    blocked_misuse: ['invented_udi_growth', 'invented_current_udi', 'calculator_execution_before_input_trace', 'banxico_call_disguised_as_trace'],
    safe_errors: [SAFE_ERROR_CODES.DETERMINISTIC_INPUT_SOURCE_TRACE_NOT_BOUND, SAFE_ERROR_CODES.CALCULATOR_EXECUTION_NOT_AUTHORIZED, SAFE_ERROR_CODES.BANXICO_CALL_NOT_AUTHORIZED],
  }),
]);

function clone(value) { return JSON.parse(JSON.stringify(value)); }

function getSourceRefs() {
  const evidenceCatalog = evidence.getQuotePreviewPdfCanonicalTestEvidenceRegistryCatalog();
  const provenanceCatalog = provenance.getQuotePreviewPdfCanonicalTestEvidenceProvenanceRegistryCatalog();
  const readinessCatalog = readiness.getQuotePreviewPdfCanonicalExecutionReadinessReviewMatrixCatalog();
  const fileHashCatalog = fileHash.getQuotePreviewPdfEngineRealPdfFileHashProvenanceRegistryCatalog();
  return {
    evidence: { adapter_id: evidenceCatalog.adapter_id, schemaVersion: evidenceCatalog.schemaVersion },
    provenance: { adapter_id: provenanceCatalog.adapter_id, schemaVersion: provenanceCatalog.schemaVersion },
    readiness: { adapter_id: readinessCatalog.adapter_id, schemaVersion: readinessCatalog.schemaVersion, overall_readiness: readinessCatalog.overall_readiness },
    file_hash: { adapter_id: fileHashCatalog.adapter_id, schemaVersion: fileHashCatalog.schemaVersion, overall_binding_status: fileHashCatalog.overall_binding_status },
  };
}

function getQuotePreviewPdfEngineExpectedValueSourceTraceRegistryCatalog() {
  return {
    adapter_id: ADAPTER_ID,
    schemaVersion: SCHEMA_VERSION,
    domainId: DOMAIN_ID,
    mode: MODE,
    routeClass: ROUTE_CLASS,
    registry_type: 'local_static_read_only_expected_value_source_trace_registry',
    overall_trace_status: 'not_bound_not_verified_not_ready',
    execution_allowed_in_registry: false,
    expected_value_verification_allowed_in_registry: false,
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
    required_trace_fields: [...REQUIRED_TRACE_FIELDS],
    safe_errors: Object.values(SAFE_ERROR_CODES),
    safety_flags: clone(DEFAULT_SAFETY_FLAGS),
    source_refs: getSourceRefs(),
    traces: clone(EXPECTED_VALUE_SOURCE_TRACES),
  };
}

function buildExpectedValueSourceTraceSafeError(traceId, code = SAFE_ERROR_CODES.TRACE_NOT_MAPPED) {
  return {
    schemaVersion: SCHEMA_VERSION,
    domainId: DOMAIN_ID,
    mode: MODE,
    routeClass: ROUTE_CLASS,
    readModelStatus: 'error',
    trace_id: traceId || null,
    test_id: null,
    expected_value_kind: null,
    product_family: null,
    source_registry_refs: [],
    required_source_trace: null,
    source_trace_status: SOURCE_TRACE_STATUSES.NOT_BOUND,
    verification_status: VERIFICATION_STATUSES.NOT_VERIFIED,
    execution_allowed: false,
    blocked_misuse: ['unmapped_expected_value_trace_execution', 'invented_expected_value', 'verification_before_source_trace'],
    safe_errors: [code, SAFE_ERROR_CODES.EXECUTION_NOT_AUTHORIZED, SAFE_ERROR_CODES.EXPECTED_VALUE_NOT_VERIFIED],
    safety_flags: clone(DEFAULT_SAFETY_FLAGS),
    safe_error: { code, message: 'Expected-value source trace is not mapped. Verification and execution are blocked.' },
  };
}

function getExpectedValueSourceTraceById(traceId) {
  const match = EXPECTED_VALUE_SOURCE_TRACES.find((trace) => trace.trace_id === traceId);
  return match ? clone(match) : buildExpectedValueSourceTraceSafeError(traceId);
}
function getExpectedValueSourceTracesByTestId(testId) { return clone(EXPECTED_VALUE_SOURCE_TRACES.filter((trace) => trace.test_id === testId)); }
function getExpectedValueSourceTracesByProductFamily(productFamily) { return clone(EXPECTED_VALUE_SOURCE_TRACES.filter((trace) => trace.product_family === productFamily)); }
function getUnboundExpectedValueSourceTraces() { return clone(EXPECTED_VALUE_SOURCE_TRACES.filter((trace) => trace.source_trace_status === SOURCE_TRACE_STATUSES.NOT_BOUND)); }
function getNotVerifiedExpectedValueSourceTraces() { return clone(EXPECTED_VALUE_SOURCE_TRACES.filter((trace) => trace.verification_status === VERIFICATION_STATUSES.NOT_VERIFIED)); }

function validateExpectedValueSourceTraceShape(trace) {
  const errors = [];
  if (!trace || typeof trace !== 'object') return { ok: false, valid: false, errors: ['trace_object_required'] };
  for (const field of REQUIRED_TRACE_FIELDS) if (!(field in trace)) errors.push(`missing_${field}`);
  if (trace.execution_allowed !== false) errors.push('execution_allowed_must_be_false');
  if (trace.source_trace_status !== SOURCE_TRACE_STATUSES.NOT_BOUND) errors.push('source_trace_status_must_remain_not_bound');
  if (trace.verification_status !== VERIFICATION_STATUSES.NOT_VERIFIED) errors.push('verification_status_must_remain_not_verified');
  for (const [key, value] of Object.entries(trace.safety_flags || {})) if (value !== false) errors.push(`safety_flag_not_false_${key}`);
  return { ok: errors.length === 0, valid: errors.length === 0, errors };
}

function validateExpectedValueSourceTraceRegistryCatalog(catalog) {
  const errors = [];
  if (!catalog || typeof catalog !== 'object') return { ok: false, valid: false, errors: ['catalog_object_required'] };
  if (catalog.schemaVersion !== SCHEMA_VERSION) errors.push('invalid_schemaVersion');
  if (catalog.domainId !== DOMAIN_ID) errors.push('invalid_domainId');
  if (catalog.mode !== MODE) errors.push('invalid_mode');
  if (catalog.routeClass !== ROUTE_CLASS) errors.push('invalid_routeClass');
  if (catalog.overall_trace_status !== 'not_bound_not_verified_not_ready') errors.push('overall_trace_status_must_remain_not_ready');
  for (const flagName of [
    'execution_allowed_in_registry',
    'expected_value_verification_allowed_in_registry',
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
  ]) if (catalog[flagName] !== false) errors.push(`${flagName}_must_be_false`);
  const traces = Array.isArray(catalog.traces) ? catalog.traces : [];
  if (traces.length !== 3) errors.push('three_expected_value_traces_required');
  for (const trace of traces) {
    const result = validateExpectedValueSourceTraceShape(trace);
    if (!result.ok) errors.push(...result.errors.map((error) => `${trace.trace_id || 'unknown'}:${error}`));
  }
  return { ok: errors.length === 0, valid: errors.length === 0, errors };
}

module.exports = {
  ADAPTER_ID,
  SCHEMA_VERSION,
  DOMAIN_ID,
  MODE,
  ROUTE_CLASS,
  SOURCE_TRACE_STATUSES,
  VERIFICATION_STATUSES,
  EXPECTED_VALUE_KINDS,
  SAFE_ERROR_CODES,
  DEFAULT_SAFETY_FLAGS,
  REQUIRED_TRACE_FIELDS,
  EXPECTED_VALUE_SOURCE_TRACES,
  getQuotePreviewPdfEngineExpectedValueSourceTraceRegistryCatalog,
  getExpectedValueSourceTraceById,
  getExpectedValueSourceTracesByTestId,
  getExpectedValueSourceTracesByProductFamily,
  getUnboundExpectedValueSourceTraces,
  getNotVerifiedExpectedValueSourceTraces,
  buildExpectedValueSourceTraceSafeError,
  validateExpectedValueSourceTraceShape,
  validateExpectedValueSourceTraceRegistryCatalog,
};
NODE

cat > "$TEST" <<'NODE'
'use strict';

const assert = require('node:assert/strict');
const adapter = require('../platform/adapters/quote-preview/quote-preview-pdf-engine-expected-value-source-trace-registry-adapter-082b.js');

assert.equal(adapter.ADAPTER_ID, 'forge.quote_preview.pdf_engine.expected_value_source_trace.registry.adapter.v1');
assert.equal(adapter.SCHEMA_VERSION, 'forge.quote_preview.pdf_engine.expected_value_source_trace.registry.v1');
assert.equal(adapter.MODE, 'read_only');
assert.equal(adapter.ROUTE_CLASS, 'preview_safe');

const catalog = adapter.getQuotePreviewPdfEngineExpectedValueSourceTraceRegistryCatalog();
assert.equal(catalog.registry_type, 'local_static_read_only_expected_value_source_trace_registry');
assert.equal(catalog.overall_trace_status, 'not_bound_not_verified_not_ready');
assert.equal(adapter.validateExpectedValueSourceTraceRegistryCatalog(catalog).ok, true);
assert.equal(catalog.traces.length, 3);

for (const flag of [
  'execution_allowed_in_registry',
  'expected_value_verification_allowed_in_registry',
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
]) assert.equal(catalog[flag], false, `${flag} must be false`);

for (const trace of catalog.traces) {
  for (const field of adapter.REQUIRED_TRACE_FIELDS) assert(field in trace, `${trace.trace_id} missing ${field}`);
  assert.equal(trace.source_trace_status, adapter.SOURCE_TRACE_STATUSES.NOT_BOUND);
  assert.equal(trace.verification_status, adapter.VERIFICATION_STATUSES.NOT_VERIFIED);
  assert.equal(trace.execution_allowed, false);
  assert(trace.safe_errors.includes(adapter.SAFE_ERROR_CODES.SOURCE_TRACE_NOT_BOUND));
  assert(trace.safe_errors.includes(adapter.SAFE_ERROR_CODES.EXPECTED_VALUE_NOT_VERIFIED));
  assert(trace.safe_errors.includes(adapter.SAFE_ERROR_CODES.EXECUTION_NOT_AUTHORIZED));
  assert.equal(adapter.validateExpectedValueSourceTraceShape(trace).ok, true);
}

assert.equal(adapter.getExpectedValueSourceTraceById('trace_gmm_out_of_pocket_expected_values').product_family, 'gmm');
assert.equal(adapter.getExpectedValueSourceTraceById('trace_real_retirement_mxn_expected_values').product_family, 'retirement');
assert.equal(adapter.getExpectedValueSourceTraceById('trace_retirement_future_udi_deterministic_inputs').expected_value_kind, adapter.EXPECTED_VALUE_KINDS.DETERMINISTIC_PROJECTION_INPUT_TRACE);
assert.equal(adapter.getExpectedValueSourceTracesByTestId('real_retirement_mxn_scenario_candidate').length, 1);
assert.equal(adapter.getExpectedValueSourceTracesByProductFamily('retirement').length, 2);
assert.equal(adapter.getExpectedValueSourceTracesByProductFamily('gmm').length, 1);
assert.equal(adapter.getUnboundExpectedValueSourceTraces().length, 3);
assert.equal(adapter.getNotVerifiedExpectedValueSourceTraces().length, 3);

const missing = adapter.getExpectedValueSourceTraceById('missing_trace');
assert.equal(missing.readModelStatus, 'error');
assert.equal(missing.execution_allowed, false);
assert.equal(missing.source_trace_status, adapter.SOURCE_TRACE_STATUSES.NOT_BOUND);
assert.equal(missing.verification_status, adapter.VERIFICATION_STATUSES.NOT_VERIFIED);
assert(missing.safe_errors.includes(adapter.SAFE_ERROR_CODES.TRACE_NOT_MAPPED));
assert(missing.safe_errors.includes(adapter.SAFE_ERROR_CODES.EXPECTED_VALUE_NOT_VERIFIED));
assert(missing.safe_errors.includes(adapter.SAFE_ERROR_CODES.EXECUTION_NOT_AUTHORIZED));
assert.equal(adapter.validateExpectedValueSourceTraceShape(missing).ok, true);

for (const [key, value] of Object.entries(adapter.DEFAULT_SAFETY_FLAGS)) assert.equal(value, false, `DEFAULT_SAFETY_FLAGS.${key} must be false`);
for (const trace of catalog.traces) {
  for (const [key, value] of Object.entries(trace.safety_flags || {})) assert.equal(value, false, `${trace.trace_id}.${key} must be false`);
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
]) assert(!combined.includes(fragment), `forbidden true flag found: ${fragment}`);

console.log('PASS quote preview pdf engine expected value source trace registry adapter 082B');
NODE

stage "082B VALIDATE"
run node --check "$ADAPTER"
run node --check "$TEST"
run node "$TEST"

stage "082B DOCS"
cat > "$ARCH_DOC_B" <<EOF
# Forge Quote Preview PDF Engine Expected Value Source Trace Implementation 082B

PHASE=$PHASE_B

STATUS=PASS

DECISION=$DECISION_B

LOCKED_DECISION=$LOCKED_B

NEXT=$PHASE_C

082B implements a local/static/read-only expected-value source trace registry.

Implemented:

- \`$ADAPTER\`
- \`$TEST\`

Registry status:

- \`not_bound_not_verified_not_ready\`

Trace candidates:

- \`trace_gmm_out_of_pocket_expected_values\`
- \`trace_real_retirement_mxn_expected_values\`
- \`trace_retirement_future_udi_deterministic_inputs\`

Every trace remains:

- \`source_trace_status=not_bound\`
- \`verification_status=not_verified\`
- \`execution_allowed=false\`

No expected-value verification, PDF read, parser, calculator, Banxico, provider, backend, test execution, or quote write is authorized.

DECISION=$DECISION_B

LOCKED_DECISION=$LOCKED_B

NEXT=$PHASE_C
EOF

cat > "$EVIDENCE_DOC_B" <<EOF
# Forge Quote Preview PDF Engine Expected Value Source Trace Implementation 082B

PHASE=$PHASE_B

STATUS=PASS

DECISION=$DECISION_B

LOCKED_DECISION=$LOCKED_B

NEXT=$PHASE_C

## Discovery Evidence

\`\`\`json
$(cat "$DISCOVERY_DIGEST_JSON")
\`\`\`

The focused test validates registry shape, all trace candidates, not-bound status, not-verified status, execution false, missing trace safe error, and safety flags false.

DECISION=$DECISION_B

LOCKED_DECISION=$LOCKED_B

NEXT=$PHASE_C
EOF

cat > "$CERT_DOC_B" <<EOF
# Forge Quote Preview PDF Engine Expected Value Source Trace Implementation Certificate 082B

PHASE=$PHASE_B

CERTIFICATE_STATUS=PASS

DECISION=$DECISION_B

LOCKED_DECISION=$LOCKED_B

NEXT=$PHASE_C

082B certifies that Forge now has a local/static/read-only expected-value source trace registry.

$DECISION_B
EOF

cat > "$AUDIT_JSON_B" <<EOF
{
  "phase": "$PHASE_B",
  "status": "PASS",
  "decision": "$DECISION_B",
  "lockedDecision": "$LOCKED_B",
  "base": {
    "phase": "082A_QUOTE_PREVIEW_PDF_ENGINE_EXPECTED_VALUE_SOURCE_TRACE_SCOPE",
    "confirmed": true,
    "lockedDecision": "QUOTE_PREVIEW_PDF_ENGINE_EXPECTED_VALUE_SOURCE_TRACE_SCOPED"
  },
  "next": "$PHASE_C",
  "implementation": {
    "adapter": "$ADAPTER",
    "test": "$TEST",
    "adapterId": "forge.quote_preview.pdf_engine.expected_value_source_trace.registry.adapter.v1",
    "schemaVersion": "forge.quote_preview.pdf_engine.expected_value_source_trace.registry.v1",
    "domainId": "quote_preview_pdf_engine_expected_value_source_trace",
    "mode": "read_only",
    "routeClass": "preview_safe",
    "registryType": "local_static_read_only_expected_value_source_trace_registry",
    "overallTraceStatus": "not_bound_not_verified_not_ready",
    "expectedValueVerificationIntroduced": false,
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
  "traces": {
    "gmmOutOfPocketExpectedValues": "not_bound_not_verified",
    "realRetirementMxnExpectedValues": "not_bound_not_verified",
    "retirementFutureUdiDeterministicInputs": "not_bound_not_verified"
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
## 082B Quote Preview PDF Engine Expected Value Source Trace Implementation

082B implements a local/static/read-only expected-value source trace registry.

Locked decision:
\`$LOCKED_B\`

Registry status:

- \`not_bound_not_verified_not_ready\`

Trace candidates:

- \`trace_gmm_out_of_pocket_expected_values\`
- \`trace_real_retirement_mxn_expected_values\`
- \`trace_retirement_future_udi_deterministic_inputs\`

Every trace remains:

- \`source_trace_status=not_bound\`
- \`verification_status=not_verified\`
- \`execution_allowed=false\`

DECISION=$DECISION_B

LOCKED_DECISION=$LOCKED_B

NEXT=$PHASE_C
<!-- FORGE:$PHASE_B:END -->
EOF

for tree in FORGE_MASTER_BUILD_TREE.md docs/architecture/source-truth/FORGE_UNIFIED_BUILD_TREE_001.md docs/roadmap/FORGE_ROADMAP_LOCK_001.md; do replace_or_append_block "$tree" "$PHASE_B" "$TREE_BLOCK_B"; done
trim_tree_files

stage "082B SAVE / VALIDATE / COMMIT"
cp "$0" "$SCRIPT_IN_REPO"; chmod +x "$SCRIPT_IN_REPO"
run bash -n "$SCRIPT_IN_REPO"
run python3 -m json.tool "$AUDIT_JSON_B"
run rg -n "$PHASE_B|$DECISION_B|$LOCKED_B|$PHASE_C|expected-value source trace|not_bound_not_verified_not_ready|source_trace_status=not_bound|verification_status=not_verified|execution_allowed=false" FORGE_MASTER_BUILD_TREE.md docs/architecture/source-truth/FORGE_UNIFIED_BUILD_TREE_001.md docs/roadmap/FORGE_ROADMAP_LOCK_001.md "$ARCH_DOC_B" "$EVIDENCE_DOC_B" "$CERT_DOC_B" "$AUDIT_JSON_B" "$ADAPTER" "$TEST"
run git diff --check
safety_scan FORGE_MASTER_BUILD_TREE.md docs/architecture/source-truth/FORGE_UNIFIED_BUILD_TREE_001.md docs/roadmap/FORGE_ROADMAP_LOCK_001.md "$ARCH_DOC_B" "$EVIDENCE_DOC_B" "$CERT_DOC_B" "$AUDIT_JSON_B" "$ADAPTER" "$TEST"
commit_allowed_subset "feat: implement quote preview pdf expected value source trace registry" FORGE_MASTER_BUILD_TREE.md docs/architecture/source-truth/FORGE_UNIFIED_BUILD_TREE_001.md docs/roadmap/FORGE_ROADMAP_LOCK_001.md "$ADAPTER" "$TEST" "$ARCH_DOC_B" "$EVIDENCE_DOC_B" "$CERT_DOC_B" "$AUDIT_JSON_B" "$SCRIPT_IN_REPO"

# 082C
stage "082C QA"
SEMANTIC_QA_JSON="$(mktemp)"
node <<'NODE' > "$SEMANTIC_QA_JSON"
const assert = require("node:assert/strict");
const trace = require("./platform/adapters/quote-preview/quote-preview-pdf-engine-expected-value-source-trace-registry-adapter-082b.js");
const catalog = trace.getQuotePreviewPdfEngineExpectedValueSourceTraceRegistryCatalog();
assert.equal(trace.ADAPTER_ID, "forge.quote_preview.pdf_engine.expected_value_source_trace.registry.adapter.v1");
assert.equal(catalog.overall_trace_status, "not_bound_not_verified_not_ready");
assert.equal(trace.validateExpectedValueSourceTraceRegistryCatalog(catalog).ok, true);
assert.equal(catalog.traces.length, 3);
for (const entry of catalog.traces) {
  assert.equal(entry.source_trace_status, trace.SOURCE_TRACE_STATUSES.NOT_BOUND);
  assert.equal(entry.verification_status, trace.VERIFICATION_STATUSES.NOT_VERIFIED);
  assert.equal(entry.execution_allowed, false);
}
assert.equal(trace.getUnboundExpectedValueSourceTraces().length, 3);
assert.equal(trace.getNotVerifiedExpectedValueSourceTraces().length, 3);
console.log(JSON.stringify({
  status: "PASS",
  catalogValidated: true,
  traceCount: 3,
  allTracesNotBound: true,
  allTracesNotVerified: true,
  allExecutionsFalse: true,
  noExpectedValueVerification: true,
  noParserExecution: true,
  noCalculatorExecution: true,
  noBanxicoCall: true,
  allSafetyFlagsFalse: true
}, null, 2));
NODE

cat > "$ARCH_DOC_C" <<EOF
# Forge Quote Preview PDF Engine Expected Value Source Trace QA Lock 082C

PHASE=$PHASE_C

STATUS=PASS

DECISION=$DECISION_C

LOCKED_DECISION=$LOCKED_C

NEXT=$PHASE_D

082C QA locks the 082B expected-value source trace registry.

Validated:

- registry shape;
- all three trace candidates;
- \`source_trace_status=not_bound\`;
- \`verification_status=not_verified\`;
- \`execution_allowed=false\`;
- all safety flags false.

No expected-value verification/PDF read/parser/calculator/Banxico/test execution is authorized.

DECISION=$DECISION_C

LOCKED_DECISION=$LOCKED_C

NEXT=$PHASE_D
EOF

cat > "$EVIDENCE_DOC_C" <<EOF
# Forge Quote Preview PDF Engine Expected Value Source Trace QA Lock 082C

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

DECISION=$DECISION_C

LOCKED_DECISION=$LOCKED_C

NEXT=$PHASE_D
EOF

cat > "$CERT_DOC_C" <<EOF
# Forge Quote Preview PDF Engine Expected Value Source Trace QA Lock Certificate 082C

PHASE=$PHASE_C

CERTIFICATE_STATUS=PASS

DECISION=$DECISION_C

LOCKED_DECISION=$LOCKED_C

NEXT=$PHASE_D

082C certifies that all expected-value traces remain not bound, not verified, and not executable.

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
    "traceCount": 3,
    "allTracesNotBound": true,
    "allTracesNotVerified": true,
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
## 082C Quote Preview PDF Engine Expected Value Source Trace QA Lock

082C QA locks the 082B expected-value source trace registry.

Locked decision:
\`$LOCKED_C\`

QA validated:

- all traces remain \`not_bound\`;
- all expected values remain \`not_verified\`;
- all executions remain \`false\`;
- no expected-value verification/PDF read/parser/calculator/Banxico/test execution is authorized.

DECISION=$DECISION_C

LOCKED_DECISION=$LOCKED_C

NEXT=$PHASE_D
<!-- FORGE:$PHASE_C:END -->
EOF

for tree in FORGE_MASTER_BUILD_TREE.md docs/architecture/source-truth/FORGE_UNIFIED_BUILD_TREE_001.md docs/roadmap/FORGE_ROADMAP_LOCK_001.md; do replace_or_append_block "$tree" "$PHASE_C" "$TREE_BLOCK_C"; done
trim_tree_files

stage "082C VALIDATE / COMMIT"
run node --check "$ADAPTER"; run node --check "$TEST"; run node "$TEST"
run python3 -m json.tool "$AUDIT_JSON_C"
run rg -n "$PHASE_C|$DECISION_C|$LOCKED_C|$PHASE_D|QA locks|not_bound|not_verified|execution_allowed=false|no expected-value verification" FORGE_MASTER_BUILD_TREE.md docs/architecture/source-truth/FORGE_UNIFIED_BUILD_TREE_001.md docs/roadmap/FORGE_ROADMAP_LOCK_001.md "$ARCH_DOC_C" "$EVIDENCE_DOC_C" "$CERT_DOC_C" "$AUDIT_JSON_C"
run git diff --check
safety_scan FORGE_MASTER_BUILD_TREE.md docs/architecture/source-truth/FORGE_UNIFIED_BUILD_TREE_001.md docs/roadmap/FORGE_ROADMAP_LOCK_001.md "$ARCH_DOC_C" "$EVIDENCE_DOC_C" "$CERT_DOC_C" "$AUDIT_JSON_C" "$ADAPTER" "$TEST"
commit_allowed_subset "docs: lock quote preview pdf expected value source trace qa" FORGE_MASTER_BUILD_TREE.md docs/architecture/source-truth/FORGE_UNIFIED_BUILD_TREE_001.md docs/roadmap/FORGE_ROADMAP_LOCK_001.md "$ARCH_DOC_C" "$EVIDENCE_DOC_C" "$CERT_DOC_C" "$AUDIT_JSON_C" "$SCRIPT_IN_REPO"

# 082D
stage "082D DECISION LOCK"
DECISION_QA_JSON="$(mktemp)"
node <<'NODE' > "$DECISION_QA_JSON"
const assert = require("node:assert/strict");
const trace = require("./platform/adapters/quote-preview/quote-preview-pdf-engine-expected-value-source-trace-registry-adapter-082b.js");
const catalog = trace.getQuotePreviewPdfEngineExpectedValueSourceTraceRegistryCatalog();
assert.equal(catalog.overall_trace_status, "not_bound_not_verified_not_ready");
assert.equal(trace.validateExpectedValueSourceTraceRegistryCatalog(catalog).ok, true);
assert.equal(catalog.traces.length, 3);
for (const entry of catalog.traces) {
  assert.equal(entry.source_trace_status, trace.SOURCE_TRACE_STATUSES.NOT_BOUND);
  assert.equal(entry.verification_status, trace.VERIFICATION_STATUSES.NOT_VERIFIED);
  assert.equal(entry.execution_allowed, false);
}
console.log(JSON.stringify({
  status: "PASS",
  locked_as: "local_static_read_only_not_bound_not_verified_reference_registry",
  overall_trace_status: catalog.overall_trace_status,
  traces_count: catalog.traces.length,
  all_traces_not_bound: true,
  all_values_not_verified: true,
  all_executions_false: true,
  next_scope: "083A_QUOTE_PREVIEW_PDF_ENGINE_PARSER_OWNERSHIP_SCOPE",
  expected_value_verification_blocked: true,
  parser_execution_blocked: true,
  calculator_execution_blocked: true,
  banxico_call_blocked: true,
  all_safety_flags_false: true
}, null, 2));
NODE

cat > "$ARCH_DOC_D" <<EOF
# Forge Quote Preview PDF Engine Expected Value Source Trace Decision Lock 082D

PHASE=$PHASE_D

STATUS=PASS

DECISION=$DECISION_D

LOCKED_DECISION=$LOCKED_D

NEXT=$NEXT_AFTER_D

082D decision-locks the 082B/082C expected-value source trace registry as a local/static/read-only not-bound/not-verified reference registry.

Confirmed:

- all three expected-value source trace candidates exist;
- all traces remain \`not_bound\`;
- all expected values remain \`not_verified\`;
- all executions remain \`false\`;
- expected-value verification remains blocked;
- parser/calculator/Banxico execution remains blocked.

DECISION=$DECISION_D

LOCKED_DECISION=$LOCKED_D

NEXT=$NEXT_AFTER_D
EOF

cat > "$EVIDENCE_DOC_D" <<EOF
# Forge Quote Preview PDF Engine Expected Value Source Trace Decision Lock 082D

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

DECISION=$DECISION_D

LOCKED_DECISION=$LOCKED_D

NEXT=$NEXT_AFTER_D
EOF

cat > "$CERT_DOC_D" <<EOF
# Forge Quote Preview PDF Engine Expected Value Source Trace Decision Lock Certificate 082D

PHASE=$PHASE_D

CERTIFICATE_STATUS=PASS

DECISION=$DECISION_D

LOCKED_DECISION=$LOCKED_D

NEXT=$NEXT_AFTER_D

082D certifies that the expected-value source trace registry is locked as a local/static/read-only not-bound/not-verified reference registry.

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
  "lockedAs": "local_static_read_only_not_bound_not_verified_reference_registry",
  "decisionAssertions": $(cat "$DECISION_QA_JSON"),
  "discoveryEvidence": $(cat "$DISCOVERY_DIGEST_JSON"),
  "confirmed": {
    "registryShapeValidates": true,
    "traceCount": 3,
    "allTracesNotBound": true,
    "allValuesNotVerified": true,
    "allExecutionsFalse": true
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
## 082D Quote Preview PDF Engine Expected Value Source Trace Decision Lock

082D decision-locks the 082B/082C expected-value source trace registry as a local/static/read-only not-bound/not-verified reference registry.

Locked decision:
\`$LOCKED_D\`

Confirmed:

- all traces remain \`not_bound\`;
- all expected values remain \`not_verified\`;
- all executions remain \`false\`;
- expected-value verification remains blocked.

Next:

- \`$NEXT_AFTER_D\` may scope parser ownership only.
- No execution is authorized.

DECISION=$DECISION_D

LOCKED_DECISION=$LOCKED_D

NEXT=$NEXT_AFTER_D
<!-- FORGE:$PHASE_D:END -->
EOF

for tree in FORGE_MASTER_BUILD_TREE.md docs/architecture/source-truth/FORGE_UNIFIED_BUILD_TREE_001.md docs/roadmap/FORGE_ROADMAP_LOCK_001.md; do replace_or_append_block "$tree" "$PHASE_D" "$TREE_BLOCK_D"; done
trim_tree_files

stage "082D VALIDATE / COMMIT"
run node --check "$ADAPTER"; run node --check "$TEST"; run node "$TEST"
run python3 -m json.tool "$AUDIT_JSON_D"
run rg -n "$PHASE_D|$DECISION_D|$LOCKED_D|$NEXT_AFTER_D|not-bound/not-verified reference registry|all traces remain|parser ownership|No execution" FORGE_MASTER_BUILD_TREE.md docs/architecture/source-truth/FORGE_UNIFIED_BUILD_TREE_001.md docs/roadmap/FORGE_ROADMAP_LOCK_001.md "$ARCH_DOC_D" "$EVIDENCE_DOC_D" "$CERT_DOC_D" "$AUDIT_JSON_D"
run git diff --check
safety_scan FORGE_MASTER_BUILD_TREE.md docs/architecture/source-truth/FORGE_UNIFIED_BUILD_TREE_001.md docs/roadmap/FORGE_ROADMAP_LOCK_001.md "$ARCH_DOC_D" "$EVIDENCE_DOC_D" "$CERT_DOC_D" "$AUDIT_JSON_D" "$ADAPTER" "$TEST"
commit_allowed_subset "docs: lock quote preview pdf expected value source trace decision" FORGE_MASTER_BUILD_TREE.md docs/architecture/source-truth/FORGE_UNIFIED_BUILD_TREE_001.md docs/roadmap/FORGE_ROADMAP_LOCK_001.md "$ARCH_DOC_D" "$EVIDENCE_DOC_D" "$CERT_DOC_D" "$AUDIT_JSON_D" "$SCRIPT_IN_REPO"

stage "FINAL CHECKPOINT"
run git status --short --branch
run git log --oneline -12

SUMMARY=$(cat <<EOF
PASS_082BCD_QUOTE_PREVIEW_PDF_ENGINE_EXPECTED_VALUE_SOURCE_TRACE_FAST_TRACK_COMMIT_PUSH_COMPLETE
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
