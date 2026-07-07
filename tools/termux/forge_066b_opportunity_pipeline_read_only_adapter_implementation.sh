#!/usr/bin/env bash
set -euo pipefail

PHASE="066B_OPPORTUNITY_PIPELINE_READ_ONLY_ADAPTER_IMPLEMENTATION"
REPO="/storage/emulated/0/Forge OS"
REPORT="/data/data/com.termux/files/home/${PHASE}_RESULT_$(date +%Y%m%d_%H%M%S).md"
mkdir -p "$(dirname "$REPORT")"
exec > >(tee "$REPORT") 2>&1

CYAN="\033[1;36m"
GREEN="\033[1;38;5;46m"
YELLOW="\033[1;93m"
RED="\033[1;91m"
RESET="\033[0m"

stage(){ printf "\n${CYAN}========== %s ==========${RESET}\n" "$1"; }
pass(){ printf "${GREEN}PASS:${RESET} %s\n" "$1"; }
fail(){ printf "${RED}FAIL:${RESET} %s\n" "$1"; autocopy; exit 1; }

autocopy(){
  if command -v termux-clipboard-set >/dev/null 2>&1; then
    termux-clipboard-set < "$REPORT" || true
  fi
}

run(){ printf "\n========== RUN ==========\n%s " "$@"; printf "\n"; "$@"; }
require_file(){ [[ -f "$1" ]] && pass "$1" || fail "missing required file: $1"; }

backup_if_present(){
  local file="$1"
  if [[ -e "$file" ]]; then
    mkdir -p "$BACKUP_DIR/$(dirname "$file")"
    cp -R "$file" "$BACKUP_DIR/$file"
    pass "backup $file"
  else
    pass "new file slot clear: $file"
  fi
}

norm(){
  python3 - "$1" <<'PY'
from pathlib import Path
import sys
p = Path(sys.argv[1])
p.write_text("\n".join(line.rstrip() for line in p.read_text().splitlines()) + "\n")
PY
}

append_block(){
  local file="$1" start="$2" end="$3" body="$4"
  python3 - "$file" "$start" "$end" "$body" <<'PY'
from pathlib import Path
import sys
p = Path(sys.argv[1])
start, end, body = sys.argv[2], sys.argv[3], sys.argv[4]
text = p.read_text()
block = f"{start}\n{body.rstrip()}\n{end}\n"
if start in text and end in text:
    before, rest = text.split(start, 1)
    _, after = rest.split(end, 1)
    text = before.rstrip() + "\n\n" + block + after.lstrip("\n")
else:
    text = text.rstrip() + "\n\n" + block
p.write_text(text)
PY
}

write_rollback(){
  local rollback="$BACKUP_DIR/rollback-066b.sh"
  cat > "$rollback" <<ROLLBACK
#!/usr/bin/env bash
set -euo pipefail
REPO="/storage/emulated/0/Forge OS"
BACKUP_DIR="$BACKUP_DIR"
cd "\$REPO"

restore_or_archive(){
  local file="\$1"
  local backup="\$BACKUP_DIR/\$file"
  if [[ -e "\$backup" ]]; then
    mkdir -p "\$(dirname "\$file")"
    rm -rf "\$file"
    cp -R "\$backup" "\$file"
    echo "restored \$file"
  elif [[ -e "\$file" ]]; then
    mkdir -p ".forge-backups/rollback-archives"
    local archive=".forge-backups/rollback-archives/\$(basename "\$file").066b.\$(date +%Y%m%d_%H%M%S)"
    mv "\$file" "\$archive"
    echo "archived created file \$file -> \$archive"
  fi
}

restore_or_archive "FORGE_MASTER_BUILD_TREE.md"
restore_or_archive "docs/architecture/source-truth/FORGE_UNIFIED_BUILD_TREE_001.md"
restore_or_archive "docs/roadmap/FORGE_ROADMAP_LOCK_001.md"
restore_or_archive "platform/adapters/opportunity-pipeline/opportunity-pipeline-read-only-adapter-066b.js"
restore_or_archive "tests/opportunity-pipeline-read-only-adapter-066b-test.js"
restore_or_archive "docs/architecture/source-truth/FORGE_OPPORTUNITY_PIPELINE_READ_ONLY_ADAPTER_IMPLEMENTATION_CLOSURE_066B.md"
restore_or_archive "docs/evidence/FORGE_OPPORTUNITY_PIPELINE_READ_ONLY_ADAPTER_IMPLEMENTATION_066B.md"
restore_or_archive "docs/evidence/FORGE_OPPORTUNITY_PIPELINE_READ_ONLY_ADAPTER_IMPLEMENTATION_CERTIFICATE_066B.md"
restore_or_archive "docs/evidence/forge-opportunity-pipeline-read-only-adapter-implementation-audit-066b.json"
restore_or_archive "tools/termux/forge_066b_opportunity_pipeline_read_only_adapter_implementation.sh"
echo "rollback 066B complete"
ROLLBACK
  chmod +x "$rollback"
  pass "rollback script created: $rollback"
}

