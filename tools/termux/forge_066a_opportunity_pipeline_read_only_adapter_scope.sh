#!/usr/bin/env bash
set -euo pipefail

PHASE="066A_OPPORTUNITY_PIPELINE_READ_ONLY_ADAPTER_SCOPE"
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
  local rollback="$BACKUP_DIR/rollback-066a.sh"
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
    local archive=".forge-backups/rollback-archives/$(basename "$file").066a.$(date +%Y%m%d_%H%M%S)"
    mv "$file" "$archive"
    echo "archived created file $file -> $archive"
  fi
}

restore_or_archive "FORGE_MASTER_BUILD_TREE.md"
restore_or_archive "docs/architecture/source-truth/FORGE_UNIFIED_BUILD_TREE_001.md"
restore_or_archive "docs/roadmap/FORGE_ROADMAP_LOCK_001.md"
restore_or_archive "docs/architecture/source-truth/FORGE_OPPORTUNITY_PIPELINE_READ_ONLY_ADAPTER_SCOPE_066A.md"
restore_or_archive "docs/evidence/FORGE_OPPORTUNITY_PIPELINE_READ_ONLY_ADAPTER_SCOPE_066A.md"
restore_or_archive "docs/evidence/FORGE_OPPORTUNITY_PIPELINE_READ_ONLY_ADAPTER_SCOPE_CERTIFICATE_066A.md"
restore_or_archive "docs/evidence/forge-opportunity-pipeline-read-only-adapter-scope-audit-066a.json"
restore_or_archive "tools/termux/forge_066a_opportunity_pipeline_read_only_adapter_scope.sh"

echo "rollback 066A complete"
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
printf "MODE=opportunity pipeline read-only adapter scope documentation\n"
printf "BOUNDARY=docs/scope only; no UI mutation; no backend connection; no CRM write; no pipeline write; no calendar; no send; no auth; no provider execution; no real engine execution\n"
printf "REPORT=%s\n" "$REPORT"

say_stage "STAGE 1 CHECKPOINT"
cd "$REPO" || fail "repo not found: $REPO"
run_cmd git status --short --branch
run_cmd git log --oneline -10
run_cmd git diff --name-status
run_cmd git diff --cached --name-status

if [[ -n "$(git diff --name-only)" || -n "$(git diff --cached --name-only)" ]]; then
  hold "tracked worktree has unstaged or staged changes; refusing to write 066A over a moving target"
fi

say_stage "STAGE 2 REQUIRED FILE CHECK"
required_files=(
  "docs/architecture/source-truth/FORGE_CLIENT_CRM_READ_ONLY_ADAPTER_DECISION_LOCK_065D.md"
  "docs/evidence/FORGE_CLIENT_CRM_READ_ONLY_ADAPTER_DECISION_LOCK_065D.md"
  "docs/evidence/forge-client-crm-read-only-adapter-decision-audit-065d.json"
  "docs/architecture/source-truth/FORGE_BACKEND_MODULE_OWNERSHIP_MAP_064B.md"
  "docs/architecture/source-truth/FORGE_BACKEND_DOMAIN_CONTRACTS_SCOPE_064C.md"
  "docs/architecture/source-truth/FORGE_BACKEND_READ_MODEL_CONTRACTS_SCOPE_064D.md"
  "docs/architecture/source-truth/FORGE_BACKEND_APPROVAL_AND_AUDIT_CONTRACTS_SCOPE_064E.md"
  "docs/architecture/source-truth/FORGE_BACKEND_API_AND_ADAPTER_BOUNDARY_SCOPE_064F.md"
  "FORGE_MASTER_BUILD_TREE.md"
  "docs/architecture/source-truth/FORGE_UNIFIED_BUILD_TREE_001.md"
  "docs/roadmap/FORGE_ROADMAP_LOCK_001.md"
)

