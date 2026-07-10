#!/usr/bin/env bash
set -euo pipefail
cd "${REPO:-/storage/emulated/0/Forge OS}"
python3 -m json.tool "docs/evidence/forge-quote-preview-actual-manual-value-capture-execution-gate-107m.json" >/dev/null
python3 -m json.tool "docs/evidence/forge-quote-preview-actual-manual-value-capture-execution-gate-validation-107m.json" >/dev/null
python3 -m json.tool "docs/evidence/forge-quote-preview-actual-manual-value-capture-execution-gate-audit-107m.json" >/dev/null
grep -q 'ACTUAL_MANUAL_VALUE_CAPTURE_EXECUTION_GATE_LOCKED_BOUNDARY_READY_NO_CAPTURE_IN_107M_NO_TRUTH_NO_UI' "docs/evidence/forge-quote-preview-actual-manual-value-capture-execution-gate-107m.json"
grep -q '107N_QUOTE_PREVIEW_ACTUAL_MANUAL_VALUE_CAPTURE_LOCAL_INPUT_RUN' "docs/evidence/forge-quote-preview-actual-manual-value-capture-execution-gate-107m.json"
echo "PASS_107M_PRESERVED_SCRIPT_VALIDATION"
