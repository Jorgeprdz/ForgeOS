#!/usr/bin/env bash
set -euo pipefail
cd "${REPO:-/storage/emulated/0/Forge OS}"
python3 -m json.tool "docs/evidence/forge-quote-preview-human-review-decision-dry-run-106u.json" >/dev/null
python3 -m json.tool "docs/evidence/forge-quote-preview-human-review-decision-dry-run-validation-106u.json" >/dev/null
python3 -m json.tool "docs/evidence/forge-quote-preview-human-review-decision-dry-run-audit-106u.json" >/dev/null
grep -q 'HUMAN_REVIEW_DECISION_DRY_RUN_COMPLETE_AS_PENDING_LOCATION_DECISIONS_ONLY_NO_HUMAN_APPROVAL_NO_TRUTH' "docs/evidence/forge-quote-preview-human-review-decision-dry-run-106u.json"
grep -q '106V_QUOTE_PREVIEW_LOCATION_DECISION_ROUTER_GATE' "docs/evidence/forge-quote-preview-human-review-decision-dry-run-106u.json"
echo "PASS_106U_PRESERVED_SCRIPT_VALIDATION"
