#!/usr/bin/env bash
set -euo pipefail

SOURCE_HEAD='655a0595515a4b3ed2ef1eb8d91f080939049f00'
BRANCH='feature/cartera-040abcd-relationship-memory-product'
ARTIFACT_DIR='artifacts/cartera-040abcd-remote-acceptance'
mkdir -p "$ARTIFACT_DIR"

echo '========== CARTERA 040A–040D SOURCE GATE =========='
test "$(git rev-parse HEAD)" = "$CARTERA_040ABCD_ACCEPTANCE_HEAD"
git merge-base --is-ancestor "$SOURCE_HEAD" HEAD
git diff --check "$SOURCE_HEAD"...HEAD
mapfile -t changed < <(git diff --name-only "$SOURCE_HEAD"...HEAD)
printf 'CHANGED_FILE=%s\n' "${changed[@]}"
allowed='^(app\.js|advisor-os/cartera/cartera-040[a-d]-[A-Za-z0-9._-]+\.js|platform/relationship-intelligence/cartera-040[a-d]-[A-Za-z0-9._-]+\.js|supabase/migrations/2026080100027[01]_cartera040_[A-Za-z0-9._-]+\.sql|tests/cartera-040(abcd|a|b|c|d)-[A-Za-z0-9._-]+\.mjs|scripts/ci/cartera-040abcd-[A-Za-z0-9._-]+\.(mjs|sql|sh)|docs/architecture/source-truth/FORGE_CARTERA_040ABCD_[A-Za-z0-9._-]+\.md|docs/evidence/FORGE_CARTERA_040ABCD_[A-Za-z0-9._-]+\.md|\.github/workflows/cartera-040abcd-[A-Za-z0-9._-]+\.yml)$'
for path in "${changed[@]}"; do
  [[ "$path" =~ $allowed ]] || { echo "UNAUTHORIZED_040ABCD_PATH=$path" >&2; exit 1; }
done
echo 'SOURCE_ANCESTRY=PASS'
echo 'BOUNDED_PATHS=PASS'
echo 'PRODUCT_UI_MUTATION=YES_BOUNDED_TO_CARTERA'
echo 'ACCOUNT_MUTATION=NOT_AUTHORIZED'

echo '========== CARTERA 040A DURABLE MEMORY =========='
node --check advisor-os/cartera/cartera-040a-relationship-memory-service.js
node --test \
  tests/cartera-040a-relationship-memory-service-test.mjs \
  tests/cartera-040a-sql-contract-test.mjs
echo 'CARTERA_040A_DURABLE_MEMORY_GATE=PASS'

echo '========== CARTERA 040B UNIFIED HISTORY =========='
node --check platform/relationship-intelligence/cartera-040b-relationship-memory-projection.js
node --test \
  tests/cartera-040b-relationship-memory-projection-test.mjs \
  tests/cartera-040b-read-sql-contract-test.mjs
echo 'CARTERA_040B_UNIFIED_HISTORY_GATE=PASS'

echo '========== CARTERA 040C CONSENT BOUNDARY =========='
node --test \
  --test-name-pattern='040C|sensitive|life context|sales trigger' \
  tests/cartera-040a-relationship-memory-service-test.mjs \
  tests/cartera-040a-sql-contract-test.mjs \
  tests/cartera-040b-relationship-memory-projection-test.mjs
echo 'CARTERA_040C_CONSENT_BOUNDARY_GATE=PASS'

echo '========== CARTERA 040D PRODUCT =========='
node --check advisor-os/cartera/cartera-040d-relationship-memory-enhancement.js
node --check platform/relationship-intelligence/cartera-040d-relationship-brief-view.js
node --check app.js
node --test \
  tests/cartera-040d-relationship-brief-view-test.mjs \
  tests/cartera-040abcd-ui-integration-test.mjs
echo 'CARTERA_040D_PRODUCT_GATE=PASS'

echo '========== INHERITED CARTERA/PAYMENT =========='
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
echo 'INHERITED_CARTERA_AND_PAYMENT_GATES=PASS'

echo '========== CARTERA 040A–D REMOTE ACCEPTANCE =========='
test "$CARTERA_040ABCD_REMOTE_MUTATION_AUTHORIZED" = 'YES:CARTERA_040ABCD_REMOTE_MUTATION'
test "$SUPABASE_PROJECT_REF" = 'rmlxigxysujsuwzgoimv'
test -n "$SUPABASE_ACCESS_TOKEN"
node --check scripts/ci/cartera-040abcd-remote-acceptance.mjs
node scripts/ci/cartera-040abcd-remote-acceptance.mjs \
  | tee "$ARTIFACT_DIR/workflow-output.log"

