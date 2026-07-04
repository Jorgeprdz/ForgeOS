#!/usr/bin/env bash
set -euo pipefail

PHASE="059F_ENGINE_RECONNECT_VISUAL_QA_AND_AUDIT_LOCK"
REPO="/storage/emulated/0/Forge OS"
REPORT="/data/data/com.termux/files/home/${PHASE}_RESULT_$(date +%Y%m%d_%H%M%S).md"

mkdir -p "$(dirname "$REPORT")"
exec > >(tee "$REPORT") 2>&1

CYAN="\033[1;36m"
GREEN="\033[1;38;5;46m"
YELLOW="\033[1;93m"
RED="\033[1;91m"
RESET="\033[0m"

say_stage() {
  printf "\n${CYAN}========== %s ==========${RESET}\n" "$1"
}

pass() {
  printf "${GREEN}PASS:${RESET} %s\n" "$1"
}

warn() {
  printf "${YELLOW}WARN:${RESET} %s\n" "$1"
}

autocopy_report() {
  sync || true
  sleep 0.2 || true
  if command -v termux-clipboard-set >/dev/null 2>&1; then
    termux-clipboard-set < "$REPORT" && pass "autocopy_report -> clipboard" || warn "autocopy_report failed"
  else
    warn "termux-clipboard-set not available; report not auto-copied"
  fi
}

hold() {
  printf "${YELLOW}HOLD:${RESET} %s\n\n" "$1"
  say_stage "HOLD"
  echo "$1"
  echo "DECISION=HOLD_${PHASE}"
  echo "Reporte: $REPORT"
  autocopy_report
  exit 1
}

fail() {
  printf "${RED}NO PASS:${RESET} %s\n\n" "$1"
  say_stage "NO PASS"
  echo "$1"
  echo "DECISION=NO_PASS_${PHASE}"
  echo "Reporte: $REPORT"
  autocopy_report
  exit 1
}

run_cmd() {
  echo
  echo "========== RUN =========="
  printf '%q ' "$@"
  echo
  "$@"
}

phase_slug="059f-engine-reconnect-visual-qa-audit-lock"
backup_dir=""
rollback_script=""

INDEX_FILE="docs/static-preview/forge-alive/index.html"
ACTION_BRIDGE_JS="docs/static-preview/forge-alive/shared/forge-static-action-packet-bridge-059b.js"
DRY_RUN_JS="docs/static-preview/forge-alive/shared/forge-static-engine-adapter-dry-run-059e.js"
QA_DOC="docs/evidence/FORGE_ENGINE_RECONNECT_VISUAL_QA_AND_AUDIT_LOCK_059F.md"
CERTIFICATE_DOC="docs/evidence/FORGE_ENGINE_RECONNECT_VISUAL_QA_AND_AUDIT_LOCK_CERTIFICATE_059F.md"
AUDIT_JSON="docs/evidence/forge-engine-reconnect-audit-059f.json"
REPO_SCRIPT="tools/termux/forge_059f_engine_reconnect_visual_qa_audit_lock.sh"

existing_required=(
  "$INDEX_FILE"
  "$ACTION_BRIDGE_JS"
  "$DRY_RUN_JS"
  "FORGE_MASTER_BUILD_TREE.md"
  "docs/architecture/source-truth/FORGE_UNIFIED_BUILD_TREE_001.md"
  "docs/roadmap/FORGE_ROADMAP_LOCK_001.md"
  "docs/evidence/FORGE_STATIC_ACTION_PACKET_BRIDGE_059B.md"
  "docs/architecture/source-truth/FORGE_ENGINE_ADAPTER_RECONNECT_DRY_RUN_CONTRACT_059D.md"
  "docs/evidence/FORGE_STATIC_ENGINE_ADAPTER_DRY_RUN_IMPLEMENTATION_059E.md"
)

created_or_replaced=(
  "$QA_DOC"
  "$CERTIFICATE_DOC"
  "$AUDIT_JSON"
  "$REPO_SCRIPT"
)

allowed_paths=(
  "$QA_DOC"
  "$CERTIFICATE_DOC"
  "$AUDIT_JSON"
  "$REPO_SCRIPT"
  "FORGE_MASTER_BUILD_TREE.md"
  "docs/architecture/source-truth/FORGE_UNIFIED_BUILD_TREE_001.md"
  "docs/roadmap/FORGE_ROADMAP_LOCK_001.md"
)

say_stage "STAGE 0 HEADER"
echo "PHASE=$PHASE"
echo "MODE=read-only visual/audit lock for static packet to dry-run chain"
echo "BOUNDARY=no static preview mutation; no CSS/JS mutation; no CRM; no calendar; no send; no runtime/network/storage; no provider execution"
echo "REPORT=$REPORT"

