#!/usr/bin/env bash
set -uo pipefail

REPO="${FORGE_REPO:-/storage/emulated/0/Forge OS}"
BRANCH="feature/cartera-001b-remote-acceptance"
EXPECTED_VERSION="20260726000200"
LOG_DIR="${FORGE_EVIDENCE_DIR:-/storage/emulated/0/ForgeGemini}"
STAMP="$(date +%Y%m%d-%H%M%S)"
LOG_FILE="$LOG_DIR/cartera-001b-recover-${EXPECTED_VERSION}-${STAMP}.log"

main() {
  printf '%s\n' '============================================================'
  printf '%s\n' 'FORGE SUPABASE — RECOVER REMOTE MIGRATION 20260726000200'
  printf '%s\n' '============================================================'

  for required in git supabase sha256sum; do
    command -v "$required" >/dev/null 2>&1 || {
      printf 'MISSING_COMMAND=%s\n' "$required"
      return 1
    }
  done

  [[ -d "$REPO/.git" ]] || {
    printf 'REPOSITORY_NOT_FOUND=%s\n' "$REPO"
    return 1
  }

  mkdir -p "$LOG_DIR"
  cd "$REPO" || return 1

  CURRENT_BRANCH="$(git branch --show-current)"
  printf 'CURRENT_BRANCH=%s\n' "$CURRENT_BRANCH"
  [[ "$CURRENT_BRANCH" == "$BRANCH" ]] || {
    printf 'SOURCE_GATE=FAIL_WRONG_BRANCH\n'
    return 1
  }

  if [[ -n "$(git status --porcelain)" ]]; then
    printf '%s\n' 'WORKTREE_STATUS=DIRTY'
    git status --short
    printf '%s\n' 'RECOVERY_BLOCKED=COMMIT_OR_STASH_FIRST'
    return 1
  fi

  if compgen -G "supabase/migrations/${EXPECTED_VERSION}_*.sql" >/dev/null; then
    printf 'RECOVERY_NOT_REQUIRED=LOCAL_MIGRATION_ALREADY_PRESENT\n'
    return 1
  fi

  if [[ -z "${SUPABASE_DB_PASSWORD:-}" ]]; then
    read -rsp 'Supabase DB password: ' SUPABASE_DB_PASSWORD
    printf '\n'
    export SUPABASE_DB_PASSWORD
  fi

  [[ -n "${SUPABASE_DB_PASSWORD:-}" ]] || {
    printf 'SUPABASE_DB_PASSWORD_REQUIRED=YES\n'
    return 1
  }

  printf '%s\n' '========== REMOTE HISTORY BEFORE =========='
  supabase migration list --linked || return 1

  printf '%s\n' '========== FETCH REMOTE MIGRATIONS =========='
  supabase migration fetch --linked --yes || return 1

  mapfile -t CHANGES < <(git status --porcelain)
  printf 'RECOVERY_CHANGE_COUNT=%s\n' "${#CHANGES[@]}"
  printf '%s\n' "${CHANGES[@]}"

  [[ "${#CHANGES[@]}" -eq 1 ]] || {
    printf 'RECOVERY_BLOCKED=UNEXPECTED_FILE_SET\n'
    return 1
  }

  STATUS_CODE="${CHANGES[0]:0:2}"
  RECOVERED_PATH="${CHANGES[0]:3}"

  [[ "$STATUS_CODE" == '??' ]] || {
    printf 'RECOVERY_BLOCKED=EXPECTED_NEW_UNTRACKED_FILE\n'
    return 1
  }

  [[ "$RECOVERED_PATH" == supabase/migrations/${EXPECTED_VERSION}_*.sql ]] || {
    printf 'RECOVERY_BLOCKED=UNEXPECTED_MIGRATION_PATH\n'
    return 1
  }

  [[ -s "$RECOVERED_PATH" ]] || {
    printf 'RECOVERY_BLOCKED=EMPTY_MIGRATION\n'
    return 1
  }

  RECOVERED_SHA256="$(sha256sum "$RECOVERED_PATH" | awk '{print $1}')"
  printf 'RECOVERED_PATH=%s\n' "$RECOVERED_PATH"
  printf 'RECOVERED_SHA256=%s\n' "$RECOVERED_SHA256"
  printf 'RECOVERED_LINES=%s\n' "$(wc -l < "$RECOVERED_PATH")"

  git add -- "$RECOVERED_PATH" || return 1
  git diff --cached --check || return 1
  git commit -m "chore(supabase): recover applied migration ${EXPECTED_VERSION}" || return 1
  git push origin "$BRANCH" || return 1

  printf '%s\n' '============================================================'
  printf 'REMOTE_MIGRATION_RECOVERY=PASS\n'
  printf 'RECOVERED_VERSION=%s\n' "$EXPECTED_VERSION"
  printf 'RECOVERED_PATH=%s\n' "$RECOVERED_PATH"
  printf 'RECOVERED_SHA256=%s\n' "$RECOVERED_SHA256"
  printf 'RECOVERY_COMMIT=%s\n' "$(git rev-parse HEAD)"
  printf 'NEXT=RERUN_CARTERA_001B_REMOTE_ACCEPTANCE\n'
  printf '%s\n' '============================================================'
}

mkdir -p "$LOG_DIR"
main 2>&1 | tee "$LOG_FILE"
RUN_STATUS="${PIPESTATUS[0]}"
printf 'EVIDENCE_PATH=%s\n' "$LOG_FILE"
[[ "$RUN_STATUS" -eq 0 ]]
