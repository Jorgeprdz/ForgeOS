#!/usr/bin/env bash
set -euo pipefail
cd "${REPO:-/storage/emulated/0/Forge OS}"
python3 -m json.tool "docs/evidence/forge-quote-preview-field-anchor-window-gate-106n.json" >/dev/null
python3 -m json.tool "docs/evidence/forge-quote-preview-field-anchor-window-gate-validation-106n.json" >/dev/null
python3 -m json.tool "docs/evidence/forge-quote-preview-field-anchor-window-gate-audit-106n.json" >/dev/null
grep -q 'FIELD_ANCHOR_WINDOW_GATE_LOCKED_WITH_NO_VALUE_EXTRACTION_NO_PARSER_NO_QUOTE_TRUTH' "docs/evidence/forge-quote-preview-field-anchor-window-gate-106n.json"
grep -q '106O_QUOTE_PREVIEW_FIELD_ANCHOR_WINDOW_DRY_RUN' "docs/evidence/forge-quote-preview-field-anchor-window-gate-106n.json"
echo "PASS_106N_PRESERVED_SCRIPT_VALIDATION"
