#!/usr/bin/env bash
set -euo pipefail

PHASE="068C_POLICY_READ_MODEL_QA_LOCK"
REPO="/storage/emulated/0/Forge OS"
REPORT="/data/data/com.termux/files/home/${PHASE}_RESULT_$(date +%Y%m%d_%H%M%S).md"

mkdir -p "$(dirname "$REPORT")"
exec > >(tee "$REPORT") 2>&1

CYAN="\033[1;36m"; GREEN="\033[1;38;5;46m"; YELLOW="\033[1;93m"; RED="\033[1;91m"; RESET="\033[0m"
stage(){ printf "\n${CYAN}========== %s ==========${RESET}\n" "$1"; }
pass(){ printf "${GREEN}PASS:${RESET} %s\n" "$1"; }
warn(){ printf "${YELLOW}WARN:${RESET} %s\n" "$1"; }
copy_report(){ sync || true; command -v termux-clipboard-set >/dev/null 2>&1 && termux-clipboard-set < "$REPORT" || true; }
hold(){ printf "${YELLOW}HOLD:${RESET} %s\n" "$1"; echo "DECISION=HOLD_${PHASE}"; echo "Reporte: $REPORT"; copy_report; exit 1; }
run(){ echo; echo "========== RUN =========="; printf '%q ' "$@"; echo; "$@"; }
need(){ [ -f "$1" ] || hold "missing required file: $1"; pass "$1"; }
norm(){ python3 - "$1" <<'PY'
from pathlib import Path
import sys
p=Path(sys.argv[1])
s=p.read_text()
p.write_text("\n".join(x.rstrip() for x in s.splitlines()).rstrip()+"\n")
PY
}

stage "STAGE 0 HEADER"
echo "PHASE=$PHASE"
echo "MODE=QA/docs/evidence only"
echo "BOUNDARY=no UI mutation; no backend real; no CRM/policy/quote writes; no provider/auth/secrets/browser/real engine"
echo "REPORT=$REPORT"
echo "ROBOCOP_GATE=Article 0; 068B implemented; QA lock only"

stage "STAGE 1 CHECKPOINT"
cd "$REPO" || hold "cannot cd repo"
run git status --short --branch
run git log --oneline -10
run git diff --name-status
run git diff --cached --name-status
git branch --show-current | grep -qx main || hold "not on main"

if git log --format='%h %s' -20 | grep -Eq '^94f1e5e[[:space:]]+feat: implement policy read model adapter$' || git log --format='%s' -20 | grep -Fxq 'feat: implement policy read model adapter'; then
  pass "expected 068B commit observed"
elif python3 - <<'PY068B'
import json
from pathlib import Path
p = Path("docs/evidence/forge-policy-read-model-implementation-audit-068b.json")
if not p.exists():
    raise SystemExit(1)
audit = json.loads(p.read_text())
if audit.get("phase") != "068B_POLICY_READ_MODEL_IMPLEMENTATION":
    raise SystemExit(1)
if not str(audit.get("status", "")).startswith("PASS"):
    raise SystemExit(1)
if audit.get("lockedDecision") != "POLICY_READ_MODEL_LOCAL_STATIC_READ_ONLY_IMPLEMENTED":
    raise SystemExit(1)
print("068B audit fallback confirmed")
PY068B
then
  pass "068B audit confirmed"
else
  hold "expected 068B commit or audit not found"
fi
pass "main and 068B confirmed"

stage "STAGE 2 REQUIRED FILE CHECK"
need "FORGE_MASTER_BUILD_TREE.md"
need "docs/architecture/source-truth/FORGE_UNIFIED_BUILD_TREE_001.md"
need "docs/roadmap/FORGE_ROADMAP_LOCK_001.md"
need "docs/architecture/source-truth/FORGE_POLICY_READ_MODEL_SCOPE_068A.md"
need "docs/evidence/forge-policy-read-model-scope-audit-068a.json"
need "docs/architecture/source-truth/FORGE_POLICY_READ_MODEL_IMPLEMENTATION_068B.md"
need "docs/evidence/forge-policy-read-model-implementation-audit-068b.json"
need "platform/adapters/policy-read-model/policy-read-model-adapter-068b.js"
need "tests/policy-read-model-adapter-068b-test.js"

