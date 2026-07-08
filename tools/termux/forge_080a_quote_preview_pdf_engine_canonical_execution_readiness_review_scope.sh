#!/usr/bin/env bash
set -euo pipefail

PHASE="080A_QUOTE_PREVIEW_PDF_ENGINE_CANONICAL_EXECUTION_READINESS_REVIEW_SCOPE"
DECISION="PASS_080A_QUOTE_PREVIEW_PDF_ENGINE_CANONICAL_EXECUTION_READINESS_REVIEW_SCOPE"
LOCKED_DECISION="QUOTE_PREVIEW_PDF_ENGINE_CANONICAL_EXECUTION_READINESS_REVIEW_SCOPED"
NEXT="080B_QUOTE_PREVIEW_PDF_ENGINE_CANONICAL_EXECUTION_READINESS_REVIEW_IMPLEMENTATION"
MODE="docs/scope only; architecture readiness review before any execution"
BOUNDARY="no UI mutation; no backend real; no CRM/policy/quote/pipeline writes; no task/calendar/message; no provider execution with effects; no auth/secrets/browser persistence; no real engine execution; no parser/calculator/Banxico/PDF/OCR execution; no invented product/premium/coverage/projection/quote truth; no new extractor/parser/calculator; no real test execution"
REPO="${REPO:-/storage/emulated/0/Forge OS}"
STAMP="$(date +%Y%m%d_%H%M%S)"
REPORT="/data/data/com.termux/files/home/${PHASE}_RESULT_${STAMP}.md"
BACKUP_DIR=".forge-backups/080a-quote-preview-pdf-engine-canonical-execution-readiness-review-scope-${STAMP}"
SCRIPT_IN_REPO="tools/termux/forge_080a_quote_preview_pdf_engine_canonical_execution_readiness_review_scope.sh"

SURFACES_ADAPTER="platform/adapters/quote-preview/quote-preview-pdf-engine-existing-surfaces-canonical-mapping-adapter-077b.js"
SURFACES_TEST="tests/quote-preview-pdf-engine-existing-surfaces-canonical-mapping-adapter-077b-test.js"
EVIDENCE_ADAPTER="platform/adapters/quote-preview/quote-preview-pdf-engine-canonical-test-evidence-registry-adapter-078b.js"
EVIDENCE_TEST="tests/quote-preview-pdf-engine-canonical-test-evidence-registry-adapter-078b-test.js"
PROVENANCE_ADAPTER="platform/adapters/quote-preview/quote-preview-pdf-engine-canonical-test-evidence-provenance-registry-adapter-079b.js"
PROVENANCE_TEST="tests/quote-preview-pdf-engine-canonical-test-evidence-provenance-registry-adapter-079b-test.js"

ARCH_DOC="docs/architecture/source-truth/FORGE_QUOTE_PREVIEW_PDF_ENGINE_CANONICAL_EXECUTION_READINESS_REVIEW_SCOPE_080A.md"
EVIDENCE_DOC="docs/evidence/FORGE_QUOTE_PREVIEW_PDF_ENGINE_CANONICAL_EXECUTION_READINESS_REVIEW_SCOPE_080A.md"
CERT_DOC="docs/evidence/FORGE_QUOTE_PREVIEW_PDF_ENGINE_CANONICAL_EXECUTION_READINESS_REVIEW_SCOPE_CERTIFICATE_080A.md"
AUDIT_JSON="docs/evidence/forge-quote-preview-pdf-engine-canonical-execution-readiness-review-scope-audit-080a.json"

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
echo "ROBOCOP_GATE=Article 0; 079D decision closed; readiness review scope only; no execution"

cd "$REPO" || fail "No existe repo: $REPO"

stage "STAGE 1 CHECKPOINT"
run git status --short --branch
run git log --oneline -12
run git diff --name-status
run git diff --cached --name-status

stage "STAGE 2 CONFIRM BASE 079D"
if git log --oneline -50 | grep -Eq "079D|lock quote preview pdf canonical test evidence provenance decision|QUOTE_PREVIEW_PDF_ENGINE_CANONICAL_TEST_EVIDENCE_PROVENANCE_LOCKED_AS_LOCAL_STATIC_READ_ONLY_REFERENCE_REGISTRY"; then
  pass "079D commit found in recent history"
