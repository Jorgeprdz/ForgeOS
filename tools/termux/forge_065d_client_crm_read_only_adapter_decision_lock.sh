#!/usr/bin/env bash
set -euo pipefail

PHASE="065D_CLIENT_CRM_READ_ONLY_ADAPTER_DECISION_LOCK"
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
  local rollback="$BACKUP_DIR/rollback-065d.sh"
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
    local archive=".forge-backups/rollback-archives/$(basename "$file").065d.$(date +%Y%m%d_%H%M%S)"
    mv "$file" "$archive"
    echo "archived created file $file -> $archive"
  fi
}

restore_or_archive "FORGE_MASTER_BUILD_TREE.md"
restore_or_archive "docs/architecture/source-truth/FORGE_UNIFIED_BUILD_TREE_001.md"
restore_or_archive "docs/roadmap/FORGE_ROADMAP_LOCK_001.md"
restore_or_archive "docs/architecture/source-truth/FORGE_CLIENT_CRM_READ_ONLY_ADAPTER_DECISION_LOCK_065D.md"
restore_or_archive "docs/evidence/FORGE_CLIENT_CRM_READ_ONLY_ADAPTER_DECISION_LOCK_065D.md"
restore_or_archive "docs/evidence/FORGE_CLIENT_CRM_READ_ONLY_ADAPTER_DECISION_LOCK_CERTIFICATE_065D.md"
restore_or_archive "docs/evidence/forge-client-crm-read-only-adapter-decision-audit-065d.json"
restore_or_archive "tools/termux/forge_065d_client_crm_read_only_adapter_decision_lock.sh"

echo "rollback 065D complete"
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
printf "MODE=client CRM read-only adapter decision lock documentation\n"
printf "BOUNDARY=decision/docs lock only; no UI mutation; no backend connection; no CRM write; no calendar; no send; no auth; no provider execution; no real engine execution\n"
printf "REPORT=%s\n" "$REPORT"

say_stage "STAGE 1 CHECKPOINT"
cd "$REPO" || fail "repo not found: $REPO"
run_cmd git status --short --branch
run_cmd git log --oneline -10
run_cmd git diff --name-status
run_cmd git diff --cached --name-status

if [[ -n "$(git diff --name-only)" || -n "$(git diff --cached --name-only)" ]]; then
  hold "tracked worktree has unstaged or staged changes; refusing to write 065D over a moving target"
fi

say_stage "STAGE 2 REQUIRED FILE CHECK"
required_files=(
  "platform/adapters/client-crm/client-crm-read-only-adapter-065b.js"
  "tests/client-crm-read-only-adapter-065b-test.js"
  "docs/architecture/source-truth/FORGE_CLIENT_CRM_READ_ONLY_ADAPTER_QA_LOCK_CLOSURE_065C.md"
  "docs/evidence/FORGE_CLIENT_CRM_READ_ONLY_ADAPTER_QA_LOCK_065C.md"
  "docs/evidence/forge-client-crm-read-only-adapter-qa-audit-065c.json"
  "FORGE_MASTER_BUILD_TREE.md"
  "docs/architecture/source-truth/FORGE_UNIFIED_BUILD_TREE_001.md"
  "docs/roadmap/FORGE_ROADMAP_LOCK_001.md"
)

for file in "${required_files[@]}"; do
  require_file "$file"
done

say_stage "STAGE 3 BACKUP"
BACKUP_DIR=".forge-backups/065d-client-crm-read-only-adapter-decision-lock-$(date +%Y%m%d_%H%M%S)"
mkdir -p "$BACKUP_DIR"
for file in "${required_files[@]}"; do
  backup_file "$file"
done
write_rollback

say_stage "STAGE 4 VERIFY LOCK INPUTS"
python3 - <<'PY'
import json
from pathlib import Path

audit = json.loads(Path("docs/evidence/forge-client-crm-read-only-adapter-qa-audit-065c.json").read_text())

