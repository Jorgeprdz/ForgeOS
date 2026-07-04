#!/usr/bin/env bash
set -u

PHASE="059B_STATIC_ACTION_PACKET_BRIDGE"
STAMP="$(date +%Y%m%d_%H%M%S)"
REPO="/storage/emulated/0/Forge OS"
DOWNLOAD_DIR="/storage/emulated/0/Download"
SCRIPT_NAME="$(basename "$0")"
REPORT_HOME="$HOME/${PHASE}_RESULT_${STAMP}.md"
REPORT_COPY="$DOWNLOAD_DIR/${PHASE}_RESULT_${STAMP}.md"
SCRIPT_COPY="$DOWNLOAD_DIR/$SCRIPT_NAME"
REPO_SCRIPT="tools/termux/$SCRIPT_NAME"
BACKUP_DIR="$REPO/.forge-backups/059b-static-action-packet-bridge-${STAMP}"
AUTOCOPY_STATUS="NOT_RUN"
CLIPBOARD_STATUS="NOT_RUN"

BRIDGE_JS="docs/static-preview/forge-alive/shared/forge-static-action-packet-bridge-059b.js"
SCOPE_DOC="docs/architecture/source-truth/FORGE_UI_ACTION_CONTRACT_SCOPE_059A.md"
CONTRACT_DOC="docs/design/forge-ui/FORGE_UI_ACTION_PACKET_CONTRACT_059A.md"
REPORT_DOC="docs/evidence/FORGE_STATIC_ACTION_PACKET_BRIDGE_059B.md"
INDEX_FILE="docs/static-preview/forge-alive/index.html"

fail() {
  echo "FAIL: $*" | tee -a "$REPORT_HOME"
  echo "REPORT: $REPORT_HOME"
  exit 1
}

log() {
  echo "$*" | tee -a "$REPORT_HOME"
}

run() {
  log ""
  log "========== RUN =========="
  log "$*"
  "$@" >> "$REPORT_HOME" 2>&1
  local code=$?
  if [ "$code" -ne 0 ]; then
    fail "Command failed: $*"
  fi
}

section() {
  log ""
  log "========== $* =========="
}

copy_clipboard() {
  local label="$1"
  local value="$2"
  if command -v termux-clipboard-set >/dev/null 2>&1; then
    printf "%s" "$value" | termux-clipboard-set >/dev/null 2>&1
    if [ "$?" -eq 0 ]; then
      CLIPBOARD_STATUS="PASS"
      log "PASS: Copied $label to Android clipboard"
    else
      CLIPBOARD_STATUS="WARN_FAILED"
      log "WARN: Could not copy $label to Android clipboard"
    fi
  else
    CLIPBOARD_STATUS="WARN_UNAVAILABLE"
    log "WARN: termux-clipboard-set unavailable for $label"
  fi
}

mkdir -p "$DOWNLOAD_DIR" 2>/dev/null || true
: > "$REPORT_HOME" || exit 1

log "# ${PHASE}"
log ""
log "Generated: $(date)"
log "MODE: scoped static preview action packet bridge"
log "BOUNDARY: static preview packet bridge only; no CRM; no calendar; no send; no engines; no runtime/network/storage"
log "REPORT: $REPORT_HOME"

section "STAGE 0 AUTOCOPY"
if [ -f "$0" ] && [ -d "$DOWNLOAD_DIR" ]; then
  CURRENT_REAL="$(realpath "$0" 2>/dev/null || printf '%s' "$0")"
  TARGET_REAL="$SCRIPT_COPY"
  if [ "$CURRENT_REAL" != "$TARGET_REAL" ]; then
    cp "$0" "$TARGET_REAL" || fail "Autocopy failed"
    chmod +x "$TARGET_REAL" 2>/dev/null || true
    AUTOCOPY_STATUS="PASS_COPIED_TO_DOWNLOAD"
    log "PASS: Script autocopied to $TARGET_REAL"
  else
    AUTOCOPY_STATUS="PASS_ALREADY_IN_DOWNLOAD"
    log "PASS: Script already running from Download"
  fi
  [ -f "$TARGET_REAL" ] && log "PASS: Autocopy verified at $TARGET_REAL" || fail "Autocopy verification failed"
