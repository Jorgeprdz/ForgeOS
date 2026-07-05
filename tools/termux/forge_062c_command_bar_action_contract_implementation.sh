#!/usr/bin/env bash
set -euo pipefail

PHASE="062C_COMMAND_BAR_ACTION_CONTRACT_IMPLEMENTATION"
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
  local rollback="$BACKUP_DIR/rollback-062c.sh"
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
    local archive=".forge-backups/rollback-archives/$(basename "$file").062c.$(date +%Y%m%d_%H%M%S)"
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
restore_or_archive "docs/architecture/source-truth/FORGE_COMMAND_BAR_ACTION_CONTRACT_IMPLEMENTATION_CLOSURE_062C.md"
restore_or_archive "docs/evidence/FORGE_COMMAND_BAR_ACTION_CONTRACT_IMPLEMENTATION_062C.md"
restore_or_archive "docs/evidence/FORGE_COMMAND_BAR_ACTION_CONTRACT_IMPLEMENTATION_CERTIFICATE_062C.md"
restore_or_archive "docs/evidence/forge-command-bar-action-contract-audit-062c.json"
restore_or_archive "tools/termux/forge_062c_command_bar_action_contract_implementation.sh"

echo "rollback 062C complete"
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
printf "MODE=preview-safe command bar action contract implementation\n"
printf "BOUNDARY=static preview contract implementation only; no CRM; no calendar; no send; no auth; no runtime/network/storage; no provider execution; no real engine execution\n"
printf "REPORT=%s\n" "$REPORT"

say_stage "STAGE 1 CHECKPOINT"
cd "$REPO" || fail "repo not found: $REPO"
run_cmd git status --short --branch
run_cmd git log --oneline -10
run_cmd git diff --name-status
run_cmd git diff --cached --name-status

if [[ -n "$(git diff --name-only)" || -n "$(git diff --cached --name-only)" ]]; then
  hold "tracked worktree has unstaged or staged changes; refusing to implement 062C over a moving target"
fi

say_stage "STAGE 2 REQUIRED FILE CHECK"
required_files=(
  "docs/static-preview/forge-alive/index.html"
  "docs/static-preview/forge-alive/desktop/forge-public-preview-interaction-visual-repair-060m.css"
  "docs/static-preview/forge-alive/desktop/forge-public-preview-interaction-visual-repair-060m.js"
  "docs/architecture/source-truth/FORGE_READ_MODEL_UNIFICATION_SCOPE_062B.md"
  "docs/evidence/FORGE_READ_MODEL_UNIFICATION_SCOPE_062B.md"
  "docs/evidence/forge-read-model-unification-scope-audit-062b.json"
  "FORGE_MASTER_BUILD_TREE.md"
  "docs/architecture/source-truth/FORGE_UNIFIED_BUILD_TREE_001.md"
  "docs/roadmap/FORGE_ROADMAP_LOCK_001.md"
)

for file in "${required_files[@]}"; do
  require_file "$file"
done

say_stage "STAGE 3 BACKUP"
BACKUP_DIR=".forge-backups/062c-command-bar-action-contract-$(date +%Y%m%d_%H%M%S)"
mkdir -p "$BACKUP_DIR"
for file in "${required_files[@]}"; do
  backup_file "$file"
done
write_rollback

say_stage "STAGE 4 APPLY CHANGES"
mkdir -p tools/termux docs/architecture/source-truth docs/evidence
SCRIPT_SOURCE="$0"
if [[ -n "${BASH_SOURCE+x}" && -n "${BASH_SOURCE[0]:-}" ]]; then
  SCRIPT_SOURCE="${BASH_SOURCE[0]}"
fi
if [[ ! -f "$SCRIPT_SOURCE" ]]; then
  fail "runner source not found: $SCRIPT_SOURCE"