log="$ARTIFACT_DIR/workflow-output.log"
for marker in \
  CARTERA_040ABCD_REMOTE_DEPLOYMENT=PASS \
  CARTERA_040ABCD_CATALOG_VERIFICATION=PASS \
  AUTHORIZATION_DIGEST_COMPATIBILITY=PASS \
  CARTERA_040ABCD_TRANSACTIONAL_ACCEPTANCE=PASS \
  DURABLE_RELATIONSHIP_MEMORY=PASS \
  UNIFIED_RELATIONSHIP_HISTORY=PASS \
  NETWORK_CONTEXT_PROJECTION=PASS \
  SENSITIVE_CONTEXT_CONSENT_GATE=PASS \
  CHANGED_INPUT_CONFLICT=PASS \
  SANITIZED_PRE_CONTACT_BRIEF=PASS \
  RLS_CROSS_ADVISOR=PASS \
  DIRECT_WRITES=BLOCKED \
  AUTOMATIC_CONTACT=BLOCKED \
  AUTOMATIC_OPPORTUNITY=BLOCKED \
  FINAL_MESSAGE_GENERATION=BLOCKED \
  LIFE_CONTEXT_SALES_TRIGGER=BLOCKED \
  TEST_FIXTURES_ROLLED_BACK=YES \
  RESIDUAL_FIXTURES=0 \
  CARTERA_040ABCD_REMOTE_ACCEPTANCE=PASS \
  CARTERA_040A_COMPLETE=YES \
  CARTERA_040B_COMPLETE=YES \
  CARTERA_040C_COMPLETE=YES \
  CARTERA_040D_COMPLETE=YES \
  CARTERA_040_COMPLETE=YES; do
  grep -q "$marker" "$log"
done

echo '========== PERSIST CLOSURE =========='
closure='docs/evidence/FORGE_CARTERA_040ABCD_REMOTE_ACCEPTANCE_CLOSURE_001.md'
cat > "$closure" <<EOF
# FORGE CARTERA 040A–040D — REMOTE ACCEPTANCE CLOSURE 001

\`\`\`text
STATUS=REMOTE_ACCEPTED
WORKFLOW_RUN=${GITHUB_RUN_ID}
WORKFLOW_JOB=combined-delivery
WORKFLOW_ATTEMPT=${GITHUB_RUN_ATTEMPT}
ACCEPTANCE_HEAD=${CARTERA_040ABCD_ACCEPTANCE_HEAD}
PROJECT_REF=${SUPABASE_PROJECT_REF}
MIGRATION_20260801000270=APPLIED_AND_MATCHED
MIGRATION_20260801000271=APPLIED_AND_MATCHED
CARTERA_040A_DURABLE_MEMORY_GATE=PASS
CARTERA_040B_UNIFIED_HISTORY_GATE=PASS
CARTERA_040C_CONSENT_BOUNDARY_GATE=PASS
CARTERA_040D_PRODUCT_GATE=PASS
DURABLE_RELATIONSHIP_MEMORY=PASS
UNIFIED_RELATIONSHIP_HISTORY=PASS
NETWORK_CONTEXT_PROJECTION=PASS
SENSITIVE_CONTEXT_CONSENT_GATE=PASS
SANITIZED_PRE_CONTACT_BRIEF=PASS
RLS_CROSS_ADVISOR=PASS
DIRECT_WRITES=BLOCKED
AUTOMATIC_CONTACT=BLOCKED
AUTOMATIC_OPPORTUNITY=BLOCKED
FINAL_MESSAGE_GENERATION=BLOCKED
LIFE_CONTEXT_SALES_TRIGGER=BLOCKED
TEST_FIXTURES_ROLLED_BACK=YES
RESIDUAL_FIXTURES=0
PRODUCT_UI_MUTATION=YES_BOUNDED_TO_CARTERA
ACCOUNT_MUTATION=NOT_AUTHORIZED
CARTERA_040ABCD_REMOTE_ACCEPTANCE=PASS
CARTERA_040A_COMPLETE=YES
CARTERA_040B_COMPLETE=YES
CARTERA_040C_COMPLETE=YES
CARTERA_040D_COMPLETE=YES
CARTERA_040_COMPLETE=YES
NEXT=CARTERA_050_FUTURE_RADAR_AND_CONSERVATION
\`\`\`
EOF

git config user.name 'github-actions[bot]'
git config user.email '41898282+github-actions[bot]@users.noreply.github.com'
git add "$closure"
git commit -m 'docs(cartera): close combined 040A through 040D acceptance'
git push origin "HEAD:$BRANCH"
echo 'CARTERA_040ABCD_CLOSURE=PERSISTED'
