#!/usr/bin/env bash
set -euo pipefail

PHASE="077B_QUOTE_PREVIEW_PDF_ENGINE_EXISTING_SURFACES_CANONICAL_MAPPING_IMPLEMENTATION"
DECISION="PASS_077B_QUOTE_PREVIEW_PDF_ENGINE_EXISTING_SURFACES_CANONICAL_MAPPING_IMPLEMENTATION"
LOCKED_DECISION="QUOTE_PREVIEW_PDF_ENGINE_EXISTING_SURFACES_CANONICAL_MAPPING_LOCAL_STATIC_READ_ONLY_IMPLEMENTED"
NEXT="077C_QUOTE_PREVIEW_PDF_ENGINE_EXISTING_SURFACES_CANONICAL_MAPPING_QA_LOCK"
REPO="${REPO:-/storage/emulated/0/Forge OS}"
STAMP="$(date +%Y%m%d_%H%M%S)"
REPORT="/data/data/com.termux/files/home/${PHASE}_RESULT_${STAMP}.md"
BACKUP_DIR=".forge-backups/077b-existing-surfaces-canonical-mapping-${STAMP}"
SCRIPT_IN_REPO="tools/termux/forge_077b_quote_preview_pdf_engine_existing_surfaces_canonical_mapping_implementation.sh"

ADAPTER="platform/adapters/quote-preview/quote-preview-pdf-engine-existing-surfaces-canonical-mapping-adapter-077b.js"
TEST="tests/quote-preview-pdf-engine-existing-surfaces-canonical-mapping-adapter-077b-test.js"
ARCH_DOC="docs/architecture/source-truth/FORGE_QUOTE_PREVIEW_PDF_ENGINE_EXISTING_SURFACES_CANONICAL_MAPPING_IMPLEMENTATION_077B.md"
EVIDENCE_DOC="docs/evidence/FORGE_QUOTE_PREVIEW_PDF_ENGINE_EXISTING_SURFACES_CANONICAL_MAPPING_IMPLEMENTATION_077B.md"
CERT_DOC="docs/evidence/FORGE_QUOTE_PREVIEW_PDF_ENGINE_EXISTING_SURFACES_CANONICAL_MAPPING_IMPLEMENTATION_CERTIFICATE_077B.md"
AUDIT_JSON="docs/evidence/forge-quote-preview-pdf-engine-existing-surfaces-canonical-mapping-implementation-audit-077b.json"

CYAN="\033[1;36m"; GREEN="\033[1;38;5;46m"; YELLOW="\033[1;93m"; RED="\033[1;91m"; RESET="\033[0m"
stage(){ printf "\n${CYAN}========== %s ==========${RESET}\n" "$1"; }
pass(){ printf "${GREEN}PASS:${RESET} %s\n" "$1"; }
warn(){ printf "${YELLOW}WARN:${RESET} %s\n" "$1"; }
fail(){ printf "${RED}HOLD:${RESET} %s\n" "$1"; echo "DECISION=HOLD_${PHASE}" | tee -a "$REPORT"; echo "REPORT=$REPORT" | tee -a "$REPORT"; exit 1; }
run(){ echo; echo "========== RUN =========="; printf '%q ' "$@"; echo; "$@"; }

find_latest_discovery_json(){
  if [ -n "${DISCOVERY_JSON:-}" ] && [ -f "$DISCOVERY_JSON" ]; then printf "%s\n" "$DISCOVERY_JSON"; return 0; fi
  find /data/data/com.termux/files/home -path "*/forge-discovery-*/*DISCOVERY_077A_PRECHECK_EXISTING_QUOTE_PDF_TESTS_AND_ENGINES_REPORT_*.json" -type f 2>/dev/null | sort | tail -1
}

mkdir -p "$(dirname "$REPORT")"; touch "$REPORT"
exec > >(tee -a "$REPORT") 2>&1

stage "STAGE 0 HEADER"
echo "PHASE=$PHASE"
echo "MODE=local/static/read-only canonical mapping implementation"
echo "BOUNDARY=no UI/backend/effects; no PDF/OCR/parser/calculator/Banxico/provider execution; no new extractor/parser/calculator"
echo "REPORT=$REPORT"

cd "$REPO" || fail "No existe repo: $REPO"

stage "STAGE 1 CHECKPOINT"
run git status --short --branch
run git log --oneline -12
run git diff --name-status
run git diff --cached --name-status

stage "STAGE 2 CONFIRM BASE 077A"
if git log --oneline -50 | grep -Eq "077A|scope quote preview pdf existing surfaces reconciliation|QUOTE_PREVIEW_PDF_ENGINE_EXISTING_TESTS_AND_ENGINES_RECONCILIATION_SCOPED"; then
  pass "077A found"
else
  [ -f "docs/evidence/forge-quote-preview-pdf-engine-existing-tests-and-engines-reconciliation-scope-audit-077a.json" ] || fail "077A base not found"
  pass "077A audit fallback found"
fi

if [ -f "docs/evidence/forge-quote-preview-pdf-engine-existing-tests-and-engines-reconciliation-scope-audit-077a.json" ]; then
  run python3 -m json.tool docs/evidence/forge-quote-preview-pdf-engine-existing-tests-and-engines-reconciliation-scope-audit-077a.json
fi

stage "STAGE 3 DISCOVERY EVIDENCE"
DISCOVERY_JSON_FOUND="$(find_latest_discovery_json || true)"
[ -f "$DISCOVERY_JSON_FOUND" ] || fail "Discovery JSON not found"
DISCOVERY_DIR="$(dirname "$DISCOVERY_JSON_FOUND")"
DISCOVERY_REPORT_MD="$(find "$DISCOVERY_DIR" -maxdepth 1 -type f -name '*DISCOVERY_077A_PRECHECK_EXISTING_QUOTE_PDF_TESTS_AND_ENGINES_REPORT_*.md' | sort | tail -1 || true)"
echo "DISCOVERY_JSON=$DISCOVERY_JSON_FOUND"
run python3 -m json.tool "$DISCOVERY_JSON_FOUND"

DISCOVERY_DIGEST_JSON="$(mktemp)"
python3 - <<'PY' "$DISCOVERY_JSON_FOUND" "$DISCOVERY_DIGEST_JSON"
import json, sys
from pathlib import Path
src=Path(sys.argv[1]); out=Path(sys.argv[2])
data=json.loads(src.read_text())
rec=data.get("recommendation", {})
if rec.get("do_not_create_new_pdf_extractor") is not True:
    raise SystemExit("Discovery does not block new extractor creation")
out.write_text(json.dumps({
    "discoveryJson": str(src),
    "counts": data.get("counts", {}),
    "knownSurfacesPresent": data.get("known_surfaces_present", []),
    "realQuoteTestCandidateFiles": data.get("real_quote_test_candidate_files", []),
    "recommendation": rec
}, indent=2, ensure_ascii=False)+"\n")
PY
cat "$DISCOVERY_DIGEST_JSON"
pass "discovery confirmed"

stage "STAGE 4 REQUIRED FILES"
for f in FORGE_MASTER_BUILD_TREE.md docs/architecture/source-truth/FORGE_UNIFIED_BUILD_TREE_001.md docs/roadmap/FORGE_ROADMAP_LOCK_001.md; do
  [ -f "$f" ] || fail "missing $f"
  pass "$f"
