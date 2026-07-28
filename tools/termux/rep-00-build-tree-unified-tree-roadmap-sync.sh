#!/usr/bin/env bash
set -Eeuo pipefail
IFS=$'\n\t'

clear

REPO="/storage/emulated/0/Forge OS Activity"
FES_REPO="/storage/emulated/0/Forge OS"
MUI_REPO="/home/jorge/ForgeOS-material3"
RESULTS_DIR="/storage/emulated/0/ForgeGemini"

BRANCH="feature/performance-scoring-contract-foundation"
REMOTE="origin"
EXPECTED_SOURCE="ba5dfc21c7d23325b49f16a453939c85ba5ca41b"

MASTER_TREE_REL="FORGE_MASTER_BUILD_TREE.md"
UNIFIED_TREE_REL="docs/architecture/source-truth/FORGE_UNIFIED_BUILD_TREE_001.md"
ROADMAP_LOCK_REL="docs/roadmap/FORGE_ROADMAP_LOCK_001.md"

PERF_CHECKPOINT_REL="docs/architecture/performance/PERF_FOUNDATION_HANDOFF_TO_UNIVERSAL_REPORTING_001.md"
REPORTING_DECISION_REL="docs/architecture/reporting/REP_UNIVERSAL_REPORTING_SYSTEM_DECISION_001.md"
REP_ROADMAP_REL="docs/roadmap/REP_UNIVERSAL_REPORTING_ROADMAP_001.md"
EVIDENCE_REL="docs/evidence/reporting/REP_00_BUILD_TREE_UNIFIED_TREE_ROADMAP_SYNC_001.md"
AUDIT_REL="docs/evidence/reporting/rep-00-build-tree-unified-tree-roadmap-sync-audit.json"
CLOSURE_REL="docs/architecture/reporting/REP_00_BUILD_TREE_UNIFIED_TREE_ROADMAP_SYNC_CLOSURE.md"
TOOL_REL="tools/termux/rep-00-build-tree-unified-tree-roadmap-sync.sh"

PERF06_CLOSURE_REL="docs/architecture/performance/PERF-06_PERFORMANCE_SURFACE_ADAPTER_CONTRACT_CLOSURE.md"

MASTER_TREE="$REPO/$MASTER_TREE_REL"
UNIFIED_TREE="$REPO/$UNIFIED_TREE_REL"
ROADMAP_LOCK="$REPO/$ROADMAP_LOCK_REL"
PERF_CHECKPOINT="$REPO/$PERF_CHECKPOINT_REL"
REPORTING_DECISION="$REPO/$REPORTING_DECISION_REL"
REP_ROADMAP="$REPO/$REP_ROADMAP_REL"
EVIDENCE="$REPO/$EVIDENCE_REL"
AUDIT="$REPO/$AUDIT_REL"
CLOSURE="$REPO/$CLOSURE_REL"
TOOL_COPY="$REPO/$TOOL_REL"

TREE_MARKER="PERF_FOUNDATION_AND_UNIVERSAL_REPORTING_ROADMAP_001"
MASTER_START="<!-- FORGEOS:${TREE_MARKER}:START -->"
MASTER_END="<!-- FORGEOS:${TREE_MARKER}:END -->"
UNIFIED_START="<!-- FORGE:${TREE_MARKER}:START -->"
UNIFIED_END="<!-- FORGE:${TREE_MARKER}:END -->"
ROADMAP_START="<!-- FORGE:${TREE_MARKER}:START -->"
ROADMAP_END="<!-- FORGE:${TREE_MARKER}:END -->"

IMPLEMENTATION_MESSAGE="docs(reporting): register universal reporting roadmap"
CLOSURE_MESSAGE="docs(reporting): close REP-00 tree and roadmap sync"
CLOSURE_MARKER="REP_00_BUILD_TREE_UNIFIED_TREE_ROADMAP_SYNC=CLOSED"

LOG="$RESULTS_DIR/REP-00_BUILD_TREE_UNIFIED_TREE_ROADMAP_SYNC.log"
SUMMARY="$RESULTS_DIR/REP-00_BUILD_TREE_UNIFIED_TREE_ROADMAP_SYNC.summary.txt"

DIVIDER="────────────────────────────────────────────────────────────"

RESET=$'\033[0m'
BOLD=$'\033[1m'
DIM=$'\033[2m'
RED=$'\033[31m'
GREEN=$'\033[32m'
YELLOW=$'\033[33m'
BLUE=$'\033[34m'
MAGENTA=$'\033[35m'
CYAN=$'\033[36m'
BRIGHT_CYAN=$'\033[96m'
BRIGHT_MAGENTA=$'\033[95m'
PURPLE=$'\033[38;5;141m'

PHASE_STATUS="RUNNING"
RECOVERY_MODE="NONE"
FAILURE_REASON="NONE"
WORKTREE_STATUS="UNKNOWN"
CLIPBOARD_STATUS="NOT_ATTEMPTED"

BUILD_TREE_SYNC="NOT_RUN"
UNIFIED_TREE_SYNC="NOT_RUN"
ROADMAP_LOCK_SYNC="NOT_RUN"
PERF_CHECKPOINT_SYNC="NOT_RUN"
REP_ROADMAP_SYNC="NOT_RUN"
AUDIT_VALIDATION="NOT_RUN"
REMOTE_VERIFICATION="NOT_RUN"

IMPLEMENTATION_COMMIT=""
CLOSURE_COMMIT=""
REMOTE_COMMIT=""

FES_BEFORE=""
FES_AFTER=""
MUI_BEFORE=""
MUI_AFTER=""
MAIN_BEFORE=""
MAIN_AFTER=""
FES_MUTATION="UNKNOWN"
MUI_MUTATION="UNKNOWN"
MUI_REPO_STATE="UNKNOWN"
MAIN_MUTATION="UNKNOWN"

FAILED_COMMAND=""
FAILED_LINE=""
FAILED_CODE=""

mkdir -p "$RESULTS_DIR"
: > "$LOG"

exec 3>&1 4>&2
exec >>"$LOG" 2>&1

terminal() {
  printf '%b\n' "$*" >&3
}

plain() {
  printf '%s\n' "$*"
}

both() {
  plain "$1"
  terminal "${2:-${BLUE}$1${RESET}}"
}

section() {
  plain ""
  plain "$DIVIDER"
  plain "$1"
  plain "$DIVIDER"

  terminal ""
  terminal "${BRIGHT_CYAN}${DIVIDER}${RESET}"
  terminal "${BOLD}${BRIGHT_MAGENTA}$1${RESET}"
  terminal "${BRIGHT_CYAN}${DIVIDER}${RESET}"
}

ok() {
  plain "✓ $*"
  terminal "${GREEN}${BOLD}✓${RESET} ${GREEN}$*${RESET}"
}

info() {
  plain "• $*"
  terminal "${CYAN}●${RESET} ${CYAN}$*${RESET}"
}

warn() {
  plain "! $*"
  terminal "${YELLOW}${BOLD}!${RESET} ${YELLOW}$*${RESET}"
}

fail() {
  FAILURE_REASON="$*"
  plain "✗ $*"
  terminal "${RED}${BOLD}✗ $*${RESET}"
  false
}

git_cmd() {
  env \
    -u GIT_DIR \
    -u GIT_WORK_TREE \
    -u GIT_COMMON_DIR \
    -u GIT_INDEX_FILE \
    git \
      -c safe.directory='*' \
      "$@"
}

is_git_repo() {
  local repo="$1"

  [[ -d "$repo" ]] &&
    git_cmd -C "$repo" \
      rev-parse \
      --is-inside-work-tree \
      >/dev/null 2>&1
}

snapshot_repo() {
  local repo="$1"

  {
    git_cmd -C "$repo" \
      branch --show-current
    git_cmd -C "$repo" \
      rev-parse HEAD
    git_cmd -C "$repo" \
      status \
      --porcelain=v1 \
      --untracked-files=all
  } |
    sha256sum |
    awk '{print $1}'
}

snapshot_optional_repo() {
  local repo="$1"

  if is_git_repo "$repo"; then
    snapshot_repo "$repo"
  else
    printf 'ABSENT_NOT_TOUCHED'
  fi
}

remote_branch_commit() {
  git_cmd -C "$REPO" \
    ls-remote \
    --heads \
    "$REMOTE" \
    "refs/heads/$BRANCH" |
    awk 'NR == 1 {
      print $1
    }'
}

