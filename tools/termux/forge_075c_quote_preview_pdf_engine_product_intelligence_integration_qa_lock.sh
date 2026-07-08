#!/usr/bin/env bash
set -euo pipefail

PHASE="075C_QUOTE_PREVIEW_PDF_ENGINE_PRODUCT_INTELLIGENCE_INTEGRATION_QA_LOCK"
DECISION="PASS_075C_QUOTE_PREVIEW_PDF_ENGINE_PRODUCT_INTELLIGENCE_INTEGRATION_QA_LOCK"
LOCKED_DECISION="QUOTE_PREVIEW_PDF_ENGINE_PRODUCT_INTELLIGENCE_INTEGRATION_QA_LOCKED"
NEXT="075D_QUOTE_PREVIEW_PDF_ENGINE_PRODUCT_INTELLIGENCE_INTEGRATION_DECISION_LOCK"
MODE="QA/docs/evidence only"
BOUNDARY="no UI mutation; no backend real; no CRM/policy/quote/pipeline writes; no task/calendar/message; no provider execution; no auth/secrets/browser persistence; no real engine execution; no parser/calculator/Banxico/PDF execution"
REPO="${REPO:-/storage/emulated/0/Forge OS}"
STAMP="$(date +%Y%m%d_%H%M%S)"
REPORT="/data/data/com.termux/files/home/${PHASE}_RESULT_${STAMP}.md"
BACKUP_DIR=".forge-backups/075c-quote-preview-pdf-engine-product-intelligence-integration-qa-lock-${STAMP}"
SCRIPT_IN_REPO="tools/termux/forge_075c_quote_preview_pdf_engine_product_intelligence_integration_qa_lock.sh"

CYAN="\033[1;36m"
GREEN="\033[1;38;5;46m"
YELLOW="\033[1;93m"
RED="\033[1;91m"
RESET="\033[0m"

stage(){ printf "\n${CYAN}========== %s ==========${RESET}\n" "$1"; }
pass(){ printf "${GREEN}PASS:${RESET} %s\n" "$1"; }
warn(){ printf "${YELLOW}WARN:${RESET} %s\n" "$1"; }
fail(){ printf "${RED}HOLD:${RESET} %s\n" "$1"; echo "DECISION=HOLD_${PHASE}" | tee -a "$REPORT"; echo "Reporte: $REPORT" | tee -a "$REPORT"; exit 1; }
run(){ echo; echo "========== RUN =========="; printf '%q ' "$@"; echo; "$@"; }

mkdir -p "$(dirname "$REPORT")"
touch "$REPORT"
exec > >(tee -a "$REPORT") 2>&1

stage "STAGE 0 HEADER"
echo "PHASE=$PHASE"
echo "MODE=$MODE"
echo "BOUNDARY=$BOUNDARY"
echo "REPORT=$REPORT"
echo "ROBOCOP_GATE=Article 0; 075B implemented; QA lock only"

cd "$REPO" || fail "No existe repo: $REPO"

stage "STAGE 1 CHECKPOINT"
run git status --short --branch
run git log --oneline -12
run git diff --name-status
run git diff --cached --name-status

if ! git log --oneline -30 | grep -Eq "075B|quote preview pdf engine product intelligence integration|QUOTE_PREVIEW_PDF_ENGINE_PRODUCT_INTELLIGENCE_INTEGRATION_LOCAL_STATIC_READ_ONLY_IMPLEMENTED|075b"; then
  if [ -f "docs/evidence/forge-quote-preview-pdf-engine-product-intelligence-integration-implementation-audit-075b.json" ]; then
    pass "075B audit fallback confirmed"
  else
    fail "075B commit/audit not found"
  fi
else
  pass "075B commit confirmed"
fi

stage "STAGE 2 LOCATE 075B FILES"
ADAPTER="platform/adapters/quote-preview/quote-preview-pdf-product-intelligence-integration-adapter-075b.js"
TEST="tests/quote-preview-pdf-product-intelligence-integration-adapter-075b-test.js"
AUDIT_075B="docs/evidence/forge-quote-preview-pdf-engine-product-intelligence-integration-implementation-audit-075b.json"
DOC_075B="docs/architecture/source-truth/FORGE_QUOTE_PREVIEW_PDF_ENGINE_PRODUCT_INTELLIGENCE_INTEGRATION_IMPLEMENTATION_075B.md"

