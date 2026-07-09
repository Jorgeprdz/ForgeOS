#!/usr/bin/env bash
set -euo pipefail

CHAIN="091C_QUOTE_PREVIEW_SAFE_UI_IMPLEMENTATION_PLAN_QA_LOCK"
REPO="${REPO:-/storage/emulated/0/Forge OS}"
STAMP="$(date +%Y%m%d_%H%M%S)"
REPORT="/data/data/com.termux/files/home/${CHAIN}_RESULT_${STAMP}.md"
BACKUP_DIR=".forge-backups/091c-safe-ui-implementation-plan-qa-lock-${STAMP}"
SCRIPT_IN_REPO="tools/termux/forge_091c_quote_preview_safe_ui_implementation_plan_qa_lock.sh"

PHASE="091C_QUOTE_PREVIEW_SAFE_UI_IMPLEMENTATION_PLAN_QA_LOCK"
DECISION="PASS_091C_QUOTE_PREVIEW_SAFE_UI_IMPLEMENTATION_PLAN_QA_LOCK"
LOCKED_DECISION="QUOTE_PREVIEW_SAFE_UI_IMPLEMENTATION_PLAN_QA_LOCKED"
NEXT_AFTER="091D_QUOTE_PREVIEW_SAFE_UI_IMPLEMENTATION_PLAN_DECISION_LOCK"

PLAN_JSON="docs/evidence/forge-quote-preview-safe-ui-implementation-plan-091b.json"
PLAN_AUDIT="docs/evidence/forge-quote-preview-safe-ui-implementation-plan-audit-091b.json"
PLAN_DOC="docs/architecture/source-truth/FORGE_QUOTE_PREVIEW_SAFE_UI_IMPLEMENTATION_PLAN_091B.md"

ARCH_DOC="docs/architecture/source-truth/FORGE_QUOTE_PREVIEW_SAFE_UI_IMPLEMENTATION_PLAN_QA_LOCK_091C.md"
EVIDENCE_DOC="docs/evidence/FORGE_QUOTE_PREVIEW_SAFE_UI_IMPLEMENTATION_PLAN_QA_LOCK_091C.md"
CERT_DOC="docs/evidence/FORGE_QUOTE_PREVIEW_SAFE_UI_IMPLEMENTATION_PLAN_QA_LOCK_CERTIFICATE_091C.md"
AUDIT_JSON="docs/evidence/forge-quote-preview-safe-ui-implementation-plan-qa-audit-091c.json"

CYAN="\033[1;36m"; GREEN="\033[1;38;5;46m"; YELLOW="\033[1;93m"; RED="\033[1;91m"; RESET="\033[0m"
stage(){ printf "\n${CYAN}========== %s ==========${RESET}\n" "$1"; }
pass(){ printf "${GREEN}PASS:${RESET} %s\n" "$1"; }
warn(){ printf "${YELLOW}WARN:${RESET} %s\n" "$1"; }
fail(){ printf "${RED}HOLD:${RESET} %s\n" "$1"; echo "DECISION=HOLD_${CHAIN}" | tee -a "$REPORT"; echo "REPORT=$REPORT" | tee -a "$REPORT"; exit 1; }
run(){ echo; echo "========== RUN =========="; printf '%q ' "$@"; echo; "$@"; }

replace_or_append_block(){
  local path="$1"; local phase="$2"; local block_file="$3"
  python3 - <<PY "$path" "$phase" "$block_file"
from pathlib import Path
import sys
path = Path(sys.argv[1]); phase = sys.argv[2]; block = Path(sys.argv[3]).read_text()
text = path.read_text()
start = f"<!-- FORGE:{phase}:START -->"; end = f"<!-- FORGE:{phase}:END -->"
if start in text and end in text:
    before = text.split(start)[0]; after = text.split(end, 1)[1]
    text = before.rstrip() + "\n\n" + block.strip() + "\n" + after
else:
    text = text.rstrip() + "\n\n" + block.strip() + "\n"
path.write_text(text.rstrip() + "\n")
PY
}

trim_tree_files(){
  python3 - <<'PY'
from pathlib import Path
for p in [Path("FORGE_MASTER_BUILD_TREE.md"), Path("docs/architecture/source-truth/FORGE_UNIFIED_BUILD_TREE_001.md"), Path("docs/roadmap/FORGE_ROADMAP_LOCK_001.md")]:
    p.write_text(p.read_text().rstrip() + "\n")
    print(f"trimmed EOF blanks: {p}")
PY
}

