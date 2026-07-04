#!/usr/bin/env bash
set -euo pipefail

PHASE="060D_SELECTED_ENGINE_DRY_RUN_ADAPTER_IMPLEMENTATION"
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

phase_slug="060d-selected-engine-dry-run-adapter-implementation"
backup_dir=""
rollback_script=""

ADAPTER_JS="docs/static-preview/forge-alive/shared/forge-report-read-model-dry-run-adapter-060d.js"
CLOSURE_DOC="docs/architecture/source-truth/FORGE_SELECTED_ENGINE_DRY_RUN_ADAPTER_IMPLEMENTATION_CLOSURE_060D.md"
EVIDENCE_DOC="docs/evidence/FORGE_SELECTED_ENGINE_DRY_RUN_ADAPTER_IMPLEMENTATION_060D.md"
CERT_DOC="docs/evidence/FORGE_SELECTED_ENGINE_DRY_RUN_ADAPTER_IMPLEMENTATION_CERTIFICATE_060D.md"
REPO_SCRIPT="tools/termux/forge_060d_selected_engine_dry_run_adapter_implementation.sh"

existing_required=(
  "docs/static-preview/forge-alive/index.html"
  "docs/static-preview/forge-alive/shared/forge-static-action-packet-bridge-059b.js"
  "docs/static-preview/forge-alive/shared/forge-static-engine-adapter-dry-run-059e.js"
  "FORGE_MASTER_BUILD_TREE.md"
  "docs/architecture/source-truth/FORGE_UNIFIED_BUILD_TREE_001.md"
  "docs/roadmap/FORGE_ROADMAP_LOCK_001.md"
  "docs/architecture/source-truth/FORGE_SELECTED_ENGINE_DRY_RUN_ADAPTER_SCOPE_060C.md"
  "docs/design/forge-ui/FORGE_REPORT_READ_MODEL_DRY_RUN_ADAPTER_CONTRACT_060C.md"
  "docs/evidence/FORGE_SELECTED_ENGINE_DRY_RUN_ADAPTER_SCOPE_060C.md"
)

created_or_replaced=(
  "$ADAPTER_JS"
  "$CLOSURE_DOC"
  "$EVIDENCE_DOC"
  "$CERT_DOC"
  "$REPO_SCRIPT"
)

allowed_paths=(
  "docs/static-preview/forge-alive/index.html"
  "$ADAPTER_JS"
  "FORGE_MASTER_BUILD_TREE.md"
  "docs/architecture/source-truth/FORGE_UNIFIED_BUILD_TREE_001.md"
  "docs/roadmap/FORGE_ROADMAP_LOCK_001.md"
  "$CLOSURE_DOC"
  "$EVIDENCE_DOC"
  "$CERT_DOC"
  "$REPO_SCRIPT"
)

say_stage "STAGE 0 HEADER"
echo "PHASE=$PHASE"
echo "MODE=scoped static preview selected report read-model dry-run adapter implementation"
echo "BOUNDARY=static preview dry-run only; no CRM; no calendar; no send; no runtime/network/storage; no provider execution; no real engine execution"
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
rollback_script="$backup_dir/rollback-060d.sh"
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
    archive="\$dst.rollback-060d-removed-\$(date +%Y%m%d_%H%M%S)"
    mv "\$dst" "\$archive"
    echo "Archived rollback-created file: \$archive"
  fi
}
restore_or_archive "$backup_dir/docs/static-preview/forge-alive/index.html" "docs/static-preview/forge-alive/index.html"
restore_or_archive "$backup_dir/$ADAPTER_JS" "$ADAPTER_JS"
restore_or_archive "$backup_dir/FORGE_MASTER_BUILD_TREE.md" "FORGE_MASTER_BUILD_TREE.md"
restore_or_archive "$backup_dir/docs/architecture/source-truth/FORGE_UNIFIED_BUILD_TREE_001.md" "docs/architecture/source-truth/FORGE_UNIFIED_BUILD_TREE_001.md"
restore_or_archive "$backup_dir/docs/roadmap/FORGE_ROADMAP_LOCK_001.md" "docs/roadmap/FORGE_ROADMAP_LOCK_001.md"
restore_or_archive "$backup_dir/$CLOSURE_DOC" "$CLOSURE_DOC"
restore_or_archive "$backup_dir/$EVIDENCE_DOC" "$EVIDENCE_DOC"
restore_or_archive "$backup_dir/$CERT_DOC" "$CERT_DOC"
restore_or_archive "$backup_dir/$REPO_SCRIPT" "$REPO_SCRIPT"
echo "Rollback 060D complete."
EOF_ROLLBACK
chmod +x "$rollback_script"
pass "rollback script created: $rollback_script"

