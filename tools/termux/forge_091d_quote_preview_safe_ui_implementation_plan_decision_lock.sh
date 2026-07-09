#!/usr/bin/env bash
set -euo pipefail

CHAIN="091D_QUOTE_PREVIEW_SAFE_UI_IMPLEMENTATION_PLAN_DECISION_LOCK"
REPO="${REPO:-/storage/emulated/0/Forge OS}"
STAMP="$(date +%Y%m%d_%H%M%S)"
REPORT="/data/data/com.termux/files/home/${CHAIN}_RESULT_${STAMP}.md"
BACKUP_DIR=".forge-backups/091d-safe-ui-implementation-plan-decision-lock-${STAMP}"
SCRIPT_IN_REPO="tools/termux/forge_091d_quote_preview_safe_ui_implementation_plan_decision_lock.sh"

PHASE="091D_QUOTE_PREVIEW_SAFE_UI_IMPLEMENTATION_PLAN_DECISION_LOCK"
DECISION="PASS_091D_QUOTE_PREVIEW_SAFE_UI_IMPLEMENTATION_PLAN_DECISION_LOCK"
LOCKED_DECISION="QUOTE_PREVIEW_SAFE_UI_IMPLEMENTATION_PLAN_LOCKED_AS_STATIC_UI_PATCH_PREREQUISITE"
NEXT_AFTER="092A_QUOTE_PREVIEW_SAFE_STATIC_UI_PATCH_SCOPE"

PLAN_JSON="docs/evidence/forge-quote-preview-safe-ui-implementation-plan-091b.json"
PLAN_AUDIT="docs/evidence/forge-quote-preview-safe-ui-implementation-plan-audit-091b.json"
QA_AUDIT="docs/evidence/forge-quote-preview-safe-ui-implementation-plan-qa-audit-091c.json"
QA_DOC="docs/architecture/source-truth/FORGE_QUOTE_PREVIEW_SAFE_UI_IMPLEMENTATION_PLAN_QA_LOCK_091C.md"

ARCH_DOC="docs/architecture/source-truth/FORGE_QUOTE_PREVIEW_SAFE_UI_IMPLEMENTATION_PLAN_DECISION_LOCK_091D.md"
EVIDENCE_DOC="docs/evidence/FORGE_QUOTE_PREVIEW_SAFE_UI_IMPLEMENTATION_PLAN_DECISION_LOCK_091D.md"
CERT_DOC="docs/evidence/FORGE_QUOTE_PREVIEW_SAFE_UI_IMPLEMENTATION_PLAN_DECISION_LOCK_CERTIFICATE_091D.md"
AUDIT_JSON="docs/evidence/forge-quote-preview-safe-ui-implementation-plan-decision-audit-091d.json"

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
echo "BOUNDARY=decision lock only; no UI source edits; no rendering; no CSS injection; no DOM writes; no backend; no quote truth; no sends/writes"

cd "$REPO" || fail "No existe repo: $REPO"

stage "STAGE 1 CHECKPOINT"
run git status --short --branch
run git log --oneline -18
run git diff --name-status
run git diff --cached --name-status
run git reset

stage "STAGE 2 CONFIRM 091C BASE"
if git log --oneline -440 | grep -Eq "091C|lock quote preview safe ui implementation plan qa|QUOTE_PREVIEW_SAFE_UI_IMPLEMENTATION_PLAN_QA_LOCKED"; then
  pass "091C base found in git log"
elif [ -f "$QA_AUDIT" ]; then
  pass "091C audit fallback found"
else
  fail "091C base not found"
fi

for f in "$PLAN_JSON" "$PLAN_AUDIT" "$QA_AUDIT" "$QA_DOC" FORGE_MASTER_BUILD_TREE.md docs/architecture/source-truth/FORGE_UNIFIED_BUILD_TREE_001.md docs/roadmap/FORGE_ROADMAP_LOCK_001.md; do
  [ -f "$f" ] || fail "Missing required file: $f"
  pass "$f"
done