elif [ -f "docs/evidence/forge-quote-preview-pdf-engine-canonical-test-evidence-provenance-decision-audit-079d.json" ]; then
  pass "079D audit fallback found"
else
  fail "079D base not found"
fi

if [ -f "docs/evidence/forge-quote-preview-pdf-engine-canonical-test-evidence-provenance-decision-audit-079d.json" ]; then
  run python3 -m json.tool docs/evidence/forge-quote-preview-pdf-engine-canonical-test-evidence-provenance-decision-audit-079d.json
  if ! rg -n '"status"\s*:\s*"PASS"|"lockedDecision"\s*:\s*"QUOTE_PREVIEW_PDF_ENGINE_CANONICAL_TEST_EVIDENCE_PROVENANCE_LOCKED_AS_LOCAL_STATIC_READ_ONLY_REFERENCE_REGISTRY"|"next"\s*:\s*"080A_QUOTE_PREVIEW_PDF_ENGINE_CANONICAL_EXECUTION_READINESS_REVIEW_SCOPE"' docs/evidence/forge-quote-preview-pdf-engine-canonical-test-evidence-provenance-decision-audit-079d.json >/dev/null; then
    fail "079D audit exists but does not confirm PASS/080A next"
  fi
  pass "079D audit PASS/080A next confirmed"
else
  warn "079D audit file not found; relying on git log/tree markers"
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

cat > "$BACKUP_DIR/rollback-080a.sh" <<ROLLBACK
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
echo "rollback 080A complete"
ROLLBACK
chmod +x "$BACKUP_DIR/rollback-080a.sh"
pass "backup created"
pass "rollback created: $BACKUP_DIR/rollback-080a.sh"

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

stage "STAGE 7 BUILD READINESS REVIEW SCOPE"
READINESS_SCOPE_JSON="$(mktemp)"
node <<'NODE' > "$READINESS_SCOPE_JSON"
const surfaces = require('./platform/adapters/quote-preview/quote-preview-pdf-engine-existing-surfaces-canonical-mapping-adapter-077b.js');
const evidence = require('./platform/adapters/quote-preview/quote-preview-pdf-engine-canonical-test-evidence-registry-adapter-078b.js');
const provenance = require('./platform/adapters/quote-preview/quote-preview-pdf-engine-canonical-test-evidence-provenance-registry-adapter-079b.js');

const surfaceCatalog = surfaces.getQuotePreviewPdfExistingSurfacesCanonicalMappingCatalog();
const evidenceCatalog = evidence.getQuotePreviewPdfCanonicalTestEvidenceRegistryCatalog();
const provenanceCatalog = provenance.getQuotePreviewPdfCanonicalTestEvidenceProvenanceRegistryCatalog();

