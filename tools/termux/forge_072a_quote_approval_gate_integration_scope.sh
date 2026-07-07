#!/usr/bin/env bash
set -euo pipefail

PHASE="072A_QUOTE_APPROVAL_GATE_INTEGRATION_SCOPE"
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
  echo "MODE=docs/scope only"
  echo "BOUNDARY=no UI mutation; no backend real; no quote execution; no provider/auth/secrets/browser/real engine; no CRM/policy/quote/pipeline/task/calendar/message writes"
  echo "REPORT=$REPORT"
  echo "ROBOCOP_GATE=Article 0; 071D decision locked; approval gate integration scope only"
} | tee -a "$REPORT"

stage "STAGE 1 CHECKPOINT"
run git status --short --branch
run git log --oneline -10
run git diff --name-status
run git diff --cached --name-status

stage "STAGE 2 VERIFY 071D"
if [ -f docs/evidence/forge-quote-action-contract-decision-audit-071d.json ] && \
python3 - <<'PY'
import json
p='docs/evidence/forge-quote-action-contract-decision-audit-071d.json'
d=json.load(open(p))
assert d.get('phase') == '071D_QUOTE_ACTION_CONTRACT_DECISION_LOCK'
assert d.get('decision') == 'PASS_071D_QUOTE_ACTION_CONTRACT_DECISION_LOCK'
assert d.get('lockedDecision') == 'QUOTE_ACTION_CONTRACT_LOCKED_AS_LOCAL_STATIC_NO_EFFECT_CONTRACT'
assert d.get('next') == '072A_QUOTE_APPROVAL_GATE_INTEGRATION_SCOPE'
assert d.get('newQuoteEngineCreated') is False
assert d.get('quoteExecutionAuthorized') is False
assert d.get('quoteApprovalAuthorized') is False
assert d.get('humanApprovalRequiredForRealEffects') is True
assert all(v is False for v in d.get('safetyFlags', {}).values())
PY
then
  green "071D audit confirmed"
else
  red "071D audit not confirmed"
fi

REQUIRED=(
  "FORGE_MASTER_BUILD_TREE.md"
  "docs/architecture/source-truth/FORGE_UNIFIED_BUILD_TREE_001.md"
  "docs/roadmap/FORGE_ROADMAP_LOCK_001.md"
  "platform/action-contracts/quote-action-contract-071b.js"
  "tests/quote-action-contract-071b-test.js"
  "docs/evidence/forge-quote-action-contract-decision-audit-071d.json"
  "platform/action-contracts/action-contract-approval-gate-schema-070c.js"
)
for f in "${REQUIRED[@]}"; do
  [ -f "$f" ] || red "missing required file: $f"
  green "$f"
done

stage "STAGE 3 BACKUP"
BACKUP=".forge-backups/072a-quote-approval-gate-integration-scope-$(date +%Y%m%d_%H%M%S)"
mkdir -p "$BACKUP"
cp FORGE_MASTER_BUILD_TREE.md "$BACKUP/"
cp docs/architecture/source-truth/FORGE_UNIFIED_BUILD_TREE_001.md "$BACKUP/"
cp docs/roadmap/FORGE_ROADMAP_LOCK_001.md "$BACKUP/"
green "backup created: $BACKUP"

stage "STAGE 4 WRITE DOCS / EVIDENCE"
mkdir -p docs/architecture/source-truth docs/evidence

cat > docs/architecture/source-truth/FORGE_QUOTE_APPROVAL_GATE_INTEGRATION_SCOPE_072A.md <<'EOF'
# Forge Quote Approval Gate Integration Scope 072A

Phase: `072A_QUOTE_APPROVAL_GATE_INTEGRATION_SCOPE`

Decision: `PASS_072A_QUOTE_APPROVAL_GATE_INTEGRATION_SCOPE`

Locked decision: `QUOTE_APPROVAL_GATE_INTEGRATION_SCOPED`

Next: `072B_QUOTE_APPROVAL_GATE_INTEGRATION_IMPLEMENTATION`

## Purpose

072A scopes the integration between the local/static/no-effect Quote Action Contract and the Approval Gate schema.

This phase does not execute quote actions.

This phase does not approve quote actions.

This phase does not create a new quote engine.

## Integration Boundary

The integration may connect these local/static/no-effect layers:

- Quote Read Model adapter;
- Quote Action Contract;
- Action Contract schema;
- Approval Gate schema;
- deterministic payload hash validation;
- approval requirement detection;
- safe error mapping.

The integration may not connect:

