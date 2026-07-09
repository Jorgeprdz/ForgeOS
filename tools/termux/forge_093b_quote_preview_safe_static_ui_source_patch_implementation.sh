#!/usr/bin/env bash
set -euo pipefail

# FORGE 093B preserved runner
# The original 093B implementation patched authorized UI source files with static safety copy/badge metadata only.
# This checked-in script is intentionally a lightweight textual preservation wrapper after binary-copy repair.

REPO="${REPO:-/storage/emulated/0/Forge OS}"
cd "$REPO"

PATCH_MANIFEST_JSON="docs/evidence/forge-quote-preview-safe-static-ui-source-patch-implementation-manifest-093b.json"
AUDIT_JSON="docs/evidence/forge-quote-preview-safe-static-ui-source-patch-implementation-audit-093b.json"

python3 -m json.tool "$PATCH_MANIFEST_JSON" >/dev/null
python3 -m json.tool "$AUDIT_JSON" >/dev/null

python3 - <<'PY'
from pathlib import Path
import json, re

manifest = json.loads(Path("docs/evidence/forge-quote-preview-safe-static-ui-source-patch-implementation-manifest-093b.json").read_text())
required_labels = ["Preview", "Solo lectura", "Revisión humana", "No cotización oficial", "Sin envío", "Sin CRM", "Sin calendario"]
required_false = [
    "officialQuoteAllowed",
    "quoteTruthAllowed",
    "sendAllowed",
    "crmWriteAllowed",
    "calendarCreateAllowed",
    "backendConnectionAllowed",
    "providerCallAllowed",
    "parserExecutionAllowed",
    "calculatorExecutionAllowed",
    "banxicoCallAllowed",
    "newActionHandlerAllowed",
    "businessLogicChangeAllowed",
    "dataFlowChangeAllowed",
]
errors = []
for item in manifest.get("patchedFiles", []):
    path = item.get("path")
    if not path or not Path(path).exists():
        errors.append(f"missing:{path}")
        continue
    text = Path(path).read_text(encoding="utf-8", errors="ignore")
    for label in required_labels:
        if label not in text:
            errors.append(f"label:{path}:{label}")
    for flag in required_false:
        if not re.search(re.escape(flag) + r"\s*:\s*false", text):
            errors.append(f"flag:{path}:{flag}")
if errors:
    raise SystemExit("HOLD_093B_REPAIR_VALIDATION_FAILED " + ",".join(errors))
print("PASS_093B_PRESERVED_SCRIPT_VALIDATION")
PY
