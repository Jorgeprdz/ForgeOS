#!/usr/bin/env bash
set -euo pipefail

PHASE="060Z_TOPBAR_PROFILE_ICON_CLEANUP_IMPLEMENTATION"
REPO="/storage/emulated/0/Forge OS"
REPORT="/data/data/com.termux/files/home/${PHASE}_RESULT_$(date +%Y%m%d_%H%M%S).md"
mkdir -p "$(dirname "$REPORT")"
exec > >(tee "$REPORT") 2>&1

CYAN="\033[1;36m"
GREEN="\033[1;38;5;46m"
YELLOW="\033[1;93m"
RED="\033[1;91m"
RESET="\033[0m"

say_stage() { printf "\n${CYAN}========== %s ==========${RESET}\n" "$1"; }
pass() { printf "${GREEN}PASS:${RESET} %s\n" "$1"; }
warn() { printf "${YELLOW}WARN:${RESET} %s\n" "$1"; }

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
  local rollback="$BACKUP_DIR/rollback-060z.sh"
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
    local archive=".forge-backups/rollback-archives/$(basename "$file").060z.$(date +%Y%m%d_%H%M%S)"
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
restore_or_archive "docs/architecture/source-truth/FORGE_TOPBAR_PROFILE_ICON_CLEANUP_CLOSURE_060Z.md"
restore_or_archive "docs/evidence/FORGE_TOPBAR_PROFILE_ICON_CLEANUP_060Z.md"
restore_or_archive "docs/evidence/FORGE_TOPBAR_PROFILE_ICON_CLEANUP_CERTIFICATE_060Z.md"
restore_or_archive "tools/termux/forge_060z_topbar_profile_icon_cleanup.sh"

echo "rollback 060Z complete"
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
printf "MODE=scoped static preview topbar profile icon cleanup implementation\n"
printf "BOUNDARY=static preview visual cleanup only; no auth; no CRM; no calendar; no send; no runtime/network/storage; no provider execution; no real engine execution\n"
printf "REPORT=%s\n" "$REPORT"

say_stage "STAGE 1 CHECKPOINT"
cd "$REPO" || fail "repo not found: $REPO"
run_cmd git status --short --branch
run_cmd git log --oneline -10
run_cmd git diff --name-status
run_cmd git diff --cached --name-status

if [[ -n "$(git diff --name-only)" || -n "$(git diff --cached --name-only)" ]]; then
  hold "tracked worktree has unstaged or staged changes; refusing to mix 060Z with unrelated edits"
fi

say_stage "STAGE 2 REQUIRED FILE CHECK"
required_files=(
  "docs/static-preview/forge-alive/index.html"
  "docs/static-preview/forge-alive/desktop/forge-public-preview-interaction-visual-repair-060m.css"
  "docs/static-preview/forge-alive/desktop/forge-public-preview-interaction-visual-repair-060m.js"
  "docs/architecture/source-truth/FORGE_PROFILE_MENU_PREP_SIDEBAR_IDENTITY_REPAIR_CLOSURE_060Y.md"
  "docs/evidence/FORGE_PROFILE_MENU_PREP_SIDEBAR_IDENTITY_REPAIR_060Y.md"
  "FORGE_MASTER_BUILD_TREE.md"
  "docs/architecture/source-truth/FORGE_UNIFIED_BUILD_TREE_001.md"
  "docs/roadmap/FORGE_ROADMAP_LOCK_001.md"
)

for file in "${required_files[@]}"; do
  require_file "$file"
done

say_stage "STAGE 3 BACKUP"
BACKUP_DIR=".forge-backups/060z-topbar-profile-icon-cleanup-$(date +%Y%m%d_%H%M%S)"
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
cp "$SCRIPT_SOURCE" "tools/termux/forge_060z_topbar_profile_icon_cleanup.sh"
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
start = "/* FORGEOS:TOPBAR_PROFILE_ICON_CLEANUP_060Z:START */"
end = "/* FORGEOS:TOPBAR_PROFILE_ICON_CLEANUP_060Z:END */"
css_block = """/* FORGEOS:TOPBAR_PROFILE_ICON_CLEANUP_060Z:START */
@media (min-width: 901px) {
  [data-forge-topbar-redundant-profile-icon-060z="true"] {
    display: none !important;
    width: 0 !important;
    height: 0 !important;
    min-width: 0 !important;
    min-height: 0 !important;
    margin: 0 !important;
    padding: 0 !important;
    border: 0 !important;
    opacity: 0 !important;
    overflow: hidden !important;
    pointer-events: none !important;
  }
}
/* FORGEOS:TOPBAR_PROFILE_ICON_CLEANUP_060Z:END */"""
css_path.write_text(replace_block(css, start, end, css_block))