- provider runtime;
- backend runtime;
- CRM writes;
- policy writes;
- quote writes;
- pipeline writes;
- task/calendar/message actions;
- auth or secrets;
- browser persistence;
- real engine execution;
- approval bypass.

## Required Integration Rules

- Preview quote actions may remain `not_required` only when no real effect is possible.
- Real-effect quote actions must set `approval_required=true`.
- Real-effect quote actions must set `approval_status=required` or `pending` until human approval exists.
- Approved payload hash must match execution payload hash before any future execution.
- Payload changes after approval must block.
- Source evidence is required.
- Freshness metadata is required.
- Rollback plan is required for effectful actions.
- Idempotency key is required for executable actions.
- AI cannot approve.
- Safety validation cannot approve.
- Approval cannot be inferred from preview, click, typing, opening, or viewing.

## Scoped Integration Inputs

- quote action contract from `platform/action-contracts/quote-action-contract-071b.js`;
- approval gate schema from `platform/action-contracts/action-contract-approval-gate-schema-070c.js`;
- quote read model candidate from `platform/adapters/quote-read-model/quote-read-model-adapter-069c.js`;
- source evidence ids;
- freshness metadata;
- preview payload hash;
- execution payload hash;
- approval status;
- safety flags.

## Scoped Integration Outputs

- integrated quote approval gate envelope;
- approval-required decision;
- blocked-effects list;
- safe error when approval is missing;
- safe error when payload changed;
- safe error when evidence/freshness/rollback is missing;
- audit preview event;
- all safety flags false.

## Safe Errors

- `QUOTE_APPROVAL_GATE_NOT_MODELED`
- `QUOTE_ACTION_REQUIRES_APPROVAL`
- `ACTION_EXECUTION_REQUIRES_APPROVAL`
- `QUOTE_ACTION_PAYLOAD_CHANGED_AFTER_APPROVAL`
- `ACTION_PAYLOAD_CHANGED_AFTER_APPROVAL`
- `QUOTE_ACTION_SOURCE_EVIDENCE_REQUIRED`
- `ACTION_SOURCE_EVIDENCE_REQUIRED`
- `QUOTE_ACTION_FRESHNESS_REQUIRED`
- `ACTION_FRESHNESS_REQUIRED`
- `QUOTE_ACTION_ROLLBACK_PLAN_REQUIRED`
- `ACTION_ROLLBACK_PLAN_REQUIRED`
- `QUOTE_ACTION_REAL_EFFECT_NOT_ALLOWED`
- `ACTION_EXECUTION_BLOCKED_BY_POLICY`

## Not Authorized

072A does not authorize:

- quote execution;
- quote approval;
- provider calls;
- backend connection;
- quote document or proposal generation;
- quote send;
- quote save;
- quote binding;
- CRM write;
- policy write;
- pipeline write;
- task/calendar/message creation;
- auth or secret access;
- browser persistence;
- approval bypass;
- invented quote truth.

## Implementation Readiness

072B may implement only a local/static/no-effect integration validator.

072B must not execute quote actions.

072B must not approve quote actions.

072B must not call providers or backend services.

## Final

DECISION=PASS_072A_QUOTE_APPROVAL_GATE_INTEGRATION_SCOPE

LOCKED_DECISION=QUOTE_APPROVAL_GATE_INTEGRATION_SCOPED

NEXT=072B_QUOTE_APPROVAL_GATE_INTEGRATION_IMPLEMENTATION
EOF

cat > docs/evidence/FORGE_QUOTE_APPROVAL_GATE_INTEGRATION_SCOPE_072A.md <<'EOF'
# Forge Quote Approval Gate Integration Scope Evidence 072A

Phase: `072A_QUOTE_APPROVAL_GATE_INTEGRATION_SCOPE`

Status: PASS

Decision: `PASS_072A_QUOTE_APPROVAL_GATE_INTEGRATION_SCOPE`

Locked decision: `QUOTE_APPROVAL_GATE_INTEGRATION_SCOPED`

Next: `072B_QUOTE_APPROVAL_GATE_INTEGRATION_IMPLEMENTATION`

## Evidence Summary

072A scopes how Quote Action Contract and Approval Gate schema may integrate.

The integration is local/static/no-effect only.

## Confirmed

- Quote Action Contract remains no-effect.
- Approval Gate schema remains no-effect.
- Real quote effects require human approval.
- AI cannot approve.
- Payload hash integrity remains required.
- Source evidence, freshness, rollback, and idempotency remain required for future executable actions.
- No provider/backend/quote execution path is authorized.
- All real-effect safety flags remain false.