assert audit["status"] == "PASS"
checks = audit["checks"]
assert checks["syntaxCheck"] is True
assert checks["unitTest"] is True
assert checks["semanticEnvelopeQa"] is True
assert checks["adapterId"] == "forge.client_crm.read_only.adapter.v1"
assert checks["adapterType"] == "local_static_fixture"
assert checks["adapterMode"] == "read_only"
assert checks["routeClass"] == "read_only"
assert checks["listReturnsTwoFixtures"] is True
assert checks["detailReturnsLariza"] is True
assert checks["missingReturnsSafeEmptyState"] is True
assert checks["allSafetyFlagsFalse"] is True

print(json.dumps({
    "status": "PASS",
    "lockedAdapter": checks["adapterId"],
    "adapterMode": checks["adapterMode"],
    "allSafetyFlagsFalse": checks["allSafetyFlagsFalse"]
}, indent=2))
PY
pass "065C QA inputs verified"

say_stage "STAGE 5 APPLY DECISION DOCS"
mkdir -p tools/termux docs/architecture/source-truth docs/evidence
SCRIPT_SOURCE="$0"
if [[ -n "${BASH_SOURCE+x}" && -n "${BASH_SOURCE[0]:-}" ]]; then
  SCRIPT_SOURCE="${BASH_SOURCE[0]}"
fi
if [[ ! -f "$SCRIPT_SOURCE" ]]; then
  fail "runner source not found: $SCRIPT_SOURCE"
fi
cp "$SCRIPT_SOURCE" "tools/termux/forge_065d_client_crm_read_only_adapter_decision_lock.sh"
pass "copied runner into tools/termux"

cat > docs/architecture/source-truth/FORGE_CLIENT_CRM_READ_ONLY_ADAPTER_DECISION_LOCK_065D.md <<'MD'
# Forge Client CRM Read-Only Adapter Decision Lock 065D

Status: LOCKED

Date: 2026-07-06

Phase:
`065D_CLIENT_CRM_READ_ONLY_ADAPTER_DECISION_LOCK`

Base:
`065C_CLIENT_CRM_READ_ONLY_ADAPTER_QA_LOCK`

Decision:
`CLIENT_CRM_READ_ONLY_ADAPTER_LOCKED`

## Decision

The Client CRM read-only adapter is accepted as the first implemented backend module adapter pattern.

It is safe only as a local static read-only fixture. It does not represent a production CRM connection and must not be treated as source-of-truth CRM data.

## Locked Adapter

Adapter:
`forge.client_crm.read_only.adapter.v1`

File:
`platform/adapters/client-crm/client-crm-read-only-adapter-065b.js`

Test:
`tests/client-crm-read-only-adapter-065b-test.js`

Mode:
`read_only`

Type:
`local_static_fixture`

Routes:

- `forge.api.read.client_crm.list.v1`
- `forge.api.read.client_crm.detail.v1`

## Locked Guarantees

- uses backend read model envelope;
- returns Lariza and Octavio preview fixtures;
- returns safe missing-client empty state;
- uses `CLIENT_CRM_NOT_MODELED` for not-modeled fixture ids;
- emits audit-shaped `read_model_used`;
- keeps all real-effect flags false.

## Still Blocked

- CRM create/update/delete/merge;
- calendar create/update;
- message delivery;
- quote creation;
- policy update;
- provider calls;
- secret access;
- browser persistence;
- real engine execution.

## What This Unlocks

The next module can follow the same pattern:

`066A_OPPORTUNITY_PIPELINE_READ_ONLY_ADAPTER_SCOPE`

It must be read-only, local/static or mock-only, and no-effect.

## Final

DECISION=PASS_065D_CLIENT_CRM_READ_ONLY_ADAPTER_DECISION_LOCK

NEXT=066A_OPPORTUNITY_PIPELINE_READ_ONLY_ADAPTER_SCOPE
MD

cat > docs/evidence/FORGE_CLIENT_CRM_READ_ONLY_ADAPTER_DECISION_LOCK_065D.md <<'MD'
# Forge Client CRM Read-Only Adapter Decision Lock Evidence 065D

Phase:
`065D_CLIENT_CRM_READ_ONLY_ADAPTER_DECISION_LOCK`

Status:
PASS

Decision:
`CLIENT_CRM_READ_ONLY_ADAPTER_LOCKED`

