#!/usr/bin/env bash
set -euo pipefail

CHAIN="092B_QUOTE_PREVIEW_SAFE_STATIC_UI_PATCH_PLAN"
REPO="${REPO:-/storage/emulated/0/Forge OS}"
STAMP="$(date +%Y%m%d_%H%M%S)"
REPORT="/data/data/com.termux/files/home/${CHAIN}_RESULT_${STAMP}.md"
BACKUP_DIR=".forge-backups/092b-safe-static-ui-patch-plan-${STAMP}"
SCRIPT_IN_REPO="tools/termux/forge_092b_quote_preview_safe_static_ui_patch_plan.sh"

PHASE="092B_QUOTE_PREVIEW_SAFE_STATIC_UI_PATCH_PLAN"
DECISION="PASS_092B_QUOTE_PREVIEW_SAFE_STATIC_UI_PATCH_PLAN"
LOCKED_DECISION="QUOTE_PREVIEW_SAFE_STATIC_UI_PATCH_PLAN_LOCKED"
NEXT_AFTER="092C_QUOTE_PREVIEW_SAFE_STATIC_UI_PATCH_PLAN_QA_LOCK"

SCOPE_JSON="docs/evidence/forge-quote-preview-safe-static-ui-patch-scope-092a.json"
SCOPE_AUDIT="docs/evidence/forge-quote-preview-safe-static-ui-patch-scope-audit-092a.json"
SCOPE_DOC="docs/architecture/source-truth/FORGE_QUOTE_PREVIEW_SAFE_STATIC_UI_PATCH_SCOPE_092A.md"

PATCH_PLAN_JSON="docs/evidence/forge-quote-preview-safe-static-ui-patch-plan-092b.json"
ARCH_DOC="docs/architecture/source-truth/FORGE_QUOTE_PREVIEW_SAFE_STATIC_UI_PATCH_PLAN_092B.md"
EVIDENCE_DOC="docs/evidence/FORGE_QUOTE_PREVIEW_SAFE_STATIC_UI_PATCH_PLAN_092B.md"
CERT_DOC="docs/evidence/FORGE_QUOTE_PREVIEW_SAFE_STATIC_UI_PATCH_PLAN_CERTIFICATE_092B.md"
AUDIT_JSON="docs/evidence/forge-quote-preview-safe-static-ui-patch-plan-audit-092b.json"

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
echo "BOUNDARY=patch plan only; no UI source edits; no component implementation; no rendering; no CSS injection; no DOM writes; no backend; no quote truth; no sends/writes"

cd "$REPO" || fail "No existe repo: $REPO"

stage "STAGE 1 CHECKPOINT"
run git status --short --branch
run git log --oneline -18
run git diff --name-status
run git diff --cached --name-status
run git reset

stage "STAGE 2 CONFIRM 092A BASE"
if git log --oneline -520 | grep -Eq "092A|scope quote preview safe static ui patch|QUOTE_PREVIEW_SAFE_STATIC_UI_PATCH_SCOPED"; then
  pass "092A base found in git log"
elif [ -f "$SCOPE_AUDIT" ]; then
  pass "092A audit fallback found"
else
  fail "092A base not found"
fi

for f in "$SCOPE_JSON" "$SCOPE_AUDIT" "$SCOPE_DOC" FORGE_MASTER_BUILD_TREE.md docs/architecture/source-truth/FORGE_UNIFIED_BUILD_TREE_001.md docs/roadmap/FORGE_ROADMAP_LOCK_001.md; do
  [ -f "$f" ] || fail "Missing required file: $f"
  pass "$f"
done

run python3 -m json.tool "$SCOPE_JSON"
run python3 -m json.tool "$SCOPE_AUDIT"

if ! rg -n '"next"\s*:\s*"092B_QUOTE_PREVIEW_SAFE_STATIC_UI_PATCH_PLAN"|QUOTE_PREVIEW_SAFE_STATIC_UI_PATCH_SCOPED' "$SCOPE_AUDIT" >/dev/null; then
  fail "092A audit does not confirm NEXT 092B / scope lock"
fi
pass "092A audit confirms NEXT 092B"

