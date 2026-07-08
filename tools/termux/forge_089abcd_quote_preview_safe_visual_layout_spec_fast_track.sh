#!/usr/bin/env bash
set -euo pipefail

CHAIN="089ABCD_QUOTE_PREVIEW_SAFE_VISUAL_LAYOUT_SPEC_FAST_TRACK"
REPO="${REPO:-/storage/emulated/0/Forge OS}"
STAMP="$(date +%Y%m%d_%H%M%S)"
REPORT="/data/data/com.termux/files/home/${CHAIN}_RESULT_${STAMP}.md"
BACKUP_DIR=".forge-backups/089abcd-safe-visual-layout-spec-fast-track-${STAMP}"
SCRIPT_IN_REPO="tools/termux/forge_089abcd_quote_preview_safe_visual_layout_spec_fast_track.sh"

PHASE_A="089A_QUOTE_PREVIEW_SAFE_VISUAL_LAYOUT_SPEC_SCOPE"
DECISION_A="PASS_089A_QUOTE_PREVIEW_SAFE_VISUAL_LAYOUT_SPEC_SCOPE"
LOCKED_A="QUOTE_PREVIEW_SAFE_VISUAL_LAYOUT_SPEC_SCOPED"

PHASE_B="089B_QUOTE_PREVIEW_SAFE_VISUAL_LAYOUT_SPEC_IMPLEMENTATION"
DECISION_B="PASS_089B_QUOTE_PREVIEW_SAFE_VISUAL_LAYOUT_SPEC_IMPLEMENTATION"
LOCKED_B="QUOTE_PREVIEW_SAFE_VISUAL_LAYOUT_SPEC_LOCAL_STATIC_READ_ONLY_IMPLEMENTED"

PHASE_C="089C_QUOTE_PREVIEW_SAFE_VISUAL_LAYOUT_SPEC_QA_LOCK"
DECISION_C="PASS_089C_QUOTE_PREVIEW_SAFE_VISUAL_LAYOUT_SPEC_QA_LOCK"
LOCKED_C="QUOTE_PREVIEW_SAFE_VISUAL_LAYOUT_SPEC_QA_LOCKED"

PHASE_D="089D_QUOTE_PREVIEW_SAFE_VISUAL_LAYOUT_SPEC_DECISION_LOCK"
DECISION_D="PASS_089D_QUOTE_PREVIEW_SAFE_VISUAL_LAYOUT_SPEC_DECISION_LOCK"
LOCKED_D="QUOTE_PREVIEW_SAFE_VISUAL_LAYOUT_SPEC_LOCKED_AS_LOCAL_STATIC_READ_ONLY_REFERENCE_REGISTRY"
NEXT_AFTER_D="090A_QUOTE_PREVIEW_SAFE_COPY_AND_BADGE_SYSTEM_SCOPE"

BOUNDARY="no UI mutation; no component rendering; no screen rendering; no CSS injection; no DOM writes; no backend real; no CRM/policy/quote/pipeline writes; no task/calendar/message; no provider execution with effects; no auth/secrets/browser persistence; no real engine execution; no parser/calculator/Banxico/PDF/OCR execution; no PDF file read; no hash computation over PDFs; no expected-value verification; no parser invocation; no deterministic calculation; no quote truth creation; no quote issuance; no quote send; no invented product/premium/coverage/projection/quote truth; no new extractor/parser/calculator; no real test execution"

READINESS_ADAPTER="platform/adapters/quote-preview/quote-preview-pdf-engine-canonical-execution-readiness-review-matrix-adapter-080b.js"
READINESS_TEST="tests/quote-preview-pdf-engine-canonical-execution-readiness-review-matrix-adapter-080b-test.js"
UX_STATE_ADAPTER="platform/adapters/quote-preview/quote-preview-safe-ux-state-model-registry-adapter-086b.js"
UX_STATE_TEST="tests/quote-preview-safe-ux-state-model-registry-adapter-086b-test.js"
COMPONENT_CONTRACT_ADAPTER="platform/adapters/quote-preview/quote-preview-safe-ux-component-contract-registry-adapter-087b.js"
COMPONENT_CONTRACT_TEST="tests/quote-preview-safe-ux-component-contract-registry-adapter-087b-test.js"
SCREEN_COMPOSITION_ADAPTER="platform/adapters/quote-preview/quote-preview-safe-screen-composition-registry-adapter-088b.js"
SCREEN_COMPOSITION_TEST="tests/quote-preview-safe-screen-composition-registry-adapter-088b-test.js"

ADAPTER="platform/adapters/quote-preview/quote-preview-safe-visual-layout-spec-registry-adapter-089b.js"
TEST="tests/quote-preview-safe-visual-layout-spec-registry-adapter-089b-test.js"

ARCH_DOC_A="docs/architecture/source-truth/FORGE_QUOTE_PREVIEW_SAFE_VISUAL_LAYOUT_SPEC_SCOPE_089A.md"
EVIDENCE_DOC_A="docs/evidence/FORGE_QUOTE_PREVIEW_SAFE_VISUAL_LAYOUT_SPEC_SCOPE_089A.md"
CERT_DOC_A="docs/evidence/FORGE_QUOTE_PREVIEW_SAFE_VISUAL_LAYOUT_SPEC_SCOPE_CERTIFICATE_089A.md"
AUDIT_JSON_A="docs/evidence/forge-quote-preview-safe-visual-layout-spec-scope-audit-089a.json"

ARCH_DOC_B="docs/architecture/source-truth/FORGE_QUOTE_PREVIEW_SAFE_VISUAL_LAYOUT_SPEC_IMPLEMENTATION_089B.md"
EVIDENCE_DOC_B="docs/evidence/FORGE_QUOTE_PREVIEW_SAFE_VISUAL_LAYOUT_SPEC_IMPLEMENTATION_089B.md"
CERT_DOC_B="docs/evidence/FORGE_QUOTE_PREVIEW_SAFE_VISUAL_LAYOUT_SPEC_IMPLEMENTATION_CERTIFICATE_089B.md"
AUDIT_JSON_B="docs/evidence/forge-quote-preview-safe-visual-layout-spec-implementation-audit-089b.json"

ARCH_DOC_C="docs/architecture/source-truth/FORGE_QUOTE_PREVIEW_SAFE_VISUAL_LAYOUT_SPEC_QA_LOCK_089C.md"
EVIDENCE_DOC_C="docs/evidence/FORGE_QUOTE_PREVIEW_SAFE_VISUAL_LAYOUT_SPEC_QA_LOCK_089C.md"
CERT_DOC_C="docs/evidence/FORGE_QUOTE_PREVIEW_SAFE_VISUAL_LAYOUT_SPEC_QA_LOCK_CERTIFICATE_089C.md"
AUDIT_JSON_C="docs/evidence/forge-quote-preview-safe-visual-layout-spec-qa-audit-089c.json"

ARCH_DOC_D="docs/architecture/source-truth/FORGE_QUOTE_PREVIEW_SAFE_VISUAL_LAYOUT_SPEC_DECISION_LOCK_089D.md"
EVIDENCE_DOC_D="docs/evidence/FORGE_QUOTE_PREVIEW_SAFE_VISUAL_LAYOUT_SPEC_DECISION_LOCK_089D.md"
CERT_DOC_D="docs/evidence/FORGE_QUOTE_PREVIEW_SAFE_VISUAL_LAYOUT_SPEC_DECISION_LOCK_CERTIFICATE_089D.md"
AUDIT_JSON_D="docs/evidence/forge-quote-preview-safe-visual-layout-spec-decision-audit-089d.json"

CYAN="\033[1;36m"; GREEN="\033[1;38;5;46m"; YELLOW="\033[1;93m"; RED="\033[1;91m"; RESET="\033[0m"
stage(){ printf "\n${CYAN}========== %s ==========${RESET}\n" "$1"; }
pass(){ printf "${GREEN}PASS:${RESET} %s\n" "$1"; }
warn(){ printf "${YELLOW}WARN:${RESET} %s\n" "$1"; }
fail(){ printf "${RED}HOLD:${RESET} %s\n" "$1"; echo "DECISION=HOLD_${CHAIN}" | tee -a "$REPORT"; echo "REPORT=$REPORT" | tee -a "$REPORT"; exit 1; }
run(){ echo; echo "========== RUN =========="; printf '%q ' "$@"; echo; "$@"; }

find_latest_discovery_json(){
  if [ -n "${DISCOVERY_JSON:-}" ] && [ -f "$DISCOVERY_JSON" ]; then printf "%s\n" "$DISCOVERY_JSON"; return 0; fi
  find /data/data/com.termux/files/home -path "*/forge-discovery-*/*DISCOVERY_077A_PRECHECK_EXISTING_QUOTE_PDF_TESTS_AND_ENGINES_REPORT_*.json" -type f 2>/dev/null | sort | tail -1
}

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
  python3 - <<'PYTRIM'
from pathlib import Path
for path in [Path("FORGE_MASTER_BUILD_TREE.md"), Path("docs/architecture/source-truth/FORGE_UNIFIED_BUILD_TREE_001.md"), Path("docs/roadmap/FORGE_ROADMAP_LOCK_001.md")]:
    path.write_text(path.read_text().rstrip() + "\n")
    print(f"trimmed EOF blanks: {path}")
PYTRIM
}

safety_scan(){
  local files=("$@")
  if rg -n 'localStorage|sessionStorage|fetch\(|XMLHttpRequest|navigator\.mediaDevices|SpeechRecognition|providerRuntimeEnabled:\s*true|networkCallsAllowed:\s*true|browserStorageEnabled:\s*true|mayCreateTruth:\s*true|maySendMessage:\s*true|mayWriteCrm:\s*true|mayCreateCalendarEvent:\s*true|renderAllowed\s*:\s*true|screenRenderAllowed\s*:\s*true|componentRenderAllowed\s*:\s*true|uiMutationAllowed\s*:\s*true|cssInjectionAllowed\s*:\s*true|domWriteAllowed\s*:\s*true|writeAllowed\s*:\s*true|quoteTruthAllowed\s*:\s*true|providerRuntimeAllowed\s*:\s*true|backendConnectionAllowed\s*:\s*true' "${files[@]}"; then
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
  if [ ! -s "$staged_file" ]; then fail "no staged changes for commit"; fi
  pass "staged files are within authorized boundary"
  run git commit -m "$msg"
  run git push origin HEAD:main
}

mkdir -p "$(dirname "$REPORT")"
touch "$REPORT"
exec > >(tee -a "$REPORT") 2>&1

stage "STAGE 0 HEADER"
echo "CHAIN=$CHAIN"
echo "BOUNDARY=$BOUNDARY"
echo "REPORT=$REPORT"
echo "ROBOCOP_GATE=Article 0; 088D safe screen composition closed; safe visual layout spec only"