new_files=(
  "docs/architecture/source-truth/FORGE_OPPORTUNITY_PIPELINE_READ_ONLY_ADAPTER_SCOPE_066A.md"
  "docs/evidence/FORGE_OPPORTUNITY_PIPELINE_READ_ONLY_ADAPTER_SCOPE_066A.md"
  "docs/evidence/FORGE_OPPORTUNITY_PIPELINE_READ_ONLY_ADAPTER_SCOPE_CERTIFICATE_066A.md"
  "docs/evidence/forge-opportunity-pipeline-read-only-adapter-scope-audit-066a.json"
  "tools/termux/forge_066a_opportunity_pipeline_read_only_adapter_scope.sh"
)

for file in "${required_files[@]}"; do
  require_file "$file"
done

for file in "${new_files[@]}"; do
  if [[ -e "$file" ]]; then
    fail "new file slot already exists: $file"
  else
    pass "new file slot clear: $file"
  fi
done

say_stage "STAGE 3 BACKUP"
BACKUP_DIR=".forge-backups/066a-opportunity-pipeline-read-only-adapter-scope-$(date +%Y%m%d_%H%M%S)"
mkdir -p "$BACKUP_DIR"
for file in "${required_files[@]}"; do
  backup_file "$file"
done
write_rollback

say_stage "STAGE 4 VERIFY BASE LOCK"
python3 - <<'PY'
import json
from pathlib import Path

audit = json.loads(Path("docs/evidence/forge-client-crm-read-only-adapter-decision-audit-065d.json").read_text())
assert audit["status"] == "PASS"
assert audit["decision"] == "CLIENT_CRM_READ_ONLY_ADAPTER_LOCKED"
assert audit["next"] == "066A_OPPORTUNITY_PIPELINE_READ_ONLY_ADAPTER_SCOPE"
assert audit["backendConnection"] is False
assert audit["realEffectsEnabled"] is False
assert audit["crmWrite"] is False

print(json.dumps({
    "status": "PASS",
    "baseDecision": audit["decision"],
    "next": audit["next"],
    "realEffectsEnabled": audit["realEffectsEnabled"]
}, indent=2))
PY
pass "065D decision inputs verified"

say_stage "STAGE 5 APPLY DOCS"
mkdir -p tools/termux docs/architecture/source-truth docs/evidence
SCRIPT_SOURCE="$0"
if [[ -n "${BASH_SOURCE+x}" && -n "${BASH_SOURCE[0]:-}" ]]; then
  SCRIPT_SOURCE="${BASH_SOURCE[0]}"
fi
if [[ ! -f "$SCRIPT_SOURCE" ]]; then
  fail "runner source not found: $SCRIPT_SOURCE"
fi
cp "$SCRIPT_SOURCE" "tools/termux/forge_066a_opportunity_pipeline_read_only_adapter_scope.sh"
pass "copied runner into tools/termux"

cat > docs/architecture/source-truth/FORGE_OPPORTUNITY_PIPELINE_READ_ONLY_ADAPTER_SCOPE_066A.md <<'MD'
# Forge Opportunity Pipeline Read-Only Adapter Scope 066A

Status: SCOPED

Date: 2026-07-06

Phase:
`066A_OPPORTUNITY_PIPELINE_READ_ONLY_ADAPTER_SCOPE`

Base:
`065D_CLIENT_CRM_READ_ONLY_ADAPTER_DECISION_LOCK`

## Purpose

066A scopes the Opportunity Pipeline read-only adapter after the Client CRM read-only adapter was implemented, QA-locked, and decision-locked.

This is a documentation/scope phase only. It does not implement code, connect a backend, call a CRM, mutate pipeline state, create tasks, create calendar records, send messages, access auth, access secrets, execute providers, mutate UI, persist browser data, or run a real engine.

## Adapter Identity

Adapter id:
`forge.opportunity_pipeline.read_only.adapter.v1`

Adapter mode:
`read_only`

Route class:
`read_only`

Domain:
`opportunity_pipeline`

First implementation constraint:
local static fixture, non-sensitive sample fixture, generated fixture, or read-only adapter mock only.

## Routes Scoped

- `forge.api.read.opportunity_pipeline.list.v1`
- `forge.api.read.opportunity_pipeline.detail.v1`

These routes may return modeled read envelopes only. They must not mutate opportunity stages, create opportunities, update opportunities, delete opportunities, create follow-up tasks, create calendar events, send communications, call providers, access secrets, or execute actions.

## Allowed Reads

