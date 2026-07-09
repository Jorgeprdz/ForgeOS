#!/usr/bin/env bash
set -euo pipefail
cd "${REPO:-/storage/emulated/0/Forge OS}"
python3 -m json.tool "docs/evidence/forge-quote-preview-safe-module-entry-fast-track-audit-095abcd.json" >/dev/null
python3 -m json.tool "docs/evidence/forge-quote-preview-safe-module-entry-discovery-095a.json" >/dev/null
python3 -m json.tool "docs/evidence/forge-quote-preview-safe-module-entry-scope-095a.json" >/dev/null
python3 -m json.tool "docs/evidence/forge-quote-preview-safe-module-entry-plan-095b.json" >/dev/null
python3 -m json.tool "docs/evidence/forge-quote-preview-safe-module-entry-plan-qa-audit-095c.json" >/dev/null
python3 -m json.tool "docs/evidence/forge-quote-preview-safe-module-entry-decision-audit-095d.json" >/dev/null
echo "PASS_095ABCD_PRESERVED_SCRIPT_VALIDATION"
