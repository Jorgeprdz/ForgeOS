#!/usr/bin/env bash
set -euo pipefail
cd "${REPO:-/storage/emulated/0/Forge OS}"
python3 -m json.tool "docs/evidence/forge-quote-preview-human-review-decision-gate-106t.json" >/dev/null
python3 -m json.tool "docs/evidence/forge-quote-preview-human-review-decision-gate-validation-106t.json" >/dev/null
python3 -m json.tool "docs/evidence/forge-quote-preview-human-review-decision-gate-audit-106t.json" >/dev/null
grep -q 'HUMAN_REVIEW_DECISION_GATE_LOCKED_FOR_LOCATION_DISPOSITIONS_ONLY_NO_REAL_VALUES_NO_TRUTH' "docs/evidence/forge-quote-preview-human-review-decision-gate-106t.json"
grep -q '106U_QUOTE_PREVIEW_HUMAN_REVIEW_DECISION_DRY_RUN' "docs/evidence/forge-quote-preview-human-review-decision-gate-106t.json"
echo "PASS_106T_PRESERVED_SCRIPT_VALIDATION"
