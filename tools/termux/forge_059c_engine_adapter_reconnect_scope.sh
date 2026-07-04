#!/usr/bin/env bash
set -euo pipefail

PHASE="059C_ENGINE_ADAPTER_RECONNECT_SCOPE"
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

phase_slug="059c-engine-adapter-reconnect-scope"
backup_dir=""
rollback_script=""

existing_required=(
  "FORGE_MASTER_BUILD_TREE.md"
  "docs/architecture/source-truth/FORGE_UNIFIED_BUILD_TREE_001.md"
  "docs/roadmap/FORGE_ROADMAP_LOCK_001.md"
  "docs/architecture/source-truth/FORGE_UI_ACTION_CONTRACT_SCOPE_059A.md"
  "docs/design/forge-ui/FORGE_UI_ACTION_PACKET_CONTRACT_059A.md"
  "docs/evidence/FORGE_STATIC_ACTION_PACKET_BRIDGE_059B.md"
  "docs/static-preview/forge-alive/shared/forge-static-action-packet-bridge-059b.js"
)

created_or_replaced=(
  "docs/architecture/source-truth/FORGE_ENGINE_ADAPTER_RECONNECT_SCOPE_059C.md"
  "docs/design/forge-ui/FORGE_ENGINE_ADAPTER_MAPPING_059C.md"
  "docs/roadmap/FORGE_ENGINE_ADAPTER_RECONNECT_ROADMAP_059C.md"
  "docs/evidence/FORGE_ENGINE_ADAPTER_RECONNECT_SCOPE_059C.md"
  "tools/termux/forge_059c_engine_adapter_reconnect_scope.sh"
)

allowed_paths=(
  "FORGE_MASTER_BUILD_TREE.md"
  "docs/architecture/source-truth/FORGE_UNIFIED_BUILD_TREE_001.md"
  "docs/roadmap/FORGE_ROADMAP_LOCK_001.md"
  "docs/architecture/source-truth/FORGE_ENGINE_ADAPTER_RECONNECT_SCOPE_059C.md"
  "docs/design/forge-ui/FORGE_ENGINE_ADAPTER_MAPPING_059C.md"
  "docs/roadmap/FORGE_ENGINE_ADAPTER_RECONNECT_ROADMAP_059C.md"
  "docs/evidence/FORGE_ENGINE_ADAPTER_RECONNECT_SCOPE_059C.md"
  "tools/termux/forge_059c_engine_adapter_reconnect_scope.sh"
)

say_stage "STAGE 0 HEADER"
echo "PHASE=$PHASE"
echo "MODE=docs/source-truth engine adapter reconnect scope only"
echo "BOUNDARY=no static preview mutation; no CSS/JS mutation; no CRM; no calendar; no send; no runtime/network/storage; no engine execution"
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
rollback_script="$backup_dir/rollback-059c.sh"
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
restore_or_remove "$backup_dir/FORGE_MASTER_BUILD_TREE.md" "FORGE_MASTER_BUILD_TREE.md"
restore_or_remove "$backup_dir/docs/architecture/source-truth/FORGE_UNIFIED_BUILD_TREE_001.md" "docs/architecture/source-truth/FORGE_UNIFIED_BUILD_TREE_001.md"
restore_or_remove "$backup_dir/docs/roadmap/FORGE_ROADMAP_LOCK_001.md" "docs/roadmap/FORGE_ROADMAP_LOCK_001.md"
restore_or_remove "$backup_dir/docs/architecture/source-truth/FORGE_ENGINE_ADAPTER_RECONNECT_SCOPE_059C.md" "docs/architecture/source-truth/FORGE_ENGINE_ADAPTER_RECONNECT_SCOPE_059C.md"
restore_or_remove "$backup_dir/docs/design/forge-ui/FORGE_ENGINE_ADAPTER_MAPPING_059C.md" "docs/design/forge-ui/FORGE_ENGINE_ADAPTER_MAPPING_059C.md"
restore_or_remove "$backup_dir/docs/roadmap/FORGE_ENGINE_ADAPTER_RECONNECT_ROADMAP_059C.md" "docs/roadmap/FORGE_ENGINE_ADAPTER_RECONNECT_ROADMAP_059C.md"
restore_or_remove "$backup_dir/docs/evidence/FORGE_ENGINE_ADAPTER_RECONNECT_SCOPE_059C.md" "docs/evidence/FORGE_ENGINE_ADAPTER_RECONNECT_SCOPE_059C.md"
restore_or_remove "$backup_dir/tools/termux/forge_059c_engine_adapter_reconnect_scope.sh" "tools/termux/forge_059c_engine_adapter_reconnect_scope.sh"
echo "Rollback 059C complete."
EOF_ROLLBACK
chmod +x "$rollback_script"
pass "rollback script created: $rollback_script"

