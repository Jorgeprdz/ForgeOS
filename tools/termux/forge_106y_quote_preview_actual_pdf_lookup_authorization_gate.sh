#!/usr/bin/env bash
set -euo pipefail
cd "${REPO:-/storage/emulated/0/Forge OS}"
python3 -m json.tool "docs/evidence/forge-quote-preview-actual-pdf-lookup-authorization-gate-106y.json" >/dev/null
python3 -m json.tool "docs/evidence/forge-quote-preview-actual-pdf-lookup-authorization-gate-validation-106y.json" >/dev/null
python3 -m json.tool "docs/evidence/forge-quote-preview-actual-pdf-lookup-authorization-gate-audit-106y.json" >/dev/null
grep -q 'ACTUAL_PDF_LOOKUP_AUTHORIZATION_GATE_LOCKED_AS_NOT_AUTHORIZED_NOW_NO_PDF_ACCESS_NO_VALUES_NO_TRUTH' "docs/evidence/forge-quote-preview-actual-pdf-lookup-authorization-gate-106y.json"
grep -q '106Z_QUOTE_PREVIEW_ACTUAL_PDF_LOOKUP_AUTHORIZATION_PACKET_DRY_RUN' "docs/evidence/forge-quote-preview-actual-pdf-lookup-authorization-gate-106y.json"
echo "PASS_106Y_PRESERVED_SCRIPT_VALIDATION"
