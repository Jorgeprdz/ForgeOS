#!/usr/bin/env bash
set -euo pipefail

PHASE="080D_QUOTE_PREVIEW_PDF_ENGINE_CANONICAL_EXECUTION_READINESS_REVIEW_DECISION_LOCK"
DECISION="PASS_080D_QUOTE_PREVIEW_PDF_ENGINE_CANONICAL_EXECUTION_READINESS_REVIEW_DECISION_LOCK"
LOCKED_DECISION="QUOTE_PREVIEW_PDF_ENGINE_CANONICAL_EXECUTION_READINESS_REVIEW_LOCKED_AS_LOCAL_STATIC_READ_ONLY_NOT_READY_REFERENCE_MATRIX"
NEXT="081A_QUOTE_PREVIEW_PDF_ENGINE_REAL_PDF_FILE_HASH_PROVENANCE_SCOPE"
MODE="docs/decision lock only"
BOUNDARY="no UI mutation; no backend real; no CRM/policy/quote/pipeline writes; no task/calendar/message; no provider execution with effects; no auth/secrets/browser persistence; no real engine execution; no parser/calculator/Banxico/PDF/OCR execution; no invented product/premium/coverage/projection/quote truth; no new extractor/parser/calculator; no real test execution"
REPO="${REPO:-/storage/emulated/0/Forge OS}"
STAMP="$(date +%Y%m%d_%H%M%S)"
REPORT="/data/data/com.termux/files/home/${PHASE}_RESULT_${STAMP}.md"
BACKUP_DIR=".forge-backups/080d-quote-preview-pdf-engine-canonical-execution-readiness-review-decision-lock-${STAMP}"
SCRIPT_IN_REPO="tools/termux/forge_080d_quote_preview_pdf_engine_canonical_execution_readiness_review_decision_lock.sh"

SURFACES_ADAPTER="platform/adapters/quote-preview/quote-preview-pdf-engine-existing-surfaces-canonical-mapping-adapter-077b.js"
SURFACES_TEST="tests/quote-preview-pdf-engine-existing-surfaces-canonical-mapping-adapter-077b-test.js"
EVIDENCE_ADAPTER="platform/adapters/quote-preview/quote-preview-pdf-engine-canonical-test-evidence-registry-adapter-078b.js"
EVIDENCE_TEST="tests/quote-preview-pdf-engine-canonical-test-evidence-registry-adapter-078b-test.js"
PROVENANCE_ADAPTER="platform/adapters/quote-preview/quote-preview-pdf-engine-canonical-test-evidence-provenance-registry-adapter-079b.js"
PROVENANCE_TEST="tests/quote-preview-pdf-engine-canonical-test-evidence-provenance-registry-adapter-079b-test.js"
READINESS_ADAPTER="platform/adapters/quote-preview/quote-preview-pdf-engine-canonical-execution-readiness-review-matrix-adapter-080b.js"
READINESS_TEST="tests/quote-preview-pdf-engine-canonical-execution-readiness-review-matrix-adapter-080b-test.js"

ARCH_DOC="docs/architecture/source-truth/FORGE_QUOTE_PREVIEW_PDF_ENGINE_CANONICAL_EXECUTION_READINESS_REVIEW_DECISION_LOCK_080D.md"
EVIDENCE_DOC="docs/evidence/FORGE_QUOTE_PREVIEW_PDF_ENGINE_CANONICAL_EXECUTION_READINESS_REVIEW_DECISION_LOCK_080D.md"
CERT_DOC="docs/evidence/FORGE_QUOTE_PREVIEW_PDF_ENGINE_CANONICAL_EXECUTION_READINESS_REVIEW_DECISION_LOCK_CERTIFICATE_080D.md"
AUDIT_JSON="docs/evidence/forge-quote-preview-pdf-engine-canonical-execution-readiness-review-decision-audit-080d.json"

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
echo "ROBOCOP_GATE=Article 0; 080C QA closed; decision lock only; execution remains blocked"

