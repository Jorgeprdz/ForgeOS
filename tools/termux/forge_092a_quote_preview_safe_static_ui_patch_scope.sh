#!/usr/bin/env bash
set -euo pipefail

CHAIN="092A_QUOTE_PREVIEW_SAFE_STATIC_UI_PATCH_SCOPE"
REPO="${REPO:-/storage/emulated/0/Forge OS}"
STAMP="$(date +%Y%m%d_%H%M%S)"
REPORT="/data/data/com.termux/files/home/${CHAIN}_RESULT_${STAMP}.md"
BACKUP_DIR=".forge-backups/092a-safe-static-ui-patch-scope-${STAMP}"
SCRIPT_IN_REPO="tools/termux/forge_092a_quote_preview_safe_static_ui_patch_scope.sh"

PHASE="092A_QUOTE_PREVIEW_SAFE_STATIC_UI_PATCH_SCOPE"
DECISION="PASS_092A_QUOTE_PREVIEW_SAFE_STATIC_UI_PATCH_SCOPE"
LOCKED_DECISION="QUOTE_PREVIEW_SAFE_STATIC_UI_PATCH_SCOPED"
NEXT_AFTER="092B_QUOTE_PREVIEW_SAFE_STATIC_UI_PATCH_PLAN"

PLAN_JSON="docs/evidence/forge-quote-preview-safe-ui-implementation-plan-091b.json"
DISCOVERY_JSON="docs/evidence/forge-quote-preview-safe-ui-implementation-surface-discovery-091a.json"
DECISION_AUDIT_091D="docs/evidence/forge-quote-preview-safe-ui-implementation-plan-decision-audit-091d.json"

SCOPE_JSON="docs/evidence/forge-quote-preview-safe-static-ui-patch-scope-092a.json"
ARCH_DOC="docs/architecture/source-truth/FORGE_QUOTE_PREVIEW_SAFE_STATIC_UI_PATCH_SCOPE_092A.md"
EVIDENCE_DOC="docs/evidence/FORGE_QUOTE_PREVIEW_SAFE_STATIC_UI_PATCH_SCOPE_092A.md"
CERT_DOC="docs/evidence/FORGE_QUOTE_PREVIEW_SAFE_STATIC_UI_PATCH_SCOPE_CERTIFICATE_092A.md"
AUDIT_JSON="docs/evidence/forge-quote-preview-safe-static-ui-patch-scope-audit-092a.json"

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
echo "BOUNDARY=scope only; no UI source edits; no component implementation; no rendering; no CSS injection; no DOM writes; no backend; no quote truth; no sends/writes"

cd "$REPO" || fail "No existe repo: $REPO"

stage "STAGE 1 CHECKPOINT"
run git status --short --branch
run git log --oneline -18
run git diff --name-status
run git diff --cached --name-status
run git reset

stage "STAGE 2 CONFIRM 091D BASE"
if git log --oneline -480 | grep -Eq "091D|safe ui implementation plan decision|QUOTE_PREVIEW_SAFE_UI_IMPLEMENTATION_PLAN_LOCKED_AS_STATIC_UI_PATCH_PREREQUISITE"; then
  pass "091D base found in git log"
elif [ -f "$DECISION_AUDIT_091D" ]; then
  pass "091D audit fallback found"
else
  fail "091D base not found"
fi

for f in "$PLAN_JSON" "$DISCOVERY_JSON" "$DECISION_AUDIT_091D" FORGE_MASTER_BUILD_TREE.md docs/architecture/source-truth/FORGE_UNIFIED_BUILD_TREE_001.md docs/roadmap/FORGE_ROADMAP_LOCK_001.md; do
  [ -f "$f" ] || fail "Missing required file: $f"
  pass "$f"
done

run python3 -m json.tool "$PLAN_JSON"
run python3 -m json.tool "$DISCOVERY_JSON"
run python3 -m json.tool "$DECISION_AUDIT_091D"

if ! rg -n '"next"\s*:\s*"092A_QUOTE_PREVIEW_SAFE_STATIC_UI_PATCH_SCOPE"|QUOTE_PREVIEW_SAFE_UI_IMPLEMENTATION_PLAN_LOCKED_AS_STATIC_UI_PATCH_PREREQUISITE' "$DECISION_AUDIT_091D" >/dev/null; then
  fail "091D audit does not confirm NEXT 092A / prerequisite lock"
fi
pass "091D audit confirms NEXT 092A"

stage "STAGE 3 BACKUP"
mkdir -p "$BACKUP_DIR"
for f in FORGE_MASTER_BUILD_TREE.md docs/architecture/source-truth/FORGE_UNIFIED_BUILD_TREE_001.md docs/roadmap/FORGE_ROADMAP_LOCK_001.md; do
  cp "$f" "$BACKUP_DIR/$(echo "$f" | tr '/ ' '__')"
