#!/usr/bin/env bash
set -euo pipefail
cd "${REPO:-/storage/emulated/0/Forge OS}"
python3 -m json.tool "docs/evidence/forge-quote-preview-safe-static-ui-source-patch-decision-audit-093d.json" >/dev/null
echo "PASS_093D_PRESERVED_SCRIPT_VALIDATION"