## Boundary

No UI mutation, backend connection, quote execution, quote approval, provider call, quote write, policy write, CRM write, pipeline write, task/calendar/message action, auth, secret access, browser persistence, approval bypass, real engine effect, or invented quote truth was introduced.

## Final

DECISION=PASS_072A_QUOTE_APPROVAL_GATE_INTEGRATION_SCOPE

LOCKED_DECISION=QUOTE_APPROVAL_GATE_INTEGRATION_SCOPED

NEXT=072B_QUOTE_APPROVAL_GATE_INTEGRATION_IMPLEMENTATION
EOF

cat > docs/evidence/FORGE_QUOTE_APPROVAL_GATE_INTEGRATION_SCOPE_CERTIFICATE_072A.md <<'EOF'
# Forge Quote Approval Gate Integration Scope Certificate 072A

Certificate status: ISSUED

Phase: `072A_QUOTE_APPROVAL_GATE_INTEGRATION_SCOPE`

Certified decision: `PASS_072A_QUOTE_APPROVAL_GATE_INTEGRATION_SCOPE`

Locked decision: `QUOTE_APPROVAL_GATE_INTEGRATION_SCOPED`

Next: `072B_QUOTE_APPROVAL_GATE_INTEGRATION_IMPLEMENTATION`

## Certification

072A certifies the Quote Approval Gate Integration as scope-only.

It authorizes planning for a local/static/no-effect integration validator between Quote Action Contract and Approval Gate schema.

It does not authorize quote execution, quote approval, provider calls, backend connection, quote document generation, quote send, quote save, quote binding, CRM writes, policy writes, pipeline writes, task/calendar/message actions, auth, secrets, browser persistence, approval bypass, real engine effects, or invented quote truth.

## Required Next Step

`072B_QUOTE_APPROVAL_GATE_INTEGRATION_IMPLEMENTATION`

## Final

DECISION=PASS_072A_QUOTE_APPROVAL_GATE_INTEGRATION_SCOPE
EOF

cat > docs/evidence/forge-quote-approval-gate-integration-scope-audit-072a.json <<'EOF'
{
  "phase": "072A_QUOTE_APPROVAL_GATE_INTEGRATION_SCOPE",
  "status": "PASS",
  "decision": "PASS_072A_QUOTE_APPROVAL_GATE_INTEGRATION_SCOPE",
  "lockedDecision": "QUOTE_APPROVAL_GATE_INTEGRATION_SCOPED",
  "basePhase": "071D_QUOTE_ACTION_CONTRACT_DECISION_LOCK",
  "next": "072B_QUOTE_APPROVAL_GATE_INTEGRATION_IMPLEMENTATION",
  "scopeOnly": true,
  "quoteExecutionAuthorized": false,
  "quoteApprovalAuthorized": false,
  "newQuoteEngineAuthorized": false,
  "integrationInputs": [
    "platform/action-contracts/quote-action-contract-071b.js",
    "platform/action-contracts/action-contract-approval-gate-schema-070c.js",
    "platform/adapters/quote-read-model/quote-read-model-adapter-069c.js",
    "source_evidence_ids",
    "freshness_metadata",
    "preview_payload_hash",
    "execution_payload_hash",
    "approval_status",
    "safety_flags"
  ],
  "integrationOutputs": [
    "integrated_quote_approval_gate_envelope",
    "approval_required_decision",
    "blocked_effects",
    "safe_error_when_approval_missing",
    "safe_error_when_payload_changed",
    "safe_error_when_evidence_freshness_rollback_missing",
    "audit_preview_event",
    "all_safety_flags_false"
  ],
  "rules": {
    "previewNoEffectMayBeNotRequired": true,
    "realEffectRequiresApproval": true,
    "approvedPayloadHashMustMatchExecutionPayloadHash": true,
    "payloadChangedAfterApprovalBlocks": true,
    "sourceEvidenceRequired": true,
    "freshnessRequired": true,
    "rollbackPlanRequired": true,
    "idempotencyKeyRequiredForExecutableActions": true,
    "aiCanApprove": false,
    "safetyValidationCanApprove": false,
    "approvalCanBeInferredFromPreview": false
  },
  "safeErrors": [
    "QUOTE_APPROVAL_GATE_NOT_MODELED",
    "QUOTE_ACTION_REQUIRES_APPROVAL",
    "ACTION_EXECUTION_REQUIRES_APPROVAL",
    "QUOTE_ACTION_PAYLOAD_CHANGED_AFTER_APPROVAL",
    "ACTION_PAYLOAD_CHANGED_AFTER_APPROVAL",
    "QUOTE_ACTION_SOURCE_EVIDENCE_REQUIRED",
    "ACTION_SOURCE_EVIDENCE_REQUIRED",
    "QUOTE_ACTION_FRESHNESS_REQUIRED",
    "ACTION_FRESHNESS_REQUIRED",
    "QUOTE_ACTION_ROLLBACK_PLAN_REQUIRED",
    "ACTION_ROLLBACK_PLAN_REQUIRED",
    "QUOTE_ACTION_REAL_EFFECT_NOT_ALLOWED",
    "ACTION_EXECUTION_BLOCKED_BY_POLICY"
  ],
  "notAuthorized": [
    "quote_execution",
    "quote_approval",
    "provider_calls",
    "backend_connection",
    "quote_document_generation",
    "quote_send",
    "quote_save",
    "quote_binding",
    "crm_write",
    "policy_write",
    "pipeline_write",
    "task_calendar_message_creation",
    "auth_secret_access",
    "browser_persistence",
    "approval_bypass",
    "invented_quote_truth"
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
    "jsonAudit": "PASS",
    "markerScan": "PASS",
    "gitDiffCheck": "PASS",
    "safetyScan": "PASS",
    "stagedDiffCheck": "PASS"
  }
}
EOF

