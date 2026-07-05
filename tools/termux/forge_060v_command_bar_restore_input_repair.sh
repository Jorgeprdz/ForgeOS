#!/usr/bin/env bash
set -euo pipefail

PHASE="060V_COMMAND_BAR_RESTORE_INPUT_REPAIR_IMPLEMENTATION"
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
  if command -v termux-clipboard-set >/dev/null 2>&1; then
    termux-clipboard-set < "$REPORT" || true
    pass "report copied to clipboard"
  else
    warn "termux-clipboard-set not available; report left at $REPORT"
  fi
}

hold() {
  printf "${YELLOW}HOLD:${RESET} %s\n" "$1"
  autocopy_report
  exit 1
}

fail() {
  printf "${RED}FAIL:${RESET} %s\n" "$1"
  autocopy_report
  exit 1
}

run_cmd() {
  printf "\n========== RUN ==========\n"
  printf "%s " "$@"
  printf "\n"
  "$@"
}

require_file() {
  local file="$1"
  if [[ -f "$file" ]]; then
    pass "$file"
  else
    fail "missing required file: $file"
  fi
}

backup_file() {
  local file="$1"
  local dest="$BACKUP_DIR/$file"
  mkdir -p "$(dirname "$dest")"
  cp "$file" "$dest"
  pass "backup $file"
}

normalize_file() {
  local file="$1"
  python3 - "$file" <<'PY'
from pathlib import Path
import sys

path = Path(sys.argv[1])
text = path.read_text()
path.write_text("\n".join(line.rstrip() for line in text.splitlines()) + "\n")
PY
}

append_sync_block() {
  local file="$1"
  local start="$2"
  local end="$3"
  local body="$4"
  python3 - "$file" "$start" "$end" "$body" <<'PY'
from pathlib import Path
import sys

path = Path(sys.argv[1])
start = sys.argv[2]
end = sys.argv[3]
body = sys.argv[4]
text = path.read_text()
block = f"{start}\n{body.rstrip()}\n{end}\n"
if start in text and end in text:
    before, rest = text.split(start, 1)
    _, after = rest.split(end, 1)
    text = before.rstrip() + "\n\n" + block + after.lstrip("\n")
else:
    text = text.rstrip() + "\n\n" + block
path.write_text(text)
PY
}

write_rollback() {
  local rollback="$BACKUP_DIR/rollback-060v.sh"
  cat > "$rollback" <<'ROLLBACK'
#!/usr/bin/env bash
set -euo pipefail

REPO="/storage/emulated/0/Forge OS"
BACKUP_DIR_PLACEHOLDER
cd "$REPO"

restore_or_archive() {
  local file="$1"
  local backup="$BACKUP_DIR/$file"
  if [[ -f "$backup" ]]; then
    mkdir -p "$(dirname "$file")"
    cp "$backup" "$file"
    echo "restored $file"
  elif [[ -e "$file" ]]; then
    mkdir -p ".forge-backups/rollback-archives"
    local archive=".forge-backups/rollback-archives/$(basename "$file").060v.$(date +%Y%m%d_%H%M%S)"
    mv "$file" "$archive"
    echo "archived created file $file -> $archive"
  fi
}

restore_or_archive "docs/static-preview/forge-alive/index.html"
restore_or_archive "docs/static-preview/forge-alive/desktop/forge-public-preview-interaction-visual-repair-060m.css"
restore_or_archive "docs/static-preview/forge-alive/desktop/forge-public-preview-interaction-visual-repair-060m.js"
restore_or_archive "FORGE_MASTER_BUILD_TREE.md"
restore_or_archive "docs/architecture/source-truth/FORGE_UNIFIED_BUILD_TREE_001.md"
restore_or_archive "docs/roadmap/FORGE_ROADMAP_LOCK_001.md"
restore_or_archive "docs/architecture/source-truth/FORGE_COMMAND_BAR_RESTORE_INPUT_REPAIR_CLOSURE_060V.md"
restore_or_archive "docs/evidence/FORGE_COMMAND_BAR_RESTORE_INPUT_REPAIR_060V.md"
restore_or_archive "docs/evidence/FORGE_COMMAND_BAR_RESTORE_INPUT_REPAIR_CERTIFICATE_060V.md"
restore_or_archive "tools/termux/forge_060v_command_bar_restore_input_repair.sh"

echo "rollback 060V complete"
ROLLBACK
  python3 - "$rollback" "$BACKUP_DIR" <<'PY'
from pathlib import Path
import sys

path = Path(sys.argv[1])
backup = sys.argv[2]
text = path.read_text().replace("BACKUP_DIR_PLACEHOLDER", f'BACKUP_DIR="{backup}"')
path.write_text(text)
PY
  chmod +x "$rollback"
  pass "rollback script created: $rollback"
}

