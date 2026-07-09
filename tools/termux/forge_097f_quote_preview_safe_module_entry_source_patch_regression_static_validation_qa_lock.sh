#!/usr/bin/env bash
set -euo pipefail
cd "${REPO:-/storage/emulated/0/Forge OS}"
python3 -m json.tool "docs/evidence/forge-quote-preview-safe-module-entry-source-patch-regression-static-validation-qa-audit-097f.json" >/dev/null
echo "PASS_097F_PRESERVED_SCRIPT_VALIDATION"