stage "STAGE 3 BACKUP"
mkdir -p "$BACKUP_DIR"
for f in FORGE_MASTER_BUILD_TREE.md docs/architecture/source-truth/FORGE_UNIFIED_BUILD_TREE_001.md docs/roadmap/FORGE_ROADMAP_LOCK_001.md; do
  cp "$f" "$BACKUP_DIR/$(echo "$f" | tr '/ ' '__')"
done
pass "$BACKUP_DIR"

stage "STAGE 4 BUILD PATCH PLAN"
mkdir -p "$(dirname "$PATCH_PLAN_JSON")"

python3 - <<'PY' "$SCOPE_JSON" "$PATCH_PLAN_JSON"
from pathlib import Path
import json, sys, re

scope_path = Path(sys.argv[1])
plan_path = Path(sys.argv[2])
scope = json.loads(scope_path.read_text())

shortlist = scope.get("canonicalUiFileShortlist", [])
selected = []
for candidate in shortlist:
    p = Path(candidate.get("path", ""))
    if not p.exists():
        continue
    suffix = p.suffix.lower()
    if suffix in {".tsx", ".jsx", ".ts", ".js", ".css", ".scss", ".html"} and not candidate.get("isTestOrSpec") and not candidate.get("isDocsOrEvidence"):
        selected.append(candidate)
    if len(selected) >= 3:
        break

def inspect_file(path: str):
    p = Path(path)
    info = {
        "path": path,
        "exists": p.exists(),
        "sizeBytes": p.stat().st_size if p.exists() else 0,
        "detectedMarkers": [],
        "safeInsertionStrategy": "manual_patch_plan_required"
    }
    if not p.exists():
        return info

    text = p.read_text(encoding="utf-8", errors="ignore")
    markers = []
    checks = {
        "hasPreviewCopy": r"Preview|preview",
        "hasAlfred": r"Alfred",
        "hasCommand": r"command|Command",
        "hasDashboard": r"Dashboard|dashboard|Mi día",
        "hasQuotePreview": r"QuotePreview|quotePreview|quote-preview",
        "hasSafetyCopy": r"No cotización oficial|Solo lectura|Sin CRM|Sin calendario|Sin envío",
        "hasDesktopHints": r"sidebar|table|KPI|desktop",
        "hasMobileHints": r"bottom|mobile|widget|card"
    }
    for name, pattern in checks.items():
        if re.search(pattern, text):
            markers.append(name)
    info["detectedMarkers"] = markers

    if "hasQuotePreview" in markers or "hasPreviewCopy" in markers:
        info["safeInsertionStrategy"] = "augment_existing_preview_boundary_copy_and_badges"
    elif "hasDashboard" in markers or "hasAlfred" in markers:
        info["safeInsertionStrategy"] = "add_static_preview_boundary_section_near_dashboard_header"
    else:
        info["safeInsertionStrategy"] = "requires_human_selection_before_patch"
    return info

selected_inspection = [inspect_file(c["path"]) for c in selected]

status = "PASS" if selected else "PASS_WITH_MANUAL_CANONICAL_SELECTION_REQUIRED"

patch_operations = []
for item in selected_inspection:
    strategy = item["safeInsertionStrategy"]
    path = item["path"]
    if strategy == "augment_existing_preview_boundary_copy_and_badges":
        patch_operations.append({
            "targetPath": path,
            "operationType": "planned_static_source_patch_only",
            "operation": "add_or_update_visible_preview_boundary_badge_stack",
            "requiredVisibleCopy": ["Preview", "Solo lectura", "No cotización oficial", "Revisión humana"],
            "optionalRiskCopy": ["Sin envío", "Sin CRM", "Sin calendario"],
            "placementRule": "near existing preview/status/header boundary, without changing data flow",
            "sourceEditAuthorizedBy092B": False
        })
    elif strategy == "add_static_preview_boundary_section_near_dashboard_header":
        patch_operations.append({
            "targetPath": path,
            "operationType": "planned_static_source_patch_only",
            "operation": "add_static_quote_preview_boundary_section",
            "requiredVisibleCopy": ["Preview", "Solo lectura", "No cotización oficial"],
            "optionalRiskCopy": ["Sin envío", "Sin CRM", "Sin calendario"],
            "placementRule": "near dashboard or Alfred decision header, compact and non-executing",
            "sourceEditAuthorizedBy092B": False
        })
    else:
        patch_operations.append({
            "targetPath": path,
            "operationType": "manual_review_required",
            "operation": "do_not_patch_until_human_confirms_canonical_surface",
            "requiredVisibleCopy": ["Preview", "Solo lectura", "No cotización oficial"],
            "optionalRiskCopy": ["Sin envío", "Sin CRM", "Sin calendario"],
            "placementRule": "not selected",
            "sourceEditAuthorizedBy092B": False
        })

