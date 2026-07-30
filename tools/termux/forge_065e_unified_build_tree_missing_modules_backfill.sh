#!/usr/bin/env bash
set -euo pipefail

PHASE="065E_UNIFIED_BUILD_TREE_MISSING_MODULES_BACKFILL"
REPO="/storage/emulated/0/Forge OS"
REPORT="/data/data/com.termux/files/home/${PHASE}_RESULT_$(date +%Y%m%d_%H%M%S).md"
mkdir -p "$(dirname "$REPORT")"
exec > >(tee "$REPORT") 2>&1

CYAN="\033[1;36m"; GREEN="\033[1;38;5;46m"; YELLOW="\033[1;93m"; RED="\033[1;91m"; RESET="\033[0m"
stage(){ printf "\n${CYAN}========== %s ==========${RESET}\n" "$1"; }
pass(){ printf "${GREEN}PASS:${RESET} %s\n" "$1"; }
warn(){ printf "${YELLOW}WARN:${RESET} %s\n" "$1"; }
fail(){ printf "${RED}FAIL:${RESET} %s\n" "$1"; exit 1; }
run(){ printf "\n========== RUN ==========\n%s\n" "$*"; "$@"; }

append_block(){
  local file="$1" start="$2" end="$3" body="$4"
  python3 - "$file" "$start" "$end" "$body" <<'PY'
from pathlib import Path
import sys
p=Path(sys.argv[1]); start=sys.argv[2]; end=sys.argv[3]; body=sys.argv[4]
text=p.read_text()
block=f"{start}\n{body.rstrip()}\n{end}\n"
if start in text and end in text:
    before, rest=text.split(start,1)
    _, after=rest.split(end,1)
    text=before.rstrip()+"\n\n"+block+after.lstrip("\n")
else:
    text=text.rstrip()+"\n\n"+block
p.write_text(text)
PY
}

norm(){
  python3 - "$1" <<'PY'
from pathlib import Path
import sys
p=Path(sys.argv[1])
p.write_text("\n".join(line.rstrip() for line in p.read_text().splitlines())+"\n")
PY
}

stage "STAGE 0 HEADER"
printf "PHASE=%s\n" "$PHASE"
printf "MODE=unified build tree missing modules backfill\n"
printf "BOUNDARY=docs/tree only; no UI mutation; no backend; no CRM; no calendar; no send; no auth; no provider; no recording; no real engine\n"
printf "REPORT=%s\n" "$REPORT"

stage "STAGE 1 CHECKPOINT"
cd "$REPO" || fail "repo not found: $REPO"
run git status --short --branch
run git log --oneline -10
run git diff --name-status
run git diff --cached --name-status

[[ -z "$(git diff --name-only)" && -z "$(git diff --cached --name-only)" ]] || fail "tracked worktree dirty; stop before backfill"

stage "STAGE 2 REQUIRED FILE CHECK"
REQ=(
  "FORGE_MASTER_BUILD_TREE.md"
  "docs/architecture/source-truth/FORGE_UNIFIED_BUILD_TREE_001.md"
  "docs/roadmap/FORGE_ROADMAP_LOCK_001.md"
  "docs/evidence/forge-client-crm-read-only-adapter-decision-audit-065d.json"
)
for f in "${REQ[@]}"; do [[ -f "$f" ]] && pass "$f" || fail "missing $f"; done

stage "STAGE 3 BACKUP"
BACKUP=".forge-backups/065e-unified-tree-backfill-$(date +%Y%m%d_%H%M%S)"
mkdir -p "$BACKUP"
for f in "${REQ[@]}"; do mkdir -p "$BACKUP/$(dirname "$f")"; cp "$f" "$BACKUP/$f"; pass "backup $f"; done

stage "STAGE 4 VERIFY 065D LOCK"
python3 - <<'PY'
import json
from pathlib import Path
a=json.loads(Path("docs/evidence/forge-client-crm-read-only-adapter-decision-audit-065d.json").read_text())
assert a["status"]=="PASS"
assert a["decision"]=="CLIENT_CRM_READ_ONLY_ADAPTER_LOCKED"
assert a["next"]=="066A_OPPORTUNITY_PIPELINE_READ_ONLY_ADAPTER_SCOPE"
print("PASS 065D lock verified")
PY

stage "STAGE 5 WRITE DOCS"
mkdir -p docs/architecture/source-truth docs/evidence tools/termux

