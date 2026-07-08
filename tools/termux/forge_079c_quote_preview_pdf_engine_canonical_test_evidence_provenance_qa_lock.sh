#!/usr/bin/env bash
set -euo pipefail

PHASE="079C_QUOTE_PREVIEW_PDF_ENGINE_CANONICAL_TEST_EVIDENCE_PROVENANCE_QA_LOCK"
DECISION="PASS_079C_QUOTE_PREVIEW_PDF_ENGINE_CANONICAL_TEST_EVIDENCE_PROVENANCE_QA_LOCK"
LOCKED_DECISION="QUOTE_PREVIEW_PDF_ENGINE_CANONICAL_TEST_EVIDENCE_PROVENANCE_QA_LOCKED"
NEXT="079D_QUOTE_PREVIEW_PDF_ENGINE_CANONICAL_TEST_EVIDENCE_PROVENANCE_DECISION_LOCK"
MODE="QA/docs/evidence only"
BOUNDARY="no UI mutation; no backend real; no CRM/policy/quote/pipeline writes; no task/calendar/message; no provider execution with effects; no auth/secrets/browser persistence; no real engine execution; no parser/calculator/Banxico/PDF/OCR execution; no invented product/premium/coverage/projection/quote truth; no new extractor/parser/calculator; no real test execution"
REPO="${REPO:-/storage/emulated/0/Forge OS}"
STAMP="$(date +%Y%m%d_%H%M%S)"
REPORT="/data/data/com.termux/files/home/${PHASE}_RESULT_${STAMP}.md"
BACKUP_DIR=".forge-backups/079c-quote-preview-pdf-engine-canonical-test-evidence-provenance-qa-lock-${STAMP}"
SCRIPT_IN_REPO="tools/termux/forge_079c_quote_preview_pdf_engine_canonical_test_evidence_provenance_qa_lock.sh"

SURFACES_ADAPTER="platform/adapters/quote-preview/quote-preview-pdf-engine-existing-surfaces-canonical-mapping-adapter-077b.js"
SURFACES_TEST="tests/quote-preview-pdf-engine-existing-surfaces-canonical-mapping-adapter-077b-test.js"
EVIDENCE_ADAPTER="platform/adapters/quote-preview/quote-preview-pdf-engine-canonical-test-evidence-registry-adapter-078b.js"
EVIDENCE_TEST="tests/quote-preview-pdf-engine-canonical-test-evidence-registry-adapter-078b-test.js"
ADAPTER="platform/adapters/quote-preview/quote-preview-pdf-engine-canonical-test-evidence-provenance-registry-adapter-079b.js"
TEST="tests/quote-preview-pdf-engine-canonical-test-evidence-provenance-registry-adapter-079b-test.js"

ARCH_DOC="docs/architecture/source-truth/FORGE_QUOTE_PREVIEW_PDF_ENGINE_CANONICAL_TEST_EVIDENCE_PROVENANCE_QA_LOCK_079C.md"
EVIDENCE_DOC="docs/evidence/FORGE_QUOTE_PREVIEW_PDF_ENGINE_CANONICAL_TEST_EVIDENCE_PROVENANCE_QA_LOCK_079C.md"
CERT_DOC="docs/evidence/FORGE_QUOTE_PREVIEW_PDF_ENGINE_CANONICAL_TEST_EVIDENCE_PROVENANCE_QA_LOCK_CERTIFICATE_079C.md"
AUDIT_JSON="docs/evidence/forge-quote-preview-pdf-engine-canonical-test-evidence-provenance-qa-audit-079c.json"

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
echo "ROBOCOP_GATE=Article 0; 079B implementation closed; QA lock only"

cd "$REPO" || fail "No existe repo: $REPO"

stage "STAGE 1 CHECKPOINT"
run git status --short --branch
run git log --oneline -12
run git diff --name-status
run git diff --cached --name-status

