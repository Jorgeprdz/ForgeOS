#!/usr/bin/env bash
set -euo pipefail
cd "${REPO:-/storage/emulated/0/Forge OS}"
python3 -m json.tool "docs/evidence/forge-quote-preview-parser-adapter-scope-106e.json" >/dev/null
python3 -m json.tool "docs/evidence/forge-quote-preview-parser-adapter-scope-validation-106e.json" >/dev/null
python3 -m json.tool "docs/evidence/forge-quote-preview-parser-adapter-scope-audit-106e.json" >/dev/null
grep -q 'PARSER_ADAPTER_SCOPE_LOCKED_WITH_NO_PDF_READ_NO_OCR_NO_PARSER_EXECUTION' "docs/evidence/forge-quote-preview-parser-adapter-scope-106e.json"
grep -q '106F_QUOTE_PREVIEW_REAL_PDF_LOCAL_DRY_RUN_PREP' "docs/evidence/forge-quote-preview-parser-adapter-scope-106e.json"
echo "PASS_106E_PRESERVED_SCRIPT_VALIDATION"
