#!/usr/bin/env bash
set -euo pipefail
cd "${REPO:-/storage/emulated/0/Forge OS}"
python3 -m json.tool "docs/evidence/forge-quote-preview-safe-local-hash-navigation-source-patch-validation-102b.json" >/dev/null
python3 -m json.tool "docs/evidence/forge-quote-preview-safe-local-hash-navigation-source-patch-implementation-manifest-102b.json" >/dev/null
python3 -m json.tool "docs/evidence/forge-quote-preview-safe-local-hash-navigation-source-patch-qa-audit-102c.json" >/dev/null
python3 -m json.tool "docs/evidence/forge-quote-preview-safe-local-hash-navigation-source-patch-decision-audit-102d.json" >/dev/null
python3 -m json.tool "docs/evidence/forge-quote-preview-safe-local-hash-navigation-source-patch-fast-track-audit-102bcd.json" >/dev/null
echo "PASS_102BCD_PRESERVED_SCRIPT_VALIDATION"
