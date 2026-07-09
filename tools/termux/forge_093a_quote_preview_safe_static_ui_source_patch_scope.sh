#!/usr/bin/env bash
set -euo pipefail

CHAIN="093A_QUOTE_PREVIEW_SAFE_STATIC_UI_SOURCE_PATCH_SCOPE"
REPO="${REPO:-/storage/emulated/0/Forge OS}"
STAMP="$(date +%Y%m%d_%H%M%S)"
REPORT="/data/data/com.termux/files/home/${CHAIN}_RESULT_${STAMP}.md"
BACKUP_DIR=".forge-backups/093a-safe-static-ui-source-patch-scope-${STAMP}"
SCRIPT_IN_REPO="tools/termux/forge_093a_quote_preview_safe_static_ui_source_patch_scope.sh"

PHASE="093A_QUOTE_PREVIEW_SAFE_STATIC_UI_SOURCE_PATCH_SCOPE"
DECISION="PASS_093A_QUOTE_PREVIEW_SAFE_STATIC_UI_SOURCE_PATCH_SCOPE"
LOCKED_DECISION="QUOTE_PREVIEW_SAFE_STATIC_UI_SOURCE_PATCH_SCOPED"
NEXT_AFTER="093B_QUOTE_PREVIEW_SAFE_STATIC_UI_SOURCE_PATCH_IMPLEMENTATION"

PATCH_PLAN_JSON="docs/evidence/forge-quote-preview-safe-static-ui-patch-plan-092b.json"
PATCH_PLAN_AUDIT="docs/evidence/forge-quote-preview-safe-static-ui-patch-plan-audit-092b.json"
DECISION_AUDIT_092D="docs/evidence/forge-quote-preview-safe-static-ui-patch-plan-decision-audit-092d.json"
DECISION_DOC_092D="docs/architecture/source-truth/FORGE_QUOTE_PREVIEW_SAFE_STATIC_UI_PATCH_PLAN_DECISION_LOCK_092D.md"

SOURCE_SCOPE_JSON="docs/evidence/forge-quote-preview-safe-static-ui-source-patch-scope-093a.json"
ARCH_DOC="docs/architecture/source-truth/FORGE_QUOTE_PREVIEW_SAFE_STATIC_UI_SOURCE_PATCH_SCOPE_093A.md"
EVIDENCE_DOC="docs/evidence/FORGE_QUOTE_PREVIEW_SAFE_STATIC_UI_SOURCE_PATCH_SCOPE_093A.md"
CERT_DOC="docs/evidence/FORGE_QUOTE_PREVIEW_SAFE_STATIC_UI_SOURCE_PATCH_SCOPE_CERTIFICATE_093A.md"
AUDIT_JSON="docs/evidence/forge-quote-preview-safe-static-ui-source-patch-scope-audit-093a.json"

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
  allowed_file="$(mktemp)"
  staged_file="$(mktemp)"
  printf "%s\n" "${allowed[@]}" | sort > "$allowed_file"
  git diff --cached --name-only | sort > "$staged_file"
  unexpected="$(comm -23 "$staged_file" "$allowed_file" || true)"

  if [ -n "$unexpected" ]; then
    echo "$unexpected"
    fail "staged files include files outside authorized boundary"
  fi
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
echo "BOUNDARY=source patch scope only; no UI source edits in 093A; no component rendering; no CSS injection; no DOM writes; no backend; no quote truth; no sends/writes"

cd "$REPO" || fail "No existe repo: $REPO"

stage "STAGE 1 CHECKPOINT"
run git status --short --branch
run git log --oneline -18
run git diff --name-status
run git diff --cached --name-status
run git reset

stage "STAGE 2 CONFIRM 092D BASE"
if git log --oneline -640 | grep -Eq "092D|lock quote preview safe static ui patch plan decision|QUOTE_PREVIEW_SAFE_STATIC_UI_PATCH_PLAN_LOCKED_AS_SOURCE_PATCH_SCOPE_PREREQUISITE"; then
  pass "092D base found in git log"
