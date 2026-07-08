#!/usr/bin/env bash
set -euo pipefail

PHASE="076B_QUOTE_PREVIEW_PDF_ENGINE_REPO_PROMOTION_IMPLEMENTATION"
DECISION="PASS_076B_QUOTE_PREVIEW_PDF_ENGINE_REPO_PROMOTION_IMPLEMENTATION"
LOCKED_DECISION="QUOTE_PREVIEW_PDF_ENGINE_REPO_PROMOTION_LOCAL_STATIC_READ_ONLY_IMPLEMENTED"
NEXT="076C_QUOTE_PREVIEW_PDF_ENGINE_REPO_PROMOTION_QA_LOCK"
MODE="local/static/read-only implementation"
BOUNDARY="no UI mutation; no backend real; no CRM/policy/quote/pipeline writes; no task/calendar/message; no provider execution with effects; no auth/secrets/browser persistence; no real engine execution; no parser/calculator/Banxico/PDF execution; no invented product/premium/coverage/projection/quote truth"
REPO="${REPO:-/storage/emulated/0/Forge OS}"
STAMP="$(date +%Y%m%d_%H%M%S)"
REPORT="/data/data/com.termux/files/home/${PHASE}_RESULT_${STAMP}.md"
BACKUP_DIR=".forge-backups/076b-quote-preview-pdf-engine-repo-promotion-implementation-${STAMP}"
SCRIPT_IN_REPO="tools/termux/forge_076b_quote_preview_pdf_engine_repo_promotion_implementation.sh"

ADAPTER="platform/adapters/quote-preview/quote-preview-pdf-engine-repo-promotion-adapter-076b.js"
TEST="tests/quote-preview-pdf-engine-repo-promotion-adapter-076b-test.js"
ARCH_DOC="docs/architecture/source-truth/FORGE_QUOTE_PREVIEW_PDF_ENGINE_REPO_PROMOTION_IMPLEMENTATION_076B.md"
EVIDENCE_DOC="docs/evidence/FORGE_QUOTE_PREVIEW_PDF_ENGINE_REPO_PROMOTION_IMPLEMENTATION_076B.md"
CERT_DOC="docs/evidence/FORGE_QUOTE_PREVIEW_PDF_ENGINE_REPO_PROMOTION_IMPLEMENTATION_CERTIFICATE_076B.md"
AUDIT_JSON="docs/evidence/forge-quote-preview-pdf-engine-repo-promotion-implementation-audit-076b.json"

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

mkdir -p "$(dirname "$REPORT")"
touch "$REPORT"
exec > >(tee -a "$REPORT") 2>&1

stage "STAGE 0 HEADER"
echo "PHASE=$PHASE"
echo "MODE=$MODE"
echo "BOUNDARY=$BOUNDARY"
echo "REPORT=$REPORT"
echo "ROBOCOP_GATE=Article 0; 076A scope closed; local/static implementation only"

cd "$REPO" || fail "No existe repo: $REPO"

stage "STAGE 1 CHECKPOINT"
run git status --short --branch
run git log --oneline -12
run git diff --name-status
run git diff --cached --name-status

stage "STAGE 2 CONFIRM BASE 076A"
if git log --oneline -40 | grep -Eq "076A|scope quote preview pdf engine repo promotion|QUOTE_PREVIEW_PDF_ENGINE_REPO_PROMOTION_SCOPED"; then
  pass "076A commit found in recent history"
elif [ -f "docs/evidence/forge-quote-preview-pdf-engine-repo-promotion-scope-audit-076a.json" ]; then
  pass "076A audit fallback found"
else
  fail "076A base not found"
fi

if [ -f "docs/evidence/forge-quote-preview-pdf-engine-repo-promotion-scope-audit-076a.json" ]; then
  run python3 -m json.tool docs/evidence/forge-quote-preview-pdf-engine-repo-promotion-scope-audit-076a.json
  if ! rg -n '"status"\s*:\s*"PASS"|"lockedDecision"\s*:\s*"QUOTE_PREVIEW_PDF_ENGINE_REPO_PROMOTION_SCOPED"' docs/evidence/forge-quote-preview-pdf-engine-repo-promotion-scope-audit-076a.json >/dev/null; then
    fail "076A audit exists but does not show PASS/scope lock"
  fi
  pass "076A audit PASS/scope lock confirmed"
else
  warn "076A audit file not found; relying on git log/tree markers"
fi

stage "STAGE 3 REQUIRED FILES"
REQUIRED_FILES=(
  "FORGE_MASTER_BUILD_TREE.md"
  "docs/architecture/source-truth/FORGE_UNIFIED_BUILD_TREE_001.md"
  "docs/roadmap/FORGE_ROADMAP_LOCK_001.md"
  "platform/adapters/quote-preview/quote-preview-pdf-product-intelligence-integration-adapter-075b.js"
  "tests/quote-preview-pdf-product-intelligence-integration-adapter-075b-test.js"
  "platform/adapters/quote-preview/quote-preview-product-intelligence-binding-adapter-074b.js"
  "platform/adapters/product-intelligence/product-intelligence-read-model-adapter-073d.js"
)

for f in "${REQUIRED_FILES[@]}"; do
  [ -f "$f" ] || fail "Missing required file: $f"
  pass "$f"
done