The adapter may expose only modeled, non-sensitive, read-only summary/detail fields:

- `opportunity_id`
- `client_ref`
- `display_name`
- `stage`
- `status`
- `priority`
- `expected_value_preview`
- `probability`
- `next_action`
- `followup_due_state`
- `risk_flags`
- `policy_summary_refs`
- `quote_summary_refs`
- `source_evidence_ids`
- `freshness_metadata`

All values must be fixture-backed or read-model-backed in the first implementation.

## Forbidden Effects

The adapter must block:

- opportunity create;
- opportunity update;
- opportunity delete;
- opportunity merge;
- opportunity stage mutation;
- follow-up task creation;
- calendar creation;
- message send;
- quote creation;
- policy update;
- provider call;
- secret access;
- browser persistence;
- action execution;
- real engine execution.

## Read Model Shape

Each successful response must return a `forge.backend.read_model.v1` envelope with:

- `readModelId`
- `schemaVersion`
- `domainId`
- `sourceOfTruth`
- `sourceEvidence`
- `generatedAt`
- `freshness`
- `capabilities`
- `approvalContext`
- `entities`
- `relationships`
- `metrics`
- `emptyState`
- `errors`
- `blockedEffects`
- `audit`
- `uiProjection`

Entity rows should use:

- `entityType`
- `entityId`
- `displayName`
- `clientRef`
- `stage`
- `status`
- `priority`
- `expectedValuePreview`
- `probability`
- `nextAction`
- `followupDueState`
- `riskFlags`
- `sourceEvidence`
- `freshness`

## Empty State And Safe Errors

The first implementation must return safe empty states instead of throwing raw provider or storage errors.

Allowed empty reasons:

- `no_records`
- `not_connected`
- `permission_blocked`
- `source_unavailable`
- `filter_no_match`
- `not_modeled`
- `pending_sync`
- `preview_placeholder`

Scoped safe error codes:

- `OPPORTUNITY_PIPELINE_SOURCE_UNAVAILABLE`
- `OPPORTUNITY_PIPELINE_PERMISSION_BLOCKED`
- `OPPORTUNITY_PIPELINE_SCHEMA_MISMATCH`
- `OPPORTUNITY_PIPELINE_STALE_SOURCE`
- `OPPORTUNITY_PIPELINE_NOT_MODELED`
- `OPPORTUNITY_PIPELINE_UNSAFE_FIELD_BLOCKED`

## Capabilities

May grant:

- `opportunity.read.preview`
- `opportunity.read.summary`
- `opportunity.read.detail`

Must not grant:

- `opportunity.write`
- `opportunity.stage.update`
- `task.create`
- `calendar.create`
- `message.send`
- `quote.create`
- `policy.update`
- `provider.call`
- `secret.read`
- `action.execute`

## Audit Requirement

Every adapter read must produce an audit-shaped event:

- `eventType`: `read_model_used`
- `domainId`: `opportunity_pipeline`
- `adapterId`: `forge.opportunity_pipeline.read_only.adapter.v1`
- `routeClass`: `read_only`
- real effects disabled

## Safety Requirement

The first implementation must expose explicit safety flags and every flag must be false:

- CRM write;
- pipeline write;
- task create;
- calendar create;
- message send;
- auth real;
- provider runtime;
- secret access;
- browser persistence;
- real engine execution.

## Implementation Gate

066A unlocks:

`066B_OPPORTUNITY_PIPELINE_READ_ONLY_ADAPTER_IMPLEMENTATION`

066B may create a local/static adapter and tests only. It must not connect real backend systems or run provider engines.

## Decision

DECISION=PASS_066A_OPPORTUNITY_PIPELINE_READ_ONLY_ADAPTER_SCOPE

NEXT=066B_OPPORTUNITY_PIPELINE_READ_ONLY_ADAPTER_IMPLEMENTATION
MD

cat > docs/evidence/FORGE_OPPORTUNITY_PIPELINE_READ_ONLY_ADAPTER_SCOPE_066A.md <<'MD'
# Forge Opportunity Pipeline Read-Only Adapter Scope Evidence 066A

Phase:
`066A_OPPORTUNITY_PIPELINE_READ_ONLY_ADAPTER_SCOPE`

