#!/usr/bin/env bash
set -euo pipefail

PHASE="060B_REAL_ENGINE_CANDIDATE_INVENTORY_AND_SELECTION"
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

phase_slug="060b-real-engine-candidate-inventory-and-selection"
backup_dir=""
rollback_script=""

SOURCE_DOC="docs/architecture/source-truth/FORGE_REAL_ENGINE_CANDIDATE_INVENTORY_AND_SELECTION_060B.md"
BOUNDARY_DOC="docs/design/forge-ui/FORGE_SELECTED_ENGINE_CANDIDATE_BOUNDARY_060B.md"
ROADMAP_DOC="docs/roadmap/FORGE_SELECTED_ENGINE_DRY_RUN_ADAPTER_ROADMAP_060B.md"
EVIDENCE_DOC="docs/evidence/FORGE_REAL_ENGINE_CANDIDATE_INVENTORY_AND_SELECTION_060B.md"
INVENTORY_DOC="docs/evidence/forge-real-engine-candidate-inventory-060b.md"
REPO_SCRIPT="tools/termux/forge_060b_real_engine_candidate_inventory_and_selection.sh"

existing_required=(
  "FORGE_MASTER_BUILD_TREE.md"
  "docs/architecture/source-truth/FORGE_UNIFIED_BUILD_TREE_001.md"
  "docs/roadmap/FORGE_ROADMAP_LOCK_001.md"
  "docs/architecture/source-truth/FORGE_REAL_ENGINE_RECONNECT_BOUNDARY_DECISION_060A.md"
  "docs/design/forge-ui/FORGE_UI_TO_REAL_ENGINE_BOUNDARY_060A.md"
  "docs/evidence/FORGE_REAL_ENGINE_RECONNECT_BOUNDARY_DECISION_060A.md"
  "docs/evidence/forge-engine-reconnect-audit-059f.json"
  "docs/design/forge-ui/FORGE_ENGINE_DRY_RUN_PACKET_CONTRACT_059D.md"
)

created_or_replaced=(
  "$SOURCE_DOC"
  "$BOUNDARY_DOC"
  "$ROADMAP_DOC"
  "$EVIDENCE_DOC"
  "$INVENTORY_DOC"
  "$REPO_SCRIPT"
)

allowed_paths=(
  "FORGE_MASTER_BUILD_TREE.md"
  "docs/architecture/source-truth/FORGE_UNIFIED_BUILD_TREE_001.md"
  "docs/roadmap/FORGE_ROADMAP_LOCK_001.md"
  "$SOURCE_DOC"
  "$BOUNDARY_DOC"
  "$ROADMAP_DOC"
  "$EVIDENCE_DOC"
  "$INVENTORY_DOC"
  "$REPO_SCRIPT"
)

say_stage "STAGE 0 HEADER"
echo "PHASE=$PHASE"
echo "MODE=docs/source-truth real engine candidate inventory and selection"
echo "BOUNDARY=no static preview mutation; no CSS/JS mutation; no CRM; no calendar; no send; no runtime/network/storage; no real engine execution"
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
rollback_script="$backup_dir/rollback-060b.sh"
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
restore_or_archive() {
  src="\$1"
  dst="\$2"
  if [ -f "\$src" ]; then
    mkdir -p "\$(dirname "\$dst")"
    cp "\$src" "\$dst"
  elif [ -e "\$dst" ]; then
    archive="\$dst.rollback-060b-removed-\$(date +%Y%m%d_%H%M%S)"
    mv "\$dst" "\$archive"
    echo "Archived rollback-created file: \$archive"
  fi
}
restore_or_archive "$backup_dir/FORGE_MASTER_BUILD_TREE.md" "FORGE_MASTER_BUILD_TREE.md"
restore_or_archive "$backup_dir/docs/architecture/source-truth/FORGE_UNIFIED_BUILD_TREE_001.md" "docs/architecture/source-truth/FORGE_UNIFIED_BUILD_TREE_001.md"
restore_or_archive "$backup_dir/docs/roadmap/FORGE_ROADMAP_LOCK_001.md" "docs/roadmap/FORGE_ROADMAP_LOCK_001.md"
restore_or_archive "$backup_dir/$SOURCE_DOC" "$SOURCE_DOC"
restore_or_archive "$backup_dir/$BOUNDARY_DOC" "$BOUNDARY_DOC"
restore_or_archive "$backup_dir/$ROADMAP_DOC" "$ROADMAP_DOC"
restore_or_archive "$backup_dir/$EVIDENCE_DOC" "$EVIDENCE_DOC"
restore_or_archive "$backup_dir/$INVENTORY_DOC" "$INVENTORY_DOC"
restore_or_archive "$backup_dir/$REPO_SCRIPT" "$REPO_SCRIPT"
echo "Rollback 060B complete."
EOF_ROLLBACK
chmod +x "$rollback_script"
pass "rollback script created: $rollback_script"