stage "STAGE 4 BACKUP"
mkdir -p "$BACKUP_DIR"
cp FORGE_MASTER_BUILD_TREE.md "$BACKUP_DIR/FORGE_MASTER_BUILD_TREE.md"
cp docs/architecture/source-truth/FORGE_UNIFIED_BUILD_TREE_001.md "$BACKUP_DIR/FORGE_UNIFIED_BUILD_TREE_001.md"
cp docs/roadmap/FORGE_ROADMAP_LOCK_001.md "$BACKUP_DIR/FORGE_ROADMAP_LOCK_001.md"

cat > "$BACKUP_DIR/rollback-076b.sh" <<ROLLBACK
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
echo "rollback 076B complete"
ROLLBACK
chmod +x "$BACKUP_DIR/rollback-076b.sh"
pass "backup created"
pass "rollback created: $BACKUP_DIR/rollback-076b.sh"

stage "STAGE 5 REVALIDATE BASE ADAPTER"
run node --check platform/adapters/quote-preview/quote-preview-pdf-product-intelligence-integration-adapter-075b.js
run node --check tests/quote-preview-pdf-product-intelligence-integration-adapter-075b-test.js
run node tests/quote-preview-pdf-product-intelligence-integration-adapter-075b-test.js

stage "STAGE 6 IMPLEMENT 076B ADAPTER"
mkdir -p "$(dirname "$ADAPTER")"

cat > "$ADAPTER" <<'NODE'
'use strict';

const ADAPTER_ID = 'forge.quote_preview.pdf_engine.repo_promotion.adapter.v1';
const SCHEMA_VERSION = 'forge.quote_preview.pdf_engine.repo_promotion.v1';
const DOMAIN_ID = 'quote_preview_pdf_engine_repo_promotion';
const MODE = 'read_only';
const ROUTE_CLASS = 'preview_safe';

const PRODUCT_INTELLIGENCE_READ_MODEL_ADAPTER_REF =
  'platform/adapters/product-intelligence/product-intelligence-read-model-adapter-073d.js';

const QUOTE_PREVIEW_PRODUCT_INTELLIGENCE_BINDING_ADAPTER_REF =
  'platform/adapters/quote-preview/quote-preview-product-intelligence-binding-adapter-074b.js';

const QUOTE_PREVIEW_PDF_PRODUCT_INTELLIGENCE_INTEGRATION_ADAPTER_REF =
  'platform/adapters/quote-preview/quote-preview-pdf-product-intelligence-integration-adapter-075b.js';

const QUOTE_PREVIEW_PDF_ENGINE_REF =
  'product-intelligence/evidence/forge-quote-pdf-preview-engine.js';

const SAFE_ERROR_CODES = Object.freeze({
  PROMOTION_NOT_SCOPED: 'QUOTE_PREVIEW_PDF_ENGINE_PROMOTION_NOT_SCOPED',
  PRODUCT_INTELLIGENCE_BINDING_REQUIRED: 'QUOTE_PREVIEW_PDF_ENGINE_PRODUCT_INTELLIGENCE_BINDING_REQUIRED',
  PRODUCT_FAMILY_NOT_MAPPED: 'QUOTE_PREVIEW_PDF_ENGINE_PRODUCT_FAMILY_NOT_MAPPED',
  PARSER_NOT_MAPPED: 'QUOTE_PREVIEW_PDF_ENGINE_PARSER_NOT_MAPPED',
  CALCULATOR_NOT_MAPPED: 'QUOTE_PREVIEW_PDF_ENGINE_CALCULATOR_NOT_MAPPED',
  SOURCE_EVIDENCE_REQUIRED: 'QUOTE_PREVIEW_PDF_ENGINE_SOURCE_EVIDENCE_REQUIRED',
  FRESHNESS_REQUIRED: 'QUOTE_PREVIEW_PDF_ENGINE_FRESHNESS_REQUIRED',
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
  parserExecution: false,
  calculatorExecution: false,
  banxicoCall: false,
});

const REQUIRED_PROMOTION_FIELDS = Object.freeze([
  'quote_preview_pdf_promotion_id',
  'quote_preview_pdf_request_id',
  'product_intelligence_binding_ref',
  'product_intelligence_ref',
  'product_family',
  'source_document_ref',
  'source_evidence_refs',
  'parser_ref',
  'calculator_refs',
  'quote_preview_pdf_engine_ref',
  'evidence_requirements',
  'freshness_requirements',
  'preview_constraints',
  'blocked_effects',
  'safety_flags',
  'safe_error',
]);

const BLOCKED_EFFECTS = Object.freeze([
  'pdf_read',
  'parser_execution',
  'calculator_execution',
  'banxico_call',
  'provider_call',
  'quote_generation',
  'quote_write',
  'quote_send',
  'crm_write',
  'policy_write',
  'pipeline_write',
  'task_create',
  'calendar_create',
  'message_send',
  'backend_connection',
  'real_engine_execution',
  'invented_product_truth',
  'invented_premium_truth',
  'invented_coverage_truth',
  'invented_projection_truth',
  'invented_quote_truth',
]);