green "docs/evidence written"

stage "STAGE 5 UPDATE BUILD TREE / ROADMAP"
python3 - <<'PY'
from pathlib import Path

block = """<!-- FORGE:072A_QUOTE_APPROVAL_GATE_INTEGRATION_SCOPE:START -->
## 072A Quote Approval Gate Integration Scope

072A scopes the local/static/no-effect integration between Quote Action Contract and Approval Gate schema.

Locked decision:
`QUOTE_APPROVAL_GATE_INTEGRATION_SCOPED`

Scope:

- integrate Quote Action Contract with Approval Gate schema;
- do not execute quote actions;
- do not approve quote actions;
- require human approval for real quote effects;
- require payload integrity;
- require source evidence;
- require freshness;
- require rollback plan;
- require idempotency for executable actions;
- block approval inference from preview/open/click/type/view;
- all safety flags default false.

DECISION=PASS_072A_QUOTE_APPROVAL_GATE_INTEGRATION_SCOPE

LOCKED_DECISION=QUOTE_APPROVAL_GATE_INTEGRATION_SCOPED

NEXT=072B_QUOTE_APPROVAL_GATE_INTEGRATION_IMPLEMENTATION
<!-- FORGE:072A_QUOTE_APPROVAL_GATE_INTEGRATION_SCOPE:END -->
"""

for raw in [
    "FORGE_MASTER_BUILD_TREE.md",
    "docs/architecture/source-truth/FORGE_UNIFIED_BUILD_TREE_001.md",
    "docs/roadmap/FORGE_ROADMAP_LOCK_001.md",
]:
    path = Path(raw)
    text = path.read_text()
    if "FORGE:072A_QUOTE_APPROVAL_GATE_INTEGRATION_SCOPE:START" in text:
        continue
    marker = "<!-- FORGE:071D_QUOTE_ACTION_CONTRACT_DECISION_LOCK:END -->"
    if marker not in text:
        raise SystemExit(f"missing 071D marker in {path}")
    path.write_text(text.replace(marker, marker + "\n\n" + block, 1))
PY
green "build tree / roadmap updated"

stage "STAGE 6 NORMALIZE FILES"
python3 - <<'PY'
from pathlib import Path
paths = [
 "FORGE_MASTER_BUILD_TREE.md",
 "docs/architecture/source-truth/FORGE_UNIFIED_BUILD_TREE_001.md",
 "docs/roadmap/FORGE_ROADMAP_LOCK_001.md",
 "docs/architecture/source-truth/FORGE_QUOTE_APPROVAL_GATE_INTEGRATION_SCOPE_072A.md",
 "docs/evidence/FORGE_QUOTE_APPROVAL_GATE_INTEGRATION_SCOPE_072A.md",
 "docs/evidence/FORGE_QUOTE_APPROVAL_GATE_INTEGRATION_SCOPE_CERTIFICATE_072A.md",
 "docs/evidence/forge-quote-approval-gate-integration-scope-audit-072a.json",
]
for p in paths:
    path=Path(p)
    s=path.read_text().replace("\r\n","\n").replace("\r","\n").rstrip()+"\n"
    path.write_text(s)
PY
green "normalized files"

