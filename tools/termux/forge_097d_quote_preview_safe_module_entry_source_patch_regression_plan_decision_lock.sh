#!/usr/bin/env bash
set -euo pipefail
cd "${REPO:-/storage/emulated/0/Forge OS}"
python3 -m json.tool "docs/evidence/forge-quote-preview-safe-module-entry-source-patch-regression-plan-decision-audit-097d.json" >/dev/null
echo "PASS_097D_PRESERVED_SCRIPT_VALIDATION"
