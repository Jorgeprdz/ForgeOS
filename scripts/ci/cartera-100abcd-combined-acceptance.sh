#!/usr/bin/env bash
set -euo pipefail

SOURCE_HEAD='de51560ddf506c42c6e50e198be58b18c7ddd518'
BRANCH='feature/cartera-100abcd-productivity-proof-learning'
ARTIFACT_DIR='artifacts/cartera-100abcd-remote-acceptance'
mkdir -p "$ARTIFACT_DIR"
exec > >(tee "$ARTIFACT_DIR/combined-acceptance.log") 2>&1

echo '========== CARTERA 100A–100D SOURCE GATE =========='
git merge-base --is-ancestor "$SOURCE_HEAD" HEAD
echo 'SOURCE_ANCESTRY=PASS'

while IFS= read -r path; do
  case "$path" in
    .github/workflows/cartera-100abcd-combined-acceptance.yml|\
    advisor-os/cartera/cartera-100*.js|\
    platform/productivity/cartera-100*.js|\
    scripts/ci/cartera-100*|\
    supabase/migrations/2026080100032*.sql|\
    tests/cartera-100*.mjs|\
    docs/architecture/source-truth/FORGE_CARTERA_100*|\
    docs/evidence/FORGE_CARTERA_100*|\
    app.js) ;;
    *) echo "UNBOUNDED_PATH=$path"; exit 1 ;;
  esac
done < <(git diff --name-only "$SOURCE_HEAD"...HEAD)
echo 'BOUNDED_PATHS=PASS'

echo 'PRODUCT_UI_MUTATION=YES_BOUNDED_TO_CARTERA'
echo 'PRODUCTIVITY_OBSERVATION_MUTATION=YES_GOVERNED_APPEND_ONLY'
echo 'ACCOUNT_MUTATION=NOT_AUTHORIZED'
echo 'CONTACT_EXECUTION=NOT_AUTHORIZED'
echo 'MESSAGE_MUTATION=NOT_AUTHORIZED'
echo 'TASK_MUTATION=NOT_AUTHORIZED'
echo 'CALENDAR_MUTATION=NOT_AUTHORIZED'
echo 'PIPELINE_OPPORTUNITY_MUTATION=NOT_AUTHORIZED'
echo 'HUMAN_SCORE_AUTHORITY=NO'
echo 'ADVISOR_RANKING_AUTHORITY=NO'
echo 'ENFORCEMENT_AUTHORITY=NO'
echo 'UNSUPPORTED_CAUSAL_CREDIT=NO'

echo '========== CARTERA 100 STATIC CONTRACT =========='
node --check platform/productivity/cartera-100a-productivity-proof-contract.js
node --check platform/productivity/cartera-100b-outcome-learning-boundary.js
node --check advisor-os/cartera/cartera-100c-productivity-proof-service.js
node --check platform/productivity/cartera-100d-productivity-proof-view.js
node --check advisor-os/cartera/cartera-100d-productivity-proof-enhancement.js
node --check scripts/ci/cartera-100-materialize-app.mjs
node --check scripts/ci/cartera-100abcd-remote-acceptance.mjs
if grep -R -nE 'advisor-score-engine|calcularScoreAsesor|sendMessage|createTask|createCalendar|createOpportunity|requestReferral' \
  platform/productivity/cartera-100* \
  advisor-os/cartera/cartera-100*; then
  echo 'CARTERA100_RESTRICTED_RUNTIME_DEPENDENCY=FOUND'
  exit 1
fi
if grep -R -nE '\.(insert|update|delete)\(' advisor-os/cartera/cartera-100* platform/productivity/cartera-100*; then
  echo 'CARTERA100_DIRECT_CLIENT_MUTATION=FOUND'
  exit 1
fi
echo 'CARTERA_100_STATIC_CONTRACT=PASS'

echo '========== CARTERA 100A–100D TARGETED TESTS =========='
node --test tests/cartera-100*.mjs
echo 'CARTERA_100_TARGETED_TESTS=PASS'

echo '========== INHERITED CARTERA AUTHORITY REGRESSION =========='
node --test \
  tests/cartera-090a-relationship-capital-projection-test.mjs \
  tests/cartera-090b-relationship-capital-boundary-test.mjs \
  tests/cartera-090c-relationship-capital-service-test.mjs \
  tests/cartera-090d-relationship-capital-view-test.mjs \
  tests/cartera-090abcd-ui-integration-test.mjs \
  tests/cartera-080-economic-connection-test.mjs \
  tests/cartera-080-economic-connection-service-test.mjs \
  tests/cartera-080-economic-connection-view-test.mjs \
  tests/cartera-080-ui-integration-test.mjs \
  tests/cartera-070a-relational-activation-projection-test.mjs \
  tests/cartera-070b-capacity-fit-policy-test.mjs \
  tests/cartera-070c-action-review-boundary-test.mjs \
  tests/cartera-070d-relational-activation-view-test.mjs \
  tests/cartera-070abcd-ui-integration-test.mjs \
  tests/cartera-060a-growth-review-projection-test.mjs \
  tests/cartera-060b-growth-boundary-test.mjs \
  tests/cartera-040b-relationship-memory-projection-test.mjs
echo 'CARTERA_100_INHERITED_AUTHORITY_REGRESSION=PASS'