say_stage "STAGE 0 HEADER"
printf "PHASE=%s\n" "$PHASE"
printf "MODE=scoped static preview command bar restore input repair implementation\n"
printf "BOUNDARY=static preview visual repair only; no CRM; no calendar; no send; no runtime/network/storage; no provider execution; no real engine execution\n"
printf "REPORT=%s\n" "$REPORT"

say_stage "STAGE 1 CHECKPOINT"
cd "$REPO" || fail "repo not found: $REPO"
run_cmd git status --short --branch
run_cmd git log --oneline -10
run_cmd git diff --name-status
run_cmd git diff --cached --name-status

if [[ -n "$(git diff --name-only)" || -n "$(git diff --cached --name-only)" ]]; then
  hold "tracked worktree has unstaged or staged changes; refusing to mix 060V with unrelated edits"
fi

say_stage "STAGE 2 REQUIRED FILE CHECK"
required_files=(
  "docs/static-preview/forge-alive/index.html"
  "docs/static-preview/forge-alive/desktop/forge-public-preview-interaction-visual-repair-060m.css"
  "docs/static-preview/forge-alive/desktop/forge-public-preview-interaction-visual-repair-060m.js"
  "docs/architecture/source-truth/FORGE_COMMAND_BAR_INPUT_ONLY_CLEANUP_IMPLEMENTATION_CLOSURE_060U.md"
  "docs/evidence/FORGE_COMMAND_BAR_INPUT_ONLY_CLEANUP_IMPLEMENTATION_060U.md"
  "FORGE_MASTER_BUILD_TREE.md"
  "docs/architecture/source-truth/FORGE_UNIFIED_BUILD_TREE_001.md"
  "docs/roadmap/FORGE_ROADMAP_LOCK_001.md"
)

for file in "${required_files[@]}"; do
  require_file "$file"
done

say_stage "STAGE 3 BACKUP"
BACKUP_DIR=".forge-backups/060v-command-bar-restore-input-repair-$(date +%Y%m%d_%H%M%S)"
mkdir -p "$BACKUP_DIR"
for file in "${required_files[@]}"; do
  backup_file "$file"
done
write_rollback

say_stage "STAGE 4 APPLY CHANGES"
mkdir -p tools/termux
SCRIPT_SOURCE="$0"
if [[ -n "${BASH_SOURCE+x}" && -n "${BASH_SOURCE[0]:-}" ]]; then
  SCRIPT_SOURCE="${BASH_SOURCE[0]}"
fi
if [[ ! -f "$SCRIPT_SOURCE" ]]; then
  fail "runner source not found: $SCRIPT_SOURCE"
fi
cp "$SCRIPT_SOURCE" "tools/termux/forge_060v_command_bar_restore_input_repair.sh"
pass "copied runner into tools/termux"

python3 - <<'PY'
from pathlib import Path

css_path = Path("docs/static-preview/forge-alive/desktop/forge-public-preview-interaction-visual-repair-060m.css")
js_path = Path("docs/static-preview/forge-alive/desktop/forge-public-preview-interaction-visual-repair-060m.js")
index_path = Path("docs/static-preview/forge-alive/index.html")