done

stage "STAGE 5 BACKUP"
mkdir -p "$BACKUP_DIR"
cp FORGE_MASTER_BUILD_TREE.md "$BACKUP_DIR/FORGE_MASTER_BUILD_TREE.md"
cp docs/architecture/source-truth/FORGE_UNIFIED_BUILD_TREE_001.md "$BACKUP_DIR/FORGE_UNIFIED_BUILD_TREE_001.md"
cp docs/roadmap/FORGE_ROADMAP_LOCK_001.md "$BACKUP_DIR/FORGE_ROADMAP_LOCK_001.md"
cat > "$BACKUP_DIR/rollback-077b.sh" <<ROLLBACK
#!/usr/bin/env bash
set -euo pipefail
cp "$BACKUP_DIR/FORGE_MASTER_BUILD_TREE.md" FORGE_MASTER_BUILD_TREE.md
cp "$BACKUP_DIR/FORGE_UNIFIED_BUILD_TREE_001.md" docs/architecture/source-truth/FORGE_UNIFIED_BUILD_TREE_001.md
cp "$BACKUP_DIR/FORGE_ROADMAP_LOCK_001.md" docs/roadmap/FORGE_ROADMAP_LOCK_001.md
rm -f "$ADAPTER" "$TEST" "$ARCH_DOC" "$EVIDENCE_DOC" "$CERT_DOC" "$AUDIT_JSON" "$SCRIPT_IN_REPO"
echo "rollback 077B complete"
ROLLBACK
chmod +x "$BACKUP_DIR/rollback-077b.sh"
pass "backup created"

stage "STAGE 6 WRITE ADAPTER"
mkdir -p "$(dirname "$ADAPTER")"
cat > "$ADAPTER" <<'NODE'
'use strict';

const ADAPTER_ID = 'forge.quote_preview.pdf_engine.existing_surfaces.canonical_mapping.adapter.v1';
const SCHEMA_VERSION = 'forge.quote_preview.pdf_engine.existing_surfaces.canonical_mapping.v1';
const DOMAIN_ID = 'quote_preview_pdf_engine_existing_surfaces_canonical_mapping';
const MODE = 'read_only';
const ROUTE_CLASS = 'preview_safe';

const CANONICAL_STATUSES = Object.freeze({
  CANDIDATE_CANONICAL: 'candidate_canonical',
  CURRENT_CANONICAL: 'current_canonical',
  DECISION_REQUIRED: 'canonical_decision_required',
  GOVERNANCE_ADAPTER: 'governance_adapter',
  NOT_PRESENT: 'not_present',
});

const SURFACE_TYPES = Object.freeze({
  PDF_EXTRACTION: 'pdf_extraction',
  PDF_PREVIEW_ORCHESTRATION: 'pdf_preview_orchestration',
  PARSER: 'parser',
  SUMMARY_ENGINE: 'summary_engine',
  CALCULATOR: 'calculator',
  RATE_PROVIDER: 'rate_provider',
  RATE_CACHE: 'rate_cache',
  PRODUCT_INTELLIGENCE_ADAPTER: 'product_intelligence_adapter',
  QUOTE_PREVIEW_BINDING_ADAPTER: 'quote_preview_binding_adapter',
  PDF_TO_PI_INTEGRATION_ADAPTER: 'pdf_to_product_intelligence_integration_adapter',
  REPO_PROMOTION_GUARDRAIL: 'repo_promotion_guardrail_adapter',
  REAL_TEST: 'real_test',
  FIXTURE_TEST: 'fixture_test',
});

const SAFE_ERROR_CODES = Object.freeze({
  SURFACE_NOT_MAPPED: 'QUOTE_PREVIEW_PDF_EXISTING_SURFACE_NOT_MAPPED',
  CANONICAL_DECISION_REQUIRED: 'QUOTE_PREVIEW_PDF_EXISTING_SURFACE_CANONICAL_DECISION_REQUIRED',
  NEW_EXTRACTOR_BLOCKED: 'QUOTE_PREVIEW_PDF_NEW_EXTRACTOR_BLOCKED_BEFORE_RECONCILIATION',
  NEW_PARSER_BLOCKED: 'QUOTE_PREVIEW_PDF_NEW_PARSER_BLOCKED_BEFORE_RECONCILIATION',
  NEW_CALCULATOR_BLOCKED: 'QUOTE_PREVIEW_PDF_NEW_CALCULATOR_BLOCKED_BEFORE_RECONCILIATION',
  EXECUTION_NOT_AUTHORIZED: 'QUOTE_PREVIEW_PDF_EXISTING_SURFACE_EXECUTION_NOT_AUTHORIZED',
});

const DEFAULT_SAFETY_FLAGS = Object.freeze({
  crmWrite: false, pipelineWrite: false, policyWrite: false, quoteWrite: false,
  taskCreate: false, calendarCreate: false, messageSend: false, authReal: false,
  providerRuntime: false, secretAccess: false, browserPersistence: false,
  realEngineExecution: false, realEffectsAllowed: false, realEffectsEnabled: false,
  backendConnection: false, pdfRead: false, ocrExecution: false,
  parserExecution: false, calculatorExecution: false, banxicoCall: false,
});

const REQUIRED_MAPPING_FIELDS = Object.freeze([
  'surface_id', 'file_path', 'surface_type', 'domain', 'product_family',
  'canonical_candidate', 'canonical_status', 'allowed_role', 'blocked_growth',
  'test_refs', 'engine_refs', 'product_intelligence_binding_required',
  'quote_preview_downstream_only', 'safe_errors', 'safety_flags',
]);

const BLOCKED_EFFECTS = Object.freeze([
  'pdf_read', 'ocr_execution', 'parser_execution', 'calculator_execution',
  'banxico_call', 'provider_call', 'quote_generation', 'quote_write',
  'backend_connection', 'real_engine_execution', 'invented_quote_truth',
]);

function clone(value) { return JSON.parse(JSON.stringify(value)); }

function surface(input) {
  return Object.freeze({
    ...input,
    product_family: Object.freeze([...(input.product_family || [])]),
    blocked_growth: Object.freeze([...(input.blocked_growth || [])]),
    test_refs: Object.freeze([...(input.test_refs || [])]),
    engine_refs: Object.freeze([...(input.engine_refs || [])]),
    safe_errors: Object.freeze([...(input.safe_errors || [])]),
    safety_flags: Object.freeze({ ...DEFAULT_SAFETY_FLAGS, ...(input.safety_flags || {}) }),
  });
}

