#!/usr/bin/env bash
set -euo pipefail
cd "${REPO:-/storage/emulated/0/Forge OS}"
python3 -m json.tool "docs/evidence/forge-quote-preview-field-candidate-extraction-gate-106p.json" >/dev/null
python3 -m json.tool "docs/evidence/forge-quote-preview-field-candidate-extraction-gate-validation-106p.json" >/dev/null
python3 -m json.tool "docs/evidence/forge-quote-preview-field-candidate-extraction-gate-audit-106p.json" >/dev/null
grep -q 'FIELD_CANDIDATE_EXTRACTION_GATE_LOCKED_FOR_REDACTED_CANDIDATES_ONLY_NO_TRUTH' "docs/evidence/forge-quote-preview-field-candidate-extraction-gate-106p.json"
grep -q '106Q_QUOTE_PREVIEW_FIELD_CANDIDATE_EXTRACTION_DRY_RUN' "docs/evidence/forge-quote-preview-field-candidate-extraction-gate-106p.json"
echo "PASS_106P_PRESERVED_SCRIPT_VALIDATION"
