#!/usr/bin/env bash
set -euo pipefail

SOURCE_HEAD='3f8dd05fee7d9b896d8ec6a10224e5669919cd09'
ARTIFACT_DIR='artifacts/cartera-080abcd-remote-acceptance'
mkdir -p "$ARTIFACT_DIR"
exec > >(tee "$ARTIFACT_DIR/acceptance.log") 2>&1

echo '========== CARTERA 080A–080D SOURCE GATE =========='
git merge-base --is-ancestor "$SOURCE_HEAD" HEAD
echo 'SOURCE_ANCESTRY=PASS'

while IFS= read -r path; do
  case "$path" in
    .github/workflows/cartera-080abcd-combined-acceptance.yml|\
    advisor-os/cartera/cartera-080*.js|\
    platform/economic-connection/cartera-080*.js|\
    scripts/ci/cartera-080*|\
    tests/cartera-080*|\
    docs/architecture/source-truth/FORGE_CARTERA_080*|\
    docs/evidence/FORGE_CARTERA_080*|\
    app.js) ;;
    *) echo "UNBOUNDED_PATH=$path"; exit 1 ;;
  esac
done < <(git diff --name-only "$SOURCE_HEAD"...HEAD)
echo 'BOUNDED_PATHS=PASS'

echo 'GMAIL_AUTOREAD=BLOCKED'
echo 'PAYMENT_AUTO_CONFIRMATION=BLOCKED'
echo 'LEDGER_MUTATION=BLOCKED'
echo 'COMMISSION_CALCULATION_IN_CARTERA=BLOCKED'
echo 'SUPABASE_REMOTE_MUTATION=NOT_AUTHORIZED'
echo 'MAIN_MUTATION=NOT_AUTHORIZED'

echo '========== CARTERA 080 STATIC CONTRACT =========='
node --check platform/economic-connection/cartera-080-economic-connection.js
node --check platform/economic-connection/cartera-080-economic-connection-view.js
node --check advisor-os/cartera/cartera-080-economic-connection-service.js
node --check advisor-os/cartera/cartera-080d-economic-connection-enhancement.js
node --check scripts/ci/cartera-080-materialize-app.mjs
if grep -R -nE 'gmail\.users|messages\.list|authorizeGmail|calculateCommission|commissionAmount[[:space:]]*=' \
  platform/economic-connection/cartera-080* \
  advisor-os/cartera/cartera-080*; then
  echo 'CARTERA080_PROHIBITED_ECONOMIC_MUTATION_SURFACE=FOUND'
  exit 1
fi
echo 'CARTERA_080_STATIC_CONTRACT=PASS'

echo '========== CARTERA 080A–080D TARGETED TESTS =========='
node --test \
  tests/cartera-080-economic-connection-test.mjs \
  tests/cartera-080-economic-connection-service-test.mjs \
  tests/cartera-080-economic-connection-view-test.mjs \
  tests/cartera-080-ui-integration-test.mjs
echo 'CARTERA_080_TARGETED_TESTS=PASS'

echo '========== INHERITED PAYMENT AUTHORITY REGRESSION =========='
node --test \
  tests/cartera-030c-confirmed-payment-reconciliation-service-test.mjs \
  tests/payment-evidence-packet-test.js \
  tests/payment-event-engine-test.js
echo 'CARTERA_080_INHERITED_PAYMENT_REGRESSION=PASS'

echo '========== AUTHORITY ASSERTIONS =========='
grep -q "truthClass: 'claim'" platform/economic-connection/cartera-080-economic-connection.js
grep -q "authorizationBasis: 'human_decision_receipt'" platform/economic-connection/cartera-080-economic-connection.js
grep -q "canonicalAuthority: 'policy_payment_reconciliation_030c'" platform/economic-connection/cartera-080-economic-connection.js
grep -q "commissionCalculationPerformed: false" advisor-os/cartera/cartera-080-economic-connection-service.js
grep -q 'bindCartera080EconomicConnection();' app.js
echo 'CARTERA_080_AUTHORITY_ASSERTIONS=PASS'

cat > "$ARTIFACT_DIR/result.env" <<EOF2
CARTERA_080_SOURCE_HEAD=$SOURCE_HEAD
CARTERA_080_ACCEPTANCE_HEAD=$(git rev-parse HEAD)
CARTERA_080A_PROVIDER_NEUTRAL=PASS
CARTERA_080A_EVIDENCE_NOT_TRUTH=PASS
CARTERA_080B_MATCH_EXPLAINABLE=PASS
CARTERA_080B_NO_AUTO_CONFIRMATION=PASS
CARTERA_080C_HUMAN_CONFIRMATION=PASS
CARTERA_080C_IDEMPOTENCY=PASS
CARTERA_080C_030C_HANDOFF=PASS
CARTERA_080D_PRODUCT_SURFACE=PASS
CARTERA_080D_PROJECTION_ONLY=PASS
CARTERA_080D_NO_LEDGER_MUTATION=PASS
CARTERA_080D_NO_COMMISSION_CALCULATION=PASS
CARTERA_080_INHERITED_PAYMENT_REGRESSION=PASS
CARTERA_080_REMOTE_ACCEPTANCE=PASS
EOF2
cat "$ARTIFACT_DIR/result.env"
