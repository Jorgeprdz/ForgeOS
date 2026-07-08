#!/usr/bin/env bash
set -euo pipefail

PHASE="078A_QUOTE_PREVIEW_PDF_ENGINE_CANONICAL_TEST_EVIDENCE_SCOPE"
DECISION="PASS_078A_QUOTE_PREVIEW_PDF_ENGINE_CANONICAL_TEST_EVIDENCE_SCOPE"
LOCKED_DECISION="QUOTE_PREVIEW_PDF_ENGINE_CANONICAL_TEST_EVIDENCE_SCOPED"
NEXT="078B_QUOTE_PREVIEW_PDF_ENGINE_CANONICAL_TEST_EVIDENCE_IMPLEMENTATION"
MODE="docs/scope only; canonical test evidence classification before execution"
BOUNDARY="no UI mutation; no backend real; no CRM/policy/quote/pipeline writes; no task/calendar/message; no provider execution with effects; no auth/secrets/browser persistence; no real engine execution; no parser/calculator/Banxico/PDF/OCR execution; no invented product/premium/coverage/projection/quote truth; no new extractor/parser/calculator; no real test execution"
REPO="${REPO:-/storage/emulated/0/Forge OS}"
STAMP="$(date +%Y%m%d_%H%M%S)"
REPORT="/data/data/com.termux/files/home/${PHASE}_RESULT_${STAMP}.md"
BACKUP_DIR=".forge-backups/078a-quote-preview-pdf-engine-canonical-test-evidence-scope-${STAMP}"
SCRIPT_IN_REPO="tools/termux/forge_078a_quote_preview_pdf_engine_canonical_test_evidence_scope.sh"

ADAPTER="platform/adapters/quote-preview/quote-preview-pdf-engine-existing-surfaces-canonical-mapping-adapter-077b.js"
ADAPTER_TEST="tests/quote-preview-pdf-engine-existing-surfaces-canonical-mapping-adapter-077b-test.js"

ARCH_DOC="docs/architecture/source-truth/FORGE_QUOTE_PREVIEW_PDF_ENGINE_CANONICAL_TEST_EVIDENCE_SCOPE_078A.md"
EVIDENCE_DOC="docs/evidence/FORGE_QUOTE_PREVIEW_PDF_ENGINE_CANONICAL_TEST_EVIDENCE_SCOPE_078A.md"
CERT_DOC="docs/evidence/FORGE_QUOTE_PREVIEW_PDF_ENGINE_CANONICAL_TEST_EVIDENCE_SCOPE_CERTIFICATE_078A.md"
AUDIT_JSON="docs/evidence/forge-quote-preview-pdf-engine-canonical-test-evidence-scope-audit-078a.json"

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
echo "ROBOCOP_GATE=Article 0; 077D decision closed; canonical test evidence scope only"

cd "$REPO" || fail "No existe repo: $REPO"

stage "STAGE 1 CHECKPOINT"
run git status --short --branch
run git log --oneline -12
run git diff --name-status
run git diff --cached --name-status

stage "STAGE 2 CONFIRM BASE 077D"
if git log --oneline -50 | grep -Eq "077D|lock quote preview pdf existing surfaces canonical mapping decision|QUOTE_PREVIEW_PDF_ENGINE_EXISTING_SURFACES_CANONICAL_MAPPING_LOCKED_AS_LOCAL_STATIC_READ_ONLY_REFERENCE_CATALOG"; then
  pass "077D commit found in recent history"
elif [ -f "docs/evidence/forge-quote-preview-pdf-engine-existing-surfaces-canonical-mapping-decision-audit-077d.json" ]; then
  pass "077D audit fallback found"
else
  fail "077D base not found"
fi