cat > docs/architecture/source-truth/FORGE_UNIFIED_TREE_MISSING_MODULES_BACKFILL_065E.md <<'MD'
# Forge Unified Tree Missing Modules Backfill 065E

Status: PASS / BACKFILLED

Current lock:
`065D_CLIENT_CRM_READ_ONLY_ADAPTER_DECISION_LOCK`

Held next:
`066A_OPPORTUNITY_PIPELINE_READ_ONLY_ADAPTER_SCOPE`

## Modules Added To Tree

### 02 Policy & Sales Operation Engine

Add `Bitacora / Notes System`:

Status: RETAINED / PARTIALLY ABSORBED / REMAINDER DISTRIBUTED

- prospect initial context -> absorbed by `ADVISOR_OS_SALES_PIPELINE`
- governed prospect context adapter -> absorbed by `ADVISOR_OS_SALES_PIPELINE`
- timeline and chronological notes -> `ACTIVITY / FES`
- notes by policy -> `CARTERA`
- notes by appointment -> `ACTIVITY / APPOINTMENT LIFECYCLE`
- quick notes by voice/text -> future capture adapter
- automatic tags and AI context -> future governed intelligence scope
- standalone parallel Notes module -> forbidden

### 05 AI & Predictive Intelligence

Add `Real-Time Conversation Copilot`:

- real-time listening
- transcription
- objection detection
- response suggestions
- next-best question
- emotional analysis
- automatic post-appointment summary

Lock: requires explicit permission, recording consent, retention rules, privacy controls, and provider/runtime contracts before implementation.

### 06 Lead Generation System

Add `Lead Generation Boost`:

- prospect generation
- intelligent referral generation only; operational referral intake and lifecycle are absorbed by `ADVISOR_OS_SALES_PIPELINE`
- dormant contact reactivation
- outreach scripts
- prospecting campaigns
- lead scoring
- daily suggestions for who to contact

Lock: no outreach, campaign launch, enrichment, send, provider call, or automated contact action until separately scoped.

### Sales Enablement Sub-Branch

Add `Sales Presentation System`:

- sales scripts
- financial needs analysis
- initial appointment structure
- closing appointment structure
- presentation creator
- product-specific arguments
- financial storytelling
- expected objections
- post-presentation summary

### 15 Universal Command OS / Alfred

Add `Oye Alfred Wake Voice System`:

- wake phrase: Oye Alfred
- voice activation
- hands-free mode
- spoken command to action preview
- confirmation before execution
- fallback to text
- microphone consent
- visible listening indicator
- no passive listening without permission
- no real execution without approval gate

## Decision

DECISION=PASS_065E_UNIFIED_BUILD_TREE_MISSING_MODULES_BACKFILL

NEXT=066A_OPPORTUNITY_PIPELINE_READ_ONLY_ADAPTER_SCOPE
MD

cat > docs/evidence/FORGE_UNIFIED_TREE_MISSING_MODULES_BACKFILL_065E.md <<'MD'
# Forge Unified Tree Missing Modules Backfill Evidence 065E

Status: PASS

Backfilled:

- Referral Engine / Referidos — retained; operational capability absorbed by `ADVISOR_OS_SALES_PIPELINE`
- Bitacora / Notes System — retained; prospect context absorbed by `ADVISOR_OS_SALES_PIPELINE`; remainder distributed
- Real-Time Conversation Copilot
- Lead Generation Boost
- Sales Presentation System
- Oye Alfred Wake Voice System

Boundary:

- docs/tree only
- no UI mutation
- no backend connection
- no CRM write
- no pipeline write
- no calendar create
- no message send
- no auth
- no provider runtime
- no recording
- no real engine execution

DECISION=PASS_065E_UNIFIED_BUILD_TREE_MISSING_MODULES_BACKFILL

NEXT=066A_OPPORTUNITY_PIPELINE_READ_ONLY_ADAPTER_SCOPE
MD

cat > docs/evidence/FORGE_UNIFIED_TREE_MISSING_MODULES_BACKFILL_CERTIFICATE_065E.md <<'MD'
# Forge Unified Tree Missing Modules Backfill Certificate 065E

DECISION=PASS_065E_UNIFIED_BUILD_TREE_MISSING_MODULES_BACKFILL

NEXT=066A_OPPORTUNITY_PIPELINE_READ_ONLY_ADAPTER_SCOPE