say_stage "STAGE 4 APPLY CHANGES"
mkdir -p docs/architecture/source-truth docs/design/forge-ui docs/roadmap docs/evidence tools/termux
cp "$0" "$REPO_SCRIPT"
chmod +x "$REPO_SCRIPT"
pass "copied runner into tools/termux"

{
  echo "# Forge Real Engine Candidate Inventory 060B"
  echo
  echo "Generated: $(date)"
  echo
  echo "## Search Notes"
  echo
  echo "This is a read-only repo inventory used to select the safest first real-engine reconnect candidate."
  echo
  echo "## Candidate Mentions"
  echo
  rg -n --ignore-case "read model|read-model|report|adapter|engine|follow|quote|client|message draft|dry run|dry-run|provider|connector" docs/architecture/source-truth docs/design docs/roadmap FORGE_MASTER_BUILD_TREE.md 2>/dev/null || true
} > "$INVENTORY_DOC"
pass "wrote inventory doc"

python3 - <<'PY'
from pathlib import Path

Path("docs/architecture/source-truth/FORGE_REAL_ENGINE_CANDIDATE_INVENTORY_AND_SELECTION_060B.md").write_text("""# Forge Real Engine Candidate Inventory And Selection 060B

Status: SELECTED

Decision token:
DECISION=PASS_060B_REAL_ENGINE_CANDIDATE_INVENTORY_AND_SELECTION

Next:
NEXT=060C_SELECTED_ENGINE_DRY_RUN_ADAPTER_SCOPE

## Human Summary

Forge inspected the safest direction for reconnecting a real motor.

The selected first target is not messaging, CRM, calendar, or quote execution.
The selected target is a report/read-model preview path because it is useful and has the lowest operational risk.

## Selected Candidate

Selected candidate:

`report.open.preview -> static.report_read -> selected.report_read_model_preview`

## Why This Candidate Wins

| Criterion | Result |
| --- | --- |
| Read-only potential | Strong |
| Commercial usefulness | Medium-high |
| Operational risk | Low |
| Blast radius | Low |
| Human approval compatibility | Strong |
| Reversible | Strong |
| Existing source-truth alignment | Strong |

## Rejected For First Reconnect

| Candidate | Reason |
| --- | --- |
| Message draft adapter | Useful but closer to send workflows. Later. |
| CRM write adapter | Too risky for first reconnect. |
| Calendar adapter | Too risky for first reconnect. |
| Quote execution adapter | Product assumptions and compliance need more care. |
| Client provider lookup | Useful, but live data reads need a separate privacy boundary. |

## Boundary For 060C

060C may scope a selected dry-run adapter around report/read-model preview.

060C must not:

- connect live providers;
- execute real engines;
- send messages;
- write CRM;
- create calendar events;
- mutate browser storage;
- create production, compensation, payout, or business truth.

## Final Decision

DECISION=PASS_060B_REAL_ENGINE_CANDIDATE_INVENTORY_AND_SELECTION

NEXT=060C_SELECTED_ENGINE_DRY_RUN_ADAPTER_SCOPE
""")