elif [ -f "$DECISION_AUDIT_092D" ]; then
  pass "092D audit fallback found"
else
  fail "092D base not found"
fi

for f in "$PATCH_PLAN_JSON" "$PATCH_PLAN_AUDIT" "$DECISION_AUDIT_092D" "$DECISION_DOC_092D" FORGE_MASTER_BUILD_TREE.md docs/architecture/source-truth/FORGE_UNIFIED_BUILD_TREE_001.md docs/roadmap/FORGE_ROADMAP_LOCK_001.md; do
  [ -f "$f" ] || fail "Missing required file: $f"
  pass "$f"
done

run python3 -m json.tool "$PATCH_PLAN_JSON"
run python3 -m json.tool "$PATCH_PLAN_AUDIT"
run python3 -m json.tool "$DECISION_AUDIT_092D"

if ! rg -n '"next"\s*:\s*"093A_QUOTE_PREVIEW_SAFE_STATIC_UI_SOURCE_PATCH_SCOPE"|QUOTE_PREVIEW_SAFE_STATIC_UI_PATCH_PLAN_LOCKED_AS_SOURCE_PATCH_SCOPE_PREREQUISITE' "$DECISION_AUDIT_092D" >/dev/null; then
  fail "092D audit does not confirm NEXT 093A / prerequisite lock"
fi
pass "092D audit confirms NEXT 093A"

stage "STAGE 3 BACKUP"
mkdir -p "$BACKUP_DIR"
for f in FORGE_MASTER_BUILD_TREE.md docs/architecture/source-truth/FORGE_UNIFIED_BUILD_TREE_001.md docs/roadmap/FORGE_ROADMAP_LOCK_001.md; do
  cp "$f" "$BACKUP_DIR/$(echo "$f" | tr '/ ' '__')"
done
pass "$BACKUP_DIR"

stage "STAGE 4 BUILD SOURCE PATCH SCOPE"
mkdir -p "$(dirname "$SOURCE_SCOPE_JSON")"

python3 - <<'PY' "$PATCH_PLAN_JSON" "$SOURCE_SCOPE_JSON"
from pathlib import Path
import json, sys, re

plan_path = Path(sys.argv[1])
scope_path = Path(sys.argv[2])
plan = json.loads(plan_path.read_text())

selected = plan.get("selectedCanonicalUiFiles", [])
ops = plan.get("patchOperationsPlanned", [])

authorized = []
for candidate in selected:
    path = candidate.get("path")
    if not path:
        continue
    p = Path(path)
    suffix = p.suffix.lower()
    is_allowed_suffix = suffix in {".tsx", ".jsx", ".ts", ".js", ".css", ".scss", ".html"}
    is_disallowed_context = candidate.get("isDocsOrEvidence") or candidate.get("isTestOrSpec")
    if p.exists() and is_allowed_suffix and not is_disallowed_context:
        matching_ops = [op for op in ops if op.get("targetPath") == path]
        allowed_operations = []
        for op in matching_ops:
            allowed_operations.append({
                "operation": op.get("operation"),
                "operationType": op.get("operationType"),
                "placementRule": op.get("placementRule"),
                "requiredVisibleCopy": op.get("requiredVisibleCopy", []),
                "optionalRiskCopy": op.get("optionalRiskCopy", []),
                "sourceEditAuthorizedBy092B": op.get("sourceEditAuthorizedBy092B")
            })
        authorized.append({
            "path": path,
            "suffix": suffix,
            "exists": True,
            "score": candidate.get("score"),
            "authorizedFor093BPlanning": True,
            "authorizedFor093AEdit": False,
            "authorizedOperationTypesFor093B": ["static_safe_boundary_copy_patch"],
            "plannedOperationsFrom092B": allowed_operations,
            "patchLimits": {
                "mayAddStaticSafetyCopy": True,
                "mayAddStaticBadges": True,
                "mayMoveBusinessLogic": False,
                "mayChangeDataFlow": False,
                "mayAddHandlers": False,
                "mayAddBackendCalls": False,
                "mayCreateQuoteTruth": False,
                "maySend": False,
                "mayWriteCrm": False,
                "mayCreateCalendar": False
            }
        })