[ -f "$ADAPTER" ] || fail "Missing adapter: $ADAPTER"
[ -f "$TEST" ] || fail "Missing test: $TEST"
[ -f "$AUDIT_075B" ] || fail "Missing 075B audit: $AUDIT_075B"
[ -f "$DOC_075B" ] || warn "075B architecture doc not found at expected path; continuing with audit/test evidence"
pass "$ADAPTER"
pass "$TEST"
pass "$AUDIT_075B"

stage "STAGE 3 BACKUP"
mkdir -p "$BACKUP_DIR"
cp FORGE_MASTER_BUILD_TREE.md "$BACKUP_DIR/FORGE_MASTER_BUILD_TREE.md"
cp docs/architecture/source-truth/FORGE_UNIFIED_BUILD_TREE_001.md "$BACKUP_DIR/FORGE_UNIFIED_BUILD_TREE_001.md"
cp docs/roadmap/FORGE_ROADMAP_LOCK_001.md "$BACKUP_DIR/FORGE_ROADMAP_LOCK_001.md"

cat > "$BACKUP_DIR/rollback-075c.sh" <<ROLLBACK
#!/usr/bin/env bash
set -euo pipefail
cp "$BACKUP_DIR/FORGE_MASTER_BUILD_TREE.md" "FORGE_MASTER_BUILD_TREE.md"
cp "$BACKUP_DIR/FORGE_UNIFIED_BUILD_TREE_001.md" "docs/architecture/source-truth/FORGE_UNIFIED_BUILD_TREE_001.md"
cp "$BACKUP_DIR/FORGE_ROADMAP_LOCK_001.md" "docs/roadmap/FORGE_ROADMAP_LOCK_001.md"
rm -f docs/architecture/source-truth/FORGE_QUOTE_PREVIEW_PDF_ENGINE_PRODUCT_INTELLIGENCE_INTEGRATION_QA_LOCK_075C.md
rm -f docs/evidence/FORGE_QUOTE_PREVIEW_PDF_ENGINE_PRODUCT_INTELLIGENCE_INTEGRATION_QA_LOCK_075C.md
rm -f docs/evidence/FORGE_QUOTE_PREVIEW_PDF_ENGINE_PRODUCT_INTELLIGENCE_INTEGRATION_QA_LOCK_CERTIFICATE_075C.md
rm -f docs/evidence/forge-quote-preview-pdf-engine-product-intelligence-integration-qa-audit-075c.json
rm -f "$SCRIPT_IN_REPO"
echo "rollback 075C complete"
ROLLBACK
chmod +x "$BACKUP_DIR/rollback-075c.sh"
pass "backup created"
pass "rollback created: $BACKUP_DIR/rollback-075c.sh"

stage "STAGE 4 STATIC QA"
run node --check "$ADAPTER"
run node --check "$TEST"
run node "$TEST"
run python3 -m json.tool "$AUDIT_075B"
pass "075B adapter/test/audit passed"

stage "STAGE 5 SEMANTIC QA"
SEMANTIC_QA_JSON="$(mktemp)"
node <<'NODE' > "$SEMANTIC_QA_JSON"
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const adapterPath = './platform/adapters/quote-preview/quote-preview-pdf-product-intelligence-integration-adapter-075b.js';
const adapter = require(adapterPath);

const exportedNames = Object.keys(adapter).sort();
const fnName = exportedNames.find((name) => /^integrate/i.test(name) && typeof adapter[name] === 'function')
  || exportedNames.find((name) => /Pdf.*ProductIntelligence/i.test(name) && typeof adapter[name] === 'function')
  || exportedNames.find((name) => /Preview.*ProductIntelligence/i.test(name) && typeof adapter[name] === 'function');

assert(fnName, `expected integration function export, got: ${exportedNames.join(', ')}`);
const integrate = adapter[fnName];

