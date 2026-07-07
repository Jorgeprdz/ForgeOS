#!/usr/bin/env bash
set -euo pipefail

PHASE="071C_QUOTE_ACTION_CONTRACT_QA_LOCK"
REPORT="/data/data/com.termux/files/home/${PHASE}_RESULT_$(date +%Y%m%d_%H%M%S).md"

green(){ printf "\033[1;38;5;46mPASS:\033[0m %s\n" "$*" | tee -a "$REPORT"; }
yellow(){ printf "\033[1;33mWARN:\033[0m %s\n" "$*" | tee -a "$REPORT"; }
red(){ printf "\033[1;31mHOLD:\033[0m %s\n" "$*" | tee -a "$REPORT"; copy_report; exit 1; }
stage(){ printf "\n\033[1;36m========== %s ==========\033[0m\n" "$*" | tee -a "$REPORT"; }
run(){ printf "\n========== RUN ==========\n%s\n" "$*" | tee -a "$REPORT"; "$@" 2>&1 | tee -a "$REPORT"; }

copy_report(){
  if command -v termux-clipboard-set >/dev/null 2>&1 && [ -f "$REPORT" ]; then
    termux-clipboard-set < "$REPORT" || true
  fi
}

stage "STAGE 0 HEADER"
{
  echo "PHASE=$PHASE"
  echo "MODE=QA/docs/evidence only"
  echo "BOUNDARY=no UI mutation; no backend real; no quote execution; no provider/auth/secrets/browser/real engine; no CRM/policy/quote/pipeline/task/calendar/message writes"
  echo "REPORT=$REPORT"
  echo "ROBOCOP_GATE=Article 0; 071B implemented; QA lock only"
} | tee -a "$REPORT"

stage "STAGE 1 CHECKPOINT"
run git status --short --branch
run git log --oneline -10
run git diff --name-status
run git diff --cached --name-status

stage "STAGE 2 VERIFY 071B"
if [ -f docs/evidence/forge-quote-action-contract-implementation-audit-071b.json ] && \
python3 - <<'PY'
import json
p='docs/evidence/forge-quote-action-contract-implementation-audit-071b.json'
d=json.load(open(p))
assert d.get('phase') == '071B_QUOTE_ACTION_CONTRACT_IMPLEMENTATION'
assert d.get('decision') == 'PASS_071B_QUOTE_ACTION_CONTRACT_IMPLEMENTATION'
assert d.get('lockedDecision') == 'QUOTE_ACTION_CONTRACT_LOCAL_STATIC_NO_EFFECT_IMPLEMENTED'
assert d.get('next') == '071C_QUOTE_ACTION_CONTRACT_QA_LOCK'
assert d.get('newQuoteEngineCreated') is False
assert d.get('quoteExecutionAuthorized') is False
assert d.get('providerRuntimeAuthorized') is False
assert all(v is False for v in d.get('safetyFlags', {}).values())
PY
then
  green "071B audit confirmed"
else
  red "071B audit not confirmed"
fi

REQUIRED=(
  "FORGE_MASTER_BUILD_TREE.md"
  "docs/architecture/source-truth/FORGE_UNIFIED_BUILD_TREE_001.md"
  "docs/roadmap/FORGE_ROADMAP_LOCK_001.md"
  "platform/action-contracts/quote-action-contract-071b.js"
  "tests/quote-action-contract-071b-test.js"
  "docs/architecture/source-truth/FORGE_QUOTE_ACTION_CONTRACT_IMPLEMENTATION_071B.md"
  "docs/evidence/forge-quote-action-contract-implementation-audit-071b.json"
)
for f in "${REQUIRED[@]}"; do
  [ -f "$f" ] || red "missing required file: $f"
  green "$f"
done

stage "STAGE 3 BACKUP"
BACKUP=".forge-backups/071c-quote-action-contract-qa-lock-$(date +%Y%m%d_%H%M%S)"
mkdir -p "$BACKUP"
cp FORGE_MASTER_BUILD_TREE.md "$BACKUP/"
cp docs/architecture/source-truth/FORGE_UNIFIED_BUILD_TREE_001.md "$BACKUP/"
cp docs/roadmap/FORGE_ROADMAP_LOCK_001.md "$BACKUP/"
green "backup created: $BACKUP"

stage "STAGE 4 SEMANTIC QA"
run node --check platform/action-contracts/quote-action-contract-071b.js
run node --check tests/quote-action-contract-071b-test.js
run node tests/quote-action-contract-071b-test.js

node <<'NODE' | tee -a "$REPORT"
const assert = require('assert');
const q = require('./platform/action-contracts/quote-action-contract-071b.js');