fi
cp "$SCRIPT_SOURCE" "tools/termux/forge_062c_command_bar_action_contract_implementation.sh"
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
css_block = """/* FORGEOS:COMMAND_BAR_ACTION_CONTRACT_IMPLEMENTATION_062C:START */
@media (min-width: 901px) {
  .forge-contract-results-062c {
    position: absolute;
    left: var(--forge-contract-left-062c, 32px);
    right: var(--forge-contract-right-062c, 32px);
    top: var(--forge-contract-top-062c, calc(100% + 10px));
    z-index: 120;
    display: grid;
    gap: 8px;
    max-height: min(360px, 48vh);
    overflow: auto;
    padding: 10px;
    border: 1px solid rgba(139, 232, 255, 0.22);
    border-radius: 18px;
    background: linear-gradient(180deg, rgba(8, 20, 34, 0.98), rgba(4, 11, 20, 0.96));
    box-shadow:
      0 30px 90px rgba(0, 0, 0, 0.5),
      0 0 0 1px rgba(255, 255, 255, 0.04),
      inset 0 1px 0 rgba(255, 255, 255, 0.09);
  }

  .forge-contract-results-062c[hidden] {
    display: none !important;
  }

  .forge-contract-result-062c {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    align-items: center;
    gap: 12px;
    width: 100%;
    padding: 12px 14px;
    border: 1px solid rgba(139, 232, 255, 0.12);
    border-radius: 13px;
    color: rgba(245, 250, 255, 0.94);
    background: rgba(255, 255, 255, 0.045);
    text-align: left;
    cursor: pointer;
  }

  .forge-contract-result-062c:hover,
  .forge-contract-result-062c[aria-selected="true"] {
    border-color: rgba(255, 220, 122, 0.38);
    background: rgba(255, 220, 122, 0.09);
  }

  .forge-contract-result-062c__title {
    font-weight: 800;
    letter-spacing: 0;
  }

  .forge-contract-result-062c__subtitle {
    margin-top: 3px;
    color: rgba(214, 226, 238, 0.72);
    font-size: 0.86rem;
    line-height: 1.35;
  }

  .forge-contract-result-062c__status {
    justify-self: end;
    border: 1px solid rgba(139, 232, 255, 0.18);
    border-radius: 999px;
    padding: 5px 8px;
    color: rgba(155, 238, 255, 0.88);
    background: rgba(139, 232, 255, 0.08);
    font-size: 0.72rem;
    font-weight: 800;
    text-transform: uppercase;
  }

  .forge-contract-preview-status-062c {
    margin: 8px 38px 0;
    color: rgba(214, 226, 238, 0.68);
    font-size: 0.82rem;
    line-height: 1.35;
  }

  [data-forge-contract-panel-active-062c="true"] .dw-command-results-056y:not(.forge-contract-results-062c) {
    display: none !important;
  }
}
/* FORGEOS:COMMAND_BAR_ACTION_CONTRACT_IMPLEMENTATION_062C:END */"""
css = replace_block(
    css,
    "/* FORGEOS:COMMAND_BAR_ACTION_CONTRACT_IMPLEMENTATION_062C:START */",
    "/* FORGEOS:COMMAND_BAR_ACTION_CONTRACT_IMPLEMENTATION_062C:END */",
    css_block,
)
css_path.write_text(css)