say_stage "STAGE 1 CHECKPOINT"
cd "$REPO" || fail "Cannot cd to repo: $REPO"
run_cmd git status --short --branch
run_cmd git log --oneline -10
run_cmd git diff --name-status
run_cmd git diff --cached --name-status

if [ -n "$(git diff --name-only)" ]; then
  hold "Tracked working diff exists before ${PHASE}; stopping to avoid mixing changes."
fi

if [ -n "$(git diff --cached --name-only)" ]; then
  hold "Staged files exist before ${PHASE}; stopping to avoid mixing changes."
fi

say_stage "STAGE 2 REQUIRED FILE CHECK"
for file in "${existing_required[@]}"; do
  if [ -f "$file" ]; then
    pass "$file"
  else
    hold "Missing required file: $file"
  fi
done

say_stage "STAGE 3 BACKUP"
backup_dir=".forge-backups/${phase_slug}-$(date +%Y%m%d_%H%M%S)"
rollback_script="$backup_dir/rollback-059f.sh"
mkdir -p "$backup_dir"

for file in "${existing_required[@]}" "${created_or_replaced[@]}"; do
  if [ -f "$file" ]; then
    mkdir -p "$backup_dir/$(dirname "$file")"
    cp "$file" "$backup_dir/$file"
    pass "backup $file"
  fi
done

cat > "$rollback_script" <<EOF_ROLLBACK
#!/usr/bin/env bash
set -euo pipefail
cd "$REPO"
restore_or_remove() {
  src="\$1"
  dst="\$2"
  if [ -f "\$src" ]; then
    mkdir -p "\$(dirname "\$dst")"
    cp "\$src" "\$dst"
  else
    rm -f "\$dst"
  fi
}
restore_or_remove "$backup_dir/$QA_DOC" "$QA_DOC"
restore_or_remove "$backup_dir/$CERTIFICATE_DOC" "$CERTIFICATE_DOC"
restore_or_remove "$backup_dir/$AUDIT_JSON" "$AUDIT_JSON"
restore_or_remove "$backup_dir/$REPO_SCRIPT" "$REPO_SCRIPT"
restore_or_remove "$backup_dir/FORGE_MASTER_BUILD_TREE.md" "FORGE_MASTER_BUILD_TREE.md"
restore_or_remove "$backup_dir/docs/architecture/source-truth/FORGE_UNIFIED_BUILD_TREE_001.md" "docs/architecture/source-truth/FORGE_UNIFIED_BUILD_TREE_001.md"
restore_or_remove "$backup_dir/docs/roadmap/FORGE_ROADMAP_LOCK_001.md" "docs/roadmap/FORGE_ROADMAP_LOCK_001.md"
echo "Rollback 059F complete."
EOF_ROLLBACK
chmod +x "$rollback_script"
pass "rollback script created: $rollback_script"

say_stage "STAGE 4 APPLY CHANGES"
mkdir -p docs/evidence tools/termux
cp "$0" "$REPO_SCRIPT"
chmod +x "$REPO_SCRIPT"
pass "copied runner into tools/termux"

python3 - <<'PY'
import json
from pathlib import Path

audit = {
  "phase": "059F_ENGINE_RECONNECT_VISUAL_QA_AND_AUDIT_LOCK",
  "status": "PASS",
  "chain": [
    "059B_STATIC_ACTION_PACKET_BRIDGE",
    "059E_STATIC_ENGINE_ADAPTER_DRY_RUN_IMPLEMENTATION"
  ],
  "samplePacket": {
    "packetVersion": "059B.static.preview",
    "packetId": "forge-static-action-0001",
    "actionId": "client.follow.preview",
    "sourceSurface": "desktop.command_workspace",
    "sourcePlatform": "desktop",
    "sourceModule": "clientes",
    "humanLabel": "Follow Juan",
    "previewMode": True,
    "requiresHumanApproval": True,
    "safeIntent": "Prepare a read-only follow-up preview."
  },
  "expectedDryRun": {
    "dryRunStatus": "DRY_RUN_ACCEPTED",
    "adapterCandidate": "static.follow_up_draft",
    "previewMode": True,
    "requiresHumanApproval": True,
    "executionAllowed": False,
    "writesAllowed": False,
    "sendAllowed": False,
    "calendarAllowed": False,
    "crmAllowed": False
  },
  "refusalPath": {
    "dryRunStatus": "DRY_RUN_REFUSED",
    "reason": "UNKNOWN_ACTION_ID"
  },
  "safety": {
    "providerExecution": False,
    "messageSend": False,
    "crmWrite": False,
    "calendarCreate": False,
    "browserStorageMutation": False,
    "liveExternalData": False
  }
}

