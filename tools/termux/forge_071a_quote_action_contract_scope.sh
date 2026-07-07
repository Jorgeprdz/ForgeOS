#!/usr/bin/env bash
set -euo pipefail

PHASE="071A_QUOTE_ACTION_CONTRACT_SCOPE"
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
  echo "BOUNDARY=no UI mutation; no backend real; no quote execution; no CRM/policy/quote/pipeline/task/calendar/message writes; no provider/auth/secrets/browser/real engine"
  echo "REPORT=$REPORT"
  echo "ROBOCOP_GATE=Article 0; 070E locked schema; quote action contract scope only"
} | tee -a "$REPORT"

stage "STAGE 1 CHECKPOINT"
run git status --short --branch
run git log --oneline -10
run git diff --name-status
run git diff --cached --name-status

stage "STAGE 2 VERIFY 070E"
if [ -f docs/evidence/forge-action-contract-approval-gate-schema-decision-audit-070e.json ] && \
python3 - <<'PY'
import json
p='docs/evidence/forge-action-contract-approval-gate-schema-decision-audit-070e.json'
d=json.load(open(p))
assert d.get('phase') == '070E_ACTION_CONTRACT_APPROVAL_GATE_SCHEMA_DECISION_LOCK'
assert d.get('decision') == 'PASS_070E_ACTION_CONTRACT_APPROVAL_GATE_SCHEMA_DECISION_LOCK'
assert d.get('lockedDecision') == 'ACTION_CONTRACT_APPROVAL_GATE_SCHEMA_LOCKED_AS_LOCAL_STATIC_NO_EFFECT_SCHEMA'
assert d.get('next') == '071A_QUOTE_ACTION_CONTRACT_SCOPE'
assert d.get('schemaCanExecuteActions') is False
assert d.get('schemaCanApproveActions') is False
assert d.get('schemaCanBypassApproval') is False
assert all(v is False for v in d.get('safetyFlags', {}).values())
PY
then
  green "070E audit confirmed"
else
  red "070E audit not confirmed"
fi

REQUIRED=(
  "FORGE_MASTER_BUILD_TREE.md"
  "docs/architecture/source-truth/FORGE_UNIFIED_BUILD_TREE_001.md"
  "docs/roadmap/FORGE_ROADMAP_LOCK_001.md"
  "docs/evidence/forge-action-contract-approval-gate-schema-decision-audit-070e.json"
  "platform/action-contracts/action-contract-approval-gate-schema-070c.js"
  "tests/action-contract-approval-gate-schema-070c-test.js"
)
for f in "${REQUIRED[@]}"; do
  [ -f "$f" ] || red "missing required file: $f"
  green "$f"
done

stage "STAGE 3 BACKUP"
BACKUP=".forge-backups/071a-quote-action-contract-scope-$(date +%Y%m%d_%H%M%S)"
mkdir -p "$BACKUP"
cp FORGE_MASTER_BUILD_TREE.md "$BACKUP/"
cp docs/architecture/source-truth/FORGE_UNIFIED_BUILD_TREE_001.md "$BACKUP/"
cp docs/roadmap/FORGE_ROADMAP_LOCK_001.md "$BACKUP/"
green "backup created: $BACKUP"

stage "STAGE 4 WRITE DOCS / EVIDENCE"
mkdir -p docs/architecture/source-truth docs/evidence

cat > docs/architecture/source-truth/FORGE_QUOTE_ACTION_CONTRACT_SCOPE_071A.md <<'EOF'
# Forge Quote Action Contract Scope 071A

Phase: `071A_QUOTE_ACTION_CONTRACT_SCOPE`

Decision: `PASS_071A_QUOTE_ACTION_CONTRACT_SCOPE`

Locked decision: `QUOTE_ACTION_CONTRACT_SCOPED`

Next: `071B_QUOTE_ACTION_CONTRACT_IMPLEMENTATION`

## Purpose

071A scopes the Quote Action Contract lane after the Quote Read Model and Approval Gate schema were locked.

This phase does not create a new quote engine.

