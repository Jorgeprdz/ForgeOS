#!/usr/bin/env bash
set -euo pipefail

PHASE="060Y_PROFILE_MENU_PREP_SIDEBAR_IDENTITY_REPAIR_IMPLEMENTATION"
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
  local rollback="$BACKUP_DIR/rollback-060y.sh"
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
    local archive=".forge-backups/rollback-archives/$(basename "$file").060y.$(date +%Y%m%d_%H%M%S)"
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
restore_or_archive "docs/architecture/source-truth/FORGE_PROFILE_MENU_PREP_SIDEBAR_IDENTITY_REPAIR_CLOSURE_060Y.md"
restore_or_archive "docs/evidence/FORGE_PROFILE_MENU_PREP_SIDEBAR_IDENTITY_REPAIR_060Y.md"
restore_or_archive "docs/evidence/FORGE_PROFILE_MENU_PREP_SIDEBAR_IDENTITY_REPAIR_CERTIFICATE_060Y.md"
restore_or_archive "tools/termux/forge_060y_profile_menu_prep_sidebar_identity_repair.sh"

echo "rollback 060Y complete"
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
printf "MODE=scoped static preview profile menu prep and sidebar identity repair implementation\n"
printf "BOUNDARY=static preview account UI only; no auth; no CRM; no calendar; no send; no runtime/network/storage; no provider execution; no real engine execution\n"
printf "REPORT=%s\n" "$REPORT"

say_stage "STAGE 1 CHECKPOINT"
cd "$REPO" || fail "repo not found: $REPO"
run_cmd git status --short --branch
run_cmd git log --oneline -10
run_cmd git diff --name-status
run_cmd git diff --cached --name-status

if [[ -n "$(git diff --name-only)" || -n "$(git diff --cached --name-only)" ]]; then
  hold "tracked worktree has unstaged or staged changes; refusing to mix 060Y with unrelated edits"
fi

say_stage "STAGE 2 REQUIRED FILE CHECK"
required_files=(
  "docs/static-preview/forge-alive/index.html"
  "docs/static-preview/forge-alive/desktop/forge-public-preview-interaction-visual-repair-060m.css"
  "docs/static-preview/forge-alive/desktop/forge-public-preview-interaction-visual-repair-060m.js"
  "docs/architecture/source-truth/FORGE_COMMAND_BAR_QUICK_ACTIONS_PLACEHOLDER_CLOSURE_060X.md"
  "docs/evidence/FORGE_COMMAND_BAR_QUICK_ACTIONS_PLACEHOLDER_060X.md"
  "FORGE_MASTER_BUILD_TREE.md"
  "docs/architecture/source-truth/FORGE_UNIFIED_BUILD_TREE_001.md"
  "docs/roadmap/FORGE_ROADMAP_LOCK_001.md"
)

for file in "${required_files[@]}"; do
  require_file "$file"
done