const ALL_SURFACES = Object.freeze([
  surface({
    surface_id: 'pdf_extraction_policy_ocr_engine',
    file_path: 'policy-operations/evidence/policy-ocr-engine.js',
    surface_type: SURFACE_TYPES.PDF_EXTRACTION,
    domain: 'pdf_ocr_extraction',
    product_family: ['GMM', 'Imagina Ser', 'Solucionline'],
    canonical_candidate: true,
    canonical_status: CANONICAL_STATUSES.CANDIDATE_CANONICAL,
    allowed_role: 'candidate canonical local PDF/OCR text extraction source; must not own parsing, calculation, or quote truth',
    blocked_growth: ['parser_ownership', 'calculator_ownership', 'quote_truth_creation', 'provider_runtime'],
    test_refs: ['tests/real-pdf-ocr-test.js', 'tests/real-gmm-quote-test.js', 'tests/gmm-out-of-pocket-test.js'],
    engine_refs: [],
    product_intelligence_binding_required: true,
    quote_preview_downstream_only: true,
    safe_errors: [SAFE_ERROR_CODES.EXECUTION_NOT_AUTHORIZED],
  }),
  surface({
    surface_id: 'pdf_preview_forge_quote_pdf_preview_engine',
    file_path: 'product-intelligence/evidence/forge-quote-pdf-preview-engine.js',
    surface_type: SURFACE_TYPES.PDF_PREVIEW_ORCHESTRATION,
    domain: 'quote_pdf_preview',
    product_family: ['Imagina Ser', 'Solucionline'],
    canonical_candidate: true,
    canonical_status: CANONICAL_STATUSES.CANDIDATE_CANONICAL,
    allowed_role: 'candidate preview/orchestrator only; must delegate parser and calculator ownership',
    blocked_growth: ['universal_parser', 'universal_calculator', 'quote_truth_creation', 'banxico_ownership'],
    test_refs: ['tests/product-intelligence/forge-quote-pdf-preview-engine-test.js'],
    engine_refs: ['product-intelligence/evidence/solucionline-retirement-parser.js', 'retirement-future-udi-projection-engine.js', 'imagina-ser-future-mxn-bridge.js'],
    product_intelligence_binding_required: true,
    quote_preview_downstream_only: true,
    safe_errors: [SAFE_ERROR_CODES.CANONICAL_DECISION_REQUIRED, SAFE_ERROR_CODES.EXECUTION_NOT_AUTHORIZED],
  }),
  surface({
    surface_id: 'parser_solucionline_retirement',
    file_path: 'product-intelligence/evidence/solucionline-retirement-parser.js',
    surface_type: SURFACE_TYPES.PARSER,
    domain: 'solucionline_retirement_parser',
    product_family: ['Imagina Ser', 'Solucionline'],
    canonical_candidate: true,
    canonical_status: CANONICAL_STATUSES.DECISION_REQUIRED,
    allowed_role: 'candidate canonical Solucionline parser; boundary must be reconciled against preview engine parsing',
    blocked_growth: ['parallel_parser_growth_before_decision', 'calculation_ownership', 'quote_truth_creation'],
    test_refs: ['tests/real-retirement-scenario-test.js', 'tests/real-retirement-mxn-scenario-test.js'],
    engine_refs: ['product-intelligence/evidence/forge-quote-pdf-preview-engine.js'],
    product_intelligence_binding_required: true,
    quote_preview_downstream_only: true,
    safe_errors: [SAFE_ERROR_CODES.CANONICAL_DECISION_REQUIRED],
  }),
  surface({
    surface_id: 'parser_gmm_quote',
    file_path: 'product-intelligence/evidence/gmm-quote-parser.js',
    surface_type: SURFACE_TYPES.PARSER,
    domain: 'gmm_quote_parser',
    product_family: ['GMM'],
    canonical_candidate: true,
    canonical_status: CANONICAL_STATUSES.CANDIDATE_CANONICAL,
    allowed_role: 'candidate canonical GMM quote parser',
    blocked_growth: ['summary_ownership', 'calculator_ownership', 'quote_truth_creation'],
    test_refs: ['tests/real-gmm-quote-test.js', 'tests/gmm-out-of-pocket-test.js'],
    engine_refs: ['gmm-quote-summary-engine.js'],
    product_intelligence_binding_required: true,
    quote_preview_downstream_only: true,
    safe_errors: [SAFE_ERROR_CODES.EXECUTION_NOT_AUTHORIZED],
  }),
  surface({
    surface_id: 'summary_gmm_quote',
    file_path: 'gmm-quote-summary-engine.js',
    surface_type: SURFACE_TYPES.SUMMARY_ENGINE,
    domain: 'gmm_quote_summary',
    product_family: ['GMM'],
    canonical_candidate: true,
    canonical_status: CANONICAL_STATUSES.CANDIDATE_CANONICAL,
    allowed_role: 'candidate GMM summary/read-model source; should consume parser outputs, not own parsing',
    blocked_growth: ['parser_ownership', 'pdf_extraction_ownership', 'quote_truth_creation'],
    test_refs: ['tests/real-gmm-quote-test.js', 'tests/gmm-out-of-pocket-test.js'],
    engine_refs: ['product-intelligence/evidence/gmm-quote-parser.js'],
    product_intelligence_binding_required: true,
    quote_preview_downstream_only: true,
    safe_errors: [SAFE_ERROR_CODES.EXECUTION_NOT_AUTHORIZED],
  }),
  surface({
    surface_id: 'calculator_retirement_future_udi_projection',
    file_path: 'retirement-future-udi-projection-engine.js',
    surface_type: SURFACE_TYPES.CALCULATOR,
    domain: 'udi_future_projection',
    product_family: ['Imagina Ser', 'Solucionline'],
    canonical_candidate: true,
    canonical_status: CANONICAL_STATUSES.CANDIDATE_CANONICAL,
    allowed_role: 'candidate canonical future UDI projection calculator',
    blocked_growth: ['pdf_extraction_ownership', 'parser_ownership', 'banxico_current_rate_ownership', 'quote_truth_creation'],
    test_refs: ['retirement-future-udi-projection-smoke-test.js'],
    engine_refs: [],
    product_intelligence_binding_required: true,
    quote_preview_downstream_only: true,
    safe_errors: [SAFE_ERROR_CODES.EXECUTION_NOT_AUTHORIZED],
  }),
  surface({
    surface_id: 'bridge_imagina_ser_future_mxn',
    file_path: 'imagina-ser-future-mxn-bridge.js',
    surface_type: SURFACE_TYPES.CALCULATOR,
    domain: 'imagina_ser_future_mxn_bridge',
    product_family: ['Imagina Ser'],
    canonical_candidate: true,
    canonical_status: CANONICAL_STATUSES.CANDIDATE_CANONICAL,
    allowed_role: 'candidate Imagina Ser future MXN bridge; must delegate UDI projection',
    blocked_growth: ['pdf_extraction_ownership', 'parser_ownership', 'quote_truth_creation'],
    test_refs: ['imagina-ser-master-test.js', 'tests/real-retirement-mxn-scenario-test.js'],
    engine_refs: ['retirement-future-udi-projection-engine.js'],
    product_intelligence_binding_required: true,
    quote_preview_downstream_only: true,
    safe_errors: [SAFE_ERROR_CODES.EXECUTION_NOT_AUTHORIZED],
  }),
  surface({
    surface_id: 'rates_exchange_rate_cache',
    file_path: 'exchange-rate-cache-engine.js',
    surface_type: SURFACE_TYPES.RATE_CACHE,
    domain: 'exchange_rate_cache',
    product_family: ['Imagina Ser', 'Solucionline', 'GMM'],
    canonical_candidate: true,
    canonical_status: CANONICAL_STATUSES.CANDIDATE_CANONICAL,
    allowed_role: 'candidate current-rate cache over Banxico providers',
    blocked_growth: ['direct_provider_runtime_in_preview', 'quote_truth_creation'],
    test_refs: ['imagina-ser-banxico-integration-test.js', 'imagina-ser-master-test.js'],
    engine_refs: ['shared-banxico-rate-engine.js', 'shared-banxico-edge-provider.js'],
    product_intelligence_binding_required: true,
    quote_preview_downstream_only: true,
    safe_errors: [SAFE_ERROR_CODES.EXECUTION_NOT_AUTHORIZED],
  }),
  surface({
    surface_id: 'rates_shared_banxico_direct',
    file_path: 'shared-banxico-rate-engine.js',
    surface_type: SURFACE_TYPES.RATE_PROVIDER,
    domain: 'banxico_direct_rates',
    product_family: ['Imagina Ser', 'Solucionline', 'GMM'],
    canonical_candidate: true,
    canonical_status: CANONICAL_STATUSES.CANDIDATE_CANONICAL,
    allowed_role: 'direct Banxico provider candidate; not authorized for preview runtime execution without later gate',
    blocked_growth: ['direct_preview_call', 'provider_runtime_without_gate', 'secret_access_in_preview'],
    test_refs: ['imagina-ser-banxico-integration-test.js'],
    engine_refs: ['exchange-rate-cache-engine.js'],
    product_intelligence_binding_required: true,
    quote_preview_downstream_only: true,
    safe_errors: [SAFE_ERROR_CODES.EXECUTION_NOT_AUTHORIZED],
  }),
  surface({
    surface_id: 'rates_shared_banxico_edge_provider',
    file_path: 'shared-banxico-edge-provider.js',
    surface_type: SURFACE_TYPES.RATE_PROVIDER,
    domain: 'banxico_edge_provider',
    product_family: ['Imagina Ser', 'Solucionline', 'GMM'],
    canonical_candidate: true,
    canonical_status: CANONICAL_STATUSES.CANDIDATE_CANONICAL,
    allowed_role: 'edge Banxico provider candidate; not authorized for preview runtime execution without later gate',
    blocked_growth: ['direct_preview_call', 'provider_runtime_without_gate', 'secret_access_in_preview'],
    test_refs: ['imagina-ser-banxico-integration-test.js'],
    engine_refs: ['exchange-rate-cache-engine.js'],
    product_intelligence_binding_required: true,
    quote_preview_downstream_only: true,
    safe_errors: [SAFE_ERROR_CODES.EXECUTION_NOT_AUTHORIZED],
  }),
  surface({
    surface_id: 'pi_read_model_adapter_073d',
    file_path: 'platform/adapters/product-intelligence/product-intelligence-read-model-adapter-073d.js',
    surface_type: SURFACE_TYPES.PRODUCT_INTELLIGENCE_ADAPTER,
    domain: 'product_intelligence_semantics',
    product_family: ['GMM', 'Vida Mujer', 'AVE', 'Imagina Ser', 'ORVI', 'SeguBeca'],
    canonical_candidate: true,
    canonical_status: CANONICAL_STATUSES.CURRENT_CANONICAL,
    allowed_role: 'current upstream semantic authority until ontology promotion',
    blocked_growth: ['parser_execution', 'calculator_execution', 'quote_truth_creation'],
    test_refs: ['tests/product-intelligence/product-intelligence-read-model-adapter-073d-test.js'],
    engine_refs: [],
    product_intelligence_binding_required: true,
    quote_preview_downstream_only: false,
    safe_errors: [SAFE_ERROR_CODES.EXECUTION_NOT_AUTHORIZED],
  }),
  surface({
    surface_id: 'quote_preview_pi_binding_adapter_074b',
    file_path: 'platform/adapters/quote-preview/quote-preview-product-intelligence-binding-adapter-074b.js',
    surface_type: SURFACE_TYPES.QUOTE_PREVIEW_BINDING_ADAPTER,
    domain: 'quote_preview_product_intelligence_binding',
    product_family: ['GMM', 'Vida Mujer', 'AVE', 'Imagina Ser', 'ORVI', 'SeguBeca'],
    canonical_candidate: true,
    canonical_status: CANONICAL_STATUSES.CURRENT_CANONICAL,
    allowed_role: 'current Quote Preview to Product Intelligence binding',
    blocked_growth: ['parser_execution', 'calculator_execution', 'pdf_extraction_ownership', 'quote_truth_creation'],
    test_refs: ['tests/quote-preview-product-intelligence-binding-adapter-074b-test.js'],
    engine_refs: ['platform/adapters/product-intelligence/product-intelligence-read-model-adapter-073d.js'],
    product_intelligence_binding_required: true,
    quote_preview_downstream_only: true,
    safe_errors: [SAFE_ERROR_CODES.EXECUTION_NOT_AUTHORIZED],
  }),
  surface({
    surface_id: 'quote_preview_pdf_pi_integration_adapter_075b',
    file_path: 'platform/adapters/quote-preview/quote-preview-pdf-product-intelligence-integration-adapter-075b.js',
    surface_type: SURFACE_TYPES.PDF_TO_PI_INTEGRATION_ADAPTER,
    domain: 'quote_preview_pdf_to_product_intelligence_integration',
    product_family: ['GMM', 'Vida Mujer', 'AVE', 'Imagina Ser', 'ORVI', 'SeguBeca'],
    canonical_candidate: true,
    canonical_status: CANONICAL_STATUSES.CURRENT_CANONICAL,
    allowed_role: 'current reference integration between PDF preview and Product Intelligence',
    blocked_growth: ['pdf_read', 'parser_execution', 'calculator_execution', 'quote_truth_creation'],
    test_refs: ['tests/quote-preview-pdf-product-intelligence-integration-adapter-075b-test.js'],
    engine_refs: ['platform/adapters/quote-preview/quote-preview-product-intelligence-binding-adapter-074b.js'],
    product_intelligence_binding_required: true,
    quote_preview_downstream_only: true,
    safe_errors: [SAFE_ERROR_CODES.EXECUTION_NOT_AUTHORIZED],
  }),
  surface({
    surface_id: 'quote_preview_pdf_engine_repo_promotion_adapter_076b',
    file_path: 'platform/adapters/quote-preview/quote-preview-pdf-engine-repo-promotion-adapter-076b.js',
    surface_type: SURFACE_TYPES.REPO_PROMOTION_GUARDRAIL,
    domain: 'quote_preview_pdf_engine_repo_promotion',
    product_family: ['GMM', 'Vida Mujer', 'AVE', 'Imagina Ser', 'ORVI', 'SeguBeca'],
    canonical_candidate: true,
    canonical_status: CANONICAL_STATUSES.GOVERNANCE_ADAPTER,
    allowed_role: 'repo promotion guardrail only; must not become extractor/parser/calculator',
    blocked_growth: ['pdf_read', 'ocr_execution', 'parser_execution', 'calculator_execution', 'banxico_call', 'provider_runtime', 'quote_truth_creation'],
    test_refs: ['tests/quote-preview-pdf-engine-repo-promotion-adapter-076b-test.js'],
    engine_refs: ['platform/adapters/product-intelligence/product-intelligence-read-model-adapter-073d.js', 'platform/adapters/quote-preview/quote-preview-product-intelligence-binding-adapter-074b.js', 'platform/adapters/quote-preview/quote-preview-pdf-product-intelligence-integration-adapter-075b.js', 'product-intelligence/evidence/forge-quote-pdf-preview-engine.js'],
    product_intelligence_binding_required: true,
    quote_preview_downstream_only: true,
    safe_errors: [SAFE_ERROR_CODES.NEW_EXTRACTOR_BLOCKED, SAFE_ERROR_CODES.EXECUTION_NOT_AUTHORIZED],
  }),
  surface({
    surface_id: 'test_real_pdf_ocr',
    file_path: 'tests/real-pdf-ocr-test.js',
    surface_type: SURFACE_TYPES.REAL_TEST,
    domain: 'real_pdf_ocr_test',
    product_family: ['Imagina Ser', 'Solucionline'],
    canonical_candidate: true,
    canonical_status: CANONICAL_STATUSES.DECISION_REQUIRED,
    allowed_role: 'candidate canonical real PDF/OCR evidence test',
    blocked_growth: ['runtime_effects', 'network_calls', 'invented_expected_values'],
    test_refs: [],
    engine_refs: ['policy-operations/evidence/policy-ocr-engine.js'],
    product_intelligence_binding_required: true,
    quote_preview_downstream_only: true,
    safe_errors: [SAFE_ERROR_CODES.CANONICAL_DECISION_REQUIRED],
  }),
  surface({
    surface_id: 'test_real_gmm_quote',
    file_path: 'tests/real-gmm-quote-test.js',
    surface_type: SURFACE_TYPES.REAL_TEST,
    domain: 'real_gmm_quote_test',
    product_family: ['GMM'],
    canonical_candidate: true,
    canonical_status: CANONICAL_STATUSES.DECISION_REQUIRED,
    allowed_role: 'candidate canonical GMM quote evidence test',
    blocked_growth: ['invented_expected_values', 'quote_truth_creation'],
    test_refs: [],
    engine_refs: ['policy-operations/evidence/policy-ocr-engine.js', 'product-intelligence/evidence/gmm-quote-parser.js'],
    product_intelligence_binding_required: true,
    quote_preview_downstream_only: true,
    safe_errors: [SAFE_ERROR_CODES.CANONICAL_DECISION_REQUIRED],
  }),
  surface({
    surface_id: 'test_quote_pdf_preview_fixture',
    file_path: 'tests/product-intelligence/forge-quote-pdf-preview-engine-test.js',
    surface_type: SURFACE_TYPES.FIXTURE_TEST,
    domain: 'quote_pdf_preview_fixture_test',
    product_family: ['Imagina Ser', 'Solucionline'],
    canonical_candidate: true,
    canonical_status: CANONICAL_STATUSES.DECISION_REQUIRED,
    allowed_role: 'candidate canonical preview fixture test, not real extraction proof',
    blocked_growth: ['pretending_fixture_is_real_pdf_evidence', 'invented_expected_values'],
    test_refs: [],
    engine_refs: ['product-intelligence/evidence/forge-quote-pdf-preview-engine.js'],
    product_intelligence_binding_required: true,
    quote_preview_downstream_only: true,
    safe_errors: [SAFE_ERROR_CODES.CANONICAL_DECISION_REQUIRED],
  }),
]);