write_summary() {
  local code="${1:-0}"

  {
    printf 'PHASE_STATUS=%s\n' "$PHASE_STATUS"
    printf 'RESULT_CODE=%s\n' "$code"
    printf 'RECOVERY_MODE=%s\n' "$RECOVERY_MODE"
    printf 'PERFORMANCE_BRANCH=%s\n' "$BRANCH"
    printf 'EXPECTED_SOURCE=%s\n' "$EXPECTED_SOURCE"

    printf 'BUILD_TREE_SYNC=%s\n' "$BUILD_TREE_SYNC"
    printf 'UNIFIED_TREE_SYNC=%s\n' "$UNIFIED_TREE_SYNC"
    printf 'ROADMAP_LOCK_SYNC=%s\n' "$ROADMAP_LOCK_SYNC"
    printf 'PERF_CHECKPOINT_SYNC=%s\n' "$PERF_CHECKPOINT_SYNC"
    printf 'REP_ROADMAP_SYNC=%s\n' "$REP_ROADMAP_SYNC"
    printf 'AUDIT_VALIDATION=%s\n' "$AUDIT_VALIDATION"
    printf 'REMOTE_VERIFICATION=%s\n' "$REMOTE_VERIFICATION"

    printf 'PERFORMANCE_FOUNDATION_STATUS=CLOSED_THROUGH_PERF_06\n'
    printf 'PERFORMANCE_LAST_CLOSED_PHASE=PERF-06_PERFORMANCE_SURFACE_ADAPTER_CONTRACT\n'
    printf 'PERFORMANCE_UI_INTEGRATION_READY=YES\n'
    printf 'PERFORMANCE_NEXT=UI-PERF-01_PERFORMANCE_SURFACE_INTEGRATION\n'
    printf 'PERFORMANCE_REPORTING_AUTHORITY=NO\n'
    printf 'PERFORMANCE_REPORT_PROVIDER=PLANNED_REP_06\n'

    printf 'REPORTING_AUTHORITY=UNIVERSAL_REPORTING_KERNEL\n'
    printf 'REPORTING_ROADMAP_STATUS=REGISTERED\n'
    printf 'REPORTING_NEXT=REP-01_UNIVERSAL_REPORTING_KERNEL_FOUNDATION\n'
    printf 'REPORTING_NEXT_BRANCH=feature/universal-reporting-kernel-foundation\n'
    printf 'REPORTING_PERIOD_YTD=PLANNED_REP_02\n'
    printf 'REPORTING_ROADMAP_PHASES=13\n'
    printf 'REPORTING_PROVIDER_COUNT_PLANNED=5\n'

    printf 'UI_MIGRATION_FREEZE_RESPECTED=YES\n'
    printf 'PRODUCTIVE_UI_MUTATION=NO\n'
    printf 'REMOTE_DATABASE_MUTATION=NO\n'
    printf 'FES_MUTATION=%s\n' "$FES_MUTATION"
    printf 'MUI_MUTATION=%s\n' "$MUI_MUTATION"
    printf 'MUI_REPO_STATE=%s\n' "$MUI_REPO_STATE"
    printf 'MAIN_MUTATION=%s\n' "$MAIN_MUTATION"
    printf 'WORKTREE=%s\n' "$WORKTREE_STATUS"

    printf 'IMPLEMENTATION_COMMIT=%s\n' "${IMPLEMENTATION_COMMIT:-NOT_CREATED}"
    printf 'CLOSURE_COMMIT=%s\n' "${CLOSURE_COMMIT:-NOT_CREATED}"
    printf 'REMOTE_COMMIT=%s\n' "${REMOTE_COMMIT:-UNKNOWN}"
    printf 'FAILURE_REASON=%s\n' "$FAILURE_REASON"

    if [[ -n "$FAILED_COMMAND" ]]; then
      printf 'FAILED_COMMAND=%s\n' "$FAILED_COMMAND"
      printf 'FAILED_LINE=%s\n' "$FAILED_LINE"
      printf 'FAILED_CODE=%s\n' "$FAILED_CODE"
    fi

    printf 'CLIPBOARD=%s\n' "$CLIPBOARD_STATUS"
    printf 'NEXT=REP-01_UNIVERSAL_REPORTING_KERNEL_FOUNDATION\n'
    printf 'LOG=%s\n' "$LOG"
    printf 'SUMMARY=%s\n' "$SUMMARY"
  } > "$SUMMARY"
}

copy_summary() {
  local setter=""

  setter="$(
    command -v termux-clipboard-set 2>/dev/null ||
      true
  )"

  if [[ -z "$setter" ]]; then
    setter="/data/data/com.termux/files/usr/bin/termux-clipboard-set"
    [[ -x "$setter" ]] ||
      setter=""
  fi

  if [[ -z "$setter" ]]; then
    CLIPBOARD_STATUS="UNAVAILABLE"
    return 0
  fi

  if "$setter" < "$SUMMARY"; then
    CLIPBOARD_STATUS="TERMUX_API_SET"
  else
    CLIPBOARD_STATUS="TERMUX_API_FAILED_NON_BLOCKING"
  fi
}

on_error() {
  local code=$?

  PHASE_STATUS="FAILED"

  if [[ "$FAILURE_REASON" == "NONE" ]]; then
    FAILURE_REASON="Fallo inesperado durante ${BASH_COMMAND:-comando desconocido}"
  fi

  FAILED_COMMAND="${BASH_COMMAND:-unknown}"
  FAILED_LINE="${BASH_LINENO[0]:-unknown}"
  FAILED_CODE="$code"

  WORKTREE_STATUS="$(
    git_cmd -C "$REPO" \
      status \
      --short \
      --untracked-files=all \
      2>/dev/null ||
      printf 'UNAVAILABLE'
  )"

  write_summary "$code" || true
  copy_summary || true
  write_summary "$code" || true

  terminal ""
  terminal "${RED}${DIVIDER}${RESET}"
  terminal "${BOLD}Error${RESET}"
  terminal "${RED}${DIVIDER}${RESET}"
  terminal "${RED}✗${RESET} $FAILURE_REASON"
  terminal "${RED}✗${RESET} Comando: $FAILED_COMMAND"
  terminal "${RED}✗${RESET} Línea: $FAILED_LINE"
  terminal "${RED}✗${RESET} Código: $FAILED_CODE"
  terminal "${YELLOW}!${RESET} Últimas líneas:"
  tail -n 220 "$LOG" >&3 || true
  terminal "${DIM}LOG=$LOG${RESET}"
  terminal "${DIM}SUMMARY=$SUMMARY${RESET}"

  return "$code"
}
trap on_error ERR

