#!/usr/bin/env bash
set -euo pipefail
cd "${REPO:-/storage/emulated/0/Forge OS}"
python3 -m json.tool "docs/evidence/forge-quote-preview-new-quote-page-design-plan-105b.json" >/dev/null
python3 -m json.tool "docs/evidence/forge-quote-preview-new-quote-page-design-plan-validation-105b.json" >/dev/null
python3 -m json.tool "docs/evidence/forge-quote-preview-new-quote-page-design-plan-audit-105b.json" >/dev/null
echo "PASS_105B_PRESERVED_SCRIPT_VALIDATION"
