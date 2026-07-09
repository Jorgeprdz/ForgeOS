#!/usr/bin/env bash
set -euo pipefail
cd "${REPO:-/storage/emulated/0/Forge OS}"
python3 -m json.tool "docs/evidence/forge-quote-preview-safe-module-entry-source-patch-regression-plan-qa-audit-097c.json" >/dev/null
echo "PASS_097C_PRESERVED_SCRIPT_VALIDATION"
