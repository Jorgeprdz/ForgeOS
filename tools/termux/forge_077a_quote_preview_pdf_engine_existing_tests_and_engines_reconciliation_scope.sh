#!/usr/bin/env bash
set -euo pipefail

PHASE="077A_QUOTE_PREVIEW_PDF_ENGINE_EXISTING_TESTS_AND_ENGINES_RECONCILIATION_SCOPE"
DECISION="PASS_077A_QUOTE_PREVIEW_PDF_ENGINE_EXISTING_TESTS_AND_ENGINES_RECONCILIATION_SCOPE"
LOCKED_DECISION="QUOTE_PREVIEW_PDF_ENGINE_EXISTING_TESTS_AND_ENGINES_RECONCILIATION_SCOPED"
NEXT="077B_QUOTE_PREVIEW_PDF_ENGINE_EXISTING_SURFACES_CANONICAL_MAPPING_IMPLEMENTATION"
MODE="docs/scope only; reconciliation before implementation"
BOUNDARY="no UI mutation; no backend real; no CRM/policy/quote/pipeline writes; no task/calendar/message; no provider execution with effects; no auth/secrets/browser persistence; no real engine execution; no parser/calculator/Banxico/PDF execution; no invented product/premium/coverage/projection/quote truth; no new extractor/parser/calculator before reconciliation"
REPO="${REPO:-/storage/emulated/0/Forge OS}"
STAMP="$(date +%Y%m%d_%H%M%S)"
REPORT="/data/data/com.termux/files/home/${PHASE}_RESULT_${STAMP}.md"
BACKUP_DIR=".forge-backups/077a-quote-preview-pdf-engine-existing-tests-and-engines-reconciliation-scope-${STAMP}"
SCRIPT_IN_REPO="tools/termux/forge_077a_quote_preview_pdf_engine_existing_tests_and_engines_reconciliation_scope.sh"

ARCH_DOC="docs/architecture/source-truth/FORGE_QUOTE_PREVIEW_PDF_ENGINE_EXISTING_TESTS_AND_ENGINES_RECONCILIATION_SCOPE_077A.md"
EVIDENCE_DOC="docs/evidence/FORGE_QUOTE_PREVIEW_PDF_ENGINE_EXISTING_TESTS_AND_ENGINES_RECONCILIATION_SCOPE_077A.md"
CERT_DOC="docs/evidence/FORGE_QUOTE_PREVIEW_PDF_ENGINE_EXISTING_TESTS_AND_ENGINES_RECONCILIATION_SCOPE_CERTIFICATE_077A.md"
AUDIT_JSON="docs/evidence/forge-quote-preview-pdf-engine-existing-tests-and-engines-reconciliation-scope-audit-077a.json"

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
echo "ROBOCOP_GATE=Article 0; 076D closed; 077A scope only; no implementation"

cd "$REPO" || fail "No existe repo: $REPO"

stage "STAGE 1 CHECKPOINT"
run git status --short --branch
run git log --oneline -12
run git diff --name-status
run git diff --cached --name-status

stage "STAGE 2 CONFIRM BASE 076D"
if git log --oneline -50 | grep -Eq "076D|lock quote preview pdf engine repo promotion decision|QUOTE_PREVIEW_PDF_ENGINE_REPO_PROMOTION_LOCKED_AS_LOCAL_STATIC_READ_ONLY_REFERENCE_ADAPTER"; then
  pass "076D commit found in recent history"
elif [ -f "docs/evidence/forge-quote-preview-pdf-engine-repo-promotion-decision-audit-076d.json" ]; then
  pass "076D audit fallback found"
else
  fail "076D base not found"
fi

if [ -f "docs/evidence/forge-quote-preview-pdf-engine-repo-promotion-decision-audit-076d.json" ]; then
  run python3 -m json.tool docs/evidence/forge-quote-preview-pdf-engine-repo-promotion-decision-audit-076d.json
  if ! rg -n '"status"\s*:\s*"PASS"|"next"\s*:\s*"077A_QUOTE_PREVIEW_PDF_ENGINE_EXISTING_TESTS_AND_ENGINES_RECONCILIATION_SCOPE"' docs/evidence/forge-quote-preview-pdf-engine-repo-promotion-decision-audit-076d.json >/dev/null; then
    fail "076D audit exists but does not confirm PASS and corrected 077A next"
  fi
  pass "076D audit PASS/correct next confirmed"