stage "STAGE 3 BACKUP"
BACKUP=".forge-backups/068c-policy-read-model-qa-lock-$(date +%Y%m%d_%H%M%S)"
mkdir -p "$BACKUP"
for f in FORGE_MASTER_BUILD_TREE.md docs/architecture/source-truth/FORGE_UNIFIED_BUILD_TREE_001.md docs/roadmap/FORGE_ROADMAP_LOCK_001.md; do
  mkdir -p "$BACKUP/$(dirname "$f")"
  cp "$f" "$BACKUP/$f"
  pass "backup $f"
done
cat > "$BACKUP/rollback-068c.sh" <<RB
#!/usr/bin/env bash
set -euo pipefail
cd "$REPO"
cp "$BACKUP/FORGE_MASTER_BUILD_TREE.md" FORGE_MASTER_BUILD_TREE.md
cp "$BACKUP/docs/architecture/source-truth/FORGE_UNIFIED_BUILD_TREE_001.md" docs/architecture/source-truth/FORGE_UNIFIED_BUILD_TREE_001.md
cp "$BACKUP/docs/roadmap/FORGE_ROADMAP_LOCK_001.md" docs/roadmap/FORGE_ROADMAP_LOCK_001.md
rm -f docs/architecture/source-truth/FORGE_POLICY_READ_MODEL_QA_LOCK_068C.md
rm -f docs/evidence/FORGE_POLICY_READ_MODEL_QA_LOCK_068C.md
rm -f docs/evidence/FORGE_POLICY_READ_MODEL_QA_LOCK_CERTIFICATE_068C.md
rm -f docs/evidence/forge-policy-read-model-qa-audit-068c.json
rm -f tools/termux/forge_068c_policy_read_model_qa_lock.sh
echo "Rollback 068C complete"
RB
chmod +x "$BACKUP/rollback-068c.sh"
pass "rollback created"

stage "STAGE 4 SEMANTIC QA"
node <<'NODE'
const assert = require('assert');
const adapter = require('./platform/adapters/policy-read-model/policy-read-model-adapter-068b');

function allFalse(flags) {
  for (const [key, value] of Object.entries(flags)) {
    assert.strictEqual(value, false, `${key} must be false`);
  }
}

const manifest = adapter.getPolicyReadModelManifest();
assert.strictEqual(manifest.adapterId, 'forge.policy.read_model.adapter.v1');
assert.strictEqual(manifest.adapterType, 'local_static_fixture');
assert.strictEqual(manifest.adapterMode, 'read_only');
assert.strictEqual(manifest.routeClass, 'read_only');
assert.strictEqual(manifest.domainId, 'policy');
assert.strictEqual(manifest.schemaVersion, 'forge.backend.read_model.v1');
assert.strictEqual(manifest.freshness.status, 'preview_static');
assert.strictEqual(manifest.canonicalPolicyTruthClaimed, false);
assert.strictEqual(manifest.safeErrorCode, 'POLICY_READ_MODEL_NOT_MODELED');
allFalse(manifest.safetyFlags);

const list = adapter.listPolicies();
assert.strictEqual(list.schemaVersion, 'forge.backend.read_model.v1');
assert.strictEqual(list.domainId, 'policy');
assert.strictEqual(list.routeClass, 'read_only');
assert.strictEqual(list.readModel.status, 'ok');
assert.strictEqual(list.readModel.records.length, 2);
assert.strictEqual(list.audit.event, 'read_model_used');
assert.strictEqual(list.freshness.status, 'preview_static');
assert.strictEqual(list.canonicalPolicyTruthClaimed, false);
allFalse(list.safetyFlags);

for (const policy of list.readModel.records) {
  assert.ok(policy.policy_id);
  assert.ok(policy.client_ref.entity_id);
  assert.ok(policy.source_evidence_ids.length > 0);
  assert.ok(policy.freshness_metadata.status);
  assert.strictEqual(policy.audit_event, 'read_model_used');
  assert.ok(policy.blocked_effects.includes('policy_update'));
  allFalse(policy.safety_flags);
}

const lariza = adapter.getPolicyDetail('policy_preview_lariza_gmm');
assert.strictEqual(lariza.readModel.records[0].client_ref.entity_id, 'client_preview_lariza');
assert.strictEqual(lariza.readModel.records[0].policy_type, 'gmm');