cd "$REPO" || fail "No existe repo: $REPO"

stage "STAGE 1 CHECKPOINT"
run git status --short --branch
run git log --oneline -12
run git diff --name-status
run git diff --cached --name-status

stage "STAGE 2 CONFIRM BASE 080C"
if git log --oneline -50 | grep -Eq "080C|lock quote preview pdf execution readiness review qa|QUOTE_PREVIEW_PDF_ENGINE_CANONICAL_EXECUTION_READINESS_REVIEW_QA_LOCKED"; then
  pass "080C commit found in recent history"
elif [ -f "docs/evidence/forge-quote-preview-pdf-engine-canonical-execution-readiness-review-qa-audit-080c.json" ]; then
  pass "080C audit fallback found"
else
  fail "080C base not found"
fi

if [ -f "docs/evidence/forge-quote-preview-pdf-engine-canonical-execution-readiness-review-qa-audit-080c.json" ]; then
  run python3 -m json.tool docs/evidence/forge-quote-preview-pdf-engine-canonical-execution-readiness-review-qa-audit-080c.json
  if ! rg -n '"status"\s*:\s*"PASS"|"lockedDecision"\s*:\s*"QUOTE_PREVIEW_PDF_ENGINE_CANONICAL_EXECUTION_READINESS_REVIEW_QA_LOCKED"|"next"\s*:\s*"080D_QUOTE_PREVIEW_PDF_ENGINE_CANONICAL_EXECUTION_READINESS_REVIEW_DECISION_LOCK"' docs/evidence/forge-quote-preview-pdf-engine-canonical-execution-readiness-review-qa-audit-080c.json >/dev/null; then
    fail "080C audit exists but does not confirm PASS/080D next"
  fi
  pass "080C audit PASS/080D next confirmed"
else
  warn "080C audit file not found; relying on git log/tree markers"
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

cat > "$BACKUP_DIR/rollback-080d.sh" <<ROLLBACK
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
echo "rollback 080D complete"
ROLLBACK
chmod +x "$BACKUP_DIR/rollback-080d.sh"
pass "backup created"
pass "rollback created: $BACKUP_DIR/rollback-080d.sh"

stage "STAGE 6 REVALIDATE 080B/080C BASIS"
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

stage "STAGE 7 DECISION ASSERTIONS"
DECISION_QA_JSON="$(mktemp)"
node <<'NODE' > "$DECISION_QA_JSON"
const assert = require("node:assert/strict");
const readiness = require("./platform/adapters/quote-preview/quote-preview-pdf-engine-canonical-execution-readiness-review-matrix-adapter-080b.js");

function resultOk(result) {
  if (result === true) return true;
  if (result && result.ok === true) return true;
  if (result && result.valid === true) return true;
  if (result && result.isValid === true) return true;
  if (result && Array.isArray(result.errors) && result.errors.length === 0) return true;
  return false;
}

assert.equal(readiness.ADAPTER_ID, "forge.quote_preview.pdf_engine.canonical_execution_readiness.review_matrix.adapter.v1");
assert.equal(readiness.SCHEMA_VERSION, "forge.quote_preview.pdf_engine.canonical_execution_readiness.review_matrix.v1");
assert.equal(readiness.MODE, "read_only");
assert.equal(readiness.ROUTE_CLASS, "preview_safe");

const catalog = readiness.getQuotePreviewPdfCanonicalExecutionReadinessReviewMatrixCatalog();
assert(catalog && typeof catalog === "object");
assert.equal(catalog.schemaVersion, readiness.SCHEMA_VERSION);
assert.equal(catalog.domainId, "quote_preview_pdf_engine_canonical_execution_readiness_review");
assert.equal(catalog.matrix_type, "local_static_read_only_execution_readiness_review_matrix");
assert.equal(catalog.overall_readiness, readiness.READINESS_DECISIONS.NOT_READY_FOR_EXECUTION);
assert.equal(catalog.product_intelligence_upstream, true);
assert.equal(catalog.quote_preview_downstream, true);
assert(Array.isArray(catalog.gates));
assert(catalog.gates.length >= 10);
assert.equal(resultOk(readiness.validateReadinessReviewMatrixCatalog(catalog)), true);