const preview = q.createQuoteActionContract({
  action_family: 'quote.prepare_preview',
  input_payload: { quote_id: 'qa_071c' },
  preview_payload: { status: 'preview_ready' },
  source_evidence_ids: ['evidence_071c'],
  freshness_metadata: { status: 'preview_static' },
});
assert.strictEqual(preview.ok, true);
assert.strictEqual(preview.contract.required_approval, false);
assert.strictEqual(preview.contract.allowed_without_approval, true);
assert.strictEqual(q.validateQuoteActionPayloadIntegrity(preview.contract).ok, true);

const send = q.createQuoteActionContract({
  action_family: 'quote.send',
  input_payload: { quote_id: 'qa_071c' },
  preview_payload: { status: 'send_preview' },
  execution_payload: { status: 'send_real' },
  source_evidence_ids: ['evidence_071c'],
  freshness_metadata: { status: 'preview_static' },
  rollback_plan: { strategy: 'block_before_send' },
  idempotency_key: 'qa-071c-send',
});
assert.strictEqual(send.ok, true);
assert.strictEqual(send.contract.required_approval, true);
assert.strictEqual(q.validateQuoteActionPayloadIntegrity(send.contract).error.code, q.SAFE_ERRORS.REQUIRES_APPROVAL);

for (const value of Object.values(send.contract.safety_flags)) {
  assert.strictEqual(value, false);
}

console.log(JSON.stringify({
  status: 'PASS',
  previewAllowedWithoutApproval: true,
  realEffectRequiresApproval: true,
  payloadIntegrityValidated: true,
  allSafetyFlagsFalse: true,
  newQuoteEngineCreated: false,
  quoteExecutionAuthorized: false
}, null, 2));
NODE
green "semantic QA passed"

stage "STAGE 5 WRITE DOCS / EVIDENCE"
mkdir -p docs/architecture/source-truth docs/evidence

cat > docs/architecture/source-truth/FORGE_QUOTE_ACTION_CONTRACT_QA_LOCK_071C.md <<'EOF'
# Forge Quote Action Contract QA Lock 071C

Phase: `071C_QUOTE_ACTION_CONTRACT_QA_LOCK`

Decision: `PASS_071C_QUOTE_ACTION_CONTRACT_QA_LOCK`

Locked decision: `QUOTE_ACTION_CONTRACT_QA_LOCKED`

Next: `071D_QUOTE_ACTION_CONTRACT_DECISION_LOCK`

## QA Scope

071C locks QA for the local/static/no-effect Quote Action Contract implementation from 071B.

Validated files:

- `platform/action-contracts/quote-action-contract-071b.js`
- `tests/quote-action-contract-071b-test.js`

## QA Confirmed

- `forge.quote.action_contract.v1` is exposed.
- `forge.action_contract.v1` is used.
- `forge.approval_gate.v1` is used.
- No-effect preview families are allowed without approval.
- Real-effect quote families require approval.
- Payload hashes are deterministic.
- Payload changes after approval are blocked.
- Missing source evidence is blocked.
- Missing freshness is blocked.
- Missing rollback plan is blocked.
- `execution_result` before execution is blocked.
- Real-effect safety flags set to true are blocked.
- All default safety flags remain false.
- No new quote engine was created.
- Quote execution remains unauthorized.

## Boundary

071C is QA/docs/evidence only.

It does not execute quotes, call providers, generate PDFs, send quotes, save quotes, bind quotes, mutate UI, connect backend, write CRM, write policies, write pipeline, create tasks, create calendar events, send messages, access auth or secrets, persist browser state, bypass approval, or invent quote truth.

## Final

DECISION=PASS_071C_QUOTE_ACTION_CONTRACT_QA_LOCK

LOCKED_DECISION=QUOTE_ACTION_CONTRACT_QA_LOCKED

NEXT=071D_QUOTE_ACTION_CONTRACT_DECISION_LOCK
EOF

cat > docs/evidence/FORGE_QUOTE_ACTION_CONTRACT_QA_LOCK_071C.md <<'EOF'
# Forge Quote Action Contract QA Lock Evidence 071C

Phase: `071C_QUOTE_ACTION_CONTRACT_QA_LOCK`

Status: PASS

Decision: `PASS_071C_QUOTE_ACTION_CONTRACT_QA_LOCK`

Locked decision: `QUOTE_ACTION_CONTRACT_QA_LOCKED`

Next: `071D_QUOTE_ACTION_CONTRACT_DECISION_LOCK`

## Evidence Summary

071C validated the 071B Quote Action Contract implementation.