say_stage "STAGE 4 APPLY CHANGES"
mkdir -p docs/static-preview/forge-alive/shared docs/architecture/source-truth docs/evidence tools/termux
cp "$0" "$REPO_SCRIPT"
chmod +x "$REPO_SCRIPT"
pass "copied runner into tools/termux"

cat > "$ADAPTER_JS" <<'EOF_JS'
/* FORGEOS:REPORT_READ_MODEL_DRY_RUN_ADAPTER_060D:START */
(function () {
  "use strict";

  var ACTION_ID = "report.open.preview";
  var SELECTED_CANDIDATE = "selected.report_read_model_preview";
  var ADAPTER_CANDIDATE = "report_read_model_dry_run";

  function baseOutput(packet, status) {
    return {
      dryRunStatus: status,
      actionId: packet && packet.actionId ? packet.actionId : "",
      adapterCandidate: ADAPTER_CANDIDATE,
      selectedCandidate: SELECTED_CANDIDATE,
      previewMode: true,
      requiresHumanApproval: true,
      executionAllowed: false,
      writesAllowed: false,
      sendAllowed: false,
      calendarAllowed: false,
      crmAllowed: false,
      evidence: {
        source: "060D static report read-model dry-run adapter",
        decision: status === "DRY_RUN_ACCEPTED" ? "accepted_preview_only" : "refused_preview_only"
      }
    };
  }

  function refusal(packet, reason, message) {
    var output = baseOutput(packet || {}, "DRY_RUN_REFUSED");
    output.refusal = {
      reason: reason,
      message: message
    };
    return output;
  }

  function acceptsSelectedCandidate(packet) {
    if (!packet.selectedCandidate) return true;
    return packet.selectedCandidate === SELECTED_CANDIDATE;
  }

  function buildReportPreview(packet) {
    return {
      title: "Preview de reporte",
      summary: "Lectura segura preparada para revision humana.",
      sourceModule: packet.sourceModule || "reportes",
      sourceSurface: packet.sourceSurface || "desktop.command_workspace",
      rows: [
        { label: "Estado", value: "Preview sin ejecucion" },
        { label: "Motor", value: "Dry-run estatico" },
        { label: "Aprobacion", value: "Humana requerida" }
      ]
    };
  }

  function runDry(packet) {
    if (!packet || typeof packet !== "object") {
      return refusal(packet, "INVALID_PACKET", "A packet object is required.");
    }
    if (packet.actionId !== ACTION_ID) {
      return refusal(packet, "UNKNOWN_ACTION_ID", "Only report.open.preview is accepted.");
    }
    if (packet.previewMode !== true) {
      return refusal(packet, "NOT_PREVIEW_MODE", "Preview mode is required.");
    }
    if (packet.requiresHumanApproval !== true) {
      return refusal(packet, "MISSING_HUMAN_APPROVAL_GATE", "Human approval must remain required.");
    }
    if (!acceptsSelectedCandidate(packet)) {
      return refusal(packet, "WRONG_SELECTED_CANDIDATE", "Selected candidate does not match the report read-model path.");
    }

    var output = baseOutput(packet, "DRY_RUN_ACCEPTED");
    output.reportPreview = buildReportPreview(packet);
    return output;
  }

  function handlePacketEvent(event) {
    var packet = event && event.detail ? event.detail : null;
    var output = runDry(packet);
    window.dispatchEvent(new CustomEvent("forge:report-read-model-dry-run:060d", { detail: output }));
  }

  if (typeof window !== "undefined") {
    window.__forgeRunReportReadModelDryRun060D = runDry;
    window.addEventListener("forge:static-action-packet:059b", handlePacketEvent);
  }
})();
/* FORGEOS:REPORT_READ_MODEL_DRY_RUN_ADAPTER_060D:END */
EOF_JS
pass "wrote $ADAPTER_JS"

python3 - <<'PY'
from pathlib import Path