The existing quote engine and quote read model remain the source candidates for preview-safe quote data. The Quote Action Contract defines how future quote actions must be represented before any prepare, generate, save, send, or conversion path can be implemented.

## Required Separation

### Existing Quote Engine

Existing quote engines remain candidate execution or parsing engines. They must not be replaced by a new quote engine in this lane.

Known candidate source:

- `gmm-quote-summary-engine.js`
- `platform/adapters/quote-read-model/quote-read-model-adapter-069c.js`

### Quote Read Model

Quote Read Model remains read-only and preview-safe.

It can expose quote candidates, source evidence, freshness, blocked effects, and preview values.

It cannot send, save, approve, bind, or issue quotes.

### Quote Action Contract

Quote Action Contract is the envelope that future quote actions must satisfy.

It must describe:

- action identity;
- action family;
- domain;
- actor;
- target reference;
- input payload;
- preview payload;
- execution payload;
- payload hashes;
- required capabilities;
- required approval;
- approval status;
- approval gate;
- source evidence;
- freshness;
- blocked effects;
- safety flags;
- rollback plan;
- idempotency key;
- safe errors.

### Approval Gate

Approval Gate is required before any real quote effect.

Human approval is required for quote document generation, quote persistence, quote send, CRM write, policy write, pipeline write, provider call, backend write, or external state change.

## Scoped Quote Action Families

Allowed no-effect preview families:

- `quote.prepare_preview`
- `quote.generate_document_preview`
- `quote.validate_preview`
- `quote.compare_preview`
- `quote.blocked_effects_preview`

Approval-required families:

- `quote.prepare`
- `quote.generate_document`
- `quote.save`
- `quote.send`
- `quote.convert_to_policy`
- `quote.attach_to_opportunity`
- `quote.write_to_crm`
- `quote.provider_submit`

## Required Safe Errors

- `QUOTE_ACTION_CONTRACT_NOT_MODELED`
- `QUOTE_ACTION_REQUIRES_APPROVAL`
- `QUOTE_ACTION_PAYLOAD_CHANGED_AFTER_APPROVAL`
- `QUOTE_ACTION_SOURCE_EVIDENCE_REQUIRED`
- `QUOTE_ACTION_FRESHNESS_REQUIRED`
- `QUOTE_ACTION_ROLLBACK_PLAN_REQUIRED`
- `QUOTE_ACTION_CAPABILITY_NOT_GRANTED`
- `QUOTE_ACTION_BLOCKED_BY_POLICY`
- `QUOTE_ACTION_PROVIDER_NOT_AUTHORIZED`
- `QUOTE_ACTION_REAL_EFFECT_NOT_ALLOWED`

## Required Safety Defaults

All safety flags must default to false:

- `crmWrite`
- `pipelineWrite`
- `policyWrite`
- `quoteWrite`
- `taskCreate`
- `calendarCreate`
- `messageSend`
- `authReal`
- `providerRuntime`
- `secretAccess`
- `browserPersistence`
- `realEngineExecution`
- `realEffectsAllowed`
- `realEffectsEnabled`
- `backendConnection`
- `approvalBypass`
- `autoSend`
- `autoWrite`

## Not Authorized

071A does not authorize:

- new quote engine creation;
- quote execution;
- provider calls;
- PDF/proposal generation;
- quote send;
- quote save;
- quote binding;
- policy issuance;
- CRM write;
- pipeline write;
- task/calendar/message creation;
- backend connection;
- auth or secret access;
- browser persistence;
- approval bypass;
- invented premium, coverage, carrier, or quote truth.

## Implementation Readiness

071B may implement only a local/static/no-effect Quote Action Contract builder and validator.

071B must not execute quote actions.

071B must not call the quote engine for real effects.

071B must not call providers or backend services.

## Final

DECISION=PASS_071A_QUOTE_ACTION_CONTRACT_SCOPE

LOCKED_DECISION=QUOTE_ACTION_CONTRACT_SCOPED