Certificate:
Capabilities remain registered in the build tree. Referral operations and prospect context are annotated as absorbed by Advisor OS Sales Pipeline; Notes remainder is distributed to Activity / FES, Cartera, appointment lifecycle, and future governed intelligence. No capability is deleted.
MD

cat > docs/evidence/forge-unified-tree-missing-modules-backfill-audit-065e.json <<'JSON'
{
  "phase": "065E_UNIFIED_BUILD_TREE_MISSING_MODULES_BACKFILL",
  "status": "PASS",
  "basePhase": "065D_CLIENT_CRM_READ_ONLY_ADAPTER_DECISION_LOCK",
  "modulesBackfilled": [
    "Bitacora / Notes System",
    "Real-Time Conversation Copilot",
    "Lead Generation Boost",
    "Sales Presentation System",
    "Oye Alfred Wake Voice System"
  ],
  "treeOnly": true,
  "uiMutation": false,
  "backendConnection": false,
  "crmWrite": false,
  "pipelineWrite": false,
  "calendarCreate": false,
  "messageSend": false,
  "authReal": false,
  "providerRuntime": false,
  "recordingEnabled": false,
  "realEffectsEnabled": false,
  "next": "066A_OPPORTUNITY_PIPELINE_READ_ONLY_ADAPTER_SCOPE"
}
JSON

cp "$0" tools/termux/forge_065e_unified_build_tree_missing_modules_backfill.sh || true
pass "docs written"

stage "STAGE 6 UPDATE TREES"
SYNC=$(cat <<'SYNC'
## 065E Unified Build Tree Missing Modules Backfill

Status: PASS

Current lock:
`065D_CLIENT_CRM_READ_ONLY_ADAPTER_DECISION_LOCK`

Held next:
`066A_OPPORTUNITY_PIPELINE_READ_ONLY_ADAPTER_SCOPE`

Backfilled modules:

### 02 Policy & Sales Operation Engine

Add `Bitacora / Notes System`:

Status: RETAINED / PARTIALLY ABSORBED / REMAINDER DISTRIBUTED

- prospect initial context -> absorbed by `ADVISOR_OS_SALES_PIPELINE`
- governed prospect context adapter -> absorbed by `ADVISOR_OS_SALES_PIPELINE`
- timeline and chronological notes -> `ACTIVITY / FES`
- notes by policy -> `CARTERA`
- notes by appointment -> `ACTIVITY / APPOINTMENT LIFECYCLE`
- quick notes by voice/text -> future capture adapter
- automatic tags and AI context -> future governed intelligence scope
- standalone parallel Notes module -> forbidden

### 05 AI & Predictive Intelligence

Add `Real-Time Conversation Copilot`:

- real-time listening
- transcription
- objection detection
- response suggestions
- next-best question
- emotional analysis
- automatic post-appointment summary

Lock: requires explicit permission, recording consent, retention rules, privacy controls, and provider/runtime contracts.

### 06 Lead Generation System

Add `Lead Generation Boost`:

- prospect generation
- intelligent referral generation only; operational referral intake and lifecycle are absorbed by `ADVISOR_OS_SALES_PIPELINE`
- dormant contact reactivation
- outreach scripts
- prospecting campaigns
- lead scoring
- daily suggestions for who to contact

### Sales Enablement Sub-Branch

Add `Sales Presentation System`:

- sales scripts
- financial needs analysis
- initial appointment structure
- closing appointment structure
- presentation creator
- product-specific arguments
- financial storytelling
- expected objections
- post-presentation summary

### 15 Universal Command OS / Alfred

Add `Oye Alfred Wake Voice System`:

- wake phrase: Oye Alfred
- voice activation
- hands-free mode
- spoken command to action preview
- confirmation before execution
- fallback to text
- microphone consent
- visible listening indicator
- no passive listening without permission
- no real execution without approval gate

DECISION=PASS_065E_UNIFIED_BUILD_TREE_MISSING_MODULES_BACKFILL

NEXT=066A_OPPORTUNITY_PIPELINE_READ_ONLY_ADAPTER_SCOPE
SYNC
)

