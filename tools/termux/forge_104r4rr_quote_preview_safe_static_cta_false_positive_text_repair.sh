#!/usr/bin/env bash
set -euo pipefail
cd "${REPO:-/storage/emulated/0/Forge OS}"
python3 -m json.tool "docs/evidence/forge-quote-preview-safe-static-cta-false-positive-text-repair-validation-104r4rr.json" >/dev/null
python3 -m json.tool "docs/evidence/forge-quote-preview-safe-static-cta-false-positive-text-repair-manifest-104r4rr.json" >/dev/null
python3 -m json.tool "docs/evidence/forge-quote-preview-safe-static-cta-false-positive-text-repair-audit-104r4rr.json" >/dev/null
echo "PASS_104R4RR_PRESERVED_SCRIPT_VALIDATION"
