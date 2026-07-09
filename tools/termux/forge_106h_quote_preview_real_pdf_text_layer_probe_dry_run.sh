#!/usr/bin/env bash
set -euo pipefail
cd "${REPO:-/storage/emulated/0/Forge OS}"
python3 -m json.tool "docs/evidence/forge-quote-preview-real-pdf-text-layer-probe-dry-run-106h.json" >/dev/null
python3 -m json.tool "docs/evidence/forge-quote-preview-real-pdf-text-layer-probe-dry-run-validation-106h.json" >/dev/null
python3 -m json.tool "docs/evidence/forge-quote-preview-real-pdf-text-layer-probe-dry-run-audit-106h.json" >/dev/null
grep -q 'TEXT_LAYER_PROBE_DRY_RUN_EXECUTED_WITH_NO_RAW_TEXT_COMMIT_NO_OCR_NO_PARSER' "docs/evidence/forge-quote-preview-real-pdf-text-layer-probe-dry-run-106h.json"
grep -q '106I_QUOTE_PREVIEW_TEXT_LAYER_RESULT_ROUTER' "docs/evidence/forge-quote-preview-real-pdf-text-layer-probe-dry-run-106h.json"
echo "PASS_106H_PRESERVED_SCRIPT_VALIDATION"
