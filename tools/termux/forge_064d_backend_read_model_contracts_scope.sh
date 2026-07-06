#!/usr/bin/env bash
set -euo pipefail

PHASE="064D_BACKEND_READ_MODEL_CONTRACTS_SCOPE"
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
  local rollback="$BACKUP_DIR/rollback-064d.sh"
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
    local archive=".forge-backups/rollback-archives/$(basename "$file").064d.$(date +%Y%m%d_%H%M%S)"
    mv "$file" "$archive"
    echo "archived created file $file -> $archive"
  fi
}

restore_or_archive "FORGE_MASTER_BUILD_TREE.md"
restore_or_archive "docs/architecture/source-truth/FORGE_UNIFIED_BUILD_TREE_001.md"
restore_or_archive "docs/roadmap/FORGE_ROADMAP_LOCK_001.md"
restore_or_archive "docs/architecture/source-truth/FORGE_BACKEND_READ_MODEL_CONTRACTS_SCOPE_064D.md"
restore_or_archive "docs/evidence/FORGE_BACKEND_READ_MODEL_CONTRACTS_SCOPE_064D.md"
restore_or_archive "docs/evidence/FORGE_BACKEND_READ_MODEL_CONTRACTS_SCOPE_CERTIFICATE_064D.md"
restore_or_archive "docs/evidence/forge-backend-read-model-contracts-scope-audit-064d.json"
restore_or_archive "tools/termux/forge_064d_backend_read_model_contracts_scope.sh"

echo "rollback 064D complete"
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
printf "MODE=backend read model contracts scope documentation\n"
printf "BOUNDARY=docs/scope only; no UI mutation; no backend connection; no CRM; no calendar; no send; no auth; no provider execution; no real engine execution\n"
printf "REPORT=%s\n" "$REPORT"

say_stage "STAGE 1 CHECKPOINT"
cd "$REPO" || fail "repo not found: $REPO"
run_cmd git status --short --branch
run_cmd git log --oneline -10
run_cmd git diff --name-status
run_cmd git diff --cached --name-status

if [[ -n "$(git diff --name-only)" || -n "$(git diff --cached --name-only)" ]]; then
  hold "tracked worktree has unstaged or staged changes; refusing to write 064D over a moving target"
fi

say_stage "STAGE 2 REQUIRED FILE CHECK"
required_files=(
  "docs/architecture/source-truth/FORGE_BACKEND_DOMAIN_CONTRACTS_SCOPE_064C.md"
  "docs/evidence/FORGE_BACKEND_DOMAIN_CONTRACTS_SCOPE_064C.md"
  "docs/evidence/forge-backend-domain-contracts-scope-audit-064c.json"
  "FORGE_MASTER_BUILD_TREE.md"
  "docs/architecture/source-truth/FORGE_UNIFIED_BUILD_TREE_001.md"
  "docs/roadmap/FORGE_ROADMAP_LOCK_001.md"
)

for file in "${required_files[@]}"; do
  require_file "$file"
done

say_stage "STAGE 3 BACKUP"
BACKUP_DIR=".forge-backups/064d-backend-read-model-contracts-scope-$(date +%Y%m%d_%H%M%S)"
mkdir -p "$BACKUP_DIR"
for file in "${required_files[@]}"; do
  backup_file "$file"
done
write_rollback

say_stage "STAGE 4 APPLY DOCS"
mkdir -p tools/termux docs/architecture/source-truth docs/evidence
SCRIPT_SOURCE="$0"
if [[ -n "${BASH_SOURCE+x}" && -n "${BASH_SOURCE[0]:-}" ]]; then
  SCRIPT_SOURCE="${BASH_SOURCE[0]}"
fi
if [[ ! -f "$SCRIPT_SOURCE" ]]; then
  fail "runner source not found: $SCRIPT_SOURCE"
fi
cp "$SCRIPT_SOURCE" "tools/termux/forge_064d_backend_read_model_contracts_scope.sh"
pass "copied runner into tools/termux"