def replace_block(text, start, end, block):
    if start in text and end in text:
        before, rest = text.split(start, 1)
        _, after = rest.split(end, 1)
        return before.rstrip() + "\n\n" + block.rstrip() + "\n" + after.lstrip("\n")
    return text.rstrip() + "\n\n" + block.rstrip() + "\n"

css = css_path.read_text()
start = "/* FORGEOS:COMMAND_BAR_RESTORE_INPUT_REPAIR_060V:START */"
end = "/* FORGEOS:COMMAND_BAR_RESTORE_INPUT_REPAIR_060V:END */"
css_block = """/* FORGEOS:COMMAND_BAR_RESTORE_INPUT_REPAIR_060V:START */
@media (min-width: 901px) {
  .dw-command-zone-056y,
  .dw-command-shell-056y,
  .dw-command-card-056y,
  .dw-command-zone-056y[data-forge-command-static-suggestion-060u="true"],
  .dw-command-shell-056y[data-forge-command-static-suggestion-060u="true"],
  .dw-command-card-056y[data-forge-command-static-suggestion-060u="true"] {
    display: block !important;
    height: auto !important;
    min-height: unset !important;
    max-height: none !important;
    opacity: 1 !important;
    visibility: visible !important;
    overflow: visible !important;
    pointer-events: auto !important;
  }

  .dw-command-input-056y,
  .command-pill-input,
  input[aria-controls="forge-command-results-060m"],
  .dw-command-input-056y[data-forge-command-static-suggestion-060u="true"],
  .command-pill-input[data-forge-command-static-suggestion-060u="true"] {
    display: inline-flex !important;
    width: 100% !important;
    height: auto !important;
    min-height: 44px !important;
    max-height: none !important;
    opacity: 1 !important;
    visibility: visible !important;
    pointer-events: auto !important;
  }

  [data-forge-command-hidden-secondary-060v="true"],
  .dw-command-zone-056y [data-forge-command-hidden-secondary-060v="true"],
  .dw-command-shell-056y [data-forge-command-hidden-secondary-060v="true"],
  .dw-command-card-056y [data-forge-command-hidden-secondary-060v="true"] {
    display: none !important;
    height: 0 !important;
    min-height: 0 !important;
    max-height: 0 !important;
    margin: 0 !important;
    padding: 0 !important;
    border: 0 !important;
    opacity: 0 !important;
    overflow: hidden !important;
    pointer-events: none !important;
  }

  [data-forge-command-input-row-060v="true"] {
    display: flex !important;
    align-items: center !important;
    gap: 12px !important;
    opacity: 1 !important;
    visibility: visible !important;
    pointer-events: auto !important;
  }
}
/* FORGEOS:COMMAND_BAR_RESTORE_INPUT_REPAIR_060V:END */"""
css_path.write_text(replace_block(css, start, end, css_block))