else
  fail "Autocopy unavailable: script path or Download directory missing"
fi

[ -d "$REPO/.git" ] || fail "Repo not found: $REPO"
cd "$REPO" || fail "Cannot cd to repo"

section "STAGE 1 REPO CHECKPOINT"
run git status --short --branch
run git log --oneline -15
run git diff --name-status
run git diff --cached --name-status

if [ -n "$(git diff --name-only)" ]; then
  fail "Tracked working diff exists before 059B. Stop to avoid mixing changes."
fi

if [ -n "$(git diff --cached --name-only)" ]; then
  fail "Staged files exist before 059B. Stop to avoid mixing changes."
fi

section "STAGE 2 REQUIRED FILES"
required_files=(
  "$INDEX_FILE"
  "$SCOPE_DOC"
  "$CONTRACT_DOC"
  "docs/architecture/source-truth/FORGE_UI_ACTION_CONTRACT_ROADMAP_BUILD_TREE_SYNC_059A1.md"
  "docs/roadmap/FORGE_UI_ACTION_CONTRACT_ROADMAP_059A.md"
)

for f in "${required_files[@]}"; do
  [ -f "$f" ] || fail "Missing required file: $f"
  log "PASS: $f"
done

section "STAGE 3 BACKUP AND ROLLBACK"
mkdir -p "$BACKUP_DIR" || fail "Cannot create backup dir"
for f in "${required_files[@]}" "$BRIDGE_JS" "$REPORT_DOC" "$REPO_SCRIPT"; do
  if [ -f "$f" ]; then
    mkdir -p "$BACKUP_DIR/$(dirname "$f")"
    cp "$f" "$BACKUP_DIR/$f" || fail "Backup failed for $f"
  fi
done

cat > "$BACKUP_DIR/rollback-059b.sh" <<EOF_ROLLBACK
#!/usr/bin/env bash
set -euo pipefail
cd "$REPO"
for f in "$INDEX_FILE" "$BRIDGE_JS" "$REPORT_DOC" "$REPO_SCRIPT"; do
  if [ -f "$BACKUP_DIR/\$f" ]; then
    mkdir -p "\$(dirname "\$f")"
    cp "$BACKUP_DIR/\$f" "\$f"
  else
    rm -f "\$f"
  fi
done
echo "Rollback 059B restored static action packet bridge files."
EOF_ROLLBACK
chmod +x "$BACKUP_DIR/rollback-059b.sh" || true
log "PASS: Backup created: $BACKUP_DIR"
log "PASS: Rollback script: $BACKUP_DIR/rollback-059b.sh"