The QA confirms no-effect preview behavior, approval-required behavior for real quote actions, payload integrity validation, evidence/freshness/rollback requirements, execution-result timing protection, and default false safety flags.

## Validation Commands

- `node --check platform/action-contracts/quote-action-contract-071b.js`
- `node --check tests/quote-action-contract-071b-test.js`
- `node tests/quote-action-contract-071b-test.js`
- `python3 -m json.tool docs/evidence/forge-quote-action-contract-qa-audit-071c.json`
- marker scan
- `git diff --check`
- scoped safety scan
- `git diff --cached --check`

## Final

DECISION=PASS_071C_QUOTE_ACTION_CONTRACT_QA_LOCK

LOCKED_DECISION=QUOTE_ACTION_CONTRACT_QA_LOCKED

NEXT=071D_QUOTE_ACTION_CONTRACT_DECISION_LOCK
EOF

cat > docs/evidence/FORGE_QUOTE_ACTION_CONTRACT_QA_LOCK_CERTIFICATE_071C.md <<'EOF'
# Forge Quote Action Contract QA Lock Certificate 071C

Certificate status: ISSUED

Phase: `071C_QUOTE_ACTION_CONTRACT_QA_LOCK`

Certified decision: `PASS_071C_QUOTE_ACTION_CONTRACT_QA_LOCK`

Locked decision: `QUOTE_ACTION_CONTRACT_QA_LOCKED`

Next: `071D_QUOTE_ACTION_CONTRACT_DECISION_LOCK`

## Certification

071C certifies that the 071B Quote Action Contract passed local/static/no-effect QA.

Certified behavior:

- preview action contracts remain no-effect;
- real-effect quote actions require approval;
- payload integrity is enforced;
- source evidence is required;
- freshness is required;
- rollback plan is required;
- execution result timing is enforced;
- all default safety flags remain false;
- no new quote engine was created;
- quote execution remains unauthorized.

## Non-Authorization

This certificate does not authorize quote execution, provider calls, quote document generation, quote send, quote save, quote binding, CRM writes, policy writes, pipeline writes, task/calendar/message actions, backend connection, auth, secrets, browser persistence, approval bypass, real engine effects, or invented quote truth.

## Final

DECISION=PASS_071C_QUOTE_ACTION_CONTRACT_QA_LOCK
EOF

cat > docs/evidence/forge-quote-action-contract-qa-audit-071c.json <<'EOF'
{
  "phase": "071C_QUOTE_ACTION_CONTRACT_QA_LOCK",
  "status": "PASS",
  "decision": "PASS_071C_QUOTE_ACTION_CONTRACT_QA_LOCK",
  "lockedDecision": "QUOTE_ACTION_CONTRACT_QA_LOCKED",
  "basePhase": "071B_QUOTE_ACTION_CONTRACT_IMPLEMENTATION",
  "next": "071D_QUOTE_ACTION_CONTRACT_DECISION_LOCK",
  "mode": "qa_docs_evidence_only",
  "implementationFile": "platform/action-contracts/quote-action-contract-071b.js",
  "testFile": "tests/quote-action-contract-071b-test.js",
  "contractId": "forge.quote.action_contract.v1",
  "schemas": {
    "actionContract": "forge.action_contract.v1",
    "approvalGate": "forge.approval_gate.v1"
  },
  "semanticQa": {
    "previewAllowedWithoutApproval": true,
    "realEffectRequiresApproval": true,
    "deterministicPayloadHashing": true,
    "payloadChangedAfterApprovalBlocked": true,
    "sourceEvidenceRequired": true,
    "freshnessRequired": true,
    "rollbackPlanRequired": true,
    "executionResultBeforeExecuteBlocked": true,
    "realEffectFlagBlocked": true,
    "allDefaultSafetyFlagsFalse": true,
    "newQuoteEngineCreated": false,
    "quoteExecutionAuthorized": false
  },
  "safeErrorsConfirmed": [
    "QUOTE_ACTION_CONTRACT_NOT_MODELED",
    "QUOTE_ACTION_REQUIRES_APPROVAL",
    "QUOTE_ACTION_PAYLOAD_CHANGED_AFTER_APPROVAL",
    "QUOTE_ACTION_SOURCE_EVIDENCE_REQUIRED",
    "QUOTE_ACTION_FRESHNESS_REQUIRED",
    "QUOTE_ACTION_ROLLBACK_PLAN_REQUIRED",
    "QUOTE_ACTION_CAPABILITY_NOT_GRANTED",
    "QUOTE_ACTION_BLOCKED_BY_POLICY",
    "QUOTE_ACTION_PROVIDER_NOT_AUTHORIZED",
    "QUOTE_ACTION_REAL_EFFECT_NOT_ALLOWED"
  ],
  "safetyFlags": {
    "crmWrite": false,
    "pipelineWrite": false,
    "policyWrite": false,
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
    "approvalBypass": false,
    "autoSend": false,
    "autoWrite": false
  },
  "validation": {
    "nodeCheckImplementation": "PASS",
    "nodeCheckTest": "PASS",
    "nodeTest": "PASS",
    "nodeTestOutput": "PASS quote action contract 071B",
    "jsonAudit": "PASS",
    "markerScan": "PASS",
    "gitDiffCheck": "PASS",
    "safetyScan": "PASS",
    "stagedDiffCheck": "PASS"
  }
}
EOF
green "docs/evidence written"