js = js_path.read_text()
js_block = r'''/* FORGEOS:COMMAND_BAR_ACTION_CONTRACT_IMPLEMENTATION_062C:START */
(function () {
  "use strict";

  var READ_MODEL = {
    modelName: "forge.alive.workspace.read_model.v1",
    workspace: {
      workspaceId: "forge-alive-static-command-preview",
      workspaceName: "Mi dia",
      surface: "desktop.command_workspace",
      mode: "static_preview",
      ownerDisplayName: "Jorge Fernandez"
    },
    previewPolicy: {
      requiresHumanApproval: true,
      externalEffectsAllowed: false,
      recordMutationAllowed: false,
      scheduleMutationAllowed: false,
      messageDeliveryAllowed: false,
      providerExecutionAllowed: false
    },
    actionRegistry: [
      {
        actionId: "command.quick_actions",
        label: "/quick actions",
        aliases: ["/", "/quick", "/quick actions", "acciones"],
        contractStatus: "preview_only",
        sourceModule: "command_bar",
        requiresHumanApproval: false,
        previewOnly: true,
        blockedReasonIds: ["preview_only_boundary"]
      },
      {
        actionId: "report.prepare_preview",
        label: "Preparar preview",
        aliases: ["preparar", "preview", "reporte"],
        contractStatus: "needs_approval",
        sourceModule: "reportes",
        requiresHumanApproval: true,
        previewOnly: true,
        blockedReasonIds: ["approval_required"]
      },
      {
        actionId: "opportunity.review",
        label: "Revisar oportunidad",
        aliases: ["revisar", "review", "lariza"],
        contractStatus: "preview_only",
        sourceModule: "pipeline",
        requiresHumanApproval: false,
        previewOnly: true,
        blockedReasonIds: ["preview_only_boundary"]
      },
      {
        actionId: "client.follow_preview",
        label: "Preparar follow",
        aliases: ["follow", "/follow", "seguimiento"],
        contractStatus: "needs_approval",
        sourceModule: "clientes",
        requiresHumanApproval: true,
        previewOnly: true,
        blockedReasonIds: ["approval_required"]
      },
      {
        actionId: "quote.prepare_preview",
        label: "Preparar cotizacion",
        aliases: ["cotizar", "/cotizar", "cotizacion"],
        contractStatus: "needs_approval",
        sourceModule: "cotizaciones",
        requiresHumanApproval: true,
        previewOnly: true,
        blockedReasonIds: ["approval_required"]
      },
      {
        actionId: "record.open_preview",
        label: "Abrir detalle",
        aliases: ["abrir", "detalle", "open"],
        contractStatus: "preview_only",
        sourceModule: "workspace",
        requiresHumanApproval: false,
        previewOnly: true,
        blockedReasonIds: ["preview_only_boundary"]
      }
    ],
    commandCatalog: [
      {
        commandId: "quick-actions",
        actionId: "command.quick_actions",
        title: "/quick actions",
        subtitle: "Lista acciones preview-safe disponibles para este workspace.",
        tokens: ["/", "/quick", "quick", "actions", "acciones"],
        targetType: "workspace",
        targetId: "forge-alive-static-command-preview"
      },
      {
        commandId: "prepare-report-preview",
        actionId: "report.prepare_preview",
        title: "Preparar preview",
        subtitle: "Construye un resumen revisable sin ejecutar efectos reales.",
        tokens: ["preparar", "preview", "reporte", "alfred"],
        targetType: "workspace",
        targetId: "forge-alive-static-command-preview"
      },
      {
        commandId: "review-lariza",
        actionId: "opportunity.review",
        title: "Revisar Lariza",
        subtitle: "Abre detalle local de oportunidad y riesgo.",
        tokens: ["revisar", "review", "lariza", "oportunidad"],
        targetType: "opportunity",
        targetId: "opp-lariza-gmm"
      },
      {
        commandId: "follow-juan",
        actionId: "client.follow_preview",
        title: "/follow Juan",
        subtitle: "Prepara seguimiento con aprobacion humana requerida.",
        tokens: ["follow", "/follow", "juan", "seguimiento"],
        targetType: "client",
        targetId: "client-juan"
      },
      {
        commandId: "quote-lariza",
        actionId: "quote.prepare_preview",
        title: "/cotizar GMM Lariza",
        subtitle: "Prepara workspace de cotizacion sin emitir documentos.",
        tokens: ["cotizar", "/cotizar", "cotizacion", "gmm", "lariza"],
        targetType: "opportunity",
        targetId: "opp-lariza-gmm"
      },
      {
        commandId: "open-octavio",
        actionId: "record.open_preview",
        title: "Abrir Octavio",
        subtitle: "Abre detalle local del registro en modo preview.",
        tokens: ["abrir", "open", "octavio", "detalle"],
        targetType: "client",
        targetId: "client-octavio"
      }
    ],
    blockedReasons: [
      {
        reasonId: "preview_only_boundary",
        message: "Disponible solo como preview seguro."
      },
      {
        reasonId: "approval_required",
        message: "Requiere aprobacion humana antes de cualquier efecto real."
      }
    ]
  };

  var activeIndex = 0;
  var currentRows = [];

  function normalize(value) {
    return String(value || "").toLowerCase().trim();
  }

  function findInput() {
    return document.querySelector(".dw-command-input-056y, .command-pill-input");
  }

  function findRoot(input) {
    return input && (input.closest(".dw-command-zone-056y") || input.closest(".dw-command-shell-056y") || input.parentElement);
  }

  function actionById(actionId) {
    return READ_MODEL.actionRegistry.filter(function (action) {
      return action.actionId === actionId;
    })[0] || null;
  }

  function statusLabel(action) {
    if (!action) {
      return "blocked";
    }
    if (action.contractStatus === "needs_approval") {
      return "approval";
    }
    return action.contractStatus.replace("_", " ");
  }

  function ensurePanel(root, input) {
    var panel = document.getElementById("forge-contract-results-062c");
    if (!panel) {
      panel = document.createElement("div");
      panel.id = "forge-contract-results-062c";
      panel.className = "forge-contract-results-062c dw-command-results-056y";
      panel.setAttribute("role", "listbox");
      panel.setAttribute("data-forge-contract-results-panel-062c", "true");
      panel.hidden = true;
      root.appendChild(panel);
    }
    input.setAttribute("aria-controls", panel.id);
    input.setAttribute("aria-autocomplete", "list");
    return panel;
  }

  function ensureStatus(root) {
    var status = root.querySelector(".forge-contract-preview-status-062c");
    if (!status) {
      status = document.createElement("div");
      status.className = "forge-contract-preview-status-062c";
      status.setAttribute("aria-live", "polite");
      status.setAttribute("data-forge-contract-status-062c", "true");
      root.appendChild(status);
    }
    return status;
  }

  function queryRows(query) {
    var q = normalize(query);
    if (!q) {
      return [];
    }
    if (q === "/" || q === "/quick" || q === "/quick actions") {
      return READ_MODEL.commandCatalog.slice(0);
    }
    return READ_MODEL.commandCatalog.filter(function (command) {
      var haystack = [command.title, command.subtitle].concat(command.tokens || []).join(" ");
      return normalize(haystack).indexOf(q) !== -1;
    });
  }

  function hidePanel(root, panel) {
    if (panel) {
      panel.hidden = true;
      panel.innerHTML = "";
    }
    if (root) {
      root.removeAttribute("data-forge-contract-panel-active-062c");
    }
    currentRows = [];
    activeIndex = 0;
  }

  function selectCommand(root, input, command) {
    var action = actionById(command.actionId);
    var status = ensureStatus(root);
    input.value = command.title;
    input.setAttribute("data-forge-selected-action-contract-062c", command.actionId);
    status.textContent = command.title + " - " + (action ? action.label : "Accion bloqueada") + " - " + statusLabel(action) + ". Sin efectos reales.";
    window.dispatchEvent(new CustomEvent("forge:action-contract-preview:062c", {
      detail: {
        commandId: command.commandId,
        actionId: command.actionId,
        targetType: command.targetType,
        targetId: command.targetId,
        status: action ? action.contractStatus : "blocked",
        previewOnly: true
      }
    }));
  }

  function render(input) {
    var root = findRoot(input);
    if (!root) {
      return;
    }
    var panel = ensurePanel(root, input);
    currentRows = queryRows(input.value);
    if (!currentRows.length) {
      hidePanel(root, panel);
      return;
    }
    activeIndex = Math.min(activeIndex, currentRows.length - 1);
    root.setAttribute("data-forge-contract-panel-active-062c", "true");
    panel.hidden = false;
    panel.innerHTML = currentRows.map(function (command, index) {
      var action = actionById(command.actionId);
      return '<button type="button" class="forge-contract-result-062c" role="option" data-index="' + index + '" aria-selected="' + (index === activeIndex ? "true" : "false") + '">' +
        '<span><span class="forge-contract-result-062c__title">' + command.title + '</span>' +
        '<span class="forge-contract-result-062c__subtitle">' + command.subtitle + '</span></span>' +
        '<span class="forge-contract-result-062c__status">' + statusLabel(action) + '</span>' +
      '</button>';
    }).join("");
  }

  function bind() {
    var input = findInput();
    if (!input || input.getAttribute("data-forge-contract-bound-062c") === "true") {
      return;
    }
    var root = findRoot(input);
    if (!root) {
      return;
    }
    var panel = ensurePanel(root, input);
    input.setAttribute("data-forge-contract-bound-062c", "true");
    input.setAttribute("placeholder", "/quick actions");
    root.setAttribute("data-forge-read-model-bound-062c", READ_MODEL.modelName);

    input.addEventListener("input", function () {
      activeIndex = 0;
      render(input);
    });

    input.addEventListener("keydown", function (event) {
      if (event.key === "Escape") {
        hidePanel(root, panel);
        return;
      }
      if (!currentRows.length) {
        return;
      }
      if (event.key === "ArrowDown") {
        event.preventDefault();
        activeIndex = (activeIndex + 1) % currentRows.length;
        render(input);
      }
      if (event.key === "ArrowUp") {
        event.preventDefault();
        activeIndex = (activeIndex + currentRows.length - 1) % currentRows.length;
        render(input);
      }
      if (event.key === "Enter") {
        event.preventDefault();
        selectCommand(root, input, currentRows[activeIndex]);
        hidePanel(root, panel);
      }
    });

    panel.addEventListener("click", function (event) {
      var button = event.target.closest(".forge-contract-result-062c");
      if (!button) {
        return;
      }
      var index = Number(button.getAttribute("data-index"));
      if (currentRows[index]) {
        selectCommand(root, input, currentRows[index]);
        hidePanel(root, panel);
        input.focus();
      }
    });

    document.documentElement.setAttribute("data-forge-action-contracts-062c", "true");
  }

  function run() {
    window.__forgeAliveWorkspaceReadModel062C = READ_MODEL;
    bind();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", run, { once: true });
  } else {
    run();
  }
  window.addEventListener("load", run);
  window.__forgeRunCommandBarActionContracts062C = run;
})();
/* FORGEOS:COMMAND_BAR_ACTION_CONTRACT_IMPLEMENTATION_062C:END */'''
js = replace_block(
    js,
    "/* FORGEOS:COMMAND_BAR_ACTION_CONTRACT_IMPLEMENTATION_062C:START */",
    "/* FORGEOS:COMMAND_BAR_ACTION_CONTRACT_IMPLEMENTATION_062C:END */",
    js_block,
)
js_path.write_text(js)