function getQuotePreviewPdfExistingSurfacesCanonicalMappingCatalog() {
  return {
    adapter_id: ADAPTER_ID,
    schemaVersion: SCHEMA_VERSION,
    domainId: DOMAIN_ID,
    mode: MODE,
    routeClass: ROUTE_CLASS,
    mapping_type: 'local_static_read_only_existing_surfaces_canonical_mapping',
    no_new_extractor_before_reconciliation: true,
    no_new_parser_before_reconciliation: true,
    no_new_calculator_before_reconciliation: true,
    product_intelligence_upstream: true,
    quote_preview_downstream: true,
    safe_errors: Object.values(SAFE_ERROR_CODES),
    required_mapping_fields: [...REQUIRED_MAPPING_FIELDS],
    blocked_effects: [...BLOCKED_EFFECTS],
    safety_flags: clone(DEFAULT_SAFETY_FLAGS),
    surfaces: clone(ALL_SURFACES),
  };
}

function getExistingSurfaceCanonicalMappingById(surfaceId) {
  const match = ALL_SURFACES.find((surface) => surface.surface_id === surfaceId);
  return match ? clone(match) : buildExistingSurfaceCanonicalMappingSafeError(surfaceId);
}

function getExistingSurfaceCanonicalMappingsByProductFamily(productFamily) {
  const normalized = String(productFamily || '').trim().toLowerCase();
  return clone(ALL_SURFACES.filter((surface) =>
    surface.product_family.some((family) => String(family).trim().toLowerCase() === normalized)
  ));
}

