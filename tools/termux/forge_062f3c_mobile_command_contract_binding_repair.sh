#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT_DIR"

echo "PHASE=062F3C_MOBILE_COMMAND_CONTRACT_BINDING_REPAIR"
echo "MODE=scoped mobile command contract binding repair validation"

node --check docs/static-preview/forge-alive/desktop/forge-public-preview-interaction-visual-repair-060m.js
python3 -m json.tool docs/evidence/forge-mobile-command-contract-binding-repair-audit-062f3c.json >/dev/null

rg -n "062f3c|MOBILE_COMMAND_CONTRACT_BINDING_REPAIR_062F3C|__forgeLastActionPreviewPayload062E|forge:action-preview-payload:062e" \
  docs/static-preview/forge-alive/index.html \
  docs/static-preview/forge-alive/desktop/forge-public-preview-interaction-visual-repair-060m.css \
  docs/static-preview/forge-alive/desktop/forge-public-preview-interaction-visual-repair-060m.js

git diff --check

echo "DECISION=PASS_062F3C_MOBILE_COMMAND_CONTRACT_BINDING_REPAIR"
