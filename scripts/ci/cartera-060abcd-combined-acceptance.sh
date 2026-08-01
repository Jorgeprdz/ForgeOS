#!/usr/bin/env bash
set -euo pipefail

SOURCE_HEAD='162a190b035b7ba3297665e7859042553981590c'
BRANCH='feature/cartera-060abcd-relationship-growth-intelligence'

echo '========== CARTERA 060A–060D SOURCE GATE =========='
git merge-base --is-ancestor "$SOURCE_HEAD" HEAD
echo 'SOURCE_ANCESTRY=PASS'
for path in $(git diff --name-only "$SOURCE_HEAD"...HEAD); do
  case "$path" in
    .github/workflows/cartera-060abcd-combined-acceptance.yml|\
    advisor-os/cartera/cartera-060*.js|\
    platform/relationship-intelligence/cartera-060*.js|\
    scripts/ci/cartera-060*|\
    supabase/migrations/2026080100029*.sql|\
    tests/cartera-060*|\
    docs/architecture/source-truth/FORGE_CARTERA_060*|\
    docs/evidence/FORGE_CARTERA_060*|\
    app.js) ;;
    *) echo "UNBOUNDED_PATH=$path"; exit 1 ;;
  esac
done
echo 'BOUNDED_PATHS=PASS'
echo 'PRODUCT_UI_MUTATION=YES_BOUNDED_TO_CARTERA'
echo 'ACCOUNT_MUTATION=NOT_AUTHORIZED'
echo 'PIPELINE_OPPORTUNITY_MUTATION=NOT_AUTHORIZED'
echo 'RELATIONSHIP_GRAPH_MUTATION=NO'
echo 'FINAL_NBA_PRIORITY_OWNERSHIP=NO'

echo '========== CARTERA 060A NATURAL GROWTH SIGNALS =========='
node --test tests/cartera-060a-growth-review-projection-test.mjs tests/cartera-060ab-sql-contract-test.mjs
echo 'CARTERA_060A_GROWTH_SIGNAL_GATE=PASS'

echo '========== CARTERA 060B CONSENT AND NON-MANIPULATION =========='
node --test tests/cartera-060b-growth-boundary-test.mjs tests/cartera-060ab-sql-contract-test.mjs
echo 'CARTERA_060B_BOUNDARY_GATE=PASS'

echo '========== CARTERA 060C GOVERNED REVIEW =========='
node --test tests/cartera-060c-service-contract-test.mjs tests/cartera-060a-growth-review-projection-test.mjs
echo 'CARTERA_060C_GOVERNED_REVIEW_GATE=PASS'

echo '========== CARTERA 060D PRODUCT SURFACE =========='
node --test tests/cartera-060d-growth-review-view-test.mjs tests/cartera-060abcd-ui-integration-test.mjs
echo 'CARTERA_060D_PRODUCT_GATE=PASS'

echo '========== INHERITED CARTERA =========='
node --test tests/cartera-050*.mjs
node --test tests/cartera-040*.mjs
node --test tests/cartera-030cd*.mjs
echo 'INHERITED_CARTERA_GATES=PASS'

echo '========== CARTERA 060A–D REMOTE ACCEPTANCE =========='
node scripts/ci/cartera-060abcd-remote-acceptance.mjs

echo '========== PERSIST CLOSURE =========='
mkdir -p docs/evidence
cat > docs/evidence/FORGE_CARTERA_060ABCD_REMOTE_ACCEPTANCE_CLOSURE_001.md <<EOF
# FORGE CARTERA 060A–060D — REMOTE ACCEPTANCE CLOSURE 001

\`\`\`text
STATUS=REMOTE_ACCEPTED
WORKFLOW_RUN=${GITHUB_RUN_ID}
WORKFLOW_JOB=combined-delivery
WORKFLOW_ATTEMPT=${GITHUB_RUN_ATTEMPT}
ACCEPTANCE_HEAD=${CARTERA_060ABCD_ACCEPTANCE_HEAD}
PROJECT_REF=${SUPABASE_PROJECT_REF}
MIGRATION_20260801000290=APPLIED_AND_MATCHED
MIGRATION_20260801000291=APPLIED_AND_MATCHED
CARTERA_060A_GROWTH_SIGNAL_GATE=PASS
CARTERA_060B_BOUNDARY_GATE=PASS
CARTERA_060C_GOVERNED_REVIEW_GATE=PASS
CARTERA_060D_PRODUCT_GATE=PASS
SECOND_POLICY_REVIEW=PASS
PROTECTION_REVIEW=PASS
REFERRAL_RELATIONSHIP=PASS
CENTER_OF_INFLUENCE=PASS
EXPLAINABILITY_AND_EVIDENCE=PASS
CLIENT_WILLINGNESS_GATE=PASS
RLS_CROSS_ADVISOR=PASS
AUTOMATIC_OPPORTUNITY=BLOCKED
AUTOMATIC_CONTACT=BLOCKED
REFERRAL_REQUEST_EXECUTION=BLOCKED
FINAL_MESSAGE_GENERATION=BLOCKED
LIFE_CONTEXT_SALES_TRIGGER=BLOCKED
FINAL_NBA_PRIORITY_TRUTH=BLOCKED
TEST_FIXTURES_ROLLED_BACK=YES
RESIDUAL_FIXTURES=0
PRODUCT_UI_MUTATION=YES_BOUNDED_TO_CARTERA
ACCOUNT_MUTATION=NOT_AUTHORIZED
CARTERA_060ABCD_REMOTE_ACCEPTANCE=PASS
CARTERA_060A_COMPLETE=YES
CARTERA_060B_COMPLETE=YES
CARTERA_060C_COMPLETE=YES
CARTERA_060D_COMPLETE=YES
CARTERA_060_COMPLETE=YES
NEXT=CARTERA_070_CANDY_CRUSH_RELATIONAL_ACTIVATION
\`\`\`
EOF
git config user.name 'github-actions[bot]'
git config user.email '41898282+github-actions[bot]@users.noreply.github.com'
git add docs/evidence/FORGE_CARTERA_060ABCD_REMOTE_ACCEPTANCE_CLOSURE_001.md
git commit -m 'docs(cartera): close combined 060A through 060D acceptance'
git push origin "HEAD:$BRANCH"
echo 'CARTERA_060ABCD_CLOSURE=PERSISTED'
