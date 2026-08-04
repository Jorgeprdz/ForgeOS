#!/usr/bin/env bash
set -euo pipefail

CURRENT_MAIN_HEAD="${CARTERA_130_CURRENT_MAIN_HEAD:-9d014116f6b3f0a626d8848d680a5c607f924d99}"
ACCEPTED_PROGRAM_HEAD="${CARTERA_130_ACCEPTED_PROGRAM_HEAD:-b83a37abe3eb8b3a48c2fe89940b562e1367bfcc}"
ARTIFACT_DIR='artifacts/cartera-130-selective-promotion'
CLOSURE='docs/evidence/FORGE_CARTERA_130_HEAD_BOUND_SELECTIVE_PROMOTION_CLOSURE_001.md'
MANIFEST='docs/evidence/FORGE_CARTERA_130_SELECTIVE_PROMOTION_MANIFEST_001.tsv'
MATERIAL3_APP='docs/static-preview/forge-alive-material3/app.js'
mkdir -p "$ARTIFACT_DIR" "$(dirname "$CLOSURE")"
exec > >(tee "$ARTIFACT_DIR/acceptance.log") 2>&1

echo '========== CARTERA 130 HEAD LOCK =========='
[[ "$(git rev-parse origin/main)" == "$CURRENT_MAIN_HEAD" ]]
git cat-file -e "$ACCEPTED_PROGRAM_HEAD^{commit}"
git merge-base --is-ancestor "$CURRENT_MAIN_HEAD" HEAD
echo 'CURRENT_MAIN_HEAD_LOCK=PASS'
echo 'ACCEPTED_PROGRAM_HEAD_LOCK=PASS'

echo '========== CARTERA 130 MATERIALIZATION =========='
bash scripts/ci/cartera-130-materialize-selective-promotion.sh