else
  warn "076D audit file not found; relying on git log/tree markers"
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
if rec.get("next_should_be_reconciliation_scope") != "077A_QUOTE_PREVIEW_PDF_ENGINE_EXISTING_TESTS_AND_ENGINES_RECONCILIATION_SCOPE":
    raise SystemExit("Discovery next does not match reconciliation scope")
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

stage "STAGE 4 REQUIRED REPO FILES"
CORE_FILES=(
  "FORGE_MASTER_BUILD_TREE.md"
  "docs/architecture/source-truth/FORGE_UNIFIED_BUILD_TREE_001.md"
  "docs/roadmap/FORGE_ROADMAP_LOCK_001.md"
  "platform/adapters/quote-preview/quote-preview-pdf-engine-repo-promotion-adapter-076b.js"
  "tests/quote-preview-pdf-engine-repo-promotion-adapter-076b-test.js"
)

for f in "${CORE_FILES[@]}"; do
  [ -f "$f" ] || fail "Missing core file: $f"
  pass "$f"
done

stage "STAGE 5 EXISTING SURFACE PRESENCE CHECK"
CANDIDATE_SURFACES=(
  "policy-operations/evidence/policy-ocr-engine.js"
  "product-intelligence/evidence/forge-quote-pdf-preview-engine.js"
  "product-intelligence/evidence/solucionline-retirement-parser.js"
  "product-intelligence/evidence/gmm-quote-parser.js"
  "gmm-quote-summary-engine.js"
  "retirement-future-udi-projection-engine.js"
  "imagina-ser-future-mxn-bridge.js"
  "shared-banxico-rate-engine.js"
  "shared-banxico-edge-provider.js"
  "exchange-rate-cache-engine.js"
  "platform/adapters/product-intelligence/product-intelligence-read-model-adapter-073d.js"
  "platform/adapters/quote-preview/quote-preview-product-intelligence-binding-adapter-074b.js"
  "platform/adapters/quote-preview/quote-preview-pdf-product-intelligence-integration-adapter-075b.js"
)

PRESENT_SURFACES_FILE="$(mktemp)"
MISSING_SURFACES_FILE="$(mktemp)"

for f in "${CANDIDATE_SURFACES[@]}"; do
  if [ -f "$f" ]; then
    echo "$f" >> "$PRESENT_SURFACES_FILE"
    pass "present: $f"
  else
    echo "$f" >> "$MISSING_SURFACES_FILE"
    warn "missing candidate surface: $f"
  fi
done

PRESENT_SURFACES_JSON="$(mktemp)"
python3 - <<'PY' "$PRESENT_SURFACES_FILE" "$MISSING_SURFACES_FILE" "$PRESENT_SURFACES_JSON"
import json, sys
from pathlib import Path

