#!/usr/bin/env bash
set -euo pipefail
cd "${REPO:-/storage/emulated/0/Forge OS}"
test -s "docs/evidence/forge-new-quote-page-pdf-first-visual-qa-105e-desktop.png"
test -s "docs/evidence/forge-new-quote-page-pdf-first-visual-qa-105e-tablet.png"
test -s "docs/evidence/forge-new-quote-page-pdf-first-visual-qa-105e-mobile.png"
python3 -m json.tool "docs/evidence/forge-quote-preview-new-quote-page-visual-qa-105e.json" >/dev/null
python3 -m json.tool "docs/evidence/forge-quote-preview-new-quote-page-visual-qa-validation-105e.json" >/dev/null
python3 -m json.tool "docs/evidence/forge-quote-preview-new-quote-page-visual-qa-audit-105e.json" >/dev/null
echo "PASS_105E_PRESERVED_SCRIPT_VALIDATION"