## Evidence Summary

065D locks the 065B/065C Client CRM read-only adapter as the first accepted implemented backend module adapter pattern.

Locked proof:

- local static fixture adapter;
- read-only mode;
- list and detail routes;
- backend read model envelope;
- safe empty state and error;
- audit-shaped event;
- all real effects disabled.

## Result

DECISION=PASS_065D_CLIENT_CRM_READ_ONLY_ADAPTER_DECISION_LOCK

NEXT=066A_OPPORTUNITY_PIPELINE_READ_ONLY_ADAPTER_SCOPE
MD

cat > docs/evidence/FORGE_CLIENT_CRM_READ_ONLY_ADAPTER_DECISION_LOCK_CERTIFICATE_065D.md <<'MD'
# Forge Client CRM Read-Only Adapter Decision Lock Certificate 065D

DECISION=PASS_065D_CLIENT_CRM_READ_ONLY_ADAPTER_DECISION_LOCK

NEXT=066A_OPPORTUNITY_PIPELINE_READ_ONLY_ADAPTER_SCOPE

Certified boundary:

- decision/docs lock only;
- no UI mutation;
- no backend connection;
- no CRM write;
- no calendar creation;
- no communication delivery;
- no auth implementation;
- no provider execution;
- no browser persistence;
- no real engine execution.
MD

cat > docs/evidence/forge-client-crm-read-only-adapter-decision-audit-065d.json <<'JSON'
{
  "phase": "065D_CLIENT_CRM_READ_ONLY_ADAPTER_DECISION_LOCK",
  "status": "PASS",
  "decision": "CLIENT_CRM_READ_ONLY_ADAPTER_LOCKED",
  "basePhase": "065C_CLIENT_CRM_READ_ONLY_ADAPTER_QA_LOCK",
  "lockedAdapter": {
    "adapterId": "forge.client_crm.read_only.adapter.v1",
    "adapterFile": "platform/adapters/client-crm/client-crm-read-only-adapter-065b.js",
    "testFile": "tests/client-crm-read-only-adapter-065b-test.js",
    "adapterType": "local_static_fixture",
    "adapterMode": "read_only",
    "domainId": "client_crm"
  },
  "lockedRoutes": [
    "forge.api.read.client_crm.list.v1",
    "forge.api.read.client_crm.detail.v1"
  ],
  "lockedGuarantees": [
    "backend_read_model_envelope",
    "safe_empty_state",
    "CLIENT_CRM_NOT_MODELED",
    "read_model_used_audit_event",
    "all_safety_flags_false"
  ],
  "stillBlocked": [
    "crm_write",
    "calendar_create",
    "message_send",
    "quote_create",
    "policy_update",
    "provider_call",
    "secret_access",
    "browser_persistence",
    "real_engine_execution"
  ],
  "uiMutation": false,
  "backendConnection": false,
  "crmWrite": false,
  "realEffectsEnabled": false,
  "next": "066A_OPPORTUNITY_PIPELINE_READ_ONLY_ADAPTER_SCOPE"
}
JSON

pass "wrote 065D decision docs and audit json"

say_stage "STAGE 6 UPDATE BUILD TREE / ROADMAP"
SYNC_BODY=$(cat <<'MD'
## 065D Client CRM Read-Only Adapter Decision Lock

065D locks the 065B/065C Client CRM read-only adapter as the first accepted implemented backend module adapter pattern.

Decision:
`CLIENT_CRM_READ_ONLY_ADAPTER_LOCKED`

Locked adapter:
`forge.client_crm.read_only.adapter.v1`

Locked properties:

- local static fixture;
- read-only mode;
- list/detail routes;
- backend read model envelope;
- safe empty state;
- `CLIENT_CRM_NOT_MODELED`;
- audit event `read_model_used`;
- all real-effect flags false.

DECISION=PASS_065D_CLIENT_CRM_READ_ONLY_ADAPTER_DECISION_LOCK

NEXT=066A_OPPORTUNITY_PIPELINE_READ_ONLY_ADAPTER_SCOPE
MD
)

