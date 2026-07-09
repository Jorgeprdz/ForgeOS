#!/usr/bin/env bash
set -euo pipefail
cd "${REPO:-/storage/emulated/0/Forge OS}"
python3 -m json.tool "docs/evidence/forge-quote-preview-new-quote-page-route-model-repair-105dr.json" >/dev/null
python3 -m json.tool "docs/evidence/forge-quote-preview-new-quote-page-route-model-repair-validation-105dr.json" >/dev/null
python3 -m json.tool "docs/evidence/forge-quote-preview-new-quote-page-route-model-repair-audit-105dr.json" >/dev/null
test -f "docs/static-preview/forge-alive/nueva-cotizacion/index.html"
grep -q 'href="./nueva-cotizacion/?v=105dr"' "docs/static-preview/forge-alive/index.html"
grep -q 'Nuevo borrador de cotización' "docs/static-preview/forge-alive/nueva-cotizacion/index.html"
echo "PASS_105DR_PRESERVED_SCRIPT_VALIDATION"
