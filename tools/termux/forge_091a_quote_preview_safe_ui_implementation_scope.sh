#!/usr/bin/env bash
set -euo pipefail

CHAIN="091A_QUOTE_PREVIEW_SAFE_UI_IMPLEMENTATION_SCOPE"
REPO="${REPO:-/storage/emulated/0/Forge OS}"
STAMP="$(date +%Y%m%d_%H%M%S)"
REPORT="/data/data/com.termux/files/home/${CHAIN}_RESULT_${STAMP}.md"
BACKUP_DIR=".forge-backups/091a-safe-ui-implementation-scope-${STAMP}"
SCRIPT_IN_REPO="tools/termux/forge_091a_quote_preview_safe_ui_implementation_scope.sh"

PHASE="091A_QUOTE_PREVIEW_SAFE_UI_IMPLEMENTATION_SCOPE"
DECISION="PASS_091A_QUOTE_PREVIEW_SAFE_UI_IMPLEMENTATION_SCOPE"
LOCKED_DECISION="QUOTE_PREVIEW_SAFE_UI_IMPLEMENTATION_SCOPED"
NEXT_AFTER="091B_QUOTE_PREVIEW_SAFE_UI_IMPLEMENTATION_PLAN"

COPY_BADGE_ADAPTER="platform/adapters/quote-preview/quote-preview-safe-copy-badge-system-registry-adapter-090b.js"
COPY_BADGE_TEST="tests/quote-preview-safe-copy-badge-system-registry-adapter-090b-test.js"
COPY_BADGE_AUDIT="docs/evidence/forge-quote-preview-safe-copy-and-badge-system-decision-audit-090d.json"

ARCH_DOC="docs/architecture/source-truth/FORGE_QUOTE_PREVIEW_SAFE_UI_IMPLEMENTATION_SCOPE_091A.md"
EVIDENCE_DOC="docs/evidence/FORGE_QUOTE_PREVIEW_SAFE_UI_IMPLEMENTATION_SCOPE_091A.md"
CERT_DOC="docs/evidence/FORGE_QUOTE_PREVIEW_SAFE_UI_IMPLEMENTATION_SCOPE_CERTIFICATE_091A.md"
AUDIT_JSON="docs/evidence/forge-quote-preview-safe-ui-implementation-scope-audit-091a.json"
DISCOVERY_JSON="docs/evidence/forge-quote-preview-safe-ui-implementation-surface-discovery-091a.json"
DISCOVERY_MD="docs/evidence/FORGE_QUOTE_PREVIEW_SAFE_UI_IMPLEMENTATION_SURFACE_DISCOVERY_091A.md"

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
  run git push origin HEAD:main
}

mkdir -p "$(dirname "$REPORT")"
touch "$REPORT"
exec > >(tee -a "$REPORT") 2>&1

stage "STAGE 0 HEADER"
echo "CHAIN=$CHAIN"
echo "REPORT=$REPORT"
echo "BOUNDARY=scope/discovery only; no UI source edits; no rendering; no CSS injection; no DOM writes; no backend; no quote truth; no sends/writes"

cd "$REPO" || fail "No existe repo: $REPO"

stage "STAGE 1 CHECKPOINT"
run git status --short --branch
run git log --oneline -18
run git diff --name-status
run git diff --cached --name-status
run git reset

stage "STAGE 2 CONFIRM 090D BASE"
if git log --oneline -360 | grep -Eq "090D|safe copy and badge system decision|QUOTE_PREVIEW_SAFE_COPY_AND_BADGE_SYSTEM_LOCKED_AS_LOCAL_STATIC_READ_ONLY_REFERENCE_REGISTRY"; then
  pass "090D base found in git log"
elif [ -f "$COPY_BADGE_AUDIT" ]; then
  pass "090D audit fallback found"
else
  fail "090D base not found"
fi

for f in "$COPY_BADGE_ADAPTER" "$COPY_BADGE_TEST" "$COPY_BADGE_AUDIT" FORGE_MASTER_BUILD_TREE.md docs/architecture/source-truth/FORGE_UNIFIED_BUILD_TREE_001.md docs/roadmap/FORGE_ROADMAP_LOCK_001.md; do
  [ -f "$f" ] || fail "Missing required file: $f"
  pass "$f"
done

