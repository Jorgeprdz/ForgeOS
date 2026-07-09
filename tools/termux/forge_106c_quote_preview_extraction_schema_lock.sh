#!/usr/bin/env bash
set -euo pipefail
cd "${REPO:-/storage/emulated/0/Forge OS}"
python3 -m json.tool "docs/evidence/forge-quote-preview-extraction-schema-lock-106c.json" >/dev/null
python3 -m json.tool "docs/evidence/forge-quote-preview-extraction-schema-lock-validation-106c.json" >/dev/null
python3 -m json.tool "docs/evidence/forge-quote-preview-extraction-schema-lock-audit-106c.json" >/dev/null
grep -q 'PDF_EXTRACTION_SCHEMA_LOCKED_FOR_REDACTED_DRY_RUN_CANDIDATES_ONLY' "docs/evidence/forge-quote-preview-extraction-schema-lock-106c.json"
grep -q '106D_QUOTE_PREVIEW_SAMPLE_EXTRACTION_DRY_RUN_REPORT' "docs/evidence/forge-quote-preview-extraction-schema-lock-106c.json"
echo "PASS_106C_PRESERVED_SCRIPT_VALIDATION"
