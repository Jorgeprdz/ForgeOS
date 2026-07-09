#!/usr/bin/env bash
set -euo pipefail
cd "${REPO:-/storage/emulated/0/Forge OS}"
python3 -m json.tool "docs/evidence/forge-quote-preview-new-quote-page-source-patch-scope-105c.json" >/dev/null
python3 -m json.tool "docs/evidence/forge-quote-preview-new-quote-page-source-patch-scope-validation-105c.json" >/dev/null
python3 -m json.tool "docs/evidence/forge-quote-preview-new-quote-page-source-patch-scope-audit-105c.json" >/dev/null
echo "PASS_105C_PRESERVED_SCRIPT_VALIDATION"