Status:
PASS

Base:
`065D_CLIENT_CRM_READ_ONLY_ADAPTER_DECISION_LOCK`

Adapter scoped:
`forge.opportunity_pipeline.read_only.adapter.v1`

Routes scoped:

- `forge.api.read.opportunity_pipeline.list.v1`
- `forge.api.read.opportunity_pipeline.detail.v1`

Boundary verified:

- scope-only documentation;
- no UI mutation;
- no backend connection;
- no CRM write;
- no pipeline write;
- no calendar creation;
- no message send;
- no auth mutation;
- no provider execution;
- no real engine execution.

DECISION=PASS_066A_OPPORTUNITY_PIPELINE_READ_ONLY_ADAPTER_SCOPE

NEXT=066B_OPPORTUNITY_PIPELINE_READ_ONLY_ADAPTER_IMPLEMENTATION
MD

cat > docs/evidence/FORGE_OPPORTUNITY_PIPELINE_READ_ONLY_ADAPTER_SCOPE_CERTIFICATE_066A.md <<'MD'
# Forge Opportunity Pipeline Read-Only Adapter Scope Certificate 066A

DECISION=PASS_066A_OPPORTUNITY_PIPELINE_READ_ONLY_ADAPTER_SCOPE

NEXT=066B_OPPORTUNITY_PIPELINE_READ_ONLY_ADAPTER_IMPLEMENTATION

Scope:
Opportunity Pipeline read-only adapter contract is scoped for local/static first implementation.

Blocked:
CRM write, pipeline write, task create, calendar create, message send, auth mutation, provider runtime, secret access, browser persistence, and real engine execution remain blocked.
MD

cat > docs/evidence/forge-opportunity-pipeline-read-only-adapter-scope-audit-066a.json <<'JSON'
{
  "phase": "066A_OPPORTUNITY_PIPELINE_READ_ONLY_ADAPTER_SCOPE",
  "status": "PASS",
  "basePhase": "065D_CLIENT_CRM_READ_ONLY_ADAPTER_DECISION_LOCK",
  "adapter": {
    "adapterId": "forge.opportunity_pipeline.read_only.adapter.v1",
    "adapterMode": "read_only",
    "routeClass": "read_only",
    "domainId": "opportunity_pipeline"
  },
  "routesScoped": [
    "forge.api.read.opportunity_pipeline.list.v1",
    "forge.api.read.opportunity_pipeline.detail.v1"
  ],
  "allowedReads": [
    "opportunity_id",
    "client_ref",
    "display_name",
    "stage",
    "status",
    "priority",
    "expected_value_preview",
    "probability",
    "next_action",
    "followup_due_state",
    "risk_flags",
    "policy_summary_refs",
    "quote_summary_refs",
    "source_evidence_ids",
    "freshness_metadata"
  ],
  "forbiddenEffects": [
    "opportunity_create",
    "opportunity_update",
    "opportunity_delete",
    "opportunity_merge",
    "opportunity_stage_mutation",
    "task_create",
    "calendar_create",
    "message_send",
    "quote_create",
    "policy_update",
    "provider_call",
    "secret_access",
    "browser_persistence",
    "action_execution",
    "real_engine_execution"
  ],
  "safeErrors": [
    "OPPORTUNITY_PIPELINE_SOURCE_UNAVAILABLE",
    "OPPORTUNITY_PIPELINE_PERMISSION_BLOCKED",
    "OPPORTUNITY_PIPELINE_SCHEMA_MISMATCH",
    "OPPORTUNITY_PIPELINE_STALE_SOURCE",
    "OPPORTUNITY_PIPELINE_NOT_MODELED",
    "OPPORTUNITY_PIPELINE_UNSAFE_FIELD_BLOCKED"
  ],
  "capabilitiesAllowed": [
    "opportunity.read.preview",
    "opportunity.read.summary",
    "opportunity.read.detail"
  ],
  "firstImplementationConstraint": [
    "local_static_fixture",
    "non_sensitive_sample_fixture",
    "generated_fixture",
    "read_only_adapter_mock"
  ],
  "scopeOnly": true,
  "uiMutation": false,
  "backendConnection": false,
  "crmWrite": false,
  "pipelineWrite": false,
  "realEffectsEnabled": false,
  "next": "066B_OPPORTUNITY_PIPELINE_READ_ONLY_ADAPTER_IMPLEMENTATION"
}
JSON