safety_scan(){
  local files=("$@")
  if rg -n 'localStorage|sessionStorage|fetch\(|XMLHttpRequest|providerRuntimeEnabled:\s*true|networkCallsAllowed:\s*true|browserStorageEnabled:\s*true|mayCreateTruth:\s*true|maySendMessage:\s*true|mayWriteCrm:\s*true|mayCreateCalendarEvent:\s*true|renderAllowed\s*:\s*true|screenRenderAllowed\s*:\s*true|componentRenderAllowed\s*:\s*true|uiMutationAllowed\s*:\s*true|cssInjectionAllowed\s*:\s*true|domWriteAllowed\s*:\s*true|writeAllowed\s*:\s*true|quoteTruthAllowed\s*:\s*true|backendConnectionAllowed\s*:\s*true|officialQuoteAllowed\s*:\s*true|sendAllowed\s*:\s*true|crmWriteAllowed\s*:\s*true|calendarCreateAllowed\s*:\s*true' "${files[@]}"; then
    fail "safety scan found prohibited runtime/browser/network/write/ui/render/css marker"
  fi
  if rg -n '"?(crmWrite|pipelineWrite|policyWrite|quoteWrite|taskCreate|calendarCreate|messageSend|authReal|providerRuntime|secretAccess|browserPersistence|realEngineExecution|realEffectsAllowed|realEffectsEnabled|backendConnection|pdfRead|ocrExecution|parserExecution|calculatorExecution|banxicoCall|testExecution)"?\s*[:=]\s*true\b' "${files[@]}"; then
    fail "real-effect flag true found"
  fi
  pass "safety scan clean"
}

commit_allowed_subset(){
  local msg="$1"; shift; local allowed=("$@")
  git add "${allowed[@]}"
  run git diff --cached --name-only
  run git diff --cached --check

  local allowed_file staged_file unexpected
  allowed_file="$(mktemp)"; staged_file="$(mktemp)"
  printf "%s\n" "${allowed[@]}" | sort > "$allowed_file"
  git diff --cached --name-only | sort > "$staged_file"
  unexpected="$(comm -23 "$staged_file" "$allowed_file" || true)"

  if [ -n "$unexpected" ]; then echo "$unexpected"; fail "staged files include files outside authorized boundary"; fi
  [ -s "$staged_file" ] || fail "no staged changes for commit"

  pass "staged files are within authorized boundary"
  run git commit -m "$msg"
  run git push origin HEAD
}

mkdir -p "$(dirname "$REPORT")"
touch "$REPORT"
exec > >(tee -a "$REPORT") 2>&1

stage "STAGE 0 HEADER"
echo "CHAIN=$CHAIN"
echo "REPORT=$REPORT"
echo "BOUNDARY=QA lock only; no UI source edits; no rendering; no CSS injection; no DOM writes; no backend; no quote truth; no sends/writes"

cd "$REPO" || fail "No existe repo: $REPO"

stage "STAGE 1 CHECKPOINT"
run git status --short --branch
run git log --oneline -18
run git diff --name-status
run git diff --cached --name-status
run git reset

stage "STAGE 2 CONFIRM 091B BASE"
if git log --oneline -420 | grep -Eq "091B|plan quote preview safe ui implementation|QUOTE_PREVIEW_SAFE_UI_IMPLEMENTATION_PLAN_LOCKED"; then
  pass "091B base found in git log"
elif [ -f "$PLAN_AUDIT" ]; then
  pass "091B audit fallback found"
else
  fail "091B base not found"
fi

for f in "$PLAN_JSON" "$PLAN_AUDIT" "$PLAN_DOC" FORGE_MASTER_BUILD_TREE.md docs/architecture/source-truth/FORGE_UNIFIED_BUILD_TREE_001.md docs/roadmap/FORGE_ROADMAP_LOCK_001.md; do
  [ -f "$f" ] || fail "Missing required file: $f"
  pass "$f"
done

run python3 -m json.tool "$PLAN_JSON"
run python3 -m json.tool "$PLAN_AUDIT"

if ! rg -n '"next"\s*:\s*"091C_QUOTE_PREVIEW_SAFE_UI_IMPLEMENTATION_PLAN_QA_LOCK"|QUOTE_PREVIEW_SAFE_UI_IMPLEMENTATION_PLAN_LOCKED' "$PLAN_AUDIT" >/dev/null; then
  fail "091B audit does not confirm NEXT 091C / lock"
fi
pass "091B audit confirms NEXT 091C"

