#!/usr/bin/env bash
set -euo pipefail
cd "${REPO:-/storage/emulated/0/Forge OS}"
python3 -m json.tool "docs/evidence/forge-quote-preview-safe-static-ui-source-patch-regression-static-validation-audit-094e.json" >/dev/null
python3 -m json.tool "docs/evidence/forge-quote-preview-safe-static-ui-source-patch-regression-static-validation-result-094e.json" >/dev/null
echo "PASS_094E_PRESERVED_SCRIPT_VALIDATION"
