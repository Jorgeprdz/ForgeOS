#!/usr/bin/env bash
set -Eeuo pipefail

SCRIPT_DIR="$(CDPATH= cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
if REPO_ROOT="$(git -C "$SCRIPT_DIR" rev-parse --show-toplevel 2>/dev/null)"; then
  :
else
  REPO_ROOT="$(CDPATH= cd -- "$SCRIPT_DIR/.." && pwd)"
fi

RUNTIME_DIR="$REPO_ROOT/docs/static-preview/forge-aura"
ENV_FILE="$RUNTIME_DIR/env.js"
DEFAULT_PORT="${AURA_PORT:-4173}"
SERVER_PID=""
ENV_BACKUP=""
ENV_REPLACED=0

log() {
  printf '%s\n' "$*" >&2
}

cleanup() {
  local exit_code="${1:-0}"
  trap - EXIT INT TERM

  if [[ -n "$SERVER_PID" ]] && kill -0 "$SERVER_PID" 2>/dev/null; then
    kill "$SERVER_PID" 2>/dev/null || true
    wait "$SERVER_PID" 2>/dev/null || true
  fi

  if [[ "$ENV_REPLACED" -eq 1 && -n "$ENV_BACKUP" && -f "$ENV_BACKUP" ]]; then
    cp "$ENV_BACKUP" "$ENV_FILE"
  fi
  [[ -n "$ENV_BACKUP" ]] && rm -f "$ENV_BACKUP"

  exit "$exit_code"
}

trap 'cleanup $?' EXIT
trap 'cleanup 0' INT TERM

for required in \
  "$RUNTIME_DIR/index.html" \
  "$RUNTIME_DIR/app.js" \
  "$RUNTIME_DIR/aura-router.js" \
  "$RUNTIME_DIR/aura-shell.js" \
  "$RUNTIME_DIR/aura-shell.css" \
  "$RUNTIME_DIR/aura-tokens.css" \
  "$RUNTIME_DIR/aura-auth.js" \
  "$RUNTIME_DIR/aura-auth.css" \
  "$RUNTIME_DIR/pipeline/pipeline-module.js" \
  "$RUNTIME_DIR/pipeline/pipeline-core.js" \
  "$RUNTIME_DIR/pipeline/pipeline-adapter.js" \
  "$RUNTIME_DIR/pipeline/pipeline.css"; do
  if [[ ! -f "$required" ]]; then
    log "ERROR: falta el asset requerido: ${required#$REPO_ROOT/}"
    exit 1
  fi
done

PYTHON_BIN=""
for candidate in python3 python; do
  if command -v "$candidate" >/dev/null 2>&1; then
    PYTHON_BIN="$candidate"
    break
  fi
done
if [[ -z "$PYTHON_BIN" ]]; then
  log "ERROR: instala Python en Termux con: pkg install python"
  exit 1
fi

ENV_BACKUP="$(mktemp)"
cp "$ENV_FILE" "$ENV_BACKUP"

# Prepare a temporary public-only env.js without echoing values. Priority:
# exported environment variables, repository-root env.js, then the tracked placeholder.
export FORGE_AURA_REPO_ROOT="$REPO_ROOT"
export FORGE_AURA_ENV_FILE="$ENV_FILE"
if "$PYTHON_BIN" - <<'PY'
import json
import os
import pathlib
import re
import sys

root = pathlib.Path(os.environ["FORGE_AURA_REPO_ROOT"])
target = pathlib.Path(os.environ["FORGE_AURA_ENV_FILE"])

url = os.environ.get("SUPABASE_URL", "").strip()
key = (os.environ.get("SUPABASE_KEY", "") or os.environ.get("SUPABASE_ANON_KEY", "")).strip()