stage "STAGE 3 BACKUP"
mkdir -p "$BACKUP_DIR"
for f in FORGE_MASTER_BUILD_TREE.md docs/architecture/source-truth/FORGE_UNIFIED_BUILD_TREE_001.md docs/roadmap/FORGE_ROADMAP_LOCK_001.md; do
  cp "$f" "$BACKUP_DIR/$(echo "$f" | tr '/ ' '__')"
done
pass "$BACKUP_DIR"

stage "STAGE 4 SEMANTIC QA"
SEMANTIC_QA_JSON="$(mktemp)"
python3 - <<'PY' "$PLAN_JSON" > "$SEMANTIC_QA_JSON"
from pathlib import Path
import json, sys

plan = json.loads(Path(sys.argv[1]).read_text())
errors = []

if plan.get("phase") != "091B_QUOTE_PREVIEW_SAFE_UI_IMPLEMENTATION_PLAN":
    errors.append("invalid_phase")
if plan.get("status") not in {"PASS", "PASS_WITH_NO_UI_CANDIDATES_FOUND"}:
    errors.append("invalid_status")
if plan.get("planType") != "safe_ui_implementation_plan_only":
    errors.append("invalid_plan_type")
if plan.get("next") != "091C_QUOTE_PREVIEW_SAFE_UI_IMPLEMENTATION_PLAN_QA_LOCK":
    errors.append("invalid_next")

zones = plan.get("implementationZones", {})
if not isinstance(zones, dict):
    errors.append("implementation_zones_required")
else:
    if "highestPriorityCandidates" not in zones:
        errors.append("highest_priority_candidates_required")
    if "secondaryCandidates" not in zones:
        errors.append("secondary_candidates_required")
    if "candidateUiDirs" not in zones:
        errors.append("candidate_ui_dirs_required")
    if "frameworkSignals" not in zones:
        errors.append("framework_signals_required")

rules = plan.get("canonicalSelectionRules", [])
if not isinstance(rules, list) or len(rules) < 5:
    errors.append("canonical_selection_rules_minimum_required")
else:
    joined = " ".join(rules).lower()
    for fragment in [
        "prefer files already containing",
        "prefer ui source files",
        "prefer tsx/jsx",
        "do not select tests",
        "do not cross desktop/mobile",
        "do not introduce backend calls",
    ]:
        if fragment not in joined:
            errors.append(f"missing_rule_{fragment.replace(' ', '_')}")

contract = plan.get("plannedSafeStaticUiContract", {})
if not isinstance(contract, dict):
    errors.append("safe_static_ui_contract_required")
else:
    allowed = contract.get("allowedVisualBindings", [])
    blocked = contract.get("blockedPatchKind", [])
    required_sources = contract.get("requiredCopySources", [])
    for item in [
        "show Preview badge",
        "show Solo lectura badge",
        "show No cotización oficial badge",
        "show Sin envío badge where action risk exists",
        "show Sin CRM badge where action risk exists",
        "show Sin calendario badge where action risk exists",
    ]:
        if item not in allowed:
            errors.append(f"missing_allowed_binding_{item}")
    for item in [
        "backend connection",
        "provider call",
        "parser execution",
        "calculator execution",
        "Banxico call",
        "quote truth creation",
        "official quote claim",
        "send action",
        "CRM write",
        "calendar creation",
    ]:
        if item not in blocked:
            errors.append(f"missing_blocked_patch_kind_{item}")
    for item in [
        "090B safe copy badge system registry",
        "089R visual template reconciliation",
        "088D screen composition",
        "087D component contracts",
        "086D state model",
    ]:
        if item not in required_sources:
            errors.append(f"missing_required_source_{item}")

not_auth = plan.get("notAuthorized", {})
for key in [
    "uiSourceEditsIn091B",
    "screenRendering",
    "componentRendering",
    "uiMutation",
    "cssInjection",
    "domWrite",
    "quoteTruthCreation",
    "backendConnection",
    "providerCall",
    "parserExecution",
    "calculatorExecution",
    "banxicoCall",
    "send",
    "crmWrite",
    "calendarCreate",
]:
    if not_auth.get(key) is not False:
        errors.append(f"not_authorized_flag_must_be_false_{key}")

for key, value in plan.get("safetyFlags", {}).items():
    if value is not False:
        errors.append(f"safety_flag_not_false_{key}")

