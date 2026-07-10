#!/usr/bin/env bash
set -euo pipefail
cd "${REPO:-/storage/emulated/0/Forge OS}"
python3 -m json.tool "docs/evidence/forge-quote-preview-actual-pdf-lookup-authorization-packet-dry-run-106z.json" >/dev/null
python3 -m json.tool "docs/evidence/forge-quote-preview-actual-pdf-lookup-authorization-packet-dry-run-validation-106z.json" >/dev/null
python3 -m json.tool "docs/evidence/forge-quote-preview-actual-pdf-lookup-authorization-packet-dry-run-audit-106z.json" >/dev/null
grep -q 'ACTUAL_PDF_LOOKUP_AUTHORIZATION_PACKET_COMPLETE_AS_NOT_AUTHORIZED_NO_PDF_ACCESS_NO_VALUES_NO_TRUTH' "docs/evidence/forge-quote-preview-actual-pdf-lookup-authorization-packet-dry-run-106z.json"
grep -q '107A_QUOTE_PREVIEW_LOCAL_ONLY_ACTUAL_PDF_LOOKUP_AUTHORIZATION_GATE' "docs/evidence/forge-quote-preview-actual-pdf-lookup-authorization-packet-dry-run-106z.json"
echo "PASS_106Z_PRESERVED_SCRIPT_VALIDATION"
