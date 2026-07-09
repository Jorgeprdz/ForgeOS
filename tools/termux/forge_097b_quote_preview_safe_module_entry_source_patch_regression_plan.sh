#!/usr/bin/env bash
set -euo pipefail
cd "${REPO:-/storage/emulated/0/Forge OS}"
python3 -m json.tool "docs/evidence/forge-quote-preview-safe-module-entry-source-patch-regression-plan-097b.json" >/dev/null
python3 -m json.tool "docs/evidence/forge-quote-preview-safe-module-entry-source-patch-regression-plan-audit-097b.json" >/dev/null
echo "PASS_097B_PRESERVED_SCRIPT_VALIDATION"