section "STAGE 4 WRITE STATIC ACTION PACKET BRIDGE JS"
mkdir -p "$(dirname "$BRIDGE_JS")"
cat > "$BRIDGE_JS" <<'EOF_JS'
/* FORGEOS:STATIC_ACTION_PACKET_BRIDGE_059B:START */
(function () {
  "use strict";

  var desktopQuery = window.matchMedia ? window.matchMedia("(min-width: 901px)") : null;
  var packetStore = [];
  var sequence = 0;

  var actionRules = [
    { id: "quote.create.preview", match: ["/cotizar", "cotizar", "cotizacion", "cotización"], module: "cotizaciones", intent: "Prepare a read-only quote preview." },
    { id: "policy.upload.preview", match: ["/subir poliza", "/subir póliza", "subir poliza", "subir póliza"], module: "polizas", intent: "Prepare a read-only policy upload preview." },
    { id: "client.follow.preview", match: ["/follow", "follow", "seguimiento"], module: "clientes", intent: "Prepare a read-only follow-up preview." },
    { id: "client.call.preview", match: ["/llamar", "llamar"], module: "clientes", intent: "Prepare a read-only call prep preview." },
    { id: "client.message.preview", match: ["/mandar mensaje", "mandar mensaje", "mensaje"], module: "clientes", intent: "Prepare a read-only message draft preview." },
    { id: "client.search.preview", match: ["/buscar cliente", "buscar cliente"], module: "clientes", intent: "Prepare a read-only client search preview." },
    { id: "policy.open.preview", match: ["abrir poliza", "abrir póliza", "abrir"], module: "polizas", intent: "Prepare a read-only policy open preview." },
    { id: "report.open.preview", match: ["reporte", "reportes"], module: "reportes", intent: "Prepare a read-only report preview." },
    { id: "pipeline.review.preview", match: ["revisar pipeline", "pipeline"], module: "pipeline", intent: "Prepare a read-only pipeline review preview." },
    { id: "day.review.preview", match: ["revisar dia", "revisar día", "iniciar revision", "iniciar revisión"], module: "inicio", intent: "Prepare a read-only daily review preview." }
  ];

  function normalize(value) {
    return String(value || "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/\s+/g, " ")
      .trim();
  }

  function closestText(target) {
    var node = target && target.closest ? target.closest("button, a, [role='button'], .forge-desktop-command-suggestion-058e, .forge-mobile-widget-card-057j, .forge-smart-widget-static-card-056u") : null;
    if (!node) return "";
    return (node.getAttribute("data-command") || node.getAttribute("aria-label") || node.textContent || "").trim();
  }

  function inferRule(text) {
    var haystack = normalize(text);
    for (var i = 0; i < actionRules.length; i += 1) {
      var rule = actionRules[i];
      for (var j = 0; j < rule.match.length; j += 1) {
        if (haystack.indexOf(normalize(rule.match[j])) !== -1) {
          return rule;
        }
      }
    }
    return null;
  }

  function inferPlatform() {
    if (desktopQuery && desktopQuery.matches) return "desktop";
    return "mobile";
  }

  function inferSurface(target) {
    if (target && target.closest) {
      if (target.closest(".forge-desktop-workspace-056y")) {
        if (target.closest(".forge-desktop-rail, .forge-alfred-rail, aside")) return "desktop.right_rail";
        if (target.closest("table, .forge-opportunities, .forge-documents")) return "desktop.table_row";
        if (target.closest(".forge-decision-strip, .forge-desktop-decision-strip-058e")) return "desktop.decision_strip";
        return "desktop.command_workspace";
      }
      if (target.closest(".forge-mobile-widget-grid-057j")) return "mobile.widget_grid";
      if (target.closest(".bottom-nav")) return "mobile.bottom_nav";
    }
    return inferPlatform() === "desktop" ? "desktop.command_workspace" : "mobile.command_card";
  }

  function buildPacket(rule, text, target) {
    sequence += 1;
    var platform = inferPlatform();
    var surface = inferSurface(target);
    return {
      packetVersion: "059B.static.preview",
      packetId: "forge-static-action-" + String(sequence).padStart(4, "0"),
      actionId: rule.id,
      sourceSurface: surface,
      sourcePlatform: platform,
      sourceModule: rule.module,
      humanLabel: text || rule.id,
      previewMode: true,
      requiresHumanApproval: true,
      createdAtLocal: "static-preview-only",
      safeIntent: rule.intent,
      target: {
        clientName: inferClientName(text)
      },
      context: {
        reason: "Static preview action packet generated from UI intent.",
        recommendedNextStep: "Open preview and keep human approval required."
      },
      previewPayload: {
        title: text || "Preparar preview",
        body: rule.intent,
        safety: "Sin envio, sin CRM, sin calendario."
      }
    };
  }

  function inferClientName(text) {
    var names = ["Lariza", "Octavio", "Maria", "María", "Juan"];
    for (var i = 0; i < names.length; i += 1) {
      if (normalize(text).indexOf(normalize(names[i])) !== -1) return names[i];
    }
    return "";
  }

  function publishPacket(packet, node) {
    packetStore.push(packet);
    window.__forgeStaticActionPackets059B = packetStore.slice();
    document.documentElement.setAttribute("data-forge-action-packet-059b", packet.actionId);
    document.documentElement.setAttribute("data-forge-action-packet-count-059b", String(packetStore.length));
    if (node && node.setAttribute) {
      node.setAttribute("data-forge-last-action-packet-059b", packet.packetId);
    }
    window.dispatchEvent(new CustomEvent("forge:static-action-packet:059b", { detail: packet }));
  }

  function onClick(event) {
    var text = closestText(event.target);
    if (!text) return;
    var rule = inferRule(text);
    if (!rule) return;
    var node = event.target.closest ? event.target.closest("button, a, [role='button'], .forge-desktop-command-suggestion-058e, .forge-mobile-widget-card-057j, .forge-smart-widget-static-card-056u") : null;
    publishPacket(buildPacket(rule, text, event.target), node);
  }

  function init() {
    if (window.__forgeStaticActionPacketBridge059BReady) return;
    window.__forgeStaticActionPacketBridge059BReady = true;
    window.__forgeStaticActionPackets059B = packetStore;
    document.addEventListener("click", onClick, true);
    document.documentElement.setAttribute("data-forge-action-bridge-059b", "ready");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();
/* FORGEOS:STATIC_ACTION_PACKET_BRIDGE_059B:END */
EOF_JS
log "PASS: Wrote $BRIDGE_JS"

section "STAGE 5 PATCH INDEX LOAD ORDER"
if rg -q "forge-static-action-packet-bridge-059b.js" "$INDEX_FILE"; then
  log "PASS: 059B bridge already loaded in index.html"
else
  python3 - <<'PY'
from pathlib import Path
path = Path("docs/static-preview/forge-alive/index.html")
text = path.read_text()
needle = '  <script src="./desktop/forge-desktop-command-workspace-upgrade-058e.js?v=058e" defer></script>\n'
insert = needle + '  <script src="./shared/forge-static-action-packet-bridge-059b.js?v=059b" defer></script>\n'
if needle not in text:
    fallback = '</body>'
    if fallback not in text:
        raise SystemExit("No script anchor or body close found")
    text = text.replace(fallback, '  <script src="./shared/forge-static-action-packet-bridge-059b.js?v=059b" defer></script>\n</body>', 1)
else:
    text = text.replace(needle, insert, 1)
path.write_text(text)
PY
  log "PASS: Patched $INDEX_FILE"
fi

section "STAGE 6 WRITE EVIDENCE REPORT"
mkdir -p "$(dirname "$REPORT_DOC")"
cat > "$REPORT_DOC" <<'EOF_REPORT'
# Forge Static Action Packet Bridge 059B

Status: IMPLEMENTED

Decision token:
DECISION=PASS_059B_STATIC_ACTION_PACKET_BRIDGE

Next:
NEXT=059C_ENGINE_ADAPTER_RECONNECT_SCOPE

## Scope

059B implements a static read-only bridge that turns recognized UI intent into
preview-only action packets.

The bridge does not connect engines and does not execute provider actions.

## Files

- `docs/static-preview/forge-alive/shared/forge-static-action-packet-bridge-059b.js`
- `docs/static-preview/forge-alive/index.html`
- `tools/termux/forge_059b_static_action_packet_bridge.sh`

## Runtime Boundary

Allowed:

- listen for UI clicks;
- infer a canonical action id;
- build an in-memory static preview packet;
- expose the latest packets on `window.__forgeStaticActionPackets059B`;
- dispatch a local `forge:static-action-packet:059b` event;
- mark DOM readiness with data attributes.

Forbidden:

- CRM writes;
- calendar creation;
- message sending;
- live provider calls;
- browser storage mutation;
- engine execution;
- hidden approval bypass.

## Packet Safety

Every packet emitted by 059B keeps:

- `previewMode: true`;
- `requiresHumanApproval: true`;
- safety copy: `Sin envio, sin CRM, sin calendario.`

## Final Decision

DECISION=PASS_059B_STATIC_ACTION_PACKET_BRIDGE

NEXT=059C_ENGINE_ADAPTER_RECONNECT_SCOPE
EOF_REPORT
log "PASS: Wrote $REPORT_DOC"

section "STAGE 7 COPY SCRIPT INTO REPO TOOLS"
mkdir -p "$(dirname "$REPO_SCRIPT")"
cp "$SCRIPT_COPY" "$REPO_SCRIPT" || cp "$0" "$REPO_SCRIPT" || fail "Could not copy shell into $REPO_SCRIPT"
chmod +x "$REPO_SCRIPT" 2>/dev/null || true
log "PASS: Copied shell into $REPO_SCRIPT"

section "STAGE 8 VALIDATION"
run rg -n "forge-static-action-packet-bridge-059b.js" "$INDEX_FILE"
run rg -n "FORGEOS:STATIC_ACTION_PACKET_BRIDGE_059B|__forgeStaticActionPackets059B|requiresHumanApproval|previewMode|forge:static-action-packet:059b|localStorage|sessionStorage|fetch\\(|XMLHttpRequest" "$BRIDGE_JS"
run node --check "$BRIDGE_JS"
run bash -n "$REPO_SCRIPT"
run git diff --check

section "STAGE 9 SAFETY SCAN"
if rg -n "localStorage|sessionStorage|fetch\\(|XMLHttpRequest|navigator\\.sendBeacon|SpeechRecognition|webkitSpeechRecognition|providerRuntimeEnabled\\s*[:=]\\s*true|networkCallsAllowed\\s*[:=]\\s*true|browserStorageEnabled\\s*[:=]\\s*true|mayCreateTruth\\s*[:=]\\s*true|maySendMessage\\s*[:=]\\s*true|mayWriteCrm\\s*[:=]\\s*true|mayCreateCalendarEvent\\s*[:=]\\s*true" "$BRIDGE_JS" "$REPORT_DOC" >> "$REPORT_HOME" 2>&1; then
  fail "Forbidden runtime/safety token found in 059B touched files."
else
  log "PASS: No forbidden runtime/safety tokens found in 059B product/report files"
  log "SAFETY_SCAN_NOTE=Shell regex self-scan excluded to avoid false positives"
fi

section "STAGE 10 REVIEW URLS"
log "Local server:"
log "cd \"$REPO\""
log "python3 -m http.server 4173 --bind 0.0.0.0"
log ""
log "Local URL:"
log "http://127.0.0.1:4173/docs/static-preview/forge-alive/?v=059b"
log ""
log "Pages URL after push/propagation:"
log "https://jorgeprdz.github.io/ForgeOS/static-preview/forge-alive/?v=059b"

section "STAGE 11 AUTHORIZED STAGING"
git add "$INDEX_FILE" "$BRIDGE_JS" "$REPORT_DOC" "$REPO_SCRIPT" || fail "git add failed"
run git diff --cached --name-status
run git diff --cached --check

section "STAGE 12 COMMIT AND PUSH"
git commit -m "feat: add static ui action packet bridge" >> "$REPORT_HOME" 2>&1 || fail "git commit failed"
git push origin main >> "$REPORT_HOME" 2>&1 || fail "git push failed"
log "PASS: Commit and push completed"

section "STAGE 13 FINAL CHECKPOINT"
run git status --short --branch
run git log --oneline -5

section "STAGE 14 CLIPBOARD"
NEXT_COMMAND="forge-run 059c"
copy_clipboard "next command" "$NEXT_COMMAND"

section "FINAL DECISION"
log "DECISION=PASS_059B_STATIC_ACTION_PACKET_BRIDGE"
log "NEXT=059C_ENGINE_ADAPTER_RECONNECT_SCOPE"
log "REPORT: $REPORT_HOME"
cp "$REPORT_HOME" "$REPORT_COPY" 2>/dev/null && log "REPORT_COPY: $REPORT_COPY" || log "WARN: Could not copy report to Download"
log "AUTOCOPY=$AUTOCOPY_STATUS"
log "SCRIPT_COPY: $SCRIPT_COPY"
[ -f "$SCRIPT_COPY" ] && log "SCRIPT_COPY_VERIFIED=$SCRIPT_COPY" || fail "Script copy missing at final verification"
log "REPO_SCRIPT=$REPO_SCRIPT"
log "CLIPBOARD=$CLIPBOARD_STATUS"
log "COPIED_COMMAND=$NEXT_COMMAND"
log "BACKUP_DIR: $BACKUP_DIR"
log "ROLLBACK: $BACKUP_DIR/rollback-059b.sh"

exit 0