stage "STAGE 2 CONFIRM BASE 079B"
if git log --oneline -50 | grep -Eq "079B|implement quote preview pdf canonical test evidence provenance registry|QUOTE_PREVIEW_PDF_ENGINE_CANONICAL_TEST_EVIDENCE_PROVENANCE_LOCAL_STATIC_READ_ONLY_IMPLEMENTED"; then
  pass "079B commit found in recent history"
elif [ -f "docs/evidence/forge-quote-preview-pdf-engine-canonical-test-evidence-provenance-implementation-audit-079b.json" ]; then
  pass "079B audit fallback found"
else
  fail "079B base not found"
fi

if [ -f "docs/evidence/forge-quote-preview-pdf-engine-canonical-test-evidence-provenance-implementation-audit-079b.json" ]; then
  run python3 -m json.tool docs/evidence/forge-quote-preview-pdf-engine-canonical-test-evidence-provenance-implementation-audit-079b.json
  if ! rg -n '"status"\s*:\s*"PASS"|"lockedDecision"\s*:\s*"QUOTE_PREVIEW_PDF_ENGINE_CANONICAL_TEST_EVIDENCE_PROVENANCE_LOCAL_STATIC_READ_ONLY_IMPLEMENTED"|"next"\s*:\s*"079C_QUOTE_PREVIEW_PDF_ENGINE_CANONICAL_TEST_EVIDENCE_PROVENANCE_QA_LOCK"' docs/evidence/forge-quote-preview-pdf-engine-canonical-test-evidence-provenance-implementation-audit-079b.json >/dev/null; then
    fail "079B audit exists but does not confirm PASS/079C next"
  fi
  pass "079B audit PASS/079C next confirmed"
else
  warn "079B audit file not found; relying on git log/tree markers"
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
  "$ADAPTER"
  "$TEST"
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

cat > "$BACKUP_DIR/rollback-079c.sh" <<ROLLBACK
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
echo "rollback 079C complete"
ROLLBACK
chmod +x "$BACKUP_DIR/rollback-079c.sh"
pass "backup created"
pass "rollback created: $BACKUP_DIR/rollback-079c.sh"

stage "STAGE 6 REVALIDATE IMPLEMENTATION"
run node --check "$SURFACES_ADAPTER"
run node --check "$SURFACES_TEST"
run node "$SURFACES_TEST"
run node --check "$EVIDENCE_ADAPTER"
run node --check "$EVIDENCE_TEST"
run node "$EVIDENCE_TEST"
run node --check "$ADAPTER"
run node --check "$TEST"
run node "$TEST"

stage "STAGE 7 SEMANTIC QA"
SEMANTIC_QA_JSON="$(mktemp)"
node <<'NODE' > "$SEMANTIC_QA_JSON"
const assert = require("node:assert/strict");
const provenance = require("./platform/adapters/quote-preview/quote-preview-pdf-engine-canonical-test-evidence-provenance-registry-adapter-079b.js");

function resultOk(result) {
  if (result === true) return true;
  if (result && result.ok === true) return true;
  if (result && result.valid === true) return true;
  if (result && result.isValid === true) return true;
  if (result && Array.isArray(result.errors) && result.errors.length === 0) return true;
  return false;
}

assert.equal(provenance.ADAPTER_ID, "forge.quote_preview.pdf_engine.canonical_test_evidence.provenance.registry.adapter.v1");
assert.equal(provenance.SCHEMA_VERSION, "forge.quote_preview.pdf_engine.canonical_test_evidence.provenance.registry.v1");
assert.equal(provenance.MODE, "read_only");
assert.equal(provenance.ROUTE_CLASS, "preview_safe");

const requiredExports = [
  "getQuotePreviewPdfCanonicalTestEvidenceProvenanceRegistryCatalog",
  "getProvenanceById",
  "getProvenanceByTestId",
  "getProvenanceByType",
  "getExpectedValueProvenanceEntries",
  "getFixtureOnlyProvenanceEntries",
  "getGovernanceOnlyProvenanceEntries",
  "getRuntimeGateProvenanceEntries",
  "buildProvenanceSafeError",
  "validateProvenanceShape",
  "validateProvenanceRegistryCatalog",
];

