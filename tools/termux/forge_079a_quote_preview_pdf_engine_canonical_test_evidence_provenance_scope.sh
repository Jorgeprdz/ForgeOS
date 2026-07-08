#!/usr/bin/env bash
set -euo pipefail

PHASE="079A_QUOTE_PREVIEW_PDF_ENGINE_CANONICAL_TEST_EVIDENCE_PROVENANCE_SCOPE"
DECISION="PASS_079A_QUOTE_PREVIEW_PDF_ENGINE_CANONICAL_TEST_EVIDENCE_PROVENANCE_SCOPE"
LOCKED_DECISION="QUOTE_PREVIEW_PDF_ENGINE_CANONICAL_TEST_EVIDENCE_PROVENANCE_SCOPED"
NEXT="079B_QUOTE_PREVIEW_PDF_ENGINE_CANONICAL_TEST_EVIDENCE_PROVENANCE_IMPLEMENTATION"
MODE="docs/scope only; provenance classification before execution"
BOUNDARY="no UI mutation; no backend real; no CRM/policy/quote/pipeline writes; no task/calendar/message; no provider execution with effects; no auth/secrets/browser persistence; no real engine execution; no parser/calculator/Banxico/PDF/OCR execution; no invented product/premium/coverage/projection/quote truth; no new extractor/parser/calculator; no real test execution"
REPO="${REPO:-/storage/emulated/0/Forge OS}"
STAMP="$(date +%Y%m%d_%H%M%S)"
REPORT="/data/data/com.termux/files/home/${PHASE}_RESULT_${STAMP}.md"
BACKUP_DIR=".forge-backups/079a-quote-preview-pdf-engine-canonical-test-evidence-provenance-scope-${STAMP}"
SCRIPT_IN_REPO="tools/termux/forge_079a_quote_preview_pdf_engine_canonical_test_evidence_provenance_scope.sh"

SURFACES_ADAPTER="platform/adapters/quote-preview/quote-preview-pdf-engine-existing-surfaces-canonical-mapping-adapter-077b.js"
SURFACES_TEST="tests/quote-preview-pdf-engine-existing-surfaces-canonical-mapping-adapter-077b-test.js"
EVIDENCE_ADAPTER="platform/adapters/quote-preview/quote-preview-pdf-engine-canonical-test-evidence-registry-adapter-078b.js"
EVIDENCE_TEST="tests/quote-preview-pdf-engine-canonical-test-evidence-registry-adapter-078b-test.js"

ARCH_DOC="docs/architecture/source-truth/FORGE_QUOTE_PREVIEW_PDF_ENGINE_CANONICAL_TEST_EVIDENCE_PROVENANCE_SCOPE_079A.md"
EVIDENCE_DOC="docs/evidence/FORGE_QUOTE_PREVIEW_PDF_ENGINE_CANONICAL_TEST_EVIDENCE_PROVENANCE_SCOPE_079A.md"
CERT_DOC="docs/evidence/FORGE_QUOTE_PREVIEW_PDF_ENGINE_CANONICAL_TEST_EVIDENCE_PROVENANCE_SCOPE_CERTIFICATE_079A.md"
AUDIT_JSON="docs/evidence/forge-quote-preview-pdf-engine-canonical-test-evidence-provenance-scope-audit-079a.json"

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
echo "ROBOCOP_GATE=Article 0; 078D decision closed; provenance scope only"

cd "$REPO" || fail "No existe repo: $REPO"

stage "STAGE 1 CHECKPOINT"
run git status --short --branch
run git log --oneline -12
run git diff --name-status
run git diff --cached --name-status

stage "STAGE 2 CONFIRM BASE 078D"
if git log --oneline -50 | grep -Eq "078D|lock quote preview pdf canonical test evidence decision|QUOTE_PREVIEW_PDF_ENGINE_CANONICAL_TEST_EVIDENCE_LOCKED_AS_LOCAL_STATIC_READ_ONLY_REFERENCE_REGISTRY"; then
  pass "078D commit found in recent history"
elif [ -f "docs/evidence/forge-quote-preview-pdf-engine-canonical-test-evidence-decision-audit-078d.json" ]; then
  pass "078D audit fallback found"