append_sync_block "FORGE_MASTER_BUILD_TREE.md" "<!-- FORGE:065D_CLIENT_CRM_READ_ONLY_ADAPTER_DECISION_LOCK:START -->" "<!-- FORGE:065D_CLIENT_CRM_READ_ONLY_ADAPTER_DECISION_LOCK:END -->" "$SYNC_BODY"
append_sync_block "docs/architecture/source-truth/FORGE_UNIFIED_BUILD_TREE_001.md" "<!-- FORGE:065D_CLIENT_CRM_READ_ONLY_ADAPTER_DECISION_LOCK:START -->" "<!-- FORGE:065D_CLIENT_CRM_READ_ONLY_ADAPTER_DECISION_LOCK:END -->" "$SYNC_BODY"
append_sync_block "docs/roadmap/FORGE_ROADMAP_LOCK_001.md" "<!-- FORGE:065D_CLIENT_CRM_READ_ONLY_ADAPTER_DECISION_LOCK:START -->" "<!-- FORGE:065D_CLIENT_CRM_READ_ONLY_ADAPTER_DECISION_LOCK:END -->" "$SYNC_BODY"
pass "updated build tree / roadmap sync blocks"

say_stage "STAGE 7 NORMALIZE FILES"
changed_files=(
  "docs/architecture/source-truth/FORGE_CLIENT_CRM_READ_ONLY_ADAPTER_DECISION_LOCK_065D.md"
  "docs/evidence/FORGE_CLIENT_CRM_READ_ONLY_ADAPTER_DECISION_LOCK_065D.md"
  "docs/evidence/FORGE_CLIENT_CRM_READ_ONLY_ADAPTER_DECISION_LOCK_CERTIFICATE_065D.md"
  "docs/evidence/forge-client-crm-read-only-adapter-decision-audit-065d.json"
  "FORGE_MASTER_BUILD_TREE.md"
  "docs/architecture/source-truth/FORGE_UNIFIED_BUILD_TREE_001.md"
  "docs/roadmap/FORGE_ROADMAP_LOCK_001.md"
  "tools/termux/forge_065d_client_crm_read_only_adapter_decision_lock.sh"
)

for file in "${changed_files[@]}"; do
  normalize_file "$file"
done
pass "normalized EOF and trailing whitespace"

say_stage "STAGE 8 VALIDATION"
run_cmd bash -n tools/termux/forge_065d_client_crm_read_only_adapter_decision_lock.sh
run_cmd node --check platform/adapters/client-crm/client-crm-read-only-adapter-065b.js
run_cmd node tests/client-crm-read-only-adapter-065b-test.js
run_cmd python3 -m json.tool docs/evidence/forge-client-crm-read-only-adapter-decision-audit-065d.json
run_cmd rg -n "DECISION=PASS_065D_CLIENT_CRM_READ_ONLY_ADAPTER_DECISION_LOCK|NEXT=066A_OPPORTUNITY_PIPELINE_READ_ONLY_ADAPTER_SCOPE|CLIENT_CRM_READ_ONLY_ADAPTER_LOCKED|CLIENT_CRM_NOT_MODELED|forge.client_crm.read_only.adapter.v1" \
  docs/architecture/source-truth/FORGE_CLIENT_CRM_READ_ONLY_ADAPTER_DECISION_LOCK_065D.md \
  docs/evidence/FORGE_CLIENT_CRM_READ_ONLY_ADAPTER_DECISION_LOCK_065D.md \
  docs/evidence/FORGE_CLIENT_CRM_READ_ONLY_ADAPTER_DECISION_LOCK_CERTIFICATE_065D.md \
  docs/evidence/forge-client-crm-read-only-adapter-decision-audit-065d.json \
  FORGE_MASTER_BUILD_TREE.md \
  docs/architecture/source-truth/FORGE_UNIFIED_BUILD_TREE_001.md \
  docs/roadmap/FORGE_ROADMAP_LOCK_001.md
run_cmd git diff --check
warn "No package test suite required beyond existing adapter test for decision lock"