cat > docs/architecture/source-truth/FORGE_BACKEND_READ_MODEL_CONTRACTS_SCOPE_064D.md <<'MD'
# Forge Backend Read Model Contracts Scope 064D

Status: SCOPED

Date: 2026-07-06

Phase:
`064D_BACKEND_READ_MODEL_CONTRACTS_SCOPE`

Base:
`064C_BACKEND_DOMAIN_CONTRACTS_SCOPE`

## Purpose

064D defines the backend read model contract layer required before Forge connects any read-only adapter.

064C defined backend domains. 064D defines how each domain must expose safe, explainable, freshness-aware read models to the UI, command bar, Alfred, and preview action contracts.

This phase is documentation and scope only. It does not implement adapters, mutate UI, write CRM records, create calendar items, deliver messages, authenticate users, execute providers, or run a real engine.

## Global Read Model Rule

No domain can be read by Forge as backend truth until its read model declares:

- `readModelId`;
- domain owner;
- source of truth;
- source evidence;
- canonical entity references;
- freshness timestamp;
- freshness status;
- empty-state semantics;
- error envelope;
- capability context;
- approval context when relevant;
- audit correlation id;
- stale-data behavior;
- UI-safe display fields;
- blocked mutation effects;
- QA evidence requirement.

## Required Read Envelope

Every backend read model must fit this envelope:

```text
readModelId
schemaVersion
domainId
sourceOfTruth
sourceEvidence
generatedAt
freshness
capabilities
approvalContext
entities
relationships
metrics
emptyState
errors
blockedEffects
audit
uiProjection
```

## Freshness Contract

Freshness statuses:

- `fresh`
- `possibly_stale`
- `stale`
- `source_unavailable`
- `not_connected`
- `preview_static`

Rules:

- `fresh` requires a source timestamp and source evidence.
- `possibly_stale` must show a visible caution in operational workflows.
- `stale` cannot drive recommendations without caution.
- `source_unavailable` cannot be treated as an empty business fact.
- `not_connected` means the module has no real adapter.
- `preview_static` means static preview data only.

## Empty-State Contract

Empty state is never allowed to mean "false" by default.

Required empty reasons:

- `no_records`
- `not_connected`
- `permission_blocked`
- `source_unavailable`
- `filter_no_match`
- `not_modeled`
- `pending_sync`
- `preview_placeholder`

## Error Contract

Every read model must use a safe error envelope:

```text
errorId
domainId
severity
recoverability
safeMessage
technicalClass
retryAllowed
sourceEvidence
auditCorrelationId
```

Errors cannot expose secrets, credentials, private provider payloads, or raw stack traces to the UI.

## Domain Read Model Inventory

