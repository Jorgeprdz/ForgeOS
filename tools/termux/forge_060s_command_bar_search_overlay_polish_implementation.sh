#!/usr/bin/env bash
set -euo pipefail

PHASE="060S_COMMAND_BAR_SEARCH_OVERLAY_POLISH_IMPLEMENTATION"
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
lines = text.splitlines()
path.write_text("\n".join(line.rstrip() for line in lines) + "\n")
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
  local rollback="$BACKUP_DIR/rollback-060s.sh"
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
    local archive=".forge-backups/rollback-archives/$(basename "$file").060s.$(date +%Y%m%d_%H%M%S)"
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
restore_or_archive "docs/architecture/source-truth/FORGE_COMMAND_BAR_SEARCH_OVERLAY_POLISH_IMPLEMENTATION_CLOSURE_060S.md"
restore_or_archive "docs/evidence/FORGE_COMMAND_BAR_SEARCH_OVERLAY_POLISH_IMPLEMENTATION_060S.md"
restore_or_archive "docs/evidence/FORGE_COMMAND_BAR_SEARCH_OVERLAY_POLISH_IMPLEMENTATION_CERTIFICATE_060S.md"
restore_or_archive "tools/termux/forge_060s_command_bar_search_overlay_polish_implementation.sh"

echo "rollback 060S complete"
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
printf "MODE=scoped static preview command bar search overlay polish implementation\n"
printf "BOUNDARY=static preview visual polish only; no CRM; no calendar; no send; no runtime/network/storage; no provider execution; no real engine execution\n"
printf "REPORT=%s\n" "$REPORT"

say_stage "STAGE 1 CHECKPOINT"
cd "$REPO" || fail "repo not found: $REPO"
run_cmd git status --short --branch
run_cmd git log --oneline -10
run_cmd git diff --name-status
run_cmd git diff --cached --name-status

if [[ -n "$(git diff --name-only)" || -n "$(git diff --cached --name-only)" ]]; then
  hold "tracked worktree has unstaged or staged changes; refusing to mix 060S with unrelated edits"
fi

say_stage "STAGE 2 REQUIRED FILE CHECK"
required_files=(
  "docs/static-preview/forge-alive/index.html"
  "docs/static-preview/forge-alive/desktop/forge-public-preview-interaction-visual-repair-060m.css"
  "docs/static-preview/forge-alive/desktop/forge-public-preview-interaction-visual-repair-060m.js"
  "docs/static-preview/forge-alive/desktop/forge-desktop-visual-line-cleanup-058i.css"
  "docs/evidence/forge-command-bar-search-qa-audit-060r.json"
  "FORGE_MASTER_BUILD_TREE.md"
  "docs/architecture/source-truth/FORGE_UNIFIED_BUILD_TREE_001.md"
  "docs/roadmap/FORGE_ROADMAP_LOCK_001.md"
)

for file in "${required_files[@]}"; do
  require_file "$file"
done

say_stage "STAGE 3 BACKUP"
BACKUP_DIR=".forge-backups/060s-command-bar-search-overlay-polish-$(date +%Y%m%d_%H%M%S)"
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
cp "$SCRIPT_SOURCE" "tools/termux/forge_060s_command_bar_search_overlay_polish_implementation.sh"
pass "copied runner into tools/termux"

python3 - <<'PY'
from pathlib import Path

css_path = Path("docs/static-preview/forge-alive/desktop/forge-public-preview-interaction-visual-repair-060m.css")
js_path = Path("docs/static-preview/forge-alive/desktop/forge-public-preview-interaction-visual-repair-060m.js")
index_path = Path("docs/static-preview/forge-alive/index.html")