for (const flag of [
  "execution_allowed_in_matrix",
  "pdf_read_allowed_in_matrix",
  "ocr_execution_allowed_in_matrix",
  "parser_execution_allowed_in_matrix",
  "calculator_execution_allowed_in_matrix",
  "banxico_call_allowed_in_matrix",
  "provider_call_allowed_in_matrix",
  "test_execution_allowed_in_matrix",
  "backend_connection_allowed_in_matrix",
  "quote_write_allowed_in_matrix",
]) {
  assert.equal(catalog[flag], false, `${flag} must be false`);
}

const satisfied = [
  "canonical_surface_mapping_locked",
  "canonical_test_evidence_locked",
  "canonical_provenance_locked",
  "fixture_not_real_pdf_guard_ready",
  "governance_not_extraction_proof_guard_ready",
  "duplicate_engine_creation_guard_ready",
];

const blocking = [
  "real_pdf_file_or_hash_ready",
  "expected_value_source_trace_ready",
  "deterministic_input_source_trace_ready",
  "parser_ownership_resolved",
  "banxico_provider_runtime_gate_ready",
  "quote_truth_boundary_ready",
];

for (const gateId of satisfied) {
  const gate = readiness.getReadinessGateById(gateId);
  assert.equal(gate.gate_status, readiness.GATE_STATUSES.SATISFIED, `${gateId} must be satisfied`);
  assert.equal(gate.readiness_decision, readiness.READINESS_DECISIONS.READY, `${gateId} must be ready`);
}

for (const gateId of blocking) {
  const gate = readiness.getReadinessGateById(gateId);
  assert.notEqual(gate.readiness_decision, readiness.READINESS_DECISIONS.READY, `${gateId} must not be ready`);
  assert(gate.safe_errors.length > 0, `${gateId} must have safe errors`);
}

const pdfGate = readiness.getReadinessGateById("real_pdf_file_or_hash_ready");
assert.equal(pdfGate.gate_status, readiness.GATE_STATUSES.NOT_READY);
assert(pdfGate.safe_errors.includes(readiness.SAFE_ERROR_CODES.PDF_FILE_OR_HASH_REQUIRED));

const expectedGate = readiness.getReadinessGateById("expected_value_source_trace_ready");
assert.equal(expectedGate.gate_status, readiness.GATE_STATUSES.NOT_READY);
assert(expectedGate.safe_errors.includes(readiness.SAFE_ERROR_CODES.EXPECTED_VALUE_SOURCE_TRACE_REQUIRED));

const deterministicGate = readiness.getReadinessGateById("deterministic_input_source_trace_ready");
assert.equal(deterministicGate.gate_status, readiness.GATE_STATUSES.NOT_READY);
assert(deterministicGate.safe_errors.includes(readiness.SAFE_ERROR_CODES.DETERMINISTIC_INPUT_SOURCE_TRACE_REQUIRED));

const parserGate = readiness.getReadinessGateById("parser_ownership_resolved");
assert.equal(parserGate.gate_status, readiness.GATE_STATUSES.DECISION_REQUIRED);
assert.equal(parserGate.readiness_decision, readiness.READINESS_DECISIONS.REVIEW_REQUIRED);
assert(parserGate.safe_errors.includes(readiness.SAFE_ERROR_CODES.PARSER_OWNERSHIP_DECISION_REQUIRED));

const banxicoGate = readiness.getReadinessGateById("banxico_provider_runtime_gate_ready");
assert.equal(banxicoGate.gate_status, readiness.GATE_STATUSES.NOT_READY);
assert.equal(banxicoGate.execution_policy, readiness.EXECUTION_POLICIES.BLOCK_RUNTIME_PROVIDER_UNTIL_GATE);
assert(banxicoGate.safe_errors.includes(readiness.SAFE_ERROR_CODES.BANXICO_RUNTIME_GATE_REQUIRED));