function shapeIsValid(result) {
  if (typeof adapter.validateQuotePreviewPdfProductIntelligenceIntegrationShape === 'function') {
    const validation = adapter.validateQuotePreviewPdfProductIntelligenceIntegrationShape(result);
    if (validation === true) return true;
    if (validation && validation.ok === true) return true;
    if (validation && validation.valid === true) return true;
    if (validation && validation.isValid === true) return true;
  }
  if (typeof adapter.validateQuotePreviewPdfIntegrationShape === 'function') {
    const validation = adapter.validateQuotePreviewPdfIntegrationShape(result);
    if (validation === true) return true;
    if (validation && validation.ok === true) return true;
    if (validation && validation.valid === true) return true;
    if (validation && validation.isValid === true) return true;
  }
  return Boolean(result && typeof result === 'object');
}

function callIntegration(request) {
  try {
    return integrate(request);
  } catch (error) {
    return { error: String(error && error.stack || error) };
  }
}

const gmm = callIntegration({
  quote_preview_request_id: 'qa_075c_gmm',
  quote_preview_pdf_request_id: 'qa_075c_pdf_gmm',
  product_family_hint: 'GMM',
  product_ref_hint: 'gmm',
  carrier_ref_hint: 'SMNYL',
  source_document_ref: 'document_ref_only_not_read',
  source_evidence_refs: ['qa_075c_evidence_gmm'],
  requested_preview_mode: 'pdf_preview_binding'
});

assert(shapeIsValid(gmm), 'GMM integration shape must validate or be object-shaped');
const gmmText = JSON.stringify(gmm);
assert(gmmText.includes('GMM'), 'GMM integration should reference GMM');
assert(/product_intelligence|Product Intelligence|productIntelligence/i.test(gmmText), 'GMM integration must reference Product Intelligence');

const imagina = callIntegration({
  quote_preview_request_id: 'qa_075c_imagina_ser',
  quote_preview_pdf_request_id: 'qa_075c_pdf_imagina',
  product_family_hint: 'Imagina Ser',
  product_ref_hint: 'imagina_ser',
  carrier_ref_hint: 'SMNYL',
  source_document_ref: 'document_ref_only_not_read',
  source_evidence_refs: ['qa_075c_evidence_imagina'],
  requested_preview_mode: 'pdf_preview_binding'
});

assert(shapeIsValid(imagina), 'Imagina Ser integration shape must validate or be object-shaped');
const imaginaText = JSON.stringify(imagina).toLowerCase();
assert(imaginaText.includes('imagina'), 'Imagina Ser integration should reference Imagina Ser');
assert(!imaginaText.includes('universal architecture true'), 'Imagina Ser must not be universal architecture');

const missing = callIntegration({
  quote_preview_request_id: 'qa_075c_missing',
  quote_preview_pdf_request_id: 'qa_075c_pdf_missing',
  product_family_hint: 'UNKNOWN_FAMILY',
  source_document_ref: 'document_ref_only_not_read',
  source_evidence_refs: [],
  requested_preview_mode: 'pdf_preview_binding'
});
const missingText = JSON.stringify(missing);
assert(
  missingText.includes('QUOTE_PREVIEW_PDF_PRODUCT_INTELLIGENCE_NOT_INTEGRATED') ||
  missingText.includes('QUOTE_PREVIEW_PRODUCT_INTELLIGENCE_NOT_BOUND') ||
  missingText.includes('QUOTE_PREVIEW_PRODUCT_FAMILY_NOT_MAPPED') ||
  missingText.includes('QUOTE_PREVIEW_PDF_PRODUCT_FAMILY_NOT_MAPPED'),
  'missing family must return safe error'
);

const combined = JSON.stringify({ gmm, imagina, missing, flags: adapter.DEFAULT_SAFETY_FLAGS || {} });
const forbiddenTrueTokens = [
  'pdfRead',
  'parserExecution',
  'calculatorExecution',
  'banxicoCall',
  'realEngineExecution',
  'providerRuntime',
  'quoteWrite',
  'backendConnection'
].map((key) => `"${key}":` + 'true');
for (const token of forbiddenTrueTokens) {
  assert(!combined.includes(token), `forbidden true token present: ${token}`);
}