say_stage "STAGE 4 APPLY CHANGES"
mkdir -p docs/architecture/source-truth docs/design/forge-ui docs/roadmap docs/evidence tools/termux
cp "$0" "tools/termux/forge_059c_engine_adapter_reconnect_scope.sh"
chmod +x "tools/termux/forge_059c_engine_adapter_reconnect_scope.sh"
pass "copied runner into tools/termux"

python3 - <<'PY'
from pathlib import Path

scope = Path("docs/architecture/source-truth/FORGE_ENGINE_ADAPTER_RECONNECT_SCOPE_059C.md")
scope.write_text("""# Forge Engine Adapter Reconnect Scope 059C

Status: SCOPED

Decision token:
DECISION=PASS_059C_ENGINE_ADAPTER_RECONNECT_SCOPE

Next:
NEXT=059D_ENGINE_ADAPTER_RECONNECT_DRY_RUN_CONTRACT

## Purpose

059C scopes how static UI action packets from 059B may be mapped to existing or future engine adapter candidates.

This is not an implementation of engine execution. It is a boundary and mapping document for reconnecting Forge UI intent to motor/engine architecture without bypassing human approval.

## Boundary

Allowed:

- identify candidate adapter families;
- map canonical UI action ids to adapter candidates;
- define dry-run contract requirements;
- define approval-gate expectations;
- define non-execution constraints;
- define evidence required before any live adapter work.

Forbidden:

- engine execution;
- provider calls;
- message sending;
- CRM mutation;
- calendar creation;
- browser storage mutation;
- live external data reads;
- compensation or production truth creation.

## Required Inputs

- `FORGE_UI_ACTION_CONTRACT_SCOPE_059A.md`
- `FORGE_UI_ACTION_PACKET_CONTRACT_059A.md`
- `FORGE_STATIC_ACTION_PACKET_BRIDGE_059B.md`
- `forge-static-action-packet-bridge-059b.js`

## Adapter Candidate Families

| Candidate family | Purpose | 059C status |
| --- | --- | --- |
| Static quote adapter | Prepare quote preview from `quote.create.preview`. | Candidate only |
| Static document intake adapter | Prepare upload or policy review preview. | Candidate only |
| Static follow-up draft adapter | Prepare follow-up context for clients. | Candidate only |
| Static call-prep adapter | Prepare call context and talking points. | Candidate only |
| Static message draft adapter | Prepare message draft content for approval. | Candidate only |
| Static client read adapter | Prepare client lookup/read preview. | Candidate only |
| Static report read adapter | Prepare report preview. | Candidate only |
| Static pipeline review adapter | Prepare pipeline review preview. | Candidate only |
| Static daily review adapter | Prepare daily plan preview. | Candidate only |

## Adapter Reconnect Rule

No adapter may execute from UI packets until a later phase proves all of the following:

1. packet schema validation;
2. action id allowlist;
3. preview-only dry run;
4. human approval gate;
5. audit trace;
6. explicit no-write defaults;
7. rollback or refusal path.

## Final Decision

DECISION=PASS_059C_ENGINE_ADAPTER_RECONNECT_SCOPE

NEXT=059D_ENGINE_ADAPTER_RECONNECT_DRY_RUN_CONTRACT
""")

mapping = Path("docs/design/forge-ui/FORGE_ENGINE_ADAPTER_MAPPING_059C.md")
mapping.write_text("""# Forge Engine Adapter Mapping 059C

Status: MAPPING SCOPED

Decision token:
DECISION=FORGE_ENGINE_ADAPTER_MAPPING_059C

Next:
NEXT=059D_ENGINE_ADAPTER_RECONNECT_DRY_RUN_CONTRACT

## Canonical Mapping

| UI action id | Source module | Candidate adapter | Execution status |
| --- | --- | --- | --- |
| `quote.create.preview` | Cotizaciones | Static quote adapter | Not executable |
| `policy.upload.preview` | Polizas | Static document intake adapter | Not executable |
| `client.follow.preview` | Clientes | Static follow-up draft adapter | Not executable |
| `client.call.preview` | Clientes | Static call-prep adapter | Not executable |
| `client.message.preview` | Clientes | Static message draft adapter | Not executable |
| `client.search.preview` | Clientes | Static client read adapter | Not executable |
| `policy.open.preview` | Polizas | Static policy read adapter | Not executable |
| `report.open.preview` | Reportes | Static report read adapter | Not executable |
| `pipeline.review.preview` | Pipeline | Static pipeline review adapter | Not executable |
| `day.review.preview` | Inicio | Static daily review adapter | Not executable |

## Required Adapter Defaults

| Field | Required value before reconnect |
| --- | --- |
| `previewMode` | `true` |
| `requiresHumanApproval` | `true` |
| `executionAllowed` | `false` |
| `writesAllowed` | `false` |
| `sendAllowed` | `false` |
| `calendarAllowed` | `false` |
| `crmAllowed` | `false` |

## Final Decision

DECISION=FORGE_ENGINE_ADAPTER_MAPPING_059C

NEXT=059D_ENGINE_ADAPTER_RECONNECT_DRY_RUN_CONTRACT
""")