validate_dependencies() {
  local dependencies=(
    git
    python3
    awk
    grep
    sed
    sort
    sha256sum
    tail
  )
  local missing=()
  local dependency=""

  for dependency in "${dependencies[@]}"; do
    command -v "$dependency" >/dev/null 2>&1 ||
      missing+=("$dependency")
  done

  ((${#missing[@]} == 0)) ||
    fail "Dependencias faltantes: ${missing[*]}"

  ok "Dependencias verificadas"
}

known_path() {
  case "$1" in
    "$MASTER_TREE_REL"|\
    "$UNIFIED_TREE_REL"|\
    "$ROADMAP_LOCK_REL"|\
    "$PERF_CHECKPOINT_REL"|\
    "$REPORTING_DECISION_REL"|\
    "$REP_ROADMAP_REL"|\
    "$EVIDENCE_REL"|\
    "$AUDIT_REL"|\
    "$CLOSURE_REL"|\
    "$TOOL_REL")
      return 0
      ;;
  esac

  return 1
}

clean_partial() {
  local dirty="$1"
  local line=""
  local candidate=""

  while IFS= read -r line; do
    [[ -n "$line" ]] || continue
    candidate="${line:3}"

    if [[ "$candidate" == *" -> "* ]]; then
      candidate="${candidate##* -> }"
    fi

    known_path "$candidate" ||
      fail "Cambio ajeno al sync REP-00: $candidate"
  done <<< "$dirty"

  git_cmd -C "$REPO" \
    restore \
    --staged \
    --worktree \
    --source=HEAD \
    -- \
    "$MASTER_TREE_REL" \
    "$UNIFIED_TREE_REL" \
    "$ROADMAP_LOCK_REL" \
    "$PERF_CHECKPOINT_REL" \
    "$REPORTING_DECISION_REL" \
    "$REP_ROADMAP_REL" \
    "$EVIDENCE_REL" \
    "$AUDIT_REL" \
    "$CLOSURE_REL" \
    "$TOOL_REL" \
    2>/dev/null ||
    true

  rm -f \
    "$PERF_CHECKPOINT" \
    "$REPORTING_DECISION" \
    "$REP_ROADMAP" \
    "$EVIDENCE" \
    "$AUDIT" \
    "$CLOSURE" \
    "$TOOL_COPY"

  RECOVERY_MODE="PARTIAL_RESET_AND_REGENERATE"
  ok "Ejecución parcial REP-00 limpiada"
}

source_gate() {
  section "Fuente"

  for repo in \
    "$REPO" \
    "$FES_REPO"; do
    is_git_repo "$repo" ||
      fail "Repositorio inválido: $repo"
  done

  if is_git_repo "$MUI_REPO"; then
    MUI_REPO_STATE="PRESENT_OBSERVED"
    info "MUI presente: guard habilitado"
  else
    MUI_REPO_STATE="ABSENT_NOT_TOUCHED"
    warn "MUI ausente: no es dependencia de REP-00"
  fi

  local dirty=""
  dirty="$(
    git_cmd -C "$REPO" \
      status \
      --short \
      --untracked-files=all
  )"

  if [[ -n "$dirty" ]]; then
    clean_partial "$dirty"
  fi

  [[ -z "$(
    git_cmd -C "$REPO" \
      status \
      --short \
      --untracked-files=all
  )" ]] ||
    fail "El repositorio no quedó limpio"

  git_cmd -C "$REPO" \
    config \
    --replace-all \
    remote.origin.fetch \
    '+refs/heads/*:refs/remotes/origin/*'

  git_cmd -C "$REPO" \
    fetch \
    "$REMOTE" \
    --prune \
    --tags

  git_cmd -C "$REPO" \
    fetch \
    "$REMOTE" \
    "+refs/heads/$BRANCH:refs/remotes/$REMOTE/$BRANCH"

  if git_cmd -C "$REPO" \
    show-ref \
    --verify \
    --quiet \
    "refs/heads/$BRANCH"; then
    git_cmd -C "$REPO" \
      switch "$BRANCH"
  else
    git_cmd -C "$REPO" \
      switch \
      -c "$BRANCH" \
      --track \
      "$REMOTE/$BRANCH"
  fi

  local remote_head=""
  local head=""

  remote_head="$(
    git_cmd -C "$REPO" \
      rev-parse \
      "refs/remotes/$REMOTE/$BRANCH"
  )"
  head="$(
    git_cmd -C "$REPO" \
      rev-parse HEAD
  )"

  if [[ "$head" != "$remote_head" ]]; then
    git_cmd -C "$REPO" \
      merge \
      --ff-only \
      "refs/remotes/$REMOTE/$BRANCH"
    head="$(
      git_cmd -C "$REPO" \
        rev-parse HEAD
    )"
  fi

  if git_cmd -C "$REPO" \
    show "HEAD:$CLOSURE_REL" \
    2>/dev/null |
    grep -Fq "$CLOSURE_MARKER"; then
    RECOVERY_MODE="ALREADY_CLOSED"
    CLOSURE_COMMIT="$head"
  elif [[ "$(
    git_cmd -C "$REPO" \
      log -1 --format='%s'
  )" == "$IMPLEMENTATION_MESSAGE" ]]; then
    IMPLEMENTATION_COMMIT="$head"
    RECOVERY_MODE="IMPLEMENTATION_ALREADY_PUBLISHED"
  else
    [[ "$head" == "$EXPECTED_SOURCE" ]] ||
      fail "HEAD no coincide con el cierre PERF-06"

    [[ "$remote_head" == "$EXPECTED_SOURCE" ]] ||
      fail "La rama remota no coincide con PERF-06"
  fi

  for required in \
    "$MASTER_TREE_REL" \
    "$UNIFIED_TREE_REL" \
    "$ROADMAP_LOCK_REL" \
    "$PERF06_CLOSURE_REL"; do
    git_cmd -C "$REPO" \
      cat-file \
      -e "HEAD:$required" \
      2>/dev/null ||
      fail "Falta archivo requerido: $required"
  done

  git_cmd -C "$REPO" \
    show \
    "$EXPECTED_SOURCE:$PERF06_CLOSURE_REL" |
    grep -Fq \
      'PERF_06_PERFORMANCE_SURFACE_ADAPTER_CONTRACT=CLOSED' ||
    fail "PERF-06 no está cerrado"

  git_cmd -C "$REPO" \
    show \
    "$EXPECTED_SOURCE:$PERF06_CLOSURE_REL" |
    grep -Fq \
      'UI_INTEGRATION_READY=YES' ||
    fail "PERF-06 no declaró readiness UI"

  FES_BEFORE="$(
    snapshot_repo "$FES_REPO"
  )"
  MUI_BEFORE="$(
    snapshot_optional_repo "$MUI_REPO"
  )"
  MAIN_BEFORE="$(
    git_cmd -C "$REPO" \
      ls-remote \
      --heads \
      "$REMOTE" \
      refs/heads/main |
      awk 'NR == 1 {
        print $1
      }'
  )"

  ok "PERF-06 cerrado y verificado"
  ok "Build Tree, Unified Tree y Roadmap Lock presentes"
  both "SOURCE_COMMIT=$EXPECTED_SOURCE"
  both "RECOVERY_MODE=$RECOVERY_MODE"
}

append_block() {
  local file="$1"
  local start="$2"
  local end="$3"
  local body_file="$4"

  python3 - \
    "$file" \
    "$start" \
    "$end" \
    "$body_file" <<'PY'
from pathlib import Path
import sys

path = Path(sys.argv[1])
start = sys.argv[2]
end = sys.argv[3]
body = Path(sys.argv[4]).read_text(
    encoding="utf-8",
).rstrip()

text = path.read_text(
    encoding="utf-8",
)

block = (
    f"{start}\n"
    f"{body}\n"
    f"{end}\n"
)

if start in text or end in text:
    if text.count(start) != 1 or text.count(end) != 1:
        raise RuntimeError(
            f"invalid marker count in {path}"
        )

    before, rest = text.split(
        start,
        1,
    )
    _, after = rest.split(
        end,
        1,
    )

    text = (
        before.rstrip()
        + "\n\n"
        + block
        + after.lstrip("\n")
    )
else:
    text = (
        text.rstrip()
        + "\n\n"
        + block
    )

path.write_text(
    text.rstrip() + "\n",
    encoding="utf-8",
)
PY
}