| Domain | Required Read Models | Required Empty States | Required Errors | Freshness Requirement | Connection Rule |
|---|---|---|---|---|---|
| Client / CRM | `client.list.v1`, `client.detail.v1`, `client.risk_context.v1`, `client.identity_match.v1` | no clients, not connected, permission blocked, duplicate unresolved | source unavailable, identity conflict, permission denied | source timestamp per record | no CRM read adapter until client identity and consent are modeled |
| Opportunity / Pipeline | `opportunity.priority_list.v1`, `opportunity.detail.v1`, `pipeline.summary.v1`, `pipeline.stage_distribution.v1` | no opportunities, no stage match, pending sync | stage taxonomy mismatch, source unavailable | generatedAt plus opportunity updatedAt | no recommendation without stage source evidence |
| Quote / Cotizacion | `quote.workspace_preview.v1`, `quote.request_summary.v1`, `quote.comparison.v1`, `quote.status.v1` | no quote workspace, quote not prepared, provider not connected | quote input incomplete, provider unavailable, assumption mismatch | quote timestamp plus assumption version | quote reads remain preview until carrier truth boundary exists |
| Policy / Poliza | `policy.summary.v1`, `policy.detail.v1`, `policy.renewal_list.v1`, `policy.timeline.v1` | no policies, no renewal due, source not connected | policy source unavailable, evidence missing, stale policy data | official policy evidence timestamp required | no policy truth without evidence reference |
| Document / Evidence | `document.list.v1`, `document.extraction_summary.v1`, `document.confidence_report.v1`, `evidence.provenance.v1` | no documents, extraction pending, low confidence | OCR failed, unsupported document, provenance missing | extraction timestamp and source hash required | no extracted truth without confidence/provenance |
| Follow-up / Task | `task.followup_list.v1`, `task.risk_queue.v1`, `task.due_summary.v1` | no tasks, no overdue tasks, source unavailable | invalid due date, owner missing, task source unavailable | due date and source updatedAt required | read-only task view before writes |
| Calendar Intent | `calendar.upcoming_preview.v1`, `calendar.draft_meeting.v1`, `calendar.availability_hint.v1` | no appointments, calendar not connected, no availability | calendar source unavailable, permission blocked | calendar source timestamp required | calendar create/update remains blocked |
| Communication | `communication.draft_preview.v1`, `communication.history_summary.v1`, `message.approval_context.v1` | no history, no draft, channel not connected | channel unavailable, recipient missing, approval missing | source timestamp per history item | no delivery from read model |
| Profile / Auth | `profile.summary.v1`, `profile.role_context.v1`, `profile.avatar_context.v1` | no profile, auth not connected, role unknown | identity unavailable, role conflict | session/context timestamp required | profile UI remains preview until auth contract |
| Settings / Preferences | `settings.workspace_preferences.v1`, `settings.theme_context.v1` | no preferences, defaults active, not connected | preference unavailable, invalid setting | preference version required | persistence blocked until settings contract |
| Command / Action Router | `command.catalog.v1`, `action.registry.v1`, `action.preview_payload.v1` | no commands, command not modeled, target missing | action unavailable, blocked effect, target unresolved | generatedAt and contract version required | preview-only until domain contracts are locked |
| Approval / Audit | `approval.status.v1`, `audit.trail_preview.v1`, `blocked.reason_list.v1` | no approval required, no audit events, not connected | approval missing, audit unavailable | audit correlation timestamp required | required before write adapter |
| Capability / Permission | `capability.context.v1`, `permission.blocked_effects.v1` | no capability, role missing, effect blocked | permission denied, capability unknown | evaluatedAt required | central evaluator before writes |
| Backend API Boundary | `api.route_manifest.v1`, `api.health_preview.v1`, `api.effect_policy.v1` | no routes, route not implemented, not connected | route unavailable, schema mismatch | route manifest version required | route implementation waits for 064F |
| Error / Empty State | `error.catalog.v1`, `empty_state.catalog.v1` | not modeled, source unavailable, preview placeholder | unknown error, unsafe error, retry blocked | catalog version required | must exist before adapter |
| Sync / Freshness | `sync.status.v1`, `freshness.summary.v1`, `source.evidence_index.v1` | no sync, not connected, pending sync | conflict, stale source, source unavailable | source timestamp and sync timestamp required | read adapters must emit freshness |

## UI Projection Rule

Backend read models cannot be passed directly into UI components. Each read model needs a UI projection:

- compact list projection;
- detail projection;
- command result projection;
- mobile projection;
- empty projection;
- error projection.

The projection must omit implementation-only details, secrets, raw provider payloads, and unsafe internal failure data.

## Explicit Non-Scope

064D does not authorize:

- adapter implementation;
- backend route implementation;
- database schema implementation;
- UI mutation;
- CRM mutation;
- calendar creation;
- message delivery;
- authentication changes;
- provider execution;
- browser persistence behavior;
- browser request behavior;
- real engine execution.

## Recommended Next Work

064E should define approval and audit contracts.

064F should define backend API and adapter boundaries.