say_stage "STAGE 9 SAFETY SCAN"
if rg -n "crmWrite: true|calendarCreate: true|messageSend: true|authReal: true|providerRuntime: true|browserPersistence: true|realEngineExecution: true|realEffectsEnabled\": true|backendConnection\": true|\"crmWrite\": true|\"realEffectsAllowed\": true|\"secretAccess\": true|\"providerRuntime\": true" \
  docs/architecture/source-truth/FORGE_CLIENT_CRM_READ_ONLY_ADAPTER_DECISION_LOCK_065D.md \
  docs/evidence/FORGE_CLIENT_CRM_READ_ONLY_ADAPTER_DECISION_LOCK_065D.md \
  docs/evidence/FORGE_CLIENT_CRM_READ_ONLY_ADAPTER_DECISION_LOCK_CERTIFICATE_065D.md \
  docs/evidence/forge-client-crm-read-only-adapter-decision-audit-065d.json \
  FORGE_MASTER_BUILD_TREE.md \
  docs/architecture/source-truth/FORGE_UNIFIED_BUILD_TREE_001.md \
  docs/roadmap/FORGE_ROADMAP_LOCK_001.md; then
  fail "safety scan found forbidden enabled-effect marker"
fi
pass "safety scan clean"

say_stage "STAGE 10 STAGE AUTHORIZED FILES"
git add \
  FORGE_MASTER_BUILD_TREE.md \
  docs/architecture/source-truth/FORGE_CLIENT_CRM_READ_ONLY_ADAPTER_DECISION_LOCK_065D.md \
  docs/architecture/source-truth/FORGE_UNIFIED_BUILD_TREE_001.md \
  docs/evidence/FORGE_CLIENT_CRM_READ_ONLY_ADAPTER_DECISION_LOCK_065D.md \
  docs/evidence/FORGE_CLIENT_CRM_READ_ONLY_ADAPTER_DECISION_LOCK_CERTIFICATE_065D.md \
  docs/evidence/forge-client-crm-read-only-adapter-decision-audit-065d.json \
  docs/roadmap/FORGE_ROADMAP_LOCK_001.md \
  tools/termux/forge_065d_client_crm_read_only_adapter_decision_lock.sh

run_cmd git diff --cached --name-only
expected="$(mktemp)"
actual="$(mktemp)"
cat > "$expected" <<'EOF'
FORGE_MASTER_BUILD_TREE.md
docs/architecture/source-truth/FORGE_CLIENT_CRM_READ_ONLY_ADAPTER_DECISION_LOCK_065D.md
docs/architecture/source-truth/FORGE_UNIFIED_BUILD_TREE_001.md
docs/evidence/FORGE_CLIENT_CRM_READ_ONLY_ADAPTER_DECISION_LOCK_065D.md
docs/evidence/FORGE_CLIENT_CRM_READ_ONLY_ADAPTER_DECISION_LOCK_CERTIFICATE_065D.md
docs/evidence/forge-client-crm-read-only-adapter-decision-audit-065d.json
docs/roadmap/FORGE_ROADMAP_LOCK_001.md
tools/termux/forge_065d_client_crm_read_only_adapter_decision_lock.sh
EOF
git diff --cached --name-only > "$actual"
if diff -u "$expected" "$actual"; then
  pass "only authorized files staged"
else
  fail "unexpected staged files"
fi
run_cmd git diff --cached --check

say_stage "STAGE 11 COMMIT PUSH"
run_cmd git commit -m "docs: lock client CRM read-only adapter decision"
run_cmd git push origin HEAD:main

say_stage "STAGE 12 FINAL CHECKPOINT"
run_cmd git status --short --branch
run_cmd git log --oneline -10

say_stage "FINAL DECISION"
printf "PASS_065D_CLIENT_CRM_READ_ONLY_ADAPTER_DECISION_LOCK_COMMIT_PUSH_COMPLETE\n"
printf "NEXT=066A_OPPORTUNITY_PIPELINE_READ_ONLY_ADAPTER_SCOPE\n"
printf "BACKUP=%s\n" "$BACKUP_DIR"
printf "ROLLBACK=%s\n" "$BACKUP_DIR/rollback-065d.sh"
printf "Reporte: %s\n" "$REPORT"
autocopy_report