stage "STAGE 0 HEADER"
printf "PHASE=%s\n" "$PHASE"
printf "MODE=opportunity pipeline read-only adapter local fixture implementation\n"
printf "BOUNDARY=local/static read-only adapter only; no UI mutation; no backend connection; no CRM write; no pipeline write; no calendar; no send; no auth; no provider execution; no real engine execution\n"
printf "REPORT=%s\n" "$REPORT"

stage "STAGE 1 CHECKPOINT"
cd "$REPO" || fail "repo not found: $REPO"
run git status --short --branch
run git log --oneline -10
run git diff --name-status
run git diff --cached --name-status
[[ -z "$(git diff --name-only)" && -z "$(git diff --cached --name-only)" ]] || fail "tracked worktree dirty; refusing to write 066B"

stage "STAGE 2 REQUIRED FILE CHECK"
required_files=(
  "docs/architecture/source-truth/FORGE_OPPORTUNITY_PIPELINE_READ_ONLY_ADAPTER_SCOPE_066A.md"
  "docs/evidence/FORGE_OPPORTUNITY_PIPELINE_READ_ONLY_ADAPTER_SCOPE_066A.md"
  "docs/evidence/forge-opportunity-pipeline-read-only-adapter-scope-audit-066a.json"
  "FORGE_MASTER_BUILD_TREE.md"
  "docs/architecture/source-truth/FORGE_UNIFIED_BUILD_TREE_001.md"
  "docs/roadmap/FORGE_ROADMAP_LOCK_001.md"
)
for file in "${required_files[@]}"; do require_file "$file"; done

stage "STAGE 3 BACKUP"
BACKUP_DIR=".forge-backups/066b-opportunity-pipeline-read-only-adapter-implementation-$(date +%Y%m%d_%H%M%S)"
mkdir -p "$BACKUP_DIR"
backup_targets=(
  "${required_files[@]}"
  "platform/adapters/opportunity-pipeline/opportunity-pipeline-read-only-adapter-066b.js"
  "tests/opportunity-pipeline-read-only-adapter-066b-test.js"
  "docs/architecture/source-truth/FORGE_OPPORTUNITY_PIPELINE_READ_ONLY_ADAPTER_IMPLEMENTATION_CLOSURE_066B.md"
  "docs/evidence/FORGE_OPPORTUNITY_PIPELINE_READ_ONLY_ADAPTER_IMPLEMENTATION_066B.md"
  "docs/evidence/FORGE_OPPORTUNITY_PIPELINE_READ_ONLY_ADAPTER_IMPLEMENTATION_CERTIFICATE_066B.md"
  "docs/evidence/forge-opportunity-pipeline-read-only-adapter-implementation-audit-066b.json"
  "tools/termux/forge_066b_opportunity_pipeline_read_only_adapter_implementation.sh"
)
for file in "${backup_targets[@]}"; do backup_if_present "$file"; done
write_rollback

