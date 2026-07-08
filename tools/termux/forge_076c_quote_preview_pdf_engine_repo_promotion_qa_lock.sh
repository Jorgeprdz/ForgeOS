#!/usr/bin/env bash
set -euo pipefail

PHASE="076C_QUOTE_PREVIEW_PDF_ENGINE_REPO_PROMOTION_QA_LOCK"
DECISION="PASS_076C_QUOTE_PREVIEW_PDF_ENGINE_REPO_PROMOTION_QA_LOCK"
LOCKED_DECISION="QUOTE_PREVIEW_PDF_ENGINE_REPO_PROMOTION_QA_LOCKED"
NEXT="076D_QUOTE_PREVIEW_PDF_ENGINE_REPO_PROMOTION_DECISION_LOCK"
MODE="QA/docs/evidence only"
BOUNDARY="no UI mutation; no backend real; no CRM/policy/quote/pipeline writes; no task/calendar/message; no provider execution with effects; no auth/secrets/browser persistence; no real engine execution; no parser/calculator/Banxico/PDF execution; no invented product/premium/coverage/projection/quote truth"
REPO="${REPO:-/storage/emulated/0/Forge OS}"
STAMP="$(date +%Y%m%d_%H%M%S)"
REPORT="/data/data/com.termux/files/home/${PHASE}_RESULT_${STAMP}.md"
BACKUP_DIR=".forge-backups/076c-quote-preview-pdf-engine-repo-promotion-qa-lock-${STAMP}"
SCRIPT_IN_REPO="tools/termux/forge_076c_quote_preview_pdf_engine_repo_promotion_qa_lock.sh"

ADAPTER="platform/adapters/quote-preview/quote-preview-pdf-engine-repo-promotion-adapter-076b.js"
TEST="tests/quote-preview-pdf-engine-repo-promotion-adapter-076b-test.js"
ARCH_DOC="docs/architecture/source-truth/FORGE_QUOTE_PREVIEW_PDF_ENGINE_REPO_PROMOTION_QA_LOCK_076C.md"
EVIDENCE_DOC="docs/evidence/FORGE_QUOTE_PREVIEW_PDF_ENGINE_REPO_PROMOTION_QA_LOCK_076C.md"
CERT_DOC="docs/evidence/FORGE_QUOTE_PREVIEW_PDF_ENGINE_REPO_PROMOTION_QA_LOCK_CERTIFICATE_076C.md"
AUDIT_JSON="docs/evidence/forge-quote-preview-pdf-engine-repo-promotion-qa-audit-076c.json"

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
echo "ROBOCOP_GATE=Article 0; 076B implementation closed; QA lock only"

cd "$REPO" || fail "No existe repo: $REPO"

stage "STAGE 1 CHECKPOINT"
run git status --short --branch
run git log --oneline -12
run git diff --name-status
run git diff --cached --name-status

stage "STAGE 2 CONFIRM BASE 076B"
if git log --oneline -40 | grep -Eq "076B|implement quote preview pdf engine repo promotion adapter|QUOTE_PREVIEW_PDF_ENGINE_REPO_PROMOTION_LOCAL_STATIC_READ_ONLY_IMPLEMENTED"; then
  pass "076B commit found in recent history"
elif [ -f "docs/evidence/forge-quote-preview-pdf-engine-repo-promotion-implementation-audit-076b.json" ]; then
  pass "076B audit fallback found"
else
  fail "076B base not found"
fi

if [ -f "docs/evidence/forge-quote-preview-pdf-engine-repo-promotion-implementation-audit-076b.json" ]; then
  run python3 -m json.tool docs/evidence/forge-quote-preview-pdf-engine-repo-promotion-implementation-audit-076b.json
  if ! rg -n '"status"\s*:\s*"PASS"|"lockedDecision"\s*:\s*"QUOTE_PREVIEW_PDF_ENGINE_REPO_PROMOTION_LOCAL_STATIC_READ_ONLY_IMPLEMENTED"' docs/evidence/forge-quote-preview-pdf-engine-repo-promotion-implementation-audit-076b.json >/dev/null; then
    fail "076B audit exists but does not show PASS/implementation lock"
  fi
  pass "076B audit PASS/implementation lock confirmed"
else
  warn "076B audit file not found; relying on git log/tree markers"
fi