echo '========== CARTERA 100 AUTHORITY ASSERTIONS =========='
grep -q "projectionAuthority: 'CARTERA100_PRODUCTIVITY_PROOF_READ_MODEL'" platform/productivity/cartera-100a-productivity-proof-contract.js
grep -q "advisorFeedbackRequiredForLearning: true" platform/productivity/cartera-100a-productivity-proof-contract.js
grep -q "permissionInferredFromSilence: false" platform/productivity/cartera-100b-outcome-learning-boundary.js
grep -q "humanPerformanceScore: false" platform/productivity/cartera-100a-productivity-proof-contract.js
grep -q 'bindCartera100ProductivityProof();' app.js
grep -q 'forge_cartera100_record_productivity_observation' supabase/migrations/20260801000320_cartera100_productivity_observation_authority.sql
grep -q 'forge_cartera100_list_productivity_proof' supabase/migrations/20260801000321_cartera100_productivity_proof_read.sql
echo 'CARTERA_100_AUTHORITY_ASSERTIONS=PASS'

echo '========== CARTERA 100A–100D REMOTE ACCEPTANCE =========='
node scripts/ci/cartera-100abcd-remote-acceptance.mjs

echo '========== PERSIST CARTERA 100 CLOSURE =========='
mkdir -p docs/evidence
cat > docs/evidence/FORGE_CARTERA_100ABCD_REMOTE_ACCEPTANCE_CLOSURE_001.md <<EOF
# FORGE CARTERA 100A–100D — REMOTE ACCEPTANCE CLOSURE 001

\`\`\`text
STATUS=REMOTE_ACCEPTED
SOURCE_HEAD=$SOURCE_HEAD
ACCEPTANCE_HEAD=${CARTERA_100ABCD_ACCEPTANCE_HEAD}
WORKFLOW_RUN=${GITHUB_RUN_ID}
WORKFLOW_JOB=combined-delivery
WORKFLOW_ATTEMPT=${GITHUB_RUN_ATTEMPT}
PROJECT_REF=${SUPABASE_PROJECT_REF}
MIGRATION_20260801000320=APPLIED_OR_ALREADY_APPLIED_AND_MATCHED
MIGRATION_20260801000321=APPLIED_OR_ALREADY_APPLIED_AND_MATCHED
SOURCE_ANCESTRY=PASS
BOUNDED_PATHS=PASS
CARTERA_100_STATIC_CONTRACT=PASS
CARTERA_100_TARGETED_TESTS=PASS
CARTERA_100_INHERITED_AUTHORITY_REGRESSION=PASS
CARTERA_100_AUTHORITY_ASSERTIONS=PASS
CARTERA_100ABCD_REMOTE_DEPLOYMENT=PASS
CARTERA_100ABCD_CATALOG_VERIFICATION=PASS
CARTERA_100ABCD_TRANSACTIONAL_ACCEPTANCE=PASS
APPEND_ONLY_OBSERVATION_AUTHORITY=PASS
DIGEST_BOUND_AUTHORIZATION=PASS
IDEMPOTENT_REPLAY=PASS
CHANGED_INPUT_CONFLICT=PASS
EXPLICIT_ADVISOR_FEEDBACK=PASS
INDEPENDENT_OUTCOME_OVERRIDE=PASS
RELATIONSHIP_REVIEW_METRIC=PASS
CONSENTED_REFERRAL_METRIC=PASS
UNKNOWN_IS_NOT_ZERO=PASS
RLS_CROSS_ADVISOR=PASS
DIRECT_WRITES=BLOCKED
HUMAN_SCORE=BLOCKED
ADVISOR_RANKING=BLOCKED
SILENT_CONSENT=BLOCKED
CONTACT_VOLUME_OPTIMIZATION=BLOCKED
UNSUPPORTED_CAUSAL_CREDIT=BLOCKED
AUTOMATIC_CONTACT=BLOCKED
AUTOMATIC_MESSAGE=BLOCKED
AUTOMATIC_TASK=BLOCKED
AUTOMATIC_CALENDAR=BLOCKED
AUTOMATIC_OPPORTUNITY=BLOCKED
TEST_FIXTURES_ROLLED_BACK=YES
RESIDUAL_FIXTURES=0
PRODUCT_UI_MUTATION=YES_BOUNDED_TO_CARTERA
ACCOUNT_MUTATION=NOT_AUTHORIZED
MAIN_MUTATION=NOT_AUTHORIZED
CARTERA_100A_COMPLETE=YES
CARTERA_100B_COMPLETE=YES
CARTERA_100C_COMPLETE=YES
CARTERA_100D_COMPLETE=YES
CARTERA_100_COMPLETE=YES
CARTERA_RELATIONSHIP_INTELLIGENCE_ROADMAP_COMPLETE=YES
NEXT=CARTERA_PROGRAM_COMPLETION_AND_PROMOTION_DECISION
MERGE_AUTHORIZATION=NOT_GRANTED
\`\`\`
EOF

git config user.name 'github-actions[bot]'
git config user.email '41898282+github-actions[bot]@users.noreply.github.com'
git add docs/evidence/FORGE_CARTERA_100ABCD_REMOTE_ACCEPTANCE_CLOSURE_001.md
if ! git diff --cached --quiet; then
  git commit -m 'docs(cartera): close 100A through 100D productivity proof'
  git push origin "HEAD:$BRANCH"
fi
echo 'CARTERA_100ABCD_CLOSURE=PERSISTED'
echo 'CARTERA_100ABCD_REMOTE_ACCEPTANCE=PASS'