css = css_path.read_text()
start = "/* FORGEOS:COMMAND_BAR_SEARCH_OVERLAY_POLISH_060S:START */"
end = "/* FORGEOS:COMMAND_BAR_SEARCH_OVERLAY_POLISH_060S:END */"
css_block = """/* FORGEOS:COMMAND_BAR_SEARCH_OVERLAY_POLISH_060S:START */
@media (min-width: 901px) {
  [data-forge-command-overlay-root-060s="true"] {
    position: relative !important;
    overflow: visible !important;
  }

  [data-forge-command-overlay-root-060s="true"][data-forge-command-overlay-active-060s="true"] {
    z-index: 80 !important;
  }

  [data-forge-static-command-suggestions-060s="true"][data-forge-static-command-suggestions-collapsed-060s="true"] {
    height: 0 !important;
    min-height: 0 !important;
    max-height: 0 !important;
    margin-top: 0 !important;
    margin-bottom: 0 !important;
    padding-top: 0 !important;
    padding-bottom: 0 !important;
    border-width: 0 !important;
    opacity: 0 !important;
    overflow: hidden !important;
    pointer-events: none !important;
  }

  [data-forge-command-results-panel-060s="true"] {
    position: absolute !important;
    top: var(--forge-command-overlay-top-060s, 72px) !important;
    left: var(--forge-command-overlay-left-060s, 18px) !important;
    right: var(--forge-command-overlay-right-060s, 18px) !important;
    z-index: 120 !important;
    max-height: min(420px, calc(100vh - var(--forge-command-overlay-top-060s, 72px) - 72px)) !important;
    overflow: auto !important;
    border: 1px solid rgba(126, 211, 255, 0.2) !important;
    border-radius: 18px !important;
    background: rgba(8, 22, 34, 0.96) !important;
    box-shadow: 0 24px 70px rgba(0, 0, 0, 0.38), 0 0 0 1px rgba(255, 255, 255, 0.04) inset !important;
    backdrop-filter: blur(18px) saturate(130%) !important;
  }

  [data-forge-command-overlay-root-060s="true"]:not([data-forge-command-overlay-active-060s="true"]) [data-forge-command-results-panel-060s="true"] {
    display: none !important;
  }

  [data-forge-command-overlay-root-060s="true"][data-forge-command-overlay-active-060s="true"] [data-forge-command-results-panel-060s="true"] {
    display: block !important;
  }
}
/* FORGEOS:COMMAND_BAR_SEARCH_OVERLAY_POLISH_060S:END */"""
if start in css and end in css:
    before, rest = css.split(start, 1)
    _, after = rest.split(end, 1)
    css = before.rstrip() + "\n\n" + css_block + "\n" + after.lstrip("\n")
else:
    css = css.rstrip() + "\n\n" + css_block + "\n"
css_path.write_text(css)