else
  fail "078D base not found"
fi

if [ -f "docs/evidence/forge-quote-preview-pdf-engine-canonical-test-evidence-decision-audit-078d.json" ]; then
  run python3 -m json.tool docs/evidence/forge-quote-preview-pdf-engine-canonical-test-evidence-decision-audit-078d.json
  if ! rg -n '"status"\s*:\s*"PASS"|"lockedDecision"\s*:\s*"QUOTE_PREVIEW_PDF_ENGINE_CANONICAL_TEST_EVIDENCE_LOCKED_AS_LOCAL_STATIC_READ_ONLY_REFERENCE_REGISTRY"|"next"\s*:\s*"079A_QUOTE_PREVIEW_PDF_ENGINE_CANONICAL_TEST_EVIDENCE_PROVENANCE_SCOPE"' docs/evidence/forge-quote-preview-pdf-engine-canonical-test-evidence-decision-audit-078d.json >/dev/null; then
    fail "078D audit exists but does not confirm PASS/079A next"
  fi
  pass "078D audit PASS/079A next confirmed"
else
  warn "078D audit file not found; relying on git log/tree markers"
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

cat > "$BACKUP_DIR/rollback-079a.sh" <<ROLLBACK
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
echo "rollback 079A complete"
ROLLBACK
chmod +x "$BACKUP_DIR/rollback-079a.sh"
pass "backup created"
pass "rollback created: $BACKUP_DIR/rollback-079a.sh"

stage "STAGE 6 REVALIDATE REFERENCE REGISTRIES"
run node --check "$SURFACES_ADAPTER"
run node --check "$SURFACES_TEST"
run node "$SURFACES_TEST"
run node --check "$EVIDENCE_ADAPTER"
run node --check "$EVIDENCE_TEST"
run node "$EVIDENCE_TEST"

stage "STAGE 7 BUILD PROVENANCE SCOPE"
PROVENANCE_SCOPE_JSON="$(mktemp)"
node <<'NODE' > "$PROVENANCE_SCOPE_JSON"
const evidence = require('./platform/adapters/quote-preview/quote-preview-pdf-engine-canonical-test-evidence-registry-adapter-078b.js');

const catalog = evidence.getQuotePreviewPdfCanonicalTestEvidenceRegistryCatalog();
const registry = Array.isArray(catalog.evidence) ? catalog.evidence : [];