say_stage "STAGE 3 BACKUP"
BACKUP_DIR=".forge-backups/060y-profile-menu-prep-sidebar-identity-repair-$(date +%Y%m%d_%H%M%S)"
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
cp "$SCRIPT_SOURCE" "tools/termux/forge_060y_profile_menu_prep_sidebar_identity_repair.sh"
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
start = "/* FORGEOS:PROFILE_MENU_PREP_SIDEBAR_IDENTITY_REPAIR_060Y:START */"
end = "/* FORGEOS:PROFILE_MENU_PREP_SIDEBAR_IDENTITY_REPAIR_060Y:END */"
css_block = """/* FORGEOS:PROFILE_MENU_PREP_SIDEBAR_IDENTITY_REPAIR_060Y:START */
@media (min-width: 901px) {
  [data-forge-sidebar-profile-footer-060y="true"] {
    display: none !important;
    height: 0 !important;
    min-height: 0 !important;
    margin: 0 !important;
    padding: 0 !important;
    border: 0 !important;
    opacity: 0 !important;
    overflow: hidden !important;
    pointer-events: none !important;
  }

  [data-forge-profile-anchor-060y="true"] {
    cursor: pointer !important;
    position: relative !important;
    z-index: 80 !important;
    outline: 0 !important;
  }

  [data-forge-profile-anchor-060y="true"]:focus-visible {
    box-shadow: 0 0 0 3px rgba(139, 232, 255, 0.28) !important;
  }

  .forge-profile-menu-060y {
    position: fixed;
    top: var(--forge-profile-menu-top-060y, 86px);
    right: var(--forge-profile-menu-right-060y, 34px);
    width: 274px;
    padding: 12px;
    border: 1px solid rgba(139, 232, 255, 0.18);
    border-radius: 18px;
    background: rgba(7, 16, 27, 0.94);
    box-shadow: 0 24px 70px rgba(0, 0, 0, 0.46), inset 0 1px 0 rgba(255, 255, 255, 0.08);
    color: rgba(246, 249, 255, 0.96);
    z-index: 120;
    backdrop-filter: blur(18px);
  }

  .forge-profile-menu-060y[hidden] {
    display: none !important;
  }

  .forge-profile-menu-060y__head {
    display: grid;
    grid-template-columns: 46px 1fr;
    gap: 10px;
    align-items: center;
    padding: 4px 4px 12px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  }

  .forge-profile-menu-060y__avatar {
    width: 44px;
    height: 44px;
    border-radius: 999px;
    display: grid;
    place-items: center;
    font-weight: 900;
    color: #121621;
    background: var(--forge-google-profile-image-060y, linear-gradient(135deg, #fff2a8, #6ee7f9));
    overflow: hidden;
  }

  .forge-profile-menu-060y__name {
    font-weight: 850;
    font-size: 14px;
    line-height: 1.15;
  }

  .forge-profile-menu-060y__role,
  .forge-profile-menu-060y__status {
    color: rgba(220, 230, 244, 0.68);
    font-size: 12px;
    line-height: 1.25;
  }

  .forge-profile-menu-060y__actions {
    display: grid;
    gap: 6px;
    padding-top: 10px;
  }

  .forge-profile-menu-060y__action {
    width: 100%;
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 12px;
    padding: 10px 11px;
    background: rgba(255, 255, 255, 0.045);
    color: rgba(246, 249, 255, 0.92);
    text-align: left;
    font: inherit;
    font-weight: 750;
    cursor: pointer;
  }

  .forge-profile-menu-060y__action:hover,
  .forge-profile-menu-060y__action:focus-visible {
    background: rgba(139, 232, 255, 0.12);
    border-color: rgba(139, 232, 255, 0.22);
    outline: 0;
  }

  .forge-profile-menu-060y__status {
    min-height: 18px;
    padding: 8px 4px 2px;
  }
}
/* FORGEOS:PROFILE_MENU_PREP_SIDEBAR_IDENTITY_REPAIR_060Y:END */"""
css_path.write_text(replace_block(css, start, end, css_block))