pass "wrote 066A docs and audit json"

say_stage "STAGE 6 UPDATE BUILD TREE / ROADMAP"
SYNC_BODY=$(cat <<'SYNC'
## 066A Opportunity Pipeline Read-Only Adapter Scope

Status: PASS

Adapter scoped:
`forge.opportunity_pipeline.read_only.adapter.v1`

Routes scoped:

- `forge.api.read.opportunity_pipeline.list.v1`
- `forge.api.read.opportunity_pipeline.detail.v1`

Allowed boundary:

- route class `read_only`;
- adapter mode `read_only`;
- local/static first implementation only;
- read model envelope output;
- safe empty states and safe errors;
- audit event `read_model_used`.

Blocked:

- opportunity write;
- stage mutation;
- task create;
- calendar create;
- message send;
- provider runtime;
- secret access;
- browser persistence;
- real engine execution.

DECISION=PASS_066A_OPPORTUNITY_PIPELINE_READ_ONLY_ADAPTER_SCOPE

NEXT=066B_OPPORTUNITY_PIPELINE_READ_ONLY_ADAPTER_IMPLEMENTATION
SYNC
)

append_sync_block "FORGE_MASTER_BUILD_TREE.md" "<!-- FORGE:066A_OPPORTUNITY_PIPELINE_READ_ONLY_ADAPTER_SCOPE:START -->" "<!-- FORGE:066A_OPPORTUNITY_PIPELINE_READ_ONLY_ADAPTER_SCOPE:END -->" "$SYNC_BODY"
append_sync_block "docs/architecture/source-truth/FORGE_UNIFIED_BUILD_TREE_001.md" "<!-- FORGE:066A_OPPORTUNITY_PIPELINE_READ_ONLY_ADAPTER_SCOPE:START -->" "<!-- FORGE:066A_OPPORTUNITY_PIPELINE_READ_ONLY_ADAPTER_SCOPE:END -->" "$SYNC_BODY"
append_sync_block "docs/roadmap/FORGE_ROADMAP_LOCK_001.md" "<!-- FORGE:066A_OPPORTUNITY_PIPELINE_READ_ONLY_ADAPTER_SCOPE:START -->" "<!-- FORGE:066A_OPPORTUNITY_PIPELINE_READ_ONLY_ADAPTER_SCOPE:END -->" "$SYNC_BODY"
pass "updated build tree / roadmap sync blocks"

say_stage "STAGE 7 NORMALIZE FILES"
changed_files=(
  "FORGE_MASTER_BUILD_TREE.md"
  "docs/architecture/source-truth/FORGE_UNIFIED_BUILD_TREE_001.md"
  "docs/roadmap/FORGE_ROADMAP_LOCK_001.md"
  "docs/architecture/source-truth/FORGE_OPPORTUNITY_PIPELINE_READ_ONLY_ADAPTER_SCOPE_066A.md"
  "docs/evidence/FORGE_OPPORTUNITY_PIPELINE_READ_ONLY_ADAPTER_SCOPE_066A.md"
  "docs/evidence/FORGE_OPPORTUNITY_PIPELINE_READ_ONLY_ADAPTER_SCOPE_CERTIFICATE_066A.md"
  "docs/evidence/forge-opportunity-pipeline-read-only-adapter-scope-audit-066a.json"
  "tools/termux/forge_066a_opportunity_pipeline_read_only_adapter_scope.sh"
)

for file in "${changed_files[@]}"; do
  normalize_file "$file"
done
pass "normalized EOF and trailing whitespace"