roadmap = Path("docs/roadmap/FORGE_ENGINE_ADAPTER_RECONNECT_ROADMAP_059C.md")
roadmap.write_text("""# Forge Engine Adapter Reconnect Roadmap 059C

Status: ROADMAP

Decision token:
DECISION=FORGE_ENGINE_ADAPTER_RECONNECT_ROADMAP_059C

Next:
NEXT=059D_ENGINE_ADAPTER_RECONNECT_DRY_RUN_CONTRACT

## Sequence

### 059C_ENGINE_ADAPTER_RECONNECT_SCOPE

Scope candidate adapter mapping and reconnect boundaries.

### 059D_ENGINE_ADAPTER_RECONNECT_DRY_RUN_CONTRACT

Define dry-run packet validation, refusal, audit trace, and non-execution output.

### 059E_STATIC_ENGINE_ADAPTER_DRY_RUN_IMPLEMENTATION

Implement preview-only dry-run adapter behavior without provider execution.

### 059F_ENGINE_RECONNECT_VISUAL_QA_AND_AUDIT_LOCK

Validate UI packet to dry-run adapter trace with screenshots/evidence.

## Final Decision

DECISION=FORGE_ENGINE_ADAPTER_RECONNECT_ROADMAP_059C

NEXT=059D_ENGINE_ADAPTER_RECONNECT_DRY_RUN_CONTRACT
""")
PY
pass "wrote 059C scope/mapping/roadmap docs"

say_stage "STAGE 5 WRITE DOCS / EVIDENCE"
cat > "docs/evidence/FORGE_ENGINE_ADAPTER_RECONNECT_SCOPE_059C.md" <<'EOF_EVIDENCE'
# Forge Engine Adapter Reconnect Scope 059C Evidence

Status: DOCUMENTED

Decision token:
DECISION=PASS_059C_ENGINE_ADAPTER_RECONNECT_SCOPE

Next:
NEXT=059D_ENGINE_ADAPTER_RECONNECT_DRY_RUN_CONTRACT

## Evidence

059C created source-truth and design mapping documents that define how UI action packets may later map to adapter candidates.

No static preview UI files were changed.
No engines were connected.
No provider calls were introduced.
No CRM, calendar, message, storage, or truth writes were introduced.

## Files

- `docs/architecture/source-truth/FORGE_ENGINE_ADAPTER_RECONNECT_SCOPE_059C.md`
- `docs/design/forge-ui/FORGE_ENGINE_ADAPTER_MAPPING_059C.md`
- `docs/roadmap/FORGE_ENGINE_ADAPTER_RECONNECT_ROADMAP_059C.md`
- `docs/evidence/FORGE_ENGINE_ADAPTER_RECONNECT_SCOPE_059C.md`
- `tools/termux/forge_059c_engine_adapter_reconnect_scope.sh`

## Final Decision

DECISION=PASS_059C_ENGINE_ADAPTER_RECONNECT_SCOPE

NEXT=059D_ENGINE_ADAPTER_RECONNECT_DRY_RUN_CONTRACT
EOF_EVIDENCE
pass "wrote evidence doc"

say_stage "STAGE 6 UPDATE BUILD TREE / ROADMAP"
python3 - <<'PY'
from pathlib import Path

block = """
<!-- BEGIN FORGEOS:ENGINE_ADAPTER_RECONNECT_SCOPE_059C -->

## 059C Engine Adapter Reconnect Scope

Status: SCOPED

Current lane:

- `059A_UI_ACTION_CONTRACT_SCOPE`: COMPLETE
- `059B_STATIC_ACTION_PACKET_BRIDGE`: COMPLETE
- `059C_ENGINE_ADAPTER_RECONNECT_SCOPE`: COMPLETE
- `059D_ENGINE_ADAPTER_RECONNECT_DRY_RUN_CONTRACT`: NEXT

Decision:

DECISION=PASS_059C_ENGINE_ADAPTER_RECONNECT_SCOPE

NEXT=059D_ENGINE_ADAPTER_RECONNECT_DRY_RUN_CONTRACT

<!-- END FORGEOS:ENGINE_ADAPTER_RECONNECT_SCOPE_059C -->
"""