result = {
    "status": "PASS" if not errors else "HOLD",
    "planValidated": not errors,
    "errors": errors,
    "highestPriorityCandidateCount": len(zones.get("highestPriorityCandidates", [])) if isinstance(zones, dict) else 0,
    "secondaryCandidateCount": len(zones.get("secondaryCandidates", [])) if isinstance(zones, dict) else 0,
    "candidateUiDirCount": len(zones.get("candidateUiDirs", [])) if isinstance(zones, dict) else 0,
    "canonicalSelectionRulesValidated": not any(e.startswith("missing_rule_") for e in errors),
    "safeStaticUiContractValidated": not any(e.startswith("missing_allowed_binding_") or e.startswith("missing_blocked_patch_kind_") or e.startswith("missing_required_source_") for e in errors),
    "noUiSourceEditsAuthorized": not_auth.get("uiSourceEditsIn091B") is False,
    "allEffectsBlocked": all(not_auth.get(k) is False for k in not_auth),
    "allSafetyFlagsFalse": all(v is False for v in plan.get("safetyFlags", {}).values()),
    "next": "091D_QUOTE_PREVIEW_SAFE_UI_IMPLEMENTATION_PLAN_DECISION_LOCK",
}
print(json.dumps(result, indent=2, ensure_ascii=False))
if errors:
    raise SystemExit(1)
PY

cat "$SEMANTIC_QA_JSON"

stage "STAGE 5 WRITE DOCS / AUDIT"
mkdir -p "$(dirname "$ARCH_DOC")" "$(dirname "$EVIDENCE_DOC")"

cat > "$ARCH_DOC" <<EOF
# Forge Quote Preview Safe UI Implementation Plan QA Lock 091C

PHASE=$PHASE

STATUS=PASS

DECISION=$DECISION

LOCKED_DECISION=$LOCKED_DECISION

NEXT=$NEXT_AFTER

## Purpose

091C QA locks the 091B safe UI implementation plan.

091C does not edit UI source files. It verifies that 091B remains plan-only and does not authorize UI source edits, rendering, CSS injection, DOM writes, backend connection, quote truth, sends, CRM writes, or calendar creation.

## QA Validated

- 091B plan shape validates.
- implementation zones exist.
- canonical selection rules exist.
- safe static UI contract exists.
- copy/badge bindings are required.
- backend/provider/parser/calculator/Banxico/quote truth/send/CRM/calendar are blocked.
- no UI source edit is authorized in 091B.
- all safety flags remain false.

## Final Decision

DECISION=$DECISION

LOCKED_DECISION=$LOCKED_DECISION

NEXT=$NEXT_AFTER
EOF

cat > "$EVIDENCE_DOC" <<EOF
# Forge Quote Preview Safe UI Implementation Plan QA Lock Evidence 091C

PHASE=$PHASE

STATUS=PASS

DECISION=$DECISION

LOCKED_DECISION=$LOCKED_DECISION

NEXT=$NEXT_AFTER

## Semantic QA

