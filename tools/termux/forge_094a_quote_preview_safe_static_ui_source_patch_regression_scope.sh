#!/usr/bin/env bash
set -euo pipefail
cd "${REPO:-/storage/emulated/0/Forge OS}"
python3 -m json.tool "docs/evidence/forge-quote-preview-safe-static-ui-source-patch-regression-scope-audit-094a.json" >/dev/null
echo "PASS_094A_PRESERVED_SCRIPT_VALIDATION"
