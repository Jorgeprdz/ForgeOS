#!/data/data/com.termux/files/usr/bin/bash
set -uo pipefail

REPO="${FORGE_REPO:-/storage/emulated/0/Forge OS}"
BRANCH="feature/cartera-001b-remote-acceptance"
MINIMUM_IMPLEMENTATION_HEAD="02ed3d50b54fe8c5758eb0ca30e620a7f78c6370"
LOG_DIR="${FORGE_EVIDENCE_DIR:-/storage/emulated/0/ForgeGemini}"
STAMP="$(date +%Y%m%d-%H%M%S)"
LOG_FILE="$LOG_DIR/cartera-001b-remote-acceptance-$STAMP.log"

main() {
  printf '%s\n' '============================================================'
  printf '%s\n' 'FORGE CARTERA — 001B REMOTE ACCEPTANCE'
  printf '%s\n' '============================================================'
  printf 'REPO=%s\nBRANCH=%s\n' "$REPO" "$BRANCH"

  for required in git node supabase psql; do
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

  if [[ -n "$(git status --porcelain)" ]]; then
    printf '%s\n' 'WORKTREE_STATUS=DIRTY'
    git status --short
    printf '%s\n' 'REMOTE_ACCEPTANCE_BLOCKED=COMMIT_OR_STASH_FIRST'
    return 1
  fi

  printf '%s\n' '========== SOURCE GATE =========='
  git fetch origin "$BRANCH" || return 1
  git switch "$BRANCH" 2>/dev/null \
    || git switch --track -c "$BRANCH" "origin/$BRANCH" \
    || return 1
  git pull --ff-only origin "$BRANCH" || return 1

  CURRENT_BRANCH="$(git branch --show-current)"
  CURRENT_HEAD="$(git rev-parse HEAD)"
  printf 'CURRENT_BRANCH=%s\nCURRENT_HEAD=%s\n' "$CURRENT_BRANCH" "$CURRENT_HEAD"

  [[ "$CURRENT_BRANCH" == "$BRANCH" ]] || {
    printf 'SOURCE_GATE=FAIL_WRONG_BRANCH\n'
    return 1
  }

  git merge-base --is-ancestor "$MINIMUM_IMPLEMENTATION_HEAD" HEAD || {
    printf 'SOURCE_GATE=FAIL_MISSING_001B_HARDENING\n'
    return 1
  }
  printf 'SOURCE_GATE=PASS\n'

  for migration in \
    supabase/migrations/20260730000100_cartera001b_quote_lifecycle_event_bridge.sql \
    supabase/migrations/20260730000110_cartera001b_idempotency_conflict_hardening.sql \
    supabase/migrations/20260730000120_cartera001b_quote_authority_projection_hardening.sql \
    scripts/ci/cartera-001b-remote-acceptance.sql; do
    [[ -f "$migration" ]] || {
      printf 'REQUIRED_FILE_MISSING=%s\n' "$migration"
      return 1
    }
  done

  printf '%s\n' '========== TARGETED TESTS =========='
  node --test tests/cartera-001b-*.mjs || return 1
  printf 'TARGETED_TESTS=PASS\n'

  printf '%s\n' '========== CURRENT REMOTE HISTORY =========='
  supabase migration list --linked || return 1

  printf '%s\n' '========== MIGRATION DRY RUN =========='
  supabase db push --linked --dry-run || return 1
  printf 'REMOTE_DRY_RUN=PASS\n'

  DB_URL="${SUPABASE_DB_URL:-${DATABASE_URL:-}}"
  if [[ -z "$DB_URL" && -f supabase/.temp/pooler-url ]]; then
    DB_URL="$(cat supabase/.temp/pooler-url)"
  fi

  if [[ -z "$DB_URL" ]]; then
    printf '%s\n' 'DATABASE_URL_REQUIRED=YES'
    printf '%s\n' 'No se aplicó ninguna migración remota.'
    printf '%s\n' 'Exporta SUPABASE_DB_URL con la URL Session pooler del panel Connect y vuelve a ejecutar.'
    printf '%s\n' "Ejemplo: export SUPABASE_DB_URL='postgresql://postgres.PROJECT_REF:PASSWORD@HOST:5432/postgres?sslmode=require'"
    return 1
  fi
  printf 'DATABASE_URL_GATE=PASS\n'

  printf '%s\n' '========== REMOTE MIGRATION PUSH =========='
  supabase db push --linked || return 1
  printf 'SUPABASE_REMOTE_MIGRATION=PASS\n'

  printf '%s\n' '========== TRANSACTIONAL REMOTE ACCEPTANCE =========='
  ACCEPTANCE_OUTPUT="$(
    psql "$DB_URL" \
      -v ON_ERROR_STOP=1 \
      -f scripts/ci/cartera-001b-remote-acceptance.sql \
      2>&1
  )" || {
    printf '%s\n' "$ACCEPTANCE_OUTPUT"
    printf 'REMOTE_RLS_RPC_ACCEPTANCE=FAIL\n'
    return 1
  }
  printf '%s\n' "$ACCEPTANCE_OUTPUT"

  grep -q 'PASS CARTERA001B_REMOTE_ACCEPTANCE' <<< "$ACCEPTANCE_OUTPUT" || {
    printf 'REMOTE_ACCEPTANCE_MARKER=NOT_FOUND\n'
    return 1
  }
  printf 'REMOTE_RLS_RPC_ACCEPTANCE=PASS\n'

  printf '%s\n' '========== FINAL REMOTE HISTORY =========='
  REMOTE_HISTORY="$(supabase migration list --linked 2>&1)" || {
    printf '%s\n' "$REMOTE_HISTORY"
    return 1
  }
  printf '%s\n' "$REMOTE_HISTORY"

  for version in 20260730000100 20260730000110 20260730000120; do
    grep -q "$version" <<< "$REMOTE_HISTORY" || {
      printf 'REMOTE_MIGRATION_MISSING=%s\n' "$version"
      return 1
    }
  done

  printf '%s\n' '============================================================'
  printf 'CARTERA_001B_REMOTE_ACCEPTANCE=PASS\n'
  printf 'SOURCE_HEAD=%s\n' "$CURRENT_HEAD"
  printf 'MIGRATIONS=20260730000100,20260730000110,20260730000120\n'
  printf 'RLS=PASS\nRPC=PASS\nIDEMPOTENCY=PASS\nCONFLICTS=PASS\n'
  printf 'CORRECTIONS=PASS\nQUOTE_AUTHORITY_PROJECTION=PASS\nAPPEND_ONLY=PASS\n'
  printf 'APPLICATION_EFFECTS=BLOCKED\nTEST_FIXTURES_ROLLED_BACK=YES\n'
  printf 'NEXT=CARTERA_001C_PROSPECT_DETAIL_TIMELINE_PROJECTION\n'
  printf '%s\n' '============================================================'
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
