#!/data/data/com.termux/files/usr/bin/bash
set -uo pipefail

REPO="${FORGE_REPO:-/storage/emulated/0/Forge OS}"
BRANCH="feature/cartera-001b-remote-acceptance"
ARCHFORGE_LAUNCHER="${ARCHFORGE_LAUNCHER:-/data/data/com.termux/files/usr/bin/archforge}"
LOG_DIR="${FORGE_EVIDENCE_DIR:-/storage/emulated/0/ForgeGemini}"
STAMP="$(date +%Y%m%d-%H%M%S)"
LOG_FILE="$LOG_DIR/cartera-001b-archforge-remote-acceptance-$STAMP.log"

main() {
  printf '%s\n' '============================================================'
  printf '%s\n' 'FORGE CARTERA — 001B ARCHFORGE REMOTE ACCEPTANCE'
  printf '%s\n' '============================================================'
  printf 'REPO=%s\nBRANCH=%s\nARCHFORGE=%s\n' "$REPO" "$BRANCH" "$ARCHFORGE_LAUNCHER"

  [[ -x "$ARCHFORGE_LAUNCHER" ]] || {
    printf 'ARCHFORGE_LAUNCHER_NOT_FOUND=%s\n' "$ARCHFORGE_LAUNCHER"
    return 1
  }

  [[ -d "$REPO/.git" ]] || {
    printf 'REPOSITORY_NOT_FOUND=%s\n' "$REPO"
    return 1
  }

  mkdir -p "$LOG_DIR"
  cd "$REPO" || return 1

  if [[ -n "$(git status --porcelain)" ]]; then
    printf '%s\n' 'WORKTREE_STATUS=DIRTY'
    git status --short
    printf '%s\n' 'REMOTE_ACCEPTANCE_BLOCKED=COMMIT_OR_STASH_FIRST'
    return 1
  fi

  printf '%s\n' '========== UPDATE ACCEPTANCE BRANCH =========='
  git fetch origin "$BRANCH" || return 1
  git switch "$BRANCH" 2>/dev/null \
    || git switch --track -c "$BRANCH" "origin/$BRANCH" \
    || return 1
  git pull --ff-only origin "$BRANCH" || return 1

  printf '%s\n' '========== ENTER ARCHFORGE =========='
  "$ARCHFORGE_LAUNCHER" -- bash -lc \
    "cd '/storage/emulated/0/Forge OS' && bash tools/termux/forge_cartera_001b_remote_acceptance.sh"
}

mkdir -p "$LOG_DIR"
main 2>&1 | tee "$LOG_FILE"
RUN_STATUS="${PIPESTATUS[0]}"

if command -v termux-clipboard-set >/dev/null 2>&1; then
  termux-clipboard-set < "$LOG_FILE" || true
  printf 'AUTOCOPY=%s\n' "$LOG_FILE"
fi

printf 'EVIDENCE_PATH=%s\n' "$LOG_FILE"
[[ "$RUN_STATUS" -eq 0 ]]