index = index_path.read_text()
index = index.replace("forge-public-preview-interaction-visual-repair-060m.css?v=061g", "forge-public-preview-interaction-visual-repair-060m.css?v=062c")
index = index.replace("forge-public-preview-interaction-visual-repair-060m.js?v=061g", "forge-public-preview-interaction-visual-repair-060m.js?v=062c")
index_path.write_text(index)
PY
pass "patched command bar action contracts and 062c cache"

say_stage "STAGE 5 WRITE DOCS / EVIDENCE"
cat > docs/architecture/source-truth/FORGE_COMMAND_BAR_ACTION_CONTRACT_IMPLEMENTATION_CLOSURE_062C.md <<'MD'
# Forge Command Bar Action Contract Implementation Closure 062C

DECISION=PASS_062C_COMMAND_BAR_ACTION_CONTRACT_IMPLEMENTATION

NEXT=062D_COMMAND_BAR_ACTION_CONTRACT_QA_LOCK

062C implements a preview-safe command-bar contract layer backed by the scoped `forge.alive.workspace.read_model.v1` shape.

Implemented behavior:

- command input keeps `/quick actions`;
- command results resolve from a local action registry and command catalog;
- selected commands emit a preview-only event payload;
- selected commands update a local preview status line;
- action statuses stay inside `preview_only`, `needs_approval`, or `blocked`;
- no real effects are enabled.