js = js_path.read_text()
start_js = "/* FORGEOS:TOPBAR_PROFILE_ICON_CLEANUP_060Z:START */"
end_js = "/* FORGEOS:TOPBAR_PROFILE_ICON_CLEANUP_060Z:END */"
js_block = """/* FORGEOS:TOPBAR_PROFILE_ICON_CLEANUP_060Z:START */
(function () {
  "use strict";

  function textOf(node) {
    if (!node) {
      return "";
    }
    return String(node.textContent || node.value || node.getAttribute("aria-label") || node.title || "").trim();
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

  function findProfileAnchor() {
    var anchor = document.querySelector("[data-forge-profile-anchor-060y='true']");
    if (anchor) {
      return anchor;
    }
    var nodes = Array.prototype.slice.call(document.querySelectorAll("button, [role='button'], a, div, span"));
    var candidates = nodes.filter(function (node) {
      var rect = visibleRect(node);
      if (!rect || textOf(node) !== "J") {
        return false;
      }
      return rect.top < 170 && rect.left > Math.max(640, window.innerWidth * 0.68) && rect.width >= 34 && rect.width <= 78 && rect.height >= 34 && rect.height <= 78;
    });
    candidates.sort(function (a, b) {
      return visibleRect(b).left - visibleRect(a).left;
    });
    return candidates[0] || null;
  }

  function isRedundantTopbarIcon(node, anchorRect) {
    var rect = visibleRect(node);
    if (!rect || !anchorRect) {
      return false;
    }
    if (node.getAttribute("data-forge-profile-anchor-060y") === "true" || textOf(node) === "J") {
      return false;
    }
    var nearProfile = rect.top < 170 &&
      rect.right <= anchorRect.left + 4 &&
      rect.left >= anchorRect.left - 150 &&
      rect.width >= 28 &&
      rect.width <= 70 &&
      rect.height >= 28 &&
      rect.height <= 70;
    if (!nearProfile) {
      return false;
    }
    var label = textOf(node).toLowerCase();
    return label === "!" ||
      label.indexOf("!") !== -1 ||
      label.indexOf("gear") !== -1 ||
      label.indexOf("settings") !== -1 ||
      label.indexOf("config") !== -1 ||
      label.indexOf("ajuste") !== -1 ||
      label.indexOf("opcion") !== -1 ||
      label.length <= 2;
  }

  function cleanupTopbarIcons() {
    var anchor = findProfileAnchor();
    var anchorRect = visibleRect(anchor);
    if (!anchor || !anchorRect) {
      return;
    }

    var nodes = Array.prototype.slice.call(document.querySelectorAll("button, [role='button'], a, div, span"));
    nodes.forEach(function (node) {
      if (node === anchor || anchor.contains(node) || node.closest(".forge-profile-menu-060y")) {
        return;
      }
      if (isRedundantTopbarIcon(node, anchorRect)) {
        node.setAttribute("data-forge-topbar-redundant-profile-icon-060z", "true");
        node.setAttribute("aria-hidden", "true");
        node.setAttribute("tabindex", "-1");
      }
    });
    document.documentElement.setAttribute("data-forge-topbar-profile-icons-clean-060z", "true");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", cleanupTopbarIcons, { once: true });
  } else {
    cleanupTopbarIcons();
  }
  window.addEventListener("load", cleanupTopbarIcons);
  window.__forgeRunTopbarProfileIconCleanup060Z = cleanupTopbarIcons;
})();
/* FORGEOS:TOPBAR_PROFILE_ICON_CLEANUP_060Z:END */"""
js_path.write_text(replace_block(js, start_js, end_js, js_block))

index = index_path.read_text()
index = index.replace("forge-public-preview-interaction-visual-repair-060m.css?v=060y", "forge-public-preview-interaction-visual-repair-060m.css?v=060z")
index = index.replace("forge-public-preview-interaction-visual-repair-060m.js?v=060y", "forge-public-preview-interaction-visual-repair-060m.js?v=060z")
index_path.write_text(index)
PY
pass "patched redundant topbar profile icons and 060z cache"

say_stage "STAGE 5 WRITE DOCS / EVIDENCE"
cat > docs/architecture/source-truth/FORGE_TOPBAR_PROFILE_ICON_CLEANUP_CLOSURE_060Z.md <<'MD'
# Forge Topbar Profile Icon Cleanup Closure 060Z

DECISION=PASS_060Z_TOPBAR_PROFILE_ICON_CLEANUP_IMPLEMENTATION

NEXT=061A_TOPBAR_PROFILE_ICON_CLEANUP_VISUAL_QA_LOCK

060Z removes the two redundant top-right icons next to the profile avatar in desktop static preview. The top-right profile avatar remains the account entry point.

No real auth, logout, theme persistence, provider execution, CRM, calendar, send, network, or browser persistence is enabled.

