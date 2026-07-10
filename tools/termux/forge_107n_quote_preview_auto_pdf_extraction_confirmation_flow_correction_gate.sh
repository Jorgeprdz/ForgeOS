#!/usr/bin/env bash
set -euo pipefail
cd "${REPO:-/storage/emulated/0/Forge OS}"
python3 -m json.tool "docs/evidence/forge-quote-preview-auto-pdf-extraction-confirmation-flow-correction-gate-107n.json" >/dev/null
python3 -m json.tool "docs/evidence/forge-quote-preview-auto-pdf-extraction-confirmation-flow-correction-gate-validation-107n.json" >/dev/null
python3 -m json.tool "docs/evidence/forge-quote-preview-auto-pdf-extraction-confirmation-flow-correction-gate-audit-107n.json" >/dev/null
grep -q 'AUTO_PDF_EXTRACTION_CONFIRMATION_FLOW_LOCKED_MANUAL_TRANSCRIPTION_DEPRECATED' "docs/evidence/forge-quote-preview-auto-pdf-extraction-confirmation-flow-correction-gate-107n.json"
grep -q '107O_QUOTE_PREVIEW_AUTO_PDF_VALUE_EXTRACTION_LOCAL_RUN_GATE' "docs/evidence/forge-quote-preview-auto-pdf-extraction-confirmation-flow-correction-gate-107n.json"
echo "PASS_107N_AUTO_PDF_FLOW_CORRECTION_PRESERVED"