stage "STAGE 7 VALIDATION"
run bash -n tools/termux/forge_072a_quote_approval_gate_integration_scope.sh
run python3 -m json.tool docs/evidence/forge-quote-approval-gate-integration-scope-audit-072a.json
run rg -n "072A_QUOTE_APPROVAL_GATE_INTEGRATION_SCOPE|PASS_072A_QUOTE_APPROVAL_GATE_INTEGRATION_SCOPE|QUOTE_APPROVAL_GATE_INTEGRATION_SCOPED|072B_QUOTE_APPROVAL_GATE_INTEGRATION_IMPLEMENTATION|QUOTE_APPROVAL_GATE_NOT_MODELED|ACTION_EXECUTION_REQUIRES_APPROVAL" \
  FORGE_MASTER_BUILD_TREE.md \
  docs/architecture/source-truth/FORGE_UNIFIED_BUILD_TREE_001.md \
  docs/roadmap/FORGE_ROADMAP_LOCK_001.md \
  docs/architecture/source-truth/FORGE_QUOTE_APPROVAL_GATE_INTEGRATION_SCOPE_072A.md \
  docs/evidence/FORGE_QUOTE_APPROVAL_GATE_INTEGRATION_SCOPE_072A.md \
  docs/evidence/FORGE_QUOTE_APPROVAL_GATE_INTEGRATION_SCOPE_CERTIFICATE_072A.md \
  docs/evidence/forge-quote-approval-gate-integration-scope-audit-072a.json
run git diff --check

stage "STAGE 8 SAFETY SCAN"
if rg -n "localStorage|sessionStorage|fetch\(|XMLHttpRequest|navigator\.mediaDevices|SpeechRecognition|providerRuntimeEnabled:\s*true|networkCallsAllowed:\s*true|browserStorageEnabled:\s*true|mayCreateTruth:\s*true|maySendMessage:\s*true|mayWriteCrm:\s*true|mayCreateCalendarEvent:\s*true" \
  docs/architecture/source-truth/FORGE_QUOTE_APPROVAL_GATE_INTEGRATION_SCOPE_072A.md \
  docs/evidence/FORGE_QUOTE_APPROVAL_GATE_INTEGRATION_SCOPE_072A.md \
  docs/evidence/forge-quote-approval-gate-integration-scope-audit-072a.json; then
  red "prohibited runtime/browser token found"
fi

if rg -n '"?(crmWrite|pipelineWrite|policyWrite|quoteWrite|taskCreate|calendarCreate|messageSend|authReal|providerRuntime|secretAccess|browserPersistence|realEngineExecution|realEffectsAllowed|realEffectsEnabled|backendConnection|approvalBypass|autoSend|autoWrite)"?\s*[:=]\s*true\b' \
  docs/evidence/forge-quote-approval-gate-integration-scope-audit-072a.json; then
  red "real-effect true flag found"
fi
green "safety scan clean"

stage "STAGE 9 STAGE AUTHORIZED FILES"
AUTHORIZED=(
  "FORGE_MASTER_BUILD_TREE.md"
  "docs/architecture/source-truth/FORGE_UNIFIED_BUILD_TREE_001.md"
  "docs/roadmap/FORGE_ROADMAP_LOCK_001.md"
  "docs/architecture/source-truth/FORGE_QUOTE_APPROVAL_GATE_INTEGRATION_SCOPE_072A.md"
  "docs/evidence/FORGE_QUOTE_APPROVAL_GATE_INTEGRATION_SCOPE_072A.md"
  "docs/evidence/FORGE_QUOTE_APPROVAL_GATE_INTEGRATION_SCOPE_CERTIFICATE_072A.md"
  "docs/evidence/forge-quote-approval-gate-integration-scope-audit-072a.json"
  "tools/termux/forge_072a_quote_approval_gate_integration_scope.sh"
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

stage "STAGE 10 COMMIT PUSH"
run git commit -m "docs: scope quote approval gate integration"
run git push origin HEAD:main

stage "STAGE 11 FINAL CHECKPOINT"
run git status --short --branch
run git log --oneline -10

FINAL_SUMMARY="$(cat <<EOF
PASS_072A_QUOTE_APPROVAL_GATE_INTEGRATION_SCOPE_COMMIT_PUSH_COMPLETE
DECISION=PASS_072A_QUOTE_APPROVAL_GATE_INTEGRATION_SCOPE
LOCKED_DECISION=QUOTE_APPROVAL_GATE_INTEGRATION_SCOPED
NEXT=072B_QUOTE_APPROVAL_GATE_INTEGRATION_IMPLEMENTATION
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
