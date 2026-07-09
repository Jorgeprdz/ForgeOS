#!/usr/bin/env bash
set -euo pipefail
cd "${REPO:-/storage/emulated/0/Forge OS}"
python3 -m json.tool "docs/evidence/forge-quote-preview-new-quote-page-source-patch-105d.json" >/dev/null
python3 -m json.tool "docs/evidence/forge-quote-preview-new-quote-page-source-patch-validation-105d.json" >/dev/null
python3 -m json.tool "docs/evidence/forge-quote-preview-new-quote-page-source-patch-audit-105d.json" >/dev/null
grep -q 'id="nueva-cotizacion"' "docs/static-preview/forge-alive/index.html"
grep -q 'href="#nueva-cotizacion"' "docs/static-preview/forge-alive/index.html"
echo "PASS_105D_PRESERVED_SCRIPT_VALIDATION"