Implemented contracts:

- `command.quick_actions`
- `report.prepare_preview`
- `opportunity.review`
- `client.follow_preview`
- `quote.prepare_preview`
- `record.open_preview`

Public URL:

`https://jorgeprdz.github.io/ForgeOS/static-preview/forge-alive/?v=062c`

DECISION=PASS_062C_COMMAND_BAR_ACTION_CONTRACT_IMPLEMENTATION

NEXT=062D_COMMAND_BAR_ACTION_CONTRACT_QA_LOCK
MD

cat > docs/evidence/FORGE_COMMAND_BAR_ACTION_CONTRACT_IMPLEMENTATION_062C.md <<'MD'
# Forge Command Bar Action Contract Implementation 062C

DECISION=PASS_062C_COMMAND_BAR_ACTION_CONTRACT_IMPLEMENTATION

NEXT=062D_COMMAND_BAR_ACTION_CONTRACT_QA_LOCK

062C binds the command bar to a local preview-safe read model and action registry.

Validation targets:

- `/quick actions` lists contract-backed commands.
- `/cotizar`, `follow`, `revisar`, `abrir`, and `preview` resolve through known command tokens.
- selecting a command prepares a preview-only status.
- no external effect is executed.

DECISION=PASS_062C_COMMAND_BAR_ACTION_CONTRACT_IMPLEMENTATION

