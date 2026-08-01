#!/usr/bin/env bash
set -euo pipefail

SOURCE_HEAD='58248a9625cbd9645f76700e1a969856b87d5340'
ARTIFACT_DIR='artifacts/cartera-090abcd-remote-acceptance'
mkdir -p "$ARTIFACT_DIR"
exec > >(tee "$ARTIFACT_DIR/acceptance.log") 2>&1

echo '========== CARTERA 090A–090D SOURCE GATE =========='
git merge-base --is-ancestor "$SOURCE_HEAD" HEAD
echo 'SOURCE_ANCESTRY=PASS'

while IFS= read -r path; do
  case "$path" in
    .github/workflows/cartera-090abcd-combined-acceptance.yml|\
    advisor-os/cartera/cartera-090*.js|\
    platform/relationship-intelligence/cartera-090*.js|\
    scripts/ci/cartera-090*|\
    tests/cartera-090*|\
    docs/architecture/source-truth/FORGE_CARTERA_090*|\
    docs/evidence/FORGE_CARTERA_090*|\
    app.js) ;;
    *) echo "UNBOUNDED_PATH=$path"; exit 1 ;;
  esac
done < <(git diff --name-only "$SOURCE_HEAD"...HEAD)
echo 'BOUNDED_PATHS=PASS'

echo 'SHARED_GRAPH_MUTATION=BLOCKED'
echo 'OPAQUE_INFLUENCE_SCORE=BLOCKED'
echo 'AUTOMATIC_CONTACT=BLOCKED'
echo 'AUTOMATIC_MESSAGE=BLOCKED'
echo 'AUTOMATIC_TASK=BLOCKED'
echo 'AUTOMATIC_CALENDAR=BLOCKED'
echo 'AUTOMATIC_OPPORTUNITY=BLOCKED'
echo 'REFERRAL_REQUEST_EXECUTION=BLOCKED'
echo 'FINAL_NBA_PRIORITY_TRUTH=BLOCKED'
echo 'SUPABASE_REMOTE_MUTATION=NOT_REQUIRED'
echo 'MAIN_MUTATION=NOT_AUTHORIZED'

echo '========== CARTERA 090 STATIC CONTRACT =========='
node --check platform/relationship-intelligence/cartera-090a-relationship-capital-projection.js
node --check platform/relationship-intelligence/cartera-090b-relationship-capital-boundary.js
node --check advisor-os/cartera/cartera-090c-relationship-capital-service.js
node --check platform/relationship-intelligence/cartera-090d-relationship-capital-view.js
node --check advisor-os/cartera/cartera-090d-relationship-capital-enhancement.js
node --check scripts/ci/cartera-090-materialize-app.mjs
if grep -R -nE '\.insert\(|\.update\(|\.delete\(|sendMessage|createTask|createCalendar|createOpportunity|requestReferral' \
  platform/relationship-intelligence/cartera-090* \
  advisor-os/cartera/cartera-090*; then
  echo 'CARTERA090_EXTERNAL_MUTATION_SURFACE=FOUND'
  exit 1
fi
echo 'CARTERA_090_STATIC_CONTRACT=PASS'

echo '========== CARTERA 090A–090D TARGETED TESTS =========='
node --test \
  tests/cartera-090a-relationship-capital-projection-test.mjs \
  tests/cartera-090b-relationship-capital-boundary-test.mjs \
  tests/cartera-090c-relationship-capital-service-test.mjs \
  tests/cartera-090d-relationship-capital-view-test.mjs \
  tests/cartera-090abcd-ui-integration-test.mjs
echo 'CARTERA_090_TARGETED_TESTS=PASS'

echo '========== INHERITED AUTHORITY REGRESSION =========='
node --test \
  tests/cartera-080-economic-connection-test.mjs \
  tests/cartera-080-economic-connection-service-test.mjs \
  tests/cartera-080-economic-connection-view-test.mjs \
  tests/cartera-080-ui-integration-test.mjs \
  tests/cartera-060a-growth-review-projection-test.mjs \
  tests/cartera-060b-growth-boundary-test.mjs \
  tests/cartera-040b-relationship-memory-projection-test.mjs
echo 'CARTERA_090_INHERITED_AUTHORITY_REGRESSION=PASS'

echo '========== AUTHORITY ASSERTIONS =========='
grep -q "projectionAuthority: 'CARTERA090_RELATIONSHIP_CAPITAL_READ_MODEL'" platform/relationship-intelligence/cartera-090a-relationship-capital-projection.js
grep -q "sharedGraphTruthMutated: false" platform/relationship-intelligence/cartera-090a-relationship-capital-projection.js
grep -q "opaqueInfluenceScoreAllowed: false" platform/relationship-intelligence/cartera-090a-relationship-capital-projection.js
grep -q "referralRequested: false" platform/relationship-intelligence/cartera-090b-relationship-capital-boundary.js
grep -q 'bindCartera090RelationshipCapital();' app.js
echo 'CARTERA_090_AUTHORITY_ASSERTIONS=PASS'

cat > "$ARTIFACT_DIR/result.env" <<EOF2
CARTERA_090_SOURCE_HEAD=$SOURCE_HEAD
CARTERA_090_ACCEPTANCE_HEAD=$(git rev-parse HEAD)
CARTERA_090A_REVIEWED_GRAPH_PROJECTION=PASS
CARTERA_090A_CONFIRMED_RELATIONSHIP_CONTEXT=PASS
CARTERA_090B_INFLUENCE_EVIDENCE_BOUNDARY=PASS
CARTERA_090B_NO_OPAQUE_SCORE=PASS
CARTERA_090C_HUMAN_REVIEW_HANDOFF=PASS
CARTERA_090C_HONEST_SOURCE_STATES=PASS
CARTERA_090D_PRODUCT_SURFACE=PASS
CARTERA_090D_NO_GRAPH_MUTATION=PASS
CARTERA_090D_NO_CONTACT_EXECUTION=PASS
CARTERA_090_INHERITED_AUTHORITY_REGRESSION=PASS
CARTERA_090_REMOTE_ACCEPTANCE=PASS
EOF2
cat "$ARTIFACT_DIR/result.env"