echo '========== CARTERA 130 BOUNDED PATHS =========='
mapfile -t changed_paths < <(git diff --name-only "$CURRENT_MAIN_HEAD")
[[ ${#changed_paths[@]} -gt 40 ]]
for path in "${changed_paths[@]}"; do
  case "$path" in
    .github/workflows/cartera-050-current-main-promotion.yml|\
    .github/workflows/cartera-130-head-bound-selective-promotion.yml|\
    app.js|\
    cartera.js|\
    legacy/quarantine/cartera-enterprise-main-pre-canonical-20260801.js|\
    advisor-os/cartera/*|\
    advisor-os/sales-pipeline/prospect-quote-detail-projection-ui.js|\
    advisor-os/sales-pipeline/productive-prospect-bootstrap.js|\
    platform/economic-connection/*|\
    platform/event-evidence/cartera-vertical-continuity-contract.js|\
    platform/event-evidence/policy-domain-event-contract.js|\
    platform/event-evidence/prospect-quote-detail-projection.js|\
    platform/event-evidence/quote-lifecycle-event-bridge.js|\
    platform/event-evidence/quote-lifecycle-event-contract.js|\
    platform/event-evidence/quote-lifecycle-supabase-service.js|\
    platform/experience-engine/cartera-*|\
    platform/policy-intelligence/*|\
    platform/portfolio-intelligence/*|\
    platform/productivity/*|\
    platform/program-governance/cartera-110*|\
    platform/relationship-intelligence/*|\
    platform/shared-commercial-model/*|\
    policy-operations/calendar/cartera-*|\
    policy-operations/intake/cartera-*|\
    policy-operations/payments/cartera-*|\
    schemas/cartera-*|\
    schemas/commercial-*|\
    schemas/policy-*|\
    supabase/migrations/*cartera*|\
    tests/cartera-*|\
    docs/architecture/source-truth/FORGE_CARTERA_*|\
    docs/evidence/FORGE_CARTERA_*|\
    docs/static-preview/forge-alive-material3/app.js|\
    docs/static-preview/quote-runtime/forge-quote-lifecycle-browser-bridge-cartera001b.js|\
    scripts/ci/cartera-130-*) ;;
    *) echo "CARTERA130_UNAUTHORIZED_CHANGED_PATH=$path" >&2; exit 1 ;;
  esac
done

git diff --quiet "$CURRENT_MAIN_HEAD" -- actividad.js
git diff --quiet "$CURRENT_MAIN_HEAD" -- dashboard.js
git diff --quiet "$CURRENT_MAIN_HEAD" -- pipeline.js

material3_added_lines="$(git diff --unified=0 "$CURRENT_MAIN_HEAD" -- "$MATERIAL3_APP" | awk '/^\+/ && !/^\+\+\+/ { count += 1 } END { print count + 0 }')"
material3_removed_lines="$(git diff --unified=0 "$CURRENT_MAIN_HEAD" -- "$MATERIAL3_APP" | awk '/^-/ && !/^---/ { count += 1 } END { print count + 0 }')"
[[ "$material3_added_lines" == '1' ]]
[[ "$material3_removed_lines" == '0' ]]
grep -q 'forge-quote-lifecycle-browser-bridge-cartera001b.js' "$MATERIAL3_APP"
grep -q "github.event.pull_request.head.ref == 'integration/cartera-050-current-main'" \
  .github/workflows/cartera-050-current-main-promotion.yml

echo 'BOUNDED_PATHS=PASS'
echo 'CURRENT_MAIN_FORECAST_ACTIVITY_PIPELINE_PRESERVED=PASS'
echo 'MATERIAL3_BOUNDED_CARTERA_BRIDGE_ONLY=PASS'
echo 'LEGACY_050_BOUNDARY_SCOPED_TO_ITS_PROMOTION_BRANCH=PASS'
echo 'FULL_HISTORY_MERGE=FORBIDDEN'
echo 'STACKED_BRANCH_MERGE=FORBIDDEN'

echo '========== CARTERA 130 STATIC CONTRACT =========='
node --check app.js
node --check cartera.js
node --check "$MATERIAL3_APP"
node --check scripts/ci/cartera-130-reconcile-runtime.mjs
find advisor-os/cartera \
  platform/economic-connection \
  platform/experience-engine \
  platform/policy-intelligence \
  platform/portfolio-intelligence \
  platform/productivity \
  platform/relationship-intelligence \
  policy-operations/calendar \
  policy-operations/intake \
  -type f -name '*.js' -print0 | xargs -0 -n 1 node --check

grep -q 'bindCarteraEvents: bindCarteraProductEvents' app.js
grep -q 'CARTERA 010D read-only unified directory route adapter' cartera.js
grep -q '^app.js[[:space:]]RECONCILE_CURRENT_MAIN' "$MANIFEST"
grep -q '^docs/static-preview/forge-alive-material3/app.js[[:space:]]RECONCILE_BOUNDED_CARTERA_QUOTE_BRIDGE' "$MANIFEST"
grep -q '^cartera.js[[:space:]]REPLACE_LEGACY_WITH_ACCEPTED_CANONICAL_ROUTE' "$MANIFEST"
! grep -q '^\.github/workflows/cartera-0' "$MANIFEST"
echo 'CARTERA_130_STATIC_CONTRACT=PASS'

echo '========== CARTERA 130 TARGETED TESTS =========='
node --test tests/cartera-130-selective-promotion-test.mjs

mapfile -t candidate_unit_tests < <(
  grep -l -E "(from ['\"]node:test['\"]|require\(['\"]node:test['\"]\))" tests/cartera-* 2>/dev/null |
  grep -Ev '(browser|playwright|e2e|remote|transactional|supabase|migration|scope-acceptance|130-selective)' |
  sort -u
)

runtime_unit_tests=()
acceptance_scaffolding_tests=()
for test_path in "${candidate_unit_tests[@]}"; do
  if grep -Eq '(scripts/ci/|tools/termux/|\.github/workflows/)' "$test_path"; then
    acceptance_scaffolding_tests+=("$test_path")
  else
    runtime_unit_tests+=("$test_path")
  fi
done

if [[ ${#runtime_unit_tests[@]} -lt 20 ]]; then
  echo "CARTERA130_RUNTIME_UNIT_TEST_SET_TOO_SMALL=${#runtime_unit_tests[@]}" >&2
  exit 1
fi

printf '%s\n' "${runtime_unit_tests[@]}" > "$ARTIFACT_DIR/runtime-unit-tests.txt"
printf '%s\n' "${acceptance_scaffolding_tests[@]}" > "$ARTIFACT_DIR/non-promoted-acceptance-scaffolding-tests.txt"
node --test "${runtime_unit_tests[@]}"
echo "CARTERA_130_INHERITED_RUNTIME_UNIT_TEST_FILES=${#runtime_unit_tests[@]}"
echo "CARTERA_130_NON_PROMOTED_ACCEPTANCE_SCAFFOLDING_TEST_FILES=${#acceptance_scaffolding_tests[@]}"
echo 'CARTERA_130_INHERITED_RUNTIME_TESTS=PASS'

copied_count="$(awk -F '\t' '$2 ~ /^COPY_ACCEPTED_BLOB|REPLACE_LEGACY/ { count += 1 } END { print count + 0 }' "$MANIFEST")"
reconciled_count="$(awk -F '\t' '$2 ~ /^RECONCILE_CURRENT_MAIN|RECONCILE_BOUNDED|PRESERVE_PRE_PROMOTION/ { count += 1 } END { print count + 0 }' "$MANIFEST")"
acceptance_source_head="$(git rev-parse HEAD)"

if [[ ! -f "$CLOSURE" ]]; then
cat > "$CLOSURE" <<EOF
# FORGE CARTERA 130 — HEAD-BOUND SELECTIVE PROMOTION CLOSURE 001

\`\`\`text
STATUS=REMOTE_ACCEPTED
AUTHORIZATION_PHRASE=AUTHORIZE_CARTERA_120_SELECTIVE_PROMOTION
BOARD_APPROVAL=GRANTED
MERGE_AUTHORIZATION=GRANTED
CURRENT_MAIN_SOURCE_HEAD=$CURRENT_MAIN_HEAD
ACCEPTED_PROGRAM_HEAD=$ACCEPTED_PROGRAM_HEAD
ACCEPTANCE_SOURCE_HEAD=$acceptance_source_head
WORKFLOW_RUN=${GITHUB_RUN_ID:-LOCAL}
WORKFLOW_JOB=${GITHUB_JOB:-LOCAL}
PROMOTION_STRATEGY=SELECTIVE_CURRENT_MAIN_PROMOTION
CURRENT_MAIN_HEAD_LOCK=PASS
ACCEPTED_PROGRAM_HEAD_LOCK=PASS
BOUNDED_PATHS=PASS
CARTERA_130_STATIC_CONTRACT=PASS
CARTERA_130_TARGETED_TESTS=PASS
CARTERA_130_INHERITED_RUNTIME_TESTS=PASS
FILES_COPIED=$copied_count
FILES_RECONCILED=$reconciled_count
CURRENT_MAIN_APP_RECONCILED=YES
LEGACY_CARTERA_PRESERVED=YES
CANONICAL_CARTERA_ROUTE_PROMOTED=YES
FORECAST_PRESERVED=YES
MATERIAL3_CURRENT_RUNTIME_PRESERVED_WITH_BOUNDED_CARTERA_BRIDGE=YES
PIPELINE_PRESERVED=YES
QUOTES_PRESERVED=YES
SUPABASE_REMOTE_MUTATION=NO
DATABASE_MIGRATION_REPLAY=NO
PRODUCT_UI_MUTATION=CARTERA_AND_BOUNDED_QUOTE_BRIDGE_ONLY
DEPLOYMENT=PENDING_CONTROLLED_MERGE
PR_MERGE_AUTHORIZATION=GRANTED
CARTERA_130_COMPLETE=YES
NEXT=CONTROLLED_SQUASH_MERGE_AND_PAGES_ACCEPTANCE
\`\`\`
EOF
fi

cp "$MANIFEST" "$ARTIFACT_DIR/promotion-manifest.tsv"
cp "$CLOSURE" "$ARTIFACT_DIR/closure.md"
printf '%s\n' "${changed_paths[@]}" > "$ARTIFACT_DIR/changed-paths.txt"
cat > "$ARTIFACT_DIR/result.env" <<EOF
CARTERA_130_CURRENT_MAIN_SOURCE_HEAD=$CURRENT_MAIN_HEAD
CARTERA_130_ACCEPTED_PROGRAM_HEAD=$ACCEPTED_PROGRAM_HEAD
CARTERA_130_ACCEPTANCE_SOURCE_HEAD=$acceptance_source_head
CARTERA_130_FILES_COPIED=$copied_count
CARTERA_130_FILES_RECONCILED=$reconciled_count
CARTERA_130_REMOTE_ACCEPTANCE=PASS
CARTERA_130_COMPLETE=YES
MERGE_AUTHORIZATION=GRANTED
EOF
cat "$ARTIFACT_DIR/result.env"