for (const name of requiredExports) {
  assert.equal(typeof provenance[name], "function", `${name} must be exported`);
}

const catalog = provenance.getQuotePreviewPdfCanonicalTestEvidenceProvenanceRegistryCatalog();
assert(catalog && typeof catalog === "object");

assert.equal(catalog.schemaVersion, provenance.SCHEMA_VERSION);
assert.equal(catalog.domainId, "quote_preview_pdf_engine_canonical_test_evidence_provenance");
assert.equal(catalog.mode, "read_only");
assert.equal(catalog.routeClass, "preview_safe");
assert.equal(catalog.registry_type, "local_static_read_only_test_evidence_provenance_registry");

for (const flag of [
  "execution_allowed_in_registry",
  "pdf_read_allowed_in_registry",
  "ocr_execution_allowed_in_registry",
  "parser_execution_allowed_in_registry",
  "calculator_execution_allowed_in_registry",
  "banxico_call_allowed_in_registry",
  "provider_call_allowed_in_registry",
  "test_execution_allowed_in_registry",
]) {
  assert.equal(catalog[flag], false, `${flag} must be false`);
}

assert.equal(catalog.product_intelligence_upstream, true);
assert.equal(catalog.quote_preview_downstream, true);
assert(Array.isArray(catalog.provenance));
assert(catalog.provenance.length >= 10);
assert.equal(resultOk(provenance.validateProvenanceRegistryCatalog(catalog)), true);

for (const entry of catalog.provenance) {
  for (const field of provenance.REQUIRED_PROVENANCE_FIELDS) {
    assert(field in entry, `${entry.provenance_id} missing ${field}`);
  }
  assert.equal(resultOk(provenance.validateProvenanceShape(entry)), true);
}

const requiredIds = [
  "prov_real_pdf_ocr_solucionline_file",
  "prov_real_gmm_quote_pdf_file",
  "prov_gmm_out_of_pocket_expected_values",
  "prov_real_retirement_parser_pdf_file",
  "prov_real_retirement_mxn_expected_values",
  "prov_imagina_ser_master_rate_cache_boundary",
  "prov_imagina_ser_banxico_provider_metadata",
  "prov_retirement_future_udi_deterministic_inputs",
  "prov_quote_pdf_preview_fixture_text",
  "prov_repo_promotion_governance_assertion",
  "prov_existing_surfaces_mapping_governance_assertion",
  "prov_engine_refs_existing_catalog_requirement",
];

for (const id of requiredIds) {
  const entry = provenance.getProvenanceById(id);
  assert.equal(entry.provenance_id, id);
  assert.equal(resultOk(provenance.validateProvenanceShape(entry)), true);
}

const realPdf = provenance.getProvenanceById("prov_real_pdf_ocr_solucionline_file");
assert.equal(realPdf.provenance_type, provenance.PROVENANCE_TYPES.REAL_PDF_FILE);
assert.equal(realPdf.provenance_status, provenance.PROVENANCE_STATUSES.FILE_OR_HASH_REQUIRED);
assert.equal(realPdf.source_hash_required, true);
assert(realPdf.blocked_misuse.includes("fixture_as_real_pdf"));
assert(realPdf.safe_errors.includes(provenance.SAFE_ERROR_CODES.PDF_READ_NOT_AUTHORIZED));
assert(realPdf.safe_errors.includes(provenance.SAFE_ERROR_CODES.FIXTURE_AS_REAL_PDF_BLOCKED));

