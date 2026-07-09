#!/usr/bin/env bash
set -euo pipefail
cd "${REPO:-/storage/emulated/0/Forge OS}"
python3 -m json.tool "docs/evidence/forge-quote-preview-safe-module-entry-navigation-binding-source-patch-scope-099a.json" >/dev/null
python3 -m json.tool "docs/evidence/forge-quote-preview-safe-module-entry-navigation-binding-source-patch-scope-audit-099a.json" >/dev/null
python3 -m json.tool "docs/evidence/forge-quote-preview-safe-module-entry-navigation-binding-source-patch-discovery-099a.json" >/dev/null
echo "PASS_099A_PRESERVED_SCRIPT_VALIDATION"
