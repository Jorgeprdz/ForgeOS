#!/usr/bin/env bash
set -euo pipefail
cd "${REPO:-/storage/emulated/0/Forge OS}"
python3 -m json.tool "docs/evidence/forge-quote-preview-manual-value-capture-input-packet-dry-run-107k.json" >/dev/null
python3 -m json.tool "docs/evidence/forge-quote-preview-manual-value-capture-input-packet-dry-run-validation-107k.json" >/dev/null
python3 -m json.tool "docs/evidence/forge-quote-preview-manual-value-capture-input-packet-dry-run-audit-107k.json" >/dev/null
grep -q 'MANUAL_VALUE_CAPTURE_INPUT_PACKET_DRY_RUN_COMPLETE_WITH_BLANK_INPUTS_NULL_VALUES_NO_TRUTH_NO_UI' "docs/evidence/forge-quote-preview-manual-value-capture-input-packet-dry-run-107k.json"
grep -q '107L_QUOTE_PREVIEW_ACTUAL_MANUAL_VALUE_CAPTURE_AUTHORIZATION_GATE' "docs/evidence/forge-quote-preview-manual-value-capture-input-packet-dry-run-107k.json"
echo "PASS_107K_PRESERVED_SCRIPT_VALIDATION"