function getCanonicalDecisionRequiredSurfaces() {
  return clone(ALL_SURFACES.filter((surface) => surface.canonical_status === CANONICAL_STATUSES.DECISION_REQUIRED));
}

function getBlockedGrowthSurfaces() {
  return clone(ALL_SURFACES.filter((surface) => surface.blocked_growth.length > 0));
}

function buildExistingSurfaceCanonicalMappingSafeError(surfaceId, code = SAFE_ERROR_CODES.SURFACE_NOT_MAPPED) {
  return {
    schemaVersion: SCHEMA_VERSION,
    domainId: DOMAIN_ID,
    mode: MODE,
    routeClass: ROUTE_CLASS,
    readModelStatus: 'error',
    surface_id: surfaceId || null,
    file_path: null,
    surface_type: null,
    domain: null,
    product_family: [],
    canonical_candidate: false,
    canonical_status: CANONICAL_STATUSES.NOT_PRESENT,
    allowed_role: null,
    blocked_growth: ['new_surface_creation_before_reconciliation'],
    test_refs: [],
    engine_refs: [],
    product_intelligence_binding_required: true,
    quote_preview_downstream_only: true,
    safe_errors: [code, SAFE_ERROR_CODES.NEW_EXTRACTOR_BLOCKED, SAFE_ERROR_CODES.EXECUTION_NOT_AUTHORIZED],
    safety_flags: clone(DEFAULT_SAFETY_FLAGS),
    safe_error: {
      code,
      message: 'Existing quote/PDF surface is not mapped. New extractor/parser/calculator creation is blocked before reconciliation.',
    },
  };
}

function validateExistingSurfaceCanonicalMappingShape(surface) {
  const errors = [];
  if (!surface || typeof surface !== 'object') return { ok: false, valid: false, errors: ['surface_object_required'] };
  for (const field of REQUIRED_MAPPING_FIELDS) if (!(field in surface)) errors.push(`missing_${field}`);
  for (const [key, value] of Object.entries(surface.safety_flags || {})) {
    if (value !== false) errors.push(`safety_flag_not_false_${key}`);
  }
  const serialized = JSON.stringify(surface);
  for (const fragment of ['"pdfRead":'+'true','"ocrExecution":'+'true','"parserExecution":'+'true','"calculatorExecution":'+'true','"banxicoCall":'+'true','"realEngineExecution":'+'true','"providerRuntime":'+'true','"quoteWrite":'+'true','"backendConnection":'+'true']) {
    if (serialized.includes(fragment)) errors.push(`forbidden_true_fragment_${fragment}`);
  }
  return { ok: errors.length === 0, valid: errors.length === 0, errors };
}