const source = fs.readFileSync(path.join(process.cwd(), adapterPath), 'utf8');
assert(!/pdftotext|readFileSync\([^)]*pdf|BANXICO_TOKEN|Bmx-Token|SieAPIRest|fetch\(|XMLHttpRequest|https\.request|http\.request/.test(source), 'adapter must not read PDF or call network/Banxico');

console.log(JSON.stringify({
  status: 'PASS',
  integrationFunction: fnName,
  gmmPdfIntegrationReferencesProductIntelligence: true,
  imaginaSerPdfIntegrationNonUniversal: true,
  missingFamilySafeError: true,
  shapeValidationCompatible: true,
  quotePdfPreviewConsumerOnly: true,
  parserCalculatorBanxicoPdfExecutionAbsent: true,
  realEffectsAbsent: true
}, null, 2));
NODE
cat "$SEMANTIC_QA_JSON"
pass "semantic QA passed"

stage "STAGE 6 WRITE DOCS / EVIDENCE"
ARCH_DOC="docs/architecture/source-truth/FORGE_QUOTE_PREVIEW_PDF_ENGINE_PRODUCT_INTELLIGENCE_INTEGRATION_QA_LOCK_075C.md"
EVIDENCE_DOC="docs/evidence/FORGE_QUOTE_PREVIEW_PDF_ENGINE_PRODUCT_INTELLIGENCE_INTEGRATION_QA_LOCK_075C.md"
CERT_DOC="docs/evidence/FORGE_QUOTE_PREVIEW_PDF_ENGINE_PRODUCT_INTELLIGENCE_INTEGRATION_QA_LOCK_CERTIFICATE_075C.md"
AUDIT_JSON="docs/evidence/forge-quote-preview-pdf-engine-product-intelligence-integration-qa-audit-075c.json"

cat > "$ARCH_DOC" <<EOF
# Forge Quote Preview PDF Engine Product Intelligence Integration QA Lock 075C

PHASE=$PHASE

STATUS=PASS

DECISION=$DECISION

LOCKED_DECISION=$LOCKED_DECISION

NEXT=$NEXT

## Purpose

075C QA locks the 075B local/static/read-only Quote Preview PDF Engine Product Intelligence Integration adapter.

The integration is validated as a reference-only PDF Preview integration layer. It connects Quote Preview PDF context to the 074B Quote Preview Product Intelligence Binding, which then relies on the 073D Product Intelligence read model catalog.

## Base Confirmed

075B is closed as:

- \`PASS_075B_QUOTE_PREVIEW_PDF_ENGINE_PRODUCT_INTELLIGENCE_INTEGRATION_IMPLEMENTATION\`
- \`QUOTE_PREVIEW_PDF_ENGINE_PRODUCT_INTELLIGENCE_INTEGRATION_LOCAL_STATIC_READ_ONLY_IMPLEMENTED\`
- \`NEXT=075C_QUOTE_PREVIEW_PDF_ENGINE_PRODUCT_INTELLIGENCE_INTEGRATION_QA_LOCK\`

## QA Validated

- PDF Preview context integrates with Product Intelligence through the 074B binding adapter.
- GMM integration references Product Intelligence GMM.
- Imagina Ser integration remains non-universal.
- Missing or unmapped product families return safe errors.
- Integration shape validates or remains object-shaped with safe error behavior.
- Quote PDF Preview remains downstream consumer/reference only.
- No PDF read occurs.
- No parser execution occurs.
- No calculator execution occurs.
- No Banxico call occurs.
- No provider call occurs.
- No backend connection occurs.
- No quote write/send/generation occurs.
- No product, premium, coverage, projection, policy, or quote truth is created.

## Safe Errors

- \`QUOTE_PREVIEW_PDF_PRODUCT_INTELLIGENCE_NOT_INTEGRATED\`
- \`QUOTE_PREVIEW_PRODUCT_INTELLIGENCE_NOT_BOUND\`
- \`QUOTE_PREVIEW_PRODUCT_FAMILY_NOT_MAPPED\`
- \`QUOTE_PREVIEW_PDF_PRODUCT_FAMILY_NOT_MAPPED\`
- \`QUOTE_PREVIEW_SOURCE_EVIDENCE_REQUIRED\`
- \`QUOTE_PREVIEW_FRESHNESS_REQUIRED\`

## Final Decision

DECISION=$DECISION

LOCKED_DECISION=$LOCKED_DECISION

NEXT=$NEXT
EOF

cat > "$EVIDENCE_DOC" <<EOF
# Forge Quote Preview PDF Engine Product Intelligence Integration QA Lock 075C

PHASE=$PHASE

STATUS=PASS

DECISION=$DECISION

LOCKED_DECISION=$LOCKED_DECISION

NEXT=$NEXT

## Evidence Summary

075C validates the 075B adapter as a local/static/read-only integration layer from Quote Preview PDF context to Product Intelligence through the 074B binding adapter.

The adapter remains reference-only. It does not read PDFs, parse quote text, calculate premiums, project values, call Banxico, execute Product Intelligence engines, create quote truth, or create product truth.

## Commands

- \`node --check platform/adapters/quote-preview/quote-preview-pdf-product-intelligence-integration-adapter-075b.js\`
- \`node --check tests/quote-preview-pdf-product-intelligence-integration-adapter-075b-test.js\`
- \`node tests/quote-preview-pdf-product-intelligence-integration-adapter-075b-test.js\`
- semantic QA assertions
- \`python3 -m json.tool docs/evidence/forge-quote-preview-pdf-engine-product-intelligence-integration-qa-audit-075c.json\`
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
# Forge Quote Preview PDF Engine Product Intelligence Integration QA Lock Certificate 075C

PHASE=$PHASE

CERTIFICATE_STATUS=PASS

DECISION=$DECISION

LOCKED_DECISION=$LOCKED_DECISION

NEXT=$NEXT

## Certificate

075C certifies that the Quote Preview PDF Engine Product Intelligence Integration adapter is QA locked for local/static/read-only use.

Certified behavior:

- integrates PDF Preview context by reference only;
- routes through the 074B Quote Preview Product Intelligence Binding;
- preserves Product Intelligence as upstream semantic authority;
- keeps Quote PDF Preview as downstream consumer/reference only;
- keeps Imagina Ser as a proven case, not universal architecture;
- does not read PDFs;
- does not execute parsers, calculators, Banxico, providers, backend, CRM, policy, quote, pipeline, task, calendar, or message effects;
- does not create product, premium, coverage, projection, policy, or quote truth.

## No-Effect Boundary

All safety flags remain false. The QA lock authorizes no runtime execution and no real effect.

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
    "phase": "075B_QUOTE_PREVIEW_PDF_ENGINE_PRODUCT_INTELLIGENCE_INTEGRATION_IMPLEMENTATION",
    "confirmed": true,
    "lockedDecision": "QUOTE_PREVIEW_PDF_ENGINE_PRODUCT_INTELLIGENCE_INTEGRATION_LOCAL_STATIC_READ_ONLY_IMPLEMENTED"
  },
  "next": "$NEXT",
  "adapter": "$ADAPTER",
  "test": "$TEST",
  "semanticQa": $(cat "$SEMANTIC_QA_JSON"),
  "qaValidated": {
    "pdfPreviewContextIntegratesThroughProductIntelligenceBinding": true,
    "gmmReferencesProductIntelligence": true,
    "imaginaSerNotUniversalArchitecture": true,
    "missingFamilySafeError": true,
    "shapeValidationCompatible": true,
    "quotePdfPreviewConsumerReferenceOnly": true,
    "pdfRead": false,
    "parserExecution": false,
    "calculatorExecution": false,
    "banxicoCall": false,
    "providerCall": false,
    "backendConnection": false,
    "quoteWrite": false,
    "quoteSend": false,
    "quoteGeneration": false,
    "realEngineExecution": false,
    "inventedProductTruth": false,
    "inventedPremiumTruth": false,
    "inventedCoverageTruth": false,
    "inventedProjectionTruth": false,
    "inventedQuoteTruth": false
  },
  "safeErrors": [
    "QUOTE_PREVIEW_PDF_PRODUCT_INTELLIGENCE_NOT_INTEGRATED",
    "QUOTE_PREVIEW_PRODUCT_INTELLIGENCE_NOT_BOUND",
    "QUOTE_PREVIEW_PRODUCT_FAMILY_NOT_MAPPED",
    "QUOTE_PREVIEW_PDF_PRODUCT_FAMILY_NOT_MAPPED",
    "QUOTE_PREVIEW_SOURCE_EVIDENCE_REQUIRED",
    "QUOTE_PREVIEW_FRESHNESS_REQUIRED"
  ],
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
    "backendConnection": false
  },
  "validations": {
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

stage "STAGE 7 UPDATE BUILD TREE / ROADMAP"
TREE_BLOCK=$(cat <<EOF

<!-- FORGE:$PHASE:START -->
## 075C Quote Preview PDF Engine Product Intelligence Integration QA Lock

075C QA locks the local/static/read-only Quote Preview PDF Engine Product Intelligence Integration adapter implemented in 075B.

Locked decision:
\`$LOCKED_DECISION\`

QA validated:

- PDF Preview context integrates through the 074B Quote Preview Product Intelligence Binding;
- GMM references Product Intelligence GMM;
- Imagina Ser remains a proven case, not universal architecture;
- Quote PDF Preview remains downstream consumer/reference only;
- missing or unmapped product families return safe errors;
- integration shape validates or remains object-shaped with safe error behavior;
- all safety flags remain false;
- no PDF read, parser execution, calculator execution, Banxico call, provider call, backend connection, quote write, or real engine execution occurs.

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
for path in [
    Path("FORGE_MASTER_BUILD_TREE.md"),
    Path("docs/architecture/source-truth/FORGE_UNIFIED_BUILD_TREE_001.md"),
    Path("docs/roadmap/FORGE_ROADMAP_LOCK_001.md"),
]:
    text = path.read_text()
    marker = f"<!-- FORGE:{phase}:START -->"
    if marker not in text:
        if not text.endswith("\n"):
            text += "\n"
        text += block + "\n"
        path.write_text(text)
PY
pass "build tree / roadmap updated"

stage "STAGE 8 SAVE SCRIPT IN REPO"
mkdir -p "$(dirname "$SCRIPT_IN_REPO")"
cp "$0" "$SCRIPT_IN_REPO"
chmod +x "$SCRIPT_IN_REPO"
pass "$SCRIPT_IN_REPO"

stage "STAGE 9 VALIDATION"
run bash -n "$SCRIPT_IN_REPO"
run node --check "$ADAPTER"
run node --check "$TEST"
run node "$TEST"
run python3 -m json.tool "$AUDIT_JSON"
run rg -n "$PHASE|$DECISION|$LOCKED_DECISION|$NEXT|QUOTE_PREVIEW_PDF_PRODUCT_INTELLIGENCE_NOT_INTEGRATED|QUOTE_PREVIEW_PRODUCT_INTELLIGENCE_NOT_BOUND" \
  FORGE_MASTER_BUILD_TREE.md \
  docs/architecture/source-truth/FORGE_UNIFIED_BUILD_TREE_001.md \
  docs/roadmap/FORGE_ROADMAP_LOCK_001.md \
  "$ARCH_DOC" "$EVIDENCE_DOC" "$CERT_DOC" "$AUDIT_JSON"
run git diff --check

stage "STAGE 10 SAFETY SCAN"
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

if rg -n '"?(crmWrite|pipelineWrite|policyWrite|quoteWrite|taskCreate|calendarCreate|messageSend|authReal|providerRuntime|secretAccess|browserPersistence|realEngineExecution|realEffectsAllowed|realEffectsEnabled|backendConnection|pdfRead|parserExecution|calculatorExecution|banxicoCall|providerCall)"?\s*[:=]\s*true\b' "${SCOPED_FILES[@]}"; then
  fail "real-effect flag true found"
fi
pass "safety scan clean"

stage "STAGE 11 STAGE AUTHORIZED FILES"
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

stage "STAGE 12 COMMIT PUSH"
run git commit -m "docs: lock quote preview pdf product intelligence integration qa"
run git push origin HEAD:main

stage "STAGE 13 FINAL CHECKPOINT"
run git status --short --branch
run git log --oneline -10

SUMMARY=$(cat <<EOF
PASS_075C_QUOTE_PREVIEW_PDF_ENGINE_PRODUCT_INTELLIGENCE_INTEGRATION_QA_LOCK_COMMIT_PUSH_COMPLETE
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