const missing = adapter.getPolicyDetail('missing_policy');
assert.strictEqual(missing.readModel.status, 'error');
assert.strictEqual(missing.readModel.emptyState.reason, 'filter_no_match');
assert.strictEqual(missing.readModel.error.code, 'POLICY_READ_MODEL_NOT_MODELED');

console.log(JSON.stringify({
  status: 'PASS',
  adapterId: manifest.adapterId,
  listCount: list.readModel.records.length,
  detailPolicy: lariza.readModel.records[0].policy_id,
  missingError: missing.readModel.error.code,
  allSafetyFlagsFalse: true
}, null, 2));
NODE
pass "semantic QA passed"

stage "STAGE 5 WRITE DOCS / EVIDENCE"
mkdir -p docs/architecture/source-truth docs/evidence tools/termux
cp "${BASH_SOURCE[0]}" tools/termux/forge_068c_policy_read_model_qa_lock.sh

cat > docs/architecture/source-truth/FORGE_POLICY_READ_MODEL_QA_LOCK_068C.md <<'MD'
# Forge Policy Read Model QA Lock 068C

Phase: `068C_POLICY_READ_MODEL_QA_LOCK`

Decision: `PASS_068C_POLICY_READ_MODEL_QA_LOCK`

Locked decision: `POLICY_READ_MODEL_QA_LOCKED`

068C locks QA for the 068B local/static/read-only Policy Read Model adapter.

Validated:

- adapter manifest;
- schema `forge.backend.read_model.v1`;
- `read_only` mode and route class;
- domain `policy`;
- local/static fixture behavior;
- two preview policies;
- Lariza detail lookup;
- safe empty/error behavior;
- safe error `POLICY_READ_MODEL_NOT_MODELED`;
- source evidence and freshness on non-empty records;
- `read_model_used` audit event;
- blocked effects;
- all safety flags false.

Boundary:

- no canonical policy truth;
- no policy issuance or mutation;
- no provider runtime;
- no backend connection;
- no CRM, pipeline, policy, or quote writes;
- no task/calendar/message action;
- no auth, secret access, browser persistence, or real engine execution.

DECISION=PASS_068C_POLICY_READ_MODEL_QA_LOCK

LOCKED_DECISION=POLICY_READ_MODEL_QA_LOCKED

NEXT=068D_POLICY_READ_MODEL_DECISION_LOCK
MD

cat > docs/evidence/FORGE_POLICY_READ_MODEL_QA_LOCK_068C.md <<'MD'
# Evidence 068C

Phase: `068C_POLICY_READ_MODEL_QA_LOCK`

Result: `PASS`

Evidence confirms that 068B is valid as a local/static/read-only Policy Read Model adapter only.

Checks passed:

- node syntax for adapter;
- node syntax for test;
- adapter test;
- semantic QA;
- JSON audit;
- marker scan;
- diff checks;
- scoped safety scan;
- staged boundary.

DECISION=PASS_068C_POLICY_READ_MODEL_QA_LOCK

LOCKED_DECISION=POLICY_READ_MODEL_QA_LOCKED

NEXT=068D_POLICY_READ_MODEL_DECISION_LOCK
MD

cat > docs/evidence/FORGE_POLICY_READ_MODEL_QA_LOCK_CERTIFICATE_068C.md <<'MD'
# Certificate 068C

DECISION=PASS_068C_POLICY_READ_MODEL_QA_LOCK

LOCKED_DECISION=POLICY_READ_MODEL_QA_LOCKED

NEXT=068D_POLICY_READ_MODEL_DECISION_LOCK

No UI mutation. No backend real. No CRM write. No policy write. No quote write. No provider. No auth. No secrets. No browser persistence. No real engine execution.
MD