## Public URL

`https://jorgeprdz.github.io/ForgeOS/static-preview/forge-alive/?v=060z`

DECISION=PASS_060Z_TOPBAR_PROFILE_ICON_CLEANUP_IMPLEMENTATION

NEXT=061A_TOPBAR_PROFILE_ICON_CLEANUP_VISUAL_QA_LOCK
MD

cat > docs/evidence/FORGE_TOPBAR_PROFILE_ICON_CLEANUP_060Z.md <<'MD'
# Forge Topbar Profile Icon Cleanup 060Z

DECISION=PASS_060Z_TOPBAR_PROFILE_ICON_CLEANUP_IMPLEMENTATION

NEXT=061A_TOPBAR_PROFILE_ICON_CLEANUP_VISUAL_QA_LOCK

060Z addresses the visual QA finding that the two icons next to the `J` profile avatar should no longer exist.

Expected behavior:
- only the `J` profile avatar remains in the top-right account area;
- redundant `!` and settings/gear controls are hidden;
- profile menu behavior remains available from `J`;
- no real account action is executed.

DECISION=PASS_060Z_TOPBAR_PROFILE_ICON_CLEANUP_IMPLEMENTATION

NEXT=061A_TOPBAR_PROFILE_ICON_CLEANUP_VISUAL_QA_LOCK
MD

cat > docs/evidence/FORGE_TOPBAR_PROFILE_ICON_CLEANUP_CERTIFICATE_060Z.md <<'MD'
# Forge Topbar Profile Icon Cleanup Certificate 060Z

DECISION=PASS_060Z_TOPBAR_PROFILE_ICON_CLEANUP_IMPLEMENTATION

NEXT=061A_TOPBAR_PROFILE_ICON_CLEANUP_VISUAL_QA_LOCK

060Z is a scoped static preview visual cleanup. It hides redundant topbar profile-adjacent icons without enabling account, auth, provider, CRM, calendar, send, network, browser persistence, or real engine behavior.
MD
pass "wrote docs / evidence"

say_stage "STAGE 6 UPDATE BUILD TREE / ROADMAP"
sync_body="060Z removes the two redundant top-right icons next to the profile avatar. The \`J\` avatar remains the only account/profile entry point.

