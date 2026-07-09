#!/usr/bin/env bash
set -euo pipefail
cd "${REPO:-/storage/emulated/0/Forge OS}"
python3 -m json.tool "docs/evidence/forge-quote-preview-safe-local-hash-navigation-source-patch-regression-scope-103a.json" >/dev/null
python3 -m json.tool "docs/evidence/forge-quote-preview-safe-local-hash-navigation-source-patch-regression-plan-103b.json" >/dev/null
python3 -m json.tool "docs/evidence/forge-quote-preview-safe-local-hash-navigation-source-patch-regression-plan-qa-audit-103c.json" >/dev/null
python3 -m json.tool "docs/evidence/forge-quote-preview-safe-local-hash-navigation-source-patch-regression-plan-decision-audit-103d.json" >/dev/null
python3 -m json.tool "docs/evidence/forge-quote-preview-safe-local-hash-navigation-source-patch-regression-static-validation-result-103e.json" >/dev/null
python3 -m json.tool "docs/evidence/forge-quote-preview-safe-local-hash-navigation-source-patch-regression-static-validation-qa-audit-103f.json" >/dev/null
python3 -m json.tool "docs/evidence/forge-quote-preview-safe-local-hash-navigation-source-patch-regression-static-validation-decision-audit-103g.json" >/dev/null
python3 -m json.tool "docs/evidence/forge-quote-preview-safe-local-hash-navigation-source-patch-regression-fast-track-audit-103abcdefg.json" >/dev/null
echo "PASS_103ABCDEFG_PRESERVED_SCRIPT_VALIDATION"