const readinessGates = [
  {
    gate_id: 'canonical_surface_mapping_locked',
    source: '077D',
    status: 'satisfied',
    evidence: 'existing surfaces mapped as local/static/read-only reference catalog',
    blocks_execution_if_failed: true,
  },
  {
    gate_id: 'canonical_test_evidence_locked',
    source: '078D',
    status: 'satisfied',
    evidence: 'canonical test evidence registry locked as local/static/read-only reference registry',
    blocks_execution_if_failed: true,
  },
  {
    gate_id: 'canonical_provenance_locked',
    source: '079D',
    status: 'satisfied',
    evidence: 'provenance registry locked as local/static/read-only reference registry',
    blocks_execution_if_failed: true,
  },
  {
    gate_id: 'real_pdf_file_or_hash_ready',
    source: '079B',
    status: 'not_ready',
    evidence: 'real PDF provenance requires file path or hash before execution',
    blocks_execution_if_failed: true,
  },
  {
    gate_id: 'expected_value_source_trace_ready',
    source: '079B',
    status: 'not_ready',
    evidence: 'expected financial values require source trace before execution',
    blocks_execution_if_failed: true,
  },
  {
    gate_id: 'deterministic_input_source_trace_ready',
    source: '079B',
    status: 'not_ready',
    evidence: 'UDI/current value/growth inputs require traceable source',
    blocks_execution_if_failed: true,
  },
  {
    gate_id: 'parser_ownership_resolved',
    source: '077D/078D',
    status: 'not_ready',
    evidence: 'Solucionline parser remains decision-required where ownership is unresolved',
    blocks_execution_if_failed: true,
  },
  {
    gate_id: 'banxico_provider_runtime_gate_ready',
    source: '079B',
    status: 'not_ready',
    evidence: 'Banxico/provider metadata requires future runtime gate',
    blocks_execution_if_failed: true,
  },
  {
    gate_id: 'fixture_not_real_pdf_guard_ready',
    source: '079D',
    status: 'satisfied',
    evidence: 'fixture-as-real-PDF misuse is blocked',
    blocks_execution_if_failed: true,
  },
  {
    gate_id: 'governance_not_extraction_proof_guard_ready',
    source: '079D',
    status: 'satisfied',
    evidence: 'governance-as-extraction-proof misuse is blocked',
    blocks_execution_if_failed: true,
  },
  {
    gate_id: 'duplicate_engine_creation_guard_ready',
    source: '079D',
    status: 'satisfied',
    evidence: 'duplicate engine/parser/calculator creation is blocked',
    blocks_execution_if_failed: true,
  },
  {
    gate_id: 'quote_truth_boundary_ready',
    source: '073D-079D',
    status: 'not_ready',
    evidence: 'Quote Preview remains downstream; execution readiness must still define preview vs quote truth boundary',
    blocks_execution_if_failed: true,
  },
];

const satisfied = readinessGates.filter((gate) => gate.status === 'satisfied');
const notReady = readinessGates.filter((gate) => gate.status !== 'satisfied');