const PRODUCT_FAMILY_REFERENCE_MAP = Object.freeze({
  GMM: Object.freeze({
    product_intelligence_ref: 'product_intelligence:gmm',
    parser_ref: 'product-intelligence/evidence/gmm-quote-parser.js',
    calculator_refs: Object.freeze([
      'product-intelligence/coverage/gmm-out-of-pocket-engine.js',
      'gmm-quote-summary-engine.js',
    ]),
    product_notes: Object.freeze(['medical_expense_preview', 'coverage_semantics_reference']),
    universal_architecture: false,
  }),
  'Vida Mujer': Object.freeze({
    product_intelligence_ref: 'product_intelligence:vida_mujer',
    parser_ref: null,
    calculator_refs: Object.freeze([
      'product-intelligence/knowledge/vida-mujer-survival-schedule-engine.js',
      'product-intelligence/knowledge/ave/shared-ave-growth-engine.js',
    ]),
    product_notes: Object.freeze(['life_product_reference', 'requires_source_evidence']),
    universal_architecture: false,
  }),
  AVE: Object.freeze({
    product_intelligence_ref: 'product_intelligence:ave',
    parser_ref: null,
    calculator_refs: Object.freeze([
      'product-intelligence/knowledge/ave/shared-ave-growth-engine.js',
      'product-intelligence/knowledge/ave/shared-ave-portfolio-engine.js',
    ]),
    product_notes: Object.freeze(['ave_reference', 'requires_source_evidence']),
    universal_architecture: false,
  }),
  'Imagina Ser': Object.freeze({
    product_intelligence_ref: 'product_intelligence:imagina_ser',
    parser_ref: 'product-intelligence/evidence/solucionline-retirement-parser.js',
    calculator_refs: Object.freeze([
      'retirement-future-udi-projection-engine.js',
      'imagina-ser-future-mxn-bridge.js',
    ]),
    product_notes: Object.freeze([
      'proven_case',
      'not_universal_architecture',
      'retirement_projection_reference_only',
    ]),
    universal_architecture: false,
  }),
  ORVI: Object.freeze({
    product_intelligence_ref: 'product_intelligence:orvi',
    parser_ref: null,
    calculator_refs: Object.freeze([
      'orvi-decision-engine.js',
      'orvi-mxn-conversion-engine.js',
    ]),
    product_notes: Object.freeze(['candidate_product_specific_reference', 'requires_source_evidence']),
    universal_architecture: false,
  }),
  SeguBeca: Object.freeze({
    product_intelligence_ref: 'product_intelligence:segubeca',
    parser_ref: null,
    calculator_refs: Object.freeze([
      'segu-beca-client-presentation-engine.js',
      'segu-beca-education-comparison-engine.js',
    ]),
    product_notes: Object.freeze(['education_product_reference', 'requires_source_evidence']),
    universal_architecture: false,
  }),
});

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function normalizeProductFamily(value) {
  const raw = String(value || '').trim().toLowerCase();
  if (!raw) return '';

  const compact = raw
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  const aliases = new Map([
    ['gmm', 'GMM'],
    ['gastos medicos mayores', 'GMM'],
    ['gastos médicos mayores', 'GMM'],
    ['vida mujer', 'Vida Mujer'],
    ['ave', 'AVE'],
    ['imagina ser', 'Imagina Ser'],
    ['imaginaser', 'Imagina Ser'],
    ['orvi', 'ORVI'],
    ['orvi 99', 'ORVI'],
    ['segubeca', 'SeguBeca'],
    ['segu beca', 'SeguBeca'],
    ['segu-beca', 'SeguBeca'],
  ]);

  return aliases.get(compact) || String(value || '').trim();
}

function makeDeterministicId(parts) {
  const clean = parts
    .filter(Boolean)
    .map((part) => String(part).toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, ''))
    .filter(Boolean)
    .join('_');

  return `quote_preview_pdf_engine_promotion_${clean || 'not_modeled'}_076b`;
}

function getQuotePreviewPdfEnginePromotionManifest() {
  return {
    adapter_id: ADAPTER_ID,
    schemaVersion: SCHEMA_VERSION,
    domainId: DOMAIN_ID,
    mode: MODE,
    routeClass: ROUTE_CLASS,
    adapter_type: 'local_static_read_only_reference_promotion_adapter',
    product_intelligence_read_model_adapter_ref: PRODUCT_INTELLIGENCE_READ_MODEL_ADAPTER_REF,
    quote_preview_product_intelligence_binding_adapter_ref: QUOTE_PREVIEW_PRODUCT_INTELLIGENCE_BINDING_ADAPTER_REF,
    quote_preview_pdf_product_intelligence_integration_adapter_ref:
      QUOTE_PREVIEW_PDF_PRODUCT_INTELLIGENCE_INTEGRATION_ADAPTER_REF,
    quote_preview_pdf_engine_ref: QUOTE_PREVIEW_PDF_ENGINE_REF,
    product_families: Object.keys(PRODUCT_FAMILY_REFERENCE_MAP),
    safe_errors: Object.values(SAFE_ERROR_CODES),
    required_promotion_fields: [...REQUIRED_PROMOTION_FIELDS],
    blocked_effects: [...BLOCKED_EFFECTS],
    safety_flags: clone(DEFAULT_SAFETY_FLAGS),
    promotion_constraints: {
      product_intelligence_binding_required: true,
      product_intelligence_upstream_semantic_authority: true,
      quote_preview_pdf_engine_downstream_consumer_reference_only: true,
      local_static_read_only: true,
      reference_only: true,
      executes_pdf_read: false,
      executes_parser: false,
      executes_calculator: false,
      calls_banxico: false,
      calls_provider: false,
      writes_quote: false,
      creates_quote_truth: false,
    },
  };
}