write_tree_blocks() {
  section "Build Tree y Unified Tree"

  local temp_dir=""
  temp_dir="$RESULTS_DIR/.rep00-tree-blocks"
  mkdir -p "$temp_dir"

  cat > "$temp_dir/master.md" <<'MASTER'
## Performance Foundation Checkpoint and Universal Reporting Roadmap

Status: `REP_00_BUILD_TREE_UNIFIED_TREE_ROADMAP_SYNC=IMPLEMENTED_PENDING_ACCEPTANCE`

### Performance checkpoint

- `PERF-01` — scoring contract discovery: CLOSED.
- `PERF-02` — versioned 25-point scoring policy: CLOSED.
- `PERF-03` — daily and period runtime: CLOSED.
- `PERF-04` — daily and period read models: CLOSED.
- `PERF-05` — Supabase read composition over governed Activity RPCs: CLOSED.
- `PERF-06` — framework-neutral surface adapter: CLOSED.
- Current Performance boundary: `PERFORMANCE_FOUNDATION_STATUS=CLOSED_THROUGH_PERF_06`.
- UI readiness: `PERFORMANCE_UI_INTEGRATION_READY=YES`.
- Held UI next: `UI-PERF-01_PERFORMANCE_SURFACE_INTEGRATION`.
- UI migration freeze remains respected.
- Performance is not the universal reporting authority.
- Performance becomes a planned reporting provider in `REP-06`.

### Universal Reporting System

- Reporting authority: `UNIVERSAL_REPORTING_KERNEL`.
- Kernel owns period resolution, report definitions, orchestration, aggregation,
  comparison semantics and universal output contracts.
- Domain providers own measures, dimensions, evidence, provenance and domain
  authority.
- Planned providers: Performance, Commissions, Portfolio, Activity and Pipeline.
- UI and export adapters are downstream consumers; they do not own reporting
  calculations or domain truth.

### Universal period families

- To-date: `TODAY`, `WTD`, `MTD`, `QTD`, `YTD`, `FYTD`.
- Calendar: week, month, two-month period, quarter, half-year, year, two-year.
- Rolling: 7, 30, 90 and 365 days; rolling 12 months.
- Custom: explicit date range.
- `SEMIANNUAL` means six months.
- `BIENNIAL` means two years.
- Ambiguous `BIANNUAL` is not a canonical identifier.

### Roadmap

- `REP-00` — Build Tree, Unified Tree and roadmap registration.
- `REP-01` — Universal Reporting Kernel Foundation.
- `REP-02` — Universal Period Resolver and Calendar Policy.
- `REP-03` — Report Definition and Provider Port.
- `REP-04` — Universal Report Model and Aggregation Runtime.
- `REP-05` — Comparison and Baseline Engine.
- `REP-06` — Performance Report Provider.
- `REP-07` — Commissions Report Provider.
- `REP-08` — Portfolio Report Provider.
- `REP-09` — Activity Report Provider.
- `REP-10` — Pipeline Report Provider.
- `REP-11` — Export and Delivery Adapters.
- `REP-12` — Reporting Surface Adapter Contract.
- `UI-REP-01` — Reporting Surface Integration.

`NEXT=REP-01_UNIVERSAL_REPORTING_KERNEL_FOUNDATION`
MASTER

  cat > "$temp_dir/unified.md" <<'UNIFIED'
## 🟢 Performance Foundation / 🔵 Universal Reporting System

```text
🟢 PERFORMANCE FOUNDATION
│
├── 🟢 PERF-01 Scoring Contract Discovery
├── 🟢 PERF-02 Scoring Policy Contract
│   └── 🟢 Official daily target: 25 points
├── 🟢 PERF-03 Performance Period Runtime
├── 🟢 PERF-04 Performance Read Model Contract
├── 🟢 PERF-05 Supabase Read Composition
├── 🟢 PERF-06 Performance Surface Adapter Contract
│   ├── 🟢 UI_INTEGRATION_READY=YES
│   ├── 🟢 loadDay / loadPeriod / loadDashboard
│   └── 🟢 no ranking, human-worth or enforcement authority
│
├── ⚫ UI-PERF-01 Performance Surface Integration
│   └── ⚫ held by UI migration freeze
│
└── 🔵 Performance reporting relationship
    ├── 🔵 Performance is a provider, not reporting authority
    └── 🔵 provider implementation planned at REP-06

🔵 UNIVERSAL REPORTING SYSTEM
│
├── 🟢 REP-00 Tree and Roadmap Registration
├── 🔵 REP-01 Universal Reporting Kernel Foundation
├── 🔵 REP-02 Universal Period Resolver and Calendar Policy
│   ├── 🔵 TODAY / WTD / MTD / QTD / YTD / FYTD
│   ├── 🔵 calendar week / month / two-month / quarter
│   ├── 🔵 half-year / year / two-year
│   ├── 🔵 rolling 7 / 30 / 90 / 365 days
│   ├── 🔵 rolling 12 months
│   └── 🔵 custom range
├── 🔵 REP-03 Report Definition and Provider Port
├── 🔵 REP-04 Universal Report Model and Aggregation Runtime
├── 🔵 REP-05 Comparison and Baseline Engine
│   ├── 🔵 previous period
│   ├── 🔵 previous year same period
│   ├── 🔵 year over year
│   ├── 🔵 target / budget
│   └── 🔵 custom baseline
├── 🔵 REP-06 Performance Report Provider
├── 🔵 REP-07 Commissions Report Provider
├── 🔵 REP-08 Portfolio Report Provider
├── 🔵 REP-09 Activity Report Provider
├── 🔵 REP-10 Pipeline Report Provider
├── 🔵 REP-11 Export and Delivery Adapters
├── 🔵 REP-12 Reporting Surface Adapter Contract
└── ⚫ UI-REP-01 Reporting Surface Integration
    └── ⚫ begins only after kernel and adapters are accepted
```

```text
REPORTING_AUTHORITY=UNIVERSAL_REPORTING_KERNEL
PERFORMANCE_REPORTING_AUTHORITY=NO
PERFORMANCE_REPORT_PROVIDER=PLANNED_REP_06
NEXT=REP-01_UNIVERSAL_REPORTING_KERNEL_FOUNDATION
```
UNIFIED

  cat > "$temp_dir/roadmap.md" <<'ROADMAP'
## Universal Reporting Roadmap Registration

Status: `REP_00_BUILD_TREE_UNIFIED_TREE_ROADMAP_SYNC=IMPLEMENTED_PENDING_ACCEPTANCE`

### Current checkpoint

```text
PERFORMANCE_FOUNDATION_STATUS=CLOSED_THROUGH_PERF_06
PERFORMANCE_LAST_CLOSED_PHASE=PERF-06_PERFORMANCE_SURFACE_ADAPTER_CONTRACT
PERFORMANCE_UI_INTEGRATION_READY=YES
PERFORMANCE_NEXT=UI-PERF-01_PERFORMANCE_SURFACE_INTEGRATION
UI_MIGRATION_FREEZE_RESPECTED=YES
```

### Authority decision

```text
REPORTING_AUTHORITY=UNIVERSAL_REPORTING_KERNEL
PERFORMANCE_REPORTING_AUTHORITY=NO
PERFORMANCE_REPORT_PROVIDER=PLANNED_REP_06
COMMISSIONS_REPORT_PROVIDER=PLANNED_REP_07
PORTFOLIO_REPORT_PROVIDER=PLANNED_REP_08
ACTIVITY_REPORT_PROVIDER=PLANNED_REP_09
PIPELINE_REPORT_PROVIDER=PLANNED_REP_10
```

### Locked sequence

```text
REP-00  Build Tree / Unified Tree / roadmap registration
REP-01  Universal Reporting Kernel Foundation
REP-02  Universal Period Resolver and Calendar Policy
REP-03  Report Definition and Provider Port
REP-04  Universal Report Model and Aggregation Runtime
REP-05  Comparison and Baseline Engine
REP-06  Performance Report Provider
REP-07  Commissions Report Provider
REP-08  Portfolio Report Provider
REP-09  Activity Report Provider
REP-10  Pipeline Report Provider
REP-11  Export and Delivery Adapters
REP-12  Reporting Surface Adapter Contract
UI-REP-01 Reporting Surface Integration
```

### Period resolver lock

The universal resolver must support:

- `TODAY`, `WTD`, `MTD`, `QTD`, `YTD`, `FYTD`;
- calendar week, month, two-month period, quarter, half-year, year and two-year;
- rolling 7, 30, 90 and 365 days;
- rolling 12 months;
- explicit custom range;
- one canonical timezone and one `asOf` snapshot per report;
- fiscal-year start policy for `FYTD`;
- unambiguous identifiers: `SEMIANNUAL` and `BIENNIAL`.

`NEXT=REP-01_UNIVERSAL_REPORTING_KERNEL_FOUNDATION`
ROADMAP

  append_block \
    "$MASTER_TREE" \
    "$MASTER_START" \
    "$MASTER_END" \
    "$temp_dir/master.md"

  append_block \
    "$UNIFIED_TREE" \
    "$UNIFIED_START" \
    "$UNIFIED_END" \
    "$temp_dir/unified.md"

  append_block \
    "$ROADMAP_LOCK" \
    "$ROADMAP_START" \
    "$ROADMAP_END" \
    "$temp_dir/roadmap.md"

  BUILD_TREE_SYNC="PASS"
  UNIFIED_TREE_SYNC="PASS"
  ROADMAP_LOCK_SYNC="PASS"

  ok "Master Build Tree actualizado"
  ok "Unified Tree actualizado"
  ok "Roadmap Lock actualizado"
}