run python3 -m json.tool "$COPY_BADGE_AUDIT"
if ! rg -n '"next"\s*:\s*"091A_QUOTE_PREVIEW_SAFE_UI_IMPLEMENTATION_SCOPE"|QUOTE_PREVIEW_SAFE_COPY_AND_BADGE_SYSTEM_LOCKED_AS_LOCAL_STATIC_READ_ONLY_REFERENCE_REGISTRY' "$COPY_BADGE_AUDIT" >/dev/null; then
  fail "090D audit does not confirm NEXT 091A / lock"
fi

stage "STAGE 3 BACKUP"
mkdir -p "$BACKUP_DIR"
for f in FORGE_MASTER_BUILD_TREE.md docs/architecture/source-truth/FORGE_UNIFIED_BUILD_TREE_001.md docs/roadmap/FORGE_ROADMAP_LOCK_001.md; do
  cp "$f" "$BACKUP_DIR/$(echo "$f" | tr '/ ' '__')"
done
pass "$BACKUP_DIR"

stage "STAGE 4 BASE VALIDATION"
run node --check "$COPY_BADGE_ADAPTER"
run node --check "$COPY_BADGE_TEST"
run node "$COPY_BADGE_TEST"

stage "STAGE 5 DISCOVER UI SURFACES"
mkdir -p "$(dirname "$DISCOVERY_JSON")"

python3 - <<'PY' "$DISCOVERY_JSON" "$DISCOVERY_MD"
from pathlib import Path
import json, re, sys

target_json = Path(sys.argv[1])
target_md = Path(sys.argv[2])
root = Path(".")
ignore = {".git", "node_modules", ".forge-backups", "dist", "build", ".next", "coverage"}

def skip(p: Path):
    return any(part in ignore for part in p.parts)

all_files = [p for p in root.rglob("*") if p.is_file() and not skip(p)]

package_files = [p for p in all_files if p.name in {
    "package.json", "vite.config.ts", "vite.config.js", "next.config.js",
    "next.config.mjs", "tsconfig.json", "tailwind.config.js", "tailwind.config.ts"
}]

front_ext = {".tsx", ".jsx", ".ts", ".js", ".css", ".scss", ".html"}
front_files = [p for p in all_files if p.suffix in front_ext]

candidate_dirs = []
for d in ["app", "src", "pages", "components", "ui", "frontend", "client", "web", "static-preview", "docs/static-preview", "apps"]:
    if Path(d).exists():
        candidate_dirs.append(d)

def rels(paths, limit=180):
    return [str(p) for p in sorted(paths, key=lambda x: str(x))[:limit]]

path_rx = re.compile(r"quote[-_ ]?preview|alfred|dashboard|command|cotiza|preview|pipeline|mobile|desktop", re.I)
ui_by_path = [p for p in front_files if path_rx.search(str(p))]

content_rx = re.compile(r"QuotePreview|quotePreview|quote-preview|Alfred|Mi día|Preparar preview|No cotización oficial|Sin CRM|Sin calendario|Preview", re.I)
ui_by_content = []
for p in front_files:
    try:
        txt = p.read_text(encoding="utf-8", errors="ignore")
    except Exception:
        continue
    if content_rx.search(txt):
        ui_by_content.append(p)

design_docs = [p for p in all_files if p.suffix.lower() == ".md" and re.search(r"design|template|mobile|desktop|layout|ui|ux|visual|quote_preview|preview", str(p), re.I)]

framework = {
    "packageJsonFiles": rels([p for p in package_files if p.name == "package.json"], 25),
    "viteConfigPresent": any(p.name.startswith("vite.config") for p in package_files),
    "nextConfigPresent": any(p.name.startswith("next.config") for p in package_files),
    "tailwindConfigPresent": any(p.name.startswith("tailwind.config") for p in package_files),
    "tsxCount": sum(1 for p in front_files if p.suffix == ".tsx"),
    "jsxCount": sum(1 for p in front_files if p.suffix == ".jsx"),
    "cssCount": sum(1 for p in front_files if p.suffix in {".css", ".scss"}),
}