const provenanceTypes = Object.freeze({
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

const rules = [
  {
    rule_id: 'fixture_not_real_pdf_evidence',
    applies_to: ['quote_pdf_preview_fixture_candidate'],
    provenance_type: provenanceTypes.FIXTURE_TEXT,
    required_status: 'fixture_only_until_real_pdf_linked',
    blocked_misuse: ['real_pdf_claim', 'ocr_claim', 'quote_truth_claim'],
  },
  {
    rule_id: 'governance_not_extraction_proof',
    applies_to: ['repo_promotion_guardrail_candidate', 'existing_surfaces_mapping_guardrail_candidate'],
    provenance_type: provenanceTypes.GOVERNANCE_ASSERTION,
    required_status: 'governance_only',
    blocked_misuse: ['real_pdf_claim', 'parser_claim', 'extraction_claim', 'financial_value_claim'],
  },
  {
    rule_id: 'expected_values_require_source_trace',
    applies_to: ['gmm_out_of_pocket_candidate', 'real_retirement_mxn_scenario_candidate', 'retirement_future_udi_projection_smoke_candidate'],
    provenance_type: provenanceTypes.EXPECTED_VALUE,
    required_status: 'source_trace_required',
    blocked_misuse: ['invented_expected_value', 'untraceable_projection', 'hardcoded_financial_truth'],
  },
  {
    rule_id: 'real_pdf_tests_require_file_provenance',
    applies_to: ['real_pdf_ocr_solucionline_candidate', 'real_gmm_quote_candidate', 'real_retirement_scenario_candidate', 'real_retirement_mxn_scenario_candidate'],
    provenance_type: provenanceTypes.REAL_PDF_FILE,
    required_status: 'real_pdf_file_path_or_fixture_hash_required',
    blocked_misuse: ['fixture_as_real_pdf', 'missing_pdf_origin', 'unverified_source_document'],
  },
  {
    rule_id: 'banxico_cache_requires_runtime_boundary',
    applies_to: ['imagina_ser_banxico_integration_candidate', 'imagina_ser_master_candidate'],
    provenance_type: provenanceTypes.RATE_CACHE,
    required_status: 'cache_or_metadata_only_until_runtime_gate',
    blocked_misuse: ['provider_runtime_without_gate', 'network_call_without_gate', 'secret_access_without_gate'],
  },
  {
    rule_id: 'deterministic_inputs_required_for_projection',
    applies_to: ['retirement_future_udi_projection_smoke_candidate', 'real_retirement_mxn_scenario_candidate'],
    provenance_type: provenanceTypes.DETERMINISTIC_INPUT,
    required_status: 'input_source_required',
    blocked_misuse: ['invented_udi_growth', 'invented_current_udi', 'untraceable_projection_inputs'],
  },
  {
    rule_id: 'engine_reference_must_be_existing_surface',
    applies_to: registry.map((entry) => entry.test_id),
    provenance_type: provenanceTypes.ENGINE_REFERENCE,
    required_status: 'engine_refs_must_match_existing_catalog_or_be_decision_required',
    blocked_misuse: ['new_engine_creation', 'duplicate_parser_creation', 'duplicate_calculator_creation'],
  },
];

const entries = registry.map((entry) => {
  const entryRules = rules.filter((rule) => rule.applies_to.includes(entry.test_id) || rule.applies_to.includes('*'));
  return {
    test_id: entry.test_id,
    file_path: entry.file_path,
    evidence_type: entry.evidence_type,
    canonical_status: entry.canonical_status,
    evidence_role: entry.evidence_role,
    execution_policy: entry.execution_policy,
    provenance_required: true,
    provenance_rules: entryRules.map((rule) => rule.rule_id),
    expected_provenance_types: entryRules.map((rule) => rule.provenance_type),
    blocked_misuse: [...new Set(entryRules.flatMap((rule) => rule.blocked_misuse))],
    execution_status_for_079a: 'not_executed',
  };
});

const scope = {
  status: 'PASS',
  phase: '079A_QUOTE_PREVIEW_PDF_ENGINE_CANONICAL_TEST_EVIDENCE_PROVENANCE_SCOPE',
  scope_type: 'canonical_test_evidence_provenance_scope_only',
  execution_allowed_in_079a: false,
  pdf_read_allowed_in_079a: false,
  ocr_execution_allowed_in_079a: false,
  parser_execution_allowed_in_079a: false,
  calculator_execution_allowed_in_079a: false,
  banxico_call_allowed_in_079a: false,
  provider_call_allowed_in_079a: false,
  test_execution_allowed_in_079a: false,
  registry_evidence_count: registry.length,
  provenance_types: provenanceTypes,
  provenance_rules: rules,
  provenance_scope_entries: entries,
  required_079b_output: {
    adapter_type: 'local_static_read_only_test_evidence_provenance_registry',
    must_not_execute_tests: true,
    must_not_read_pdfs: true,
    must_not_run_ocr: true,
    must_not_run_parsers: true,
    must_not_run_calculators: true,
    must_not_call_banxico: true,
    required_fields: [
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
    banxicoCall: false,
    testExecution: false
  }
};

if (!registry.length) {
  throw new Error('078B registry has no evidence entries');
}
if (!entries.some((entry) => entry.blocked_misuse.includes('invented_expected_value'))) {
  throw new Error('Provenance scope must block invented expected values');
}
if (!entries.some((entry) => entry.blocked_misuse.includes('fixture_as_real_pdf'))) {
  throw new Error('Provenance scope must block fixture-as-real-PDF misuse');
}

console.log(JSON.stringify(scope, null, 2));
NODE

cat "$PROVENANCE_SCOPE_JSON"
pass "provenance scope built"

stage "STAGE 8 WRITE DOCS / EVIDENCE"
mkdir -p "$(dirname "$ARCH_DOC")" "$(dirname "$EVIDENCE_DOC")"

cat > "$ARCH_DOC" <<EOF
# Forge Quote Preview PDF Engine Canonical Test Evidence Provenance Scope 079A

PHASE=$PHASE

STATUS=PASS

DECISION=$DECISION

LOCKED_DECISION=$LOCKED_DECISION

NEXT=$NEXT

## Purpose

079A scopes provenance for canonical test evidence in the Quote Preview PDF Engine path.

This phase follows the 078D decision lock, where the canonical test evidence registry was locked as a local/static/read-only reference registry.

079A does not execute real tests, read PDFs, run OCR, run parsers, run calculators, call Banxico, call providers, connect backend, write quotes, or create real effects.

## Base Confirmed

078D is closed as:

- \`PASS_078D_QUOTE_PREVIEW_PDF_ENGINE_CANONICAL_TEST_EVIDENCE_DECISION_LOCK\`
- \`QUOTE_PREVIEW_PDF_ENGINE_CANONICAL_TEST_EVIDENCE_LOCKED_AS_LOCAL_STATIC_READ_ONLY_REFERENCE_REGISTRY\`
- \`NEXT=079A_QUOTE_PREVIEW_PDF_ENGINE_CANONICAL_TEST_EVIDENCE_PROVENANCE_SCOPE\`

## Scope Boundary

079A authorizes no:

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

## Provenance Areas

079A scopes provenance for:

- real PDF file provenance;
- OCR text output provenance;
- fixture text provenance;
- expected financial value provenance;
- deterministic input provenance;
- rate/cache provenance;
- provider metadata provenance;
- governance assertion provenance;
- existing engine reference provenance.

## Provenance Rules

079B must enforce:

- fixture tests are not real PDF evidence;
- governance tests are not extraction proof;
- expected financial values require source trace;
- real PDF tests require file provenance;
- Banxico/cache tests require runtime boundary;
- deterministic projections require input provenance;
- engine refs must match existing catalog or remain decision-required;
- no new engine/parser/calculator may be created as a provenance shortcut.

## Required 079B Shape

079B must implement a local/static/read-only test evidence provenance registry.

Required fields:

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

## Blocked Misuse

079B must block:

- fixture-as-real-PDF claims;
- governance-as-extraction-proof claims;
- invented expected values;
- untraceable projections;
- hardcoded financial truth;
- provider runtime without future gate;
- network calls without future gate;
- secret access without future gate;
- new engine creation;
- duplicate parser creation;
- duplicate calculator creation.

## Final Decision

DECISION=$DECISION

LOCKED_DECISION=$LOCKED_DECISION

NEXT=$NEXT
EOF

cat > "$EVIDENCE_DOC" <<EOF
# Forge Quote Preview PDF Engine Canonical Test Evidence Provenance Scope 079A

PHASE=$PHASE

STATUS=PASS

DECISION=$DECISION

LOCKED_DECISION=$LOCKED_DECISION

NEXT=$NEXT

## Evidence Summary

079A scopes provenance classification for canonical test evidence.

It uses the 078D locked reference registry and previous discovery output. It classifies provenance needs without executing any real tests or engines.

## Discovery Evidence

Discovery JSON:

\`$DISCOVERY_JSON_FOUND\`

Discovery report:

\`${DISCOVERY_REPORT_MD:-not_found}\`

Discovery digest:

\`\`\`json
$(cat "$DISCOVERY_DIGEST_JSON")
\`\`\`

## Provenance Scope

\`\`\`json
$(cat "$PROVENANCE_SCOPE_JSON")
\`\`\`

## Commands

- \`python3 -m json.tool "$DISCOVERY_JSON_FOUND"\`
- \`node --check $SURFACES_ADAPTER\`
- \`node --check $SURFACES_TEST\`
- \`node $SURFACES_TEST\`
- \`node --check $EVIDENCE_ADAPTER\`
- \`node --check $EVIDENCE_TEST\`
- \`node $EVIDENCE_TEST\`
- local/static/read-only provenance scope builder
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
# Forge Quote Preview PDF Engine Canonical Test Evidence Provenance Scope Certificate 079A

PHASE=$PHASE

CERTIFICATE_STATUS=PASS

DECISION=$DECISION

LOCKED_DECISION=$LOCKED_DECISION

NEXT=$NEXT

## Certificate

079A certifies that canonical test evidence provenance must be scoped before any execution or promotion.

Certified statements:

- 078D reference registry is the base;
- provenance must be classified for fixture, real PDF, OCR, expected values, deterministic inputs, rate/cache, provider metadata, governance assertions, and engine references;
- real tests were not executed;
- PDF/OCR/parser/calculator/Banxico/provider behavior was not executed;
- no new extractor/parser/calculator/test engine was created;
- invented expected financial values remain blocked;
- fixture-as-real-PDF claims remain blocked;
- governance-as-extraction-proof claims remain blocked;
- 079B must implement a local/static/read-only provenance registry.

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
    "phase": "078D_QUOTE_PREVIEW_PDF_ENGINE_CANONICAL_TEST_EVIDENCE_DECISION_LOCK",
    "confirmed": true,
    "lockedDecision": "QUOTE_PREVIEW_PDF_ENGINE_CANONICAL_TEST_EVIDENCE_LOCKED_AS_LOCAL_STATIC_READ_ONLY_REFERENCE_REGISTRY"
  },
  "next": "$NEXT",
  "scopeType": "canonical_test_evidence_provenance_scope_only",
  "discoveryEvidence": $(cat "$DISCOVERY_DIGEST_JSON"),
  "provenanceScope": $(cat "$PROVENANCE_SCOPE_JSON"),
  "required079B": {
    "adapterType": "local_static_read_only_test_evidence_provenance_registry",
    "mustNotExecuteTests": true,
    "mustNotReadPdfs": true,
    "mustNotRunOcr": true,
    "mustNotRunParsers": true,
    "mustNotRunCalculators": true,
    "mustNotCallBanxico": true,
    "mustNotCreateNewExtractor": true,
    "mustNotCreateNewParser": true,
    "mustNotCreateNewCalculator": true
  },
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
    "base078D": "PASS",
    "discoveryJson": "PASS",
    "nodeCheckSurfacesAdapter": "PASS",
    "nodeCheckSurfacesTest": "PASS",
    "nodeSurfacesTest": "PASS",
    "nodeCheckEvidenceAdapter": "PASS",
    "nodeCheckEvidenceTest": "PASS",
    "nodeEvidenceTest": "PASS",
    "provenanceScopeBuild": "PASS",
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
## 079A Quote Preview PDF Engine Canonical Test Evidence Provenance Scope

079A scopes provenance classification for canonical test evidence.

Locked decision:
\`$LOCKED_DECISION\`

Base:

- 078D locked the canonical test evidence registry as a local/static/read-only reference registry.

Scope:

- classify real PDF file provenance;
- classify OCR text output provenance;
- classify fixture text provenance;
- classify expected financial value provenance;
- classify deterministic input provenance;
- classify rate/cache provenance;
- classify provider metadata provenance;
- classify governance assertion provenance;
- classify existing engine reference provenance.

Blocked misuse:

- fixture-as-real-PDF claims;
- governance-as-extraction-proof claims;
- invented expected values;
- untraceable projections;
- hardcoded financial truth;
- provider runtime without future gate;
- network calls without future gate;
- secret access without future gate;
- new engine creation;
- duplicate parser/calculator creation.

Next:

- \`$NEXT\` must implement a local/static/read-only provenance registry only.

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
run python3 -m json.tool "$AUDIT_JSON"

run rg -n "$PHASE|$DECISION|$LOCKED_DECISION|$NEXT|provenance|fixture-as-real-PDF|governance-as-extraction-proof|invented expected|deterministic input|provider metadata|existing engine" \
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
run git commit -m "docs: scope quote preview pdf canonical test evidence provenance"
run git push origin HEAD:main

stage "STAGE 15 FINAL CHECKPOINT"
run git status --short --branch
run git log --oneline -10

SUMMARY=$(cat <<EOF
PASS_079A_QUOTE_PREVIEW_PDF_ENGINE_CANONICAL_TEST_EVIDENCE_PROVENANCE_SCOPE_COMMIT_PUSH_COMPLETE
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