const quoteTruthGate = readiness.getReadinessGateById("quote_truth_boundary_ready");
assert.equal(quoteTruthGate.gate_status, readiness.GATE_STATUSES.NOT_READY);
assert.equal(quoteTruthGate.execution_policy, readiness.EXECUTION_POLICIES.BLOCK_QUOTE_TRUTH_UNTIL_BOUNDARY);
assert(quoteTruthGate.safe_errors.includes(readiness.SAFE_ERROR_CODES.QUOTE_TRUTH_BOUNDARY_REQUIRED));

const notReady = readiness.getNotReadyExecutionGates();
for (const gateId of blocking) {
  assert(notReady.some((gate) => gate.gate_id === gateId), `${gateId} must remain not ready`);
}

const missing = readiness.getReadinessGateById("unknown_gate_for_080d");
assert.equal(missing.readModelStatus, "error");
assert.equal(missing.readiness_decision, readiness.READINESS_DECISIONS.NOT_READY_FOR_EXECUTION);
assert(missing.safe_errors.includes(readiness.SAFE_ERROR_CODES.READINESS_GATE_NOT_MAPPED));
assert(missing.safe_errors.includes(readiness.SAFE_ERROR_CODES.EXECUTION_NOT_READY));
assert.equal(resultOk(readiness.validateReadinessGateShape(missing)), true);

for (const [key, value] of Object.entries(readiness.DEFAULT_SAFETY_FLAGS || {})) {
  assert.equal(value, false, `DEFAULT_SAFETY_FLAGS.${key} must be false`);
}

for (const gate of catalog.gates) {
  for (const [key, value] of Object.entries(gate.safety_flags || {})) {
    assert.equal(value, false, `${gate.gate_id}.${key} must be false`);
  }
}