stage "STAGE 4 VERIFY 066A SCOPE"
python3 - <<'PY'
import json
from pathlib import Path
a = json.loads(Path("docs/evidence/forge-opportunity-pipeline-read-only-adapter-scope-audit-066a.json").read_text())
assert a["status"] == "PASS"
assert a["adapter"]["adapterId"] == "forge.opportunity_pipeline.read_only.adapter.v1"
assert a["adapter"]["adapterMode"] == "read_only"
assert a["adapter"]["routeClass"] == "read_only"
assert a["backendConnection"] is False
assert a["pipelineWrite"] is False
assert a["realEffectsEnabled"] is False
assert a["next"] == "066B_OPPORTUNITY_PIPELINE_READ_ONLY_ADAPTER_IMPLEMENTATION"
print("PASS 066A scope verified")
PY

stage "STAGE 5 IMPLEMENT LOCAL READ-ONLY ADAPTER"
mkdir -p platform/adapters/opportunity-pipeline tests docs/architecture/source-truth docs/evidence tools/termux
cp "$0" "tools/termux/forge_066b_opportunity_pipeline_read_only_adapter_implementation.sh"
pass "copied runner into tools/termux"

cat > platform/adapters/opportunity-pipeline/opportunity-pipeline-read-only-adapter-066b.js <<'JS'
"use strict";

const ADAPTER_ID = "forge.opportunity_pipeline.read_only.adapter.v1";
const ROUTES = Object.freeze({
  list: "forge.api.read.opportunity_pipeline.list.v1",
  detail: "forge.api.read.opportunity_pipeline.detail.v1"
});

const FIXTURE_OPPORTUNITIES = Object.freeze([
  Object.freeze({
    entityType: "opportunity",
    entityId: "opp_preview_lariza_review",
    displayName: "Lariza - revision GMM",
    clientRef: Object.freeze({ entityType: "client", entityId: "client_preview_lariza", displayName: "Lariza" }),
    stage: "followup_review",
    status: "open_preview",
    priority: "high",
    expectedValuePreview: { currency: "MXN", amount: 0, mode: "preview_placeholder" },
    probability: "medium",
    nextAction: "review_pending_quote_context",
    followupDueState: "due_now",
    riskFlags: Object.freeze(["followup_cooling", "quote_context_needed"]),
    policySummaryRefs: Object.freeze(["policy_preview_gmm_lariza"]),
    quoteSummaryRefs: Object.freeze(["quote_preview_lariza_pending"]),
    sourceEvidence: Object.freeze(["066B local static fixture"]),
    freshness: Object.freeze({ status: "preview_static" })
  }),
  Object.freeze({
    entityType: "opportunity",
    entityId: "opp_preview_octavio_open",
    displayName: "Octavio - apertura de oportunidad",
    clientRef: Object.freeze({ entityType: "client", entityId: "client_preview_octavio", displayName: "Octavio" }),
    stage: "initial_contact",
    status: "open_preview",
    priority: "normal",
    expectedValuePreview: { currency: "MXN", amount: 0, mode: "preview_placeholder" },
    probability: "early",
    nextAction: "confirm_need_and_timing",
    followupDueState: "scheduled_preview",
    riskFlags: Object.freeze([]),
    policySummaryRefs: Object.freeze([]),
    quoteSummaryRefs: Object.freeze([]),
    sourceEvidence: Object.freeze(["066B local static fixture"]),
    freshness: Object.freeze({ status: "preview_static" })
  })
]);

const FORBIDDEN_EFFECTS = Object.freeze([
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
]);

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function nowIso(context) {
  return context && context.generatedAt ? context.generatedAt : "2026-07-06T00:00:00-06:00";
}