NEXT=062D_COMMAND_BAR_ACTION_CONTRACT_QA_LOCK
MD

cat > docs/evidence/FORGE_COMMAND_BAR_ACTION_CONTRACT_IMPLEMENTATION_CERTIFICATE_062C.md <<'MD'
# Forge Command Bar Action Contract Implementation Certificate 062C

DECISION=PASS_062C_COMMAND_BAR_ACTION_CONTRACT_IMPLEMENTATION

NEXT=062D_COMMAND_BAR_ACTION_CONTRACT_QA_LOCK

062C certifies a static-preview command contract implementation only. It does not certify CRM writes, calendar creation, message delivery, authentication behavior, provider execution, browser persistence, browser requests, or real engine execution.
MD

cat > docs/evidence/forge-command-bar-action-contract-audit-062c.json <<'JSON'
{
  "phase": "062C_COMMAND_BAR_ACTION_CONTRACT_IMPLEMENTATION",
  "status": "PASS",
  "modelName": "forge.alive.workspace.read_model.v1",
  "cacheVersion": "062c",
  "contractsImplemented": [
    "command.quick_actions",
    "report.prepare_preview",
    "opportunity.review",
    "client.follow_preview",
    "quote.prepare_preview",
    "record.open_preview"
  ],
  "commandTokens": [
    "/quick actions",
    "/cotizar",
    "follow",
    "revisar",
    "abrir",
    "preview"
  ],
  "previewOnly": true,
  "realEffectsEnabled": false,
  "next": "062D_COMMAND_BAR_ACTION_CONTRACT_QA_LOCK"
}
JSON
pass "wrote 062C docs and audit json"

say_stage "STAGE 6 UPDATE BUILD TREE / ROADMAP"
sync_body="## 062C Command Bar Action Contract Implementation

Status: PASS / IMPLEMENTED.