const gmmPdf = provenance.getProvenanceById("prov_real_gmm_quote_pdf_file");
assert.equal(gmmPdf.provenance_type, provenance.PROVENANCE_TYPES.REAL_PDF_FILE);
assert(gmmPdf.engine_refs.includes("product-intelligence/evidence/gmm-quote-parser.js"));
assert(gmmPdf.safe_errors.includes(provenance.SAFE_ERROR_CODES.PARSER_EXECUTION_NOT_AUTHORIZED));

const gmmExpected = provenance.getProvenanceById("prov_gmm_out_of_pocket_expected_values");
assert.equal(gmmExpected.provenance_type, provenance.PROVENANCE_TYPES.EXPECTED_VALUE);
assert.equal(gmmExpected.expected_value_source_required, true);
assert(gmmExpected.blocked_misuse.includes("invented_expected_value"));
assert(gmmExpected.safe_errors.includes(provenance.SAFE_ERROR_CODES.INVENTED_EXPECTED_VALUE_BLOCKED));

const retirementMxn = provenance.getProvenanceById("prov_real_retirement_mxn_expected_values");
assert.equal(retirementMxn.provenance_type, provenance.PROVENANCE_TYPES.EXPECTED_VALUE);
assert(retirementMxn.engine_refs.includes("retirement-future-udi-projection-engine.js"));
assert(retirementMxn.engine_refs.includes("imagina-ser-future-mxn-bridge.js"));
assert(retirementMxn.blocked_misuse.includes("untraceable_projection"));
assert(retirementMxn.safe_errors.includes(provenance.SAFE_ERROR_CODES.UNTRACEABLE_PROJECTION_BLOCKED));

const deterministic = provenance.getProvenanceById("prov_retirement_future_udi_deterministic_inputs");
assert.equal(deterministic.provenance_type, provenance.PROVENANCE_TYPES.DETERMINISTIC_INPUT);
assert(deterministic.blocked_misuse.includes("invented_udi_growth"));
assert(deterministic.blocked_misuse.includes("invented_current_udi"));

const providerMetadata = provenance.getProvenanceById("prov_imagina_ser_banxico_provider_metadata");
assert.equal(providerMetadata.provenance_type, provenance.PROVENANCE_TYPES.PROVIDER_METADATA);
assert.equal(providerMetadata.provenance_status, provenance.PROVENANCE_STATUSES.RUNTIME_GATE_REQUIRED);
assert.equal(providerMetadata.verification_policy, provenance.VERIFICATION_POLICIES.REQUIRE_RUNTIME_GATE_BEFORE_PROVIDER_CALL);
assert(providerMetadata.blocked_misuse.includes("provider_runtime_without_gate"));
assert(providerMetadata.safe_errors.includes(provenance.SAFE_ERROR_CODES.BANXICO_CALL_NOT_AUTHORIZED));
assert(providerMetadata.safe_errors.includes(provenance.SAFE_ERROR_CODES.PROVIDER_RUNTIME_GATE_REQUIRED));

const fixture = provenance.getProvenanceById("prov_quote_pdf_preview_fixture_text");
assert.equal(fixture.provenance_type, provenance.PROVENANCE_TYPES.FIXTURE_TEXT);
assert.equal(fixture.provenance_status, provenance.PROVENANCE_STATUSES.FIXTURE_ONLY);
assert.equal(fixture.source_kind, provenance.SOURCE_KINDS.TEXT_FIXTURE);
assert(fixture.blocked_misuse.includes("fixture_as_real_pdf"));
assert(fixture.blocked_misuse.includes("real_pdf_claim"));
assert(fixture.safe_errors.includes(provenance.SAFE_ERROR_CODES.FIXTURE_AS_REAL_PDF_BLOCKED));

const governance = provenance.getProvenanceById("prov_repo_promotion_governance_assertion");
assert.equal(governance.provenance_type, provenance.PROVENANCE_TYPES.GOVERNANCE_ASSERTION);
assert.equal(governance.provenance_status, provenance.PROVENANCE_STATUSES.GOVERNANCE_ONLY);
assert(governance.blocked_misuse.includes("extraction_claim"));
assert(governance.blocked_misuse.includes("financial_value_claim"));
assert(governance.safe_errors.includes(provenance.SAFE_ERROR_CODES.GOVERNANCE_AS_EXTRACTION_PROOF_BLOCKED));