function makeAuditEvent(routeId, generatedAt) {
  return {
    auditEventId: `audit_066b_${routeId.replace(/[^a-z0-9]+/gi, "_").toLowerCase()}`,
    eventType: "read_model_used",
    domainId: "opportunity_pipeline",
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
    readModelId: `forge.opportunity_pipeline.read_model.${routeId.endsWith(".detail.v1") ? "detail" : "list"}.066b`,
    schemaVersion: "forge.backend.read_model.v1",
    domainId: "opportunity_pipeline",
    sourceOfTruth: "local_static_fixture_only",
    sourceEvidence: ["platform/adapters/opportunity-pipeline/opportunity-pipeline-read-only-adapter-066b.js"],
    generatedAt,
    freshness: { status: "preview_static" },
    capabilities: ["opportunity.read.preview", "opportunity.read.summary", "opportunity.read.detail"],
    approvalContext: { requiresApproval: false, reason: "read_only_no_effect" },
    entities,
    relationships: entities.map((entity) => ({
      relationshipType: "opportunity_client",
      fromEntityId: entity.entityId,
      toEntityId: entity.clientRef.entityId
    })),
    metrics: {
      recordsReturned: entities.length,
      highPriorityCount: entities.filter((entity) => entity.priority === "high").length
    },
    emptyState,
    errors,
    blockedEffects: clone(FORBIDDEN_EFFECTS),
    audit: { auditEventId: auditEvent.auditEventId, eventType: auditEvent.eventType },
    uiProjection: {
      title: entities.length === 1 ? entities[0].displayName : "Opportunity Pipeline",
      subtitle: "Opportunity Pipeline read-only preview fixture"
    },
    safety: {
      crmWrite: false,
      pipelineWrite: false,
      taskCreate: false,
      calendarCreate: false,
      messageSend: false,
      authReal: false,
      providerRuntime: false,
      secretAccess: false,
      browserPersistence: false,
      realEngineExecution: false,
      realEffectsAllowed: false
    },
    auditEvent
  };
}

function listOpportunities(options = {}) {
  return makeReadEnvelope({
    routeId: ROUTES.list,
    entities: clone(FIXTURE_OPPORTUNITIES),
    generatedAt: nowIso(options)
  });
}

function getOpportunityDetail(opportunityId, options = {}) {
  const generatedAt = nowIso(options);
  const opportunity = FIXTURE_OPPORTUNITIES.find((item) => item.entityId === opportunityId);
  if (!opportunity) {
    return makeReadEnvelope({
      routeId: ROUTES.detail,
      entities: [],
      generatedAt,
      emptyState: { reason: "filter_no_match", message: "No opportunity matched the requested preview fixture id." },
      errors: [{ code: "OPPORTUNITY_PIPELINE_NOT_MODELED", safeMessage: "Opportunity is not modeled in the local read-only fixture.", recoverable: true }]
    });
  }
  return makeReadEnvelope({ routeId: ROUTES.detail, entities: [clone(opportunity)], generatedAt });
}

function getAdapterManifest() {
  return {
    adapterId: ADAPTER_ID,
    adapterType: "local_static_fixture",
    adapterMode: "read_only",
    routeClass: "read_only",
    domainId: "opportunity_pipeline",
    routes: clone(ROUTES),
    forbiddenEffects: clone(FORBIDDEN_EFFECTS),
    providerRuntime: false,
    secretAccess: false,
    realEffectsAllowed: false
  };
}

module.exports = { ADAPTER_ID, ROUTES, getAdapterManifest, listOpportunities, getOpportunityDetail };
JS

cat > tests/opportunity-pipeline-read-only-adapter-066b-test.js <<'JS'
"use strict";

const assert = require("assert");
const {
  ADAPTER_ID,
  ROUTES,
  getAdapterManifest,
  listOpportunities,
  getOpportunityDetail
} = require("../platform/adapters/opportunity-pipeline/opportunity-pipeline-read-only-adapter-066b");

function assertNoEffects(envelope) {
  assert.strictEqual(envelope.safety.crmWrite, false);
  assert.strictEqual(envelope.safety.pipelineWrite, false);
  assert.strictEqual(envelope.safety.taskCreate, false);
  assert.strictEqual(envelope.safety.calendarCreate, false);
  assert.strictEqual(envelope.safety.messageSend, false);
  assert.strictEqual(envelope.safety.authReal, false);
  assert.strictEqual(envelope.safety.providerRuntime, false);
  assert.strictEqual(envelope.safety.secretAccess, false);
  assert.strictEqual(envelope.safety.browserPersistence, false);
  assert.strictEqual(envelope.safety.realEngineExecution, false);
  assert.strictEqual(envelope.safety.realEffectsAllowed, false);
  assert.ok(envelope.blockedEffects.includes("opportunity_stage_mutation"));
  assert.ok(envelope.blockedEffects.includes("provider_call"));
}