write_source_truth() {
  section "Checkpoint PERF y roadmap REP"

  mkdir -p \
    "$(dirname "$PERF_CHECKPOINT")" \
    "$(dirname "$REPORTING_DECISION")" \
    "$(dirname "$REP_ROADMAP")" \
    "$(dirname "$EVIDENCE")" \
    "$(dirname "$AUDIT")" \
    "$(dirname "$TOOL_COPY")"

  cat > "$PERF_CHECKPOINT" <<'PERF'
# Performance Foundation Handoff to Universal Reporting 001

```text
PERFORMANCE_FOUNDATION_HANDOFF=IMPLEMENTED_PENDING_ACCEPTANCE
PERFORMANCE_FOUNDATION_STATUS=CLOSED_THROUGH_PERF_06
PERFORMANCE_BRANCH=feature/performance-scoring-contract-foundation
PERFORMANCE_CLOSURE_COMMIT=ba5dfc21c7d23325b49f16a453939c85ba5ca41b
PERFORMANCE_UI_INTEGRATION_READY=YES
PERFORMANCE_REPORTING_AUTHORITY=NO
PERFORMANCE_REPORT_PROVIDER=PLANNED_REP_06
UI_MIGRATION_FREEZE_RESPECTED=YES
PRODUCTIVE_UI_MUTATION=NO
REMOTE_DATABASE_MUTATION=NO
```

## Closed foundation

| Phase | Result | Authority delivered |
|---|---|---|
| PERF-01 | CLOSED | scoring discovery and legacy authority reconciliation |
| PERF-02 | CLOSED | versioned 25-point policy and score projection |
| PERF-03 | CLOSED | daily and period runtime, maximum operational slice 31 days |
| PERF-04 | CLOSED | daily and period read models |
| PERF-05 | CLOSED | read-only Supabase composition over governed Activity RPC |
| PERF-06 | CLOSED | daily, period and dashboard surface adapter |

## Current stopping point

Performance backend work stops after `PERF-06`.

The next direct Performance phase is:

```text
UI-PERF-01_PERFORMANCE_SURFACE_INTEGRATION
```

That integration remains held by the active UI migration freeze. No additional
Performance backend phase is required for its operational daily or monthly UI.

## Reporting handoff

Long-horizon and cross-domain reporting is not added as `PERF-07`.
Performance becomes a provider to the Universal Reporting System at `REP-06`.

The reporting kernel, not Performance, owns:

- universal period semantics;
- YTD, QTD, MTD, WTD and FYTD resolution;
- long-range batching and aggregation;
- comparison semantics;
- universal report definitions and output model;
- provider orchestration;
- cross-domain reporting composition.

Performance continues to own only its versioned policy, scoring projection,
domain read models and Performance-specific authority boundaries.
PERF

  cat > "$REPORTING_DECISION" <<'DECISION'
# Universal Reporting System Decision 001

```text
DECISION=UNIVERSAL_REPORTING_KERNEL_IS_REPORTING_AUTHORITY
REPORTING_AUTHORITY=UNIVERSAL_REPORTING_KERNEL
DOMAIN_REPORTING_AUTHORITY=NO
PROVIDER_ADAPTERS_REQUIRED=YES
SURFACE_ADAPTER_AFTER_KERNEL=YES
EXPORT_ADAPTER_AFTER_UNIVERSAL_MODEL=YES
```

## Why universal

Reports are a shared system capability. Performance, Commissions, Portfolio,
Activity, Pipeline and future domains must not each implement separate period,
comparison, aggregation and export engines.

The Universal Reporting System is therefore a neutral orchestration and
projection layer. It does not own domain facts. It owns the rules for asking
providers for governed report slices and combining those slices into a
versioned universal report.

## Authority split

### Universal kernel owns

- report request validation;
- canonical time zone and `asOf`;
- period resolution;
- calendar and fiscal policies;
- long-range slicing;
- aggregation orchestration;
- comparison and baseline orchestration;
- universal report identity;
- universal report model;
- cross-provider consistency checks;
- provenance assembly.

### Domain providers own

- supported measures and dimensions;
- domain evidence and exclusions;
- source authority;
- query implementation;
- domain-specific validity rules;
- provider-specific slice projection.

### UI and export adapters own

- labels and localization;
- visual formatting;
- charts and tables;
- PDF, CSV or spreadsheet formatting;
- routes, components and navigation;
- delivery-specific presentation.

They do not recalculate measures or redefine period semantics.

## Canonical period families

### To-date

- `TODAY`
- `WEEK_TO_DATE`
- `MONTH_TO_DATE`
- `QUARTER_TO_DATE`
- `YEAR_TO_DATE`
- `FISCAL_YEAR_TO_DATE`

### Calendar

- `CALENDAR_WEEK`
- `CALENDAR_MONTH`
- `CALENDAR_TWO_MONTH_PERIOD`
- `CALENDAR_QUARTER`
- `CALENDAR_HALF_YEAR`
- `CALENDAR_YEAR`
- `CALENDAR_TWO_YEAR_PERIOD`

### Rolling

- `ROLLING_7_DAYS`
- `ROLLING_30_DAYS`
- `ROLLING_90_DAYS`
- `ROLLING_365_DAYS`
- `ROLLING_12_MONTHS`

### Custom

- `CUSTOM_RANGE`

## Naming lock

- `SEMIANNUAL` means a six-month period.
- `BIENNIAL` means a two-year period.
- `SEMIMONTHLY` means two subdivisions within one month.
- ambiguous `BIANNUAL` is not a canonical contract value.
- `CALENDAR_TWO_MONTH_PERIOD` is the canonical bimonthly calendar period.

## Snapshot lock

Every report request resolves one canonical:

```text
from
to
asOf
timeZone
calendarPolicy
fiscalYearPolicy
comparisonPolicy
```

All current-period slices and comparison slices must use the same `asOf`
snapshot unless a versioned report definition explicitly requires otherwise.

## Provider plan

- `REP-06` Performance.
- `REP-07` Commissions.
- `REP-08` Portfolio.
- `REP-09` Activity.
- `REP-10` Pipeline.

Additional providers require separate scope and authority evidence.
DECISION

  cat > "$REP_ROADMAP" <<'ROADMAP'
# REP — Universal Reporting System Roadmap 001

```text
ROADMAP_STATUS=IMPLEMENTED_PENDING_ACCEPTANCE
REPORTING_AUTHORITY=UNIVERSAL_REPORTING_KERNEL
SOURCE_PERFORMANCE_CHECKPOINT=PERF-06_CLOSED
NEXT=REP-01_UNIVERSAL_REPORTING_KERNEL_FOUNDATION
NEXT_BRANCH=feature/universal-reporting-kernel-foundation
```

## Guiding sequence

The kernel and universal contracts are built before domain adapters and surface
adapters. No provider is permitted to redefine universal periods or comparison
semantics.

## REP-00 — Tree and roadmap registration

**Goal:** record the Performance checkpoint and establish the universal
reporting authority in Build Tree, Unified Tree and Roadmap Lock.

**Deliverables:**

- Performance handoff document;
- universal reporting decision;
- REP roadmap;
- synchronized tree blocks;
- audit and closure evidence.

**Mutation boundary:** documentation only.

## REP-01 — Universal Reporting Kernel Foundation

**Goal:** establish the domain-neutral runtime shell.

**Contracts:**

- `universal-reporting-kernel.v1`;
- report request identity;
- provider registry;
- one-time authority binding;
- one canonical `asOf`;
- deterministic request key;
- immutable outputs;
- no UI, persistence or domain measure ownership.

**Next branch:** `feature/universal-reporting-kernel-foundation`.

## REP-02 — Universal Period Resolver and Calendar Policy

**Goal:** resolve semantic periods into exact date ranges.

**Required periods:**

- TODAY;
- WTD, MTD, QTD, YTD and FYTD;
- calendar week, month, two-month period, quarter, half-year, year and two-year;
- rolling 7, 30, 90 and 365 days;
- rolling 12 months;
- custom range.

**Required policies:**

- IANA time zone;
- week start;
- calendar year;
- configurable fiscal-year start;
- leap-year handling;
- partial current period;
- inclusive range semantics;
- canonical identifiers that avoid “bianual” ambiguity.

## REP-03 — Report Definition and Provider Port

**Goal:** define what a report asks for without coupling to a domain.

**Provider capabilities:**

- identify provider and version;
- declare dimensions and measures;
- validate a provider request;
- read an immutable report slice;
- expose exclusions and provenance;
- declare maximum slice range and batching capabilities.

**Boundary:** providers do not own universal period resolution.

## REP-04 — Universal Report Model and Aggregation Runtime

**Goal:** combine provider slices into one universal model.

**Universal model:**

```text
reportId
definitionId
providerId
period
asOf
dimensions
measures
series
totals
exclusions
provenance
authority
```

**Runtime responsibilities:**

- deterministic batching;
- slice continuity;
- aggregation consistency;
- unit and measure compatibility;
- immutable output;
- no invented zeroes for unavailable facts.

## REP-05 — Comparison and Baseline Engine

**Goal:** compare governed reports without domain-specific duplication.

**Comparison types:**

- previous period;
- previous year same period;
- period over period;
- year over year;
- target;
- budget;
- custom baseline.

**YTD comparison:** current YTD compares against the same elapsed calendar or
fiscal interval in the comparison year.

## REP-06 — Performance Report Provider

**Source:** accepted Performance read composition and read models.

**Measures:**

- points;
- target;
- progress;
- eligible activities;
- activity mix;
- days meeting or exceeding target;
- exclusions and corrections.

**Boundary:** Performance remains policy authority, not reporting authority.

## REP-07 — Commissions Report Provider

**Measures planned:**

- gross commission;
- paid commission;
- pending commission;
- adjustments;
- bonuses;
- chargebacks or recoveries;
- payment status.

**Authority prerequisite:** official commission source and payment evidence.

## REP-08 — Portfolio Report Provider

**Measures planned:**

- active policies;
- premium;
- renewals;
- cancellations;
- persistency;
- product and carrier mix;
- portfolio growth.

**Authority prerequisite:** official policy and portfolio source truth.

## REP-09 — Activity Report Provider

**Measures planned:**

- observed and eligible activities;
- activity counts by type;
- lifecycle and evidence distribution;
- correction and reversal exclusions;
- unique entities and active days.

**Source:** frozen Activity v1 foundation.

## REP-10 — Pipeline Report Provider

**Measures planned:**

- prospects by state;
- appointments;
- applications;
- conversions;
- stage movement;
- aging and stalled opportunities.

**Authority prerequisite:** accepted Pipeline state and transition contracts.

## REP-11 — Export and Delivery Adapters

**Adapters planned:**

- PDF;
- CSV;
- spreadsheet;
- print-safe document;
- machine-readable JSON envelope.

**Boundary:** exports format accepted universal reports; they do not query
domains or recalculate measures.

## REP-12 — Reporting Surface Adapter Contract

**Goal:** create framework-neutral payloads for tables, charts, summaries,
filters and comparisons.

**Boundary:** no React component, route, design token or navigation mutation.

## UI-REP-01 — Reporting Surface Integration

Begins only after REP-12 is accepted and the UI migration freeze is lifted.

UI owns:

- labels;
- localization;
- layout;
- responsive behavior;
- charts and tables;
- loading, empty and error states;
- route and navigation integration.

## Global prohibitions

- no domain-specific duplicate reporting engines;
- no direct UI calculation of report totals;
- no ambiguous period names;
- no mixed `asOf` snapshots;
- no ranking or human-worth inference;
- no database mutation during report reads;
- no provider may silently broaden its authority.
ROADMAP

  cat > "$EVIDENCE" <<'EVIDENCE'
# REP-00 — Build Tree, Unified Tree and Roadmap Sync Evidence

```text
STATUS=IMPLEMENTED_PENDING_ACCEPTANCE
SOURCE_PERFORMANCE_COMMIT=ba5dfc21c7d23325b49f16a453939c85ba5ca41b
BUILD_TREE_SYNC=PASS
UNIFIED_TREE_SYNC=PASS
ROADMAP_LOCK_SYNC=PASS
PERFORMANCE_FOUNDATION_STATUS=CLOSED_THROUGH_PERF_06
PERFORMANCE_UI_INTEGRATION_READY=YES
PERFORMANCE_REPORTING_AUTHORITY=NO
REPORTING_AUTHORITY=UNIVERSAL_REPORTING_KERNEL
REPORTING_ROADMAP_PHASES=13
REPORTING_PROVIDER_COUNT_PLANNED=5
REPORTING_NEXT=REP-01_UNIVERSAL_REPORTING_KERNEL_FOUNDATION
UI_MIGRATION_FREEZE_RESPECTED=YES
PRODUCTIVE_UI_MUTATION=NO
REMOTE_DATABASE_MUTATION=NO
```

## Files

- `FORGE_MASTER_BUILD_TREE.md`
- `docs/architecture/source-truth/FORGE_UNIFIED_BUILD_TREE_001.md`
- `docs/roadmap/FORGE_ROADMAP_LOCK_001.md`
- `docs/architecture/performance/PERF_FOUNDATION_HANDOFF_TO_UNIVERSAL_REPORTING_001.md`
- `docs/architecture/reporting/REP_UNIVERSAL_REPORTING_SYSTEM_DECISION_001.md`
- `docs/roadmap/REP_UNIVERSAL_REPORTING_ROADMAP_001.md`

## Decision

Long-horizon and cross-domain reporting is registered as a universal system.
Performance stops at PERF-06 for backend foundation and becomes the first
planned report provider at REP-06.
EVIDENCE

  cat > "$AUDIT" <<'JSON'
{
  "phase": "REP-00_BUILD_TREE_UNIFIED_TREE_ROADMAP_SYNC",
  "status": "IMPLEMENTED_PENDING_ACCEPTANCE",
  "sourcePerformanceCommit": "ba5dfc21c7d23325b49f16a453939c85ba5ca41b",
  "performance": {
    "foundationStatus": "CLOSED_THROUGH_PERF_06",
    "lastClosedPhase": "PERF-06_PERFORMANCE_SURFACE_ADAPTER_CONTRACT",
    "uiIntegrationReady": true,
    "next": "UI-PERF-01_PERFORMANCE_SURFACE_INTEGRATION",
    "reportingAuthority": false,
    "plannedReportProviderPhase": "REP-06"
  },
  "reporting": {
    "authority": "UNIVERSAL_REPORTING_KERNEL",
    "roadmapRegistered": true,
    "roadmapPhaseCount": 13,
    "next": "REP-01_UNIVERSAL_REPORTING_KERNEL_FOUNDATION",
    "nextBranch": "feature/universal-reporting-kernel-foundation",
    "providersPlanned": [
      "PERFORMANCE",
      "COMMISSIONS",
      "PORTFOLIO",
      "ACTIVITY",
      "PIPELINE"
    ],
    "toDatePeriods": [
      "TODAY",
      "WEEK_TO_DATE",
      "MONTH_TO_DATE",
      "QUARTER_TO_DATE",
      "YEAR_TO_DATE",
      "FISCAL_YEAR_TO_DATE"
    ],
    "ambiguousBianualIdentifierAllowed": false
  },
  "sync": {
    "masterBuildTree": true,
    "unifiedBuildTree": true,
    "roadmapLock": true
  },
  "boundaries": {
    "documentationOnly": true,
    "productiveUiMutation": false,
    "remoteDatabaseMutation": false,
    "mainMutation": false
  }
}
JSON

  cp "$0" "$TOOL_COPY"
  chmod 700 "$TOOL_COPY"

  PERF_CHECKPOINT_SYNC="PASS"
  REP_ROADMAP_SYNC="PASS"

  ok "Checkpoint PERF registrado"
  ok "Decisión universal registrada"
  ok "Roadmap REP-00…REP-12 registrado"
}

