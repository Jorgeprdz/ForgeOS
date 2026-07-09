#!/usr/bin/env bash
set -euo pipefail
cd "${REPO:-/storage/emulated/0/Forge OS}"
python3 -m json.tool "docs/evidence/forge-quote-preview-new-quote-summary-detail-repair-105dr4.json" >/dev/null
python3 -m json.tool "docs/evidence/forge-quote-preview-new-quote-summary-detail-repair-validation-105dr4.json" >/dev/null
python3 -m json.tool "docs/evidence/forge-quote-preview-new-quote-summary-detail-repair-audit-105dr4.json" >/dev/null
grep -q 'href="./nueva-cotizacion/?v=105dr4"' "docs/static-preview/forge-alive/index.html"
grep -q 'Total aportado' "docs/static-preview/forge-alive/nueva-cotizacion/index.html"
grep -q 'Total recuperación' "docs/static-preview/forge-alive/nueva-cotizacion/index.html"
echo "PASS_105DR4_PRESERVED_SCRIPT_VALIDATION"