status = "PASS" if authorized else "PASS_WITH_NO_AUTHORIZED_SOURCE_PATCH_TARGET"

scope = {
    "phase": "093A_QUOTE_PREVIEW_SAFE_STATIC_UI_SOURCE_PATCH_SCOPE",
    "status": status,
    "scopeType": "safe_static_ui_source_patch_scope_only",
    "base": {
        "092DDecision": "docs/evidence/forge-quote-preview-safe-static-ui-patch-plan-decision-audit-092d.json",
        "092BPatchPlan": str(plan_path)
    },
    "authorizedSourcePatchFilesFor093B": authorized,
    "authorizedSourcePatchFileCount": len(authorized),
    "sourceEditsAuthorizedIn093A": False,
    "sourcePatchExecutionAuthorizedIn093A": False,
    "093BMayEditOnlyAuthorizedFiles": True,
    "093BMustFailIfNoAuthorizedFiles": True,
    "allowedPatchKindFor093B": [
        "static safety copy insertion",
        "static safety badge insertion",
        "non-executing preview boundary copy",
        "non-executing human review boundary copy"
    ],
    "requiredVisibleSafetyCopy": [
        "Preview",
        "Solo lectura",
        "Revisión humana",
        "No cotización oficial",
        "Sin envío",
        "Sin CRM",
        "Sin calendario"
    ],
    "forbiddenPatchEffects": [
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
        "runtime browser storage or network primitives",
        "new action handler",
        "business calculation change",
        "data flow change"
    ],
    "patchScopeConstraints": [
        "093A is scope-only and must not edit UI source files.",
        "093B may only touch authorizedSourcePatchFilesFor093B.",
        "093B must be a narrow static copy/badge patch only.",
        "093B must not alter business logic, data flow, backend, provider, parser, calculator, Banxico, CRM, calendar, policy, pipeline, quote, or send modules.",
        "093B must preserve desktop/mobile layer boundaries from 089R.",
        "093B must preserve safe copy and badge labels from 090D.",
        "093B must produce before/after evidence and a reversible backup."
    ],
    "next": "093B_QUOTE_PREVIEW_SAFE_STATIC_UI_SOURCE_PATCH_IMPLEMENTATION",
    "notAuthorized": {
        "uiSourceEditsIn093A": False,
        "componentImplementationIn093A": False,
        "screenRendering": False,
        "componentRendering": False,
        "uiMutation": False,
        "cssInjection": False,
        "domWrite": False,
        "quoteTruthCreation": False,
        "backendConnection": False,
        "providerCall": False,
        "parserExecution": False,
        "calculatorExecution": False,
        "banxicoCall": False,
        "send": False,
        "crmWrite": False,
        "calendarCreate": False
    },
    "safetyFlags": {
        "crmWrite": False,
        "pipelineWrite": False,
        "policyWrite": False,
        "quoteWrite": False,
        "taskCreate": False,
        "calendarCreate": False,
        "messageSend": False,
        "authReal": False,
        "providerRuntime": False,
        "secretAccess": False,
        "browserPersistence": False,
        "realEngineExecution": False,
        "realEffectsAllowed": False,
        "realEffectsEnabled": False,
        "backendConnection": False,
        "pdfRead": False,
        "ocrExecution": False,
        "parserExecution": False,
        "calculatorExecution": False,
        "banxicoCall": False,
        "testExecution": False
    }
}