const combined = JSON.stringify({
  catalog,
  missing,
  flags: readiness.DEFAULT_SAFETY_FLAGS,
  safeErrors: readiness.SAFE_ERROR_CODES,
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
  '"testExecution":' + 'true'
];

for (const fragment of forbiddenFragments) {
  assert(!combined.includes(fragment), `forbidden true flag found: ${fragment}`);
}

console.log(JSON.stringify({
  status: "PASS",
  locked_as: "local_static_read_only_not_ready_reference_matrix",
  adapter_id: readiness.ADAPTER_ID,
  schema_version: readiness.SCHEMA_VERSION,
  catalog_validated: true,
  overall_readiness: catalog.overall_readiness,
  satisfied_gates: satisfied,
  blocking_gates: blocking,
  first_next_blocker: "real_pdf_file_or_hash_ready",
  next_scope: "081A_QUOTE_PREVIEW_PDF_ENGINE_REAL_PDF_FILE_HASH_PROVENANCE_SCOPE",
  execution_remains_blocked: true,
  pdf_read_blocked: true,
  ocr_execution_blocked: true,
  parser_execution_blocked: true,
  calculator_execution_blocked: true,
  banxico_call_blocked: true,
  provider_call_blocked: true,
  test_execution_blocked: true,
  backend_connection_blocked: true,
  quote_write_blocked: true,
  all_safety_flags_false: true
}, null, 2));
NODE

cat "$DECISION_QA_JSON"
pass "decision assertions passed"

stage "STAGE 8 WRITE DOCS / EVIDENCE"
mkdir -p "$(dirname "$ARCH_DOC")" "$(dirname "$EVIDENCE_DOC")"

cat > "$ARCH_DOC" <<EOF
# Forge Quote Preview PDF Engine Canonical Execution Readiness Review Decision Lock 080D

PHASE=$PHASE

STATUS=PASS

DECISION=$DECISION

LOCKED_DECISION=$LOCKED_DECISION

NEXT=$NEXT

## Purpose

080D decision-locks the 080B/080C execution readiness review matrix as a local/static/read-only not-ready reference matrix.

This phase freezes the readiness decision:

\`not_ready_for_execution\`

Yes, the machine was told "not yet." A rare and beautiful moment of restraint.

## Base Confirmed

080C is closed as:

- \`PASS_080C_QUOTE_PREVIEW_PDF_ENGINE_CANONICAL_EXECUTION_READINESS_REVIEW_QA_LOCK\`
- \`QUOTE_PREVIEW_PDF_ENGINE_CANONICAL_EXECUTION_READINESS_REVIEW_QA_LOCKED\`
- \`NEXT=080D_QUOTE_PREVIEW_PDF_ENGINE_CANONICAL_EXECUTION_READINESS_REVIEW_DECISION_LOCK\`

## Locked Meaning

The 080B readiness matrix is approved only as:

- local/static;
- read-only;
- reference matrix;
- readiness classification;
- execution blocker registry;
- no-effect architecture guardrail.

## Confirmed Satisfied Gates

- canonical surface mapping locked;
- canonical test evidence locked;
- canonical provenance locked;
- fixture-as-real-PDF guard ready;
- governance-as-extraction-proof guard ready;
- duplicate engine/parser/calculator creation guard ready.

## Confirmed Blocking Gates

Forge remains blocked by:

- real PDF file/hash readiness;
- expected-value source trace readiness;
- deterministic input source trace readiness;
- parser ownership resolution;
- Banxico/provider runtime gate;
- preview-vs-quote-truth boundary.

## Next Architectural Unlock

081A may scope real PDF file/hash provenance only.

081A must not read PDFs, run OCR, execute parsers, execute calculators, call Banxico/providers, connect backend, write quotes, or create real effects.

081A may only define how real PDF candidate evidence would be bound to explicit file path/hash provenance before any future execution gate.

## Not Authorized

080D does not authorize:

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
# Forge Quote Preview PDF Engine Canonical Execution Readiness Review Decision Lock 080D

PHASE=$PHASE

STATUS=PASS

DECISION=$DECISION

LOCKED_DECISION=$LOCKED_DECISION

NEXT=$NEXT

## Evidence Summary

080D locks the 080B/080C execution readiness review matrix as a local/static/read-only not-ready reference matrix.

The lock confirms \`not_ready_for_execution\`.

## Discovery Evidence

Discovery JSON:

\`$DISCOVERY_JSON_FOUND\`

Discovery report:

\`${DISCOVERY_REPORT_MD:-not_found}\`

Discovery digest:

\`\`\`json
$(cat "$DISCOVERY_DIGEST_JSON")
\`\`\`

## Decision Assertions

\`\`\`json
$(cat "$DECISION_QA_JSON")
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
- decision assertion Node script
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
# Forge Quote Preview PDF Engine Canonical Execution Readiness Review Decision Lock Certificate 080D

PHASE=$PHASE

CERTIFICATE_STATUS=PASS

DECISION=$DECISION

LOCKED_DECISION=$LOCKED_DECISION

NEXT=$NEXT

## Certificate

080D certifies that the Quote Preview PDF Engine Canonical Execution Readiness Review matrix is decision-locked.

Certified statements:

- readiness matrix is local/static/read-only;
- overall readiness is \`not_ready_for_execution\`;
- satisfied gates remain satisfied;
- blocking gates remain blocking;
- execution remains blocked;
- real PDF file/hash readiness is the first next blocker;
- next work is real PDF file/hash provenance scope only;
- no real tests are executed;
- no PDFs are read;
- no OCR/parsers/calculators/Banxico/providers are executed;
- no backend or quote write is authorized;
- all safety flags remain false.

## No-Effect Boundary

This decision lock authorizes no PDF reads, OCR execution, parser execution, calculator execution, Banxico calls, test execution, quote generation, quote writes, provider calls, backend connection, or real effects.

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
    "phase": "080C_QUOTE_PREVIEW_PDF_ENGINE_CANONICAL_EXECUTION_READINESS_REVIEW_QA_LOCK",
    "confirmed": true,
    "lockedDecision": "QUOTE_PREVIEW_PDF_ENGINE_CANONICAL_EXECUTION_READINESS_REVIEW_QA_LOCKED"
  },
  "next": "$NEXT",
  "lockedAs": "local_static_read_only_not_ready_reference_matrix",
  "readinessAdapter": "$READINESS_ADAPTER",
  "readinessTest": "$READINESS_TEST",
  "decisionAssertions": $(cat "$DECISION_QA_JSON"),
  "discoveryEvidence": $(cat "$DISCOVERY_DIGEST_JSON"),
  "confirmed": {
    "overallReadiness": "not_ready_for_execution",
    "canonicalSurfaceMappingLocked": true,
    "canonicalTestEvidenceLocked": true,
    "canonicalProvenanceLocked": true,
    "fixtureAsRealPdfGuardReady": true,
    "governanceAsExtractionProofGuardReady": true,
    "duplicateEngineCreationGuardReady": true,
    "realPdfFileHashReadinessBlocked": true,
    "expectedValueSourceTraceReadinessBlocked": true,
    "deterministicInputSourceTraceReadinessBlocked": true,
    "parserOwnershipDecisionRequired": true,
    "banxicoProviderRuntimeGateBlocked": true,
    "quoteTruthBoundaryBlocked": true,
    "allSafetyFlagsFalse": true
  },
  "nextScope": {
    "phase": "$NEXT",
    "purpose": "real_pdf_file_hash_provenance_scope",
    "firstBlockingGate": "real_pdf_file_or_hash_ready",
    "implementationReadiness": false,
    "executionAllowed": false
  },
  "notAuthorized": {
    "pdfRead": false,
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
    "base080C": "PASS",
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
    "decisionAssertions": "PASS",
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
## 080D Quote Preview PDF Engine Canonical Execution Readiness Review Decision Lock

080D decision-locks the 080B/080C execution readiness review matrix as a local/static/read-only not-ready reference matrix.

Locked decision:
\`$LOCKED_DECISION\`

Readiness decision:

- \`not_ready_for_execution\`

Satisfied gates:

- canonical surface mapping locked;
- canonical test evidence locked;
- canonical provenance locked;
- fixture-as-real-PDF guard ready;
- governance-as-extraction-proof guard ready;
- duplicate engine/parser/calculator creation guard ready.

Blocking gates:

- real PDF file/hash readiness;
- expected-value source trace readiness;
- deterministic input source trace readiness;
- parser ownership resolution;
- Banxico/provider runtime gate;
- preview-vs-quote-truth boundary.

Next:

- \`$NEXT\` may scope real PDF file/hash provenance only.
- No PDF/OCR/parser/calculator/Banxico/provider/test execution is authorized.

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

run rg -n "$PHASE|$DECISION|$LOCKED_DECISION|$NEXT|not_ready_for_execution|real PDF file/hash|expected-value source trace|parser ownership|quote truth boundary|No PDF/OCR/parser" \
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
  "$SURFACES_ADAPTER"
  "$SURFACES_TEST"
  "$EVIDENCE_ADAPTER"
  "$EVIDENCE_TEST"
  "$PROVENANCE_ADAPTER"
  "$PROVENANCE_TEST"
  "$READINESS_ADAPTER"
  "$READINESS_TEST"
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
run git commit -m "docs: lock quote preview pdf execution readiness review decision"
run git push origin HEAD:main

stage "STAGE 15 FINAL CHECKPOINT"
run git status --short --branch
run git log --oneline -10

SUMMARY=$(cat <<EOF
PASS_080D_QUOTE_PREVIEW_PDF_ENGINE_CANONICAL_EXECUTION_READINESS_REVIEW_DECISION_LOCK_COMMIT_PUSH_COMPLETE
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