normalize_files() {
  python3 - \
    "$MASTER_TREE" \
    "$UNIFIED_TREE" \
    "$ROADMAP_LOCK" \
    "$PERF_CHECKPOINT" \
    "$REPORTING_DECISION" \
    "$REP_ROADMAP" \
    "$EVIDENCE" \
    "$AUDIT" \
    "$TOOL_COPY" <<'PY'
from pathlib import Path
import sys

for raw in sys.argv[1:]:
    path = Path(raw)
    text = path.read_text(
        encoding="utf-8",
    )
    normalized = "\n".join(
        line.rstrip()
        for line in text.splitlines()
    )
    path.write_text(
        normalized.rstrip() + "\n",
        encoding="utf-8",
    )
PY
}

validate_docs() {
  section "Validación documental"

  normalize_files

  bash -n "$TOOL_COPY"
  python3 -m json.tool \
    "$AUDIT" \
    >/dev/null

  python3 - \
    "$MASTER_TREE" \
    "$MASTER_START" \
    "$MASTER_END" \
    "$UNIFIED_TREE" \
    "$UNIFIED_START" \
    "$UNIFIED_END" \
    "$ROADMAP_LOCK" \
    "$ROADMAP_START" \
    "$ROADMAP_END" <<'PY'
from pathlib import Path
import sys

items = [
    (
        Path(sys.argv[1]),
        sys.argv[2],
        sys.argv[3],
    ),
    (
        Path(sys.argv[4]),
        sys.argv[5],
        sys.argv[6],
    ),
    (
        Path(sys.argv[7]),
        sys.argv[8],
        sys.argv[9],
    ),
]

for path, start, end in items:
    text = path.read_text(
        encoding="utf-8",
    )

    if text.count(start) != 1:
        raise RuntimeError(
            f"{path}: start marker count is not 1"
        )

    if text.count(end) != 1:
        raise RuntimeError(
            f"{path}: end marker count is not 1"
        )

    if text.index(start) >= text.index(end):
        raise RuntimeError(
            f"{path}: marker order is invalid"
        )
PY

  local required_terms=(
    "PERFORMANCE_FOUNDATION_STATUS=CLOSED_THROUGH_PERF_06"
    "PERFORMANCE_UI_INTEGRATION_READY=YES"
    "PERFORMANCE_REPORTING_AUTHORITY=NO"
    "REPORTING_AUTHORITY=UNIVERSAL_REPORTING_KERNEL"
    "YEAR_TO_DATE"
    "FISCAL_YEAR_TO_DATE"
    "CALENDAR_TWO_MONTH_PERIOD"
    "BIENNIAL"
    "REP-01_UNIVERSAL_REPORTING_KERNEL_FOUNDATION"
    "REP-06"
    "Commissions Report Provider"
    "Portfolio Report Provider"
    "Activity Report Provider"
    "Pipeline Report Provider"
    "UI-REP-01"
  )
  local term=""

  for term in "${required_terms[@]}"; do
    grep -FRq \
      "$term" \
      "$MASTER_TREE" \
      "$UNIFIED_TREE" \
      "$ROADMAP_LOCK" \
      "$PERF_CHECKPOINT" \
      "$REPORTING_DECISION" \
      "$REP_ROADMAP" \
      "$EVIDENCE" ||
      fail "Falta término requerido: $term"
  done

  if grep -FRq \
    '"productiveUiMutation": true\|"remoteDatabaseMutation": true\|"mainMutation": true' \
    "$AUDIT"; then
    fail "El audit habilitó una mutación prohibida"
  fi

  git_cmd -C "$REPO" \
    diff --check

  AUDIT_VALIDATION="PASS"

  ok "Marcadores únicos"
  ok "Roadmap y periodos universales completos"
  ok "Audit JSON válido"
  ok "Safety boundary intacta"
}