062C binds the command bar to a local preview-safe \`forge.alive.workspace.read_model.v1\` object, action registry, and command catalog.

Implemented contracts:

- \`command.quick_actions\`
- \`report.prepare_preview\`
- \`opportunity.review\`
- \`client.follow_preview\`
- \`quote.prepare_preview\`
- \`record.open_preview\`

Public cache:
\`062c\`

Boundary:

Static preview contract implementation only. No module connection, external effect, auth behavior, provider execution, browser persistence, browser request, or real engine behavior is enabled.

DECISION=PASS_062C_COMMAND_BAR_ACTION_CONTRACT_IMPLEMENTATION

NEXT=062D_COMMAND_BAR_ACTION_CONTRACT_QA_LOCK"

append_sync_block "FORGE_MASTER_BUILD_TREE.md" "<!-- FORGEOS:COMMAND_BAR_ACTION_CONTRACT_IMPLEMENTATION_062C:START -->" "<!-- FORGEOS:COMMAND_BAR_ACTION_CONTRACT_IMPLEMENTATION_062C:END -->" "$sync_body"
append_sync_block "docs/architecture/source-truth/FORGE_UNIFIED_BUILD_TREE_001.md" "<!-- FORGEOS:COMMAND_BAR_ACTION_CONTRACT_IMPLEMENTATION_062C:START -->" "<!-- FORGEOS:COMMAND_BAR_ACTION_CONTRACT_IMPLEMENTATION_062C:END -->" "$sync_body"
append_sync_block "docs/roadmap/FORGE_ROADMAP_LOCK_001.md" "<!-- FORGEOS:COMMAND_BAR_ACTION_CONTRACT_IMPLEMENTATION_062C:START -->" "<!-- FORGEOS:COMMAND_BAR_ACTION_CONTRACT_IMPLEMENTATION_062C:END -->" "$sync_body"
pass "updated build tree / roadmap sync blocks"

say_stage "STAGE 7 NORMALIZE FILES"
changed_files=(
  "docs/static-preview/forge-alive/index.html"
  "docs/static-preview/forge-alive/desktop/forge-public-preview-interaction-visual-repair-060m.css"
  "docs/static-preview/forge-alive/desktop/forge-public-preview-interaction-visual-repair-060m.js"
  "FORGE_MASTER_BUILD_TREE.md"
  "docs/architecture/source-truth/FORGE_UNIFIED_BUILD_TREE_001.md"
  "docs/roadmap/FORGE_ROADMAP_LOCK_001.md"
  "docs/architecture/source-truth/FORGE_COMMAND_BAR_ACTION_CONTRACT_IMPLEMENTATION_CLOSURE_062C.md"
  "docs/evidence/FORGE_COMMAND_BAR_ACTION_CONTRACT_IMPLEMENTATION_062C.md"
  "docs/evidence/FORGE_COMMAND_BAR_ACTION_CONTRACT_IMPLEMENTATION_CERTIFICATE_062C.md"
  "docs/evidence/forge-command-bar-action-contract-audit-062c.json"
  "tools/termux/forge_062c_command_bar_action_contract_implementation.sh"
)

for file in "${changed_files[@]}"; do
  normalize_file "$file"
done
pass "normalized EOF and trailing whitespace"

say_stage "STAGE 8 VALIDATION"
run_cmd bash -n tools/termux/forge_062c_command_bar_action_contract_implementation.sh
run_cmd node --check docs/static-preview/forge-alive/desktop/forge-public-preview-interaction-visual-repair-060m.js
run_cmd python3 -m json.tool docs/evidence/forge-command-bar-action-contract-audit-062c.json
run_cmd rg -n "062c|forge-public-preview-interaction-visual-repair-060m.css|forge-public-preview-interaction-visual-repair-060m.js" docs/static-preview/forge-alive/index.html
run_cmd rg -n "FORGEOS:COMMAND_BAR_ACTION_CONTRACT_IMPLEMENTATION_062C|__forgeAliveWorkspaceReadModel062C|__forgeRunCommandBarActionContracts062C|forge:action-contract-preview:062c|command.quick_actions|quote.prepare_preview" docs/static-preview/forge-alive/desktop/forge-public-preview-interaction-visual-repair-060m.css docs/static-preview/forge-alive/desktop/forge-public-preview-interaction-visual-repair-060m.js
run_cmd rg -n "DECISION=PASS_062C_COMMAND_BAR_ACTION_CONTRACT_IMPLEMENTATION|NEXT=062D_COMMAND_BAR_ACTION_CONTRACT_QA_LOCK|forge.alive.workspace.read_model.v1" docs/architecture/source-truth/FORGE_COMMAND_BAR_ACTION_CONTRACT_IMPLEMENTATION_CLOSURE_062C.md docs/evidence/FORGE_COMMAND_BAR_ACTION_CONTRACT_IMPLEMENTATION_062C.md docs/evidence/FORGE_COMMAND_BAR_ACTION_CONTRACT_IMPLEMENTATION_CERTIFICATE_062C.md docs/evidence/forge-command-bar-action-contract-audit-062c.json FORGE_MASTER_BUILD_TREE.md docs/architecture/source-truth/FORGE_UNIFIED_BUILD_TREE_001.md docs/roadmap/FORGE_ROADMAP_LOCK_001.md
run_cmd git diff --check
warn "No package test suite required for scoped command bar contract implementation"

say_stage "STAGE 9 SAFETY SCAN"
safety_files=(
  "docs/static-preview/forge-alive/index.html"
  "docs/static-preview/forge-alive/desktop/forge-public-preview-interaction-visual-repair-060m.css"
  "docs/static-preview/forge-alive/desktop/forge-public-preview-interaction-visual-repair-060m.js"
  "docs/architecture/source-truth/FORGE_COMMAND_BAR_ACTION_CONTRACT_IMPLEMENTATION_CLOSURE_062C.md"
  "docs/evidence/FORGE_COMMAND_BAR_ACTION_CONTRACT_IMPLEMENTATION_062C.md"
  "docs/evidence/FORGE_COMMAND_BAR_ACTION_CONTRACT_IMPLEMENTATION_CERTIFICATE_062C.md"
  "docs/evidence/forge-command-bar-action-contract-audit-062c.json"
  "FORGE_MASTER_BUILD_TREE.md"
  "docs/architecture/source-truth/FORGE_UNIFIED_BUILD_TREE_001.md"
  "docs/roadmap/FORGE_ROADMAP_LOCK_001.md"
)
safety_scan_file="$BACKUP_DIR/safety-scan-062c.txt"

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
warn "Screenshot and interaction evidence should be captured in 062D QA lock"

say_stage "STAGE 11 STAGE AUTHORIZED FILES"
allowed_paths=(
  "FORGE_MASTER_BUILD_TREE.md"
  "docs/architecture/source-truth/FORGE_COMMAND_BAR_ACTION_CONTRACT_IMPLEMENTATION_CLOSURE_062C.md"
  "docs/architecture/source-truth/FORGE_UNIFIED_BUILD_TREE_001.md"
  "docs/evidence/FORGE_COMMAND_BAR_ACTION_CONTRACT_IMPLEMENTATION_062C.md"
  "docs/evidence/FORGE_COMMAND_BAR_ACTION_CONTRACT_IMPLEMENTATION_CERTIFICATE_062C.md"
  "docs/evidence/forge-command-bar-action-contract-audit-062c.json"
  "docs/roadmap/FORGE_ROADMAP_LOCK_001.md"
  "docs/static-preview/forge-alive/index.html"
  "docs/static-preview/forge-alive/desktop/forge-public-preview-interaction-visual-repair-060m.css"
  "docs/static-preview/forge-alive/desktop/forge-public-preview-interaction-visual-repair-060m.js"
  "tools/termux/forge_062c_command_bar_action_contract_implementation.sh"
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
run_cmd git commit -m "feat: bind command bar action contracts"
run_cmd git push origin HEAD:main

say_stage "STAGE 13 FINAL CHECKPOINT"
run_cmd git status --short --branch
run_cmd git log --oneline -10

say_stage "FINAL DECISION"
printf "PASS_062C_COMMAND_BAR_ACTION_CONTRACT_IMPLEMENTATION_COMMIT_PUSH_COMPLETE\n"
printf "NEXT=062D_COMMAND_BAR_ACTION_CONTRACT_QA_LOCK\n"
printf "BACKUP=%s\n" "$BACKUP_DIR"
printf "ROLLBACK=%s\n" "$BACKUP_DIR/rollback-062c.sh"
printf "Reporte: %s\n" "$REPORT"
autocopy_report
