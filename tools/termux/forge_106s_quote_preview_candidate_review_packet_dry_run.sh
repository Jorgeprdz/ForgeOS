#!/usr/bin/env bash
set -euo pipefail
cd "${REPO:-/storage/emulated/0/Forge OS}"
python3 -m json.tool "docs/evidence/forge-quote-preview-candidate-review-packet-dry-run-106s.json" >/dev/null
python3 -m json.tool "docs/evidence/forge-quote-preview-candidate-review-packet-dry-run-validation-106s.json" >/dev/null
python3 -m json.tool "docs/evidence/forge-quote-preview-candidate-review-packet-dry-run-audit-106s.json" >/dev/null
grep -q 'CANDIDATE_REVIEW_PACKET_DRY_RUN_COMPLETE_FROM_REDACTED_CANDIDATES_ONLY_NO_VALUES_NO_TRUTH' "docs/evidence/forge-quote-preview-candidate-review-packet-dry-run-106s.json"
grep -q '106T_QUOTE_PREVIEW_HUMAN_REVIEW_DECISION_GATE' "docs/evidence/forge-quote-preview-candidate-review-packet-dry-run-106s.json"
echo "PASS_106S_PRESERVED_SCRIPT_VALIDATION"
