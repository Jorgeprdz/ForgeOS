#!/usr/bin/env bash
set -euo pipefail

PHASE="065E1_ROADMAP_HOLD_PARKED_PENDING_REGISTER"
REPO="/storage/emulated/0/Forge OS"
REPORT="/data/data/com.termux/files/home/${PHASE}_RESULT_$(date +%Y%m%d_%H%M%S).md"
mkdir -p "$(dirname "$REPORT")"
exec > >(tee "$REPORT") 2>&1

cd "$REPO" || { echo "FAIL repo not found"; exit 1; }

run(){ echo; echo "========== RUN =========="; echo "$*"; "$@"; }
fail(){ echo "FAIL: $1"; exit 1; }
pass(){ echo "PASS: $1"; }

ROADMAP="docs/roadmap/FORGE_ROADMAP_LOCK_001.md"
EVIDENCE="docs/evidence/FORGE_ROADMAP_HOLD_PARKED_PENDING_REGISTER_065E1.md"
AUDIT="docs/evidence/forge-roadmap-hold-parked-pending-register-audit-065e1.json"
RUNNER="tools/termux/forge_065e1_roadmap_hold_parked_pending_register.sh"

TARGETS=("$ROADMAP" "$EVIDENCE" "$AUDIT" "$RUNNER")

echo "PHASE=$PHASE"
echo "BOUNDARY=roadmap/docs only; no UI; no backend; no CRM; no calendar; no send; no auth; no provider; no recording; no real engine"
echo "REPORT=$REPORT"

echo
echo "========== CHECKPOINT =========="
run git status --short --branch
run git log --oneline -10

[[ -f "$ROADMAP" ]] || fail "missing $ROADMAP"

mkdir -p docs/evidence tools/termux
cp "$0" "$RUNNER" 2>/dev/null || true

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

echo
echo "========== BACKUP =========="
BACKUP=".forge-backups/065e1-roadmap-register-$(date +%Y%m%d_%H%M%S)"
mkdir -p "$BACKUP/$(dirname "$ROADMAP")"
cp "$ROADMAP" "$BACKUP/$ROADMAP"
pass "backup $ROADMAP"

echo
echo "========== WRITE REGISTER =========="
BLOCK=$(cat <<'MD'
## 065E1 Roadmap Hold / Parked / Pending Register

Status: PASS / ROADMAP REGISTERED

Current completed lock:
`065E_UNIFIED_BUILD_TREE_MISSING_MODULES_BACKFILL`

Active next:
`066A_OPPORTUNITY_PIPELINE_READ_ONLY_ADAPTER_SCOPE`

### HOLD

`066A_OPPORTUNITY_PIPELINE_READ_ONLY_ADAPTER_SCOPE`

Reason:
Ready to continue, but intentionally held until the operator chooses whether to run the docs-only scope via Termux shell or use Codex for the next implementation-heavy phase.

Rule:
Do not start `066B_OPPORTUNITY_PIPELINE_READ_ONLY_ADAPTER_IMPLEMENTATION` until `066A` is committed and pushed.

### PARKED

`065F_IOS_STATIC_PREVIEW_LAYOUT_OVERFLOW_REPAIR`

Reason:
iOS Safari screenshot shows horizontal layout drift/overflow.

Boundary when resumed:
UI/CSS repair only. No backend, CRM, calendar, send, auth, provider, recording, or real engine execution.

### PENDING REVIEW

`PRODUCT_INTELLIGENCE_REVIEW`

Purpose:
Re-open Product Intelligence source truth and catalog/data modules before deeper quote behavior.

`QUOTE_MODULES_REVIEW`

Purpose:
Review quote/cotizacion modules and Product Intelligence database usage before any quote adapter or quote preview work.

### PENDING FUTURE SCOPES

`OYE_ALFRED_WAKE_VOICE_SYSTEM_SCOPE`

- wake phrase: Oye Alfred;
- voice activation;
- hands-free mode;
- spoken command to action preview;
- confirmation before execution;
- fallback to text;
- microphone consent;
- visible listening indicator;
- no passive listening without permission;
- no real execution without approval gate.

`NOTES_SYSTEM_SCOPE`

- notes by client;
- notes by policy;
- notes by appointment;
- quick notes by voice/text;
- automatic tags;
- AI context;
- integrated timeline.

`REAL_TIME_CONVERSATION_COPILOT_SCOPE`

- real-time listening;
- transcription;
- objection detection;
- response suggestions;
- next-best question;
- emotional analysis;
- automatic post-appointment summary.

Lock:
Requires explicit permission, recording consent, retention/privacy rules, and provider-runtime boundary before implementation.

`LEAD_GENERATION_BOOST_SCOPE`

- prospect generation;
- intelligent referrals;
- dormant contact reactivation;
- outreach scripts;
- prospecting campaigns;
- lead scoring;
- daily suggestions for who to contact.

Lock:
No outreach/send/campaign execution until separately scoped.

`SALES_PRESENTATION_SYSTEM_SCOPE`

- sales scripts;
- financial needs analysis;
- initial appointment structure;
- closing appointment structure;
- presentation creator;
- product-specific arguments;
- financial storytelling;
- expected objections;
- post-presentation summary.

### Operating Rule

Every session must end with:

- `CURRENT`;
- `NEXT`;
- `HOLD`;
- `PARKED`;
- `PENDING`;
- `DO_NOT_FORGET`.

DECISION=PASS_065E1_ROADMAP_HOLD_PARKED_PENDING_REGISTER

NEXT=066A_OPPORTUNITY_PIPELINE_READ_ONLY_ADAPTER_SCOPE
MD
)

