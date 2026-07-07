#!/usr/bin/env bash
set -euo pipefail

PHASE="067A_OPPORTUNITY_PIPELINE_CANONICAL_SOURCE_MAPPING_SCOPE"
REPO="/storage/emulated/0/Forge OS"
REPORT="/data/data/com.termux/files/home/${PHASE}_RESULT_$(date +%Y%m%d_%H%M%S).md"
mkdir -p "$(dirname "$REPORT")"
exec > >(tee "$REPORT") 2>&1

CYAN="\033[1;36m"
GREEN="\033[1;38;5;46m"
YELLOW="\033[1;93m"
RED="\033[1;91m"
RESET="\033[0m"

say_stage() {
  printf "\n${CYAN}========== %s ==========${RESET}\n" "$1"
}

pass() {
  printf "${GREEN}PASS:${RESET} %s\n" "$1"
}

warn() {
  printf "${YELLOW}WARN:${RESET} %s\n" "$1"
}

autocopy_report() {
  sync || true
  sleep 0.2 || true
  if command -v termux-clipboard-set >/dev/null 2>&1; then
    termux-clipboard-set < "$REPORT" && pass "autocopy_report -> clipboard" || warn "autocopy_report failed"
  else
    warn "termux-clipboard-set not available; report not auto-copied"
  fi
}

hold() {
  printf "${YELLOW}HOLD:${RESET} %s\n\n" "$1"
  say_stage "HOLD"
  echo "$1"
  echo "BLOCKED BY ROBOCOP LOCK 001"
  echo "DECISION=HOLD_${PHASE}"
  echo "Reporte: $REPORT"
  autocopy_report
  exit 1
}

fail() {
  printf "${RED}NO PASS:${RESET} %s\n\n" "$1"
  say_stage "NO PASS"
  echo "$1"
  echo "DECISION=NO_PASS_${PHASE}"
  echo "Reporte: $REPORT"
  autocopy_report
  exit 1
}

run_cmd() {
  echo
  echo "========== RUN =========="
  printf '%q ' "$@"
  echo
  "$@"
}

require_file() {
  local file="$1"
  if [[ -f "$file" ]]; then
    pass "$file"
  else
    hold "missing required file: $file"
  fi
}

backup_if_present() {
  local file="$1"
  if [[ -e "$file" ]]; then
    mkdir -p "$BACKUP_DIR/$(dirname "$file")"
    cp -R "$file" "$BACKUP_DIR/$file"
    pass "backup $file"
  else
    pass "new file slot clear: $file"
  fi
}

norm() {
  python3 - "$1" <<'PY'
from pathlib import Path
import sys

p = Path(sys.argv[1])
text = p.read_text()
p.write_text("\n".join(line.rstrip() for line in text.splitlines()).rstrip() + "\n")
PY
}

