#!/usr/bin/env bash
set -euo pipefail

PHASE="060H_SELECTED_LOCAL_READ_MODEL_SOURCE_ADAPTER_SCOPE"
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

phase_slug="060h-selected-local-read-model-source-adapter-scope"
backup_dir=""
rollback_script=""

SELECTED_SOURCE="docs/evidence/forge-selected-engine-dry-run-audit-060e.json"
SOURCE_DOC="docs/architecture/source-truth/FORGE_SELECTED_LOCAL_READ_MODEL_SOURCE_ADAPTER_SCOPE_060H.md"
CONTRACT_DOC="docs/design/forge-ui/FORGE_LOCAL_READ_MODEL_SOURCE_ADAPTER_CONTRACT_060H.md"
ROADMAP_DOC="docs/roadmap/FORGE_LOCAL_READ_MODEL_SOURCE_ADAPTER_IMPLEMENTATION_ROADMAP_060H.md"
EVIDENCE_DOC="docs/evidence/FORGE_SELECTED_LOCAL_READ_MODEL_SOURCE_ADAPTER_SCOPE_060H.md"
CERT_DOC="docs/evidence/FORGE_SELECTED_LOCAL_READ_MODEL_SOURCE_ADAPTER_SCOPE_CERTIFICATE_060H.md"
REPO_SCRIPT="tools/termux/forge_060h_selected_local_read_model_source_adapter_scope.sh"

existing_required=(
  "FORGE_MASTER_BUILD_TREE.md"
  "docs/architecture/source-truth/FORGE_UNIFIED_BUILD_TREE_001.md"
  "docs/roadmap/FORGE_ROADMAP_LOCK_001.md"
  "docs/architecture/source-truth/FORGE_REAL_READ_MODEL_SOURCE_INVENTORY_AND_SELECTION_060G.md"
  "docs/design/forge-ui/FORGE_SELECTED_LOCAL_READ_MODEL_SOURCE_060G.md"
  "docs/evidence/FORGE_REAL_READ_MODEL_SOURCE_INVENTORY_AND_SELECTION_060G.md"
  "$SELECTED_SOURCE"
  "docs/static-preview/forge-alive/shared/forge-report-read-model-dry-run-adapter-060d.js"
)

created_or_replaced=(
  "$SOURCE_DOC"
  "$CONTRACT_DOC"
  "$ROADMAP_DOC"
  "$EVIDENCE_DOC"
  "$CERT_DOC"
  "$REPO_SCRIPT"
)

allowed_paths=(
  "FORGE_MASTER_BUILD_TREE.md"
  "docs/architecture/source-truth/FORGE_UNIFIED_BUILD_TREE_001.md"
  "docs/roadmap/FORGE_ROADMAP_LOCK_001.md"
  "$SOURCE_DOC"
  "$CONTRACT_DOC"
  "$ROADMAP_DOC"
  "$EVIDENCE_DOC"
  "$CERT_DOC"
  "$REPO_SCRIPT"
)

say_stage "STAGE 0 HEADER"
echo "PHASE=$PHASE"
echo "MODE=docs/source-truth selected local read-model source adapter scope"
echo "BOUNDARY=no static preview mutation; no CSS/JS mutation; no CRM; no calendar; no send; no runtime/network/storage; no provider execution; no real engine execution"
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
rollback_script="$backup_dir/rollback-060h.sh"
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
    archive="\$dst.rollback-060h-removed-\$(date +%Y%m%d_%H%M%S)"
    mv "\$dst" "\$archive"
    echo "Archived rollback-created file: \$archive"
  fi
}
restore_or_archive "$backup_dir/FORGE_MASTER_BUILD_TREE.md" "FORGE_MASTER_BUILD_TREE.md"
restore_or_archive "$backup_dir/docs/architecture/source-truth/FORGE_UNIFIED_BUILD_TREE_001.md" "docs/architecture/source-truth/FORGE_UNIFIED_BUILD_TREE_001.md"
restore_or_archive "$backup_dir/docs/roadmap/FORGE_ROADMAP_LOCK_001.md" "docs/roadmap/FORGE_ROADMAP_LOCK_001.md"
restore_or_archive "$backup_dir/$SOURCE_DOC" "$SOURCE_DOC"
restore_or_archive "$backup_dir/$CONTRACT_DOC" "$CONTRACT_DOC"
restore_or_archive "$backup_dir/$ROADMAP_DOC" "$ROADMAP_DOC"
restore_or_archive "$backup_dir/$EVIDENCE_DOC" "$EVIDENCE_DOC"
restore_or_archive "$backup_dir/$CERT_DOC" "$CERT_DOC"
restore_or_archive "$backup_dir/$REPO_SCRIPT" "$REPO_SCRIPT"
echo "Rollback 060H complete."
EOF_ROLLBACK
chmod +x "$rollback_script"
pass "rollback script created: $rollback_script"