validate_changeset() {
  section "Changeset"

  local actual=""
  local expected=""

  actual="$(
    git_cmd -C "$REPO" \
      status \
      --short \
      --untracked-files=all |
      sed 's/^...//' |
      sort
  )"

  expected="$(
    printf '%s\n' \
      "$MASTER_TREE_REL" \
      "$UNIFIED_TREE_REL" \
      "$ROADMAP_LOCK_REL" \
      "$PERF_CHECKPOINT_REL" \
      "$REPORTING_DECISION_REL" \
      "$REP_ROADMAP_REL" \
      "$EVIDENCE_REL" \
      "$AUDIT_REL" \
      "$TOOL_REL" |
      sort
  )"

  [[ "$actual" == "$expected" ]] || {
    plain "EXPECTED:"
    plain "$expected"
    plain "ACTUAL:"
    plain "$actual"
    fail "El changeset REP-00 no coincide"
  }

  git_cmd -C "$REPO" add \
    "$MASTER_TREE_REL" \
    "$UNIFIED_TREE_REL" \
    "$ROADMAP_LOCK_REL" \
    "$PERF_CHECKPOINT_REL" \
    "$REPORTING_DECISION_REL" \
    "$REP_ROADMAP_REL" \
    "$EVIDENCE_REL" \
    "$AUDIT_REL" \
    "$TOOL_REL"

  git_cmd -C "$REPO" \
    diff \
    --cached \
    --check

  ok "Changeset documental exacto"
}

resolve_git_identity() {
  local name=""
  local email=""

  name="$(
    git_cmd -C "$REPO" \
      config --get user.name ||
      true
  )"
  email="$(
    git_cmd -C "$REPO" \
      config --get user.email ||
      true
  )"

  if [[ -z "$name" ||
        -z "$email" ]]; then
    name="$(
      git_cmd -C "$REPO" \
        log -1 \
        --format='%an' \
        "$EXPECTED_SOURCE"
    )"
    email="$(
      git_cmd -C "$REPO" \
        log -1 \
        --format='%ae' \
        "$EXPECTED_SOURCE"
    )"

    git_cmd -C "$REPO" \
      config user.name "$name"
    git_cmd -C "$REPO" \
      config user.email "$email"
  fi

  [[ -n "$name" &&
     -n "$email" ]] ||
    fail "No se pudo resolver identidad Git"
}

commit_implementation() {
  section "Commit de implementación"

  resolve_git_identity
  validate_changeset

  git_cmd -C "$REPO" \
    commit \
    -m "$IMPLEMENTATION_MESSAGE"

  IMPLEMENTATION_COMMIT="$(
    git_cmd -C "$REPO" \
      rev-parse HEAD
  )"

  git_cmd -C "$REPO" \
    push \
    "$REMOTE" \
    "HEAD:$BRANCH"

  ok "Registro documental publicado"
  both "IMPLEMENTATION_COMMIT=$IMPLEMENTATION_COMMIT"
}

hydrate_implementation() {
  IMPLEMENTATION_COMMIT="$(
    git_cmd -C "$REPO" \
      log \
      --format='%H' \
      --grep="$IMPLEMENTATION_MESSAGE" \
      -1
  )"

  [[ -n "$IMPLEMENTATION_COMMIT" ]] ||
    fail "No se localizó el commit de implementación REP-00"
}

verify_remote_implementation() {
  section "Verificación remota"

  local remote_head=""
  remote_head="$(
    remote_branch_commit
  )"

  [[ "$remote_head" == "$IMPLEMENTATION_COMMIT" ]] ||
    fail "El commit remoto no coincide con implementación REP-00"

  git_cmd -C "$REPO" \
    fetch \
    "$REMOTE" \
    "+refs/heads/$BRANCH:refs/remotes/$REMOTE/$BRANCH"

  for path in \
    "$MASTER_TREE_REL" \
    "$UNIFIED_TREE_REL" \
    "$ROADMAP_LOCK_REL" \
    "$PERF_CHECKPOINT_REL" \
    "$REPORTING_DECISION_REL" \
    "$REP_ROADMAP_REL" \
    "$EVIDENCE_REL" \
    "$AUDIT_REL" \
    "$TOOL_REL"; do
    git_cmd -C "$REPO" \
      cat-file \
      -e \
      "refs/remotes/$REMOTE/$BRANCH:$path" \
      2>/dev/null ||
      fail "Falta archivo remoto: $path"
  done

  git_cmd -C "$REPO" \
    show \
    "refs/remotes/$REMOTE/$BRANCH:$MASTER_TREE_REL" |
    grep -Fq "$MASTER_START" ||
    fail "Build Tree remoto no sincronizado"

  git_cmd -C "$REPO" \
    show \
    "refs/remotes/$REMOTE/$BRANCH:$UNIFIED_TREE_REL" |
    grep -Fq "$UNIFIED_START" ||
    fail "Unified Tree remoto no sincronizado"

  git_cmd -C "$REPO" \
    show \
    "refs/remotes/$REMOTE/$BRANCH:$ROADMAP_LOCK_REL" |
    grep -Fq "$ROADMAP_START" ||
    fail "Roadmap Lock remoto no sincronizado"

  REMOTE_VERIFICATION="PASS"

  ok "Implementación remota verificada"
}