path = Path("docs/static-preview/forge-alive/index.html")
text = path.read_text()
new_line = '  <script src="./shared/forge-report-read-model-dry-run-adapter-060d.js?v=060d" defer></script>'

if "forge-report-read-model-dry-run-adapter-060d.js" not in text:
    anchor = '  <script src="./shared/forge-static-engine-adapter-dry-run-059e.js?v=059e" defer></script>'
    if anchor not in text:
        raise SystemExit("Missing 059E script anchor in index.html")
    text = text.replace(anchor, anchor + "\n" + new_line)
    path.write_text(text)
PY
pass "patched index load order"

say_stage "STAGE 5 WRITE DOCS / EVIDENCE"
python3 - <<'PY'
from pathlib import Path

Path("docs/architecture/source-truth/FORGE_SELECTED_ENGINE_DRY_RUN_ADAPTER_IMPLEMENTATION_CLOSURE_060D.md").write_text("""# Forge Selected Engine Dry Run Adapter Implementation Closure 060D

Status: IMPLEMENTED

Decision token:
DECISION=PASS_060D_SELECTED_ENGINE_DRY_RUN_ADAPTER_IMPLEMENTATION

Next:
NEXT=060E_SELECTED_ENGINE_DRY_RUN_EVIDENCE_LOCK

## Summary

060D implements the selected report/read-model dry-run adapter in static preview.

The adapter accepts only `report.open.preview` packets, preserves preview mode, requires human approval, and returns action permissions as false.

## Implemented Surface

- `docs/static-preview/forge-alive/shared/forge-report-read-model-dry-run-adapter-060d.js`
- Loaded after the 059E static engine dry-run bridge.

## Output

The adapter emits:

`forge:report-read-model-dry-run:060d`

It also exposes:

`window.__forgeRunReportReadModelDryRun060D`

## Boundary

No live provider, CRM write, calendar create, send action, browser storage write, source-truth mutation, or real engine execution was introduced.

## Final Decision

DECISION=PASS_060D_SELECTED_ENGINE_DRY_RUN_ADAPTER_IMPLEMENTATION

NEXT=060E_SELECTED_ENGINE_DRY_RUN_EVIDENCE_LOCK
""")

Path("docs/evidence/FORGE_SELECTED_ENGINE_DRY_RUN_ADAPTER_IMPLEMENTATION_060D.md").write_text("""# Forge Selected Engine Dry Run Adapter Implementation 060D

Status: PASS

Decision token:
DECISION=PASS_060D_SELECTED_ENGINE_DRY_RUN_ADAPTER_IMPLEMENTATION

Next:
NEXT=060E_SELECTED_ENGINE_DRY_RUN_EVIDENCE_LOCK

## Evidence

060D adds a static report/read-model dry-run adapter for:

`report.open.preview -> selected.report_read_model_preview`

Validation confirms:

- JS syntax passes;
- index load order includes the 060D adapter after 059E;
- accepted and refused dry-run paths are present;
- safety scan remains clean.

## Final Decision

DECISION=PASS_060D_SELECTED_ENGINE_DRY_RUN_ADAPTER_IMPLEMENTATION

NEXT=060E_SELECTED_ENGINE_DRY_RUN_EVIDENCE_LOCK
""")

Path("docs/evidence/FORGE_SELECTED_ENGINE_DRY_RUN_ADAPTER_IMPLEMENTATION_CERTIFICATE_060D.md").write_text("""# Forge Selected Engine Dry Run Adapter Implementation Certificate 060D

Certificate: PASS

060D implements a static preview dry-run adapter for `report.open.preview`.

It does not execute a real engine or perform external actions.

DECISION=PASS_060D_SELECTED_ENGINE_DRY_RUN_ADAPTER_IMPLEMENTATION

NEXT=060E_SELECTED_ENGINE_DRY_RUN_EVIDENCE_LOCK
""")
PY
pass "wrote docs / evidence"

say_stage "STAGE 6 UPDATE BUILD TREE / ROADMAP"
python3 - <<'PY'
from pathlib import Path

