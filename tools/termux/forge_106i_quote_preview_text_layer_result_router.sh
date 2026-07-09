#!/usr/bin/env bash
set -euo pipefail
cd "${REPO:-/storage/emulated/0/Forge OS}"
python3 -m json.tool "docs/evidence/forge-quote-preview-text-layer-result-router-106i.json" >/dev/null
python3 -m json.tool "docs/evidence/forge-quote-preview-text-layer-result-router-validation-106i.json" >/dev/null
python3 -m json.tool "docs/evidence/forge-quote-preview-text-layer-result-router-audit-106i.json" >/dev/null
grep -q 'TEXT_LAYER_PRESENT_ROUTE_LOCKED_TO_REDACTED_TEXT_SAMPLING_GATE' "docs/evidence/forge-quote-preview-text-layer-result-router-106i.json"
grep -q '106J_QUOTE_PREVIEW_REDACTED_TEXT_SAMPLING_GATE' "docs/evidence/forge-quote-preview-text-layer-result-router-106i.json"
echo "PASS_106I_PRESERVED_SCRIPT_VALIDATION"