run python3 -m json.tool "$PLAN_JSON"
run python3 -m json.tool "$PLAN_AUDIT"
run python3 -m json.tool "$QA_AUDIT"

if ! rg -n '"next"\s*:\s*"091D_QUOTE_PREVIEW_SAFE_UI_IMPLEMENTATION_PLAN_DECISION_LOCK"|QUOTE_PREVIEW_SAFE_UI_IMPLEMENTATION_PLAN_QA_LOCKED' "$QA_AUDIT" >/dev/null; then
  fail "091C audit does not confirm NEXT 091D / QA lock"
fi
pass "091C audit confirms NEXT 091D"

stage "STAGE 3 BACKUP"
mkdir -p "$BACKUP_DIR"
for f in FORGE_MASTER_BUILD_TREE.md docs/architecture/source-truth/FORGE_UNIFIED_BUILD_TREE_001.md docs/roadmap/FORGE_ROADMAP_LOCK_001.md; do
  cp "$f" "$BACKUP_DIR/$(echo "$f" | tr '/ ' '__')"
done
pass "$BACKUP_DIR"

stage "STAGE 4 DECISION ASSERTIONS"
DECISION_QA_JSON="$(mktemp)"
python3 - <<'PY' "$PLAN_JSON" "$QA_AUDIT" > "$DECISION_QA_JSON"
from pathlib import Path
import json, sys

plan = json.loads(Path(sys.argv[1]).read_text())
qa = json.loads(Path(sys.argv[2]).read_text())
errors = []

if plan.get("phase") != "091B_QUOTE_PREVIEW_SAFE_UI_IMPLEMENTATION_PLAN":
    errors.append("plan_phase_invalid")
if plan.get("planType") != "safe_ui_implementation_plan_only":
    errors.append("plan_type_invalid")
if plan.get("requiresHumanOrCodexSelectionBeforePatch") is not True:
    errors.append("canonical_selection_gate_required")
if qa.get("phase") != "091C_QUOTE_PREVIEW_SAFE_UI_IMPLEMENTATION_PLAN_QA_LOCK":
    errors.append("qa_phase_invalid")
if qa.get("status") != "PASS":
    errors.append("qa_status_invalid")
if qa.get("lockedDecision") != "QUOTE_PREVIEW_SAFE_UI_IMPLEMENTATION_PLAN_QA_LOCKED":
    errors.append("qa_locked_decision_invalid")

contract = plan.get("plannedSafeStaticUiContract", {})
blocked = set(contract.get("blockedPatchKind", []))
required_blocked = {
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
}
missing = sorted(required_blocked - blocked)
if missing:
    errors.append("missing_blocked_patch_kinds:" + ",".join(missing))

allowed = set(contract.get("allowedVisualBindings", []))
required_allowed = {
    "show Preview badge",
    "show Solo lectura badge",
    "show No cotización oficial badge",
    "show Sin envío badge where action risk exists",
    "show Sin CRM badge where action risk exists",
    "show Sin calendario badge where action risk exists",
}
missing_allowed = sorted(required_allowed - allowed)
if missing_allowed:
    errors.append("missing_required_safe_visual_bindings:" + ",".join(missing_allowed))

not_auth = plan.get("notAuthorized", {})
for key, value in not_auth.items():
    if value is not False:
        errors.append(f"not_authorized_not_false:{key}")

for key, value in plan.get("safetyFlags", {}).items():
    if value is not False:
        errors.append(f"safety_flag_not_false:{key}")

qa_validated = qa.get("qaValidated", {})
for key in [
    "planShapeValidated",
    "implementationZonesExist",
    "canonicalSelectionRulesExist",
    "safeStaticUiContractExists",
    "copyBadgeBindingsRequired",
    "blockedEffectKindsConfirmed",
    "noUiSourceEditAuthorizedIn091B",
    "allSafetyFlagsFalse",
]:
    if qa_validated.get(key) is not True:
        errors.append(f"qa_validated_missing:{key}")