const engineRefs = provenance.getProvenanceById("prov_engine_refs_existing_catalog_requirement");
assert.equal(engineRefs.provenance_type, provenance.PROVENANCE_TYPES.ENGINE_REFERENCE);
assert(engineRefs.blocked_misuse.includes("new_engine_creation"));
assert(engineRefs.blocked_misuse.includes("duplicate_parser_creation"));
assert(engineRefs.blocked_misuse.includes("duplicate_calculator_creation"));
assert(engineRefs.safe_errors.includes(provenance.SAFE_ERROR_CODES.DUPLICATE_ENGINE_CREATION_BLOCKED));

const expectedValueEntries = provenance.getExpectedValueProvenanceEntries();
assert(expectedValueEntries.some((entry) => entry.provenance_id === "prov_gmm_out_of_pocket_expected_values"));
assert(expectedValueEntries.some((entry) => entry.provenance_id === "prov_real_retirement_mxn_expected_values"));

const fixtureOnly = provenance.getFixtureOnlyProvenanceEntries();
assert.equal(fixtureOnly.length, 1);
assert.equal(fixtureOnly[0].provenance_id, "prov_quote_pdf_preview_fixture_text");

const governanceOnly = provenance.getGovernanceOnlyProvenanceEntries();
assert(governanceOnly.length >= 2);
assert(governanceOnly.some((entry) => entry.provenance_id === "prov_repo_promotion_governance_assertion"));

const runtimeGate = provenance.getRuntimeGateProvenanceEntries();
assert(runtimeGate.some((entry) => entry.provenance_id === "prov_imagina_ser_banxico_provider_metadata"));
assert(runtimeGate.some((entry) => entry.provenance_id === "prov_imagina_ser_master_rate_cache_boundary"));

const byTest = provenance.getProvenanceByTestId("real_retirement_mxn_scenario_candidate");
assert(byTest.some((entry) => entry.provenance_id === "prov_real_retirement_mxn_expected_values"));

const missing = provenance.getProvenanceById("missing_provenance_for_079c");
assert.equal(missing.readModelStatus, "error");
assert(missing.safe_errors.includes(provenance.SAFE_ERROR_CODES.PROVENANCE_NOT_MAPPED));
assert(missing.safe_errors.includes(provenance.SAFE_ERROR_CODES.PROVENANCE_EXECUTION_NOT_AUTHORIZED));
assert.equal(resultOk(provenance.validateProvenanceShape(missing)), true);

for (const [key, value] of Object.entries(provenance.DEFAULT_SAFETY_FLAGS || {})) {
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
  flags: provenance.DEFAULT_SAFETY_FLAGS,
  safeErrors: provenance.SAFE_ERROR_CODES,
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
  adapterId: provenance.ADAPTER_ID,
  schemaVersion: provenance.SCHEMA_VERSION,
  catalogValidated: true,
  provenanceCount: catalog.provenance.length,
  requiredProvenanceIdsValidated: requiredIds,
  realPdfFileProvenanceValidated: true,
  expectedValueProvenanceValidated: true,
  deterministicInputProvenanceValidated: true,
  providerRuntimeGateValidated: true,
  fixtureAsRealPdfBlocked: true,
  governanceAsExtractionProofBlocked: true,
  duplicateEngineCreationBlocked: true,
  expectedValueLookupValidated: true,
  fixtureOnlyLookupValidated: true,
  governanceOnlyLookupValidated: true,
  runtimeGateLookupValidated: true,
  missingProvenanceSafeErrorValidated: true,
  allSafetyFlagsFalse: true,
  noPdfRead: true,
  noOcrExecution: true,
  noParserExecution: true,
  noCalculatorExecution: true,
  noBanxicoCall: true,
  noProviderCall: true,
  noTestExecution: true,
  noQuoteWrite: true,
  noBackendConnection: true,
  noRealEngineExecution: true
}, null, 2));
NODE