result = {
    "phase": "091A_QUOTE_PREVIEW_SAFE_UI_IMPLEMENTATION_SCOPE",
    "status": "PASS",
    "discoveryType": "ui_implementation_surface_discovery_scope_only",
    "frameworkSignals": framework,
    "surfaceClassification": {
        "candidateUiDirs": candidate_dirs,
        "packageFiles": rels(package_files, 80),
        "uiCandidateFilesByPath": rels(ui_by_path, 180),
        "uiCandidateFilesByContent": rels(ui_by_content, 180),
        "designDocs": rels(design_docs, 180)
    },
    "riskNotes": [
        "091A is scope/discovery only and must not edit UI source files.",
        "091B must choose canonical UI files from discovery before implementation.",
        "Desktop/mobile layer boundary from 089R remains binding.",
        "Copy/badge system from 090D remains binding.",
        "Action labels implying official quote, send, CRM write, calendar creation, backend execution, or quote truth are blocked."
    ],
    "authorizedNext": {
        "phase": "091B_QUOTE_PREVIEW_SAFE_UI_IMPLEMENTATION_PLAN",
        "allowed": "plan_only_or_minimal_static_ui_patch_after_canonical_files_are_selected",
        "notAllowed": [
            "backend connection",
            "quote truth",
            "provider call",
            "parser execution",
            "calculator execution",
            "Banxico call",
            "CRM/policy/pipeline/quote writes",
            "send",
            "calendar creation"
        ]
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

target_json.write_text(json.dumps(result, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")

md = [
    "# Forge Quote Preview Safe UI Implementation Surface Discovery 091A",
    "",
    "PHASE=091A_QUOTE_PREVIEW_SAFE_UI_IMPLEMENTATION_SCOPE",
    "",
    "STATUS=PASS",
    "",
    "## Framework signals",
    "",
    "```json",
    json.dumps(framework, indent=2, ensure_ascii=False),
    "```",
    "",
    "## Candidate UI dirs",
]
for item in candidate_dirs:
    md.append(f"- `{item}`")
md += ["", "## UI candidate files by path"]
for item in result["surfaceClassification"]["uiCandidateFilesByPath"][:120]:
    md.append(f"- `{item}`")
md += ["", "## UI candidate files by content"]
for item in result["surfaceClassification"]["uiCandidateFilesByContent"][:120]:
    md.append(f"- `{item}`")
md += ["", "## Design docs"]
for item in result["surfaceClassification"]["designDocs"][:120]:
    md.append(f"- `{item}`")
md += ["", "## Risk notes"]
for item in result["riskNotes"]:
    md.append(f"- {item}")
md += ["", "## Next", "", "NEXT=091B_QUOTE_PREVIEW_SAFE_UI_IMPLEMENTATION_PLAN"]
target_md.write_text("\n".join(md).rstrip() + "\n", encoding="utf-8")
print(json.dumps(result, indent=2, ensure_ascii=False))
PY

run python3 -m json.tool "$DISCOVERY_JSON"

stage "STAGE 6 WRITE DOCS"
mkdir -p "$(dirname "$ARCH_DOC")" "$(dirname "$EVIDENCE_DOC")"

cat > "$ARCH_DOC" <<EOF
# Forge Quote Preview Safe UI Implementation Scope 091A

PHASE=$PHASE

STATUS=PASS

DECISION=$DECISION

LOCKED_DECISION=$LOCKED_DECISION

NEXT=$NEXT_AFTER

## Purpose

091A scopes safe UI implementation for Quote Preview through read-only UI surface discovery.

091A is not UI implementation. It does not edit UI source files.

## Boundary

091A does not render components, render screens, mutate UI, inject CSS, write DOM, connect backend, create quote truth, issue quotes, send quotes, write CRM/policy/pipeline/quote records, read PDFs, run parsers, run calculators, call Banxico, or create calendar events.

## Scope Output

- \`$DISCOVERY_JSON\`
- \`$DISCOVERY_MD\`

## Source Requirements for 091B

091B must use:

- 086D safe UX state model;
- 087D safe component contracts;
- 088D safe screen composition;
- 089D safe visual layout spec;
- 089R template reconciliation;
- 090D safe copy and badge system;
- 091A UI surface discovery.

## 091B Guardrail

091B may only plan or patch safe static UI after canonical UI files are selected.

It must not authorize backend connection, quote truth, provider calls, parser/calculator/Banxico execution, CRM/policy/pipeline/quote writes, send, or calendar creation.

## Final Decision

DECISION=$DECISION

LOCKED_DECISION=$LOCKED_DECISION

NEXT=$NEXT_AFTER
EOF

cat > "$EVIDENCE_DOC" <<EOF
# Forge Quote Preview Safe UI Implementation Scope Evidence 091A

PHASE=$PHASE

STATUS=PASS

DECISION=$DECISION

LOCKED_DECISION=$LOCKED_DECISION

NEXT=$NEXT_AFTER

## Surface Discovery

\`\`\`json
$(cat "$DISCOVERY_JSON")
\`\`\`

## Final

DECISION=$DECISION

LOCKED_DECISION=$LOCKED_DECISION

NEXT=$NEXT_AFTER
EOF

cat > "$CERT_DOC" <<EOF
# Forge Quote Preview Safe UI Implementation Scope Certificate 091A

PHASE=$PHASE

CERTIFICATE_STATUS=PASS

DECISION=$DECISION

LOCKED_DECISION=$LOCKED_DECISION

NEXT=$NEXT_AFTER

091A certifies that safe UI implementation has been scoped through read-only UI surface discovery.

$DECISION
EOF

cat > "$AUDIT_JSON" <<EOF
{
  "phase": "$PHASE",
  "status": "PASS",
  "decision": "$DECISION",
  "lockedDecision": "$LOCKED_DECISION",
  "base": {
    "phase": "090D_QUOTE_PREVIEW_SAFE_COPY_AND_BADGE_SYSTEM_DECISION_LOCK",
    "confirmed": true,
    "lockedDecision": "QUOTE_PREVIEW_SAFE_COPY_AND_BADGE_SYSTEM_LOCKED_AS_LOCAL_STATIC_READ_ONLY_REFERENCE_REGISTRY"
  },
  "next": "$NEXT_AFTER",
  "scopeType": "safe_ui_implementation_surface_discovery_scope_only",
  "surfaceDiscovery": $(cat "$DISCOVERY_JSON"),
  "notAuthorized": {
    "uiSourceEdits": false,
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
## 091A Quote Preview Safe UI Implementation Scope

091A scopes safe UI implementation through read-only UI surface discovery.

Locked decision:
\`$LOCKED_DECISION\`

Outputs:

- \`$ARCH_DOC\`
- \`$EVIDENCE_DOC\`
- \`$DISCOVERY_JSON\`
- \`$DISCOVERY_MD\`
- \`$AUDIT_JSON\`

091A does not edit UI source files.

091B must select canonical UI files before any safe static UI implementation plan.

Forbidden without later explicit unlock:

- backend connection;
- quote truth;
- provider call;
- parser/calculator/Banxico execution;
- CRM/policy/pipeline/quote writes;
- send;
- calendar creation.

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
run rg -n "$PHASE|$DECISION|$LOCKED_DECISION|$NEXT_AFTER|surface discovery|canonical UI files|does not edit UI source files" \
  "$ARCH_DOC" "$EVIDENCE_DOC" "$CERT_DOC" "$DISCOVERY_MD" "$AUDIT_JSON" "$DISCOVERY_JSON" \
  FORGE_MASTER_BUILD_TREE.md docs/architecture/source-truth/FORGE_UNIFIED_BUILD_TREE_001.md docs/roadmap/FORGE_ROADMAP_LOCK_001.md

run git diff --check
safety_scan "$ARCH_DOC" "$EVIDENCE_DOC" "$CERT_DOC" "$DISCOVERY_MD" "$AUDIT_JSON" "$DISCOVERY_JSON" \
  FORGE_MASTER_BUILD_TREE.md docs/architecture/source-truth/FORGE_UNIFIED_BUILD_TREE_001.md docs/roadmap/FORGE_ROADMAP_LOCK_001.md

stage "STAGE 8 COMMIT / PUSH"
commit_allowed_subset \
  "docs: scope quote preview safe ui implementation surfaces" \
  FORGE_MASTER_BUILD_TREE.md docs/architecture/source-truth/FORGE_UNIFIED_BUILD_TREE_001.md docs/roadmap/FORGE_ROADMAP_LOCK_001.md \
  "$ARCH_DOC" "$EVIDENCE_DOC" "$CERT_DOC" "$AUDIT_JSON" "$DISCOVERY_JSON" "$DISCOVERY_MD" "$SCRIPT_IN_REPO"

stage "FINAL CHECKPOINT"
run git status --short --branch
run git log --oneline -14

SUMMARY=$(cat <<EOF
PASS_091A_QUOTE_PREVIEW_SAFE_UI_IMPLEMENTATION_SCOPE_COMMIT_PUSH_COMPLETE
DECISION=$DECISION
LOCKED_DECISION=$LOCKED_DECISION
NEXT=$NEXT_AFTER
BACKUP=$BACKUP_DIR
REPORT=$REPORT
DISCOVERY_JSON=$DISCOVERY_JSON
DISCOVERY_MD=$DISCOVERY_MD
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