done
pass "$BACKUP_DIR"

stage "STAGE 4 BUILD 092A SCOPE"
mkdir -p "$(dirname "$SCOPE_JSON")"

python3 - <<'PY' "$PLAN_JSON" "$DISCOVERY_JSON" "$SCOPE_JSON"
from pathlib import Path
import json, sys

plan_path = Path(sys.argv[1])
discovery_path = Path(sys.argv[2])
scope_path = Path(sys.argv[3])

plan = json.loads(plan_path.read_text())
discovery = json.loads(discovery_path.read_text())

zones = plan.get("implementationZones", {})
high = zones.get("highestPriorityCandidates", []) or []
secondary = zones.get("secondaryCandidates", []) or []
all_candidates = []
seen = set()

for item in high + secondary:
    if item in seen:
        continue
    seen.add(item)
    p = Path(item)
    suffix = p.suffix.lower()
    exists = p.exists()
    is_source_candidate = suffix in {".tsx", ".jsx", ".ts", ".js", ".css", ".scss", ".html"}
    is_docs_or_evidence = item.startswith("docs/") and "static-preview" not in item
    is_test = "test" in item.lower() or "spec" in item.lower()
    score = 0
    low = item.lower()
    if exists: score += 20
    if suffix in {".tsx", ".jsx"}: score += 25
    if suffix in {".ts", ".js"}: score += 12
    if "quote" in low or "preview" in low: score += 25
    if "alfred" in low: score += 18
    if "dashboard" in low: score += 12
    if "command" in low: score += 10
    if "static-preview" in low: score += 10
    if is_docs_or_evidence: score -= 20
    if is_test: score -= 30
    all_candidates.append({
        "path": item,
        "exists": exists,
        "suffix": suffix,
        "isSourceCandidate": is_source_candidate,
        "isDocsOrEvidence": is_docs_or_evidence,
        "isTestOrSpec": is_test,
        "score": score
    })

ranked = sorted(all_candidates, key=lambda x: (-x["score"], x["path"]))
canonical_shortlist = [
    c for c in ranked
    if c["exists"] and c["isSourceCandidate"] and not c["isDocsOrEvidence"] and not c["isTestOrSpec"]
][:12]

deferred_candidates = [c for c in ranked if c not in canonical_shortlist][:30]

status = "PASS" if canonical_shortlist else "PASS_WITH_NO_CANONICAL_SOURCE_CANDIDATE_SELECTED"

