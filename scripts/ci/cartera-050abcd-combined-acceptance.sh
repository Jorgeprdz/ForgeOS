#!/usr/bin/env bash
set -euo pipefail

SOURCE_HEAD='19091b873b900f79e586f43149b89130dbe7a099'
BRANCH='feature/cartera-050abcd-future-radar-conservation'
ARTIFACT_DIR='artifacts/cartera-050abcd-remote-acceptance'
mkdir -p "$ARTIFACT_DIR"

echo '========== CARTERA 050A–050D SOURCE GATE =========='
test "$(git rev-parse HEAD)" = "$CARTERA_050ABCD_ACCEPTANCE_HEAD"
git merge-base --is-ancestor "$SOURCE_HEAD" HEAD
git diff --check "$SOURCE_HEAD"...HEAD
mapfile -t changed < <(git diff --name-only "$SOURCE_HEAD"...HEAD)
printf 'CHANGED_FILE=%s\n' "${changed[@]}"
allowed='^(app\.js|advisor-os/cartera/cartera-050[a-d]-[A-Za-z0-9._-]+\.js|platform/portfolio-intelligence/cartera-050[a-d]-[A-Za-z0-9._-]+\.js|supabase/migrations/2026080100028[01]_cartera050_[A-Za-z0-9._-]+\.sql|tests/cartera-050(abcd|a|b|c|d|ab)-[A-Za-z0-9._-]+\.mjs|tests/cartera-030cd-ui-integration-test\.mjs|scripts/ci/cartera-050abcd-[A-Za-z0-9._-]+\.(mjs|sql|sh)|docs/architecture/source-truth/FORGE_CARTERA_050ABCD_[A-Za-z0-9._-]+\.md|docs/evidence/FORGE_CARTERA_050ABCD_[A-Za-z0-9._-]+\.md|\.github/workflows/cartera-050abcd-[A-Za-z0-9._-]+\.yml)$'
for path in "${changed[@]}"; do
  [[ "$path" =~ $allowed ]] || { echo "UNAUTHORIZED_050ABCD_PATH=$path" >&2; exit 1; }
done
echo 'SOURCE_ANCESTRY=PASS'
echo 'BOUNDED_PATHS=PASS'
echo 'PRODUCT_UI_MUTATION=YES_BOUNDED_TO_CARTERA'
echo 'ACCOUNT_MUTATION=NOT_AUTHORIZED'
echo 'CONSERVATION_FORMULA_OWNERSHIP=NO'
echo 'COMPENSATION_FORMULA_OWNERSHIP=NO'
echo 'FINAL_NBA_PRIORITY_OWNERSHIP=NO'

echo '========== CARTERA 050A FUTURE SIGNALS =========='
node --check advisor-os/cartera/cartera-050a-future-radar-service.js
node --check platform/portfolio-intelligence/cartera-050a-future-radar-projection.js
node --test \
  tests/cartera-050a-future-radar-projection-test.mjs \
  tests/cartera-050a-future-radar-service-test.mjs \
  tests/cartera-050ab-sql-contract-test.mjs
echo 'CARTERA_050A_FUTURE_SIGNAL_GATE=PASS'

echo '========== CARTERA 050B EXPLAINABILITY =========='
node --test \
  --test-name-pattern='050B|explainability|authority boundaries|native signals' \
  tests/cartera-050a-future-radar-projection-test.mjs \
  tests/cartera-050ab-sql-contract-test.mjs
echo 'CARTERA_050B_EXPLAINABILITY_GATE=PASS'

echo '========== CARTERA 050C AUTHORITY ADAPTERS =========='
node --check platform/portfolio-intelligence/cartera-050c-authority-adapters.js
node --test tests/cartera-050c-authority-adapters-test.mjs
echo 'CARTERA_050C_AUTHORITY_ADAPTER_GATE=PASS'

echo '========== CARTERA 050D PRODUCT RADAR =========='
node --check advisor-os/cartera/cartera-050d-future-radar-enhancement.js
node --check platform/portfolio-intelligence/cartera-050d-future-radar-view.js
node --check app.js
node --test \
  tests/cartera-050d-future-radar-view-test.mjs \
  tests/cartera-050abcd-ui-integration-test.mjs
echo 'CARTERA_050D_PRODUCT_RADAR_GATE=PASS'

echo '========== INHERITED CARTERA =========='
node --test \
  tests/cartera-040a-relationship-memory-service-test.mjs \
  tests/cartera-040a-sql-contract-test.mjs \
  tests/cartera-040b-read-sql-contract-test.mjs \
  tests/cartera-040b-relationship-memory-projection-test.mjs \
  tests/cartera-040d-relationship-brief-view-test.mjs \
  tests/cartera-040abcd-ui-integration-test.mjs
node --test tests/cartera-030b-*.mjs
node --test \
  tests/cartera-030c-confirmed-payment-reconciliation-service-test.mjs \
  tests/cartera-030c-sql-contract-test.mjs \
  tests/cartera-030d-policy-payment-calendar-service-test.mjs \
  tests/cartera-030d-policy-payment-calendar-view-test.mjs \
  tests/cartera-030d-sql-contract-test.mjs \
  tests/cartera-030cd-ui-integration-test.mjs
node tests/payment-evidence-packet-test.js
node tests/payment-event-engine-test.js
node --test tests/cartera-030a-policy-payment-calendar-scope-test.mjs
echo 'INHERITED_CARTERA_GATES=PASS'

