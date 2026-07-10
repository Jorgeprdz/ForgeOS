#!/usr/bin/env bash
set -euo pipefail
cd "${REPO:-/storage/emulated/0/Forge OS}"
python3 -m json.tool "docs/evidence/forge-quote-preview-manual-value-capture-gate-107g.json" >/dev/null
python3 -m json.tool "docs/evidence/forge-quote-preview-manual-value-capture-gate-validation-107g.json" >/dev/null
python3 -m json.tool "docs/evidence/forge-quote-preview-manual-value-capture-gate-audit-107g.json" >/dev/null
grep -q 'MANUAL_VALUE_CAPTURE_GATE_LOCKED_FOR_TEMPLATE_PREP_ONLY_NO_VALUES_NO_TRUTH_NO_UI' "docs/evidence/forge-quote-preview-manual-value-capture-gate-107g.json"
grep -q '107H_QUOTE_PREVIEW_MANUAL_VALUE_CAPTURE_TEMPLATE_DRY_RUN' "docs/evidence/forge-quote-preview-manual-value-capture-gate-107g.json"
echo "PASS_107G_PRESERVED_SCRIPT_VALIDATION"
