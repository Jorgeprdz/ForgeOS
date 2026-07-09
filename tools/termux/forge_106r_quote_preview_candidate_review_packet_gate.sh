#!/usr/bin/env bash
set -euo pipefail
cd "${REPO:-/storage/emulated/0/Forge OS}"
python3 -m json.tool "docs/evidence/forge-quote-preview-candidate-review-packet-gate-106r.json" >/dev/null
python3 -m json.tool "docs/evidence/forge-quote-preview-candidate-review-packet-gate-validation-106r.json" >/dev/null
python3 -m json.tool "docs/evidence/forge-quote-preview-candidate-review-packet-gate-audit-106r.json" >/dev/null
grep -q 'CANDIDATE_REVIEW_PACKET_GATE_LOCKED_FOR_HUMAN_REVIEW_ONLY_NO_REAL_VALUES_NO_TRUTH' "docs/evidence/forge-quote-preview-candidate-review-packet-gate-106r.json"
grep -q '106S_QUOTE_PREVIEW_CANDIDATE_REVIEW_PACKET_DRY_RUN' "docs/evidence/forge-quote-preview-candidate-review-packet-gate-106r.json"
echo "PASS_106R_PRESERVED_SCRIPT_VALIDATION"