const manifest = getAdapterManifest();
assert.strictEqual(manifest.adapterId, ADAPTER_ID);
assert.strictEqual(manifest.adapterMode, "read_only");
assert.strictEqual(manifest.routeClass, "read_only");
assert.strictEqual(manifest.domainId, "opportunity_pipeline");
assert.strictEqual(manifest.providerRuntime, false);
assert.strictEqual(manifest.secretAccess, false);
assert.strictEqual(manifest.realEffectsAllowed, false);

const list = listOpportunities();
assert.strictEqual(list.schemaVersion, "forge.backend.read_model.v1");
assert.strictEqual(list.domainId, "opportunity_pipeline");
assert.strictEqual(list.sourceOfTruth, "local_static_fixture_only");
assert.strictEqual(list.freshness.status, "preview_static");
assert.strictEqual(list.auditEvent.routeId, ROUTES.list);
assert.strictEqual(list.auditEvent.eventType, "read_model_used");
assert.strictEqual(list.entities.length, 2);
assert.strictEqual(list.metrics.highPriorityCount, 1);
assertNoEffects(list);

const detail = getOpportunityDetail("opp_preview_lariza_review");
assert.strictEqual(detail.entities.length, 1);
assert.strictEqual(detail.entities[0].clientRef.entityId, "client_preview_lariza");
assert.strictEqual(detail.entities[0].priority, "high");
assert.strictEqual(detail.auditEvent.routeId, ROUTES.detail);
assertNoEffects(detail);

const missing = getOpportunityDetail("missing_opportunity");
assert.strictEqual(missing.entities.length, 0);
assert.strictEqual(missing.emptyState.reason, "filter_no_match");
assert.strictEqual(missing.errors[0].code, "OPPORTUNITY_PIPELINE_NOT_MODELED");
assertNoEffects(missing);

console.log("PASS opportunity pipeline read-only adapter 066B");
JS

cat > docs/architecture/source-truth/FORGE_OPPORTUNITY_PIPELINE_READ_ONLY_ADAPTER_IMPLEMENTATION_CLOSURE_066B.md <<'MD'
# Forge Opportunity Pipeline Read-Only Adapter Implementation Closure 066B

DECISION=PASS_066B_OPPORTUNITY_PIPELINE_READ_ONLY_ADAPTER_IMPLEMENTATION

NEXT=066C_OPPORTUNITY_PIPELINE_READ_ONLY_ADAPTER_QA_LOCK

## Purpose

066B implements the Opportunity Pipeline read-only adapter as a local static fixture.

The adapter is not connected to any backend, CRM, pipeline storage, provider, auth runtime, browser persistence, or real engine.

## Implemented

File:
`platform/adapters/opportunity-pipeline/opportunity-pipeline-read-only-adapter-066b.js`

Test:
`tests/opportunity-pipeline-read-only-adapter-066b-test.js`

Adapter:
`forge.opportunity_pipeline.read_only.adapter.v1`

Routes:

- `forge.api.read.opportunity_pipeline.list.v1`
- `forge.api.read.opportunity_pipeline.detail.v1`

## Safety

The adapter returns:

- backend read model envelope;
- opportunity entity fixtures;
- client reference relationships;
- empty state for missing fixture ids;
- safe error code `OPPORTUNITY_PIPELINE_NOT_MODELED`;
- audit-shaped event `read_model_used`;
- safety flags with all real effects disabled.

## Decision

DECISION=PASS_066B_OPPORTUNITY_PIPELINE_READ_ONLY_ADAPTER_IMPLEMENTATION

NEXT=066C_OPPORTUNITY_PIPELINE_READ_ONLY_ADAPTER_QA_LOCK
MD

cat > docs/evidence/FORGE_OPPORTUNITY_PIPELINE_READ_ONLY_ADAPTER_IMPLEMENTATION_066B.md <<'MD'
# Forge Opportunity Pipeline Read-Only Adapter Implementation Evidence 066B