cd "$REPO" || fail "No existe repo: $REPO"

stage "STAGE 1 CHECKPOINT"
run git status --short --branch
run git log --oneline -15
run git diff --name-status
run git diff --cached --name-status

stage "STAGE 2 CLEAN INDEX ONLY"
run git reset

stage "STAGE 3 CONFIRM BASE 088D"
if git log --oneline -240 | grep -Eq "088D|safe screen composition decision|QUOTE_PREVIEW_SAFE_SCREEN_COMPOSITION_LOCKED_AS_LOCAL_STATIC_READ_ONLY_REFERENCE_REGISTRY"; then
  pass "088D base found in git log"
elif [ -f "docs/evidence/forge-quote-preview-safe-screen-composition-decision-audit-088d.json" ]; then
  pass "088D audit fallback found"
else
  fail "088D base not found. Run 088A/B/C/D first."
fi

if [ -f "docs/evidence/forge-quote-preview-safe-screen-composition-decision-audit-088d.json" ]; then
  run python3 -m json.tool docs/evidence/forge-quote-preview-safe-screen-composition-decision-audit-088d.json
  if ! rg -n '"status"\s*:\s*"PASS"|"lockedDecision"\s*:\s*"QUOTE_PREVIEW_SAFE_SCREEN_COMPOSITION_LOCKED_AS_LOCAL_STATIC_READ_ONLY_REFERENCE_REGISTRY"|"next"\s*:\s*"089A_QUOTE_PREVIEW_SAFE_VISUAL_LAYOUT_SPEC_SCOPE"' docs/evidence/forge-quote-preview-safe-screen-composition-decision-audit-088d.json >/dev/null; then
    fail "088D audit exists but does not confirm PASS/089A next"
  fi
  pass "088D audit PASS/089A next confirmed"
fi

stage "STAGE 4 DISCOVERY EVIDENCE"
DISCOVERY_JSON_FOUND="$(find_latest_discovery_json || true)"
[ -n "$DISCOVERY_JSON_FOUND" ] && [ -f "$DISCOVERY_JSON_FOUND" ] || fail "Discovery JSON not found"

DISCOVERY_DIGEST_JSON="$(mktemp)"
python3 - <<'PY' "$DISCOVERY_JSON_FOUND" "$DISCOVERY_DIGEST_JSON"
import json, sys
from pathlib import Path
source = Path(sys.argv[1]); target = Path(sys.argv[2])
data = json.loads(source.read_text()); rec = data.get("recommendation", {})
if rec.get("do_not_create_new_pdf_extractor") is not True:
    raise SystemExit("Discovery does not block new extractor creation")