if [ -f "docs/evidence/forge-quote-preview-pdf-engine-existing-surfaces-canonical-mapping-decision-audit-077d.json" ]; then
  run python3 -m json.tool docs/evidence/forge-quote-preview-pdf-engine-existing-surfaces-canonical-mapping-decision-audit-077d.json
  if ! rg -n '"status"\s*:\s*"PASS"|"lockedDecision"\s*:\s*"QUOTE_PREVIEW_PDF_ENGINE_EXISTING_SURFACES_CANONICAL_MAPPING_LOCKED_AS_LOCAL_STATIC_READ_ONLY_REFERENCE_CATALOG"|"next"\s*:\s*"078A_QUOTE_PREVIEW_PDF_ENGINE_CANONICAL_TEST_EVIDENCE_SCOPE"' docs/evidence/forge-quote-preview-pdf-engine-existing-surfaces-canonical-mapping-decision-audit-077d.json >/dev/null; then
    fail "077D audit exists but does not confirm PASS/078A next"
  fi
  pass "077D audit PASS/078A next confirmed"
else
  warn "077D audit file not found; relying on git log/tree markers"
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
  "$ADAPTER"
  "$ADAPTER_TEST"
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

cat > "$BACKUP_DIR/rollback-078a.sh" <<ROLLBACK
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
echo "rollback 078A complete"
ROLLBACK
chmod +x "$BACKUP_DIR/rollback-078a.sh"
pass "backup created"
pass "rollback created: $BACKUP_DIR/rollback-078a.sh"

stage "STAGE 6 REVALIDATE REFERENCE CATALOG"
run node --check "$ADAPTER"
run node --check "$ADAPTER_TEST"
run node "$ADAPTER_TEST"

stage "STAGE 7 BUILD TEST EVIDENCE SCOPE"
TEST_SCOPE_JSON="$(mktemp)"
node <<'NODE' > "$TEST_SCOPE_JSON"
const fs = require('node:fs');
const adapter = require('./platform/adapters/quote-preview/quote-preview-pdf-engine-existing-surfaces-canonical-mapping-adapter-077b.js');

const catalog = adapter.getQuotePreviewPdfExistingSurfacesCanonicalMappingCatalog();
const surfaces = Array.isArray(catalog.surfaces) ? catalog.surfaces : [];