say_stage "STAGE 8 VALIDATION"
run_cmd bash -n tools/termux/forge_066a_opportunity_pipeline_read_only_adapter_scope.sh
run_cmd python3 -m json.tool docs/evidence/forge-opportunity-pipeline-read-only-adapter-scope-audit-066a.json
run_cmd rg -n "DECISION=PASS_066A_OPPORTUNITY_PIPELINE_READ_ONLY_ADAPTER_SCOPE|NEXT=066B_OPPORTUNITY_PIPELINE_READ_ONLY_ADAPTER_IMPLEMENTATION|forge.opportunity_pipeline.read_only.adapter.v1|OPPORTUNITY_PIPELINE_NOT_MODELED|opportunity.read.summary" \
  docs/architecture/source-truth/FORGE_OPPORTUNITY_PIPELINE_READ_ONLY_ADAPTER_SCOPE_066A.md \
  docs/evidence/FORGE_OPPORTUNITY_PIPELINE_READ_ONLY_ADAPTER_SCOPE_066A.md \
  docs/evidence/FORGE_OPPORTUNITY_PIPELINE_READ_ONLY_ADAPTER_SCOPE_CERTIFICATE_066A.md \
  docs/evidence/forge-opportunity-pipeline-read-only-adapter-scope-audit-066a.json \
  FORGE_MASTER_BUILD_TREE.md \
  docs/architecture/source-truth/FORGE_UNIFIED_BUILD_TREE_001.md \
  docs/roadmap/FORGE_ROADMAP_LOCK_001.md
run_cmd git diff --check || warn "No package test suite required for documentation-only Opportunity Pipeline read-only adapter scope"

say_stage "STAGE 9 SAFETY SCAN"
if rg -n "crmWrite: true|pipelineWrite: true|calendarCreate: true|messageSend: true|authReal: true|providerRuntime: true|browserPersistence: true|realEngineExecution: true|realEffectsEnabled\\\": true|backendConnection\\\": true|\\\"pipelineWrite\\\": true|\\\"realEffectsAllowed\\\": true|\\\"secretAccess\\\": true|\\\"providerRuntime\\\": true" \
  docs/architecture/source-truth/FORGE_OPPORTUNITY_PIPELINE_READ_ONLY_ADAPTER_SCOPE_066A.md \
  docs/evidence/FORGE_OPPORTUNITY_PIPELINE_READ_ONLY_ADAPTER_SCOPE_066A.md \
  docs/evidence/FORGE_OPPORTUNITY_PIPELINE_READ_ONLY_ADAPTER_SCOPE_CERTIFICATE_066A.md \
  docs/evidence/forge-opportunity-pipeline-read-only-adapter-scope-audit-066a.json \
  FORGE_MASTER_BUILD_TREE.md \
  docs/architecture/source-truth/FORGE_UNIFIED_BUILD_TREE_001.md \
  docs/roadmap/FORGE_ROADMAP_LOCK_001.md; then
  fail "safety scan found an enabled real-effect marker"
fi
pass "safety scan clean"

say_stage "STAGE 10 STAGE AUTHORIZED FILES"
git add "${changed_files[@]}"
run_cmd git diff --cached --name-only

expected=$(mktemp)
actual=$(mktemp)
printf "%s\n" "${changed_files[@]}" | sort > "$expected"
git diff --cached --name-only | sort > "$actual"
if ! diff -u "$expected" "$actual"; then
  fail "staged file set differs from authorized files"
fi
rm -f "$expected" "$actual"
pass "only authorized files staged"
run_cmd git diff --cached --check

say_stage "STAGE 11 COMMIT PUSH"
if git diff --cached --quiet; then
  fail "nothing staged for commit"
fi
run_cmd git commit -m "docs: scope opportunity pipeline read-only adapter"
run_cmd git push origin HEAD:main

say_stage "STAGE 12 FINAL CHECKPOINT"
run_cmd git status --short --branch
run_cmd git log --oneline -10

say_stage "FINAL DECISION"
printf "PASS_066A_OPPORTUNITY_PIPELINE_READ_ONLY_ADAPTER_SCOPE_COMMIT_PUSH_COMPLETE\n"
printf "NEXT=066B_OPPORTUNITY_PIPELINE_READ_ONLY_ADAPTER_IMPLEMENTATION\n"
printf "BACKUP=%s\n" "$BACKUP_DIR"
printf "ROLLBACK=%s\n" "$BACKUP_DIR/rollback-066a.sh"
printf "Reporte: %s\n" "$REPORT"

autocopy_report
