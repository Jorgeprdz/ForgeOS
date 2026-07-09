#!/usr/bin/env bash
set -euo pipefail
cd "${REPO:-/storage/emulated/0/Forge OS}"
python3 -m json.tool "docs/evidence/forge-quote-preview-redacted-text-sampling-dry-run-106k.json" >/dev/null
python3 -m json.tool "docs/evidence/forge-quote-preview-redacted-text-sampling-dry-run-validation-106k.json" >/dev/null
python3 -m json.tool "docs/evidence/forge-quote-preview-redacted-text-sampling-dry-run-audit-106k.json" >/dev/null
grep -q 'REDACTED_TEXT_SAMPLING_DRY_RUN_COMPLETE_WITH_NO_RAW_TEXT_COMMIT_NO_FIELD_EXTRACTION' "docs/evidence/forge-quote-preview-redacted-text-sampling-dry-run-106k.json"
grep -q '106L_QUOTE_PREVIEW_LAYOUT_LABEL_MAP_GATE' "docs/evidence/forge-quote-preview-redacted-text-sampling-dry-run-106k.json"
echo "PASS_106K_PRESERVED_SCRIPT_VALIDATION"