js = js_path.read_text()
start_js = "/* FORGEOS:PROFILE_MENU_PREP_SIDEBAR_IDENTITY_REPAIR_060Y:START */"
end_js = "/* FORGEOS:PROFILE_MENU_PREP_SIDEBAR_IDENTITY_REPAIR_060Y:END */"
js_block = """/* FORGEOS:PROFILE_MENU_PREP_SIDEBAR_IDENTITY_REPAIR_060Y:START */
(function () {
  "use strict";

  var MENU_ID = "forge-profile-menu-060y";

  function textOf(node) {
    if (!node) {
      return "";
    }
    return String(node.textContent || node.value || node.getAttribute("aria-label") || "").trim();
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
    var existing = document.querySelector("[data-forge-profile-anchor-060y='true']");
    if (existing) {
      return existing;
    }
    var nodes = Array.prototype.slice.call(document.querySelectorAll("button, [role='button'], a, div, span"));
    var matches = nodes.filter(function (node) {
      var rect = visibleRect(node);
      var text = textOf(node);
      if (!rect || text !== "J") {
        return false;
      }
      return rect.top < 170 && rect.left > Math.max(640, window.innerWidth * 0.68) && rect.width >= 34 && rect.width <= 78 && rect.height >= 34 && rect.height <= 78;
    });
    matches.sort(function (a, b) {
      var ar = visibleRect(a);
      var br = visibleRect(b);
      return (br.left + br.top) - (ar.left + ar.top);
    });
    return matches[0] || null;
  }

  function hideSidebarIdentity() {
    var nodes = Array.prototype.slice.call(document.querySelectorAll("aside *, nav *, [class*='side'] *, [class*='rail'] *"));
    var candidates = nodes.filter(function (node) {
      var text = textOf(node);
      if (text.indexOf("Jorge") === -1 || text.indexOf("Asesor financiero") === -1) {
        return false;
      }
      var rect = visibleRect(node);
      return rect && rect.left < 360 && rect.top > 260 && rect.width < 340 && rect.height < 180;
    });
    candidates.sort(function (a, b) {
      var ar = visibleRect(a);
      var br = visibleRect(b);
      return (ar.width * ar.height) - (br.width * br.height);
    });
    var target = candidates[0];
    if (target && !target.closest("#" + MENU_ID)) {
      target.setAttribute("data-forge-sidebar-profile-footer-060y", "true");
      target.setAttribute("aria-hidden", "true");
    }
  }

  function profileMenu() {
    var menu = document.getElementById(MENU_ID);
    if (menu) {
      return menu;
    }
    menu = document.createElement("div");
    menu.id = MENU_ID;
    menu.className = "forge-profile-menu-060y";
    menu.hidden = true;
    menu.setAttribute("role", "menu");
    menu.setAttribute("aria-label", "Menu de perfil");
    menu.innerHTML =
      '<div class="forge-profile-menu-060y__head">' +
        '<div class="forge-profile-menu-060y__avatar" data-forge-google-profile-ready-060y="true">J</div>' +
        '<div>' +
          '<div class="forge-profile-menu-060y__name">Jorge Fernandez</div>' +
          '<div class="forge-profile-menu-060y__role">Asesor financiero</div>' +
        '</div>' +
      '</div>' +
      '<div class="forge-profile-menu-060y__actions">' +
        '<button class="forge-profile-menu-060y__action" type="button" role="menuitem" data-forge-profile-action-060y="theme">Cambiar tema</button>' +
        '<button class="forge-profile-menu-060y__action" type="button" role="menuitem" data-forge-profile-action-060y="options">Opciones</button>' +
        '<button class="forge-profile-menu-060y__action" type="button" role="menuitem" data-forge-profile-action-060y="logout">Cerrar sesion</button>' +
      '</div>' +
      '<div class="forge-profile-menu-060y__status" aria-live="polite">Vista estatica segura</div>';
    document.body.appendChild(menu);
    return menu;
  }

  function placeMenu(anchor, menu) {
    var rect = visibleRect(anchor);
    if (!rect) {
      return;
    }
    var right = Math.max(18, Math.round(window.innerWidth - rect.right));
    var top = Math.round(rect.bottom + 12);
    menu.style.setProperty("--forge-profile-menu-right-060y", right + "px");
    menu.style.setProperty("--forge-profile-menu-top-060y", top + "px");
  }

  function setStatus(menu, text) {
    var status = menu.querySelector(".forge-profile-menu-060y__status");
    if (status) {
      status.textContent = text;
    }
  }

  function bindMenu(anchor, menu) {
    if (anchor.getAttribute("data-forge-profile-bound-060y") === "true") {
      return;
    }
    anchor.setAttribute("data-forge-profile-bound-060y", "true");
    anchor.setAttribute("data-forge-profile-anchor-060y", "true");
    anchor.setAttribute("role", "button");
    anchor.setAttribute("tabindex", "0");
    anchor.setAttribute("aria-haspopup", "menu");
    anchor.setAttribute("aria-expanded", "false");
    anchor.setAttribute("aria-controls", MENU_ID);
    anchor.setAttribute("title", "Perfil y opciones");

    function openMenu() {
      placeMenu(anchor, menu);
      menu.hidden = false;
      anchor.setAttribute("aria-expanded", "true");
    }

    function closeMenu() {
      menu.hidden = true;
      anchor.setAttribute("aria-expanded", "false");
    }

    function toggleMenu(event) {
      if (event) {
        event.preventDefault();
        event.stopPropagation();
      }
      if (menu.hidden) {
        openMenu();
      } else {
        closeMenu();
      }
    }

    anchor.addEventListener("click", toggleMenu);
    anchor.addEventListener("keydown", function (event) {
      if (event.key === "Enter" || event.key === " ") {
        toggleMenu(event);
      }
      if (event.key === "Escape") {
        closeMenu();
      }
    });
    document.addEventListener("click", function (event) {
      if (menu.hidden) {
        return;
      }
      if (event.target === anchor || anchor.contains(event.target) || menu.contains(event.target)) {
        return;
      }
      closeMenu();
    });
    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape") {
        closeMenu();
      }
    });
    window.addEventListener("resize", function () {
      if (!menu.hidden) {
        placeMenu(anchor, menu);
      }
    });

    Array.prototype.slice.call(menu.querySelectorAll("[data-forge-profile-action-060y]")).forEach(function (button) {
      button.addEventListener("click", function () {
        var action = button.getAttribute("data-forge-profile-action-060y");
        if (action === "theme") {
          setStatus(menu, "Cambio de tema preparado en preview.");
        } else if (action === "options") {
          setStatus(menu, "Opciones preparadas para cuenta.");
        } else if (action === "logout") {
          setStatus(menu, "Cerrar sesion requiere autenticacion real.");
        }
      });
    });
  }

  function runProfileRepair() {
    hideSidebarIdentity();
    var anchor = findProfileAnchor();
    if (!anchor) {
      return;
    }
    var menu = profileMenu();
    bindMenu(anchor, menu);
    document.documentElement.setAttribute("data-forge-profile-menu-ready-060y", "true");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", runProfileRepair, { once: true });
  } else {
    runProfileRepair();
  }
  window.addEventListener("load", runProfileRepair);
  window.__forgeRunProfileMenuPrepSidebarIdentityRepair060Y = runProfileRepair;
})();
/* FORGEOS:PROFILE_MENU_PREP_SIDEBAR_IDENTITY_REPAIR_060Y:END */"""
js_path.write_text(replace_block(js, start_js, end_js, js_block))

