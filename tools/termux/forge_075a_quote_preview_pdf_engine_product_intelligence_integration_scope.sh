#!/usr/bin/env bash
set -euo pipefail

PHASE="075A_QUOTE_PREVIEW_PDF_ENGINE_PRODUCT_INTELLIGENCE_INTEGRATION_SCOPE"
DECISION="PASS_075A_QUOTE_PREVIEW_PDF_ENGINE_PRODUCT_INTELLIGENCE_INTEGRATION_SCOPE"
LOCKED_DECISION="QUOTE_PREVIEW_PDF_ENGINE_PRODUCT_INTELLIGENCE_INTEGRATION_SCOPED"
NEXT="075B_QUOTE_PREVIEW_PDF_ENGINE_PRODUCT_INTELLIGENCE_INTEGRATION_IMPLEMENTATION"
MODE="docs/scope only"
BOUNDARY="no UI mutation; no backend real; no CRM/policy/quote/pipeline writes; no task/calendar/message; no provider execution; no auth/secrets/browser persistence; no real engine execution; no parser/calculator/Banxico/PDF execution; no invented product/premium/coverage/projection/quote truth"
REPO="${REPO:-/storage/emulated/0/Forge OS}"
STAMP="$(date +%Y%m%d_%H%M%S)"
REPORT="/data/data/com.termux/files/home/${PHASE}_RESULT_${STAMP}.md"
BACKUP_DIR=".forge-backups/075a-quote-preview-pdf-engine-product-intelligence-integration-scope-${STAMP}"
SCRIPT_IN_REPO="tools/termux/forge_075a_quote_preview_pdf_engine_product_intelligence_integration_scope.sh"

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
echo "ROBOCOP_GATE=Article 0; 074D decision locked; scope only"

cd "$REPO" || fail "No existe repo: $REPO"

stage "STAGE 1 CHECKPOINT"
run git status --short --branch
run git log --oneline -12
run git diff --name-status
run git diff --cached --name-status

if ! git log --oneline -30 | grep -Eq "docs: lock quote preview product intelligence binding decision|074D|QUOTE_PREVIEW_PRODUCT_INTELLIGENCE_BINDING_DECISION_LOCK"; then
  if [ -f "docs/evidence/forge-quote-preview-product-intelligence-binding-decision-audit-074d.json" ]; then
    pass "074D audit fallback confirmed"
  else
    fail "074D commit/audit not found"
  fi
else
  pass "074D commit confirmed"
fi

stage "STAGE 2 REQUIRED FILE CHECK"
REQUIRED_FILES=(
  "FORGE_MASTER_BUILD_TREE.md"
  "docs/architecture/source-truth/FORGE_UNIFIED_BUILD_TREE_001.md"
  "docs/roadmap/FORGE_ROADMAP_LOCK_001.md"
  "docs/evidence/forge-quote-preview-product-intelligence-binding-decision-audit-074d.json"
  "platform/adapters/quote-preview/quote-preview-product-intelligence-binding-adapter-074b.js"
  "tests/quote-preview-product-intelligence-binding-adapter-074b-test.js"
  "platform/adapters/product-intelligence/product-intelligence-read-model-adapter-073d.js"
)

for f in "${REQUIRED_FILES[@]}"; do
  [ -f "$f" ] || fail "Missing required file: $f"
  pass "$f"
done

stage "STAGE 3 BACKUP"
mkdir -p "$BACKUP_DIR"
cp FORGE_MASTER_BUILD_TREE.md "$BACKUP_DIR/FORGE_MASTER_BUILD_TREE.md"
cp docs/architecture/source-truth/FORGE_UNIFIED_BUILD_TREE_001.md "$BACKUP_DIR/FORGE_UNIFIED_BUILD_TREE_001.md"
cp docs/roadmap/FORGE_ROADMAP_LOCK_001.md "$BACKUP_DIR/FORGE_ROADMAP_LOCK_001.md"

