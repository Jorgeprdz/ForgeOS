#!/usr/bin/env bash
set -euo pipefail

PHASE="060C_SELECTED_ENGINE_DRY_RUN_ADAPTER_SCOPE"
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

phase_slug="060c-selected-engine-dry-run-adapter-scope"
backup_dir=""
rollback_script=""

SOURCE_DOC="docs/architecture/source-truth/FORGE_SELECTED_ENGINE_DRY_RUN_ADAPTER_SCOPE_060C.md"
CONTRACT_DOC="docs/design/forge-ui/FORGE_REPORT_READ_MODEL_DRY_RUN_ADAPTER_CONTRACT_060C.md"
ROADMAP_DOC="docs/roadmap/FORGE_SELECTED_ENGINE_DRY_RUN_ADAPTER_ROADMAP_060C.md"
EVIDENCE_DOC="docs/evidence/FORGE_SELECTED_ENGINE_DRY_RUN_ADAPTER_SCOPE_060C.md"
CERT_DOC="docs/evidence/FORGE_SELECTED_ENGINE_DRY_RUN_ADAPTER_SCOPE_CERTIFICATE_060C.md"
REPO_SCRIPT="tools/termux/forge_060c_selected_engine_dry_run_adapter_scope.sh"

existing_required=(
  "FORGE_MASTER_BUILD_TREE.md"
  "docs/architecture/source-truth/FORGE_UNIFIED_BUILD_TREE_001.md"
  "docs/roadmap/FORGE_ROADMAP_LOCK_001.md"
  "docs/architecture/source-truth/FORGE_REAL_ENGINE_CANDIDATE_INVENTORY_AND_SELECTION_060B.md"
  "docs/design/forge-ui/FORGE_SELECTED_ENGINE_CANDIDATE_BOUNDARY_060B.md"
  "docs/roadmap/FORGE_SELECTED_ENGINE_DRY_RUN_ADAPTER_ROADMAP_060B.md"
  "docs/evidence/FORGE_REAL_ENGINE_CANDIDATE_INVENTORY_AND_SELECTION_060B.md"
  "docs/design/forge-ui/FORGE_ENGINE_DRY_RUN_PACKET_CONTRACT_059D.md"
  "docs/static-preview/forge-alive/shared/forge-static-engine-adapter-dry-run-059e.js"
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
echo "MODE=docs/source-truth selected report read-model dry-run adapter scope"
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
rollback_script="$backup_dir/rollback-060c.sh"
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
    archive="\$dst.rollback-060c-removed-\$(date +%Y%m%d_%H%M%S)"
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
echo "Rollback 060C complete."
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

Path("docs/architecture/source-truth/FORGE_SELECTED_ENGINE_DRY_RUN_ADAPTER_SCOPE_060C.md").write_text("""# Forge Selected Engine Dry Run Adapter Scope 060C

Status: SCOPED

Decision token:
DECISION=PASS_060C_SELECTED_ENGINE_DRY_RUN_ADAPTER_SCOPE

Next:
NEXT=060D_SELECTED_ENGINE_DRY_RUN_ADAPTER_IMPLEMENTATION

## Human Summary

Forge now knows which real-engine path should be tested first: report/read-model preview.

060C defines the adapter contract for that selected path. It still does not connect a real provider or execute a real engine.

## Selected Adapter

| Field | Value |
| --- | --- |
| UI action id | `report.open.preview` |
| Selected candidate | `selected.report_read_model_preview` |
| Adapter kind | `report_read_model_dry_run` |
| Output type | preview report read model |
| Execution status | dry-run only |

## Accepted Input

The adapter may accept a static action packet when:

- `actionId` is `report.open.preview`;
- `previewMode` is true;
- `requiresHumanApproval` is true;
- source surface is desktop command workspace or a future approved report surface;
- selected candidate is `selected.report_read_model_preview`.

## Required Output

The dry-run adapter output must include:

- `dryRunStatus`;
- `adapterCandidate`;
- `selectedCandidate`;
- `previewMode`;
- `requiresHumanApproval`;
- `executionAllowed: false`;
- `writesAllowed: false`;
- `sendAllowed: false`;
- `calendarAllowed: false`;
- `crmAllowed: false`;
- an evidence summary suitable for UI preview.

## Refusal Rules

The adapter must refuse:

| Reason | Meaning |
| --- | --- |
| `UNKNOWN_ACTION_ID` | Action id is not `report.open.preview`. |
| `MISSING_HUMAN_APPROVAL_GATE` | Packet does not preserve approval requirement. |
| `NOT_PREVIEW_MODE` | Packet is not preview-only. |
| `WRONG_SELECTED_CANDIDATE` | Candidate is not the selected report read model path. |

## Implementation Boundary For 060D

060D may implement a static dry-run adapter for `report.open.preview`.

060D must not:

- call live providers;
- fetch remote data;
- write browser storage;
- create source-truth records;
- send messages;
- write CRM;
- create calendar events;
- execute a real engine.

## Final Decision

DECISION=PASS_060C_SELECTED_ENGINE_DRY_RUN_ADAPTER_SCOPE

NEXT=060D_SELECTED_ENGINE_DRY_RUN_ADAPTER_IMPLEMENTATION
""")

Path("docs/design/forge-ui/FORGE_REPORT_READ_MODEL_DRY_RUN_ADAPTER_CONTRACT_060C.md").write_text("""# Forge Report Read Model Dry Run Adapter Contract 060C

Status: CONTRACT_SCOPED

Decision:
DECISION=FORGE_REPORT_READ_MODEL_DRY_RUN_ADAPTER_CONTRACT_060C

Next:
NEXT=060D_SELECTED_ENGINE_DRY_RUN_ADAPTER_IMPLEMENTATION

## Contract

The first selected engine adapter is a report/read-model preview adapter.

It is a bridge from:

`report.open.preview`

to:

`selected.report_read_model_preview`

## Input Shape

| Field | Required Value |
| --- | --- |
| `packetVersion` | `059B.static.preview` or successor |
| `actionId` | `report.open.preview` |
| `previewMode` | true |
| `requiresHumanApproval` | true |
| `selectedCandidate` | `selected.report_read_model_preview` |

## Output Shape

| Field | Required Value |
| --- | --- |
| `dryRunStatus` | `DRY_RUN_ACCEPTED` or `DRY_RUN_REFUSED` |
| `adapterCandidate` | `report_read_model_dry_run` |
| `selectedCandidate` | `selected.report_read_model_preview` |
| `previewMode` | true |
| `requiresHumanApproval` | true |
| `executionAllowed` | false |
| `writesAllowed` | false |
| `sendAllowed` | false |
| `calendarAllowed` | false |
| `crmAllowed` | false |

## UI Language

Allowed labels:

- Preparar reporte
- Ver preview
- Revisar lectura
- Preview seguro

Forbidden labels:

- Enviar
- Guardar en CRM
- Crear evento
- Ejecutar motor
- Aprobar automaticamente

## Final Decision

DECISION=FORGE_REPORT_READ_MODEL_DRY_RUN_ADAPTER_CONTRACT_060C

NEXT=060D_SELECTED_ENGINE_DRY_RUN_ADAPTER_IMPLEMENTATION
""")

Path("docs/roadmap/FORGE_SELECTED_ENGINE_DRY_RUN_ADAPTER_ROADMAP_060C.md").write_text("""# Forge Selected Engine Dry Run Adapter Roadmap 060C

Status: ROADMAP

Decision:
DECISION=FORGE_SELECTED_ENGINE_DRY_RUN_ADAPTER_ROADMAP_060C

Next:
NEXT=060D_SELECTED_ENGINE_DRY_RUN_ADAPTER_IMPLEMENTATION

## Sequence

1. 060C scopes selected report/read-model adapter contract.
2. 060D implements static dry-run adapter for the selected report path.
3. 060E locks packet and refusal evidence.
4. 060F may decide whether a real read-model source can be connected.

## Boundary

060D must remain static preview dry-run only.

No real provider, no network, no CRM, no calendar, no send, no source-truth mutation, and no real engine execution.

## Final Decision

DECISION=FORGE_SELECTED_ENGINE_DRY_RUN_ADAPTER_ROADMAP_060C

NEXT=060D_SELECTED_ENGINE_DRY_RUN_ADAPTER_IMPLEMENTATION
""")
PY
pass "wrote 060C scope docs"

say_stage "STAGE 5 WRITE DOCS / EVIDENCE"
python3 - <<'PY'
from pathlib import Path

Path("docs/evidence/FORGE_SELECTED_ENGINE_DRY_RUN_ADAPTER_SCOPE_060C.md").write_text("""# Forge Selected Engine Dry Run Adapter Scope 060C

Status: PASS

Decision token:
DECISION=PASS_060C_SELECTED_ENGINE_DRY_RUN_ADAPTER_SCOPE

Next:
NEXT=060D_SELECTED_ENGINE_DRY_RUN_ADAPTER_IMPLEMENTATION

## Evidence

060C documents the selected first engine dry-run adapter path:

`report.open.preview -> selected.report_read_model_preview`

The phase is docs-only. No static preview HTML, CSS, JS, provider runtime, CRM, calendar, send, browser storage, source-truth mutation, or real engine execution was introduced.

## Validation Expected

- Source-truth scope exists.
- UI contract exists.
- Roadmap handoff exists.
- Build tree and roadmap contain the 060C decision block.
- Safety scan remains clean.

## Final Decision

DECISION=PASS_060C_SELECTED_ENGINE_DRY_RUN_ADAPTER_SCOPE

NEXT=060D_SELECTED_ENGINE_DRY_RUN_ADAPTER_IMPLEMENTATION
""")

Path("docs/evidence/FORGE_SELECTED_ENGINE_DRY_RUN_ADAPTER_SCOPE_CERTIFICATE_060C.md").write_text("""# Forge Selected Engine Dry Run Adapter Scope Certificate 060C

Certificate: PASS

060C scoped the selected report/read-model dry-run adapter without implementation mutation.

DECISION=PASS_060C_SELECTED_ENGINE_DRY_RUN_ADAPTER_SCOPE

NEXT=060D_SELECTED_ENGINE_DRY_RUN_ADAPTER_IMPLEMENTATION
""")
PY
pass "wrote evidence docs"

say_stage "STAGE 6 UPDATE BUILD TREE / ROADMAP"
python3 - <<'PY'
from pathlib import Path

block = """\n<!-- BEGIN FORGEOS:SELECTED_ENGINE_DRY_RUN_ADAPTER_SCOPE_060C -->\n## 060C Selected Engine Dry Run Adapter Scope\n\nStatus: PASS\n\nSelected path:\n`report.open.preview -> selected.report_read_model_preview`\n\n060C scopes the dry-run adapter contract for the selected report/read-model path. It remains docs-only and does not connect a real engine.\n\nDECISION=PASS_060C_SELECTED_ENGINE_DRY_RUN_ADAPTER_SCOPE\n\nNEXT=060D_SELECTED_ENGINE_DRY_RUN_ADAPTER_IMPLEMENTATION\n<!-- END FORGEOS:SELECTED_ENGINE_DRY_RUN_ADAPTER_SCOPE_060C -->\n"""

targets = [
    Path("FORGE_MASTER_BUILD_TREE.md"),
    Path("docs/architecture/source-truth/FORGE_UNIFIED_BUILD_TREE_001.md"),
    Path("docs/roadmap/FORGE_ROADMAP_LOCK_001.md"),
]

start = "<!-- BEGIN FORGEOS:SELECTED_ENGINE_DRY_RUN_ADAPTER_SCOPE_060C -->"
end = "<!-- END FORGEOS:SELECTED_ENGINE_DRY_RUN_ADAPTER_SCOPE_060C -->"

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
    "docs/architecture/source-truth/FORGE_SELECTED_ENGINE_DRY_RUN_ADAPTER_SCOPE_060C.md",
    "docs/design/forge-ui/FORGE_REPORT_READ_MODEL_DRY_RUN_ADAPTER_CONTRACT_060C.md",
    "docs/roadmap/FORGE_SELECTED_ENGINE_DRY_RUN_ADAPTER_ROADMAP_060C.md",
    "docs/evidence/FORGE_SELECTED_ENGINE_DRY_RUN_ADAPTER_SCOPE_060C.md",
    "docs/evidence/FORGE_SELECTED_ENGINE_DRY_RUN_ADAPTER_SCOPE_CERTIFICATE_060C.md",
    "tools/termux/forge_060c_selected_engine_dry_run_adapter_scope.sh",
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
warn "No package test suite required for docs-only 060C scope"
run_cmd rg -n "DECISION=PASS_060C_SELECTED_ENGINE_DRY_RUN_ADAPTER_SCOPE|NEXT=060D_SELECTED_ENGINE_DRY_RUN_ADAPTER_IMPLEMENTATION|report.open.preview|selected.report_read_model_preview|report_read_model_dry_run" "$SOURCE_DOC" "$CONTRACT_DOC" "$ROADMAP_DOC" "$EVIDENCE_DOC" "$CERT_DOC" "FORGE_MASTER_BUILD_TREE.md" "docs/architecture/source-truth/FORGE_UNIFIED_BUILD_TREE_001.md" "docs/roadmap/FORGE_ROADMAP_LOCK_001.md"
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
warn "No screenshot evidence required for docs-only 060C scope"

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
run_cmd git commit -m "docs: scope selected engine dry run adapter"
run_cmd git push origin HEAD:main

say_stage "STAGE 13 FINAL CHECKPOINT"
run_cmd git status --short --branch
run_cmd git log --oneline -10

say_stage "FINAL DECISION"
echo "PASS_${PHASE}_COMMIT_PUSH_COMPLETE"
echo "NEXT=060D_SELECTED_ENGINE_DRY_RUN_ADAPTER_IMPLEMENTATION"
echo "BACKUP=$backup_dir"
echo "ROLLBACK=$rollback_script"
echo "Reporte: $REPORT"
autocopy_report