Path("docs/design/forge-ui/FORGE_SELECTED_ENGINE_CANDIDATE_BOUNDARY_060B.md").write_text("""# Forge Selected Engine Candidate Boundary 060B

Status: SELECTED

Decision token:
DECISION=FORGE_SELECTED_ENGINE_CANDIDATE_BOUNDARY_060B

Next:
NEXT=060C_SELECTED_ENGINE_DRY_RUN_ADAPTER_SCOPE

## UI Candidate

The selected UI action is:

`report.open.preview`

The UI should continue to label this as:

- Abrir preview
- Ver reporte
- Preparar reporte
- Revisar

The UI must not label this as:

- Ejecutar reporte oficial
- Guardar verdad
- Actualizar CRM
- Enviar

## Selected Adapter Candidate

`selected.report_read_model_preview`

## Output Expectation

The next adapter scope should output a preview payload with:

- report title;
- visible assumptions;
- static evidence reference;
- no live provider claim;
- no business truth creation;
- human review reminder.

## Final Decision

DECISION=FORGE_SELECTED_ENGINE_CANDIDATE_BOUNDARY_060B

NEXT=060C_SELECTED_ENGINE_DRY_RUN_ADAPTER_SCOPE
""")

Path("docs/roadmap/FORGE_SELECTED_ENGINE_DRY_RUN_ADAPTER_ROADMAP_060B.md").write_text("""# Forge Selected Engine Dry Run Adapter Roadmap 060B

Status: ROADMAP

Decision token:
DECISION=FORGE_SELECTED_ENGINE_DRY_RUN_ADAPTER_ROADMAP_060B

Next:
NEXT=060C_SELECTED_ENGINE_DRY_RUN_ADAPTER_SCOPE

## Sequence

### 060B_REAL_ENGINE_CANDIDATE_INVENTORY_AND_SELECTION

Select `report.open.preview` as the first candidate.

### 060C_SELECTED_ENGINE_DRY_RUN_ADAPTER_SCOPE

Scope selected report/read-model dry-run adapter.

### 060D_SELECTED_ENGINE_DRY_RUN_IMPLEMENTATION

Implement selected dry-run adapter.

### 060E_SELECTED_ENGINE_DRY_RUN_QA_LOCK

Lock evidence for selected dry-run candidate.

## Final Decision

DECISION=FORGE_SELECTED_ENGINE_DRY_RUN_ADAPTER_ROADMAP_060B

NEXT=060C_SELECTED_ENGINE_DRY_RUN_ADAPTER_SCOPE
""")
PY
pass "wrote 060B selection docs"

say_stage "STAGE 5 WRITE DOCS / EVIDENCE"
cat > "$EVIDENCE_DOC" <<'EOF_EVIDENCE'
# Forge Real Engine Candidate Inventory And Selection 060B Evidence

Status: SELECTED

Decision token:
DECISION=PASS_060B_REAL_ENGINE_CANDIDATE_INVENTORY_AND_SELECTION

Next:
NEXT=060C_SELECTED_ENGINE_DRY_RUN_ADAPTER_SCOPE

## Human Summary

Forge chose the safest first candidate for real-engine reconnect work:

`report.open.preview`

That means the first target is a report/read-model preview, not message send, CRM, calendar, or quote execution.

## Evidence Files

- `docs/evidence/forge-real-engine-candidate-inventory-060b.md`
- `docs/architecture/source-truth/FORGE_REAL_ENGINE_CANDIDATE_INVENTORY_AND_SELECTION_060B.md`
- `docs/design/forge-ui/FORGE_SELECTED_ENGINE_CANDIDATE_BOUNDARY_060B.md`
- `docs/roadmap/FORGE_SELECTED_ENGINE_DRY_RUN_ADAPTER_ROADMAP_060B.md`

## Final Decision

DECISION=PASS_060B_REAL_ENGINE_CANDIDATE_INVENTORY_AND_SELECTION

NEXT=060C_SELECTED_ENGINE_DRY_RUN_ADAPTER_SCOPE
EOF_EVIDENCE
pass "wrote evidence doc"