say_stage "STAGE 4 APPLY CHANGES"
mkdir -p docs/architecture/source-truth docs/design/forge-ui docs/roadmap docs/evidence tools/termux
cp "$0" "$REPO_SCRIPT"
chmod +x "$REPO_SCRIPT"
pass "copied runner into tools/termux"

python3 - <<'PY'
from pathlib import Path

selected = "docs/evidence/forge-selected-engine-dry-run-audit-060e.json"

Path("docs/architecture/source-truth/FORGE_SELECTED_LOCAL_READ_MODEL_SOURCE_ADAPTER_SCOPE_060H.md").write_text(f"""# Forge Selected Local Read Model Source Adapter Scope 060H

Status: SCOPED

Decision token:
DECISION=PASS_060H_SELECTED_LOCAL_READ_MODEL_SOURCE_ADAPTER_SCOPE

Next:
NEXT=060I_SELECTED_LOCAL_READ_MODEL_SOURCE_ADAPTER_IMPLEMENTATION

## Human Summary

060G selected the local JSON source. 060H defines the adapter contract for reading it safely.

This phase does not implement the adapter. It only defines what 060I may build.

## Selected Source

`{selected}`

## Adapter Name

`local_read_model_source_adapter`

## Adapter Responsibility

The adapter may read the selected committed JSON source and transform its accepted report preview into a local read-model preview.

## Required Inputs

| Field | Requirement |
| --- | --- |
| source path | `{selected}` |
| accepted status | `DRY_RUN_ACCEPTED` |
| action id | `report.open.preview` |
| selected candidate | `selected.report_read_model_preview` |
| preview mode | true |
| human approval | required |

## Required Output

The adapter output must include:

- `sourceType: repo_local_read_model_source`;
- `sourcePath`;
- `readModelStatus`;
- `reportPreview`;
- `previewMode`;
- `requiresHumanApproval`;
- all action permissions false.

## Refusal Rules

| Reason | Meaning |
| --- | --- |
| `SOURCE_NOT_FOUND` | Selected local source is missing. |
| `SOURCE_NOT_JSON` | Selected source is not parseable JSON. |
| `SOURCE_NOT_ACCEPTED` | Source does not contain an accepted dry-run path. |
| `WRONG_ACTION_ID` | Source is not for `report.open.preview`. |
| `MISSING_REPORT_PREVIEW` | Source lacks preview content. |

## 060I Boundary

060I may implement a static local-source adapter that reads the selected committed JSON file at build/runtime preview level.

060I must not:

- connect a live provider;
- mutate the selected JSON;
- write browser storage;
- write CRM;
- create calendar events;
- send messages;
- create source-truth records;
- execute a real engine.

## Final Decision

DECISION=PASS_060H_SELECTED_LOCAL_READ_MODEL_SOURCE_ADAPTER_SCOPE

NEXT=060I_SELECTED_LOCAL_READ_MODEL_SOURCE_ADAPTER_IMPLEMENTATION
""")

