#!/usr/bin/env bash
set -euo pipefail
cd "${REPO:-/storage/emulated/0/Forge OS}"
python3 -m json.tool "docs/evidence/forge-quote-preview-layout-label-map-dry-run-106m.json" >/dev/null
python3 -m json.tool "docs/evidence/forge-quote-preview-layout-label-map-dry-run-validation-106m.json" >/dev/null
python3 -m json.tool "docs/evidence/forge-quote-preview-layout-label-map-dry-run-audit-106m.json" >/dev/null
grep -q 'LAYOUT_LABEL_MAP_DRY_RUN_COMPLETE_WITH_LABEL_HINTS_ONLY_NO_VALUES' "docs/evidence/forge-quote-preview-layout-label-map-dry-run-106m.json"
grep -q '106N_QUOTE_PREVIEW_FIELD_ANCHOR_WINDOW_GATE' "docs/evidence/forge-quote-preview-layout-label-map-dry-run-106m.json"
echo "PASS_106M_PRESERVED_SCRIPT_VALIDATION"