scope = {
    "phase": "092A_QUOTE_PREVIEW_SAFE_STATIC_UI_PATCH_SCOPE",
    "status": status,
    "scopeType": "safe_static_ui_patch_scope_only",
    "base": {
        "091D": "docs/evidence/forge-quote-preview-safe-ui-implementation-plan-decision-audit-091d.json",
        "091BPlan": str(plan_path),
        "091ADiscovery": str(discovery_path)
    },
    "canonicalUiFileShortlist": canonical_shortlist,
    "deferredCandidates": deferred_candidates,
    "canonicalSelectionRequiredBefore092BPatch": True,
    "uiSourceEditsAuthorizedIn092A": False,
    "staticUiPatchAuthorizedIn092A": False,
    "plannedPatchBoundaryFor092B": {
        "allowed": [
            "select canonical UI file or files from shortlist",
            "produce exact patch plan before source edit",
            "bind visible copy to safe copy and badge system",
            "preserve desktop/mobile layer boundary",
            "preserve preview/read-only/human-review/no-official-quote boundary"
        ],
        "notAllowed": [
            "source edit without canonical file selection",
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
        ]
    },
    "requiredVisibleSafetyCopy": [
        "Preview",
        "Solo lectura",
        "Revisión humana",
        "No cotización oficial",
        "Sin envío",
        "Sin CRM",
        "Sin calendario"
    ],
    "requiredLineage": [
        "086D safe UX state model",
        "087D safe component contracts",
        "088D safe screen composition",
        "089D safe visual layout spec",
        "089R template reconciliation",
        "090D safe copy and badge system",
        "091D safe UI implementation plan decision"
    ],
    "next": "092B_QUOTE_PREVIEW_SAFE_STATIC_UI_PATCH_PLAN",
    "notAuthorized": {
        "uiSourceEditsIn092A": False,
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

scope_path.write_text(json.dumps(scope, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
print(json.dumps(scope, indent=2, ensure_ascii=False))
PY

run python3 -m json.tool "$SCOPE_JSON"

stage "STAGE 5 VALIDATE SCOPE SEMANTICS"
SEMANTIC_QA_JSON="$(mktemp)"
python3 - <<'PY' "$SCOPE_JSON" > "$SEMANTIC_QA_JSON"
from pathlib import Path
import json, sys

scope = json.loads(Path(sys.argv[1]).read_text())
errors = []

if scope.get("phase") != "092A_QUOTE_PREVIEW_SAFE_STATIC_UI_PATCH_SCOPE":
    errors.append("invalid_phase")
if scope.get("status") not in {"PASS", "PASS_WITH_NO_CANONICAL_SOURCE_CANDIDATE_SELECTED"}:
    errors.append("invalid_status")
if scope.get("scopeType") != "safe_static_ui_patch_scope_only":
    errors.append("invalid_scope_type")
if scope.get("next") != "092B_QUOTE_PREVIEW_SAFE_STATIC_UI_PATCH_PLAN":
    errors.append("invalid_next")
if scope.get("canonicalSelectionRequiredBefore092BPatch") is not True:
    errors.append("canonical_selection_required_before_092b")
if scope.get("uiSourceEditsAuthorizedIn092A") is not False:
    errors.append("ui_source_edits_must_not_be_authorized_in_092a")
if scope.get("staticUiPatchAuthorizedIn092A") is not False:
    errors.append("static_ui_patch_must_not_be_authorized_in_092a")

boundary = scope.get("plannedPatchBoundaryFor092B", {})
allowed = boundary.get("allowed", [])
blocked = boundary.get("notAllowed", [])

for item in [
    "select canonical UI file or files from shortlist",
    "produce exact patch plan before source edit",
    "bind visible copy to safe copy and badge system",
    "preserve desktop/mobile layer boundary",
    "preserve preview/read-only/human-review/no-official-quote boundary",
]:
    if item not in allowed:
        errors.append(f"missing_allowed_boundary:{item}")

for item in [
    "source edit without canonical file selection",
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
    if item not in blocked:
        errors.append(f"missing_blocked_boundary:{item}")

for copy in ["Preview", "Solo lectura", "Revisión humana", "No cotización oficial", "Sin envío", "Sin CRM", "Sin calendario"]:
    if copy not in scope.get("requiredVisibleSafetyCopy", []):
        errors.append(f"missing_required_copy:{copy}")

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
    "canonicalShortlistCount": len(scope.get("canonicalUiFileShortlist", [])),
    "canonicalSelectionRequiredBefore092BPatch": scope.get("canonicalSelectionRequiredBefore092BPatch"),
    "uiSourceEditsAuthorizedIn092A": scope.get("uiSourceEditsAuthorizedIn092A"),
    "staticUiPatchAuthorizedIn092A": scope.get("staticUiPatchAuthorizedIn092A"),
    "requiredVisibleSafetyCopyValidated": not any(e.startswith("missing_required_copy") for e in errors),
    "plannedPatchBoundaryValidated": not any(e.startswith("missing_allowed_boundary") or e.startswith("missing_blocked_boundary") for e in errors),
    "allEffectsBlocked": all(v is False for v in not_auth.values()),
    "allSafetyFlagsFalse": all(v is False for v in scope.get("safetyFlags", {}).values()),
    "next": "092B_QUOTE_PREVIEW_SAFE_STATIC_UI_PATCH_PLAN"
}
print(json.dumps(result, indent=2, ensure_ascii=False))
if errors:
    raise SystemExit(1)
PY

cat "$SEMANTIC_QA_JSON"

stage "STAGE 6 WRITE DOCS / AUDIT"
mkdir -p "$(dirname "$ARCH_DOC")" "$(dirname "$EVIDENCE_DOC")"

cat > "$ARCH_DOC" <<EOF
# Forge Quote Preview Safe Static UI Patch Scope 092A

PHASE=$PHASE

STATUS=PASS

DECISION=$DECISION

LOCKED_DECISION=$LOCKED_DECISION

NEXT=$NEXT_AFTER

## Purpose

092A scopes a future safe static UI patch for Quote Preview.

092A does not edit UI source files. It selects and records canonical UI candidates from the 091A/091B discovery and plan so that 092B can produce an exact patch plan.

## Boundary

092A is scope-only.

It does not render components, render screens, mutate UI, inject CSS, write DOM, connect backend, create quote truth, issue quotes, send quotes, write CRM/policy/pipeline/quote records, read PDFs, run parsers, run calculators, call Banxico, or create calendar events.

## Scope Output

- \`$SCOPE_JSON\`

## Required Visible Safety Copy

- Preview
- Solo lectura
- Revisión humana
- No cotización oficial
- Sin envío
- Sin CRM
- Sin calendario

## 092B Guardrail

092B must select canonical UI files before any source patch plan.

092B may only plan a minimal static UI patch. Source edits remain blocked until an explicit later patch step.

## Final Decision

DECISION=$DECISION

LOCKED_DECISION=$LOCKED_DECISION

NEXT=$NEXT_AFTER
EOF

cat > "$EVIDENCE_DOC" <<EOF
# Forge Quote Preview Safe Static UI Patch Scope Evidence 092A

PHASE=$PHASE

STATUS=PASS

DECISION=$DECISION

LOCKED_DECISION=$LOCKED_DECISION

NEXT=$NEXT_AFTER

## Scope JSON

\`\`\`json
$(cat "$SCOPE_JSON")
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
# Forge Quote Preview Safe Static UI Patch Scope Certificate 092A

PHASE=$PHASE

CERTIFICATE_STATUS=PASS

DECISION=$DECISION

LOCKED_DECISION=$LOCKED_DECISION

NEXT=$NEXT_AFTER

092A certifies that safe static UI patch scope has been defined without UI source edits.

$DECISION
EOF

cat > "$AUDIT_JSON" <<EOF
{
  "phase": "$PHASE",
  "status": "PASS",
  "decision": "$DECISION",
  "lockedDecision": "$LOCKED_DECISION",
  "base": {
    "phase": "091D_QUOTE_PREVIEW_SAFE_UI_IMPLEMENTATION_PLAN_DECISION_LOCK",
    "confirmed": true,
    "lockedDecision": "QUOTE_PREVIEW_SAFE_UI_IMPLEMENTATION_PLAN_LOCKED_AS_STATIC_UI_PATCH_PREREQUISITE"
  },
  "next": "$NEXT_AFTER",
  "scope": $(cat "$SCOPE_JSON"),
  "semanticQa": $(cat "$SEMANTIC_QA_JSON"),
  "confirmed": {
    "scopeOnly": true,
    "canonicalSelectionRequiredBefore092BPatch": true,
    "uiSourceEditsAuthorizedIn092A": false,
    "staticUiPatchAuthorizedIn092A": false,
    "requiredVisibleSafetyCopyValidated": true,
    "plannedPatchBoundaryValidated": true,
    "allEffectsBlocked": true,
    "allSafetyFlagsFalse": true
  },
  "notAuthorized": {
    "uiSourceEditsIn092A": false,
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
## 092A Quote Preview Safe Static UI Patch Scope

092A scopes a future safe static UI patch for Quote Preview.

Locked decision:
\`$LOCKED_DECISION\`

Outputs:

- \`$ARCH_DOC\`
- \`$EVIDENCE_DOC\`
- \`$SCOPE_JSON\`
- \`$AUDIT_JSON\`

092A does not edit UI source files.

Confirmed:

- scope-only;
- canonical UI candidates recorded;
- canonical selection required before 092B patch plan;
- required visible safety copy preserved;
- no UI source edits authorized;
- no static UI patch authorized in 092A;
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
run rg -n "$PHASE|$DECISION|$LOCKED_DECISION|$NEXT_AFTER|safe static UI patch scope|does not edit UI source files|canonical UI candidates|required visible safety copy|no static UI patch authorized" \
  "$ARCH_DOC" "$EVIDENCE_DOC" "$CERT_DOC" "$AUDIT_JSON" "$SCOPE_JSON" \
  FORGE_MASTER_BUILD_TREE.md docs/architecture/source-truth/FORGE_UNIFIED_BUILD_TREE_001.md docs/roadmap/FORGE_ROADMAP_LOCK_001.md

run git diff --check
safety_scan "$ARCH_DOC" "$EVIDENCE_DOC" "$CERT_DOC" "$AUDIT_JSON" "$SCOPE_JSON" \
  FORGE_MASTER_BUILD_TREE.md docs/architecture/source-truth/FORGE_UNIFIED_BUILD_TREE_001.md docs/roadmap/FORGE_ROADMAP_LOCK_001.md

stage "STAGE 8 COMMIT / PUSH"
commit_allowed_subset \
  "docs: scope quote preview safe static ui patch" \
  FORGE_MASTER_BUILD_TREE.md docs/architecture/source-truth/FORGE_UNIFIED_BUILD_TREE_001.md docs/roadmap/FORGE_ROADMAP_LOCK_001.md \
  "$ARCH_DOC" "$EVIDENCE_DOC" "$CERT_DOC" "$AUDIT_JSON" "$SCOPE_JSON" "$SCRIPT_IN_REPO"

stage "FINAL CHECKPOINT"
run git status --short --branch
run git log --oneline -14

SUMMARY=$(cat <<EOF
PASS_092A_QUOTE_PREVIEW_SAFE_STATIC_UI_PATCH_SCOPE_COMMIT_PUSH_COMPLETE
DECISION=$DECISION
LOCKED_DECISION=$LOCKED_DECISION
NEXT=$NEXT_AFTER
BACKUP=$BACKUP_DIR
REPORT=$REPORT
SCOPE_JSON=$SCOPE_JSON
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
