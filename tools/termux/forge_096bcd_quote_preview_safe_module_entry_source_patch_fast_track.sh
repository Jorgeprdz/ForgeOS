#!/usr/bin/env bash
set -euo pipefail
cd "${REPO:-/storage/emulated/0/Forge OS}"
python3 -m json.tool "docs/evidence/forge-quote-preview-safe-module-entry-source-patch-implementation-manifest-096b.json" >/dev/null
python3 -m json.tool "docs/evidence/forge-quote-preview-safe-module-entry-source-patch-validation-096b.json" >/dev/null
python3 -m json.tool "docs/evidence/forge-quote-preview-safe-module-entry-source-patch-qa-audit-096c.json" >/dev/null
python3 -m json.tool "docs/evidence/forge-quote-preview-safe-module-entry-source-patch-decision-audit-096d.json" >/dev/null
python3 -m json.tool "docs/evidence/forge-quote-preview-safe-module-entry-source-patch-fast-track-audit-096bcd.json" >/dev/null
echo "PASS_096BCD_PRESERVED_SCRIPT_VALIDATION"