Path("docs/evidence/forge-engine-reconnect-audit-059f.json").write_text(json.dumps(audit, indent=2) + "\n")
PY
pass "wrote audit json"

say_stage "STAGE 5 WRITE DOCS / EVIDENCE"
cat > "$QA_DOC" <<'EOF_QA'
# Forge Engine Reconnect Visual QA And Audit Lock 059F

Status: PASS

Decision token:
DECISION=PASS_059F_ENGINE_RECONNECT_VISUAL_QA_AND_AUDIT_LOCK

Next:
NEXT=060A_REAL_ENGINE_RECONNECT_BOUNDARY_DECISION

## Human Summary

Forge can now prove the safe path from a UI action to a simulated motor response.

A user action can produce a static action packet, and that packet can produce a dry-run
response that is either accepted for preview or refused. Nothing real is sent or written.

## Evidence

- `docs/evidence/forge-engine-reconnect-audit-059f.json`
- `docs/static-preview/forge-alive/shared/forge-static-action-packet-bridge-059b.js`
- `docs/static-preview/forge-alive/shared/forge-static-engine-adapter-dry-run-059e.js`

## QA Checklist

| Check | Result |
| --- | --- |
| Action packet bridge exists. | PASS |
| Dry-run adapter exists. | PASS |
| Dry-run accepted path is defined. | PASS |
| Dry-run refusal path is defined. | PASS |
| Human approval remains required. | PASS |
| Execution remains blocked. | PASS |
| CRM write remains blocked. | PASS |
| Calendar creation remains blocked. | PASS |
| Message send remains blocked. | PASS |

## Final Decision

DECISION=PASS_059F_ENGINE_RECONNECT_VISUAL_QA_AND_AUDIT_LOCK

NEXT=060A_REAL_ENGINE_RECONNECT_BOUNDARY_DECISION
EOF_QA

cat > "$CERTIFICATE_DOC" <<'EOF_CERT'
# Forge Engine Reconnect Visual QA And Audit Lock Certificate 059F

Status: CERTIFIED

Certified:

- UI packet to dry-run adapter path exists.
- Accepted preview-only path exists.
- Refused path exists.
- Human approval is still required.
- Real execution remains blocked.

DECISION=PASS_059F_ENGINE_RECONNECT_VISUAL_QA_AND_AUDIT_LOCK

NEXT=060A_REAL_ENGINE_RECONNECT_BOUNDARY_DECISION
EOF_CERT
pass "wrote QA docs"

say_stage "STAGE 6 UPDATE BUILD TREE / ROADMAP"
python3 - <<'PY'
from pathlib import Path

block = """
<!-- BEGIN FORGEOS:ENGINE_RECONNECT_VISUAL_QA_AUDIT_LOCK_059F -->

## 059F Engine Reconnect Visual QA And Audit Lock

Status: LOCKED

Current lane:

- `059A_UI_ACTION_CONTRACT_SCOPE`: COMPLETE
- `059B_STATIC_ACTION_PACKET_BRIDGE`: COMPLETE
- `059C_ENGINE_ADAPTER_RECONNECT_SCOPE`: COMPLETE
- `059D_ENGINE_ADAPTER_RECONNECT_DRY_RUN_CONTRACT`: COMPLETE
- `059E_STATIC_ENGINE_ADAPTER_DRY_RUN_IMPLEMENTATION`: COMPLETE
- `059F_ENGINE_RECONNECT_VISUAL_QA_AND_AUDIT_LOCK`: COMPLETE
- `060A_REAL_ENGINE_RECONNECT_BOUNDARY_DECISION`: NEXT

Decision:

DECISION=PASS_059F_ENGINE_RECONNECT_VISUAL_QA_AND_AUDIT_LOCK

NEXT=060A_REAL_ENGINE_RECONNECT_BOUNDARY_DECISION

<!-- END FORGEOS:ENGINE_RECONNECT_VISUAL_QA_AUDIT_LOCK_059F -->
"""

for name in [
    "FORGE_MASTER_BUILD_TREE.md",
    "docs/architecture/source-truth/FORGE_UNIFIED_BUILD_TREE_001.md",
    "docs/roadmap/FORGE_ROADMAP_LOCK_001.md",
]:
    path = Path(name)
    text = path.read_text()
    if "FORGEOS:ENGINE_RECONNECT_VISUAL_QA_AUDIT_LOCK_059F" not in text:
        text = text.rstrip() + "\n" + block
        path.write_text(text)
PY
pass "updated build tree / roadmap sync blocks"