064G should define a read-only adapter dry run only after 064E and 064F are closed.

## Final Decision

064D scopes backend read model contracts for all active backend domains.

DECISION=PASS_064D_BACKEND_READ_MODEL_CONTRACTS_SCOPE

NEXT=064E_BACKEND_APPROVAL_AND_AUDIT_CONTRACTS_SCOPE
MD

cat > docs/evidence/FORGE_BACKEND_READ_MODEL_CONTRACTS_SCOPE_064D.md <<'MD'
# Forge Backend Read Model Contracts Scope 064D

Status: PASS

Phase:
`064D_BACKEND_READ_MODEL_CONTRACTS_SCOPE`

## Result

064D defines the backend read model contract layer required before a real read-only adapter can be attempted.

Read model requirements include:

- source of truth;
- source evidence;
- freshness status;
- empty-state semantics;
- safe error envelope;
- capability context;
- approval context;
- audit correlation;
- UI projection boundary;
- blocked effects.

## Boundary

This phase is documentation-only. No UI, backend adapter, provider, CRM, calendar, message, authentication, browser persistence, browser request, or real engine behavior was changed.

## Decision

DECISION=PASS_064D_BACKEND_READ_MODEL_CONTRACTS_SCOPE

NEXT=064E_BACKEND_APPROVAL_AND_AUDIT_CONTRACTS_SCOPE
MD

cat > docs/evidence/FORGE_BACKEND_READ_MODEL_CONTRACTS_SCOPE_CERTIFICATE_064D.md <<'MD'
# Forge Backend Read Model Contracts Scope Certificate 064D

Status: CERTIFIED

Phase:
`064D_BACKEND_READ_MODEL_CONTRACTS_SCOPE`

064D certifies that backend read model contracts are scoped for Forge domains before real read-only adapter work.

This certificate covers scope only. It does not certify adapter implementation, backend route behavior, CRM writes, calendar writes, message delivery, authentication, provider execution, browser persistence, browser request behavior, or real engine execution.

DECISION=PASS_064D_BACKEND_READ_MODEL_CONTRACTS_SCOPE

NEXT=064E_BACKEND_APPROVAL_AND_AUDIT_CONTRACTS_SCOPE
MD

cat > docs/evidence/forge-backend-read-model-contracts-scope-audit-064d.json <<'JSON'
{
  "phase": "064D_BACKEND_READ_MODEL_CONTRACTS_SCOPE",
  "status": "PASS",
  "basePhase": "064C_BACKEND_DOMAIN_CONTRACTS_SCOPE",
  "readEnvelopeFields": [
    "readModelId",
    "schemaVersion",
    "domainId",
    "sourceOfTruth",
    "sourceEvidence",
    "generatedAt",
    "freshness",
    "capabilities",
    "approvalContext",
    "entities",
    "relationships",
    "metrics",
    "emptyState",
    "errors",
    "blockedEffects",
    "audit",
    "uiProjection"
  ],
  "freshnessStatuses": [
    "fresh",
    "possibly_stale",
    "stale",
    "source_unavailable",
    "not_connected",
    "preview_static"
  ],
  "emptyReasons": [
    "no_records",
    "not_connected",
    "permission_blocked",
    "source_unavailable",
    "filter_no_match",
    "not_modeled",
    "pending_sync",
    "preview_placeholder"
  ],
  "domainsScoped": [
    "client_crm",
    "opportunity_pipeline",
    "quote",
    "policy",
    "document_evidence",
    "followup_task",
    "calendar_intent",
    "communication",
    "profile_auth",
    "settings_preferences",
    "command_action_router",
    "approval_audit",
    "capability_permission",
    "backend_api_boundary",
    "error_empty_state",
    "sync_freshness"
  ],
  "scopeOnly": true,
  "uiMutation": false,
  "backendConnection": false,
  "realEffectsEnabled": false,
  "next": "064E_BACKEND_APPROVAL_AND_AUDIT_CONTRACTS_SCOPE"
}
JSON
pass "wrote 064D docs and audit json"

