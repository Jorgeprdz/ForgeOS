#!/usr/bin/env bash
set -euo pipefail
cd "${REPO:-/storage/emulated/0/Forge OS}"
python3 -m json.tool "docs/evidence/forge-quote-preview-field-anchor-window-dry-run-106o.json" >/dev/null
python3 -m json.tool "docs/evidence/forge-quote-preview-field-anchor-window-dry-run-validation-106o.json" >/dev/null
python3 -m json.tool "docs/evidence/forge-quote-preview-field-anchor-window-dry-run-audit-106o.json" >/dev/null
grep -q 'FIELD_ANCHOR_WINDOW_DRY_RUN_COMPLETE_WITH_REDACTED_CONTEXT_ONLY_NO_VALUES' "docs/evidence/forge-quote-preview-field-anchor-window-dry-run-106o.json"
grep -q '106P_QUOTE_PREVIEW_FIELD_CANDIDATE_EXTRACTION_GATE' "docs/evidence/forge-quote-preview-field-anchor-window-dry-run-106o.json"
echo "PASS_106O_PRESERVED_SCRIPT_VALIDATION"