js = js_path.read_text()
start_js = "/* FORGEOS:COMMAND_BAR_SEARCH_OVERLAY_POLISH_060S:START */"
end_js = "/* FORGEOS:COMMAND_BAR_SEARCH_OVERLAY_POLISH_060S:END */"
js_block = """/* FORGEOS:COMMAND_BAR_SEARCH_OVERLAY_POLISH_060S:START */
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

  function visibleRect(node) {
    if (!node || typeof node.getBoundingClientRect !== "function") {
      return null;
    }
    var rect = node.getBoundingClientRect();
    if (!rect || rect.width <= 0 || rect.height <= 0) {
      return null;
    }
    return rect;
  }

  function commandInput() {
    return document.querySelector(".dw-command-input-056y, .command-pill-input, [aria-controls='forge-command-results-060m']");
  }

  function commandRoot(input) {
    if (!input) {
      return null;
    }
    return input.closest(".dw-command-zone-056y, .dw-command-shell-056y, .command-shell, .dw-command-card-056y") || input.parentElement;
  }

  function markResultPanel(root, input) {
    var panel = document.getElementById(input.getAttribute("aria-controls") || "forge-command-results-060m");
    if (!panel && root) {
      panel = root.querySelector("[role='listbox'], .forge-command-results-060m, .command-results");
    }
    if (!panel) {
      return null;
    }
    panel.setAttribute("data-forge-command-results-panel-060s", "true");
    return panel;
  }

  function markStaticSuggestions(root, panel) {
    if (!root) {
      return [];
    }
    var candidates = Array.prototype.slice.call(root.querySelectorAll("div, section, article, li, button"));
    return candidates.filter(function (node) {
      if (node === panel || (panel && panel.contains(node))) {
        return false;
      }
      var content = textOf(node).toLowerCase();
      return content.indexOf("cotizar") !== -1 && content.indexOf("/cotizar") !== -1;
    }).map(function (node) {
      node.setAttribute("data-forge-static-command-suggestions-060s", "true");
      return node;
    });
  }

  function setOverlayGeometry(root, input) {
    var rootRect = visibleRect(root);
    var inputRect = visibleRect(input);
    if (!rootRect || !inputRect) {
      return;
    }
    var top = Math.max(56, Math.round(inputRect.bottom - rootRect.top + 10));
    var left = Math.max(12, Math.round(inputRect.left - rootRect.left));
    var right = Math.max(12, Math.round(rootRect.right - inputRect.right));
    root.style.setProperty("--forge-command-overlay-top-060s", top + "px");
    root.style.setProperty("--forge-command-overlay-left-060s", left + "px");
    root.style.setProperty("--forge-command-overlay-right-060s", right + "px");
  }

  function setActive(root, suggestions, active) {
    if (!root) {
      return;
    }
    if (active) {
      root.setAttribute("data-forge-command-overlay-active-060s", "true");
    } else {
      root.removeAttribute("data-forge-command-overlay-active-060s");
    }
    suggestions.forEach(function (node) {
      if (active) {
        node.setAttribute("data-forge-static-command-suggestions-collapsed-060s", "true");
      } else {
        node.removeAttribute("data-forge-static-command-suggestions-collapsed-060s");
      }
    });
  }

  function runOverlayPolish() {
    if (!isDesktop()) {
      return;
    }
    var input = commandInput();
    var root = commandRoot(input);
    if (!input || !root) {
      return;
    }
    root.setAttribute("data-forge-command-overlay-root-060s", "true");
    var panel = markResultPanel(root, input);
    var suggestions = markStaticSuggestions(root, panel);

    function update() {
      setOverlayGeometry(root, input);
      setActive(root, suggestions, Boolean(input.value && input.value.trim()));
    }

    input.addEventListener("focus", update);
    input.addEventListener("input", update);
    input.addEventListener("keydown", function () {
      window.setTimeout(update, 0);
    });
    input.addEventListener("blur", function () {
      window.setTimeout(function () {
        setActive(root, suggestions, false);
      }, 160);
    });
    update();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", runOverlayPolish, { once: true });
  } else {
    runOverlayPolish();
  }
  window.addEventListener("load", runOverlayPolish);
  window.__forgeRunCommandBarSearchOverlayPolish060S = runOverlayPolish;
})();
/* FORGEOS:COMMAND_BAR_SEARCH_OVERLAY_POLISH_060S:END */"""
if start_js in js and end_js in js:
    before, rest = js.split(start_js, 1)
    _, after = rest.split(end_js, 1)
    js = before.rstrip() + "\n\n" + js_block + "\n" + after.lstrip("\n")
else:
    js = js.rstrip() + "\n\n" + js_block + "\n"
js_path.write_text(js)

index = index_path.read_text()
index = index.replace("forge-public-preview-interaction-visual-repair-060m.css?v=060q", "forge-public-preview-interaction-visual-repair-060m.css?v=060s")
index = index.replace("forge-public-preview-interaction-visual-repair-060m.js?v=060q", "forge-public-preview-interaction-visual-repair-060m.js?v=060s")
index_path.write_text(index)
PY
pass "patched 060m CSS/JS overlay polish and 060s cache"