const expectedCandidates = [
  {
    test_id: 'real_pdf_ocr_solucionline_candidate',
    file_path: 'tests/real-pdf-ocr-test.js',
    evidence_type: 'real_pdf_ocr',
    product_family: ['Imagina Ser', 'Solucionline'],
    candidate_status: 'canonical_candidate_if_present',
    required_boundary: 'must verify it uses existing OCR/extractor and does not invent expected values',
    execution_status_for_078a: 'not_executed',
  },
  {
    test_id: 'real_gmm_quote_candidate',
    file_path: 'tests/real-gmm-quote-test.js',
    evidence_type: 'real_pdf_gmm_parser',
    product_family: ['GMM'],
    candidate_status: 'canonical_candidate_if_present',
    required_boundary: 'must verify parser vs summary ownership and real fixture provenance',
    execution_status_for_078a: 'not_executed',
  },
  {
    test_id: 'gmm_out_of_pocket_candidate',
    file_path: 'tests/gmm-out-of-pocket-test.js',
    evidence_type: 'real_or_fixture_gmm_cost_summary',
    product_family: ['GMM'],
    candidate_status: 'canonical_candidate_if_present',
    required_boundary: 'must verify expected values derive from fixture/repo evidence, not invented values',
    execution_status_for_078a: 'not_executed',
  },
  {
    test_id: 'real_retirement_scenario_candidate',
    file_path: 'tests/real-retirement-scenario-test.js',
    evidence_type: 'real_pdf_retirement_parser',
    product_family: ['Imagina Ser', 'Solucionline'],
    candidate_status: 'canonical_candidate_if_present',
    required_boundary: 'must verify Solucionline parser ownership before canonical lock',
    execution_status_for_078a: 'not_executed',
  },
  {
    test_id: 'real_retirement_mxn_scenario_candidate',
    file_path: 'tests/real-retirement-mxn-scenario-test.js',
    evidence_type: 'real_pdf_retirement_projection',
    product_family: ['Imagina Ser', 'Solucionline'],
    candidate_status: 'canonical_candidate_if_present',
    required_boundary: 'must verify projection delegates to existing UDI/MXN engines',
    execution_status_for_078a: 'not_executed',
  },
  {
    test_id: 'imagina_ser_master_candidate',
    file_path: 'imagina-ser-master-test.js',
    evidence_type: 'imagina_ser_end_to_end_or_fixture',
    product_family: ['Imagina Ser'],
    candidate_status: 'canonical_candidate_if_present',
    required_boundary: 'must remain no-provider/no-network unless later gate authorizes runtime',
    execution_status_for_078a: 'not_executed',
  },
  {
    test_id: 'imagina_ser_banxico_integration_candidate',
    file_path: 'imagina-ser-banxico-integration-test.js',
    evidence_type: 'banxico_cache_metadata_or_integration',
    product_family: ['Imagina Ser'],
    candidate_status: 'secondary_or_canonical_candidate_if_no_network',
    required_boundary: 'must classify provider/cache behavior before execution',
    execution_status_for_078a: 'not_executed',
  },
  {
    test_id: 'retirement_future_udi_projection_smoke_candidate',
    file_path: 'retirement-future-udi-projection-smoke-test.js',
    evidence_type: 'udi_projection_smoke',
    product_family: ['Imagina Ser', 'Solucionline'],
    candidate_status: 'supporting_canonical_candidate_if_deterministic',
    required_boundary: 'must verify UDI growth value comes from repo/config and is not invented',
    execution_status_for_078a: 'not_executed',
  },
  {
    test_id: 'quote_pdf_preview_fixture_candidate',
    file_path: 'tests/product-intelligence/forge-quote-pdf-preview-engine-test.js',
    evidence_type: 'preview_fixture',
    product_family: ['Imagina Ser', 'Solucionline'],
    candidate_status: 'fixture_evidence_candidate',
    required_boundary: 'must not be treated as real PDF/OCR evidence',
    execution_status_for_078a: 'not_executed',
  },
  {
    test_id: 'repo_promotion_guardrail_candidate',
    file_path: 'tests/quote-preview-pdf-engine-repo-promotion-adapter-076b-test.js',
    evidence_type: 'governance_guardrail',
    product_family: ['GMM', 'Vida Mujer', 'AVE', 'Imagina Ser', 'ORVI', 'SeguBeca'],
    candidate_status: 'governance_evidence_candidate',
    required_boundary: 'does not prove extraction; validates no-effect promotion guardrail',
    execution_status_for_078a: 'not_executed',
  },
  {
    test_id: 'existing_surfaces_mapping_guardrail_candidate',
    file_path: 'tests/quote-preview-pdf-engine-existing-surfaces-canonical-mapping-adapter-077b-test.js',
    evidence_type: 'governance_guardrail',
    product_family: ['GMM', 'Vida Mujer', 'AVE', 'Imagina Ser', 'ORVI', 'SeguBeca'],
    candidate_status: 'governance_evidence_candidate',
    required_boundary: 'does not prove extraction; validates reference catalog shape',
    execution_status_for_078a: 'safe_guardrail_test_executed',
  },
];

const mappedTestSurfaces = surfaces
  .filter((surface) => String(surface.surface_type || '').includes('test') || String(surface.file_path || '').includes('test'))
  .map((surface) => ({
    surface_id: surface.surface_id,
    file_path: surface.file_path,
    surface_type: surface.surface_type,
    product_family: surface.product_family || [],
    canonical_status: surface.canonical_status,
    allowed_role: surface.allowed_role,
    blocked_growth: surface.blocked_growth || [],
    safe_errors: surface.safe_errors || [],
  }));

const candidates = expectedCandidates.map((candidate) => ({
  ...candidate,
  present_in_repo: fs.existsSync(candidate.file_path),
  present_in_077b_catalog: mappedTestSurfaces.some((surface) => surface.file_path === candidate.file_path),
}));

const presentCandidates = candidates.filter((candidate) => candidate.present_in_repo);
const missingCandidates = candidates.filter((candidate) => !candidate.present_in_repo);
const catalogMappedCandidates = candidates.filter((candidate) => candidate.present_in_077b_catalog);