def read_value(text: str, names: tuple[str, ...]) -> str:
    for name in names:
        patterns = (
            rf"['\"]?{re.escape(name)}['\"]?\s*:\s*['\"]([^'\"]+)['\"]",
            rf"(?:window\.)?__ENV__\s*\.\s*{re.escape(name)}\s*=\s*['\"]([^'\"]+)['\"]",
        )
        for pattern in patterns:
            match = re.search(pattern, text)
            if match:
                return match.group(1).strip()
    return ""

if not (url and key):
    candidates = (
        root / "env.js",
        root / ".env.local",
        root / ".env",
        root / "docs/static-preview/forge-alive-material3/env.js",
    )
    for candidate in candidates:
        if not candidate.is_file():
            continue
        text = candidate.read_text(encoding="utf-8", errors="ignore")
        candidate_url = read_value(text, ("SUPABASE_URL",))
        candidate_key = read_value(text, ("SUPABASE_KEY", "SUPABASE_ANON_KEY"))
        if candidate_url and candidate_key:
            url, key = candidate_url, candidate_key
            break

if not (url and key):
    sys.exit(2)

for forbidden in ("service_role", "SERVICE_ROLE", "SUPABASE_SERVICE_ROLE_KEY"):
    if forbidden in key:
        raise SystemExit("Refusing a privileged key")

payload = {
    "SUPABASE_URL": url,
    "SUPABASE_KEY": key,
    "DEMO_MODE": "false",
}
target.write_text(
    "window.__ENV__ = " + json.dumps(payload, ensure_ascii=False) + ";\n",
    encoding="utf-8",
)
PY
then
  ENV_REPLACED=1
  log "Configuración pública productiva preparada sin imprimir credenciales."
else
  status=$?
  if [[ "$status" -eq 2 ]]; then
    log "AVISO: no se encontró configuración pública; el runtime mostrará AUTH_ERROR de forma fail-closed."
  else
    log "ERROR: no fue posible preparar env.js de manera segura."
    exit 1
  fi
fi

PORT="$DEFAULT_PORT"
while ! "$PYTHON_BIN" - "$PORT" <<'PY' >/dev/null 2>&1
import socket
import sys
port = int(sys.argv[1])
with socket.socket() as sock:
    try:
        sock.bind(("127.0.0.1", port))
    except OSError:
        raise SystemExit(1)
PY
do
  PORT=$((PORT + 1))
  if (( PORT > DEFAULT_PORT + 50 )); then
    log "ERROR: no hay un puerto local disponible."
    exit 1
  fi
done

LOG_FILE="$(mktemp)"
(
  cd "$REPO_ROOT"
  exec "$PYTHON_BIN" -m http.server "$PORT" --bind 127.0.0.1
) >"$LOG_FILE" 2>&1 &
SERVER_PID=$!

READY=0
for _ in $(seq 1 60); do
  if ! kill -0 "$SERVER_PID" 2>/dev/null; then
    log "ERROR: el servidor local terminó antes de quedar listo."
    cat "$LOG_FILE" >&2 || true
    rm -f "$LOG_FILE"
    exit 1
  fi
  if "$PYTHON_BIN" - "$PORT" <<'PY' >/dev/null 2>&1
import sys
import urllib.request
port = int(sys.argv[1])
with urllib.request.urlopen(
    f"http://127.0.0.1:{port}/docs/static-preview/forge-aura/?route=pipeline",
    timeout=1,
) as response:
    if response.status != 200:
        raise SystemExit(1)
PY
  then
    READY=1
    break
  fi
  sleep 0.1
done
rm -f "$LOG_FILE"

if [[ "$READY" -ne 1 ]]; then
  log "ERROR: el runtime no respondió con HTTP 200."
  exit 1
fi

URL="http://127.0.0.1:${PORT}/docs/static-preview/forge-aura/?route=pipeline"
printf '%s\n' "$URL"

if command -v termux-open-url >/dev/null 2>&1; then
  termux-open-url "$URL" >/dev/null 2>&1 || true
elif command -v xdg-open >/dev/null 2>&1; then
  xdg-open "$URL" >/dev/null 2>&1 || true
fi

wait "$SERVER_PID"