say_stage "STAGE 6 UPDATE BUILD TREE / ROADMAP"
python3 - <<'PY'
from pathlib import Path

block = """
<!-- BEGIN FORGEOS:REAL_ENGINE_CANDIDATE_SELECTION_060B -->

## 060B Real Engine Candidate Inventory And Selection

Status: SELECTED

Current lane:

- `060A_REAL_ENGINE_RECONNECT_BOUNDARY_DECISION`: COMPLETE
- `060B_REAL_ENGINE_CANDIDATE_INVENTORY_AND_SELECTION`: COMPLETE
- `060C_SELECTED_ENGINE_DRY_RUN_ADAPTER_SCOPE`: NEXT

Selected first candidate:

`report.open.preview -> selected.report_read_model_preview`

Decision:

DECISION=PASS_060B_REAL_ENGINE_CANDIDATE_INVENTORY_AND_SELECTION

NEXT=060C_SELECTED_ENGINE_DRY_RUN_ADAPTER_SCOPE

<!-- END FORGEOS:REAL_ENGINE_CANDIDATE_SELECTION_060B -->
"""

for name in [
    "FORGE_MASTER_BUILD_TREE.md",
    "docs/architecture/source-truth/FORGE_UNIFIED_BUILD_TREE_001.md",
    "docs/roadmap/FORGE_ROADMAP_LOCK_001.md",
]:
    path = Path(name)
    text = path.read_text()
    if "FORGEOS:REAL_ENGINE_CANDIDATE_SELECTION_060B" not in text:
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
    "docs/architecture/source-truth/FORGE_REAL_ENGINE_CANDIDATE_INVENTORY_AND_SELECTION_060B.md",
    "docs/design/forge-ui/FORGE_SELECTED_ENGINE_CANDIDATE_BOUNDARY_060B.md",
    "docs/roadmap/FORGE_SELECTED_ENGINE_DRY_RUN_ADAPTER_ROADMAP_060B.md",
    "docs/evidence/FORGE_REAL_ENGINE_CANDIDATE_INVENTORY_AND_SELECTION_060B.md",
    "docs/evidence/forge-real-engine-candidate-inventory-060b.md",
    "tools/termux/forge_060b_real_engine_candidate_inventory_and_selection.sh",
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
warn "No JS files touched; node --check not required"
warn "No package test suite required for docs-only 060B selection"
run_cmd rg -n "DECISION=PASS_060B_REAL_ENGINE_CANDIDATE_INVENTORY_AND_SELECTION|NEXT=060C_SELECTED_ENGINE_DRY_RUN_ADAPTER_SCOPE|report.open.preview|selected.report_read_model_preview" "$SOURCE_DOC" "$BOUNDARY_DOC" "$ROADMAP_DOC" "$EVIDENCE_DOC" "FORGE_MASTER_BUILD_TREE.md" "docs/architecture/source-truth/FORGE_UNIFIED_BUILD_TREE_001.md" "docs/roadmap/FORGE_ROADMAP_LOCK_001.md"
run_cmd git diff --check

say_stage "STAGE 9 SAFETY SCAN"
scan_files=(
  "$SOURCE_DOC"
  "$BOUNDARY_DOC"
  "$ROADMAP_DOC"
  "$EVIDENCE_DOC"
  "$INVENTORY_DOC"
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
warn "No screenshot evidence required for docs-only 060B selection"

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
run_cmd git commit -m "docs: select first real engine candidate"
run_cmd git push origin HEAD:main

say_stage "STAGE 13 FINAL CHECKPOINT"
run_cmd git status --short --branch
run_cmd git log --oneline -10

say_stage "FINAL DECISION"
echo "PASS_${PHASE}_COMMIT_PUSH_COMPLETE"
echo "NEXT=060C_SELECTED_ENGINE_DRY_RUN_ADAPTER_SCOPE"
echo "BACKUP=$backup_dir"
echo "ROLLBACK=$rollback_script"
echo "Reporte: $REPORT"
autocopy_report