index = index_path.read_text()
index = index.replace("forge-public-preview-interaction-visual-repair-060m.css?v=060x", "forge-public-preview-interaction-visual-repair-060m.css?v=060y")
index = index.replace("forge-public-preview-interaction-visual-repair-060m.js?v=060x", "forge-public-preview-interaction-visual-repair-060m.js?v=060y")
index_path.write_text(index)
PY
pass "patched profile menu prep, sidebar identity repair, and 060y cache"

say_stage "STAGE 5 WRITE DOCS / EVIDENCE"
cat > docs/architecture/source-truth/FORGE_PROFILE_MENU_PREP_SIDEBAR_IDENTITY_REPAIR_CLOSURE_060Y.md <<'MD'
# Forge Profile Menu Prep Sidebar Identity Repair Closure 060Y

DECISION=PASS_060Y_PROFILE_MENU_PREP_SIDEBAR_IDENTITY_REPAIR_IMPLEMENTATION

NEXT=060Z_PROFILE_MENU_PREP_VISUAL_QA_LOCK

060Y moves profile ownership to the top-right `J` avatar area. The low sidebar identity footer is hidden on desktop, and the top avatar is prepared for a future Google profile image plus safe preview menu actions.

No real auth, logout, theme persistence, provider execution, CRM, calendar, send, network, or browser persistence is enabled.

## Public URL

`https://jorgeprdz.github.io/ForgeOS/static-preview/forge-alive/?v=060y`

DECISION=PASS_060Y_PROFILE_MENU_PREP_SIDEBAR_IDENTITY_REPAIR_IMPLEMENTATION

NEXT=060Z_PROFILE_MENU_PREP_VISUAL_QA_LOCK
MD

cat > docs/evidence/FORGE_PROFILE_MENU_PREP_SIDEBAR_IDENTITY_REPAIR_060Y.md <<'MD'
# Forge Profile Menu Prep Sidebar Identity Repair 060Y

DECISION=PASS_060Y_PROFILE_MENU_PREP_SIDEBAR_IDENTITY_REPAIR_IMPLEMENTATION

NEXT=060Z_PROFILE_MENU_PREP_VISUAL_QA_LOCK

060Y addresses the visual issue where `Jorge Fernandez` appeared too low in the sidebar. It hides that low footer on desktop and prepares the top-right `J` avatar as the account entry point.

Expected behavior:
- sidebar no longer shows the low `Jorge Fernandez` profile footer;
- top-right `J` opens a safe preview profile menu;
- menu includes `Cambiar tema`, `Opciones`, and `Cerrar sesion`;
- avatar is marked ready for a future Google profile image;
- no real account action is executed.

DECISION=PASS_060Y_PROFILE_MENU_PREP_SIDEBAR_IDENTITY_REPAIR_IMPLEMENTATION

NEXT=060Z_PROFILE_MENU_PREP_VISUAL_QA_LOCK
MD