function validateExistingSurfacesCanonicalMappingCatalog(catalog) {
  const errors = [];
  if (!catalog || typeof catalog !== 'object') return { ok: false, valid: false, errors: ['catalog_object_required'] };
  if (catalog.schemaVersion !== SCHEMA_VERSION) errors.push('invalid_schemaVersion');
  if (catalog.domainId !== DOMAIN_ID) errors.push('invalid_domainId');
  if (catalog.mode !== MODE) errors.push('invalid_mode');
  if (catalog.routeClass !== ROUTE_CLASS) errors.push('invalid_routeClass');
  if (catalog.no_new_extractor_before_reconciliation !== true) errors.push('new_extractor_not_blocked');
  if (catalog.no_new_parser_before_reconciliation !== true) errors.push('new_parser_not_blocked');
  if (catalog.no_new_calculator_before_reconciliation !== true) errors.push('new_calculator_not_blocked');
  for (const surface of Array.isArray(catalog.surfaces) ? catalog.surfaces : []) {
    const result = validateExistingSurfaceCanonicalMappingShape(surface);
    if (!result.ok) errors.push(...result.errors.map((error) => `${surface.surface_id || 'unknown'}:${error}`));
  }
  return { ok: errors.length === 0, valid: errors.length === 0, errors };
}

module.exports = {
  ADAPTER_ID, SCHEMA_VERSION, DOMAIN_ID, MODE, ROUTE_CLASS,
  CANONICAL_STATUSES, SURFACE_TYPES, SAFE_ERROR_CODES, DEFAULT_SAFETY_FLAGS,
  REQUIRED_MAPPING_FIELDS, BLOCKED_EFFECTS, ALL_SURFACES,
  getQuotePreviewPdfExistingSurfacesCanonicalMappingCatalog,
  getExistingSurfaceCanonicalMappingById,
  getExistingSurfaceCanonicalMappingsByProductFamily,
  getCanonicalDecisionRequiredSurfaces,
  getBlockedGrowthSurfaces,
  buildExistingSurfaceCanonicalMappingSafeError,
  validateExistingSurfaceCanonicalMappingShape,
  validateExistingSurfacesCanonicalMappingCatalog,
};
NODE
pass "$ADAPTER written"

stage "STAGE 7 WRITE TEST"
mkdir -p "$(dirname "$TEST")"
cat > "$TEST" <<'NODE'
'use strict';

const assert = require('node:assert/strict');
const adapter = require('../platform/adapters/quote-preview/quote-preview-pdf-engine-existing-surfaces-canonical-mapping-adapter-077b.js');

assert.equal(adapter.ADAPTER_ID, 'forge.quote_preview.pdf_engine.existing_surfaces.canonical_mapping.adapter.v1');
assert.equal(adapter.SCHEMA_VERSION, 'forge.quote_preview.pdf_engine.existing_surfaces.canonical_mapping.v1');
assert.equal(adapter.MODE, 'read_only');
assert.equal(adapter.ROUTE_CLASS, 'preview_safe');

const catalog = adapter.getQuotePreviewPdfExistingSurfacesCanonicalMappingCatalog();
assert.equal(catalog.no_new_extractor_before_reconciliation, true);
assert.equal(catalog.no_new_parser_before_reconciliation, true);
assert.equal(catalog.no_new_calculator_before_reconciliation, true);
assert.equal(catalog.product_intelligence_upstream, true);
assert.equal(catalog.quote_preview_downstream, true);
assert.equal(adapter.validateExistingSurfacesCanonicalMappingCatalog(catalog).ok, true);

for (const surface of catalog.surfaces) {
  for (const field of adapter.REQUIRED_MAPPING_FIELDS) assert(field in surface, `${surface.surface_id} missing ${field}`);
  assert.equal(adapter.validateExistingSurfaceCanonicalMappingShape(surface).ok, true);
}

const byId = (id) => adapter.getExistingSurfaceCanonicalMappingById(id);

assert.equal(byId('pdf_extraction_policy_ocr_engine').file_path, 'policy-operations/evidence/policy-ocr-engine.js');
assert(byId('pdf_extraction_policy_ocr_engine').blocked_growth.includes('parser_ownership'));

assert.equal(byId('pdf_preview_forge_quote_pdf_preview_engine').file_path, 'product-intelligence/evidence/forge-quote-pdf-preview-engine.js');
assert(byId('pdf_preview_forge_quote_pdf_preview_engine').blocked_growth.includes('universal_parser'));
assert(byId('pdf_preview_forge_quote_pdf_preview_engine').blocked_growth.includes('universal_calculator'));

assert.equal(byId('parser_solucionline_retirement').canonical_status, adapter.CANONICAL_STATUSES.DECISION_REQUIRED);
assert(byId('parser_solucionline_retirement').safe_errors.includes(adapter.SAFE_ERROR_CODES.CANONICAL_DECISION_REQUIRED));

assert.equal(byId('parser_gmm_quote').file_path, 'product-intelligence/evidence/gmm-quote-parser.js');
assert.equal(byId('summary_gmm_quote').file_path, 'gmm-quote-summary-engine.js');
assert(byId('summary_gmm_quote').blocked_growth.includes('parser_ownership'));

assert.equal(byId('calculator_retirement_future_udi_projection').file_path, 'retirement-future-udi-projection-engine.js');
assert.equal(byId('bridge_imagina_ser_future_mxn').file_path, 'imagina-ser-future-mxn-bridge.js');
assert(byId('bridge_imagina_ser_future_mxn').engine_refs.includes('retirement-future-udi-projection-engine.js'));

assert.equal(byId('rates_exchange_rate_cache').file_path, 'exchange-rate-cache-engine.js');
assert(byId('rates_exchange_rate_cache').engine_refs.includes('shared-banxico-rate-engine.js'));

assert.equal(byId('quote_preview_pdf_engine_repo_promotion_adapter_076b').canonical_status, adapter.CANONICAL_STATUSES.GOVERNANCE_ADAPTER);
assert(byId('quote_preview_pdf_engine_repo_promotion_adapter_076b').blocked_growth.includes('pdf_read'));
assert(byId('quote_preview_pdf_engine_repo_promotion_adapter_076b').blocked_growth.includes('parser_execution'));

const missing = byId('missing_surface');
assert.equal(missing.readModelStatus, 'error');
assert(missing.safe_errors.includes(adapter.SAFE_ERROR_CODES.NEW_EXTRACTOR_BLOCKED));

const decisionRequired = adapter.getCanonicalDecisionRequiredSurfaces().map((s) => s.surface_id);
assert(decisionRequired.includes('parser_solucionline_retirement'));
assert(decisionRequired.includes('test_real_pdf_ocr'));
assert(decisionRequired.includes('test_quote_pdf_preview_fixture'));