cat > docs/evidence/forge-policy-read-model-qa-audit-068c.json <<'JSON'
{
  "phase": "068C_POLICY_READ_MODEL_QA_LOCK",
  "status": "PASS",
  "decision": "PASS_068C_POLICY_READ_MODEL_QA_LOCK",
  "lockedDecision": "POLICY_READ_MODEL_QA_LOCKED",
  "basePhase": "068B_POLICY_READ_MODEL_IMPLEMENTATION",
  "baseCommit": "94f1e5e",
  "adapter": "platform/adapters/policy-read-model/policy-read-model-adapter-068b.js",
  "test": "tests/policy-read-model-adapter-068b-test.js",
  "adapterId": "forge.policy.read_model.adapter.v1",
  "adapterType": "local_static_fixture",
  "adapterMode": "read_only",
  "routeClass": "read_only",
  "domainId": "policy",
  "schemaVersion": "forge.backend.read_model.v1",
  "freshnessStatus": "preview_static",
  "safeErrorCode": "POLICY_READ_MODEL_NOT_MODELED",
  "canonicalPolicyTruthClaimed": false,
  "semanticQa": {
    "listCount": 2,
    "larizaDetail": "policy_preview_lariza_gmm",
    "missingError": "POLICY_READ_MODEL_NOT_MODELED",
    "sourceEvidenceRequired": true,
    "freshnessRequired": true
  },
  "policyWrite": false,
  "crmWrite": false,
  "pipelineWrite": false,
  "quoteWrite": false,
  "taskCreate": false,
  "calendarCreate": false,
  "messageSend": false,
  "authReal": false,
  "providerRuntime": false,
  "secretAccess": false,
  "browserPersistence": false,
  "realEngineExecution": false,
  "realEffectsAllowed": false,
  "realEffectsEnabled": false,
  "backendConnection": false,
  "next": "068D_POLICY_READ_MODEL_DECISION_LOCK"
}
JSON
pass "docs/evidence written"

stage "STAGE 6 UPDATE BUILD TREE / ROADMAP"
python3 - <<'PY'
from pathlib import Path
block = """<!-- FORGE:068C_POLICY_READ_MODEL_QA_LOCK:START -->
## 068C Policy Read Model QA Lock

Status: PASS

Locked decision:

`POLICY_READ_MODEL_QA_LOCKED`

068C validates and locks QA for the 068B local/static/read-only Policy Read Model adapter.

Validated:
- adapter manifest;
- `forge.backend.read_model.v1`;
- `read_only` mode;
- local/static fixture behavior;
- safe empty/error path `POLICY_READ_MODEL_NOT_MODELED`;
- source evidence and freshness metadata;
- blocked effects;
- all safety flags false.

Boundary remains:
- no canonical policy truth;
- no policy issuance or mutation;
- no backend/provider/auth/secrets/browser persistence;
- no CRM/pipeline/policy/quote writes;
- no real engine execution.

DECISION=PASS_068C_POLICY_READ_MODEL_QA_LOCK

LOCKED_DECISION=POLICY_READ_MODEL_QA_LOCKED

NEXT=068D_POLICY_READ_MODEL_DECISION_LOCK
<!-- FORGE:068C_POLICY_READ_MODEL_QA_LOCK:END -->
"""
for file in ["FORGE_MASTER_BUILD_TREE.md","docs/architecture/source-truth/FORGE_UNIFIED_BUILD_TREE_001.md","docs/roadmap/FORGE_ROADMAP_LOCK_001.md"]:
    p=Path(file)
    text=p.read_text()
    start="<!-- FORGE:068C_POLICY_READ_MODEL_QA_LOCK:START -->"
    end="<!-- FORGE:068C_POLICY_READ_MODEL_QA_LOCK:END -->"
    if start in text and end in text:
        before, rest=text.split(start,1)
        _, after=rest.split(end,1)
        text=before.rstrip()+"\n\n"+block+after.lstrip("\n")
    else:
        text=text.rstrip()+"\n\n"+block
    p.write_text(text)
PY
pass "build tree / roadmap updated"

stage "STAGE 7 NORMALIZE FILES"
allowed=(
  "FORGE_MASTER_BUILD_TREE.md"
  "docs/architecture/source-truth/FORGE_UNIFIED_BUILD_TREE_001.md"
  "docs/roadmap/FORGE_ROADMAP_LOCK_001.md"
  "docs/architecture/source-truth/FORGE_POLICY_READ_MODEL_QA_LOCK_068C.md"
  "docs/evidence/FORGE_POLICY_READ_MODEL_QA_LOCK_068C.md"
  "docs/evidence/FORGE_POLICY_READ_MODEL_QA_LOCK_CERTIFICATE_068C.md"
  "docs/evidence/forge-policy-read-model-qa-audit-068c.json"
  "tools/termux/forge_068c_policy_read_model_qa_lock.sh"
)
for f in "${allowed[@]}"; do norm "$f"; done
pass "normalized files"