Public cache:
\`060z\`

DECISION=PASS_060Z_TOPBAR_PROFILE_ICON_CLEANUP_IMPLEMENTATION

NEXT=061A_TOPBAR_PROFILE_ICON_CLEANUP_VISUAL_QA_LOCK"

append_sync_block "FORGE_MASTER_BUILD_TREE.md" "<!-- FORGEOS:TOPBAR_PROFILE_ICON_CLEANUP_060Z:START -->" "<!-- FORGEOS:TOPBAR_PROFILE_ICON_CLEANUP_060Z:END -->" "$sync_body"
append_sync_block "docs/architecture/source-truth/FORGE_UNIFIED_BUILD_TREE_001.md" "<!-- FORGEOS:TOPBAR_PROFILE_ICON_CLEANUP_060Z:START -->" "<!-- FORGEOS:TOPBAR_PROFILE_ICON_CLEANUP_060Z:END -->" "$sync_body"
append_sync_block "docs/roadmap/FORGE_ROADMAP_LOCK_001.md" "<!-- FORGEOS:TOPBAR_PROFILE_ICON_CLEANUP_060Z:START -->" "<!-- FORGEOS:TOPBAR_PROFILE_ICON_CLEANUP_060Z:END -->" "$sync_body"
pass "updated build tree / roadmap sync blocks"

say_stage "STAGE 7 NORMALIZE FILES"
changed_files=(
  "docs/static-preview/forge-alive/index.html"
  "docs/static-preview/forge-alive/desktop/forge-public-preview-interaction-visual-repair-060m.css"
  "docs/static-preview/forge-alive/desktop/forge-public-preview-interaction-visual-repair-060m.js"
  "FORGE_MASTER_BUILD_TREE.md"
  "docs/architecture/source-truth/FORGE_UNIFIED_BUILD_TREE_001.md"
  "docs/roadmap/FORGE_ROADMAP_LOCK_001.md"
  "docs/architecture/source-truth/FORGE_TOPBAR_PROFILE_ICON_CLEANUP_CLOSURE_060Z.md"
  "docs/evidence/FORGE_TOPBAR_PROFILE_ICON_CLEANUP_060Z.md"
  "docs/evidence/FORGE_TOPBAR_PROFILE_ICON_CLEANUP_CERTIFICATE_060Z.md"
  "tools/termux/forge_060z_topbar_profile_icon_cleanup.sh"
)

for file in "${changed_files[@]}"; do
  normalize_file "$file"
done
pass "normalized EOF and trailing whitespace"

say_stage "STAGE 8 VALIDATION"
run_cmd bash -n tools/termux/forge_060z_topbar_profile_icon_cleanup.sh
run_cmd node --check docs/static-preview/forge-alive/desktop/forge-public-preview-interaction-visual-repair-060m.js
run_cmd rg -n "060z|forge-public-preview-interaction-visual-repair-060m.css|forge-public-preview-interaction-visual-repair-060m.js" docs/static-preview/forge-alive/index.html
run_cmd rg -n "FORGEOS:TOPBAR_PROFILE_ICON_CLEANUP_060Z|data-forge-topbar-redundant-profile-icon-060z|__forgeRunTopbarProfileIconCleanup060Z" docs/static-preview/forge-alive/desktop/forge-public-preview-interaction-visual-repair-060m.css docs/static-preview/forge-alive/desktop/forge-public-preview-interaction-visual-repair-060m.js
run_cmd rg -n "DECISION=PASS_060Z_TOPBAR_PROFILE_ICON_CLEANUP_IMPLEMENTATION|NEXT=061A_TOPBAR_PROFILE_ICON_CLEANUP_VISUAL_QA_LOCK" docs/architecture/source-truth/FORGE_TOPBAR_PROFILE_ICON_CLEANUP_CLOSURE_060Z.md docs/evidence/FORGE_TOPBAR_PROFILE_ICON_CLEANUP_060Z.md docs/evidence/FORGE_TOPBAR_PROFILE_ICON_CLEANUP_CERTIFICATE_060Z.md FORGE_MASTER_BUILD_TREE.md docs/architecture/source-truth/FORGE_UNIFIED_BUILD_TREE_001.md docs/roadmap/FORGE_ROADMAP_LOCK_001.md
run_cmd git diff --check
warn "No package test suite required for scoped topbar visual cleanup"

say_stage "STAGE 9 SAFETY SCAN"
safety_files=(
  "docs/static-preview/forge-alive/index.html"
  "docs/static-preview/forge-alive/desktop/forge-public-preview-interaction-visual-repair-060m.css"
  "docs/static-preview/forge-alive/desktop/forge-public-preview-interaction-visual-repair-060m.js"
  "docs/architecture/source-truth/FORGE_TOPBAR_PROFILE_ICON_CLEANUP_CLOSURE_060Z.md"
  "docs/evidence/FORGE_TOPBAR_PROFILE_ICON_CLEANUP_060Z.md"
  "FORGE_MASTER_BUILD_TREE.md"
  "docs/architecture/source-truth/FORGE_UNIFIED_BUILD_TREE_001.md"
  "docs/roadmap/FORGE_ROADMAP_LOCK_001.md"
)
safety_scan_file="$BACKUP_DIR/safety-scan-060z.txt"

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
warn "Screenshot evidence should be captured after 060Z deploys"

say_stage "STAGE 11 STAGE AUTHORIZED FILES"
allowed_paths=(
  "FORGE_MASTER_BUILD_TREE.md"
  "docs/architecture/source-truth/FORGE_TOPBAR_PROFILE_ICON_CLEANUP_CLOSURE_060Z.md"
  "docs/architecture/source-truth/FORGE_UNIFIED_BUILD_TREE_001.md"
  "docs/evidence/FORGE_TOPBAR_PROFILE_ICON_CLEANUP_060Z.md"
  "docs/evidence/FORGE_TOPBAR_PROFILE_ICON_CLEANUP_CERTIFICATE_060Z.md"
  "docs/roadmap/FORGE_ROADMAP_LOCK_001.md"
  "docs/static-preview/forge-alive/index.html"
  "docs/static-preview/forge-alive/desktop/forge-public-preview-interaction-visual-repair-060m.css"
  "docs/static-preview/forge-alive/desktop/forge-public-preview-interaction-visual-repair-060m.js"
  "tools/termux/forge_060z_topbar_profile_icon_cleanup.sh"
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
run_cmd git commit -m "fix: remove redundant topbar profile icons"
run_cmd git push origin HEAD:main

say_stage "STAGE 13 FINAL CHECKPOINT"
run_cmd git status --short --branch
run_cmd git log --oneline -10

say_stage "FINAL DECISION"
printf "PASS_060Z_TOPBAR_PROFILE_ICON_CLEANUP_IMPLEMENTATION_COMMIT_PUSH_COMPLETE\n"
printf "NEXT=061A_TOPBAR_PROFILE_ICON_CLEANUP_VISUAL_QA_LOCK\n"
printf "BACKUP=%s\n" "$BACKUP_DIR"
printf "ROLLBACK=%s\n" "$BACKUP_DIR/rollback-060z.sh"
printf "Reporte: %s\n" "$REPORT"
autocopy_report