say_stage "STAGE 5 WRITE DOCS / EVIDENCE"
cat > docs/architecture/source-truth/FORGE_COMMAND_BAR_SEARCH_OVERLAY_POLISH_IMPLEMENTATION_CLOSURE_060S.md <<'MD'
# Forge Command Bar Search Overlay Polish Implementation Closure 060S

DECISION=PASS_060S_COMMAND_BAR_SEARCH_OVERLAY_POLISH_IMPLEMENTATION

NEXT=060T_COMMAND_BAR_SEARCH_OVERLAY_VISUAL_QA_LOCK

060S polishes the 060Q command bar search open state.

It corrects the open-state layout so static suggestions collapse when a real query is active, while the results panel behaves as a floating overlay instead of reserving a large vertical gap inside the shell.

Implemented in-place:

- `docs/static-preview/forge-alive/desktop/forge-public-preview-interaction-visual-repair-060m.css`
- `docs/static-preview/forge-alive/desktop/forge-public-preview-interaction-visual-repair-060m.js`
- `docs/static-preview/forge-alive/index.html`

Cache-bust:

- `060s`

The repair is visual/static preview only. It does not connect provider runtime, execute a real engine, write CRM, create calendar events, send messages, mutate browser storage, or request live external data.

DECISION=PASS_060S_COMMAND_BAR_SEARCH_OVERLAY_POLISH_IMPLEMENTATION

NEXT=060T_COMMAND_BAR_SEARCH_OVERLAY_VISUAL_QA_LOCK
MD

cat > docs/evidence/FORGE_COMMAND_BAR_SEARCH_OVERLAY_POLISH_IMPLEMENTATION_060S.md <<'MD'
# Forge Command Bar Search Overlay Polish Implementation 060S

DECISION=PASS_060S_COMMAND_BAR_SEARCH_OVERLAY_POLISH_IMPLEMENTATION

NEXT=060T_COMMAND_BAR_SEARCH_OVERLAY_VISUAL_QA_LOCK

060S addresses the visual QA finding that the open command search felt like an internal expanded card instead of a premium overlay.

Repair behavior:

- keeps the command bar clickable and editable;
- keeps empty click from showing a results panel;
- collapses static suggestions only when a real query is active;
- positions the results panel as a floating overlay relative to the command surface;
- removes the dead vertical gap under the command bar during active search;
- preserves the safe preview behavior and no-action boundaries.

Validation:

- runner shell syntax checked;
- command interaction JavaScript syntax checked;
- index cache-bust checked;
- overlay polish markers checked;
- whitespace check passed;
- safety scan passed.

DECISION=PASS_060S_COMMAND_BAR_SEARCH_OVERLAY_POLISH_IMPLEMENTATION

NEXT=060T_COMMAND_BAR_SEARCH_OVERLAY_VISUAL_QA_LOCK
MD

cat > docs/evidence/FORGE_COMMAND_BAR_SEARCH_OVERLAY_POLISH_IMPLEMENTATION_CERTIFICATE_060S.md <<'MD'
# Forge Command Bar Search Overlay Polish Implementation Certificate 060S

060S certifies the command bar search open state was polished to behave as a floating premium overlay without dead layout space.

DECISION=PASS_060S_COMMAND_BAR_SEARCH_OVERLAY_POLISH_IMPLEMENTATION

NEXT=060T_COMMAND_BAR_SEARCH_OVERLAY_VISUAL_QA_LOCK
MD
pass "wrote docs / evidence"

say_stage "STAGE 6 UPDATE BUILD TREE / ROADMAP"
sync_body="060S polishes the 060Q command bar search open state.

It keeps input interactivity, collapses static suggestions only during an active query, and positions results as a floating overlay without reserving dead vertical space.

Cache-bust:

\`060s\`

Boundary remains static preview visual polish only: no provider runtime, no CRM write, no calendar create, no send, no browser storage, no network calls, and no real engine execution.

DECISION=PASS_060S_COMMAND_BAR_SEARCH_OVERLAY_POLISH_IMPLEMENTATION

NEXT=060T_COMMAND_BAR_SEARCH_OVERLAY_VISUAL_QA_LOCK"

append_sync_block "FORGE_MASTER_BUILD_TREE.md" "<!-- FORGEOS:COMMAND_BAR_SEARCH_OVERLAY_POLISH_IMPLEMENTATION_060S:START -->" "<!-- FORGEOS:COMMAND_BAR_SEARCH_OVERLAY_POLISH_IMPLEMENTATION_060S:END -->" "$sync_body"
append_sync_block "docs/architecture/source-truth/FORGE_UNIFIED_BUILD_TREE_001.md" "<!-- FORGEOS:COMMAND_BAR_SEARCH_OVERLAY_POLISH_IMPLEMENTATION_060S:START -->" "<!-- FORGEOS:COMMAND_BAR_SEARCH_OVERLAY_POLISH_IMPLEMENTATION_060S:END -->" "$sync_body"
append_sync_block "docs/roadmap/FORGE_ROADMAP_LOCK_001.md" "<!-- FORGEOS:COMMAND_BAR_SEARCH_OVERLAY_POLISH_IMPLEMENTATION_060S:START -->" "<!-- FORGEOS:COMMAND_BAR_SEARCH_OVERLAY_POLISH_IMPLEMENTATION_060S:END -->" "$sync_body"
pass "updated build tree / roadmap sync blocks"

say_stage "STAGE 7 NORMALIZE FILES"
changed_files=(
  "docs/static-preview/forge-alive/index.html"
  "docs/static-preview/forge-alive/desktop/forge-public-preview-interaction-visual-repair-060m.css"
  "docs/static-preview/forge-alive/desktop/forge-public-preview-interaction-visual-repair-060m.js"
  "FORGE_MASTER_BUILD_TREE.md"
  "docs/architecture/source-truth/FORGE_UNIFIED_BUILD_TREE_001.md"
  "docs/roadmap/FORGE_ROADMAP_LOCK_001.md"
  "docs/architecture/source-truth/FORGE_COMMAND_BAR_SEARCH_OVERLAY_POLISH_IMPLEMENTATION_CLOSURE_060S.md"
  "docs/evidence/FORGE_COMMAND_BAR_SEARCH_OVERLAY_POLISH_IMPLEMENTATION_060S.md"
  "docs/evidence/FORGE_COMMAND_BAR_SEARCH_OVERLAY_POLISH_IMPLEMENTATION_CERTIFICATE_060S.md"
  "tools/termux/forge_060s_command_bar_search_overlay_polish_implementation.sh"
)

for file in "${changed_files[@]}"; do
  normalize_file "$file"
done
pass "normalized EOF and trailing whitespace"

say_stage "STAGE 8 VALIDATION"
run_cmd bash -n tools/termux/forge_060s_command_bar_search_overlay_polish_implementation.sh
run_cmd node --check docs/static-preview/forge-alive/desktop/forge-public-preview-interaction-visual-repair-060m.js
run_cmd python3 -m json.tool docs/evidence/forge-command-bar-search-qa-audit-060r.json
run_cmd rg -n "060s|forge-public-preview-interaction-visual-repair-060m.css|forge-public-preview-interaction-visual-repair-060m.js" docs/static-preview/forge-alive/index.html
run_cmd rg -n "FORGEOS:COMMAND_BAR_SEARCH_OVERLAY_POLISH_060S|data-forge-command-overlay-root-060s|data-forge-command-results-panel-060s|data-forge-static-command-suggestions-collapsed-060s|__forgeRunCommandBarSearchOverlayPolish060S" docs/static-preview/forge-alive/desktop/forge-public-preview-interaction-visual-repair-060m.css docs/static-preview/forge-alive/desktop/forge-public-preview-interaction-visual-repair-060m.js
run_cmd rg -n "DECISION=PASS_060S_COMMAND_BAR_SEARCH_OVERLAY_POLISH_IMPLEMENTATION|NEXT=060T_COMMAND_BAR_SEARCH_OVERLAY_VISUAL_QA_LOCK" docs/architecture/source-truth/FORGE_COMMAND_BAR_SEARCH_OVERLAY_POLISH_IMPLEMENTATION_CLOSURE_060S.md docs/evidence/FORGE_COMMAND_BAR_SEARCH_OVERLAY_POLISH_IMPLEMENTATION_060S.md docs/evidence/FORGE_COMMAND_BAR_SEARCH_OVERLAY_POLISH_IMPLEMENTATION_CERTIFICATE_060S.md FORGE_MASTER_BUILD_TREE.md docs/architecture/source-truth/FORGE_UNIFIED_BUILD_TREE_001.md docs/roadmap/FORGE_ROADMAP_LOCK_001.md
run_cmd git diff --check
warn "No package test suite required for scoped command bar overlay polish"

say_stage "STAGE 9 SAFETY SCAN"
safety_files=(
  "docs/static-preview/forge-alive/index.html"
  "docs/static-preview/forge-alive/desktop/forge-public-preview-interaction-visual-repair-060m.css"
  "docs/static-preview/forge-alive/desktop/forge-public-preview-interaction-visual-repair-060m.js"
  "docs/architecture/source-truth/FORGE_COMMAND_BAR_SEARCH_OVERLAY_POLISH_IMPLEMENTATION_CLOSURE_060S.md"
  "docs/evidence/FORGE_COMMAND_BAR_SEARCH_OVERLAY_POLISH_IMPLEMENTATION_060S.md"
  "FORGE_MASTER_BUILD_TREE.md"
  "docs/architecture/source-truth/FORGE_UNIFIED_BUILD_TREE_001.md"
  "docs/roadmap/FORGE_ROADMAP_LOCK_001.md"
)
safety_scan_file="$BACKUP_DIR/safety-scan-060s.txt"

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
warn "Screenshot evidence should be captured in 060T visual QA lock"

say_stage "STAGE 11 STAGE AUTHORIZED FILES"
allowed_paths=(
  "FORGE_MASTER_BUILD_TREE.md"
  "docs/architecture/source-truth/FORGE_COMMAND_BAR_SEARCH_OVERLAY_POLISH_IMPLEMENTATION_CLOSURE_060S.md"
  "docs/architecture/source-truth/FORGE_UNIFIED_BUILD_TREE_001.md"
  "docs/evidence/FORGE_COMMAND_BAR_SEARCH_OVERLAY_POLISH_IMPLEMENTATION_060S.md"
  "docs/evidence/FORGE_COMMAND_BAR_SEARCH_OVERLAY_POLISH_IMPLEMENTATION_CERTIFICATE_060S.md"
  "docs/roadmap/FORGE_ROADMAP_LOCK_001.md"
  "docs/static-preview/forge-alive/index.html"
  "docs/static-preview/forge-alive/desktop/forge-public-preview-interaction-visual-repair-060m.css"
  "docs/static-preview/forge-alive/desktop/forge-public-preview-interaction-visual-repair-060m.js"
  "tools/termux/forge_060s_command_bar_search_overlay_polish_implementation.sh"
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
run_cmd git commit -m "fix: polish forge alive command search overlay"
run_cmd git push origin HEAD:main

say_stage "STAGE 13 FINAL CHECKPOINT"
run_cmd git status --short --branch
run_cmd git log --oneline -10

say_stage "FINAL DECISION"
printf "PASS_060S_COMMAND_BAR_SEARCH_OVERLAY_POLISH_IMPLEMENTATION_COMMIT_PUSH_COMPLETE\n"
printf "NEXT=060T_COMMAND_BAR_SEARCH_OVERLAY_VISUAL_QA_LOCK\n"
printf "BACKUP=%s\n" "$BACKUP_DIR"
printf "ROLLBACK=%s\n" "$BACKUP_DIR/rollback-060s.sh"
printf "Reporte: %s\n" "$REPORT"
autocopy_report