NEXT=071B_QUOTE_ACTION_CONTRACT_IMPLEMENTATION
EOF

cat > docs/evidence/FORGE_QUOTE_ACTION_CONTRACT_SCOPE_071A.md <<'EOF'
# Forge Quote Action Contract Scope Evidence 071A

Phase: `071A_QUOTE_ACTION_CONTRACT_SCOPE`

Status: PASS

Decision: `PASS_071A_QUOTE_ACTION_CONTRACT_SCOPE`

Locked decision: `QUOTE_ACTION_CONTRACT_SCOPED`

Next: `071B_QUOTE_ACTION_CONTRACT_IMPLEMENTATION`

## Evidence Summary

071A scopes the Quote Action Contract after the Quote Read Model and Approval Gate schema locks.

The scope preserves the existing quote engine path. It does not create a new quote engine.

## Confirmed

- Existing quote engine and quote read model remain candidate sources.
- Quote Read Model remains read-only.
- Quote Action Contract is an envelope for future quote actions.
- Approval Gate remains required before real quote effects.
- Preview action families are no-effect only.
- Real quote actions require approval, capabilities, evidence, freshness, idempotency, payload integrity, rollback, and audit.
- All real-effect safety flags default false.

## Boundary

071A introduced no implementation, no quote execution, no UI mutation, no backend connection, no provider call, no auth, no secret access, no browser persistence, no quote write, no policy write, no CRM write, no pipeline write, no task/calendar/message action, no approval bypass, and no invented quote truth.

## Final

DECISION=PASS_071A_QUOTE_ACTION_CONTRACT_SCOPE

LOCKED_DECISION=QUOTE_ACTION_CONTRACT_SCOPED

NEXT=071B_QUOTE_ACTION_CONTRACT_IMPLEMENTATION
EOF

cat > docs/evidence/FORGE_QUOTE_ACTION_CONTRACT_SCOPE_CERTIFICATE_071A.md <<'EOF'
# Forge Quote Action Contract Scope Certificate 071A

Certificate status: ISSUED

Phase: `071A_QUOTE_ACTION_CONTRACT_SCOPE`

Certified decision: `PASS_071A_QUOTE_ACTION_CONTRACT_SCOPE`

Locked decision: `QUOTE_ACTION_CONTRACT_SCOPED`

Next: `071B_QUOTE_ACTION_CONTRACT_IMPLEMENTATION`

## Certification

071A certifies the Quote Action Contract lane as scope-only.

It authorizes planning for local/static/no-effect action contract implementation.

It does not authorize new quote engine creation, quote execution, provider calls, quote document generation, quote send, quote save, quote binding, CRM write, policy write, pipeline write, backend connection, auth, secrets, browser persistence, approval bypass, or invented quote truth.

## Required Next Step

`071B_QUOTE_ACTION_CONTRACT_IMPLEMENTATION`

## Final

DECISION=PASS_071A_QUOTE_ACTION_CONTRACT_SCOPE
EOF