Path("docs/design/forge-ui/FORGE_LOCAL_READ_MODEL_SOURCE_ADAPTER_CONTRACT_060H.md").write_text(f"""# Forge Local Read Model Source Adapter Contract 060H

Status: CONTRACT_SCOPED

Decision:
DECISION=FORGE_LOCAL_READ_MODEL_SOURCE_ADAPTER_CONTRACT_060H

Next:
NEXT=060I_SELECTED_LOCAL_READ_MODEL_SOURCE_ADAPTER_IMPLEMENTATION

## Selected Source

`{selected}`

## Contract

`local_read_model_source_adapter` turns the selected audit JSON into a UI-safe report read model.

## Output Shape

| Field | Required Value |
| --- | --- |
| `sourceType` | `repo_local_read_model_source` |
| `sourcePath` | selected source path |
| `readModelStatus` | `LOCAL_READ_MODEL_READY` or `LOCAL_READ_MODEL_REFUSED` |
| `previewMode` | true |
| `requiresHumanApproval` | true |
| `executionAllowed` | false |
| `writesAllowed` | false |
| `sendAllowed` | false |
| `calendarAllowed` | false |
| `crmAllowed` | false |

## UI Language

Allowed:

- Preview local
- Lectura auditada
- Fuente local
- Revisar reporte

Forbidden:

- Fuente viva
- Sincronizado
- Enviado
- Ejecutado

## Final Decision

DECISION=FORGE_LOCAL_READ_MODEL_SOURCE_ADAPTER_CONTRACT_060H

NEXT=060I_SELECTED_LOCAL_READ_MODEL_SOURCE_ADAPTER_IMPLEMENTATION
""")

Path("docs/roadmap/FORGE_LOCAL_READ_MODEL_SOURCE_ADAPTER_IMPLEMENTATION_ROADMAP_060H.md").write_text(f"""# Forge Local Read Model Source Adapter Implementation Roadmap 060H

Status: ROADMAP

Decision:
DECISION=FORGE_LOCAL_READ_MODEL_SOURCE_ADAPTER_IMPLEMENTATION_ROADMAP_060H

Next:
NEXT=060I_SELECTED_LOCAL_READ_MODEL_SOURCE_ADAPTER_IMPLEMENTATION

## Selected Source

`{selected}`

## Sequence

1. 060H scopes adapter contract.
2. 060I implements static local-source adapter.
3. 060J locks local-source adapter evidence.
4. 060K may decide UI binding.

## Boundary

060I remains local, read-only, deterministic, and preview-only.

## Final Decision

DECISION=FORGE_LOCAL_READ_MODEL_SOURCE_ADAPTER_IMPLEMENTATION_ROADMAP_060H

NEXT=060I_SELECTED_LOCAL_READ_MODEL_SOURCE_ADAPTER_IMPLEMENTATION
""")
PY
pass "wrote 060H scope docs"

say_stage "STAGE 5 WRITE DOCS / EVIDENCE"
python3 - <<'PY'
from pathlib import Path

selected = "docs/evidence/forge-selected-engine-dry-run-audit-060e.json"

Path("docs/evidence/FORGE_SELECTED_LOCAL_READ_MODEL_SOURCE_ADAPTER_SCOPE_060H.md").write_text(f"""# Forge Selected Local Read Model Source Adapter Scope 060H

Status: PASS

Decision token:
DECISION=PASS_060H_SELECTED_LOCAL_READ_MODEL_SOURCE_ADAPTER_SCOPE

Next:
NEXT=060I_SELECTED_LOCAL_READ_MODEL_SOURCE_ADAPTER_IMPLEMENTATION

## Evidence

060H scopes a local source adapter for:

`{selected}`

The phase is docs-only and does not mutate static preview runtime.

## Final Decision

DECISION=PASS_060H_SELECTED_LOCAL_READ_MODEL_SOURCE_ADAPTER_SCOPE

NEXT=060I_SELECTED_LOCAL_READ_MODEL_SOURCE_ADAPTER_IMPLEMENTATION
""")

Path("docs/evidence/FORGE_SELECTED_LOCAL_READ_MODEL_SOURCE_ADAPTER_SCOPE_CERTIFICATE_060H.md").write_text("""# Forge Selected Local Read Model Source Adapter Scope Certificate 060H

Certificate: PASS

060H scoped the selected local read-model source adapter without implementation mutation.

DECISION=PASS_060H_SELECTED_LOCAL_READ_MODEL_SOURCE_ADAPTER_SCOPE

NEXT=060I_SELECTED_LOCAL_READ_MODEL_SOURCE_ADAPTER_IMPLEMENTATION
""")
PY
pass "wrote evidence docs"

say_stage "STAGE 6 UPDATE BUILD TREE / ROADMAP"
python3 - <<'PY'
from pathlib import Path

