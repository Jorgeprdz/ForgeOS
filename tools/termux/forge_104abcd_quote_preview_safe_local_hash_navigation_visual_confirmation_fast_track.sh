#!/usr/bin/env bash
set -euo pipefail
cd "${REPO:-/storage/emulated/0/Forge OS}"
python3 -m json.tool "docs/evidence/forge-quote-preview-safe-local-hash-navigation-visual-confirmation-scope-104a.json" >/dev/null
python3 -m json.tool "docs/evidence/forge-quote-preview-safe-local-hash-navigation-visual-confirmation-plan-104b.json" >/dev/null
python3 -m json.tool "docs/evidence/forge-quote-preview-safe-local-hash-navigation-visual-confirmation-plan-qa-audit-104c.json" >/dev/null
python3 -m json.tool "docs/evidence/forge-quote-preview-safe-local-hash-navigation-visual-confirmation-decision-audit-104d.json" >/dev/null
python3 -m json.tool "docs/evidence/forge-quote-preview-safe-local-hash-navigation-visual-confirmation-fast-track-audit-104abcd.json" >/dev/null
echo "PASS_104ABCD_PRESERVED_SCRIPT_VALIDATION"