scope_path.write_text(json.dumps(scope, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
print(json.dumps(scope, indent=2, ensure_ascii=False))
PY

run python3 -m json.tool "$SOURCE_SCOPE_JSON"

stage "STAGE 5 VALIDATE SOURCE PATCH SCOPE"
SEMANTIC_QA_JSON="$(mktemp)"
python3 - <<'PY' "$SOURCE_SCOPE_JSON" > "$SEMANTIC_QA_JSON"
from pathlib import Path
import json, sys

scope = json.loads(Path(sys.argv[1]).read_text())
errors = []

if scope.get("phase") != "093A_QUOTE_PREVIEW_SAFE_STATIC_UI_SOURCE_PATCH_SCOPE":
    errors.append("invalid_phase")
if scope.get("status") not in {"PASS", "PASS_WITH_NO_AUTHORIZED_SOURCE_PATCH_TARGET"}:
    errors.append("invalid_status")
if scope.get("scopeType") != "safe_static_ui_source_patch_scope_only":
    errors.append("invalid_scope_type")
if scope.get("next") != "093B_QUOTE_PREVIEW_SAFE_STATIC_UI_SOURCE_PATCH_IMPLEMENTATION":
    errors.append("invalid_next")
if scope.get("sourceEditsAuthorizedIn093A") is not False:
    errors.append("source_edits_must_not_be_authorized_in_093a")
if scope.get("sourcePatchExecutionAuthorizedIn093A") is not False:
    errors.append("source_patch_execution_must_not_be_authorized_in_093a")
if scope.get("093BMayEditOnlyAuthorizedFiles") is not True:
    errors.append("093b_must_edit_only_authorized_files")
if scope.get("093BMustFailIfNoAuthorizedFiles") is not True:
    errors.append("093b_must_fail_if_no_authorized_files")

for item in [
    "static safety copy insertion",
    "static safety badge insertion",
    "non-executing preview boundary copy",
    "non-executing human review boundary copy"
]:
    if item not in scope.get("allowedPatchKindFor093B", []):
        errors.append(f"missing_allowed_patch_kind:{item}")

for copy in ["Preview", "Solo lectura", "Revisión humana", "No cotización oficial", "Sin envío", "Sin CRM", "Sin calendario"]:
    if copy not in scope.get("requiredVisibleSafetyCopy", []):
        errors.append(f"missing_required_copy:{copy}")

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
    "runtime browser storage or network primitives",
    "new action handler",
    "business calculation change",
    "data flow change"
]:
    if item not in scope.get("forbiddenPatchEffects", []):
        errors.append(f"missing_forbidden_effect:{item}")

for item in scope.get("authorizedSourcePatchFilesFor093B", []):
    if item.get("authorizedFor093BPlanning") is not True:
        errors.append(f"authorized_file_not_enabled_for_093b:{item.get('path')}")
    if item.get("authorizedFor093AEdit") is not False:
        errors.append(f"authorized_file_allows_093a_edit:{item.get('path')}")
    limits = item.get("patchLimits", {})
    for forbidden_limit in ["mayMoveBusinessLogic", "mayChangeDataFlow", "mayAddHandlers", "mayAddBackendCalls", "mayCreateQuoteTruth", "maySend", "mayWriteCrm", "mayCreateCalendar"]:
        if limits.get(forbidden_limit) is not False:
            errors.append(f"patch_limit_not_false:{item.get('path')}:{forbidden_limit}")

not_auth = scope.get("notAuthorized", {})
for key, value in not_auth.items():
    if value is not False:
        errors.append(f"not_authorized_flag_not_false:{key}")

for key, value in scope.get("safetyFlags", {}).items():
    if value is not False:
        errors.append(f"safety_flag_not_false:{key}")

result = {
    "status": "PASS" if not errors else "HOLD",
    "scopeValidated": not errors,
    "errors": errors,
    "authorizedSourcePatchFileCount": scope.get("authorizedSourcePatchFileCount"),
    "sourceEditsAuthorizedIn093A": scope.get("sourceEditsAuthorizedIn093A"),
    "sourcePatchExecutionAuthorizedIn093A": scope.get("sourcePatchExecutionAuthorizedIn093A"),
    "093BMayEditOnlyAuthorizedFiles": scope.get("093BMayEditOnlyAuthorizedFiles"),
    "093BMustFailIfNoAuthorizedFiles": scope.get("093BMustFailIfNoAuthorizedFiles"),
    "requiredVisibleSafetyCopyValidated": not any(e.startswith("missing_required_copy") for e in errors),
    "forbiddenPatchEffectsValidated": not any(e.startswith("missing_forbidden_effect") for e in errors),
    "authorizedFileLimitsValidated": not any(e.startswith("patch_limit_not_false") for e in errors),
    "allEffectsBlocked": all(v is False for v in not_auth.values()),
    "allSafetyFlagsFalse": all(v is False for v in scope.get("safetyFlags", {}).values()),
    "next": "093B_QUOTE_PREVIEW_SAFE_STATIC_UI_SOURCE_PATCH_IMPLEMENTATION"
}
print(json.dumps(result, indent=2, ensure_ascii=False))
if errors:
    raise SystemExit(1)
PY

cat "$SEMANTIC_QA_JSON"

stage "STAGE 6 WRITE DOCS / AUDIT"
mkdir -p "$(dirname "$ARCH_DOC")" "$(dirname "$EVIDENCE_DOC")"

cat > "$ARCH_DOC" <<EOF
# Forge Quote Preview Safe Static UI Source Patch Scope 093A

PHASE=$PHASE

STATUS=PASS

DECISION=$DECISION

LOCKED_DECISION=$LOCKED_DECISION

NEXT=$NEXT_AFTER

## Purpose

093A scopes a future safe static UI source patch for Quote Preview.

093A does not edit UI source files. It narrowly authorizes which UI source files 093B may consider for a static safety copy/badge patch.

## Boundary

093A is source-patch-scope-only.

It does not render components, render screens, mutate UI, inject CSS, write DOM, connect backend, create quote truth, issue quotes, send quotes, write CRM/policy/pipeline/quote records, read PDFs, run parsers, run calculators, call Banxico, or create calendar events.

## Scope Output

- \`$SOURCE_SCOPE_JSON\`

## Required Visible Safety Copy

- Preview
- Solo lectura
- Revisión humana
- No cotización oficial
- Sin envío
- Sin CRM
- Sin calendario

## 093B Guardrail

093B may only edit files listed in \`authorizedSourcePatchFilesFor093B\`.

093B must fail if no authorized files exist.

093B may only perform a narrow static safety copy/badge patch. It must not alter business logic, data flow, backend, provider, parser, calculator, Banxico, CRM, calendar, policy, pipeline, quote, or send modules.

## Final Decision

DECISION=$DECISION

LOCKED_DECISION=$LOCKED_DECISION

NEXT=$NEXT_AFTER
EOF

cat > "$EVIDENCE_DOC" <<EOF
# Forge Quote Preview Safe Static UI Source Patch Scope Evidence 093A

PHASE=$PHASE

STATUS=PASS

DECISION=$DECISION

LOCKED_DECISION=$LOCKED_DECISION

NEXT=$NEXT_AFTER

## Source Patch Scope

\`\`\`json
$(cat "$SOURCE_SCOPE_JSON")
\`\`\`

## Semantic QA

\`\`\`json
$(cat "$SEMANTIC_QA_JSON")
\`\`\`

## Final

DECISION=$DECISION

LOCKED_DECISION=$LOCKED_DECISION

NEXT=$NEXT_AFTER
EOF

cat > "$CERT_DOC" <<EOF
# Forge Quote Preview Safe Static UI Source Patch Scope Certificate 093A

PHASE=$PHASE

CERTIFICATE_STATUS=PASS

DECISION=$DECISION

LOCKED_DECISION=$LOCKED_DECISION

NEXT=$NEXT_AFTER

093A certifies that safe static UI source patch scope has been defined without UI source edits.

$DECISION
EOF

cat > "$AUDIT_JSON" <<EOF
{
  "phase": "$PHASE",
  "status": "PASS",
  "decision": "$DECISION",
  "lockedDecision": "$LOCKED_DECISION",
  "base": {
    "phase": "092D_QUOTE_PREVIEW_SAFE_STATIC_UI_PATCH_PLAN_DECISION_LOCK",
    "confirmed": true,
    "lockedDecision": "QUOTE_PREVIEW_SAFE_STATIC_UI_PATCH_PLAN_LOCKED_AS_SOURCE_PATCH_SCOPE_PREREQUISITE"
  },
  "next": "$NEXT_AFTER",
  "sourcePatchScope": $(cat "$SOURCE_SCOPE_JSON"),
  "semanticQa": $(cat "$SEMANTIC_QA_JSON"),
  "confirmed": {
    "scopeOnly": true,
    "authorizedSourcePatchFilesScopedFor093B": true,
    "sourceEditsAuthorizedIn093A": false,
    "sourcePatchExecutionAuthorizedIn093A": false,
    "093BMayEditOnlyAuthorizedFiles": true,
    "093BMustFailIfNoAuthorizedFiles": true,
    "requiredVisibleSafetyCopyValidated": true,
    "forbiddenPatchEffectsValidated": true,
    "allEffectsBlocked": true,
    "allSafetyFlagsFalse": true
  },
  "notAuthorized": {
    "uiSourceEditsIn093A": false,
    "componentImplementationIn093A": false,
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
## 093A Quote Preview Safe Static UI Source Patch Scope

093A scopes a future safe static UI source patch for Quote Preview.

Locked decision:
\`$LOCKED_DECISION\`

Outputs:

- \`$ARCH_DOC\`
- \`$EVIDENCE_DOC\`
- \`$SOURCE_SCOPE_JSON\`
- \`$AUDIT_JSON\`

093A does not edit UI source files.

Confirmed:

- source-patch-scope-only;
- authorized source patch files scoped for 093B;
- no source edits authorized in 093A;
- 093B may edit only authorized files;
- 093B must fail if no authorized files exist;
- required visible safety copy preserved;
- forbidden patch effects preserved;
- all effects remain blocked.

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

stage "STAGE 7 VALIDATION"
run bash -n "$SCRIPT_IN_REPO"
run python3 -m json.tool "$AUDIT_JSON"
run rg -n "$PHASE|$DECISION|$LOCKED_DECISION|$NEXT_AFTER|source patch scope|does not edit UI source files|authorized source patch files|must fail if no authorized files|forbidden patch effects preserved" \
  "$ARCH_DOC" "$EVIDENCE_DOC" "$CERT_DOC" "$AUDIT_JSON" "$SOURCE_SCOPE_JSON" \
  FORGE_MASTER_BUILD_TREE.md docs/architecture/source-truth/FORGE_UNIFIED_BUILD_TREE_001.md docs/roadmap/FORGE_ROADMAP_LOCK_001.md

run git diff --check
safety_scan "$ARCH_DOC" "$EVIDENCE_DOC" "$CERT_DOC" "$AUDIT_JSON" "$SOURCE_SCOPE_JSON" \
  FORGE_MASTER_BUILD_TREE.md docs/architecture/source-truth/FORGE_UNIFIED_BUILD_TREE_001.md docs/roadmap/FORGE_ROADMAP_LOCK_001.md

stage "STAGE 8 COMMIT / PUSH"
commit_allowed_subset \
  "docs: scope quote preview safe static ui source patch" \
  FORGE_MASTER_BUILD_TREE.md docs/architecture/source-truth/FORGE_UNIFIED_BUILD_TREE_001.md docs/roadmap/FORGE_ROADMAP_LOCK_001.md \
  "$ARCH_DOC" "$EVIDENCE_DOC" "$CERT_DOC" "$AUDIT_JSON" "$SOURCE_SCOPE_JSON" "$SCRIPT_IN_REPO"

stage "FINAL CHECKPOINT"
run git status --short --branch
run git log --oneline -14

SUMMARY=$(cat <<EOF
PASS_093A_QUOTE_PREVIEW_SAFE_STATIC_UI_SOURCE_PATCH_SCOPE_COMMIT_PUSH_COMPLETE
DECISION=$DECISION
LOCKED_DECISION=$LOCKED_DECISION
NEXT=$NEXT_AFTER
BACKUP=$BACKUP_DIR
REPORT=$REPORT
SOURCE_SCOPE_JSON=$SOURCE_SCOPE_JSON
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