plan = {
    "phase": "092B_QUOTE_PREVIEW_SAFE_STATIC_UI_PATCH_PLAN",
    "status": status,
    "planType": "safe_static_ui_patch_plan_only",
    "base": {
        "092AScope": str(scope_path),
        "091DDecision": "docs/evidence/forge-quote-preview-safe-ui-implementation-plan-decision-audit-091d.json",
        "090DCopyBadge": "docs/evidence/forge-quote-preview-safe-copy-and-badge-system-decision-audit-090d.json",
        "089RVisualReconciliation": "docs/evidence/forge-quote-preview-safe-visual-layout-spec-template-reconciliation-audit-089r.json"
    },
    "selectedCanonicalUiFiles": selected,
    "selectedCanonicalUiFileInspection": selected_inspection,
    "patchOperationsPlanned": patch_operations,
    "sourceEditsAuthorizedIn092B": False,
    "staticPatchExecutionAuthorizedIn092B": False,
    "requires092CPlanQaBeforeDecision": True,
    "requires092DDecisionBeforeSourcePatchScope": True,
    "requiredVisibleSafetyCopy": ["Preview", "Solo lectura", "Revisión humana", "No cotización oficial", "Sin envío", "Sin CRM", "Sin calendario"],
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
        "runtime browser storage or network primitives"
    ],
    "plannedPatchConstraints": [
        "Use static copy only.",
        "Do not introduce new data dependencies.",
        "Do not change business calculations.",
        "Do not change quote truth boundaries.",
        "Do not add action handlers that imply real effects.",
        "Do not alter provider, parser, calculator, Banxico, CRM, calendar, policy, pipeline, or quote modules.",
        "Preserve desktop/mobile layer boundaries from 089R.",
        "Preserve safe copy and badge labels from 090D."
    ],
    "next": "092C_QUOTE_PREVIEW_SAFE_STATIC_UI_PATCH_PLAN_QA_LOCK",
    "notAuthorized": {
        "uiSourceEditsIn092B": False,
        "componentImplementation": False,
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

plan_path.write_text(json.dumps(plan, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
print(json.dumps(plan, indent=2, ensure_ascii=False))
PY

run python3 -m json.tool "$PATCH_PLAN_JSON"

stage "STAGE 5 VALIDATE PATCH PLAN"
SEMANTIC_QA_JSON="$(mktemp)"
python3 - <<'PY' "$PATCH_PLAN_JSON" > "$SEMANTIC_QA_JSON"
from pathlib import Path
import json, sys

plan = json.loads(Path(sys.argv[1]).read_text())
errors = []

if plan.get("phase") != "092B_QUOTE_PREVIEW_SAFE_STATIC_UI_PATCH_PLAN":
    errors.append("invalid_phase")
if plan.get("status") not in {"PASS", "PASS_WITH_MANUAL_CANONICAL_SELECTION_REQUIRED"}:
    errors.append("invalid_status")
if plan.get("planType") != "safe_static_ui_patch_plan_only":
    errors.append("invalid_plan_type")
if plan.get("next") != "092C_QUOTE_PREVIEW_SAFE_STATIC_UI_PATCH_PLAN_QA_LOCK":
    errors.append("invalid_next")
if plan.get("sourceEditsAuthorizedIn092B") is not False:
    errors.append("source_edits_must_not_be_authorized")
if plan.get("staticPatchExecutionAuthorizedIn092B") is not False:
    errors.append("static_patch_execution_must_not_be_authorized")
if plan.get("requires092CPlanQaBeforeDecision") is not True:
    errors.append("requires_092c_qa")
if plan.get("requires092DDecisionBeforeSourcePatchScope") is not True:
    errors.append("requires_092d_decision")

for copy in ["Preview", "Solo lectura", "Revisión humana", "No cotización oficial", "Sin envío", "Sin CRM", "Sin calendario"]:
    if copy not in plan.get("requiredVisibleSafetyCopy", []):
        errors.append(f"missing_required_visible_copy:{copy}")

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
]:
    if item not in plan.get("forbiddenPatchEffects", []):
        errors.append(f"missing_forbidden_effect:{item}")

for op in plan.get("patchOperationsPlanned", []):
    if op.get("sourceEditAuthorizedBy092B") is not False:
        errors.append(f"operation_source_edit_authorized:{op.get('targetPath')}")
    if op.get("operationType") not in {"planned_static_source_patch_only", "manual_review_required"}:
        errors.append(f"invalid_operation_type:{op.get('targetPath')}")

not_auth = plan.get("notAuthorized", {})
for key, value in not_auth.items():
    if value is not False:
        errors.append(f"not_authorized_flag_not_false:{key}")

for key, value in plan.get("safetyFlags", {}).items():
    if value is not False:
        errors.append(f"safety_flag_not_false:{key}")

result = {
    "status": "PASS" if not errors else "HOLD",
    "planValidated": not errors,
    "errors": errors,
    "selectedCanonicalUiFileCount": len(plan.get("selectedCanonicalUiFiles", [])),
    "patchOperationPlanCount": len(plan.get("patchOperationsPlanned", [])),
    "sourceEditsAuthorizedIn092B": plan.get("sourceEditsAuthorizedIn092B"),
    "staticPatchExecutionAuthorizedIn092B": plan.get("staticPatchExecutionAuthorizedIn092B"),
    "requiredVisibleSafetyCopyValidated": not any(e.startswith("missing_required_visible_copy") for e in errors),
    "forbiddenPatchEffectsValidated": not any(e.startswith("missing_forbidden_effect") for e in errors),
    "operationBoundariesValidated": not any(e.startswith("operation_source_edit_authorized") for e in errors),
    "allEffectsBlocked": all(v is False for v in not_auth.values()),
    "allSafetyFlagsFalse": all(v is False for v in plan.get("safetyFlags", {}).values()),
    "next": "092C_QUOTE_PREVIEW_SAFE_STATIC_UI_PATCH_PLAN_QA_LOCK"
}
print(json.dumps(result, indent=2, ensure_ascii=False))
if errors:
    raise SystemExit(1)
PY

cat "$SEMANTIC_QA_JSON"

stage "STAGE 6 WRITE DOCS / AUDIT"
mkdir -p "$(dirname "$ARCH_DOC")" "$(dirname "$EVIDENCE_DOC")"

cat > "$ARCH_DOC" <<EOF
# Forge Quote Preview Safe Static UI Patch Plan 092B

PHASE=$PHASE

STATUS=PASS

DECISION=$DECISION

LOCKED_DECISION=$LOCKED_DECISION

NEXT=$NEXT_AFTER

## Purpose

092B creates a safe static UI patch plan for Quote Preview.

092B does not edit UI source files. It does not execute the patch. It only records selected canonical UI files and planned safe static patch operations for later QA and decision lock.

## Boundary

092B is patch-plan-only.

It does not render components, render screens, mutate UI, inject CSS, write DOM, connect backend, create quote truth, issue quotes, send quotes, write CRM/policy/pipeline/quote records, read PDFs, run parsers, run calculators, call Banxico, or create calendar events.

## Plan Output

- \`$PATCH_PLAN_JSON\`

## Required Visible Safety Copy

- Preview
- Solo lectura
- Revisión humana
- No cotización oficial
- Sin envío
- Sin CRM
- Sin calendario

## Forbidden Patch Effects

- backend connection;
- provider call;
- parser execution;
- calculator execution;
- Banxico call;
- quote truth creation;
- official quote claim;
- send action;
- CRM write;
- calendar creation;
- runtime browser storage or network primitives.

## Next Guardrail

092C must QA lock this patch plan before 092D can decision-lock it.

No source patch is authorized by 092B.

## Final Decision

DECISION=$DECISION

LOCKED_DECISION=$LOCKED_DECISION

NEXT=$NEXT_AFTER
EOF

cat > "$EVIDENCE_DOC" <<EOF
# Forge Quote Preview Safe Static UI Patch Plan Evidence 092B

PHASE=$PHASE

STATUS=PASS

DECISION=$DECISION

LOCKED_DECISION=$LOCKED_DECISION

NEXT=$NEXT_AFTER

## Patch Plan

\`\`\`json
$(cat "$PATCH_PLAN_JSON")
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
# Forge Quote Preview Safe Static UI Patch Plan Certificate 092B

PHASE=$PHASE

CERTIFICATE_STATUS=PASS

DECISION=$DECISION

LOCKED_DECISION=$LOCKED_DECISION

NEXT=$NEXT_AFTER

092B certifies that a safe static UI patch plan has been created without UI source edits.

$DECISION
EOF

cat > "$AUDIT_JSON" <<EOF
{
  "phase": "$PHASE",
  "status": "PASS",
  "decision": "$DECISION",
  "lockedDecision": "$LOCKED_DECISION",
  "base": {
    "phase": "092A_QUOTE_PREVIEW_SAFE_STATIC_UI_PATCH_SCOPE",
    "confirmed": true,
    "lockedDecision": "QUOTE_PREVIEW_SAFE_STATIC_UI_PATCH_SCOPED"
  },
  "next": "$NEXT_AFTER",
  "patchPlan": $(cat "$PATCH_PLAN_JSON"),
  "semanticQa": $(cat "$SEMANTIC_QA_JSON"),
  "confirmed": {
    "planOnly": true,
    "sourceEditsAuthorizedIn092B": false,
    "staticPatchExecutionAuthorizedIn092B": false,
    "requiredVisibleSafetyCopyValidated": true,
    "forbiddenPatchEffectsValidated": true,
    "operationBoundariesValidated": true,
    "allEffectsBlocked": true,
    "allSafetyFlagsFalse": true
  },
  "notAuthorized": {
    "uiSourceEditsIn092B": false,
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
## 092B Quote Preview Safe Static UI Patch Plan

092B creates a safe static UI patch plan for Quote Preview.

Locked decision:
\`$LOCKED_DECISION\`

Outputs:

- \`$ARCH_DOC\`
- \`$EVIDENCE_DOC\`
- \`$PATCH_PLAN_JSON\`
- \`$AUDIT_JSON\`

092B does not edit UI source files and does not execute the patch.

Confirmed:

- patch-plan-only;
- selected canonical UI files recorded when available;
- planned safe static patch operations recorded;
- required visible safety copy preserved;
- forbidden patch effects preserved;
- no source edit authorized;
- no static patch execution authorized;
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
run rg -n "$PHASE|$DECISION|$LOCKED_DECISION|$NEXT_AFTER|safe static UI patch plan|does not edit UI source files|No source patch is authorized|selected canonical UI files|forbidden patch effects" \
  "$ARCH_DOC" "$EVIDENCE_DOC" "$CERT_DOC" "$AUDIT_JSON" "$PATCH_PLAN_JSON" \
  FORGE_MASTER_BUILD_TREE.md docs/architecture/source-truth/FORGE_UNIFIED_BUILD_TREE_001.md docs/roadmap/FORGE_ROADMAP_LOCK_001.md

run git diff --check
safety_scan "$ARCH_DOC" "$EVIDENCE_DOC" "$CERT_DOC" "$AUDIT_JSON" "$PATCH_PLAN_JSON" \
  FORGE_MASTER_BUILD_TREE.md docs/architecture/source-truth/FORGE_UNIFIED_BUILD_TREE_001.md docs/roadmap/FORGE_ROADMAP_LOCK_001.md

stage "STAGE 8 COMMIT / PUSH"
commit_allowed_subset \
  "docs: plan quote preview safe static ui patch" \
  FORGE_MASTER_BUILD_TREE.md docs/architecture/source-truth/FORGE_UNIFIED_BUILD_TREE_001.md docs/roadmap/FORGE_ROADMAP_LOCK_001.md \
  "$ARCH_DOC" "$EVIDENCE_DOC" "$CERT_DOC" "$AUDIT_JSON" "$PATCH_PLAN_JSON" "$SCRIPT_IN_REPO"

stage "FINAL CHECKPOINT"
run git status --short --branch
run git log --oneline -14

SUMMARY=$(cat <<EOF
PASS_092B_QUOTE_PREVIEW_SAFE_STATIC_UI_PATCH_PLAN_COMMIT_PUSH_COMPLETE
DECISION=$DECISION
LOCKED_DECISION=$LOCKED_DECISION
NEXT=$NEXT_AFTER
BACKUP=$BACKUP_DIR
REPORT=$REPORT
PATCH_PLAN_JSON=$PATCH_PLAN_JSON
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