for name in [
    "FORGE_MASTER_BUILD_TREE.md",
    "docs/architecture/source-truth/FORGE_UNIFIED_BUILD_TREE_001.md",
    "docs/roadmap/FORGE_ROADMAP_LOCK_001.md",
]:
    path = Path(name)
    text = path.read_text()
    if "FORGEOS:ENGINE_ADAPTER_RECONNECT_SCOPE_059C" not in text:
        text = text.rstrip() + "\n" + block
        path.write_text(text)
PY
pass "updated build tree / roadmap sync blocks"

say_stage "STAGE 7 NORMALIZE FILES"
python3 - <<'PY'
from pathlib import Path
files = [
    "FORGE_MASTER_BUILD_TREE.md",
    "docs/architecture/source-truth/FORGE_UNIFIED_BUILD_TREE_001.md",
    "docs/roadmap/FORGE_ROADMAP_LOCK_001.md",
    "docs/architecture/source-truth/FORGE_ENGINE_ADAPTER_RECONNECT_SCOPE_059C.md",
    "docs/design/forge-ui/FORGE_ENGINE_ADAPTER_MAPPING_059C.md",
    "docs/roadmap/FORGE_ENGINE_ADAPTER_RECONNECT_ROADMAP_059C.md",
    "docs/evidence/FORGE_ENGINE_ADAPTER_RECONNECT_SCOPE_059C.md",
    "tools/termux/forge_059c_engine_adapter_reconnect_scope.sh",
]
for file in files:
    path = Path(file)
    text = path.read_text()
    normalized = "\n".join(line.rstrip() for line in text.splitlines()).rstrip() + "\n"
    path.write_text(normalized)
PY
pass "normalized EOF and trailing whitespace"

say_stage "STAGE 8 VALIDATION"
run_cmd bash -n "tools/termux/forge_059c_engine_adapter_reconnect_scope.sh"
run_cmd rg -n "DECISION=PASS_059C_ENGINE_ADAPTER_RECONNECT_SCOPE|NEXT=059D_ENGINE_ADAPTER_RECONNECT_DRY_RUN_CONTRACT|quote.create.preview|client.follow.preview|executionAllowed" \
  "docs/architecture/source-truth/FORGE_ENGINE_ADAPTER_RECONNECT_SCOPE_059C.md" \
  "docs/design/forge-ui/FORGE_ENGINE_ADAPTER_MAPPING_059C.md" \
  "docs/roadmap/FORGE_ENGINE_ADAPTER_RECONNECT_ROADMAP_059C.md" \
  "docs/evidence/FORGE_ENGINE_ADAPTER_RECONNECT_SCOPE_059C.md" \
  "FORGE_MASTER_BUILD_TREE.md" \
  "docs/architecture/source-truth/FORGE_UNIFIED_BUILD_TREE_001.md" \
  "docs/roadmap/FORGE_ROADMAP_LOCK_001.md"
run_cmd git diff --check

say_stage "STAGE 9 SAFETY SCAN"
scan_files=(
  "docs/architecture/source-truth/FORGE_ENGINE_ADAPTER_RECONNECT_SCOPE_059C.md"
  "docs/design/forge-ui/FORGE_ENGINE_ADAPTER_MAPPING_059C.md"
  "docs/roadmap/FORGE_ENGINE_ADAPTER_RECONNECT_ROADMAP_059C.md"
  "docs/evidence/FORGE_ENGINE_ADAPTER_RECONNECT_SCOPE_059C.md"
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
warn "No screenshot evidence required for docs-only 059C scope"

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
run_cmd git commit -m "docs: scope engine adapter reconnect"
run_cmd git push origin HEAD:main

say_stage "STAGE 13 FINAL CHECKPOINT"
run_cmd git status --short --branch
run_cmd git log --oneline -10

say_stage "FINAL DECISION"
echo "PASS_${PHASE}_COMMIT_PUSH_COMPLETE"
echo "NEXT=059D_ENGINE_ADAPTER_RECONNECT_DRY_RUN_CONTRACT"
echo "BACKUP=$backup_dir"
echo "ROLLBACK=$rollback_script"
echo "Reporte: $REPORT"
autocopy_report
