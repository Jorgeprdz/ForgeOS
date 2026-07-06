#!/usr/bin/env bash
set -euo pipefail

PHASE="065B_CLIENT_CRM_READ_ONLY_ADAPTER_IMPLEMENTATION"
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

backup_file_if_present() {
  local file="$1"
  if [[ -e "$file" ]]; then
    local dest="$BACKUP_DIR/$file"
    mkdir -p "$(dirname "$dest")"
    cp -R "$file" "$dest"
    pass "backup $file"
  else
    pass "new file slot clear: $file"
  fi
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
  local rollback="$BACKUP_DIR/rollback-065b.sh"
  cat > "$rollback" <<'ROLLBACK'
#!/usr/bin/env bash
set -euo pipefail

REPO="/storage/emulated/0/Forge OS"
BACKUP_DIR_PLACEHOLDER
cd "$REPO"

restore_or_archive() {
  local file="$1"
  local backup="$BACKUP_DIR/$file"
  if [[ -e "$backup" ]]; then
    mkdir -p "$(dirname "$file")"
    rm -rf "$file"
    cp -R "$backup" "$file"
    echo "restored $file"
  elif [[ -e "$file" ]]; then
    mkdir -p ".forge-backups/rollback-archives"
    local archive=".forge-backups/rollback-archives/$(basename "$file").065b.$(date +%Y%m%d_%H%M%S)"
    mv "$file" "$archive"
    echo "archived created file $file -> $archive"
  fi
}

restore_or_archive "FORGE_MASTER_BUILD_TREE.md"
restore_or_archive "docs/architecture/source-truth/FORGE_UNIFIED_BUILD_TREE_001.md"
restore_or_archive "docs/roadmap/FORGE_ROADMAP_LOCK_001.md"
restore_or_archive "platform/adapters/client-crm/client-crm-read-only-adapter-065b.js"
restore_or_archive "tests/client-crm-read-only-adapter-065b-test.js"
restore_or_archive "docs/architecture/source-truth/FORGE_CLIENT_CRM_READ_ONLY_ADAPTER_IMPLEMENTATION_CLOSURE_065B.md"
restore_or_archive "docs/evidence/FORGE_CLIENT_CRM_READ_ONLY_ADAPTER_IMPLEMENTATION_065B.md"
restore_or_archive "docs/evidence/FORGE_CLIENT_CRM_READ_ONLY_ADAPTER_IMPLEMENTATION_CERTIFICATE_065B.md"
restore_or_archive "docs/evidence/forge-client-crm-read-only-adapter-implementation-audit-065b.json"
restore_or_archive "tools/termux/forge_065b_client_crm_read_only_adapter_implementation.sh"

echo "rollback 065B complete"
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
printf "MODE=client CRM read-only adapter local fixture implementation\n"
printf "BOUNDARY=local/static read-only adapter only; no UI mutation; no backend connection; no CRM write; no calendar; no send; no auth; no provider execution; no real engine execution\n"
printf "REPORT=%s\n" "$REPORT"

say_stage "STAGE 1 CHECKPOINT"
cd "$REPO" || fail "repo not found: $REPO"
run_cmd git status --short --branch
run_cmd git log --oneline -10
run_cmd git diff --name-status
run_cmd git diff --cached --name-status

if [[ -n "$(git diff --name-only)" || -n "$(git diff --cached --name-only)" ]]; then
  hold "tracked worktree has unstaged or staged changes; refusing to write 065B over a moving target"
fi

say_stage "STAGE 2 REQUIRED FILE CHECK"
required_files=(
  "docs/architecture/source-truth/FORGE_CLIENT_CRM_READ_ONLY_ADAPTER_SCOPE_065A.md"
  "docs/evidence/FORGE_CLIENT_CRM_READ_ONLY_ADAPTER_SCOPE_065A.md"
  "docs/evidence/forge-client-crm-read-only-adapter-scope-audit-065a.json"
  "FORGE_MASTER_BUILD_TREE.md"
  "docs/architecture/source-truth/FORGE_UNIFIED_BUILD_TREE_001.md"
  "docs/roadmap/FORGE_ROADMAP_LOCK_001.md"
)

for file in "${required_files[@]}"; do
  require_file "$file"
done

say_stage "STAGE 3 BACKUP"
BACKUP_DIR=".forge-backups/065b-client-crm-read-only-adapter-implementation-$(date +%Y%m%d_%H%M%S)"
mkdir -p "$BACKUP_DIR"
backup_targets=(
  "${required_files[@]}"
  "platform/adapters/client-crm/client-crm-read-only-adapter-065b.js"
  "tests/client-crm-read-only-adapter-065b-test.js"
  "docs/architecture/source-truth/FORGE_CLIENT_CRM_READ_ONLY_ADAPTER_IMPLEMENTATION_CLOSURE_065B.md"
  "docs/evidence/FORGE_CLIENT_CRM_READ_ONLY_ADAPTER_IMPLEMENTATION_065B.md"
  "docs/evidence/FORGE_CLIENT_CRM_READ_ONLY_ADAPTER_IMPLEMENTATION_CERTIFICATE_065B.md"
  "docs/evidence/forge-client-crm-read-only-adapter-implementation-audit-065b.json"
  "tools/termux/forge_065b_client_crm_read_only_adapter_implementation.sh"
)

for file in "${backup_targets[@]}"; do
  backup_file_if_present "$file"
done
write_rollback

say_stage "STAGE 4 IMPLEMENT LOCAL READ-ONLY ADAPTER"
mkdir -p platform/adapters/client-crm tests tools/termux docs/architecture/source-truth docs/evidence
SCRIPT_SOURCE="$0"
if [[ -n "${BASH_SOURCE+x}" && -n "${BASH_SOURCE[0]:-}" ]]; then
  SCRIPT_SOURCE="${BASH_SOURCE[0]}"
fi
if [[ ! -f "$SCRIPT_SOURCE" ]]; then
  fail "runner source not found: $SCRIPT_SOURCE"
fi
cp "$SCRIPT_SOURCE" "tools/termux/forge_065b_client_crm_read_only_adapter_implementation.sh"
pass "copied runner into tools/termux"

cat > platform/adapters/client-crm/client-crm-read-only-adapter-065b.js <<'JS'
"use strict";

const ADAPTER_ID = "forge.client_crm.read_only.adapter.v1";
const ROUTES = Object.freeze({
  list: "forge.api.read.client_crm.list.v1",
  detail: "forge.api.read.client_crm.detail.v1"
});

const FIXTURE_CLIENTS = Object.freeze([
  Object.freeze({
    entityType: "client",
    entityId: "client_preview_lariza",
    displayName: "Lariza",
    status: "active_preview",
    segment: "seguimiento_en_riesgo",
    ownerId: "owner_static_preview",
    ownerName: "Alfred",
    contactReadiness: "needs_followup",
    lastInteractionAt: "2026-07-06T00:00:00-06:00",
    followupRisk: "high",
    policyRefs: Object.freeze(["policy_preview_gmm_lariza"]),
    opportunityRefs: Object.freeze(["opp_preview_lariza_review"]),
    sourceEvidence: Object.freeze(["065B local static fixture"]),
    freshness: Object.freeze({ status: "preview_static" })
  }),
  Object.freeze({
    entityType: "client",
    entityId: "client_preview_octavio",
    displayName: "Octavio",
    status: "active_preview",
    segment: "registro_preview",
    ownerId: "owner_static_preview",
    ownerName: "Alfred",
    contactReadiness: "preview_only",
    lastInteractionAt: "2026-07-06T00:00:00-06:00",
    followupRisk: "low",
    policyRefs: Object.freeze([]),
    opportunityRefs: Object.freeze(["opp_preview_octavio_open"]),
    sourceEvidence: Object.freeze(["065B local static fixture"]),
    freshness: Object.freeze({ status: "preview_static" })
  })
]);

const FORBIDDEN_EFFECTS = Object.freeze([
  "client_create",
  "client_update",
  "client_delete",
  "client_merge",
  "task_create",
  "calendar_create",
  "message_send",
  "quote_create",
  "policy_update",
  "provider_call",
  "browser_persistence",
  "action_execution"
]);

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function nowIso(context) {
  return context && context.generatedAt ? context.generatedAt : "2026-07-06T00:00:00-06:00";
}

function makeAuditEvent(routeId, generatedAt) {
  return {
    auditEventId: `audit_065b_${routeId.replace(/[^a-z0-9]+/gi, "_").toLowerCase()}`,
    eventType: "read_model_used",
    domainId: "client_crm",
    routeId,
    adapterId: ADAPTER_ID,
    realEffectsAllowed: false,
    providerRuntime: false,
    createdAt: generatedAt
  };
}

function makeReadEnvelope({ routeId, entities, generatedAt, emptyState = null, errors = [] }) {
  const auditEvent = makeAuditEvent(routeId, generatedAt);
  return {
    readModelId: `forge.client_crm.read_model.${routeId.endsWith(".detail.v1") ? "detail" : "list"}.065b`,
    schemaVersion: "forge.backend.read_model.v1",
    domainId: "client_crm",
    sourceOfTruth: "local_static_fixture_only",
    sourceEvidence: ["platform/adapters/client-crm/client-crm-read-only-adapter-065b.js"],
    generatedAt,
    freshness: { status: "preview_static" },
    capabilities: ["client.read.preview", "client.read.summary", "client.read.detail"],
    approvalContext: {
      requiresApproval: false,
      reason: "read_only_no_effect"
    },
    entities,
    relationships: [],
    metrics: {
      recordsReturned: entities.length
    },
    emptyState,
    errors,
    blockedEffects: clone(FORBIDDEN_EFFECTS),
    audit: {
      auditEventId: auditEvent.auditEventId,
      eventType: auditEvent.eventType
    },
    uiProjection: {
      title: entities.length === 1 ? entities[0].displayName : "Clientes",
      subtitle: "Client CRM read-only preview fixture"
    },
    safety: {
      crmWrite: false,
      calendarCreate: false,
      messageSend: false,
      authReal: false,
      providerRuntime: false,
      browserPersistence: false,
      realEngineExecution: false,
      realEffectsAllowed: false
    },
    auditEvent
  };
}

function listClients(options = {}) {
  const generatedAt = nowIso(options);
  return makeReadEnvelope({
    routeId: ROUTES.list,
    entities: clone(FIXTURE_CLIENTS),
    generatedAt
  });
}

function getClientDetail(clientId, options = {}) {
  const generatedAt = nowIso(options);
  const client = FIXTURE_CLIENTS.find((item) => item.entityId === clientId);

  if (!client) {
    return makeReadEnvelope({
      routeId: ROUTES.detail,
      entities: [],
      generatedAt,
      emptyState: {
        reason: "filter_no_match",
        message: "No client matched the requested preview fixture id."
      },
      errors: [
        {
          code: "CLIENT_CRM_NOT_MODELED",
          safeMessage: "Client is not modeled in the local read-only fixture.",
          recoverable: true
        }
      ]
    });
  }

  return makeReadEnvelope({
    routeId: ROUTES.detail,
    entities: [clone(client)],
    generatedAt
  });
}

function getAdapterManifest() {
  return {
    adapterId: ADAPTER_ID,
    adapterType: "local_static_fixture",
    adapterMode: "read_only",
    routeClass: "read_only",
    domainId: "client_crm",
    routes: clone(ROUTES),
    forbiddenEffects: clone(FORBIDDEN_EFFECTS),
    providerRuntime: false,
    secretAccess: false,
    realEffectsAllowed: false
  };
}

module.exports = {
  ADAPTER_ID,
  ROUTES,
  getAdapterManifest,
  listClients,
  getClientDetail
};
JS

cat > tests/client-crm-read-only-adapter-065b-test.js <<'JS'
"use strict";

const assert = require("assert");
const {
  ADAPTER_ID,
  ROUTES,
  getAdapterManifest,
  listClients,
  getClientDetail
} = require("../platform/adapters/client-crm/client-crm-read-only-adapter-065b");

function assertNoEffects(envelope) {
  assert.strictEqual(envelope.safety.crmWrite, false);
  assert.strictEqual(envelope.safety.calendarCreate, false);
  assert.strictEqual(envelope.safety.messageSend, false);
  assert.strictEqual(envelope.safety.authReal, false);
  assert.strictEqual(envelope.safety.providerRuntime, false);
  assert.strictEqual(envelope.safety.browserPersistence, false);
  assert.strictEqual(envelope.safety.realEngineExecution, false);
  assert.strictEqual(envelope.safety.realEffectsAllowed, false);
  assert.ok(envelope.blockedEffects.includes("client_update"));
  assert.ok(envelope.blockedEffects.includes("provider_call"));
}

const manifest = getAdapterManifest();
assert.strictEqual(manifest.adapterId, ADAPTER_ID);
assert.strictEqual(manifest.adapterMode, "read_only");
assert.strictEqual(manifest.routeClass, "read_only");
assert.strictEqual(manifest.providerRuntime, false);
assert.strictEqual(manifest.secretAccess, false);
assert.strictEqual(manifest.realEffectsAllowed, false);

const list = listClients();
assert.strictEqual(list.schemaVersion, "forge.backend.read_model.v1");
assert.strictEqual(list.domainId, "client_crm");
assert.strictEqual(list.sourceOfTruth, "local_static_fixture_only");
assert.strictEqual(list.freshness.status, "preview_static");
assert.strictEqual(list.auditEvent.routeId, ROUTES.list);
assert.strictEqual(list.auditEvent.eventType, "read_model_used");
assert.strictEqual(list.entities.length, 2);
assertNoEffects(list);

const detail = getClientDetail("client_preview_lariza");
assert.strictEqual(detail.entities.length, 1);
assert.strictEqual(detail.entities[0].displayName, "Lariza");
assert.strictEqual(detail.auditEvent.routeId, ROUTES.detail);
assertNoEffects(detail);

const missing = getClientDetail("missing_client");
assert.strictEqual(missing.entities.length, 0);
assert.strictEqual(missing.emptyState.reason, "filter_no_match");
assert.strictEqual(missing.errors[0].code, "CLIENT_CRM_NOT_MODELED");
assertNoEffects(missing);

console.log("PASS client CRM read-only adapter 065B");
JS

cat > docs/architecture/source-truth/FORGE_CLIENT_CRM_READ_ONLY_ADAPTER_IMPLEMENTATION_CLOSURE_065B.md <<'MD'
# Forge Client CRM Read-Only Adapter Implementation Closure 065B

DECISION=PASS_065B_CLIENT_CRM_READ_ONLY_ADAPTER_IMPLEMENTATION

NEXT=065C_CLIENT_CRM_READ_ONLY_ADAPTER_QA_LOCK

## Purpose

065B implements the first Client CRM read-only adapter as a local static fixture.

The adapter is intentionally not connected to any backend, CRM, provider, auth runtime, browser persistence, or real engine.

## Implemented

File:
`platform/adapters/client-crm/client-crm-read-only-adapter-065b.js`

Test:
`tests/client-crm-read-only-adapter-065b-test.js`

Adapter:
`forge.client_crm.read_only.adapter.v1`

Routes:

- `forge.api.read.client_crm.list.v1`
- `forge.api.read.client_crm.detail.v1`

## Safety

The adapter returns:

- backend read model envelope;
- client entity fixtures;
- empty state for missing fixture ids;
- safe error code for not-modeled clients;
- audit-shaped event;
- safety flags with all real effects disabled.

## Decision

DECISION=PASS_065B_CLIENT_CRM_READ_ONLY_ADAPTER_IMPLEMENTATION

NEXT=065C_CLIENT_CRM_READ_ONLY_ADAPTER_QA_LOCK
MD

cat > docs/evidence/FORGE_CLIENT_CRM_READ_ONLY_ADAPTER_IMPLEMENTATION_065B.md <<'MD'
# Forge Client CRM Read-Only Adapter Implementation Evidence 065B

Phase:
`065B_CLIENT_CRM_READ_ONLY_ADAPTER_IMPLEMENTATION`

Status:
PASS

Base:
`065A_CLIENT_CRM_READ_ONLY_ADAPTER_SCOPE`

## Evidence Summary

065B implements a local static read-only Client CRM adapter.

Validated:

- manifest reports `read_only`;
- list route returns two preview client fixtures;
- detail route returns Lariza fixture;
- missing detail returns `filter_no_match` and `CLIENT_CRM_NOT_MODELED`;
- output uses backend read model envelope;
- audit-shaped event is `read_model_used`;
- all safety flags remain false.

## Result

DECISION=PASS_065B_CLIENT_CRM_READ_ONLY_ADAPTER_IMPLEMENTATION

NEXT=065C_CLIENT_CRM_READ_ONLY_ADAPTER_QA_LOCK
MD

cat > docs/evidence/FORGE_CLIENT_CRM_READ_ONLY_ADAPTER_IMPLEMENTATION_CERTIFICATE_065B.md <<'MD'
# Forge Client CRM Read-Only Adapter Implementation Certificate 065B

DECISION=PASS_065B_CLIENT_CRM_READ_ONLY_ADAPTER_IMPLEMENTATION

NEXT=065C_CLIENT_CRM_READ_ONLY_ADAPTER_QA_LOCK

Certified boundary:

- local/static read-only adapter only;
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

cat > docs/evidence/forge-client-crm-read-only-adapter-implementation-audit-065b.json <<'JSON'
{
  "phase": "065B_CLIENT_CRM_READ_ONLY_ADAPTER_IMPLEMENTATION",
  "status": "PASS",
  "basePhase": "065A_CLIENT_CRM_READ_ONLY_ADAPTER_SCOPE",
  "adapterFile": "platform/adapters/client-crm/client-crm-read-only-adapter-065b.js",
  "testFile": "tests/client-crm-read-only-adapter-065b-test.js",
  "adapter": {
    "adapterId": "forge.client_crm.read_only.adapter.v1",
    "adapterType": "local_static_fixture",
    "adapterMode": "read_only",
    "routeClass": "read_only",
    "domainId": "client_crm"
  },
  "routesImplemented": [
    "forge.api.read.client_crm.list.v1",
    "forge.api.read.client_crm.detail.v1"
  ],
  "fixtures": [
    "client_preview_lariza",
    "client_preview_octavio"
  ],
  "outputs": [
    "readModelEnvelope",
    "auditEvent",
    "emptyState",
    "safeErrors",
    "safety"
  ],
  "uiMutation": false,
  "backendConnection": false,
  "crmWrite": false,
  "realEffectsEnabled": false,
  "next": "065C_CLIENT_CRM_READ_ONLY_ADAPTER_QA_LOCK"
}
JSON

pass "implemented 065B adapter, tests, docs, and audit json"

say_stage "STAGE 5 UPDATE BUILD TREE / ROADMAP"
SYNC_BODY=$(cat <<'MD'
## 065B Client CRM Read-Only Adapter Implementation

065B implements the first Client CRM adapter as a local static read-only fixture.

Files:

- `platform/adapters/client-crm/client-crm-read-only-adapter-065b.js`
- `tests/client-crm-read-only-adapter-065b-test.js`

Adapter:
`forge.client_crm.read_only.adapter.v1`

Routes:

- `forge.api.read.client_crm.list.v1`
- `forge.api.read.client_crm.detail.v1`

Safety:

- no backend connection;
- no CRM write;
- no provider runtime;
- no secret access;
- no real effects.

DECISION=PASS_065B_CLIENT_CRM_READ_ONLY_ADAPTER_IMPLEMENTATION

NEXT=065C_CLIENT_CRM_READ_ONLY_ADAPTER_QA_LOCK
MD
)

append_sync_block "FORGE_MASTER_BUILD_TREE.md" "<!-- FORGE:065B_CLIENT_CRM_READ_ONLY_ADAPTER_IMPLEMENTATION:START -->" "<!-- FORGE:065B_CLIENT_CRM_READ_ONLY_ADAPTER_IMPLEMENTATION:END -->" "$SYNC_BODY"
append_sync_block "docs/architecture/source-truth/FORGE_UNIFIED_BUILD_TREE_001.md" "<!-- FORGE:065B_CLIENT_CRM_READ_ONLY_ADAPTER_IMPLEMENTATION:START -->" "<!-- FORGE:065B_CLIENT_CRM_READ_ONLY_ADAPTER_IMPLEMENTATION:END -->" "$SYNC_BODY"
append_sync_block "docs/roadmap/FORGE_ROADMAP_LOCK_001.md" "<!-- FORGE:065B_CLIENT_CRM_READ_ONLY_ADAPTER_IMPLEMENTATION:START -->" "<!-- FORGE:065B_CLIENT_CRM_READ_ONLY_ADAPTER_IMPLEMENTATION:END -->" "$SYNC_BODY"
pass "updated build tree / roadmap sync blocks"

say_stage "STAGE 6 NORMALIZE FILES"
changed_files=(
  "platform/adapters/client-crm/client-crm-read-only-adapter-065b.js"
  "tests/client-crm-read-only-adapter-065b-test.js"
  "docs/architecture/source-truth/FORGE_CLIENT_CRM_READ_ONLY_ADAPTER_IMPLEMENTATION_CLOSURE_065B.md"
  "docs/evidence/FORGE_CLIENT_CRM_READ_ONLY_ADAPTER_IMPLEMENTATION_065B.md"
  "docs/evidence/FORGE_CLIENT_CRM_READ_ONLY_ADAPTER_IMPLEMENTATION_CERTIFICATE_065B.md"
  "docs/evidence/forge-client-crm-read-only-adapter-implementation-audit-065b.json"
  "FORGE_MASTER_BUILD_TREE.md"
  "docs/architecture/source-truth/FORGE_UNIFIED_BUILD_TREE_001.md"
  "docs/roadmap/FORGE_ROADMAP_LOCK_001.md"
  "tools/termux/forge_065b_client_crm_read_only_adapter_implementation.sh"
)

for file in "${changed_files[@]}"; do
  normalize_file "$file"
done
pass "normalized EOF and trailing whitespace"

say_stage "STAGE 7 VALIDATION"
run_cmd bash -n tools/termux/forge_065b_client_crm_read_only_adapter_implementation.sh
run_cmd node --check platform/adapters/client-crm/client-crm-read-only-adapter-065b.js
run_cmd node --check tests/client-crm-read-only-adapter-065b-test.js
run_cmd node tests/client-crm-read-only-adapter-065b-test.js
run_cmd python3 -m json.tool docs/evidence/forge-client-crm-read-only-adapter-implementation-audit-065b.json
run_cmd rg -n "DECISION=PASS_065B_CLIENT_CRM_READ_ONLY_ADAPTER_IMPLEMENTATION|NEXT=065C_CLIENT_CRM_READ_ONLY_ADAPTER_QA_LOCK|forge.client_crm.read_only.adapter.v1|CLIENT_CRM_NOT_MODELED|read_model_used" \
  platform/adapters/client-crm/client-crm-read-only-adapter-065b.js \
  tests/client-crm-read-only-adapter-065b-test.js \
  docs/architecture/source-truth/FORGE_CLIENT_CRM_READ_ONLY_ADAPTER_IMPLEMENTATION_CLOSURE_065B.md \
  docs/evidence/FORGE_CLIENT_CRM_READ_ONLY_ADAPTER_IMPLEMENTATION_065B.md \
  docs/evidence/FORGE_CLIENT_CRM_READ_ONLY_ADAPTER_IMPLEMENTATION_CERTIFICATE_065B.md \
  docs/evidence/forge-client-crm-read-only-adapter-implementation-audit-065b.json \
  FORGE_MASTER_BUILD_TREE.md \
  docs/architecture/source-truth/FORGE_UNIFIED_BUILD_TREE_001.md \
  docs/roadmap/FORGE_ROADMAP_LOCK_001.md
run_cmd git diff --check

say_stage "STAGE 8 SAFETY SCAN"
if rg -n "crmWrite: true|calendarCreate: true|messageSend: true|authReal: true|providerRuntime: true|browserPersistence: true|realEngineExecution: true|realEffectsEnabled\": true|backendConnection\": true|\"crmWrite\": true|\"realEffectsAllowed\": true|\"secretAccess\": true|\"providerRuntime\": true" \
  platform/adapters/client-crm/client-crm-read-only-adapter-065b.js \
  tests/client-crm-read-only-adapter-065b-test.js \
  docs/architecture/source-truth/FORGE_CLIENT_CRM_READ_ONLY_ADAPTER_IMPLEMENTATION_CLOSURE_065B.md \
  docs/evidence/FORGE_CLIENT_CRM_READ_ONLY_ADAPTER_IMPLEMENTATION_065B.md \
  docs/evidence/FORGE_CLIENT_CRM_READ_ONLY_ADAPTER_IMPLEMENTATION_CERTIFICATE_065B.md \
  docs/evidence/forge-client-crm-read-only-adapter-implementation-audit-065b.json \
  FORGE_MASTER_BUILD_TREE.md \
  docs/architecture/source-truth/FORGE_UNIFIED_BUILD_TREE_001.md \
  docs/roadmap/FORGE_ROADMAP_LOCK_001.md; then
  fail "safety scan found forbidden enabled-effect marker"
fi
pass "safety scan clean"

say_stage "STAGE 9 STAGE AUTHORIZED FILES"
git add \
  FORGE_MASTER_BUILD_TREE.md \
  docs/architecture/source-truth/FORGE_CLIENT_CRM_READ_ONLY_ADAPTER_IMPLEMENTATION_CLOSURE_065B.md \
  docs/architecture/source-truth/FORGE_UNIFIED_BUILD_TREE_001.md \
  docs/evidence/FORGE_CLIENT_CRM_READ_ONLY_ADAPTER_IMPLEMENTATION_065B.md \
  docs/evidence/FORGE_CLIENT_CRM_READ_ONLY_ADAPTER_IMPLEMENTATION_CERTIFICATE_065B.md \
  docs/evidence/forge-client-crm-read-only-adapter-implementation-audit-065b.json \
  docs/roadmap/FORGE_ROADMAP_LOCK_001.md \
  platform/adapters/client-crm/client-crm-read-only-adapter-065b.js \
  tests/client-crm-read-only-adapter-065b-test.js \
  tools/termux/forge_065b_client_crm_read_only_adapter_implementation.sh

run_cmd git diff --cached --name-only
expected="$(mktemp)"
actual="$(mktemp)"
cat > "$expected" <<'EOF'
FORGE_MASTER_BUILD_TREE.md
docs/architecture/source-truth/FORGE_CLIENT_CRM_READ_ONLY_ADAPTER_IMPLEMENTATION_CLOSURE_065B.md
docs/architecture/source-truth/FORGE_UNIFIED_BUILD_TREE_001.md
docs/evidence/FORGE_CLIENT_CRM_READ_ONLY_ADAPTER_IMPLEMENTATION_065B.md
docs/evidence/FORGE_CLIENT_CRM_READ_ONLY_ADAPTER_IMPLEMENTATION_CERTIFICATE_065B.md
docs/evidence/forge-client-crm-read-only-adapter-implementation-audit-065b.json
docs/roadmap/FORGE_ROADMAP_LOCK_001.md
platform/adapters/client-crm/client-crm-read-only-adapter-065b.js
tests/client-crm-read-only-adapter-065b-test.js
tools/termux/forge_065b_client_crm_read_only_adapter_implementation.sh
EOF
git diff --cached --name-only > "$actual"
if diff -u "$expected" "$actual"; then
  pass "only authorized files staged"
else
  fail "unexpected staged files"
fi
run_cmd git diff --cached --check

say_stage "STAGE 10 COMMIT PUSH"
run_cmd git commit -m "feat: add client CRM read-only adapter"
run_cmd git push origin HEAD:main

say_stage "STAGE 11 FINAL CHECKPOINT"
run_cmd git status --short --branch
run_cmd git log --oneline -10

say_stage "FINAL DECISION"
printf "PASS_065B_CLIENT_CRM_READ_ONLY_ADAPTER_IMPLEMENTATION_COMMIT_PUSH_COMPLETE\n"
printf "NEXT=065C_CLIENT_CRM_READ_ONLY_ADAPTER_QA_LOCK\n"
printf "BACKUP=%s\n" "$BACKUP_DIR"
printf "ROLLBACK=%s\n" "$BACKUP_DIR/rollback-065b.sh"
printf "Reporte: %s\n" "$REPORT"
autocopy_report