function buildQuotePreviewPdfEnginePromotionError(request = {}, code = SAFE_ERROR_CODES.PROMOTION_NOT_SCOPED) {
  const productFamily = normalizeProductFamily(
    request.product_family_hint ||
    request.productFamilyHint ||
    request.product_family ||
    request.productFamily
  );

  return {
    schemaVersion: SCHEMA_VERSION,
    domainId: DOMAIN_ID,
    mode: MODE,
    routeClass: ROUTE_CLASS,
    readModelStatus: 'error',
    quote_preview_pdf_promotion_id: makeDeterministicId([
      request.quote_preview_pdf_request_id || request.quotePreviewPdfRequestId || 'missing',
      productFamily || 'not_mapped',
      'error',
    ]),
    quote_preview_pdf_request_id:
      request.quote_preview_pdf_request_id ||
      request.quotePreviewPdfRequestId ||
      request.quote_preview_request_id ||
      request.quotePreviewRequestId ||
      null,
    product_intelligence_binding_ref: QUOTE_PREVIEW_PRODUCT_INTELLIGENCE_BINDING_ADAPTER_REF,
    product_intelligence_ref: null,
    product_family: productFamily || null,
    source_document_ref: request.source_document_ref || request.sourceDocumentRef || null,
    source_evidence_refs: request.source_evidence_refs || request.sourceEvidenceRefs || [],
    parser_ref: null,
    calculator_refs: [],
    quote_preview_pdf_engine_ref: QUOTE_PREVIEW_PDF_ENGINE_REF,
    evidence_requirements: {
      source_document_ref_required: true,
      source_evidence_refs_required: true,
      parser_evidence_required: true,
    },
    freshness_requirements: {
      freshness_metadata_required: true,
      status: 'required_before_execution',
    },
    preview_constraints: {
      product_intelligence_binding_required: true,
      reference_only: true,
      no_pdf_read: true,
      no_parser_execution: true,
      no_calculator_execution: true,
      no_banxico_call: true,
      no_quote_truth: true,
    },
    blocked_effects: [...BLOCKED_EFFECTS],
    safety_flags: clone(DEFAULT_SAFETY_FLAGS),
    safe_error: {
      code,
      message: 'Quote Preview PDF Engine promotion is not available without Product Intelligence-bound references.',
    },
    audit_event: {
      event_type: 'quote_preview_pdf_engine_repo_promotion_safe_error',
      adapter_id: ADAPTER_ID,
      source_phase: '076B',
    },
  };
}

function prepareQuotePreviewPdfEnginePromotionScope(request = {}) {
  const productFamily = normalizeProductFamily(
    request.product_family_hint ||
    request.productFamilyHint ||
    request.product_family ||
    request.productFamily
  );

  if (!productFamily) {
    return buildQuotePreviewPdfEnginePromotionError(
      request,
      SAFE_ERROR_CODES.PRODUCT_INTELLIGENCE_BINDING_REQUIRED
    );
  }

  const familyRef = PRODUCT_FAMILY_REFERENCE_MAP[productFamily];

  if (!familyRef) {
    return buildQuotePreviewPdfEnginePromotionError(
      request,
      SAFE_ERROR_CODES.PRODUCT_FAMILY_NOT_MAPPED
    );
  }

  const sourceEvidenceRefs = request.source_evidence_refs || request.sourceEvidenceRefs || [];

  return {
    schemaVersion: SCHEMA_VERSION,
    domainId: DOMAIN_ID,
    mode: MODE,
    routeClass: ROUTE_CLASS,
    readModelStatus: 'ok',
    quote_preview_pdf_promotion_id: makeDeterministicId([
      request.quote_preview_pdf_request_id || request.quotePreviewPdfRequestId || request.quote_preview_request_id || request.quotePreviewRequestId || 'request',
      productFamily,
    ]),
    quote_preview_pdf_request_id:
      request.quote_preview_pdf_request_id ||
      request.quotePreviewPdfRequestId ||
      request.quote_preview_request_id ||
      request.quotePreviewRequestId ||
      null,
    product_intelligence_binding_ref: {
      binding_adapter_ref: QUOTE_PREVIEW_PRODUCT_INTELLIGENCE_BINDING_ADAPTER_REF,
      integration_adapter_ref: QUOTE_PREVIEW_PDF_PRODUCT_INTELLIGENCE_INTEGRATION_ADAPTER_REF,
      required: true,
    },
    product_intelligence_ref: familyRef.product_intelligence_ref,
    product_family: productFamily,
    source_document_ref: request.source_document_ref || request.sourceDocumentRef || null,
    source_evidence_refs: Array.isArray(sourceEvidenceRefs) ? [...sourceEvidenceRefs] : [sourceEvidenceRefs],
    parser_ref: familyRef.parser_ref,
    calculator_refs: [...familyRef.calculator_refs],
    quote_preview_pdf_engine_ref: QUOTE_PREVIEW_PDF_ENGINE_REF,
    evidence_requirements: {
      source_document_ref_required: true,
      source_evidence_refs_required: true,
      parser_evidence_required: true,
      evidence_ids_present: Array.isArray(sourceEvidenceRefs) && sourceEvidenceRefs.length > 0,
    },
    freshness_requirements: {
      freshness_metadata_required: true,
      status: 'required_before_execution',
      preview_static_allowed: true,
    },
    preview_constraints: {
      product_intelligence_binding_required: true,
      product_intelligence_upstream_semantic_authority: true,
      quote_preview_pdf_engine_downstream_consumer_reference_only: true,
      product_notes: [...familyRef.product_notes],
      universal_architecture: familyRef.universal_architecture,
      reference_only: true,
      no_pdf_read: true,
      no_parser_execution: true,
      no_calculator_execution: true,
      no_banxico_call: true,
      no_provider_call: true,
      no_quote_write: true,
      no_quote_truth: true,
    },
    blocked_effects: [...BLOCKED_EFFECTS],
    safety_flags: clone(DEFAULT_SAFETY_FLAGS),
    safe_error: null,
    audit_event: {
      event_type: 'quote_preview_pdf_engine_repo_promotion_prepared',
      adapter_id: ADAPTER_ID,
      source_phase: '076B',
    },
  };
}