js = js_path.read_text()
start_js = "/* FORGEOS:COMMAND_BAR_RESTORE_INPUT_REPAIR_060V:START */"
end_js = "/* FORGEOS:COMMAND_BAR_RESTORE_INPUT_REPAIR_060V:END */"
js_block = """/* FORGEOS:COMMAND_BAR_RESTORE_INPUT_REPAIR_060V:START */
(function () {
  "use strict";

  var DESKTOP_QUERY = "(min-width: 901px)";

  function isDesktop() {
    return !window.matchMedia || window.matchMedia(DESKTOP_QUERY).matches;
  }

  function textOf(node) {
    if (!node) {
      return "";
    }
    return String(node.value || node.textContent || node.getAttribute("aria-label") || "").trim();
  }

  function commandInput() {
    return document.querySelector(".dw-command-input-056y, .command-pill-input, input[aria-controls='forge-command-results-060m']");
  }

  function commandRoot(input) {
    if (!input) {
      return null;
    }
    return input.closest(".dw-command-zone-056y, .dw-command-shell-056y, .dw-command-card-056y, .command-shell") || input.parentElement;
  }

  function restoreNode(node) {
    if (!node) {
      return;
    }
    node.removeAttribute("data-forge-command-static-suggestion-060u");
    node.removeAttribute("data-forge-command-hidden-secondary-060v");
    node.removeAttribute("aria-hidden");
  }

  function hideNode(node) {
    if (!node) {
      return;
    }
    node.setAttribute("data-forge-command-hidden-secondary-060v", "true");
    node.setAttribute("aria-hidden", "true");
  }

  function looksLikeSecondaryCommandBlock(node, input, root) {
    if (!node || node === input || node.contains(input)) {
      return false;
    }
    if (node.closest("[data-forge-command-results-panel-060s='true']")) {
      return false;
    }
    var content = textOf(node).toLowerCase();
    if (!content) {
      return false;
    }
    if (content.indexOf("preview seguro") !== -1 || content.indexOf("abre workspace") !== -1) {
      return true;
    }
    if (content.indexOf("/cotizar") !== -1 || content.indexOf("/follow") !== -1 || content.indexOf("/llamar") !== -1 || content.indexOf("/buscar") !== -1 || content.indexOf("/mandar") !== -1 || content.indexOf("/subir") !== -1) {
      return true;
    }
    return false;
  }

  function repairCommandBar() {
    if (!isDesktop()) {
      return;
    }

    var input = commandInput();
    var root = commandRoot(input);
    if (!input || !root) {
      return;
    }

    restoreNode(input);
    restoreNode(root);
    restoreNode(root.closest(".dw-command-zone-056y"));
    restoreNode(root.closest(".dw-command-shell-056y"));
    restoreNode(root.closest(".dw-command-card-056y"));

    input.removeAttribute("aria-readonly");
    input.removeAttribute("tabindex");
    input.setAttribute("inputmode", "text");
    input.setAttribute("autocomplete", "off");
    if ("readOnly" in input) {
      input.readOnly = false;
    }

    var inputRow = input.closest(".dw-command-row-056y, .dw-command-input-row-056y, .command-input-row") || input.parentElement;
    if (inputRow) {
      restoreNode(inputRow);
      inputRow.setAttribute("data-forge-command-input-row-060v", "true");
    }

    Array.prototype.slice.call(root.querySelectorAll("[data-forge-command-static-suggestion-060u='true']")).forEach(function (node) {
      restoreNode(node);
    });

    var secondarySelectors = [
      ".dw-command-suggestions-058e",
      ".dw-command-suggestions-056y",
      ".command-suggestions",
      ".dw-decision-strip-058e"
    ];
    Array.prototype.slice.call(root.querySelectorAll(secondarySelectors.join(","))).forEach(function (node) {
      if (!node.contains(input)) {
        hideNode(node);
      }
    });

    Array.prototype.slice.call(root.querySelectorAll("div, section, article, ul, li, button")).forEach(function (node) {
      if (!looksLikeSecondaryCommandBlock(node, input, root)) {
        return;
      }
      var shell = node.closest(".dw-command-zone-056y, .dw-command-shell-056y, .dw-command-card-056y");
      if (shell && shell.contains(input) && shell === node) {
        return;
      }
      hideNode(node);
    });

    document.documentElement.setAttribute("data-forge-command-input-restored-060v", "true");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", repairCommandBar, { once: true });
  } else {
    repairCommandBar();
  }
  window.addEventListener("load", repairCommandBar);
  window.addEventListener("forge:local-read-model-source:060i", repairCommandBar);
  window.__forgeRunCommandBarRestoreInputRepair060V = repairCommandBar;
})();
/* FORGEOS:COMMAND_BAR_RESTORE_INPUT_REPAIR_060V:END */"""
js_path.write_text(replace_block(js, start_js, end_js, js_block))

