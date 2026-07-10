#!/usr/bin/env bash
set -euo pipefail
cd "${REPO:-/storage/emulated/0/Forge OS}"
python3 -m json.tool "docs/evidence/forge-quote-preview-actual-manual-value-capture-authorization-gate-107l.json" >/dev/null
python3 -m json.tool "docs/evidence/forge-quote-preview-actual-manual-value-capture-authorization-gate-validation-107l.json" >/dev/null
python3 -m json.tool "docs/evidence/forge-quote-preview-actual-manual-value-capture-authorization-gate-audit-107l.json" >/dev/null
grep -q 'ACTUAL_MANUAL_VALUE_CAPTURE_AUTHORIZATION_GATE_LOCKED_WITH_OPERATOR_CONFIRMATION_NO_CAPTURE_NO_TRUTH_NO_UI' "docs/evidence/forge-quote-preview-actual-manual-value-capture-authorization-gate-107l.json"
grep -q '107M_QUOTE_PREVIEW_ACTUAL_MANUAL_VALUE_CAPTURE_EXECUTION_GATE' "docs/evidence/forge-quote-preview-actual-manual-value-capture-authorization-gate-107l.json"
echo "PASS_107L_PRESERVED_SCRIPT_VALIDATION"
