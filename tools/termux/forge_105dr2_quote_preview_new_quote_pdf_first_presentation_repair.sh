#!/usr/bin/env bash
set -euo pipefail
cd "${REPO:-/storage/emulated/0/Forge OS}"
python3 -m json.tool "docs/evidence/forge-quote-preview-new-quote-pdf-first-presentation-repair-105dr2.json" >/dev/null
python3 -m json.tool "docs/evidence/forge-quote-preview-new-quote-pdf-first-presentation-repair-validation-105dr2.json" >/dev/null
python3 -m json.tool "docs/evidence/forge-quote-preview-new-quote-pdf-first-presentation-repair-audit-105dr2.json" >/dev/null
grep -q 'href="./nueva-cotizacion/?v=105dr2"' "docs/static-preview/forge-alive/index.html"
grep -q 'Sube el PDF de cotización' "docs/static-preview/forge-alive/nueva-cotizacion/index.html"
grep -q 'Generar presentación de ventas' "docs/static-preview/forge-alive/nueva-cotizacion/index.html"
echo "PASS_105DR2_PRESERVED_SCRIPT_VALIDATION"