block = """\n<!-- BEGIN FORGEOS:SELECTED_ENGINE_DRY_RUN_ADAPTER_IMPLEMENTATION_060D -->\n## 060D Selected Engine Dry Run Adapter Implementation\n\nStatus: PASS\n\nImplemented static preview adapter:\n`report.open.preview -> selected.report_read_model_preview`\n\nThe adapter is dry-run only and preserves action permissions as false.\n\nDECISION=PASS_060D_SELECTED_ENGINE_DRY_RUN_ADAPTER_IMPLEMENTATION\n\nNEXT=060E_SELECTED_ENGINE_DRY_RUN_EVIDENCE_LOCK\n<!-- END FORGEOS:SELECTED_ENGINE_DRY_RUN_ADAPTER_IMPLEMENTATION_060D -->\n"""

targets = [
    Path("FORGE_MASTER_BUILD_TREE.md"),
    Path("docs/architecture/source-truth/FORGE_UNIFIED_BUILD_TREE_001.md"),
    Path("docs/roadmap/FORGE_ROADMAP_LOCK_001.md"),
]

start = "<!-- BEGIN FORGEOS:SELECTED_ENGINE_DRY_RUN_ADAPTER_IMPLEMENTATION_060D -->"
end = "<!-- END FORGEOS:SELECTED_ENGINE_DRY_RUN_ADAPTER_IMPLEMENTATION_060D -->"

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
    "docs/static-preview/forge-alive/index.html",
    "docs/static-preview/forge-alive/shared/forge-report-read-model-dry-run-adapter-060d.js",
    "FORGE_MASTER_BUILD_TREE.md",
    "docs/architecture/source-truth/FORGE_UNIFIED_BUILD_TREE_001.md",
    "docs/roadmap/FORGE_ROADMAP_LOCK_001.md",
    "docs/architecture/source-truth/FORGE_SELECTED_ENGINE_DRY_RUN_ADAPTER_IMPLEMENTATION_CLOSURE_060D.md",
    "docs/evidence/FORGE_SELECTED_ENGINE_DRY_RUN_ADAPTER_IMPLEMENTATION_060D.md",
    "docs/evidence/FORGE_SELECTED_ENGINE_DRY_RUN_ADAPTER_IMPLEMENTATION_CERTIFICATE_060D.md",
    "tools/termux/forge_060d_selected_engine_dry_run_adapter_implementation.sh",
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
run_cmd node --check "$ADAPTER_JS"
warn "No package test suite required for scoped static preview adapter"
run_cmd rg -n "FORGEOS:REPORT_READ_MODEL_DRY_RUN_ADAPTER_060D|DRY_RUN_ACCEPTED|DRY_RUN_REFUSED|report.open.preview|selected.report_read_model_preview|executionAllowed|forge:report-read-model-dry-run:060d|__forgeRunReportReadModelDryRun060D" "$ADAPTER_JS"
run_cmd rg -n "forge-report-read-model-dry-run-adapter-060d.js" docs/static-preview/forge-alive/index.html
run_cmd rg -n "DECISION=PASS_060D_SELECTED_ENGINE_DRY_RUN_ADAPTER_IMPLEMENTATION|NEXT=060E_SELECTED_ENGINE_DRY_RUN_EVIDENCE_LOCK" "$CLOSURE_DOC" "$EVIDENCE_DOC" "$CERT_DOC" "FORGE_MASTER_BUILD_TREE.md" "docs/architecture/source-truth/FORGE_UNIFIED_BUILD_TREE_001.md" "docs/roadmap/FORGE_ROADMAP_LOCK_001.md"
run_cmd git diff --check

say_stage "STAGE 9 SAFETY SCAN"
scan_files=(
  "docs/static-preview/forge-alive/index.html"
  "$ADAPTER_JS"
  "$CLOSURE_DOC"
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
warn "No screenshot evidence required for 060D implementation; 060E will lock packet/evidence output"

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
run_cmd git commit -m "feat: add selected engine dry run adapter"
run_cmd git push origin HEAD:main

say_stage "STAGE 13 FINAL CHECKPOINT"
run_cmd git status --short --branch
run_cmd git log --oneline -10

say_stage "FINAL DECISION"
echo "PASS_${PHASE}_COMMIT_PUSH_COMPLETE"
echo "NEXT=060E_SELECTED_ENGINE_DRY_RUN_EVIDENCE_LOCK"
echo "BACKUP=$backup_dir"
echo "ROLLBACK=$rollback_script"
echo "Reporte: $REPORT"
autocopy_report