function validateQuotePreviewPdfEnginePromotionShape(promotion) {
  const errors = [];

  if (!promotion || typeof promotion !== 'object') {
    return { ok: false, valid: false, errors: ['promotion_object_required'] };
  }

  for (const field of REQUIRED_PROMOTION_FIELDS) {
    if (!(field in promotion)) {
      errors.push(`missing_${field}`);
    }
  }

  if (promotion.schemaVersion !== SCHEMA_VERSION) errors.push('invalid_schemaVersion');
  if (promotion.domainId !== DOMAIN_ID) errors.push('invalid_domainId');
  if (promotion.mode !== MODE) errors.push('invalid_mode');
  if (promotion.routeClass !== ROUTE_CLASS) errors.push('invalid_routeClass');

  for (const [key, value] of Object.entries(promotion.safety_flags || {})) {
    if (value !== false) errors.push(`safety_flag_not_false_${key}`);
  }

  const serialized = JSON.stringify(promotion);
  const forbiddenFragments = [
    '"pdfRead":' + 'true',
    '"parserExecution":' + 'true',
    '"calculatorExecution":' + 'true',
    '"banxicoCall":' + 'true',
    '"realEngineExecution":' + 'true',
    '"providerRuntime":' + 'true',
    '"quoteWrite":' + 'true',
    '"backendConnection":' + 'true',
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

module.exports = {
  ADAPTER_ID,
  SCHEMA_VERSION,
  DOMAIN_ID,
  MODE,
  ROUTE_CLASS,
  SAFE_ERROR_CODES,
  DEFAULT_SAFETY_FLAGS,
  REQUIRED_PROMOTION_FIELDS,
  BLOCKED_EFFECTS,
  PRODUCT_FAMILY_REFERENCE_MAP,
  PRODUCT_INTELLIGENCE_READ_MODEL_ADAPTER_REF,
  QUOTE_PREVIEW_PRODUCT_INTELLIGENCE_BINDING_ADAPTER_REF,
  QUOTE_PREVIEW_PDF_PRODUCT_INTELLIGENCE_INTEGRATION_ADAPTER_REF,
  QUOTE_PREVIEW_PDF_ENGINE_REF,
  getQuotePreviewPdfEnginePromotionManifest,
  prepareQuotePreviewPdfEnginePromotionScope,
  buildQuotePreviewPdfEnginePromotionError,
  validateQuotePreviewPdfEnginePromotionShape,
};
NODE

pass "$ADAPTER written"

stage "STAGE 7 IMPLEMENT TEST"
mkdir -p "$(dirname "$TEST")"

cat > "$TEST" <<'NODE'
'use strict';

const assert = require('node:assert/strict');

const adapter = require('../platform/adapters/quote-preview/quote-preview-pdf-engine-repo-promotion-adapter-076b.js');

assert.equal(adapter.ADAPTER_ID, 'forge.quote_preview.pdf_engine.repo_promotion.adapter.v1');
assert.equal(adapter.SCHEMA_VERSION, 'forge.quote_preview.pdf_engine.repo_promotion.v1');

assert.equal(typeof adapter.getQuotePreviewPdfEnginePromotionManifest, 'function');
assert.equal(typeof adapter.prepareQuotePreviewPdfEnginePromotionScope, 'function');
assert.equal(typeof adapter.buildQuotePreviewPdfEnginePromotionError, 'function');
assert.equal(typeof adapter.validateQuotePreviewPdfEnginePromotionShape, 'function');

const manifest = adapter.getQuotePreviewPdfEnginePromotionManifest();

assert.equal(manifest.schemaVersion, adapter.SCHEMA_VERSION);
assert.equal(manifest.domainId, 'quote_preview_pdf_engine_repo_promotion');
assert.equal(manifest.mode, 'read_only');
assert.equal(manifest.routeClass, 'preview_safe');
assert.equal(manifest.promotion_constraints.product_intelligence_binding_required, true);
assert.equal(manifest.promotion_constraints.product_intelligence_upstream_semantic_authority, true);
assert.equal(manifest.promotion_constraints.quote_preview_pdf_engine_downstream_consumer_reference_only, true);
assert.equal(manifest.promotion_constraints.executes_pdf_read, false);
assert.equal(manifest.promotion_constraints.executes_parser, false);
assert.equal(manifest.promotion_constraints.executes_calculator, false);
assert.equal(manifest.promotion_constraints.calls_banxico, false);
assert.equal(manifest.promotion_constraints.writes_quote, false);
assert.equal(manifest.promotion_constraints.creates_quote_truth, false);

const gmm = adapter.prepareQuotePreviewPdfEnginePromotionScope({
  quote_preview_pdf_request_id: 'qa_076b_gmm',
  product_family_hint: 'GMM',
  source_document_ref: 'static_reference_only_no_pdf_read',
  source_evidence_refs: ['qa_076b_gmm_evidence'],
});

assert.equal(gmm.readModelStatus, 'ok');
assert.equal(gmm.product_family, 'GMM');
assert.equal(gmm.product_intelligence_ref, 'product_intelligence:gmm');
assert.equal(gmm.product_intelligence_binding_ref.required, true);
assert.equal(gmm.preview_constraints.product_intelligence_binding_required, true);
assert.equal(gmm.preview_constraints.reference_only, true);
assert.equal(gmm.preview_constraints.no_pdf_read, true);
assert.equal(gmm.preview_constraints.no_parser_execution, true);
assert.equal(gmm.preview_constraints.no_calculator_execution, true);
assert.equal(gmm.preview_constraints.no_banxico_call, true);
assert.equal(gmm.preview_constraints.no_quote_truth, true);
assert.equal(gmm.safe_error, null);
assert.equal(adapter.validateQuotePreviewPdfEnginePromotionShape(gmm).ok, true);

const imagina = adapter.prepareQuotePreviewPdfEnginePromotionScope({
  quote_preview_pdf_request_id: 'qa_076b_imagina',
  product_family_hint: 'Imagina Ser',
  source_document_ref: 'static_reference_only_no_pdf_read',
  source_evidence_refs: ['qa_076b_imagina_evidence'],
});

assert.equal(imagina.readModelStatus, 'ok');
assert.equal(imagina.product_family, 'Imagina Ser');
assert.equal(imagina.product_intelligence_ref, 'product_intelligence:imagina_ser');
assert.equal(imagina.preview_constraints.universal_architecture, false);
assert(imagina.preview_constraints.product_notes.includes('not_universal_architecture'));
assert.equal(adapter.validateQuotePreviewPdfEnginePromotionShape(imagina).ok, true);

const missing = adapter.prepareQuotePreviewPdfEnginePromotionScope({
  quote_preview_pdf_request_id: 'qa_076b_missing',
  product_family_hint: 'UNKNOWN_FAMILY',
  source_document_ref: 'static_reference_only_no_pdf_read',
  source_evidence_refs: [],
});

assert.equal(missing.readModelStatus, 'error');
assert.equal(missing.safe_error.code, adapter.SAFE_ERROR_CODES.PRODUCT_FAMILY_NOT_MAPPED);
assert.equal(adapter.validateQuotePreviewPdfEnginePromotionShape(missing).ok, true);

for (const family of ['GMM', 'Vida Mujer', 'AVE', 'Imagina Ser', 'ORVI', 'SeguBeca']) {
  const output = adapter.prepareQuotePreviewPdfEnginePromotionScope({
    quote_preview_pdf_request_id: `qa_076b_${family}`,
    product_family_hint: family,
    source_document_ref: 'static_reference_only_no_pdf_read',
    source_evidence_refs: [`qa_076b_${family}_evidence`],
  });
  assert.equal(output.readModelStatus, 'ok', `${family} should be mapped`);
  assert.equal(adapter.validateQuotePreviewPdfEnginePromotionShape(output).ok, true);
}

for (const [key, value] of Object.entries(adapter.DEFAULT_SAFETY_FLAGS)) {
  assert.equal(value, false, `DEFAULT_SAFETY_FLAGS.${key} must be false`);
}

const combined = JSON.stringify({ manifest, gmm, imagina, missing, flags: adapter.DEFAULT_SAFETY_FLAGS });
const forbiddenFragments = [
  '"pdfRead":' + 'true',
  '"parserExecution":' + 'true',
  '"calculatorExecution":' + 'true',
  '"banxicoCall":' + 'true',
  '"realEngineExecution":' + 'true',
  '"providerRuntime":' + 'true',
  '"quoteWrite":' + 'true',
  '"backendConnection":' + 'true',
];

for (const fragment of forbiddenFragments) {
  assert(!combined.includes(fragment), `forbidden true flag found: ${fragment}`);
}

assert(combined.includes('quote-preview-product-intelligence-binding-adapter-074b.js'));
assert(combined.includes('quote-preview-pdf-product-intelligence-integration-adapter-075b.js'));
assert(combined.includes('product-intelligence-read-model-adapter-073d.js'));
assert(combined.includes('forge-quote-pdf-preview-engine.js'));

console.log('PASS quote preview pdf engine repo promotion adapter 076B');
NODE

pass "$TEST written"

stage "STAGE 8 WRITE DOCS / EVIDENCE"

cat > "$ARCH_DOC" <<EOF
# Forge Quote Preview PDF Engine Repo Promotion Implementation 076B

PHASE=$PHASE

STATUS=PASS

DECISION=$DECISION

LOCKED_DECISION=$LOCKED_DECISION

NEXT=$NEXT

## Purpose

076B implements the local/static/read-only Quote Preview PDF Engine repo promotion adapter scoped in 076A.

The adapter prepares promotion records by reference only. It does not read PDFs, execute parsers, execute calculators, call Banxico, call providers, write quotes, connect backend, or create product/premium/coverage/projection/quote truth.

## Implemented Files

- \`$ADAPTER\`
- \`$TEST\`

## Adapter Contract

- \`ADAPTER_ID\`: \`forge.quote_preview.pdf_engine.repo_promotion.adapter.v1\`
- \`SCHEMA_VERSION\`: \`forge.quote_preview.pdf_engine.repo_promotion.v1\`
- \`domainId\`: \`quote_preview_pdf_engine_repo_promotion\`
- \`mode\`: \`read_only\`
- \`routeClass\`: \`preview_safe\`

Exports:

- \`ADAPTER_ID\`
- \`SCHEMA_VERSION\`
- \`SAFE_ERROR_CODES\`
- \`DEFAULT_SAFETY_FLAGS\`
- \`REQUIRED_PROMOTION_FIELDS\`
- \`getQuotePreviewPdfEnginePromotionManifest()\`
- \`prepareQuotePreviewPdfEnginePromotionScope(request)\`
- \`buildQuotePreviewPdfEnginePromotionError(request)\`
- \`validateQuotePreviewPdfEnginePromotionShape(promotion)\`

## Reference Chain

076B preserves this upstream chain:

1. Product Intelligence Read Model adapter 073D.
2. Quote Preview Product Intelligence Binding adapter 074B.
3. Quote Preview PDF Product Intelligence Integration adapter 075B.
4. Quote Preview PDF Engine reference surface.

## Product Families Covered

- GMM
- Vida Mujer
- AVE
- Imagina Ser
- ORVI
- SeguBeca

Imagina Ser remains a proven case, not universal architecture.

## Non-Authorization

076B does not authorize PDF reads, parser execution, calculator execution, Banxico calls, provider calls, quote generation, quote writes/sends, backend connection, CRM/policy/pipeline/task/calendar/message writes, real engine execution, or invented truth.

## Final Decision

DECISION=$DECISION

LOCKED_DECISION=$LOCKED_DECISION

NEXT=$NEXT
EOF

cat > "$EVIDENCE_DOC" <<EOF
# Forge Quote Preview PDF Engine Repo Promotion Implementation 076B

PHASE=$PHASE

STATUS=PASS

DECISION=$DECISION

LOCKED_DECISION=$LOCKED_DECISION

NEXT=$NEXT

## Evidence Summary

076B implemented a local/static/read-only Quote Preview PDF Engine repo promotion adapter.

The adapter emits promotion records that are Product Intelligence-bound and reference-only. It keeps Quote Preview PDF Engine downstream of Product Intelligence and blocks all real effects.

## Test Evidence

The focused test validates:

- manifest shape;
- GMM promotion record;
- Imagina Ser promotion record as non-universal;
- missing family safe error;
- all scoped product families mapped;
- required fields present;
- all safety flags false;
- reference chain includes 073D, 074B, 075B, and PDF preview engine refs;
- no PDF/parser/calculator/Banxico/provider/backend/quote execution true flags.

## Commands

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
# Forge Quote Preview PDF Engine Repo Promotion Implementation Certificate 076B

PHASE=$PHASE

CERTIFICATE_STATUS=PASS

DECISION=$DECISION

LOCKED_DECISION=$LOCKED_DECISION

NEXT=$NEXT

## Certificate

076B certifies that Forge now has a local/static/read-only Quote Preview PDF Engine repo promotion adapter.

Certified statements:

- promotion is Product Intelligence-bound;
- Product Intelligence remains upstream semantic authority;
- Quote Preview PDF Engine remains downstream consumer/reference only;
- promotion records are reference-only;
- all scoped product families are mapped;
- Imagina Ser is not universal architecture;
- missing/unmapped product families return safe errors;
- all safety flags remain false.

## No-Effect Boundary

This implementation authorizes no PDF reads, parser execution, calculator execution, Banxico calls, quote generation, quote writes, provider calls, backend connection, or real effects.

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
    "phase": "076A_QUOTE_PREVIEW_PDF_ENGINE_REPO_PROMOTION_SCOPE",
    "confirmed": true,
    "lockedDecision": "QUOTE_PREVIEW_PDF_ENGINE_REPO_PROMOTION_SCOPED"
  },
  "next": "$NEXT",
  "implementation": {
    "adapter": "$ADAPTER",
    "test": "$TEST",
    "adapterId": "forge.quote_preview.pdf_engine.repo_promotion.adapter.v1",
    "schemaVersion": "forge.quote_preview.pdf_engine.repo_promotion.v1",
    "domainId": "quote_preview_pdf_engine_repo_promotion",
    "mode": "read_only",
    "routeClass": "preview_safe",
    "adapterType": "local_static_read_only_reference_promotion_adapter",
    "productIntelligenceBound": true,
    "referenceOnly": true,
    "quoteTruthCreationAllowed": false
  },
  "referenceChain": [
    "platform/adapters/product-intelligence/product-intelligence-read-model-adapter-073d.js",
    "platform/adapters/quote-preview/quote-preview-product-intelligence-binding-adapter-074b.js",
    "platform/adapters/quote-preview/quote-preview-pdf-product-intelligence-integration-adapter-075b.js",
    "product-intelligence/evidence/forge-quote-pdf-preview-engine.js"
  ],
  "productFamilies": [
    "GMM",
    "Vida Mujer",
    "AVE",
    "Imagina Ser",
    "ORVI",
    "SeguBeca"
  ],
  "safeErrors": [
    "QUOTE_PREVIEW_PDF_ENGINE_PROMOTION_NOT_SCOPED",
    "QUOTE_PREVIEW_PDF_ENGINE_PRODUCT_INTELLIGENCE_BINDING_REQUIRED",
    "QUOTE_PREVIEW_PDF_ENGINE_PRODUCT_FAMILY_NOT_MAPPED",
    "QUOTE_PREVIEW_PDF_ENGINE_PARSER_NOT_MAPPED",
    "QUOTE_PREVIEW_PDF_ENGINE_CALCULATOR_NOT_MAPPED",
    "QUOTE_PREVIEW_PDF_ENGINE_SOURCE_EVIDENCE_REQUIRED",
    "QUOTE_PREVIEW_PDF_ENGINE_FRESHNESS_REQUIRED"
  ],
  "notAuthorized": {
    "pdfRead": false,
    "parserExecution": false,
    "calculatorExecution": false,
    "banxicoCall": false,
    "providerCall": false,
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
    "parserExecution": false,
    "calculatorExecution": false,
    "banxicoCall": false
  },
  "validations": {
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
## 076B Quote Preview PDF Engine Repo Promotion Implementation

076B implements the local/static/read-only Quote Preview PDF Engine repo promotion adapter.

Locked decision:
\`$LOCKED_DECISION\`

Implemented surfaces:

- \`$ADAPTER\`
- \`$TEST\`

The adapter:

- exposes \`forge.quote_preview.pdf_engine.repo_promotion.v1\`;
- prepares Product Intelligence-bound promotion records;
- preserves Product Intelligence as upstream semantic authority;
- keeps Quote Preview PDF Engine as downstream consumer/reference only;
- maps GMM, Vida Mujer, AVE, Imagina Ser, ORVI, and SeguBeca;
- keeps Imagina Ser as a proven case, not universal architecture;
- references 073D, 074B, 075B, and the PDF preview engine by path;
- does not read PDFs, execute parsers, execute calculators, call Banxico, call providers, write quotes, connect backend, or create quote truth;
- preserves all safety flags as false.

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
run node --check "$ADAPTER"
run node --check "$TEST"
run node "$TEST"
run python3 -m json.tool "$AUDIT_JSON"

run rg -n "$PHASE|$DECISION|$LOCKED_DECISION|$NEXT|QUOTE_PREVIEW_PDF_ENGINE_PROMOTION_NOT_SCOPED|QUOTE_PREVIEW_PDF_ENGINE_PRODUCT_INTELLIGENCE_BINDING_REQUIRED|forge.quote_preview.pdf_engine.repo_promotion.v1" \
  FORGE_MASTER_BUILD_TREE.md \
  docs/architecture/source-truth/FORGE_UNIFIED_BUILD_TREE_001.md \
  docs/roadmap/FORGE_ROADMAP_LOCK_001.md \
  "$ARCH_DOC" "$EVIDENCE_DOC" "$CERT_DOC" "$AUDIT_JSON" "$ADAPTER" "$TEST"

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
  "$ADAPTER"
  "$TEST"
)

if rg -n 'localStorage|sessionStorage|fetch\(|XMLHttpRequest|navigator\.mediaDevices|SpeechRecognition|providerRuntimeEnabled:\s*true|networkCallsAllowed:\s*true|browserStorageEnabled:\s*true|mayCreateTruth:\s*true|maySendMessage:\s*true|mayWriteCrm:\s*true|mayCreateCalendarEvent:\s*true' "${SCOPED_FILES[@]}"; then
  fail "safety scan found prohibited runtime/browser/network marker"
fi

if rg -n '"?(crmWrite|pipelineWrite|policyWrite|quoteWrite|taskCreate|calendarCreate|messageSend|authReal|providerRuntime|secretAccess|browserPersistence|realEngineExecution|realEffectsAllowed|realEffectsEnabled|backendConnection|pdfRead|parserExecution|calculatorExecution|banxicoCall)"?\s*[:=]\s*true\b' "${SCOPED_FILES[@]}"; then
  fail "real-effect flag true found"
fi

pass "safety scan clean"

stage "STAGE 13 STAGE AUTHORIZED FILES"
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

stage "STAGE 14 COMMIT PUSH"
run git commit -m "feat: implement quote preview pdf engine repo promotion adapter"
run git push origin HEAD:main

stage "STAGE 15 FINAL CHECKPOINT"
run git status --short --branch
run git log --oneline -10

SUMMARY=$(cat <<EOF
PASS_076B_QUOTE_PREVIEW_PDF_ENGINE_REPO_PROMOTION_IMPLEMENTATION_COMMIT_PUSH_COMPLETE
DECISION=$DECISION
LOCKED_DECISION=$LOCKED_DECISION
NEXT=$NEXT
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