cat > docs/evidence/forge-quote-action-contract-scope-audit-071a.json <<'EOF'
{
  "phase": "071A_QUOTE_ACTION_CONTRACT_SCOPE",
  "status": "PASS",
  "decision": "PASS_071A_QUOTE_ACTION_CONTRACT_SCOPE",
  "lockedDecision": "QUOTE_ACTION_CONTRACT_SCOPED",
  "basePhase": "070E_ACTION_CONTRACT_APPROVAL_GATE_SCHEMA_DECISION_LOCK",
  "next": "071B_QUOTE_ACTION_CONTRACT_IMPLEMENTATION",
  "scopeOnly": true,
  "newQuoteEngineAuthorized": false,
  "quoteExecutionAuthorized": false,
  "existingQuoteEngineCandidate": "gmm-quote-summary-engine.js",
  "quoteReadModelCandidate": "platform/adapters/quote-read-model/quote-read-model-adapter-069c.js",
  "schemas": {
    "actionContract": "forge.action_contract.v1",
    "approvalGate": "forge.approval_gate.v1"
  },
  "noEffectPreviewFamilies": [
    "quote.prepare_preview",
    "quote.generate_document_preview",
    "quote.validate_preview",
    "quote.compare_preview",
    "quote.blocked_effects_preview"
  ],
  "approvalRequiredFamilies": [
    "quote.prepare",
    "quote.generate_document",
    "quote.save",
    "quote.send",
    "quote.convert_to_policy",
    "quote.attach_to_opportunity",
    "quote.write_to_crm",
    "quote.provider_submit"
  ],
  "requiredContractFields": [
    "action_id",
    "action_type",
    "action_family",
    "domain",
    "actor",
    "target_ref",
    "input_payload",
    "preview_payload",
    "execution_payload",
    "payload_hash",
    "preview_hash",
    "required_capabilities",
    "required_approval",
    "approval_status",
    "approval_gate",
    "allowed_without_approval",
    "blocked_effects",
    "safety_flags",
    "source_evidence_ids",
    "freshness_metadata",
    "audit_events",
    "rollback_plan",
    "idempotency_key",
    "execution_result",
    "error_model"
  ],
  "safeErrors": [
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
  "notAuthorized": [
    "new_quote_engine",
    "quote_execution",
    "provider_call",
    "pdf_proposal_generation",
    "quote_send",
    "quote_save",
    "quote_binding",
    "policy_issuance",
    "crm_write",
    "pipeline_write",
    "task_calendar_message_creation",
    "backend_connection",
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

block = """<!-- FORGE:071A_QUOTE_ACTION_CONTRACT_SCOPE:START -->
## 071A Quote Action Contract Scope

071A scopes the Quote Action Contract lane after Quote Read Model and Approval Gate schema locks.

Locked decision:
`QUOTE_ACTION_CONTRACT_SCOPED`

Scope:

- do not create a new quote engine;
- use existing quote engine/read model as candidate source;
- define no-effect preview action families;
- define approval-required real-effect action families;
- require action contract schema `forge.action_contract.v1`;
- require approval gate schema `forge.approval_gate.v1`;
- require source evidence, freshness, payload integrity, idempotency, rollback, audit, and approval for real effects;
- all safety flags default false.

DECISION=PASS_071A_QUOTE_ACTION_CONTRACT_SCOPE

LOCKED_DECISION=QUOTE_ACTION_CONTRACT_SCOPED

NEXT=071B_QUOTE_ACTION_CONTRACT_IMPLEMENTATION
<!-- FORGE:071A_QUOTE_ACTION_CONTRACT_SCOPE:END -->
"""

for raw in [
    "FORGE_MASTER_BUILD_TREE.md",
    "docs/architecture/source-truth/FORGE_UNIFIED_BUILD_TREE_001.md",
    "docs/roadmap/FORGE_ROADMAP_LOCK_001.md",
]:
    path = Path(raw)
    text = path.read_text()
    if "FORGE:071A_QUOTE_ACTION_CONTRACT_SCOPE:START" in text:
        continue
    marker = "<!-- FORGE:070E_ACTION_CONTRACT_APPROVAL_GATE_SCHEMA_DECISION_LOCK:END -->"
    if marker not in text:
        raise SystemExit(f"missing 070E marker in {path}")
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
 "docs/architecture/source-truth/FORGE_QUOTE_ACTION_CONTRACT_SCOPE_071A.md",
 "docs/evidence/FORGE_QUOTE_ACTION_CONTRACT_SCOPE_071A.md",
 "docs/evidence/FORGE_QUOTE_ACTION_CONTRACT_SCOPE_CERTIFICATE_071A.md",
 "docs/evidence/forge-quote-action-contract-scope-audit-071a.json",
]
for p in paths:
    path=Path(p)
    s=path.read_text().replace("\r\n","\n").replace("\r","\n").rstrip()+"\n"
    path.write_text(s)
PY
green "normalized files"

stage "STAGE 7 VALIDATION"
run bash -n tools/termux/forge_071a_quote_action_contract_scope.sh
run python3 -m json.tool docs/evidence/forge-quote-action-contract-scope-audit-071a.json
run rg -n "071A_QUOTE_ACTION_CONTRACT_SCOPE|PASS_071A_QUOTE_ACTION_CONTRACT_SCOPE|QUOTE_ACTION_CONTRACT_SCOPED|071B_QUOTE_ACTION_CONTRACT_IMPLEMENTATION|forge\.action_contract\.v1|forge\.approval_gate\.v1|QUOTE_ACTION_REQUIRES_APPROVAL" \
  FORGE_MASTER_BUILD_TREE.md \
  docs/architecture/source-truth/FORGE_UNIFIED_BUILD_TREE_001.md \
  docs/roadmap/FORGE_ROADMAP_LOCK_001.md \
  docs/architecture/source-truth/FORGE_QUOTE_ACTION_CONTRACT_SCOPE_071A.md \
  docs/evidence/FORGE_QUOTE_ACTION_CONTRACT_SCOPE_071A.md \
  docs/evidence/FORGE_QUOTE_ACTION_CONTRACT_SCOPE_CERTIFICATE_071A.md \
  docs/evidence/forge-quote-action-contract-scope-audit-071a.json
run git diff --check

stage "STAGE 8 SAFETY SCAN"
if rg -n "localStorage|sessionStorage|fetch\(|XMLHttpRequest|navigator\.mediaDevices|SpeechRecognition|providerRuntimeEnabled:\s*true|networkCallsAllowed:\s*true|browserStorageEnabled:\s*true|mayCreateTruth:\s*true|maySendMessage:\s*true|mayWriteCrm:\s*true|mayCreateCalendarEvent:\s*true" \
  docs/architecture/source-truth/FORGE_QUOTE_ACTION_CONTRACT_SCOPE_071A.md \
  docs/evidence/FORGE_QUOTE_ACTION_CONTRACT_SCOPE_071A.md \
  docs/evidence/forge-quote-action-contract-scope-audit-071a.json; then
  red "prohibited runtime/browser token found"
fi

if rg -n '"?(crmWrite|pipelineWrite|policyWrite|quoteWrite|taskCreate|calendarCreate|messageSend|authReal|providerRuntime|secretAccess|browserPersistence|realEngineExecution|realEffectsAllowed|realEffectsEnabled|backendConnection|approvalBypass|autoSend|autoWrite)"?\s*[:=]\s*true\b' \
  docs/evidence/forge-quote-action-contract-scope-audit-071a.json; then
  red "real-effect true flag found"
fi
green "safety scan clean"

stage "STAGE 9 STAGE AUTHORIZED FILES"
AUTHORIZED=(
  "FORGE_MASTER_BUILD_TREE.md"
  "docs/architecture/source-truth/FORGE_UNIFIED_BUILD_TREE_001.md"
  "docs/roadmap/FORGE_ROADMAP_LOCK_001.md"
  "docs/architecture/source-truth/FORGE_QUOTE_ACTION_CONTRACT_SCOPE_071A.md"
  "docs/evidence/FORGE_QUOTE_ACTION_CONTRACT_SCOPE_071A.md"
  "docs/evidence/FORGE_QUOTE_ACTION_CONTRACT_SCOPE_CERTIFICATE_071A.md"
  "docs/evidence/forge-quote-action-contract-scope-audit-071a.json"
  "tools/termux/forge_071a_quote_action_contract_scope.sh"
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
run git commit -m "docs: scope quote action contract"
run git push origin HEAD:main

stage "STAGE 11 FINAL CHECKPOINT"
run git status --short --branch
run git log --oneline -10

FINAL_SUMMARY="$(cat <<EOF
PASS_071A_QUOTE_ACTION_CONTRACT_SCOPE_COMMIT_PUSH_COMPLETE
DECISION=PASS_071A_QUOTE_ACTION_CONTRACT_SCOPE
LOCKED_DECISION=QUOTE_ACTION_CONTRACT_SCOPED
NEXT=071B_QUOTE_ACTION_CONTRACT_IMPLEMENTATION
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