\`\`\`json
$(cat "$SEMANTIC_QA_JSON")
\`\`\`

## Plan Source

- \`$PLAN_JSON\`

## Final

DECISION=$DECISION

LOCKED_DECISION=$LOCKED_DECISION

NEXT=$NEXT_AFTER
EOF

cat > "$CERT_DOC" <<EOF
# Forge Quote Preview Safe UI Implementation Plan QA Lock Certificate 091C

PHASE=$PHASE

CERTIFICATE_STATUS=PASS

DECISION=$DECISION

LOCKED_DECISION=$LOCKED_DECISION

NEXT=$NEXT_AFTER

091C certifies that the safe UI implementation plan is QA locked.

$DECISION
EOF

cat > "$AUDIT_JSON" <<EOF
{
  "phase": "$PHASE",
  "status": "PASS",
  "decision": "$DECISION",
  "lockedDecision": "$LOCKED_DECISION",
  "base": {
    "phase": "091B_QUOTE_PREVIEW_SAFE_UI_IMPLEMENTATION_PLAN",
    "confirmed": true,
    "lockedDecision": "QUOTE_PREVIEW_SAFE_UI_IMPLEMENTATION_PLAN_LOCKED"
  },
  "next": "$NEXT_AFTER",
  "semanticQa": $(cat "$SEMANTIC_QA_JSON"),
  "planSource": "$PLAN_JSON",
  "qaValidated": {
    "planShapeValidated": true,
    "implementationZonesExist": true,
    "canonicalSelectionRulesExist": true,
    "safeStaticUiContractExists": true,
    "copyBadgeBindingsRequired": true,
    "blockedEffectKindsConfirmed": true,
    "noUiSourceEditAuthorizedIn091B": true,
    "allSafetyFlagsFalse": true
  },
  "notAuthorized": {
    "uiSourceEditsIn091C": false,
    "componentImplementation": false,
    "screenRendering": false,
    "componentRendering": false,
    "uiMutation": false,
    "cssInjection": false,
    "domWrite": false,
    "quoteTruthCreation": false,
    "backendConnection": false,
    "providerCall": false,
    "parserExecution": false,
    "calculatorExecution": false,
    "banxicoCall": false,
    "send": false,
    "crmWrite": false,
    "calendarCreate": false
  },
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
    "pdfRead": false,
    "ocrExecution": false,
    "parserExecution": false,
    "calculatorExecution": false,
    "banxicoCall": false,
    "testExecution": false
  }
}
EOF

TREE_BLOCK="$(mktemp)"
cat > "$TREE_BLOCK" <<EOF
<!-- FORGE:$PHASE:START -->
## 091C Quote Preview Safe UI Implementation Plan QA Lock

091C QA locks the 091B safe UI implementation plan.

Locked decision:
\`$LOCKED_DECISION\`

QA validated:

- 091B plan shape validates;
- implementation zones exist;
- canonical selection rules exist;
- safe static UI contract exists;
- copy/badge bindings are required;
- blocked effect kinds are confirmed;
- no UI source edit is authorized in 091B;
- all safety flags remain false.

091C does not edit UI source files.

DECISION=$DECISION

LOCKED_DECISION=$LOCKED_DECISION

NEXT=$NEXT_AFTER
<!-- FORGE:$PHASE:END -->
EOF

for tree in FORGE_MASTER_BUILD_TREE.md docs/architecture/source-truth/FORGE_UNIFIED_BUILD_TREE_001.md docs/roadmap/FORGE_ROADMAP_LOCK_001.md; do
  replace_or_append_block "$tree" "$PHASE" "$TREE_BLOCK"
done
trim_tree_files

mkdir -p "$(dirname "$SCRIPT_IN_REPO")"
cp "$0" "$SCRIPT_IN_REPO"
chmod +x "$SCRIPT_IN_REPO"

stage "STAGE 6 VALIDATION"
run bash -n "$SCRIPT_IN_REPO"
run python3 -m json.tool "$AUDIT_JSON"
run rg -n "$PHASE|$DECISION|$LOCKED_DECISION|$NEXT_AFTER|QA locks|plan shape validates|no UI source edit is authorized|all safety flags remain false" \
  "$ARCH_DOC" "$EVIDENCE_DOC" "$CERT_DOC" "$AUDIT_JSON" \
  FORGE_MASTER_BUILD_TREE.md docs/architecture/source-truth/FORGE_UNIFIED_BUILD_TREE_001.md docs/roadmap/FORGE_ROADMAP_LOCK_001.md

run git diff --check
safety_scan "$ARCH_DOC" "$EVIDENCE_DOC" "$CERT_DOC" "$AUDIT_JSON" \
  FORGE_MASTER_BUILD_TREE.md docs/architecture/source-truth/FORGE_UNIFIED_BUILD_TREE_001.md docs/roadmap/FORGE_ROADMAP_LOCK_001.md

stage "STAGE 7 COMMIT / PUSH"
commit_allowed_subset \
  "docs: lock quote preview safe ui implementation plan qa" \
  FORGE_MASTER_BUILD_TREE.md docs/architecture/source-truth/FORGE_UNIFIED_BUILD_TREE_001.md docs/roadmap/FORGE_ROADMAP_LOCK_001.md \
  "$ARCH_DOC" "$EVIDENCE_DOC" "$CERT_DOC" "$AUDIT_JSON" "$SCRIPT_IN_REPO"

stage "FINAL CHECKPOINT"
run git status --short --branch
run git log --oneline -14

SUMMARY=$(cat <<EOF
PASS_091C_QUOTE_PREVIEW_SAFE_UI_IMPLEMENTATION_PLAN_QA_LOCK_COMMIT_PUSH_COMPLETE
DECISION=$DECISION
LOCKED_DECISION=$LOCKED_DECISION
NEXT=$NEXT_AFTER
BACKUP=$BACKUP_DIR
REPORT=$REPORT
EOF
)

echo
echo "$SUMMARY"

if command -v termux-clipboard-set >/dev/null 2>&1; then
  printf "%s\n" "$SUMMARY" | termux-clipboard-set
  pass "final summary copied to clipboard"
else
  warn "termux-clipboard-set not available; summary not copied"
fi

echo "Reporte: $REPORT"