Phase:
`066B_OPPORTUNITY_PIPELINE_READ_ONLY_ADAPTER_IMPLEMENTATION`

Status:
PASS

Base:
`066A_OPPORTUNITY_PIPELINE_READ_ONLY_ADAPTER_SCOPE`

## Evidence Summary

066B implements a local static read-only Opportunity Pipeline adapter.

Validated:

- manifest reports `read_only`;
- list route returns two preview opportunity fixtures;
- detail route returns Lariza review opportunity fixture;
- missing detail returns `filter_no_match` and `OPPORTUNITY_PIPELINE_NOT_MODELED`;
- output uses backend read model envelope;
- audit-shaped event is `read_model_used`;
- all safety flags remain false.

## Result

DECISION=PASS_066B_OPPORTUNITY_PIPELINE_READ_ONLY_ADAPTER_IMPLEMENTATION

NEXT=066C_OPPORTUNITY_PIPELINE_READ_ONLY_ADAPTER_QA_LOCK
MD

cat > docs/evidence/FORGE_OPPORTUNITY_PIPELINE_READ_ONLY_ADAPTER_IMPLEMENTATION_CERTIFICATE_066B.md <<'MD'
# Forge Opportunity Pipeline Read-Only Adapter Implementation Certificate 066B

DECISION=PASS_066B_OPPORTUNITY_PIPELINE_READ_ONLY_ADAPTER_IMPLEMENTATION

NEXT=066C_OPPORTUNITY_PIPELINE_READ_ONLY_ADAPTER_QA_LOCK

Certified boundary:

- local/static read-only adapter only;
- no UI mutation;
- no backend connection;
- no CRM write;
- no pipeline write;
- no task creation;
- no calendar creation;
- no communication delivery;
- no auth implementation;
- no provider execution;
- no browser persistence;
- no real engine execution.
MD