result = {
    "status": "PASS" if not errors else "HOLD",
    "decisionLockValidated": not errors,
    "errors": errors,
    "lockedAs": "static_ui_patch_prerequisite",
    "planType": plan.get("planType"),
    "requiresHumanOrCodexSelectionBeforePatch": plan.get("requiresHumanOrCodexSelectionBeforePatch"),
    "safeStaticUiContractValidated": not missing and not missing_allowed,
    "qaLockConfirmed": qa.get("lockedDecision") == "QUOTE_PREVIEW_SAFE_UI_IMPLEMENTATION_PLAN_QA_LOCKED",
    "next": "092A_QUOTE_PREVIEW_SAFE_STATIC_UI_PATCH_SCOPE",
    "noUiPatchAuthorizedBy091D": True,
    "allEffectsRemainBlocked": all(v is False for v in not_auth.values()),
    "allSafetyFlagsFalse": all(v is False for v in plan.get("safetyFlags", {}).values()),
}
print(json.dumps(result, indent=2, ensure_ascii=False))
if errors:
    raise SystemExit(1)
PY

cat "$DECISION_QA_JSON"

stage "STAGE 5 WRITE DOCS / AUDIT"
mkdir -p "$(dirname "$ARCH_DOC")" "$(dirname "$EVIDENCE_DOC")"

cat > "$ARCH_DOC" <<EOF
# Forge Quote Preview Safe UI Implementation Plan Decision Lock 091D

PHASE=$PHASE

STATUS=PASS

DECISION=$DECISION

LOCKED_DECISION=$LOCKED_DECISION

NEXT=$NEXT_AFTER

## Purpose

091D decision-locks the 091B/091C safe UI implementation plan as the prerequisite for any future static UI patch scope.

091D does not edit UI source files. It does not authorize UI patching by itself.

## Locked Meaning

The safe UI implementation plan is locked as:

- plan-only;
- based on 091A surface discovery;
- QA-locked by 091C;
- dependent on 086D, 087D, 088D, 089D, 089R, and 090D;
- prerequisite for 092A safe static UI patch scope.

## Confirmed

- canonical UI file selection is still required before patching;
- implementation zones exist;
- canonical selection rules exist;
- safe static UI contract exists;
- copy/badge bindings are required;
- backend/provider/parser/calculator/Banxico/quote truth/send/CRM/calendar remain blocked;
- no UI patch is authorized by 091D;
- all safety flags remain false.

## Next Architectural Unlock

092A may scope a safe static UI patch.

092A must explicitly select canonical UI files before any source patch.

092A must not authorize backend connection, quote truth, provider calls, parser/calculator/Banxico execution, CRM/policy/pipeline/quote writes, send, calendar creation, or official quote claims.

## Final Decision

DECISION=$DECISION

LOCKED_DECISION=$LOCKED_DECISION

NEXT=$NEXT_AFTER
EOF

cat > "$EVIDENCE_DOC" <<EOF
# Forge Quote Preview Safe UI Implementation Plan Decision Lock Evidence 091D

PHASE=$PHASE

STATUS=PASS

DECISION=$DECISION

LOCKED_DECISION=$LOCKED_DECISION

NEXT=$NEXT_AFTER

## Decision Assertions