append_block "$ROADMAP" "<!-- FORGE:065E1_ROADMAP_HOLD_PARKED_PENDING_REGISTER:START -->" "<!-- FORGE:065E1_ROADMAP_HOLD_PARKED_PENDING_REGISTER:END -->" "$BLOCK"

cat > "$EVIDENCE" <<'MD'
# Forge Roadmap Hold / Parked / Pending Register 065E1

Status: PASS

Registered:

- HOLD: `066A_OPPORTUNITY_PIPELINE_READ_ONLY_ADAPTER_SCOPE`
- PARKED: `065F_IOS_STATIC_PREVIEW_LAYOUT_OVERFLOW_REPAIR`
- PENDING REVIEW: Product Intelligence, Quote modules
- PENDING FUTURE SCOPES: Oye Alfred, Notes System, Conversation Copilot, Lead Generation Boost, Sales Presentation System

DECISION=PASS_065E1_ROADMAP_HOLD_PARKED_PENDING_REGISTER

NEXT=066A_OPPORTUNITY_PIPELINE_READ_ONLY_ADAPTER_SCOPE
MD

cat > "$AUDIT" <<'JSON'
{
  "phase": "065E1_ROADMAP_HOLD_PARKED_PENDING_REGISTER",
  "status": "PASS",
  "basePhase": "065E_UNIFIED_BUILD_TREE_MISSING_MODULES_BACKFILL",
  "hold": ["066A_OPPORTUNITY_PIPELINE_READ_ONLY_ADAPTER_SCOPE"],
  "parked": ["065F_IOS_STATIC_PREVIEW_LAYOUT_OVERFLOW_REPAIR"],
  "pendingReview": ["PRODUCT_INTELLIGENCE_REVIEW", "QUOTE_MODULES_REVIEW"],
  "pendingFutureScopes": [
    "OYE_ALFRED_WAKE_VOICE_SYSTEM_SCOPE",
    "NOTES_SYSTEM_SCOPE",
    "REAL_TIME_CONVERSATION_COPILOT_SCOPE",
    "LEAD_GENERATION_BOOST_SCOPE",
    "SALES_PRESENTATION_SYSTEM_SCOPE"
  ],
  "roadmapOnly": true,
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

for f in "${TARGETS[@]}"; do norm "$f"; done
pass "roadmap register written"

echo
echo "========== VALIDATION =========="
run bash -n "$RUNNER"
run python3 -m json.tool "$AUDIT"
run rg -n "PASS_065E1_ROADMAP_HOLD_PARKED_PENDING_REGISTER|NEXT=066A_OPPORTUNITY_PIPELINE_READ_ONLY_ADAPTER_SCOPE|065F_IOS_STATIC_PREVIEW_LAYOUT_OVERFLOW_REPAIR|PRODUCT_INTELLIGENCE_REVIEW|QUOTE_MODULES_REVIEW|OYE_ALFRED_WAKE_VOICE_SYSTEM_SCOPE|DO_NOT_FORGET" "$ROADMAP" "$EVIDENCE" "$AUDIT"
run git diff --check

echo
echo "========== SAFETY SCAN =========="
if rg -n "crmWrite: true|pipelineWrite: true|calendarCreate: true|messageSend: true|authReal: true|providerRuntime: true|recordingEnabled: true|realEffectsEnabled\\\": true|backendConnection\\\": true|\\\"recordingEnabled\\\": true|\\\"providerRuntime\\\": true" "$ROADMAP" "$EVIDENCE" "$AUDIT"; then
  fail "enabled real-effect marker found"
fi
pass "safety scan clean"

echo
echo "========== COMMIT PUSH =========="
git add "${TARGETS[@]}"
run git diff --cached --name-only
run git diff --cached --check

if git diff --cached --quiet; then
  echo "PASS_065E1_ROADMAP_HOLD_PARKED_PENDING_REGISTER_ALREADY_CURRENT"
else
  run git commit -m "docs: register roadmap hold parked pending"
  run git push origin HEAD:main
  echo "PASS_065E1_ROADMAP_HOLD_PARKED_PENDING_REGISTER_COMMIT_PUSH_COMPLETE"
fi

echo "NEXT=066A_OPPORTUNITY_PIPELINE_READ_ONLY_ADAPTER_SCOPE"
echo "BACKUP=$BACKUP"
echo "REPORT=$REPORT"