const gmm = adapter.getExistingSurfaceCanonicalMappingsByProductFamily('GMM').map((s) => s.surface_id);
assert(gmm.includes('parser_gmm_quote'));
assert(gmm.includes('summary_gmm_quote'));

for (const [key, value] of Object.entries(adapter.DEFAULT_SAFETY_FLAGS)) assert.equal(value, false, `${key} must be false`);

const combined = JSON.stringify({ catalog, missing, flags: adapter.DEFAULT_SAFETY_FLAGS });
for (const fragment of ['"pdfRead":'+'true','"ocrExecution":'+'true','"parserExecution":'+'true','"calculatorExecution":'+'true','"banxicoCall":'+'true','"realEngineExecution":'+'true','"providerRuntime":'+'true','"quoteWrite":'+'true','"backendConnection":'+'true']) {
  assert(!combined.includes(fragment), `forbidden true flag found: ${fragment}`);
}

assert(combined.includes('policy-operations/evidence/policy-ocr-engine.js'));
assert(combined.includes('product-intelligence/evidence/forge-quote-pdf-preview-engine.js'));
assert(combined.includes('product-intelligence/evidence/solucionline-retirement-parser.js'));
assert(combined.includes('product-intelligence/evidence/gmm-quote-parser.js'));

console.log('PASS quote preview pdf engine existing surfaces canonical mapping adapter 077B');
NODE
pass "$TEST written"

stage "STAGE 8 WRITE DOCS"
cat > "$ARCH_DOC" <<EOF
# Forge Quote Preview PDF Engine Existing Surfaces Canonical Mapping Implementation 077B

PHASE=$PHASE

STATUS=PASS

DECISION=$DECISION

LOCKED_DECISION=$LOCKED_DECISION

NEXT=$NEXT

## Purpose

077B implements a local/static/read-only canonical mapping adapter for existing quote/PDF tests and engines.

This phase does not create a new extractor, parser, calculator, Banxico/rate provider, quote engine, or execution bridge. It classifies existing surfaces and records canonical candidates, decision-required surfaces, allowed roles, blocked growth, test refs, engine refs, safe errors, and safety flags.

## Implemented Files