block = """\n<!-- BEGIN FORGEOS:SELECTED_LOCAL_READ_MODEL_SOURCE_ADAPTER_SCOPE_060H -->\n## 060H Selected Local Read Model Source Adapter Scope\n\nStatus: PASS\n\nSelected source:\n`docs/evidence/forge-selected-engine-dry-run-audit-060e.json`\n\n060H scopes a local read-model source adapter contract. No implementation or runtime mutation is introduced.\n\nDECISION=PASS_060H_SELECTED_LOCAL_READ_MODEL_SOURCE_ADAPTER_SCOPE\n\nNEXT=060I_SELECTED_LOCAL_READ_MODEL_SOURCE_ADAPTER_IMPLEMENTATION\n<!-- END FORGEOS:SELECTED_LOCAL_READ_MODEL_SOURCE_ADAPTER_SCOPE_060H -->\n"""

targets = [
    Path("FORGE_MASTER_BUILD_TREE.md"),
    Path("docs/architecture/source-truth/FORGE_UNIFIED_BUILD_TREE_001.md"),
    Path("docs/roadmap/FORGE_ROADMAP_LOCK_001.md"),
]

start = "<!-- BEGIN FORGEOS:SELECTED_LOCAL_READ_MODEL_SOURCE_ADAPTER_SCOPE_060H -->"
end = "<!-- END FORGEOS:SELECTED_LOCAL_READ_MODEL_SOURCE_ADAPTER_SCOPE_060H -->"

for path in targets:
    text = path.read_text()
    if start in text and end in text:
        before = text.split(start)[0]
        after = text.split(end, 1)[1]
        text = before + block.lstrip("\n") + after
    else:
        text = text.rstrip() + "\n\n" + block.lstrip("\n")
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
    "docs/architecture/source-truth/FORGE_SELECTED_LOCAL_READ_MODEL_SOURCE_ADAPTER_SCOPE_060H.md",
    "docs/design/forge-ui/FORGE_LOCAL_READ_MODEL_SOURCE_ADAPTER_CONTRACT_060H.md",
    "docs/roadmap/FORGE_LOCAL_READ_MODEL_SOURCE_ADAPTER_IMPLEMENTATION_ROADMAP_060H.md",
    "docs/evidence/FORGE_SELECTED_LOCAL_READ_MODEL_SOURCE_ADAPTER_SCOPE_060H.md",
    "docs/evidence/FORGE_SELECTED_LOCAL_READ_MODEL_SOURCE_ADAPTER_SCOPE_CERTIFICATE_060H.md",
    "tools/termux/forge_060h_selected_local_read_model_source_adapter_scope.sh",
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
run_cmd python3 -m json.tool "$SELECTED_SOURCE"
warn "No JS files touched; node --check not required"
warn "No package test suite required for docs-only 060H scope"
run_cmd rg -n "DECISION=PASS_060H_SELECTED_LOCAL_READ_MODEL_SOURCE_ADAPTER_SCOPE|NEXT=060I_SELECTED_LOCAL_READ_MODEL_SOURCE_ADAPTER_IMPLEMENTATION|local_read_model_source_adapter|repo_local_read_model_source|LOCAL_READ_MODEL_READY|forge-selected-engine-dry-run-audit-060e.json" "$SOURCE_DOC" "$CONTRACT_DOC" "$ROADMAP_DOC" "$EVIDENCE_DOC" "$CERT_DOC" "FORGE_MASTER_BUILD_TREE.md" "docs/architecture/source-truth/FORGE_UNIFIED_BUILD_TREE_001.md" "docs/roadmap/FORGE_ROADMAP_LOCK_001.md"
run_cmd git diff --check

say_stage "STAGE 9 SAFETY SCAN"
scan_files=(
  "$SOURCE_DOC"
  "$CONTRACT_DOC"
  "$ROADMAP_DOC"
  "$EVIDENCE_DOC"
  "$CERT_DOC"
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
warn "No screenshot evidence required for docs-only 060H scope"

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
run_cmd git commit -m "docs: scope local read model source adapter"
run_cmd git push origin HEAD:main

say_stage "STAGE 13 FINAL CHECKPOINT"
run_cmd git status --short --branch
run_cmd git log --oneline -10

say_stage "FINAL DECISION"
echo "PASS_${PHASE}_COMMIT_PUSH_COMPLETE"
echo "NEXT=060I_SELECTED_LOCAL_READ_MODEL_SOURCE_ADAPTER_IMPLEMENTATION"
echo "BACKUP=$backup_dir"
echo "ROLLBACK=$rollback_script"
echo "Reporte: $REPORT"
autocopy_report