accept_docs() {
  section "Aceptación y cierre"

  python3 - \
    "$MASTER_TREE" \
    "$UNIFIED_TREE" \
    "$ROADMAP_LOCK" \
    "$PERF_CHECKPOINT" \
    "$REP_ROADMAP" \
    "$EVIDENCE" \
    "$AUDIT" \
    "$IMPLEMENTATION_COMMIT" <<'PY'
from pathlib import Path
import json
import sys

paths = [
    Path(raw)
    for raw in sys.argv[1:7]
]

for path in paths:
    text = path.read_text(
        encoding="utf-8",
    )
    text = text.replace(
        "REP_00_BUILD_TREE_UNIFIED_TREE_ROADMAP_SYNC=IMPLEMENTED_PENDING_ACCEPTANCE",
        "REP_00_BUILD_TREE_UNIFIED_TREE_ROADMAP_SYNC=CLOSED",
    )
    text = text.replace(
        "PERFORMANCE_FOUNDATION_HANDOFF=IMPLEMENTED_PENDING_ACCEPTANCE",
        "PERFORMANCE_FOUNDATION_HANDOFF=ACCEPTED",
    )
    text = text.replace(
        "ROADMAP_STATUS=IMPLEMENTED_PENDING_ACCEPTANCE",
        "ROADMAP_STATUS=ACCEPTED",
    )
    text = text.replace(
        "STATUS=IMPLEMENTED_PENDING_ACCEPTANCE",
        "STATUS=ACCEPTED",
    )
    path.write_text(
        text.rstrip() + "\n",
        encoding="utf-8",
    )

audit_path = Path(sys.argv[7])
implementation_commit = sys.argv[8]
audit = json.loads(
    audit_path.read_text(
        encoding="utf-8",
    )
)
audit["status"] = "ACCEPTED"
audit["implementationCommit"] = (
    implementation_commit
)
audit_path.write_text(
    json.dumps(
        audit,
        indent=2,
        ensure_ascii=False,
    )
    + "\n",
    encoding="utf-8",
)
PY

  cat > "$CLOSURE" <<EOF
# REP-00 — Build Tree, Unified Tree and Roadmap Sync Closure

\`\`\`text
$CLOSURE_MARKER
PERFORMANCE_BRANCH=$BRANCH
SOURCE_PERFORMANCE_COMMIT=$EXPECTED_SOURCE
IMPLEMENTATION_COMMIT=$IMPLEMENTATION_COMMIT
BUILD_TREE_SYNC=PASS
UNIFIED_TREE_SYNC=PASS
ROADMAP_LOCK_SYNC=PASS
PERFORMANCE_FOUNDATION_STATUS=CLOSED_THROUGH_PERF_06
PERFORMANCE_UI_INTEGRATION_READY=YES
PERFORMANCE_NEXT=UI-PERF-01_PERFORMANCE_SURFACE_INTEGRATION
PERFORMANCE_REPORTING_AUTHORITY=NO
PERFORMANCE_REPORT_PROVIDER=PLANNED_REP_06
REPORTING_AUTHORITY=UNIVERSAL_REPORTING_KERNEL
REPORTING_ROADMAP_PHASES=13
REPORTING_PROVIDER_COUNT_PLANNED=5
REPORTING_NEXT=REP-01_UNIVERSAL_REPORTING_KERNEL_FOUNDATION
REPORTING_NEXT_BRANCH=feature/universal-reporting-kernel-foundation
UI_MIGRATION_FREEZE_RESPECTED=YES
PRODUCTIVE_UI_MUTATION=NO
REMOTE_DATABASE_MUTATION=NO
MAIN_MUTATION=NO
\`\`\`
EOF

  normalize_files

  python3 -m json.tool \
    "$AUDIT" \
    >/dev/null

  git_cmd -C "$REPO" \
    diff --check

  git_cmd -C "$REPO" add \
    "$MASTER_TREE_REL" \
    "$UNIFIED_TREE_REL" \
    "$ROADMAP_LOCK_REL" \
    "$PERF_CHECKPOINT_REL" \
    "$REP_ROADMAP_REL" \
    "$EVIDENCE_REL" \
    "$AUDIT_REL" \
    "$CLOSURE_REL"

  git_cmd -C "$REPO" \
    diff \
    --cached \
    --check

  resolve_git_identity

  git_cmd -C "$REPO" \
    commit \
    -m "$CLOSURE_MESSAGE"

  CLOSURE_COMMIT="$(
    git_cmd -C "$REPO" \
      rev-parse HEAD
  )"

  git_cmd -C "$REPO" \
    push \
    "$REMOTE" \
    "HEAD:$BRANCH"

  REMOTE_COMMIT="$(
    remote_branch_commit
  )"

  [[ "$REMOTE_COMMIT" == "$CLOSURE_COMMIT" ]] ||
    fail "El cierre remoto no coincide"

  ok "REP-00 cerrado"
  both "CLOSURE_COMMIT=$CLOSURE_COMMIT"
}

verify_closed() {
  hydrate_implementation

  CLOSURE_COMMIT="$(
    git_cmd -C "$REPO" \
      rev-parse HEAD
  )"
  REMOTE_COMMIT="$(
    remote_branch_commit
  )"

  [[ "$REMOTE_COMMIT" == "$CLOSURE_COMMIT" ]] ||
    fail "Cierre local y remoto no coinciden"

  for path in \
    "$MASTER_TREE_REL" \
    "$UNIFIED_TREE_REL" \
    "$ROADMAP_LOCK_REL"; do
    git_cmd -C "$REPO" \
      show \
      "HEAD:$path" |
      grep -Fq \
        'REP_00_BUILD_TREE_UNIFIED_TREE_ROADMAP_SYNC=CLOSED' ||
      fail "Árbol sin cierre REP-00: $path"
  done

  BUILD_TREE_SYNC="PASS"
  UNIFIED_TREE_SYNC="PASS"
  ROADMAP_LOCK_SYNC="PASS"
  PERF_CHECKPOINT_SYNC="PASS"
  REP_ROADMAP_SYNC="PASS"
  AUDIT_VALIDATION="PASS"
  REMOTE_VERIFICATION="PASS"
}

verify_guards() {
  section "Protección paralela"

  FES_AFTER="$(
    snapshot_repo "$FES_REPO"
  )"
  MUI_AFTER="$(
    snapshot_optional_repo "$MUI_REPO"
  )"
  MAIN_AFTER="$(
    git_cmd -C "$REPO" \
      ls-remote \
      --heads \
      "$REMOTE" \
      refs/heads/main |
      awk 'NR == 1 {
        print $1
      }'
  )"

  [[ "$FES_AFTER" == "$FES_BEFORE" ]] &&
    FES_MUTATION="NO" ||
    FES_MUTATION="YES"

  [[ "$MUI_AFTER" == "$MUI_BEFORE" ]] &&
    MUI_MUTATION="NO" ||
    MUI_MUTATION="YES"

  [[ "$MAIN_AFTER" == "$MAIN_BEFORE" ]] &&
    MAIN_MUTATION="NO" ||
    MAIN_MUTATION="YES"

  [[ "$FES_MUTATION" == "NO" ]] ||
    fail "FES cambió"

  [[ "$MUI_MUTATION" == "NO" ]] ||
    fail "MUI cambió"

  [[ "$MAIN_MUTATION" == "NO" ]] ||
    fail "main cambió"

  ok "FES permanece intacto"
  ok "main permanece intacto"

  if [[ "$MUI_REPO_STATE" == "PRESENT_OBSERVED" ]]; then
    ok "MUI presente e intacto"
  else
    ok "MUI ausente y no tocado"
  fi
}

close_phase() {
  section "Resultado"

  [[ -z "$(
    git_cmd -C "$REPO" \
      status \
      --short \
      --untracked-files=all
  )" ]] ||
    fail "El repositorio quedó con cambios residuales"

  WORKTREE_STATUS="PASS"
  PHASE_STATUS="SUCCESS"
  FAILURE_REASON="NONE"

  write_summary 0
  copy_summary
  write_summary 0

  ok "Build Tree y Unified Tree sincronizados"
  both \
    "REP_00_BUILD_TREE_UNIFIED_TREE_ROADMAP_SYNC=CLOSED" \
    "${GREEN}${BOLD}REP_00_BUILD_TREE_UNIFIED_TREE_ROADMAP_SYNC=CLOSED${RESET}"
  both "BUILD_TREE_SYNC=PASS"
  both "UNIFIED_TREE_SYNC=PASS"
  both "ROADMAP_LOCK_SYNC=PASS"
  both \
    "PERFORMANCE_FOUNDATION_STATUS=CLOSED_THROUGH_PERF_06" \
    "${GREEN}${BOLD}PERFORMANCE_FOUNDATION_STATUS=CLOSED_THROUGH_PERF_06${RESET}"
  both "PERFORMANCE_UI_INTEGRATION_READY=YES"
  both "PERFORMANCE_NEXT=UI-PERF-01_PERFORMANCE_SURFACE_INTEGRATION"
  both "PERFORMANCE_REPORTING_AUTHORITY=NO"
  both "PERFORMANCE_REPORT_PROVIDER=PLANNED_REP_06"
  both \
    "REPORTING_AUTHORITY=UNIVERSAL_REPORTING_KERNEL" \
    "${CYAN}${BOLD}REPORTING_AUTHORITY=UNIVERSAL_REPORTING_KERNEL${RESET}"
  both "REPORTING_ROADMAP_PHASES=13"
  both "REPORTING_PROVIDER_COUNT_PLANNED=5"
  both "UI_MIGRATION_FREEZE_RESPECTED=YES"
  both "PRODUCTIVE_UI_MUTATION=NO"
  both "REMOTE_DATABASE_MUTATION=NO"
  both "FES_MUTATION=NO"
  both "MUI_MUTATION=NO"
  both "MUI_REPO_STATE=$MUI_REPO_STATE"
  both "MAIN_MUTATION=NO"
  both "WORKTREE=PASS"
  both "IMPLEMENTATION_COMMIT=$IMPLEMENTATION_COMMIT"
  both "CLOSURE_COMMIT=$CLOSURE_COMMIT"
  both "REMOTE_COMMIT=$REMOTE_COMMIT"
  both \
    "NEXT=REP-01_UNIVERSAL_REPORTING_KERNEL_FOUNDATION" \
    "${PURPLE}${BOLD}NEXT=REP-01_UNIVERSAL_REPORTING_KERNEL_FOUNDATION${RESET}"
  both "LOG=$LOG"
  both "SUMMARY=$SUMMARY"
}

main() {
  section "REP-00 Build Tree / Unified Tree / Roadmap Sync"
  both "REPO=$REPO"
  both "PERFORMANCE_BRANCH=$BRANCH"
  both "EXPECTED_SOURCE=$EXPECTED_SOURCE"
  both "MODE=DOCUMENTATION_ONLY"

  section "Dependencias"
  validate_dependencies

  source_gate

  case "$RECOVERY_MODE" in
    NONE|PARTIAL_RESET_AND_REGENERATE)
      write_tree_blocks
      write_source_truth
      validate_docs
      commit_implementation
      verify_remote_implementation
      accept_docs
      ;;

    IMPLEMENTATION_ALREADY_PUBLISHED)
      hydrate_implementation
      BUILD_TREE_SYNC="PASS"
      UNIFIED_TREE_SYNC="PASS"
      ROADMAP_LOCK_SYNC="PASS"
      PERF_CHECKPOINT_SYNC="PASS"
      REP_ROADMAP_SYNC="PASS"
      AUDIT_VALIDATION="PASS"
      verify_remote_implementation
      accept_docs
      ;;

    ALREADY_CLOSED)
      verify_closed
      ;;

    *)
      fail "Recovery mode no soportado: $RECOVERY_MODE"
      ;;
  esac

  verify_guards
  close_phase
}

main "$@"