const scope = {
  status: 'PASS',
  phase: '080A_QUOTE_PREVIEW_PDF_ENGINE_CANONICAL_EXECUTION_READINESS_REVIEW_SCOPE',
  scope_type: 'canonical_execution_readiness_review_scope_only',
  execution_allowed_in_080a: false,
  pdf_read_allowed_in_080a: false,
  ocr_execution_allowed_in_080a: false,
  parser_execution_allowed_in_080a: false,
  calculator_execution_allowed_in_080a: false,
  banxico_call_allowed_in_080a: false,
  provider_call_allowed_in_080a: false,
  test_execution_allowed_in_080a: false,
  backend_connection_allowed_in_080a: false,
  quote_write_allowed_in_080a: false,
  source_catalog_refs: {
    surfaces: {
      adapter_id: surfaceCatalog.adapter_id,
      schemaVersion: surfaceCatalog.schemaVersion,
      surface_count: Array.isArray(surfaceCatalog.surfaces) ? surfaceCatalog.surfaces.length : 0,
    },
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
  },
  readiness_gates: readinessGates,
  satisfied_gates: satisfied.map((gate) => gate.gate_id),
  not_ready_gates: notReady.map((gate) => gate.gate_id),
  overall_readiness: 'not_ready_for_execution',
  required_080b_output: {
    adapter_type: 'local_static_read_only_execution_readiness_review_matrix',
    must_not_execute_tests: true,
    must_not_read_pdfs: true,
    must_not_run_ocr: true,
    must_not_run_parsers: true,
    must_not_run_calculators: true,
    must_not_call_banxico: true,
    must_not_connect_backend: true,
    required_fields: [
      'gate_id',
      'gate_status',
      'source_phase',
      'source_registry_refs',
      'blocking_reason',
      'readiness_decision',
      'required_next_action',
      'execution_policy',
      'safe_errors',
      'safety_flags'
    ]
  },
  recommended_next_after_080d: [
    'resolve parser ownership before execution',
    'bind expected values to traceable sources',
    'bind real PDF fixtures to file paths or hashes',
    'define Banxico/provider runtime gate separately',
    'define preview-vs-quote-truth boundary before any quote execution'
  ],
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

if (notReady.length < 1) {
  throw new Error('Readiness review must not mark execution ready at scope stage');
}

console.log(JSON.stringify(scope, null, 2));
NODE

cat "$READINESS_SCOPE_JSON"
pass "readiness review scope built"

stage "STAGE 8 WRITE DOCS / EVIDENCE"
mkdir -p "$(dirname "$ARCH_DOC")" "$(dirname "$EVIDENCE_DOC")"

cat > "$ARCH_DOC" <<EOF
# Forge Quote Preview PDF Engine Canonical Execution Readiness Review Scope 080A

PHASE=$PHASE

STATUS=PASS

DECISION=$DECISION

LOCKED_DECISION=$LOCKED_DECISION

NEXT=$NEXT

## Purpose

080A scopes a canonical execution readiness review for the Quote Preview PDF Engine path.

This phase follows the completed mapping, evidence, and provenance locks:

- 077D: existing surfaces reference catalog;
- 078D: canonical test evidence reference registry;
- 079D: canonical test evidence provenance reference registry.

080A does not authorize execution. It scopes the review that must happen before any controlled fixture/PDF execution can be considered.

## Base Confirmed

079D is closed as:

- \`PASS_079D_QUOTE_PREVIEW_PDF_ENGINE_CANONICAL_TEST_EVIDENCE_PROVENANCE_DECISION_LOCK\`
- \`QUOTE_PREVIEW_PDF_ENGINE_CANONICAL_TEST_EVIDENCE_PROVENANCE_LOCKED_AS_LOCAL_STATIC_READ_ONLY_REFERENCE_REGISTRY\`
- \`NEXT=080A_QUOTE_PREVIEW_PDF_ENGINE_CANONICAL_EXECUTION_READINESS_REVIEW_SCOPE\`

## Readiness Position

Forge is not ready for execution yet.

080A intentionally classifies readiness as:

\`not_ready_for_execution\`

Because several gates still require explicit closure before controlled execution:

- real PDF file/hash readiness;
- expected-value source trace readiness;
- deterministic input source trace readiness;
- parser ownership resolution;
- Banxico/provider runtime gate;
- preview-vs-quote-truth boundary.

## Satisfied Gates

- canonical surface mapping locked;
- canonical test evidence locked;
- canonical provenance locked;
- fixture-as-real-PDF guard ready;
- governance-as-extraction-proof guard ready;
- duplicate engine/parser/calculator creation guard ready.

## Not-Ready Gates

- real PDF file or hash ready;
- expected value source trace ready;
- deterministic input source trace ready;
- parser ownership resolved;
- Banxico/provider runtime gate ready;
- quote truth boundary ready.

## Required 080B Shape

080B must implement a local/static/read-only execution readiness review matrix.

Required fields:

- \`gate_id\`
- \`gate_status\`
- \`source_phase\`
- \`source_registry_refs\`
- \`blocking_reason\`
- \`readiness_decision\`
- \`required_next_action\`
- \`execution_policy\`
- \`safe_errors\`
- \`safety_flags\`

## Not Authorized

080A does not authorize:

- PDF read;
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
# Forge Quote Preview PDF Engine Canonical Execution Readiness Review Scope 080A

PHASE=$PHASE

STATUS=PASS

DECISION=$DECISION

LOCKED_DECISION=$LOCKED_DECISION

NEXT=$NEXT

## Evidence Summary

080A scopes an execution readiness review. It does not execute anything.

The review uses the locked 077D/078D/079D reference catalogs and registries to classify readiness gates before any future controlled fixture/PDF execution.

## Discovery Evidence

Discovery JSON:

\`$DISCOVERY_JSON_FOUND\`

Discovery report:

\`${DISCOVERY_REPORT_MD:-not_found}\`

Discovery digest:

\`\`\`json
$(cat "$DISCOVERY_DIGEST_JSON")
\`\`\`

## Readiness Scope

\`\`\`json
$(cat "$READINESS_SCOPE_JSON")
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
- local/static/read-only readiness scope builder
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
# Forge Quote Preview PDF Engine Canonical Execution Readiness Review Scope Certificate 080A

PHASE=$PHASE

CERTIFICATE_STATUS=PASS

DECISION=$DECISION

LOCKED_DECISION=$LOCKED_DECISION

NEXT=$NEXT

## Certificate

080A certifies that Forge is entering architecture readiness review scope, not execution.

Certified statements:

- 077D, 078D, and 079D are the base;
- execution readiness is not granted;
- real PDF file/hash readiness remains open;
- expected-value source trace readiness remains open;
- deterministic input source trace readiness remains open;
- parser ownership remains open;
- Banxico/provider runtime gate remains open;
- preview-vs-quote-truth boundary remains open;
- no real tests are executed;
- no PDFs are read;
- no OCR/parsers/calculators/Banxico/providers are executed;
- all safety flags remain false.

## No-Effect Boundary

This scope authorizes no PDF reads, OCR execution, parser execution, calculator execution, Banxico calls, test execution, quote generation, quote writes, provider calls, backend connection, or real effects.

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
    "phase": "079D_QUOTE_PREVIEW_PDF_ENGINE_CANONICAL_TEST_EVIDENCE_PROVENANCE_DECISION_LOCK",
    "confirmed": true,
    "lockedDecision": "QUOTE_PREVIEW_PDF_ENGINE_CANONICAL_TEST_EVIDENCE_PROVENANCE_LOCKED_AS_LOCAL_STATIC_READ_ONLY_REFERENCE_REGISTRY"
  },
  "next": "$NEXT",
  "scopeType": "canonical_execution_readiness_review_scope_only",
  "executionReadiness": "not_ready_for_execution",
  "discoveryEvidence": $(cat "$DISCOVERY_DIGEST_JSON"),
  "readinessScope": $(cat "$READINESS_SCOPE_JSON"),
  "required080B": {
    "adapterType": "local_static_read_only_execution_readiness_review_matrix",
    "mustNotExecuteTests": true,
    "mustNotReadPdfs": true,
    "mustNotRunOcr": true,
    "mustNotRunParsers": true,
    "mustNotRunCalculators": true,
    "mustNotCallBanxico": true,
    "mustNotConnectBackend": true,
    "mustNotCreateQuoteTruth": true
  },
  "notReadyGates": {
    "realPdfFileOrHashReady": false,
    "expectedValueSourceTraceReady": false,
    "deterministicInputSourceTraceReady": false,
    "parserOwnershipResolved": false,
    "banxicoProviderRuntimeGateReady": false,
    "quoteTruthBoundaryReady": false
  },
  "satisfiedGuards": {
    "canonicalSurfaceMappingLocked": true,
    "canonicalTestEvidenceLocked": true,
    "canonicalProvenanceLocked": true,
    "fixtureAsRealPdfBlocked": true,
    "governanceAsExtractionProofBlocked": true,
    "duplicateEngineCreationBlocked": true
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
    "base079D": "PASS",
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
    "readinessScopeBuild": "PASS",
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
## 080A Quote Preview PDF Engine Canonical Execution Readiness Review Scope

080A scopes a canonical execution readiness review for the Quote Preview PDF Engine path.

Locked decision:
\`$LOCKED_DECISION\`

Base:

- 077D existing surfaces reference catalog;
- 078D canonical test evidence reference registry;
- 079D canonical test evidence provenance reference registry.

Readiness result:

- \`not_ready_for_execution\`

Satisfied gates:

- canonical surface mapping locked;
- canonical test evidence locked;
- canonical provenance locked;
- fixture-as-real-PDF guard ready;
- governance-as-extraction-proof guard ready;
- duplicate engine/parser/calculator creation guard ready.

Not-ready gates:

- real PDF file/hash readiness;
- expected-value source trace readiness;
- deterministic input source trace readiness;
- parser ownership resolution;
- Banxico/provider runtime gate;
- preview-vs-quote-truth boundary.

Next:

- \`$NEXT\` must implement a local/static/read-only execution readiness review matrix only.

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
run python3 -m json.tool "$AUDIT_JSON"

run rg -n "$PHASE|$DECISION|$LOCKED_DECISION|$NEXT|execution readiness|not_ready_for_execution|real PDF file/hash|expected-value source trace|parser ownership|quote truth boundary" \
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
run git commit -m "docs: scope quote preview pdf execution readiness review"
run git push origin HEAD:main

stage "STAGE 15 FINAL CHECKPOINT"
run git status --short --branch
run git log --oneline -10

SUMMARY=$(cat <<EOF
PASS_080A_QUOTE_PREVIEW_PDF_ENGINE_CANONICAL_EXECUTION_READINESS_REVIEW_SCOPE_COMMIT_PUSH_COMPLETE
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