cat > docs/evidence/FORGE_PROFILE_MENU_PREP_SIDEBAR_IDENTITY_REPAIR_CERTIFICATE_060Y.md <<'MD'
# Forge Profile Menu Prep Sidebar Identity Repair Certificate 060Y

DECISION=PASS_060Y_PROFILE_MENU_PREP_SIDEBAR_IDENTITY_REPAIR_IMPLEMENTATION

NEXT=060Z_PROFILE_MENU_PREP_VISUAL_QA_LOCK

060Y is a scoped static preview account UI repair. It does not enable authentication, provider execution, real logout, CRM, calendar, send, network, browser persistence, or real engine behavior.
MD
pass "wrote docs / evidence"

say_stage "STAGE 6 UPDATE BUILD TREE / ROADMAP"
sync_body="060Y moves account/profile ownership to the top-right \`J\` avatar menu, hides the low desktop sidebar identity footer, and prepares the avatar for a future Google profile image.

Public cache:
\`060y\`

DECISION=PASS_060Y_PROFILE_MENU_PREP_SIDEBAR_IDENTITY_REPAIR_IMPLEMENTATION

NEXT=060Z_PROFILE_MENU_PREP_VISUAL_QA_LOCK"

append_sync_block "FORGE_MASTER_BUILD_TREE.md" "<!-- FORGEOS:PROFILE_MENU_PREP_SIDEBAR_IDENTITY_REPAIR_060Y:START -->" "<!-- FORGEOS:PROFILE_MENU_PREP_SIDEBAR_IDENTITY_REPAIR_060Y:END -->" "$sync_body"
append_sync_block "docs/architecture/source-truth/FORGE_UNIFIED_BUILD_TREE_001.md" "<!-- FORGEOS:PROFILE_MENU_PREP_SIDEBAR_IDENTITY_REPAIR_060Y:START -->" "<!-- FORGEOS:PROFILE_MENU_PREP_SIDEBAR_IDENTITY_REPAIR_060Y:END -->" "$sync_body"
append_sync_block "docs/roadmap/FORGE_ROADMAP_LOCK_001.md" "<!-- FORGEOS:PROFILE_MENU_PREP_SIDEBAR_IDENTITY_REPAIR_060Y:START -->" "<!-- FORGEOS:PROFILE_MENU_PREP_SIDEBAR_IDENTITY_REPAIR_060Y:END -->" "$sync_body"
pass "updated build tree / roadmap sync blocks"

say_stage "STAGE 7 NORMALIZE FILES"
changed_files=(
  "docs/static-preview/forge-alive/index.html"
  "docs/static-preview/forge-alive/desktop/forge-public-preview-interaction-visual-repair-060m.css"
  "docs/static-preview/forge-alive/desktop/forge-public-preview-interaction-visual-repair-060m.js"
  "FORGE_MASTER_BUILD_TREE.md"
  "docs/architecture/source-truth/FORGE_UNIFIED_BUILD_TREE_001.md"
  "docs/roadmap/FORGE_ROADMAP_LOCK_001.md"
  "docs/architecture/source-truth/FORGE_PROFILE_MENU_PREP_SIDEBAR_IDENTITY_REPAIR_CLOSURE_060Y.md"
  "docs/evidence/FORGE_PROFILE_MENU_PREP_SIDEBAR_IDENTITY_REPAIR_060Y.md"
  "docs/evidence/FORGE_PROFILE_MENU_PREP_SIDEBAR_IDENTITY_REPAIR_CERTIFICATE_060Y.md"
  "tools/termux/forge_060y_profile_menu_prep_sidebar_identity_repair.sh"
)

for file in "${changed_files[@]}"; do
  normalize_file "$file"
done
pass "normalized EOF and trailing whitespace"

say_stage "STAGE 8 VALIDATION"
run_cmd bash -n tools/termux/forge_060y_profile_menu_prep_sidebar_identity_repair.sh
run_cmd node --check docs/static-preview/forge-alive/desktop/forge-public-preview-interaction-visual-repair-060m.js
run_cmd rg -n "060y|forge-public-preview-interaction-visual-repair-060m.css|forge-public-preview-interaction-visual-repair-060m.js" docs/static-preview/forge-alive/index.html
run_cmd rg -n "FORGEOS:PROFILE_MENU_PREP_SIDEBAR_IDENTITY_REPAIR_060Y|forge-profile-menu-060y|data-forge-google-profile-ready-060y|data-forge-sidebar-profile-footer-060y|__forgeRunProfileMenuPrepSidebarIdentityRepair060Y" docs/static-preview/forge-alive/desktop/forge-public-preview-interaction-visual-repair-060m.css docs/static-preview/forge-alive/desktop/forge-public-preview-interaction-visual-repair-060m.js
run_cmd rg -n "DECISION=PASS_060Y_PROFILE_MENU_PREP_SIDEBAR_IDENTITY_REPAIR_IMPLEMENTATION|NEXT=060Z_PROFILE_MENU_PREP_VISUAL_QA_LOCK" docs/architecture/source-truth/FORGE_PROFILE_MENU_PREP_SIDEBAR_IDENTITY_REPAIR_CLOSURE_060Y.md docs/evidence/FORGE_PROFILE_MENU_PREP_SIDEBAR_IDENTITY_REPAIR_060Y.md docs/evidence/FORGE_PROFILE_MENU_PREP_SIDEBAR_IDENTITY_REPAIR_CERTIFICATE_060Y.md FORGE_MASTER_BUILD_TREE.md docs/architecture/source-truth/FORGE_UNIFIED_BUILD_TREE_001.md docs/roadmap/FORGE_ROADMAP_LOCK_001.md
run_cmd git diff --check
warn "No package test suite required for scoped static preview account UI repair"

say_stage "STAGE 9 SAFETY SCAN"
safety_files=(
  "docs/static-preview/forge-alive/index.html"
  "docs/static-preview/forge-alive/desktop/forge-public-preview-interaction-visual-repair-060m.css"
  "docs/static-preview/forge-alive/desktop/forge-public-preview-interaction-visual-repair-060m.js"
  "docs/architecture/source-truth/FORGE_PROFILE_MENU_PREP_SIDEBAR_IDENTITY_REPAIR_CLOSURE_060Y.md"
  "docs/evidence/FORGE_PROFILE_MENU_PREP_SIDEBAR_IDENTITY_REPAIR_060Y.md"
  "FORGE_MASTER_BUILD_TREE.md"
  "docs/architecture/source-truth/FORGE_UNIFIED_BUILD_TREE_001.md"
  "docs/roadmap/FORGE_ROADMAP_LOCK_001.md"
)
safety_scan_file="$BACKUP_DIR/safety-scan-060y.txt"

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
warn "Screenshot evidence should be captured after 060Y deploys"

say_stage "STAGE 11 STAGE AUTHORIZED FILES"
allowed_paths=(
  "FORGE_MASTER_BUILD_TREE.md"
  "docs/architecture/source-truth/FORGE_PROFILE_MENU_PREP_SIDEBAR_IDENTITY_REPAIR_CLOSURE_060Y.md"
  "docs/architecture/source-truth/FORGE_UNIFIED_BUILD_TREE_001.md"
  "docs/evidence/FORGE_PROFILE_MENU_PREP_SIDEBAR_IDENTITY_REPAIR_060Y.md"
  "docs/evidence/FORGE_PROFILE_MENU_PREP_SIDEBAR_IDENTITY_REPAIR_CERTIFICATE_060Y.md"
  "docs/roadmap/FORGE_ROADMAP_LOCK_001.md"
  "docs/static-preview/forge-alive/index.html"
  "docs/static-preview/forge-alive/desktop/forge-public-preview-interaction-visual-repair-060m.css"
  "docs/static-preview/forge-alive/desktop/forge-public-preview-interaction-visual-repair-060m.js"
  "tools/termux/forge_060y_profile_menu_prep_sidebar_identity_repair.sh"
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
run_cmd git commit -m "feat: prepare profile menu actions"
run_cmd git push origin HEAD:main

say_stage "STAGE 13 FINAL CHECKPOINT"
run_cmd git status --short --branch
run_cmd git log --oneline -10

say_stage "FINAL DECISION"
printf "PASS_060Y_PROFILE_MENU_PREP_SIDEBAR_IDENTITY_REPAIR_IMPLEMENTATION_COMMIT_PUSH_COMPLETE\n"
printf "NEXT=060Z_PROFILE_MENU_PREP_VISUAL_QA_LOCK\n"
printf "BACKUP=%s\n" "$BACKUP_DIR"
printf "ROLLBACK=%s\n" "$BACKUP_DIR/rollback-060y.sh"
printf "Reporte: %s\n" "$REPORT"
autocopy_report