const scope = {
  status: 'PASS',
  phase: '078A_QUOTE_PREVIEW_PDF_ENGINE_CANONICAL_TEST_EVIDENCE_SCOPE',
  scope_type: 'canonical_test_evidence_scope_only',
  execution_allowed_in_078a: false,
  real_pdf_tests_executed_in_078a: false,
  parser_tests_executed_in_078a: false,
  calculator_tests_executed_in_078a: false,
  banxico_tests_executed_in_078a: false,
  provider_tests_executed_in_078a: false,
  adapter_catalog_surface_count: surfaces.length,
  mapped_test_surfaces_from_077b: mappedTestSurfaces,
  expected_test_evidence_candidates: candidates,
  present_test_evidence_candidates: presentCandidates,
  missing_test_evidence_candidates: missingCandidates,
  catalog_mapped_test_evidence_candidates: catalogMappedCandidates,
  required_078b_output: {
    adapter_type: 'local_static_read_only_canonical_test_evidence_registry',
    must_not_execute_tests: true,
    must_not_read_pdfs: true,
    must_not_run_parsers: true,
    must_not_run_calculators: true,
    must_not_call_banxico: true,
    required_fields: [
      'test_id',
      'file_path',
      'evidence_type',
      'product_family',
      'source_surface_refs',
      'engine_refs',
      'fixture_refs',
      'canonical_candidate',
      'canonical_status',
      'evidence_role',
      'execution_policy',
      'blocked_growth',
      'safe_errors',
      'safety_flags'
    ]
  },
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
    banxicoCall: false
  }
};

if (presentCandidates.length < 1) {
  throw new Error('No canonical test evidence candidates are present in repo');
}

console.log(JSON.stringify(scope, null, 2));
NODE

cat "$TEST_SCOPE_JSON"
pass "test evidence scope built"

stage "STAGE 8 WRITE DOCS / EVIDENCE"
mkdir -p "$(dirname "$ARCH_DOC")" "$(dirname "$EVIDENCE_DOC")"

cat > "$ARCH_DOC" <<EOF
# Forge Quote Preview PDF Engine Canonical Test Evidence Scope 078A

PHASE=$PHASE

STATUS=PASS

DECISION=$DECISION

LOCKED_DECISION=$LOCKED_DECISION

NEXT=$NEXT

## Purpose

078A scopes canonical test evidence for the Quote Preview PDF Engine path.

This phase exists after 077D locked the existing surfaces mapping as a local/static/read-only reference catalog.

078A does not execute real quote/PDF tests. It only scopes how existing tests should be classified before any future QA or promotion step treats them as canonical evidence.

## Base Confirmed

077D is closed as:

