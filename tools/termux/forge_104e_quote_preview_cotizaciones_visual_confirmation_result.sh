#!/usr/bin/env bash
set -euo pipefail
cd "${REPO:-/storage/emulated/0/Forge OS}"
python3 -m json.tool "docs/evidence/forge-quote-preview-cotizaciones-visual-confirmation-result-104e.json" >/dev/null
python3 -m json.tool "docs/evidence/forge-quote-preview-cotizaciones-visual-confirmation-manifest-104e.json" >/dev/null
python3 -m json.tool "docs/evidence/forge-quote-preview-cotizaciones-visual-confirmation-audit-104e.json" >/dev/null
test -f "docs/evidence/forge-codex-cotizaciones-visual-fix-top-1440x1000.png"
test -f "docs/evidence/forge-codex-cotizaciones-visual-fix-cotizaciones-1440x2200.png"
test -f "docs/evidence/forge-codex-cotizaciones-visual-fix-tablet-1024x768.png"
echo "PASS_104E_PRESERVED_SCRIPT_VALIDATION"