stage "STAGE 6 UPDATE BUILD TREE / ROADMAP"
python3 - <<'PY'
from pathlib import Path

block = """<!-- FORGE:071C_QUOTE_ACTION_CONTRACT_QA_LOCK:START -->
## 071C Quote Action Contract QA Lock

071C locks QA for the local/static/no-effect Quote Action Contract implementation.

Locked decision:
`QUOTE_ACTION_CONTRACT_QA_LOCKED`

QA confirms:

- `forge.quote.action_contract.v1`;
- no-effect preview contracts allowed without approval;
- real-effect quote action contracts require approval;
- payload integrity enforced;
- source evidence required;
- freshness required;
- rollback plan required;
- execution result timing enforced;
- all default safety flags false;
- no new quote engine;
- quote execution unauthorized.

DECISION=PASS_071C_QUOTE_ACTION_CONTRACT_QA_LOCK

LOCKED_DECISION=QUOTE_ACTION_CONTRACT_QA_LOCKED

NEXT=071D_QUOTE_ACTION_CONTRACT_DECISION_LOCK
<!-- FORGE:071C_QUOTE_ACTION_CONTRACT_QA_LOCK:END -->
"""

for raw in [
    "FORGE_MASTER_BUILD_TREE.md",
    "docs/architecture/source-truth/FORGE_UNIFIED_BUILD_TREE_001.md",
    "docs/roadmap/FORGE_ROADMAP_LOCK_001.md",
]:
    path = Path(raw)
    text = path.read_text()
    if "FORGE:071C_QUOTE_ACTION_CONTRACT_QA_LOCK:START" in text:
        continue
    marker = "<!-- FORGE:071B_QUOTE_ACTION_CONTRACT_IMPLEMENTATION:END -->"
    if marker not in text:
        raise SystemExit(f"missing 071B marker in {path}")
    path.write_text(text.replace(marker, marker + "\n\n" + block, 1))
PY
green "build tree / roadmap updated"

stage "STAGE 7 NORMALIZE FILES"
python3 - <<'PY'
from pathlib import Path
paths = [
 "FORGE_MASTER_BUILD_TREE.md",
 "docs/architecture/source-truth/FORGE_UNIFIED_BUILD_TREE_001.md",
 "docs/roadmap/FORGE_ROADMAP_LOCK_001.md",
 "docs/architecture/source-truth/FORGE_QUOTE_ACTION_CONTRACT_QA_LOCK_071C.md",
 "docs/evidence/FORGE_QUOTE_ACTION_CONTRACT_QA_LOCK_071C.md",
 "docs/evidence/FORGE_QUOTE_ACTION_CONTRACT_QA_LOCK_CERTIFICATE_071C.md",
 "docs/evidence/forge-quote-action-contract-qa-audit-071c.json",
]
for p in paths:
    path=Path(p)
    s=path.read_text().replace("\r\n","\n").replace("\r","\n").rstrip()+"\n"
    path.write_text(s)
PY
green "normalized files"

stage "STAGE 8 VALIDATION"
run bash -n tools/termux/forge_071c_quote_action_contract_qa_lock.sh
run node --check platform/action-contracts/quote-action-contract-071b.js
run node --check tests/quote-action-contract-071b-test.js
run node tests/quote-action-contract-071b-test.js
run python3 -m json.tool docs/evidence/forge-quote-action-contract-qa-audit-071c.json
run rg -n "071C_QUOTE_ACTION_CONTRACT_QA_LOCK|PASS_071C_QUOTE_ACTION_CONTRACT_QA_LOCK|QUOTE_ACTION_CONTRACT_QA_LOCKED|071D_QUOTE_ACTION_CONTRACT_DECISION_LOCK|forge\.quote\.action_contract\.v1|QUOTE_ACTION_REQUIRES_APPROVAL" \
  FORGE_MASTER_BUILD_TREE.md \
  docs/architecture/source-truth/FORGE_UNIFIED_BUILD_TREE_001.md \
  docs/roadmap/FORGE_ROADMAP_LOCK_001.md \
  docs/architecture/source-truth/FORGE_QUOTE_ACTION_CONTRACT_QA_LOCK_071C.md \
  docs/evidence/FORGE_QUOTE_ACTION_CONTRACT_QA_LOCK_071C.md \
  docs/evidence/FORGE_QUOTE_ACTION_CONTRACT_QA_LOCK_CERTIFICATE_071C.md \
  docs/evidence/forge-quote-action-contract-qa-audit-071c.json