stage "STAGE 8 VALIDATION"
run bash -n tools/termux/forge_068c_policy_read_model_qa_lock.sh
run node --check platform/adapters/policy-read-model/policy-read-model-adapter-068b.js
run node --check tests/policy-read-model-adapter-068b-test.js
run node tests/policy-read-model-adapter-068b-test.js
run python3 -m json.tool docs/evidence/forge-policy-read-model-qa-audit-068c.json
run rg -n "068C_POLICY_READ_MODEL_QA_LOCK|PASS_068C_POLICY_READ_MODEL_QA_LOCK|POLICY_READ_MODEL_QA_LOCKED|POLICY_READ_MODEL_NOT_MODELED|068D_POLICY_READ_MODEL_DECISION_LOCK" "${allowed[@]:0:7}"
run git diff --check

stage "STAGE 9 SAFETY SCAN"
scan=("${allowed[@]:0:7}" "platform/adapters/policy-read-model/policy-read-model-adapter-068b.js" "tests/policy-read-model-adapter-068b-test.js")
if rg -n "localStorage|sessionStorage|fetch\\(|XMLHttpRequest|navigator\\.mediaDevices|SpeechRecognition|providerRuntimeEnabled:\\s*true|networkCallsAllowed:\\s*true|browserStorageEnabled:\\s*true|mayCreateTruth:\\s*true|maySendMessage:\\s*true|mayWriteCrm:\\s*true|mayCreateCalendarEvent:\\s*true" "${scan[@]}"; then hold "browser/runtime/action token found"; fi
if rg -n "crmWrite: true|pipelineWrite: true|policyWrite: true|quoteWrite: true|taskCreate: true|calendarCreate: true|messageSend: true|authReal: true|providerRuntime: true|secretAccess: true|browserPersistence: true|realEngineExecution: true|realEffectsAllowed: true|realEffectsEnabled: true|backendConnection: true|\\\"crmWrite\\\": true|\\\"pipelineWrite\\\": true|\\\"policyWrite\\\": true|\\\"quoteWrite\\\": true|\\\"taskCreate\\\": true|\\\"calendarCreate\\\": true|\\\"messageSend\\\": true|\\\"authReal\\\": true|\\\"providerRuntime\\\": true|\\\"secretAccess\\\": true|\\\"browserPersistence\\\": true|\\\"realEngineExecution\\\": true|\\\"realEffectsAllowed\\\": true|\\\"realEffectsEnabled\\\": true|\\\"backendConnection\\\": true" "${scan[@]}"; then hold "enabled real-effect marker found"; fi
pass "safety scan clean"

stage "STAGE 10 OPTIONAL SCREENSHOT EVIDENCE"
warn "not applicable: 068C has no UI mutation"

stage "STAGE 11 STAGE AUTHORIZED FILES"
git add "${allowed[@]}"
run git diff --cached --name-only
exp="$(mktemp)"; act="$(mktemp)"
printf "%s\n" "${allowed[@]}" | sort > "$exp"
git diff --cached --name-only | sort > "$act"
diff -u "$exp" "$act" || hold "staged set differs from authorized files"
rm -f "$exp" "$act"
pass "only authorized files staged"
run git diff --cached --check

stage "STAGE 12 COMMIT PUSH"
git diff --cached --quiet && hold "nothing staged for commit"
run git commit -m "docs: lock policy read model qa"
run git push origin HEAD:main

stage "STAGE 13 FINAL CHECKPOINT"
run git status --short --branch
run git log --oneline -10

stage "FINAL DECISION"
echo "PASS_068C_POLICY_READ_MODEL_QA_LOCK_COMMIT_PUSH_COMPLETE"
echo "DECISION=PASS_068C_POLICY_READ_MODEL_QA_LOCK"
echo "LOCKED_DECISION=POLICY_READ_MODEL_QA_LOCKED"
echo "NEXT=068D_POLICY_READ_MODEL_DECISION_LOCK"
echo "BACKUP=$BACKUP"
echo "ROLLBACK=$BACKUP/rollback-068c.sh"
echo "Reporte: $REPORT"
copy_report