- \`$ADAPTER\`
- \`$TEST\`

## Key Mappings

- PDF extraction: \`policy-operations/evidence/policy-ocr-engine.js\`
- PDF preview/orchestration: \`product-intelligence/evidence/forge-quote-pdf-preview-engine.js\`
- Solucionline parser: \`product-intelligence/evidence/solucionline-retirement-parser.js\` with \`canonical_decision_required\`
- GMM parser: \`product-intelligence/evidence/gmm-quote-parser.js\`
- GMM summary: \`gmm-quote-summary-engine.js\`
- UDI future projection: \`retirement-future-udi-projection-engine.js\`
- Imagina Ser future MXN bridge: \`imagina-ser-future-mxn-bridge.js\`
- Rates/cache/providers: \`exchange-rate-cache-engine.js\`, \`shared-banxico-rate-engine.js\`, \`shared-banxico-edge-provider.js\`
- Governance adapters: 073D, 074B, 075B, 076B

## Blocked Growth

- 076B promotion adapter must not become extractor/parser/calculator.
- PDF preview engine must not become universal parser/calculator.
- Solucionline parser remains decision-required until parser boundary is locked.
- GMM parser and summary must remain separate responsibilities.

## Not Authorized

No PDF read, OCR execution, parser execution, calculator execution, Banxico call, provider call, quote generation, quote write, backend connection, real engine execution, or invented truth is authorized.

DECISION=$DECISION

LOCKED_DECISION=$LOCKED_DECISION

NEXT=$NEXT
EOF

cat > "$EVIDENCE_DOC" <<EOF
# Forge Quote Preview PDF Engine Existing Surfaces Canonical Mapping Implementation 077B

PHASE=$PHASE

STATUS=PASS

DECISION=$DECISION

LOCKED_DECISION=$LOCKED_DECISION

NEXT=$NEXT

## Evidence Summary

077B implements only a local/static/read-only canonical mapping adapter. It maps existing surfaces and blocks duplicate growth.

## Discovery Evidence

Discovery JSON: \`$DISCOVERY_JSON_FOUND\`

Discovery digest:

\`\`\`json
$(cat "$DISCOVERY_DIGEST_JSON")
\`\`\`

## Validated

- adapter identity/schema;
- catalog shape;
- required mapping fields;
- no-new-extractor/parser/calculator flags;
- candidate canonical PDF extraction;
- candidate PDF preview/orchestration;
- Solucionline canonical decision required;
- GMM parser vs summary separation;
- UDI projection / Imagina Ser bridge mapping;
- rates/cache/provider mapping;
- 076B blocked growth;
- missing surface safe error;
- all safety flags false.

DECISION=$DECISION

LOCKED_DECISION=$LOCKED_DECISION

NEXT=$NEXT
EOF

cat > "$CERT_DOC" <<EOF
# Forge Quote Preview PDF Engine Existing Surfaces Canonical Mapping Implementation Certificate 077B

PHASE=$PHASE

CERTIFICATE_STATUS=PASS

DECISION=$DECISION

LOCKED_DECISION=$LOCKED_DECISION

NEXT=$NEXT

077B certifies that Forge now has a local/static/read-only canonical mapping adapter for existing quote/PDF tests and engines.

No new extractor, parser, calculator, Banxico provider, quote engine, backend connection, or real effect is authorized.

$DECISION
EOF

cat > "$AUDIT_JSON" <<EOF
{
  "phase": "$PHASE",
  "status": "PASS",
  "decision": "$DECISION",
  "lockedDecision": "$LOCKED_DECISION",
  "base": {
    "phase": "077A_QUOTE_PREVIEW_PDF_ENGINE_EXISTING_TESTS_AND_ENGINES_RECONCILIATION_SCOPE",
    "confirmed": true,
    "lockedDecision": "QUOTE_PREVIEW_PDF_ENGINE_EXISTING_TESTS_AND_ENGINES_RECONCILIATION_SCOPED"
  },
  "next": "$NEXT",
  "implementation": {
    "adapter": "$ADAPTER",
    "test": "$TEST",
    "adapterId": "forge.quote_preview.pdf_engine.existing_surfaces.canonical_mapping.adapter.v1",
    "schemaVersion": "forge.quote_preview.pdf_engine.existing_surfaces.canonical_mapping.v1",
    "mode": "read_only",
    "routeClass": "preview_safe",
    "newPdfExtractorCreated": false,
    "newParserCreated": false,
    "newCalculatorCreated": false,
    "executionIntroduced": false
  },
  "discoveryEvidence": $(cat "$DISCOVERY_DIGEST_JSON"),
  "canonicalDecisionRequired": [
    "parser_solucionline_retirement",
    "test_real_pdf_ocr",
    "test_real_gmm_quote",
    "test_quote_pdf_preview_fixture"
  ],
  "notAuthorized": {
    "pdfRead": false,
    "ocrExecution": false,
    "parserExecution": false,
    "calculatorExecution": false,
    "banxicoCall": false,
    "providerCall": false,
    "quoteWrite": false,
    "backendConnection": false,
    "realEngineExecution": false,
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
    "banxicoCall": false
  },
  "validations": {
    "base077A": "PASS",
    "discoveryJson": "PASS",
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

stage "STAGE 9 UPDATE BUILD TREE / ROADMAP"
TREE_BLOCK=$(cat <<EOF

<!-- FORGE:$PHASE:START -->
## 077B Quote Preview PDF Engine Existing Surfaces Canonical Mapping Implementation

077B implements a local/static/read-only canonical mapping adapter for existing quote/PDF tests and engines.

Locked decision:
\`$LOCKED_DECISION\`

Implemented:

- \`$ADAPTER\`
- \`$TEST\`

Mapped existing boundaries:

- PDF extraction: \`policy-operations/evidence/policy-ocr-engine.js\`;
- PDF preview/orchestration: \`product-intelligence/evidence/forge-quote-pdf-preview-engine.js\`;
- Solucionline parser: \`product-intelligence/evidence/solucionline-retirement-parser.js\` with \`canonical_decision_required\`;
- GMM parser: \`product-intelligence/evidence/gmm-quote-parser.js\`;
- GMM summary: \`gmm-quote-summary-engine.js\`;
- UDI future projection: \`retirement-future-udi-projection-engine.js\`;
- Imagina Ser future MXN bridge: \`imagina-ser-future-mxn-bridge.js\`;
- Rates/cache/providers: \`exchange-rate-cache-engine.js\`, \`shared-banxico-rate-engine.js\`, \`shared-banxico-edge-provider.js\`;
- governance adapters 073D, 074B, 075B, 076B.

No new extractor, parser, calculator, Banxico provider, quote engine, backend connection, or real effect is authorized.

DECISION=$DECISION

LOCKED_DECISION=$LOCKED_DECISION

NEXT=$NEXT
<!-- FORGE:$PHASE:END -->
EOF
)

python3 - <<PY
from pathlib import Path
phase="$PHASE"
block="""$TREE_BLOCK"""
def replace_or_append(text):
    start=f"<!-- FORGE:{phase}:START -->"; end=f"<!-- FORGE:{phase}:END -->"
    if start in text and end in text:
        return text.split(start)[0].rstrip()+"\n\n"+block.strip()+"\n"+text.split(end,1)[1]
    return text.rstrip()+"\n\n"+block.strip()+"\n"
for p in [Path("FORGE_MASTER_BUILD_TREE.md"), Path("docs/architecture/source-truth/FORGE_UNIFIED_BUILD_TREE_001.md"), Path("docs/roadmap/FORGE_ROADMAP_LOCK_001.md")]:
    p.write_text(replace_or_append(p.read_text()).rstrip()+"\n")
PY
pass "trees updated"

stage "STAGE 10 SAVE SCRIPT"
mkdir -p "$(dirname "$SCRIPT_IN_REPO")"
cp "$0" "$SCRIPT_IN_REPO"
chmod +x "$SCRIPT_IN_REPO"

stage "STAGE 11 VALIDATION"
run bash -n "$SCRIPT_IN_REPO"
run node --check "$ADAPTER"
run node --check "$TEST"
run node "$TEST"
run python3 -m json.tool "$AUDIT_JSON"
run rg -n "$PHASE|$DECISION|$LOCKED_DECISION|$NEXT|canonical_mapping|NEW_EXTRACTOR_BLOCKED|policy-ocr-engine.js|solucionline-retirement-parser.js|gmm-quote-parser.js|retirement-future-udi-projection-engine.js" \
  FORGE_MASTER_BUILD_TREE.md docs/architecture/source-truth/FORGE_UNIFIED_BUILD_TREE_001.md docs/roadmap/FORGE_ROADMAP_LOCK_001.md \
  "$ARCH_DOC" "$EVIDENCE_DOC" "$CERT_DOC" "$AUDIT_JSON" "$ADAPTER" "$TEST"
run git diff --check

stage "STAGE 12 SAFETY SCAN"
SCOPED_FILES=(FORGE_MASTER_BUILD_TREE.md docs/architecture/source-truth/FORGE_UNIFIED_BUILD_TREE_001.md docs/roadmap/FORGE_ROADMAP_LOCK_001.md "$ARCH_DOC" "$EVIDENCE_DOC" "$CERT_DOC" "$AUDIT_JSON" "$ADAPTER" "$TEST")
if rg -n 'localStorage|sessionStorage|fetch\(|XMLHttpRequest|navigator\.mediaDevices|SpeechRecognition|providerRuntimeEnabled:\s*true|networkCallsAllowed:\s*true|browserStorageEnabled:\s*true|mayCreateTruth:\s*true|maySendMessage:\s*true|mayWriteCrm:\s*true|mayCreateCalendarEvent:\s*true' "${SCOPED_FILES[@]}"; then fail "runtime/browser/network marker found"; fi
if rg -n '"?(crmWrite|pipelineWrite|policyWrite|quoteWrite|taskCreate|calendarCreate|messageSend|authReal|providerRuntime|secretAccess|browserPersistence|realEngineExecution|realEffectsAllowed|realEffectsEnabled|backendConnection|pdfRead|ocrExecution|parserExecution|calculatorExecution|banxicoCall)"?\s*[:=]\s*true\b' "${SCOPED_FILES[@]}"; then fail "real-effect flag true found"; fi
pass "safety scan clean"

stage "STAGE 13 STAGE AUTHORIZED FILES"
AUTHORIZED_FILES=(FORGE_MASTER_BUILD_TREE.md docs/architecture/source-truth/FORGE_UNIFIED_BUILD_TREE_001.md docs/roadmap/FORGE_ROADMAP_LOCK_001.md "$ADAPTER" "$TEST" "$ARCH_DOC" "$EVIDENCE_DOC" "$CERT_DOC" "$AUDIT_JSON" "$SCRIPT_IN_REPO")
git add "${AUTHORIZED_FILES[@]}"
run git diff --cached --name-only
run git diff --cached --check
EXPECTED="$(mktemp)"; ACTUAL="$(mktemp)"
printf "%s\n" "${AUTHORIZED_FILES[@]}" | sort > "$EXPECTED"
git diff --cached --name-only | sort > "$ACTUAL"
diff -u "$EXPECTED" "$ACTUAL" || fail "staged files differ from authorized boundary"
pass "only authorized files staged"

stage "STAGE 14 COMMIT PUSH"
run git commit -m "feat: implement quote preview pdf existing surfaces canonical mapping"
run git push origin HEAD:main

stage "STAGE 15 FINAL CHECKPOINT"
run git status --short --branch
run git log --oneline -10

SUMMARY=$(cat <<EOF
PASS_077B_QUOTE_PREVIEW_PDF_ENGINE_EXISTING_SURFACES_CANONICAL_MAPPING_IMPLEMENTATION_COMMIT_PUSH_COMPLETE
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
if command -v termux-clipboard-set >/dev/null 2>&1; then printf "%s\n" "$SUMMARY" | termux-clipboard-set; pass "summary copied to clipboard"; else warn "termux-clipboard-set not available"; fi
echo "Reporte: $REPORT"