append_block "docs/architecture/source-truth/FORGE_UNIFIED_BUILD_TREE_001.md" "<!-- FORGE:065E_UNIFIED_BUILD_TREE_MISSING_MODULES_BACKFILL:START -->" "<!-- FORGE:065E_UNIFIED_BUILD_TREE_MISSING_MODULES_BACKFILL:END -->" "$SYNC"
append_block "FORGE_MASTER_BUILD_TREE.md" "<!-- FORGE:065E_UNIFIED_BUILD_TREE_MISSING_MODULES_BACKFILL:START -->" "<!-- FORGE:065E_UNIFIED_BUILD_TREE_MISSING_MODULES_BACKFILL:END -->" "$SYNC"
append_block "docs/roadmap/FORGE_ROADMAP_LOCK_001.md" "<!-- FORGE:065E_UNIFIED_BUILD_TREE_MISSING_MODULES_BACKFILL:START -->" "<!-- FORGE:065E_UNIFIED_BUILD_TREE_MISSING_MODULES_BACKFILL:END -->" "$SYNC"
pass "trees updated"

stage "STAGE 7 VALIDATION"
FILES=(
  "FORGE_MASTER_BUILD_TREE.md"
  "docs/architecture/source-truth/FORGE_UNIFIED_BUILD_TREE_001.md"
  "docs/roadmap/FORGE_ROADMAP_LOCK_001.md"
  "docs/architecture/source-truth/FORGE_UNIFIED_TREE_MISSING_MODULES_BACKFILL_065E.md"
  "docs/evidence/FORGE_UNIFIED_TREE_MISSING_MODULES_BACKFILL_065E.md"
  "docs/evidence/FORGE_UNIFIED_TREE_MISSING_MODULES_BACKFILL_CERTIFICATE_065E.md"
  "docs/evidence/forge-unified-tree-missing-modules-backfill-audit-065e.json"
  "tools/termux/forge_065e_unified_build_tree_missing_modules_backfill.sh"
)
for f in "${FILES[@]}"; do norm "$f"; done

run bash -n tools/termux/forge_065e_unified_build_tree_missing_modules_backfill.sh
run python3 -m json.tool docs/evidence/forge-unified-tree-missing-modules-backfill-audit-065e.json
run rg -n "Bitacora / Notes System|Real-Time Conversation Copilot|Lead Generation Boost|Sales Presentation System|Oye Alfred Wake Voice System|PASS_065E_UNIFIED_BUILD_TREE_MISSING_MODULES_BACKFILL|NEXT=066A_OPPORTUNITY_PIPELINE_READ_ONLY_ADAPTER_SCOPE" "${FILES[@]}"
run git diff --check

stage "STAGE 8 SAFETY SCAN"
SCAN_FILES=(
  "FORGE_MASTER_BUILD_TREE.md"
  "docs/architecture/source-truth/FORGE_UNIFIED_BUILD_TREE_001.md"
  "docs/roadmap/FORGE_ROADMAP_LOCK_001.md"
  "docs/architecture/source-truth/FORGE_UNIFIED_TREE_MISSING_MODULES_BACKFILL_065E.md"
  "docs/evidence/FORGE_UNIFIED_TREE_MISSING_MODULES_BACKFILL_065E.md"
  "docs/evidence/FORGE_UNIFIED_TREE_MISSING_MODULES_BACKFILL_CERTIFICATE_065E.md"
  "docs/evidence/forge-unified-tree-missing-modules-backfill-audit-065e.json"
)
if rg -n "crmWrite: true|pipelineWrite: true|calendarCreate: true|messageSend: true|authReal: true|providerRuntime: true|recordingEnabled: true|realEffectsEnabled\\\": true|backendConnection\\\": true|\\\"recordingEnabled\\\": true|\\\"providerRuntime\\\": true" "${SCAN_FILES[@]}"; then
  fail "enabled real-effect marker found"
fi
pass "safety scan clean"

stage "STAGE 9 COMMIT PUSH"
git add "${FILES[@]}"
run git diff --cached --name-only
run git diff --cached --check
run git commit -m "docs: backfill missing unified tree modules"
run git push origin HEAD:main

stage "FINAL DECISION"
printf "PASS_065E_UNIFIED_BUILD_TREE_MISSING_MODULES_BACKFILL_COMMIT_PUSH_COMPLETE\n"
printf "NEXT=066A_OPPORTUNITY_PIPELINE_READ_ONLY_ADAPTER_SCOPE\n"
printf "BACKUP=%s\n" "$BACKUP"
printf "REPORT=%s\n" "$REPORT"

if command -v termux-clipboard-set >/dev/null 2>&1; then termux-clipboard-set < "$REPORT" || true; fi
