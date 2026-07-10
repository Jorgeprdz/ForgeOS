#!/usr/bin/env bash
set -euo pipefail
cd "${REPO:-/storage/emulated/0/Forge OS}"
python3 -m json.tool "docs/evidence/forge-quote-preview-manual-value-capture-execution-gate-107j.json" >/dev/null
python3 -m json.tool "docs/evidence/forge-quote-preview-manual-value-capture-execution-gate-validation-107j.json" >/dev/null
python3 -m json.tool "docs/evidence/forge-quote-preview-manual-value-capture-execution-gate-audit-107j.json" >/dev/null
grep -q 'MANUAL_VALUE_CAPTURE_EXECUTION_GATE_LOCKED_NO_CAPTURE_YET_NULL_VALUES_NO_TRUTH_NO_UI' "docs/evidence/forge-quote-preview-manual-value-capture-execution-gate-107j.json"
grep -q '107K_QUOTE_PREVIEW_MANUAL_VALUE_CAPTURE_INPUT_PACKET_DRY_RUN' "docs/evidence/forge-quote-preview-manual-value-capture-execution-gate-107j.json"
echo "PASS_107J_PRESERVED_SCRIPT_VALIDATION"