cat > docs/evidence/forge-opportunity-pipeline-read-only-adapter-implementation-audit-066b.json <<'JSON'
{
  "phase": "066B_OPPORTUNITY_PIPELINE_READ_ONLY_ADAPTER_IMPLEMENTATION",
  "status": "PASS",
  "basePhase": "066A_OPPORTUNITY_PIPELINE_READ_ONLY_ADAPTER_SCOPE",
  "adapterFile": "platform/adapters/opportunity-pipeline/opportunity-pipeline-read-only-adapter-066b.js",
  "testFile": "tests/opportunity-pipeline-read-only-adapter-066b-test.js",
  "adapter": {
    "adapterId": "forge.opportunity_pipeline.read_only.adapter.v1",
    "adapterType": "local_static_fixture",
    "adapterMode": "read_only",
    "routeClass": "read_only",
    "domainId": "opportunity_pipeline"
  },
  "routesImplemented": [
    "forge.api.read.opportunity_pipeline.list.v1",
    "forge.api.read.opportunity_pipeline.detail.v1"
  ],
  "fixtures": [
    "opp_preview_lariza_review",
    "opp_preview_octavio_open"
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
  "pipelineWrite": false,
  "realEffectsEnabled": false,
  "next": "066C_OPPORTUNITY_PIPELINE_READ_ONLY_ADAPTER_QA_LOCK"
}
JSON
pass "implemented 066B adapter, tests, docs, and audit json"

stage "STAGE 6 UPDATE BUILD TREE / ROADMAP"
SYNC_BODY=$(cat <<'MD'
## 066B Opportunity Pipeline Read-Only Adapter Implementation

066B implements the Opportunity Pipeline adapter as a local static read-only fixture.

Files:

- `platform/adapters/opportunity-pipeline/opportunity-pipeline-read-only-adapter-066b.js`
- `tests/opportunity-pipeline-read-only-adapter-066b-test.js`

Adapter:
`forge.opportunity_pipeline.read_only.adapter.v1`

Routes:

- `forge.api.read.opportunity_pipeline.list.v1`
- `forge.api.read.opportunity_pipeline.detail.v1`

Safety:

- no backend connection;
- no CRM write;
- no pipeline write;
- no task creation;
- no calendar creation;
- no provider runtime;
- no secret access;
- no real effects.

DECISION=PASS_066B_OPPORTUNITY_PIPELINE_READ_ONLY_ADAPTER_IMPLEMENTATION

NEXT=066C_OPPORTUNITY_PIPELINE_READ_ONLY_ADAPTER_QA_LOCK
MD
)
append_block "FORGE_MASTER_BUILD_TREE.md" "<!-- FORGE:066B_OPPORTUNITY_PIPELINE_READ_ONLY_ADAPTER_IMPLEMENTATION:START -->" "<!-- FORGE:066B_OPPORTUNITY_PIPELINE_READ_ONLY_ADAPTER_IMPLEMENTATION:END -->" "$SYNC_BODY"
append_block "docs/architecture/source-truth/FORGE_UNIFIED_BUILD_TREE_001.md" "<!-- FORGE:066B_OPPORTUNITY_PIPELINE_READ_ONLY_ADAPTER_IMPLEMENTATION:START -->" "<!-- FORGE:066B_OPPORTUNITY_PIPELINE_READ_ONLY_ADAPTER_IMPLEMENTATION:END -->" "$SYNC_BODY"
append_block "docs/roadmap/FORGE_ROADMAP_LOCK_001.md" "<!-- FORGE:066B_OPPORTUNITY_PIPELINE_READ_ONLY_ADAPTER_IMPLEMENTATION:START -->" "<!-- FORGE:066B_OPPORTUNITY_PIPELINE_READ_ONLY_ADAPTER_IMPLEMENTATION:END -->" "$SYNC_BODY"
pass "updated build tree / roadmap sync blocks"

stage "STAGE 7 NORMALIZE FILES"
changed_files=(
  "FORGE_MASTER_BUILD_TREE.md"
  "docs/architecture/source-truth/FORGE_UNIFIED_BUILD_TREE_001.md"
  "docs/roadmap/FORGE_ROADMAP_LOCK_001.md"
  "platform/adapters/opportunity-pipeline/opportunity-pipeline-read-only-adapter-066b.js"
  "tests/opportunity-pipeline-read-only-adapter-066b-test.js"
  "docs/architecture/source-truth/FORGE_OPPORTUNITY_PIPELINE_READ_ONLY_ADAPTER_IMPLEMENTATION_CLOSURE_066B.md"
  "docs/evidence/FORGE_OPPORTUNITY_PIPELINE_READ_ONLY_ADAPTER_IMPLEMENTATION_066B.md"
  "docs/evidence/FORGE_OPPORTUNITY_PIPELINE_READ_ONLY_ADAPTER_IMPLEMENTATION_CERTIFICATE_066B.md"
  "docs/evidence/forge-opportunity-pipeline-read-only-adapter-implementation-audit-066b.json"
  "tools/termux/forge_066b_opportunity_pipeline_read_only_adapter_implementation.sh"
)
for file in "${changed_files[@]}"; do norm "$file"; done
pass "normalized EOF and trailing whitespace"

stage "STAGE 8 VALIDATION"
run bash -n tools/termux/forge_066b_opportunity_pipeline_read_only_adapter_implementation.sh
run node --check platform/adapters/opportunity-pipeline/opportunity-pipeline-read-only-adapter-066b.js
run node --check tests/opportunity-pipeline-read-only-adapter-066b-test.js
run node tests/opportunity-pipeline-read-only-adapter-066b-test.js
run python3 -m json.tool docs/evidence/forge-opportunity-pipeline-read-only-adapter-implementation-audit-066b.json
run rg -n "DECISION=PASS_066B_OPPORTUNITY_PIPELINE_READ_ONLY_ADAPTER_IMPLEMENTATION|NEXT=066C_OPPORTUNITY_PIPELINE_READ_ONLY_ADAPTER_QA_LOCK|forge.opportunity_pipeline.read_only.adapter.v1|OPPORTUNITY_PIPELINE_NOT_MODELED|read_model_used" \
  platform/adapters/opportunity-pipeline/opportunity-pipeline-read-only-adapter-066b.js \
  tests/opportunity-pipeline-read-only-adapter-066b-test.js \
  docs/architecture/source-truth/FORGE_OPPORTUNITY_PIPELINE_READ_ONLY_ADAPTER_IMPLEMENTATION_CLOSURE_066B.md \
  docs/evidence/FORGE_OPPORTUNITY_PIPELINE_READ_ONLY_ADAPTER_IMPLEMENTATION_066B.md \
  docs/evidence/FORGE_OPPORTUNITY_PIPELINE_READ_ONLY_ADAPTER_IMPLEMENTATION_CERTIFICATE_066B.md \
  docs/evidence/forge-opportunity-pipeline-read-only-adapter-implementation-audit-066b.json \
  FORGE_MASTER_BUILD_TREE.md \
  docs/architecture/source-truth/FORGE_UNIFIED_BUILD_TREE_001.md \
  docs/roadmap/FORGE_ROADMAP_LOCK_001.md
run git diff --check

stage "STAGE 9 SAFETY SCAN"
scan_files=(
  "platform/adapters/opportunity-pipeline/opportunity-pipeline-read-only-adapter-066b.js"
  "tests/opportunity-pipeline-read-only-adapter-066b-test.js"
  "docs/architecture/source-truth/FORGE_OPPORTUNITY_PIPELINE_READ_ONLY_ADAPTER_IMPLEMENTATION_CLOSURE_066B.md"
  "docs/evidence/FORGE_OPPORTUNITY_PIPELINE_READ_ONLY_ADAPTER_IMPLEMENTATION_066B.md"
  "docs/evidence/FORGE_OPPORTUNITY_PIPELINE_READ_ONLY_ADAPTER_IMPLEMENTATION_CERTIFICATE_066B.md"
  "docs/evidence/forge-opportunity-pipeline-read-only-adapter-implementation-audit-066b.json"
  "FORGE_MASTER_BUILD_TREE.md"
  "docs/architecture/source-truth/FORGE_UNIFIED_BUILD_TREE_001.md"
  "docs/roadmap/FORGE_ROADMAP_LOCK_001.md"
)
if rg -n "crmWrite: true|pipelineWrite: true|taskCreate: true|calendarCreate: true|messageSend: true|authReal: true|providerRuntime: true|secretAccess: true|browserPersistence: true|realEngineExecution: true|realEffectsAllowed: true|realEffectsEnabled\\\": true|backendConnection\\\": true|\\\"pipelineWrite\\\": true|\\\"providerRuntime\\\": true|\\\"secretAccess\\\": true|\\\"realEffectsAllowed\\\": true" "${scan_files[@]}"; then
  fail "safety scan found an enabled real-effect marker"
fi
pass "safety scan clean"

stage "STAGE 10 STAGE AUTHORIZED FILES"
git add "${changed_files[@]}"
run git diff --cached --name-only
expected=$(mktemp)
actual=$(mktemp)
printf "%s\n" "${changed_files[@]}" | sort > "$expected"
git diff --cached --name-only | sort > "$actual"
if ! diff -u "$expected" "$actual"; then
  fail "staged file set differs from authorized files"
fi
rm -f "$expected" "$actual"
pass "only authorized files staged"
run git diff --cached --check

stage "STAGE 11 COMMIT PUSH"
git diff --cached --quiet && fail "nothing staged for commit"
run git commit -m "feat: add opportunity pipeline read-only adapter"
run git push origin HEAD:main

stage "STAGE 12 FINAL CHECKPOINT"
run git status --short --branch
run git log --oneline -10

stage "FINAL DECISION"
printf "PASS_066B_OPPORTUNITY_PIPELINE_READ_ONLY_ADAPTER_IMPLEMENTATION_COMMIT_PUSH_COMPLETE\n"
printf "NEXT=066C_OPPORTUNITY_PIPELINE_READ_ONLY_ADAPTER_QA_LOCK\n"
printf "BACKUP=%s\n" "$BACKUP_DIR"
printf "ROLLBACK=%s\n" "$BACKUP_DIR/rollback-066b.sh"
printf "Reporte: %s\n" "$REPORT"
autocopy