- \`PASS_077D_QUOTE_PREVIEW_PDF_ENGINE_EXISTING_SURFACES_CANONICAL_MAPPING_DECISION_LOCK\`
- \`QUOTE_PREVIEW_PDF_ENGINE_EXISTING_SURFACES_CANONICAL_MAPPING_LOCKED_AS_LOCAL_STATIC_READ_ONLY_REFERENCE_CATALOG\`
- \`NEXT=078A_QUOTE_PREVIEW_PDF_ENGINE_CANONICAL_TEST_EVIDENCE_SCOPE\`

## Scope Boundary

078A authorizes no:

- PDF read;
- OCR execution;
- parser execution;
- calculator execution;
- Banxico call;
- provider call;
- backend connection;
- quote generation;
- quote write or send;
- CRM, policy, pipeline, task, calendar, or message writes;
- invented product, premium, coverage, projection, or quote truth.

## Canonical Test Evidence Candidates

078A scopes these existing test candidates for 078B classification:

| Candidate | Evidence role | Canonical status |
|---|---|---|
| \`tests/real-pdf-ocr-test.js\` | real PDF/OCR candidate | candidate if present |
| \`tests/real-gmm-quote-test.js\` | real GMM quote candidate | candidate if present |
| \`tests/gmm-out-of-pocket-test.js\` | GMM cost summary candidate | candidate if present |
| \`tests/real-retirement-scenario-test.js\` | real retirement/Solucionline parser candidate | candidate if present |
| \`tests/real-retirement-mxn-scenario-test.js\` | retirement projection candidate | candidate if present |
| \`imagina-ser-master-test.js\` | Imagina Ser flow candidate | candidate if present |
| \`imagina-ser-banxico-integration-test.js\` | Banxico/cache metadata candidate | secondary or candidate if no network |
| \`retirement-future-udi-projection-smoke-test.js\` | UDI projection smoke candidate | supporting candidate if deterministic |
| \`tests/product-intelligence/forge-quote-pdf-preview-engine-test.js\` | preview fixture candidate | fixture evidence only |
| \`tests/quote-preview-pdf-engine-repo-promotion-adapter-076b-test.js\` | governance guardrail candidate | governance evidence |
| \`tests/quote-preview-pdf-engine-existing-surfaces-canonical-mapping-adapter-077b-test.js\` | mapping guardrail candidate | governance evidence |

## Required 078B Shape

078B must implement a local/static/read-only canonical test evidence registry.

078B must not execute tests. It must classify them.

Required fields:

- \`test_id\`
- \`file_path\`
- \`evidence_type\`
- \`product_family\`
- \`source_surface_refs\`
- \`engine_refs\`
- \`fixture_refs\`
- \`canonical_candidate\`
- \`canonical_status\`
- \`evidence_role\`
- \`execution_policy\`
- \`blocked_growth\`
- \`safe_errors\`
- \`safety_flags\`

## Required Classifications

078B must distinguish:

- real PDF/OCR evidence;
- real quote parser evidence;
- deterministic calculator evidence;
- rate/cache metadata evidence;
- fixture-only preview evidence;
- smoke tests;
- governance guardrail tests;
- tests that must remain secondary;
- tests requiring canonical decision.

## Blocked Misclassification

078B must prevent:

- treating fixture tests as real PDF evidence;
- treating governance tests as extraction proof;
- treating provider integration tests as safe runtime calls;
- treating preview summaries as quote truth;
- accepting invented expected financial values;
- creating new tests instead of cataloging existing tests.

## Final Decision

DECISION=$DECISION

LOCKED_DECISION=$LOCKED_DECISION

NEXT=$NEXT
EOF

cat > "$EVIDENCE_DOC" <<EOF
# Forge Quote Preview PDF Engine Canonical Test Evidence Scope 078A

PHASE=$PHASE

STATUS=PASS

DECISION=$DECISION

LOCKED_DECISION=$LOCKED_DECISION

NEXT=$NEXT

## Evidence Summary

078A scopes canonical test evidence classification for the Quote Preview PDF Engine path.

It uses the 077D locked reference catalog and the previous discovery output to classify candidate tests without executing real PDF/OCR/parser/calculator/Banxico/provider behavior.

## Discovery Evidence

Discovery JSON:

\`$DISCOVERY_JSON_FOUND\`

Discovery report:

\`${DISCOVERY_REPORT_MD:-not_found}\`

Discovery digest:

\`\`\`json
$(cat "$DISCOVERY_DIGEST_JSON")
\`\`\`

## Test Evidence Scope

\`\`\`json
$(cat "$TEST_SCOPE_JSON")
\`\`\`

## Commands

- \`python3 -m json.tool "$DISCOVERY_JSON_FOUND"\`
- \`node --check $ADAPTER\`
- \`node --check $ADAPTER_TEST\`
- \`node $ADAPTER_TEST\`
- local/static/read-only test evidence scope builder
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
# Forge Quote Preview PDF Engine Canonical Test Evidence Scope Certificate 078A

PHASE=$PHASE

CERTIFICATE_STATUS=PASS

DECISION=$DECISION

LOCKED_DECISION=$LOCKED_DECISION

NEXT=$NEXT

## Certificate

078A certifies that canonical test evidence must be scoped before any test evidence implementation or promotion.

Certified statements:

- 077D reference catalog is the base;
- existing tests are candidates for classification;
- real tests were not executed;
- PDF/OCR/parser/calculator/Banxico/provider behavior was not executed;
- no new extractor/parser/calculator/test engine was created;
- fixture tests must not be misclassified as real PDF evidence;
- governance tests must not be misclassified as extraction proof;
- Product Intelligence remains upstream;
- Quote Preview remains downstream;
- 078B must implement a local/static/read-only canonical test evidence registry.

## No-Effect Boundary

This scope authorizes no PDF reads, OCR execution, parser execution, calculator execution, Banxico calls, quote generation, quote writes, provider calls, backend connection, or real effects.

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
    "phase": "077D_QUOTE_PREVIEW_PDF_ENGINE_EXISTING_SURFACES_CANONICAL_MAPPING_DECISION_LOCK",
    "confirmed": true,
    "lockedDecision": "QUOTE_PREVIEW_PDF_ENGINE_EXISTING_SURFACES_CANONICAL_MAPPING_LOCKED_AS_LOCAL_STATIC_READ_ONLY_REFERENCE_CATALOG"
  },
  "next": "$NEXT",
  "scopeType": "canonical_test_evidence_scope_only",
  "discoveryEvidence": $(cat "$DISCOVERY_DIGEST_JSON"),
  "testEvidenceScope": $(cat "$TEST_SCOPE_JSON"),
  "required078B": {
    "adapterType": "local_static_read_only_canonical_test_evidence_registry",
    "mustNotExecuteTests": true,
    "mustNotReadPdfs": true,
    "mustNotRunParsers": true,
    "mustNotRunCalculators": true,
    "mustNotCallBanxico": true,
    "mustNotCreateNewExtractor": true,
    "mustNotCreateNewParser": true,
    "mustNotCreateNewCalculator": true
  },
  "classificationRules": {
    "fixtureTestsAreNotRealPdfEvidence": true,
    "governanceTestsAreNotExtractionProof": true,
    "providerIntegrationTestsNeedRuntimeGate": true,
    "previewSummariesAreNotQuoteTruth": true,
    "inventedExpectedFinancialValuesBlocked": true,
    "existingTestsMustBeCatalogedBeforeNewTests": true
  },
  "notAuthorized": {
    "pdfRead": false,
    "ocrExecution": false,
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
    "ocrExecution": false,
    "parserExecution": false,
    "calculatorExecution": false,
    "banxicoCall": false
  },
  "validations": {
    "base077D": "PASS",
    "discoveryJson": "PASS",
    "nodeCheckAdapter": "PASS",
    "nodeCheckAdapterTest": "PASS",
    "nodeAdapterTest": "PASS",
    "testEvidenceScopeBuild": "PASS",
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
## 078A Quote Preview PDF Engine Canonical Test Evidence Scope

078A scopes canonical test evidence classification for the Quote Preview PDF Engine path.

Locked decision:
\`$LOCKED_DECISION\`

Base:

- 077D locked the existing surfaces canonical mapping as a local/static/read-only reference catalog.

Scope:

- classify existing test evidence candidates;
- do not execute real PDF/OCR/parser/calculator/Banxico/provider tests;
- do not create new extractor/parser/calculator/test engine;
- distinguish real PDF evidence, parser evidence, deterministic calculator evidence, rate/cache metadata, fixture evidence, smoke tests, and governance guardrail tests;
- prevent fixture tests from being treated as real PDF evidence;
- prevent governance tests from being treated as extraction proof;
- prevent provider integration tests from being treated as runtime-safe without a future gate;
- prevent preview summaries from becoming quote truth;
- prevent invented expected financial values.

Next:

- \`$NEXT\` must implement a local/static/read-only canonical test evidence registry only.

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
run node --check "$ADAPTER_TEST"
run node "$ADAPTER_TEST"
run python3 -m json.tool "$AUDIT_JSON"

run rg -n "$PHASE|$DECISION|$LOCKED_DECISION|$NEXT|canonical test evidence|fixture|governance|real PDF|no-effect|077D" \
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

if rg -n '"?(crmWrite|pipelineWrite|policyWrite|quoteWrite|taskCreate|calendarCreate|messageSend|authReal|providerRuntime|secretAccess|browserPersistence|realEngineExecution|realEffectsAllowed|realEffectsEnabled|backendConnection|pdfRead|ocrExecution|parserExecution|calculatorExecution|banxicoCall)"?\s*[:=]\s*true\b' "${SCOPED_FILES[@]}"; then
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
run git commit -m "docs: scope quote preview pdf canonical test evidence"
run git push origin HEAD:main

stage "STAGE 15 FINAL CHECKPOINT"
run git status --short --branch
run git log --oneline -10

SUMMARY=$(cat <<EOF
PASS_078A_QUOTE_PREVIEW_PDF_ENGINE_CANONICAL_TEST_EVIDENCE_SCOPE_COMMIT_PUSH_COMPLETE
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