say_stage "STAGE 5 UPDATE BUILD TREE / ROADMAP"
sync_body="## 064D Backend Read Model Contracts Scope

Status: PASS / SCOPED.

064D defines backend read model contracts for the domains scoped in 064C.

Required read envelope:

- read model id
- schema version
- domain id
- source of truth
- source evidence
- generated timestamp
- freshness status
- capabilities
- approval context
- entities and relationships
- metrics
- empty state
- safe errors
- blocked effects
- audit correlation
- UI projection

Freshness statuses:

- \`fresh\`
- \`possibly_stale\`
- \`stale\`
- \`source_unavailable\`
- \`not_connected\`
- \`preview_static\`

Global rule:

No backend source can be treated as truth until its read model declares source evidence, freshness, empty-state semantics, safe error envelope, capability context, approval context, blocked effects, and UI projection boundary.

Artifacts:

- \`docs/architecture/source-truth/FORGE_BACKEND_READ_MODEL_CONTRACTS_SCOPE_064D.md\`
- \`docs/evidence/FORGE_BACKEND_READ_MODEL_CONTRACTS_SCOPE_064D.md\`
- \`docs/evidence/FORGE_BACKEND_READ_MODEL_CONTRACTS_SCOPE_CERTIFICATE_064D.md\`
- \`docs/evidence/forge-backend-read-model-contracts-scope-audit-064d.json\`

Boundary:

Documentation-only scope. No UI, backend connection, CRM, calendar, message, auth, provider, browser persistence, browser request, or real engine behavior is changed.

DECISION=PASS_064D_BACKEND_READ_MODEL_CONTRACTS_SCOPE

NEXT=064E_BACKEND_APPROVAL_AND_AUDIT_CONTRACTS_SCOPE"

append_sync_block "FORGE_MASTER_BUILD_TREE.md" "<!-- FORGEOS:BACKEND_READ_MODEL_CONTRACTS_SCOPE_064D:START -->" "<!-- FORGEOS:BACKEND_READ_MODEL_CONTRACTS_SCOPE_064D:END -->" "$sync_body"
append_sync_block "docs/architecture/source-truth/FORGE_UNIFIED_BUILD_TREE_001.md" "<!-- FORGEOS:BACKEND_READ_MODEL_CONTRACTS_SCOPE_064D:START -->" "<!-- FORGEOS:BACKEND_READ_MODEL_CONTRACTS_SCOPE_064D:END -->" "$sync_body"
append_sync_block "docs/roadmap/FORGE_ROADMAP_LOCK_001.md" "<!-- FORGEOS:BACKEND_READ_MODEL_CONTRACTS_SCOPE_064D:START -->" "<!-- FORGEOS:BACKEND_READ_MODEL_CONTRACTS_SCOPE_064D:END -->" "$sync_body"
pass "updated build tree / roadmap sync blocks"

say_stage "STAGE 6 NORMALIZE FILES"
changed_files=(
  "FORGE_MASTER_BUILD_TREE.md"
  "docs/architecture/source-truth/FORGE_UNIFIED_BUILD_TREE_001.md"
  "docs/roadmap/FORGE_ROADMAP_LOCK_001.md"
  "docs/architecture/source-truth/FORGE_BACKEND_READ_MODEL_CONTRACTS_SCOPE_064D.md"
  "docs/evidence/FORGE_BACKEND_READ_MODEL_CONTRACTS_SCOPE_064D.md"
  "docs/evidence/FORGE_BACKEND_READ_MODEL_CONTRACTS_SCOPE_CERTIFICATE_064D.md"
  "docs/evidence/forge-backend-read-model-contracts-scope-audit-064d.json"
  "tools/termux/forge_064d_backend_read_model_contracts_scope.sh"
)

for file in "${changed_files[@]}"; do
  normalize_file "$file"
done
pass "normalized EOF and trailing whitespace"

say_stage "STAGE 7 VALIDATION"
run_cmd bash -n tools/termux/forge_064d_backend_read_model_contracts_scope.sh
run_cmd python3 -m json.tool docs/evidence/forge-backend-read-model-contracts-scope-audit-064d.json
run_cmd rg -n "DECISION=PASS_064D_BACKEND_READ_MODEL_CONTRACTS_SCOPE|NEXT=064E_BACKEND_APPROVAL_AND_AUDIT_CONTRACTS_SCOPE|readModelId|freshnessStatuses|preview_static" docs/architecture/source-truth/FORGE_BACKEND_READ_MODEL_CONTRACTS_SCOPE_064D.md docs/evidence/FORGE_BACKEND_READ_MODEL_CONTRACTS_SCOPE_064D.md docs/evidence/FORGE_BACKEND_READ_MODEL_CONTRACTS_SCOPE_CERTIFICATE_064D.md docs/evidence/forge-backend-read-model-contracts-scope-audit-064d.json FORGE_MASTER_BUILD_TREE.md docs/architecture/source-truth/FORGE_UNIFIED_BUILD_TREE_001.md docs/roadmap/FORGE_ROADMAP_LOCK_001.md
run_cmd git diff --check
warn "No package test suite required for documentation-only backend read model contracts scope"

say_stage "STAGE 8 SAFETY SCAN"
safety_files=(
  "docs/architecture/source-truth/FORGE_BACKEND_READ_MODEL_CONTRACTS_SCOPE_064D.md"
  "docs/evidence/FORGE_BACKEND_READ_MODEL_CONTRACTS_SCOPE_064D.md"
  "docs/evidence/FORGE_BACKEND_READ_MODEL_CONTRACTS_SCOPE_CERTIFICATE_064D.md"
  "docs/evidence/forge-backend-read-model-contracts-scope-audit-064d.json"
  "FORGE_MASTER_BUILD_TREE.md"
  "docs/architecture/source-truth/FORGE_UNIFIED_BUILD_TREE_001.md"
  "docs/roadmap/FORGE_ROADMAP_LOCK_001.md"
)
safety_scan_file="$BACKUP_DIR/safety-scan-064d.txt"

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
  "mayCreateCalendarEvent: true"
do
  if rg -n --fixed-strings "$token" "${safety_files[@]}" >> "$safety_scan_file" 2>/dev/null; then
    cat "$safety_scan_file"
    fail "safety scan found forbidden token: $token"
  fi
done
pass "safety scan clean"

say_stage "STAGE 9 STAGE AUTHORIZED FILES"
git add "${changed_files[@]}"

expected="$(mktemp)"
actual="$(mktemp)"
printf "%s\n" "${changed_files[@]}" | sort > "$expected"
git diff --cached --name-only | sort > "$actual"
run_cmd git diff --cached --name-only
if ! diff -u "$expected" "$actual"; then
  fail "staged files differ from authorized 064D file set"
fi
pass "only authorized files staged"
run_cmd git diff --cached --check

say_stage "STAGE 10 COMMIT PUSH"
run_cmd git commit -m "docs: scope backend read model contracts"
run_cmd git push origin HEAD:main

say_stage "STAGE 11 FINAL CHECKPOINT"
run_cmd git status --short --branch
run_cmd git log --oneline -10

say_stage "FINAL DECISION"
printf "PASS_064D_BACKEND_READ_MODEL_CONTRACTS_SCOPE_COMMIT_PUSH_COMPLETE\n"
printf "NEXT=064E_BACKEND_APPROVAL_AND_AUDIT_CONTRACTS_SCOPE\n"
printf "BACKUP=%s\n" "$BACKUP_DIR"
printf "ROLLBACK=%s\n" "$BACKUP_DIR/rollback-064d.sh"
printf "Reporte: %s\n" "$REPORT"
autocopy_report