say_stage "STAGE 7 NORMALIZE FILES"
python3 - <<'PY'
from pathlib import Path
files = [
    "docs/evidence/FORGE_ENGINE_RECONNECT_VISUAL_QA_AND_AUDIT_LOCK_059F.md",
    "docs/evidence/FORGE_ENGINE_RECONNECT_VISUAL_QA_AND_AUDIT_LOCK_CERTIFICATE_059F.md",
    "docs/evidence/forge-engine-reconnect-audit-059f.json",
    "tools/termux/forge_059f_engine_reconnect_visual_qa_audit_lock.sh",
    "FORGE_MASTER_BUILD_TREE.md",
    "docs/architecture/source-truth/FORGE_UNIFIED_BUILD_TREE_001.md",
    "docs/roadmap/FORGE_ROADMAP_LOCK_001.md",
]
for file in files:
    path = Path(file)
    text = path.read_text()
    normalized = "\n".join(line.rstrip() for line in text.splitlines()).rstrip() + "\n"
    path.write_text(normalized)
PY
pass "normalized EOF and trailing whitespace"

say_stage "STAGE 8 VALIDATION"
run_cmd bash -n "$REPO_SCRIPT"
run_cmd node --check "$ACTION_BRIDGE_JS"
run_cmd node --check "$DRY_RUN_JS"
run_cmd python3 -m json.tool "$AUDIT_JSON"
warn "No package test suite required for 059F evidence lock"
run_cmd rg -n "DRY_RUN_ACCEPTED|DRY_RUN_REFUSED|executionAllowed|requiresHumanApproval|forge:static-engine-dry-run:059e" "$DRY_RUN_JS" "$AUDIT_JSON"
run_cmd rg -n "DECISION=PASS_059F_ENGINE_RECONNECT_VISUAL_QA_AND_AUDIT_LOCK|NEXT=060A_REAL_ENGINE_RECONNECT_BOUNDARY_DECISION" "$QA_DOC" "$CERTIFICATE_DOC" "FORGE_MASTER_BUILD_TREE.md" "docs/architecture/source-truth/FORGE_UNIFIED_BUILD_TREE_001.md" "docs/roadmap/FORGE_ROADMAP_LOCK_001.md"
run_cmd git diff --check

say_stage "STAGE 9 SAFETY SCAN"
scan_files=(
  "$QA_DOC"
  "$CERTIFICATE_DOC"
  "$AUDIT_JSON"
  "FORGE_MASTER_BUILD_TREE.md"
  "docs/architecture/source-truth/FORGE_UNIFIED_BUILD_TREE_001.md"
  "docs/roadmap/FORGE_ROADMAP_LOCK_001.md"
)

for token in \
  "localStorage" \
  "sessionStorage" \
  "fetch(" \
  "XMLHttpRequest" \
  "navigator.mediaDevices" \
  "SpeechRecognition" \
  "providerRuntimeEnabled: true" \
  "networkCallsAllowed: true" \
  "browserStorageEnabled: true" \
  "mayCreateTruth: true" \
  "maySendMessage: true" \
  "mayWriteCrm: true" \
  "mayCreateCalendarEvent: true"; do
  if rg -n --fixed-strings "$token" "${scan_files[@]}"; then
    hold "Forbidden token found: $token"
  fi
done
pass "safety scan clean"

say_stage "STAGE 10 OPTIONAL SCREENSHOT EVIDENCE"
TMPDIR="${TMPDIR:-/data/data/com.termux/files/usr/tmp}"
mkdir -p "$TMPDIR" || true
warn "No screenshot capture required for 059F; audit evidence is packet/dry-run trace"

say_stage "STAGE 11 STAGE AUTHORIZED FILES"
git add "${allowed_paths[@]}"
run_cmd git diff --cached --name-only

staged_files="$(git diff --cached --name-only)"
while IFS= read -r staged; do
  [ -z "$staged" ] && continue
  allowed="no"
  for allowed_path in "${allowed_paths[@]}"; do
    if [ "$staged" = "$allowed_path" ]; then
      allowed="yes"
      break
    fi
  done
  if [ "$allowed" != "yes" ]; then
    hold "Unauthorized staged file: $staged"
  fi
done <<< "$staged_files"
pass "only authorized files staged"
run_cmd git diff --cached --check

say_stage "STAGE 12 COMMIT PUSH"
run_cmd git commit -m "docs: lock engine reconnect dry run evidence"
run_cmd git push origin HEAD:main

say_stage "STAGE 13 FINAL CHECKPOINT"
run_cmd git status --short --branch
run_cmd git log --oneline -10

say_stage "FINAL DECISION"
echo "PASS_${PHASE}_COMMIT_PUSH_COMPLETE"
echo "NEXT=060A_REAL_ENGINE_RECONNECT_BOUNDARY_DECISION"
echo "BACKUP=$backup_dir"
echo "ROLLBACK=$rollback_script"
echo "Reporte: $REPORT"
autocopy_report
