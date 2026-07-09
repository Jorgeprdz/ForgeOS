#!/usr/bin/env bash
set -euo pipefail
cd "${REPO:-/storage/emulated/0/Forge OS}"
python3 -m json.tool "docs/evidence/forge-quote-preview-layout-label-map-gate-106l.json" >/dev/null
python3 -m json.tool "docs/evidence/forge-quote-preview-layout-label-map-gate-validation-106l.json" >/dev/null
python3 -m json.tool "docs/evidence/forge-quote-preview-layout-label-map-gate-audit-106l.json" >/dev/null
grep -q 'LAYOUT_LABEL_MAP_GATE_LOCKED_WITH_NO_VALUE_EXTRACTION_NO_PARSER_NO_QUOTE_TRUTH' "docs/evidence/forge-quote-preview-layout-label-map-gate-106l.json"
grep -q '106M_QUOTE_PREVIEW_LAYOUT_LABEL_MAP_DRY_RUN' "docs/evidence/forge-quote-preview-layout-label-map-gate-106l.json"
echo "PASS_106L_PRESERVED_SCRIPT_VALIDATION"