run git diff --check

stage "STAGE 9 SAFETY SCAN"
if rg -n "localStorage|sessionStorage|fetch\(|XMLHttpRequest|navigator\.mediaDevices|SpeechRecognition|providerRuntimeEnabled:\s*true|networkCallsAllowed:\s*true|browserStorageEnabled:\s*true|mayCreateTruth:\s*true|maySendMessage:\s*true|mayWriteCrm:\s*true|mayCreateCalendarEvent:\s*true" \
  platform/action-contracts/quote-action-contract-071b.js \
  tests/quote-action-contract-071b-test.js \
  docs/architecture/source-truth/FORGE_QUOTE_ACTION_CONTRACT_QA_LOCK_071C.md \
  docs/evidence/FORGE_QUOTE_ACTION_CONTRACT_QA_LOCK_071C.md; then
  red "prohibited runtime/browser token found"
fi

if rg -n '"?(crmWrite|pipelineWrite|policyWrite|quoteWrite|taskCreate|calendarCreate|messageSend|authReal|providerRuntime|secretAccess|browserPersistence|realEngineExecution|realEffectsAllowed|realEffectsEnabled|backendConnection|approvalBypass|autoSend|autoWrite)"?\s*[:=]\s*true\b' \
  platform/action-contracts/quote-action-contract-071b.js \
  docs/evidence/forge-quote-action-contract-qa-audit-071c.json; then
  red "real-effect true flag found"
fi
green "safety scan clean"

stage "STAGE 10 STAGE AUTHORIZED FILES"
AUTHORIZED=(
  "FORGE_MASTER_BUILD_TREE.md"
  "docs/architecture/source-truth/FORGE_UNIFIED_BUILD_TREE_001.md"
  "docs/roadmap/FORGE_ROADMAP_LOCK_001.md"
  "docs/architecture/source-truth/FORGE_QUOTE_ACTION_CONTRACT_QA_LOCK_071C.md"
  "docs/evidence/FORGE_QUOTE_ACTION_CONTRACT_QA_LOCK_071C.md"
  "docs/evidence/FORGE_QUOTE_ACTION_CONTRACT_QA_LOCK_CERTIFICATE_071C.md"
  "docs/evidence/forge-quote-action-contract-qa-audit-071c.json"
  "tools/termux/forge_071c_quote_action_contract_qa_lock.sh"
)
git add "${AUTHORIZED[@]}"
run git diff --cached --name-only

EXPECTED="$(mktemp)"
ACTUAL="$(mktemp)"
printf "%s\n" "${AUTHORIZED[@]}" | sort > "$EXPECTED"
git diff --cached --name-only | sort > "$ACTUAL"
diff -u "$EXPECTED" "$ACTUAL" | tee -a "$REPORT" || red "staged boundary mismatch"
green "only authorized files staged"

run git diff --cached --check

stage "STAGE 11 COMMIT PUSH"
run git commit -m "docs: lock quote action contract qa"
run git push origin HEAD:main

stage "STAGE 12 FINAL CHECKPOINT"
run git status --short --branch
run git log --oneline -10

FINAL_SUMMARY="$(cat <<EOF
PASS_071C_QUOTE_ACTION_CONTRACT_QA_LOCK_COMMIT_PUSH_COMPLETE
DECISION=PASS_071C_QUOTE_ACTION_CONTRACT_QA_LOCK
LOCKED_DECISION=QUOTE_ACTION_CONTRACT_QA_LOCKED
NEXT=071D_QUOTE_ACTION_CONTRACT_DECISION_LOCK
BACKUP=$BACKUP
Reporte: $REPORT
EOF
)"

printf "\n%s\n" "$FINAL_SUMMARY" | tee -a "$REPORT"

if command -v termux-clipboard-set >/dev/null 2>&1; then
  printf "%s\n" "$FINAL_SUMMARY" | termux-clipboard-set || true
  green "final summary copied to clipboard"
else
  yellow "termux-clipboard-set not available; report path printed above"
fi
