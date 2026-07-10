#!/usr/bin/env bash
set -euo pipefail
cd "${REPO:-/storage/emulated/0/Forge OS}"
python3 -m json.tool "docs/evidence/forge-quote-preview-redacted-lookup-result-mapping-gate-107e.json" >/dev/null
python3 -m json.tool "docs/evidence/forge-quote-preview-redacted-lookup-result-mapping-gate-validation-107e.json" >/dev/null
python3 -m json.tool "docs/evidence/forge-quote-preview-redacted-lookup-result-mapping-gate-audit-107e.json" >/dev/null
grep -q 'REDACTED_LOOKUP_RESULT_MAPPING_GATE_LOCKED_NO_VALUES_NO_TRUTH_NO_UI' "docs/evidence/forge-quote-preview-redacted-lookup-result-mapping-gate-107e.json"
grep -q '107F_QUOTE_PREVIEW_REDACTED_LOOKUP_RESULT_MAPPING_DRY_RUN' "docs/evidence/forge-quote-preview-redacted-lookup-result-mapping-gate-107e.json"
echo "PASS_107E_PRESERVED_SCRIPT_VALIDATION"