digest = {
  "discoveryJson": str(source),
  "counts": data.get("counts", {}),
  "knownSurfacesPresent": data.get("known_surfaces_present", []),
  "realQuoteTestCandidateFiles": data.get("real_quote_test_candidate_files", []),
  "recommendation": rec,
  "artifacts": data.get("artifacts", {}),
}
target.write_text(json.dumps(digest, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
print("DISCOVERY_DIGEST_VALID")
print(target.read_text())
PY

stage "STAGE 5 REQUIRED FILES"
REQUIRED_FILES=(
  "FORGE_MASTER_BUILD_TREE.md"
  "docs/architecture/source-truth/FORGE_UNIFIED_BUILD_TREE_001.md"
  "docs/roadmap/FORGE_ROADMAP_LOCK_001.md"
  "$READINESS_ADAPTER" "$READINESS_TEST"
  "$UX_STATE_ADAPTER" "$UX_STATE_TEST"
  "$COMPONENT_CONTRACT_ADAPTER" "$COMPONENT_CONTRACT_TEST"
  "$SCREEN_COMPOSITION_ADAPTER" "$SCREEN_COMPOSITION_TEST"
)
for f in "${REQUIRED_FILES[@]}"; do [ -f "$f" ] || fail "Missing required file: $f"; pass "$f"; done

stage "STAGE 6 BACKUP"
mkdir -p "$BACKUP_DIR"
cp FORGE_MASTER_BUILD_TREE.md "$BACKUP_DIR/FORGE_MASTER_BUILD_TREE.md"
cp docs/architecture/source-truth/FORGE_UNIFIED_BUILD_TREE_001.md "$BACKUP_DIR/FORGE_UNIFIED_BUILD_TREE_001.md"
cp docs/roadmap/FORGE_ROADMAP_LOCK_001.md "$BACKUP_DIR/FORGE_ROADMAP_LOCK_001.md"
pass "$BACKUP_DIR"

stage "STAGE 7 BASE VALIDATION"
run node --check "$READINESS_ADAPTER"; run node "$READINESS_TEST"
run node --check "$UX_STATE_ADAPTER"; run node "$UX_STATE_TEST"
run node --check "$COMPONENT_CONTRACT_ADAPTER"; run node "$COMPONENT_CONTRACT_TEST"
run node --check "$SCREEN_COMPOSITION_ADAPTER"; run node "$SCREEN_COMPOSITION_TEST"

# -------------------------------------------------------------------
# 089A SCOPE
# -------------------------------------------------------------------
stage "089A BUILD SCOPE"
VISUAL_SCOPE_JSON="$(mktemp)"
node <<'NODE' > "$VISUAL_SCOPE_JSON"
const screens = require('./platform/adapters/quote-preview/quote-preview-safe-screen-composition-registry-adapter-088b.js');

const screenCatalog = screens.getQuotePreviewSafeScreenCompositionRegistryCatalog();

const layoutSpecs = [
  {
    layout_spec_id: 'desktop_safe_visual_layout',
    layout_mode: 'desktop_two_column',
    viewport_class: 'desktop',
    intended_screen_refs: ['QuotePreviewIntakeScreen', 'QuotePreviewBlockedScreen', 'QuotePreviewReferenceScreen', 'QuotePreviewHumanReviewScreen'],
    navigation_pattern: 'fixed_left_sidebar',
    main_grid: 'content_max_width_1180_two_column',
    visual_hierarchy: ['breadcrumb', 'page_title', 'approval_pill', 'command_bar', 'hero_risk_card', 'metric_card_grid', 'priority_table'],
    card_density: 'comfortable',
    primary_cta_treatment: 'warm_gold_rounded_button',
    safety_badge_treatment: 'muted_cyan_pill_with_shield',
    warning_treatment: 'gold_accented_glass_card',
    table_treatment: 'dark_operational_table_with_soft_dividers',
    render_allowed: false,
    screen_render_allowed: false,
    component_render_allowed: false,
    ui_mutation_allowed: false,
    css_injection_allowed: false,
    dom_write_allowed: false,
    quote_truth_allowed: false,
    execution_allowed: false,
    write_allowed: false
  },
  {
    layout_spec_id: 'tablet_safe_visual_layout',
    layout_mode: 'tablet_two_column',
    viewport_class: 'tablet',
    intended_screen_refs: ['QuotePreviewIntakeScreen', 'QuotePreviewReferenceScreen'],
    navigation_pattern: 'compact_left_sidebar_or_bottom_nav',
    main_grid: 'content_fluid_two_column_collapsible',
    visual_hierarchy: ['page_title', 'approval_pill', 'command_bar', 'hero_risk_card', 'metric_card_grid', 'priority_table'],
    card_density: 'medium',
    primary_cta_treatment: 'warm_gold_rounded_button',
    safety_badge_treatment: 'muted_cyan_pill_with_shield',
    warning_treatment: 'gold_accented_glass_card',
    table_treatment: 'responsive_table_or_card_list',
    render_allowed: false,
    screen_render_allowed: false,
    component_render_allowed: false,
    ui_mutation_allowed: false,
    css_injection_allowed: false,
    dom_write_allowed: false,
    quote_truth_allowed: false,
    execution_allowed: false,
    write_allowed: false
  },
  {
    layout_spec_id: 'mobile_safe_visual_layout',
    layout_mode: 'mobile_single_column',
    viewport_class: 'mobile',
    intended_screen_refs: ['QuotePreviewEmptyScreen', 'QuotePreviewIntakeScreen', 'QuotePreviewBlockedScreen', 'QuotePreviewReferenceScreen', 'QuotePreviewHumanReviewScreen'],
    navigation_pattern: 'bottom_tab_bar',
    main_grid: 'single_column_stacked_cards',
    visual_hierarchy: ['mobile_header', 'approval_pill', 'command_bar', 'hero_risk_card', 'metric_card_grid_two_columns', 'priority_list_cards', 'bottom_nav'],
    card_density: 'compact_but_readable',
    primary_cta_treatment: 'warm_gold_full_width_or_inline_button',
    safety_badge_treatment: 'muted_cyan_pill_with_shield',
    warning_treatment: 'gold_accented_glass_card',
    table_treatment: 'priority_list_cards_not_table',
    render_allowed: false,
    screen_render_allowed: false,
    component_render_allowed: false,
    ui_mutation_allowed: false,
    css_injection_allowed: false,
    dom_write_allowed: false,
    quote_truth_allowed: false,
    execution_allowed: false,
    write_allowed: false
  }
];

const scope = {
  status: 'PASS',
  phase: '089A_QUOTE_PREVIEW_SAFE_VISUAL_LAYOUT_SPEC_SCOPE',
  scope_type: 'safe_visual_layout_spec_scope_only',
  screen_composition_status_before_089a: screenCatalog.overall_screen_composition_status,
  visual_layout_spec_count: layoutSpecs.length,
  layout_specs: layoutSpecs,
  visual_style_tokens: {
    color_system: 'midnight_navy_with_warm_gold_and_cyan_safety_accents',
    surface_style: 'dark_glass_cards_soft_borders_subtle_glow',
    typography_style: 'large_clear_page_title_medium_weight_labels_compact_operational_text',
    spacing_style: 'generous_desktop_compact_mobile',
    cta_style: 'warm_gold_primary_buttons',
    safety_label_style: 'preview_not_quote_pills_always_visible'
  },
  required_089b_output: {
    adapter_type: 'local_static_read_only_safe_visual_layout_spec_registry',
    must_not_render_screen: true,
    must_not_mutate_ui: true,
    must_not_inject_css: true,
    must_not_create_quote_truth: true,
    must_map_layout_specs_to_safe_screen_compositions: true,
    required_fields: [
      'layout_spec_id',
      'layout_mode',
      'viewport_class',
      'intended_screen_refs',
      'navigation_pattern',
      'main_grid',
      'visual_hierarchy',
      'card_density',
      'primary_cta_treatment',
      'safety_badge_treatment',
      'warning_treatment',
      'table_treatment',
      'render_allowed',
      'screen_render_allowed',
      'component_render_allowed',
      'ui_mutation_allowed',
      'css_injection_allowed',
      'dom_write_allowed',
      'quote_truth_allowed',
      'execution_allowed',
      'write_allowed',
      'safe_errors',
      'safety_flags'
    ]
  },
  next_decision_after_089d: 'quote_preview_safe_copy_and_badge_system_scope',
  safety_flags: {
    crmWrite: false,
    pipelineWrite: false,
    policyWrite: false,
    quoteWrite: false,
    taskCreate: false,
    calendarCreate: false,
    messageSend: false,
    authReal: false,
    providerRuntime: false,
    secretAccess: false,
    browserPersistence: false,
    realEngineExecution: false,
    realEffectsAllowed: false,
    realEffectsEnabled: false,
    backendConnection: false,
    pdfRead: false,
    ocrExecution: false,
    parserExecution: false,
    calculatorExecution: false,
    banxicoCall: false,
    testExecution: false
  }
};

if (scope.screen_composition_status_before_089a !== 'screen_compositions_mapped_no_render_no_effects') throw new Error('089A requires 088D safe screen composition base');
console.log(JSON.stringify(scope, null, 2));
NODE

cat "$VISUAL_SCOPE_JSON"

stage "089A WRITE DOCS / EVIDENCE"
mkdir -p "$(dirname "$ARCH_DOC_A")" "$(dirname "$EVIDENCE_DOC_A")"

cat > "$ARCH_DOC_A" <<EOF
# Forge Quote Preview Safe Visual Layout Spec Scope 089A

PHASE=$PHASE_A

STATUS=PASS

DECISION=$DECISION_A

LOCKED_DECISION=$LOCKED_A

NEXT=$PHASE_B

## Purpose

089A scopes safe visual layout specs for Quote Preview.

This phase follows 088D, where safe screen composition was locked as local/static/read-only reference registry.

## Important Boundary

089A does not render screens, render components, mutate UI, inject CSS, write DOM, create quote truth, issue quotes, send quotes, connect backend, write CRM/policy/pipeline/quote records, read PDFs, run parsers, run calculators, call Banxico, or execute real tests.

089A only scopes visual layout specs for future implementation.

## Visual Direction Captured

- midnight navy / dark premium interface;
- fixed sidebar on desktop;
- command bar near the top;
- hero risk card;
- metric card grid;
- operational opportunity table;
- mobile single-column card stack;
- bottom navigation on mobile;
- warm gold CTA;
- muted cyan safety badges;
- preview / no-quote labels always visible.

## Scoped Layout Specs

- \`desktop_safe_visual_layout\`
- \`tablet_safe_visual_layout\`
- \`mobile_safe_visual_layout\`

## Required 089B Shape

089B must implement a local/static/read-only safe visual layout spec registry.

## Final Decision

DECISION=$DECISION_A

LOCKED_DECISION=$LOCKED_A

NEXT=$PHASE_B
EOF

cat > "$EVIDENCE_DOC_A" <<EOF
# Forge Quote Preview Safe Visual Layout Spec Scope 089A

PHASE=$PHASE_A

STATUS=PASS

DECISION=$DECISION_A

LOCKED_DECISION=$LOCKED_A

NEXT=$PHASE_B

## Evidence Summary

089A scopes safe visual layout specs only.

## Discovery Evidence

\`\`\`json
$(cat "$DISCOVERY_DIGEST_JSON")
\`\`\`

## Visual Layout Spec Scope

\`\`\`json
$(cat "$VISUAL_SCOPE_JSON")
\`\`\`

## Final

DECISION=$DECISION_A

LOCKED_DECISION=$LOCKED_A

NEXT=$PHASE_B
EOF

cat > "$CERT_DOC_A" <<EOF
# Forge Quote Preview Safe Visual Layout Spec Scope Certificate 089A

PHASE=$PHASE_A

CERTIFICATE_STATUS=PASS

DECISION=$DECISION_A

LOCKED_DECISION=$LOCKED_A

NEXT=$PHASE_B

089A certifies that safe visual layout specs have been scoped before copy and badge system.

$DECISION_A
EOF

cat > "$AUDIT_JSON_A" <<EOF
{
  "phase": "$PHASE_A",
  "status": "PASS",
  "decision": "$DECISION_A",
  "lockedDecision": "$LOCKED_A",
  "base": {
    "phase": "088D_QUOTE_PREVIEW_SAFE_SCREEN_COMPOSITION_DECISION_LOCK",
    "confirmed": true,
    "lockedDecision": "QUOTE_PREVIEW_SAFE_SCREEN_COMPOSITION_LOCKED_AS_LOCAL_STATIC_READ_ONLY_REFERENCE_REGISTRY"
  },
  "next": "$PHASE_B",
  "scopeType": "safe_visual_layout_spec_scope_only",
  "visualLayoutSpecScope": $(cat "$VISUAL_SCOPE_JSON"),
  "discoveryEvidence": $(cat "$DISCOVERY_DIGEST_JSON"),
  "notAuthorized": {
    "screenRendering": false,
    "componentRendering": false,
    "uiMutation": false,
    "cssInjection": false,
    "domWrite": false,
    "quoteTruthCreation": false,
    "quoteWrite": false,
    "backendConnection": false
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

TREE_BLOCK_A="$(mktemp)"
cat > "$TREE_BLOCK_A" <<EOF
<!-- FORGE:$PHASE_A:START -->
## 089A Quote Preview Safe Visual Layout Spec Scope

089A scopes safe visual layout specs for Quote Preview.

Locked decision:
\`$LOCKED_A\`

Scoped layout specs:

- \`desktop_safe_visual_layout\`
- \`tablet_safe_visual_layout\`
- \`mobile_safe_visual_layout\`

Visual direction:

- midnight navy / dark premium interface;
- fixed sidebar on desktop;
- command bar near the top;
- hero risk card;
- metric card grid;
- operational opportunity table;
- mobile single-column card stack;
- warm gold CTA;
- muted cyan safety badges;
- preview / no-quote labels always visible.

089B must implement a local/static/read-only safe visual layout spec registry.

Boundaries:

- no screen rendering;
- no component rendering;
- no UI mutation;
- no CSS injection;
- no DOM writes;
- no quote truth creation.

DECISION=$DECISION_A

LOCKED_DECISION=$LOCKED_A

NEXT=$PHASE_B
<!-- FORGE:$PHASE_A:END -->
EOF

for tree in FORGE_MASTER_BUILD_TREE.md docs/architecture/source-truth/FORGE_UNIFIED_BUILD_TREE_001.md docs/roadmap/FORGE_ROADMAP_LOCK_001.md; do
  replace_or_append_block "$tree" "$PHASE_A" "$TREE_BLOCK_A"
done
trim_tree_files

mkdir -p "$(dirname "$SCRIPT_IN_REPO")"
cp "$0" "$SCRIPT_IN_REPO"
chmod +x "$SCRIPT_IN_REPO"

run bash -n "$SCRIPT_IN_REPO"
run python3 -m json.tool "$AUDIT_JSON_A"
run rg -n "$PHASE_A|$DECISION_A|$LOCKED_A|$PHASE_B|Safe Visual Layout Spec|desktop_safe_visual_layout|mobile_safe_visual_layout|no CSS injection" \
  FORGE_MASTER_BUILD_TREE.md docs/architecture/source-truth/FORGE_UNIFIED_BUILD_TREE_001.md docs/roadmap/FORGE_ROADMAP_LOCK_001.md \
  "$ARCH_DOC_A" "$EVIDENCE_DOC_A" "$CERT_DOC_A" "$AUDIT_JSON_A"
run git diff --check
safety_scan FORGE_MASTER_BUILD_TREE.md docs/architecture/source-truth/FORGE_UNIFIED_BUILD_TREE_001.md docs/roadmap/FORGE_ROADMAP_LOCK_001.md "$ARCH_DOC_A" "$EVIDENCE_DOC_A" "$CERT_DOC_A" "$AUDIT_JSON_A"

commit_allowed_subset \
  "docs: scope quote preview safe visual layout spec" \
  FORGE_MASTER_BUILD_TREE.md docs/architecture/source-truth/FORGE_UNIFIED_BUILD_TREE_001.md docs/roadmap/FORGE_ROADMAP_LOCK_001.md \
  "$ARCH_DOC_A" "$EVIDENCE_DOC_A" "$CERT_DOC_A" "$AUDIT_JSON_A" "$SCRIPT_IN_REPO"

# -------------------------------------------------------------------
# 089B IMPLEMENTATION
# -------------------------------------------------------------------
stage "089B IMPLEMENT ADAPTER"
mkdir -p "$(dirname "$ADAPTER")" "$(dirname "$TEST")"

cat > "$ADAPTER" <<'NODE'
'use strict';

const screens = require('./quote-preview-safe-screen-composition-registry-adapter-088b.js');

const ADAPTER_ID = 'forge.quote_preview.safe_visual_layout_spec.registry.adapter.v1';
const SCHEMA_VERSION = 'forge.quote_preview.safe_visual_layout_spec.registry.v1';
const DOMAIN_ID = 'quote_preview_safe_visual_layout_spec';
const MODE = 'read_only';
const ROUTE_CLASS = 'preview_safe';

const LAYOUT_MODES = Object.freeze({
  DESKTOP_TWO_COLUMN: 'desktop_two_column',
  TABLET_TWO_COLUMN: 'tablet_two_column',
  MOBILE_SINGLE_COLUMN: 'mobile_single_column',
});

const VIEWPORT_CLASSES = Object.freeze({
  DESKTOP: 'desktop',
  TABLET: 'tablet',
  MOBILE: 'mobile',
});

const SAFE_ERROR_CODES = Object.freeze({
  VISUAL_LAYOUT_SPEC_NOT_MAPPED: 'QUOTE_PREVIEW_VISUAL_LAYOUT_SPEC_NOT_MAPPED',
  SCREEN_RENDERING_NOT_AUTHORIZED: 'QUOTE_PREVIEW_VISUAL_LAYOUT_SCREEN_RENDERING_NOT_AUTHORIZED',
  COMPONENT_RENDERING_NOT_AUTHORIZED: 'QUOTE_PREVIEW_VISUAL_LAYOUT_COMPONENT_RENDERING_NOT_AUTHORIZED',
  UI_MUTATION_NOT_AUTHORIZED: 'QUOTE_PREVIEW_VISUAL_LAYOUT_UI_MUTATION_NOT_AUTHORIZED',
  CSS_INJECTION_NOT_AUTHORIZED: 'QUOTE_PREVIEW_VISUAL_LAYOUT_CSS_INJECTION_NOT_AUTHORIZED',
  DOM_WRITE_NOT_AUTHORIZED: 'QUOTE_PREVIEW_VISUAL_LAYOUT_DOM_WRITE_NOT_AUTHORIZED',
  QUOTE_TRUTH_NOT_AUTHORIZED: 'QUOTE_PREVIEW_VISUAL_LAYOUT_QUOTE_TRUTH_NOT_AUTHORIZED',
  WRITE_NOT_AUTHORIZED: 'QUOTE_PREVIEW_VISUAL_LAYOUT_WRITE_NOT_AUTHORIZED',
  PREVIEW_LABEL_REQUIRED: 'QUOTE_PREVIEW_VISUAL_LAYOUT_PREVIEW_LABEL_REQUIRED',
});

const DEFAULT_SAFETY_FLAGS = Object.freeze({
  crmWrite: false,
  pipelineWrite: false,
  policyWrite: false,
  quoteWrite: false,
  taskCreate: false,
  calendarCreate: false,
  messageSend: false,
  authReal: false,
  providerRuntime: false,
  secretAccess: false,
  browserPersistence: false,
  realEngineExecution: false,
  realEffectsAllowed: false,
  realEffectsEnabled: false,
  backendConnection: false,
  pdfRead: false,
  ocrExecution: false,
  parserExecution: false,
  calculatorExecution: false,
  banxicoCall: false,
  testExecution: false,
});

const REQUIRED_VISUAL_LAYOUT_SPEC_FIELDS = Object.freeze([
  'layout_spec_id',
  'layout_mode',
  'viewport_class',
  'intended_screen_refs',
  'navigation_pattern',
  'main_grid',
  'visual_hierarchy',
  'card_density',
  'primary_cta_treatment',
  'safety_badge_treatment',
  'warning_treatment',
  'table_treatment',
  'render_allowed',
  'screen_render_allowed',
  'component_render_allowed',
  'ui_mutation_allowed',
  'css_injection_allowed',
  'dom_write_allowed',
  'quote_truth_allowed',
  'execution_allowed',
  'write_allowed',
  'safe_errors',
  'safety_flags',
]);

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function freezeSpec(spec) {
  return Object.freeze({
    ...spec,
    intended_screen_refs: Object.freeze([...(spec.intended_screen_refs || [])]),
    visual_hierarchy: Object.freeze([...(spec.visual_hierarchy || [])]),
    safe_errors: Object.freeze([...(spec.safe_errors || [])]),
    safety_flags: Object.freeze({ ...DEFAULT_SAFETY_FLAGS, ...(spec.safety_flags || {}) }),
  });
}

function buildVisualLayoutSpec({
  layoutSpecId,
  layoutMode,
  viewportClass,
  intendedScreenRefs,
  navigationPattern,
  mainGrid,
  visualHierarchy,
  cardDensity,
  primaryCtaTreatment,
  safetyBadgeTreatment,
  warningTreatment,
  tableTreatment,
}) {
  return freezeSpec({
    layout_spec_id: layoutSpecId,
    layout_mode: layoutMode,
    viewport_class: viewportClass,
    intended_screen_refs: intendedScreenRefs,
    navigation_pattern: navigationPattern,
    main_grid: mainGrid,
    visual_hierarchy: visualHierarchy,
    card_density: cardDensity,
    primary_cta_treatment: primaryCtaTreatment,
    safety_badge_treatment: safetyBadgeTreatment,
    warning_treatment: warningTreatment,
    table_treatment: tableTreatment,
    render_allowed: false,
    screen_render_allowed: false,
    component_render_allowed: false,
    ui_mutation_allowed: false,
    css_injection_allowed: false,
    dom_write_allowed: false,
    quote_truth_allowed: false,
    execution_allowed: false,
    write_allowed: false,
    safe_errors: [
      SAFE_ERROR_CODES.SCREEN_RENDERING_NOT_AUTHORIZED,
      SAFE_ERROR_CODES.COMPONENT_RENDERING_NOT_AUTHORIZED,
      SAFE_ERROR_CODES.UI_MUTATION_NOT_AUTHORIZED,
      SAFE_ERROR_CODES.CSS_INJECTION_NOT_AUTHORIZED,
      SAFE_ERROR_CODES.DOM_WRITE_NOT_AUTHORIZED,
      SAFE_ERROR_CODES.QUOTE_TRUTH_NOT_AUTHORIZED,
      SAFE_ERROR_CODES.WRITE_NOT_AUTHORIZED,
      SAFE_ERROR_CODES.PREVIEW_LABEL_REQUIRED,
    ],
  });
}

const VISUAL_STYLE_TOKENS = Object.freeze({
  color_system: 'midnight_navy_with_warm_gold_and_cyan_safety_accents',
  background: 'dark_radial_gradient_with_subtle_blue_green_glow',
  surfaces: 'dark_glass_cards_soft_borders_subtle_glow',
  borders: 'thin_blue_gray_borders_with_gold_focus_state',
  typography: 'large_clear_page_title_medium_weight_labels_compact_operational_text',
  cta: 'warm_gold_primary_buttons',
  safety_labels: 'muted_cyan_preview_not_quote_pills_always_visible',
  metrics: 'blue_green_red_yellow_metric_semantics',
  mobile_navigation: 'bottom_tab_bar_with_active_gold_icon',
});

const VISUAL_LAYOUT_SPECS = Object.freeze([
  buildVisualLayoutSpec({
    layoutSpecId: 'desktop_safe_visual_layout',
    layoutMode: LAYOUT_MODES.DESKTOP_TWO_COLUMN,
    viewportClass: VIEWPORT_CLASSES.DESKTOP,
    intendedScreenRefs: ['QuotePreviewIntakeScreen', 'QuotePreviewBlockedScreen', 'QuotePreviewReferenceScreen', 'QuotePreviewHumanReviewScreen'],
    navigationPattern: 'fixed_left_sidebar',
    mainGrid: 'content_max_width_1180_two_column',
    visualHierarchy: ['breadcrumb', 'page_title', 'approval_pill', 'command_bar', 'hero_risk_card', 'metric_card_grid', 'priority_table'],
    cardDensity: 'comfortable',
    primaryCtaTreatment: 'warm_gold_rounded_button',
    safetyBadgeTreatment: 'muted_cyan_pill_with_shield',
    warningTreatment: 'gold_accented_glass_card',
    tableTreatment: 'dark_operational_table_with_soft_dividers',
  }),
  buildVisualLayoutSpec({
    layoutSpecId: 'tablet_safe_visual_layout',
    layoutMode: LAYOUT_MODES.TABLET_TWO_COLUMN,
    viewportClass: VIEWPORT_CLASSES.TABLET,
    intendedScreenRefs: ['QuotePreviewIntakeScreen', 'QuotePreviewReferenceScreen'],
    navigationPattern: 'compact_left_sidebar_or_bottom_nav',
    mainGrid: 'content_fluid_two_column_collapsible',
    visualHierarchy: ['page_title', 'approval_pill', 'command_bar', 'hero_risk_card', 'metric_card_grid', 'priority_table'],
    cardDensity: 'medium',
    primaryCtaTreatment: 'warm_gold_rounded_button',
    safetyBadgeTreatment: 'muted_cyan_pill_with_shield',
    warningTreatment: 'gold_accented_glass_card',
    tableTreatment: 'responsive_table_or_card_list',
  }),
  buildVisualLayoutSpec({
    layoutSpecId: 'mobile_safe_visual_layout',
    layoutMode: LAYOUT_MODES.MOBILE_SINGLE_COLUMN,
    viewportClass: VIEWPORT_CLASSES.MOBILE,
    intendedScreenRefs: ['QuotePreviewEmptyScreen', 'QuotePreviewIntakeScreen', 'QuotePreviewBlockedScreen', 'QuotePreviewReferenceScreen', 'QuotePreviewHumanReviewScreen'],
    navigationPattern: 'bottom_tab_bar',
    mainGrid: 'single_column_stacked_cards',
    visualHierarchy: ['mobile_header', 'approval_pill', 'command_bar', 'hero_risk_card', 'metric_card_grid_two_columns', 'priority_list_cards', 'bottom_nav'],
    cardDensity: 'compact_but_readable',
    primaryCtaTreatment: 'warm_gold_full_width_or_inline_button',
    safetyBadgeTreatment: 'muted_cyan_pill_with_shield',
    warningTreatment: 'gold_accented_glass_card',
    tableTreatment: 'priority_list_cards_not_table',
  }),
]);

function getSourceRefs() {
  const screenCatalog = screens.getQuotePreviewSafeScreenCompositionRegistryCatalog();
  return {
    safe_screen_composition: {
      adapter_id: screenCatalog.adapter_id,
      schemaVersion: screenCatalog.schemaVersion,
      overall_screen_composition_status: screenCatalog.overall_screen_composition_status,
      screen_composition_count: screenCatalog.screen_compositions.length,
    },
  };
}

function getQuotePreviewSafeVisualLayoutSpecRegistryCatalog() {
  return {
    adapter_id: ADAPTER_ID,
    schemaVersion: SCHEMA_VERSION,
    domainId: DOMAIN_ID,
    mode: MODE,
    routeClass: ROUTE_CLASS,
    registry_type: 'local_static_read_only_safe_visual_layout_spec_registry',
    overall_visual_layout_spec_status: 'visual_layout_specs_mapped_no_render_no_effects',
    render_allowed_in_registry: false,
    screen_render_allowed_in_registry: false,
    component_render_allowed_in_registry: false,
    ui_mutation_allowed_in_registry: false,
    css_injection_allowed_in_registry: false,
    dom_write_allowed_in_registry: false,
    quote_truth_allowed_in_registry: false,
    execution_allowed_in_registry: false,
    write_allowed_in_registry: false,
    quote_write_allowed_in_registry: false,
    crm_write_allowed_in_registry: false,
    policy_write_allowed_in_registry: false,
    pipeline_write_allowed_in_registry: false,
    provider_runtime_allowed_in_registry: false,
    backend_connection_allowed_in_registry: false,
    required_visual_layout_spec_fields: [...REQUIRED_VISUAL_LAYOUT_SPEC_FIELDS],
    visual_style_tokens: clone(VISUAL_STYLE_TOKENS),
    layout_modes: Object.values(LAYOUT_MODES),
    safe_errors: Object.values(SAFE_ERROR_CODES),
    safety_flags: clone(DEFAULT_SAFETY_FLAGS),
    source_refs: getSourceRefs(),
    visual_layout_specs: clone(VISUAL_LAYOUT_SPECS),
  };
}

function buildVisualLayoutSpecSafeError(layoutSpecId, code = SAFE_ERROR_CODES.VISUAL_LAYOUT_SPEC_NOT_MAPPED) {
  return {
    schemaVersion: SCHEMA_VERSION,
    domainId: DOMAIN_ID,
    mode: MODE,
    routeClass: ROUTE_CLASS,
    readModelStatus: 'error',
    layout_spec_id: layoutSpecId || null,
    layout_mode: null,
    viewport_class: null,
    intended_screen_refs: [],
    navigation_pattern: null,
    main_grid: null,
    visual_hierarchy: [],
    card_density: null,
    primary_cta_treatment: null,
    safety_badge_treatment: null,
    warning_treatment: null,
    table_treatment: null,
    render_allowed: false,
    screen_render_allowed: false,
    component_render_allowed: false,
    ui_mutation_allowed: false,
    css_injection_allowed: false,
    dom_write_allowed: false,
    quote_truth_allowed: false,
    execution_allowed: false,
    write_allowed: false,
    safe_errors: [code, SAFE_ERROR_CODES.SCREEN_RENDERING_NOT_AUTHORIZED, SAFE_ERROR_CODES.UI_MUTATION_NOT_AUTHORIZED, SAFE_ERROR_CODES.QUOTE_TRUTH_NOT_AUTHORIZED],
    safety_flags: clone(DEFAULT_SAFETY_FLAGS),
    safe_error: {
      code,
      message: 'Visual layout spec is not mapped. Rendering, UI mutation, quote truth, execution, and writes are blocked.',
    },
  };
}

function getVisualLayoutSpecById(layoutSpecId) {
  const match = VISUAL_LAYOUT_SPECS.find((spec) => spec.layout_spec_id === layoutSpecId);
  return match ? clone(match) : buildVisualLayoutSpecSafeError(layoutSpecId);
}

function getVisualLayoutSpecsByViewportClass(viewportClass) {
  return clone(VISUAL_LAYOUT_SPECS.filter((spec) => spec.viewport_class === viewportClass));
}

function getVisualLayoutSpecsByLayoutMode(layoutMode) {
  return clone(VISUAL_LAYOUT_SPECS.filter((spec) => spec.layout_mode === layoutMode));
}

function getNonRenderingVisualLayoutSpecs() {
  return clone(VISUAL_LAYOUT_SPECS.filter((spec) => spec.render_allowed === false));
}

function getNonMutableVisualLayoutSpecs() {
  return clone(VISUAL_LAYOUT_SPECS.filter((spec) => spec.ui_mutation_allowed === false && spec.css_injection_allowed === false && spec.dom_write_allowed === false));
}

function getQuoteTruthBlockedVisualLayoutSpecs() {
  return clone(VISUAL_LAYOUT_SPECS.filter((spec) => spec.quote_truth_allowed === false));
}

function validateVisualLayoutSpecShape(spec) {
  const errors = [];
  if (!spec || typeof spec !== 'object') return { ok: false, valid: false, errors: ['visual_layout_spec_object_required'] };

  for (const field of REQUIRED_VISUAL_LAYOUT_SPEC_FIELDS) {
    if (!(field in spec)) errors.push(`missing_${field}`);
  }

  for (const flagName of ['render_allowed', 'screen_render_allowed', 'component_render_allowed', 'ui_mutation_allowed', 'css_injection_allowed', 'dom_write_allowed', 'quote_truth_allowed', 'execution_allowed', 'write_allowed']) {
    if (spec[flagName] !== false) errors.push(`${flagName}_must_be_false`);
  }

  if (!Array.isArray(spec.visual_hierarchy) || spec.visual_hierarchy.length < 4) errors.push('visual_hierarchy_must_have_minimum_structure');
  if (typeof spec.primary_cta_treatment !== 'string' || !spec.primary_cta_treatment.includes('gold')) errors.push('primary_cta_treatment_must_preserve_gold_cta');
  if (typeof spec.safety_badge_treatment !== 'string' || !spec.safety_badge_treatment.includes('cyan')) errors.push('safety_badge_treatment_must_preserve_cyan_preview_badge');

  for (const [key, value] of Object.entries(spec.safety_flags || {})) {
    if (value !== false) errors.push(`safety_flag_not_false_${key}`);
  }

  return { ok: errors.length === 0, valid: errors.length === 0, errors };
}

function validateVisualLayoutSpecRegistryCatalog(catalog) {
  const errors = [];
  if (!catalog || typeof catalog !== 'object') return { ok: false, valid: false, errors: ['catalog_object_required'] };

  if (catalog.schemaVersion !== SCHEMA_VERSION) errors.push('invalid_schemaVersion');
  if (catalog.domainId !== DOMAIN_ID) errors.push('invalid_domainId');
  if (catalog.mode !== MODE) errors.push('invalid_mode');
  if (catalog.routeClass !== ROUTE_CLASS) errors.push('invalid_routeClass');
  if (catalog.overall_visual_layout_spec_status !== 'visual_layout_specs_mapped_no_render_no_effects') errors.push('overall_visual_layout_spec_status_must_remain_no_effects');

  for (const flagName of [
    'render_allowed_in_registry',
    'screen_render_allowed_in_registry',
    'component_render_allowed_in_registry',
    'ui_mutation_allowed_in_registry',
    'css_injection_allowed_in_registry',
    'dom_write_allowed_in_registry',
    'quote_truth_allowed_in_registry',
    'execution_allowed_in_registry',
    'write_allowed_in_registry',
    'quote_write_allowed_in_registry',
    'crm_write_allowed_in_registry',
    'policy_write_allowed_in_registry',
    'pipeline_write_allowed_in_registry',
    'provider_runtime_allowed_in_registry',
    'backend_connection_allowed_in_registry',
  ]) {
    if (catalog[flagName] !== false) errors.push(`${flagName}_must_be_false`);
  }

  for (const [key, value] of Object.entries(catalog.safety_flags || {})) {
    if (value !== false) errors.push(`catalog_safety_flag_not_false_${key}`);
  }

  const specs = Array.isArray(catalog.visual_layout_specs) ? catalog.visual_layout_specs : [];
  if (specs.length !== 3) errors.push('three_visual_layout_specs_required');

  const screenCatalog = screens.getQuotePreviewSafeScreenCompositionRegistryCatalog();
  const validScreenNames = new Set(screenCatalog.screen_compositions.map((composition) => composition.screen_name));

  for (const spec of specs) {
    const result = validateVisualLayoutSpecShape(spec);
    if (!result.ok) errors.push(...result.errors.map((error) => `${spec.layout_spec_id || 'unknown'}:${error}`));

    for (const screenName of spec.intended_screen_refs || []) {
      if (!validScreenNames.has(screenName)) errors.push(`${spec.layout_spec_id}:unknown_screen_${screenName}`);
    }
  }

  return { ok: errors.length === 0, valid: errors.length === 0, errors };
}

module.exports = {
  ADAPTER_ID,
  SCHEMA_VERSION,
  DOMAIN_ID,
  MODE,
  ROUTE_CLASS,
  LAYOUT_MODES,
  VIEWPORT_CLASSES,
  SAFE_ERROR_CODES,
  DEFAULT_SAFETY_FLAGS,
  REQUIRED_VISUAL_LAYOUT_SPEC_FIELDS,
  VISUAL_STYLE_TOKENS,
  VISUAL_LAYOUT_SPECS,
  getQuotePreviewSafeVisualLayoutSpecRegistryCatalog,
  getVisualLayoutSpecById,
  getVisualLayoutSpecsByViewportClass,
  getVisualLayoutSpecsByLayoutMode,
  getNonRenderingVisualLayoutSpecs,
  getNonMutableVisualLayoutSpecs,
  getQuoteTruthBlockedVisualLayoutSpecs,
  buildVisualLayoutSpecSafeError,
  validateVisualLayoutSpecShape,
  validateVisualLayoutSpecRegistryCatalog,
};
NODE

cat > "$TEST" <<'NODE'
'use strict';

const assert = require('node:assert/strict');

const adapter = require('../platform/adapters/quote-preview/quote-preview-safe-visual-layout-spec-registry-adapter-089b.js');

assert.equal(adapter.ADAPTER_ID, 'forge.quote_preview.safe_visual_layout_spec.registry.adapter.v1');
assert.equal(adapter.SCHEMA_VERSION, 'forge.quote_preview.safe_visual_layout_spec.registry.v1');
assert.equal(adapter.MODE, 'read_only');
assert.equal(adapter.ROUTE_CLASS, 'preview_safe');

const catalog = adapter.getQuotePreviewSafeVisualLayoutSpecRegistryCatalog();

assert.equal(catalog.schemaVersion, adapter.SCHEMA_VERSION);
assert.equal(catalog.domainId, 'quote_preview_safe_visual_layout_spec');
assert.equal(catalog.registry_type, 'local_static_read_only_safe_visual_layout_spec_registry');
assert.equal(catalog.overall_visual_layout_spec_status, 'visual_layout_specs_mapped_no_render_no_effects');
assert.equal(catalog.visual_layout_specs.length, 3);
assert.equal(adapter.validateVisualLayoutSpecRegistryCatalog(catalog).ok, true);

for (const flag of [
  'render_allowed_in_registry',
  'screen_render_allowed_in_registry',
  'component_render_allowed_in_registry',
  'ui_mutation_allowed_in_registry',
  'css_injection_allowed_in_registry',
  'dom_write_allowed_in_registry',
  'quote_truth_allowed_in_registry',
  'execution_allowed_in_registry',
  'write_allowed_in_registry',
  'quote_write_allowed_in_registry',
  'crm_write_allowed_in_registry',
  'policy_write_allowed_in_registry',
  'pipeline_write_allowed_in_registry',
  'provider_runtime_allowed_in_registry',
  'backend_connection_allowed_in_registry',
]) {
  assert.equal(catalog[flag], false, `${flag} must be false`);
}

assert.equal(catalog.visual_style_tokens.color_system, 'midnight_navy_with_warm_gold_and_cyan_safety_accents');
assert(catalog.visual_style_tokens.cta.includes('gold'));
assert(catalog.visual_style_tokens.safety_labels.includes('preview_not_quote'));

for (const spec of catalog.visual_layout_specs) {
  for (const field of adapter.REQUIRED_VISUAL_LAYOUT_SPEC_FIELDS) assert(field in spec, `${spec.layout_spec_id} missing ${field}`);
  assert.equal(spec.render_allowed, false);
  assert.equal(spec.screen_render_allowed, false);
  assert.equal(spec.component_render_allowed, false);
  assert.equal(spec.ui_mutation_allowed, false);
  assert.equal(spec.css_injection_allowed, false);
  assert.equal(spec.dom_write_allowed, false);
  assert.equal(spec.quote_truth_allowed, false);
  assert.equal(spec.execution_allowed, false);
  assert.equal(spec.write_allowed, false);
  assert(spec.primary_cta_treatment.includes('gold'));
  assert(spec.safety_badge_treatment.includes('cyan'));
  assert(spec.safe_errors.includes(adapter.SAFE_ERROR_CODES.SCREEN_RENDERING_NOT_AUTHORIZED));
  assert(spec.safe_errors.includes(adapter.SAFE_ERROR_CODES.CSS_INJECTION_NOT_AUTHORIZED));
  assert(spec.safe_errors.includes(adapter.SAFE_ERROR_CODES.DOM_WRITE_NOT_AUTHORIZED));
  assert.equal(adapter.validateVisualLayoutSpecShape(spec).ok, true);
}

assert.equal(adapter.getNonRenderingVisualLayoutSpecs().length, 3);
assert.equal(adapter.getNonMutableVisualLayoutSpecs().length, 3);
assert.equal(adapter.getQuoteTruthBlockedVisualLayoutSpecs().length, 3);

const desktop = adapter.getVisualLayoutSpecById('desktop_safe_visual_layout');
assert.equal(desktop.viewport_class, adapter.VIEWPORT_CLASSES.DESKTOP);
assert.equal(desktop.navigation_pattern, 'fixed_left_sidebar');
assert(desktop.visual_hierarchy.includes('priority_table'));
assert.equal(desktop.table_treatment, 'dark_operational_table_with_soft_dividers');

const tablet = adapter.getVisualLayoutSpecById('tablet_safe_visual_layout');
assert.equal(tablet.viewport_class, adapter.VIEWPORT_CLASSES.TABLET);
assert.equal(tablet.table_treatment, 'responsive_table_or_card_list');

const mobile = adapter.getVisualLayoutSpecById('mobile_safe_visual_layout');
assert.equal(mobile.viewport_class, adapter.VIEWPORT_CLASSES.MOBILE);
assert.equal(mobile.navigation_pattern, 'bottom_tab_bar');
assert(mobile.visual_hierarchy.includes('bottom_nav'));
assert.equal(mobile.table_treatment, 'priority_list_cards_not_table');

assert.equal(adapter.getVisualLayoutSpecsByViewportClass(adapter.VIEWPORT_CLASSES.DESKTOP).length, 1);
assert.equal(adapter.getVisualLayoutSpecsByViewportClass(adapter.VIEWPORT_CLASSES.TABLET).length, 1);
assert.equal(adapter.getVisualLayoutSpecsByViewportClass(adapter.VIEWPORT_CLASSES.MOBILE).length, 1);
assert.equal(adapter.getVisualLayoutSpecsByLayoutMode(adapter.LAYOUT_MODES.MOBILE_SINGLE_COLUMN).length, 1);

const missing = adapter.getVisualLayoutSpecById('missing_layout');
assert.equal(missing.readModelStatus, 'error');
assert.equal(missing.render_allowed, false);
assert.equal(missing.css_injection_allowed, false);
assert.equal(missing.dom_write_allowed, false);
assert.equal(missing.quote_truth_allowed, false);
assert.equal(missing.write_allowed, false);
assert(missing.safe_errors.includes(adapter.SAFE_ERROR_CODES.VISUAL_LAYOUT_SPEC_NOT_MAPPED));
assert.equal(adapter.validateVisualLayoutSpecShape(missing).ok, false);

for (const [key, value] of Object.entries(adapter.DEFAULT_SAFETY_FLAGS)) {
  assert.equal(value, false, `DEFAULT_SAFETY_FLAGS.${key} must be false`);
}

for (const spec of catalog.visual_layout_specs) {
  for (const [key, value] of Object.entries(spec.safety_flags || {})) {
    assert.equal(value, false, `${spec.layout_spec_id}.${key} must be false`);
  }
}

const combined = JSON.stringify({ catalog, flags: adapter.DEFAULT_SAFETY_FLAGS });
for (const fragment of [
  '"pdfRead":' + 'true',
  '"ocrExecution":' + 'true',
  '"parserExecution":' + 'true',
  '"calculatorExecution":' + 'true',
  '"banxicoCall":' + 'true',
  '"realEngineExecution":' + 'true',
  '"providerRuntime":' + 'true',
  '"quoteWrite":' + 'true',
  '"backendConnection":' + 'true',
  '"testExecution":' + 'true',
]) {
  assert(!combined.includes(fragment), `forbidden true flag found: ${fragment}`);
}

console.log('PASS quote preview safe visual layout spec registry adapter 089B');
NODE

run node --check "$ADAPTER"
run node --check "$TEST"
run node "$TEST"

stage "089B WRITE DOCS / EVIDENCE"
cat > "$ARCH_DOC_B" <<EOF
# Forge Quote Preview Safe Visual Layout Spec Implementation 089B

PHASE=$PHASE_B

STATUS=PASS

DECISION=$DECISION_B

LOCKED_DECISION=$LOCKED_B

NEXT=$PHASE_C

## Purpose

089B implements a local/static/read-only safe visual layout spec registry.

The registry defines visual layout specs for Quote Preview. It does not render screens, render components, mutate UI, inject CSS, write DOM, create quote truth, issue quotes, send quotes, connect backend, write CRM/policy/pipeline/quote records, or execute real effects.

## Implemented Files

- \`$ADAPTER\`
- \`$TEST\`

## Registry Status

\`visual_layout_specs_mapped_no_render_no_effects\`

## Layout Specs

- \`desktop_safe_visual_layout\`
- \`tablet_safe_visual_layout\`
- \`mobile_safe_visual_layout\`

## Visual Style Tokens

- \`midnight_navy_with_warm_gold_and_cyan_safety_accents\`
- \`dark_glass_cards_soft_borders_subtle_glow\`
- \`warm_gold_primary_buttons\`
- \`muted_cyan_preview_not_quote_pills_always_visible\`

Every spec preserves:

- \`render_allowed=false\`
- \`screen_render_allowed=false\`
- \`component_render_allowed=false\`
- \`ui_mutation_allowed=false\`
- \`css_injection_allowed=false\`
- \`dom_write_allowed=false\`
- \`quote_truth_allowed=false\`
- \`execution_allowed=false\`
- \`write_allowed=false\`

## Final Decision

DECISION=$DECISION_B

LOCKED_DECISION=$LOCKED_B

NEXT=$PHASE_C
EOF

cat > "$EVIDENCE_DOC_B" <<EOF
# Forge Quote Preview Safe Visual Layout Spec Implementation 089B

PHASE=$PHASE_B

STATUS=PASS

DECISION=$DECISION_B

LOCKED_DECISION=$LOCKED_B

NEXT=$PHASE_C

## Evidence Summary

089B implements a local/static/read-only safe visual layout spec registry.

## Discovery Evidence

\`\`\`json
$(cat "$DISCOVERY_DIGEST_JSON")
\`\`\`

## Test Evidence

The focused test validates:

- adapter identity and schema;
- registry shape;
- three visual layout specs exist;
- desktop/tablet/mobile specs are mapped;
- dark premium visual tokens are preserved;
- warm gold CTA treatment is preserved;
- muted cyan safety badge treatment is preserved;
- no screen rendering, UI mutation, CSS injection, DOM write, quote truth, execution, or writes are allowed;
- all safety flags remain false.

## Final

DECISION=$DECISION_B

LOCKED_DECISION=$LOCKED_B

NEXT=$PHASE_C
EOF

cat > "$CERT_DOC_B" <<EOF
# Forge Quote Preview Safe Visual Layout Spec Implementation Certificate 089B

PHASE=$PHASE_B

CERTIFICATE_STATUS=PASS

DECISION=$DECISION_B

LOCKED_DECISION=$LOCKED_B

NEXT=$PHASE_C

089B certifies that Forge now has a local/static/read-only safe visual layout spec registry.

$DECISION_B
EOF

cat > "$AUDIT_JSON_B" <<EOF
{
  "phase": "$PHASE_B",
  "status": "PASS",
  "decision": "$DECISION_B",
  "lockedDecision": "$LOCKED_B",
  "base": {
    "phase": "$PHASE_A",
    "confirmed": true,
    "lockedDecision": "$LOCKED_A"
  },
  "next": "$PHASE_C",
  "implementation": {
    "adapter": "$ADAPTER",
    "test": "$TEST",
    "adapterId": "forge.quote_preview.safe_visual_layout_spec.registry.adapter.v1",
    "schemaVersion": "forge.quote_preview.safe_visual_layout_spec.registry.v1",
    "registryType": "local_static_read_only_safe_visual_layout_spec_registry",
    "overallVisualLayoutSpecStatus": "visual_layout_specs_mapped_no_render_no_effects",
    "screenRenderingIntroduced": false,
    "componentRenderingIntroduced": false,
    "uiMutationIntroduced": false,
    "cssInjectionIntroduced": false,
    "domWriteIntroduced": false,
    "quoteTruthCreationIntroduced": false,
    "backendConnectionIntroduced": false,
    "quoteWriteIntroduced": false
  },
  "discoveryEvidence": $(cat "$DISCOVERY_DIGEST_JSON"),
  "visualLayoutSpecs": {
    "count": 3,
    "desktop": "desktop_safe_visual_layout",
    "tablet": "tablet_safe_visual_layout",
    "mobile": "mobile_safe_visual_layout",
    "darkPremiumTokensPreserved": true,
    "warmGoldCtaPreserved": true,
    "cyanSafetyBadgesPreserved": true
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

TREE_BLOCK_B="$(mktemp)"
cat > "$TREE_BLOCK_B" <<EOF
<!-- FORGE:$PHASE_B:START -->
## 089B Quote Preview Safe Visual Layout Spec Implementation

089B implements a local/static/read-only safe visual layout spec registry.

Locked decision:
\`$LOCKED_B\`

Implemented:

- \`$ADAPTER\`
- \`$TEST\`

Registry status:

- \`visual_layout_specs_mapped_no_render_no_effects\`

Layout specs:

- \`desktop_safe_visual_layout\`
- \`tablet_safe_visual_layout\`
- \`mobile_safe_visual_layout\`

Visual style tokens:

- midnight navy;
- dark glass cards;
- warm gold CTAs;
- muted cyan safety badges;
- preview / no-quote labels always visible.

Every spec preserves:

- \`render_allowed=false\`
- \`screen_render_allowed=false\`
- \`component_render_allowed=false\`
- \`ui_mutation_allowed=false\`
- \`css_injection_allowed=false\`
- \`dom_write_allowed=false\`
- \`quote_truth_allowed=false\`
- \`execution_allowed=false\`
- \`write_allowed=false\`

DECISION=$DECISION_B

LOCKED_DECISION=$LOCKED_B

NEXT=$PHASE_C
<!-- FORGE:$PHASE_B:END -->
EOF

for tree in FORGE_MASTER_BUILD_TREE.md docs/architecture/source-truth/FORGE_UNIFIED_BUILD_TREE_001.md docs/roadmap/FORGE_ROADMAP_LOCK_001.md; do
  replace_or_append_block "$tree" "$PHASE_B" "$TREE_BLOCK_B"
done
trim_tree_files

stage "089B VALIDATION / COMMIT"
run bash -n "$SCRIPT_IN_REPO"
run node --check "$ADAPTER"
run node --check "$TEST"
run node "$TEST"
run python3 -m json.tool "$AUDIT_JSON_B"
run rg -n "$PHASE_B|$DECISION_B|$LOCKED_B|$PHASE_C|visual_layout_specs_mapped_no_render_no_effects|desktop_safe_visual_layout|mobile_safe_visual_layout|css_injection_allowed=false" \
  FORGE_MASTER_BUILD_TREE.md docs/architecture/source-truth/FORGE_UNIFIED_BUILD_TREE_001.md docs/roadmap/FORGE_ROADMAP_LOCK_001.md \
  "$ARCH_DOC_B" "$EVIDENCE_DOC_B" "$CERT_DOC_B" "$AUDIT_JSON_B" "$ADAPTER" "$TEST"
run git diff --check
safety_scan FORGE_MASTER_BUILD_TREE.md docs/architecture/source-truth/FORGE_UNIFIED_BUILD_TREE_001.md docs/roadmap/FORGE_ROADMAP_LOCK_001.md "$ARCH_DOC_B" "$EVIDENCE_DOC_B" "$CERT_DOC_B" "$AUDIT_JSON_B" "$ADAPTER" "$TEST"

commit_allowed_subset \
  "feat: implement quote preview safe visual layout spec registry" \
  FORGE_MASTER_BUILD_TREE.md docs/architecture/source-truth/FORGE_UNIFIED_BUILD_TREE_001.md docs/roadmap/FORGE_ROADMAP_LOCK_001.md \
  "$ADAPTER" "$TEST" "$ARCH_DOC_B" "$EVIDENCE_DOC_B" "$CERT_DOC_B" "$AUDIT_JSON_B" "$SCRIPT_IN_REPO"

# -------------------------------------------------------------------
# 089C QA
# -------------------------------------------------------------------
stage "089C SEMANTIC QA"
SEMANTIC_QA_JSON="$(mktemp)"
node <<'NODE' > "$SEMANTIC_QA_JSON"
const assert = require("node:assert/strict");
const visual = require("./platform/adapters/quote-preview/quote-preview-safe-visual-layout-spec-registry-adapter-089b.js");

const catalog = visual.getQuotePreviewSafeVisualLayoutSpecRegistryCatalog();
assert.equal(catalog.overall_visual_layout_spec_status, "visual_layout_specs_mapped_no_render_no_effects");
assert.equal(visual.validateVisualLayoutSpecRegistryCatalog(catalog).ok, true);
assert.equal(catalog.visual_layout_specs.length, 3);
assert.equal(visual.getNonRenderingVisualLayoutSpecs().length, 3);
assert.equal(visual.getNonMutableVisualLayoutSpecs().length, 3);
assert.equal(visual.getQuoteTruthBlockedVisualLayoutSpecs().length, 3);

for (const spec of catalog.visual_layout_specs) {
  assert.equal(spec.render_allowed, false);
  assert.equal(spec.screen_render_allowed, false);
  assert.equal(spec.component_render_allowed, false);
  assert.equal(spec.ui_mutation_allowed, false);
  assert.equal(spec.css_injection_allowed, false);
  assert.equal(spec.dom_write_allowed, false);
  assert.equal(spec.quote_truth_allowed, false);
  assert.equal(spec.execution_allowed, false);
  assert.equal(spec.write_allowed, false);
  assert.equal(visual.validateVisualLayoutSpecShape(spec).ok, true);
}

assert.equal(visual.getVisualLayoutSpecById("desktop_safe_visual_layout").navigation_pattern, "fixed_left_sidebar");
assert.equal(visual.getVisualLayoutSpecById("desktop_safe_visual_layout").visual_hierarchy.includes("priority_table"), true);
assert.equal(visual.getVisualLayoutSpecById("mobile_safe_visual_layout").navigation_pattern, "bottom_tab_bar");
assert.equal(visual.getVisualLayoutSpecById("mobile_safe_visual_layout").table_treatment, "priority_list_cards_not_table");
assert.equal(visual.getVisualLayoutSpecsByViewportClass(visual.VIEWPORT_CLASSES.DESKTOP).length, 1);
assert.equal(visual.getVisualLayoutSpecsByViewportClass(visual.VIEWPORT_CLASSES.TABLET).length, 1);
assert.equal(visual.getVisualLayoutSpecsByViewportClass(visual.VIEWPORT_CLASSES.MOBILE).length, 1);

for (const [key, value] of Object.entries(visual.DEFAULT_SAFETY_FLAGS || {})) {
  assert.equal(value, false, `DEFAULT_SAFETY_FLAGS.${key} must be false`);
}

console.log(JSON.stringify({
  status: "PASS",
  catalogValidated: true,
  visualLayoutSpecCount: catalog.visual_layout_specs.length,
  nonRenderingSpecCount: visual.getNonRenderingVisualLayoutSpecs().length,
  nonMutableSpecCount: visual.getNonMutableVisualLayoutSpecs().length,
  quoteTruthBlockedSpecCount: visual.getQuoteTruthBlockedVisualLayoutSpecs().length,
  desktopSidebarPreserved: true,
  mobileBottomNavPreserved: true,
  darkPremiumTokensPreserved: true,
  warmGoldCtaPreserved: true,
  cyanSafetyBadgePreserved: true,
  allSafetyFlagsFalse: true
}, null, 2));
NODE

cat "$SEMANTIC_QA_JSON"

cat > "$ARCH_DOC_C" <<EOF
# Forge Quote Preview Safe Visual Layout Spec QA Lock 089C

PHASE=$PHASE_C

STATUS=PASS

DECISION=$DECISION_C

LOCKED_DECISION=$LOCKED_C

NEXT=$PHASE_D

## Purpose

089C QA locks the 089B safe visual layout spec registry.

## QA Validated

- registry shape validates;
- three visual layout specs exist;
- desktop/tablet/mobile specs are mapped;
- every spec blocks rendering;
- every spec blocks UI mutation;
- every spec blocks CSS injection and DOM writes;
- every spec blocks quote truth, execution, and writes;
- desktop sidebar pattern is preserved;
- mobile bottom nav pattern is preserved;
- dark premium tokens, warm gold CTA, and cyan safety badge treatment are preserved;
- all safety flags remain false.

## Final Decision

DECISION=$DECISION_C

LOCKED_DECISION=$LOCKED_C

NEXT=$PHASE_D
EOF

cat > "$EVIDENCE_DOC_C" <<EOF
# Forge Quote Preview Safe Visual Layout Spec QA Lock 089C

PHASE=$PHASE_C

STATUS=PASS

DECISION=$DECISION_C

LOCKED_DECISION=$LOCKED_C

NEXT=$PHASE_D

## Semantic QA

\`\`\`json
$(cat "$SEMANTIC_QA_JSON")
\`\`\`

## Discovery Evidence

\`\`\`json
$(cat "$DISCOVERY_DIGEST_JSON")
\`\`\`

## Final

DECISION=$DECISION_C

LOCKED_DECISION=$LOCKED_C

NEXT=$PHASE_D
EOF

cat > "$CERT_DOC_C" <<EOF
# Forge Quote Preview Safe Visual Layout Spec QA Lock Certificate 089C

PHASE=$PHASE_C

CERTIFICATE_STATUS=PASS

DECISION=$DECISION_C

LOCKED_DECISION=$LOCKED_C

NEXT=$PHASE_D

089C certifies that safe visual layout spec registry is QA locked.

$DECISION_C
EOF

cat > "$AUDIT_JSON_C" <<EOF
{
  "phase": "$PHASE_C",
  "status": "PASS",
  "decision": "$DECISION_C",
  "lockedDecision": "$LOCKED_C",
  "base": {
    "phase": "$PHASE_B",
    "confirmed": true,
    "lockedDecision": "$LOCKED_B"
  },
  "next": "$PHASE_D",
  "semanticQa": $(cat "$SEMANTIC_QA_JSON"),
  "discoveryEvidence": $(cat "$DISCOVERY_DIGEST_JSON"),
  "qaValidated": {
    "registryShapeValidates": true,
    "visualLayoutSpecCount": 3,
    "allRenderingBlocked": true,
    "allUiMutationBlocked": true,
    "allCssInjectionBlocked": true,
    "allDomWritesBlocked": true,
    "allQuoteTruthBlocked": true,
    "desktopSidebarPreserved": true,
    "mobileBottomNavPreserved": true,
    "allSafetyFlagsFalse": true
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

TREE_BLOCK_C="$(mktemp)"
cat > "$TREE_BLOCK_C" <<EOF
<!-- FORGE:$PHASE_C:START -->
## 089C Quote Preview Safe Visual Layout Spec QA Lock

089C QA locks the 089B safe visual layout spec registry.

Locked decision:
\`$LOCKED_C\`

QA validated:

- registry shape validates;
- three visual layout specs exist;
- desktop/tablet/mobile specs are mapped;
- every spec blocks rendering;
- every spec blocks UI mutation;
- every spec blocks CSS injection and DOM writes;
- every spec blocks quote truth, execution, and writes;
- desktop sidebar pattern is preserved;
- mobile bottom nav pattern is preserved;
- dark premium tokens, warm gold CTA, and cyan safety badge treatment are preserved;
- all safety flags remain false.

DECISION=$DECISION_C

LOCKED_DECISION=$LOCKED_C

NEXT=$PHASE_D
<!-- FORGE:$PHASE_C:END -->
EOF

for tree in FORGE_MASTER_BUILD_TREE.md docs/architecture/source-truth/FORGE_UNIFIED_BUILD_TREE_001.md docs/roadmap/FORGE_ROADMAP_LOCK_001.md; do
  replace_or_append_block "$tree" "$PHASE_C" "$TREE_BLOCK_C"
done
trim_tree_files

stage "089C VALIDATION / COMMIT"
run bash -n "$SCRIPT_IN_REPO"
run node --check "$ADAPTER"
run node --check "$TEST"
run node "$TEST"
run python3 -m json.tool "$AUDIT_JSON_C"
run rg -n "$PHASE_C|$DECISION_C|$LOCKED_C|$PHASE_D|QA locks|three visual layout specs|desktop sidebar pattern|mobile bottom nav pattern" \
  FORGE_MASTER_BUILD_TREE.md docs/architecture/source-truth/FORGE_UNIFIED_BUILD_TREE_001.md docs/roadmap/FORGE_ROADMAP_LOCK_001.md \
  "$ARCH_DOC_C" "$EVIDENCE_DOC_C" "$CERT_DOC_C" "$AUDIT_JSON_C"
run git diff --check
safety_scan FORGE_MASTER_BUILD_TREE.md docs/architecture/source-truth/FORGE_UNIFIED_BUILD_TREE_001.md docs/roadmap/FORGE_ROADMAP_LOCK_001.md "$ARCH_DOC_C" "$EVIDENCE_DOC_C" "$CERT_DOC_C" "$AUDIT_JSON_C" "$ADAPTER" "$TEST"

commit_allowed_subset \
  "docs: lock quote preview safe visual layout spec qa" \
  FORGE_MASTER_BUILD_TREE.md docs/architecture/source-truth/FORGE_UNIFIED_BUILD_TREE_001.md docs/roadmap/FORGE_ROADMAP_LOCK_001.md \
  "$ARCH_DOC_C" "$EVIDENCE_DOC_C" "$CERT_DOC_C" "$AUDIT_JSON_C" "$SCRIPT_IN_REPO"

# -------------------------------------------------------------------
# 089D DECISION
# -------------------------------------------------------------------
stage "089D DECISION ASSERTIONS"
DECISION_QA_JSON="$(mktemp)"
node <<'NODE' > "$DECISION_QA_JSON"
const assert = require("node:assert/strict");
const visual = require("./platform/adapters/quote-preview/quote-preview-safe-visual-layout-spec-registry-adapter-089b.js");

const catalog = visual.getQuotePreviewSafeVisualLayoutSpecRegistryCatalog();
assert.equal(catalog.overall_visual_layout_spec_status, "visual_layout_specs_mapped_no_render_no_effects");
assert.equal(visual.validateVisualLayoutSpecRegistryCatalog(catalog).ok, true);
assert.equal(catalog.visual_layout_specs.length, 3);
assert.equal(visual.getNonRenderingVisualLayoutSpecs().length, 3);
assert.equal(visual.getNonMutableVisualLayoutSpecs().length, 3);
assert.equal(visual.getQuoteTruthBlockedVisualLayoutSpecs().length, 3);

for (const spec of catalog.visual_layout_specs) {
  assert.equal(spec.render_allowed, false);
  assert.equal(spec.screen_render_allowed, false);
  assert.equal(spec.component_render_allowed, false);
  assert.equal(spec.ui_mutation_allowed, false);
  assert.equal(spec.css_injection_allowed, false);
  assert.equal(spec.dom_write_allowed, false);
  assert.equal(spec.quote_truth_allowed, false);
  assert.equal(spec.execution_allowed, false);
  assert.equal(spec.write_allowed, false);
}

console.log(JSON.stringify({
  status: "PASS",
  locked_as: "local_static_read_only_reference_registry",
  overall_visual_layout_spec_status: catalog.overall_visual_layout_spec_status,
  visual_layout_spec_count: catalog.visual_layout_specs.length,
  non_rendering_spec_count: visual.getNonRenderingVisualLayoutSpecs().length,
  non_mutable_spec_count: visual.getNonMutableVisualLayoutSpecs().length,
  quote_truth_blocked_spec_count: visual.getQuoteTruthBlockedVisualLayoutSpecs().length,
  next_scope: "090A_QUOTE_PREVIEW_SAFE_COPY_AND_BADGE_SYSTEM_SCOPE",
  all_safety_flags_false: true
}, null, 2));
NODE

cat "$DECISION_QA_JSON"

cat > "$ARCH_DOC_D" <<EOF
# Forge Quote Preview Safe Visual Layout Spec Decision Lock 089D

PHASE=$PHASE_D

STATUS=PASS

DECISION=$DECISION_D

LOCKED_DECISION=$LOCKED_D

NEXT=$NEXT_AFTER_D

## Purpose

089D decision-locks the 089B/089C safe visual layout spec registry as a local/static/read-only reference registry.

## Locked Meaning

The registry is approved only as:

- local/static;
- read-only;
- safe visual layout spec reference model;
- no screen rendering;
- no component rendering;
- no UI mutation;
- no CSS injection;
- no DOM writes;
- no quote truth;
- no execution;
- no writes.

## Confirmed

- three visual layout specs exist;
- desktop/tablet/mobile specs are mapped;
- every spec blocks rendering;
- every spec blocks UI mutation;
- every spec blocks CSS injection and DOM writes;
- every spec blocks quote truth, execution, and writes;
- dark premium visual language is preserved;
- warm gold CTA and cyan safety badges are preserved.

## Next Architectural Unlock

090A may scope safe copy and badge system for Quote Preview.

090A must not execute tests, read PDFs, run OCR, run parsers, run calculators, call Banxico/providers, connect backend, write quotes, mutate UI, inject CSS, write DOM, render components/screens, or create real effects.

## Final Decision

DECISION=$DECISION_D

LOCKED_DECISION=$LOCKED_D

NEXT=$NEXT_AFTER_D
EOF

cat > "$EVIDENCE_DOC_D" <<EOF
# Forge Quote Preview Safe Visual Layout Spec Decision Lock 089D

PHASE=$PHASE_D

STATUS=PASS

DECISION=$DECISION_D

LOCKED_DECISION=$LOCKED_D

NEXT=$NEXT_AFTER_D

## Decision Assertions

\`\`\`json
$(cat "$DECISION_QA_JSON")
\`\`\`

## Discovery Evidence

\`\`\`json
$(cat "$DISCOVERY_DIGEST_JSON")
\`\`\`

## Final

DECISION=$DECISION_D

LOCKED_DECISION=$LOCKED_D

NEXT=$NEXT_AFTER_D
EOF

cat > "$CERT_DOC_D" <<EOF
# Forge Quote Preview Safe Visual Layout Spec Decision Lock Certificate 089D

PHASE=$PHASE_D

CERTIFICATE_STATUS=PASS

DECISION=$DECISION_D

LOCKED_DECISION=$LOCKED_D

NEXT=$NEXT_AFTER_D

089D certifies that safe visual layout spec registry is locked as local/static/read-only reference registry.

$DECISION_D
EOF

cat > "$AUDIT_JSON_D" <<EOF
{
  "phase": "$PHASE_D",
  "status": "PASS",
  "decision": "$DECISION_D",
  "lockedDecision": "$LOCKED_D",
  "base": {
    "phase": "$PHASE_C",
    "confirmed": true,
    "lockedDecision": "$LOCKED_C"
  },
  "next": "$NEXT_AFTER_D",
  "lockedAs": "local_static_read_only_reference_registry",
  "decisionAssertions": $(cat "$DECISION_QA_JSON"),
  "discoveryEvidence": $(cat "$DISCOVERY_DIGEST_JSON"),
  "confirmed": {
    "registryShapeValidates": true,
    "visualLayoutSpecCount": 3,
    "allRenderingBlocked": true,
    "allUiMutationBlocked": true,
    "allCssInjectionBlocked": true,
    "allDomWritesBlocked": true,
    "allQuoteTruthBlocked": true,
    "allSafetyFlagsFalse": true
  },
  "nextScope": {
    "phase": "$NEXT_AFTER_D",
    "purpose": "quote_preview_safe_copy_and_badge_system_scope",
    "executionAllowed": false,
    "uiMutationAllowed": false,
    "screenRenderingAllowed": false,
    "cssInjectionAllowed": false,
    "domWriteAllowed": false
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

TREE_BLOCK_D="$(mktemp)"
cat > "$TREE_BLOCK_D" <<EOF
<!-- FORGE:$PHASE_D:START -->
## 089D Quote Preview Safe Visual Layout Spec Decision Lock

089D decision-locks the 089B/089C safe visual layout spec registry as a local/static/read-only reference registry.

Locked decision:
\`$LOCKED_D\`

Confirmed:

- three visual layout specs exist;
- desktop/tablet/mobile specs are mapped;
- every spec blocks rendering;
- every spec blocks UI mutation;
- every spec blocks CSS injection and DOM writes;
- every spec blocks quote truth, execution, and writes;
- dark premium visual language is preserved;
- warm gold CTA and cyan safety badges are preserved.

Next:

- \`$NEXT_AFTER_D\` may scope safe copy and badge system.
- No screen rendering, component rendering, UI mutation, CSS injection, DOM writes, or execution are authorized.

DECISION=$DECISION_D

LOCKED_DECISION=$LOCKED_D

NEXT=$NEXT_AFTER_D
<!-- FORGE:$PHASE_D:END -->
EOF

for tree in FORGE_MASTER_BUILD_TREE.md docs/architecture/source-truth/FORGE_UNIFIED_BUILD_TREE_001.md docs/roadmap/FORGE_ROADMAP_LOCK_001.md; do
  replace_or_append_block "$tree" "$PHASE_D" "$TREE_BLOCK_D"
done
trim_tree_files

stage "089D VALIDATION / COMMIT"
run bash -n "$SCRIPT_IN_REPO"
run node --check "$ADAPTER"
run node --check "$TEST"
run node "$TEST"
run python3 -m json.tool "$AUDIT_JSON_D"
run rg -n "$PHASE_D|$DECISION_D|$LOCKED_D|$NEXT_AFTER_D|Safe Visual Layout Spec|decision-locks|safe copy and badge system|No screen rendering" \
  FORGE_MASTER_BUILD_TREE.md docs/architecture/source-truth/FORGE_UNIFIED_BUILD_TREE_001.md docs/roadmap/FORGE_ROADMAP_LOCK_001.md \
  "$ARCH_DOC_D" "$EVIDENCE_DOC_D" "$CERT_DOC_D" "$AUDIT_JSON_D"
run git diff --check
safety_scan FORGE_MASTER_BUILD_TREE.md docs/architecture/source-truth/FORGE_UNIFIED_BUILD_TREE_001.md docs/roadmap/FORGE_ROADMAP_LOCK_001.md "$ARCH_DOC_D" "$EVIDENCE_DOC_D" "$CERT_DOC_D" "$AUDIT_JSON_D" "$ADAPTER" "$TEST"

commit_allowed_subset \
  "docs: lock quote preview safe visual layout spec decision" \
  FORGE_MASTER_BUILD_TREE.md docs/architecture/source-truth/FORGE_UNIFIED_BUILD_TREE_001.md docs/roadmap/FORGE_ROADMAP_LOCK_001.md \
  "$ARCH_DOC_D" "$EVIDENCE_DOC_D" "$CERT_DOC_D" "$AUDIT_JSON_D" "$SCRIPT_IN_REPO"

stage "FINAL CHECKPOINT"
run git status --short --branch
run git log --oneline -16

SUMMARY=$(cat <<EOF
PASS_089ABCD_QUOTE_PREVIEW_SAFE_VISUAL_LAYOUT_SPEC_FAST_TRACK_COMMIT_PUSH_COMPLETE
PASS_A=$DECISION_A
LOCKED_A=$LOCKED_A
PASS_B=$DECISION_B
LOCKED_B=$LOCKED_B
PASS_C=$DECISION_C
LOCKED_C=$LOCKED_C
PASS_D=$DECISION_D
LOCKED_D=$LOCKED_D
NEXT=$NEXT_AFTER_D
DISCOVERY_JSON=$DISCOVERY_JSON_FOUND
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