index = index_path.read_text()
index = index.replace("forge-public-preview-interaction-visual-repair-060m.css?v=060u", "forge-public-preview-interaction-visual-repair-060m.css?v=060v")
index = index.replace("forge-public-preview-interaction-visual-repair-060m.js?v=060u", "forge-public-preview-interaction-visual-repair-060m.js?v=060v")
index_path.write_text(index)
PY
pass "patched 060m CSS/JS to restore input and hide only secondary command blocks with 060v cache"

say_stage "STAGE 5 WRITE DOCS / EVIDENCE"
cat > docs/architecture/source-truth/FORGE_COMMAND_BAR_RESTORE_INPUT_REPAIR_CLOSURE_060V.md <<'MD'
# Forge Command Bar Restore Input Repair Closure 060V

DECISION=PASS_060V_COMMAND_BAR_RESTORE_INPUT_REPAIR_IMPLEMENTATION

NEXT=060W_COMMAND_BAR_INPUT_RESTORED_VISUAL_QA_LOCK

060V repairs the 060U over-hide regression. The command bar shell and input are explicitly restored while fixed secondary command preview/suggestion blocks are hidden.

Safety remains static-preview only.

No CRM, calendar, send, provider, real engine, runtime, network, or browser persistence behavior is enabled.

## Public URL

`https://jorgeprdz.github.io/ForgeOS/static-preview/forge-alive/?v=060v`

## Closure

DECISION=PASS_060V_COMMAND_BAR_RESTORE_INPUT_REPAIR_IMPLEMENTATION

NEXT=060W_COMMAND_BAR_INPUT_RESTORED_VISUAL_QA_LOCK
MD

cat > docs/evidence/FORGE_COMMAND_BAR_RESTORE_INPUT_REPAIR_060V.md <<'MD'
# Forge Command Bar Restore Input Repair 060V

DECISION=PASS_060V_COMMAND_BAR_RESTORE_INPUT_REPAIR_IMPLEMENTATION

NEXT=060W_COMMAND_BAR_INPUT_RESTORED_VISUAL_QA_LOCK

060V addresses the public QA finding that 060U removed the entire command bar. It restores the shell/input path and limits hiding to fixed secondary content below the input row.

Validation:
- runner syntax check;
- static preview JS syntax check;
- cache bust updated to `060v`;
- safety scan clean.

Expected visual behavior:
- command bar visible;
- command bar editable;
- no fixed `/cotizar` result under the bar when closed;
- results appear only through the search overlay after input text.

DECISION=PASS_060V_COMMAND_BAR_RESTORE_INPUT_REPAIR_IMPLEMENTATION

NEXT=060W_COMMAND_BAR_INPUT_RESTORED_VISUAL_QA_LOCK
MD

cat > docs/evidence/FORGE_COMMAND_BAR_RESTORE_INPUT_REPAIR_CERTIFICATE_060V.md <<'MD'
# Forge Command Bar Restore Input Repair Certificate 060V

DECISION=PASS_060V_COMMAND_BAR_RESTORE_INPUT_REPAIR_IMPLEMENTATION

NEXT=060W_COMMAND_BAR_INPUT_RESTORED_VISUAL_QA_LOCK

This certificate records that 060V is a scoped static preview visual repair. It restores the command input after the 060U over-hide regression and keeps action execution disabled.
MD
pass "wrote docs / evidence"

say_stage "STAGE 6 UPDATE BUILD TREE / ROADMAP"
sync_body="060V repairs the command bar input-only cleanup regression by restoring the shell/input and hiding only secondary fixed preview/suggestion blocks.