cat "$SEMANTIC_QA_JSON"
pass "semantic QA passed"

stage "STAGE 8 WRITE DOCS / EVIDENCE"
mkdir -p "$(dirname "$ARCH_DOC")" "$(dirname "$EVIDENCE_DOC")"

cat > "$ARCH_DOC" <<EOF
# Forge Quote Preview PDF Engine Canonical Test Evidence Provenance QA Lock 079C

PHASE=$PHASE

STATUS=PASS

DECISION=$DECISION

LOCKED_DECISION=$LOCKED_DECISION

NEXT=$NEXT

## Purpose

079C QA locks the local/static/read-only canonical test evidence provenance registry implemented in 079B.

This phase validates provenance classification without executing real tests, reading PDFs, running OCR, running parsers, running calculators, calling Banxico/providers, connecting backend, writing quotes, or creating real effects.

## Base Confirmed

079B is closed as:

- \`PASS_079B_QUOTE_PREVIEW_PDF_ENGINE_CANONICAL_TEST_EVIDENCE_PROVENANCE_IMPLEMENTATION\`
- \`QUOTE_PREVIEW_PDF_ENGINE_CANONICAL_TEST_EVIDENCE_PROVENANCE_LOCAL_STATIC_READ_ONLY_IMPLEMENTED\`
- \`NEXT=079C_QUOTE_PREVIEW_PDF_ENGINE_CANONICAL_TEST_EVIDENCE_PROVENANCE_QA_LOCK\`

## QA Validated

- Adapter identity and schema are valid.
- Mode is \`read_only\`.
- Route class is \`preview_safe\`.
- Provenance registry shape validates.
- Required provenance fields are present.
- Real PDF file provenance requires file or hash.
- Expected value provenance requires source trace.
- Deterministic projection inputs require traceable sources.
- Banxico/provider metadata requires future runtime gate.
- Fixture text provenance remains fixture-only.
- Governance assertion provenance remains governance-only.
- Existing engine reference provenance blocks duplicate engine/parser/calculator creation.
- Missing provenance returns safe error.
- All safety flags remain false.
- No PDF/OCR/parser/calculator/Banxico/provider/test execution is introduced.

## Not Authorized

079C does not authorize:

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
# Forge Quote Preview PDF Engine Canonical Test Evidence Provenance QA Lock 079C

PHASE=$PHASE

STATUS=PASS

DECISION=$DECISION

LOCKED_DECISION=$LOCKED_DECISION

NEXT=$NEXT

## Evidence Summary

079C validates the 079B provenance registry as local/static/read-only and no-effect.

The registry classifies provenance only. It does not execute tests, read PDFs, run OCR, run parsers, run calculators, call Banxico/providers, connect backend, or write quotes.

## Discovery Evidence

Discovery JSON:

\`$DISCOVERY_JSON_FOUND\`

Discovery report:

\`${DISCOVERY_REPORT_MD:-not_found}\`

Discovery digest:

\`\`\`json
$(cat "$DISCOVERY_DIGEST_JSON")
\`\`\`

## Semantic QA

\`\`\`json
$(cat "$SEMANTIC_QA_JSON")
\`\`\`

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
- semantic QA assertions
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
# Forge Quote Preview PDF Engine Canonical Test Evidence Provenance QA Lock Certificate 079C

PHASE=$PHASE

CERTIFICATE_STATUS=PASS

DECISION=$DECISION

LOCKED_DECISION=$LOCKED_DECISION

NEXT=$NEXT

## Certificate

079C certifies that the Quote Preview PDF Engine Canonical Test Evidence Provenance registry is QA locked.

Certified statements:

- registry is local/static/read-only;
- provenance is classified without execution;
- real PDF file provenance requires file/hash;
- expected value provenance requires source trace;
- deterministic inputs require traceable source;
- Banxico/provider metadata requires future runtime gate;
- fixture-as-real-PDF is blocked;
- governance-as-extraction-proof is blocked;
- duplicate engine/parser/calculator creation is blocked;
- missing provenance returns safe errors;
- all safety flags remain false.

## No-Effect Boundary

This QA lock authorizes no PDF reads, OCR execution, parser execution, calculator execution, Banxico calls, test execution, quote generation, quote writes, provider calls, backend connection, or real effects.

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
    "phase": "079B_QUOTE_PREVIEW_PDF_ENGINE_CANONICAL_TEST_EVIDENCE_PROVENANCE_IMPLEMENTATION",
    "confirmed": true,
    "lockedDecision": "QUOTE_PREVIEW_PDF_ENGINE_CANONICAL_TEST_EVIDENCE_PROVENANCE_LOCAL_STATIC_READ_ONLY_IMPLEMENTED"
  },
  "next": "$NEXT",
  "adapter": "$ADAPTER",
  "test": "$TEST",
  "semanticQa": $(cat "$SEMANTIC_QA_JSON"),
  "discoveryEvidence": $(cat "$DISCOVERY_DIGEST_JSON"),
  "qaValidated": {
    "adapterIdentity": true,
    "schemaVersion": "forge.quote_preview.pdf_engine.canonical_test_evidence.provenance.registry.v1",
    "modeReadOnly": true,
    "routeClassPreviewSafe": true,
    "registryShapeValidates": true,
    "requiredProvenanceFieldsPresent": true,
    "realPdfFileProvenanceRequiresFileOrHash": true,
    "expectedValueProvenanceRequiresSourceTrace": true,
    "deterministicInputProvenanceRequiresSourceTrace": true,
    "banxicoProviderMetadataRequiresRuntimeGate": true,
    "fixtureTextProvenanceFixtureOnly": true,
    "governanceAssertionProvenanceGovernanceOnly": true,
    "duplicateEngineCreationBlocked": true,
    "missingProvenanceSafeError": true,
    "allSafetyFlagsFalse": true
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
    "base079B": "PASS",
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
    "semanticQa": "PASS",
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
## 079C Quote Preview PDF Engine Canonical Test Evidence Provenance QA Lock

079C QA locks the local/static/read-only canonical test evidence provenance registry implemented in 079B.

Locked decision:
\`$LOCKED_DECISION\`

QA validated:

- adapter identity and schema are valid;
- mode \`read_only\`;
- route class \`preview_safe\`;
- provenance registry shape validates;
- required provenance fields are present;
- real PDF file provenance requires file or hash;
- expected value provenance requires source trace;
- deterministic projection inputs require traceable sources;
- Banxico/provider metadata requires future runtime gate;
- fixture text provenance remains fixture-only;
- governance assertion provenance remains governance-only;
- duplicate engine/parser/calculator creation is blocked;
- missing provenance returns safe error;
- all safety flags remain false;
- no PDF/OCR/parser/calculator/Banxico/provider/test execution is introduced.

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
run node --check "$ADAPTER"
run node --check "$TEST"
run node "$TEST"
run python3 -m json.tool "$AUDIT_JSON"

run rg -n "$PHASE|$DECISION|$LOCKED_DECISION|$NEXT|provenance registry|file or hash|source trace|runtime gate|fixture-only|governance-only|duplicate engine" \
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
run git commit -m "docs: lock quote preview pdf canonical test evidence provenance qa"
run git push origin HEAD:main

stage "STAGE 15 FINAL CHECKPOINT"
run git status --short --branch
run git log --oneline -10

SUMMARY=$(cat <<EOF
PASS_079C_QUOTE_PREVIEW_PDF_ENGINE_CANONICAL_TEST_EVIDENCE_PROVENANCE_QA_LOCK_COMMIT_PUSH_COMPLETE
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