present = [line.strip() for line in Path(sys.argv[1]).read_text().splitlines() if line.strip()]
missing = [line.strip() for line in Path(sys.argv[2]).read_text().splitlines() if line.strip()]
Path(sys.argv[3]).write_text(json.dumps({
    "present": present,
    "missing": missing,
    "presentCount": len(present),
    "missingCount": len(missing),
}, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
PY

cat "$PRESENT_SURFACES_JSON"

stage "STAGE 6 BACKUP"
mkdir -p "$BACKUP_DIR"
cp FORGE_MASTER_BUILD_TREE.md "$BACKUP_DIR/FORGE_MASTER_BUILD_TREE.md"
cp docs/architecture/source-truth/FORGE_UNIFIED_BUILD_TREE_001.md "$BACKUP_DIR/FORGE_UNIFIED_BUILD_TREE_001.md"
cp docs/roadmap/FORGE_ROADMAP_LOCK_001.md "$BACKUP_DIR/FORGE_ROADMAP_LOCK_001.md"

cat > "$BACKUP_DIR/rollback-077a.sh" <<ROLLBACK
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
echo "rollback 077A complete"
ROLLBACK
chmod +x "$BACKUP_DIR/rollback-077a.sh"
pass "backup created"
pass "rollback created: $BACKUP_DIR/rollback-077a.sh"

stage "STAGE 7 REVALIDATE EXISTING ADAPTERS"
run node --check platform/adapters/quote-preview/quote-preview-pdf-engine-repo-promotion-adapter-076b.js
run node --check tests/quote-preview-pdf-engine-repo-promotion-adapter-076b-test.js
run node tests/quote-preview-pdf-engine-repo-promotion-adapter-076b-test.js

stage "STAGE 8 WRITE DOCS / EVIDENCE"
mkdir -p "$(dirname "$ARCH_DOC")" "$(dirname "$EVIDENCE_DOC")"

cat > "$ARCH_DOC" <<EOF
# Forge Quote Preview PDF Engine Existing Tests and Engines Reconciliation Scope 077A

PHASE=$PHASE

STATUS=PASS

DECISION=$DECISION

LOCKED_DECISION=$LOCKED_DECISION

NEXT=$NEXT

## Purpose

077A scopes reconciliation of existing quote/PDF tests, fixtures, engines, parsers, preview surfaces, calculators, rate providers, and Product Intelligence adapters.

077A is not an implementation phase. It does not create a new extractor, parser, calculator, Banxico connector, quote engine, or provider bridge.

## Why This Phase Exists

A read-only Codex audit and Forge discovery found partial duplication risk.

The current architecture is on track only if Forge reconciles existing repo surfaces before adding any new PDF extraction or quote parsing work.

The audit verdict is:

\`VERDICT=PARTIAL_DUPLICATION_RISK\`

The duplication risk is:

\`DUPLICATION_RISK=MEDIUM\`

The mandatory rule is:

\`NO_NEW_EXTRACTOR_BEFORE_RECONCILIATION=YES\`

## Base Confirmed

076D is closed as:

- \`PASS_076D_QUOTE_PREVIEW_PDF_ENGINE_REPO_PROMOTION_DECISION_LOCK\`
- \`QUOTE_PREVIEW_PDF_ENGINE_REPO_PROMOTION_LOCKED_AS_LOCAL_STATIC_READ_ONLY_REFERENCE_ADAPTER\`
- \`NEXT=077A_QUOTE_PREVIEW_PDF_ENGINE_EXISTING_TESTS_AND_ENGINES_RECONCILIATION_SCOPE\`

## Discovery Evidence

Discovery JSON:

\`$DISCOVERY_JSON_FOUND\`

Discovery report:

\`${DISCOVERY_REPORT_MD:-not_found}\`

Discovery confirmed that existing tests and quote/PDF engine candidates exist and must be reconciled before implementation.

## Candidate Canonical Boundaries

077A scopes these candidate decisions for 077B:

| Area | Candidate canonical source | Status |
|---|---|---|
| PDF extraction | \`policy-operations/evidence/policy-ocr-engine.js\` | candidate canonical |
| PDF preview/orchestration | \`product-intelligence/evidence/forge-quote-pdf-preview-engine.js\` | candidate orchestrator/consumer |
| Solucionline parser | \`product-intelligence/evidence/solucionline-retirement-parser.js\` vs parsing inside preview engine | CANONICAL_DECISION_REQUIRED |
| Imagina Ser calculations | \`retirement-future-udi-projection-engine.js\` + \`imagina-ser-future-mxn-bridge.js\` | candidate canonical |
| UDI future projection | \`retirement-future-udi-projection-engine.js\` | candidate canonical |
| Banxico current rates | \`exchange-rate-cache-engine.js\` over \`shared-banxico-rate-engine.js\` / \`shared-banxico-edge-provider.js\` | candidate canonical chain |
| GMM quote parsing | \`product-intelligence/evidence/gmm-quote-parser.js\` | candidate canonical |
| GMM quote summary | \`gmm-quote-summary-engine.js\` | candidate summary/read model source |
| Product family semantics | \`platform/adapters/product-intelligence/product-intelligence-read-model-adapter-073d.js\` | current upstream semantic authority |
| Quote Preview binding | \`platform/adapters/quote-preview/quote-preview-product-intelligence-binding-adapter-074b.js\` | current binding |
| PDF-to-Product Intelligence integration | \`platform/adapters/quote-preview/quote-preview-pdf-product-intelligence-integration-adapter-075b.js\` | current integration |
| PDF engine repo promotion guardrail | \`platform/adapters/quote-preview/quote-preview-pdf-engine-repo-promotion-adapter-076b.js\` | current reference/promotion adapter |

## Candidate Canonical Tests

077B must inspect and classify at least these tests if present:

- \`tests/real-pdf-ocr-test.js\`
- \`tests/real-gmm-quote-test.js\`
- \`tests/gmm-out-of-pocket-test.js\`
- \`tests/real-retirement-scenario-test.js\`
- \`tests/real-retirement-mxn-scenario-test.js\`
- \`imagina-ser-master-test.js\`
- \`imagina-ser-banxico-integration-test.js\`
- \`retirement-future-udi-projection-smoke-test.js\`
- \`tests/product-intelligence/forge-quote-pdf-preview-engine-test.js\`
- \`tests/quote-preview-pdf-engine-repo-promotion-adapter-076b-test.js\`

## 077B Required Work

077B must implement a local/static/read-only canonical mapping of existing surfaces.

077B must not execute PDF reads, parsers, calculators, Banxico, providers, backend calls, quote writes, or real effects.

077B must map:

- \`surface_id\`
- \`file_path\`
- \`surface_type\`
- \`domain\`
- \`product_family\`
- \`canonical_candidate\`
- \`canonical_status\`
- \`allowed_role\`
- \`blocked_growth\`
- \`test_refs\`
- \`engine_refs\`
- \`product_intelligence_binding_required\`
- \`quote_preview_downstream_only\`
- \`safe_errors\`
- \`safety_flags\`

## Blocked Growth

The following boundaries are scoped:

- \`quote-preview-pdf-engine-repo-promotion-adapter-076b.js\` must not grow into extraction, parsing, calculation, provider, or quote write behavior.
- \`forge-quote-pdf-preview-engine.js\` must not become a universal parser or universal calculator.
- \`solucionline-retirement-parser.js\` must not grow in parallel until the Solucionline parser boundary is decided.
- \`gmm-quote-parser.js\` and \`gmm-quote-summary-engine.js\` must be separated by parser vs summary/read-model responsibilities.
- No new extractor, parser, calculator, rate engine, quote engine, or provider bridge may be created before 077B/077C/077D reconciliation locks.

## Not Authorized

077A does not authorize:

- PDF read;
- OCR execution;
- parser execution;
- calculator execution;
- Banxico call;
- provider call;
- quote generation;
- quote write or send;
- CRM, policy, pipeline, task, calendar, or message writes;
- backend connection;
- real engine execution;
- invented product, premium, coverage, projection, or quote truth.

## Final Decision

DECISION=$DECISION

LOCKED_DECISION=$LOCKED_DECISION

NEXT=$NEXT
EOF

cat > "$EVIDENCE_DOC" <<EOF
# Forge Quote Preview PDF Engine Existing Tests and Engines Reconciliation Scope 077A

PHASE=$PHASE

STATUS=PASS

DECISION=$DECISION

LOCKED_DECISION=$LOCKED_DECISION

NEXT=$NEXT

## Evidence Summary

077A scopes reconciliation of existing quote/PDF tests and engines.

The phase exists because Codex audit and Forge discovery confirmed partial duplication risk. Existing extractors, preview engines, parsers, calculators, Banxico/rate providers, and real tests must be classified before any new extractor or parsing work.

## Discovery Evidence

Discovery JSON:

\`$DISCOVERY_JSON_FOUND\`

Discovery report:

\`${DISCOVERY_REPORT_MD:-not_found}\`

Discovery digest:

\`\`\`json
$(cat "$DISCOVERY_DIGEST_JSON")
\`\`\`

## Candidate Surface Presence

\`\`\`json
$(cat "$PRESENT_SURFACES_JSON")
\`\`\`

## Audit Result Incorporated

\`\`\`text
AUDIT_COMPLETE
VERDICT=PARTIAL_DUPLICATION_RISK
SHOULD_CONTINUE_077A=YES
RECOMMENDED_NEXT=077A_QUOTE_PREVIEW_PDF_ENGINE_EXISTING_TESTS_AND_ENGINES_RECONCILIATION_SCOPE
DUPLICATION_RISK=MEDIUM
CANONICAL_PDF_ENGINE=policy-operations/evidence/policy-ocr-engine.js
CANONICAL_TEST_SOURCE=CANONICAL_DECISION_REQUIRED
NO_NEW_EXTRACTOR_BEFORE_RECONCILIATION=YES
\`\`\`

## Commands

- \`python3 -m json.tool "$DISCOVERY_JSON_FOUND"\`
- \`node --check platform/adapters/quote-preview/quote-preview-pdf-engine-repo-promotion-adapter-076b.js\`
- \`node --check tests/quote-preview-pdf-engine-repo-promotion-adapter-076b-test.js\`
- \`node tests/quote-preview-pdf-engine-repo-promotion-adapter-076b-test.js\`
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
# Forge Quote Preview PDF Engine Existing Tests and Engines Reconciliation Scope Certificate 077A

PHASE=$PHASE

CERTIFICATE_STATUS=PASS

DECISION=$DECISION

LOCKED_DECISION=$LOCKED_DECISION

NEXT=$NEXT

## Certificate

077A certifies that Forge must reconcile existing quote/PDF tests and engines before creating or promoting any additional PDF extraction, parser, calculator, Banxico, provider, or quote engine behavior.

Certified statements:

- partial duplication risk exists;
- 076B/076D remain valid as read-only governance adapters;
- no new PDF extractor is authorized before reconciliation;
- no new parser is authorized before reconciliation;
- no new calculator is authorized before reconciliation;
- no new Banxico/rate provider behavior is authorized before reconciliation;
- existing real tests must be reviewed for canonical evidence status;
- 077B must implement canonical mapping only;
- Product Intelligence remains upstream semantic authority;
- Quote Preview remains downstream consumer.

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
    "phase": "076D_QUOTE_PREVIEW_PDF_ENGINE_REPO_PROMOTION_DECISION_LOCK",
    "confirmed": true,
    "lockedDecision": "QUOTE_PREVIEW_PDF_ENGINE_REPO_PROMOTION_LOCKED_AS_LOCAL_STATIC_READ_ONLY_REFERENCE_ADAPTER"
  },
  "next": "$NEXT",
  "mode": "docs_scope_only_reconciliation_before_implementation",
  "codexAudit": {
    "verdict": "PARTIAL_DUPLICATION_RISK",
    "shouldContinue077A": true,
    "duplicationRisk": "MEDIUM",
    "canonicalPdfEngine": "policy-operations/evidence/policy-ocr-engine.js",
    "canonicalTestSource": "CANONICAL_DECISION_REQUIRED",
    "noNewExtractorBeforeReconciliation": true
  },
  "discoveryEvidence": $(cat "$DISCOVERY_DIGEST_JSON"),
  "candidateSurfacePresence": $(cat "$PRESENT_SURFACES_JSON"),
  "scope": {
    "existingTestsAndEnginesReconciliationRequired": true,
    "newPdfExtractorAllowed": false,
    "newParserAllowed": false,
    "newCalculatorAllowed": false,
    "newBanxicoProviderAllowed": false,
    "newQuoteEngineAllowed": false,
    "implementationReadiness": false,
    "productIntelligenceUpstream": true,
    "quotePreviewDownstream": true
  },
  "candidateCanonicalBoundaries": {
    "pdfExtraction": "policy-operations/evidence/policy-ocr-engine.js",
    "pdfPreviewOrchestration": "product-intelligence/evidence/forge-quote-pdf-preview-engine.js",
    "solucionlineParser": "CANONICAL_DECISION_REQUIRED",
    "imaginaSerCalculations": [
      "retirement-future-udi-projection-engine.js",
      "imagina-ser-future-mxn-bridge.js"
    ],
    "udiFutureProjection": "retirement-future-udi-projection-engine.js",
    "banxicoCurrentRates": [
      "exchange-rate-cache-engine.js",
      "shared-banxico-rate-engine.js",
      "shared-banxico-edge-provider.js"
    ],
    "gmmQuoteParsing": "product-intelligence/evidence/gmm-quote-parser.js",
    "gmmQuoteSummary": "gmm-quote-summary-engine.js",
    "productFamilySemantics": "platform/adapters/product-intelligence/product-intelligence-read-model-adapter-073d.js",
    "quotePreviewBinding": "platform/adapters/quote-preview/quote-preview-product-intelligence-binding-adapter-074b.js",
    "pdfToProductIntelligenceIntegration": "platform/adapters/quote-preview/quote-preview-pdf-product-intelligence-integration-adapter-075b.js",
    "repoPromotionGuardrail": "platform/adapters/quote-preview/quote-preview-pdf-engine-repo-promotion-adapter-076b.js"
  },
  "required077BMappingFields": [
    "surface_id",
    "file_path",
    "surface_type",
    "domain",
    "product_family",
    "canonical_candidate",
    "canonical_status",
    "allowed_role",
    "blocked_growth",
    "test_refs",
    "engine_refs",
    "product_intelligence_binding_required",
    "quote_preview_downstream_only",
    "safe_errors",
    "safety_flags"
  ],
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
    "parserExecution": false,
    "calculatorExecution": false,
    "banxicoCall": false
  },
  "validations": {
    "base076D": "PASS",
    "discoveryJson": "PASS",
    "nodeCheck076BAdapter": "PASS",
    "nodeCheck076BTest": "PASS",
    "nodeTest076B": "PASS",
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
## 077A Quote Preview PDF Engine Existing Tests and Engines Reconciliation Scope

077A scopes reconciliation of existing quote/PDF tests and engines before any new extractor, parser, calculator, Banxico, provider, or quote engine work.

Locked decision:
\`$LOCKED_DECISION\`

Audit verdict:

- \`VERDICT=PARTIAL_DUPLICATION_RISK\`
- \`DUPLICATION_RISK=MEDIUM\`
- \`NO_NEW_EXTRACTOR_BEFORE_RECONCILIATION=YES\`

Discovery evidence:

- \`$DISCOVERY_JSON_FOUND\`

Scope confirmed:

- existing tests and engines must be reconciled before implementation;
- 076B/076D remain valid as read-only governance/promotion adapters;
- no new PDF extractor may be created before reconciliation;
- no new parser may be created before reconciliation;
- no new calculator may be created before reconciliation;
- Product Intelligence remains upstream semantic authority;
- Quote Preview remains downstream consumer;
- 077B must implement canonical mapping only, not extraction or execution.

Candidate canonical boundaries:

- PDF extraction: \`policy-operations/evidence/policy-ocr-engine.js\`;
- PDF preview/orchestration: \`product-intelligence/evidence/forge-quote-pdf-preview-engine.js\`;
- Solucionline parser: \`CANONICAL_DECISION_REQUIRED\`;
- Imagina Ser calculations: \`retirement-future-udi-projection-engine.js\` + \`imagina-ser-future-mxn-bridge.js\`;
- UDI projection: \`retirement-future-udi-projection-engine.js\`;
- Banxico/rates: \`exchange-rate-cache-engine.js\` over shared Banxico providers;
- GMM parser: \`product-intelligence/evidence/gmm-quote-parser.js\`;
- GMM summary: \`gmm-quote-summary-engine.js\`.

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
run node --check platform/adapters/quote-preview/quote-preview-pdf-engine-repo-promotion-adapter-076b.js
run node --check tests/quote-preview-pdf-engine-repo-promotion-adapter-076b-test.js
run node tests/quote-preview-pdf-engine-repo-promotion-adapter-076b-test.js
run python3 -m json.tool "$AUDIT_JSON"

run rg -n "$PHASE|$DECISION|$LOCKED_DECISION|$NEXT|PARTIAL_DUPLICATION_RISK|NO_NEW_EXTRACTOR_BEFORE_RECONCILIATION|CANONICAL_DECISION_REQUIRED|policy-ocr-engine.js" \
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

if rg -n '"?(crmWrite|pipelineWrite|policyWrite|quoteWrite|taskCreate|calendarCreate|messageSend|authReal|providerRuntime|secretAccess|browserPersistence|realEngineExecution|realEffectsAllowed|realEffectsEnabled|backendConnection|pdfRead|parserExecution|calculatorExecution|banxicoCall)"?\s*[:=]\s*true\b' "${SCOPED_FILES[@]}"; then
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
run git commit -m "docs: scope quote preview pdf existing surfaces reconciliation"
run git push origin HEAD:main

stage "STAGE 15 FINAL CHECKPOINT"
run git status --short --branch
run git log --oneline -10

SUMMARY=$(cat <<EOF
PASS_077A_QUOTE_PREVIEW_PDF_ENGINE_EXISTING_TESTS_AND_ENGINES_RECONCILIATION_SCOPE_COMMIT_PUSH_COMPLETE
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