\`\`\`json
$(cat "$DECISION_QA_JSON")
\`\`\`

## Plan Source

- \`$PLAN_JSON\`

## QA Source

- \`$QA_AUDIT\`

## Final

DECISION=$DECISION

LOCKED_DECISION=$LOCKED_DECISION

NEXT=$NEXT_AFTER
EOF

cat > "$CERT_DOC" <<EOF
# Forge Quote Preview Safe UI Implementation Plan Decision Lock Certificate 091D

PHASE=$PHASE

CERTIFICATE_STATUS=PASS

DECISION=$DECISION

LOCKED_DECISION=$LOCKED_DECISION

NEXT=$NEXT_AFTER

091D certifies that the safe UI implementation plan is locked as prerequisite for a future safe static UI patch scope.

$DECISION
EOF

cat > "$AUDIT_JSON" <<EOF
{
  "phase": "$PHASE",
  "status": "PASS",
  "decision": "$DECISION",
  "lockedDecision": "$LOCKED_DECISION",
  "base": {
    "phase": "091C_QUOTE_PREVIEW_SAFE_UI_IMPLEMENTATION_PLAN_QA_LOCK",
    "confirmed": true,
    "lockedDecision": "QUOTE_PREVIEW_SAFE_UI_IMPLEMENTATION_PLAN_QA_LOCKED"
  },
  "next": "$NEXT_AFTER",
  "lockedAs": "static_ui_patch_prerequisite",
  "decisionAssertions": $(cat "$DECISION_QA_JSON"),
  "confirmed": {
    "planOnly": true,
    "qaLockedBy091C": true,
    "canonicalUiFileSelectionStillRequired": true,
    "safeStaticUiContractExists": true,
    "copyBadgeBindingsRequired": true,
    "noUiPatchAuthorizedBy091D": true,
    "allEffectsBlocked": true,
    "allSafetyFlagsFalse": true
  },
  "nextScope": {
    "phase": "$NEXT_AFTER",
    "purpose": "safe_static_ui_patch_scope",
    "mustSelectCanonicalUiFiles": true,
    "backendConnectionAllowed": false,
    "quoteTruthAllowed": false,
    "providerCallAllowed": false,
    "parserExecutionAllowed": false,
    "calculatorExecutionAllowed": false,
    "banxicoCallAllowed": false,
    "crmWriteAllowed": false,
    "sendAllowed": false,
    "calendarCreateAllowed": false,
    "officialQuoteClaimAllowed": false
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
## 091D Quote Preview Safe UI Implementation Plan Decision Lock

091D decision-locks the 091B/091C safe UI implementation plan as prerequisite for future safe static UI patch scope.

Locked decision:
\`$LOCKED_DECISION\`

Confirmed:

- plan-only;
- QA-locked by 091C;
- canonical UI file selection still required;
- safe static UI contract exists;
- copy/badge bindings are required;
- no UI patch is authorized by 091D;
- all effects remain blocked;
- all safety flags remain false.

Next:

- \`$NEXT_AFTER\` may scope a safe static UI patch.
- 092A must explicitly select canonical UI files before any source patch.

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
run rg -n "$PHASE|$DECISION|$LOCKED_DECISION|$NEXT_AFTER|decision-locks|canonical UI file selection still required|no UI patch is authorized|safe static UI patch scope" \
  "$ARCH_DOC" "$EVIDENCE_DOC" "$CERT_DOC" "$AUDIT_JSON" \
  FORGE_MASTER_BUILD_TREE.md docs/architecture/source-truth/FORGE_UNIFIED_BUILD_TREE_001.md docs/roadmap/FORGE_ROADMAP_LOCK_001.md

run git diff --check
safety_scan "$ARCH_DOC" "$EVIDENCE_DOC" "$CERT_DOC" "$AUDIT_JSON" \
  FORGE_MASTER_BUILD_TREE.md docs/architecture/source-truth/FORGE_UNIFIED_BUILD_TREE_001.md docs/roadmap/FORGE_ROADMAP_LOCK_001.md

stage "STAGE 7 COMMIT / PUSH"
commit_allowed_subset \
  "docs: lock quote preview safe ui implementation plan decision" \
  FORGE_MASTER_BUILD_TREE.md docs/architecture/source-truth/FORGE_UNIFIED_BUILD_TREE_001.md docs/roadmap/FORGE_ROADMAP_LOCK_001.md \
  "$ARCH_DOC" "$EVIDENCE_DOC" "$CERT_DOC" "$AUDIT_JSON" "$SCRIPT_IN_REPO"

stage "FINAL CHECKPOINT"
run git status --short --branch
run git log --oneline -14

SUMMARY=$(cat <<EOF
PASS_091D_QUOTE_PREVIEW_SAFE_UI_IMPLEMENTATION_PLAN_DECISION_LOCK_COMMIT_PUSH_COMPLETE
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