Public cache:
\`060v\`

DECISION=PASS_060V_COMMAND_BAR_RESTORE_INPUT_REPAIR_IMPLEMENTATION

NEXT=060W_COMMAND_BAR_INPUT_RESTORED_VISUAL_QA_LOCK"

append_sync_block "FORGE_MASTER_BUILD_TREE.md" "<!-- FORGEOS:COMMAND_BAR_RESTORE_INPUT_REPAIR_060V:START -->" "<!-- FORGEOS:COMMAND_BAR_RESTORE_INPUT_REPAIR_060V:END -->" "$sync_body"
append_sync_block "docs/architecture/source-truth/FORGE_UNIFIED_BUILD_TREE_001.md" "<!-- FORGEOS:COMMAND_BAR_RESTORE_INPUT_REPAIR_060V:START -->" "<!-- FORGEOS:COMMAND_BAR_RESTORE_INPUT_REPAIR_060V:END -->" "$sync_body"
append_sync_block "docs/roadmap/FORGE_ROADMAP_LOCK_001.md" "<!-- FORGEOS:COMMAND_BAR_RESTORE_INPUT_REPAIR_060V:START -->" "<!-- FORGEOS:COMMAND_BAR_RESTORE_INPUT_REPAIR_060V:END -->" "$sync_body"
pass "updated build tree / roadmap sync blocks"

say_stage "STAGE 7 NORMALIZE FILES"
changed_files=(
  "docs/static-preview/forge-alive/index.html"
  "docs/static-preview/forge-alive/desktop/forge-public-preview-interaction-visual-repair-060m.css"
  "docs/static-preview/forge-alive/desktop/forge-public-preview-interaction-visual-repair-060m.js"
  "FORGE_MASTER_BUILD_TREE.md"
  "docs/architecture/source-truth/FORGE_UNIFIED_BUILD_TREE_001.md"
  "docs/roadmap/FORGE_ROADMAP_LOCK_001.md"
  "docs/architecture/source-truth/FORGE_COMMAND_BAR_RESTORE_INPUT_REPAIR_CLOSURE_060V.md"
  "docs/evidence/FORGE_COMMAND_BAR_RESTORE_INPUT_REPAIR_060V.md"
  "docs/evidence/FORGE_COMMAND_BAR_RESTORE_INPUT_REPAIR_CERTIFICATE_060V.md"
  "tools/termux/forge_060v_command_bar_restore_input_repair.sh"
)

for file in "${changed_files[@]}"; do
  normalize_file "$file"
done
pass "normalized EOF and trailing whitespace"

say_stage "STAGE 8 VALIDATION"
run_cmd bash -n tools/termux/forge_060v_command_bar_restore_input_repair.sh
run_cmd node --check docs/static-preview/forge-alive/desktop/forge-public-preview-interaction-visual-repair-060m.js
run_cmd rg -n "060v|forge-public-preview-interaction-visual-repair-060m.css|forge-public-preview-interaction-visual-repair-060m.js" docs/static-preview/forge-alive/index.html
run_cmd rg -n "FORGEOS:COMMAND_BAR_RESTORE_INPUT_REPAIR_060V|data-forge-command-hidden-secondary-060v|data-forge-command-input-row-060v|__forgeRunCommandBarRestoreInputRepair060V" docs/static-preview/forge-alive/desktop/forge-public-preview-interaction-visual-repair-060m.css docs/static-preview/forge-alive/desktop/forge-public-preview-interaction-visual-repair-060m.js
run_cmd rg -n "DECISION=PASS_060V_COMMAND_BAR_RESTORE_INPUT_REPAIR_IMPLEMENTATION|NEXT=060W_COMMAND_BAR_INPUT_RESTORED_VISUAL_QA_LOCK" docs/architecture/source-truth/FORGE_COMMAND_BAR_RESTORE_INPUT_REPAIR_CLOSURE_060V.md docs/evidence/FORGE_COMMAND_BAR_RESTORE_INPUT_REPAIR_060V.md docs/evidence/FORGE_COMMAND_BAR_RESTORE_INPUT_REPAIR_CERTIFICATE_060V.md FORGE_MASTER_BUILD_TREE.md docs/architecture/source-truth/FORGE_UNIFIED_BUILD_TREE_001.md docs/roadmap/FORGE_ROADMAP_LOCK_001.md
run_cmd git diff --check
warn "No package test suite required for scoped command bar restore repair"

say_stage "STAGE 9 SAFETY SCAN"
safety_files=(
  "docs/static-preview/forge-alive/index.html"
  "docs/static-preview/forge-alive/desktop/forge-public-preview-interaction-visual-repair-060m.css"
  "docs/static-preview/forge-alive/desktop/forge-public-preview-interaction-visual-repair-060m.js"
  "docs/architecture/source-truth/FORGE_COMMAND_BAR_RESTORE_INPUT_REPAIR_CLOSURE_060V.md"
  "docs/evidence/FORGE_COMMAND_BAR_RESTORE_INPUT_REPAIR_060V.md"
  "FORGE_MASTER_BUILD_TREE.md"
  "docs/architecture/source-truth/FORGE_UNIFIED_BUILD_TREE_001.md"
  "docs/roadmap/FORGE_ROADMAP_LOCK_001.md"
)
safety_scan_file="$BACKUP_DIR/safety-scan-060v.txt"

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
  if rg -n -F "$token" "${safety_files[@]}" > "$safety_scan_file" 2>/dev/null; then
    cat "$safety_scan_file"
    fail "safety scan found forbidden token: $token"
  fi
done
pass "safety scan clean"

say_stage "STAGE 10 OPTIONAL SCREENSHOT EVIDENCE"
warn "Screenshot evidence should be captured after 060V deploys"

say_stage "STAGE 11 STAGE AUTHORIZED FILES"
allowed_paths=(
  "FORGE_MASTER_BUILD_TREE.md"
  "docs/architecture/source-truth/FORGE_COMMAND_BAR_RESTORE_INPUT_REPAIR_CLOSURE_060V.md"
  "docs/architecture/source-truth/FORGE_UNIFIED_BUILD_TREE_001.md"
  "docs/evidence/FORGE_COMMAND_BAR_RESTORE_INPUT_REPAIR_060V.md"
  "docs/evidence/FORGE_COMMAND_BAR_RESTORE_INPUT_REPAIR_CERTIFICATE_060V.md"
  "docs/roadmap/FORGE_ROADMAP_LOCK_001.md"
  "docs/static-preview/forge-alive/index.html"
  "docs/static-preview/forge-alive/desktop/forge-public-preview-interaction-visual-repair-060m.css"
  "docs/static-preview/forge-alive/desktop/forge-public-preview-interaction-visual-repair-060m.js"
  "tools/termux/forge_060v_command_bar_restore_input_repair.sh"
)

git add "${allowed_paths[@]}"
run_cmd git diff --cached --name-only

mapfile -t staged_files < <(git diff --cached --name-only)
for staged in "${staged_files[@]}"; do
  ok="false"
  for allowed in "${allowed_paths[@]}"; do
    if [[ "$staged" == "$allowed" ]]; then
      ok="true"
      break
    fi
  done
  if [[ "$ok" != "true" ]]; then
    fail "unauthorized staged file: $staged"
  fi
done
pass "only authorized files staged"
run_cmd git diff --cached --check

say_stage "STAGE 12 COMMIT PUSH"
run_cmd git commit -m "fix: restore forge command bar input"
run_cmd git push origin HEAD:main

say_stage "STAGE 13 FINAL CHECKPOINT"
run_cmd git status --short --branch
run_cmd git log --oneline -10

say_stage "FINAL DECISION"
printf "PASS_060V_COMMAND_BAR_RESTORE_INPUT_REPAIR_IMPLEMENTATION_COMMIT_PUSH_COMPLETE\n"
printf "NEXT=060W_COMMAND_BAR_INPUT_RESTORED_VISUAL_QA_LOCK\n"
printf "BACKUP=%s\n" "$BACKUP_DIR"
printf "ROLLBACK=%s\n" "$BACKUP_DIR/rollback-060v.sh"
printf "Reporte: %s\n" "$REPORT"
autocopy_report