echo '========== CARTERA 050A–D REMOTE ACCEPTANCE =========='
test "$CARTERA_050ABCD_REMOTE_MUTATION_AUTHORIZED" = 'YES:CARTERA_050ABCD_REMOTE_MUTATION'
test "$SUPABASE_PROJECT_REF" = 'rmlxigxysujsuwzgoimv'
test -n "$SUPABASE_ACCESS_TOKEN"
node --check scripts/ci/cartera-050abcd-remote-acceptance.mjs
node scripts/ci/cartera-050abcd-remote-acceptance.mjs \
  | tee "$ARTIFACT_DIR/workflow-output.log"

log="$ARTIFACT_DIR/workflow-output.log"
for marker in \
  CARTERA_050ABCD_REMOTE_DEPLOYMENT=PASS \
  CARTERA_050ABCD_CATALOG_VERIFICATION=PASS \
  CARTERA_050ABCD_TRANSACTIONAL_ACCEPTANCE=PASS \
  TODAY_7_30_90_HORIZONS=PASS \
  EXPECTED_PAYMENT_SIGNAL=PASS \
  POSSIBLE_LATE_PAYMENT_IS_INFERENCE=PASS \
  POLICY_YEAR_TRANSITION=PASS \
  RELATIONSHIP_REVIEW_SIGNAL=PASS \
  POLICY_SERVICE_SIGNAL=PASS \
  EXPLAINABILITY_CONTRACT=PASS \
  CONSERVATION_AUTHORITY_ADAPTER_BOUNDARY=PASS \
  COMPENSATION_AUTHORITY_ADAPTER_BOUNDARY=PASS \
  RLS_CROSS_ADVISOR=PASS \
  AUTOMATIC_CONTACT=BLOCKED \
  AUTOMATIC_OPPORTUNITY=BLOCKED \
  FINAL_MESSAGE_GENERATION=BLOCKED \
  LAPSE_INFERENCE=BLOCKED \
  FINAL_NBA_PRIORITY_TRUTH=BLOCKED \
  TEST_FIXTURES_ROLLED_BACK=YES \
  RESIDUAL_FIXTURES=0 \
  CARTERA_050ABCD_REMOTE_ACCEPTANCE=PASS \
  CARTERA_050A_COMPLETE=YES \
  CARTERA_050B_COMPLETE=YES \
  CARTERA_050C_COMPLETE=YES \
  CARTERA_050D_COMPLETE=YES \
  CARTERA_050_COMPLETE=YES; do
  grep -q "$marker" "$log"
done

echo '========== PERSIST CLOSURE =========='
closure='docs/evidence/FORGE_CARTERA_050ABCD_REMOTE_ACCEPTANCE_CLOSURE_001.md'
cat > "$closure" <<CLOSURE
# FORGE CARTERA 050A–050D — REMOTE ACCEPTANCE CLOSURE 001

\`\`\`text
STATUS=REMOTE_ACCEPTED
WORKFLOW_RUN=${GITHUB_RUN_ID}
WORKFLOW_JOB=combined-delivery
WORKFLOW_ATTEMPT=${GITHUB_RUN_ATTEMPT}
ACCEPTANCE_HEAD=${CARTERA_050ABCD_ACCEPTANCE_HEAD}
PROJECT_REF=${SUPABASE_PROJECT_REF}
MIGRATION_20260801000280=APPLIED_AND_MATCHED
MIGRATION_20260801000281=APPLIED_AND_MATCHED
CARTERA_050A_FUTURE_SIGNAL_GATE=PASS
CARTERA_050B_EXPLAINABILITY_GATE=PASS
CARTERA_050C_AUTHORITY_ADAPTER_GATE=PASS
CARTERA_050D_PRODUCT_RADAR_GATE=PASS
TODAY_7_30_90_HORIZONS=PASS
EXPECTED_PAYMENT_SIGNAL=PASS
POSSIBLE_LATE_PAYMENT_IS_INFERENCE=PASS
POLICY_YEAR_TRANSITION=PASS
RELATIONSHIP_REVIEW_SIGNAL=PASS
POLICY_SERVICE_SIGNAL=PASS
EXPLAINABILITY_CONTRACT=PASS
CONSERVATION_AUTHORITY_ADAPTER_BOUNDARY=PASS
COMPENSATION_AUTHORITY_ADAPTER_BOUNDARY=PASS
RLS_CROSS_ADVISOR=PASS
AUTOMATIC_CONTACT=BLOCKED
AUTOMATIC_OPPORTUNITY=BLOCKED
FINAL_MESSAGE_GENERATION=BLOCKED
LAPSE_INFERENCE=BLOCKED
FINAL_NBA_PRIORITY_TRUTH=BLOCKED
TEST_FIXTURES_ROLLED_BACK=YES
RESIDUAL_FIXTURES=0
PRODUCT_UI_MUTATION=YES_BOUNDED_TO_CARTERA
ACCOUNT_MUTATION=NOT_AUTHORIZED
CARTERA_050ABCD_REMOTE_ACCEPTANCE=PASS
CARTERA_050A_COMPLETE=YES
CARTERA_050B_COMPLETE=YES
CARTERA_050C_COMPLETE=YES
CARTERA_050D_COMPLETE=YES
CARTERA_050_COMPLETE=YES
NEXT=CARTERA_060_RELATIONSHIP_GROWTH_INTELLIGENCE
\`\`\`
CLOSURE

git config user.name 'github-actions[bot]'
git config user.email '41898282+github-actions[bot]@users.noreply.github.com'
git add "$closure"
git commit -m 'docs(cartera): close combined 050A through 050D acceptance'
git push origin "HEAD:$BRANCH"
echo 'CARTERA_050ABCD_CLOSURE=PERSISTED'