stage "STAGE 3 REQUIRED FILES"
REQUIRED_FILES=(
  "FORGE_MASTER_BUILD_TREE.md"
  "docs/architecture/source-truth/FORGE_UNIFIED_BUILD_TREE_001.md"
  "docs/roadmap/FORGE_ROADMAP_LOCK_001.md"
  "$ADAPTER"
  "$TEST"
  "platform/adapters/quote-preview/quote-preview-pdf-product-intelligence-integration-adapter-075b.js"
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

cat > "$BACKUP_DIR/rollback-076c.sh" <<ROLLBACK
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
echo "rollback 076C complete"
ROLLBACK
chmod +x "$BACKUP_DIR/rollback-076c.sh"
pass "backup created"
pass "rollback created: $BACKUP_DIR/rollback-076c.sh"

stage "STAGE 5 REVALIDATE 076B"
run node --check "$ADAPTER"
run node --check "$TEST"
run node "$TEST"

stage "STAGE 6 SEMANTIC QA"
SEMANTIC_QA_JSON="$(mktemp)"
node <<'NODE' > "$SEMANTIC_QA_JSON"
const assert = require("node:assert/strict");
const adapter = require("./platform/adapters/quote-preview/quote-preview-pdf-engine-repo-promotion-adapter-076b.js");

assert.equal(adapter.ADAPTER_ID, "forge.quote_preview.pdf_engine.repo_promotion.adapter.v1");
assert.equal(adapter.SCHEMA_VERSION, "forge.quote_preview.pdf_engine.repo_promotion.v1");

assert.equal(typeof adapter.getQuotePreviewPdfEnginePromotionManifest, "function");
assert.equal(typeof adapter.prepareQuotePreviewPdfEnginePromotionScope, "function");
assert.equal(typeof adapter.buildQuotePreviewPdfEnginePromotionError, "function");
assert.equal(typeof adapter.validateQuotePreviewPdfEnginePromotionShape, "function");

const manifest = adapter.getQuotePreviewPdfEnginePromotionManifest();

assert.equal(manifest.mode, "read_only");
assert.equal(manifest.routeClass, "preview_safe");
assert.equal(manifest.promotion_constraints.product_intelligence_binding_required, true);
assert.equal(manifest.promotion_constraints.product_intelligence_upstream_semantic_authority, true);
assert.equal(manifest.promotion_constraints.quote_preview_pdf_engine_downstream_consumer_reference_only, true);
assert.equal(manifest.promotion_constraints.local_static_read_only, true);
assert.equal(manifest.promotion_constraints.reference_only, true);
assert.equal(manifest.promotion_constraints.executes_pdf_read, false);
assert.equal(manifest.promotion_constraints.executes_parser, false);
assert.equal(manifest.promotion_constraints.executes_calculator, false);
assert.equal(manifest.promotion_constraints.calls_banxico, false);
assert.equal(manifest.promotion_constraints.calls_provider, false);
assert.equal(manifest.promotion_constraints.writes_quote, false);
assert.equal(manifest.promotion_constraints.creates_quote_truth, false);

const expectedFamilies = ["GMM", "Vida Mujer", "AVE", "Imagina Ser", "ORVI", "SeguBeca"];
for (const family of expectedFamilies) {
  const output = adapter.prepareQuotePreviewPdfEnginePromotionScope({
    quote_preview_pdf_request_id: `qa_076c_${family}`,
    product_family_hint: family,
    source_document_ref: "static_reference_only_no_pdf_read",
    source_evidence_refs: [`qa_076c_${family}_evidence`],
  });

  assert.equal(output.readModelStatus, "ok", `${family} must produce ok promotion`);
  assert.equal(output.product_family, family);
  assert.equal(output.preview_constraints.product_intelligence_binding_required, true);
  assert.equal(output.preview_constraints.reference_only, true);
  assert.equal(output.preview_constraints.no_pdf_read, true);
  assert.equal(output.preview_constraints.no_parser_execution, true);
  assert.equal(output.preview_constraints.no_calculator_execution, true);
  assert.equal(output.preview_constraints.no_banxico_call, true);
  assert.equal(output.preview_constraints.no_provider_call, true);
  assert.equal(output.preview_constraints.no_quote_write, true);
  assert.equal(output.preview_constraints.no_quote_truth, true);
  assert.equal(adapter.validateQuotePreviewPdfEnginePromotionShape(output).ok, true);
}

const imagina = adapter.prepareQuotePreviewPdfEnginePromotionScope({
  quote_preview_pdf_request_id: "qa_076c_imagina_ser",
  product_family_hint: "Imagina Ser",
  source_document_ref: "static_reference_only_no_pdf_read",
  source_evidence_refs: ["qa_076c_imagina_ser_evidence"],
});

assert.equal(imagina.preview_constraints.universal_architecture, false);
assert(JSON.stringify(imagina).includes("not_universal_architecture"));

const missing = adapter.prepareQuotePreviewPdfEnginePromotionScope({
  quote_preview_pdf_request_id: "qa_076c_missing",
  product_family_hint: "UNKNOWN_FAMILY",
  source_document_ref: "static_reference_only_no_pdf_read",
  source_evidence_refs: [],
});

assert.equal(missing.readModelStatus, "error");
assert.equal(missing.safe_error.code, adapter.SAFE_ERROR_CODES.PRODUCT_FAMILY_NOT_MAPPED);
assert.equal(adapter.validateQuotePreviewPdfEnginePromotionShape(missing).ok, true);

for (const [key, value] of Object.entries(adapter.DEFAULT_SAFETY_FLAGS || {})) {
  assert.equal(value, false, `DEFAULT_SAFETY_FLAGS.${key} must be false`);
}

const combined = JSON.stringify({
  manifest,
  imagina,
  missing,
  flags: adapter.DEFAULT_SAFETY_FLAGS,
  safeErrors: adapter.SAFE_ERROR_CODES,
  requiredFields: adapter.REQUIRED_PROMOTION_FIELDS,
});

const forbiddenFragments = [
  '"pdfRead":' + 'true',
  '"parserExecution":' + 'true',
  '"calculatorExecution":' + 'true',
  '"banxicoCall":' + 'true',
  '"realEngineExecution":' + 'true',
  '"providerRuntime":' + 'true',
  '"quoteWrite":' + 'true',
  '"backendConnection":' + 'true'
];

for (const fragment of forbiddenFragments) {
  assert(!combined.includes(fragment), `forbidden true flag found: ${fragment}`);
}

assert(combined.includes("product-intelligence-read-model-adapter-073d.js"));
assert(combined.includes("quote-preview-product-intelligence-binding-adapter-074b.js"));
assert(combined.includes("quote-preview-pdf-product-intelligence-integration-adapter-075b.js"));
assert(combined.includes("forge-quote-pdf-preview-engine.js"));

console.log(JSON.stringify({
  status: "PASS",
  adapterId: adapter.ADAPTER_ID,
  schemaVersion: adapter.SCHEMA_VERSION,
  manifestValidated: true,
  productFamiliesValidated: expectedFamilies,
  imaginaSerNotUniversal: true,
  missingFamilySafeError: true,
  requiredShapeValidates: true,
  allSafetyFlagsFalse: true,
  referenceChainPresent: true,
  noPdfRead: true,
  noParserExecution: true,
  noCalculatorExecution: true,
  noBanxicoCall: true,
  noProviderCall: true,
  noQuoteWrite: true,
  noBackendConnection: true,
  noRealEngineExecution: true
}, null, 2));
NODE

cat "$SEMANTIC_QA_JSON"
pass "semantic QA passed"

stage "STAGE 7 WRITE DOCS / EVIDENCE"

cat > "$ARCH_DOC" <<EOF
# Forge Quote Preview PDF Engine Repo Promotion QA Lock 076C

PHASE=$PHASE

STATUS=PASS

DECISION=$DECISION

LOCKED_DECISION=$LOCKED_DECISION

NEXT=$NEXT

## Purpose

076C QA locks the local/static/read-only Quote Preview PDF Engine repo promotion adapter implemented in 076B.

The QA confirms the promoted repo adapter remains Product Intelligence-bound, reference-only, preview-safe, and no-effect.

## Base Confirmed

076B is closed as:

- \`PASS_076B_QUOTE_PREVIEW_PDF_ENGINE_REPO_PROMOTION_IMPLEMENTATION\`
- \`QUOTE_PREVIEW_PDF_ENGINE_REPO_PROMOTION_LOCAL_STATIC_READ_ONLY_IMPLEMENTED\`
- \`NEXT=076C_QUOTE_PREVIEW_PDF_ENGINE_REPO_PROMOTION_QA_LOCK\`

## QA Validated

- Adapter manifest is valid.
- Schema is \`forge.quote_preview.pdf_engine.repo_promotion.v1\`.
- Mode is \`read_only\`.
- Route class is \`preview_safe\`.
- Product Intelligence binding is required.
- Product Intelligence remains upstream semantic authority.
- Quote Preview PDF Engine remains downstream consumer/reference only.
- Product families map: GMM, Vida Mujer, AVE, Imagina Ser, ORVI, SeguBeca.
- Imagina Ser remains a proven case, not universal architecture.
- Missing/unmapped product family returns safe error.
- Promotion shape validates.
- All safety flags remain false.
- Reference chain includes 073D, 074B, 075B, and PDF preview engine refs.
- No PDF read, parser execution, calculator execution, Banxico call, provider call, quote write, backend connection, or real engine execution occurs.

## Safe Errors

- \`QUOTE_PREVIEW_PDF_ENGINE_PROMOTION_NOT_SCOPED\`
- \`QUOTE_PREVIEW_PDF_ENGINE_PRODUCT_INTELLIGENCE_BINDING_REQUIRED\`
- \`QUOTE_PREVIEW_PDF_ENGINE_PRODUCT_FAMILY_NOT_MAPPED\`
- \`QUOTE_PREVIEW_PDF_ENGINE_PARSER_NOT_MAPPED\`
- \`QUOTE_PREVIEW_PDF_ENGINE_CALCULATOR_NOT_MAPPED\`
- \`QUOTE_PREVIEW_PDF_ENGINE_SOURCE_EVIDENCE_REQUIRED\`
- \`QUOTE_PREVIEW_PDF_ENGINE_FRESHNESS_REQUIRED\`

## Final Decision

DECISION=$DECISION

LOCKED_DECISION=$LOCKED_DECISION

NEXT=$NEXT
EOF

cat > "$EVIDENCE_DOC" <<EOF
# Forge Quote Preview PDF Engine Repo Promotion QA Lock 076C

PHASE=$PHASE

STATUS=PASS

DECISION=$DECISION

LOCKED_DECISION=$LOCKED_DECISION

NEXT=$NEXT

## Evidence Summary

076C validates the 076B Quote Preview PDF Engine repo promotion adapter as local/static/read-only and Product Intelligence-bound.

The adapter remains a repo promotion reference layer only. It does not read PDFs, execute parsers, execute calculators, call Banxico, call providers, write quotes, connect backend, or create quote truth.

## Semantic QA

Validated:

- manifest contract;
- all scoped product families;
- GMM promotion reference;
- Imagina Ser non-universal status;
- missing family safe error;
- required promotion fields;
- safety flags false;
- reference chain to 073D, 074B, 075B, and PDF preview engine;
- no execution true flags.

## Commands

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
# Forge Quote Preview PDF Engine Repo Promotion QA Lock Certificate 076C

PHASE=$PHASE

CERTIFICATE_STATUS=PASS

DECISION=$DECISION

LOCKED_DECISION=$LOCKED_DECISION

NEXT=$NEXT

## Certificate

076C certifies that the Quote Preview PDF Engine repo promotion adapter is QA locked.

Certified statements:

- adapter is local/static/read-only;
- adapter is Product Intelligence-bound;
- Product Intelligence remains upstream semantic authority;
- Quote Preview PDF Engine remains downstream consumer/reference only;
- all scoped product families are mapped;
- Imagina Ser is not universal architecture;
- missing/unmapped product families return safe errors;
- all safety flags remain false;
- no PDF/parser/calculator/Banxico/provider/backend/quote execution is authorized.

## No-Effect Boundary

This QA lock authorizes no PDF reads, parser execution, calculator execution, Banxico calls, quote generation, quote writes, provider calls, backend connection, or real effects.

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
    "phase": "076B_QUOTE_PREVIEW_PDF_ENGINE_REPO_PROMOTION_IMPLEMENTATION",
    "confirmed": true,
    "lockedDecision": "QUOTE_PREVIEW_PDF_ENGINE_REPO_PROMOTION_LOCAL_STATIC_READ_ONLY_IMPLEMENTED"
  },
  "next": "$NEXT",
  "adapter": "$ADAPTER",
  "test": "$TEST",
  "semanticQa": $(cat "$SEMANTIC_QA_JSON"),
  "qaValidated": {
    "manifestValid": true,
    "schemaVersionValid": true,
    "modeReadOnly": true,
    "routeClassPreviewSafe": true,
    "productIntelligenceBindingRequired": true,
    "productIntelligenceUpstreamSemanticAuthority": true,
    "quotePreviewPdfEngineDownstreamConsumerReferenceOnly": true,
    "allProductFamiliesMapped": true,
    "imaginaSerNotUniversalArchitecture": true,
    "missingFamilySafeError": true,
    "promotionShapeValidates": true,
    "allSafetyFlagsFalse": true,
    "referenceChainPresent": true,
    "pdfRead": false,
    "parserExecution": false,
    "calculatorExecution": false,
    "banxicoCall": false,
    "providerCall": false,
    "quoteWrite": false,
    "backendConnection": false,
    "realEngineExecution": false
  },
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

stage "STAGE 8 UPDATE BUILD TREE / ROADMAP"

TREE_BLOCK=$(cat <<EOF

<!-- FORGE:$PHASE:START -->
## 076C Quote Preview PDF Engine Repo Promotion QA Lock

076C QA locks the local/static/read-only Quote Preview PDF Engine repo promotion adapter implemented in 076B.

Locked decision:
\`$LOCKED_DECISION\`

QA validated:

- adapter manifest is valid;
- schema \`forge.quote_preview.pdf_engine.repo_promotion.v1\`;
- mode \`read_only\`;
- route class \`preview_safe\`;
- Product Intelligence binding is required;
- Product Intelligence remains upstream semantic authority;
- Quote Preview PDF Engine remains downstream consumer/reference only;
- GMM, Vida Mujer, AVE, Imagina Ser, ORVI, and SeguBeca are mapped;
- Imagina Ser remains a proven case, not universal architecture;
- missing/unmapped product families return safe errors;
- promotion shape validates;
- all safety flags remain false;
- reference chain includes 073D, 074B, 075B, and PDF preview engine refs;
- no PDF read, parser execution, calculator execution, Banxico call, provider call, quote write, backend connection, or real engine execution occurs.

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

stage "STAGE 8B TRIM TREE EOF BLANKS"
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

stage "STAGE 9 SAVE SCRIPT IN REPO"
mkdir -p "$(dirname "$SCRIPT_IN_REPO")"
cp "$0" "$SCRIPT_IN_REPO"
chmod +x "$SCRIPT_IN_REPO"
pass "$SCRIPT_IN_REPO"

stage "STAGE 10 VALIDATION"
run bash -n "$SCRIPT_IN_REPO"
run node --check "$ADAPTER"
run node --check "$TEST"
run node "$TEST"
run python3 -m json.tool "$AUDIT_JSON"

run rg -n "$PHASE|$DECISION|$LOCKED_DECISION|$NEXT|QUOTE_PREVIEW_PDF_ENGINE_PROMOTION_NOT_SCOPED|QUOTE_PREVIEW_PDF_ENGINE_PRODUCT_INTELLIGENCE_BINDING_REQUIRED|forge.quote_preview.pdf_engine.repo_promotion.v1" \
  FORGE_MASTER_BUILD_TREE.md \
  docs/architecture/source-truth/FORGE_UNIFIED_BUILD_TREE_001.md \
  docs/roadmap/FORGE_ROADMAP_LOCK_001.md \
  "$ARCH_DOC" "$EVIDENCE_DOC" "$CERT_DOC" "$AUDIT_JSON"

run git diff --check

stage "STAGE 11 SAFETY SCAN"
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

stage "STAGE 12 STAGE AUTHORIZED FILES"
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

stage "STAGE 13 COMMIT PUSH"
run git commit -m "docs: lock quote preview pdf engine repo promotion qa"
run git push origin HEAD:main

stage "STAGE 14 FINAL CHECKPOINT"
run git status --short --branch
run git log --oneline -10

SUMMARY=$(cat <<EOF
PASS_076C_QUOTE_PREVIEW_PDF_ENGINE_REPO_PROMOTION_QA_LOCK_COMMIT_PUSH_COMPLETE
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