append_block() {
  local file="$1" start="$2" end="$3" body="$4"
  python3 - "$file" "$start" "$end" "$body" <<'PY'
from pathlib import Path
import sys

p = Path(sys.argv[1])
start = sys.argv[2]
end = sys.argv[3]
body = sys.argv[4]
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

write_rollback() {
  local rollback="$BACKUP_DIR/rollback-067a.sh"
  cat > "$rollback" <<ROLLBACK
#!/usr/bin/env bash
set -euo pipefail
REPO="/storage/emulated/0/Forge OS"
BACKUP_DIR="$BACKUP_DIR"
cd "\$REPO"

restore_or_archive() {
  local file="\$1"
  local backup="\$BACKUP_DIR/\$file"
  if [[ -e "\$backup" ]]; then
    mkdir -p "\$(dirname "\$file")"
    cp -R "\$backup" "\$file"
    echo "restored \$file"
  elif [[ -e "\$file" ]]; then
    mkdir -p ".forge-backups/rollback-archives"
    local archive=".forge-backups/rollback-archives/\$(basename "\$file").067a.\$(date +%Y%m%d_%H%M%S)"
    mv "\$file" "\$archive"
    echo "archived created file \$file -> \$archive"
  fi
}

restore_or_archive "FORGE_MASTER_BUILD_TREE.md"
restore_or_archive "docs/architecture/source-truth/FORGE_UNIFIED_BUILD_TREE_001.md"
restore_or_archive "docs/roadmap/FORGE_ROADMAP_LOCK_001.md"
restore_or_archive "docs/architecture/source-truth/FORGE_OPPORTUNITY_PIPELINE_CANONICAL_SOURCE_MAPPING_SCOPE_067A.md"
restore_or_archive "docs/evidence/FORGE_OPPORTUNITY_PIPELINE_CANONICAL_SOURCE_MAPPING_SCOPE_067A.md"
restore_or_archive "docs/evidence/FORGE_OPPORTUNITY_PIPELINE_CANONICAL_SOURCE_MAPPING_SCOPE_CERTIFICATE_067A.md"
restore_or_archive "docs/evidence/forge-opportunity-pipeline-canonical-source-mapping-scope-audit-067a.json"
restore_or_archive "tools/termux/forge_067a_opportunity_pipeline_canonical_source_mapping_scope.sh"
echo "rollback 067A complete"
ROLLBACK
  chmod +x "$rollback"
  pass "rollback script created: $rollback"
}

allowed_paths=(
  "FORGE_MASTER_BUILD_TREE.md"
  "docs/architecture/source-truth/FORGE_UNIFIED_BUILD_TREE_001.md"
  "docs/roadmap/FORGE_ROADMAP_LOCK_001.md"
  "docs/architecture/source-truth/FORGE_OPPORTUNITY_PIPELINE_CANONICAL_SOURCE_MAPPING_SCOPE_067A.md"
  "docs/evidence/FORGE_OPPORTUNITY_PIPELINE_CANONICAL_SOURCE_MAPPING_SCOPE_067A.md"
  "docs/evidence/FORGE_OPPORTUNITY_PIPELINE_CANONICAL_SOURCE_MAPPING_SCOPE_CERTIFICATE_067A.md"
  "docs/evidence/forge-opportunity-pipeline-canonical-source-mapping-scope-audit-067a.json"
  "tools/termux/forge_067a_opportunity_pipeline_canonical_source_mapping_scope.sh"
)

say_stage "STAGE 0 HEADER"
printf "PHASE=%s\n" "$PHASE"
printf "MODE=docs/scope only canonical source mapping\n"
printf "BOUNDARY=no UI mutation; no backend real; no CRM write; no pipeline write; no task creation; no calendar creation; no send; no auth; no provider execution; no secret access; no browser persistence; no real engine execution\n"
printf "REPORT=%s\n" "$REPORT"
printf "ROBOCOP_GATE.Applicable_Constitution=Article 0; Decision Clarity First; Advisor-first; no invented truth; AI explains / Forge decides\n"
printf "ROBOCOP_GATE.Applicable_ADRs=066A; 066B; 066B1; 066C; 066D\n"
printf "ROBOCOP_GATE.Build_Tree_Area=Opportunity Pipeline / Canonical Source Mapping / Backend Read Model Transition\n"
printf "ROBOCOP_GATE.Discovery_Status=066D closed; 067A requested\n"
printf "ROBOCOP_GATE.Implementation_Readiness=docs-scope only; not implementation-ready for source replacement\n"
printf "ROBOCOP_GATE.Miranda_Approval=required through validation evidence\n"
printf "ROBOCOP_GATE.Board_Approval_Status=not assumed\n"
printf "ROBOCOP_GATE.Scope_Boundary=067A only\n"
printf "ROBOCOP_GATE.Prohibited_Surfaces=UI; backend connection; writes; provider runtime; auth; secrets; browser persistence; real engine execution\n"
printf "ROBOCOP_GATE.Validation_Expectation=json; markers; diff checks; safety scans; staged boundary\n"

say_stage "STAGE 1 CHECKPOINT"
cd "$REPO" || fail "repo not found: $REPO"
run_cmd git status --short --branch
run_cmd git log --oneline -10
run_cmd git diff --name-status
run_cmd git diff --cached --name-status

if ! git branch --show-current | rg -qx "main"; then
  hold "expected branch main"
fi
pass "branch main confirmed"

if git log -1 --oneline | rg -q "^5c37dd6 "; then
  pass "expected 066D commit observed at HEAD"
else
  warn "HEAD is not 5c37dd6; continuing only if 066D evidence validates"
fi

dirty_tracked="$(mktemp)"
allowed_tracked="$(mktemp)"
outside_dirty="$(mktemp)"
{ git diff --name-only; git diff --cached --name-only; } | sort -u > "$dirty_tracked"
printf "%s\n" "${allowed_paths[@]}" | sort -u > "$allowed_tracked"
if [[ -s "$dirty_tracked" ]]; then
  warn "tracked changes already present; checking they are limited to 067A authorized paths"
  if comm -23 "$dirty_tracked" "$allowed_tracked" > "$outside_dirty" && [[ -s "$outside_dirty" ]]; then
    cat "$outside_dirty"
    rm -f "$dirty_tracked" "$allowed_tracked" "$outside_dirty"
    hold "tracked worktree has changes outside 067A authorized paths"
  fi
  pass "pre-existing tracked changes are limited to 067A authorized paths"
fi
rm -f "$dirty_tracked" "$allowed_tracked" "$outside_dirty"

say_stage "STAGE 2 REQUIRED FILE CHECK"
if [[ -f AGENTS.md ]]; then
  pass "AGENTS.md present"
else
  warn "AGENTS.md not present; continuing because it is optional in this repo state"
fi

required_files=(
  "FORGE_MASTER_BUILD_TREE.md"
  "docs/architecture/source-truth/FORGE_UNIFIED_BUILD_TREE_001.md"
  "docs/roadmap/FORGE_ROADMAP_LOCK_001.md"
  "docs/architecture/source-truth/FORGE_OPPORTUNITY_PIPELINE_READ_ONLY_ADAPTER_DECISION_LOCK_066D.md"
  "docs/evidence/forge-opportunity-pipeline-read-only-adapter-decision-audit-066d.json"
  "docs/architecture/source-truth/FORGE_OPPORTUNITY_PIPELINE_EXISTING_MODULE_RECONCILIATION_066B1.md"
  "docs/evidence/forge-opportunity-pipeline-existing-module-reconciliation-audit-066b1.json"
  "platform/adapters/opportunity-pipeline/opportunity-pipeline-read-only-adapter-066b.js"
  "tests/opportunity-pipeline-read-only-adapter-066b-test.js"
)
for file in "${required_files[@]}"; do require_file "$file"; done

say_stage "STAGE 3 BACKUP"
BACKUP_DIR=".forge-backups/067a-opportunity-pipeline-canonical-source-mapping-scope-$(date +%Y%m%d_%H%M%S)"
mkdir -p "$BACKUP_DIR"
backup_targets=(
  "${required_files[@]}"
  "${allowed_paths[@]}"
)
for file in "${backup_targets[@]}"; do backup_if_present "$file"; done
write_rollback

say_stage "STAGE 4 VERIFY 066D / 066B1 INPUTS"
python3 - <<'PY067A_DISCOVERY'
import json
from pathlib import Path

def load_json(path):
    return json.loads(Path(path).read_text())

def walk_values(obj):
    if isinstance(obj, dict):
        for key, value in obj.items():
            yield key, value
            yield from walk_values(value)
    elif isinstance(obj, list):
        for value in obj:
            yield from walk_values(value)

def values_for_key(obj, wanted):
    return [value for key, value in walk_values(obj) if key == wanted]

def has_string(obj, expected):
    return any(value == expected for _, value in walk_values(obj) if isinstance(value, str))

def collect_true_markers(obj, prefix=""):
    risky = {
        "crmWrite", "pipelineWrite", "taskCreate", "calendarCreate",
        "messageSend", "authReal", "providerRuntime", "secretAccess",
        "browserPersistence", "realEngineExecution", "realEffectsAllowed",
        "realEffectsEnabled", "backendConnection",
    }
    hits = []
    if isinstance(obj, dict):
        for key, value in obj.items():
            path = f"{prefix}.{key}" if prefix else key
            if key in risky and value is True:
                hits.append(path)
            hits.extend(collect_true_markers(value, path))
    elif isinstance(obj, list):
        for index, value in enumerate(obj):
            hits.extend(collect_true_markers(value, f"{prefix}[{index}]"))
    return hits

audit_066d = load_json("docs/evidence/forge-opportunity-pipeline-read-only-adapter-decision-audit-066d.json")
audit_066b1 = load_json("docs/evidence/forge-opportunity-pipeline-existing-module-reconciliation-audit-066b1.json")

allowed_066d_decisions = {
    "OPPORTUNITY_PIPELINE_READ_ONLY_ADAPTER_LOCKED",
    "OPPORTUNITY_PIPELINE_READ_ONLY_ADAPTER_LOCKED_AS_TEMPORARY_LOCAL_STATIC_SHIM",
}
expected_reconciliation = "KEEP_066B_AS_TEMPORARY_LOCAL_STATIC_SHIM"

observed = {
    "066dTopLevelKeys": sorted(audit_066d.keys()),
    "066dPhase": audit_066d.get("phase"),
    "066dStatus": audit_066d.get("status"),
    "066dDecision": audit_066d.get("decision"),
    "066dLockedDecision": audit_066d.get("lockedDecision"),
    "066dReconciliationDecision": audit_066d.get("reconciliationDecision"),
    "066dAllDecisionValues": values_for_key(audit_066d, "decision"),
    "066b1TopLevelKeys": sorted(audit_066b1.keys()),
    "066b1Phase": audit_066b1.get("phase"),
    "066b1Status": audit_066b1.get("status"),
    "066b1Decision": audit_066b1.get("decision"),
    "066b1ReconciliationDecision": audit_066b1.get("reconciliationDecision"),
}
print("067A discovery observed:")
print(json.dumps(observed, indent=2, sort_keys=True))

errors = []

status_066d = audit_066d.get("status")
if not isinstance(status_066d, str) or not status_066d.startswith("PASS"):
    errors.append(f"066D status must start with PASS, got {status_066d!r}")

phase_066d = audit_066d.get("phase")
if phase_066d != "066D_OPPORTUNITY_PIPELINE_READ_ONLY_ADAPTER_DECISION_LOCK":
    errors.append(f"066D phase mismatch: {phase_066d!r}")

if not any(has_string(audit_066d, decision) for decision in allowed_066d_decisions):
    errors.append(f"066D must contain one allowed locked decision: {sorted(allowed_066d_decisions)}")

if not has_string(audit_066d, expected_reconciliation):
    errors.append(f"066D must preserve reconciliation decision {expected_reconciliation}")

status_066b1 = audit_066b1.get("status")
if not isinstance(status_066b1, str) or not status_066b1.startswith("PASS"):
    errors.append(f"066B1 status must start with PASS, got {status_066b1!r}")

phase_066b1 = audit_066b1.get("phase")
if phase_066b1 != "066B1_OPPORTUNITY_PIPELINE_EXISTING_MODULE_RECONCILIATION":
    errors.append(f"066B1 phase mismatch: {phase_066b1!r}")

if not has_string(audit_066b1, expected_reconciliation):
    errors.append(f"066B1 must contain reconciliation decision {expected_reconciliation}")

true_markers = collect_true_markers({"066D": audit_066d, "066B1": audit_066b1})
if true_markers:
    errors.append(f"real-effect markers must not be true: {true_markers}")

if errors:
    print("067A input discovery did not satisfy gate:")
    for error in errors:
        print(f"- {error}")
    raise SystemExit(1)

print(json.dumps({
    "status": "PASS",
    "066dDecisionAccepted": True,
    "reconciliationDecisionPreserved": expected_reconciliation,
    "next": "067A_OPPORTUNITY_PIPELINE_CANONICAL_SOURCE_MAPPING_SCOPE"
}, indent=2, sort_keys=True))
PY067A_DISCOVERY
pass "066D and 066B1 inputs verified after discovery"

say_stage "STAGE 5 WRITE DOCS / EVIDENCE"
mkdir -p tools/termux docs/architecture/source-truth docs/evidence
target_script="tools/termux/forge_067a_opportunity_pipeline_canonical_source_mapping_scope.sh"
source_script="$(readlink -f "$0" 2>/dev/null || printf "%s" "$0")"
target_script_abs="$(readlink -f "$target_script" 2>/dev/null || printf "%s" "$target_script")"
if [[ "$source_script" == "$target_script_abs" ]]; then
  pass "script already running from repo -> $target_script"
else
  cp "$0" "$target_script"
  pass "script copied into repo -> $target_script"
fi

cat > docs/architecture/source-truth/FORGE_OPPORTUNITY_PIPELINE_CANONICAL_SOURCE_MAPPING_SCOPE_067A.md <<'MD'
# Forge Opportunity Pipeline Canonical Source Mapping Scope 067A

Status: SCOPED

Phase:
`067A_OPPORTUNITY_PIPELINE_CANONICAL_SOURCE_MAPPING_SCOPE`

Decision:
`OPPORTUNITY_PIPELINE_CANONICAL_SOURCE_MAPPING_SCOPED`

Base:

- `066B_OPPORTUNITY_PIPELINE_READ_ONLY_ADAPTER_IMPLEMENTATION`
- `066B1_OPPORTUNITY_PIPELINE_EXISTING_MODULE_RECONCILIATION`
- `066C_OPPORTUNITY_PIPELINE_READ_ONLY_ADAPTER_QA_LOCK`
- `066D_OPPORTUNITY_PIPELINE_READ_ONLY_ADAPTER_DECISION_LOCK`

## Robocop Gate

Applicable Constitution:
Article 0, Decision Clarity First, Advisor-first, no invented truth, AI explains / Forge decides.

Applicable ADRs:
066A, 066B, 066B1, 066C, 066D.

Build Tree area:
Opportunity Pipeline / Canonical Source Mapping / Backend Read Model Transition.

Discovery status:
066D locked the Opportunity Pipeline adapter only as a temporary local/static/read-only shim.

Implementation readiness:
Not implementation-ready. 067A is docs/scope only.

Miranda approval:
Validation evidence required before PASS.

Board approval status:
Not assumed.

Scope boundary:
067A only.

Prohibited surfaces:
UI mutation, backend real, CRM write, pipeline write, task creation, calendar creation, message send, auth, provider execution, secret access, browser persistence, real engine execution.

Validation expectation:
JSON audit, required markers, diff checks, safety scans, and exact staged boundary.

## 1. Principal Source Candidate

Principal source candidate for the next step:

`relationship-opportunity-engine.js`

Reason:
The next safe move is to map relationship-derived opportunity signals into the locked 066B/066C/066D read-only adapter contract before attempting broader pipeline ownership. It is a source candidate, not a locked source of truth.

This does not replace 066B. It defines the first candidate mapping lane for 067B.

## 2. Module Roles

| Module | 067A Role | Boundary |
| --- | --- | --- |
| `relationship-opportunity-engine.js` | source of truth candidate for relationship-derived opportunity signals | Candidate only; must prove evidence, freshness, empty state, safe error, audit, and no-effect policy |
| `referral-opportunity-engine.js` | signal source and enrichment source | Useful for referral context, not full opportunity truth |
| `advisor-os/prospecting/prospect-pipeline-engine.js` | source of truth candidate for prospect pipeline state | Unsafe until ownership, stage semantics, and no-effect boundary are explicit |
| `advisor-os/discovery/opportunity-detector-engine.js` | signal source | Detection output cannot become opportunity fact without evidence and audit mapping |
| `rule-packs/smnyl/smnyl-opportunity-engine.js` | enrichment source and rules interpreter | Rules can enrich interpretation but must not create opportunity truth alone |
| `rule-packs/smnyl/smnyl-pipeline-engine.js` | enrichment source and stage policy interpreter | Stage policy can assist mapping but must not mutate stage |
| `manager-os/forge-alive/forge-alive-smart-widget-stack-read-model.js` | UI projection consumer | Must consume read models only; excluded from read-only source ownership |
| `pipeline-stage-engine.js` | stage taxonomy and enrichment source | Unsafe until stage ownership and mutation boundary are separated |

## 3. Required Read Model Field Mapping

| Read Model Field | Mapping Requirement |
| --- | --- |
| opportunity id | Stable canonical id or deterministic preview id with source evidence |
| client ref | `client_ref` with entity id and display-safe client linkage |
| display name | Human-readable opportunity title derived from evidence |
| stage | Read-only stage label from canonical stage ownership |
| status | Read-only state; must distinguish open, blocked, stale, closed, and not modeled |
| priority | Derived only from explicit source signal or rule output |
| probability | Allowed only as preview/estimate with evidence; never fact without source ownership |
| expected value preview | Preview-only monetary estimate with evidence; never real money truth |
| next action | Recommendation preview only; no task, calendar, or message creation |
| followup due state | Read-only due-state label with freshness metadata |
| risk flags | Evidence-backed risk flags only |
| policy summary refs | References only; no policy write or policy truth creation |
| quote summary refs | References only; no quote creation or quote truth creation |
| source evidence | Required evidence ids for every mapped fact |
| freshness | Required source freshness status and timestamp rules |
| audit event | Required `read_model_used` audit event |
| blocked effects | Required explicit blocked-effect list |
| safety flags | Required false flags for all real-effect surfaces |

## 4. Not Mappable Yet

067A does not allow mapping:

- real money without evidence;
- real premium without source truth;
- stage mutation;
- CRM write;
- task, calendar, or message action;
- provider/runtime execution;
- invented recommendations;
- forecast as fact;
- opportunity truth without source ownership;
- UI projection output as source truth.

## 5. Required Contract Before Implementation

Before implementing any canonical source adapter, Forge must define:

- canonical source ownership;
- source priority;
- input schema;
- output read model schema;
- freshness model;
- evidence model;
- error model;
- permission/capability model;
- no-effect adapter policy;
- audit event mapping;
- empty state rules.

## 6. Next Phase

Recommended next phase:

`067B_RELATIONSHIP_OPPORTUNITY_SIGNAL_ADAPTER_SCOPE`

Reason:
The relationship-opportunity lane is the safest first mapping lane. It lets Forge scope how a source candidate produces evidence-backed opportunity signals without claiming full pipeline source truth or replacing the 066B shim.

## Decision

DECISION=PASS_067A_OPPORTUNITY_PIPELINE_CANONICAL_SOURCE_MAPPING_SCOPE

LOCKED_DECISION=OPPORTUNITY_PIPELINE_CANONICAL_SOURCE_MAPPING_SCOPED

NEXT=067B_RELATIONSHIP_OPPORTUNITY_SIGNAL_ADAPTER_SCOPE
MD

cat > docs/evidence/FORGE_OPPORTUNITY_PIPELINE_CANONICAL_SOURCE_MAPPING_SCOPE_067A.md <<'MD'
# Forge Opportunity Pipeline Canonical Source Mapping Scope Evidence 067A

Phase:
`067A_OPPORTUNITY_PIPELINE_CANONICAL_SOURCE_MAPPING_SCOPE`

Status:
PASS

Decision:
`OPPORTUNITY_PIPELINE_CANONICAL_SOURCE_MAPPING_SCOPED`

## Evidence Summary

067A scopes how Opportunity Pipeline can map existing modules toward a future canonical read model without replacing 066B yet.

The locked 066D decision is preserved:

`OPPORTUNITY_PIPELINE_READ_ONLY_ADAPTER_LOCKED_AS_TEMPORARY_LOCAL_STATIC_SHIM`

067A confirms:

- `relationship-opportunity-engine.js` is the principal source candidate for the next scope;
- historical modules are classified by role;
- read model field mapping requirements are explicit;
- non-mappable fields and behaviors remain blocked;
- implementation prerequisites are defined;
- 067B should scope relationship opportunity signal mapping.

## Boundary

Docs/scope only. No UI mutation, backend connection, CRM write, pipeline write, task creation, calendar creation, message send, auth, provider execution, secret access, browser persistence, or real engine execution.

## Result

DECISION=PASS_067A_OPPORTUNITY_PIPELINE_CANONICAL_SOURCE_MAPPING_SCOPE

LOCKED_DECISION=OPPORTUNITY_PIPELINE_CANONICAL_SOURCE_MAPPING_SCOPED

NEXT=067B_RELATIONSHIP_OPPORTUNITY_SIGNAL_ADAPTER_SCOPE
MD

cat > docs/evidence/FORGE_OPPORTUNITY_PIPELINE_CANONICAL_SOURCE_MAPPING_SCOPE_CERTIFICATE_067A.md <<'MD'
# Forge Opportunity Pipeline Canonical Source Mapping Scope Certificate 067A

DECISION=PASS_067A_OPPORTUNITY_PIPELINE_CANONICAL_SOURCE_MAPPING_SCOPE

LOCKED_DECISION=OPPORTUNITY_PIPELINE_CANONICAL_SOURCE_MAPPING_SCOPED

NEXT=067B_RELATIONSHIP_OPPORTUNITY_SIGNAL_ADAPTER_SCOPE

Certified:

- docs/scope only;
- no UI mutation;
- no backend real;
- no CRM write;
- no pipeline write;
- no task creation;
- no calendar creation;
- no communication delivery;
- no auth implementation;
- no provider execution;
- no secret access;
- no browser persistence;
- no real engine execution.

066B remains a temporary local/static/read-only shim until canonical source mapping proves a replacement can satisfy the full locked adapter contract.
MD

cat > docs/evidence/forge-opportunity-pipeline-canonical-source-mapping-scope-audit-067a.json <<'JSON'
{
  "phase": "067A_OPPORTUNITY_PIPELINE_CANONICAL_SOURCE_MAPPING_SCOPE",
  "status": "PASS",
  "decision": "OPPORTUNITY_PIPELINE_CANONICAL_SOURCE_MAPPING_SCOPED",
  "basePhases": [
    "066B_OPPORTUNITY_PIPELINE_READ_ONLY_ADAPTER_IMPLEMENTATION",
    "066B1_OPPORTUNITY_PIPELINE_EXISTING_MODULE_RECONCILIATION",
    "066C_OPPORTUNITY_PIPELINE_READ_ONLY_ADAPTER_QA_LOCK",
    "066D_OPPORTUNITY_PIPELINE_READ_ONLY_ADAPTER_DECISION_LOCK"
  ],
  "lockedPriorDecision": "OPPORTUNITY_PIPELINE_READ_ONLY_ADAPTER_LOCKED_AS_TEMPORARY_LOCAL_STATIC_SHIM",
  "temporaryShimPreserved": true,
  "principalSourceCandidate": "relationship-opportunity-engine.js",
  "moduleRoles": [
    {
      "module": "relationship-opportunity-engine.js",
      "role": "source_of_truth_candidate",
      "boundary": "candidate_only_requires_evidence_freshness_audit_empty_state_safe_error_no_effect_policy"
    },
    {
      "module": "referral-opportunity-engine.js",
      "role": "signal_source_and_enrichment_source",
      "boundary": "referral_context_only_not_full_opportunity_truth"
    },
    {
      "module": "advisor-os/prospecting/prospect-pipeline-engine.js",
      "role": "source_of_truth_candidate_for_prospect_pipeline_state",
      "boundary": "unsafe_until_ownership_stage_semantics_and_no_effect_boundary_exist"
    },
    {
      "module": "advisor-os/discovery/opportunity-detector-engine.js",
      "role": "signal_source",
      "boundary": "detected_signal_cannot_become_fact_without_evidence_and_audit"
    },
    {
      "module": "rule-packs/smnyl/smnyl-opportunity-engine.js",
      "role": "enrichment_source_and_rules_interpreter",
      "boundary": "cannot_create_opportunity_truth_alone"
    },
    {
      "module": "rule-packs/smnyl/smnyl-pipeline-engine.js",
      "role": "enrichment_source_and_stage_policy_interpreter",
      "boundary": "cannot_mutate_stage"
    },
    {
      "module": "manager-os/forge-alive/forge-alive-smart-widget-stack-read-model.js",
      "role": "ui_projection_consumer",
      "boundary": "excluded_from_read_only_source_ownership"
    },
    {
      "module": "pipeline-stage-engine.js",
      "role": "stage_taxonomy_and_enrichment_source",
      "boundary": "unsafe_until_stage_ownership_and_mutation_boundary_are_separated"
    }
  ],
  "requiredFieldMappings": [
    "opportunity_id",
    "client_ref",
    "display_name",
    "stage",
    "status",
    "priority",
    "probability",
    "expected_value_preview",
    "next_action",
    "followup_due_state",
    "risk_flags",
    "policy_summary_refs",
    "quote_summary_refs",
    "source_evidence",
    "freshness",
    "audit_event",
    "blocked_effects",
    "safety_flags"
  ],
  "notMappableYet": [
    "real_money_without_evidence",
    "real_premium_without_source_truth",
    "stage_mutation",
    "crm_write",
    "task_calendar_message_action",
    "provider_runtime_execution",
    "invented_recommendations",
    "forecast_as_fact",
    "opportunity_truth_without_source_ownership"
  ],
  "requiredContractsBeforeImplementation": [
    "canonical_source_ownership",
    "source_priority",
    "input_schema",
    "output_read_model_schema",
    "freshness_model",
    "evidence_model",
    "error_model",
    "permission_capability_model",
    "no_effect_adapter_policy",
    "audit_event_mapping",
    "empty_state_rules"
  ],
  "uiMutation": false,
  "backendConnection": false,
  "crmWrite": false,
  "pipelineWrite": false,
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
  "next": "067B_RELATIONSHIP_OPPORTUNITY_SIGNAL_ADAPTER_SCOPE"
}
JSON
pass "wrote 067A scope docs and audit json"

say_stage "STAGE 6 UPDATE BUILD TREE / ROADMAP"
SYNC_BODY=$(cat <<'MD'
## 067A Opportunity Pipeline Canonical Source Mapping Scope

067A scopes how Opportunity Pipeline should map existing modules toward a future canonical read model without replacing the 066B temporary local/static/read-only shim.

Decision:
`OPPORTUNITY_PIPELINE_CANONICAL_SOURCE_MAPPING_SCOPED`

Principal source candidate for next scope:
`relationship-opportunity-engine.js`

Module roles:

- `relationship-opportunity-engine.js`: source of truth candidate for relationship-derived opportunity signals;
- `referral-opportunity-engine.js`: signal and enrichment source;
- `advisor-os/prospecting/prospect-pipeline-engine.js`: source candidate for prospect pipeline state, unsafe until ownership exists;
- `advisor-os/discovery/opportunity-detector-engine.js`: signal source;
- `rule-packs/smnyl/smnyl-opportunity-engine.js`: enrichment and rules interpreter;
- `rule-packs/smnyl/smnyl-pipeline-engine.js`: enrichment and stage policy interpreter;
- `manager-os/forge-alive/forge-alive-smart-widget-stack-read-model.js`: UI projection consumer, excluded from source ownership;
- `pipeline-stage-engine.js`: stage taxonomy/enrichment source, unsafe until mutation boundary is separated.

Required before implementation:
canonical source ownership, source priority, input schema, output read model schema, freshness model, evidence model, error model, permission/capability model, no-effect adapter policy, audit event mapping, and empty state rules.

DECISION=PASS_067A_OPPORTUNITY_PIPELINE_CANONICAL_SOURCE_MAPPING_SCOPE

LOCKED_DECISION=OPPORTUNITY_PIPELINE_CANONICAL_SOURCE_MAPPING_SCOPED

NEXT=067B_RELATIONSHIP_OPPORTUNITY_SIGNAL_ADAPTER_SCOPE
MD
)

append_block "FORGE_MASTER_BUILD_TREE.md" "<!-- FORGE:067A_OPPORTUNITY_PIPELINE_CANONICAL_SOURCE_MAPPING_SCOPE:START -->" "<!-- FORGE:067A_OPPORTUNITY_PIPELINE_CANONICAL_SOURCE_MAPPING_SCOPE:END -->" "$SYNC_BODY"
append_block "docs/architecture/source-truth/FORGE_UNIFIED_BUILD_TREE_001.md" "<!-- FORGE:067A_OPPORTUNITY_PIPELINE_CANONICAL_SOURCE_MAPPING_SCOPE:START -->" "<!-- FORGE:067A_OPPORTUNITY_PIPELINE_CANONICAL_SOURCE_MAPPING_SCOPE:END -->" "$SYNC_BODY"
append_block "docs/roadmap/FORGE_ROADMAP_LOCK_001.md" "<!-- FORGE:067A_OPPORTUNITY_PIPELINE_CANONICAL_SOURCE_MAPPING_SCOPE:START -->" "<!-- FORGE:067A_OPPORTUNITY_PIPELINE_CANONICAL_SOURCE_MAPPING_SCOPE:END -->" "$SYNC_BODY"
pass "updated build tree / roadmap sync blocks"

say_stage "STAGE 7 NORMALIZE FILES"
for file in "${allowed_paths[@]}"; do norm "$file"; done
pass "normalized EOF and trailing whitespace"

say_stage "STAGE 8 VALIDATION"
run_cmd bash -n tools/termux/forge_067a_opportunity_pipeline_canonical_source_mapping_scope.sh
run_cmd python3 -m json.tool docs/evidence/forge-opportunity-pipeline-canonical-source-mapping-scope-audit-067a.json
run_cmd rg -n "067A_OPPORTUNITY_PIPELINE_CANONICAL_SOURCE_MAPPING_SCOPE|PASS_067A_OPPORTUNITY_PIPELINE_CANONICAL_SOURCE_MAPPING_SCOPE|OPPORTUNITY_PIPELINE_CANONICAL_SOURCE_MAPPING_SCOPED|067B_RELATIONSHIP_OPPORTUNITY_SIGNAL_ADAPTER_SCOPE" \
  docs/architecture/source-truth/FORGE_OPPORTUNITY_PIPELINE_CANONICAL_SOURCE_MAPPING_SCOPE_067A.md \
  docs/evidence/FORGE_OPPORTUNITY_PIPELINE_CANONICAL_SOURCE_MAPPING_SCOPE_067A.md \
  docs/evidence/FORGE_OPPORTUNITY_PIPELINE_CANONICAL_SOURCE_MAPPING_SCOPE_CERTIFICATE_067A.md \
  docs/evidence/forge-opportunity-pipeline-canonical-source-mapping-scope-audit-067a.json \
  FORGE_MASTER_BUILD_TREE.md \
  docs/architecture/source-truth/FORGE_UNIFIED_BUILD_TREE_001.md \
  docs/roadmap/FORGE_ROADMAP_LOCK_001.md
run_cmd git diff --check

say_stage "STAGE 9 SAFETY SCAN"
scan_files=(
  "docs/architecture/source-truth/FORGE_OPPORTUNITY_PIPELINE_CANONICAL_SOURCE_MAPPING_SCOPE_067A.md"
  "docs/evidence/FORGE_OPPORTUNITY_PIPELINE_CANONICAL_SOURCE_MAPPING_SCOPE_067A.md"
  "docs/evidence/FORGE_OPPORTUNITY_PIPELINE_CANONICAL_SOURCE_MAPPING_SCOPE_CERTIFICATE_067A.md"
  "docs/evidence/forge-opportunity-pipeline-canonical-source-mapping-scope-audit-067a.json"
  "FORGE_MASTER_BUILD_TREE.md"
  "docs/architecture/source-truth/FORGE_UNIFIED_BUILD_TREE_001.md"
  "docs/roadmap/FORGE_ROADMAP_LOCK_001.md"
)
if rg -n "localStorage|sessionStorage|fetch\\(|XMLHttpRequest|navigator\\.mediaDevices|SpeechRecognition|providerRuntimeEnabled:\\s*true|networkCallsAllowed:\\s*true|browserStorageEnabled:\\s*true|mayCreateTruth:\\s*true|maySendMessage:\\s*true|mayWriteCrm:\\s*true|mayCreateCalendarEvent:\\s*true" "${scan_files[@]}"; then
  hold "safety scan found prohibited browser/runtime/action token"
fi
if rg -n "crmWrite: true|pipelineWrite: true|taskCreate: true|calendarCreate: true|messageSend: true|authReal: true|providerRuntime: true|secretAccess: true|browserPersistence: true|realEngineExecution: true|realEffectsAllowed: true|realEffectsEnabled: true|backendConnection: true|\\\"crmWrite\\\": true|\\\"pipelineWrite\\\": true|\\\"taskCreate\\\": true|\\\"calendarCreate\\\": true|\\\"messageSend\\\": true|\\\"authReal\\\": true|\\\"providerRuntime\\\": true|\\\"secretAccess\\\": true|\\\"browserPersistence\\\": true|\\\"realEngineExecution\\\": true|\\\"realEffectsAllowed\\\": true|\\\"realEffectsEnabled\\\": true|\\\"backendConnection\\\": true" "${scan_files[@]}"; then
  hold "safety scan found enabled real-effect marker"
fi
pass "safety scan clean"

say_stage "STAGE 10 OPTIONAL SCREENSHOT EVIDENCE"
TMPDIR="${TMPDIR:-/data/data/com.termux/files/usr/tmp}"
export TMPDIR
warn "not applicable: 067A is docs/scope only with no UI mutation"

say_stage "STAGE 11 STAGE AUTHORIZED FILES"
git add "${allowed_paths[@]}"
run_cmd git diff --cached --name-only
expected="$(mktemp)"
actual="$(mktemp)"
printf "%s\n" "${allowed_paths[@]}" | sort > "$expected"
git diff --cached --name-only | sort > "$actual"
if ! diff -u "$expected" "$actual"; then
  rm -f "$expected" "$actual"
  hold "staged file set differs from authorized files"
fi
rm -f "$expected" "$actual"
pass "only authorized files staged"
run_cmd git diff --cached --check

say_stage "STAGE 12 COMMIT PUSH"
git diff --cached --quiet && hold "nothing staged for commit"
run_cmd git commit -m "docs: scope opportunity pipeline canonical source mapping"
run_cmd git push origin HEAD:main

say_stage "STAGE 13 FINAL CHECKPOINT"
run_cmd git status --short --branch
run_cmd git log --oneline -10

say_stage "FINAL DECISION"
printf "PASS_067A_OPPORTUNITY_PIPELINE_CANONICAL_SOURCE_MAPPING_SCOPE_COMMIT_PUSH_COMPLETE\n"
printf "DECISION=PASS_067A_OPPORTUNITY_PIPELINE_CANONICAL_SOURCE_MAPPING_SCOPE\n"
printf "LOCKED_DECISION=OPPORTUNITY_PIPELINE_CANONICAL_SOURCE_MAPPING_SCOPED\n"
printf "NEXT=067B_RELATIONSHIP_OPPORTUNITY_SIGNAL_ADAPTER_SCOPE\n"
printf "BACKUP=%s\n" "$BACKUP_DIR"
printf "ROLLBACK=%s\n" "$BACKUP_DIR/rollback-067a.sh"
printf "Reporte: %s\n" "$REPORT"
autocopy_report