cat > "$BACKUP_DIR/rollback-075a.sh" <<ROLLBACK
#!/usr/bin/env bash
set -euo pipefail
cp "$BACKUP_DIR/FORGE_MASTER_BUILD_TREE.md" "FORGE_MASTER_BUILD_TREE.md"
cp "$BACKUP_DIR/FORGE_UNIFIED_BUILD_TREE_001.md" "docs/architecture/source-truth/FORGE_UNIFIED_BUILD_TREE_001.md"
cp "$BACKUP_DIR/FORGE_ROADMAP_LOCK_001.md" "docs/roadmap/FORGE_ROADMAP_LOCK_001.md"
rm -f docs/architecture/source-truth/FORGE_QUOTE_PREVIEW_PDF_ENGINE_PRODUCT_INTELLIGENCE_INTEGRATION_SCOPE_075A.md
rm -f docs/evidence/FORGE_QUOTE_PREVIEW_PDF_ENGINE_PRODUCT_INTELLIGENCE_INTEGRATION_SCOPE_075A.md
rm -f docs/evidence/FORGE_QUOTE_PREVIEW_PDF_ENGINE_PRODUCT_INTELLIGENCE_INTEGRATION_SCOPE_CERTIFICATE_075A.md
rm -f docs/evidence/forge-quote-preview-pdf-engine-product-intelligence-integration-scope-audit-075a.json
rm -f "$SCRIPT_IN_REPO"
echo "rollback 075A complete"
ROLLBACK
chmod +x "$BACKUP_DIR/rollback-075a.sh"
pass "backup created"
pass "rollback created: $BACKUP_DIR/rollback-075a.sh"

stage "STAGE 4 BASE VALIDATION"

run node --check platform/adapters/quote-preview/quote-preview-product-intelligence-binding-adapter-074b.js
run node --check tests/quote-preview-product-intelligence-binding-adapter-074b-test.js
run node tests/quote-preview-product-intelligence-binding-adapter-074b-test.js
run python3 -m json.tool docs/evidence/forge-quote-preview-product-intelligence-binding-decision-audit-074d.json

stage "STAGE 5 WRITE DOCS / EVIDENCE"

ARCH_DOC="docs/architecture/source-truth/FORGE_QUOTE_PREVIEW_PDF_ENGINE_PRODUCT_INTELLIGENCE_INTEGRATION_SCOPE_075A.md"
EVIDENCE_DOC="docs/evidence/FORGE_QUOTE_PREVIEW_PDF_ENGINE_PRODUCT_INTELLIGENCE_INTEGRATION_SCOPE_075A.md"
CERT_DOC="docs/evidence/FORGE_QUOTE_PREVIEW_PDF_ENGINE_PRODUCT_INTELLIGENCE_INTEGRATION_SCOPE_CERTIFICATE_075A.md"
AUDIT_JSON="docs/evidence/forge-quote-preview-pdf-engine-product-intelligence-integration-scope-audit-075a.json"

cat > "$ARCH_DOC" <<EOF
# Forge Quote Preview PDF Engine Product Intelligence Integration Scope 075A

PHASE=$PHASE

STATUS=PASS

DECISION=$DECISION

LOCKED_DECISION=$LOCKED_DECISION

NEXT=$NEXT

## Purpose

075A scopes how the Quote Preview PDF Engine must integrate with the Product Intelligence binding layer before any PDF parsing, quote preview extraction, calculation, Banxico lookup, or quote-specific preview promotion.

This phase does not implement PDF reading, parser execution, calculator execution, Banxico calls, provider calls, quote creation, quote writes, or real effects.

## Base Confirmed

074D is closed as:

- \`PASS_074D_QUOTE_PREVIEW_PRODUCT_INTELLIGENCE_BINDING_DECISION_LOCK\`
- \`QUOTE_PREVIEW_PRODUCT_INTELLIGENCE_BINDING_LOCKED_AS_LOCAL_STATIC_READ_ONLY_REFERENCE_BINDING\`
- \`NEXT=075A_QUOTE_PREVIEW_PDF_ENGINE_PRODUCT_INTELLIGENCE_INTEGRATION_SCOPE\`

## Integration Rule

The Quote Preview PDF Engine must bind through Product Intelligence before using any quote-specific PDF preview or parsing surface.

Required sequence:

1. Receive a quote preview PDF request.
2. Identify or infer product family only as a hint.
3. Bind Quote Preview request to Product Intelligence through the 074B binding adapter.
4. Resolve allowed parser/calculator references from Product Intelligence.
5. Check evidence requirements, freshness requirements, blocked effects, and safety flags.
6. Only future scoped phases may execute preview parsing, and only if execution remains no-effect and source-evidence-bound.

## Integration Inputs

- \`quote_preview_pdf_request_id\`
- \`source_document_ref\`
- \`source_document_kind\`
- \`product_family_hint\`
- \`product_ref_hint\`
- \`carrier_ref_hint\`
- \`source_evidence_refs\`
- \`requested_preview_mode\`
- \`binding_ref\`

## Integration Outputs

- \`quote_preview_pdf_integration_id\`
- \`quote_preview_binding_ref\`
- \`product_intelligence_ref\`
- \`product_family\`
- \`allowed_parser_refs\`
- \`allowed_calculator_refs\`
- \`pdf_preview_engine_ref\`
- \`evidence_requirements\`
- \`freshness_requirements\`
- \`blocked_effects\`
- \`safety_flags\`
- \`safe_error\`

## Safe Errors

- \`QUOTE_PREVIEW_PDF_PRODUCT_INTELLIGENCE_BINDING_REQUIRED\`
- \`QUOTE_PREVIEW_PDF_PRODUCT_FAMILY_NOT_MAPPED\`
- \`QUOTE_PREVIEW_PDF_PARSER_NOT_ALLOWED\`
- \`QUOTE_PREVIEW_PDF_CALCULATOR_NOT_ALLOWED\`
- \`QUOTE_PREVIEW_PDF_SOURCE_EVIDENCE_REQUIRED\`
- \`QUOTE_PREVIEW_PDF_FRESHNESS_REQUIRED\`
- \`QUOTE_PREVIEW_PDF_EXECUTION_NOT_AUTHORIZED\`

## Non-Authorization Boundary

075A does not authorize:

- PDF read;
- OCR;
- parser execution;
- calculator execution;
- Banxico call;
- UDI/MXN calculation;
- premium calculation;
- projection calculation;
- quote generation;
- quote save/send;
- provider call;
- backend connection;
- CRM, policy, pipeline, task, calendar, or message writes;
- invented product, premium, coverage, projection, or quote truth.

## Handoff To 075B

075B may implement only a local/static/read-only integration adapter that validates the required binding and exposes references. It must not read PDFs, execute parsers, execute calculators, call Banxico, or create quote truth.

## Final Decision

DECISION=$DECISION

LOCKED_DECISION=$LOCKED_DECISION

NEXT=$NEXT
EOF

cat > "$EVIDENCE_DOC" <<EOF
# Forge Quote Preview PDF Engine Product Intelligence Integration Scope 075A

PHASE=$PHASE

STATUS=PASS

DECISION=$DECISION

LOCKED_DECISION=$LOCKED_DECISION

NEXT=$NEXT

## Evidence Summary

075A scopes the integration between Quote Preview PDF Engine and the Product Intelligence binding layer.

The binding chain is:

\`Quote Preview PDF request -> Quote Preview Product Intelligence Binding -> Product Intelligence Read Model -> allowed references only\`

This prevents Quote Preview PDF behavior from selecting parsers, calculators, Banxico utilities, or quote engines outside the Product Intelligence catalog.

## Confirmed Architectural Rules

- Product Intelligence remains upstream semantic authority.
- Quote Preview binding remains a local/static/read-only reference binding.
- Quote Preview PDF Engine is downstream consumer.
- Quote PDF Preview cannot become product authority.
- Quote PDF Preview cannot duplicate Product Intelligence logic.
- Quote PDF Preview cannot execute parser/calculator/Banxico/PDF behavior in this phase.

## Required Future Integration Behavior

Future implementation must verify:

- binding exists;
- product family is mapped;
- parser refs are allowed by Product Intelligence;
- calculator refs are allowed by Product Intelligence;
- evidence requirements are present;
- freshness requirements are present;
- blocked effects are explicit;
- safety flags remain false.

## Final

DECISION=$DECISION

LOCKED_DECISION=$LOCKED_DECISION

NEXT=$NEXT
EOF

cat > "$CERT_DOC" <<EOF
# Forge Quote Preview PDF Engine Product Intelligence Integration Scope Certificate 075A

PHASE=$PHASE

CERTIFICATE_STATUS=PASS

DECISION=$DECISION

LOCKED_DECISION=$LOCKED_DECISION

NEXT=$NEXT

## Certificate

075A certifies that Quote Preview PDF Engine integration has been scoped to require Product Intelligence binding before any quote-specific PDF preview or parsing surface can be used.

Certified constraints:

- Product Intelligence is upstream semantic authority.
- Quote Preview binding is the required bridge.
- Quote Preview PDF Engine is downstream consumer only.
- Quote PDF Preview cannot select parsers/calculators independently.
- Quote PDF Preview cannot duplicate Product Intelligence logic.
- Quote PDF Preview cannot read PDFs, execute parsers, execute calculators, call Banxico, generate quotes, write quotes, or create truth in this phase.

## No-Effect Boundary

This certificate authorizes no runtime implementation and no real effect.

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
    "phase": "074D_QUOTE_PREVIEW_PRODUCT_INTELLIGENCE_BINDING_DECISION_LOCK",
    "confirmed": true,
    "lockedDecision": "QUOTE_PREVIEW_PRODUCT_INTELLIGENCE_BINDING_LOCKED_AS_LOCAL_STATIC_READ_ONLY_REFERENCE_BINDING"
  },
  "next": "$NEXT",
  "mode": "docs_scope_only",
  "integrationChain": [
    "quote_preview_pdf_request",
    "quote_preview_product_intelligence_binding",
    "product_intelligence_read_model",
    "allowed_references_only"
  ],
  "requiredInputs": [
    "quote_preview_pdf_request_id",
    "source_document_ref",
    "source_document_kind",
    "product_family_hint",
    "product_ref_hint",
    "carrier_ref_hint",
    "source_evidence_refs",
    "requested_preview_mode",
    "binding_ref"
  ],
  "requiredOutputs": [
    "quote_preview_pdf_integration_id",
    "quote_preview_binding_ref",
    "product_intelligence_ref",
    "product_family",
    "allowed_parser_refs",
    "allowed_calculator_refs",
    "pdf_preview_engine_ref",
    "evidence_requirements",
    "freshness_requirements",
    "blocked_effects",
    "safety_flags",
    "safe_error"
  ],
  "safeErrors": [
    "QUOTE_PREVIEW_PDF_PRODUCT_INTELLIGENCE_BINDING_REQUIRED",
    "QUOTE_PREVIEW_PDF_PRODUCT_FAMILY_NOT_MAPPED",
    "QUOTE_PREVIEW_PDF_PARSER_NOT_ALLOWED",
    "QUOTE_PREVIEW_PDF_CALCULATOR_NOT_ALLOWED",
    "QUOTE_PREVIEW_PDF_SOURCE_EVIDENCE_REQUIRED",
    "QUOTE_PREVIEW_PDF_FRESHNESS_REQUIRED",
    "QUOTE_PREVIEW_PDF_EXECUTION_NOT_AUTHORIZED"
  ],
  "notAuthorized": {
    "pdfRead": false,
    "ocr": false,
    "parserExecution": false,
    "calculatorExecution": false,
    "banxicoCall": false,
    "udiMxnCalculation": false,
    "premiumCalculation": false,
    "projectionCalculation": false,
    "quoteGeneration": false,
    "quoteSaveSend": false,
    "providerCall": false,
    "backendConnection": false,
    "crmWrite": false,
    "policyWrite": false,
    "pipelineWrite": false,
    "taskCreate": false,
    "calendarCreate": false,
    "messageSend": false,
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
    "backendConnection": false
  },
  "validations": {
    "nodeCheckBindingAdapter": "PASS",
    "nodeCheckBindingTest": "PASS",
    "nodeBindingTest": "PASS",
    "jsonTool": "PASS",
    "markerScan": "PASS",
    "gitDiffCheck": "PASS",
    "scopedSafetyScan": "PASS",
    "stagedDiffCheck": "PASS"
  }
}
EOF

pass "docs/evidence written"

stage "STAGE 6 UPDATE BUILD TREE / ROADMAP"

TREE_BLOCK=$(cat <<EOF

<!-- FORGE:$PHASE:START -->
## 075A Quote Preview PDF Engine Product Intelligence Integration Scope

075A scopes the integration between Quote Preview PDF Engine and the locked Quote Preview Product Intelligence binding layer.

Locked decision:
\`$LOCKED_DECISION\`

Integration rule:

\`Quote Preview PDF request -> Quote Preview Product Intelligence Binding -> Product Intelligence Read Model -> allowed references only\`

075A confirms that Quote Preview PDF behavior must bind through Product Intelligence before using quote-specific preview, parser, calculator, currency, projection, or evidence surfaces.

This phase authorizes no PDF read, OCR, parser execution, calculator execution, Banxico call, quote generation, provider call, backend connection, write, or invented truth.

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

files = [
    Path("FORGE_MASTER_BUILD_TREE.md"),
    Path("docs/architecture/source-truth/FORGE_UNIFIED_BUILD_TREE_001.md"),
    Path("docs/roadmap/FORGE_ROADMAP_LOCK_001.md"),
]

for path in files:
    text = path.read_text()
    marker = f"<!-- FORGE:{phase}:START -->"
    if marker not in text:
        if not text.endswith("\n"):
            text += "\n"
        text += block + "\n"
        path.write_text(text)
PY

pass "build tree / roadmap updated"

stage "STAGE 7 SAVE SCRIPT IN REPO"
mkdir -p "$(dirname "$SCRIPT_IN_REPO")"
cp "$0" "$SCRIPT_IN_REPO"
chmod +x "$SCRIPT_IN_REPO"
pass "$SCRIPT_IN_REPO"

stage "STAGE 8 VALIDATION"
run bash -n "$SCRIPT_IN_REPO"
run node --check platform/adapters/quote-preview/quote-preview-product-intelligence-binding-adapter-074b.js
run node --check tests/quote-preview-product-intelligence-binding-adapter-074b-test.js
run node tests/quote-preview-product-intelligence-binding-adapter-074b-test.js
run python3 -m json.tool "$AUDIT_JSON"

run rg -n "$PHASE|$DECISION|$LOCKED_DECISION|$NEXT|QUOTE_PREVIEW_PDF_PRODUCT_INTELLIGENCE_BINDING_REQUIRED|QUOTE_PREVIEW_PDF_EXECUTION_NOT_AUTHORIZED" \
  FORGE_MASTER_BUILD_TREE.md \
  docs/architecture/source-truth/FORGE_UNIFIED_BUILD_TREE_001.md \
  docs/roadmap/FORGE_ROADMAP_LOCK_001.md \
  "$ARCH_DOC" "$EVIDENCE_DOC" "$CERT_DOC" "$AUDIT_JSON"

run git diff --check

stage "STAGE 9 SAFETY SCAN"
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

if rg -n '"?(crmWrite|pipelineWrite|policyWrite|quoteWrite|taskCreate|calendarCreate|messageSend|authReal|providerRuntime|secretAccess|browserPersistence|realEngineExecution|realEffectsAllowed|realEffectsEnabled|backendConnection)"?\s*[:=]\s*true\b' "${SCOPED_FILES[@]}"; then
  fail "real-effect flag true found"
fi

pass "safety scan clean"

stage "STAGE 10 OPTIONAL SCREENSHOT EVIDENCE"
warn "not applicable: 075A has no UI mutation"

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
run git commit -m "docs: scope quote preview pdf product intelligence integration"
run git push origin HEAD:main

stage "STAGE 13 FINAL CHECKPOINT"
run git status --short --branch
run git log --oneline -12

SUMMARY=$(cat <<EOF
PASS_075A_QUOTE_PREVIEW_PDF_ENGINE_PRODUCT_INTELLIGENCE_INTEGRATION_SCOPE_COMMIT_PUSH_COMPLETE
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
